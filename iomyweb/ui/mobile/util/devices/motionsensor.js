/*
Title: Motion Sensor Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Motion Sensor entry.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.devices.motionsensor",true);
IOMy.devices.motionsensor = new sap.ui.base.Object();

$.extend(IOMy.devices.motionsensor,{
	Devices: [],
    
    //---------------------------------------------------//
    // Module properties
    //---------------------------------------------------//
    
    uiIDs : {
        TemperatureField : "TemperatureField",
        BatteryLevelField : "BatteryLevelField"
    },
    
    // -- INTEGERS
    iODataFieldsToFetch         : 2,
    iODataFieldsFailedToFetch   : 0,
    bWaitingToLoadAPI           : false,
    bLoadingFieldsFromAPI       : false,
    bLoadingMotionSensorFields  : false,
    
    // -- Resource Types for the Motion Sensor IOs
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    CallAPI : function (iThingId, oTamperField, oLastMotionField) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var me = this;
        var php = IOMy.apiphp;
        var sUrl = php.APILocation("motionsensor");
        var mData = {
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
                    
                    var iUTS    = mResponseData.MostRecentMotion;
                    var bTamper = mResponseData.CurrentStatus.Tamper;
                    
                    if (oLastMotionField !== undefined && oLastMotionField !== null) {
                        oLastMotionField.setText(
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
                    me.bLoadingMotionSensorFields = false;
                    me.iODataFieldsToFetch = 2;
                }
            }
        });
    },
    
    FetchField : function (iIOId, oTextWidget) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var me = this;
        var odata = IOMy.apiodata;
        
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
                // Output data to console.
                //------------------------------------------------------------//
                var data        = data[0];
                var sUOMName    = data.UOM_NAME;
                
                //------------------------------------------------------------//
                // This is a temporary workaround to eliminate a character from
                // the UOM_NAME (Â) which comes from the OData service. This
                // affected the temperature field.
                //------------------------------------------------------------//
                sUOMName = sUOMName.replace("Â", "");
                
                //------------------------------------------------------------//
                // Set the text in the relevant field on the motion sensor page.
                //------------------------------------------------------------//
                oTextWidget.setText(data.CALCEDVALUE + sUOMName);
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onFail" : function (response) {
                me.iODataFieldsFailedToFetch++;
                
                // Log errors
                jQuery.sap.log.error("There was an error fetching data for IO "+iIOId+":\n\n" + JSON.stringify(response));
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onComplete" : function () {
                //------------------------------------------------------------//
                // Decrement the OData Field count
                //------------------------------------------------------------//
//                console.log("====================================================================");
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("====================================================================");
                
                if (me.iODataFieldsToFetch > 0) {
                    me.iODataFieldsToFetch--;
                } else {
                    // Log this as an error
                    jQuery.sap.log.error("Something is wrong! The remaining OData field count for the current motion sensor is already 0!");
                }
                
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                
                //------------------------------------------------------------//
                // If this is final OData request and the API has finished its
                // call, reset the loading motion sensor OData fields flag, and
                // reset the fields to fetch back to the default number.
                //------------------------------------------------------------//
                if (me.iODataFieldsToFetch === 0 && me.bWaitingToLoadAPI === false && me.bLoadingFieldsFromAPI === false) {
                    me.bLoadingMotionSensorFields = false;
                    me.iODataFieldsToFetch = 2;
                }
            }
            
        });
    },
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData, bIsUnassigned ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        
        //-- 1.1 - Set default values		--//
        if (bIsUnassigned === undefined)
            bIsUnassigned = false;
        
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);
        
        // If the UI is for the Unassigned Devices List, include 
        if (bIsUnassigned === true) {
            aUIObjectItems.push(
                new sap.m.CheckBox(oViewScope.createId(sPrefix+"_Selected"), {
                    selected : false
                }).addStyleClass("MarTop10px")
            );
        }
        
        aUIObjectItems.push(
            //------------------------------------//
            //-- 1st is the Device Label		--//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
						width: "85%",
                        text : aDeviceData.DeviceName,
                        press : function () {
                            IOMy.common.NavigationChangePage("pMotionSensor", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                ]
            }).addStyleClass("BorderRight width80Percent jbMR1tempfix")
        );

        aUIObjectItems.push(
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
                            new sap.m.VBox({
                                items : [
                                    //----------------------------------//
                                    // Last Motion
                                    //----------------------------------//
                                    new sap.m.Label({
                                        text : "Last Motion:"
                                    }).addStyleClass("Font-RobotoCondensed"),

                                    new sap.m.Label( oViewScope.createId( sPrefix+"_LastMotion" ),	{} ).addStyleClass("Font-RobotoCondensed")
                                ]
                            })
                        ]
                        }).addStyleClass("MarLeft12px MarTop8px")
                    ]
                }).addStyleClass("minwidth170px minheight58px")
        );

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

//        //-- Initialise Variables --//
//        var sStatusButtonText			= "";
//        var bButtonStatus				= false;
//
//        //-- Store the Device Status --//
//        var iDeviceStatus		= aDeviceData.DeviceStatus;
//        var iTogglePermission	= aDeviceData.PermToggle;
//        //var iTogglePermission	= 0;
//
//
//        //-- Set Text --//
//        if( iDeviceStatus===0 ) {
//            sStatusButtonText	= "Off";
//            bButtonStatus		= false;
//        } else {
//            sStatusButtonText	= "On";
//            bButtonStatus		= true;
//        }
//
//        //-- DEBUGGING --//
//        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);
//
//        //------------------------------------//
//        //-- Make the Container				--//
//        //------------------------------------//
//        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
//            items:[] 
//        }).addStyleClass("minwidth80px PadTop10px PadLeft5px");	//-- END of VBox that holds the Toggle Button
//
//
//        //-- Add the Button's background colour class --//
//        if( iTogglePermission===0 ) {
//
//            //----------------------------//
//            //-- NON TOGGLEABLE BUTTON	--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    enabled: false
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
//            );
//
//        } else {
//
//            //----------------------------//
//            //-- TOGGLEABLE BUTTON		--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    change: function () {
//                //new sap.m.ToggleButton( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    //text: sStatusButtonText,
//                    //pressed: bButtonStatus,
//                    //press : function () {
//                        //-- Bind a link to this button for subfunctions --//
//                        var oCurrentButton = this;
//                        //-- AJAX --//
//                        IOMy.apiphp.AjaxRequest({
//                            url: IOMy.apiphp.APILocation("statechange"),
//                            type: "POST",
//                            data: { 
//                                "Mode":"ThingToggleStatus", 
//                                "Id": aDeviceData.DeviceId
//                            },
//                            onFail : function(response) {
//                                IOMy.common.showError(response.message, "Error Changing Device Status");
//                            },
//                            onSuccess : function( sExpectedDataType, aAjaxData ) {
//                                console.log(aAjaxData.ThingPortStatus);
//                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
//                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
//                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
//                                }
//                            }
//                        });
//                    }
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
//                //}).addStyleClass("DeviceOverviewStatusToggleButton TextWhite Font-RobotoCondensed Font-Large"); //-- END of ToggleButton --//
//            );
//        }
//
//        oUIObject.addItem(oUIStatusContainer);
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
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
                                IOMy.common.NavigationChangePage("pMotionSensor", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px Text_grey_20")
                    ]
                }).addStyleClass("BorderRight width80Percent DeviceLabelMargin"),

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
                                new sap.m.VBox({
                                    items : [
                                        //----------------------------------//
                                        // Last Motion
                                        //----------------------------------//
                                        new sap.m.Label({
                                            text : "Last Motion:"
                                        }).addStyleClass("Font-RobotoCondensed"),
                                        
                                        new sap.m.Label( oViewScope.createId( sPrefix+"_LastMotion" ),	{} ).addStyleClass("Font-RobotoCondensed")
                                    ]
                                })
                            ]
                        }).addStyleClass("MarLeft6px MarAuto0px")
                    ]
                }).addStyleClass("minwidth170px minheight58px")
            ]
        }).addStyleClass("ListItem");

//        //--------------------------------------------------------------------//
//        //-- ADD THE STATUS BUTTON TO THE UI								--//
//        //--------------------------------------------------------------------//
//
//        //-- Initialise Variables --//
//        var sStatusButtonText			= "";
//        var bButtonStatus				= false;
//
//        //-- Store the Device Status --//
//        var iDeviceStatus		= aDeviceData.DeviceStatus;
//        var iTogglePermission	= aDeviceData.PermToggle;
//        //var iTogglePermission	= 0;
//
//
//        //-- Set Text --//
//        if( iDeviceStatus===0 ) {
//            sStatusButtonText	= "Off";
//            bButtonStatus		= false;
//        } else {
//            sStatusButtonText	= "On";
//            bButtonStatus		= true;
//        }
//
//        //-- DEBUGGING --//
//        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);
//
//        //------------------------------------//
//        //-- Make the Container				--//
//        //------------------------------------//
//        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
//            items:[] 
//        }).addStyleClass("PadTop5px PadLeft5px width10Percent minwidth80px");	//-- END of VBox that holds the Toggle Button
//
//
//        //-- Add the Button's background colour class --//
//        if( iTogglePermission===0 ) {
//
//            //----------------------------//
//            //-- NON TOGGLEABLE BUTTON	--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    enabled: false
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
//            );
//
//        } else {
//
//            //----------------------------//
//            //-- TOGGLEABLE BUTTON		--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    change: function () {
//                //new sap.m.ToggleButton( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    //text: sStatusButtonText,
//                    //pressed: bButtonStatus,
//                    //press : function () {
//                        //-- Bind a link to this button for subfunctions --//
//                        var oCurrentButton = this;
//                        //-- AJAX --//
//                        IOMy.apiphp.AjaxRequest({
//                            url: IOMy.apiphp.APILocation("statechange"),
//                            type: "POST",
//                            data: { 
//                                "Mode":"ThingToggleStatus", 
//                                "Id": aDeviceData.DeviceId
//                            },
//                            onFail : function(response) {
//                                IOMy.common.showError(response.message, "Error Changing Device Status");
//                            },
//                            onSuccess : function( sExpectedDataType, aAjaxData ) {
//                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
//                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
//                                    //-- If turned Off --//
//                                    //if( aAjaxData.DevicePortStatus===0 ) {
//                                        //oCurrentButton.setText("Off");
//                                    //-- Else Turned On --//
//                                    //} else {
//                                        //oCurrentButton.setText("On");
//                                    //}
//
//                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
//                                }
//                            }
//                        });
//                    }
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
//                //}).addStyleClass("DeviceOverviewStatusToggleButton TextWhite Font-RobotoCondensed Font-Large"); //-- END of ToggleButton --//
//            );
//        }
//
//        oUIObject.addItem(oUIStatusContainer);
        //oUIObject.addItem(new sap.m.VBox({}).addStyleClass("width6px"));


		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	
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