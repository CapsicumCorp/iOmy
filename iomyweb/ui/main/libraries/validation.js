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
    },
    
    /**
	 * Checks an IPv4 address to see if it's in a valid format.
	 * 
	 * @param {type} sIPAddress				IP Address to validate.
	 * @returns {map}						The map containing result information including whether it's valid and any error message.
	 * 
	 * @throws MissingArgumentException		if the address is not given, of course.
	 */
	isIPv4AddressValid : function (sIPAddress) {
		//-------------------------------------------------//
		// Variables
		//-------------------------------------------------//
		var bError					= false;
		var aErrorMessages			= [];
		var aThreeDots				= [];
		var aIPAddressParts			= [];
		var bIPAddressFormatError	= false;
		var mResult					= {};
		
		//-------------------------------------------------//
		// Check that the IP address is given.
		//-------------------------------------------------//
		if (sIPAddress === null || sIPAddress === undefined || sIPAddress === false || sIPAddress.length === 0) {
			throw new MissingArgumentException("Where is the IPv4 address?");
		}
		
		//-------------------------------------------------//
		// Are there three dots in the IP Address?         //
		//-------------------------------------------------//
		aThreeDots = sIPAddress.match(/\./g);

		if (aThreeDots === null || aThreeDots.length !== 3) {
			bError = true; // No. FAIL!
			aErrorMessages.push("There must be only 4 parts separated by dots ('.') in an IPv4 address.");
		}
        
        //---------------------------------------------------------//
        // There are three dots. Are the four parts valid numbers? //
        //---------------------------------------------------------//
        aIPAddressParts = sIPAddress.split('.');

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
                aErrorMessages.push("One of the numbers start with '0'.");
            }

            if (bIPAddressFormatError === true) {
                bError = true;
                aErrorMessages.push("One of the numbers contains invalid characters.");
                break;
            } else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
                bError = true;
                aErrorMessages.push("One of the numbers is greater than 255 or a negative number.");
                break;
            }
        }
		
		//-------------------------------------------------//
		// Prepare the result map.
		//-------------------------------------------------//
		mResult.bValid			= !bError;
		mResult.aErrorMessages	= aErrorMessages;
		
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
		var bError					= false;
		var aErrorMessages			= [];
		var aInvalidChars			= [];
		var mResult					= {};
		
		//-------------------------------------------------//
		// Check that the IP address is given.
		//-------------------------------------------------//
		if (sIPPort === null || sIPPort === undefined || sIPPort === false || sIPPort.length === 0) {
			throw new MissingArgumentException("Where is the IPv4 port?");
		}
		
		//aDigits			= sIPPort.match(/[0-9]/g);
		aInvalidChars	= sIPPort.match(/[^0-9]/g);
		
		if (aInvalidChars !== null) {
			bError = true;
			aErrorMessages.push("The port contains invalid character(s).");
		}
		
		//-------------------------------------------------//
		// Prepare the result map.
		//-------------------------------------------------//
		mResult.bValid			= !bError;
		mResult.aErrorMessages	= aErrorMessages;
		
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
    }
    
});