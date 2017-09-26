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

$.sap.declare("IomyRe.devices",true);
IomyRe.devices = new sap.ui.base.Object();

/**
 * This global module provides a mechanism to draw a device entry in lists such as
 * Device Overview, and Room Overview. Each entry will display information about
 * the device, or otherwise item, whether it's on or off, it varies between each
 * device type.
 * 
 * There are also functions for validation and status that pertain to all types
 * of devices.
 */
$.extend(IomyRe.devices,{
	Devices: [],
	
	iODataFieldsToFetch				: 0,
	bWaitingToLoadAPI				: false,
	bLoadingFieldsFromAPI			: false,
	bLoadingFieldsFromOData			: false,
    
    /**
     * Returns the current on/off status of a given device in the form of "On"
     * or "Off".
     * 
     * @param {type} iThingId               ID of the device.
     * @returns {String} Human-readable status
     */
    GetDeviceStatus : function (iThingId) {
        var sStatus;
        var iStatus = IomyRe.common.ThingList["_"+iThingId].Status;
        
        if (iStatus === 1) {
            sStatus = "On";
        } else if (iStatus === 0) {
            sStatus = "Off";
        }
        
        return sStatus;
    },
    
    ToggleDeviceStatus : function (iThingId) {
        // TODO: Work out what to do with this!
        if (iThingId > 0) {
            var sUrl = IomyRe.apiphp.APILocation("statechange");
            
            IomyRe.apiphp.AjaxRequest({
                url: sUrl,
                data : { "Mode" : "ThingToggleStatus", "Id" : iThingId },
                
                
                
            });
        } else {
            //IomyRe.common.ThingList["_"+iThingId].Status = iState;
        }
        
    },
    
    /**
     * Returns a map of the link a thing (specified by its ID) is connected to.
     * 
     * @param {type} iThingId        ID of the thing
     * @returns {object}             Link referenced by its thing/item
     */
    GetLinkOfThing : function(iThingId) {
        var iLinkId = IomyRe.common.ThingList["_"+iThingId].LinkId;
        
        var oLink = null;
        // Using the Link List found in common because the scope is global.
        if (IomyRe.common.LinkList["_"+iLinkId] !== undefined) {
			oLink = IomyRe.common.getLink(iLinkId);
		}
        
        return oLink;
    },
    
	/**
     * Performs an AJAX request to assign a given device to a given room.
     * 
     * Required parameters:
     * 
     * thingID OR linkID:       Takes either the thing ID (preferred) or link ID to indicate which link to move.
     * roomID:                  The ID of the room to move the device to.
     * 
     * Optional parameters:
     * 
     * onSuccess:       Function to run after a successful execution.
     * onFail:          Function to run after an error is encountered.
     * 
     * @param {type} mSettings
     */
    AssignDeviceToRoom : function (mSettings) {
        //------------------------------------------------------------//
        // Declare variables
        //------------------------------------------------------------//
        var me				= this; // Capture the scope of the current controller
        var bError			= false;
		var aErrorMessages	= [];
		var sUrl			= IomyRe.apiphp.APILocation("link");
		var iLinkId;
		var iRoomId;
        var mDeviceIDInfo;
		var mRoomIDInfo;
		var fnSuccess;
		var fnFail;
		
		//--------------------------------------------------------------------//
		// Read the settings map
		//--------------------------------------------------------------------//
		if (mSettings !== undefined) {
			//----------------------------------------------------------------//
			// REQUIRED: Either a valid Thing ID to get the link ID, or the
			// Link ID itself.
			//----------------------------------------------------------------//
			if (mSettings.thingID !== undefined) {
				mDeviceIDInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
				
				bError			= !mDeviceIDInfo.bIsValid;
				aErrorMessages	= aErrorMessages.concat(mDeviceIDInfo.aErrorMessages);
				
				if (!bError) {
					iLinkId = IomyRe.common.ThingList["_"+mSettings.thingID].LinkId;
				}
			} else {
				if (mSettings.linkID !== undefined) {
//					mDeviceIDInfo = IomyRe.validation.isLinkIDValid(mSettings.linkID);
//				
//					bError			= !mDeviceIDInfo.bIsValid;
//					aErrorMessages	= aErrorMessages.concat(mDeviceIDInfo.aErrorMessages);
//					
//					if (!bError) {
						iLinkId = mSettings.linkID;
//					}
				} else {
					fnAppendError("Thing (thingID) or Link (linkID) must be specified!");
				}
			}
			
			if (bError) {
				throw new IllegalArgumentException( aErrorMessages.join("\n") );
			}
			
			//----------------------------------------------------------------//
			// Valid Room ID
			//----------------------------------------------------------------//
			if (mSettings.roomID !== undefined) {
				//-- Room ID --//
				mRoomIDInfo		= IomyRe.validation.isRoomIDValid(mSettings.roomID);

				bError			= !mRoomIDInfo.bIsValid;
				aErrorMessages	= aErrorMessages.concat(mRoomIDInfo.aErrorMessages);
				
				// Throw an exception if the room ID is invalid.
				if (bError) {
					throw new IllegalArgumentException( aErrorMessages.join("\n") );
				} else {
					iRoomId		= mSettings.roomID;
				}
			} else {
                fnAppendError("Room ID (roomID) must be specified!");
            }
			
			//--------------------------------------------------------------------//
			// Check the settings map for two callback functions.
			//--------------------------------------------------------------------//
			//-- Success callback --//
			if (mSettings.onSuccess === undefined) {
				fnSuccess = function () {};
			} else {
				fnSuccess = mSettings.onSuccess;
			}

			//-- Failure callback --//
			if (mSettings.onFail === undefined) {
				fnFail = function () {};
			} else {
				fnFail = mSettings.onFail;
			}
			
		} else {
			throw new MissingSettingsMapException();
		}
		
        //------------------------------------------------------------//
        // Begin request
        //------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "ChooseRoom", "Id" : parseInt(iLinkId), "RoomId" : parseInt(iRoomId)},
            
            onSuccess : function (response, data) {
				try {
					if (data.Error === false) {
						fnSuccess();

					} else {
						fnFail(data.ErrMesg);
					}
				} catch (ex) {
					fnFail(ex.message);
				}
            },
            
            onFail : function (error) {
				fnFail("Error (HTTP Status "+error.status+"): "+error.responseText);
                //jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            }
        });
    },
	
    /**
     * Fetches the ID of a specific page to interact with a particular device.
     * 
     * @param {Number} iThingTypeId             ID of the thing type.
     * @returns {string} Page ID of the appropriate device page.
     */
	getDevicePageID : function (iThingTypeId) {
		//-- Zigbee Netvox Smart Plug --//
		if( iThingTypeId===2 ) {
            return IomyRe.devices.zigbeesmartplug.DevicePageID;
            
        //-- Philips Hue --//
        } else if( iThingTypeId===13 ) {
            return IomyRe.devices.philipshue.DevicePageID;
            
        //-- Onvif Stream --//
        } else if ( iThingTypeId===12) {
            return IomyRe.devices.onvif.DevicePageID;
            
        //-- Motion Sensor --//
        } else if ( iThingTypeId===3) {
            return IomyRe.devices.motionsensor.DevicePageID;
            
        //-- Temperature Sensor --//
        } else if ( iThingTypeId===4) {
            return IomyRe.devices.temperaturesensor.DevicePageID;
            
        //-- DevelCo Energy Meter --//
        } else if ( iThingTypeId===10) {
            return IomyRe.devices.develco.DevicePageID;
            
        //-- Weather Feed --//
        } else if ( iThingTypeId===14) {
            return IomyRe.devices.weatherfeed.DevicePageID;
            
        //-- IP Camera --//
        } else if ( iThingTypeId===18) {
            return IomyRe.devices.ipcamera.DevicePageID;
		
		//-----------------------------------//
        // --- Experimental Device Pages --- //
        //-----------------------------------//
        //-- Door Lock --//
//        } else if ( iThingTypeId==="-1") {
//            return IomyRe.devices.zigbeesmartplug.DevicePageID;
//            
//        //-- Window Sensor --//
//        } else if ( iThingTypeId==="-2") {
//            return IomyRe.devices.zigbeesmartplug.DevicePageID;
//            
//        //-- Bluetooth Scales --//
//        } else if ( iThingTypeId==="-3") {
//            return IomyRe.devices.bluetoothscale.DevicePageID;
//            
//        //-- Blood Pressure Montior --//
//        } else if ( iThingTypeId==="-4") {
//            return IomyRe.devices.bpm.DevicePageID;
//            
//        //-- Remote Controlled Garage Door --//
//        } else if ( iThingTypeId==="-5") {
//           return IomyRe.devices.garagedoor.DevicePageID;
//            
//        //-- Thermostat --//
//        } else if ( iThingTypeId==="-6") {
//           return IomyRe.devices.thermostat.DevicePageID;
//            
        }
	},
	
    /**
     * Draws the device entry UI of a given device. The UI will be chosen
     * according to the type of device specified.
     * 
     * @param {string} sPrefix          Prefixes appended to each element ID created.
     * @param {object} oViewScope       The scope or context of the page it is supposed to show on.
     * @param {object} aDeviceData      Data of a given device.
     * 
     * @returns {sap.m.HBox}    The device entry to be placed in the UI.
     */
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
            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Philips Hue --//
        } else if( aDeviceData.DeviceTypeId===13 ) {
            oUIObject = IomyRe.devices.philipshue.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Onvif Stream --//
        } else if ( aDeviceData.DeviceTypeId===12) {
            oUIObject = IomyRe.devices.onvif.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Motion Sensor --//
        } else if ( aDeviceData.DeviceTypeId===3) {
            oUIObject = IomyRe.devices.motionsensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Temperature Sensor --//
        } else if ( aDeviceData.DeviceTypeId===4) {
            oUIObject = IomyRe.devices.temperaturesensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- DevelCo Energy Meter --//
        } else if ( aDeviceData.DeviceTypeId===10) {
            oUIObject = IomyRe.devices.develco.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            oUIObject = IomyRe.devices.weatherfeed.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
            
        //-- IP Camera --//
        } else if ( aDeviceData.DeviceTypeId===18) {
            oUIObject = IomyRe.devices.ipcamera.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-----------------------------------//
        // --- Experimental Device Pages --- //
        //-----------------------------------//
        //-- Door Lock --//
//        } else if ( aDeviceData.DeviceTypeId==="-1") {
//            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Window Sensor --//
//        } else if ( aDeviceData.DeviceTypeId==="-2") {
//            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Bluetooth Scales --//
//        } else if ( aDeviceData.DeviceTypeId==="-3") {
//            oUIObject = IomyRe.devices.bluetoothscale.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Blood Pressure Montior --//
//        } else if ( aDeviceData.DeviceTypeId==="-4") {
//            oUIObject = IomyRe.devices.bpm.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Remote Controlled Garage Door --//
//        } else if ( aDeviceData.DeviceTypeId==="-5") {
//           oUIObject = IomyRe.devices.garagedoor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Thermostat --//
//        } else if ( aDeviceData.DeviceTypeId==="-6") {
//           oUIObject = IomyRe.devices.thermostat.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
        }
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    /**
     * @deprecated Use GetCommonUI instead.
     * 
     * @param {type} sPrefix
     * @param {type} oViewScope
     * @param {type} aDeviceData
     * @returns {unresolved}
     */
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
            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Philips Hue --//
        } else if( aDeviceData.DeviceTypeId===13 ) {
            oUIObject = IomyRe.devices.philipshue.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Onvif Stream --//
        } else if ( aDeviceData.DeviceTypeId===12) {
            oUIObject = IomyRe.devices.onvif.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Motion Sensor --//
        } else if ( aDeviceData.DeviceTypeId===3) {
            oUIObject = IomyRe.devices.motionsensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Temperature Sensor --//
        } else if ( aDeviceData.DeviceTypeId===4) {
            oUIObject = IomyRe.devices.temperaturesensor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- DevelCo Energy Meter --//
        } else if ( aDeviceData.DeviceTypeId===10) {
            oUIObject = IomyRe.devices.develco.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            oUIObject = IomyRe.devices.weatherfeed.GetCommonUI( sPrefix, oViewScope, aDeviceData );
			
        //-- IP Camera --//
        } else if ( aDeviceData.DeviceTypeId===18) {
            oUIObject = IomyRe.devices.ipcamera.GetCommonUI( sPrefix, oViewScope, aDeviceData );
            
        //-----------------------------------//
        // --- Experimental Device Pages --- //
        //-----------------------------------//
        //-- Door Lock --//
//        } else if ( aDeviceData.DeviceTypeId==="-1") {
//            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Window Sensor --//
//        } else if ( aDeviceData.DeviceTypeId==="-2") {
//            oUIObject = IomyRe.devices.zigbeesmartplug.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Bluetooth Scales --//
//        } else if ( aDeviceData.DeviceTypeId==="-3") {
//            oUIObject = IomyRe.devices.bluetoothscale.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Blood Pressure Montior --//
//        } else if ( aDeviceData.DeviceTypeId==="-4") {
//            oUIObject = IomyRe.devices.bpm.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Remote Controlled Garage Door --//
//        } else if ( aDeviceData.DeviceTypeId==="-5") {
//            oUIObject = IomyRe.devices.garagedoor.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
//        //-- Remote Controlled Garage Door --//
//        } else if ( aDeviceData.DeviceTypeId==="-6") {
//            oUIObject = IomyRe.devices.thermostat.GetCommonUI( sPrefix, oViewScope, aDeviceData );
//            
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
                aTasks = IomyRe.devices.zigbeesmartplug.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Philips Hue --//
		} else if( aDeviceData.DeviceTypeId===13 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.philipshue.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Onvif Stream --//
		} else if( aDeviceData.DeviceTypeId===12 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.onvif.GetCommonUITaskList( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Motion Sensor --//
		} else if( aDeviceData.DeviceTypeId===3 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.motionsensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Temperature Sensor --//
		} else if( aDeviceData.DeviceTypeId===4 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.temperature.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- DevelCo Energy Meter --//
		} else if( aDeviceData.DeviceTypeId===10 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.develco.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
		//-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.weatherfeed.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
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
                aTasks = IomyRe.devices.zigbeesmartplug.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Philips Hue --//
		} else if( aDeviceData.DeviceTypeId===13 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.philipshue.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Onvif Stream --//
		} else if( aDeviceData.DeviceTypeId===12 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.onvif.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Motion Sensor --//
		} else if( aDeviceData.DeviceTypeId===3 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.motionsensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- Temperature Sensor --//
		} else if( aDeviceData.DeviceTypeId===4 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.temperaturesensor.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
        //-- DevelCo Energy Meter --//
		} else if( aDeviceData.DeviceTypeId===10 ) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.develco.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
            }
            
		//-- Weather Feed --//
        } else if ( aDeviceData.DeviceTypeId===14) {
            if( aDeviceData.IOs!==undefined ) {
                aTasks = IomyRe.devices.weatherfeed.GetCommonUITaskListForDeviceOverview( Prefix, oViewScope, aDeviceData );
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


$.sap.require("IomyRe.devices.zigbeesmartplug");
$.sap.require("IomyRe.devices.philipshue");
$.sap.require("IomyRe.devices.onvif");
$.sap.require("IomyRe.devices.ipcamera");
$.sap.require("IomyRe.devices.motionsensor");
$.sap.require("IomyRe.devices.weatherfeed");