lib_LTLIBRARIES = webapiclientlib.la
webapiclientlib_la_SOURCES = webapiclientlib.cpp
webapiclientlib_la_LDFLAGS = -module -version-info 0:0:0 $(BOOST_THREAD_LDFLAGS)
webapiclientlib_la_LIBADD=$(BOOST_THREAD_LIBS) $(BOOST_CHRONO_LIBS)

AM_CPPFLAGS=$(ENABLE_WEBAPICLIENTLIB_LOCKDEBUG) $(ENABLE_WEBAPICLIENTLIB_MOREDEBUG) $(BOOST_CPPFLAGS)
AM_CFLAGS=-I$(top_srcdir)/src $(COMMONCFLAGS) $(AM_CFLAGS)
AM_CXXFLAGS=-I$(top_srcdir)/src $(COMMONCXXFLAGS)
