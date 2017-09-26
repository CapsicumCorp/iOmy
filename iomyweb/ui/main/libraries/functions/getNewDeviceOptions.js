/*
Title: Extension of Functions Library (Get Device Type Options for New Device)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a list of options for selecting a device
    option in the New Devices page.
Copyright: Capsicum Corporation 2017

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

$.sap.declare("IomyRe.functions.getNewDeviceOptions",true);

$.extend(IomyRe.functions, {
	
	/**
	 * Creates a JSON structure that contains a list of device types, and onvif
	 * servers for users to select from.
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
	}
	
});