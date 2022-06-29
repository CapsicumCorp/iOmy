/*
Title: RapidHA Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with MMB Research RapidConnect RapidHA Zigbee modules
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

NOTE: We have seen the following RapidHA firmware versions:
  0.9.0 : Early RapidHA Model with USB ID: 10c4:8293
    Has a tendency to brick itself if watch inputs crashes
    Also, seems to run out of ram after a few days if more than one packet is sent simultaneously over the Zigbee network
  1.2.0 : Modern RapidHA Model with USB ID: 10c4:88a4
    More reliable than the early models
    Also, seems to run out of ram after a few days if more than one packet is sent simultaneously over the Zigbee network
  1.5.3 : New firmware update that adds proper support for the report attribute
    NOTE: It is only passing through non-manufacturer specific reports.  Manufacturer specific reports are rejected by
      the RapidHA with ZCL error code: 0x84
  1.5.6 : New firmware update that adds support for manufacturer specific attribute reports
*/

//NOTE: With 9600, 115200 serial order, the RapidHA module fails to intialise on 9600 baud, but then initialises at 115200
//NOTE: Might need to use convert to LSB functions for rapidha packets for Android although wikipedia says it uses LSB which is similar to x86: htole16 and htole64
//NOTE: The firmware update runs in the main thread but it might not be worth moving to a dedicated thread as it isn't run very often

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
#endif
#include "moduleinterface.h"
#include "rapidhalib.h"
#include "main/mainlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/serialportlib/serialportlib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/zigbeelib/zigbeelib.h"

//ifaceptr shortcuts
#define DEBUGLIB_IFACEPTR const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
#define SERIALPORTLIB_IFACEPTR const serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=reinterpret_cast<const serialportlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("serialportlib", SERIALPORTLIBINTERFACE_VER_1));
#define CMDSERVERLIB_IFACEPTR const cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=reinterpret_cast<const cmdserverlib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("cmdserverlib", CMDSERVERLIBINTERFACE_VER_1));
#define ZIGBEELIB_IFACEPTR const zigbeelib_ifaceptrs_ver_1_t *zigbeelibifaceptr=reinterpret_cast<const zigbeelib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("zigbeelib", ZIGBEELIBINTERFACE_VER_1));
#define COMMONLIB_IFACEPTR const commonlib_ifaceptrs_ver_2_t *commonlibifaceptr=reinterpret_cast<const commonlib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("commonlib", COMMONLIBINTERFACE_VER_2));
#define MAINLIB_IFACEPTR const mainlib_ifaceptrs_ver_2_t *mainlibifaceptr=reinterpret_cast<const mainlib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("mainlib", MAINLIBINTERFACE_VER_2));

#ifdef DEBUG
#warning "RAPIDHALIB_PTHREAD_LOCK and RAPIDHALIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define RAPIDHALIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    rapidhalib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    rapidhalib_backtrace(); \
  } \
}

#define RAPIDHALIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    rapidhalib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    rapidhalib_backtrace(); \
  } \
}

#else

#define RAPIDHALIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define RAPIDHALIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef RAPIDHALIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef RAPIDHALIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef RAPIDHALIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() DEBUGLIB_IFACEPTR
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#ifdef RAPIDHALIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef RAPIDHALIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef RAPIDHALIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() DEBUGLIB_IFACEPTR
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef RAPIDHALIB_MOREDEBUG
#define INLINE
#else
#define INLINE inline
#endif

#define BUFFER_SIZE 256

#define MAX_RAPIDHA_DEVICES 10 //Maximum number of rapidha devices to allow

#define RAPIDHA_DETECT_TIMEOUT 1 //Use 1 second timeout when detecting the RapidHA device

//NOTE: Firmware images can take a while to upload
#define RAPIDHA_FIRMWARE_UPDATE_MAX_WAIT_TIME 300 //Max time in seconds to wait for a firmware upgrade to complete
#define RAPIDHA_FIRMWARE_UPDATE_MAX_RETRIES 10000 //Sometimes a block fails to apply so the module will ask for it again
#define RAPIDHA_FIRMWARE_UPDATE_OFFSET_PROGRESS 10 //Number of seconds to allow the offset to not progress

#define RAPIDHA_FIRMWARE_UPDATE_PROGRESS_DONE 0
#define RAPIDHA_FIRMWARE_UPDATE_PROGRESS_UPDATING 1
#define RAPIDHA_FIRMWARE_UPDATE_PROGRESS_ENDING 2

typedef struct {
  char removed; //This rapidha device has been removed so is free to be reused by a new rapidha device
  char needtoremove; //This rapidha device has been scheduled for removal so functions should stop using it
  long inuse; //This rapidha device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  int serdevidx;
  int (*sendFuncptr)(int serdevidx, const void *buf, size_t count);
  int zigbeelibindex;
  int haendpointregistered; //1=The HA Endpoint has been registered with the Zigbee library
  //pthread_mutex_t sendmutex; //Locked when we a thread is using the send buffer
  unsigned char *receivebuf;
  int receivebufcnt; //Number of bytes currently being used in the receive buffer
  uint8_t firmmaj; //RapidHA Firmware version
  uint8_t firmmin;
  uint8_t firmbuild;
  uint8_t network_state; //RapidHA network state
  uint8_t device_type; //RapidHA Device Type
  uint8_t cfgstate;
  uint8_t channel;
  uint16_t netaddr;
  uint16_t panid;
  uint64_t extpanid;
  uint64_t addr; //64-bit IEEE address of the rapidha device
  uint8_t waitingforresponse; //Set to 1 every time we send a remote Zigbee packet via this RapidHA device
  uint8_t needreinit; //We have scheduled full reinitialisation of this device
                      //1=Init as Coordinator
                      //2=Init as Router
                      //3=Init as Non-Sleepy End Device
                      //4=Init as Sleepy End Device

  uint8_t reportingsupported; //>= 1.5.3 supports attribute reports
  uint8_t manureportingsupported; //>= 1.5.6 supports manufacturer attribute reports

  //These variables are used for upgrading the firmware on a rapidha
  char *firmware_file; //Specifies the file to upgrade to and if not NULL means an upgrade has been requested
  int firmwarefile_fd; //Descriptor for the open firmware file
  uint32_t firmware_file_offset; //The current offset that we are expecting the RapidHA module to ask for
  int firmware_retries; //Block retry count

  int firmware_progress; //Negative value means the firmware update has aborted, positive value means the update is progressing, 0 means the update is finished

  //These variables need to carry across calls to the rapidha receive function
  uint8_t receive_processing_packet, receive_escapechar;
  uint16_t receive_checksum;
  uint8_t receive_packetlength;

  int waiting_for_remotestatus; //-1=Not waiting, other values may indicate the frameid we're waiting for
  int waiting_for_remotequeueidx; //Index if the item in the send queue of the packet we are waiting for a response from
} rapidhadevice_t;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;

STATIC pthread_mutex_t rapidhalibmutex;
static pthread_mutex_t rapidhalibmutex_waitforresponse;
static pthread_mutex_t rapidhalibmutex_detectingdevice;
static pthread_mutex_t rapidhalibmutex_initnewrapidha;
#else
static pthread_mutex_t rapidhalibmutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t rapidhalibmutex_waitforresponse = PTHREAD_MUTEX_INITIALIZER; //Locked when we are waiting for a response from a rapidha device
static pthread_mutex_t rapidhalibmutex_detectingdevice = PTHREAD_MUTEX_INITIALIZER; //Locked when we are detecting a rapidha device
static pthread_mutex_t rapidhalibmutex_initnewrapidha = PTHREAD_MUTEX_INITIALIZER; //Locked when we want to re-initialise the newrapidha structure so we wait for threads that are still using it
#endif

//rapidhalib_waitingforresponse should only be set inside the locks: rapidhalibmutex_waitforresponse and rapidhalibmutex
//  It also should be set to a 0 while rapidhalib_waitforresponsesem isn't valid
static sem_t rapidhalib_waitforresponsesem; //This semaphore will be initialised when waiting for response
static int rapidhalib_waitingforresponse; //Set to one of the RAPIDHA_WAITING_FOR_ types when the waiting for a response semaphore is being used
static int rapidhalib_waitresult; //Set to 1 if the receive function receives the response that was being waited for

//Used by the receive function to decide whether to use rapidhalib_rapidhadevices or rapidhalib_newrapidha
STATIC int rapidhalib_detectingdevice; //Set to 1 when a device is being detected

static sem_t rapidhalib_mainthreadsleepsem; //Used for main thread sleeping

static int rapidhalib_inuse=0; //Only shutdown when inuse = 0
static int rapidhalib_shuttingdown=0;

STATIC char needtoquit=0; //Set to 1 when rapidhalib should exit

static pthread_t rapidhalib_mainthread=0;

STATIC int rapidhalib_numrapidhadevices=0;
STATIC rapidhadevice_t rapidhalib_newrapidha; //Used for new rapidha devices that haven't been fully detected yet
STATIC rapidhadevice_t *rapidhalib_rapidhadevices; //A list of detected rapidha devices

STATIC int rapidhalib_needmoreinfo=0; //Set to non-zero when a RapidHA/Zigbee device needs more info to indicate that we shouldn't sleep for very long

//Function Declarations
int rapidhalib_markrapidha_inuse(void *rapidhadevice, long *rapidhalocked);
int rapidhalib_markrapidha_notinuse(void *rapidhadevice, long *rapidhalocked);
static void rapidhalib_setneedtoquit(int val, long *rapidhalocked);
static int rapidhalib_getneedtoquit(long *rapidhalocked);
int rapidhalib_start(void);
void rapidhalib_stop(void);
int rapidhalib_init(void);
void rapidhalib_shutdown(void);
void rapidhalib_register_listeners(void);
void rapidhalib_unregister_listeners(void);

void __rapidhalib_send_zigbee_zdo(rapidhadevice_t *rapidhadevice, void *zigbeecmd, uint8_t zigbeecmdlen, uint64_t addr, uint16_t netaddr, uint16_t clusterid, long *rapidhalocked, long *zigbeelocked);

void __rapidhalib_send_zigbee_zdo_new(void *rapidhadevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *rapidhalocked, long *zigbeelocked);
void __rapidhalib_send_zigbee_zcl_new(void *rapidhadevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *rapidhalocked, long *zigbeelocked);
void rapidhalib_send_zigbee_zcl_multi_attribute_read(rapidhadevice_t *rapidhadevice, zcl_general_request_t *zclcmd, long *rapidhalocked, long *zigbeelocked);

void rapidhalib_send_rapidha_network_comissioning_permit_join(void *rapidhadevice, uint8_t duration, long *rapidhalocked);
int rapidhalib_rapidha_connected_to_network(void *localzigbeedevice, long *rapidhalocked);


void rapidhalib_receiveraw(int serdevidx, int handlerdevidx, char *buffer, int bufcnt);
int rapidhalib_isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));
int rapidhalib_serial_device_removed(int serdevidx);

//Module Interface Definitions

//NOTE: rapidhalib_send_zigbee_zcl_multi_attribute_read is disabled for now as it doesn't seem to send
//  back any status during success or timeout

STATIC moduledep_ver_1_t rapidhalib_deps[]={
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
    1
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_2,
    1
  },
  {
    "mainlib",
    nullptr,
    MAINLIBINTERFACE_VER_2,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t rapidhalib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "rapidhalib",
  rapidhalib_init,
  rapidhalib_shutdown,
  rapidhalib_start,
  rapidhalib_stop,
  rapidhalib_register_listeners,
  rapidhalib_unregister_listeners,
  nullptr,
  (moduledep_ver_1_t (*)[]) &rapidhalib_deps
};

static serialdevicehandler_iface_ver_1_t rapidhalib_devicehandler_iface_ver_1={
  "rapidhalib",
  rapidhalib_isDeviceSupported,
  rapidhalib_receiveraw,
  rapidhalib_serial_device_removed
};

static zigbeelib_localzigbeedevice_iface_ver_1_t rapidhalib_localzigbeedevice_iface_ver_1={
  "rapidhalib",
  rapidhalib_markrapidha_inuse,
  rapidhalib_markrapidha_notinuse,
  nullptr,
  nullptr,
  __rapidhalib_send_zigbee_zdo_new,
  __rapidhalib_send_zigbee_zcl_new,
  nullptr,
  nullptr,
  rapidhalib_send_rapidha_network_comissioning_permit_join,
  rapidhalib_rapidha_connected_to_network
};

//Find a pointer to module interface pointer
//Returns the pointer to the interface or NULL if not found
//NOTE: A little slower than referencing the array element directly, but less likely to cause a programming fault
//  due to rearranging depencencies
static const void *getmoduledepifaceptr(const char *modulename, unsigned ifacever) {
	int i=0;

	while (rapidhalib_deps[i].modulename) {
		if (strcmp(rapidhalib_deps[i].modulename, modulename)==0) {
			if (rapidhalib_deps[i].ifacever==ifacever) {
				return rapidhalib_deps[i].ifaceptr;
			}
		}
		++i;
	}
	return nullptr;
}

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static inline void rapidhalib_backtrace(void) {
  DEBUGLIB_IFACEPTR
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
static inline void rapidhalib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey=NULL;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey=0;

//Initialise a thread local store for the lock counter
static void rapidhalib_makelockkey(void) {
  int result;

  result=pthread_key_create(&lockkey, NULL);
  if (result!=0) {
    DEBUGLIB_IFACEPTR
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
  } else {
    havelockkey=1;
  }
}

/*
  Apply the rapidha mutex lock if not already applied otherwise increment the lock count
*/
void rapidhalib_lockrapidha(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, rapidhalib_makelockkey);
  if (!havelockkey) {
    DEBUGLIB_IFACEPTR
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
    RAPIDHALIB_PTHREAD_LOCK(&rapidhalibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);
#ifdef RAPIDHALIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the rapidha mutex lock
*/
void rapidhalib_unlockrapidha(void) {
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, rapidhalib_makelockkey);
  if (!havelockkey) {
    DEBUGLIB_IFACEPTR
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    DEBUGLIB_IFACEPTR
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    rapidhalib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    RAPIDHALIB_PTHREAD_UNLOCK(&rapidhalibmutex);
  }
#ifdef RAPIDHALIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=NULL;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

/*
  Thread unsafe get the number of rapidha devices
*/
static inline int _rapidhalib_getnumrapidhadevices(void) {
  return rapidhalib_numrapidhadevices;
}

/*
  Thread safe get the number of rapidha devices
*/
static inline int rapidhalib_getnumrapidhadevices(long *rapidhalocked) {
  int val;

  rapidhalib_lockrapidha();
  val=_rapidhalib_getnumrapidhadevices();
  rapidhalib_unlockrapidha();

  return val;
}

/*
  Thread unsafe set the number of rapidha devices
*/
STATIC INLINE void _rapidhalib_setnumrapidhadevices(int numrapidhadevices) {
  rapidhalib_numrapidhadevices=numrapidhadevices;
}

/*
  Thread safe set the number of rapidha devices
*/
STATIC INLINE void rapidhalib_setnumrapidhadevices(int numrapidhadevices, long *rapidhalocked) {
  rapidhalib_lockrapidha();
  _rapidhalib_setnumrapidhadevices(numrapidhadevices);
  rapidhalib_unlockrapidha();
}

/*
  Thread unsafe get detecting device
*/
static inline int _rapidhalib_getdetectingdevice(void) {
  return rapidhalib_detectingdevice;
}

/*
  Thread safe get detecting device
*/
static inline int rapidhalib_getdetectingdevice(long *rapidhalocked) {
  int val;

  rapidhalib_lockrapidha();
  val=_rapidhalib_getdetectingdevice();
  rapidhalib_unlockrapidha();

  return val;
}

/*
  Thread unsafe set detecting device
*/
static inline void _rapidhalib_setdetectingdevice(int detectingdevice) {
  rapidhalib_detectingdevice=detectingdevice;
}

/*
  Thread safe set detecting device
*/
static inline void rapidhalib_setdetectingdevice(int detectingdevice, long *rapidhalocked) {
  rapidhalib_lockrapidha();
  _rapidhalib_setdetectingdevice(detectingdevice);
  rapidhalib_unlockrapidha();
}

/*
  Thread unsafe get need more info value
*/
STATIC INLINE int _rapidhalib_getneedmoreinfo(void) {
  return rapidhalib_needmoreinfo;
}

/*
  Thread safe get need more info value
*/
STATIC INLINE int rapidhalib_getneedmoreinfo(long *rapidhalocked) {
  int val;

  rapidhalib_lockrapidha();
  val=_rapidhalib_getneedmoreinfo();
  rapidhalib_unlockrapidha();

  return val;
}

/*
  Thread unsafe set need more info value
*/
STATIC INLINE void _rapidhalib_setneedmoreinfo(int needmoreinfo) {
  rapidhalib_needmoreinfo=needmoreinfo;
}

/*
  Thread safe set need more info value
*/
STATIC INLINE void rapidhalib_setneedmoreinfo(int needmoreinfo, long *rapidhalocked) {
  rapidhalib_lockrapidha();
  _rapidhalib_setneedmoreinfo(needmoreinfo);
  rapidhalib_unlockrapidha();
}

/*
  Thread unsafe add to need more info value
*/
STATIC INLINE void _rapidhalib_addtoneedmoreinfo(int addvalue) {
  rapidhalib_needmoreinfo+=addvalue;
}

/*
  Thread safe add to need more info value
*/
STATIC INLINE void rapidhalib_addtoneedmoreinfo(int addvalue, long *rapidhalocked) {
  rapidhalib_lockrapidha();
  _rapidhalib_addtoneedmoreinfo(addvalue);
  rapidhalib_unlockrapidha();
}

/*
  Thread unsafe subtract from need more info value
*/
STATIC INLINE void _rapidhalib_subtractneedmoreinfo(int subtractvalue) {
  //You can subtrace a number by adding the negative value of it
  _rapidhalib_addtoneedmoreinfo(-subtractvalue);
}

/*
  Thread safe subtract from need more info value
*/
STATIC INLINE void rapidhalib_subtractneedmoreinfo(int subtractvalue, long *rapidhalocked) {
  //You can subtrace a number by adding the negative value of it
  rapidhalib_addtoneedmoreinfo(-subtractvalue, rapidhalocked);
}

/*
  Thread safe mark a rapidha device as in use
  Returns 0 on success or negative value on error
*/
int rapidhalib_markrapidha_inuse(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  rapidhalib_lockrapidha();
  if (rapidhadevice->removed || rapidhadevice->needtoremove) {
    //This device shouldn't be used as it is either removed or is scheduled for removab
    rapidhalib_unlockrapidha();

    return -1;
  }
  //Increment rapidha inuse value
  ++(rapidhadevice->inuse);
#ifdef RAPIDHALIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu RapidHA: %016llX now inuse: %d\n", __func__, pthread_self(), rapidhadevice->addr, rapidhadevice->inuse);
#endif

  rapidhalib_unlockrapidha();

  return 0;
}

/*
  Thread safe mark a rapidha device as not in use
  Returns 0 on success or negative value on error
*/
int rapidhalib_markrapidha_notinuse(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR

  rapidhalib_lockrapidha();
  if (rapidhadevice->removed) {
    //This device shouldn't be used as it is removed
    rapidhalib_unlockrapidha();

    return -1;
  }
  if (!rapidhadevice->inuse) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu INUSE MISMATCH TRIED TO MARK AS NOT IN USE WHEN INUSE COUNT IS 0\n", __func__, pthread_self());
    rapidhalib_backtrace();
    rapidhalib_unlockrapidha();
    return -2;
  }
  //Decrement rapidha inuse value
  --(rapidhadevice->inuse);

#ifdef RAPIDHALIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu RapidHA: %016llX now inuse: %d\n", __func__, pthread_self(), rapidhadevice->addr, rapidhadevice->inuse);
#endif
  rapidhalib_unlockrapidha();

  return 0;
}

//Check if the RapidHA module is connected to a network
//Returns 1 if connected or 0 if not
int rapidhalib_rapidha_connected_to_network(void *localzigbeedevice, long *rapidhalocked) {
  rapidhadevice_t *rapidhadeviceptr=reinterpret_cast<rapidhadevice_t *>(localzigbeedevice);
  int val;

  rapidhalib_lockrapidha();

  if (rapidhadeviceptr->network_state!=0x01) {
    val=0;
  } else {
    val=1;
  }
  rapidhalib_unlockrapidha();

  return val;
}

/*
  Return a string for the RapidHA network state value
  Args: network_state The network state value
*/
const char *rapidhalib_get_network_state_string(uint8_t network_state) {
  const char *network_statestr;

  switch (network_state) {
    case 0x00:
      network_statestr="Network Down";
      break;
    case 0x01:
      network_statestr="Network Up";
      break;
    case 0x02:
      network_statestr="Joining Network";
      break;
    case 0x03:
      network_statestr="Forming Network";
      break;
    case 0x04:
      network_statestr="Rejoining Network";
      break;
    case 0xFF:
    default:
      network_statestr="Unknown";
      break;
  }
  return network_statestr;
}

/*
  Return a string for the RapidHA device type value
  Args: device_type The device type value
*/
const char *rapidhalib_get_device_type_string(uint8_t device_type) {
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
    case 3:
      devtypestr="Sleepy End Device";
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

STATIC unsigned char rapidha_frameid=0xFF;
STATIC unsigned char zigbee_seqnumber=0xFF;

static inline unsigned char rapidhalib_rapidha_get_next_frameid(long *rapidhalocked) {
  unsigned char val;

  rapidhalib_lockrapidha();
  ++rapidha_frameid;
  if (rapidha_frameid==128) {
    rapidha_frameid=0;
  }
  val=rapidha_frameid;
  rapidhalib_unlockrapidha();

  return val;
}

STATIC INLINE unsigned char rapidhalib_rapidha_get_frameid(long *rapidhalocked) {
  unsigned char val;

  rapidhalib_lockrapidha();
  val=rapidha_frameid;
  rapidhalib_unlockrapidha();

  return val;
}

STATIC INLINE unsigned char rapidhalib_zigbee_get_next_seqnumber(long *rapidhalocked) {
  unsigned char val;

  rapidhalib_lockrapidha();
  ++zigbee_seqnumber;
  if (zigbee_seqnumber==128) {
    zigbee_seqnumber=0;
  }
  val=zigbee_seqnumber;
  rapidhalib_unlockrapidha();

  return val;
}

STATIC INLINE unsigned char rapidhalib_zigbee_get_seqnumber(long *rapidhalocked) {
  unsigned char val;

  rapidhalib_lockrapidha();
  val=zigbee_seqnumber;
  rapidhalib_unlockrapidha();

  return val;
}

//Send a RapidHA API packet
//You allocate 2 additional bytes for the checksum at the end when allocating your buffer
//The buffer should have the first 5 bytes skipped for this function to fill in and bufcnt+1 will also be filled in with the checksum
//  So your first buffer entry will be buffer+5
//rapidha length and rapidha header ids should be already set by the caller
//remotepacket specifies that the packet will be sent to a remote device
STATIC void __rapidhalib_rapidha_send_api_packet(rapidhadevice_t *rapidhadevice, unsigned char *sendbuf, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i;//, upto;
  uint8_t packetlen;
  uint16_t checksum;
  rapidha_api_header_t *apicmd=(rapidha_api_header_t *) sendbuf;

  MOREDEBUG_ENTERINGFUNC();

  //Mark rapidha in use so we don't try and use the send queue while a rapidha is being removed
  if (rapidhalib_markrapidha_inuse(rapidhadevice, rapidhalocked)<0) {
    //Failed to mark rapidha as inuse
    return;
  }
  apicmd->frame_start=0xF1;
  apicmd->frameid=rapidhalib_rapidha_get_next_frameid(rapidhalocked);

  packetlen=apicmd->length+7; //Add RapidHA header length + 2 byte checksum after payload

  //Calculate Checksum
  checksum=0;
  for (i=1; i<packetlen-2; i++) {
    checksum+=sendbuf[i];
  }
  sendbuf[packetlen-2]=checksum & 0xFF;
  sendbuf[packetlen-1]=(checksum >> 8) & 0xFF;

#ifdef RAPIDHALIB_MOREDEBUG
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
  //NOTE: No need to lock as the sending function will lock around the send operation
  rapidhadevice->sendFuncptr(rapidhadevice->serdevidx, sendbuf, packetlen);
  rapidhalib_markrapidha_notinuse(rapidhadevice, rapidhalocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA simple command
  Some RapidHA commands only consist of the primary and secondary command id so this function handles those
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
        primary Primary command id
        secondary Secondary command id
*/
void rapidhalib_send_rapidha_simple_command(rapidhadevice_t *rapidhadevice, uint8_t primary, uint8_t secondary, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_api_header_t *apicmd;

#ifdef RAPIDHALIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s: thread id: %lu With primary: %d, secondary: %d\n", __func__, pthread_self(), primary, secondary);
#endif
  //Fill in the packet details and send the packet
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  apicmd=(rapidha_api_header_t *) calloc(1, sizeof(rapidha_api_header_t)+2-1);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=primary;
  apicmd->header_secondary=secondary;
  apicmd->length=0;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

void rapidhalib_send_rapidha_utility_reset(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_UTILITY, RAPIDHA_UTILITY_RESET, rapidhalocked);
}

void rapidhalib_send_rapidha_module_info_request(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_UTILITY, RAPIDHA_UTILITY_MODULE_INFO_REQUEST, rapidhalocked);
}

void rapidhalib_send_rapidha_host_startup_ready(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_UTILITY, RAPIDHA_UTILITY_HOST_STARTUP_READY, rapidhalocked);
}

void rapidhalib_send_rapidha_startup_sync_complete(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_UTILITY, RAPIDHA_UTILITY_STARTUP_SYNC_COMPLETE, rapidhalocked);
}

/*
  Send a RapidHA Network Comissioning Join Network
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Currently uses automatic settings
*/
void rapidhalib_send_rapidha_network_comissioning_join_network(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_network_comissioning_form_network_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_network_comissioning_form_network_t *) calloc(1, sizeof(rapidha_network_comissioning_form_network_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_NETWORK_COMISSIONING;
  apicmd->header_secondary=RAPIDHA_NETWORK_COMISSIONING_JOIN_NETWORK;
  apicmd->length=sizeof(rapidha_network_comissioning_form_network_t)-5;
  apicmd->channelmask=0x03FFF800;
  apicmd->auto_options=3;
  apicmd->panid=0;
  apicmd->extpanid=0;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Network Comissioning Form Network
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Currently uses automatic settings
*/
void rapidhalib_send_rapidha_network_comissioning_form_network(rapidhadevice_t *rapidhadevice, int chanmask, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_network_comissioning_form_network_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_network_comissioning_form_network_t *) calloc(1, sizeof(rapidha_network_comissioning_form_network_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_NETWORK_COMISSIONING;
  apicmd->header_secondary=RAPIDHA_NETWORK_COMISSIONING_FORM_NETWORK;
  apicmd->length=sizeof(rapidha_network_comissioning_form_network_t)-5;
  apicmd->channelmask=chanmask;
  apicmd->auto_options=3;
  apicmd->panid=0;
  apicmd->extpanid=0;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Network Comissioning Permit Join
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
*/
void rapidhalib_send_rapidha_network_comissioning_permit_join(void *localzigbeedevice, uint8_t duration, long *rapidhalocked) {
  rapidhadevice_t *rapidhadevice=reinterpret_cast<rapidhadevice_t *>(localzigbeedevice);
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_network_comissioning_permit_join_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_network_comissioning_permit_join_t *) calloc(1, sizeof(rapidha_network_comissioning_permit_join_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_NETWORK_COMISSIONING;
  apicmd->header_secondary=RAPIDHA_NETWORK_COMISSIONING_PERMIT_JOIN;
  apicmd->length=sizeof(duration);
  apicmd->duration=duration;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

void rapidhalib_send_rapidha_network_comissioning_leave_network(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_NETWORK_COMISSIONING, RAPIDHA_NETWORK_COMISSIONING_LEAVE_NETWORK, rapidhalocked);
}

void rapidhalib_send_rapidha_network_comissioning_network_status_request(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_NETWORK_COMISSIONING, RAPIDHA_NETWORK_COMISSIONING_NETWORK_STATUS_REQUEST, rapidhalocked);
}

/*
  Send a RapidHA Support Config Add Endpoint
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_support_config_device_type_write(rapidhadevice_t *rapidhadevice, uint8_t device_type, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_support_config_device_type_write_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_support_config_device_type_write_t *) calloc(1, sizeof(rapidha_support_config_device_type_write_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_DEVICE_TYPE_WRITE;
  apicmd->length=sizeof(uint8_t)*2;

  if (device_type==1) {
    //Non-Sleepy End Device
    apicmd->device_function_type=0x01;
    apicmd->sleepy=0x00;
  } else if (device_type==2) {
    //Sleepy End Device
    apicmd->device_function_type=0x01;
    apicmd->sleepy=0x01;
  } else {
    //Full Function Device
    apicmd->device_function_type=0x00;
    apicmd->sleepy=0x00;
  }
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Support Config Add Endpoint
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_support_config_add_endpoint(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_support_config_add_endpoint_t *apicmd;
  uint8_t *byteptr;
  uint16_t *wordptr;
  uint8_t num_server_clusters, num_client_clusters;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  num_server_clusters=7;
  num_client_clusters=18;
  apicmd=(rapidha_support_config_add_endpoint_t *) calloc(1, 5+8+sizeof(uint16_t)*num_server_clusters+sizeof(uint16_t)*num_client_clusters+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ADD_ENDPOINT;
  apicmd->length=8;
  apicmd->endpointid=1;
  apicmd->profileid=htole16(ZIGBEE_HOME_AUTOMATION_PROFILE);
  apicmd->deviceid=htole16(ZIGBEE_DEVICEID_HA_COMBINED_INTERFACE);
  apicmd->device_version=0x01;
  apicmd->num_server_clusters=num_server_clusters;
  wordptr=&(apicmd->server_clusters);

  apicmd->length+=sizeof(uint16_t)*apicmd->num_server_clusters;

  //Server Clusters
  wordptr[0]=htole16(ZIGBEE_HOME_AUTOMATION_BASIC_CLUSTER);
  wordptr[1]=htole16(ZIGBEE_HOME_AUTOMATION_IDENTIFY_CLUSTER);
  wordptr[2]=htole16(ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER);
  wordptr[3]=htole16(ZIGBEE_HOME_AUTOMATION_POLL_CONTROL_CLUSTER);
  wordptr[4]=htole16(ZIGBEE_HOME_AUTOMATION_ONOFF_CLUSTER);
  wordptr[5]=htole16(ZIGBEE_HOME_AUTOMATION_SIMPLE_METERING_CLUSTER);
  wordptr[6]=htole16(ZIGBEE_HOME_AUTOMATION_IAS_ZONE_CLUSTER);

  //Set num_client_clusters
  byteptr=(uint8_t *) (&wordptr[apicmd->num_server_clusters]);
  byteptr[0]=num_client_clusters;

  wordptr=(uint16_t *) (byteptr+1);

  apicmd->length+=sizeof(uint16_t)*byteptr[0];

  //Client Clusters
  wordptr[0]=htole16(ZIGBEE_HOME_AUTOMATION_BASIC_CLUSTER);
  wordptr[1]=htole16(ZIGBEE_HOME_AUTOMATION_IDENTIFY_CLUSTER);
  wordptr[2]=htole16(ZIGBEE_HOME_AUTOMATION_GROUPS_CLUSTER);
  wordptr[3]=htole16(ZIGBEE_HOME_AUTOMATION_SCENES_CLUSTER);
  wordptr[4]=htole16(ZIGBEE_HOME_AUTOMATION_ONOFF_CLUSTER);
  wordptr[5]=htole16(ZIGBEE_HOME_AUTOMATION_LEVEL_CONTROL_CLUSTER);
  wordptr[6]=htole16(ZIGBEE_HOME_AUTOMATION_ALARM_CLUSTER);
  wordptr[7]=htole16(ZIGBEE_HOME_AUTOMATION_POLL_CONTROL_CLUSTER);
  wordptr[8]=htole16(ZIGBEE_HOME_AUTOMATION_DOOR_LOCK_CLUSTER);
  wordptr[9]=htole16(ZIGBEE_HOME_AUTOMATION_WINDOW_COVERING_CLUSTER);
  wordptr[10]=htole16(ZIGBEE_HOME_AUTOMATION_THERMOSTAT_CLUSTER);
  wordptr[10]=htole16(ZIGBEE_HOME_AUTOMATION_THERMOSTAT_CLUSTER);
  wordptr[11]=htole16(ZIGBEE_HOME_AUTOMATION_THERMOSTAT_UI_CONFIG_CLUSTER);
  wordptr[12]=htole16(ZIGBEE_HOME_AUTOMATION_TEMP_MEASUREMENT_CLUSTER);
  wordptr[13]=htole16(ZIGBEE_HOME_AUTOMATION_OCCUPANCY_SENSING_CLUSTER);
  wordptr[14]=htole16(ZIGBEE_HOME_AUTOMATION_IAS_ZONE_CLUSTER);
  wordptr[15]=htole16(ZIGBEE_HOME_AUTOMATION_IAS_WD_CLUSTER);
  wordptr[16]=htole16(ZIGBEE_HOME_AUTOMATION_ELECTRICAL_MEASUREMENT_CLUSTER);
  wordptr[17]=htole16(ZIGBEE_HOME_AUTOMATION_DIAGNOSTICS_CLUSTER);

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Support Config Add Attributes To Cluster
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_support_config_add_attributes_to_cluster(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_support_config_add_attributes_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_support_config_add_attributes_t *) calloc(1, 10+sizeof(rapidha_support_config_add_attributes_records_t)*1+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Add Local Time Server Attribute to Time Cluster
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ADD_ATTRIBUTES_TO_CLUSTER;
  apicmd->length=5+sizeof(rapidha_support_config_add_attributes_records_t)*1;
  apicmd->endpointid=1;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->num_attrs=0x01;
  apicmd->attrs[0].id=htole16(ZIGBEE_HA_TIME_CLUSTER_LOCAL_TIME_ATTR);
  apicmd->attrs[0].type=ZIGBEE_ZCL_TYPE_U32;
  apicmd->attrs[0].properties=0x01;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

//Wipes all Endpoints, Clusters, Attributes and registered pass-through commnds from the module
void rapidhalib_send_rapidha_support_config_clear_endpoint_config(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidhalib_send_rapidha_simple_command(rapidhadevice, RAPIDHA_ZIGBEE_SUPPORT_CONFIG, RAPIDHA_SUPPORT_CONFIG_CLEAR_ENDPOINT_CONFIG, rapidhalocked);
}

//Enable passthrough of the report attribute
//Supported on firmware versions >= 1.5.3
void rapidhalib_send_rapidha_support_config_attribute_report_passthrough_control(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_support_config_attribute_report_passthrough_control_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_support_config_attribute_report_passthrough_control_t *) calloc(1, sizeof(rapidha_support_config_attribute_report_passthrough_control_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the packet details and send the packet
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_REPORT_PASSTHROUGH_CONTROL;
  apicmd->length=1;
  apicmd->enable=1;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);
  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Support Config Register Commands to Pass Through to the Host
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_support_config_register_commands_pasthru(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_support_config_commands_passthru_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_support_config_commands_passthru_t *) calloc(1, 10+sizeof(uint8_t)*1+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_REGISTER_COMMANDS_PASSTHRU;
  apicmd->length=5+sizeof(uint8_t)*1;
  apicmd->endpointid=1;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_POLL_CONTROL_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->numcmds=0x01;
  apicmd->cmds[0]=0x00;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_REGISTER_COMMANDS_PASSTHRU;
  apicmd->length=5+sizeof(uint8_t)*1;
  apicmd->endpointid=1;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_IAS_ZONE_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->numcmds=0x01;
  apicmd->cmds[0]=0x00;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send the current time to a Zigbee device
  Arguments:
    rapidhadevice A pointer to rapidhadevice structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
*/
//NOTE: This is a quick implementation to get this working on RapidHA
void rapidhalib_send_rapidha_support_config_send_current_time(rapidhadevice_t *rapidhadevice, uint64_t addr, uint16_t netaddr, uint8_t srcendpnt, uint8_t destendpnt, long *rapidhalocked, long *zigbeelocked) {
  rapidha_support_config_attribute_write_t *apicmd;
  long curtimezone;
  time_t zigbeebasetime, zigbeecurlocaltime, zigbeecurutctime;
  struct timespec curtime;
  struct tm tm;
  uint32_t *attruint32ptr;
  uint8_t *attruint8ptr;

  MOREDEBUG_ENTERINGFUNC();

  //Get current local time and utc time
  tzset();
  curtimezone=timezone;
  clock_gettime(CLOCK_REALTIME, &curtime);

  tm.tm_sec=0;
  tm.tm_min=0;
  tm.tm_hour=0;
  tm.tm_mday=1;
  tm.tm_mon=0;
  tm.tm_year=100;
  tm.tm_isdst=-1;

  zigbeebasetime=mktime(&tm)-curtimezone; //mktime is in local time so we need to adjust back to utc

  zigbeecurlocaltime=curtime.tv_sec-zigbeebasetime+timezone;
  zigbeecurutctime=curtime.tv_sec-zigbeebasetime;

  apicmd=(rapidha_support_config_attribute_write_t *) calloc(1, 12+sizeof(uint32_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  attruint32ptr=(uint32_t *) apicmd->attrval;
  attruint8ptr=(uint8_t *) apicmd->attrval;

  //Fill in the packet details and send the packet
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_WRITE;
  apicmd->length=7+sizeof(uint32_t);
  apicmd->endpointid=destendpnt;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->attrid=ZIGBEE_HA_TIME_CLUSTER_TIME_ATTR;
  apicmd->attrtype=ZIGBEE_ZCL_TYPE_UTCTIME;
  *attruint32ptr=zigbeecurutctime;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  //Fill in the packet details and send the packet
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_WRITE;
  apicmd->length=7+sizeof(uint8_t);
  apicmd->endpointid=destendpnt;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->attrid=ZIGBEE_HA_TIME_CLUSTER_TIME_STATUS_ATTR;
  apicmd->attrtype=ZIGBEE_ZCL_TYPE_8BITMAP;
  *attruint8ptr=0x01;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  //Fill in the packet details and send the packet
  apicmd->header_primary=RAPIDHA_ZIGBEE_SUPPORT_CONFIG;
  apicmd->header_secondary=RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_WRITE;
  apicmd->length=7+sizeof(uint32_t);
  apicmd->endpointid=destendpnt;
  apicmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER);
  apicmd->serverclient=0x01;
  apicmd->attrid=ZIGBEE_HA_TIME_CLUSTER_LOCAL_TIME_ATTR;
  apicmd->attrtype=ZIGBEE_ZCL_TYPE_U32;
  *attruint32ptr=zigbeecurlocaltime;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Upload info about a firmware file to a rapidha device to prepare for firmware upgrade
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
        firmwarefile_fd A descriptor to the open file
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_bootload_query_next_image_response(rapidhadevice_t *rapidhadevice, int firmwarefile_fd, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_bootload_query_next_image_response_t *apicmd;
  off_t filesize;

  MOREDEBUG_ENTERINGFUNC();

  //First get the size of the file
  if (firmwarefile_fd!=-1) {
    filesize=lseek(firmwarefile_fd, 0, SEEK_END);
  } else {
    filesize=-1;
  }
  if (filesize==-1) {
    //Failed to get the size of the file
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the packet details and send the packet
  apicmd=(rapidha_bootload_query_next_image_response_t *) calloc(1, sizeof(rapidha_bootload_query_next_image_response_t)+2);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_BOOTLOAD;
  apicmd->header_secondary=RAPIDHA_BOOTLOAD_QUERY_NEXT_IMAGE_RESPONSE;
  apicmd->length=sizeof(rapidha_bootload_query_next_image_response_t)-5;
  apicmd->netaddr=0xFFFF;
  apicmd->addr=rapidhadevice->addr;
  apicmd->endpoint=0xFF;
  apicmd->status=0;
  apicmd->manu=htole16(0x109A); //Must be 109A for RapidHA
  apicmd->imagetype=0;
  apicmd->fileversion=0;
  apicmd->imagesize=filesize;

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Upload part of a firmware file to a rapidha device for firmware upgrade or abort a module's current firmware upgrade
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
        Most of the parameters should be copied from a bootload_image_block_request packet
        Specify status of RAPIDHA_STATUS_RESPONSE_ABORT to tell the RapidHA to abort a firmware upgrade
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_bootload_image_block_response(rapidhadevice_t *rapidhadevice, uint16_t netaddr, uint64_t addr, uint8_t endpoint, uint8_t status, uint16_t manu, uint16_t image_type, uint32_t fileversion, uint32_t fileoffset, uint8_t maxsize, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_bootload_image_block_response_t *apicmd;
  ssize_t filesize=0;

  MOREDEBUG_ENTERINGFUNC();

  if (maxsize>80) {
    //Some RapidHA modules/firmwares seem to have problems with their advertised maxsize of 128 but 80 seems to work okay
    maxsize=80;
  }
  //Always allocate space for maximum possible data send
  apicmd=(rapidha_bootload_image_block_response_t *) calloc(1, sizeof(rapidha_bootload_image_block_response_t)+maxsize-1+3);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (status!=RAPIDHA_STATUS_RESPONSE_ABORT) {
    //Read the data
    rapidhalib_lockrapidha();
    if (rapidhadevice->firmwarefile_fd!=-1) {
      lseek(rapidhadevice->firmwarefile_fd, fileoffset, SEEK_SET);
      filesize=read(rapidhadevice->firmwarefile_fd, &apicmd->data, maxsize);
    } else {
      filesize=-1;
    }
    rapidhalib_unlockrapidha();
    if (filesize==-1) {
      //Failed to read from the file so abort firmware update
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from file offset: %lu for RapidHA: %016llX so aborting update\n", __func__, fileoffset, addr);
      status=RAPIDHA_STATUS_RESPONSE_ABORT;
      filesize=0;
    } else {
      rapidhalib_lockrapidha();
      //NOTE: Sometimes we will be retrying an offset so use the current offset aa the base
      rapidhadevice->firmware_file_offset=fileoffset+filesize;
      rapidhalib_unlockrapidha();
    }
  }
  //Fill in the packet details and send the packet
  apicmd->header_primary=RAPIDHA_BOOTLOAD;
  apicmd->header_secondary=RAPIDHA_BOOTLOAD_IMAGE_BLOCK_RESPONSE;
  apicmd->length=sizeof(rapidha_bootload_image_block_response_t)+filesize-5;
  apicmd->netaddr=netaddr;
  apicmd->addr=addr;
  apicmd->endpoint=endpoint;
  apicmd->status=status;
  apicmd->manu=manu;
  apicmd->image_type=image_type;
  apicmd->fileversion=fileversion;
  apicmd->fileoffset=fileoffset;
  apicmd->datalen=filesize;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send an upgrade end response to a rapidha device
  Args: rapidhadevice A pointer to rapidhadevice structure used to send the serial data
        Most of the parameters should be copied from a bootload_upgrade_end_request packet
  NOTE: Really basic at the moment
*/
void rapidhalib_send_rapidha_bootload_upgrade_end_response(rapidhadevice_t *rapidhadevice, uint16_t netaddr, uint64_t addr, uint8_t endpoint, uint16_t manu, uint16_t image_type, uint32_t fileversion, long *rapidhalocked) {
  rapidha_bootload_upgrade_end_response_t *apicmd;

  MOREDEBUG_ENTERINGFUNC();

  //Fill in the packet details and send the packet
  apicmd=(rapidha_bootload_upgrade_end_response_t *) calloc(1, sizeof(rapidha_bootload_upgrade_end_response_t)+3);
  if (!apicmd) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  apicmd->header_primary=RAPIDHA_BOOTLOAD;
  apicmd->header_secondary=RAPIDHA_BOOTLOAD_UPGRADE_EBD_RESPONSE;
  apicmd->length=sizeof(rapidha_bootload_upgrade_end_response_t)-5;
  apicmd->netaddr=netaddr;
  apicmd->addr=addr;
  apicmd->endpoint=endpoint;
  apicmd->manu=manu;
  apicmd->image_type=image_type;
  apicmd->fileversion=fileversion;
  apicmd->curtime=0;
  apicmd->upgrade_time=0;
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) apicmd, rapidhalocked);

  free(apicmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Zigbee ZDO
  Arguments:
    rapidhadevice A pointer to rapidhadevice structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
  When calling this function, your payload should be added to &rapidha_api_explicit_addressing_zigbee_cmd_t->end
*/
void __rapidhalib_send_zigbee_zdo_new(rapidhadevice_t *rapidhadevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *rapidhalocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_zdo_send_unicast_t *zdounicast;
  rapidha_zdo_send_bcast_t *zdobcast;

  MOREDEBUG_ENTERINGFUNC();

  //Copy the zdocmd structure contents into the zclunicast structure and send the packet
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  //NOTE2: We allocate for bcast as it is larger than unicast
  zdobcast=(rapidha_zdo_send_bcast_t *) calloc(1, sizeof(rapidha_zdo_send_bcast_t)+zdocmd->zigbeelength+2-1);
  if (!zdobcast) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  zdounicast=(rapidha_zdo_send_unicast_t *) zdobcast;

  zdounicast->header_primary=RAPIDHA_ZIGBEE_ZDO;
  zdounicast->header_secondary=RAPIDHA_ZIGBEE_ZDO_SEND_UNICAST;
  zdounicast->length=sizeof(rapidha_zdo_send_unicast_t)-6+zdocmd->zigbeelength;
  zdounicast->netaddr=zdocmd->netaddr;
  zdounicast->clusterid=zdocmd->clusterid;
  if (expect_response) {
    zdounicast->response_options=4; //Enable reception of ZDO Response, but not custom sequence number
  } else {
    zdounicast->response_options=0; //Don't wait for a ZDO Response and don't use a custom sequence number
  }
  zdounicast->seqnumber=0; //rapidhalib_zigbee_get_next_seqnumber();
  zdounicast->zigbeelength=zdocmd->zigbeelength;
  memcpy(&zdounicast->zigbeepayload, &zdocmd->zigbeepayload, zdocmd->zigbeelength);
  if (zdounicast->netaddr>=0xFFFC) {
    memmove(&zdobcast->clusterid, &zdounicast->clusterid, zdounicast->length-2); //Move down 1 byte to fit the radius
    zdounicast->header_secondary=RAPIDHA_ZIGBEE_ZDO_SEND_BCAST;
    ++zdounicast->length;
    zdobcast->radius=0;
  }
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) zdobcast, rapidhalocked);
  free(zdobcast);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a RapidHA Zigbee ZCL
  Arguments:
    rapidhadevice A pointer to rapidhadevice structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
  When calling this function, your payload should be added to &rapidha_api_explicit_addressing_zigbee_cmd_t->end
*/
void __rapidhalib_send_zigbee_zcl_new(rapidhadevice_t *rapidhadevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *rapidhalocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_zcl_send_unicast_t *zclunicast;
  rapidha_zcl_send_bcast_t *zclbcast;

  MOREDEBUG_ENTERINGFUNC();

  //Copy the zclcmd structure contents into the zclunicast structure and send the packet
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  //NOTE2: We allocate for bcast as it is larger than unicast
  zclbcast=(rapidha_zcl_send_bcast_t *) calloc(1, sizeof(rapidha_zcl_send_bcast_t)+zclcmd->zigbeelength+2-1);
  if (!zclbcast) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  zclunicast=(rapidha_zcl_send_unicast_t *) zclbcast;

  zclunicast->header_primary=RAPIDHA_ZIGBEE_ZCL_GENERAL;
  zclunicast->header_secondary=RAPIDHA_ZIGBEE_ZCL_SEND_UNICAST;
  zclunicast->length=sizeof(rapidha_zcl_send_unicast_t)-6+zclcmd->zigbeelength;
  zclunicast->netaddr=zclcmd->netaddr;
  zclunicast->destendpnt=zclcmd->destendpnt;
  zclunicast->srcendpnt=zclcmd->srcendpnt;
  zclunicast->clusterid=zclcmd->clusterid;
  if (expect_response) {
    zclunicast->response_options=4; //Enable reception of ZCL Response, but not custom sequence number
  } else {
    zclunicast->response_options=0; //Don't wait for a ZCL Response and don't use a custom sequence number
  }
  zclunicast->enclevel=0;
  zclunicast->frame_control=zclcmd->frame_control;
  if ((zclcmd->frame_control & 4)==4) {
    //Manufacturer-Specific Command
    zclunicast->manu=zclcmd->manu;
  } else {
    zclunicast->manu=0;
  }
  zclunicast->seqnumber=0; //Let RapidHA generate the sequence number
  zclunicast->cmdid=zclcmd->cmdid;
  zclunicast->zigbeelength=zclcmd->zigbeelength;
  memcpy(&zclunicast->zigbeepayload, &zclcmd->zigbeepayload, zclcmd->zigbeelength);
  if (zclunicast->netaddr>=0xFFFC) {
    //RapidHA uses a different command for ZCL Broadcast
    memmove(&zclbcast->response_options, &zclunicast->response_options, zclunicast->length-6); //Move down 1 byte to fit the radius
    zclunicast->header_secondary=RAPIDHA_ZIGBEE_ZCL_SEND_BCAST;
    ++zclunicast->length;
    zclbcast->radius=0;
  }
  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) zclbcast, rapidhalocked);
  free(zclbcast);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Request the value of multiple non-manufacturer specific attributes
  Use to read 1 attribute at a time
  Arguments:
    rapidhadevice A pointer to rapidhadevice structure used to send the serial data
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
    attributeids: An array of 16-bit attribute ids to read
    numattribs: Number of attributes in the array
*/
void rapidhalib_send_zigbee_zcl_multi_attribute_read(rapidhadevice_t *rapidhadevice, zcl_general_request_t *zclcmd, long *rapidhalocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_zcl_read_attribute_request_t *zclreadattr;
  uint16_t srcnetaddr;
  uint16_t numattribs;

  MOREDEBUG_ENTERINGFUNC();

  numattribs=zclcmd->zigbeelength/2;

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  //NOTE2: We allocate for bcast as it is larger than unicast
  zclreadattr=(rapidha_zcl_read_attribute_request_t *) calloc(1, sizeof(rapidha_zcl_read_attribute_request_t)+4+sizeof(uint16_t)*numattribs+2-1);
  if (!zclreadattr) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  srcnetaddr=rapidhadevice->netaddr;

  //Copy the zclcmd structure contents into the zclreadattr structure and send the packet
  zclreadattr->header_primary=RAPIDHA_ZIGBEE_ZCL_GENERAL;
  zclreadattr->header_secondary=RAPIDHA_ZIGBEE_ZCL_READ_ATTR_REQUEST;
  zclreadattr->length=sizeof(rapidha_zcl_read_attribute_request_t)-6+(sizeof(uint16_t)*numattribs);
  zclreadattr->netaddr=zclcmd->netaddr;
  zclreadattr->destendpnt=zclcmd->destendpnt;
  zclreadattr->clusterid=zclcmd->clusterid;

  zclreadattr->clientserver_cluster=((zclcmd->frame_control & 8) >> 3) ^ 1; //This field in RapidHA is inverse meaning of standard Zigbee frame control field
  zclreadattr->numattrs=numattribs;

  memcpy(&zclreadattr->data, &zclcmd->zigbeepayload, sizeof(uint16_t)*numattribs);

  __rapidhalib_rapidha_send_api_packet(rapidhadevice, (unsigned char *) zclreadattr, rapidhalocked);
  free(zclreadattr);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Utility Module Info Response
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
void rapidhalib_process_utility_module_info_response(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  rapidha_utility_module_info_response_t *apicmd=(rapidha_utility_module_info_response_t *) (rapidhadevice->receivebuf);

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_UTILITY_MODULE_INFO_RESPONSE) {
    rapidhalib_waitresult=1;
  }
  rapidhadevice->firmmaj=apicmd->major_firmware_version;
  rapidhadevice->firmmin=apicmd->minor_firmware_version;
  rapidhadevice->firmbuild=apicmd->build_firmware_version;
  rapidhadevice->addr=apicmd->addr;

  rapidhalib_unlockrapidha();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Utility Startup Sync Request
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
void rapidhalib_process_utility_startup_sync_request(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_utility_startup_sync_request_t *apicmd=(rapidha_utility_startup_sync_request_t *) (rapidhadevice->receivebuf);

  MOREDEBUG_ENTERINGFUNC();
  {
    const char *runstatestr="Unknown", *cfgstatestr="Unknown";
    switch (apicmd->running_state) {
      case RAPIDHA_RUNSTATE_STARTINGUP:
        runstatestr="Starting Up";
        break;
      case RAPIDHA_RUNSTATE_ALREADYRUNNING:
        runstatestr="Already Running";
        break;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Running State: %s\n", __func__, runstatestr);
    switch (apicmd->configuration_state) {
    case RAPIDHA_CFGSTATE_FACTORY_DEFAULT:
      cfgstatestr="Factory Default";
      break;
    case RAPIDHA_CFGSTATE_NEEDS_ENDPOINT_CONFIG:
      cfgstatestr="Needs Endpoint Configuration";
      break;
    case RAPIDHA_CFGSTATE_FULLY_CONFIGURED:
      cfgstatestr="Fully Configured";
      break;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Configuration State: %s\n", __func__, cfgstatestr);
  }
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_UTILITY_STARTUP_SYNC_REQUEST) {
    rapidhalib_waitresult=1;
  }
  rapidhadevice->cfgstate=apicmd->configuration_state;
  rapidhalib_unlockrapidha();
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Network Comissioning Network Status Response
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
void rapidhalib_process_network_comissioning_network_status_response(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  rapidha_network_comissioning_network_status_response_t *apicmd=(rapidha_network_comissioning_network_status_response_t *) (rapidhadevice->receivebuf);
  int zigbeelibindex;
  uint8_t prev_network_state;
  uint64_t addr;

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_NETWORK_COMISSIONING_NETWORK_STATUS_RESPONSE) {
    rapidhalib_waitresult=1;
  }
  addr=rapidhadevice->addr;
  zigbeelibindex=rapidhadevice->zigbeelibindex;

  //Always update these values
  prev_network_state=rapidhadevice->network_state;
  rapidhadevice->network_state=apicmd->network_state;
  rapidhadevice->device_type=apicmd->device_type;
  rapidhadevice->channel=apicmd->channel;
  rapidhadevice->netaddr=apicmd->netaddr;
  rapidhadevice->panid=apicmd->panid;
  rapidhadevice->extpanid=apicmd->extpanid;

  rapidhalib_unlockrapidha();

  debuglibifaceptr->debuglib_printf(1, "%s: Received Network Status Response on RapidHA device: %016llX\n", __func__, addr);
  debuglibifaceptr->debuglib_printf(1, "%s: Network State=%s\n",__func__, rapidhalib_get_network_state_string(apicmd->network_state));
  debuglibifaceptr->debuglib_printf(1, "%s: Device Type=%s\n",__func__, rapidhalib_get_device_type_string(apicmd->device_type));
  debuglibifaceptr->debuglib_printf(1, "%s: Channel=%02hX\n",__func__, apicmd->channel);
  debuglibifaceptr->debuglib_printf(1, "%s: 16-bit Network Address=%04hX\n",__func__, apicmd->netaddr);
  debuglibifaceptr->debuglib_printf(1, "%s: Pan ID=%04hX\n",__func__, apicmd->panid);
  debuglibifaceptr->debuglib_printf(1, "%s: Extended Pan ID=%016llX\n",__func__, apicmd->extpanid);
  debuglibifaceptr->debuglib_printf(1, "%s: Permit Join Time=%d\n", __func__, apicmd->remain_join_time);

  if ((prev_network_state!=0x01 && apicmd->network_state==0x01) || (prev_network_state==0x01 && apicmd->network_state!=0x01)) {
    if (zigbeelibindex>=0 && zigbeelibifaceptr) {
      debuglibifaceptr->debuglib_printf(1, "%s: Removing cached list of ZigBee devices as network state has changed\n", __func__);
      zigbeelibifaceptr->remove_all_zigbee_devices(zigbeelibindex, rapidhalocked, zigbeelocked);
    }
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZDO Response Received
  Converts a RapidHA Zigbee ZDO Response Received packet into a generic Zigbee ZDO Response Packet
    and then passes onto the zigbee library
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zdo_response_received(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  ZIGBEELIB_IFACEPTR
  rapidha_zigbee_zdo_response_received_t *apicmd;
  zigbee_zdo_response_header_t *zdocmd;
  int zigbeelibindex;
  uint16_t netaddr, clusterid, profileid;
  uint8_t seqnumber;
  uint8_t zigbeelength;

  MOREDEBUG_ENTERINGFUNC();

  apicmd=(rapidha_zigbee_zdo_response_received_t *) (rapidhadevice->receivebuf);
  zdocmd=(zigbee_zdo_response_header_t *) &apicmd->netaddr;

  netaddr=apicmd->netaddr;
  clusterid=apicmd->clusterid;
  profileid=ZIGBEE_ZDO_PROFILE; //ZDO packets are always in the ZDO profile
  zigbeelength=apicmd->zigbeelength+1; //Add 1 as we will add the sequence number to the zdocmd
  seqnumber=apicmd->seqnumber;

  //Copy the zigbee payload into the generic Zigbee ZDO Response structure
  memmove(&(zdocmd->status), &(apicmd->status), zigbeelength);

  //Now copy the remaining values
  zdocmd->srcnetaddr=netaddr;
  zdocmd->clusterid=clusterid;
  zdocmd->profileid=profileid;
  zdocmd->zigbeelength=zigbeelength;
  zdocmd->seqnumber=seqnumber;

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zdo_response_received(zigbeelibindex, zdocmd, rapidhalocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Display a RapidHA ZDO/ZCL Send Status
  Args: header_primary The primary header id associated with the status message
        frameid The frameid associated with the status message
        status The RapidHA status
*/
STATIC void rapidhalib_display_send_status(uint8_t header_primary, uint8_t frameid, uint8_t status, uint8_t seqnumber, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  const char *zdoorzclstr="";
  const char *statusstrptr="Unknown Status";

  switch (header_primary) {
    case RAPIDHA_UTILITY:
      zdoorzclstr="Utility";
      break;
    case RAPIDHA_ZIGBEE_ZDO:
      zdoorzclstr="ZDO";
      break;
    case RAPIDHA_ZIGBEE_ZCL_GENERAL:
      zdoorzclstr="ZCL";
      break;
  }
  switch (status) {
    case RAPIDHA_STATUS_RESPONSE_SUCCESS:
      statusstrptr="Success";
      break;
    case RAPIDHA_STATUS_RESPONSE_INVALID_CALL:
      statusstrptr="Invalid Call";
      break;
    case RAPIDHA_STATUS_RESPONSE_INVALID_DESTADDR:
      statusstrptr="Invalid Destination Address";
      break;
    case RAPIDHA_STATUS_RESPONSE_INCORRECT_LENGTH:
      statusstrptr="Incorrect Length";
      break;
    case RAPIDHA_STATUS_RESPONSE_ENDPOINT_NOT_FOUND:
      statusstrptr="Local Endpoint not found";
      break;
    case RAPIDHA_STATUS_RESPONSE_CLUSTER_NOT_FOUND:
      statusstrptr="Cluster not found on the local endpoint";
      break;
    case RAPIDHA_STATUS_RESPONSE_OUT_OF_MEMORY:
      statusstrptr="Out of Memory";
      break;
    case RAPIDHA_STATUS_RESPONSE_UNKNOWN_FAILURE:
      statusstrptr="Unknown Failure";
      break;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Received %s send status: %s (0x%02hhX) for frameid: %02hhX, Sequence Number: %02hhX\n", __func__, zdoorzclstr, statusstrptr, status, frameid, seqnumber);

  rapidhalib_lockrapidha();
  if (
    (header_primary==RAPIDHA_UTILITY && rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_RAPIDHA_UTILITY_STATUS_RESPONSE) ||
    (header_primary==RAPIDHA_ZIGBEE_ZDO && rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_RAPIDHA_ZIGBEE_ZDO_SEND_STATUS) ||
    (header_primary==RAPIDHA_ZIGBEE_ZCL_GENERAL && rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_RAPIDHA_ZIGBEE_ZCL_SEND_STATUS)
  ) {
    rapidhalib_waitresult=1;
  }
  rapidhalib_unlockrapidha();
}

/*
  Process a RapidHA ZDO/ZCL Send Status
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_send_status(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int zigbeelibindex;
  ZIGBEELIB_IFACEPTR
  zigbee_send_status_header_t *apicmd=(zigbee_send_status_header_t *) (rapidhadevice->receivebuf);

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_display_send_status(apicmd->header_primary, apicmd->frameid, apicmd->status, apicmd->seqnumber, rapidhalocked);

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    if (apicmd->header_primary==RAPIDHA_ZIGBEE_ZDO) {
      zigbeelibifaceptr->process_zdo_send_status(zigbeelibindex, apicmd->status, &apicmd->seqnumber, rapidhalocked, zigbeelocked);
    } else if (apicmd->header_primary==RAPIDHA_ZIGBEE_ZCL_GENERAL) {
      zigbeelibifaceptr->process_zcl_send_status(zigbeelibindex, apicmd->status, &apicmd->seqnumber, rapidhalocked, zigbeelocked);
    }
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Error
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_utility_error(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_utility_error_header_t *apicmd=(rapidha_utility_error_header_t *) (rapidhadevice->receivebuf);
  uint64_t addr;
  const char *errorstr;

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_lockrapidha();
  addr=rapidhadevice->addr;
  rapidhalib_unlockrapidha();
  switch (apicmd->error) {
    case 0x00:
      errorstr="Reserved";
      break;
    case 0x01:
      errorstr="Scanning Error";
      break;
    case 0x02:
      errorstr="Key Establishment Error";
      break;
    case 0x03:
      errorstr="Service Discovery and Binding Error";
      break;
    case 0x10:
      errorstr="Reset Error";
      break;
    case 0x20:
      errorstr="Synchronization Error";
      break;
    case 0x30:
      errorstr="Invalid Call Error";
      break;
    case 0xB0:
      errorstr="Local Bootload Error";
      break;
    case 0xB1:
      errorstr="OTA Client Bootloader Error";
      break;
    default:
      errorstr="Reserved";
      break;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: RapidHA: %016llX received error: %s, suberror: %02hhX for frameid: %02hhX\n", __func__, addr, errorstr, apicmd->suberror, apicmd->frameid);
  if (apicmd->error==0xB0) {
    //Special handling for firmware update error
    rapidhalib_lockrapidha();
    if (rapidhadevice->firmware_progress>0) {
      rapidhadevice->firmware_progress=-1;
    }
    rapidhalib_unlockrapidha();
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZDO/ZCL APS ACK Status
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_aps_ack(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_aps_ack_header_t *apicmd;
  const char *zdoorzclstr="";

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(rapidha_aps_ack_header_t *) (rapidhadevice->receivebuf);

  switch (apicmd->header_primary) {
    case RAPIDHA_ZIGBEE_ZDO:
      zdoorzclstr="ZDO";
      break;
    case RAPIDHA_ZIGBEE_ZCL_GENERAL:
      zdoorzclstr="ZCL";
      break;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Received %s APS ACK: %s for frameid: %02hhX, seqnumber: %02hhX\n", __func__, zdoorzclstr, (apicmd->status==0) ? "Received" : "Timeout", apicmd->frameid, apicmd->seqnumber);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZDO Response Timeout
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zdo_response_timeout(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  zigbee_zdo_response_timeout_header_t *apicmd;
  int zigbeelibindex;
  uint16_t destnetaddr, cluster;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(zigbee_zdo_response_timeout_header_t *) (rapidhadevice->receivebuf);

  destnetaddr=apicmd->destnetaddr;
  cluster=apicmd->cluster;
  debuglibifaceptr->debuglib_printf(1, "%s: Received ZDO Timeout for destination: %04hX, Cluster: %04hX, Sequence Number: %02hhX, frameid: %02hhX\n", __func__, destnetaddr, cluster, apicmd->seqnumber, apicmd->frameid);

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zdo_response_timeout(zigbeelibindex, destnetaddr, cluster, &apicmd->seqnumber, rapidhalocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZDO Device Announce Received
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zdo_device_announce_received(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  ZIGBEELIB_IFACEPTR
  zigbee_zdo_device_announce_received_header_t *apicmd;
  zigbee_zdo_response_header_t *zdocmd;
  int zigbeelibindex;
  uint16_t netaddr, clusterid, profileid;
  uint8_t seqnumber;
  uint8_t zigbeelength;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(zigbee_zdo_device_announce_received_header_t *) (rapidhadevice->receivebuf);
  zdocmd=(zigbee_zdo_response_header_t *) &apicmd->netaddr;

  netaddr=apicmd->netaddr;
  clusterid=ZIGBEE_ZDO_END_DEVICE_ANNOUNCE;
  profileid=ZIGBEE_ZDO_PROFILE; //ZDO packets are always in the ZDO profile
  zigbeelength=apicmd->length+1; //Add 1 as we will add the sequence number to the zdocmd
  seqnumber=0; //RapidHA doesn't include the sequence number in this packet

  //Copy the zigbee payload into the generic Zigbee ZDO Response structure
  memmove(&(zdocmd->status), &(apicmd->netaddr), zigbeelength);

  //Now copy the remaining values
  zdocmd->srcnetaddr=netaddr;
  zdocmd->clusterid=clusterid;
  zdocmd->profileid=profileid;
  zdocmd->zigbeelength=zigbeelength;
  zdocmd->seqnumber=seqnumber;

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zdo_response_received(zigbeelibindex, zdocmd, rapidhalocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZCL Response Received
  Converts a RapidHA Zigbee ZCL Response Received packet into a generic Zigbee ZCL Response Packet
    and then passes onto the zigbee library
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zcl_response_received(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  ZIGBEELIB_IFACEPTR
  rapidha_zigbee_zcl_response_received_t *apicmd;
  zigbee_zcl_command_with_manu_t *zclcmd;
  int zigbeelibindex;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(rapidha_zigbee_zcl_response_received_t *) (rapidhadevice->receivebuf);

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zcl command
  //Add 7 for overheads when zigbee library is processing a non-standard variable width at the end of the buffer
  zclcmd=(zigbee_zcl_command_with_manu_t *) calloc(1, sizeof(zigbee_zcl_command_with_manu_t)+(apicmd->zigbeelength)-1+7);
  if (!zclcmd) {
    //Failed to alloc ram
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  zclcmd->srcnetaddr=apicmd->srcnetaddr;
  zclcmd->srcendpnt=apicmd->srcendpnt;
  zclcmd->destendpnt=apicmd->locendpnt;
  zclcmd->clusterid=apicmd->clusterid;
  zclcmd->frame_control=apicmd->frame_control;
  zclcmd->manu=apicmd->manu;
  zclcmd->seqnumber=apicmd->seqnumber;
  zclcmd->cmdid=apicmd->cmdid;
  zclcmd->zigbeelength=apicmd->zigbeelength;

  memmove(&(zclcmd->zigbeepayload), &(apicmd->zigbeepayload), apicmd->zigbeelength);

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zcl_response_received(zigbeelibindex, zclcmd, rapidhalocked, zigbeelocked);
  }
  free(zclcmd);

  MOREDEBUG_EXITINGFUNC();
}

/*
Process a RapidHA ZCL Response Timeout
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zcl_response_timeout(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  zigbee_zcl_response_timeout_header_t *apicmd;
  int zigbeelibindex;
  uint16_t srcnetaddr, cluster;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(zigbee_zcl_response_timeout_header_t *) (rapidhadevice->receivebuf);

  srcnetaddr=apicmd->srcnetaddr;
  cluster=apicmd->cluster;
  debuglibifaceptr->debuglib_printf(1, "%s: Received ZCL Timeout for source: %02hhX, Endpoint: %04hX, Cluster: %04hX, Sequence Number: %02hhX, frameid: %02hhX\n", __func__, srcnetaddr, apicmd->srcendpnt, cluster, apicmd->seqnumber, apicmd->frameid);

  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->process_zcl_response_timeout(zigbeelibindex, srcnetaddr, cluster, &apicmd->seqnumber, rapidhalocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZCL Read Attribute Response
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zcl_read_attribute_response(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  ZIGBEELIB_IFACEPTR
  zigbee_zcl_read_attribute_response_header_t *apicmd;
  int zigbeelibindex;
  uint16_t netaddr, clusterid;
  uint8_t endpoint, attrsize;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(zigbee_zcl_read_attribute_response_header_t *) (rapidhadevice->receivebuf);

  netaddr=apicmd->srcnetaddr;
	endpoint=apicmd->srcendpnt;
  clusterid=apicmd->srcclusterid;
  rapidhalib_display_send_status(apicmd->header_primary, apicmd->frameid, apicmd->status, 0, rapidhalocked);
  if (apicmd->status!=ZIGBEE_ZCL_STATUS_SUCCESS) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  rapidhalib_unlockrapidha();
  if (zigbeelibindex>=0 && zigbeelibifaceptr) {
    zigbeelibifaceptr->decode_zigbee_home_automation_attribute(zigbeelibindex, netaddr, endpoint, clusterid, 0x0000, apicmd->attrid, apicmd->status, apicmd->attrtype, (zigbee_attrval_t *) &(apicmd->attrdata), &attrsize, rapidhalocked, zigbeelocked);
  }
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_ZCL_READ_ATTRIBUTE_RESPONSE) {
    rapidhalib_waitresult=1;
  }
  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA ZCL Write Attribute Response
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
STATIC void rapidhalib_process_zcl_write_attribute_response(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  zigbee_zcl_write_attribute_response_header_t *apicmd;
  uint16_t netaddr, clusterid;

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(zigbee_zcl_write_attribute_response_header_t *) (rapidhadevice->receivebuf);

  netaddr=apicmd->srcnetaddr;
  clusterid=apicmd->srcclusterid;

  if (apicmd->status==0x00) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received ZCL Write Attribute send status: All Writes Successful for frameid: %02hhX from Zigbee device: %04hX clusterid: %04hX\n", __func__, apicmd->frameid, netaddr, clusterid);
  } else {
    int i;

    debuglibifaceptr->debuglib_printf(1, "%s: Received ZCL Write Attribute send status: Some Writes Unsuccessful for frameid: %02hhX from Zigbee device: %04hX clusterid: %04hX\n", __func__, apicmd->frameid, netaddr, clusterid);
    for (i=0; i<apicmd->numattrrecs; i++) {
      debuglibifaceptr->debuglib_printf(1, "%s:   Attr: %04hX Status=%02hhX\n", __func__, apicmd->attrstatus[i].attrid, apicmd->attrstatus[i].status);
    }
  }
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_ZCL_WRITE_ATTRIBUTE_RESPONSE) {
    rapidhalib_waitresult=1;
  }
  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Bootload Image Block Request from the module
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
void rapidhalib_process_bootload_image_block_request(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_bootload_image_block_request_t *apicmd=(rapidha_bootload_image_block_request_t *) (rapidhadevice->receivebuf);
  int cancel_firmware_update=0;
  char *firmware_file;
  int firmwarefile_fd;
  uint64_t addr;
  uint8_t status;

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_lockrapidha();
  addr=rapidhadevice->addr;

  debuglibifaceptr->debuglib_printf(1, "%s: Received Bootload Image Block Request on RapidHA device: %016llX for offset: %lu\n", __func__, addr, apicmd->fileoffset);
  if (!rapidhadevice->firmware_file) {
    //Not currently doing a firmware update so cancel the RapidHA module's firmware upgrade
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling firmware upgrade as a firmware upgrade isn't active at the moment\n", __func__);
    cancel_firmware_update=1;
  }
  if (!cancel_firmware_update && apicmd->fileoffset!=rapidhadevice->firmware_file_offset) {
    if (rapidhadevice->firmware_retries>=RAPIDHA_FIRMWARE_UPDATE_MAX_RETRIES) {
      debuglibifaceptr->debuglib_printf(1, "%s: Cancelling firmware upgrade as a request for file offset: %ld was expected but the requested offset was %ld and the maximum number of retries: %d has been exceeded\n", __func__, rapidhadevice->firmware_file_offset, apicmd->fileoffset, RAPIDHA_FIRMWARE_UPDATE_MAX_RETRIES);
      cancel_firmware_update=1;
    } else {
      //Ensure that the requested file offset is lower than the expected offset
      if (apicmd->fileoffset<rapidhadevice->firmware_file_offset) {
        debuglibifaceptr->debuglib_printf(1, "%s:   Retrying the file offset\n", __func__);
        ++rapidhadevice->firmware_retries;
      } else {
        debuglibifaceptr->debuglib_printf(1, "%s:   Cancelling firmware upgrade as the requested file offset: %ld is higher than the expected offset: %ld\n", __func__, rapidhadevice->firmware_file_offset, apicmd->fileoffset);
        cancel_firmware_update=1;
      }
    }
  }
  rapidhalib_unlockrapidha();

  if (cancel_firmware_update) {
    status=RAPIDHA_STATUS_RESPONSE_ABORT;
  } else {
    rapidhalib_lockrapidha();
    debuglibifaceptr->debuglib_printf(1, "%s: Sending data from offset: %lu from file: %s\n", __func__, apicmd->fileoffset, rapidhadevice->firmware_file);
    rapidhalib_unlockrapidha();
    status=RAPIDHA_STATUS_RESPONSE_SUCCESS;
  }
  rapidhalib_send_rapidha_bootload_image_block_response(rapidhadevice, apicmd->netaddr, apicmd->addr, apicmd->endpoint, status, apicmd->manu, apicmd->image_type, apicmd->fileversion, apicmd->fileoffset, apicmd->maxsize, rapidhalocked);

  rapidhalib_lockrapidha();
  if (cancel_firmware_update && rapidhadevice->firmware_progress>0) {
    rapidhadevice->firmware_progress=-2;
  }
  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA Bootload Upgrade End Request from the module
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
*/
//At the moment just sends an upgrade end response without checking anything
void rapidhalib_process_bootload_upgrade_end_request(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  rapidha_bootload_upgrade_end_request_t *apicmd=(rapidha_bootload_upgrade_end_request_t *) (rapidhadevice->receivebuf);
  int cancel_firmware_update=0;
  char *firmware_file;
  int firmwarefile_fd;
  uint64_t addr;
  uint8_t status;

  MOREDEBUG_ENTERINGFUNC();

  rapidhalib_lockrapidha();
  addr=rapidhadevice->addr;
  rapidhadevice->firmware_progress=RAPIDHA_FIRMWARE_UPDATE_PROGRESS_ENDING;
  rapidhalib_unlockrapidha();
  debuglibifaceptr->debuglib_printf(1, "%s: RapidHA: %016llX firmware upload complete, sending command to apply update\n", __func__, addr);

  rapidhalib_send_rapidha_bootload_upgrade_end_response(rapidhadevice, apicmd->netaddr, apicmd->addr, apicmd->endpoint, apicmd->manu, apicmd->image_type, apicmd->fileversion, rapidhalocked);

  rapidhalib_lockrapidha();
  rapidhadevice->firmware_progress=RAPIDHA_FIRMWARE_UPDATE_PROGRESS_DONE;
  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a RapidHA API packet
  Args: rapidhadevice A pointer to rapidhadevice structure used to store info about the rapidha device including the receive buffer containing the packet
  NOTE: No need to mark rapidha inuse here as all callers of this function do that already
*/
void rapidhalib_process_api_packet(rapidhadevice_t *rapidhadevice, long *rapidhalocked) {
  rapidha_api_response_t *apicmd;
  long zigbeelocked=0;
  DEBUGLIB_IFACEPTR

  MOREDEBUG_ENTERINGFUNC();
  apicmd=(rapidha_api_response_t *) (rapidhadevice->receivebuf);

  //Goto appropriate frame type processing function
  if (apicmd->header_primary==RAPIDHA_UTILITY) {
    switch (apicmd->header_secondary) {
      case RAPIDHA_UTILITY_STARTUP_SYNC_REQUEST:
        rapidhalib_process_utility_startup_sync_request(rapidhadevice, rapidhalocked);
        break;
      case RAPIDHA_UTILITY_MODULE_INFO_RESPONSE:
        rapidhalib_process_utility_module_info_response(rapidhadevice, rapidhalocked);
        break;
      case RAPIDHA_UTILITY_STATUS_RESPONSE:
        rapidhalib_process_send_status(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_UTILITY_ERROR:
        rapidhalib_process_utility_error(rapidhadevice, rapidhalocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA Utility packet of unknown type: %02hhX\n", __func__, apicmd->header_secondary);
    }
  } else if (apicmd->header_primary==RAPIDHA_NETWORK_COMISSIONING) {
    switch (apicmd->header_secondary) {
      case RAPIDHA_NETWORK_COMISSIONING_NETWORK_STATUS_RESPONSE:
        rapidhalib_process_network_comissioning_network_status_response(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA Network Comissioning packet of unknown type: %02hhX\n", __func__, apicmd->header_secondary);
    }
  } else if (apicmd->header_primary==RAPIDHA_ZIGBEE_ZDO) {
    switch (apicmd->header_secondary) {
      case RAPIDHA_ZIGBEE_ZDO_RESPONSE_RECEIVED:
        rapidhalib_process_zdo_response_received(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZDO_SEND_STATUS:
        rapidhalib_process_send_status(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZDO_APS_ACK:
        rapidhalib_process_aps_ack(rapidhadevice, rapidhalocked);
        break;
      case RAPIDHA_ZIGBEE_ZDO_RESPONSE_TIMEOUT:
        rapidhalib_process_zdo_response_timeout(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZDO_DEVICE_ANNOUNCE_RECEIVED:
        rapidhalib_process_zdo_device_announce_received(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA ZDO packet of unknown type: %02hhX\n", __func__, apicmd->header_secondary);
    }
  } else if (apicmd->header_primary==RAPIDHA_ZIGBEE_ZCL_GENERAL) {
    switch (apicmd->header_secondary) {
      case RAPIDHA_ZIGBEE_ZCL_SEND_STATUS:
        rapidhalib_process_send_status(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZCL_APS_ACK:
        rapidhalib_process_aps_ack(rapidhadevice, rapidhalocked);
        break;
      case RAPIDHA_ZIGBEE_ZCL_RESPONSE_RECEIVED:
      case RAPIDHA_ZIGBEE_ZCL_PASSTHRU_MESS:
        //NOTE: The ZCL Pass-Through Message has the same packet format as ZCL Response
        rapidhalib_process_zcl_response_received(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZCL_RESPONSE_TIMEOUT:
        rapidhalib_process_zcl_response_timeout(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZCL_READ_ATTR_RESPONSE:
        rapidhalib_process_zcl_read_attribute_response(rapidhadevice, rapidhalocked, &zigbeelocked);
        break;
      case RAPIDHA_ZIGBEE_ZCL_WRITE_ATTR_RESPONSE:
        rapidhalib_process_zcl_write_attribute_response(rapidhadevice, rapidhalocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA ZCL packet of unknown type: %02hhX\n", __func__, apicmd->header_secondary);
    }
  } else if (apicmd->header_primary==RAPIDHA_BOOTLOAD) {
    switch (apicmd->header_secondary) {
      case RAPIDHA_BOOTLOAD_IMAGE_BLOCK_REQUEST:
        rapidhalib_process_bootload_image_block_request(rapidhadevice, rapidhalocked);
        break;
      case RAPIDHA_BOOTLOAD_UPGRADE_END_REQUEST:
        rapidhalib_process_bootload_upgrade_end_request(rapidhadevice, rapidhalocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA Bootload packet of unknown type: %02hhX\n", __func__, apicmd->header_secondary);
    }
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Received RapidHA packet of unknown type: %02hhX %02hhX\n", __func__, apicmd->header_primary, apicmd->header_secondary);
  }
  rapidhalib_lockrapidha();
  if (rapidhalib_waitingforresponse==RAPIDHA_WAITING_FOR_ANYTHING) {
    rapidhalib_waitresult=1;
  }
  rapidhalib_unlockrapidha();
  MOREDEBUG_EXITINGFUNC();
}

//=========================
//End of Protocol Functions
//=========================

/*
  Receive raw unprocessed rapidha data from a function that received the data from the rapidha device
  Args: serdevidx: The index to the serial device for the rapidha device
        handlerdevidx: The index to this handler's rapidha device or -1 if the rapidha hasn't been setup yet (Still being detected)
        buffer: The buffer containing the raw data
        bufcnt: The number of bytes of data received
  NOTE: Don't need much thread locking since when this function is in the main loop it will be the only one using these variables
*/
void rapidhalib_receiveraw(int UNUSED(serdevidx), int handlerdevidx, char *buffer, int bufcnt) {
  DEBUGLIB_IFACEPTR
  unsigned char serchar;
  int bufpos=0;
  rapidhadevice_t *rapidhadevice; //A pointer to the rapidha device that the data was received on
  long rapidhalocked=0;

  MOREDEBUG_ENTERINGFUNC();
  if (handlerdevidx!=-1) {
    //Assign to rapidhadevice element
    rapidhadevice=(rapidhadevice_t *) &rapidhalib_rapidhadevices[handlerdevidx];
  } else {
    if (rapidhalib_getdetectingdevice(&rapidhalocked)) {
      //Only handle data from newrapidha if we are currently detecting an rapidha
      rapidhadevice=&rapidhalib_newrapidha;

      //Prevent re-initialisation until finished in the receive thread
      PTHREAD_LOCK(&rapidhalibmutex_initnewrapidha);
    } else {
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  if (rapidhalib_markrapidha_inuse(rapidhadevice, &rapidhalocked)<0) {
    //Failed to mark rapidha as inuse
    if (rapidhadevice==&rapidhalib_newrapidha) {
      PTHREAD_UNLOCK(&rapidhalibmutex_initnewrapidha);
    }
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (rapidhadevice->receivebuf==NULL) {
    rapidhalib_markrapidha_notinuse(rapidhadevice, &rapidhalocked);
    if (rapidhadevice==&rapidhalib_newrapidha) {
      PTHREAD_UNLOCK(&rapidhalibmutex_initnewrapidha);
    }
    //Not ready to receive data yet ; This should never happen since the detect function will allocate space before
    //  the receive thread is switched from newrapidha lib to the rapidhalib list element
    debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Received data before buffer space allocated\n", __func__);
    MOREDEBUG_EXITINGFUNC();
    return;
  }

#ifdef RAPIDHALIB_MOREDEBUG
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
    if (rapidhadevice->receivebufcnt==BUFFER_SIZE) {
      //Throw away invalid data
      debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Received buffer size limit reached, throwing away %d bytes\n", __func__, BUFFER_SIZE);
      rapidhadevice->receivebufcnt=0;
      rapidhadevice->receive_checksum=0;
      rapidhadevice->receive_processing_packet=0;
      rapidhadevice->receive_escapechar=0;
      rapidhadevice->receive_packetlength=0;
    }
    if (!rapidhadevice->receive_processing_packet && serchar==0xF1) {
      //Found the beginning of an API packet
      rapidhadevice->receivebufcnt=0;
      rapidhadevice->receive_checksum=0;
      rapidhadevice->receivebuf[rapidhadevice->receivebufcnt++]=serchar;
      rapidhadevice->receive_processing_packet=1;
      rapidhadevice->receive_escapechar=0xff; //Start with large packet length so checks don't stop early
      continue;
    }
    if (rapidhadevice->receive_processing_packet) {
      rapidhadevice->receivebuf[rapidhadevice->receivebufcnt++]=serchar;
      if (rapidhadevice->receivebufcnt-5<=rapidhadevice->receive_packetlength) {
        //Count everything after the frame start except the last 2 checksum bytes
        rapidhadevice->receive_checksum+=serchar;
      }
      if (rapidhadevice->receivebufcnt==5) {
        rapidhadevice->receive_packetlength=serchar;
      } else if (rapidhadevice->receivebufcnt-7==rapidhadevice->receive_packetlength) {
        uint16_t checksum;

        rapidhadevice->receive_processing_packet=0;
        checksum=(((uint16_t) rapidhadevice->receivebuf[rapidhadevice->receivebufcnt-1] << 8) | rapidhadevice->receivebuf[rapidhadevice->receivebufcnt-2]);
        if (rapidhadevice->receive_checksum!=checksum) {
          //Invalid checksum so ignore
          debuglibifaceptr->debuglib_printf(1, "%s: WARNING: Invalid checksum: %04X received, expecting: %04X, rapidha packet length: %d\n", __func__, checksum, rapidhadevice->receive_checksum, rapidhadevice->receive_packetlength);
        } else {
          //A full API Packet has been received and is ready for processing

          //Process the API packet here
          rapidhalib_process_api_packet(rapidhadevice, &rapidhalocked);
          rapidhalib_lockrapidha();
          if (rapidhalib_waitresult) {
            sem_post(&rapidhalib_waitforresponsesem);
            rapidhalib_waitresult=0;
          }
          rapidhalib_unlockrapidha();
        }
        //Ready to process a new packet
        rapidhalib_lockrapidha();
        rapidhadevice->receivebufcnt=0;
        rapidhadevice->receive_checksum=0;
        rapidhadevice->receive_processing_packet=0;
        rapidhadevice->receive_escapechar=0;
        rapidhadevice->receive_packetlength=0;
        rapidhalib_unlockrapidha();
      }
    } else {
      //Ignore invalid bytes here
    }
  }
  rapidhalib_markrapidha_notinuse(rapidhadevice, &rapidhalocked);
  if (rapidhadevice==&rapidhalib_newrapidha) {
    PTHREAD_UNLOCK(&rapidhalibmutex_initnewrapidha);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Find a rapidha device in the rapidha table
  Arguments:
    rapidhadevice A pointer to rapidhadevice structure associated with the device
    addr: The 64-bit destination IEEE address of the device
  Returns the index of the rapidha device or -1 if not found
*/
STATIC int rapidhalib_find_rapidha_device(uint64_t addr, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int i, match_found=-1;
  int numrapidhadevices;

  MOREDEBUG_ENTERINGFUNC();
  rapidhalib_lockrapidha();
  numrapidhadevices=_rapidhalib_getnumrapidhadevices();
  for (i=0; i<numrapidhadevices; i++) {
    if (rapidhalib_rapidhadevices[i].addr==addr && !rapidhalib_rapidhadevices[i].removed && !rapidhalib_rapidhadevices[i].needtoremove) {
      match_found=i;
      break;
    }
  }
  rapidhalib_unlockrapidha();
  MOREDEBUG_EXITINGFUNC();

  return match_found;
}

//Initialise rapidhalib_newrapidha values
//When we copy rapidhalib_newrapidha to the rapidha list, the zigbeedevices pointer will be used by that rapidha element
//  so we shouldn't free it here just set it back to NULL.
STATIC void _init_rapidhalib_newrapidha(void) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  //pthread_mutex_t sendmutex;
  unsigned char *receivebuf;

  MOREDEBUG_ENTERINGFUNC();

  //Wait for other threads to finish using newrapidha first
  PTHREAD_LOCK(&rapidhalibmutex_initnewrapidha);

  //Backup sendmutex, and receivebuf
  receivebuf=rapidhalib_newrapidha.receivebuf;

  //Clear rapidhalib_newrapidha
  memset(&rapidhalib_newrapidha, 0, sizeof(rapidhadevice_t));

  //Restore sendmutex, and receivebuf
  rapidhalib_newrapidha.receivebuf=receivebuf;

  //Set new non-zero initial values
  rapidhalib_newrapidha.serdevidx=-1;
  rapidhalib_newrapidha.zigbeelibindex=-1;
  rapidhalib_newrapidha.waiting_for_remotestatus=-1;

  rapidhalib_newrapidha.firmwarefile_fd=-1;

  PTHREAD_UNLOCK(&rapidhalibmutex_initnewrapidha);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Initialise a semaphore for waiting for a response to a packet
  Also applies the waitforresponse pthread lock
  Send your packet after calling this function and then call waitforresponse
  Returns negative value on error or >= 0 on success
*/
STATIC int rapidhalib_initwaitforresponse(int waitingforresponseid, long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  MOREDEBUG_ENTERINGFUNC();

  PTHREAD_LOCK(&rapidhalibmutex_waitforresponse);
  if (sem_init(&rapidhalib_waitforresponsesem, 0, 0)==-1) {
    //Can't initialise semaphore
    PTHREAD_UNLOCK(&rapidhalibmutex_waitforresponse);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  rapidhalib_lockrapidha();
  rapidhalib_waitingforresponse=waitingforresponseid;
  rapidhalib_waitresult=0;
  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

/*
  Wait for a response to a packet by waiting for the semaphore to be released
  Also releases the waitforresponse pthread lock
  Send your packet after calling initwaitforresponse and then call this function
  Returns negative value on error or >= 0 on success
*/
STATIC int rapidhalib_waitforresponse(long *rapidhalocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int result, lerrno;
  struct timespec waittime;

  MOREDEBUG_ENTERINGFUNC();

  //Wait 1 second for the result
  clock_gettime(CLOCK_REALTIME, &waittime);
  waittime.tv_sec+=RAPIDHA_DETECT_TIMEOUT;
  while ((result=sem_timedwait(&rapidhalib_waitforresponsesem, &waittime)) == -1 && errno == EINTR)
    continue; /* Restart if interrupted by handler */
  lerrno=errno;
  rapidhalib_lockrapidha();
  rapidhalib_waitingforresponse=0;
  rapidhalib_unlockrapidha();
  sem_destroy(&rapidhalib_waitforresponsesem);
  PTHREAD_UNLOCK(&rapidhalibmutex_waitforresponse);
  if (result==-1 && lerrno==ETIMEDOUT) {
    //Failed to receive the response
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

//Get initial info about a RapidHA module and reset it if it doesn't respond
static int rapidhalib_initialRapidHAsetup(rapidhadevice_t *rapidhadevice, int longdetect, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  int result, retrycnt, maxretry;

  if (longdetect) {
    maxretry=20;
  } else {
    maxretry=2;
  }
  retrycnt=0;
  while (retrycnt<maxretry) {
    //Send Module Info Request
    result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_UTILITY_MODULE_INFO_RESPONSE, rapidhalocked);
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
      return -1;
    }
    rapidhalib_send_rapidha_module_info_request(rapidhadevice, rapidhalocked);

    //Wait 1 second for the result
    result=rapidhalib_waitforresponse(rapidhalocked);
    if (result>=0) {
      //We got a response
      break;
    }
    if ((longdetect && retrycnt % 4==0) || !longdetect) {
      //Reset the RapidHA module to get it in a known state
      //Only reset on every 4th retry if longdetect is set
      debuglibifaceptr->debuglib_printf(1, "%s: Sending the reset command to the RapidHA\n", __func__);
      rapidhalib_send_rapidha_utility_reset(rapidhadevice, rapidhalocked);

      //Wait 100 milliseconds after reset
      usleep(100000);
    }
    ++retrycnt;
  }
  if (retrycnt>=maxretry) {
    //Failed to receive the rapidha module info response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive RapidHA Module Info Response\n", __func__);
    return -1;
  }
  return 0;
}

/*
  Detect a rapidha and reset it if necessary
*/
static int rapidhalib_detect_rapidha(rapidhadevice_t *rapidhadevice, int longdetect, long *rapidhalocked) {
  DEBUGLIB_IFACEPTR
  int detectresult, result;

  detectresult=rapidhalib_initialRapidHAsetup(&rapidhalib_newrapidha, longdetect, rapidhalocked);
  if (detectresult<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
    return -1;
  }
  //Send RapidHA Network Status Request
  result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_NETWORK_COMISSIONING_NETWORK_STATUS_RESPONSE, rapidhalocked);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
    return -1;
  }
  rapidhalib_send_rapidha_network_comissioning_network_status_request(rapidhadevice, rapidhalocked);

  //Wait 1 second for the result
  result=rapidhalib_waitforresponse(rapidhalocked);
  if (result<0) {
    //Failed to receive the rapidha network commissioning status response
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to receive RapidHA Network Commissioning Status Response\n", __func__);
    return -1;
  }
  rapidhalib_lockrapidha();
  {
    uint8_t firmmaj, firmmin, firmbuild; //RapidHA Firmware version

    firmmaj=rapidhadevice->firmmaj;
    firmmin=rapidhadevice->firmmin;
    firmbuild=rapidhadevice->firmbuild;

    debuglibifaceptr->debuglib_printf(1, "%s: Firmware Version=%d.%d.%d\n", __func__, firmmaj, firmmin, firmbuild);
    debuglibifaceptr->debuglib_printf(1, "%s: 64-bit Network Address=%016llX\n",__func__, rapidhadevice->addr);

    if (firmmaj>1 || (firmmaj==1 && firmmin>5) || (firmmaj==1 && firmmin==5 && firmbuild>=3)) {
      //Firmware version>=1.5.3 supports reporting but not reporting of manufacturer specific attributes
      rapidhadevice->reportingsupported=1;
    }
    if (firmmaj>1 || (firmmaj==1 && firmmin>5) || (firmmaj==1 && firmmin==5 && firmbuild>=6)) {
      //Firmware version>=1.5.6 supports reporting of manufacturer specific attributes
      rapidhadevice->manureportingsupported=1;
    }
  }
  //NOTE: Always do full reinit at startup so things like the time get updated
  rapidhadevice->needreinit=1;

  rapidhalib_unlockrapidha();

  return 0;
}

/*
  A function used to check if the handler supports a serial device
  Returns the handler index if supported or -1 if not
  NOTE: It may take a few seconds for the auto detection to complete
*/
int rapidhalib_isDeviceSupported(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count)) {
  DEBUGLIB_IFACEPTR
  int i, detectresult, list_numitems;
  long rapidhalocked=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  PTHREAD_LOCK(&rapidhalibmutex_detectingdevice);

  //Initialise values before setting detectingdevice flag so the values don't change while receive is running
  _init_rapidhalib_newrapidha();
  rapidhalib_newrapidha.serdevidx=serdevidx;
  rapidhalib_newrapidha.sendFuncptr=sendFuncptr;

  rapidhalib_setdetectingdevice(1, &rapidhalocked);
  debuglibifaceptr->debuglib_printf(1, "%s: serial device index=%d\n", __func__, serdevidx);

  detectresult=rapidhalib_detect_rapidha(&rapidhalib_newrapidha, 0, &rapidhalocked);
  if (detectresult<0) {
    rapidhalib_setdetectingdevice(0, &rapidhalocked);
    PTHREAD_UNLOCK(&rapidhalibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
    return -1;
  }
  rapidhalib_lockrapidha();
  //Setup a list entry for the rapidha device

  //First search for an empty slot
  for (i=0; i<MAX_RAPIDHA_DEVICES; i++) {
    if (rapidhalib_rapidhadevices[i].removed) {
      break;
    }
  }
  if (i==MAX_RAPIDHA_DEVICES) {
    rapidhalib_setdetectingdevice(0, &rapidhalocked);
    rapidhalib_unlockrapidha();
    PTHREAD_UNLOCK(&rapidhalibmutex_detectingdevice);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d RapidHA devices has been reached\n", __func__, MAX_RAPIDHA_DEVICES);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
    return -1;
  } else {
    list_numitems=i;
  }
  //Reset detecting device so receiveraw stops using rapidhalib_newrapidha
  rapidhalib_detectingdevice=0;

  //If receiveraw is running it will have marked rapidhalib_newrapidha in use so we need to wait for it to finish and
  //  then it will be safe to make an atomic copy of the structure
  //Also need to unlock rapidha so receiveraw can lock.  This is okay as this is the only place where new rapidha devices
  //  are added
  rapidhalib_unlockrapidha();
  PTHREAD_LOCK(&rapidhalibmutex_initnewrapidha);
  memcpy(&rapidhalib_rapidhadevices[list_numitems], &rapidhalib_newrapidha, sizeof(rapidhadevice_t));
  PTHREAD_UNLOCK(&rapidhalibmutex_initnewrapidha);
  rapidhalib_lockrapidha();

  //Allocate new memory for the send and receive buffers
  rapidhalib_rapidhadevices[list_numitems].receivebuf=(unsigned char *) malloc(BUFFER_SIZE*sizeof(unsigned char));

  if (i==rapidhalib_numrapidhadevices) {
    ++rapidhalib_numrapidhadevices;
  }
  rapidhalib_unlockrapidha();

  PTHREAD_UNLOCK(&rapidhalibmutex_detectingdevice);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return list_numitems;
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
STATIC int rapidhalib_processcommand(const char *buffer, int clientsock) {
  CMDSERVERLIB_IFACEPTR
  char tmpstrbuf[100];
  int i, len, found;
  uint64_t addr;
  int numrapidhadevices;
  long rapidhalocked=0;

  if (!cmdserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();
  len=strlen(buffer);
  if (strncmp(buffer, "rapidha_join_network ", 21)==0 && len>=37) {
    //Format: rapidha_join_network <64-bit addr>
    sscanf(buffer+21, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      rapidhalib_send_rapidha_network_comissioning_join_network(&rapidhalib_rapidhadevices[found], &rapidhalocked);
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "OKAY\n");
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "rapidha_form_network ", 21)==0 && len>=37) {
    //Format: rapidha_form_network <64-bit addr>
    sscanf(buffer+21, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      rapidhalib_send_rapidha_network_comissioning_form_network(&rapidhalib_rapidhadevices[found], ZIGBEE_CHANMASK_STANDARD, &rapidhalocked);
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "OKAY\n");
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "rapidha_form_network_netvoxchan ", 32)==0 && len>=48) {
    //Format: rapidha_form_network <64-bit addr>
    sscanf(buffer+32, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      rapidhalib_send_rapidha_network_comissioning_form_network(&rapidhalib_rapidhadevices[found], ZIGBEE_CHANMASK_NETVOX, &rapidhalocked);
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "OKAY\n");
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "rapidha_leave_network ", 22)==0 && len>=38) {
    //Format: rapidha_leave_network <64-bit addr>
    sscanf(buffer+22, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      rapidhalib_send_rapidha_network_comissioning_leave_network(&rapidhalib_rapidhadevices[found], &rapidhalocked);
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "OKAY\n");
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "rapidha_reinit ", 15)==0 && len>=31) {
    uint8_t device_type=0xFF;

    //Format: rapidha_reinit <64-bit addr> <type>
    //  where type is full function, reduced function non-sleepy, or reduced function sleepy
    sscanf(buffer+15, "%016llX", (unsigned long long *) &addr);

    //WARNING: Setting the device as reduced function may cause problems with some RapidHA modules
    device_type=0;
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      rapidhalib_rapidhadevices[found].needreinit=device_type+1;
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RapidHA has been scheduled for reinitialisation as type: ");
      switch (device_type) {
        case 0: sprintf(tmpstrbuf+57, "Full Function\n");
                break;
        case 2: sprintf(tmpstrbuf+57, "Reduced Function Non-Sleep\n");
                break;
        case 3: sprintf(tmpstrbuf+57, "Reduced Function Sleep\n");
                break;
      }
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016llX\n", (unsigned long long) addr);
    }
  } else if (strncmp(buffer, "get_rapidha_info", 16)==0) {
    int found=0;

    //Format: get_rapidha_info
    rapidhalib_lockrapidha();
    numrapidhadevices=_rapidhalib_getnumrapidhadevices();
    for (i=0; i<numrapidhadevices; i++) {
      uint8_t firmmaj, firmmin, firmbuild;
      uint8_t network_state, device_type, cfgstate, channel;
      uint16_t netaddr, panid;
      uint64_t extpanid, addr;
      char needtoremove;
      const char *cfgstatestr="Unknown";

      if (rapidhalib_rapidhadevices[i].removed) {
        continue;
      } else {
        found=1;
      }
      needtoremove=rapidhalib_rapidhadevices[i].needtoremove;
      firmmaj=rapidhalib_rapidhadevices[i].firmmaj;
      firmmin=rapidhalib_rapidhadevices[i].firmmin;
      firmbuild=rapidhalib_rapidhadevices[i].firmbuild;
      network_state=rapidhalib_rapidhadevices[i].network_state;
      device_type=rapidhalib_rapidhadevices[i].device_type;
      cfgstate=rapidhalib_rapidhadevices[i].cfgstate;
      channel=rapidhalib_rapidhadevices[i].channel;
      netaddr=rapidhalib_rapidhadevices[i].netaddr;
      panid=rapidhalib_rapidhadevices[i].panid;
      extpanid=rapidhalib_rapidhadevices[i].extpanid;
      addr=rapidhalib_rapidhadevices[i].addr;

      switch (cfgstate) {
        case RAPIDHA_CFGSTATE_FACTORY_DEFAULT:
          cfgstatestr="Factory Default";
          break;
        case RAPIDHA_CFGSTATE_NEEDS_ENDPOINT_CONFIG:
          cfgstatestr="Needs Endpoint Configuration";
          break;
        case RAPIDHA_CFGSTATE_FULLY_CONFIGURED:
          cfgstatestr="Fully Configured";
          break;
      }
      sprintf(tmpstrbuf, "RAPIDHA ADDRESS: %016llX : %04hX\n", (unsigned long long) addr, (unsigned short) netaddr);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      if (needtoremove) {
        sprintf(tmpstrbuf, "  Scheduled to be removed\n");
        cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
      sprintf(tmpstrbuf, "  Firmware Version=%d.%d.%d\n", firmmaj, firmmin, firmbuild);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      cmdserverlibifaceptr->cmdserverlib_netputs("  Network State=", clientsock, NULL);
      cmdserverlibifaceptr->cmdserverlib_netputs(rapidhalib_get_network_state_string(network_state), clientsock, NULL);
      cmdserverlibifaceptr->cmdserverlib_netputs("\n  Device Type=", clientsock, NULL);
      cmdserverlibifaceptr->cmdserverlib_netputs(rapidhalib_get_device_type_string(device_type), clientsock, NULL);
      sprintf(tmpstrbuf, "\n  Configuration State: %s", cfgstatestr);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "\n  Channel=%02hhX\n", channel);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Pan ID=%04hX\n", panid);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      sprintf(tmpstrbuf, "  Extended Pan ID=%016llX\n", (unsigned long long) extpanid);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    }
    if (!found) {
      cmdserverlibifaceptr->cmdserverlib_netputs("NO RAPIDHA DEVICES FOUND\n", clientsock, NULL);
    }
    rapidhalib_unlockrapidha();
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return CMDLISTENER_NOERROR;
}

//Format: rapidha_firmware_upgrade <64-bit addr> <path_to_filename>
static int rapidhalib_process_firmware_upgrade_command(const char *buffer, int clientsock) {
  CMDSERVERLIB_IFACEPTR

  if (strncmp(buffer, "rapidha_firmware_upgrade ", 25)==0 && strlen(buffer)>=43) {
    char tmpstrbuf[300];
    uint64_t addr;
    int found;
    long rapidhalocked=0;

    sscanf(buffer+25, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      if (rapidhalib_rapidhadevices[found].firmware_file) {
        sprintf(tmpstrbuf, "RapidHA device: %016" PRIX64 " is already updating with file: %s\n", addr, rapidhalib_rapidhadevices[found].firmware_file);
        rapidhalib_unlockrapidha();
        cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      } else {
        struct stat stat_buf;
        int statresult, localerrno;

        statresult=stat(buffer+42, &stat_buf);
        localerrno=errno;
        if (statresult!=0) {
          rapidhalib_unlockrapidha();
          sprintf(tmpstrbuf, "RAPIDHA: Unable to access file: \"%s\", errno=%d\n", buffer+42, localerrno);
        } else {
          rapidhalib_rapidhadevices[found].firmware_file=strdup(buffer+42);
          if (!rapidhalib_rapidhadevices[found].firmware_file) {
            rapidhalib_unlockrapidha();
            sprintf(tmpstrbuf, "RAPIDHA: Failed to allocate ram for filename: %s\n", buffer+42);
          } else {
            rapidhalib_unlockrapidha();
            sprintf(tmpstrbuf, "Upgrade scheduled for RapidHA device: %016" PRIX64 " using file: \"%s\"\n", addr, buffer+42);
          }
        }
        cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
      }
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016" PRIX64 " not found\n", addr);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    }
    return CMDLISTENER_NOERROR;
  }
  return CMDLISTENER_CMDINVALID;
}

//Format: rapidha_cancel_firmware_upgrade <64-bit addr> <path_to_filename>
static int rapidhalib_process_cancel_firmware_upgrade_command(const char *buffer, int clientsock) {
  CMDSERVERLIB_IFACEPTR

  if (strncmp(buffer, "rapidha_cancel_firmware_upgrade ", 32)==0 && strlen(buffer)>=48) {
    char tmpstrbuf[100];
    uint64_t addr;
    int found;
    long rapidhalocked=0;

    sscanf(buffer+32, "%016llX", (unsigned long long *) &addr);
    rapidhalib_lockrapidha();
    found=rapidhalib_find_rapidha_device(addr, &rapidhalocked);
    if (found>=0) {
      if (!rapidhalib_rapidhadevices[found].firmware_file) {
        rapidhalib_unlockrapidha();
        sprintf(tmpstrbuf, "RAPIDHA: Firmware upgrade not currently active\n");
      } else {
        if (rapidhalib_rapidhadevices[found].firmwarefile_fd!=-1) {
          close(rapidhalib_rapidhadevices[found].firmwarefile_fd);
          rapidhalib_rapidhadevices[found].firmwarefile_fd=-1;
        }
        if (rapidhalib_rapidhadevices[found].firmware_file) {
          free(rapidhalib_rapidhadevices[found].firmware_file);
          rapidhalib_rapidhadevices[found].firmware_file=NULL;
        }
        rapidhalib_unlockrapidha();
        sprintf(tmpstrbuf, "RAPIDHA: Firmware upgrade for RapidHA device: %016" PRIX64 " has been cancelled\n", addr);
      }
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    } else {
      rapidhalib_unlockrapidha();
      sprintf(tmpstrbuf, "RAPIDHA: NOT FOUND %016" PRIX64 "\n", addr);
      cmdserverlibifaceptr->cmdserverlib_netputs(tmpstrbuf, clientsock, NULL);
    }
    return CMDLISTENER_NOERROR;
  }
  return CMDLISTENER_CMDINVALID;
}

/*
  A function called by the parent library when the rapidha device has been removed
  If the rapidhadevice is still in use we return negative value but mark the rapidha for removal so
    it won't be used again and can be removed on the next call to this function
  Return 1 if removed, 0 if still in use, or negative value on error
*/
int rapidhalib_serial_device_removed(int serdevidx) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  int i, index, result;
  int numrapidhadevices;
  rapidhadevice_t *rapidhadeviceptr=NULL;
  long rapidhalocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  rapidhalib_lockrapidha();

  numrapidhadevices=_rapidhalib_getnumrapidhadevices();
  for (i=0; i<numrapidhadevices; i++) {
    rapidhadeviceptr=&rapidhalib_rapidhadevices[i];
    if (rapidhadeviceptr->removed) {
      //This rapidha is removed so we can't trust any other values
      continue;
    }
    if (rapidhadeviceptr->serdevidx==serdevidx) {
      //Found a match for serdevidx
      break;
    }
  }
  if (i==numrapidhadevices) {
    rapidhalib_unlockrapidha();

    MOREDEBUG_EXITINGFUNC();

    //If we get here it is because there wasn't a match for serdevidx
    return -2;
  }
  if (!rapidhadeviceptr->needtoremove) {
    //Mark that this rapidha needs to be removed so other functions stop using it
    debuglibifaceptr->debuglib_printf(1, "%s: Marking RapidHA %016llX at index: %d for removal\n", __func__, rapidhadeviceptr->addr, i);
    rapidhadeviceptr->needtoremove=1;
  }
  if (rapidhadeviceptr->zigbeelibindex>=0 && zigbeelibifaceptr) {
		result=zigbeelibifaceptr->remove_localzigbeedevice(rapidhadeviceptr->zigbeelibindex, &rapidhalocked, &zigbeelocked);
		if (result==0) {
			//Still in use so we can't cleanup yet
			debuglibifaceptr->debuglib_printf(1, "%s: RapidHA %016llX at index: %d is still in use: %d by Zigbee so it cannot be fully removed yet\n", __func__, rapidhadeviceptr->addr, i, rapidhadeviceptr->inuse);

			rapidhalib_unlockrapidha();

			MOREDEBUG_EXITINGFUNC();
			return 0;
		}
  }
  if (rapidhadeviceptr->inuse) {
    //Still in use so we can't cleanup yet
    debuglibifaceptr->debuglib_printf(1, "%s: RapidHA %016llX at index: %d is still in use: %d so it cannot be fully removed yet\n", __func__, rapidhadeviceptr->addr, i, rapidhadeviceptr->inuse);

    rapidhalib_unlockrapidha();

    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  //Remove the RapidHA from ram
  index=i; //So we can refer to the index later on

  if (rapidhadeviceptr->receivebuf) {
    free(rapidhadeviceptr->receivebuf);
    rapidhadeviceptr->receivebuf=NULL;
  }
  //We can remove the RapidHA as it isn't in use
  debuglibifaceptr->debuglib_printf(1, "%s: RapidHA %016llX at index: %d has now been removed\n", __func__, rapidhadeviceptr->addr, index);
  memset(rapidhadeviceptr, 0, sizeof(rapidhadevice_t));
  rapidhadeviceptr->serdevidx=-1;
  rapidhadeviceptr->zigbeelibindex=-1;
  rapidhadeviceptr->waiting_for_remotestatus=-1;

  rapidhadeviceptr->removed=1;

  rapidhalib_unlockrapidha();

  MOREDEBUG_EXITINGFUNC();

  //The device was successfully removed
  return 1;
}

//Initialise a RapidHA device with device type, needed endpoints, passthru, etc
//The commands sent here were modeled from the RapidHA Coordinator Desktop program console output
STATIC void rapidhalib_doreinit(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  DEBUGLIB_IFACEPTR
  int detectresult, result;
  uint64_t addr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  rapidhalib_lockrapidha();
  addr=rapidhadevice->addr;
  rapidhalib_unlockrapidha();
  debuglibifaceptr->debuglib_printf(1, "%s: Reinitialising RapidHA: %016" PRIX64 "\n", __func__, addr);

  detectresult=rapidhalib_initialRapidHAsetup(rapidhadevice, 0, rapidhalocked);
  if (detectresult<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s line: %d\n", __func__, __LINE__);
    return;
  }
  result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_UTILITY_STARTUP_SYNC_REQUEST, rapidhalocked);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to setup a semaphore to wait for a RapidHA response\n", __func__);
    return;
  }
  rapidhalib_send_rapidha_host_startup_ready(rapidhadevice, rapidhalocked);

  //Wait 1 second for the result
  result=rapidhalib_waitforresponse(rapidhalocked);

  //Clear the current endpoint config
  rapidhalib_send_rapidha_support_config_clear_endpoint_config(rapidhadevice, rapidhalocked);

  //Add endpoints to the RapidHA module - This is the important one that adds the Home Automation Profile to the RapidHA module
  rapidhalib_send_rapidha_support_config_add_endpoint(rapidhadevice, rapidhalocked);

  //Add Attributes to RapidHA Clusters
  rapidhalib_send_rapidha_support_config_add_attributes_to_cluster(rapidhadevice, rapidhalocked);

  //Set the time on the RapidHA device
  //NOTE: Source endpoint isn't used on RapidHA but might be on other Zigbee devices
  rapidhalib_send_rapidha_support_config_send_current_time(rapidhadevice, rapidhadevice->addr, rapidhadevice->netaddr, 0x0, 0x1, rapidhalocked, zigbeelocked);

  //Enable Pass Through of some commands
  rapidhalib_send_rapidha_support_config_register_commands_pasthru(rapidhadevice, rapidhalocked);

  //Enable Pass Through of Reporting if supported
  if (rapidhadevice->reportingsupported) {
    rapidhalib_send_rapidha_support_config_attribute_report_passthrough_control(rapidhadevice, rapidhalocked);
  }
  //Now Send RapidHA Startup Sync Complete
  result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_RAPIDHA_UTILITY_STATUS_RESPONSE, rapidhalocked);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to setup a semaphore to wait for a RapidHA response\n", __func__);
    return;
  }
  rapidhalib_send_rapidha_startup_sync_complete(rapidhadevice, rapidhalocked);

  //Wait 1 second for the result
  result=rapidhalib_waitforresponse(rapidhalocked);

  //Check that the RapidHA is properly configured now
  debuglibifaceptr->debuglib_printf(1, "%s: RapidHA: %016" PRIX64 ": Checking that reinitialisation was successful\n", __func__, addr);
  result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_UTILITY_STARTUP_SYNC_REQUEST, rapidhalocked);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to setup a semaphore to wait for a RapidHA response\n", __func__);
    return;
  }
  rapidhalib_send_rapidha_host_startup_ready(rapidhadevice, rapidhalocked);

  //Wait 1 second for the result
  result=rapidhalib_waitforresponse(rapidhalocked);

  //Sent startup sync complete as that should be sent after host startup ready
  result=rapidhalib_initwaitforresponse(RAPIDHA_WAITING_FOR_RAPIDHA_UTILITY_STATUS_RESPONSE, rapidhalocked);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to setup a semaphore to wait for a RapidHA response\n", __func__);
    return;
  }
  rapidhalib_send_rapidha_startup_sync_complete(rapidhadevice, rapidhalocked);

  //Wait 1 second for the result
  result=rapidhalib_waitforresponse(rapidhalocked);

  //No longer need reinit if now fully configured
  rapidhalib_lockrapidha();
  if (rapidhadevice->cfgstate==RAPIDHA_CFGSTATE_FULLY_CONFIGURED) {
    rapidhadevice->needreinit=0;
  }
  rapidhalib_unlockrapidha();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Upgrade the firmware on a RapidHA device
//The commands sent here were modeled from the RapidHA Coordinator Desktop program console output
STATIC void rapidhalib_dofirmwareupgrade(rapidhadevice_t *rapidhadevice, long *rapidhalocked, long *zigbeelocked) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  COMMONLIB_IFACEPTR
  MAINLIB_IFACEPTR
  int zigbeelibindex;
  uint64_t addr;
  int result;
  int firmwarefile_fd;
  int firmware_progress, prevfirmware_progress, secscnt, offsetnotprogressing;
  uint32_t prevfirmware_offset, offsetsecscnt;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "%s: A firmware upgrade has been scheduled\n", __func__);

  //First remove the RapidHA from the zigbee library so other operations don't interfer
  rapidhalib_lockrapidha();
  zigbeelibindex=rapidhadevice->zigbeelibindex;
  addr=rapidhadevice->addr;
  rapidhalib_unlockrapidha();
  //Do this outside a lock as it may call back into the rapidha library and multi-library locking has some problems at the moment
  result=zigbeelibifaceptr->remove_localzigbeedevice(zigbeelibindex, rapidhalocked, zigbeelocked);
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: RapidHA %016llX is still in use by the Zigbee library so the firmware upgrade cannot proceed yet\n", __func__, addr);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
    return;
  } else {
    rapidhalib_lockrapidha();
    rapidhadevice->zigbeelibindex=-1;
    rapidhalib_unlockrapidha();
  }

  //Open the firmware file for reading
  rapidhalib_lockrapidha();
  if (rapidhadevice->firmware_file) {
    mainlibifaceptr->newdescriptorlock();
    rapidhadevice->firmwarefile_fd=commonlibifaceptr->open_with_cloexec(rapidhadevice->firmware_file, O_RDONLY);
    mainlibifaceptr->newdescriptorunlock();
  } else {
    rapidhadevice->firmwarefile_fd=-1;
  }
  if (rapidhadevice->firmwarefile_fd<0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s for reading\n", __func__, rapidhadevice->firmware_file);
    rapidhalib_unlockrapidha();
    goto firmwareupgrade_cleanup;
  }
  rapidhadevice->firmware_file_offset=0;
  rapidhadevice->firmware_progress=RAPIDHA_FIRMWARE_UPDATE_PROGRESS_UPDATING;
  rapidhadevice->firmware_retries=0;
  rapidhalib_send_rapidha_bootload_query_next_image_response(rapidhadevice, rapidhadevice->firmwarefile_fd, rapidhalocked);
  rapidhalib_unlockrapidha();

  prevfirmware_progress=firmware_progress=1;
  secscnt=0;
  offsetsecscnt=0;
  prevfirmware_offset=0;
  offsetnotprogressing=0;
  while (firmware_progress>0 && secscnt<RAPIDHA_FIRMWARE_UPDATE_MAX_WAIT_TIME && !rapidhalib_getneedtoquit(rapidhalocked)) {
    //Wait until firmware progress is no longer above 0 or until we've waited too long
    sleep(1);
    rapidhalib_lockrapidha();
    firmware_progress=rapidhadevice->firmware_progress;
    if (offsetsecscnt>=RAPIDHA_FIRMWARE_UPDATE_OFFSET_PROGRESS) {
      //Check every 5 seconds if the upgrade has progressed and if not abort
      offsetsecscnt=0;
      if (rapidhadevice->firmware_file_offset==prevfirmware_offset) {
        rapidhalib_unlockrapidha();
        offsetnotprogressing=1;
        break;
      } else {
        prevfirmware_offset=rapidhadevice->firmware_file_offset;
      }
    }
    rapidhalib_unlockrapidha();
    if (firmware_progress>prevfirmware_progress) {
      //Firmware update has progressed to the next level
      secscnt=0;
      offsetsecscnt=0;
      prevfirmware_progress=firmware_progress;
    }
    ++secscnt;
    ++offsetsecscnt;
  }
  if (offsetnotprogressing) {
    debuglibifaceptr->debuglib_printf(1, "%s: Firmware upgrade aborted due to no progress in %d seconds\n", __func__, RAPIDHA_FIRMWARE_UPDATE_OFFSET_PROGRESS);
  }
  if (secscnt>=RAPIDHA_FIRMWARE_UPDATE_MAX_WAIT_TIME) {
    debuglibifaceptr->debuglib_printf(1, "%s: Firmware upgrade aborted due to taking longer than %d seconds\n", __func__, RAPIDHA_FIRMWARE_UPDATE_MAX_WAIT_TIME);
  }
  if (firmware_progress==0) {
    //The firmware upgrade completed but we should wait a few seconds for the RapidHA to switch to the new firmware
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting a few seconds for the RapidHA to apply the firmware update\n", __func__);
    sleep(5);
  }
  //Cleanup and refresh after the firmware upgrade
firmwareupgrade_cleanup:
  rapidhalib_lockrapidha();
  if (rapidhadevice->firmwarefile_fd!=-1) {
    close(rapidhadevice->firmwarefile_fd);
    rapidhadevice->firmwarefile_fd=-1;
  }
  if (rapidhadevice->firmware_file) {
    free(rapidhadevice->firmware_file);
    rapidhadevice->firmware_file=NULL;
  }
  rapidhalib_unlockrapidha();

  //Redetect info about this RapidHA
  rapidhalib_detect_rapidha(rapidhadevice, 1, rapidhalocked);

  //Schedule to reinitialise this RapidHA
  rapidhalib_lockrapidha();
  rapidhadevice->needreinit=1;
  rapidhalib_unlockrapidha();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Refresh data from rapidha devices
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
STATIC void rapidhalib_refresh_rapidha_data(void) {
  DEBUGLIB_IFACEPTR
  ZIGBEELIB_IFACEPTR
  zigbeelib_localzigbeedevice_ver_1_t localzigbeedevice;
  int i, pos;
  int numrapidhadevices;
  long rapidhalocked=0, zigbeelocked=0;

  //Refresh data from rapidha devices
  MOREDEBUG_ENTERINGFUNC();
  localzigbeedevice.devicetype="RapidHA";
  numrapidhadevices=rapidhalib_getnumrapidhadevices(&rapidhalocked);
  for (i=0; i<numrapidhadevices; i++) {
    int zigbeelibindex;
    rapidhadevice_t *rapidhadeviceptr;
    const char *firmware_file;
    uint8_t needreinit, cfgstate;

    rapidhadeviceptr=&rapidhalib_rapidhadevices[i];
    if (rapidhalib_markrapidha_inuse(rapidhadeviceptr, &rapidhalocked)<0) {
      //Unable to mark this rapidha for use
      continue;
    }
    //Check if a firmware upgrade has been requested
    //Check at the top so easier to run through reinitialisation after the upgrade is complete
    rapidhalib_lockrapidha();
    firmware_file=rapidhadeviceptr->firmware_file;
    rapidhalib_unlockrapidha();
    if (firmware_file) {
      rapidhalib_dofirmwareupgrade(rapidhadeviceptr, &rapidhalocked, &zigbeelocked);
    }
    rapidhalib_lockrapidha();
    firmware_file=rapidhadeviceptr->firmware_file;
    rapidhalib_unlockrapidha();
    if (firmware_file) {
      //If the firmware file is still set, then the firmware upgrade is still pending and we shouldn't
      //  do anything else with this device
      continue;
    }
    //Check if need to reinitialise this RapidHA
    //Sometimes the rapidha loses the config (loss of power, reboot, etc) without watch inputs
    //  seeing a serial dropout so here we also reinit if rapidha isn't fully configured
    //Always refresh all ZigBee devices after reinit as the RapidHA may lose important state information
    //  during reinit
    rapidhalib_lockrapidha();
    zigbeelibindex=rapidhadeviceptr->zigbeelibindex;
    cfgstate=rapidhadeviceptr->cfgstate;
    if (cfgstate!=RAPIDHA_CFGSTATE_FULLY_CONFIGURED) {
      rapidhadeviceptr->needreinit=1;
    }
    needreinit=rapidhadeviceptr->needreinit;
    rapidhalib_unlockrapidha();
    if (needreinit) {
      if (zigbeelibindex>=0 && zigbeelibifaceptr) {
        debuglibifaceptr->debuglib_printf(1, "%s: Removing cached list of ZigBee devices as RapidHA: %016" PRIX64 " needs to be reconfigured\n", __func__, rapidhadeviceptr->addr);
        zigbeelibifaceptr->remove_all_zigbee_devices(zigbeelibindex, &rapidhalocked, &zigbeelocked);
      }
      rapidhalib_doreinit(rapidhadeviceptr, &rapidhalocked, &zigbeelocked);
      rapidhalib_lockrapidha();
      needreinit=rapidhadeviceptr->needreinit;
      rapidhalib_unlockrapidha();
      if (needreinit) {
        //Having problems configuring this RapidHA so go on to other devices
        debuglibifaceptr->debuglib_printf(1, "%s: ERROR: RapidHA: %016" PRIX64 " hasn't reinitialised properly\n", __func__, rapidhadeviceptr->addr);
        rapidhalib_markrapidha_notinuse(rapidhadeviceptr, &rapidhalocked);
        continue;
      }
    }
    rapidhalib_lockrapidha();
    localzigbeedevice.addr=rapidhadeviceptr->addr;
    localzigbeedevice.deviceptr=rapidhadeviceptr;
    if (rapidhadeviceptr->zigbeelibindex<0 && zigbeelibifaceptr) {
      unsigned long long features=0;

      if (rapidhadeviceptr->reportingsupported) {
        features|=ZIGBEE_FEATURE_RECEIVEREPORTPACKETS;
      }
      if (!rapidhadeviceptr->manureportingsupported) {
        features|=ZIGBEE_FEATURE_NORECEIVEMANUREPORTPACKETS;
      }
			rapidhadeviceptr->zigbeelibindex=zigbeelibifaceptr->add_localzigbeedevice(&localzigbeedevice, &rapidhalib_localzigbeedevice_iface_ver_1, features, &rapidhalocked, &zigbeelocked);
    }
    if (rapidhadeviceptr->zigbeelibindex<0) {
      rapidhalib_unlockrapidha();
      rapidhalib_markrapidha_notinuse(rapidhadeviceptr, &rapidhalocked);
      continue;
    }
    if (!rapidhadeviceptr->haendpointregistered && zigbeelibifaceptr) {
      int result;

      //Register the Home Automation endpoint id that we will be using
      result=zigbeelibifaceptr->register_home_automation_endpointid(rapidhadeviceptr->zigbeelibindex, 1, &rapidhalocked, &zigbeelocked);
      if (result==0) {
        rapidhadeviceptr->haendpointregistered=1;
      }
    }
    rapidhalib_unlockrapidha();
    if (rapidhalib_rapidha_connected_to_network(rapidhadeviceptr, &rapidhalocked) && zigbeelibifaceptr) {
      //Check if the connected RapidHA module has been added as a Zigbee device
      pos=zigbeelibifaceptr->find_zigbee_device(rapidhadeviceptr->zigbeelibindex, rapidhadeviceptr->addr, rapidhadeviceptr->netaddr, &rapidhalocked, &zigbeelocked);
      if (pos==-1) {
        if (rapidhadeviceptr->device_type<3) {
          //Non-Sleepy RapidHA Device
          zigbeelibifaceptr->add_zigbee_device(rapidhadeviceptr->zigbeelibindex, rapidhadeviceptr->addr, rapidhadeviceptr->netaddr, rapidhadeviceptr->device_type, 1, &rapidhalocked, &zigbeelocked);
        } else if (rapidhadeviceptr->device_type==3) {
          //Sleepy End Device
          zigbeelibifaceptr->add_zigbee_device(rapidhadeviceptr->zigbeelibindex, rapidhadeviceptr->addr, rapidhadeviceptr->netaddr, ZIGBEE_DEVICE_TYPE_END_DEVICE, 0, &rapidhalocked, &zigbeelocked);
        }
      }
    }
    rapidhalib_markrapidha_notinuse(rapidhadeviceptr, &rapidhalocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Main RapidHA thread loop that manages initialisation, shutdown, and outgoing communication to the rapidha devices
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
STATIC void *rapidhalib_mainloop(void* UNUSED(val)) {
  DEBUGLIB_IFACEPTR
  time_t currenttime;
  struct timespec semwaittime;
  long rapidhalocked=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Loop until this thread is canceled
  while (!rapidhalib_getneedtoquit(&rapidhalocked)) {
    clock_gettime(CLOCK_REALTIME, &semwaittime);
    currenttime=semwaittime.tv_sec;

    rapidhalib_refresh_rapidha_data();

    if (rapidhalib_getneedtoquit(&rapidhalocked)) {
      break;
    }
    //Sleep until the next second
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
#ifdef RAPIDHALIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Sleeping\n", __func__);
#endif
    sem_timedwait(&rapidhalib_mainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static inline void _rapidhalib_setneedtoquit(int val) {
  needtoquit=val;
}

static inline void rapidhalib_setneedtoquit(int val, long *rapidhalocked) {
  rapidhalib_lockrapidha();
  _rapidhalib_setneedtoquit(val);
  rapidhalib_unlockrapidha();
}

static inline int _rapidhalib_getneedtoquit(void) {
  return needtoquit;
}

static inline int rapidhalib_getneedtoquit(long *rapidhalocked) {
  int val;

  rapidhalib_lockrapidha();
  val=_rapidhalib_getneedtoquit();
  rapidhalib_unlockrapidha();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int rapidhalib_start(void) {
  DEBUGLIB_IFACEPTR
  CMDSERVERLIB_IFACEPTR
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  //Start a thread for auto detecting RapidHA modules
  if (rapidhalib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&rapidhalib_mainthread, NULL, rapidhalib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
      result=-1;
    }
  }
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_function("rapidha_firmware_upgrade", "(Experimental) Upgrade the firmware on a RapidHA device", rapidhalib_process_firmware_upgrade_command);
    cmdserverlibifaceptr->cmdserverlib_register_cmd_function("rapidha_cancel_firmware_upgrade", "(Experimental) Cancel an in progress firmware upgrade on a RapidHA device", rapidhalib_process_cancel_firmware_upgrade_command);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
void rapidhalib_stop(void) {
  DEBUGLIB_IFACEPTR

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (rapidhalib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    PTHREAD_LOCK(&rapidhalibmutex);
    _rapidhalib_setneedtoquit(1);
    sem_post(&rapidhalib_mainthreadsleepsem);
    PTHREAD_UNLOCK(&rapidhalibmutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(rapidhalib_mainthread, NULL);
    rapidhalib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int rapidhalib_init(void) {
  DEBUGLIB_IFACEPTR
  SERIALPORTLIB_IFACEPTR
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (rapidhalib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __func__);
    return -1;
  }
  ++rapidhalib_inuse;
  if (rapidhalib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, rapidhalib_inuse);
    return -1;
  }
  //Let the serial port library know that we want to use it
  if (serialportlibifaceptr) {
    serialportlibifaceptr->init();
  }
  //Let the database library know that we want to use it
  needtoquit=0;
  if (sem_init(&rapidhalib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  rapidhalib_numrapidhadevices=0;
  if (!rapidhalib_rapidhadevices) {
    rapidhalib_rapidhadevices=reinterpret_cast<rapidhadevice_t *>(calloc(MAX_RAPIDHA_DEVICES, sizeof(rapidhadevice_t)));
    if (!rapidhalib_rapidhadevices) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for rapidha devices\n", __func__);
      return -3;
    }
    //Clear and initialise the new array elements
    for (i=0; i<MAX_RAPIDHA_DEVICES; i++) {
      rapidhalib_rapidhadevices[i].removed=1;
    }
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&rapidhalibmutex, &errorcheckmutexattr);
  pthread_mutex_init(&rapidhalibmutex_waitforresponse, &errorcheckmutexattr);
  pthread_mutex_init(&rapidhalibmutex_detectingdevice, &errorcheckmutexattr);
  pthread_mutex_init(&rapidhalibmutex_initnewrapidha, &errorcheckmutexattr);
#endif

  _init_rapidhalib_newrapidha();

  //Allocate storage for the new rapidha device send and receive buffers
  if (!rapidhalib_newrapidha.receivebuf) {
    rapidhalib_newrapidha.receivebuf=(unsigned char *) malloc(BUFFER_SIZE*sizeof(unsigned char));
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void rapidhalib_shutdown(void) {
  DEBUGLIB_IFACEPTR
  SERIALPORTLIB_IFACEPTR
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (rapidhalib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --rapidhalib_inuse;
  if (rapidhalib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, rapidhalib_inuse);
    return;
  }
  //Start shutting down library
  rapidhalib_shuttingdown=1;

  //Finished using the serial port library
  if (serialportlibifaceptr) {
    serialportlibifaceptr->shutdown();
  }
  //Finished using the database library
  rapidhalib_shuttingdown=0;

  //Free allocated memory
  if (rapidhalib_rapidhadevices) {
    for (i=0; i<rapidhalib_numrapidhadevices; i++) {
      if (rapidhalib_rapidhadevices[i].firmwarefile_fd!=-1) {
        close(rapidhalib_rapidhadevices[i].firmwarefile_fd);
        rapidhalib_rapidhadevices[i].firmwarefile_fd=-1;
      }
      if (rapidhalib_rapidhadevices[i].firmware_file) {
        free(rapidhalib_rapidhadevices[i].firmware_file);
        rapidhalib_rapidhadevices[i].firmware_file=NULL;
      }
      if (rapidhalib_rapidhadevices[i].receivebuf) {
        free(rapidhalib_rapidhadevices[i].receivebuf);
        rapidhalib_rapidhadevices[i].receivebuf=NULL;
      }
    }
    rapidhalib_numrapidhadevices=0;
    free(rapidhalib_rapidhadevices);
    rapidhalib_rapidhadevices=NULL;
  }
  if (rapidhalib_newrapidha.receivebuf) {
    free(rapidhalib_newrapidha.receivebuf);
    rapidhalib_newrapidha.receivebuf=NULL;
  }
  sem_destroy(&rapidhalib_mainthreadsleepsem);

#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&rapidhalibmutex);
  pthread_mutex_destroy(&rapidhalibmutex_waitforresponse);
  pthread_mutex_destroy(&rapidhalibmutex_detectingdevice);
  pthread_mutex_destroy(&rapidhalibmutex_initnewrapidha);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for rapidha library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void rapidhalib_register_listeners(void) {
  DEBUGLIB_IFACEPTR
  SERIALPORTLIB_IFACEPTR
  CMDSERVERLIB_IFACEPTR

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(rapidhalib_processcommand);
  }
  if (serialportlibifaceptr) {
    serialportlibifaceptr->register_serial_handler(&rapidhalib_devicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for rapidha library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void rapidhalib_unregister_listeners(void) {
  DEBUGLIB_IFACEPTR
  SERIALPORTLIB_IFACEPTR
  CMDSERVERLIB_IFACEPTR

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(rapidhalib_processcommand);
  }
  if (serialportlibifaceptr) {
    serialportlibifaceptr->unregister_serial_handler(&rapidhalib_devicehandler_iface_ver_1);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *rapidhalib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &rapidhalib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_RapidHALib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) rapidhalib_getmoduleinfo();
}
#endif
