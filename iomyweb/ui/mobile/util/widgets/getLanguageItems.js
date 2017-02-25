/*
Title: Create Language Items Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a list of UI5 items for language select boxes and combo
    boxes.
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

$.sap.declare("IOMy.widgets.getLanguageItems",true);

$.extend(IOMy.widgets,{
    
    /**
     * Creates a list of languages from the global variable IOMy.common.Languages
     * so that select boxes and combo boxes can use them.
     * 
     * @returns {Array}             Array of UI5 Items containing languages.
     */
    getLanguageItems : function () {
        // Declare and fetch variables
        var aLanguage = IOMy.common.Languages;
        var aItems = [];
        
        // Make the list of select box items
        for (var i = 0; i < aLanguage.length; i++) {
            aItems.push(
                new sap.ui.core.Item({
                    text : aLanguage[i].LanguageName,
                    key : aLanguage[i].LanguageId
                })
            );
        }
        
        return aItems;
    }
    
});