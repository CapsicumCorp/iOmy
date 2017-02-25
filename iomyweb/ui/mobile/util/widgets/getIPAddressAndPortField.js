/*
Title: IP Address And Port Field
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates two fields for the IP address and port.
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

$.sap.declare("IOMy.widgets.getIPAddressAndPortField",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates two fields, IP address and port.
     * 
     * Required arguments:
     * - scope              UI5 view or controller where the element IDs are managed.
     * - ipAddressFieldID   Element ID for the IP address.
     * - ipPortFieldID      Element ID for the port.
     * 
     * Optional arguments:
     * - defaultIPAddress   IP address to show initially (blank by default)
     * - defaultIPPort      IP address to show initially (80 by default)
     * 
     * @param {type} mSettings                  Map of parameters
     * @returns {sap.m.Text|sap.m.VBox}         Returns a VBox containing the fields or a Text widget reporting an error.
     */
    getIPAddressAndPortField : function (mSettings) {
        // Check that there is a settings map.
        if (mSettings === undefined) {
            throw "Settings must be specified.";
        } else {
            var sErrors = ""; // Error string
            
            // Is the scope specified?
            if (mSettings.scope === undefined) {
                sErrors += "The scope of the controller must be parsed.";
            }
            
            // Is the IP Address Field ID specified?
            if (mSettings.ipAddressFieldID === undefined) {
                if (sErrors.length === 0) {
                    sErrors += "\n";
                }
                sErrors += "The HTML ID for the IP Address field must be given.";
            }
            
            // Is the IP Port Field ID specified?
            if (mSettings.ipPortFieldID === undefined) {
                if (sErrors.length === 0) {
                    sErrors += "\n";
                }
                sErrors += "The HTML ID for the IP Port field must be given.";
            }
            
            // If one or more of the required fields are not specified, throw the errors
            if (sErrors.length > 0) {
                throw sErrors;
            }
        }
        
        // If the default IP address is not given, leave them blank.
        if (mSettings.defaultIPAddress === undefined) {
            mSettings.defaultIPAddress = "";
        }
        
        // If the default port is not given, show the HTTP port number 80
        if (mSettings.defaultIPPort === undefined) {
            mSettings.defaultIPPort = "80";
        }
        
        //--------------------------------------------------------------------//
        // Declare variables
        //--------------------------------------------------------------------//
        
        var me = mSettings.scope;
        var oIPAddressAndPortLabel;
        var oIPAddressField, oColon, oIPPort;
        var oIPAddressAndPortBox;
        var oWidget;
        
        //--------------------------------------------------------------------//
        // Draw the widget
        //--------------------------------------------------------------------//
        try {
            // LABEL
            me.aElementsForAFormToDestroy.push("IPAddressLabel");
            oIPAddressAndPortLabel = new sap.m.Label(me.createId("IPAddressLabel"), {
                text : "IP Address and port (eg. 10.9.9.9:80)"
            });
            me.byId("formBox").addItem(oIPAddressAndPortLabel);

            // FIELD
            me.aElementsForAFormToDestroy.push(mSettings.ipAddressFieldID);
            oIPAddressField = new sap.m.Input(me.createId(mSettings.ipAddressFieldID), {
                value : mSettings.defaultIPAddress
            }).addStyleClass("width100Percent SettingsTextInput");

            me.aElementsForAFormToDestroy.push("Colon");
            oColon = new sap.m.Text(me.createId("Colon"), {
                text : ":"
            }).addStyleClass("PadLeft5px PadRight5px FlexNoShrink LineHeight45px");

            me.aElementsForAFormToDestroy.push(mSettings.ipPortFieldID);
            oIPPort = new sap.m.Input(me.createId(mSettings.ipPortFieldID), {
                value : mSettings.defaultIPPort
            }).addStyleClass("width100px SettingsTextInput FlexNoShrink");

            me.aElementsForAFormToDestroy.push("IPBox");
            oIPAddressAndPortBox = new sap.m.HBox(me.createId("IPBox"), {
                items : [ oIPAddressField,oColon,oIPPort ]
            }).addStyleClass("width100Percent IPAddressBox");
            me.byId("formBox").addItem(oIPAddressAndPortBox);
            
            me.aElementsForAFormToDestroy.push("IPWidget");
            oWidget = new sap.m.VBox(me.createId("IPWidget"), {
                items : [oIPAddressAndPortLabel,oIPAddressAndPortBox]
            });
            
        } catch (e) {
            
            jQuery.sap.log.error("Error in IOMy.widgets.getIPAddressAndPortField(): "+e.message);
            IOMy.common.showError("Failed to load the IP Address and Port field\n\n"+e.message, "Error");
            
            me.aElementsForAFormToDestroy.push(mSettings.ipAddressFieldID);
            oWidget = new sap.m.Text(mSettings.ipAddressFieldID, {text : "Failed to load the IP Address and Port field."});
            
        } finally {
            
            return oWidget;
        }
    }
    
});