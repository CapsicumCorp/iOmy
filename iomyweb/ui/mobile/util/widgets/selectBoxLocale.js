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
     * Creates a select box filled with regions as options.
     * 
     * @returns {sap.m.Select}          Region select box.
     */
    selectBoxRegions : function (sID) {
        // Capture scope
        var me = this;
        var wSBox;
        var mSettings = {
            width : "100%",
            items : me.getRegionItems()
        };
        
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with languages as options.
     * 
     * @returns {sap.m.Select}          Language select box.
     */
    selectBoxLanguages : function (sID) {
        // Capture scope
        var me = this;
        var wSBox;
        var mSettings = {
            width : "100%",
            items : me.getLanguageItems()
        };
        
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
    /**
     * Creates a select box filled with post code/zip codes as options.
     * 
     * @returns {sap.m.Select}          Post code select box.
     */
//    selectBoxPostCodes : function (sID) {
//        // Capture scope
//        var me = this;
//        
//        var wSBox = new sap.m.Select(sID, {
//            width : "100%",
//            items : me.getPostCodeItems()
//        });
//        
//        return wSBox;
//    },
    
    /**
     * Creates a select box filled with states/provinces as options.
     * 
     * @returns {sap.m.Select}          State select box.
     */
//    selectBoxStatesProvinces : function (sID) {
//        // Capture scope
//        var me = this;
//        
//        var wSBox = new sap.m.Select(sID, {
//            width : "100%",
//            items : me.getStateProvinceItems()
//        });
//        
//        return wSBox;
//    },
    
    /**
     * Creates a select box filled with timezones as options.
     * 
     * @returns {sap.m.Select}          Timezone select box.
     */
    selectBoxTimezones : function (sID) {
        // Capture scope
        var me = this;
        var wSBox;
        var mSettings = {
            width : "100%",
            items : me.getTimezoneItems()
        };
        
        if (sID !== undefined) {
            wSBox = new sap.m.Select(sID, mSettings);
        } else {
            wSBox = new sap.m.Select(mSettings);
        }
        
        return wSBox;
    },
    
});