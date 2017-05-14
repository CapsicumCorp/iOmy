/*
Title: Extension of Functions Library (Generating Device List Data)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a list of devices.
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

$.sap.declare("IOMy.functions.generateDeviceListData",true);

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
	generateDeviceListData : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var me					= this; // Scope captured for sub functions.
		//-- Error handling --//
		var bRefreshing			= true;
		var bError				= false;
		var aErrorMessages		= [];
		
		//-- Device List --//
		var structDeviceList	= {};
		
		//-- Import core variables --//
		var aPremiseList;
		var aHubList;
		var aThingList;
		
		//--------------------------------------------------------------------//
		// Get the core variables for this function
		//--------------------------------------------------------------------//
		aPremiseList	= IOMy.common.PremiseList;
		aHubList		= IOMy.common.HubList;
		aThingList		= IOMy.common.ThingList;
		
		//--------------------------------------------------------------------//
		// Begin Constructing the structure by creating premises layer first.
		//--------------------------------------------------------------------//
		structDeviceList.Premises = {};
		
		$.each(aPremiseList, function (sIndex, mPremise) {
			
			var mData			= {};
			
			mData.PremiseId		= mPremise.Id;
			mData.PremiseName	= mPremise.Name;
			mData.Hubs			= {};
			
			structDeviceList.Premises["_"+mPremise.Id] = mData;
			
		});
		
		//--------------------------------------------------------------------//
		// Create the Hub Layer
		//--------------------------------------------------------------------//
		$.each(aHubList, function (sIndex, mHub) {
			
			var mData	= {};
			
			structDeviceList.Premises[ "_"+mHub.PremiseId ].Hubs[ "_"+mHub.HubId ]			= {};
			structDeviceList.Premises[ "_"+mHub.PremiseId ].Hubs[ "_"+mHub.HubId ].HubId	= mHub.HubId;
			structDeviceList.Premises[ "_"+mHub.PremiseId ].Hubs[ "_"+mHub.HubId ].HubName	= mHub.HubName;
			structDeviceList.Premises[ "_"+mHub.PremiseId ].Hubs[ "_"+mHub.HubId ].Things	= {};
			
		});
		
		//--------------------------------------------------------------------//
		// Create the Thing Layer
		//--------------------------------------------------------------------//
		$.each(aThingList, function (sIndex, mThing) {
			
			var mThingData	= mThing;
			var mHubData	= me.getHubConnectedToThing(mThing.Id);
			
			// Store the thing in the structure.
			structDeviceList.Premises[ "_"+mThing.PremiseId ].Hubs[ "_"+mHubData.HubId ].Things[ "_"+mThing.Id ] = mThingData;
			
		});
		
		return structDeviceList;
	}
	
});