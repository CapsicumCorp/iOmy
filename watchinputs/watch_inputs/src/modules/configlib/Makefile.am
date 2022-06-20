lib_LTLIBRARIES = configlib.la
configlib_la_SOURCES = configlib.cpp
configlib_la_LDFLAGS = -module -version-info 0:0:0 $(BOOST_THREAD_LDFLAGS)
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
configlib_la_LIBADD=$(BOOST_THREAD_LIBS) $(USE_LIBPTHREAD)

AM_CPPFLAGS=$(BOOST_CPPFLAGS)
AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)
AM_CXXFLAGS=-I$(top_srcdir)/src $(COMMONCPPFLAGS)
