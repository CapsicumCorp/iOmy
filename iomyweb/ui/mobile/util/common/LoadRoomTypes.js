/*
Title: Common functions and variables Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Function to insert properties and methods specific to a particular
    Thing. Part of the IOMy.common core module.
Copyright: Capsicum Corporation 2015, 2016, 2017

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

$.sap.declare("IOMy.common.LoadRoomTypes",true);

$.extend(IOMy.common,{
    
    bRoomTypesLoaded    : false,
    RoomTypes           : [],
    
    /**
     * 
     * @returns {undefined}
     */
    LoadRoomTypes : function () {
        var me = this;
        
        //--------------------------------------------------------------------//
        // Call the OData that returns a list of room types.
        //--------------------------------------------------------------------//
        IOMy.apiodata.AjaxRequest({
            Url : IOMy.apiodata.ODataLocation("room_types"),
            Columns : ["ROOMTYPE_PK", "ROOMTYPE_NAME", "ROOMTYPE_OUTDOORS"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                try {
                    //--------------------------------------------------------//
                    // Refresh the variable and reload the room type array.
                    //--------------------------------------------------------//
                    me.RoomTypes = [];
                    
                    for (var i = 0; i < data.length; i++) {
                        me.RoomTypes.push({
                            RoomTypeId : parseInt(data[i].ROOMTYPE_PK),
                            RoomTypeName : data[i].ROOMTYPE_NAME,
                            RoomTypeOutdoors : parseInt(data[i].ROOMTYPE_OUTDOORS)
                        });
                    }
                } catch (eLoadVariableError) {

                    jQuery.sap.log.error("Error gathering room types: "+JSON.stringify(eLoadVariableError.message));
                    me.bRoomTypesLoaded = false;
                    
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading room types OData: "+JSON.stringify(response));
            }
        });
    }
    
});