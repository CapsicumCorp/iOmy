# Make archive files with just the binary files and MySQL initial database for archive storage

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

basedir=$(dirname $0)

cd "${basedir}"
if [ $? != 0 ] ; then
  echo "Could not cd to ${basedir}"
	exit 1
fi

datesuffix=$(date +"%Y%m%d")

# Make archive file with arm binaries
binaries=""
binaries="${binaries} components/bin/armeabi"
binaries="${binaries} components/lib/armeabi"
binaries="${binaries} components/mysql/sbin/share"

tar --owner=root --group=root -cv ${binaries} | xz -9ev > webserverarmbinaries_${datesuffix}.tar.xz

# Make archive file with architecture independent MySQL initial database
tar --owner=root --group=root -cv components/mysql/sbin/data | xz -9ev > webservermysqlinitialdatabase_${datesuffix}.tar.xz

