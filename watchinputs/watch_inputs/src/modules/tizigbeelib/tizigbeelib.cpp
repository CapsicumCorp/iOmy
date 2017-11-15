/*
Title: Texas Instruments Z-Stack Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with Texas Instruments Z-Stack modules
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

Some code used from https://github.com/tlaukkan/zigbee4java/commit/695ce7fcc1a5e8f95eb88bd0e3382d9e767e8f39
  which is under Apache 2.0 license
*/

//NOTE: Only Coordinator has been well tested at the moment

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

//Needed for endian.h functions
#define _BSD_SOURCE

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <pthread.h>
#include <time.h>
#include <semaphore.h>
#include <endian.h>
#include <arpa/inet.h>
#include <array>
#include <list>
#include <map>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "tizigbeelibpriv.hpp"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/serialportlib/serialportlib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/zigbeelib/zigbeelib.h"

//Quick hack to work around problem where Android implements le16toh as letoh16
//NOTE: Newer versions of Android correctly define le16toh
#ifdef __ANDROID__
#ifndef le16toh
#define le16toh(x) letoh16(x)
#endif
#endif

#ifdef DEBUG
#warning "TIZIGBEELIB_PTHREAD_LOCK and TIZIGBEELIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define TIZIGBEELIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __PRETTY_FUNCTION__, __LINE__); \
    thislib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __PRETTY_FUNCTION__, __LINE__); \
    thislib_backtrace(); \
  } \
}

#define TIZIGBEELIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __PRETTY_FUNCTION__, __LINE__); \
    thislib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __PRETTY_FUNCTION__, __LINE__); \
    thislib_backtrace(); \
  } \
}

#else

#define TIZIGBEELIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define TIZIGBEELIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef TIZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef TIZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef TIZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#ifdef TIZIGBEELIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef TIZIGBEELIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef TIZIGBEELIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

namespace tizigbeelib {

//Types of packets that can be sent
static const int BUFFER_SIZE=256;

static const int TIZIGBEE_DETECT_TIMEOUT=1; //Use 1 second timeout when detecting the device

static const int HA_ENDPOINTID=1; //Some devices don't implement an endpoint for home automation and rely on software for all the handling

static const int CONNECT_STATUS_POLL_INTERVAL=60; //Poll the connection info every 60 seconds

static const int MAX_PACKETS_IN_TRANSIT=5;

static const uint8_t API_START_BYTE=0xFE;

typedef struct {
  char removed; //This device has been removed so is free to be reused by a new device
  char needtoremove; //This device has been scheduled for removal so functions should stop using it
  long inuse; //This device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  int serdevidx;
  int (*sendFuncptr)(int serdevidx, const void *buf, size_t count);
  int zigbeelibindex;
  int haendpointregistered; //1=The HA Endpoint has been registered with the Zigbee library
  //pthread_mutex_t sendmutex; //Locked when we a thread is using the send buffer
  unsigned char *receivebuf;
  int receivebufcnt; //Number of bytes currently being used in the receive buffer

  //Provided by SYS_PING
  uint16_t capabilities;

  //Provided by version request
  uint8_t transportrev;
  uint8_t product;
  uint8_t firmmaj; //Firmware version
  uint8_t firmmin;
  uint8_t hwrev;

  uint8_t network_state; //network state
  uint8_t device_type; //Device Type
  uint8_t cfgstate;
  uint8_t channel;
  uint16_t netaddr;
  uint16_t panid;
  uint64_t extpanid;
  uint64_t addr; //64-bit IEEE address of the device
  uint8_t waitingforresponse; //Set to 1 every time we send a remote Zigbee packet via this device
  uint8_t needreinit; //We have scheduled full reinitialisation of this device
                      //1=Init as Coordinator
                      //2=Init as Router
                      //3=Init as Non-Sleepy End Device
                      //4=Init as Sleepy End Device

  uint8_t reportingsupported; //>= 1.5.3 supports attribute reports
  uint8_t manureportingsupported; //>= 1.5.6 supports manufacturer attribute reports

  //These variables need to carry across calls to the receive function
  uint8_t receive_processing_packet, receive_escapechar;
  uint8_t receive_checksum;
  uint8_t receive_packetlength;

  int waiting_for_remotestatus; //-1=Not waiting, other values may indicate the frameid we're waiting for
  int waiting_for_remotequeueidx; //Index if the item in the send queue of the packet we are waiting for a response from
} tizigbeedevice_t;


#ifdef DEBUG
static pthread_mutexattr_t gerrorcheckmutexattr;

static pthread_mutex_t gmutex;
static pthread_mutex_t gmutex_waitforresponse;
static pthread_mutex_t gmutex_detectingdevice;
static pthread_mutex_t gmutex_initnewtizigbee;
#else
static pthread_mutex_t gmutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t gmutex_waitforresponse = PTHREAD_MUTEX_INITIALIZER; //Locked when we are waiting for a response from a device
static pthread_mutex_t gmutex_detectingdevice = PTHREAD_MUTEX_INITIALIZER; //Locked when we are detecting an device
static pthread_mutex_t gmutex_initnewtizigbee = PTHREAD_MUTEX_INITIALIZER; //Locked when we want to re-initialise the newtizigbee structure so we wait for threads that are still using it
#endif

//tizigbeelib_waitingforresponse should only be set inside the locks: tizigbeelibmutex_waitforresponse and tizigbeelibmutex
//  It also should be set to a 0 while tizigbeelib_waitforresponsesem isn't valid
static sem_t gwaitforresponsesem; //This semaphore will be initialised when waiting for response
static int gwaitingforresponse; //Set to one of the TIZIGBEE_WAITING_FOR_ types when the waiting for a response semaphore is being used
static int gwaitresult; //Set to 1 if the receive function receives the response that was being waited for

//Used by the receive function to decide whether to use tizigbeelib_tizigbeedevices or tizigbeelib_newtizigbee
static int gdetectingdevice; //Set to 1 when a device is being detected

static sem_t gmainthreadsleepsem; //Used for main thread sleeping

static int ginuse=0; //Only shutdown when inuse = 0
static int gshuttingdown=0;

static char gneedtoquit=0; //Set to 1 when tizigbeelib should exit

static pthread_t gmainthread=0;

static tizigbeedevice_t gnewtizigbee; //Used for new TI Zigbee devices that haven't been fully detected yet

//handler index, tizigbeedevice
static std::map<int16_t, tizigbeedevice_t> gtizigbeedevices; //A list of detected TI Zigbee devices

static bool gneedmoreinfo=false; //Set to false when a device needs more info to indicate that we shouldn't sleep for very long

//Static Function Declarations

//Function Declarations
static void receiveraw(int UNUSED(serdevidx), int handlerdevidx, char *buffer, int bufcnt);
static int isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));
static int serial_device_removed(int serdevidx);
static void setneedtoquit(bool val);
static bool getneedtoquit(void);
static int start(void);
static void stop(void);
static int init(void);
static void shutdown(void);
static void register_listeners(void);
static void unregister_listeners(void);

//Module Interface Definitions
static moduledep_ver_1_t gdeps[]={
  {
    "debuglib",
    nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "serialportlib",
    nullptr,
    SERIALPORTLIBINTERFACE_VER_1,
    1
  },
  {
    "commonserverlib",
    nullptr,
    COMMONSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "cmdserverlib",
    nullptr,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_1,
    1
  },
  {
    "zigbeelib",
    nullptr,
    ZIGBEELIBINTERFACE_VER_1,
    0
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t gmoduleinfo_ver_1={
  MODULEINFO_VER_1,
  "tizigbeelib",
  init,
  shutdown,
  start,
  stop,
  register_listeners,
  unregister_listeners,
  nullptr,
  (moduledep_ver_1_t (*)[]) &gdeps
};

static serialdevicehandler_iface_ver_1_t gdevicehandler_iface_ver_1={
  "tizigbeelib",
  isDeviceSupported,
  receiveraw,
  serial_device_removed
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
static void thislib_backtrace(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __PRETTY_FUNCTION__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __PRETTY_FUNCTION__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __PRETTY_FUNCTION__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
static void thislib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey;

//Initialise a thread local store for the lock counter
static void makelockkey(void) {
  int result;

  result=pthread_key_create(&lockkey, nullptr);
  if (result!=0) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __PRETTY_FUNCTION__, pthread_self(), result);
  } else {
    havelockkey=1;
  }
}

/*
  Apply the tizigbee mutex lock if not already applied otherwise increment the lock count
*/
static void locktizigbee(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();
  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    //Allocate storage for the lock counter and set to 0
    try {
      lockcnt=new long[1];
    } catch (std::bad_alloc& e) {
      const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Unable to allocate ram for lockcnt\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
      return;
    }
    *lockcnt=0;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    TIZIGBEELIB_PTHREAD_LOCK(&gmutex);
  }
  //Increment the lock count
  ++(*lockcnt);
#ifdef TIZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the tizigbee mutex lock
*/
static void unlocktizigbee(void) {
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, makelockkey);
  if (!havelockkey) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __PRETTY_FUNCTION__, pthread_self());
    thislib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    TIZIGBEELIB_PTHREAD_UNLOCK(&gmutex);
  }
#ifdef TIZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    delete[] lockcnt;
    lockcnt=nullptr;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

/*
  Thread unsafe get detecting device
*/
static int _getdetectingdevice(void) {
  return gdetectingdevice;
}

/*
  Thread safe get detecting device
*/
static int getdetectingdevice() {
  int val;

  locktizigbee();
  val=_getdetectingdevice();
  unlocktizigbee();

  return val;
}

/*
  Thread unsafe set detecting device
*/
static void _setdetectingdevice(int detectingdevice) {
  gdetectingdevice=detectingdevice;
}

/*
  Thread safe set detecting device
*/
static void setdetectingdevice(int detectingdevice) {
  locktizigbee();
  _setdetectingdevice(detectingdevice);
  unlocktizigbee();
}



/*
  Thread unsafe get need more info value
*/
static bool _getneedmoreinfo(void) {
  return gneedmoreinfo;
}

/*
  Thread safe get need more info value
*/
static bool getneedmoreinfo() {
  int val;

  locktizigbee();
  val=_getneedmoreinfo();
  unlocktizigbee();

  return val;
}

/*
  Thread unsafe set need more info value
*/
static void _setneedmoreinfo(bool needmoreinfo) {
  gneedmoreinfo=needmoreinfo;
}

/*
  Thread safe set need more info value
*/
static void setneedmoreinfo(bool needmoreinfo) {
  locktizigbee();
  _setneedmoreinfo(needmoreinfo);
  unlocktizigbee();
}

/*
  Thread safe mark a TI Zigbee device as in use
  Returns 0 on success or negative value on error
*/
static int marktizigbee_inuse(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  locktizigbee();
  if (tizigbeedevice.removed || tizigbeedevice.needtoremove) {
    //This device shouldn't be used as it is either removed or is scheduled for removab
    unlocktizigbee();

    return -1;
  }
  //Increment inuse value
  ++(tizigbeedevice.inuse);
#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu TI Zigbee: %016llX now inuse: %d\n", __PRETTY_FUNCTION__, pthread_self(), tizigbeedevice->addr, tizigbeedevice->inuse);
#endif

  unlocktizigbee();

  return 0;
}

/*
  Thread safe mark a TI Zigbee device as not in use
  Returns 0 on success or negative value on error
*/
static int marktizigbee_notinuse(tizigbeedevice_t& tizigbeedevice) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  locktizigbee();
  if (tizigbeedevice.removed) {
    //This device shouldn't be used as it is removed
    unlocktizigbee();

    return -1;
  }
  if (!tizigbeedevice.inuse) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu INUSE MISMATCH TRIED TO MARK AS NOT IN USE WHEN INUSE COUNT IS 0\n", __PRETTY_FUNCTION__, pthread_self());
    thislib_backtrace();
    unlocktizigbee();
    return -2;
  }
  //Decrement inuse value
  --(tizigbeedevice.inuse);

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu TI Zigbee: %016llX now inuse: %d\n", __PRETTY_FUNCTION__, pthread_self(), tizigbeedevice.addr, tizigbeedevice.inuse);
#endif
  unlocktizigbee();

  return 0;
}

//==================
//Protocol Functions
//==================

//Send a TI Zigbee API packet
//packet size is start byte + len byte + 2 cmd bytes + data + checksum byte
//You allocate 1 additional byte for the checksum at the end when allocating your buffer
//The buffer should have the first 2 bytes skipped for this function to fill in and bufcnt+1 will also be filled in with the checksum
//  So your first buffer entry will be buffer+2
//TI Zigbee length and TI Zigbee header ids should be already set by the caller
static void __tizigbee_send_api_packet(tizigbeedevice_t& tizigbeedevice, uint8_t *sendbuf) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;//, upto;
  uint8_t packetlen;
  uint8_t checksum;
  tizigbee_api_header_t *apicmd=reinterpret_cast<tizigbee_api_header_t *>(sendbuf);

  MOREDEBUG_ENTERINGFUNC();

  //Mark tizigbee in use so we don't try and use the send queue while a TI Zigbee is being removed
  if (marktizigbee_inuse(tizigbeedevice)<0) {
    //Failed to mark tizigbee as inuse
    return;
  }
  apicmd->frame_start=API_START_BYTE;

  packetlen=apicmd->length+5; //Add start byte + len byte + 2 byte cmd + 1 byte checksum after payload

  //Calculate Checksum : Sum of all but start and checksum byte
  checksum=0;
  for (i=1; i<packetlen-1; i++) {
    checksum=checksum ^ sendbuf[i]; //Checksum is XOR
  }
  sendbuf[packetlen-1]=checksum;

  //TODO: Comment out
//#ifdef TIZIGBEELIB_MOREDEBUG
  {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    int i;
    std::array<char,1024> tmpstr;

    tmpstr[0]=0;
    for (i=0; i<packetlen; i++) {
      sprintf(tmpstr.data()+strlen(tmpstr.data()), "%02hhX ", (uint8_t) sendbuf[i]);
      if (strlen(tmpstr.data())+5>1024) {
        //Abort if about to overflow the buffer
        break;
      }
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Sending bytes: %s, length=%d\n", __PRETTY_FUNCTION__, tmpstr.data(), packetlen);
  }
//#endif
  //Now send the packet
  //NOTE: No need to lock as the sending function will lock around the send operation
  tizigbeedevice.sendFuncptr(tizigbeedevice.serdevidx, sendbuf, packetlen);
  marktizigbee_notinuse(tizigbeedevice);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a special TI Zigbee bootloader get out command
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to send the serial data
*/
static void send_tizigbee_bootloaderGetOut(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  std::array<uint8_t,12> sendbuf;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu\n", __PRETTY_FUNCTION__, pthread_self());
#endif
  //Mark tizigbee in use so we don't try and use the send queue while a TI Zigbee is being removed
  if (marktizigbee_inuse(tizigbeedevice)<0) {
    //Failed to mark tizigbee as inuse
    return;
  }

  //Fill in the packet details and send the packet
  //NOTE: The first magic byte is also the API_START_BYTE so when in application mode we should form a valid packet
  //  with the 2nd and 3rd magic bytes
  sendbuf.fill(0);
  sendbuf[0]=BOOTLOADER_MAGIC_BYTE1;
  sendbuf[1]=BOOTLOADER_MAGIC_BYTE2;
  sendbuf[2]=BOOTLOADER_MAGIC_BYTE3;
  sendbuf[11]=0xE8; //CRC Byte
  {
    const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
    int i;
    std::array<char,1024> tmpstr;

    tmpstr[0]=0;
    for (i=0; i<sendbuf.size(); i++) {
      sprintf(tmpstr.data()+strlen(tmpstr.data()), "%02hhX ", (uint8_t) sendbuf[i]);
      if (strlen(tmpstr.data())+5>1024) {
        //Abort if about to overflow the buffer
        break;
      }
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Sending bytes: %s, length=%d\n", __PRETTY_FUNCTION__, tmpstr.data(), sendbuf.size());
  }
  tizigbeedevice.sendFuncptr(tizigbeedevice.serdevidx, sendbuf.data(), sendbuf.size());
  marktizigbee_notinuse(tizigbeedevice);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a TI Zigbee simple command
  Some TI Zigbee commands only consist of the command id so this function handles those
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to send the serial data
        cmd 16-byte command id
*/
static void send_tizigbee_simple_command(tizigbeedevice_t& tizigbeedevice, uint16_t cmd) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_api_header_t apicmd;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With Command: %04" PRIX16 "\n", __PRETTY_FUNCTION__, pthread_self(), cmd);
#endif
  //Fill in the packet details and send the packet
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  apicmd.cmd=htons(cmd);
  apicmd.length=0;
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}

void send_tizigbee_sys_ping(tizigbeedevice_t& tizigbeedevice) {
  send_tizigbee_simple_command(tizigbeedevice, SYS_PING);
}

void send_tizigbee_sys_version(tizigbeedevice_t& tizigbeedevice) {
  send_tizigbee_simple_command(tizigbeedevice, SYS_VERSION);
}

void send_tizigbee_sys_reset(tizigbeedevice_t& tizigbeedevice, uint8_t reset_type) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_sys_reset_t apicmd;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With reset type: %d\n", __PRETTY_FUNCTION__, pthread_self(), reset_type);
#endif
  //Fill in the packet details and send the packet
  apicmd.cmd=htons(SYS_RESET);
  apicmd.reset_type=reset_type;
  apicmd.length=1;
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}

void send_tizigbee_zb_get_device_info(tizigbeedevice_t& tizigbeedevice, uint8_t devinfotype) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_get_device_info_t apicmd;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With reset type: %d\n", __PRETTY_FUNCTION__, pthread_self(), reset_type);
#endif
  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_GET_DEVICE_INFO);
  apicmd.devinfotype=devinfotype;
  apicmd.length=1;
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee Sys Ping Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_sys_ping_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_sys_ping_response_t *apicmd=reinterpret_cast<tizigbee_sys_ping_response_t *>(tizigbeedevice.receivebuf);

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR_SYS_PING_RESPONSE) {
    gwaitresult=1;
  }
  uint16_t capabilities=le16toh(apicmd->capabilities);

  tizigbeedevice.capabilities=capabilities;
  unlocktizigbee();

  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Capabilities (0x%04" PRIX16 "):\n", __PRETTY_FUNCTION__, capabilities);
  if ((capabilities & CAPABILITIES::MT_CAP_SYS)==CAPABILITIES::MT_CAP_SYS) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_SYS\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_MAC)==CAPABILITIES::MT_CAP_MAC) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_MAC\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_NWK)==CAPABILITIES::MT_CAP_NWK) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_NWK\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_AF)==CAPABILITIES::MT_CAP_AF) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_AF\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_ZDO)==CAPABILITIES::MT_CAP_ZDO) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_ZDO\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_SAPI)==CAPABILITIES::MT_CAP_SAPI) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_SAPI\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_UTIL)==CAPABILITIES::MT_CAP_UTIL) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_UTIL\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_DEBUG)==CAPABILITIES::MT_CAP_DEBUG) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_DEBUG\n", __PRETTY_FUNCTION__);
  }
  if ((capabilities & CAPABILITIES::MT_CAP_APP)==CAPABILITIES::MT_CAP_APP) {
    debuglibifaceptr->debuglib_printf(1, "%s:   MT_CAP_APP\n", __PRETTY_FUNCTION__);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee Sys Version Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_sys_version_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_sys_version_response_t *apicmd=reinterpret_cast<tizigbee_sys_version_response_t *>(tizigbeedevice.receivebuf);
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR_SYS_VERSION_RESPONSE) {
    gwaitresult=1;
  }
  tizigbeedevice.transportrev=apicmd->transportrev;
  tizigbeedevice.product=apicmd->product;
  tizigbeedevice.firmmaj=apicmd->major_firmware_version;
  tizigbeedevice.firmmin=apicmd->minor_firmware_version;
  tizigbeedevice.hwrev=apicmd->hwrev;
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Version Response Info:\n", __PRETTY_FUNCTION__);
  debuglibifaceptr->debuglib_printf(1, "%s:   Transport Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->transportrev);
  debuglibifaceptr->debuglib_printf(1, "%s:   Product: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->product);
  debuglibifaceptr->debuglib_printf(1, "%s:   Firmware Version: %" PRId8 ".%" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->major_firmware_version, apicmd->minor_firmware_version);
  debuglibifaceptr->debuglib_printf(1, "%s:   Hardware Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->hwrev);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee Sys Reset Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_sys_reset_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_sys_reset_response_t *apicmd=reinterpret_cast<tizigbee_sys_reset_response_t *>(tizigbeedevice.receivebuf);
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR_SYS_RESET_RESPONSE) {
    gwaitresult=1;
  }
  tizigbeedevice.transportrev=apicmd->transportrev;
  tizigbeedevice.product=apicmd->product;
  tizigbeedevice.firmmaj=apicmd->major_firmware_version;
  tizigbeedevice.firmmin=apicmd->minor_firmware_version;
  tizigbeedevice.hwrev=apicmd->hwrev;
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Reset Response Info:\n", __PRETTY_FUNCTION__);
  debuglibifaceptr->debuglib_printf(1, "%s:   Reset Reason: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->reason);
  debuglibifaceptr->debuglib_printf(1, "%s:   Transport Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->transportrev);
  debuglibifaceptr->debuglib_printf(1, "%s:   Product: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->product);
  debuglibifaceptr->debuglib_printf(1, "%s:   Firmware Version: %" PRId8 ".%" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->major_firmware_version, apicmd->minor_firmware_version);
  debuglibifaceptr->debuglib_printf(1, "%s:   Hardware Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->hwrev);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB Device Info Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_device_info_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_get_device_info_response_t *apicmd=reinterpret_cast<tizigbee_zb_get_device_info_response_t *>(tizigbeedevice.receivebuf);
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR_ZB_DEVICE_INFO_RESPONSE) {
    gwaitresult=1;
  }
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Device Info Response:\n", __PRETTY_FUNCTION__);
  switch (apicmd->devinfotype) {
    case DEV_INFO_TYPE::IEEE_ADDR:
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      debuglibifaceptr->debuglib_printf(1, "%s: IEEE Addr: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    case DEV_INFO_TYPE::PARENT_IEEE_ADDR:
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      debuglibifaceptr->debuglib_printf(1, "%s: Parent IEEE Addr: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    case DEV_INFO_TYPE::CHANNEL:
      debuglibifaceptr->debuglib_printf(1, "%s: Channel: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval8bit);
      break;
    case DEV_INFO_TYPE::PAN_ID:
      apicmd->devinfo.uval16bit=le16toh(apicmd->devinfo.uval16bit);
      debuglibifaceptr->debuglib_printf(1, "%s: Pan ID: 0x%04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval16bit);
      break;
    case DEV_INFO_TYPE::EXT_PAN_ID:
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      debuglibifaceptr->debuglib_printf(1, "%s: Extended Pan ID: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Unknown info type: %" PRId8 "\n", __PRETTY_FUNCTION__);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee API packet
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
  NOTE: No need to mark tizigbee inuse here as all callers of this function do that already
*/
static void process_api_packet(tizigbeedevice_t& tizigbeedevice) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  tizigbee_api_response_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=reinterpret_cast<tizigbee_api_response_t *>(tizigbeedevice.receivebuf);

  //Swap the cmd bytes to host format if necessary so easier to work with
  apicmd->cmd=ntohs(apicmd->cmd);

  //Goto appropriate frame type processing function
  switch (apicmd->cmd) {
    case SYS_PING_RESPONSE:
      process_sys_ping_response(tizigbeedevice);
      break;
    case SYS_VERSION_RESPONSE:
      process_sys_version_response(tizigbeedevice);
      break;
    case SYS_RESET_RESPONSE:
      process_sys_reset_response(tizigbeedevice);
      break;
    case ZB_GET_DEVICE_INFO_RESPONSE:
      process_zb_device_info_response(tizigbeedevice);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Received Unknown TI Zigbee packet: 0x%04" PRIX16 " with length: %d\n", __PRETTY_FUNCTION__, apicmd->cmd, apicmd->length);
  }
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR_ANYTHING) {
    gwaitresult=1;
  }
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();
}

//=========================
//End of Protocol Functions
//=========================

/*
  Receive raw unprocessed TI Zigbee data from a function that received the data from the TI Zigbee device
  Args: serdevidx: The index to the serial device for the device
        handlerdevidx: The index to this handler's device or -1 if the hasn't been setup yet (Still being detected)
        buffer: The buffer containing the raw data
        bufcnt: The number of bytes of data received
  NOTE: Don't need much thread locking since when this function is in the main loop it will be the only one using these variables
*/
static void receiveraw(int UNUSED(serdevidx), int handlerdevidx, char *buffer, int bufcnt) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  unsigned char serchar;
  int bufpos=0;
  tizigbeedevice_t *tizigbeedevice; //A pointer to the device that the data was received on

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();
  if (handlerdevidx!=-1) {
    //Assign to tizigbeedevice element
    tizigbeedevice=&gtizigbeedevices.at(handlerdevidx);
  } else {
    if (getdetectingdevice()) {
      //Only handle data from newtizigbee if we are currently detecting an tizigbee
      tizigbeedevice=&gnewtizigbee;

      //Prevent re-initialisation until finished in the receive thread
      PTHREAD_LOCK(&gmutex_initnewtizigbee);
    } else {
      unlocktizigbee();
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  if (marktizigbee_inuse(*tizigbeedevice)<0) {
    //Failed to mark tizigbee as inuse
    if (tizigbeedevice==&gnewtizigbee) {
      PTHREAD_UNLOCK(&gmutex_initnewtizigbee);
    }
    unlocktizigbee();
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  unlocktizigbee();
  if (tizigbeedevice->receivebuf==nullptr) {
    marktizigbee_notinuse(*tizigbeedevice);
    if (tizigbeedevice==&gnewtizigbee) {
      PTHREAD_UNLOCK(&gmutex_initnewtizigbee);
    }
    //Not ready to receive data yet ; This should never happen since the detect function will allocate space before
    //  the receive thread is switched from newtizigbee lib to the tizigbeelib list element
    debuglibifaceptr->debuglib_printf(1, "%s: BUG: Received data before buffer space allocated\n", __PRETTY_FUNCTION__);
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //TODO: Comment out
//#ifdef TIZIGBEELIB_MOREDEBUG
  {
    int i;
    std::array<char,1024> tmpstr;

    debuglibifaceptr->debuglib_printf(1, "%s: Received bytes: ", __PRETTY_FUNCTION__);
    for (i=0; i<bufcnt; i++) {
      sprintf(tmpstr.data()+(i*3), "%02X ", (uint8_t) buffer[i]);
      if (i*3+3>1024) {
        //Abort if about to overflow the buffer
        break;
      }
    }
    debuglibifaceptr->debuglib_printf(1, "%s\n", tmpstr.data());
  }
//#endif


  //Loop until all waiting serial data has been processed
  bufpos=0;
  while (bufpos<bufcnt) {
    serchar=buffer[bufpos];
    ++bufpos;
    if (tizigbeedevice->receivebufcnt==BUFFER_SIZE) {
      //Throw away invalid data
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Received buffer size limit reached, throwing away %d bytes\n", __PRETTY_FUNCTION__, BUFFER_SIZE);
      tizigbeedevice->receivebufcnt=0;
      tizigbeedevice->receive_checksum=0;
      tizigbeedevice->receive_processing_packet=0;
      tizigbeedevice->receive_escapechar=0;
      tizigbeedevice->receive_packetlength=0;
    }
    if (!tizigbeedevice->receive_processing_packet && serchar==API_START_BYTE) {
      //Found the beginning of an API packet
      tizigbeedevice->receivebufcnt=0;
      tizigbeedevice->receive_checksum=0;
      tizigbeedevice->receivebuf[tizigbeedevice->receivebufcnt++]=serchar;
      tizigbeedevice->receive_processing_packet=1;
      tizigbeedevice->receive_escapechar=0xff; //Start with large packet length so checks don't stop early
      continue;
    }
    if (tizigbeedevice->receive_processing_packet) {
      tizigbeedevice->receivebuf[tizigbeedevice->receivebufcnt++]=serchar;
      if (tizigbeedevice->receivebufcnt-4<=tizigbeedevice->receive_packetlength) {
        //Checksum everything after the frame start except the last checksum byte
        tizigbeedevice->receive_checksum^=serchar;
      }
      if (tizigbeedevice->receivebufcnt==2) {
        tizigbeedevice->receive_packetlength=serchar;
      } else if (tizigbeedevice->receivebufcnt-5==tizigbeedevice->receive_packetlength) {
        uint16_t checksum;

        tizigbeedevice->receive_processing_packet=0;
        checksum=tizigbeedevice->receivebuf[tizigbeedevice->receivebufcnt-1];
        if (tizigbeedevice->receive_checksum!=checksum) {
          //Invalid checksum so ignore
          debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Invalid checksum: %02" PRIX8 " received, expecting: %02" PRIX8", TI Zigbee packet length: %d\n", __PRETTY_FUNCTION__, checksum, tizigbeedevice->receive_checksum, tizigbeedevice->receive_packetlength);
        } else {
          //A full API Packet has been received and is ready for processing

          //Process the API packet here
          process_api_packet(*tizigbeedevice);
          locktizigbee();
          if (gwaitresult) {
            sem_post(&gwaitforresponsesem);
            gwaitresult=0;
          }
          unlocktizigbee();
        }
        //Ready to process a new packet
        locktizigbee();
        tizigbeedevice->receivebufcnt=0;
        tizigbeedevice->receive_checksum=0;
        tizigbeedevice->receive_processing_packet=0;
        tizigbeedevice->receive_escapechar=0;
        tizigbeedevice->receive_packetlength=0;
        unlocktizigbee();
      }
    } else {
      //Ignore invalid bytes here
    }
  }
  marktizigbee_notinuse(*tizigbeedevice);
  if (tizigbeedevice==&gnewtizigbee) {
    PTHREAD_UNLOCK(&gmutex_initnewtizigbee);
  }
  MOREDEBUG_EXITINGFUNC();
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//Initialise gnewtizigbee values
//When we copy gnewtizigbee to the tizigbee list, the zigbeedevices pointer will be used by that tizigbee element
//  so we shouldn't free it here just set it back to NULL.
static void _init_newtizigbee(void) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  unsigned char *receivebuf;

  MOREDEBUG_ENTERINGFUNC();

  //Wait for other threads to finish using gnewtizigbee first
  PTHREAD_LOCK(&gmutex_initnewtizigbee);

  //Backup sendmutex, and receivebuf
  receivebuf=gnewtizigbee.receivebuf;

  //Clear newtizigbee
  memset(&gnewtizigbee, 0, sizeof(tizigbeedevice_t));

  //Restore sendmutex, and receivebuf
  gnewtizigbee.receivebuf=receivebuf;

  //Set new non-zero initial values
  gnewtizigbee.serdevidx=-1;
  gnewtizigbee.zigbeelibindex=-1;
  gnewtizigbee.waiting_for_remotestatus=-1;

  PTHREAD_UNLOCK(&gmutex_initnewtizigbee);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Initialise a semaphore for waiting for a response to a packet
  Also applies the waitforresponse pthread lock
  Send your packet after calling this function and then call waitforresponse
  Returns negative value on error or >= 0 on success
*/
static int initwaitforresponse(int waitingforresponseid) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  MOREDEBUG_ENTERINGFUNC();

  PTHREAD_LOCK(&gmutex_waitforresponse);
  if (sem_init(&gwaitforresponsesem, 0, 0)==-1) {
    //Can't initialise semaphore
    PTHREAD_UNLOCK(&gmutex_waitforresponse);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  locktizigbee();
  gwaitingforresponse=waitingforresponseid;
  gwaitresult=0;
  unlocktizigbee();

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

/*
  Wait for a response to a packet by waiting for the semaphore to be released
  Also releases the waitforresponse pthread lock
  Send your packet after calling initwaitforresponse and then call this function
  Returns negative value on error or >= 0 on success
*/
static int waitforresponse(int timeout=TIZIGBEE_DETECT_TIMEOUT) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int result, lerrno;
  struct timespec waittime;

  MOREDEBUG_ENTERINGFUNC();

  //Wait 1 second for the result
  clock_gettime(CLOCK_REALTIME, &waittime);
  waittime.tv_sec+=timeout;
  while ((result=sem_timedwait(&gwaitforresponsesem, &waittime)) == -1 && errno == EINTR)
    continue; /* Restart if interrupted by handler */
  lerrno=errno;
  locktizigbee();
  gwaitingforresponse=0;
  unlocktizigbee();
  sem_destroy(&gwaitforresponsesem);
  PTHREAD_UNLOCK(&gmutex_waitforresponse);
  if (result==-1 && lerrno==ETIMEDOUT) {
    //Failed to receive the response
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

/*
  Detect a TI Zigbee and reset it if necessary
*/
static int detect_tizigbee(tizigbeedevice_t& tizigbeedevice, int longdetect) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result;
  int retrycnt, maxretry;
  bool sentBootloadergetout=false;

  if (longdetect) {
    maxretry=60;
  } else {
    maxretry=2;
  }
  retrycnt=0;
  while (retrycnt<maxretry) {
    //Start with SYS_PING as it responds faster than SYS_RESET
    result=initwaitforresponse(WAITING_FOR_SYS_PING_RESPONSE);
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
      return -1;
    }
    //Send Ping Request
    send_tizigbee_sys_ping(gnewtizigbee);

    //Wait 1 second for the result
    result=waitforresponse();
    if (result>=0) {
      //We got a response
      break;
    }
    if ((longdetect && retrycnt % 4==0) || !longdetect) {
      //Reset the TI Zigbee module to get it in a known state
      //Only reset on every 4th retry if longdetect is set
      debuglibifaceptr->debuglib_printf(1, "%s: Sending the reset command to the TI Zigbee\n", __PRETTY_FUNCTION__);

      result=initwaitforresponse(WAITING_FOR_SYS_RESET_RESPONSE);
      if (result<0) {
        debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
        return -1;
      }
      send_tizigbee_sys_reset(gnewtizigbee, RESET_TYPE::SERIAL_BOOTLOADER);

      //Wait 2 seconds for the result
      result=waitforresponse(2);
      if (result>=0) {
        //We got a response
        break;
      }
      //Try bootloader magic packet to exit the bootloader
      //NOTE: Only send this once per detection
      //https://e2e.ti.com/support/wireless_connectivity/zigbee_6lowpan_802-15-4_mac/f/158/p/548891/2005890
      if (!sentBootloadergetout) {
        debuglibifaceptr->debuglib_printf(1, "%s: Sending bootloader exit code\n", __PRETTY_FUNCTION__);

        send_tizigbee_bootloaderGetOut(gnewtizigbee);
        sentBootloadergetout=true;

        //Wait 100 milliseconds after reset
        usleep(100000);
      }
    }
    ++retrycnt;
  }
  if (retrycnt>=maxretry) {
    //Failed to receive the rapidha module info response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive TI Zigbee Response\n", __PRETTY_FUNCTION__);
    return -1;
  }
  result=initwaitforresponse(WAITING_FOR_SYS_PING_RESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return -1;
  }
  //Send Ping Request (To get capabilities)
  send_tizigbee_sys_ping(gnewtizigbee);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return -1;
  }
  result=initwaitforresponse(WAITING_FOR_SYS_VERSION_RESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return -1;
  }
  //Send Version Request
  send_tizigbee_sys_version(gnewtizigbee);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return -1;
  }
  locktizigbee();
  {
    uint8_t firmmaj, firmmin, hwrev; //TI Zigbee Firmware version

    firmmaj=tizigbeedevice.firmmaj;
    firmmin=tizigbeedevice.firmmin;
    hwrev=tizigbeedevice.hwrev;

    debuglibifaceptr->debuglib_printf(1, "%s: Firmware Version: %" PRId8".%" PRId8 "\n", __PRETTY_FUNCTION__, firmmaj, firmmin);
    debuglibifaceptr->debuglib_printf(1, "%s:   Hardware Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, hwrev);
  }
  //NOTE: Always do full reinit at startup so we get an updated view of the device config
  tizigbeedevice.needreinit=1;

  unlocktizigbee();

  return 0;
}

/*
  A function used to check if the handler supports a serial device
  Returns the handler index if supported or -1 if not
  NOTE: It may take a few seconds for the auto detection to complete
*/
static int isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count)) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int detectresult, list_numitems;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  PTHREAD_LOCK(&gmutex_detectingdevice);

  //Initialise values before setting detectingdevice flag so the values don't change while receive is running
  _init_newtizigbee();
  gnewtizigbee.serdevidx=serdevidx;
  gnewtizigbee.sendFuncptr=sendFuncptr;

  setdetectingdevice(1);
  debuglibifaceptr->debuglib_printf(1, "%s: serial device index=%d\n", __PRETTY_FUNCTION__, serdevidx);

  detectresult=detect_tizigbee(gnewtizigbee, 0);
  if (detectresult<0) {
    setdetectingdevice(0);
    PTHREAD_UNLOCK(&gmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return -1;
  }
  locktizigbee();
  //Setup a list entry for the tizigbee device

  //First search for an empty slot
  std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeit;
  for (tizigbeeit=gtizigbeedevices.begin(); tizigbeeit!=gtizigbeedevices.end(); ++tizigbeeit) {
    if (tizigbeeit->second.removed) {
      break;
    }
  }
  if (tizigbeeit==gtizigbeedevices.end()) {
    //Allocate a new item
    list_numitems=gtizigbeedevices.size();
  } else {
    list_numitems=tizigbeeit->first;
  }
  //TODO: Remove
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Storing in slot: %" PRId16 "\n", __PRETTY_FUNCTION__, list_numitems);

  //Reset detecting device so receiveraw stops using gnewtizigbee
  setdetectingdevice(0);

  //If receiveraw is running it will have marked gnewtizigbee in use so we need to wait for it to finish and
  //  then it will be safe to make an atomic copy of the structure
  //Also need to unlock tizigbee so receiveraw can lock.  This is okay as this is the only place where new tizigbee devices
  //  are added
  unlocktizigbee();
  PTHREAD_LOCK(&gmutex_initnewtizigbee);
  gtizigbeedevices[list_numitems]=gnewtizigbee;
  PTHREAD_UNLOCK(&gmutex_initnewtizigbee);
  locktizigbee();

  //Allocate new memory for the receive buffer
  gtizigbeedevices[list_numitems].receivebuf=new unsigned char[BUFFER_SIZE];

  //TODO: Remove
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Num TI Zigbee Devices=%d\n", __PRETTY_FUNCTION__, gtizigbeedevices.size());

  //Wakeup the main thread to refresh info about this device
  sem_post(&gmainthreadsleepsem);

  unlocktizigbee();

  PTHREAD_UNLOCK(&gmutex_detectingdevice);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return list_numitems;
}






/*
  A function called by the parent library when the tizigbee device has been removed
  If the tizigbeedevice is still in use we return negative value but mark the tizigbee for removal so
    it won't be used again and can be removed on the next call to this function
  Return 1 if removed, 0 if still in use, or negative value on error
*/
static int serial_device_removed(int serdevidx) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  int index, result;
  tizigbeedevice_t *tizigbeedeviceptr=NULL;

  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();

  std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeit;
  for (tizigbeeit=gtizigbeedevices.begin(); tizigbeeit!=gtizigbeedevices.end(); ++tizigbeeit) {
    tizigbeedeviceptr=&tizigbeeit->second;
    if (tizigbeedeviceptr->removed) {
      //This tizigbee is removed so we can't trust any other values
      continue;
    }
    if (tizigbeedeviceptr->serdevidx==serdevidx) {
      //Found a match for serdevidx
      break;
    }
  }
  if (tizigbeeit==gtizigbeedevices.end()) {
    unlocktizigbee();

    MOREDEBUG_EXITINGFUNC();

    //If we get here it is because there wasn't a match for serdevidx
    return -2;
  }
  if (!tizigbeedeviceptr->needtoremove) {
    //Mark that this tizigbee needs to be removed so other functions stop using it
    if (tizigbeedeviceptr->needreinit) {
      //We might not have an address yet
      debuglibifaceptr->debuglib_printf(1, "%s: Marking TI Zigbee at index: %" PRId16 " for removal\n", __PRETTY_FUNCTION__, tizigbeeit->first);
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: Marking TI Zigbee %016" PRIX64 " at index: %" PRId16 " for removal\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first);
    }
    tizigbeedeviceptr->needtoremove=1;
  }
  if (tizigbeedeviceptr->zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;
    result=zigbeelibifaceptr->remove_localzigbeedevice(tizigbeedeviceptr->zigbeelibindex, &tizigbeelocked, &zigbeelocked);
    if (result==0) {
      //Still in use so we can't cleanup yet
      if (tizigbeedeviceptr->needreinit) {
        //We might not have an address yet
        debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee at index: %" PRId16 " is still in use: %ld by Zigbee so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeeit->first, tizigbeedeviceptr->inuse);
      } else {
        debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " is still in use: %ld by Zigbee so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first, tizigbeedeviceptr->inuse);
      }
      unlocktizigbee();

      MOREDEBUG_EXITINGFUNC();
      return 0;
    }
  }
  if (tizigbeedeviceptr->inuse) {
    //Still in use so we can't cleanup yet
    if (tizigbeedeviceptr->needreinit) {
      //We might not have an address yet
      debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee at index: %" PRId16 " is still in use: %ld so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeeit->first, tizigbeedeviceptr->inuse);
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " is still in use: %ld so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first, tizigbeedeviceptr->inuse);
    }
    unlocktizigbee();

    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  //Remove the TI Zigbee from ram
  index=tizigbeeit->first; //So we can refer to the index later on

  if (tizigbeedeviceptr->receivebuf) {
    delete[] tizigbeedeviceptr->receivebuf;
    tizigbeedeviceptr->receivebuf=NULL;
  }
  //We can remove the TI Zigbee as it isn't in use
  if (tizigbeedeviceptr->needreinit) {
    //We might not have an address yet
    debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee at index: %" PRId16 " has now been removed\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, index);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " has now been removed\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, index);
  }
  memset(tizigbeedeviceptr, 0, sizeof(tizigbeedevice_t));
  tizigbeedeviceptr->serdevidx=-1;
  tizigbeedeviceptr->zigbeelibindex=-1;
  tizigbeedeviceptr->waiting_for_remotestatus=-1;

  tizigbeedeviceptr->removed=1;

  unlocktizigbee();

  MOREDEBUG_EXITINGFUNC();

  //The device was successfully removed
  return 1;
}

//Get TI Zigbee info within a wait
//Returns true on success, or false on error
static bool tizigbee_zb_get_device_info_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t devinfotype) {
  int result;

  result=initwaitforresponse(WAITING_FOR_ZB_DEVICE_INFO_RESPONSE);
  if (result<0) {
    return false;
  }
  //Get device info: IEEE_ADDR
  send_tizigbee_zb_get_device_info(tizigbeedevice, devinfotype);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}

//Initialise a TI Zigbee device with device info
static void doreinit(tizigbeedevice_t& tizigbeedevice) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int detectresult, result;
  uint64_t addr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Get all device info
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::IEEE_ADDR)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::PARENT_IEEE_ADDR)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::CHANNEL)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::PAN_ID)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::EXT_PAN_ID)) {
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Refresh data from tizigbee devices
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
static void refresh_tizigbee_data(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  zigbeelib_localzigbeedevice_ver_1_t localzigbeedevice;
  int i, pos;
  long tizigbeelocked=0, zigbeelocked=0;
  bool needmoreinfo=false;

  //Refresh data from tizigbee devices
  MOREDEBUG_ENTERINGFUNC();
  localzigbeedevice.devicetype="TIZigBee";
  locktizigbee();
  std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeendit=gtizigbeedevices.end();
  unlocktizigbee();
  std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeit;
  for (tizigbeeit=gtizigbeedevices.begin(); tizigbeeit!=tizigbeeendit; ++tizigbeeit) {
    int zigbeelibindex;
    tizigbeedevice_t *tizigbeedeviceptr;
    const char *firmware_file;
    uint8_t needreinit, cfgstate;

    tizigbeedeviceptr=&tizigbeeit->second;
    if (marktizigbee_inuse(*tizigbeedeviceptr)<0) {
      //Unable to mark this rapidha for use
      continue;
    }
    //Check if need to reinitialise this TI Zigbee
    //Always refresh all ZigBee devices after reinit as the TI Zigbee may lose important state information
    //  during reinit
    locktizigbee();
    zigbeelibindex=tizigbeedeviceptr->zigbeelibindex;
    needreinit=tizigbeedeviceptr->needreinit;
    unlocktizigbee();
    if (needreinit) {
      if (zigbeelibindex>=0 && zigbeelibifaceptr) {
        debuglibifaceptr->debuglib_printf(1, "%s: Removing cached list of ZigBee devices as TI Zigbee at index: %" PRId16 " needs to be reconfigured\n", __PRETTY_FUNCTION__, tizigbeeit->first);
        zigbeelibifaceptr->remove_all_zigbee_devices(zigbeelibindex, &tizigbeelocked, &zigbeelocked);
      }
      doreinit(*tizigbeedeviceptr);
      locktizigbee();
      needreinit=tizigbeedeviceptr->needreinit;
      unlocktizigbee();
      if (needreinit) {
        //Having problems configuring this TI Zigbee so go on to other devices
        debuglibifaceptr->debuglib_printf(1, "%s: ERROR: TI Zigbee at index: %" PRId16 " hasn't reinitialised properly\n", __PRETTY_FUNCTION__, tizigbeeit->first);
        marktizigbee_notinuse(*tizigbeedeviceptr);
        needmoreinfo=true;
        continue;
      }
    }
    marktizigbee_notinuse(*tizigbeedeviceptr);
  }
  if (needmoreinfo) {
    //Don't sleep the main thread for long
    setneedmoreinfo(true);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Main thread loop that manages initialisation, shutdown, and outgoing communication to the TI Zigbee devices
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *mainloop(void *val) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);

    refresh_tizigbee_data();

    if (getneedtoquit()) {
      break;
    }
    if (getneedmoreinfo()) {
      //Sleep for one second but reset needmoreinfo so next time we might sleep for a while
      semwaittime.tv_sec+=1;
      semwaittime.tv_nsec=0;
      setneedmoreinfo(false);
    } else {
      //Sleep for a while
      semwaittime.tv_sec+=10;
      semwaittime.tv_nsec=0;
    }
#ifdef TIZIGBEELIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Sleeping\n", __PRETTY_FUNCTION__);
#endif
    sem_timedwait(&gmainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return (void *) 0;
}

static void setneedtoquit(bool val) {
  locktizigbee();
  gneedtoquit=val;
  sem_post(&gmainthreadsleepsem);
  unlocktizigbee();
}

static bool getneedtoquit(void) {
  int val;

  locktizigbee();
  val=gneedtoquit;
  unlocktizigbee();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int start(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  //Start a thread for auto detecting Xbee modules
  if (gmainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __PRETTY_FUNCTION__);
    result=pthread_create(&gmainthread, nullptr, mainloop, nullptr);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __PRETTY_FUNCTION__);
      result=-1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
static void stop(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gmainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __PRETTY_FUNCTION__);
    setneedtoquit(true);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __PRETTY_FUNCTION__);
    pthread_join(gmainthread, nullptr);
    gmainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int init(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=reinterpret_cast<const serialportlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("serialportlib", SERIALPORTLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gshuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __PRETTY_FUNCTION__);
    return -1;
  }
  ++ginuse;
  if (ginuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return -1;
  }
  //Let the serial library know that we want to use it
  if (serialportlibifaceptr) {
    serialportlibifaceptr->init();
  }
  gneedtoquit=0;
  if (sem_init(&gmainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __PRETTY_FUNCTION__);
    return -2;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&gerrorcheckmutexattr);
  pthread_mutexattr_settype(&gerrorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&gmutex, &gerrorcheckmutexattr);
  pthread_mutex_init(&gmutex_waitforresponse, &gerrorcheckmutexattr);
  pthread_mutex_init(&gmutex_detectingdevice, &gerrorcheckmutexattr);
  pthread_mutex_init(&gmutex_initnewtizigbee, &gerrorcheckmutexattr);
#endif

  _init_newtizigbee();

  //Allocate storage for the new tizigbee device receive buffers
  if (!gnewtizigbee.receivebuf) {
    try {
      gnewtizigbee.receivebuf=new unsigned char[BUFFER_SIZE];
    } catch (std::bad_alloc& e) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Not enough ram for receive buffer\n", __PRETTY_FUNCTION__);
      return -3;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void shutdown(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=reinterpret_cast<const serialportlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("serialportlib", SERIALPORTLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (ginuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __PRETTY_FUNCTION__);
    return;
  }
  --ginuse;
  if (ginuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return;
  }
  //Start shutting down library
  gshuttingdown=1;

  //Finished using the serial port library
  if (serialportlibifaceptr) {
    serialportlibifaceptr->shutdown();
  }
  gshuttingdown=0;

  //Free allocated memory
  for (auto& it : gtizigbeedevices) {
    if (it.second.receivebuf) {
      delete[] it.second.receivebuf;
      it.second.receivebuf=nullptr;
    }
  }
  gtizigbeedevices.clear();
  if (gnewtizigbee.receivebuf) {
    delete[] gnewtizigbee.receivebuf;
    gnewtizigbee.receivebuf=nullptr;
  }
  sem_destroy(&gmainthreadsleepsem);

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&gmutex);
  pthread_mutex_destroy(&gmutex_waitforresponse);
  pthread_mutex_destroy(&gmutex_detectingdevice);
  pthread_mutex_destroy(&gmutex_initnewtizigbee);

  pthread_mutexattr_destroy(&gerrorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Register all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void register_listeners(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=reinterpret_cast<const serialportlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("serialportlib", SERIALPORTLIBINTERFACE_VER_1));
  const cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=reinterpret_cast<const cmdserverlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("cmdserverlib", CMDSERVERLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  //if (cmdserverlibifaceptr) {
  //  cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(processcommand);
  //}
  if (serialportlibifaceptr) {
    serialportlibifaceptr->register_serial_handler(&gdevicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Unregister all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void unregister_listeners(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=reinterpret_cast<const serialportlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("serialportlib", SERIALPORTLIBINTERFACE_VER_1));
  const cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=reinterpret_cast<const cmdserverlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("cmdserverlib", CMDSERVERLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  //if (cmdserverlibifaceptr) {
  //  cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(processcommand);
  //}
  if (serialportlibifaceptr) {
    serialportlibifaceptr->unregister_serial_handler(&gdevicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

} //End of namespace

//C Exports
extern "C" {

extern moduleinfo_ver_generic_t *tizigbeelib_getmoduleinfo();

}

extern moduleinfo_ver_generic_t *tizigbeelib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &tizigbeelib::gmoduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_TIZigBeeLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) tizigbeelib_getmoduleinfo();
}
#endif
