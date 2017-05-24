/*
Title: Room Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of rooms.
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

$.sap.declare("IOMy.widgets.getRoomSelector",true);

$.extend(IOMy.widgets,{
    
    /**
     * Use getRoomOptions in conjunction to a select box instead for more control.
     * 
     * Returns a select box containing a list of rooms within a given premise. Can also
     * receive the ID of the room that is currently selected if changing from one room
     * to another.
     * 
     * @param {string} sId          ID for the select box.
     * @param {string} sPremiseId   ID of the given premise.
     * @param {Number} iRoomId      (optional) ID of the room currently set.
     * @returns {sap.m.Select}      Select box with the rooms in a given premise.
     */
    getRoomSelector : function (sId, sPremiseId, iRoomId) {
        try {
            //====================================================================//
            // Declare Variables                                                  //
            //====================================================================//
            var iRoomsCounted = 0;
			var bHasUnassignedRoom = false;

            //====================================================================//
            // Create the Select Box                                              //
            //====================================================================//
            if (IOMy.common.RoomsList[sPremiseId] !== undefined) {
                var oSBox = new sap.m.Select(sId,{
                    "width" : "100%"
                }).addStyleClass("width100Percent");
                
                $.each(IOMy.common.RoomsList[sPremiseId],function(sIndex,aRoom) {
                    //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
                    if( sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null)
					{
						if (aRoom.RoomId === 1 && aRoom.RoomName === "Unassigned") {
							bHasUnassignedRoom = true;
							
						} else {
							oSBox.addItem(
								new sap.ui.core.Item({
									"text" : aRoom.RoomName,
									"key" : aRoom.RoomId
								})
							);
						
							iRoomsCounted++;
						}	
                    }
                });
                
                if (iRoomsCounted > 0) {
                    if (iRoomId !== undefined && iRoomId !== null) {
                        oSBox.setSelectedKey(iRoomId);
                    } else {
                        oSBox.setSelectedKey(null);
                    }
                    
                    return oSBox;
                } else {
					if (bHasUnassignedRoom) {
						oSBox.setVisible(false);
					} else {
						throw new NoRoomsFoundException();
					}
                }
                
            } else {
                throw new NoRoomsFoundException();
            }

        } catch (e) {
			e.message = "Error in IOMy.widgets.getRoomSelector(): "+e.message;
            throw e;
        }
    }
    
});