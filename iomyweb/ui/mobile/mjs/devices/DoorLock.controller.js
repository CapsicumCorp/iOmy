/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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

sap.ui.controller("mjs.devices.DoorLock", {
	
    mThing              : null,
    //-------------------------------------------------//
    // Widgets
    //-------------------------------------------------//
    aElementsToDestroy : [],        // ARRAY: A list of IDs used by any element on this page
    
    timeoutLockDoor     : null,
    
    wMainList           : null,
	wPanel				: null,
	
    wStatusField        : null,
    wLastAccessField    : null,
    wBatteryField       : null,
    wTamperField        : null,
    wControlSwitch      : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.DoorLock
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
                
                //-- Retrieve the thing --//
                me.mThing = IOMy.common.ThingList["_"+evt.data.ThingId];
                
                //if (IOMy.common.ThingList["_"+me.mThing.Id].UnlockTimeout === null) {
                    me.DestroyUI();
                    me.DrawUI();
                //}
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.DoorLock
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.DoorLock
*/
	onAfterRendering: function() {
        
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.DoorLock
*/
	onExit: function() {

	},
    
    /**
     * This is the procedure to wipe the old instance of the UI before this page
     * is drawn once again.
     */
    DestroyUI : function () {
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Wipe any elements with IDs assigned to them
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            me.byId(me.aElementsToDestroy[i]).destroy();
        }
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    /**
     * Main function for drawing the page.
     */
    DrawUI : function () {
        //-------------------------------------------------------------------//
        // Declare variables and import modules.
        //-------------------------------------------------------------------//
        var me = this; // Captures the scope of this controller.
        var thisView = me.getView(); // Captures this controller's view.
        var sDefaultText = "N/A";
        var sSwitchText = "";
        var sSwitchIcon = "";
        var sStatusText = "";
        
        //-- Get the current status and use it to say whether it's locked or not. --//
        if (IOMy.common.ThingList["_"+me.mThing.Id].Status === 1) {
            sStatusText = "Locked";
            
            // Set the switch to unlock it.
            sSwitchText = "Unlock";
            sSwitchIcon = "sap-icon://GoogleMaterial/lock_open";
            
        } else if (IOMy.common.ThingList["_"+me.mThing.Id].Status === 0) {
            sStatusText = "Unlocked";
            
            // Set the switch to lock it.
            sSwitchText = "Lock";
            sSwitchIcon = "sap-icon://GoogleMaterial/lock";
        }
        
        //-------------------------------------------------------------------//
        // If the switches and status labels arrays have not been created yet,
        // create them.
        //-------------------------------------------------------------------//
        if (IOMy.common.ThingList["_"+me.mThing.Id].Switches === undefined) {
            IOMy.common.ThingList["_"+me.mThing.Id].Switches = {};
        }
        
        if (IOMy.common.ThingList["_"+me.mThing.Id].StatusLabels === undefined) {
            IOMy.common.ThingList["_"+me.mThing.Id].StatusLabels = {};
        }
        
        //-------------------------------------------------------------------//
        // Create the data field widgets.
        //-------------------------------------------------------------------//
        
        //-- Status --//
        me.wStatusField = new sap.m.Text ( me.createId("StatusField"), {
            text : sStatusText,
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Last Accessed --//
        me.wLastAccessField = new sap.m.Text ({
            text : "1d 3h 21m",
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Battery --//
        me.wBatteryField = new sap.m.Text ({
            text : "21%",
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Tamper --//
        me.wTamperField = new sap.m.Text ({
            text : "Secure",
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Control Switch --//
        me.wControlSwitch = new sap.m.Button(me.createId("doorSwitch_"+me.mThing.Id), {
            icon : sSwitchIcon,
			width: "95px",
            text : sSwitchText,
            press : function () {
                IOMy.devices.doorlock.RunSwitch(me.mThing.Id);
            }
        }).addStyleClass("MarLeft10Percent");
        
        //-------------------------------------------------------------------//
        // Insert the switch and status field IDs into their respective arrays
        // in its Thing object.
        //-------------------------------------------------------------------//
        IOMy.common.ThingList["_"+me.mThing.Id].StatusLabels[ thisView.getId() ] = me.createId("StatusField");
        IOMy.common.ThingList["_"+me.mThing.Id].Switches[ thisView.getId() ] = me.createId("doorSwitch_"+me.mThing.Id);
        
        //-------------------------------------------------------------------//
        // Arrange the fields into a UI5 List
        //-------------------------------------------------------------------//
        me.wMainList = new sap.m.List({
            items : [
                //-- Status --//
                new sap.m.InputListItem ({
                    label : "Status:",
                    content : [
                        //-- Column 2 for Status Row --//
                        me.wStatusField
                    ]
                }),
                //-- Last Accessed --//
                new sap.m.InputListItem ({
                    label : "Last Accessed:",
                    content : [
                        //-- Column 2 for Last Accessed Row --//
                        me.wLastAccessField
                    ]
                }),
                //-- Battery --//
                new sap.m.InputListItem ({
                    label : "Battery:",
                    content : [
                        //-- Column 2 for Battery Row --//
                        me.wBatteryField
                    ]
                }),
                //-- Tamper --//
                new sap.m.InputListItem ({
                    label : "Tamper:",
                    content : [
                        //-- Column 2 for Tamper Row --//
                        me.wTamperField
                    ]
                }),
                //-- Control Switch --//
                new sap.m.InputListItem ({
                    label : "Switch:",
                    content : [
                        //-- Column 2 for Control Switch Row --//
                        sap.ui.getCore().byId(IOMy.common.ThingList["_"+me.mThing.Id].Switches[ thisView.getId() ])
                    ]
                })
            ]
        });
        
        //--------------------------------------------------------------//
        // Draw the page on the panel declared on this controller's view.
        //--------------------------------------------------------------//
		
		me.wPanel = new sap.m.Panel( me.createId("panel"), {
			backgroundDesign: "Transparent",
			content : [me.wMainList]
		}).addStyleClass("PadBottom10px UserInputForm")
		
        thisView.byId("page").addContent(me.wPanel);
    }
	
});