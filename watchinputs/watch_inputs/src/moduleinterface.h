/*
Title: Module Interface Header File for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File containing definations for a module interface
Copyright: Capsicum Corporation 2012-2016

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

#ifndef MODULEINTERFACE_H
#define MODULEINTERFACE_H

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Generic version Info about a module
typedef struct {
  //NOTE: moduleinfover must always come first so the module loader knows what module info structure version to refer to for the other info
  unsigned moduleinfover; //The version of this module info structure
} moduleinfo_ver_generic_t;

//Version 1 Links to a module interface
//Last entry should have ifaceptr pointing to NULL
typedef struct {
  const void *ifaceptr; //Pointer to struct of pointers to functions and variables
  unsigned ifacever;
} moduleiface_ver_1_t;

//Version 1 Links to a module dependency
//Last entry should have modulename pointing to NULL
typedef struct {
  const char * const modulename; //Name of the module we depend on
  const void *ifaceptr; //The module loader will fill this in if the module interface can be found
  unsigned ifacever; //Version of the module interface we depend on
  char required; //1=This module interface is required, 0=The module can use this module interface but it isn't required
} moduledep_ver_1_t;

//Version 1 Info about a module
typedef struct {
  //NOTE: moduleinfover must always come first so the module loader knows what module info structure version to refer to for the other info
  unsigned moduleinfover; //The version of this module info structure
  const char * const modulename; //The name of this module
  int (* const initfunc)(void); //Pointer to the module init function or NULL if not implemented
  void (* const shutdownfunc)(void); //Pointer to the module shutdown function or NULL if not implemented
  int (* const startfunc)(void); //Pointer to the module start function or NULL if not implemented
  void (* const stopfunc)(void); //Pointer to the module stop function or NULL if not implemented
  void (* const registerlistenersfunc)(void); //Pointer to the module register listeners function or NULL if not implemented
  void (* const unregisterlistenersfunc)(void); //Pointer to the module unregister listeners function or NULL if not implemented
  const moduleiface_ver_1_t (* const moduleifaces)[]; //A pointer to an array of module interfaces provided by this module or NULL if no public interfaces
  moduledep_ver_1_t (*moduledeps)[]; //A pointer to an array of module dependencies used/required by this module or NULL if no dependencies
} moduleinfo_ver_1_t;

#pragma pack(pop)

#define MODULEINFO_VER_1 1 //Version 1 of the Module info structure format

//Your module should export the following function
//Return NULL for no module info
//moduleinfo_ver_generic_t *<modulename>_getmoduleinfo()

#endif
