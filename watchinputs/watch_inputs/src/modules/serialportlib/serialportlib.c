/*
Title: Serial Port Abstraction Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: A library that provides a high level interface to various low level serial hardware libraries
Copyright: Capsicum Corporation 2014-2016

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

//#define SERIALPORTLIB_LOCKDEBUG
//#define SERIALPORTLIB_MOREDEBUG

//TODO: Implement commandline interface to get info about connected serial ports
//TODO: Cleanup Android globalrefs with DeleteGlobalRef at shutdown.  Note: This must be done via a call from Java as env can't
//  cross to another thread.

//TODO: Find a way to handle errors when writing.  Might need a per device thread lock so can close and reopen the device for the retry.
//  Problems normally only occur if the connection has problems so we should display a message to check the serial/usb cable connection and/or power supply.

//Needed for usleep
#define _BSD_SOURCE

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

//#ifndef SERIALPORTLIB_MOREDEBUG
//#define SERIALPORTLIB_MOREDEBUG
//#endif

#include "config.h"

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <unistd.h>
#include <pthread.h>
#include <semaphore.h>
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "serialportlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"

#ifdef DEBUG
#warning "SERIALPORTLIB_PTHREAD_LOCK and SERIALPORTLIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define SERIALPORTLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    serialportlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    serialportlib_backtrace(); \
  } \
}

#define SERIALPORTLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    serialportlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    serialportlib_backtrace(); \
  } \
}

#else

#define SERIALPORTLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define SERIALPORTLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef SERIALPORTLIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef SERIALPORTLIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef SERIALPORTLIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: The serial buffer needs to be reasonability large as some serial drivers don't function correctly with really small buffers
#define SERBUFSIZE 1024

//NOTE: Use a long retry count as services such as NetworkManager may open the serial port and often take a while to give up
#define SERIAL_OPEN_RETRIES 30 //Maximum number of times to retry opening a serial port (Poll interval is normally once a second)

#define MAX_SERIAL_PORTS 10 //Maximum number of serial ports to allow
#define MAX_SERIALPORT_HANDLERS 10 //Maximum number of serial port handlers to allow

static int32_t baudrates[]={115200, 9600, 19200, 38400, 57600};

typedef struct {
  int serialdevicelib_iface_ver;
  const void *serialdevicelib; //Pointer to serialdevicelib_iface_ver_?_t depending on value of serialdevicelib_iface_ver
  void *serialport;
  int handleridx; //This library's serialhandler index id of high level library handling this device: -1=not being handled
  int handlerdevidx; //The high level library's index to its device attached to this serial port
  pthread_t receivethreadid; //The id of the receive thread for the serial port: 0=No thread running
  int removed; //This serial port has been marked as removed by the serial device library
  int inuse; //This serial port structure is currently in use, set to 0 when available for reuse
} serialport_t;

typedef struct {
  int serialdevicehandler_iface_ver;
  const void *serialdevicehandler; //Pointer to serialdevicehandler_iface_ver_?_t depending on value of serialdevicehandler_iface_ver
} serialdevicehandler_t;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t serialportlibmutex;
#else
static pthread_mutex_t serialportlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int serialportlib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when serialportlib should exit
static pthread_t serialportlib_mainthread=0;
static sem_t serialportlib_mainthreadsleepsem; //Used for main thread sleeping

static int serialportlib_smallsleep=0; //Set to a positive value when we want a small sleep interval instead of the normal long one and don't want to use sem_post for instant wakeup

#ifdef __ANDROID__
static JavaVM *serialportlib_gJavaVM;
static JNIEnv *serialportlib_mainthread_jnienv;
#endif

//serial devices lists
static int serialportlib_numserialports=0;
static serialport_t *serialportlib_serialports; //A list of detected serial ports

//Serial Handler lists
static int serialportlib_numhandlers=0;
static serialdevicehandler_t *serialportlib_handlers; //The list of serial handlers functions used to check if the handler supports a serial device

//Function Declarations
static void serialportlib_setneedtoquit(int val);
static int serialportlib_getneedtoquit();
static int serialportlib_serialsend(int serdevidx, const void *buf, size_t count);
static const char *serialportlib_get_unique_id(int serdevidx);
static int serialportlib_serial_port_add(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport);
static int serialportlib_serial_port_remove(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport);
int serialportlib_start(void);
void serialportlib_stop(void);
int serialportlib_init(void);
void serialportlib_shutdown(void);
static int serialportlib_register_serial_handler(serialdevicehandler_iface_ver_1_t *serialdevicehandler);
static int serialportlib_unregister_serial_handler(serialdevicehandler_iface_ver_1_t *serialdevicehandler);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0

static serialportlib_ifaceptrs_ver_1_t serialportlib_ifaceptrs_ver_1={
  serialportlib_init,
  serialportlib_shutdown,
  serialportlib_serial_port_add,
  serialportlib_serial_port_remove,
  serialportlib_serialsend,
  serialportlib_get_unique_id,
  serialportlib_register_serial_handler,
  serialportlib_unregister_serial_handler
};

static moduleiface_ver_1_t serialportlib_ifaces[]={
  {
    &serialportlib_ifaceptrs_ver_1,
    SERIALPORTLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduledep_ver_1_t serialportlib_deps[]={
  {
    "debuglib",
    NULL,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    NULL, NULL, 0, 0
  }
};

static moduleinfo_ver_1_t serialportlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "serialportlib",
  serialportlib_init,
  serialportlib_shutdown,
  serialportlib_start,
  serialportlib_stop,
  NULL,
  NULL,
  &serialportlib_ifaces,
  &serialportlib_deps
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void serialportlib_backtrace(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
static void serialportlib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey=0;

//Initialise a thread local store for the lock counter
static void serialportlib_makelockkey() {
	int result;

  result=pthread_key_create(&lockkey, NULL);
	if (result!=0) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
	} else {
		havelockkey=1;
	}
}

/*
  Apply the serialport mutex lock if not already applied otherwise increment the lock count
*/
static void serialportlib_lockserialport() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, serialportlib_makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
    SERIALPORTLIB_PTHREAD_LOCK(&serialportlibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef SERIALPORTLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the serialport mutex lock
*/
static void serialportlib_unlockserialport() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, serialportlib_makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
		debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
		return;
	}
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    serialportlib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    SERIALPORTLIB_PTHREAD_UNLOCK(&serialportlibmutex);
  }
#ifdef SERIALPORTLIB_LOCKDEBUG
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
  Thread safe get the number of serial ports
*/
static int serialportlib_getnumserialports(void) {
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  int val;

#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  serialportlib_lockserialport();
  val=serialportlib_numserialports;
  serialportlib_unlockserialport();

  return val;
}

//Thread safe get inuse value of a serial device
static int serialportlib_get_inuse(int i) {
	int val;

  serialportlib_lockserialport();
	val=serialportlib_serialports[i].inuse;
  serialportlib_unlockserialport();

	return val;
}

//Thread safe get removed value of a serial device
static int serialportlib_get_removed(int i) {
	int val;

  serialportlib_lockserialport();
	val=serialportlib_serialports[i].removed;
  serialportlib_unlockserialport();

	return val;
}

/*
  Thread safe set the number of serial ports
*/
static void serialportlib_setnumserialports(int numserialports) {
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  serialportlib_lockserialport();
  serialportlib_numserialports=numserialports;
  serialportlib_unlockserialport();
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

/*
  serial thread loop that reads from the serial port and processes all incoming data
  NOTE: Most of this code doesn't need locking since the main thread only changes the variables during device detection
*/
static void *serialportlib_serialreadingloop(void *val) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  char *serbuf;
  int serportidx, serbufcnt, handleridx, handlerdevidx;
  int result, removed;
	int noreceivecnt; //Increments every time we loop without receiving any data
	struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  serportidx=(unsigned int) ((unsigned long) val);

	serbuf=(char *) malloc(SERBUFSIZE*sizeof(char));
	if (serbuf==NULL) {
		debuglibifaceptr->debuglib_printf(1, "%s: Failed to allocate 1024 bytes of ram for serial buffer\n", __func__);
		return (void *) 1;
	}
  debuglibifaceptr->debuglib_printf(1, "%s: Ready to receive data for serial port at index: %d\n", __func__, serportidx);
	clock_gettime(CLOCK_REALTIME, &waittime);
	++waittime.tv_sec;
	noreceivecnt=0;
  while (!serialportlib_getneedtoquit()) {
		struct timespec curtime;

    serialportlib_lockserialport();
    removed=serialportlib_serialports[serportidx].removed;
    serialportlib_unlockserialport();
    if (removed) {
      break;
    }
		clock_gettime(CLOCK_REALTIME, &curtime);
		if (curtime.tv_sec<waittime.tv_sec) {
			if (noreceivecnt>=5) {
				//If we loop through 5 times without receiving any data in under a second, sleep for 100 milliseconds and then reset the count
				//NOTE: We don't want to sleep too long as a burst of data could arrive
				//debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: looped 5 times without receiving data, sleeping for 1 second\n", __func__);
				usleep(100000);
				clock_gettime(CLOCK_REALTIME, &waittime);
				++waittime.tv_sec;
				noreceivecnt=0;
			}
		} else {
			//Reset count
			clock_gettime(CLOCK_REALTIME, &waittime);
			++waittime.tv_sec;
			noreceivecnt=0;
		}
    result=-1;
    if (serialportlib_serialports[serportidx].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
      const serialdevicelib_iface_ver_1_t *serialdevicelib;
      void *serialport;

      serialdevicelib=serialportlib_serialports[serportidx].serialdevicelib;
      serialport=serialportlib_serialports[serportidx].serialport;

      if (serialdevicelib->serial_port_wait_ready_to_receive) {
        result=serialdevicelib->serial_port_wait_ready_to_receive(serialport);
        if (result==0) {
					++noreceivecnt;
          continue;
        }
      } else if (serialdevicelib->serial_port_get_ready_to_receive) {
        result=serialdevicelib->serial_port_get_ready_to_receive(serialport);
        if (result==0) {
          usleep(20000);
					++noreceivecnt;
          continue;
        }
      } else {
        //Can't check if data is ready before reading so just skip straight to reading
        result=0;
      }
      if (result==-1) {
        //An error occurred so abort
        debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port\n", __func__);
        break;
      }
      serbufcnt=serialdevicelib->serial_port_receive_data(serialport, serbuf, SERBUFSIZE);
      if (serbufcnt<1) {
        if (serbufcnt==0) {
          //Serial port might be removed but we should wait until the native library detects that properly
					if (serialdevicelib->serial_port_get_ready_to_receive) {
						//Only display that we failed to read if we were able to check beforehand
						debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port\n", __func__);
					}
					++noreceivecnt;
          continue;
        } else {
          //There was an error reading from the serial port so abort
          debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port\n", __func__);
          break;
        }
      }
			clock_gettime(CLOCK_REALTIME, &waittime);
			++waittime.tv_sec;
			noreceivecnt=0;
#ifdef SERIALPORTLIB_MOREDEBUG
      debuglibifaceptr->debuglib_printf(1, "%s: Received serial data: Length=%d\n\n", __func__, serbufcnt);
#endif
      //These are modified during serial device detection so make local copies around a thread lock
      serialportlib_lockserialport();
      handleridx=serialportlib_serialports[serportidx].handleridx;
      handlerdevidx=serialportlib_serialports[serportidx].handlerdevidx;
      serialportlib_unlockserialport();

      if (handleridx!=-1) {
        //There is a handler assigned to this serial device
        if (serialportlib_handlers[handleridx].serialdevicehandler_iface_ver==SERIALDEVICEHANDLERINTERFACE_VER_1) {
          const serialdevicehandler_iface_ver_1_t *serialdevicehandler=serialportlib_handlers[handleridx].serialdevicehandler;

          serialdevicehandler->receiveFuncptr(serportidx, handlerdevidx, serbuf, serbufcnt);
        }
      }
    }
  }
  free(serbuf);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

/*
  Send data to the serial port
  Returns >= 0 on success or negative value on error (-1 is from write)
  NOTE: Most of this code doesn't need locking since the main thread won't change any of its main variables until
    any threads using this function exit or they are canceled
*/
static int serialportlib_serialsend(int serdevidx, const void *buf, size_t count) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	int result;

#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  if (serdevidx<0 || serdevidx>=serialportlib_getnumserialports()) {
    //Invalid index
    return -2;
  }
  serialportlib_lockserialport();
  if (serialportlib_serialports[serdevidx].removed || !serialportlib_serialports[serdevidx].inuse) {
    //serial port not open
    serialportlib_unlockserialport();
    return -3;
  }
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Sending serial buffer: length=%d\n\n", __func__, count);
#endif
  result=-1;
  if (serialportlib_serialports[serdevidx].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
    const serialdevicelib_iface_ver_1_t *serialdevicelib=serialportlib_serialports[serdevidx].serialdevicelib;
    void *serialport=serialportlib_serialports[serdevidx].serialport;

    result=serialdevicelib->serial_port_send(serialport, buf, count);

    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Problem writing to serial port: %s, errno: %d\n", __func__, serialdevicelib->serial_port_get_unique_id(serialport));
    }
  }
  serialportlib_unlockserialport();
#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
	return result;
}

/*
  Get the unique id string of a serial port
  Returns the unique id or "Unknown" on error
*/
static const char *serialportlib_get_unique_id(int serdevidx) {
  const char *uniqueid=NULL;

  if (serdevidx<0 || serdevidx>=serialportlib_getnumserialports()) {
    //Invalid index
    return "Unknown";
  }
  serialportlib_lockserialport();
  if (serialportlib_serialports[serdevidx].removed || !serialportlib_serialports[serdevidx].inuse) {
    //serial port not open
    serialportlib_unlockserialport();
    return "Unknown";
  }
  if (serialportlib_serialports[serdevidx].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
    const serialdevicelib_iface_ver_1_t *serialdevicelib=serialportlib_serialports[serdevidx].serialdevicelib;

    uniqueid=serialdevicelib->serial_port_get_unique_id(serialportlib_serialports[serdevidx].serialport);
  }
  serialportlib_unlockserialport();

  return uniqueid;
}

/*
  Add a serial port to the list if not already added
  Args: serialdevicelib is a pointer to a structure with functions that this library can call to interface with the serial port
        serialport is a pointer to a private structure that contains info about the open serial port
  Returns: 1 on success or negative value on error
*/
static int serialportlib_serial_port_add(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialport_t *tmpptr;
  int i, result;

#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif

  //Check if we are quitting
  if (serialportlib_getneedtoquit()) {
    return -10;
  }
  //First check if the device has already been added
  serialportlib_lockserialport();
  for (i=0; i<serialportlib_numserialports; i++) {
    if (serialportlib_serialports[i].serialdevicelib==serialdevicelib && serialportlib_serialports[i].serialport==serialport) {
      serialportlib_unlockserialport();
      debuglibifaceptr->debuglib_printf(1, "BUG: Exiting %s: %s is already added\n", __func__, serialdevicelib->serial_port_get_unique_id(serialport));
      return -1;
    }
  }
  //Find an empty slot
  for (i=0; i<MAX_SERIAL_PORTS; i++) {
    if (!serialportlib_serialports[i].inuse) {
      break;
    }
  }
  if (i==MAX_SERIAL_PORTS) {
    serialportlib_unlockserialport();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d serial ports has been reached\n", __func__, MAX_SERIAL_PORTS);

    return -2;
  }
  //Add the serial port info to the array
  serialportlib_serialports[i].serialdevicelib_iface_ver=SERIALDEVICELIBINTERFACE_VER_1;
  serialportlib_serialports[i].serialdevicelib=serialdevicelib;
  serialportlib_serialports[i].serialport=serialport;
  serialportlib_serialports[i].handleridx=-1; //Initialise handler index to -1
  serialportlib_serialports[i].handlerdevidx=-1; //Initialise the handlers's dev index to -1
  serialportlib_serialports[i].removed=0;
  serialportlib_serialports[i].inuse=1;

  debuglibifaceptr->debuglib_printf(1, "%s: Starting the receive thread for serial port: %s at index: %d\n", __func__, serialdevicelib->serial_port_get_unique_id(serialport), i);
  result=pthread_create(&serialportlib_serialports[i].receivethreadid, NULL, serialportlib_serialreadingloop, (void *) ((unsigned long) i));
  if (result!=0) {
    //TODO: Move this code to a remove device function
    serialportlib_serialports[i].inuse=0;
    serialportlib_unlockserialport();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to spawn receive thread for serial port: %s\n", __func__, serialdevicelib->serial_port_get_unique_id(serialport));
    return -3;
  }
  if (i==serialportlib_numserialports) {
    ++serialportlib_numserialports;
  }
  serialportlib_unlockserialport();

  debuglibifaceptr->debuglib_printf(1, "%s: Successfully added serial port: %s at index: %d\n", __func__, serialdevicelib->serial_port_get_unique_id(serialport), i);

  //serialportlib_setneedmoreinfo(1); //A new serial port has been added so it will need a handler added
  sem_post(&serialportlib_mainthreadsleepsem);

#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return 1;
}

/*
  Removed a serial port from the list if not already removed
  Args: serialdevicelib is a pointer to a structure with functions that this library can call to interface with the serial port
        serialport is a pointer to a private structure that contains info about the open serial port
  Returns: 1 on success or negative value on error
*/
static int serialportlib_serial_port_remove(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i, result;

//#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
//#endif

  //Check if we are quitting
  if (serialportlib_getneedtoquit()) {
    return -10;
  }
  //Check if the serial port has been added
  serialportlib_lockserialport();
  for (i=0; i<serialportlib_numserialports; i++) {
    if (serialportlib_serialports[i].serialdevicelib==serialdevicelib && serialportlib_serialports[i].serialport==serialport) {
      //Mark the serial port as removed but don't change inuse as the main thread in this library might still be using the structure
			debuglibifaceptr->debuglib_printf(1, "%s: Marking serial port: %d as removed\n", __func__, i);
      serialportlib_serialports[i].removed=1;
      break;
    }
  }
  if (i==serialportlib_numserialports) {
		debuglibifaceptr->debuglib_printf(1, "%s: Failed to find serial port\n", __func__);
    result=-1; //Failed to find the requested serial port
  } else {
    result=1;
  }
  serialportlib_unlockserialport();

  //Wakeup main thread so the serial port structure gets cleaned up
  sem_post(&serialportlib_mainthreadsleepsem);

//#ifdef SERIALPORTLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
//#endif
  return result;
}

/*
  Check if added serial devices are supported by any registered serial handlers
  You should disable the ability to cancel the thread while calling this function
*/
static void serialportlib_checkifdevicessupported(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int baudidx, i=0, j, result, handlercnt=0;
	int numserialports;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	serialportlib_lockserialport();
	numserialports=serialportlib_numserialports;
	serialportlib_unlockserialport();
  for (i=0; i<numserialports && !serialportlib_getneedtoquit(); i++) {
    if (!serialportlib_get_inuse(i)) {
      //Increase the handler count for empty slots or devices marked for removal
      ++handlercnt;
      continue;
    }
    if (serialportlib_serialports[i].handleridx==-1) {
      for (baudidx=0; baudidx<(int) (sizeof(baudrates)/sizeof(int32_t)) && !serialportlib_getneedtoquit(); baudidx++) {
				if (serialportlib_get_removed(i)) {
					break;
				}
				//Make this section atomic
				serialportlib_lockserialport();

				//Not being handled yet
        if (serialportlib_serialports[i].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
          const serialdevicelib_iface_ver_1_t *serialdevicelib=serialportlib_serialports[i].serialdevicelib;
          void *serialport=serialportlib_serialports[i].serialport;

          if (serialdevicelib->serial_port_reset) {
            serialdevicelib->serial_port_reset(serialport);
          }
          if (serialdevicelib->serial_port_set_baud_rate) {
            serialdevicelib->serial_port_set_baud_rate(serialport, baudrates[baudidx]);
          }
        }
				serialportlib_unlockserialport();

        sleep(2); //Wait for serial port to reconfigure and for device to reset
        for (j=0; j<serialportlib_numhandlers && !serialportlib_getneedtoquit(); j++) {
					if (serialportlib_get_removed(i)) {
						break;
					}
					//Make this section mostly atomic
					serialportlib_lockserialport();

					//Temporarily set the handler index to the handler we're currently checking
          serialportlib_serialports[i].handleridx=j;

          result=-1;
          if (serialportlib_handlers[j].serialdevicehandler_iface_ver==SERIALDEVICEHANDLERINTERFACE_VER_1) {
            const serialdevicehandler_iface_ver_1_t *serialdevicehandler=serialportlib_handlers[j].serialdevicehandler;

            //Unlock so can receive data
            serialportlib_unlockserialport();
            result=serialdevicehandler->isDeviceSupportedptr(i, serialportlib_serialsend);
            serialportlib_lockserialport();
          }
          if (result==-1) {
            //The handler doesn't support this device so change handleridx back to -1
            serialportlib_serialports[i].handleridx=-1;
          } else {
            //The device is supported
            serialportlib_serialports[i].handlerdevidx=result;
            ++handlercnt;
						serialportlib_unlockserialport();
            break;
          }
					serialportlib_unlockserialport();
        }
        if (serialportlib_serialports[i].handleridx!=-1) {
          //Break out of baud rate changing loop as we now have a handler
          break;
        }
      }
    } else {
      ++handlercnt;
    }
  }
  if (handlercnt==i) {
    //All serial devices have a handler
    debuglibifaceptr->debuglib_printf(1, "%s: No more serial info needed\n", __func__);
  } else {
    //Keep the main thread awake until all devices have a handler
    sem_post(&serialportlib_mainthreadsleepsem);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Stop using any serial ports that have been removed
static void serialportlib_cleanupremovedserialports(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i, numserialports, aportinuse=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	serialportlib_lockserialport();
	numserialports=serialportlib_numserialports;
	serialportlib_unlockserialport();
  for (i=0; i<numserialports; i++) {
		int removed, inuse;

    serialportlib_lockserialport();
		removed=serialportlib_serialports[i].removed;
		inuse=serialportlib_serialports[i].inuse;
    serialportlib_unlockserialport();
    if (removed && inuse) {
      int handleridx=serialportlib_serialports[i].handleridx;
      int call_to_handler_remove_success=-1;

      ++aportinuse;
      if (handleridx!=-1) {
        if (serialportlib_handlers[handleridx].serialdevicehandler_iface_ver==SERIALDEVICEHANDLERINTERFACE_VER_1) {
          const serialdevicehandler_iface_ver_1_t *serialdevicehandler=serialportlib_handlers[handleridx].serialdevicehandler;

          //Notify the device handler that the serial port has been removed
          if (serialdevicehandler->serial_device_removed) {
            call_to_handler_remove_success=serialdevicehandler->serial_device_removed(i);
          }
        }
      } else {
        //Treat as success if no handler is defined so we stop using this serial port
        call_to_handler_remove_success=1;
      }
      if (serialportlib_serialports[i].receivethreadid!=0 && call_to_handler_remove_success==1) {
        debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the serial thread at index: %d\n", __func__, i);

        //Here we rely on the main thread having set quit
        debuglibifaceptr->debuglib_printf(1, "%s: Waiting for serial thread at index: %d to exit\n", __func__, i);
        pthread_join(serialportlib_serialports[i].receivethreadid, NULL);
        debuglibifaceptr->debuglib_printf(1, "%s: Serial thread at index: %d has exited\n", __func__, i);
        serialportlib_lockserialport();
        serialportlib_serialports[i].receivethreadid=0;
        serialportlib_unlockserialport();
      }
      if (call_to_handler_remove_success==1 || call_to_handler_remove_success<0) {
        //If the handler is active, we can only disable inuse if the handler has a remove function
        //  and its remove function didn't fail

        //Notify the serial device library that we are no longer using the port
        if (serialportlib_serialports[i].serialdevicelib) {
          if (serialportlib_serialports[i].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
            const serialdevicelib_iface_ver_1_t *serialdevicelib=serialportlib_serialports[i].serialdevicelib;

            if (serialdevicelib->serial_port_no_longer_using) {
              serialdevicelib->serial_port_no_longer_using(serialportlib_serialports[i].serialport);
            }
          }
        }
        serialportlib_lockserialport();
        serialportlib_serialports[i].serialdevicelib=NULL;
        serialportlib_serialports[i].serialport=NULL;
        serialportlib_serialports[i].inuse=0;

        //If this is the highest inuse entry we can reduce the value of numserialports
        if (i+1==numserialports) {
          --numserialports;
        }
        serialportlib_unlockserialport();
        debuglibifaceptr->debuglib_printf(1, "%s: Serial port at index: %d has been removed\n", __func__, i);
      } else {
        serialportlib_lockserialport();
        ++serialportlib_smallsleep;
        serialportlib_unlockserialport();
      }
    }
  }
  if (!aportinuse) {
    //If there are no serial ports in use then we don't need more info
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Main serial thread loop that manages initialisation, shutdown, and connections to the serial port
*/
static void *serialportlib_mainloop(void *UNUSED(val)) {
#ifdef __ANDROID__
  JNIEnv *env;
  int result, wasdetached=0;
#endif
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

#ifdef __ANDROID__
  result=(*serialportlib_gJavaVM)->GetEnv(serialportlib_gJavaVM, (void * *) &env, JNI_VERSION_1_6);
  if (result==JNI_EDETACHED) {
    wasdetached=1;
    result=(*serialportlib_gJavaVM)->AttachCurrentThread(serialportlib_gJavaVM, &env, NULL);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Unable to attach android thread\n", __func__);
      return (void *) 0;
    }
  } else if (result!=JNI_OK) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Unable to get android environment\n", __func__);
    return (void *) 0;
  }
#endif
  while (!serialportlib_getneedtoquit()) {
    int smallsleep;

    //Check if added serial devices are supported by any serial handlers
    serialportlib_checkifdevicessupported();
    serialportlib_cleanupremovedserialports();

    clock_gettime(CLOCK_REALTIME, &waittime);
    serialportlib_lockserialport();
    smallsleep=serialportlib_smallsleep;
    if (smallsleep) {
      --serialportlib_smallsleep;
      waittime.tv_sec+=2;
    } else {
      waittime.tv_sec+=120;
    }
    serialportlib_unlockserialport();
    sem_timedwait(&serialportlib_mainthreadsleepsem, &waittime);
  }
#ifdef __ANDROID__
  if (wasdetached) {
    (*serialportlib_gJavaVM)->DetachCurrentThread(serialportlib_gJavaVM);
  }
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static void serialportlib_setneedtoquit(int val) {
  serialportlib_lockserialport();
  needtoquit=val;
  serialportlib_unlockserialport();
}

static int serialportlib_getneedtoquit() {
  int val;

  serialportlib_lockserialport();
  val=needtoquit;
  serialportlib_unlockserialport();

  return val;
}

int serialportlib_start(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  serialportlib_lockserialport();
  if (serialportlib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&serialportlib_mainthread, NULL, serialportlib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
    }
  }
  serialportlib_unlockserialport();
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

void serialportlib_stop(void) {
  int i;

  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  serialportlib_lockserialport();
  if (serialportlib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    serialportlib_setneedtoquit(1);
    sem_post(&serialportlib_mainthreadsleepsem);
    serialportlib_unlockserialport();
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(serialportlib_mainthread, NULL);
    serialportlib_lockserialport();
    serialportlib_mainthread=0;
  }
  //Stop serial receive threads
  if (serialportlib_serialports) {
    for (i=0; i<serialportlib_numserialports; i++) {
      if (!serialportlib_serialports[i].inuse) {
        continue;
      }
      if (serialportlib_serialports[i].receivethreadid!=0) {
        debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the serial thread at index: %d\n", __func__, i);

        //Here we rely on the main thread having set quit
        serialportlib_unlockserialport();
        debuglibifaceptr->debuglib_printf(1, "%s: Waiting for serial thread at index: %d to exit\n", __func__, i);
        pthread_join(serialportlib_serialports[i].receivethreadid, NULL);
        serialportlib_lockserialport();
        serialportlib_serialports[i].receivethreadid=0;
      }
      //Notify the serial device library that we are no longer using the port
      if (serialportlib_serialports[i].inuse && serialportlib_serialports[i].serialdevicelib) {
        if (serialportlib_serialports[i].serialdevicelib_iface_ver==SERIALDEVICELIBINTERFACE_VER_1) {
          const serialdevicelib_iface_ver_1_t *serialdevicelib=serialportlib_serialports[i].serialdevicelib;

          if (serialdevicelib->serial_port_no_longer_using) {
            serialdevicelib->serial_port_no_longer_using(serialportlib_serialports[i].serialport);
          }
        }
        serialportlib_serialports[i].inuse=0;
      }
    }
    free(serialportlib_serialports);
    serialportlib_serialports=NULL;
    serialportlib_numserialports=0;
  }
  serialportlib_unlockserialport();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int serialportlib_init(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	++serialportlib_inuse;
	if (serialportlib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, serialportlib_inuse);
		return -1;
  }
  needtoquit=0;
  if (sem_init(&serialportlib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  serialportlib_smallsleep=0;

  serialportlib_numserialports=0;
  if (!serialportlib_serialports) {
    serialportlib_serialports=calloc(MAX_SERIAL_PORTS, sizeof(serialport_t));
    if (!serialportlib_serialports) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial ports\n", __func__);
      return -3;
    }
  }
  serialportlib_numhandlers=0;
  if (!serialportlib_handlers) {
    serialportlib_handlers=calloc(MAX_SERIALPORT_HANDLERS, sizeof(serialdevicehandler_t));
    if (!serialportlib_handlers) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial port handlers\n", __func__);
      return -3;
    }
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&serialportlibmutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

	return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void serialportlib_shutdown(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (serialportlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
	--serialportlib_inuse;
	if (serialportlib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, serialportlib_inuse);
		return;
	}
  //No longer in use
  if (serialportlib_serialports) {
    free(serialportlib_serialports);
    serialportlib_serialports=NULL;
    serialportlib_numserialports=0;
  }
  if (serialportlib_handlers) {
    free(serialportlib_handlers);
    serialportlib_handlers=NULL;
    serialportlib_numhandlers=0;
  }
  sem_destroy(&serialportlib_mainthreadsleepsem);
#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&serialportlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register a serial handler
  Input: modulename: The module name of the serial handler
         isDeviceSupportedptr: A pointer to the isDeviceSupported function
         receiveFuncptr: A pointer to the receiveFunc function
  Returns: 0 if success non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int serialportlib_register_serial_handler(serialdevicehandler_iface_ver_1_t *serialdevicehandler) {
  int i;
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=serialportlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  if (serialportlib_inuse==0) {
    //Not initialised yet
    return -1;
  }
  //Find an empty slot
  for (i=0; i<MAX_SERIALPORT_HANDLERS; i++) {
    if (!serialportlib_handlers[i].serialdevicehandler) {
      break;
    }
  }
  if (i==MAX_SERIALPORT_HANDLERS) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d serial port handlers has been reached\n", __func__, MAX_SERIALPORT_HANDLERS);

    return -1;
  }
  serialportlib_handlers[i].serialdevicehandler_iface_ver=SERIALDEVICEHANDLERINTERFACE_VER_1;
  serialportlib_handlers[i].serialdevicehandler=serialdevicehandler;

  debuglibifaceptr->debuglib_printf(1, "%s: Module: %s has been registered as serial port handler: %d\n", __func__, serialdevicehandler->modulename, i);

  if (i==serialportlib_numhandlers) {
    ++serialportlib_numhandlers;
  }
  return 0;
}

/*
  Unregister a serial handler
  Input: isDeviceSupportedptr A pointer to the isDeviceSupported function
  Returns: 0 if success or non-zero on error
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static int serialportlib_unregister_serial_handler(serialdevicehandler_iface_ver_1_t *serialdevicehandler) {
  int i;

  if (serialportlib_inuse==0) {
    return -1;
  }
  for (i=0; i<serialportlib_numhandlers; i++) {
    if (serialportlib_handlers[i].serialdevicehandler==serialdevicehandler) {
      break;
    }
  }
  if (i==serialportlib_numhandlers) {
    return -2;
  }
  serialportlib_handlers[i].serialdevicehandler=NULL;

  //If this is the highest inuse entry we can reduce the value of serialportlib_numhandlers
  if (i+1<serialportlib_numhandlers) {
    --serialportlib_numhandlers;
  }
  return 0;
}

moduleinfo_ver_generic_t *serialportlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &serialportlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_SerialPortLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) serialportlib_getmoduleinfo();
}

jint JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv *env;
  serialportlib_gJavaVM=vm;
  jclass aclass;

  (*serialportlib_gJavaVM)->GetEnv(serialportlib_gJavaVM, (void * *) &env, JNI_VERSION_1_6);
  aclass=(*env)->FindClass(env, "com/capsicumcorp/iomy/libraries/watchinputs/SerialPortLib");

  return JNI_VERSION_1_6; 
}

#endif
