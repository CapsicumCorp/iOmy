/*
Title: Database Counter Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for dbcounterlib.c
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

#ifndef DBCOUNTERLIB_H
#define DBCOUNTERLIB_H

#include <inttypes.h>
#include <time.h>
#include "modules/commonlib/commonlib.h"

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for dbcounterlib module
typedef struct {
int (*init)(void);
void (*shutdown)(void);
int (*deletecounter)(int index);
int (*scheduledeletecounter)(int index);
int (*new_1multival_incounter)(uint64_t addr, int portid, int fieldid, const char *sensor_name, long initial_update_interval, long update_interval);
int (*get_1multival_incountervalues)(int index, multitypeval_t *val);
int (*new_1multival_outcounter)(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval);
int (*addto1multivaloutcounter)(int index, multitypeval_t val);
int (*new_1multival_updatecounter)(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval);
int (*addto1multivalupdatecounter)(int index, multitypeval_t val);
int (*checkifindexvalid)(int index, int expected_countertype);
} dbcounterlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define DBCOUNTERLIBINTERFACE_VER_1 1 //A version number for the dbcounterlib interface version

#define DB_AVR_PORTTYPE_ANALOG_INPUT 1
#define DB_AVR_PORTTYPE_DIGITAL_INPUT 2

//Counter Types
#define DBCOUNTERLIB_SPARECOUNTER 0 //This slot is currently unused
#define DBCOUNTERLIB_BASECOUNTER 1 //Used to indicate that this counter has been initialised as a basic counter

#define DBCOUNTERLIB_MULTITYPE_OUTCOUNTER 0x10 //Used before we know the storage type being used
#define DBCOUNTERLIB_1DOUBLE_OUTCOUNTER 0x11
#define DBCOUNTERLIB_1INT64_OUTCOUNTER 0x12
#define DBCOUNTERLIB_1INT32_OUTCOUNTER 0x13
#define DBCOUNTERLIB_1UINT8_OUTCOUNTER 0x14

#define DBCOUNTERLIB_MULTITYPE_INCOUNTER 0x1020 //Used before we know the storage type being used
#define DBCOUNTERLIB_1DOUBLE_INCOUNTER 0x1021
#define DBCOUNTERLIB_1INT64_INCOUNTER 0x1022
#define DBCOUNTERLIB_1INT32_INCOUNTER 0x1023
#define DBCOUNTERLIB_1UINT8_INCOUNTER 0x1024

//These counters update a single value in the database instead of inserting new values
#define DBCOUNTERLIB_MULTITYPE_UPDATECOUNTER 0x2045 //Used before we know the storage type being used
#define DBCOUNTERLIB_1DOUBLE_UPDATECOUNTER 0x2046
#define DBCOUNTERLIB_1INT64_UPDATECOUNTER 0x2047
#define DBCOUNTERLIB_1INT32_UPDATECOUNTER 0x2048
#define DBCOUNTERLIB_1UINT8_UPDATECOUNTER 0x2049


//------------------------

//In Counter Status Values
#define DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET 0
#define DBCOUNTERLIB_INCOUNTER_STATUS_SOMEVALUESSET 1
#define DBCOUNTERLIB_INCOUNTER_STATUS_NOVALUESSET 2 //The value hasn't been retrieved from the database yet
#define DBCOUNTERLIB_INCOUNTER_STATUS_VALUENOTPRESENT 3 //Have been attempted to retrieve from database but there was no value
//Counter Field IDs
#define DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE 0x10

#define DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_SAMPLERATECURRENT 0x21
#define DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT 0x22
#define DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT 0x23
#define DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT 0x24
#define DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT 0x25

#endif
