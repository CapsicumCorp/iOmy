/*
Title: Link ID Validator
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Inserts a function in the validation module that checks a given
    Link ID to see if it's valid.
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

$.sap.declare("IomyRe.validation.isLinkIDValid",true);

$.extend(IomyRe.validation, {
    
    /**
     * Checks a given Link ID to see if it's valid. Three things it checks for
     * are first whether it's defined, if so, then checks whether it's a valid
     * number, and checks that the corresponding Link is found in
	 * IomyRe.common.LinkList.
     * 
     * @param {type} iLinkId       ID of a Link to check.
     * @returns {map}              Map containg error status and any error messages
     */
    isLinkIDValid : function (iLinkId) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables.
        //--------------------------------------------------------------------//
        var bError          = false;        // BOOLEAN: Error flag
        var bIsValid        = false;        // BOOLEAN: Validity flag
        var aErrorMessages  = [];           // ARRAY:   List of error messages
        var mResults        = {};           // MAP:     JS Object of validation results
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check that it's there and it's a valid number
        //--------------------------------------------------------------------//
        
        //-- Check the Link ID --//
        if (iLinkId === undefined) {
            //-- It doesn't exist --//
            fnAppendError("Link ID is not given!");
            
        } else if (isNaN(iLinkId)) {
            //-- It's not a number --//
            fnAppendError("Link ID is not a valid number");
        }
        
        //--------------------------------------------------------------------//
        // If there are no errors, check that it exists in the LinkList
        // variable.
        //--------------------------------------------------------------------//
        if (bError === false) {
            $.each(IomyRe.common.LinkList, function (sLinkID, oLink) {

                if (oLink.LinkId == iLinkId) {
                    bIsValid = true;
                }

            });
        }
        
        //--------------------------------------------------------------------//
        // If the ID is not in the LinkList variable, flag it as an error.
        //--------------------------------------------------------------------//
        if (bIsValid === false) {
            fnAppendError("Link does not exist!");
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = bIsValid;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    }
    
});