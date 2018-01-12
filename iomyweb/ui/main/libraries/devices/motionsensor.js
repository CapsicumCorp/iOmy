/*
Title: Motion Sensor Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Motion Sensor entry.
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

$.sap.declare("IomyRe.devices.motionsensor",true);
IomyRe.devices.motionsensor = new sap.ui.base.Object();

$.extend(IomyRe.devices.motionsensor,{
    ThingTypeId : 3,
    
    //---------------------------------------------------//
    // Module properties
    //---------------------------------------------------//
    
    uiIDs : {
        TemperatureField : "TemperatureField",
        BatteryLevelField : "BatteryLevelField"
    },
    
    // -- INTEGERS
    iODataFieldsToFetch         : 2,
    iODataFieldsFailedToFetch   : 0,
    bWaitingToLoadAPI           : false,
    bLoadingFieldsFromAPI       : false,
    bLoadingMotionSensorFields  : false,
    
    // -- Resource Types for the Motion Sensor IOs
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    DevicePageID : "pMotionSensor",
    
    CallAPI : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var sUrl = IomyRe.apiphp.APILocation("motionsensor");
        var mThingIdInfo;
        var iThingId;
        var fnSuccess;
        var fnFail;
        
        if (mSettings !== undefined) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                mThingIdInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
                
                if (!mThingIdInfo.bIsValid) {
                    throw new IllegalArgumentException(mThingIdInfo.aErrorMessages.join("\n"));
                } else {
                    iThingId = mSettings.thingID;
                }
                
            } else {
                throw new MissingArgumentException("Thing ID must be given.");
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException("Thing ID must be given.");
        }
        
        try {
            //--------------------------------------------------------------------//
            // Indicate that the API is being loaded and send the AJAX request
            //--------------------------------------------------------------------//
    //        oModule.bWaitingToLoadAPI        = false;
    //        oModule.bLoadingFieldsFromAPI    = true;

            IomyRe.apiphp.AjaxRequest({
                "url" : sUrl,
                "data" : {
                    "Mode" : "GetMotionData",
                    "ThingId" : iThingId
                },

                "onSuccess" : function (responseType, data) {

                    try {
                        if (responseType === "JSON") {
                            if (data.Error !== true) {

                                try {
                                    //--------------------------------------------------------//
                                    // If no error has been reported, get the data and display
                                    // it.
                                    //--------------------------------------------------------//
                                    var mResponseData = data.Data;

                                    var iUTS    = mResponseData.MostRecentMotion;
                                    var bTamper = mResponseData.CurrentStatus.Tamper;


                                    var mHumanReadable = {
                                        "UTS" : IomyRe.functions.getLengthOfTimePassed({
                                            "UTS" : iUTS
                                        })
                                    };

                                    mResponseData.HumanReadable = mHumanReadable;

                                    fnSuccess(mResponseData);

                                } catch (e) {
                                    fnFail("An error in the success function for IomyRe.devices.motionsensor.CallAPI():\n\n" + e.name + ": " + e.message);
                                }

                            } else {
                                fnFail(data.ErrMesg);
                            }
                        } else {
                            fnFail("Response data type received was not in a valid JSON format. Type Received: "+responseType);
                        }
                    } catch (e) {
                        fnFail("An error in the fail function for IomyRe.devices.motionsensor.CallAPI():\n\n" + e.name + ": " + e.message);
                    }
                },

                "onFail" : function (response) {
                    // Log errors
                    jQuery.sap.log.error("There was an error fetching information about the tamper status and how long since the last motion was detected:\n\n" + response.responseText);

                    // Conclude the request callback
                    fnFail(response.responseText);
                }
            });
        } catch (e) {
            e.message = "Error in IomyRe.devices.motionsensor.CallAPI:\n" + e.message;
            $.sap.log.error(e.message);
            throw e;
        }
    },
    
    FetchODataFields : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var oModule     = this;
        var aIOIDs      = [];
        var aaIOs;
        var mThingIdInfo;
        var iThingId;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Find and fetch the device ID from the parameter map. Report if
        // it is missing.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                mThingIdInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
                
                if (!mThingIdInfo.bIsValid) {
                    throw new IllegalArgumentException(mThingIdInfo.aErrorMessages.join("\n"));
                } else {
                    iThingId = mSettings.thingID;
                }
                
            } else {
                throw new MissingArgumentException("Thing ID must be given.");
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException("Thing ID must be given.");
        }
        
        try {
            //--------------------------------------------------------------------//
            // Prepare the IO ID array
            //--------------------------------------------------------------------//
            aaIOs = IomyRe.common.ThingList["_"+iThingId].IO;

            $.each(aaIOs, function (sI, mIO) {
                if (sI !== undefined && sI !== null && mIO !== undefined && mIO !== null) {
                    if (mIO.RSTypeId == oModule.RSBattery || mIO.RSTypeId == oModule.RSTemperature ) {
                        aIOIDs.push("IO_PK eq "+mIO.Id);
                    }
                }
            });

            //--------------------------------------------------------------------//
            // Send the AJAX request
            //--------------------------------------------------------------------//
            IomyRe.apiodata.AjaxRequest({
                "Url"             : IomyRe.apiodata.ODataLocation("dataint"),
                "Columns"         : ["CALCEDVALUE", "UTS", "UOM_PK", "UOM_NAME", "RSTYPE_PK"],
                "WhereClause"     : [aIOIDs.join(" or ")],
                "OrderByClause"   : [],

                "onSuccess" : function (responseType, data) {
                    try {
                        if (responseType === "JSON") {
                            if (data.Error !== true) {

                                try {
                                    //------------------------------------------------------------//
                                    // Variables
                                    //------------------------------------------------------------//
                                    var mResult = {};

                                    for (var i = 0; i < data.length; i++) {
                                        //--------------------------------------------------------//
                                        // This is a temporary workaround to eliminate a character
                                        // from the UOM_NAME (Â) which comes from the OData service.
                                        // This affects the temperature field.
                                        //--------------------------------------------------------//
                                        data[i].UOM_NAME = data[i].UOM_NAME.replace("Â", "");

                                        if (data[i].RSTYPE_PK === oModule.RSBattery) {
                                            mResult.BatteryVoltage = data[i].CALCEDVALUE + data[i].UOM_NAME;

                                        } else if (data[i].RSTYPE_PK === oModule.RSTemperature) {
                                            mResult.Temperature = data[i].CALCEDVALUE + data[i].UOM_NAME;

                                        }
                                    }

                                    //------------------------------------------------------------//
                                    // Run the success callback parsing the result data.
                                    //------------------------------------------------------------//
                                    fnSuccess(mResult);

                                } catch (e) {
                                    fnFail("An error in the success function for IomyRe.devices.motionsensor.FetchODataFields():\n\n" + e.name + ": " + e.message);
                                }

                            } else {
                                fnFail(data.ErrMesg);
                            }
                        } else {
                            fnFail("Response data type received was not in a valid JSON format. Type Received: "+responseType);
                        }
                    } catch (e) {
                        fnFail("An error in the fail function for IomyRe.devices.motionsensor.FetchODataFields():\n\n" + e.name + ": " + e.message);
                    }
                },

                "onFail" : function (response) {
                    // Log errors
                    var sErrMessage = "There was an error fetching data using IomyRe.devices.motionsensor.FetchODataFields():\n\n" + response.responseText;

                    jQuery.sap.log.error(sErrMessage);
                    fnFail(sErrMessage);

                }

            });
        } catch (e) {
            e.message = "Error in IomyRe.devices.motionsensor.FetchODataFields ("+e.name+"):\n" + e.message;
            $.sap.log.error(e.message);
            throw e;
        }
    },
    
    FetchAllCurrentData : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules and global variables.
        //--------------------------------------------------------------------//
        var oModule             = this; // Capture the scope of the current device module.
        var sUnavailableString  = "N/A";
        var mThingIdInfo;
        var iThingId;
        var fnSuccess;
        var fnFail;
        
        var mData   = {
            Status              : sUnavailableString,
            TimeSinceLastMotion : sUnavailableString,
            TamperStatus        : sUnavailableString,
            BatteryVoltage      : sUnavailableString,
            Temperature         : sUnavailableString
        };
        
        //--------------------------------------------------------------------//
        // Find and fetch the device ID from the parameter map. Report if
        // it is missing.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                mThingIdInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
                
                if (!mThingIdInfo.bIsValid) {
                    throw new IllegalArgumentException(mThingIdInfo.aErrorMessages.join("\n"));
                } else {
                    iThingId = mSettings.thingID;
                }
                
            } else {
                throw new MissingArgumentException("Thing ID must be given.");
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException("Thing ID must be given.");
        }
        
        try {
            //--------------------------------------------------------------------//
            // Fetch the status.
            //--------------------------------------------------------------------//
            mData.Status = IomyRe.devices.GetDeviceStatus(iThingId);

            //--------------------------------------------------------------------//
            // Fetch the time since the last detected motion and the tamper status.
            //--------------------------------------------------------------------//
            oModule.CallAPI({
                thingID : iThingId,

                onSuccess : function (mResult) {
                    try {
                        mData.TimeSinceLastMotion   = mResult.HumanReadable.UTS;
                        mData.TamperStatus          = mResult.CurrentStatus.Tamper === false ? "Secure" : "Not Secure";

                        //------------------------------------------------------------//
                        // Fetch the battery and temperature values.
                        //------------------------------------------------------------//
                        oModule.FetchODataFields({
                            thingID : iThingId,

                            onSuccess : function (mResult) {
                                mData.BatteryVoltage    = mResult.BatteryVoltage;
                                mData.Temperature       = mResult.Temperature;

                                fnSuccess(mData);
                            }
                        });
                    } catch (e) {
                        fnFail("Error retrieving motion sensor battery and temperature data ("+e.name+"):\n" + e.message);
                    }
                },

                onFail : function (sErrorMessage) {
                    try {
                        //------------------------------------------------------------//
                        // Fetch the battery and temperature values.
                        //------------------------------------------------------------//
                        oModule.FetchODataFields({
                            thingID : iThingId,

                            onSuccess : function (mResult) {
                                mData.BatteryVoltage    = mResult.BatteryVoltage;
                                mData.Temperature       = mResult.Temperature;

                                fnSuccess(mData);
                            }
                        });

                        fnFail(sErrorMessage);
                    } catch (e) {
                        fnFail("Error retrieving motion sensor battery and temperature data after failure ("+e.name+"):\n" + e.message);
                    }
                }
            });
            
        } catch (e) {
            e.message = "Error in IomyRe.devices.motionsensor.FetchAllCurrentData ("+e.name+"):\n" + e.message;
            $.sap.log.error(e.message);
            throw e;
        }
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        
        try {
            aTasks.High.push({
                "Type":"Function", 
                "Execute": function () {
                    try {
                        oModule.CallAPI({
                            thingID     : mSettings.deviceData.DeviceId,
                            onSuccess   : mSettings.onSuccess,
                            onFail      : mSettings.onFail
                        });
                    } catch (e) {
                        mSettings.onFail(e.message);
                    }
                }
            });
        } catch (e) {
            mSettings.onFail("Failed to add a motion sensor task to the list ("+e.name+"): " + e.message);
            
        } finally {
            return aTasks;
        }
    }
});