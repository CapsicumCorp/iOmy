/*
Title: Accept and Cancel Button Group
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Functions that create commonly used purpose-built UI5 widgets that
    are used across multiple pages.
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

$.sap.require("IOMy.widgets.ButtonGroup");

$.sap.declare("IOMy.widgets.AcceptCancelButtonGroup", true);

IOMy.widgets.ButtonGroup.extend("IOMy.widgets.AcceptCancelButtonGroup", {
    
    //------------------------------------------------------------------------//
    // Change the renderer and library.
    //------------------------------------------------------------------------//
    
    metadata : {
        library : "IOMy.widgets"
    },
    
    renderer: function(oRm, oControl) {
        IOMy.widgets.ButtonGroupRenderer.render(oRm, oControl);
    },
    
    //-- Accept and Cancel Buttons --//
    _wAcceptButton : null,
    _wCancelButton : null,
    
    /**
     * Runs upon initialisation.
     */
    init : function () {
        IOMy.widgets.ButtonGroup.prototype.init.call(this);
        
        this.addButton(this._wAcceptButton);
        this.addButton(this._wCancelButton);
        
    },
    
    /**
     * Creates a UI5 HBox container that creates two buttons for use in forms:
     * accept/submit and cancel.
     * 
     * @param {string} sId
     * @param {object} mSettings
     * @constructor
     */
    constructor : function (sId, mSettings) {
        var sID;
        
        //--------------------------------------------------------------------//
        // Decide which parameter was parsed first: the ID or the settings map.
        //--------------------------------------------------------------------//
        if (typeof sId === "string") {
            sID = sId;
        } else if (typeof sId === "object") {
            mSettings = sId;
        }
        
        //--------------------------------------------------------------------//
        // Create the buttons.
        //--------------------------------------------------------------------//
        
        //-- Cancel Button --//
        this._wCancelButton = new sap.m.Button({
            layoutData : new sap.m.FlexItemData({
                growFactor : 1
            }),
            type:"Reject",
            text: "Cancel"
        }).addStyleClass("width80px");

        //-- Submit Button --//
        this._wAcceptButton = new sap.m.Button({
            layoutData : new sap.m.FlexItemData({
                growFactor : 1
            }),									
            type:"Accept",
            text: "Submit"
        }).addStyleClass("width80px");
        
        
        //--------------------------------------------------------------------//
        // Read the settings map if one is provided.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            
            if (mSettings.acceptPress !== undefined) {
                this.attachAcceptPress(mSettings.acceptPress);
            }
            
            if (mSettings.cancelPress !== undefined) {
                this.attachCancelPress(mSettings.cancelPress);
            }
            
        }
        
        //--------------------------------------------------------------------//
        // Run the constructor of the ButtonGroup parent.
        //--------------------------------------------------------------------//
        if (sID !== null && sID !== undefined) {
            IOMy.widgets.ButtonGroup.prototype.constructor.call(this, sID, mSettings);
        } else {
            IOMy.widgets.ButtonGroup.prototype.constructor.call(this, mSettings);
        }
        
    },
    
    /**
     * Attaches a function to run if the Accept button is pressed.
     * 
     * @param {type} fnCallback
     * @param {type} oContext
     * @returns {IOMy.widgets.AcceptCancelButtonGroup} Reference to this in order to allow method chaining
     * 
     * @throws {IllegalArgumentException} The callback function must be valid,
     * and the context must be a Javascript object.
     */
    attachAcceptPress : function (fnCallback, oContext) {
        if (fnCallback === undefined || fnCallback === null) {
            throw new MissingArgumentException("Function must be given.");
        }
        
        if (oContext === undefined || oContext === null) {
            oContext = this;
            
        } else if (typeof oContext === "object") {
            throw new IllegalArgumentException("The context given is not an object. Type given: "+typeof oContext);
        }
        
        if (typeof fnCallback === "function") {
            this._wAcceptButton.attachPress(fnCallback, oContext);
            
        } else {
            throw new IllegalArgumentException("The accept press event must be a function. Type given: "+typeof fnCallback);
        }
        
        // Method chaining
        return this;
    },
    
    /**
     * Attaches a function to run if the Cancel button is pressed.
     * 
     * @param {type} fnCallback
     * @param {type} oContext
     * @returns {IOMy.widgets.AcceptCancelButtonGroup} Reference to this in order to allow method chaining
     * 
     * @throws {IllegalArgumentException} The callback function must be valid,
     * and the context must be a Javascript object.
     */
    attachCancelPress : function (fnCallback, oContext) {
        if (fnCallback === undefined || fnCallback === null) {
            throw new MissingArgumentException("Function must be given.");
        }
        
        if (oContext === undefined || oContext === null) {
            oContext = this;
            
        } else if (typeof oContext === "object") {
            throw new IllegalArgumentException("The context given is not an object. Type given: "+typeof oContext);
        }
        
        if (typeof fnCallback === "function") {
            this._wCancelButton.attachPress(fnCallback, this);
            
        } else {
            throw new IllegalArgumentException("The cancel press event must be a function. Type given: "+typeof fnCallback);
        }
        
        // Method chaining
        return this;
    },
    
    /**
     * Enables (default) or disables the accept button.
     * 
     * @param {type} bEnabled       Enabled/Disabled status
     */
    setAcceptEnabled : function (bEnabled) {
        if (bEnabled !== undefined) {
            if (typeof bEnabled !== "boolean") {
                throw new IllegalArgumentException("bEnabled is not a boolean. Type given: "+typeof bEnabled);
            }
        } else {
            bEnabled = true;
        }
        
        this._wAcceptButton.setEnabled(bEnabled);
        
        // Method chaining
        return this;
    },
    
    /**
     * Enables (default) or disables the cancel button.
     * 
     * @param {type} bEnabled       Enabled/Disabled status
     */
    setCancelEnabled : function (bEnabled) {
        if (bEnabled !== undefined) {
            if (typeof bEnabled !== "boolean") {
                throw new IllegalArgumentException("bEnabled is not a boolean. Type given: "+typeof bEnabled);
            }
        } else {
            bEnabled = true;
        }
        
        this._wCancelButton.setEnabled(bEnabled);
        
        // Method chaining
        return this;
    },
    
    /**
     * Enables (default) or disables the accept button.
     * 
     * @param {type} bEnabled       Enabled/Disabled status
     */
    getAcceptButton : function () {
        return this._wAcceptButton;
    },
    
    getCancelButton : function () {
        return this._wCancelButton;
    }
    
});