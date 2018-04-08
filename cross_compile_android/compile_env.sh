#!/bin/bash

# First add a symlink: cross_compile_android -> <pathtoyourcrosscompilefolder>

# These values should be set by the caller
#ARCH="arm"
#API="9"

arch_to_bin_prefix() {
  arch=$1
  case ${arch} in
	  arm)
		  prefix="arm-linux-androideabi"
		  ;;
		arm64)
		  prefix="aarch64-linux-android"
			;;
		mips)
			prefix="mipsel-linux-android"
			;;
		mips64)
			prefix="mips64el-linux-android"
			;;
		x86)
			prefix="i686-linux-android"
			;;
		x86_64)
			prefix="x86_64-linux-android"
			;;
	esac
}

if [ "${ARCH}" == "" ] ; then
  echo "ARCH is not set"
	exit 1
fi
if [ "${API}" == "" ] ; then
  echo "API is not set"
	exit 1
fi

arch_to_bin_prefix ${ARCH}

PROJECT_BASE="/usr/local/cross_compile_android"
REPOSITORY="$PROJECT_BASE/download"
ROOTFS="$PROJECT_BASE/compiled"
TOOLCHAINDIR="${PROJECT_BASE}/toolchain_${ARCH}_${API}"

export PATH="${TOOLCHAINDIR}/bin:${PATH}"

export CROSS_PREFIX="${TOOLCHAINDIR}/${prefix}/bin/"

export SYSROOT_SYS="${TOOLCHAINDIR}/sysroot"
export SYSROOT_GLIBC="$PROJECT_BASE/glibc"
#export CC="${prefix}-gcc"
#export CXX="${prefix}-g++"
export GNUAS="${prefix}-gcc"
export AS="${prefix}-clang"
export CC="${prefix}-clang"
export CXX="${prefix}-clang++"
export RANLIB="${prefix}-ranlib"
export STRIP="${prefix}-strip"
export LD="${prefix}-ld"
export AR="${prefix}-ar"
export NM="${prefix}-nm"
#export HOST="arm-linux-androideabi"
export HOST="${arch}-none-linux-gnueabi"
export CPPFLAGS="-I${ROOTFS}/include -I${ROOTFS}/usr/include"
export LDFLAGS="-L${ROOTFS}/lib"

CFLAGS_EXTRA=""
CXXFLAGS_EXTRA=""
LDFLAGS_EXTRA=""
if [ "${CC}" != "${prefix}-clang" ] ; then
  CFLAGS_EXTRA="${CFLAGS_EXTRA} -D__ANDROID_API__=${API}"
  CXXFLAGS_EXTRA="${CXXFLAGS_EXTRA} -D__ANDROID_API__=${API}"
fi
if [ "${ARCH}" == "arm" ] ; then
  CFLAGS_EXTRA="${CFLAGS_EXTRA} -mthumb"
	CXXFLAGS_EXTRA="${CXXFLAGS_EXTRA} -mthumb"
	if [ "${CC}" == "${prefix}-clang" ] ; then
	  # gcc defaults to arm, clang defaults to armv7-a
  	LDFLAGS_EXTRA="${LDFLAGS_EXTRA} -march=armv7-a -Wl,--fix-cortex-a8"
	fi
fi

