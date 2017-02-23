/*
Title: Report Terminated Session
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Function to report to the user that the current session has been
    terminated.
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

$.sap.declare("IOMy.functions.reportSessionTerminated",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Reports that the current session has been terminated via a popup dialog.
     * Reloads the page after the dialog is closed taking the user to the login
     * page.
     * 
     * Ideally used in conjunction with API calls.
     * 
     * @param {type} sMessage        Error message.
     */
    reportSessionTerminated : function (sMessage) {
        jQuery.sap.log.error("Loading User OData failed: "+sMessage);

        //------------------------------------------------------------//
        // Show the notice that the user must log back in.
        //------------------------------------------------------------//
        IOMy.common.showError("Failed to find user information. You must log back in to continue", "User Error",
            function () {
                window.location.reload(true); // TRUE forces a refresh from the server instead of the cache.
            }
        );
    }
    
});