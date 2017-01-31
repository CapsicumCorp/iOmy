/*
Title: Edit Thing/Item Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given
    item or thing.
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

sap.ui.controller("mjs.settings.devices.EditThing", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
    
    thingID : null,
    oThing : null,
    
    aElementsToDestroy : [],
    aElementsForAFormToDestroy : [],
    
    sThingNameField : "thingNameField",
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
                jQuery.sap.log.debug(JSON.stringify(evt.data.device));
                // Collect values parsed from the device list.
                me.oThing = evt.data.device;
        
				//-- Clear old instances of the UI --//
                me.DestroyUI();
				me.DrawUI();
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

    ValidateThingName : function () {
        var me                      = this;  // Scope of this controller
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------\\
        // Is the name filled out?
        //-------------------------------------------------\\
        try {
            if (me.byId(me.sThingNameField).getValue() === "") {
                bError = true;
                aErrorMessages.push("A name must be given for this item.");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("There was an error checking the thing name: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },

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
    
    /**
     * Constructs the user interface for the form to add a thing.
     */
    DrawUI : function () {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        var me = this;
        var thisView = me.getView();
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );

        me.thingID = me.oThing.DeviceId;
        //var iLinkId = me.oThing.LinkId;
        
        // Start rendering the page
        
        //-----------------------------------------------\\
        // THING NAME
        //-----------------------------------------------\\
        var oThingNameLabel = new sap.m.Label({
            text : "Display Name"
        });
        
        me.aElementsToDestroy.push(me.sThingNameField);
        var oThingNameField = new sap.m.Input(me.createId(me.sThingNameField), {
            value : me.oThing.DisplayName
        }).addStyleClass("width100Percent");
        
        //-----------------------------------------------\\
        // FORM BOX FOR SPECIFIC DEVICE TYPES
        //-----------------------------------------------\\
        me.aElementsToDestroy.push("formBox");
        var oFormBox = new sap.m.VBox(me.createId("formBox"), {});

        //-----------------------------------------------\\
        // UPDATE BUTTON
        //-----------------------------------------------\\
        me.aElementsToDestroy.push("updateButton");
        var oEditButton = new sap.m.VBox({
            items : [
                new sap.m.Link(me.createId("updateButton"), {
                    text : "Update",
                    press : function () {
                        var thisButton = this; // Captures the scope of the calling button.
                        thisButton.setEnabled(false);

                        var sThingText = me.byId("thingNameField").getValue();
                        var iThingID = me.oThing.Id;
                        var mInfo = {};

                        //==========================================================\\
                        // Check that the name field is filled out.
                        //==========================================================\\
                        mInfo = me.ValidateThingName();
                        
                        if (mInfo.bError === false) {
                            // Run the API to update the device (thing) name
                            try {
                                IOMy.apiphp.AjaxRequest({
                                    url : IOMy.apiphp.APILocation("thing"),
                                    data : {"Mode" : "EditName", "Id" : iThingID, "Name" : sThingText},
                                    onSuccess : function () {
                                        //-- IMPORT THE DEVICE LABEL FUNCTIONS MODULE --//
                                        var LabelFunctions = IOMy.functions.DeviceLabels;
                                        
                                        //===== BRING UP THE SUCCESS DIALOG BECAUSE THE API RAN SUCCESSFULLY. =====\\
                                        IOMy.common.showSuccess("Update successful.", "Success", 
                                        function () {
                                            IOMy.common.NavigationTriggerBackForward(false);
                                        }, "UpdateMessageBox");
                                        
                                        IOMy.common.bItemNameChangedMustRefresh = true;

                                        //-- RENAME THE NAME IN THE DEVICE DATA PAGE --//
                                        try {
                                            var oDevDataPage = oApp.getPage("pDeviceData");
                                            oDevDataPage.byId("NavSubHead_Title").setText(sThingText.toUpperCase());
                                        } catch (e) {
                                            jQuery.sap.log.error("Error updating the Device Data page upon refresh: "+e.message);
                                        }

                                        //-- Update all labels in the app containing this thing's display name --//
                                        LabelFunctions.updateThingLabels(iThingID, sThingText.toUpperCase());
                                        
                                        //-- REFRESH THINGS --//
                                        try {
                                            IOMy.apiphp.RefreshThingList( {
                                                onSuccess: $.proxy(function() {
                                                    //-- Flag that the Core Variables have been configured --//
                                                    IOMy.common.CoreVariablesInitialised = true;

                                                }, me)
                                            }); //-- END THINGS LIST --//
                                        } catch (e) {
                                            jQuery.sap.log.error("Error refreshing the Item List: "+e.message);
                                        }
                                    },
                                    onFail : function () {
                                        IOMy.common.showError("Update failed.", "Error");
                                        
                                        // Finish the request by enabling the edit button
                                        this.onComplete();
                                    },
                                    
                                    onComplete : function () {
                                        //------------------------------------------------------------------------------------------//
                                        // Re-enable the button once the request and the callback functions have finished executing.
                                        //------------------------------------------------------------------------------------------//
                                        thisButton.setEnabled(true);
                                    }
                                });
                            } catch (e00033) {
                                //===== BRING UP THE ERROR DIALOG BECAUSE SOMETHING'S NOT RIGHT. =====\\
                                IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                            }
                        } else {
                            IOMy.common.showError(mInfo.aErrorMessages.join("\n\n"));
                            jQuery.sap.log.error(mInfo.aErrorMessages.join("\n"));
                        }
                    }
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
            ]
        }).addStyleClass("TextCenter MarTop12px");

        var oVertBox = new sap.m.VBox({
            items : [oThingNameLabel, oThingNameField, oFormBox, oEditButton]
        }).addStyleClass("UserInputForm");

        me.aElementsToDestroy.push("devicePanel");
        var oPanel = new sap.m.Panel(me.createId("devicePanel"), {
            backgroundDesign: "Transparent",
            content: [oVertBox] //-- End of Panel Content --//
        });

        thisView.byId("page").addContent(oPanel);
    }

});