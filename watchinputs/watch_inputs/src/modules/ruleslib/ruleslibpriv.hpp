/*
Title: Rules Library Header for Watch Inputs
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

#ifndef RULESLIB_HPP
#define RULESLIB_HPP

#include <stdint.h>
#include "modules/commonlib/commonlib.h"

namespace ruleslib {
  //Used to indicate what api to use to apply the rule
  namespace DEVICETYPES {
    static const int32_t NO_TYPE=0;
    static const int32_t ZIGBEE_DEVICE=1;
    static const int32_t CSRMESH_DEVICE=2;
  }
  //These values need to stay in sync with the database rule type values
  namespace RULETYPES {
    static const int32_t NO_TYPE=0;
    static const int32_t TURN_ON_ONCE_ONLY=1;
    static const int32_t TURN_OFF_ONCE_ONLY=2;
    static const int32_t TURN_ON_RECURRING=3;
    static const int32_t TURN_OFF_RECURRING=4;
  }
} //End of namespace

#endif
