/*
Title: Thread Lock Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for providing locking with possible debugging
Copyright: Capsicum Corporation 2016

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

#include <cstring>
#include <pthread.h>
#include <map>
#include <string>
#include <sstream>
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "modules/commonlib/commonlib.h"
#include "locklib.h"
#include "locklibpriv.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"

typedef struct lockinfo lockinfo_t;
struct lockinfo {
  std::string mutexname; //Friendly name of the mutex being locked
  std::string filename; //Name of the file that triggered the lock
  std::string funcname; //Name of the function that triggered the lock
  int lineno; //The line number that triggered the lock
};

//thread_id, mutex, lockinfo
std::map<unsigned long int, std::map<pthread_mutex_t *, lockinfo_t > > glockinfomap;

static pthread_mutex_t locklibmutex = PTHREAD_MUTEX_INITIALIZER;

static int locklib_inuse=0; //Only shutdown when inuse = 0
static int locklib_shuttingdown=0;

//Function Declarations
int locklib_pthread_mutex_lock(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno);
int locklib_pthread_mutex_unlock(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno);

//JNI Exports
#ifdef __ANDROID__
extern "C" {
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_LockLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
}
#endif

//Module Interface Definitions

#define DEBUGLIB_DEPIDX 0
#define CMDSERVERLIB_DEPIDX 1
#define COMMONSERVERLIB_DEPIDX 2

static locklib_ifaceptrs_ver_1_t locklib_ifaceptrs_ver_1={
  locklib_pthread_mutex_lock,
  locklib_pthread_mutex_unlock
};

static moduleiface_ver_1_t locklib_ifaces[]={
  {
    &locklib_ifaceptrs_ver_1,
    LOCKLIBINTERFACE_VER_1
  },
  {
    nullptr, 0
  }
};

static moduledep_ver_1_t locklib_deps[]={
  {
    "debuglib",
    nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "cmdserverlib",
    nullptr,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "commonserverlib",
    nullptr,
    COMMONSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    nullptr, nullptr, 0, 0
  }
};

moduleinfo_ver_1_t locklib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "locklib",
  locklib_init,
  locklib_shutdown,
  nullptr,
  nullptr,
  locklib_register_listeners,
  locklib_unregister_listeners,
  (moduleiface_ver_1_t (* const)[]) &locklib_ifaces,
  (moduledep_ver_1_t (*)[]) &locklib_deps
};

//Lock a mutex and store info about the current locking thread in a map
//Can detect deadlocks as well, but won't stop them
//Returns result of pthread_mutex_lock
int locklib_pthread_mutex_lock(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  pthread_t pthread_id;
  int result=0;
  lockinfo_t lockinfo;

  pthread_id=pthread_self();
  pthread_mutex_lock(&locklibmutex);
  try {
    lockinfo=glockinfomap.at(pthread_id).at(mutex);
    debuglibifaceptr->debuglib_printf(1, "%s: DEADLOCK: Trying to lock mutex: %s from file: %s, function: %s, line: %d when already locked from file: %s, function: %s, line: %d\n", __func__, mutexname, filename, funcname, lineno, lockinfo.filename.c_str(), lockinfo.funcname.c_str(), lockinfo.lineno);
  } catch (std::out_of_range& e) {
    //Store info about the source of the lock
    lockinfo.mutexname=mutexname;
    lockinfo.filename=filename;
    lockinfo.funcname=funcname;
    lockinfo.lineno=lineno;
    glockinfomap[pthread_id][mutex]=lockinfo;
  }
  pthread_mutex_unlock(&locklibmutex);

#ifdef LOCKLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Locking mutex: %s from file: %s, function: %s, line: %d\n", __func__, mutexname, filename, funcname, lineno);
#endif

  result=pthread_mutex_lock(mutex);

  return result;
}

//Unlock a mutex and remove info about the current locking thread in a map
//Can detect if not already in a lock
//Returns result of pthread_mutex_unlock
int locklib_pthread_mutex_unlock(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  pthread_t pthread_id;
  int result=0;
  lockinfo_t lockinfo;

  pthread_id=pthread_self();
  pthread_mutex_lock(&locklibmutex);
  try {
    lockinfo=glockinfomap.at(pthread_id).at(mutex);
    glockinfomap.at(pthread_id).erase(mutex);
    if (glockinfomap.at(pthread_id).size()==0) {
      glockinfomap.erase(pthread_id);
    }
  } catch (std::out_of_range& e) {
    debuglibifaceptr->debuglib_printf(1, "%s: MISMATCH: Trying to unlock mutex: %s from file: %s, function: %s, line: %d when never locked\n", __func__, mutexname, filename, funcname, lineno);
  }
  pthread_mutex_unlock(&locklibmutex);

#ifdef LOCKLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Unlocking mutex: %s from file: %s, function: %s, line: %d\n", __func__, mutexname, filename, funcname, lineno);
#endif

  result=pthread_mutex_unlock(mutex);

  return result;
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int locklib_processcommand(const char *buffer, int clientsock) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) locklib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  size_t len;
  std::string tmpstring;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  len=strlen(buffer);
  if (strncmp(buffer, "locklib_getlocks", 12)==0) {
    int lockcnt=0;
    pthread_mutex_lock(&locklibmutex);
    for (auto const& gmutexit : glockinfomap) {
      for (auto const& glockinfoit : gmutexit.second) {
        std::ostringstream tmpostream;

        tmpostream << "Lock by mutex: " << glockinfoit.second.mutexname << " from file: " << glockinfoit.second.filename << ", function: " << glockinfoit.second.funcname << ", line: " << glockinfoit.second.lineno << std::endl;
        commonserverlibifaceptr->serverlib_netputs(tmpostream.str().c_str(), clientsock, NULL);
        ++lockcnt;
      }
    }
    pthread_mutex_unlock(&locklibmutex);
    std::ostringstream tmpostream;
    tmpostream << "Total number of locks: " << lockcnt << std::endl;
    commonserverlibifaceptr->serverlib_netputs(tmpostream.str().c_str(), clientsock, NULL);
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  return CMDLISTENER_NOERROR;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int locklib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (locklib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __func__);
    return -1;
  }
  ++locklib_inuse;
  if (locklib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, locklib_inuse);
    return -1;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void locklib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (locklib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --locklib_inuse;
  if (locklib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, locklib_inuse);
    return;
  }
  //Start shutting down library
  locklib_shuttingdown=1;

  glockinfomap.clear();

  locklib_shuttingdown=0;

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for zigbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void locklib_register_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) locklib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(locklib_processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for zigbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void locklib_unregister_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) locklib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) locklib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(locklib_processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *locklib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &locklib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_LockLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) locklib_getmoduleinfo();
}
#endif
