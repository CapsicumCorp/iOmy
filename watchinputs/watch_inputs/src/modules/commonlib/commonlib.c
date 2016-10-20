/*
Title: Common Functions Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: A common set of functions shared across multiple modules
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

#include <unistd.h>
#include <pthread.h>
#include <ctype.h>
#include <stdint.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "commonlib.h"

//Function Declarations
uint16_t commonlib_buftolittleendian16bit(unsigned char *buf);
uint32_t commonlib_buftolittleendian32bit(unsigned char *buf);
uint64_t commonlib_buftolittleendian64bit(unsigned char *buf);
uint16_t commonlib_buftobigendian16bit(unsigned char *buf);
uint32_t commonlib_buftobigendian32bit(unsigned char *buf);
uint64_t commonlib_buftobigendian64bit(unsigned char *buf);
void commonlib_littleendian16bittobuf(unsigned char *buf, uint16_t val);
void commonlib_littleendian32bittobuf(unsigned char *buf, uint32_t val);
void commonlib_littleendian64bittobuf(unsigned char *buf, uint64_t val);
void commonlib_bigendian16bittobuf(unsigned char *buf, uint16_t val);
void commonlib_bigendian32bittobuf(unsigned char *buf, uint32_t val);
void commonlib_bigendian64bittobuf(unsigned char *buf, uint64_t val);

static commonlib_ifaceptrs_ver_1_t commonlib_ifaceptrs_ver_1={
  commonlib_buftolittleendian16bit,
  commonlib_buftolittleendian32bit,
  commonlib_buftolittleendian64bit,
  commonlib_buftobigendian16bit,
  commonlib_buftobigendian32bit,
  commonlib_buftobigendian64bit,
  commonlib_littleendian16bittobuf,
  commonlib_littleendian32bittobuf,
  commonlib_littleendian64bittobuf,
  commonlib_bigendian16bittobuf,
  commonlib_bigendian32bittobuf,
  commonlib_bigendian64bittobuf
};

static moduleiface_ver_1_t commonlib_ifaces[]={
  {
    &commonlib_ifaceptrs_ver_1,
    COMMONLIBINTERFACE_VER_1
  },
  {
    NULL, 0
  }
};

static moduleinfo_ver_1_t commonlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "commonlib",
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  &commonlib_ifaces,
  NULL
};

//Convert little endian str buffer to 16-bit value
uint16_t commonlib_buftolittleendian16bit(unsigned char *buf) {
  uint16_t val=0;
  int i;

  for (i=0; i<2; i++) {
    val|=(uint16_t) buf[i] << (i*8);
  }
  return val;
}

//Convert little endian str buffer to 32-bit value
uint32_t commonlib_buftolittleendian32bit(unsigned char *buf) {
  uint32_t val=0;
  int i;

  for (i=0; i<4; i++) {
    val|=(uint32_t) buf[i] << (i*8);
  }
  return val;
}

//Convert little endian str buffer to 64-bit value
uint64_t commonlib_buftolittleendian64bit(unsigned char *buf) {
  uint64_t val=0;
  int i;

  for (i=0; i<8; i++) {
    val|=(uint64_t) buf[i] << (i*8);
  }
  return val;
}

//Convert big endian str buffer to 16-bit value
uint16_t commonlib_buftobigendian16bit(unsigned char *buf) {
  uint16_t val=0;
  int i;

  for (i=0; i<2; i++) {
    val|=(uint16_t) buf[i] << ((1-i)*8);
  }
  return val;
}

//Convert big endian str buffer to 32-bit value
uint32_t commonlib_buftobigendian32bit(unsigned char *buf) {
  uint32_t val=0;
  int i;

  for (i=0; i<4; i++) {
    val|=(uint32_t) buf[i] << ((3-i)*8);
  }
  return val;
}

//Convert big endian str buffer to 64-bit value
uint64_t commonlib_buftobigendian64bit(unsigned char *buf) {
  uint64_t val=0;
  int i;

  for (i=0; i<8; i++) {
    val|=(uint64_t) buf[i] << ((7-i)*8);
  }
  return val;
}

//Convert a 16-bit value to little endian str buffer
void commonlib_littleendian16bittobuf(unsigned char *buf, uint16_t val) {
  int i;

  for (i=0; i<2; i++) {
    buf[i]=(val >> i*8) & 0xFF;
  }
}

//Convert a 32-bit value to little endian str buffer
void commonlib_littleendian32bittobuf(unsigned char *buf, uint32_t val) {
  int i;

  for (i=0; i<4; i++) {
    buf[i]=(val >> i*8) & 0xFF;
  }
}

//Convert a 64-bit value to little endian str buffer
void commonlib_littleendian64bittobuf(unsigned char *buf, uint64_t val) {
  int i;

  for (i=0; i<8; i++) {
    buf[i]=(val >> i*8) & 0xFF;
  }
}

//Convert a 16-bit value to big endian str buffer
void commonlib_bigendian16bittobuf(unsigned char *buf, uint16_t val) {
  int i;

  for (i=0; i<2; i++) {
    buf[i]=(val >> (1-i)*8) & 0xFF;
  }
}

//Convert a 32-bit value to big endian str buffer
void commonlib_bigendian32bittobuf(unsigned char *buf, uint32_t val) {
  int i;

  for (i=0; i<4; i++) {
    buf[i]=(val >> (3-i)*8) & 0xFF;
  }
}

//Convert a 64-bit value to big endian str buffer
void commonlib_bigendian64bittobuf(unsigned char *buf, uint64_t val) {
  int i;

  for (i=0; i<8; i++) {
    buf[i]=(val >> (7-i)*8) & 0xFF;
  }
}

moduleinfo_ver_generic_t *commonlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &commonlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CommonLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) commonlib_getmoduleinfo();
}
#endif
