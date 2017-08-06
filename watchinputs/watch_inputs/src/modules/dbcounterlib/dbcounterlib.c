/*
Title: Database Counter Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Multi element counter library that updates a database with counter values at specified intervals.
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

//TODO: Figure out how to update queued element update times when the system time gets set correctly if not set when we start monitoring.

//NOTE: POSIX_C_SOURCE is needed for the following
//  ctime_r
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <time.h>
#include <pthread.h>
#include <semaphore.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "dbcounterlib.h"
#include "modules/dblib/dblib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"

#define DBCOUNTERLIB_MIN_UPDATE_INTVAL 1 //Minimum update interval allowed for a counter
#define DBCOUNTERLIB_DEFAULT_UPDATE_INTVAL 300 //Default update interval allowed for a counter
#define DBCOUNTERLIB_MIN_SLEEP_TIME 10 //Minimum of seconds to sleep
#define DBCOUNTERLIB_MAX_SLEEP_TIME 600 //Maximum of seconds to sleep
#define DBCOUNTERLIB_MINPULSEDATE 946684800 //Don't update the pulse counter if the timestamp is < 1 Jan 2000 UTC

#define DBCOUNTERLIB_NUMELEMS 10 //The number of counter elements to allocate for when the database update fails

//NOTE: small start can't be smaller than DBCOUNTERLIB_MAX_SLEEP_TIME
#define DBCOUNTERLIB_TIMEJUMPSMALLSTART 1200 //Start amount of time that a time jump is considered to be small
#define DBCOUNTERLIB_TIMEJUMPLARGESTART 86400 //Start amount of time that a time jump is considered to be large

typedef struct {
  int countertype; //The type of counter
  int curinidx;
  int curoutidx;
  int needtoremove; //1=This counter needs to be removed once all elements have been committed to the database
  void *child; //Used to contain counter info that inherits from this counter type
} counter_t;

typedef struct {
  time_t updatetime; //The time that this counter should be recorded as being stored at
  multitypeval_t val; //The current counter value 1
  multitypeval_t val2; //The current counter value 2
  multitypeval_t val3; //The current counter value 3
  multitypeval_t val4; //The current counter value 4
  int submitted; //At least one value has been submitted during the interval
} union4valcounterelem_t;

//New added values always replace the previous set of values
typedef struct {
  uint64_t addr; //64-bit global unique address of the device
  int portid; //The ioport hwid of the device
  int fieldid; //The id of the field to insert data to or retrieve data from
  char *sensor_name; //The name of the sensor to retrieve the data from if on a sensor
  void *uniqueid; //The unique id associated with this counter (Must be unique for all counters that use a unique id), retrieved from the database at regular intervals
  long initial_update_interval; //The time to wait before querying the database before the value has been set at least once
  long update_interval; //The time to wait before querying the database after the value has been set at least once

  //Outgoing fields
  union4valcounterelem_t *elems;

  //Incoming fields
  time_t updatetime; //The time that this counter should be next updated
  multitypeval_t val; //The value retrieved from the database
  multitypeval_t val2; //The value 2 retrieved from the database
  multitypeval_t val3; //The value 3 retrieved from the database
  multitypeval_t val4; //The value 4 retrieved from the database
  char valset; //0=The value hasn't been set yet, 1=The value has been retrieved from the database at least once
  char havequeried; //1=Have queried the database for a value at least once
} multitype4val_counter_t;

static char dbcounterlib_quit=0; //Set to 1 when dbcounterlib should exit
static int gnumelems=DBCOUNTERLIB_NUMELEMS;

//At the moment gnumcounters can grow but never shrink unless being completely shutdown since
//  the total number of counters isn't likely to change much once configured.
static int gnumcounters=0;
static counter_t *counters=NULL;

//Counters that keep track of how often the time jumps forward or back
static long dbcounterlib_timejumpedbacksmallcnt, dbcounterlib_timejumpedforwardsmallcnt;
static long dbcounterlib_timejumpedbacklargecnt, dbcounterlib_timejumpedforwardlargecnt;

static pthread_t gmainthread=0;
#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t dbcounterlibmutex;
#else
static pthread_mutex_t dbcounterlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static sem_t dbcounterlib_mainthreadsleepsem; //Used for main thread sleeping

static int dbcounterlib_inuse=0; //Only shutdown when inuse = 0
static int dbcounterlib_shuttingdown=0;

//Static Functions
static void *dbcounterlib_MainThreadLoop(void *thread_val);
static int dbcounterlib_processcommand(const char *buffer, int clientsock);
static int dbcounterlib_updatedatabase(void);
static time_t dbcounterlib_calcnextupdatetime(time_t curtime, time_t update_interval);
static time_t _dbcounterlib_getcounternextsteptime(int index);
static int _dbcounterlib_getincounter_uniqueid(int index);
static int _dbcounterlib_deletecounter(int index);
static int _dbcounterlib_stepmultitype4valcounter(int index);

//Function Declarations
int dbcounterlib_init(void);
void dbcounterlib_shutdown(void);
int dbcounterlib_start(void);
void dbcounterlib_stop(void);
void dbcounterlib_register_listeners(void);
void dbcounterlib_unregister_listeners(void);
int dbcounterlib_deletecounter(int index);
int dbcounterlib_scheduledeletecounter(int index);

int dbcounterlib_newzigbeeint32incounter(uint64_t addr, int portid, int fieldid, long initial_update_interval, long update_interval);
int dbcounterlib_getzigbeeint32incountervalues(int index, int32_t *val);

int dbcounterlib_new_1multival_incounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long initial_update_interval, long update_interval);
int dbcounterlib_get_1multival_incountervalues(int index, multitypeval_t *val);
int dbcounterlib_new_1multival_outcounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval);
int dbcounterlib_addto1multivaloutcounter(int index, multitypeval_t val);
int dbcounterlib_addto1multivaloutcounter(int index, multitypeval_t val);
int dbcounterlib_new_1multival_updatecounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval);
int dbcounterlib_addto1multivalupdatecounter(int index, multitypeval_t val);

int dbcounterlib_checkifindexvalid(int index, int expected_countertype);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define DBLIB_DEPIDX 1
#define COMMONSERVERLIB_DEPIDX 2
#define CMDSERVERLIB_DEPIDX 3

static dbcounterlib_ifaceptrs_ver_1_t dbcounterlib_ifaceptrs_ver_1={
  .init=dbcounterlib_init,
  .shutdown=dbcounterlib_shutdown,
  .deletecounter=dbcounterlib_deletecounter,
  .scheduledeletecounter=dbcounterlib_scheduledeletecounter,
  .new_1multival_incounter=dbcounterlib_new_1multival_incounter,
  .get_1multival_incountervalues=dbcounterlib_get_1multival_incountervalues,
  .new_1multival_outcounter=dbcounterlib_new_1multival_outcounter,
  .addto1multivaloutcounter=dbcounterlib_addto1multivaloutcounter,
  .new_1multival_updatecounter=dbcounterlib_new_1multival_updatecounter,
  .addto1multivalupdatecounter=dbcounterlib_addto1multivalupdatecounter,
  .checkifindexvalid=dbcounterlib_checkifindexvalid
};

static moduleiface_ver_1_t dbcounterlib_ifaces[]={
  {
    .ifaceptr=&dbcounterlib_ifaceptrs_ver_1,
    .ifacever=DBCOUNTERLIBINTERFACE_VER_1
  },
  {
    .ifaceptr=NULL
  }
};

static moduledep_ver_1_t dbcounterlib_deps[]={
  {
    .modulename="debuglib",
    .ifacever=DEBUGLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="dblib",
    .ifacever=DBLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="commonserverlib",
    .ifacever=COMMONSERVERLIBINTERFACE_VER_1,
    .required=0
  },
  {
    .modulename="cmdserverlib",
    .ifacever=CMDSERVERLIBINTERFACE_VER_1,
    .required=0
  },
  {
    .modulename=NULL
  }
};

static moduleinfo_ver_1_t dbcounterlib_moduleinfo_ver_1={
  .moduleinfover=MODULEINFO_VER_1,
  .modulename="dbcounterlib",
  .initfunc=dbcounterlib_init,
  .shutdownfunc=dbcounterlib_shutdown,
  .startfunc=dbcounterlib_start,
  .stopfunc=dbcounterlib_stop,
  .registerlistenersfunc=dbcounterlib_register_listeners,
  .unregisterlistenersfunc=dbcounterlib_unregister_listeners,
  .moduleifaces=&dbcounterlib_ifaces,
  .moduledeps=&dbcounterlib_deps
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void dbcounterlib_backtrace(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __func__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __func__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __func__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
static inline void dbcounterlib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

/*
  Initialise the database counter library
  Returns 0 for success or other value on error
*/
int dbcounterlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  ++dbcounterlib_inuse;
  if (dbcounterlib_inuse>1) {
    //Already started
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, dbcounterlib_inuse);
    return 0;
  }

  //Let the database library know that we want to use it
  dblibifaceptr->init();

  dbcounterlib_quit=0;
  if (sem_init(&dbcounterlib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&dbcounterlibmutex, &errorcheckmutexattr);
#endif

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  return 0;
}

/*
  Shutdown the database counter library to a clean known state.
*/
void dbcounterlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (dbcounterlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Shouldn't be here, already shutdown\n", __func__);
    return;
  }
  --dbcounterlib_inuse;
  if (dbcounterlib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, dbcounterlib_inuse);
    return;
  }
  if (counters) {
    int i;

    for (i=0; i < gnumcounters; i++) {
      _dbcounterlib_deletecounter(i);
    }
    free(counters);
    counters=NULL;
    gnumcounters=0;
  }
  //Finished using the database library
  dblibifaceptr->shutdown();

  dbcounterlib_timejumpedbacksmallcnt=dbcounterlib_timejumpedforwardsmallcnt=0;
  dbcounterlib_timejumpedbacklargecnt=dbcounterlib_timejumpedforwardlargecnt=0;

  sem_destroy(&dbcounterlib_mainthreadsleepsem);

  //Finished shutting down

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&dbcounterlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Start the dbcounter library including starting of threads, etc.
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
int dbcounterlib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (dbcounterlib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already stopping\n", __func__);
    return -1;
  }

  if (!gmainthread) {
    result=pthread_create(&gmainthread, NULL, dbcounterlib_MainThreadLoop, NULL);
    if (result!=0) {
      gmainthread=0;
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Failed to create main thread\n", __func__);
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

/*
  Stop the dbcounter library
  NOTE: Don't need to much thread lock since when this function is called mostly only one thread will be using the variables that are used in this function
*/
void dbcounterlib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  pthread_t tmpthread;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (dbcounterlib_shuttingdown) {
    //Already shutting down
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already stopping\n", __func__);
    return;
  }
  //Start stopping library
  PTHREAD_LOCK(&dbcounterlibmutex);
  dbcounterlib_shuttingdown=1;
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  if (gmainthread) {
    tmpthread=gmainthread;
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    PTHREAD_LOCK(&dbcounterlibmutex);
    dbcounterlib_quit=1;
    sem_post(&dbcounterlib_mainthreadsleepsem);
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);

    //Unlock while stopping the main thread
    pthread_join(tmpthread, NULL);
    gmainthread=0;
  }
  PTHREAD_LOCK(&dbcounterlibmutex);
  dbcounterlib_shuttingdown=0;
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  //Update the database one last time
  dbcounterlib_updatedatabase();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for dbcounter library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void dbcounterlib_register_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=dbcounterlib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(dbcounterlib_processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for dbcounter library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void dbcounterlib_unregister_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=dbcounterlib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(dbcounterlib_processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static void *dbcounterlib_MainThreadLoop(void *thread_val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;
  int quit=0, i, result=0, dbresult, missing_uniqueid;
  time_t curtime=0, wakeuptime, sleeptime, steptime, prevdbupdatetime=0;
  time_t jumpmeasureprevtime=0, jumpmeasurecurtime=0; //Dedicated variables for recording a jump in time
  struct timespec semwaittime;

  clock_gettime(CLOCK_REALTIME, &semwaittime);
  jumpmeasureprevtime=jumpmeasurecurtime=semwaittime.tv_sec;
  while (!quit) {
    missing_uniqueid=0;

    clock_gettime(CLOCK_REALTIME, &semwaittime);
    jumpmeasureprevtime=jumpmeasurecurtime;
    jumpmeasurecurtime=curtime=semwaittime.tv_sec;

    //Testing
    //jumpmeasureprevtime=jumpmeasurecurtime+8000;
    //Check for a jump in time
    if (jumpmeasurecurtime-jumpmeasureprevtime<0) {
      //Time moved backward which should never happen
      PTHREAD_LOCK(&dbcounterlibmutex);
      if (jumpmeasureprevtime-jumpmeasurecurtime>=DBCOUNTERLIB_TIMEJUMPLARGESTART) {
        ++dbcounterlib_timejumpedbacklargecnt;
      } else {
        ++dbcounterlib_timejumpedbacksmallcnt;
      }
      PTHREAD_UNLOCK(&dbcounterlibmutex);
      debuglibifaceptr->debuglib_printf(1, "%s: Time just moved backwards by amount: %ld\n", __func__, jumpmeasureprevtime-jumpmeasurecurtime);
    } else if (jumpmeasurecurtime-jumpmeasureprevtime>=DBCOUNTERLIB_TIMEJUMPSMALLSTART) {
      //Time moved forward but by a large amount
      PTHREAD_LOCK(&dbcounterlibmutex);
      if (jumpmeasurecurtime-jumpmeasureprevtime>=DBCOUNTERLIB_TIMEJUMPLARGESTART) {
        ++dbcounterlib_timejumpedforwardlargecnt;
      } else {
        ++dbcounterlib_timejumpedforwardsmallcnt;
      }
      PTHREAD_UNLOCK(&dbcounterlibmutex);
      debuglibifaceptr->debuglib_printf(1, "%s: Time just moved forwards by amount: %ld\n", __func__, jumpmeasurecurtime-jumpmeasureprevtime);
    }
    //Get the unique ids for all the counters
    //Only available if the database is loaded
    PTHREAD_LOCK(&dbcounterlibmutex);
    if (dblibifaceptr->is_initialised()) {
      for (i=0; i < gnumcounters; i++) {
        if (counters[i].countertype>=0x10 && counters[i].countertype<0x3000) {
          result=_dbcounterlib_getincounter_uniqueid(i);
          if (result!=0) {
            missing_uniqueid=1;
          }
        }
      }
    }
    PTHREAD_UNLOCK(&dbcounterlibmutex);

    //Update the database
    dbresult=dbcounterlib_updatedatabase();
    prevdbupdatetime=curtime;

    //Step all counters to the next element if time to do so
    //This is needed here so 0 enteries get added to the database if the pulse counters aren't incremented
    PTHREAD_LOCK(&dbcounterlibmutex);
    for (i=0; i < gnumcounters; i++) {
      if (counters[i].countertype>=0x10 && counters[i].countertype<0x3000) {
        _dbcounterlib_stepmultitype4valcounter(i);
      }
    }
    PTHREAD_UNLOCK(&dbcounterlibmutex);

    //Find the next wakeup time
    clock_gettime(CLOCK_REALTIME, &semwaittime);
    curtime=semwaittime.tv_sec;
    if (dbresult==0 && !missing_uniqueid) {
      wakeuptime=curtime + DBCOUNTERLIB_MAX_SLEEP_TIME;
    } else {
      wakeuptime=curtime + DBCOUNTERLIB_MIN_SLEEP_TIME;
    }
    PTHREAD_LOCK(&dbcounterlibmutex);
    if (dblibifaceptr->is_initialised()) {
      //All the current counters can only be accessed when the database is loaded
      for (i=0; i < gnumcounters; i++) {
        steptime=_dbcounterlib_getcounternextsteptime(i);
        if (steptime>0) {
          if (steptime<wakeuptime) {
            wakeuptime=steptime;
          }
        }
      }
    }
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    if (wakeuptime>curtime) {
      debuglibifaceptr->debuglib_printf(1, "%s: next wakeup time now set to %ld\n", __func__, wakeuptime);
      debuglibifaceptr->debuglib_printf(1, "%s: Current Time=%ld\n", __func__, curtime);
      sleeptime=wakeuptime - curtime;
#ifdef DEBUG
      {
        char timestr[100];
        ctime_r(&wakeuptime, timestr);
        //Remove newline at end of timestr
        timestr[strlen(timestr)-1]='\0';
        debuglibifaceptr->debuglib_printf(1, "%s: Sleeping for %ld seconds to reach time %s\n", __func__, sleeptime, timestr);
      }
#endif
      semwaittime.tv_nsec=0;
      semwaittime.tv_sec=wakeuptime;
#ifdef DEBUG
      if (sem_timedwait(&dbcounterlib_mainthreadsleepsem, &semwaittime)==0) {
        char timestr[100];

        clock_gettime(CLOCK_REALTIME, &semwaittime);
        curtime=semwaittime.tv_sec;

        ctime_r(&curtime, timestr);
        //Remove newline at end of timestr
        timestr[strlen(timestr)-1]='\0';
        debuglibifaceptr->debuglib_printf(1, "%s: Wokeup early at time %s\n", __func__, timestr);
      }
#else
      sem_timedwait(&dbcounterlib_mainthreadsleepsem, &semwaittime);
#endif
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: Not sleeping at time: %ld\n", __func__, curtime);
    }
    quit=dbcounterlib_quit;
  }
  return (void *) 0;
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int dbcounterlib_processcommand(const char *buffer, int clientsock) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=dbcounterlib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  char tmpstrbuf[100];
  int len;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  len=strlen(buffer);
  if (strncmp(buffer, "dbcounter_get_timejump_status", 29)==0) {
    long ltimejumpedbacksmallcnt, ltimejumpedforwardsmallcnt;
    long ltimejumpedbacklargecnt, ltimejumpedforwardlargecnt;

    PTHREAD_LOCK(&dbcounterlibmutex);
    ltimejumpedbacksmallcnt=dbcounterlib_timejumpedbacksmallcnt;
    ltimejumpedforwardsmallcnt=dbcounterlib_timejumpedforwardsmallcnt;
    ltimejumpedbacklargecnt=dbcounterlib_timejumpedbacklargecnt;
    ltimejumpedforwardlargecnt=dbcounterlib_timejumpedforwardlargecnt;
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    sprintf(tmpstrbuf, "Time has jumped back by a small amount: %ld times\n", ltimejumpedbacksmallcnt);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    sprintf(tmpstrbuf, "Time has jumped back by a large amount: %ld times\n", ltimejumpedbacklargecnt);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    sprintf(tmpstrbuf, "Time has jumped forward by a small amount: %ld times\n", ltimejumpedforwardsmallcnt);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    sprintf(tmpstrbuf, "Time has jumped forward by a large amount: %ld times\n", ltimejumpedforwardlargecnt);
    commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  return CMDLISTENER_NOERROR;
}

/*
  Update the database with counter values that are ready to commit in a single transaction
  NOTE: Not sure how to properly rollback the entire counter set for a failure at the moment
    so each counter is committed in its own transaction at the moment.
  Returns negative value on error or 0 if success
*/
static int dbcounterlib_updatedatabase(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;
  //updatestatus tracks any errors that occur during the entire database update session
  //curupdatestatus tracks any errors that occur during the database update of the current counter
  int i, result, numcounters, curoutidx, updatestatus=0, curupdatestatus;
  time_t curtime;
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  PTHREAD_LOCK(&dbcounterlibmutex);
  if (dbcounterlib_shuttingdown==1) {
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s (Shutting down)\n", __func__);
    return -1;
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  //First check if the database is initialised
  if (!dblibifaceptr->is_initialised()) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s (database not loaded)\n", __func__);
    return -1;
  }
  //Commit counters that are due to be updated
  clock_gettime(CLOCK_REALTIME, &semwaittime);
  curtime=semwaittime.tv_sec;

  updatestatus=0;
  PTHREAD_LOCK(&dbcounterlibmutex);
  numcounters=gnumcounters;
  PTHREAD_UNLOCK(&dbcounterlibmutex);
  for (i=0; i<numcounters && updatestatus>=0; i++) {
    curupdatestatus=0;
    PTHREAD_LOCK(&dbcounterlibmutex);
    curoutidx=counters[i].curoutidx;
    if (curoutidx != counters[i].curinidx || (counters[i].countertype>=0x1000 && counters[i].countertype<0x2000)) {
      //Start a transaction
      result=dblibifaceptr->begin();
      if (result<0) {
        //Stop processing any more counters
        debuglibifaceptr->debuglib_printf(1, "%s: Failed to begin transaction for counter: %d\n", __func__, i);
        updatestatus=curupdatestatus=-4;
      } else if (counters[i].countertype>=0x10 && counters[i].countertype<0x3000) {
        //Multitype counter
        multitype4val_counter_t *multitype4val_counterptr;

        multitype4val_counterptr=(multitype4val_counter_t *) counters[i].child;
        if (multitype4val_counterptr->uniqueid) {
          if (counters[i].countertype>=0x10 && counters[i].countertype<0x1000) {
            //Multitype outgoing counter
            while(curoutidx != counters[i].curinidx) {
              //Commit all pending elements that need committing
              if (multitype4val_counterptr->elems[curoutidx].updatetime!=0 && multitype4val_counterptr->elems[curoutidx].submitted) { //Throw away elements that don't have an update time set or that don't have a submitted value
                result=-1;
                if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT) {
                  result=dblibifaceptr->insert_sensor_datafloat_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.doubleval);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT) {
                  result=dblibifaceptr->insert_sensor_databigint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.sval64bit);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT) {
                  result=dblibifaceptr->insert_sensor_dataint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.sval32bit);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT) {
                  result=dblibifaceptr->insert_sensor_datatinyint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.uval8bit);
                }
                if (result != 0) {
                  //Failed to update the database
                  debuglibifaceptr->debuglib_printf(1, "%s: Failed to add 1 value for multivalue counter: %d\n", __func__, i);
                  updatestatus=curupdatestatus=-3;
                  break;
                }
              }
              ++curoutidx;
              if (curoutidx==gnumelems) {
                curoutidx=0;
              }
            }
          } else if (counters[i].countertype>=0x1000 && counters[i].countertype<0x2000) {
            //Multitype incoming counter
            //NOTE: Need curtime variable, the other counters are okay as they have elems, but in doesn't so need to check time
            if (curtime >= multitype4val_counterptr->updatetime) {
              //Retrieve the value from the database
              result=-1;
              multitype4val_counterptr->havequeried=1;
              if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE) {
                //32-bit signed integer
                result=dblibifaceptr->getioport_state(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.sval32bit);
              } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT) {
                //32-bit signed integer
                result=dblibifaceptr->getsensor_dataint_value(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.sval32bit);
              } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_SAMPLERATECURRENT) {
                //double
                result=dblibifaceptr->getsensor_sampleratecurrent(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.doubleval);
              } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT) {
                //double
                result=dblibifaceptr->getsensor_datafloat_value(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.doubleval);
              } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT) {
                //64-bit signed integer
                result=dblibifaceptr->getsensor_databigint_value(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.sval64bit);
              } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT) {
                //8-bit unsigned integer
                result=dblibifaceptr->getsensor_datatinyint_value(multitype4val_counterptr->uniqueid, &multitype4val_counterptr->val.uval8bit);
              }
              if (result>=0 && multitype4val_counterptr->valset==0) {
                multitype4val_counterptr->valset=1;
              }
            }
          } else if (counters[i].countertype>=0x2000 && counters[i].countertype<0x3000) {
            //Multitype update counter
            while(curoutidx != counters[i].curinidx) {
              //Commit all pending elements that need committing
              if (multitype4val_counterptr->elems[curoutidx].updatetime!=0 && multitype4val_counterptr->elems[curoutidx].submitted) { //Throw away elements that don't have an update time set or that don't have a submitted value
                result=-1;
                //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: index=%d, Field ID %d\n", __func__, i, multitype4val_counterptr->fieldid);
                if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE) {
                  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Updating idx=%d, ioport state to %d\n", __func__, i, multitype4val_counterptr->elems[curoutidx].val.sval32bit);
                  result=dblibifaceptr->update_ioports_state(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].val.sval32bit);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT) {
                  result=dblibifaceptr->update_sensor_datafloat_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.doubleval);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT) {
                  result=dblibifaceptr->update_sensor_databigint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.sval64bit);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT) {
                  result=dblibifaceptr->update_sensor_dataint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.sval32bit);
                } else if (multitype4val_counterptr->fieldid==DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT) {
                  result=dblibifaceptr->update_sensor_datatinyint_value(multitype4val_counterptr->uniqueid, multitype4val_counterptr->elems[curoutidx].updatetime, multitype4val_counterptr->elems[curoutidx].val.uval8bit);
                }
                if (result != 0) {
                  //Failed to update the database
                  debuglibifaceptr->debuglib_printf(1, "%s: Failed to update 1 value for multivalue counter: %d\n", __func__, i);
                  updatestatus=curupdatestatus=-3;
                  break;
                }
              }
              ++curoutidx;
              if (curoutidx==gnumelems) {
                curoutidx=0;
              }
            }
          }
        }
      }
      if (curupdatestatus==0) {
        result=dblibifaceptr->end();
        if (result<0) {
          //Failed to update the database
          debuglibifaceptr->debuglib_printf(1, "%s: Failed to commit transaction for counter: %d\n", __func__, i);
          updatestatus=curupdatestatus=-3;
        } else {
          updatestatus=curupdatestatus=0;
        }
      }
      if (curupdatestatus==-3) {
        result=dblibifaceptr->rollback();
        if (result<0) {
          debuglibifaceptr->debuglib_printf(1, "%s: Failed to rollback transaction for counter: %d\n", __func__, i);
          updatestatus=curupdatestatus=-4;

          //Stop processing any more counters
          PTHREAD_UNLOCK(&dbcounterlibmutex);
          break;
        } else {
          updatestatus=curupdatestatus=0;
        }
      }
      //Update real out index
      if (curupdatestatus==0) {
        counters[i].curoutidx=curoutidx;
      }
    }
    //Remove the counter if scheduled for deletion
    //Do this even if the data failed to commit since if commit never succeeds we may end up leaking a counter otherwise
    if (counters[i].needtoremove==1) {
      _dbcounterlib_deletecounter(i);
    }
    PTHREAD_UNLOCK(&dbcounterlibmutex);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  return updatestatus;
}

static time_t dbcounterlib_calcnextupdatetime(time_t curtime, time_t update_interval) {
  return curtime - (curtime % update_interval) + update_interval;
}

/*
  Check if a given index is valid
  expected_countertype should be -1 to not check or a valid type to compare the counter type with
  Returns 0 on success or negative value on error
*/
static int _dbcounterlib_checkifindexvalid(int index, int expected_countertype) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  if (index<0 || index>=gnumcounters) {
    debuglibifaceptr->debuglib_printf(1, "%s: index: %d out of range\n", __func__, index);
    return -101;
  }
  if (counters[index].needtoremove==1) {
    debuglibifaceptr->debuglib_printf(1, "%s: index: %d has been scheduled for removal\n", __func__, index);
    return -102;
  }
  if (counters[index].countertype==DBCOUNTERLIB_SPARECOUNTER) {
    debuglibifaceptr->debuglib_printf(1, "%s: index: %d is currently an empty slot\n", __func__, index);
    return -103;
  }
  if (expected_countertype!= -1 && counters[index].countertype!=expected_countertype) {
    debuglibifaceptr->debuglib_printf(1, "%s: index: %d is not a counter of type: %d\n", __func__, index, expected_countertype);
    return -104;
  }
  return 0; 
}

int dbcounterlib_checkifindexvalid(int index, int expected_countertype) {
  int result;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_checkifindexvalid(index, expected_countertype);
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}

/*
  Allocate memory for a new base counter and initialise the values
  On return, gnumcounters will be updated and the returned value is the slot number for the new counter
  On error, returns negative value (not enough memory or other error) and gnumcounters will be unchanged
  Expects caller to implement thread safety
*/
static int _dbcounterlib_newbasecounter(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  counter_t *tmpptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Find a slot to store the counter
  for (i=0; i<gnumcounters; i++) {
    if (counters[i].countertype==DBCOUNTERLIB_SPARECOUNTER) {
      break;
    }
  }
  if (i==gnumcounters) {
    //Need to expand the array
    tmpptr=(counter_t *) realloc(counters, (gnumcounters+1)*sizeof(counter_t));
    if (tmpptr==NULL) {
      debuglibifaceptr->debuglib_printf(1, "%s: Unable to allocate memory for new counter\n", __func__);
      debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
      return -1;
    }
    counters=tmpptr;
    ++gnumcounters;
  }
  counters[i].countertype=DBCOUNTERLIB_BASECOUNTER;
  counters[i].curinidx=0;
  counters[i].curoutidx=0;
  counters[i].needtoremove=0;
  counters[i].child=NULL;

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return i;
}

/*
  delete a counter (Non-locked version)
  Returns 0 on success or negative value on failure
  NOTE: dbupdate currently expects gnumcounters to never shrink so this function should never shrink the counters array
    dbupdate does need the array to never shink even though it makes a local copy of gnumcounters before beginning the commit operations.
    To fix this, dbupdate would have to make a copy of the entire counter array before beginning the commit operations.  Then this
    function could shink the array while dbupdate is running.
*/
static int _dbcounterlib_deletecounter(int index) {
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;

  if (counters[index].countertype>=0x10) {
    multitype4val_counter_t *multitype4val_counterptr;

    //Any type >= 0x10 and <0xFFF uses the new multitype counter
    multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;

    //Remove the outgoing elements
    if (multitype4val_counterptr->elems) {
      free(multitype4val_counterptr->elems);
    }
    //Free the sensor name
    if (multitype4val_counterptr->sensor_name) {
      free(multitype4val_counterptr->sensor_name);
    }
    //Free the unique id
    if (multitype4val_counterptr->uniqueid) {
      dblibifaceptr->freeuniqueid(multitype4val_counterptr->uniqueid);
    }
    free(counters[index].child);
    counters[index].child=NULL;
  }
  counters[index].countertype=DBCOUNTERLIB_SPARECOUNTER;
  counters[index].needtoremove=0;
  counters[index].curinidx=0;
  counters[index].curoutidx=0;

  return 0;
}

/*
  Delete a counter
  Returns 0 on success or negative value on failure
*/
int dbcounterlib_deletecounter(int index) {
  int result;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_checkifindexvalid(index, -1);
  if (result==0) {
    result=_dbcounterlib_deletecounter(index);
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}

int dbcounterlib_scheduledeletecounter(int index) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;

  PTHREAD_LOCK(&dbcounterlibmutex);
  //Schedule for removal
  result=_dbcounterlib_checkifindexvalid(index, -1);
  if (result==0) {
    counters[index].needtoremove=1;
    debuglibifaceptr->debuglib_printf(1, "%s: Counter: %d has been scheduled for removal\n", __func__, index);
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}

/*
  Get the time that a counter should be stepped to the next element
  Returns the timestamp if success or negative value on error
*/
static time_t _dbcounterlib_getcounternextsteptime(int index) {
  if ((counters[index].countertype>=0x10 && counters[index].countertype<0x1000) || (counters[index].countertype>=0x2000 && counters[index].countertype<0x3000)) {
    multitype4val_counter_t *multitype4val_counterptr;

    multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
    return multitype4val_counterptr->elems [ counters[index].curinidx ].updatetime;
  } else if (counters[index].countertype>=0x1000 && counters[index].countertype<0x2000) {
    multitype4val_counter_t *multitype4val_counterptr;

    multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
    return multitype4val_counterptr->updatetime;
  }
  return -1;
}

static multitypeval_t dbcounterlib_get_multitype_zeroval(int countertype) {
  multitypeval_t zeroval;

  switch (countertype) {
    case DBCOUNTERLIB_1UINT8_OUTCOUNTER:
    case DBCOUNTERLIB_1UINT8_INCOUNTER:
    case DBCOUNTERLIB_1UINT8_UPDATECOUNTER:
      zeroval.uval8bit=0;
      break;
    case DBCOUNTERLIB_1INT32_OUTCOUNTER:
    case DBCOUNTERLIB_1INT32_INCOUNTER:
    case DBCOUNTERLIB_1INT32_UPDATECOUNTER:
      zeroval.sval32bit=0;
      break;
    case DBCOUNTERLIB_1INT64_OUTCOUNTER:
    case DBCOUNTERLIB_1INT64_INCOUNTER:
    case DBCOUNTERLIB_1INT64_UPDATECOUNTER:
      zeroval.sval64bit=0;
      break;
    case DBCOUNTERLIB_1DOUBLE_OUTCOUNTER:
    case DBCOUNTERLIB_1DOUBLE_INCOUNTER:
    case DBCOUNTERLIB_1DOUBLE_UPDATECOUNTER:
      zeroval.doubleval=0.0;
      break;
   }
   return zeroval;
}

/*
  Bring a multitype 4 value counter element set up to date with the current time
  Expects to be only called for a multitype value counter counter
  Returns 0 for success or negative value on error
*/
static int _dbcounterlib_stepmultitype4valcounter(int index) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  struct timespec semwaittime;
  time_t curtime;
  multitype4val_counter_t *multitype4val_counterptr;

  clock_gettime(CLOCK_REALTIME, &semwaittime);
  curtime=semwaittime.tv_sec;
  multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;

  if (multitype4val_counterptr->elems) {
    //Outgoing or Update counter

    //NOTE: Here we assume that the time will never go backwards so this test should only be true at bootup before the
    //  correct time has been retrieved
    if (curtime < DBCOUNTERLIB_MINPULSEDATE) {
      debuglibifaceptr->debuglib_printf(1, "%s: Current time: %ld is less than the oldest valid time: %ld so not storing\n", __func__, curtime, DBCOUNTERLIB_MINPULSEDATE);
      return -1;
    }
    if (multitype4val_counterptr->elems[ counters[index].curinidx ].updatetime==0) {
      //Initialise counter update time if not set yet
      multitype4val_counterptr->elems[ counters[index].curinidx ].updatetime=dbcounterlib_calcnextupdatetime(curtime, multitype4val_counterptr->update_interval);
    }
    if (curtime >= multitype4val_counterptr->elems[ counters[index].curinidx ].updatetime) {
      multitypeval_t zeroval=dbcounterlib_get_multitype_zeroval(counters[index].countertype);

      //We do store 0 value entries in the database
      ++counters[index].curinidx;
      if (counters[index].curinidx==gnumelems) {
        counters[index].curinidx=0;
      }
      if (counters[index].curinidx == counters[index].curoutidx) {
        //Throw away really old elements that haven't been stored yet if we run out of elements
        ++counters[index].curoutidx;
        if (counters[index].curoutidx==gnumelems) {
          counters[index].curoutidx=0;
        }
      }
      //Initialise new 4 value counter element value
      multitype4val_counterptr->elems[ counters[index].curinidx ].val=zeroval;
      multitype4val_counterptr->elems[ counters[index].curinidx ].val2=zeroval;
      multitype4val_counterptr->elems[ counters[index].curinidx ].val3=zeroval;
      multitype4val_counterptr->elems[ counters[index].curinidx ].val4=zeroval;
      multitype4val_counterptr->elems[ counters[index].curinidx ].submitted=0;
      multitype4val_counterptr->elems[ counters[index].curinidx ].updatetime=dbcounterlib_calcnextupdatetime(curtime, multitype4val_counterptr->update_interval);

      debuglibifaceptr->debuglib_printf(1, "%s: index=%d, inidx=%d, Next update time=%ld\n", __func__, index, counters[index].curinidx, multitype4val_counterptr->elems[ counters[index].curinidx ].updatetime);
    }
  }
  if (counters[index].countertype>=0x1000 && counters[index].countertype<0x2000) {
    //NOTE: Even if the time is backwards we should still retrieve values from the database
    if (multitype4val_counterptr->updatetime==0 || curtime >= multitype4val_counterptr->updatetime) {
      //Initialise update time if not set yet or update the update time
      if (!multitype4val_counterptr->valset) {
        multitype4val_counterptr->updatetime=dbcounterlib_calcnextupdatetime(curtime, multitype4val_counterptr->initial_update_interval);
      } else {
        multitype4val_counterptr->updatetime=dbcounterlib_calcnextupdatetime(curtime, multitype4val_counterptr->update_interval);
      }
      debuglibifaceptr->debuglib_printf(1, "%s: index=%d, inidx=%d, Next update time=%ld\n", __func__, index, counters[index].curinidx, multitype4val_counterptr->updatetime);
    }
  }
  return 0;
}

/*
  Retrieve the unique id from the database for a sql value or sensor in counter based on the serial number, and port id, and maybe sensor name
  Returns 0 for success or negative value on error
  Uses portid: 0
*/
static int _dbcounterlib_getincounter_uniqueid(int index) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=dbcounterlib_deps[DBLIB_DEPIDX].ifaceptr;
  multitype4val_counter_t *multitype4val_counterptr;
  void *uniqueid;

  multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
  if (!multitype4val_counterptr->uniqueid) {
    if (multitype4val_counterptr->sensor_name && multitype4val_counterptr->sensor_name[0]!=0) {
      uniqueid=dblibifaceptr->getsensor_uniqueid(multitype4val_counterptr->addr, multitype4val_counterptr->portid, multitype4val_counterptr->sensor_name);
      if (!uniqueid) {
        debuglibifaceptr->debuglib_printf(1, "%s: Unable to retrieve unique id for counter: %d Sensor Name: %s\n", __func__, index, multitype4val_counterptr->sensor_name);
      }
    } else {
      uniqueid=dblibifaceptr->getport_uniqueid(multitype4val_counterptr->addr, multitype4val_counterptr->portid);
      if (!uniqueid) {
        debuglibifaceptr->debuglib_printf(1, "%s: Unable to retrieve unique id for counter: %d Port ID: %d\n", __func__, index, multitype4val_counterptr->portid);
      }
    }
    if (uniqueid) {
      debuglibifaceptr->debuglib_printf(1, "%s: Device: %016llX\n", __func__, multitype4val_counterptr->addr);
      multitype4val_counterptr->uniqueid=uniqueid;
    } else {
      //Invalidate the uniqueid since it can't be retrieved from the database at the moment
      multitype4val_counterptr->uniqueid=NULL;
      return -1;
    }
  }
  return 0;
}

/*
  Allocate memory for a new 1 value in counter and initialise the values
  addr: 64-bit global unique address of the zigbee device
  fieldid: Field id indicating what database table/field to retrieve from
  sensor_name: Name of a sensor to retrieve data from or NULL if retrieving from a non-sensor table
  update_interval: The time to wait before submitting an accumulated pulse value to the database (0=default of 300 seconds (5 minutes))
  On return, gnumcounters will be updated and the returned value is the slot number for the new counter
  On error, returns negative value (not enough memory or other error) and gnumcounters will be unchanged
  Expects caller to implement thread safety
*/
static int _dbcounterlib_new_1multival_incounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long initial_update_interval, long update_interval) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  multitype4val_counter_t *multitype4val_counterptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (update_interval==0) {
    update_interval=DBCOUNTERLIB_DEFAULT_UPDATE_INTVAL;
  }
  if (update_interval<DBCOUNTERLIB_MIN_UPDATE_INTVAL) {
    debuglibifaceptr->debuglib_printf(1, "%s: Update interval: Error: %ld is lower than the minimum limit: %ld\n", __func__, update_interval, DBCOUNTERLIB_MIN_UPDATE_INTVAL);
    return -1;
  }
  if (initial_update_interval==0) {
    initial_update_interval=DBCOUNTERLIB_DEFAULT_UPDATE_INTVAL;
  }
  if (initial_update_interval<DBCOUNTERLIB_MIN_UPDATE_INTVAL) {
    debuglibifaceptr->debuglib_printf(1, "%s: Initial Update interval: Error: %ld is lower than the minimum limit: %ld\n", __func__, initial_update_interval, DBCOUNTERLIB_MIN_UPDATE_INTVAL);
    return -1;
  }
  //Allocate memory for a new base counter
  i=_dbcounterlib_newbasecounter();
  if (i<0) {
    //Allocate error
    return i;
  }
  //Allocate memory for a new multitype 1 value counter
  multitype4val_counterptr=(multitype4val_counter_t *) calloc(1, sizeof(multitype4val_counter_t));
  if (multitype4val_counterptr==NULL) {
    //Failed to allocate memory for a new pulse counter
    _dbcounterlib_deletecounter(i);
    return -1;
  }
  counters[i].child=multitype4val_counterptr;
  counters[i].countertype=DBCOUNTERLIB_MULTITYPE_INCOUNTER;
  if (sensor_name) {
    multitype4val_counterptr->sensor_name=(char *) malloc((strlen(sensor_name)+1)*sizeof(char));
    if (!multitype4val_counterptr->sensor_name) {
      //Faled to allocate memory
      _dbcounterlib_deletecounter(i);
      return -1;
    }
    strcpy(multitype4val_counterptr->sensor_name, sensor_name);
  }
  multitype4val_counterptr->addr=addr;
  multitype4val_counterptr->portid=portid;
  multitype4val_counterptr->fieldid=fieldid;
  switch (fieldid) {
    case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
    case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
      counters[i].countertype=DBCOUNTERLIB_1INT32_INCOUNTER;
      multitype4val_counterptr->val.sval32bit=0;
      break;
    case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_SAMPLERATECURRENT:
    case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
      counters[i].countertype=DBCOUNTERLIB_1DOUBLE_INCOUNTER;
      multitype4val_counterptr->val.doubleval=0.0;
      break;
    case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
      counters[i].countertype=DBCOUNTERLIB_1INT64_INCOUNTER;
      multitype4val_counterptr->val.sval64bit=0;
      break;
    case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
      counters[i].countertype=DBCOUNTERLIB_1UINT8_INCOUNTER;
      multitype4val_counterptr->val.uval8bit=0;
      break;
  }
  multitype4val_counterptr->initial_update_interval=initial_update_interval;
  multitype4val_counterptr->update_interval=update_interval;

  _dbcounterlib_stepmultitype4valcounter(i);

  debuglibifaceptr->debuglib_printf(1, "%s: In Counter: %d has been created for Zigbee: %016llX\n", __func__, i, addr);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  //Wake up the main thread to update the database
  sem_post(&dbcounterlib_mainthreadsleepsem);

  return i;
}

int dbcounterlib_new_1multival_incounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long initial_update_interval, long update_interval) {
  int result;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_new_1multival_incounter(addr, portid, fieldid, sensor_name, initial_update_interval, update_interval);
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}

/*
  Get the value of a 1 value in counter
  Returns one of the In Counter Status Values depending on whether the value is set or not
  Also stores the value in a pointer to a passed in variable if the value is available
*/
int dbcounterlib_get_1multival_incountervalues(int index, multitypeval_t *val) {
  int result;
  multitype4val_counter_t *multitype4val_counterptr;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_checkifindexvalid(index, -1);
  if (result!=0) {
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    return DBCOUNTERLIB_INCOUNTER_STATUS_NOVALUESSET;
  }
  multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
  if (multitype4val_counterptr->havequeried) {
    result=DBCOUNTERLIB_INCOUNTER_STATUS_VALUENOTPRESENT;
  } else {
    result=DBCOUNTERLIB_INCOUNTER_STATUS_NOVALUESSET;
  }
  if (multitype4val_counterptr->valset) {
    if (val) {
      switch (counters[index].countertype) {
        case DBCOUNTERLIB_1DOUBLE_INCOUNTER:
          val->doubleval=multitype4val_counterptr->val.doubleval;
          result=DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET;
          break;
        case DBCOUNTERLIB_1INT64_INCOUNTER:
          val->sval64bit=multitype4val_counterptr->val.sval64bit;
          result=DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET;
          break;
        case DBCOUNTERLIB_1INT32_INCOUNTER:
          val->sval32bit=multitype4val_counterptr->val.sval32bit;
          result=DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET;
          break;
        case DBCOUNTERLIB_1UINT8_INCOUNTER:
          val->uval8bit=multitype4val_counterptr->val.uval8bit;
          result=DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET;
          break;
      }
    }
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}

/*
  Allocate memory for a new 1 value out counter and initialise the values
  addr: 64-bit global unique address of the zigbee device
  fieldid: Field id indicating what database table/field to add to
  sensor_name: Name of a sensor to add data to or NULL if retrieving from a non-sensor table
  update_interval: The time to wait before submitting an accumulated pulse value to the database (0=default of 300 seconds (5 minutes))
  On return, gnumcounters will be updated and the returned value is the slot number for the new counter
  On error, returns negative value (not enough memory or other error) and gnumcounters will be unchanged
  Expects caller to implement thread safety
*/
static int _dbcounterlib_new_1multival_outcounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  multitype4val_counter_t *multitype4val_counterptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (update_interval==0) {
    update_interval=DBCOUNTERLIB_DEFAULT_UPDATE_INTVAL;
  }
  if (update_interval<DBCOUNTERLIB_MIN_UPDATE_INTVAL) {
    debuglibifaceptr->debuglib_printf(1, "%s: Update interval: Error: %ld is lower than the minimum limit: %ld\n", __func__, update_interval, DBCOUNTERLIB_MIN_UPDATE_INTVAL);
    return -1;
  }
  //Allocate memory for a new base counter
  i=_dbcounterlib_newbasecounter();
  if (i<0) {
    //Allocate error
    return i;
  }
  //Allocate memory for a new multitype 1 value counter
  multitype4val_counterptr=(multitype4val_counter_t *) calloc(1, sizeof(multitype4val_counter_t));
  if (multitype4val_counterptr==NULL) {
    //Failed to allocate memory for a new pulse counter
    _dbcounterlib_deletecounter(i);
    return -1;
  }
  counters[i].child=multitype4val_counterptr;
  counters[i].countertype=DBCOUNTERLIB_MULTITYPE_OUTCOUNTER;

  //Allocate memory and initialise first element to all 0
  multitype4val_counterptr->elems=(union4valcounterelem_t *) calloc(1, sizeof(union4valcounterelem_t)*gnumelems);
  if (multitype4val_counterptr->elems==NULL) {
    free(multitype4val_counterptr);
    _dbcounterlib_deletecounter(i);
    return -2;
  }
  if (sensor_name) {
    multitype4val_counterptr->sensor_name=(char *) malloc((strlen(sensor_name)+1)*sizeof(char));
    if (!multitype4val_counterptr->sensor_name) {
      //Faled to allocate memory
      _dbcounterlib_deletecounter(i);
      return -1;
    }
    strcpy(multitype4val_counterptr->sensor_name, sensor_name);
  }
  multitype4val_counterptr->addr=addr;
  multitype4val_counterptr->portid=portid;
  multitype4val_counterptr->fieldid=fieldid;
  if (fieldid>=0x10) {
    switch (fieldid) {
      case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
        counters[i].countertype=DBCOUNTERLIB_1INT32_OUTCOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_SAMPLERATECURRENT:
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
        counters[i].countertype=DBCOUNTERLIB_1DOUBLE_OUTCOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
        counters[i].countertype=DBCOUNTERLIB_1INT64_OUTCOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
        counters[i].countertype=DBCOUNTERLIB_1UINT8_OUTCOUNTER;
        break;
    }
  }
  multitype4val_counterptr->elems[0].val=dbcounterlib_get_multitype_zeroval(counters[i].countertype);;
  multitype4val_counterptr->update_interval=update_interval;

  _dbcounterlib_stepmultitype4valcounter(i);

  debuglibifaceptr->debuglib_printf(1, "%s: Counter: %d has been created for Zigbee: %016llX\n", __func__, i, addr);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  //Wake up the main thread to update the database
  sem_post(&dbcounterlib_mainthreadsleepsem);

  return i;
}

int dbcounterlib_new_1multival_outcounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval) {
  int i;

  PTHREAD_LOCK(&dbcounterlibmutex);
  i=_dbcounterlib_new_1multival_outcounter(addr, portid, fieldid, sensor_name, update_interval);
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return i;
}

/*
  Add 1 value to a multival counter
  Currently throws away values previously submitted within the same interval
  Returns 0 on success or negative value on error
*/
int dbcounterlib_addto1multivaloutcounter(int index, multitypeval_t val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;
  multitype4val_counter_t *multitype4val_counterptr;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_checkifindexvalid(index, -1);
  if (result!=0) {
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    return result;
  }
  if (_dbcounterlib_stepmultitype4valcounter(index)==0) {
    multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
    multitype4val_counterptr->elems [ counters[index].curinidx ].val=val;
    multitype4val_counterptr->elems [ counters[index].curinidx ].submitted=1;
    //TODO: Add handling for printing of all the types
    debuglibifaceptr->debuglib_printf(1, "%s: Inserted %llu to counter: %d Device: %016llX\n", __func__, val.uval64bit, index, multitype4val_counterptr->addr);
    result=0;
  } else {
    result=-1;
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}






/*
  Allocate memory for a new 1 value update counter and initialise the values
  addr: 64-bit global unique address of the zigbee device
  fieldid: Field id indicating what database table/field to add to
  sensor_name: Name of a sensor to add data to or NULL if retrieving from a non-sensor table
  update_interval: The time to wait before submitting an accumulated pulse value to the database (0=default of 300 seconds (5 minutes))
  On return, gnumcounters will be updated and the returned value is the slot number for the new counter
  On error, returns negative value (not enough memory or other error) and gnumcounters will be unchanged
  Expects caller to implement thread safety
*/
static int _dbcounterlib_new_1multival_updatecounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  multitype4val_counter_t *multitype4val_counterptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (update_interval==0) {
    update_interval=DBCOUNTERLIB_DEFAULT_UPDATE_INTVAL;
  }
  if (update_interval<DBCOUNTERLIB_MIN_UPDATE_INTVAL) {
    debuglibifaceptr->debuglib_printf(1, "%s: Update interval: Error: %ld is lower than the minimum limit: %ld\n", __func__, update_interval, DBCOUNTERLIB_MIN_UPDATE_INTVAL);
    return -1;
  }
  //Allocate memory for a new base counter
  i=_dbcounterlib_newbasecounter();
  if (i<0) {
    //Allocate error
    return i;
  }
  //Allocate memory for a new multitype 1 value counter
  multitype4val_counterptr=(multitype4val_counter_t *) calloc(1, sizeof(multitype4val_counter_t));
  if (multitype4val_counterptr==NULL) {
    //Failed to allocate memory for a new pulse counter
    _dbcounterlib_deletecounter(i);
    return -1;
  }
  counters[i].child=multitype4val_counterptr;
  counters[i].countertype=DBCOUNTERLIB_MULTITYPE_UPDATECOUNTER;

  //Allocate memory and initialise first element to all 0
  multitype4val_counterptr->elems=(union4valcounterelem_t *) calloc(1, sizeof(union4valcounterelem_t)*gnumelems);
  if (multitype4val_counterptr->elems==NULL) {
    free(multitype4val_counterptr);
    _dbcounterlib_deletecounter(i);
    return -2;
  }
  if (sensor_name) {
    multitype4val_counterptr->sensor_name=(char *) malloc((strlen(sensor_name)+1)*sizeof(char));
    if (!multitype4val_counterptr->sensor_name) {
      //Faled to allocate memory
      _dbcounterlib_deletecounter(i);
      return -1;
    }
    strcpy(multitype4val_counterptr->sensor_name, sensor_name);
  }
  multitype4val_counterptr->addr=addr;
  multitype4val_counterptr->portid=portid;
  multitype4val_counterptr->fieldid=fieldid;
  if (fieldid>=0x10) {
    switch (fieldid) {
      case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
        counters[i].countertype=DBCOUNTERLIB_1INT32_UPDATECOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_SAMPLERATECURRENT:
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
        counters[i].countertype=DBCOUNTERLIB_1DOUBLE_UPDATECOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
        counters[i].countertype=DBCOUNTERLIB_1INT64_UPDATECOUNTER;
        break;
      case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
        counters[i].countertype=DBCOUNTERLIB_1UINT8_UPDATECOUNTER;
        break;
    }
  }
  multitype4val_counterptr->elems[0].val=dbcounterlib_get_multitype_zeroval(counters[i].countertype);;
  multitype4val_counterptr->update_interval=update_interval;

  _dbcounterlib_stepmultitype4valcounter(i);

  debuglibifaceptr->debuglib_printf(1, "%s: Counter: %d has been created for Device: %016llX\n", __func__, i, addr);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  //Wake up the main thread to update the database
  sem_post(&dbcounterlib_mainthreadsleepsem);

  return i;
}

int dbcounterlib_new_1multival_updatecounter(uint64_t addr, int portid, int fieldid, const char *sensor_name, long update_interval) {
  int i;

  PTHREAD_LOCK(&dbcounterlibmutex);
  i=_dbcounterlib_new_1multival_updatecounter(addr, portid, fieldid, sensor_name, update_interval);
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return i;
}

/*
  Update 1 value of a multival counter
  Currently throws away values previously submitted within the same interval
  Returns 0 on success or negative value on error
*/
int dbcounterlib_addto1multivalupdatecounter(int index, multitypeval_t val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=dbcounterlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;
  multitype4val_counter_t *multitype4val_counterptr;

  PTHREAD_LOCK(&dbcounterlibmutex);
  result=_dbcounterlib_checkifindexvalid(index, -1);
  if (result!=0) {
    PTHREAD_UNLOCK(&dbcounterlibmutex);
    return result;
  }
  if (_dbcounterlib_stepmultitype4valcounter(index)==0) {
    multitype4val_counterptr=(multitype4val_counter_t *) counters[index].child;
    multitype4val_counterptr->elems [ counters[index].curinidx ].val=val;
    multitype4val_counterptr->elems [ counters[index].curinidx ].submitted=1;
    //TODO: Add handling for printing of all the types
    debuglibifaceptr->debuglib_printf(1, "%s: Updated %llu to counter: %d Device: %016llX\n", __func__, val.uval64bit, index, multitype4val_counterptr->addr);
    result=0;
  } else {
    result=-1;
  }
  PTHREAD_UNLOCK(&dbcounterlibmutex);

  return result;
}



moduleinfo_ver_generic_t *dbcounterlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &dbcounterlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_DbCounterLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) dbcounterlib_getmoduleinfo();
}
#endif
