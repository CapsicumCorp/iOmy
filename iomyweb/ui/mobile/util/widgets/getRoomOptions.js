/*
Title: Room Options
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Create a list of UI5 Items containing rooms.
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

$.sap.declare("IOMy.widgets.getRoomOptions",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a list of all the rooms within a given premise. If there are no
     * rooms created in a given premise, then an empty array will be returned.
     * The array contains items for a select box (sap.ui.core.Item)
     * 
     * @param {type} sPremiseId         ID of the premise that the rooms are located in
     * @returns {Array}                 An array containing either rooms for a select box, or nothing.
     */
    getRoomOptions : function (sPremiseId) {
        var aOptions = [];
        
        if (IOMy.common.RoomsList[sPremiseId] !== undefined) {
            $.each(IOMy.common.RoomsList[sPremiseId],function(sIndex,aRoom) {
                //-- Verify that the Premise has rooms, other than the pseudo-room Unassigned --//
                if( sIndex !== "Unassigned" && sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null ) {
                    aOptions.push(
                        new sap.ui.core.Item({
                            text : aRoom.RoomName,
                            key : aRoom.RoomId
                        })
                    );
                }
            });
        }
        
        return aOptions;
    }
    
});