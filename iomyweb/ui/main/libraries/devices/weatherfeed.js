/*
Title: Open Weather Map Module for iOmy
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Contains functions for Open Weather Map support
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
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IomyRe.devices",true);
IomyRe.devices.weatherfeed = new sap.ui.base.Object();

$.extend(IomyRe.devices.weatherfeed,{
    Devices: [],
    
    LinkTypeId        : 8,
    ThingTypeId       : 14,
    
    /**
     * Returns a Google Material icon to depict the current weather.
     * 
     * "Clear" will return a sun.
     * "Cloudy" will of course return clouds.
     * 
     * @param {type} sText          Current Conditions
     * @returns {String}
     */
    GetWeatherIcon : function (sText) {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        var me              = this;              // Captures the scope of this device module
        var sIcon           = "";
        
        if (sText === "Clear") {
            sIcon = "sap-icon://GoogleMaterial/wb_sunny";
        } else if (sText === "Clouds") {
            sIcon = "sap-icon://GoogleMaterial/wb_cloudy";
//        } else if (sText === "Rain") {
//            sIcon = "sap-icon://GoogleMaterial/wb_cloudy";
        } else {
            sIcon = "";
        }
        
        return sIcon;
    },
    
    /**
     * Takes the cardinality figure for wind direction and converts it into a
     * human-readable format (e.g. NNE, SW, E, etc.).
     * 
     * @param {type} fCardinality               Cardinality (between and including 0 and 360.
     * @returns {String}                        Wind direction
     * 
     * @throws {MissingArgumentException} When the cardinality is not given.
     * @throws {IllegalArgumentException} When the cardinality is not the correct value.
     */
    getWindDirection : function (fCardinality) {
        var sDirection = "";
        
        if (fCardinality === undefined) {
            throw new MissingArgumentException("Wind direction cardinal must be given and be between 0 and 360.");
            
        } else if (fCardinality < 0 || fCardinality > 360) {
            throw new IllegalArgumentException("Wind direction cardinal must be between 0 and 360.")
        }
        
        if( (fCardinality > 348.75 && fCardinality <= 360.0) || (fCardinality >= 0 && fCardinality <= 11.25) ) {
            sDirection = "N";
            
        } else if (fCardinality > 11.25 && fCardinality <= 33.75 ) {
            sDirection = "NNE";
            
        } else if (fCardinality > 33.75 && fCardinality <= 56.25) {
            sDirection = "NE";
            
        } else if (fCardinality > 56.25 && fCardinality <= 78.75) {
            sDirection = "ENE";
            
        } else if (fCardinality > 78.75 && fCardinality <= 101.25) {
            sDirection = "E";
            
        } else if (fCardinality > 101.25 && fCardinality <= 123.75) {
            sDirection = "ESE";
            
        } else if (fCardinality > 123.75 && fCardinality <= 146.25) {
            sDirection = "SE";
            
        } else if (fCardinality > 146.25 && fCardinality <= 168.75) {
            sDirection = "SSE";
            
        } else if (fCardinality > 168.75 && fCardinality <= 191.25) {
            sDirection = "S";
            
        } else if (fCardinality > 191.25 && fCardinality <= 213.75) {
            sDirection = "SSW";
            
        } else if (fCardinality > 213.75 && fCardinality <= 236.25) {
            sDirection = "SW";
            
        } else if (fCardinality > 236.25 && fCardinality <= 258.75) {
            sDirection = "WSW";
            
        } else if (fCardinality > 258.75 && fCardinality <= 281.25) {
            sDirection = "W";
            
        } else if (fCardinality > 281.25 && fCardinality <= 303.75) {
            sDirection = "WNW";
            
        } else if (fCardinality > 303.75 && fCardinality <= 326.25) {
            sDirection = "NW";
            
        } else if (fCardinality > 326.25 && fCardinality <= 348.75) {
            sDirection = "NNW";
        }
        
        return sDirection;
    },
    
    /**
     * Retrieves the current weather information from a specified weather feed.
     * 
     * @param {map}         mSettings               Parameters
     * @param {number}      mSettings.thingID       ID of the weatherfeed.
     * @param {function}    mSettings.onSuccess     Function to run after a successful call.
     * @param {function}    mSettings.onFail        Function to run after an error.
     * 
     * @throws {MissingArgumentException} When the weatherfeed ID is not given.
     * @throws {IllegalArgumentException} When the weatherfeed is not valid.
     * @throws {MissingSettingsMapException} When no parameter object is parsed.
     */
    FetchCurrentWeather : function (mSettings) {
        var me = this;
        var iThingId;
        var mThingIdInfo;
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
        
        IomyRe.apiphp.AjaxRequest({
            url : IomyRe.apiphp.APILocation("weather"),
            data: {
                "Mode" : "FetchCurrentWeather",
                "ThingId" : iThingId
            },
            
            onSuccess : function (type, data) {
                
                if (data.Error === false) {
                    var windDirection   = data.Data.WindDirection;
                    var sunrise         = data.Data.Sunrise;
                    var sunset          = data.Data.Sunset;
                    
                    var dateSunrise     = new Date(sunrise.Value * 1000);
                    var dateSunset      = new Date(sunset.Value * 1000);
                    var humanReadable   = {
                        WindDirection   : me.getWindDirection( parseFloat(windDirection.Value.toString()) ),
                        SunriseTime     : IomyRe.functions.getTimestampString(dateSunrise, ""),
                        SunsetTime      : IomyRe.functions.getTimestampString(dateSunset, "")
                    };
                    
                    data.Data.HumanReadable = humanReadable;
                    
                    fnSuccess(data.Data);
                    
                } else {
                    fnFail(data.ErrMesg);
                }
            },
            
            onFail : function (response) {
                fnFail(response.responseText);
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
                oModule.FetchCurrentWeather({
                    thingID     : mSettings.deviceData.DeviceId,
                    onSuccess   : mSettings.onSuccess,
                    onFail      : mSettings.onFail
                });
            }
        });
        
        return aTasks;
    }
    
});