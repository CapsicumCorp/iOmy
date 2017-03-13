/*
Title: Common functions and variables Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Function to insert properties and methods specific to a particular
    Thing. Part of the IOMy.common core module.
Copyright: Capsicum Corporation 2015, 2016, 2017

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

$.sap.declare("IOMy.common.isCoreVariablesRefreshInProgress",true);

$.extend(IOMy.common,{
    
    CoreVariableRefreshStepsInProgress : [       // BOOLEAN ARRAY: 
        false,  // Step 1
        false,  // Step 2
        false,  // Step 3
        false,  // Step 4
        false,  // Step 5
        false,  // Step 6
        false,  // Step 7
    ],
    
    isCoreVariablesRefreshInProgress : function (iStep, fnFailCallback) {
        //--------------------------------------------------------------------//
        // Capture current scope and check the arguments.
        //--------------------------------------------------------------------//
        var me = this;
        var bError = false;
        var sErrorMessage = "";
        var iNumberOfSteps = me.CoreVariableRefreshStepsInProgress.length;
        
        //-- Check the step parameter. --//
        if (iStep === undefined) {
            bError = true;
            sErrorMessage = "Refresh Step (1 - " + iNumberOfSteps + ") not specified!";
        } else if (iStep < 1 || iStep > iNumberOfSteps) {
            bError = true;
            sErrorMessage = "Step must be between 1 - " + iNumberOfSteps + ") not specified!";
        }
        
        //-- There is an error, report it an throw the exception. --//
        if (bError) {
            jQuery.sap.log.error(sErrorMessage);
            throw sErrorMessage;
        }
        
        //-- Define an empty function if fnFailCallback is undefined. --//
        if (fnFailCallback === undefined) {
            fnFailCallback = function () {};
        }
        
        //--------------------------------------------------------------------//
        // Check whether a given step has its in progress flag set. Report it
        // if it has.
        //--------------------------------------------------------------------//
        if (IOMy.common.CoreVariableRefreshStepsInProgress[ (iStep - 1) ]===true) {
            //-- Error has occurred --//
            IOMy.common.showError( "Reloading of Core variables is already in progress! New attempt has been aborted.", "Core Variables");
            fnFailCallback();
            return true;
        } else {
            return false;
        }
    }
    
});