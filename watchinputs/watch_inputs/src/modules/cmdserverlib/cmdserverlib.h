/*
Title: Command Server Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for cmdserverlib.c
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

#ifndef CMDSERVERLIB_H
#define CMDSERVERLIB_H

//Result codes that can be returned by a library's http listeners
#define CMDLISTENER_NOERROR 0 //Return this when the command has been successfully processed
#define CMDLISTENER_NOTHANDLED 1 //Return this when your listener hasn't handled the command
#define CMDLISTENER_CMDINVALID 2 //Return this when your listener has handled the command but the command has the incorrect format

typedef int (*cmd_func_ptr_t)(const char *cmdstr, int clientsock);
typedef void (*networkclientclose_func_ptr_t)(int clientsock);

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for cmdserverlib module
typedef struct {
  int (*cmdserverlib_register_cmd_listener)(cmd_func_ptr_t funcptr);
  int (*cmdserverlib_unregister_cmd_listener)(cmd_func_ptr_t funcptr);

  //This listener is called just before the network client connection closes
  int (*cmdserverlib_register_networkclientclose_listener)(networkclientclose_func_ptr_t funcptr);
  int (*cmdserverlib_unregister_networkclientclose_listener)(networkclientclose_func_ptr_t funcptr);
} cmdserverlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define CMDSERVERLIBINTERFACE_VER_1 1 //A version number for the cmdserverlib interface version

#endif
