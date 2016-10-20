/*
Title: Basic HTTP Server Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for httpserverlib.c
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

#ifndef HTTPSERVERLIB_H
#define HTTPSERVERLIB_H

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for httpserverlib module
typedef struct {
  int (*httpserverlib_register_cmd_listener)(void *funcptr);
  int (*httpserverlib_unregister_cmd_listener)(void *funcptr);
} httpserverlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define HTTPSERVERLIBINTERFACE_VER_1 1 //A version number for the httpserverlib interface version

//Result codes that can be returned by a library's http listeners
#define HTTPLISTENER_NOERROR 0 //Return this when the command has been successfully processed
#define HTTPLISTENER_NOTHANDLED 1 //Return this when your listener hasn't handled the command

#endif
