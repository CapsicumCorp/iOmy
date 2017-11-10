/*
Title: Texas Instruments Z-Stack Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for tizigbeelib.c
Copyright: Capsicum Corporation 2017

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

Xbee info sourced from Digi docs
*/

#ifndef TIZIGBEELIB_HPP
#define TIZIGBEELIB_HPP

#include <stdint.h>

namespace tizigbeelib {

/* TI Zigbee Commands */

//This command is used to check for a device
static const uint16_t SYS_PING=0x2101;

//This command is sent by the tester to the target to reset it
static const uint16_t SYS_RESET=0x4100;

/* TI Zigbee Command Responses */

//Response for SYS_PING
static const uint16_t SYS_PING_RESPONSE=0x6101;

//Indicates a device has reset.
static const uint16_t SYS_RESET_RESPONSE = 0x4180;

//TI Zigbee Waiting Definitions
static const int WAITING_FOR_ANYTHING=1; //Waiting for any valid packet
static const int WAITING_FOR_SYS_PING_RESPONSE=2;
static const int WAITING_FOR_SYS_RESET_RESPONSE=3;

//TI Zigbee Reset Types
namespace RESET_TYPE {

static const int SERIAL_BOOTLOADER=1;
static const int TARGET_DEVICE=0;

}

//TI Zigbee Other Definitions
static const uint8_t BOOTLOADER_MAGIC_BYTE=0xFE;

//TI Zigbee Structures

//This header is present in every TI Zigbee api packet
//LSB 1-byte Checksum follows the payload and is the sum of all values from primary header to end of payload
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) tizigbee_api_header_t;

//SYS_RESET api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t reset_type; //RESET_TYPE type
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_reset_t;


typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) tizigbee_api_response_t;

} //End of namespace

#endif
