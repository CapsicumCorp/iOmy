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
	 * Creates a JSON data structure containing all things organised into their
	 * hubs, which are placed into their premises.
	 * 
	 * Resulting structure is something like this:
	 * 
	 * {
	 *     "Premises" : {
	 *         "_1" : {
	 *             "PremiseId": 1,
	 *             "PremiseName": "Holiday Home",
	 *             "Hubs": {
	 *                 "_1": {
	 *                     "HubId": 1,
	 *                     "HubName": "Android Set-Top-Box",
	 *                     "Things": {
	 *                         "_43": {
	 *                             "Id": 43,
	 *                             "DisplayName": "Plug for TV"
	 *                             ...
	 *                         }
	 *                     }
	 *                 },
	 *                 "_2": {
	 *                     ...
	 *                 }
	 *             }
	 *         }
	 *     }
	 * }
	 * 
	 * @returns {Object}		Data structure for the Device List page to read from.
	 */
	getNewDeviceOptions : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var me					= this; // Scope captured for sub functions.
		var iIndex				= 0;
		//-- Error handling --//
		var bRefreshing			= true;
		var bError				= false;
		var aErrorMessages		= [];
		
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