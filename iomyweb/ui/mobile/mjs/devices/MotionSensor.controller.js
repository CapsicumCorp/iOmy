/*
Title: Motion Sensor Page UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the controls to view information from a motion sensor.
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
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

sap.ui.controller("mjs.devices.MotionSensor", {
    
    //-------------------------------------------------//
    // Data
    //-------------------------------------------------//
    iThingId                : null,
    mThing                  : null,
    UTSLastUpdated          : null,
    bUIDrawn                : null,
	
    //-------------------------------------------------//
    // Widgets
    //-------------------------------------------------//
    aElementsToDestroy : [],        // ARRAY: A list of IDs used by any element on this page
    
    wMainList               : null,
	wPanel					: null,
	
    wStatusField            : null,
    wTemperatureField       : null,
    wLastMotionField        : null,
    wBatteryField           : null,
    wTamperField            : null,
    
    destroyItemsWithIDs     : IOMy.functions.destroyItemsByIdFromView,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.MotionSensor
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
        //-- IMPORT THE DEVICE LABEL FUNCTIONS MODULE --//
        var LabelFunctions = IOMy.functions.DeviceLabels;
        
        thisView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                //-- Refresh the Navigational buttons --//
                IOMy.common.NavigationRefreshButtons( me );
                
                me.oThing = IOMy.common.ThingList["_"+evt.data.ThingId];
                me.iThingId = evt.data.ThingId;
                me.UTSLastUpdate = IOMy.common.ThingList["_"+evt.data.ThingId].UILastUpdate;
                
                // Create the title on the page.
                me.byId("NavSubHead_Title").setText(me.oThing.DisplayName.toUpperCase());
                
//                if ((DevModule.iODataFieldsToFetch === 0 && DevModule.bWaitingToLoadAPI === false && DevModule.bLoadingFieldsFromAPI === false))
//                {
                    me.DestroyUI();
                    me.DrawUI();
//                }
                
            }
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.MotionSensor
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.MotionSensor
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.MotionSensor
*/
//	onExit: function() {
//
//	}

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        me.destroyItemsWithIDs(me, me.aElementsToDestroy);
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    /**
     * Draws the entire user interface for this page.
     */
    DrawUI : function() {
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
            text : sDefaultText,
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Temperature --//
        me.wTemperatureField = new sap.m.Text ({
            text : sDefaultText,
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Last Motion --//
        me.wLastMotionField = new sap.m.Text ({
            text : sDefaultText,
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Battery --//
        me.wBatteryField = new sap.m.Text ({
            text : sDefaultText,
            textAlign : "Right",
            width : "100%"
        });
        
        //-- Tamper --//
        me.wTamperField = new sap.m.Text ({
            text : sDefaultText,
            textAlign : "Right",
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
                //-- Temperature --//
                new sap.m.InputListItem ({
                    label : "Temperature:",
                    content : [
                        //-- Column 2 for Temperature Row --//
                        me.wTemperatureField
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Last Motion --//
                new sap.m.InputListItem ({
                    label : "Last Motion:",
                    content : [
                        //-- Column 2 for Last Motion Row --//
                        me.wLastMotionField
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
		
		me.wPanel = new sap.m.Panel( me.createId("Panel"), {
			backgroundDesign: "Transparent",
			content: [me.wMainList]
		}).addStyleClass("PadBottom10px UserInputForm")
		
        thisView.byId("page").addContent(me.wPanel);
        
        //----------------------------------------------------------------------------//
        //-- REDO THE ACTION MENU                                                   --//
        //----------------------------------------------------------------------------//
        me.aElementsToDestroy.push("extrasMenu"+me.oThing.Id);
        
        try {
            thisView.byId("extrasMenuHolder").destroyItems();
            thisView.byId("extrasMenuHolder").addItem(
                IOMy.widgets.getActionMenu({
                    id : me.createId("extrasMenu"+me.oThing.Id),        // Uses the page ID
                    icon : "sap-icon://GoogleMaterial/more_vert",
                    items : [
                        {
                            text: "Edit "+me.oThing.DisplayName,
                            select:	function (oControlEvent) {
                                IOMy.common.NavigationChangePage( "pSettingsEditThing", {"ThingId" : me.oThing.Id}, false );
                            }
                        }
                    ]
                })
            );
        } catch (e) {
            jQuery.sap.log.error("Error redrawing the action menu: "+e.message);
        }

        // Set the drawn flag so that it will always be loaded.
        me.bUIDrawn = true;
        me.FetchCurrentInformation();
    },
    
    FetchCurrentInformation : function () {
        //--------------------------------------------------------------------//
        // Declare variables and import modules and global variables
        //--------------------------------------------------------------------//
        var me = this; // Capture the scope of the current device module.
        var aaIOs = IOMy.common.ThingList["_"+me.iThingId].IO;
        var aIOIDs = [];
        var DevModule = IOMy.devices.motionsensor;
        
        //--------------------------------------------------------------------//
        // Prepare the IO ID array
        //--------------------------------------------------------------------//
        $.each(aaIOs, function (sI, mIO) {
            if (sI !== undefined && sI !== null && mIO !== undefined && mIO !== null) {
                aIOIDs.push(
                    {
                        "id" : mIO.Id,
                        "rstypeId" : mIO.RSTypeId
                    }
                );
            }
        });
        
        //--------------------------------------------------------------------//
        // Indicate that the current information will now be fetched
        //--------------------------------------------------------------------//
        DevModule.bLoadingMotionSensorFields = true;
        
        //--------------------------------------------------------------------//
        // Fetch device status IO data and place them in the correct widgets.
        //--------------------------------------------------------------------//
        me.wStatusField.setText( IOMy.devices.GetDeviceStatus(me.iThingId) );
        
        for (var i = 0; i < aIOIDs.length; i++) {
            //------------------------------------//
            // Fetch the Battery Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSBattery) {
                DevModule.FetchField(aIOIDs[i].id, me.wBatteryField);
            }
            //------------------------------------//
            // Fetch the Temperature Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSTemperature) {
                DevModule.FetchField(aIOIDs[i].id, me.wTemperatureField);
            }
        }
        
        DevModule.CallAPI(me.iThingId, me.wTamperField, me.wLastMotionField);
    },

});