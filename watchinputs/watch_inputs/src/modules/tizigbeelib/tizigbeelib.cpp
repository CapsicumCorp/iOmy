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

Baud rate seems to be ignored on the TI Z-Stack firmware as it uses cdc_acm usb interface

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

static const int PACKET_TIMEOUT=10; //How long to wait for a response from a device

static const uint8_t API_START_BYTE=0xFE;

// The dongle will automatically pickup a random, not conflicting PAN ID
static const uint16_t AUTO_PANID = 0xffff;

class tizigbeedevice_t {
public:
  char removed=0; //This device has been removed so is free to be reused by a new device
  char needtoremove=0; //This device has been scheduled for removal so functions should stop using it
  long inuse=0; //This device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  int serdevidx=-1;
  int (*sendFuncptr)(int serdevidx, const void *buf, size_t count)=nullptr;
  int zigbeelibindex=-1;
  int haendpoint=HA_ENDPOINTID;
  int haendpointregistered=0; //1=The HA Endpoint has been registered with the Zigbee library
  //pthread_mutex_t sendmutex; //Locked when we a thread is using the send buffer
  std::array<unsigned char, BUFFER_SIZE> receivebuf;
  int receivebufcnt=0; //Number of bytes currently being used in the receive buffer

  //Provided by SYS_PING
  uint16_t capabilities=0;

  //Provided by version request
  uint8_t transportrev=0;
  uint8_t product=0;
  uint8_t firmmaj=0; //Firmware version
  uint8_t firmmin=0;
  uint8_t hwrev=0;

  uint8_t network_state=ZDO_STARTUP_STATUS::DEV_HOLD; //Current Network State: See ZDO_STARTUP_STATUS

  uint8_t join_mode_state=JOIN_MODE_STATE::ENABLED; //TI Firmware defaults to enabled so matched it here at startup

  uint8_t device_type=0; //Device Type: 0=Coordinator, 1=Router, 2=End Device
  bool zcl_cluster_registered=false; //True=ZCL Clusters have been registered
  bool zdo_cluster_registered=false; //True=ZDO Clusters have been registered
  uint8_t zdo_zigbee_startup_status=0; //0=Inited with existing network, 1=Inited with new or reset network, 2=Init failed, else unknown

  uint8_t channel=0;
  uint16_t netaddr=0;
  uint16_t panid=0;
  uint64_t extpanid=0;
  uint64_t addr=0; //64-bit IEEE address of the device

  std::array<uint8_t, 16> networkKey;
  bool distributeNetworkKey=false; //True=Distribute network key in clear

  uint8_t waitingforresponse=0; //Set to 1 every time we send a remote Zigbee packet via this device
  uint8_t needreinit=0; //We have scheduled full reinitialisation of this device
                      //1=Init as Coordinator
                      //2=Init as Router
                      //3=Init as Non-Sleepy End Device
                      //4=Init as Sleepy End Device

  //Form network variables
  bool needFormNetwork=false; //True=A form network request has been scheduled
  uint32_t formNetworkChanMask=0x0; //The channel mask to use when forming the network
  uint8_t write_config_status=0;

  uint8_t reportingsupported=0; //>= 1.5.3 supports attribute reports
  uint8_t manureportingsupported=0; //>= 1.5.6 supports manufacturer attribute reports

  //Zigby data
  bool waiting_for_response=false;
  uint8_t last_packetsendtype=0;
  time_t last_packetsendtime=0; //The timestamp of the last time a ZDO or ZCL packet was sent
  uint16_t last_packet_netaddr=0x0000;
  uint16_t last_packet_cluster=0x0000;
  uint8_t last_packet_seqnumber=0;

  //These variables need to carry across calls to the receive function
  uint8_t receive_processing_packet=0, receive_escapechar=0;
  uint8_t receive_checksum=0;
  uint8_t receive_packetlength=0;

  int waiting_for_remotestatus=-1; //-1=Not waiting, other values may indicate the frameid we're waiting for
  int waiting_for_remotequeueidx=0; //Index if the item in the send queue of the packet we are waiting for a response from

  tizigbeedevice_t() {
    receivebuf.fill(0);
    networkKey.fill(0);
  };
};


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
static WAITING_FOR gwaitingforresponse=WAITING_FOR::NOTHING; //Set to one of the TIZIGBEE_WAITING_FOR_ types when the waiting for a response semaphore is being used
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
static int marktizigbee_inuse(void *localzigbeedevice, long *localzigbeelocked);
static int marktizigbee_notinuse(void *localzigbeedevice, long *UNUSED(localzigbeelocked));
static int connected_to_network(void *localzigbeedevice, long *tizigbeelocked);
static void send_zigbee_zdo(void *localzigbeedevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked);
static void send_zigbee_zcl(void *localzigbeedevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked);
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

static zigbeelib_localzigbeedevice_iface_ver_1_t gtizigbeelib_localzigbeedevice_iface_ver_1={
  .modulename="tizigbeelib",
  marktizigbee_inuse,
  marktizigbee_notinuse,
  nullptr,
  nullptr,
  send_zigbee_zdo,
  send_zigbee_zcl,
  nullptr,
  nullptr,
  nullptr,
  connected_to_network
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

static int marktizigbee_inuse(void *localzigbeedevice, long *UNUSED(localzigbeelocked)) {
  return marktizigbee_inuse(*reinterpret_cast<tizigbeedevice_t *>(localzigbeedevice));
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

static int marktizigbee_notinuse(void *localzigbeedevice, long *UNUSED(localzigbeelocked)) {
  return marktizigbee_notinuse(*reinterpret_cast<tizigbeedevice_t *>(localzigbeedevice));
}

//Check if the TI Zigbee module is connected to a network
//Returns 1 if connected or 0 if not
static int connected_to_network(void *localzigbeedevice, long *tizigbeelocked) {
  tizigbeedevice_t& tizigbeedevice=*reinterpret_cast<tizigbeedevice_t *>(localzigbeedevice);
  int val;
  uint8_t network_state;

  locktizigbee();
  network_state=tizigbeedevice.network_state;
  unlocktizigbee();

  if (network_state!=ZDO_STARTUP_STATUS::DEV_ZB_COORD && network_state!=ZDO_STARTUP_STATUS::DEV_ROUTER && network_state!=ZDO_STARTUP_STATUS::DEV_END_DEVICE) {
    val=0;
  } else {
    val=1;
  }
  return val;
}

/*
  Return a string for the TI Zigbee device type value
  Args: device_type The device type value
*/
static const char *get_device_type_string(uint8_t device_type) {
  const char *devtypestr;

  switch (device_type) {
    case 0:
      devtypestr="Coordinator";
      break;
    case 1:
      devtypestr="Router";
      break;
    case 2:
      devtypestr="End Device";
      break;
    case 0xFF:
    default:
      devtypestr="Unknown";
      break;
  }
  return devtypestr;
}

//==================
//Protocol Functions
//==================

static uint8_t gzigbee_seqnumber=0;

static uint8_t zigbee_get_next_seqnumber() {
  uint8_t val;

  locktizigbee();
  val=gzigbee_seqnumber++;
  if (gzigbee_seqnumber==128) {
    gzigbee_seqnumber=0;
  }
  unlocktizigbee();

  return val;
}

static unsigned char zigbee_get_seqnumber() {
  uint8_t val;

  locktizigbee();
  val=gzigbee_seqnumber;
  unlocktizigbee();

  return val;
}

static void zigbee_set_seqnumber(uint8_t zigbee_seqnumber) {
  uint8_t val;

  locktizigbee();
  gzigbee_seqnumber=zigbee_seqnumber;
  unlocktizigbee();
}

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

#ifdef TIZIGBEELIB_MOREDEBUG
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
#endif
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
    std::array<char,1024> tmpstr;

    tmpstr[0]=0;
    for (unsigned i=0; i<sendbuf.size(); i++) {
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
        cmd 16-bit command id
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

/*
  Send a TI Zigbee simple command with a single byte parameter
  Some TI Zigbee commands only consist of the command id so this function handles those
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to send the serial data
        cmd 16-bit command id
        param1 8-bit parameter
*/
static void send_tizigbee_simple_command(tizigbeedevice_t& tizigbeedevice, uint16_t cmd, uint8_t param1) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_api_header_t apicmd;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With Command: %04" PRIX16 "\n", __PRETTY_FUNCTION__, pthread_self(), cmd);
#endif
  //Fill in the packet details and send the packet
  apicmd.cmd=htons(cmd);
  apicmd.length=1;
  apicmd.payload=param1;
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a TI Zigbee simple command with a single 16-bit LSB, MSB parameter
  Some TI Zigbee commands only consist of the command id so this function handles those
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to send the serial data
        cmd 16-bit command id
        param1 8-bit parameter
*/
static void send_tizigbee_simple_command(tizigbeedevice_t& tizigbeedevice, uint16_t cmd, uint16_t param1) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_api_header_with_16bit_param_t apicmd;

#ifdef TIZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With Command: %04" PRIX16 "\n", __PRETTY_FUNCTION__, pthread_self(), cmd);
#endif
  //Fill in the packet details and send the packet
  apicmd.cmd=htons(cmd);
  apicmd.length=2;
  apicmd.param1=htole16(param1);
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
  send_tizigbee_simple_command(tizigbeedevice, SYS_RESET, reset_type);
}

void send_tizigbee_zb_get_device_info(tizigbeedevice_t& tizigbeedevice, uint8_t devinfotype) {
  send_tizigbee_simple_command(tizigbeedevice, ZB_GET_DEVICE_INFO, devinfotype);
}

void send_tizigbee_zb_read_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid) {
  send_tizigbee_simple_command(tizigbeedevice, ZB_READ_CONFIGURATION, configid);
}

static void send_tizigbee_zdo_msg_cb_register(tizigbeedevice_t& tizigbeedevice, uint16_t cluster) {
  send_tizigbee_simple_command(tizigbeedevice, ZDO_MSG_CB_REGISTER, cluster);
}

static void send_tizigbee_zdo_startup_from_app(tizigbeedevice_t& tizigbeedevice, uint16_t start_delay) {
  send_tizigbee_simple_command(tizigbeedevice, ZDO_STARTUP_FROM_APP, start_delay);
}

//Just fixed register set at the moment
static void send_tizigbee_af_register(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_af_register_t *apicmd;
  zigbee_zdo_node_clusters_t *zigbeeclusters;

  MOREDEBUG_ENTERINGFUNC();

  uint8_t numiclusters=0;
  uint8_t numoclusters=0;
  uint16_t iclusters[0], oclusters[0];

  //Allocate ram for the request as the packet size is dynamic
  try {
    apicmd=reinterpret_cast<tizigbee_af_register_t *>(new uint8_t[sizeof(tizigbee_af_register_t)+numiclusters*2+1+numoclusters*2+1-1]);
  } catch (std::bad_alloc& e) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the packet details and send the packet
  apicmd->cmd=htons(AF_REGISTER);
  apicmd->length=sizeof(tizigbee_af_register_t)+1+numiclusters*2+1+numoclusters*2-1-5;
  apicmd->endpoint=HA_ENDPOINTID;
  apicmd->profileid=ZIGBEE_HOME_AUTOMATION_PROFILE;
  apicmd->devid=ZIGBEE_DEVICEID_HA_COMBINED_INTERFACE;
  apicmd->devver=1;
  apicmd->zero=0;

  zigbeeclusters=reinterpret_cast<zigbee_zdo_node_clusters_t *>(&(apicmd->clusterlist));
  zigbeeclusters->numclusters=numiclusters;
  for (int i=0; i<numiclusters; ++i) {
    zigbeeclusters->clusters[i]=htole16(iclusters[i]);
  }
  //Step the the location for the output cluster id list
  zigbeeclusters=reinterpret_cast<zigbee_zdo_node_clusters_t *>(((uint8_t *) zigbeeclusters)+1+numiclusters*2);

  zigbeeclusters->numclusters=numoclusters;
  for (int i=0; i<numoclusters; ++i) {
    zigbeeclusters->clusters[i]=htole16(oclusters[i]);
  }

  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(apicmd));

  delete[] apicmd;

  MOREDEBUG_EXITINGFUNC();
}

//Using function overloading for different non-array value sizes
static void send_tizigbee_zb_write_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint8_t value) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_req_8bit_t apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_WRITE_CONFIGURATION);
  apicmd.length=sizeof(tizigbee_zb_write_configuration_req_8bit_t)-5;
  apicmd.configid=configid;
  apicmd.value=value;
  apicmd.vallen=sizeof(apicmd.value);
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}
static void send_tizigbee_zb_write_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint16_t value) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_req_16bit_t apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_WRITE_CONFIGURATION);
  apicmd.length=sizeof(tizigbee_zb_write_configuration_req_16bit_t)-5;
  apicmd.configid=configid;
  apicmd.value=htole16(value);
  apicmd.vallen=sizeof(apicmd.value);
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}
static void send_tizigbee_zb_write_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint32_t value) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_req_32bit_t apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_WRITE_CONFIGURATION);
  apicmd.length=sizeof(tizigbee_zb_write_configuration_req_32bit_t)-5;
  apicmd.configid=configid;
  apicmd.value=htole32(value);
  apicmd.vallen=sizeof(apicmd.value);
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}
static void send_tizigbee_zb_write_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint64_t value) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_req_64bit_t apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_WRITE_CONFIGURATION);
  apicmd.length=sizeof(tizigbee_zb_write_configuration_req_64bit_t)-5;
  apicmd.configid=configid;
  apicmd.value=htole64(value);
  apicmd.vallen=sizeof(apicmd.value);
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}
static void send_tizigbee_zb_write_configuration(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint8_t value[8]) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_req_8byte_t apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZB_WRITE_CONFIGURATION);
  apicmd.length=sizeof(tizigbee_zb_write_configuration_req_8byte_t)-5;
  apicmd.configid=configid;
  memcpy(apicmd.value, value, 8);
  apicmd.vallen=sizeof(apicmd.value);
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  MOREDEBUG_EXITINGFUNC();
}

static void zdo_disable_zigbee_join_mode(tizigbeedevice_t& tizigbeedevice) {
  tizigbee_zdo_mgmt_permit_join_req_t apicmd;

  //Fill in the packet details and send the packet
  apicmd.cmd=htons(ZDO_MGMT_PERMIT_JOIN_REQ);
  apicmd.length=sizeof(tizigbee_zdo_mgmt_permit_join_req_t)-5;
  apicmd.addrmode=0x02;
  apicmd.netaddr=tizigbeedevice.netaddr;
  apicmd.duration=0; //0 = join disabled.  0xff = join enabled. 0x01-0xfe = number of seconds to permit joining
  apicmd.trust_center_significance=0;
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(&apicmd));

  locktizigbee();
  tizigbeedevice.join_mode_state=JOIN_MODE_STATE::DISABLED;
  unlocktizigbee();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a TI Zigbee Zigbee ZDO
  Arguments:
    localzigbeedevice A pointer to tizigbeedevice structure used to send the serial data
    zmdcmd The ZDO packet to send
    expect_response: 1=Ask for a response from the remote device, 0=Don't wait for a response from the remote device
    rxonidle: 0=The device we are sending to is sleepy so increase timeouts if possible, 1=The device we are sending to is not sleepy
*/
static void send_zigbee_zdo(void *localzigbeedevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  tizigbeedevice_t& tizigbeedevice=*reinterpret_cast<tizigbeedevice_t *>(localzigbeedevice);
  tizigbee_zdo_send_data_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Allocate ram for the request as the packet size is dynamic
  try {
    apicmd=reinterpret_cast<tizigbee_zdo_send_data_t *>(new uint8_t[sizeof(tizigbee_zdo_send_data_t)+zdocmd->zigbeelength-1]);
  } catch (std::bad_alloc& e) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the packet details and send the packet
  apicmd->cmd=htons(ZDO_SEND_DATA);
  apicmd->length=sizeof(tizigbee_zdo_send_data_t)+zdocmd->zigbeelength-1-5;
  apicmd->destnetaddr=zdocmd->netaddr;
  apicmd->seqnumber=zigbee_get_next_seqnumber();
  apicmd->clusterid=zdocmd->clusterid;
  apicmd->zigbeelength=zdocmd->zigbeelength;
  memcpy(&apicmd->zigbeepayload, &zdocmd->zigbeepayload, zdocmd->zigbeelength);

  locktizigbee();
  int zigbeelibindex=tizigbeedevice.zigbeelibindex;
  if (expect_response) {
    tizigbeedevice.waiting_for_response=true;
  }
  struct timespec curtime;
  clock_gettime(CLOCK_REALTIME, &curtime);
  tizigbeedevice.last_packetsendtype=ZIGBEE_ZIGBEE_ZDO;
  tizigbeedevice.last_packet_netaddr=apicmd->destnetaddr;
  tizigbeedevice.last_packet_cluster=apicmd->clusterid;
  tizigbeedevice.last_packet_seqnumber=apicmd->seqnumber;
  tizigbeedevice.last_packetsendtime=curtime.tv_sec;
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;
    zigbeelibifaceptr->process_zdo_seqnumber(zigbeelibindex, zdocmd->netaddr, apicmd->seqnumber, &tizigbeelocked, &zigbeelocked);
  }
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(apicmd));

  delete[] apicmd;

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a TI Zigbee Zigbee ZCL
  Arguments:
    localzigbeedevice A pointer to tizigbeedevice structure used to send the serial data
    zmdcmd The ZCL packet to send
    expect_response: 1=Ask for a response from the remote device, 0=Don't wait for a response from the remote device
    rxonidle: 0=The device we are sending to is sleepy so increase timeouts if possible, 1=The device we are sending to is not sleepy
*/
static void send_zigbee_zcl(void *localzigbeedevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=static_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=static_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  tizigbeedevice_t& tizigbeedevice=*static_cast<tizigbeedevice_t *>(localzigbeedevice);
  tizigbee_af_data_request_t *apicmd;
  tizigbee_zcl_general_request_t *tizclcmd;
  tizigbee_zcl_general_request_with_manu_t *tizclcmdwithmanu;

  MOREDEBUG_ENTERINGFUNC();

  //Allocate ram for the request as the packet size is dynamic
  try {
    apicmd=reinterpret_cast<tizigbee_af_data_request_t *>(new uint8_t[sizeof(tizigbee_af_data_request_t)+sizeof(tizigbee_zcl_general_request_with_manu_t)+zclcmd->zigbeelength-2]);
  } catch (std::bad_alloc& e) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee ZCL Len=%d, Zigbee ZCL Len=%d\n", __PRETTY_FUNCTION__, sizeof(tizigbee_af_data_request_t)+sizeof(tizigbee_zcl_general_request_with_manu_t)+zclcmd->zigbeelength-2, zclcmd->zigbeelength);

  tizclcmd=reinterpret_cast<tizigbee_zcl_general_request_t *>(&apicmd->zigbeepayload);
  tizclcmdwithmanu=reinterpret_cast<tizigbee_zcl_general_request_with_manu_t *>(&apicmd->zigbeepayload);

  //Fill in the packet details and send the packet
  apicmd->cmd=htons(AF_DATA_REQUEST);
  apicmd->netaddr=zclcmd->netaddr;
  apicmd->destendpoint=zclcmd->destendpnt;
  apicmd->srcendpoint=zclcmd->srcendpnt;
  apicmd->clusterid=zclcmd->clusterid;
  apicmd->seqnumber=zigbee_get_next_seqnumber();
  apicmd->options=0;
  apicmd->radius=0x1E;
  apicmd->zigbeelength=sizeof(tizigbee_zcl_general_request_t)+zclcmd->zigbeelength-1;

  if ((zclcmd->frame_control & 0x4)!=0x4) {
    apicmd->length=sizeof(tizigbee_af_data_request_t)+sizeof(tizigbee_zcl_general_request_t)+zclcmd->zigbeelength-2-5;
    tizclcmd->frame_control=zclcmd->frame_control;
    tizclcmd->seqnumber=zigbee_get_seqnumber()-1;
    tizclcmd->cmdid=zclcmd->cmdid;
    memcpy(&tizclcmd->zigbeepayload, &zclcmd->zigbeepayload, zclcmd->zigbeelength);
  } else {
    apicmd->length=sizeof(tizigbee_af_data_request_t)+sizeof(tizigbee_zcl_general_request_with_manu_t)+zclcmd->zigbeelength-2-5;
    tizclcmdwithmanu->frame_control=zclcmd->frame_control;
    tizclcmdwithmanu->manu=zclcmd->manu;
    tizclcmdwithmanu->seqnumber=zigbee_get_seqnumber()-1;
    tizclcmdwithmanu->cmdid=zclcmd->cmdid;
    memcpy(&tizclcmdwithmanu->zigbeepayload, &zclcmd->zigbeepayload, zclcmd->zigbeelength);
  }
  locktizigbee();
  int zigbeelibindex=tizigbeedevice.zigbeelibindex;
  if (expect_response) {
    tizigbeedevice.waiting_for_response=true;
  }
  struct timespec curtime;
  clock_gettime(CLOCK_REALTIME, &curtime);
  tizigbeedevice.last_packetsendtype=ZIGBEE_ZIGBEE_ZCL_GENERAL;
  tizigbeedevice.last_packet_netaddr=apicmd->netaddr;
  tizigbeedevice.last_packet_cluster=apicmd->clusterid;
  tizigbeedevice.last_packet_seqnumber=apicmd->seqnumber;
  tizigbeedevice.last_packetsendtime=curtime.tv_sec;
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;
    zigbeelibifaceptr->process_zcl_seqnumber(zigbeelibindex, zclcmd->netaddr, apicmd->seqnumber, &tizigbeelocked, &zigbeelocked);
  }
  __tizigbee_send_api_packet(tizigbeedevice, reinterpret_cast<uint8_t *>(apicmd));

  delete[] apicmd;

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee Sys Ping Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_sys_ping_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_sys_ping_response_t *apicmd=reinterpret_cast<tizigbee_sys_ping_response_t *>(tizigbeedevice.receivebuf.data());

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::SYS_PING_RESPONSE) {
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
  tizigbee_sys_version_response_t *apicmd=reinterpret_cast<tizigbee_sys_version_response_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::SYS_VERSION_RESPONSE) {
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
  tizigbee_sys_reset_response_t *apicmd=reinterpret_cast<tizigbee_sys_reset_response_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::SYS_RESET_RESPONSE) {
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
  tizigbee_zb_get_device_info_response_t *apicmd=reinterpret_cast<tizigbee_zb_get_device_info_response_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ZB_DEVICE_INFO_RESPONSE) {
    gwaitresult=1;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Device Info Response:\n", __PRETTY_FUNCTION__);
  switch (apicmd->devinfotype) {
    case DEV_INFO_TYPE::IEEE_ADDR:
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      tizigbeedevice.addr=apicmd->devinfo.uval64bit;
      debuglibifaceptr->debuglib_printf(1, "%s: IEEE Addr: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    case DEV_INFO_TYPE::PARENT_IEEE_ADDR:
      //NOTE: Not storing this at the moment as it would only be relevant for end devices or routers not coordinators
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      debuglibifaceptr->debuglib_printf(1, "%s: Parent IEEE Addr: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    case DEV_INFO_TYPE::CHANNEL:
      tizigbeedevice.channel=apicmd->devinfo.uval8bit;
      debuglibifaceptr->debuglib_printf(1, "%s: Channel: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval8bit);
      break;
    case DEV_INFO_TYPE::EXT_PAN_ID:
      apicmd->devinfo.uval64bit=le64toh(apicmd->devinfo.uval64bit);
      tizigbeedevice.extpanid=apicmd->devinfo.uval64bit;
      debuglibifaceptr->debuglib_printf(1, "%s: Extended Pan ID: 0x%016" PRIX64 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval64bit);
      break;
    case DEV_INFO_TYPE::PAN_ID:
      apicmd->devinfo.uval16bit=le16toh(apicmd->devinfo.uval16bit);
      tizigbeedevice.panid=apicmd->devinfo.uval16bit;
      debuglibifaceptr->debuglib_printf(1, "%s: Pan ID: 0x%04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval16bit);
      break;
    case DEV_INFO_TYPE::SHORT_ADDR:
      apicmd->devinfo.uval16bit=le16toh(apicmd->devinfo.uval16bit);
      tizigbeedevice.netaddr=apicmd->devinfo.uval16bit;
      debuglibifaceptr->debuglib_printf(1, "%s: Network Address: 0x%04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval16bit);
      break;
    case DEV_INFO_TYPE::PARENT_SHORT_ADDR:
      //NOTE: Not storing this at the moment as it would only be relevant for end devices or routers not coordinators
      apicmd->devinfo.uval16bit=le16toh(apicmd->devinfo.uval16bit);
      debuglibifaceptr->debuglib_printf(1, "%s: Parent Network Address: 0x%04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval16bit);
      break;
    case DEV_INFO_TYPE::STATE:
      //NOTE: Not storing this at the moment as we don't know what it means
      debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee State: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->devinfo.uval8bit);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Unknown info type: %" PRId8 "\n", __PRETTY_FUNCTION__);
  }
  unlocktizigbee();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB Read Configuration Response Network Mode
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_read_configuration_response_nv_logical_type(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_read_configuration_response_nv_logical_type_t *apicmd=reinterpret_cast<tizigbee_zb_read_configuration_response_nv_logical_type_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  tizigbeedevice.device_type=apicmd->NetworkMode;
  debuglibifaceptr->debuglib_printf(1, "%s:   Network Mode=%s\n", __PRETTY_FUNCTION__, get_device_type_string(apicmd->NetworkMode));
}

/*
  Process a TI Zigbee ZB Read Configuration Response Network Key
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_read_configuration_response_nv_precfgkey(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_read_configuration_response_nv_precfgkey_t *apicmd=reinterpret_cast<tizigbee_zb_read_configuration_response_nv_precfgkey_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  memcpy(tizigbeedevice.networkKey.data(), apicmd->networkKey, sizeof(tizigbeedevice.networkKey));

  std::string strtmp="0x";
  for (unsigned i=0; i<tizigbeedevice.networkKey.size(); i++) {
    char hextmp[3];
    sprintf(hextmp, "%02" PRIX8, apicmd->networkKey[i]);
    strtmp+=hextmp;
  }
  debuglibifaceptr->debuglib_printf(1, "%s:   Network Key=%s\n", __PRETTY_FUNCTION__, strtmp.c_str());
}

/*
  Process a TI Zigbee ZB Read Configuration Response Distribute Network Key
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_read_configuration_response_nv_precfgkeys_enable(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_read_configuration_response_nv_precfgkeys_enable_t *apicmd=reinterpret_cast<tizigbee_zb_read_configuration_response_nv_precfgkeys_enable_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  if (apicmd->distributeNetworkKey==1) {
    tizigbeedevice.distributeNetworkKey=true;
    debuglibifaceptr->debuglib_printf(1, "%s:   Network Key will be not be distributed in the clear\n", __PRETTY_FUNCTION__);
  } else {
    tizigbeedevice.distributeNetworkKey=false;
    debuglibifaceptr->debuglib_printf(1, "%s:   Network Key will be distributed in the clear\n", __PRETTY_FUNCTION__);
  }
}

/*
  Process a TI Zigbee ZB Read Configuration Response Security Mode
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_read_configuration_response_nv_security_mode(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_read_configuration_response_nv_security_mode_t *apicmd=reinterpret_cast<tizigbee_zb_read_configuration_response_nv_security_mode_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  debuglibifaceptr->debuglib_printf(1, "%s:   Security Mode: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->securityMode);
}

/*
  Process a TI Zigbee ZB Read Configuration Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_read_configuration_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_read_configuration_response_t *apicmd=reinterpret_cast<tizigbee_zb_read_configuration_response_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ZB_READ_CONFIG_RESPONSE) {
    gwaitresult=1;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Read Configuration Response:\n", __PRETTY_FUNCTION__);
  if (apicmd->status!=0) {
    debuglibifaceptr->debuglib_printf(1, "%s:   Failed to read configuration: %02" PRIX8 "\n", __PRETTY_FUNCTION__, apicmd->status);
    unlocktizigbee();
    return;
  }
  switch (apicmd->configid) {
    case CONFIG_ID::ZCD_NV_LOGICAL_TYPE:
      process_zb_read_configuration_response_nv_logical_type(tizigbeedevice);
      break;
    case CONFIG_ID::ZCD_NV_PRECFGKEY:
      process_zb_read_configuration_response_nv_precfgkey(tizigbeedevice);
      break;
    case CONFIG_ID::ZCD_NV_PRECFGKEYS_ENABLE:
      process_zb_read_configuration_response_nv_precfgkeys_enable(tizigbeedevice);
      break;
    case CONFIG_ID::ZCD_NV_SECURITY_MODE:
      process_zb_read_configuration_response_nv_security_mode(tizigbeedevice);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s:   Unhandled config id: %02" PRIX8 "\n", __PRETTY_FUNCTION__, apicmd->configid);
  }
  //NOTE: We unlock down here so callers waiting for the response don't start acting on the result until the full result has been handled
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB Write Configuration Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zb_write_configuration_response(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zb_write_configuration_response_t *apicmd=reinterpret_cast<tizigbee_zb_write_configuration_response_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE) {
    gwaitresult=1;
  }
  tizigbeedevice.write_config_status=apicmd->status;
  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee Write Configuration Response:\n", __PRETTY_FUNCTION__);
  if (apicmd->status!=0) {
    debuglibifaceptr->debuglib_printf(1, "%s:   Failed to write configuration: %02" PRIX8 "\n", __PRETTY_FUNCTION__, apicmd->status);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s:   Success\n", __PRETTY_FUNCTION__);
  }
  //NOTE: We unlock down here so callers waiting for the response don't start acting on the result until the full result has been handled
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee AF Register System Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_af_register_srsp(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_generic_srsp_t *apicmd=reinterpret_cast<tizigbee_zdo_generic_srsp_t *>(tizigbeedevice.receivebuf.data());

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::AF_REGISTER_SRESPONSE) {
    gwaitresult=1;
  }
  if (apicmd->status==SUCCESS || apicmd->status==ZApsDuplicateEntry) {
    tizigbeedevice.zcl_cluster_registered=true;
  } else {
    tizigbeedevice.zcl_cluster_registered=false;
  }
  //NOTE: We unlock down here so callers waiting for the response don't start acting on the result until the full result has been handled
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Message CB Register System Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_msg_cb_register_srsp(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_generic_srsp_t *apicmd=reinterpret_cast<tizigbee_zdo_generic_srsp_t *>(tizigbeedevice.receivebuf.data());

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ZDO_MSG_CB_REGISTER_SRESPONSE) {
    gwaitresult=1;
  }
  if (apicmd->status==0) {
    tizigbeedevice.zdo_cluster_registered=true;
  } else {
    tizigbeedevice.zdo_cluster_registered=false;
  }
  //NOTE: We unlock down here so callers waiting for the response don't start acting on the result until the full result has been handled
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Startup From App Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_startup_from_app_srsp(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_generic_srsp_t *apicmd=reinterpret_cast<tizigbee_zdo_generic_srsp_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ZDO_STARTUP_FROM_APP_SRESPONSE) {
    gwaitresult=1;
  }
  tizigbeedevice.zdo_zigbee_startup_status=apicmd->status;

  //NOTE: We unlock down here so callers waiting for the response don't start acting on the result until the full result has been handled
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "%s: Status from Zigbee Startup:\n", __PRETTY_FUNCTION__);
  switch (apicmd->status) {
    case 0:
      debuglibifaceptr->debuglib_printf(1, "%s:   Initialized ZigBee network with existing network state\n", __PRETTY_FUNCTION__);
      break;
    case 1:
      debuglibifaceptr->debuglib_printf(1, "%s:   Initialized ZigBee network with new or reset network state\n", __PRETTY_FUNCTION__);
      break;
    case 2:
      debuglibifaceptr->debuglib_printf(1, "%s:   Initializing ZigBee network failed\n", __PRETTY_FUNCTION__);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Unexpected response state for ZDO_STARTUP_FROM_APP: %" PRId8 "\n", __PRETTY_FUNCTION__, apicmd->status);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Generic Status Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_generic_srsp(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_generic_srsp_t *apicmd=reinterpret_cast<tizigbee_zdo_generic_srsp_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  int zigbeelibindex;

  MOREDEBUG_ENTERINGFUNC();

  if (apicmd->status!=SUCCESS) {
    debuglibifaceptr->debuglib_printf(1, "%s: Error: 0x%02" PRIX8 " for ZDO TI Command: 0x%" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->status, apicmd->cmd & 0x3FFF);
  }
  locktizigbee();
  zigbeelibindex=tizigbeedevice.zigbeelibindex;
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;
    zigbeelibifaceptr->process_zdo_send_status(zigbeelibindex, apicmd->status, nullptr, &tizigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO State Change Indication
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_state_change_ind(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_state_change_ind_t *apicmd=reinterpret_cast<tizigbee_zdo_state_change_ind_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();
  tizigbeedevice.network_state=apicmd->status;
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "%s: Received a ZDO State Change Indication with status: %02" PRIX8 "\n", __PRETTY_FUNCTION__, apicmd->status);

  if (apicmd->status==ZDO_STARTUP_STATUS::DEV_ZB_COORD || apicmd->status==ZDO_STARTUP_STATUS::DEV_ROUTER || apicmd->status==ZDO_STARTUP_STATUS::DEV_END_DEVICE) {
    //Wakeup the main thread as the TI is ready for Zigbee now
    sem_post(&gmainthreadsleepsem);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Leaving Indication
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_leave_ind(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_leave_ind_t *apicmd=reinterpret_cast<tizigbee_zdo_leave_ind_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();

  debuglibifaceptr->debuglib_printf(1, "%s: Received a ZDO Leaving Indication with Zigbee IEEE Address: %016" PRIX64 " and Network Address: %04" PRIX16 " from Network Address: %04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->addr, apicmd->srcnetaddr, apicmd->netaddr);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Trust Center End Device Announce Indication
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_tc_device_ind(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_tc_device_ind_t *apicmd=reinterpret_cast<tizigbee_zdo_tc_device_ind_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();

  debuglibifaceptr->debuglib_printf(1, "%s: Received a ZDO Trust Center Device Announce Indication with Zigbee IEEE Address: %016" PRIX64 " and Network Address: %04" PRIX16 " from Network Address: %04" PRIX16 "\n", __PRETTY_FUNCTION__, apicmd->addr, apicmd->srcnetaddr, apicmd->netaddr);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Permit Join Indication
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
  NOTE: Not much is known about this response from TI firmware apart from it always returns value: 0 when
    the temp join timer expires
*/
static void process_zdo_permit_join_ind(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  tizigbee_zdo_permit_join_ind_t *apicmd=reinterpret_cast<tizigbee_zdo_permit_join_ind_t *>(tizigbeedevice.receivebuf.data());
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();

  debuglibifaceptr->debuglib_printf(1, "%s: Temp Join is no longer enabled\n", __PRETTY_FUNCTION__);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZB ZDO Message CB Incoming Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_msg_cb_incoming(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  tizigbee_zdo_msg_cb_incoming_t *apicmd=reinterpret_cast<tizigbee_zdo_msg_cb_incoming_t *>(tizigbeedevice.receivebuf.data());
  zigbee_zdo_response_header_t *zdocmd;
  int zigbeelibindex;
  uint16_t srcnetaddr, clusterid, profileid;
  uint8_t seqnumber;
  uint8_t zigbeelength;

  MOREDEBUG_ENTERINGFUNC();

  //debuglibifaceptr->debuglib_printf(1, "%s: Received Response Source Netaddr: %04" PRIX16 ", Was Broadcast: %d, clusterid: %04" PRIX16 " securityuse: %d, Sequence Number: %02" PRIX8 " Dest NetAddr: %04" PRIX16 "\n", __PRETTY_FUNCTION__, le16toh(apicmd->srcnetaddr), apicmd->wasBroadcast, le16toh(apicmd->clusterid), apicmd->securityUse, apicmd->seqnumber, le16toh(apicmd->destnetaddr));

  zdocmd=(zigbee_zdo_response_header_t *) &apicmd->srcnetaddr;

  srcnetaddr=le16toh(apicmd->srcnetaddr);
  clusterid=le16toh(apicmd->clusterid);
  profileid=ZIGBEE_ZDO_PROFILE; //ZDO packets are always in the ZDO profile
  zigbeelength=apicmd->length-8;
  seqnumber=apicmd->seqnumber;

  //Copy the zigbee payload into the generic Zigbee ZDO Response structure
  memmove(&(zdocmd->status), &(apicmd->status), zigbeelength);

  //Now copy the remaining values
  zdocmd->srcnetaddr=srcnetaddr;
  zdocmd->clusterid=clusterid;
  zdocmd->profileid=profileid;
  zdocmd->zigbeelength=zigbeelength;
  zdocmd->seqnumber=seqnumber;

  locktizigbee();
  zigbeelibindex=tizigbeedevice.zigbeelibindex;
  uint16_t netaddr=tizigbeedevice.netaddr;
  tizigbeedevice.waiting_for_response=false;
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;

    zigbeelibifaceptr->process_zdo_response_received(zigbeelibindex, zdocmd, &tizigbeelocked, &zigbeelocked);
  }

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee AF Incoming Message Response
  Args: tizigbeedevice A reference to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_af_incoming_msg(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=static_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=static_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  tizigbee_af_incoming_msg_t *apicmd=reinterpret_cast<tizigbee_af_incoming_msg_t *>(tizigbeedevice.receivebuf.data());
  tizigbee_zcl_general_request_t *tizclcmd;
  tizigbee_zcl_general_request_with_manu_t *tizclcmdwithmanu;
  zigbee_zcl_command_with_manu_t *zclcmd;
  int zigbeelibindex;

  MOREDEBUG_ENTERINGFUNC();

  //debuglibifaceptr->debuglib_printf(1, "%s: Received Response Source Netaddr: %04" PRIX16 ", Was Broadcast: %d, clusterid: %04" PRIX16 " securityuse: %d, Sequence Number: %02" PRIX8 " Dest NetAddr: %04" PRIX16 "\n", __PRETTY_FUNCTION__, le16toh(apicmd->srcnetaddr), apicmd->wasBroadcast, le16toh(apicmd->clusterid), apicmd->securityUse, apicmd->seqnumber, le16toh(apicmd->destnetaddr));

  //Allocate ram for the request as the packet size is dynamic
  tizclcmd=reinterpret_cast<tizigbee_zcl_general_request_t *>(&apicmd->zigbeepayload);
  tizclcmdwithmanu=reinterpret_cast<tizigbee_zcl_general_request_with_manu_t *>(&apicmd->zigbeepayload);

  uint8_t zcllen;
  uint8_t zclzigbeelen;
  if ((tizclcmd->frame_control & 0x4)!=0x4) {
    //NOTE: The last 3 zigbee payload bytes seem to be srcnetaddr and an unknown byte value
    zclzigbeelen=apicmd->zigbeelength-3;
    zcllen=sizeof(zigbee_zcl_command_with_manu_t)+zclzigbeelen-1;
  } else {
    //NOTE: The last 3 zigbee payload bytes seem to be srcnetaddr and an unknown byte value
    zclzigbeelen=apicmd->zigbeelength-2-3;
    zcllen=sizeof(zigbee_zcl_command_with_manu_t)+zclzigbeelen-1;
  }
  try {
    zclcmd=reinterpret_cast<zigbee_zcl_command_with_manu_t *>(new uint8_t[zcllen]);
  } catch (std::bad_alloc& e) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  zclcmd->srcnetaddr=le16toh(apicmd->srcnetaddr);
  zclcmd->srcendpnt=apicmd->srcendpoint;
  zclcmd->destendpnt=apicmd->destendpoint;
  zclcmd->clusterid=le16toh(apicmd->clusterid);
  zclcmd->frame_control=tizclcmd->frame_control;
  zclcmd->zigbeelength=zclzigbeelen;
  if ((tizclcmd->frame_control & 0x4)!=0x4) {
    zclcmd->manu=0; //Some zigbee functions may get confused if manu isn't set to 0 when not being used
    zclcmd->seqnumber=tizclcmd->seqnumber;
    zclcmd->cmdid=tizclcmd->cmdid;
    memcpy(&zclcmd->zigbeepayload, &tizclcmd->zigbeepayload, zclzigbeelen);
  } else {
    zclcmd->manu=tizclcmdwithmanu->manu;
    zclcmd->seqnumber=tizclcmdwithmanu->seqnumber;
    zclcmd->cmdid=tizclcmdwithmanu->cmdid;
    memcpy(&zclcmd->zigbeepayload, &tizclcmdwithmanu->zigbeepayload, zclzigbeelen);
  }
  locktizigbee();
  zigbeelibindex=tizigbeedevice.zigbeelibindex;
  tizigbeedevice.waiting_for_response=false;
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;

    zigbeelibifaceptr->process_zcl_response_received(zigbeelibindex, zclcmd, &tizigbeelocked, &zigbeelocked);
  }
  delete[] zclcmd;

  MOREDEBUG_EXITINGFUNC();
}




/*
  Process a TI Zigbee ZDO Send Status
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zdo_send_status(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  const tizigbee_zdo_generic_srsp_t *apicmd=reinterpret_cast<const tizigbee_zdo_generic_srsp_t *>(tizigbeedevice.receivebuf.data());

  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();
  int zigbeelibindex=tizigbeedevice.zigbeelibindex;
  if (apicmd->status!=0) {
    tizigbeedevice.waiting_for_response=false;
  }
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;

    //Need to subtract one here as the sequence number was incremented after sending the packet
    uint8_t seqnumber=zigbee_get_seqnumber()-1;

    zigbeelibifaceptr->process_zdo_send_status(zigbeelibindex, apicmd->status, &seqnumber, &tizigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee ZCL Send Status
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_zcl_send_status(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=static_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  const tizigbee_af_data_srsp_t *apicmd=reinterpret_cast<const tizigbee_af_data_srsp_t *>(tizigbeedevice.receivebuf.data());

  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();
  int zigbeelibindex=tizigbeedevice.zigbeelibindex;
  if (apicmd->status!=0) {
    tizigbeedevice.waiting_for_response=false;
  }
  unlocktizigbee();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;

    //Need to subtract one here as the sequence number was incremented after sending the packet
    uint8_t seqnumber=zigbee_get_seqnumber()-1;

    zigbeelibifaceptr->process_zcl_send_status(zigbeelibindex, apicmd->status, &seqnumber, &tizigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a TI Zigbee Response Timeout
  Args: tizigbeedevice A pointer to tizigbeedevice structure used to store info about the tizigbee device including the receive buffer containing the packet
*/
static void process_response_timeout(tizigbeedevice_t& tizigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=static_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=static_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));

  MOREDEBUG_ENTERINGFUNC();

  locktizigbee();
  int zigbeelibindex=tizigbeedevice.zigbeelibindex;
  uint8_t packet_type=tizigbeedevice.last_packetsendtype;
  uint16_t destnetaddr=tizigbeedevice.last_packet_netaddr;
  uint16_t cluster=tizigbeedevice.last_packet_cluster;
  uint8_t seqnumber=tizigbeedevice.last_packet_seqnumber;
  tizigbeedevice.waiting_for_response=false;
  unlocktizigbee();

  if (packet_type==ZIGBEE_ZIGBEE_ZDO) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received ZDO Timeout for destination: %04hX, Cluster: %04hX, Sequence Number: %02hhX\n", __func__, destnetaddr, cluster, seqnumber);
  } else if (packet_type==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received ZCL Timeout for destination: %04hX, Cluster: %04hX, Sequence Number: %02hhX\n", __func__, destnetaddr, cluster, seqnumber);
  }
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;

    if (packet_type==ZIGBEE_ZIGBEE_ZDO) {
      zigbeelibifaceptr->process_zdo_response_timeout(zigbeelibindex, destnetaddr, cluster, &seqnumber, &tizigbeelocked, &zigbeelocked);
    } else if (packet_type==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
      zigbeelibifaceptr->process_zcl_response_timeout(zigbeelibindex, destnetaddr, cluster, &seqnumber, &tizigbeelocked, &zigbeelocked);
    }
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
  apicmd=reinterpret_cast<tizigbee_api_response_t *>(tizigbeedevice.receivebuf.data());

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
    case ZB_READ_CONFIGURATION_RESPONSE:
      process_zb_read_configuration_response(tizigbeedevice);
      break;
    case ZB_WRITE_CONFIGURATION_RESPONSE:
      process_zb_write_configuration_response(tizigbeedevice);
      break;
    case AF_REGISTER_SRSP:
      process_af_register_srsp(tizigbeedevice);
      break;
    case ZDO_MSG_CB_REGISTER_SRSP:
      process_zdo_msg_cb_register_srsp(tizigbeedevice);
      break;
    case ZDO_STARTUP_FROM_APP_SRSP:
      process_zdo_startup_from_app_srsp(tizigbeedevice);
      break;
    case ZDO_IEEE_ADDR_REQ_SRSP:
    case ZDO_MATCH_DESC_REQ_SRSP:
    case ZDO_MGMT_LQI_REQ_SRSP:
    case ZDO_MGMT_PERMIT_JOIN_REQ_SRSP:
      process_zdo_generic_srsp(tizigbeedevice);
      break;
    case ZDO_STATE_CHANGE_IND:
      process_zdo_state_change_ind(tizigbeedevice);
      break;
    case ZDO_SRC_RTG_IND:
      //TODO: Implement displaying info for this
      break;
    case ZDO_LEAVE_IND:
      process_zdo_leave_ind(tizigbeedevice);
      break;
    case ZDO_TC_DEVICE_IND:
      process_zdo_tc_device_ind(tizigbeedevice);
      break;
    case ZDO_PERMIT_JOIN_IND:
      process_zdo_permit_join_ind(tizigbeedevice);
      break;
    case ZDO_MSG_CB_INCOMING:
      process_zdo_msg_cb_incoming(tizigbeedevice);
      break;
    case ZDO_IEEE_ADDR_RSP:
    case ZDO_MATCH_DESC_RSP:
    case ZDO_MGMT_LQI_RSP:
    case ZDO_MGMT_PERMIT_JOIN_RSP:
    case ZDO_SEND_DATA_SRSP:
      process_zdo_send_status(tizigbeedevice);
      break;
    case ZDO_END_DEVICE_ANNCE_IND:
      //Do nothing
      break;
    case AF_DATA_SRSP:
      process_zcl_send_status(tizigbeedevice);
      break;
    case AF_DATA_CONFIRM:
      //Just use generic send status for now
      process_zcl_send_status(tizigbeedevice);
      break;
    case AF_INCOMING_MSG:
      process_af_incoming_msg(tizigbeedevice);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Received Unknown TI Zigbee packet: 0x%04" PRIX16 " with length: %d\n", __PRETTY_FUNCTION__, apicmd->cmd, apicmd->length);
  }
  locktizigbee();
  if (gwaitingforresponse==WAITING_FOR::ANYTHING) {
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

#ifdef TIZIGBEELIB_MOREDEBUG
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
#endif


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

/*
  Find a tizigbee device in the tizigbee table
  Arguments:
    tizigbeedevice A pointer to tizigbeedevice structure associated with the device
    addr: The 64-bit destination IEEE address of the device
  Returns the index of the tizigbee device or -1 if not found
*/
static int find_tizigbee_device(uint64_t addr) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i, match_found=-1;

  MOREDEBUG_ENTERINGFUNC();
  locktizigbee();
  std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeit;
  for (tizigbeeit=gtizigbeedevices.begin(); tizigbeeit!=gtizigbeedevices.end(); ++tizigbeeit) {
    if (tizigbeeit->second.addr==addr && !tizigbeeit->second.removed && !tizigbeeit->second.needtoremove) {
      match_found=tizigbeeit->first;
      break;
    }
  }
  unlocktizigbee();
  MOREDEBUG_EXITINGFUNC();

  return match_found;
}

//Initialise gnewtizigbee values
//When we copy gnewtizigbee to the tizigbee list, the zigbeedevices pointer will be used by that tizigbee element
//  so we shouldn't free it here just set it back to NULL.
static void _init_newtizigbee(void) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  MOREDEBUG_ENTERINGFUNC();

  //Wait for other threads to finish using gnewtizigbee first
  PTHREAD_LOCK(&gmutex_initnewtizigbee);

  gnewtizigbee=tizigbeedevice_t();

  PTHREAD_UNLOCK(&gmutex_initnewtizigbee);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Initialise a semaphore for waiting for a response to a packet
  Also applies the waitforresponse pthread lock
  Send your packet after calling this function and then call waitforresponse
  Returns negative value on error or >= 0 on success
*/
static int initwaitforresponse(WAITING_FOR waitingforresponseid) {
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
  gwaitingforresponse=WAITING_FOR::NOTHING;
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

//Get TI Zigbee device info within a wait
//Returns true on success, or false on error
static bool tizigbee_zb_get_device_info_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t devinfotype) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_DEVICE_INFO_RESPONSE);
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

//Read TI Zigbee Configuration within a wait
//Returns true on success, or false on error
static bool tizigbee_zb_read_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_READ_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_read_configuration(tizigbeedevice, configid);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}

//Write TI Zigbee Configuration within a wait
//Returns true on success, or false on error
static bool tizigbee_zb_write_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint8_t value) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_write_configuration(tizigbeedevice, configid, value);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}
static bool tizigbee_zb_write_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint16_t value) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_write_configuration(tizigbeedevice, configid, value);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}
static bool tizigbee_zb_write_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint32_t value) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_write_configuration(tizigbeedevice, configid, value);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}
static bool tizigbee_zb_write_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint64_t value) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_write_configuration(tizigbeedevice, configid, value);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
}
static bool tizigbee_zb_write_configuration_with_wait(tizigbeedevice_t& tizigbeedevice, uint8_t configid, uint8_t value[8]) {
  int result;

  result=initwaitforresponse(WAITING_FOR::ZB_WRITE_CONFIG_RESPONSE);
  if (result<0) {
    return false;
  }
  send_tizigbee_zb_write_configuration(tizigbeedevice, configid, value);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    return false;
  }
  return true;
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
    result=initwaitforresponse(WAITING_FOR::SYS_PING_RESPONSE);
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

      result=initwaitforresponse(WAITING_FOR::SYS_RESET_RESPONSE);
      if (result<0) {
        debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
        return -1;
      }
      send_tizigbee_sys_reset(gnewtizigbee, RESET_TYPE::SERIAL_BOOTLOADER);

      //Wait 4 seconds for the result
      result=waitforresponse(4);
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
  result=initwaitforresponse(WAITING_FOR::SYS_PING_RESPONSE);
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
  result=initwaitforresponse(WAITING_FOR::SYS_VERSION_RESPONSE);
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
  //Get IEEE device address
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::IEEE_ADDR)) {
    return -1;
  }
  {
    uint8_t firmmaj, firmmin, hwrev; //TI Zigbee Firmware version
    uint64_t addr;

    locktizigbee();
    firmmaj=tizigbeedevice.firmmaj;
    firmmin=tizigbeedevice.firmmin;
    hwrev=tizigbeedevice.hwrev;
    addr=tizigbeedevice.addr;

    //NOTE: Always do full reinit at startup so we get an updated view of the device config
    tizigbeedevice.needreinit=1;

    unlocktizigbee();

    debuglibifaceptr->debuglib_printf(1, "%s: Firmware Version: %" PRId8".%" PRId8 "\n", __PRETTY_FUNCTION__, firmmaj, firmmin);
    debuglibifaceptr->debuglib_printf(1, "%s:   Hardware Revision: %" PRId8 "\n", __PRETTY_FUNCTION__, hwrev);
    debuglibifaceptr->debuglib_printf(1, "%s: 64-bit Network Address=%016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
  }

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
  //debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Storing in slot: %" PRId16 "\n", __PRETTY_FUNCTION__, list_numitems);

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

  //debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Num TI Zigbee Devices=%d\n", __PRETTY_FUNCTION__, gtizigbeedevices.size());

  //Wakeup the main thread to refresh info about this device
  sem_post(&gmainthreadsleepsem);

  unlocktizigbee();

  PTHREAD_UNLOCK(&gmutex_detectingdevice);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return list_numitems;
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int processcommand(const char *buffer, int clientsock) {
  const commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=reinterpret_cast<const commonserverlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("commonserverlib", DEBUGLIBINTERFACE_VER_1));
  char tmpstrbuf[100];
  int i, len, found;
  uint64_t addr;
  long tizigbeelocked=0;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();
  len=strlen(buffer);
  if (strncmp(buffer, "tizigbee_form_network ", 22)==0 && len>=38) {
    //Format: tizigbee_form_network <64-bit addr>
    sscanf(buffer+22, "%016llX", (unsigned long long *) &addr);
    locktizigbee();

    found=find_tizigbee_device(addr);
    if (found>=0) {
      gtizigbeedevices[found].needFormNetwork=true;
      gtizigbeedevices[found].formNetworkChanMask=ZIGBEE_CHANMASK_STANDARD;

      //Wakeup the main thread to form a new network
      sem_post(&gmainthreadsleepsem);

      unlocktizigbee();
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      unlocktizigbee();
      sprintf(tmpstrbuf, "TIZIGBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "tizigbee_form_network_netvoxchan ", 33)==0 && len>=49) {
    //Format: tizigbee_form_network <64-bit addr>
    sscanf(buffer+33, "%016llX", (unsigned long long *) &addr);
    locktizigbee();
    found=find_tizigbee_device(addr);
    if (found>=0) {
      gtizigbeedevices[found].needFormNetwork=true;
      gtizigbeedevices[found].formNetworkChanMask=ZIGBEE_CHANMASK_NETVOX;

      //Wakeup the main thread to form a new network
      sem_post(&gmainthreadsleepsem);

      unlocktizigbee();
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      unlocktizigbee();
      sprintf(tmpstrbuf, "TIZIGBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } /*else if (strncmp(buffer, "tizigbee_leave_network ", 23)==0 && len>=39) {
    //Format: tizigbee_leave_network <64-bit addr>
    sscanf(buffer+23, "%016llX", (unsigned long long *) &addr);
    locktizigbee();
    found=find_tizigbee_device(addr);
    if (found>=0) {
      //TODO: Implement
      //tizigbee_leave_zigbee_network(gtizigbeedevices[found]);
      unlocktizigbee();
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      unlocktizigbee();
      sprintf(tmpstrbuf, "TIZIGBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  }*/ else if (strncmp(buffer, "get_tizigbee_info", 17)==0) {
    int found=0;

    //Format: get_tizigbee_info
    locktizigbee();
    std::map<int16_t, tizigbeedevice_t>::iterator tizigbeeit;
    for (tizigbeeit=gtizigbeedevices.begin(); tizigbeeit!=gtizigbeedevices.end(); ++tizigbeeit) {
      uint8_t capabilities;
      uint8_t firmmaj, firmmin, transportrev, product, hwrev;
      uint8_t device_type, startup_status, channel;
      uint16_t netaddr, panid;
      uint64_t extpanid, addr;
      char needtoremove;
      const char *startup_statusstr="Unknown";
      bool needFormNetwork;
      uint32_t formNetworkChanMask;

      if (tizigbeeit->second.removed) {
        continue;
      } else {
        found=1;
      }
      needtoremove=tizigbeeit->second.needtoremove;
      capabilities=tizigbeeit->second.capabilities;
      transportrev=tizigbeeit->second.transportrev;
      product=tizigbeeit->second.product;
      firmmaj=tizigbeeit->second.firmmaj;
      firmmin=tizigbeeit->second.firmmin;
      hwrev=tizigbeeit->second.hwrev;
      device_type=tizigbeeit->second.device_type;
      startup_status=tizigbeeit->second.zdo_zigbee_startup_status;
      channel=tizigbeeit->second.channel;
      netaddr=tizigbeeit->second.netaddr;
      panid=tizigbeeit->second.panid;
      extpanid=tizigbeeit->second.extpanid;
      addr=tizigbeeit->second.addr;

      needFormNetwork=tizigbeeit->second.needFormNetwork;
      formNetworkChanMask=tizigbeeit->second.formNetworkChanMask;

      switch (startup_status) {
        case 0:
          startup_statusstr="Inited with existing network";
          break;
        case 1:
          startup_statusstr="Inited with new or reset network";
          break;
        case 2:
          startup_statusstr="Init failed";
          break;
      }
      sprintf(tmpstrbuf, "TIZIGBEE ADDRESS: %016" PRIX64 " : %04" PRIX16 "\n", addr, netaddr);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      if (needtoremove) {
        sprintf(tmpstrbuf, "  Scheduled to be removed\n");
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
      sprintf(tmpstrbuf, "  Firmware Version=%" PRId8 ".%" PRId8 ", HWRev=%" PRId8 "\n", firmmaj, firmmin, hwrev);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      commonserverlibifaceptr->serverlib_netputs("  Device Type=", clientsock, NULL);
      commonserverlibifaceptr->serverlib_netputs(get_device_type_string(device_type), clientsock, NULL);
      sprintf(tmpstrbuf, "\n  Startup Status: %s", startup_statusstr);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "\n  Channel=%02" PRIX8 "\n", channel);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Pan ID=%04" PRIX16 "\n", panid);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Extended Pan ID=%016" PRIX64 "\n", extpanid);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      if (needFormNetwork) {
        switch (formNetworkChanMask) {
          case ZIGBEE_CHANMASK_STANDARD:
            sprintf(tmpstrbuf, "  Form New Zigbee Network has been scheduled with standard channel mask\n");
            break;
          case ZIGBEE_CHANMASK_NETVOX:
            sprintf(tmpstrbuf, "  Form New Zigbee Network has been scheduled with Network channel mask\n");
            break;
          default:
            sprintf(tmpstrbuf, "  Form New Zigbee Network has been scheduled with channel mask: %08" PRIX16 "\n", formNetworkChanMask);
            break;
        }
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
    }
    if (!found) {
      commonserverlibifaceptr->serverlib_netputs("NO TIZIGBEE DEVICES FOUND\n", clientsock, NULL);
    }
    unlocktizigbee();
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return CMDLISTENER_NOERROR;
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
    debuglibifaceptr->debuglib_printf(1, "%s: Marking TI Zigbee %016" PRIX64 " at index: %" PRId16 " for removal\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first);
    tizigbeedeviceptr->needtoremove=1;
  }
  if (tizigbeedeviceptr->zigbeelibindex>=0 && zigbeelibifaceptr) {
    long tizigbeelocked=0, zigbeelocked=0;
    result=zigbeelibifaceptr->remove_localzigbeedevice(tizigbeedeviceptr->zigbeelibindex, &tizigbeelocked, &zigbeelocked);
    if (result==0) {
      //Still in use so we can't cleanup yet
      debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " is still in use: %ld by Zigbee so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first, tizigbeedeviceptr->inuse);
      unlocktizigbee();

      MOREDEBUG_EXITINGFUNC();
      return 0;
    }
  }
  if (tizigbeedeviceptr->inuse) {
    //Still in use so we can't cleanup yet
    debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " is still in use: %ld so it cannot be fully removed yet\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, tizigbeeit->first, tizigbeedeviceptr->inuse);
    unlocktizigbee();

    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  //Remove the TI Zigbee from ram
  index=tizigbeeit->first; //So we can refer to the index later on

  //We can remove the TI Zigbee as it isn't in use
  debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee %016" PRIX64 " at index: %" PRId16 " has now been removed\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr, index);

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

//Form a new Zigbee network on a TI Zigbee device
//NOTE: Leaves extended pan id and network key as chip defined
static void doFormNetwork(tizigbeedevice_t& tizigbeedevice, uint32_t formNetworkChanMask) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result;
  uint64_t addr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  //NOTE: We keep need form network set until form network succeeds as sometimes it doesn't fully complete the first time
  locktizigbee();
  addr=tizigbeedevice.addr;
  unlocktizigbee();

  //First clear configuration and state
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_STARTUP_OPTION, (uint8_t) (STARTOPT::CLEAR_CONFIG | STARTOPT::CLEAR_STATE))) {
    return;
  }
  //0=Coordinator
  //TODO: Add support for Router mode
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_LOGICAL_TYPE, (uint8_t) 0)) {
    return;
  }

  // A dongle reset is needed to put into effect
  // configuration clear and network mode.
  result=initwaitforresponse(WAITING_FOR::SYS_RESET_RESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  send_tizigbee_sys_reset(gnewtizigbee, RESET_TYPE::SERIAL_BOOTLOADER);

  //Wait 2 seconds for the result
  result=waitforresponse(4);
  if (result<0) {
    //We didn't get a response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  //Set Channel Mask
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_CHANLIST, formNetworkChanMask)) {
    return;
  }
  //Set Pan Id
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_PANID, AUTO_PANID)) {
    return;
  }
  //Set Pre Config Key to true ; Z-Stack Developer guide says FALSE means key only needs to be on Coordinator
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_PRECFGKEYS_ENABLE, (uint8_t) 0)) {
    return;
  }
  //Set Security Mode to 1
  if (!tizigbee_zb_write_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_SECURITY_MODE, (uint8_t) 4)) {
    return;
  }

  //Need reinit as the network has changed
  locktizigbee();
  tizigbeedevice.needreinit=1;
  tizigbeedevice.needFormNetwork=false;
  tizigbeedevice.network_state=ZDO_STARTUP_STATUS::DEV_HOLD;
  tizigbeedevice.join_mode_state=JOIN_MODE_STATE::ENABLED;
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//Initialise a TI Zigbee device with device info
static void doreinit(tizigbeedevice_t& tizigbeedevice) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  int result;
  uint64_t addr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  locktizigbee();
  addr=tizigbeedevice.addr;
  unlocktizigbee();

  //Start the Zigbee Network
  result=initwaitforresponse(WAITING_FOR::AF_REGISTER_SRESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  send_tizigbee_af_register(tizigbeedevice);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  locktizigbee();
  bool zcl_cluster_registered=tizigbeedevice.zcl_cluster_registered;
  unlocktizigbee();
  if (zcl_cluster_registered) {
    debuglibifaceptr->debuglib_printf(1, "%s: ZCL Clusters Registered for TI Zigbee: %016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to register ZCL Clusters for TI Zigbee: %016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
    return;
  }

  result=initwaitforresponse(WAITING_FOR::ZDO_MSG_CB_REGISTER_SRESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  send_tizigbee_zdo_msg_cb_register(tizigbeedevice, 0xFFFF);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  locktizigbee();
  bool zdo_cluster_registered=tizigbeedevice.zdo_cluster_registered;
  unlocktizigbee();
  if (zdo_cluster_registered) {
    debuglibifaceptr->debuglib_printf(1, "%s: ZDO Clusters Registered for TI Zigbee: %016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to register ZDO Clusters for TI Zigbee: %016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
    return;
  }
  result=initwaitforresponse(WAITING_FOR::ZDO_STARTUP_FROM_APP_SRESPONSE);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }
  send_tizigbee_zdo_startup_from_app(tizigbeedevice, 0);

  //Wait 1 second for the result
  result=waitforresponse();
  if (result<0) {
    //We didn't get a response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __PRETTY_FUNCTION__, __LINE__);
    return;
  }

  locktizigbee();
  uint8_t zdo_zigbee_startup_status=tizigbeedevice.zdo_zigbee_startup_status;
  unlocktizigbee();
  if (zdo_zigbee_startup_status!=0 && zdo_zigbee_startup_status!=1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to initialise Zigbee Network for TI Zigbee: %016" PRIX64 "\n", __PRETTY_FUNCTION__, addr);
    return;
  }
  //Get all device info
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::CHANNEL)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::PAN_ID)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::EXT_PAN_ID)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::SHORT_ADDR)) {
    return;
  }
  if (!tizigbee_zb_get_device_info_with_wait(tizigbeedevice, DEV_INFO_TYPE::STATE)) {
    return;
  }
  if (!tizigbee_zb_read_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_LOGICAL_TYPE)) {
    return;
  }
  if (!tizigbee_zb_read_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_PRECFGKEYS_ENABLE)) {
    return;
  }
  if (!tizigbee_zb_read_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_PRECFGKEY)) {
    return;
  }
  if (!tizigbee_zb_read_configuration_with_wait(tizigbeedevice, CONFIG_ID::ZCD_NV_SECURITY_MODE)) {
    return;
  }
  //No longer need reinit if now fully configured
  locktizigbee();
  tizigbeedevice.needreinit=0;
  unlocktizigbee();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//Refresh data from tizigbee devices
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
static void refresh_tizigbee_data(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
  zigbeelib_localzigbeedevice_ver_1_t localzigbeedevice;
  int pos;
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
    uint8_t needreinit;
    bool needFormNetwork=false;
    uint32_t formNetworkChanMask;

    tizigbeedeviceptr=&tizigbeeit->second;
    if (marktizigbee_inuse(*tizigbeedeviceptr)<0) {
      //Unable to mark this rapidha for use
      continue;
    }
    //Check if need to form a new network on this TI Zigbee
    locktizigbee();
    needFormNetwork=tizigbeedeviceptr->needFormNetwork;
    formNetworkChanMask=tizigbeedeviceptr->formNetworkChanMask;
    unlocktizigbee();
    if (needFormNetwork) {
      doFormNetwork(*tizigbeedeviceptr, formNetworkChanMask);
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
        debuglibifaceptr->debuglib_printf(1, "%s: Removing cached list of ZigBee devices as TI Zigbee: %016" PRIX64 " needs to be reconfigured\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr);
        zigbeelibifaceptr->remove_all_zigbee_devices(zigbeelibindex, &tizigbeelocked, &zigbeelocked);
      }
      doreinit(*tizigbeedeviceptr);
      locktizigbee();
      needreinit=tizigbeedeviceptr->needreinit;
      unlocktizigbee();
      if (needreinit) {
        //Having problems configuring this TI Zigbee so go on to other devices
        debuglibifaceptr->debuglib_printf(1, "%s: ERROR: TI Zigbee: %016" PRIX64 " hasn't reinitialised properly\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr);
        marktizigbee_notinuse(*tizigbeedeviceptr);
        needmoreinfo=true;
        continue;
      }
    }
    locktizigbee();
    uint8_t network_state=tizigbeedeviceptr->network_state;
    unlocktizigbee();
    if (network_state!=ZDO_STARTUP_STATUS::DEV_ZB_COORD && network_state!=ZDO_STARTUP_STATUS::DEV_ROUTER && network_state!=ZDO_STARTUP_STATUS::DEV_END_DEVICE) {
      debuglibifaceptr->debuglib_printf(1, "%s: TI Zigbee: %016" PRIX64 " isn't fully started yet\n", __PRETTY_FUNCTION__, tizigbeedeviceptr->addr);
      marktizigbee_notinuse(*tizigbeedeviceptr);
      continue;
    }
    locktizigbee();

    //Make sure Temp Join mode is disabled as the TI Firmware defaults to always enabled
    if (tizigbeedeviceptr->join_mode_state==JOIN_MODE_STATE::ENABLED) {
      zdo_disable_zigbee_join_mode(*tizigbeedeviceptr);
    }
    localzigbeedevice.addr=tizigbeedeviceptr->addr;
    localzigbeedevice.deviceptr=tizigbeedeviceptr;
    if (tizigbeedeviceptr->zigbeelibindex<0 && zigbeelibifaceptr) {
      unsigned long long features=0;

      features|=ZIGBEE_FEATURE_RECEIVEREPORTPACKETS;
      features|=ZIGBEE_FEATURE_NOHACLUSTERS;
      tizigbeedeviceptr->zigbeelibindex=zigbeelibifaceptr->add_localzigbeedevice(&localzigbeedevice, &gtizigbeelib_localzigbeedevice_iface_ver_1, features, &tizigbeelocked, &zigbeelocked);
    }
    if (tizigbeedeviceptr->zigbeelibindex<0) {
      unlocktizigbee();
      marktizigbee_notinuse(*tizigbeedeviceptr);
      continue;
    }
    if (!tizigbeedeviceptr->haendpointregistered && zigbeelibifaceptr) {
      //Register the Home Automation endpoint id that we will be using
      int result=zigbeelibifaceptr->register_home_automation_endpointid(tizigbeedeviceptr->zigbeelibindex, tizigbeedeviceptr->haendpoint, &tizigbeelocked, &zigbeelocked);
      if (result==0) {
        tizigbeedeviceptr->haendpointregistered=1;
      }
    }
    unlocktizigbee();
    if (zigbeelibifaceptr) {
      //Check if the connected TI Zigbee module has been added as a Zigbee device
      pos=zigbeelibifaceptr->find_zigbee_device(tizigbeedeviceptr->zigbeelibindex, tizigbeedeviceptr->addr, tizigbeedeviceptr->netaddr, &tizigbeelocked, &zigbeelocked);
      if (pos==-1) {
        //TODO: Handle detection of sleepy TI Zigbee devices
        if (tizigbeedeviceptr->device_type<3) {
          //Non-Sleepy TI Zigbee Device
          zigbeelibifaceptr->add_zigbee_device(tizigbeedeviceptr->zigbeelibindex, tizigbeedeviceptr->addr, tizigbeedeviceptr->netaddr, tizigbeedeviceptr->device_type, 1, &tizigbeelocked, &zigbeelocked);
        }
      }
    }
    locktizigbee();
    bool waiting_for_response=tizigbeedeviceptr->waiting_for_response;
    time_t last_packetsendtime=tizigbeedeviceptr->last_packetsendtime;
    unlocktizigbee();
    if (waiting_for_response) {
      struct timespec curtime;
      clock_gettime(CLOCK_REALTIME, &curtime);
      if (last_packetsendtime+PACKET_TIMEOUT<curtime.tv_sec) {
        process_response_timeout(*tizigbeedeviceptr);
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
static void *mainloop(void *UNUSED(val)) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  struct timespec semwaittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);

    refresh_tizigbee_data();

    if (getneedtoquit()) {
      break;
    }
    //Only sleep for one second as we need to handle timeouts ourselves
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
    setneedmoreinfo(false);

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
  gtizigbeedevices.clear();
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

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(processcommand);
  }
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

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(processcommand);
  }
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
