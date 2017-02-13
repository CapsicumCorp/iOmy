/*
Title: Destroy Items with IDs
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Destroys elements specified using an array of element IDs.
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

$.sap.declare("IOMy.functions.destroyItemsById",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
	 * Takes a list of IDs and destroys the objects with one of those IDs if it exists.
	 * Used for elements with IDs that are registered globally (sap.ui.getCore().byId() to
	 * access). DEPRECATED! New views and controllers will do the purging of old instances
     * of widgets with IDs.
	 * 
	 * @param aIds		List of IDs to look for
	 */
	destroyItemsById : function (aIds) {
		for (var i = 0; i < aIds.length; i++) {
			if (sap.ui.getCore().byId(aIds[i]) !== undefined) {
				sap.ui.getCore().byId(aIds[i]).destroy();
			}
		}
	}
    
});