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

//The telnet code is based on some debugging with packet dumps of Quagga's Telnet interface and
//  some Windows and Linux telnet clients

*/

#include <boost/config.hpp>
#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/telnet.h>
#include <map>
#include <list>
#include <string>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/configlib/configlib.hpp"

//Result codes that can be returned by a library's http listeners

//The following three values shouldn't be changed until CMDSERVERLIBINTERFACE_VER_1 has been removed
//Changing them from #define to static const for this internal file
#undef CMDLISTENER_NOERROR
#undef CMDLISTENER_NOTHANDLED
#undef CMDLISTENER_CMDINVALID
static const int CMDLISTENER_NOERROR=0; //Return this when the command has been successfully processed
static const int CMDLISTENER_NOTHANDLED=1; //Return this when your listener hasn't handled the command
static const int CMDLISTENER_CMDINVALID=2; //Return this when your listener has handled the command but the command has the incorrect format

//Other static variables
static const int SMALLBUF_SIZE=256;
static const int BUFFER_SIZE=4096;
static const uint16_t DEFAULT_CMD_TCPPORT=64932;
static const int MAX_CMDSERV_THREADS=10;
static const char * const INTERFACE_VERSION="000700"; // The Version of the command interface implemented by this library

typedef struct cmdserver_cmdfunc cmdserver_cmdfunc_t;

typedef struct {
  pthread_t thread;
  int clientsock;
  char *buffer;
  char *netgetc_buffer;
  bool istelnetclient=false; //Set to true if a telnet client is detected
  bool telnetsuppressecho=false; //If true, then don't echo back what the client sends when in telnet mode
} cmdserv_clientthreaddata_t;

struct cmdserver_cmdfunc {
  std::string cmdname;
  std::string usage;
  std::string description;
  std::string longdesc;
  cmd_func_ptr_t func;
};

//Command Name, The command struct
static std::map<std::string, cmdserver_cmdfunc_t> cmdfuncs;

static cmdserv_clientthreaddata_t gcmdserv_clientthreaddata[MAX_CMDSERV_THREADS];
static pthread_mutex_t cmdserverlibmutex = PTHREAD_MUTEX_INITIALIZER;
static int cmdserverlib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when cmdserverlib should exit
static pthread_t cmdserverlib_thread;

//Username and password retrieved from config file for the command interface
static std::string cmdserverlib_username;
static std::string cmdserverlib_password;

//Lists
static std::list<cmd_func_ptr_t> cmdserverlib_cmd_listener_funcs_ptr; //A list of command listener functions
static std::list<networkclientclose_func_ptr_t> cmdserverlib_networkclientclose_listener_funcs_ptr;

//Function Declarations
static void cmdserverlib_setneedtoquit(int val);
static int cmdserverlib_getneedtoquit();
static int cmdserverlib_start(void);
static void cmdserverlib_stop(void);
static int cmdserverlib_init(void);
static void cmdserverlib_shutdown(void);
static int cmdserverlib_netputs(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void));
static int cmdserverlib_register_cmd_function(const char *name, const char *description, cmd_func_ptr_t funcptr);
static int cmdserverlib_register_cmd_longdesc(const char *name, const char *usage, const char *description, const char *longdesc, cmd_func_ptr_t funcptr);
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
const static int DEBUGLIB_DEPIDX=0;
const static int COMMONSERVERLIB_DEPIDX=1;
const static int CONFIGLIB_DEPIDX=2;

static cmdserverlib_ifaceptrs_ver_1_t cmdserverlib_ifaceptrs_ver_1={
  cmdserverlib_netputs,
  cmdserverlib_register_cmd_function,
  cmdserverlib_register_cmd_longdesc,
  cmdserverlib_register_cmd_listener,
  cmdserverlib_unregister_cmd_listener,
  cmdserverlib_register_networkclientclose_listener,
  cmdserverlib_unregister_networkclientclose_listener
};

static cmdserverlib_ifaceptrs_ver_2_t cmdserverlib_ifaceptrs_ver_2={
  cmdserverlib_netputs,
  cmdserverlib_register_cmd_function,
  cmdserverlib_register_cmd_longdesc,
  cmdserverlib_register_cmd_listener,
  cmdserverlib_unregister_cmd_listener,
  cmdserverlib_register_networkclientclose_listener,
  cmdserverlib_unregister_networkclientclose_listener,
  &CMDLISTENER_NOERROR,
  &CMDLISTENER_NOTHANDLED,
  &CMDLISTENER_CMDINVALID
};

static moduleiface_ver_1_t cmdserverlib_ifaces[]={
  {
    &cmdserverlib_ifaceptrs_ver_1,
    CMDSERVERLIBINTERFACE_VER_1
  },
  {
    &cmdserverlib_ifaceptrs_ver_2,
    CMDSERVERLIBINTERFACE_VER_2
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
    "configlib",
    NULL,
    CONFIGLIBINTERFACECPP_VER_2,
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
    cmdserverlib_netputs(helpline.c_str(), clientsock, NULL);
    for (auto const &cmdfunc : cmdfuncs) {
      helpline=cmdfunc.second.cmdname;
      helpline+="\n  ";
      helpline+=cmdfunc.second.description;
      helpline+="\n";
      cmdserverlib_netputs(helpline.c_str(), clientsock, NULL);
    }
  } else {
    try {
      //Use the parameter (assume a single space for now) as a command to display help for
      std::string name=thestring.substr(5);
      std::string nametmp=name;
      nametmp+="\n";

      cmdserver_cmdfunc_t cmdfunc=cmdfuncs.at(thestring.substr(5));
      std::string usage=cmdfunc.usage;
      std::string description=cmdfunc.description;
      std::string longdesc=cmdfunc.longdesc;

      thestring="Command: ";
      thestring+=name;
      thestring+="\n";
      if (usage!="") {
        thestring="Usage: ";
        thestring+=usage;
        thestring+="\n       ";
      }
      if (longdesc!="") {
        thestring+=longdesc;
      } else {
        thestring+="Description: ";
        thestring+=description;
      }
      thestring+="\n";
      cmdserverlib_netputs(thestring.c_str(), clientsock, NULL);
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
	int listener_result;
	int (*cmdfunc)(const char *cmdstr, int clientsock);

	listener_result=CMDLISTENER_NOTHANDLED;
  for (auto const &it : cmdserverlib_cmd_listener_funcs_ptr) {
    cmdfunc=it;
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
  void (*networkclientclosefunc)(int clientsock);

  for (auto const &it : cmdserverlib_networkclientclose_listener_funcs_ptr) {
    networkclientclosefunc=it;
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

/*
  Description: Read a string over a network socket and process telnet commands
  NOTE: Only some telnet commands are handled at the moment and they are all currently ignored
  Reads at most one less than size characters and adds '\0' after the last character
*/
static char *cmdserverlib_netgets_with_telnet(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd, bool *istelnetclient=NULL, bool telnetsuppressecho=false) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  int c=EOF;
  int pos;
  int in_telnet_command=0;
  int telnet_command_byte=-1;
  int telnet_data_byte=-1, num_telnet_data_bytes=0;
  int cur_telnet_data_byte=0;

  pos=0;

  while (pos < (size-1)) {
    c=commonserverlibifaceptr->serverlib_netgetc_with_quitpipe(sock, netgetc_buffer, netgetc_bufsize, netgetc_pos, netgetc_received, getAbortEarlyfuncptr, quitpipefd);
    if (c == EOF) {
      break;
    }
    //Handle Telnet commands first before doing translation and carriage return detection
    if (!in_telnet_command && c==IAC) {
      if (istelnetclient) {
        if (*istelnetclient==false) {
          debuglibifaceptr->debuglib_printf(1, "%s: Telnet client detected\n", __func__);
        }
        //Set the is telnet client flag
        *istelnetclient=true;
      }
      //Start of a telnet command
      in_telnet_command=1;
      telnet_command_byte=-1;
      cur_telnet_data_byte=num_telnet_data_bytes=0;
      continue;
    }
    if (in_telnet_command) {
      if (telnet_command_byte==-1) {
        telnet_command_byte=c;

        //Always interpret as 1 for now which is usually okay for Putty client
        num_telnet_data_bytes=1;
      } else {
        ++cur_telnet_data_byte;
        if (cur_telnet_data_byte>=num_telnet_data_bytes) {
          in_telnet_command=0;
        }
      }
      continue;
    }
    //If in Telnet mode, send back the characters that were sent to us if
    //  suppressecho is also not true
    if (istelnetclient) {
      if (*istelnetclient==true) {
        if (!telnetsuppressecho) {
          char tmpstr[4];
          int sendlen=0, sendpos=0;
          bool contaftersend=false; //Continue back to beginning of while after sending back the characters instead of storing to buffer

          if (c=='\b' || c==0x7F) {
            if (pos>0) {
              //Backspace
              tmpstr[sendpos++]='\b';
              tmpstr[sendpos++]=' ';
              tmpstr[sendpos++]='\b';
              sendlen+=3;
              pos--; //Actually apply the backspace to the buffer
            }
            contaftersend=true; //Jump back to beginning of while loop so we don't store the backspace in the buffer
          } else if (c==0) {
            //Some Linux/BSD Telnet clients send '\r', 0 instead of '\r\n'
            tmpstr[sendpos]='\n';
            ++sendlen;
          } else {
            tmpstr[sendpos]=c;
            ++sendlen;
          }
          if (sendlen>0) {
            send(sock, tmpstr, sendlen, MSG_NOSIGNAL);
          }
          if (contaftersend) {
            continue;
          }
        }
        //Checks even with echo suppression enabled
        if (c=='\b' || c==0x7F) {
          if (pos>0) {
            //Backspace
            pos--; //Actually apply the backspace to the buffer
          }
          continue; //Jump back to beginning of while loop so we don't store the backspace in the buffer
        } else if (c==0) {
          c='\n';
        }
      }
    }
    if (c=='\n') {
      break;
    }
    s[pos]=c;
    pos++;
  }
  //Either EOF or size exceeded
  if (c=='\n') {
    s[pos]=c;
    pos++;
  }
  s[pos]='\0';

  if (pos == 0) {
    //EOF occurred
    return NULL;
  } else {
    return s;
  }
}

//Special netputs function for cmd server
//Converts any form of end-of-line into \r\n and turns off 8th bit to be more complient with Telnet protocol
static int cmdserverlib_netputs(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void)) {
  size_t len=strlen(s);
  int sent, pos;

  //Convert the string into telnet form
  std::string sendstr="";
  pos=0;
  while (len > 0) {
    if ( *(s+pos)=='\r') {
      //Ignore \r
      ++pos;
      --len;
      continue;
    } else if ( *(s+pos)=='\n') {
      //Convert \n into \r\n
      sendstr+="\r\n";
    } else {
      sendstr+=*(s+pos) & 0x7f;
    }
    ++pos;
    --len;
  }
  //Send the converted string
  len=strlen(sendstr.c_str());
  pos=0;
  while (len > 0) {
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        return -2;
      }
    }
    sent = send(sock, (sendstr.c_str()) + pos, len, MSG_NOSIGNAL);
    if (sent < 0) {
      //An error occurred while sending
      return -1;
    }
    pos+=sent;
    len-=sent;
  }
  return 0;
}

//Special netputs function for cmd server
//Converts any form of end-of-line into \r\n to be more complient with Telnet protocol
static int cmdserverlib_netputs_with_telnet_command(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void)) {
  size_t len=strlen(s);
  int sent, pos;

  //Convert the string into telnet form
  std::string sendstr="";
  pos=0;
  while (len > 0) {
    if ( *(s+pos)=='\r') {
      //Ignore \r
      ++pos;
      --len;
      continue;
    } else if ( *(s+pos)=='\n') {
      //Convert \n into \r\n
      sendstr+="\r\n";
    } else {
      sendstr+=*(s+pos);
    }
    ++pos;
    --len;
  }
  //Send the converted string
  len=strlen(sendstr.c_str());
  pos=0;
  while (len > 0) {
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        return -2;
      }
    }
    sent = send(sock, (sendstr.c_str()) + pos, len, MSG_NOSIGNAL);
    if (sent < 0) {
      //An error occurred while sending
      return -1;
    }
    pos+=sent;
    len-=sent;
  }
  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void *cmdserverlib_networkClientLoop(void *thread_val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) cmdserverlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  configlib_ifaceptrs_ver_2_cpp_t *configlibifaceptr=(configlib_ifaceptrs_ver_2_cpp_t *) cmdserverlib_deps[CONFIGLIB_DEPIDX].ifaceptr;
  cmdserv_clientthreaddata_t *dataptr;
  int threadslot;
  int netgetc_pos=0, netgetc_received=0;
  size_t len;
  int listener_result;

  threadslot=(long) thread_val;
  dataptr=&gcmdserv_clientthreaddata[threadslot];

  dataptr->istelnetclient=false; //Start in non-telnet mode until a Telnet client is detected

  //Allocate buffer space
  dataptr->netgetc_buffer=(char *) malloc(SMALLBUF_SIZE*sizeof(char));
  if (!dataptr->netgetc_buffer) {
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to allocate memory for cmdServer netgetc_buffer\n", __func__);
    cmdserverlib_cleanupClientThread((void *) threadslot);
    return (void *) 1;
  }
  //First output Telnet setup commands for if the client is a Telnet client
  //NOTE: Some clients won't send Telnet commands unless they first receive Telnet commands so we send
  //  this sequence to get them started in Telnet mode
  //Non-telnet programs should filter out character codes > 127 to ignore these characters
  //Tell the Telnet client that we will echo back characters the user types
  //Tell the Telnet client to disable line buffering
  const unsigned char strtelnetcmds[]={IAC, WILL, TELOPT_ECHO, IAC, WILL, TELOPT_SGA, IAC, DONT, TELOPT_LINEMODE, 0};
  cmdserverlib_netputs_with_telnet_command((const char *) strtelnetcmds, dataptr->clientsock, cmdserverlib_getneedtoquit);

  cmdserverlib_netputs("\n"
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
  //If the config file hasn't tried to load at least once we should block logins
  //  as if it is able to load and has a username and password then login with no
  //  auth before the config is loaded shouldn't be allowed
  bool blocklogin=true;
  bool noauth=true;
  if (configlibifaceptr->loadpending()==0 && configlibifaceptr->isloaded()) {
    //The config has been loaded
    blocklogin=false;
  }
  if (configlibifaceptr->loadpending()==1 && !configlibifaceptr->isloaded()) {
    //The config tried to load but failed so okay to allow login with no password
    blocklogin=false;
  }
  if (blocklogin) {
    cmdserverlib_netputs("Unable to login as config file not loaded yet\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
    cmdserverlib_cleanupClientThread((void *) threadslot);
    return (void *) 1;
  }
  if (configlibifaceptr->isloaded()) {
    bool result, result2;
    result=configlibifaceptr->getnamevalue_cpp("cmdserver", "username", cmdserverlib_username);
    result2=configlibifaceptr->getnamevalue_cpp("cmdserver", "password", cmdserverlib_password);
    if (result && result2) {
      noauth=false;
    }
  }
  if (!noauth) {
    bool isauthed=false;
    int authattempts=0;
    while (!isauthed && authattempts<3 && !cmdserverlib_getneedtoquit()) {
      std::string inputusername, inputpassword;
      authattempts++;
      cmdserverlib_netputs("Username: ", dataptr->clientsock, cmdserverlib_getneedtoquit);
      if (cmdserverlib_netgets_with_telnet(dataptr->buffer, BUFFER_SIZE, dataptr->clientsock, dataptr->netgetc_buffer, SMALLBUF_SIZE*sizeof(char), &netgetc_pos, &netgetc_received, cmdserverlib_getneedtoquit, -1, &dataptr->istelnetclient, dataptr->telnetsuppressecho) != NULL) {
        if (cmdserverlib_getneedtoquit()) {
          continue;
        }
        //Remove trailing newlines at the end of the command
        len=strlen(dataptr->buffer);
        while (len>0) {
          if (dataptr->buffer[len-1]=='\n' || dataptr->buffer[len-1]=='\r') {
            dataptr->buffer[len-1]=0;
            --len;
          } else {
            //No more whitespace
            break;
          }
        }
        if (len==0) {
          //Username can't be empty
          continue;
        }
        inputusername=dataptr->buffer;
      }
      cmdserverlib_netputs("Password: ", dataptr->clientsock, cmdserverlib_getneedtoquit);

      //Turn off local echo for password input if Telnet client detection
      dataptr->telnetsuppressecho=true;
      //unsigned char strtmp[5];
      //if (dataptr->istelnetclient) {
      //  strtmp[0]=IAC;
      //  strtmp[1]=WILL;
      //  strtmp[2]=TELOPT_ECHO;
      //  strtmp[3]=0;
      //  cmdserverlib_netputs_with_telnet_command((const char *) strtmp, dataptr->clientsock, cmdserverlib_getneedtoquit);
      //}
      char *netgets_result=cmdserverlib_netgets_with_telnet(dataptr->buffer, BUFFER_SIZE, dataptr->clientsock, dataptr->netgetc_buffer, SMALLBUF_SIZE*sizeof(char), &netgetc_pos, &netgetc_received, cmdserverlib_getneedtoquit, -1, &dataptr->istelnetclient, dataptr->telnetsuppressecho);

      //Turn on local echo and add a newline if Telnet client detected
      dataptr->telnetsuppressecho=false;
      //if (dataptr->istelnetclient) {
      //  strtmp[1]=WONT;
      //  strtmp[3]='\n';
      //  strtmp[4]=0;
      //  cmdserverlib_netputs_with_telnet_command((const char *) strtmp, dataptr->clientsock, cmdserverlib_getneedtoquit);
      //}
      //Send a newline if in Telnet mode after password input
      if (dataptr->istelnetclient) {
        cmdserverlib_netputs("\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
      }
      if (netgets_result!=NULL) {
        if (cmdserverlib_getneedtoquit()) {
          continue;
        }
        //Remove trailing newlines at the end of the command
        len=strlen(dataptr->buffer);
        while (len>0) {
          if (dataptr->buffer[len-1]=='\n' || dataptr->buffer[len-1]=='\r') {
            dataptr->buffer[len-1]=0;
            --len;
          } else {
            //No more whitespace
            break;
          }
        }
        //Password can be empty
        inputpassword=dataptr->buffer;
      }
      if (inputusername==cmdserverlib_username && inputpassword==cmdserverlib_password) {
        isauthed=true;
      } else {
        cmdserverlib_netputs("Login incorrect\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
      }
    }
    if (!isauthed) {
      cmdserverlib_netputs("Authorization failed\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
      cmdserverlib_cleanupClientThread((void *) threadslot);
      return (void *) 0;
    }
  }
  //Command Loop
  while (!cmdserverlib_getneedtoquit()) {
    cmdserverlib_netputs("> ", dataptr->clientsock, cmdserverlib_getneedtoquit);
    if (cmdserverlib_netgets_with_telnet(dataptr->buffer, BUFFER_SIZE, dataptr->clientsock, dataptr->netgetc_buffer, SMALLBUF_SIZE*sizeof(char), &netgetc_pos, &netgetc_received, cmdserverlib_getneedtoquit, -1, &dataptr->istelnetclient, dataptr->telnetsuppressecho) != NULL) {
      len=strlen(dataptr->buffer);

      //Remove trailing whitespace at the end of the command
      while (len>0) {
        if (dataptr->buffer[len-1]==' ' || dataptr->buffer[len-1]=='\t' || dataptr->buffer[len-1]=='\n' || dataptr->buffer[len-1]=='\r') {
          dataptr->buffer[len-1]=0;
          --len;
        } else {
          //No more whitespace
          break;
        }
      }
      if (len==0) {
        //This line only had whitespace
        continue;
      }
      //Recalculate the length
      len=strlen(dataptr->buffer);
      if (strncmp(dataptr->buffer, "quit", 4)==0) {
        break;
      } else if (strncmp(dataptr->buffer, "interface version", 17)==0) {
        sprintf(dataptr->buffer, "INTERFACEVERSION=%s\n", INTERFACE_VERSION);
        cmdserverlib_netputs(dataptr->buffer, dataptr->clientsock, cmdserverlib_getneedtoquit);
      } else {
				listener_result=cmdserverlib_call_cmd_listeners(dataptr->buffer, dataptr->clientsock);
				if (listener_result==CMDLISTENER_NOTHANDLED) {
					cmdserverlib_netputs("Unknown Command\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
				}
				if (listener_result==CMDLISTENER_CMDINVALID) {
          cmdserverlib_netputs("Command Incorrectly Formatted\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
        }
			}
    } else {
      //Connection error or closed
      break;
    }
  }
  cmdserverlib_netputs("logout\n", dataptr->clientsock, cmdserverlib_getneedtoquit);
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
      cmdserverlib_netputs("The maximum number of connections has been reached\n", clientsock, cmdserverlib_getneedtoquit);
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
  cmdserverlib_register_cmd_longdesc("help", "help or help <command>", "Get help for a command", "Get a summary for all commands or\n       Get help for a specific command", cmdserverlib_processhelpcommand);

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
  cmdserverlib_cmd_listener_funcs_ptr.clear();
  cmdserverlib_networkclientclose_listener_funcs_ptr.clear();

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
  return cmdserverlib_register_cmd_longdesc(name, nullptr, description, nullptr, funcptr);
}

/*
  Register a cmd command with usage info and a long description function
  Input: name The name of the command
         usage Info on how to use the command
           Use NULL or "" for no usage
         description A short description of the command
         longdesc A long description of the command (newlines should have 7 spaces after them and be in \r\n format)
           Use NULL or "" for no long description
         funcptr A pointer to the function that handles the command
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to search for a free slot since this function should only ever be called once at program startup
  NOTE: Cleanup will automatically be handled by the cmdserverlib shutdown function
*/
static int cmdserverlib_register_cmd_longdesc(const char *name, const char *usage, const char *description, const char *longdesc, cmd_func_ptr_t funcptr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) cmdserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  pthread_mutex_lock(&cmdserverlibmutex);
  if (cmdserverlib_inuse==0) {
    pthread_mutex_unlock(&cmdserverlibmutex);
    return -1;
  }
  cmdserver_cmdfunc_t cmdfunc;
  cmdfunc.cmdname=name;
  if (usage) {
    cmdfunc.usage=usage;
  } else {
    cmdfunc.usage="";
  }
  cmdfunc.description=description;
  if (longdesc) {
    cmdfunc.longdesc=longdesc;
  } else {
    cmdfunc.longdesc="";
  }
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
  if (cmdserverlib_inuse==0) {
    return -1;
  }
  //First check if this listener has already been added as since it is a pointer to a fixed function it should only be added once
  for (auto it=cmdserverlib_cmd_listener_funcs_ptr.begin(); it!=cmdserverlib_cmd_listener_funcs_ptr.end(); ++it) {
    if (funcptr==*it) {
      //Return 0 as if the function was still added as it has already been added
      return 0;
    }
  }
  cmdserverlib_cmd_listener_funcs_ptr.push_back(funcptr);

  return 0;
}

/*
  Unregister a listener for a cmd command
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  //NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int cmdserverlib_unregister_cmd_listener(cmd_func_ptr_t funcptr) {
  if (cmdserverlib_inuse==0) {
    return -1;
  }
  for (auto it=cmdserverlib_cmd_listener_funcs_ptr.begin(); it!=cmdserverlib_cmd_listener_funcs_ptr.end(); ++it) {
    if (funcptr==*it) {
      cmdserverlib_cmd_listener_funcs_ptr.erase(it);
      return 0;
    }
  }
  return -1;
}

/*
  Register a listener for network client connection closing
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
  NOTE: Don't need to search for a free slot since this function should only ever be called once at program startup
*/
static int cmdserverlib_register_networkclientclose_listener(networkclientclose_func_ptr_t funcptr) {
  if (cmdserverlib_inuse==0) {
    return -1;
  }
  //First check if this listener has already been added as since it is a pointer to a fixed function it should only be added once
  for (auto it=cmdserverlib_networkclientclose_listener_funcs_ptr.begin(); it!=cmdserverlib_networkclientclose_listener_funcs_ptr.end(); ++it) {
    if (funcptr==*it) {
      //Return 0 as if the function was still added as it has already been added
      return 0;
    }
  }
  cmdserverlib_networkclientclose_listener_funcs_ptr.push_back(funcptr);

  return 0;
}

/*
  Unregister a listener for network client connection closing
  Input: funcptr A pointer to the listener function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int cmdserverlib_unregister_networkclientclose_listener(networkclientclose_func_ptr_t funcptr) {
  if (cmdserverlib_inuse==0) {
    return -1;
  }
  for (auto it=cmdserverlib_networkclientclose_listener_funcs_ptr.begin(); it!=cmdserverlib_networkclientclose_listener_funcs_ptr.end(); ++it) {
    if (funcptr==*it) {
      cmdserverlib_networkclientclose_listener_funcs_ptr.erase(it);
      return 0;
    }
  }
  return -1;
}

moduleinfo_ver_generic_t *cmdserverlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &cmdserverlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CmdServerLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) cmdserverlib_getmoduleinfo();
}
#endif
