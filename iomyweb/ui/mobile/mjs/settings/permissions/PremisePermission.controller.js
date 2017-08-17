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
    
    iUserId             : null,
    iPremiseId          : null,
    iPermissionLevel    : null,
    
    aPermissionLevels : [
        /* Level 0 */ "No Access",
        /* Level 1 */ "Read",
        /* Level 2 */ "Read/Write",
        /* Level 3 */ "Room Management, Read/Write"
    ],
    
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
                
                if (evt.data.userID !== undefined && evt.data.userID !== null) {
                    me.iUserId = evt.data.userID;
                } else {
                    me.iUserId = null;
                    IOMy.common.NavigationRefreshButtons( me );
                    //thisView.wSelectUser.setSelectedKey(null);
                }
                
                me.getUsersForSelectBox();
                
            }
        });
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.permissions.PremisePermission
*/
//    onBeforeRendering: function() {
//
//    },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.permissions.PremisePermission
*/
//    onAfterRendering: function() {
//        
//    },
    
    
    
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.permissions.PremisePermission
*/
//    onExit: function() {
//
//    },

    toggleButtons : function (bEnabled) {
        var oView = this.getView();
        
        oView.wButtonApply.setEnabled(bEnabled);
        oView.wSliderPermissionLevel.setEnabled(bEnabled);
        
        if (this.iUserId === null) {
            oView.wButtonCancel.setEnabled(bEnabled);
        } else {
            oView.wButtonCancel.setEnabled(false);
        }
        
        IOMy.common.NavigationToggleNavButtons(this, bEnabled);
    },
    
    getUsersForSelectBox : function () {
        var me = this;
        var thisView = me.getView();
        
        me.toggleButtons(false);
        thisView.wSelectUser.destroyItems();
        
        // TODO: Change this mechanism to something that isn't as confusing.
        
        // Populate the users select box with the viewable users
        IOMy.widgets.getListOfUsersForPremisePermissions(thisView.wSelectUser, me.iUserId, thisView.wSelectPremise.getSelectedKey(),
            //----------------------------------------------------------------//
            // Run this function if successful
            //----------------------------------------------------------------//
            function () {
                me.FetchPermissionsForPremise();
            },

            //----------------------------------------------------------------//
            // Run this function if there's a problem
            //----------------------------------------------------------------//
            function (sError) {
                // Show an error message and go back to the previous page
                // once closed.
                IOMy.common.showError(sError, "", function () {
                    IOMy.common.NavigationTriggerBackForward(false);
                });
            }
        );
    },
    
    fetchUserID : function () {
        var me = this;
        var oView = this.getView();
        var iUser;
        
        if (oView.wSelectUser.getEnabled() === true) {
            iUser = oView.wSelectUser.getSelectedKey();
        } else {
            iUser = me.iUserId;
        }
        
        return iUser;
    },
    
    FetchPermissionsForPremise : function () {
        var me          = this;
        var oView       = this.getView();
        var sUrl        = IOMy.apiphp.APILocation("permissions");
        var iUser       = me.fetchUserID();
        
        me.toggleButtons(false);
        
        //--------------------------------------------------------------------//
        // Fetch the premise ID, store it, then set the name of the premise to
        // be the label of the permission controls in the form.
        // 
        // NOTE: This currently selects the first premise in the list, which is
        // normally the only one in the list. When we start adding support for
        // multiple premises, this code will need to be redone.
        //--------------------------------------------------------------------//
        $.each(IOMy.common.PremiseList, function (sI, mPremise) {
            me.iPremiseId = mPremise.Id;
            oView.byId("PremiseControl").setLabel("Premise: " + mPremise.Name);
            return false;
        });
        
        //--------------------------------------------------------------------//
        // Load and display the permissions for the currently selected user.
        //--------------------------------------------------------------------//
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupPremisePerms",
                "UserId" : iUser,
                "PremiseId" : me.iPremiseId
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    try {
                        var data = data.Data;
                        
                        //----------------------------------------------------//
                        // Determine the permission level the current user has
                        //----------------------------------------------------//
                        if (data.Read === 0) {
                            me.iPermissionLevel = 0; // No Access
                            
                        } else if (data.Read === 1) {
                            me.iPermissionLevel = 1; // Read-only
                            
                            //----------------------------------------------------//
                            // Permission to modify the premise
                            //----------------------------------------------------//
                            if (data.Write === 1) {
                                me.iPermissionLevel = 2; // Read and Write
                                
                                if (data.RoomAdmin === 1) {
                                    me.iPermissionLevel = 3; // Room Management and Read/Write
                                }
                            }

                        }
                        
                        //----------------------------------------------------//
                        // Set the slider value and the current permission level
                        // on screen. Enable all the controls.
                        //----------------------------------------------------//
                        oView.wSliderPermissionLevel.setValue( me.iPermissionLevel );
                        oView.wLabelPermissionLevel.setText( me.aPermissionLevels[ me.iPermissionLevel ] );
                        
                        me.toggleButtons(true);
                        
                        //----------------------------------------------------//
                        // If the user selected is in fact the owner of the
                        // premise, the slider should be disabled as well as the
                        // apply button, otherwise the page should function
                        // normally.
                        //----------------------------------------------------//
                        if (data.Owner === 1) {
                            oView.wSliderPermissionLevel.setEnabled(false);
                            oView.wButtonApply.setEnabled(false);
                            
                            IOMy.common.showMessage({
                                text : "The selected user is an owner. Permissions cannot be changed for owners.",
                                view : oView,
                                duration : 7000
                            });
                        } else {
                            oView.wSliderPermissionLevel.setEnabled(true);
                        }
                        
                    } catch (e) {
                        jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                        IOMy.common.showError("(BUG IF YOU SEE THIS!)\nThere was an error setting the permissions on the screen: "+e.message, "",
                            function () {
                                me.toggleButtons(true);
                            }
                        );
                    }
                } else {
                    IOMy.common.showError(data.ErrMesg, "Error",
                        function () {
                            me.toggleButtons(true);
                        }
                    );
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error accessing the premise permissions", "Error",
                    function () {
                        me.toggleButtons(true);
                    }
                );
            }
            
        });
    },
    
    UpdatePermissionsForPremise : function () {
        var me = this;
        var oView = this.getView();
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        me.toggleButtons(false);
        
        //==============================================================//
        // Fetch the permission status
        //==============================================================//
        
        var mPermissions    = me.determinePermissionSettings();
        
        var tiRead          = mPermissions.Read;
        var tiWrite         = mPermissions.Write;
        var tiRoomAdmin     = mPermissions.RoomAdmin;
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "UpdatePremisePerms",
                "UserId" : me.fetchUserID(),
                "PremiseId" : me.iPremiseId,
                "Data" : "{\"Read\":"+tiRead+",\"Write\":"+tiWrite+",\"RoomAdmin\":"+tiRoomAdmin+"}"
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
                            
                            me.toggleButtons(true);
                        }
                    });
                } else {
                    jQuery.sap.log.error("There was an error updating the premise permissions: "+data.ErrMesg);
                    IOMy.common.showError("There was an error updating the premise permissions:\n"+data.ErrMesg, "Error",
                        function () {
                            me.toggleButtons(true);
                        }
                    );
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error updating the premise permissions: "+JSON.stringify(response));
                IOMy.common.showError("There was an error updating the premise permissions:\n"+JSON.stringify(response), "Error",
                    function () {
                        me.toggleButtons(true);
                    }
                );
            }
            
        });
    },
    
    /**
     * Takes the permission level from the permission slider and uses it to form
     * an object containing the current permission settings 
     * 
     * @returns {map}   Permission Settings
     */
    determinePermissionSettings : function () {
        var oView               = this.getView();
        var iPermissionLevel    = oView.wSliderPermissionLevel.getValue();
        var mPermissions        = {
            Read        : 0,
            Write       : 0,
            RoomAdmin   : 0
        };
        
        if (iPermissionLevel >= 1) {
            mPermissions.Read = 1;
            
            if (iPermissionLevel >= 2) {
                mPermissions.Write = 1;
            }
            
            if (iPermissionLevel === 3) {
                mPermissions.RoomAdmin = 1;
            }
        }
        
        return mPermissions;
    },
    
    /**
     * Takes the value from the permission level slider and uses it as an index
     * to access the string in this.aPermissionLevels array.
     */
    setPermissionLevelText : function () {
        var oView   = this.getView();
        var iLevel  = oView.wSliderPermissionLevel.getValue();
        
        oView.wLabelPermissionLevel.setText( this.aPermissionLevels[ iLevel ] );
    }
    
});