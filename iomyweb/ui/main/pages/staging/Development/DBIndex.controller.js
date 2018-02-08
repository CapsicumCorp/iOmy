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

sap.ui.controller("pages.staging.Development.DBIndex", {
    aFormFragments  : {},
    
    //bEditing    : false,
    bIndexingOn         : false,
    bControlsEnabled    : false,
    bLoading            : false,
    bOptionChanged      : false,
    
    iThingId            : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        oView.addEventDelegate({
            onBeforeShow : function (evt) {
                
                oController.bOptionChanged = false;
                
                //-- Defines the Device Type --//
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.RefreshModel();
                oController.CheckDBIndexing();
            }
        });
    },
    
    ToggleControls : function (bEnabled) {
        try {
            var oController     = this;
            var oView           = oController.getView();
            var oData           = JSON.parse(oView.getModel().getJSON());
            var oModel          = {};
            
            oController.bControlsEnabled = bEnabled;
            
            oData.controls.ControlsEnabled      = oController.bControlsEnabled;
            oData.controls.CancelEnabled        = oController.bControlsEnabled || oController.bLoading;
            oData.controls.EditIndexEnabled     = oController.bControlsEnabled && oController.bOptionChanged;
            
            oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel);
            
        } catch (e) {
            $.sap.log.error("Error toggling controls ("+e.name+"): " + e.message);
        }
    },
    
    ToggleEditIndexButton: function () {
        try {
            var oController     = this;
            var oView           = oController.getView();
            var oData           = JSON.parse(oView.getModel().getJSON());
            var oModel          = {};
            
            oController.bOptionChanged = !oController.bOptionChanged;
            
            oData.controls.EditIndexEnabled     = oController.bOptionChanged;
            
            oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel);
            
        } catch (e) {
            $.sap.log.error("Error toggling the edit index button ("+e.name+"): " + e.message);
        }
    },
    
    CheckDBIndexing : function () {
        var oController     = this;
        
        try {
            oController.bLoading = true;
            oController.ToggleControls(false);
            
            iomy.functions.server.getDBIndexingState({
                onSuccess : function (bState) {
                    oController.bIndexingOn = bState;
                    oController.bLoading = false;
                    
                    oController.RefreshModel();
                },

                onFail : function (sErrorMessage) {
                    iomy.common.showError(sErrorMessage, "Error",
                        function () {
                            oController.bLoading = false;
                            oController.RefreshModel();
                        }
                    );
                }
            });
        } catch (e) {
            iomy.common.showError("Error attempting to call the function to retrieve the database indexing state ("+e.name+"): " + e.message, "Error",
                function () {
                    oController.bLoading = false;
                    oController.RefreshModel();
                }
            );
        }
        
    },
    
    RefreshModel : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oData               = {};
        var oModel              = {};
        
        oData = {
            "DBAdminUsername"   : "root",
            "DBAdminPassword"   : "",
            "DBIndexingOn"      : oController.bIndexingOn,
            
            "controls" : {
                "ControlsEnabled"   : true,
                "CancelEnabled"     : true,
                "EditIndexEnabled"  : false
            }
        };
        
        oModel = new sap.ui.model.json.JSONModel(oData);
        
        oView.setModel(oModel);
    },
    
    ToggleDBIndexing : function () {
        var oController         = this;
        var oView               = oController.getView();
        var bError              = false;
        var aErrorMessages      = [];
        var bEnabled            = oView.getModel().getProperty("/DBIndexingOn");
        var sDBUsername         = oView.getModel().getProperty("/DBAdminUsername");
        var sDBPassword         = oView.getModel().getProperty("/DBAdminPassword");
        var sDBTable;
        var sCommand;
        var oDBIndexingQueue;
        var aDataTables = [
            "DATABIGINT",
            "DATAINT",
            "DATALONGSTRING",
            "DATAMEDSTRING",
            "DATASHORTSTRING",
            "DATASTRING255",
            "DATATINYINT",
            "DATATINYSTRING"
        ];
        
        //--------------------------------------------------------------------//
        // Check that the database admin username and password are given.
        //--------------------------------------------------------------------//
        try {
            if (sDBUsername === "") {
                bError = true;
                aErrorMessages.push("Database username is required.");
            }

            if (sDBPassword === "") {
                bError = true;
                aErrorMessages.push("Database password is required.");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push(e.name + ": " + e.message);
        }
        
        if (bError) {
            //-- Display the error popup if there are incomplete fields. --//
            iomy.common.showError(aErrorMessages.join("\n\n"), "Error");
            
        } else {
            try {
                oController.ToggleControls(false);
                //----------------------------------------------------------------//
                // Create the request queue with its callbacks.
                //----------------------------------------------------------------//
                oDBIndexingQueue = new AjaxRequestQueue({
                    executeNow : false,

                    onSuccess : function () {
                        var sMessage = "";

                        if (bEnabled) {
                            sMessage = "Database indexing enabled.";
                        } else {
                            sMessage = "Database indexing disabled.";
                        }

                        iomy.common.showMessage({
                            text : sMessage
                        });

                        iomy.common.NavigationChangePage( "pServerInfo" ,  {} , false);
                    },

                    onWarning : function () {

                    },

                    onFail : function () {
                        var sError = "";

                        if (bEnabled) {
                            sError = "Failed to enable indexing.";
                        } else {
                            sError = "Failed to disable indexing.";
                        }

                        iomy.common.showError(sError, "Error",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );

                    }
                });

                //----------------------------------------------------------------//
                // Populate the queue with requests to toggle indexing for each
                // data table.
                //----------------------------------------------------------------//
                for (var i = 0; i < aDataTables.length; i++) {
                    sDBTable = aDataTables[i];

                    if (bEnabled) {
                        sCommand = sDBTable + "_Add";
                    } else {
                        sCommand = sDBTable + "_Remove";
                    }

                    oDBIndexingQueue.addRequest({
                        library : "php",
                        url : iomy.apiphp.APILocation("serveradmin"),
                        data : {
                            Mode : "ChangeOptionalDBIndices",
                            Command : sCommand,
                            Access : JSON.stringify({
                                URI         : "localhost",
                                Port        : 3306,
                                Username    : sDBUsername,
                                Password    : sDBPassword
                            })
                        }
                    });
                }

                //-- Run the requests --//
                oDBIndexingQueue.execute();

            } catch (e) {
                $.sap.log.error("Error attempting to add and execute requests ("+e.name+"): " + e.message);
            }
        }
    }
    
});