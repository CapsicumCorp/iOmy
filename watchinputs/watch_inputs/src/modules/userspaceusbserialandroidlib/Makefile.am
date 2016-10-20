lib_LTLIBRARIES = userspaceusbserialandroidlib.la
userspaceusbserialandroidlib_la_SOURCES = userspaceusbserialandroidlib.c
userspaceusbserialandroidlib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
userspaceusbserialandroidlib_la_LIBADD=$(USE_LIBPTHREAD) -lrt

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

