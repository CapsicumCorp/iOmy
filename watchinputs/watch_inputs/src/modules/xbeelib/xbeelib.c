/*
Title: Xbee Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with Digi Xbee modules
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

//NOTE: Only Xbee Coordinator Firmware has been well tested at the moment

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
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "xbeelib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/serialportlib/serialportlib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/zigbeelib/zigbeelib.h"

#ifdef DEBUG
#warning "XBEELIB_PTHREAD_LOCK and XBEELIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define XBEELIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    xbeelib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    xbeelib_backtrace(); \
  } \
}

#define XBEELIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    xbeelib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    xbeelib_backtrace(); \
  } \
}

#else

#define XBEELIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define XBEELIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef XBEELIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef XBEELIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef XBEELIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#ifdef XBEELIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef XBEELIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef XBEELIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef XBEELIB_MOREDEBUG
#define INLINE
#else
#define INLINE inline
#endif

//Types of packets that can be sent
#define XBEE_PACKETTYPE_AT 1
#define XBEE_PACKETTYPE_ZDO 2
#define XBEE_PACKETTYPE_ZCL 3

#define BUFFER_SIZE 256

#define MAX_XBEE_DEVICES 10 //Maximum number of xbee devices to allow

#define XBEE_DETECT_TIMEOUT 1 //Use 1 second timeout when detecting the Xbee device

#define XBEE_HA_ENDPOINTID 1 //Some Xbee devices don't implement an endpoint for home automation and rely on software for all the handling

#define XBEE_CONNECT_STATUS_POLL_INTERVAL 60 //Poll the connection info every 60 seconds

#define MAX_PACKETS_IN_TRANSIT 5

//This structure is used to keep track of packets that have been sent to a remote Zigbee device
//inuse will normally be set back to 0 if the reservation has been cancelled or the packet been received okay
typedef struct {
  char inuse; //0=This slot isn't being used, 1=This slot has been reserved for sending a packet
  char sent; //0=The packet hasn't been sent yet, 1=The packet has been sent
  uint8_t frameid; //The frameid used to send the packet
  pthread_t threadid; //The id of the thread that sent or will send the packet
  char waitingfortransmitstatus;
  char waitingforresponse; //1=We need to keep this packet reserved until a response from the device is received
  int packettype; //The type of packet being sent
  uint16_t destnetaddr; //The destination network address when sending this packet
  uint8_t destendpoint; //The destination endpoint when sending this packet
  uint16_t destcluster; //The destination cluster when sending this packet
  uint8_t seqnumber; //A responding packet will contain the same sequence number
} xbee_packets_intransit_t;

typedef struct {
  char removed; //This xbee device has been removed so is free to be reused by a new xbee device
  char needtoremove; //This xbee device has been scheduled for removal so functions should stop using it
  long inuse; //This xbee device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  int serdevidx;
  int (*sendFuncptr)(int serdevidx, const void *buf, size_t count);
  int zigbeelibindex;
  int haendpoint;
  int haendpointregistered; //1=The HA Endpoint has been registered with the Zigbee library
  unsigned char *receivebuf;
  int receivebufcnt; //Number of bytes currently being used in the receive buffer
  uint16_t firmver; //Xbee Firmware version
  uint16_t hwver; //Xbee Hardware Version
  uint64_t addr; //64-bit IEEE address of the xbee device
  uint8_t device_type; //Xbee Device Type: Coordinator, Router, or End Device

  time_t last_connect_status_refresh; //The last time the network connection status was polled
  uint8_t network_connected, prevnetwork_connected;

  //Values that depend on a connected network
  uint8_t encryptednetwork; //0=Not Encrypted, 1=Encrypted
  uint8_t channel;
  uint16_t netaddr;
  uint16_t panid;
  uint64_t extpanid;
  uint8_t prevencryptednetwork, prevchannel, prevnetaddr, prevpanid, prevextpanid;

  int have_network_status_values; //Set to 1 once all the network status values have been received
  int received_network_status_values; //A count of received network status values after xbeelib_get_xbee_network_status
                                      //  sends requests for updated values
  uint8_t xbee_frameid;
  uint8_t zigbee_seqnumber;

  //Zigby data
  int broadcastcount; //Number of times a broadcast has been sent
  time_t last_broadcasttime; //The timestamp of the last time the broadcast was sent

  xbee_packets_intransit_t xbee_packets_intransit[MAX_PACKETS_IN_TRANSIT];

  //These variables need to carry across calls to the xbee receive function
  uint8_t receive_checksum, receive_processing_packet, receive_escapechar;
  int receive_packetlength;
} xbeedevice_t;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

STATIC pthread_mutex_t xbeelibmutex;
static pthread_mutex_t xbeelibmutex_waitforresponse;
static pthread_mutex_t xbeelibmutex_detectingdevice;
static pthread_mutex_t xbeelibmutex_initnewxbee;
#else
static pthread_mutex_t xbeelibmutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t xbeelibmutex_waitforresponse = PTHREAD_MUTEX_INITIALIZER; //Locked when we are waiting for a response from an xbee device
static pthread_mutex_t xbeelibmutex_detectingdevice = PTHREAD_MUTEX_INITIALIZER; //Locked when we are detecting an xbee device
static pthread_mutex_t xbeelibmutex_initnewxbee = PTHREAD_MUTEX_INITIALIZER; //Locked when we want to re-initialise the newxbee structure so we wait for threads that are still using it
#endif

//xbeelib_waitingforresponse should only be set inside the locks: xbeelibmutex_waitforresponse and xbeelibmutex
//  It also should be set to a 0 while xbeelib_waitforresponsesem isn't valid
static sem_t xbeelib_waitforresponsesem; //This semaphore will be initialised when waiting for response
static int xbeelib_waitingforresponse; //Set to one of the XBEE_WAITING_FOR_ types when the waiting for a response semaphore is being used
static int xbeelib_waitresult; //Set to 1 if the receive function receives the response that was being waited for

//Used by the receive function to decide whether to use xbeelib_xbeedevices or xbeelib_newxbee
static int xbeelib_detectingdevice; //Set to 1 when a device is being detected

static sem_t xbeelib_mainthreadsleepsem; //Used for main thread sleeping

static int xbeelib_inuse=0; //Only shutdown when inuse = 0
static int xbeelib_shuttingdown=0;

STATIC char needtoquit=0; //Set to 1 when xbeelib should exit

static pthread_t xbeelib_mainthread=0;

static int xbeelib_numxbeedevices=0;
static xbeedevice_t xbeelib_newxbee; //Used for new xbee devices that haven't been fully detected yet
static xbeedevice_t *xbeelib_xbeedevices; //A list of detected xbee devices

//Function Declarations
STATIC int xbeelib_markxbee_inuse(xbeedevice_t *xbeedevice, long *xbeelocked);
STATIC int xbeelib_markxbee_notinuse(xbeedevice_t *xbeedevice, long *xbeelocked);
static inline void xbeelib_setneedtoquit(int val, long *xbeelocked);
static inline int xbeelib_getneedtoquit(long *xbeelocked);
int xbeelib_start(void);
void xbeelib_stop(void);
int xbeelib_init(void);
void xbeelib_shutdown(void);
void xbeelib_register_listeners(void);
void xbeelib_unregister_listeners(void);

int xbeelib_request_send_packet(xbeedevice_t *xbeedevice, long *xbeelocked);
int xbeelib_cancel_request_send_packet(xbeedevice_t *xbeedevice, long *xbeelocked);
void __xbeelib_send_zigbee_zdo(xbeedevice_t *xbeedevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *xbeelocked, long *zigbeelocked);
void __xbeelib_send_zigbee_zcl(xbeedevice_t *xbeedevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *xbeelocked, long *zigbeelocked);
void xbeelib_permit_join(void *localzigbeedevice, uint8_t duration, long *xbeelocked);

STATIC int xbeelib_xbee_connected_to_network(void *localzigbeedevice, long *xbeelocked);

void xbeelib_receiveraw(int serdevidx, int handlerdevidx, char *buffer, int bufcnt);
STATIC int xbeelib_initwaitforresponse(int waitingforresponseid, long *xbeelocked);
STATIC int xbeelib_waitforresponse(long *xbeelocked);
int xbeelib_isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));
int xbeelib_serial_device_removed(int serdevidx);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define SERIALPORTLIB_DEPIDX 1
#define COMMONSERVERLIB_DEPIDX 2
#define CMDSERVERLIB_DEPIDX 3
#define COMMONLIB_DEPIDX 4
#define ZIGBEELIB_DEPIDX 5

STATIC moduledep_ver_1_t xbeelib_deps[]={
  {
    .modulename="debuglib",
    .ifacever=DEBUGLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="serialportlib",
    .ifacever=SERIALPORTLIBINTERFACE_VER_1,
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
    .modulename="commonlib",
    .ifacever=COMMONLIBINTERFACE_VER_1,
    .required=1
  },
  {
    .modulename="zigbeelib",
    .ifacever=ZIGBEELIBINTERFACE_VER_1,
    .required=0
  },
  {
    .modulename=NULL
  }
};

static moduleinfo_ver_1_t xbeelib_moduleinfo_ver_1={
  .moduleinfover=MODULEINFO_VER_1,
  .modulename="xbeelib",
  .initfunc=xbeelib_init,
  .shutdownfunc=xbeelib_shutdown,
  .startfunc=xbeelib_start,
  .stopfunc=xbeelib_stop,
  .registerlistenersfunc=xbeelib_register_listeners,
  .unregisterlistenersfunc=xbeelib_unregister_listeners,
  .moduledeps=&xbeelib_deps
};

static serialdevicehandler_iface_ver_1_t xbeelib_devicehandler_iface_ver_1={
  .modulename="xbeelib",
  .isDeviceSupportedptr=xbeelib_isDeviceSupported,
  .receiveFuncptr=xbeelib_receiveraw,
  .serial_device_removed=xbeelib_serial_device_removed
};

static zigbeelib_localzigbeedevice_iface_ver_1_t xbeelib_localzigbeedevice_iface_ver_1={
  .modulename="xbeelib",
  .marklocalzigbeeha_inuse=xbeelib_markxbee_inuse,
  .marklocalzigbeeha_notinuse=xbeelib_markxbee_notinuse,
  .request_send_packet=xbeelib_request_send_packet,
  .cancel_request_send_packet=xbeelib_cancel_request_send_packet,
  .send_zigbee_zdo=__xbeelib_send_zigbee_zdo,
  .send_zigbee_zcl=__xbeelib_send_zigbee_zcl,
  .zigbee_permit_join=xbeelib_permit_join,
  .localzigbeedevice_connected_to_network=xbeelib_xbee_connected_to_network,
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void xbeelib_backtrace(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
static inline void xbeelib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

/*
  Apply the xbee mutex lock if not already applied otherwise increment the lock count
*/
STATIC void xbeelib_lockxbee(long *xbeelocked) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();

  LOCKDEBUG_ENTERINGFUNC();
  if ((*xbeelocked)==0) {
    //Lock the thread if not already locked
    XBEELIB_PTHREAD_LOCK(&xbeelibmutex);
  }
  //Increment the lock count
  ++(*xbeelocked);
#ifdef XBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *xbeelocked);
#endif
}

/*
  Decrement the lock count and if 0, release the xbee mutex lock
*/
STATIC void xbeelib_unlockxbee(long *xbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  LOCKDEBUG_ENTERINGFUNC();

  if ((*xbeelocked)==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    xbeelib_backtrace();
    return;
  }
  --(*xbeelocked);
  if ((*xbeelocked)==0) {
    //Lock the thread if not already locked
    XBEELIB_PTHREAD_UNLOCK(&xbeelibmutex);
  }
#ifdef XBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *xbeelocked);
#endif
}

/*
  Thread unsafe get the number of xbee devices
*/
static inline int _xbeelib_getnumxbeedevices(void) {
  return xbeelib_numxbeedevices;
}

/*
  Thread safe get the number of xbee devices
*/
static int xbeelib_getnumxbeedevices(long *xbeelocked) {
  int val;

  xbeelib_lockxbee(xbeelocked);
  val=_xbeelib_getnumxbeedevices();
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

/*
  Thread unsafe set the number of xbee devices
*/
static inline void _xbeelib_setnumxbeedevices(int numxbeedevices) {
  xbeelib_numxbeedevices=numxbeedevices;
}

/*
  Thread safe set the number of xbee devices
*/
static void xbeelib_setnumxbeedevices(int numxbeedevices) {
  long xbeelocked=0;

  xbeelib_lockxbee(&xbeelocked);
  _xbeelib_setnumxbeedevices(numxbeedevices);
  xbeelib_unlockxbee(&xbeelocked);
}

/*
  Thread unsafe get detecting device
*/
static inline int _xbeelib_getdetectingdevice() {
  return xbeelib_detectingdevice;
}

/*
  Thread safe get detecting device
*/
static int xbeelib_getdetectingdevice(long *xbeelocked) {
  int val;

  xbeelib_lockxbee(xbeelocked);
  val=_xbeelib_getdetectingdevice();
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

/*
  Thread unsafe set detecting device
*/
static inline void _xbeelib_setdetectingdevice(int detectingdevice) {
  xbeelib_detectingdevice=detectingdevice;
}

/*
  Thread safe set detecting device
*/
static void xbeelib_setdetectingdevice(int detectingdevice, long *xbeelocked) {
  xbeelib_lockxbee(xbeelocked);
  _xbeelib_setdetectingdevice(detectingdevice);
  xbeelib_unlockxbee(xbeelocked);
}

/*
  Thread safe mark a xbee device as in use
  Returns 0 on success or negative value on error
*/
STATIC int xbeelib_markxbee_inuse(xbeedevice_t *xbeedevice, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  xbeelib_lockxbee(xbeelocked);
  if (xbeedevice->removed || xbeedevice->needtoremove) {
    //This device shouldn't be used as it is either removed or is scheduled for removal
    xbeelib_unlockxbee(xbeelocked);

    return -1;
  }
  //Increment xbee inuse value
  ++(xbeedevice->inuse);
#ifdef XBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Xbee: %016llX now inuse: %d\n", __func__, pthread_self(), xbeedevice->addr, xbeedevice->inuse);
#endif

  xbeelib_unlockxbee(xbeelocked);

  return 0;
}

/*
  Thread safe mark a xbee device as not in use
  Returns 0 on success or negative value on error
*/
STATIC int xbeelib_markxbee_notinuse(xbeedevice_t *xbeedevice, long *xbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  xbeelib_lockxbee(xbeelocked);
  if (xbeedevice->removed) {
    //This device shouldn't be used as it is removed
    xbeelib_unlockxbee(xbeelocked);

    return -1;
  }
  if (!xbeedevice->inuse) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu INUSE MISMATCH TRIED TO MARK AS NOT IN USE WHEN INUSE COUNT IS 0\n", __func__, pthread_self());
    xbeelib_backtrace();
    xbeelib_unlockxbee(xbeelocked);
    return -2;
  }
  //Decrement xbee inuse value
  --(xbeedevice->inuse);

#ifdef XBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Xbee: %016llX now inuse: %d\n", __func__, pthread_self(), xbeedevice->addr, xbeedevice->inuse);
#endif
  xbeelib_unlockxbee(xbeelocked);

  return 0;
}

//Check if the Xbee module is connected to a network
//Returns 1 if connected or 0 if not
int xbeelib_xbee_connected_to_network(void *localzigbeedevice, long *xbeelocked) {
  xbeedevice_t *xbeedeviceptr=localzigbeedevice;
  int val;

  xbeelib_lockxbee(xbeelocked);

  val=xbeedeviceptr->network_connected;

  xbeelib_unlockxbee(xbeelocked);

  return val;
}

/*
  Return a string for the Xbee product family value
  Args: hwver The xbee Hardware Version value
*/
STATIC const char *xbeelib_get_product_family_string(uint16_t hwver) {
  const char *productfamily;

  if ((hwver & 0xFF00)==XBEE_DEVICE_HW_XBP24BZ7) {
    productfamily="XBP24BZ7";
  } else {
    productfamily="Unknown";
  }
  return productfamily;
}

/*
  Return a string for the Xbee firmware type value
  Args: firmver The xbee Firmware Version value
*/
STATIC const char *xbeelib_get_firmware_type_string(uint16_t firmver) {
  const char *firmwaretype;

  if ((firmver & 0xF000)==0x1000) {
    firmwaretype="ZNet";
  } else if ((firmver & 0xF000)==0x2000) {
    firmwaretype="Zigbee Home Automation Profile";
  } else if ((firmver & 0xF000)==0x3000) {
    firmwaretype="Zigbee Smart Energy Profile";
  } else {
    firmwaretype="Unknown";
  }
  return firmwaretype;
}

/*
  Return a string for the Xbee function set value
  Args: firmver The xbee Firmware Version value
*/
STATIC const char *xbeelib_get_function_set_string(uint16_t firmver) {
  const char *functionset;

  if ((firmver & 0xF000)==0x2000) {
    if ((firmver & 0x0F00)==0x0100) {
      functionset="Coordinator in API Mode";
    } else if ((firmver & 0x0F00)==0x0300) {
      functionset="Router in API Mode";
    } else if ((firmver & 0x0F00)==0x0900) {
      functionset="End Device in API Mode";
    } else if ((firmver & 0x0F00)==0x0C00) {
      functionset="End Device - LTH";
    } else if ((firmver & 0x0F00)==0x0000) {
      functionset="Coordinator in AT Mode";
    } else if ((firmver & 0x0F00)==0x0800) {
      functionset="End Device in AT Mode";
    } else if ((firmver & 0x0F00)==0x0200) {
      functionset="Router in AT Mode";
    } else if ((firmver & 0x0F00)==0x0B00) {
      functionset="Router in AT (WALL RT)";
    } else if ((firmver & 0x0F00)==0x0600) {
      functionset="Router/End Device (Analog IO)";
    } else if ((firmver & 0x0F00)==0x0700) {
      functionset="Router/End Device (Digital IO)";
    } else {
      functionset="Unknown";
    }
  } else if ((firmver & 0xF000)==0x3000) {
    if ((firmver & 0x0F00)==0x0100) {
      functionset="Coordinator in API Mode";
    } else if ((firmver & 0x0F00)==0x0300) {
      functionset="Router in API Mode";
    } else if ((firmver & 0x0F00)==0x0900) {
      functionset="End Device in API Mode";
    } else if ((firmver & 0x0F00)==0x0400) {
      functionset="Range Extender";
    } else {
      functionset="Unknown";
    }
  } else {
    functionset="Unknown";
  }
  return functionset;
}

/*
  Return a string for the Xbee device type value
  Args: device_type The device type value
*/
const char *xbeelib_get_device_type_string(uint8_t device_type) {
  const char *devtypestr;

  switch (device_type) {
    case ZIGBEE_DEVICE_TYPE_COORDINATOR:
      devtypestr="Coordinator";
      break;
    case ZIGBEE_DEVICE_TYPE_ROUTER:
      devtypestr="Router";
      break;
    case ZIGBEE_DEVICE_TYPE_END_DEVICE:
      devtypestr="End Device";
      break;
    default:
      devtypestr="Unknown";
      break;
  }
  return devtypestr;
}

//=======================
//Xbee Protocol Functions
//=======================

static inline unsigned char _xbeelib_xbee_get_next_frameid(xbeedevice_t *xbeedevice) {
  int i;

  while (1) {
    ++xbeedevice->xbee_frameid;
    if (xbeedevice->xbee_frameid==0) {
      ++xbeedevice->xbee_frameid;
    }
    for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
      if (xbeedevice->xbee_packets_intransit[i].inuse && xbeedevice->xbee_packets_intransit[i].sent==1) {
        if (xbeedevice->xbee_packets_intransit[i].frameid==xbeedevice->xbee_frameid) {
          //We can't use a frameid that is being used by a packet currently in transit
          continue;
        }
      }
    }
    break;
  }
  return xbeedevice->xbee_frameid;
}

STATIC unsigned char xbeelib_xbee_get_next_frameid(xbeedevice_t *xbeedevice, long *xbeelocked) {
  unsigned char val;

  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    xbeelib_unlockxbee(xbeelocked);
    return -1;
  }
  val=_xbeelib_xbee_get_next_frameid(xbeedevice);
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

static inline unsigned char _xbeelib_xbee_get_frameid(xbeedevice_t *xbeedevice) {
  return xbeedevice->xbee_frameid;
}

static unsigned char xbeelib_xbee_get_frameid(xbeedevice_t *xbeedevice, long *xbeelocked) {
  unsigned char val;

  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    xbeelib_unlockxbee(xbeelocked);
    return -1;
  }
  val=_xbeelib_xbee_get_frameid(xbeedevice);
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

static inline unsigned char _xbeelib_zigbee_get_next_seqnumber(xbeedevice_t *xbeedevice) {
  int i;

  while (1) {
    ++xbeedevice->zigbee_seqnumber;
    if (xbeedevice->zigbee_seqnumber==0) {
      ++xbeedevice->zigbee_seqnumber;
    }
    for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
      if (xbeedevice->xbee_packets_intransit[i].inuse && xbeedevice->xbee_packets_intransit[i].sent==1) {
        if (xbeedevice->xbee_packets_intransit[i].packettype==XBEE_PACKETTYPE_ZDO || xbeedevice->xbee_packets_intransit[i].packettype==XBEE_PACKETTYPE_ZCL) {
          if (xbeedevice->xbee_packets_intransit[i].seqnumber==xbeedevice->zigbee_seqnumber) {
            //We can't use a sequence number that is being used by a packet currently in transit
            continue;
          }
        }
      }
    }
    break;
  }
  return xbeedevice->zigbee_seqnumber;
}

static unsigned char xbeelib_zigbee_get_next_seqnumber(xbeedevice_t *xbeedevice, long *xbeelocked) {
  unsigned char val;

  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    xbeelib_unlockxbee(xbeelocked);
    return -1;
  }
  val=_xbeelib_zigbee_get_next_seqnumber(xbeedevice);
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

static unsigned char _xbeelib_zigbee_get_seqnumber(xbeedevice_t *xbeedevice) {
  return xbeedevice->zigbee_seqnumber;
}

static unsigned char xbeelib_zigbee_get_seqnumber(xbeedevice_t *xbeedevice, long *xbeelocked) {
  unsigned char val;

  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    xbeelib_unlockxbee(xbeelocked);
    return -1;
  }
  val=_xbeelib_zigbee_get_seqnumber(xbeedevice);
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

//Send an Xbee API packet and escape the following bytes: 0x7E, 0x7D, 0x11, 0x13
//The buffer should have the first 5 bytes skipped for this function to fill in and bufcnt+1 will also be filled in with the checksum
//  So your first buffer entry will be buffer+5
//xbee length and xbee frame_type should be already set by the caller
static void __xbeelib_xbee_send_api_packet(xbeedevice_t *xbeedevice, unsigned char *sendbuf, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  uint16_t packetlen;
  uint8_t checksum;
  xbee_api_header_t *apicmd=(xbee_api_header_t *) sendbuf;

  MOREDEBUG_ENTERINGFUNC();

  //Mark xbee in use so we don't try and send a packet while a xbee is being removed
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return;
  }
  apicmd->start_delim=0x7E;

  packetlen=ntohs(apicmd->length)+4;

  //Calculate Checksum
  checksum=0;
  for (i=3; i<packetlen-1; i++) {
    checksum+=sendbuf[i];
  }
  checksum=0xFF-checksum;
  sendbuf[packetlen-1]=checksum;

  //Escape certain bytes
//  debuglibifaceptr->debuglib_printf(1, "_xbeelib_xbee_send_api_packet: Original Packet size=%d\n", packetlen);
  for (i=1; i<packetlen; i++) {
    switch (sendbuf[i]) {
      case 0x7E:
      case 0x7D:
      case 0x11:
      case 0x13:
        //Make room for the escaped byte
        memmove(sendbuf+i+1, sendbuf+i, packetlen-i);

        //Add the escape indicator byte
        sendbuf[i]=0x7D;

        //Adjust the buffer size and index
        ++i;
        ++packetlen;

        //Escape the byte
        sendbuf[i]^=0x20;
    }
  }
//  debuglibifaceptr->debuglib_printf(1, "_xbeelib_xbee_send_api_packet: Escaped Packet size=%d\n", packetlen);
//  for (i=0; i<packetsize; i++) {
//    debuglibifaceptr->debuglib_printf(1, "_xbeelib_xbee_send_api_packet: Sending byte: %02X\n", sendbuf[i]);
//  }
#ifdef XBEELIB_MOREDEBUG
  {
    int i;
    char tmpstr[1024];

    tmpstr[0]=0;
    for (i=0; i<packetlen; i++) {
      sprintf(tmpstr+strlen(tmpstr), "%02hhX ", (uint8_t) sendbuf[i]);
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Sending bytes: %s, length=%d\n", __func__, tmpstr, packetlen);
  }
#endif
  //Now send the packet
  xbeedevice->sendFuncptr(xbeedevice->serdevidx, sendbuf, packetlen);
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

//Reserve a slot to send a remote zigbee packet if available
//Returns the index of the packet reserved on success or negative value on error
int xbeelib_request_send_packet(xbeedevice_t *xbeedevice, long *xbeelocked) {
//  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  pthread_t threadid=pthread_self();
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return -1;
  }
  xbee_packets_intransit=xbeedevice->xbee_packets_intransit;
  //First see if the current thread has already reserved a packet
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (xbee_packets_intransit[i].inuse && xbee_packets_intransit[i].threadid==threadid && xbee_packets_intransit[i].sent==0) {
      //Each thread has to send the packet it has reserved or cancel the reservation before it can send another packet
      xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
      xbeelib_unlockxbee(xbeelocked);
      MOREDEBUG_EXITINGFUNC();

      return -2;
    }
  }
  //Now find a free slot
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (!xbee_packets_intransit[i].inuse) {
      //Found a free slot
      xbee_packets_intransit[i].inuse=1;
      xbee_packets_intransit[i].sent=0;
      xbee_packets_intransit[i].threadid=threadid;
      break;
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  if (i!=MAX_PACKETS_IN_TRANSIT) {
//    debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG: %s: Thread: %llu has reserved a packet buffer\n", __func__, threadid);
    return i;
  }
  return -3;
}

//Cancel a reserved a slot for sending a remote zigbee packet
//Returns the index of the packet cancelled on success or negative value on error
int xbeelib_cancel_request_send_packet(xbeedevice_t *xbeedevice, long *xbeelocked) {
//  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  pthread_t threadid=pthread_self();
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return -1;
  }
  xbee_packets_intransit=xbeedevice->xbee_packets_intransit;
  //See if the current thread has reserved a packet
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (xbee_packets_intransit[i].inuse && xbee_packets_intransit[i].threadid==threadid && xbee_packets_intransit[i].sent==0) {
      //Reserved packet has been found so unreserve it
      xbee_packets_intransit[i].inuse=0;
      xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
      xbeelib_unlockxbee(xbeelocked);

//      debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG: %s: Thread: %llu has cancelled reserved packet buffer\n", __func__, threadid);

      return i;
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return -2;
}

//Find a reserved a slot for sending a remote zigbee packet
//Returns the index of the packet cancelled on success or negative value on error
int xbeelib_find_reserved_send_packet(xbeedevice_t *xbeedevice, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  pthread_t threadid=pthread_self();
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return -1;
  }
  xbee_packets_intransit=xbeedevice->xbee_packets_intransit;
  //See if the current thread has reserved a packet
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (xbee_packets_intransit[i].inuse && xbee_packets_intransit[i].threadid==threadid && xbee_packets_intransit[i].sent==0) {
      //Reserved packet has been found
      xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
      xbeelib_unlockxbee(xbeelocked);

      return i;
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return -2;
}

//Find an in transit packet using a frameid
//Returns the index of the packet on success or negative value on error
int xbeelib_find_intransit_packet_by_frameid(xbeedevice_t *xbeedevice, uint8_t frameid, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return -1;
  }
  xbee_packets_intransit=xbeedevice->xbee_packets_intransit;
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (xbee_packets_intransit[i].inuse && xbee_packets_intransit[i].sent==1 && xbee_packets_intransit[i].frameid==frameid) {
      //Packet has been found
      xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
      xbeelib_unlockxbee(xbeelocked);

      return i;
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return -2;
}

//Find an in transit packet using a sequence number
//Returns the index of the packet on success or negative value on error
int xbeelib_find_intransit_packet_by_seqnumber(xbeedevice_t *xbeedevice, uint8_t seqnumber, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return -1;
  }
  xbee_packets_intransit=xbeedevice->xbee_packets_intransit;
  for (i=0; i<MAX_PACKETS_IN_TRANSIT; i++) {
    if (xbee_packets_intransit[i].inuse && xbee_packets_intransit[i].sent==1 && xbee_packets_intransit[i].seqnumber==seqnumber) {
      //Packet has been found
      xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
      xbeelib_unlockxbee(xbeelocked);

      return i;
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return -2;
}

/*
  Send an Xbee AT command
  Args: xbeedevice A pointer to xbeedevice structure used to send the serial data
        atcmd The 2 character AT command to send
        param The variable size parameter to send, can specify NULL if paramsize<=0
        paramsize The number of bytes in the parameter or 0 for AT query
*/
void xbeelib_send_xbee_at_command(xbeedevice_t *xbeedevice, char *atcmd, unsigned char *param, int paramsize, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  xbee_api_atcmd_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    return;
  }
  apicmd=(xbee_api_atcmd_t *) calloc(1, (sizeof(xbee_api_atcmd_t)+paramsize)*2); //Multiply by 2 to include space for escaping
  if (!apicmd) {
    xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  memcpy(apicmd->atcmd, atcmd, 2);
  if (paramsize>0) {
    memcpy(&apicmd->end, param, paramsize);
  }
  //Fill in the other packet details and send the packet
  apicmd->frameid=xbeelib_xbee_get_next_frameid(xbeedevice, xbeelocked);
  apicmd->frametype=API_XBEE_AT_COMMAND;
  apicmd->length=htons( sizeof(*apicmd)-4+paramsize ); //Don't include start_delim, length, or end in the length
  __xbeelib_xbee_send_api_packet(xbeedevice, (unsigned char *) apicmd, xbeelocked);
  free(apicmd);

  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send an Xbee Zigbee ZDO
  Arguments:
    xbeedevice A pointer to xbeedevice structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
  When calling this function, your payload should be added to &xbee_api_explicit_addressing_zigbee_cmd_t->end
*/
void __xbeelib_send_zigbee_zdo(xbeedevice_t *xbeedevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  int idx, zigbeelibindex;
  xbee_api_explicit_addressing_zigbee_cmd_t *apicmd;
  xbee_zdo_cmd_t *xbeezdocmd;
  xbee_packets_intransit_t *xbee_packets_intransit;

  MOREDEBUG_ENTERINGFUNC();

  if (xbeelib_markxbee_inuse(xbeedevice, zigbeelocked)<0) {
    //Failed to mark xbee as inuse
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  idx=xbeelib_find_reserved_send_packet(xbeedevice, xbeelocked);
  if (idx<0) {
    //A packet hasn't been reserved for sending
    debuglibifaceptr->debuglib_printf(1, "%s: ERROR: A request to send a ZDO packet to Zigbee Device %04hX wasn't reserved first\n", __func__, zdocmd->netaddr);
    xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  xbee_packets_intransit=&xbeedevice->xbee_packets_intransit[idx];

  //Copy the zdocmd structure contents into the apicmd structure and send the packet
  //NOTE: Add 1 for checksum
  //NOTE2: We allocate x2 to include enough space for escaping
  apicmd=(xbee_api_explicit_addressing_zigbee_cmd_t *) calloc(1, (sizeof(xbee_api_explicit_addressing_zigbee_cmd_t)+zdocmd->zigbeelength+1)*2);
  if (!apicmd) {
    xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  xbeezdocmd=&apicmd->end;

  apicmd->length=htons(sizeof(xbee_api_explicit_addressing_zigbee_cmd_t)+zdocmd->zigbeelength-3); //Don't include start_delim or length in the length
  apicmd->destaddr=htobe64(zdocmd->addr);
  apicmd->destnetaddr=htons(zdocmd->netaddr);
  apicmd->srcendpnt=0; //ZDO packets use endpoint: 0
  apicmd->destendpnt=0; //ZDO packets use endpoint: 0
  apicmd->clusterid=htons(zdocmd->clusterid);
  apicmd->profileid=htons(ZIGBEE_ZDO_PROFILE);
  apicmd->radius=0x00; //Use 00 for maximum hops
  if (rxonidle) {
    apicmd->transmitopts=0; //Transmit options: Use normal timeout
  } else {
    apicmd->transmitopts=0x40; //Transmit options: Use extended transmission timeout as we are sending to a sleepy device
  }
  xbeezdocmd->seqnumber=xbeelib_zigbee_get_next_seqnumber(xbeedevice, xbeelocked);
  memcpy(&xbeezdocmd->data, &zdocmd->zigbeepayload, zdocmd->zigbeelength);

  //Fill in the other packet details and send the packet
  apicmd->frameid=xbeelib_xbee_get_next_frameid(xbeedevice, xbeelocked);
  apicmd->frametype=API_EXPLICIT_ADDRESSING_ZIGBEE_COMMAND;

  //Fill in the details for in transit packet
  xbeelib_lockxbee(xbeelocked);
  xbee_packets_intransit->sent=1;
  xbee_packets_intransit->frameid=apicmd->frameid;
  xbee_packets_intransit->waitingfortransmitstatus=1;
  if (expect_response) {
    xbee_packets_intransit->waitingforresponse=1;
  } else {
    xbee_packets_intransit->waitingforresponse=0;
  }
  xbee_packets_intransit->packettype=XBEE_PACKETTYPE_ZDO;
  xbee_packets_intransit->destnetaddr=zdocmd->netaddr;
  xbee_packets_intransit->destendpoint=0;
  xbee_packets_intransit->destcluster=zdocmd->clusterid;
  xbee_packets_intransit->seqnumber=xbeezdocmd->seqnumber;
  xbeelib_unlockxbee(xbeelocked);

  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Sending a ZDO packet to Zigbee Device %04hX with frameid: %02hhX, seqnumber: %02hhX\n", __func__, zdocmd->netaddr, apicmd->frameid, xbeezdocmd->seqnumber);

  xbeelib_lockxbee(xbeelocked);
  zigbeelibindex=xbeedevice->zigbeelibindex;
  xbeelib_unlockxbee(xbeelocked);

  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zdo_seqnumber(zigbeelibindex, zdocmd->netaddr, xbeezdocmd->seqnumber, xbeelocked, zigbeelocked);
  }
  __xbeelib_xbee_send_api_packet(xbeedevice, (unsigned char *) apicmd, xbeelocked);
  free(apicmd);

  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send an Xbee Zigbee ZCL
  Arguments:
    xbeedevice A pointer to xbeedevice structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
  When calling this function, your payload should be added to &xbee_api_explicit_addressing_zigbee_cmd_t->end
*/
void __xbeelib_send_zigbee_zcl(xbeedevice_t *xbeedevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  int idx, zigbeelibindex;
  xbee_api_explicit_addressing_zigbee_cmd_t *apicmd;
  xbee_zcl_cmd_t *xbeezclcmd;
  xbee_zcl_cmd_with_manu_t *xbeezclcmdwithmanu;
  xbee_packets_intransit_t *xbee_packets_intransit;
  uint16_t xbeelength;
  uint8_t seqnumber;

  MOREDEBUG_ENTERINGFUNC();

  if (xbeelib_markxbee_inuse(xbeedevice, zigbeelocked)<0) {
    //Failed to mark xbee as inuse
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  idx=xbeelib_find_reserved_send_packet(xbeedevice, xbeelocked);
  if (idx<0) {
    //A packet hasn't been reserved for sending
    debuglibifaceptr->debuglib_printf(1, "%s: ERROR: A request to send a ZCL packet to Zigbee Device %04hX wasn't reserved first\n", __func__, zclcmd->netaddr);
    xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  xbee_packets_intransit=&xbeedevice->xbee_packets_intransit[idx];

  xbeelength=sizeof(xbee_api_explicit_addressing_zigbee_cmd_t)-3+zclcmd->zigbeelength+2; //Don't include start_delim or length in the length
  if ((zclcmd->frame_control & 0x4)==0x4) {
    xbeelength+=2;
  }
  //Copy the zdocmd structure contents into the apicmd structure and send the packet
  //NOTE: Add 1 for checksum
  //NOTE2: We allocate x2 to include enough space for escaping
  apicmd=(xbee_api_explicit_addressing_zigbee_cmd_t *) calloc(1, (xbeelength+4)*2);
  if (!apicmd) {
    xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  xbeezclcmdwithmanu=xbeezclcmd=&apicmd->end;

  apicmd->length=htons(xbeelength);
  apicmd->destaddr=htobe64(zclcmd->addr);
  apicmd->destnetaddr=htons(zclcmd->netaddr);
  apicmd->srcendpnt=zclcmd->srcendpnt;
  apicmd->destendpnt=zclcmd->destendpnt;;
  apicmd->clusterid=htons(zclcmd->clusterid);
  apicmd->profileid=htons(zclcmd->profileid);
  apicmd->radius=0x00; //Use 00 for maximum hops
  if (rxonidle) {
    apicmd->transmitopts=0; //Transmit options: Use normal timeout
  } else {
    apicmd->transmitopts=0x40; //Transmit options: Use extended transmission timeout as we are sending to a sleepy device
  }
  xbeezclcmd->frame_control=zclcmd->frame_control;
  seqnumber=xbeelib_zigbee_get_next_seqnumber(xbeedevice, xbeelocked);
  if ((zclcmd->frame_control & 0x4)!=0x4) {
    xbeezclcmd->seqnumber=seqnumber;
    xbeezclcmd->cmdid=zclcmd->cmdid;
    memcpy(&xbeezclcmd->data, &zclcmd->zigbeepayload, zclcmd->zigbeelength);
  } else {
    xbeezclcmdwithmanu->seqnumber=seqnumber;
    xbeezclcmdwithmanu->manu=zclcmd->manu;
    xbeezclcmdwithmanu->cmdid=zclcmd->cmdid;
    memcpy(&xbeezclcmdwithmanu->data, &zclcmd->zigbeepayload, zclcmd->zigbeelength);
  }
  //Fill in the other packet details and send the packet
  apicmd->frameid=xbeelib_xbee_get_next_frameid(xbeedevice, xbeelocked);
  apicmd->frametype=API_EXPLICIT_ADDRESSING_ZIGBEE_COMMAND;

  //Fill in the details for in transit packet
  xbeelib_lockxbee(xbeelocked);
  xbee_packets_intransit->sent=1;
  xbee_packets_intransit->frameid=apicmd->frameid;
  xbee_packets_intransit->waitingfortransmitstatus=1;
  if (expect_response) {
    xbee_packets_intransit->waitingforresponse=1;
  } else {
    xbee_packets_intransit->waitingforresponse=0;
  }
  xbee_packets_intransit->packettype=XBEE_PACKETTYPE_ZCL;
  xbee_packets_intransit->destnetaddr=zclcmd->netaddr;
  xbee_packets_intransit->destendpoint=zclcmd->destendpnt;
  xbee_packets_intransit->destcluster=zclcmd->clusterid;
  if ((zclcmd->frame_control & 0x4)!=0x4) {
    xbee_packets_intransit->seqnumber=xbeezclcmd->seqnumber;
  } else {
    xbee_packets_intransit->seqnumber=xbeezclcmdwithmanu->seqnumber;
  }
  xbeelib_unlockxbee(xbeelocked);

  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Sending a ZCL packet to Zigbee Device %04hX with frameid: %02hhX, seqnumber: %02hhX\n", __func__, zclcmd->netaddr, apicmd->frameid, seqnumber);

  xbeelib_lockxbee(xbeelocked);
  zigbeelibindex=xbeedevice->zigbeelibindex;
  xbeelib_unlockxbee(xbeelocked);

  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zcl_seqnumber(zigbeelibindex, zclcmd->netaddr, seqnumber, xbeelocked, zigbeelocked);
  }
  __xbeelib_xbee_send_api_packet(xbeedevice, (unsigned char *) apicmd, xbeelocked);
  free(apicmd);

  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

void xbeelib_send_xbee_leave_network(xbeedevice_t *xbeedevice, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  uint8_t value;
  unsigned char atparam[1];

  MOREDEBUG_ENTERINGFUNC();

  //Reset the Network Layer Parameters on this xbee
  //NR0
  value=0;
  memcpy(atparam, &value, 1);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_NETWORKRESET, atparam, 1, xbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send commands to form an Xbee network on an Xbee Coordinator
  Args: xbeedevice A pointer to xbeedevice structure used to send the serial data
  NOTE: Currently uses automatic settings
*/
void xbeelib_send_xbee_form_network(xbeedevice_t *xbeedevice, uint16_t chanmask, long *xbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;
  multitypeval_t val;
  uint8_t key[16], device_type;
  uint64_t addr;

  MOREDEBUG_ENTERINGFUNC();

  xbeelib_lockxbee(xbeelocked);
  addr=xbeedevice->addr;
  device_type=xbeedevice->device_type;
  xbeelib_unlockxbee(xbeelocked);
  if (device_type!=ZIGBEE_DEVICE_TYPE_COORDINATOR) {
    debuglibifaceptr->debuglib_printf(1, "%s: Xbee device: %016llX is not a coordinator\n", __func__, addr);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //===============
  //Common Settings
  //===============

  //Enable API Mode with Escaping
  val.uval8bit=2;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_APIENABLE, (unsigned char *) &val, 1, xbeelocked);

  //Set API Options to enable Explicit Rx Data indicator API frame and passthrough unknown ZDO requests
  val.uval8bit=1;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_APIOPTIONS, (unsigned char *) &val, 1, xbeelocked);

  //Set the Zigbee Stack Profile
  val.uval8bit=2;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_ZIGBEE_STACK_PROFILE, (unsigned char *) &val, 1, xbeelocked);

  //Set the initial join time to 0
  val.uval8bit=0;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_NODEJOINTIME, (unsigned char *) &val, 1, xbeelocked);

  //===================
  //Encryption Settings
  //===================

  //Enable Encryption
  val.uval8bit=1;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_ENCRYPTENABLE, (unsigned char *) &val, 1, xbeelocked);

  //Use Trust Center, don't send security key unsecured over-the-air during joins
  val.uval8bit=2;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_ENCRYPTOPTIONS, (unsigned char *) &val, 1, xbeelocked);

  //Set Link Key for Zigbee Home Automation
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_LINKKEY, (unsigned char *) "ZigBeeAlliance09", 16, xbeelocked);

  //Set Network Key to automatic
  memset(key, 0, 16);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_NETWORKENCRYPTKEY, (unsigned char *) key, 16, xbeelocked);

  //================================
  //Network Forming/Joining Settings
  //================================

  //Set the channel mask
  val.uval16bit=htons(chanmask);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_SCANCHANNELS, (unsigned char *) &val, 2, xbeelocked);

  //Set the PAN ID to automatic
  val.uval64bit=0;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_EXTENDEDPANID, (unsigned char *) &val, 8, xbeelocked);

  //Apply the settings
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_APPLYCHNG, NULL, 0, xbeelocked);

  //Write to nvram
  result=xbeelib_initwaitforresponse(XBEE_WAITING_FOR_AT_WRITE, xbeelocked);
  if (result<0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_WRITE, NULL, 0, xbeelocked);
  result=xbeelib_waitforresponse(xbeelocked);

  //Reset the Network Layer Parameters to force trigger the forming of a new network
  //NR0
  val.uval8bit=0;
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_NETWORKRESET, (unsigned char *) &val, 1, xbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Enable joining on the Xbee for a short period of time
  See Permit Joining around page 39 of Digi 90000976_V manual
*/
void xbeelib_permit_join(void *localzigbeedevice, uint8_t duration, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  xbeedevice_t *xbeedevice=localzigbeedevice;
  unsigned char atparam[1];

  MOREDEBUG_ENTERINGFUNC();
  if (xbeelib_markxbee_inuse(xbeedevice, xbeelocked)<0) {
    //Failed to mark xbee as inuse
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //First enable joining and set the join duration
  memcpy(atparam, &duration, 1);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_NODEJOINTIME, (unsigned char *) atparam, 1, xbeelocked);

  //Now apply the setting to trigger the custom join duration
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_APPLYCHNG, NULL, 0, xbeelocked);

  //TODO: Test this to make sure it works
  //Now broadcast the new joining value over the network
  //NOTE: This enables temp join for 1 minute
  //CB=2
  //atparam[0]=2;
  //xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_PUSHBUTTON, (unsigned char *) atparam, 1, xbeelocked);

  xbeelib_markxbee_notinuse(xbeedevice, xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API AT response
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
void xbeelib_process_api_at_response(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonlib_ifaceptrs_ver_1_t *commonlibifaceptr=xbeelib_deps[COMMONLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  xbee_api_atcmd_response_t *apicmd=(xbee_api_atcmd_response_t *) (xbeedevice->receivebuf);

  MOREDEBUG_ENTERINGFUNC();
  if (apicmd->cmdstatus!=API_CMDSTATUS_OK) {
    //AT command error
    debuglibifaceptr->debuglib_printf(1, "%s: AT command error: ", __func__);
    switch (apicmd->cmdstatus) {
      case API_CMDSTATUS_OK:
        debuglibifaceptr->debuglib_printf(1, "OK\n");
        break;
      case API_CMDSTATUS_ERROR:
        debuglibifaceptr->debuglib_printf(1, "ERROR\n");
        break;
      case API_CMDSTATUS_INVALIDCMD:
        debuglibifaceptr->debuglib_printf(1, "Invalid CMD\n");
        break;
      case API_CMDSTATUS_INVALIDPARAM:
        debuglibifaceptr->debuglib_printf(1, "Invalid Param\n");
        break;
      case API_CMDSTATUS_TXFAILURE:
        debuglibifaceptr->debuglib_printf(1, "TX Failure\n");
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "Unknown: %02hhX\n", apicmd->cmdstatus);
        break;
    }
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG: %s: Received AT response for command: %c%c\n", __func__, apicmd->atcmd[0], apicmd->atcmd[1]);

  //NOTE: This section triggers some dereferencing type-punned pointer warnings but the casting from ->end works okay
  xbeelib_lockxbee(xbeelocked);
  if (apicmd->atcmd[0]==XBEE_AT_CMD_FIRMVER[0] && apicmd->atcmd[1]==XBEE_AT_CMD_FIRMVER[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_FIRMVER) {
      xbeelib_waitresult=1;
      xbeedevice->firmver=ntohs( *((uint16_t *) &apicmd->end) );
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_HWVER[0] && apicmd->atcmd[1]==XBEE_AT_CMD_HWVER[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_HWVER) {
      xbeelib_waitresult=1;
      xbeedevice->hwver=ntohs( *((uint16_t *) &apicmd->end) );
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_SERNUMHIGH[0] && apicmd->atcmd[1]==XBEE_AT_CMD_SERNUMHIGH[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_SERNUMHIGH) {
      xbeelib_waitresult=1;
      xbeedevice->addr|=((unsigned long long) ntohl( *((uint32_t *) &apicmd->end) ) << 32) & 0xFFFFFFFF00000000;
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_SERNUMLOW[0] && apicmd->atcmd[1]==XBEE_AT_CMD_SERNUMLOW[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_SERNUMLOW) {
      xbeelib_waitresult=1;
      xbeedevice->addr|=ntohl( *((uint32_t *) &apicmd->end) ) & 0xFFFFFFFF;
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_APPLYCHNG[0] && apicmd->atcmd[1]==XBEE_AT_CMD_APPLYCHNG[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_APPLYCHNG) {
      xbeelib_waitresult=1;
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_ENCRYPTENABLE[0] && apicmd->atcmd[1]==XBEE_AT_CMD_ENCRYPTENABLE[1]) {
    ++xbeedevice->received_network_status_values;
    xbeedevice->prevencryptednetwork=xbeedevice->encryptednetwork;
    xbeedevice->encryptednetwork=apicmd->end;
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_OPERCHANNEL[0] && apicmd->atcmd[1]==XBEE_AT_CMD_OPERCHANNEL[1]) {
    ++xbeedevice->received_network_status_values;
    xbeedevice->prevchannel=xbeedevice->channel;
    xbeedevice->channel=apicmd->end;
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_GETNETADDR[0] && apicmd->atcmd[1]==XBEE_AT_CMD_GETNETADDR[1]) {
    ++xbeedevice->received_network_status_values;
    xbeedevice->prevnetaddr=xbeedevice->netaddr;
    xbeedevice->netaddr=ntohs( *((uint16_t *) &apicmd->end) ) & 0xFFFF;
    if (xbeedevice->netaddr!=0xFFFE) {
      xbeedevice->network_connected=1;
    } else {
      //0xFFFE means not connected to a network
      xbeedevice->network_connected=0;
    }
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_OPERPANID[0] && apicmd->atcmd[1]==XBEE_AT_CMD_OPERPANID[1]) {
    ++xbeedevice->received_network_status_values;
    xbeedevice->prevpanid=xbeedevice->panid;
    xbeedevice->panid=ntohs( *((uint16_t *) &apicmd->end) ) & 0xFFFF;
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_OPEREXTPANID[0] && apicmd->atcmd[1]==XBEE_AT_CMD_OPEREXTPANID[1]) {
    ++xbeedevice->received_network_status_values;
    xbeedevice->prevextpanid=xbeedevice->extpanid;
    //Android doesn't have be64toh
    commonlibifaceptr->commonlib_bigendian64bittobuf((unsigned char *) (&xbeedevice->extpanid), *((uint64_t *) &apicmd->end));
  } else if (apicmd->atcmd[0]==XBEE_AT_CMD_WRITE[0] && apicmd->atcmd[1]==XBEE_AT_CMD_WRITE[1]) {
    if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_AT_WRITE) {
      xbeelib_waitresult=1;
    }
  }
  if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_ATCMD) {
    xbeelib_waitresult=1;
    if (apicmd->end==0) {
    }
  }
  if (xbeedevice->received_network_status_values==5) {
    //All the network status values have been received
    xbeedevice->received_network_status_values=0;
    xbeedevice->have_network_status_values=1;
    debuglibifaceptr->debuglib_printf(1, "%s: Received Network Status Info on Xbee device: %016llX\n", __func__, xbeedevice->addr);
    debuglibifaceptr->debuglib_printf(1, "%s: Connected to Network: %s\n", __func__, (xbeedevice->network_connected==1) ? "Yes" : "No");
    debuglibifaceptr->debuglib_printf(1, "%s: Encrypted: %s\n", __func__, (xbeedevice->encryptednetwork==1) ? "Yes" : "No");
    debuglibifaceptr->debuglib_printf(1, "%s: Channel=%02hX\n",__func__, xbeedevice->channel);
    debuglibifaceptr->debuglib_printf(1, "%s: 16-bit Network Address=%04hX\n",__func__, xbeedevice->netaddr);
    debuglibifaceptr->debuglib_printf(1, "%s: Pan ID=%04hX\n",__func__, xbeedevice->panid);
    debuglibifaceptr->debuglib_printf(1, "%s: Extended Pan ID=%016llX\n",__func__, xbeedevice->extpanid);

    if (xbeedevice->network_connected!=xbeedevice->prevnetwork_connected || xbeedevice->netaddr!=xbeedevice->prevnetaddr) {
      xbeedevice->prevnetwork_connected=xbeedevice->network_connected;
      xbeedevice->prevnetaddr=xbeedevice->netaddr;
      if (xbeedevice->zigbeelibindex>=0 && zigbeelibifaceptr) {
        debuglibifaceptr->debuglib_printf(1, "%s: Removing cached list of ZigBee devices as network connection state has changed\n", __func__);
        zigbeelibifaceptr->remove_all_zigbee_devices(xbeedevice->zigbeelibindex, xbeelocked, zigbeelocked);
      }
    }
  }
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}


/*
  Process an Xbee API modem status
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
void xbeelib_process_api_modem_status(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  xbee_api_modem_status_t *apicmd=(xbee_api_modem_status_t *) (xbeedevice->receivebuf);
  uint64_t addr;
  const char *statusstr;

  MOREDEBUG_ENTERINGFUNC();

  xbeelib_lockxbee(xbeelocked);
  addr=xbeedevice->addr;

  //Force a refresh of the network status as it may have changed
  xbeedevice->last_connect_status_refresh=0;

  xbeelib_unlockxbee(xbeelocked);

  switch (apicmd->status) {
    case 0x00:
      statusstr="Hardware Reset";
      break;
    case 0x01:
      statusstr="Watchdog timer reset";
      break;
    case 0x02:
      statusstr="Joined network";
      break;
    case 0x03:
      statusstr="Disassociated";
      break;
    case 0x06:
      statusstr="Coordinator started";
      break;
    case 0x07:
      statusstr="Network security key was updated";
      break;
    case 0x0D:
      statusstr="Voltage supply limit exceeded";
      break;
    case 0x11:
      statusstr="Modem configuration changed while join in progress";
      break;
    default:
      statusstr="Unknown";
      break;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Received Modem Status: %s (%02hhX) on Xbee device: %016llX\n", __func__, statusstr, apicmd->status, addr);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API transmit status
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
void xbeelib_process_api_transmit_status(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  //debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  xbee_api_zigbee_transmit_status_t *apicmd=(xbee_api_zigbee_transmit_status_t *) (xbeedevice->receivebuf);
  int zigbeelibindex;
  int idx;
  uint16_t netaddr=0x0000, clusterid;
  uint8_t seqnumber;
  int packettype=0;

  MOREDEBUG_ENTERINGFUNC();

  //If a transmit status indicates failure the network address will be set to 0xFFFD on the Xbee so we need to
  //  match it using the frameid in the intransit buffer
  if (apicmd->delivery_status==0x00) {
    netaddr=ntohs(apicmd->destnetaddr);
  }
  xbeelib_lockxbee(xbeelocked);
  idx=xbeelib_find_intransit_packet_by_frameid(xbeedevice, apicmd->frameid, xbeelocked);
  if (idx>=0) {
    seqnumber=xbeedevice->xbee_packets_intransit[idx].seqnumber;
    packettype=xbeedevice->xbee_packets_intransit[idx].packettype;
    clusterid=xbeedevice->xbee_packets_intransit[idx].destcluster;
    netaddr=xbeedevice->xbee_packets_intransit[idx].destnetaddr;
    if (apicmd->delivery_status!=0x00) {
      //Cancel the packet straight away if an error occurred
      xbeedevice->xbee_packets_intransit[idx].inuse=0;
    } else {
      if (!xbeedevice->xbee_packets_intransit[idx].waitingforresponse) {
        xbeedevice->xbee_packets_intransit[idx].inuse=0;
      } else {
        //We can only free up the buffer if both responses have been received
        xbeedevice->xbee_packets_intransit[idx].waitingfortransmitstatus=0;
      }
    }
  }
  xbeelib_unlockxbee(xbeelocked);

  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG: %s: Received Transmit Status: %02hhX for frame id: %02hhX, netaddr=%04hX\n", __func__, apicmd->delivery_status, apicmd->frameid, netaddr);
  xbeelib_lockxbee(xbeelocked);
  zigbeelibindex=xbeedevice->zigbeelibindex;
  xbeelib_unlockxbee(xbeelocked);
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    if (apicmd->delivery_status==API_RECEIVE_DELIV_STATUS_ANF || apicmd->delivery_status==API_RECEIVE_DELIV_STATUS_RNF) {
      //Assume not being able to find the address or route is a timeout
      if (packettype==XBEE_PACKETTYPE_ZDO) {
        zigbeelibifaceptr->process_zdo_response_timeout(zigbeelibindex, netaddr, clusterid, &seqnumber, xbeelocked, zigbeelocked);
      } else if (packettype==XBEE_PACKETTYPE_ZCL) {
        zigbeelibifaceptr->process_zcl_response_timeout(zigbeelibindex, netaddr, clusterid, &seqnumber, xbeelocked, zigbeelocked);
      }
    } else {
      if (packettype==XBEE_PACKETTYPE_ZDO) {
        zigbeelibifaceptr->process_zdo_send_status(zigbeelibindex, apicmd->delivery_status, &seqnumber, xbeelocked, zigbeelocked);
      } else if (packettype==XBEE_PACKETTYPE_ZCL) {
        zigbeelibifaceptr->process_zcl_send_status(zigbeelibindex, apicmd->delivery_status, &seqnumber, xbeelocked, zigbeelocked);
      }
    }
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API Zigbee ZDO packet response
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
static void xbeelib_process_api_zigbee_zdo_packet_response(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  xbee_api_zigbee_explicit_rx_indicator_t *apicmd;
  zigbee_zdo_response_header_t *zdocmd;
  int zigbeelibindex;
  int idx;
  uint16_t netaddr, clusterid, profileid;
  uint8_t zigbeelength;

  MOREDEBUG_ENTERINGFUNC();

  apicmd=(xbee_api_zigbee_explicit_rx_indicator_t *) (xbeedevice->receivebuf);
  zdocmd=(zigbee_zdo_response_header_t *) &apicmd->srcendpnt; //7 bytes before seqnumber

  netaddr=ntohs(apicmd->srcnetaddr);
  clusterid=ntohs(apicmd->clusterid);
  profileid=ntohs(apicmd->profileid); //ZDO packets are always in the ZDO profile but we copy from the packet here anyway
  zigbeelength=ntohs(apicmd->length)-18; //Xbee length is number of bytes between the length and the checksum

  //Copy the zigbee payload into the generic Zigbee ZDO Response structure
  memmove(&(zdocmd->seqnumber), &(apicmd->end), zigbeelength);

  //Now copy the remaining values
  zdocmd->srcnetaddr=netaddr;
  zdocmd->clusterid=clusterid;
  zdocmd->profileid=profileid;
  zdocmd->zigbeelength=zigbeelength;

  xbeelib_lockxbee(xbeelocked);
  zigbeelibindex=xbeedevice->zigbeelibindex;

  idx=xbeelib_find_intransit_packet_by_seqnumber(xbeedevice, zdocmd->seqnumber, xbeelocked);
  if (idx>=0) {
    if (!xbeedevice->xbee_packets_intransit[idx].waitingfortransmitstatus) {
      xbeedevice->xbee_packets_intransit[idx].inuse=0;
    } else {
      //We can only free up the buffer if both responses have been received
      xbeedevice->xbee_packets_intransit[idx].waitingforresponse=0;
    }
  }
  xbeelib_unlockxbee(xbeelocked);
  debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Received a ZDO packet from Zigbee Device %04hX with seqnumber: %02hhX, Profile ID: %04" PRIX16 ", Cluster ID: %04" PRIX16 "\n", __func__, netaddr, zdocmd->seqnumber, profileid, clusterid);

  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
		if ((clusterid&0x8000)==0 && netaddr==xbeedevice->netaddr) {
			//This is a request ZDO packet passed through because not supported by the Xbee
			//Just report as failed to send for now
      zigbeelibifaceptr->process_zdo_send_status(zigbeelibindex, 1, &zdocmd->seqnumber, xbeelocked, zigbeelocked);
		} else {
			zigbeelibifaceptr->process_zdo_response_received(zigbeelibindex, zdocmd, xbeelocked, zigbeelocked);
		}
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API Zigbee ZCL packet response
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
static void xbeelib_process_api_zigbee_zcl_packet_response(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  //debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  //commonlib_ifaceptrs_ver_1_t *commonlibifaceptr=xbeelib_deps[COMMONLIB_DEPIDX].ifaceptr;
  xbee_api_zigbee_explicit_rx_indicator_t *apicmd;
  zigbee_zcl_command_with_manu_t *zclcmd;
  xbee_zcl_cmd_t *xbeezclcmd;
  xbee_zcl_cmd_with_manu_t *xbeezclcmdwithmanu;
  int zigbeelibindex;
  int idx;

  MOREDEBUG_ENTERINGFUNC();

  apicmd=(xbee_api_zigbee_explicit_rx_indicator_t *) (xbeedevice->receivebuf);
  zclcmd=(zigbee_zcl_command_with_manu_t *) &apicmd->srcaddr; //Reuse the receive buffer
  xbeezclcmd=(xbee_zcl_cmd_t *) &apicmd->end;
  xbeezclcmdwithmanu=(xbee_zcl_cmd_with_manu_t *) &apicmd->end;

  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Received a ZCL packet from Zigbee Device %04hX, Length2=%u\n", __func__, ntohs(apicmd->srcnetaddr), ntohs(apicmd->length));

  zclcmd->srcnetaddr=ntohs(apicmd->srcnetaddr);
  zclcmd->srcendpnt=apicmd->srcendpnt;
  zclcmd->destendpnt=apicmd->destendpnt;
  zclcmd->clusterid=ntohs(apicmd->clusterid);

  zclcmd->frame_control=xbeezclcmd->frame_control;

  if ((zclcmd->frame_control & 0x4)!=0x4) {
    zclcmd->manu=0;
    zclcmd->seqnumber=xbeezclcmd->seqnumber;
    zclcmd->cmdid=xbeezclcmd->cmdid;
    zclcmd->zigbeelength=ntohs(apicmd->length)-21; //Xbee length is number of bytes between the length and the checksum

    //Copy the zigbee payload into the generic Zigbee ZCL Response structure
    memmove(&(zclcmd->zigbeepayload), &(xbeezclcmd->data), zclcmd->zigbeelength);
  } else {
    zclcmd->manu=xbeezclcmdwithmanu->manu;
    zclcmd->seqnumber=xbeezclcmdwithmanu->seqnumber;
    zclcmd->cmdid=xbeezclcmdwithmanu->cmdid;
    zclcmd->zigbeelength=ntohs(apicmd->length)-23; //Xbee length is number of bytes between the length and the checksum

    //Copy the zigbee payload into the generic Zigbee ZCL Response structure
    memmove(&(zclcmd->zigbeepayload), &(xbeezclcmdwithmanu->data), zclcmd->zigbeelength);
  }
  xbeelib_lockxbee(xbeelocked);
  zigbeelibindex=xbeedevice->zigbeelibindex;

  if (zclcmd->cmdid!=ZIGBEE_ZCL_CMD_REPORT_ATTRIB) {
    //Reports are sourced from the remote device and have their own sequence numbers
    idx=xbeelib_find_intransit_packet_by_seqnumber(xbeedevice, zclcmd->seqnumber, xbeelocked);
    if (idx>=0) {
      if (!xbeedevice->xbee_packets_intransit[idx].waitingfortransmitstatus) {
        xbeedevice->xbee_packets_intransit[idx].inuse=0;
      } else {
        //We can only free up the buffer if both responses have been received
        xbeedevice->xbee_packets_intransit[idx].waitingforresponse=0;
      }
    }
  }
  xbeelib_unlockxbee(xbeelocked);
  //debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Received a ZCL packet from Zigbee Device %04hX with seqnumber: %02hhX, Command ID=%02hhX, Length=%d, Length2=%04hX\n", __func__, zclcmd->srcnetaddr, zclcmd->seqnumber, zclcmd->cmdid, zclcmd->zigbeelength, apicmd->length);

  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zcl_response_received(zigbeelibindex, zclcmd, xbeelocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API Zigbee Explicit RX Indicator
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
*/
static void xbeelib_process_api_zigbee_explicit_rx_indicator(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  commonlib_ifaceptrs_ver_1_t *commonlibifaceptr=xbeelib_deps[COMMONLIB_DEPIDX].ifaceptr;
  xbee_api_zigbee_explicit_rx_indicator_t *apicmd=(xbee_api_zigbee_explicit_rx_indicator_t *) (xbeedevice->receivebuf);
  uint64_t addr;
  uint16_t netaddr, clusterid, profileid;

  MOREDEBUG_ENTERINGFUNC();
  addr=htobe64(apicmd->srcaddr);
  netaddr=htons(apicmd->srcnetaddr);
  clusterid=htons(apicmd->clusterid);
  profileid=htons(apicmd->profileid);
  switch (profileid) {
    case ZIGBEE_ZDO_PROFILE:
      xbeelib_process_api_zigbee_zdo_packet_response(xbeedevice, xbeelocked, zigbeelocked);
      break;
    case ZIGBEE_HOME_AUTOMATION_PROFILE:
      xbeelib_process_api_zigbee_zcl_packet_response(xbeedevice, xbeelocked, zigbeelocked);
      break;
    default:
      addr=commonlibifaceptr->commonlib_buftobigendian64bit(xbeedevice->receivebuf+4);
      netaddr=commonlibifaceptr->commonlib_buftobigendian16bit(xbeedevice->receivebuf+12);
      debuglibifaceptr->debuglib_printf(1, "%s: Unknown profileid: %04hX received from Zigbee device: %016llX, %04hX, clusterid=%04hX\n", __func__, profileid, addr, netaddr, clusterid);
      break;
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Xbee API unescaped packet
  Args: xbeedevice A pointer to xbeedevice structure used to store info about the xbee device including the receive buffer containing the packet
  NOTE: No need to mark xbee inuse here as all callers of this function do that already
*/
void xbeelib_process_api_packet(xbeedevice_t *xbeedevice, long *xbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  xbee_api_response_t *apicmd;
  long zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(xbee_api_response_t *) (xbeedevice->receivebuf);

  //Goto appropriate frame type processing function
  switch (apicmd->frametype) {
    case API_AT_RESPONSE:
      xbeelib_process_api_at_response(xbeedevice, xbeelocked, &zigbeelocked);
      break;
    case API_MODEM_STATUS:
      xbeelib_process_api_modem_status(xbeedevice, xbeelocked, &zigbeelocked);
      break;
    case API_TRANSMIT_STATUS:
      xbeelib_process_api_transmit_status(xbeedevice, xbeelocked, &zigbeelocked);
      break;
    case API_ZIGBEE_EXPLICIT_RX_INDICATOR:
      xbeelib_process_api_zigbee_explicit_rx_indicator(xbeedevice, xbeelocked, &zigbeelocked);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Received Xbee packet of unknown type: %02hhX\n", __func__, apicmd->frametype);
  }
  xbeelib_lockxbee(xbeelocked);
  if (xbeelib_waitingforresponse==XBEE_WAITING_FOR_ANYTHING) {
    xbeelib_waitresult=1;
  }
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

//=========================
//End of Protocol Functions
//=========================

/*
  Receive raw unprocessed xbee data from a function that received the data from the xbee device
  Args: serdevidx: The index to the serial device for the xbee device
        handlerdevidx: The index to this handler's xbee device or -1 if the xbee hasn't been setup yet (Still being detected)
        buffer: The buffer containing the raw data
        bufcnt: The number of bytes of data received
  NOTE: Don't need much thread locking since when this function is in the main loop it will be the only one using these variables
*/
void xbeelib_receiveraw(int serdevidx, int handlerdevidx, char *buffer, int bufcnt) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  unsigned char serchar;
  int bufpos=0, result;
  xbeedevice_t *xbeedevice; //A pointer to the xbee device that the data was received on
  long xbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  if (handlerdevidx!=-1) {
    //Assign to xbeedevice element
    xbeedevice=(xbeedevice_t *) &xbeelib_xbeedevices[handlerdevidx];
  } else {
    if (xbeelib_getdetectingdevice(&xbeelocked)) {
      //Only handle data from newxbee if we are currently detecting an xbee
      xbeedevice=&xbeelib_newxbee;

      //Prevent re-initialisation until finished in the receive thread
      PTHREAD_LOCK(&xbeelibmutex_initnewxbee);
    } else {
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  if (xbeelib_markxbee_inuse(xbeedevice, &xbeelocked)<0) {
    //Failed to mark xbee as inuse
    if (xbeedevice==&xbeelib_newxbee) {
      PTHREAD_UNLOCK(&xbeelibmutex_initnewxbee);
    }
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (xbeedevice->receivebuf==NULL) {
    xbeelib_markxbee_notinuse(xbeedevice, &xbeelocked);
    if (xbeedevice==&xbeelib_newxbee) {
      PTHREAD_UNLOCK(&xbeelibmutex_initnewxbee);
    }
    //Not ready to receive data yet ; This should never happen since the detect function will allocate space before
    //  the receive thread is switched from newxbee lib to the xbeelib list element
    debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Received data before buffer space allocated\n", __func__);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
#ifdef XBEELIB_MOREDEBUG
  {
    int i;
    char tmpstr[1024];
  
    debuglibifaceptr->debuglib_printf(1, "%s: Received bytes: ", __func__);
    for (i=0; i<bufcnt; i++) {
      sprintf(tmpstr+(i*3), "%02X ", (uint8_t) buffer[i]);
    }
    debuglibifaceptr->debuglib_printf(1, "%s\n", tmpstr);
  }
#endif
  //Loop until all waiting serial data has been processed
  bufpos=0;
  while (bufpos<bufcnt) {
    serchar=buffer[bufpos];
    ++bufpos;
    result=0;
    if (xbeedevice->receivebufcnt==BUFFER_SIZE) {
      //Throw away invalid data
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Received buffer size limit reached, throwing away %d bytes\n", __func__, BUFFER_SIZE);
      xbeedevice->receivebufcnt=0;
      xbeedevice->receive_checksum=0;
      xbeedevice->receive_processing_packet=0;
      xbeedevice->receive_escapechar=0;
      xbeedevice->receive_packetlength=0;
    }
    if (!xbeedevice->receive_processing_packet && serchar==0x7E && !xbeedevice->receive_escapechar) {
      //Found the beginning of an API packet
      xbeedevice->receivebufcnt=0;
      xbeedevice->receive_checksum=0;
      xbeedevice->receivebuf[xbeedevice->receivebufcnt++]=serchar;
      xbeedevice->receive_processing_packet=1;
      xbeedevice->receive_escapechar=0;
      continue;
    }
    if (serchar==0x7D && !xbeedevice->receive_escapechar) {
      //Escape character so wait for next character
      xbeedevice->receive_escapechar=1;
      continue;
    }
    if (xbeedevice->receive_escapechar) {
      serchar^=0x20;
      xbeedevice->receive_escapechar=0;
    }
    if (xbeedevice->receive_processing_packet) {
      xbeedevice->receivebuf[xbeedevice->receivebufcnt++]=serchar;
      if (xbeedevice->receivebufcnt==2) {
        xbeedevice->receive_packetlength=(((unsigned int) serchar) << 8);
      } else if (xbeedevice->receivebufcnt==3) {
        xbeedevice->receive_packetlength|=serchar;
      } else if (xbeedevice->receivebufcnt-4==xbeedevice->receive_packetlength) {
        xbeedevice->receive_processing_packet=0;
        xbeedevice->receive_checksum=0xFF-xbeedevice->receive_checksum;
        if (xbeedevice->receive_checksum!=xbeedevice->receivebuf[xbeedevice->receivebufcnt-1]) {
          //Invalid checksum so ignore
          debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Invalid checksum: %d received, expecting: %d, xbee packet length: %d\n", __func__, xbeedevice->receivebuf[xbeedevice->receivebufcnt-1], xbeedevice->receive_checksum, xbeedevice->receive_packetlength);
        } else {
          //A full API Packet has been received and is ready for processing

          //Process the API packet here
          xbeelib_process_api_packet(xbeedevice, &xbeelocked);
          xbeelib_lockxbee(&xbeelocked);
          if (xbeelib_waitresult) {
            sem_post(&xbeelib_waitforresponsesem);
            xbeelib_waitresult=0;
          }
          xbeelib_unlockxbee(&xbeelocked);
        }
        //Ready to process a new packet
        xbeelib_lockxbee(&xbeelocked);
        xbeedevice->receivebufcnt=0;
        xbeedevice->receive_checksum=0;
        xbeedevice->receive_processing_packet=0;
        xbeedevice->receive_escapechar=0;
        xbeedevice->receive_packetlength=0;
        xbeelib_unlockxbee(&xbeelocked);
      } else {
        xbeedevice->receive_checksum+=serchar;
      }
    } else {
      //Ignore invalid bytes here
    }
  }
  xbeelib_markxbee_notinuse(xbeedevice, &xbeelocked);
  if (xbeedevice==&xbeelib_newxbee) {
    PTHREAD_UNLOCK(&xbeelibmutex_initnewxbee);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Find a xbee device in the xbee table
  Arguments:
    xbeedevice A pointer to xbeedevice structure associated with the device
    addr: The 64-bit destination IEEE address of the device
  Returns the index of the xbee device or -1 if not found
*/
STATIC int xbeelib_find_xbee_device(uint64_t addr, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i, match_found=-1;
  int numxbeedevices;

  MOREDEBUG_ENTERINGFUNC();
  xbeelib_lockxbee(xbeelocked);
  numxbeedevices=_xbeelib_getnumxbeedevices();
  for (i=0; i<numxbeedevices; i++) {
    if (xbeelib_xbeedevices[i].addr==addr && !xbeelib_xbeedevices[i].removed && !xbeelib_xbeedevices[i].needtoremove) {
      match_found=i;
      break;
    }
  }
  xbeelib_unlockxbee(xbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return match_found;
}

//Initialise xbeelib_newxbee values
//When we copy xbeelib_newxbee to the xbee list, the zigbeedevices pointer will be used by that xbee element
//  so we shouldn't free it here just set it back to NULL.
static void _init_xbeelib_newxbee(void) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  unsigned char *receivebuf;

  MOREDEBUG_ENTERINGFUNC();

  //Wait for other threads to finish using newxbee first
  PTHREAD_LOCK(&xbeelibmutex_initnewxbee);

  //Backup receivebuf
  receivebuf=xbeelib_newxbee.receivebuf;

  //Clear xbeelib_newxbee
  memset(&xbeelib_newxbee, 0, sizeof(xbeedevice_t));

  //Restore receivebuf
  xbeelib_newxbee.receivebuf=receivebuf;

  //Set new non-zero initial values
  xbeelib_newxbee.serdevidx=-1;
  xbeelib_newxbee.zigbeelibindex=-1;
  xbeelib_newxbee.haendpoint=XBEE_HA_ENDPOINTID;

  PTHREAD_UNLOCK(&xbeelibmutex_initnewxbee);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Initialise a semaphore for waiting for a response to a packet
  Also applies the waitforresponse pthread lock
  Send your packet after calling this function and then call waitforresponse
  Returns negative value on error or >= 0 on success
*/
STATIC int xbeelib_initwaitforresponse(int waitingforresponseid, long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  MOREDEBUG_ENTERINGFUNC();

  PTHREAD_LOCK(&xbeelibmutex_waitforresponse);
  if (sem_init(&xbeelib_waitforresponsesem, 0, 0)==-1) {
    //Can't initialise semaphore
    PTHREAD_UNLOCK(&xbeelibmutex_waitforresponse);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  xbeelib_lockxbee(xbeelocked);
  xbeelib_waitingforresponse=waitingforresponseid;
  xbeelib_waitresult=0;
  xbeelib_unlockxbee(xbeelocked);

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

/*
  Wait for a response to a packet by waiting for the semaphore to be released
  Also releases the waitforresponse pthread lock
  Send your packet after calling initwaitforresponse and then call this function
  Returns negative value on error or >= 0 on success
*/
STATIC int xbeelib_waitforresponse(long *xbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int result, lerrno;
  struct timespec waittime;

  MOREDEBUG_ENTERINGFUNC();

  //Wait 1 second for the result
  clock_gettime(CLOCK_REALTIME, &waittime);
  waittime.tv_sec+=XBEE_DETECT_TIMEOUT;
  while ((result=sem_timedwait(&xbeelib_waitforresponsesem, &waittime)) == -1 && errno == EINTR)
    continue; /* Restart if interrupted by handler */
  lerrno=errno;
  xbeelib_lockxbee(xbeelocked);
  xbeelib_waitingforresponse=0;
  xbeelib_unlockxbee(xbeelocked);
  sem_destroy(&xbeelib_waitforresponsesem);
  PTHREAD_UNLOCK(&xbeelibmutex_waitforresponse);
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
int xbeelib_isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count)) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result, list_numitems;
  long xbeelocked=0;
  int retrycnt, i;
  uint8_t tmpbuf[30];

  MOREDEBUG_ENTERINGFUNC();

  PTHREAD_LOCK(&xbeelibmutex_detectingdevice);

  //Initialise values before setting detectingdevice flag so the values don't change while receive is running
  _init_xbeelib_newxbee();
  xbeelib_newxbee.serdevidx=serdevidx;
  xbeelib_newxbee.sendFuncptr=sendFuncptr;

  xbeelib_setdetectingdevice(1, &xbeelocked);
  debuglibifaceptr->debuglib_printf(1, "%s: serial device index=%d\n", __func__, serdevidx);

  retrycnt=0;
  while (retrycnt<2) {
    result=xbeelib_initwaitforresponse(XBEE_WAITING_FOR_AT_FIRMVER, &xbeelocked);
    if (result<0) {
      xbeelib_setdetectingdevice(0, &xbeelocked);
      PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
      MOREDEBUG_EXITINGFUNC();
      return -1;
    }
    xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_FIRMVER, NULL, 0, &xbeelocked);

    //Wait 1 second for the result
    result=xbeelib_waitforresponse(&xbeelocked);
    if (result<0) {
      if (retrycnt>0) {
        //Failed to receive the xbee firmware version
        xbeelib_setdetectingdevice(0, &xbeelocked);
        PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
        debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive Get Firmware Version Xbee response\n", __func__);
        return -1;
      }
    } else {
      //We got a response
      break;
    }
    //First send a special sequence to get the xbee to a stable state
    tmpbuf[0]=tmpbuf[1]=tmpbuf[2]=0x2B;
    sendFuncptr(serdevidx, tmpbuf, 3);
    xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_FIRMVER, NULL, 0, &xbeelocked);
    tmpbuf[0]='A';
    tmpbuf[1]='T';
    tmpbuf[2]=0x0D;
    sendFuncptr(serdevidx, tmpbuf, 3);
    memset(tmpbuf, 0xFF, 26);
    sendFuncptr(serdevidx, tmpbuf, 26);
    tmpbuf[0]=0xFE;
    tmpbuf[1]=0x00;
    tmpbuf[2]=0xFF;
    tmpbuf[3]=0x00;
    tmpbuf[4]=0x00;
    sendFuncptr(serdevidx, tmpbuf, 5);

    //Wait 100 milliseconds after init
    usleep(100000);

    ++retrycnt;
  }
  result=xbeelib_initwaitforresponse(XBEE_WAITING_FOR_AT_HWVER, &xbeelocked);
  if (result<0) {
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_HWVER, NULL, 0, &xbeelocked);
  result=xbeelib_waitforresponse(&xbeelocked);
  if (result<0) {
    //Failed to receive the xbee firmware version
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive Get Hardware Version Xbee response\n", __func__);
    return -1;
  }
  result=xbeelib_initwaitforresponse(XBEE_WAITING_FOR_AT_SERNUMHIGH, &xbeelocked);
  if (result<0) {
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_SERNUMHIGH, NULL, 0, &xbeelocked);
  result=xbeelib_waitforresponse(&xbeelocked);
  if (result<0) {
    //Failed to receive the xbee firmware version
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive Serial Number High Xbee response\n", __func__);
    return -1;
  }
  result=xbeelib_initwaitforresponse(XBEE_WAITING_FOR_AT_SERNUMLOW, &xbeelocked);
  if (result<0) {
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  xbeelib_send_xbee_at_command(&xbeelib_newxbee, XBEE_AT_CMD_SERNUMLOW, NULL, 0, &xbeelocked);
  result=xbeelib_waitforresponse(&xbeelocked);
  if (result<0) {
    //Failed to receive the xbee firmware version
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive Serial Number Low Xbee response\n", __func__);
    return -1;
  }
  //Don't need to lock very much here since the values were set during detect
  xbeelib_lockxbee(&xbeelocked);
  debuglibifaceptr->debuglib_printf(1, "%s: Firmware version=%04hX\n", __func__, xbeelib_newxbee.firmver);
  debuglibifaceptr->debuglib_printf(1, "%s: Hardware version=%04hX\n", __func__, xbeelib_newxbee.hwver);
  debuglibifaceptr->debuglib_printf(1, "%s: 64-bit Network Address=%016llX\n", __func__, xbeelib_newxbee.addr);
  if ((xbeelib_newxbee.firmver & 0xF000)==0x2000) {
    if ((xbeelib_newxbee.firmver & 0x0F00)==0x0100) {
      xbeelib_newxbee.device_type=ZIGBEE_DEVICE_TYPE_COORDINATOR;
    } else if ((xbeelib_newxbee.firmver & 0x0F00)==0x0300) {
      xbeelib_newxbee.device_type=ZIGBEE_DEVICE_TYPE_ROUTER;
    } else if ((xbeelib_newxbee.firmver & 0x0F00)==0x0900) {
      xbeelib_newxbee.device_type=ZIGBEE_DEVICE_TYPE_END_DEVICE;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Product Family=%s\n", __func__, xbeelib_get_product_family_string(xbeelib_newxbee.hwver));
  debuglibifaceptr->debuglib_printf(1, "%s: Firmware Type=%s\n", __func__, xbeelib_get_firmware_type_string(xbeelib_newxbee.firmver));
  debuglibifaceptr->debuglib_printf(1, "%s: Function Set=%s\n", __func__, xbeelib_get_function_set_string(xbeelib_newxbee.firmver));

  //Setup a list entry for the xbee device
  //This is the only thread that will modify xbeelib_numxbeedevices during multi-threading code so don't need to lock while accessing it

  //First search for an empty slot
  for (i=0; i<MAX_XBEE_DEVICES; i++) {
    if (xbeelib_xbeedevices[i].removed) {
      break;
    }
  }
  if (i==MAX_XBEE_DEVICES) {
    xbeelib_setdetectingdevice(0, &xbeelocked);
    PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d Xbee devices has been reached\n", __func__, MAX_XBEE_DEVICES);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  } else {
    list_numitems=i;
  }
  //Reset detecting device so receiveraw stops using xbeelib_newxbee
  xbeelib_detectingdevice=0;

  //If receiveraw is running it will have marked xbeelib_newxbeeha in use so we need to wait for it to finish and
  //  then it will be safe to make an atomic copy of the structure
  //Also need to unlock xbee so receiveraw can lock.  This is okay as this is the only place where new xbee devices
  //  are added
  xbeelib_unlockxbee(&xbeelocked);
  PTHREAD_LOCK(&xbeelibmutex_initnewxbee);
  memcpy(&xbeelib_xbeedevices[list_numitems], &xbeelib_newxbee, sizeof(xbeedevice_t));
  PTHREAD_UNLOCK(&xbeelibmutex_initnewxbee);
  xbeelib_lockxbee(&xbeelocked);

  //Allocate new memory for the receive buffers
  xbeelib_xbeedevices[list_numitems].receivebuf=(unsigned char *) malloc(BUFFER_SIZE*sizeof(unsigned char *));

  if (i==xbeelib_numxbeedevices) {
    ++xbeelib_numxbeedevices;
  }
  xbeelib_unlockxbee(&xbeelocked);

  PTHREAD_UNLOCK(&xbeelibmutex_detectingdevice);

  MOREDEBUG_EXITINGFUNC();

  return list_numitems;
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
STATIC int xbeelib_processcommand(const char *buffer, int clientsock) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=xbeelib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  char tmpstrbuf[100];
  int i, len, found;
  uint64_t addr;
  int numxbeedevices;
  xbeedevice_t *xbeedeviceptr;
  long xbeelocked=0;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();

  len=strlen(buffer);
  if (strncmp(buffer, "xbee_form_network ", 18)==0 && len>=34) {
    //Format: xbee_form_network <64-bit addr>
    sscanf(buffer+18, "%016llX", (unsigned long long *) &addr);
    xbeelib_lockxbee(&xbeelocked);
    found=xbeelib_find_xbee_device(addr, &xbeelocked);
    if (found>=0) {
      xbeelib_send_xbee_form_network(&xbeelib_xbeedevices[found], XBEE_CHANMASK_STANDARD, &xbeelocked);
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "XBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "xbee_form_network_netvoxchan ", 29)==0 && len>=45) {
    //Format: xbee_form_network <64-bit addr>
    sscanf(buffer+29, "%016llX", (unsigned long long *) &addr);
    xbeelib_lockxbee(&xbeelocked);
    found=xbeelib_find_xbee_device(addr, &xbeelocked);
    if (found>=0) {
      xbeelib_send_xbee_form_network(&xbeelib_xbeedevices[found], XBEE_CHANMASK_NETVOX, &xbeelocked);
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "XBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "xbee_leave_network ", 19)==0 && len>=35) {
    //Format: xbee_leave_network <64-bit addr>
    sscanf(buffer+19, "%016llX", (unsigned long long *) &addr);
    xbeelib_lockxbee(&xbeelocked);
    found=xbeelib_find_xbee_device(addr, &xbeelocked);
    if (found>=0) {
      xbeelib_send_xbee_leave_network(&xbeelib_xbeedevices[found], &xbeelocked);
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "OKAY\n");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      xbeelib_unlockxbee(&xbeelocked);
      sprintf(tmpstrbuf, "XBEE: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "get_xbee_info", 13)==0) {
    int found=0;

    //Format: get_xbee_info
    xbeelib_lockxbee(&xbeelocked);
    numxbeedevices=_xbeelib_getnumxbeedevices();
    for (i=0; i<numxbeedevices; i++) {
      uint16_t firmver, hwver;
      uint8_t device_type, network_connected, encryptednetwork, channel;
      uint16_t netaddr, panid;
      uint64_t extpanid, addr;
      int have_network_status_values;

      xbeedeviceptr=&xbeelib_xbeedevices[i];
      if (xbeedeviceptr->removed || xbeedeviceptr->needtoremove) {
        continue;
      } else {
        found=1;
      }
      firmver=xbeedeviceptr->firmver;
      hwver=xbeedeviceptr->hwver;
      device_type=xbeedeviceptr->device_type;
      addr=xbeedeviceptr->addr;
      network_connected=xbeedeviceptr->network_connected;
      encryptednetwork=xbeedeviceptr->encryptednetwork;
      channel=xbeedeviceptr->channel;
      netaddr=xbeedeviceptr->netaddr;
      panid=xbeedeviceptr->panid;
      extpanid=xbeedeviceptr->extpanid;
      have_network_status_values=xbeedeviceptr->have_network_status_values;

      if (network_connected && have_network_status_values) {
        sprintf(tmpstrbuf, "XBEE 64-bit ADDRESS: %016llX : %04hX\n", (unsigned long long) addr, (unsigned short) netaddr);
      } else {
        sprintf(tmpstrbuf, "XBEE 64-bit ADDRESS: %016llX\n", (unsigned long long) addr);
      }
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Firmware version=%04hX\n", firmver);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Hardware version=%04hX\n", hwver);
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Product Family=%s\n", xbeelib_get_product_family_string(hwver));
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Firmware Type=%s\n", xbeelib_get_firmware_type_string(firmver));
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Function Set=%s\n", xbeelib_get_function_set_string(firmver));
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);

      sprintf(tmpstrbuf, "  Connected to Network: %s\n", (network_connected==1) ? "Yes" : "No");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Encrypted: %s\n", (encryptednetwork==1) ? "Yes" : "No");
      commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      if (network_connected) {
        sprintf(tmpstrbuf, "  Channel=%02hhX\n", channel);
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
        sprintf(tmpstrbuf, "  Pan ID=%04hX\n", panid);
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
        sprintf(tmpstrbuf, "  Extended Pan ID=%016llX\n", (unsigned long long) extpanid);
        commonserverlibifaceptr->serverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
    }
    if (!found) {
      commonserverlibifaceptr->serverlib_netputs("NO XBEE DEVICES FOUND\n", clientsock, NULL);
    }
    xbeelib_unlockxbee(&xbeelocked);
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return CMDLISTENER_NOERROR;
}

/*
  A function called by the serial port library when the xbee device has been removed
  If the xbeedevice is still in use we return negative value but mark the xbee for removal so
    it won't be used again and can be removed on the next call to this function
  Return 1 if removed, 0 if still in use, or negative value on error
*/
int xbeelib_serial_device_removed(int serdevidx) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  int i, index, result;
  int numxbeedevices;
  xbeedevice_t *xbeedeviceptr=NULL;
  long xbeelocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  xbeelib_lockxbee(&xbeelocked);

  numxbeedevices=_xbeelib_getnumxbeedevices();
  for (i=0; i<numxbeedevices; i++) {
    xbeedeviceptr=&xbeelib_xbeedevices[i];
    if (xbeedeviceptr->removed) {
      //This xbee has been removed so we can't trust any other values
      continue;
    }
    if (xbeedeviceptr->serdevidx==serdevidx) {
      //Found a match for serdevidx
      break;
    }
  }
  if (i==numxbeedevices) {
    xbeelib_unlockxbee(&xbeelocked);

    MOREDEBUG_EXITINGFUNC();

    //If we get here it is because there wasn't a match for serdevidx
    return -2;
  }
  if (!xbeedeviceptr->needtoremove) {
    //Mark that this xbee needs to be removed so other functions stop using it
    debuglibifaceptr->debuglib_printf(1, "%s: Marking Xbee %016llX at index: %d for removal\n", __func__, xbeedeviceptr->addr, i);
    xbeedeviceptr->needtoremove=1;
  }
  if (xbeedeviceptr->zigbeelibindex>=0 && zigbeelibifaceptr) {
		result=zigbeelibifaceptr->remove_localzigbeedevice(xbeedeviceptr->zigbeelibindex, &xbeelocked, &zigbeelocked);
		if (result==0) {
			//Still in use so we can't cleanup yet
			debuglibifaceptr->debuglib_printf(1, "%s: Xbee %016llX at index: %d is still in use: %d by Zigbee so it cannot be fully removed yet\n", __func__, xbeedeviceptr->addr, i, xbeedeviceptr->inuse);

			xbeelib_unlockxbee(&xbeelocked);

			MOREDEBUG_EXITINGFUNC();
			return 0;
		}
	}
  if (xbeedeviceptr->inuse) {
    //Still in use so we can't cleanup yet
    debuglibifaceptr->debuglib_printf(1, "%s: Xbee %016llX at index: %d is still in use: %d so it cannot be fully removed yet\n", __func__, xbeedeviceptr->addr, i, xbeedeviceptr->inuse);

    xbeelib_unlockxbee(&xbeelocked);

    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  //Remove the Xbee from ram
  index=i; //So we can refer to the index later on

  if (xbeedeviceptr->receivebuf) {
    free(xbeedeviceptr->receivebuf);
    xbeedeviceptr->receivebuf=NULL;
  }
  //We can remove the xbee as it isn't in use
  debuglibifaceptr->debuglib_printf(1, "%s: Xbee %016llX at index: %d has now been removed\n", __func__, xbeedeviceptr->addr, index);
  memset(xbeedeviceptr, 0, sizeof(xbeedevice_t));
  xbeedeviceptr->serdevidx=-1;
  xbeedeviceptr->zigbeelibindex=-1;

  xbeedeviceptr->removed=1;

  xbeelib_unlockxbee(&xbeelocked);

  MOREDEBUG_EXITINGFUNC();

  //The device was successfully removed
  return 1;
}

//Get info about the Xbee network status
STATIC void xbeelib_get_xbee_network_status(xbeedevice_t *xbeedevice, long *xbeelocked, long *zigbeelocked) {
  struct timespec curtime;

  MOREDEBUG_ENTERINGFUNC();

  xbeelib_lockxbee(xbeelocked);
  xbeedevice->have_network_status_values=0;
  xbeedevice->received_network_status_values=0;
  xbeelib_unlockxbee(xbeelocked);

  //Just request all values needed for full network status and then the receive function will handle storing
  //  and resetting the zigbee cache if necessary
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_ENCRYPTENABLE, NULL, 0, xbeelocked);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_OPERCHANNEL, NULL, 0, xbeelocked);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_GETNETADDR, NULL, 0, xbeelocked);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_OPERPANID, NULL, 0, xbeelocked);
  xbeelib_send_xbee_at_command(xbeedevice, XBEE_AT_CMD_OPEREXTPANID, NULL, 0, xbeelocked);

  //Update the time that the connection status was last refreshed
  clock_gettime(CLOCK_REALTIME, &curtime);
  xbeedevice->last_connect_status_refresh=curtime.tv_sec;

  MOREDEBUG_EXITINGFUNC();
}

//Refresh data from xbee devices
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
STATIC void xbeelib_refresh_xbee_data(void) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=xbeelib_deps[ZIGBEELIB_DEPIDX].ifaceptr;
  zigbeelib_localzigbeedevice_ver_1_t localzigbeedevice;
  int i, pos, result;
  int numxbeedevices;
  int have_network_status_values=0;
  struct timespec curtime;
  long xbeelocked=0, zigbeelocked=0;

  //Refresh data from xbee devices
  MOREDEBUG_ENTERINGFUNC();
  localzigbeedevice.devicetype="Xbee";
  numxbeedevices=xbeelib_getnumxbeedevices(&xbeelocked);
  for (i=0; i<numxbeedevices; i++) {
    xbeedevice_t *xbeedeviceptr;

    xbeedeviceptr=&xbeelib_xbeedevices[i];
    if (xbeelib_markxbee_inuse(xbeedeviceptr, &xbeelocked)<0) {
      //Unable to mark this xbee for use
      continue;
    }
    clock_gettime(CLOCK_REALTIME, &curtime);
    if (xbeedeviceptr->last_connect_status_refresh+XBEE_CONNECT_STATUS_POLL_INTERVAL<curtime.tv_sec) {
      xbeelib_get_xbee_network_status(xbeedeviceptr, &xbeelocked, &zigbeelocked);
    }
    xbeelib_lockxbee(&xbeelocked);
    localzigbeedevice.addr=xbeedeviceptr->addr;
    localzigbeedevice.deviceptr=xbeedeviceptr;
    if (xbeedeviceptr->zigbeelibindex<0 && zigbeelibifaceptr) {
      xbeedeviceptr->zigbeelibindex=zigbeelibifaceptr->add_localzigbeedevice(&localzigbeedevice, &xbeelib_localzigbeedevice_iface_ver_1, ZIGBEE_FEATURE_RECEIVEREPORTPACKETS|ZIGBEE_FEATURE_NOHACLUSTERS, &xbeelocked, &zigbeelocked);
    }
    if (xbeedeviceptr->zigbeelibindex<0) {
      xbeelib_unlockxbee(&xbeelocked);
      xbeelib_markxbee_notinuse(xbeedeviceptr, &xbeelocked);
      continue;
    }
    if (!xbeedeviceptr->haendpointregistered && zigbeelibifaceptr) {
      //Register the Home Automation endpoint id that we will be using
      result=zigbeelibifaceptr->register_home_automation_endpointid(xbeedeviceptr->zigbeelibindex, xbeedeviceptr->haendpoint, &xbeelocked, &zigbeelocked);
      if (result==0) {
        xbeedeviceptr->haendpointregistered=1;
      }
    }
    have_network_status_values=xbeedeviceptr->have_network_status_values;
    xbeelib_unlockxbee(&xbeelocked);
    if (xbeelib_xbee_connected_to_network(xbeedeviceptr, &xbeelocked) && have_network_status_values==1 && zigbeelibifaceptr) {
      //Check if the connected Xbee module has been added as a Zigbee device
      pos=zigbeelibifaceptr->find_zigbee_device(xbeedeviceptr->zigbeelibindex, xbeedeviceptr->addr, xbeedeviceptr->netaddr, &xbeelocked, &zigbeelocked);
      if (pos==-1) {
        //TODO: Handle detection of sleepy Xbee devices
        zigbeelibifaceptr->add_zigbee_device(xbeedeviceptr->zigbeelibindex, xbeedeviceptr->addr, xbeedeviceptr->netaddr, ZIGBEE_DEVICE_TYPE_COORDINATOR, 1, &xbeelocked, &zigbeelocked);
      }
    }
    xbeelib_markxbee_notinuse(xbeedeviceptr, &xbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Main Xbee thread loop that manages initialisation, shutdown, and outgoing communication to the Xbee devices
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *xbeelib_mainloop(void *val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  time_t currenttime;
  struct timespec semwaittime;
  long xbeelocked=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  while (!xbeelib_getneedtoquit(&xbeelocked)) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);
    currenttime=semwaittime.tv_sec;

    xbeelib_refresh_xbee_data();

    if (xbeelib_getneedtoquit(&xbeelocked)) {
      break;
    }
    //Sleep until the next second so enough time for Zigbee pulse monitoring
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
#ifdef XBEELIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Sleeping\n", __func__);
#endif
    sem_timedwait(&xbeelib_mainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static inline void xbeelib_setneedtoquit(int val, long *xbeelocked) {
  xbeelib_lockxbee(xbeelocked);
  needtoquit=val;
  xbeelib_unlockxbee(xbeelocked);
}

static inline int xbeelib_getneedtoquit(long *xbeelocked) {
  int val;

  xbeelib_lockxbee(xbeelocked);
  val=needtoquit;
  xbeelib_unlockxbee(xbeelocked);

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int xbeelib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  //Start a thread for auto detecting Xbee modules
  if (xbeelib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&xbeelib_mainthread, NULL, xbeelib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
      result=-1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
void xbeelib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (xbeelib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    PTHREAD_LOCK(&xbeelibmutex);
    needtoquit=1;
    sem_post(&xbeelib_mainthreadsleepsem);
    PTHREAD_UNLOCK(&xbeelibmutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(xbeelib_mainthread, NULL);
    xbeelib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int xbeelib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=xbeelib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (xbeelib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __func__);
    return -1;
  }
  ++xbeelib_inuse;
  if (xbeelib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, xbeelib_inuse);
    return -1;
  }
  //Let the serial library know that we want to use it
  if (serialportlibifaceptr) {
    serialportlibifaceptr->init();
  }
  needtoquit=0;
  if (sem_init(&xbeelib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  xbeelib_numxbeedevices=0;
  if (!xbeelib_xbeedevices) {
    xbeelib_xbeedevices=calloc(MAX_XBEE_DEVICES, sizeof(xbeedevice_t));
    if (!xbeelib_xbeedevices) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for xbee devices\n", __func__);
      return -3;
    }
    //Clear and initialise the new array elements
    for (i=0; i<MAX_XBEE_DEVICES; i++) {
      xbeelib_xbeedevices[i].removed=1;
    }
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&xbeelibmutex, &errorcheckmutexattr);
  pthread_mutex_init(&xbeelibmutex_waitforresponse, &errorcheckmutexattr);
  pthread_mutex_init(&xbeelibmutex_detectingdevice, &errorcheckmutexattr);
  pthread_mutex_init(&xbeelibmutex_initnewxbee, &errorcheckmutexattr);
#endif

  _init_xbeelib_newxbee();

  //Allocate storage for the new xbee device receive buffer
  if (!xbeelib_newxbee.receivebuf) {
    xbeelib_newxbee.receivebuf=(unsigned char *) malloc(BUFFER_SIZE*sizeof(unsigned char *));
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void xbeelib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=xbeelib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (xbeelib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --xbeelib_inuse;
  if (xbeelib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, xbeelib_inuse);
    return;
  }
  //Start shutting down library
  xbeelib_shuttingdown=1;

  //Finished using the serial port library
  if (serialportlibifaceptr) {
    serialportlibifaceptr->shutdown();
  }
  xbeelib_shuttingdown=0;

  //Free allocated memory
  if (xbeelib_xbeedevices) {
    for (i=0; i<xbeelib_numxbeedevices; i++) {
      if (xbeelib_xbeedevices[i].receivebuf) {
        free(xbeelib_xbeedevices[i].receivebuf);
        xbeelib_xbeedevices[i].receivebuf=NULL;
      }
    }
    xbeelib_numxbeedevices=0;
    free(xbeelib_xbeedevices);
    xbeelib_xbeedevices=NULL;
  }
  if (xbeelib_newxbee.receivebuf) {
    free(xbeelib_newxbee.receivebuf);
    xbeelib_newxbee.receivebuf=NULL;
  }
  sem_destroy(&xbeelib_mainthreadsleepsem);

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&xbeelibmutex);
  pthread_mutex_destroy(&xbeelibmutex_waitforresponse);
  pthread_mutex_destroy(&xbeelibmutex_detectingdevice);
  pthread_mutex_destroy(&xbeelibmutex_initnewxbee);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for xbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void xbeelib_register_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=xbeelib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=xbeelib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(xbeelib_processcommand);
  }
  if (serialportlibifaceptr) {
    serialportlibifaceptr->register_serial_handler(&xbeelib_devicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for xbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void xbeelib_unregister_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=xbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=xbeelib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=xbeelib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(xbeelib_processcommand);
  }
  if (serialportlibifaceptr) {
    serialportlibifaceptr->unregister_serial_handler(&xbeelib_devicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *xbeelib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &xbeelib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_XbeeLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) xbeelib_getmoduleinfo();
}
#endif
