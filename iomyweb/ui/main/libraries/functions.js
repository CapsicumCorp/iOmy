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
    
    /**
	 * Retrives the hub that a thing is connected to.
	 * 
	 * @param {type} iThingId		ID of the Thing
	 * @returns {Object}			Map containing the hub that a thing is associated with.
	 * 
	 * @throws IllegalArgumentException when the Thing ID is either not given, invalid, or if it refers to a thing that doesn't exist.
	 *\/
	getHubConnectedToLink : function (iLinkId) {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var bError			= true;
		var aErrorMessages	= [];
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
		iCommId	= IomyRe.common.LinkList["_"+iLinkId].CommId;
		iHubId	= IomyRe.common.CommList["_"+iCommId].HubId;
		
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
	 * @returns {Object}		Data structure
	 */
	getNewDeviceOptions : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		
		//-- List --//
		var structOptions		= {};
		
		//-- Import core variables --//
		var aDeviceList;
		var aDeviceTypeList;
		
		//--------------------------------------------------------------------//
		// Get the core variables for this function
		//--------------------------------------------------------------------//
		aDeviceList		= IomyRe.common.LinkList;
		aDeviceTypeList	= IomyRe.common.LinkTypeList;
		
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
					"Id"		: mDeviceType.LinkTypeId,
					"Name"		: mDeviceType.LinkTypeName,
					"Type"		: "link"
				};
			}
			
		});
		
		//--------------------------------------------------------------------//
		// Add the onvif camera option
		//--------------------------------------------------------------------//
		structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
            "Id"		: IomyRe.devices.onvif.ThingTypeId,
            "Name"		: "Onvif Stream",
            "Type"		: "thing"
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
	 * @returns {Object}		Data structure
	 */
	getDeviceFormJSON : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		
		//-- List --//
		var structOptions		= {};
		
		//-- Import core variables --//
		var aDeviceList;
		var aDeviceTypeList;
		
		//--------------------------------------------------------------------//
		// Get the core variables for this function
		//--------------------------------------------------------------------//
		aDeviceList		= IomyRe.common.LinkList;
		aDeviceTypeList	= IomyRe.common.LinkTypeList;
		
		//--------------------------------------------------------------------//
		// Begin Constructing the structure by adding device types.
		//--------------------------------------------------------------------//
		$.each(aDeviceTypeList, function (sI, mDeviceType) {
			// TODO: Place all of these options in alphabetical order.
			if (mDeviceType.LinkTypeId === IomyRe.devices.zigbeesmartplug.LinkTypeId)
			{
				structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Modem" : ""
                };
			}
			
			if (mDeviceType.LinkTypeId === IomyRe.devices.onvif.LinkTypeId)
			{
				structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
                    "Room" : "1",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "DisplayName" : "",
                    "Username" : "",
                    "Password" : "",
                };
			}
			
			if (mDeviceType.LinkTypeId === IomyRe.devices.philipshue.LinkTypeId)
			{
				structOptions["linkType"+mDeviceType.LinkTypeId] = {
                    "Hub" : "",
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
                    "Room" : "1",
                    "Protocol" : "http",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "Path" : "",
                    "DisplayName" : "",
                    "Username" : "",
                    "Password" : "",
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
