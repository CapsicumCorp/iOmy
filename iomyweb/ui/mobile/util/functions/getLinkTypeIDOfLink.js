/*
Title: Get Link Type of a Link
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Gets the link type ID from a given link.
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

$.sap.declare("IOMy.functions.getLinkTypeIDOfLink",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Gets the link type ID from a given link.
     * 
     * @param {type} iLinkId    Given Link ID
     * @returns                 Link Type ID or NULL
     */
    getLinkTypeIDOfLink : function (iLinkId) {
        var iLinkTypeId = null;
        var oLink;
        
        for (var i = 0; i < IOMy.common.LinkList.length; i++) {
            oLink = IOMy.common.LinkList[i];
            if (oLink.LinkId == iLinkId) {
                iLinkTypeId = oLink.LinkTypeId;
                break;
            }
        }
        
        return iLinkTypeId;
    }
    
});