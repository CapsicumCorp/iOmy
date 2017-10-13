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
    Devices: [],
    
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
        var me = this;
        var php = IomyRe.apiphp;
        var sUrl = php.APILocation("motionsensor");
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
        
        //--------------------------------------------------------------------//
        // Indicate that the API is being loaded and send the AJAX request
        //--------------------------------------------------------------------//
        me.bWaitingToLoadAPI        = false;
        me.bLoadingFieldsFromAPI    = true;
        
        php.AjaxRequest({
            "url" : sUrl,
            "data" : {
                "Mode" : "GetMotionData",
                "ThingId" : iThingId
            },
            
            "onSuccess" : function (response, data) {
                // Check the error condition.
                if (data.Error === false) {
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
                    
                } else {
                    fnFail(data.ErrMesg);
                }
            },
            
            "onFail" : function (response) {
                // Log errors
                jQuery.sap.log.error("There was an error fetching information about the tamper status and how long since the last motion was detected:\n\n" + JSON.stringify(response));
                
                // Conclude the request callback
                fnFail(response.responseText);
            }
        });
    },
    
    FetchField : function (iIOId, oTextWidget) {
        //--------------------------------------------------------------------//
        // Declare variables and import modules
        //--------------------------------------------------------------------//
        var me = this;
        var odata = IomyRe.apiodata;
        
        //--------------------------------------------------------------------//
        // Send the AJAX request
        //--------------------------------------------------------------------//
        odata.AjaxRequest({
            "Url"             : odata.ODataLocation("dataint"),
            "Columns"         : ["CALCEDVALUE", "UTS", "UOM_PK", "UOM_NAME"],
            "WhereClause"     : ["IO_PK eq "+iIOId],
            "OrderByClause"   : [],
            
            "onSuccess" : function (responseType, data) {
                //------------------------------------------------------------//
                // Variables
                //------------------------------------------------------------//
                var data        = data[0];
                var sUOMName    = data.UOM_NAME;
                
                //------------------------------------------------------------//
                // This is a temporary workaround to eliminate a character from
                // the UOM_NAME (Â) which comes from the OData service. This
                // affected the temperature field.
                //------------------------------------------------------------//
                sUOMName = sUOMName.replace("Â", "");
                
                //------------------------------------------------------------//
                // Set the text in the relevant field on the motion sensor page.
                //------------------------------------------------------------//
                oTextWidget.setText(data.CALCEDVALUE + sUOMName);
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onFail" : function (response) {
                me.iODataFieldsFailedToFetch++;
                
                // Log errors
                jQuery.sap.log.error("There was an error fetching data for IO "+iIOId+":\n\n" + JSON.stringify(response));
                
                // Conclude the request callback
                this.onComplete();
            },
            
            "onComplete" : function () {
                //------------------------------------------------------------//
                // Decrement the OData Field count
                //------------------------------------------------------------//
//                console.log("====================================================================");
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("====================================================================");
                
                if (me.iODataFieldsToFetch > 0) {
                    me.iODataFieldsToFetch--;
                } else {
                    // Log this as an error
                    jQuery.sap.log.error("Something is wrong! The remaining OData field count for the current motion sensor is already 0!");
                }
                
//                console.log("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                jQuery.sap.log.debug("Motion Sensor OData Fields to fetch: "+me.iODataFieldsToFetch);
                
                //------------------------------------------------------------//
                // If this is final OData request and the API has finished its
                // call, reset the loading motion sensor OData fields flag, and
                // reset the fields to fetch back to the default number.
                //------------------------------------------------------------//
                if (me.iODataFieldsToFetch === 0 && me.bWaitingToLoadAPI === false && me.bLoadingFieldsFromAPI === false) {
                    me.bLoadingMotionSensorFields = false;
                    me.iODataFieldsToFetch = 2;
                }
            }
            
        });
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        
        aTasks.High.push({
            "Type":"Function", 
            "Execute": function () {
                oModule.CallAPI({
                    thingID     : mSettings.deviceData.DeviceId,
                    onSuccess   : mSettings.onSuccess,
                    onFail      : mSettings.onFail
                });
            }
        });
        
        return aTasks;
    }
});