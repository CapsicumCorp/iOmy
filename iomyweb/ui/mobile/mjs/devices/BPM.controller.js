/*
Title: Blood Pressure Monitor Device Page Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Shows all the data from a Blood Pressure Monitor
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

sap.ui.controller("mjs.devices.BPM", {
    
    aElementsToDestroy  : [],
    
    wStatus             : null,
    wLastUsed           : null,
    wBattery            : null,
    wSystol             : null,
    wDiastol            : null,
    wHeartRate          : null,
    wUserSelectBox      : null,
    wMainList           : null,
    wApplyButton        : null,
    wPanel              : null,
    
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
        var me = this;
        var thisView = me.getView();
        
        //-------------------------------------------------------------------//
        // Create the data field widgets.
        //-------------------------------------------------------------------//
        
        //-- Status --//
        me.wStatus = new sap.m.Text ({
            text : "Off",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- Last Used --//
        me.wLastUsed = new sap.m.Text ({
            text : "23d 13h 44m",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- Battery --//
        me.wBattery = new sap.m.Text ({
            text : "79%",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- Systol --//
        me.wSystol = new sap.m.Text ({
            text : "118 mmHG",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- Diastol --//
        me.wDiastol = new sap.m.Text ({
            text : "71 mmHG",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- Heart Rate --//
        me.wHeartRate = new sap.m.Text ({
            text : "75 BPM",
            textAlign : "Right",
        }).addStyleClass("");
        
        //-- BPM User --//
        me.wUserSelectBox = new sap.m.Select ({
            items : [
                new sap.ui.core.Item({
                    key: "Freshwater1",
                    text: "Freshwater1",
                }),
                new sap.ui.core.Item({
                    key: "DemoUser",
                    text: "DemoUser",
                })
            ]
        });
        
        //-- Apply Button --//
        me.wApplyButton = new sap.m.Button({
            text : "Apply",
            width: "100px",
            press : function () {
                //IOMy.common.NavigationChangePage("pStagingHome", {}, false);
            }
        }).addStyleClass("");
        
        //-------------------------------------------------------------------//
        // Arrange the fields into a UI5 List
        //-------------------------------------------------------------------//
        me.wMainList = new sap.m.List ({
            items : [
                //-- Status --//
                new sap.m.InputListItem ({
                    label : "Status:",
                    content : [
                        //-- Column 2 for Status Row --//
                        me.wStatus
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Last Used --//
                new sap.m.InputListItem ({
                    label : "Last Used:",
                    content : [
                        //-- Column 2 for Last Used Row --//
                        me.wLastUsed
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Battery --//
                new sap.m.InputListItem ({
                    label : "Battery:",
                    content : [
                        //-- Column 2 for Battery Row --//
                        me.wBattery
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Systol --//
                new sap.m.InputListItem ({
                    label : "Systol:",
                    content : [
                        //-- Column 2 for Systol Row --//
                        me.wSystol
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Diastol --//
                new sap.m.InputListItem ({
                    label : "Diastol:",
                    content : [
                        //-- Column 2 for Diastol Row --//
                        me.wDiastol
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Heart Rate --//
                new sap.m.InputListItem ({
                    label : "Heart Rate:",
                    content : [
                        //-- Column 2 for Heart Rate Row --//
                        me.wHeartRate
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- BPM User --//
                new sap.m.InputListItem ({
                    label : "Assign to:",
                    content : [
                        //-- Column 2 for BPM User Row --//
                        me.wUserSelectBox
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Apply Button --//
                new sap.m.InputListItem ({
                    content : [
                        //-- Column 2 for Apply Button Row --//
                        me.wApplyButton
                    ]
                }).addStyleClass("maxlabelwidth50Percent textaligncenter")
            ]
        });
        
        //--------------------------------------------------------------//
        // Draw the page on the panel declared on this controller's view.
        //--------------------------------------------------------------//
        me.wPanel = new sap.m.Panel({
            backgroundDesign: "Transparent",
            content : [me.wMainList]
        }).addStyleClass("PadBottom10px UserInputForm");
        
        thisView.byId("page").addContent(me.wPanel);
    }
	
});