/*
Title: Find Input Widget
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Searches for a given reference to an input widget.
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

$.sap.declare("IOMy.functions.findInputWidget",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Fetches an input widget specified by it's variable name or element ID
     * from either the current view or its controller.
     * 
     * Throws an exception if sVariableReference is not specified, or if the
     * widget doesn't exist, or if the widget is not an input widget.
     * 
     * @param {function} sVariableReference        Name of the variable or ID
     */
    findInputWidget : function (sVariableReference) {
        //--------------------------------------------------------------------//
        // Declare variables
        //--------------------------------------------------------------------//
        var bError              = false;                        // Boolean:         Error flag.
        var aErrorMessages      = [];                           // String Array:    Array of error messages.
        var oCurrentView        = oApp.getCurrentPage();        // UI5 View:        Current Page.
        var oCurrentController  = oCurrentView.getController(); // UI5 Controller:  Controller of the current page.
        var wFieldWidget        = null;
        
        //--------------------------------------------------------------------//
        // Check that the variable reference is given and that it's a string.
        //--------------------------------------------------------------------//
        if (sVariableReference === undefined) {
            bError = true;
            aErrorMessages.push("No view or controller object variable or element ID given!");
        }
        
        //-- Throw an exception if there is an error --//
        if (bError) {
            throw aErrorMessages.join('\n');
        }
        
        //--------------------------------------------------------------------//
        // Check the view first, then the controller.
        //--------------------------------------------------------------------//
        if (oCurrentView[sVariableReference] !== undefined) {
            wFieldWidget = oCurrentView[sVariableReference];
            
        } else if (oCurrentController[sVariableReference] !== undefined) {
            wFieldWidget = oCurrentController[sVariableReference];
            
        } else {
            //----------------------------------------------------------------//
            // It's not a variable within an object. Is it an element ID?
            // See that it is an element ID specific to a view first. If not,
            // check the controller. If unsuccessful, check that it's a globally
            // referenced element.
            //----------------------------------------------------------------//
            if (oCurrentView.byId(sVariableReference) !== undefined) {
                wFieldWidget = oCurrentView.byId(sVariableReference);
                
            } else if (oCurrentController.byId(sVariableReference) !== undefined) {
                wFieldWidget = oCurrentController.byId(sVariableReference);
                
            } else if (sap.ui.getCore().byId(sVariableReference) !== undefined) {
                wFieldWidget = sap.ui.getCore().byId(sVariableReference);
                
            } else {
                //------------------------------------------------------------//
                // The element cannot be found. Report it as an error
                //------------------------------------------------------------//
                aErrorMessages.push("Input widget with a reference of '" + sVariableReference + "' cannot be found!");
            }
            
        }
        
        //-- Throw an exception if there is an error --//
        if (bError) {
            throw aErrorMessages.join('\n');
        }
        
        //--------------------------------------------------------------------//
        // Can we call getValue() or getSelectedKey() from this widget?
        //--------------------------------------------------------------------//
//        if (wFieldWidget.getValue === undefined || wFieldWidget.getSelectedKey === undefined) {
//            // We cannot. This must not be an input widget!
//            bError = true;
//            aErrorMessages.push("The methods 'getValue()' or 'getSelectedKey()' does not exist! '" + sVariableReference + "' may not be an input widget!");
//        }
//        
//        //-- Throw an exception if there is an error --//
//        if (bError) {
//            throw aErrorMessages.join('\n');
//        }
        
        //-- Return the input widget --//
        return wFieldWidget;
    }
    
});