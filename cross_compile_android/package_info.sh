# Author: Matthew Stapleton <matthew@capsicumcorp.com>
# Copyright: Capsicum Corporation 2016

# Info about all the packages used for cross compile

ZLIBTITLE="Zlib"
ZLIBVER="1.2.8"
ZLIBPKG="zlib-1.2.8.tar.gz"
ZLIBCOMPILEDIR="zlib-1.2.8"
ZLIBHOMEPAGE="http://zlib.net/"
ZLIBLICENSE="ZLIB"
ZLIBBASEURL="http://zlib.net/"
ZLIBNEED_WEB_BROWSER=0

BZIP2TITLE="Bzip2"
BZIP2VER="1.0.6"
BZIP2PKG="bzip2-1.0.6.tar.gz"
BZIP2COMPILEDIR="bzip2-1.0.6"
BZIP2HOMEPAGE="http://www.bzip.org/"
BZIP2LICENSE="BZIP2"
BZIP2BASEURL="http://www.bzip.org/1.0.6/"
BZIP2NEED_WEB_BROWSER=0

OPENSSLTITLE="Openssl"
OPENSSLVER="1.0.2h"
OPENSSLPKG="openssl-1.0.2h.tar.gz"
OPENSSLCOMPILEDIR="openssl-1.0.2h"
OPENSSLHOMEPAGE="http://www.openssl.org/"
OPENSSLLICENSE="openssl"
OPENSSLBASEURL="https://www.openssl.org/source/"
OPENSSLNEED_WEB_BROWSER=0
OPENSSLPATCHES="fromgentoo/openssl-1.0.2h-CVE-2016-2177.patch fromgentoo/openssl-1.0.2h-CVE-2016-2178.patch"

CURLTITLE="Curl"
CURLVER="7.50.3"
CURLPKG="curl-7.50.3.tar.bz2"
CURLCOMPILEDIR="curl-7.50.3"
CURLHOMEPAGE="https://curl.haxx.se/"
CURLLICENSE="MIT"
CURLBASEURL="https://curl.haxx.se/download/"
CURLNEED_WEB_BROWSER=0
CURLPATCHES="fromgentoo/curl-respect-cflags-3.patch"

ICONVTITLE="libiconv"
ICONVVER="1.14"
ICONVPKG="libiconv-1.14.tar.gz"
ICONVCOMPILEDIR="libiconv-1.14"
ICONVHOMEPAGE="https://www.gnu.org/software/libiconv/"
ICONVLICENSE=">=LGPL-2"
ICONVBASEURL="http://ftp.gnu.org/pub/gnu/libiconv/"
ICONVNEED_WEB_BROWSER=0
ICONVPATCHES="fromgentoo/libiconv-1.14-no-gets.patch"

NCURSESTITLE="ncurses"
NCURSESVER="5.9"
NCURSESPKG="ncurses-5.9.tar.gz"
NCURSESCOMPILEDIR="ncurses-5.9"
NCURSESHOMEPAGE="https://www.gnu.org/software/ncurses/"
NCURSESLICENSE="Similar to MIT"
NCURSESBASEURL="https://ftp.gnu.org/pub/gnu/ncurses/"
NCURSESNEED_WEB_BROWSER=0
#NCURSESPATCHES="fromgentoo/ncurses-5.9-no-I-usr-include.patch fromgentoo/ncurses-5.9-gcc-5.patch fromgentoo/ncurses-5.9-fix-clang-build.patch"
NCURSESPATCHES="fromgentoo/ncurses-5.9-no-I-usr-include.patch fromgentoo/ncurses-5.9-gcc-5.patch"
NCURSESPATCHES2="fromgentoo/ncurses-5.9-rxvt-unicode-9.15.patch"

MHASHTITLE="mhash"
MHASHVER="0.9.9.9"
MHASHPKG="mhash-0.9.9.9.tar.gz"
MHASHCOMPILEDIR="mhash-0.9.9.9"
MHASHHOMEPAGE="http://mhash.sourceforge.net/"
MHASHLICENSE=">=GPL-2"
MHASHBASEURL="http://download.sourceforge.net/mhash/"
MHASHNEED_WEB_BROWSER=0
MHASHPATCHES="fromgentoo/mhash-0.9.9-autotools-namespace-stomping.patch fromgentoo/mhash-0.9.9-fix-mem-leak.patch fromgentoo/mhash-0.9.9-fix-snefru-segfault.patch fromgentoo/mhash-0.9.9-fix-whirlpool-segfault.patch fromgentoo/mhash-0.9.9.9-remove_premature_free.patch fromgentoo/mhash-0.9.9.9-force64bit-tiger.patch fromgentoo/mhash-0.9.9.9-align.patch fromgentoo/mhash-0.9.9.9-alignment.patch"

LIBMCRYPTTITLE="libmcrypt"
LIBMCRYPTVER="2.5.8"
LIBMCRYPTPKG="libmcrypt-2.5.8.tar.gz"
LIBMCRYPTCOMPILEDIR="libmcrypt-2.5.8"
LIBMCRYPTHOMEPAGE="http://mcrypt.sourceforge.net/"
LIBMCRYPTLICENSE=">=LGPL-2.1"
LIBMCRYPTBASEURL="http://download.sourceforge.net/mcrypt/"
LIBMCRYPTNEED_WEB_BROWSER=0
LIBMCRYPTPATCHES="fromgentoo/libmcrypt-2.5.8-rotate-mask.patch"

PCRETITLE="pcre"
PCREVER="2.5.8"
PCREPKG="pcre-8.38.tar.bz2"
PCRECOMPILEDIR="pcre-8.38"
PCREHOMEPAGE="http://www.pcre.org/"
PCRELICENSE="BSD"
PCREBASEURL="ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/"
PCRENEED_WEB_BROWSER=0
PCREPATCHES="fromgentoo/libpcre-8.38-CVE-2016-1283.patch fromgentoo/libpcre-8.38-ZDI-CAN-3542.patch"

LIBPNGTITLE="libpng"
LIBPNGVER="1.6.21"
LIBPNGPKG="libpng-1.6.21.tar.xz"
LIBPNGCOMPILEDIR="libpng-1.6.21"
LIBPNGHOMEPAGE="http://www.libpng.org/"
LIBPNGLICENSE="libpng"
LIBPNGBASEURL="http://download.sourceforge.net/libpng/"
LIBPNGNEED_WEB_BROWSER=0

LIBJPEGTITLE="libjpeg-turbo"
LIBJPEGVER="1.5.0"
LIBJPEGPKG="libjpeg-turbo-1.5.0.tar.gz"
LIBJPEGCOMPILEDIR="libjpeg-turbo-1.5.0"
LIBJPEGHOMEPAGE="http://www.libjpeg-turbo.org/"
LIBJPEGLICENSE="BSD and IJG"
LIBJPEGBASEURL="http://download.sourceforge.net/libjpeg-turbo/"
LIBJPEGNEED_WEB_BROWSER=0

READLINETITLE="readline"
READLINEVER="6.3"
READLINEPKG="readline-6.3.tar.gz"
READLINECOMPILEDIR="readline-6.3"
READLINEHOMEPAGE="http://cnswww.cns.cwru.edu/php/chet/readline/rltop.html"
READLINELICENSE=">=GPL-3"
READLINEBASEURL="https://ftp.gnu.org/gnu/readline/"
READLINENEED_WEB_BROWSER=0
#fromgentoo/readline-6.3-read-eof.patch
READLINEPATCHES="fromgentoo/readline63-001 fromgentoo/readline63-002 fromgentoo/readline63-003 fromgentoo/readline63-004 fromgentoo/readline63-005 fromgentoo/readline63-006 fromgentoo/readline63-007 fromgentoo/readline63-008 fromgentoo/readline-5.0-no_rpath.patch"
READLINEPATCHES2="fromgentoo/readline-6.2-rlfe-tgoto.patch fromgentoo/readline-6.3-fix-long-prompt-vi-search.patch"

LIBXML2TITLE="libxml2"
LIBXML2VER="2.9.4"
LIBXML2PKG="libxml2-2.9.4.tar.gz"
LIBXML2COMPILEDIR="libxml2-2.9.4"
LIBXML2HOMEPAGE="http://www.xmlsoft.org/"
LIBXML2LICENSE="MIT"
LIBXML2BASEURL="ftp://xmlsoft.org/libxml2/"
LIBXML2NEED_WEB_BROWSER=0

FREETYPETITLE="freetype"
FREETYPEVER="2.6.3"
FREETYPEPKG="freetype-2.6.3.tar.bz2"
FREETYPECOMPILEDIR="freetype-2.6.3"
FREETYPEHOMEPAGE="http://www.freetype.org/"
FREETYPELICENSE="FIL or >=GPL-2"
FREETYPEBASEURL="http://download.savannah.gnu.org/releases/freetype/"
FREETYPENEED_WEB_BROWSER=0
FREETYPEPATCHES="fromgentoo/freetype-2.3.2-enable-valid.patch fromgentoo/freetype-2.4.11-sizeof-types.patch"

LIBAIOTITLE="libaio"
LIBAIOVER="0.3.110"
LIBAIOPKG="libaio-0.3.110.tar.gz"
LIBAIOCOMPILEDIR="libaio-0.3.110"
LIBAIOHOMEPAGE="https://git.fedorahosted.org/cgit/libaio.git/"
LIBAIOLICENSE=">=LGPL-2"
LIBAIOBASEURL="https://fedorahosted.org/releases/l/i/libaio/"
LIBAIONEED_WEB_BROWSER=0
LIBAIOPATCHES="fromgentoo/libaio-0.3.110-cppflags.patch fromgentoo/libaio-0.3.110-link-stdlib.patch"

SDLTITLE="SDL"
SDLVER="1.2.15"
SDLPKG="SDL-1.2.15.tar.gz"
SDLCOMPILEDIR="SDL-1.2.15"
SDLHOMEPAGE="http://www.libsdl.org/"
SDLLICENSE=">=LGPL-2.1"
SDLBASEURL="http://www.libsdl.org/release/"
SDLNEED_WEB_BROWSER=0

FFMPEGTITLE="ffmpeg"
FFMPEGVER="3.1.3"
FFMPEGPKG="ffmpeg-3.1.3.tar.bz2"
FFMPEGCOMPILEDIR="ffmpeg-3.1.3"
FFMPEGHOMEPAGE="http://ffmpeg.org/"
FFMPEGLICENSE=">=GPL-2.1"
FFMPEGBASEURL="http://ffmpeg.org/releases/"
FFMPEGNEED_WEB_BROWSER=0

LIGHTTPDTITLE="lighttpd"
LIGHTTPDVER="1.4.39"
LIGHTTPDPKG="lighttpd-1.4.39.tar.xz"
LIGHTTPDCOMPILEDIR="lighttpd-1.4.39"
LIGHTTPDHOMEPAGE="http://www.lighttpd.net/"
LIGHTTPDLICENSE="new-BSD"
LIGHTTPDBASEURL="http://download.lighttpd.net/lighttpd/releases-1.4.x/"
LIGHTTPDNEED_WEB_BROWSER=0

PHPTITLE="php"
PHPVER="5.6.26"
PHPPKG="php-5.6.26.tar.xz"
PHPCOMPILEDIR="php-5.6.26"
PHPHOMEPAGE="http://php.net/"
PHPLICENSE="PHP-3"
PHPBASEURL="http://php.net/distributions/"
PHPNEED_WEB_BROWSER=0

MYSQLTITLE="mysql"
MYSQLVER="5.6.33"
MYSQLPKG="mysql-5.6.33.tar.gz"
MYSQLCOMPILEDIR="mysql-5.6.33"
MYSQLHOMEPAGE="http://www.mysql.com/"
MYSQLLICENSE="GPL-2"
MYSQLBASEURL="http://cdn.mysql.com/Downloads/MySQL-5.6/"
MYSQLNEED_WEB_BROWSER=0
MYSQLPATCHES="mysql_change_s_iread_and_s_iwrite_to_s_irusr_and_s_iwusr.patch mysql_define_ushort.patch mysql_skip_wchar_iso_10646_check.patch"

MYSQLNATIVETITLE="${MYSQLTITLE} native"
MYSQLNATIVEVER="${MYSQLVER}"
MYSQLNATIVEPKG="${MYSQLPKG}"
MYSQLNATIVECOMPILEDIR="${MYSQLCOMPILEDIR}"
MYSQLNATIVEHOMEPAGE="${MYSQLCOMPILEDIR}"
MYSQLNATIVELICENSE="${MYSQLLICENSE}"
MYSQLNATIVEBASEURL="${MYSQLBASEURL}"
MYSQLNATIVENEED_WEB_BROWSER=${MYSQLNEED_WEB_BROWSER}

PHPMYADMINTITLE="phpMyAdmin"
PHPMYADMINVER="4.6.4"
PHPMYADMINPKG="phpMyAdmin-4.6.4-english.tar.xz"
PHPMYADMINHOMEPAGE="https://www.phpmyadmin.net/"
PHPMYADMINLICENSE="GPL-2"
PHPMYADMINBASEURL="https://files.phpmyadmin.net/phpMyAdmin/4.6.4/"
PHPMYADMINNEED_WEB_BROWSER=0

