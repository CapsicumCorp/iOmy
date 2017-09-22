/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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
$.sap.require("sap.ui.unified.ColorPicker");
sap.ui.controller("pages.staging.device.RGBlight", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/
	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				
				//-- Set Static parameters --//
				//-- (#ToDo# - Pull from the DB) --//
				oController.RGBInit(oController, "hsv(360,100,100)");
				oController.RGBUiDraw(oController, "CSR");
				
				//-- Defines the Screen Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
				
				//-- Updates Paramaters & ID's on Load --//
				//-- Brent to add in logic to update the UI with id's from the Database --//
			}
		});		
	},
	
	//-- Sets the RGB Color parameters based on static data --//
	//--  (#ToDo# - convert to pull from the DB) --//
	RGBInit: function (oController, sHSV) {
		var oView = this.getView();
		oView.byId("CPicker").setColorString(sHSV);
	},
		
	//-- Adds a "WhiteLight" button if the devicetype === "CSR" --//
	//--  (#ToDo# - Convert to pull RGBType from Thinglist) --//
	RGBUiDraw: function (oController, RGBType) {
		var oView = this.getView();
		
		try {	
			if (RGBType === "Hue") {
				//$.sap.log.error("RGBUiDraw:" +RGBType);
			} else if (RGBType === "CSR") {
				oView.byId("RGB_Cont").addContent(IomyRe.widgets.CSRbutton(oController));
			}		
		} catch(e1) {
			$.sap.log.error("RGBUiDraw: Critcal Error."+e1.message);
			$.sap.log.error("RGBType set incorrectly:"+RGBType);
			return false;
		}		
		
	},
		
});