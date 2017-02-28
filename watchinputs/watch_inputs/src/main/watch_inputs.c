/*
Title: Watch Inputs Program 0.6.0
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This program monitors device inputs and adds input events to a database.
Copyright: Capsicum Corporation 2007-2016

This file is part of Watch Inputs which is part of the iOmy project.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

//NOTE: _XOPEN_SOURCE is needed for the following
//  strdup
#define _XOPEN_SOURCE 500L

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <time.h>
#include <getopt.h>
#include "watch_inputs.h"
#include "mainlib.h"

#define QUITCODE 1

static int needtoquit;

//Only display last same signal received 10 times
static int lastsignal, lastsignalcount;

char *cfg_filename;
char *timerules_filename;
char *modules_dir=MODULES_DIR;

static pthread_t mainthread;
static pthread_t inputdevlib_thread;
static pthread_t httpserverlib_thread;

static int nummodules = 1;

//Command line options
static struct option const long_opts[] = {
  {"cfgfile", required_argument, NULL, 'c'},
  {"rulesfile", required_argument, NULL, 't'},
	{"modulesdir", required_argument, NULL, 'u'},
  {0, 0, 0, 0}
};

static void mainclean_up() {
#ifdef DEBUG
	printf("DEBUG: Entering the main cleanup routine\n");
#endif
	if (mainlib_cleanup!=NULL) {
		mainlib_cleanup();
	}
}

/*
  Trigger a reload
*/
static void mainreload() {
	//TODO: Implement reload
}

void die(int x) {
  if (lastsignal == x) {
    ++lastsignalcount;
  } else {
    lastsignal=x;
    lastsignalcount=0;
  }
  if (lastsignalcount < 10) {
#ifdef DEBUG
    printf("DEBUG: main_die: Received signal: %d\n", x);
#endif
  } else if (lastsignalcount == 10) {
#ifdef DEBUG
    printf("DEBUG: main_die: Received signal: %d 10 times, stopping signal info output until a new signal arrives\n", x);
#endif
  }
  if (pthread_self()==mainthread) {
#ifdef DEBUG
    printf("DEBUG: main_die: Signal: %d received in main thread, shutting down now\n", x);
#endif
    mainclean_up();
    exit(0);
  } else {
#ifdef DEBUG
    printf("DEBUG: main_die: Signal: %d received in other thread: %lu, main thread=%lu\n", x, pthread_self(), mainthread);
#endif
	}
}

static void help() {
  printf("Options:\n"
         "  --cfgfile=[filename] Config filename\n"
         "  --rulesfile=[filename] Time Rules filename\n"
				 "  --modulesdir=[dir]     Modules Directory\n"
        );
  exit(0);
}

static void getcmdopts(int argc, char **argv) {
  int c;

  while ((c = getopt_long (argc, argv, "", long_opts, NULL)) != -1) {
    switch (c) {
      case 'c':
				if (optarg) {
					if (cfg_filename) {
						free(cfg_filename);
					}
					cfg_filename=strdup(optarg);
				}
				break;
      case 't':
        if (optarg) {
          if (timerules_filename) {
            free(timerules_filename);
          }
          timerules_filename=strdup(optarg);
        }
        break;
			case 'u':
				if (optarg) {
					modules_dir=optarg;
				}
				break;
      default:
        help();
        break;
    }
  }
}

int main(int argc, char **argv) {
  int result;
  char *tmpstr;

  printf("Watch Inputs %s\n", WATCH_INPUTS_VERSION);
  printf(WATCH_INPUTS_COPYRIGHT);

  if (cfg_filename) {
    free(cfg_filename);
  }
  cfg_filename=strdup(CFG_FILENAME);

  if (timerules_filename) {
    free(timerules_filename);
  }
  timerules_filename=strdup(TIMERULES_FILENAME);

  getcmdopts(argc, argv);

	//This always seems to return 0 for the main thread
  mainthread=pthread_self();

	if (mainlib_main()==0) {
    while (!mainlib_getneedtoquit()) {
      sleep(1);
    }
  }
  mainlib_cleanup();

  if (cfg_filename) {
    free(cfg_filename);
    cfg_filename=NULL;
  }
  if (timerules_filename) {
    free(timerules_filename);
    timerules_filename=NULL;
  }
  return 0;
}
