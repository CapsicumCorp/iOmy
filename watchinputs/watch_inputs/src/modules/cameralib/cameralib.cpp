/*
Title: Camera Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with cameras
Copyright: Capsicum Corporation 2018

This file is part of Watch Inputs which is part of the iOmy project.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

//NOTE: Parts of GENERIC_COMMAND might not be working properly at the moment as
//  the main focus was initially on FFMPEG_STREAM_TO_STORAGE_COMMAND

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

//Needed for endian.h functions
#define _BSD_SOURCE

//Use Boost Chrono instead of C++11 chrono
#define BOOST_ASIO_DISABLE_STD_CHRONO

//These definitions will be picked up by commonlib.h
#ifdef DEBUG
#define ENABLE_PTHREAD_DEBUG_V2
#endif
#ifdef CAMERALIB_LOCKDEBUG
#define LOCKDEBUG
#endif
#ifdef CAMERALIB_MOREDEBUG
#define MOREDEBUG
#endif

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <signal.h>
#include <pthread.h>
#include <time.h>
#include <unistd.h>
#include <semaphore.h>
#include <endian.h>
#include <arpa/inet.h>
#include <array>
#include <list>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <boost/algorithm/string.hpp>
#include <boost/chrono.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/recursive_mutex.hpp>
#include <boost/atomic/atomic.hpp>
#include <boost/asio.hpp>
#include <boost/asio/steady_timer.hpp>
#include <boost/asio/system_timer.hpp>
#include <boost/bind.hpp>
#include <boost/archive/iterators/base64_from_binary.hpp>
#include <boost/archive/iterators/binary_from_base64.hpp>
#include <boost/archive/iterators/transform_width.hpp>
#include <boost/archive/iterators/remove_whitespace.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/path.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "cameralibpriv.hpp"
#include "main/mainlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/configlib/configlib.hpp"

//From cmdserverlib.h
//These lines will be needed at the top of your C or C++ file below the includes
//  if using interface version >= 2 until interface 1 is removed from this file
#undef CMDLISTENER_NOERROR
#undef CMDLISTENER_NOTHANDLED
#undef CMDLISTENER_CMDINVALID

//Quick hack to work around problem where Android implements le16toh as letoh16
//NOTE: Newer versions of Android correctly define le16toh
#ifdef __ANDROID__
#ifndef le16toh
#define le16toh(x) letoh16(x)
#endif
#endif

namespace cameralib {

static const int WEBAPI_ACCESS_INTERVAL=5; //Number of seconds between web api accesses

using boost::asio::ip::tcp;

class CameraStream {
public:
  int32_t streamId=0; //A unique id to identify this stream
  enum CAMERA_STREAM_MODE streamMode=CAMERA_STREAM_MODE::FFMPEG_STREAM_TO_STORAGE_COMMAND;
  pid_t pid=0; //Pid of the camera capture process for this stream; 0=Don't need to wait for child process
  enum CAMERA_PROCESS_EXIT_REASON exitReason=CAMERA_PROCESS_EXIT_REASON::NEVER_STARTED;
  int exitStatus=0; //See waitpid man page for macros that can be used with this
  std::string cmd=""; //Command of the camera capture process
  std::vector<std::string> args={}; //Arguments of the camera capture process
  std::string streamURL="";
  bool needStreamURL=true;
  bool hasRun=false; //True=This process has run at least once
  bool restartOnExit=true; //True=Auto restart the stream when it exits
  bool deleteOnExit=false; //True=Auto delete the stream object when it exits
  bool needToRemove=false;
  bool enabled=true; //True=Capturing is enabled, False=Capturing is disabled
  int64_t cntSuccessfulStarts=0;
  int64_t cntUnsuccessfulStarts=0;
public:
  CameraStream();
  CameraStream(int32_t streamId, std::string cmd, std::vector<std::string> args);
  CameraStream(int32_t streamId, enum CAMERA_STREAM_MODE, std::string cmd, std::vector<std::string> args);
  ~CameraStream();
  boost::property_tree::ptree toProperty(); //Return the object as a Boost Property object
  int waitStreamCapture(int timeOutSeconds); //Wait for the csmera capturing process to finish
  bool isStreamCapturing(); //Check if the stream is currently capturing
  void incSuccessfulStartsCnt();
  void incUnsuccessfulStartsCnt();
};

class Camera {
public:
  int32_t camid=0; //Database ID of the Camera
  std::map<int32_t, CameraStream> cameraStreams;
  bool needToRemove=false;
public:
  Camera();
  Camera(int32_t camid);
  ~Camera();

  int32_t getCamId();

  int waitAllCapture(int timeOutSeconds); //Wait for all camera capturing processes to finish
  int stopAllCapture(); //Stop all camera capturing processes immediately

  int addStream(int32_t streamId, std::string cmd, std::vector<std::string> args);
  int removeStream(int32_t streamId);
  std::vector<int32_t> getStreamIds();
  int setStreamMode(int32_t streamId, enum CAMERA_STREAM_MODE);
  int setStreamCommand(int32_t streamId, std::string cmd, std::vector<std::string> args);
  std::string getStreamCommand(int32_t streamId);
  std::vector<std::string> getStreamArgs(int32_t streamId);
  void setNeedStreamURL(int32_t streamId, bool needStreamURL);
  bool getNeedStreamURL(int32_t streamId);
  void setStreamRestartOnExit(int32_t streamId, bool restartOnExit);
  void setStreamDeleteOnExit(int32_t streamId, bool deleteOnExit);
  void setStreamEnabled(int32_t streamId, bool enabled);
  int getStreamExitStatus(int32_t streamId);
  int startStreamCapture(int32_t streamId); //Start a camera capturing process
  int waitStreamCapture(int32_t streamId, int timeOutSeconds); //Wait for a camera capturing process to finish
  int stopStreamCapture(int32_t streamId, bool force=false, bool wait=false); //Stop a camera capturing process immediately
  bool isStreamCapturing(int32_t streamId); //Check if a stream is currently capturing
  boost::property_tree::ptree toProperty(); //Return the object as a Boost Property object
};

class WebAPIStreamURL {
  int64_t thinkPK;
  std::string streamURL;
};

static boost::recursive_mutex thislibmutex;

//camid, Camera class
static std::map<int32_t, Camera> gcameras;
static int camerasInUse=0; //Mainly used so long running iterators don't get invalidated when a camera is removed

static std::list<WebAPIStreamURL> gWebAPIStreamURLQueue;

static int ginuse=0; //Only shutdown when inuse = 0
static int gshuttingdown=0;

static bool gAllStop=false; //If True, all camera streams should be stopped for this running instance of watch_inputs

static char gneedtoquit=0; //Set to 1 when this library should exit

static pthread_t gmainthread=0;

static bool gneedmoreinfo=false; //Set to false when a device needs more info to indicate that we shouldn't sleep for very long

std::int64_t ghubpk;

//global iface pointers set once for improved performance compared to for every function that uses it,
//  as the pointer value shouldn't change apart from during init/shutdown stage
static const cmdserverlib_ifaceptrs_ver_2_t *cmdserverlibifaceptr;
static const dblib_ifaceptrs_ver_1_t *dblibifaceptr;
static const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr;
static const configlib_ifaceptrs_ver_2_cpp_t *configlibifaceptr;
static const mainlib_ifaceptrs_ver_2_t *mainlibifaceptr;

//Static Function Declarations

//Function Declarations
static void setneedtoquit(bool val);
static bool getneedtoquit(void);
static int start(void);
static void stop(void);
static int init(void);
static void shutdown(void);
static void register_listeners(void);
static void unregister_listeners(void);

//Module Interface Definitions
static moduledep_ver_1_t gdeps[]={
  {
    "debuglib",
    nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "dblib",
    nullptr,
    DBLIBINTERFACE_VER_1,
    1
  },
  {
    "cmdserverlib",
    nullptr,
    CMDSERVERLIBINTERFACE_VER_2,
    0
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_1,
    1
  },
  {
    "configlib",
    nullptr,
    CONFIGLIBINTERFACECPP_VER_2,
    1
  },
  {
    "mainlib",
    nullptr,
    MAINLIBINTERFACE_VER_2,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t gmoduleinfo_ver_1={
  MODULEINFO_VER_1,
  "cameralib",
  init,
  shutdown,
  start,
  stop,
  register_listeners,
  unregister_listeners,
  nullptr,
  (moduledep_ver_1_t (*)[]) &gdeps
};

//Find a pointer to module interface pointer
//Returns the pointer to the interface or NULL if not found
//NOTE: A little slower than referencing the array element directly, but less likely to cause a programming fault
//  due to rearranging depencencies
static const void *getmoduledepifaceptr(const char *modulename, unsigned ifacever) {
  int i=0;

  while (gdeps[i].modulename) {
    if (strcmp(gdeps[i].modulename, modulename)==0) {
      if (gdeps[i].ifacever==ifacever) {
        return gdeps[i].ifaceptr;
      }
    }
    ++i;
  }
  return NULL;
}

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void thislib_backtrace(void) {
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __PRETTY_FUNCTION__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __PRETTY_FUNCTION__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __PRETTY_FUNCTION__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
static void thislib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

/*
  Thread unsafe get need more info value
*/
static bool _getneedmoreinfo(void) {
  return gneedmoreinfo;
}

/*
  Thread safe get need more info value
*/
static bool getneedmoreinfo() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  return _getneedmoreinfo();
}

/*
  Thread unsafe set need more info value
*/
static void _setneedmoreinfo(bool needmoreinfo) {
  gneedmoreinfo=needmoreinfo;
}

/*
  Thread safe set need more info value
*/
static void setneedmoreinfo(bool needmoreinfo) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  _setneedmoreinfo(needmoreinfo);
}

static void markCamerasInUse() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  ++camerasInUse;
}

static void markCamerasNotInUse() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  if (camerasInUse==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: BUG: Tried to mark cameras not in use when it is already 0\n", __PRETTY_FUNCTION__);
    return;
  }
  --camerasInUse;
}

static bool getCamerasInUse() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  return (camerasInUse > 0) ? true : false;
}

static std::string streamModeToString(enum CAMERA_STREAM_MODE streamMode) {
  switch (streamMode) {
    case CAMERA_STREAM_MODE::GENERIC_COMMAND:
      return "GENERIC_COMMAND";
    case CAMERA_STREAM_MODE::FFMPEG_STREAM_TO_STORAGE_COMMAND:
      return "FFMPEG_STREAM_TO_STORAGE_COMMAND";
  }
  return "Unknown";
}

static std::string exitReasonToString(enum CAMERA_PROCESS_EXIT_REASON exitReason) {
  switch (exitReason) {
    case CAMERA_PROCESS_EXIT_REASON::NEVER_STARTED:
      return "NEVER_STARTED";
    case CAMERA_PROCESS_EXIT_REASON::NORMAL_EXIT:
      return "NORMAL_EXIT";
    case CAMERA_PROCESS_EXIT_REASON::TERMINATED_BY_SIGNAL:
      return "TERMINATED_BY_SIGNAL";
    case CAMERA_PROCESS_EXIT_REASON::CRASHED:
      return "CRASHED";
    case CAMERA_PROCESS_EXIT_REASON::FAILED_TO_CREATE_STREAM_DIRECTORY:
      return "FAILED_TO_CREATE_STREAM_DIRECTORY";
    case CAMERA_PROCESS_EXIT_REASON::FAILED_FORK:
      return "FAILED_FORK";
    case CAMERA_PROCESS_EXIT_REASON::FAILED_EXEC:
      return "FAILED_EXEC";
    case CAMERA_PROCESS_EXIT_REASON::NO_COMMAND_SET:
      return "NO_COMMAND_SET";
    case CAMERA_PROCESS_EXIT_REASON::FAILED_PIPE:
      return "FAILED_PIPE";
    case CAMERA_PROCESS_EXIT_REASON::STREAM_NOT_FOUND:
      return "STREAM_NOT_FOUND";
  }
  return "Unknown";
}

//----------------------
//Class/Struct functions
//----------------------

CameraStream::CameraStream() {
  //Do nothing
}

CameraStream::CameraStream(int32_t streamId, std::string cmd, std::vector<std::string> args) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  this->streamId=streamId;
  this->cmd=cmd;
  this->args=args;
}

CameraStream::CameraStream(int32_t streamId, enum CAMERA_STREAM_MODE streamMode, std::string cmd, std::vector<std::string> args) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  this->streamId=streamId;
  this->streamMode=streamMode;
  this->cmd=cmd;
  this->args=args;
}

CameraStream::~CameraStream() {
  //Do nothing
}

Camera::Camera() {
  //Do nothing
}

Camera::Camera(int32_t camid) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  this->camid=camid;
}

Camera::~Camera() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  stopAllCapture();

  cameraStreams.clear();
}

//Return the object as a Boost Property object
boost::property_tree::ptree CameraStream::toProperty() {
  boost::property_tree::ptree ptree;

  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  ptree.put("CameraStreamID", this->streamId);
  ptree.put("StreamMode", streamModeToString(this->streamMode));
  ptree.put("Pid", this->pid);
  ptree.put("exitReason", exitReasonToString(this->exitReason));
  ptree.put("ExitCode", this->exitStatus);
  ptree.put("StreamURL", this->streamURL);
  ptree.put("hasRun", this->hasRun);
  ptree.put("restartOnExit", this->restartOnExit);
  ptree.put("deleteOnExit", this->deleteOnExit);
  ptree.put("needToRemove", this->needToRemove);
  ptree.put("isStreamCapturing", isStreamCapturing());
  ptree.put("enabled", this->enabled);
  ptree.put("cntSuccessfulStarts", this->cntSuccessfulStarts);
  ptree.put("cntUnsuccessfulStarts", this->cntUnsuccessfulStarts);
  ptree.put("Command", this->cmd);
  ptree.put("CommandArgumentsCount", this->args.size());
  boost::property_tree::ptree argsPt;
  for (auto &arg : this->args) {
    boost::property_tree::ptree argPt;

    argPt.put("", arg);
    argsPt.push_back(std::make_pair("", argPt));
  }
  ptree.put_child("CommandArguments", argsPt);

  return ptree;
}

//Wait for camera capturing process to finish
//If timeOutSeconds is 0 then don't wait if the process is currently running
//Returns 1 if timeout expired, 0 if process has finished, or negative value on error
int CameraStream::waitStreamCapture(int timeOutSeconds) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    if (this->pid==0) {
      return 0;
    }
    bool isRunning=true;
    int exitStatus=0;
    int timeOut=0;
    while (timeOut<=timeOutSeconds) {
      //NOTE: Call waitpid at least once even if timeOutSeconds=0
      pid_t result=waitpid(this->pid, &exitStatus, WNOHANG);
      if (result==-1) {
        //Error occurred so just return finished without setting exit status
        this->pid=0;
        return 0;
      }
      if (result>0) {
        //Positive value means the process has exited
        isRunning=false;
        break;
      }
      if (getneedtoquit()) {
        timeOut=timeOutSeconds;
        break;
      }
      if (timeOutSeconds==0) {
        break;
      }
      //Sleep for 1 second
      sleep(1);
      ++timeOut;
    }
    if (!isRunning) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Setting exit status of pid: %d to %d\n", __PRETTY_FUNCTION__, this->pid, exitStatus);
      this->pid=0;
      this->hasRun=true;
      if (WIFEXITED(exitStatus)) {
        this->exitReason=CAMERA_PROCESS_EXIT_REASON::NORMAL_EXIT;
        this->exitStatus=WEXITSTATUS(exitStatus);
      } else if (WIFSIGNALED(exitStatus)) {
#ifdef WCOREDUMP
        //NOTE: WCOREDUMP isn't defined on all systems
        if (WCOREDUMP(exitStatus)) {
          this->exitReason=CAMERA_PROCESS_EXIT_REASON::CRASHED;
          this->exitStatus=WTERMSIG(exitStatus); //The  number  of  the  signal that caused the child process to terminate
        } else {
#endif
          this->exitReason=CAMERA_PROCESS_EXIT_REASON::TERMINATED_BY_SIGNAL;
          this->exitStatus=WTERMSIG(exitStatus); //The  number  of  the  signal that caused the child process to terminate
#ifdef WCOREDUMP
        }
#endif
      } else {
        //Just assume a normal exit by default
        this->exitReason=CAMERA_PROCESS_EXIT_REASON::NORMAL_EXIT;
        this->exitStatus=exitStatus;
      }
      return 0;
    }
    else if (timeOut>=timeOutSeconds) {
      return 1;
    }
  } catch (std::out_of_range& e) {
    return -1;
  }
  return -2;
}

//Check if the stream is currently capturing
bool CameraStream::isStreamCapturing() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  try {
    if (this->pid) {
      int result=waitStreamCapture(0);
      if (result==1) {
        return true;
      }
    }
  } catch (std::out_of_range& e) {
  }
  return false;
}

void CameraStream::incSuccessfulStartsCnt() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  ++this->cntSuccessfulStarts;
}

void CameraStream::incUnsuccessfulStartsCnt() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  ++this->cntUnsuccessfulStarts;
}

int32_t Camera::getCamId() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  return this->camid;
}

//Wait for all camera capturing processes to finish
//Returns 0 for success, 1 if timeOut exceeded for at least one process, or negative value for other error
int Camera::waitAllCapture(int timeOutSeconds) {
  bool timeOutExceeded=false;
  bool error=false;
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  for (auto &cameraStreamIt : this->cameraStreams) {
    int result;

    result=waitStreamCapture(cameraStreamIt.first, timeOutSeconds);
    if (result==1) {
      timeOutExceeded=true;
    }
    else if (result<0) {
      error=true;
    }
  }
  if (timeOutExceeded==true) {
    return 1;
  } else if (error) {
    return -1;
  }
  return 0;
}

//Stop all camera capturing processes immediately
//Returns 0 for success or negative value on error
int Camera::stopAllCapture() {
  bool error=false;
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  for (auto &cameraStreamIt : this->cameraStreams) {
    int result;

    //First attempt to terminate the process
    if (isStreamCapturing(cameraStreamIt.first)) {
      result=stopStreamCapture(cameraStreamIt.first, false);
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Terminate result: %d\n", __PRETTY_FUNCTION__, result);
      if (result!=0) {
        error=true;
      }
    }
  }
  if (!error) {
    return 0;
  }
  //Sleep for .1 seconds before checking if terminate worked
  usleep(100000);

  //Force kill if any processes are still running
  for (auto &cameraStreamIt : this->cameraStreams) {
    if (isStreamCapturing(cameraStreamIt.first)) {
      int result;

      result=stopStreamCapture(cameraStreamIt.first, true);
      if (isStreamCapturing(cameraStreamIt.first)) {
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Failed to terminate capture process for Camera: %d, Camera Stream: %d\n", __PRETTY_FUNCTION__, this->camid, cameraStreamIt.first);
      }
    }
  }
  return 0;
}

int Camera::addStream(int32_t streamId, std::string cmd="", std::vector<std::string> args={}) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  try {
    if (cameraStreams.at(streamId).streamId==streamId) {
      //Camera Stream already added
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Camera: %d, Camera Stream: %d already added\n", __PRETTY_FUNCTION__, this->camid, streamId);
      return -1;
    }
  } catch (std::out_of_range& e) {
    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Adding Camera: %d, Camera Stream: %d\n", __PRETTY_FUNCTION__, this->camid, streamId);
    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   command=\"%s\"\n", __PRETTY_FUNCTION__, cmd.c_str());
    if (!args.empty()) {
      for (auto argIt : args) {
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   command argument=\"%s\"\n", __PRETTY_FUNCTION__, argIt.c_str());
      }
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   No command arguments\n", __PRETTY_FUNCTION__);
    }
    cameraStreams[streamId]=CameraStream(streamId, cmd, args);
  }
  return 0;
}

std::vector<int32_t> Camera::getStreamIds() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  std::vector<int32_t> streamIds;
  for (auto cameraStreamIt : cameraStreams) {
    streamIds.push_back(cameraStreamIt.first);
  }
  return streamIds;
}

int Camera::removeStream(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  try {
    this->cameraStreams.at(streamId).needToRemove=true;
    this->stopStreamCapture(streamId, true, true);
    if (!getCamerasInUse()) {
        this->cameraStreams.erase(streamId);
    } else {
      return ERRORS::CAMERA_STREAM_SCHEDULED_FOR_REMOVAL;
    }
  } catch (std::out_of_range& e) {
    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Camera Stream: %d for Camera: %d not found\n", __PRETTY_FUNCTION__, streamId, this->camid);
    return ERRORS::STREAM_NOT_FOUND;
  }
  return 0;
}

int Camera::setStreamCommand(int32_t streamId, std::string cmd="", std::vector<std::string> args={}) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    cameraStreams.at(streamId).cmd=cmd;
    cameraStreams.at(streamId).args=args;
    return 0;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
    return -1;
  }
  return -2;
}

std::string Camera::getStreamCommand(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    return cameraStreams.at(streamId).cmd;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
    return "";
  }
}

std::vector<std::string> Camera::getStreamArgs(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    return cameraStreams.at(streamId).args;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
    return {};
  }
}

void Camera::setNeedStreamURL(int32_t streamId, bool needStreamURL) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    cameraStreams.at(streamId).needStreamURL=needStreamURL;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
  }
}

bool Camera::getNeedStreamURL(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    return cameraStreams.at(streamId).needStreamURL;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
  }
  return false;
}

void Camera::setStreamRestartOnExit(int32_t streamId, bool restartOnExit) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    cameraStreams.at(streamId).restartOnExit=restartOnExit;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
  }
}

void Camera::setStreamDeleteOnExit(int32_t streamId, bool deleteOnExit) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    cameraStreams.at(streamId).deleteOnExit=deleteOnExit;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
  }
}

void Camera::setStreamEnabled(int32_t streamId, bool enabled) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    cameraStreams.at(streamId).enabled=enabled;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
  }
}

int Camera::getStreamExitStatus(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    return cameraStreams.at(streamId).exitStatus;
  } catch (std::out_of_range& e) {
    //Camera Stream doesn't exist
    return 0;
  }
}

//Start a camera capturing process
//Returns 0 for success or negative value on error
int Camera::startStreamCapture(int32_t streamId) {

  try {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

    CameraStream &cameraStream=cameraStreams.at(streamId);
    if (cameraStream.streamMode==CAMERA_STREAM_MODE::GENERIC_COMMAND) {
      if (cameraStream.cmd=="") {
        debuglibifaceptr->debuglib_printf(1, "%s: Error: No command has been specified for Camera: %d, Stream: %d\n", __PRETTY_FUNCTION__, camid, streamId);
        cameraStream.incUnsuccessfulStartsCnt();
        cameraStream.exitReason=CAMERA_PROCESS_EXIT_REASON::NO_COMMAND_SET;
        cameraStream.exitStatus=0;
        return -1;
      }
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Start camera capture: for Camera: %d, stream: %d\n", __PRETTY_FUNCTION__, camid, streamId);
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   command=\"%s\"\n", __PRETTY_FUNCTION__, cameraStream.cmd.c_str());
      if (!cameraStream.args.empty()) {
        for (auto argIt : cameraStream.args) {
          debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   command argument=\"%s\"\n", __PRETTY_FUNCTION__, argIt.c_str());
        }
      } else {
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   No command arguments\n", __PRETTY_FUNCTION__);
      }
    } else if (cameraStream.streamMode==CAMERA_STREAM_MODE::FFMPEG_STREAM_TO_STORAGE_COMMAND) {
      if (cameraStream.needStreamURL) {
        //We don't have a stream URL yet
        //Don't treat it as a normal failure as this comes from the webapi
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: No stream url yet for camera capture: for Camera: %d, stream: %d\n", __PRETTY_FUNCTION__, camid, streamId);
        return -1;
      }
      std::string ffmpegpath="ffmpeg", streampath="";
      bool haveffmpegpath, havestreampath;

      if (!configlibifaceptr->isloaded()) {
        //Wait until the configuration is loaded before starting capture
        return -1;
      }
#ifdef __ANDROID__
      bool missingval=false;
      std::string apppathstr;
      missingval|=!(configlibifaceptr->getnamevalue_cpp("general", "apppath", apppathstr));
      if (missingval) {
        //We don't have the Android app path or abi yet
        //Don't treat it as a normal failure as this comes from the config library
        return -1;
      }
#endif
      haveffmpegpath=configlibifaceptr->getnamevalue_cpp("cameraconfig", "ffmpegpath", ffmpegpath);
      havestreampath=configlibifaceptr->getnamevalue_cpp("cameraconfig", "streampath", streampath);

      //Prepare ffmpeg arguments with the stream url
      //TODO: Check if ini file has a path for ffmpeg first
      //TODO: Get streams storage folder from ini file
      //TODO: Add code for Android as it will need a library path override in the environment
      if (haveffmpegpath) {
#ifndef __ANDROID__
        cameraStream.cmd=ffmpegpath;
#else
        //On Android, build the ffmpeg path using apppath and abi as additional components to the full path
        std::ostringstream buildffmpegpath;

        buildffmpegpath << apppathstr << "/components/bin/" << ABI << "/pie/" << ffmpegpath;
        cameraStream.cmd=buildffmpegpath.str();
#endif
      } else {
        cameraStream.cmd="ffmpeg";
      }
      cameraStream.args={"-v", "info", "-i", cameraStream.streamURL,
        "-c:v", "copy", "-c:a", "copy", "-bufsize", "1835k", "-pix_fmt", "yuv420p", "-flags", "-global_header",
        "-hls_time", "10", "-hls_list_size", "6", "-hls_wrap", "10", "-start_number", "1"};

      std::string storagepath;
      if (havestreampath) {
#ifndef __ANDROID__
        storagepath=streampath;
        storagepath+="/";
#else
        //On Android, build the stream path using apppath as additional component to the full path
        std::ostringstream buildstreampath;

        buildstreampath << apppathstr << "/" << streampath << "/";
        storagepath=buildstreampath.str();
#endif
      } else {
        //Use current directory
        storagepath="";
      }
      std::ostringstream camidtostr;
      camidtostr << this->camid;
      storagepath+=camidtostr.str();

      //Check if directory exists
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Creating directory: %s for Camera: %d, Stream: %d\n", __PRETTY_FUNCTION__, storagepath.c_str(), camid, streamId);
      boost::filesystem::path booststoragepath=storagepath;
      if (!boost::filesystem::exists(booststoragepath)) {
        bool result=boost::filesystem::create_directories(booststoragepath);
        if (!result) {
          debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to create directory: %s for Camera: %d, Stream: %d\n", __PRETTY_FUNCTION__, storagepath.c_str(), camid, streamId);
          cameraStream.incUnsuccessfulStartsCnt();
          cameraStream.exitReason=CAMERA_PROCESS_EXIT_REASON::FAILED_TO_CREATE_STREAM_DIRECTORY;
          cameraStream.exitStatus=0;
          return -1;
        }
      }
      storagepath+="/stream.m3u8";
      cameraStream.args.push_back(storagepath);

#ifdef __ANDROID__
      //On Android, we need to set the library path for ffmpeg so build the path using apppath and abi as additional component to the full path
      std::ostringstream buildlibrarypath;

      buildlibrarypath << apppathstr << "/components/lib/" << ABI;
      std::string librarypath=buildlibrarypath.str();
      setenv("LD_LIBRARY_PATH", librarypath.c_str(), 1);
#endif
    }
    //Prepare pointers for exec
    //NOTE: We make a copy of the argument strings and then get c pointers to those string copies
    //  So the references to the strings will stay in tact by the time exec is called
    //We auto add the first argument as the name of the command minus the path
    std::string cmd=cameraStream.cmd;
    std::vector<std::string> cargs;
    std::vector<char *> cargptrs;

    boost::filesystem::path splitcmd(cameraStream.cmd);
    try {
      cargs.push_back(splitcmd.filename().string());
      if (cameraStream.args.size()>0) {
        for (auto argIt : cameraStream.args) {
          cargs.push_back(argIt);
        }
      }
      for (size_t i=0; i<cargs.size(); i++) {
        cargptrs.push_back(const_cast<char *>( cargs[i].c_str() ));
      }
      //execv needs the last argument to be NULL
      cargptrs.push_back(nullptr);

      for (auto argptrIt : cargptrs) {
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: argIt=%s\n", __PRETTY_FUNCTION__, argptrIt);
      }
    } catch (std::bad_alloc& e) {
      //Failed to allocate
      debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to allocate ram for child processes arguments for Camera: %d, Stream: %d: %s\n", __PRETTY_FUNCTION__, camid, streamId, e.what());
    } catch (std::logic_error& e) {
      //Failed to allocate
      debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to allocate ram for child processes arguments for Camera: %d, Stream: %d: %s\n", __PRETTY_FUNCTION__, camid, streamId, e.what());
    }
    //Create a pipe so can determine if exec succeeds
    //https://stackoverflow.com/questions/13710003/execvp-fork-how-to-catch-unsuccessful-executions
    //https://stackoverflow.com/a/13710144
    int pipefd[2];
    if (pipe(pipefd) == -1) {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to create pipe for communication with forked process\n", __PRETTY_FUNCTION__);
      cameraStream.exitReason=CAMERA_PROCESS_EXIT_REASON::FAILED_PIPE;
      cameraStream.exitStatus=0;
      cameraStream.incUnsuccessfulStartsCnt();
      return -1;
    }
    //Spawn a new process to run the command
    //First wait for new descriptor lock
    mainlibifaceptr->newdescriptorlock();
    pid_t pid=fork();
    int lerrno=errno;
    if (pid==-1) {
      mainlibifaceptr->newdescriptorunlock();

      debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to spawn child process to run command for Camera: %d, Stream: %d, errno=%d\n", __PRETTY_FUNCTION__, camid, streamId, lerrno);
      cameraStream.exitReason=CAMERA_PROCESS_EXIT_REASON::FAILED_FORK;
      cameraStream.exitStatus=0;
      cameraStream.incUnsuccessfulStartsCnt();
      return -2;
    }
    if (pid==0) {
      //This is the child

      //We don't unlock descriptor lock as some systems may corrupt pthread structures
      //This should only be a problem though if exec fails
      //http://www.linuxprogrammingblog.com/threads-and-fork-think-twice-before-using-them

      //disable blocking of signals for the child process
      sigset_t set;
      sigfillset(&set);
      sigprocmask(SIG_UNBLOCK, &set, NULL);

      //Redirect stdin, stdout, and stderr to /dev/null
      int devNullStdIn, devNullStdOut, devNullStdErr;

      devNullStdIn=open("/dev/null", O_RDONLY);
      devNullStdOut=open("/dev/null", O_WRONLY);
      devNullStdErr=open("/dev/null", O_WRONLY);

      dup2(devNullStdIn, STDIN_FILENO);
      dup2(devNullStdOut, STDOUT_FILENO);
      dup2(devNullStdErr, STDERR_FILENO);

      //Close the reading end of the pipe
      close(pipefd[0]);

      //Set close on exec flag for the writing end of the pipe
      fcntl(pipefd[1], F_SETFD, FD_CLOEXEC);

      execvp(cmd.c_str(), static_cast<char *const *>(cargptrs.data()));

      int execerrno=errno;

      //If we get here then the program failed to run so cleanup and shutdown the child
      close(devNullStdIn);
      close(devNullStdOut);
      close(devNullStdErr);

      //Write an error code to the pipe
      char buf[2];

      buf[0]=1; //Special Error Type within child
      buf[1]=execerrno;

      write(pipefd[1], buf, 2);

      //Close the writing end of the pipe
      close(pipefd[1]);

      //Since exec failed there may still be locks in place left by other threads which are no longer running
      //We should just force kill as exit might not work
      pid_t pid=getpid();
      kill(pid, SIGKILL);
    } else {
      //This is the parent

      //Unlock new descriptor lock
      mainlibifaceptr->newdescriptorunlock();

      //Store the value of the child pid so we can wait for it
      cameraStream.pid=pid;

      if (cameraStream.streamMode==CAMERA_STREAM_MODE::FFMPEG_STREAM_TO_STORAGE_COMMAND) {
        //Set to get an updated streamURL on the next run
        cameraStream.needStreamURL=true;
      }
      //Close the writing end of the pipe
      close(pipefd[1]);

      //Check for error code from the pipe
      char buf[2];

      ssize_t pipereadcnt=read(pipefd[0], buf, 2);
      if (pipereadcnt<1) {
        //Successful run

        //Close the reading end of the pipe
        close(pipefd[0]);

        cameraStream.incSuccessfulStartsCnt();

        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Camera: %d, Stream: %d now has running child: %ld\n", __PRETTY_FUNCTION__, camid, streamId, pid);
      } else {
        //A failure occurred within the child

        //Force kill the child process as it can get stuck with cloned versions of the parent's descriptors if exec failed
        stopStreamCapture(streamId, true, true);
        if (buf[0]==1) {
          //Exec failed so set the exit status to errno result of exec
          cameraStream.exitReason=CAMERA_PROCESS_EXIT_REASON::FAILED_EXEC;
          cameraStream.exitStatus=buf[1];
          cameraStream.incUnsuccessfulStartsCnt();
          debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Exec failed with exit status: %d\n", __PRETTY_FUNCTION__, (int) buf[1]);
        }
        return -1;
      }
    }
    return 0;

  } catch (std::out_of_range& e) {
    return -1;
  }
  return -2;
}

//Wait for a camera capturing process to finish
//If timeOutSeconds is 0 then don't wait if the process is currently running
//Returns 1 if timeout expired, 0 if process has finished, or negative value on error
int Camera::waitStreamCapture(int32_t streamId, int timeOutSeconds) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    return cameraStreams.at(streamId).waitStreamCapture(timeOutSeconds);
  } catch (std::out_of_range& e) {
  }
  return -1;
}

//Stop a camera capturing process immediately
//Returns 0 if process has finished, or negative value on error
//wait=true; Wait a few seconds for the process to exit before returning
int Camera::stopStreamCapture(int32_t streamId, bool force, bool wait) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    if (!isStreamCapturing(streamId)) {
      return 0;
    }
    if (!force) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Terminating process: %ld\n", __PRETTY_FUNCTION__, cameraStreams.at(streamId).pid);
      int result=kill(cameraStreams.at(streamId).pid, SIGTERM);
      if (result==0) {
        if (wait) {
          //Call waitPid to get the exit status and finish the cleaning up child process
          waitStreamCapture(streamId, 2);
        }
        return 0;
      } else {
        return -1;
      }
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Killing process: %ld\n", __PRETTY_FUNCTION__, cameraStreams.at(streamId).pid);
      int result=kill(cameraStreams.at(streamId).pid, SIGKILL);
      if (result==0) {
        if (wait) {
          //Call waitPid to get the exit status and finish the cleaning up child process
          waitStreamCapture(streamId, 2);
        }
        return 0;
      } else {
        return -1;
      }
    }
  } catch (std::out_of_range& e) {
    return -2;
  }
  return -3;
}

//Check if a stream is currently capturing
bool Camera::isStreamCapturing(int32_t streamId) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  try {
    return cameraStreams.at(streamId).isStreamCapturing();
  } catch (std::out_of_range& e) {
  }
  return false;
}

//Return the Camera object as a Boost Property object
boost::property_tree::ptree Camera::toProperty() {
  boost::property_tree::ptree ptree;

  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  ptree.put("CameraID", this->camid);
  ptree.put("needToRemove", this->needToRemove);
  ptree.put("CameraStreamCount", cameraStreams.size());
  boost::property_tree::ptree cameraStreamsPt;
  for (auto &cameraStream : cameraStreams) {
    cameraStreamsPt.push_back(std::make_pair("", cameraStream.second.toProperty()));
  }
  ptree.put_child("CameraStreams", cameraStreamsPt);

  return ptree;
}

//----------------------

//Return the camera objects as a Boost Property object
boost::property_tree::ptree CamerasToProperty() {
  boost::property_tree::ptree ptree, cameraspt;

  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  ptree.put("AllStop", gAllStop);
  ptree.put("CameraCount", gcameras.size());
  for (auto &camera : gcameras) {
    cameraspt.push_back(std::make_pair("", camera.second.toProperty()));
  }
  ptree.put_child("Cameras", cameraspt);

  return ptree;
}

static int removeCamera(int32_t camid) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  try {
    if (gcameras.at(camid).cameraStreams.size()>0) {
      return ERRORS::CAMERA_HAS_STREAM;
    }
    gcameras.at(camid).needToRemove=true;
    if (!getCamerasInUse()) {
      gcameras.erase(camid);
    } else {
      return ERRORS::CAMERA_SCHEDULED_FOR_REMOVAL;
    }
  } catch (std::out_of_range& e) {
    return ERRORS::CAMERA_NOT_FOUND;
  }
  return 0;
}

static void removeCamerasScheduledForRemoval() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  if (getCamerasInUse()) {
    //Cameras are currently in use so we can't remove any of them
    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Cameras are currently in use\n", __PRETTY_FUNCTION__);
    return;
  }
  //Loop through all the cameras and camera streams and remove any that are scheduled for removal
  std::map<int32_t, Camera>::iterator cameraIt;
  for (cameraIt=gcameras.begin(); cameraIt!=gcameras.end(); ++cameraIt) {
    std::map<int32_t, CameraStream>::iterator cameraStreamIt;
    for (cameraStreamIt=cameraIt->second.cameraStreams.begin(); cameraStreamIt!=cameraIt->second.cameraStreams.end(); ++cameraStreamIt) {
      if (cameraStreamIt->second.needToRemove) {
        std::map<int32_t, CameraStream>::iterator prevCameraStreamIt=cameraStreamIt;

        ++cameraStreamIt;

        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Removing Camera Stream: %d for Camera: %d\n", __PRETTY_FUNCTION__, prevCameraStreamIt->first, cameraIt->first);

        cameraIt->second.removeStream(prevCameraStreamIt->first);

        if (cameraStreamIt==cameraIt->second.cameraStreams.end()) {
          break;
        }
        continue;
      }
    }
    if (cameraIt->second.needToRemove) {
      std::map<int32_t, Camera>::iterator prevCameraIt=cameraIt;

      ++cameraIt;

      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Removing Camera: %d\n", __PRETTY_FUNCTION__, prevCameraIt->first);

      gcameras.erase(prevCameraIt);

      if (cameraIt==gcameras.end()) {
        break;
      }
      continue;
    }
  }
}

static int cmd_test_add_camera(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<2) {
    //Camera ID not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid;
  std::istringstream ( buffertokens[1] ) >> camid;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    try {
      if (gcameras.at(camid).camid==camid) {
        ostream << "Camera object with id: " << camid << " already exists" << std::endl;
      }
    } catch (std::out_of_range& e) {
      gcameras[camid]=Camera(camid);
      ostream << "Added camera object with id: " << camid << std::endl;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_remove_camera(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<2) {
    //Camera ID not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid;
  std::istringstream ( buffertokens[1] ) >> camid;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    int result=removeCamera(camid);
    if (result==0) {
      ostream << "Camera object with id: " << camid << " has been removed" << std::endl;
    } else if (result==ERRORS::CAMERA_HAS_STREAM) {
      ostream << "Camera object with id: " << camid << " cannot be removed as it has streams" << std::endl;
    } else if (result==ERRORS::CAMERA_NOT_FOUND) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
    } else if (result==ERRORS::CAMERA_SCHEDULED_FOR_REMOVAL) {
      ostream << "Camera object with id: " << camid << " has been scheduled for removal" << std::endl;
    }
    cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_add_camera_stream(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<3) {
    //Camera ID and Camera Stream not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid, streamId;
  std::string cmd;
  bool haveCmd=false, haveArgs=false;
  std::istringstream ( buffertokens[1] ) >> camid;
  std::istringstream ( buffertokens[2] ) >> streamId;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    try {
      if (gcameras.at(camid).camid==camid) {
        //Do nothing
      }
    } catch (std::out_of_range& e) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
    try {
      if (gcameras.at(camid).cameraStreams.at(streamId).streamId==streamId) {
        ostream << "Camera stream with id: " << streamId << " for camera object: " << camid << " already exists" << std::endl;
      }
    } catch (std::out_of_range& e) {
      if (buffertokens.size()>3) {
        cmd=buffertokens[3];
        haveCmd=true;
      }
      if (buffertokens.size()>4) {
        //Use the remaining buffer tokens as arguments
        buffertokens.erase(buffertokens.begin(), buffertokens.begin()+4);
        haveArgs=true;
      }
      if (haveArgs) {
        gcameras[camid].addStream(streamId, cmd, buffertokens);
        ostream << "Added camera stream with id: " << streamId << " to camera object: " << camid << std::endl;
        ostream << "  Command: " << cmd << std::endl;
        for (auto &argIt : buffertokens) {
          ostream << "  Arg: " << argIt << std::endl;
        }
      } else if (haveCmd) {
        gcameras[camid].addStream(streamId, cmd);
        ostream << "Added camera stream with id: " << streamId << " to camera object: " << camid << std::endl;
        ostream << "  Command: " << cmd << std::endl;
      } else {
        gcameras[camid].addStream(streamId);
        ostream << "Added camera stream with id: " << streamId << " to camera object: " << camid << std::endl;
      }
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_remove_camera_stream(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<3) {
    //Camera ID and Camera Stream not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid, streamId;
  std::istringstream ( buffertokens[1] ) >> camid;
  std::istringstream ( buffertokens[2] ) >> streamId;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    try {
      int result=gcameras.at(camid).removeStream(streamId);
      if (result==0) {
        ostream << "Camera stream with id: " << streamId << " for camera object: " << camid << " removed" << std::endl;
      } else if (result==ERRORS::STREAM_NOT_FOUND) {
        ostream << "Camera stream: " << streamId << " for camera object: " << camid << " not found" << std::endl;
      } else if (result==ERRORS::CAMERA_STREAM_SCHEDULED_FOR_REMOVAL) {
        ostream << "Camera stream with id: " << streamId << " for camera object: " << camid << " scheduled for removal" << std::endl;
      }
    } catch (std::out_of_range& e) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_set_camera_stream_property(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<4) {
    //Camera ID, Camera Stream, and property type not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid, streamId;
  std::string property;
  std::istringstream ( buffertokens[1] ) >> camid;
  std::istringstream ( buffertokens[2] ) >> streamId;
  std::istringstream ( buffertokens[3] ) >> property;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    if (gcameras.find(camid)==gcameras.end()) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
    if (gcameras.at(camid).cameraStreams.find(streamId)==gcameras.at(camid).cameraStreams.end()) {
      ostream << "Camera stream: " << streamId << " for camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
    if (property=="cmd") {
      std::string cmd;
      bool haveCmd=false, haveArgs=false;
      if (buffertokens.size()>4) {
        cmd=buffertokens[4];
        haveCmd=true;
      }
      if (buffertokens.size()>5) {
        //Use the remaining buffer tokens as arguments
        buffertokens.erase(buffertokens.begin(), buffertokens.begin()+4);
        haveArgs=true;
      }
      if (haveArgs) {
        gcameras[camid].setStreamCommand(streamId, cmd, buffertokens);
        ostream << "Applied cmd property to camera stream: " << streamId << " for camera object: " << camid << std::endl;
        ostream << "  Command: " << cmd << std::endl;
        for (auto &argIt : buffertokens) {
          ostream << "  Arg: " << argIt << std::endl;
        }
      } else if (haveCmd) {
        gcameras[camid].setStreamCommand(streamId, cmd);
        ostream << "Applied cmd property to camera stream: " << streamId << " for camera object: " << camid << std::endl;
        ostream << "  Command: " << cmd << std::endl;
      } else {
        gcameras[camid].setStreamCommand(streamId);
        ostream << "Set empty cmd and arguments for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      }
    } else if (property=="restartOnExit") {
      if (buffertokens.size()<4) {
        cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
        return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
      }
      if (buffertokens[4]=="true") {
        gcameras[camid].setStreamRestartOnExit(streamId, true);
        ostream << "restartOnExit set to true for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else if (buffertokens[4]=="false") {
        gcameras[camid].setStreamRestartOnExit(streamId, false);
        ostream << "restartOnExit set to false for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else {
        ostream << "Invalid parameter: " << buffertokens[4] << std::endl;
      }
    } else if (property=="deleteOnExit") {
      if (buffertokens.size()<4) {
        cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
        return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
      }
      if (buffertokens[4]=="true") {
        gcameras[camid].setStreamDeleteOnExit(streamId, true);
        ostream << "deleteOnExit set to true for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else if (buffertokens[4]=="false") {
        gcameras[camid].setStreamDeleteOnExit(streamId, false);
        ostream << "deleteOnExit set to false for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else {
        ostream << "Invalid parameter: " << buffertokens[4] << std::endl;
      }
    } else if (property=="enabled") {
      if (buffertokens.size()<4) {
        cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
        return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
      }
      if (buffertokens[4]=="true") {
        gcameras[camid].setStreamEnabled(streamId, true);
        ostream << "enabled set to true for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else if (buffertokens[4]=="false") {
        gcameras[camid].setStreamEnabled(streamId, false);
        ostream << "enabled set to false for camera stream with id: " << streamId << " for camera object: " << camid << std::endl;
      } else {
        ostream << "Invalid parameter: " << buffertokens[4] << std::endl;
      }
    } else {
      ostream << "Invalid property: " << buffertokens[3] << std::endl;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_start_stream(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<3) {
    //Camera ID and Camera Stream not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid, streamId;
  std::string cmd;
  std::istringstream ( buffertokens[1] ) >> camid;
  std::istringstream ( buffertokens[2] ) >> streamId;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    try {
      if (gcameras.at(camid).camid==camid) {
        //Do nothing
      }
    } catch (std::out_of_range& e) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
    try {
      if (gcameras.at(camid).cameraStreams.at(streamId).streamId==streamId) {
        int result=gcameras.at(camid).startStreamCapture(streamId);

        if (result!=0) {
          ostream << "startStreamCapture returned an error: " << result << std::endl;
        } else {
          ostream << "Camera Stream: " << streamId << " for camera object: " << camid << " started" << std::endl;
        }
        cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

        return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
      }
    } catch (std::out_of_range& e) {
      ostream << "Stream: " << streamId << "for camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_test_stop_stream(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  if (buffertokens.size()<3) {
    //Camera ID and Camera Stream not specified
    cmdserverlibifaceptr->netputs("MISSING PARAMETERS\n", clientsock, NULL);
    return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
  }
  std::ostringstream ostream;

  int32_t camid, streamId;
  std::string cmd;
  std::istringstream ( buffertokens[1] ) >> camid;
  std::istringstream ( buffertokens[2] ) >> streamId;
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    try {
      if (gcameras.at(camid).camid==camid) {
        //Do nothing
      }
    } catch (std::out_of_range& e) {
      ostream << "Camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
    try {
      if (gcameras.at(camid).cameraStreams.at(streamId).streamId==streamId) {
        int result=gcameras.at(camid).stopStreamCapture(streamId);

        if (result!=0) {
          ostream << "stopStreamCapture returned an error: " << result << std::endl;
        } else {
          ostream << "Camera Stream: " << streamId << " for camera object: " << camid << " stopped" << std::endl;
        }
        cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

        return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
      }
    } catch (std::out_of_range& e) {
      ostream << "Stream: " << streamId << "for camera object: " << camid << " not found" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_all_stop(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);

  std::ostringstream ostream;
  std::string property;
  if (buffertokens.size()>1) {
    std::istringstream ( buffertokens[1] ) >> property;
  } else {
    property="true";
  }
  {
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
    if (property=="true") {
      gAllStop=true;
      ostream << "All camera capturing will be stopped" << std::endl;
    } else if (property=="false") {
      gAllStop=false;
      ostream << "Camera capturing will be restarted" << std::endl;
    }
  }
  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_get_camera_info(const char *buffer, int clientsock) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  if (gcameras.size()==0) {
    cmdserverlibifaceptr->netputs("NO CAMERAS\n", clientsock, NULL);
  }
  for (auto &cameraIt : gcameras) {
    std::ostringstream ostream;

    ostream << "Camera ID: " << cameraIt.first << std::endl;
    for (auto &streamIt : cameraIt.second.cameraStreams) {
      ostream << "  Camera Stream ID: " << streamIt.first << std::endl;
      ostream << "    Command: " << streamIt.second.cmd << std::endl;
      ostream << "    Number of Arguments: " << streamIt.second.args.size() << std::endl;
      for (auto &argIt : streamIt.second.args) {
        ostream << "      Arg: " << argIt << std::endl;
      }
      ostream << "    HasRun: " << ((streamIt.second.hasRun==true) ? "true" : "false") << std::endl;
      ostream << "    RestartOnExit: " << ((streamIt.second.restartOnExit==true) ? "true" : "false") << std::endl;
      ostream << "    DeleteOnExit: " << ((streamIt.second.deleteOnExit==true) ? "true" : "false") << std::endl;
      if (cameraIt.second.isStreamCapturing(streamIt.first)) {
        ostream << "    isStreamCapturing: true" << std::endl;
      } else {
        ostream << "    isStreamCapturing: false" << std::endl;
      }
      ostream << "    Pid: " << streamIt.second.pid << std::endl;
      ostream << "    Exit Code: " << streamIt.second.exitStatus << std::endl;
    }
    cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);
  }
  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

static int cmd_get_camera_info_json(const char *buffer, int clientsock) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

  boost::property_tree::ptree ptree=CamerasToProperty();
  std::ostringstream ostream;
  write_json(ostream, ptree);

  cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

//Process a stream URL that was received from the Web API
void processReceivedStreamURL(int32_t thingId, const boost::property_tree::ptree& pt) {
  std::string url;
  try {
    //Iterate over data
    for (auto const &data : pt.get_child("Data")) {
      url=data.second.get_value<std::string>();
    }
  } catch (boost::property_tree::ptree_bad_path& e) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to parse Json result for received stream URL: %s\n", __PRETTY_FUNCTION__, e.what());
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Received Stream URL: %s for Camera ID: %d\n", __PRETTY_FUNCTION__, url.c_str(), thingId);
  {
    //Use stream 0 for now
    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

    try {
      if (!gcameras.at(thingId).cameraStreams.at(0).needStreamURL) {
        //The url isn't needed at the moment so ignore
        return;
      }
    } catch (std::out_of_range& e) {
      //Stream 0 for the camera Id doesn't exist
      debuglibifaceptr->debuglib_printf(1, "%s: Stream 0 for Camera ID: %d not found\n", __PRETTY_FUNCTION__, url.c_str(), thingId);
      return;
    }
    gcameras.at(thingId).cameraStreams.at(0).streamURL=url;
    gcameras.at(thingId).cameraStreams.at(0).needStreamURL=false;
  }
}

//Returns an encoded string from a unencoded string
//Based on http://stackoverflow.com/questions/10521581/base64-encode-using-boost-throw-exception/10973348#10973348
//The line break inserting at character 76 has been removed
static std::string base64_encode(const std::string& s) {
  typedef boost::archive::iterators::base64_from_binary<boost::archive::iterators::transform_width<std::string::const_iterator,6,8> > it_base64_t;

  unsigned int writePaddChars = (3-s.length()%3)%3;
  std::string base64(it_base64_t(s.begin()),it_base64_t(s.end()));
  base64.append(writePaddChars,'=');

  return base64;
}

//Returns a decoded string from a base64 encoded string
//Based on http://stackoverflow.com/questions/10521581/base64-encode-using-boost-throw-exception/10973348#10973348
static std::string base64_decode(const std::string& base64) {
  typedef boost::archive::iterators::transform_width< boost::archive::iterators::binary_from_base64<boost::archive::iterators::remove_whitespace<std::string::const_iterator> >, 8, 6 > it_binary_t;
  std::string tmps=base64;

  unsigned int paddChars = count(tmps.begin(), tmps.end(), '=');
  std::replace(tmps.begin(),tmps.end(),'=','A'); // replace '=' by base64 encoding of '\0'
  std::string result(it_binary_t(tmps.begin()), it_binary_t(tmps.end())); // decode
  result.erase(result.end()-paddChars,result.end());  // erase padding '\0' characters

  return result;
}

//From http://stackoverflow.com/questions/154536/encode-decode-urls-in-c
static std::string url_encode(const std::string &value) {
    std::ostringstream escaped;
    escaped.fill('0');
    escaped << std::hex;

    for (auto const& it : value) {
        std::string::value_type c = it;

        // Keep alphanumeric and other accepted characters intact
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            escaped << c;
            continue;
        }

        // Any other characters are percent-encoded
        escaped << std::uppercase;
        escaped << '%' << std::setw(2) << int((unsigned char) c);
        escaped << std::nouppercase;
    }

    return escaped.str();
}

//Setup a http request
//Only POST is supported at the moment
class httpclient {
private:
  //Name, Value pair
  std::map<std::string, std::string> headers;

  //Name, Value pair
  std::map<std::string, std::string> formfields;
  std::string httppath;
  bool haveHttpAuth=false;
  std::string httpusername;
  std::string httppassword;
public:
  httpclient() {
    addHeader("Accept", "*/*");
    addHeader("User-Agent", "HTTP-Client 1.1");
    addHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  }

  void addHeader(const std::string& name, const std::string& value) {
    headers[name]=value;
  }

  //Added an entire string as a header
  //Example: Host: www.example.com
  void addHeader(const std::string& str) {
    std::istringstream ss(str);
    std::string name, value;

    ss >> name;
    ss >> value;
    name.erase(name.end()-1); //Remove : at the end of the name
    addHeader(name, value);
  }

  void addFormField(const std::string& name, const std::string& value) {
    formfields[name]=value;
  }

  void addFormField(const std::string& name, const long int value) {
    std::ostringstream ss;

    ss << value;
    formfields[name]=ss.str();
  }

  void setPath(std::string path) {
    this->httppath=path;
  }

  void addHttpAuth(const std::string& username, const std::string& password) {
    this->httpusername=username;
    this->httppassword=password;
    haveHttpAuth=true;
  }

  std::string toString() {
    std::ostringstream stream;
    std::ostringstream body;

    //Generate the body from the form data
    bool firstfield=true;
    for (auto const& formfieldit : formfields) {
      if (!firstfield) {
        body << "&";
      }
      body << url_encode(formfieldit.first) << '=' << url_encode(formfieldit.second);
      firstfield=false;
    }
    stream << "POST " << httppath << " HTTP/1.1\r\n";
    if (haveHttpAuth) {
      std::ostringstream authstring;
      authstring << httpusername << ':' << httppassword;
      stream << "Authorization: Basic " << base64_encode(authstring.str()) << "\r\n";
    }
    for (auto const& headerit : headers) {
      stream << headerit.first << ": " << headerit.second << "\r\n";
    }
    stream << "Content-Length: " << body.str().size() << "\r\n";
    stream << "\r\n";
    stream << body.str();

    return stream.str();
  }
};

//Based on http://www.boost.org/doc/libs/1_61_0/doc/html/boost_asio/example/cpp03/http/client/async_client.cpp
//  and http://www.boost.org/doc/libs/1_61_0/doc/html/boost_asio/example/cpp03/timeouts/async_tcp_client.cpp
//NOTE: Android doesn't know about service: "http" so have to use 80 for the port
class asioclient {
private:
  boost::atomic<bool> stopped_;
  tcp::resolver resolver_;
  tcp::socket socket_;
  boost::asio::streambuf response_;
  boost::asio::system_timer deadline_;
  std::string httpserver;
  std::string httppath;
  std::string webapiport;
  std::string apiusername, apipassword;
  std::string httpusername;
  std::string httppassword;
  std::string http_version;
  unsigned httpstatuscode;
  long httpbodylen;
  WEBAPI_REQUEST_MODES requestmode;

  std::map<int32_t, Camera>::iterator camerasIt;

  //See http://stackoverflow.com/questions/21120361/boostasioasync-write-and-buffers-over-65536-bytes
  //These variables need to stay allocated while the asio request is active so can't be local to a single function
  httpclient hc;
  boost::asio::streambuf getStreamURLRequest_;

public:
  asioclient(boost::asio::io_service& io_service)
    : stopped_(true), resolver_(io_service), socket_(io_service), deadline_(io_service) {
      //NOTE: When initialised globally, debuglibifaceptr won't be initialised yet
    }

  // Called by the user of the client class to initiate the connection process.
  // The endpoint iterator will have been obtained using a tcp::resolver.
  void start(const std::string& server, const std::string& webapiport, const std::string& path, const std::string& username, const std::string& password, const std::string &httpusername, const std::string &httppassword) {
    // Form the request. We specify the "Connection: close" header so that the
    // server will close the socket after transmitting the response. This will
    // allow us to treat all data up until the EOF as the content.
    if (!stopped_) {
      return;
    }
    stopped_=false;
    httpserver=server;
    httppath=path;
    this->webapiport=webapiport;
    apiusername=username;
    apipassword=password;
    this->httpusername=httpusername;
    this->httppassword=httppassword;

    //Since this class runs asynchronously and uses an iterator to the cameras, the remove camera operation may be
    //  triggered while this class is running, so we need to mark the cameras in use while running
    markCamerasInUse();

    struct timespec curtime;
    clock_gettime(CLOCK_REALTIME, &curtime);
    bool skipGetStreamURL=false;
    {
      boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
      if (gcameras.size()==0) {
        skipGetStreamURL=true;
      }
    }
    if (getneedtoquit() || (skipGetStreamURL)) {
      //No need to connect if nothing to process
      stop();
      return;
    }
    //Loop through the queues processing each one at a time
    {
      boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
      camerasIt=gcameras.begin();
    }
    // Start an asynchronous resolve to translate the server and service names
    // into a list of endpoints.
    tcp::resolver::query query(httpserver, this->webapiport);
    resolver_.async_resolve(query,
      boost::bind(&asioclient::handle_resolve, this,
        boost::asio::placeholders::error,
        boost::asio::placeholders::iterator));

    //Set a starting deadline timer for 10 seconds (Queries shouldn't take longer than that
    deadline_.expires_from_now(boost::chrono::seconds(10));

    // Start the deadline actor
    deadline_.async_wait(boost::bind(&asioclient::check_deadline, this));
  }

  // This function terminates all the actors to shut down the connection. It
  // may be called by the user of the client class, or by the class itself in
  // response to graceful termination or an unrecoverable error.
  void stop() {
    if (stopped_) {
      return;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Stopping connection\n", __PRETTY_FUNCTION__);
    stopped_ = true;
    boost::system::error_code ignored_ec;
    try {
      socket_.shutdown(tcp::socket::shutdown_both, ignored_ec);
    } catch (std::exception& e) {
      //Ignore errors from this function for now
    }
    socket_.close(ignored_ec);
    deadline_.cancel();
    response_.consume(response_.size());

    markCamerasNotInUse();
  }
private:
  void handle_resolve(const boost::system::error_code& err, tcp::resolver::iterator endpoint_iterator) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      std::stringstream tmps;
      tmps << endpoint_iterator->endpoint();
      debuglibifaceptr->debuglib_printf(1, "%s: Trying %s...\n", __PRETTY_FUNCTION__, tmps.str().c_str());

      // Set a deadline for the connect operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Attempt a connection to each endpoint in the list until we
      // successfully establish a connection.
      boost::asio::async_connect(socket_, endpoint_iterator,
          boost::bind(&asioclient::handle_connect, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s, Hostname: %s, Port: %s\n", __PRETTY_FUNCTION__, err.message().c_str(), this->httpserver.c_str(), this->webapiport.c_str());
      stop();
    }
  }

  void reset_http_body() {
    http_version="";
    httpstatuscode=0;
    httpbodylen=0;
  }

  void handle_connect(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      // The connection was successful
      // Prepare new HTTP request headers
      setupHTTPHeaders();
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void setupHTTPHeaders(void) {
    //Check if need to quit
    bool skipGetStreamURL=false;
    {
      boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
      if (gcameras.size()==0 || camerasIt==gcameras.end()) {
        skipGetStreamURL=true;
      }
    }
    if (getneedtoquit() || (skipGetStreamURL)) {
      //A full pass has been completed with all the queues
      stop();
      return;
    }
    //NOTE: We set the Mode and Data later on when submitting the request
    hc=httpclient();
    hc.setPath(httppath);
    if (httpusername != "") {
      //Send the http password straight away to reduce the number of packets
      hc.addHttpAuth(httpusername, httppassword);
    }
    hc.addHeader("Host", httpserver);
    hc.addFormField("Version", "0.4.11");
    if (apiusername != "") {
      std::ostringstream tmpstr;
      tmpstr << "[\"" << apiusername << "\",\"" << apipassword << "\"]";
      hc.addFormField("Access", tmpstr.str());
    }
    // Get Stream URL
    getStreamURL();
  }

  void getStreamURL(void) {
    //Get a stream URL for a camera
    reset_http_body();

    if (!getneedtoquit()) {
      int32_t thingId;
      bool needStreamURL=false;
      {
        boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
        try {
          if (!camerasIt->second.isStreamCapturing(0) && !camerasIt->second.needToRemove && !camerasIt->second.cameraStreams.at(0).needToRemove) {
            //Only get the stream url if not capturing and not scheduled for removal
            needStreamURL=camerasIt->second.getNeedStreamURL(0);
          }
        } catch (std::out_of_range& e) {
          //Stream 0 doesn't exist
        }
        thingId=camerasIt->first;
      }
      if (!needStreamURL) {
        //Treat this as a successful send as we don't need the stream url
        successful_send();
        return;
      }
      hc.addFormField("Mode", "GetStreamURL");
      hc.addFormField("Id", thingId);
      std::ostream request_stream(&getStreamURLRequest_);
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Requesting url for camera: %d: %s\n", __func__, thingId, hc.toString().c_str());
      request_stream << hc.toString();

      requestmode=WEBAPI_REQUEST_MODES::GET_STREAM_URL;
      boost::asio::async_write(socket_, getStreamURLRequest_,
          boost::bind(&asioclient::handle_write_request, this,
            boost::asio::placeholders::error));
    } else {
      stop();
    }
  }

  void handle_write_request(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Read the response status line. The response_ streambuf will
      // automatically grow to accommodate the entire line. The growth may be
      // limited by passing a maximum size to the streambuf constructor.
      boost::asio::async_read_until(socket_, response_, "\r\n",
          boost::bind(&asioclient::handle_read_status_line, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void handle_read_status_line(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err) {
      // Check that response is OK.
      std::istream response_stream(&response_);
      response_stream >> http_version;
      response_stream >> httpstatuscode;
      std::string status_message;
      std::getline(response_stream, status_message);
      if (!response_stream || http_version.substr(0, 5) != "HTTP/") {
        debuglibifaceptr->debuglib_printf(1, "%s: Invalid response: %s\n", __PRETTY_FUNCTION__, http_version.c_str());
        stop();
        return;
      } else if (httpstatuscode == 401 || httpstatuscode == 403) {
        //Abort as the password was incorrect
        debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __PRETTY_FUNCTION__);
        stop();
        return;
      } else if (httpstatuscode != 200) {
        debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __PRETTY_FUNCTION__, httpstatuscode);
        stop();
        return;
      }
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Read the response headers, which are terminated by a blank line.
      boost::asio::async_read_until(socket_, response_, "\r\n\r\n",
          boost::bind(&asioclient::handle_read_headers, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void handle_read_headers(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      // Process the response headers.
      std::istream response_stream(&response_);
      std::string header;
      bool havebodylen=false;
      while (std::getline(response_stream, header) && header != "\r") {
        if (header.substr(0, 15) == "Content-Length:") {
          std::stringstream contentlengthstr(header.substr(15));
          contentlengthstr >> httpbodylen;
          havebodylen=true;
          debuglibifaceptr->debuglib_printf(1, "%s: Content-Length=%ld\n", __PRETTY_FUNCTION__, httpbodylen);
        }
        debuglibifaceptr->debuglib_printf(1, "%s: Header: %s\n", __PRETTY_FUNCTION__, header.c_str());
      }
      if (!havebodylen) {
        //Can't continue without proper body length so abort
        debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to retrieve Content-Length\n", __PRETTY_FUNCTION__);
        stop();
        return;
      }
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

      if (httpstatuscode == 401 || httpstatuscode==403) {
        //Abort as the password was incorrect
        debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __PRETTY_FUNCTION__);
        stop();
        return;
      } else if (httpstatuscode != 200) {
        debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __PRETTY_FUNCTION__, httpstatuscode);

        // Dummy read the body
        boost::asio::async_read(socket_, response_,
            boost::asio::transfer_exactly(httpbodylen-response_.size()),
            boost::bind(&asioclient::dummy_read_content, this,
              boost::asio::placeholders::error));
        stop();
        return;
      } else {
        // Read the body
        boost::asio::async_read(socket_, response_,
            boost::asio::transfer_exactly(httpbodylen-response_.size()),
            boost::bind(&asioclient::handle_read_content, this,
              boost::asio::placeholders::error));
      }
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  int process_response(std::string body) {
    int errcode=0;

    try {
      boost::property_tree::ptree pt;
      std::istringstream streamstr(body);

      read_json(streamstr, pt);
      bool iserror=pt.get<bool>("Error");
      if (iserror) {
        errcode=pt.get<int>("ErrCode");
        std::string errorstr=pt.get<std::string>("ErrMesg");
        debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned error code: %d, error message: %s\n", __PRETTY_FUNCTION__, errcode, errorstr.c_str());
        if (errcode==0) {
          //Error code 0 normally means success so if there was an error adjust to -1 for the return
          errcode=-1;
        }
      }
      if (requestmode==WEBAPI_REQUEST_MODES::GET_STREAM_URL && errcode==0) {
        //Process the stream url that was received
        int32_t thingId;
        {
          boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
          thingId=camerasIt->first;
        }
        processReceivedStreamURL(thingId, pt);
      }
    } catch (boost::property_tree::ptree_error &e) {
      debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned an unknown result\n", __PRETTY_FUNCTION__);
      return -1;
    }
    return errcode;
  }

  void dummy_read_content(const boost::system::error_code& err) {
    response_.consume(httpbodylen);
  }

  void handle_read_content(const boost::system::error_code& err) {
    if (!err || err == boost::asio::error::eof) {
      // Write all of the data that has been read so far.
      std::string httpbody;
      int c;
      while ( (c=response_.sbumpc())!=EOF ) {
        httpbody+=(char) c;
      }
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Body: \"%s\"\n", __PRETTY_FUNCTION__, httpbody.c_str());

      int result=process_response(httpbody);

      if (result==0) {
        successful_send();
      } else {
        failed_send();
      }
    }
    else if (err != boost::asio::error::eof)
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  //Do processing after the request has been sent and then send the next request
  void successful_send() {
    if (requestmode==WEBAPI_REQUEST_MODES::GET_STREAM_URL) {
      boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

      //Step to next camera entry
      //Processing was handled by process_response
      ++camerasIt;

      setupHTTPHeaders();
    }
  }

  void failed_send() {
    if (requestmode==WEBAPI_REQUEST_MODES::GET_STREAM_URL) {
      boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

      //Step to next camera entry since process_response failed
      ++camerasIt;

      setupHTTPHeaders();
    }
  }

  void check_deadline() {
    if (stopped_)
      return;

    // Check whether the deadline has passed. We compare the deadline against
    // the current time since a new asynchronous operation may have moved the
    // deadline before this actor had a chance to run.
    if (deadline_.expires_at() <= boost::chrono::system_clock::now())
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Server took too long to respond\n", __PRETTY_FUNCTION__);

      //Shutdown first as per Boost header file portability recommendation
      try {
        socket_.shutdown(tcp::socket::shutdown_both);
      } catch (std::exception& e) {
        //Ignore errors from this function for now
      }
      // The deadline has passed. The socket is closed so that any outstanding
      // asynchronous operations are cancelled.
      socket_.close();
    } else {
      // Put the actor back to sleep.
      deadline_.async_wait(boost::bind(&asioclient::check_deadline, this));
    }
  }
};


class asyncloop {
private:
  boost::mutex mtx_;
  boost::asio::io_service io_service;
  boost::asio::system_timer mainTimer;
  boost::asio::system_timer webapiTimer;
  asioclient client;
public:
  asyncloop()
    : mainTimer(io_service), webapiTimer(io_service), client(io_service) {
    }

  void start() {
    webapi_timer_loop();
    main_timer_loop();
    try {
      io_service.run();
      io_service.reset();
    } catch (std::exception& e) {
      debuglibifaceptr->debuglib_printf(1, "%s: Error while running service: %s\n", __PRETTY_FUNCTION__, e.what());
    }
  }

  void stop() {
    boost::lock_guard<boost::mutex> guard(mtx_);
    client.stop();
    mainTimer.expires_from_now(boost::chrono::seconds(0));
    webapiTimer.expires_from_now(boost::chrono::seconds(0));
  }
private:
  void main_timer_loop() {
    mainTimer.expires_from_now(boost::chrono::seconds(1)); //Run main loop every second
    mainTimer.async_wait(boost::bind(&asyncloop::main_timer_handler, this, boost::asio::placeholders::error));

    boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);

    //Loop through all the camera streams and to see if they need any actions applied
    for (auto &cameraIt : gcameras) {
      std::map<int32_t, CameraStream>::iterator cameraStreamIt;
      if (cameraIt.second.needToRemove) {
        continue;
      }
      for (cameraStreamIt=cameraIt.second.cameraStreams.begin(); cameraStreamIt!=cameraIt.second.cameraStreams.end(); ++cameraStreamIt) {
        if (cameraStreamIt->second.needToRemove) {
          continue;
        }
        if (!cameraIt.second.isStreamCapturing(cameraStreamIt->first)) {
          if (gAllStop) {
            continue;
          }
          if (cameraStreamIt->second.restartOnExit && cameraStreamIt->second.enabled) {
            //If in continuous stream mode, always restart the stream automatically
            cameraIt.second.startStreamCapture(cameraStreamIt->first);
          }
          else if (cameraStreamIt->second.deleteOnExit && cameraStreamIt->second.hasRun) {
            auto cameraStreamPrevIt=cameraStreamIt;

            debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Removing camera stream: %d from camera object: %d\n", __func__, cameraStreamIt->first, cameraIt.first);

            //Step to next stream entry before erasing the one that just got processed
            ++cameraStreamIt;

            //Erase the entry that just got processed
            cameraIt.second.removeStream(cameraStreamPrevIt->first);

            if (cameraStreamIt==cameraIt.second.cameraStreams.end()) {
              break;
            }
          }
        } else {
          if (gAllStop) {
            //Force stop stream capture
            debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Stopping camera stream: %d for camera object: %d as allStop is true\n", __func__, cameraStreamIt->first, cameraIt.first);
            int result=cameraIt.second.stopStreamCapture(cameraStreamIt->first, true, true);
            if (result!=0) {
              debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG stopStreamCapture returned error: %d\n", __func__, result);
            }
          }
        }
      }
    }
    removeCamerasScheduledForRemoval();
  }

  void webapi_timer_loop() {
    std::string webapihostname="", webapiport="80", webapiurl="", webapihttpuser="", webapihttppass="", webapiuser="", webapipass="";
    bool missingval=false;
    std::string hubpkstr;

    boost::lock_guard<boost::mutex> guard(mtx_);

    missingval|=!(configlibifaceptr->getnamevalue_cpp("general", "hubpk", hubpkstr));
    ghubpk=std::atol(hubpkstr.c_str());

    missingval|=!(configlibifaceptr->getnamevalue_cpp("webapiconfig", "hostname", webapihostname));
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "port", webapiport);
    missingval|=!(configlibifaceptr->getnamevalue_cpp("webapiconfig", "hubcameraurl", webapiurl));

    configlibifaceptr->getnamevalue_cpp("webapiconfig", "httpusername", webapihttpuser);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "httppassword", webapihttppass);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "apiusername", webapiuser);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "apipassword", webapipass);
    if (!missingval) {
      webapiTimer.expires_from_now(boost::chrono::seconds(WEBAPI_ACCESS_INTERVAL)); //Restart every WEBAPI_ACCESS_INTERVAL seconds
      webapiTimer.async_wait(boost::bind(&asyncloop::webapi_timer_handler, this, boost::asio::placeholders::error));

      debuglibifaceptr->debuglib_printf(1, "%s: Starting client connection\n", __PRETTY_FUNCTION__);
      client.start(webapihostname, webapiport, webapiurl, webapiuser, webapipass, webapihttpuser, webapihttppass);
    } else {
      webapiTimer.expires_from_now(boost::chrono::seconds(1)); //Restart every second when config isn't ready
      webapiTimer.async_wait(boost::bind(&asyncloop::webapi_timer_handler, this, boost::asio::placeholders::error));

      debuglibifaceptr->debuglib_printf(1, "%s: Configuration not yet ready\n", __PRETTY_FUNCTION__);
    }
  }

  //Called every time the main timer triggers
  void main_timer_handler(const boost::system::error_code& error) {
    if (!getneedtoquit()) {
      main_timer_loop();
    }
  }

  //Called every time the webapi timer triggers
  void webapi_timer_handler(const boost::system::error_code& error) {
    if (!getneedtoquit()) {
      webapi_timer_loop();
    }
  }
};

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int processcommand(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  if (!cmdserverlibifaceptr) {
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);
  if (buffertokens.size()==0) {
    //No valid tokens found
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  {
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

asyncloop gasyncloop;

/*
  Main thread loop that manages operation of rules
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *mainloop(void *UNUSED(val)) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    if (getneedtoquit()) {
      break;
    }
    //Auto restart the loop if it crashes before we are ready to quit
    gasyncloop.start();
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return (void *) 0;
}

static boost::atomic<bool> needtoquit(false);

static void setneedtoquit(bool val) {
  needtoquit.store(val);

  //Trigger stop in the main async loop
  gasyncloop.stop();
}

static bool getneedtoquit() {
  return needtoquit.load();
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int start(void) {
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  //Start a thread for auto detecting Xbee modules
  if (gmainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __PRETTY_FUNCTION__);
    result=pthread_create(&gmainthread, nullptr, mainloop, nullptr);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __PRETTY_FUNCTION__);
      result=-1;
    }
  }
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_add_camera", "cameralib_test_add_camera <cameraid>", "Test command for adding a camera", "Test command for adding a camera object with a unique id", cmd_test_add_camera);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_remove_camera", "cameralib_test_remove_camera <cameraid>", "Test command for removing a camera", "Test command for removing a camera object with a unique id", cmd_test_remove_camera);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_add_camera_stream", "cameralib_test_add_camera_stream <cameraid> <streamid> [cmd] [args]", "Test command for adding a camera stream", "Test command for adding a camera stream to a camera object with a unique id", cmd_test_add_camera_stream);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_remove_camera_stream", "cameralib_test_remove_camera_stream <cameraid> <streamid>", "Test command for removing a camera stream", "Test command for removing a camera stream from a camera object with a unique id", cmd_test_remove_camera_stream);

    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_set_camera_stream_property", "\ncameralib_test_set_camera_stream_property <cameraid> <streamid> cmd [cmd] [args]\ncameralib_test_set_camera_stream_property <cameraid> <streamid> restartOnExit <true|false>\ncameralib_set_camera_stream_property <cameraid> <streamid> deleteOnExit <true|false>\ncameralib_set_camera_stream_property <cameraid> <streamid> enabled <true|false>", "Test command for setting properties of a camera stream", "Test command for setting properties of a camera stream", cmd_test_set_camera_stream_property);

    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_start_stream", "cameralib_test_start_stream <cameraid> <streamid>", "Test command to start a stream", "Test command to start a stream", cmd_test_start_stream);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_test_stop_stream", "cameralib_test_stop_stream <cameraid> <streamid>", "Test command to force stop a stream", "Test command to force stop a stream", cmd_test_stop_stream);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_all_stop", "cameralib_all_stop [true (default)|false]", "Command to stop all streams until watch inputs is restarted", "Command to stop all streams until watch inputs is restarted", cmd_all_stop);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_get_camera_info", "cameralib_get_camera_info", "Command to get info about the camera library objects and running streams", "Command to get info about the camera library objects and running streams", cmd_get_camera_info);
    cmdserverlibifaceptr->register_cmd_longdesc("cameralib_get_camera_info_json", "cameralib_get_camera_info_json", "Command to get info about the camera library objects and running streams with JSON output", "Command to get info about the camera library objects and running streams with JSON output", cmd_get_camera_info_json);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
static void stop(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gmainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __PRETTY_FUNCTION__);
    setneedtoquit(true);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __PRETTY_FUNCTION__);
    pthread_join(gmainthread, nullptr);
    gmainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int init(void) {
  cmdserverlibifaceptr=reinterpret_cast<const cmdserverlib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("cmdserverlib", CMDSERVERLIBINTERFACE_VER_2));
  dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));;
  debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  configlibifaceptr=reinterpret_cast<const configlib_ifaceptrs_ver_2_cpp_t *>(getmoduledepifaceptr("configlib", CONFIGLIBINTERFACECPP_VER_2));
  mainlibifaceptr=reinterpret_cast<const mainlib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("mainlib", MAINLIBINTERFACE_VER_2));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gshuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __PRETTY_FUNCTION__);
    return -1;
  }
  ++ginuse;
  if (ginuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return -1;
  }
  gneedtoquit=0;
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void shutdown(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (ginuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __PRETTY_FUNCTION__);
    return;
  }
  --ginuse;
  if (ginuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return;
  }
  //Start shutting down library
  gshuttingdown=1;

  gshuttingdown=0;

  //Free allocated memory
  ghubpk=0;

  gcameras.clear();
  camerasInUse=0;

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Register all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void register_listeners(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->register_cmd_listener(processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Unregister all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void unregister_listeners(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->unregister_cmd_listener(processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

} //End of namespace

//C Exports
extern "C" {

extern moduleinfo_ver_generic_t *cameralib_getmoduleinfo();

}

extern moduleinfo_ver_generic_t *cameralib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &cameralib::gmoduleinfo_ver_1;
}

#ifdef __ANDROID__

//JNI Exports
extern "C" {
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CameraLib_jnigetmodulesinfo( JNIEnv* env, jobject obj);
}

JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CameraLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) cameralib_getmoduleinfo());
}
#endif
