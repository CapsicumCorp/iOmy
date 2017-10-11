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

$.sap.declare("IomyRe.time",true);

IomyRe.time = new sap.ui.base.Object();

$.extend(IomyRe.time,{
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
		//-- 2.0 - Extract Time Data                        --//
		//----------------------------------------------------//
		iYear    = oDate.getFullYear();
		iMonth   = oDate.getMonth();
		iDay     = oDate.getDate();
		iHour    = oDate.getHours();
		iMinute  = oDate.getMinutes();
		iSecond  = oDate.getSeconds();
		
		//----------------------------------------------------//
		//-- 3.0 - Store in an array                        --//
		//----------------------------------------------------//
		aResult = {
			"year":		iYear,
			"month":	iMonth,
			"day":		iDay,
			"hour":		iHour,
			"minute":	iMinute,
			"second":	iSecond
		};
		
		//----------------------------------------------------//
		//-- 9.0 - Return Results                           --//
		//----------------------------------------------------//
		return aResult;
		
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
		
		//-- IF BACKDATE IS SET				--//
		if( IomyRe.time.bBackdateUTS===true ) {
			iCurrentTimestamp = IomyRe.time.iDefaultBackdateUTS;
			
			
		//-- ELSE IF ROUNDTIME IS SET		--//
		} else if(IomyRe.time.bRoundTime===true  ) {
			iCurrentTimestamp = Math.floor( iUTS / (1000 * IomyRe.time.iSecondsToRound) ) * IomyRe.time.iSecondsToRound;
			
			
		//-- ELSE DO NORMAL CONVERSION		--//
		} else {
			iCurrentTimestamp = Math.floor( iUTS / 1000 );
		}
		
		//----------------------------------------------------//
		//-- 9.0 - Return Results                           --//
		//----------------------------------------------------//
		return iCurrentTimestamp;
		
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
		var iStartStamp			= 0;			//-- INTEGER:			Used to store the result of this function call (UnixTS startstamp) --//
		var sPeriodToLowercase	= "";			//-- STRING:			Used to store the TimePeriod in lower case for the condition checks --//
		
		//-- 1.2 - If parameter is undefined then use the preset    --//
		if( typeof iEndStamp === 'undefined' ) {
			iEndStamp = IomyRe.time.GetCurrentUTS();
		}
		
		sPeriodToLowercase = sPeriod.toLowerCase();
		
		//------------------------------------------------------------//
		//-- 2.0 - Calculate Timestamp                              --//
		//------------------------------------------------------------//
		switch( sPeriodToLowercase ) {
			case "10min":
				
				
			case "30min":
				
				
			case "6hour":
				
				
			case "day":
				iStartStamp = ( iEndStamp - (86400) );
				break;
				
			case "week":
				iStartStamp = ( iEndStamp - (86400 * 7) );
				break;
				
			case "fortnight":
				iStartStamp = ( iEndStamp - (86400 * 14) );
				break;
				
			case "month":
				iStartStamp = ( iEndStamp - (86400 * 31) );
				break;
				
			case "quarter":
				iStartStamp = ( iEndStamp - (86400 * 91) );
				break;
				
			case "year":
				iStartStamp = ( iEndStamp - (86400 * 365) );
				break;
				
			case "epoch":
				iStartStamp = 0;
				break;
				
				
			default:
				console.log("");
		}
		
		//------------------------------------------------------------//
		//-- 3.0 - Check the results                                --//
		//------------------------------------------------------------//
		
		
		
		
		
		//------------------------------------------------------------//
		//-- 9.0 - Return Results                                   --//
		//------------------------------------------------------------//
		
		
		return iStartStamp;
		
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
        var me              = this;
        var sMilitaryTime   = "";
        var iHours;
        var iMinutes;
        
        //--------------------------------------------------------------------//
        // Check the date argument
        //--------------------------------------------------------------------//
        if (date === undefined) {
            throw new MissingArgumentException("Date must be given!");
        }
        
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
        
        return sMilitaryTime;
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
        var me              = this;
        var bError          = false;
        var aErrorMessages  = [];
        var date;
        var iHours;
        var iMinutes;
        
        var fnAppendError = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
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
        
        return date;
    }
	
	
	
});