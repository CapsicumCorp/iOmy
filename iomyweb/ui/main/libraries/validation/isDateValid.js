/*
Title: Date/Timestamp Validator
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts a function in the validation module that checks a given
    timestamp to see if it's valid
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

$.sap.declare("IomyRe.validation.isDateValid",true);

$.extend(IomyRe.validation, {
    
    /**
     * Checks a given date to see if it's valid. It accepts date strings.
     * 
     * This function imposes stricter restrictions in the default Javascript
     * date validation which behaves differently across different browsers. For
     * example, it requires that the date strings conform to either one of these
     * two short formats, YYYY-MM-DD, or YYYY/MM/DD.
     * 
     * The information returned is a Javascript map that contains the validity
     * status of the date, any error messages, and the date itself as a
     * Javascript Date object.
     * 
     * @param {type} vDate          Date to check.
     * @returns {map}               Map containg validity status, any error messages, and the date itself as a JS Date
     */
    isDateValid : function (vDate) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables.
        //--------------------------------------------------------------------//
        var bError          = false;        // BOOLEAN: Error flag
        var bYearValid      = null;         // BOOLEAN: Flag to indicate whether the year is valid.
        var bMonthValid     = null;         // BOOLEAN: Flag to indicate whether the month is valid.
        var bDayValid       = null;         // BOOLEAN: Flag to indicate whether the day is valid.
        var aErrorMessages  = [];           // ARRAY:   List of error messages
        var mResults        = {};           // MAP:     JS Object of validation results
        var oDate           = null;         // JS DATE: Date created with the given date parameter once verified successfully.
        var aDatePieces     = [];           // ARRAY:   Contains strings that made up a date string.
        
        //--------------------------------------------------------------------//
        // Create lambda (anonymous) functions.
        //--------------------------------------------------------------------//
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            aErrorMessages.push(sErrMesg);
            jQuery.sap.log.error(sErrMesg);
        };
        
        // Lambda function to check that the year is a number.
        var fnIsYearValid   = function (sYear) {
            if (sYear.length !== 4) {
                fnAppendError("Year must have 4 digits!");
                return false;
            }
            
            if (isNaN(sYear)) {
                fnAppendError("Year is not a valid number!");
                return false;
            } else {
                return true;
            }
        };
        
        // Lambda function to check that the month is valid.
        var fnIsMonthValid   = function (sMonth) {
            var iMonth;
            
            if (sMonth.length !== 2) {
                fnAppendError("Month must have 2 chararcters!");
                return false;
            }
            
            if (isNaN(sMonth)) {
                fnAppendError("Month is not a valid number!");
                return false;
            } else {
                iMonth = parseInt(sMonth);
                
                if (iMonth < 1 || iMonth > 12) {
                    fnAppendError("Month must be between 1 and 12!");
                    return false;
                } else {
                    return true;
                }
            }
        };
        
        // Lambda function to check that the day of the month is valid.
        var fnIsDayValid   = function (sYear, sMonth, sDay) {
            var iMaxDay;
            var iDate;
            var bLambdaError = false;
            
            if (fnIsYearValid(sYear) === false) {
                bLambdaError = true;
            }
            
            if (sMonth.length !== 2) {
                fnAppendError("Month must have 2 chararcters!");
                bLambdaError = true;
            }
            
            if (sDay.length !== 2) {
                fnAppendError("Day of the month must have 2 chararcters!");
                bLambdaError = true;
            }
            
            if (bLambdaError === false) {
                try {
                    iMaxDay = IomyRe.functions.getMaximumDateInMonth(sYear, sMonth);
                    iDate = parseInt(sDay);

                    if (iDate < 1 || sDay > iMaxDay) {
                        fnAppendError("Day of the month must be between 1 and "+iMaxDay+"!");
                        bLambdaError = true;
                    }
                } catch (eMonthError) {
                    fnAppendError(eMonthError);
                    bLambdaError = true;
                }
            }
            
            // If there are no errors, return true, otherwise return false.
            return !bLambdaError;
            
        };
        
        //--------------------------------------------------------------------//
        // Check that the timestamp is there
        //--------------------------------------------------------------------//
        if (vDate === undefined) {
            //-- It doesn't exist --//
            bError = true;
            fnAppendError("Date is not given!");
        }
        
        //--------------------------------------------------------------------//
        // If the given date is not a unix timestamp and it's a string, there
        // will need to be checks to make sure it will be valid on multiple
        // browsers.
        //--------------------------------------------------------------------//
        if (bError === false) {
            if (isNaN(vDate) && typeof vDate === "string") {

                if (vDate.length === 10 || vDate.length === 7 || vDate.length === 4) {

                    //-- If it has 4 characters, it could be a year. Verify this. --//
                    if (vDate.length === 4) {
                        if (fnIsYearValid(vDate)) {
                            oDate = new Date(vDate);
                        }
                    
                    //-- If it has 7 characters, it could contain the year and month. Verify this. --//
                    } else if (vDate.length === 7) {
                        
                        //-- Can the the string be split into two pieces? --//
                        
                        // Try using a hyphen as a delimiter. //
                        aDatePieces = vDate.split('-');
                        
                        if (aDatePieces.length === 1) {
                            // Try using a forward slash //
                            aDatePieces = vDate.split('/');
                        }
                        
                        //-- If not, report it as an error. --//
                        if (aDatePieces.length !== 2) {
                            bError = true;
                            fnAppendError("Date format is incorrect. It should be YYYY-MM.");
                            
                        //-- Otherwise, verify each element. --//
                        } else {
                            bYearValid  = fnIsYearValid( aDatePieces[0] );
                            bMonthValid = fnIsMonthValid( aDatePieces[1] );
                            
                            // If each element is valid, then create the date object.
                            if (bYearValid && bMonthValid) {
                                oDate = new Date(vDate);
                            }
                            
                        }
                        
                    //-- If it has 10 characters, it could contain the year, month, and the day. Verify this. --//
                    } else if (vDate.length === 10) {
                        
                        //-- Can the the string be split into three pieces? --//
                        
                        // Try using a hyphen as a delimiter. //
                        aDatePieces = vDate.split('-');
                        
                        if (aDatePieces.length === 1) {
                            // Try using a forward slash //
                            aDatePieces = vDate.split('/');
                        }
                        
                        //-- If not, report it as an error. --//
                        if (aDatePieces.length !== 3) {
                            bError = true;
                            fnAppendError("Date format is incorrect. It should be YYYY-MM-DD.");
                            
                        //-- Otherwise, verify each element. --//
                        } else {
                            //bYearValid  = fnIsYearValid( aDatePieces[0] );
                            bDayValid   = fnIsDayValid( aDatePieces[0], aDatePieces[1], aDatePieces[2] );
                            
                            // If each element is valid, then create the date object.
                            if (bDayValid) {
                                oDate = new Date(vDate);
                            } else {
                                bError = true;
                            }
                            
                        }
                    }


                } else {
                    bError = true;
                    fnAppendError("Date given is not a valid string!");
                }
            }
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = !bError;
        mResults.aErrorMessages = aErrorMessages;
        mResults.date           = oDate;
        
        return mResults;
    }
    
});