/*
Title: Get Maximum Day of the Month.
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Adds a function to determine the maximum day of the month depending
    on a given month and year.
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

$.sap.declare("IOMy.functions.time.getMaximumDateInMonth",true);

$.extend(IOMy.functions,{
    
    /**
     * 
     */
    getMaximumDateInMonth : function(vYear, vMonth) {
        //--------------------------------------------------------------------//
        // Initialise Variables.
        //--------------------------------------------------------------------//
        var me = this;
        var iMonth;
        var iMaxDate = null;
        
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
        // Check that the month was given.
        //--------------------------------------------------------------------//
        if (vMonth === undefined) {
            throw "Month is not given!";
        } else {
            //-- Is it a number? --//
            if (isNaN(vMonth)) {
                throw "Month is not a valid number!";
            }
            
            //-- Is the month correct? --//
            iMonth = parseInt(vMonth);
            
            if (iMonth < 1 || iMonth > 12) {
                throw "Month must be given as a number between 1 and 12!";
            }
        }
        
        //--------------------------------------------------------------------//
        // Determine what the maximum date is.
        //--------------------------------------------------------------------//
        
        //-- If it's February, check that the given year is a leap year. --//
        if (iMonth === 2) {
            if (me.isLeapYear(vYear)) {
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
    }
    
});