/*
Title: Thing Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box containing a list of things.
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

$.sap.declare("IOMy.widgets.thingsSelectBox",true);

$.extend(IOMy.widgets,{
    
    /**
     * Returns a select box containing a list of items or devices.
     * 
     * @param {string} sId          ID for the select box.
     * @param {Number} iThingId     (optional) ID of the item to set as selected.
     * @returns {sap.m.Select}      Select box with the items/devices.
     */
    thingsSelectBox : function (sId, iThingId) {
        try {
            //====================================================================//
            // Declare Variables                                                  //
            //====================================================================//
            var oSBox;

            //====================================================================//
            // Create the Select Box                                              //
            //====================================================================//
            oSBox = new sap.m.Select(sId,{
                width : "100%"
            });
                
            $.each(IOMy.common.ThingList,function(sIndex,mThing) {
                //-- Verify that the Thing is valid --//
                if( sIndex!==undefined && sIndex!==null && mThing!==undefined && mThing!==null ) {
                    oSBox.addItem(
                        new sap.ui.core.Item({
                            text : mThing.DisplayName,
                            key : mThing.Id
                        })
                    );
                }
            });
            
            if (iThingId !== null || iThingId !== undefined) {
                oSBox.setSelectedItem(iThingId);
            } else {
                oSBox.setSelectedItem(null);
            }
            
            return oSBox;

        } catch (e) {
            jQuery.sap.log.error("Error in IOMy.widgets.getRoomSelector(): "+e.message);
            return new sap.m.Text(sId, {text : "Failed to load the room select box."});
        }
    }
    
});