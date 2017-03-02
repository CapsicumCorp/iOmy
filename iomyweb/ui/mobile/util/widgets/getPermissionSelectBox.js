/*
Title: Yes and No Permission Radio Buttons
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates Yes and No radio buttons for managing permissions.
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

$.sap.declare("IOMy.widgets.getPermissionSelectBox",true);

$.extend(IOMy.widgets,{
    
    /**
     * Create a radio button group that contains the options 'Yes' and 'No'.
     * 
     * @param {type} sID                Widget ID
     * @param {type} iState             Option to select initially
     */
    getPermissionSelectBox : function (sID, iState) {
        
        var oAllowedOption = new sap.m.RadioButton({
            text : "Yes"
        });
        
        var oForbiddenOption = new sap.m.RadioButton({
            text : "No"
        });
        
        var mSettings = {
            buttons : [oAllowedOption, oForbiddenOption]
        };
        var sCSSRules = "PermissionsRadioButtonGroup iOmyRadioButtons";
        
        if (sID !== undefined) {
            var oSBox = new sap.m.RadioButtonGroup(sID, mSettings).addStyleClass(sCSSRules);
        } else {
            var oSBox = new sap.m.RadioButtonGroup(mSettings).addStyleClass(sCSSRules);
        }
        
        if (iState !== undefined) {
            if (iState == 0) {
                oSBox.setSelectedIndex(1);
            } else if (iState == 1) {
                oSBox.setSelectedIndex(0);
            }
        } else {
            oSBox.setSelectedIndex(0);
        }
        
        return oSBox;
    }
    
});