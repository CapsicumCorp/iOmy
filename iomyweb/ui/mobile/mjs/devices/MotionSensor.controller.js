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
	oThing : null,
    
    iID : null,
    UTSLastUpdate : null,
    
    aElementsToDestroy : [],
    bUIDrawn           : false,
    
    wStatusLabel            : null,
    wStatusField            : null,
    wTemperatureLabel       : null,
    wTemperatureField       : null,
    wLastMotionLabel        : null,
    wLastMotionField        : null,
    wBatteryLabel           : null,
    wBatteryField           : null,
    wTamperLabel            : null,
    wTamperField            : null,
    wColumn1                : null,
    wColumn2                : null,
    wInfoBox                : null,
    wVertBox                : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.MotionSensor
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
        
        thisView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                
                var DevModule = IOMy.devices.motionsensor;
                
                me.oThing = IOMy.common.ThingList["_"+evt.data.ThingId];
                me.iID = evt.data.ThingId;
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
        //console.log("DestroyUI() called.");
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined)
                me.byId(sCurrentID).destroy();
        }
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    /**
     * Draws the entire user interface for this page.
     */
    DrawUI : function() {
        //console.log("DrawUI() called.");
        var me = this;
		var thisView = me.getView();
        
        // STATUS
        me.wStatusLabel = new sap.m.Text({
            text : "Status:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        me.wStatusField = new sap.m.Text({
            text : IOMy.devices.GetDeviceStatus(me.iID)
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // TEMPERATURE
        me.wTemperatureLabel = new sap.m.Text({
            text : "Temperature:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        me.wTemperatureField = new sap.m.Text({
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // LAST MOTION
        me.wLastMotionLabel = new sap.m.Text({
            text : "Last Motion:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        me.wLastMotionField = new sap.m.Text({
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // BATTERY LEVEL
        me.wBatteryLabel = new sap.m.Text({
            text : "Battery:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        me.wBatteryField = new sap.m.Text({
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        // TAMPER
        me.wTamperLabel = new sap.m.Text({
            text : "Tamper:"
        }).addStyleClass("TextBold PadTop6px PadBottom6px");
        
        me.wTamperField = new sap.m.Text({
            text : ""
        }).addStyleClass("PadTop6px PadBottom6px");
        
        me.wColumn1 = new sap.m.VBox({
            items : [
                me.wStatusLabel,
                me.wTemperatureLabel,
                me.wLastMotionLabel,
                me.wBatteryLabel,
                me.wTamperLabel
            ]
        }).addStyleClass("MarLeft6px width160px");
        
        me.wColumn2 = new sap.m.VBox({
            items : [
                me.wStatusField,
                me.wTemperatureField,
                me.wLastMotionField,
                me.wBatteryField,
                me.wTamperField
            ]
        });
        
        me.wInfoBox = new sap.m.HBox({
            items : [me.wColumn1, me.wColumn2]
        });
        
        me.aElementsToDestroy.push("mainBox");
        me.wVertBox = new sap.m.VBox(me.createId("mainBox"),{
            items : [me.wInfoBox]
        });
        
        //----------------------------------------------------------------------------//
        //-- REDO THE EXTRAS MENU                                                   --//
        //----------------------------------------------------------------------------//
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
                                IOMy.common.NavigationChangePage( "pSettingsEditThing", {device : me.oThing}, false );
                            }
                        }
                    ]
                })
            );
        } catch (e) {
            jQuery.sap.log.error("Error redrawing the extras menu: "+e.message);
        }

        // Set the drawn flag so that it will always be loaded.
        me.bUIDrawn = true;
        me.FetchCurrentInformation();

        thisView.byId("Panel").addContent(me.wVertBox);
    },
    
    FetchCurrentInformation : function () {
        //--------------------------------------------------------------------//
        // Declare variables and import modules and global variables
        //--------------------------------------------------------------------//
        var me = this; // Capture the scope of the current device module.
        var aaIOs = IOMy.common.ThingList["_"+me.iID].IO;
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
        console.log(aIOIDs);
        
        //--------------------------------------------------------------------//
        // Fetch IO data and place them in the correct widgets.
        //--------------------------------------------------------------------//
        for (var i = 0; i < aIOIDs.length; i++) {
            //------------------------------------//
            // Fetch the Battery Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSBattery) {
                DevModule.FetchField(aIOIDs[i].id, me.wBatteryField);
            }
            
            //------------------------------------//
            // Fetch the Last Motion Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSMisc) {
                DevModule.FetchField(aIOIDs[i].id, me.wLastMotionField, aIOIDs[i].rstypeId);
            }
            
            //------------------------------------//
            // Fetch the Tamper Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSBitwiseStatus) {
                DevModule.FetchField(aIOIDs[i].id, me.wTamperField, aIOIDs[i].rstypeId);
            }
            
            //------------------------------------//
            // Fetch the Temperature Information
            //------------------------------------//
            if (aIOIDs[i].rstypeId == DevModule.RSTemperature) {
                DevModule.FetchField(aIOIDs[i].id, me.wTemperatureField);
            }
        }
    },

});