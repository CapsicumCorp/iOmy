# Title: Configure Script for Watch Inputs
# Author: Matthew Stapleton (Capsicum Corp) <matthew@capsicumcorp.com>
# Copyright: Capsicum Corporation 2007-2016

# This file is part of Watch Inputs which is part of the iOmy project.

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

AC_INIT([watch_inputs], [0.6.0])

AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_AUX_DIR(config)
AC_CONFIG_SRCDIR(src/main/watch_inputs.c)

# -Werror: All automake warnings should be output as errors
# foreign: Don't require the extra GNU files: ChangeLog, AUTHORS, etc
AM_INIT_AUTOMAKE([subdir-objects -Wall -Werror foreign])

AC_CONFIG_HEADERS([src/config.h])

# Check for programs.
# NOTE: Newer versions of autoconf need an entry to define the ar program properly
m4_ifdef([AM_PROG_AR], [AM_PROG_AR]) 
AC_PROG_CC
AC_PROG_CXX
dnl AC_DISABLE_STATIC
LT_INIT

# Checks for required libraries.
AC_CHECK_LIB([pthread], [pthread_create], [LIBPTHREAD=true], [], [])
AS_IF([test "x$LIBPTHREAD" = "xtrue"], [
  AC_CHECK_HEADERS([pthread.h], [], AC_MSG_ERROR([Missing support for pthread]))
])

AC_CHECK_LIB([dl], [dlopen], [LIBDL=true], [], [])
AS_IF([test "x$LIBDL" = "xtrue"], [
  AC_CHECK_HEADERS([dlfcn.h], [], AC_MSG_ERROR([Missing support for dlopen required by watch_inputs.c and mainlib.c]))
])

# NOTE: Requiring at least Boost 1.56 as it has some important fixes to the Atomic and Asio libraries
# Boost >= 1.49 is required for steady timer support in Asio
BOOST_REQUIRE([1.56])
BOOST_THREAD([mt])
BOOST_ASIO([mt])
BOOST_CHRONO([mt])
BOOST_FILESYSTEM([mt])
BOOST_STATICASSERT()

# These are needed for base64 encode and decode
BOOST_FIND_HEADER([boost/atomic/atomic.hpp])
BOOST_FIND_HEADER([boost/archive/iterators/base64_from_binary.hpp])
BOOST_FIND_HEADER([boost/archive/iterators/binary_from_base64.hpp])
BOOST_FIND_HEADER([boost/archive/iterators/transform_width.hpp])
BOOST_FIND_HEADER([boost/archive/iterators/remove_whitespace.hpp])

BOOST_FIND_HEADER([boost/property_tree/ptree.hpp])
BOOST_FIND_HEADER([boost/property_tree/json_parser.hpp])

BOOST_FIND_HEADER([boost/filesystem/path.hpp])

# optional libraries and functions
AC_CHECK_FUNCS([accept4], [], [])

# Plugin options
AC_ARG_ENABLE([mysql-plugin], AS_HELP_STRING([--disable-mysql-plugin], [Build without MySQL plugin]), [], [enable_mysql_plugin=yes])
AS_IF([test "x$enable_mysql_plugin" != xno], [
  # MySQL client
	WITH_MYSQL()
	MYSQL_USE_CLIENT_API()
	MYSQL_NEED_VERSION([5.0.0])
	MYSQLPLUGIN=true
])

# Checks for required headers

AC_CHECK_HEADERS([fcntl.h signal.h getopt.h unistd.h sys/types.h sys/stat.h errno.h time.h sys/time.h sys/socket.h arpa/inet.h netinet/in.h endian.h], [], AC_MSG_ERROR([Missing header files required by main plugins]))

# Checks for optional headers
AC_CHECK_HEADERS([linux/serial.h], [ADVSERDETECT=true])

# Checks for typedefs, structures, and compiler characteristics.
dnl AC_CHECK_TYPE(ssize_t, int)

#AC_TYPE_INT8_T

# Custom parameters
AC_ARG_ENABLE([debug], AS_HELP_STRING([--enable-debug], [Build with debugging]), [debug=true])
AC_ARG_ENABLE([pedantic], AS_HELP_STRING([--enable-pedantic], [Build with pedantic compiler option]), [pedantic=true])
AC_ARG_ENABLE([rapidhalib_lockdebug], AS_HELP_STRING([--enable-rapidhalib_lockdebug], [Build with rapidhalib lock debugging]), [rapidhalib_lockdebug=true])
AC_ARG_ENABLE([rapidhalib_moredebug], AS_HELP_STRING([--enable-rapidhalib_moredebug], [Build with rapidhalib more debugging]), [rapidhalib_moredebug=true])
AC_ARG_ENABLE([xbeelib_lockdebug], AS_HELP_STRING([--enable-xbeelib_lockdebug], [Build with xbeelib lock debugging]), [xbeelib_lockdebug=true])
AC_ARG_ENABLE([xbeelib_moredebug], AS_HELP_STRING([--enable-xbeelib_moredebug], [Build with xbeelib more debugging]), [xbeelib_moredebug=true])
AC_ARG_ENABLE([tizigbeelib_lockdebug], AS_HELP_STRING([--enable-tizigbeelib_lockdebug], [Build with tizigbeelib lock debugging]), [tizigbeelib_lockdebug=true])
AC_ARG_ENABLE([tizigbeelib_moredebug], AS_HELP_STRING([--enable-tizigbeelib_moredebug], [Build with tizigbeelib more debugging]), [tizigbeelib_moredebug=true])
AC_ARG_ENABLE([zigbeelib_lockdebug], AS_HELP_STRING([--enable-zigbeelib_lockdebug], [Build with zigbeelib lock debugging]), [zigbeelib_lockdebug=true])
AC_ARG_ENABLE([zigbeelib_moredebug], AS_HELP_STRING([--enable-zigbeelib_moredebug], [Build with zigbeelib more debugging]), [zigbeelib_moredebug=true])
AC_ARG_ENABLE([zigbeelib_senddebug], AS_HELP_STRING([--enable-zigbeelib_senddebug], [Build with zigbeelib send debugging]), [zigbeelib_senddebug=true])
AC_ARG_ENABLE([zigbeelib_debugwithoutdatabase], AS_HELP_STRING([--enable-zigbeelib_debugwithoutdatabase], [Allow zigbeelib to start Zigbee monitoring without a database]), [zigbeelib_debugwithoutdatabase=true])
AC_ARG_ENABLE([locklib_lockdebug], AS_HELP_STRING([--enable-locklib_lockdebug], [Build with locklib lock debugging]), [locklib_lockdebug=true])
AC_ARG_ENABLE([ruleslib_lockdebug], AS_HELP_STRING([--enable-ruleslib_lockdebug], [Build with ruleslib lock debugging]), [ruleslib_lockdebug=true])
AC_ARG_ENABLE([ruleslib_moredebug], AS_HELP_STRING([--enable-ruleslib_moredebug], [Build with ruleslib more debugging]), [ruleslib_moredebug=true])
AC_ARG_ENABLE([cameralib_lockdebug], AS_HELP_STRING([--enable-cameralib_lockdebug], [Build with cameralib lock debugging]), [cameralib_lockdebug=true])
AC_ARG_ENABLE([cameralib_moredebug], AS_HELP_STRING([--enable-cameralib_moredebug], [Build with cameralib more debugging]), [cameralib_moredebug=true])

# Custom Messages
AS_IF([test "x$MYSQLPLUGIN" = xtrue], [
  AC_MSG_RESULT([MySQL plugin: enabled])
], [
  AC_MSG_RESULT([MySQL plugin: disabled])
])
AS_IF([test "x$debug" = xtrue], [
  AC_MSG_RESULT([Debugging: enabled])
], [
  AC_MSG_RESULT([Debugging: disabled])
])
AS_IF([test "x$pedantic" = xtrue], [
  AC_MSG_RESULT([Pedantic: enabled])
], [
  AC_MSG_RESULT([Pedantic: disabled])
])
AS_IF([test "x$rapidhalib_lockdebug" = xtrue], [
  AC_MSG_RESULT([rapidhalib lock debugging: enabled])
], [
  AC_MSG_RESULT([rapidhalib lock debugging: disabled])
])
AS_IF([test "x$rapidhalib_moredebug" = xtrue], [
  AC_MSG_RESULT([rapidhalib more debugging: enabled])
], [
  AC_MSG_RESULT([rapidhalib more debugging: disabled])
])
AS_IF([test "x$xbeelib_lockdebug" = xtrue], [
  AC_MSG_RESULT([xbeelib lock debugging: enabled])
], [
  AC_MSG_RESULT([xbeelib lock debugging: disabled])
])
AS_IF([test "x$xbeelib_moredebug" = xtrue], [
  AC_MSG_RESULT([xbeelib more debugging: enabled])
], [
  AC_MSG_RESULT([xbeelib more debugging: disabled])
])

AS_IF([test "x$tizigbeelib_lockdebug" = xtrue], [
  AC_MSG_RESULT([tizigbeelib lock debugging: enabled])
], [
  AC_MSG_RESULT([tizigbeelib lock debugging: disabled])
])
AS_IF([test "x$tizigbeelib_moredebug" = xtrue], [
  AC_MSG_RESULT([tizigbeelib more debugging: enabled])
], [
  AC_MSG_RESULT([tizigbeelib more debugging: disabled])
])

AS_IF([test "x$zigbeelib_lockdebug" = xtrue], [
  AC_MSG_RESULT([zigbeelib lock debugging: enabled])
], [
  AC_MSG_RESULT([zigbeelib lock debugging: disabled])
])
AS_IF([test "x$zigbeelib_moredebug" = xtrue], [
  AC_MSG_RESULT([zigbeelib more debugging: enabled])
], [
  AC_MSG_RESULT([zigbeelib more debugging: disabled])
])
AS_IF([test "x$zigbeelib_senddebug" = xtrue], [
  AC_MSG_RESULT([zigbeelib send debugging: enabled])
], [
  AC_MSG_RESULT([zigbeelib send debugging: disabled])
])
AS_IF([test "x$zigbeelib_debugwithoutdatabase" = xtrue], [
  AC_MSG_RESULT([zigbeelib debugging without database: enabled])
], [
  AC_MSG_RESULT([zigbeelib debugging without database: disabled])
])

AS_IF([test "x$locklib_lockdebug" = xtrue], [
  AC_MSG_RESULT([locklib lock debugging: enabled])
], [
  AC_MSG_RESULT([locklib lock debugging: disabled])
])

AS_IF([test "x$ruleslib_lockdebug" = xtrue], [
  AC_MSG_RESULT([ruleslib lock debugging: enabled])
], [
  AC_MSG_RESULT([ruleslib lock debugging: disabled])
])
AS_IF([test "x$ruleslib_moredebug" = xtrue], [
  AC_MSG_RESULT([ruleslib more debugging: enabled])
], [
  AC_MSG_RESULT([ruleslib more debugging: disabled])
])

AS_IF([test "x$cameralib_lockdebug" = xtrue], [
  AC_MSG_RESULT([cameralib lock debugging: enabled])
], [
  AC_MSG_RESULT([cameralib lock debugging: disabled])
])
AS_IF([test "x$cameralib_moredebug" = xtrue], [
  AC_MSG_RESULT([cameralib more debugging: enabled])
], [
  AC_MSG_RESULT([cameralib more debugging: disabled])
])

AS_IF([test "x$ADVSERDETECT" != "xtrue"], [
  AC_MSG_WARN([Advanced serial port detection isn't available.  This allows the serial library to detect device files that aren't real serial ports.  Without it all serial device files will be opened even if they aren't mapped to a serial port.])
])

# 3rd party libraries to link to if available
AM_CONDITIONAL([LINK_LIBDL], [test x$LIBDL = xtrue])
AM_CONDITIONAL([LINK_LIBPTHREAD], [test x$LIBPTHREAD = xtrue])

# Custom options to enable
AM_CONDITIONAL([DEBUG], [test x$debug = xtrue])
AM_CONDITIONAL([PEDANTIC], [test x$pedantic = xtrue])
AM_CONDITIONAL([RAPIDHALIB_LOCKDEBUG], [test x$rapidhalib_lockdebug = xtrue])
AM_CONDITIONAL([RAPIDHALIB_MOREDEBUG], [test x$rapidhalib_moredebug = xtrue])
AM_CONDITIONAL([XBEELIB_LOCKDEBUG], [test x$xbeelib_lockdebug = xtrue])
AM_CONDITIONAL([XBEELIB_MOREDEBUG], [test x$xbeelib_moredebug = xtrue])
AM_CONDITIONAL([TIZIGBEELIB_LOCKDEBUG], [test x$tizigbeelib_lockdebug = xtrue])
AM_CONDITIONAL([TIZIGBEELIB_MOREDEBUG], [test x$tizigbeelib_moredebug = xtrue])
AM_CONDITIONAL([ZIGBEELIB_LOCKDEBUG], [test x$zigbeelib_lockdebug = xtrue])
AM_CONDITIONAL([ZIGBEELIB_MOREDEBUG], [test x$zigbeelib_moredebug = xtrue])
AM_CONDITIONAL([ZIGBEELIB_SENDDEBUG], [test x$zigbeelib_senddebug = xtrue])
AM_CONDITIONAL([ZIGBEELIB_DEBUGWITHOUTDATABASE], [test x$zigbeelib_debugwithoutdatabase = xtrue])
AM_CONDITIONAL([LOCKLIB_LOCKDEBUG], [test x$locklib_lockdebug = xtrue])
AM_CONDITIONAL([RULESLIB_LOCKDEBUG], [test x$ruleslib_lockdebug = xtrue])
AM_CONDITIONAL([RULESLIB_MOREDEBUG], [test x$ruleslib_moredebug = xtrue])
AM_CONDITIONAL([CAMERALIB_LOCKDEBUG], [test x$cameralib_lockdebug = xtrue])
AM_CONDITIONAL([CAMERALIB_MOREDEBUG], [test x$cameralib_moredebug = xtrue])

# Optional plugins to enable
AM_CONDITIONAL([LINK_MYSQLPLUGIN], [test x$MYSQLPLUGIN = xtrue])

# NOTE: Some functions like dlsym have problems with -pedantic-errors and our older
#   library interface versions use void * for function parameters as well.
COMMONFLAGS="-Wall -Wextra -Wfloat-equal -DSYSCONFDIR=\\\"${sysconfdir}\\\" -DLOCALSTATEDIR=\\\"${localstatedir}\\\" -DLIBDIR=\\\"${libdir}\\\""
COMMONCFLAGS="-std=c99"
#COMMONCPPFLAGS="-std=c++98"
COMMONCPPFLAGS="-std=c++11"
AS_IF([test "x$debug" = xtrue], [
  COMMONFLAGS="${COMMONFLAGS} -DDEBUG"
], [
  COMMONFLAGS="${COMMONFLAGS} -s -O2 -fomit-frame-pointer"
])
AS_IF([test "x$pedantic" = xtrue], [
  COMMONFLAGS="${COMMONFLAGS} -pedantic"
])
COMMONCFLAGS="${COMMONCFLAGS} ${COMMONFLAGS}"
COMMONCPPFLAGS="${COMMONCPPFLAGS} ${COMMONFLAGS}"
COMMONCXXFLAGS="${COMMONCPPFLAGS}"
AC_SUBST([COMMONFLAGS])
AC_SUBST([COMMONCFLAGS])
AC_SUBST([COMMONCPPFLAGS])
AC_SUBST([COMMONCXXFLAGS])
AS_IF([test "x$MYSQLPLUGIN" = xtrue], [
	MYSQL_SUBST
])

dnl AC_CONFIG_FILES([Makefile])

AC_CONFIG_FILES([Makefile src/Makefile src/modules/Makefile])

# Modules
#AC_CONFIG_FILES([src/modules/mainlib/Makefile])
AC_CONFIG_FILES([src/modules/simclist/Makefile])
AC_CONFIG_FILES([src/modules/debuglib/Makefile])
AC_CONFIG_FILES([src/modules/commonserverlib/Makefile])
AC_CONFIG_FILES([src/modules/cmdserverlib/Makefile])
AC_CONFIG_FILES([src/modules/httpserverlib/Makefile])
AC_CONFIG_FILES([src/modules/dbcounterlib/Makefile])
AC_CONFIG_FILES([src/modules/configlib/Makefile])
AC_CONFIG_FILES([src/modules/nativeseriallib/Makefile])
AC_CONFIG_FILES([src/modules/serialportlib/Makefile])
AC_CONFIG_FILES([src/modules/xbeelib/Makefile])
AC_CONFIG_FILES([src/modules/rapidhalib/Makefile])
AC_CONFIG_FILES([src/modules/zigbeelib/Makefile])
AC_CONFIG_FILES([src/modules/commonlib/Makefile])
AC_CONFIG_FILES([src/modules/webapiclientlib/Makefile])
AC_CONFIG_FILES([src/modules/dblib/Makefile])
AC_CONFIG_FILES([src/modules/locklib/Makefile])
AS_IF([test "x$MYSQLPLUGIN" = xtrue], [
  AC_CONFIG_FILES([src/modules/mysqllib/Makefile])
])
AC_CONFIG_FILES([src/modules/timeruleslib/Makefile])
AC_CONFIG_FILES([src/modules/tizigbeelib/Makefile])
AC_CONFIG_FILES([src/modules/ruleslib/Makefile])
AC_CONFIG_FILES([src/modules/cameralib/Makefile])
AC_OUTPUT
