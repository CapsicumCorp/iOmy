/*
Title: Watch Inputs Header File
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for watch_inputs.c
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

#ifndef WATCHINPUTS_H
#define WATCHINPUTS_H

#ifndef __ANDROID__
#define CFG_FILENAME SYSCONFDIR "/watch_inputs/watch_inputs.cfg"
#define TIMERULES_FILENAME SYSCONFDIR "/watch_inputs/timerules.cfg"
#define MODULES_DIR LIBDIR "/watch_inputs/modules"
#else
#define CFG_FILENAME "inputdevs.cfg"
#define TIMERULES_FILENAME "timerules.cfg"
#define MODULES_DIR "modules"
#endif

#define WATCH_INPUTS_VERSION "0.7.0"
#define WATCH_INPUTS_COPYRIGHT "This program is part of Watch Inputs which is part of the iOmy project.\nCopyright (c) 2007-2016, Capsicum Corporation\n"
#define ANDROID_WATCH_INPUTS_VERSIONCODE "7000"
#define ANDROID_WATCH_INPUTS_VERSION "0.7.0"


extern char *cfg_filename;
extern char *timerules_filename;
extern char *modules_dir;

#endif
