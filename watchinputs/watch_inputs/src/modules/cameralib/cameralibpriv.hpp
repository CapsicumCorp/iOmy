/*
Title: Camera Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for ruleslib.cpp
Copyright: Capsicum Corporation 2018

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

#ifndef CAMERALIB_HPP
#define CAMERALIB_HPP

#include <stdint.h>
#include "modules/commonlib/commonlib.h"

namespace cameralib {
  //A list of different camera stream modes
  enum class CAMERA_STREAM_MODE {
    GENERIC_COMMAND, //Uses generic cmd and args for running any command
    FFMPEG_CONTINUOUS_STREAM_STORAGE_COMMAND //Use ffmpeg with a fixed set of commands and stores to a fixed path
  };
  //A list of webapi request modes
  enum class WEBAPI_REQUEST_MODES {
    GET_STREAM_URL
  };
} //End of namespace

#endif
