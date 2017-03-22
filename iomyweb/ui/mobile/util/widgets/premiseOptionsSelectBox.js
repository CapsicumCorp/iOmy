/*
Title: Locale Select Boxes
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates functions that generate select boxes filled with options
    for a particular premise.
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

$.sap.declare("IOMy.widgets.premiseOptionsSelectBox",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates a select box filled with options for the number of bedrooms.
     * 
     * @returns {sap.m.Select}          Select box.
     */
    selectBoxPremiseBedroomCount : function (sID) {
        //--------------------------------------------------------------------//
        // Initialise variables
        //--------------------------------------------------------------------//
        var me          = this;
        var aOptions    = IOMy.common.PremiseBedroomsOptions;
        var aItems      = [];
        var mSettings;
        var wSBox;
        
        //--------------------------------------------------------------------//
        // Create options
        //--------------------------------------------------------------------//
        for (var i = 0; i < aOptions.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    key     : aOptions[i].BedroomCountId,
                    text    : aOptions[i].BedroomCount,
                })
            );
        }
        
        mSettings = {
            width : "100%",
            items : aItems
        };
        
        //--------------------------------------------------------------------//
        // Create the widget
        //--------------------------------------------------------------------//
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with options for the number of floors.
     * 
     * @returns {sap.m.Select}          Select box.
     */
    selectBoxPremiseFloorCount : function (sID) {
        //--------------------------------------------------------------------//
        // Initialise variables
        //--------------------------------------------------------------------//
        var me          = this;
        var aOptions    = IOMy.common.PremiseFloorsOptions;
        var aItems      = [];
        var mSettings;
        var wSBox;
        
        //--------------------------------------------------------------------//
        // Create options
        //--------------------------------------------------------------------//
        for (var i = 0; i < aOptions.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    key     : aOptions[i].FloorCountId,
                    text    : aOptions[i].FloorCount,
                })
            );
        }
        
        mSettings = {
            width : "100%",
            items : aItems
        };
        
        //--------------------------------------------------------------------//
        // Create the widget
        //--------------------------------------------------------------------//
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with options for the number of occupants.
     * 
     * @returns {sap.m.Select}          Select box.
     */
    selectBoxPremiseOccupantCount : function (sID) {
        //--------------------------------------------------------------------//
        // Initialise variables
        //--------------------------------------------------------------------//
        var me          = this;
        var aOptions    = IOMy.common.PremiseOccupantsOptions;
        var aItems      = [];
        var mSettings;
        var wSBox;
        
        //--------------------------------------------------------------------//
        // Create options
        //--------------------------------------------------------------------//
        for (var i = 0; i < aOptions.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    key     : aOptions[i].OccupantCountId,
                    text    : aOptions[i].OccupantCount,
                })
            );
        }
        
        mSettings = {
            width : "100%",
            items : aItems
        };
        
        //--------------------------------------------------------------------//
        // Create the widget
        //--------------------------------------------------------------------//
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with options for the number of room.
     * 
     * @returns {sap.m.Select}          Select box.
     */
    selectBoxPremiseRoomCount : function (sID) {
        //--------------------------------------------------------------------//
        // Initialise variables
        //--------------------------------------------------------------------//
        var me          = this;
        var aOptions    = IOMy.common.PremiseRoomsOptions;
        var aItems      = [];
        var mSettings;
        var wSBox;
        
        //--------------------------------------------------------------------//
        // Create options
        //--------------------------------------------------------------------//
        for (var i = 0; i < aOptions.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    key     : aOptions[i].RoomCountId,
                    text    : aOptions[i].RoomCount,
                })
            );
        }
        
        mSettings = {
            width : "100%",
            items : aItems
        };
        
        //--------------------------------------------------------------------//
        // Create the widget
        //--------------------------------------------------------------------//
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    }
    
});