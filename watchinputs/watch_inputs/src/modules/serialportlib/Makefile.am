lib_LTLIBRARIES = serialportlib.la
serialportlib_la_SOURCES = serialportlib.c
serialportlib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
serialportlib_la_LIBADD=$(USE_LIBPTHREAD) -lrt

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

