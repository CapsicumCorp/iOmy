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

sap.ui.jsview("mjs.staging.TestThermostat", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.TestThermostat
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.TestThermostat";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.TestThermostat
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("page"),{
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content : [
                //-- Navigational Header --//
				IOMy.widgets.getNavigationalSubHeader("Thermostat", "sap-icon://WeatherIcons/wi-thermometer", me),
				new sap.m.Panel( me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content : [ 
						new sap.m.List ({
							items : [
								//-- Status --//
								new sap.m.InputListItem ({
									label : "Status:",
									content : [
										//-- Column 2 for Status Row --//
										new sap.m.Text ({
											text : "On",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Current Temp --//
								new sap.m.InputListItem ({
									label : "Current Temperature:",
									content : [
										//-- Column 2 for Current Temp Row --//
										new sap.m.Text ({
											text : "29°C",
											textAlign : "Center",
											width : "100%"
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Set Temp --//
								new sap.m.InputListItem ({
									label : "Set Temperature:",
									content : [
										//-- Column 2 for Set Temp Row --//
										new sap.m.Select ({
											items : [
												new sap.ui.core.Item({
													key: "20",
													text: "21",
												}),
												new sap.ui.core.Item({
													key: "22",
													text: "22",
												}),
												new sap.ui.core.Item({
													key: "23",
													text: "23",
												}),
												new sap.ui.core.Item({
													key: "24",
													text: "24",
												}),
												new sap.ui.core.Item({
													key: "25",
													text: "25",
												}),
												new sap.ui.core.Item({
													key: "26",
													text: "26",
												}),
												new sap.ui.core.Item({
													key: "27",
													text: "27",
												}),
												new sap.ui.core.Item({
													key: "28",
													text: "28",
												})
											]
										}).addStyleClass(""),
									]
								}).addStyleClass("maxlabelwidth50Percent textaligncenter"),
								//-- Mode Title --//
								new sap.m.InputListItem ({
									label : "Mode:"
								}).addStyleClass(""),
								//-- Mode SegmentedButton --//
								new sap.m.InputListItem ({
									content : [
										new sap.m.SegmentedButton ({
											selectedKey : "SBYes",
											items : [
												new sap.m.SegmentedButtonItem ({
													text : "Off",
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Heat",
													key : "SBYes"
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Cool"
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Auto"
												}),
											]
										})
									]
								}).addStyleClass("textaligncenter"),
								//-- Fan Title --//
								new sap.m.InputListItem ({
									label : "Fan:",
								}).addStyleClass(""),
								//-- Fan Segmented Button --//
								new sap.m.InputListItem ({
									content : [
										new sap.m.SegmentedButton ({
											selectedKey : "SBYes",
											items : [
												new sap.m.SegmentedButtonItem ({
													text : "High"
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Med"
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Low"
												}),
												new sap.m.SegmentedButtonItem ({
													text : "Auto",
													key : "SBYes"
												})
											]
										}) 
									]
								}).addStyleClass("textaligncenter")
							]
						})
					]
                }).addStyleClass("PadBottom10px UserInputForm")
            ]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}

});