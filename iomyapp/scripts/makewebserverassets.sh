# Take web server source assets and compile into a zip file

# Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
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

basedir=$(dirname $0)

cd "${basedir}"
if [ $? != 0 ] ; then
  echo "Could not cd to ${basedir}"
	exit 1
fi
basedir=$(pwd)

baseassetsdir="${basedir}/../../capsicumwebserver/CapsicumWebServer/CapsicumWebServerApp/src/main/assetssrc"
watchinputspath="${basedir}/../../watchinputs"
destassetsdir="${basedir}/../app/src/main/assets/"

if [ ! -d "${baseassetsdir}" ] ; then
  echo "Missing base assets directory: ${baseassetsdir}"
	exit 1
fi
if [ "$1" = "binary" ] ; then
  usebinary=1
elif [ "$1" = "source" ] ; then
  usebinary=0
else
  echo "Format: makewebserverassets.sh <binary/source>"
	echo "binary: Build assets from web server binary files"
	echo "source: Build assets from web server cross compiled files"
	exit 1
fi
if [ ! -d "${destassetsdir}" ] ; then
  echo "Creating destination assets directory: ${destassetsdir}"
	mkdir -p "${destassetsdir}"
	if [ $? != 0 ] ; then
	  exit 1
	fi
fi
# Check if a webserver asset file already exists
if [ -f "${destassetsdir}/webserverassets.zip" ] ; then
  echo "Destination asset file: ${destassetsdir}/webserverassets.zip already exists"
	echo "Type YES to overwrite"
	read userinput
	if [ "${userinput}" != "YES" ] ; then
	  exit 1
	fi
fi
if [ -d "assetstmp" ] ; then
  # Clear current assetstmp folder
	echo "Removing directory: assetstmp"
  rm -fr assetstmp
	if [ $? != 0 ] ; then
	  exit 1
	fi
fi
if [ ! -d "assetstmp" ] ; then
  # Make a new temp folder for assets
	echo "Creating directory: assetstmp"
	mkdir assetstmp
	if [ $? != 0 ] ; then
	  echo "Failed to create directory: ${basedir}/assetstmp"
		exit 1
	fi
fi

# Copy base assets files
echo "Copying base assets files"
basefiles="components scripts tmp var htdocs"
for afile in ${basefiles}; do
  cp -ai --preserve=all "${baseassetsdir}/${afile}" "assetstmp/"
	if [ $? != 0 ] ; then
	  exit 1
	fi
done

if [ ${usebinary} = 0 ] ; then
  # Copy the binary assets from the cross compile folder
	echo "Copying binary assets from cross compile folder"
  bash ${basedir}/scriptlib/copycompiledfiles.sh "${basedir}/../../cross_compile_android" "${basedir}/assetstmp"
	if [ $? != 0 ] ; then
	  echo "Error running ${basedir}/copycompiledfiles.sh"
		exit 1
	fi
	# Copy the phpMyAdmin files from the cross compile folder
	echo "Copying phpMyAdmin files from the cross compile folder"
	bash ${basedir}/scriptlib/copyphpmyadmin.sh "${basedir}/../../cross_compile_android" "${basedir}/assetstmp" "${baseassetsdir}"
	if [ $? != 0 ] ; then
	  echo "Error running ${basedir}/copyphpmyadmin.sh"
		exit 1
	fi
else
  source "${basedir}/package_info.sh"
	downloadfiles="WEBSERVER DATABASE PHPMYADMIN"
	for pkg in ${downloadfiles}; do
	  eval PKGTITLE=\$\{${pkg}TITLE\}
		eval PKGVER=\$\{${pkg}VER\}
		eval PKGPKG=\$\{${pkg}PKG\}
    if [ ! -f "${basedir}/download/${PKGPKG}" ] ; then
		  echo "You need to download package: ${PKGTITLE}-${PKGVER} with the download_binaries.sh script"
			exit 1
		fi
	done
	echo "Changing to temp assets directory"
	cd "${basedir}/assetstmp"
	if [ $? != 0 ] ; then
    exit 1
	fi
	echo "Extracting binary assets from ${WEBSERVERTITLE}-${WEBSERVERVER}"
  xz -dc "${basedir}/download/${WEBSERVERPKG}" | tar x
	if [ $? != 0 ] ; then
	  exit 1
	fi
	echo "Extracting MySQL initial database from ${DATABASETITLE}-${DATABASEVER}"
	xz -dc "${basedir}/download/${DATABASEPKG}" | tar x
	if [ $? != 0 ] ; then
	  exit 1
	fi
fi

source "${basedir}/package_info.sh"

echo "Changing to temp assets directory"
cd "${basedir}/assetstmp"
if [ -f "${basedir}/download/${DEMODATABASEPKG}" ] ; then
  echo "Extracting MySQL demo database from ${DEMODATABASETITLE}-${DEMODATABASEVER}"
	xz -dc "${basedir}/download/${DEMODATABASEPKG}" | tar x
	if [ $? != 0 ] ; then
	  exit 1
	fi
fi

# Copy the iomyweb files from the iomyweb folder
echo "Copying iomyweb files from the iomyweb folder"
bash ${basedir}/scriptlib/copyiomyweb.sh "${basedir}/../../iomyweb" "${basedir}/assetstmp"
if [ $? != 0 ] ; then
  exit 1
fi

# Copy the zigbeedefs.ini file
echo "Copying zigbeedefs.ini file from the watch inputs folder"
cp -ai "${watchinputspath}/watch_inputs/resources/zigbeedefs.ini" "${basedir}/assetstmp/"
if [ $? != 0 ] ; then
  exit 1
fi

if [ -f "${destassetsdir}/webserverassets.zip" ] ; then
  echo "Removing ${destassetsdir}/webserverassets.zip"
	rm "${destassetsdir}/webserverassets.zip"
	if [ $? != 0 ] ; then
	  exit 1
	fi
fi
echo "Creating webserverassets.zip"

cd "${basedir}/assetstmp"
if [ $? != 0 ] ; then
  exit 1
fi
zip -9r "${destassetsdir}/webserverassets.zip" components scripts tmp var htdocs zigbeedefs.ini
if [ $? != 0 ] ; then
  exit 1
fi
echo "Creating webserverassetsnumfiles.txt"
numfiles=$(unzip -l "${destassetsdir}/webserverassets.zip" | tail -n 1 | awk '{print $2}')
if [ $? != 0 ] ; then
  exit 1
fi
echo "NUMFILES=${numfiles}" > "${destassetsdir}/webserverassetsnumfiles.txt"
if [ $? != 0 ] ; then
  exit 1
fi
echo "Success"

exit 0

