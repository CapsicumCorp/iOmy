/*
Title: iOmy Functions Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares various functions that are used across multiple pages.
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

$.sap.declare("IomyRe.functions",true);

IomyRe.functions = new sap.ui.base.Object();

$.extend(IomyRe.functions, {
    
    
    createDeviceListData : function (mSettings) {
        var aaDeviceList                = {};
        var iPremiseId                  = 0;
        var iRoomId                     = 0;
        var aDevicesInAlphabeticalOrder = [];
        
        //--------------------------------------------------------------------//
        // Look for any specified filters and apply them.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            
            if (mSettings.filter !== undefined || mSettings.filter !== null) {
                
                if (mSettings.filter.premiseID) {
                    iPremiseId = mSettings.filter.premiseID;
                }
                
                if (mSettings.filter.roomID) {
                    iRoomId = mSettings.filter.roomID;
                }
                
            }
            
        }
        
        $.each( IomyRe.common.ThingList, function( sIndex, mThing ) {

            //-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
            if ( mThing!==undefined ) {

                if ((iPremiseId === 0 || iPremiseId == mThing.PremiseId) && (iRoomId === 0 || iRoomId == mThing.RoomId)) {
                    //--------------------------------------------//
                    //-- If Grouping isn't setup yet            --//
                    //--------------------------------------------//
                    if( aaDeviceList["thingType"+mThing.TypeId] === undefined ) {
                        //-- Define the Grouping --//
                        aaDeviceList["thingType"+mThing.TypeId] = {
                            "Name": mThing.TypeName,        //-- Display the name of the Grouping --//
                            "Prefix":"Dev",                 //-- Prefix to make object have a unique Id --//
                            "Devices":[]                    //-- Array to store the devices in the Grouping --//
                        };
                    }

                    aDevicesInAlphabeticalOrder.push(mThing);
                }
            }
        });
        
        aDevicesInAlphabeticalOrder.sort(
            function (a, b) {
                var sA = a.DisplayName.toLowerCase();
                var sB = b.DisplayName.toLowerCase();
                
                if (sA === sB) {
                    return 0;
                } else if (sA > sB) {
                    return 1;
                } else if (sA < sB) {
                    return -1;
                }
            }
        );
        
        //--------------------------------------------------------------------//
        // Construct the Device List using any filters specified.
        //--------------------------------------------------------------------//
        $.each( aDevicesInAlphabeticalOrder, function( sIndex, mThing ) {

            //-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
            if ( mThing!==undefined ) {

                if ((iPremiseId === 0 || iPremiseId == mThing.PremiseId) && (iRoomId === 0 || iRoomId == mThing.RoomId)) {
                    //--------------------------------------------//
                    //-- Add the Devices into the Grouping        --//
                    //--------------------------------------------//
                    aaDeviceList["thingType"+mThing.TypeId].Devices.push({
                        "DeviceId":          mThing.Id,
                        "DeviceName":        mThing.DisplayName,
                        "DeviceTypeId":      mThing.TypeId,
                        "DeviceTypeName":    mThing.TypeName,
                        "DeviceStatus":      mThing.Status,
                        "LinkId":            mThing.LinkId,
                        "PermToggle":        mThing.PermToggle,
                        "IOs":               mThing.IO,
                        "RoomId":            mThing.RoomId,
                        "PremiseId":         mThing.PremiseId,
                        "UILastUpdate":      mThing.UILastUpdate
                    });
                }
            }
        });
        
        return aaDeviceList;
    },
    
    /**
     * Extracts the HSL values out of a RGB colour string.
     * 
     * Used this guide for the forumla: https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
     * 
     * @param {type} sColorString       RGB colour string (e.g. 'rgb(120,33,10)')
     * @returns {object}                Map containing the HSL values.
     */
    convertRGBToHSL : function (sColorString) {
        var aFigures;
        var fRed;
        var fGreen;
        var fBlue;
        
        var fMin, fMax;
        var fDifference;
        
        var iHue;
        var iSat;
        var iLight;
        
        //console.log(sColorString);
        
        //--------------------------------------------------------------------//
        // First check that the colour string is given.
        //--------------------------------------------------------------------//
        if (!sColorString) {
            throw new MissingArgumentException("RGB Colour String must be specified!");
        }
        
        //--------------------------------------------------------------------//
        // Next begin removing the unwanted characters "rgb(" and ")"
        //--------------------------------------------------------------------//
        sColorString = sColorString.replace("rgb(", "");
        sColorString = sColorString.replace(")", "");
        
        //--------------------------------------------------------------------//
        // Split the figures into three in an array and fetch the values in
        // decimal format, that is, divided by 255.
        //--------------------------------------------------------------------//
        aFigures = sColorString.split(",");
        
        fRed    = aFigures[0] / 255;
        fGreen  = aFigures[1] / 255;
        fBlue   = aFigures[2] / 255;
        
        //--------------------------------------------------------------------//
        // Determine which of the three numbers is the minimum and maximum.
        //--------------------------------------------------------------------//
        fMin = Math.min( fRed, fGreen, fBlue );
        fMax = Math.max( fRed, fGreen, fBlue );
        
        fDifference = fMax - fMin;
        
        //--------------------------------------------------------------------//
        // Find the luminance figure.
        //--------------------------------------------------------------------//
        iLight = ((fMin + fMax)/2);
        
        //--------------------------------------------------------------------//
        // Find the saturation
        //--------------------------------------------------------------------//
        if (iLight <= 0.5) {
            iSat = ((fDifference / (fMax + fMin)));
            
        } else {
            iSat = ((fDifference / (2 - fMax - fMin)));
            
        }
        
        //--------------------------------------------------------------------//
        // Find the hue
        //--------------------------------------------------------------------//
        if (fMax === fRed) {
            iHue = (fGreen - fBlue) / fDifference;
            
        } else if (fMax === fGreen) {
            iHue = 2 + (fBlue - fRed) / fDifference;
            
        } else if (fMax === fBlue) {
            iHue = 4 + (fRed - fGreen) / fDifference;
            
        }
        
        iHue /= 6;
        
        //--------------------------------------------------------------------//
        // Round off the figures.
        //--------------------------------------------------------------------//
        iHue = Math.round(iHue * 360);
        iSat = Math.round(iSat * 100);
        iLight = Math.round(iLight * 100);
        
//        console.log(iHue);
//        console.log(iSat);
//        console.log(iLight);
        
        //--------------------------------------------------------------------//
        // Return the figures.
        //--------------------------------------------------------------------//
        return {
            "hue"           : iHue,
            "saturation"    : iSat,
            "light"         : iLight
        };
    },
    
    /**
     * Retrives the hub that a thing is connected to.
     * 
     * @param {type} iThingId        ID of the Thing
     * @returns {Object}            Map containing the hub that a thing is associated with.
     * 
     * @throws IllegalArgumentException when the Thing ID is either not given, invalid, or if it refers to a thing that doesn't exist.
     *\/
    getHubConnectedToLink : function (iLinkId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var bError            = true;
        var aErrorMessages    = [];
        var mLinkIdInfo     = IomyRe.validation.isLinkIDValid(iLinkId);
        var iCommId;
        var iHubId;
        
        //--------------------------------------------------------------------//
        // Check Thing ID
        //--------------------------------------------------------------------//
        bError = !mLinkIdInfo.bIsValid;
        aErrorMessages = aErrorMessages.concat(mLinkIdInfo.aErrorMessages);
        
        if (bError) {
            throw new IllegalArgumentException(aErrorMessages.join("\n"));
        }
        
        //--------------------------------------------------------------------//
        // Find its Comm ID and Hub ID and get the hub using the Hub ID.
        //--------------------------------------------------------------------//
        iCommId    = IomyRe.common.LinkList["_"+iLinkId].CommId;
        iHubId    = IomyRe.common.CommList["_"+iCommId].HubId;
        
        return IomyRe.common.HubList["_"+iHubId];
        
    },*/
    
    /**
     * Creates a JSON structure of New Device form data that is used in the
     * JSON model to store user input for submission.
     * 
     * @returns {Object}        Data structure
     */
    getDeviceFormJSON : function () {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        
        //-- List --//
        var structOptions        = {};
        
        //-- Import core variables --//
        var aDeviceList;
        var aDeviceTypeList;
        
        //--------------------------------------------------------------------//
        // Get the core variables for this function
        //--------------------------------------------------------------------//
        aDeviceList        = IomyRe.common.LinkList;
        aDeviceTypeList    = IomyRe.common.LinkTypeList;
        
        //--------------------------------------------------------------------//
        // Begin Constructing the structure by adding device types.
        //--------------------------------------------------------------------//
        $.each(aDeviceTypeList, function (sI, mDeviceType) {
            // TODO: Place all of these options in alphabetical order.
            if (mDeviceType.LinkTypeId === IomyRe.devices.zigbeesmartplug.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Premise" : "",
                    "Modem" : ""
                };
            }
            
            if (mDeviceType.LinkTypeId === IomyRe.devices.onvif.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Premise" : "",
                    "Room" : "1",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "DisplayName" : "",
                    "Username" : "",
                    "Password" : ""
                };
            }
            
            if (mDeviceType.LinkTypeId === IomyRe.devices.philipshue.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Premise" : "",
                    "Room" : "1",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "DeviceToken" : "",
                    "DisplayName" : ""
                };
            }
            
            if (mDeviceType.LinkTypeId === IomyRe.devices.weatherfeed.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Premise" : "",
                    "Room" : "1",
                    "DisplayName" : "",
                    "StationCode" : "",
                    "KeyCode" : ""
                };
            }
            
            if (mDeviceType.LinkTypeId === IomyRe.devices.ipcamera.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Premise" : "",
                    "Room" : "1",
                    "IPCamType" : "MJPEG",
                    "Protocol" : "http",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "Path" : "",
                    "DisplayName" : "",
                    "LinkName" : "",
                    "Username" : "",
                    "Password" : ""
                };
            }
            
        });
        
        //--------------------------------------------------------------------//
        // Add the onvif camera option
        //--------------------------------------------------------------------//
        structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
            "CameraName" : "",
            "OnvifServer" : "",
            "StreamProfile" : "",
            "ThumbnailProfile" : ""
        };
        
//        structOptions["linkType"+mDeviceType.LinkTypeId] = {
//            "Hub" : {
//                "type" : "Integer",
//                "required" : true,
//                "minValue" : 1,
//                "value" : ""
//            },
//            "Room" : {
//                "type" : "Integer",
//                "required" : true,
//                "validator" : IomyRe.validation.isRoomIDValid,
//                "minValue" : 1,
//                "default" : 1,
//                "value" : ""
//            },
//            "Protocol" : {
//                "type" : "String",
//                "required" : true,
//                "default" : "http",
//                "value" : ""
//            },
//            "IPAddress" : {
//                "type" : "String",
//                "required" : true,
//                "validator" : IomyRe.validation.isIPv4AddressValid,
//                "value" : ""
//            },
//            "IPPort" : {
//                "type" : "String",
//                "required" : true,
//                "validator" : IomyRe.validation.isIPv4PortValid,
//                "value" : ""
//            },
//            "Path" : {
//                "type" : "String",
//                "required" : true,
//                "value" : ""
//            },
//            "DisplayName" : {
//                "type" : "String",
//                "required" : true,
//                "value" : ""
//            },
//            "Username" :{
//                "type" : "String",
//                "value" : ""
//            },
//            "Password" : {
//                "type" : "String",
//                "value" : ""
//            }
//        };
        
        return structOptions;
    },
    
    /**
	 * Retrives the hub that a thing is connected to.
	 * 
	 * @param {type} iThingId		ID of the Thing
	 * @returns {Object}			Map containing the hub that a thing is associated with.
	 * 
	 * @throws IllegalArgumentException when the Thing ID is either not given, invalid, or if it refers to a thing that doesn't exist.
	 */
	getHubConnectedToThing : function (iThingId) {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var bError			= true;
		var aErrorMessages	= [];
		var mThingIdInfo	= IomyRe.validation.isThingIDValid(iThingId);
		var mThing;
		var iCommId;
		var iHubId;
		
		//--------------------------------------------------------------------//
		// Check Thing ID
		//--------------------------------------------------------------------//
		bError = !mThingIdInfo.bIsValid;
		aErrorMessages = aErrorMessages.concat(mThingIdInfo.aErrorMessages);
		
		if (bError) {
			throw new IllegalArgumentException(aErrorMessages.join("\n"));
		}
		
		//--------------------------------------------------------------------//
		// Find its Comm ID and Hub ID and get the hub using the Hub ID.
		//--------------------------------------------------------------------//
		mThing	= IomyRe.common.ThingList["_"+iThingId];
		iCommId	= IomyRe.common.LinkList["_"+mThing.LinkId].CommId;
		iHubId	= IomyRe.common.CommList["_"+iCommId].HubId;
		
		return IomyRe.common.HubList["_"+iHubId];
		
	},
    
    /**
     * Takes a UTS figure and compares it with the UTS figure created as this
     * function executes. The parameters are as follows:
     * 
     * Required parameters:
     * UTS              : The time in the past. Required for comparing with the UTS now.
     * 
     * Optional parameters:
     * showDay          : Boolean flag to show how many days ago the given point in time was, default: true,
     * showHours        : Boolean flag to show how many hours ago the given point in time was, default: true,
     * showMinutes      : Boolean flag to show how many minutes ago the given point in time was, default: true,
     * showSeconds      : Boolean flag to show how many seconds ago the given point in time was, default: true,
     * showMilliseconds : Boolean flag to show how many milliseconds ago the given point in time was, default: false,
     * 
     * Will throw an exception if the UTS is not given in mSettings.
     * 
     * @param {type} mSettings              Map of both required and optional
     * @returns {string}                    Human-readable format of how long since the given point in time.
     */
    getLengthOfTimePassed : function (mSettings) {
        
        //--------------------------------------------------------------------//
        // Check that the UTS has been given.
        //--------------------------------------------------------------------//
        if (mSettings.UTS === undefined) {
            //----------------------------------------------------------------//
            // Report and throw an exception if no UTS is given.
            //----------------------------------------------------------------//
            jQuery.sap.log.error("IomyRe.functions.getLengthOfTimePassedSince() requires a UTS parameter!");
            throw "IomyRe.functions.getLengthOfTimePassedSince() requires a UTS parameter!";
            
        } else {
            //----------------------------------------------------------------//
            // Populate any undeclared optional parameters with their defaults
            //----------------------------------------------------------------//
            if (mSettings.showDay === undefined) {
                mSettings.showDay = true;
            }
            
            if (mSettings.showHours === undefined) {
                mSettings.showHours = true;
            }
            
            if (mSettings.showMinutes === undefined) {
                mSettings.showMinutes = true;
            }
            
            if (mSettings.showSeconds === undefined) {
                mSettings.showSeconds = true;
            }
            
            if (mSettings.showMilliseconds === undefined) {
                mSettings.showMilliseconds = false;
            }
            
            //----------------------------------------------------------------//
            // Declare variables, fetch parameters.
            //----------------------------------------------------------------//
            var iUTSPast            = mSettings.UTS * 1000;
            var bShowDay            = mSettings.showDay;
            var bShowHours          = mSettings.showHours;
            var bShowMinutes        = mSettings.showMinutes;
            var bShowSeconds        = mSettings.showSeconds;
            var bShowMilliseconds   = mSettings.showMilliseconds;
            
            var dUTSPresent         = new Date();
            var iTimePassed         = dUTSPresent.getTime() - iUTSPast;
            
            var sReadableTimePassed = "";
            var sMillisecondsPassed = "";
            var sSecondsPassed      = "";
            var sMinutesPassed      = "";
            var sHoursPassed        = "";
            var sDaysPassed         = "";
            
            //----------------------------------------------------------------//
            // Start measuring in days, hours, minutes, seconds and milliseconds
            //----------------------------------------------------------------//
            
            // -- If we show milliseconds -- //
            if (bShowMilliseconds) {
                sMillisecondsPassed += Math.floor( iTimePassed % 1000 ) + "ms";
                sReadableTimePassed = sMillisecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show seconds -- //
            if (bShowSeconds) {
                sSecondsPassed += Math.floor( (iTimePassed / 1000) % 60 ) + "s";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sSecondsPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sSecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show minutes -- //
            if (bShowMinutes) {
                sMinutesPassed += Math.floor( ( (iTimePassed / 1000 ) / 60) % 60 ) + "m";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sMinutesPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sMinutesPassed + sReadableTimePassed;
            }
            
            // -- If we show hours -- //
            if (bShowHours) {
                sHoursPassed += Math.floor( ( ( (iTimePassed / 1000 ) / 60 ) / 60) % 24 ) + "h";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sHoursPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sHoursPassed + sReadableTimePassed;
            }
            
            // -- If we show days -- //
            if (bShowDay) {
                sDaysPassed += Math.floor( ( ( ( (iTimePassed / 1000  ) / 60 ) / 60 ) / 24) % 365 ) + "d";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sDaysPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sDaysPassed + sReadableTimePassed;
            }
            
            return sReadableTimePassed;
            
        }
        
    },
    
    /**
     * Gathers the Conn information from a given link.
     * 
     * @param {type} iLinkId        ID of the link to retrieve the information from
     * @returns {map}               Link Conn Information
     */
    getLinkConnInfo : function (iLinkId) {
        // TODO: Add error checking here.
        
        var mLink = IomyRe.common.LinkList["_"+iLinkId];
        var mLinkConnInfo = {
            LinkConnId              : mLink.LinkConnId,
            LinkConnName            : mLink.LinkConnName,
            LinkConnAddress         : mLink.LinkConnAddress,
            LinkConnUsername        : mLink.LinkConnUsername,
            LinkConnPassword        : mLink.LinkConnPassword,
            LinkConnPort            : mLink.LinkConnPort
        };
        
        return mLinkConnInfo;
    },
    
    /**
     * Gets the link type ID from a given link.
     * 
     * @param {type} iLinkId    Given Link ID
     * @returns                 Link Type ID or NULL
     */
    getLinkTypeIDOfLink : function (iLinkId) {
        var iLinkTypeId = null;
        
        try {
            $.each(IomyRe.common.LinkList, function (sI, mLink) {
                if (mLink.LinkId == iLinkId) {
                    iLinkTypeId = mLink.LinkTypeId;
                    return false;
                }
            });
            
            return iLinkTypeId; 
            
        } catch (e) {
            $.sap.log.error("An error occurred in IomyRe.functions.getLinkTypeIDOfLink(): "+e.name+": "+e.message);
        }
    },
    
    /**
     * Creates a JSON structure that contains a list of device types for users
     * to select from.
     * 
     * Example:
     * 
     * {
     *     "type2" : {
     *         "Id" : 2,
     *         "Name" : "New Zigbee Dongle",
     *         "Type" : "type"
     *     },
     * }
     * 
     * @returns {Object}        Data structure
     */
    getNewDeviceOptions : function () {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        
        //-- List --//
        var structOptions        = {};
        
        //-- Import core variables --//
        var aDeviceList;
        var aDeviceTypeList;
        
        //--------------------------------------------------------------------//
        // Get the core variables for this function
        //--------------------------------------------------------------------//
        aDeviceList        = IomyRe.common.LinkList;
        aDeviceTypeList    = IomyRe.common.LinkTypeList;
        
        //--------------------------------------------------------------------//
        // Begin Constructing the structure by adding device types.
        //--------------------------------------------------------------------//
        $.each(aDeviceTypeList, function (sI, mDeviceType) {
            // TODO: Place all of these options in alphabetical order.
            if (mDeviceType.LinkTypeId === IomyRe.devices.zigbeesmartplug.LinkTypeId ||
                mDeviceType.LinkTypeId === IomyRe.devices.onvif.LinkTypeId ||
                mDeviceType.LinkTypeId === IomyRe.devices.philipshue.LinkTypeId ||
                mDeviceType.LinkTypeId === IomyRe.devices.weatherfeed.LinkTypeId ||
                mDeviceType.LinkTypeId === IomyRe.devices.ipcamera.LinkTypeId)
            {
                structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Id"          : mDeviceType.LinkTypeId,
                    "Name"        : mDeviceType.LinkTypeName,
                    "Type"        : "link"
                };
            }
            
        });
        
        //--------------------------------------------------------------------//
        // Add the onvif camera option
        //--------------------------------------------------------------------//
        structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
            "Id"          : IomyRe.devices.onvif.ThingTypeId,
            "Name"        : "Onvif Stream",
            "Type"        : "thing"
        };
        
        return structOptions;
    },
    
    getNumberOfDevicesInPremise : function (iPremiseId) {
        var mIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);
        var iCount  = 0;
        
        if (mIDInfo.bIsValid) {
            $.each(IomyRe.common.ThingList, function (sI, mThing) {
                if (iPremiseId == mThing.PremiseId) {
                    iCount++;
                }
            });
        }
        
        return iCount;
    },
    
    getNumberOfDevicesInRoom : function (iRoomId) {
        var mIDInfo = IomyRe.validation.isRoomIDValid(iRoomId);
        var iCount  = 0;
        
        if (mIDInfo.bIsValid) {
            $.each(IomyRe.common.ThingList, function (sI, mThing) {
                if (iRoomId == mThing.RoomId) {
                    iCount++;
                }
            });
        }
        
        return iCount;
    },
    
    getNumberOfRoomsInPremise : function (iPremiseId) {
        var mIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);
        var iCount  = 0;
        
        if (mIDInfo.bIsValid) {
            $.each(IomyRe.common.RoomsList["_"+iPremiseId], function (sI, mRoom) {
                if (sI !== undefined && sI !== null && mRoom !== undefined && mRoom !== null) {
                    iCount++;
                }
            });
        }
        
        return iCount;
    },
    
    getRoom : function (iRoomId, iPremiseId) {
        var mIDInfo     = IomyRe.validation.isRoomIDValid(iRoomId);
        var mFoundRoom  = null;
        
        if (mIDInfo.bIsValid) {
            if (iPremiseId !== undefined && iPremiseId !== null) {
                mFoundRoom = IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId];
                
            } else {
                $.each(IomyRe.common.RoomsList, function (sI, mPremise) {
                    if (sI !== undefined && sI !== null && mPremise !== undefined && mPremise !== null) {
                        var bFound = false;
                        
                        $.each(mPremise, function (sJ, mRoom) {
                            if (sJ !== undefined && sJ !== null && mRoom !== undefined && mRoom !== null) {
                                
                                if (mRoom.RoomId == iRoomId) {
                                    mFoundRoom = mRoom;
                                    bFound = true;
                                    return false;
                                }
                                
                            }
                            
                        });
                        
                        if (bFound) {
                            return false;
                        }
                        
                    }
                });
            }
        } else {
            throw new IllegalArgumentException(mIDInfo.aErrorMessages.join('\n'));
        }
        
        return mFoundRoom;
    },
    
    /**
     * Generates a human-readable timestamp from a JS Date.
     * 
     * @param {type} date       Given date
     * @param {type} sFormat    Date format in dd/mm/yy or mm/dd/yy
     * @returns {String}        Human-readable date and time
     */
    getTimestampString : function (date, sFormat, bShowTime, bShowSeconds) {
        //----------------------------------------------------------//
        // Declare variables and define default arguments
        //----------------------------------------------------------//
        if (bShowTime === undefined) {
            bShowTime = true;
        }
        
        if (bShowSeconds === undefined) {
            bShowSeconds = true;
        }
        
        var iHour       = date.getHours();
        var vMinutes    = date.getMinutes();
        var vSeconds    = date.getSeconds();
        var sSuffix     = "";
        
        var iYear       = date.getFullYear();
        var vMonth      = date.getMonth() + 1;
        var vDay        = date.getDate();
        
        var sDate       = ""; // Set according to the given format
        var sTime       = "";
        
        if (iHour >= 12) {
            sSuffix = "PM";
        } else {
            sSuffix = "AM";
        }
        
        iHour = iHour % 12;
        if (iHour === 0) {
            iHour = 12;
        }
        
        if (vMonth < 10) {
            vMonth = "0"+vMonth;
        }
        
        if (vDay < 10) {
            vDay = "0"+vDay;
        }
        
        if (vSeconds < 10) {
            vSeconds = "0"+vSeconds;
        }
        
        if (vMinutes < 10) {
            vMinutes = "0"+vMinutes;
        }
        
        if (sFormat === undefined) {
            sFormat = "dd/mm/yyyy";
        }
        
        if (sFormat === "dd/mm/yyyy" || sFormat === "dd/mm/yy") {
            sDate = vDay+"/"+vMonth+"/"+iYear+" ";
        } else if (sFormat === "mm/dd/yyyy" || sFormat === "mm/dd/yy") {
            sDate = vMonth+"/"+vDay+"/"+iYear+" ";
        } else if (sFormat === "yyyy/mm/dd" || sFormat === "yy/mm/dd") {
            sDate = iYear+"/"+vMonth+"/"+vDay+" ";
        } else if (sFormat === "yyyy-mm-dd" || sFormat === "yy-mm-dd") {
            sDate = iYear+"-"+vMonth+"-"+vDay+" ";
        } else {
            sDate = "";
        }
        
        if (bShowTime) {
            if (bShowSeconds) {
                sTime = iHour + ":" + vMinutes + ":" + vSeconds + sSuffix;
            } else {
                sTime = iHour + ":" + vMinutes + sSuffix;
            }
        }
        
        return sDate + sTime;
    }
    
});
