lib_LTLIBRARIES = nativeseriallib.la
nativeseriallib_la_SOURCES = nativeseriallib.c
nativeseriallib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
nativeseriallib_la_LIBADD=$(USE_LIBPTHREAD) -lrt

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

