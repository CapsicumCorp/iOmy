/*
Title: Room Types Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of links.
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

$.sap.declare("IOMy.widgets.roomTypesSelectBox",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a combo box containing a list of room types. Can also accept a 
     * room type ID to immediately set that particular room type as the current
     * room type.
     * 
     * @param {string} sId          ID for the combo box.
     * @param {string} iRoomTypeId  ID of a room type.
     * @returns {mixed}             Either the combo box filled with links or a text widget with an error message.
     */
    roomTypesSelectBox : function (sId, iRoomTypeId) {
        var oElement;
        
        try {
            //====================================================================//
            // Clean up                                                           //
            //====================================================================//
            if (sap.ui.getCore().byId(sId) !== undefined) {
                sap.ui.getCore().byId(sId).destroy();
            }

            //====================================================================//
            // Create the Combo Box                                               //
            //====================================================================//
            var oSBox = new sap.m.Select(sId,{
                width : "100%"
            });

            for (var i = 0; i < IOMy.common.RoomTypes.length; i++) {
                oSBox.addItem(
                    new sap.ui.core.Item({
                        text : IOMy.common.RoomTypes[i].RoomTypeName,
                        key : IOMy.common.RoomTypes[i].RoomTypeId
                    })
                );
            }

            if (iRoomTypeId !== undefined && iRoomTypeId !== null) {
                oSBox.setSelectedKey(iRoomTypeId);
            } else {
                oSBox.setSelectedKey(null);
            }

            oElement = oSBox;
            
        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getLinkSelector(): "+e.message);
            IOMy.common.showError("Failed to load the link combo box\n\n"+e.message, "Error");
            oElement = new sap.m.Text(sId, {text : "Failed to load the link combo box."});
            
        } finally {
            
            return oElement; // Either a combo box or an error message.
        }
    }
    
});