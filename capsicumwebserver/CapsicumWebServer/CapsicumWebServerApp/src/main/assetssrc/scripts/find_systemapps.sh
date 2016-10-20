#!/system/bin/sh

# Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
# Copyright: Capsicum Corporation 2016

# This file is part of Capsicum Web Server which is part of the iOmy project.

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

# Get the system path
if [ "$1" == "" ] ; then
  echo "Error: First parameter needs to be the system path"
  exit 1
fi
export systempath="$1"
shift

# First param: The variable to assign the app to
# Second param: The name of the app
# Returns 0 on success or 1 if not found
find_app() {
  APPVAR=$1
  APPNAME=$2
  # First check native as that will normally be correct
  if [ -f "${systempath}/xbin/${APPNAME}" ] ; then
    # Success
    eval export ${APPVAR}="${systempath}/xbin/${APPNAME}"
    return 0
  fi
  if [ -f "${systempath}/bin/${APPNAME}" ] ; then
    # Success
    eval export ${APPVAR}="${systempath}/bin/${APPNAME}"
    return 0
  fi
  # Next try with busybox as that normally has the most tools
  if [ "${BUSYBOX}" != "" ] ; then
    output=$(${BUSYBOX} ${APPNAME} 2>&1)
    echo "${output}" | grep "applet not found" > /dev/null 2> /dev/null
    if [ $? != 0 ] ; then
      # Success
      eval export ${APPVAR}=\"${BUSYBOX} ${APPNAME}\"
      return 0
    fi
  fi
  # Now try with toolbox as that is the next most common
  if [ "${TOOLBOX}" != "" ] ; then
    output=$(${TOOLBOX} ${APPNAME} 2>&1)
    echo "${output}" | grep "no such tool" > /dev/null 2> /dev/null
    if [ $? != 0 ] ; then
      # Success
      eval export ${APPVAR}=\"${TOOLBOX} ${APPNAME}\"
      return 0
    fi
  fi
  if [ "${TOYBOX}" != "" ] ; then
    output=$(${TOYBOX} ${APPNAME} 2>&1)
    echo "${output}" | grep "Unknown command" > /dev/null 2> /dev/null
    if [ $? != 0 ] ; then
      # Success
      eval export ${APPVAR}=\"${TOYBOX} ${APPNAME}\"
      return 0
    fi
  fi
  return 1
}

# Find a way to run all the system programs that will be needed
find_apps() {
  # First search for busybox, toolbox, and toybox tools
  if [ -f "${systempath}/xbin/toolbox" ] ; then
    export TOOLBOX="${systempath}/xbin/toolbox"
  elif [ -f "${systempath}/bin/toolbox" ] ; then
    export TOOLBOX="${systempath}/bin/toolbox"
  fi
  if [ -f "${systempath}/xbin/toybox" ] ; then
    export TOYBOX="${systempath}/xbin/toybox"
  elif [ -f "${systempath}/bin/toybox" ] ; then
    export TOYBOX="${systempath}/bin/toybox"
  fi
  if [ -f "${systempath}/xbin/busybox" ] ; then
    export BUSYBOX="${systempath}/xbin/busybox"
  elif [ -f "${systempath}/bin/busybox" ] ; then
    export BUSYBOX="${systempath}/bin/busybox"
  fi

  # Find various apps
  find_app WHOAMI whoami
  find_app SED sed
  find_app PS ps
  find_app KILL kill
  find_app SLEEP sleep

  #echo "DEBUG: whoami=${WHOAMI}"
  #echo "DEBUG: sed=${SED}"
  #echo "DEBUG: ps=${PS}"
  #echo "DEBUG: kill=${KILL}"
  #echo "DEBUG: sleep=${SLEEP}"
}

find_apps

#export USER=$(${WHOAMI})

#echo "DEBUG: Username=${USER}"

