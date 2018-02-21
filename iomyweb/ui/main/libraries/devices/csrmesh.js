/*
Title: CSR Bluetooth Mesh Device Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the information for a CSR Mesh device.
Copyright: Capsicum Corporation 2017

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

$.sap.declare("iomy.devices.csrmesh",true);
iomy.devices.csrmesh = new sap.ui.base.Object();

$.extend(iomy.devices.csrmesh,{
    
    LinkTypeId        : 15,
    ThingTypeId       : 19,
    
    RSHue           : 3901,
    RSSaturation    : 3902,
    RSBrightness    : 3903,
    
    turnOnWhiteLight : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var iThingId;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Process the settings map. TODO: Write a function for processing the
        // most common parameters.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            //----------------------------------------------------------------//
            // Check that the Thing ID is given and that it's valid.
            //----------------------------------------------------------------//
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                iThingId = mSettings.thingID;
                
                var mThingIDInfo = iomy.validation.isThingIDValid(iThingId);
                
                bError          = !mThingIDInfo.bIsValid;
                aErrorMessages  = mThingIDInfo.aErrorMessages;
                
                if (bError) {
                    throw new ThingIDNotValidException(aErrorMessages.join('\n'));
                }
                
            } else {
                throw new MissingArgumentException("Thing ID (thingID) must be specified.");
            }
            
            //----------------------------------------------------------------//
            // Find the success callback function.
            //----------------------------------------------------------------//
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            //----------------------------------------------------------------//
            // Find the failure callback function.
            //----------------------------------------------------------------//
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException("Thing ID (thingID) must be specified.");
        }
        
        //--------------------------------------------------------------------//
        // Run the request to "whiten" the light bulb. This is until white light
        // support is fully supported.
        //--------------------------------------------------------------------//
        try {
            iomy.apiphp.AjaxRequest({
                "url"     : iomy.apiphp.APILocation("light"),
                "method"  : "POST",
                "data"    : {
                    "Mode" : "ChangeColorRGB",
                    "ThingId" : iThingId,
                    "Data" : JSON.stringify({
                        "NewValue" : {
                            //-- HEX: #EFE96B --//
                            "Red" : 239,
                            "Green" : 233,
                            "Blue" : 107
    //                        "Hue" : 180,
    //                        "Saturation" : 0,
    //                        "Brightness" : 255
                        }
                    })
                },

                "onSuccess" : function (type, data) {
                    try {
                        if (data.Error !== true) {
                            fnSuccess();
                        } else {
                            fnFail(data.ErrMesg);
                        }
                    } catch (e) {
                        fnFail("Error in the success callback of changing the light colour ("+e.name+"): " + e.message);
                    }
                },

                "onFail" : function (response) {
                    fnFail(response.responseText);
                }
            });
        
    //        iomy.apiphp.AjaxRequest({
    //            url: iomy.apiphp.APILocation("statechange"),
    //            type: "POST",
    //            data: { 
    //                "Mode":"ThingToggleStatus", 
    //                "Id": iThingId
    //            },
    //            onFail : function(response) {
    //                
    //                fnFail(response.responseText);
    //                
    //            },
    //            onSuccess : function( type, data ) {
    //                this.onSuccess = function (type, data) {
    //                    fnSuccess(type, data);
    //                };
    //                
    //                iomy.apiphp.AjaxRequest(this);
    //            }
    //        });
        } catch (e) {
//            e.message = "Error in iomy.devices.csrmesh.turnOnWhiteLight ("+e.name+"):\n" + e.message;
//            $.sap.log.error(e.message);
//            throw e;

            fnFail("Error in iomy.devices.csrmesh.turnOnWhiteLight ("+e.name+"):\n" + e.message);
        }
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        //var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        
        try {
            if (mSettings === undefined || mSettings === null) {
                throw new MissingSettingsMapException("Task data was not given (mSettings).");
            }
            
            aTasks.High.push({
                "Type":"Function", 
                "Execute": function () {
                    try {
                        iomy.devices.getHexOfLightColour({
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
            mSettings.onFail("Failed to add an CSR Mesh Bluetooth Bulb task to the list ("+e.name+"): " + e.message);
            
        } finally {
            return aTasks;
        }
    }
});