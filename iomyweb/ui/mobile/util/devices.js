/*
Title: Devices Module for iOmy
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Helps to draw the list entry of a device and its information. Used
    as a wrapper for a variety of modules for each device type, which follow a
    similar structure to this module such as same function names to this one.
Copyright: Capsicum Corporation 2016

This file is part of iOmy.

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

$.sap.declare("IOMy.devices",true);
IOMy.devices = new sap.ui.base.Object();

/**
 * This global module provides a mechanism to draw a device entry in lists such as
 * Device Overview, and Room Overview. Each entry will display information about
 * the device, or otherwise item, whether it's on or off, it varies between each
 * device type.
 */
$.extend(IOMy.devices,{
	Devices: [],
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//-- Zigbee Netvox Smart Plug --//
		if( aDeviceData.DeviceTypeId===2 ) {
            oUIObject = IOMy.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Philips Hue --//
        } else if( aDeviceData.DeviceTypeId===13 ) {
            oUIObject = IOMy.devices.philipshue.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Onvif Stream --//
        } else if ( aDeviceData.DeviceTypeId===12) {
            oUIObject = IOMy.devices.onvif.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Motion Sensor --//
        } else if ( aDeviceData.DeviceTypeId===3) {
            oUIObject = IOMy.devices.motionsensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Temperature Sensor --//
        } else if ( aDeviceData.DeviceTypeId===4) {
            oUIObject = IOMy.devices.temperaturesensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- DevelCo Energy Meter --//
        } else if ( aDeviceData.DeviceTypeId===10) {
            oUIObject = IOMy.devices.develco.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        }
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    GetCommonUIForDeviceOverview: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//-- Zigbee Netvox Smart Plug --//
		if( aDeviceData.DeviceTypeId===2 ) {
            oUIObject = IOMy.devices.zigbeesmartplug.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        //-- Philips Hue --//
        } else if( aDeviceData.DeviceTypeId===13 ) {
            oUIObject = IOMy.devices.philipshue.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        //-- Onvif Stream --//
        } else if ( aDeviceData.DeviceTypeId===12) {
            oUIObject = IOMy.devices.onvif.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        //-- Motion Sensor --//
        } else if ( aDeviceData.DeviceTypeId===3) {
            oUIObject = IOMy.devices.motionsensor.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        //-- Temperature Sensor --//
        } else if ( aDeviceData.DeviceTypeId===4) {
            oUIObject = IOMy.devices.temperaturesensor.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        //-- DevelCo Energy Meter --//
        } else if ( aDeviceData.DeviceTypeId===10) {
            oUIObject = IOMy.devices.develco.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
        }
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	
	GetCommonUITaskList: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
        
        //-- Zigbee Netvox Smart Plug --//
		if( aDeviceData.DeviceTypeId===2 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.zigbeesmartplug.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Philips Hue --//
		} else if( aDeviceData.DeviceTypeId===13 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.philipshue.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Onvif Stream --//
		} else if( aDeviceData.DeviceTypeId===12 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.onvif.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Motion Sensor --//
		} else if( aDeviceData.DeviceTypeId===3 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.motionsensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Temperature Sensor --//
		} else if( aDeviceData.DeviceTypeId===4 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.temperature.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- DevelCo Energy Meter --//
		} else if( aDeviceData.DeviceTypeId===10 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.develco.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
		}
		return aTasks;
	},
    
    GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
        
        //-- Zigbee Netvox Smart Plug --//
		if( aDeviceData.DeviceTypeId===2 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.zigbeesmartplug.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Philips Hue --//
		} else if( aDeviceData.DeviceTypeId===13 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.philipshue.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Onvif Stream --//
		} else if( aDeviceData.DeviceTypeId===12 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.onvif.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Motion Sensor --//
		} else if( aDeviceData.DeviceTypeId===3 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.motionsensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Temperature Sensor --//
		} else if( aDeviceData.DeviceTypeId===4 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.temperaturesensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- DevelCo Energy Meter --//
		} else if( aDeviceData.DeviceTypeId===10 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.develco.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
		}
        
		return aTasks;
	},
	
	// TODO: Is this really necessary since each module has this function that is only called internally?
	GetObjectIdList: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			
			aObjectIdList = [
				sPrefix+"_Container",
				sPrefix+"_Label",
				sPrefix+"_DataContainer",
				sPrefix+"_StatusContainer",
				sPrefix+"_StatusToggle"
			];
			
		}
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
});