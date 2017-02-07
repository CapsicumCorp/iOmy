/*
Title: Template UI5 View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all devices and their information in a given
    room.
Copyright: Capsicum Corporation 2016

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

sap.ui.jsview("mjs.devices.WindowSensor", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.devices.WindowSensor
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.devices.WindowSensor";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.devices.WindowSensor
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("page"),{
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content : [
                //-- Navigational Header --//
				IOMy.widgets.getNavigationalSubHeader("Windows Sensor", "sap-icon://GoogleMaterial/border_all", me),
				new sap.m.Panel( me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content : [
						/*new sap.m.List ({
							items : [
								//-- Status --//
								new sap.m.InputListItem ({
									label : "Status:",
									content : [
										//-- Column 2 for Status Row --//
										new sap.m.Text ({
											text : "Closed",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Last Accessed --//
								new sap.m.InputListItem ({
									label : "Last Accessed:",
									content : [
										//-- Column 2 for Last Accessed Row --//
										new sap.m.Text ({
											text : "23d 13h 44m",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Battery --//
								new sap.m.InputListItem ({
									label : "Battery:",
									content : [
										//-- Column 2 for Battery Row --//
										new sap.m.Text ({
											text : "79%",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Tamper --//
								new sap.m.InputListItem ({
									label : "Tamper:",
									content : [
										//-- Column 2 for Tamper Row --//
										new sap.m.Text ({
											text : "Secure",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent")
							]
						})*/
					]
                }).addStyleClass("PadBottom10px UserInputForm")
            ]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}

});