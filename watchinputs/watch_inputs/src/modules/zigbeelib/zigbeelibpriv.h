/*
Title: ZigBee Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Private definitions for zigbee library used by multiple c++ and c files
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

*/

#ifndef ZIGBEELIBPRIV_H
#define ZIGBEELIBPRIV_H

#include "moduleinterface.h"

#ifdef __cplusplus
extern "C" {
#endif

//External Function Declarations
extern int zigbeelib_start(void);
extern void zigbeelib_stop(void);
extern int zigbeelib_init(void);
extern void zigbeelib_shutdown(void);
extern void zigbeelib_register_listeners(void);
extern void zigbeelib_unregister_listeners(void);

extern void zigbeelib_process_zdo_send_status(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_process_zcl_send_status(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_process_zdo_seqnumber(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_process_zcl_seqnumber(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked);

extern void zigbeelib_process_zdo_response_received(int localzigbeeindex, zigbee_zdo_response_header_t *zdocmd, long *localzigbeelocked, long *zigbeelocked);
extern void process_zdo_response_timeout(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

extern void zigbeelib_decode_zigbee_home_automation_attribute(int localzigbeeindex, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, uint16_t attrid, uint8_t status, uint8_t attrtype, const zigbee_attrval_t * const attrvalptr, uint8_t *attrsizeptr, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_decode_zigbee_home_automation_attribute2(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint16_t manu, uint16_t attrid, uint8_t status, uint8_t attrtype, const zigbee_attrval_t * const attrvalptr, uint8_t *attrsizeptr, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_process_zcl_response_received(int localzigbeeindex, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked);
extern void process_zcl_response_timeout(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
extern int zigbeelib_find_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);
extern int zigbeelib_add_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, char devicetype, char rxonidle, long *localzigbeelocked, long *zigbeelocked);
extern int zigbeelib_remove_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_remove_all_zigbee_devices(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_get_zigbee_info(int localzigbeeindex, uint64_t addr, uint16_t netaddr, int pos, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_get_zigbee_endpoints(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);
extern void zigbeelib_get_zigbee_next_endpoint_info(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked);

extern int zigbeelib_register_home_automation_endpointid(int localzigbeeindex, uint8_t haendpointid, long *localzigbeelocked, long *zigbeelocked);

extern int zigbeelib_add_localzigbeedevice(zigbeelib_localzigbeedevice_ver_1_t *localzigbeedevice, 
zigbeelib_localzigbeedevice_iface_ver_1_t *zigbeedeviceiface, unsigned long long features, long *localzigbeelocked, long *zigbeelocked);
extern int zigbeelib_remove_localzigbeedevice(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked);

extern moduleinfo_ver_generic_t *zigbeelib_getmoduleinfo();

#ifdef __cplusplus
}
#endif

#endif
