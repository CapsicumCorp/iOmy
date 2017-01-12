# Copy phpmyadmin into htdocs

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

# Path of base assets folder
baseassetsdir="$3"

if [ "${compilepath}" == "" -o "${assetstmp}" == "" -o "${baseassetsdir}" == "" ] ; then
  echo "Format: copyphpmyadmin.sh <crosscompilefolder> <assetstmpfolder> <baseassetsfolder>"
  exit 1
fi

source ${compilepath}/package_info.sh

cd "${assetstmp}/htdocs"
if [ $? != 0 ] ; then
  echo "Could not cd to ${assetstmp}/htdocs"
	exit 1
fi

if [ ! -f "${compilepath}/download/${PHPMYADMINPKG}" ] ; then
  echo "Download ${PHPMYADMINTITLE}-${PHPMYADMINVER} to ${compilepath}/download"
  exit 1
fi

# Cleanup old install
echo "Removing old phpMyAdmin files"
rm -fr phpmyadmin 2> /dev/null

# Copy phpmyadmin files
echo "Extracting ${PHPMYADMINTITLE}-${PHPMYADMINVER} files to htdocs/phpmyadmin/"
xz -dc "${compilepath}/download/${PHPMYADMINPKG}" | tar x
if [ $? != 0 ] ; then
  exit 1
fi
mv "${PHPMYADMINCOMPILEDIR}" phpmyadmin
if [ $? != 0 ] ; then
  exit 1
fi
echo "Copying ${PHPMYADMINTITLE}-${PHPMYADMINVER} config file"
cp -ai "${baseassetsdir}/phpmyadmin_config/config.inc.php" phpmyadmin/
if [ $? != 0 ] ; then
  exit 1
fi

