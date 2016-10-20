bin_PROGRAMS = watch_inputs
watch_inputs_SOURCES = main/watch_inputs.c main/mainlib.c
if LINK_LIBDL
  USE_LIBDL=-ldl
endif
if LINK_LIBPTHREAD
  USE_LIBPTHREAD=-lpthread
endif
watch_inputs_LDADD=$(USE_LIBDL) $(USE_LIBPTHREAD)

AM_CFLAGS=-rdynamic $(COMMONCFLAGS)
AM_CXXFLAGS=-rdynamic $(COMMONCXXFLAGS)

SUBDIRS = modules
