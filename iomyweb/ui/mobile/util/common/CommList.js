/*
Title: Extension of Common Library (Comm List)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes functions to load the CommList variable.
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

$.sap.declare("IOMy.common.CommList",true);

$.extend(IOMy.common, {
	
	CommList			: {},
	CommListLastUpdate	: new Date(),
	
	RefreshCommList : function (oConfig) {
		var me = this; 
		
		//------------------------------------//
		//-- ODATA REQUEST PREP				--//
		//------------------------------------//
		var sUrl			= IOMy.apiodata.ODataLocation("comms");
		var aColumns		= [ "COMM_PK", "COMM_NAME", "COMM_JOINMODE", "COMM_ADDRESS", "COMMTYPE_PK", "COMMTYPE_NAME", "HUB_PK", "HUB_NAME", "PREMISE_PK", "PREMISE_NAME" ];
		var aWhere			= [];
		var aOrderBy		= [ "COMM_PK", "HUB_PK" ];
		
		me.CommList = {};
		//------------------------//
		//-- ODATA REQUEST		--//
		//------------------------//
		IOMy.apiodata.AjaxRequest( {
			Url:				sUrl,
			HTTPMethod:			"GET",
			DataType:			"json",
			Columns:			aColumns,
			WhereClause:		aWhere,
			OrderByClause:		aOrderBy,
			
			//----------------------------//
			//-- 3.A - ON AJAX FAILURE	--//
			//----------------------------//
			onFail : function(response) {
				jQuery.sap.log.error("CommLookup Error! " + response.responseText);
				
				//-- Perform the "onFail" function if applicable --//
                if(oConfig.onFail) {
					oConfig.onFail();
				}
			},
		
			//--------------------------------//
			//-- 3.B - ON AJAX SUCCESS		--//
			//--------------------------------//
			onSuccess : $.proxy(function(sReturnDataType, AjaxData) {
				try {
					
					var iCommId			= 0;			//-- INTEGER:	--//
					var iHubId			= 0;			//-- INTEGER:	--//
					var iPremiseId		= 0;			//-- INTEGER:	--//
					var aTemp			= {};			//-- ARRAY:		Temporary Associative array used to temporarily store comm data --//
					var mData			= {};			//-- MAP:		Temporary JS object containing 
					
					//--------------------------------------------------------//
					//-- 3.B.A - Check to see how many comms are found	--//
					//--------------------------------------------------------//
					if( AjaxData.length >= 1 ) {
						//--------------------------------------------------------//
						//-- 3.B.A.1 - Store the Data in the Comm List			--//
						//--------------------------------------------------------//
						for (var i = 0; i < AjaxData.length; i++) {
							mData = AjaxData[i];
							
							iCommId			= parseInt( mData.COMM_PK );
							iHubId			= parseInt( mData.HUB_PK );
							iPremiseId		= parseInt( mData.PREMISE_PK );

							//-- Reset the array --//
							aTemp	= {};

							//-- Store the values --//
							aTemp.CommId				= iCommId;
							aTemp.CommName				= mData.COMM_NAME;
							aTemp.CommJoinMode			= mData.COMM_JOINMODE;
							aTemp.CommAddress			= mData.COMM_ADDRESS;
							aTemp.CommTypeId			= mData.COMMTYPE_PK;
							aTemp.CommTypeName			= mData.COMMTYPE_NAME;

							aTemp.HubId					= iHubId;
							aTemp.HubName				= mData.HUB_NAME;
							
							aTemp.PremiseId				= iPremiseId;
							aTemp.PremiseName			= mData.PREMISE_NAME;

							IOMy.common.CommList["_"+iCommId] = aTemp;
							
						}
					} 
					
					//-- Update the Timestamp on when the CommList was last updated. --//
					me.CommListLastUpdate = new Date();
					
					//-- Perform the "onSuccess" function if applicable --//
					if(oConfig.onSuccess !== undefined) {
						oConfig.onSuccess();
					}
					
				} catch(e11) {
					jQuery.sap.log.error("Comm List Load error: "+e11.message);
					
					//-- Perform the "onFail" function if applicable --//
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			})
		});
	}
	
});