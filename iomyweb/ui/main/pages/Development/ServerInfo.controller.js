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

sap.ui.controller("pages.Development.ServerInfo", {
    
    bIndexingOn         : false,
    bCanEditIndexing    : false,
    
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
                
                //-- Defines the Device Type --//
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.RefreshModel();
                oController.CheckDBIndexing();
            }
        });
    },
    
    RefreshModel : function () {
        var oController         = this;
        var oView               = this.getView();
        var oData               = {};
        var oModel              = {};
        var oConfig             = sap.ui.getCore().getConfiguration(); 
        var oVersion            = oConfig.getVersion();
        
        oData = {
            "ui5Version"        : oVersion.toString(),
            "dbVersion"         : iomy.common.DatabaseVersion,
            "interfaceVersion"  : "0.4.11",              // TODO: Interface version is hardcoded. Each time a release is done, this will need to be updated.
            
            "indexingOn"        : oController.bIndexingOn,
            "editIndex"         : {
                "tickBoxText"       : "Database Indexed",
                "buttonVisible"     : true,
                "buttonEnabled"     : false
            }
        };
        
        oModel = new sap.ui.model.json.JSONModel(oData);
        
        oView.setModel(oModel);
    },
    
    AllowEditIndex : function (bAllowed) {
        var oController         = this;
        var oView               = oController.getView();
        var oData               = JSON.parse(oView.getModel().getJSON());
        var oModel              = {};
        
        try {
            if (bAllowed) {
                oData.indexingOn = oController.bIndexingOn;
                
                oData.editIndex = {
                    "tickBoxText"       : "Database Indexed",
                    "buttonVisible"     : bAllowed,
                    "buttonEnabled"     : bAllowed
                };
                
            } else {
                oData.indexingOn = false;
                
                oData.editIndex = {
                    "tickBoxText"       : "Unable to check indexing",
                    "buttonVisible"     : bAllowed,
                    "buttonEnabled"     : bAllowed
                };
                
            }
            
            oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel);
        } catch (e) {
            $.sap.log.error("Error when modifying the database indexing controls ("+e.name+"): " + e.message);
        }
    },
    
    CheckDBIndexing : function () {
        var oController     = this;
        
        try {
            iomy.functions.server.getDBIndexingState({
                onSuccess : function (bState) {
                    oController.bIndexingOn = bState;
                    
                    oController.AllowEditIndex(true);
                },

                onFail : function (sErrorMessage) {
                    $.sap.log.error(sErrorMessage);
                    
                    oController.AllowEditIndex(false);
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error attempting to call the function to retrieve the database indexing state ("+e.name+"): " + e.message);
            oController.AllowEditIndex(false);
        }
        
    }
    
});