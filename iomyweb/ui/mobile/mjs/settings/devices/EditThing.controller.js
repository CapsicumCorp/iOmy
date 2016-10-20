/*
Title: Edit Thing/Item Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given
    item or thing.
Copyright: Capsicum Corporation 2016

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

sap.ui.controller("mjs.settings.devices.EditThing", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
    
    thingID : null,
    oThing : null,
    
    aElementsToDestroy : [],
    aElementsForAFormToDestroy : [],
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.devices.EditThing
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
                
                //-- Clear old instances of the UI --//
                me.DestroyUI();
				
				// Collect values parsed from the device list.
				me.oThing = evt.data.device;
                // Either it will come from the Device List settings page or the Device Data page.
                // They use different variable name.
				var sDeviceName = me.oThing.DeviceName;
				me.thingID = me.oThing.DeviceId;
				
				// Start rendering the page
				var oPortTitle = new sap.m.Text({
                    text : "Name",
                    textAlign : "Center"
                });
    		    
                me.aElementsToDestroy.push("thingField");
				var oPortNameField = new sap.m.Input(me.createId("thingField"), {
					value : sDeviceName
				}).addStyleClass("SettingsTextInput width100Percent");
				
				// Button to update the item
                me.aElementsToDestroy.push("updateField");
                var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("updateField"), {
							text : "Update",
							press : function () {
								this.setEnabled(false);
								
								var sThingText = me.byId("thingField").getValue();
								var iThingID = me.oThing.DeviceId;
								
                                //==========================================================\\
                                // Check that the name field is filled out.
                                //==========================================================\\
                                if (sThingText.length === 0) {
                                    jQuery.sap.log.error("Device must have a name");
                                    IOMy.common.showError("Device must have a name", "Error");
                                } else {
                                    // Run the API to update the device (thing) name
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("thing"),
                                            data : {"Mode" : "EditName", "Id" : iThingID, "Name" : sThingText},
                                            onSuccess : function () {
                                                //===== BRING UP THE SUCCESS DIALOG BECAUSE THE API RAN SUCCESSFULLY. =====\\
                                                IOMy.common.showSuccess("Update successful.", "Success", 
                                                function () {
                                                    IOMy.common.NavigationTriggerBackForward(false);
                                                }, "UpdateMessageBox");
                                                
                                                
                                                //-- RENAME THE NAME IN THE DEVICE DATA PAGE --//
                                                try {
                                                    var oDevDataPage = oApp.getPage("pDeviceData");
                                                    oDevDataPage.byId("NavSubHead_Title").setText(sThingText.toUpperCase());
                                                } catch (e) {
                                                    jQuery.sap.log.error("Error updating the Device Data page upon refresh: "+e.message);
                                                }
                                                
                                                //-- REFRESH SENSORS --//
                                                try {
                                                    IOMy.apiphp.RefreshThingList( {
                                                        onSuccess: $.proxy(function() {

                                                            //-- Flag that the Core Variables have been configured --//
                                                            IOMy.common.CoreVariablesInitialised = true;

                                                        }, me)
                                                    }); //-- END SENSORS LIST --//
                                                } catch (e) {
                                                    jQuery.sap.log.error("Error refreshing the Item List: "+e.message);
                                                }
                                            },
                                            error : function () {
                                                IOMy.common.showError("Update failed.", "Error");
                                            }
                                        });
                                    } catch (e00033) {
                                        //===== BRING UP THE ERROR DIALOG BECAUSE SOMETHING'S NOT RIGHT. =====\\
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
								this.setEnabled(true);
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
        		
				var oVertBox = new sap.m.VBox({
					items : [oPortTitle, oPortNameField, oEditButton]
				});
    		    
		    	me.aElementsToDestroy.push("devicePanel");
                var oPanel = new sap.m.Panel(me.createId("devicePanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
				
				thisView.byId("page").addContent(oPanel);
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.devices.EditThing
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.devices.EditThing
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.devices.EditThing
*/
//	onExit: function() {
//
//	}

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined)
                me.byId(sCurrentID).destroy();
        }
        // Destroy whatever other elements are left.
        me.DestroySpecificFormUI();
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    /**
     * Procedure that destroys specific form elements. These elements pertain to the a 
     */
    DestroySpecificFormUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsForAFormToDestroy.length; i++) {
            sCurrentID = me.aElementsForAFormToDestroy[i];
            if (me.byId(sCurrentID) !== undefined)
                me.byId(sCurrentID).destroy();
        }
        
        // Clear the array
        me.aElementsForAFormToDestroy = [];
    },

});