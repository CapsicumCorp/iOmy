/*
Title: Devices Module for iOmy
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Helps to draw the list entry of a device and its information. Used
    as a wrapper for a variety of modules for each device type, which follow a
    similar structure to this module such as same function names to this one.
Copyright: Capsicum Corporation 2016, 2017

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
 * 
 * There are also functions for validation and status that pertain to all types
 * of devices.
 */
$.extend(IOMy.devices,{
	Devices: [],
    
    GetDeviceStatus : function (iThingId) {
        var sStatus;
        var iStatus = IOMy.common.ThingList["_"+iThingId].Status;
        
        if (iStatus === 1) {
            sStatus = "On";
        } else if (iStatus === 0) {
            sStatus = "Off";
        }
        
        return sStatus;
    },
    
    /**
     * Returns a map of the link a thing (specified by its ID) is connected to.
     * 
     * @param {type} iThingId           // ID of the thing
     * @returns {JS Object}             // Link referenced by its thing/item
     */
    GetLinkOfThing : function(iThingId) {
        var iLinkId = IOMy.common.ThingList["_"+iThingId].LinkId;
        
        var oLink = null;
        // Using the Link List found in common because the scope is global.
        for (var j = 0; j < IOMy.common.LinkList.length; j++) {
            if (IOMy.common.LinkList[j].LinkId === iLinkId) {
                oLink = IOMy.common.LinkList[j];
                break;
            }
        }
        
        return oLink;
    },
    
    /**
     * Function that performs an AJAX request to assign a given link to a given room
     * 
     * @param {type} iLinkId                ID of the link to assign to a room
     * @param {type} iRoomId                ID of the room for the link to be assigned to
     * @param {type} sLinkType              String to display specifying the type of link being assigned.
     */
    AssignLinkToRoom : function (iLinkId, iRoomId, sLinkType) {
        //------------------------------------------------------------//
        // Declare variables
        //------------------------------------------------------------//
        var me = this; // Capture the scope of the current controller
        var sUrl = IOMy.apiphp.APILocation("link");
        
        //------------------------------------------------------------//
        // Begin request
        //------------------------------------------------------------//
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "ChooseRoom", "Id" : parseInt(iLinkId), "RoomId" : parseInt(iRoomId)},
            
            onSuccess : function (response) {
                if (response.Error === false || response.Error === undefined) {
                    IOMy.common.showSuccess(sLinkType+" successfully assigned", "Success",
                        function () {
                            
                            // Head back to the previous page after the core variables have been updated.
                            IOMy.common.ReloadCoreVariables(
                                function () {
                                    IOMy.common.NavigationTriggerBackForward(false);
                                }
                            );
                            
                        },
                    "UpdateMessageBox");
                } else {
                    jQuery.sap.log.error("Error assigning "+sLinkType+":"+response.ErrMesg, "Error");
                    IOMy.common.showError("Error assigning "+sLinkType+":\n\n"+response.ErrMesg, "Error");
                }
            },
            
            onFail : function (error) {
                jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
                IOMy.common.showError("Error assigning "+sLinkType+":\n\n"+error.responseText);
            }
        });
    },
    
    /**
     * Validates the room selection mainly just to ensure that everything (like
     * the room ID) is correct and hasn't been tampered with in some way.
     * 
     * @param {UI5 widget} oScope
     * @returns {map}
     */
    ValidateRoom : function (oScope) {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var oField                  = oScope.byId(me.uiIDs.sRoomCBoxID+"Field");
        
        //-------------------------------------------------\\
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oField.getSelectedKey() === "") {
                bError = true;
                aErrorMessages.push("Room is not valid");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x8101: There was an error checking the room: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData, bIsUnassigned ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//-- Zigbee Netvox Smart Plug --//
		if( aDeviceData.DeviceTypeId===2 ) {
            oUIObject = IOMy.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- Philips Hue --//
        } else if( aDeviceData.DeviceTypeId===13 ) {
            oUIObject = IOMy.devices.philipshue.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- Onvif Stream --//
        } else if ( aDeviceData.DeviceTypeId===12) {
            oUIObject = IOMy.devices.onvif.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- Motion Sensor --//
        } else if ( aDeviceData.DeviceTypeId===3) {
            oUIObject = IOMy.devices.motionsensor.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- Temperature Sensor --//
        } else if ( aDeviceData.DeviceTypeId===4) {
            oUIObject = IOMy.devices.temperaturesensor.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- DevelCo Energy Meter --//
        } else if ( aDeviceData.DeviceTypeId===10) {
            oUIObject = IOMy.devices.develco.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
        //-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            oUIObject = IOMy.devices.weatherfeed.GetCommonUI( sPrefix, oViewScope, aDeviceData, bIsUnassigned );
            
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
            
        //-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            oUIObject = IOMy.devices.weatherfeed.GetCommonUIForDeviceOverview( sPrefix, oViewScope, aDeviceData );
            
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
		//-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.weatherfeed.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
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
		//console.log(JSON.stringify(aDeviceData));
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
            
		//-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IOMy.devices.weatherfeed.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
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