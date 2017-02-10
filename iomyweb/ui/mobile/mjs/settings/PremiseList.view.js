/*
Title: Premise List (Settings) UI5 View
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the page that lists all the premises accessible and their
    hubs.
Copyright: Capsicum Corporation 2016, 2017

This file is part of the iOmy project.

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

sap.ui.jsview("mjs.settings.PremiseList", {
	
    /*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.PremiseList
	****************************************************************************************************/
	getControllerName : function() {
		return "mjs.settings.PremiseList";
	},
	
    /*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.PremiseList
	****************************************************************************************************/
	createContent : function(oController) {
		var me = this;
		this.destroyContent();
		
		var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/settings",
            title : "Premise List"
        });	
		
//		var oPage = new sap.m.Page(me.createId("PremiseListPage"), {
//			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
//			content: [
//				//-- Navigational Header --//
//				IOMy.widgets.getNavigationalSubHeader("PREMISE LIST", "sap-icon://GoogleMaterial/settings", me ),
//				//-- Main Panel --//
//				new sap.m.Panel(me.createId("Panel"), {
//					backgroundDesign: "Transparent",
//					content: []
//				}).addStyleClass("height100Percent PanelNoPadding UserInputForm TableSideBorders")
//			],
//			footer : IOMy.widgets.getAppFooter()
//		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		
		return oPage;
	}
	
});
