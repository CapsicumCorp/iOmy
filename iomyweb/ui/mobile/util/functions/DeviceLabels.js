/*
Title: iOmy Device Label Functions Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Contains functions that manage UI5 text widgets containing
    thing/device names.
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

$.sap.declare("IOMy.functions.DeviceLabels",true);

IOMy.functions.DeviceLabels = new sap.ui.base.Object();

$.extend(IOMy.functions.DeviceLabels,{
    /**
     * Adds a label widget containing the name of a thing/item/device into the
     * widget list in the Thing List.
     * 
     * @param {type} iThingId       Thing ID to access the thing in the list
     * @param {type} mSettings      Rules to comply with when updating the Device/Thing Name
     */
    addThingLabelWidget : function (iThingId, mSettings) {
        //console.log(iThingId);
        //console.log(mSettings.widgetID);
        //console.log(JSON.stringify(IOMy.widgets.ThingNameLabels));
        /* 
         * mSettings {
         *      widgetID : "",
         *      // Conditions
         *      prefix : "Edit ",
         *      suffix : "",
         *      lowercase : false,
         *      uppercase : false,
         * }
         */
        //-------------------------------------------//
        // DECLARE VARIABLES
        //-------------------------------------------//
        var bExists = false;
        
        //--------------------------------------------------------------------//
        // Check if the widget is in the list already. Or create an empty list.
        //--------------------------------------------------------------------//
        //console.log(IOMy.widgets.ThingNameLabels["_"+iThingId].length);
        // Create the list if it isn't there already.
        if (IOMy.widgets.ThingNameLabels["_"+iThingId] === undefined) {
            IOMy.widgets.ThingNameLabels["_"+iThingId] = [];
        } else {
            // If the list exists check that the widget mentioned isn't there already.
            for (var i = 0; i < IOMy.widgets.ThingNameLabels["_"+iThingId].length; i++) {
                //console.log("At "+i+": "+IOMy.widgets.ThingNameLabels["_"+iThingId][i].widgetID);
                //console.log("At "+i+": "+mSettings.widgetID);
                if (IOMy.widgets.ThingNameLabels["_"+iThingId][i].widgetID === mSettings.widgetID) {
                    //console.log("Widget information exists!");
                    bExists = true;
                    break; // The widget is already in the list. We do not add duplicates!
                }
            }
        }
        //-------------------------------------------//
        // Insert widget if it is not in the list.
        //-------------------------------------------//
        if (!bExists) {
            IOMy.widgets.ThingNameLabels["_"+iThingId].push(mSettings);
        }
    },
    
    /**
     * Updates all the labels that belong to a given item/thing.
     * 
     * @param {type} iThingId             Device ID
     * @param {type} sText                New label
     */
    updateThingLabels : function (iThingId, sText) {
        var sNewText = "";
        var aWidgets = IOMy.widgets.ThingNameLabels["_"+iThingId];
        var mWidget;
        
        //console.log(aWidgets.length);
        
        for (var i = 0; i < aWidgets.length; i++) {
            mWidget = aWidgets[i];
            sNewText = "";
            // Format the text
            if (mWidget.lowercase === true) {
                sText = sText.toLowerCase();
            }
            
            if (mWidget.uppercase === true) {
                // Upper case will take precedence over lower case of both settings are true.
                sText = sText.toUpperCase();
            }
            
            // Attach prefix (if any)
            if (mWidget.prefix !== undefined) {
                sNewText += mWidget.prefix;
            }
            
            // Append the main formatted text
            sNewText += sText;
            
            // Attach suffix (if any)
            if (mWidget.suffix !== undefined) {
                sNewText += mWidget.suffix;
            }
            
            //console.log(sNewText);
            sap.ui.getCore().byId(mWidget.widgetID).setText(sNewText);
            //console.log(sap.ui.getCore().byId(mWidget.widgetID).getText());
        }
    },
    
    /**
     * Removes a label widget containing the name of a thing/item/device into
     * the widget list in the Thing List.
     * 
     * @param {type} iThingId       Thing ID to access the thing in the list
     * @param {type} sWidgetId      Label containing the Device/Thing Name
     * @param {type} iPos           Position in the list (optional)
     */
    removeThingLabelWidget : function (iThingId, sWidgetId, iPos) {
        //-------------------------------------------//
        // DECLARE VARIABLES
        //-------------------------------------------//
        var aThingLabels = IOMy.common.ThingList["_"+iThingId].LabelWidgets;
        
        if (iPos !== undefined || iPos !== null) {
            IOMy.common.ThingList["_"+iThingId].LabelWidgets.splice(iPos, 1);
            
        } else {
            //-------------------------------------------//
            // Find the widget and remove it
            //-------------------------------------------//
            for (var i = 0; i < aThingLabels.length; i++) {
                if (aThingLabels[i] === sWidgetId) {
                    IOMy.common.ThingList["_"+iThingId].LabelWidgets.splice(i, 1);
                    break; // The widget is already in the list. We do not add duplicates!
                }
            }
        }
    },
});