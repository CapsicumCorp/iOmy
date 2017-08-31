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
    
    iUserId             : null,
    iPermissionLevel    : null,
    
    aInfoForRequests    : [],
    mxFetchRequests     : new Mutex({ manual : true }), // Mutex with the queue managed by the controller rather than the mutex.
    mxUpdateRequests    : new Mutex({ manual : true }), // Mutex with the queue managed by the controller rather than the mutex.
    
    aPermissionLevels : [
        /* Level 0 */ "No Access",
        /* Level 1 */ "Read",
        /* Level 2 */ "Read/Write",
        /* Level 3 */ "Access to Devices, Read/Write",
        /* Level 4 */ "Device Management, Read/Write"
    ],
    
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
                
                if (evt.data.userID !== undefined && evt.data.userID !== null) {
                    me.iUserId = evt.data.userID;
                } else {
                    me.iUserId = null;
                    IOMy.common.NavigationRefreshButtons( me );
                }
                
                me.populateUserSelectBox();
            }
        });
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.permissions.RoomPermission
*/
//    onBeforeRendering: function() {
//
//    },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.permissions.RoomPermission
*/
//    onAfterRendering: function() {
//        
//    },
    
    
    
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.permissions.RoomPermission
*/
//    onExit: function() {
//
//    },

    toggleButtons : function (bEnabled) {
        var oView = this.getView();
        
        oView.wSelectRoom.setEnabled(bEnabled);
        
        oView.wButtonApply.setEnabled(bEnabled);
        oView.wSliderPermissionLevel.setEnabled(bEnabled);
        
        if (this.iUserId === null) {
            oView.wButtonCancel.setEnabled(bEnabled);
        } else {
            oView.wButtonCancel.setEnabled(false);
        }
        
        IOMy.common.NavigationToggleNavButtons(this, bEnabled);
    },
    
    /**
     * Retrieves a list of users to show on the room permission page, and
     * populates the user select box with said list.
     */
    populateUserSelectBox : function () {
        var me = this;
        var thisView = me.getView();
        var iPremiseId;
        
        me.toggleButtons(false);
        thisView.wSelectUser.destroyItems();
        
        //--------------------------------------------------------------------//
        // Fetch the premise ID and store it.
        //--------------------------------------------------------------------//
        iPremiseId = me.fetchPremiseID();
        
        //----------------------------------------------------------------//
        // Populate the users select box with the viewable users
        //----------------------------------------------------------------//
        IOMy.widgets.getListOfUsersForRoomPermissions(thisView.wSelectUser, me.iUserId, iPremiseId,
            function () {
                me.refreshRoomSelectBox();
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
    
    /**
     * Retrieves the user ID from either the user select box (default) or from 
     * memory (when creating a new user).
     * 
     * @returns {mixed}     User's ID in either integer or string format.
     */
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
    
    /**
     * Grabs the ID of the first premise (should be the only premise).
     * 
     * @returns {mixed}     Premise ID in either integer or string format
     */
    fetchPremiseID : function () {
        var iPremiseId;
        
        //--------------------------------------------------------------------//
        // Fetch the premise ID, store it, then set the name of the premise to
        // be the label of the permission controls in the form.
        // 
        // NOTE: This currently selects the first premise in the list, which is
        // normally the only one in the list. When we start adding support for
        // multiple premises, this code will need to be redone.
        //--------------------------------------------------------------------//
        $.each(IOMy.common.PremiseList, function (sI, mPremise) {
            iPremiseId = mPremise.Id;
            return false;
        });
        
        return iPremiseId;
    },
    
    determinePermissionLevel : function (mData) {
        var me = this;
        
        //----------------------------------------------------//
        // Determine the permission level the current user has
        //----------------------------------------------------//
        if (mData.Read === 0) {
            me.iPermissionLevel = 0; // No Access

        } else if (mData.Read === 1) {
            me.iPermissionLevel = 1; // Read-only

            //----------------------------------------------------//
            // Permission to modify the premise
            //----------------------------------------------------//
            if (mData.Write === 1) {
                me.iPermissionLevel = 2; // Read and Write

                if (mData.DataRead === 1) {
                    me.iPermissionLevel = 3; // Device Access and Read/Write

                    if (mData.StateToggle === 1) {
                        me.iPermissionLevel = 4; // Device Management and Read/Write
                    }
                }
            }

        }
    },
    
    determineMostCommonPermissionForAllRooms : function (aPermissionLevels) {
        var me = this;
        var iMin = null;
        
        for (var i = 0; i < aPermissionLevels.length; i++) {
            if (iMin === null) {
                iMin = aPermissionLevels[i];
            } else if (iMin > aPermissionLevels[i]) {
                iMin = aPermissionLevels[i];
            }
        }
        
        me.iPermissionLevel = iMin;
    },
    
    refreshRoomSelectBox : function () {
        var me      = this;
        var oView   = this.getView();
        var iRoom   = oView.wSelectRoom.getSelectedKey();
        oView.wSelectRoom.destroyItems();
        
        oView.wSelectRoom.addItem(
            new sap.ui.core.Item({
                "text" : "All Rooms",
                "key" : 0
            })
        );
        
        $.each(IOMy.common.RoomsList["_"+me.fetchPremiseID()],function(sIndex,aRoom) {
            //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
            if( sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null)
            {
                oView.wSelectRoom.addItem(
                    new sap.ui.core.Item({
                        "text" : aRoom.RoomName,
                        "key" : aRoom.RoomId
                    })
                );
            }
        });
        
        oView.wSelectRoom.setSelectedKey(iRoom);
        
        this.FetchPermissionsForRoom();
    },
    
    FetchPermissionsForRoom : function () {
        var me                  = this;
        var oView               = this.getView();
        var sUrl                = IOMy.apiphp.APILocation("permissions");
        var iUser               = me.fetchUserID();
        var iRoom               = oView.wSelectRoom.getSelectedKey();
        var aPermissionLevels   = [];
        
        var fnSuccess = function () {
            //----------------------------------------------------//
            // Set the slider value and the current permission level
            // on screen. Enable all the controls.
            //----------------------------------------------------//
            oView.wSliderPermissionLevel.setValue( me.iPermissionLevel );
            oView.wLabelPermissionLevel.setText( me.aPermissionLevels[ me.iPermissionLevel ] );

            me.toggleButtons(true);
        };
        
        var fnFail = function (sErrMessage) {
            IOMy.common.showError(sErrMessage, "Error",
                function () {
                    me.toggleButtons(true);
                }
            );
        };
        
        me.toggleButtons(false);
        oView.wSliderPermissionLevel.setEnabled(false);
        
        if (iRoom != 0) {
            //--------------------------------------------------------------------//
            // Load and display the permissions for the currently selected user.
            //--------------------------------------------------------------------//
            IOMy.apiphp.AjaxRequest({
                url : sUrl,
                data : {
                    "Mode" : "LookupRoomPerms",
                    "UserId" : iUser,
                    "RoomId" : iRoom
                },

                onSuccess : function (responseType, data) {
                    if (data.Error === false) {
                        try {
                            var data = data.Data;

                            me.determinePermissionLevel(data);

                            fnSuccess();

                        } catch (e) {
                            jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                            fnFail("(BUG IF YOU SEE THIS!)\n"+e.message);
                        }
                    } else {
                        fnFail(data.ErrMesg)
                    }
                },

                onFail : function (response) {
                    jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                    fnFail(response.responseText);
                }

            });
        } else {
            
            $.each(IOMy.common.RoomsList["_"+me.fetchPremiseID()], function (sI, mRoom) {
                me.mxFetchRequests.synchronize({
                    task : function () {
                        //--------------------------------------------------------------------//
                        // Load and display the permissions for the currently selected user.
                        //--------------------------------------------------------------------//
                        IOMy.apiphp.AjaxRequest({
                            url : sUrl,
                            data : {
                                "Mode" : "LookupRoomPerms",
                                "UserId" : iUser,
                                "RoomId" : mRoom.RoomId
                            },

                            onSuccess : function (responseType, data) {
                                if (data.Error === false) {
                                    try {
                                        var data = data.Data;

                                        me.determinePermissionLevel(data);
                                        
                                        aPermissionLevels.push(me.iPermissionLevel);

                                        me.mxFetchRequests.dequeue();

                                        if (!me.mxFetchRequests.busy) {
                                            me.determineMostCommonPermissionForAllRooms(aPermissionLevels);
                                            
                                            fnSuccess();
                                        }

                                    } catch (e) {
                                        jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                                        fnFail("(BUG IF YOU SEE THIS!)\n"+e.message);
                                    }
                                } else {
                                    fnFail(data.ErrMesg);
                                }
                            },

                            onFail : function (response) {
                                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                                fnFail(response.responseText);
                            }

                        });
                    }
                });
            });
            
            me.mxFetchRequests.dequeue();
        }
    },

    UpdatePermissionsForRoom : function () {
        var me      = this;
        var oView   = me.getView();
        var sUrl    = IOMy.apiphp.APILocation("permissions");
        var iUser   = me.fetchUserID();
        var iRoom   = oView.wSelectRoom.getSelectedKey();
        
        me.toggleButtons(false);
        
        //==============================================================//
        // Fetch the permission status
        //==============================================================//
        var mPermissions    = me.determinePermissionSettings();
        
        var tiRead          = mPermissions.Read;
        var tiDataRead      = mPermissions.DeviceRead;
        var tiWrite         = mPermissions.Write;
        var tiStateToggle   = mPermissions.DeviceWrite;
        
        if (iRoom != 0) {
            IOMy.apiphp.AjaxRequest({
                url : sUrl,
                data : {
                    "Mode" : "UpdateRoomPerms",
                    "UserId" : iUser,
                    "RoomId" : oView.wSelectRoom.getSelectedKey(),
                    "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+"}"
                },

                onSuccess : function (responseType, data) {
                    IOMy.common.RefreshCoreVariables({
                        onSuccess : function () {
                            IOMy.common.showMessage({
                                text : "Permissions updated!",
                                view : me.getView()
                            });

                            me.toggleButtons(true);
                        }
                    });
                },

                onFail : function (response) {
                    IOMy.common.showError(response.responseText, "Error",
                        function () {
                            me.toggleButtons(true);
                        }
                    );
                }

            });
        } else {
            
            $.each(IOMy.common.RoomsList["_"+me.fetchPremiseID()], function (sI, mRoom) {
                
                me.mxUpdateRequests.synchronize({
                    task : function () {
                        IOMy.apiphp.AjaxRequest({
                            url : sUrl,
                            data : {
                                "Mode" : "UpdateRoomPerms",
                                "UserId" : iUser,
                                "RoomId" : mRoom.RoomId,
                                "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+"}"
                            },

                            onSuccess : function (responseType, data) {
                                // Keep the queue going.
                                me.mxUpdateRequests.dequeue();
                                
                                // The queue is empty
                                if (!me.mxUpdateRequests.busy) {
                                    IOMy.common.RefreshCoreVariables({
                                        onSuccess : function () {
                                            IOMy.common.showMessage({
                                                text : "Permissions updated",
                                                view : me.getView()
                                            });

                                            me.toggleButtons(true);
                                        }
                                    });
                                }
                            },

                            onFail : function (response) {
                                IOMy.common.showError(response.responseText, "Error",
                                    function () {
                                        if (me.mxUpdateRequests.busy) {
                                            me.mxUpdateRequests.dequeue();
                                        }
                                        
                                        if (!me.mxUpdateRequests.busy) {
                                            me.toggleButtons(true);
                                        }
                                    }
                                );
                            }

                        });
                    }
                });
                
            });
            
            me.mxUpdateRequests.dequeue();
        }
    },
    
    determinePermissionSettings : function () {
        var oView               = this.getView();
        var iPermissionLevel    = oView.wSliderPermissionLevel.getValue();
        var mPermissions        = {
            Read        : 0,
            Write       : 0,
            DeviceRead  : 0,
            DeviceWrite : 0
        };
        
        if (iPermissionLevel >= 1) {
            mPermissions.Read = 1;
            
            if (iPermissionLevel >= 2) {
                mPermissions.Write = 1;
            }
            
            if (iPermissionLevel >= 3) {
                mPermissions.DeviceRead = 1;
            }
            
            if (iPermissionLevel === 4) {
                mPermissions.DeviceWrite = 1;
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