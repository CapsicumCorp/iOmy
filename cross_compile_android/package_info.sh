# Author: Matthew Stapleton <matthew@capsicumcorp.com>
# Copyright: Capsicum Corporation 2016

# Info about all the packages used for cross compile

ZLIBTITLE="Zlib"
ZLIBVER="1.2.11"
ZLIBPKG="zlib-1.2.11.tar.gz"
ZLIBCOMPILEDIR="zlib-1.2.11"
ZLIBHOMEPAGE="http://zlib.net/"
ZLIBLICENSE="ZLIB"
ZLIBBASEURL="http://zlib.net/"
ZLIBGENTOOPKG="sys-libs/zlib"
ZLIBGENTOOVER="1.2.11"
ZLIBNEED_WEB_BROWSER=0

BZIP2TITLE="Bzip2"
BZIP2VER="1.0.6"
BZIP2PKG="bzip2-1.0.6.tar.gz"
BZIP2COMPILEDIR="bzip2-1.0.6"
BZIP2HOMEPAGE="http://www.bzip.org/"
BZIP2LICENSE="BZIP2"
BZIP2BASEURL="http://www.bzip.org/1.0.6/"
BZIP2GENTOOPKG="app-arch/bzip2"
BZIP2GENTOOVER="1.0.6-r7"
BZIP2NEED_WEB_BROWSER=0
BZIP2PATCHES="fromgentoo/bzip2-1.0.3-no-test.patch fromgentoo/bzip2-1.0.4-POSIX-shell.patch fromgentoo/bzip2-1.0.4-makefile-CFLAGS.patch fromgentoo/bzip2-1.0.6-saneso.patch"
#BZIP2PATCHES="fromgentoo/bzip2-1.0.4-man-links.patch"
BZIP2PATCHES2="fromgentoo/bzip2-1.0.6-mingw.patch fromgentoo/bzip2-1.0.6-out-of-tree-build.patch fromgentoo/bzip2-1.0.6-progress.patch"

OPENSSLTITLE="Openssl"
OPENSSLVER="1.0.2k"
OPENSSLPKG="openssl-1.0.2k.tar.gz"
OPENSSLCOMPILEDIR="openssl-1.0.2k"
OPENSSLHOMEPAGE="http://www.openssl.org/"
OPENSSLLICENSE="openssl"
OPENSSLBASEURL="https://www.openssl.org/source/"
OPENSSLGENTOOPKG="dev-libs/openssl"
OPENSSLGENTOOVER="1.0.2k"
OPENSSLNEED_WEB_BROWSER=0
OPENSSLPATCHES="fromgentoo/openssl-1.0.0a-ldflags.patch"
OPENSSLPATCHES2="fromgentoo/openssl-1.0.2-ipv6.patch"

CURLTITLE="Curl"
CURLVER="7.53.0"
CURLPKG="curl-7.53.0.tar.bz2"
CURLCOMPILEDIR="curl-7.53.0"
CURLHOMEPAGE="https://curl.haxx.se/"
CURLLICENSE="MIT"
CURLBASEURL="https://curl.haxx.se/download/"
CURLGENTOOPKG="net-misc/curl"
CURLGENTOOVER="7.53.0"
CURLNEED_WEB_BROWSER=0
CURLPATCHES="fromgentoo/curl-respect-cflags-3.patch"

ICONVTITLE="libiconv"
ICONVVER="1.14"
ICONVPKG="libiconv-1.14.tar.gz"
ICONVCOMPILEDIR="libiconv-1.14"
ICONVHOMEPAGE="https://www.gnu.org/software/libiconv/"
ICONVLICENSE=">=LGPL-2"
ICONVBASEURL="http://ftp.gnu.org/pub/gnu/libiconv/"
ICONVGENTOOPKG="dev-libs/libiconv"
ICONVGENTOOVER="1.14-r1"
ICONVNEED_WEB_BROWSER=0
ICONVPATCHES="fromgentoo/libiconv-1.14-no-gets.patch"

NCURSESTITLE="ncurses"
NCURSESVER="5.9"
NCURSESPKG="ncurses-5.9.tar.gz"
NCURSESCOMPILEDIR="ncurses-5.9"
NCURSESHOMEPAGE="https://www.gnu.org/software/ncurses/"
NCURSESLICENSE="Similar to MIT"
NCURSESBASEURL="https://ftp.gnu.org/pub/gnu/ncurses/"
NCURSESGENTOOPKG="sys-libs/ncurses"
NCURSESGENTOOVER="5.9-r101"
NCURSESNEED_WEB_BROWSER=0
#NCURSESPATCHES="fromgentoo/ncurses-5.9-no-I-usr-include.patch fromgentoo/ncurses-5.9-gcc-5.patch fromgentoo/ncurses-5.9-fix-clang-build.patch"
NCURSESPATCHES="fromgentoo/ncurses-5.9-no-I-usr-include.patch fromgentoo/ncurses-5.9-gcc-5.patch"
NCURSESPATCHES2="fromgentoo/ncurses-5.9-rxvt-unicode-9.15.patch"

#NCURSESPATCHES_6.0="fromgentoo/ncurses-6.0-gfbsd.patch fromgentoo/ncurses-6.0-rxvt-unicode-9.15.patch fromgentoo/ncurses-6.0-pkg-config.patch fromgentoo/ncurses-5.9-gcc-5.patch fromgentoo/ncurses-6.0-ticlib.patch fromgentoo/ncurses-6.0-cppflags-cross.patch"
#NCURSESPATCHES2_6.0=""

MHASHTITLE="mhash"
MHASHVER="0.9.9.9"
MHASHPKG="mhash-0.9.9.9.tar.gz"
MHASHCOMPILEDIR="mhash-0.9.9.9"
MHASHHOMEPAGE="http://mhash.sourceforge.net/"
MHASHLICENSE=">=GPL-2"
MHASHBASEURL="http://download.sourceforge.net/mhash/"
MHASHGENTOOPKG="app-crypt/mhash"
MHASHGENTOOVER="0.9.9.9-r2"
MHASHNEED_WEB_BROWSER=0
MHASHPATCHES="fromgentoo/mhash-0.9.9-autotools-namespace-stomping.patch fromgentoo/mhash-0.9.9-fix-mem-leak.patch fromgentoo/mhash-0.9.9-fix-snefru-segfault.patch fromgentoo/mhash-0.9.9-fix-whirlpool-segfault.patch fromgentoo/mhash-0.9.9.9-remove_premature_free.patch fromgentoo/mhash-0.9.9.9-force64bit-tiger.patch fromgentoo/mhash-0.9.9.9-align.patch fromgentoo/mhash-0.9.9.9-alignment.patch"

LIBMCRYPTTITLE="libmcrypt"
LIBMCRYPTVER="2.5.8"
LIBMCRYPTPKG="libmcrypt-2.5.8.tar.gz"
LIBMCRYPTCOMPILEDIR="libmcrypt-2.5.8"
LIBMCRYPTHOMEPAGE="http://mcrypt.sourceforge.net/"
LIBMCRYPTLICENSE=">=LGPL-2.1"
LIBMCRYPTBASEURL="http://download.sourceforge.net/mcrypt/"
LIBMCRYPTGENTOOPKG="dev-libs/libmcrypt"
LIBMCRYPTGENTOOVER="2.5.8-r4"
LIBMCRYPTNEED_WEB_BROWSER=0
LIBMCRYPTPATCHES="fromgentoo/libmcrypt-2.5.8-rotate-mask.patch"

PCRETITLE="pcre"
PCREVER="8.40"
PCREPKG="pcre-8.40.tar.bz2"
PCRECOMPILEDIR="pcre-8.40"
PCREHOMEPAGE="http://www.pcre.org/"
PCRELICENSE="BSD"
PCREBASEURL="ftp://ftp.csx.cam.ac.uk/pub/software/programming/pcre/"
PCREGENTOOPKG="dev-libs/libpcre"
PCREGENTOOVER="8.40"
PCRENEED_WEB_BROWSER=0
PCREPATCHES="fromgentoo/libpcre-8.40-pcregrep-multiline-1.patch fromgentoo/libpcre-8.40-pcregrep-multiline-2.patch fromgentoo/libpcre-8.40-jit-else.patch"

LIBPNGTITLE="libpng"
LIBPNGVER="1.6.27"
LIBPNGPKG="libpng-1.6.27.tar.xz"
LIBPNGCOMPILEDIR="libpng-1.6.27"
LIBPNGHOMEPAGE="http://www.libpng.org/"
LIBPNGLICENSE="libpng"
LIBPNGBASEURL="http://download.sourceforge.net/libpng/"
LIBPNGGENTOOPKG="media-libs/libpng"
LIBPNGGENTOOVER="1.6.27"
LIBPNGNEED_WEB_BROWSER=0

LIBJPEGTITLE="libjpeg-turbo"
LIBJPEGVER="1.5.0"
LIBJPEGPKG="libjpeg-turbo-1.5.0.tar.gz"
LIBJPEGCOMPILEDIR="libjpeg-turbo-1.5.0"
LIBJPEGHOMEPAGE="http://www.libjpeg-turbo.org/"
LIBJPEGLICENSE="BSD and IJG"
LIBJPEGBASEURL="http://download.sourceforge.net/libjpeg-turbo/"
LIBJPEGGENTOOPKG="media-libs/libjpeg-turbo"
LIBJPEGGENTOOVER="1.5.0"
LIBJPEGNEED_WEB_BROWSER=0

READLINETITLE="readline"
READLINEVER="6.3"
READLINEPKG="readline-6.3.tar.gz"
READLINECOMPILEDIR="readline-6.3"
READLINEHOMEPAGE="http://cnswww.cns.cwru.edu/php/chet/readline/rltop.html"
READLINELICENSE=">=GPL-3"
READLINEBASEURL="https://ftp.gnu.org/gnu/readline/"
READLINEGENTOOPKG="sys-libs/readline"
READLINEGENTOOVER="6.3_p8-r3"
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
LIBXML2GENTOOPKG="dev-libs/libxml2"
LIBXML2GENTOOVER="2.9.4-r1"
LIBXML2NEED_WEB_BROWSER=0
LIBXML2PATCHES="fromgentoo/libxml2-2.9.2-disable-tests.patch fromgentoo/libxml2-2.9.4-CVE-2016-4658.patch fromgentoo/libxml2-2.9.4-CVE-2016-5131.patch fromgentoo/libxml2-2.9.4-nullptrderef.patch fromgentoo/libxml2-2.9.4-nullptrderef2.patch"

FREETYPETITLE="freetype"
FREETYPEVER="2.7.1"
FREETYPEPKG="freetype-2.7.1.tar.bz2"
FREETYPECOMPILEDIR="freetype-2.7.1"
FREETYPEHOMEPAGE="http://www.freetype.org/"
FREETYPELICENSE="FIL or >=GPL-2"
FREETYPEBASEURL="http://download.savannah.gnu.org/releases/freetype/"
FREETYPEGENTOOPKG="media-libs/freetype"
FREETYPEGENTOOVER="2.7.1-r2"
FREETYPENEED_WEB_BROWSER=0
FREETYPEPATCHES="fromgentoo/freetype-2.7-enable-valid.patch fromgentoo/freetype-2.4.11-sizeof-types.patch fromgentoo/freetype-2.7.1-pcf_fix.patch"
# NOTE: fromgentoo/freetype-2.7.1-glyph_name.patch is already applied in 2.7.1
# FREETYPEPATCHES="fromgentoo/freetype-2.7.1-glyph_name.patch"

LIBAIOTITLE="libaio"
LIBAIOVER="0.3.110"
LIBAIOPKG="libaio-0.3.110.tar.gz"
LIBAIOCOMPILEDIR="libaio-0.3.110"
LIBAIOHOMEPAGE="https://git.fedorahosted.org/cgit/libaio.git/"
LIBAIOLICENSE=">=LGPL-2"
LIBAIOBASEURL="https://fedorahosted.org/releases/l/i/libaio/"
LIBAIOGENTOOPKG="dev-libs/libaio"
LIBAIOGENTOOVER="0.3.110"
LIBAIONEED_WEB_BROWSER=0
LIBAIOPATCHES="fromgentoo/libaio-0.3.110-cppflags.patch fromgentoo/libaio-0.3.110-link-stdlib.patch"

# NOTE: Gentoo patches not included as they aren't needed at the moment
SDLTITLE="SDL"
SDLVER="1.2.15"
SDLPKG="SDL-1.2.15.tar.gz"
SDLCOMPILEDIR="SDL-1.2.15"
SDLHOMEPAGE="http://www.libsdl.org/"
SDLLICENSE=">=LGPL-2.1"
SDLBASEURL="http://www.libsdl.org/release/"
SDLGENTOOPKG="media-libs/libsdl"
SDLGENTOOVER="1.2.15-r9"
SDLNEED_WEB_BROWSER=0

FFMPEGTITLE="ffmpeg"
FFMPEGVER="3.2.4"
FFMPEGPKG="ffmpeg-3.2.4.tar.bz2"
FFMPEGCOMPILEDIR="ffmpeg-3.2.4"
FFMPEGHOMEPAGE="http://ffmpeg.org/"
FFMPEGLICENSE=">=GPL-2.1"
FFMPEGBASEURL="http://ffmpeg.org/releases/"
FFMPEGGENTOOPKG="media-video/ffmpeg"
FFMPEGGENTOOVER="3.2.4"
FFMPEGNEED_WEB_BROWSER=0

# lighttpd_accept4_not_available.patch is needed for older devices to prevent freezing due to
#   SOCK_NONBLOCK and/or SOCK_CLOEXEC being ignored in the call to socket as
#   they are defined with NDK unified headers
LIGHTTPDTITLE="lighttpd"
LIGHTTPDVER="1.4.49"
LIGHTTPDPKG="lighttpd-1.4.49.tar.xz"
LIGHTTPDCOMPILEDIR="lighttpd-1.4.49"
LIGHTTPDHOMEPAGE="http://www.lighttpd.net/"
LIGHTTPDLICENSE="new-BSD"
LIGHTTPDBASEURL="http://download.lighttpd.net/lighttpd/releases-1.4.x/"
LIGHTTPDGENTOOPKG="www-server/lighttpd"
LIGHTTPDGENTOOVER="1.4.49"
LIGHTTPDNEED_WEB_BROWSER=0
LIGHTTPDPATCHES="lighttpd_embedded_arm_support_custom_by_capsicumcorp_for_lighttpd_1.4.49.diff lighttpd_accept4_not_available.patch"

PHPTITLE="php"
PHPVER="7.1.14"
PHPPKG="php-7.1.14.tar.xz"
PHPCOMPILEDIR="php-7.1.14"
PHPHOMEPAGE="http://php.net/"
PHPLICENSE="PHP-3"
PHPBASEURL="http://php.net/distributions/"
PHPGENTOOPKG="dev-lang/php"
PHPGENTOOVER="7.1.14"
PHPNEED_WEB_BROWSER=0

MYSQLTITLE="mysql"
MYSQLVER="5.6.39"
MYSQLPKG="mysql-5.6.39.tar.gz"
MYSQLCOMPILEDIR="mysql-5.6.39"
MYSQLHOMEPAGE="http://www.mysql.com/"
MYSQLLICENSE="GPL-2"
MYSQLBASEURL="http://cdn.mysql.com/Downloads/MySQL-5.6/"
MYSQLGENTOOPKG="dev-db/mysql"
MYSQLGENTOOVER="5.6.39"
MYSQLNEED_WEB_BROWSER=0
MYSQLPATCHES="mysql_change_s_iread_and_s_iwrite_to_s_irusr_and_s_iwusr.patch mysql_define_ushort.patch mysql_skip_wchar_iso_10646_check.patch mysql_android_handle_missing_posix_fadvise.patch mysql_fseeko_workaround.patch"

MYSQLNATIVETITLE="${MYSQLTITLE} native"
MYSQLNATIVEVER="${MYSQLVER}"
MYSQLNATIVEPKG="${MYSQLPKG}"
MYSQLNATIVECOMPILEDIR="${MYSQLCOMPILEDIR}"
MYSQLNATIVEHOMEPAGE="${MYSQLCOMPILEDIR}"
MYSQLNATIVELICENSE="${MYSQLLICENSE}"
MYSQLNATIVEBASEURL="${MYSQLBASEURL}"
MYSQLNATIVEGENTOOPKG="${MYSQLGENTOOPKG}"
MYSQLNATIVEGENTOOVER="${MYSQLGENTOOVER}"
MYSQLNATIVENEED_WEB_BROWSER=${MYSQLNEED_WEB_BROWSER}

BUSYBOXTITLE="BusyBox"
BUSYBOXVER="1.28.0"
BUSYBOXPKG="busybox-1.28.0.tar.bz2"
BUSYBOXCOMPILEDIR="busybox-1.28.0"
BUSYBOXHOMEPAGE="https://www.busybox.net/"
BUSYBOXLICENSE="GPL-2"
BUSYBOXBASEURL="https://www.busybox.net/downloads/"
BUSYBOXGENTOOPKG="sys-apps/busybox"
BUSYBOXGENTOOVER="1.28.0"
BUSYBOXNEED_WEB_BROWSER=0
BUSYBOXPATCHES="busybox-capability.patch busybox_android_not_missing_tcdrain_syscall.patch"

#BUSYBOXARMTITLE="BusyBox Arm"
#BUSYBOXARMVER="v1.25.1"
#BUSYBOXARMPKG="busybox-arm"
#BUSYBOXARMHOMEPAGE="https://busybox.net/"
#BUSYBOXARMLICENSE="GPL-2"
#BUSYBOXARMBASEURL="http://download.iomy.org/download.php?file="
#BUSYBOXARMNEED_WEB_BROWSER=1

#BUSYBOXX86TITLE="BusyBox x86"
#BUSYBOXX86VER="v1.25.1"
#BUSYBOXX86PKG="busybox-x86"
#BUSYBOXX86HOMEPAGE="https://busybox.net/"
#BUSYBOXX86LICENSE="GPL-2"
#BUSYBOXX86BASEURL="http://download.iomy.org/download.php?file="
#BUSYBOXX86NEED_WEB_BROWSER=1

PHPMYADMINTITLE="phpMyAdmin"
PHPMYADMINVER="4.7.7"
PHPMYADMINPKG="phpMyAdmin-4.7.7-english.tar.xz"
PHPMYADMINCOMPILEDIR="phpMyAdmin-4.7.7-english"
PHPMYADMINHOMEPAGE="https://www.phpmyadmin.net/"
PHPMYADMINLICENSE="GPL-2"
PHPMYADMINBASEURL="https://files.phpmyadmin.net/phpMyAdmin/4.7.7/"
PHPMYADMINGENTOOPKG="dev-db/phpmyadmin"
PHPMYADMINGENTOOVER="4.7.7"
PHPMYADMINNEED_WEB_BROWSER=0

