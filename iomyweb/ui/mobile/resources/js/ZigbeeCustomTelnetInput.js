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
    // Properties                                                             //
    //========================================================================//
    this.sID                = sID;
    this.sInputID           = sID+"--Input";
    this.sMenuButtonID      = sID+"--CommandMenuButton";
    this.sMenuID            = sID+"--CommandMenu";
    this.commandMenuOpen    = false;
    this.aCommands          = [
        "versioninfo",
        "modulesinfo",
        "debug output show",
        "debug output hide",
        "get_rapidha_info",
        "get_zigbee_info"
    ];
    
    this.iPremiseID         = mSettings.premiseID;
    this.iCommID            = mSettings.commID;
    this.oScope             = mSettings.scope;
    
    //========================================================================//
    // Methods                                                                //
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
    
    this.createInputBox = function () {
        var me = this;
        
        var oInput = new sap.m.Input(me.sInputID, {
			layoutData : new sap.m.FlexItemData({
				growFactor : 0
			}),
            submit : function () {
                IOMy.devices.zigbeesmartplug.ToggleZigbeeCommands(me.oScope, false);

                IOMy.devices.zigbeesmartplug.ExecuteCustomCommand(me.oScope, this);
            }
        }).addStyleClass("SettingsTextInput");
        
        me.input = oInput;
        
        return new sap.m.VBox({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
            items : [
                oInput
            ]
        }).addStyleClass("");
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
        
		// #TODO:# - Move over to a $.each Loop
        //------------------------------------------------------------//
        // Insert each of the telnet commands to the menu.            //
        //------------------------------------------------------------//
        
		$.each(me.aCommands, function (iIndex, sCommand) {
			oNavList.addItem(
                new sap.tnt.NavigationListItem({
                    text : sCommand,
                    select : function() {
                        sap.ui.getCore().byId(me.sInputID).setValue(sCommand);
                        sap.ui.getCore().byId(me.sInputID).fireSubmit();
                        sap.ui.getCore().byId(me.sMenuID).close();
                    }
                })
            );
		});
        
        //------------------------------------------------------------//
        // Create the button to invoke the menu.                      //
        //------------------------------------------------------------//
        var oButton = new sap.m.Button(me.sMenuButtonID,{
            icon : "sap-icon://GoogleMaterial/add_circle",
            press : function (oControlEvent) {
                if (me.commandMenuOpen !== true) {
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
                    
                } else {
                    sap.ui.getCore().byId(me.sMenuID).close();
                    
//                } else {
//                    // Some programmer made a silly little error for this to execute.
//                    jQuery.sap.log.error("me.commandMenuOpen is neither true nor false.");
                }
            }
        }).addStyleClass("height100Percent minwidth40px");
        
        //--------------------------------------//
        // Store it in the object               //
        //--------------------------------------//
        me.menuButton = oButton;
        
        return oButton;
    };
    
    //========================================================================//
    // Widgets                                                                //
    //========================================================================//
    
    this.widget = new sap.m.HBox(sID,{});
    
    this.widget.addItem(this.createInputBox());
    this.widget.addItem(this.createCommandMenu());
    
    this.toggleZigbeeCommands(mSettings.enabled);
}

ZigbeeCustomTelnetInput.prototype.getValue = function () {
	return sap.ui.getCore().byId(this.sInputID).getValue();
};

ZigbeeCustomTelnetInput.prototype.setValue = function (sValue) {
	sap.ui.getCore().byId(this.sInputID).setValue(sValue);
};