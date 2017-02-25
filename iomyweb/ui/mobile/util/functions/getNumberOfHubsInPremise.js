/*
Title: Get Number of Hub in a Premise
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Retrieves the number of hubs visible to the user in a given premise.
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

$.sap.declare("IOMy.functions.getNumberOfHubsInPremise",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Retrieves the number of hubs visible to the user in a given premise.
     * 
     * @param {type} iPremiseId     ID of the premise.
     * @returns {Number}            Number of hubs in a given premise.
     */
    getNumberOfHubsInPremise : function (iPremiseId) {
		var iNum = 0;
		$.each(IOMy.common.HubList, function (sIndex, aHub) {
            if (aHub.PremiseId == iPremiseId) {
                iNum++;
            }
		});
		return iNum;
	}
    
});