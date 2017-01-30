/*
Title: Zigbee Custom Telnet Input widget
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the controls for entering Zigbee and RapidHA telnet commands
    to selected modems.
Copyright: Capsicum Corporation 2016

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

/**
 * Creates a widget that acts as an interface for sending telnet commands to 
 * Zigbee and RapidHA devices. Contains a text input for entering the command
 * and a button to bring up a menu containing the telnet commands most used.
 * Pressing one of these will place it into the text input box. A dialog asking
 * for a parameter be parsed may also appear if necessary.
 * 
 * @param {type} sID            ID of the whole widget itself (sap.m.HBox)
 * @param {type} mSettings      A map of settings
 * 
 * @returns {sap.m.HBox}        The Zigbee custom telnet input
 */
function ZigbeeCustomTelnetInput(sID, mSettings) {
    //========================================================================//
    // Properties
    //========================================================================//
    this.sID                = sID;
    this.sInputID           = sID+"--Input";
    this.sMenuButtonID      = sID+"--CommandMenuButton";
    this.sMenuID            = sID+"--CommandMenu";
    this.commandMenuOpen    = false;
    
    this.iPremiseID         = mSettings.premiseID;
    this.iCommID            = mSettings.commID;
    this.oScope             = mSettings.scope;
    
    //========================================================================//
    // Methods
    //========================================================================//
    this.toggleZigbeeCommands = function(bEnabled) {
        var me = this;
        
        try {
            sap.ui.getCore().byId(me.sInputID).setEnabled(bEnabled);
            sap.ui.getCore().byId(me.sMenuButtonID).setEnabled(bEnabled);
        } catch (e) {
            // Report it silently.
            jQuery.sap.log.error(e.message);
        }
    };
    
    this.createInputBox     = function () {
        var me = this;
        
        var oInput = new sap.m.Input(me.sInputID, {
            submit : function () {
                IOMy.devices.zigbeesmartplug.ToggleZigbeeCommands(me.oScope, false);

                IOMy.devices.zigbeesmartplug.ExecuteCustomCommand(me.oScope, this);
            }
        }).addStyleClass("width100Percent");
        
        me.input = oInput;
        
        return new sap.m.VBox({
            items : [
                oInput
            ]
        }).addStyleClass("width100Percent");
    };
    
    /**
     * Creates a button that will bring up a list of telnet commands to parse to
     * the selected zigbee dongle
     * 
     * @returns {sap.m.Button}      Button to invoke the command menu
     */
    this.createCommandMenu  = function () {
        var me = this;
        var oNavList = new sap.tnt.NavigationList({});
        
        //------------------------------------------------------------//
        // Insert each of the telnet commands to the menu.
        //------------------------------------------------------------//
        oNavList.addItem(
            new sap.tnt.NavigationListItem({
                text : "versioninfo",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        ).addItem(
            new sap.tnt.NavigationListItem({
                text : "modulesinfo",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        )
//        .addItem(
//            new sap.tnt.NavigationListItem({
//                text : "debug enable <amount>",
//                select : function() {
//                    // TODO: ENTER AN INPUT DIALOG
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        )
        .addItem(
            new sap.tnt.NavigationListItem({
                text : "debug output show",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        ).addItem(
            new sap.tnt.NavigationListItem({
                text : "debug output hide",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        )
//        .addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_join_network <rapidha UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        ).addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_form_network <rapidha UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        ).addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_form_network_netvoxchan <rapidha UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        ).addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_leave_network <rapidha UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        ).addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_reinit <rapidha UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        ).addItem(
//            new sap.tnt.NavigationListItem({
//                text : "rapidha_enable_tempjoin [<rapidha UUID>]",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        )
        .addItem(
            new sap.tnt.NavigationListItem({
                text : "get_rapidha_info",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        ).addItem(
            new sap.tnt.NavigationListItem({
                text : "get_zigbee_info",
                select : function() {
                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
                    sap.ui.getCore().byId(me.sInputID).fireSubmit();
                    sap.ui.getCore().byId(me.sMenuID).close();
                }
            })
        );
//        .addItem(
//            new sap.tnt.NavigationListItem({
//                text : "refresh_zigbee_info <local zigbee UUID>",
//                select : function() {
//                    sap.ui.getCore().byId(me.sInputID).setValue(this.getText());
//                    //sap.ui.getCore().byId(me.sInputID).fireSubmit();
//                    sap.ui.getCore().byId(me.sMenuID).close();
//                }
//            })
//        );

        //------------------------------------------------------------//
        // Create the button to invoke the menu.
        //------------------------------------------------------------//
        var oButton = new sap.m.Button(me.sMenuButtonID,{
            icon : "sap-icon://GoogleMaterial/add_circle",
            press : function (oControlEvent) {
                if (me.commandMenuOpen === false) {
                    // Get or create a new extra menu
                    var oButton = oControlEvent.getSource();
                    var oMenu;
                    if (sap.ui.getCore().byId(me.sMenuID) === undefined) {
                        oMenu = new sap.m.Popover(me.sMenuID, {
                            placement: sap.m.PlacementType.Bottom,
                            showHeader : false,
                            content: [oNavList]
                        }).addStyleClass("IOMYNavMenuContainer");
                    } else {
                        oMenu = sap.ui.getCore().byId(me.sMenuID);
                    }

                    oMenu.attachAfterClose(function () {
                        me.commandMenuOpen = false;
                    });

                    oMenu.openBy(oButton);
                    me.commandMenuOpen = true;
                    
                } else if (me.commandMenuOpen === true) {
                    sap.ui.getCore().byId(me.sMenuID).close();
                    
                } else {
                    // Some programmer made a silly little error for this to execute.
                    jQuery.sap.log.error("me.commandMenuOpen is neither true nor false.");
                }
            }
        }).addStyleClass("height100Percent minwidth40px");
        
        //--------------------------------------//
        // Store it in the object
        //--------------------------------------//
        me.menuButton = oButton;
        
        return oButton;
    };
    
    //========================================================================//
    // Widgets
    //========================================================================//
    
    this.widget = new sap.m.HBox(sID,{});
    
    this.widget.addItem(this.createInputBox());
    this.widget.addItem(this.createCommandMenu());
    
    this.toggleZigbeeCommands(mSettings.enabled);
}