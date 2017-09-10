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

$.sap.require("IOMy.widgets.AcceptCancelButtonGroup");

sap.ui.controller("mjs.settings.devices.EditThing", {
    
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
//	},

    ValidateThingName : function () {
        var me                      = this;		// Scope of this controller
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
    
    areThereChanges : function () {
        var iThingID				= this.oThing.Id;
		var sOldThingText           = IOMy.common.ThingList["_"+iThingID].DisplayName;
        var iOldRoomID              = IOMy.common.ThingList["_"+iThingID].RoomId;
        var sThingText				= this.wThingNameField.getValue();
        
		var bDifferentThingName     = sOldThingText !== sThingText;
        var bDifferentRoom;
        
        if (this.wRoomCBox === null) {
            bDifferentRoom = false;
        } else if (iOldRoomID == 1) {
            bDifferentRoom = true;
        } else {
            bDifferentRoom = iOldRoomID != this.wRoomCBox.getSelectedKey();
        }
        
        return (bDifferentThingName || bDifferentRoom);
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
		
		if (me.wRoomCBox !== null) {
			me.wRoomCBox.destroy();
		}
        
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
		var oRoom		= IOMy.common.getRoom(oLink.LinkRoomId);
		var oPremise	= IOMy.common.getPremise(oLink.PremiseId);
		
		var bAllowedToEditThing		= (oRoom.PermWrite == 1) ? true : false;
		var bAllowedToChangeRoom	= (oPremise.PermRoomAdmin == 1) ? true : false;
        
        //-- Refresh the Navigational buttons --//
        IOMy.common.NavigationRefreshButtons( me );

        me.thingID = me.oThing.DeviceId;
        
        //===============================================//
        // Start rendering the page
        //===============================================//
        
        //-----------------------------------------------//
        // THING NAME
        //-----------------------------------------------//
        var oThingNameLabel = new sap.m.Label({
            text : "Display Name"
        });
        
        me.wThingNameField = new sap.m.Input({
            value : me.oThing.DisplayName,
			enabled : bAllowedToEditThing,
            liveChange : function () {
                var bChanges = me.areThereChanges();
                me.byId("buttonBox").setAcceptEnabled(bChanges);
            }
        }).addStyleClass("width100Percent");

		//-------------------------------------------------------//
		// ROOM COMBO BOX
		//-------------------------------------------------------//
		var oRoomLabel = new sap.m.Label({
			text : "Assigned room"
		});

		if (IOMy.functions.getNumberOfRooms() === 0) {
			oRoomLabel.setVisible(false);
			me.wRoomCBoxHolder	= null;
			me.wRoomCBox		= null;
		} else {
			me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_1").addStyleClass("width100Percent SettingsDropDownInput");
			me.wRoomCBox.setSelectedKey(parseInt(oLink.LinkRoomId));
			me.wRoomCBox.setEnabled(bAllowedToChangeRoom);
            me.wRoomCBox.attachChange(
                function () {
                    var bChanges = me.areThereChanges();
                    me.byId("buttonBox").setAcceptEnabled(bChanges);
                }
            );

			me.wRoomCBoxHolder = new sap.m.VBox({
				items : [me.wRoomCBox]
			}).addStyleClass("width100Percent");
		}
        
        //-----------------------------------------------//
        // FORM BOX FOR SPECIFIC DEVICE TYPES (FOR THE FUTURE)
        //-----------------------------------------------//
        me.aElementsToDestroy.push("formBox");
        var oFormBox = new sap.m.VBox(me.createId("formBox"), {});

        //-----------------------------------------------//
        // UPDATE BUTTON
        //-----------------------------------------------//
        me.aElementsToDestroy.push("buttonBox");
        me.wEditButton = new IOMy.widgets.AcceptCancelButtonGroup(me.createId("buttonBox"), {
            
            acceptPress : function () {
                me.EditThing();
            },
            
            cancelPress : function () {
                IOMy.common.NavigationTriggerBackForward();
            }
            
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
        me.byId("buttonBox").setAcceptEnabled(false);
        
        //--------------------------------------------------------------------//
        // Create the action menu.
        //--------------------------------------------------------------------//
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : [
                    {
                        text: "Add Room",
                        select:    function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsRoomAdd", {} );
                        }
                    }
                ]
            })
        );
    
        
        me.byId("buttonBox").setAcceptEnabled(me.areThereChanges());
    },
	
	// TODO: This function belongs to the IOMy.functions library.
	EditThing : function () {
		var me = this;
		me.byId("buttonBox").setEnabled(false);
		//-- Toggle navigation buttons --//
		IOMy.common.NavigationToggleNavButtons(me, false);

		var bError					= false;
		var aErrorMessages			= [];
		var sThingText				= me.wThingNameField.getValue();
		var iThingID				= me.oThing.Id;
		var mThingIdInfo			= IOMy.validation.isThingIDValid(iThingID);
		var mThingNameInfo			= me.ValidateThingName();
        var sOldThingText           = IOMy.common.ThingList["_"+iThingID].DisplayName;
        var iOldRoomID              = IOMy.common.ThingList["_"+iThingID].RoomId;
		
		var bEditingThing			= me.wThingNameField.getEnabled();
		var bChangingRoom;

		var iRoomID;
		var sRoomText;
		
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
        // Has the thing name changed?
		//--------------------------------------------------------------------//
        if (sThingText === sOldThingText) {
            bEditingThing = false;
        }
        
		//--------------------------------------------------------------------//
		// Set the room ID
		//--------------------------------------------------------------------//
		if (me.wRoomCBox !== null) {
			iRoomID			= me.wRoomCBox.getSelectedKey();
            
            //-- Check that a different room has actually been changed. --//
            if (iRoomID == iOldRoomID) {
                bChangingRoom   = false;
            } else {
                sRoomText		= me.wRoomCBox.getSelectedItem().getText();
                bChangingRoom	= me.wRoomCBox.getEnabled();
            }
            
		} else {
			iRoomID = null;
			sRoomText = null;
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
						IOMy.common.RefreshCoreVariables({
							onSuccess : function () {
								var sMessage;
								
								if (mThingChangeSettings.successful === true) {
									sMessage = "Device renamed to "+sThingText+", and now located in "+sRoomText;
									IOMy.common.showMessage({
										text : sMessage,
										view : me.getView()
									});
									
									//-- Toggle navigation buttons --//
									IOMy.common.NavigationToggleNavButtons(me, true);
									
									IOMy.common.NavigationTriggerBackForward();
								} else {
									sMessage = "Device couldn't be renamed to "+sThingText+", but is now located in "+sRoomText;
									
									IOMy.common.showWarning(sMessage, "", function () {
										me.byId("buttonBox").setEnabled(true);
										
										//-- Toggle navigation buttons --//
										IOMy.common.NavigationToggleNavButtons(me, true);
									});
								}
							},
							
							onFail : fnThingFail
						});
					};
					
					//--------------------------------------------------------//
					// Create the success function that will popup a message,
					// indicating complete or partial failure.
					//--------------------------------------------------------//
					mRoomChangeSettings.onFail = function (sErrorMessage) {
						var sMessage;
								
						if (mThingChangeSettings.successful === true) {
							sMessage = "Device renamed to "+sThingText+", but failed to move device to "+sRoomText;
							
							IOMy.common.showWarning(sMessage, "", function () {
								me.byId("buttonBox").setEnabled(true);
								//-- Toggle navigation buttons --//
								IOMy.common.NavigationToggleNavButtons(me, true);
							});
							
							jQuery.sap.log.warning(sMessage);
						} else {
							sMessage = "Device couldn't be renamed. Failed to move device to "+sRoomText;
							
							IOMy.common.showError(sMessage, "", function () {
								me.byId("buttonBox").setEnabled(true);
								//-- Toggle navigation buttons --//
								IOMy.common.NavigationToggleNavButtons(me, true);
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
				//------------------------------------------------------------//
				// We're simply changing the name of a thing.
				//------------------------------------------------------------//
				if (bEditingThing) {
					fnThingFail = function () {
						me.byId("buttonBox").setEnabled(true);
					};
					
					fnThingSuccess = function () {
						IOMy.common.RefreshCoreVariables({
							onSuccess : function () {
								IOMy.common.showMessage({
									text : "Device renamed to \""+sThingText+"\".",
									view : me.getView()
								});
								
								IOMy.common.NavigationToggleNavButtons(me, true);
								IOMy.common.NavigationTriggerBackForward();
							}
						});
					};
					
					mThingChangeSettings.onSuccess	= fnThingSuccess;
					mThingChangeSettings.onFail		= fnThingFail;
					
					IOMy.functions.editThing(mThingChangeSettings);
				}
				
				//------------------------------------------------------------//
				// Or moving a device to another room.
				//------------------------------------------------------------//
				if (bChangingRoom && iRoomID !== null) {
					fnRoomFail = function (sMessage) {
						IOMy.common.showError(sMessage, "", function () {
							me.byId("buttonBox").setEnabled(true);
							//-- Toggle navigation buttons --//
							IOMy.common.NavigationToggleNavButtons(me, true);
						});
					};
					
					fnRoomSuccess = function () {
						IOMy.common.RefreshCoreVariables({ 
							onSuccess : function () {
								IOMy.common.showMessage({
									text : "Device is now located in "+sRoomText,
									view : me.getView()
								});
								
								IOMy.common.NavigationToggleNavButtons(me, true);
								IOMy.common.NavigationTriggerBackForward();
							}
						});
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