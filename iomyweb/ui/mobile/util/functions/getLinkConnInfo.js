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
		
        $.each(IOMy.common.LinkList, function (sI, mLink) {
			if (mLink.LinkId == iLinkId) {
                // Collect the Link Conn information from memory.
                mLinkConnInfo.LinkConnId = mLink.LinkConnId;
                mLinkConnInfo.LinkConnName = mLink.LinkConnName;
                mLinkConnInfo.LinkConnAddress = mLink.LinkConnAddress;
                mLinkConnInfo.LinkConnUsername = mLink.LinkConnUsername;
                mLinkConnInfo.LinkConnPassword = mLink.LinkConnPassword;
                mLinkConnInfo.LinkConnPort = mLink.LinkConnPort;
            }
		});
        
        return mLinkConnInfo;
    }
    
});