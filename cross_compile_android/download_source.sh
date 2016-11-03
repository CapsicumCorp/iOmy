#!/bin/bash
# Author: Matthew Stapleton <matthew@capsicumcorp.com>
# Copyright: Capsicum Corporation 2016

# This file is part of the iOmy project.

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

BASEDIR=$(dirname $0)

OVERRIDE_BASEURL=""
DOWNLOAD_NEEDS_WEBBROWSER=0

source ${BASEDIR}/download_source.cfg
source ${BASEDIR}/package_info.sh

PACKAGES="ZLIB BZIP2 OPENSSL CURL ICONV NCURSES MHASH LIBMCRYPT PCRE LIBPNG LIBJPEG READLINE LIBXML2 FREETYPE LIBAIO SDL FFMPEG LIGHTTPD PHP MYSQL BUSYBOX BUSYBOXARM BUSYBOXX86 PHPMYADMIN"

# Queue a message for output at the end of the script
MESS=""
mess() {
  MESS="${MESS}$*"
}
# Queue a list of manual download messages for output at the end of the script
DOWNLOADMESS=""
download_mess() {
  DOWNLOADMESS="${DOWNLOADMESS}$*"
}

# Get the full path of a folder
# Returns the result in FULLPATH variable
# Returns 0 on success or 1 on error
get_full_path() {
  local folder=$1
	local localfullpath

  pushd ${folder} > /dev/null 2> /dev/null
	if [ $? != 0 ] ; then
	  return 1
	fi
	localfullpath="$(pwd 2> /dev/null)"
	if [ $? != 0 ] ; then
	  return 1
	fi
  popd ${folder} > /dev/null 2> /dev/null
	if [ $? != 0 ] ; then
	  return 1
	fi
	FULLPATH="${localfullpath}"
	return 0
}

download_package() {
  PACKAGE=$1
  eval PKGTITLE=\$\{${PACKAGE}TITLE\}
  eval PKGVER=\$\{${PACKAGE}VER\}
  eval PKGPKG=\$\{${PACKAGE}PKG\}
  eval PKGBASEURL=\$\{${PACKAGE}BASEURL\}
  eval PKGNEED_WEB_BROWSER=\$\{${PACKAGE}NEED_WEB_BROWSER\}

  if [ "${OVERRIDE_BASEURL}" != "" ] ; then
	  PKGBASEURL="${OVERRIDE_BASEURL}"
	fi
  if [ "${DOWNLOAD_NEEDS_WEBBROWSER}" = 0 -a "${PKGNEED_WEB_BROWSER}" = 0 -a ${justreporturl} = 0 ] ; then
	  echo "Downloading ${PKGTITLE}-${PKGVER} from ${PKGBASEURL}${PKGPKG}"
		wget -N -c -P "${REPOSITORY}/" "${PKGBASEURL}${PKGPKG}"
		mess "${PKGPKG}\n"
	else
	  download_mess "Manually download ${PKGTITLE}-${PKGVER} from ${PKGBASEURL}${PKGPKG}\n"
	fi
}

justreporturl=0
if [ ${I_AM_READY_TO_DOWNLOAD_ALL_THE_FILES} = 0 ] ; then
  echo "Downloading all the packages may take quite a while so"
	echo "  you need to edit download_source.cfg and set I_AM_READY_TO_DOWNLOAD_ALL_THE_FILES to 1"
	echo "  as well as other variables to make sure the download settings are correct for auto download"
  justreporturl=1
fi
if [ ! -d "${REPOSITORY}" ] ; then
  # Create the download folder if it doesn't already exist
  mkdir -pv "${REPOSITORY}"
fi
get_full_path "${REPOSITORY}"
if [ $? != 0 ] ; then
  echo "Failed to get path for download folder"
	exit 1
fi
REPOSITORY="${FULLPATH}"

for PACKAGE in ${PACKAGES}; do
  download_package ${PACKAGE}
done

if [ "${MESS}" != "" ] ; then
  echo
  echo "The following files have been downloaded to the download directory: ${REPOSITORY}"
  echo
	echo -e "${MESS}"
  echo "------------------------------"
fi

if [ "${DOWNLOADMESS}" != "" ] ; then
  echo
	echo "You may need to download some files manually with a web browser."
	echo
  echo -e "${DOWNLOADMESS}"
	echo "------------------------------"
fi

