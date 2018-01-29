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

sap.ui.controller("pages.staging.Development.ServerInfo", {
    aFormFragments:     {},
    bEditing: false,
    iThingId: null,
    
    
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
                //----------------------------------------------------//
                //-- Enable/Disable Navigational Forward Button        --//
                //----------------------------------------------------//
                
                //-- Refresh the Navigational buttons --//
                //-- IOMy.common.NavigationRefreshButtons( oController ); --//
                
                //-- Defines the Device Type --//
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.RefreshModel();
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
            "dbVersion"         : IomyRe.common.DatabaseVersion,
            "interfaceVersion"  : "0.4.11",
            
            "indices" : {}
        };
        
        oModel = new sap.ui.model.json.JSONModel(oData);
        
        oView.setModel(oModel);
    }
});