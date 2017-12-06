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

sap.ui.jsview("pages.staging.device.WeatherFeed", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.device.Mjpeg
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.device.WeatherFeed";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.Device
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "WeatherFeed",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents : [
				new sap.m.ScrollContainer ({
					width: "100%",
					height: "100%",
					vertical : true,
					content : [
                        IomyRe.widgets.DeviceToolbar(oController, "Local Weather"),
						new sap.m.List({
							items :[
								//-- Weather Outside --//
								new sap.m.InputListItem ({
									label : "Weather Outside:",
									content : [
										//-- Column 2 for Weather Outside Row --//
										new sap.m.Text (oView.createId("WeatherOutside"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Temperature Outside --//
								new sap.m.InputListItem ({
									label : "Temperature:",
									content : [
										//-- Column 2 for Temperature Row --//
										new sap.m.Text (oView.createId("Temperature"), {
											text : ""
										})
										
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Sunrise --//
								new sap.m.InputListItem ({
									label : "Sunrise:",
									content : [
										//-- Column 2 for Sunrise Row --//
										new sap.m.Text (oView.createId("Sunrise"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Sunset --//
								new sap.m.InputListItem ({
									label : "Sunset:",
									content : [
										//-- Column 2 for Sunset Row --//
										new sap.m.Text (oView.createId("Sunset"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Humidity --//
								new sap.m.InputListItem ({
									label : "Humidity:",
									content : [
										//-- Column 2 for Humidity Row --//
										new sap.m.Text (oView.createId("Humidity"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Wind Direction --//
								new sap.m.InputListItem ({
									label : "Wind Direction:",
									content : [
										//-- Column 2 for Wind Direction Row --//
										new sap.m.Text (oView.createId("WindDirection"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Wind Speed --//
								new sap.m.InputListItem ({
									label : "Wind Speed:",
									content : [
										//-- Column 2 for Wind Speed Row --//
										new sap.m.Text (oView.createId("WindSpeed"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Air Pressure --//
								new sap.m.InputListItem ({
									label : "Air Pressure:",
									content : [
										//-- Column 2 for Air Pressure Row --//
										new sap.m.Text (oView.createId("AirPressure"), {
											text : ""
										})
									]
								}).addStyleClass("maxlabelwidth50Percent"),
							]
						}).addStyleClass("PadBottom10px")
					]
				})
			]
		}).addStyleClass("MainBackground");
	}
});