/*
Title: Get Current Username
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Fetches the current user's username and stores it in memory.
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

$.sap.declare("IOMy.functions.getCurrentUsername",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Procedure that fetches the current user's username and stores it in the
     * IOMy.common global object.
     * 
     * Calls IOMy.functions.reportSessionTerminated() if unsuccessful.
     * 
     * @param {function} fnCallback        Function to run if successful (OPTIONAL).
     */
    getCurrentUsername : function (fnCallback) {
        //------------------------------------------------//
        // Assign default values to arguments
        //------------------------------------------------//
        if (fnCallback === undefined) {
            fnCallback = function () {};
        }
        
        
        //------------------------------------------------//
        // Capture scope of IOMy.functions
        //------------------------------------------------//
        var me = this;
        
        //------------------------------------------------//
        // Fetch the user's username if possible.
        //------------------------------------------------//
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("users"),
            Columns : ["USERS_USERNAME"],
            WhereClause : [],
            OrderByClause : [],
            Limit : 0,
            
            onSuccess : function (response, data) {
                IOMy.common.CurrentUsername = data[0].USERS_USERNAME;
                fnCallback();
            },
            
            onFail : function (response) {
                // Calls a function defined in the same module elsewhere.
                me.reportSessionTerminated(response.message);
            }
        });
    }
    
});