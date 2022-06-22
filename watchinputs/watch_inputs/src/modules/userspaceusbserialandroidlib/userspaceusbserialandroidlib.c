/*
Title: User Space USB Serial for Android Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for providing communication with usb serial devices via the usb-serial-for-android user space library
Copyright: Capsicum Corporation 2015-2016

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

//NOTE: _GNU_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _GNU_SOURCE

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

#include "android_config.h"

#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <semaphore.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "userspaceusbserialandroidlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/serialportlib/serialportlib.h"

#ifdef DEBUG
#warning "USERSPACEUSBSERIALANDROIDLIB_PTHREAD_LOCK and USERSPACEUSBSERIALANDROIDLIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define USERSPACEUSBSERIALANDROIDLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    userspaceusbserialandroidlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    userspaceusbserialandroidlib_backtrace(); \
  } \
}

#define USERSPACEUSBSERIALANDROIDLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    userspaceusbserialandroidlib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    userspaceusbserialandroidlib_backtrace(); \
  } \
}

#else

#define USERSPACEUSBSERIALANDROIDLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define USERSPACEUSBSERIALANDROIDLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef USERSPACEUSBSERIALANDROIDLIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
  #define LOCKDEBUG_EXITINGFUNC() { }
  #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#define SERBUFSIZE 20

//NOTE: Use a long retry count as services such as NetworkManager may open the serial port and often take a while to give up
#define SERIAL_OPEN_RETRIES 30 //Maximum number of times to retry opening a serial port (Poll interval is normally once a second)

#define MAX_SERIAL_PORTS 10 //Maximum number of user space usb serial ports to allow

static int32_t baudrates[]={9600, 115200, 19200, 38400, 57600};

typedef struct {
  int isopen;
  char *filename; //The full path filename of the serial device
  char *uniqueid; //A unique id for this serial device
  int32_t baudrate; //The currently configured baud rate of the serial port
  int needtoclose; //The serial port has been scheduled for closing
  int removed; //This serial port has been removed from the system
  int inuse; //This serial port structure is currently in use, set to 0 when available for reuse
} usbserialdevice_t;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t userspaceusbserialandroidlibmutex;
#else
static pthread_mutex_t userspaceusbserialandroidlibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int userspaceusbserialandroidlib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when nativeseriallib should exit
static pthread_t userspaceusbserialandroidlib_mainthread=0;
static sem_t userspaceusbserialandroidlib_mainthreadsleepsem; //Used for main thread sleeping

static int userspaceusbserialandroidlib_needmoreinfo=0; //Set to 1 when a serial port needs more info to indicate that we shouldn't sleep for very long
static int userspaceusbserialandroidlib_retryserial=0; //Set > 0 when a serial port couldn't be opened but might be available for opening soon so we shouldn't sleep for very long

#ifdef __ANDROID__
static JavaVM *userspaceusbserialandroidlib_gJavaVM;
static jclass userspaceusbserialandroidlib_userspaceusbserialandroid_class;
#endif

//serial devices lists
static int userspaceusbserialandroidlib_numserialdevices=0;
static usbserialdevice_t *userspaceusbserialandroidlib_serialdevices; //A list of detected serial devices

//serialdevicelib_iface functions
static const char *userspaceusbserialandroidlib_serial_port_get_module_name(void *serialport);
static const char *userspaceusbserialandroidlib_serial_port_get_unique_id(void *serialport);
static int userspaceusbserialandroidlib_serial_port_get_baud_rate(void *serialport);
static int userspaceusbserialandroidlib_serial_port_set_baud_rate(void *serialport, int32_t baudrate);
static int userspaceusbserialandroidlib_serial_port_receive_data(void *serialport, char *serbuf, int count);
static int userspaceusbserialandroidlib_serial_port_send(void *serialport, const void *buf, size_t count);

//Function Declarations
static void userspaceusbserialandroidlib_refreshserialdevicelist(void);
static void userspaceusbserialandroidlib_checkserialdeviceremoved(int index);
static void userspaceusbserialandroidlib_setneedtoquit(int val);
static int userspaceusbserialandroidlib_getneedtoquit(void);
int userspaceusbserialandroidlib_start(void);
void userspaceusbserialandroidlib_stop(void);
int userspaceusbserialandroidlib_init(void);
void userspaceusbserialandroidlib_shutdown(void);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define SERIALPORTLIB_DEPIDX 1

static userspaceusbserialandroidlib_ifaceptrs_ver_1_t userspaceusbserialandroidlib_ifaceptrs_ver_1={
  .userspaceusbserialandroidlib_init=userspaceusbserialandroidlib_init,
  .userspaceusbserialandroidlib_shutdown=userspaceusbserialandroidlib_shutdown,
};

static moduleiface_ver_1_t userspaceusbserialandroidlib_ifaces[]={
  {
    .ifaceptr=&userspaceusbserialandroidlib_ifaceptrs_ver_1,
    .ifacever=USERSPACEUSBSERIALANDROIDLIBINTERFACE_VER_1
  },
  {
    .ifaceptr=NULL,
  }
};

static moduledep_ver_1_t userspaceusbserialandroidlib_deps[]={
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
    .modulename=NULL
  }
};

static moduleinfo_ver_1_t userspaceusbserialandroidlib_moduleinfo_ver_1={
  .moduleinfover=MODULEINFO_VER_1,
  .modulename="userspaceusbserialandroidlib",
  .initfunc=userspaceusbserialandroidlib_init,
  .shutdownfunc=userspaceusbserialandroidlib_shutdown,
  .startfunc=userspaceusbserialandroidlib_start,
  .stopfunc=userspaceusbserialandroidlib_stop,
  .moduleifaces=&userspaceusbserialandroidlib_ifaces,
  .moduledeps=&userspaceusbserialandroidlib_deps
};

static serialdevicelib_iface_ver_1_t userspaceusbserialandroidlib_device_iface_ver_1={
  .serial_port_get_module_name=userspaceusbserialandroidlib_serial_port_get_module_name,
  .serial_port_get_unique_id=userspaceusbserialandroidlib_serial_port_get_unique_id,
  .serial_port_get_baud_rate=userspaceusbserialandroidlib_serial_port_get_baud_rate,
  .serial_port_set_baud_rate=userspaceusbserialandroidlib_serial_port_set_baud_rate,
  .serial_port_send=userspaceusbserialandroidlib_serial_port_send,
  .serial_port_receive_data=userspaceusbserialandroidlib_serial_port_receive_data,
};

//NOTE: No need for backtrace since this library only functions with Android
//backtrace is only supported on glibc
static inline void userspaceusbserialandroidlib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey=0;

//Initialise a thread local store for the lock counter
static void makelockkey() {
	int result;

  result=pthread_key_create(&lockkey, NULL);
	if (result!=0) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
	} else {
		havelockkey=1;
	}
}

/*
  Apply the userspaceusbserial mutex lock if not already applied otherwise increment the lock count
*/
static void userspaceusbserialandroidlib_lockuserspaceusbserialandroid(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();
  (void) pthread_once(&lockkey_onceinit, makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
    USERSPACEUSBSERIALANDROIDLIB_PTHREAD_LOCK(&userspaceusbserialandroidlibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef USERSPACEUSBSERIALANDROIDLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the userspaceusbserial mutex lock
*/
static void userspaceusbserialandroidlib_unlockuserspaceusbserialandroid(void) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();

  LOCKDEBUG_ENTERINGFUNC();
  long *lockcnt;

  (void) pthread_once(&lockkey_onceinit, makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
		debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
		return;
	}
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    userspaceusbserialandroidlib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    USERSPACEUSBSERIALANDROIDLIB_PTHREAD_UNLOCK(&userspaceusbserialandroidlibmutex);
  }

#ifdef USERSPACEUSBSERIALANDROIDLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=NULL;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}

static int JNIAttachThread(JNIEnv** env, int *wasdetached) {
#ifdef __ANDROID__
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=JNI_OK;

  result=(*userspaceusbserialandroidlib_gJavaVM)->GetEnv(userspaceusbserialandroidlib_gJavaVM, (void **) env, JNI_VERSION_1_6);
  if (result==JNI_EDETACHED) {
    *wasdetached=1;
    result=(*userspaceusbserialandroidlib_gJavaVM)->AttachCurrentThread(userspaceusbserialandroidlib_gJavaVM, env, NULL);
    if (result!=JNI_OK) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s, Failed to attach to java\n", __func__);
      return result;
    }
  } else if (result!=JNI_OK) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Failed to attach get java environment\n", __func__);
    return result;
  }
  return result;
#else
	return 0;
#endif
}
static int JNIDetachThread(int *wasdetached) {
#ifdef __ANDROID__
  int result=JNI_OK;

  if (*wasdetached) {
		result=(*userspaceusbserialandroidlib_gJavaVM)->DetachCurrentThread(userspaceusbserialandroidlib_gJavaVM);
    *wasdetached=0;
  }
  return result;
#else
	return 0;
#endif
}

/*
  Configure the baud rate for the serial port
  Input: serdevidx The index of the serial device to configure
         baudidx An index to the baud rate array to set the serial port to
  Returns: Returns 1 on success or < 0 on error
*/
static int _userspaceusbserialandroidlib_configurebaudrate(int serdevidx, int baudidx) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID configureBaudRate_methodid;
#endif
  int wasdetached=0, result=-1, return_result=1;

  debuglibifaceptr->debuglib_printf(1, "%s: Setting baud rate for serial device: %s to %d\n", __func__, userspaceusbserialandroidlib_serialdevices[serdevidx].filename, baudrates[baudidx]);

#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return -1;
  }
  configureBaudRate_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "configureBaudRate", "(II)I");

  result=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, configureBaudRate_methodid, serdevidx, baudrates[baudidx]);
#endif
  if (result==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to set baud rate for serial device: %s\n", __func__, userspaceusbserialandroidlib_serialdevices[serdevidx].filename);
    return_result=-1;
    goto configurebaudrate_end_1;
  }
  userspaceusbserialandroidlib_serialdevices[serdevidx].baudrate=baudrates[baudidx];

configurebaudrate_end_1:
  JNIDetachThread(&wasdetached);
  return return_result;
}

//===============================
//serialdevicelib_iface functions
//===============================

//Get the name of the library handling this serial port
//Return the name of this module
static const char *userspaceusbserialandroidlib_serial_port_get_module_name(void *serialport) {
  return userspaceusbserialandroidlib_moduleinfo_ver_1.modulename;
}

//Get a unique id for this serial port
//Return a fairly unique id that other libraries can identify this serial port with
static const char *userspaceusbserialandroidlib_serial_port_get_unique_id(void *serialport) {
  int i;
  usbserialdevice_t *serialportptr=serialport;
  const char *uniqueid="Unknown";

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse && !userspaceusbserialandroidlib_serialdevices[i].removed) {
      continue;
    }
    if (strcmp(serialportptr->filename, userspaceusbserialandroidlib_serialdevices[i].filename)==0) {
      uniqueid=userspaceusbserialandroidlib_serialdevices[i].uniqueid;
      break;
    }
  }
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  return uniqueid;
}

static int userspaceusbserialandroidlib_serial_port_get_baud_rate(void *serialport) {
  usbserialdevice_t *serialportptr=serialport;
  int32_t baudrate;

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  if (!serialportptr->inuse || serialportptr->removed) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return 0;
  }
  baudrate=serialportptr->baudrate;
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  return baudrate;
}

static int userspaceusbserialandroidlib_serial_port_set_baud_rate(void *serialport, int32_t baudrate) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  usbserialdevice_t *serialportptr=serialport;
  int i, result, numbaudrates, baudidx;

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  if (!serialportptr->inuse || serialportptr->removed) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -2;
  }
  //Check if the requested baud rate is supported
  numbaudrates=(int) (sizeof(baudrates)/sizeof(int32_t));
  for (i=0; i<numbaudrates; i++) {
    if (baudrate==baudrates[i]) {
      break;
    }
  }
  if (i==numbaudrates) {
    //Baud rate not supported
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -3;
  }
  baudidx=i;

  debuglibifaceptr->debuglib_printf(1, "%s: Setting baud rate for serial device: %s to %d\n", __func__, serialportptr->filename, baudrates[baudidx]);

  //Find serial device index
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse || userspaceusbserialandroidlib_serialdevices[i].removed) {
      continue;
    }
    if (userspaceusbserialandroidlib_serialdevices[i].filename==serialportptr->filename) {
      break;
    }
  }
  if (i==userspaceusbserialandroidlib_numserialdevices) {
    debuglibifaceptr->debuglib_printf(1, "%s: Serial device: %s not found\n", __func__, serialportptr->filename);
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -4;
  }
  result=_userspaceusbserialandroidlib_configurebaudrate(i, baudidx);
  if (result==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to set baud rate for serial device: %s\n", __func__, serialportptr->filename);
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  serialportptr->baudrate=baudrates[baudidx];
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  return 1;
}

//Get data from the serial port
//Returns number of bytes received, 0 if no data is available, or negative value if serial port has an error
//Args: serbuf The buffer to store the data in
//      count The maximum size of the buffer
static int userspaceusbserialandroidlib_serial_port_receive_data(void *serialport, char *serbuf, int count) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  usbserialdevice_t *serialportptr=serialport;
  int i, serdevidx, serbufcnt;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID serialPortReceiveData_methodid;
  jbyteArray jserbuf;
  jbyte *jserbufarr;
  int wasdetached=0;
#endif

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  if (!serialportptr->inuse || serialportptr->removed) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  //Find serial device index
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse || userspaceusbserialandroidlib_serialdevices[i].removed) {
      continue;
    }
    if (userspaceusbserialandroidlib_serialdevices[i].filename==serialportptr->filename) {
      break;
    }
  }
  if (i==userspaceusbserialandroidlib_numserialdevices) {
    debuglibifaceptr->debuglib_printf(1, "%s: Serial device: %s not found\n", __func__, serialportptr->filename);
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  serdevidx=i;
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  serialPortReceiveData_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "serialPortReceiveData", "(I[B)I");

  //Create a java byte array based on serbuf and count
  jserbuf=(*env)->NewByteArray(env, count);
  serbufcnt=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, serialPortReceiveData_methodid, serdevidx, jserbuf);

  if (serbufcnt>0) {
    //Copy jserbuf to serbuf
    jserbufarr=(*env)->GetByteArrayElements(env, jserbuf, NULL);
    for (i=0; i<serbufcnt; i++) {
      serbuf[i]=jserbufarr[i];
    }
    (*env)->ReleaseByteArrayElements(env, jserbuf, jserbufarr, 0);
  }
  (*env)->DeleteLocalRef(env, jserbuf);
  JNIDetachThread(&wasdetached);
#endif
  if (serbufcnt<1) {
    if (serbufcnt==-1) {
      //This could just be a timeout with user space usb serial but also might mean the device has been unplugged
      serbufcnt=0;
    } else {
      //Device might be removed
      //debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port: %s, result=%d\n", __func__, serialportptr->uniqueid, serbufcnt);
    }
    //Check if the device has been removed
    userspaceusbserialandroidlib_refreshserialdevicelist();
    userspaceusbserialandroidlib_checkserialdeviceremoved(serdevidx);
  } else {
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Received serial data from serial port: %s: Length=%d\n\n", __func__, serialportptr->uniqueid, serbufcnt);
#endif
	}
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  return serbufcnt;
}

/*
  Send data to the serial device
  Returns >= 0 on success or negative value on error (-1 is from write)
*/
static int userspaceusbserialandroidlib_serial_port_send(void *serialport, const void *buf, size_t count) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  usbserialdevice_t *serialportptr=serialport;
  const char *serbuf=buf;
  int i, serdevidx;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID serialPortSend_methodid;
  jbyteArray jserbuf;
  jbyte *jserbufarr;
  int wasdetached=0, result=-1;
#endif

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  if (!serialportptr->inuse || serialportptr->removed) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  //Find serial device index
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse || userspaceusbserialandroidlib_serialdevices[i].removed) {
      continue;
    }
    if (userspaceusbserialandroidlib_serialdevices[i].filename==serialportptr->filename) {
      break;
    }
  }
  if (i==userspaceusbserialandroidlib_numserialdevices) {
    debuglibifaceptr->debuglib_printf(1, "%s: Serial device: %s not found\n", __func__, serialportptr->filename);
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  serdevidx=i;
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Sending serial buffer: length=%d\n\n", __func__, count);
#endif
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return -1;
  }
  serialPortSend_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "serialPortSend", "(I[B)I");

  //Create a java byte array based on serbuf and count
  jserbuf=(*env)->NewByteArray(env, count);

  //Copy serbuf to jserbuf
  jserbufarr=(*env)->GetByteArrayElements(env, jserbuf, NULL);
  for (i=0; i<count; i++) {
    jserbufarr[i]=serbuf[i];
  }
  (*env)->ReleaseByteArrayElements(env, jserbuf, jserbufarr, 0);

  result=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, serialPortSend_methodid, serdevidx, jserbuf);

  (*env)->DeleteLocalRef(env, jserbuf);
  JNIDetachThread(&wasdetached);
#endif
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Problem writing to serial device: %s, result: %d\n", __func__, serialportptr->filename, result);
    userspaceusbserialandroidlib_refreshserialdevicelist();
    userspaceusbserialandroidlib_checkserialdeviceremoved(serdevidx);
  }
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Send result=%d\n", __func__, result);
#endif

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return result;
}





//===============================

/*
  Check if a serial device has already been added to the list
  Args: filename The filename of the device to check
  Returns 1 if already added or 0 otherwise
  NOTE: The variables used by this function are only modified by the same thread that calls this function so no locking is needed
*/
static int userspaceusbserialandroidlib_isdeviceadded(const char *filename) {
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  int i, result=0;

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse || userspaceusbserialandroidlib_serialdevices[i].removed) {
      continue;
    }
    if (userspaceusbserialandroidlib_serialdevices[i].filename) {
      if (strcmp(userspaceusbserialandroidlib_serialdevices[i].filename, filename)==0) {
        //debuglib_printf(1, "serialib_isdeviceadded: Found serial device: %s in list as pos: %d\n", nativeseriallib_serialdevices[i].filename, pos);
        result=1;
        break;
      }
    }
  }
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return result;
}



#ifdef __ANDROID__
/*
  Add a serial device to the list if not already added and open it fully
  Args: filename The filename of the device to add
        fd The fd of the device to add
  Returns 1 if successfully added or other value otherwise
  NOTE: The variables used by this function are only modified by the same thread that calls this function so locking is only needed for some variables
  NOTE2: If -5 is returned the caller should call this function again after waiting a few seconds as the serial port
    might only be temporarily unavailable.
*/
jint Java_com_capsicumcorp_iomy_libraries_watchinputs_UserspaceUSBSerialAndroidLib_jniadddevice( JNIEnv* env, jobject obj, jstring filename) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=userspaceusbserialandroidlib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  const char* lfilename;
  int i;
  jmethodID openSerialDevice_methodid;
  jmethodID closeTempSerialDevice_methodid;
  jmethodID addSerialDevice_methodid;
  int wasdetached=0, result, return_result=0, isopen=0;
  //jstring jfilenamestr=NULL;

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif

  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return -1;
  }
  lfilename=(*env)->GetStringUTFChars(env, filename, 0);
  if (lfilename==NULL) {
    return_result=-1;
    goto jniadddevice_error_end_1;
  }
  if (lfilename[0]==0) {
    //Empty filename
    return_result=-1;
    goto jniadddevice_error_end_2;
  }
  //First check if the device has already been added
  if (userspaceusbserialandroidlib_isdeviceadded(lfilename)==1) {
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: %s is already added\n", __func__, lfilename, __LINE__);
#endif
    return_result=-1;
    goto jniadddevice_error_end_2;
  }
  openSerialDevice_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "openSerialDevice", "(Ljava/lang/String;)I");
  closeTempSerialDevice_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "closeTempSerialDevice", "()V");
  addSerialDevice_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "addSerialDevice", "(Ljava/lang/String;I)I");

  //Open a connection to the device
  //jfilenamestr=(*env)->NewStringUTF(env, lfilename);
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  result=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, openSerialDevice_methodid, filename);
  //(*env)->DeleteLocalRef(env, jfilenamestr);
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
  if (result!=0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't open device: %s, result=%d\n", __func__, lfilename, result);
    if (!userspaceusbserialandroidlib_retryserial) {
      userspaceusbserialandroidlib_retryserial=SERIAL_OPEN_RETRIES;
    } else {
      --userspaceusbserialandroidlib_retryserial;
    }
    if (wasdetached) {
      (*userspaceusbserialandroidlib_gJavaVM)->DetachCurrentThread(userspaceusbserialandroidlib_gJavaVM);
    }
    return_result=-5;
    goto jniadddevice_error_end_2;
  }
  debuglibifaceptr->debuglib_printf(1, "Serial Port: %s open\n", lfilename);
  isopen=1;

  //Find an empty slot
  for (i=0; i<MAX_SERIAL_PORTS; i++) {
    if (!userspaceusbserialandroidlib_serialdevices[i].inuse) {
      break;
    }
  }
  if (i==MAX_SERIAL_PORTS) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d devices has been reached\n", __func__, MAX_SERIAL_PORTS);

    return_result=-3;
    goto jniadddevice_error_end_3;
  }
  //Add the serial device info to the array
  userspaceusbserialandroidlib_serialdevices[i].filename=strdup(lfilename);
  if (!userspaceusbserialandroidlib_serialdevices[i].filename) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial device filename: %s\n", __func__, lfilename);
    return_result=-4;
    goto jniadddevice_error_end_3;
  }
  {
    char *tmpstr;

    tmpstr=(char *) malloc(strlen(userspaceusbserialandroidlib_moduleinfo_ver_1.modulename)+strlen(lfilename)+2);
    if (!tmpstr) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial device uniqueid\n", __func__);
      return_result=-6;
      goto jniadddevice_error_end_4;
    }
    sprintf(tmpstr, "%s:%s", userspaceusbserialandroidlib_moduleinfo_ver_1.modulename, lfilename);
    userspaceusbserialandroidlib_serialdevices[i].uniqueid=tmpstr;
  }
  userspaceusbserialandroidlib_serialdevices[i].isopen=1;
  userspaceusbserialandroidlib_serialdevices[i].baudrate=-1;
  userspaceusbserialandroidlib_serialdevices[i].needtoclose=0;
  userspaceusbserialandroidlib_serialdevices[i].removed=0;
  userspaceusbserialandroidlib_serialdevices[i].inuse=1;

  result=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, addSerialDevice_methodid, filename, i);
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to add device: %d\n", __func__, result);
    //TODO: Remove serial port
    //_userspaceusbserialandroidlib_serial_port_no_longer_using(&userspaceusbserialandroidlib_serialdevices[i]);
    return_result=-8;
    goto jniadddevice_error_end_5;
  }
  if (i==userspaceusbserialandroidlib_numserialdevices) {
    ++userspaceusbserialandroidlib_numserialdevices;
  }
  //Notify the serial port library of the new serial device
  if (serialportlibifaceptr->serial_port_add(&userspaceusbserialandroidlib_device_iface_ver_1, &userspaceusbserialandroidlib_serialdevices[i])!=1) {
    //TODO: Remove serial port
    //Failed to add serial port to serialport library
    //_userspaceusbserialandroidlib_serial_port_no_longer_using(&userspaceusbserialandroidlib_serialdevices[i]);
    return_result=-7;
    goto jniadddevice_error_end_2;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Successfully added device: %s at index: %d\n", __func__, lfilename, i);

  //Successful exit
  return_result=1;
  goto jniadddevice_error_end_2;

jniadddevice_error_end_5:
  userspaceusbserialandroidlib_serialdevices[i].needtoclose=0;
  userspaceusbserialandroidlib_serialdevices[i].removed=1;
  userspaceusbserialandroidlib_serialdevices[i].inuse=0;
jniadddevice_error_end_4:
  if (userspaceusbserialandroidlib_serialdevices[i].filename) {
    free(userspaceusbserialandroidlib_serialdevices[i].filename);
    userspaceusbserialandroidlib_serialdevices[i].filename=NULL;
  }
jniadddevice_error_end_3:
  if (isopen) {
    (*env)->CallStaticVoidMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, closeTempSerialDevice_methodid);
  }
jniadddevice_error_end_2:
  (*env)->ReleaseStringUTFChars(env, filename, lfilename);
jniadddevice_error_end_1:
  JNIDetachThread(&wasdetached);
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return return_result;
}
#endif

/*
  Refresh the list of serial devices in the Java variables  
*/
static void userspaceusbserialandroidlib_refreshserialdevicelist(void) {
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID refreshSerialDeviceList_methodid;
  int wasdetached=0;
#endif

#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return;
  }
  refreshSerialDeviceList_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "refreshSerialDeviceList", "()V");

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  (*env)->CallStaticVoidMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, refreshSerialDeviceList_methodid);
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  JNIDetachThread(&wasdetached);
#endif
}

/*
  Check if a serial device we are using has been removed from the system
*/
static void userspaceusbserialandroidlib_checkserialdeviceremoved(int index) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=userspaceusbserialandroidlib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID checkSerialDeviceRemoved_methodid;
  int wasdetached=0, result=0;
#endif

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return;
  }
  checkSerialDeviceRemoved_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "checkSerialDeviceRemoved", "(I)I");
#endif
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();

  if (!userspaceusbserialandroidlib_serialdevices[index].inuse) {
		userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return;
  }
  if (userspaceusbserialandroidlib_serialdevices[index].removed) {
    //This device has already been removed
		userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
    return;
  }
  if (userspaceusbserialandroidlib_serialdevices[index].filename) {
    result=(*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, checkSerialDeviceRemoved_methodid, index);
    if (result==-2) {
      userspaceusbserialandroidlib_serialdevices[index].removed=1;
      debuglibifaceptr->debuglib_printf(1, "%s: Device: %s has been removed\n", __func__, userspaceusbserialandroidlib_serialdevices[index].filename);

      //Notify the serial port library that the serial device has been removed
      serialportlibifaceptr->serial_port_remove(&userspaceusbserialandroidlib_device_iface_ver_1, &userspaceusbserialandroidlib_serialdevices[index]);
    }
  }
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
  JNIDetachThread(&wasdetached);
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

/*
  Check if any serial devices we are using has been removed from the system
*/
static void userspaceusbserialandroidlib_checkserialdevicesremoved(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  for (i=0; i<userspaceusbserialandroidlib_numserialdevices; i++) {
		userspaceusbserialandroidlib_checkserialdeviceremoved(i);
  }
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

/*
  Find serial devices
  Currently a wrapper to the Java method
*/
static void userspaceusbserialandroidlib_findserialdevices(void) {
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID findSerialDevices_methodid;
  int wasdetached=0;
#endif

#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return;
  }
  findSerialDevices_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "findSerialDevices", "()V");

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  (*env)->CallStaticVoidMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, findSerialDevices_methodid);
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  JNIDetachThread(&wasdetached);
#endif
#ifdef USERSPACEUSBSERIALANDROIDLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

/*
  Cleanup the main thread
*/
static void userspaceusbserialandroidlib_mainloopcleanup(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Main serial thread loop that manages initialisation, shutdown, and connections to the usb serial devices
*/
static void *userspaceusbserialandroidlib_mainloop(void *val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  while (!userspaceusbserialandroidlib_getneedtoquit()) {
    userspaceusbserialandroidlib_refreshserialdevicelist();
    userspaceusbserialandroidlib_checkserialdevicesremoved();
    userspaceusbserialandroidlib_findserialdevices();

    clock_gettime(CLOCK_REALTIME, &waittime);
    if (userspaceusbserialandroidlib_retryserial) {
      waittime.tv_sec+=1;
    } else {
      waittime.tv_sec+=10;
    }
    sem_timedwait(&userspaceusbserialandroidlib_mainthreadsleepsem, &waittime);
  }
  userspaceusbserialandroidlib_mainloopcleanup();

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

static void userspaceusbserialandroidlib_setneedtoquit(int val) {
  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  needtoquit=val;
  sem_post(&userspaceusbserialandroidlib_mainthreadsleepsem);
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();
}

static int userspaceusbserialandroidlib_getneedtoquit(void) {
  int val;

  userspaceusbserialandroidlib_lockuserspaceusbserialandroid();
  val=needtoquit;
  userspaceusbserialandroidlib_unlockuserspaceusbserialandroid();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int userspaceusbserialandroidlib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (userspaceusbserialandroidlib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&userspaceusbserialandroidlib_mainthread, NULL, userspaceusbserialandroidlib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void userspaceusbserialandroidlib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (userspaceusbserialandroidlib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    userspaceusbserialandroidlib_setneedtoquit(1);
    sem_post(&userspaceusbserialandroidlib_mainthreadsleepsem);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(userspaceusbserialandroidlib_mainthread, NULL);
    userspaceusbserialandroidlib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int userspaceusbserialandroidlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID init_methodid;
  int wasdetached=0;
#endif

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  ++userspaceusbserialandroidlib_inuse;
  if (userspaceusbserialandroidlib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, userspaceusbserialandroidlib_inuse);
    return -1;
  }
  needtoquit=0;
  if (sem_init(&userspaceusbserialandroidlib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  userspaceusbserialandroidlib_needmoreinfo=0;
  userspaceusbserialandroidlib_retryserial=0;
  userspaceusbserialandroidlib_numserialdevices=0;
  if (!userspaceusbserialandroidlib_serialdevices) {
    userspaceusbserialandroidlib_serialdevices=calloc(MAX_SERIAL_PORTS, sizeof(usbserialdevice_t));
    if (!userspaceusbserialandroidlib_serialdevices) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial devices\n", __func__);
      return -3;
    }
  }
  //Initialise the new array elements
  for (i=userspaceusbserialandroidlib_numserialdevices; i<MAX_SERIAL_PORTS; i++) {
    userspaceusbserialandroidlib_serialdevices[i].removed=1;
    userspaceusbserialandroidlib_serialdevices[i].inuse=0;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&userspaceusbserialandroidlibmutex, &errorcheckmutexattr);
#endif
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return -1;
  }
  init_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "init", "()I");

  (*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, init_methodid);

  JNIDetachThread(&wasdetached);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void userspaceusbserialandroidlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=userspaceusbserialandroidlib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
#ifdef __ANDROID__
  JNIEnv *env;
  jmethodID removeSerialDevice_methodid;
  int wasdetached=0;
#endif

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (userspaceusbserialandroidlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --userspaceusbserialandroidlib_inuse;
  if (userspaceusbserialandroidlib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, userspaceusbserialandroidlib_inuse);
    return;
  }
  //No longer in use
#ifdef __ANDROID__
  if (JNIAttachThread(&env, &wasdetached)!=JNI_OK) {
    return;
  }
  removeSerialDevice_methodid=(*env)->GetStaticMethodID(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, "removeSerialDevice", "(I)I");
#endif
  if (userspaceusbserialandroidlib_serialdevices) {
    for (i=0; i<MAX_SERIAL_PORTS; i++) {
      if (userspaceusbserialandroidlib_serialdevices[i].inuse) {
        if (userspaceusbserialandroidlib_serialdevices[i].isopen) {
#ifdef __ANDROID__
          (*env)->CallStaticIntMethod(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class, removeSerialDevice_methodid, i);
#endif
        }
      }
      if (userspaceusbserialandroidlib_serialdevices[i].filename) {
        free(userspaceusbserialandroidlib_serialdevices[i].filename);
      }
      if (userspaceusbserialandroidlib_serialdevices[i].uniqueid) {
        free(userspaceusbserialandroidlib_serialdevices[i].uniqueid);
      }
    }
    free(userspaceusbserialandroidlib_serialdevices);
    userspaceusbserialandroidlib_serialdevices=NULL;
  }
  JNIDetachThread(&wasdetached);

  sem_destroy(&userspaceusbserialandroidlib_mainthreadsleepsem);
#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&userspaceusbserialandroidlibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *userspaceusbserialandroidlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &userspaceusbserialandroidlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_UserspaceUSBSerialAndroidLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) userspaceusbserialandroidlib_getmoduleinfo();
}

jint JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv *env;
  userspaceusbserialandroidlib_gJavaVM=vm;
  jclass aclass;

  (*userspaceusbserialandroidlib_gJavaVM)->GetEnv(userspaceusbserialandroidlib_gJavaVM, (void * *) &env, JNI_VERSION_1_6);
  aclass=(*env)->FindClass(env, "com/capsicumcorp/iomy/libraries/watchinputs/UserspaceUSBSerialAndroidLib");
  userspaceusbserialandroidlib_userspaceusbserialandroid_class=(*env)->NewGlobalRef(env, aclass);
  (*env)->DeleteLocalRef(env, aclass);

  return JNI_VERSION_1_6; 
}

void JNI_OnUnload(JavaVM* UNUSED(vm), void* UNUSED(reserved)) {
  JNIEnv *env;

  (*userspaceusbserialandroidlib_gJavaVM)->GetEnv(userspaceusbserialandroidlib_gJavaVM, (void * *) &env, JNI_VERSION_1_6);
  (*env)->DeleteGlobalRef(env, userspaceusbserialandroidlib_userspaceusbserialandroid_class);
}

#endif
