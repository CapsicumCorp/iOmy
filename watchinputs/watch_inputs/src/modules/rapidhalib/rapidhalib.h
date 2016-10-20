/*
Title: RapidHA Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for rapidhalib.c
Copyright: Capsicum Corporation 2010-2016

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

RapidHA info sourced from MMB Research RapidHA docs
*/

#ifndef RAPIDHALIB_H
#define RAPIDHALIB_H

#include <inttypes.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#pragma pack(pop)

#define RAPIDHALIBINTERFACE_VER_1 1 //A version number for the rapidhalib interface version

//RapidHA Primary Frame Types
#define RAPIDHA_UTILITY 0x55
#define RAPIDHA_NETWORK_COMISSIONING 0x01
#define RAPIDHA_ZIGBEE_SECURITY_CONFIG 0x02
#define RAPIDHA_ZIGBEE_SUPPORT_CONFIG 0x03
#define RAPIDHA_ZIGBEE_ZDO 0x04
#define RAPIDHA_ZIGBEE_ZCL_GENERAL 0x05
#define RAPIDHA_ZIGBEE_GENERAL_CLUSTERS 0x11
#define RAPIDHA_ZIGBEE_HA_CLUSTERS 0x12
#define RAPIDHA_BOOTLOAD 0x0B

//RapidHA Utility Secondary Frame Types
#define RAPIDHA_UTILITY_RESET 0x00
#define RAPIDHA_UTILITY_MODULE_INFO_REQUEST 0x02
#define RAPIDHA_UTILITY_MODULE_INFO_RESPONSE 0x03
#define RAPIDHA_UTILITY_BOOTLOADER_VERSION_REQUEST 0x04
#define RAPIDHA_UTILITY_BOOTLOADER_VERSION_RESPONSE 0x05
#define RAPIDHA_UTILITY_RESTORE_DEFAULTS 0x10
#define RAPIDHA_UTILITY_HOST_STARTUP_READY 0x20
#define RAPIDHA_UTILITY_STARTUP_SYNC_REQUEST 0x21
#define RAPIDHA_UTILITY_STARTUP_SYNC_COMPLETE 0x22
#define RAPIDHA_UTILITY_STARTUP_ANTENNA_CONFIGURATION_REQUEST 0x23
#define RAPIDHA_UTILITY_STARTUP_ANTENNA_CONFIGURATION_RESPONSE 0x24
#define RAPIDHA_UTILITY_STARTUP_ANTENNA_CONFIGURATION_WRITE 0x25
#define RAPIDHA_UTILITY_LED_CONFIGURATION_REQUEST 0x26
#define RAPIDHA_UTILITY_LED_CONFIGURATION_RESPONSE 0x27
#define RAPIDHA_UTILITY_LED_CONFIGURATION_WRITE 0x28
#define RAPIDHA_UTILITY_SERIAL_ACK_CONFIG_WRITE 0x30
#define RAPIDHA_UTILITY_SERIAL_ACK_CONFIG_REQUEST 0x31
#define RAPIDHA_UTILITY_SERIAL_ACK_CONFIG_RESPONSE 0x32
#define RAPIDHA_UTILITY_MANU_ID_REQUEST 0x40
#define RAPIDHA_UTILITY_MANU_ID_RESPONSE 0x41
#define RAPIDHA_UTILITY_MANU_ID_WRITE 0x42
#define RAPIDHA_UTILITY_STATUS_RESPONSE 0x80
#define RAPIDHA_UTILITY_ERROR 0xE0

//RapidHA Network Comissioning Secondary Frame Types
#define RAPIDHA_NETWORK_COMISSIONING_JOIN_NETWORK 0x00
#define RAPIDHA_NETWORK_COMISSIONING_FORM_NETWORK 0x01
#define RAPIDHA_NETWORK_COMISSIONING_PERMIT_JOIN 0x03
#define RAPIDHA_NETWORK_COMISSIONING_LEAVE_NETWORK 0x04
#define RAPIDHA_NETWORK_COMISSIONING_REJOIN_NETWORK 0x05
#define RAPIDHA_NETWORK_COMISSIONING_NETWORK_STATUS_REQUEST 0x08
#define RAPIDHA_NETWORK_COMISSIONING_NETWORK_STATUS_RESPONSE 0x09
#define RAPIDHA_NETWORK_COMISSIONING_TRUST_CENTER_DEVICE_UPDATE 0x10

//RapidHA Security Configuration Secondary Frame Types
#define RAPIDHA_SECURITY_CONFIG_PRECONFIGURED_KEY_OPTION_WRITE 0x00
#define RAPIDHA_SECURITY_CONFIG_PRECONFIGURED_KEY_OPTION_REQUEST 0x01
#define RAPIDHA_SECURITY_CONFIG_PRECONFIGURED_KEY_OPTION_RESPONSE 0x02
#define RAPIDHA_SECURITY_CONFIG_INSTALL_CODE_REQUEST 0x03
#define RAPIDHA_SECURITY_CONFIG_INSTALL_CODE_RESPONSE 0x04
#define RAPIDHA_SECURITY_CONFIG_LINK_KEY_WRITE 0x05
#define RAPIDHA_SECURITY_CONFIG_LINK_KEY_REQUEST 0x06
#define RAPIDHA_SECURITY_CONFIG_LINK_KEY_RESPONSE 0x07
#define RAPIDHA_SECURITY_CONFIG_NETWORK_KEY_WRITE 0x08
#define RAPIDHA_SECURITY_CONFIG_NETWORK_KEY_REQUEST 0x09
#define RAPIDHA_SECURITY_CONFIG_NETWORK_KEY_RESPONSE 0x0A

//RapidHA Support Config Secondary Frame Types
#define RAPIDHA_SUPPORT_CONFIG_DEVICE_TYPE_WRITE 0x00
#define RAPIDHA_SUPPORT_CONFIG_DEVICE_TYPE_REQUEST 0x01
#define RAPIDHA_SUPPORT_CONFIG_DEVICE_TYPE_RESPONSE 0x02
#define RAPIDHA_SUPPORT_CONFIG_ADD_ENDPOINT 0x10
#define RAPIDHA_SUPPORT_CONFIG_ENDPOINT_LIST_REQUEST 0x11
#define RAPIDHA_SUPPORT_CONFIG_ENDPOINT_LIST_RESPONSE 0x12
#define RAPIDHA_SUPPORT_CONFIG_ENDPOINT_DESCRIPTOR_REQUEST 0x13
#define RAPIDHA_SUPPORT_CONFIG_ENDPOINT_DESCRIPTOR_RESPONSE 0x14
#define RAPIDHA_SUPPORT_CONFIG_ADD_ATTRIBUTES_TO_CLUSTER 0x20
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_LIST_REQUEST 0x21
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_LIST_RESPONSE 0x22
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_REQUEST 0x23
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_RESPONSE 0x24
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_WRITE 0x25
#define RAPIDHA_SUPPORT_CONFIG_ATTRIBUTE_REPORT_PASSTHROUGH_CONTROL 0x26
#define RAPIDHA_SUPPORT_CONFIG_CLEAR_ENDPOINT_CONFIG 0x30
#define RAPIDHA_SUPPORT_CONFIG_REGISTER_COMMANDS_PASSTHRU 0x80

//RapidHA Zigbee ZDO Secondary Frame Types
#define RAPIDHA_ZIGBEE_ZDO_INCOMING_MESS 0x00
#define RAPIDHA_ZIGBEE_ZDO_SEND_UNICAST 0x01
#define RAPIDHA_ZIGBEE_ZDO_SEND_BCAST 0x02
#define RAPIDHA_ZIGBEE_ZDO_SEND_STATUS 0x03
#define RAPIDHA_ZIGBEE_ZDO_APS_ACK 0x0F
#define RAPIDHA_ZIGBEE_ZDO_RESPONSE_RECEIVED 0x05
#define RAPIDHA_ZIGBEE_ZDO_RESPONSE_TIMEOUT 0x06
#define RAPIDHA_ZIGBEE_ZDO_DEVICE_ANNOUNCE_RECEIVED 0x1E

//RapidHA Zigbee ZCL Secondary Frame Types
#define RAPIDHA_ZIGBEE_ZCL_SEND_UNICAST 0x00
#define RAPIDHA_ZIGBEE_ZCL_SEND_MCAST 0x01
#define RAPIDHA_ZIGBEE_ZCL_SEND_BCAST 0x02
#define RAPIDHA_ZIGBEE_ZCL_SEND_STATUS 0x03
#define RAPIDHA_ZIGBEE_ZCL_APS_ACK 0x10
#define RAPIDHA_ZIGBEE_ZCL_RESPONSE_RECEIVED 0x11
#define RAPIDHA_ZIGBEE_ZCL_RESPONSE_TIMEOUT 0x12
#define RAPIDHA_ZIGBEE_ZCL_RECEIVED_WRITE_ATTR 0x14
#define RAPIDHA_ZIGBEE_ZCL_PASSTHRU_MESS 0x20
#define RAPIDHA_ZIGBEE_ZCL_READ_ATTR_REQUEST 0x30
#define RAPIDHA_ZIGBEE_ZCL_READ_ATTR_RESPONSE 0x31
#define RAPIDHA_ZIGBEE_ZCL_WRITE_ATTR_REQUEST 0x32
#define RAPIDHA_ZIGBEE_ZCL_WRITE_ATTR_RESPONSE 0x33

//RapidHA Status Responses
#define RAPIDHA_STATUS_RESPONSE_SUCCESS 0x00
#define RAPIDHA_STATUS_RESPONSE_INVALID_CALL 0x01
#define RAPIDHA_STATUS_RESPONSE_INVALID_DATA 0x02
#define RAPIDHA_STATUS_RESPONSE_UNSUPPORTED 0x03
#define RAPIDHA_STATUS_RESPONSE_STORAGE_FULL 0x04
#define RAPIDHA_STATUS_RESPONSE_NO_ENTRY_FOUND 0x05
#define RAPIDHA_STATUS_RESPONSE_INVALID_DATA_TYPE 0x06
#define RAPIDHA_STATUS_RESPONSE_INCORRECT_LENGTH 0x07
#define RAPIDHA_STATUS_RESPONSE_ENDPOINT_NOT_FOUND 0x08
#define RAPIDHA_STATUS_RESPONSE_CLUSTER_NOT_FOUND 0x09
#define RAPIDHA_STATUS_RESPONSE_INVALID_DESTADDR 0x0A
#define RAPIDHA_STATUS_RESPONSE_NO_APS_KEY 0x0B
#define RAPIDHA_STATUS_RESPONSE_OUT_OF_MEMORY 0x0C
#define RAPIDHA_STATUS_RESPONSE_SEND_FAILURE 0x0D
#define RAPIDHA_STATUS_RESPONSE_APS_ACK_TIMEOUT 0x0E
#define RAPIDHA_STATUS_RESPONSE_ENDPOINT_CONFIG_LOCKED 0x0F
#define RAPIDHA_STATUS_RESPONSE_UNKNOWN_FAILURE 0xFF

//RapidHA/Zigbee Waiting Definitions
#define RAPIDHA_WAITING_FOR_ANYTHING 0x01 //Waiting for any valid RapidHA packet
#define RAPIDHA_WAITING_FOR_UTILITY_STARTUP_SYNC_REQUEST 0x02 //Waiting for RapidHA Startup Sync Request Packet
#define RAPIDHA_WAITING_FOR_UTILITY_MODULE_INFO_RESPONSE 0x03 //Waiting for RapidHA Module Info Response Packet
#define RAPIDHA_WAITING_FOR_NETWORK_COMISSIONING_NETWORK_STATUS_RESPONSE 0x04 //Waiting for RapidHA Network Comissioning Network Status Response
#define RAPIDHA_WAITING_FOR_ZDO_NODE_DESCRIPTOR_RESPONSE 0x05
#define RAPIDHA_WAITING_FOR_ZDO_SIMPLE_DESCRIPTOR_RESPONSE 0x06
#define RAPIDHA_WAITING_FOR_ZDO_ACTIVE_ENDPOINTS_RESPONSE 0x07
#define RAPIDHA_WAITING_FOR_ZCL_READ_ATTRIBUTE_RESPONSE 0x08
#define RAPIDHA_WAITING_FOR_ZCL_WRITE_ATTRIBUTE_RESPONSE 0x09
#define RAPIDHA_WAITING_FOR_RAPIDHA_UTILITY_STATUS_RESPONSE 0x0A
#define RAPIDHA_WAITING_FOR_RAPIDHA_ZIGBEE_ZDO_SEND_STATUS 0x0B
#define RAPIDHA_WAITING_FOR_RAPIDHA_ZIGBEE_ZCL_SEND_STATUS 0x0C

//RapidHA Running States
#define RAPIDHA_RUNSTATE_STARTINGUP 0x00
#define RAPIDHA_RUNSTATE_ALREADYRUNNING 0x01

//RapidHA Configuration States
#define RAPIDHA_CFGSTATE_FACTORY_DEFAULT 0x00
#define RAPIDHA_CFGSTATE_NEEDS_ENDPOINT_CONFIG 0x01
#define RAPIDHA_CFGSTATE_FULLY_CONFIGURED 0x02

//Unions
typedef union {
  uint8_t uval8bit;
  int8_t sval8bit;
  uint16_t uval16bit;
  int16_t sval16bit;
  uint32_t sval24bit; //Use & 0x00FFFFFF
  uint32_t uval24bit; //Use & 0x00FFFFFF
  uint32_t uval32bit;
  int32_t sval32bit;
  uint64_t uval48bit; //Use & 0x00FFFFFFFFFFFFFF
  int64_t sval48bit; //Use & 0x00FFFFFFFFFFFFFF
  uint64_t uval64bit;
  int64_t sval64bit;
} attrval_t; //Variable size depending on the data type

//RapidHA Structures

//This header is present in every RapidHA api packet
//LSB 2-byte Checksum follows the payload and is the sum of all values from primary header to end of payload
typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) rapidha_api_header_t;

//Can also use this for network comissioning join network
typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint32_t channelmask; //Use 0x03FFF800 to be compliant with ZigBee HA and SE and FCC
  uint8_t auto_options; //Bit0=1 - Auto PAN ID
                        //Bit1=1 - Auto Extended ID
  uint16_t panid; //Short PAN ID of network
  uint64_t extpanid; //Extended PAN ID of network
} __attribute__((packed)) rapidha_network_comissioning_form_network_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t duration; //The duration in seconds to permit joining, 0xFF=Permanent duration
} __attribute__((packed)) rapidha_network_comissioning_permit_join_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t device_function_type; //0x00=Full Function Device (Router or Coordinator)
                                //0x01=Reduced Function Device (End Device)
  uint8_t sleepy; //0x00=Non-Sleepy (Use this for Full Function Device as well)
                  //0x01=Sleepy
} __attribute__((packed)) rapidha_support_config_device_type_write_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t endpointid; //1-240
  uint16_t profileid;
  uint16_t deviceid;
  uint8_t device_version;
  uint8_t num_server_clusters;
  uint16_t server_clusters; //Variable length, LSB first
  //uint8_t num_client_clusters; //
  //uint_16_t client_clusters; //Variable length, LSB first
} __attribute__((packed)) rapidha_support_config_add_endpoint_t;

typedef struct {
  uint16_t id; //Attribute ID
  uint8_t type; //Attribute Type
  uint8_t properties; //Bit 0: 1=Writeable (OTA), 0=Read Only
                      //Bit 1: 0=Not Reportable, 1=Reportable)
                      //Bit 2-7: Reserved
} __attribute__((packed)) rapidha_support_config_add_attributes_records_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t endpointid; //1-240
  uint16_t clusterid;
  uint8_t serverclient; //0x00=Client, 0x01=Server
  uint8_t num_attrs; //Number of attributes to add
  rapidha_support_config_add_attributes_records_t attrs[80];
} __attribute__((packed)) rapidha_support_config_add_attributes_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t endpointid; //1-240
  uint16_t clusterid;
  uint8_t serverclient; //0x00=Client, 0x01=Server
  uint16_t attrid;
  uint8_t attrtype;
  uint8_t attrval[16]; //Variable size depending on attribute type
} __attribute__((packed)) rapidha_support_config_attribute_write_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t enable; //0=Disable passthrough of reporting, 1=Enable passthrough of reporting
} __attribute__((packed)) rapidha_support_config_attribute_report_passthrough_control_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t endpointid; //1-240
  uint16_t clusterid;
  uint8_t serverclient; //0x00=Client, 0x01=Server
  uint8_t numcmds; //Number of commands to pass through or 0xFF to Pass Through All Commands
  uint8_t cmds[80];
} __attribute__((packed)) rapidha_support_config_commands_passthru_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint16_t clusterid;
  uint8_t response_options; //bit0: 1=Custom Sequence Number
                            //bit1: 1=Enable Reception of APS ACK status messages
                            //bit2: 1=Enable Reception of ZDO Response with corresponding Transaction Sequence Number
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed)) rapidha_zdo_send_unicast_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr; //0xFFFF=All Devices
                    //0xFFFD=All Non-Sleepy Devices
                    //0xFFFC=All Routers and Coordinator
  uint8_t radius; //0=Maximum
  uint16_t clusterid;
  uint8_t response_options; //bit0: 1=Custom Sequence Number
                            //bit1: 1=Enable Reception of APS ACK status messages
                            //bit2: 1=Enable Reception of ZDO Response with corresponding Transaction Sequence Number
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed)) rapidha_zdo_send_bcast_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint8_t destendpnt;
  uint8_t srcendpnt;
  uint16_t clusterid;
  uint8_t response_options; //bit0: 1=Custom Sequence Number
                            //bit1: 1=Enable Reception of APS ACK status messages
                            //bit2: 1=Enable Reception of ZDO Response with corresponding Transaction Sequence Number
  uint8_t enclevel; //0x00=Network Encryption Only
                    //0x01=Network + APS Encryption
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t cmdid;
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed)) rapidha_zcl_send_unicast_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr; //0xFFFF=All Devices
                    //0xFFFD=All Non-Sleepy Devices
                    //0xFFFC=All Routers and Coordinator
  uint8_t destendpnt;
  uint8_t srcendpnt;
  uint16_t clusterid;
  uint8_t radius; //0=Maximum
  uint8_t response_options; //bit0: 1=Custom Sequence Number
                            //bit1: 1=Enable Reception of APS ACK status messages
                            //bit2: 1=Enable Reception of ZDO Response with corresponding Transaction Sequence Number
  uint8_t enclevel; //0x00=Network Encryption Only
                    //0x01=Network + APS Encryption
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t cmdid;
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed)) rapidha_zcl_send_bcast_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint8_t destendpnt;
  uint16_t clusterid;
  uint8_t clientserver_cluster; //0x00=Client, 0x01=Server
  uint8_t numattrs;
  uint8_t data;
} __attribute__((packed)) rapidha_zcl_read_attribute_request_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint8_t destendpnt;
  uint16_t clusterid;
  uint8_t clientserver_cluster; //0x00=Client, 0x01=Server
  uint8_t numattrs;
  uint8_t data;
} __attribute__((packed)) rapidha_zcl_write_attribute_request_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t payload; //Payload goes here: variable length
} __attribute__((packed)) rapidha_api_response_t;

typedef struct {
  uint8_t frame_start; //RapidHA set to 0xF1 , RapidSE set to 0xFE
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //(RapidHA Only) Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t major_firmware_version;
  uint8_t minor_firmware_version;
  uint8_t build_firmware_version;
  uint16_t application_information; //bits 0-3: 0=RapidSE ESP
                                    //          1=RapidSE Devices
                                    //          2=RapidHA
                                    //bits 4-5 (RapidSE Only): 0=Router
                                    //                         1=End Device
                                    //                         2=Sleepy End Device
                                    //bit 6 (RapidSE Only): 0=UART, 1=SPI
                                    //bit 7 (RapidSE Only): 0=No ECC, 1=ECC Supported
                                    //bit 8 (RapidSE Devices): Identify
                                    //bit 9 (RapidSE Devices): Permit Joining
                                    //bit 10 (RapidSE Devices): Device Discovery
                                    //bit 11 (RapidSE Devices): Device Descriptors
                                    //bit 12 (RapidSE Devices): Demand Response Cached Events
                                    //bit 13 (RapidSE Devices): Price Cached Events
  uint64_t addr; //Device EUI64 address
  uint8_t hardware_type; //RapidHA Only: 1=EM250
                         //              2=EM357
                         //              3=STM32W108
  uint8_t bootloader_type; //RapidHA Only: 0=Standard Bootloader
                           //              1=Application Bootloader
} __attribute__((packed)) rapidha_utility_module_info_response_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t running_state;
  uint8_t configuration_state;
} __attribute__((packed)) rapidha_utility_startup_sync_request_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t network_state; //0=Network Down
                         //1=Network Up
                         //2=Joining
                         //3=Forming
                         //4=Rejoining
                         //0xFF=Unknown
  uint8_t device_type; //0=Coordinator
                       //1=Router
                       //2=End Device
                       //3=Sleepy End Device
                       //0xFF=Unknown
  uint8_t channel; //0xFF=Unknown
  uint16_t netaddr; //0xFFFF=Unknown
  uint16_t panid;
  uint64_t extpanid;
  uint8_t remain_join_time;
} __attribute__((packed)) rapidha_network_comissioning_network_status_response_t;


typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t seqnumber; //Same value as on the ZDO/ZCL command that was sent out
  uint8_t status; //APS ACK Status: 0x00=APS ACK Received, 0x01=APS ACK Timed Out
} __attribute__((packed)) rapidha_aps_ack_header_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint16_t clusterid;
  uint8_t seqnumber;
  uint8_t zigbeelength;
  uint8_t status; //The 1st byte of the RapidHA zigbee payload is always the status byte
} __attribute__((packed)) rapidha_zigbee_zdo_response_received_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint8_t status;
  uint8_t seqnumber;
} __attribute__((packed)) zigbee_send_status_header_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t destnetaddr;
  uint16_t cluster;
  uint8_t seqnumber;
} __attribute__((packed)) zigbee_zdo_response_timeout_header_t;

//See http://www.anaren.com/air-wiki-zigbee/index.php/ZDO_END_DEVICE_ANNCE_IND
typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t netaddr;
  uint64_t addr;
  uint8_t capability; //BIT0: Alt. PAN Coordinator
                      //BIT1: Device Type (1=Router; 0=End Device)
                      //BIT2: Power Source (1=Mains Powered)
                      //BIT3: Receiver on when idle
                      //BIT6: Security Capability
} __attribute__((packed)) zigbee_zdo_device_announce_received_header_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t srcnetaddr;
  uint8_t srcendpnt;
  uint8_t locendpnt;
  uint16_t clusterid;
  uint8_t enclevel; //0x00=Network Encryption Only
                    //0x01=Network + APS Encryption
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t cmdid;
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed)) rapidha_zigbee_zcl_response_received_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t srcnetaddr;
  uint8_t srcendpnt;
  uint8_t locendpnt;
  uint16_t cluster;
  uint8_t seqnumber;
} __attribute__((packed)) zigbee_zcl_response_timeout_header_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t srcnetaddr;
  uint8_t srcendpnt;
  uint16_t srcclusterid;
  uint8_t clientserver_cluster; //0x00=Client, 0x01=Server
  uint16_t attrid;
  uint8_t status; //If not 0x00 (Success), attrtype and attrdata are omitted
  uint8_t attrtype;
  uint8_t attrdata; //Variable width
} __attribute__((packed)) zigbee_zcl_read_attribute_response_header_t;

typedef struct {
  uint8_t status; //ZCL Status
  uint8_t attrid; //Attribute ID
} __attribute__((packed)) zigbee_zcl_write_attribute_status_record_t;

typedef struct {
  uint8_t frame_start; //Always set to 0xF1
  uint8_t header_primary; //Primary frame type
  uint8_t header_secondary; //Command Subset of the given primary frame type
  uint8_t frameid; //Set this with get_next_frameid : 0-127 from Host 128-255 from module
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t srcnetaddr;
  uint8_t srcendpnt;
  uint16_t srcclusterid;
  uint8_t clientserver_cluster; //0x00=Client, 0x01=Server
  uint8_t status; //0x00=All Attribute Writes Successful, 0x01=Some Attribute Writes failed
  uint8_t numattrrecs; //Number of attribute write status records
  zigbee_zcl_write_attribute_status_record_t attrstatus[80]; //Variable width
} __attribute__((packed)) zigbee_zcl_write_attribute_response_header_t;

//Refer to 075366r01ZB_AFG-ZigBee_Cluster_Library_Public_download_version.pdf for more info
typedef struct {
  uint8_t data; //Data for the command goes here
} __attribute__((packed)) rapidhalib_zigbee_zcl_command_t;

typedef struct {
  uint8_t data; //Data for the command goes here
} __attribute__((packed)) rapidhalib_zigbee_zcl_command_with_manu_t;

//ZIGBEE_ZCL_CMD_READ_ATTRIB

typedef struct {
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint8_t seqnumber; //The zigbee sequence number
  uint8_t onoff;
} __attribute__((packed)) zigbee_onoff_command_t;

#endif
