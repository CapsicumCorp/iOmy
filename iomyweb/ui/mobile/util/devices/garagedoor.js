/*
Title: Garage Door Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI and functionality for a Garage Door entry.
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

$.sap.declare("IOMy.devices.garagedoor",true);
IOMy.devices.garagedoor = new sap.ui.base.Object();

$.extend(IOMy.devices.garagedoor,{
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
    
    // -- Resource Types for the Window Sensor IOs
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -5,
    ThingTypeID         : -5,
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        // Added in temporarily until functionality is implemented by Brent
		var me = this;
		
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
                            text : aDeviceData.DeviceName,
                            press : function () {
                                IOMy.common.NavigationChangePage("pDeviceGaragedoor", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("Font-Medium MarLeft6px Text_grey_20")
                    ]
                }).addStyleClass("BorderRight width80Percent DeviceLabelMargin"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
				new sap.m.HBox({
					items : [
						new sap.m.VBox( oViewScope.createId( sPrefix+"_GarageButton"), {
							//--------------------------------//
							//-- Toggle Button              --//
							//--------------------------------//
							items: [
								new sap.m.VBox({
									items : [
										// Added in temporarily until functionality is implemented by Brent
										 me.wControlGarageSwitch = new sap.m.Button({
											icon : "sap-icon://GoogleMaterial/lock_open",
											width: "95px",
											text : "Open",
											press : function () {
												me.ToggleGarageSwitch();
											}
										}).addStyleClass(""),
									]
								}).addStyleClass("ElementCenter"),
							]
						}).addStyleClass("width100Percent")
					]
				}).addStyleClass("minwidth170px minheight58px")
            ]
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
	
	// Added in temporarily until functionality is implemented by Brent
	ToggleGarageSwitch : function () {
        var me = this;
        if (me.wControlGarageSwitch.getText() === "Open") {
            me.wControlGarageSwitch.setText("Close");
            me.wControlGarageSwitch.setIcon("sap-icon://GoogleMaterial/lock");
        } else if (me.wControlGarageSwitch.getText() === "Close") {
            me.wControlGarageSwitch.setText("Open");
            me.wControlGarageSwitch.setIcon("sap-icon://GoogleMaterial/lock_open");
        }
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
                                IOMy.common.NavigationChangePage("pDeviceGaragedoor", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("width100Percent Font-RobotoCondensed Font-Medium PadLeft6px DeviceOverview-ItemLabel TextLeft Text_grey_20")
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