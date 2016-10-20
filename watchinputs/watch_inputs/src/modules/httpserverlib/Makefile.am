lib_LTLIBRARIES = httpserverlib.la
httpserverlib_la_SOURCES = httpserverlib.c
httpserverlib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
httpserverlib_la_LIBADD=$(USE_LIBPTHREAD)

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

