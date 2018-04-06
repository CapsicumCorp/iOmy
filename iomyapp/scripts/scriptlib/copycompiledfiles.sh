# Copy files from cross compile folder into htdocs

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

# Path of cross compile
compilepath="$1"

# Path of assets tmp folder
assetstmp="$2"

if [ "${compilepath}" == "" -o "${assetstmp}" == "" ] ; then
  echo "Format: copycompiledfiles.sh <crosscompilefolder> <assetstmpfolder>"
	exit 1
fi

cd "${assetstmp}/components"
if [ $? != 0 ] ; then
  echo "Could not cd to ${assetstmp}/components"
	exit 1
fi
if [ ! -d "${compilepath}" ] ; then
  echo "Cross compile folder not found: ${compilepath}"
	exit 1
fi

# Cleanup old install
echo "Removing old binary files"
rm -fr bin/armeabi bin/armeabi/pie lib/armeabi mysql/sbin 2> /dev/null

# Create directories
echo "Creating directories"
mkdir -p bin/armeabi/pie
result=$?
mkdir -p lib/armeabi
result2=$?
if [ ${result} != 0 -o ${result2} != 0 ] ; then
  exit 1
fi
# Copy general binary files
echo "Copying general binary files"
binfiles="busybox curl ffmpeg"
for binfile in ${binfiles}; do
  cp -ai "${compilepath}/compiled/bin/${binfile}" bin/armeabi/pie/
	if [ $? != 0 ] ; then
	  exit 1
	fi
done

# Copy general library files
echo "Copying general library files"
libfiles="
libSDL-1.2.so.0
libaio.so.1
libcurl.so.5
libfreetype.so.6
libiconv.so.2
libjpeg.so.62
libmcrypt.so.4
libpng16.so.16
libxml2.so.2
libz.so.1
libpcre.so.1
libffmpeg.so
"

for library in ${libfiles}; do
  cp -i --preserve=all "${compilepath}/compiled/lib/${library}" lib/armeabi/
	if [ $? != 0 ] ; then
	  exit 1
	fi
done

# Copy ssl library files
echo "Copying openssl files"
ssllibfiles="libcrypto.so.1.0.0 libssl.so.1.0.0"
for library in ${ssllibfiles}; do
  cp -i --preserve=all "${compilepath}/compiled/usr/lib/${library}" lib/armeabi/
	if [ $? != 0 ] ; then
	  exit 1
	fi
done

# Copy lighttpd binary files
echo "Copying lighttpd binary files"
cp -ai "${compilepath}/compiled/lighttpd/sbin/lighttpd" bin/armeabi/pie/
if [ $? != 0 ] ; then
  exit 1
fi
# Copy php binary files
echo "Copying php binary files"
cp -ai "${compilepath}/compiled/php/bin/php" bin/armeabi/pie/
result1=$?
cp -ai "${compilepath}/compiled/php/bin/php-cgi" bin/armeabi/pie/
result2=$?
if [ $result1 != 0 -o $result2 != 0 ] ; then
  exit 1
fi
# Copy MySQL binary files
echo "Copying mysql binary files"

mkdir mysql/sbin
mkdir mysql/sbin/share
mkdir mysql/sbin/share/mysql

# NOTE: mysql_upgrade segfaults when it tries to run mysqlcheck so we run mysqlcheck directly
#mysqlbin="mysql mysql_upgrade mysqlcheck mysqld"
mysqlbin="mysql mysqlcheck mysqld"

for file in ${mysqlbin}; do
  cp -ai "${compilepath}/compiled/mysql_arm/bin/${file}" bin/armeabi/pie/
	if [ $? != 0 ] ; then
	  exit 1
	fi
done
cp -ai "${compilepath}/compiled/mysql_arm/share/charsets" mysql/sbin/share/
if [ $? != 0 ] ; then
  exit 1
fi
cp -ai "${compilepath}/compiled/mysql_arm/share/english" mysql/sbin/share/mysql/
if [ $? != 0 ] ; then
  exit 1
fi
# MySQL initial database
echo "Copying initial MySQL database"
cp -ai ${compilepath}/mysql/data mysql/sbin/
if [ $? != 0 ] ; then
 exit 1
fi

exit 0

