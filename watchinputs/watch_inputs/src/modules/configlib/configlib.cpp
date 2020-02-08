/*
Title: Configuration Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides interfaces to load configuration items from a file.
Copyright: Capsicum Corporation 2010-2016

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

//TODO: shutdown should lock so config load finishes before shutting down
//TODO: Implement reload command

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
#include <fcntl.h>
#include <algorithm>
#include <list>
#include <map>
#include <string>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "configlib.hpp"
#include "main/mainlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"

#ifdef DEBUG
#pragma message("CONFIGLIB_PTHREAD_LOCK and CONFIGLIB_PTHREAD_UNLOCK debugging has been enabled")
#include <errno.h>
#define CONFIGLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    configlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    configlib_backtrace(); \
  } \
}

#define CONFIGLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    configlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    configlib_backtrace(); \
  } \
}

#else

#define CONFIGLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define CONFIGLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef CONFIGLIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
  #define LOCKDEBUG_EXITINGFUNC() { }
  #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif


#ifdef CONFIGLIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef CONFIGLIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef CONFIGLIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef CONFIGLIB_MOREDEBUG
#define INLINE
#else
#define INLINE inline
#endif

#define BUFFER_SIZE 1024

static int configlib_inuse=0; //Only shutdown when inuse = 0

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

STATIC pthread_mutex_t configlibmutex;
#else
static pthread_mutex_t configlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif
static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;

static int configloaded=0;
static int configloadpending=0;
static std::string cfgfilename="";

//Lists
static std::list<readcfgfile_post_func_ptr_t> post_listener_func_ptrs; //A list of readcfgfile post listener functions

//block , name, value
static std::map<std::string, std::map<std::string, std::string> > cfgfileitems;

//Function Declarations
int configlib_init(void);
void configlib_shutdown(void);

int configlib_register_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr);
int configlib_unregister_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr);
int configlib_setcfgfilename(const char *cfgfile);
int configlib_readcfgfile();
int configlib_isloaded();
static int configlib_loadpending();
char *configlib_getnamevalue_c(const char *block, const char *name);

bool configlib_getnamevalue_cpp(const std::string &block, const std::string &name, std::string &value);

//C Exports
extern "C" {

BOOST_SYMBOL_EXPORT moduleinfo_ver_generic_t *configlib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_ConfigLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
#endif
}

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define COMMONLIB_DEPIDX 1
#define MAINLIB_DEPIDX 2

static configlib_ifaceptrs_ver_1_t configlib_ifaceptrs_ver_1={
  configlib_register_readcfgfile_post_listener,
  configlib_unregister_readcfgfile_post_listener,
  configlib_setcfgfilename,
  configlib_readcfgfile,
  configlib_isloaded,
  configlib_getnamevalue_c
};

static configlib_ifaceptrs_ver_2_t configlib_ifaceptrs_ver_2={
  configlib_register_readcfgfile_post_listener,
  configlib_unregister_readcfgfile_post_listener,
  configlib_setcfgfilename,
  configlib_readcfgfile,
  configlib_isloaded,
  configlib_loadpending,
  configlib_getnamevalue_c
};

static configlib_ifaceptrs_ver_1_cpp_t configlib_ifaceptrs_ver_1_cpp={
  configlib_register_readcfgfile_post_listener,
  configlib_unregister_readcfgfile_post_listener,
  configlib_setcfgfilename,
  configlib_readcfgfile,
  configlib_isloaded,
  configlib_getnamevalue_c,
  configlib_getnamevalue_cpp
};

static configlib_ifaceptrs_ver_2_cpp_t configlib_ifaceptrs_ver_2_cpp={
  configlib_register_readcfgfile_post_listener,
  configlib_unregister_readcfgfile_post_listener,
  configlib_setcfgfilename,
  configlib_readcfgfile,
  configlib_isloaded,
  configlib_loadpending,
  configlib_getnamevalue_c,
  configlib_getnamevalue_cpp
};

static moduleiface_ver_1_t configlib_ifaces[]={
  {
    &configlib_ifaceptrs_ver_1,
    CONFIGLIBINTERFACE_VER_1
  },
  {
    &configlib_ifaceptrs_ver_2,
    CONFIGLIBINTERFACE_VER_2
  },
  {
    &configlib_ifaceptrs_ver_1_cpp,
    CONFIGLIBINTERFACECPP_VER_1
  },
  {
    &configlib_ifaceptrs_ver_2_cpp,
    CONFIGLIBINTERFACECPP_VER_2
  },
  {
    nullptr, 0
  }
};

moduledep_ver_1_t configlib_deps[]={
  {
    "debuglib",
		nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
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

moduleinfo_ver_1_t configlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "configlib",
  configlib_init,
  configlib_shutdown,
	nullptr,
	nullptr,
	nullptr,
	nullptr,
  (moduleiface_ver_1_t (* const)[]) &configlib_ifaces,
  (moduledep_ver_1_t (*)[]) &configlib_deps
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
STATIC INLINE void configlib_backtrace(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
STATIC INLINE void configlib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

//Initialise a thread local store for the lock counter
static void configlib_makelockkey(void) {
  (void) pthread_key_create(&lockkey, NULL);
}

/*
  Apply the configlib mutex lock if not already applied otherwise increment the lock count
*/
void configlib_lockconfig() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, configlib_makelockkey);

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
    CONFIGLIB_PTHREAD_LOCK(&configlibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef CONFIGLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the configlib mutex lock
*/
void configlib_unlockconfig() {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, configlib_makelockkey);

  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    //configlib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    CONFIGLIB_PTHREAD_UNLOCK(&configlibmutex);
  }
#ifdef CONFIGLIB_LOCKDEBUG
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
  Initialise the config library
  Returns 0 for success or other value on error
//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
int configlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	++configlib_inuse;
	if (configlib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, configlib_inuse);
    pthread_mutex_unlock(&configlibmutex);
		return 0;
  }
	cfgfilename="";
	configloaded=0;
	configloadpending=0;
  cfgfileitems.clear();

  post_listener_func_ptrs.clear();

#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&configlibmutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}


//Shutdown the config library
//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void configlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (configlib_inuse==0) {
    //Already uninitialised
    pthread_mutex_unlock(&configlibmutex);
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
	--configlib_inuse;
	if (configlib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, configlib_inuse);
		pthread_mutex_unlock(&configlibmutex);
		return;
	}
	//No longer in use
  post_listener_func_ptrs.clear();

	configloadpending=0;
	configloaded=0;

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&configlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register a listener for when the config library is finished reading the config file
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int configlib_register_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr) {
  configlib_lockconfig();
  if (configlib_inuse==0) {
    configlib_unlockconfig();
    return -1;
  }
  post_listener_func_ptrs.push_back(funcptr);
  configlib_unlockconfig();

  return 0;
}

/*
  Unregister a listener for when the config library is finished reading the config file
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int configlib_unregister_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr) {
  bool found;
  int result;
  std::list<readcfgfile_post_func_ptr_t>::iterator posit;

  configlib_lockconfig();
  if (configlib_inuse==0) {
    configlib_unlockconfig();
    return -1;
  }
  posit=std::find(post_listener_func_ptrs.begin(), post_listener_func_ptrs.end(), funcptr);
  if (posit != post_listener_func_ptrs.end()) {
    post_listener_func_ptrs.erase(posit);
    result=0;
  } else {
    result=-1;
  }
  configlib_unlockconfig();

  return result;
}

/*
  Call all listeners for when the config library is finished reading the config file
  Input: none
  Returns: 0 if success or < 0 on error
*/
static int configlib_call_readcfgfile_post_listeners(void) {
	int result=0, listener_result=0;

  for (auto const &postlistenerfunc : post_listener_func_ptrs) {
    if (postlistenerfunc) {
      listener_result=postlistenerfunc();
      if (listener_result<0) {
        result=listener_result;
      }
    }
  }
	return result;
}

//Set the current config filename
//Returns 0 if success or non-zero on error
int configlib_setcfgfilename(const char *cfgfile) {
	cfgfilename=cfgfile;

	return 0;
}

/*
  Read in the configuration from a file.
  NOTE: This function has a lock around the entire operation so any functions called this function will only be called by
    one thread at a time.
  Input: cfgfile The name of the file to read
  Returns: 0 if success or non-zero on error.
*/
int configlib_readcfgfile(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) configlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonlib_ifaceptrs_ver_2_t *commonlibifaceptr=(commonlib_ifaceptrs_ver_2_t *) configlib_deps[COMMONLIB_DEPIDX].ifaceptr;
  mainlib_ifaceptrs_ver_2_t *mainlibifaceptr=(mainlib_ifaceptrs_ver_2_t *) configlib_deps[MAINLIB_DEPIDX].ifaceptr;
  FILE *file;
  char *linebuf;
  int abort=0;
  std::string curblock="<global>"; //If we see an item outside of a block put it in block: <global>

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  configlib_lockconfig();
	if (configlib_inuse==0) {
    configlib_unlockconfig();
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, not initialised\n", __func__);
		return -1;
	}
	if (cfgfilename=="") {
    configlib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, config filename not configured\n", __func__);
    return -1;
  }
  configloadpending=0;
  mainlibifaceptr->newdescriptorlock();
  int cfgfilefd=commonlibifaceptr->open_with_cloexec(cfgfilename.c_str(), O_RDONLY);
  mainlibifaceptr->newdescriptorunlock();
  if (cfgfilefd<0) {
    configloadpending=1;
    configlib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, cfgfilename.c_str());
    return -1;
  }
  file=fdopen(cfgfilefd, "rb");
  if (file == NULL) {
    configloadpending=1;
    configlib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, cfgfilename.c_str());
    return -1;
  }
  linebuf=(char *) malloc(BUFFER_SIZE*sizeof(char));
  if (!linebuf) {
    fclose(file);
    configloadpending=1;
    configlib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Not enough memory to load configuration\n", __func__);
    return -2;
  }
  if (abort==1) {
    fclose(file);
    free(linebuf);
    configloadpending=1;
    configlib_unlockconfig();
    debuglibifaceptr->debuglib_printf(1, "%s: Configuration load aborted due to error\n", __func__);
    return -3;
  }
  cfgfileitems.clear();
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
		cfgfileitems[curblock][linebuf]=value;
	}
  fclose(file);
  free(linebuf);
	linebuf=NULL;

  configloadpending=0;
  configloaded=1;

  configlib_call_readcfgfile_post_listeners();

  configlib_unlockconfig();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Returns 1 if the configuration has been loaded at least once or 0 if not.
*/
int configlib_isloaded() {
  int val;

  configlib_lockconfig();
  val=configloaded;
  configlib_unlockconfig();

  return val;
}

/*
  Returns 1 if the configuration attempted to load but failed, 0 if not.
*/
static int configlib_loadpending() {
  int val;

  configlib_lockconfig();
  val=configloadpending;
  configlib_unlockconfig();

  return val;
}

/*
  Cancel a previous pending load attempt
*/
static void configlib_cancelpendingload() {
  configlib_lockconfig();
  configloadpending=0;
  configlib_unlockconfig();
}

/*
  C++ version: Get a vslue from the configuration
  Returns true on success and value contains the value or false on failure and value is unchanged
*/
bool configlib_getnamevalue_cpp(const std::string &block, const std::string &name, std::string &value) {
  configlib_lockconfig();
	if (!configloaded) {
		configlib_unlockconfig();
		return false;
	}
	std::string tmpvalue;
	try {
		tmpvalue=cfgfileitems.at(block).at(name);
	} catch (std::exception& e) {
		configlib_unlockconfig();
		return false;
	}
	value=tmpvalue;
	configlib_unlockconfig();
	return true;
}

/*
  C version: Get a value from the configuration
  Returns the value on success or NULL on failure
  NOTE: If non-null is returned you must run free on the value when finished
*/
char *configlib_getnamevalue_c(const char *block, const char *name) {
	char *valuestr;
	std::string tmpblock, tmpname, tmpvalue;

	tmpblock=block;
	tmpname=name;
	if (configlib_getnamevalue_cpp(tmpblock, tmpname, tmpvalue)==false) {
		return nullptr;
	}
	valuestr=strdup(tmpvalue.c_str());

	return valuestr;
}

moduleinfo_ver_generic_t *configlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &configlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_ConfigLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) configlib_getmoduleinfo());
}
#endif
