/*
Title: Get Conn Info From a Link
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Gathers the Conn information from a given link.
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

$.sap.declare("IOMy.functions.getLinkConnInfo",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Gathers the Conn information from a given link.
     * 
     * @param {type} iLinkId        ID of the link to retrieve the information from
     * @returns {map}               Link Conn Information
     */
    getLinkConnInfo : function (iLinkId) {
        var mLinkConnInfo = {};
        var oLink;
        
        for (var i = 0; i < IOMy.common.LinkList.length; i++) {
            oLink = IOMy.common.LinkList[i];
            if (oLink.LinkId == iLinkId) {
                // Collect the Link Conn information from memory.
                mLinkConnInfo.LinkConnId = oLink.LinkConnId;
                mLinkConnInfo.LinkConnName = oLink.LinkConnName;
                mLinkConnInfo.LinkConnAddress = oLink.LinkConnAddress;
                mLinkConnInfo.LinkConnUsername = oLink.LinkConnUsername;
                mLinkConnInfo.LinkConnPassword = oLink.LinkConnPassword;
                mLinkConnInfo.LinkConnPort = oLink.LinkConnPort;
                
                break;
            }
        }
        
        return mLinkConnInfo;
    }
    
});