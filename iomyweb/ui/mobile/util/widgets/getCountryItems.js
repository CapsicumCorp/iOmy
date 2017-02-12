/*
Title: UI Options for Countries Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Returns a list of countries to populate select and combo boxes.
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

$.sap.declare("IOMy.widgets.getCountryItems",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates an array of items containing the countries of the world. These
     * items can be used to populate select boxes (sap.m.Select) or combo boxes
     * (sap.m.ComboBox).
     * 
     * @returns {Array}
     */
    getCountryItems : function () {
        // Declare and fetch variables
        var aCountries = IOMy.common.Countries;
        var aItems = [];
        
        // Make the list of select box items
        for (var i = 0; i < aCountries.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    text : aCountries[i].CountryName,
                    key : aCountries[i].CountryId
                })
            );
        }
        
        return aItems;
    },
    
});