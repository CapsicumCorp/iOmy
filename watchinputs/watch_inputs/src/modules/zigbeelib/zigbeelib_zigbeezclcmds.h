/*
Title: ZigBee Library ZCL Commands Header for Watch Inputs
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

#ifndef ZIGBEELIB_ZIGBEEZCLCMDS_H
#define ZIGBEELIB_ZIGBEEZCLCMDS_H

//ZCL Commands
#define ZIGBEE_ZCL_CMD_READ_ATTRIB 0x00 // Read attributes foundation command ID 
#define ZIGBEE_ZCL_CMD_READ_ATTRIB_RESP 0x01 // Read attributes response foundation command ID 
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB 0x02 // Write attributes foundation command ID 
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_RESP 0x03 // Write attributes response foundation command ID 
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_UNDIV 0x04 // Write attributes undivided foundation command ID 
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_NO_RESP 0x05 // Write attributes no response foundation command ID 
#define ZIGBEE_ZCL_CMD_CONFIG_REPORT 0x06 // Configure reporting foundation command ID 
#define ZIGBEE_ZCL_CMD_CONFIG_REPORT_RESP 0x07 // Configure reporting response foundation command ID 
#define ZIGBEE_ZCL_CMD_READ_REPORT_CFG 0x08 // Read reporting config foundation command ID 
#define ZIGBEE_ZCL_CMD_READ_REPORT_CFG_RESP 0x09 // Read reporting config response foundation command ID 
#define ZIGBEE_ZCL_CMD_REPORT_ATTRIB  0x0a // Report attribute foundation command ID 
#define ZIGBEE_ZCL_CMD_DEFAULT_RESP 0x0b // Default response foundation command ID 
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB 0x0c // Discover attributes foundation command ID 
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_RESP 0x0d // Discover attributes response foundation command ID 
#define ZIGBEE_ZCL_CMD_READ_ATTRIB_STRUCTURED 0x0e
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_STRUCTURED 0x0f
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_STRUCTURED_RESP 0x10
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_RECEIVED 0x11
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_RESPONSE 0x12
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_GENERATED 0x13
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_GENERATED_RESPONSE 0x14
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_EXTENDED 0x15
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_EXTENDED_RESPONSE 0x16

//ZCL Command Strings
#define ZIGBEE_ZCL_CMD_READ_ATTRIB_STR "Read Attributes"
#define ZIGBEE_ZCL_CMD_READ_ATTRIB_RESP_STR "Read Attributes Response"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_STR "Write Attributes"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_RESP_STR "Write Attributes Response"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_UNDIV_STR "Write Attributes Undivided"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_NO_RESP_STR "Write Attributes No Response"
#define ZIGBEE_ZCL_CMD_CONFIG_REPORT_STR "Configure Reporting"
#define ZIGBEE_ZCL_CMD_CONFIG_REPORT_RESP_STR "Configure Reporting Response"
#define ZIGBEE_ZCL_CMD_READ_REPORT_CFG_STR "Read Reporting Config"
#define ZIGBEE_ZCL_CMD_READ_REPORT_CFG_RESP_STR "Read Reporting Config Response"
#define ZIGBEE_ZCL_CMD_REPORT_ATTRIB_STR "Report Attribute"
#define ZIGBEE_ZCL_CMD_DEFAULT_RESP_STR "Default Response"
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_STR "Discover Attributes"
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_RESP_STR "Discover Attributes Response"
#define ZIGBEE_ZCL_CMD_READ_ATTRIB_STRUCTURED_STR "Read Attributes Structured"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_STRUCTURED_STR "Write Attributes Structured"
#define ZIGBEE_ZCL_CMD_WRITE_ATTRIB_STRUCTURED_RESP_STR "Write Attributes Structured Response"
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_RECEIVED_STR "Discover Commands Received"
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_RESPONSE_STR "Discover Commands Response"
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_GENERATED_STR "Discover Commands Generated"
#define ZIGBEE_ZCL_CMD_DISC_COMMANDS_GENERATED_RESPONSE_STR "Discover Commands Generated Response"
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_EXTENDED_STR "Discover Attributes Extended"
#define ZIGBEE_ZCL_CMD_DISC_ATTRIB_EXTENDED_RESPONSE_STR "Discover Attributes Extended Response"

#endif
