/*
Title: Validate IP Address and Port
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Validates user input of an IP address and port number.
Copyright: Capsicum Corporation 2016, 2017

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

$.sap.declare("IOMy.functions.ValidateIPAddress",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Validates the IP address and port to see if the input is valid.
     * 
     * @param {map} mSettings       Map of parameters
     * @returns {map}               Validation results
     */
    ValidateIPAddress : function (mSettings) {
        //-----------------------------------------------------//
        // Check the required fields
        //-----------------------------------------------------//
        var sUndefinedErrors = "";
        if (mSettings !== undefined) {
            // Does 'scope' exist?
            if (mSettings.scope === undefined) {
                sUndefinedErrors += "'scope' is undefined.";
            }
            
            // Does 'ipAddressFieldId' exist?
            if (mSettings.ipAddressFieldId === undefined) {
                if (sUndefinedErrors.length > 0) {
                    sUndefinedErrors += '\n';
                }
                sUndefinedErrors += "'ipAddressFieldId' is undefined";
            }
            
            // Does 'ipPortFieldId' exist?
            if (mSettings.ipPortFieldId === undefined) {
                if (sUndefinedErrors.length > 0) {
                    sUndefinedErrors += '\n';
                }
                sUndefinedErrors += "'ipPortFieldId' is undefined";
            }
            
            // If one or more fields were not found, throw the error messages
            if (sUndefinedErrors.length === 0) {
                throw sUndefinedErrors;
            }
        } else {
            throw "No settings were specified. Three settings are required: scope, ipAddressFieldId, and ipPortFieldId.";
        }
        
        var me                      = this;
        var bError                  = false;
        var bIPAddressFormatError   = false;
        var aErrorMessages          = [];
        var mInfo                   = {};
        // IP Address validation
        var aThreeDots;
        var aIPAddressParts;
        // Form data variables
        var sIPAddress              = me.byId("IPAddressField").getValue();
        var sIPPort                 = me.byId("IPPortField").getValue();
        
        //-------------------------------------------------\\
        // Is the IP address given?
        //-------------------------------------------------\\
        try {
            if (sIPAddress === "") {
                bError = true;// No
                aErrorMessages.push("IP address must be filled out");

            //-------------------------------------------------\\
            // If so, is it a valid IP address?
            //-------------------------------------------------\\
            } else {
                //-------------------------------------------------\\
                // Are there three dots in the IP Address?
                //-------------------------------------------------\\
                aThreeDots = sIPAddress.match(/\./g);

                if (aThreeDots === null || aThreeDots.length !== 3) {
                    bError = true; // No. FAIL!
                    aErrorMessages.push("IP address is not valid - there must be only 4 parts separated by dots ('.') in an IPv4 address");
                } else {
                    //-------------------------------------------------\\
                    // There are three dots. Are the four parts valid numbers?
                    //-------------------------------------------------\\
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

                        if (bIPAddressFormatError === true) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers contains invalid characters");
                            break;
                        } else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers is greater than 255 or a negative number");
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1003: There was an error checking the IP Address: "+e.message);
        }
        
        //-------------------------------------------------\\
        // Is the port given?
        //-------------------------------------------------\\
        try {
            if (sIPPort === "") {
                bError = true;
                aErrorMessages.push("IP port must be filled out");
            // Now, is the port a valid number...
            } else {
                for (var i = 0; i < sIPPort.length; i++) {
                    // Spaces, and the plus and minus symbols are ignored by isNaN(). isNaN() covers the rest.
                    if (sIPPort.charAt(i) === ' ' || sIPPort.charAt(i) === '-' ||
                        sIPPort.charAt(i) === '+' || isNaN(sIPPort.charAt(i)))
                    {
                        bError = true; // INVALID CHARACTER!
                        aErrorMessages.push("IP port not valid");
                        break;
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1004: There was an error checking the IP Port: "+e.message);
        }
        
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    }
    
});