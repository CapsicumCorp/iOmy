/*
Title: Get Length of Time Passed Function.
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Extends the functions module to include a function to display how
    long ago a given point in time (in UTS) occurred.
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

$.sap.declare("IOMy.functions.getLengthOfTimePassed",true);

$.extend(IOMy.functions,{
    
    /**
     * Takes a UTS figure and compares it with the UTS figure created as this
     * function executes. The parameters are as follows:
     * 
     * Required parameters:
     * UTS              : The time in the past. Required for comparing with the UTS now.
     * 
     * Optional parameters:
     * showDay          : Boolean flag to show how many days ago the given point in time was, default: true,
     * showHours        : Boolean flag to show how many hours ago the given point in time was, default: true,
     * showMinutes      : Boolean flag to show how many minutes ago the given point in time was, default: true,
     * showSeconds      : Boolean flag to show how many seconds ago the given point in time was, default: true,
     * showMilliseconds : Boolean flag to show how many milliseconds ago the given point in time was, default: false,
     * 
     * Will throw an exception if the UTS is not given in mSettings.
     * 
     * @param {type} mSettings              Map of both required and optional
     * @returns {string}                    Human-readable format of how long since the given point in time.
     */
    getLengthOfTimePassed : function (mSettings) {
        
        //--------------------------------------------------------------------//
        // Check that the UTS has been given.
        //--------------------------------------------------------------------//
        if (mSettings.UTS === undefined) {
            //----------------------------------------------------------------//
            // Report and throw an exception if no UTS is given.
            //----------------------------------------------------------------//
            jQuery.sap.log.error("IOMy.functions.getLengthOfTimePassedSince() requires a UTS parameter!");
            throw "IOMy.functions.getLengthOfTimePassedSince() requires a UTS parameter!";
            
        } else {
            //----------------------------------------------------------------//
            // Populate any undeclared optional parameters with their defaults
            //----------------------------------------------------------------//
            if (mSettings.showDay === undefined) {
                mSettings.showDay = true;
            }
            
            if (mSettings.showHours === undefined) {
                mSettings.showHours = true;
            }
            
            if (mSettings.showMinutes === undefined) {
                mSettings.showMinutes = true;
            }
            
            if (mSettings.showSeconds === undefined) {
                mSettings.showSeconds = true;
            }
            
            if (mSettings.showMilliseconds === undefined) {
                mSettings.showMilliseconds = false;
            }
            
            //----------------------------------------------------------------//
            // Declare variables, fetch parameters.
            //----------------------------------------------------------------//
            var iUTSPast            = mSettings.UTS * 1000;
            var bShowDay            = mSettings.showDay;
            var bShowHours          = mSettings.showHours;
            var bShowMinutes        = mSettings.showMinutes;
            var bShowSeconds        = mSettings.showSeconds;
            var bShowMilliseconds   = mSettings.showMilliseconds;
            
            var dUTSPresent         = new Date();
            var iTimePassed         = dUTSPresent.getTime() - iUTSPast;
            
            var sReadableTimePassed = "";
            var sMillisecondsPassed = "";
            var sSecondsPassed      = "";
            var sMinutesPassed      = "";
            var sHoursPassed        = "";
            var sDaysPassed         = "";
            
            //----------------------------------------------------------------//
            // Start measuring in days, hours, minutes, seconds and milliseconds
            //----------------------------------------------------------------//
            
            // -- If we show milliseconds -- //
            if (bShowMilliseconds) {
                sMillisecondsPassed += Math.floor( iTimePassed % 1000 ) + "ms";
                sReadableTimePassed = sMillisecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show seconds -- //
            if (bShowSeconds) {
                sSecondsPassed += Math.floor( (iTimePassed / 1000) % 60 ) + "s";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sSecondsPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sSecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show minutes -- //
            if (bShowMinutes) {
                sMinutesPassed += Math.floor( ( (iTimePassed / 1000 ) / 60) % 60 ) + "m";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sMinutesPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sMinutesPassed + sReadableTimePassed;
            }
            
            // -- If we show hours -- //
            if (bShowHours) {
                sHoursPassed += Math.floor( ( ( (iTimePassed / 1000 ) / 60 ) / 60) % 24 ) + "h";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sHoursPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sHoursPassed + sReadableTimePassed;
            }
            
            // -- If we show days -- //
            if (bShowDay) {
                sDaysPassed += Math.floor( ( ( ( (iTimePassed / 1000  ) / 60 ) / 60 ) / 24) % 365 ) + "d";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sDaysPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sDaysPassed + sReadableTimePassed;
            }
            
            return sReadableTimePassed;
            
        }
        
    }
    
});