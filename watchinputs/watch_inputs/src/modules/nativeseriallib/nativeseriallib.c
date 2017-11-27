/*
Title: Native Serial Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for providing low level communication with serial ports
Copyright: Capsicum Corporation 2011-2016

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

//NOTE: NONBLOCK mode makes it harder to detect unplugged devices but it means we will never get stuck in read or write.

//Needed for dnotify definitions: F_NOTIFY
#define _GNU_SOURCE

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//#ifndef NATIVESERIALLIB_MOREDEBUG
//#define NATIVESERIALLIB_MOREDEBUG
//#endif

#include "config.h"

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <errno.h>
#include <inttypes.h>
#include <poll.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <termios.h>
#include <pthread.h>
#include <semaphore.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <dirent.h>
#include <fnmatch.h>
#include <sys/ioctl.h>
#ifdef HAVE_LINUX_SERIAL_H
#include <linux/serial.h>
#endif
#include "moduleinterface.h"
#include "nativeseriallib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/serialportlib/serialportlib.h"

#ifdef DEBUG
#warning "NATIVESERIALLIB_PTHREAD_LOCK and NATIVESERIALLIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define NATIVESERIALLIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    nativeseriallib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    nativeseriallib_backtrace(); \
  } \
}

#define NATIVESERIALLIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    nativeseriallib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    nativeseriallib_backtrace(); \
  } \
}

#else

#define NATIVESERIALLIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define NATIVESERIALLIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

#ifdef NATIVESERIALLIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef NATIVESERIALLIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef NATIVESERIALLIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif




#define SERBUFSIZE 20

//NOTE: Use a long retry count as services such as NetworkManager may open the serial port and often take a while to give up
#define SERIAL_OPEN_RETRIES 30 //Maximum number of times to retry opening a serial port (Poll interval is normally once a second)

#define MAX_SERIAL_PORTS 10 //Maximum number of native serial ports to allow

static int32_t baudrates[]={9600, 115200, 19200, 38400, 57600};
//static int32_t baudrates[]={115200, 9600, 19200, 38400, 57600};
static speed_t posixbaudrates[]={B9600, B115200, B19200, B38400, B57600};

typedef struct {
  char *filename; //The full path filename of the serial device
  char *uniqueid; //A unique id for this serial device
  int fd; //The fd of the serial device: -1 if not opened
  struct termios oldserporttio; //The old tio value of the serial device
  int32_t baudrate; //The currently configured baud rate of the serial port
  int needtoclose; //The serial port has been scheduled for closing
  int removed; //This serial port has been removed from the system
  int inuse; //This serial port structure is currently in use, set to 0 when available for reuse
} nativeserialdevice_t;

#ifdef DEBUG
static pthread_mutexattr_t errorcheckmutexattr;
static pthread_mutex_t nativeseriallibmutex;
#else
static pthread_mutex_t nativeseriallibmutex = PTHREAD_MUTEX_INITIALIZER;
#endif

static int nativeseriallib_inuse=0; //Only shutdown when inuse = 0

static char needtoquit=0; //Set to 1 when nativeseriallib should exit
static pthread_t nativeseriallib_mainthread=0;
static sem_t nativeseriallib_mainthreadsleepsem; //Used for main thread sleeping

static int nativeseriallib_needmoreinfo=0; //Set to 1 when a serial port needs more info to indicate that we shouldn't sleep for very long
static int nativeseriallib_retryserial=0; //Set > 0 when a serial port couldn't be opened but might be available for opening soon so we shouldn't sleep for very long
static int nativeseriallib_serdevdirfd; //Used for dnotify watching of adding/removal of serial device files

//serial devices lists
static int nativeseriallib_numserialdevices=0;
static nativeserialdevice_t *nativeseriallib_serialdevices; //A list of detected serial devices

//serialdevicelib_iface functions
static const char *nativeseriallib_serial_port_get_module_name(void *serialport);
static const char *nativeseriallib_serial_port_get_unique_id(void *serialport);
static int nativeseriallib_serial_port_reset(void *serialport);
static int nativeseriallib_serial_port_get_baud_rate(void *serialport);
static int nativeseriallib_serial_port_set_baud_rate(void *serialport, int32_t baudrate);
int nativeseriallib_serial_port_send(void *serialport, const void *buf, size_t count);
int serial_port_wait_ready_to_receive(void *serialport);
int serial_port_receive_data(void *serialport, char *serbuf, int count);
static void nativeseriallib_serial_port_no_longer_using(void *serialport);

//Function Declarations
static void nativeseriallib_setneedtoquit(int val);
static int nativeseriallib_getneedtoquit();
int nativeseriallib_start(void);
void nativeseriallib_stop(void);
int nativeseriallib_init(void);
void nativeseriallib_shutdown(void);

//Module Interface Definitions
#define DEBUGLIB_DEPIDX 0
#define SERIALPORTLIB_DEPIDX 1

static nativeseriallib_ifaceptrs_ver_1_t nativeseriallib_ifaceptrs_ver_1={
  .nativeseriallib_init=nativeseriallib_init,
  .nativeseriallib_shutdown=nativeseriallib_shutdown,
};

static moduleiface_ver_1_t nativeseriallib_ifaces[]={
  {
    .ifaceptr=&nativeseriallib_ifaceptrs_ver_1,
    .ifacever=NATIVESERIALLIBINTERFACE_VER_1
  },
  {
    .ifaceptr=NULL,
  }
};

static moduledep_ver_1_t nativeseriallib_deps[]={
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

static moduleinfo_ver_1_t nativeseriallib_moduleinfo_ver_1={
  .moduleinfover=MODULEINFO_VER_1,
  .modulename="nativeseriallib",
  .initfunc=nativeseriallib_init,
  .shutdownfunc=nativeseriallib_shutdown,
  .startfunc=nativeseriallib_start,
  .stopfunc=nativeseriallib_stop,
  .moduleifaces=&nativeseriallib_ifaces,
  .moduledeps=&nativeseriallib_deps
};

static serialdevicelib_iface_ver_1_t nativeseriallib_device_iface_ver_1={
  .serial_port_get_module_name=nativeseriallib_serial_port_get_module_name,
  .serial_port_get_unique_id=nativeseriallib_serial_port_get_unique_id,
  .serial_port_reset=nativeseriallib_serial_port_reset,
  .serial_port_get_baud_rate=nativeseriallib_serial_port_get_baud_rate,
  .serial_port_set_baud_rate=nativeseriallib_serial_port_set_baud_rate,
  .serial_port_send=nativeseriallib_serial_port_send,
  .serial_port_get_ready_to_receive=NULL,
  .serial_port_wait_ready_to_receive=serial_port_wait_ready_to_receive,
  .serial_port_receive_data=serial_port_receive_data,
  .serial_port_no_longer_using=nativeseriallib_serial_port_no_longer_using
};

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void nativeseriallib_backtrace(void) {
  const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
static void nativeseriallib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static int havelockkey=0;

//Initialise a thread local store for the lock counter
static void nativeseriallib_makelockkey(void) {
  int result;

  result=pthread_key_create(&lockkey, NULL);
  if (result!=0) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
  } else {
    havelockkey=1;
  }
}

/*
  Apply the nativeserial mutex lock if not already applied otherwise increment the lock count
*/
static void nativeseriallib_locknativeserial() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, nativeseriallib_makelockkey);
  if (!havelockkey) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
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
    NATIVESERIALLIB_PTHREAD_LOCK(&nativeseriallibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef NATIVESERIALLIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the nativeserial mutex lock
*/
static void nativeseriallib_unlocknativeserial() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, nativeseriallib_makelockkey);
  if (!havelockkey) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==NULL) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    nativeseriallib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    NATIVESERIALLIB_PTHREAD_UNLOCK(&nativeseriallibmutex);
  }
#ifdef NATIVESERIALLIB_LOCKDEBUG
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
  Thread safe get the number of serial devices
*/
static int nativeseriallib_getnumserialdevices(void) {
  int val;

  nativeseriallib_locknativeserial();
  val=nativeseriallib_numserialdevices;
  nativeseriallib_unlocknativeserial();

  return val;
}

/*
  Thread safe set the number of serial devices
*/
static void nativeseriallib_setnumserialdevices(int numserialdevices) {
  nativeseriallib_locknativeserial();
  nativeseriallib_numserialdevices=numserialdevices;
  nativeseriallib_unlocknativeserial();
}

/*
  Thread safe get device need to close
*/
static int nativeseriallib_getdeviceneedtoclose(int serdevidx) {
  int val;

  nativeseriallib_locknativeserial();
  val=nativeseriallib_serialdevices[serdevidx].needtoclose;
  nativeseriallib_unlocknativeserial();

  return val;
}

/*
  Thread safe set device need to close
*/
static void nativeseriallib_setdeviceneedtoclose(int serdevidx, int needtoclose) {
  nativeseriallib_locknativeserial();
  nativeseriallib_serialdevices[serdevidx].needtoclose=needtoclose;
  nativeseriallib_unlocknativeserial();
}

/*
  Save the original state of a serial port
  Input: fd fd of the open serial port to save the state for
         oldtio Stores the previous settings for the serial port here
  Returns: Returns 1 on success or < 0 on error
*/
static int nativeseriallib_saveserialportstate(int fd, struct termios *oldtio) {
  int result;

  result=tcgetattr(fd, oldtio); //save current port settings
  if (result==-1) {
    return -1;
  }
  return 1;
}

/*
  Configure a serial port
  Input: fd fd of the open serial port to configure
  Returns: Returns 1 on success or < 0 on error
  NOTE: This function keeps the baud rate that the serial port was previously on
*/
static int nativeseriallib_configureserialport(int fd) {
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  struct termios newtio;
  int result;
  
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  result=tcgetattr(fd, &newtio); //Use some of the current serial port settings when applying new settings
  if (result==-1) {
    return -1;
  }
  /*
    BAUDRATE: Set bps rate. You could also use cfsetispeed and cfsetospeed.
    CRTSCTS : output hardware flow control (only used if the cable has
              all necessary lines. See sect. 7 of Serial-HOWTO)
    CS8     : 8n1 (8bit,no parity,1 stopbit)
    CLOCAL  : local connection, no modem contol
    CREAD   : enable receiving characters
  */
  //set new port settings for canonical input processing
  //newtio.c_cflag |= CS8 | CLOCAL | CREAD;
  newtio.c_cflag = CS8 | CLOCAL | CREAD;

  /*
    IGNPAR  : ignore bytes with parity errors
    ICRNL   : map CR to NL (otherwise a CR input on the other computer
              will not terminate input)
              otherwise make device raw (no other input processing)
  */
  newtio.c_iflag = IGNBRK;
  /*
    Raw output.
  */
  newtio.c_oflag = 0;

  //set input mode (non-canonical, no echo,...)
  newtio.c_lflag = 0;

  newtio.c_cc[VMIN]     = SERBUFSIZE/4;   //blocking read until 1 chars received
  newtio.c_cc[VTIME]    = 1;   //inter-character timer unused

  result=tcsetattr(fd, TCSANOW, &newtio);
  if (result==-1) {
    return -1;
  }
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return 1;
}

/*
  Configure the baud rate for the serial port
  Input: serdevidx The index of the serial device to configure
         baudidx An index to the baud rate array to set the serial port to
  Returns: Returns 1 on success or < 0 on error
*/
static int _nativeseriallib_configurebaudrate(int serdevidx, int baudidx) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;
  struct termios newtio;

  result=tcgetattr(nativeseriallib_serialdevices[serdevidx].fd, &newtio); //Get current port settings
  if (result==-1) {
    return -1;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Setting baud rate for serial device: %s to %d\n", __func__, nativeseriallib_serialdevices[serdevidx].filename, baudrates[baudidx]);

  cfsetispeed(&newtio, posixbaudrates[baudidx]);
  cfsetospeed(&newtio, posixbaudrates[baudidx]);

  result=tcsetattr(nativeseriallib_serialdevices[serdevidx].fd, TCSANOW, &newtio);
  if (result==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to set baud rate for serial device: %s\n", __func__, nativeseriallib_serialdevices[serdevidx].filename);
    return -1;
  }
  nativeseriallib_serialdevices[serdevidx].baudrate=baudrates[baudidx];

  return 1;
}

/*
  Reset the serial port
  Input: serdevidx The index of the serial port to reset
  Returns: Returns 1 on success or < 0 on error
*/
static int _nativeseriallib_resetserialport(int serdevidx) {
  return nativeseriallib_serial_port_reset(&nativeseriallib_serialdevices[serdevidx]);
}

/*
  Close a serial port
  Input: fd Descriptor of the serial port to close
         oldtio Previous settings to restore the serial port to
  Returns: 0 if successful or < 0 on error
*/
static int nativeseriallib_closeserialport(int fd, struct termios oldtio) {
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  if (fd<0) {
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
    return -1;
  }
  tcsetattr(fd, TCSANOW, &oldtio);
  close(fd);

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return 0;
}

//===============================
//serialdevicelib_iface functions
//===============================

//Get the name of the library handling this serial port
//Return the name of this module
static const char *nativeseriallib_serial_port_get_module_name(void *serialport) {
  return nativeseriallib_moduleinfo_ver_1.modulename;
}

//Get a unique id for this serial port
//Return a fairly unique id that other libraries can identify this serial port with
static const char *nativeseriallib_serial_port_get_unique_id(void *serialport) {
  int i;
  nativeserialdevice_t *serialportptr=serialport;
  const char *uniqueid="Unknown";

  nativeseriallib_locknativeserial();
  for (i=0; i<nativeseriallib_numserialdevices; i++) {
    if (!nativeseriallib_serialdevices[i].inuse || nativeseriallib_serialdevices[i].removed) {
      continue;
    }
    if (strcmp(serialportptr->uniqueid, nativeseriallib_serialdevices[i].uniqueid)==0) {
      uniqueid=nativeseriallib_serialdevices[i].uniqueid;
      break;
    }
  }
  nativeseriallib_unlocknativeserial();

  return uniqueid;
}

static int nativeseriallib_serial_port_reset(void *serialport) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int controlbits, fd;

  nativeseriallib_locknativeserial();
  if (!serialportptr->inuse || serialportptr->removed) {
    nativeseriallib_unlocknativeserial();
    return 0;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Resetting serial device: %s\n", __func__, serialportptr->filename);

  fd=serialportptr->fd;

  //Drop both RTS and DTR for 100 milliseconds and raise again
  controlbits=TIOCM_DTR|TIOCM_RTS|TIOCM_CTS;
  ioctl(fd, TIOCMBIC, &controlbits);
  usleep(100000);
  ioctl(fd, TIOCMBIS, &controlbits);
  usleep(100000);

  nativeseriallib_configureserialport(serialportptr->fd);

  nativeseriallib_unlocknativeserial();

  return 1;
}

static int nativeseriallib_serial_port_get_baud_rate(void *serialport) {
  nativeserialdevice_t *serialportptr=serialport;
  int32_t baudrate;

  nativeseriallib_locknativeserial();
  if (!serialportptr->inuse || serialportptr->removed) {
    nativeseriallib_unlocknativeserial();
    return 0;
  }
  baudrate=serialportptr->baudrate;
  nativeseriallib_unlocknativeserial();

  return baudrate;
}

static int nativeseriallib_serial_port_set_baud_rate(void *serialport, int32_t baudrate) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int i, result, numbaudrates, baudidx;
  struct termios newtio;

  nativeseriallib_locknativeserial();
  if (!serialportptr->inuse || serialportptr->removed) {
    nativeseriallib_unlocknativeserial();
    return -2;
  }
  result=tcgetattr(serialportptr->fd, &newtio); //Get current port settings
  if (result==-1) {
    nativeseriallib_unlocknativeserial();
    return -1;
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
    nativeseriallib_unlocknativeserial();
    return -3;
  }
  baudidx=i;

  debuglibifaceptr->debuglib_printf(1, "%s: Setting baud rate for serial device: %s to %d\n", __func__, serialportptr->filename, baudrates[baudidx]);

  cfsetispeed(&newtio, posixbaudrates[baudidx]);
  cfsetospeed(&newtio, posixbaudrates[baudidx]);

  result=tcsetattr(serialportptr->fd, TCSANOW, &newtio);
  if (result==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to set baud rate for serial device: %s\n", __func__, serialportptr->filename);
    return -1;
  }
  serialportptr->baudrate=baudrates[baudidx];
  nativeseriallib_unlocknativeserial();

  return 1;
}

//Wait until a serial port has data available in the receive buffer
//Returns 1 if ready to receive data, 0 if no data is available, or negative value if serial port has an error
//Set this function to NULL if not implemented
int serial_port_wait_ready_to_receive(void *serialport) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int lerrno;
  struct pollfd fds[1];
  int result=-2;

  nativeseriallib_locknativeserial();
  if (!serialportptr->inuse || serialportptr->removed) {
    nativeseriallib_unlocknativeserial();
    return -2;
  }
  while (!serialportptr->removed && serialportptr->inuse && !needtoquit) {
    fds[0].fd=serialportptr->fd;
    fds[0].events=POLLIN;

    //Unlock while waiting
    nativeseriallib_unlocknativeserial();
    result=poll(fds, 1, 1000);

    //Relock after waiting
    nativeseriallib_locknativeserial();
    lerrno=errno;
    if (result==0 || (result==-1 && lerrno==EINTR)) {
      //Timeout
      result=0;
      break;
    }
    if (result==-1) {
      //An error occurred so abort
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port: %s\n", __func__, serialportptr->uniqueid);
      break;
    }
    if (fds[0].revents != POLLIN) {
      //An error occurred so abort
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port: %s\n", __func__, serialportptr->uniqueid);
      break;
    }
    //Ready to receive data
    result=1;
    break;
  }
  nativeseriallib_unlocknativeserial();

  return result;
}

//Get data from the serial port
//Returns number of bytes received, 0 if no data is available, or negative value if serial port has an error
//Args: serbuf The buffer to store the data in
//      count The maximum size of the buffer
int serial_port_receive_data(void *serialport, char *serbuf, int count) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int lerrno, serbufcnt;

  nativeseriallib_locknativeserial();
  if (!serialportptr->inuse || serialportptr->removed) {
    nativeseriallib_unlocknativeserial();
    return -1;
  }
  serbufcnt=read(serialportptr->fd, serbuf, count);
  lerrno=errno;
  if (serbufcnt<1) {
    if (serbufcnt==0 && lerrno==0) {
      //Device might be removed
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to read from serial port: %s\n", __func__, serialportptr->uniqueid);
      nativeseriallib_unlocknativeserial();
      return -lerrno;
    }
    if (lerrno==EAGAIN) {
      //Not really ready to receive data, but just return 0 here
      nativeseriallib_unlocknativeserial();
      debuglibifaceptr->debuglib_printf(1, "%s: read returned errno: EAGAIN\n", __func__);
      return 0;
    }
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Received serial data from serial port: %s: Length=%d\n\n", __func__, serialportptr->uniqueid, serbufcnt);
#endif
  }
  nativeseriallib_unlocknativeserial();
  return serbufcnt;
}

/*
  Send data to the serial device
  Returns >= 0 on success or negative value on error (-1 is from write)
*/
int nativeseriallib_serial_port_send(void *serialport, const void *buf, size_t count) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int result, lerrno;

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  nativeseriallib_locknativeserial();
  if (serialportptr->fd==-1) {
    //serial device not open
    nativeseriallib_unlocknativeserial();
    return -3;
  }
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Sending serial buffer: length=%d\n\n", __func__, count);
#endif
  result=write(serialportptr->fd, buf, count);
  lerrno=errno;
  if (result<0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Problem writing to serial device: %s, errno: %d\n", __func__, serialportptr->filename, lerrno);
  }
  nativeseriallib_unlocknativeserial();
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Send result=%d, errno=%d\n", __func__, result, lerrno);
#endif

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return result;
}

static void nativeseriallib_serial_port_no_longer_using(void *serialport) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  nativeserialdevice_t *serialportptr=serialport;
  int i;

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  nativeseriallib_locknativeserial();
  for (i=0; i<nativeseriallib_numserialdevices; i++) {
    if (!nativeseriallib_serialdevices[i].inuse) {
      continue;
    }
    if (strcmp(serialportptr->uniqueid, nativeseriallib_serialdevices[i].uniqueid)==0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Resources for serial port: %s are being freed\n", __func__, nativeseriallib_serialdevices[i].filename);
      if (nativeseriallib_serialdevices[i].fd!=-1) {
        nativeseriallib_closeserialport(nativeseriallib_serialdevices[i].fd, nativeseriallib_serialdevices[i].oldserporttio);
      }
      if (nativeseriallib_serialdevices[i].filename) {
        free(nativeseriallib_serialdevices[i].filename);
        nativeseriallib_serialdevices[i].filename=NULL;
      }
      if (nativeseriallib_serialdevices[i].uniqueid) {
        free(nativeseriallib_serialdevices[i].uniqueid);
        nativeseriallib_serialdevices[i].uniqueid=NULL;
      }
      nativeseriallib_serialdevices[i].removed=1;
      nativeseriallib_serialdevices[i].inuse=0;

      //If this is the highest inuse entry we can reduce the value of numserialdevices
      if (i+1==nativeseriallib_numserialdevices) {
        --nativeseriallib_numserialdevices;
      }
      //We found the serial port entry
      break;
    }
  }
  nativeseriallib_unlocknativeserial();

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

//===============================

/*
  Check if a serial device has already been added to the list
  Args: filename The filename of the device to check
  Returns 1 if already added or 0 otherwise
  NOTE: The variables used by this function are only modified by the same thread that calls this function so no locking is needed
*/
static int serialib_isdeviceadded(char *filename) {
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  int i, result=0;

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  nativeseriallib_locknativeserial();
  for (i=0; i<nativeseriallib_numserialdevices; i++) {
    if (!nativeseriallib_serialdevices[i].inuse || nativeseriallib_serialdevices[i].removed) {
      continue;
    }
    if (nativeseriallib_serialdevices[i].filename) {
      if (strcmp(nativeseriallib_serialdevices[i].filename, filename)==0) {
        result=1;
        break;
      }
    }
  }
  nativeseriallib_unlocknativeserial();

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return result;
}

/*
  Add a serial device to the list if not already added and open it fully
  Args: filename The filename of the device to add
        fd The fd of the device to add
  Returns 1 if successfully added or other value otherwise
  NOTE: The variables used by this function are only modified by the same thread that calls this function so locking is only needed for some variables
  NOTE2: If -5 is returned the caller should call this function again after waiting a few seconds as the serial port
    might only be temporarily unavailable.
*/
static int nativeserialib_adddevice(char *filename) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=nativeseriallib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  int i, fd, result, lerrno;
  struct termios oldserporttio;
#ifdef HAVE_LINUX_SERIAL_H
  struct serial_struct serinfo;
#endif

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif

  //First check if the device has already been added
  if (serialib_isdeviceadded(filename)==1) {
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: %s is already added\n", __func__, filename);
#endif
    return -1;
  }
  fd=open(filename, O_RDWR | O_NOCTTY | O_EXCL | O_NONBLOCK);
  lerrno=errno;
  if (fd==-1) {
    int return_result=-2;

    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't open device: %s, errno=%d\n", __func__, filename, lerrno);
    if (lerrno==EACCES || lerrno==EBUSY) {
      if (!nativeseriallib_retryserial) {
        nativeseriallib_retryserial=SERIAL_OPEN_RETRIES;
      } else {
        --nativeseriallib_retryserial;
      }
      return_result=-5;
    }
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
    return return_result;
  }
#ifdef HAVE_LINUX_SERIAL_H
  serinfo.reserved_char[0] = 0;
#endif
  if (fnmatch("/dev/ttyACM*", filename, 0)!=0 && fnmatch("/dev/ttyUSB*", filename, 0)!=0) {
    //Don't check ttyACM devices for serial support since they reject the request
#ifdef HAVE_LINUX_SERIAL_H
    if (ioctl(fd, TIOCGSERIAL, &serinfo)==-1) {
      close(fd);
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: device: %s is not a serial port\n", __func__, filename);
      return -2;
    }
#endif
#ifdef HAVE_LINUX_SERIAL_H
    if (fnmatch("/dev/ttyS*", filename, 0)==0) {
      //Currently we assume that all 8250 based serial devices must have an IRQ
      if (serinfo.irq==0) {
        close(fd);
        debuglibifaceptr->debuglib_printf(1, "Exiting %s: Device: %s doesn't have an IRQ\n", __func__, filename);
        return -2;
      }
    }
    debuglibifaceptr->debuglib_printf(1, "Serial Port: %s open, UART id: %d\n", filename, serinfo.type);
#else
    debuglibifaceptr->debuglib_printf(1, "Serial Port: %s open\n", filename);
#endif
  }
  //Do a test run of configuring the port now to make sure it functions as a serial port should
  result=nativeseriallib_saveserialportstate(fd, &oldserporttio);
  if (result==1) {
    result=nativeseriallib_configureserialport(fd);
  }
  if (result!=1) {
    close(fd);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't configure serial device: %s\n", __func__, filename);
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
    return -2;
  }
  nativeseriallib_locknativeserial();
  //Find an empty slot
  for (i=0; i<MAX_SERIAL_PORTS; i++) {
    if (!nativeseriallib_serialdevices[i].inuse) {
      break;
    }
  }
  if (i==MAX_SERIAL_PORTS) {
    if (fd!=-1) {
      nativeseriallib_closeserialport(fd, oldserporttio);
    }
    if (nativeseriallib_serialdevices[i].filename) {
      free(nativeseriallib_serialdevices[i].filename);
      nativeseriallib_serialdevices[i].filename=NULL;
    }
    if (nativeseriallib_serialdevices[i].uniqueid) {
      free(nativeseriallib_serialdevices[i].uniqueid);
      nativeseriallib_serialdevices[i].uniqueid=NULL;
    }
    nativeseriallib_serialdevices[i].removed=1;
    nativeseriallib_serialdevices[i].inuse=0;

    nativeseriallib_unlocknativeserial();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d devices has been reached\n", __func__, MAX_SERIAL_PORTS);

    return -3;
  }
  //Add the serial device info to the array
  nativeseriallib_serialdevices[i].filename=strdup(filename);
  if (!nativeseriallib_serialdevices[i].filename) {
    if (fd!=-1) {
      nativeseriallib_closeserialport(fd, oldserporttio);
    }
    nativeseriallib_unlocknativeserial();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial device filename: %s\n", __func__, filename);
    return -4;
  }
  {
    char *tmpstr;

    tmpstr=(char *) malloc(strlen(nativeseriallib_moduleinfo_ver_1.modulename)+strlen(filename)+6);
    if (!tmpstr) {
      if (fd!=-1) {
        nativeseriallib_closeserialport(fd, oldserporttio);
      }
      if (nativeseriallib_serialdevices[i].filename) {
        free(nativeseriallib_serialdevices[i].filename);
        nativeseriallib_serialdevices[i].filename=NULL;
      }
      nativeseriallib_unlocknativeserial();
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial device uniqueid\n", __func__);
      return -5;
    }
    sprintf(tmpstr, "%s:%s_%d", nativeseriallib_moduleinfo_ver_1.modulename, filename, i);
    nativeseriallib_serialdevices[i].uniqueid=tmpstr;
  }
  nativeseriallib_serialdevices[i].fd=fd;
  nativeseriallib_serialdevices[i].oldserporttio=oldserporttio;
  nativeseriallib_serialdevices[i].baudrate=-1;
  nativeseriallib_serialdevices[i].needtoclose=0;
  nativeseriallib_serialdevices[i].removed=0;
  nativeseriallib_serialdevices[i].inuse=1;

  if (i==nativeseriallib_numserialdevices) {
    ++nativeseriallib_numserialdevices;
  }
  nativeseriallib_unlocknativeserial();

  //Notify the serial port library of the new serial device
  if (serialportlibifaceptr->serial_port_add(&nativeseriallib_device_iface_ver_1, &nativeseriallib_serialdevices[i])!=1) {
    //Failed to add serial port to serialport library
    nativeseriallib_serial_port_no_longer_using(&nativeseriallib_serialdevices[i]);
    return -6;
  }
  debuglibifaceptr->debuglib_printf(1, "%s: Successfully added device: %s at index: %d\n", __func__, filename, i);

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
  return 1;
}

/*
  Check if a serial device we are using has been removed from the system
*/
static void nativeseriallib_checkserialdeviceremoved(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  serialportlib_ifaceptrs_ver_1_t *serialportlibifaceptr=nativeseriallib_deps[SERIALPORTLIB_DEPIDX].ifaceptr;
  int i, result=0;

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  nativeseriallib_locknativeserial();
  for (i=0; i<nativeseriallib_numserialdevices; i++) {
    if (!nativeseriallib_serialdevices[i].inuse) {
      continue;
    }
    if (nativeseriallib_serialdevices[i].removed) {
      //This device has already been removed
      continue;
    }
    if (nativeseriallib_serialdevices[i].filename) {
      struct stat stat_buf;

      result=stat(nativeseriallib_serialdevices[i].filename, &stat_buf);
      if (result!=0) {
        nativeseriallib_serialdevices[i].removed=1;
        if (nativeseriallib_serialdevices[i].fd!=-1) {
          nativeseriallib_closeserialport(nativeseriallib_serialdevices[i].fd, nativeseriallib_serialdevices[i].oldserporttio);
          nativeseriallib_serialdevices[i].fd=-1;
        }
        debuglibifaceptr->debuglib_printf(1, "%s: Device: %s has been removed\n", __func__, nativeseriallib_serialdevices[i].filename);

        //Notify the serial port library of the new serial device
        serialportlibifaceptr->serial_port_remove(&nativeseriallib_device_iface_ver_1, &nativeseriallib_serialdevices[i]);
      }
    }
  }
  nativeseriallib_unlocknativeserial();

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

/*
  Find serial devices
  You should disable the ability to cancel the thread while calling this function
  NOTE: Doesn't yet unload removed serial devices since we aren't expecting devices to be removed very often
  NOTE: The variables used by this function are all local so no locking is needed
*/
static void nativeseriallib_findserialdevices(void) {
#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  int fd;
  DIR *devdir;
  struct dirent *direntdata=NULL;
  char tmpstr[256]; //Used for temporary storage of the device path

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
#endif
  //Search /dev for serial device files
  devdir=opendir("/dev");
  if (devdir==NULL) {
#ifdef NATIVESERIALLIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
    return;
  }
  do {
    direntdata=readdir(devdir);
    if (direntdata==NULL) {
      continue;
    }
    //Check for a lock file in the standard location
    sprintf(tmpstr, "/var/lock/LCK..%s", direntdata->d_name);
    fd=open(tmpstr, O_RDONLY);
    if (fd!=-1) {
      //This serial port is locked by another program
      //Close the lock file
      close(fd);
      continue;
    }
    sprintf(tmpstr, "/dev/%s", direntdata->d_name);
    if (fnmatch("/dev/ttyS*", tmpstr, 0)==0) {
      nativeserialib_adddevice(tmpstr);
    } else
    if (fnmatch("/dev/ttyUSB*", tmpstr, 0)==0) {
      nativeserialib_adddevice(tmpstr);
    }
      else if (fnmatch("/dev/ttyACM*", tmpstr, 0)==0) {
      nativeserialib_adddevice(tmpstr);
    }
  } while (direntdata!=NULL);
  closedir(devdir);

#ifdef NATIVESERIALLIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
#endif
}

static void nativeseriallib_dnotifysighandler(int sig, siginfo_t *si, void *data) {
  //debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  //NOTE: Until debuglib supports recusive locking this may cause a deadlock as a signal can trigger from anywhere
  //debuglibifaceptr->debuglib_printf(1, "%s: dnotify signal received, threadid=%lu\n", __func__, pthread_self());

  nativeseriallib_locknativeserial();
  nativeseriallib_retryserial=0; //Reset serial retry value as a serial device has been detected or removed

  //Wakeup main thread
  sem_post(&nativeseriallib_mainthreadsleepsem);
  nativeseriallib_unlocknativeserial();
}

/*
  Cleanup the main thread
*/
void nativeseriallib_mainloopcleanup(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (nativeseriallib_serdevdirfd!=-1) {
    close(nativeseriallib_serdevdirfd);
    nativeseriallib_serdevdirfd=-1;
  }
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Main serial thread loop that manages initialisation, shutdown, and connections to the serial port
*/
static void *nativeseriallib_mainloop(void *val) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result;
  int cannotify=0; //1=dnotify is available on this system
  struct sigaction dnotifysigact;
  struct timespec waittime;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Setup dnotify monitoring of the evdev directory if available
  result=1;
  nativeseriallib_serdevdirfd=-1;
#ifdef F_NOTIFY
  nativeseriallib_serdevdirfd=open("/dev", O_RDONLY);
  if (nativeseriallib_serdevdirfd!=-1) {
    result=0;
  }
  if (result==0) {
    result=fcntl(nativeseriallib_serdevdirfd, F_SETSIG, SIGRTMIN + 1);
  }
  if (result==0) {
    result=fcntl(nativeseriallib_serdevdirfd, F_NOTIFY, DN_CREATE|DN_RENAME|DN_DELETE|DN_MULTISHOT);
  }
  if (result==0) {
    //Setup a dnotify signal handler
    dnotifysigact.sa_sigaction = nativeseriallib_dnotifysighandler;
    sigemptyset(&dnotifysigact.sa_mask);
    dnotifysigact.sa_flags = SA_SIGINFO;
    result=sigaction(SIGRTMIN + 1, &dnotifysigact, NULL);
  }
#endif
  if (result==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: dnotify is available on this system\n", __func__);
    cannotify=1;
  } else {
    if (nativeseriallib_serdevdirfd!=-1) {
      close(nativeseriallib_serdevdirfd);
      nativeseriallib_serdevdirfd=-1;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: dnotify is not available on this system so polling will be used\n", __func__);
  }
  while (!nativeseriallib_getneedtoquit()) {
    nativeseriallib_checkserialdeviceremoved();
    nativeseriallib_findserialdevices();

    clock_gettime(CLOCK_REALTIME, &waittime);
    if (nativeseriallib_retryserial) {
      waittime.tv_sec+=1;
      sem_timedwait(&nativeseriallib_mainthreadsleepsem, &waittime);
    } else if (cannotify) {
      waittime.tv_sec+=120;
      sem_timedwait(&nativeseriallib_mainthreadsleepsem, &waittime);
    } else {
      waittime.tv_sec+=10;
      sem_timedwait(&nativeseriallib_mainthreadsleepsem, &waittime);
    }
  }
  nativeseriallib_mainloopcleanup();

  return (void *) 0;
}

static void nativeseriallib_setneedtoquit(int val) {
  nativeseriallib_locknativeserial();
  needtoquit=val;
  nativeseriallib_unlocknativeserial();
}

static int nativeseriallib_getneedtoquit() {
  int val;

  nativeseriallib_locknativeserial();
  val=needtoquit;
  nativeseriallib_unlocknativeserial();

  return val;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int nativeseriallib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (nativeseriallib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&nativeseriallib_mainthread, NULL, nativeseriallib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void nativeseriallib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (nativeseriallib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    nativeseriallib_setneedtoquit(1);
    sem_post(&nativeseriallib_mainthreadsleepsem);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(nativeseriallib_mainthread, NULL);
    nativeseriallib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int nativeseriallib_init(void) {
  int i;

  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	++nativeseriallib_inuse;
	if (nativeseriallib_inuse>1) {
    //Already initialised
		debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, nativeseriallib_inuse);
		return -1;
  }
  needtoquit=0;
  if (sem_init(&nativeseriallib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  nativeseriallib_needmoreinfo=0;
  nativeseriallib_retryserial=0;
  nativeseriallib_numserialdevices=0;
  if (!nativeseriallib_serialdevices) {
    nativeseriallib_serialdevices=calloc(MAX_SERIAL_PORTS, sizeof(nativeserialdevice_t));
    if (!nativeseriallib_serialdevices) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for serial devices\n", __func__);
      return -3;
    }
  }
  //Initialise the new array elements
  for (i=nativeseriallib_numserialdevices; i<MAX_SERIAL_PORTS; i++) {
    nativeseriallib_serialdevices[i].removed=1;
    nativeseriallib_serialdevices[i].inuse=0;
  }
#ifdef DEBUG
  //Enable error checking on mutexes if debugging is enabled
  pthread_mutexattr_init(&errorcheckmutexattr);
  pthread_mutexattr_settype(&errorcheckmutexattr, PTHREAD_MUTEX_ERRORCHECK);

  pthread_mutex_init(&nativeseriallibmutex, &errorcheckmutexattr);
#endif
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

	return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void nativeseriallib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=nativeseriallib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (nativeseriallib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
	--nativeseriallib_inuse;
	if (nativeseriallib_inuse>0) {
		//Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, nativeseriallib_inuse);
		return;
	}
  //No longer in use
  if (nativeseriallib_serialdevices) {
    for (i=0; i<MAX_SERIAL_PORTS; i++) {
      if (nativeseriallib_serialdevices[i].inuse) {
        if (nativeseriallib_serialdevices[i].fd!=-1) {
          nativeseriallib_closeserialport(nativeseriallib_serialdevices[i].fd, nativeseriallib_serialdevices[i].oldserporttio);
        }
      }
      if (nativeseriallib_serialdevices[i].filename) {
        free(nativeseriallib_serialdevices[i].filename);
      }
      if (nativeseriallib_serialdevices[i].uniqueid) {
        free(nativeseriallib_serialdevices[i].uniqueid);
      }
    }
    free(nativeseriallib_serialdevices);
    nativeseriallib_serialdevices=NULL;
  }
  sem_destroy(&nativeseriallib_mainthreadsleepsem);
#ifdef DEBUG
  //Destroy main mutexes
  pthread_mutex_destroy(&nativeseriallibmutex);

  pthread_mutexattr_destroy(&errorcheckmutexattr);
#endif
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *nativeseriallib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &nativeseriallib_moduleinfo_ver_1;
}
