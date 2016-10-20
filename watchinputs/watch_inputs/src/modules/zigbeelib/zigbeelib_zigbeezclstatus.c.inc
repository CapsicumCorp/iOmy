/*
Title: ZigBee Library ZCL Status for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: zigbeelib_zigbeezclstatus.c
Copyright: Capsicum Corporation 2015-2016

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

#include <inttypes.h>

#include "zigbeelib_zigbeezclstatus.h"
#include "modules/commonlib/commonlib.h"

// ZigBee ZCL Status Table
const value_string zigbee_zclstatus_names[] = {
  { ZIGBEE_ZCL_STATUS_SUCCESS , ZIGBEE_ZCL_STATUS_SUCCESS_STR },
  { ZIGBEE_ZCL_STATUS_FAIL , ZIGBEE_ZCL_STATUS_FAIL_STR },
  { ZIGBEE_ZCL_STATUS_NOT_AUTHED , ZIGBEE_ZCL_STATUS_NOT_AUTHED_STR },
  { ZIGBEE_ZCL_STATUS_MALFORMED_CMD , ZIGBEE_ZCL_STATUS_MALFORMED_CMD_STR },
  { ZIGBEE_ZCL_STATUS_UNSUP_CLUST_CMD , ZIGBEE_ZCL_STATUS_UNSUP_CLUST_CMD_STR },
  { ZIGBEE_ZCL_STATUS_UNSUP_GEN_CMD , ZIGBEE_ZCL_STATUS_UNSUP_GEN_CMD_STR },
  { ZIGBEE_ZCL_STATUS_UNSUP_MANUF_CLUST_CMD , ZIGBEE_ZCL_STATUS_UNSUP_MANUF_CLUST_CMD_STR },
  { ZIGBEE_ZCL_STATUS_UNSUP_MANUF_GEN_CMD , ZIGBEE_ZCL_STATUS_UNSUP_MANUF_GEN_CMD_STR },
  { ZIGBEE_ZCL_STATUS_INVALID_FIELD , ZIGBEE_ZCL_STATUS_INVALID_FIELD_STR },
  { ZIGBEE_ZCL_STATUS_UNSUP_ATTRIB , ZIGBEE_ZCL_STATUS_UNSUP_ATTRIB_STR },
  { ZIGBEE_ZCL_STATUS_INVALID_VALUE , ZIGBEE_ZCL_STATUS_INVALID_VALUE_STR },
  { ZIGBEE_ZCL_STATUS_READ_ONLY , ZIGBEE_ZCL_STATUS_READ_ONLY_STR },
  { ZIGBEE_ZCL_STATUS_INSUFF_SPACE , ZIGBEE_ZCL_STATUS_INSUFF_SPACE_STR },
  { ZIGBEE_ZCL_STATUS_DUPE_EXISTS , ZIGBEE_ZCL_STATUS_DUPE_EXISTS_STR },
  { ZIGBEE_ZCL_STATUS_NOT_FOUND , ZIGBEE_ZCL_STATUS_NOT_FOUND_STR },
  { ZIGBEE_ZCL_STATUS_UNREPORTABLE_ATTRIB , ZIGBEE_ZCL_STATUS_UNREPORTABLE_ATTRIB_STR },
  { ZIGBEE_ZCL_STATUS_INVALID_TYPE , ZIGBEE_ZCL_STATUS_INVALID_TYPE_STR },
  { ZIGBEE_ZCL_STATUS_HW_FAIL , ZIGBEE_ZCL_STATUS_HW_FAIL_STR },
  { ZIGBEE_ZCL_STATUS_SW_FAIL , ZIGBEE_ZCL_STATUS_SW_FAIL_STR },
  { ZIGBEE_ZCL_STATUS_CALIB_ERR , ZIGBEE_ZCL_STATUS_CALIB_ERR_STR },
  { ZIGBEE_ZCL_STATUS_DISC_COMPLETE , ZIGBEE_ZCL_STATUS_DISC_COMPLETE_STR },
  { ZIGBEE_ZCL_STATUS_DISC_INCOMPLETE , ZIGBEE_ZCL_STATUS_DISC_INCOMPLETE_STR },
  { 0, NULL }
};
