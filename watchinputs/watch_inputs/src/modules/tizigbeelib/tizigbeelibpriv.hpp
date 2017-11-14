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

//Ask for the device's version string
static const uint16_t SYS_VERSION=0x2102;

//This command is sent by the tester to the target to reset it
static const uint16_t SYS_RESET=0x4100;

/* TI Zigbee Command Responses */

//Response for SYS_PING
static const uint16_t SYS_PING_RESPONSE=0x6101;

//Response for SYS_VERSION
static const uint16_t SYS_VERSION_RESPONSE=0x6102;

//Indicates a device has reset.
static const uint16_t SYS_RESET_RESPONSE=0x4180;

//TI Zigbee Waiting Definitions
static const int WAITING_FOR_ANYTHING=1; //Waiting for any valid packet
static const int WAITING_FOR_SYS_PING_RESPONSE=2;
static const int WAITING_FOR_SYS_VERSION_RESPONSE=3;
static const int WAITING_FOR_SYS_RESET_RESPONSE=4;

//TI Zigbee Reset Types
namespace RESET_TYPE {

static const int SERIAL_BOOTLOADER=1;
static const int TARGET_DEVICE=0;

}

/// <name>TI.ZPI1.SYS_PING_RESPONSE.CAPABILITIES</name>
/// <summary>Capabilities bitfield</summary>
namespace CAPABILITIES {
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_AF</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_AF = 8;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_APP</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_APP = 0x100;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_DEBUG</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_DEBUG = 0x80;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_MAC</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_MAC = 2;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_NWK</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_NWK = 4;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_SAPI</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_SAPI = 0x20;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_SYS</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_SYS = 1;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_UTIL</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_UTIL = 0x40;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.MT_CAP_ZDO</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t MT_CAP_ZDO = 0x10;
  /// <name>TI.ZPI2.SYS_PING_RESPONSE.CAPABILITIES.NONE</name>
  /// <summary>Capabilities bitfield</summary>
  static const uint16_t NONE = 0;
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

typedef struct {
  uint8_t frame_start; //RapidHA set to 0xF1 , RapidSE set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t capabilities; //First byte is LSB, second byte is MSB
} __attribute__((packed)) tizigbee_sys_ping_response_t;

typedef struct {
  uint8_t frame_start; //RapidHA set to 0xF1 , RapidSE set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t transportrev; //Transport Revision
  uint8_t product; //Product Type
  uint8_t major_firmware_version;
  uint8_t minor_firmware_version;
  uint8_t hwrev; //Hardware Revision
} __attribute__((packed)) tizigbee_sys_version_response_t;

typedef struct {
  uint8_t frame_start; //RapidHA set to 0xF1 , RapidSE set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t reason; //Reset Reason
  uint8_t transportrev; //Transport Revision
  uint8_t product; //Product Type
  uint8_t major_firmware_version;
  uint8_t minor_firmware_version;
  uint8_t hwrev; //Hardware Revision
} __attribute__((packed)) tizigbee_sys_reset_response_t;

} //End of namespace

#endif
