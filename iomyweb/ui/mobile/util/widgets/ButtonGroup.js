/*
Title: Button Group Widget
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Container for buttons.
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

$.sap.declare("IOMy.widgets.ButtonGroup", true);

sap.m.HBox.extend("IOMy.widgets.ButtonGroup", {
    
    //------------------------------------------------------------------------//
    // Change the renderer and library.
    //------------------------------------------------------------------------//
    
    metadata : {
        library : "IOMy.widgets"
    },
    
    renderer: function(oRm, oControl) {
        sap.m.HBoxRenderer.render(oRm, oControl);
    },
    
    layoutData : new sap.m.FlexItemData({
        growFactor : 1
    }),
    
    init : function () {
        sap.m.HBox.prototype.init.call(this);
    },
    
    constructor : function (sId, mSettings) {
        var sID;
        
        if (typeof sId === "string") {
            sID = sId;
        } else if (typeof sId === "object") {
            mSettings = sId;
        }
        
        if (sID !== null && sID !== undefined) {
            sap.m.HBox.prototype.constructor.call(this, sID, mSettings);
        } else {
            sap.m.HBox.prototype.constructor.call(this, mSettings);
        }
    },
    
    /**
     * Wrapper function for addItem to denote that only buttons can be added to
     * this container.
     * 
     * @param {type} oButton
     */
    addButton : function (oButton) {
        this.addItem(oButton);
    },
    
    /**
     * Inserts UI5 buttons into aggregation 'items'.
     * 
     * @param {type} oButton
     */
    addItem : function (oButton) {
        if (oButton instanceof sap.m.Button) {
            sap.m.HBox.prototype.addItem.call(this, oButton);
            
        } else {
            throw new IllegalArgumentException("The widget given is not a UI5 Button");
        }
    },
    
    /**
     * Enables or disables all buttons in the container.
     * 
     * @param {type} bEnabled
     */
    setEnabled : function (bEnabled) {
        var aItems = this.getItems();
        
        if (bEnabled !== undefined) {
            if (typeof bEnabled !== "boolean") {
                throw new IllegalArgumentException("bEnabled is not a boolean. Type given: "+typeof bEnabled);
            }
        } else {
            bEnabled = true;
        }
        
        for (var i = 0; i < aItems.length; i++) {
            aItems[i].setEnabled(bEnabled);
        }
    }
    
});