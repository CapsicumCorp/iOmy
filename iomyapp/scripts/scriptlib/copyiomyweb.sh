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

# Path of iomyweb
iomywebpath="$1"

# Path of assets tmp folder
assetstmp="$2"

if [ "${iomywebpath}" == "" -o "${assetstmp}" == "" ] ; then
  echo "Format: copyiomyweb.sh <iomywebfolder> <assetstmpfolder>"
  exit 1
fi

cd "${assetstmp}/htdocs"
if [ $? != 0 ] ; then
  echo "Could not cd to ${assetstmp}/htdocs"
	exit 1
fi
if [ ! -d "${iomywebpath}" ] ; then
  echo "ioMy web folder not found: ${iomywebpath}"
	exit 1
fi

# Cleanup old install
echo "Removing old iomyweb files"
rm -fr LICENSE README iomyserver.php public restricted ui 2> /dev/null

# Copy new install
echo "Copying iomyweb files"
rsync -a --exclude restricted/config/iomy_vanilla.php_template --exclude .git "${iomywebpath}/" .
if [ $? != 0 ] ; then
  exit 1
fi

# Final tasks
echo "Initialising iomyweb config file"
truncate -s 0 restricted/config/iomy_vanilla.php
if [ $? != 0 ] ; then
  exit 1
fi

