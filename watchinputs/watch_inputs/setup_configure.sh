#!/bin/bash

export TOPDIR=$(pwd)/..
export PATH=${TOPDIR}/staging_dir/toolchain-mipsel_gcc-linaro_uClibc-0.9.32/bin:$PATH
export STAGING_DIR=${TOPDIR}/staging_dir/target-mipsel_uClibc-0.9.32
export CFLAGS="${CFLAGS} -I${STAGING_DIR}/usr/include"
export LDFLAGS="${LDFLAGS} -L${STAGING_DIR}/usr/lib"

pushd build

../configure --target=mipsel-openwrt-linux --host=mipsel-openwrt-linux --prefix='/usr' --localstatedir='/var' --sysconfdir='/etc' $*

popd

