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
#include "modules/commonlib/commonlib.h"

namespace tizigbeelib {

/* TI Zigbee Commands and Responses */

//This command is used to check for a device
static const uint16_t SYS_PING=0x2101;
static const uint16_t SYS_PING_RESPONSE=0x6101;

//Ask for the device's version string
static const uint16_t SYS_VERSION=0x2102;
static const uint16_t SYS_VERSION_RESPONSE=0x6102;

//This command is sent by the tester to the target to reset it
static const uint16_t SYS_RESET=0x4100;
static const uint16_t SYS_RESET_RESPONSE=0x4180;

static const uint16_t AF_DATA_CONFIRM = 0x4480;
static const uint16_t AF_DATA_REQUEST = 0x2401;
static const uint16_t AF_DATA_REQUEST_EXT = 0x2402;
static const uint16_t AF_DATA_SRSP = 0x6401;
static const uint16_t AF_DATA_SRSP_EXT = 0x6402;
static const uint16_t AF_INCOMING_MSG = 0x4481;
static const uint16_t AF_REGISTER = 0x2400;
static const uint16_t AF_REGISTER_SRSP = 0x6400;

//Reads current device information
static const uint16_t ZB_GET_DEVICE_INFO=0x2606;
static const uint16_t ZB_GET_DEVICE_INFO_RESPONSE=0x6606;

//Reads a configuration property from nonvolatile memory
static const uint16_t ZB_READ_CONFIGURATION=0x2604;
static const uint16_t ZB_READ_CONFIGURATION_RESPONSE = 0x6604;

//Writes a configuration property to nonvolatile memory
static const uint16_t ZB_WRITE_CONFIGURATION=0x2605;
static const uint16_t ZB_WRITE_CONFIGURATION_RESPONSE=0x6605;

//This message will request the device to send a "Network Address Request"
static const uint16_t ZDO_NWK_ADDR_REQ = 0x2500;
static const uint16_t ZDO_NWK_ADDR_REQ_SRSP = 0x6500;
static const uint16_t ZDO_NWK_ADDR_RSP = 0x4580;

//This command will request a device's IEEE 64-bit address
static const uint16_t ZDO_IEEE_ADDR_REQ = 0x2501;
static const uint16_t ZDO_IEEE_ADDR_REQ_SRSP = 0x6501;
static const uint16_t ZDO_IEEE_ADDR_RSP = 0x4581;

//This command is generated to inquire as to the Node Descriptor of the destination device
static const uint16_t ZDO_NODE_DESC_REQ = 0x2502;
static const uint16_t ZDO_NODE_DESC_REQ_SRSP = 0x6502;
static const uint16_t ZDO_NODE_DESC_RSP = 0x4582;

//This command is generated to inquire as to the Power Descriptor of the destination
static const uint16_t ZDO_POWER_DESC_REQ = 0x2503;
static const uint16_t ZDO_POWER_DESC_REQ_SRSP = 0x6503;
static const uint16_t ZDO_POWER_DESC_RSP = 0x4583;

//This command is generated to inquire as to the Simple Descriptor of the destination device's Endpoint
static const uint16_t ZDO_SIMPLE_DESC_REQ = 0x2504;
static const uint16_t ZDO_SIMPLE_DESC_REQ_SRSP = 0x6504;
static const uint16_t ZDO_SIMPLE_DESC_RSP = 0x4584;

//This command is generated to request a list of active endpoint from the destination device
static const uint16_t ZDO_ACTIVE_EP_REQ = 0x2505;
static const uint16_t ZDO_ACTIVE_EP_REQ_SRSP = 0x6505;
static const uint16_t ZDO_ACTIVE_EP_RSP = 0x4585;

//This command is generated to request a list of active endpoint from the destination device
static const uint16_t ZDO_MATCH_DESC_REQ = 0x2506;
static const uint16_t ZDO_MATCH_DESC_REQ_SRSP = 0x6506;
static const uint16_t ZDO_MATCH_DESC_RSP = 0x4586;

//This command is generated to request for the destination device's complex descriptor
static const uint16_t ZDO_COMPLEX_DESC_REQ = 0x2507;
static const uint16_t ZDO_COMPLEX_DESC_REQ_SRSP = 0x6507;
static const uint16_t ZDO_COMPLEX_DESC_RSP = 0x4587;

//This command is generated to request for the destination device's user descriptor
static const uint16_t ZDO_USER_DESC_REQ = 0x2508;
static const uint16_t ZDO_USER_DESC_REQ_SRSP = 0x6508;
static const uint16_t ZDO_USER_DESC_RSP = 0x4588;

//This command is generated to request an End Device Announce
static const uint16_t ZDO_END_DEVICE_ANNCE = 0x250a;
static const uint16_t ZDO_END_DEVICE_ANNCE_SRSP = 0x650a;
static const uint16_t ZDO_END_DEVICE_ANNCE_IND = 0x45c1;

//This command is generated to request a User Descriptor Set Request
static const uint16_t ZDO_USER_DESC_SET = 0x250b;
static const uint16_t ZDO_USER_DESC_SET_SRSP = 0x650b;

static const uint16_t ZDO_SERVER_DISC_REQ = 0x250c;
static const uint16_t ZDO_SERVER_DISC_REQ_SRSP = 0x650c;
static const uint16_t ZDO_SERVER_DISC_RSP = 0x458a;

static const uint16_t ZDO_END_DEVICE_BIND_REQ = 0x2520;
static const uint16_t ZDO_END_DEVICE_BIND_REQ_SRSP = 0x6520;
static const uint16_t ZDO_END_DEVICE_BIND_RSP = 0x45a0;

static const uint16_t ZDO_BIND_REQ = 0x2521;
static const uint16_t ZDO_BIND_REQ_SRSP = 0x6521;
static const uint16_t ZDO_BIND_RSP = 0x45a1;

static const uint16_t ZDO_UNBIND_REQ = 0x2522;
static const uint16_t ZDO_UNBIND_REQ_SRSP = 0x6522;
static const uint16_t ZDO_UNBIND_RSP = 0x45a2;

static const uint16_t ZDO_SET_LINK_KEY = 0x2523;
static const uint16_t ZDO_SET_LINK_KEY_SRSP = 0x6523;

static const uint16_t ZDO_GET_LINK_KEY = 0x2525;
static const uint16_t ZDO_GET_LINK_KEY_SRSP = 0x6525;

static const uint16_t ZDO_SEND_DATA = 0x2528;
static const uint16_t ZDO_SEND_DATA_SRSP = 0x6528;

static const uint16_t ZDO_MGMT_NWK_DISC_REQ = 0x2530;
static const uint16_t ZDO_MGMT_NWK_DISC_REQ_SRSP = 0x6530;
static const uint16_t ZDO_MGMT_NWK_DISC_RSP = 0x45b0;

//This command is generated to request a Management LQI Request
static const uint16_t ZDO_MGMT_LQI_REQ = 0x2531;
static const uint16_t ZDO_MGMT_LQI_REQ_SRSP = 0x6531;
static const uint16_t ZDO_MGMT_LQI_RSP = 0x45b1;

static const uint16_t ZDO_MGMT_RTG_REQ = 0x2532;
static const uint16_t ZDO_MGMT_RTG_REQ_SRSP = 0x6532;
static const uint16_t ZDO_MGMT_RTG_RSP = 0x45b2;

static const uint16_t ZDO_MGMT_BIND_REQ = 0x2533;
static const uint16_t ZDO_MGMT_BIND_REQ_SRSP = 0x6533;
static const uint16_t ZDO_MGMT_BIND_RSP = 0x45b3;

static const uint16_t ZDO_MGMT_LEAVE_REQ = 0x2534;
static const uint16_t ZDO_MGMT_LEAVE_REQ_SRSP = 0x6534;
static const uint16_t ZDO_MGMT_LEAVE_RSP = 0x45b4;

static const uint16_t ZDO_MGMT_DIRECT_JOIN_REQ = 0x2535;
static const uint16_t ZDO_MGMT_DIRECT_JOIN_REQ_SRSP = 0x6535;
static const uint16_t ZDO_MGMT_DIRECT_JOIN_RSP = 0x45b5;

//This command is generated to request a Management Join Request
static const uint16_t ZDO_MGMT_PERMIT_JOIN_REQ = 0x2536;
static const uint16_t ZDO_MGMT_PERMIT_JOIN_REQ_SRSP = 0x6536;
static const uint16_t ZDO_MGMT_PERMIT_JOIN_RSP = 0x45b6;

static const uint16_t ZDO_MGMT_NWK_UPDATE_REQ = 0x2537;
static const uint16_t ZDO_MGMT_NWK_UPDATE_REQ_SRSP = 0x6537;

//This command registers for a ZDO callback
static const uint16_t ZDO_MSG_CB_REGISTER=0x253e;
static const uint16_t ZDO_MSG_CB_REGISTER_SRSP=0x653e;

// In the case where compiler flag HOLD_AUTO_START is defined by default;
// device will start from HOLD state. Issuing this command will trigger the
// device to leave HOLD state to form or join a network.
static const uint16_t ZDO_STARTUP_FROM_APP=0x2540;
static const uint16_t ZDO_STARTUP_FROM_APP_SRSP=0x6540;

//ZDO state change indication
static const uint16_t ZDO_STATE_CHANGE_IND = 0x45c0;

//ZDO Src Route indication
static const uint16_t ZDO_SRC_RTG_IND = 0x45c4;

//ZDO leave indication
static const uint16_t ZDO_LEAVE_IND = 0x45c9;

//ZDO Trust Center end device announce indication
static const uint16_t ZDO_TC_DEVICE_IND = 0x45ca;

//ZDO permit join indication
static const uint16_t ZDO_PERMIT_JOIN_IND = 0x45cb;

//This callback message contains a ZDO cluster response
static const uint16_t ZDO_MSG_CB_INCOMING = 0x45ff;

//TI Zigbee Waiting Definitions
enum class WAITING_FOR {
  NOTHING=0,
  ANYTHING, //Waiting for any valid packet
  SYS_PING_RESPONSE,
  SYS_VERSION_RESPONSE,
  SYS_RESET_RESPONSE,
  ZB_DEVICE_INFO_RESPONSE,
  ZB_READ_CONFIG_RESPONSE,
  ZB_WRITE_CONFIG_RESPONSE,
  AF_REGISTER_SRESPONSE,
  ZDO_MSG_CB_REGISTER_SRESPONSE,
  ZDO_STARTUP_FROM_APP_SRESPONSE
};

// Dongle startup options
namespace STARTOPT {
  static const uint8_t CLEAR_CONFIG = 0x01;
  static const uint8_t CLEAR_STATE = 0x02;
}

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

/// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE</name>
/// <summary>Reset type</summary>
namespace DEV_INFO_TYPE {
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.CHANNEL</name>
  /// <summary>Reset type</summary>
  static const uint8_t CHANNEL = 5;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.EXT_PAN_ID</name>
  /// <summary>Reset type</summary>
  static const uint8_t EXT_PAN_ID = 7;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.IEEE_ADDR</name>
  /// <summary>Reset type</summary>
  static const uint8_t IEEE_ADDR = 1;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.PAN_ID</name>
  /// <summary>Reset type</summary>
  static const uint8_t PAN_ID = 6;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.PARENT_IEEE_ADDR</name>
  /// <summary>Reset type</summary>
  static const uint8_t PARENT_IEEE_ADDR = 4;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.PARENT_SHORT_ADDR</name>
  /// <summary>Reset type</summary>
  static const uint8_t PARENT_SHORT_ADDR = 3;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.SHORT_ADDR</name>
  /// <summary>Reset type</summary>
  static const uint8_t SHORT_ADDR = 2;
  /// <name>TI.ZPI2.ZB_GET_DEVICE_INFO.DEV_INFO_TYPE.STATE</name>
  /// <summary>Reset type</summary>
  static const uint8_t STATE = 0;
}

//For ZB_READ and ZB_WRITE CONFIGURATION
namespace CONFIG_ID {
  static const uint8_t ZCD_NV_STARTUP_OPTION = 0x03;
  static const uint8_t ZCD_NV_LOGICAL_TYPE = 0x87; //Zigbee Node Mode
  static const uint8_t ZCD_NV_POLL_RATE = 0x24;
  static const uint8_t ZCD_NV_QUEUED_POLL_RATE = 0x25;
  static const uint8_t ZCD_NV_RESPONSE_POLL_RATE = 0x26;
  static const uint8_t ZCD_NV_POLL_FAILURE_RETRIES = 0x29;
  static const uint8_t ZCD_NV_INDIRECT_MSG_TIMEOUT = 0x2B;
  static const uint8_t ZCD_NV_APS_FRAME_RETRIES = 0x43;
  static const uint8_t ZCD_NV_APS_ACK_WAIT_DURATION = 0x44;
  static const uint8_t ZCD_NV_BINDING_TIME = 0x46;
  static const uint8_t ZCD_NV_USERDESC = 0x81;
  static const uint8_t ZCD_NV_PANID = 0x83;
  static const uint8_t ZCD_NV_CHANLIST = 0x84;
  static const uint8_t ZCD_NV_PRECFGKEY = 0x62; //Network Key
  static const uint8_t ZCD_NV_PRECFGKEYS_ENABLE = 0x63; //Whether to distribute the network key in clear
  static const uint8_t ZCD_NV_SECURITY_MODE = 0x64;
  static const uint8_t ZCD_NV_BCAST_RETRIES = 0x2E;
  static const uint8_t ZCD_NV_PASSIVE_ACK_TIMEOUT = 0x2F;
  static const uint8_t ZCD_NV_BCAST_DELIVERY_TIME = 0x30;
  static const uint8_t ZCD_NV_ROUTE_EXPIRY_TIME = 0x2C;
  static const uint8_t ZCD_NV_EXTPANID = 0x2D;
}

namespace NetworkMode {
  static const uint8_t Coordinator=0;
  static const uint8_t Router=1;
  static const uint8_t EndDevice=2;
}

namespace ZDO_STARTUP_STATUS {
  static const uint8_t DEV_HOLD=0x00; // Initialized - not started automatically
  static const uint8_t DEV_INIT=0x01; // Initialized - not connected to anything
  static const uint8_t DEV_NWK_DISC=0x02; // Discovering PAN's to join
  static const uint8_t DEV_NWK_JOINING=0x03; // Joining a PAN
  static const uint8_t DEV_NWK_REJOINING=0x04; // ReJoining a PAN, only for end-devices
  static const uint8_t DEV_END_DEVICE_UNAUTH=0x05; // Joined but not yet authenticated by trust center
  static const uint8_t DEV_END_DEVICE=0x06; // Started as device after authentication
  static const uint8_t DEV_ROUTER=0x07; // Device joined, authenticated and is a router
  static const uint8_t DEV_COORD_STARTING=0x08; // Started as ZigBee Coordinator
  static const uint8_t DEV_ZB_COORD=0x09; // Started as ZigBee Coordinator
  static const uint8_t DEV_NWK_ORPHAN=0x0A; // Device has lost information about its parent
}

namespace JOIN_MODE_STATE {
  static const uint8_t DISABLED=0; //Permanently disabled join mode
  static const uint8_t TEMP_ENABLED=1; //Join mode enabled for a set number of seconds
  static const uint8_t ENABLED=2; //Permanently enabled join mode
}

//TI Zigbee Other Definitions
static const uint8_t BOOTLOADER_MAGIC_BYTE1=0xFE;
static const uint8_t BOOTLOADER_MAGIC_BYTE2=0x07;
static const uint8_t BOOTLOADER_MAGIC_BYTE3=0xEF;

//Ported from TI Z-Stack: Components/osal/include/{comdef.h and ZComDef.h}
namespace STATUS {

/*** Generic Status Return Values ***/
#define SUCCESS                   0x00
#define FAILURE                   0x01
#define INVALIDPARAMETER          0x02
#define INVALID_TASK              0x03
#define MSG_BUFFER_NOT_AVAIL      0x04
#define INVALID_MSG_POINTER       0x05
#define INVALID_EVENT_ID          0x06
#define INVALID_INTERRUPT_ID      0x07
#define NO_TIMER_AVAIL            0x08
#define NV_ITEM_UNINIT            0x09
#define NV_OPER_FAILED            0x0A
#define INVALID_MEM_SIZE          0x0B
#define NV_BAD_ITEM_LEN           0x0C
#define NV_INVALID_DATA           0x0D

// ZStack status values must start at 0x10, after the generic status values (defined in comdef.h)
#define ZMemError                   0x10
#define ZBufferFull                 0x11
#define ZUnsupportedMode            0x12
#define ZMacMemError                0x13

#define ZSapiInProgress             0x20
#define ZSapiTimeout                0x21
#define ZSapiInit                   0x22

#define ZNotAuthorized              0x7E

#define ZMalformedCmd               0x80
#define ZUnsupClusterCmd            0x81

// OTA Status values
#define ZOtaAbort                   0x95
#define ZOtaImageInvalid            0x96
#define ZOtaWaitForData             0x97
#define ZOtaNoImageAvailable        0x98
#define ZOtaRequireMoreImage        0x99

// APS status values
#define ZApsFail                    0xb1
#define ZApsTableFull               0xb2
#define ZApsIllegalRequest          0xb3
#define ZApsInvalidBinding          0xb4
#define ZApsUnsupportedAttrib       0xb5
#define ZApsNotSupported            0xb6
#define ZApsNoAck                   0xb7
#define ZApsDuplicateEntry          0xb8
#define ZApsNoBoundDevice           0xb9
#define ZApsNotAllowed              0xba
#define ZApsNotAuthenticated        0xbb

  // Security status values
#define ZSecNoKey                   0xa1
#define ZSecOldFrmCount             0xa2
#define ZSecMaxFrmCount             0xa3
#define ZSecCcmFail                 0xa4
#define ZSecFailure                 0xad

  // NWK status values
#define ZNwkInvalidParam            0xc1
#define ZNwkInvalidRequest          0xc2
#define ZNwkNotPermitted            0xc3
#define ZNwkStartupFailure          0xc4
#define ZNwkAlreadyPresent          0xc5
#define ZNwkSyncFailure             0xc6
#define ZNwkTableFull               0xc7
#define ZNwkUnknownDevice           0xc8
#define ZNwkUnsupportedAttribute    0xc9
#define ZNwkNoNetworks              0xca
#define ZNwkLeaveUnconfirmed        0xcb
#define ZNwkNoAck                   0xcc  // not in spec
#define ZNwkNoRoute                 0xcd

  // MAC status values
#define ZMacSuccess                 0x00
#define ZMacBeaconLoss              0xe0
#define ZMacChannelAccessFailure    0xe1
#define ZMacDenied                  0xe2
#define ZMacDisableTrxFailure       0xe3
#define ZMacFailedSecurityCheck     0xe4
#define ZMacFrameTooLong            0xe5
#define ZMacInvalidGTS              0xe6
#define ZMacInvalidHandle           0xe7
#define ZMacInvalidParameter        0xe8
#define ZMacNoACK                   0xe9
#define ZMacNoBeacon                0xea
#define ZMacNoData                  0xeb
#define ZMacNoShortAddr             0xec
#define ZMacOutOfCap                0xed
#define ZMacPANIDConflict           0xee
#define ZMacRealignment             0xef
#define ZMacTransactionExpired      0xf0
#define ZMacTransactionOverFlow     0xf1
#define ZMacTxActive                0xf2
#define ZMacUnAvailableKey          0xf3
#define ZMacUnsupportedAttribute    0xf4
#define ZMacUnsupported             0xf5
#define ZMacSrcMatchInvalidIndex    0xff

}

//TI Zigbee Structures

//---------------
//Request Packets
//---------------

//This header is present in every TI Zigbee api packet
//LSB 1-byte Checksum follows the payload and is the sum of all values from primary header to end of payload
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) tizigbee_api_header_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t param1; //First parameter goes here
  uint8_t checksum;
} __attribute__((packed)) tizigbee_api_header_with_8bit_param_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t param1; //First parameter goes here
  uint8_t checksum;
} __attribute__((packed)) tizigbee_api_header_with_16bit_param_t;

//SYS_RESET api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t reset_type; //RESET_TYPE type
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_reset_t;

//AF_REGISTER api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t endpoint;
  uint16_t profileid; //LSB, MSB
  uint16_t devid; //LSB, MSB
  uint8_t devver;
  uint8_t zero;
  uint8_t clusterlist; //First zigbee_zdo_node_clusters_t is input clusters list then output clusters to match
  uint8_t checksum;
} __attribute__((packed)) tizigbee_af_register_t;

//ZB_GET_DEVICE_INFO api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t devinfotype; //Type of device info to retrieve
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_get_device_info_t;

//ZB_WRITE_CONFIGURATION api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t configid;
  uint8_t vallen; //Length of value
  uint8_t value;
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_req_8bit_t;

//ZB_WRITE_CONFIGURATION api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t configid;
  uint8_t vallen; //Length of value
  uint16_t value; //LSB, MSB
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_req_16bit_t;

//ZB_WRITE_CONFIGURATION api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t configid;
  uint8_t vallen; //Length of value
  uint32_t value; //LSB, MSB
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_req_32bit_t;

//ZB_WRITE_CONFIGURATION api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t configid;
  uint8_t vallen; //Length of value
  uint64_t value; //LSB, MSB
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_req_64bit_t;

//ZB_WRITE_CONFIGURATION api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t configid;
  uint8_t vallen; //Length of value
  uint8_t value[8]; //LSB, MSB
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_req_8byte_t;

//ZDO_MSG_CB_REGISTER api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t cluster; //LSB, MSB: The cluster to listen for or 0xFFFF to listen for all clusters
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_msg_cb_register_t;

//ZDO_STARTUP_FROM_APP api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t start_delay; //LSB, MSB: Specifies the time delay before the device starts in milliseconds
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_startup_from_app_t;

//Generic Zigbee ZDO request with appropriate values for sending any type of ZDO Command
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Should be set to zigbeelib->zdocmd->zigbeelength+2 , structure size will be this length+5
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t destnetaddr; //LSB, MSB
  uint8_t zigbeepayload; //Maps to the ZDO command structure
  uint8_t checksum; //This goes after the zigbee payload
} __attribute__((packed)) tizigbee_zdo_general_request_t;

//Generic Zigbee ZDO request without destnetaddr with appropriate values for sending any type of ZDO Command
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Should be set to zigbeelib->zdocmd->zigbeelength+2 , structure size will be this length+5
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t zigbeepayload; //Maps to the ZDO command structure
  uint8_t checksum; //This goes after the zigbee payload
} __attribute__((packed)) tizigbee_zdo_general_request_without_destnetaddr_t;

//ZDO_IEEE_ADDR_REQ api packet
typedef tizigbee_zdo_general_request_without_destnetaddr_t tizigbee_zdo_mgmt_ieee_addr_req_t;

//ZDO_MATCH_DESC_REQ api packet
typedef tizigbee_zdo_general_request_t tizigbee_zdo_match_desc_req_t;

//ZDO_MGMT_LQI_REQ api packet
typedef tizigbee_zdo_general_request_t tizigbee_zdo_mgmt_lqi_req_t;

//ZDO_MGMT_PERMIT_JOIN_REQ api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t addrmode; //0x02 - Address 16 bit, 0x0F - Broadcast
  uint16_t netaddr; //LSB, MSB
  uint8_t duration; //Specifies the time that joining should be enabled (in seconds), 0=Disabled, or 0xFF=Enabled permanently
  uint8_t trust_center_significance; //If set to 1 and remote is a trust center, the command affects the trust center authentication policy, otherwise it has no effect
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_mgmt_permit_join_req_t;

//ZDO_SEND_DATA api packet
//Can be used to send any ZDO packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t destnetaddr; //LSB, MSB
  uint8_t seqnumber;
  uint16_t clusterid; //LSB, MSB: Cluster ID
  uint8_t zigbeelength;
  uint8_t zigbeepayload; //Maps to the ZDO command structure
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_send_data_t;

//AF_DATA_REQUEST api packet 16-bit address version
//Can be used to send any ZDO or ZCL packet
//NOTE: TI Zigbee Command: ZDO_SEND_DATA sets options to 0x0 and radius 0x1E
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length;
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t netaddr; //LSB, MSB
  uint8_t destendpoint;
  uint8_t srcendpoint;
  uint16_t clusterid; //LSB: Cluster ID
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t options; //0x02: AF_WILDCARD_PROFILEID: Will force the message to use Wildcard ProfileID
                   //0x04: AF_PREPROCESS: Will force APS to callback to preprocess before calling NWK layer
                   //0x08: AF_LIMIT_CONCENTRATOR: Check if route is available before sending data
                   //0x10: AF_ACK_REQUEST: Require a response to be returned
                   //0x20: AF_SUPRESS_ROUTE_DISC_NETWORK: Supress Route Discovery for intermediate routes
                   //0x40: AF_EN_SECURITY: Enable security
                   //0x80: AF_SKIP_ROUTING
  uint8_t radius; //the number of hops allowed to deliver the message; usually use 7
  uint8_t zigbeelength;
  uint8_t zigbeepayload; //Maps to the command structure depending what cmdid was specified
  uint8_t checksum;
} __attribute__((packed)) tizigbee_af_data_request_t;

typedef struct {
  uint8_t frame_control; //bits 0-1: 0=ZCL General Command
                         //          1=Cluster-Specific Command
                         //bit 2: 1=Manufacturer-Specific Command
                         //bit 3: 0=Client to Server
                         //       1=Server to Client
                         //bit 4: 1=Disable Default Response
                         //bits 5-7: Reserved
  uint8_t seqnumber;
  uint8_t cmdid; //The Zigbee ZCL Command ID
  uint8_t zigbeepayload; //Maps to the ZCL command structure depending what cmdid was specified
} __attribute__((packed)) tizigbee_zcl_general_request_t;

typedef struct {
  uint8_t frame_control; //bits 0-1: 0=ZCL General Command
                         //          1=Cluster-Specific Command
                         //bit 2: 1=Manufacturer-Specific Command
                         //bit 3: 0=Client to Server
                         //       1=Server to Client
                         //bit 4: 1=Disable Default Response
                         //bits 5-7: Reserved
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t seqnumber;
  uint8_t cmdid; //The Zigbee ZCL Command ID
  uint8_t zigbeepayload; //Maps to the ZCL command structure depending what cmdid was specified
} __attribute__((packed)) tizigbee_zcl_general_request_with_manu_t;

//----------------
//Response Packets
//----------------

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) tizigbee_api_response_t;

typedef struct {
  uint8_t frame_start;
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t capabilities; //First byte is LSB, second byte is MSB
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_ping_response_t;

typedef struct {
  uint8_t frame_start;
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t transportrev; //Transport Revision
  uint8_t product; //Product Type
  uint8_t major_firmware_version;
  uint8_t minor_firmware_version;
  uint8_t hwrev; //Hardware Revision
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_version_response_t;

typedef struct {
  uint8_t frame_start;
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t reason; //Reset Reason
  uint8_t transportrev; //Transport Revision
  uint8_t product; //Product Type
  uint8_t major_firmware_version;
  uint8_t minor_firmware_version;
  uint8_t hwrev; //Hardware Revision
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_reset_response_t;

//ZB_GET_DEVICE_INFO_RESPONSE api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length is always 8
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t devinfotype; //Type of device info in this response
  multitypeval_t devinfo;
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_get_device_info_response_t;

//ZB_READ_CONFIGURATION_RESPONSE api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the read operation (0=Success)
  uint8_t configid; //The identifier of the property that was read
  uint8_t proplen; //The length of the property
  multitypeval_t value; //The value of the property
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_read_configuration_response_t;

//ZB_WRITE_CONFIGURATION_RESPONSE api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the write operation (0=Success)
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_write_configuration_response_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the read operation (0=Success)
  uint8_t configid; //The identifier of the property that was read
  uint8_t proplen; //The length of the property
  uint8_t NetworkMode; //The current network mode of the TI Zigbee
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_read_configuration_response_nv_logical_type_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the read operation (0=Success)
  uint8_t configid; //The identifier of the property that was read
  uint8_t proplen; //The length of the property
  uint8_t networkKey[16]; //LSB, MSB: The network key being used
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_read_configuration_response_nv_precfgkey_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the read operation (0=Success)
  uint8_t configid; //The identifier of the property that was read
  uint8_t proplen; //The length of the property
  uint8_t distributeNetworkKey; //0 or 1: Whether to distribute the network key in clear
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_read_configuration_response_nv_precfgkeys_enable_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the read operation (0=Success)
  uint8_t configid; //The identifier of the property that was read
  uint8_t proplen; //The length of the property
  uint8_t securityMode;
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_read_configuration_response_nv_security_mode_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the command (0=Success)
} __attribute__((packed)) tizigbee_zdo_generic_srsp_t;

//ZDO_STATE_CHANGE_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The status: ZDO_STARTUP_STATUS
} __attribute__((packed)) tizigbee_zdo_state_change_ind_t;

//ZDO_SRC_RTG_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t srcnetaddr; //LSB, MSB : Network Address of the remote Zigbee device
  uint8_t numrelays;
  uint16_t relaynetaddr[128]; //A network address in the relay list
  uint8_t checksum; //This is after numrelays*sizeof(uint16_t)
} __attribute__((packed)) tizigbee_zdo_src_rtg_ind_t;

//ZDO_LEAVE_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t srcnetaddr; //LSB, MSB : Network Address of the remote Zigbee device
  uint64_t addr; //LSB, MSB : 64-bit IEEE Address of the remote Zigbee device
  uint16_t netaddr; //LSB, MSB : IS this the Zigbee coordinator/router device that connected the end device?
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_leave_ind_t;

//ZDO_TC_DEVICE_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t srcnetaddr; //LSB, MSB : Network Address of the remote Zigbee device
  uint64_t addr; //LSB, MSB : 64-bit IEEE Address of the remote Zigbee device
  uint16_t netaddr; //LSB, MSB : IS this the Zigbee coordinator/router device that connected the end device?
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_tc_device_ind_t;

//ZDO_PERMIT_JOIN_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t value; //Unknown
} __attribute__((packed)) tizigbee_zdo_permit_join_ind_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t srcnetaddr; //LSB, MSB
  uint8_t wasBroadcast;
  uint16_t clusterid; //LSB, MSB
  uint8_t securityUse;
  uint8_t seqnumber;
  uint16_t destnetaddr; //LSB, MSB
  uint8_t status; //status from remote Zigbee device
  uint8_t zigbeepayload; //Rest of zigbee data
} __attribute__((packed)) tizigbee_zdo_msg_cb_incoming_t;

//AF_DATA_CONFIRM
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t status; //The result of the command (0=Success)
  uint8_t endpoint;
  uint8_t seqnumber;
} __attribute__((packed)) tizigbee_af_data_confirm_t;

typedef tizigbee_zdo_generic_srsp_t tizigbee_af_data_srsp_t;

//AF_INCOMING_MSG
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes in the payload
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t groupid; //LSB, MSB: Message's group ID - 0 if not set
  uint16_t clusterid; //LSB, MSB
  uint16_t srcnetaddr; //LSB, MSB
  uint8_t srcendpoint;
  uint8_t destendpoint;
  uint8_t wasbroadcast;
  uint8_t linkquality;
  uint8_t securityuse; //Not used
  uint32_t timestamp;
  uint8_t seqnumber; //Often seems to be 0
  uint8_t zigbeelength; //Seems to be the length of the zcl zigbeepayload or +2 when manu specific command
  uint8_t zigbeepayload;
} __attribute__((packed)) tizigbee_af_incoming_msg_t;

} //End of namespace

#endif
