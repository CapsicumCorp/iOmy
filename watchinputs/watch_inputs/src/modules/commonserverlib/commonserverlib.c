/*
Title: Common Server Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Provides a common set of functions for server threads.
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

//TODO: Convert the socket to a struct so can store getc buffers and other info, then return pointer to the struct similar to FILE *
//TODO: abortearly function should be part of a struct for the socket since the module that opens the socket will also close it on abort

//Needed for accept4
#define _GNU_SOURCE

#include <poll.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <sys/types.h>
#include <arpa/inet.h>
#include <errno.h>
#ifdef __ANDROID__
#include <fcntl.h> //For O_CLOEXEC on Android < 21
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "commonserverlib.h"
#include "modules/debuglib/debuglib.h"

#define MAX_PENDING 10

//Function Declarations
static int serverlib_netgetc_with_quitpipe(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd);
static int serverlib_netgetc(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void));
static char *serverlib_netgets_with_quitpipe(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd);
static char *serverlib_netgets(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void));
static int serverlib_netputs(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void));
static int serverlib_netnput(const char *s, size_t len, int sock, int (* const getAbortEarlyfuncptr)(void));
static void serverlib_closeSocket(int *socket);
static int serverlib_setupTCPListenSocket(in_addr_t hostip, uint16_t port, int (* const getAbortEarlyfuncptr)(void));
static int serverlib_waitForConnection_with_quitpipe(int sock, int (* const getAbortEarlyfuncptr)(void), int quitpipefd);
static int serverlib_waitForConnection(int sock, int (* const getAbortEarlyfuncptr)(void));

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0

static commonserverlib_ifaceptrs_ver_1_t commonserverlib_ifaceptrs_ver_1={
  serverlib_netgetc,
  serverlib_netgets,
  serverlib_netputs,
  serverlib_netnput,
  serverlib_closeSocket,
  serverlib_setupTCPListenSocket,
  serverlib_waitForConnection,
  serverlib_netgetc_with_quitpipe,
  serverlib_netgets_with_quitpipe,
  serverlib_waitForConnection_with_quitpipe
};

static moduleiface_ver_1_t commonserverlib_ifaces[]={
  {
    &commonserverlib_ifaceptrs_ver_1,
    COMMONSERVERLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduledep_ver_1_t commonserverlib_deps[]={
  {
    "debuglib",
    NULL,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    NULL, NULL, 0, 0
  }
};

static moduleinfo_ver_1_t commonserverlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "commonserverlib",
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  &commonserverlib_ifaces,
  &commonserverlib_deps
};

/*
  Description: Read a character over a network socket
  Arguments: getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
             quitpipefd A descriptor for a pipe that when written to cause this function to abort or -1 if not used
  Returns the character received or EOF if not more data
*/
static int serverlib_netgetc_with_quitpipe(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd) {
  struct pollfd fds[2];
  nfds_t nfds;
  int result, lerrno=0;
  int finished=0;

  if (quitpipefd!=-1) {
    nfds=2;
  } else {
    nfds=1;
  }
  if (*received <= 0 || (*pos)==(*received)) {
    //The buffer is empty so try to read more characters
    //First reset the received and pos values in case we don't get to do more reading
    *received=0;
    *pos=0;

    //Wait for the socket to become ready to read
    if (getAbortEarlyfuncptr) {
      finished=getAbortEarlyfuncptr();
    }
    while (!finished) {
      fds[0].fd=sock;
      fds[0].events=POLLIN;
      if (quitpipefd!=-1) {
        fds[1].fd=quitpipefd;
        fds[1].events=POLLIN;
      }
      result=poll(fds, nfds, 1000);
      lerrno=errno;
      if (result==0 || (result==-1 && lerrno==EINTR)) {
        //Timeout
        result=-2;
        if (getAbortEarlyfuncptr) {
          finished=getAbortEarlyfuncptr();
        }
        continue;
      }
      if (result==-1) {
        //An error occurred so abort
        break;
      }
      if (quitpipefd!=-1 && fds[1].revents == POLLIN) {
        //Time to quit
        break;
      }
      if (fds[0].revents != POLLIN) {
        //An error occurred so abort
        break;
      }
      //Read data from the socket
      *received = recv(sock, buffer, bufsize, 0);
      if (*received<0) {
        lerrno=errno;
      } else {
        lerrno=0;
      }
      *pos=0;
      finished=1;
    }
  }
  //recv returns 0 if the peer has performed an orderly shutdown
  if (*received > 0) {
    //Return the next character in the buffer and then increment the current buffer position
    return (unsigned char) buffer[ (*pos)++ ];
  }
  //No more characters left to read
  return EOF;
}

/*
  Description: Read a character over a network socket
  Arguments: getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
  Returns the character received or EOF if not more data
*/
static int serverlib_netgetc(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void)) {
  return serverlib_netgetc_with_quitpipe(sock, buffer, bufsize, pos, received, getAbortEarlyfuncptr, -1);
}

/*
  Description: Read a string over a network socket
  Reads at most one less than size characters and adds '\0' after the last character
*/
static char *serverlib_netgets_with_quitpipe(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd) {
  int c=EOF;
  int pos;

  pos=0;

  while (pos < (size-1)) {
    c=serverlib_netgetc_with_quitpipe(sock, netgetc_buffer, netgetc_bufsize, netgetc_pos, netgetc_received, getAbortEarlyfuncptr, quitpipefd);
    if (c == EOF || c=='\n') {
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

/*
  Description: Read a string over a network socket
  Reads at most one less than size characters and adds '\0' after the last character
*/
static char *serverlib_netgets(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void)) {
  return serverlib_netgets_with_quitpipe(s, size, sock, netgetc_buffer, netgetc_bufsize, netgetc_pos, netgetc_received, getAbortEarlyfuncptr, -1);
}

/*
  Description: Send a string over a network socket
  Arguments: getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
*/
static int serverlib_netputs(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void)) {
  return serverlib_netnput(s, strlen(s), sock, getAbortEarlyfuncptr);
}

/*
  Description: Send a string of length len over a network socket
  Arguments: getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
*/
static int serverlib_netnput(const char *s, size_t len, int sock, int (* const getAbortEarlyfuncptr)(void)) {
  int sent, pos;

  pos=0;
  while (len > 0) {
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        return -2;
      }
    }
    sent = send(sock, s + pos, len, MSG_NOSIGNAL);
    if (sent < 0) {
      //An error occurred while sending
      return -1;
    }
    pos+=sent;
    len-=sent;
  }
  return 0;
}

/*
  Close a socket and set it to NULL
*/
static void serverlib_closeSocket(int *socket) {
  debuglib_ifaceptrs_ver_1_t const * const debuglibifaceptr=commonserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  if ( socket != NULL ) {
    if (*socket != -1) {
      debuglibifaceptr->debuglib_printf(1, "%s: Closing socket: %d\n", __func__, *socket);
      close(*socket);
      *socket=-1;
    }
  }
}

/*
  Setup a socket to a tcp connection listener
  Arguments: hostip: The IP address to listen to or INADDR_ANY to listen on all IP addresses
             port: The port number to listen on
             getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
  Returns the socket number or negative value on error
*/
static int serverlib_setupTCPListenSocket(in_addr_t hostip, uint16_t port, int (* const getAbortEarlyfuncptr)(void)) {
  debuglib_ifaceptrs_ver_1_t const * const debuglibifaceptr=commonserverlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int sock, on, curretry, maxretries=60;
  struct sockaddr_in my_addr;

  curretry=0;
#ifdef __ANDROID__
#if __ANDROID_API__ < 21
  //SOCK_CLOEXEC wasn't defined until Android 21 but Android 21 just redefines it to O_CLOEXEC
  //  so that should be okay to use here
  while( (sock = socket(AF_INET, SOCK_STREAM|O_CLOEXEC, 6)) < 0) {
#else
  while( (sock = socket(AF_INET, SOCK_STREAM|SOCK_CLOEXEC, 6)) < 0) {
#endif
#else
  while( (sock = socket(AF_INET, SOCK_STREAM|SOCK_CLOEXEC, 6)) < 0) {
#endif
    //Failed to create a socket so wait 1 second then try again up to 60 seconds
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to create socket for hostip: %d.%d.%d.%d, port: %d, errno=%d\n",
      __func__,
      (hostip >> 24) & 0xFF,
      (hostip >> 16) & 0xFF,
      (hostip >> 8) & 0xFF,
      hostip & 0xFF,
      port, errno);
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
        return -1;
      }
    }
    sleep(1);
    if (curretry < maxretries) {
      debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
      return -1;
    }
    ++curretry;
  }
  /* Enable address reuse */
  on = 1;
  setsockopt( sock, SOL_SOCKET, SO_REUSEADDR, &on, sizeof(on) );

  memset(&my_addr, 0, sizeof(my_addr));
  my_addr.sin_family = AF_INET;
  my_addr.sin_addr.s_addr = hostip;
  my_addr.sin_port = htons(port);
  curretry=0;
  while( bind(sock, (struct sockaddr*)&my_addr, sizeof(struct sockaddr)) < 0) {
    //Failed to bind a socket so wait 1 second then try again up to 60 seconds
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to bind socket for hostip: %d.%d.%d.%d on port: %d, errno=%d\n",
      __func__,
      (hostip >> 24) & 0xFF,
      (hostip >> 16) & 0xFF,
      (hostip >> 8) & 0xFF,
      hostip & 0xFF,
      port, errno);
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
        return -1;
      }
    }
    sleep(1);
    if (curretry < maxretries) {
      debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
      return -1;
    }
    ++curretry;
  }

  curretry=0;
  while (listen(sock, MAX_PENDING) < 0) {
    //Failed to listen on server socket so wait 1 second then try again up to 60 seconds
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to listen on socket for hostip: %d.%d.%d.%d on port: %d, errno=%d\n",
      __func__,
      (hostip >> 24) & 0xFF,
      (hostip >> 16) & 0xFF,
      (hostip >> 8) & 0xFF,
      hostip & 0xFF,
      port, errno);
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
        return -1;
      }
    }
    sleep(1);
    if (curretry < maxretries) {
      debuglibifaceptr->debuglib_printf(1, "%s: Aborting\n", __func__);
      return -1;
    }
    ++curretry;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Successfully created a listen socket for hostip: %d.%d.%d.%d, port: %d\n",
      __func__,
      (hostip >> 24) & 0xFF,
      (hostip >> 16) & 0xFF,
      (hostip >> 8) & 0xFF,
      hostip & 0xFF,
      port);

  return sock;
}

/*
  Wait for a client connection
  Arguments: sock The socket number to wait on
             getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
             quitpipefd A descriptor for a pipe that when written to cause this function to abort or -1 if not used
  Returns the socket number of the new connection or negative value on error
*/
static int serverlib_waitForConnection_with_quitpipe(int sock, int (* const getAbortEarlyfuncptr)(void), int quitpipefd) {
  int result=-1, lerrno;
  struct pollfd fds[2];
  nfds_t nfds;
  unsigned addrlen;
  int abortearly=0;
  struct sockaddr_in remote_addr;

  if (quitpipefd!=-1) {
    nfds=2;
  } else {
    nfds=1;
  }
  //Wait for the socket to become ready
  if (getAbortEarlyfuncptr) {
    abortearly=getAbortEarlyfuncptr();
  }
  while (!abortearly) {
    fds[0].fd=sock;
    fds[0].events=POLLIN;
    if (quitpipefd!=-1) {
      fds[1].fd=quitpipefd;
      fds[1].events=POLLIN;
    }
    if (quitpipefd!=-1) {
      result=poll(fds, nfds, 5000);
    } else {
      result=poll(fds, nfds, 100);
    }
    lerrno=errno;
    if (result==0 || (result==-1 && lerrno==EINTR)) {
      //Timeout
      result=-2;
      if (getAbortEarlyfuncptr) {
        abortearly=getAbortEarlyfuncptr();
      }
      continue;
    }
    if (result==-1) {
      //Another error occurred so abort
      break;
    }
    if (fds[0].revents != POLLIN) {
      //An error occurred so abort
      result=-1;
      break;
    }
    if (getAbortEarlyfuncptr) {
      if (getAbortEarlyfuncptr()) {
        //Time to quit
        result=-1;
        break;
      }
    }
    if (quitpipefd!=-1 && fds[1].revents == POLLIN) {
      //Time to quit
      result=-1;
      break;
    }
    addrlen = sizeof(struct sockaddr_in);
#ifdef __ANDROID__
#if __ANDROID_API__ < 21
      //Android workaround for accept4 not available in Android < 21
      #warning "accept4 and SOCK_CLOEXEC aren't available in Android API < 21"
      sock=accept(sock, (struct sockaddr*)&remote_addr, &addrlen);
#else
      sock=accept4(sock, (struct sockaddr*)&remote_addr, &addrlen, SOCK_CLOEXEC);
#endif
#else
      sock=accept4(sock, (struct sockaddr*)&remote_addr, &addrlen, SOCK_CLOEXEC);
#endif
    lerrno=errno;
    if (sock<0) {
      result=-1;
      break;
    }
    return sock;
  }
  return result;
}

/*
  Wait for a client connection
  Arguments: sock The socket number to wait on
             getAbortEarlyfuncptr A pointer to a function that returns non-zero if we should abort early or NULL if not available
  Returns the socket number of the new connection or negative value on error
*/
static int serverlib_waitForConnection(int sock, int (* const getAbortEarlyfuncptr)(void)) {
  return serverlib_waitForConnection_with_quitpipe(sock, getAbortEarlyfuncptr, -1);
}

moduleinfo_ver_generic_t *commonserverlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &commonserverlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CommonServerLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) commonserverlib_getmoduleinfo();
}
#endif
