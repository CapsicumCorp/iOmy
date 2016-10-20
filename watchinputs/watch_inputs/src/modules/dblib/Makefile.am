lib_LTLIBRARIES = dblib.la
dblib_la_SOURCES = dblib.c
dblib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread -lrt
endif
dblib_la_LIBADD=$(USE_LIBPTHREAD)

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

