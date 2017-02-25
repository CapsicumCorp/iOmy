/*
Title: Gender Select Box
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a select box for specifying the gender of a user
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

$.sap.declare("IOMy.widgets.getGenderSelectBox",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates a select box that allows the user to choose or omit a gender.
     * 
     * @param {type} sID            Widget ID (Optional)
     * @returns {sap.m.Select}
     */
    getGenderSelectBox : function (sID) {
        //---------------------------------------------------//
        // Prepare the data for Select box
        //---------------------------------------------------//
        
        // Declare items array
        var aItems = [];
        
        // An array of gender maps
        var aGender = [
            { ID : 1, Name : "Female"},
            { ID : 2, Name : "Male"},
            { ID : 3, Name : "Other/Unassigned"}
        ];
        
        // Populate the items array.
        for (var i = 0; i < aGender.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    key : aGender[i].ID,
                    text : aGender[i].Name
                })
            );
        }
        
        //---------------------------------------------------//
        // Construct the Select box
        //---------------------------------------------------//
        var oSBox;
        var mSettings = {
            width : "100%",
            items : aItems
        };
        
        // Widget ID is optional
        if (sID !== undefined) {
            oSBox = new sap.m.Select(sID, mSettings);
        } else {
            oSBox = new sap.m.Select(mSettings);
        }
        
        // Ensure that the first item is selected.
        oSBox.setSelectedItem(0);
        
        return oSBox;
    }
});