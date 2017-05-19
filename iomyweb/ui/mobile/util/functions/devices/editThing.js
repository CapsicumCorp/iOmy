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

$.sap.declare("IOMy.functions.devices.editThing",true);

$.extend(IOMy.functions, {
	
	editThing : function (mSettings) {
		var me						= this;
		var bError					= false;
		var aErrorMessages			= [];
		var iThingId;
		var sThingName;
		var mThingIDInfo;
		var fnSuccess;
		var fnFail;
		
		// Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
			bError = true;
            aErrorMessages.push(sErrMesg);
            //jQuery.sap.log.error(sErrMesg);
        };
		
		//--------------------------------------------------------------------//
		// Read the settings map
		//--------------------------------------------------------------------//
		if (mSettings !== undefined) {
			//----------------------------------------------------------------//
			// REQUIRED: Valid Thing ID
			//----------------------------------------------------------------//
			if (mSettings.thingID !== undefined) {
				mThingIDInfo = IOMy.validation.isThingIDValid(mSettings.thingID);
				
				bError			= !mThingIDInfo.bIsValid;
				aErrorMessages	= aErrorMessages.concat(mThingIDInfo.aErrorMessages);
				
				if (!bError) {
					iThingId = mSettings.thingID;
				}
			} else {
				fnAppendError("Thing ID (thingID) must be specified!");
			}
			
			//----------------------------------------------------------------//
			// REQUIRED: Thing Name
			//----------------------------------------------------------------//
			if (mSettings.thingName === undefined) {
				fnAppendError("Thing Name (thingName) must be specified!");
			} else {
				sThingName = mSettings.thingName;
			}
			
			if (bError) {
				throw new IllegalArgumentException( aErrorMessages.join("\n") );
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
		
		//--------------------------------------------------------------------//
		// Run the API to change the thing name.
		//--------------------------------------------------------------------//
		IOMy.apiphp.AjaxRequest({
			"url" : IOMy.apiphp.APILocation("thing"),
			"data" : {"Mode" : "EditName", "Id" : iThingId, "Name" : sThingName},
			"onSuccess" : function (responseType, data) {

				try {
					if (data.Error === false) {
						fnSuccess();
						
					} else {
						fnFail(data.ErrMesg);
					}
				} catch (e) {
					fnFail(e.message);
				}

			},
			"onFail" : function (err) {
				fnFail(err.responseText);
			}
		});
	}
	
});