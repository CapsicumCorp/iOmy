/*
Title: Thermostat Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI and functionality for a Thermostat entry.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.devices.thermostat",true);
IOMy.devices.thermostat = new sap.ui.base.Object();

$.extend(IOMy.devices.thermostat,{
	Devices: [],
    
    //---------------------------------------------------//
    // Module properties
    //---------------------------------------------------//
    
    // -- INTEGERS
    iODataFieldsToFetch         : 2,
    iODataFieldsFailedToFetch   : 0,
    bWaitingToLoadAPI           : false,
    bLoadingFieldsFromAPI       : false,
    bLoadingMotionSensorFields  : false,
	bLoadingFields				: false,
    
    // -- Resource Types for the thermostat IOs
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    RSFanSpeed      : 1780,
    RSMode          : 1770,
    RSModeAuto      : 1771,
	RSDesiredHeat	: 1796,
	RSDesiredCoolth	: 1799,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -6,
    ThingTypeID         : -6,
	
	DevicePageID : "pDeviceTestThermostat",
	
	CallAPI : function (iThingId, oTamperField, oLastAccessedField) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var me = this;
        var php = IOMy.apiphp;
        //var sUrl = php.APILocation("windowsensor");
        var sUrl = php.APILocation("motionsensor");
        var mData = {
            //"Mode" : "GetWindowData",
            "Mode" : "GetMotionData",
            "ThingId" : iThingId
        };
        
        //--------------------------------------------------------------------//
        // Indicate that the API is being loaded and send the AJAX request
        //--------------------------------------------------------------------//
        me.bWaitingToLoadAPI        = false;
        me.bLoadingFieldsFromAPI    = true;
        
        php.AjaxRequest({
            "url" : sUrl,
            "data" : mData,
            
            "onSuccess" : function (response, data) {
                // Check the error condition.
                if (data.Error === false) {
                    //--------------------------------------------------------//
                    // If no error has been reported, get the data and display
                    // it.
                    //--------------------------------------------------------//
                    var mResponseData = data.Data;
                    
//                    var iUTS    = mResponseData.LastAccessed;
//                    var bTamper = mResponseData.CurrentStatus.Tamper;
                    var iUTS    = 1491369181;
                    var bTamper = false;
                    
                    if (oLastAccessedField !== undefined && oLastAccessedField !== null) {
                        oLastAccessedField.setText(
                            IOMy.functions.getLengthOfTimePassed({
                                "UTS" : iUTS
                            })
                        );
                    }
            
                    if (oTamperField !== undefined && oTamperField !== null) {
                        oTamperField.setText(bTamper === false ? "Secure" : "Not Secure");

                        //--------------------------------------------------------//
                        // If the device has detected possible tampering, then set
                        // the text colour to red.
                        //--------------------------------------------------------//
                        if (bTamper === true) {
                            oTamperField.addStyleClass("Text_red_13");
                        }
                    }
                }
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onFail" : function (response) {
                // Log errors
                jQuery.sap.log.error("There was an error fetching information about the tamper status and how long since the last motion was detected:\n\n" + JSON.stringify(response));
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onComplete" : function () {
                //------------------------------------------------------------//
                // Decrement the OData Field count
                //------------------------------------------------------------//
//                console.log("====================================================================");
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("====================================================================");
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                
                me.bLoadingFieldsFromAPI = false;
                
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                
                //------------------------------------------------------------//
                // If this is final OData request and the API has finished its
                // call, reset the loading motion sensor OData fields flag, and
                // reset the fields to fetch back to the default number.
                //------------------------------------------------------------//
                if (me.iODataFieldsToFetch === 0 && me.bWaitingToLoadAPI === false && me.bLoadingFieldsFromAPI === false) {
                    me.bLoadingFields = false;
                    me.iODataFieldsToFetch = 2;
                }
            }
        });
    },
	
	FetchField : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var me					= this;
        var odata				= IOMy.apiodata;
		var bSuccess			= false;
		var bError				= false;
		var aErrorMessages		= [];
		var iIOId;
		
		var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the IO ID
            //----------------------------------------------------------------//
            if (mSettings.IOID === undefined) {
                fnAppendError("IO ID is required so iOmy knows what field fetch the value from.");
            } else {
                iIOId = mSettings.IOID;
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onBefore callback function and execute it
            //----------------------------------------------------------------//
            if (mSettings.onBefore !== undefined) {
                mSettings.onBefore();
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Send the AJAX request
        //--------------------------------------------------------------------//
        odata.AjaxRequest({
            "Url"             : odata.ODataLocation("dataint"),
            "Columns"         : ["CALCEDVALUE", "UTS", "UOM_PK", "UOM_NAME"],
            "WhereClause"     : ["IO_PK eq "+iIOId],
            "OrderByClause"   : [],
            
            "onSuccess" : function (responseType, data) {
                //------------------------------------------------------------//
                // Declare variables
                //------------------------------------------------------------//
                //var data        = data[0];
                //var sUOMName    = data.UOM_NAME;
                
                //------------------------------------------------------------//
                // This is a temporary workaround to eliminate a character from
                // the UOM_NAME (Â) which comes from the OData service. This
                // affected the temperature field.
                //------------------------------------------------------------//
                //sUOMName = sUOMName.replace("Â", "");
                
                //------------------------------------------------------------//
                // Set success flag to true
                //------------------------------------------------------------//
				bSuccess = true;
                
                // Conclude the request callback
                this.onComplete(/*data.CALCEDVALUE, sUOMName*/);
            },
            
            "onFail" : function (response) {
                me.iODataFieldsFailedToFetch++; // TODO: Is this necessary?
                
                // Log errors
                jQuery.sap.log.error("There was an error fetching data for IO "+iIOId+":\n\n" + JSON.stringify(response));
                bSuccess = false;
				
                // Conclude the request callback
                this.onComplete();
            },
            
            "onComplete" : function (sValue, sUOM) {
                //------------------------------------------------------------//
                // Decrement the OData Field count
                //------------------------------------------------------------//
//                console.log("====================================================================");
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("====================================================================");
                jQuery.sap.log.debug("Window Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("====================================================================");
                
                if (me.iODataFieldsToFetch > 0) {
                    me.iODataFieldsToFetch--;
                } else {
                    // Log this as an error
                    jQuery.sap.log.error("Something is wrong! The remaining OData field count is already 0!");
                }
                
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                
                //------------------------------------------------------------//
                // If this is final OData request and the API has finished its
                // call, reset the loading motion sensor OData fields flag, and
                // reset the fields to fetch back to the default number.
                //------------------------------------------------------------//
                if (me.iODataFieldsToFetch === 0 && me.bWaitingToLoadAPI === false && me.bLoadingFieldsFromAPI === false) {
                    me.bLoadingFields = false;
                    me.iODataFieldsToFetch = 2;
                }
				
				if (bSuccess /*&& sValue !== null && sValue !== undefined && sValue !== false*/) {
					//fnSuccess(sValue, sUOM);
					fnSuccess();
				} else {
					fnFail();
				}
            }
            
        });
    },
    
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
        
        
        //------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: [
                //------------------------------------//
                //-- 1st is the Device Label		--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
							width: "85%",
                            text : aDeviceData.DeviceName,
                            press : function () {
                                IOMy.common.NavigationChangePage("pDeviceTestThermostat", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                    ]
                }).addStyleClass("BorderRight width80Percent jbMR1tempfix"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.HBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//
                            items: [
                                new sap.m.VBox({
                                    items : [
                                        //----------------------------------//
                                        // Temperature
                                        //----------------------------------//
										new sap.m.Label({
                                            text : "Temp: 29°C"
                                        }).addStyleClass("Font-RobotoCondensed width65px"),
                                    ]
                                }),
								new sap.m.VBox({
                                    items : [
                                        //----------------------------------//
                                        // Temperature
                                        //----------------------------------//
										new sap.m.Label({
                                            text : "Mode: Off"
                                        }).addStyleClass("Font-RobotoCondensed width65px MarLeft15px"),
                                    ]
                                })
                            ]
                        }).addStyleClass("MarTop20px MarLeft12px")
                    ]
                }).addStyleClass("minheight58px minwidth170px")
            ]
        }).addStyleClass("ListItem");
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
   /* Not Currently Being used as switched over to CommonUI
   GetCommonUIForDeviceOverview: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: [
                //------------------------------------//
                //-- 1st is the Device Label		--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
                            text : aDeviceData.DeviceName,
                            press : function () {
                                IOMy.common.NavigationChangePage("pDeviceTestThermostat", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("width100Percent Font-RobotoCondensed TextSizeMedium PadLeft6px DeviceOverview-ItemLabel TextLeft Text_grey_20")
                    ]
                }).addStyleClass("BorderRight testlabelcont"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//

                            items: [
                                new sap.m.HBox({
                                    items : [
                                        //----------------------------------//
                                        // Last Motion
                                        //----------------------------------//
                                        new sap.m.Label({
                                            text : "Last Motion:"
                                        }).addStyleClass("Font-RobotoCondensed"),
                                        
                                        new sap.m.Text( oViewScope.createId( sPrefix+"_LastMotion" ),	{} ).addStyleClass("PadLeft5px Font-RobotoCondensed width110px")
                                    ]
                                })
                            ]
                        }).addStyleClass("DeviceOverview-ItemLabel PadLeft5px MarBottom3px MarRight10px TextLeft")
                    ]
                }).addStyleClass("width10Percent minwidth70px")
            ]
        }).addStyleClass("ListItem");


		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	*/
	
	GetCommonUITaskList: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
		return aTasks;
	},
    
    GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		//console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            this.CallAPI(aDeviceData.DeviceId, null, oViewScope.byId( Prefix+"_LastMotion" ));
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DeviceName+" has no IOs");
        }
		return aTasks;
	},
	
	
	GetObjectIdList: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			
			aObjectIdList = [
				sPrefix+"_Container",
				sPrefix+"_Label",
				sPrefix+"_DataContainer",
				sPrefix+"_StatusContainer",
				sPrefix+"_StatusToggle"
			];
			
		}
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
});