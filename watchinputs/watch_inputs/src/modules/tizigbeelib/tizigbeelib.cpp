/*
Title: Texas Instruments Z-Stack Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with Texas Instruments Z-Stack modules
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

static const int MAX_DEVICES=10; //Maximum number of devices to allow

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
  uint8_t firmmaj; //Firmware version
  uint8_t firmmin;
  uint8_t firmbuild;
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
  uint16_t receive_checksum;
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
static std::map<int, tizigbeedevice_t> gtizigbeedevices; //A list of detected TI Zigbee devices

//Static Function Declarations

//Function Declarations
static void receiveraw(int UNUSED(serdevidx), int handlerdevidx, char *buffer, int bufcnt);
static int isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));
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
  nullptr
  //serial_device_removed
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
    lockcnt=new long[1];
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

//Send a TI Zigbee API packet
//packet size is start byte + len byte + 2 cmd bytes + data + checksum byte
//You allocate 1 additional byte for the checksum at the end when allocating your buffer
//The buffer should have the first 2 bytes skipped for this function to fill in and bufcnt+1 will also be filled in with the checksum
//  So your first buffer entry will be buffer+2
//TI Zigbee length and TI Zigbee header ids should be already set by the caller
static void __tizigbee_send_api_packet(tizigbeedevice_t& tizigbeedevice, unsigned char *sendbuf) {
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

  packetlen=apicmd->length+3; //Add start byte + len byte + 1 byte checksum after payload

  //Calculate Checksum : Sum of all but start and checksum byte
  checksum=0;
  for (i=1; i<packetlen-2; i++) {
    checksum=checksum ^ sendbuf[i]; //Checksum is XOR
  }
  sendbuf[packetlen-1]=checksum;

#ifdef TIZIGBEELIB_MOREDEBUG
  {
    int i;
    std::array<char,1024> tmpstr;

    tmpstr[0]=0;
    for (i=0; i<packetlen; i++) {
      sprintf(tmpstr.data()+strlen(tmpstr.data()), "%02hhX ", (uint8_t) sendbuf[i]);
      if (strlen(tmpstr.data()+5>1024) {
        //Abort if about to overflow the buffer
        break;
      }
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Sending bytes: %s, length=%d\n", __PRETTY_FUNCTION__, tmpstr.data(), packetlen);
  }
#endif
  //Now send the packet
  //NOTE: No need to lock as the sending function will lock around the send operation
  tizigbeedevice.sendFuncptr(tizigbeedevice.serdevidx, sendbuf, packetlen);
  marktizigbee_notinuse(tizigbeedevice);
  MOREDEBUG_EXITINGFUNC();
}







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
    debuglibifaceptr->debuglib_printf(1, "%s\n", tmpstr);
  }
//#endif

  marktizigbee_notinuse(*tizigbeedevice);
  if (tizigbeedevice==&gnewtizigbee) {
    PTHREAD_UNLOCK(&gmutex_initnewtizigbee);
  }
  MOREDEBUG_EXITINGFUNC();
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
static int waitforresponse() {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int result, lerrno;
  struct timespec waittime;

  MOREDEBUG_ENTERINGFUNC();

  //Wait 1 second for the result
  clock_gettime(CLOCK_REALTIME, &waittime);
  waittime.tv_sec+=TIZIGBEE_DETECT_TIMEOUT;
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
  A function used to check if the handler supports a serial device
  Returns the handler index if supported or -1 if not
  NOTE: It may take a few seconds for the auto detection to complete
*/
static int isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count)) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int i, detectresult, list_numitems;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  PTHREAD_LOCK(&gmutex_detectingdevice);

  //Initialise values before setting detectingdevice flag so the values don't change while receive is running
  _init_newtizigbee();
  gnewtizigbee.serdevidx=serdevidx;
  gnewtizigbee.sendFuncptr=sendFuncptr;

  setdetectingdevice(1);
  debuglibifaceptr->debuglib_printf(1, "%s: serial device index=%d\n", __PRETTY_FUNCTION__, serdevidx);

  //Reinit newtizigbee so ready for next new device
  _init_newtizigbee();

  PTHREAD_UNLOCK(&gmutex_detectingdevice);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return -1;
//  return list_numitems;
}







/*
  Main thread loop that manages initialisation, shutdown, and outgoing communication to the TI Zigbee devices
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *mainloop(void *val) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  time_t currenttime;
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);
    currenttime=semwaittime.tv_sec;

    //xbeelib_refresh_xbee_data();

    if (getneedtoquit()) {
      break;
    }
    //Sleep until the next second so enough time for Zigbee pulse monitoring
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
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
    gnewtizigbee.receivebuf=new unsigned char[BUFFER_SIZE];
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
