/*
Title: ZigBee Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for zigbeelib.c
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

ZCL Commands, Attribute Types, Status Values sourced from FreakZ_v075\freakz\zcl\zcl.h
Netvox info sourced from Netvox documentation
Cluster info sourced from various locations including Wireshark source code
*/

#ifndef ZIGBEELIB_H
#define ZIGBEELIB_H

#include <inttypes.h>
#include "modules/commonlib/commonlib.h"

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

#ifdef __cplusplus
extern "C" {
#endif

typedef struct zigbeeendpoint zigbeeendpoint_t;
typedef struct zigbeedevice zigbeedevice_t;
typedef struct zigbeelib_localzigbeedevice_ver_1 zigbeelib_localzigbeedevice_ver_1_t;
typedef struct zigbeelib_localzigbeedevice_iface_ver_1 zigbeelib_localzigbeedevice_iface_ver_1_t;

typedef union multitypeval zigbee_attrval_t;

typedef struct zdo_general_request zdo_general_request_t;

typedef struct zigbee_zdo_network_address_request zigbee_zdo_network_address_request_t;
typedef struct zigbee_zdo_ieee_address_request zigbee_zdo_ieee_address_request_t;
typedef struct zigbee_zdo_node_descriptor_request zigbee_zdo_node_descriptor_request_t;
typedef struct zigbee_zdo_simple_descriptor_request zigbee_zdo_simple_descriptor_request_t;
typedef struct zigbee_zdo_active_endpoints_request zigbee_zdo_active_endpoints_request_t;
typedef struct zigbee_zdo_match_descriptor_request zigbee_zdo_match_descriptor_request_t;
typedef struct zigbee_zdo_bind_request_cluster zigbee_zdo_bind_request_cluster_t;
typedef struct zigbee_zdo_management_neighbor_table_request zigbee_zdo_management_neighbor_table_request_t;

typedef struct zcl_general_request zcl_general_request_t;

typedef struct zigbee_zdo_device_announce_received zigbee_zdo_device_announce_received_t;
typedef struct zigbee_zdo_response_header zigbee_zdo_response_header_t;
typedef struct zigbee_zdo_network_address_response zigbee_zdo_network_address_response_t;
typedef struct zigbee_zdo_ieee_address_response zigbee_zdo_ieee_address_response_t;
typedef struct zigbee_zdo_node_descriptor_response_node_descriptor zigbee_zdo_node_descriptor_response_node_descriptor_t;
typedef struct zigbee_zdo_node_descriptor_response_capability zigbee_zdo_node_descriptor_response_capability_t;
typedef struct zigbee_zdo_node_descriptor_response zigbee_zdo_node_descriptor_response_t;
typedef struct zigbee_zdo_node_clusters zigbee_zdo_node_clusters_t;
typedef struct zigbee_zdo_simple_descriptor_response zigbee_zdo_simple_descriptor_response_t;
typedef struct zigbee_zdo_active_endpoints_response zigbee_zdo_active_endpoints_response_t;
typedef struct zigbee_zdo_match_descriptor_response zigbee_zdo_match_descriptor_response_t;
typedef struct zigbee_zdo_bind_response zigbee_zdo_bind_response_t;
typedef struct zigbee_zdo_management_neighbor_table_entry zigbee_zdo_management_neighbor_table_entry_t;
typedef struct zigbee_zdo_management_neighbor_table_response zigbee_zdo_management_neighbor_table_response_t;
typedef struct zigbee_zdo_management_permit_joining_response zigbee_zdo_management_permit_joining_response_t;

typedef struct zigbee_zcl_command_read_attribute_list zigbee_zcl_command_read_attribute_list_t;
typedef struct zigbee_zcl_write_attr_record zigbee_zcl_write_attr_record_t;
typedef struct zigbee_zcl_command_write_attribute_list zigbee_zcl_command_write_attribute_list_t;
typedef struct zigbee_zcl_configure_reporting_attr_record zigbee_zcl_configure_reporting_attr_record_t;
typedef struct zigbee_zcl_command_configure_reporting_attribute_list zigbee_zcl_command_configure_reporting_attribute_list_t;
typedef struct zigbee_zcl_read_reporting_configuration_record zigbee_zcl_read_reporting_configuration_record_t;
typedef struct zigbee_zcl_command_read_reporting_configuration_list zigbee_zcl_command_read_reporting_configuration_list_t;
typedef struct zigbee_zcl_command_discover_attributes_request zigbee_zcl_command_discover_attributes_request_t;

typedef struct zigbee_zcl_command_with_manu zigbee_zcl_command_with_manu_t;
typedef struct zigbee_zcl_command_read_attributes_response zigbee_zcl_command_read_attributes_response_t;
typedef struct zigbee_zcl_attr_info zigbee_zcl_attr_info_t;
typedef struct zigbee_zcl_command_discover_attributes_response zigbee_zcl_command_discover_attributes_response_t;
typedef struct zigbee_zcl_configure_reporting_response_attribute_status_record zigbee_zcl_configure_reporting_response_attribute_status_record_t;
typedef struct zigbee_zcl_command_configure_reporting_response zigbee_zcl_command_configure_reporting_response_t;
typedef struct zigbee_zcl_command_report_attributes_reponse_attr_record zigbee_zcl_command_report_attributes_reponse_attr_record_t;
typedef struct zigbee_zcl_command_report_attributes_response zigbee_zcl_command_report_attributes_response_t;
typedef struct zigbee_zcl_command_default_response zigbee_zcl_command_default_response_t;

struct zigbeelib_localzigbeedevice_ver_1 {
  //A user friendly name for the type of zigbee device this is: RapidHA or Xbee Pro for example
  //NOTE: At this stage it should be a pointer to a static string that is never deallocated from ram until the parent library has received confirmation that zigbeelib is no longer using the local zigbee device
  char *devicetype;
  uint64_t addr; //64-bit IEEE address of the local zigbee device
  void *deviceptr; //A pointer to the parent library's structure for the device
};

struct zigbeelib_localzigbeedevice_iface_ver_1 {
  //The name of the library for this local zigbee device
  const char *modulename;

  //Thread safe mark the local zigbee device as in use so the parent library doesn't remove it from ram
  //localzigbeedevice is a pointer to the parent library's structure for the device
  //localzigbeelocked is a pointer to the parent library's locked status
  //Returns 0 on success or negative value on error
  int (*marklocalzigbeeha_inuse)(void *localzigbeedevice, long *localzigbeelocked);

  //Thread safe mark a local zigbee device as not in use so the parent library can remove it from ram
  //localzigbeedevice is a pointer to the parent library's structure for the device
  //localzigbeelocked is a pointer to the parent library's locked status
  //Returns 0 on success or negative value on error
  int (*marklocalzigbeeha_notinuse)(void *localzigbeedevice, long *localzigbeelocked);

  int (*request_send_packet)(void *localzigbeedevice, long *localzigbeelocked);
  int (*cancel_request_send_packet)(void *localzigbeedevice, long *localzigbeelocked);

  void (*send_zigbee_zdo)(void *localzigbeedevice, zdo_general_request_t *zdocmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked);
  void (*send_zigbee_zcl)(void *localzigbeedevice, zcl_general_request_t *zclcmd, int expect_response, char rxonidle, long *localzigbeelocked, long *zigbeelocked);

  //NOTE: These functions are optional
  void (*send_zigbee_zcl_multi_attribute_read)(void *localzigbeedevice, zcl_general_request_t *zclcmd, long *localzigbeelocked, long *zigbeelocked);
  void (*send_multi_attribute_read_with_manufacturer_request)(void *localzigbeedevice, zcl_general_request_t *zclcmd, long *localzigbeelocked, long *zigbeelocked);
  //----------------------------------

  void (*zigbee_permit_join)(void *localzigbeedevice, uint8_t duration, long *localzigbeelocked);

  int (*localzigbeedevice_connected_to_network)(void *localzigbeedevice, long *localzigbeelocked);
};

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for zigbeelib module
typedef struct {
  void (*process_zdo_send_status)(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_send_status)(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zdo_seqnumber)(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_seqnumber)(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);

  void (*process_zdo_response_received)(int localzigbeeindex, zigbee_zdo_response_header_t *zdocmd, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zdo_response_timeout)(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

  void (*decode_zigbee_home_automation_attribute)(int localzigbeeindex, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, uint16_t attrid, uint8_t status, uint8_t attrtype, const zigbee_attrval_t * const attrvalptr, uint8_t *attrsizeptr, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_response_received)(int localzigbeeindex, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_response_timeout)(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

  int (*find_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);

  int (*add_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, char devicetype, char rxonidle, long *localzigbeelocked, long *zigbeelocked);

  int (*remove_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);
  void (*remove_all_zigbee_devices)(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);

  void (*get_zigbee_info)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, int pos, long *localzigbeelocked, long *zigbeelocked);
  void (*get_zigbee_endpoints)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *rapidhalocked, long *zigbeelocked);
  void (*get_zigbee_next_endpoint_info)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *rapidhalocked, long *zigbeelocked);

  int (*register_home_automation_endpointid)(int localzigbeeindex, uint8_t haendpointid, long *localzigbeelocked, long *zigbeelocked);

  //Tell this library to start using a local zigbee home automation device handled by a lower level library
  //The low level library that calls this function should fill in the local zigbee device structure before calling this function
  //WARNING: You should never add the same zigbee device more than once without previously removing it
  //Args: zigbeedeviceinfo is a structure with info about the zigbee device
  //      zigbeedeviceiface is a pointer to functions that this library can call to interface with the local zigbee device
  //      features A bitwise value indicating what features are supported by the local zigbee device
  //      localzigbeelocked is a pointer to a variable that indicates whether the parent library has its mutex locked in this thread or not and is important if this library needs to call the parent library's interface functions
  //      zigbeelocked is a pointer to a variable that indicates whether this library has its mutex locked or not in this thread and is important if the parent library was called by this library and is calling back into this library
  //Returns: Index number to use with other functions on success or negative value on error
  //  If an error is returned, assume that the zigbee device wasn't added to this library
  int (*add_localzigbeedevice)(zigbeelib_localzigbeedevice_ver_1_t *localzigbeedevice, zigbeelib_localzigbeedevice_iface_ver_1_t *zigbeedeviceiface, unsigned long long features, long *localzigbeelocked, long *zigbeelocked);

  int (*remove_localzigbeedevice)(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);
} zigbeelib_ifaceptrs_ver_1_t;

typedef struct {
  void (*process_zdo_send_status)(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_send_status)(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zdo_seqnumber)(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_seqnumber)(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);

  void (*process_zdo_response_received)(int localzigbeeindex, zigbee_zdo_response_header_t *zdocmd, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zdo_response_timeout)(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

  void (*decode_zigbee_home_automation_attribute)(int localzigbeeindex, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, uint16_t attrid, uint8_t status, uint8_t attrtype, const zigbee_attrval_t * const attrvalptr, uint8_t *attrsizeptr, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_response_received)(int localzigbeeindex, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked);
  void (*process_zcl_response_timeout)(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

  int (*find_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);

  int (*add_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, char devicetype, char rxonidle, long *localzigbeelocked, long *zigbeelocked);

  int (*remove_zigbee_device)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);
  void (*remove_all_zigbee_devices)(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);

  void (*get_zigbee_info)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, int pos, long *localzigbeelocked, long *zigbeelocked);
  void (*get_zigbee_endpoints)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *rapidhalocked, long *zigbeelocked);
  void (*get_zigbee_next_endpoint_info)(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *rapidhalocked, long *zigbeelocked);

  int (*register_home_automation_endpointid)(int localzigbeeindex, uint8_t haendpointid, long *localzigbeelocked, long *zigbeelocked);

  //Tell this library to start using a local zigbee home automation device handled by a lower level library
  //The low level library that calls this function should fill in the local zigbee device structure before calling this function
  //WARNING: You should never add the same zigbee device more than once without previously removing it
  //Args: zigbeedeviceinfo is a structure with info about the zigbee device
  //      zigbeedeviceiface is a pointer to functions that this library can call to interface with the local zigbee device
  //      features A bitwise value indicating what features are supported by the local zigbee device
  //      localzigbeelocked is a pointer to a variable that indicates whether the parent library has its mutex locked in this thread or not and is important if this library needs to call the parent library's interface functions
  //      zigbeelocked is a pointer to a variable that indicates whether this library has its mutex locked or not in this thread and is important if the parent library was called by this library and is calling back into this library
  //Returns: Index number to use with other functions on success or negative value on error
  //  If an error is returned, assume that the zigbee device wasn't added to this library
  int (*add_localzigbeedevice)(zigbeelib_localzigbeedevice_ver_1_t *localzigbeedevice, zigbeelib_localzigbeedevice_iface_ver_1_t *zigbeedeviceiface, unsigned long long features, long *localzigbeelocked, long *zigbeelocked);

  int (*remove_localzigbeedevice)(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);

  //High Level Functions
  int16_t (*highlevel_get_onoff_zigbee_device)(uint64_t zigbeeaddr, int16_t port);
  int16_t (*highlevel_set_onoff_zigbee_device)(uint64_t zigbeeaddr, int16_t port, int state);

  //High Level Definitions
  const int16_t *HIGH_LEVEL_ANYENDPOINT;

  const uint8_t *HIGH_LEVEL_OFF;
  const uint8_t *HIGH_LEVEL_ON;
  const uint8_t *HIGH_LEVEL_TOGGLE;
  const uint8_t *HIGH_LEVEL_UNKNOWN;

  const int16_t *HIGH_LEVEL_ERROR_DEVICE_NOT_FOUND;
  const int16_t *HIGH_LEVEL_ERROR_ENDPOINT_NOT_FOUND;
  const int16_t *HIGH_LEVEL_ERROR_CLUSTER_NOT_FOUND;
  const int16_t *HIGH_LEVEL_ERROR_ATTRIBUTE_NOT_FOUND;
} zigbeelib_ifaceptrs_ver_2_t;

#ifdef __cplusplus
}
#endif

#pragma pack(pop)

#define ZIGBEELIBINTERFACE_VER_1 1 //A version number for the zigbeelib interface version
#define ZIGBEELIBINTERFACE_VER_2 2 //A version number for the zigbeelib interface version


//RapidHA Primary Frame Types
#define ZIGBEE_ZIGBEE_ZDO 0x04
#define ZIGBEE_ZIGBEE_ZCL_GENERAL 0x05

//Zigbee Waiting Definitions
#define ZIGBEE_WAITING_FOR_ANYTHING 0x01 //Waiting for any valid packet

#define ZIGBEE_WAITING_FOR_ZDO_NODE_DESCRIPTOR_RESPONSE 0x05
#define ZIGBEE_WAITING_FOR_ZDO_SIMPLE_DESCRIPTOR_RESPONSE 0x06
#define ZIGBEE_WAITING_FOR_ZDO_ACTIVE_ENDPOINTS_RESPONSE 0x07
#define ZIGBEE_WAITING_FOR_ZCL_READ_ATTRIBUTE_RESPONSE 0x08
#define ZIGBEE_WAITING_FOR_ZCL_WRITE_ATTRIBUTE_RESPONSE 0x09

//Unfortunately some local Zigbee devices don't support all the features that this library supports so
//  we have bitwise definitions that they can supply when adding the local zigbee device to indicate
//  what features are supported
//NOTE: When setting ZIGBEE_FEATURE_NORECEIVEMANUREPORTPACKETS, you must also set ZIGBEE_FEATURE_RECEIVEREPORTPACKETS
#define ZIGBEE_FEATURE_RECEIVEREPORTPACKETS 1ULL //Set if the local Zigbee can receive and pass on report packets to this library
#define ZIGBEE_FEATURE_NORECEIVEMANUREPORTPACKETS 2ULL //Set if the local Zigbee cannot receive manufacturer specific report packets
#define ZIGBEE_FEATURE_NOHACLUSTERS 4ULL //Set if the local Zigbee doesn't implement any HA clusters so scanning for model info won't work

//Zigbee Channel Masks
#define ZIGBEE_CHANMASK_STANDARD 0x03FFF800 //Channels: 11-25
#define ZIGBEE_CHANMASK_NETVOX 0x0318C800 //Channels: 11, 14, 15, 19, 20, 24, 25

//Zigbee Device Types
#define ZIGBEE_DEVICE_TYPE_COORDINATOR 0
#define ZIGBEE_DEVICE_TYPE_ROUTER 1
#define ZIGBEE_DEVICE_TYPE_END_DEVICE 2
#define ZIGBEE_DEVICE_TYPE_UKN 3 //Unknown

//RX On Idle States
#define ZIGBEE_RXONIDLE_FALSE 0
#define ZIGBEE_RXONIDLE_TRUE 1
#define ZIGBEE_RXONIDLE_UKN 2 //Unknown

// ZigBee version numbers
#define ZBEE_VERSION_PROTOTYPE      0 // Does this even exist?
#define ZBEE_VERSION_2004           1 // Re: 053474r06ZB_TSC-ZigBeeSpecification.pdf
#define ZBEE_VERSION_2007           2 // Re: 053474r17ZB_TSC-ZigBeeSpecification.pdf
#define ZBEE_VERSION_GREEN_POWER    3 // ZigBee Green Power

//Zigbee Known Profiles
#define ZIGBEE_ZDO_PROFILE 0x0000
#define ZIGBEE_HOME_AUTOMATION_PROFILE 0x0104
#define ZIGBEE_SMART_ENERGY_PROFILE 0x0109

//Home Automation Clusters - General
#define ZIGBEE_HOME_AUTOMATION_BASIC_CLUSTER 0x0000
#define ZIGBEE_HOME_AUTOMATION_POWER_CONFIG_CLUSTER 0x0001
#define ZIGBEE_HOME_AUTOMATION_DEVICE_TEMP_CONFIG_CLUSTER 0x0002
#define ZIGBEE_HOME_AUTOMATION_IDENTIFY_CLUSTER 0x0003
#define ZIGBEE_HOME_AUTOMATION_GROUPS_CLUSTER 0x0004
#define ZIGBEE_HOME_AUTOMATION_SCENES_CLUSTER 0x0005
#define ZIGBEE_HOME_AUTOMATION_ONOFF_CLUSTER 0x0006
#define ZIGBEE_HOME_AUTOMATION_ONOFF_SWITCH_CONFIG_CLUSTER 0x0007
#define ZIGBEE_HOME_AUTOMATION_LEVEL_CONTROL_CLUSTER 0x0008
#define ZIGBEE_HOME_AUTOMATION_ALARM_CLUSTER 0x0009
#define ZIGBEE_HOME_AUTOMATION_TIME_CLUSTER 0x000A
#define ZIGBEE_HOME_AUTOMATION_RSSI_LOCATION_CLUSTER 0x000B
#define ZIGBEE_HOME_AUTOMATION_ANALOG_INPUT_BASIC_CLUSTER 0x000C
#define ZIGBEE_HOME_AUTOMATION_ANALOG_OUTPUT_BASIC_CLUSTER 0x000D
#define ZIGBEE_HOME_AUTOMATION_ANALOG_VALUE_BASIC_CLUSTER 0x000E
#define ZIGBEE_HOME_AUTOMATION_BINARY_INPUT_BASIC_CLUSTER 0x000F
#define ZIGBEE_HOME_AUTOMATION_BINARY_OUTPUT_BASIC_CLUSTER 0x0010
#define ZIGBEE_HOME_AUTOMATION_BINARY_VALUE_BASIC_CLUSTER 0x0011
#define ZIGBEE_HOME_AUTOMATION_MULTISTATE_INPUT_BASIC_CLUSTER 0x0012
#define ZIGBEE_HOME_AUTOMATION_MULTISTATE_OUTPUT_BASIC_CLUSTER 0x0013
#define ZIGBEE_HOME_AUTOMATION_MULTISTATE_VALUE_BASIC_CLUSTER 0x0014
#define ZIGBEE_HOME_AUTOMATION_COMMISSIONING_CLUSTER 0x0015
#define ZIGBEE_HOME_AUTOMATION_PARTITION_CLUSTER 0x0016
#define ZIGBEE_HOME_AUTOMATION_OTA_UPGRADE_CLUSTER 0x0019
#define ZIGBEE_HOME_AUTOMATION_POLL_CONTROL_CLUSTER 0x0020
//
#define ZIGBEE_HOME_AUTOMATION_POWER_PROFILE_CLUSTER 0x001A
#define ZIGBEE_HOME_AUTOMATION_APPLIANCE_CONTROL_CLUSTER 0x001B

//Home Automation Clusters - Closures
#define ZIGBEE_HOME_AUTOMATION_SHADE_CONFIG_CLUSTER 0x0100
#define ZIGBEE_HOME_AUTOMATION_DOOR_LOCK_CLUSTER 0x0101
#define ZIGBEE_HOME_AUTOMATION_WINDOW_COVERING_CLUSTER 0x0102

//Home Automation Clusters - HVAC
#define ZIGBEE_HOME_AUTOMATION_PUMP_CONFIG_CONTROL_CLUSTER 0x0200
#define ZIGBEE_HOME_AUTOMATION_THERMOSTAT_CLUSTER 0x0201
#define ZIGBEE_HOME_AUTOMATION_FAN_CONTROL_CLUSTER 0x0202
#define ZIGBEE_HOME_AUTOMATION_DEHUMID_CONTROL_CLUSTER 0x0203
#define ZIGBEE_HOME_AUTOMATION_THERMOSTAT_UI_CONFIG_CLUSTER 0x0204

//Home Automation Clusters - Lighting
#define ZIGBEE_HOME_AUTOMATION_COLOR_CONTROL_CLUSTER 0x0300
#define ZIGBEE_HOME_AUTOMATION_BALLAST_CONFIGURATION_CLUSTER 0x0301

//Home Automation Clusters - Measurement and Sensing
#define ZIGBEE_HOME_AUTOMATION_ILLUM_MEASUREMENT_CLUSTER 0x0400
#define ZIGBEE_HOME_AUTOMATION_ILLUM_LEVEL_SENSING_CLUSTER 0x0401
#define ZIGBEE_HOME_AUTOMATION_TEMP_MEASUREMENT_CLUSTER 0x0402
#define ZIGBEE_HOME_AUTOMATION_PRESSURE_MEASUREMENT_CLUSTER 0x0403
#define ZIGBEE_HOME_AUTOMATION_FLOW_MEASUREMENT_CLUSTER 0x0404
#define ZIGBEE_HOME_AUTOMATION_RELATIVE_HUMIDITY_MEASUREMENT_CLUSTER 0x0405
#define ZIGBEE_HOME_AUTOMATION_OCCUPANCY_SENSING_CLUSTER 0x0406

//Home Automation Clusters - Security and Safety
#define ZIGBEE_HOME_AUTOMATION_IAS_ZONE_CLUSTER 0x0500
#define ZIGBEE_HOME_AUTOMATION_IAS_ACE_CLUSTER 0x0501
#define ZIGBEE_HOME_AUTOMATION_IAS_WD_CLUSTER 0x0502

//Home Automation Clusters - Protocol Interfaces
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_GENERIC_TUNNEL 0x0600
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_PROTOCOL_TUNNEL         0x0601
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_INPUT_REG        0x0602
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_INPUT_EXT        0x0603
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_OUTPUT_REG       0x0604
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_OUTPUT_EXT       0x0605
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_VALUE_REG        0x0606
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_ANALOG_VALUE_EXT        0x0607
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_INPUT_REG        0x0608
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_INPUT_EXT        0x0609
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_OUTPUT_REG       0x060a
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_OUTPUT_EXT       0x060b
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_VALUE_REG        0x060c
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_BINARY_VALUE_EXT        0x060d
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_INPUT_REG    0x060e
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_INPUT_EXT    0x060f
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_OUTPUT_REG   0x0610
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_OUTPUT_EXT   0x0611
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_VALUE_REG    0x0612
#define ZIGBEE_HOME_AUTOMATION_CLUSTER_BACNET_MULTISTATE_VALUE_EXT    0x0613

//Home Automation Clusters - Smart Energy
#define ZIGBEE_HOME_AUTOMATION_PRICE_CLUSTER 0x0700
#define ZIGBEE_HOME_AUTOMATION_DEMAND_RESPONSE_LOAD_CONTROL_CLUSTER 0x0701
#define ZIGBEE_HOME_AUTOMATION_SIMPLE_METERING_CLUSTER 0x0702
#define ZIGBEE_HOME_AUTOMATION_MESSAGE 0x0703
#define ZIGBEE_HOME_AUTOMATION_SMART_ENERGY_TUNNELING_CLUSTER 0x0704
#define ZIGBEE_HOME_AUTOMATION_PRE_PAYMENT_CLUSTER 0x0705

//Home Automation Clusters - Home Automation
#define ZIGBEE_HOME_AUTOMATION_APPLIANCE_IDENTIFICATION_CLUSTER 0x0B00
#define ZIGBEE_HOME_AUTOMATION_METER_IDENTIFICATION_CLUSTER 0x0B01
#define ZIGBEE_HOME_AUTOMATION_APPLIANCE_EVENTS_AND_ALERT_CLUSTER 0x0B02
#define ZIGBEE_HOME_AUTOMATION_APPLIANCE_STATISTICS_CLUSTER 0x0B03
#define ZIGBEE_HOME_AUTOMATION_ELECTRICAL_MEASUREMENT_CLUSTER 0x0B04
#define ZIGBEE_HOME_AUTOMATION_DIAGNOSTICS_CLUSTER 0x0B05

//Zigbee On/Off Cluster Attributes : 0x0006
#define ZIGBEE_HA_ONOFF_CLUSTER_ONOFF_ATTR 0x0000

//Zigbee Time Attributes Cluster : 0x000A
#define ZIGBEE_HA_TIME_CLUSTER_TIME_ATTR 0x0000
#define ZIGBEE_HA_TIME_CLUSTER_TIME_STATUS_ATTR 0x0001
#define ZIGBEE_HA_TIME_CLUSTER_TIME_ZONE_ATTR 0x0002
#define ZIGBEE_HA_TIME_CLUSTER_DST_START_ATTR 0x0003
#define ZIGBEE_HA_TIME_CLUSTER_DST_END_ATTR 0x0004
#define ZIGBEE_HA_TIME_CLUSTER_DST_SHIFT_ATTR 0x0005
#define ZIGBEE_HA_TIME_CLUSTER_STANDARD_TIME_ATTR 0x0006
#define ZIGBEE_HA_TIME_CLUSTER_LOCAL_TIME_ATTR 0x0007
#define ZIGBEE_HA_TIME_CLUSTER_LAST_SET_TIME_ATTR 0x0008
#define ZIGBEE_HA_TIME_CLUSTER_VALID_UNTIL_TIME_ATTR 0x0009

//Zigbee Simple Metering UnitofMeasure Attribute Enumerations
#define ZIGBEE_SIMPLE_METERING_UNITOFMEASURE_KW_BINARY 0x00

//Zigbee Netvox Metering Attributes : 0x0702
#define ZIGBEE_NETVOX_METERING_CURRENT 0xE000 //Measured in milliamps , size=Unsigned 16-bit
#define ZIGBEE_NETVOX_METERING_VOLTAGE 0xE001 //Measured in volts , size=Unsigned 16-bit
#define ZIGBEE_NETVOX_METERING_POWER 0xE002 //Measured in watts , size=Unsigned 16-bit
#define ZIGBEE_NETVOX_METERING_ENERGY 0xE003 //Measured in Total Watts/h , size=Unsigned 32-bit

#include "zigbeelib_zigbeedeviceids.h"
#include "zigbeelib_zigbeezclstatus.h"
#include "zigbeelib_zigbeezclcmds.h"

//Digi Known Zigbee Device IDs
#define ZIGBEE_DEVICEID_DIGI_GENERIC 0x0000

//Zigbee ZDO Send Frame Types
#define ZIGBEE_ZDO_NETWORK_ADDRESS_REQUEST 0x0000
#define ZIGBEE_ZDO_IEEE_ADDRESS_REQUEST 0x0001
#define ZIGBEE_ZDO_NODE_DESCRIPTOR_REQUEST 0x0002
#define ZIGBEE_ZDO_POWER_DESCRIPTOR_REQUEST 0x0003
#define ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_REQUEST 0x0004
#define ZIGBEE_ZDO_ACTIVE_ENDPOINTS_REQUEST 0x0005
#define ZIGBEE_ZDO_MATCH_DESCRIPTOR_REQUEST 0x0006
#define ZIGBEE_ZDO_COMPLEX_DESCRIPTOR_REQUEST 0x00010
#define ZIGBEE_ZDO_USER_DESCRIPTOR_REQUEST 0x0011
#define ZIGBEE_ZDO_DISCOVERY_CACHE_REQUEST 0x0012
#define ZIGBEE_ZDO_END_DEVICE_ANNOUNCE 0x0013
#define ZIGBEE_ZDO_SET_USER_DESCRIPTOR_REQUEST 0x0014
#define ZIGBEE_ZDO_REQUEST_SYSTEM_SERVER_DISC     0x0015  // Server Discovery Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_DISCOVERY        0x0016  // Store Discovery Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_NODE_DESC        0x0017  // Store Node Descriptor Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_POWER_DESC       0x0018  // Store Power Descriptor Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_ACTIVE_EP        0x0019  // Store Active Endpoints Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_SIMPLE_DESC      0x001a  // Store Simple Descriptor Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_REMOVE_NODE_CACHE      0x001b  // Remove Node Cache Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_FIND_NODE_CACHE        0x001c  // Find Node Cache Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_EXT_SIMPLE_DESC        0x001d  // Extended Simple Descriptor Request ZigBee 2007 & later.
#define ZIGBEE_ZDO_REQUEST_EXT_ACTIVE_EP          0x001e  // Extended Active Endpoint Request ZigBee 2007 & later.
#define ZIGBEE_ZDO_REQUEST_END_DEVICE_BIND 0x0020 // End Device Bind Request
#define ZIGBEE_ZDO_BIND_REQUEST_CLUSTER 0x0021
#define ZIGBEE_ZDO_UNBIND_REQUEST_CLUSTER 0x0022
#define ZIGBEE_ZDO_REQUEST_BIND_REGISTER          0x0023  // Bind Register Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_REPLACE_DEVICE         0x0024  // Replace Device Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_STORE_BAK_BIND_ENTRY   0x0025  // Store Backup Binding Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_REMOVE_BAK_BIND_ENTRY  0x0026  // Remove Backup Binding Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_BACKUP_BIND_TABLE      0x0027  // Backup Binding Table Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_RECOVER_BIND_TABLE     0x0028  // Recover Binding Table Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_BACKUP_SOURCE_BIND     0x0029  // Backup Source Binding Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_RECOVER_SOURCE_BIND    0x002a  // Recover Source Binding Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_MGMT_NWK_DISC          0x0030 // Network Discovery Reques
#define ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_REQUEST 0x0031
#define ZIGBEE_ZDO_REQUEST_MGMT_RTG               0x0032 //Routing Table Request
#define ZIGBEE_ZDO_REQUEST_MGMT_BIND              0x0033 //Binding Table Request
#define ZIGBEE_ZDO_REQUEST_MGMT_LEAVE             0x0034 //Leave Request
#define ZIGBEE_ZDO_REQUEST_MGMT_DIRECT_JOIN       0x0035 //Direct Join Request
#define ZIGBEE_ZDO_MANAGEMENT_PERMIT_JOINING_REQUEST 0x0036 // Permit Join Request ZigBee 2006 & later. 
#define ZIGBEE_ZDO_REQUEST_MGMT_CACHE             0x0037  // Cache Request ZigBee 2006 & later.
#define ZIGBEE_ZDO_REQUEST_MGMT_NWKUPDATE         0x0038  // Network Update Request ZigBee 2007 & later.

//Zigbee Receive Frame Types
#define ZIGBEE_ZDO_NETWORK_ADDRESS_RESPONSE 0x8000
#define ZIGBEE_ZDO_IEEE_ADDRESS_RESPONSE 0x8001
#define ZIGBEE_ZDO_NODE_DESCRIPTOR_RESPONSE 0x8002
#define ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_RESPONSE 0x8004
#define ZIGBEE_ZDO_ACTIVE_ENDPOINTS_RESPONSE 0x8005
#define ZIGBEE_ZDO_MATCH_DESCRIPTOR_RESPONSE 0x8006
#define ZIGBEE_ZDO_BIND_RESPONSE_CLUSTER 0x8021
#define ZIGBEE_ZDO_UNBIND_RESPONSE_CLUSTER 0x8022
#define ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_RESPONSE 0x8031
#define ZIGBEE_ZDO_MANAGEMENT_LEAVE_RESPONSE 0x8034
#define ZIGBEE_ZDO_MANAGEMENT_PERMIT_JOINING_RESPONSE 0x8036

//ZDO Status Values
#define ZIGBEE_ZDO_STATUS_SUCCESS 0x00 // ZCL Success
#define ZIGBEE_ZDO_STATUS_INVALID_REQUEST_TYPE 0x80
#define ZIGBEE_ZDO_STATUS_DEVICE_NOT_FOUND 0x81
#define ZIGBEE_ZDO_STATUS_INVALID_ENDPOINT 0x82
#define ZIGBEE_ZDO_STATUS_NOT_ACTIVE 0x83
#define ZIGBEE_ZDO_STATUS_NOT_SUPPORTED 0x84
#define ZIGBEE_ZDO_STATUS_TIMEOUT 0x85
#define ZIGBEE_ZDO_STATUS_NO_MATCH 0x86
#define ZIGBEE_ZDO_STATUS_NO_ENTRY 0x88
#define ZIGBEE_ZDO_STATUS_NO_DESCRIPTOR 0x89
#define ZIGBEE_ZDO_STATUS_INSUFFICIENT_SPACE 0x8a
#define ZIGBEE_ZDO_STATUS_NOT_PERMITTED 0x8b
#define ZIGBEE_ZDO_STATUS_TABLE_FULL 0x8c

//ZCL Attribute Types
#define ZIGBEE_ZCL_TYPE_NULL 0x00

#define ZIGBEE_ZCL_TYPE_8BIT 0x08
#define ZIGBEE_ZCL_TYPE_16BIT 0x09
#define ZIGBEE_ZCL_TYPE_24BIT 0x0a
#define ZIGBEE_ZCL_TYPE_32BIT 0x0b
#define ZIGBEE_ZCL_TYPE_40BIT 0x0c
#define ZIGBEE_ZCL_TYPE_48BIT 0x0d
#define ZIGBEE_ZCL_TYPE_56BIT 0x0e
#define ZIGBEE_ZCL_TYPE_64BIT 0x0f

#define ZIGBEE_ZCL_TYPE_BOOL 0x10

#define ZIGBEE_ZCL_TYPE_8BITMAP 0x18
#define ZIGBEE_ZCL_TYPE_16BITMAP 0x19
#define ZIGBEE_ZCL_TYPE_24BITMAP 0x1a
#define ZIGBEE_ZCL_TYPE_32BITMAP 0x1b
#define ZIGBEE_ZCL_TYPE_40BITMAP 0x1c
#define ZIGBEE_ZCL_TYPE_48BITMAP 0x1d
#define ZIGBEE_ZCL_TYPE_56BITMAP 0x1e
#define ZIGBEE_ZCL_TYPE_64BITMAP 0x1f

#define ZIGBEE_ZCL_TYPE_U8 0x20
#define ZIGBEE_ZCL_TYPE_U16 0x21
#define ZIGBEE_ZCL_TYPE_U24 0x22
#define ZIGBEE_ZCL_TYPE_U32 0x23
#define ZIGBEE_ZCL_TYPE_U40 0x24
#define ZIGBEE_ZCL_TYPE_U48 0x25
#define ZIGBEE_ZCL_TYPE_U56 0x26
#define ZIGBEE_ZCL_TYPE_U64 0x27

#define ZIGBEE_ZCL_TYPE_S8 0x28
#define ZIGBEE_ZCL_TYPE_S16 0x29
#define ZIGBEE_ZCL_TYPE_S24 0x2a
#define ZIGBEE_ZCL_TYPE_S32 0x2b
#define ZIGBEE_ZCL_TYPE_S40 0x2c
#define ZIGBEE_ZCL_TYPE_S48 0x2d
#define ZIGBEE_ZCL_TYPE_S56 0x2e
#define ZIGBEE_ZCL_TYPE_S64 0x2f

#define ZIGBEE_ZCL_TYPE_8ENUM 0x30
#define ZIGBEE_ZCL_TYPE_16ENUM 0x31

#define ZIGBEE_ZCL_TYPE_FLOAT_SEMI 0x38
#define ZIGBEE_ZCL_TYPE_FLOAT_SINGLE 0x39
#define ZIGBEE_ZCL_TYPE_FLOAT_DOUBLE 0x3a

#define ZIGBEE_ZCL_TYPE_BYTE_ARRAY 0x41 //Octet String
#define ZIGBEE_ZCL_TYPE_CHAR_STRING 0x42
#define ZIGBEE_ZCL_TYPE_LBYTE_ARRAY 0x43 //Long Octet String
#define ZIGBEE_ZCL_TYPE_LCHAR_STRING 0x44

#define ZIGBEE_ZCL_TYPE_ARRAY 0x48
#define ZIGBEE_ZCL_TYPE_STRUCT 0x4c

#define ZIGBEE_ZCL_TYPE_SET 0x50
#define ZIGBEE_ZCL_TYPE_BAG 0x51

#define ZIGBEE_ZCL_TYPE_TIME 0xe0
#define ZIGBEE_ZCL_TYPE_DATE 0xe1
#define ZIGBEE_ZCL_TYPE_UTCTIME 0xe2

#define ZIGBEE_ZCL_TYPE_CLUSTERID 0xe8
#define ZIGBEE_ZCL_TYPE_ATTRID 0xe9
#define ZIGBEE_ZCL_TYPE_BACNETOID 0xea

#define ZIGBEE_ZCL_TYPE_IEEE_ADDR 0xf0
#define ZIGBEE_ZCL_TYPE_128SECURITY_KEY 0xf1

#define ZIGBEE_ZCL_TYPE_INVALID 0xff

//Zigbee Structures
//These get mapped to the address of rapidha_api_explicit_addressing_zigbee_cmd_t->end

struct zigbee_zdo_node_clusters {
  uint8_t numclusters; //The number of clusters in this list
  uint16_t clusters[80]; //LSB: The list of clusters
} __attribute__((packed));

//Generic Zigbee ZDO request with appropriate values for sending any type of ZDO Command
struct zdo_general_request {
  uint64_t addr; //LSB: 64-bit address of the destination device
  uint16_t netaddr; //LSB: 16-bit address of the destination device
  uint16_t clusterid; //LSB: Cluster ID
  uint8_t zigbeelength;
  uint8_t zigbeepayload; //Maps to the ZDO command structure
} __attribute__((packed));

//ZIGBEE_ZDO_NETWORK_ADDRESS_REQUEST
struct zigbee_zdo_network_address_request {
  uint64_t destaddr; //LSB: 64-bit address of the destination device
  uint8_t request_type;
  uint8_t start_index;
} __attribute__((packed));

//ZIGBEE_ZDO_IEEE_ADDRESS_REQUEST
struct zigbee_zdo_ieee_address_request {
  uint16_t netaddr; //LSB: 16-bit address of the destination device
  uint8_t request_type; //0=Single Device Response, 1=Extended Response
  uint8_t start_index;
} __attribute__((packed));

//ZIGBEE_ZDO_NODE_DESCRIPTOR_REQUEST
struct zigbee_zdo_node_descriptor_request {
  uint16_t netaddr; //LSB: 16-bit address of the device
} __attribute__((packed));

//ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_REQUEST
struct zigbee_zdo_simple_descriptor_request {
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint8_t endpoint; //The endpoint from which to optain the simple descriptor
} __attribute__((packed));

//ZIGBEE_ZDO_ACTIVE_ENDPOINTS_REQUEST
struct zigbee_zdo_active_endpoints_request {
  uint16_t netaddr; //LSB: 16-bit address of the device
} __attribute__((packed));

//ZIGBEE_ZDO_MATCH_DESCRIPTOR_REQUEST
struct zigbee_zdo_match_descriptor_request {
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint16_t profileid; //LSB: The profile id to be matched at the destination
  uint8_t clusterlist; //First zigbee_zdo_node_clusters_t is input clusters list then output clusters to match
} __attribute__((packed));

//ZIGBEE_ZDO_END_DEVICE_BIND_REQUEST_CLUSTER
//NOTE: Uses zigbee_zdo_node_clusters for the input and output clusters list
struct zigbee_zdo_end_device_bind_request_cluster {
  uint16_t netaddr; //LSN: 16-bit network address of the source device for binding
  uint64_t addr; //LSB: 64-bit address of the source device for binding
  uint8_t endpoint; //The endpoint of the source device for binding
  uint16_t profileid; //The profile id of the source device for binding
  uint8_t clusterlist; //First zigbee_zdo_node_clusters_t is input clusters list then output clusters
} __attribute__((packed));

//ZIGBEE_ZDO_BIND_REQUEST_CLUSTER
//TODO: Group Address mode support
struct zigbee_zdo_bind_request_cluster {
  uint64_t srcaddr; //LSB: 64-bit address of the source device for binding
  uint8_t endpoint; //The endpoint of the source device for binding
  uint16_t clusterid; //LSB: Cluser ID to bind
  uint8_t addrmode; //1=Group Address mode, 3=Unicast Address mode
  uint64_t destaddr; //LSB: 64-bit Extended Address of the destination device for binding
  uint8_t destendpoint; //The endpoint of the destination device for binding
} __attribute__((packed));

//ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_REQUEST
struct zigbee_zdo_management_neighbor_table_request {
  uint8_t start_index;
} __attribute__((packed));

//ZIGBEE_ZDO_MANAGEMENT_LEAVE_REQUEST
typedef struct zigbee_zdo_management_leave_request zigbee_zdo_management_leave_request_t;
struct zigbee_zdo_management_leave_request {
	uint64_t destaddr; //LSB: 64-bit address of the device that should leave
	uint8_t options; //Bitfield: 0x01 Rejoin (device is asked to rejoin the network, 0x02 Remove Children (Device should remove its children)
} __attribute__((packed));

//ZIGBEE_ZDO_MANAGEMENT_PERMIT_JOINING_REQUEST
typedef struct zigbee_zdo_management_permit_joining_request zigbee_zdo_management_permit_joining_request_t;
struct zigbee_zdo_management_permit_joining_request {
	uint8_t duration; //Specifies the time that joining should be enabled (in seconds) or 0xFF to enable permanently
	uint8_t trust_center_significance; //If set to 1 and remote is a trust center, the command affects the trust center authentication policy, otherwise it has no effect
} __attribute__((packed));


struct zigbee_zdo_response_header {
  uint16_t srcnetaddr; //LSB
  uint16_t clusterid; //LSB
  uint16_t profileid; //LSB
  uint8_t zigbeelength;
  uint8_t seqnumber; //NOTE: This is always the first byte of the Zigbee zdo response payload
  uint8_t status;
} __attribute__((packed));

//ZIGBEE_ZDO_END_DEVICE_ANNOUNCE
//See http://www.anaren.com/air-wiki-zigbee/index.php/ZDO_END_DEVICE_ANNCE_IND
struct zigbee_zdo_device_announce_received {
  uint8_t seqnumber; //The zigbee sequence number
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint64_t addr; //LSB: 64-bit address of the device
  uint8_t capabilities;
    //BIT0: Alt. PAN Coordinator
    //BIT1: Device Type (1=Router; 0=End Device)
    //BIT2: Power Source (1=Mains Powered)
    //BIT3: Receiver on when idle
    //BIT6: Security Capability
} __attribute__((packed));

//ZIGBEE_ZDO_NETWORK_ADDRESS_RESPONSE
struct zigbee_zdo_network_address_response {
  uint8_t seqnumber;
  uint8_t status;
  uint64_t addr; //LSB: 64-bit address of the device
  uint16_t netaddr; //LSB: 16-bit address of the device
  //The following is only included if extended response was requested
  uint8_t numattr; //Number of addresses in this packet
  uint8_t startidx; //Start Index into the associated device list for this report
  uint16_t netaddrs[80]; //LSB: List of all 16-bit addresses in the associated device list
} __attribute__((packed));

//ZIGBEE_ZDO_IEEE_ADDRESS_RESPONSE
struct zigbee_zdo_ieee_address_response {
  uint8_t seqnumber;
  uint8_t status;
  uint64_t addr; //LSB: 64-bit address of responding device
  uint16_t netaddr; //LSB: 16-bit address of the responding device

  //Following only included if extended response
  uint8_t numaddrs; //Number of addresses in this packet
  uint8_t startidx; //The starting index for this report
  uint16_t addrs[80]; //List of all 16-bit addresses in the associated device list
} __attribute__((packed));

//ZIGBEE_ZDO_NODE_DESCRIPTOR_RESPONSE
struct zigbee_zdo_node_descriptor_response_node_descriptor {
  unsigned devicetype :3; //0=Coordinator, 1=Router, 2=End Device
  unsigned complexdescriptor :1; //True/False
  unsigned userdescriptor :1; //True/False
  unsigned reserved1 :3;
  unsigned apsflags :3; //Unknown Meaning
  unsigned band_868 :1; //868Mhz Band True/False
  unsigned reserved2 :1;
  unsigned band_900 :1; //900Mhz Band True/False
  unsigned band_24 :1; //2.4Mhz Band True/False
  unsigned reserved3 :1;
} __attribute__((packed));

struct zigbee_zdo_node_descriptor_response_capability {
  unsigned altcoord :1; //Alternate Coordinator True/False
  unsigned fullfunc :1; //Full Function Device True/False
  unsigned acpower :1; //AC Power True/False
  unsigned rxonidle :1; //RX is On When Idle True/False
  unsigned reserved :2;
  unsigned seccap :1; //Security Capability True/False
  unsigned allocshortaddr :1; //Allocate Short Address True/False
} __attribute__((packed));

struct zigbee_zdo_node_descriptor_response {
  uint8_t seqnumber;
  uint8_t status;
  uint16_t netaddr; //LSB: 16-bit address of the device
  zigbee_zdo_node_descriptor_response_node_descriptor_t nodedescriptor;
  zigbee_zdo_node_descriptor_response_capability_t capability;
  uint16_t manu; //LSB: Manufacturer Code
  uint8_t maxbufsize; //Maximum size in bytes of a data transmission
  uint16_t maxinbufsize; //LSB: Maximum size in bytes that can be received by the node
  uint16_t servermask; //LSB
  uint16_t maxoutbufsize; //LSB: Maximum size in bytes that can be transmitted by this device
  uint8_t descripcap; //Bit 0: Extended active endpoint list available, Bit 1: Extended simple descriptor list available
} __attribute__((packed));

//ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_RESPONSE
struct zigbee_zdo_simple_descriptor_response {
  uint8_t seqnumber;
  uint8_t status;
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint8_t descriplen; //The length of the simple descriptor
  uint8_t endpoint; //The endpoint on the node to which this descriptor refers
  uint16_t profileid; //LSB: The profile id supported on this endpoint
  uint16_t deviceid; //LSB: Application device id
  uint8_t devicever; //Device Version: 4-bit
  uint8_t clusterlist; //First zigbee_zdo_node_clusters_t is input clusters list then output clusters
} __attribute__((packed));

//ZIGBEE_ZDO_ACTIVE_ENDPOINTS_RESPONSE
struct zigbee_zdo_active_endpoints_response {
  uint8_t seqnumber;
  uint8_t status;
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint8_t numendpoints; //Number of endpoints in the following endpoint list
  uint8_t endpoints[80]; //The list of endpoints
} __attribute__((packed));

//ZIGBEE_ZDO_MATCH_DESCRIPTOR_RESPONSE
struct zigbee_zdo_match_descriptor_response {
  uint8_t seqnumber;
  uint8_t status;
  uint16_t netaddr; //LSB: 16-bit address of the responding device
  uint8_t numendpoints; //Number of endpoints that match the request criteria
  uint8_t endpoints[80]; //The list of endpoints that match the request criteria
} __attribute__((packed));

//ZIGBEE_ZDO_BIND_RESPONSE
struct zigbee_zdo_bind_response {
  uint8_t seqnumber;
  uint8_t status;
} __attribute__((packed));

//ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_RESPONSE
//The entry provides info about a neighbor of the device that responded
struct zigbee_zdo_management_neighbor_table_entry {
  uint64_t panid; //LSB: 64-bit address of the PAN ID
  uint64_t addr; //LSB: 64-bit address of the device
  uint16_t netaddr; //LSB: 16-bit address of the device
  uint8_t various1; //LSB: bits 0-1: Device Type: 0=ZigBee Cordinator
                    //                            1=ZigBee Router
                    //                            2=ZigBee End Device
                    //                            3=Unknown
                    //     bits 2-3: 0=Receiver is off when idle
                    //               1=Receiver is on when idle
                    //               2=Unknown
                    //     bits 4-6: Relationship: 0=Neighbor is parent
                    //                             1=Neighbor is child
                    //                             2=Neighbor is a sibling
                    //                             3=None of the above
                    //                             4=Previous child
                    //     bit 7: Reserved and set to 0
  uint8_t various2; //LSB: bits 0-1: Permit Joining: 0=False, 1=True
  uint8_t depth; //The tree depth of the neighbor device, 0x00=This is the coordinator
  uint8_t lqi; //Estimated link quality
} __attribute__((packed));

struct zigbee_zdo_management_neighbor_table_response {
  uint8_t seqnumber;
  uint8_t status;
  uint8_t totentries; //The total number of neighbor table entries
  uint8_t startidx; //The starting point in the neighbor table
  uint8_t numentries; //The number of neighbor table entries in this response
  zigbee_zdo_management_neighbor_table_entry_t entries[80]; //A list of neighbor table entries: variable size
} __attribute__((packed));

typedef struct zigbee_zdo_management_leave_response zigbee_zdo_management_leave_response_t;
struct zigbee_zdo_management_leave_response {
  uint8_t seqnumber;
  uint8_t status;
} __attribute__((packed));

struct zigbee_zdo_management_permit_joining_response {
  uint8_t seqnumber;
  uint8_t status;
} __attribute__((packed));

//Generic Zigbee ZCL request with appropriate values for sending any type of ZCL Command
struct zcl_general_request {
  uint64_t addr; //LSB: 64-bit address of the destination device
  uint16_t netaddr; //LSB: 16-bit address of the destination device
  uint8_t destendpnt;
  uint8_t srcendpnt;
  uint16_t clusterid; //LSB: Cluster ID
  uint16_t profileid; //LSB: Profile ID
  uint8_t frame_control; //bits 0-1: 0=ZCL General Command
                         //          1=Cluster-Specific Command
                         //bit 2: 1=Manufacturer-Specific Command
                         //bit 3: 0=Client to Server
                         //       1=Server to Client
                         //bit 4: 1=Disable Default Response
                         //bits 5-7: Reserved
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t cmdid; //The Zigbee ZCL Command ID
  uint8_t zigbeelength;
  uint8_t zigbeepayload; //Maps to the ZCL command structure depending what cmdid was specified
} __attribute__((packed));

struct zigbee_zcl_command_read_attribute_list {
  uint16_t attr[80]; //LSB: Attribute ID
} __attribute__((packed));

struct zigbee_zcl_write_attr_record {
  uint16_t attr; //LSB: An attribute
  uint8_t attrtype; //Attribute data type
  zigbee_attrval_t attrdata; //LSB: attribute data: variable width
} __attribute__((packed));

struct zigbee_zcl_command_write_attribute_list {
  zigbee_zcl_write_attr_record_t attr[80];
} __attribute__((packed));

struct zigbee_zcl_configure_reporting_attr_record {
  uint8_t direction; //0=Device will send report and includes attrtype, minintval, maxintval, and reportchange
                     //1=Device will receive report and includes timeout
  uint16_t attr; //LSB: An attribute
  uint8_t attrtype; //Attribute data type
  uint16_t minintval; //Minimum Reporting interval: 0x0000=No min limit
  uint16_t maxintval; //Maximum Reporting interval: 0xffff=Reports will not be issued for this attribute
  zigbee_attrval_t reportchange; //Reportable Change: Variable Length , but only included for Analog Types
  uint16_t timeout; //0=No timeout
} __attribute__((packed));

struct zigbee_zcl_command_configure_reporting_attribute_list {
  zigbee_zcl_configure_reporting_attr_record_t attr[80];
} __attribute__((packed));

struct zigbee_zcl_read_reporting_configuration_record {
  uint8_t direction; //0=Device will send report and includes attrtype, minintval, maxintval, and reportchange
                     //1=Device will receive report and includes timeout
  uint16_t attr; //LSB: An attribute
} __attribute__((packed));

struct zigbee_zcl_command_read_reporting_configuration_list {
  zigbee_zcl_read_reporting_configuration_record_t attr[80];
} __attribute__((packed));

//ZIGBEE_ZCL_CMD_DISC_ATTRIB
struct zigbee_zcl_command_discover_attributes_request {
  uint16_t firstattr; //LSB: First Attribute to begin discovery
  uint8_t maxattrs; //The maximum number of attributes to return
} __attribute__((packed));

//For ZCL Responses
struct zigbee_zcl_command_with_manu {
  uint16_t srcnetaddr; //LSB: 16-bit address of the destination device
  uint8_t srcendpnt;
  uint8_t destendpnt;
  uint16_t clusterid; //LSB: Cluster ID
  uint8_t frame_control; //Frame Type: 2-bit, Manufacturer Specific: 1-bit, Direction: 1-bit, Disable Default Response: 1-bit
  uint16_t manu; //LSB: Manufacturer code (Only used if Bit 2 of frame control is enabled but always included in packet)
  uint8_t seqnumber; //Host must use 0-127, Module uses 128-255
  uint8_t cmdid;
  uint8_t zigbeelength;
  uint8_t zigbeepayload;
} __attribute__((packed));

//ZIGBEE_ZCL_CMD_READ_ATTRIB_RESP
struct zigbee_zcl_command_read_attributes_response {
  uint16_t attr; //LSB: An attribute
  uint8_t status; //Status
  uint8_t attrtype; //Attribute data type
  union {
    uint8_t uval8bit;
    int8_t sval8bit;
    uint16_t  uval16bit;
    int16_t sval16bit;
    uint32_t  uval32bit;
    int32_t sval32bit;
  } value; //Variable size depending on the data type
} __attribute__((packed));

//ZIGBEE_ZCL_CMD_DISC_ATTRIB_RESP
struct zigbee_zcl_attr_info {
  uint16_t attr; //LSB: An attribute
  uint8_t attrtype; //Attribute data type
} __attribute__((packed));

struct zigbee_zcl_command_discover_attributes_response {
  uint8_t disccompl; //0=More attributes to discover, 1=No more attributes to discover
  zigbee_zcl_attr_info_t attrinfo[256];
} __attribute__((packed));

//NOTE: When all configuration of all attribute are successfull, only status is returned
struct zigbee_zcl_configure_reporting_response_attribute_status_record {
  uint8_t status;
  uint8_t direction; //0=Device will send report
                     //1=Device will receive report
  uint16_t attr; //LSB: An attribute
} __attribute__((packed));

struct zigbee_zcl_command_configure_reporting_response {
  zigbee_zcl_configure_reporting_response_attribute_status_record_t statusrecord[80];
} __attribute__((packed));

struct zigbee_zcl_command_report_attributes_reponse_attr_record {
  uint16_t attr; //LSB: An attribute
  uint8_t attrtype; //Attribute data type
  zigbee_attrval_t attrdata; //LSB: attribute data: variable width
} __attribute__((packed));

struct zigbee_zcl_command_report_attributes_response {
  zigbee_zcl_command_report_attributes_reponse_attr_record_t attr[80];
} __attribute__((packed));

struct zigbee_zcl_command_default_response {
  uint8_t cmdid; //The command id that this response refers to
  uint8_t status; //The status of the response
} __attribute__((packed));

#endif
