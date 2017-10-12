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
        var aaDeviceList            = {};
        var iPremiseId              = 0;
        var iRoomId                 = 0;
        
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
        
        //--------------------------------------------------------------------//
        // Construct the Device List using any filters specified.
        //--------------------------------------------------------------------//
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
                    "Id"        : mDeviceType.LinkTypeId,
                    "Name"        : mDeviceType.LinkTypeName,
                    "Type"        : "link"
                };
            }
            
        });
        
        //--------------------------------------------------------------------//
        // Add the onvif camera option
        //--------------------------------------------------------------------//
        structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
            "Id"        : IomyRe.devices.onvif.ThingTypeId,
            "Name"        : "Onvif Stream",
            "Type"        : "thing"
        };
        
        return structOptions;
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
                    "Protocol" : "http",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "Path" : "",
                    "DisplayName" : "",
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