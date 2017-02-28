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

#include "timeruleslib.h"

#ifndef TIMERULESLIB_HPP
#define TIMERULESLIB_HPP

#include <boost/config.hpp>

#include <string>

#include <boost/config/abi_prefix.hpp>

typedef struct {
  int (*setrulesfilename)(const char *rulesfile);
  int (*readrulesfile)(void);
  int (*isloaded)();
} timeruleslib_ifaceptrs_ver_1_cpp_t;

#define TIMERULESLIBINTERFACECPP_VER_1 1001 //A version number for the timeruleslib interface version

#include <boost/config/abi_suffix.hpp>

#endif
