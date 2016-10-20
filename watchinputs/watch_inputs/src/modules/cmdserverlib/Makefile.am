lib_LTLIBRARIES = cmdserverlib.la
cmdserverlib_la_SOURCES = cmdserverlib.c
cmdserverlib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
cmdserverlib_la_LIBADD=$(USE_LIBPTHREAD)

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

