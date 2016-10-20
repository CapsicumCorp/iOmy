lib_LTLIBRARIES = dbcounterlib.la
dbcounterlib_la_SOURCES = dbcounterlib.c
dbcounterlib_la_LDFLAGS = -module -version-info 0:0:0
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
dbcounterlib_la_LIBADD=$(USE_LIBPTHREAD)

AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)

