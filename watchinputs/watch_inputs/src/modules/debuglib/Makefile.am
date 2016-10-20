lib_LTLIBRARIES = debuglib.la
debuglib_la_SOURCES = debuglib.c
debuglib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
debuglib_la_LIBADD=$(USE_LIBPTHREAD) -lrt

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

