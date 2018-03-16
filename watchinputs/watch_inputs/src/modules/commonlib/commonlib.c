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

//Needed for accept4
#define _GNU_SOURCE

#ifndef __ANDROID__
#include <config.h>
#endif

#include <unistd.h>
#include <pthread.h>
#include <ctype.h>
#include <stdint.h>
#include <fcntl.h>
#ifdef __ANDROID__
#include <jni.h>
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "commonlib.h"

#ifndef FD_CLOEXEC
#error "commonlib.c needs FD_CLOEXEC to be defined"
#endif

#ifdef __ANDROID__
//Only Android > 21 has accept4
#if __ANDROID_API__ >= 21
#ifndef HAVE_ACCEPT4
#define HAVE_ACCEPT4
#endif
#endif
#if __ANDROID_API__ < 21
//Make sure HAVE_ACCEPT4 isn't defined on Android < 21
#ifdef HAVE_ACCEPT4
#undef HAVE_ACCEPT4
#endif
#endif
#endif

//On Android SOCK_CLOEXEC wasn't defined until Android 21
//On Linux SOCK_CLOEXEC wasn't defined until kernel: 2.6.27 and previous kernel versions ignore it
//  SOCK_CLOEXEC is defined as O_CLOEXEC so it should be okay to use that if it is defined and then
//  just use fcntl to check if the setting was applied
#ifndef SOCK_CLOEXEC
#ifdef O_CLOEXEC
#define SOCK_CLOEXEC O_CLOEXEC
#endif
#endif

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
int commonlib_open_with_cloexec(const char *pathname, int flags);
int commonlib_open_with_create_and_cloexec(const char *pathname, int flags, mode_t mode);
int commonlib_socket_with_cloexec(int domain, int type, int protocol);
int commonlib_accept_with_cloexec(int sockfd, struct sockaddr *addr, socklen_t *addrlen);

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

static commonlib_ifaceptrs_ver_2_t commonlib_ifaceptrs_ver_2={
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
  commonlib_bigendian64bittobuf,
  commonlib_open_with_cloexec,
  commonlib_open_with_create_and_cloexec,
  commonlib_socket_with_cloexec,
  commonlib_accept_with_cloexec
};

static moduleiface_ver_1_t commonlib_ifaces[]={
  {
    &commonlib_ifaceptrs_ver_1,
    COMMONLIBINTERFACE_VER_1
  },
  {
    &commonlib_ifaceptrs_ver_2,
    COMMONLIBINTERFACE_VER_2
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

//Open a file and then make sure it has O_CLOEXEC set
//The caller should use their own locking if needed but doesn't need to set O_CLOEXEC
//Returns file descriptor on success
//Returns -1 if the command failed and errno will contain the result
//Returns -2 if the file opened but failed to set O_CLOEXEC flag, file will be closed on return, but may need deleting if the file was newly created
int commonlib_open_with_cloexec(const char *pathname, int flags) {
  int fd, oldflags, result;
#ifndef O_CLOEXEC
  //Old Style two command CLOEXEC
  //Thread locking recommended
  fd=open(pathname, flags);
  if (fd==-1) {
    return -1;
  }
  oldflags=fcntl(fd, F_GETFD, 0);
  if (oldflags<0) {
    close(fd);
    return -2;
  }
  result=fcntl(fd, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(fd);
    return -2;
  }
  return fd;
#else
  fd=open(pathname, flags|O_CLOEXEC);
  if (fd==-1) {
    return -1;
  }
  //Double check that CLOEXEC is enabled as Linux kernels < 2.6.23 may ignore the flag
  oldflags=fcntl(fd, F_GETFD, 0);
  if (oldflags<0) {
    close(fd);
    return -2;
  }
  if ((oldflags & FD_CLOEXEC)==FD_CLOEXEC) {
    //CLOEXEC is enabled, no thread locking would have been required
    return fd;
  }
  //Need to enable CLOEXEC using fcntl
  //Thread locking recommended
  result=fcntl(fd, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(fd);
    return -2;
  }
  return fd;
#endif
}

//Open a file with O_CREAT or O_TMPFILE and then make sure it has O_CLOEXEC set
//The caller should use their own locking if needed but doesn't need to set O_CLOEXEC
//Returns file descriptor on success
//Returns -1 if the command failed and errno will contain the result
//Returns -2 if the file opened but failed to set O_CLOEXEC flag, file will be closed on return, but may need deleting if the file was newly created
int commonlib_open_with_create_and_cloexec(const char *pathname, int flags, mode_t mode) {
  int fd, oldflags, result;
#ifndef O_CLOEXEC
  //Old Style two command CLOEXEC
  //Thread locking recommended
  fd=open(pathname, flags, mode);
  if (fd==-1) {
    return -1;
  }
  oldflags=fcntl(fd, F_GETFD, 0);
  if (oldflags<0) {
    close(fd);
    return -2;
  }
  result=fcntl(fd, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(fd);
    return -2;
  }
  return fd;
#else
  fd=open(pathname, flags|O_CLOEXEC, mode);
  if (fd==-1) {
    return -1;
  }
  //Double check that CLOEXEC is enabled as Linux kernels < 2.6.23 may ignore the flag
  oldflags=fcntl(fd, F_GETFD, 0);
  if (oldflags<0) {
    close(fd);
    return -2;
  }
  if ((oldflags & FD_CLOEXEC)==FD_CLOEXEC) {
    //CLOEXEC is enabled, no thread locking would have been required
    return fd;
  }
  //Need to enable CLOEXEC using fcntl
  //Thread locking recommended
  result=fcntl(fd, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(fd);
    return -2;
  }
  return fd;
#endif
}

//Create a socket and then make sure it has O_CLOEXEC set
//The caller should use their own locking if needed but doesn't need to set O_CLOEXEC
//Returns file descriptor on success
//Returns -1 if the command failed and errno will contain the result
//Returns -2 if the socket opened but failed to set O_CLOEXEC flag, socket will be closed on return
int commonlib_socket_with_cloexec(int domain, int type, int protocol) {
  int sock, oldflags, result;
#ifndef O_CLOEXEC
  //Old Style two command CLOEXEC
  //Thread locking recommended
  sock=socket(domain, type, protocol);
  if (sock==-1) {
    return -1;
  }
  oldflags=fcntl(sock, F_GETFD, 0);
  if (oldflags<0) {
    close(sock);
    return -2;
  }
  result=fcntl(sock, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(sock);
    return -2;
  }
  return sock;
#else
  sock=socket(domain, type|SOCK_CLOEXEC, protocol);
  if (sock==-1) {
    return -1;
  }
  //Double check that CLOEXEC is enabled as Linux kernels < 2.6.27 may ignore the flag
  oldflags=fcntl(sock, F_GETFD, 0);
  if (oldflags<0) {
    close(sock);
    return -2;
  }
  if ((oldflags & FD_CLOEXEC)==FD_CLOEXEC) {
    //CLOEXEC is enabled, no thread locking would have been required
    return sock;
  }
  //Need to enable CLOEXEC using fcntl
  //Thread locking recommended
  result=fcntl(sock, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(sock);
    return -2;
  }
  return sock;
#endif
}

//Accept a connection on a socket and then make sure it has O_CLOEXEC set
//The caller should use their own locking if needed but doesn't need to set O_CLOEXEC
//Returns file descriptor on success
//Returns -1 if the command failed and errno will contain the result
//Returns -2 if the socket opened but failed to set O_CLOEXEC flag, socket will be closed on return
int commonlib_accept_with_cloexec(int sockfd, struct sockaddr *addr, socklen_t *addrlen) {
  int sock, oldflags, result;
#ifndef O_CLOEXEC
  //Old Style two command CLOEXEC
  //Thread locking recommended
  sock=accept(sockfd, addr, addrlen);
  if (sock==-1) {
    return -1;
  }
  oldflags=fcntl(sock, F_GETFD, 0);
  if (oldflags<0) {
    close(sock);
    return -2;
  }
  result=fcntl(sock, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(sock);
    return -2;
  }
  return sock;
#else
#ifdef HAVE_ACCEPT4
  sock=accept4(sockfd, addr, addrlen, SOCK_CLOEXEC);
#else
  sock=accept(sockfd, addr, addrlen);
#endif
  if (sock==-1) {
    return -1;
  }
  //Double check that CLOEXEC is enabled as Linux kernels < 2.6.27 may ignore the flag
  oldflags=fcntl(sock, F_GETFD, 0);
  if (oldflags<0) {
    close(sock);
    return -2;
  }
  if ((oldflags & FD_CLOEXEC)==FD_CLOEXEC) {
    //CLOEXEC is enabled, no thread locking would have been required
    return sock;
  }
  //Need to enable CLOEXEC using fcntl
  //Thread locking recommended
  result=fcntl(sock, F_SETFD, oldflags|FD_CLOEXEC);
  if (result==-1) {
    close(sock);
    return -2;
  }
  return sock;
#endif
}

moduleinfo_ver_generic_t *commonlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &commonlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CommonLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) commonlib_getmoduleinfo();
}
#endif
