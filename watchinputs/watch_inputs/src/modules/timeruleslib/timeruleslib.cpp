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
#include <list>
#include <map>
#include <string>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "timeruleslib.hpp"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"

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

static int timeruleslib_inuse=0; //Only shutdown when inuse = 0

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

//block , name, value
//static std::map<std::string, std::map<std::string, std::string> > cfgfileitems;

//Function Declarations
int timeruleslib_init(void);
void timeruleslib_shutdown(void);

int timeruleslib_setrulesfilename(const char *rulefile);
int timeruleslib_readrulesfile();
int timeruleslib_isloaded();

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
    nullptr, nullptr, 0, 0
  }
};

moduleinfo_ver_1_t timeruleslib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "timeruleslib",
  timeruleslib_init,
  timeruleslib_shutdown,
	nullptr,
	nullptr,
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
static void timeruleslib_makelockkey() {
  (void) pthread_key_create(&lockkey, NULL);
}

/*
  Apply the timeruleslib mutex lock if not already applied otherwise increment the lock count
*/
void timeruleslib_lockconfig() {
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
void timeruleslib_unlockconfig() {
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
  Initialise the timerules library
  Returns 0 for success or other value on error
//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
int timeruleslib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	++timeruleslib_inuse;
	if (timeruleslib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, timeruleslib_inuse);
    pthread_mutex_unlock(&timeruleslibmutex);
		return 0;
  }
  rulesfilename="";
  rulesloaded=0;
  rulesloadpending=0;
  //rulefileitems.clear();

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
void timeruleslib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) timeruleslib_deps[DEBUGLIB_DEPIDX].ifaceptr;

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
	rulesloadpending=0;
	rulesloaded=0;

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&timeruleslibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Set the current config filename
//Returns 0 if success or non-zero on error
int timeruleslib_setrulesfilename(const char *rulesfile) {
	rulesfilename=rulesfile;

	return 0;
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
  FILE *file;
  char *linebuf;
  int abort=0;
  std::string curblock="<global>"; //If we see an item outside of a block put it in block: <global>

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  timeruleslib_lockconfig();
	if (timeruleslib_inuse==0) {
    timeruleslib_unlockconfig();
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, not initialised\n", __func__);
		return -1;
	}
	if (rulesfilename=="") {
    timeruleslib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, config filename not configured\n", __func__);
    return -1;
  }
  rulesloadpending=0;
  file=fopen(rulesfilename.c_str(), "rb");
  if (file == NULL) {
    rulesloadpending=1;
    timeruleslib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, rulesfilename.c_str());
    return -1;
  }
  linebuf=(char *) malloc(BUFFER_SIZE*sizeof(char));
  if (!linebuf) {
    fclose(file);
    rulesloadpending=1;
    timeruleslib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Not enough memory to load configuration\n", __func__);
    return -2;
  }
  if (abort==1) {
    fclose(file);
    free(linebuf);
    rulesloadpending=1;
    timeruleslib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Configuration load aborted due to error\n", __func__);
    return -3;
  }
  //rulesfileitems.clear();
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
		//rulesfileitems[curblock][linebuf]=value;
	}
  fclose(file);
  free(linebuf);
	linebuf=NULL;

  rulesloadpending=0;
  rulesloaded=1;

  timeruleslib_unlockconfig();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Returns 1 if the rules have been loaded at least once or 0 if not.
*/
int timeruleslib_isloaded() {
  int val;

  timeruleslib_lockconfig();
  val=rulesloaded;
  timeruleslib_unlockconfig();

  return val;
}

/*
  Returns 1 if the rules attempted to load but failed, 0 if not.
*/
static int timeruleslib_loadpending() {
  int val;

  timeruleslib_lockconfig();
  val=rulesloadpending;
  timeruleslib_unlockconfig();

  return val;
}

/*
  Cancel a previous pending load attempt
*/
static void timeruleslib_cancelpendingload() {
  timeruleslib_lockconfig();
  rulesloadpending=0;
  timeruleslib_unlockconfig();
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
