#!/system/bin/sh

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

# Some code copied from DroidPHP: https://github.com/DroidPHP/DroidPHP

# DroidPHP is licensed under the <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0 (the "License");</a>.

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is furnished
# to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

# Arguments: <apppathname>

# Get the storage path from the first parameter
if [ "$1" == "" ] ; then
  echo "Error: First parameter needs to be the storage path"
	exit 1
fi
export app="$1"
shift
export sbin="${app}/components"

# Set app permissions so can execute the programs
chmod 0755 $sbin/bin/armeabi/*
chmod 0755 $sbin/bin/armeabi/pie/* 2>/dev/null
chmod 0755 $app/scripts/manage_services.sh 2> /dev/null
chmod 0755 $app/scripts/run_ffmpeg.sh 2> /dev/null

