/*
Title: Time Rules Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Reads from a file that specifies when to turn on or off a device.
Copyright: Capsicum Corporation 2017

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

//NOTE: We use jlong for pointer passing to be compatible with 64-bit hosts
//NOTE: JNI doesn't like _ characters in the function names

*/

//NOTE: POSIX_C_SOURCE is needed for the following
//  ctime_r
//  localtime_r
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

#include "config.h"

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <boost/config.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <time.h>
#include <semaphore.h>
#include <fcntl.h>
#include <list>
#include <map>
#include <string>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "timeruleslib.hpp"
#include "main/mainlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"

#ifdef DEBUG
#pragma message("TIMERULESLIB_PTHREAD_LOCK and TIMERULESLIB_PTHREAD_UNLOCK debugging has been enabled")
#include <errno.h>
#define TIMERULESLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    timeruleslib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    timeruleslib_backtrace(); \
  } \
}

#define TIMERULESLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    timeruleslib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    timeruleslib_backtrace(); \
  } \
}

#else

#define TIMERULESLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define TIMERULESLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef TIMERULESLIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
  #define LOCKDEBUG_EXITINGFUNC() { }
  #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif


#ifdef TIMERULESLIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef TIMERULESLIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef TIMERULESLIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef TIMERULESLIB_MOREDEBUG
#define INLINE
#else
#define INLINE inline
#endif

#define BUFFER_SIZE 1024

typedef struct timerule timerule_t;
struct timerule {
  std::string deviceid; //Normally the mac address of a device
  int16_t ontime; //The minute of the day at which to turn on a device
  int16_t offtime; //The minute of the day at which to turn off a device
  int prevlastruleset=-1; //Previous last rule set
  int lastruleset=-1; //1 means on was the last rule applied, 0 means off was the last rule applied
};

static sem_t timeruleslib_mainthreadsleepsem; //Used for main thread sleeping

static int timeruleslib_inuse=0; //Only shutdown when inuse = 0
static bool timeruleslib_shuttingdown=false;

static bool timeruleslib_needtoreload=false;
static bool timeruleslib_processingtimerules=false; // While set to true, reloading shouldn't be done

static bool needtoquit=false; //Set to true when timeruleslib should exit

static pthread_t timeruleslib_mainthread=0;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

STATIC pthread_mutex_t timeruleslibmutex;
#else
static pthread_mutex_t timeruleslibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif
static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;

static int rulesloaded=0;
static int rulesloadpending=0;
static std::string rulesfilename="";

//device id , timerule struct
static std::map<std::string, timerule_t> gtimerules;

//Function Declarations
int timeruleslib_readrulesfile();
int timeruleslib_isloaded();
static int timeruleslib_setrulesfilename(const char *rulefile);

static bool timeruleslib_getneedtoquit();
static int timeruleslib_start(void);
static void timeruleslib_stop(void);
static int timeruleslib_init(void);
static void timeruleslib_shutdown(void);

//C Exports
extern "C" {

BOOST_SYMBOL_EXPORT moduleinfo_ver_generic_t *timeruleslib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_TimeRulesLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
#endif
}

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define DBLIB_DEPIDX 1
#define CMDSERVERLIB_DEPIDX 2
#define COMMONLIB_DEPIDX 3
#define MAINLIB_DEPIDX 4

static timeruleslib_ifaceptrs_ver_1_t timeruleslib_ifaceptrs_ver_1={
  timeruleslib_setrulesfilename,
  timeruleslib_readrulesfile,
  timeruleslib_isloaded,
};

static timeruleslib_ifaceptrs_ver_1_cpp_t timeruleslib_ifaceptrs_ver_1_cpp={
  timeruleslib_setrulesfilename,
  timeruleslib_readrulesfile,
  timeruleslib_isloaded,
};

static moduleiface_ver_1_t timeruleslib_ifaces[]={
  {
    &timeruleslib_ifaceptrs_ver_1,
    TIMERULESLIBINTERFACE_VER_1
  },
  {
    &timeruleslib_ifaceptrs_ver_1_cpp,
    TIMERULESLIBINTERFACECPP_VER_1
  },
  {
    nullptr, 0
  }
};

moduledep_ver_1_t timeruleslib_deps[]={
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
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_2,
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

moduleinfo_ver_1_t timeruleslib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "timeruleslib",
  timeruleslib_init,
  timeruleslib_shutdown,
  timeruleslib_start,
  timeruleslib_stop,
  nullptr,
  nullptr,
  (moduleiface_ver_1_t (* const)[]) &timeruleslib_ifaces,
  (moduledep_ver_1_t (*)[]) &timeruleslib_deps
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
STATIC INLINE void timeruleslib_backtrace(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __func__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __func__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __func__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
STATIC INLINE void timeruleslib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

//Initialise a thread local store for the lock counter
static void timeruleslib_makelockkey(void) {
  (void) pthread_key_create(&lockkey, NULL);
}

/*
  Apply the timeruleslib mutex lock if not already applied otherwise increment the lock count
*/
void timeruleslib_lock() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, timeruleslib_makelockkey);

  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    //Allocate storage for the lock counter
    lockcnt=(long *) malloc(sizeof(long));
    (void) pthread_setspecific(lockkey, lockcnt);
    *lockcnt=0;
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    TIMERULESLIB_PTHREAD_LOCK(&timeruleslibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef TIMERULESLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the timeruleslib mutex lock
*/
void timeruleslib_unlock() {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, timeruleslib_makelockkey);

  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    //timeruleslib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    TIMERULESLIB_PTHREAD_UNLOCK(&timeruleslibmutex);
  }
#ifdef TIMERULESLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=NULL;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

/*
  Read in the time rules from a file.
  NOTE: This function has a lock around the entire operation so any functions called this function will only be called by
    one thread at a time.
  Input: rulefile The name of the file to read
  Returns: 0 if success or non-zero on error.
*/
int timeruleslib_readrulesfile(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonlib_ifaceptrs_ver_2_t *commonlibifaceptr=(commonlib_ifaceptrs_ver_2_t *) timeruleslib_deps[COMMONLIB_DEPIDX].ifaceptr;
  mainlib_ifaceptrs_ver_2_t *mainlibifaceptr=(mainlib_ifaceptrs_ver_2_t *) timeruleslib_deps[MAINLIB_DEPIDX].ifaceptr;
  FILE *file;
  char *linebuf;
  int abort=0;
  std::string curblock="<global>";
  std::string curdeviceid="";

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  timeruleslib_lock();
	if (timeruleslib_inuse==0) {
    timeruleslib_unlock();
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, not initialised\n", __func__);
		return -1;
	}
	if (rulesfilename=="") {
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, time rules filename not configured\n", __func__);
    return -1;
  }
  if (timeruleslib_processingtimerules) {
    timeruleslib_needtoreload=true;
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, time rules are currently being processed, scheduling load for later\n", __func__);
    return 0;
  }
  rulesloadpending=0;
  mainlibifaceptr->newdescriptorlock();
  int rulesfilefd=commonlibifaceptr->open_with_cloexec(rulesfilename.c_str(), O_RDONLY);
  mainlibifaceptr->newdescriptorunlock();
  if (rulesfilefd<0) {
    rulesloadpending=1;
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, rulesfilename.c_str());
    return -1;
  }
  file=fdopen(rulesfilefd, "rb");
  if (file == NULL) {
    rulesloadpending=1;
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, rulesfilename.c_str());
    return -1;
  }
  linebuf=(char *) malloc(BUFFER_SIZE*sizeof(char));
  if (!linebuf) {
    fclose(file);
    rulesloadpending=1;
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "%s: Not enough memory to load configuration\n", __func__);
    return -2;
  }
  if (abort==1) {
    fclose(file);
    free(linebuf);
    rulesloadpending=1;
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "%s: Time rules load aborted due to error\n", __func__);
    return -3;
  }
  gtimerules.clear();
  while (fgets(linebuf, BUFFER_SIZE, file) !=NULL) {
    size_t tmplen;

    tmplen=strlen(linebuf)-1;
    if (tmplen>0 && linebuf[tmplen] == '\n') {
      //Remove the newline at the end of the line
      linebuf[tmplen]=0;
      --tmplen;
    }
    if (tmplen>0 && linebuf[tmplen] == '\r') {
      //Carriage return will be present with DOS format
      //Remove the carriage return at the end of the line
      linebuf[tmplen]=0;
      --tmplen;
    }
    if (linebuf[0]==0 || linebuf[0]=='#' || linebuf[0]==';') {
      //Ignore commented lines
      continue;
    }
    if (linebuf[0]=='[' && linebuf[tmplen]==']') {
      linebuf[tmplen]=0;
      curblock=linebuf+1;
      debuglibifaceptr->debuglib_printf(1, "%s: Found a block: %s\n", __func__, curblock.c_str());
      continue;
    }
    char *equalsptr;
    equalsptr=strchr(linebuf, '=');
    if (!equalsptr) {
      //Not found
      continue;
    }
    //Left side of equals is the value
    //Right side of equals is the attr type string
    *equalsptr=0; //Convert = into nul
    std::string value=equalsptr+1;

    debuglibifaceptr->debuglib_printf(1, "%s: Found a name=value pair: [%s]: %s=%s\n", __func__, curblock.c_str(), linebuf, value.c_str());

    //Process the name=value pair
    if (curblock=="timerules") {
      if (strcmp(linebuf, "device")==0) {
        curdeviceid=value;
        gtimerules[curdeviceid].deviceid=curdeviceid;
        gtimerules[curdeviceid].prevlastruleset=-1;
        gtimerules[curdeviceid].lastruleset=-1;
      } else if (strcmp(linebuf, "ontime")==0) {
        int hour, minute;
        sscanf(value.substr(0, 2).c_str(), "%02d", &hour);
        sscanf(value.substr(2, 4).c_str(), "%02d", &minute);
        gtimerules[curdeviceid].ontime=hour*60+minute;
      } else if (strcmp(linebuf, "offtime")==0) {
        int hour, minute;
        sscanf(value.substr(0, 2).c_str(), "%02d", &hour);
        sscanf(value.substr(2, 4).c_str(), "%02d", &minute);
        gtimerules[curdeviceid].offtime=hour*60+minute;
      }
    }
  }
  fclose(file);
  free(linebuf);
  linebuf=NULL;

  rulesloadpending=0;
  rulesloaded=1;

  timeruleslib_needtoreload=false;

  //DEBUG: Display Time Rules
  for (auto const &timerulesit : gtimerules) {
    int onhour, onminute;
    int offhour, offminute;

    onhour=(timerulesit.second.ontime) / 60;
    onminute=(timerulesit.second.ontime)-(onhour*60);
    offhour=(timerulesit.second.offtime) / 60;
    offminute=(timerulesit.second.offtime)-(offhour*60);

    debuglibifaceptr->debuglib_printf(1, "Time Rule for device: %s\n", timerulesit.first.c_str());
    debuglibifaceptr->debuglib_printf(1, "  On Time: %02d:%02d\n", onhour, onminute);
    debuglibifaceptr->debuglib_printf(1, "  Off Time: %02d:%02d\n", offhour, offminute);
  }
  timeruleslib_unlock();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Returns 1 if the rules have been loaded at least once or 0 if not.
*/
int timeruleslib_isloaded() {
  int val;

  timeruleslib_lock();
  val=rulesloaded;
  timeruleslib_unlock();

  return val;
}

/*
  Returns 1 if the rules attempted to load but failed, 0 if not.
*/
static int timeruleslib_loadpending() {
  int val;

  timeruleslib_lock();
  val=rulesloadpending;
  timeruleslib_unlock();

  return val;
}

/*
  Cancel a previous pending load attempt
*/
static void timeruleslib_cancelpendingload() {
  timeruleslib_lock();
  rulesloadpending=0;
  timeruleslib_unlock();
}

//Set the current config filename
//Returns 0 if success or non-zero on error
static int timeruleslib_setrulesfilename(const char *rulesfile) {
  rulesfilename=rulesfile;

  return 0;
}

static int timeruleslib_processreloadcommand(const char *UNUSED(buffer), int clientsock) {
  auto const cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) timeruleslib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  if (timeruleslib_getneedtoquit()) {
    cmdserverlibifaceptr->cmdserverlib_netputs("Unable to reload during shutdown\n", clientsock, NULL);
    return CMDLISTENER_NOERROR;
  }
  timeruleslib_lock();
  timeruleslib_needtoreload=true;
  sem_post(&timeruleslib_mainthreadsleepsem);
  timeruleslib_unlock();

  cmdserverlibifaceptr->cmdserverlib_netputs("Reloading of time rules file has been scheduled\n", clientsock, NULL);

  return CMDLISTENER_NOERROR;
}

/*
 * Process the time rules one by one
 */
static void timeruleslib_process_timerules() {
  auto const debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  auto const dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) timeruleslib_deps[DBLIB_DEPIDX].ifaceptr;
  time_t currenttime;
  struct timespec curtime;
  struct tm curtimelocaltm, *curtimelocaltmptr;

  // Get the current time
  clock_gettime(CLOCK_REALTIME, &curtime);
  currenttime=curtime.tv_sec;

  // Get the current local time split out into individual fields
  curtimelocaltmptr=localtime_r(&currenttime, &curtimelocaltm);
  if (curtimelocaltmptr==nullptr) {
    debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Unable to get current local time\n", __func__);
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Current time: %02d:%02d\n", __func__, curtimelocaltm.tm_hour, curtimelocaltm.tm_min);

  // Set that we are processing time rules so we don't need to hold the lock the entire time
  timeruleslib_lock();
  timeruleslib_processingtimerules=true;
  timeruleslib_unlock();

  for (auto &timerulesit : gtimerules) {
    bool changestate=false;
    int newstate=0;
    int onhour, onminute;
    int offhour, offminute;

    onhour=(timerulesit.second.ontime) / 60;
    onminute=(timerulesit.second.ontime)-(onhour*60);
    offhour=(timerulesit.second.offtime) / 60;
    offminute=(timerulesit.second.offtime)-(offhour*60);

    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Last rule set for device: %s=%d\n", __func__, timerulesit.first.c_str(), timerulesit.second.lastruleset);
    if (onhour==curtimelocaltm.tm_hour && onminute==curtimelocaltm.tm_min && timerulesit.second.lastruleset!=1) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Need to activate On Time Rule for device: %s\n", __func__, timerulesit.first.c_str());
      changestate=true;
      newstate=1;
    }
    if (offhour==curtimelocaltm.tm_hour && offminute==curtimelocaltm.tm_min && timerulesit.second.lastruleset!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Need to activate Off Time Rule for device: %s\n", __func__, timerulesit.first.c_str());
      changestate=true;
      newstate=0;
    }
    if (timeruleslib_getneedtoquit()) {
      break;
    }
    // Apply a state change if needed and the database is initialised
    // TODO: Once zigbeelib implementes the on/off interface again we can use that instead of accessing the database directly
    if (changestate && dblibifaceptr->is_initialised()) {
      int result;
      int32_t curdbstate;
      void *uniqueid;
      uint64_t addr=0;

      // Convert string form of the address to a uint64_t type
      std::string hexaddr="0x";
      hexaddr+=timerulesit.first;
      sscanf(hexaddr.c_str(), "0x%" SCNx64, &addr);

      result=dblibifaceptr->begin();
      if (result<0) {
        debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction for device: %016" PRIX64 ", result=%d\n", __func__, addr, result);
        continue;
      }
      uniqueid=dblibifaceptr->getport_uniqueid(addr, 0);
      if (uniqueid) {
        result=dblibifaceptr->getioport_state(uniqueid, &curdbstate);
        if (result<0) {
          // If error when retrieving current state just try to apply the new state anyway
          curdbstate=-1;
        }
        if (curdbstate!=newstate) {
          result=dblibifaceptr->update_ioports_state(uniqueid, newstate);
          if (result<0) {
            debuglibifaceptr->debuglib_printf(1, "%s: Failed to apply new on/off state to device: %016" PRIX64 ", result=%d\n", __func__, addr, result);
          } else {
            //Update that the rule was set
            timerulesit.second.prevlastruleset=timerulesit.second.lastruleset;
            timerulesit.second.lastruleset=newstate;
          }
        } else {
          //Update that the rule was set so we are in sync with the database
          timerulesit.second.prevlastruleset=timerulesit.second.lastruleset;
          timerulesit.second.lastruleset=newstate;
        }
        dblibifaceptr->freeuniqueid(uniqueid);
      } else {
        debuglibifaceptr->debuglib_printf(1, "%s: Failed to access database thing for device: %016" PRIX64 "\n", __func__, addr);
      }
      result=dblibifaceptr->end();
      if (result<0) {
        dblibifaceptr->rollback();
      }
    }
  }
  timeruleslib_lock();
  timeruleslib_processingtimerules=false;
  timeruleslib_unlock();
}

/*
  Main Time Rules thread loop that manages
*/
static void *timeruleslib_mainloop(void* UNUSED(val)) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  time_t currenttime;
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Loop until this thread is canceled
  while (!timeruleslib_getneedtoquit()) {
    bool fastsleep=false; //True means we only sleep for 5 secons instead of 60 while waiting for loading

    clock_gettime(CLOCK_REALTIME, &semwaittime);
    currenttime=semwaittime.tv_sec;

    bool local_needtoreload;
    timeruleslib_lock();
    local_needtoreload=timeruleslib_needtoreload;
    timeruleslib_unlock();
    if (local_needtoreload) {
      timeruleslib_readrulesfile();
    }
    bool local_processingtimerules;
    timeruleslib_lock();
    local_processingtimerules=timeruleslib_processingtimerules;
    timeruleslib_unlock();
    if (timeruleslib_isloaded() && !local_processingtimerules) {
      timeruleslib_process_timerules();
    } else {
      fastsleep=true;
    }
    if (timeruleslib_getneedtoquit()) {
      break;
    }
    if (fastsleep) {
      semwaittime.tv_sec+=5;
      semwaittime.tv_nsec=0;
    } else {
      semwaittime.tv_sec+=60; //Step to the next minute but don't round so each device has slightly different on/off intevals for power grid distribution
      semwaittime.tv_nsec=0;
    }
#ifdef DEBUG
      {
        char timestr[100];
        ctime_r(&semwaittime.tv_sec, timestr);
        //Remove newline at end of timestr
        timestr[strlen(timestr)-1]='\0';
        if (fastsleep) {
          debuglibifaceptr->debuglib_printf(1, "%s: Fast Sleeping to reach time %s\n", __func__, timestr);
        } else {
          debuglibifaceptr->debuglib_printf(1, "%s: Sleeping to reach time %s\n", __func__, timestr);
        }
      }
#endif
    sem_timedwait(&timeruleslib_mainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static bool timeruleslib_getneedtoquit() {
  bool val;

  timeruleslib_lock();
  val=needtoquit;
  timeruleslib_unlock();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int timeruleslib_start(void) {
  auto const debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  auto const cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) timeruleslib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  //Start a thread for looping through time rules
  if (timeruleslib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&timeruleslib_mainthread, NULL, timeruleslib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
      result=-1;
    }
  }
  cmdserverlibifaceptr->cmdserverlib_register_cmd_function("timerules_reload", "Reload the time rules file", timeruleslib_processreloadcommand);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
static void timeruleslib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (timeruleslib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    timeruleslib_lock();
    needtoquit=true;
    sem_post(&timeruleslib_mainthreadsleepsem);
    timeruleslib_unlock();
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(timeruleslib_mainthread, NULL);
    timeruleslib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Initialise the timerules library
  Returns 0 for success or other value on error
//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int timeruleslib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) timeruleslib_deps[DBLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  ++timeruleslib_inuse;
  if (timeruleslib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, timeruleslib_inuse);
    pthread_mutex_unlock(&timeruleslibmutex);
    return 0;
  }
  //Let the database library know that we want to use it
  if (dblibifaceptr) {
    dblibifaceptr->init();
  }
  needtoquit=false;
  if (sem_init(&timeruleslib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  rulesfilename="";
  rulesloaded=0;
  rulesloadpending=0;
  gtimerules.clear();

#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&timeruleslibmutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//Shutdown the timerules library
//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void timeruleslib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) timeruleslib_deps[DBLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (timeruleslib_inuse==0) {
    //Already uninitialised
    pthread_mutex_unlock(&timeruleslibmutex);
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --timeruleslib_inuse;
  if (timeruleslib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, timeruleslib_inuse);
    pthread_mutex_unlock(&timeruleslibmutex);
    return;
  }
  //Start shutting down library
  timeruleslib_shuttingdown=true;

  //Finished using the database library
  dblibifaceptr->shutdown();

  sem_destroy(&timeruleslib_mainthreadsleepsem);

  rulesloadpending=0;
  rulesloaded=0;
  gtimerules.clear();

  //Finished shutting down
  timeruleslib_shuttingdown=false;

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&timeruleslibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *timeruleslib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &timeruleslib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_TimeRulesLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) timeruleslib_getmoduleinfo());
}
#endif
