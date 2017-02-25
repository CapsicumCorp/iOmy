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
	getAppFooter : function () {
		var oFooter = new sap.m.Bar({
			contentLeft : [
				new sap.m.Button({
					text:	"Help",
                    icon:   "sap-icon://GoogleMaterial/help",
					iconFirst: false,
					press : function () {
						IOMy.functions.showHelpDialog();
					}
				}).addStyleClass("FooterHelpButton IOMYButton MarTop9px MarLeft10px width85px TextLeft Text_white")
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