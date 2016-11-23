/*
Title: Command Server Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides a TCP command interface to access various live info.
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

#include <boost/config.hpp>
#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <map>
#include <string>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonserverlib/commonserverlib.h"

#define SMALLBUF_SIZE 256
#define BUFFER_SIZE 4096
#define DEFAULT_CMD_TCPPORT 64932
#define MAX_CMDSERV_THREADS 10
#define INTERFACE_VERSION "000600" /* The Version of the command interface implemented by this library */

typedef struct cmdserver_cmdfunc cmdserver_cmdfunc_t;

typedef struct {
  pthread_t thread;
  int clientsock;
  char *buffer;
  char *netgetc_buffer;
} cmdserv_clientthreaddata_t;

struct cmdserver_cmdfunc {
  std::string cmdname;
  std::string description;
  cmd_func_ptr_t func;
};

//Command Name, The command struct
static std::map<std::string, cmdserver_cmdfunc_t> cmdfuncs;

static cmdserv_clientthreaddata_t gcmdserv_clientthreaddata[MAX_CMDSERV_THREADS];
static pthread_mutex_t cmdserverlibmutex = PTHREAD_MUTEX_INITIALIZER;
static int cmdserverlib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when cmdserverlib should exit
static pthread_t cmdserverlib_thread;

//Lists
static int cmdserverlib_num_cmd_listener_funcs=0;
static cmd_func_ptr_t *cmdserverlib_cmd_listener_funcs_ptr; //A list of command listener functions

static int cmdserverlib_num_networkclientclose_listener_funcs=0;
static networkclientclose_func_ptr_t *cmdserverlib_networkclientclose_listener_funcs_ptr;

//Function Declarations
static void cmdserverlib_setneedtoquit(int val);
static int cmdserverlib_getneedtoquit();
static int cmdserverlib_start(void);
static void cmdserverlib_stop(void);
static int cmdserverlib_init(void);
static void cmdserverlib_shutdown(void);
static int cmdserverlib_register_cmd_function(const char *name, const char *description, cmd_func_ptr_t funcptr);
static int cmdserverlib_register_cmd_listener(cmd_func_ptr_t funcptr);
static int cmdserverlib_unregister_cmd_listener(cmd_func_ptr_t funcptr);

//This listener is called just before the network client connection closes
static int cmdserverlib_register_networkclientclose_listener(networkclientclose_func_ptr_t funcptr);
static int cmdserverlib_unregister_networkclientclose_listener(networkclientclose_func_ptr_t funcptr);

//C Exports
extern "C" {

BOOST_SYMBOL_EXPORT moduleinfo_ver_generic_t *cmdserverlib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CmdServerLib_jnigetmodulesinfo( JNIEnv* env, jobject obj);
#endif
}

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define COMMONSERVERLIB_DEPIDX 1

static cmdserverlib_ifaceptrs_ver_1_t cmdserverlib_ifaceptrs_ver_1={
  cmdserverlib_register_cmd_function,
  cmdserverlib_register_cmd_listener,
  cmdserverlib_unregister_cmd_listener,
  cmdserverlib_register_networkclientclose_listener,
  cmdserverlib_unregister_networkclientclose_listener
};

static moduleiface_ver_1_t cmdserverlib_ifaces[]={
  {
    &cmdserverlib_ifaceptrs_ver_1,
    CMDSERVERLIBINTERFACE_VER_1
  },
  {
    nullptr, 0
  }
};

static moduledep_ver_1_t cmdserverlib_deps[]={
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
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t cmdserverlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "cmdserverlib",
  cmdserverlib_init,
  cmdserverlib_shutdown,
  cmdserverlib_start,
  cmdserverlib_stop,
  nullptr,
  nullptr,
  (moduleiface_ver_1_t (* const)[]) &cmdserverlib_ifaces,
  (moduledep_ver_1_t (*)[]) &cmdserverlib_deps
};

//Initialise global variables
//WARNING: Only call this when all client threads and arrays have been cleaned up
static void cmdserverlib_initglobals() {
  int i;

  for (i=0; i<MAX_CMDSERV_THREADS; i++) {
    gcmdserv_clientthreaddata[i].thread=0;
    gcmdserv_clientthreaddata[i].clientsock=-1;
  }
}

static int cmdserverlib_processhelpcommand(const char *buffer, int clientsock) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  size_t tmplen;

  tmplen=strlen(buffer)-1;
  if (tmplen>0 && buffer[tmplen] == '\n') {
    //Remove the newline at the end of the line
    --tmplen;
  }
  if (tmplen>0 && buffer[tmplen] == '\r') {
    //Remove the carriage return at the end of the line
    --tmplen;
  }
  ++tmplen; //Step up one to be length instead of pos
  std::string thestring=buffer;
  thestring=thestring.substr(0, tmplen);
  if (tmplen==4) {
    //Display a list of registered commands and their description
    std::string helpline="Here is a list of commands:\n";
    commonserverlibifaceptr->serverlib_netputs(helpline.c_str(), clientsock, NULL);
    for (auto const &cmdfunc : cmdfuncs) {
      helpline="  ";
      helpline+=cmdfunc.second.cmdname;
      helpline+=' ';
      helpline+=cmdfunc.second.description;
      helpline+='\n';
      commonserverlibifaceptr->serverlib_netputs(helpline.c_str(), clientsock, NULL);
    }
  } else {
    try {
      //Use the parameter (assume a single space for now) as a command to display help for
      std::string name=thestring.substr(5);
      std::string nametmp=name;
      nametmp+='\n';
      commonserverlibifaceptr->serverlib_netputs(nametmp.c_str(), clientsock, NULL);
      std::string description=cmdfuncs.at(thestring.substr(5)).description;
      thestring="Command: ";
      thestring+=name;
      thestring+="\nDescription: ";
      thestring+=description;
      thestring+='\n';
      commonserverlibifaceptr->serverlib_netputs(thestring.c_str(), clientsock, NULL);
    } catch (std::out_of_range& e) {
      //Do nothing as the command doesn't exist
    }
  }
  return CMDLISTENER_NOERROR;
}

/*
  Call all listeners for cmd commands
  Input: cmdstr The cmd command to process
         clientsock Use the clientsock to send output via serverlib_netputs
  Return CMDLISTENER_NOERROR when your listener has handled the command then this function will return
  Return CMDLISTENER_NOTHANDLED if your listener can't handle the command
  NOTE: Don't need to thread lock since listeners are all registered when the program first starts
*/
static inline int cmdserverlib_call_cmd_listeners(const char *cmdstr, int clientsock) {
	int i, listener_result;
	int (*cmdfunc)(const char *cmdstr, int clientsock);

	listener_result=CMDLISTENER_NOTHANDLED;
  for (i=0; i<cmdserverlib_num_cmd_listener_funcs; i++) {
    cmdfunc=cmdserverlib_cmd_listener_funcs_ptr[i];
    if (cmdfunc) {
			listener_result=cmdfunc(cmdstr, clientsock);
			if (listener_result!=CMDLISTENER_NOTHANDLED) {
				break;
			}
		}
  }
  if (listener_result==CMDLISTENER_NOTHANDLED) {
    //See if the command is registered with a dedicated function
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

    //Extract the command from the string
    std::string cmdstring=cmdstr;

    //Find the first occurance of whitespace
    int pos=0;
    while (pos<cmdstring.length()) {
      if (cmdstring[pos]==' ' || cmdstring[pos]=='\n' || cmdstring[pos]=='\r') {
        break;
      }
      ++pos;
    }
    std::string thecmd=cmdstring.substr(0, pos).c_str();
    try {
      cmd_func_ptr_t funcptr=cmdfuncs.at(thecmd).func;
      if (funcptr!=NULL) {
        listener_result=funcptr(cmdstr, clientsock);
      }
    } catch (std::out_of_range& e) {
      //Do nothing as the command doesn't exist
    }
  }
	return listener_result;
}

/*
  Call all listeners for network client close
  Input: clientsock The client socket that is closing
  NOTE: Don't need to thread lock since listeners are all registered when the program first starts
*/
static inline void cmdserverlib_call_networkclientclose_listeners(int clientsock) {
  int i;
  void (*networkclientclosefunc)(int clientsock);

  for (i=0; i<cmdserverlib_num_networkclientclose_listener_funcs; i++) {
    networkclientclosefunc=cmdserverlib_networkclientclose_listener_funcs_ptr[i];
    if (networkclientclosefunc) {
      networkclientclosefunc(clientsock);
    }
  }
}

//Call this just before exiting the client thread
//NOTE: Only need to thread lock for clientthreaddata.thread since no other threads access client variables if it is set
static void cmdserverlib_cleanupClientThread(void *val) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int threadslot;

  threadslot=(long) val;
  cmdserv_clientthreaddata_t *dataptr=&gcmdserv_clientthreaddata[threadslot];

  cmdserverlib_call_networkclientclose_listeners(dataptr->clientsock);

  if (dataptr->buffer) {
    free(dataptr->buffer);
    dataptr->buffer=NULL;
  }
  if (dataptr->netgetc_buffer) {
    free(dataptr->netgetc_buffer);
    dataptr->netgetc_buffer=NULL;
  }
  if (dataptr->clientsock!=-1) {
    commonserverlibifaceptr->serverlib_closeSocket(&dataptr->clientsock);
    dataptr->clientsock=-1;
  }
  pthread_mutex_lock(&cmdserverlibmutex);
  dataptr->thread=0;
  pthread_mutex_unlock(&cmdserverlibmutex);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void *cmdserverlib_networkClientLoop(void *thread_val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  cmdserv_clientthreaddata_t *dataptr;
  int threadslot;
  int netgetc_pos=0, netgetc_received=0;
  size_t len;
  int listener_result;

  threadslot=(long) thread_val;
  dataptr=&gcmdserv_clientthreaddata[threadslot];

  //Allocate buffer space
  dataptr->netgetc_buffer=(char *) malloc(SMALLBUF_SIZE*sizeof(char));
  if (!dataptr->netgetc_buffer) {
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to allocate memory for cmdServer netgetc_buffer\n", __func__);
    cmdserverlib_cleanupClientThread((void *) threadslot);
    return (void *) 1;
  }
  commonserverlibifaceptr->serverlib_netputs("\n"
          "# -------------------------\n"
          "# Watch Inputs Command Tool\n"
          "# Type quit to exit\n"
          "# -------------------------\n\n",
          dataptr->clientsock, cmdserverlib_getneedtoquit);

  dataptr->buffer=(char *) malloc(BUFFER_SIZE*sizeof(char));
  if (!dataptr->buffer) {
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to allocate memory for cmdServer buffer\n", __func__);
    cmdserverlib_cleanupClientThread((void *) threadslot);
    return (void *) 1;
  }
  //Command Loop
  while (!cmdserverlib_getneedtoquit()) {
    if (commonserverlibifaceptr->serverlib_netgets(dataptr->buffer, BUFFER_SIZE, dataptr->clientsock, dataptr->netgetc_buffer, SMALLBUF_SIZE*sizeof(char), &netgetc_pos, &netgetc_received, cmdserverlib_getneedtoquit) != NULL) {
      len=strlen(dataptr->buffer);

      if (strncmp(dataptr->buffer, "quit", 4)==0) {
        break;
      } else if (strncmp(dataptr->buffer, "interface version", 17)==0) {
        sprintf(dataptr->buffer, "INTERFACEVERSION=%s\n", INTERFACE_VERSION);
        commonserverlibifaceptr->serverlib_netputs(dataptr->buffer, dataptr->clientsock, cmdserverlib_getneedtoquit);
      } else {
				listener_result=cmdserverlib_call_cmd_listeners(dataptr->buffer, dataptr->clientsock);
				if (listener_result==CMDLISTENER_NOTHANDLED) {
					commonserverlibifaceptr->serverlib_netputs("Unknown Command\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
				}
				if (listener_result==CMDLISTENER_CMDINVALID) {
          commonserverlibifaceptr->serverlib_netputs("Command Incorrectly Formatted\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
        }
			}
    } else {
      //Connection error or closed
      break;
    }
  }
  cmdserverlib_cleanupClientThread((void *) threadslot);

  return (void *) 0;
}

static void cmdserverlib_MainServerLoop_cleanup() {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  pthread_t tmpthread;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  pthread_mutex_lock(&cmdserverlibmutex);
  for (i=0; i<MAX_CMDSERV_THREADS; i++) {
    if (gcmdserv_clientthreaddata[i].thread) {
      tmpthread=gcmdserv_clientthreaddata[i].thread;
      pthread_mutex_unlock(&cmdserverlibmutex);

      //Here we rely on the main thread having set quit
      pthread_join(tmpthread, NULL);
      pthread_mutex_lock(&cmdserverlibmutex);
    }
  }
  pthread_mutex_unlock(&cmdserverlibmutex);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//thread_val arg specifies the tcp port to listen on (unsigned short type) or 0 for default
//NOTE: Only need to thread lock for clientthreaddata.thread since no other client variables are accessed if it is set
static void *cmdserverlib_MainServerLoop(void *thread_val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int result, sock, clientsock, i;
  uint16_t tcpport=(long) thread_val;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  cmdserverlib_initglobals();

  if (tcpport == 0) {
    tcpport=DEFAULT_CMD_TCPPORT;
  }
  sock=commonserverlibifaceptr->serverlib_setupTCPListenSocket(INADDR_ANY, tcpport, cmdserverlib_getneedtoquit);
  if (sock<0) {
    return (void *) 0;
  }
  while(!cmdserverlib_getneedtoquit()) {
    clientsock=commonserverlibifaceptr->serverlib_waitForConnection(sock, cmdserverlib_getneedtoquit);
    if (clientsock<0) {
      continue;
    }
    //Check for a spare thread slot
    pthread_mutex_lock(&cmdserverlibmutex);
    for (i=0; i<MAX_CMDSERV_THREADS; i++) {
      if (gcmdserv_clientthreaddata[i].thread==0) {
        break;
      }
    }
    pthread_mutex_unlock(&cmdserverlibmutex);
    if (i<MAX_CMDSERV_THREADS) {
      gcmdserv_clientthreaddata[i].clientsock=clientsock;
      result=pthread_create(&gcmdserv_clientthreaddata[i].thread, NULL, cmdserverlib_networkClientLoop, (void *) i);
      if (result!=0) {
        //Failed to create thead
        gcmdserv_clientthreaddata[i].thread=0;
        commonserverlibifaceptr->serverlib_closeSocket(&clientsock);
      }
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: The maximum number of connections has been reached\n", __func__);
      commonserverlibifaceptr->serverlib_netputs("The maximum number of connections has been reached\n", clientsock, cmdserverlib_getneedtoquit);
      commonserverlibifaceptr->serverlib_closeSocket(&clientsock);
    }
  }
  commonserverlibifaceptr->serverlib_closeSocket(&sock);

  cmdserverlib_MainServerLoop_cleanup();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static void cmdserverlib_setneedtoquit(int val) {
  pthread_mutex_lock(&cmdserverlibmutex);
  needtoquit=val;
  pthread_mutex_unlock(&cmdserverlibmutex);
}

static int cmdserverlib_getneedtoquit() {
  int val;

  pthread_mutex_lock(&cmdserverlibmutex);
  val=needtoquit;
  pthread_mutex_unlock(&cmdserverlibmutex);

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int cmdserverlib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Register commands
  cmdserverlib_register_cmd_function("help", "Get help for a command", cmdserverlib_processhelpcommand);

  if (cmdserverlib_thread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the Command Server thread\n", __func__);
    pthread_create(&cmdserverlib_thread, NULL, cmdserverlib_MainServerLoop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
      result=-1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void cmdserverlib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlib_thread!=0) {
    //Cancel the Command server loop thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the Command Server thread\n", __func__);
    cmdserverlib_setneedtoquit(1);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for Command Server thread to exit\n", __func__);
    pthread_join(cmdserverlib_thread, NULL);
    cmdserverlib_thread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int cmdserverlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	++cmdserverlib_inuse;
	if (cmdserverlib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, cmdserverlib_inuse);
		return -1;
  }
  needtoquit=0;
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

	return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void cmdserverlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (cmdserverlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
	--cmdserverlib_inuse;
	if (cmdserverlib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, cmdserverlib_inuse);
		return;
	}
	//No longer in use
	cmdfuncs.clear();
	if (cmdserverlib_cmd_listener_funcs_ptr) {
    free(cmdserverlib_cmd_listener_funcs_ptr);
    cmdserverlib_cmd_listener_funcs_ptr=NULL;
    cmdserverlib_num_cmd_listener_funcs=0;
  }
  if (cmdserverlib_networkclientclose_listener_funcs_ptr) {
    free(cmdserverlib_networkclientclose_listener_funcs_ptr);
    cmdserverlib_networkclientclose_listener_funcs_ptr=NULL;
    cmdserverlib_num_cmd_listener_funcs=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register a cmd command with function
  Input: name The name of the command
         description A description of the command
         funcptr A pointer to the function that handles the command
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to search for a free slot since this function should only ever be called once at program startup
  NOTE: Cleanup will automatically be handled by the cmdserverlib shutdown function
*/
static int cmdserverlib_register_cmd_function(const char *name, const char *description, cmd_func_ptr_t funcptr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  void * *tmpptr;

  pthread_mutex_lock(&cmdserverlibmutex);
  if (cmdserverlib_inuse==0) {
    pthread_mutex_unlock(&cmdserverlibmutex);
    return -1;
  }
  cmdserver_cmdfunc_t cmdfunc;
  cmdfunc.cmdname=name;
  cmdfunc.description=description;
  cmdfunc.func=funcptr;

  cmdfuncs[cmdfunc.cmdname]=cmdfunc;

  pthread_mutex_unlock(&cmdserverlibmutex);

  return 0;
}

/*
  Register a listener for a cmd command
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
  NOTE: Don't need to search for a free slot since this function should only ever be called once at program startup
*/
static int cmdserverlib_register_cmd_listener(cmd_func_ptr_t funcptr) {
  void * *tmpptr;

  if (cmdserverlib_inuse==0) {
    return -1;
  }
  //Expand the array
  tmpptr=(void * *) realloc(cmdserverlib_cmd_listener_funcs_ptr, (cmdserverlib_num_cmd_listener_funcs+1)*sizeof(void *));
  if (tmpptr==NULL) {
    return -1;
  }
  cmdserverlib_cmd_listener_funcs_ptr=(cmd_func_ptr_t *) tmpptr;

  cmdserverlib_cmd_listener_funcs_ptr[cmdserverlib_num_cmd_listener_funcs]=funcptr;
  ++cmdserverlib_num_cmd_listener_funcs;

  return 0;
}

/*
  Unregister a listener for a cmd command
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  //NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int cmdserverlib_unregister_cmd_listener(cmd_func_ptr_t funcptr) {
  int i, result;

  if (cmdserverlib_inuse==0) {
    return -1;
  }
  for (i=0; i<cmdserverlib_num_cmd_listener_funcs; i++) {
    if (funcptr==cmdserverlib_cmd_listener_funcs_ptr[i]) {
      break;
    }
  }
  if (i!=cmdserverlib_num_cmd_listener_funcs) {
    cmdserverlib_cmd_listener_funcs_ptr[i]=NULL;
    result=0;
  } else {
    result=-1;
  }
  return result;
}

/*
  Register a listener for network client connection closing
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
  NOTE: Don't need to search for a free slot since this function should only ever be called once at program startup
*/
static int cmdserverlib_register_networkclientclose_listener(networkclientclose_func_ptr_t funcptr) {
  void * *tmpptr;

  if (cmdserverlib_inuse==0) {
    return -1;
  }
  //Expand the array
  tmpptr=(void * *) realloc(cmdserverlib_networkclientclose_listener_funcs_ptr, (cmdserverlib_num_networkclientclose_listener_funcs+1)*sizeof(void *));
  if (tmpptr==NULL) {
    return -1;
  }
  cmdserverlib_networkclientclose_listener_funcs_ptr=(networkclientclose_func_ptr_t *) tmpptr;

  cmdserverlib_networkclientclose_listener_funcs_ptr[cmdserverlib_num_networkclientclose_listener_funcs]=funcptr;
  ++cmdserverlib_num_networkclientclose_listener_funcs;

  return 0;
}

/*
  Unregister a listener for network client connection closing
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int cmdserverlib_unregister_networkclientclose_listener(networkclientclose_func_ptr_t funcptr) {
  int i, result;

  if (cmdserverlib_inuse==0) {
    return -1;
  }
  for (i=0; i<cmdserverlib_num_networkclientclose_listener_funcs; i++) {
    if (funcptr==cmdserverlib_networkclientclose_listener_funcs_ptr[i]) {
      break;
    }
  }
  if (i!=cmdserverlib_num_networkclientclose_listener_funcs) {
    cmdserverlib_networkclientclose_listener_funcs_ptr[i]=NULL;
    result=0;
  } else {
    result=-1;
  }
  return result;
}

moduleinfo_ver_generic_t *cmdserverlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &cmdserverlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CmdServerLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) cmdserverlib_getmoduleinfo();
}
#endif
