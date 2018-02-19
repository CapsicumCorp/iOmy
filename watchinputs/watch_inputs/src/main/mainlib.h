/*
Title: Watch Inputs Main Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for mainlib.c
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

#ifndef MAINLIB_H
#define MAINLIB_H

#include <semaphore.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for mainlib module
typedef struct {
  void *(*mainlib_loadsymbol)(const char *modulename, const char *symbolname);
  int (*mainlib_loadmodulesymbol)(void **symptr, const char *modulename, const char *symbolname);
  int (*mainlib_loadcustommodulesymbol)(void **symptr, const char *modulename, const char *symbolname);
  int (*mainlib_getneedtoquit)(void);
} mainlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

//Needed by watch_inputs.c
int mainlib_getneedtoquit();
int mainlib_main(sem_t *sleepsem);
void mainlib_cleanup();

#define MAINLIBINTERFACE_VER_1 1 //A version number for the mainlib interface version

#endif
