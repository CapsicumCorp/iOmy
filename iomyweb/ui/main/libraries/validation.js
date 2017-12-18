/*
Title: Argument and Parameter Validation Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Holds numerous functions for verifying specific data to check that
    said data is valid.
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

$.sap.declare("IomyRe.validation",true);

IomyRe.validation = new sap.ui.base.Object();

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
    },
    
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
            fnAppendError("Date of Birth is not in the right format!");
        }
        
        //--------------------------------------------------------------------//
        // If all is well, ensure that the date is not in the future
        //--------------------------------------------------------------------//
        if (bError === false && mDateResults.date !== null) {
            if (mDateResults.date.getTime() > oCurrentDate.getTime()) {
                bError = true;
                fnAppendError("Date of Birth is set in the future!");
            }
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = !bError;
        mResults.aErrorMessages = aErrorMessages;
        mResults.date           = mDateResults !== null ? mDateResults.date : null;
        
        return mResults;
    },
    
    // TODO: Finish this off and play around with it.
    isFormFieldValid : function (mField) {
        //-------------------------------------------------//
        // Variables
        //-------------------------------------------------//
        var bError                  = false;
        var aErrorMessages          = [];
        var mResults                = {};
        var bRequired               = false;
        var bDefaultValue           = null;
        var sGivenValue             = null;
        var sType                   = "String";
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
            jQuery.sap.log.error(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Check if the field is actually specified, and if so, check if it's a
        // valid JS Object.
        //--------------------------------------------------------------------//
        if (mField === undefined || mField === null) {
            fnAppendError("A field object must be given.");
        } else if (typeof mField !== "object") {
            fnAppendError("The field parameter is an invalid type. Expecting object, '"+typeof mField+"' given.");
        }
        
        //--------------------------------------------------------------------//
        // Error Checking Round 1:
        // 
        // If the field parameter is valid, check if the field is required, and
        // if a value was given.
        //--------------------------------------------------------------------//
        if (!bError) {
            if (mField.required) {
                bRequired = mField.required;
            }
            
            //----------------------------------------------------------------//
            // Check if a default value was given then the value itself.
            //----------------------------------------------------------------//
            if (mField.default !== undefined && mField.default !== null && mField.default !== "") {
                bDefaultValue = mField.default;
            }
            
            if (mField.value !== undefined && mField.value !== null && mField.value !== "") {
                sGivenValue = mField.default;
            }
            
            //----------------------------------------------------------------//
            // Use the default value if the actual value is not specified.
            //----------------------------------------------------------------//
            if (sGivenValue === null && bDefaultValue !== null) {
                sGivenValue = bDefaultValue;
            }
            
            //----------------------------------------------------------------//
            // If required check if there is a value, or at least the default
            // value.
            //----------------------------------------------------------------//
            if (bRequired && sGivenValue === null) {
                fnAppendError("$FIELD is required.");
            }
        }
        
        //--------------------------------------------------------------------//
        // Error Checking Round 2:
        //
        // If the value exists, then check the expected type and find if the
        // value is appropriate to the specified type. If 'type' isn't given, a 
        // 'String' is assumed.
        //--------------------------------------------------------------------//
        if (!bError && sGivenValue !== null) {
            if (mField.type !== undefined && mField.type !== null) {
                sType = mField.type;
            }
            
            if (sType === "Integer" || sType === "Float" || sType === "Number") {
                if (isNaN(sGivenValue)) {
                    fnAppendError("$FIELD is not a valid number");
                } else {
                    //--------------------------------------------------------//
                    // Check that the number is a whole number if we're
                    // expecting an integer.
                    //--------------------------------------------------------//
                    if (sType === "Integer" && (sGivenValue > Math.floor(sGivenValue))) {
                        fnAppendError("$FIELD is not a whole number. Integers must be whole numbers (4, 33, etc.).");
                    }
                }
            }
            
            if (sType === "Boolean") {
                if (typeof sGivenValue === "boolean") {
                    
                } else if (!isNaN(sGivenValue)) {
                    
                }
            }
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = !bError;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    },
    
    /**
     * Checks an IPv4 address to see if it's in a valid format.
     * 
     * @param {type} sIPAddress              IP Address to validate.
     * @returns {map}                        The map containing result information including whether it's valid and any error message.
     */
    isIPv4AddressValid : function (sIPAddress) {
        //-------------------------------------------------//
        // Variables
        //-------------------------------------------------//
        var bError                    = false;
        var aErrorMessages            = [];
        var bIPAddressFormatError     = false;
        var mResult                   = {};
        
        //-------------------------------------------------//
        // Check that the IP address is given.
        //-------------------------------------------------//
        if (sIPAddress === null || sIPAddress === undefined || sIPAddress === false || sIPAddress === "") {
            bError = true;
            aErrorMessages.push("IP address must be given.");
        } else {

            //-------------------------------------------------//
            // Are there three dots in the IP Address?         //
            //-------------------------------------------------//
            var aThreeDots = sIPAddress.match(/\./g);

            if (aThreeDots === null || aThreeDots.length !== 3 || sIPAddress.charAt(0) === '.' || sIPAddress.charAt( sIPAddress.length - 1 ) === '.') {
                bError = true; // No. FAIL!
                aErrorMessages.push("IP Address: There must be only 4 parts separated by dots ('.') in an IPv4 address.");
            }

            //---------------------------------------------------------//
            // There are three dots. Are the four parts valid numbers? //
            //---------------------------------------------------------//
            var aIPAddressParts = sIPAddress.split('.');

            // Check each number
            for (var i = 0; i < aIPAddressParts.length; i++) {
                for (var j = 0; j < aIPAddressParts[i].length; j++) {
                    // Spaces and the plus symbol are ignored by isNaN(). isNaN() covers the rest.
                    if (aIPAddressParts[i].charAt(j) === ' ' || aIPAddressParts[i].charAt(j) === '+' || isNaN(aIPAddressParts[i].charAt(j))) {
                        bIPAddressFormatError = true; // INVALID CHARACTER
                        break;
                    }
                }

                if (aIPAddressParts[i].length > 1 && aIPAddressParts[i].charAt(0) === "0") {
                    bError = true;
                    aErrorMessages.push("IP Address: One of the numbers start with '0'.");
                }

                if (bIPAddressFormatError === true) {
                    bError = true;
                    aErrorMessages.push("IP Address: One of the numbers contains invalid characters.");
                    break;
                } else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
                    bError = true;
                    aErrorMessages.push("IP Address: One of the numbers is greater than 255 or a negative number.");
                    break;
                }
            }
        }
        
        //-------------------------------------------------//
        // Prepare the result map.
        //-------------------------------------------------//
        mResult.bValid            = !bError;
        mResult.aErrorMessages    = aErrorMessages;
        
        return mResult;
    },
    
    /**
     * Checks whether a given IPv4 port is valid.
     * 
     * @param {type} sIPPort        IP Port to check
     * @returns {map}               Data containing the result
     */
    isIPv4PortValid : function (sIPPort) {
        //-------------------------------------------------//
        // Variables
        //-------------------------------------------------//
        var bError                    = false;
        var aErrorMessages            = [];
        var mResult                   = {};
        
        //-------------------------------------------------//
        // Check that the IP address is given.
        //-------------------------------------------------//
        if (sIPPort === null || sIPPort === undefined || sIPPort === false || sIPPort.length === 0) {
            bError = true;
            aErrorMessages.push("IP Port must be given.");
            
        } else {
            var aInvalidChars    = sIPPort.match(/[^0-9]/g);

            if (aInvalidChars !== null) {
                bError = true;
                aErrorMessages.push("IP Port: The port contains invalid character(s).");
            }
        }
        
        //-------------------------------------------------//
        // Prepare the result map.
        //-------------------------------------------------//
        mResult.bValid            = !bError;
        mResult.aErrorMessages    = aErrorMessages;
        
        return mResult;
    },
    
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
    },
    
    /**
     * Checks a given password to determine if it is secure enough to be
     * suitable for iOmy.
     * 
     * WARNING: Do not use this function for checking passwords that are
     * required for accessing a device via the network. The passwords set on
     * devices will most likely not be subject to the same stringent security
     * standards.
     * 
     * This password checker is used to check that new passwords, especially
     * user passwords, are secure enough to be used in iOmy.
     * 
     * @param {string} sPassword
     * @returns {map}
     */
    isPasswordSecure : function (sPassword) {
        var bValid;
        var aValidationErrorMessages    = [];
        var sErrorMessage                = "";
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
            sErrorMessage += "Password must:\n";
            sErrorMessage += "- Be at least 8 characters. No trailing spaces\n";
            sErrorMessage += "- Have at least one upper-case letter\n";
            sErrorMessage += "- Have at least one lower-case letter\n";
            sErrorMessage += "- Have at least one number\n";
            sErrorMessage += "- Have a symbol (!, @, %, etc)";
            
            aValidationErrorMessages.push(sErrorMessage);
        }
        
        //-------------------------------------------------------------------//
        // Now pack the results into the info map
        //-------------------------------------------------------------------//
        mInfo.bIsValid = bValid;
        mInfo.aErrorMessages = aValidationErrorMessages;

        return mInfo;
    },
    
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
    },
    
    /**
     * Checks a given Room ID to see if it's valid. Three things it checks for
     * are whether it's defined, if so, then checks whether it's a valid number,
     * and checks that the corresponding Room is found in IomyRe.common.RoomsList.
     * 
     * @param {type} iRoomId       ID of a Room to check.
     * @returns {map}              Map containg error status and any error messages
     */
    isRoomIDValid : function (iRoomId) {
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
        
        //-- Check the Room ID --//
        if (iRoomId === undefined) {
            //-- It doesn't exist --//
            bError = true;
            fnAppendError("Room ID is not given!");
            
        } else if (isNaN(iRoomId)) {
            //-- It's not a number --//
            bError = true;
            fnAppendError("Room ID is not a valid number");
        }
        
        //--------------------------------------------------------------------//
        // If there are no errors, check that it exists in the RoomList
        // variable.
        //--------------------------------------------------------------------//
        if (bError === false) {
            $.each(IomyRe.common.RoomsList, function (sPremiseID, oPremise) {
                
                //------------------------------------------------------------//
                // Capture the room list in the currently held premise.
                //------------------------------------------------------------//
                if (sPremiseID !== undefined && sPremiseID !== null &&
                        oPremise !== undefined && oPremise !== null)
                {
                    //--------------------------------------------------------//
                    // Find the room.
                    //--------------------------------------------------------//
                    $.each(oPremise, function(sRoomID, oRoom) {
                        
                        if (sRoomID !== undefined && sRoomID !== null &&
                                oRoom !== undefined && oRoom !== null)
                        {
                            if (oRoom.RoomId == iRoomId) {
                                bIsValid = true;
                            }
                        }
                        
                    });
                }

            });
        }
        
        //--------------------------------------------------------------------//
        // If the ID is not in the RoomList variable, flag it as an error.
        //--------------------------------------------------------------------//
        if (bIsValid === false) {
            bError = true;
            fnAppendError("Room does not exist!");
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = bIsValid;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    },
    
    /**
     * Checks a given Thing ID to see if it's valid. Three things it checks for
     * are whether it's defined, if so, then checks whether it's a valid number,
     * and checks that the corresponding Thing is found in IomyRe.common.ThingList.
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
            $.each(IomyRe.common.ThingList, function (sThingID, oThing) {

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
            fnAppendError("Thing not found!");
        }
        
        //--------------------------------------------------------------------//
        // Prepare the results map
        //--------------------------------------------------------------------//
        mResults.bIsValid       = bIsValid;
        mResults.aErrorMessages = aErrorMessages;
        
        return mResults;
    },
    
    validateEditIPWebCamForm : function (mData) {
        var self            = this;
        var bError          = false;
        var aErrorMessages  = [];
        
        var fnAppendError = function (sErrorMessages) {
            bError = true;
            aErrorMessages.push(sErrorMessages);
        };
        
        //-- Protocol (e.g. http) --//
        if (mData.Protocol === undefined || mData.Protocol === null ||
            mData.Protocol === "")
        {
            fnAppendError("URL protocol is required.");
        }
        
        //-- IP Address --//
        var mInfo = self.isIPv4AddressValid(mData.IPAddress);

        if (!mInfo.bValid) {
            bError = true;
            aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
        }
        
        //-- IP Port --//
        mInfo = self.isIPv4PortValid(mData.IPPort);

        if (!mInfo.bValid) {
            bError = true;
            aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
        }

        //-- Stream Path --//
        if (mData.Path === undefined || mData.Path === null ||
            mData.Path === "")
        {
            fnAppendError("Stream path is required.");
        }
        
        return {
            bIsValid : !bError,
            aErrorMessages : aErrorMessages
        };
    },
    
    validateNewDeviceData : function (sDeviceType, mData) {
        var self            = this;
        var bError          = false;
        var aErrorMessages  = [];
        
        var sDisplayNameMissing = "Display name is required.";
        
        var fnAppendError = function (sErrorMessages) {
            bError = true;
            aErrorMessages.push(sErrorMessages);
        };
        
        // An anonymous function to check the Display name.
        var fnCheckDisplayName = function () {
            if (mData.DisplayName === undefined || mData.DisplayName === null ||
                mData.DisplayName === "")
            {
                fnAppendError(sDisplayNameMissing);
            }
        };
        
        // An anonymous function to check the IP Address.
        var fnCheckIPAddress = function () {
            var mInfo = self.isIPv4AddressValid(mData.IPAddress);

            if (!mInfo.bValid) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
            }
        };
        
        // An anonymous function to check the IP Port.
        var fnCheckIPPort = function () {
            var mInfo = self.isIPv4PortValid(mData.IPPort);

            if (!mInfo.bValid) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
            }
        };
        
        switch (sDeviceType) {
            // Onvif Camera Device
            case "linkType"+IomyRe.devices.onvif.LinkTypeId :
                fnCheckDisplayName();
                fnCheckIPAddress();
                fnCheckIPPort();
                
                break;
            
            // Philips Hue Bridge
            case "linkType"+IomyRe.devices.philipshue.LinkTypeId :
                fnCheckDisplayName();
                fnCheckIPAddress();
                fnCheckIPPort();
                
                if (mData.DeviceToken === undefined || mData.DeviceToken === null ||
                    mData.DeviceToken === "")
                {
                    fnAppendError("Device token is required");
                }
                
                break;
            
            // Open Weather Map
            case "linkType"+IomyRe.devices.weatherfeed.LinkTypeId :
                fnCheckDisplayName();
                
                if (mData.StationCode === undefined || mData.StationCode === null ||
                    mData.StationCode === "")
                {
                    fnAppendError("Station code is required");
                }
                
                if (mData.KeyCode === undefined || mData.KeyCode === null ||
                    mData.KeyCode === "")
                {
                    fnAppendError("Key code is required");
                }
                
                break;
            
            // IP Webcam Stream
            case "linkType"+IomyRe.devices.ipcamera.LinkTypeId :
                fnCheckIPAddress();
                fnCheckIPPort();
                
                if (mData.LinkName === undefined || mData.LinkName === null ||
                    mData.LinkName === "")
                {
                    fnAppendError("Device name is required.");
                }
                
                if (mData.DisplayName === undefined || mData.DisplayName === null ||
                mData.DisplayName === "")
                {
                    fnAppendError("Stream name is required.");
                }
                
                if (mData.Protocol === undefined || mData.Protocol === null ||
                    mData.Protocol === "")
                {
                    fnAppendError("URL protocol is required.");
                }
                
                if (mData.Path === undefined || mData.Path === null ||
                    mData.Path === "")
                {
                    fnAppendError("Stream path is required.");
                }
                
                break;
                
            // Onvif Stream
            case "thingType"+IomyRe.devices.onvif.ThingTypeId :
                if (mData.CameraName === undefined || mData.CameraName === null ||
                    mData.CameraName === "")
                {
                    fnAppendError("Stream name is required.");
                }
                
                break;
                
            default :
                throw new IllegalArgumentException("Invalid device type");
        }
        
        return {
            bIsValid : !bError,
            aErrorMessages : aErrorMessages
        };
    }
    
});