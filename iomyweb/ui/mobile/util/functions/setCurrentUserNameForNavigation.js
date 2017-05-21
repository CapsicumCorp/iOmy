/*
Title: Set User Name On Navigation Bar
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Writes the username on the navigation menu.
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

$.sap.declare("IOMy.functions.setCurrentUserNameForNavigation",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Procedure that retrieves and stores the user's display name and the user
	 * ID.
     */
    setCurrentUserNameForNavigation : function () {
        var me = this;
        
        IOMy.apiodata.AjaxRequest({
            Url             : IOMy.apiodata.ODataLocation("users"),
            Columns         : ["USERS_PK","USERSINFO_DISPLAYNAME"],
            WhereClause     : [],
            OrderByClause   : [],
            Limit           : 0,
            
            onSuccess : function (response, data) {
				IOMy.common.UserId			= data[0].USERS_PK;
                IOMy.common.UserDisplayName = data[0].USERSINFO_DISPLAYNAME;
            },
            
            onFail : function (response) {
                me.reportSessionTerminated(response.message);
            }
        });
    }
    
});