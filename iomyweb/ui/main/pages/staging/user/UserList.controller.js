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
sap.ui.controller("pages.staging.user.UserList", {
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
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
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
                IomyRe.apiphp.AjaxRequest({
                    url:       IomyRe.apiphp.APILocation("users"),
                    data:      {
                        "Mode":              "AdminUserList",
                    },
                    
                    onSuccess: function ( sType, aData ) {
                        var aConfig = this;
                        
                        try {
                            if( sType==="JSON" && aData.Error===false ) {
                                try {
                                    if(typeof aData.Data!=="undefined") {
                                        IomyRe.common.UserList = {};
                                        
                                        for (var i = 0; i < aData.Data.length; i++) {
                                            IomyRe.common.UserList["_"+aData.Data[i].Id] = aData.Data[i];
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
                IomyRe.common.showError( sErrMesg, "Error" );
            }
        } catch( e1 ) {
            jQuery.sap.log.error("Error with the 'UserList' in the 'UserList' controller! "+e1.message);
        }
        
    },
    
    RefreshModel: function( oController, oConfig ) {
        //------------------------------------------------//
        //-- Declare Variables                          --//
        //------------------------------------------------//
        var oView           = oController.getView();
        var aUsers          = [];
        var sUserState      = "";
        var oModel;
        
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
            oModel = new sap.ui.model.json.JSONModel({
                "UserList": aUsers
            });
            
            oView.setModel(oModel);

            //------------------------------------------------//
            //-- Trigger the onSuccess Event                --//
            //------------------------------------------------//
            if( oConfig.onSuccess ) {
                oConfig.onSuccess();
            }
        } else {
            oModel = new sap.ui.model.json.JSONModel({
                "UserList": []
            });
            
            oView.setModel(oModel);
            //throw new MissingArgumentException("User data is required. This is obtained from the users API to list all users.");
        }
    },
    
    GetSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oTable              = oView.byId("UsersTable");
        var aRows               = oTable.getRows();
        var aSelectedIndices    = oTable.getSelectedIndices();
        var aSelectedRows       = [];
        var aUserList           = oView.getModel().getProperty("/UserList");
        
        for (var i = 0; i < aSelectedIndices.length; i++) {
            aSelectedRows.push(aUserList[aSelectedIndices[i]]);
        }
        
        return aSelectedRows;
    },
    
    EnableSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedUsers      = oController.GetSelectedUsers();
        var aRequests           = [];
        var oAjaxQueue;
        
        //--------------------------------------------------------------------//
        // Prepare the request for each selected user if they're not already
        // enabled.
        //--------------------------------------------------------------------//
        for (var i = 0; i < aSelectedUsers.length; i++) {
            if (aSelectedUsers[i].Status === "Disabled") {
                aRequests.push({
                    "library" : "PHP",
                    "url" : IomyRe.apiphp.APILocation("users"),
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
        
        oAjaxQueue = new AjaxRequestQueue({
            requests                : aRequests,
            concurrentRequests      : 1,
            
            onSuccess : function () {
                var sMessage    = "";
                
                if (aRequests.length === 1) {
                    sMessage = "1 user enabled.";
                } else {
                    sMessage = aRequests.length + " users enabled.";
                }
                
                IomyRe.common.showMessage({
                    text : sMessage
                });
                
                oController.GetListOfUsers();
            },
            
            onWarning : function () {
                IomyRe.common.showWarning("Could not enable all users.", "");
            },
            
            onFail : function () {
                IomyRe.common.showError("Failed to enable any users.", "");
            }
            
        });
        
    },
    
    DisableSelectedUsers : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedUsers      = oController.GetSelectedUsers();
        var aRequests           = [];
        var oAjaxQueue;
        
        //--------------------------------------------------------------------//
        // Prepare the request for each selected user. Three conditions must be
        // met: 1. The user must NOT be the owner (first user), 2. The user
        // cannot be currently logged in, and 3. The user should be enabled.
        //--------------------------------------------------------------------//
        for (var i = 0; i < aSelectedUsers.length; i++) {
            if (aSelectedUsers[i].UserId !== 1 && aSelectedUsers[i].UserId !== 2) {
                
                if (aSelectedUsers[i].UserId == IomyRe.common.UserInfo.UserId) {
                    IomyRe.common.showWarning("Unable to disable yourself while logged in.", "Still logged in");
                    
                } else {
                    if (aSelectedUsers[i].Status === "Enabled") {
                        aRequests.push({
                            "library" : "PHP",
                            "url" : IomyRe.apiphp.APILocation("users"),
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
                IomyRe.common.showWarning("Cannot disable the owner.", "iOmy Owner");
            }
        }
        
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
                
                IomyRe.common.showMessage({
                    text : sMessage
                });
                
                oController.GetListOfUsers();
            },
            
            onWarning : function () {
                IomyRe.common.showWarning("Could not disable all users.", "");
            },
            
            onFail : function () {
                IomyRe.common.showError("Failed to disable any users.", "");
            }
            
        });
        
    }

});