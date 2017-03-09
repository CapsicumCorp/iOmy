/*
Title: Door Lock Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI and functionality for a Door Lock entry.
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

$.sap.declare("IOMy.devices.doorlock",true);
IOMy.devices.doorlock = new sap.ui.base.Object();

$.extend(IOMy.devices.doorlock,{
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
    //-- Resource Types for the Door Lock IOs --//
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -1,
    ThingTypeID         : -1,
    
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var me = this;
		var oUIObject			= null;					//-- OBJECT:	The device entry
        var sSwitchText         = "";                   //-- STRING:    Text to display on the button.
        var sSwitchIcon         = "";                   //-- STRING:    Icon to display on the button.
		var sPageId             = oViewScope.getView().getId(); //-- STRING:    ID of the page that this will display on.
        
        //--------------------------------------------------------------------//
		// Prepare the switch with the right text and icon.
		//--------------------------------------------------------------------//
        
        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status === 1) {
            sSwitchText = "Unlock";
            sSwitchIcon = "sap-icon://GoogleMaterial/lock_open";
            
        } else if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status === 0) {
            sSwitchText = "Lock";
            sSwitchIcon = "sap-icon://GoogleMaterial/lock";
        }
        
        //-- If the switches array has not been created yet, create it. --//
        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches === undefined) {
            IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches = {};
        }
        
        //--------------------------------------------------------------------//
        // Create the switch.
        //--------------------------------------------------------------------//
        new sap.m.Button(oViewScope.createId(sPageId+"Button_"+aDeviceData.DeviceId), {
            icon : sSwitchIcon,
            width: "95px",
            text : sSwitchText,
            press : function () {
                me.RunSwitch(aDeviceData.DeviceId);
            }
        }).addStyleClass("");

        //-- Add the switch to the switches array. --//
        IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[ sPageId ] = oViewScope.createId(sPageId+"Button_"+aDeviceData.DeviceId);
        
        //--------------------------------------------------------------------//
        // Draw the UI entry for the Door Lock
        //--------------------------------------------------------------------//
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
                                IOMy.common.NavigationChangePage("pDeviceDoorLock", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                    ]

                }).addStyleClass("BorderRight width80Percent jbMR1tempfix"),
                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.HBox({
                    items : [
                        new sap.m.VBox( oViewScope.createId( sPrefix+"_LockButton"), {
                            //--------------------------------//
                            //-- Toggle Button              --//
                            //--------------------------------//
                            items: [
                                new sap.m.VBox({
                                    items : [
                                        // Added in temporarily until functionality is implemented by Brent
                                        // Doors will auto lock after 5 - 20 seconds
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
    
    /**
     * Either locks or unlocks a given bluetooth door lock. If the user unlocks 
     * the door, it will lock again after a set amount of seconds.
     * 
     * @param {type} iThingId                   The ID of the door lock.
     */
    RunSwitch : function (iThingId) {
        //------------------------------------------------------------//
        // Change the door lock status
        //------------------------------------------------------------//
        IOMy.devices.doorlock.ToggleDoorLockSwitch(iThingId);

        //------------------------------------------------------------//
        // If the door locks...
        //------------------------------------------------------------//
        if (IOMy.common.ThingList["_"+iThingId].Status === 1) {

            //--------------------------------------------------------//
            // Clear any timeout function for locking the door.
            //--------------------------------------------------------//
            if (IOMy.common.ThingList["_"+iThingId].SwitchTimeout !== null &&
                    IOMy.common.ThingList["_"+iThingId].SwitchTimeout !== undefined)
            {
                clearTimeout(IOMy.common.ThingList["_"+iThingId].SwitchTimeout);
                IOMy.common.ThingList["_"+iThingId].SwitchTimeout = null;
            }

        //------------------------------------------------------------//
        // If the door unlocks...
        //------------------------------------------------------------//
        } else if (IOMy.common.ThingList["_"+iThingId].Status === 0) {

            //--------------------------------------------------------//
            // Create the timeout function and store it in its thing.
            //--------------------------------------------------------//
            if (IOMy.common.ThingList["_"+iThingId].SwitchTimeout === null ||
                    IOMy.common.ThingList["_"+iThingId].SwitchTimeout === undefined)
            {
                //----------------------------------------------------//
                // After 5 seconds the door locks itself.
                //----------------------------------------------------//
                IOMy.common.ThingList["_"+iThingId].SwitchTimeout = setTimeout(
                    function () {
                        IOMy.devices.doorlock.ToggleDoorLockSwitch(iThingId);

                        //-- Clean up --//
                        clearTimeout(IOMy.common.ThingList["_"+iThingId].SwitchTimeout);
                        IOMy.common.ThingList["_"+iThingId].SwitchTimeout = null;
                    },
                5000);
            }
        }
    },
    
	/**
     * Changes the status of the bluetooth door lock and reports the new state
     * of the door.
     * 
     * All switches as well as any status labels that it recognises will be
     * affected by this change.
     * 
     * A switch will then display either 'Unlock' or 'Lock'.
     * 
     * Status labels will display either 'Unlocked' or 'Locked'.
     * 
     * @param {type} iThingId           ID of the garage door.
     */
	ToggleDoorLockSwitch : function (iThingId) {
        //--------------------------------------------------------------------//
        // Declare variable
        //--------------------------------------------------------------------//
        var me              = this;                                             // Door Lock Module scope.
        var aaSwitches      = IOMy.common.ThingList["_"+iThingId].Switches;     // Associative Array for switch IDs for different pages.
        var aaStatusLabels  = IOMy.common.ThingList["_"+iThingId].StatusLabels; // Associative Array for the status label IDs.
        var oWidget;                                                            // Temporary placeholder for holding a widget while it's being manipulated.
        
        //--------------------------------------------------------------------//
        // Traverse through the associative array to work on the switches.
        //--------------------------------------------------------------------//
        if (aaSwitches !== undefined) {
            $.each(aaSwitches, function (sIndex, sWidgetID) {
                oWidget = sap.ui.getCore().byId(sWidgetID);

                if (oWidget.getText() === "Unlock") {
                    oWidget.setText("Lock");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock");
                    IOMy.common.ThingList["_"+iThingId].Status = 0;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 0);
                } else if (oWidget.getText() === "Lock") {
                    oWidget.setText("Unlock");
                    oWidget.setIcon("sap-icon://GoogleMaterial/lock_open");
                    IOMy.common.ThingList["_"+iThingId].Status = 1;
                    IOMy.experimental.updateThingField(iThingId, "ThingStatus", 1);
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
                    oWidget.setText("Unlocked");
                } else if (IOMy.common.ThingList["_"+iThingId].Status === 1) {
                    oWidget.setText("Locked");
                }
            });
        }
        
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