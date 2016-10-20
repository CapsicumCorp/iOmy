#!/bin/bash

# First add a symlink: <pathtoyourcrosscompilefolder> -> cross_compile_android

export PATH="/usr/local/cross_compile_android/toolchain/bin:${PATH}"
PROJECT_BASE="/usr/local/cross_compile_android"
REPOSITORY="$PROJECT_BASE/download"
ROOTFS="$PROJECT_BASE/compiled"

export CROSS_PREFIX="/usr/local/cross_compile_android/toolchain/arm-linux-androideabi/bin/"

export SYSROOT_SYS="$PROJECT_BASE/toolchain/sysroot"
export SYSROOT_GLIBC="$PROJECT_BASE/glibc"
export CC="arm-linux-androideabi-gcc"
export CXX="arm-linux-androideabi-g++"
export RANLIB="arm-linux-androideabi-ranlib"
export STRIP='arm-linux-androideabi-strip'
export LD='arm-linux-androideabi-ld'
export AR='arm-linux-androideabi-ar'
export NM='arm-linux-androideabi-nm'
#export HOST="arm-linux-androideabi"
export HOST="arm-none-linux-gnueabi"
export CPPFLAGS="-I${ROOTFS}/include -I${ROOTFS}/usr/include"
export LDFLAGS="-L${ROOTFS}/lib"

