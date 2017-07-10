/*
Title: Premise Permissions Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a table of premises that holds their permissions settings
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

sap.ui.controller("mjs.settings.permissions.PremisePermission", {
    
    //========================================================================//
    // Properties
    //========================================================================//
    
    aElementsToDestroy  : [],
	iUserId             : null,
    
    // Flags
    bRefreshUI          : false,
    premisesExpanded    : {},
    premisesChanged     : {},
    
    // Widgets
    wUserLabel                  : null,
    wUserSelectBox              : null,
    wPremiseLabel               : null,
    wPremiseSelectBox           : null,
    wPremisePermissionHeading   : null,
    wPremisePermissions         : null,
    wReadPermissionBox          : null,
    wDataReadPermissionBox      : null,
    wWritePermissionBox         : null,
    wStateTogglePermissionBox   : null,
    wRoomAdminPermissionBox     : null,
    wApplyButton                : null,
    wPanel                      : null,
    aPremiseEntries             : [],
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.permissions.PremisePermission
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				
                // Start the form creation
                me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                me.DrawUI();            // STEP 2: Draw the actual user interface   
				
				if (evt.data.userID !== undefined && evt.data.userID !== null) {
					me.iUserId = evt.data.userID;
				} else {
					me.iUserId = null;
				}
				
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.permissions.PremisePermission
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.permissions.PremisePermission
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.permissions.PremisePermission
*/
//	onExit: function() {
//
//	},

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        
        //-- Destroy the main VBox. --//
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
        me.aPremiseEntries = [];
    },
    
    DrawUI : function () {
        //====================================================================//
        // Variables, scope, and imports
        //====================================================================//
        var me                      = this;
        var thisView                = me.getView();
        var getPremiseSelector      = IOMy.widgets.getPremiseSelector;
        var sDialogTitle            = "";
        
        try {
            //====================================================================//
            // User field
            //====================================================================//
            me.wUserLabel = new sap.m.Label({
                text : "User"
            }).addStyleClass("PaddingToMatchButtonText");

            me.wUserSelectBox = new sap.m.Select({
                width : "100%"
            });

            //====================================================================//
            // Premise Field
            //====================================================================//
            me.wPremiseLabel = new sap.m.Label({
                text : "Premise"
            }).addStyleClass("PaddingToMatchButtonText");

            me.wPremiseSelectBox = getPremiseSelector(me.createId("premiseBox")).addStyleClass("SettingsDropdownInput width100Percent");

            //====================================================================//
            // Main containing element
            //====================================================================//
            me.wPanel = new sap.m.Panel({
                content : [
                    new sap.m.VBox({
                        items : [
                            // Label for the user select box
                            new sap.m.VBox({
                                items : [
                                    new sap.m.VBox({
                                        items : [ me.wUserLabel ]
                                    })
                                ]
                            }).addStyleClass("ConsistentMenuHeader ListItem width100Percent"),
                            new sap.m.VBox({
                                items : [me.wUserSelectBox]
                            }).addStyleClass("PadLeft8px PadRight8px"),

                            // Label for the premise select box
                            new sap.m.VBox({
                                items : [
                                    new sap.m.VBox({
                                        items : [ me.wPremiseLabel ]
                                    })
                                ]
                            }).addStyleClass("ConsistentMenuHeader BorderTop ListItem width100Percent"),
                            new sap.m.VBox({
                                items : [me.wPremiseSelectBox]
                            }).addStyleClass("PadLeft8px PadRight8px")
                        ]
                    }).addStyleClass("")
                ]
            }).addStyleClass("MasterPanel UserInputForm PanelNoPadding PadTop3px PadBottom15px");
            
            // Populate the users select box with the viewable users
            IOMy.widgets.getListOfUsersForPremisePermissions(me.wUserSelectBox, me.wPremiseSelectBox.getSelectedKey(),
                //--------------------------------//
                // Run this function if successful
                //--------------------------------//
                function () {
                    //------------------------------------------------------------//
                    // Draw the premise list complete with the permissions settings.
                    //------------------------------------------------------------//
                    $.each(IOMy.common.PremiseList, function (sI, mPremise) {
						//console.log("mPremise.Id                            === "+mPremise.Id);
                        //console.log("me.wPremiseSelectBox.getSelectedKey()  === "+me.wPremiseSelectBox.getSelectedKey());
                        if (mPremise.Id == me.wPremiseSelectBox.getSelectedKey()) {

                            mPremise["Index"] = "_"+mPremise.Id;
                            //console.log(JSON.stringify(mPremise));
                            me.DrawPremiseEntry(mPremise);

                        }
					});
                    
                    me.wUserSelectBox.setSelectedKey(me.iUserId);
                    me.FetchPermissionsForPremise(me.wUserSelectBox.getSelectedKey(), me.wPremiseSelectBox.getSelectedKey());
                    
                    thisView.byId("page").addContent(me.wPanel);
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
        } catch (err) {
            
            //----------------------------------------------------------------//
            // We expect a NoPremisesVisibleException to be thrown at some point.
            //----------------------------------------------------------------//
            if (err.name === "NoPremisesVisibleException") {
                sDialogTitle = "No premises available";
                // Show an error message and go back to the previous page
                // once closed.
                IOMy.common.showError(err.message + " You will not be able to edit the permissions until you are granted permission to do so.", sDialogTitle, function () {
                    IOMy.common.NavigationTriggerBackForward(false);
                });
            } else {
                sDialogTitle = "";
            }
        }
    },
    
    /**
     * Takes a premise object/map and gathers data from and uses it to create an
     * entry in the premise list table on the permissions page.
     * 
     * @param {type} mPremiseInfo              Map containing the current premise information
     */
    DrawPremiseEntry : function (mPremiseInfo) {
        var me = this;
        var getPermissionSelectBox = IOMy.widgets.getPermissionSelectBox;
        
        //====================================================================//
        // Define vital functions as variables to use for press events.
        //====================================================================//
        
        //--------------------------------------------------------------------//
        // Apply Button
        //--------------------------------------------------------------------//
        if (me.wApplyButton !== null) {
            me.wApplyButton.destroy();
        }
        
        me.wApplyButton = new sap.m.Link({
            enabled : false,
            text : "Apply",
            press : function () {
                this.setEnabled(false);
                if (me.premisesChanged[mPremiseInfo.Index] === true) {
                    me.UpdatePermissionsForPremise(me.wUserSelectBox.getSelectedKey(), mPremiseInfo.Id);
                }
            }
        }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink");
        
        var fnShowPermissionChanged = function () {
            //----------------------------------------------------------------//
            // Indicate that the permissions have changed and are ready to be
            // saved.
            //----------------------------------------------------------------//
            //me.byId("premiseExpandIcon"+mPremiseInfo.Index).setIcon("sap-icon://GoogleMaterial/check_circle");
            if (me.premisesChanged[mPremiseInfo.Index] === false) {
                me.premisesChanged[mPremiseInfo.Index] = true;
                me.wApplyButton.setEnabled(true);
            }
        };
        
        //====================================================================//
        // Create the permission options select boxes and attach functions to
        // them once created.
        //====================================================================//
        me.wReadPermissionBox          = getPermissionSelectBox();
        me.wDataReadPermissionBox      = getPermissionSelectBox();
        me.wWritePermissionBox         = getPermissionSelectBox();
        me.wStateTogglePermissionBox   = getPermissionSelectBox();
        me.wRoomAdminPermissionBox     = getPermissionSelectBox();
        
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
                    me.wRoomAdminPermissionBox.setEnabled(false);
                // If "Yes" is selected
                } else {
                    me.wDataReadPermissionBox.setEnabled(true);
                    me.wWritePermissionBox.setEnabled(true);
                    me.wStateTogglePermissionBox.setEnabled(true);
                    me.wRoomAdminPermissionBox.setEnabled(true);
                }
                
                fnShowPermissionChanged();
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
                
                fnShowPermissionChanged();
            }
        );

        me.wWritePermissionBox.attachSelect(
            fnShowPermissionChanged
        );
        me.wStateTogglePermissionBox.attachSelect(
            fnShowPermissionChanged
        );
        me.wRoomAdminPermissionBox.attachSelect(
            fnShowPermissionChanged
        );
        
        //=============================================//
        // Create the permission form for the premise
        //=============================================//
        if (me.wPremisePermissionHeading !== null) {
            me.wPremisePermissionHeading.destroy();
        }
        
        if (me.wPremisePermissions !== null) {
            me.wPremisePermissions.destroy();
        }
        
        me.wPremisePermissionHeading = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Permissions"
                        }).addStyleClass("PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BorderTop ListItem width100Percent");
        
        me.wPremisePermissions = new sap.m.VBox(me.createId("premise"+mPremiseInfo.Index), {
            items : [
                new sap.m.VBox({
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
                        // devices in a premise.
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to view device information?"
                        }),
                        me.wDataReadPermissionBox,
                        //-------------------------------------//
                        // Permission to modify the premise
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to modify the premise?"
                        }),
                        me.wWritePermissionBox,
                        //-------------------------------------//
                        // Permission to manage devices in a
                        // premise
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to manage devices?"
                        }),
                        me.wStateTogglePermissionBox,
                        //-------------------------------------//
                        // Permission to manage rooms in a
                        // premise
                        //-------------------------------------//
                        new sap.m.Label({
                            text: "Allow this user to manage rooms?"
                        }),
                        me.wRoomAdminPermissionBox
                    ]
                }).addStyleClass("MarAll8px iOmyRadioButtons")
            ]
        }).addStyleClass("ListItem width100Percent");
        
        me.wPanel.addContent(me.wPremisePermissionHeading);
        me.wPanel.addContent(me.wPremisePermissions);
        me.wPanel.addContent(
            new sap.m.VBox({
                items : [me.wApplyButton]
            }).addStyleClass("RoomPermissionsApplyButton BorderBottom")
        );
        
        me.premisesChanged[mPremiseInfo.Index] = false;
        
        me.FetchPermissionsForPremise(me.wUserSelectBox.getSelectedKey(), mPremiseInfo.Id);
    },
    
    FetchPermissionsForPremise : function (iUserId, iPremiseId) {
        var me = this;
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupPremisePerms",
                "UserId" : iUserId,
                "PremiseId" : iPremiseId
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    try {
                        var data = data.Data;
                        var iIndex;
                        //----------------------------------------------------//
                        // Basic read access (see that it exists) permission
                        //----------------------------------------------------//
                        if (data.Read == 0) {
                            iIndex = 1;
                            
                            me.wReadPermissionBox.setSelectedIndex(iIndex);
                            
                            me.wStateTogglePermissionBox.setEnabled(false);
                            me.wWritePermissionBox.setEnabled(false);
                            me.wDataReadPermissionBox.setEnabled(false);
                            me.wRoomAdminPermissionBox.setEnabled(false);
                            
                            me.wStateTogglePermissionBox.setSelectedIndex(1);
                            me.wWritePermissionBox.setSelectedIndex(1);
                            me.wDataReadPermissionBox.setSelectedIndex(1);
                            me.wRoomAdminPermissionBox.setSelectedIndex(1);
                            
                        } else if (data.Read == 1) {
                            iIndex = 0;
                            
                            me.wReadPermissionBox.setSelectedIndex(iIndex);

                            //----------------------------------------------------//
                            // Permission to modify the premise
                            //----------------------------------------------------//
                            if (data.Write == 0) {
                                iIndex = 1;
                            } else if (data.Write == 1) {
                                iIndex = 0;
                            }
                            me.wWritePermissionBox.setSelectedIndex(iIndex);

                            //----------------------------------------------------//
                            // Permission to read information about a premise.
                            //----------------------------------------------------//
                            if (data.DataRead == 0) {
                                iIndex = 1;
                                
                                me.wDataReadPermissionBox.setSelectedIndex(iIndex);
                                
                                me.wStateTogglePermissionBox.setEnabled(false);
                                
                                me.wStateTogglePermissionBox.setSelectedIndex(1);
                                
                            } else if (data.DataRead == 1) {
                                iIndex = 0;
                                
                                me.wDataReadPermissionBox.setSelectedIndex(iIndex);

                                //----------------------------------------------------//
                                // Permission to manage devices in a premise
                                //----------------------------------------------------//
                                if (data.StateToggle == 0) {
                                    iIndex = 1;
                                } else if (data.StateToggle == 1) {
                                    iIndex = 0;
                                }
                                me.wStateTogglePermissionBox.setSelectedIndex(iIndex);
                            }
                            
                            if (data.RoomAdmin == 0) {
                                iIndex = 1;
                            } else if (data.RoomAdmin == 1) {
                                iIndex = 0;
                            }
                            
                            //----------------------------------------------------//
                            // Permission to read information about a premise.
                            //----------------------------------------------------//
                            me.wRoomAdminPermissionBox.setSelectedIndex(iIndex);
                        }
                        
                    } catch (e) {
                        jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                    }
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error accessing the premise permissions", "Error");
            }
            
        });
    },
    
    UpdatePermissionsForPremise : function (iUserId, iPremiseId) {
        var me = this;
        var sUrl = IOMy.apiphp.APILocation("permissions");
		IOMy.common.NavigationToggleNavButtons(me, false);
        
        //==============================================================//
        // Fetch the permission status
        //==============================================================//
        var sRead;
        var sDataRead;
        var sWrite;
        var sStateToggle;
        var sRoomAdmin;
        
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
        
        if (me.wRoomAdminPermissionBox.getEnabled()) {
            sRoomAdmin = me.wRoomAdminPermissionBox.getSelectedButton().getText();
        } else {
            sRoomAdmin = "No";
        }
        
        var tiRead          = sRead === "Yes" ? 1 : 0;
        var tiDataRead      = sDataRead === "Yes" ? 1 : 0;
        var tiWrite         = sWrite === "Yes" ? 1 : 0;
        var tiStateToggle   = sStateToggle === "Yes" ? 1 : 0;
        var tiRoomAdmin     = sRoomAdmin === "Yes" ? 1 : 0;
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "UpdatePremisePerms",
                "UserId" : iUserId,
                "PremiseId" : iPremiseId,
                "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+",\"RoomAdmin\":"+tiRoomAdmin+"}"
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    IOMy.common.RefreshCoreVariables({
                        onSuccess : function () {
                            IOMy.common.showMessage({
								text : "Premise Permissions updated successfully!",
								view : me.getView()
							});
							
							if (me.iUserId !== null) {
								IOMy.common.NavigationChangePage("pSettingsRoomPermissions", {userID : me.iUserId});
							}
							
							IOMy.common.NavigationToggleNavButtons(me, true);
							me.wApplyButton.setEnabled(true);
                        }
					});
                    // Reset the changed flag for this premise
                    me.premisesChanged["_"+iPremiseId] = false;
                } else {
                    jQuery.sap.log.error("There was an error updating the premise permissions: "+data.ErrMesg);
                    IOMy.common.showError("There was an error updating the premise permissions:\n"+data.ErrMesg, "Error",
                        function () {
							IOMy.common.NavigationToggleNavButtons(me, true);
                            me.wApplyButton.setEnabled(true);
                        }
                    );
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error updating the premise permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error updating the premise permissions:\n"+JSON.stringify(response), "Error",
                    function () {
						IOMy.common.NavigationToggleNavButtons(me, true);
                        me.wApplyButton.setEnabled(true);
                    }
                );
            }
            
        });
    }
    
});