/*
Title: Get Premise ID From Hub
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Retrieves the premise ID of a given hub.
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

$.sap.declare("IOMy.functions.getPremiseIDFromHub",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Retrieves the premise ID of a given hub.
     * 
     * @param {type} iHubId         ID of the hub to inspect
     * @returns                     The premise ID or -1 if the hub couldn't be found
     */
    getPremiseIDFromHub : function (iHubId) {
        var iPremiseId = -1;
        var aHubList = IOMy.common.HubList;
        
        $.each(aHubList, function (sI, mHub) {
			// If the target hub is found, then grab its Premise ID.
            if (mHub.HubId == iHubId) {
                iPremiseId = mHub.PremiseId;
            }
		});
        
        return iPremiseId;
    }
    
});