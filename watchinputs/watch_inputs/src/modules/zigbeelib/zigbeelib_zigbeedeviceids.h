/*
Title: ZigBee Library Device IDs Header for Watch Inputs
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

#ifndef ZIGBEELIB_ZIGBEEDEVICEIDS_H
#define ZIGBEELIB_ZIGBEEDEVICEIDS_H

//Home Automation Known Zigbee Device IDs
#define ZIGBEE_DEVICEID_HA_ON_OFF_SWITCH 0x0000 //HA On/Off Switch
#define ZIGBEE_DEVICEID_HA_LEVEL_CONTROL_SWITCH 0x0001 //HA Level Control Switch
#define ZIGBEE_DEVICEID_HA_ON_OFF_OUTPUT 0x0002 //HA On/Off Output
#define ZIGBEE_DEVICEID_HA_LEVEL_CONTROLLABLE_OUTPUT 0x0003 //HA Level Controllable Output
#define ZIGBEE_DEVICEID_HA_SCENE_SELECTOR 0x0004 //HA Scene Selector
#define ZIGBEE_DEVICEID_HA_CONFIGURATION_TOOL 0x0005 //HA Configuration Tool
#define ZIGBEE_DEVICEID_HA_REMOTE_CONTROL 0x0006 //HA Remote Control
#define ZIGBEE_DEVICEID_HA_COMBINED_INTERFACE 0x0007 //HA Combined Interface
#define ZIGBEE_DEVICEID_HA_RANGE_EXTENDER 0x0008 //HA Range Extender
#define ZIGBEE_DEVICEID_HA_MAINS_POWER_OUTLET 0x0009 //HA Mains Power Outlet
#define ZIGBEE_DEVICEID_HA_DOOR_LOCK 0x000A //HA Door Lock
#define ZIGBEE_DEVICEID_HA_DOOR_LOCK_CONTROLLER 0x000B //HA Door Lock Controller
#define ZIGBEE_DEVICEID_HA_SIMPLE_SENSOR 0x000C //HA Simple Sensor
#define ZIGBEE_DEVICEID_HA_COMSUMPTION_AWARENESS_DEVICE 0x000D //HA Consumption Awareness Device
#define ZIGBEE_DEVICEID_HA_HOME_GATEWAY 0x0050 //HA Home Gateway / Energy Management System
#define ZIGBEE_DEVICEID_HA_SMART_PLUG 0x0051 //HA Smart Plug
#define ZIGBEE_DEVICEID_HA_WHITE_GOODS 0x0052 //HA White Goods
#define ZIGBEE_DEVICEID_HA_METER_INTERFACE 0x0053 //HA Meter Interface
#define ZIGBEE_DEVICEID_HA_ON_OFF_LIGHT 0x0100 //HA On/Off Light
#define ZIGBEE_DEVICEID_HA_DIMMABLE_LIGHT 0x0101 //HA Dimmable Light
#define ZIGBEE_DEVICEID_HA_COLOR_DIMMABLE_LIGHT 0x0102 //HA Color Dimmable Light
#define ZIGBEE_DEVICEID_HA_ON_OFF_LIGHT_SWITCH 0x0103 //HA On/Off Light Switch
#define ZIGBEE_DEVICEID_HA_DIMMER_SWITCH 0x0104 //HA Dimmer Switch
#define ZIGBEE_DEVICEID_HA_COLOR_DIMMER_SWITCH 0x0105 //HA Color Dimmer Switch
#define ZIGBEE_DEVICEID_HA_LIGHT_SENSOR 0x0106 //HA Light Sensor
#define ZIGBEE_DEVICEID_HA_OCCUPANCY_SENSOR 0x0107 //HA Occupancy Sensor
#define ZIGBEE_DEVICEID_HA_SHADE 0x0200 //HA Shade
#define ZIGBEE_DEVICEID_HA_SHADE_CONTROLLER 0x0201 //HA Shade Controller
#define ZIGBEE_DEVICEID_HA_WINDOW_COVERING 0x0202 //HA Window Covering
#define ZIGBEE_DEVICEID_HA_WINDOW_COVERING_CONTROLLER 0x0203 //HA Window Covering Controller
#define ZIGBEE_DEVICEID_HA_HEATING_COOLING_UNIT 0x0300 //HA Heating Cooling Unit
#define ZIGBEE_DEVICEID_HA_THERMOSTAT 0x0301 //HA Thermostat
#define ZIGBEE_DEVICEID_HA_TEMPERATURE_SENSOR 0x0302 //HA Temperature Sensor
#define ZIGBEE_DEVICEID_HA_PUMP 0x0303 //HA Pump
#define ZIGBEE_DEVICEID_HA_PUMP_CONTROLLER 0x0304 //HA Pump Controller
#define ZIGBEE_DEVICEID_HA_PRESSURE_SENSOR 0x0305 //HA Pressure Sensor
#define ZIGBEE_DEVICEID_HA_FLOW_SENSOR 0x0306 //HA Flow Sensor
#define ZIGBEE_DEVICEID_HA_MINI_SPLIT_AC 0x0307 //HA Mini Split AC
#define ZIGBEE_DEVICEID_HA_IAS_CONTROL_AND_INDICATION_EQUIPMENT 0x0400 //HA IAS Control and Indication Equipment
#define ZIGBEE_DEVICEID_HA_IAS_ANCILLARY_CONTROL_EQUIPMENT 0x0401 //HA IAS Ancillary Control Equipment
#define ZIGBEE_DEVICEID_HA_IAS_ZONE 0x0402 //HA IAS Zone
#define ZIGBEE_DEVICEID_HA_IAS_WARNING_DEVICE 0x0403 //HA IAS Warning Device

//Home Automation Known Zigbee Device Strings
#define ZIGBEE_DEVICEID_HA_ON_OFF_SWITCH_STR "HA On/Off Switch"
#define ZIGBEE_DEVICEID_HA_LEVEL_CONTROL_SWITCH_STR "HA Level Control Switch"
#define ZIGBEE_DEVICEID_HA_ON_OFF_OUTPUT_STR "HA On/Off Output"
#define ZIGBEE_DEVICEID_HA_LEVEL_CONTROLLABLE_OUTPUT_STR "HA Level Controllable Output"
#define ZIGBEE_DEVICEID_HA_SCENE_SELECTOR_STR "HA Scene Selector"
#define ZIGBEE_DEVICEID_HA_CONFIGURATION_TOOL_STR "HA Configuration Tool"
#define ZIGBEE_DEVICEID_HA_REMOTE_CONTROL_STR "HA Remote Control"
#define ZIGBEE_DEVICEID_HA_COMBINED_INTERFACE_STR "HA Combined Interface"
#define ZIGBEE_DEVICEID_HA_RANGE_EXTENDER_STR "HA Range Extender"
#define ZIGBEE_DEVICEID_HA_MAINS_POWER_OUTLET_STR "HA Mains Power Outlet"
#define ZIGBEE_DEVICEID_HA_DOOR_LOCK_STR "HA Door Lock"
#define ZIGBEE_DEVICEID_HA_DOOR_LOCK_CONTROLLER_STR "HA Door Lock Controller"
#define ZIGBEE_DEVICEID_HA_SIMPLE_SENSOR_STR "HA Simple Sensor"
#define ZIGBEE_DEVICEID_HA_COMSUMPTION_AWARENESS_DEVICE_STR "HA Consumption Awareness Device"
#define ZIGBEE_DEVICEID_HA_HOME_GATEWAY_STR "HA Home Gateway / Energy Management System"
#define ZIGBEE_DEVICEID_HA_SMART_PLUG_STR "HA Smart Plug"
#define ZIGBEE_DEVICEID_HA_WHITE_GOODS_STR "HA White Goods"
#define ZIGBEE_DEVICEID_HA_METER_INTERFACE_STR "HA Meter Interface"
#define ZIGBEE_DEVICEID_HA_ON_OFF_LIGHT_STR "HA On/Off Light"
#define ZIGBEE_DEVICEID_HA_DIMMABLE_LIGHT_STR "HA Dimmable Light"
#define ZIGBEE_DEVICEID_HA_COLOR_DIMMABLE_LIGHT_STR "HA Color Dimmable Light"
#define ZIGBEE_DEVICEID_HA_ON_OFF_LIGHT_SWITCH_STR "HA On/Off Light Switch"
#define ZIGBEE_DEVICEID_HA_DIMMER_SWITCH_STR "HA Dimmer Switch"
#define ZIGBEE_DEVICEID_HA_COLOR_DIMMER_SWITCH_STR "HA Color Dimmer Switch"
#define ZIGBEE_DEVICEID_HA_LIGHT_SENSOR_STR "HA Light Sensor"
#define ZIGBEE_DEVICEID_HA_OCCUPANCY_SENSOR_STR "HA Occupancy Sensor"
#define ZIGBEE_DEVICEID_HA_SHADE_STR "HA Shade"
#define ZIGBEE_DEVICEID_HA_SHADE_CONTROLLER_STR "HA Shade Controller"
#define ZIGBEE_DEVICEID_HA_WINDOW_COVERING_STR "HA Window Covering"
#define ZIGBEE_DEVICEID_HA_WINDOW_COVERING_CONTROLLER_STR "HA Window Covering Controller"
#define ZIGBEE_DEVICEID_HA_HEATING_COOLING_UNIT_STR "HA Heating Cooling Unit"
#define ZIGBEE_DEVICEID_HA_THERMOSTAT_STR "HA Thermostat"
#define ZIGBEE_DEVICEID_HA_TEMPERATURE_SENSOR_STR "HA Temperature Sensor"
#define ZIGBEE_DEVICEID_HA_PUMP_STR "HA Pump"
#define ZIGBEE_DEVICEID_HA_PUMP_CONTROLLER_STR "HA Pump Controller"
#define ZIGBEE_DEVICEID_HA_PRESSURE_SENSOR_STR "HA Pressure Sensor"
#define ZIGBEE_DEVICEID_HA_FLOW_SENSOR_STR "HA Flow Sensor"
#define ZIGBEE_DEVICEID_HA_MINI_SPLIT_AC_STR "HA Mini Split AC"
#define ZIGBEE_DEVICEID_HA_IAS_CONTROL_AND_INDICATION_EQUIPMENT_STR "HA IAS Control and Indication Equipment"
#define ZIGBEE_DEVICEID_HA_IAS_ANCILLARY_CONTROL_EQUIPMENT_STR "HA IAS Ancillary Control Equipment"
#define ZIGBEE_DEVICEID_HA_IAS_ZONE_STR "HA IAS Zone"
#define ZIGBEE_DEVICEID_HA_IAS_WARNING_DEVICE_STR "HA IAS Warning Device"

#endif
