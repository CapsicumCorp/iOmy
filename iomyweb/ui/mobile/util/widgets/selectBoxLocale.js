/*
Title: Locale Select Boxes
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates functions that generate select boxes filled with locale
    options.
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

$.sap.declare("IOMy.widgets.selectBoxLocale",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates a select box filled with countries as options.
     * 
     * @returns {sap.m.Select}          Country select box.
     */
    selectBoxCountries : function (sID) {
        // Capture scope
        var me = this;
        
        var wSBox = new sap.m.Select(sID, {
            width : "100%",
            items : me.getCountryItems()
        });
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with languages as options.
     * 
     * @returns {sap.m.Select}          Country select box.
     */
    selectBoxLanguages : function (sID) {
        // Capture scope
        var me = this;
        
        var wSBox = new sap.m.Select(sID, {
            width : "100%",
            items : me.getLanguageItems()
        });
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with post code/zip codes as options.
     * 
     * @returns {sap.m.Select}          Country select box.
     */
    selectBoxPostCodes : function (sID) {
        // Capture scope
        var me = this;
        
        var wSBox = new sap.m.Select(sID, {
            width : "100%",
            items : me.getPostCodeItems()
        });
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with states/provinces as options.
     * 
     * @returns {sap.m.Select}          Country select box.
     */
    selectBoxStatesProvinces : function (sID) {
        // Capture scope
        var me = this;
        
        var wSBox = new sap.m.Select(sID, {
            width : "100%",
            items : me.getStateProvinceItems()
        });
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with timezones as options.
     * 
     * @returns {sap.m.Select}          Country select box.
     */
    selectBoxTimezones : function (sID) {
        // Capture scope
        var me = this;
        
        var wSBox = new sap.m.Select(sID, {
            width : "100%",
            items : me.getTimezoneItems()
        });
        
        return wSBox;
    },
    
});