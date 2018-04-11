/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
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
$.sap.require("sap.ui.table.Table");
sap.ui.controller("pages.user.UserList", {
    sMode:              "Show",
    aFormFragments:     {},
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        oView.addEventDelegate({

            onBeforeShow: function ( oEvent ) {
                //-- Store the Current Id --//
                //oController.iCurrentId = oEvent.data.Id;
                
                //-- Refresh Nav Buttons --//
                //MyApp.common.NavigationRefreshButtons( oController );
                
                //-- Update the Model --//
                //oController.RefreshModel( oController, {} );
                
                //-- Check the parameters --//
                oController.GetListOfUsers();
                //-- Defines the Device Type --//
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
            }
            
        });
        
    },
    
    GetListOfUsers : function() {
        var oController = this;
        var bError      = false;
        var sErrMesg    = "";

        //------------------------------------------------//
        //-- STEP 1 - Fetch User List from Database     --//
        //------------------------------------------------//
        try {
            if( bError===false ) {
                iomy.apiphp.AjaxRequest({
                    url:       iomy.apiphp.APILocation("users"),
                    data:      {
                        "Mode":              "AdminUserList",
                    },
                    
                    onSuccess: function ( sType, aData ) {
                        var aConfig = this;
                        
                        try {
                            if( sType==="JSON" && aData.Error===false ) {
                                try {
                                    if(typeof aData.Data!=="undefined") {
                                        iomy.common.UserList = {};
                                        
                                        for (var i = 0; i < aData.Data.length; i++) {
                                            iomy.common.UserList["_"+aData.Data[i].Id] = aData.Data[i];
                                        }
                                        //------------------------------------------------//
                                        //-- STEP 2 - Update the Controller Model       --//
                                        //------------------------------------------------//
                                        oController.RefreshModel( oController, { data : aData.Data } );
                                        //-- END RefreshControllerModel (STEP 2) --//
                                    } else {
                                        jQuery.sap.log.error("Error with the 'aData.Data' in 'GetListOfUsers' function ");
                                    }
                                } catch( e3 ) {
                                    jQuery.sap.log.error("Error with a bug in the code that processes the User List data! "+e3.message);
                                }
                            } else {
                                //-- Run the fail event
                                if( aConfig.onFail ) {
                                    aConfig.onFail();
                                }
                                
                                jQuery.sap.log.error("Error with a bug in the 'AdminUserList' successful API result! Expecting JSON. Received "+sType);
                            }
                        } catch( e2 ) {
                            jQuery.sap.log.error("Error with the 'AdminUserList' success in the 'UserList' controller! "+e2.message);
                        }
                    },
                    onFail: function (response) {
                        jQuery.sap.log.error("Error with the 'AdminUserList' API Request! "+response.responseText);
                        oController.RefreshModel(oController, {})
                    }
                });
            } else {
                iomy.common.showError( sErrMesg, "Error" );
            }
        } catch( e1 ) {
            jQuery.sap.log.error("Error with the 'UserList' in the 'UserList' controller! "+e1.message);
        }
        
    },
    
    ToggleControls : function (bEnabled) {
        var oController = this;
        var oView       = oController.getView();
        var oModel      = oView.getModel();
        
        try {
            oModel.setProperty("/enabled/Always", bEnabled);
            
        } catch (e) {
            $.sap.log.error("Failed to enable or disable controls ("+e.name+"): " + e.message);
        }
    },
    
    RefreshModel: function( oController, oConfig ) {
        //------------------------------------------------//
        //-- Declare Variables                          --//
        //------------------------------------------------//
        var oView           = oController.getView();
        var aUsers          = [];
        var sUserState      = "";
        var oData           = {};
        var oModel          = null;
        
        try {
            if (oConfig.data) {

                //------------------------------------------------//
                //-- Create the user list for the model         --//
                //------------------------------------------------//
                for (var i = 0; i < oConfig.data.length; i++) {

                    if (oConfig.data[i].State === 0 || oConfig.data[i].State === '0' ) {
                        sUserState = "Disabled";
                    } else {
                        sUserState = "Enabled";
                    }

                    aUsers.push({
                        "UserId" : oConfig.data[i].Id,
                        "Username": oConfig.data[i].Username,
                        "FirstName": oConfig.data[i].Givennames,
                        "LastName" : oConfig.data[i].Surnames,
                        "DisplayName" : oConfig.data[i].Displayname,
                        "Status" : sUserState
                    });
                }

                //------------------------------------------------//
                //-- Build and Bind Model to the View           --//
                //------------------------------------------------//
                oData = {
                    "UserList": aUsers
                };
                
            } else {
                oData = {
                    "UserList": []
                };
                //throw new MissingArgumentException("User data is required. This is obtained from the users API to list all users.");
            }
            
            oData.enabled = {
                "Always" : true
            };
            
            oModel = new sap.ui.model.json.JSONModel(oData);

            oView.setModel(oModel);

            //------------------------------------------------//
            //-- Trigger the onSuccess Event                --//
            //------------------------------------------------//
            if( oConfig.onSuccess ) {
                oConfig.onSuccess();
            }
            
        } catch (e) {
            $.sap.log.error("Error refreshing the model ("+e.name+"): " + e.message);
        }
    },
    
    GetSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oTable              = oView.byId("UsersTable");
        var aSelectedRows       = [];
        
        try {
            var aSelectedIndices    = oTable.getSelectedIndices();
            var aUserList           = oView.getModel().getProperty("/UserList");

            for (var i = 0; i < aSelectedIndices.length; i++) {
                aSelectedRows.push(aUserList[aSelectedIndices[i]]);
            }
        } catch (e) {
            $.sap.log.error("Error compiling a list of selected users ("+e.name+"): " + e.message);
        }
        
        return aSelectedRows;
    },
    
    EnableSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedUsers      = oController.GetSelectedUsers();
        var aRequests           = [];
        var oAjaxQueue;
        
        try {
            if (aSelectedUsers.length > 0) {
                oController.ToggleControls(false);

                //--------------------------------------------------------------------//
                // Prepare the request for each selected user if they're not already
                // enabled.
                //--------------------------------------------------------------------//
                for (var i = 0; i < aSelectedUsers.length; i++) {
                    if (aSelectedUsers[i].Status === "Disabled") {
                        aRequests.push({
                            "library" : "PHP",
                            "url" : iomy.apiphp.APILocation("users"),
                            "data" : {
                                "Mode" : "ChangeUserState",
                                "Data" : JSON.stringify({
                                    "UserId" : aSelectedUsers[i].UserId,
                                    "NewState" : 1
                                })
                            }
                        });
                    }
                }
                
                if (aRequests.length > 0) {
                    //--------------------------------------------------------------------//
                    // Put the requests in a queue. Run two at a time. Report the findings.
                    // TODO: Use more informative error messages.
                    //--------------------------------------------------------------------//
                    oAjaxQueue = new AjaxRequestQueue({
                        requests                : aRequests,
                        concurrentRequests      : 2,

                        onSuccess : function () {
                            var sMessage    = "";

                            if (aRequests.length === 1) {
                                sMessage = "1 user enabled.";
                            } else {
                                sMessage = aRequests.length + " users enabled.";
                            }

                            iomy.common.showMessage({
                                text : sMessage
                            });

                            oController.GetListOfUsers();
                            //-- Buttons will be enabled once the user list has been refreshed --//
                        },

                        onWarning : function () {
                            iomy.common.showWarning("Could not enable all users.", "",
                                function () {
                                    oController.ToggleControls(true);
                                }
                            );
                        },

                        onFail : function () {
                            iomy.common.showError("Failed to enable any users.", "",
                                function () {
                                    oController.ToggleControls(true);
                                }
                            );
                        }

                    });
                } else {
                    oController.ToggleControls(true);
                }
            }
        } catch (e) {
            $.sap.log.error("Error attempting to enable users ("+e.name+"): " + e.message);
            oController.ToggleControls(true);
        }
        
    },
    
    DisableSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedUsers      = oController.GetSelectedUsers();
        var aRequests           = [];
        var oAjaxQueue;
        
        try {
            if (aSelectedUsers.length > 0) {
                oController.ToggleControls(false);

                //--------------------------------------------------------------------//
                // Prepare the request for each selected user. Three conditions must be
                // met: 1. The user must NOT be the owner (first user), 2. The user
                // cannot be currently logged in, and 3. The user should be enabled.
                //--------------------------------------------------------------------//
                for (var i = 0; i < aSelectedUsers.length; i++) {
                    if (aSelectedUsers[i].UserId !== 1 && aSelectedUsers[i].UserId !== 2) {

                        if (aSelectedUsers[i].UserId == iomy.common.UserInfo.UserId) {
                            iomy.common.showWarning("Unable to disable yourself while logged in.", "Still logged in");

                        } else {
                            if (aSelectedUsers[i].Status === "Enabled") {
                                aRequests.push({
                                    "library" : "PHP",
                                    "url" : iomy.apiphp.APILocation("users"),
                                    "data" : {
                                        "Mode" : "ChangeUserState",
                                        "Data" : JSON.stringify({
                                            "UserId" : aSelectedUsers[i].UserId,
                                            "NewState" : 0
                                        })
                                    }
                                });
                            }
                        }
                    } else {
                        iomy.common.showWarning("Cannot disable the owner.", "iOmy Owner");
                    }
                }

                if (aRequests.length > 0) {
                    //--------------------------------------------------------------------//
                    // Put the requests in a queue. Run two at a time. Report the findings.
                    // TODO: Use more informative error messages.
                    //--------------------------------------------------------------------//
                    oAjaxQueue = new AjaxRequestQueue({
                        requests                : aRequests,
                        concurrentRequests      : 2,

                        onSuccess : function () {
                            var sMessage    = "";

                            if (aRequests.length === 1) {
                                sMessage = "1 user disabled.";
                            } else {
                                sMessage = aRequests.length + " users disabled.";
                            }

                            iomy.common.showMessage({
                                text : sMessage
                            });

                            oController.GetListOfUsers();
                            //-- Buttons will be enabled once the user list has been refreshed --//
                        },

                        onWarning : function () {
                            iomy.common.showWarning("Could not disable all users.", "",
                                function () {
                                    oController.ToggleControls(true);
                                }
                            );
                        },

                        onFail : function () {
                            iomy.common.showError("Failed to disable any users.", "",
                                function () {
                                    oController.ToggleControls(true);
                                }
                            );
                        }

                    });
                } else {
                    oController.ToggleControls(true);
                }
            }
        } catch (e) {
            $.sap.log.error("Error attempting to disable users ("+e.name+"): " + e.message);
            oController.ToggleControls(true);
        }
        
    }

});