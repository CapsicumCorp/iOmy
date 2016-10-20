------------------
Linux Instructions
------------------

autoreconf --force --install -I config -I m4
cd build
Either "../configure --enable-zigbeelib_debugwithoutdatabase --enable-debug --enable-pedantic"
Or "CC=clang CXX=clang++ ../configure --enable-zigbeelib_debugwithoutdatabase --enable-debug --enable-pedantic"

for fast compiling: CFLAGS="-g -O0" CXXFLAGS="-g -O0" ../configure --enable-zigbeelib_debugwithoutdatabase --enable-debug --enable-pedantic
make
cd src/modules
rm *so* ; cp -ai */.libs/*so* .
cd ..
./watch_inputs --modulesdir=modules

--------------------
OpenWRT Instructions
--------------------
First copy the entire watch_inputs folder into the openwrt source folder
after building openwrt
Then run "setup_configure.sh" and then run "run_make.sh"
Then in the build/src/modules directory run the following:
  cp -ai */.libs/*so* .
Then in build/src/ upload watch_inputs and modules/*so* to the wrt unit.

The resources directory contains the config file and setup scripts.

------------
Version Info
------------

The Watch Inputs version info is in watch_inputs/src/watch_inputs.h
The Android version of Watch Inputs is in WatchInputsAndroidStudio/WatchInputs/src/main/AndroidManifest.xml

