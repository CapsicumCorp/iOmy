/*
Title: Extension of Functions Library (Get Device Type Options for New Device)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a list of options for .
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

$.sap.declare("IOMy.functions.getNewDeviceOptions",true);

$.extend(IOMy.functions, {
	
	/**
	 * Creates a JSON structure that contains a list of device types, and onvif
	 * servers for users to select from.
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
		aDeviceList		= IOMy.common.LinkList;
		aDeviceTypeList	= IOMy.common.LinkTypeList;
		
		//--------------------------------------------------------------------//
		// Begin Constructing the structure by adding device types.
		//--------------------------------------------------------------------//
		$.each(aDeviceTypeList, function (sI, mDeviceType) {
			
			if (mDeviceType.LinkTypeId === IOMy.devices.zigbeesmartplug.LinkTypeID ||
				mDeviceType.LinkTypeId === IOMy.devices.onvif.LinkTypeId ||
				mDeviceType.LinkTypeId === IOMy.devices.philipshue.LinkTypeId ||
				mDeviceType.LinkTypeId === IOMy.devices.weatherfeed.LinkTypeId)
			{
				structOptions["type"+mDeviceType.LinkTypeId] = {
					"Id"		: mDeviceType.LinkTypeId,
					"Name"		: "New " + mDeviceType.LinkTypeName,
					"Type"		: "type"
				};
			}
			
		});
		
		//--------------------------------------------------------------------//
		// Add the onvif servers
		//--------------------------------------------------------------------//
		$.each(aDeviceList, function (sI, mLink) {
			
			if (IOMy.functions.getLinkTypeIDOfLink(mLink.LinkId) === IOMy.devices.onvif.LinkTypeId) {
				structOptions["device"+mLink.LinkId] = {
					"Id"		: mLink.LinkId,
					"Name"		: mLink.LinkName,
					"Type"		: "device"
				};
			}
			
		});
		
		return structOptions;
	}
	
});