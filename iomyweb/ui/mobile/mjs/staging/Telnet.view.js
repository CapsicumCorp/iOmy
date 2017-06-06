/*
Title: Add IP Camera
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
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

sap.ui.jsview("mjs.staging.Telnet", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.Telnet
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.Telnet";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.Telnet
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/subtitles",
            title : "Telnet"
        });

		oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content : [
					new sap.m.VBox({
						layoutData : new sap.m.FlexItemData({
							growFactor : 1
						}),
						items : [
							new sap.m.TextArea({
								editable : false,
							}).addStyleClass("width100Percent TelnetOutput"),
							new sap.m.Label ({
								text : "Custom Input:",
							}),
							new sap.m.HBox({
								layoutData : new sap.m.FlexItemData({
									growFactor : 1
								}),
								items : [
									new sap.m.Input ({
										layoutData : new sap.m.FlexItemData({
											growFactor : 1
										}),
									}).addStyleClass(""),
									new sap.m.Button({
										text: "Go",
									}),
								],
							}).addStyleClass(""),
							new sap.m.HBox({
								layoutData : new sap.m.FlexItemData({
									growFactor : 1
								}),
								items : [
									new sap.m.ToggleButton({
										layoutData : new sap.m.FlexItemData({
											growFactor : 1
										}),
										type:"Default",
										text: "Show Debug",
									}).addStyleClass("cTelnetButton"),
									new sap.m.Button({
										layoutData : new sap.m.FlexItemData({
											growFactor : 1
										}),
										type:"Default",
										text: "Check Link",
									}).addStyleClass("cTelnetButton"),
									new sap.m.Button({
										layoutData : new sap.m.FlexItemData({
											growFactor : 1
										}),
										type:"Default",
										text: "List Devices",
									}).addStyleClass("cTelnetButton"),
								],
							}).addStyleClass("TextCenter"),
						],
					}).addStyleClass("PadLeft7px PadRight7px"),
				],
			}).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
		);
		return oPage;
	}

});