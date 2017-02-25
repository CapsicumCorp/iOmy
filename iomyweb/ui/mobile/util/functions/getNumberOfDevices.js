/*
Title: Get Number of Devices
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Retrieve the number of devices the current user has access to.
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

$.sap.declare("IOMy.functions.getNumberOfDevices",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Retrieve the number of devices the current user has access to.
     * 
     * @returns {Number}    Number of devices.
     */
	getNumberOfDevices : function () {
		var iNum = 0;
		$.each(IOMy.common.ThingList, function () {
			iNum++;
		});
		return iNum;
	}
    
});