#!/bin/bash

curdir=$(pwd)
echo "${curdir}" | grep 'build$' > /dev/null 2> /dev/null
if [ $? != 0 ] ; then
  echo "You must build the code from the build directory"
  exit 1
fi
make clean
../configure
make

