/*
Title: Debug Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides a debugging log library and a TCP interface to look at the debug logs.
Copyright: Capsicum Corporation 2009-2016

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

//Needed for vasprintf
#define _GNU_SOURCE

//NOTE: POSIX_C_SOURCE is needed for the following
//  ctime_r
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

#include <config.h>

#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <sys/time.h>
#include <time.h>
#include <unistd.h>
#include <semaphore.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "debuglib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"

#define SMALLBUF_SIZE 128
#define BUFFER_SIZE 1024

#define MAX_DEBUG_NETSESSIONS 10 //Maximum number of network based debug output sessions allowed

static int gmaxdebuglines=0; //Maximum number of debug lines allowed
static int gdebuglineinidx=0, gdebuglineoutidx=0; //Current input and output indexes to the gdebuglines array
static char * *gdebuglines=NULL; //An array of debug lines

static pthread_mutex_t debuglibmutex = PTHREAD_MUTEX_INITIALIZER;

static int debuglib_inuse=0;

static char needtoquit=0; //Set to 1 when debuglib should exit

static sem_t debuglib_networkdebugoutputthreadsleepsem; //Used for network debug output thread sleeping

static int debuglib_debugclientsockets[MAX_DEBUG_NETSESSIONS]; //Network client sockets that have debugging enabled
static pthread_t debuglib_networkdebugoutputthread;

//Function Declarations
int debuglib_init(void);
void debuglib_shutdown(void);
static int debuglib_getneedtoquit();
void debuglib_register_listeners(void);
void debuglib_unregister_listeners(void);
static void _debuglib_disable(void);
static void *debuglib_networkdebugoutputloop(void *val);

int debuglib_enable(int maxdebuglines);
int debuglib_disable(void);
int debuglib_vprintf(int loglevel, const char *fmt, va_list argptr);
int debuglib_printf(int loglevel, const char *fmt, ...);

//Module Interface Definitions
#define CMDSERVERLIB_DEPIDX 0

static debuglib_ifaceptrs_ver_1_t debuglib_ifaceptrs_ver_1={
  debuglib_enable,
  debuglib_disable,
  debuglib_vprintf,
  debuglib_printf
};

static moduleiface_ver_1_t debuglib_ifaces[]={
  {
    &debuglib_ifaceptrs_ver_1,
    DEBUGLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduledep_ver_1_t debuglib_deps[]={
  {
    "cmdserverlib",
    NULL,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    NULL, NULL, 0, 0
  }
};

static moduleinfo_ver_1_t debuglib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "debuglib",
  debuglib_init,
  debuglib_shutdown,
  NULL,
  NULL,
  debuglib_register_listeners,
  debuglib_unregister_listeners,
  &debuglib_ifaces,
  &debuglib_deps
};

/*
  Initialise the debug library to a clean known state if not already initialised.
  Returns 0 for success or other value on error
*/
int debuglib_init(void) {
  int i, result=0;

  pthread_mutex_lock(&debuglibmutex);

	++debuglib_inuse;
	if (debuglib_inuse>1) {
    //Already initialised
    pthread_mutex_unlock(&debuglibmutex);
    return -1;
  }
  needtoquit=0;

  //Initialise client sockets to -1 since -1 is always returned by system functions on an error so is never a valid socket number
  for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
    debuglib_debugclientsockets[i]=-1;
  }
  sem_init(&debuglib_networkdebugoutputthreadsleepsem, 0, 0);

  pthread_mutex_unlock(&debuglibmutex);

  //Start a thread for network debug output
  //Okay to execute this outside of the thread lock since the thread variable will only ever be changed by one thread
  if (debuglib_networkdebugoutputthread==0) {
#ifdef DEBUG
#ifndef __ANDROID__
    printf("DEBUG: %s: Starting the network debug output thread\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: %s: Starting the network debug output thread", __func__);
#endif
#endif
    result=pthread_create(&debuglib_networkdebugoutputthread, NULL, debuglib_networkdebugoutputloop, (void *) ((unsigned short) 0));
    if (result!=0) {
#ifdef DEBUG
#ifndef __ANDROID__
      printf("DEBUG: %s: Failed to spawn main thread\n", __func__);
#else
    __android_log_print(ANDROID_LOG_INFO, APPNAME, "DEBUG: %s: Failed to spawn main thread", __func__);
#endif
#endif
      result=-1;
    }
  }
#ifdef DEBUG
  //Enable full debug output immediately if enabled in compile option
	debuglib_enable(1000);
#endif

  return result;
}

void debuglib_shutdown(void) {
  pthread_mutex_lock(&debuglibmutex);

  if (debuglib_inuse==0) {
    //Not initialised
    //Do nothing
	} else {
		--debuglib_inuse;
		if (debuglib_inuse>0) {
			//Still in use
			//Do nothing
		} else {
			//No longer in use
			_debuglib_disable();
		}
  }
  pthread_mutex_unlock(&debuglibmutex);

  //Okay to execute this outside of the thread lock since the thread variable will only ever be changed by one thread
  if (debuglib_networkdebugoutputthread!=0) {
    //Cancel the network debug output thread and wait for it to exit
    debuglib_printf(1, "%s: Cancelling the debug output thread\n", __func__);
    pthread_mutex_lock(&debuglibmutex);
    needtoquit=1;
    sem_post(&debuglib_networkdebugoutputthreadsleepsem);
    pthread_mutex_unlock(&debuglibmutex);
    debuglib_printf(1, "%s: Waiting for debug output thread to exit\n", __func__);
    pthread_join(debuglib_networkdebugoutputthread, NULL);
    debuglib_networkdebugoutputthread=0;
  }
  pthread_mutex_lock(&debuglibmutex);
  sem_destroy(&debuglib_networkdebugoutputthreadsleepsem);
  pthread_mutex_unlock(&debuglibmutex);
}

static void UNUSED_FUNCTION(debuglib_setneedtoquit)(int val) {
  pthread_mutex_lock(&debuglibmutex);
  needtoquit=val;
  pthread_mutex_unlock(&debuglibmutex);
}

static int debuglib_getneedtoquit() {
  int val;

  pthread_mutex_lock(&debuglibmutex);
  val=needtoquit;
  pthread_mutex_unlock(&debuglibmutex);

  return val;
}

/*
  Enable debugging
  Args: maxdebuglines Maximum number of lines to buffer in memory for display before removing old lines
  Returns 0 for success or other value on error
*/
int debuglib_enable(int maxdebuglines) {
	int result;

  pthread_mutex_lock(&debuglibmutex);
	if (debuglib_inuse==0) {
		result=-1;
	}
  else if (maxdebuglines <= 0) {
    //Need more than 0 debug lines
    result=-2;
  } else {
		if (gmaxdebuglines) {
			_debuglib_disable();
		}
    gdebuglines=(char * *) calloc(maxdebuglines, sizeof(char *));
    if (gdebuglines) {
      gmaxdebuglines=maxdebuglines;
      result=0;
      gdebuglineinidx=0;
      gdebuglineoutidx=0;
		}
		result=0;
	}
  pthread_mutex_unlock(&debuglibmutex);

	return result;
}

static void _debuglib_disable(void) {
	int i;

  for (i=0; i<gmaxdebuglines; i++) {
    if (gdebuglines[i]) {
      free(gdebuglines[i]);
    }
  }
  free(gdebuglines);
	gdebuglines=NULL;
	gmaxdebuglines=0;
}

int debuglib_disable(void) {
  int result;

  pthread_mutex_lock(&debuglibmutex);
  if (debuglib_inuse==0) {
    //Not initialised
    result=-1;
  } else {
		if (gmaxdebuglines) {
			_debuglib_disable();
		}
		result=0;
	}
  pthread_mutex_unlock(&debuglibmutex);

	return result;
}

static void _debuglib_steplineinidx(void) {
  ++gdebuglineinidx;
  if (gdebuglineinidx==gmaxdebuglines) {
    gdebuglineinidx=0;
  }
}

static void _debuglib_steplineoutidx(void) {
  ++gdebuglineoutidx;
  if (gdebuglineoutidx==gmaxdebuglines) {
    gdebuglineoutidx=0;
  }
}

int debuglib_vprintf(int UNUSED(loglevel), const char *fmt, va_list argptr) {
  int result=0, tmpstr1len, timestrlen;
  char *tmpstr1=NULL, *tmpstr2=NULL;
  struct timespec curtime;
  char timestr[100];

  //Get current time
  clock_gettime(CLOCK_REALTIME, &curtime);
  ctime_r(&curtime.tv_sec, timestr);

  //Remove newline at end of timestr
  timestrlen=strlen(timestr);
  timestr[timestrlen-1]='\0';
  --timestrlen;

  //First move the year out of the way including the null
  memmove(timestr+(timestrlen-4)+7, timestr+(timestrlen-4), 5);
  //Add nanoseconds
  sprintf(timestr+timestrlen-5, ".%06ld", curtime.tv_nsec/1000);
  //Change the new null to a space
  timestr[timestrlen-5+7]=' ';
  timestrlen+=7; //We just added 7 characters

  //We can always output to the screen even if not initialised
  tmpstr1len=vasprintf(&tmpstr1, fmt, argptr);
  if (tmpstr1len==-1) {
    return -1;
  }
  tmpstr2=(char *) malloc((timestrlen+9+tmpstr1len+1)*sizeof(char));
  if (!tmpstr2) {
    return -2;
  }
  sprintf(tmpstr2, "%s: DEBUG: %s", timestr, tmpstr1);
  free(tmpstr1);
#ifdef DEBUG
#ifndef __ANDROID__
  fputs(tmpstr2, stderr);
#else
  __android_log_write(ANDROID_LOG_INFO, APPNAME, tmpstr2);
#endif
#endif
  pthread_mutex_lock(&debuglibmutex);

  if (gmaxdebuglines==0) {
		free(tmpstr2);
    result=-1;
  } else {
    if (result>=0) {
      if (gdebuglines[gdebuglineinidx]) {
        free(gdebuglines[gdebuglineinidx]);
      }
      gdebuglines[gdebuglineinidx]=tmpstr2;
      _debuglib_steplineinidx();
      if (gdebuglineinidx == gdebuglineoutidx) {
        //Remove a line from the buffer to make room for another line
        _debuglib_steplineoutidx();
      }
    }
    result=0;
  }
  //Wake up the network debug output thread to output debug lines
  sem_post(&debuglib_networkdebugoutputthreadsleepsem);

  pthread_mutex_unlock(&debuglibmutex);

  return result;
}

int debuglib_printf(int loglevel, const char *fmt, ...) {
  va_list ap;
  int result;

  va_start(ap, fmt);
  result=debuglib_vprintf(loglevel, fmt, ap);
  va_end(ap);

  return result;
}

#ifdef __ANDROID__
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_DebugLib_jniprintf( JNIEnv* env, jobject UNUSED(obj), jint loglevel, jstring javaString) {
  const char *nativeString = (*env)->GetStringUTFChars(env, javaString, 0);
  int result;

  result=debuglib_printf(loglevel, nativeString);

  (*env)->ReleaseStringUTFChars(env, javaString, nativeString);

  return result;
}
#endif

static void debuglib_outputlines() {
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=debuglib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  pthread_mutex_lock(&debuglibmutex);
  if (gmaxdebuglines>0) {
    int i, tmpidx;

    //First check if there are any cmd debug sockets enabled so we don't throw away important debug info
    for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
      if (debuglib_debugclientsockets[i]!=-1) {
        break;
      }
    }
    if (i==MAX_DEBUG_NETSESSIONS) {
      //No listening sockets
      pthread_mutex_unlock(&debuglibmutex);
      return;
    }
    tmpidx=gdebuglineoutidx;
    while (gdebuglines[tmpidx] && tmpidx!=gdebuglineinidx) {
      char *tmpstr;

      //We just throw away the line if we can't allocate memory for the temp buffer
      tmpstr=strdup(gdebuglines[tmpidx]);
      free(gdebuglines[tmpidx]);
      gdebuglines[tmpidx]=NULL;
      _debuglib_steplineoutidx();
      if (tmpstr) {
        if (cmdserverlibifaceptr) {
          for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
            if (debuglib_debugclientsockets[i]!=-1) {
              int clientsocket;

              //Unlock during the debug output since it may take a while
              clientsocket=debuglib_debugclientsockets[i];
              pthread_mutex_unlock(&debuglibmutex);

              //Output debug line to this client socket
              cmdserverlibifaceptr->cmdserverlib_netputs(tmpstr, clientsocket, NULL);

              pthread_mutex_lock(&debuglibmutex);
            }
          }
        }
        free(tmpstr);

        //Update from gdebuglineoutidx in case it has changed (due to more incoming lines during a full buffer)
        tmpidx=gdebuglineoutidx;
      }
    }
  }
  pthread_mutex_unlock(&debuglibmutex);
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int debuglib_processcommand(const char *buffer, int clientsock) {
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=debuglib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;
  char tmpstrbuf[100];
  int i, result;

  if (!cmdserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  if (strncmp(buffer, "debug enable", 12)==0) {
    int numlines;

    numlines=atoi(buffer+12);
    if (numlines>0) {
      result=debuglib_enable(numlines);
    } else {
      result=-1;
    }
    if (result==0) {
      sprintf(tmpstrbuf, "Debug mode is now enabled with %d lines\n", numlines);
    } else {
      sprintf(tmpstrbuf, "Debug enable returned error code: %d\n", result);
    }
    cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);

    //Wake up the network debug output thread to output debug lines
    sem_post(&debuglib_networkdebugoutputthreadsleepsem);
  } else if (strncmp(buffer, "debug disable", 13)==0) {
    result=debuglib_disable();
    if (result==0) {
      sprintf(tmpstrbuf, "Debug mode is now disabled\n");
    } else {
      sprintf(tmpstrbuf, "Debug disable returned error code: %d\n", result);
    }
    cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
  } else if (strncmp(buffer, "debug output show", 17)==0) {
    //Need to lock here since there can be multiple cmd client threads running this code
    pthread_mutex_lock(&debuglibmutex);
    //Check if already showing debug output on this client socket
    for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
      if (debuglib_debugclientsockets[i]==clientsock) {
        break;
      }
    }
    if (i==MAX_DEBUG_NETSESSIONS) {
      //Find a spare slot
      for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
        if (debuglib_debugclientsockets[i]==-1) {
          break;
        }
      }
      if (i!=MAX_DEBUG_NETSESSIONS) {
        debuglib_debugclientsockets[i]=clientsock;
        sprintf(tmpstrbuf, "Debug output now being displayed\n");
      } else {
        sprintf(tmpstrbuf, "Can't enable debug output: The maximum number of debug output slots: %d has been reached\n", MAX_DEBUG_NETSESSIONS);
      }
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);

      //Wake up the network debug output thread to output debug lines
      sem_post(&debuglib_networkdebugoutputthreadsleepsem);
    } else {
      cmdserverlibifaceptr->cmdserverlib_netputs("Debug output is already being displayed\n", clientsock, NULL);
    }
    pthread_mutex_unlock(&debuglibmutex);
  } else if (strncmp(buffer, "debug output hide", 17)==0) {
    //Need to lock here since there can be multiple cmd client threads running this code
    pthread_mutex_lock(&debuglibmutex);
    //Check if already showing debug output
    for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
      if (debuglib_debugclientsockets[i]==clientsock) {
        break;
      }
    }
    if (i==MAX_DEBUG_NETSESSIONS) {
      cmdserverlibifaceptr->cmdserverlib_netputs("Debug output is already not being displayed\n", clientsock, NULL);
    } else {
      debuglib_debugclientsockets[i]=-1;
      cmdserverlibifaceptr->cmdserverlib_netputs("Debug output is no longer being displayed\n", clientsock, NULL);
    }
    pthread_mutex_unlock(&debuglibmutex);
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  return CMDLISTENER_NOERROR;
}

/*
  Cleanup when a network client is about to close
  Input: clientsock The client socket that is closing
*/
void debuglib_networkclientclose(int clientsock) {
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=debuglib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;
  int i;

  pthread_mutex_lock(&debuglibmutex);
  //Check if already showing debug output
  for (i=0; i<MAX_DEBUG_NETSESSIONS; i++) {
    if (debuglib_debugclientsockets[i]==clientsock) {
      break;
    }
  }
  if (i!=MAX_DEBUG_NETSESSIONS && cmdserverlibifaceptr) {
    debuglib_debugclientsockets[i]=-1;
    cmdserverlibifaceptr->cmdserverlib_netputs("Debug output is no longer being displayed\n", clientsock, NULL);
  }
  pthread_mutex_unlock(&debuglibmutex);
}

//NOTE: We output to the network in a different thread since serverlib_netputs will block if the send buffer fills up
//  Blocking the debuglib caller would slow down other tasks
static void *debuglib_networkdebugoutputloop(void* UNUSED(val)) {
//  int oldcancelstate=-1;
  struct timespec semwaittime;
  //struct timeval currenttime;

  //Send the latest debug lines to the client
  while (!debuglib_getneedtoquit()) {
    debuglib_outputlines();

    if (debuglib_getneedtoquit()) {
      break;
    }
    //Sleep for 1 hour
    clock_gettime(CLOCK_REALTIME, &semwaittime);
    semwaittime.tv_sec+=3600;
    sem_timedwait(&debuglib_networkdebugoutputthreadsleepsem, &semwaittime);
  }
  return (void *) 0;
}

/*
  Register all the listeners for debug library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void debuglib_register_listeners(void) {
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=debuglib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(debuglib_processcommand);
    cmdserverlibifaceptr->cmdserverlib_register_networkclientclose_listener(debuglib_networkclientclose);
  }
}

/*
  Unregister all the listeners for debug library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void debuglib_unregister_listeners(void) {
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=debuglib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(debuglib_processcommand);
    cmdserverlibifaceptr->cmdserverlib_unregister_networkclientclose_listener(debuglib_networkclientclose);
  }
}

moduleinfo_ver_generic_t *debuglib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &debuglib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_DebugLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((long) debuglib_getmoduleinfo());
}
#endif
