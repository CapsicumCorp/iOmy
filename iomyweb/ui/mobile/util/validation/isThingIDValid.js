/*
Title: Thing ID Validator
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts a function in the validation module that checks a given
    Thing ID to see if it's valid.
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

$.sap.declare("IOMy.validation.isThingIDValid",true);

$.extend(IOMy.validation, {
    
    /**
     * Checks a given Thing ID to see if it's valid. Three things it checks for
     * are whether it's defined, if so, then checks whether it's a valid number,
     * and checks that the corresponding Thing is found in IOMy.common.ThingList.
     * 
     * @param {type} iThingId       ID of a Thing to check.
     * @returns {map}               Map containg error status and any error messages
     */
    isThingIDValid : function (iThingId) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables.
        //--------------------------------------------------------------------//
        var bError          = false;        // BOOLEAN: Error flag
        var bIsValid        = false;        // BOOLEAN: Validity flag
        var aErrorMessages  = [];           // ARRAY:   List of error messages
        var mResults        = {};           // MAP:     JS Object of validation results
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            aErrorMessages.push(sErrMesg);
            jQuery.sap.log.error(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that it's there and it's a valid number
        //--------------------------------------------------------------------//
        
        //-- Check the Thing ID --//
        if (iThingId === undefined) {
            //-- It doesn't exist --//
            bError = true;
            fnAppendError("Thing ID is not given!");
            
        } else if (isNaN(iThingId)) {
            //-- It's not a number --//
            bError = true;
            fnAppendError("Thing ID is not a valid number");
        }
        
        //--------------------------------------------------------------------//
        // If there are no errors, check that it exists in the ThingList
        // variable.
        //--------------------------------------------------------------------//
        if (bError === false) {
            $.each(IOMy.common.ThingList, function (sThingID, oThing) {

                if (oThing.Id == iThingId) {
                    bIsValid = true;
                }

            });
        }
        
        //--------------------------------------------------------------------//
        // If the ID is not in the ThingList variable, flag it as an error.
        //--------------------------------------------------------------------//
        if (bIsValid === false) {
            bError = true;
            fnAppendError("Thing does not exist!");
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = bIsValid;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    }
    
});