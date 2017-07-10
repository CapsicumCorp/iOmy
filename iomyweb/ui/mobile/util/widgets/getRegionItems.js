/*
Title: UI Options for Regions Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Returns a list of regions to populate select and combo boxes.
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

$.sap.declare("IOMy.widgets.getRegionItems",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates an array of items containing a list of regions in the world. These
     * items can be used to populate select boxes (sap.m.Select) or combo boxes
     * (sap.m.ComboBox).
     * 
     * @returns {Array}
     */
    getRegionItems : function () {
        // Declare and fetch variables
        var aRegions = IOMy.common.Regions;
        var aItems = [];
        
        // Make the list of select box items
		$.each(aRegions, function (sI, mRegion) {
			aItems.push(
                new sap.ui.core.Item({
                    text : mRegion.RegionName,
                    key : mRegion.RegionId
                })
            );
		});
        
        return aItems;
    },
    
});