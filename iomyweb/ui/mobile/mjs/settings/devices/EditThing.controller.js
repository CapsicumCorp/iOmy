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
	
	wThingNameField			: null,
	wRoomCBox				: null,
	wEditButton				: null,
	wPanel					: null,
    
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
                // Collect values parsed from the device list.
				me.thingID = evt.data.ThingId;
                me.oThing = IOMy.common.ThingList["_"+me.thingID];
        
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
        
        //-------------------------------------------------//
        // Is the name filled out?
        //-------------------------------------------------//
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
		
		if (me.wPanel !== null) {
			me.wPanel.destroy();
		}
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
			}
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
    DrawUI : function () {
        //===============================================//
        // Declare Variables
        //===============================================//
        var me			= this;
        var thisView	= me.getView();
		var oLink		= IOMy.common.getLink(me.oThing.LinkId);
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );

        me.thingID = me.oThing.DeviceId;
        //var iLinkId = me.oThing.LinkId;
        
        //===============================================//
        // Start rendering the page
        //===============================================//
        
        //-----------------------------------------------//
        // THING NAME
        //-----------------------------------------------//
        var oThingNameLabel = new sap.m.Label({
            text : "Display Name"
        });
        
        //me.aElementsToDestroy.push(me.sThingNameField);
        me.wThingNameField = new sap.m.Input({
            value : me.oThing.DisplayName
        }).addStyleClass("width100Percent");

		//-------------------------------------------------------//
		// ROOM COMBO BOX
		//-------------------------------------------------------//
		var oRoomLabel = new sap.m.Label({
			text : "Room you wish to place this device in"
		});

		try {
			me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_1").addStyleClass("width100Percent SettingsDropDownInput");
			me.wRoomCBox.setSelectedItem(oLink.LinkRoomId);

			me.wRoomCBoxHolder = new sap.m.VBox({
				items : [me.wRoomCBox]
			}).addStyleClass("width100Percent");
		} catch (ex) {
			console.log(ex.message);
			if (ex.name === "NoRoomsFoundException") {
				me.wRoomCBoxHolder = null;
				me.wRoomCBox = null;
			}
		} finally {
			if (IOMy.functions.getNumberOfRooms() === 0) {
				oRoomLabel.setVisible(false);
			}
		}
        
        //-----------------------------------------------//
        // FORM BOX FOR SPECIFIC DEVICE TYPES
        //-----------------------------------------------//
        me.aElementsToDestroy.push("formBox");
        var oFormBox = new sap.m.VBox(me.createId("formBox"), {});

        //-----------------------------------------------//
        // UPDATE BUTTON
        //-----------------------------------------------//
        me.aElementsToDestroy.push("updateButton");
        me.wEditButton = new sap.m.VBox({
            items : [
                new sap.m.Link(me.createId("updateButton"), {
                    text : "Update",
                    press : function () {
						me.EditThing();
                    }
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
            ]
        }).addStyleClass("TextCenter MarTop12px");

        var oVertBox = new sap.m.VBox({
            items : [
				oThingNameLabel, me.wThingNameField,
				oRoomLabel, me.wRoomCBoxHolder,
				oFormBox, me.wEditButton
			]
        }).addStyleClass("UserInputForm");

        me.aElementsToDestroy.push("devicePanel");
        me.wPanel = new sap.m.Panel(me.createId("devicePanel"), {
            backgroundDesign: "Transparent",
            content: [oVertBox] //-- End of Panel Content --//
        });

        thisView.byId("page").addContent(me.wPanel);
        
        //--------------------------------------------------------------------//
        // Create the action menu
        //--------------------------------------------------------------------//
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : [
                    {
                        text: "Edit Link",
                        select:	function (oControlEvent) {
                            // Lock the button
                            this.setEnabled(false);

                            var oLink;
                            // Using the Link List found in common because the scope is global.
                            for (var j = 0; j < IOMy.common.LinkList.length; j++) {
                                if (IOMy.common.LinkList[j].LinkId == me.oThing.LinkId) {
                                    oLink = IOMy.common.LinkList[j];
                                    break;
                                }
                            }
                            
                            // Change to the edit link page parsing the correct link to the page.
                            IOMy.common.NavigationChangePage("pSettingsEditLink", {link : oLink});

                            // Unlock the button
                            this.setEnabled(true);
                        }
                    }
                ]
            })
        );
    },
	
	EditThing : function () {
		var me = this;
		me.byId("updateButton").setEnabled(false);

		var bError					= false;
		var aErrorMessages			= [];
		var sThingText				= me.wThingNameField.getValue();
		var iThingID				= me.oThing.Id;
		var mThingIdInfo			= IOMy.validation.isThingIDValid(iThingID);
		var mThingNameInfo			= me.ValidateThingName();
		
		var bEditingThing			= me.wThingNameField.getEnabled();
		var bChangingRoom;

		var iRoomID;
		
		var fnThingSuccess;
		var fnThingFail;
		
		var fnRoomSuccess;
		var fnRoomFail;
		
		var mThingChangeSettings = {};
		var mRoomChangeSettings = {};

		//==========================================================//
		// Check that the name field is filled out and that the ID
		// is valid
		//==========================================================//
		if (mThingIdInfo.bIsValid === false) {
			bError = true;
			aErrorMessages = aErrorMessages.concat(mThingIdInfo.aErrorMessages);
		}

		if (mThingNameInfo.bIsValid === false) {
			bError = true;
			aErrorMessages = aErrorMessages.concat(mThingNameInfo.aErrorMessages);
		}
		
		//--------------------------------------------------------------------//
		// Set the room ID
		//--------------------------------------------------------------------//
		if (me.wRoomCBox !== null) {
			iRoomID			= me.wRoomCBox.getSelectedKey();
			bChangingRoom	= me.wRoomCBox.getEnabled();
		} else {
			iRoomID = null;
			bChangingRoom = false;
		}
		
		if (bError === false) {
			mThingChangeSettings.thingID	= iThingID;
			mThingChangeSettings.thingName	= sThingText;
			
			mRoomChangeSettings.thingID		= iThingID;
			mRoomChangeSettings.roomID		= iRoomID;
			
			//----------------------------------------------------------------//
			// Create the onSuccess and onFail functions based on what fields
			// are enabled and/or changed.
			//----------------------------------------------------------------//
			if (bEditingThing && (bChangingRoom && iRoomID !== null) ) {
				
				//------------------------------------------------------------//
				// We're editing both the thing name and assigning it to a
				// room.
				//------------------------------------------------------------//
				mThingChangeSettings.successful = true;
				
				//------------------------------------------------------------//
				// Create the success function that will create the callback
				// functions for the room assignment function.
				//------------------------------------------------------------//
				fnThingSuccess = function () {
					//--------------------------------------------------------//
					// Create the success function that will popup a message,
					// indicating complete or partial success.
					//--------------------------------------------------------//
					mRoomChangeSettings.onSuccess = function () {
						IOMy.common.ReloadVariableRoomList(
							function () {
								var sMessage;
								
								if (mThingChangeSettings.successful === true) {
									sMessage = "Device renamed to "+sThingText+". Located in "+me.wRoomCBox.getSelectedItem().getText();
									IOMy.common.showSuccess(sMessage);
									IOMy.common.NavigationTriggerBackForward();
								} else {
									sMessage = "Device couldn't be renamed to "+sThingText+", but is now located in "+me.wRoomCBox.getSelectedItem().getText();
									
									IOMy.common.showWarning(sMessage, "", function () {
										me.byId("updateButton").setEnabled(true);
									});
								}
							},
							
							fnThingFail
						);
					};
					
					//--------------------------------------------------------//
					// Create the success function that will popup a message,
					// indicating complete or partial failure.
					//--------------------------------------------------------//
					mRoomChangeSettings.onFail = function (sErrorMessage) {
						var sMessage;
								
						if (mThingChangeSettings.successful === true) {
							sMessage = "Device renamed to "+sThingText+", but failed to move device to "+me.wRoomCBox.getSelectedItem().getText();
							
							IOMy.common.showWarning(sMessage, "", function () {
								me.byId("updateButton").setEnabled(true);
							});
							
							jQuery.sap.log.warning(sMessage);
							//IOMy.common.NavigationTriggerBackForward();
						} else {
							sMessage = "Device couldn't be renamed. Failed to move device to "+me.wRoomCBox.getSelectedItem().getText();
							
							IOMy.common.showError(sMessage, "", function () {
								me.byId("updateButton").setEnabled(true);
							});
							
							jQuery.sap.log.error(sMessage);
						}
					};
					
					//-- Call the room assignment function with the correct configuration. --//
					IOMy.devices.AssignDeviceToRoom(mRoomChangeSettings);
				};
				
				//------------------------------------------------------------//
				// Create the failure function that will report a failure and
				// then run the success function to proceed to assign a device
				// to a room
				//------------------------------------------------------------//
				fnThingFail = function (sErrMesg) {
					jQuery.sap.log.error(sErrMesg);
					mThingChangeSettings.successful = false;
					fnThingSuccess();
				};
				
				mThingChangeSettings.onSuccess	= fnThingSuccess;
				mThingChangeSettings.onFail		= fnThingFail;
				
				// Run the API to update the device (thing) name
				try {
					IOMy.functions.editThing(mThingChangeSettings);

				} catch (e00033) {
					jQuery.sap.log.error(e00033.message);
				}
			} else {
				
				if (bEditingThing) {
					fnThingFail = function () {
						me.byId("updateButton").setEnabled(true);
					};
					
					fnThingSuccess = function () {
						IOMy.common.ReloadVariableThingList(
							function () {
								IOMy.common.showSuccess("Device now located in "+me.wRoomCBox.getSelectedItem().getText());
								IOMy.common.NavigationTriggerBackForward();
							}
						);
					};
					
					mThingChangeSettings.onSuccess	= fnThingSuccess;
					mThingChangeSettings.onFail		= fnThingFail;
					
					IOMy.functions.editThing(mThingChangeSettings);
				}
				
				if (bChangingRoom && iRoomID !== null) {
					fnRoomFail = function (sMessage) {
						IOMy.common.showError(sMessage, "", function () {
							me.byId("updateButton").setEnabled(true);
						});
					};
					
					fnRoomSuccess = function () {
						IOMy.common.ReloadVariableThingList(
							function () {
								IOMy.common.showSuccess("Device now located in "+me.wRoomCBox.getSelectedItem().getText());
								IOMy.common.NavigationTriggerBackForward();
							}
						);
					};
					
					mRoomChangeSettings.onSuccess	= fnRoomSuccess;
					mRoomChangeSettings.onFail		= fnRoomFail;
					
					IOMy.devices.AssignDeviceToRoom(mRoomChangeSettings);
				}
			}
			
		} else {
			IOMy.common.showError(aErrorMessages.join("\n\n"));
			jQuery.sap.log.error(aErrorMessages.join("\n"));
		}
	}

});