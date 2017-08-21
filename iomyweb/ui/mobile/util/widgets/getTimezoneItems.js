/*
Title: Timezone UI5 Items
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Create an array of UI5 Items that contain timezones.
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

$.sap.declare("IOMy.widgets.getTimezoneItems",true);

$.extend(IOMy.widgets,{
    
    /**
     * Create an array of UI5 Items that contain timezones.
     * 
     * @returns {Array}             Timezones in an array of sap.ui.core.Item objects
     */
    getTimezoneItems : function () {
        // Declare and fetch variables
        var aTimezones = IOMy.common.Timezones;
        var aItems = [];
        
        // Make the list of select box items
        $.each(aTimezones, function (sI, mTimezone) {
			aItems.push(
                new sap.ui.core.Item({
                    text : mTimezone.TimezoneName,
                    key : mTimezone.TimezoneId
                })
            );
		});
        
        return aItems;
    }
    
});