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
    
    //-- TODO: Place the resource types for this particular device when we have an API for the device. --//
    //-- Resource Types for the Garage Door IOs --//
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -5,
    ThingTypeID         : -5,
	
	DevicePageID : "pDeviceGaragedoor",
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var me = this;
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        var mSwitchInfo         = me.GetSwitchStatus(aDeviceData.DeviceId, oViewScope);
        var sSwitchText         = mSwitchInfo.switchText;                   //-- STRING:    Text to display on the button.
        var sSwitchIcon         = mSwitchInfo.switchIcon;                   //-- STRING:    Icon to display on the button.
        var bSwitchEnabled      = mSwitchInfo.switchEnabled;
		var sPageId             = oViewScope.getView().getId(); //-- STRING:    ID of the page that this will display on.
                
        //-- If the switches array has not been created yet, create it. --//
        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches === undefined) {
            IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches = {};
        }
        
        //--------------------------------------------------------------------//
        // Create the switch.
        //--------------------------------------------------------------------//
        new sap.m.Button(oViewScope.createId(sPageId+"Button_"+aDeviceData.DeviceId), {
            tooltip: "Open/Close Toggle",
            icon : sSwitchIcon,
            width: "95px",
            text : sSwitchText,
            enabled : bSwitchEnabled,
            press : function () {
                me.RunSwitch(aDeviceData.DeviceId);
            }
        });

        //-- Add the switch to the switches array. --//
        IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[ sPageId ] = oViewScope.createId(sPageId+"Button_"+aDeviceData.DeviceId);
        
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
                                IOMy.common.NavigationChangePage("pDeviceGaragedoor", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                    ]
                }).addStyleClass("BorderRight width80Percent jbMR1tempfix"),

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
                                        sap.ui.getCore().byId(IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[ sPageId ])
									]
								}).addStyleClass("MarTop5px TextCenter"),
							]
						}).addStyleClass("width100Percent")
					]
				}).addStyleClass("minwidth170px minheight58px")
            ]
        }).addStyleClass("ListItem");
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    GetSwitchStatus : function(iThingId, oViewScope) {
        //--------------------------------------------------------------------//
		// Check that the arguments are given
		//--------------------------------------------------------------------//
        var sErrorMessage = "Error Retrieving Garage Switch Status:";          // Error message
        
        //-- Check the Thing ID --//
        if (iThingId === undefined) {
            //-- It doesn't exist... --//
            sErrorMessage += " Thing ID is not given!";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
            
        } else if (isNaN(iThingId)) {
            //-- It's not a number --//
            sErrorMessage += " Thing ID is not a valid number";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
        }
        
        //-- Check the given view to fetch the page ID. --//
        if (oViewScope === undefined) {
            sErrorMessage += " Scope of a given page/view is not given!";
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
        }
        
        //--------------------------------------------------------------------//
		// Declare variables
		//--------------------------------------------------------------------//
        var sStatusText         = "";                       //-- STRING:    Text to display on the status field.
        var sSwitchText         = "";                       //-- STRING:    Text to display on the button.
        var sSwitchIcon         = "";                       //-- STRING:    Icon to display on the button.
        var bSwitchEnabled;                                 //-- BOOLEAN
        var mInfo               = {};                       //-- MAP:       Contains the variables for setting the switch properties.
        
        //--------------------------------------------------------------------//
		// Prepare the switch with the right text and icon.
		//--------------------------------------------------------------------//
        if (IOMy.common.ThingList["_"+iThingId].Status === 0) {
            //----------------------------------------------------------------//
            // If the door is opening, specify so and disable the switch.
            //----------------------------------------------------------------//
            if (IOMy.common.ThingList["_"+iThingId].Opening && 
                    IOMy.common.ThingList["_"+iThingId].Opening !== undefined)
            {
                sSwitchText = "Opening";
                sSwitchIcon = "sap-icon://GoogleMaterial/lock_open";
                bSwitchEnabled = false;
                
                sStatusText = "Opening";
                
            //----------------------------------------------------------------//
            // Otherwise, the door is closed. The switch is set to open the
            // door.
            //----------------------------------------------------------------//
            } else {
                sSwitchText = "Open";
                sSwitchIcon = "sap-icon://GoogleMaterial/lock_open";
                bSwitchEnabled = true;
                
                sStatusText = "Closed";
            }
        } else if (IOMy.common.ThingList["_"+iThingId].Status === 1) {
            //----------------------------------------------------------------//
            // If the door is closing, specify so and disable the switch.
            //----------------------------------------------------------------//
            if (IOMy.common.ThingList["_"+iThingId].Closing && 
                    IOMy.common.ThingList["_"+iThingId].Closing !== undefined)
            {
                sSwitchText = "Closing";
                sSwitchIcon = "sap-icon://GoogleMaterial/lock";
                bSwitchEnabled = false;
                
                sStatusText = "Closing";
            //----------------------------------------------------------------//
            // Otherwise, the door is open. The switch is set to close the door.
            //----------------------------------------------------------------//
            } else {
                sSwitchText = "Close";
                sSwitchIcon = "sap-icon://GoogleMaterial/lock";
                bSwitchEnabled = true;
                
                sStatusText = "Open";
            }
        }
        
        //--------------------------------------------------------------------//
        // Put the three variables into a map and return it to the calling
        // function.
        //--------------------------------------------------------------------//
        mInfo = {
            statusText : sStatusText,
            switchText : sSwitchText,
            switchIcon : sSwitchIcon,
            switchEnabled : bSwitchEnabled
        };
        
        return mInfo;
    },
    
    RunSwitch : function (iThingId) {
        IOMy.devices.garagedoor.ToggleGarageDoorSwitch(iThingId);
        
        //--------------------------------------------------------//
        // Create the timeout function and store it in its thing.
        //--------------------------------------------------------//
        if (IOMy.common.ThingList["_"+iThingId].SwitchTimeout === null ||
                IOMy.common.ThingList["_"+iThingId].SwitchTimeout === undefined)
        {
            //----------------------------------------------------//
            // After 15 seconds the status and switch are updated.
            //----------------------------------------------------//
            IOMy.common.ThingList["_"+iThingId].SwitchTimeout = setTimeout(
                function () {
                    IOMy.devices.garagedoor.ToggleGarageDoorSwitch(iThingId);

                    //-- Clean up --//
                    clearTimeout(IOMy.common.ThingList["_"+iThingId].SwitchTimeout);
                    IOMy.common.ThingList["_"+iThingId].SwitchTimeout = null;
                },
            15000);
        }
    },
	
    /**
     * Changes the status of the garage door and reports the new state of the
     * door.
     * 
     * All switches as well as any status labels that it recognises will be
     * affected by this change.
     * 
     * A switch will then display either 'Open', 'Opening', 'Close', or
     * 'Closing'. If the switch says either 'Opening' or 'Closing' then the
     * switch is disabled. This is re-enabled by a timeout function set by
     * IOMy.devices.garagedoor.RunSwitch().
     * 
     * Status labels will display either 'Open', 'Opening', 'Closed', or
     * 'Closing'.
     * 
     * @param {type} iThingId           ID of the garage door.
     */
	ToggleGarageDoorSwitch : function(iThingId) {
        var me = this;
        var aaSwitches = IOMy.common.ThingList["_"+iThingId].Switches;
        var aaStatusLabels = IOMy.common.ThingList["_"+iThingId].StatusLabels;
        var oWidget;
        
        //--------------------------------------------------------------------//
        // Traverse through the associative array to work on the switches.
        //--------------------------------------------------------------------//
        if (aaSwitches !== undefined) {
            $.each(aaSwitches, function (sIndex, sWidgetID) {
                oWidget = sap.ui.getCore().byId(sWidgetID);

                //------------------------------------------------------------//
                // Start opening the door.
                //------------------------------------------------------------//
                if (oWidget.getText() === "Open") {
                    oWidget.setText("Opening");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock_open");
                    oWidget.setEnabled(false);
                    IOMy.common.ThingList["_"+iThingId].Status = 0;
                    IOMy.common.ThingList["_"+iThingId].Opening = true;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 0);

                //------------------------------------------------------------//
                // Now open. The switch can close the door.
                //------------------------------------------------------------//
                } else if (oWidget.getText() === "Opening") {
                    oWidget.setText("Close");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock");
                    oWidget.setEnabled(true);
                    IOMy.common.ThingList["_"+iThingId].Status = 1;
                    IOMy.common.ThingList["_"+iThingId].Opening = false;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 1);

                //------------------------------------------------------------//
                // Start closing the door.
                //------------------------------------------------------------//
                } else if (oWidget.getText() === "Close") {
                    oWidget.setText("Closing");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock");
                    oWidget.setEnabled(false);
                    IOMy.common.ThingList["_"+iThingId].Status = 1;
                    IOMy.common.ThingList["_"+iThingId].Closing = true;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 1);

                //------------------------------------------------------------//
                // Now closed. The switch can open the door.
                //------------------------------------------------------------//
                } else if (oWidget.getText() === "Closing") {
                    oWidget.setText("Open");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock_open");
                    oWidget.setEnabled(true);
                    IOMy.common.ThingList["_"+iThingId].Status = 0;
                    IOMy.common.ThingList["_"+iThingId].Closing = false;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 0);

                }

            });
        } 
        
        //--------------------------------------------------------------------//
        // Traverse through the associative array to work on the status labels.
        //--------------------------------------------------------------------//
        if (aaStatusLabels !== undefined) {
            $.each(aaStatusLabels, function (sIndex, sWidgetID) {
                oWidget = sap.ui.getCore().byId(sWidgetID);

                if (IOMy.common.ThingList["_"+iThingId].Status === 0) {
                    if (IOMy.common.ThingList["_"+iThingId].Opening) {
                        oWidget.setText("Opening")
                    } else {
                        oWidget.setText("Closed");
                    }
                } else if (IOMy.common.ThingList["_"+iThingId].Status === 1) {
                    if (IOMy.common.ThingList["_"+iThingId].Closing) {
                        oWidget.setText("Closing")
                    } else {
                        oWidget.setText("Open");
                    }
                }
            });
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