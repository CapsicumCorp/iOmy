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

# Some services such as mysqld can sometimes take a long time to stop
SERVICESTOPWAITTIME=30 # How long to wait for a service to stop

# Get the system path
if [ "$1" == "" ] ; then
  echo "Error: First parameter needs to be the system path"
  exit 1
fi
export systempath="$1"
shift

# Get the storage path
if [ "$1" == "" ] ; then
  echo "Error: Second parameter needs to be the storage path"
  exit 1
fi
export app="$1"
shift
export sbin="${app}/components"

#source ${app}/scripts/find_systemapps.sh ${systempath} > /dev/null 2> /dev/null

abi="armeabi"
pie="pie"

WHOAMI="${sbin}/bin/${abi}/busybox whoami"
SED="${sbin}/bin/${abi}/busybox sed"
PS="${sbin}/bin/${abi}/busybox ps"
KILL="${sbin}/bin/${abi}/busybox kill"
SLEEP="${sbin}/bin/${abi}/busybox sleep"

USER=$(${WHOAMI})

# Prioritise local libraries over system libraries
export LD_LIBRARY_PATH="${sbin}/lib/${abi}"

lighttpdpidfile="${app}/var/run/lighttpd.pid"
phppidfile="${app}/var/run/php.pid"
mysqldpidfile="${app}/var/run/mysqld.pid"

lighttpdlogfile="${app}/var/log/lighttpd.log"
phperrorlogfile="${app}/var/log/php_error.log"
mysqllogfile="${app}/var/log/mysql.log"

# Args: webport server name
template_to_conf_lighttpd() {
  #if [ -f "${sbin}/lighttpd/conf/lighttpd.conf" ] ; then
  #  #echo "lighttpd.conf has already been generated"
  #  return
  #fi
  if [ "$1" == "" ] ; then
    webport="8080"
  else
    webport="$1"
		shift
  fi
  servername=$*

  cat "${sbin}/etc/lighttpd/lighttpd.conf.template" | ${SED} "s_%datafolder%_${app}_" | ${SED} "s_%docfolder%_${app}_" | ${SED} "s_%webport%_${webport}_" | ${SED} "s_%servername%_${servername}_" > "${sbin}/etc/lighttpd/lighttpd.conf"
}

# Args: docpath webport server name
template_to_conf_lighttpd_with_docpath() {
  #if [ -f "${sbin}/lighttpd/conf/lighttpd.conf" ] ; then
  #  #echo "lighttpd.conf has already been generated"
  #  return
  #fi
  if [ "$1" == "" ] ; then
    docpath="${app}"
  else
    docpath="$1"
		shift
  fi
  if [ "$1" == "" ] ; then
    webport="8080"
  else
    webport="$1"
		shift
  fi
  servername=$*

  cat "${sbin}/etc/lighttpd/lighttpd.conf.template" | ${SED} "s_%datafolder%_${app}_" | ${SED} "s_%docfolder%_${docpath}_" | ${SED} "s_%webport%_${webport}_" | ${SED} "s_%servername%_${servername}_" > "${sbin}/etc/lighttpd/lighttpd.conf"
}

# Args: datapath ram timezone
template_to_conf_php() {
  #if [ -f "${sbin}/php/conf/php.ini" ] ; then
  #  #echo "php.ini has already been generated"
  #  return
  #fi
  if [ "$1" == "" ] ; then
    phpram="128M"
  else
    phpram="$1"
		shift
  fi
  if [ "$1" == "" ] ; then
    phptimezone="Australia/Brisbane"
  else
    phptimezone="$1"
		shift
  fi
  cat "${sbin}/etc/php/php.ini.template" | ${SED} "s_%datafolder%_${app}_" | ${SED} "s_%phpram%_${phpram}_" | ${SED} "s_%phptimezone%_${phptimezone}_" > "${sbin}/etc/php/php.ini"
}

# Args: mysqlport
template_to_conf_mysql() {
  #if [ -f "${sbin}/mysql/conf/mysql.ini" ] ; then
  #  #echo "mysql.ini has already been generated"
  #  return
  #fi
  if [ "$1" == "" ] ; then
    mysqlport="3306"
  else
    mysqlport="$1"
		shift
  fi
  if [ "$1" == "" ] ; then
    databaselocation="${app}"
  else
    databaselocation="$1"
    shift
  fi
  cat "${sbin}/etc/mysql/mysql.ini.template" | ${SED} "s_%datafolder%_${app}_" | ${SED} "s_%databasefolder%_${databaselocation}_" | ${SED} "s_%mysqlport%_${mysqlport}_" > "${sbin}/etc/mysql/mysql.ini"
}

# Args: <none>
template_hostname_to_webfiles() {
  # Get the hostname
  thehostname=$(getprop net.hostname)
  if [ "${thehostname}" == "" ] ; then
    # Hostname not available
    return 1
  fi
  ${SED} -i "s_%hostname%_${thehostname}_" ${app}/htdocs/ui/mobile/index.html
  ${SED} -i "s_%hostname%_${thehostname}_" ${app}/htdocs/ui/mobile/util/common.js
  ${SED} -i "s_%hostname%_${thehostname}_" ${app}/htdocs/ui/mobile/opa5test/test.html

  return 0
}

# Returns 0 if running or 1 if not running
is_running() {
  # Check if app is running or not
  local thepid
  local appname=$1
  local pidfile=$2
  if [ -f ${pidfile} ] ; then
    thepid=$(cat "${pidfile}")
		if [ "${thepid}" = "" ] ; then
		  #echo "${appname} is not currently running"
		  return 1
		fi
		if [ -d /proc/${thepid} ] ; then
      #echo "${appname} is currently running"
      return 0
    fi
  fi
  return 1
}

is_running_lighttpd() {
  is_running lighttpd ${lighttpdpidfile}
  return $?
}

is_running_php() {
  is_running php ${phppidfile}
  return $?
}

is_running_mysql() {
  is_running mysqld ${mysqldpidfile}
	return $?
}

is_running_mysql_with_sock() {
  is_running mysqld ${mysqldpidfile}
	result=$?
  if [ $result = 0 ] ; then
    if [ ! -S "${app}/var/run/mysql.sock" ] ; then
      # MySQL isn't fully running until the socket is up
      result=1
    fi
	fi
  return $result
}

start_all() {
  start_lighttpd
  start_php
  start_mysql
}

start_lighttpd() {
  # First make sure lighttpd isn't already running
  is_running_lighttpd
  if [ $? = 0 ] ; then
    return
  fi
  # Remove old log before starting lighttpd so it doesn't get too big
  rm "${lighttpdlogfile}" 2> /dev/null

  #echo "Starting lighttpd"
  output=$(${sbin}/bin/${abi}/${pie}/lighttpd -f $sbin/etc/lighttpd/lighttpd.conf 2>&1)
}

start_php() {
  # First make sure php isn't already running
  is_running_php
  if [ $? = 0 ] ; then
    return
  fi
  # Remove old logs before starting php so they don't get too big
  rm "${phperrorlogfile}" 2> /dev/null

  #echo "Starting php"
  $sbin/bin/${abi}/${pie}/php-cgi -b $app/var/run/php.sock -c $sbin/etc/php > /dev/null 2> /dev/null & PID_PHP=$!
  echo ${PID_PHP} > "${phppidfile}"
}

start_mysql() {
  # First make sure mysql isn't already running
  is_running_mysql
  if [ $? = 0 ] ; then
    return
  fi
  # Remove old log before starting mysql so it doesn't get too big
  rm "${mysqllogfile}" 2> /dev/null

  #echo "Starting mysql"
  $sbin/bin/${abi}/${pie}/mysqld --defaults-file=$sbin/etc/mysql/mysql.ini --user=${USER} --language=$sbin/mysql/sbin/share/mysql/english > /dev/null 2> /dev/null & PID_MYSQL=$!
  echo ${PID_MYSQL} > "${mysqldpidfile}"

#  wait_mysql_started
}

prestop_lighttpd() {
  if [ ! -f ${lighttpdpidfile} ] ; then
    # Assume that lighttpd isn't running
    #echo "No pid for lighttpd found"
    waitlighttpd=0
    return 0
  else
    thelighttpdpid=$(cat "${lighttpdpidfile}")
    is_running_lighttpd
    if [ $? = 0 ] ; then
      #echo "Stopping lighttpd"
      ${KILL} ${thelighttpdpid}
      waitlighttpd=1
      displayedlighttpdstopped=0
      let numwaitservices++
      return 1
    else
      #echo "lighttpd isn't running"
      rm "${lighttpdpidfile}" 2> /dev/null
      waitlighttpd=0
      return 0
    fi
  fi
}

prestop_php() {
  if [ ! -f "${phppidfile}" ] ; then
    # Assume that php isn't running
    #echo "No pid for php found"
    waitphp=0
    return 0
  else
    thephppid=$(cat "${phppidfile}")
		is_running_php
    if [ $? = 0 ] ; then
      #echo "Stopping php"
      ${KILL} ${thephppid}
      waitphp=1
      displayedphpstopped=0
      let numwaitservices++
      return 1
    else
      #echo "php isn't running"
      rm "${phppidfile}" 2> /dev/null
      waitphp=0
      return 0
    fi
  fi
}

prestop_mysql() {
  if [ ! -f "${mysqldpidfile}" ] ; then
    # Assume that mysqld isn't running
    #echo "No pid for mysqld found"
    waitmysql=0
    return 0
  else
    themysqlpid=$(cat "${mysqldpidfile}")
		is_running_mysql
    if [ $? = 0 ] ; then
      #echo "Stopping mysql"
      ${KILL} ${themysqlpid}
      waitmysql=1
      displayedmysqlstopped=0
      let numwaitservices++
      return 1
    else
      #echo "mysql isn't running"
      rm "${mysqldpidfile}" 2> /dev/null
      waitmysql=0
      return 0
    fi
  fi
}

# Stop all services in parallel
stop_all() {
  numwaitservices=0
  prestop_lighttpd
  prestop_php
  prestop_mysql
  # Wait for services to stop
  cnt=0
  while [ ${cnt} -lt ${SERVICESTOPWAITTIME} ] ; do
    stopped=0
    if [ ${waitlighttpd} = 1 ] ; then
      is_running_lighttpd
      if [ $? != 0 ] ; then
        if [ ${displayedlighttpdstopped} = 0 ] ; then
          #echo "lighttpd has stopped"
          displayedlighttpdstopped=1
        fi
        rm "${lighttpdpidfile}" 2> /dev/null
        let stopped++
      fi
    fi
    if [ ${waitphp} = 1 ] ; then
      is_running_php
      if [ $? != 0 ] ; then
        if [ ${displayedphpstopped} = 0 ] ; then
          #echo "php has stopped"
          displayedphpstopped=1
        fi
        rm "${phppidfile}" 2> /dev/null
        let stopped++
      fi
    fi
    if [ ${waitmysql} = 1 ] ; then
      is_running_mysql
      if [ $? != 0 ] ; then
        if [ ${displayedmysqlstopped} = 0 ] ; then
          #echo "mysqld has stopped"
          displayedmysqlstopped=1
        fi
        rm "${mysqldpidfile}" 2> /dev/null
        let stopped++
      fi
    fi
    if [ ${stopped} -ge ${numwaitservices} ] ; then
      break
    fi
    ${SLEEP} 1
    let cnt++
  done
  # If any services are still running force kill them here
  if [ ${waitlighttpd} = 1 ] ; then
    is_running_lighttpd
    if [ $? != 0 -a -f "${lighttpdpidfile}" ] ; then
      #echo "Force killing lighttpd"
      ${KILL} -9 ${thelighttpdpid}
    fi
  fi
  if [ ${waitphp} = 1 ] ; then
    is_running_php
    if [ $? != 0 -a -f "${phppidfile}" ] ; then
      #echo "Force killing php"
      ${KILL} -9 ${thephppid}
    fi
  fi
  if [ ${waitmysql} = 1 ] ; then
    is_running_mysql
    if [ $? != 0 -a -f "${mysqldpidfile}" ] ; then
      #echo "Force killing mysql"
      ${KILL} -9 ${themysqlpid}
    fi
  fi
}

stop_lighttpd() {
  prestop_lighttpd
  if [ $? = 0 ] ; then
    return
  fi
  # Wait for lighttpd to stop
  cnt=0
  while [ ${cnt} -lt ${SERVICESTOPWAITTIME} ] ; do
    is_running_lighttpd
    if [ $? != 0 ] ; then
      #echo "lighttpd has stopped"
      rm "${lighttpdpidfile}" 2> /dev/null
      break
    fi
    ${SLEEP} 1
    let cnt++
  done
  # If any services are still running force kill them here
  if [ ${waitlighttpd} = 1 ] ; then
    is_running_lighttpd
    if [ $? != 0 -a -f "${lighttpdpidfile}" ] ; then
      #echo "Force killing lighttpd"
      ${KILL} -9 ${thelighttpdpid}
    fi
  fi
}

stop_php() {
  prestop_php
  if [ $? = 0 ] ; then
    return
  fi
  # Wait for php to stop
  cnt=0
  while [ ${cnt} -lt ${SERVICESTOPWAITTIME} ] ; do
    is_running_php
    if [ $? != 0 ] ; then
      #echo "php has stopped"
      rm "${phppidfile}" 2> /dev/null
      break
    fi
    ${SLEEP} 1
    let cnt++
  done
  if [ ${waitphp} = 1 ] ; then
    is_running_php
    if [ $? != 0 -a -f "${phppidfile}" ] ; then
      #echo "Force killing php"
      ${KILL} -9 ${thephppid}
    fi
  fi
}

stop_mysql() {
  prestop_mysql
  if [ $? = 0 ] ; then
    return
  fi
  # Wait for mysqld to stop
  cnt=0
  while [ ${cnt} -lt ${SERVICESTOPWAITTIME} ] ; do
    is_running_mysql
    if [ $? != 0 ] ; then
      #echo "mysqld has stopped"
      rm "${mysqldpidfile}" 2> /dev/null
      break
    fi
    ${SLEEP} 1
    let cnt++
  done
  if [ ${waitmysql} = 1 ] ; then
    is_running_mysql
    if [ $? != 0 -a -f "${mysqldpidfile}" ] ; then
      #echo "Force killing mysql"
      ${KILL} -9 ${themysqlpid}
    fi
  fi
}

# Wait for mysql to finish starting
wait_mysql_started() {
  # Wait for mysql to finish starting
  #echo "$(date)Waiting for mysql to finish starting"
  cnt=0
  while [ ! -S "${app}/var/run/mysql.sock" -a ${cnt} -lt 20 ] ; do
    ${SLEEP} 1
    let cnt++
  done
}

# Only needed if you don't do this as part of the assets package process
bootstrap_mysql() {
  if [ ! -f "${app}/mysqlbootstrapped" ] ; then
    wait_mysql_started
    #echo "$(date)Running extra mysql import"
    $sbin/bin/${abi}/${pie}/mysql --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot mysql < "$sbin/mysql/extra_bootstrap.sql" > /dev/null 2> /dev/null
    if [ $? != 0 ] ; then
      return 1
    fi
    $sbin/bin/${abi}/${pie}/mysql --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot mysql < "$sbin/mysql/extra2_bootstrap.sql" > /dev/null 2> /dev/null
    if [ $? != 0 ] ; then
      return 1
    fi
    touch "${app}/mysqlbootstrapped"
  fi
}

mysql_sqlcommand() {
  wait_mysql_started
  sql=$*
  $sbin/bin/${abi}/${pie}/mysql --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot -e "$sql" > /dev/null 2> /dev/null
}

mysql_check() {
  wait_mysql_started
	dbpassword=$1
	if [ "${dbpassword}" == "" ] ; then
    $sbin/bin/${abi}/${pie}/mysqlcheck --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot --all-databases --auto-repair #> /dev/null 2> /dev/null
	else
	  $sbin/bin/${abi}/${pie}/mysqlcheck --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot -p"${dbpassword}" --all-databases --auto-repair # > /dev/null 2> /dev/null
	fi
}

# Run this when MySQL is updated
# NOTE: mysql_upgrade segfaults when it tries to run mysqlcheck so we run mysqlcheck directly
mysql_upgrade() {
  wait_mysql_started
	dbpassword=$1
	if [ "${dbpassword}" == "" ] ; then
    $sbin/bin/${abi}/${pie}/mysqlcheck --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot -A -g -A --auto-repair > /dev/null 2> /dev/null
  else
    $sbin/bin/${abi}/${pie}/mysqlcheck --defaults-file=$sbin/etc/mysql/mysql.ini -hlocalhost -uroot -p"${dbpassword}" -A -g -A --auto-repair > /dev/null 2> /dev/null
  fi
  # Now restart mysql as the upgrade may have changed some things
  stop_mysql
  start_mysql
}

if [ "$1" == "" ] ; then
  echo "Third parameter needs to be the function to call"
  exit 1
fi
func=$1
shift

${func} $*

exit $?
