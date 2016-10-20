/*
Title: Thread Lock Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for locklib.c
Copyright: Capsicum Corporation 2016

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

#ifndef LOCKLIB_H
#define LOCKLIB_H

#include <pthread.h>
#include "moduleinterface.h"

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#ifdef __cplusplus
extern "C" {
#endif

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for locklib module
typedef struct {
  int (*pthread_mutex_lock)(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno);
  int (*pthread_mutex_unlock)(pthread_mutex_t *mutex, const char *mutexname, const char *filename, const char *funcname, int lineno);
} locklib_ifaceptrs_ver_1_t;

#ifdef __cplusplus
}
#endif

#pragma pack(pop)

//A version number for the locklib interface version
#define LOCKLIBINTERFACE_VER_1 1

//Use these macros in other libraries to provide DEADLOCK detection for locks
#ifdef DEBUG
#define LOCKLIB_LOCK(mutex, mutex_name) { \
  locklibifaceptr->pthread_mutex_lock(mutex, mutex_name, __FILE__, __func__, __LINE__); \
}
#define LOCKLIB_UNLOCK(mutex, mutex_name) { \
  locklibifaceptr->pthread_mutex_unlock(mutex, mutex_name, __FILE__, __func__, __LINE__); \
}
#else
#define LOCKLIB_LOCK(mutex, mutex_name) { \
  pthread_mutex_lock(mutex); \
}
#define LOCKLIB_UNLOCK(mutex, mutex_name) { \
  pthread_mutex_unlock(mutex); \
}
#endif

#endif
