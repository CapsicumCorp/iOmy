/*
Title: Generic Database Abstraction Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This module provides a generic interface between the client and a database.
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

/*

Config File entry:
[dbconfig]

dbtype=<dbtype> The database library to use
dbname=<dbname> The name of the database to open, or with some embedded databases, the filename of the database to open
host=<dbhostname> Some database libraries need a hostname to connect to the server
username=<dbusername> Some database libraries need a username to connect to the server
password=<dbpassword> Some database libraries need a password to connect to the server

*/

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

#include <inttypes.h>
#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <pthread.h>
#include <semaphore.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "dblib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/configlib/configlib.h"
#include "modules/mysqllib/mysqllib.h"

#define CFGBLOCKMODE_DBCONFIG 257

#define DBLIB_DBTYPE_NONE 0
#define DBLIB_DBTYPE_MYSQL 1

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t dblibmutex;
#else
static pthread_mutex_t dblibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int libinuse=0; //Only stop when libinuse = 0

static int dblib_dbtype;
static char *dblib_dbname;
static char *dblib_dbhostname;
static char *dblib_dbusername;
static char *dblib_dbpassword;

static char dblib_quit=0; //Set to 1 when dblib should exit
static pthread_t gmainthread=0;
static sem_t dblib_mainthreadsleepsem; //Used for main thread sleeping

#ifdef __ANDROID__
static JavaVM *dblib_gJavaVM;
static JNIEnv *dblib_mainthread_jnienv;
#endif

//Static Function Declarations
static void *dblib_MainThreadLoop(void *thread_val);
static int _dblib_unloaddatabase(void);

//Function Declarations
int dblib_init(void);
void dblib_shutdown(void);
int dblib_start(void);
void dblib_stop(void);
void dblib_register_listeners(void);
void dblib_unregister_listeners(void);
int dblib_loaddatabase(const char *dbname, const char *dbhostname, const char *dbusername, const char *dbpassword);
int dblib_unloaddatabase(void);
int dblib_is_initialised();
int dblib_basicexec(const char *sql);
int dblib_begin(void);
int dblib_end(void);
int dblib_rollback(void);

//Returns the current version of the database schema
static int dblib_getschemaversion(void);

//Free a unique id from memory if memory was allocated for it
static void dblib_freeuniqueid(void *uniqueid);

static void *dblib_getport_uniqueid(uint64_t addr, int portid);
static void *dblib_getsensor_uniqueid(uint64_t addr, int portid, const char *sensor_name);
int dblib_getioport_state(const void *uniqueid, int32_t *state);
int dblib_getsensor_sampleratecurrent(const void *uniqueid, double *sampleratecurrent);
int dblib_update_ioports_state(const void *uniqueid, int32_t value);
int dblib_insert_sensor_datafloat_value(const void *uniqueid, int64_t date, double value);
int dblib_insert_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value);
int dblib_insert_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value);
int dblib_insert_sensor_datatinyint_value(const void *uniqueid, int64_t date, int8_t value);
int dblib_getsensor_datafloat_value(const void *uniqueid, double *value);
int dblib_getsensor_databigint_value(const void *uniqueid, int64_t *value);
int dblib_getsensor_dataint_value(const void *uniqueid, int32_t *value);
int dblib_getsensor_datatinyint_value(const void *uniqueid, uint8_t *value);
int dblib_update_sensor_datafloat_value(const void *uniqueid, int64_t date, double value);
int dblib_update_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value);
int dblib_update_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value);
int dblib_update_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value);
int dblib_getcommpk(uint64_t addr, int64_t *commpk);
int dblib_getlinkpk(uint64_t addr, int64_t *linkpk);
int dblib_getlinkcommpk(uint64_t addr, int64_t *commpk);

int dblib_configload_post();

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define CONFIGLIB_DEPIDX 1
#define MYSQLLIB_DEPIDX 2

static dblib_ifaceptrs_ver_1_t dblib_ifaceptrs_ver_1={
  .init=dblib_init,
  .shutdown=dblib_shutdown,
  .loaddatabase=dblib_loaddatabase,
  .unloaddatabase=dblib_unloaddatabase,
  .is_initialised=dblib_is_initialised,
  .getschemaversion=dblib_getschemaversion,
  .begin=dblib_begin,
  .end=dblib_end,
  .rollback=dblib_rollback,
  .getport_uniqueid=dblib_getport_uniqueid,
  .getsensor_uniqueid=dblib_getsensor_uniqueid,
  .getioport_state=dblib_getioport_state,
  .getsensor_sampleratecurrent=dblib_getsensor_sampleratecurrent,
  .update_ioports_state=dblib_update_ioports_state,
  .insert_sensor_datafloat_value=dblib_insert_sensor_datafloat_value,
  .insert_sensor_databigint_value=dblib_insert_sensor_databigint_value,
  .insert_sensor_dataint_value=dblib_insert_sensor_dataint_value,
  .insert_sensor_datatinyint_value=dblib_insert_sensor_datatinyint_value,
  .getsensor_datafloat_value=dblib_getsensor_datafloat_value,
  .getsensor_databigint_value=dblib_getsensor_databigint_value,
  .getsensor_dataint_value=dblib_getsensor_dataint_value,
  .getsensor_datatinyint_value=dblib_getsensor_datatinyint_value,
  .update_sensor_datafloat_value=dblib_update_sensor_datafloat_value,
  .update_sensor_databigint_value=dblib_update_sensor_databigint_value,
  .update_sensor_dataint_value=dblib_update_sensor_dataint_value,
  .update_sensor_datatinyint_value=dblib_update_sensor_datatinyint_value,
  .getcommpk=dblib_getcommpk,
  .getlinkpk=dblib_getlinkpk,
  .getlinkcommpk=dblib_getlinkcommpk,
  .freeuniqueid=dblib_freeuniqueid
};

static moduleiface_ver_1_t dblib_ifaces[]={
  {
    .ifaceptr=&dblib_ifaceptrs_ver_1,
    .ifacever=DBLIBINTERFACE_VER_1
  },
  {
    .ifaceptr=NULL
  }
};

static moduledep_ver_1_t dblib_deps[]={
  {
    .modulename="debuglib",
    .ifacever=DEBUGLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="configlib",
    .ifacever=CONFIGLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="mysqllib",
    .ifacever=MYSQLLIBINTERFACE_VER_1,
    .required=0
  },
  {
    .modulename=NULL
  }
};

static moduleinfo_ver_1_t dblib_moduleinfo_ver_1={
  .moduleinfover=MODULEINFO_VER_1,
  .modulename="dblib",
  .initfunc=dblib_init,
  .shutdownfunc=dblib_shutdown,
  .startfunc=dblib_start,
  .stopfunc=dblib_stop,
  .registerlistenersfunc=dblib_register_listeners,
  .unregisterlistenersfunc=dblib_unregister_listeners,
  .moduleifaces=&dblib_ifaces,
  .moduledeps=&dblib_deps
};

/*
  Initialise the database library
  Returns 0 for success or other value on error
  NOTE: No other threads should use this library until this function is called
*/
int dblib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  ++libinuse;
  if (libinuse>1) {
    //Already started
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, libinuse);
    return 0;
  }
  //Let the database libraries know that we may want to use them
  if (mysqllibifaceptr) {
    mysqllibifaceptr->init();
  }
  dblib_quit=0;
  if (sem_init(&dblib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&dblibmutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Shutdown the database library
*/
void dblib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (libinuse==0) {
    //Already stopped : NOTE: We should never get here
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Shouldn't be here, already stopped\n", __func__);
    return;
  }
  --libinuse;
  if (libinuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, libinuse);
    return;
  }
  _dblib_unloaddatabase();

  //Finished using the database libraries
  if (mysqllibifaceptr) {
    mysqllibifaceptr->shutdown();
  }

  dblib_dbtype=DBLIB_DBTYPE_NONE;
  if (dblib_dbname) {
    free(dblib_dbname);
    dblib_dbname=NULL;
  }
  if (dblib_dbhostname) {
    free(dblib_dbhostname);
    dblib_dbhostname=NULL;
  }
  if (dblib_dbusername) {
    free(dblib_dbusername);
    dblib_dbusername=NULL;
  }
  if (dblib_dbpassword) {
    free(dblib_dbpassword);
    dblib_dbpassword=NULL;
  }
  sem_destroy(&dblib_mainthreadsleepsem);
#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&dblibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Start the dblib library including starting of threads, etc.
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
int dblib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (!gmainthread) {
    result=pthread_create(&gmainthread, NULL, dblib_MainThreadLoop, NULL);
    if (result!=0) {
      gmainthread=0;
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Failed to create main thread\n", __func__);
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Stop the dblib library
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
void dblib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  pthread_t tmpthread;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (gmainthread) {
    tmpthread=gmainthread;
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    PTHREAD_LOCK(&dblibmutex);
    dblib_quit=1;
    sem_post(&dblib_mainthreadsleepsem);
    PTHREAD_UNLOCK(&dblibmutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);

    //Unlock while stopping the main thread
    pthread_join(tmpthread, NULL);
    gmainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for dblib
*/
void dblib_register_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  configlib_ifaceptrs_ver_1_t *configlibifaceptr=dblib_deps[CONFIGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  configlibifaceptr->configlib_register_readcfgfile_post_listener(dblib_configload_post);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for dblib
*/
void dblib_unregister_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  configlib_ifaceptrs_ver_1_t *configlibifaceptr=dblib_deps[CONFIGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  configlibifaceptr->configlib_unregister_readcfgfile_post_listener(dblib_configload_post);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static void *dblib_MainThreadLoop(void *thread_val) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int quit=0, result, ldbtype;
  int shortsleep=0; //1=Only sleep for a short interval between checks, 0=Sleep for a longer interval between checks
  struct timespec waittime;

#ifdef __ANDROID__
  (*dblib_gJavaVM)->AttachCurrentThread(dblib_gJavaVM, &dblib_mainthread_jnienv, NULL);
#endif
  while (!quit) {
    shortsleep=0;

    PTHREAD_LOCK(&dblibmutex);
    ldbtype=dblib_dbtype;
    PTHREAD_UNLOCK(&dblibmutex);
    if (ldbtype==DBLIB_DBTYPE_MYSQL) {
      if (mysqllibifaceptr->is_initialised()==0) {
        result=mysqllibifaceptr->loaddatabase(dblib_dbhostname, dblib_dbname, dblib_dbusername, dblib_dbpassword);
        if (result!=0) {
          shortsleep=1;
        }
      }
    } else {
      //No database defined
      shortsleep=1;
    }

    clock_gettime(CLOCK_REALTIME, &waittime);
    if (shortsleep) {
      waittime.tv_sec+=10;
    } else {
      waittime.tv_sec+=120;
    }
    sem_timedwait(&dblib_mainthreadsleepsem, &waittime);

    PTHREAD_LOCK(&dblibmutex);
    quit=dblib_quit;
    PTHREAD_UNLOCK(&dblibmutex);
  }
#ifdef __ANDROID__
  (*dblib_gJavaVM)->DetachCurrentThread(dblib_gJavaVM);
#endif
  return (void *) 0;
}

/*
  Open the database: filename
  This should only be called by a start function or after not by an init function
  Args: filename The filename of the database to load
*/
int dblib_loaddatabase(const char *dbname, const char *dbhostname, const char *dbusername, const char *dbpassword) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int result=-1, ldbtype;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->loaddatabase(dbhostname, dbname, dbusername, dbpassword);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

/*
	Unload the database without locking
*/
static int _dblib_unloaddatabase(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int result=0, ldbtype;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  ldbtype=dblib_dbtype;
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->unloaddatabase();
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

	return result;
}

/*
  Unload the database file
*/
int dblib_unloaddatabase(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int result;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&dblibmutex);
	result=_dblib_unloaddatabase();
  PTHREAD_UNLOCK(&dblibmutex);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

	return result;
}

/*
  Return 1 if the database is currently initialised and loaded or 0 if not
*/
int dblib_is_initialised() {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->is_initialised();
  }
  return 0;
}

/*
  Returns the current version of the database schema or 0 if unknown
  Currently we support 3 different versions of the schema
*/
static int dblib_getschemaversion(void) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;
  int result=0;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->getschemaversion();
  }
  return result;
}

/*
  Begin a transaction
*/
int dblib_begin(void) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype, result;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->begin();

    if (result<0) {
      if (mysqllibifaceptr->is_initialised()) {
        //If begin fails, MySQL might have a connection issue
        //Disconnect the connection so we retry connecting
        _dblib_unloaddatabase();

        //Wakeup the main thread to load the database
        sem_post(&dblib_mainthreadsleepsem);
      }
    }
    return result;
  }
  return -1;
}

/*
  End a transaction
*/
int dblib_end(void) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->end();
  }
  return -1;
}

/*
  Rollback a transaction
*/
int dblib_rollback(void) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype, result;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->rollback();

    if (mysqllibifaceptr->is_initialised()) {
      //Normally we are in rollback if commit failed and if that's the case, MySQL might have a connection issue
      //Disconnect the connection so we retry connecting
      _dblib_unloaddatabase();

      //Wakeup the main thread to load the database
      sem_post(&dblib_mainthreadsleepsem);
    }
    return result;
  }
  return -1;
}

/*
  Returns a pointer to a structure that is unique to the database for an sql5 port
    or returns null on error or if the port doesn't exist
*/
static void *dblib_getport_uniqueid(uint64_t addr, int portid) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;
  void *result=NULL;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->getport_uniqueid(addr, portid);
  }
  return result;
}

/*
  Returns a pointer to a structure that is unique to the database for a sql5 sensor
    or returns null on error or if the port doesn't exist
*/
static void *dblib_getsensor_uniqueid(uint64_t addr, int portid, const char *sensor_name) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;
  void *result=NULL;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    result=mysqllibifaceptr->getsensor_uniqueid(addr, portid, sensor_name);
  }
  return result;
}

/*
  Retrieve the state field rate for an io port synced from the remote server's database
  Returns 0 for success or negative value on error
  The state field is returned via the pointer
*/
int dblib_getioport_state(const void *uniqueid, int32_t *state) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getioport_state(uniqueid, state);
  }
  return -1;
}

/*
  Retrieve the current sample rate for a sensor synced from the remote server's database
  Returns 0 for success or negative value on error
  The sample rate is returned via the pointer
*/
int dblib_getsensor_sampleratecurrent(const void *uniqueid, double *sampleratecurrent) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getsensor_sampleratecurrent(uniqueid, sampleratecurrent);
  }
  return -1;
}

/*
  Update the state field for an io port
  Returns 0 on success or negative value on error
*/
int dblib_update_ioports_state(const void *uniqueid, int32_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->update_ioports_state(uniqueid, value);
  }
  return -1;
}

/*
  Insert a single double into the database for a sensor to the DATAFLOAT table
  Returns 0 on success or negative value on error
*/
int dblib_insert_sensor_datafloat_value(const void *uniqueid, int64_t date, double value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->insert_sensor_datafloat_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Insert a single int64 into the database for a sensor to the DATABIGINT table
  Returns 0 on success or negative value on error
*/
int dblib_insert_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->insert_sensor_databigint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Insert a single int32 into the database for a sensor to the DATAINT table
  Returns 0 on success or negative value on error
*/
int dblib_insert_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->insert_sensor_dataint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Insert a single uint8 into the database for a sensor to the DATATINYINT table
  Returns 0 on success or negative value on error
*/
int dblib_insert_sensor_datatinyint_value(const void *uniqueid, int64_t date, int8_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->insert_sensor_datatinyint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Retrieve a the most recent value for a sensor from the DATAFLOAT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int dblib_getsensor_datafloat_value(const void *uniqueid, double *value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getsensor_datafloat_value(uniqueid, value);
  }
  return -1;
}

/*
  Retrieve a the most recent value for a sensor from the DATABIGINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int dblib_getsensor_databigint_value(const void *uniqueid, int64_t *value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getsensor_databigint_value(uniqueid, value);
  }
  return -1;
}

/*
  Retrieve a the most recent value for a sensor from the DATAINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int dblib_getsensor_dataint_value(const void *uniqueid, int32_t *value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getsensor_dataint_value(uniqueid, value);
  }
  return -1;
}

/*
  Retrieve a the most recent value for a sensor from the DATATINYINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int dblib_getsensor_datatinyint_value(const void *uniqueid, uint8_t *value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getsensor_datatinyint_value(uniqueid, value);
  }
  return -1;
}

/*
  Update a single double in the database for a sensor to the DATAFLOAT table
  Returns 0 on success or negative value on error
*/
int dblib_update_sensor_datafloat_value(const void *uniqueid, int64_t date, double value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->update_sensor_datafloat_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Update a single int64 in the database for a sensor to the DATABIGINT table
  Returns 0 on success or negative value on error
*/
int dblib_update_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->update_sensor_databigint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Update a single int32 in the database for a sensor to the DATAINT table
  Returns 0 on success or negative value on error
*/
int dblib_update_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->update_sensor_dataint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Update a single uint8 in the database for a sensor to the DATATINYINT table
  Returns 0 on success or negative value on error
*/
int dblib_update_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->update_sensor_datatinyint_value(uniqueid, date, value);
  }
  return -1;
}

/*
  Get pk of a comm
  Args: comm addr, commpk
  On success, 64-bit comm pk will be set, and 0 will be returned
  Returns -1 if link doesn't exist, < -1 on another error
*/
int dblib_getcommpk(uint64_t addr, int64_t *commpk) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getcommpk(addr, commpk);
  }
  return -2;
}

/*
  Get pk of a link
  Args: link addr, linkpk
  On success, 64-bit link pk will be set, and 0 will be returned
  Returns -1 if link doesn't exist, < -1 on another error
*/
int dblib_getlinkpk(uint64_t addr, int64_t *linkpk) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getlinkpk(addr, linkpk);
  }
  return -2;
}

/*
  Get comm pk associated with a link
  Args: link addr, commpk
  On success, 64-bit comm pk will be set, and 0 will be returned
  Returns -1 if link doesn't exist, < -1 on another error
*/
int dblib_getlinkcommpk(uint64_t addr, int64_t *commpk) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    return mysqllibifaceptr->getlinkcommpk(addr, commpk);
  }
  return -2;
}

//Free a unique id from memory if memory was allocated for it
static void dblib_freeuniqueid(void *uniqueid) {
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
  int ldbtype;

  PTHREAD_LOCK(&dblibmutex);
  ldbtype=dblib_dbtype;
  PTHREAD_UNLOCK(&dblibmutex);
  if (ldbtype==DBLIB_DBTYPE_MYSQL) {
    mysqllibifaceptr->freeuniqueid(uniqueid);
  }
}

//Operations to do just after the configuration is loaded
int dblib_configload_post() {
  configlib_ifaceptrs_ver_1_t *configlibifaceptr=dblib_deps[CONFIGLIB_DEPIDX].ifaceptr;
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dblib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  mysqllib_ifaceptrs_ver_1_t *mysqllibifaceptr=dblib_deps[MYSQLLIB_DEPIDX].ifaceptr;
	char *valueptr;
	int dblib_new_dbtype=DBLIB_DBTYPE_NONE;
	char *dblib_new_dbname=NULL, *dblib_new_dbhostname=NULL, *dblib_new_dbusername=NULL, *dblib_new_dbpassword=NULL;

	if (!configlibifaceptr->configlib_isloaded()) {
		//Abort if the configuration isn't loaded
		return 0;
	}
	valueptr=configlibifaceptr->getnamevalue("dbconfig", "dbtype");
	if (valueptr) {
    if (mysqllibifaceptr && strcmp(valueptr, "mysql")==0) {
      dblib_new_dbtype=DBLIB_DBTYPE_MYSQL;
      debuglibifaceptr->debuglib_printf(1, "%s: Database Type=mysql\n", __func__);
		}
		if (dblib_new_dbtype==DBLIB_DBTYPE_NONE) {
			//Database type not supported
			debuglibifaceptr->debuglib_printf(1, "%s: Database Type: %s currently not available\n", __func__, valueptr);
			free(valueptr);

			return 0;
		}
		free(valueptr);
	} else {
		debuglibifaceptr->debuglib_printf(1, "%s: No Database Type specified\n", __func__);

		return 0;
	}

	//Get the database config
	valueptr=configlibifaceptr->getnamevalue("dbconfig", "dbname");
	if (valueptr) {
		dblib_new_dbname=valueptr;
    debuglibifaceptr->debuglib_printf(1, "%s: Database Name=%s\n", __func__, dblib_new_dbname);
	}
	valueptr=configlibifaceptr->getnamevalue("dbconfig", "host");
	if (valueptr) {
		dblib_new_dbhostname=valueptr;
    debuglibifaceptr->debuglib_printf(1, "%s: Database Hostname=%s\n", __func__, dblib_new_dbhostname);
	}
	valueptr=configlibifaceptr->getnamevalue("dbconfig", "username");
	if (valueptr) {
		dblib_new_dbusername=valueptr;
    debuglibifaceptr->debuglib_printf(1, "%s: Database Username=%s\n", __func__, dblib_new_dbusername);
	}
	valueptr=configlibifaceptr->getnamevalue("dbconfig", "password");
	if (valueptr) {
		dblib_new_dbpassword=valueptr;
    debuglibifaceptr->debuglib_printf(1, "%s: Database Password=%s\n", __func__, dblib_new_dbpassword);
	}
	//Migrate the just loaded configured items to current configured items
  PTHREAD_LOCK(&dblibmutex);
  if (dblib_dbtype) {
    _dblib_unloaddatabase();
  }
  if (dblib_dbname) {
    free(dblib_dbname);
  }
  if (dblib_dbhostname) {
    free(dblib_dbhostname);
  }
  if (dblib_dbusername) {
    free(dblib_dbusername);
  }
  if (dblib_dbpassword) {
    free(dblib_dbpassword);
  }
  dblib_dbtype=dblib_new_dbtype;
  dblib_dbname=dblib_new_dbname;
  dblib_dbhostname=dblib_new_dbhostname;
  dblib_dbusername=dblib_new_dbusername;
  dblib_dbpassword=dblib_new_dbpassword;

  //Wakeup the main thread to load the database
  sem_post(&dblib_mainthreadsleepsem);

  PTHREAD_UNLOCK(&dblibmutex);

  return 0;
}

moduleinfo_ver_generic_t *dblib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &dblib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_DbLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) dblib_getmoduleinfo();
}

jint JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv *env;
  dblib_gJavaVM=vm;

  (*dblib_gJavaVM)->GetEnv(dblib_gJavaVM, (void * *) &env, JNI_VERSION_1_6);

  return JNI_VERSION_1_6; 
}
#endif
