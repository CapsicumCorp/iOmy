/*
Title: Extension of Functions Library (Get the Hub the Thing is attached to.)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes functions for load the CommList variable.
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

$.sap.declare("IOMy.functions.getHubConnectedToThing",true);

$.extend(IOMy.functions, {
	
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
		var mThingIdInfo	= IOMy.validation.isThingIDValid(iThingId);
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
		mThing	= IOMy.common.ThingList["_"+iThingId];
		iCommId	= IOMy.common.getLink(mThing.LinkId).CommId;
		iHubId	= IOMy.common.CommList["_"+iCommId].HubId;
		
		return IOMy.common.getHub(iHubId);
		
	}
	
});