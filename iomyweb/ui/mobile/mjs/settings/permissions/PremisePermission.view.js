/*
Title: Premise Permissions Page (UI5 View)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a page to hold a table of premises that holds their
    permissions settings
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

sap.ui.jsview("mjs.settings.permissions.PremisePermission", {
	
    /*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.permissions.PremisePermission
	****************************************************************************************************/
	getControllerName : function() {
        return "mjs.settings.permissions.PremisePermission";
    },
    
    /*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.permissions.PremisePermission
	****************************************************************************************************/
    createContent : function(oController) {
    	var me = this;
    	this.destroyContent();
    	
    	var oPage = new sap.m.Page(this.createId("page"), {
            customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			content: [IOMy.widgets.getNavigationalSubHeader("PREMISE PERMISSIONS", "sap-icon://GoogleMaterial/lock", me)],
			footer : IOMy.widgets.getAppFooter()
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		
		return oPage;
    }
    
});
