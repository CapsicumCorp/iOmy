#!/bin/bash

# Make a standalone NDK toolchain
# http://stackoverflow.com/questions/26902989/cross-compiling-for-arm-using-crystax-ndk

cd /home/staples/myprograms/android-ndk-r11c
./build/tools/make-standalone-toolchain.sh --toolchain=arm-linux-androideabi-4.9 --platform=android-21 --install-dir=/usr/local/cross_compile_android/toolchain

# NOTE: Compiling curl with this has a conflict between libc.a and libcrystax.a
cd /home/staples/myprograms/crystax-ndk-10.3.1
./build/tools/make-standalone-toolchain.sh --system=linux-x86_64 --toolchain=arm-linux-androideabi-5 --platform=android-21 --install-dir=/usr/local/cross_compile_android/toolchain

