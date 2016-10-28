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

# Path of cross compile relative to capsicumwebserver components
compilepath="../../../../../../../cross_compile_android"

basedir=$(dirname $0)

cd "${basedir}/components"
if [ $? != 0 ] ; then
  echo "Could not cd to ${basedir}/components"
	exit 1
fi
if [ ! -d "${compilepath}" ] ; then
  echo "Cross compile folder not found: ${compilepath}"
	exit 1
fi

# Cleanup old install
rm -vfr bin/armeabi/pie lib/armeabi mysql/sbin 2> /dev/null

# Copy general binary files
binfiles="curl ffmpeg ffplay"
mkdir -vp bin/armeabi/pie
for binfile in ${binfiles}; do
  cp -vi --preserve=all "${compilepath}/compiled/bin/${binfile}" bin/armeabi/pie/
done

# Copy general library files
mkdir -vp lib/armeabi

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
libffmpeg.so
"

for library in ${libfiles}; do
  cp -vi --preserve=all "${compilepath}/compiled/lib/${library}" lib/armeabi/
done

# Copy ssl library files
ssllibfiles="libcrypto.so.1.0.0 libssl.so.1.0.0"
for library in ${ssllibfiles}; do
  cp -vi --preserve=all "${compilepath}/compiled/usr/lib/${library}" lib/armeabi/
done

# Copy lighttpd binary files
cp -aiv "${compilepath}/compiled/lighttpd/sbin/lighttpd" bin/armeabi/pie/

# Copy php binary files
mkdir -v php/sbin
cp -aiv "${compilepath}/compiled/php/bin/php" bin/armeabi/pie/
cp -aiv "${compilepath}/compiled/php/bin/php-cgi" bin/armeabi/pie/

# Copy MySQL binary files
mkdir -v mysql/sbin
mkdir -v mysql/sbin/share
mkdir -v mysql/sbin/share/charsets
mkdir -v mysql/sbin/share/mysql

# NOTE: mysql_upgrade segfaults when it tries to run mysqlcheck so we run mysqlcheck directly
#mysqlbin="mysql mysql_upgrade mysqlcheck mysqld"
mysqlbin="mysql mysqlcheck mysqld"

for file in ${mysqlbin}; do
  cp -aiv "${compilepath}/compiled/mysql_arm/bin/${file}" bin/armeabi/pie/
done
cp -aiv "${compilepath}/compiled/mysql_arm/share/charsets" mysql/sbin/share/
cp -aiv "${compilepath}/compiled/mysql_arm/share/english" mysql/sbin/share/mysql/

# MySQL initial database
cp -aiv ${compilepath}/mysql/data mysql/sbin/

