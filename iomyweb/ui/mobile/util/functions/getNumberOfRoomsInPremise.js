/*
Title: Get Number of Rooms In a Premise
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Retrieve the number of rooms the current user has access to in a
    given premise.
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

$.sap.declare("IOMy.functions.getNumberOfRoomsInPremise",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Retrieve the number of rooms the current user has access to in a given
     * premise.
     * 
     * @param {type} iPremiseId     ID of the premise.
     * @returns {Number}            Number of rooms in a given premise.
     */
    getNumberOfRoomsInPremise : function (iPremiseId) {
		var iNum = 0;
		$.each(IOMy.common.RoomsList, function (sIndex, aPremise) {
            if (sIndex !== null && sIndex !== undefined && aPremise !== null && aPremise !== undefined) {
                $.each(aPremise, function (sJndex, aRoom) {
                    if (aRoom.RoomId !== 1 && aRoom.RoomName !== "Unassigned" && sJndex !== null && sJndex !== undefined && aRoom !== null && aRoom !== undefined) {
                        if (aRoom.PremiseId == iPremiseId) {
                            iNum++;
                        }
                    }
                });
            }
		});
		return iNum;
	}
    
});