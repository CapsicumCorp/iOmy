# Copy files from iomyweb into htdocs

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

# Path of iomyweb relative to capsicumwebserver htdocs
iomywebpath="../../../../../../../iomyweb"

basedir=$(dirname $0)

cd "${basedir}/htdocs"
if [ $? != 0 ] ; then
  echo "Could not cd to ${basedir}/htdocs"
	exit 1
fi
if [ ! -d "${iomywebpath}" ] ; then
  echo "ioMy web folder not found: ${iomywebpath}"
	exit 1
fi

# Cleanup old install
rm -vfr LICENSE README iomyserver.php public restricted ui 2> /dev/null

# Copy new install
rsync -av --stats --exclude restricted/libraries/config.php --exclude .git --exclude ui/mobile_rev01 --exclude ui/mobile/NEWOpenUI5 --exclude ui/mobile/_Old_OpenUI5 "${iomywebpath}/" .

# Final tasks
truncate -s 0 restricted/libraries/config.php

