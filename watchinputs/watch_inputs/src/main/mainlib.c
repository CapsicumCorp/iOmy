/*
Title: Watch Inputs Main Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Contains the main functions
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

*/

//NOTE: We use jlong for pointer passing to be compatible with 64-bit hosts
//NOTE: JNI doesn't like _ characters in the function names

//NOTE: POSIX_C_SOURCE is needed for the following
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>
#include <signal.h>
#include <dlfcn.h>
#include <sys/types.h>
#include <dirent.h>
#include <pthread.h>
#include <semaphore.h>
#include <time.h>
#include <unistd.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "watch_inputs.h"
#include "moduleinterface.h"
#include "mainlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/configlib/configlib.h"
#include "modules/timeruleslib/timeruleslib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/commonlib/commonlib.h"

#if defined(_WIN64) || defined(_WIN32) || defined(__CYGWIN__)
  #define LIBEXTENSION ".dll"
#else
  #define LIBEXTENSION ".so"
#endif

static int mainlib_inited=0; //Set to 1 when initialised, set to 0 when not initialised, set to 2 when shutting down

static int needtoquit;

//Settings relating to a loaded module
//Not marked as const as parts of the contents of each of these variables gets modified
typedef struct {
  void *dlhandle; //The module dl handle
  char *filename; //The module file name
  char depsresolved; //1=All required dependencies for this module have been resolved, 0=Some/All required dependencies haven't been resolved
  moduleinfo_ver_generic_t *moduleinfoptr; //Pointer to info about the module
} mainlib_module_t;

static int mainlib_nummodules=0;
static mainlib_module_t *mainlib_modules=NULL;

static pthread_t mainlib_sigprocthread;

static pthread_t gmainthread=0;
#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

static pthread_mutex_t mainlibmutex;
#else
static pthread_mutex_t mainlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static sem_t mainlib_mainthreadsleepsem; //Used for main thread sleeping

static int modulesinited=0;
static int listenersregistered=0;
static int modules_started=0;

//Function Declarations
int mainlib_init();
void mainlib_shutdown();
int mainlib_start(void);
void mainlib_stop(void);
void mainlib_cleanup();
static void mainlib_register_listeners(void);
static void mainlib_unregister_listeners(void);

void *mainlib_loadsymbol(const char *modulename, const char *symbolname);
int mainlib_loadmodulesymbol(void **symptr, const char *modulename, const char *symbolname);
int mainlib_loadcustommodulesymbol(void **symptr, const char *modulename, const char *symbolname);
const char *mainlib_getlastdlerror();
void mainlib_setneedtoquit(int val);
int mainlib_getneedtoquit();
static void *mainlib_MainThreadLoop(void *thread_val);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define COMMONSERVERLIB_DEPIDX 1
#define CMDSERVERLIB_DEPIDX 2
#define CONFIGLIB_DEPIDX 3
#define TIMERULESLIB_DEPIDX 4

static const mainlib_ifaceptrs_ver_1_t mainlib_ifaceptrs_ver_1={
  mainlib_loadsymbol,
  mainlib_loadmodulesymbol,
  mainlib_loadcustommodulesymbol
};

static const moduleiface_ver_1_t mainlib_ifaces[]={
  {
    &mainlib_ifaceptrs_ver_1,
    MAINLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduledep_ver_1_t mainlib_deps[]={
  {
    "debuglib",
    NULL,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "commonserverlib",
    NULL,
    COMMONSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "cmdserverlib",
    NULL,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "configlib",
    NULL,
    CONFIGLIBINTERFACE_VER_1,
    0
  },
  {
    "timeruleslib",
    NULL,
    TIMERULESLIBINTERFACE_VER_1,
    0
  },
  {
    NULL, NULL, 0, 0
  }
};

//mainlib_init and mainlib_shutdown are called outside of the normal init and shutdown functions
static const moduleinfo_ver_1_t mainlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "mainlib",
  NULL,
  NULL,
  NULL,
  NULL,
  mainlib_register_listeners,
  mainlib_unregister_listeners,
  &mainlib_ifaces,
  &mainlib_deps
};

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int mainlib_init() {
#ifdef DEBUG
#ifndef __ANDROID__
  printf("DEBUG: Entering %s\n", __func__);
#else
__android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Entering %s", __func__);
#endif
#endif
	if (mainlib_inited!=0) {
#ifdef DEBUG
		printf("DEBUG: Exiting mainlib_init: Already initialised\n");
#endif
		return mainlib_inited;
	}
  if (sem_init(&mainlib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
#ifdef DEBUG
#ifndef __ANDROID__
    printf("DEBUG: Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s: Can't initialise main thread sleep semaphore", __func__);
#endif
#endif
    return -1;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&mainlibmutex, &errorcheckmutexattr);
#endif

	mainlib_inited=1;

#ifdef DEBUG
#ifndef __ANDROID__
    printf("DEBUG: Exiting %s\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
#endif

	return 0;
}

#ifdef __ANDROID__
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jniinit( JNIEnv* env, jobject obj) {
  return mainlib_init();
}
#endif

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void mainlib_shutdown() {
  int i;

#ifdef DEBUG
#ifndef __ANDROID__
  printf("DEBUG: Entering %s\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Entering %s", __func__);
#endif
#endif
	if (mainlib_inited==0) {
#ifdef DEBUG
#ifndef __ANDROID__
		printf("DEBUG: Exiting %s\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
#endif
		return;
	}
	if (mainlib_modules) {
    for (i=0; i<mainlib_nummodules; i++) {
      if (mainlib_modules[i].dlhandle) {
#ifdef DEBUG
#ifndef __ANDROID__
        printf("DEBUG: %s: Unloading module: %s\n", __func__, mainlib_modules[i].filename);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: %s: Unloading module: %s", __func__);
#endif
#endif
        dlclose(mainlib_modules[i].dlhandle);
        mainlib_modules[i].dlhandle=0;
      }
      if (mainlib_modules[i].filename) {
        free(mainlib_modules[i].filename);
        mainlib_modules[i].filename=NULL;
      }
      mainlib_modules[i].moduleinfoptr=NULL;
    }
    free(mainlib_modules);
    mainlib_modules=NULL;
  }
  mainlib_nummodules=0;

  sem_destroy(&mainlib_mainthreadsleepsem);

  mainlib_inited=0;

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&mainlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif

#ifdef DEBUG
#ifndef __ANDROID__
  printf("DEBUG: Exiting %s\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
#endif
}

#ifdef __ANDROID__
void Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnishutdown( JNIEnv* env, jobject obj) {
  mainlib_shutdown();
}
#endif

/*
  Start the main library including starting of threads, etc.
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
int mainlib_start(void) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (!gmainthread) {
    result=pthread_create(&gmainthread, NULL, mainlib_MainThreadLoop, NULL);
    if (result!=0) {
      gmainthread=0;
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Failed to create main thread\n", __func__);
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

/*
  Stop the main library
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
void mainlib_stop(void) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  pthread_t tmpthread;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  }
  if (gmainthread) {
    tmpthread=gmainthread;
    if (debuglibifaceptr) {
      debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    }
    mainlib_setneedtoquit(1);
    if (debuglibifaceptr) {
      debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    }
    pthread_join(tmpthread, NULL);
    gmainthread=0;
  }
  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }
}

static int mainlib_ismoduleloaded(const char *modulename) {
  int i;

  //NOTE: If nummodules=0 then the for loop will be skipped so no need to check for NULL modulesinfo
  PTHREAD_LOCK(&mainlibmutex);
  for (i=0; i<mainlib_nummodules; i++) {
    if (strcmp(mainlib_modules[i].filename, modulename)==0) {
			PTHREAD_UNLOCK(&mainlibmutex);
			return 1;
		}
  }
  PTHREAD_UNLOCK(&mainlibmutex);

	return 0;
}

//Add a new module info to the modules array
//Returns 0 on success or negative value on error
static int _mainlib_addnewmodule(mainlib_module_t *module) {
  int i;
  mainlib_module_t *tmpptr;

  //Find a slot to store the module
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].filename) {
      break;
    }
  }
  if (i==mainlib_nummodules) {
    //Expand the array
    tmpptr=(mainlib_module_t *) realloc(mainlib_modules, (mainlib_nummodules+1)*sizeof(mainlib_module_t));
    if (tmpptr==NULL) {
      return -1;
    }
    mainlib_modules=tmpptr;
    ++mainlib_nummodules;
  }
  if (!module->filename) {
    //Use the name of the module as the filename
    if (module->moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
      moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) module->moduleinfoptr;
      if (moduleinfoptr->modulename) {
        module->filename=strdup(moduleinfoptr->modulename);
      }
    }
  }
  if (!module->filename) {
    return -2;
  }
  memcpy(&mainlib_modules[i], module, sizeof(mainlib_module_t));

  return 0;
}

#ifdef __ANDROID__
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jniaddnewmodule( JNIEnv* env, jobject obj, jlong jnimodule) {
  mainlib_module_t *module=(mainlib_module_t *) jnimodule;

  return _mainlib_addnewmodule(module);
}
#endif

//Remove a module from the modules array
//Returns 0 on success or negative value on error
static int _mainlib_deletemodule(int index) {
  if (index<0 || index>=mainlib_nummodules) {
    return -1;
  }
  if (mainlib_modules[index].dlhandle) {
#ifdef DEBUG
    printf("DEBUG: %s: Unloading module: %s\n", __func__, mainlib_modules[index].filename);
#endif
    dlclose(mainlib_modules[index].dlhandle);
    mainlib_modules[index].dlhandle=0;
  }
  if (mainlib_modules[index].filename) {
    free(mainlib_modules[index].filename);
    mainlib_modules[index].filename=NULL;
  }
  mainlib_modules[index].moduleinfoptr=NULL;

  return 0;
}

//Load a module
static int mainlib_loadmodule(const char *modulename) {
	size_t modulenamelen;
	char *tmpstr;
  mainlib_module_t module;
  moduleinfo_ver_generic_t *(*getmoduleinfo)();

  //Initialise module settings
  memset(&module, 0, sizeof(mainlib_module_t));

#ifdef DEBUG
		printf("DEBUG: Entering %s\n", __func__);
#endif
	//Check if module already loaded
  if (mainlib_ismoduleloaded(modulename)) {
#ifdef DEBUG
    printf("DEBUG: Exiting %s: %s already loaded\n", __func__, modulename);
#endif
    return 0;
  }
	//Load the requested module
	modulenamelen=strlen(modulename);
	tmpstr=(char *) malloc(strlen(modules_dir)+modulenamelen+30);
	if (tmpstr==NULL) {
    printf("Exiting %s: Can't allocate memory while loading module: %s from directory: %s\n", __func__, modulename, modules_dir);
		return -1;
	}
	sprintf(tmpstr, "%s/%s", modules_dir, modulename);
	module.dlhandle=dlopen(tmpstr, RTLD_NOW|RTLD_GLOBAL);
	if (module.dlhandle==NULL) {
    free(tmpstr);
		printf("%s: Failed to load module: %s from directory: %s, reason: %s\n", __func__, modulename, modules_dir, dlerror());
		return -2;
	}
	strcpy(tmpstr, modulename);

  //Load Version Specific Module Info if available
  strcpy(tmpstr+modulenamelen-(sizeof(LIBEXTENSION)-1), "_getmoduleinfo");
  getmoduleinfo=(moduleinfo_ver_generic_t *(*)()) dlsym(module.dlhandle, tmpstr);
  if (getmoduleinfo==NULL) {
    free(tmpstr);
    printf("DEBUG: %s: Failed to load module info from module: %s, reason: %s\n", __func__, modulename, dlerror());
    return -3;
  }
  free(tmpstr);
  module.moduleinfoptr=getmoduleinfo();
  if (!module.moduleinfoptr) {
    printf("DEBUG: %s: Warning: Failed to load module: %s, reason: Doesn't contain getmoduleinfo function\n", __func__, modulename);
    dlclose(module.dlhandle);
    return 0;
  }

	//Make sure mainlib is initialised
	if (mainlib_inited!=1) {
		if (mainlib_init()!=0) {
			printf("Exiting %s: Failed to initialise mainlib while loading module: %s from directory: %s\n", __func__, modulename, modules_dir);
			return -4;
		}
	}
	//Store the module info
	module.filename=strdup(modulename);
  if (_mainlib_addnewmodule(&module)!=0) {
    free(module.filename);
    printf("Exiting %s: Can't allocate memory while loading module: %s from directory: %s\n", __func__, modulename, modules_dir);
    return -5;
  }

#ifdef DEBUG
	printf("DEBUG: Exiting %s\n", __func__);
#endif
	return 0;
}

#ifdef __ANDROID__
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jniloadModule( JNIEnv* env, jobject obj, jlong jnimodule) {
  int result=0;
  mainlib_module_t module;
  moduleinfo_ver_generic_t *(*getmoduleinfo)();

#ifdef DEBUG
  __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Entering %s", __func__);
#endif

  //Initialise module settings
  memset(&module, 0, sizeof(mainlib_module_t));

  //Store module info for mainlib
  module.dlhandle=0;
  module.moduleinfoptr=(moduleinfo_ver_generic_t *) jnimodule;
  module.filename=NULL;
  if (_mainlib_addnewmodule(&module)!=0) {
#ifdef DEBUG
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
    return -1;
  }
#ifdef DEBUG
  __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
  return 0;
}
#endif

//NOTE: This function isn't thread safe so should only be called from an init function (mainlib's init caller creates a lock for the init functions)
void *mainlib_loadsymbol(const char *modulename, const char *symbolname) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int i;
	void *symptr;

  for (i=0; i<mainlib_nummodules; i++) {
		if (strcmp(mainlib_modules[i].filename, modulename)==0) {
			if (mainlib_modules[i].dlhandle) {
				debuglibifaceptr->debuglib_printf(1, "%s: Loading symbol: %s from module: %s\n", __func__, symbolname, mainlib_modules[i].filename);
				symptr=dlsym(mainlib_modules[i].dlhandle, symbolname);
				if (symptr!=NULL) {
					return symptr;
				}
			}
		}
  }
	return NULL;
}

/*
  A thread safe function that loads a symbol from a module
  Args: symptr: The pointer to the symbol will be returned in this variable (Sometimes the symbol pointer can be NULL)
        modulename: The name of the module to load the symbol from
        symbolname: The name of the symbol excluding the modulename_ prefix
  Returns: 0 on success or negative value on error
  Example: To load examplelib_myfunc specify modulename: examplelib and symbolname: myfunc
  Current full symbol name length limit is 80 characters
*/
int mainlib_loadmodulesymbol(void **symptr, const char *modulename, const char *symbolname) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  void *tmpsymptr;
  const char *dlerrstr;
  char fullsymname[81];

  //NOTE: No need to check for init since mainlib_nummodules=0 if not inited
  PTHREAD_LOCK(&mainlibmutex);
  for (i=0; i<mainlib_nummodules; i++) {
    if (strcmp(mainlib_modules[i].filename, modulename)==0) {
      if (mainlib_modules[i].dlhandle) {
        snprintf(fullsymname, 81, "%s_%s", modulename, symbolname);
        debuglibifaceptr->debuglib_printf(1, "%s: Loading symbol: %s from module: %s\n", __func__, fullsymname, mainlib_modules[i].filename);
        dlerror();
        tmpsymptr=dlsym(mainlib_modules[i].dlhandle, fullsymname);
        dlerrstr=dlerror();
        if (!dlerrstr) {
          PTHREAD_UNLOCK(&mainlibmutex);
          *symptr=tmpsymptr;

          return 0;
        }
      }
    }
  }
  PTHREAD_UNLOCK(&mainlibmutex);

  return -1;
}

/*
  A thread safe function that loads a non-standard named symbol from a module
  Args: symptr: The pointer to the symbol will be returned in this variable (Sometimes the symbol pointer can be NULL)
        modulename: The name of the module to load the symbol from
        symbolname: The full name of the symbol
  Returns: 0 on success or negative value on error
  Example: To load mycustom func from module: example specify modulename: example and symbolname: mycustommyfunc
*/
int mainlib_loadcustommodulesymbol(void **symptr, const char *modulename, const char *symbolname) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  void *tmpsymptr;
  const char *dlerrstr;

  //NOTE: No need to check for init since mainlib_nummodules=0 if not inited
  PTHREAD_LOCK(&mainlibmutex);
  for (i=0; i<mainlib_nummodules; i++) {
    if (strcmp(mainlib_modules[i].filename, modulename)==0) {
      if (mainlib_modules[i].dlhandle) {
        debuglibifaceptr->debuglib_printf(1, "%s: Loading symbol: %s from module: %s\n", __func__, symbolname, mainlib_modules[i].filename);
        dlerror();
        tmpsymptr=dlsym(mainlib_modules[i].dlhandle, symbolname);
        dlerrstr=dlerror();
        if (!dlerrstr) {
          PTHREAD_UNLOCK(&mainlibmutex);
          *symptr=tmpsymptr;

          return 0;
        }
      }
    }
  }
  PTHREAD_UNLOCK(&mainlibmutex);

  return -1;
}

const char *mainlib_getlastdlerror() {
	return dlerror();
}

static int mainlib_loadmodules() {
	struct dirent *dirent;
	DIR *dir;
	size_t filenamelen;

	//Open all libraries
	dir=opendir(modules_dir);
	if (dir==NULL) {
		return -1;
	}
	while ((dirent = readdir(dir))) {
		filenamelen=strlen(dirent->d_name);
		if (filenamelen<sizeof(LIBEXTENSION)) {
			continue;
		}
		if (strcasecmp(dirent->d_name+filenamelen-(sizeof(LIBEXTENSION)-1), LIBEXTENSION)!=0) {
			continue;
		}
#ifdef DEBUG
		printf("DEBUG: Loading module: %s\n", dirent->d_name);
#endif
		if (mainlib_loadmodule(dirent->d_name)!=0) {
      closedir(dir);
      return -1;
    }
	}
	closedir(dir);

	return 0;
}

//Find a module interface from the loaded modules array and return a pointer to it or NULL if not found
static const void *mainlib_find_module_interface(const char * const modulename, unsigned ifacever) {
  int i;

//  printf("DEBUG: Finding module: %s, with ver: %u\n", modulename, ifacever);
  for (i=0; i<mainlib_nummodules; i++) {
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;
//        printf("DEBUG: Found module: %s\n", moduleinfoptr->modulename);
        if (strcmp(moduleinfoptr->modulename, modulename)==0) {
          if (moduleinfoptr->moduleifaces) {
            const moduleiface_ver_1_t *moduleifaces=*(moduleinfoptr->moduleifaces);
            while (moduleifaces->ifaceptr) {
              if (moduleifaces->ifacever==ifacever) {
                return moduleifaces->ifaceptr;
              }
              ++moduleifaces;
            }
          }
        }
      }
    }
  }
  return NULL;
}

//Fill in module dependency info for all the modules that depend on other module interfaces
static int mainlib_fillin_module_dependencyinfo() {
  int i, moduleresult, allresult=0;

  for (i=0; i<mainlib_nummodules; i++) {
    moduleresult=0;
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->moduledeps) {
          moduledep_ver_1_t *moduledeps=*(moduleinfoptr->moduledeps);
          while (moduledeps->modulename) {
            const void *ifaceptr;

            ifaceptr=mainlib_find_module_interface(moduledeps->modulename, moduledeps->ifacever);
            if (!ifaceptr) {
              if (moduledeps->required) {
#ifndef __ANDROID__
                printf("%s: Failed to find required module interface version: %d from module: %s for module: %s\n", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#else
                __android_log_print(ANDROID_LOG_INFO, APPNAME, "%s: ERROR: Failed to find required module interface version: %d from module: %s for module: %s", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#endif
                moduleresult=-1;
              } else {
#ifndef __ANDROID__
                printf("%s: Failed to find optional module interface version: %d from module: %s for module: %s\n", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#else
                __android_log_print(ANDROID_LOG_INFO, APPNAME, "%s: Failed to find optional module interface version: %d from module: %s for module: %s", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#endif
              }
            } else {
#ifdef DEBUG
#ifndef __ANDROID__
              printf("DEBUG %s: Adding dependency: interface version: %d from module: %s for module: %s\n", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#else
                __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG %s: Adding dependency: interface version: %d from module: %s for module: %s\n", __func__, moduledeps->ifacever, moduledeps->modulename, moduleinfoptr->modulename);
#endif
#endif
              moduledeps->ifaceptr=ifaceptr;
            }
            ++moduledeps;
          }
        }
      }

    }
    if (moduleresult==-1) {
      allresult=-1;
    } else {
      mainlib_modules[i].depsresolved=1;
    }
  }
  if (allresult==-1) {
#ifdef DEBUG
#ifndef __ANDROID__
    printf("DEBUG %s: Some required dependencies haven't been resolved\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG %s: Some required dependencies haven't been resolved\n", __func__);
#endif
#endif
  }
  return allresult;
}

#ifdef __ANDROID__
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnifillinModuleDependencyInfo( JNIEnv* env, jobject obj) {
  return mainlib_fillin_module_dependencyinfo();
}
#endif

static void mainlib_initmodules() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int i;

	debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&mainlibmutex);
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->initfunc) {
          debuglibifaceptr->debuglib_printf(1, "%s: Initialising module: %s\n", __func__, moduleinfoptr->modulename);
          moduleinfoptr->initfunc();
        }
      }
		}
  }
  PTHREAD_UNLOCK(&mainlibmutex);
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static void mainlib_shutdownmodules() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int i;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  }
  PTHREAD_LOCK(&mainlibmutex);
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->shutdownfunc) {
          if (debuglibifaceptr) {
            debuglibifaceptr->debuglib_printf(1, "%s: Shutting down module: %s\n", __func__, moduleinfoptr->modulename);
          }
          moduleinfoptr->shutdownfunc();
        }
      }
		}
  }
  PTHREAD_UNLOCK(&mainlibmutex);
  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }
}

static void mainlib_startmodules() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&mainlibmutex);
  //Start other libraries
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->startfunc!=NULL) {
          debuglibifaceptr->debuglib_printf(1, "%s: Calling start function for module: %s\n", __func__, moduleinfoptr->modulename);
          moduleinfoptr->startfunc();
        }
      }
    }
  }
  PTHREAD_UNLOCK(&mainlibmutex);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static void mainlib_stopmodules() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  }
  PTHREAD_LOCK(&mainlibmutex);
  //Stop other libraries
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->stopfunc!=NULL) {
          if (debuglibifaceptr) {
            debuglibifaceptr->debuglib_printf(1, "%s: Calling stop function for module: %s\n", __func__, moduleinfoptr->modulename);
          }
          moduleinfoptr->stopfunc();
        }
      }
    }
  }
  PTHREAD_UNLOCK(&mainlibmutex);
  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }
}

static void mainlib_modules_registerlisteners() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

	debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&mainlibmutex);
  //Register mainlib listeners
  //NOTE: The only time we should get here when not initialised is if quit signal fails to exit properly
  mainlib_register_listeners();

	//Register other library listeners
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->registerlistenersfunc!=NULL) {
          debuglibifaceptr->debuglib_printf(1, "%s: Registering listeners for module: %s\n", __func__, moduleinfoptr->modulename);
          moduleinfoptr->registerlistenersfunc();
        }
      }
		}
  }
  PTHREAD_UNLOCK(&mainlibmutex);
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static void mainlib_modules_unregisterlisteners() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int i;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  }
  PTHREAD_LOCK(&mainlibmutex);
  //Unregister mainlib listeners
  //NOTE: The only time we should get here when not initialised is if quit signal fails to exit properly
  mainlib_unregister_listeners();

	//Unregister other library listeners
  for (i=0; i<mainlib_nummodules; i++) {
    if (!mainlib_modules[i].depsresolved) {
      continue;
    }
    if (mainlib_modules[i].moduleinfoptr) {
      if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
        moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

        if (moduleinfoptr->unregisterlistenersfunc!=NULL) {
          if (debuglibifaceptr) {
            debuglibifaceptr->debuglib_printf(1, "%s: Unregistering listeners for module: %s\n", __func__, moduleinfoptr->modulename);
          }
          moduleinfoptr->unregisterlistenersfunc();
        }
      }
		}
  }
  PTHREAD_UNLOCK(&mainlibmutex);
  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }
}

void mainlib_setneedtoquit(int val) {
	PTHREAD_LOCK(&mainlibmutex);
	needtoquit=val;
  sem_post(&mainlib_mainthreadsleepsem);
	PTHREAD_UNLOCK(&mainlibmutex);
}

int mainlib_getneedtoquit() {
	int val;

	PTHREAD_LOCK(&mainlibmutex);
	val=needtoquit;
	PTHREAD_UNLOCK(&mainlibmutex);

	return val;
}

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void mainlib_backtrace(void) {
  int size;
  void *trace[100];

  size = backtrace(trace, 100);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  backtrace_symbols_fd(trace, size, STDOUT_FILENO);
}
#else
//backtrace is only supported on glibc
static inline void mainlib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static void mainlib_dummy_sighandler(int sig) {
	//Do nothing
}

//A dedicated signal handler for SIGSEGV that displays a backtrace and then exits
//  as SIGSEGV normally means the program tried to access ram that it shouldn't have
//  or that it tried to access unitialised variables
static void mainlib_sigsegv_sighandler(int sig) {
  printf("\n********* SEGMENTATION FAULT *********\n");
  mainlib_backtrace();
  printf("***************************************\n");
  exit(-1);
}

static void *mainlib_signal_processor(void *thread_val) {
  struct sigaction new_action;
	sigset_t set;
	int sig;

  /* the program terminates when there is no input for 10 secs */
  //signal(SIGALRM, die);

  /*
    if we receive a signal, we want to exit nicely, in
    order not to leave the keyboard in an unusable mode
  */

	//Setup dummy handlers here and then handle the signals below in this function
  sigemptyset (&new_action.sa_mask);
  new_action.sa_flags = 0;
  new_action.sa_handler = mainlib_dummy_sighandler;

  sigaction(SIGHUP, &new_action, NULL);
  sigaction(SIGINT, &new_action, NULL);
  sigaction(SIGQUIT, &new_action, NULL);
  sigaction(SIGILL, &new_action, NULL);
  sigaction(SIGTRAP, &new_action, NULL);
  sigaction(SIGABRT, &new_action, NULL);
  sigaction(SIGFPE, &new_action, NULL);
  sigaction(SIGKILL, &new_action, NULL);
//  sigaction(SIGSEGV, &new_action, NULL);
  sigaction(SIGPIPE, &new_action, NULL);
  sigaction(SIGTERM, &new_action, NULL);
#ifdef SIGSTKFLT
  sigaction(SIGSTKFLT, &new_action, NULL);
#endif
  sigaction(SIGCHLD, &new_action, NULL);
  sigaction(SIGCONT, &new_action, NULL);
  sigaction(SIGSTOP, &new_action, NULL);
  sigaction(SIGTSTP, &new_action, NULL);
  sigaction(SIGTTIN, &new_action, NULL);
  sigaction(SIGTTOU, &new_action, NULL);

	for(;;) {
		//wait for any signal
		sigfillset(&set);
		sigwait(&set, &sig);

#ifdef DEBUG
		printf("DEBUG: %s: Received signal: %d\n", __func__, sig);
#endif
		//handle the signal here, rather than in a signal handler
		switch(sig) {
			case SIGHUP:
#ifdef DEBUG
				printf("DEBUG: %s: SIGHUP received, reload event\n", __func__);
#endif
				//TODO Implement reload code
				break;
			case SIGINT:
			case SIGQUIT:
			case SIGILL:
			case SIGTRAP:
			case SIGABRT:
			case SIGFPE:
			case SIGKILL:
//			case SIGSEGV:
			case SIGPIPE:
			case SIGTERM:
#ifdef SIGSTKFLT
			case SIGSTKFLT:
#endif
			case SIGCHLD:
			case SIGCONT:
			case SIGSTOP:
			case SIGTSTP:
			case SIGTTIN:
			case SIGTTOU:
        mainlib_setneedtoquit(1);
        return 0;
		}
	}
}

static void mainlib_init_signals() {
  struct sigaction act;
	sigset_t set;

  sigemptyset(&act.sa_mask);
  act.sa_flags=0;
  act.sa_handler=mainlib_sigsegv_sighandler;

  sigaction(SIGSEGV, &act, NULL);

	//create signal processing thread
	pthread_create(&mainlib_sigprocthread, NULL, mainlib_signal_processor, NULL);

	//set up the desired signal mask, common to most threads
  //any newly created threads will inherit this signal mask
	sigemptyset(&set);
	sigaddset(&set, SIGINT);
  sigaddset(&set, SIGQUIT);
  sigaddset(&set, SIGILL);
  sigaddset(&set, SIGTRAP);
  sigaddset(&set, SIGABRT);
  sigaddset(&set, SIGFPE);
  sigaddset(&set, SIGKILL);
//  sigaddset(&set, SIGSEGV);
  sigaddset(&set, SIGPIPE);
  sigaddset(&set, SIGTERM);
#ifdef SIGSTKFLT
  sigaddset(&set, SIGSTKFLT);
#endif
  sigaddset(&set, SIGCHLD);
  sigaddset(&set, SIGCONT);
  sigaddset(&set, SIGSTOP);
  sigaddset(&set, SIGTSTP);
  sigaddset(&set, SIGTTIN);
  sigaddset(&set, SIGTTOU);

	//block out these signals
	sigprocmask(SIG_BLOCK, &set, NULL);
}

int mainlib_main() {
  mainlib_module_t module;

#ifdef DEBUG
	printf("DEBUG: In the main library\n");
	printf("DEBUG: Loading modules from directory: %s\n", modules_dir);
#endif

  //Store module info for mainlib
  //NOTE: The module name comes from mainlib_moduleinfo_ver_1
  memset(&module, 0, sizeof(mainlib_module_t));
  module.moduleinfoptr=(moduleinfo_ver_generic_t *) &mainlib_moduleinfo_ver_1;
  if (_mainlib_addnewmodule(&module)!=0) {
    free(module.filename);
    printf("Exiting mainlib_main: Can't allocate memory for internal module: mainlib\n");
    return -1;
  }
	mainlib_init_signals();

  //Initialise mainlib
  mainlib_init();

  if (mainlib_loadmodules()!=0) {
    return -2;
  }

  //Fill in module dependency info for all modules
  if (mainlib_fillin_module_dependencyinfo()!=0) {
    return -3;
  }

  //NOTE: Set the flag variables first as if some modules are at that stage during failure we need to reverse the process

  //Initialise modules
	modulesinited=1;
	mainlib_initmodules();

	//Register Listeners
	listenersregistered=1;
	mainlib_modules_registerlisteners();

  //Start modules
	modules_started=1;
  mainlib_start();
  mainlib_startmodules();

	return 0;
}

#ifdef __ANDROID__
void Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnimain( JNIEnv* env, jobject obj) {
	//NOTE: Set the flag variables first as if some modules are at that stage during failure we need to reverse the process
	
	//Initialise modules
	modulesinited=1;
  mainlib_initmodules();

  //Register Listeners
	listenersregistered=1;
  mainlib_modules_registerlisteners();

  //Start modules
	modules_started=1;
  mainlib_start();
  mainlib_startmodules();
}
#endif

static void *mainlib_MainThreadLoop(void *thread_val) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  const configlib_ifaceptrs_ver_1_t * const configlibifaceptr=mainlib_deps[CONFIGLIB_DEPIDX].ifaceptr;
  const timeruleslib_ifaceptrs_ver_1_t * const timeruleslibifaceptr=mainlib_deps[TIMERULESLIB_DEPIDX].ifaceptr;
  int shortsleep=0; //1=Only sleep for a short interval between checks, 0=Sleep for a longer interval between checks
  int result;
  time_t curtime;
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "%s: Using config file: %s\n", __func__, cfg_filename);
  debuglibifaceptr->debuglib_printf(1, "%s: Using time rules file: %s\n", __func__, timerules_filename);

  if (configlibifaceptr) {
    configlibifaceptr->configlib_setcfgfilename(cfg_filename);
  }
  if (timeruleslibifaceptr) {
    timeruleslibifaceptr->setrulesfilename(timerules_filename);
  }
  //Wait for quit
  while (!mainlib_getneedtoquit()) {
    shortsleep=0;
		if (configlibifaceptr) {
			if (!configlibifaceptr->configlib_isloaded()) {
				//Load configuration here
				result=configlibifaceptr->configlib_readcfgfile();
				if (result!=0) {
					shortsleep=1;
				}
			}
		}
    if (timeruleslibifaceptr) {
      if (!timeruleslibifaceptr->isloaded()) {
        //Load configuration here
        result=timeruleslibifaceptr->readrulesfile();
        if (result!=0) {
          shortsleep=1;
        }
      }
    }
    curtime=time(NULL);
    waittime.tv_nsec=0;
    if (shortsleep) {
      waittime.tv_sec=curtime+10;
    } else {
      waittime.tv_sec=curtime+120;
    }
    sem_timedwait(&mainlib_mainthreadsleepsem, &waittime);
  }
  return (void *) 0;
}

//NOTE: The signals are initialised before the modules are loaded so cleanup may be called before debuglib is loaded
void mainlib_cleanup() {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "DEBUG: Entering %s\n", __func__);
  }
  if (mainlib_sigprocthread) {
#ifndef __ANDROID__
    if (debuglibifaceptr) {
      debuglibifaceptr->debuglib_printf(1, "%s: Canceling the signal handling thread\n",  __func__);
    }
    pthread_cancel(mainlib_sigprocthread);
#endif
    if (debuglibifaceptr) {
      debuglibifaceptr->debuglib_printf(1, "%s: Waiting for signal handling thread to exit\n", __func__);
    }
    pthread_join(mainlib_sigprocthread, NULL);
  }
  //Stop modules
  if (modules_started) {
		mainlib_stopmodules();
		mainlib_stop();
		modules_started=0;
	}
  //Unregister Listeners
  if (listenersregistered) {
		mainlib_modules_unregisterlisteners();
		listenersregistered=0;
	}
	if (modulesinited) {
		mainlib_shutdownmodules();
		modulesinited=0;
	}
	mainlib_shutdown();

#ifdef DEBUG
#ifndef __ANDROID__
  printf("DEBUG: Exiting %s\n", __func__);
#else
  __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
#endif
}

#ifdef __ANDROID__
void Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnicleanup( JNIEnv* env, jobject obj) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "DEBUG: Entering %s\n", __func__);
  }
  //Stop modules
  if (modules_started) {
		mainlib_stopmodules();
		mainlib_stop();
		modules_started=0;
	}
  //Unregister Listeners
  if (listenersregistered) {
		mainlib_modules_unregisterlisteners();
		listenersregistered=0;
	}
	if (modulesinited) {
		mainlib_shutdownmodules();
		modulesinited=0;
	}
  mainlib_shutdown();

  if (cfg_filename) {
    free(cfg_filename);
    cfg_filename=NULL;
  }
#ifdef DEBUG
  __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: Exiting %s", __func__);
#endif
}
#endif

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int mainlib_process_cmdserver_command(const char *buffer, int clientsock) {
  const commonserverlib_ifaceptrs_ver_1_t * const commonserverlibifaceptr=mainlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  char tmpstrbuf[500];
  int i;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  if (strncmp(buffer, "shutdown", 8)==0) {
		mainlib_setneedtoquit(1);
		commonserverlibifaceptr->serverlib_netputs("Program shutdown has been scheduled\n", clientsock, NULL);
		//TODO: Implement shutdown here
	} else if (strncmp(buffer, "versioninfo", 11)==0) {
#ifndef __ANDROID__
    sprintf(tmpstrbuf, "Watch Inputs %s\n", WATCH_INPUTS_VERSION);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
#else
    sprintf(tmpstrbuf, "Watch Inputs %s\n", ANDROID_WATCH_INPUTS_VERSION);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    sprintf(tmpstrbuf, "  Version Code: %s\n", ANDROID_WATCH_INPUTS_VERSIONCODE);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
#endif
    sprintf(tmpstrbuf, "Build Date: %s %s\n", __TIME__, __DATE__);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
  } else if (strncmp(buffer, "modulesinfo", 11)==0) {
    PTHREAD_LOCK(&mainlibmutex);
    sprintf(tmpstrbuf, "Number of modules loaded: %d\n", mainlib_nummodules);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    for (i=0; i<mainlib_nummodules; i++) {
      tmpstrbuf[0]=0;
      if (mainlib_modules[i].moduleinfoptr) {
        if (mainlib_modules[i].moduleinfoptr->moduleinfover==MODULEINFO_VER_1) {
          moduleinfo_ver_1_t *moduleinfoptr=(moduleinfo_ver_1_t *) mainlib_modules[i].moduleinfoptr;

          sprintf(tmpstrbuf, "Module Name: %s\n", moduleinfoptr->modulename);
        }
      }
      if (tmpstrbuf[0]) {
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
    }
    PTHREAD_UNLOCK(&mainlibmutex);
  } else {
		return CMDLISTENER_NOTHANDLED;
	}
	return CMDLISTENER_NOERROR;
}

/*
  Register all the listeners for main library
  Returns 0 for success or other value on error
*/
static void mainlib_register_listeners(void) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  const cmdserverlib_ifaceptrs_ver_1_t * const cmdserverlibifaceptr=mainlib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(mainlib_process_cmdserver_command);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for main library
  Returns 0 for success or other value on error
*/
static void mainlib_unregister_listeners(void) {
  const debuglib_ifaceptrs_ver_1_t * const debuglibifaceptr=mainlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  const cmdserverlib_ifaceptrs_ver_1_t * const cmdserverlibifaceptr=mainlib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  }
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(mainlib_process_cmdserver_command);
  }
  if (debuglibifaceptr) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }
}

moduleinfo_ver_generic_t *mainlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &mainlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) mainlib_getmoduleinfo();
}

void Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnisetConfigFilename( JNIEnv* env, jobject obj, jstring jcfgfile) {
  const char* tmpstr;

  tmpstr=(*env)->GetStringUTFChars(env, jcfgfile, 0);
  if (tmpstr==NULL) {
    return;
  }
  if (tmpstr[0]==0) {
    return;
  }
  if (cfg_filename) {
    free(cfg_filename);
  }
  cfg_filename=strdup(tmpstr);

  (*env)->ReleaseStringUTFChars(env, jcfgfile, tmpstr);
}

void Java_com_capsicumcorp_iomy_libraries_watchinputs_MainLib_jnisetTimeRulesFilename( JNIEnv* env, jobject obj, jstring jrulesfile) {
  const char* tmpstr;

  tmpstr=(*env)->GetStringUTFChars(env, jrulesfile, 0);
  if (tmpstr==NULL) {
    return;
  }
  if (tmpstr[0]==0) {
    return;
  }
  if (timerules_filename) {
    free(timerules_filename);
  }
  timerules_filename=strdup(tmpstr);

  (*env)->ReleaseStringUTFChars(env, jrulesfile, tmpstr);
}
#endif
