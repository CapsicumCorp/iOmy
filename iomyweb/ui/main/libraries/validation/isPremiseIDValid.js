/*
Title: Premise ID Validator
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts a function in the validation module that checks a given
    Premise ID to see if it's valid.
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

$.sap.declare("IomyRe.validation.isPremiseIDValid",true);

$.extend(IomyRe.validation, {
    
    /**
     * Checks a given Premise ID to see if it's valid. Three things it checks for
     * are whether it's defined, if so, then checks whether it's a valid number,
     * and checks that the corresponding Premise is found in IomyRe.common.PremisesList.
     * 
     * @param {type} iPremiseId       ID of a Premise to check.
     * @returns {map}              Map containg error status and any error messages
     */
    isPremiseIDValid : function (iPremiseId) {
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
        
        //-- Check the Premise ID --//
        if (iPremiseId === undefined) {
            //-- It doesn't exist --//
            bError = true;
            fnAppendError("Premise ID is not given!");
            
        } else if (isNaN(iPremiseId)) {
            //-- It's not a number --//
            bError = true;
            fnAppendError("Premise ID is not a valid number");
        }
        
        //--------------------------------------------------------------------//
        // If there are no errors, check that it exists in the PremiseList
        // variable.
        //--------------------------------------------------------------------//
        if (bError === false) {
            $.each(IomyRe.common.PremiseList, function (sPremiseID, oPremise) {
                
                //------------------------------------------------------------//
                // Capture the room list in the currently held premise.
                //------------------------------------------------------------//
                if (sPremiseID !== undefined && sPremiseID !== null &&
                        oPremise !== undefined && oPremise !== null)
                {
					if (oPremise.Id == iPremiseId) {
						bIsValid = true;
					}
                }

            });
        }
        
        //--------------------------------------------------------------------//
        // If the ID is not in the PremiseList variable, flag it as an error.
        //--------------------------------------------------------------------//
        if (bIsValid === false) {
            bError = true;
            fnAppendError("Premise does not exist!");
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = bIsValid;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    }
    
});