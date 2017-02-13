/*
Title: Show Help Dialog
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Brings up a dialog with information about currently shown page.
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

$.sap.declare("IOMy.functions.showHelpDialog",true);

//----------------------------------------------------------------------------//
// Add this function to the functions module.
//----------------------------------------------------------------------------//
$.extend(IOMy.functions,{
    
    /**
     * Uses the new help module (iomyweb/ui/mobile/util/functions/help.js).
     * 
     * Displays a dialog containing information about the purpose of the current page.
     * It grabs the ID of the current page and uses it to determine what information
     * it should display.
     * 
     * NOTE: If the ID itself is displayed, that means that there is no help info and
     * it's not explicitly stated in the function (A BUG IF THIS HAPPENS).
     */
	showHelpDialog : function () {
		var sHelpMessage = IOMy.help.PageInformation[oApp.getCurrentPage().getId()];
		
		sap.m.MessageBox.show(
			sHelpMessage,
			{
				icon: sap.m.MessageBox.Icon.INFORMATION,
				title: "Help",
				actions: sap.m.MessageBox.Action.CLOSE,
				styleClass : "HelpDialog",
				onClose: function () {}
			}
		);
	}
    
});