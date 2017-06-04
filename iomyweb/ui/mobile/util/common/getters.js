/*
Title: Extension of Common Library (Getters for Core Variable Items)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes functions to retrive items from the core variables.
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

$.sap.declare("IOMy.common.getters",true);

$.extend(IOMy.common, {
    
    /**
     * Fetches a premise from IOMy.common.PremiseList
     * 
     * @param {type} iPremiseId         ID of the premise to retrieve from memory
     * @returns {Object}                The premise object
     * 
     * @throws PremiseNotFoundException
     */
    getPremise : function (iPremiseId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oPremise = null;
        
        //--------------------------------------------------------------------//
        // Get premise and return it
        //--------------------------------------------------------------------//
        for (var i = 0; i < this.PremiseList.length; i++) {
            // There is still an inconsistency with the data types of these two
            // IDs. They are the same value but not the same type. This is why
            // two equal signs are used to compare instead of the preferred three.
            if (this.PremiseList[i].Id == iPremiseId) {
                oPremise = this.PremiseList[i];
                break;
            }
        }
        
        if (oPremise === null) {
            throw new PremiseNotFoundException();
        }
        
        return oPremise;
    },
	
	/**
     * Fetches a hub from IOMy.common.HubList
     * 
     * @param {type} iHubId				ID of the premise to retrieve from memory
     * @returns {Object}                The premise object
     * 
     * @throws PremiseNotFoundException
     */
    getHub : function (iHubId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oHub = null;
        
        //--------------------------------------------------------------------//
        // Get hub and return it
        //--------------------------------------------------------------------//
        for (var i = 0; i < this.HubList.length; i++) {
            // There is still an inconsistency with the data types of these two
            // IDs. They are the same value but not the same type. This is why
            // two equal signs are used to compare instead of the preferred three.
            if (this.HubList[i].HubId == iHubId) {
                oHub = this.HubList[i];
                break;
            }
        }
        
        if (oHub === null) {
            throw new HubNotFoundException();
        }
        
        return oHub;
    },
    
    /**
     * Fetches a link from IOMy.common.LinkList
     * 
     * @param {type} iLinkId            ID of the link to retrieve from memory
     * @returns {Object}                The link object
     * 
     * @throws LinkNotFoundException
     */
    getLink : function (iLinkId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oLink = null;
        
        //--------------------------------------------------------------------//
        // Get premise and return it
        //--------------------------------------------------------------------//
        for (var i = 0; i < this.LinkList.length; i++) {
            // There is still an inconsistency with the data types of these two
            // IDs. They are the same value but not the same type. This is why
            // two equal signs are used to compare instead of the preferred three.
            if (this.LinkList[i].LinkId == iLinkId) {
                oLink = this.LinkList[i];
                break;
            }
        }
        
        if (oLink === null) {
            throw new LinkNotFoundException();
        }
        
        return oLink;
    },
	
	getRoom : function (iRoomId) {
		//--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oRoom = null;
		
		//--------------------------------------------------------------------//
        // Get room and return it
        //--------------------------------------------------------------------//
		$.each(this.RoomsList, function (sPremise, aaRoom) {
			$.each(aaRoom, function (sRoom, mRoom) {
				if (mRoom.RoomId == iRoomId) {
					oRoom = mRoom;
				}
			});
		});
		
		if (oRoom === null) {
            throw new RoomNotFoundException();
        }
		
		return oRoom;
	}
    
});