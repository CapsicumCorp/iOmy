/*
Title: Configuration Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for configlib.cpp
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

#ifndef CONFIGLIB_H
#define CONFIGLIB_H

typedef int (*readcfgfile_post_func_ptr_t)();

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#ifdef __cplusplus
extern "C" {
#endif

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for configlib module
typedef struct {
  int (*configlib_register_readcfgfile_post_listener)(readcfgfile_post_func_ptr_t funcptr);
  int (*configlib_unregister_readcfgfile_post_listener)(readcfgfile_post_func_ptr_t funcptr);
  int (*configlib_setcfgfilename)(const char *cfgfile);
  int (*configlib_readcfgfile)(void);
  int (*configlib_isloaded)();
  char *(*getnamevalue)(const char *block, const char *name);
} configlib_ifaceptrs_ver_1_t;

typedef struct {
  int (*register_readcfgfile_post_listener)(readcfgfile_post_func_ptr_t funcptr);
  int (*unregister_readcfgfile_post_listener)(readcfgfile_post_func_ptr_t funcptr);
  int (*setcfgfilename)(const char *cfgfile);
  int (*readcfgfile)(void);
  int (*isloaded)();
  int (*loadpending)();
  char *(*getnamevalue)(const char *block, const char *name);
} configlib_ifaceptrs_ver_2_t;

#ifdef __cplusplus
}
#endif

#pragma pack(pop)

#define CONFIGLIBINTERFACE_VER_1 1 //A version number for the configlib interface version
#define CONFIGLIBINTERFACE_VER_2 2 //A version number for the configlib interface version

#endif
