/*
Title: Determine Leap Year
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Adds a function to determine whether a year is a leap year.
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
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.functions.time.isLeapYear",true);

$.extend(IOMy.functions,{
    
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
        var me = this;
        var iYear;
        
        //--------------------------------------------------------------------//
        // Check that the month was given
        //--------------------------------------------------------------------//
        if (vYear === undefined) {
            throw "Year is not given!";
        } else {
            //-- Is it a number? --//
            if (isNaN(vYear)) {
                throw "Year is not a valid number!";
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
        
    }
    
});