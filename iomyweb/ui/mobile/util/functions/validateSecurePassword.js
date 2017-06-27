/*
Title: Validate Secure Password Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to see if a password is secure enough.
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

$.sap.declare("IOMy.functions.validateSecurePassword",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Checks a given password to determine if it is secure enough to be suitable
     * for iOmy.
     * 
     * WARNING: Do not use this function for checking passwords that are
     * required for accessing a device via the network. The passwords set on the
     * device may or may not conform to the same rules as the iOmy passwords.
     * 
     * This password checker is mostly used to check that new passwords,
     * especially user passwords, are secure enough to be used in iOmy.
     * 
     * @param {string} sPassword
     * @returns {map}
     */
    validateSecurePassword : function (sPassword) {
        var bValid;
        var aValidationErrorMessages    = [];
		var sErrorMessage				= "";
        var mInfo                       = {};
        var bContinueCheck              = false;
        var bEightChars                 = false;
        var bHasASymbol                 = false;
        var bHasANumber                 = false;
        var bHasAnUpperCaseLetter       = false;
        var bHasALowerCaseLetter        = false;
        var iExpectedPasswordLength     = 8;
        var iPasswordLength             = sPassword.length;
        var iSymbols                    = 0;
        var iNumbers                    = 0;
        var iLetters                    = 0;
        var iUpperCaseLetters           = 0;
        var iLowerCaseLetters           = 0;

        //----------------------------------//
        // How long is the password?
        //----------------------------------//
        if (iPasswordLength >= iExpectedPasswordLength) {
            //---------------------------------------------------------------------------------//
            // Take any spaces off the end of the password in case someone was cheeky enough to
            // try to circumvent the 8 character limit by placing spaces on either sides of the
            // characters. No chance!
            //---------------------------------------------------------------------------------//
            sPassword = sPassword.trim();
            iPasswordLength = sPassword.length;

            // Now see what the true length of the password is.
            if (iPasswordLength >= iExpectedPasswordLength) {
                bEightChars = true;
            }
        }
		
		//---------------------------------------------------------------------------------//
		// Go through every single character, analyse each one to see if it's a letter,
		// number, or symbol.
		//---------------------------------------------------------------------------------//
		for (var i = 0; i < iPasswordLength; i++) {
			if (bContinueCheck === true) {
				break;
			}
			// Is it a number?
			if (!isNaN(sPassword.charAt(i))) {
				iNumbers++;

			// Is it a letter?
			} else if (sPassword.charAt(i).match(/[A-Z]/i) !== null) { // i for case-Insensitive
				// Is it upper or lower case.
				if (sPassword.charAt(i).match(/[A-Z]/g) !== null) {
					iUpperCaseLetters++;
				} else if (sPassword.charAt(i).match(/[a-z]/g) !== null) {
					iLowerCaseLetters++;
				}
				iLetters++;

			// So it must be some sort of symbol.
			} else {
				iSymbols++;
			}
		}

		//----------------------------------------------------------------------------------------//
		// Check that all the criteria have been met
		//----------------------------------------------------------------------------------------//
		// Are there numbers?
		if (iNumbers > 0) {
			bHasANumber = true;
		}

		// Are there letters?
		if (iLetters > 0) {
			// Are there upper-case letters?
			if (iUpperCaseLetters > 0) {
				bHasAnUpperCaseLetter = true;
			}

			// Are there lower-case letters?
			if (iLowerCaseLetters > 0) {
				bHasALowerCaseLetter = true;
			}
		}

		// Are there symbols?
		if (iSymbols > 0) {
			bHasASymbol = true;
		}

        //----------------------------------------------------------------------------------------//
        // Verify validity and generate error messages when not all of the conditions are met.
        //----------------------------------------------------------------------------------------//
        if (bEightChars === true && bHasAnUpperCaseLetter === true && bHasALowerCaseLetter === true &&
                bHasANumber === true && bHasASymbol === true)
        {

            bValid = true;

        } else { // One of the conditions has not been met
            bValid = false;
            // Populate the error log with the relevant messages.
			sErrorMessage += "* Password must:\n";
			sErrorMessage += "	- Be at least 8 characters. No trailing spaces\n";
			sErrorMessage += "	- Have at least one upper-case letter\n";
			sErrorMessage += "	- Have at least one lower-case letter\n";
			sErrorMessage += "	- Have at least one number\n";
			sErrorMessage += "	- Have a symbol (!, @, %, etc)";
			
			aValidationErrorMessages.push(sErrorMessage);
        }
        
        //-------------------------------------------------------------------//
        // Now pack the results into the info map
        //-------------------------------------------------------------------//
        mInfo.bValid = bValid;
        mInfo.aValidationErrorMessages = aValidationErrorMessages;

        return mInfo;
    }
    
});