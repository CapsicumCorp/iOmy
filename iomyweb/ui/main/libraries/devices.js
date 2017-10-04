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
	}
    
});


$.sap.require("IomyRe.devices.zigbeesmartplug");
$.sap.require("IomyRe.devices.philipshue");
$.sap.require("IomyRe.devices.onvif");
$.sap.require("IomyRe.devices.ipcamera");
$.sap.require("IomyRe.devices.motionsensor");
$.sap.require("IomyRe.devices.weatherfeed");