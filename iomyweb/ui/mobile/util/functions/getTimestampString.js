/*
Title: Get Timestamp String
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Generates a human-readable timestamp from a JS Date.
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

$.sap.declare("IOMy.functions.getTimestampString",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Generates a human-readable timestamp from a JS Date.
     * 
     * @param {type} date       Given date
     * @param {type} sFormat    Date format in dd/mm/yy or mm/dd/yy
     * @returns {String}        Human-readable date and time
     */
    getTimestampString : function (date, sFormat, bShowTime, bShowSeconds) {
        //----------------------------------------------------------//
        // Declare variables and define default arguments
        //----------------------------------------------------------//
        if (bShowTime === undefined) {
            bShowTime = true;
        }
        
        if (bShowSeconds === undefined) {
            bShowSeconds = true;
        }
        
        var iHour       = date.getHours();
        var vMinutes    = date.getMinutes();
        var vSeconds    = date.getSeconds();
        var sSuffix     = "";
        
        var iYear       = date.getFullYear();
        var vMonth      = date.getMonth() + 1;
        var vDay        = date.getDate();
        
        var sDate       = ""; // Set according to the given format
        var sTime       = "";
        
        if (iHour >= 12) {
            sSuffix = "PM";
        } else {
            sSuffix = "AM";
        }
        
        iHour = iHour % 12;
        if (iHour === 0) {
            iHour = 12;
        }
        
        if (vMonth < 10) {
            vMonth = "0"+vMonth;
        }
        
        if (vDay < 10) {
            vDay = "0"+vDay;
        }
        
        if (vSeconds < 10) {
            vSeconds = "0"+vSeconds;
        }
        
        if (vMinutes < 10) {
            vMinutes = "0"+vMinutes;
        }
        
        if (sFormat === undefined) {
            sFormat = "dd/mm/yyyy";
        }
        
        if (sFormat === "dd/mm/yyyy" || sFormat === "dd/mm/yy") {
            sDate = vDay+"/"+vMonth+"/"+iYear+" ";
        } else if (sFormat === "mm/dd/yyyy" || sFormat === "mm/dd/yy") {
            sDate = vMonth+"/"+vDay+"/"+iYear+" ";
        } else if (sFormat === "yyyy/mm/dd" || sFormat === "yy/mm/dd") {
            sDate = iYear+"/"+vMonth+"/"+vDay+" ";
        } else if (sFormat === "yyyy-mm-dd" || sFormat === "yy-mm-dd") {
            sDate = iYear+"-"+vMonth+"-"+vDay+" ";
        } else {
            sDate = "";
        }
        
        if (bShowTime) {
            if (bShowSeconds) {
                sTime = iHour + ":" + vMinutes + ":" + vSeconds + sSuffix;
            } else {
                sTime = iHour + ":" + vMinutes + sSuffix;
            }
        }
        
        return sDate + sTime;
    }
    
});