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

$.sap.declare("IomyRe.devices.zigbeesmartplug",true);
IomyRe.devices.zigbeesmartplug = new sap.ui.base.Object();

$.extend(IomyRe.devices.zigbeesmartplug,{
    Devices: [],
    
    CommTypeId : 3,                         // This SHOULD NOT change!
    LinkTypeId : 2,
    ThingTypeId : 2,
    
    iSelectedCommID : null,
    
    ConnectedZigbeeModems : {},             // Associative Array of all the Connected dongles
    bJoinModeToggleCoolingDown : false,
    bJoinModeToggleCoolDownPeriod : 5000, // 3 minute cooldown (in milliseconds)
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
        var me              = this;
        var php             = IomyRe.apiphp;
        var bError          = false;
        var aErrorMessages  = [];
        var sUrl            = php.APILocation("hubtelnet");
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
        
        // Indicating that a telnet command is running
        me.bRunningCommand = true;
        
        // Force it to scroll down to the bottom.
        //document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollTop = document.getElementById(oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner")).scrollHeight;
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "TurnOnZigbeeJoinMode", "CommId" : iCommId},
        
            onSuccess : function (dataType, data) {
                if (data.Error === false || data.Error === undefined) {
                    fnSuccess(data.Data.JoinMode.join("\n"));
                } else {
                    fnFail(data.ErrMesg);
                }
                
                me.bRunningCommand = false;
            },
            
            onFail : function (response) {
                fnFail(response.responseText);
                me.bRunningCommand = false;
            }
        });
    },
    
    GetRapidHAInfo : function (mSettings) {
        //---------------------------------------------------------//
        // Import modules, widgets and scope                       //
        //---------------------------------------------------------//
        var me              = this;
        var php             = IomyRe.apiphp;
        var bError          = false;
        var aErrorMessages  = [];
        var sUrl            = php.APILocation("hubtelnet");
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
        
        me.bRunningCommand = true;
        
        php.AjaxRequest({
            url : sUrl,
            data : {"Mode" : "GetRapidHAInfo", "CommId" : iCommId},
            
            onSuccess : function (dataType, data) {
                if (data.Error === false || data.Error === undefined) {
                    
                    fnSuccess(data);
                    
//                    IomyRe.common.RefreshCoreVariables({
//                        onSuccess : function () {
//                            IomyRe.common.showMessage({
//                                text : "Join completed. Your devices should appear in 5 minutes.",
//                                view : oScope.getView()
//                            });
//                        }
//                    });
                } else {
                    fnFail(data.ErrMesg);
                }
                
                me.bRunningCommand = false;
            },
            
            onFail : function (response) {
                
                me.bRunningCommand = false;
                fnFail(response.responseText);
            }
        });
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
        var me                  = this;             // Capture the scope of the zigbee device module
        var odata               = IomyRe.apiodata;    // Import the OData API module
        
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
        var sUrl                = odata.ODataLocation("comms");
        var aColumns            = [
            // Comm Information
            "COMM_PK","COMM_NAME","COMM_JOINMODE","COMM_ADDRESS",
            // Hub Information
            "HUB_PK","HUB_NAME","HUB_SERIALNUMBER","HUB_IPADDRESS"
        ];
        var aFilter             = ["COMMTYPE_PK eq "+me.CommTypeId];
        var aOrderBy            = [];
        
        //---------------------------------------------------------//
        // Start the Request                                       //
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
                            // Something went wrong with this particular record.       //
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
                    //--------------------------------------------------------//
                    // We're looking for an exception thrown because there were
                    // no zigbee modems detected. If a different exception is
                    // thrown, that's a problem!
                    //--------------------------------------------------------//
                    if (e.name !== "NoZigbeeModemsException") {
                        bError = true;
                        aErrorMessages.push(e.message);
                        // Disable the command widgets because no modems were detected.
                        me.ToggleZigbeeCommands(oScope, false);
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
    },
    
    PopulateTelnetLogArea : function (oScope) {
        var me            = this;
        var sTextAreaId = oScope.createId(me.uiIDs.sTelnetOutputTextAreaID+"-inner");
        var oFormItem    = oScope.byId(me.uiIDs.sTelnetOutputTextAreaID);
        
        // Populate it with any prior output.
        if (me.ZigbeeTelnetLog.length > 0) {
            var output = "";
            for (var i = 0; i < me.ZigbeeTelnetLog.length; i++) {
                output += me.ZigbeeTelnetLog[i].content;
            }
            
            oFormItem.setValue(output);
            oFormItem.selectText(output.length, output.length);
            // Force it to scroll down to the bottom.
            try {
                document.getElementById(sTextAreaId).scrollTop = document.getElementById(sTextAreaId).scrollHeight;
            } catch (e) {
                // Do nothing.
            }
        }
    },
    
    GetUITaskList: function( Prefix, aDeviceData ) {
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
                            "IOId":             aIO.Id, 
                            "IODataType":       aIO.DataTypeName,
                            "SamplerateLimit":  aIO.SamplerateLimit,
                            "LabelId":			Prefix
                        }
                    });
                }
            });
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DeviceName+" has no IOs");
        }
		return aTasks;
	}
});