/*
Title: Thread Lock Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Private definitions for lock library used by multiple c++ and c files
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

#ifndef LOCKLIBPRIV_H
#define LOCKLIBPRIV_H

#include "moduleinterface.h"

#ifdef __cplusplus
extern "C" {
#endif

//External Function Declarations
extern int locklib_init(void);
extern void locklib_shutdown(void);
extern void locklib_register_listeners(void);
extern void locklib_unregister_listeners(void);

extern moduleinfo_ver_generic_t *locklib_getmoduleinfo();

#ifdef __cplusplus
}
#endif

#endif
