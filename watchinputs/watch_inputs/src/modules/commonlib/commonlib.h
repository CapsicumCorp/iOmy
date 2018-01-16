/*
  Title: Common Functions Library Header for Watch Inputs
  Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
  Copyright: Capsicum Corporation 2011-2017

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

#ifndef COMMONLIB_H
#define COMMONLIB_H

#include <stdint.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for commonlib module
typedef struct {
  uint16_t (*commonlib_buftolittleendian16bit)(unsigned char *buf);
  uint32_t (*commonlib_buftolittleendian32bit)(unsigned char *buf);
  uint64_t (*commonlib_buftolittleendian64bit)(unsigned char *buf);
  uint16_t (*commonlib_buftobigendian16bit)(unsigned char *buf);
  uint32_t (*commonlib_buftobigendian32bit)(unsigned char *buf);
  uint64_t (*commonlib_buftobigendian64bit)(unsigned char *buf);
  void (*commonlib_littleendian16bittobuf)(unsigned char *buf, uint16_t val);
  void (*commonlib_littleendian32bittobuf)(unsigned char *buf, uint32_t val);
  void (*commonlib_littleendian64bittobuf)(unsigned char *buf, uint64_t val);
  void (*commonlib_bigendian16bittobuf)(unsigned char *buf, uint16_t val);
  void (*commonlib_bigendian32bittobuf)(unsigned char *buf, uint32_t val);
  void (*commonlib_bigendian64bittobuf)(unsigned char *buf, uint64_t val);
} commonlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define COMMONLIBINTERFACE_VER_1 1 //A version number for the commonlib interface version

typedef struct _value_string value_string;
typedef union multitypeval multitypeval_t;

struct _value_string {
  uint32_t value;
  const char *strptr;
};

//Type Union - Currently Assumes Little Endian Order
//NOTE: Using long long for bitfields is a gcc extension but it does simplify code when using these types
struct ubitfield24 {
  unsigned val : 24;
} __attribute__((packed));

struct sbitfield24 {
  int val : 24;
} __attribute__((packed));

struct ubitfield40 {
  unsigned long long val : 40;
} __attribute__((packed));

struct sbitfield40 {
  long long val : 40;
} __attribute__((packed));

struct ubitfield48 {
  unsigned long long val : 48;
} __attribute__((packed));

struct sbitfield48 {
  long long val : 48;
} __attribute__((packed));

struct ubitfield56 {
  unsigned long long val : 56;
} __attribute__((packed));

struct sbitfield56 {
  long long val : 56;
} __attribute__((packed));

union multitypeval {
  uint8_t uval8bit;
  int8_t sval8bit;
  uint16_t uval16bit;
  int16_t sval16bit;
  struct ubitfield24 uval24bit; //Manual use & 0x00FFFFFF
  struct sbitfield24 sval24bit; //Manual use & 0x00FFFFFF
  uint32_t uval32bit;
  int32_t sval32bit;
  struct ubitfield40 uval40bit;
  struct sbitfield40 sval40bit;
  struct ubitfield48 uval48bit; //Manual use & 0x00FFFFFFFFFFFFFF
  struct sbitfield48 sval48bit; //Manual use & 0x00FFFFFFFFFFFFFF
  struct ubitfield56 uval56bit;
  struct sbitfield56 sval56bit;
  uint64_t uval64bit;
  int64_t sval64bit;
  float floatval;
  double doubleval;
  char charval;
  unsigned char ucharval;
  short shortval;
  unsigned short ushortval;
  int intval;
  unsigned uintval;
  long longval;
  unsigned long ulongval;
  long long longlongval;
  unsigned long long ulonglongval;
  uint8_t bytes[256];
}; //Variable size depending on the data type

//http://stackoverflow.com/questions/3599160/unused-parameter-warnings-in-c-code
#ifdef __GNUC__
#  define UNUSED(x) UNUSED_ ## x __attribute__((__unused__))
#else
#  define UNUSED(x) UNUSED_ ## x
#endif

#ifdef __GNUC__
#  define UNUSED_FUNCTION(x) __attribute__((__unused__)) UNUSED_ ## x
#else
#  define UNUSED_FUNCTION(x) UNUSED_ ## x
#endif

//Define the following to use legacy pthread lock debugging
//#define ENABLE_LEGACY_PTHREAD_DEBUG

//Define the following to use modern pthread lock debugging with reference to thislib_backtrace and pretty function
//#define ENABLE_PTHREAD_DEBUG_V2

#ifdef ENABLE_LEGACY_LOCK_DEBUG
#warning "PTHREAD_LOCK and PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
  } \
}

#define PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
  } \
}

#elif ENABLE_LOCK_DEBUG_V2

#warning "PTHREAD_LOCK and PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define PTHREAD_LOCK(mutex) { \
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

#define PTHREAD_UNLOCK(mutex) { \
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

#define PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif

//Map <libname_LOCKDEBUG to LOCKDEBUG to enable this
//References getmoduledepifaceptr to get debuglibifaceptr
#ifdef LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef LOCKDEBUG
  #ifndef __cplusplus
    #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
  #else
    #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  #endif
#else
  #define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//Map <libname_MOREDEBUG to MOREDEBUG to enable this
//References getmoduledepifaceptr to get debuglibifaceptr
#ifdef MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __PRETTY_FUNCTION__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef MOREDEBUG
  #ifndef __cplusplus
    #define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
  #else
    #define MOREDEBUG_ADDDEBUGLIBIFACEPTR() const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  #endif
#else
  #define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#endif
