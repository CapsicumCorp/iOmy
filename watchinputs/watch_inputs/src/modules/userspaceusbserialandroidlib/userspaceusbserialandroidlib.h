/*
Title: User Space USB Serial for Android Library Header
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for userspaceusbserialandroidlib.c
Copyright: Capsicum Corporation 2015-2016

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

#ifndef USERSPACEUSBSERIALANDROIDLIB_H
#define USERSPACEUSBSERIALANDROIDLIB_H

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for userspaceusbserialandroidlib module
typedef struct {
  int (*userspaceusbserialandroidlib_init)(void);
  void (*userspaceusbserialandroidlib_shutdown)(void);
} userspaceusbserialandroidlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define USERSPACEUSBSERIALANDROIDLIBINTERFACE_VER_1 1 //A version number for the userspaceusbserialandroidlib interface version

#endif
