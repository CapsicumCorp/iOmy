lib_LTLIBRARIES = configlib.la
configlib_la_SOURCES = configlib.cpp
configlib_la_LDFLAGS = -module -version-info 0:0:0 ${BOOST_SYSTEM_LDFLAGS} $(BOOST_THREAD_LDFLAGS)
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
configlib_la_LIBADD=$(USE_LIBPTHREAD) ${BOOST_SYSTEM_LDFLAGS} $(BOOST_THREAD_LIBS)

AM_CPPFLAGS=$(BOOST_CPPFLAGS)
AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS)
AM_CXXFLAGS=-I$(top_srcdir)/src $(COMMONCPPFLAGS)
