#!/bin/bash

# Author: Matthew Stapleton <matthew@capsicumcorp.com>
# Description: Custom script to build all the NDK modules with full debug info
#   or build a module on its own

# This file is part of Watch Inputs which is part of the iOmy project.

# iOmy is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# iOmy is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

# Even though Android Studio can compile the libraries you can
#   use this to get compiler info during the compile or rapidly compile
#   a single library as Android Studio can only build all modules at once

buildwatchinputsmodule() {
  module=$1
  ./gradlew :ndk${module}:androidArmRelease --info
	if [ $? != 0 ] ; then
	  exit 1
	fi
	# Debugging
	#cp -a ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/obj/armeabi/lib${module}.so WatchInputsApp/src/main/jniLibs/armeabi/
	#if [ -f ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/obj/armeabi/libgnustl_shared.so ] ; then
	#  cp -a ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/obj/armeabi/libgnustl_shared.so WatchInputsApp/src/main/jniLibs/armeabi/
	#fi
	# Stripped
  cp -a ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/lib/armeabi/lib${module}.so WatchInputsApp/build/intermediates/binaries/release/arm/lib/armeabi/
	if [ -f ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/lib/armeabi/libgnustl_shared.so -a ! -f WatchInputsApp/build/intermediates/binaries/release/arm/lib/armeabi/libgnustl_shared.so ] ; then
	  cp -a ../watch_inputs/src/modules/${module}/build/intermediates/binaries/release/arm/lib/armeabi/libgnustl_shared.so WatchInputsApp/build/intermediates/binaries/release/arm/lib/armeabi/
	fi
}

if [ ! -d WatchInputsApp/build/intermediates/binaries/release/arm/lib/armeabi ] ; then
  # For some reason command-line gradle doesn't copy the compiled libraries to this folder like Android Studio does
  mkdir -p WatchInputsApp/build/intermediates/binaries/release/arm/lib/armeabi
fi

if [ $# -ge 1 ] ; then
  modulename=$1
  buildwatchinputsmodule ${modulename}
	exit
fi
buildwatchinputsmodule simclist
buildwatchinputsmodule debuglib
buildwatchinputsmodule commonserverlib
buildwatchinputsmodule cmdserverlib
buildwatchinputsmodule dbcounterlib
buildwatchinputsmodule configlib
buildwatchinputsmodule httpserverlib
buildwatchinputsmodule nativeseriallib
buildwatchinputsmodule xbeelib
buildwatchinputsmodule commonlib
buildwatchinputsmodule dblib
buildwatchinputsmodule rapidhalib
buildwatchinputsmodule serialportlib
buildwatchinputsmodule zigbeelib
buildwatchinputsmodule mysqllib
buildwatchinputsmodule userspaceusbserialandroidlib
buildwatchinputsmodule webapiclientlib
buildwatchinputsmodule locklib

./gradlew :ndkwatchinputs:assemble --info
if [ $? != 0 ] ; then
  exit 1
fi
cp -a ../watch_inputs/src/main/build/intermediates/binaries/release/arm/obj/armeabi/libwatch_inputs.so androidWatchInputs/build/intermediates/binaries/release/arm/lib/armeabi/

