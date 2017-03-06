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
    
    // -- Resource Types for the Door Lock IOs
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -1,
    ThingTypeID         : -1,
    
    ToggleLockSwitch : function (wWidget) {
        var me = this;
        
        if (wWidget.getText() === "Unlock") {
            wWidget.setText("Lock");
            wWidget.setIcon("sap-icon://GoogleMaterial/lock");
        } else if (wWidget.getText() === "Lock") {
            wWidget.setText("Unlock");
            wWidget.setIcon("sap-icon://GoogleMaterial/lock_open");
        }
    },
	
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
        
        //-- If the switches array has not been created yet, create it. --//
        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches === undefined) {
            IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches = {};
        }
        
        //--------------------------------------------------------------------//
        // Create the Switch that is unique to the current device, if it does
        // not exist already.
        //--------------------------------------------------------------------//
        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[oApp.getCurrentPage().getId()] === undefined ||
                IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[oApp.getCurrentPage().getId()] === null)
        {
            me["wDoorLock_"+aDeviceData.DeviceId] = new sap.m.Button({
                icon : "sap-icon://GoogleMaterial/lock_open",
                width: "95px",
                text : "Unlock",
                press : function () {
                    var thisButton = this;

                    me.ToggleDoorLockSwitch(aDeviceData.DeviceId);

                    if (thisButton.getText() === "Unlock") {
                        //me.wStatusField.setText("Locked");

                        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout !== null &&
                                IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout !== undefined)
                        {
                            clearTimeout(IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout);
                            IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout = null;
                        }

                    } else if (thisButton.getText() === "Lock") {
                        //me.wStatusField.setText("Unlocked");

                        if (IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout === null ||
                                IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout === undefined)
                        {
                            IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout = setTimeout(
                                function () {
                                    me.ToggleDoorLockSwitch(aDeviceData.DeviceId);

    //                                if (thisButton.getText() === "Unlock") {
    //                                    me.wStatusField.setText("Locked");
    //                                } else if (thisButton.getText() === "Lock") {
    //                                    me.wStatusField.setText("Unlocked");
    //                                }

                                    //-- Clean up --//
                                    clearTimeout(IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout);
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].UnlockTimeout = null;
                                },
                            5000);
                        }
                    }
                }
            }).addStyleClass("");
            
            //-- Add the switch to the switches array. --//
            IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[oApp.getCurrentPage().getId()] = me["wDoorLock_"+aDeviceData.DeviceId];
        }
        
        
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
                        }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20")
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
                                        IOMy.common.ThingList["_"+aDeviceData.DeviceId].Switches[oApp.getCurrentPage().getId()]
                                    ]
                                }).addStyleClass("ElementCenter"),
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
	// Added in temporarily until functionality is implemented by Brent
	ToggleDoorLockSwitch : function (iThingId) {
        var me = this;
        var aaSwitches = IOMy.common.ThingList["_"+iThingId].Switches;
        
        $.each(aaSwitches, function (sIndex, oSwitchWidget) {
            if (oSwitchWidget.getText() === "Unlock") {
                oSwitchWidget.setText("Lock");
                oSwitchWidget.setIcon("sap-icon://GoogleMaterial/lock");
            } else if (oSwitchWidget.getText() === "Lock") {
                oSwitchWidget.setText("Unlock");
                oSwitchWidget.setIcon("sap-icon://GoogleMaterial/lock_open");
            }
        });
        
//        for (var i = 0; i < aSwitches.length; i++) {
//            if (aSwitches[i].getText() === "Unlock") {
//                aSwitches[i].setText("Lock");
//                aSwitches[i].setIcon("sap-icon://GoogleMaterial/lock");
//            } else if (aSwitches[i].getText() === "Lock") {
//                aSwitches[i].setText("Unlock");
//                aSwitches[i].setIcon("sap-icon://GoogleMaterial/lock_open");
//            }
//        }
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