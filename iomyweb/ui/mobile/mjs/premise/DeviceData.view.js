/*
Title: Zigbee Data Page UI5 View
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the page for showing data about a given Zigbee device
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

sap.ui.jsview("mjs.premise.DeviceData", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.premise.DeviceData
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.premise.DeviceData";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.premise.DeviceData
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://IOMy1/appliances",
            title : "Device Data"
        });
        
        oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel(me.createId("panel"), {
                backgroundDesign: "Transparent",
                content: []
            }).addStyleClass("height100Percent PanelNoPadding UserInputForm ZigbeeDataPage TextCenter")
        );
        
//		var oPage = new sap.m.Page( me.createId("page"), {
//			customHeader:	IOMy.widgets.getIOMYPageHeaderNav(oController),
//			footer:			IOMy.widgets.getAppFooter(),
//			content: [
//				//-- Navigational Header --//
//				IOMy.widgets.getNavigationalSubHeader("DEVICE DATA", "sap-icon://IOMy1/appliances", me ),
//                //-- Main Panel --//
//                new sap.m.Panel(me.createId("panel"), {
//                    backgroundDesign: "Transparent",
//                    content: []
//                }).addStyleClass("height100Percent PanelNoPadding UserInputForm ZigbeeDataPage TextCenter")
//			]
//		}).addStyleClass("height100Percent width100Percent MainBackground MasterPage");
		
		return oPage;
	}

});