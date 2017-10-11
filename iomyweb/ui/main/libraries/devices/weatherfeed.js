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
    
    getWindDirection : function (fCardinality) {
        var mInfo = {};
        
        if (fCardinality === undefined) {
            throw new MissingArgumentException("Wind direction cardinal must be given and be between 0 and 360.");
            
        } else if (fCardinality < 0 || fCardinality > 360) {
            throw new IllegalArgumentException("Wind direction cardinal must be between 0 and 360.")
        }
        
        if( (fCardinality > 348.75 && fCardinality <= 360.0) || (fCardinality >= 0 && fCardinality <= 11.25) ) {
            mInfo.direction = "N";
            
        } else if (fCardinality > 11.25 && fCardinality <= 33.75 ) {
            mInfo.direction = "NNE";
            
        } else if (fCardinality > 33.75 && fCardinality <= 56.25) {
            mInfo.direction = "NE";
            
        } else if (fCardinality > 56.25 && fCardinality <= 78.75) {
            mInfo.direction = "ENE";
            
        } else if (fCardinality > 78.75 && fCardinality <= 101.25) {
            mInfo.direction = "E";
            
        } else if (fCardinality > 101.25 && fCardinality <= 123.75) {
            mInfo.direction = "ESE";
            
        } else if (fCardinality > 123.75 && fCardinality <= 146.25) {
            mInfo.direction = "SE";
            
        } else if (fCardinality > 146.25 && fCardinality <= 168.75) {
            mInfo.direction = "SSE";
            
        } else if (fCardinality > 168.75 && fCardinality <= 191.25) {
            mInfo.direction = "S";
            
        } else if (fCardinality > 191.25 && fCardinality <= 213.75) {
            mInfo.direction = "SSW";
            
        } else if (fCardinality > 213.75 && fCardinality <= 236.25) {
            mInfo.direction = "SW";
            
        } else if (fCardinality > 236.25 && fCardinality <= 258.75) {
            mInfo.direction = "WSW";
            
        } else if (fCardinality > 258.75 && fCardinality <= 281.25) {
            mInfo.direction = "W";
            
        } else if (fCardinality > 281.25 && fCardinality <= 303.75) {
            mInfo.direction = "WNW";
            
        } else if (fCardinality > 303.75 && fCardinality <= 326.25) {
            mInfo.direction = "NW";
            
        } else if (fCardinality > 326.25 && fCardinality <= 348.75) {
            mInfo.direction = "NNW";
        }
        
        return mInfo;
    }
});