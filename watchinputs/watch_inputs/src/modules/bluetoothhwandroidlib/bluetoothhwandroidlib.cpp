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
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "bluetoothhwandroidlib.hpp"
#include "modules/debuglib/debuglib.h"
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

static const int CSRMESHDEVICEPOLLTIME=5;

//CSRMesh definitions
typedef struct csrmeshdevice csrmeshdevice_t;
struct csrmeshdevice {
  std::string shortName=""; //The friendly name of the device
  std::string uuid=""; //This doesn't need to be saved
  int32_t uuidHash=0; //This is used for some commands
  int32_t deviceId=0; //This is used for some commands
  int64_t modelbitmap=0; //Indicates the supported csrmesh models
  bool needtopair=false; //True=This device is ready for pairing
  bool paired=false; //True=This device is fully paired, should have deviceId at this stage
  bool pairing=false; //True=This device is currently pairing
  bool havemodelbitmap=false; //True=We don't need to ask for model bitmap info
  time_t lastpolltime=0; //Number of seconds since epoc
};

std::string gCSKMeshNetworkKey=""; //Randomised network key used for CSRMesh encryption

//deviceId, csrmeshdevice_t
std::map<int32_t, csrmeshdevice_t> gcsrmeshdevices;

//uuidHash, csrmeshdevice_t
//Temporary storage for csrmesh devices that are pairing
std::map<int32_t, csrmeshdevice_t> gcsrmeshdevicesuuid;

bool csrmeshdiscoverymodeactive=false; //Set to true when csrmesh has full discovery mode enabled
bool csrmeshautopair=true; //Whether to enable auto pairing or not

//---------------------------------------

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
#define DEBUGLIB_DEPIDX 0

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

//Set a randomized network key for CSRMesh if not found in the database
//TODO: Retrieve existing value from database
static void setCSRMeshNetworkKey(void) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int wasdetached=0;
  jstring jnetworkKey;

  if (JNIAttachThread(env, wasdetached)!=JNI_OK) {
    return;
  }

  gCSKMeshNetworkKey=generateRandomString();
  debuglibifaceptr->debuglib_printf(1, "%s: Setting CSRMesh Network Key to \"%s\"\n", __func__, gCSKMeshNetworkKey.c_str());

  methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "setCSRMeshNetworkKey", "(Ljava/lang/String;)V");
  jnetworkKey=env->NewStringUTF(gCSKMeshNetworkKey.c_str());
  env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid, jnetworkKey);
  env->DeleteLocalRef(jnetworkKey);
  JNIDetachThread(wasdetached);
#endif
}

//Start CSRMesh library which will also initialise Bluetooth
static int startCSRMesh(void) {
#ifdef __ANDROID__
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  JNIEnv *env;
  jmethodID methodid;
  int result=0, wasdetached=0;

  //TODO: Set next device id from database

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

  //Wakeup the main thread to start handling the device
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

  lockbluetoothhwandroid();

  clock_gettime(CLOCK_REALTIME, &curtime);
  for (auto &gcsrmeshdeviceit : gcsrmeshdevices) {
    if (curtime.tv_sec+CSRMESHDEVICEPOLLTIME>gcsrmeshdeviceit.second.lastpolltime) {
      debuglibifaceptr->debuglib_printf(1, "%s: Checking if device: deviceId: %08X, uuidHash: %08X is connected\n", __func__, gcsrmeshdeviceit.second.deviceId, gcsrmeshdeviceit.second.uuidHash);
      gcsrmeshdeviceit.second.lastpolltime=curtime.tv_sec;

      JNIEnv *env;
      int wasdetached=0;
      if (JNIAttachThread(env, wasdetached)==JNI_OK) {
        jmethodID methodid=env->GetStaticMethodID(gbluetoothhwandroidlib_class, "CSRMeshGetModelInfoLow", "(I)V");
        env->CallStaticVoidMethod(gbluetoothhwandroidlib_class, methodid);
        JNIDetachThread(wasdetached);
      }
    }
  }
  unlockbluetoothhwandroid();
}

static void CSRMeshDeviceInfoModelLow(jint deviceId, jlong bitmap) {
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
  bool csrmeshNetworKeySet=false;
  bool csrmeshstarted=false;
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &waittime);

    if (!csrmeshNetworKeySet) {
      setCSRMeshNetworkKey();
      csrmeshNetworKeySet=true;
    }
    if (!csrmeshstarted && csrmeshNetworKeySet) {
      if (startCSRMesh()==0) {
        csrmeshstarted=true;
      }
    }
    if (!csrmeshstarted) {
      waittime.tv_sec+=1;
    } else {
      csrmeshCheckIfNeedToPairDevice();
      csrmeshPollDevices();
      if (csrmeshGetNumDevices()>0) {
        //Regularly synchronise device state with database
        waittime.tv_sec+=5;
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

  //Reset globals to initial values
  gneedtoquit=0;
  gcsrmeshdevices.clear();
  gcsrmeshdevicesuuid.clear();
  csrmeshdiscoverymodeactive=false;
  csrmeshautopair=true;

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
