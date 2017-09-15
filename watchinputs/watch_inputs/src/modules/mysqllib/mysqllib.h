/*
Title: MySQL Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for mysqllib.c
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

#ifndef MYSQLLIB_H
#define MYSQLLIB_H

#include <stdint.h>
#include <inttypes.h>
#include "moduleinterface.h"

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#ifdef __cplusplus
extern "C" {
#endif

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for mysqllib module
typedef struct {
  int (*init)(void);
  void (*shutdown)(void);
  int (*loaddatabase)(const char *hostname, const char *dbname, const char *username, const char *password);
  int (*unloaddatabase)(void);
  int (*is_initialised)();
  int (*getschemaversion)(void);
  int (*begin)(void);
  int (*end)(void);
  int (*rollback)(void);
  void *(*getport_uniqueid)(uint64_t addr, int portid);
  void *(*getsensor_uniqueid)(uint64_t addr, int portid, const char *sensor_name);
  int (*getioport_state)(const void *uniqueid, int32_t *state);
  int (*getsensor_sampleratecurrent)(const void *uniqueid, double *sampleratecurrent);
  int (*update_ioports_state)(const void *uniqueid, int32_t value);
  int (*insert_sensor_datafloat_value)(const void *uniqueid, int64_t date, double value);
  int (*insert_sensor_databigint_value)(const void *uniqueid, int64_t date, int64_t value);
  int (*insert_sensor_dataint_value)(const void *uniqueid, int64_t date, int32_t value);
  int (*insert_sensor_datatinyint_value)(const void *uniqueid, int64_t date, uint8_t value);
  int (*getsensor_datafloat_value)(const void *uniqueid, double *value);
  int (*getsensor_databigint_value)(const void *uniqueid, int64_t *value);
  int (*getsensor_dataint_value)(const void *uniqueid, int32_t *value);
  int (*getsensor_datatinyint_value)(const void *uniqueid, uint8_t *value);
  int (*update_sensor_datafloat_value)(const void *uniqueid, int64_t date, double value);
  int (*update_sensor_databigint_value)(const void *uniqueid, int64_t date, int64_t value);
  int (*update_sensor_dataint_value)(const void *uniqueid, int64_t date, int32_t value);
  int (*update_sensor_datatinyint_value)(const void *uniqueid, int64_t date, uint8_t value);
  int (*getcommpk)(uint64_t addr, int64_t *commpk);
  int (*getlinkpk)(uint64_t addr, int64_t *linkpk);
  int (*getlinkcommpk)(uint64_t addr, int64_t *commpk);
  int (*getlinkusernamepassword)(int64_t linkpk, char **username, char **password);
  void (*freeuniqueid)(void *uniqueid);
} mysqllib_ifaceptrs_ver_1_t;

#ifdef __cplusplus
}
#endif

#pragma pack(pop)

//A version number for the mysqllib interface version
#define MYSQLLIBINTERFACE_VER_1 1 //A version number for the mysqllib interface version

#endif
