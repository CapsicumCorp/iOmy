/*
Title: Rules Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for processing rules that a user has added
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

//These definitions will be picked up by commonlib.h
#ifdef DEBUG
#define ENABLE_PTHREAD_DEBUG_V2
#endif
#ifdef RULESLIB_LOCKDEBUG
#define LOCKDEBUG
#endif
#ifdef RULESLIB_MOREDEBUG
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
#include <sys/stat.h>
#include <sys/time.h>
#include <pthread.h>
#include <time.h>
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
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "ruleslibpriv.hpp"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/zigbeelib/zigbeelib.h"

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

namespace ruleslib {

//NOTE: Currently we rely on the webapi to provide nextRuntime updates
class Rule {
public:
  int32_t ruleId=0; //The id of the rule normally matching the database PK value, use negative values for local rules
  std::string deviceId=""; //Normally the mac address of a device
  int16_t portId=0; //A port value to indicate which slot on the device to apply the rule to (Not all device types use the port)
  int32_t deviceType=DEVICETYPES::NO_TYPE; //The type of device this rule applies to
  int32_t ruleType=RULETYPES::NO_TYPE; //The type of rule this is
  bool needToRemove=false; //Set to true when this rule has been scheduled for removal and it should be ignored
  bool needToRemoveInDb=false; //Set to true when this rule is a run once rule and should now be removed from the database as it has run
                               //  Once confirmed removed from the db, needToRemove can be set
  std::string ruleName="";
  bool enabled=true; //Whether this rule is enabled or not
  bool localOnlyRule=false; //If true, this is a locally generated test rule that shouldn't sync to the database
  time_t lastModified=-1; //When this rule was last modified (For syncing to the database)
  time_t lastRuntime=-1; //Stores the UnixTS of the last time the rile has been run. -1 is used to indicate the Rule hasn ever been run.
  time_t nextRuntime=-1; //Used to indicate the next time this rule should be run in UnixTS format.
  time_t lastRuntimeDb=-1; //The last run time that we have from the database, if local lastruntime is higher we should update the database
  time_t nextRuntimeDb=-1; //The next run time that we have from the database, if local nextruntime is lower we should update the database
  Rule();
  Rule(int32_t ruleId, std::string ruleName, std::string deviceId, int16_t portId, int32_t deviceType, int32_t ruleType, bool enabled, bool localOnlyRule, time_t lastModified, time_t lastRuntime, time_t nextRuntime, time_t lastRuntimeDb, time_t nextRuntimeDb);
  ~Rule();
  bool isRecurring(); //Returns true if this rule is recurring
};

#ifdef DEBUG
static pthread_mutexattr_t gerrorcheckmutexattr;

static pthread_mutex_t gmutex;
static pthread_mutex_t gmutex_waitforresponse;
static pthread_mutex_t gmutex_detectingdevice;
#else
static pthread_mutex_t gmutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t gmutex_waitforresponse = PTHREAD_MUTEX_INITIALIZER; //Locked when we are waiting for a response from a device
static pthread_mutex_t gmutex_detectingdevice = PTHREAD_MUTEX_INITIALIZER; //Locked when we are detecting an device
#endif

//ruleid, rule class
static std::map<uint32_t, Rule> grules;

static sem_t gmainthreadsleepsem; //Used for main thread sleeping

static int ginuse=0; //Only shutdown when inuse = 0
static int gshuttingdown=0;

static char gneedtoquit=0; //Set to 1 when ruleslib should exit

static pthread_t gmainthread=0;

static bool gneedmoreinfo=false; //Set to false when a device needs more info to indicate that we shouldn't sleep for very long

//global iface pointers set once for improved performance compared to for every function that uses it,
//  as the pointer value shouldn't change apart from during init/shutdown stage
static const cmdserverlib_ifaceptrs_ver_2_t *cmdserverlibifaceptr;
static const dblib_ifaceptrs_ver_1_t *dblibifaceptr;
static const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr;
static const zigbeelib_ifaceptrs_ver_2_t *zigbeelibifaceptr;

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
    "cmdserverlib",
    nullptr,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_1,
    1
  },
  {
    "zigbeelib",
    nullptr,
    ZIGBEELIBINTERFACE_VER_2,
    0,
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t gmoduleinfo_ver_1={
  MODULEINFO_VER_1,
  "ruleslib",
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

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey;

//Initialise a thread local store for the lock counter
static void makelockkey(void) {
  int result;

  result=pthread_key_create(&lockkey, nullptr);
  if (result!=0) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __PRETTY_FUNCTION__, pthread_self(), result);
  } else {
    havelockkey=1;
  }
}

/*
  Apply the mutex lock if not already applied otherwise increment the lock count
*/
static void lockthislib(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();
  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    //Allocate storage for the lock counter and set to 0
    try {
      lockcnt=new long[1];
    } catch (std::bad_alloc& e) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Unable to allocate ram for lockcnt\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
      return;
    }
    *lockcnt=0;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    PTHREAD_LOCK(&gmutex);
  }
  //Increment the lock count
  ++(*lockcnt);
#ifdef LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the mutex lock
*/
static void unlockthislib(void) {
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __PRETTY_FUNCTION__, pthread_self());
    thislib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    PTHREAD_UNLOCK(&gmutex);
  }
#ifdef LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    delete[] lockcnt;
    lockcnt=nullptr;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

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
  int val;

  lockthislib();
  val=_getneedmoreinfo();
  unlockthislib();

  return val;
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
  lockthislib();
  _setneedmoreinfo(needmoreinfo);
  unlockthislib();
}


//----------------------
//Class/Struct functions
//----------------------

Rule::Rule() {
  //Do nothing at the moment
}

Rule::Rule(int32_t ruleId, std::string ruleName, std::string deviceId, int16_t portId, int32_t deviceType, int32_t ruleType, bool enabled, bool localOnlyRule, time_t lastModified=-1, time_t lastRuntime=-1, time_t nextRuntime=-1, time_t lastRuntimeDb=-1, time_t nextRuntimeDb=-1) {
  this->ruleId=ruleId;
  this->ruleName=ruleName;
  this->deviceId=deviceId;
  this->portId=portId;
  this->deviceType=deviceType;
  this->ruleType=ruleType;
  this->enabled=enabled;
  this->localOnlyRule=localOnlyRule;
  this->lastModified=lastModified;
  this->lastRuntime=lastRuntime;
  this->nextRuntime=nextRuntime;
  this->lastRuntimeDb=lastRuntimeDb;
  this->nextRuntimeDb=nextRuntimeDb;
}

Rule::~Rule() {
  //Do nothing at the moment
}
bool Rule::isRecurring() {
  switch (this->ruleType) {
    case RULETYPES::TURN_ON_RECURRING:
    case RULETYPES::TURN_OFF_RECURRING:
      return true;
  }
  return false;
}

//----------------------

/*
 * Process the rules one by one
 */
static void process_rules() {
  time_t currenttime;
  struct timespec curtime;
  struct tm curtimelocaltm, *curtimelocaltmptr;

  // Get the current time
  clock_gettime(CLOCK_REALTIME, &curtime);
  currenttime=curtime.tv_sec;

  // Get the current local time split out into individual fields
  curtimelocaltmptr=localtime_r(&currenttime, &curtimelocaltm);
  if (curtimelocaltmptr==nullptr) {
    debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Unable to get current local time\n", __PRETTY_FUNCTION__);
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Current time: %02d:%02d:%02d\n", __PRETTY_FUNCTION__, curtimelocaltm.tm_hour, curtimelocaltm.tm_min, curtimelocaltm.tm_sec);

  //Process the rules all within a lock so retrieval of new rules doesn't corrupt the list
  lockthislib();
  for (auto &rulesit : grules) {
    debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Checking rule: %s(%d)\n", __PRETTY_FUNCTION__, rulesit.second.ruleName.c_str(), rulesit.second.ruleId);
    if (!rulesit.second.enabled || rulesit.second.needToRemove || rulesit.second.needToRemoveInDb) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   Not enabled or need to remove so ignoring\n", __PRETTY_FUNCTION__);
      continue;
    }
    if (currenttime<rulesit.second.nextRuntime) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   Running in %d seconds\n", __PRETTY_FUNCTION__, rulesit.second.nextRuntime-currenttime);
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   Running\n", __PRETTY_FUNCTION__);
      if (rulesit.second.deviceType==DEVICETYPES::ZIGBEE_DEVICE) {
        //Apply the rule to a zigbee device
        if (!zigbeelibifaceptr) {
          debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:   Zigbee Library currently not available\n", __PRETTY_FUNCTION__);
          continue;
        }
        uint64_t addr;
        int result=0;
        sscanf(rulesit.second.deviceId.c_str(), "%" SCNx64, &addr);
        if (rulesit.second.ruleType==RULETYPES::TURN_OFF_ONCE_ONLY || rulesit.second.ruleType==RULETYPES::TURN_OFF_RECURRING) {
          result=zigbeelibifaceptr->highlevel_set_onoff_zigbee_device(addr, rulesit.second.portId, *zigbeelibifaceptr->HIGH_LEVEL_OFF);
        } else {
          result=zigbeelibifaceptr->highlevel_set_onoff_zigbee_device(addr, rulesit.second.portId, *zigbeelibifaceptr->HIGH_LEVEL_ON);
        }
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:  Result=%d\n", __PRETTY_FUNCTION__, result);
      }
      rulesit.second.lastModified=currenttime;
      rulesit.second.lastRuntime=currenttime;
      if (!rulesit.second.isRecurring()) {
        if (rulesit.second.localOnlyRule) {
          rulesit.second.needToRemove=true;
        } else {
          rulesit.second.needToRemoveInDb=true;
        }
        debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG:  Rule has now been scheduled to be deleted\n", __PRETTY_FUNCTION__);
      }
    }
  }
  unlockthislib();
}

/*
 * Remove rules that have been scheduled to be deleted
 */
static void remove_scheduled_to_delete_rules() {
  lockthislib();

  //NOTE: We need to use a list to remove the rules as otherwise the main for loop may get confused if we remove items from underneath it
  auto rulesitbegin=grules.begin();
  auto rulesitend=grules.end();
  std::list< std::map<uint32_t, Rule>::iterator > rules_to_remove;
  for (auto &it=rulesitbegin; it!=rulesitend; it++) {
    if (it->second.needToRemove) {
      debuglibifaceptr->debuglib_printf(1, "%s: Removing rule: %s\n", __PRETTY_FUNCTION__, it->second.ruleName.c_str());
      rules_to_remove.push_back(it);
    }
  }
  for (auto const &it : rules_to_remove) {
    grules.erase(it);
  }
  unlockthislib();
}

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
  //rule::rule(int32_t ruleId, std::string ruleName, std::string deviceId, int32_t deviceType, int32_t ruleType, bool enabled, bool localOnlyRule, time_t lastModified=-1, time_t lastRuntime=-1, time_t nextRuntime=-1, time_t lastRuntimeDb=-1, time_t nextRuntimeDb=-1) {
  if (buffertokens[0]=="addlocaltestrule") {
    if (buffertokens.size()==7) {
      //Format: addrule ruleName deviceId portId deviceType ruleType numberOfSecondsUntilRun
      //Adds a local only non-recurring test rule
      //ruleName shouldn't have spaces
      //deviceType can currently be the following values: zigbee
      //ruleType can currently be the following values: on, off
      int32_t ruleId=-1; //Hard coded to -1 for now as this is just a test command
      std::string ruleName=buffertokens[1];
      std::string deviceId=buffertokens[2];
      int16_t portId;
      int32_t deviceType;
      int32_t ruleType;
      time_t nextRuntime;
      struct timespec curtime;

      sscanf(buffertokens[3].c_str(), "%" SCNd16, &portId);
      clock_gettime(CLOCK_REALTIME, &curtime);
      if (buffertokens[4]=="zigbee") {
        deviceType=DEVICETYPES::ZIGBEE_DEVICE;
      }
      if (buffertokens[5]=="on") {
        ruleType=RULETYPES::TURN_ON_ONCE_ONLY;
      } else if (buffertokens[5]=="off") {
        ruleType=RULETYPES::TURN_OFF_ONCE_ONLY;
      }
      sscanf(buffertokens[6].c_str(), "%ld", &nextRuntime);
      nextRuntime+=curtime.tv_sec;

      std::ostringstream ostream;
      ostream << "Adding local rule: " << buffertokens[1] << " for type: " << buffertokens[3] << " to set device: " << buffertokens[2] << " " << " port: " << buffertokens[3] << " " << buffertokens[5] << " and to enable in " << buffertokens[6] << " seconds" << std::endl;
      cmdserverlibifaceptr->netputs(ostream.str().c_str(), clientsock, NULL);
      Rule localrule(ruleId, ruleName, deviceId, portId, deviceType, ruleType, true, true, curtime.tv_sec, -1, nextRuntime);
      lockthislib();
      grules[ruleId]=localrule;
      unlockthislib();
      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    } else {
      cmdserverlibifaceptr->netputs("Incorrect number arguments to addlocaltestrule\n", clientsock, NULL);
      return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
    }
  } else {
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

/*
  Main thread loop that manages operation of rules
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *mainloop(void *UNUSED(val)) {
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);

    if (getneedtoquit()) {
      break;
    }
    process_rules();
    remove_scheduled_to_delete_rules();

    //Only sleep for one second as we need to handle timeouts ourselves
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
    setneedmoreinfo(false);

#ifdef MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Sleeping\n", __PRETTY_FUNCTION__);
#endif
    sem_timedwait(&gmainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return (void *) 0;
}

static void setneedtoquit(bool val) {
  lockthislib();
  gneedtoquit=val;
  sem_post(&gmainthreadsleepsem);
  unlockthislib();
}

static bool getneedtoquit(void) {
  int val;

  lockthislib();
  val=gneedtoquit;
  unlockthislib();

  return val;
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
  zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_2));

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
  if (sem_init(&gmainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __PRETTY_FUNCTION__);
    return -2;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&gerrorcheckmutexattr);
  pthread_mutexattr_settype(&gerrorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&gmutex, &gerrorcheckmutexattr);
  pthread_mutex_init(&gmutex_waitforresponse, &gerrorcheckmutexattr);
  pthread_mutex_init(&gmutex_detectingdevice, &gerrorcheckmutexattr);
#endif

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
  grules.clear();

  sem_destroy(&gmainthreadsleepsem);

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&gmutex);
  pthread_mutex_destroy(&gmutex_waitforresponse);
  pthread_mutex_destroy(&gmutex_detectingdevice);

  pthread_mutexattr_destroy(&gerrorcheckmutexattr);
#endif
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

extern moduleinfo_ver_generic_t *ruleslib_getmoduleinfo();

}

extern moduleinfo_ver_generic_t *ruleslib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &ruleslib::gmoduleinfo_ver_1;
}

#ifdef __ANDROID__

//JNI Exports
extern "C" {
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_RulesLib_jnigetmodulesinfo( JNIEnv* env, jobject obj);
}

JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_RulesLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) ruleslib_getmoduleinfo());
}
#endif
