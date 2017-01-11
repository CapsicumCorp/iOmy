/*
Title: MySQL Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This module provides support for mysql database.
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

//NOTE: Some versions of Android may be limited to 512 local references so we need to delete them fairly rapidly

#include <inttypes.h>
#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>
#include <semaphore.h>
#ifndef __ANDROID__
#include <mysql.h>
#endif
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "mysqllib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef DEBUG
#define INLINE
#else
#define INLINE inline
#endif

#define MYSQLLIB_TYPEEMPTY 0
#define MYSQLLIB_TYPENULL 1
#define MYSQLLIB_TYPEINT 2
#define MYSQLLIB_TYPEINT64 3
#define MYSQLLIB_TYPEDOUBLE 4
#define MYSQLLIB_TYPETEXT 5
#define MYSQLLIB_TYPEBLOB 6

//Watch Inputs database version 1
#define MYSQLLIB_GETPORT_UNIQUEID 0 //Get the unique id for an ioport
#define MYSQLLIB_GETSENSOR_UNIQUEID 1 //Get the unique id for an ioport sensor
#define MYSQLLIB_GETIOPORT_STATE 2 //Get the state field for an io port
#define MYSQLLIB_GETSENSOR_SAMPLERATECURRENT 3 //Retrieve the current sample rate for a sensor
#define MYSQLLIB_UPDATE_IOPORT_STATE 4 //Update the state field for an io port
#define MYSQLLIB_INSERT_DATAFLOAT_VALUE 5 //Insert a double value into the DATAFLOAT table
#define MYSQLLIB_INSERT_DATABIGINT_VALUE 6 //Insert an int64 value into the DATABIGINT table
#define MYSQLLIB_INSERT_DATAINT_VALUE 7 //Insert a int32 value into the DATAINT table
#define MYSQLLIB_INSERT_DATATINYINT_VALUE 8 //Insert a int8 value into the DATATINYINT table
#define MYSQLLIB_GET_DATAFLOAT_VALUE 9 //Get the most recent double value from the DATAFLOAT table
#define MYSQLLIB_GET_DATABIGINT_VALUE 10 //Get the most recent int64 value from the DATABIGINT table
#define MYSQLLIB_GET_DATAINT_VALUE 11 //Get the most recent int32 value from the DATAINT table
#define MYSQLLIB_GET_DATATINYINT_VALUE 12 //Get the most recent int8 value from the DATATINYINT table
#define MYSQLLIB_UPDATE_DATAFLOAT_VALUE 13 //Update a double value in the DATAFLOAT table
#define MYSQLLIB_UPDATE_DATABIGINT_VALUE 14 //Update an int64 value in the DATABIGINT table
#define MYSQLLIB_UPDATE_DATAINT_VALUE 15 //Update a int32 value in the DATAINT table
#define MYSQLLIB_UPDATE_DATATINYINT_VALUE 16 //Update a int8 value in the DATATINYINT table
#define MYSQLLIB_GETCOMMPK 17 //Get the pk for a comm address
#define MYSQLLIB_GETLINKPK 18 //Get the pk for a link address
#define MYSQLLIB_GETLINKCOMMPK 19 //Get the comm pk that is associated with a link address

//A unique id for a port on a device
//This is not public so may change at any time
typedef struct {
//  int iopk; //The primary key value for the device ; Not needed at the moment
  int iotechtype; //The type of device
  int ioportspk; //The primary key value for the device's port
  int64_t pk64; //64-bit primary key value
  uint64_t serial; //The serial number of this device
  int hwid; //The hardware id of the port on this device
} mysqllib_uniqueid_t;

static const char *mysqllib_stmts[]={
//Watch Inputs database version 1
  "SELECT THING_PK FROM VR_USERSTHING WHERE LINK_SERIALCODE = ? AND THING_HWID = ?",
  "SELECT IO_PK FROM VR_USERSIO WHERE LINK_SERIALCODE = ? AND THING_HWID = ? AND IO_NAME = ?",
  "SELECT THING_STATE FROM VR_USERSTHING WHERE THING_PK = ?",
  "SELECT IO_SAMPLERATECURRENT FROM IO WHERE IO_PK = ?",

  "UPDATE THING SET THING_STATE=? WHERE THING_PK = ?",

  "INSERT INTO DATAFLOAT (DATAFLOAT_IO_FK, DATAFLOAT_DATE, DATAFLOAT_VALUE) VALUES (?, ?, ?)",
  "INSERT INTO DATABIGINT (DATABIGINT_IO_FK, DATABIGINT_DATE, DATABIGINT_VALUE) VALUES (?, ?, ?)",
  "INSERT INTO DATAINT (DATAINT_IO_FK, DATAINT_DATE, DATAINT_VALUE) VALUES (?, ?, ?)",
  "INSERT INTO DATATINYINT (DATATINYINT_IO_FK, DATATINYINT_DATE, DATATINYINT_VALUE) VALUES (?, ?, ?)",

  "SELECT DATAFLOAT_VALUE FROM DATAFLOAT WHERE DATAFLOAT_IO_FK = ? ORDER BY DATAFLOAT_DATE DESC LIMIT 1",
  "SELECT DATABIGINT_VALUE FROM DATABIGINT WHERE DATABIGINT_IO_FK = ? ORDER BY DATABIGINT_DATE DESC LIMIT 1",
  "SELECT DATAINT_VALUE FROM DATAINT WHERE DATAINT_IO_FK = ? ORDER BY DATAINT_DATE DESC LIMIT 1",
  "SELECT DATATINYINT_VALUE FROM DATATINYINT WHERE DATATINYINT_IO_FK = ? ORDER BY DATATINYINT_DATE DESC LIMIT 1",

  "UPDATE DATAFLOAT SET DATAFLOAT_DATE=?, DATAFLOAT_VALUE=? WHERE DATAFLOAT_IO_FK=?",
  "UPDATE DATABIGINT SET DATABIGINT_DATE=?, DATABIGINT_VALUE=? WHERE DATABIGINT_IO_FK=?",
  "UPDATE DATAINT SET DATAINT_DATE=?, DATAINT_VALUE=? WHERE DATAINT_IO_FK=?",
  "UPDATE DATATINYINT SET DATATINYINT_DATE=?, DATATINYINT_VALUE=? WHERE DATATINYINT_IO_FK=?",

	"SELECT COMM_PK FROM VR_USERSCOMM WHERE COMM_ADDRESS = ?",
	"SELECT LINK_PK FROM VR_USERSLINK WHERE LINK_SERIALCODE = ?",
	"SELECT COMM_PK FROM VR_USERSLINK WHERE LINK_SERIALCODE = ?",
};

static int num_stmts = sizeof(mysqllib_stmts)/sizeof(char *);

static int dbloaded = 0;

static int dbschemaver=0; //We detect the version based on which prepared statements succeed

#ifndef __ANDROID__
static MYSQL *conn=nullptr;
static MYSQL_STMT *preparedstmt[20];
#endif

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t thislibmutex;
static pthread_mutex_t thislibmutex_singleaccess_mutex; //For database access functions that shouldn't be executed simultaneously
static pthread_mutex_t thislib_transaction_mutex;
#else
static pthread_mutex_t thislibmutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t thislibmutex_singleaccess_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t thislib_transaction_mutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int libinuse=0; //Only stop when libinuse = 0

#ifdef __ANDROID__
static JavaVM *mysqllib_gJavaVM;
static jclass mysqllib_mysql_class;
#endif

//Static Function Declarations

//Function Declarations
int mysqllib_init(void);
void mysqllib_shutdown(void);
int mysqllib_loaddatabase(const char *hostname, const char *dbname, const char *username, const char *password);
int mysqllib_unloaddatabase(void);
int mysqllib_is_initialised();
int mysqllib_getschemaversion(void);
int mysqllib_begin(void);
int mysqllib_end(void);
int mysqllib_rollback(void);
void *mysqllib_getport_uniqueid(uint64_t addr, int portid);
void *mysqllib_getsensor_uniqueid(uint64_t addr, int portid, const char *sensor_name);
int mysqllib_getioport_state(const void *uniqueid, int32_t *state);
int mysqllib_getsensor_sampleratecurrent(const void *uniqueid, double *sampleratecurrent);
int mysqllib_update_ioports_state(const void *uniqueid, int32_t value);
int mysqllib_insert_sensor_datafloat_value(const void *uniqueid, int64_t date, double value);
int mysqllib_insert_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value);
int mysqllib_insert_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value);
int mysqllib_insert_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value);
int mysqllib_getsensor_datafloat_value(const void *uniqueid, double *value);
int mysqllib_getsensor_databigint_value(const void *uniqueid, int64_t *value);
int mysqllib_getsensor_dataint_value(const void *uniqueid, int32_t *value);
int mysqllib_getsensor_datatinyint_value(const void *uniqueid, uint8_t *value);
int mysqllib_update_sensor_datafloat_value(const void *uniqueid, int64_t date, double value);
int mysqllib_update_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value);
int mysqllib_update_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value);
int mysqllib_update_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value);
int mysqllib_getcommpk(uint64_t addr, int64_t *commpk);
int mysqllib_getlinkpk(uint64_t addr, int64_t *linkpk);
int mysqllib_getlinkcommpk(uint64_t addr, int64_t *commpk);
void mysqllib_freeuniqueid(void *uniqueid);

//C Exports
extern "C" {

extern moduleinfo_ver_generic_t *mysqllib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_MysqlLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
#endif
}

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0

static mysqllib_ifaceptrs_ver_1_t thislib_ifaceptrs_ver_1={
  mysqllib_init,
  mysqllib_shutdown,
  mysqllib_loaddatabase,
  mysqllib_unloaddatabase,
  mysqllib_is_initialised,
  mysqllib_getschemaversion,
  mysqllib_begin,
  mysqllib_end,
  mysqllib_rollback,
  mysqllib_getport_uniqueid,
  mysqllib_getsensor_uniqueid,
  mysqllib_getioport_state,
  mysqllib_getsensor_sampleratecurrent,
  mysqllib_update_ioports_state,
  mysqllib_insert_sensor_datafloat_value,
  mysqllib_insert_sensor_databigint_value,
  mysqllib_insert_sensor_dataint_value,
  mysqllib_insert_sensor_datatinyint_value,
  mysqllib_getsensor_datafloat_value,
  mysqllib_getsensor_databigint_value,
  mysqllib_getsensor_dataint_value,
  mysqllib_getsensor_datatinyint_value,
  mysqllib_update_sensor_datafloat_value,
  mysqllib_update_sensor_databigint_value,
  mysqllib_update_sensor_dataint_value,
  mysqllib_update_sensor_datatinyint_value,
  mysqllib_getcommpk,
  mysqllib_getlinkpk,
  mysqllib_getlinkcommpk,
  mysqllib_freeuniqueid
};

static moduleiface_ver_1_t thislib_ifaces[]={
  {
    &thislib_ifaceptrs_ver_1,
    MYSQLLIBINTERFACE_VER_1
  },
  {
    nullptr, 0
  }
};

//NOTE: This array size needs to be kept in sync with the definition in mysqllib.h
moduledep_ver_1_t mysqllib_deps[]={
  {
    "debuglib",
		nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

moduleinfo_ver_1_t mysqllib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "mysqllib",
  mysqllib_init,
  mysqllib_shutdown,
	nullptr,
	nullptr,
	nullptr,
	nullptr,
  (moduleiface_ver_1_t (* const)[]) &thislib_ifaces,
  (moduledep_ver_1_t (*)[]) &mysqllib_deps
};

#ifdef __ANDROID__
static int JNIAttachThread(JNIEnv*& env, int& wasdetached) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=JNI_OK;

  result=mysqllib_gJavaVM->GetEnv((void**) &env, JNI_VERSION_1_6);
  if (result==JNI_EDETACHED) {
    wasdetached=1;
    result=mysqllib_gJavaVM->AttachCurrentThread(&env, NULL);
    if (result!=JNI_OK) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s, Failed to attach to java\n", __func__);
      return result;
    }
  } else if (result!=JNI_OK) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Failed to attach get java environment\n", __func__);
    return result;
  }
  return result;
}
#endif
static int JNIDetachThread(int& wasdetached) {
  int result;

#ifdef __ANDROID__
  result=JNI_OK;
  if (wasdetached) {
    result=mysqllib_gJavaVM->DetachCurrentThread();
    wasdetached=0;
  }
#else
  //Always return okay if not using android
  result=0;
#endif
  return result;
}

/*
  Initialise the mysql database library
  Returns 0 for success or other value on error
  NOTE: No other threads should use this library until this function is called
*/
int mysqllib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID init_methodid;
#endif
  int result, wasdetached=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__, mysqllib_init);
  ++libinuse;
  if (libinuse>1) {
    //Already started
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, libinuse);
    return 0;
  }
  dbloaded=0;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  init_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "init", "()I");
  result=env->CallStaticIntMethod(mysqllib_mysql_class, init_methodid);
  JNIDetachThread(wasdetached);
#endif
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&thislibmutex, &errorcheckmutexattr);
  pthread_mutex_init(&thislibmutex_singleaccess_mutex, &errorcheckmutexattr);
  pthread_mutex_init(&thislib_transaction_mutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Shutdown the mysql database library
*/
void mysqllib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID shutdown_methodid;
#endif
  int wasdetached=0;

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
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  shutdown_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "shutdown", "()V");
  env->CallStaticVoidMethod(mysqllib_mysql_class, shutdown_methodid);
  JNIDetachThread(wasdetached);
#endif

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&thislibmutex);
  pthread_mutex_destroy(&thislibmutex_singleaccess_mutex);
  pthread_mutex_destroy(&thislib_transaction_mutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Open the database: dbname
  This should only be called by a start function or after not by an init function
  Args: hostname The hostname of the database to load
        dbname The database name of the database to load
        username The database username or NULL if not needed
        password The database password or NULL if not needed
*/
//NOTE: We don't need to apply single access lock as that is only needed while dbloaded=1
int mysqllib_loaddatabase(const char *hostname, const char *dbname, const char *username, const char *password) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID loaddatabase_methodid, prepareStmt_methodid;
  jstring jtmpstr=NULL, jhostnamestr=NULL, jdbnamestr=NULL, jusernamestr=NULL, jpasswordstr=NULL;
#endif
  int result, wasdetached=0, i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  PTHREAD_LOCK(&thislibmutex);
#ifdef __ANDROID__
  if (dbloaded) {
    //Database already loaded
    PTHREAD_UNLOCK(&thislibmutex);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, database file already loaded\n", __func__);
    return 0;
  }
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  loaddatabase_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "loaddatabase", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)I");

  jhostnamestr=env->NewStringUTF(hostname);
  jdbnamestr=env->NewStringUTF(dbname);
  jusernamestr=env->NewStringUTF(username);
  jpasswordstr=env->NewStringUTF(password);

  result=env->CallStaticIntMethod(mysqllib_mysql_class, loaddatabase_methodid, jhostnamestr, jdbnamestr, jusernamestr, jpasswordstr);
  env->DeleteLocalRef(jhostnamestr);
  env->DeleteLocalRef(jdbnamestr);
  env->DeleteLocalRef(jusernamestr);
  env->DeleteLocalRef(jpasswordstr);
  if (!result) {
    PTHREAD_UNLOCK(&thislibmutex);
    JNIDetachThread(wasdetached);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, database hostname: %s failed to connect\n", __func__, hostname);
    return -2;
  }
  //Prepare the SQL statements
  dbschemaver=0;
  prepareStmt_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "prepareStmt", "(Ljava/lang/String;I)I");
  for (i=0; i<num_stmts; ++i) {
    //debuglibifaceptr->debuglib_printf(1, "%s: i=%d, stmt=%s", __func__, i, mysqllib_stmts[i]);
    jtmpstr=env->NewStringUTF(mysqllib_stmts[i]);
    result=env->CallStaticIntMethod(mysqllib_mysql_class, prepareStmt_methodid, jtmpstr, i);
    if (!result) {
      //Can't prepare the statement but continue to load since it might just be a query for an older or newer database
      debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to prepare SQL statement: \"%s\", result=%d\n", __func__, mysqllib_stmts[i], result);
    } else {
      //Detect schema version using the index to the prepare statement that worked
      switch (i) {
        case 0:
          dbschemaver=1;
          break;
      }
    }
  }
  JNIDetachThread(wasdetached);

  debuglibifaceptr->debuglib_printf(1, "%s: Detected db schema version: %d\n", __func__, dbschemaver);
  dbloaded=1;

  PTHREAD_UNLOCK(&thislibmutex);
#else
  if (dbloaded) {
    //Database already loaded
    PTHREAD_UNLOCK(&thislibmutex);

    debuglibifaceptr->debuglib_printf(1, "Exiting %s, database file already loaded\n", __func__);
    return 0;
  }
  if (!conn) {
    conn = mysql_init(nullptr);
  }
  //Connect to database
  if (!mysql_real_connect(conn, hostname,
         username, password, dbname, 0, nullptr, 0)) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, database hostname: %s failed to connect\n", __func__, hostname, mysql_error(conn));

    mysql_close(conn);
    conn=nullptr;
    PTHREAD_UNLOCK(&thislibmutex);
    return -2;
  }
  debuglibifaceptr->debuglib_printf(1, "%s, Successfully connected to MySQL database: %s at host: %s\n", __func__, dbname, hostname);

  //Prepare the SQL statements
  dbschemaver=0;

  for (i=0; i<num_stmts; ++i) {
    preparedstmt[i]=mysql_stmt_init(conn);
    if (!preparedstmt[i]) {
      debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to prepare SQL statement: \"%s\", result=Out of Memory\n", __func__, mysqllib_stmts[i]);
      continue;
    }
    result=mysql_stmt_prepare(preparedstmt[i], mysqllib_stmts[i], strlen(mysqllib_stmts[i]));
    if (result) {
      //Can't prepare the statement but continue to load since it might just be a query for an older or newer database
      debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to prepare SQL statement: \"%s\", result=%s\n", __func__, mysqllib_stmts[i], mysql_error(conn));
      mysql_stmt_close(preparedstmt[i]);
      preparedstmt[i]=nullptr;
    } else {
      //Detect schema version using the index to the prepare statement that worked
      switch (i) {
        case 0:
          dbschemaver=1;
          break;
      }
    }
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Detected db schema version: %d\n", __func__, dbschemaver);
  dbloaded=1;

#endif
  PTHREAD_UNLOCK(&thislibmutex);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Unload the database file
*/
int mysqllib_unloaddatabase(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID unloaddatabase_methodid, unprepareStmt_methodid;
#endif
  int i, result, wasdetached=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return 0;
  }
  unprepareStmt_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "unprepareStmt", "(I)I");
  unloaddatabase_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "unloaddatabase", "()I");
#endif
  PTHREAD_LOCK(&thislibmutex);
  if (dbloaded) {
    //Make sure no other single access functions are using the database while we shutdown
    PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    //Unload prepared SQL statements
    for (i=0; i<num_stmts; ++i) {
      //debuglibifaceptr->debuglib_printf(1, "%s: i=%d, stmt=%s", __func__, i, ultralitelib_stmts[i]);
      result=env->CallStaticIntMethod(mysqllib_mysql_class, unprepareStmt_methodid, i);
      if (!result) {
        //Can't unprepare the statements but continue to load since it might just be a query for an older or newer database
        debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to unload prepared statement: \"%s\", result=%s\n", __func__, mysqllib_stmts[i], result);
      }
    }
    result=env->CallStaticIntMethod(mysqllib_mysql_class, unloaddatabase_methodid);
    if (!result) {
      debuglibifaceptr->debuglib_printf(1, "%s, Failed to unload database\n", __func__);
    }
#else
    //Unload prepared SQL statements
    for (i=0; i<num_stmts; ++i) {
      if (preparedstmt[i]) {
        result=mysql_stmt_close(preparedstmt[i]);
        if (result) {
          //Can't unprepare the statements but continue to unload since it might just be a query for an older or newer database
          debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to unload prepared statement: \"%s\", result=\n", __func__, mysqllib_stmts[i], mysql_error(conn));
        }
        preparedstmt[i]=nullptr;
      }
    }
    //Close the connection
    mysql_close(conn);
    conn=nullptr;
#endif
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    dbloaded=0;
  }
  dbschemaver=0;
  PTHREAD_UNLOCK(&thislibmutex);
#ifdef __ANDROID__
  JNIDetachThread(wasdetached);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Return 1 if the database is currently initialised and loaded or 0 if not
*/
int mysqllib_is_initialised() {
  int result;

  PTHREAD_LOCK(&thislibmutex);
  if (!dbloaded) {
    result=0;
  } else {
    result=1;
  }
  PTHREAD_UNLOCK(&thislibmutex);

  return result;
}

/*
  Returns the current version of the database schema or 0 if unknown
  Currently we support 3 different versions of the schema
*/
int mysqllib_getschemaversion(void) {
  int result;

  PTHREAD_LOCK(&thislibmutex);
  result=dbschemaver;
  PTHREAD_UNLOCK(&thislibmutex);

  return result;
}

/*
  Begin a transaction
  Returns 0 on success or negative value on error
*/
int mysqllib_begin(void) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID begin_methodid;
#endif
  int locdbloaded, result=0, wasdetached=0;

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
  //Wait for any previous transactions to finish then start the transaction lock
  PTHREAD_LOCK(&thislib_transaction_mutex);
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
  begin_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "begin", "()I");

  result=env->CallStaticIntMethod(mysqllib_mysql_class, begin_methodid);
  JNIDetachThread(wasdetached);

  if (result!=0) {
    PTHREAD_UNLOCK(&thislib_transaction_mutex);
  }
#else
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  //Disable auto commit
  result=mysql_autocommit(conn, 0);
  if (result!=0) {
    PTHREAD_UNLOCK(&thislib_transaction_mutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to disable auto commit to begin a transaction, result=%s\n", __func__, mysql_error(conn));
    result=-2;
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Beginning transaction success\n", __func__);
  }
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);

  return result;
}

/*
  End a transaction
  Returns 0 on success or other value on error
*/
int mysqllib_end(void) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID end_methodid;
#endif
  int locdbloaded, result=0, wasdetached=0;

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
  end_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "end", "()I");

  result=env->CallStaticIntMethod(mysqllib_mysql_class, end_methodid);

  if (result==0) {
    //Transaction is complete
    PTHREAD_UNLOCK(&thislib_transaction_mutex);
  }
  JNIDetachThread(wasdetached);
#else
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  result=mysql_commit(conn);
  if (result==0) {
    //Transaction is complete
    PTHREAD_UNLOCK(&thislib_transaction_mutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Ending transaction success\n", __func__);
    //Re-enable auto commit
    int result2=mysql_autocommit(conn, 1);
    if (result2!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to re-eanble auto commit after ending a transaction, result=%s\n", __func__, mysql_error(conn));
    }
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to end, result=%s\n", __func__, mysql_error(conn));
    result=-2;
  }
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);

  return result;
}

/*
  Rollback a transaction
  Returns 0 on success or other value on error
*/
int mysqllib_rollback(void) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID rollback_methodid;
#endif
  int locdbloaded, result=0, wasdetached=0;

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    return -1;
  }
  rollback_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "rollback", "()I");

  result=env->CallStaticIntMethod(mysqllib_mysql_class, rollback_methodid);

  //Always release the transaction mutex here as this is currently the last resort for the transaction operation
  PTHREAD_UNLOCK(&thislib_transaction_mutex);
  JNIDetachThread(wasdetached);
#else
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  result=mysql_rollback(conn);
  if (result!=0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to rollback, result=%s\n", __func__, mysql_error(conn));
    result=-2;
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Rolling back transaction success\n", __func__);
  }
  //Always release the transaction mutex here as this is currently the last resort for the transaction operation
  PTHREAD_UNLOCK(&thislib_transaction_mutex);

  //Re-enable auto commit
  int result2=mysql_autocommit(conn, 1);
  if (result2!=0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Warning: Failed to re-eanble auto commit after rolling back a transaction, result=%s\n", __func__, mysql_error(conn));
  }
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);

  return result;
}

/*
  Returns a pointer to a structure that is unique to the database for a port
    or returns null on error or if the port doesn't exist
  Args: addr and portid
*/
void *mysqllib_getport_uniqueid(uint64_t addr, int portid) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getPortUniqueId_methodid;
  jstring jtmpstr;
#endif

  mysqllib_uniqueid_t *uniqueid;
  int locdbloaded, wasdetached=0;
  char thisaddr[17];
  int64_t thisvalue;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return NULL;
  }
  getPortUniqueId_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getPortUniqueId", "(Ljava/lang/String;I)J");
#endif
  sprintf(thisaddr, "%016llX", (unsigned long long) addr);

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return NULL;
  }
#ifdef __ANDROID__
  jtmpstr=env->NewStringUTF(thisaddr);
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, getPortUniqueId_methodid, jtmpstr, portid);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  env->DeleteLocalRef(jtmpstr);
  JNIDetachThread(wasdetached);
#endif
  if (thisvalue>=0) {
    uniqueid=(mysqllib_uniqueid_t *) calloc(1, sizeof(mysqllib_uniqueid_t));
    if (!uniqueid) {
      return NULL;
    }
    //NOTE: iotechtype isn't used at the moment
    uniqueid->pk64=thisvalue;
    uniqueid->serial=addr;
    uniqueid->hwid=portid;

    return uniqueid;
  }
  return NULL;
}

/*
  Returns a pointer to a structure that is unique to the database for a sensor
    or returns null on error or if the port doesn't exist
  Args: addr and portid
*/
void *mysqllib_getsensor_uniqueid(uint64_t addr, int portid, const char *sensor_name) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getSensorUniqueId_methodid;
  jstring jtmpstr, jtmpstr2;
#endif

  mysqllib_uniqueid_t *uniqueid;
  int locdbloaded, wasdetached=0;
  char thisaddr[17];
  int64_t thisvalue;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return NULL;
  }
  getSensorUniqueId_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getSensorUniqueId", "(Ljava/lang/String;ILjava/lang/String;)J");
#endif
  sprintf(thisaddr, "%016llX", (unsigned long long) addr);

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return NULL;
  }
#ifdef __ANDROID__
  jtmpstr=env->NewStringUTF(thisaddr);
  jtmpstr2=env->NewStringUTF(sensor_name);
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, getSensorUniqueId_methodid, jtmpstr, portid, jtmpstr2);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  env->DeleteLocalRef(jtmpstr);
  env->DeleteLocalRef(jtmpstr2);
  JNIDetachThread(wasdetached);
#endif
  if (thisvalue>=0) {
    uniqueid=(mysqllib_uniqueid_t *) calloc(1, sizeof(mysqllib_uniqueid_t));
    if (!uniqueid) {
      return NULL;
    }
    //NOTE: iotechtype isn't used anymore at the moment
    //We store sensorpk value in ioportspk
    uniqueid->pk64=thisvalue;
    uniqueid->serial=addr;
    uniqueid->hwid=portid;

    return uniqueid;
  }
  return NULL;
}

/*
  Retrieve the state field for an io port synced from the remote server's database
  Returns 0 for success or negative value on error
  The state field is returned via the pointer
*/
int mysqllib_getioport_state(const void *uniqueid, int32_t *state) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getIOPorts_State_methodid;
#endif
  int locdbloaded, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  int32_t thisvalue=0;

  if (!thisuniqueid) {
    return -4;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  getIOPorts_State_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getIOPortState", "(J)I");
#endif

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -1;
  }
#ifdef __ANDROID__
  thisvalue=env->CallStaticIntMethod(mysqllib_mysql_class, getIOPorts_State_methodid, thisuniqueid->pk64);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  JNIDetachThread(wasdetached);
#endif

  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *state=thisvalue;
  }
  return 0;
}

/*
  Retrieve the current sample rate for a sensor synced from the remote server's database
  Returns 0 for success or negative value on error
  The sample rate is returned via the pointer
*/
int mysqllib_getsensor_sampleratecurrent(const void *uniqueid, double *sampleratecurrent) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getSensor_SampleRateCurrent_methodid;
#endif
  int locdbloaded, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  double thisvalue=0;

  if (!thisuniqueid) {
    return -4;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  getSensor_SampleRateCurrent_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getSensorSampleRateCurrent", "(J)D");
#endif

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -1;
  }
#ifdef __ANDROID__
  thisvalue=env->CallStaticDoubleMethod(mysqllib_mysql_class, getSensor_SampleRateCurrent_methodid, thisuniqueid->pk64);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  JNIDetachThread(wasdetached);
#endif

  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *sampleratecurrent=thisvalue;
  }
  return 0;
}

/*
  Update the state field for an io port
  Returns 0 on success or negative value on error
*/
int mysqllib_update_ioports_state(const void *uniqueid, int32_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID update_IOPorts_State_methodid;
#endif
  int locdbloaded, result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

  if (!thisuniqueid) {
    return -4;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  update_IOPorts_State_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "updateIOPortsState", "(JI)I");
  if (!update_IOPorts_State_methodid) {
    JNIDetachThread(wasdetached);
    return -4;
  }
#endif
  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -1;
  }
#ifdef __ANDROID__
  result=env->CallStaticIntMethod(mysqllib_mysql_class, update_IOPorts_State_methodid, thisuniqueid->pk64, value);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

//Code shared among all the mysqllib insert, get, and update sensor_value functions
//Returns 0 on success or negative value on error
#ifdef __ANDROID__
static int mysqllib_sensor_value_pre(JNIEnv*& env, int& wasdetached, const void *uniqueid, jmethodID& methodid, const char *javafunc, const char *javaargs) {
  int locdbloaded;

  if (!uniqueid) {
    return -4;
  }
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  methodid=env->GetStaticMethodID(mysqllib_mysql_class, javafunc, javaargs);
  if (!methodid) {
    JNIDetachThread(wasdetached);
    return -4;
  }
  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
    JNIDetachThread(wasdetached);
    return -1;
  }
  return 0;
}
#endif

/*
  Insert a single double into the database for a sensor to the DATAFLOAT table
  Returns 0 on success or negative value on error
*/
int mysqllib_insert_sensor_datafloat_value(const void *uniqueid, int64_t date, double value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "insertSensorDataFloatValue", "(JJD)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Insert a single int64 into the database for a sensor to the DATABIGINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_insert_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "insertSensorDataBigIntValue", "(JJJ)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Insert a single int32 into the database for a sensor to the DATAINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_insert_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "insertSensorDataIntValue", "(JJI)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Insert a single uint8 into the database for a sensor to the DATATINYINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_insert_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "insertSensorDataTinyIntValue", "(JJI)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Retrieve a the most recent value for a sensor from the DATAFLOAT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int mysqllib_getsensor_datafloat_value(const void *uniqueid, double *value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  double thisvalue=0;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "getSensorDataFloatValue", "(J)D");
  if (result!=0) {
    return result;
  }
  thisvalue=env->CallStaticDoubleMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *value=thisvalue;
  }
  return 0;
}

/*
  Retrieve a the most recent value for a sensor from the DATABIGINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int mysqllib_getsensor_databigint_value(const void *uniqueid, int64_t *value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  int64_t thisvalue=0;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "getSensorDataBigIntValue", "(J)J");
  if (result!=0) {
    return result;
  }
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *value=thisvalue;
  }
  return 0;
}

/*
  Retrieve a the most recent value for a sensor from the DATAINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int mysqllib_getsensor_dataint_value(const void *uniqueid, int32_t *value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  int32_t thisvalue=0;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "getSensorDataIntValue", "(J)I");
  if (result!=0) {
    return result;
  }
  thisvalue=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *value=thisvalue;
  }
  return 0;
}

/*
  Retrieve a the most recent value for a sensor from the DATATINYINT table
  Returns 0 for success or negative value on error
  The value is returned via the pointer
*/
int mysqllib_getsensor_datatinyint_value(const void *uniqueid, uint8_t *value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;
  int32_t thisvalue=0;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "getSensorDataTinyIntValue", "(J)I");
  if (result!=0) {
    return result;
  }
  thisvalue=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  //TODO: Implement dedicated getter function so we can separate the result from the value
  if (thisvalue<0) {
    //An error was returned
    return thisvalue;
  } else {
    *value=thisvalue;
  }
  return 0;
}

/*
  Update a single double in the database for a sensor to the DATAFLOAT table
  Returns 0 on success or negative value on error
*/
int mysqllib_update_sensor_datafloat_value(const void *uniqueid, int64_t date, double value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "updateSensorDataFloatValue", "(JJD)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Update a single int64 in the database for a sensor to the DATABIGINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_update_sensor_databigint_value(const void *uniqueid, int64_t date, int64_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "updateSensorDataFloatValue", "(JJD)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Update a single int32 in the database for a sensor to the DATAINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_update_sensor_dataint_value(const void *uniqueid, int64_t date, int32_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "updateSensorDataIntValue", "(JJI)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Update a single uint8 in the database for a sensor to the DATATINYINT table
  Returns 0 on success or negative value on error
*/
int mysqllib_update_sensor_datatinyint_value(const void *uniqueid, int64_t date, uint8_t value) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
#endif
  int result, wasdetached=0;
  const mysqllib_uniqueid_t *thisuniqueid=(mysqllib_uniqueid_t *) uniqueid;

#ifdef __ANDROID__
  result=mysqllib_sensor_value_pre(env, wasdetached, thisuniqueid, methodid, "updateSensorDataTinyIntValue", "(JJI)I");
  if (result!=0) {
    return result;
  }
  result=env->CallStaticIntMethod(mysqllib_mysql_class, methodid, thisuniqueid->pk64, date, value);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  JNIDetachThread(wasdetached);
#endif
  if (result==0) {
    return 0;
  }
  return -1;
}

/*
  Get pk of a comm
  Args: comm addr, commpk
  On success, 64-bit comm pk will be set, and 0 will be returned
  Returns -1 if comm doesn't exist, < -1 on another error
*/
int mysqllib_getcommpk(uint64_t addr, int64_t *commpk) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getCommPK_methodid;
  jstring jtmpstr;
#endif

  int locdbloaded, wasdetached=0;
  char thisaddr[17];
  int64_t thisvalue=-2;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  getCommPK_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getCommPK", "(Ljava/lang/String;)J");
#endif
  sprintf(thisaddr, "%016" PRIX64, addr);

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -3;
  }
#ifdef __ANDROID__
  jtmpstr=env->NewStringUTF(thisaddr);
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, getCommPK_methodid, jtmpstr);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  env->DeleteLocalRef(jtmpstr);
  JNIDetachThread(wasdetached);
#else
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  MYSQL_STMT *stmt=preparedstmt[MYSQLLIB_GETCOMMPK];
  if (stmt) {
    int result;
    size_t commpklen;
    my_bool is_null=0;
    my_bool error=0;
    MYSQL_BIND bind[1];

    memset(bind, 0, sizeof(bind));
    commpklen=strlen(thisaddr);

    bind[0].buffer=thisaddr;
    bind[0].buffer_type=MYSQL_TYPE_STRING;
    bind[0].buffer_length=commpklen+1;
    bind[0].is_null=&is_null;
    bind[0].length=&commpklen;
    bind[0].error=&error;
    result=mysql_stmt_bind_param(stmt, bind);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to bind parameters for Get Comm PK SQL Statement: %s\n", __func__, mysql_stmt_error(stmt));
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //Configure binding for result
    long long longint_data;
    unsigned long result_length[1];
    my_bool result_is_null[1];
    my_bool result_error[1];

    memset(bind, 0, sizeof(bind));

    bind[0].buffer_type= MYSQL_TYPE_LONGLONG;
    bind[0].buffer= (char *)&longint_data;
    bind[0].is_null= &result_is_null[0];
    bind[0].length= &result_length[0];
    bind[0].error= &result_error[0];

    //Bind the result buffers
    if (mysql_stmt_bind_result(stmt, bind)) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to bind result for Get Comm PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //NOTE: If result buffers are already bound, execute will use them so execute needs to be called
    //  after binding the result buffers
    result=mysql_stmt_execute(stmt);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to execute Get Comm PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //Fetch the first row
    result=mysql_stmt_fetch(stmt);
    if (result==MYSQL_NO_DATA) {
      //PK doesn't exist
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -1;
    }
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to fetch result for Get Comm PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    thisvalue=longint_data;

    if (mysql_stmt_free_result(stmt)!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to free resources for Get Comm PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
  }
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#endif
  if (thisvalue>=0) {
		*commpk=thisvalue;

    return 0;
  }
  return thisvalue;
}

/*
  Get pk of a link
  Args: link addr, linkpk
  On success, 64-bit link pk will be set, and 0 will be returned
  Returns -1 if link doesn't exist, < -1 on another error
*/
int mysqllib_getlinkpk(uint64_t addr, int64_t *linkpk) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getLinkPK_methodid;
  jstring jtmpstr;
#endif

  int locdbloaded, wasdetached=0;
  char thisaddr[17];
  int64_t thisvalue;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  getLinkPK_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getLinkPK", "(Ljava/lang/String;)J");
#endif
  sprintf(thisaddr, "%016" PRIX64, addr);

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -3;
  }
#ifdef __ANDROID__
  jtmpstr=env->NewStringUTF(thisaddr);
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, getLinkPK_methodid, jtmpstr);
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
  env->DeleteLocalRef(jtmpstr);
  JNIDetachThread(wasdetached);
#else
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) mysqllib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  MYSQL_STMT *stmt=preparedstmt[MYSQLLIB_GETLINKPK];
  if (stmt) {
    int result;
    size_t linkpklen;
    my_bool is_null=0;
    my_bool error=0;
    MYSQL_BIND bind[1];

    memset(bind, 0, sizeof(bind));
    linkpklen=strlen(thisaddr);

    bind[0].buffer=thisaddr;
    bind[0].buffer_type=MYSQL_TYPE_STRING;
    bind[0].buffer_length=linkpklen+1;
    bind[0].is_null=&is_null;
    bind[0].length=&linkpklen;
    bind[0].error=&error;
    result=mysql_stmt_bind_param(stmt, bind);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to bind parameters for Get Link PK SQL Statement: %s\n", __func__, mysql_stmt_error(stmt));
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //Configure binding for result
    long long longint_data;
    unsigned long result_length[1];
    my_bool result_is_null[1];
    my_bool result_error[1];

    memset(bind, 0, sizeof(bind));

    bind[0].buffer_type= MYSQL_TYPE_LONGLONG;
    bind[0].buffer= (char *)&longint_data;
    bind[0].is_null= &result_is_null[0];
    bind[0].length= &result_length[0];
    bind[0].error= &result_error[0];

    //Bind the result buffers
    if (mysql_stmt_bind_result(stmt, bind)) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to bind result for Get Link PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //NOTE: If result buffers are already bound, execute will use them so execute needs to be called
    //  after binding the result buffers
    result=mysql_stmt_execute(stmt);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to execute Get Comm PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    //Fetch the first row
    result=mysql_stmt_fetch(stmt);
    if (result==MYSQL_NO_DATA) {
      //PK doesn't exist
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -1;
    }
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to fetch result for Get Link PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      mysql_stmt_free_result(stmt);
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
    thisvalue=longint_data;

    if (mysql_stmt_free_result(stmt)!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to free resources for Get Link PK SQL Query: %s\n", __func__, mysql_stmt_error(stmt));
      PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
      return -4;
    }
  }
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#endif
  if (thisvalue>=0) {
		*linkpk=thisvalue;

    return 0;
  }
  return thisvalue;
}

/*
  Get comm pk associated with a link
  Args: link addr, commpk
  On success, 64-bit comm pk will be set, and 0 will be returned
  Returns -1 if link doesn't exist, < -1 on another error
*/
int mysqllib_getlinkcommpk(uint64_t addr, int64_t *commpk) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID getLinkCommPK_methodid;
  jstring jtmpstr;
#endif

  int locdbloaded, wasdetached=0;
  char thisaddr[17];
  int64_t thisvalue;

#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -2;
  }
  getLinkCommPK_methodid=env->GetStaticMethodID(mysqllib_mysql_class, "getLinkCommPK", "(Ljava/lang/String;)J");
#endif
  sprintf(thisaddr, "%016" PRIX64, addr);

  //Lock for database access before checking if database is loaded so we guarantee that the database will stay loaded
  PTHREAD_LOCK(&thislibmutex_singleaccess_mutex);
  PTHREAD_LOCK(&thislibmutex);
  locdbloaded=dbloaded;
  PTHREAD_UNLOCK(&thislibmutex);
  if (!locdbloaded) {
    PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
    JNIDetachThread(wasdetached);
#endif
    return -3;
  }
#ifdef __ANDROID__
  jtmpstr=env->NewStringUTF(thisaddr);
  thisvalue=env->CallStaticLongMethod(mysqllib_mysql_class, getLinkCommPK_methodid, jtmpstr);
#endif
  PTHREAD_UNLOCK(&thislibmutex_singleaccess_mutex);
#ifdef __ANDROID__
  env->DeleteLocalRef(jtmpstr);
  JNIDetachThread(wasdetached);
#endif
  if (thisvalue>=0) {
		*commpk=thisvalue;

    return 0;
  }
  return thisvalue;
}

//Free a unique id from memory if memory was allocated for it
void mysqllib_freeuniqueid(void *uniqueid) {
  if (uniqueid) {
    free(uniqueid);
  }
}

moduleinfo_ver_generic_t *mysqllib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &mysqllib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_MysqlLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) mysqllib_getmoduleinfo());
}

jint JNI_OnLoad(JavaVM* vm, void* UNUSED(reserved)) {
  JNIEnv *env;
  jclass aclass;

  mysqllib_gJavaVM=vm;
  mysqllib_gJavaVM->GetEnv((void * *) &env, JNI_VERSION_1_6);
  aclass=env->FindClass("com/capsicumcorp/iomy/libraries/watchinputs/MysqlLib");
  mysqllib_mysql_class=(jclass) env->NewGlobalRef(aclass);
  env->DeleteLocalRef(aclass);

  return JNI_VERSION_1_6; 
}

void JNI_OnUnload(JavaVM* UNUSED(vm), void* UNUSED(reserved)) {
  JNIEnv *env;

  mysqllib_gJavaVM->GetEnv((void * *) &env, JNI_VERSION_1_6);
  env->DeleteGlobalRef(mysqllib_mysql_class);
}

#endif
