/*
Title: Configuration Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides interfaces to load configuration items from a file.
Copyright: Capsicum Corporation 2010-2019

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

#ifndef __ANDROID__
#include "config.h"
#include <execinfo.h>
#else
#include "android_config.h"
#endif
#include <boost/config.hpp>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>
#include <algorithm>
#include <list>
#include <map>
#include <string>
#include <stdexcept>
#include <boost/thread/lock_guard.hpp>
#include <boost/thread/recursive_mutex.hpp>
#include <boost/atomic/atomic.hpp>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "configlib.hpp"
#include "main/mainlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"

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

static boost::recursive_mutex configlibBoostMutex;

static boost::atomic<int> configloaded(0);
static boost::atomic<int> configloadpending(0);
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
		return 0;
  }
	cfgfilename="";
	configloaded.store(0);
	configloadpending.store(0);
  cfgfileitems.clear();

  post_listener_func_ptrs.clear();

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
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
	--configlib_inuse;
	if (configlib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, configlib_inuse);
		return;
	}
	//No longer in use
  post_listener_func_ptrs.clear();

	configloadpending.store(0);
	configloaded.store(0);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register a listener for when the config library is finished reading the config file
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int configlib_register_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr) {
  {
    boost::lock_guard<boost::recursive_mutex> guard(configlibBoostMutex);

    if (configlib_inuse==0) {
      return -1;
    }
    post_listener_func_ptrs.push_back(funcptr);
  }
  return 0;
}

/*
  Unregister a listener for when the config library is finished reading the config file
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int configlib_unregister_readcfgfile_post_listener(readcfgfile_post_func_ptr_t funcptr) {
  {
    boost::lock_guard<boost::recursive_mutex> guard(configlibBoostMutex);

    if (configlib_inuse==0) {
      return -1;
    }
    std::list<readcfgfile_post_func_ptr_t>::iterator posit=std::find(post_listener_func_ptrs.begin(), post_listener_func_ptrs.end(), funcptr);
    if (posit != post_listener_func_ptrs.end()) {
      post_listener_func_ptrs.erase(posit);
      return 0;
    } else {
      return -1;
    }
  }
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
  {
    boost::lock_guard<boost::recursive_mutex> guard(configlibBoostMutex);

    if (configlib_inuse==0) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s, not initialised\n", __func__);
      return -1;
    }
    if (cfgfilename=="") {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s, config filename not configured\n", __func__);
      return -1;
    }
    configloadpending.store(0);
    mainlibifaceptr->newdescriptorlock();
    int cfgfilefd=commonlibifaceptr->open_with_cloexec(cfgfilename.c_str(), O_RDONLY);
    mainlibifaceptr->newdescriptorunlock();
    if (cfgfilefd<0) {
      configloadpending.store(1);
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, cfgfilename.c_str());
      return -1;
    }
    file=fdopen(cfgfilefd, "rb");
    if (file == NULL) {
      configloadpending.store(1);
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, cfgfilename.c_str());
      return -1;
    }
    linebuf=(char *) malloc(BUFFER_SIZE*sizeof(char));
    if (!linebuf) {
      fclose(file);
      configloadpending.store(1);
      debuglibifaceptr->debuglib_printf(1, "%s: Not enough memory to load configuration\n", __func__);
      return -2;
    }
    if (abort==1) {
      fclose(file);
      free(linebuf);
      configloadpending.store(1);
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

    configloadpending.store(0);
    configloaded.store(1);

    configlib_call_readcfgfile_post_listeners();
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Returns 1 if the configuration has been loaded at least once or 0 if not.
*/
int configlib_isloaded() {
  return configloaded.load();
}

/*
  Returns 1 if the configuration attempted to load but failed, 0 if not.
*/
static int configlib_loadpending() {
  return configloadpending.load();
}

/*
  Cancel a previous pending load attempt
*/
static void configlib_cancelpendingload() {
  configloadpending.store(0);
}

/*
  C++ version: Get a value from the configuration
  Returns true on success and value contains the value or false on failure and value is unchanged
*/
bool configlib_getnamevalue_cpp(const std::string &block, const std::string &name, std::string &value) {
  std::string tmpvalue;
	try {
	  {
	    boost::lock_guard<boost::recursive_mutex> guard(configlibBoostMutex);

	    if (!configloaded) {
	      throw std::runtime_error("Config not loaded");
	    }
	    tmpvalue=cfgfileitems.at(block).at(name);
	  }
	} catch (std::exception& e) {
		return false;
	}
  value=tmpvalue;

  return true;
}

/*
  C version: Get a value from the configuration
  Returns the value on success or NULL on failure
  NOTE: If non-null is returned you must run free on the value when finished
*/
char *configlib_getnamevalue_c(const char *block, const char *name) {
	char *valuestr=nullptr;
	std::string tmpblock=block, tmpname=name, tmpvalue;

	if (configlib_getnamevalue_cpp(tmpblock, tmpname, tmpvalue)==true) {
	  valuestr=strdup(tmpvalue.c_str());
	}
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
