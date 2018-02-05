/*
Title: Temperature Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the functions pertaining to temperature reading support.
Copyright: Capsicum Corporation 2016, 2017, 2018

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

$.sap.declare("IomyRe.devices.temperature",true);
IomyRe.devices.temperature = new sap.ui.base.Object();

$.extend(IomyRe.devices.temperature,{
    ThingTypeId : 4,
    
    //---------------------------------------------------//
    // Module properties
    //---------------------------------------------------//
    RSTemperature   : 1701,
    
    FetchTemperature : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var oModule     = this;
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
            // Prepare the requests.
            //--------------------------------------------------------------------//
            var aRequests       = [];
            var aErrorMessages  = [];
            var sTemperature    = null;

            aaIOs               = IomyRe.common.ThingList["_"+iThingId].IO;
            
            $.each(aaIOs, function (sI, mIO) {
                if (sI !== undefined && sI !== null && mIO !== undefined && mIO !== null) {
                    if (mIO.RSTypeId == oModule.RSTemperature ) {
                        
                        aRequests.push({
                            "library"         : "odata",
                            "Url"             : IomyRe.apiodata.ODataLocation("dataint"),
                            "Columns"         : ["CALCEDVALUE", "UTS", "UOM_PK", "UOM_NAME", "RSTYPE_PK"],
                            "WhereClause"     : ["IO_PK eq "+mIO.Id, "RSTYPE_PK eq "+mIO.RSTypeId],
                            "OrderByClause"   : ["UTS desc"],

                            "onSuccess" : function (responseType, data) {
                                try {
                                    if (responseType === "JSON") {
                                        if (data.Error !== true) {

                                            try {
                                                //------------------------------------------------------------//
                                                // Variables
                                                //------------------------------------------------------------//

                                                for (var i = 0; i < data.length; i++) {
                                                    //--------------------------------------------------------//
                                                    // This is a temporary workaround to eliminate a character
                                                    // from the UOM_NAME (Â) which comes from the OData service.
                                                    // This affects the temperature field.
                                                    //--------------------------------------------------------//
                                                    data[i].UOM_NAME = data[i].UOM_NAME.replace("Â", "");

                                                    if (data[i].RSTYPE_PK === oModule.RSTemperature) {
                                                        sTemperature = data[i].CALCEDVALUE.toFixed(1) + data[i].UOM_NAME;

                                                    }
                                                }

                                            } catch (e) {
                                                aErrorMessages.push("An error in the success function for IomyRe.devices.motionsensor.FetchODataFields():\n\n" + e.name + ": " + e.message);
                                            }

                                        } else {
                                            aErrorMessages.push(data.ErrMesg);
                                        }
                                    } else {
                                        aErrorMessages.push("Response data type received was not in a valid JSON format. Type Received: "+responseType);
                                    }
                                } catch (e) {
                                    aErrorMessages.push("An error in the fail function for IomyRe.devices.motionsensor.FetchODataFields():\n\n" + e.name + ": " + e.message);
                                }
                            },

                            "onFail" : function (response) {
                                // Log errors
                                var sErrMessage = "There was an error fetching data using IomyRe.devices.motionsensor.FetchODataFields():\n\n" + response.responseText;

                                jQuery.sap.log.error(sErrMessage);
                                aErrorMessages.push(sErrMessage);

                            }
                        });
                    }
                }
            });
            
            var oAjaxRequestQueue = new AjaxRequestQueue({
                requests : aRequests,
                
                onSuccess : function () {
                    //------------------------------------------------------------//
                    // If the data was retrieved, run the success callback parsing
                    // the result data. Otherwise, run these requests again.
                    //------------------------------------------------------------//
                    if (sTemperature !== null) {
                        fnSuccess(sTemperature);
                        
                    } else {
                        //-- Stop retrying after 3 attempts. --//
                        if (sTemperature === null) {
                            sTemperature = "N/A";
                        }

                        fnSuccess(sTemperature);
                    }
                },
                
                onFail : function () {
                    fnFail(aErrorMessages.join('\n'));
                }
            });

            //--------------------------------------------------------------------//
            // Send the AJAX request
            //--------------------------------------------------------------------//
            /*IomyRe.apiodata.AjaxRequest({
                            "Url"             : IomyRe.apiodata.ODataLocation("dataint"),
                            "Columns"         : ["CALCEDVALUE", "UTS", "UOM_PK", "UOM_NAME", "RSTYPE_PK"],
                            "WhereClause"     : [aIOIDs.join(" or ")],
                            "OrderByClause"   : ["UTS desc"],

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

            });*/
        } catch (e) {
            fnFail("Error in IomyRe.devices.motionsensor.FetchODataFields ("+e.name+"):\n" + e.message);
//            e.message = "Error in IomyRe.devices.motionsensor.FetchODataFields ("+e.name+"):\n" + e.message;
//            $.sap.log.error(e.message);
//            throw e;
        }
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        
        try {
            if (mSettings === undefined || mSettings === null) {
                throw new MissingSettingsMapException("Task data was not given (mSettings).");
            }
            
            aTasks.High.push({
                "Type":"Function", 
                "Execute": function () {
                    try {
                        oModule.FetchTemperature({
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