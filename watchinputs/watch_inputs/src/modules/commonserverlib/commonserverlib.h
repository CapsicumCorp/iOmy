/*
Title: Common Server Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for commonserver.c
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

#ifndef COMMONSERVERLIB_H
#define COMMONSERVERLIB_H

#include <arpa/inet.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for commonserverlib module
typedef struct {
  int (* const serverlib_netgetc)(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void));
  char *(* const serverlib_netgets)(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarlyfuncptr)(void));
  int (* const serverlib_netputs)(const char *s, int sock, int (* const getAbortEarlyfuncptr)(void));
  int (* const serverlib_netnput)(const char *s, size_t len, int sock, int (* const getAbortEarlyfuncptr)(void));
  void (* const serverlib_closeSocket)(int *socket);
  int (* const serverlib_setupTCPListenSocket)(in_addr_t hostip, uint16_t port, int (* const getAbortEarlyfuncptr)(void));
  int (* const serverlib_waitForConnection)(int sock, int (* const getAbortEarlyfuncptr)(void));
  int (* const serverlib_netgetc_with_quitpipe)(int sock, char *buffer, size_t bufsize, int *pos, int *received, int (* const getAbortEarlyfuncptr)(void), int quitpipefd);
  char *(* const serverlib_netgets_with_quitpipe)(char *s, int size, int sock, char *netgetc_buffer, size_t netgetc_bufsize, int *netgetc_pos, int *netgetc_received, int (* const getAbortEarly)(void), int quitpipefd);
  int (* const serverlib_waitForConnection_with_quitpipe)(int sock, int (* const getAbortEarlyfuncptr)(void), int quitpipefd);
} commonserverlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define COMMONSERVERLIBINTERFACE_VER_1 1 //A version number for the commonserverlib interface version

#endif
