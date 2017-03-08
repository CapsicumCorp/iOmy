/*
Title: Zigbee Smart Plug Device Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Zigbee smart plug entry.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.devices.zigbeesmartplug",true);
IOMy.devices.zigbeesmartplug = new sap.ui.base.Object();

$.extend(IOMy.devices.zigbeesmartplug,{
	Devices: [],
    
    CommTypeID : 3,                         // This SHOULD NOT change!
    LinkTypeID : 2,
    
    iSelectedCommID : null,
    
    ConnectedZigbeeModems : {},             // Associative Array of all the Connected dongles
    bJoinModeToggleCoolingDown : false,
    bJoinModeToggleCoolDownPeriod : 180000, // 3 minute cooldown (in milliseconds)
    intervalCooldown : null,
    oZigbeeInput : null,
    sEnableTempJoinButtonText : "Join Device",
    sEnableTempJoinButtonTimerText : "Join Device",
    bRunningCommand : false,
    
    uiIDs : {
        sZigbeeModemsLabelID : "ZigbeeModemsLabel",
        sZigbeeModemsSBoxID : "ZigbeeModemsSBox",
        sTelnetOutputLabelID : "TelnetOutputLabel",
        sTelnetOutputTextAreaID : "TelnetOutputTextArea",
        sCustomTelnetCommandLabelID : "CustomTelnetCommandLabel",
        sCustomTelnetCommandFieldID : "CustomTelnetCommandField",
        sAPIModesHBoxID : "APIModesHBox",
        sGetRapidHAInfoButtonID : "GetRapidHAInfoButton",
        sEnableJoinModeButtonID : "EnableJoinModeButton"
    },
    
    //========================================================================//
    // TELNET FUNCTIONALITY
    //========================================================================//
    
    ZigbeeTelnetLog : [
        // Example: {
        //      "level":"I",
        //      "content":"all zigbee output for that command"
        // }
    ],
    
    /**
     * Enables or disables the telnet command widgets.
     * 
     * @param {type} oScope             Controller that contains the enable join mode button.
     * @param {type} bEnabled           Boolean switch to enable or disable the telnet controls.
     */
    ToggleZigbeeCommands : function (oScope, bEnabled) {
        var me = this;
        
        try {
            me.oZigbeeInput.input.setEnabled(bEnabled);
            me.oZigbeeInput.menuButton.setEnabled(bEnabled);
            oScope.byId(me.uiIDs.sEnableJoinModeButtonID).setEnabled(bEnabled);
        } catch (e) {
            // Report it silently.
            jQuery.sap.log.warning(e.message);
        }
    },
    
    TurnOnZigbeeJoinMode : function (oScope) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope
        //---------------------------------------------------------//
        var me              = this;
        var php             = IOMy.apiphp;
        var oOutputWidget   = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
        var oButton         = oScope.byId(me.uiIDs.sEnableJoinModeButtonID);
        var sText           = oButton.getText();
        
        //---------------------------------------------------------//
        // API Parameters
        //---------------------------------------------------------//
        var sUrl = php.APILocation("hubtelnet");
        var iCommId = me.iSelectedCommID;
        
        // Indicating that a telnet command is running
        me.bRunningCommand = true;
        
        //---------------------------------------------------------//
        // Indicate in the output widget that data is being loaded and
        // execute the AJAX Request
        //---------------------------------------------------------//
        oOutputWidget.setValue(oOutputWidget.getValue()+"Turning on Join Mode...\n\n");
        // Force it to scroll down to the bottom.
        document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        // Insert the output into the Telnet log
        me.ZigbeeTelnetLog.push({
            "level" : "I",
            "content" : "Turning on Join Mode...\n\n"
        });
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "TurnOnZigbeeJoinMode", "CommId" : iCommId},
            
            onSuccess : function (dataType, data) {
                if (data.Error === false || data.Error === undefined) {
                    
                    var sOutput = "";
                    
                    // Gather the RapidHA Information
                    sOutput += "-----------------------------------------\n";
                    sOutput += "Turn On Join Mode\n";
                    sOutput += "-----------------------------------------\n\n";
                    sOutput += data.Data.JoinMode.join("\n");
                    sOutput += "\n\n";
                    
                    // Insert the output into the Telnet log
                    me.ZigbeeTelnetLog.push({
                        "level" : "I",
                        "content" : sOutput
                    });
                    
                    if (oOutputWidget !== undefined) {
                        oOutputWidget.setValue(oOutputWidget.getValue() + sOutput);
                        // Force it to scroll down to the bottom.
                        document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
                    }
                    
                    this.onComplete();
                }
            },
            
            onFail : function (response) {
                var sOutput = "";
                sOutput += "-----------------------------------------\n";
                sOutput += "Turn On Join Mode\n";
                sOutput += "-----------------------------------------\n\n";
                sOutput += JSON.stringify(response);
                sOutput += "\n\n";
                
                // Insert the output into the Telnet log
                me.ZigbeeTelnetLog.push({
                    "level" : "E",
                    "content" : sOutput
                });
                
                if (oOutputWidget !== undefined) {
                    oOutputWidget.setValue(oOutputWidget.getValue() + sOutput);
                    // Force it to scroll down to the bottom.
                    document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
                }
                
                this.onComplete();
            },
            
            onComplete : function () {
                // The calling button and its text
                var iTime       = me.bJoinModeToggleCoolDownPeriod / 1000;
                var iElapsed    = 0;
                
                me.intervalCooldown = setInterval(
                    function () {
                        me.ToggleZigbeeCommands(oScope, false); // Make sure the telnet controls are disabled.
                        if (iTime === iElapsed) {
                            // Re-enable the button that called this function after the
                            // cooldown period expires.
                            try {
                                oButton.setText(sText);
                            } catch (e) {
                                // Ignore
                            } finally {
                                me.sEnableTempJoinButtonText = sText;
                            }
                            me.bJoinModeToggleCoolingDown = false;
                            //oButton.setEnabled(true);
                            clearInterval(me.intervalCooldown);
                            me.GetRapidHAInfo(oScope);
                        } else {
                            oButton.setText(sText + " - " + (iTime - iElapsed));
                            me.sEnableTempJoinButtonTimerText = sText + " - " + (iTime - iElapsed);
                            iElapsed++; 
                        }
                        
                    }, 1000
                );
            }
        });
    },
    
    GetRapidHAInfo : function (oScope) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope
        //---------------------------------------------------------//
        var me = this;
        var php = IOMy.apiphp;
        var oOutputWidget = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
        var sRapidHAOutput = "";
        var sZigbeeOutput = "";
        
        //---------------------------------------------------------//
        // API Parameters
        //---------------------------------------------------------//
        var sUrl = php.APILocation("hubtelnet");
        var iCommId = me.iSelectedCommID;
        
        //---------------------------------------------------------//
        // Indicate in the output widget that data is being loaded and
        // execute the AJAX Request
        //---------------------------------------------------------//
        if (oOutputWidget !== undefined) {
            oOutputWidget.setValue(oOutputWidget.getValue()+"Loading RapidHA Information...\n\n");
            // Force it to scroll down to the bottom.
            document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        }
        // Insert the output into the Telnet log
        me.ZigbeeTelnetLog.push({
            "level" : "I",
            "content" : "Loading RapidHA Information...\n\n"
        });
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "GetRapidHAInfo", "CommId" : iCommId},
            
            onSuccess : function (dataType, data) {
                if (data.Error === false || data.Error === undefined) {
                    
                    var oOutputWidget = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
                    
                    // Gather the RapidHA Information
                    sRapidHAOutput += "-----------------------------------------\n";
                    sRapidHAOutput += "RapidHA Information:\n";
                    sRapidHAOutput += "-----------------------------------------\n\n";
                    sRapidHAOutput += data.Data.RapidHAInfo.join("\n");
                    sRapidHAOutput += "\n\n";
                    
                    // Insert the output into the Telnet log
                    me.ZigbeeTelnetLog.push({
                        "level" : "I",
                        "content" : sRapidHAOutput
                    });
                    
                    // Gather the Zigbee Information
                    sZigbeeOutput += "-----------------------------------------\n";
                    sZigbeeOutput += "Zigbee Information:\n";
                    sZigbeeOutput += "-----------------------------------------\n\n";
                    sZigbeeOutput += data.Data.RapidHAInfo.join("\n");
                    sZigbeeOutput += "\n\n";
                    
                    // Insert the output into the Telnet log
                    me.ZigbeeTelnetLog.push({
                        "level" : "I",
                        "content" : sZigbeeOutput
                    });
                    
                    if (oOutputWidget !== undefined) {
                        oOutputWidget.setValue(oOutputWidget.getValue() + sRapidHAOutput+sZigbeeOutput);
                        // Force it to scroll down to the bottom.
                        document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
                    }
                    
                    this.onComplete();
                }
            },
            
            onFail : function (response) {
                var oOutputWidget = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
                var sOutput = "";
                sOutput = JSON.stringify(response);
                
                // Insert the output into the Telnet log
                me.ZigbeeTelnetLog.push({
                    "level" : "E",
                    "content" : sOutput
                });
                
                if (oOutputWidget !== undefined) {
                    oOutputWidget.setValue(oOutputWidget.getValue() + sOutput);
                    
                    // Force it to scroll down to the bottom.
                    document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
                }
                
                this.onComplete();
            },
            
            onComplete : function () {
                // Indicating that a telnet command has finished executing
                me.bRunningCommand = false;
                // Re-enable the button that called this function as well as the custom telnet input box
                me.ToggleZigbeeCommands(oScope, true);
            }
        });
    },
    
    /**
     * Runs a custom command via telnet to the hub.
     * 
     * @param {type} oScope
     * @param {type} oInputWidget
     * @returns {undefined}
     */
    ExecuteCustomCommand : function (oScope, oInputWidget) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope
        //---------------------------------------------------------//
        var me              = this;
        var php             = IOMy.apiphp;
        var oOutputWidget   = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
        
        //---------------------------------------------------------//
        // API Parameters
        //---------------------------------------------------------//
        var sUrl            = php.APILocation("hubtelnet");
        var iHubId          = oScope.byId("hubCBox").getSelectedKey();
        var sCommand        = oInputWidget.getValue();
        
        // Indicating that a telnet command is running
        me.bRunningCommand = true;
        
        //---------------------------------------------------------//
        // Indicate in the output widget that data is being loaded and
        // execute the AJAX Request
        //---------------------------------------------------------//
        oOutputWidget.setValue(oOutputWidget.getValue()+"Running "+sCommand+"...\n\n");
        // Force it to scroll down to the bottom.
        document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        // Insert the output into the Telnet log
        me.ZigbeeTelnetLog.push({
            "level" : "I",
            "content" : "Running "+sCommand+"...\n\n"
        });
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "CustomTelnetCommand", "HubId" : iHubId, "CustomCommand" : sCommand},
            
            onSuccess : function (dataType, data) {
                if (data.Error === false || data.Error === undefined) {
                    var sOutput = data.Data.Custom.join("\n");
                    
                    this.onComplete(sOutput, false);
                }
            },
            
            onFail : function (response) {
                var sOutput = JSON.stringify(response);
                
                this.onComplete(sOutput, true);
            },
            
            onComplete : function (output, bError) {
                var sOutput = "";
                sOutput += "-----------------------------------------\n";
                sOutput += "Custom Command: "+sCommand+"\n";
                sOutput += "-----------------------------------------\n\n";
                sOutput += output;
                sOutput += "\n\n";
                
                // Insert the output into the Telnet log
                me.ZigbeeTelnetLog.push({
                    "level" : !bError ? "I" : "E",
                    "content" : sOutput
                });
                
                if (oOutputWidget !== undefined) {
                    oOutputWidget.setValue(oOutputWidget.getValue() + sOutput);
                    
                    // Force it to scroll down to the bottom.
                    document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
                }
                
                me.ToggleZigbeeCommands(oScope, true);
                me.bRunningCommand = false;
            }
        });
    },
    
    FetchConnectedZigbeeModems : function (oScope, fnCallback) {
        //---------------------------------------------------------//
        // Defaults
        //---------------------------------------------------------//
        if (fnCallback === undefined) {
            fnCallback = function (mErrorInfo) {};
        }
        
        //---------------------------------------------------------//
        // Modules and scope
        //---------------------------------------------------------//
        var me                  = this;             // Capture the scope of the zigbee device module
        var odata               = IOMy.apiodata;    // Import the OData API module
        
        //---------------------------------------------------------//
        // Error Handling
        //---------------------------------------------------------//
        var bError              = false;
        var iRecordErrorCount   = 0;
        var aErrorMessages      = [];
        var mErrorInfo          = {};
        
        //---------------------------------------------------------//
        // OData Parameters
        //---------------------------------------------------------//
        var sUrl                = odata.ODataLocation("comms");
        var aColumns            = [
            // Comm Information
            "COMM_PK","COMM_NAME","COMM_JOINMODE","COMM_ADDRESS",
            // Hub Information
            "HUB_PK","HUB_NAME","HUB_SERIALNUMBER","HUB_IPADDRESS"
        ];
        var aFilter             = ["COMMTYPE_PK eq "+me.CommTypeID];
        var aOrderBy            = [];
        
        //---------------------------------------------------------//
        // Start the Request
        //---------------------------------------------------------//
        odata.AjaxRequest({
            Url             : sUrl,
            Columns         : aColumns,
            WhereClause     : aFilter,
            OrderByClause   : aOrderBy,
            
            onSuccess : function (dataType, data) {
                var mCurrentRecord = {};
                var bHasModems = false;
                
                try {
                    //---------------------------------------------------------//
                    // If there are no Zigbee modems, there is no reason to continue.
                    // Throw an exception.
                    //---------------------------------------------------------//
                    if (data.length === 0) {
                        throw "There are no Zigbee modems attached.";
                    }
                    //---------------------------------------------------------//
                    // Start going through each one
                    //---------------------------------------------------------//
                    for (var i = 0; i < data.length; i++) {
                        bHasModems = true;
                        
                        try {
                            //---------------------------------------------------------//
                            // Make a whole-hearted attempt to collect information from
                            // each Zigbee modem.
                            //---------------------------------------------------------//
                            mCurrentRecord = data[i];
                            me.ConnectedZigbeeModems["_"+mCurrentRecord.COMM_PK] = {
                                // Comm Information
                                "CommId"        : mCurrentRecord.COMM_PK,
                                "CommName"      : mCurrentRecord.COMM_NAME,
                                "CommJoinMode"  : mCurrentRecord.COMM_JOINMODE,
                                "CommAddress"   : mCurrentRecord.COMM_ADDRESS,

                                // Hub Information
                                "HubId"             : mCurrentRecord.HUB_PK,
                                "HubName"           : mCurrentRecord.HUB_NAME,
                                "HubSerialNumber"   : mCurrentRecord.HUB_SERIALNUMBER,
                                "HubIPAddress"      : mCurrentRecord.HUB_IPADDRESS,
                                "HubTypeId"         : mCurrentRecord.HUBTYPE_PK,
                                "HubTypeName"       : mCurrentRecord.HUBTYPE_NAME
                            };
                        } catch (e) {
                            //---------------------------------------------------------//
                            // Something went wrong with this particular record.
                            //---------------------------------------------------------//
                            iRecordErrorCount++;
                            aErrorMessages.push(mCurrentRecord.HUB_NAME+" ("+mCurrentRecord.HUB_PK+"): Failed to load information: "+e.message);
                        }
                    }
                    
                    if (bHasModems === false) {
                        // Disable the command widgets because no modems were detected.
                        me.ToggleZigbeeCommands(oScope, false);
                    } else {
                        // Otherwise, enable them if they're not already
                        me.ToggleZigbeeCommands(oScope, true);
                    }
                    
                } catch (e) {
                    //---------------------------------------------------------//
                    // There was something wrong with the data structure. This
                    // is hopefully because of an empty list of modems. In any
                    // case, the error is reported.
                    //---------------------------------------------------------//
                    bError = true;
                    aErrorMessages.push(e.message);
                    // Disable the command widgets because no modems were detected.
                    me.ToggleZigbeeCommands(oScope, false);
                }
                
                //-------------------------------------------------------------//
                // Compile the error info map and run the callback function with it
                //-------------------------------------------------------------//
                mErrorInfo.bError = bError;
                mErrorInfo.aErrorMessages = aErrorMessages;
                mErrorInfo.iRecordErrorCount = iRecordErrorCount;
                
                fnCallback(mErrorInfo);
            },
            
            onFail : function (response) {
                bError = true;
                fnCallback(mErrorInfo);
            }
        });
    },
    
    CreateLinkForm : function(oScope, oFormBox, aElementsToEnableOnSuccess, aElementsToEnableOnFailure) {
        var me = this;
        var oFormItem;
        var oAPIModesHBox = new sap.m.HBox(oScope.createId(me.uiIDs.sAPIModesHBoxID), {}).addStyleClass("width100Percent");
        var showErrorDialog = IOMy.common.showError;
        
        oScope.byId("addButton").setEnabled(false);
        
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sAPIModesHBoxID);
        //--------------------------------------------------------------------//
        // Zigbee Modems
        //--------------------------------------------------------------------//
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sZigbeeModemsLabelID);
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sZigbeeModemsLabelID), {
            text : "Attached Zigbee Modems"
        });
        oFormBox.addItem(oFormItem);
        
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sZigbeeModemsSBoxID);
        oFormItem = new sap.m.Select(oScope.createId(me.uiIDs.sZigbeeModemsSBoxID), {
            width : "100%",
            change : function () {
                me.iSelectedCommID = this.getSelectedKey();
            }
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oFormItem);
        
        // Attempt to fetch the Zigbee modems
        me.FetchConnectedZigbeeModems(oScope,
            function (mErrorInfo) {
                var firstSelection = null;
                var bNoModems = false;
                
                // Check if a fatal error occurred
                if (mErrorInfo.bError === true) {
                    // If so report it and take no further action.
                    jQuery.sap.log.error(mErrorInfo.join("\n"));
                    showErrorDialog(mErrorInfo.join("\n\n"));
                } else {
                    // Otherwise, first check how many records failed to load.
                    // If any records failed to load, report them then continue.
                    if (mErrorInfo.iRecordErrorCount > 0) {
                        jQuery.sap.log.error(mErrorInfo.join("\n"));
                        showErrorDialog(mErrorInfo.join("\n\n"));
                    }
                    
                    // Now populate the Zigbee modem select box
                    if (JSON.stringify(me.ConnectedZigbeeModems) === "{}") {
                        oScope.byId(me.uiIDs.sZigbeeModemsSBoxID).addItem(
                            new sap.ui.core.Item({
                                text : "No Zigbee Modems Detected"
                            })
                        );
                
                        oScope.byId(me.uiIDs.sZigbeeModemsSBoxID).setEnabled(false);
                        me.ToggleZigbeeCommands(oScope, false);
                    } else {
                        $.each(me.ConnectedZigbeeModems, function(sIndex, aModem) {
                            if (sIndex !== undefined && sIndex !== null
                                    && aModem !== undefined && aModem !== null)
                            {
                                oScope.byId(me.uiIDs.sZigbeeModemsSBoxID).addItem(
                                    new sap.ui.core.Item({
                                        text : aModem.CommName,
                                        key : aModem.CommId
                                    })
                                );

                                if (firstSelection === null) {
                                    firstSelection = aModem;
                                }
                            }
                        });

                        oScope.byId(me.uiIDs.sZigbeeModemsSBoxID).setSelectedKey(firstSelection.CommId);
                        me.iSelectedCommID = firstSelection.CommId;
                        me.ToggleZigbeeCommands(oScope, !me.bRunningCommand);
                    }
                }
                
            }
        );
        
        //--------------------------------------------------------------------//
        // Zigbee Custom Telnet Commands
        //--------------------------------------------------------------------//
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sCustomTelnetCommandLabelID);
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sCustomTelnetCommandLabelID), {
            text : "Custom Telnet Command"
        });
        oFormBox.addItem(oFormItem);
        
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sCustomTelnetCommandFieldID);
        
        oFormItem = new ZigbeeCustomTelnetInput(oScope.createId(me.uiIDs.sCustomTelnetCommandFieldID), {
            scope : oScope,
            enabled : !me.bRunningCommand
        });
        oFormItem.widget.addStyleClass("width100Percent");
        oFormBox.addItem(oFormItem.widget);
        me.oZigbeeInput = oFormItem;
        
        //--------------------------------------------------------------------//
        // Enable Join Mode
        //--------------------------------------------------------------------//
        oScope.aElementsForAFormToDestroy.push("EnableJoinModeButtonHolder");
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sEnableJoinModeButtonID);
        
        oFormItem = new sap.m.VBox(oScope.createId("EnableJoinModeButtonHolder"), {
            items : [
                new sap.m.Link(oScope.createId(me.uiIDs.sEnableJoinModeButtonID), {
                    text : "Join Devices",
                    // If it's not cooling down, then it will be enabled
                    enabled : !me.bRunningCommand,
                    press : function () {
                        me.bJoinModeToggleCoolingDown = true;
                        me.ToggleZigbeeCommands(oScope, false);
                        
                        // The command to re-enable this button is called by this function
                        me.TurnOnZigbeeJoinMode(oScope);
                    }
                }).addStyleClass("SettingsLinks TelnetCommandButton width100Percent TextCenter")
            ]
        }).addStyleClass("TextCenter width100Percent");
        oAPIModesHBox.addItem(oFormItem);
        
        //--------------------------------------------------------------------//
        // Placeholder for the Zigbee telnet command buttons
        //--------------------------------------------------------------------//
        oFormBox.addItem(oAPIModesHBox);
        
        //--------------------------------------------------------------------//
        // Telnet output label and text area
        //--------------------------------------------------------------------//
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sTelnetOutputLabelID);
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sTelnetOutputLabelID), {
            text : "Telnet Output"
        });
        oFormBox.addItem(oFormItem);
        
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sTelnetOutputTextAreaID);
        oFormItem = new sap.m.TextArea(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID), {
            editable : false,
            growing : true
        }).addStyleClass("width100Percent TelnetOutput");
        
        // Populate it with any prior output.
        if (me.ZigbeeTelnetLog.length > 0) {
            var output = "";
            for (var i = 0; i < me.ZigbeeTelnetLog.length; i++) {
                output += me.ZigbeeTelnetLog[i].content;
            }
            oFormItem.setValue(output);
            oFormItem.selectText(output.length, output.length);
            // Force it to scroll down to the bottom.
            document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        }
        
        oFormBox.addItem(oFormItem);
    },
	
	// For All other pages except the DeviceOverview Page. See "GetCommonUIForDeviceOverview"
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData, bIsUnassigned ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        
        //-- 1.1 - Set default values		--//
        if (bIsUnassigned === undefined)
            bIsUnassigned = false;
        
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);
        
        // If the UI is for the Unassigned Devices List, include 
        if (bIsUnassigned === true) {
            aUIObjectItems.push(
                new sap.m.CheckBox(oViewScope.createId(sPrefix+"_Selected"), {
                    selected : false
                }).addStyleClass("MarTop10px")
            );
        }
        
        aUIObjectItems.push(
            //------------------------------------//
            //-- 1st is the Device Label		--//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
						width: "85%",
                        text : aDeviceData.DeviceName,
                        press : function () {
                            IOMy.common.NavigationChangePage("pDeviceData", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20")
                ]
            }).addStyleClass("width80Percent BorderRight jbMR1tempfix")
        );

        aUIObjectItems.push(
            //------------------------------------//
            //-- 2nd is the Device Data			--//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                        //--------------------------------//
                        //-- Draw the Data Boxes		--//
                        //--------------------------------//

                        items: [
                            new sap.m.Text( oViewScope.createId( sPrefix+"_Volt" ),	{} ).addStyleClass("Font-RobotoCondensed"),
                            new sap.m.Text( oViewScope.createId( sPrefix+"_Amp" ),	{} ).addStyleClass("Font-RobotoCondensed"),
                            new sap.m.Text( oViewScope.createId( sPrefix+"_kW" ),	{} ).addStyleClass("Font-RobotoCondensed"),
                            new sap.m.Text( oViewScope.createId( sPrefix+"_kWh" ),	{} ).addStyleClass("Font-RobotoCondensed")
                        ]
                    }).addStyleClass("MarLeft12px")
                ]
            }).addStyleClass("minwidth90px minheight58px")
        );

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

        //-- Initialise Variables --//
        var sStatusButtonText			= "";
        var bButtonStatus				= false;

        //-- Store the Device Status --//
        var iDeviceStatus		= aDeviceData.DeviceStatus;
        var iTogglePermission	= aDeviceData.PermToggle;
        //var iTogglePermission	= 0;


        //-- Set Text --//
        if( iDeviceStatus===0 ) {
            sStatusButtonText	= "Off";
            bButtonStatus		= false;
        } else {
            sStatusButtonText	= "On";
            bButtonStatus		= true;
        }

        //------------------------------------//
        //-- Make the Container				--//
        //------------------------------------//
        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
            items:[] 
        }).addStyleClass("minwidth80px DeviceLabelMargin");	//-- END of VBox that holds the Toggle Button


        //-- Add the Button's background colour class --//
        if( iTogglePermission===0 ) {

            //----------------------------//
            //-- NON TOGGLEABLE BUTTON	--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    enabled: false
                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
            );

        } else {

            //----------------------------//
            //-- TOGGLEABLE BUTTON		--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    change: function () {
                        //-- Bind a link to this button for subfunctions --//
                        var oCurrentButton = this;
                        //-- AJAX --//
                        IOMy.apiphp.AjaxRequest({
                            url: IOMy.apiphp.APILocation("statechange"),
                            type: "POST",
                            data: { 
                                "Mode":"ThingToggleStatus", 
                                "Id": aDeviceData.DeviceId
                            },
                            onFail : function(response) {
                                IOMy.common.showError(response.message, "Error Changing Device Status");
                            },
                            onSuccess : function( sExpectedDataType, aAjaxData ) {
                                //console.log(aAjaxData.ThingPortStatus);
                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].UILastUpdate = new Date();
                                }
                            }
                        });
                    }
                }).addStyleClass("DeviceOverviewStatusToggleSwitch MarTop4px") //-- END of ToggleButton --//
            );
        }

        oUIObject.addItem(oUIStatusContainer);
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    GetCommonUITaskList: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		//console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                if( aIO.RSTypeId===102 || aIO.RSTypeId===103 ) {
                    aTasks.Low.push({
                        "Type":"DeviceValueKWHTotal", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "IOUoMName":	aIO.UoMName,
                            "LabelId":			Prefix+"_kWh"
                        }
                    });

                } else if( aIO.RSTypeId===2001 ) {
                    aTasks.High.push({
                        "Type":"DeviceValueKW", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "LabelId":			Prefix+"_kW"
                        }
                    });

                } else if (aIO.RSTypeId === 2101) {
                    //-- VOLT DATA --//
                    aTasks.High.push({
                        "Type":"DeviceValueVolt", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "LabelId":			Prefix+"_Volt"
                        }
                    });
                } else if (aIO.RSTypeId === 2201) {
                    //-- AMP DATA --//
                    aTasks.High.push({
                        "Type":"DeviceValueAmp", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "LabelId":			Prefix+"_Amp"
                        }
                    });
                }
            });
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
		return aTasks;
	},
    
    GetCommonUIForDeviceOverview: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: [
                //------------------------------------//
                //-- 1st is the Device Label		--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
							width: "85%",
                            text : aDeviceData.DeviceName,
                            press : function () {
                                IOMy.common.NavigationChangePage("pDeviceData", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("MarLeft6px TextSizeMedium MarTop20px Text_grey_20")
                    ]
                }).addStyleClass("BorderRight width80Percent jbMR1tempfix"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//
                            items: [
                                new sap.m.Text( oViewScope.createId( sPrefix+"_kW" ),	{} ).addStyleClass(" Font-RobotoCondensed")
                            ]
                        }).addStyleClass("MarLeft12px MarTop20px")
                    ]
                }).addStyleClass("minheight58px minwidth90px")
            ]
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

        //-- Initialise Variables --//
        var bButtonStatus				= false;

        //-- Store the Device Status --//
        var iDeviceStatus		= aDeviceData.DeviceStatus;
        var iTogglePermission	= aDeviceData.PermToggle;
        //var iTogglePermission	= 0;


        //-- Set Text --//
        if( iDeviceStatus===0 ) {
            bButtonStatus		= false;
        } else {
            bButtonStatus		= true;
        }

        //-- DEBUGGING --//
        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);

        //------------------------------------//
        //-- Make the Container				--//
        //------------------------------------//
        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
            items:[] 
        }).addStyleClass("minwidth80px");	//-- END of VBox that holds the Toggle Button


        //-- Add the Button's background colour class --//
        if( iTogglePermission===0 ) {

            //----------------------------//
            //-- NON TOGGLEABLE BUTTON	--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    enabled: false
                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
            );

        } else {

            //----------------------------//
            //-- TOGGLEABLE BUTTON		--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    change: function () {
                        //-- Bind a link to this button for subfunctions --//
                        var oCurrentButton = this;
                        //-- AJAX --//
                        IOMy.apiphp.AjaxRequest({
                            url: IOMy.apiphp.APILocation("statechange"),
                            type: "POST",
                            data: { 
                                "Mode":"ThingToggleStatus", 
                                "Id": aDeviceData.DeviceId
                            },
                            onFail : function(response) {
                                IOMy.common.showError(response.message, "Error Changing Device Status");
                            },
                            onSuccess : function( sExpectedDataType, aAjaxData ) {
                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].UILastUpdate = new Date();
                                }
                            }
                        });
                    }
                }).addStyleClass("DeviceOverviewStatusToggleSwitch MarTop4px") //-- END of ToggleButton --//
            );
        }

        oUIObject.addItem(oUIStatusContainer);


		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	
	GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                if( aIO.RSTypeId===2001 ) {
                    aTasks.High.push({
                        "Type":"DeviceValueKW", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "LabelId":			Prefix+"_kW"
                        }
                    });
                }
            });
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
		return aTasks;
	},
	
	
	GetObjectIdList: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			
			aObjectIdList = [
				sPrefix+"_Container",
				sPrefix+"_Label",
				sPrefix+"_DataContainer",
				sPrefix+"_Volt",
				sPrefix+"_Amp",
				sPrefix+"_kW",
				sPrefix+"_kWh",
				sPrefix+"_StatusContainer",
				sPrefix+"_StatusToggle"
			];
			
		}
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
});