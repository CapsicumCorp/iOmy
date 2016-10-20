/*
Title: Xbee Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for xbeelib.c
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

Xbee info sourced from Digi docs
*/

#ifndef XBEELIB_H
#define XBEELIB_H

#include <inttypes.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for xbeelib module
typedef struct {
  void (*xbeelib_receiveraw)(int serdevidx, int handlerdevidx, char *buffer, int bufcnt);
  int (*xbeelib_isDeviceSupported)(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));
} xbeelib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define XBEELIBINTERFACE_VER_1 1 //A version number for the xbeelib interface version

//Xbee Send Frame Types
#define API_XBEE_AT_COMMAND 0x08
#define API_ZIGBEE_TRANSMIT_COMMAND 0x10
#define API_EXPLICIT_ADDRESSING_ZIGBEE_COMMAND 0x11
#define API_XBEE_REMOTE_AT_COMMAND 0x17

//Xbee Receive Frame Types
#define API_AT_RESPONSE 0x88
#define API_MODEM_STATUS 0x8A
#define API_TRANSMIT_STATUS 0x8B
#define API_ZIGBEE_EXPLICIT_RX_INDICATOR 0x91
#define API_REMOTE_AT_RESPONSE 0x97

//Xbee Command Status Types
#define API_CMDSTATUS_OK 0x00
#define API_CMDSTATUS_ERROR 0x01
#define API_CMDSTATUS_INVALIDCMD 0x02
#define API_CMDSTATUS_INVALIDPARAM 0x03
#define API_CMDSTATUS_TXFAILURE 0x04

//Xbee Receive Delivery Status
#define API_RECEIVE_DELIV_STATUS_SUCCESS 0x00
#define API_RECEIVE_DELIV_STATUS_CCA_FAILURE 0x02
#define API_RECEIVE_DELIV_STATUS_INVAL_DEST_ENDPNT 0x15
#define API_RECEIVE_DELIV_STATUS_NETACKFAIL 0x21
#define API_RECEIVE_DELIV_STATUS_NOTJOINED 0x22
#define API_RECEIVE_DELIV_STATUS_SELFADDR 0x23
#define API_RECEIVE_DELIV_STATUS_ANF 0x24
#define API_RECEIVE_DELIV_STATUS_RNF 0x25
#define API_RECEIVE_DELIV_STATUS_PAYLOAD_TOO_LARGE 0x74

//Xbee Receive Discovery Status
#define API_RECEIVE_DISCOV_STATUS_NO_OVERHEAD 0x00
#define API_RECEIVE_DISCOV_STATUS_ADDR_DISCOV 0x01
#define API_RECEIVE_DISCOV_STATUS_ROUTE_DISCOV 0x02
#define API_RECEIVE_DISCOV_STATUS_ADDR_AND_ROUTE_DISCOV 0x03

//Xbee Explicit Receive Options
#define API_EXPLICIT_RECEIVE_OPTION_PCKTACKED 0x01
#define API_EXPLICIT_RECEIVE_OPTION_PCKTBCAST 0x02

//Xbee Known Hardware and Firmware Versions
//NOTE: upper byte indicates Module Type, lower byte indicates hardware revision
#define XBEE_DEVICE_HW_XBP24BZ7 0x1E00 //Xbee Pro S2B

#define XBEE_DEVICE_FIRM_XBP24BZ7_COORD_HAP 0x218C //Xbee Pro S2B Coordinator with Home Automation Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ROUTER_HAP 0x238C //Xbee Pro S2B Router with Home Automation Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ENDDEVICE_HAP 0x298C //Xbee Pro S2B End Device with Home Automation Profile Firmware

#define XBEE_DEVICE_FIRM_XBP24BZ7_COORD_HAP_2 0x2170 //Xbee Pro S2B Coordinator with Home Automation Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ROUTER_HAP_2 0x2370 //Xbee Pro S2B Router with Home Automation Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ENDDEVICE_HAP_2 0x2970 //Xbee Pro S2B End Device with Home Automation Profile Firmware

#define XBEE_DEVICE_FIRM_XBP24BZ7_COORD_SEP 0x3119 //Xbee Pro S2B Coordinator with Smart Energy Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ROUTER_SEP 0x3319 //Xbee Pro S2B Router with Smart Energy Profile Firmware
#define XBEE_DEVICE_FIRM_XBP24BZ7_ENDDEVICE_SEP 0x3919 //Xbee Pro S2B End Device with Smart Energy Profile Firmware

//Xbee/Zigbee Waiting Definitions
#define XBEE_WAITING_FOR_ANYTHING 0x01 //Waiting for any valid Xbee packet
#define XBEE_WAITING_FOR_ATCMD 0x02 //Waiting for any Xbee AT command response
#define XBEE_WAITING_FOR_AT_FIRMVER 0x03 //Waiting for Xbee AT Get Firmware Version response: VR command
#define XBEE_WAITING_FOR_AT_HWVER 0x04 //Waiting for Xbee AT Get Hardware Version response: HV command
#define XBEE_WAITING_FOR_AT_SERNUMHIGH 0x05 //Waiting for Xbee AT Get Serial Number High response: SH command
#define XBEE_WAITING_FOR_AT_SERNUMLOW 0x06 //Waiting for Xbee AT Get Serial Number Low response: SL command
#define XBEE_WAITING_FOR_AT_GETNETADDR 0x07 //Waiting for Xbee AT Get 16-bit Network Address response: MY command
#define XBEE_WAITING_FOR_AT_APPLYCHNG 0x08 //Waiting for Xbee AT Apply Pending Changes response: AC command
#define XBEE_WAITING_FOR_AT_WRITE 0x09

//Xbee AT command strings
#define XBEE_AT_CMD_FIRMVER "VR" //Xbee AT Get Firmware Version: VR command
#define XBEE_AT_CMD_HWVER "HV" //Xbee AT Get Hardware Version: HV command
#define XBEE_AT_CMD_SERNUMHIGH "SH" //Xbee AT Get Serial Number High: SH command
#define XBEE_AT_CMD_SERNUMLOW "SL" //Xbee AT Get Serial Number Low: SL command
#define XBEE_AT_CMD_GETNETADDR "MY" //Xbee AT Get 16-bit Network Address MY command
#define XBEE_AT_CMD_APPLYCHNG "AC" //Xbee AT Apply Pending Changes: AC command
#define XBEE_AT_CMD_PUSHBUTTON "CB" //Xbee AT Commisioning Push Button: CB command
#define XBEE_AT_CMD_NODEJOINTIME "NJ" //Xbee AT Node Join Time value/command: NJ command
#define XBEE_AT_CMD_ASSOCINDICATION "AI" //Xbee AT Association Indication value/command: AI command
#define XBEE_AT_CMD_ENCRYPTENABLE "EE" //Xbee AT Encryption Enable
#define XBEE_AT_CMD_OPERCHANNEL "CH" //Xbee AT Operating Channel
#define XBEE_AT_CMD_OPERPANID "OI" //Xbee AT Operating 16-bit PAN ID
#define XBEE_AT_CMD_OPEREXTPANID "OP" //Xbee AT Operating Extended 64-bit PAN ID
#define XBEE_AT_CMD_NETWORKRESET "NR" //Xbee AT Network Reset Command
#define XBEE_AT_CMD_WRITE "WR" //Write parameter values to non-volitile memory
#define XBEE_AT_CMD_EXTENDEDPANID "ID"
#define XBEE_AT_CMD_SCANCHANNELS "SC"
#define XBEE_AT_CMD_ZIGBEE_STACK_PROFILE "ZS"
#define XBEE_AT_CMD_APIENABLE "AP"
#define XBEE_AT_CMD_APIOPTIONS "AO"
#define XBEE_AT_CMD_ENCRYPTOPTIONS "EO"
#define XBEE_AT_CMD_LINKKEY "KY"
#define XBEE_AT_CMD_NETWORKENCRYPTKEY "NK"
#define XBEE_AT_CMD_SOFTWARERESET "FR"

//Zigbee Channel Masks
//NOTE: Channel 26 is restricted and not allowed by FCC
#define XBEE_CHANMASK_STANDARD 0x7FFF //Channels: 11-25
#define XBEE_CHANMASK_NETVOX 0x6319 //Channels: 11, 14, 15, 19, 20, 24, 25

//Xbee Structures
//The following variables will be auto set by the send_api_packet function
//  start_delim
//  frameid

//This header is present in every xbee api packet
typedef struct {
  uint8_t start_delim; //Always set to 0x7E
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set by the caller
  uint8_t frameid; //Set this with get_next_frameid
} __attribute__((packed)) xbee_api_header_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_XBEE_AT_COMMAND: 0x08 for this struct
  uint8_t frameid; //Set by send_api_packet
  char atcmd[2]; //Two ASCII characters that identify the AT command
  uint8_t end; //Optional parameter goes at the address of this variable with variable length, Values are specified in MSB format
} __attribute__((packed)) xbee_api_atcmd_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_XBEE_REMOTE_AT_COMMAND: 0x17 for this struct
  uint8_t frameid; //Set by send_api_packet
  uint64_t destaddr; //MSB: 64-bit address of the destination device
  uint16_t destnetaddr; //MSB: 16-bit address of the destination device
  uint8_t remotecmdopts;
  char atcmd[2]; //Two ASCII characters that identify the AT command
  uint8_t end; //Optional parameter goes at the address of this variable with variable length, Values are specified in MSB format
} __attribute__((packed)) xbee_api_remoteatcmd_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_ZIGBEE_TRANSMIT_COMMAND: 0x10 for this struct
  uint8_t frameid; //Set by send_api_packet
  uint64_t destaddr; //MSB: 64-bit address of the destination device
  uint16_t destnetaddr; //MSB: 16-bit address of the destination device
  uint8_t radius; //Maximum number of hops a broadcast transmission can occur, 0=max hops
  uint8_t transmitopts;
  uint8_t end; //Data payload to send goes here
} __attribute__((packed)) xbee_api_zigbee_transmit_cmd_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_EXPLICIT_ADDRESSING_ZIGBEE_COMMAND: 0x11 for this struct
  uint8_t frameid; //Set by send_api_packet
  uint64_t destaddr; //MSB: 64-bit address of the destination device
  uint16_t destnetaddr; //MSB: 16-bit address of the destination device
  uint8_t srcendpnt; //Source endpoint
  uint8_t destendpnt; //Destination endpoint
  uint16_t clusterid; //MSB: Cluster ID
  uint16_t profileid; //MSB: Profile ID
  uint8_t radius; //Maximum number of hops a broadcast transmission can occur, 0=max hops
  uint8_t transmitopts;
  uint8_t end; //Data payload to send goes here
} __attribute__((packed)) xbee_api_explicit_addressing_zigbee_cmd_t;

typedef struct {
  uint8_t seqnumber; //Every xbee ZDO packet starts with a seqnumber
  uint8_t data; //ZDO payload goes here
} __attribute__((packed)) xbee_zdo_cmd_t;


typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to the response command
  uint8_t otherinfo; //Other info based on the command, variable length
} __attribute__((packed)) xbee_api_response_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_AT_RESPONSE: 0x88 for this struct
  uint8_t frameid; //Set by send_api_packet
  char atcmd[2]; //Two ASCII characters that identify the AT command
  uint8_t cmdstatus;
  uint8_t end; //Optional command data may go at the address of this variable with variable length, Values are specified in MSB format
} __attribute__((packed)) xbee_api_atcmd_response_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_XBEE_REMOTE_AT_COMMAND: 0x17 for this struct
  uint8_t frameid; //Set by send_api_packet
  uint64_t srcaddr; //MSB: 64-bit address of the source device
  uint16_t srcnetaddr; //MSB: 16-bit address of the source device
  char atcmd[2]; //Two ASCII characters that identify the AT command
  uint8_t cmdstatus;
  uint8_t end; //Optional command data may go at the address of this variable with variable length, Values are specified in MSB format
} __attribute__((packed)) xbee_api_remoteatcmd_response_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_XBEE_REMOTE_AT_COMMAND: 0x17 for this struct
  uint8_t status; //Xbee modem status
} __attribute__((packed)) xbee_api_modem_status_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_XBEE_REMOTE_AT_COMMAND: 0x17 for this struct
  uint8_t frameid; //Set by send_api_packet
  uint16_t destnetaddr; //MSB: 16-bit address of the destination device
  uint8_t retrycnt; //The number of application transmission retries that took place
  uint8_t delivery_status;
  uint8_t discovery_status;
} __attribute__((packed)) xbee_api_zigbee_transmit_status_t;

typedef struct {
  uint8_t start_delim; //Set by send_api_packet
  uint16_t length; //MSB: Number of bytes between the length and the checksum
  uint8_t frametype; //Set to API_EXPLICIT_ADDRESSING_ZIGBEE_COMMAND: 0x11 for this struct
  uint64_t srcaddr; //MSB: 64-bit address of the source device
  uint16_t srcnetaddr; //MSB: 16-bit address of the source device
  uint8_t srcendpnt; //Source endpoint
  uint8_t destendpnt; //Destination endpoint
  uint16_t clusterid; //MSB: Cluster ID
  uint16_t profileid; //MSB: Profile ID
  uint8_t receiveopts;
  uint8_t end; //Data payload goes here
} __attribute__((packed)) xbee_api_zigbee_explicit_rx_indicator_t;


//Zigbee Structures
//These get mapped to the address of xbee_api_explicit_addressing_zigbee_cmd_t->end

//Refer to 075366r01ZB_AFG-ZigBee_Cluster_Library_Public_download_version.pdf for more info
typedef struct {
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint8_t seqnumber; //Every xbee ZCL packet starts with a frame_control byte, possibly manufacturer, and seqnumber
  uint8_t cmdid;
  uint8_t data; //ZDO payload goes here
} __attribute__((packed)) xbee_zcl_cmd_t;

typedef struct {
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint16_t manu; //LSB: Manufacturer code
  uint8_t seqnumber; //Every xbee ZCL packet starts with a frame_control byte and seqnumber
  uint8_t cmdid;
  uint8_t data; //ZDO payload goes here
} __attribute__((packed)) xbee_zcl_cmd_with_manu_t;

#endif
