# Take web server source assets and compile into a zip file

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
if [ -f ../assets/webserverassets.zip ] ; then
  rm -v ../assets/webserverassets.zip
fi
zip -9r ../assets/webserverassets.zip components scripts tmp var htdocs zigbeedefs.ini

numfiles=$(unzip -l ../assets/webserverassets.zip | tail -n 1 | awk '{print $2}')
echo "NUMFILES=${numfiles}" > ../assets/webserverassetsnumfiles.txt

