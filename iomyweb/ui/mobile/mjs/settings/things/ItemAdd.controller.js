/*
Title: Add Link page UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the form to add a link.
Copyright: Capsicum Corporation 2016, 2017

This file is part of the iOmy project.

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

sap.ui.controller("mjs.settings.things.ItemAdd", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
    
    aElementsToDestroy : [],
    aElementsForAFormToDestroy : [],
    
    sThingNameField : "thingNameField",
    iLinkId : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.things.ItemAdd
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				
                // Collect the link ID if one exists. Only necessary if this page
                // is accessed by the new link page after everything is created.
                if (evt.data.LinkId !== undefined) {
                    me.iLinkId = evt.data.LinkId;
                }
				
//				thisView.byId("NavSubHead_Title").setText(IOMy.common.LinkList["_"+me.iLinkId].LinkName);
                
                // Start the form creation
                me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                me.DrawUI();            // STEP 2: Draw the actual user interface
                
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.things.ItemAdd
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.things.ItemAdd
*/
//	onAfterRendering: function() {
//		var me = this;
//		sap.ui.getCore().byId("pDeviceInfo");
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.things.ItemAdd
*/
//	onExit: function() {
//
//	},

    ValidateFormData : function () {
        var me                      = this;
        var mValidationInfo         = {};
        var mLinkInfo               = {};
        var mDisplayNameInfo        = {};
        var mFormDataInfo           = {};
        var bError                  = false;
        var aErrorMessages          = [];
        var fnGetLinkType           = IOMy.functions.getLinkTypeIDOfLink;
        
        //----------------------------------------------------------//
        // Check that the link is valid
        //----------------------------------------------------------//
        mLinkInfo = me.ValidateLink();
        bError = mLinkInfo.bError;
        aErrorMessages = aErrorMessages.concat(mLinkInfo.aErrorMessages);
        
        //----------------------------------------------------------//
        // Check that the display name is valid
        //----------------------------------------------------------//
        mDisplayNameInfo = me.ValidateDisplayName();
        bError = mDisplayNameInfo.bError;
        aErrorMessages = aErrorMessages.concat(mDisplayNameInfo.aErrorMessages);
        
        if (bError === false) {
            try {
                // Which form was used?
                
                //====================================================================//
                // ONVIF SERVER
                //====================================================================//
                if (fnGetLinkType(me.byId("linkCBox").getSelectedKey()) == 6) {
                    mFormDataInfo = IOMy.devices.onvif.ValidateThingFormData(me);
                }
                
                // Now check for any errors
                if (mFormDataInfo.bError === true) {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mFormDataInfo.aErrorMessages);
                }
            } catch (e) {
                bError = true;
                aErrorMessages.push("Error 0x1000: There was an error validating form data: "+e.message);
            }
        }
        
        mValidationInfo.bError = bError;
        mValidationInfo.aErrorMessages = aErrorMessages;
        
        return mValidationInfo;
    },
    
    ValidateLink : function () {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------//
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------//
        try {
            if (me.byId("linkCBox").getSelectedKey() === "") {
                bError = true;
                aErrorMessages.push("Link is not valid");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1001: There was an error checking the link: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    ValidateDisplayName : function () {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------//
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------//
        try {
            if (me.byId(me.sThingNameField).getValue().length === 0) {
                bError = true;
                aErrorMessages.push("You must have the display name filled out.");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1002: There was an error checking the display name: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    /**
     * Fetches a map of information to use when performing an AJAX request on an API that
     * will add a link or bridge. It will produce a map that contains the URL, API
     * parameters, function to call if successful and another to call for failure. The URL
     * and the API parameters will differ depending on the link type selected.
     * 
     * @returns {map}
     */
    FetchAPIAndParameters : function () {
        var me = this;              // Preserving this scope
        var mData = {};             // Map for the AJAX request
        var sLinkType = "";
        var iLinkId = me.iLinkId;
        var fnGetLinkType = IOMy.functions.getLinkTypeIDOfLink;
        
//        try {
            //--------------------------------------------------------------------//
            // ONVIF STREAM
            //--------------------------------------------------------------------//
            if (fnGetLinkType(iLinkId) == 6) {
                sLinkType = "Onvif Stream";

                mData.url = IOMy.apiphp.APILocation("onvif");
                mData.data = {
                    "Mode" : "NewThing",
                    "LinkId" : iLinkId,
                    "StreamProfile" : me.byId("StreamProfileField").getSelectedKey(),
                    "ThumbnailProfile" : me.byId("ThumbnailProfileField").getSelectedKey(),
                    "CameraName" : me.byId("thingNameField").getValue()
                };
            }
//        } catch (e2000) {
//			// TODO: DO SOMETHING ABOUT THIS. IT IS NOT USEFUL!
//            throw "Error 0x2000: "+e2000.message;
//        }
        
        // These functions are not necessarily to do with a specific link type.
        mData.onSuccess = function (response) {
            jQuery.sap.log.debug("Success: "+JSON.stringify(response));

            try {
                //-- REFRESH LINK LIST --//
                IOMy.common.RefreshCoreVariables({
					
					onSuccess : function () {
						IOMy.common.showMessage({
							text : me.byId("thingNameField").getValue()+" successfully created",
							view : me.getView()
						});
						
						IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
						IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
					}
				});
						
            } catch (e) {
				// TODO: Check to see whether this is needed and if so, how to handle this error better.
                jQuery.sap.log.error("Error refreshing core variables: "+e.message);
                IOMy.common.showWarning(sLinkType+" successfully created but there was an error refreshing core variables: "+e.message, "Errors",
					function () {
						IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
						IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
					}
				);
            }
        };
        
        mData.onFail = function (error) {
            jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            IOMy.common.showError("Error creating "+sLinkType+":\n\n"+error.responseText);
            
            // Re-enable the add link button
            me.byId("addButton").setEnabled(true);
			IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
        };
        
        return mData;
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
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
			}
        }
        
        // Clear the array
        me.aElementsForAFormToDestroy = [];
    },

    /**
     * Constructs the user interface for the form to add a thing.
     */
    DrawUI : function() {
        //===============================================//
        // DECLARE VARIABLES
        //===============================================//
        var me = this;
        var thisView = me.getView();
        // UI5 Objects used in all link forms
        var oLinkLabel;
        var oLinkCBox;
        var oAddButton; // Button to add link
        var oFormBox, oVertBox, oPanel; // Container elements
        
        //=======================================================//
        // CONSTRUCT ELEMENTS
        //=======================================================//
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );
        
        //-------------------------------------------------------//
        // LINK COMBO BOX
        //-------------------------------------------------------//
        oLinkLabel = new sap.m.Label({
            text : "Device to connect to"
        });
        
        oLinkCBox = IOMy.widgets.getLinkSelector(me.createId("linkCBox"), me.iLinkId).addStyleClass("width100Percent SettingsDropDownInput");
        
        //-----------------------------------------------//
        // THING NAME
        //-----------------------------------------------//
        var oThingNameLabel = new sap.m.Label({
            text : "Display Name"
        });
        
        me.aElementsToDestroy.push(me.sThingNameField);
        var oThingNameField = new sap.m.Input(me.createId(me.sThingNameField), {
            value : ""
        }).addStyleClass("width100Percent");
        
        //-------------------------------------------------------//
        // FORM BOX
        //-------------------------------------------------------//
        me.aElementsToDestroy.push("formBox");
        oFormBox = new sap.m.VBox(me.createId("formBox"),{});
        
        //=======================================================//
        // PLACE ALL THE PIECES TOGETHER
        //=======================================================//
        
        me.aElementsToDestroy.push("mainBox");
        oVertBox = new sap.m.VBox(me.createId("mainBox"),{
            items : [
                oLinkLabel,oLinkCBox,oThingNameLabel,oThingNameField,oFormBox
            ]
        }).addStyleClass("UserInputForm");
        
        //-------------------------------------------------------//
        // NEW ITEM BUTTON
        //-------------------------------------------------------//
        me.aElementsToDestroy.push("addButton");
        oAddButton = new sap.m.VBox({
            items : [
                new sap.m.Link(me.createId("addButton"), {
                    text : "Create",
                    enabled : false,
                    //-------------------------------------------------------//
                    // Add the thing
                    //-------------------------------------------------------//
                    press : function() {
                        var thisButton = this; // Captures the scope of the button.
                        thisButton.setEnabled(false); // Lock the button
						IOMy.common.NavigationToggleNavButtons(me, false); // Disable the navigation buttons.
                        
                        try {
                            // Error checking variables
                            var bError                  = false;
                            var mInfo                   = false;
                            var aErrorMessages          = [];
                            var sErrorMessage           = "";
                        } catch (e) {
                            bError = true;
                            jQuery.sap.log.error("Error 0x1000: There was an error declaring variables: "+e.message);
                        }
                
                        //=== VALIDATE FORM DATA ===//
                        mInfo = me.ValidateFormData();
                        
                        if (mInfo.bError === false) {
                            //------------------------------------------------//
                            // Try to add the thing
                            //------------------------------------------------//
                            try {
                                var mData = me.FetchAPIAndParameters();
                                IOMy.apiphp.AjaxRequest(mData);
                            } catch (e) {
                                bError = true; // No.
                                aErrorMessages.push("Error 0x1005: There was an error adding a device: "+e.message);
                                
                                if (aErrorMessages.length === 1) {
                                    sErrorMessage = "There was an error: \n\n"+aErrorMessages.join('\n');
                                } else {
                                    sErrorMessage = "There were "+aErrorMessages.length+" errors:\n\n"+aErrorMessages.join('\n\n');
                                }

                                jQuery.sap.log.error(sErrorMessage);
                                IOMy.common.showError(sErrorMessage, "Error", function () {
                                    thisButton.setEnabled(true); // Unlock the button
									IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
                                });
                            }
                        } else {
                            if (mInfo.aErrorMessages.length === 1) {
                                sErrorMessage = "There was an error: \n\n"+mInfo.aErrorMessages.join('\n');
                            } else {
                                sErrorMessage = "There were "+mInfo.aErrorMessages.length+" errors:\n\n"+mInfo.aErrorMessages.join('\n\n');
                            }

                            jQuery.sap.log.error(sErrorMessage);
                            IOMy.common.showError(sErrorMessage, "Invalid data", function () {
                                thisButton.setEnabled(true); // Unlock the button
                            });
                        }
                    }
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
            ]
        }).addStyleClass("TextCenter MarTop12px");
        oVertBox.addItem(oAddButton);
        
        //=======================================================//
        // HAVE THE COMBO BOX DRAW A FORM ACCORDING TO THE LINK TYPE OF THE 
        // SELECTED LINK.
        //=======================================================//
        oLinkCBox.attachChange(function () {
            me.byId("addButton").setEnabled(false); // Lock the add button.
            this.setEnabled(false);                 // Lock this Combo Box
            var iLinkId = this.getSelectedKey();
            // Grab the link type ID
            var iLinkTypeId = IOMy.functions.getLinkTypeIDOfLink(iLinkId);
            
            // Erase the old set of fields
            me.DestroySpecificFormUI();
            
            //==---------------------------------==//
            // Choose a form to load
            //==---------------------------------==//
            
            //---- Onvif Stream ----//
            if (iLinkTypeId == 6) {
                IOMy.devices.onvif.CreateThingForm(me, iLinkId, oFormBox, [me.byId("addButton"), this], [this]);
            //---- Philips Hue ----//
            } else if (iLinkTypeId == 7) {
                this.setEnabled(true); // Unlock this combo box.
                me.byId("addButton").setEnabled(false);
                IOMy.common.showMessage(me.byId("linkCBox").getSelectedItem().getText()+" should have already added all the light bulbs it could detect.");
            } else {
                this.setEnabled(true); // Unlock this combo box.
                me.byId("addButton").setEnabled(true); // Unlock the add button
            }
//            //---- Philips Hue Bridge ----//
//            else if (iLinkTypeId == 7)
//                me.CreatePhilipsHueBridgeForm();
        });
        
        //====================================================================//
        // Bring up the right form using the link type of the currently selected
        // form.
        //====================================================================//
        
        //==---------------------------------==//
        // Choose a form to load
        //==---------------------------------==//
        var iLinkTypeId = IOMy.functions.getLinkTypeIDOfLink(oLinkCBox.getSelectedKey());
        
        //---- Onvif Stream ----//
        if (iLinkTypeId == 6) {
            IOMy.devices.onvif.CreateThingForm(me, me.iLinkId, oFormBox, [me.byId("addButton")], []);
        }
		
        me.aElementsToDestroy.push("panel");
        oPanel = new sap.m.Panel(me.createId("panel"), {
            content : [oVertBox]
        });
        
        thisView.byId("page").addContent(oPanel);
    },
    

});