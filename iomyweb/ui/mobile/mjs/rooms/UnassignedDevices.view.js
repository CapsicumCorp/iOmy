/*
Title: Unassigned Devices UI5 View
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the page to list all devices and their information not yet
    assigned a particular room in the premise.
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

sap.ui.jsview("mjs.rooms.UnassignedDevices", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.rooms.UnassignedDevices
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.rooms.UnassignedDevices";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.rooms.UnassignedDevices
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "Unassigned Devices"
        });
		
//		var oPage = new sap.m.Page(me.createId("page"),{
//			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
//			footer : IOMy.widgets.getAppFooter(),
//			content : [
                //-- Navigational Header --//
//				IOMy.widgets.getNavigationalSubHeader("UNASSIGNED DEVICES", "sap-icon://GoogleMaterial/home", me )
//            ]
//		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}

});