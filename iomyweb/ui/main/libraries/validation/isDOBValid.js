/*
Title: Date of Birth Validator
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts a function in the validation module that checks a given
    date-of-birth to see if it can be used.
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

$.sap.declare("IomyRe.validation.isDOBValid",true);

$.extend(IomyRe.validation, {
    
    /**
     * Checks a given date to see if it's valid date of birth.
     * 
     * In addition to checking to see if the date itself is valid, it checks
     * that date is not in the future. It is an error if the DOB is set in the
     * future.
     * 
     * The information returned is a Javascript map that contains the validity
     * status of the date, any error messages, and the date itself as a
     * Javascript Date object.
     * 
     * @param {type} vDate          Date of birth to check
     * @returns {map}               Map containg validity status, any error messages, and the date itself as a JS Date
     */
    isDOBValid : function (vDate) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables.
        //--------------------------------------------------------------------//
        var bError          = false;        // BOOLEAN: Error flag
        var aErrorMessages  = [];           // ARRAY:   List of error messages
        var mResults        = {};           // MAP:     JS Object of validation results
        var mDateResults    = null;
        var oCurrentDate    = new Date();
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            aErrorMessages.push(sErrMesg);
            jQuery.sap.log.error(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Validate the date
        //--------------------------------------------------------------------//
        if (vDate.length === 10) {
            //-- Date string must be 10 characters long. --//
            mDateResults = this.isDateValid(vDate);
            if (mDateResults.bIsValid === false) {
                bError = true;
                aErrorMessages = mDateResults.aErrorMessages;
            }
        } else {
            //-- Date size is not the right size. --//
            bError = true;
            fnAppendError("Date is not in the right format!");
        }
        
        //--------------------------------------------------------------------//
        // If all is well, ensure that the date is not in the future
        //--------------------------------------------------------------------//
        if (bError === false && mDateResults.date !== null) {
            if (mDateResults.date.getTime() > oCurrentDate.getTime()) {
                bError = true;
                fnAppendError("Date is set in the future!");
            }
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = !bError;
        mResults.aErrorMessages = aErrorMessages;
        mResults.date           = mDateResults !== null ? mDateResults.date : null;
        
        return mResults;
    }
    
});