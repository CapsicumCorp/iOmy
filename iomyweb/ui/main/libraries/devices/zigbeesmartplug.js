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

$.sap.declare("iomy.devices.zigbeesmartplug",true);
iomy.devices.zigbeesmartplug = new sap.ui.base.Object();

$.extend(iomy.devices.zigbeesmartplug,{
    
    CommTypeId : 3,                         // This SHOULD NOT change!
    LinkTypeId : 2,
    ThingTypeId : 2,
    
    iSelectedCommID : null,
    
    ConnectedZigbeeModems : {},             // Associative Array of all the Connected dongles
    bJoinModeToggleCoolingDown : false,
    bJoinModeToggleCoolDownPeriod : 5000, // 5 second cooldown (in milliseconds)
    intervalCooldown : null,
    wTelnetLogArea : null,
    bRunningCommand : false,
    
    //========================================================================//
    // TELNET FUNCTIONALITY                                                   //
    //========================================================================//
    
    ZigbeeTelnetLog : [
        // Example: {
        //      "level":"I",
        //      "content":"all zigbee output for that command"
        // }
    ],
    
    TurnOnZigbeeJoinMode : function (mSettings) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope                       //
        //---------------------------------------------------------//
        var oModule         = this;
        var bError          = false;
        var aErrorMessages  = [];
        var sUrl            = iomy.apiphp.APILocation("hubtelnet");
        var iCommId;
        var fnSuccess;
        var fnFail;
        
        var sModemIDMissing = "Modem ID/Comm ID (modemID) not given.";
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the modem (comm) ID
            //----------------------------------------------------------------//
            if (mSettings.modemID === undefined || mSettings.modemID === null) {
                fnAppendError(sModemIDMissing);
            } else {
                iCommId = mSettings.modemID;
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sModemIDMissing);
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        // Indicating that a telnet command is running
        oModule.bRunningCommand = true;
        
        // Force it to scroll down to the bottom.
        //document.getElementById(oScope.createId(oModule.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(oModule.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        
        try {
            iomy.apiphp.AjaxRequest({
                url : sUrl,
                data : {"Mode" : "TurnOnZigbeeJoinMode", "CommId" : iCommId},

                onSuccess : function (dataType, data) {
                    if (data.Error === false || data.Error === undefined) {
                        if (data.Data.RapidHAInfo !== undefined && data.Data.RapidHAInfo !== null) {
                            if (data.Data.RapidHAInfo.findIndex("Network State=Network Down") !== -1 && data.Data.RapidHAInfo instanceof "Array") {
                                fnFail("RapidHA network is down. Try running 'rapidha_form_network <rapidhauuid>' in the command input "+
                                    "or 'rapidha_form_network_netvoxchan <rapidhauuid>' for netvox compatible channels.\n\nTo obtain the "+
                                    "rapidhauuid, run 'get_rapidha_info' to copy it down.");
                            }
                        } else {
                            fnSuccess(data.Data.JoinMode.join("\n"));
                        }
                    } else {
                        fnFail(data.ErrMesg);
                    }

                    oModule.bRunningCommand = false;
                },

                onFail : function (response) {
                    fnFail(response.responseText);
                    oModule.bRunningCommand = false;
                }
            });
        } catch (e) {
            fnFail("Error turning on Zigbee Join Mode ("+e.name+"): " + e.message);
        }
    },
    
    GetRapidHAInfo : function (mSettings) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope                       //
        //---------------------------------------------------------//
        var oModule         = this;
        var bError          = false;
        var aErrorMessages  = [];
        var sUrl            = iomy.apiphp.APILocation("hubtelnet");
        var iCommId;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the modem (comm) ID
            //----------------------------------------------------------------//
            if (mSettings.modemID === undefined || mSettings.modemID === null) {
                fnAppendError("'modemID' not given");
            } else {
                iCommId = mSettings.modemID;
            }
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new MissingArgumentException("* "+aErrorMessages.join("\n* "));
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError("'modemID' not given");
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        oModule.bRunningCommand = true;
        
        try {
            iomy.apiphp.AjaxRequest({
                url : sUrl,
                data : {"Mode" : "GetRapidHAInfo", "CommId" : iCommId},

                onSuccess : function (dataType, data) {
                    if (data.Error === false || data.Error === undefined) {

                        fnSuccess(data);

    //                    iomy.common.RefreshCoreVariables({
    //                        onSuccess : function () {
    //                            iomy.common.showMessage({
    //                                text : "Join completed. Your devices should appear in 5 minutes.",
    //                                view : oScope.getView()
    //                            });
    //                        }
    //                    });
                    } else {
                        fnFail(data.ErrMesg);
                    }

                    oModule.bRunningCommand = false;
                },

                onFail : function (response) {

                    oModule.bRunningCommand = false;
                    fnFail(response.responseText);
                }
            });
        } catch (e) {
            fnFail("Error fetching RapidHA information ("+e.name+"): " + e.message);
        }
    },
    
    FetchConnectedZigbeeModems : function (oScope, fnCallback) {
        //---------------------------------------------------------//
        // Defaults                                                //
        //---------------------------------------------------------//
        if (fnCallback === undefined) {
            fnCallback = function () {};
        }
        
        //---------------------------------------------------------//
        // Modules and scope                                       //
        //---------------------------------------------------------//
        var oModule             = this;             // Capture the scope of the zigbee device module
        
        //---------------------------------------------------------//
        // Error Handling                                          //
        //---------------------------------------------------------//
        var bError              = false;
        var iRecordErrorCount   = 0;
        var aErrorMessages      = [];
        var mErrorInfo          = {};
        
        //---------------------------------------------------------//
        // OData Parameters                                        //
        //---------------------------------------------------------//
        var sUrl                = iomy.apiodata.ODataLocation("comms");
        var aColumns            = [
            // Comm Information
            "COMM_PK","COMM_NAME","COMM_JOINMODE","COMM_ADDRESS",
            // Hub Information
            "HUB_PK","HUB_NAME","HUB_SERIALNUMBER","HUB_IPADDRESS"
        ];
        var aFilter             = ["COMMTYPE_PK eq "+oModule.CommTypeId];
        var aOrderBy            = [];
        
        //---------------------------------------------------------//
        // Start the Request                                       //
        //---------------------------------------------------------//
        try {
            iomy.apiodata.AjaxRequest({
                Url             : sUrl,
                Columns         : aColumns,
                WhereClause     : aFilter,
                OrderByClause   : aOrderBy,

                onSuccess : function (dataType, data) {
                    var mCurrentRecord = {};
                    var bHasModems = false;

                    try {
                        //----------------------------------------------------------------//
                        // If there are no Zigbee modems, there is no reason to continue. //
                        // Throw an exception.                                            //
                        //----------------------------------------------------------------//
                        if (data.length === 0) {
                            throw new NoZigbeeModemsException();
                        }
                        //---------------------------------------------------------//
                        // Start going through each one                            //
                        //---------------------------------------------------------//
                        for (var i = 0; i < data.length; i++) {
                            bHasModems = true;

                            try {
                                //----------------------------------------------------------//
                                // Make a whole-hearted attempt to collect information from //
                                // each Zigbee modem.                                       //
                                //----------------------------------------------------------//
                                mCurrentRecord = data[i];
                                oModule.ConnectedZigbeeModems["_"+mCurrentRecord.COMM_PK] = {
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
                                // Something went wrong with this particular record.       //
                                //---------------------------------------------------------//
                                iRecordErrorCount++;
                                aErrorMessages.push(mCurrentRecord.HUB_NAME+" ("+mCurrentRecord.HUB_PK+"): Failed to load information: "+e.message);
                            }
                        }

                        if (bHasModems === false) {
                            // Disable the command widgets because no modems were detected.
                            oModule.ToggleZigbeeCommands(oScope, false);
                        } else {
                            // Otherwise, enable them if they're not already
                            oModule.ToggleZigbeeCommands(oScope, true);
                        }

                    } catch (e) {
                        //--------------------------------------------------------//
                        // We're looking for an exception thrown because there were
                        // no zigbee modems detected. If a different exception is
                        // thrown, that's a problem!
                        //--------------------------------------------------------//
                        if (e.name !== "NoZigbeeModemsException") {
                            bError = true;
                            aErrorMessages.push(e.message);
                            // Disable the command widgets because no modems were detected.
                            oModule.ToggleZigbeeCommands(oScope, false);
                        } else {
                            throw e;
                        }
                    }

                    //------------------------------------------------------------------//
                    // Compile the error info map and run the callback function with it //
                    //------------------------------------------------------------------//
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
        } catch (e) {
            aErrorMessages.push("Error trying to load the modems ("+e.name+"): " + e.message);
            
            mErrorInfo = {
                bError              : true,
                aErrorMessages      : aErrorMessages,
                iRecordErrorCount   : ++iRecordErrorCount
            };
            
            fnCallback(mErrorInfo);
        }
    },
    
    PopulateTelnetLogArea : function (oScope) {
        try {
            var oModule         = this;
            var sTextAreaId     = oScope.createId(oModule.uiIDs.sTelnetOutputTextAreaID+"-inner");
            var oFormItem       = oScope.byId(oModule.uiIDs.sTelnetOutputTextAreaID);

            // Populate it with any prior output.
            if (oModule.ZigbeeTelnetLog.length > 0) {
                var output = "";
                for (var i = 0; i < oModule.ZigbeeTelnetLog.length; i++) {
                    output += oModule.ZigbeeTelnetLog[i].content;
                }

                oFormItem.setValue(output);
                oFormItem.selectText(output.length, output.length);

                // Force the text area to scroll down to the bottom if it's still on
                // the page.
                try {
                    document.getElementById(sTextAreaId).scrollTop = document.getElementById(sTextAreaId).scrollHeight;
                } catch (e) {
                    $.sap.log.error("Error populating the telnet log area ("+e.name+"): " + e.message);
                }
            }
        } catch (e) {
            $.sap.log.error("Error in iomy.devices.zigbeesmartplug.PopulateTelnetLogArea() ("+e.name+"): " + e.message);
        }
    },
    
    GetUITaskList: function( mSettings ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
        try {
            if (mSettings === undefined || mSettings === null) {
                throw new MissingSettingsMapException("Task data was not given (mSettings).");
            }
            
            if( mSettings.deviceData.IOs!==undefined ) {
                $.each(mSettings.deviceData.IOs, function (sIndex, aIO) {
                    if( aIO.RSTypeId===2001 ) {
                        aTasks.High.push({
                            "Type":"DeviceValueKW", 
                            "Data":{ 
                                "IOId":             aIO.Id, 
                                "IODataType":       aIO.DataTypeName,
                                "SamplerateLimit":  aIO.SamplerateLimit,
                                "LabelId":			mSettings.labelWidgetID
                            }
                        });
                    }
                });
            } else {
                mSettings.onFail("Device "+mSettings.deviceData.DeviceName+" has no IOs");
            }
        } catch (e) {
            mSettings.onFail("Error loading the kW value for device (ID: "+mSettings.deviceData.DeviceId+") ("+e.name+"): " + e.message);
            
        } finally {
            return aTasks;
        }
	}
});