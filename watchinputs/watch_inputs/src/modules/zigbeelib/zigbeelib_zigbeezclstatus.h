/*
Title: ZigBee Library ZCL Status Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for zigbeelib.c
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

#ifndef ZIGBEELIB_ZIGBEEZCLSTATUS_H
#define ZIGBEELIB_ZIGBEEZCLSTATUS_H

//ZCL Status Values
#define ZIGBEE_ZCL_STATUS_SUCCESS 0x00 // ZCL Success
#define ZIGBEE_ZCL_STATUS_FAIL 0x01 // ZCL Fail
#define ZIGBEE_ZCL_STATUS_NOT_AUTHED 0x7E // Not Authorized
#define ZIGBEE_ZCL_STATUS_MALFORMED_CMD 0x80 // Malformed command
#define ZIGBEE_ZCL_STATUS_UNSUP_CLUST_CMD 0x81 // Unsupported cluster command
#define ZIGBEE_ZCL_STATUS_UNSUP_GEN_CMD 0x82 // Unsupported general command
#define ZIGBEE_ZCL_STATUS_UNSUP_MANUF_CLUST_CMD 0x83 // Unsupported manuf-specific clust command
#define ZIGBEE_ZCL_STATUS_UNSUP_MANUF_GEN_CMD 0x84 // Unsupported manuf-specific general command
#define ZIGBEE_ZCL_STATUS_INVALID_FIELD 0x85 // Invalid field
#define ZIGBEE_ZCL_STATUS_UNSUP_ATTRIB 0x86 // Unsupported attribute
#define ZIGBEE_ZCL_STATUS_INVALID_VALUE 0x87 // Invalid value
#define ZIGBEE_ZCL_STATUS_READ_ONLY 0x88 // Read only
#define ZIGBEE_ZCL_STATUS_INSUFF_SPACE 0x89 // Insufficient space
#define ZIGBEE_ZCL_STATUS_DUPE_EXISTS 0x8a // Duplicate exists
#define ZIGBEE_ZCL_STATUS_NOT_FOUND 0x8b // Not found
#define ZIGBEE_ZCL_STATUS_UNREPORTABLE_ATTRIB 0x8c // Unreportable attribute
#define ZIGBEE_ZCL_STATUS_INVALID_TYPE 0x8d // Invalid type
#define ZIGBEE_ZCL_STATUS_HW_FAIL 0xc0 // Hardware failure
#define ZIGBEE_ZCL_STATUS_SW_FAIL 0xc1 // Software failure
#define ZIGBEE_ZCL_STATUS_CALIB_ERR 0xc2 // Calibration error
#define ZIGBEE_ZCL_STATUS_DISC_COMPLETE 0x01 // Discovery complete
#define ZIGBEE_ZCL_STATUS_DISC_INCOMPLETE 0x00 // Discovery incomplete

//ZCL Status Strings
#define ZIGBEE_ZCL_STATUS_SUCCESS_STR "ZCL Success"
#define ZIGBEE_ZCL_STATUS_FAIL_STR "ZCL Fail"
#define ZIGBEE_ZCL_STATUS_NOT_AUTHED_STR "Not Authorized"
#define ZIGBEE_ZCL_STATUS_MALFORMED_CMD_STR "Malformed command"
#define ZIGBEE_ZCL_STATUS_UNSUP_CLUST_CMD_STR "Unsupported cluster command"
#define ZIGBEE_ZCL_STATUS_UNSUP_GEN_CMD_STR "Unsupported general command"
#define ZIGBEE_ZCL_STATUS_UNSUP_MANUF_CLUST_CMD_STR "Unsupported manuf-specific clust command"
#define ZIGBEE_ZCL_STATUS_UNSUP_MANUF_GEN_CMD_STR "Unsupported manuf-specific general command"
#define ZIGBEE_ZCL_STATUS_INVALID_FIELD_STR "Invalid field"
#define ZIGBEE_ZCL_STATUS_UNSUP_ATTRIB_STR "Unsupported attribute"
#define ZIGBEE_ZCL_STATUS_INVALID_VALUE_STR "Invalid value"
#define ZIGBEE_ZCL_STATUS_READ_ONLY_STR "Read only"
#define ZIGBEE_ZCL_STATUS_INSUFF_SPACE_STR "Insufficient space"
#define ZIGBEE_ZCL_STATUS_DUPE_EXISTS_STR "Duplicate exists"
#define ZIGBEE_ZCL_STATUS_NOT_FOUND_STR "Not found"
#define ZIGBEE_ZCL_STATUS_UNREPORTABLE_ATTRIB_STR "Unreportable attribute"
#define ZIGBEE_ZCL_STATUS_INVALID_TYPE_STR "Invalid type"
#define ZIGBEE_ZCL_STATUS_HW_FAIL_STR "Hardware failure"
#define ZIGBEE_ZCL_STATUS_SW_FAIL_STR "Software failure"
#define ZIGBEE_ZCL_STATUS_CALIB_ERR_STR "Calibration error"
#define ZIGBEE_ZCL_STATUS_DISC_COMPLETE_STR "Discovery complete"
#define ZIGBEE_ZCL_STATUS_DISC_INCOMPLETE_STR "Discovery incomplete"

#endif
