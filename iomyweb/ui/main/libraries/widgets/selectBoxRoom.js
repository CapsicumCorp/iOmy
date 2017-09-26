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

$.sap.declare("IomyRe.widgets.getRoomSelector",true);

$.extend(IomyRe.widgets,{
    
    /**
     * Returns a select box containing a list of rooms within a given premise. Can also
     * receive the ID of the room that is currently selected if changing from one room
     * to another.
     * 
     * @param {object} mSettings        Parameters
     * @returns {sap.m.Select}          Select box with the rooms in a given premise.
     * @throws NoRoomsFoundException    
     */
    selectBoxRoom : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var aItems              = [];
        var aFirstItem          = [];
        var sId;
        var sPremiseId;
        var iRoomId;
        var bIncludeUnassigned;
        var bAddAllRoomOption;
        var oSBox;
        
        if (mSettings !== undefined) {
            
            if (mSettings.premiseID === undefined || mSettings.premiseID === null) {
                
                //--------------------------------------------------------------------//
                // Fetch the premise ID.
                // 
                // NOTE: This currently selects the first premise in the list, which is
                // normally the only one in the list. When we start adding support for
                // multiple premises, this code will need to be redone.
                //--------------------------------------------------------------------//
                $.each(IomyRe.common.PremiseList, function (sI, mPremise) {
                    sPremiseId = sI;
                    return false;
                });
                
            } else {
                sPremiseId = mSettings.premiseID;
                
                if (isNaN(sPremiseId)) {
                    if (sPremiseId.charAt(0) !== '_') {
                        bError = true;
                        aErrorMessages = "Premise ID is not in a valid format.";
                    }
                } else {
                    sPremiseId = "_" + sPremiseId;
                }
            }
            
            if (mSettings.id === undefined || mSettings.id === null) {
                sId = null;
            } else {
                sId = mSettings.id;
            }
            
            if (mSettings.roomID === undefined || mSettings.roomID === null) {
                iRoomId = null;
            } else {
                iRoomId = mSettings.roomID;
            }
            
            if (mSettings.showUnassigned === undefined || mSettings.showUnassigned === null) {
                bIncludeUnassigned = false;
            } else {
                bIncludeUnassigned = mSettings.showUnassigned;
            }
            
            if (mSettings.showAllRoomOption === undefined || mSettings.showAllRoomOption === null) {
                bAddAllRoomOption = false;
            } else {
                bAddAllRoomOption = mSettings.showAllRoomOption;
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
        } else {
            //--------------------------------------------------------------------//
            // Fetch the premise ID.
            // 
            // NOTE: This currently selects the first premise in the list, which is
            // normally the only one in the list. When we start adding support for
            // multiple premises, this code will need to be redone.
            //--------------------------------------------------------------------//
            $.each(IomyRe.common.PremiseList, function (sI, mPremise) {
                sPremiseId = sI;
                return false;
            });
            
            iRoomId = null;
            bIncludeUnassigned = false;
            bAddAllRoomOption = false;
        }
        
        try {
            //====================================================================//
            // Declare Variables                                                  //
            //====================================================================//
            var iRoomsCounted = 0;
            var bHasUnassignedRoom = false;
            
            if (bIncludeUnassigned === undefined || bIncludeUnassigned === null) {
                bIncludeUnassigned = false;
            }

            //====================================================================//
            // Create the Select Box                                              //
            //====================================================================//
            if (sap.ui.getCore().byId(sId) !== undefined) {
                sap.ui.getCore().byId(sId).destroy();
            }
            
            if (IomyRe.common.RoomsList[sPremiseId] !== undefined) {
                
                if (bAddAllRoomOption) {
                    aFirstItem.push(
                        new sap.ui.core.Item({
                            "text" : "All Rooms",
                            "key" : 0
                        })
                    );
                }
                
                $.each(IomyRe.common.RoomsList[sPremiseId],function(sIndex,aRoom) {
                    //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
                    if( sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null)
                    {
                        if (aRoom.RoomId === 1 && aRoom.RoomName === "Unassigned" && !bIncludeUnassigned) {
                            bHasUnassignedRoom = true;
                            
                        } else {
                            aItems.push(
                                new sap.ui.core.Item({
                                    "text" : aRoom.RoomName,
                                    "key" : aRoom.RoomId
                                })
                            );
                        
                            iRoomsCounted++;
                        }
                    }
                });
                
                aItems = aFirstItem.concat(aItems);
                
                if (sId !== null) {
                    oSBox = new sap.m.Select(sId,{
                        "items" : aItems
                    }).addStyleClass("width100Percent");

                } else {
                    oSBox = new sap.m.Select({
                        "items" : aItems
                    }).addStyleClass("width100Percent");
                }
                
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
            e.message = "Error in IomyRe.widgets.getRoomSelector(): "+e.message;
            throw e;
        }
    }
    
});