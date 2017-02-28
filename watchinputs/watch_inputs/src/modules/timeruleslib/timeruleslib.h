/*
Title: Time Rules Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for timeruleslib.cpp
Copyright: Capsicum Corporation 2017

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

#ifndef TIMERULESLIB_H
#define TIMERULESLIB_H

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#ifdef __cplusplus
extern "C" {
#endif

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for configlib module
typedef struct {
  int (*setrulesfilename)(const char *rulesfile);
  int (*readrulesfile)(void);
  int (*isloaded)();
} timeruleslib_ifaceptrs_ver_1_t;

#ifdef __cplusplus
}
#endif

#pragma pack(pop)

#define TIMERULESLIBINTERFACE_VER_1 1 //A version number for the timeruleslib interface version

#endif
