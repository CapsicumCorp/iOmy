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

$.sap.declare("IOMy.time",true);

IOMy.time = new sap.ui.base.Object();

$.extend(IOMy.time,{
	bBackdateUTS:           false,          //-- BOOLEAN:       Used to indicate if an old timestamp should be used instead of the current timestamp --//
	bRoundTime:             false,          //-- BOOLEAN:       Used to indicate if the time should be rounded down. (eg. rounded to down to a 5 minute value). --//
	iSecondsToRound:        300,            //-- INTEGER:       Nearest amount of time in seconds of when to round to (only if round time is turned on ).  --//
	iDefaultBackdateUTS:    1293885740,     //-- INTEGER:       Special timestamp to replace the current timestamp with to see what the UI would have looked at that date. --//
	sCurrentPeriod:         "Day",          //-- STRING:        Stores the Current Period --//
	
	
	
	
	/**************************************************************
	** Get Current UTS                                           **
	***************************************************************/
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
		if( IOMy.time.bBackdateUTS===true ) {
			iCurrentTimestamp = IOMy.time.iDefaultBackdateUTS;
			
			
		//-- ELSE IF ROUNDTIME IS SET		--//
		} else if(IOMy.time.bRoundTime===true  ) {
			iCurrentTimestamp = Math.floor( iUTS / (1000 * IOMy.time.iSecondsToRound) ) * IOMy.time.iSecondsToRound;
			
			
		//-- ELSE DO NORMAL CONVERSION		--//
		} else {
			iCurrentTimestamp = Math.floor( iUTS / 1000 );
		}
		
		//----------------------------------------------------//
		//-- 9.0 - Return Results                           --//
		//----------------------------------------------------//
		return iCurrentTimestamp;
		
	},
	
	
	
	
	/**************************************************************
	** 
	***************************************************************/
	GetStartStampForTimePeriod: function( sPeriod, iEndStamp ) {
		//------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                --//
		//------------------------------------------------------------//
		var iStartStamp			= 0;			//-- INTEGER:			Used to store the result of this function call (UnixTS startstamp) --//
		var sPeriodToLowercase	= "";			//-- STRING:			Used to store the TimePeriod in lower case for the condition checks --//
		
		//-- 1.2 - If parameter is undefined then use the preset    --//
		if( typeof iEndStamp === 'undefined' ) {
			iEndStamp = IOMy.time.GetCurrentUTS();
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
		
	}
	
	
	
	
	
	
	
	
});