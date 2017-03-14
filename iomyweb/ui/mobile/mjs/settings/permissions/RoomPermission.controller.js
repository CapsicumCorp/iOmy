/*
Title: Room Permissions Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a table of rooms that holds their permissions settings
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

sap.ui.controller("mjs.settings.permissions.RoomPermission", {
    
    //========================================================================//
    // Properties
    //========================================================================//
    
    aElementsToDestroy      : [],
    
    // Flags
    bRefreshUI              : false,
    roomsExpanded           : {},
    roomsChanged            : {},
    roomsToUpdate           : {},
    
    aErrors                 : [],
    
    // Widgets
    wUserLabel                  : null,
    wUserSelectBox              : null,
    wPremiseLabel               : null,
    wPremiseSelectBox           : null,
    wRoomPermissionHeading      : null,
    wRoomList                   : null,
    wRoomListHeading            : null,
    wPanel                      : null,
    wReadPermissionBox          : null,
    wDataReadPermissionBox      : null,
    wWritePermissionBox         : null,
    wStateTogglePermissionBox   : null,
    wApplyButton                : null,
    aRoomEntries                : [],
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.permissions.RoomPermission
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				
                me.aErrors = []; // Clear the error list.
                // Start the form creation
                me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                me.DrawUI();            // STEP 2: Draw the actual user interface               
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.permissions.RoomPermission
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.permissions.RoomPermission
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.permissions.RoomPermission
*/
//	onExit: function() {
//
//	},

    ShowCurrentPermissions : function (iRoomId, sRoomName) {
        //-----------------------------------------------------------//
        // Fetch the permissions
        //-----------------------------------------------------------//
        var me = this;
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupRoomPerms",
                "UserId" : me.wUserSelectBox.getSelectedItem().getKey(),
                "RoomId" : iRoomId
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    try {
                        var data = data.Data;
                        var sPermissions = me.wUserSelectBox.getSelectedItem().getText() + "...\n\n";
                        var aPermissions = [];
                        
                        //----------------------------------------------------//
                        // Basic read access (see that it exists) permission
                        //----------------------------------------------------//
                        if (data.Read == 1) {
                            aPermissions.push("Can view the room.");
                            
                            //----------------------------------------------------//
                            // Permission to modify the room details
                            //----------------------------------------------------//
                            if (data.Write == 1) {
                                aPermissions.push("Can modify the information.");
                            }
                            
                            //----------------------------------------------------//
                            // Permission to read information about devices on a
                            // room.
                            //----------------------------------------------------//
                            if (data.DataRead == 1) {
                                aPermissions.push("Can view information about the devices in "+sRoomName+".");
                                
                                //----------------------------------------------------//
                                // Permission to manage devices in a room
                                //----------------------------------------------------//
                                if (data.StateToggle == 1 /*&&data.Write == 1*/) {
                                    aPermissions.push("Can manage devices in "+sRoomName+".");
                                }
                            }
                            
                        } else {
                            aPermissions.push("Has no access");
                        }
                        
                        //-----------------------------------------------------------//
                        // Bring up a popup showing what the current user can do with
                        // the given room
                        //-----------------------------------------------------------//
                        sap.m.MessageBox.show(
                            sPermissions + aPermissions.join("\n"),
                            {
                                icon: sap.m.MessageBox.Icon.INFORMATION,
                                title: "In "+sRoomName,
                                actions: sap.m.MessageBox.Action.CLOSE,
                                styleClass : "HelpDialog",
                                onClose: function () {}
                            }
                        );
                    } catch (e) {
                        jQuery.sap.log.error("There was an error loading the current permissions: "+e.message);
                    }
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error loading the current permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error loading the current permissions", "Error");
            }
            
        });
        
    },

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        //-- Wipe out any elements with IDs that didn't get destroyed during the full wipe. --//
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            if (me.byId(me.aElementsToDestroy[i]) !== undefined) {
                me.byId(me.aElementsToDestroy[i]).destroy();
            }
        }
        
        //-- Clear Arrays --//
        me.aElementsToDestroy = [];
        me.aRoomEntries = [];
    },
    
    DrawUI : function () {
        //====================================================================//
        // Variables, scope, and imports
        //====================================================================//
        var me                      = this;
        var thisView                = me.getView();
        var getPremiseSelector      = IOMy.widgets.getPremiseSelector;
        var getPermissionSelectBox  = IOMy.widgets.getPermissionSelectBox;
        
        //====================================================================//
        // Create the permission options select boxes and attach functions to
        // them once created.
        //====================================================================//
        me.wReadPermissionBox          = getPermissionSelectBox(me.createId("ReadAccessPermission"));
        me.wDataReadPermissionBox      = getPermissionSelectBox(me.createId("ViewInfoPermission"));
        me.wWritePermissionBox         = getPermissionSelectBox(me.createId("EditRoomPermission"));
        me.wStateTogglePermissionBox   = getPermissionSelectBox(me.createId("ToggleStatePermission"));
        
        //--------------------------------------------------------------------//
        // Functions
        //--------------------------------------------------------------------//
        me.wReadPermissionBox.attachSelect(
            function () {
                // If "No" is selected
                if (this.getSelectedIndex() === 1) {
                    me.wDataReadPermissionBox.setEnabled(false);
                    me.wWritePermissionBox.setEnabled(false);
                    me.wStateTogglePermissionBox.setEnabled(false);
                // If "Yes" is selected
                } else {
                    me.wDataReadPermissionBox.setEnabled(true);
                    me.wWritePermissionBox.setEnabled(true);
                    me.wStateTogglePermissionBox.setEnabled(true);
                }
            }
        );

        me.wDataReadPermissionBox.attachSelect(
            function () {
                // If "No" is selected
                if (this.getSelectedIndex() === 1) {
                    me.wStateTogglePermissionBox.setEnabled(false);
                // If "Yes" is selected
                } else {
                    me.wStateTogglePermissionBox.setEnabled(true);
                }
            }
        );
        
        me.wUserLabel = new sap.m.Label({
            text : "User"
        }).addStyleClass("PaddingToMatchButtonText");
        
        me.wUserSelectBox = new sap.m.Select({
            width: "100%"
        });
        
        me.wPremiseLabel = new sap.m.Label({
            text : "Premise"
        }).addStyleClass("PaddingToMatchButtonText");
        
        me.wPremiseSelectBox = getPremiseSelector(me.createId("premiseBox")).addStyleClass("SettingsDropdownInput width100Percent");
        
        //=============================================//
        // Create the permission form for the room
        //=============================================//
        me.wRoomPermissionHeading = new sap.m.VBox({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Permissions"
                        }).addStyleClass("PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader ListItem BorderTop");
        
        me.wRoomPermissions = new sap.m.VBox(me.createId("roomPermissions"), {
            items : [
                new sap.m.VBox({
					layoutData : new sap.m.FlexItemData({
						growFactor : 1
					}),
                    items : [
                        //-------------------------------------//
                        // Basic read access (see that it exists)
                        // permission
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user access?"
                        }),
                        me.wReadPermissionBox,
                        //-------------------------------------//
                        // Permission to read information about a
                        // room.
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to view room details?"
                        }),
                        me.wDataReadPermissionBox,
                        //-------------------------------------//
                        // Permission to modify the room
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to modify room?"
                        }),
                        me.wWritePermissionBox,
                        //-------------------------------------//
                        // Permission to manage devices in a room
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to manage devices?"
                        }),
                        me.wStateTogglePermissionBox
                    ]
                }).addStyleClass("MarAll8px")
            ]
        }).addStyleClass("ListItem");
        
        me.wRoomListHeading = new sap.m.VBox({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Apply Permissions To"
                        }).addStyleClass("PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader ListItem");
        
        me.wRoomList = new sap.m.VBox({
			layoutData : new sap.m.FlexItemData({
						growFactor : 1
					}),
            items : [me.wRoomListHeading]
        }).addStyleClass("");
        
        //--------------------------------------------------------------------//
        // Apply Button
        //--------------------------------------------------------------------//
        if (me.wApplyButton !== null) {
            me.wApplyButton.destroy();
        }
        
        me.wApplyButton = new sap.m.Link({
            enabled : true,
            text : "Apply",
            press : function () {
                var aRoomIDs = [];
                
                $.each(me.roomsToUpdate, function (sIndex, mInfo) {
                    if (sIndex !== undefined && sIndex !== null && mInfo !== undefined && mInfo !== null) {
                        if (mInfo.update === true) {
                            aRoomIDs.push(mInfo.Id);
                        }
                    }
                });
                
                if (aRoomIDs.length > 0) {
                    me.UpdatePermissionsForRoom(me.wUserSelectBox.getSelectedKey(), 0, aRoomIDs);
                } else {
                    IOMy.common.showError("You must select at least one room to apply the new permissions to.");
                }
            }
        }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink");
        
		//-- Where the page gets created --//
        me.wPanel = new sap.m.Panel({
            content : [
                //--------------------------//
                // Top section
                //--------------------------//
                new sap.m.VBox({
					layoutData : new sap.m.FlexItemData({
						growFactor : 1
					}),
                    items : [
                        // Label for the user select box
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [
                                new sap.m.VBox({
                                    items : [ me.wUserLabel ]
                                })
                            ]
                        }).addStyleClass("ConsistentMenuHeader ListItem "),
                        // User select box
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [me.wUserSelectBox]
                        }).addStyleClass("PadLeft8px PadRight8px"),
                        
                        // Label for the premise select box
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [
                                new sap.m.VBox({
                                    items : [ me.wPremiseLabel ]
                                })
                            ]
                        }).addStyleClass("ConsistentMenuHeader BorderTop ListItem"),
                        // Premise select box
                        new sap.m.VBox({
                            items : [me.wPremiseSelectBox]
                        }).addStyleClass("PadLeft8px PadRight8px")
                    ]
                }),
			
                //--------------------------//
                // Middle section
                //--------------------------//
                new sap.m.VBox({
					layoutData : new sap.m.FlexItemData({
						growFactor : 1
					}),
                    items : [
                        // Room Permission form heading
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [me.wRoomPermissionHeading]
                        }),
                        // Room Permission form
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [me.wRoomPermissions]
                        }),
						
                        // List of rooms
                        new sap.m.VBox({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
                            items : [me.wRoomList]
                        })
						
                    ]
                }),
                //--------------------------//
                // Apply button
                //--------------------------//
                new sap.m.VBox({
                    items : [me.wApplyButton]
                }).addStyleClass("RoomPermissionsApplyButton")
				
            ]
        }).addStyleClass("MasterPanel UserInputForm PanelNoPadding PadTop3px PadBottom15px");
        
        // Populate the users select box with the viewable users
        try {
            IOMy.widgets.getListOfUsersForRoomPermissions(me.wUserSelectBox, me.wPremiseSelectBox.getSelectedKey(),
                function () {
                    //------------------------------------------------------------//
                    // Draw the room list complete with the permissions settings.
                    //------------------------------------------------------------//
                    var sUrl = IOMy.apiodata.ODataLocation("premise_perm_rooms");
                    var aColumns        = ["ROOMS_PK","ROOMS_NAME"];
                    var aFilter         = [];
                    var aOrderBy        = [];
                    
                    IOMy.apiodata.AjaxRequest({
                        Url             : sUrl,
                        Columns         : aColumns,
                        WhereClause     : aFilter,
                        OrderByClause   : aOrderBy,
                        
                        onSuccess : function (responseType, data) {
                            var premisePermRoomsRequest = this;
                            var mRoomInfo = {};
                            
                            //-- Wipe out any elements with IDs that didn't get destroyed during the full wipe. --//
                            for (var i = 0; i < me.aElementsToDestroy.length; i++) {
                                if (me.byId(me.aElementsToDestroy[i]) !== undefined) {
                                    me.byId(me.aElementsToDestroy[i]).destroy();
                                }
                            }
                            
                            for (var i = 0; i < data.length; i++) {
                                mRoomInfo = data[i];
                                mRoomInfo["Index"] = "_"+mRoomInfo.ROOMS_PK;
                                me.DrawRoomEntry(mRoomInfo);
                            }
                            
                            premisePermRoomsRequest.onComplete();
                        },
                        
                        onFail : function (response) {
                            var premisePermRoomsRequest = this;
                            premisePermRoomsRequest.onComplete();
                        },
                        
                        onComplete : function () {
                            thisView.byId("page").addContent(me.wPanel);
                        }
                    });
                    
//                    $.each(IOMy.common.RoomsList["_"+me.wPremiseSelectBox.getSelectedKey()],
//                        function (sIndex, mRoomInfo) {
//
//                            if (sIndex !== undefined && sIndex !== null &&
//                                    mRoomInfo !== undefined && mRoomInfo !== null &&
//                                    sIndex !== "Unassigned")
//                            {
//                                mRoomInfo["Index"] = sIndex;
//                                me.DrawRoomEntry(mRoomInfo);
//                            }
//
//                        }
//                    );
//            
//                    thisView.byId("page").addContent(me.wPanel);
                },

                //--------------------------------//
                // Run this function if there's a problem
                //--------------------------------//
                function (sError) {
                    // Show an error message and go back to the previous page
                    // once closed.
                    IOMy.common.showError(sError, "", function () {
                        IOMy.common.NavigationTriggerBackForward(false);
                    });
                }
            );
            
        } catch (e) {
            IOMy.common.showError(e.message, "Error");
        }
    },
    
    /**
     * Takes a room object/map and gathers data from and uses it to create an
     * entry in the room list table on the permissions page.
     * 
     * @param {type} mRoomInfo              Map containing the current room information
     */
    DrawRoomEntry : function (mRoomInfo) {
        var me = this;
        
        //====================================================================//
        // Define vital functions as variables to use for press events.
        //====================================================================//
        var fnSetRoomToUpdate = function (oEvent) {
            
            if (me.roomsToUpdate[mRoomInfo.Index].update !== true) {
                me.roomsToUpdate[mRoomInfo.Index].update = true;
            } else {
                me.roomsToUpdate[mRoomInfo.Index].update = false;
            }
            
            //console.log(me.roomsToUpdate);
        };
        
        var fnShowPermissionChanged = function () {
            //----------------------------------------------------------------//
            // Indicate that the permissions have changed and are ready to be
            // saved.
            //----------------------------------------------------------------//
            me.byId("roomExpandIcon"+mRoomInfo.Index).setIcon("sap-icon://GoogleMaterial/check_circle");
            if (me.roomsChanged[mRoomInfo.Index] === false) {
                me.roomsChanged[mRoomInfo.Index] = true;
            }
        };
        
        //=============================================//
        // Create the entry in the room list
        //=============================================//
        me.aElementsToDestroy.push("checkbox"+mRoomInfo.Index);
        me.aElementsToDestroy.push("roomName"+mRoomInfo.Index);
        me.aElementsToDestroy.push("roomEntry"+mRoomInfo.Index);
        var oEntry = new sap.m.HBox(me.createId("roomEntry"+mRoomInfo.Index), {
            items : [
                // === CHECK BOX === //
                new sap.m.VBox({
					layoutData : new sap.m.FlexItemData({
						growFactor : 0
					}),
                    items : [
                        new sap.m.CheckBox(me.createId("checkbox"+mRoomInfo.Index), {
                            icon : "sap-icon://navigation-down-arrow",
                            select : fnSetRoomToUpdate
                        }).addStyleClass("ButtonNoBorder IOMYButton ButtonIconGreen TextSize20px")
                    ]
                }).addStyleClass("minwidth70px"),
                
                // === ROOM === //
                new sap.m.VBox({
					layoutData : new sap.m.FlexItemData({
						growFactor : 1
					}),
                    items : [
                        new sap.m.Button(me.createId("roomName"+mRoomInfo.Index), {
                            text : mRoomInfo.ROOMS_NAME,
                            press : function () {
                                me.ShowCurrentPermissions(mRoomInfo.ROOMS_PK, mRoomInfo.ROOMS_NAME);
                            }
                        }).addStyleClass("ButtonNoBorder PremiseOverviewRoomButton IOMYButton TextLeft TextSize16px")
                    ]
                }).addStyleClass("TextOverflowEllipsis"),
            ]
        }).addStyleClass("ListItem minheight20px ");
        
        //==============================================================//
        // Hide the permissions forms, set the expanded and changed
        // flags, and the right arrow icon on the expand button
        //==============================================================//
        me.roomsExpanded[mRoomInfo.Index] = false;
        me.roomsChanged[mRoomInfo.Index] = false;
        me.roomsToUpdate[mRoomInfo.Index] = {
            update : false,
            Id : mRoomInfo.ROOMS_PK
        };
        
        //==============================================================//
        // Add the entry and its permissions form into the entries list
        //==============================================================//
        me.aRoomEntries.push({
            entry   : oEntry
        });
        
        me.wRoomList.addItem(oEntry);
    },
    
    UpdatePermissionsForRoom : function (iUserId, iPos, aRoomIDs) {
        var me = this;
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        //==============================================================//
        // Fetch the permission status
        //==============================================================//
        var sRead;
        var sDataRead;
        var sWrite;
        var sStateToggle;
        
        if (me.wReadPermissionBox.getEnabled()) {
            sRead = me.wReadPermissionBox.getSelectedButton().getText();
        }
        
        if (me.wDataReadPermissionBox.getEnabled()) {
            sDataRead = me.wDataReadPermissionBox.getSelectedButton().getText();
        } else {
            sDataRead = "No";
        }
        
        if (me.wWritePermissionBox.getEnabled()) {
            sWrite = me.wWritePermissionBox.getSelectedButton().getText();
        } else {
            sWrite = "No";
        }
        
        if (me.wStateTogglePermissionBox.getEnabled()) {
            sStateToggle = me.wStateTogglePermissionBox.getSelectedButton().getText();
        } else {
            sStateToggle = "No";
        }
        
        var tiRead          = sRead === "Yes" ? 1 : 0;
        var tiDataRead      = sDataRead === "Yes" ? 1 : 0;
        var tiWrite         = sWrite === "Yes" ? 1 : 0;
        var tiStateToggle   = sStateToggle === "Yes" ? 1 : 0;
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "UpdateRoomPerms",
                "UserId" : iUserId,
                "RoomId" : aRoomIDs[iPos],
                "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+"}"
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    // Reset the changed flag for this room
                    me.roomsChanged["_"+aRoomIDs[iPos]] = false;
                } else {
                    jQuery.sap.log.error("There was an error updating the room permissions: "+data.ErrMesg);
                    me.aErrors.push(data.ErrMesg);
                    //IOMy.common.showError("There was an error updating the room permissions", "Error");
                }
                this.onComplete();
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error updating the room permissions: "+JSON.stringify(response));
                me.aErrors.push(JSON.stringify(response));
                this.onComplete();
            },
            
            onComplete : function () {
                iPos++;
                
                //------------------------------------------------------------//
                // Run this function again if there are any more room IDs to 
                // process.
                //------------------------------------------------------------//
                if (iPos < aRoomIDs.length) {
                    me.UpdatePermissionsForRoom(iUserId, iPos, aRoomIDs);
                } else {
                    
                    //--------------------------------------------------------//
                    // If all rooms failed to have new permissions set, then
                    // report it as an error.
                    //--------------------------------------------------------//
                    if (me.aErrors.length === aRoomIDs.length) {
                        IOMy.common.showError("There was an error updating the room permissions", "Error");
                    }
                    //--------------------------------------------------------//
                    // If some rooms failed to have new permissions set, then
                    // report it as a warning, but mention that some were 
                    // successfully.
                    //--------------------------------------------------------//
                    else if (me.aErrors.length > 0 && me.aErrors.length < aRoomIDs.length) {
                        IOMy.common.ReloadCoreVariables(
                            function () {
                                IOMy.common.showWarning("Some permissions updated successfully, but some could not be updated.\n\n"+me.aErrors.join('\n'), "Error");
                            }
                        );
                    }
                    //--------------------------------------------------------//
                    // If some rooms failed to have new permissions set, then
                    // report it as a warning, but mention that some were 
                    // successfully.
                    //--------------------------------------------------------//
                    else if (me.aErrors.length === 0) {
                        IOMy.common.ReloadCoreVariables(
                            function () {
                                IOMy.common.showSuccess("Room Permissions updated successfully!", "Success");
                            }
                        );
                    }
                    
                    // Clear error log
                    me.aErrors = [];
                }
            }
            
        });
    }
    
});