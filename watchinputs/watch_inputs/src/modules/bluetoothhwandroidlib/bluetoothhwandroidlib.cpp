/*
Title: Bluetooth Hardware Android Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This module provides support for mysql database.
Copyright: Capsicum Corporation 2010-2017

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

//NOTE: Depends on Android to function
//NOTE2: Only connects to LE CSRMesh devices at the moment
//NOTE: Since we only send one message at a time, the queue message types are currently high level types
//  instead of low level to reduce coding time.  In the future this should be reworking to be more low level

//NOTE: Some versions of Android may be limited to 512 local references so we need to delete them fairly rapidly

//NOTE: CSRMesh can only pair one device at a time

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <ctype.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <semaphore.h>
#include <exception>
#include <stdexcept>
#include <list>
#include <map>
#include <sstream>
#include <string>
#include <vector>
#include <typeinfo>
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "bluetoothhwandroidlib.hpp"
#include "modules/debuglib/debuglib.h"
#include "modules/dbcounterlib/dbcounterlib.h"
#include "modules/webapiclientlib/webapiclientlib.hpp"
#include "modules/dblib/dblib.h"
#include "modules/commonlib/commonlib.h"

#ifdef DEBUG
#warning "BLUETOOTHHWANDROIDLIB_PTHREAD_LOCK and BLUETOOTHHWANDROIDLIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define BLUETOOTHHWANDROIDLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    thislib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    thislib_backtrace(); \
  } \
}

#define BLUETOOTHHWANDROIDLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    thislib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    thislib_backtrace(); \
  } \
}

#else

#define BLUETOOTHHWANDROIDLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define BLUETOOTHHWANDROIDLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#ifdef MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

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

namespace bluetoothhwandroidlib {

static const int CSRMESHDEVICEPOLLTIME=60;
static const int CSRMESHMAXDEVICETIMEOUTS=2; //Max allowed timeouts with no success responses for a device before marking as not connected

//CSRMesh Models
static const int CSRMESH_MODEL_POWER=19;
static const int CSRMESH_MODEL_LIGHT=20;

//TODO: Add requesting for vid, pid, and version so can identify devices that support SuperLightModelAPI
//  as it uses the same bit as standard LightModelAPI
static const int CSRMESH_DEVICETYPE_UNKNOWN=0;
static const int CSRMESH_DEVICETYPE_LIGHT_WITH_POWEROFF=1; //A light with RGB values and poweroff

typedef class genericattr genericattr_t;
typedef class onoffattr onoffattr_t;
typedef class dataintattr dataintattr_t;
class genericattr {
public:
  time_t invaltime=0; //The time that the attribute value was received from the device
  time_t outvaltime=0; //The time that the attribute value was sent to the device
  time_t indbvaltime=0; //The time that the attribute value was read from the in counter
  time_t outdbvaltime=0; //The time that the attribute value was sent to an out/update counter
  time_t invalchangedtime=0; //The last time that the received attribute value from the device was different from the previous value
  time_t indbvalchangedtime=0; //The last time that the incoming database value was different from the previous value

  int dbincounter=-1, dbupdatecounter=-1, dboutcounter=-1;

  std::string name; //Name of Attribute

  int dbfieldtype;
  std::string dbfieldname;
  long dbinfieldinitialinterval=-1;
  long dbinfieldinterval=-1;
  long dbupdatefieldinterval=-1;
  long dboutfieldinterval=-1;

  virtual ~genericattr();
};

class onoffattr : public genericattr {
public:
  int32_t prevval=0, val=0; //Updated each time a attribute value arrives from the device
  int32_t prevdbval=0, dbval=0; //Updated each time an in counter is read
};

class dataintattr : public genericattr {
public:
  int32_t prevval=0, val=0; //Updated each time a attribute value arrives from the device
  int32_t prevdbval=0, dbval=0; //Updated each time an in counter is read
};

//CSRMesh definitions
typedef class csrmeshdevice csrmeshdevice_t;
class csrmeshdevice {
public:
  std::string shortName=""; //The friendly name of the device
  std::string uuid=""; //This doesn't need to be saved
  int32_t uuidHash=0; //This is used for some commands
  int32_t deviceId=0; //This is used for some commands
  int64_t modelbitmap=0; //Indicates the supported csrmesh models
  bool needtopair=false; //True=This device is ready for pairing
  bool paired=false; //True=This device is fully paired, should have deviceId at this stage
  bool pairing=false; //True=This device is currently pairing
  bool havemodelbitmap=false; //True=We don't need to ask for model bitmap info
  int devicetype=CSRMESH_DEVICETYPE_UNKNOWN; //A number indicating the type of this device
  bool indb=false; //True=This device is in the database so dbcounters can be setup
  bool connected=true; //false=This device hasn't responded to requests for a while so marked as not connected
  time_t lastpolltime=0; //Time in seconds that the last device refresh was
  time_t lastpollresponsetime=0; //Time in seconds that the last device response from refresh was
  int numtimeouts=0; //Current number of timeouts with no success packets in between

  //Name of Attribute, attribute info
  std::map<std::string, genericattr_t *> attrs;

  ~csrmeshdevice();
};

uint64_t gBluetoothHostMacAddress=0;
std::string gCSKMeshNetworkKey=""; //Randomised network key used for CSRMesh encryption

//deviceId, csrmeshdevice_t
std::map<int32_t, csrmeshdevice_t> gcsrmeshdevices;

//uuidHash, csrmeshdevice_t
//Temporary storage for csrmesh devices that are pairing
std::map<int32_t, csrmeshdevice_t> gcsrmeshdevicesuuid;

bool csrmeshNetworKeySet=false;
bool csrmeshdiscoverymodeactive=false; //Set to true when csrmesh has full discovery mode enabled
bool csrmeshautopair=true; //Whether to enable auto pairing or not

//---------------------------------------

bool gbluetoothmacaddraddedtowebapi=false; //True=The bluetooth host mac address has been queued in the web api to add to the database
bool gcsrmeshaddedtowebapi=false; //True=The CSRMesh link info has been queued in the web api to add to the database

#ifdef DEBUG
static pthread_mutexattr_t gerrorcheckmutexattr;
static pthread_mutex_t gmutex;
#else
static pthread_mutex_t gmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int ginuse=0; //Only stop when ginuse = 0

static pthread_t gmainthread=0;
static sem_t gmainthreadsleepsem; //Used for main thread sleeping

#ifdef __ANDROID__
static JavaVM *gJavaVM;
static jclass gbluetoothhwandroidlib_class;
#endif

//Static Function Declarations

//Function Declarations
static void setneedtoquit(bool val);
static bool getneedtoquit(void);
static int start(void);
static void stop(void);
static int init(void);
static void shutdown(void);

//Module Interface Definitions
static const bluetoothhwandroidlib_ifaceptrs_ver_1_t gifaceptrs_ver_1={
  init,
  shutdown,
};

static moduleiface_ver_1_t gifaces[]={
  {
    &gifaceptrs_ver_1,
    BLUETOOTHHWANDROIDLIBINTERFACE_VER_1
  },
  {
    nullptr, 0
  }
};

//NOTE: This array size needs to be kept in sync with the definition in mysqllib.h
static moduledep_ver_1_t gdeps[]={
  {
    "debuglib",
		nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "dbcounterlib",
    nullptr,
    DBCOUNTERLIBINTERFACE_VER_1,
    1
  },
  {
    "webapiclientlib",
    nullptr,
    WEBAPICLIENTLIBINTERFACE_VER_1,
    1
  },
  {
    "dblib",
    nullptr,
    DBLIBINTERFACE_VER_1,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

moduleinfo_ver_1_t gmoduleinfo_ver_1={
  MODULEINFO_VER_1,
  "bluetoothhwandroidlib",
  init,
  shutdown,
  start,
  stop,
  nullptr,
  nullptr,
  (moduleiface_ver_1_t (* const)[]) &gifaces,
  (moduledep_ver_1_t (*)[]) &gdeps
};

//Find a pointer to module interface pointer
//Returns the pointer to the interface or NULL if not found
//NOTE: A little slower than referencing the array element directly, but less likely to cause a programming fault
//  due to rearranging depencencies
static const void *getmoduledepifaceptr(const char *modulename, unsigned ifacever) {
  int i=0;

  while (gdeps[i].modulename) {
    if (strcmp(gdeps[i].modulename, modulename)==0) {
      if (gdeps[i].ifacever==ifacever) {
        return gdeps[i].ifaceptr;
      }
    }
    ++i;
  }
  return NULL;
}

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static inline void thislib_backtrace(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
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
static inline void thislib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey=0;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey=0;

//Initialise a thread local store for the lock counter
static void makelockkey(void) {
  int result;

  result=pthread_key_create(&lockkey, NULL);
  if (result!=0) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
  } else {
    havelockkey=1;
  }
}

/*
  Apply the bluetooth hw android mutex lock if not already applied otherwise increment the lock count
*/
void lockbluetoothhwandroid(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    //Allocate storage for the lock counter and set to 0
    lockcnt=(long *) calloc(1, sizeof(long));
    (void) pthread_setspecific(lockkey, lockcnt);
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    BLUETOOTHHWANDROIDLIB_PTHREAD_LOCK(&gmutex);
  }
  //Increment the lock count
  ++(*lockcnt);
#ifdef LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the bluetooth hw android mutex lock
*/
void unlockbluetoothhwandroid(void) {
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    thislib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    BLUETOOTHHWANDROIDLIB_PTHREAD_UNLOCK(&gmutex);
  }
#ifdef LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=NULL;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

#ifdef __ANDROID__
static int JNIAttachThread(JNIEnv*& env, int& wasdetached) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result=JNI_OK;

  result=gJavaVM->GetEnv((void**) &env, JNI_VERSION_1_6);
  if (result==JNI_EDETACHED) {
    wasdetached=1;
    result=gJavaVM->AttachCurrentThread(&env, NULL);
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
    result=gJavaVM->DetachCurrentThread();
    wasdetached=0;
  }
#else
  //Always return okay if not using android
  result=0;
#endif
  return result;
}

genericattr::~genericattr() {
  const dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=reinterpret_cast<const dbcounterlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dbcounterlib", DBCOUNTERLIBINTERFACE_VER_1));

  if (this->dbincounter!=-1) {
    dbcounterlibifaceptr->scheduledeletecounter(this->dbincounter);
    this->dbincounter=-1;
  }
  if (this->dbupdatecounter!=-1) {
    dbcounterlibifaceptr->scheduledeletecounter(this->dbupdatecounter);
    this->dbupdatecounter=-1;
  }
  if (this->dboutcounter!=-1) {
    dbcounterlibifaceptr->scheduledeletecounter(this->dboutcounter);
    this->dboutcounter=-1;
  }
}

csrmeshdevice::~csrmeshdevice() {
  for (auto &attrsit : attrs) {
    delete attrsit.second;
  }
}

static const char alphanum[] =
"0123456789"
"!@#$%^&*"
"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
"abcdefghijklmnopqrstuvwxyz";

static int stringLength = sizeof(alphanum) - 1;

static char genRandom() {
  return alphanum[rand() % stringLength];
}

static std::string generateRandomString() {
  srand(time(0));
  std::string Str;
  for(unsigned int i = 0; i < 10; ++i)
  {
    Str += genRandom();
  }
  return Str;
}

//Set the network key for CSRMesh
static void setCSRMeshNetworkKey(std::string networkKey) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int wasdetached=0;
  jstring jnetworkKey;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Setting CSRMesh Network Key to \"%s\"\n", __func__, networkKey.c_str());
  gCSKMeshNetworkKey=networkKey;

  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "setCSRMeshNetworkKey", "(Ljava/lang/String;)V");
  jnetworkKey=env->NewStringUTF(networkKey.c_str());
  env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, jnetworkKey);
  env->DeleteLocalRef(jnetworkKey);
  JNIDetachThread(wasdetached);
#endif
}

//Set a random network key for CSRMesh
static void setCSRMeshNetworkKey() {
  std::string networkKey=generateRandomString();
  setCSRMeshNetworkKey(networkKey);
}

//Set the next device id for CSRMesh
static void setCSRMeshNextDeviceId(int32_t nextDeviceId) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int wasdetached=0;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Setting CSRMesh Next Device ID to %" PRId32 "\n", __func__, nextDeviceId);

  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "setCSRMeshNextDeviceId", "(I)V");
  env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, nextDeviceId);
  JNIDetachThread(wasdetached);
#endif
}

//Caller should check that the database is ready first
//Add the Bluetooth Host Mac address to the Database as a Comm via Web API
void addBluetoothHostMacAddressToDatabase(uint64_t addr) {
  const webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=reinterpret_cast<const webapiclientlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("webapiclientlib", WEBAPICLIENTLIBINTERFACE_VER_1));
  webapiclient_bluetoothcomm_t bluetoothcomm;

  bluetoothcomm.hubpk=0;
  bluetoothcomm.name="Bluetooth";
  bluetoothcomm.addr=addr;

  webapiclientlibifaceptr->add_bluetooth_comm_to_webapi_queue(bluetoothcomm);
}

//Caller should check that the database is ready first
//Add the CSRMesh to the Database as a Link via Web API using the Bluetooth Host address as the unique address
void addCSRMeshToDatabase(uint64_t addr, std::string CSKMeshNetworkKey) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=reinterpret_cast<const webapiclientlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("webapiclientlib", WEBAPICLIENTLIBINTERFACE_VER_1));
  webapiclient_csrmeshlink_t csrmeshlink;

  debuglibifaceptr->debuglib_printf(1, "%s: Adding CSRMesh with address: %016" PRIX64 " as a link with Network Key: \"%s\"\n", __func__, addr, CSKMeshNetworkKey.c_str());

  csrmeshlink.localpk=0;
  csrmeshlink.localaddr=addr;
  csrmeshlink.modelname="Qualcomm Blutooth CSRMesh";
  csrmeshlink.addr=addr;
  csrmeshlink.userstr="CSRMesh Bridge";
  csrmeshlink.networkKey=CSKMeshNetworkKey;

  webapiclientlibifaceptr->add_csrmesh_link_to_webapi_queue(csrmeshlink);
}

//Check if the database is connected and has a comm entry for the current bluetooth host device
bool databaseReadyBluetooth() {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const dblib_ifaceptrs_ver_1_t *dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int wasdetached=0, result=0;
  const char *bluetoothHostMacAddress;
  std::string bluetoothHostMacAddressStr, minbluetoothHostMacAddressStr;
  jstring jbluetoothHostMacAddress;

  if (!dblibifaceptr->is_initialised()) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Database not connected yet\n", __func__);
    return false;
  }
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return false;
  }
  //Get bluetooth host mac address
  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "getbluetoothHostMacAddress", "()Ljava/lang/String;");
  jbluetoothHostMacAddress=static_cast<jstring>(env->CallStaticObjectMethod(gbluetoothhwandroidlib_class, methodid));
  bluetoothHostMacAddress=env->GetStringUTFChars(jbluetoothHostMacAddress, NULL);
  bluetoothHostMacAddressStr=bluetoothHostMacAddress;
  env->ReleaseStringUTFChars(jbluetoothHostMacAddress, bluetoothHostMacAddress);
  JNIDetachThread(wasdetached);

  //Remove colons
  minbluetoothHostMacAddressStr=bluetoothHostMacAddressStr.substr(0, 2);
  minbluetoothHostMacAddressStr+=bluetoothHostMacAddressStr.substr(3, 2);
  minbluetoothHostMacAddressStr+=bluetoothHostMacAddressStr.substr(6, 2);
  minbluetoothHostMacAddressStr+=bluetoothHostMacAddressStr.substr(9, 2);
  minbluetoothHostMacAddressStr+=bluetoothHostMacAddressStr.substr(12, 2);
  minbluetoothHostMacAddressStr+=bluetoothHostMacAddressStr.substr(15, 2);

  debuglibifaceptr->debuglib_printf(1, "%s: Checking database for Comm with Bluetooth address: %s\n", __func__, minbluetoothHostMacAddressStr.c_str());

  result=dblibifaceptr->begin();
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
    return false;
  }
  //Check the database to see if the bluetooth host is added to a comm
  uint64_t addr=0;
  int64_t commpk=-1;
  bool haveCommPK=false;
  sscanf(minbluetoothHostMacAddressStr.c_str(), "%" SCNx64, &addr);
  result=dblibifaceptr->getcommpk(addr, &commpk);
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Found Comm PK: %" PRId64 " with address: %016" PRIX64 "\n", __func__, commpk, addr);
    haveCommPK=true;
  }
  result=dblibifaceptr->end();
  if (result<0) {
    dblibifaceptr->rollback();
  }
  if (haveCommPK) {
    lockbluetoothhwandroid();
    gBluetoothHostMacAddress=addr;
    unlockbluetoothhwandroid();

    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Database is ready for Bluetooth\n", __func__);
    return true;
  } else if (!gbluetoothmacaddraddedtowebapi) {
    debuglibifaceptr->debuglib_printf(1, "%s: Comm with Bluetooth address: %016" PRIX64 " not found in database\n", __func__, addr);
    addBluetoothHostMacAddressToDatabase(addr);
    gbluetoothmacaddraddedtowebapi=true;
  }
  return false;
}

void loadCSRMeshInfoFromDatabase(void ) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const dblib_ifaceptrs_ver_1_t *dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));
  int result=0;
  uint64_t btaddr=0;

  lockbluetoothhwandroid();
  btaddr=gBluetoothHostMacAddress;
  unlockbluetoothhwandroid();

  result=dblibifaceptr->begin();
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
    return;
  }
  //Check the database to see if the CSRMesh link info has been added
  int64_t linkpk=-1;
  bool haveLinkPK=false;
  result=dblibifaceptr->getlinkpk(btaddr, &linkpk);
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Found CSRMesh PK: %" PRId64 " with address: %016" PRIX64 "\n", __func__, linkpk, btaddr);
    haveLinkPK=true;
  }
  if (haveLinkPK) {
    char *csrmeshusername=nullptr, *csrmeshpassword=nullptr;
    int getresult=-1;

    //Retrieve Network Key from database
    getresult=dblibifaceptr->getlinkusernamepassword(linkpk, &csrmeshusername, &csrmeshpassword);
    if (getresult==0) {
      if (csrmeshusername) {
        //Not needed
        free(csrmeshusername);
      }
      if (csrmeshpassword) {
        std::string networkKey=csrmeshpassword;
        free(csrmeshpassword);

        setCSRMeshNetworkKey(networkKey);
        csrmeshNetworKeySet=true;
        debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh Network Key from database: \"%s\"\n", __func__, gCSKMeshNetworkKey.c_str());
      }
    }
    //Retrieve CSRMesh devices from the Things list
    int numThings=0;
    std::int32_t *thingHwid;
    std::int32_t *thingOutputHwid;
    char **thingSerialCode;
    std::int32_t *thingType;
    char **thingName;
    int32_t nextDeviceId=-1;

    lockbluetoothhwandroid();
    numThings=dblibifaceptr->getThingInfo(linkpk, &thingHwid, &thingOutputHwid, &thingSerialCode, &thingType, &thingName);
    if (numThings>0) {
      for (int i=0; i<numThings; i++) {
        int32_t hash;

        debuglibifaceptr->debuglib_printf(1, "%s: Importing device from database with LinkPK=%" PRId64 ", index=%d, Hwid=%" PRId32", outputhwid=%" PRId32 ", type=%" PRId32 " serialcode=%s, name=%s\n", __func__, linkpk, i, thingHwid[i], thingOutputHwid[i], thingType[i], thingSerialCode[i], thingName[i]);
        if (thingHwid[i]>nextDeviceId) {
          nextDeviceId=thingHwid[i];
        }
        gcsrmeshdevices[ thingHwid[i] ].shortName=thingName[i];
        sscanf(thingSerialCode[i], "%" SCNd32, &hash);
        gcsrmeshdevices[ thingHwid[i] ].uuidHash=hash;
        gcsrmeshdevices[ thingHwid[i] ].deviceId=thingHwid[i];
        gcsrmeshdevices[ thingHwid[i] ].needtopair=false;
        gcsrmeshdevices[ thingHwid[i] ].paired=true;
        gcsrmeshdevices[ thingHwid[i] ].pairing=false;
        gcsrmeshdevices[ thingHwid[i] ].havemodelbitmap=false;

        //Leave device identification to live checking functions so they can set all the values properly
        gcsrmeshdevices[ thingHwid[i] ].devicetype=CSRMESH_DEVICETYPE_UNKNOWN;

        gcsrmeshdevices[ thingHwid[i] ].indb=true;
        gcsrmeshdevices[ thingHwid[i] ].connected=true;

        if (thingSerialCode[i]) {
          free(thingSerialCode[i]);
        }
        if (thingName[i]) {
          free(thingName[i]);
        }
      }
      free(thingHwid);
      free(thingOutputHwid);
      free(thingType);
      free(thingSerialCode);
      free(thingName);
    }
    if (nextDeviceId!=-1) {
      ++nextDeviceId;
      setCSRMeshNextDeviceId(nextDeviceId);
    }
    unlockbluetoothhwandroid();
  } else if (!gcsrmeshaddedtowebapi) {
    debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh with Bluetooth address: %016" PRIX64 " not found in database\n", __func__, btaddr);
    //Set a new randomised key and store in the database
    setCSRMeshNetworkKey();
    csrmeshNetworKeySet=true;

    addCSRMeshToDatabase(btaddr, gCSKMeshNetworkKey);
    gcsrmeshaddedtowebapi=true;
  }
  result=dblibifaceptr->end();
  if (result<0) {
    dblibifaceptr->rollback();
  }
}

//Start CSRMesh library which will also initialise Bluetooth
static int startCSRMesh(void) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int result=0, wasdetached=0;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "startCSRMesh", "()I");
  debuglibifaceptr->debuglib_printf(1, "%s: Starting CSRMesh\n", __func__);
  result=env->CallStaticIntMethod(gbluetoothhwandroidlib_class, methodid);
  JNIDetachThread(wasdetached);
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh has started\n", __func__);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh failed to start: %d\n", __func__, result);
  }
  return result;
#else
  return -1;
#endif
}

//Stop CSRMesh library
static int stopCSRMesh(void) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int result=0, wasdetached=0;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "stopCSRMesh", "()I");
  debuglibifaceptr->debuglib_printf(1, "%s: Stopping CSRMesh\n", __func__);
  result=env->CallStaticIntMethod(gbluetoothhwandroidlib_class, methodid);
  JNIDetachThread(wasdetached);
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh has stopped\n", __func__);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: CSRMesh failed to stop: %d\n", __func__, result);
  }
  return result;
#else
  return -1;
#endif
}

//Turn a device on or off
static void csrmeshSetDeviceOnOff(int32_t deviceId, bool state) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
  int result=0, wasdetached=0;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "csrMeshSetDeviceOnOff", "(II)V");
  if (state) {
    env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, deviceId, 1);
  } else {
    env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, deviceId, 0);
  }
  JNIDetachThread(wasdetached);
#endif
}

//Set the color of a device
static void csrmeshSetDeviceColor(int32_t deviceId, int32_t hue, int32_t saturation, int32_t brightness) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID methodid;
  int result=0, wasdetached=0;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "csrMeshSetDeviceColor", "(IIII)V");
  env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, deviceId, hue, saturation, brightness);
  JNIDetachThread(wasdetached);
#endif
}

#ifdef __ANDROID__
//Store info about a CSRMesh device that has appeared in pairing mode
static jint addcsrmeshdeviceforpairing(JNIEnv* env, jstring shortName, jint uuidHash) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int wasdetached=0;
  const char *lshortName;
  std::string shortNameStr;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  shortNameStr=lshortName=env->GetStringUTFChars(shortName, 0);
  env->ReleaseStringUTFChars(shortName, lshortName);
  JNIDetachThread(wasdetached);

  //Check if this device is already added
  lockbluetoothhwandroid();
  try {
    if (gcsrmeshdevicesuuid.at(uuidHash).uuidHash==uuidHash) {
      unlockbluetoothhwandroid();
      return 0;
    }
  } catch (std::out_of_range& e) {
    gcsrmeshdevicesuuid[uuidHash].shortName=shortNameStr;
    gcsrmeshdevicesuuid[uuidHash].uuidHash=uuidHash;
    gcsrmeshdevicesuuid[uuidHash].needtopair=true;
  }
  unlockbluetoothhwandroid();
  debuglibifaceptr->debuglib_printf(1, "%s: Found new device: %s with uuidHash: %08X\n", __func__, shortNameStr.c_str(), uuidHash);
  //Wakeup the main thread to start pairing process
  sem_post(&gmainthreadsleepsem);

  return 0;
}
#endif

static void csrmeshAddDeviceToDatabase(int32_t uuidHash, int32_t deviceId) {
  const webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=reinterpret_cast<const webapiclientlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("webapiclientlib", WEBAPICLIENTLIBINTERFACE_VER_1));
  webapiclient_csrmeshthing_t csrmeshthing;

  lockbluetoothhwandroid();

  if (gcsrmeshdevices[deviceId].devicetype==CSRMESH_DEVICETYPE_LIGHT_WITH_POWEROFF) {
    csrmeshthing.localaddr=gBluetoothHostMacAddress;
    csrmeshthing.type=19; //CSRMesh Light Bulb with On/Off
    csrmeshthing.state=1;
    csrmeshthing.hwid=deviceId;
    //csrmeshthing.name=gcsrmeshdevices[deviceId].shortName;
    //NOTE: PHP's json_decode can only interpret UTF-8 characters so use a generic string for now
    //  as some light bulbs have non-UTF-8 characters in the string
    csrmeshthing.name="CSRMesh Light";
    csrmeshthing.serialcode=uuidHash;
    {
      webapiclient_io io;

      //Hue
      io.rstype=3901;
      io.uom=1;
      io.iotype=2;
      io.samplerate=300;
      io.baseconvert=1;
      io.name="Hue";
      csrmeshthing.io.push_back(io);
    }
    {
      webapiclient_io io;

      //Saturation
      io.rstype=3902;
      io.uom=1;
      io.iotype=2;
      io.samplerate=300;
      io.baseconvert=1;
      io.name="Saturation";
      csrmeshthing.io.push_back(io);
    }
    {
      webapiclient_io io;

      //Brightness
      io.rstype=3903;
      io.uom=1;
      io.iotype=2;
      io.samplerate=300;
      io.baseconvert=1;
      io.name="Brightness";
      csrmeshthing.io.push_back(io);
    }
  } else {
    //Unknown device type
    unlockbluetoothhwandroid();
    return;
  }
  webapiclientlibifaceptr->add_csrmesh_thing_to_webapi_queue(csrmeshthing);
  gcsrmeshdevices[deviceId].indb=true;

  unlockbluetoothhwandroid();

}

static void csrmeshdevicepaired(jint uuidHash, jint deviceId) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  lockbluetoothhwandroid();
  try {
    if (gcsrmeshdevicesuuid.at(uuidHash).uuidHash==uuidHash) {
      //Do nothing
    }
  } catch (std::out_of_range& e) {
    //We just paired a device that hasn't been seen yet so add basic info
    gcsrmeshdevicesuuid[uuidHash].shortName="Unknown";
    gcsrmeshdevicesuuid[uuidHash].uuidHash=uuidHash;
  }
  gcsrmeshdevices[deviceId]=gcsrmeshdevicesuuid[uuidHash];
  gcsrmeshdevicesuuid.erase(uuidHash); //Remove temporary pairing entry

  gcsrmeshdevices[deviceId].deviceId=deviceId;
  gcsrmeshdevices[deviceId].pairing=false;
  gcsrmeshdevices[deviceId].paired=true;

  debuglibifaceptr->debuglib_printf(1, "%s: Device: %s associated with uuidHash: %08X and device Id: %08X\n", __func__, gcsrmeshdevices[deviceId].shortName.c_str(), uuidHash, deviceId);

  //Wakeup the main thread to poll the device for info
  sem_post(&gmainthreadsleepsem);

  unlockbluetoothhwandroid();
}

static void csrmeshCheckIfNeedToPairDevice() {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int wasdetached=0;

  lockbluetoothhwandroid();
  if (!csrmeshautopair) {
    //Auto pairing isn't enabled
    unlockbluetoothhwandroid();
    return;
  }
  //First check if we are already pairing a device
  for (auto const &gcsrmeshdeviceit : gcsrmeshdevicesuuid) {
    if (gcsrmeshdeviceit.second.pairing) {
      unlockbluetoothhwandroid();
      return;
    }
  }
  //Check if we need to pair a device
  for (auto &gcsrmeshdeviceit : gcsrmeshdevicesuuid) {
    if (gcsrmeshdeviceit.second.needtopair) {
      debuglibifaceptr->debuglib_printf(1, "%s: Pairing device: uuidHash: %08X\n", __func__, gcsrmeshdeviceit.second.uuidHash);
      if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
        unlockbluetoothhwandroid();
        return;
      }
      methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "CSRMeshAssociateDevice", "(I)V");
      env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, gcsrmeshdeviceit.second.uuidHash);
      JNIDetachThread(wasdetached);
      gcsrmeshdeviceit.second.needtopair=false;
      gcsrmeshdeviceit.second.pairing=true;
      break;
    }
  }
  unlockbluetoothhwandroid();
}

//Poll all devices for info and to see if connected
static void csrmeshPollDevices() {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec curtime;

  clock_gettime(CLOCK_REALTIME, &curtime);

  lockbluetoothhwandroid();
  for (auto &gcsrmeshdeviceit : gcsrmeshdevices) {
    if (curtime.tv_sec>gcsrmeshdeviceit.second.lastpolltime+CSRMESHDEVICEPOLLTIME) {
      debuglibifaceptr->debuglib_printf(1, "%s: Checking if device: deviceId: %08X, uuidHash: %08X is connected\n", __func__, gcsrmeshdeviceit.second.deviceId, gcsrmeshdeviceit.second.uuidHash);
      gcsrmeshdeviceit.second.lastpolltime=curtime.tv_sec;

      JNIEnv *env;
      int wasdetached=0;
      if (JNIAttachThread(env, wasdetached)==JNI_OK) {
        jmethodID methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "CSRMeshGetModelInfoLow", "(I)V");
        env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, gcsrmeshdeviceit.second.deviceId);
        JNIDetachThread(wasdetached);
      }
    }
  }
  unlockbluetoothhwandroid();
}

static void CSRMeshDeviceInfoModelLow(jint deviceId, jlong bitmap) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec curtime;

  clock_gettime(CLOCK_REALTIME, &curtime);

  lockbluetoothhwandroid();
  try {
    if (!gcsrmeshdevices.at(deviceId).havemodelbitmap && (gcsrmeshdevices.at(deviceId).modelbitmap & 0xFFFFFFFF)==0) {
      //Add low bitmap info
      gcsrmeshdevices[deviceId].modelbitmap|=(bitmap & 0xFFFFFFFF);
      gcsrmeshdevices[deviceId].havemodelbitmap=true;

      debuglibifaceptr->debuglib_printf(1, "%s: Received bitmap: %08X for deviceId: %08X\n", __func__, (int32_t) (bitmap & 0xFFFFFFFF), deviceId);

      //Wakeup the main thread to start handling the device
      sem_post(&gmainthreadsleepsem);
    }
    //Update poll response time
    gcsrmeshdevices[deviceId].lastpollresponsetime=curtime.tv_sec;
  } catch (std::out_of_range& e) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received bitmap: %08X for unknown deviceId: %08X\n", __func__, (int32_t) (bitmap & 0xFFFFFFFF), deviceId);
  }
  unlockbluetoothhwandroid();
}

//Identify the type of each device, add to database if necessary, and setup database counters
static void csrmeshSyncIdentifyDevices(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  lockbluetoothhwandroid();
  for (auto &gcsrmeshdeviceit : gcsrmeshdevices) {
    if (gcsrmeshdeviceit.second.havemodelbitmap==true) {
      //Can identify the device
      if (gcsrmeshdeviceit.second.devicetype==CSRMESH_DEVICETYPE_UNKNOWN) {
        int64_t bitmap;

        bitmap=gcsrmeshdeviceit.second.modelbitmap;
        if (((bitmap >> CSRMESH_MODEL_LIGHT) & 1)==1 && ((bitmap >> CSRMESH_MODEL_POWER) & 1)==1) {
          debuglibifaceptr->debuglib_printf(1, "%s: device: %08X, %s is a RGB Light with On/Off\n", __func__, gcsrmeshdeviceit.second.deviceId, gcsrmeshdeviceit.second.shortName.c_str());
          gcsrmeshdeviceit.second.devicetype=CSRMESH_DEVICETYPE_LIGHT_WITH_POWEROFF;

          //Setup attributes
          //TODO: Add support for retrieving current values from a CSRMesh device
          //TODO: Add flexible assignment operators similar to Zigbee so can reference attr val
          //  no matter what type it is
          gcsrmeshdeviceit.second.attrs["On/Off"]=new onoffattr_t();
          gcsrmeshdeviceit.second.attrs["On/Off"]->name="On/Off";
          gcsrmeshdeviceit.second.attrs["On/Off"]->dbfieldtype=DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE;
          gcsrmeshdeviceit.second.attrs["On/Off"]->dbfieldname="";
          gcsrmeshdeviceit.second.attrs["On/Off"]->dbinfieldinitialinterval=1;
          gcsrmeshdeviceit.second.attrs["On/Off"]->dbinfieldinterval=5;

          gcsrmeshdeviceit.second.attrs["Hue"]=new dataintattr_t();
          gcsrmeshdeviceit.second.attrs["Hue"]->name="Hue";
          gcsrmeshdeviceit.second.attrs["Hue"]->dbfieldtype=DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT;
          gcsrmeshdeviceit.second.attrs["Hue"]->dbfieldname="Hue";
          gcsrmeshdeviceit.second.attrs["Hue"]->dbinfieldinitialinterval=1;
          gcsrmeshdeviceit.second.attrs["Hue"]->dbinfieldinterval=5;

          gcsrmeshdeviceit.second.attrs["Saturation"]=new dataintattr_t();
          gcsrmeshdeviceit.second.attrs["Saturation"]->name="Saturation";
          gcsrmeshdeviceit.second.attrs["Saturation"]->dbfieldtype=DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT;
          gcsrmeshdeviceit.second.attrs["Saturation"]->dbfieldname="Saturation";
          gcsrmeshdeviceit.second.attrs["Saturation"]->dbinfieldinitialinterval=1;
          gcsrmeshdeviceit.second.attrs["Saturation"]->dbinfieldinterval=5;

          gcsrmeshdeviceit.second.attrs["Brightness"]=new dataintattr_t();
          gcsrmeshdeviceit.second.attrs["Brightness"]->name="Brightness";
          gcsrmeshdeviceit.second.attrs["Brightness"]->dbfieldtype=DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT;
          gcsrmeshdeviceit.second.attrs["Brightness"]->dbfieldname="Brightness";
          gcsrmeshdeviceit.second.attrs["Brightness"]->dbinfieldinitialinterval=1;
          gcsrmeshdeviceit.second.attrs["Brightness"]->dbinfieldinterval=5;
        }
      }
      if (gcsrmeshdeviceit.second.devicetype!=CSRMESH_DEVICETYPE_UNKNOWN) {
        if (!gcsrmeshdeviceit.second.indb) {
          //Add device as a thing to the database
          csrmeshAddDeviceToDatabase(gcsrmeshdeviceit.second.uuidHash, gcsrmeshdeviceit.second.deviceId);
        }
        if (gcsrmeshdeviceit.second.indb) {
          const dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=reinterpret_cast<const dbcounterlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dbcounterlib", DBCOUNTERLIBINTERFACE_VER_1));

          //Setup database counters
          for (auto &attrit : gcsrmeshdeviceit.second.attrs) {
            if (attrit.second->dbinfieldinitialinterval>0 && attrit.second->dbinfieldinterval && attrit.second->dbincounter==-1) {
              debuglibifaceptr->debuglib_printf(1, "%s: Setting up database counter for attribute: %s on device: %08" PRIX32 " with database field name: %s and db refresh interval: %d\n", __func__, attrit.first.c_str(), gcsrmeshdeviceit.second.deviceId, attrit.second->dbfieldname.c_str(), attrit.second->dbinfieldinterval);
              attrit.second->dbincounter=dbcounterlibifaceptr->new_1multival_incounter(gBluetoothHostMacAddress, gcsrmeshdeviceit.second.deviceId, attrit.second->dbfieldtype, attrit.second->dbfieldname.c_str(), attrit.second->dbinfieldinitialinterval, attrit.second->dbinfieldinterval);
            }
          }
        }
      }
    }
  }
  unlockbluetoothhwandroid();
}

//Synch devices info with info in database
static void csrmeshSyncDevicesWithDatabase(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=reinterpret_cast<const dbcounterlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dbcounterlib", DBCOUNTERLIBINTERFACE_VER_1));
  int result;
  struct timespec curtime;

  clock_gettime(CLOCK_REALTIME, &curtime);
  lockbluetoothhwandroid();
  for (auto &gcsrmeshdeviceit : gcsrmeshdevices) {
    bool updateColor=false;
    for (auto &attrit : gcsrmeshdeviceit.second.attrs) {
      struct timespec curtime;

      //Get the time for every attribute as it may take a while to iterate over all the attributes
      clock_gettime(CLOCK_REALTIME, &curtime);
      if (attrit.second->dbincounter>=0) {
        //Get value from database
        multitypeval_t tmpmultival;
        result=dbcounterlibifaceptr->get_1multival_incountervalues(attrit.second->dbincounter, &tmpmultival);
        if (result==DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET) {
          if (typeid(*attrit.second)==typeid(onoffattr)) {
            onoffattr_t *onoffattr=dynamic_cast<onoffattr_t *>(attrit.second);

            int32_t tmpdbval=tmpmultival.sval32bit;

            attrit.second->indbvaltime=curtime.tv_sec;
            if (attrit.second->indbvalchangedtime==0 || onoffattr->dbval!=tmpdbval) {
              //Only update if we haven't updated yet or the value is different from previous
              attrit.second->indbvalchangedtime=curtime.tv_sec;
              onoffattr->prevdbval=onoffattr->dbval;
              onoffattr->dbval=tmpdbval;

              if (onoffattr->val!=onoffattr->dbval) {
                //Copy to write val as it is different
                attrit.second->outvaltime=curtime.tv_sec;
                onoffattr->prevval=onoffattr->val;
                onoffattr->val=onoffattr->dbval;
                debuglibifaceptr->debuglib_printf(1, "%s: Changing value for device: %08" PRIX32 " Attribute: %s from %d to %d\n", __func__, gcsrmeshdeviceit.second.deviceId, attrit.first.c_str(), onoffattr->prevval, onoffattr->val);
                csrmeshSetDeviceOnOff(gcsrmeshdeviceit.second.deviceId, onoffattr->val);

                //When turning on the light bulb the color also needs to be resent to the light bulb
                if (onoffattr->val==1) {
                  updateColor=true;
                }
              }
            }
          } else if (typeid(*attrit.second)==typeid(dataintattr)) {
            dataintattr_t *dataintattr=dynamic_cast<dataintattr_t *>(attrit.second);

            int32_t tmpdbval=tmpmultival.sval32bit;

            dataintattr->indbvaltime=curtime.tv_sec;
            if (attrit.second->indbvalchangedtime==0 || dataintattr->dbval!=tmpdbval) {
              //Only update if we haven't updated yet or the value is different from previous
              attrit.second->indbvalchangedtime=curtime.tv_sec;
              dataintattr->prevdbval=dataintattr->dbval;
              dataintattr->dbval=tmpdbval;

              if (dataintattr->val!=dataintattr->dbval) {
                //Copy to write val as it is different
                attrit.second->outvaltime=curtime.tv_sec;
                dataintattr->prevval=dataintattr->val;
                dataintattr->val=dataintattr->dbval;
                debuglibifaceptr->debuglib_printf(1, "%s: Changing value for device: %08" PRIX32 " Attribute: %s from %d to %d\n", __func__, gcsrmeshdeviceit.second.deviceId, attrit.first.c_str(), dataintattr->prevval, dataintattr->val);
                updateColor=true;
              }
            }
          }
        }
      }
    }
    if (updateColor==true) {
      int32_t hue, saturation, brightness;
      time_t hue_indbvaltime, sat_indbvaltime, bright_indbvaltime;

      hue=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Hue"])->val;
      saturation=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Saturation"])->val;
      brightness=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Brightness"])->val;
      hue_indbvaltime=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Hue"])->indbvaltime;
      sat_indbvaltime=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Saturation"])->indbvaltime;
      bright_indbvaltime=dynamic_cast<dataintattr_t *>(gcsrmeshdeviceit.second.attrs["Brightness"])->indbvaltime;
      if (hue_indbvaltime>0 && sat_indbvaltime>0 && bright_indbvaltime>0) {
        //Only change the color if all the values have been retrieved
        csrmeshSetDeviceColor(gcsrmeshdeviceit.second.deviceId, hue, saturation, brightness);
      }
    }
  }
  unlockbluetoothhwandroid();
}

static unsigned csrmeshGetNumDevices() {
  unsigned size;
  lockbluetoothhwandroid();
  size=gcsrmeshdevices.size();
  unlockbluetoothhwandroid();

  return size;
}

/*
  Main serial thread loop that manages initialisation, shutdown, and connections to the usb serial devices
*/
static void *mainloop(void *) {
  bool databaseReady=false;
  bool csrmeshstarted=false;
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &waittime);

    if (!databaseReady) {
      if (!databaseReadyBluetooth()) {
        waittime.tv_sec+=1;
        sem_timedwait(&gmainthreadsleepsem, &waittime);
        continue;
      } else {
        databaseReady=true;
      }
    }
    if (!csrmeshNetworKeySet) {
      //The network key and devices info comes from the database after it has been generated once
      loadCSRMeshInfoFromDatabase();
    }
    if (!csrmeshstarted && csrmeshNetworKeySet) {
      if (startCSRMesh()==0) {
        csrmeshstarted=true;
      }
    }
    if (!csrmeshstarted || !csrmeshNetworKeySet) {
      waittime.tv_sec+=1;
    } else {
      csrmeshCheckIfNeedToPairDevice();
      csrmeshPollDevices();
      csrmeshSyncIdentifyDevices();
      csrmeshSyncDevicesWithDatabase();
      if (csrmeshGetNumDevices()>0) {
        //Regularly synchronise device state with database
        waittime.tv_sec+=1;
      } else {
        waittime.tv_sec+=120;
      }
    }
    sem_timedwait(&gmainthreadsleepsem, &waittime);
  }
  if (csrmeshstarted) {
    stopCSRMesh();
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static bool gneedtoquit=false; //Set to 1 when this library should exit

static void setneedtoquit(bool val) {
  lockbluetoothhwandroid();
  gneedtoquit=val;
  sem_post(&gmainthreadsleepsem);
  unlockbluetoothhwandroid();
}

static bool getneedtoquit(void) {
  int val;

  lockbluetoothhwandroid();
  val=gneedtoquit;
  unlockbluetoothhwandroid();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int start(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (gmainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&gmainthread, NULL, mainloop, nullptr);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
    }
  }
  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void stop(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (gmainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    setneedtoquit(true);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(gmainthread, NULL);
    gmainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Initialise this library
  Returns 0 for success or other value on error
  NOTE: No other threads should use this library until this function is called
*/
static int init(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const dblib_ifaceptrs_ver_1_t *dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID init_methodid;
  int wasdetached=0;
#endif

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  ++ginuse;
  if (ginuse>1) {
    //Already started
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, ginuse);
    return 0;
  }
  //Let the database library know that we want to use it
  dblibifaceptr->init();

  #ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return -1;
  }
  init_methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "init", "()I");
  env->CallStaticIntMethod(gbluetoothhwandroidlib_class, init_methodid);
  JNIDetachThread(wasdetached);
#endif
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&gerrorcheckmutexattr);
  pthread_mutexattr_settype(&gerrorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&gmutex, &gerrorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

/*
  Shutdown the this library
*/
static void shutdown(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const dblib_ifaceptrs_ver_1_t *dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID shutdown_methodid;
  int wasdetached=0;
#endif

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (ginuse==0) {
    //Already stopped : NOTE: We should never get here
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Shouldn't be here, already stopped\n", __func__);
    return;
  }
  --ginuse;
  if (ginuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, ginuse);
    return;
  }
#ifdef __ANDROID__
  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }
  shutdown_methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "shutdown", "()V");
  env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, shutdown_methodid);
  JNIDetachThread(wasdetached);
#endif

  //Finished using the database library
  dblibifaceptr->shutdown();

  //Reset globals to initial values
  gneedtoquit=0;
  gcsrmeshdevices.clear();
  gcsrmeshdevicesuuid.clear();
  csrmeshdiscoverymodeactive=false;
  csrmeshautopair=true;

  gbluetoothmacaddraddedtowebapi=false;
  gcsrmeshaddedtowebapi=false;

  csrmeshNetworKeySet=false;
  gBluetoothHostMacAddress=0;
  gCSKMeshNetworkKey="";

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&gmutex);

  pthread_mutexattr_destroy(&gerrorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

} //End of namespace

//C Exports
extern "C" {

extern moduleinfo_ver_generic_t *bluetoothhwandroidlib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jint JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jniaddcsrmeshdeviceforpairing(JNIEnv* env, jobject, jstring shortName, jint uuidHash);
JNIEXPORT void JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jnicsrmeshdevicepaired(JNIEnv*, jobject, jint uuidHash, jint deviceId);
JNIEXPORT void JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jniCSRMeshDeviceInfoModelLow(JNIEnv*, jobject, jint deviceId, jlong bitmap);
JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
#endif
}

moduleinfo_ver_generic_t *bluetoothhwandroidlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &bluetoothhwandroidlib::gmoduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jint JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jniaddcsrmeshdeviceforpairing(JNIEnv* env, jobject, jstring shortName, jint uuidHash) {
  return bluetoothhwandroidlib::addcsrmeshdeviceforpairing(env, shortName, uuidHash);
}

JNIEXPORT void JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jnicsrmeshdevicepaired(JNIEnv*, jobject, jint uuidHash, jint deviceId) {
  bluetoothhwandroidlib::csrmeshdevicepaired(uuidHash, deviceId);
}

JNIEXPORT void JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jniCSRMeshDeviceInfoModelLow(JNIEnv*, jobject, jint deviceId, jlong bitmap) {
  bluetoothhwandroidlib::CSRMeshDeviceInfoModelLow(deviceId, bitmap);
}

JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_BluetoothHWAndroidLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) bluetoothhwandroidlib_getmoduleinfo());
}

jint JNI_OnLoad(JavaVM* vm, void* UNUSED(reserved)) {
  JNIEnv *env;
  jclass aclass;

  bluetoothhwandroidlib::gJavaVM=vm;
  bluetoothhwandroidlib::gJavaVM->GetEnv((void * *) &env, JNI_VERSION_1_6);
  aclass=env->FindClass("com/capsicumcorp/iomy/libraries/watchinputs/BluetoothHWAndroidLib");
  bluetoothhwandroidlib::gbluetoothhwandroidlib_class=(jclass) env->NewGlobalRef(aclass);
  env->DeleteLocalRef(aclass);

  return JNI_VERSION_1_6; 
}

void JNI_OnUnload(JavaVM* UNUSED(vm), void* UNUSED(reserved)) {
  JNIEnv *env;

  bluetoothhwandroidlib::gJavaVM->GetEnv((void * *) &env, JNI_VERSION_1_6);
  env->DeleteGlobalRef(bluetoothhwandroidlib::gbluetoothhwandroidlib_class);
}

#endif
