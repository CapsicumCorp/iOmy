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

$.sap.declare("IomyRe.devices.csrmesh",true);
IomyRe.devices.csrmesh = new sap.ui.base.Object();

$.extend(IomyRe.devices.csrmesh,{
    
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
                
                var mThingIDInfo = IomyRe.validation.isThingIDValid(iThingId);
                
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
            IomyRe.apiphp.AjaxRequest({
                "url"     : IomyRe.apiphp.APILocation("light"),
                "method"  : "POST",
                "data"    : {
                    "Mode" : "ChangeColorBrightness",
                    "ThingId" : iThingId,
                    "Data" : JSON.stringify({
                        "NewValue" : {
                            //-- HEX: #EFE96B --//
                            "Hue" : Math.round(0.1591 * 360),
                            "Saturation" : Math.round(55.23 * 2.55),
                            "Brightness" : Math.round(93.73 * 2.55)
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
                    fnFail(response);
                }
            });
        
    //        IomyRe.apiphp.AjaxRequest({
    //            url: IomyRe.apiphp.APILocation("statechange"),
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
    //                IomyRe.apiphp.AjaxRequest(this);
    //            }
    //        });
        } catch (e) {
//            e.message = "Error in IomyRe.devices.csrmesh.turnOnWhiteLight ("+e.name+"):\n" + e.message;
//            $.sap.log.error(e.message);
//            throw e;

            fnFail("Error in IomyRe.devices.csrmesh.turnOnWhiteLight ("+e.name+"):\n" + e.message);
        }
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        //var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        
        try {
            aTasks.High.push({
                "Type":"Function", 
                "Execute": function () {
                    try {
                        IomyRe.devices.getHexOfLightColour({
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