/*
Title: IOMy Page Widget function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A function to create a complete sap.m.Page for all activities
    (pages).
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

$.sap.declare("IOMy.widgets.IOMyPage",true);

$.extend(IOMy.widgets,{
    
    /**
     * Function that generates a page for the IOMy app with all the settings and widgets
     * preconfigured (navigation, header and footer).
     * 
     * Parameters are stored in a map, which is a JavaScript Object. Required parameters
     * are view, icon, and title. Other parameters are controller, and page ID (id). If
     * the controller isn't given, one can be extracted from the view. The default page
     * ID is "page". Leave id blank if you want to use the default ID.
     * 
     * The view is a sap.ui.jsview object. The controller is a sap.ui.controller object.
     * 
     * @param {map} mSettings       // Parameters placed in a map
     * @returns {object}            // sap.m.Page OR an empty object, {}
     */
    IOMyPage : function (mSettings) {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        
        // Error checking
        var bError              = false;    // Unless indicated otherwise.
        var aErrorMessages      = [];       // Array of error messages.
        var sErrorMessage       = "";       // Final error message.
        // The Page itself
        var oPage               = {};
        
        //===============================================\\
        // VALIDATE REQUIRED ARGUMENTS
        //===============================================\\
        
        try {
            //== VIEW ==\\
            //--- If the view is undefined, then the page can't be created. ---\\
            if (mSettings.view === undefined) {
                bError = true; // Bugger.
                aErrorMessages.push("A UI5 view must be parsed.");

            //--- If it is parsed, check to see if it's actually a JS Object. ---\\
            } else if (typeof mSettings.view !== "object") {
                // If it's not, then that's an error.
                bError = true;
                aErrorMessages.push("view must be a JS Object (sap.ui.jsview).");
            }

            //== CONTROLLER ==\\
            //--- If there is a valid view, check the controller to see if it exists and is valid. ---\\
            if (mSettings.controller === undefined || typeof mSettings.controller !== "object") {
                //--- If not, see if a controller can be gathered from the view instead. ---\\
                try {

                    mSettings.controller = mSettings.view.getController();

                } catch (e) {
                    bError = true; // No.
                    aErrorMessages.push("Could not retrieve the controller: "+e.message);
                }
            }
            //== ID ==\\
            //--- Now see if the ID exists and is valid. ---\\
            if (mSettings.id === undefined || isNaN(mSettings.id.charAt(0)) === false) {
                // Set the default ID which will be unique to its view if a valid ID does not exist.
                mSettings.id = "page";
                // Log that the default ID will be used and the reason why.
                if (mSettings.id === undefined) {
                    // If the ID is not given, say so.
                    jQuery.sap.log.warn("ID not specified, so '"+mSettings.id+"' is used as the ID");
                    
                } else if (isNaN(mSettings.id.charAt(0)) === false) {
                    jQuery.sap.log.warn("ID is invalid as it starts with a number, so '"+mSettings.id+"' is used as the ID");
                }
            }

            //== TITLE ==\\
            //--- Every page needs a title... ---\\
            if (mSettings.title === undefined) {
                bError = true; // No title!
                aErrorMessages.push("Every page needs a title");

            //--- ...which must be a string ---\\
            } else if (typeof mSettings.title !== "string") {
                bError = true; // It's not a string.
                aErrorMessages.push("Title must be a string");
            }

            //== ICON ==\\
            //--- Every page needs an icon... ---\\
            if (mSettings.icon === undefined) {
                bError = true; // Where's the icon?
                aErrorMessages.push("Every page needs an icon");

            //--- ...which must be a string ---\\
            } else if (typeof mSettings.icon !== "string") {
                bError = true; // It's not a string.
                aErrorMessages.push("Title must be a string");
            }

            //===============================================\\
            // NOW CREATE THE PAGE IF IT ALL CHECKS OUT
            //===============================================\\

            if (bError === false) {
                try {
                    oPage = new sap.m.Page(mSettings.view.createId(mSettings.id), {
                        customHeader : IOMy.widgets.getIOMYPageHeaderNav( mSettings.controller ),
                        content: [IOMy.widgets.getNavigationalSubHeader(mSettings.title.toUpperCase(), mSettings.icon, mSettings.view)],
                        footer : IOMy.widgets.getAppFooter()
                    }).addStyleClass("height100Percent width100Percent MainBackground MasterPage");
                } catch (e) {
                    // Something has gone wrong if this executes.
                    bError = true;
                    aErrorMessages.push("There was an error in creating the page: "+e.message);
                }

            }

        } catch (e) {
            // Something has gone wrong if this executes.
            bError = true;
            aErrorMessages.push("There : "+e.message);
        }
        
        if (bError === true) {
            sErrorMessage = aErrorMessages.join("\n");
            jQuery.sap.log.error(sErrorMessage);
            IOMy.common.showError(sErrorMessage, "Error");
            // Send the user back to the page so as not to get stuck.
            IOMy.common.NavigationTriggerBackForward(false);
        }
        return oPage; // Either the page or an empty JS Object
    }
    
});