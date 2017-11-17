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

//Reads current device information
static const uint16_t ZB_GET_DEVICE_INFO=0x2606;
static const uint16_t ZB_GET_DEVICE_INFO_RESPONSE=0x6606;

//Reads a configuration property from nonvolatile memory
static const uint16_t ZB_READ_CONFIGURATION=0x2604;
static const uint16_t ZB_READ_CONFIGURATION_RESPONSE = 0x6604;

//Writes a configuration property to nonvolatile memory
static const uint16_t ZB_WRITE_CONFIGURATION=0x2605;
static const uint16_t ZB_WRITE_CONFIGURATION_RESPONSE=0x6605;

//This command registers for a ZDO callback
static const uint16_t ZDO_MSG_CB_REGISTER=0x253e;
static const uint16_t ZDO_MSG_CB_REGISTER_SRSP=0x653e;

// In the case where compiler flag HOLD_AUTO_START is defined by default;
// device will start from HOLD state. Issuing this command will trigger the
// device to leave HOLD state to form or join a network.
static const uint16_t ZDO_STARTUP_FROM_APP=0x2540;
static const uint16_t ZDO_STARTUP_FROM_APP_SRSP=0x6540;

//This command is generated to request a Management LQI Request
static const uint16_t ZDO_MGMT_LQI_REQ = 0x2531;
static const uint16_t ZDO_MGMT_LQI_REQ_SRSP = 0x6531;
static const uint16_t ZDO_MGMT_LQI_RSP = 0x45b1;

//This command is generated to request a Management Join Request
static const uint16_t ZDO_MGMT_PERMIT_JOIN_REQ = 0x2536;
static const uint16_t ZDO_MGMT_PERMIT_JOIN_REQ_SRSP = 0x6536;
static const uint16_t ZDO_MGMT_PERMIT_JOIN_RSP = 0x45b6;

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
  ZDO_MSG_CB_REGISTER_SRESPONSE,
  ZDO_STARTUP_FROM_APP_SRESPONSE
};

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
  uint16_t param1; //First parameter goes here
  uint8_t checksum;
} __attribute__((packed)) tizigbee_api_header_with_16bit_param_t;

//SYS_RESET api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t reset_type; //RESET_TYPE type
  uint8_t checksum;
} __attribute__((packed)) tizigbee_sys_reset_t;

//ZB_GET_DEVICE_INFO api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t devinfotype; //Type of device info to retrieve
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zb_get_device_info_t;

//ZDO_MSG_CB_REGISTER api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t cluster; //LSB, MSB: The cluster to listen for or 0xFFFF to listen for all clusters
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_msg_cb_register_t;

//ZDO_STARTUP_FROM_APP api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t start_delay; //LSB, MSB: Specifies the time delay before the device starts in milliseconds
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_startup_from_app_t;

//ZDO_MGMT_LQI_REQ api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint16_t netaddr; //LSB, MSB
  uint8_t start_index;
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_mgmt_lqi_req_t;

//ZDO_MGMT_PERMIT_JOIN_REQ api packet
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Length=1
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t addrmode; //0x02 - Address 16 bit, 0x0F - Broadcast
  uint16_t netaddr; //LSB, MSB
  uint8_t duration; //Specifies the time that joining should be enabled (in seconds) or 0xFF to enable permanently
  uint8_t trust_center_significance; //If set to 1 and remote is a trust center, the command affects the trust center authentication policy, otherwise it has no effect
  uint8_t checksum;
} __attribute__((packed)) tizigbee_zdo_mgmt_permit_join_req_t;

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
  uint8_t checksum;
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
  uint8_t checksum;
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
  uint8_t networkKey[16]; //The network key being used
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
  uint8_t status; //The result of the command (0=Success)
} __attribute__((packed)) tizigbee_zdo_generic_srsp_t;

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

} //End of namespace

#endif
