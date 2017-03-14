/*
Title: Scales Contoller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description:
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

sap.ui.controller("mjs.devices.Scales", {
	
    aElementsToDestroy : [],
    
    wStatus             : null,
    wLastUsed           : null,
    wBattery            : null,
    wHeight             : null,
    wWeight             : null,
    wBMI                : null,
    wUser               : null,
    wApplyButton        : null,
    wMainList           : null,
    wPanel              : null,
    
    destroyItemsWithIDs : IOMy.functions.destroyItemsByIdFromView,
    
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
            text : "Connected",
            textAlign : "Right"
        });
        
        //-- Last Accessed --//
        me.wLastUsed = new sap.m.Text ({
            text : "23d 13h 44m",
            textAlign : "Right"
        });
        
        //-- Battery --//
        me.wBattery = new sap.m.Text ({
            text : "79%",
            textAlign : "Right"
        });
        
        //-- Height --//
        me.wHeight = new sap.m.Text ({
            text : "179cm",
            textAlign : "Right"
        });
        
        //-- Weight --//
        me.wWeight = new sap.m.Text ({
            text : "80kg",
            textAlign : "Right"
        });
        
        //-- BMI --//
        //-- BMI = Weight / (height * height) = BMI --//
        //-- BMI = 80 / (1.79 * 1.79) = 25.0 --//
        me.wBMI = new sap.m.Text ({
            text : "25.0",
            textAlign : "Right",
        });
        
        //-- User --//
        me.wUser = new sap.m.Select ({
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
            tooltip: "Apply",
            text : "Apply",
            width: "100px",
            press : function () {
                //IOMy.common.NavigationChangePage("pStagingHome", {}, false);
            }
        }).addStyleClass("")
        
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
                //-- Last Accessed --//
                new sap.m.InputListItem ({
                    label : "Last Accessed:",
                    content : [
                        //-- Column 2 for Last Accessed Row --//
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
                //-- Height --//
                new sap.m.InputListItem ({
                    label : "Height:",
                    content : [
                        //-- Column 2 for Height Row --//
                        me.wHeight
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Weight --//
                new sap.m.InputListItem ({
                    label : "Weight:",
                    content : [
                        //-- Column 2 for Weight Row --//
                        me.wWeight
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- BMI --//
                //-- BMI = Weight / (height * height) = BMI --//
                //-- BMI = 80 / (1.79 * 1.79) = 25.0 --//
                new sap.m.InputListItem ({
                    label : "BMI:",
                    content : [
                        //-- Column 2 for BMI Row --//
                        me.wBMI
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- User --//
                new sap.m.InputListItem ({
                    label : "Assign to:",
                    content : [
                        //-- Column 2 for HeartRate Row --//
                        me.wUser
                    ]
                }).addStyleClass("maxlabelwidth50Percent"),
                //-- Apply Button --//
                new sap.m.InputListItem ({
                    content : [
                        //-- Column 2 for Current Temp Row --//
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
            content : [ me.wMainList ]
        }).addStyleClass("PadBottom10px UserInputForm");
        
        thisView.byId("page").addContent(me.wPanel);
    }
	
});