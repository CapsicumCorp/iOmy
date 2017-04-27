#!/bin/bash
# Title: compare_iomy_apks.sh
# Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
# Description: Detect new and deleted asset files from an old iOmy apk to a new iOmy apk
# Author: Matthew Stapleton <matthew@capsicumcorp.com>
# Copyright Capsicum Corp 2017
#
# This file is part of iOmy.
#
# iOmy is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# iOmy is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with iOmy. If not, see <http://www.gnu.org/licenses/>.

cleanup() {
#  rm -fr tempfolder
  rm -fr tempfolder oldfiles newfiles
}

# NOTE: rsync will even order the output so a folder create comes
#   before files create in that folder and folder delete comes after
#   files in that folder are removed
get_list_of_files() {

# Get a list of new and removed files
fileslist=$(rsync -rcvn --delete newfiles/ oldfiles/ 2> /dev/null)

# Filter out "Sending incremental... and bottom status info
fileslist2=$(echo -e "${fileslist}" | tail -n +2 | head -n -3)

#echo -e "DEBUG: List of files\n${fileslist2}"

}

old=$1
new=$2

if [ "${old}" == "" -o "${new}" == "" ] ; then
  echo "Need two parameters: <old> <new>"
	exit 1
fi
if [ -d tempfolder -o -d oldfiles -o -d newfiles ] ; then
  echo "Folders: tempfolder/ , oldfiles/ , or newfiles/ exist, remove or rename them first before running this script"
	exit 1
fi
echo "Comparing ${old} with ${new}"

# Extract assets of old
unzip -d tempfolder ${old}
if [ ! -f tempfolder/assets/webserverassets.zip ] ; then
  echo "${old} is missing webserverassets"
	cleanup
	exit 1
fi
unzip -d oldfiles tempfolder/assets/webserverassets.zip
rm -fr tempfolder

# Extract assets of new
unzip -d tempfolder ${new}
if [ ! -f tempfolder/assets/webserverassets.zip ] ; then
  echo "${new} is missing webserverassets"
	cleanup
	exit 1
fi
unzip -d newfiles tempfolder/assets/webserverassets.zip

rm -fr tempfolder

get_list_of_files

# Handle files with spaces
IFS=$'\t\n'

echo > fileslist.txt
for file in ${fileslist2}; do
  echo "${file}" | grep "^deleting " > /dev/null 2> /dev/null
  if [ $? = 0 ] ; then
    deletefile=1
    file=$(echo "${file}" | sed -e "s/^deleting //")
  else
    deletefile=0
  fi
  echo "${file}" | grep '/$' > /dev/null 2> /dev/null
  if [ $? = 0 ] ; then
    fileisfolder=1
  else
    fileisfolder=0
  fi
  if [ ${deletefile} = 1 ] ; then
    if [ ${fileisfolder} = 1 ] ; then
      echo "deletefolder ${file}" >> fileslist.txt
    else
      echo "deletefile ${file}" >> fileslist.txt
    fi
  else
    if [ ${fileisfolder} = 1 ] ; then
      echo "newfolder ${file}" >> fileslist.txt
    else
      echo "newfile ${file}" >> fileslist.txt
    fi
  fi
done

cleanup

echo "Your compare list is in fileslist.txt"

