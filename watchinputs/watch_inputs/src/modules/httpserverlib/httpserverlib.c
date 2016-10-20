/*
Title: Basic HTTP Server Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides access to various live info via a basic version of the HTTP protocol.
Copyright: Capsicum Corporation 2008-2016

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

/*
TODO: Convert the large buffers from stack buffers into global malloc buffers and add a clenaup function for the thread
TODO Implement required support
*/

//NOTE: POSIX_C_SOURCE is needed for the following
//  strtok_r
#define _POSIX_C_SOURCE 199309L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

#include <stdio.h>
#include <pthread.h>
#include <string.h>
#include <strings.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>
#include "moduleinterface.h"
#include "httpserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/simclist/simclist.h"
#include "modules/commonlib/commonlib.h"

#define SMALLBUF_SIZE 256
#define BUFFER_SIZE 4096
#define SERVER_PORT 64931
#define MAX_HTTP_THREADS 10

static int sock=-1, clientsock=-1;

static int numhttpthreads;
static pthread_t httpserverthreads[MAX_HTTP_THREADS];
static int httpclientsocket[MAX_HTTP_THREADS];

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

static pthread_mutex_t httpserverlibmutex = PTHREAD_MUTEX_INITIALIZER;
#else
static pthread_mutex_t httpserverlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int httpserverlib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when httpserverlib should exit
static pthread_t httpserverlib_thread;

//Lists
static list_t httpserverlib_cmd_listener_funcs_ptr; //A list of command listener functions

//Function Declarations
static void httpserverlib_setneedtoquit(int val);
static int httpserverlib_getneedtoquit();
static int httpserverlib_start(void);
static void httpserverlib_stop(void);
int httpserverlib_init(void);
void httpserverlib_shutdown(void);
int httpserverlib_register_cmd_listener(void *funcptr);
int httpserverlib_unregister_cmd_listener(void *funcptr);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define COMMONSERVERLIB_DEPIDX 1
#define SIMCLIST_DEPIDX 2

static httpserverlib_ifaceptrs_ver_1_t httpserverlib_ifaceptrs_ver_1={
  httpserverlib_register_cmd_listener,
  httpserverlib_unregister_cmd_listener
};

static moduleiface_ver_1_t httpserverlib_ifaces[]={
  {
    &httpserverlib_ifaceptrs_ver_1,
    HTTPSERVERLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduledep_ver_1_t httpserverlib_deps[]={
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
    "simclist",
    NULL,
    SIMCLISTINTERFACE_VER_1,
    1
  },
  {
    NULL, NULL, 0, 0
  }
};

static moduleinfo_ver_1_t httpserverlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "httpserverlib",
  httpserverlib_init,
  httpserverlib_shutdown,
  httpserverlib_start,
  httpserverlib_stop,
  NULL,
  NULL,
  &httpserverlib_ifaces,
  &httpserverlib_deps
};

/* this function returns the size of a pointer */
static size_t list_custommeter_pointer(const void *el) {
    /* every element has the constant size of a pointer */
    return sizeof(void *);
}

/*
 * compare two pointers
 * 
 * this function compares two pointers:
 */
static int list_customcomparator_pointer(const void *a, const void *b) {
    return (*(void **)a < *(void **)b) - (*(void **)a > *(void **)a);
}

/*
  Call all listeners for http commands
  Input: path The http command to process
         buffer Use the buffer to return null terminated output: 4K max
  Return HTTPLISTENER_NOERROR when your listener has handled the command then this function will return
  Return HTTPLISTENER_NOTHANDLED if your listener can't handle the http command
*/
static inline int httpserverlib_call_cmd_listeners(const char *path, char *buffer, const char *extbeg) {
  simclist_ifaceptrs_ver_1_t *simclistifaceptr=httpserverlib_deps[SIMCLIST_DEPIDX].ifaceptr;
	int listener_result;
	int (*cmdfunc)(const char *path, char *buffer, const char *extbeg);

	listener_result=HTTPLISTENER_NOTHANDLED;
  simclistifaceptr->list_iterator_start(&httpserverlib_cmd_listener_funcs_ptr);
  while (simclistifaceptr->list_iterator_hasnext(&httpserverlib_cmd_listener_funcs_ptr)) {
    cmdfunc=*(void **) simclistifaceptr->list_iterator_next(&httpserverlib_cmd_listener_funcs_ptr);
    if (cmdfunc) {
			listener_result=cmdfunc(path, buffer, extbeg);
			if (listener_result==HTTPLISTENER_NOERROR) {
				break;
			}
		}
  }
  simclistifaceptr->list_iterator_stop(&httpserverlib_cmd_listener_funcs_ptr);

	return listener_result;
}

/*
  Parse a HTTP request from a client and respond with various data depending on what url they requested
*/
static void *httpparser(void *val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=httpserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int sock=(int) val;
  char *buffer, *path;
  char *sendbuffer;
  char *netgetc_buffer;
  int netgetc_pos=0, netgetc_received=0;
  int received = -1, len;
  int foundemptynewline=0, error=0;
  int commandcode=0, state=0;
  int listener_result;

  if (!commonserverlibifaceptr) {
    return (void *) 0;
  }
  //Allocate buffer space
  buffer=(char *) malloc(BUFFER_SIZE*sizeof(char));
  path=(char *) malloc(256*sizeof(char));
  sendbuffer=(char *) malloc(256*sizeof(char));
  netgetc_buffer=(char *) malloc(SMALLBUF_SIZE*sizeof(char));
  if (!buffer || !path || !sendbuffer || !netgetc_buffer) {
    if (buffer) {
      free(buffer);
    }
    if (path) {
      free(path);
    }
    if (sendbuffer) {
      free(sendbuffer);
    }
    if (netgetc_buffer) {
      free(netgetc_buffer);
    }
    debuglibifaceptr->debuglib_printf(1, "httpparser: Unable to allocate memory for httpServer buffers\n");
    return (void *) 1;
  }
  path[0]='\0';
  buffer[0]='\0';
  sendbuffer[0]='\0';

  while (!error && !httpserverlib_getneedtoquit()) {
    int i;
    char *token, *line, *saveptr;

    if (commonserverlibifaceptr->serverlib_netgets(buffer, BUFFER_SIZE, sock, netgetc_buffer, SMALLBUF_SIZE*sizeof(char), &netgetc_pos, &netgetc_received, httpserverlib_getneedtoquit) != NULL) {
      len=strlen(buffer);

      for (i=1, line=buffer; ; i++, line=NULL) {
        token=strtok_r(line, " \r\n", &saveptr);
        if (token==NULL) {
          if (i!=1) {
            //At the end of the line
            break;
          } else if (commandcode==0) {
            //A token wasn't found on this line so it must be empty
            break;
          } else if (commandcode==1 && state==3) {
            //An empty line for HTTP means start sending HTTP output to the client
            debuglibifaceptr->debuglib_printf(1, "httpparser: Found an empty line for HTTP\n");
            state=4;
            break;
          } else {
            //All other empty lines are error
            debuglibifaceptr->debuglib_printf(1, "httpparser: Setting error cause didn't expect empty line\n");
            error=1;
            break;
          }
        }
        debuglibifaceptr->debuglib_printf(1, "httpparser: Found token: %s\n", token);
        if (i==1 && state==0) {
          //Process the method
          if (strcasecmp(token, "GET")==0) {
            commandcode=1;
            state=1;
          } else {
            error=1;
            break;
          }
        } else if (i==2 && commandcode==1 && state==1) {
          //Get the path
          strncpy(path, token, 255);
          debuglibifaceptr->debuglib_printf(1, "httpparser: Found a path: %s\n", path);
          state=2;
        } else if (i==3 && commandcode==1 && state==2) {
          //Get the HTTP token
          if (strncasecmp(token, "HTTP", 4)==0) {
            //HTTP protocol
            debuglibifaceptr->debuglib_printf(1, "httpparser: Using HTTP protocol\n");
            state=3;
          } else {
            debuglibifaceptr->debuglib_printf(1, "httpparser: Setting error cause expected HTTP\n");
            error=1;
            break;
          }
        } else if (commandcode==1 && state==3) {
          //Ignore other info for now
          debuglibifaceptr->debuglib_printf(1, "httpparser: Found HTTP tag: %s\n", token);
        } else {
          debuglibifaceptr->debuglib_printf(1, "httpparser: Setting error cause expected command code\n");
          error=1;
          break;
        }
      }
    } else {
      debuglibifaceptr->debuglib_printf(1, "httpparser: Client ended\n");
      free(buffer);
      free(path);
      free(sendbuffer);
      free(netgetc_buffer);

      return (void *) 1;
    }
    if (commandcode==1 && state==2 && path[0]!='\0') {
      //Found a path and GET query was specified
      break;
    } else if (commandcode==1 && state==4 && path[0]!='\0') {
      //Found a path and GET HTTP query was specified
      break;
    }
    memset(buffer, 0, BUFFER_SIZE*sizeof(char));
  }
  if (error==1) {
    commonserverlibifaceptr->serverlib_netputs("400 Bad Request\r\n", sock, httpserverlib_getneedtoquit);
  } else if (commandcode==1 && path[0]!='\0') {
    char *extbeg; //Beginning of extension

    extbeg=strrchr(path, '.');
		listener_result=httpserverlib_call_cmd_listeners(path, buffer, extbeg);
		if (listener_result==HTTPLISTENER_NOTHANDLED) {
      sprintf(buffer, "404 Not Found\r\n");
    }
    if (state==4) {
      char timestr[100];
      time_t t;
      struct tm *tmptm;

      //Get current time
      t=time(NULL);
      tmptm=gmtime(&t);
      strftime(timestr, sizeof(timestr), "%a, %d %b %Y %H:%M:%S %Z", tmptm);

      //HTTP style
      len=strlen(buffer);
      snprintf(sendbuffer, 255,
        "HTTP/1.0 200 OK\r\n"
        "Date: %s\r\n"
        "Server: WHTTPServer\r\n"
        "Last-Modified: %s\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n"
        "Content-Type: text/plain\r\n"
        "\r\n",
        timestr, timestr, len);

      //Send the HTTP header
      commonserverlibifaceptr->serverlib_netputs(sendbuffer, sock, httpserverlib_getneedtoquit);
    }
    //Send the data
    commonserverlibifaceptr->serverlib_netputs(buffer, sock, httpserverlib_getneedtoquit);
  }
  free(buffer);
  free(path);
  free(sendbuffer);
  free(netgetc_buffer);

  commonserverlibifaceptr->serverlib_closeSocket(&sock);

  PTHREAD_LOCK(&httpserverlibmutex);
  --numhttpthreads;
  PTHREAD_UNLOCK(&httpserverlibmutex);

  return (void *) 0;
}

static void httpServerLoop_cleanup(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=httpserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "httpServerLoop_cleanup: In httpServerLoop_cleanup\n");

  PTHREAD_LOCK(&httpserverlibmutex);
  if (commonserverlibifaceptr) {
    for (i=0; i<numhttpthreads; i++) {
      commonserverlibifaceptr->serverlib_closeSocket(&httpclientsocket[i]);
    }
  }
  PTHREAD_UNLOCK(&httpserverlibmutex);
}

static void *httpserverlib_MainServerLoop(void *val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=httpserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int oldcancelstate=-1, result;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (!commonserverlibifaceptr) {
    //Can't host a server without commonserverlib
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to start http server\n", __func__);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
    return (void *) 0;
  }
  sock=commonserverlibifaceptr->serverlib_setupTCPListenSocket(INADDR_ANY, SERVER_PORT, httpserverlib_getneedtoquit);
  if (sock<0) {
    return (void *) 0;
  }
  while(!httpserverlib_getneedtoquit()) {
    clientsock=commonserverlibifaceptr->serverlib_waitForConnection(sock, httpserverlib_getneedtoquit);
    if (clientsock<0) {
       continue;
    }
    PTHREAD_LOCK(&httpserverlibmutex);
    if (numhttpthreads<MAX_HTTP_THREADS) {
      httpclientsocket[numhttpthreads]=clientsock;
      result=pthread_create(&httpserverthreads[numhttpthreads], NULL, httpparser, (void *) httpclientsocket[numhttpthreads]);
      if (result==0) {
        ++numhttpthreads;
      }
    }
    PTHREAD_UNLOCK(&httpserverlibmutex);
    if (oldcancelstate != -1) {
    }
  }
  commonserverlibifaceptr->serverlib_closeSocket(&sock);

  httpServerLoop_cleanup();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static void httpserverlib_setneedtoquit(int val) {
  PTHREAD_LOCK(&httpserverlibmutex);
  needtoquit=val;
  PTHREAD_UNLOCK(&httpserverlibmutex);
}

static int httpserverlib_getneedtoquit() {
  int val;

  PTHREAD_LOCK(&httpserverlibmutex);
  val=needtoquit;
  PTHREAD_UNLOCK(&httpserverlibmutex);

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int httpserverlib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "httpserverlib_init: Starting the HTTP Server thread\n");
  if (httpserverlib_thread==0) {
    result=pthread_create(&httpserverlib_thread, NULL, httpserverlib_MainServerLoop, (void *) ((unsigned short) 0));
    if (result!=0) {
      httpserverlib_thread=0;
      debuglibifaceptr->debuglib_printf(1, "httpserverlib_init: Failed to spawn main http server thread\n");
      return -1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void httpserverlib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Cancel the HTTP server loop thread and wait for it to exit
  debuglibifaceptr->debuglib_printf(1, "httpserverlib_shutdown: Cancelling the HTTP Server thread\n");
  httpserverlib_setneedtoquit(1);
  debuglibifaceptr->debuglib_printf(1, "httpserverlib_shutdown: Waiting for HTTP Server thread to exit\n");
  pthread_join(httpserverlib_thread, NULL);
  debuglibifaceptr->debuglib_printf(1, "httpserverlib_shutdown: The HTTP Server thread has been shutdown\n");
  httpserverlib_thread=0;

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int httpserverlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  simclist_ifaceptrs_ver_1_t *simclistifaceptr=httpserverlib_deps[SIMCLIST_DEPIDX].ifaceptr;
	int result;

  debuglibifaceptr->debuglib_printf(1, "Entering httpserverlib_init\n");

	++httpserverlib_inuse;
	if (httpserverlib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting httpserverlib_init, already initialised, use count=%d\n", httpserverlib_inuse);
		return -1;
  }
  needtoquit=0;

#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&httpserverlibmutex, &errorcheckmutexattr);
#endif
  simclistifaceptr->list_init(&httpserverlib_cmd_listener_funcs_ptr);

  //setting the custom spanning functions
  simclistifaceptr->list_attributes_copy(&httpserverlib_cmd_listener_funcs_ptr, list_custommeter_pointer, 1);

  //setting the custom comparator
  simclistifaceptr->list_attributes_comparator(&httpserverlib_cmd_listener_funcs_ptr, list_customcomparator_pointer);

  debuglibifaceptr->debuglib_printf(1, "Exiting httpserverlib_init\n");

	return 0;
}

void httpserverlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=httpserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  simclist_ifaceptrs_ver_1_t *simclistifaceptr=httpserverlib_deps[SIMCLIST_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=httpserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering httpserverlib_shutdown\n");
  if (httpserverlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting httpserverlib_shutdown, Already shutdown\n");
    return;
  }
	--httpserverlib_inuse;
	if (httpserverlib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting httpserverlib_shutdown, Still in use, use count=%d\n", httpserverlib_inuse);
		return;
	}
	//No longer in use
  simclistifaceptr->list_destroy(&httpserverlib_cmd_listener_funcs_ptr);

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&httpserverlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting httpserverlib_shutdown\n");
}

/*
  Generic function to register a listener
  Input: listenerlist The list to add the listener function pointer to
         funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: It is not a bug here that we aren't using & in the simclist calls since the list is already being received as a pointer argument
*/
static inline int httpserverlib_register_generic_listener(list_t *listenerlist, void **funcptr) {
  simclist_ifaceptrs_ver_1_t *simclistifaceptr=httpserverlib_deps[SIMCLIST_DEPIDX].ifaceptr;

  PTHREAD_LOCK(&httpserverlibmutex);
	if (httpserverlib_inuse==0) {
		PTHREAD_UNLOCK(&httpserverlibmutex);
		return -1;
	}
  simclistifaceptr->list_append(listenerlist, funcptr);

  PTHREAD_UNLOCK(&httpserverlibmutex);

	return 0;
}

/*
  Generic function to unregister a listener
  Input: listenerlist The list to add the listener function pointer to
         funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: It is not a bug here that we aren't using & in the simclist calls since the list is already being received as a pointer argument
*/
static inline int httpserverlib_unregister_generic_listener(list_t *listenerlist, void **funcptr) {
  simclist_ifaceptrs_ver_1_t *simclistifaceptr=httpserverlib_deps[SIMCLIST_DEPIDX].ifaceptr;
  int pos, result;
  void *tmpfuncptr;

  PTHREAD_LOCK(&httpserverlibmutex);
	if (httpserverlib_inuse==0) {
		PTHREAD_UNLOCK(&httpserverlibmutex);
		return -1;
	}
  pos=0;
  simclistifaceptr->list_iterator_start(listenerlist);
  while (simclistifaceptr->list_iterator_hasnext(listenerlist)) {
		tmpfuncptr=*(void **) simclistifaceptr->list_iterator_next(listenerlist);
		if (funcptr==tmpfuncptr) {
			break;
    }
    ++pos;
  }
  if (!simclistifaceptr->list_iterator_hasnext(listenerlist)) {
    pos=-1;
  }
  simclistifaceptr->list_iterator_stop(listenerlist);

  if (pos!=-1) {
    simclistifaceptr->list_delete_at(listenerlist, pos);
    result=0;
  } else {
    result=-1;
  }
	PTHREAD_UNLOCK(&httpserverlibmutex);

  return result;
}

/*
  Register a listener for a http command
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int httpserverlib_register_cmd_listener(void *funcptr) {
	return httpserverlib_register_generic_listener(&httpserverlib_cmd_listener_funcs_ptr, &funcptr);
}

/*
  Unregister a listener for a http command
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
*/
int httpserverlib_unregister_cmd_listener(void *funcptr) {
  return httpserverlib_unregister_generic_listener(&httpserverlib_cmd_listener_funcs_ptr, &funcptr);
}

moduleinfo_ver_generic_t *httpserverlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &httpserverlib_moduleinfo_ver_1;
}
