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
        if (this.PremiseList["_"+iPremiseId] !== undefined) {
			oPremise = this.PremiseList["_"+iPremiseId];
		}
        
        if (oPremise === null) {
            throw new PremiseNotFoundException();
        }
        
        return oPremise;
    },
	
	/**
     * Fetches a hub from IOMy.common.HubList
     * 
     * @param {type} iHubId				ID of the hub to retrieve from memory
     * @returns {Object}                The hub object
     * 
     * @throws HubNotFoundException
     */
    getHub : function (iHubId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var oHub = null;
        
        //--------------------------------------------------------------------//
        // Get hub and return it
        //--------------------------------------------------------------------//
		if (this.HubList["_"+iHubId] !== undefined) {
			oHub = this.HubList["_"+iHubId];
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
        // Get link and return it
        //--------------------------------------------------------------------//
        if (this.LinkList["_"+iLinkId] !== undefined) {
			oLink = this.LinkList["_"+iLinkId];
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
	},
    
    //------------------------------------------------------------------------//
    // Advanced Getters
    //------------------------------------------------------------------------//
    
    getFirstTimezoneOfRegion : function (iRegion) {
        var aaTimezones     = this.getTimezonesOfRegion(iRegion);
        var mFirstTimezone;
        
        $.each(aaTimezones, function (sI, mTimezone) {
            mFirstTimezone = mTimezone;
            return false; // Terminate the loop.
        });
        
        return mFirstTimezone;
    },
    
    getTimezonesOfRegion : function (iRegion) {
        var sRegionCode     = null;
        var aaTimezones     = {};
        
        if (iRegion !== undefined && iRegion !== null) {
            if (isNaN(iRegion)) {
                throw new IllegalArgumentException("Invalid Region ID: It contains non-numerical characters.");
            }
        } else {
            throw new MissingArgumentException("Region ID must be specified");
        }
        
        sRegionCode = this.Regions["_"+iRegion].RegionAbbreviation;
        
        $.each(this.Timezones, function (sI, mTimezone) {
            
            if (sRegionCode === mTimezone.TimezoneRegionCode) {
                aaTimezones["_"+mTimezone.TimezoneId] = mTimezone;
            }
            
        });
        
        return aaTimezones;
    }
    
});