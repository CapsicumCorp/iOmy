/*
Title: App Footer Widget Function
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the footer found on every page of iOmy.
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

$.sap.declare("IOMy.widgets.getAppFooter",true);

$.extend(IOMy.widgets,{
    
    /**
     * Constructs the IOMy footer that appears on every page. It has the help
     * button (which invokes IOMy.functions.showHelpDialog()), and the 
     * Capsicum Corporation logo.
     * 
     * @returns {sap.m.Bar}     App Footer
     */
	getAppFooter : function (mSettings) {
        //--------------------------------------------------------------------//
        // Initialise variables
        //--------------------------------------------------------------------//
        var bError              = false;
        var aErrorMessages      = [];
        var bHelpButtonEnabled  = false;
        
        //--------------------------------------------------------------------//
        // Process any arguments parsed
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // Check that the view is provided
            //----------------------------------------------------------------//
            if (mSettings.view === undefined) {
                bError = true;
                aErrorMessages.push("A UI5 view must be given to create a unique ID for its help button!");
            }
            //----------------------------------------------------------------//
            // If the help button enabled flag is not given, default is FALSE.
            //----------------------------------------------------------------//
            if (mSettings.helpButtonEnabled !== undefined) {
                bHelpButtonEnabled = mSettings.helpButtonEnabled;
            }
        } else {
            //----------------------------------------------------------------//
            // There are required parameters that need parsing and the settings
            // map is not even there.
            //----------------------------------------------------------------//
            throw new MissingSettingsMapException();
        }
        
        if (bError) {
            throw new MissingArgumentException("Error calling IOMy.widgets.getAppFooter():\n* "+aErrorMessages.join("\n* "));
        }
        
        //--------------------------------------------------------------------//
        // Draw the footer
        //--------------------------------------------------------------------//
		var oFooter = new sap.m.Bar({
			contentLeft : [
				new sap.m.Button(mSettings.view.createId("helpButton"), {
					tootip: "Open Help",
					text:	"Help",
                    icon:   "sap-icon://GoogleMaterial/help",
					iconFirst: false,
                    enabled : bHelpButtonEnabled,
					press : function () {
						IOMy.functions.showHelpDialog();
					}
				}).addStyleClass("FooterHelpButton IOMYButton")
            ],
			contentRight : [
                new sap.m.Image({
                    densityAware: false,
                    src : "resources/images/logo/capcorplogo.png"
                })
            ],
			design:"Footer"
		}).addStyleClass("footerMBarContainer FooterBackgroundColour");
		
		return oFooter;
	}
    
});