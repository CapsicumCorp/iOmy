/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
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

sap.ui.controller("mjs.devices.WindowSensor", {
    
    //-------------------------------------------------//
    // Data
    //-------------------------------------------------//
    iThingId            : null,
	
    //-------------------------------------------------//
    // Widgets
    //-------------------------------------------------//
    aElementsToDestroy : [],        // ARRAY: A list of IDs used by any element on this page
    
    wMainList           : null,
    wPanel				: null,
	
    wStatusField        : null,
    wLastAccessedField  : null,
    wBatteryField       : null,
    wTamperField        : null,
    
    destroyItemsWithIDs     : IOMy.functions.destroyItemsByIdFromView,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.WindowSensor
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
                
//                me.DestroyUI();
//                me.DrawUI();
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.WindowSensor
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.WindowSensor
*/
	onAfterRendering: function() {
        var me = this;
        
        me.DrawUI();
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.WindowSensor
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
        me.destroyItemsWithIDs(me, me.aElementsToDestroy);
        
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
        
        //-------------------------------------------------------------------//
        // Create the data field widgets.
        //-------------------------------------------------------------------//
        
        //-- Status --//
        me.wStatusField = new sap.m.Text ({
            text : "Closed",
            textAlign : "Center",
            width : "100%"
        });
        
        //-- Last Accessed --//
        me.wLastAccessedField = new sap.m.Text ({
            text : "23d 14h 55m",
            textAlign : "Center",
            width : "100%"
        });
        
        //-- Battery --//
        me.wBatteryField = new sap.m.Text ({
            text : "79%",
            textAlign : "Center",
            width : "100%"
        });
        
        //-- Tamper --//
        me.wTamperField = new sap.m.Text ({
            text : "Secure",
            textAlign : "Center",
            width : "100%"
        });
        
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
                }).addStyleClass("maxlabelwidth50Percent"),
                
                //-- Last Accessed --//
                new sap.m.InputListItem ({
                    label : "Last Accessed:",
                    content : [
                        //-- Column 2 for Last Accessed Row --//
                        me.wLastAccessedField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                
                //-- Battery --//
                new sap.m.InputListItem ({
                    label : "Battery:",
                    content : [
                        //-- Column 2 for Battery Row --//
                        me.wBatteryField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                
                //-- Tamper --//
                new sap.m.InputListItem ({
                    label : "Tamper:",
                    content : [
                        //-- Column 2 for Tamper Row --//
                        me.wTamperField
                    ]
                }).addStyleClass("maxlabelwidth50Percent")
            ]
        }).addStyleClass("PadBottom10px UserInputForm");
        
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