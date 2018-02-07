/*
Title: iOmy Time Module
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Description: Functions that assist with handling timestamps, and dates.
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

$.sap.declare("iomy.time",true);

iomy.time = new sap.ui.base.Object();

$.extend(iomy.time,{
	bBackdateUTS:           false,          //-- BOOLEAN:       Used to indicate if an old timestamp should be used instead of the current timestamp --//
	bRoundTime:             false,          //-- BOOLEAN:       Used to indicate if the time should be rounded down. (eg. rounded to down to a 5 minute value). --//
	iSecondsToRound:        300,            //-- INTEGER:       Nearest amount of time in seconds of when to round to (only if round time is turned on ).  --//
	iDefaultBackdateUTS:    1293885740,     //-- INTEGER:       Special timestamp to replace the current timestamp with to see what the UI would have looked at that date. --//
	sCurrentPeriod:         "Day",          //-- STRING:        Stores the Current Period --//
	
	
	
	
	/**************************************************************
	** Get Current UTS                                           **
	***************************************************************/
   
    /**
     * Converts a Javascript date to a more usable map.
     * 
     * @param {type} oDate      Javascript Date
     * @returns {object}        Date in a map format
     */
	ExtractTimeDataFromJSDate: function( oDate ) {
		//----------------------------------------------------//
		//-- 1.0 - Declare Variables                        --//
		//----------------------------------------------------//
		var iYear           = 0;
		var iMonth          = 0;
		var iDay            = 0;
		var iHour           = 0;
		var iMinute         = 0;
		var iSecond         = 0;
		var aResult         = {};
        
		//----------------------------------------------------//
        //-- 2.0 - Check the date argument                  --//
		//----------------------------------------------------//
        if (oDate === undefined || oDate === null) {
            throw new MissingArgumentException("Date must be given.");
        } else if (!(oDate instanceof Date)) {
            throw new IllegalArgumentException("A valid date must be given.");
        }
        
        try {
            //----------------------------------------------------//
            //-- 3.0 - Extract Time Data                        --//
            //----------------------------------------------------//
            iYear    = oDate.getFullYear();
            iMonth   = oDate.getMonth();
            iDay     = oDate.getDate();
            iHour    = oDate.getHours();
            iMinute  = oDate.getMinutes();
            iSecond  = oDate.getSeconds();

            //----------------------------------------------------//
            //-- 4.0 - Store in an array                        --//
            //----------------------------------------------------//
            aResult = {
                "year":		iYear,
                "month":	iMonth,
                "day":		iDay,
                "hour":		iHour,
                "minute":	iMinute,
                "second":	iSecond
            };

            
        } catch (e) {
            aResult = null;
            $.sap.log.error("Error in iomy.time.ExtractTimeDataFromJSDate ("+e.name+"): " + e.message);
            
        } finally {
            //----------------------------------------------------//
            //-- 9.0 - Return Results                           --//
            //----------------------------------------------------//
            return aResult;
        }
		
	},
	
	
	
	/**************************************************************
	** Get Current UTS                                           **
	***************************************************************/
    
    /**
     * Generates the current time in UTS.
     * 
     * @returns {Number} Current time in Unix Timestamp format.
     */
	GetCurrentUTS: function() {
		//----------------------------------------------------//
		//-- 1.0 - Declare Variables                        --//
		//----------------------------------------------------//
		var dDate				= new Date();		//-- DATE:		Stores the current UTS with microseconds -//
		var iCurrentTimestamp	= 0;				//-- OBJECT:	--//
		var iUTS				= dDate.getTime();	//-- INTEGER:   Current timestamp in milliseconds --//
		//----------------------------------------------------//
		//-- 2.0 - Calculate Timestamp                      --//
		//----------------------------------------------------//
		
        try {
            //-- IF BACKDATE IS SET				--//
            if( iomy.time.bBackdateUTS===true ) {
                iCurrentTimestamp = iomy.time.iDefaultBackdateUTS;


            //-- ELSE IF ROUNDTIME IS SET		--//
            } else if(iomy.time.bRoundTime===true  ) {
                iCurrentTimestamp = Math.floor( iUTS / (1000 * iomy.time.iSecondsToRound) ) * iomy.time.iSecondsToRound;


            //-- ELSE DO NORMAL CONVERSION		--//
            } else {
                iCurrentTimestamp = Math.floor( iUTS / 1000 );
            }
            
        } catch (e) {
            iCurrentTimestamp = -1;
            $.sap.log.error("Error in iomy.time.GetCurrentUTS:\n" + e.message);
            
        } finally {
            //----------------------------------------------------//
            //-- 9.0 - Return Results                           --//
            //----------------------------------------------------//
            return iCurrentTimestamp;
        }
		
	},
    
    /**
     * Determines whether a year is a leap year.
     * 
     * @param {mixed} vYear             Year as either an integer or a string
     * @returns {boolean}               Whether it's a leap year or not.
     */
    isLeapYear : function(vYear) {
        //--------------------------------------------------------------------//
        // Initialise Variables.
        //--------------------------------------------------------------------//
        var iYear;
        
        //--------------------------------------------------------------------//
        // Check that the month was given
        //--------------------------------------------------------------------//
        if (vYear === undefined) {
            throw new MissingArgumentException("Year is not given!");
        } else {
            //-- Is it a number? --//
            if (isNaN(vYear)) {
                throw new IllegalArgumentException("Year is not a valid number!");
            }
        }
        
        //--------------------------------------------------------------------//
        // Determine whether this is a leap year.
        //--------------------------------------------------------------------//
        iYear = parseInt(vYear);
        
        //-- Is the year divisible by 4? --//
        if (iYear % 4 === 0) {
            //-- If so, is it divisible by 100? --//
            if (iYear % 100) {
                //-- Alright, is it divisible by 400? --//
                if (iYear % 400) {
                    //-- It is a leap year. The year is a multiple of 100 and 400 (1600, 2000). --//
                    return true;
                } else {
                    //-- It is not a leap year as it's a multiple of 100 but not a multiple of 400. --//
                    return false;
                }
            }
            //-- Ok not divisible by 100. Nothing more to check. It's a leap year. --//
            else {
                return true;
            }
        }
        //-- The year is not divisible by 4! Not a leap year. --//
        else {
            return false;
        }
        
    },
	
	/**
     * Returns the number of days in a given month.
     * 
     * It takes into account the year so that if the given month is February, it
     * can determine if it's a leap year and return 29 if it is or 28 if it is
     * not.
     * 
     * Returns 28, 29, 30 (Apr, Jun, Sep, Nov), or 31 (Jan, Mar, May, Jul, Aug,
     * Oct, Dec).
     * 
     * @param {mixed} vYear             Year as either an integer or a string
     * @param {mixed} vMonth            Month as either an integer or a string
     * @returns {integer}               Number of days in a month.
     */
    getMaximumDateInMonth : function(vYear, vMonth) {
        //--------------------------------------------------------------------//
        // Initialise Variables.
        //--------------------------------------------------------------------//
        var oModule = this;
        var iMonth;
        var iMaxDate = null;
        
        //--------------------------------------------------------------------//
        // Check that the month was given
        //--------------------------------------------------------------------//
        if (vYear === undefined) {
            throw new MissingArgumentException("Year is not given!");
        } else {
            //-- Is it a number? --//
            if (isNaN(vYear)) {
                throw new IllegalArgumentException("Year is not a valid number!");
            }
        }
        
        //--------------------------------------------------------------------//
        // Check that the month was given.
        //--------------------------------------------------------------------//
        if (vMonth === undefined) {
            throw new MissingArgumentException("Month is not given!");
        } else {
            //-- Is it a number? --//
            if (isNaN(vMonth)) {
                throw new IllegalArgumentException("Month is not a valid number!");
            }
            
            //-- Is the month correct? --//
            iMonth = parseInt(vMonth);
            
            if (iMonth < 1 || iMonth > 12) {
                throw new IllegalArgumentException("Month must be given as a number between 1 and 12!");
            }
        }
        
        //--------------------------------------------------------------------//
        // Determine what the maximum date is.
        //--------------------------------------------------------------------//
        
        //-- If it's February, check that the given year is a leap year. --//
        if (iMonth === 2) {
            if (oModule.isLeapYear(vYear)) {
                iMaxDate = 29;
            } else {
                iMaxDate = 28;
            }
        }
        //-- Some months have 31 days. --//
        else if (iMonth === 1 || iMonth === 3 || iMonth === 5 || iMonth === 7 ||
                iMonth === 8 || iMonth === 10 || iMonth === 12)
        {
            iMaxDate = 31;
        }
        //-- Some months have 30 days. --//
        else if (iMonth === 4 || iMonth === 6 || iMonth === 9 || iMonth === 11) {
            iMaxDate = 30;
        }
        
        return iMaxDate;
    },
	
	/**
     * Returns the time in UTS format of a certain period before the current or
     * a given time (also in UTS format).
     * 
     * A period is required to fetch the start time of the period. Valid string
     * values are "day", "week", "fortnight", "month", "quarter", "year", and
     * "epoch".
     * 
     * @param {type} sPeriod        Period in time to use to generate the start time.
     * @param {type} iEndStamp      The end time in UTS (defaults to the current time)
     * 
     * @returns {Number}            The start time in UTS
     */
	GetStartStampForTimePeriod: function( sPeriod, iEndStamp ) {
		//------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                --//
		//------------------------------------------------------------//
        var oModule             = this;
		var iStartStamp			= 0;			//-- INTEGER:			Used to store the result of this function call (UnixTS startstamp) --//
		var sPeriodToLowercase	= "";			//-- STRING:			Used to store the TimePeriod in lower case for the condition checks --//
		
		//-- 1.1 - If period is undefined then use the day period   --//
		if( typeof sPeriod === 'undefined' ) {
			sPeriod = "day";
		}
		
		//-- 1.2 - If parameter is undefined then use the preset    --//
		if( typeof iEndStamp === 'undefined' ) {
			iEndStamp = iomy.time.GetCurrentUTS();
		}
		
        try {
            var thisDate        = new Date(iEndStamp);
            sPeriodToLowercase  = sPeriod.toLowerCase();

            //------------------------------------------------------------//
            //-- 2.0 - Calculate Timestamp                              --//
            //------------------------------------------------------------//
            switch( sPeriodToLowercase ) {
                case "10min":


                case "30min":


                case "6hour":


                case "day":
                    iStartStamp = ( iEndStamp - (86400000) );
                    break;

                case "week":
                    iStartStamp = ( iEndStamp - (86400000 * 7) );
                    break;

                case "fortnight":
                    iStartStamp = ( iEndStamp - (86400000 * 14) );
                    break;

                case "month":
                    iStartStamp = ( iEndStamp - (86400000 * oModule.getMaximumDateInMonth(thisDate.getFullYear(), (thisDate.getMonth() + 1))) );
                    console.log(iStartStamp);
                    console.log(oModule.getMaximumDateInMonth(thisDate.getFullYear(), (thisDate.getMonth() + 1)));
                    console.log(iEndStamp);
                    break;

                case "quarter":
                    iStartStamp = ( iEndStamp - (86400000 * 91) );
                    break;

                case "year":
                    iStartStamp = ( iEndStamp - (86400000 * 365) );
                    break;

                case "epoch":
                    iStartStamp = 0;
                    break;


                default:
                    throw new IllegalArgumentException("Time period '"+sPeriod+"' is invalid.");
            }

        } catch (e) {
            iStartStamp = -1;
            $.sap.log.error("Error in iomy.time.GetStartStampForTimePeriod: ("+e.name+"): " + e.message);
            
        } finally {
            //------------------------------------------------------------//
            //-- 9.0 - Return Results                                   --//
            //------------------------------------------------------------//

            return iStartStamp;
        }
	},
	
	/**
     * Converts a Javascript date object to military time (e.g. "0955")
     * 
     * @param {Date} date       Javascript date
     * 
     * @returns {String}        Date in military time (string format)
     */
	GetMilitaryTimeFromDate : function (date) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var sMilitaryTime   = "";
        var iHours;
        var iMinutes;
        
        //--------------------------------------------------------------------//
        // Check the date argument
        //--------------------------------------------------------------------//
        if (date === undefined) {
            throw new MissingArgumentException("Date must be given!");
        }
        
        try {
            //--------------------------------------------------------------------//
            // Take the hours and minutes and create a string with the military time
            //--------------------------------------------------------------------//
            iHours = date.getHours();
            iMinutes = date.getMinutes();

            if (iHours < 10) {
                sMilitaryTime += "0" + iHours;
            } else {
                sMilitaryTime += iHours;
            }

            if (iMinutes < 10) {
                sMilitaryTime += "0" + iMinutes;
            } else {
                sMilitaryTime += iMinutes;
            }
            
        } catch (e) {
            sMilitaryTime = null;
            $.sap.log.error("Error in iomy.time.GetMilitaryTimeFromDate: ("+e.name+"): " + e.message);
            
        } finally {
            return sMilitaryTime;
        }
    },
	
    /**
     * Converts a military time string into a Javascript Date object.
     * 
     * @param {type} sMilTime       Military time.
     * @returns {Date}              Javascript date object.
     */
	GetDateFromMilitaryTime : function (sMilTime) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var bError          = false;
        var aErrorMessages  = [];
        var date;
        var iHours;
        var iMinutes;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
            $.sap.log.error(sErrMesg);
        };
        
        try {
            //--------------------------------------------------------------------//
            // Check the time argument
            //--------------------------------------------------------------------//
            if (sMilTime !== undefined) {
                if (sMilTime.length !== 4) {
                    fnAppendError("Military time is not 4 digits long!");
                }

                if (isNaN(sMilTime)) {
                    fnAppendError("Military time is not a valid number!");
                }
            } else {
                throw new MissingArgumentException("Hours and minutes in military time must be given!");
            }

            if (bError) {
                throw new IllegalArgumentException("* "+aErrorMessages.join("\n* "));
            }

            //--------------------------------------------------------------------//
            // Check that the hour and minute figures are valid.
            //--------------------------------------------------------------------//
            iHours      = sMilTime.substr(0,2);
            iMinutes    = sMilTime.substr(2,4);

            if (iHours > 23) {
                fnAppendError("Hour must be between 0 and 23");
            }

            if (iMinutes > 59) {
                fnAppendError("Minutes must be between 0 and 59");
            }

            if (bError) {
                throw new IllegalArgumentException("* "+aErrorMessages.join("\n* "));
            }

            //--------------------------------------------------------------------//
            // Take the military time and create a date object with the input.
            //--------------------------------------------------------------------//
            date = new Date();
            date.setHours(parseInt(iHours));
            date.setMinutes(parseInt(iMinutes));
            
        } catch (e) {
            date = null;
            $.sap.log.error("Error in iomy.time.GetDateFromMilitaryTime ("+e.name+"): " + e.message);
            
        } finally {
            return date;
        }
    }
	
	
	
});