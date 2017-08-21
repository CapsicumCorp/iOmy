/*
Title: Telnet Page
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
	Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Page for displaying a telnet console.
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

sap.ui.jsview("mjs.settings.telnet.Telnet", {
	
	wTextAreaOutput			: null,
	wToggleShowDebug		: null,
	wBtnCheckLink			: null,
	wBtnListDevices			: null,
	wInputTelnetCommand		: null,
	wBtnExecuteCommand		: null,
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.telnet.Telnet
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.settings.telnet.Telnet";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.telnet.Telnet
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		me.wTextAreaOutput = new sap.m.TextArea(me.createId("telnetOutput"), {
			editable : false
		}).addStyleClass("width100Percent TelnetOutput");
		
		me.wInputTelnetCommand = new sap.m.Input ({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			submit : function () {
				if (this.getValue().length > 0) {
					oController.ExecuteCommand(this.getValue());
                    this.setValue("");
				}
			}
		}).addStyleClass("");
		
		me.wBtnExecuteCommand = new sap.m.Button({
			text: "Run",
			press : function () {
				if (me.wInputTelnetCommand.getValue().length > 0) {
					oController.ExecuteCommand(me.wInputTelnetCommand.getValue());
                    me.wInputTelnetCommand.setValue("");
				}
			}
		});
		
		me.wToggleShowDebug = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Debug",
			
			press : function () {
				oController.ExecuteCommand("debug output show");
			}
		}).addStyleClass("cTelnetButton");
		
		me.wBtnCheckLink = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Version",
			
			press : function () {
				oController.ExecuteCommand("versioninfo");
			}
		}).addStyleClass("cTelnetButton");
		
		me.wBtnListDevices = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Modules",
			
			press : function () {
				oController.ExecuteCommand("modulesinfo");
			}
		}).addStyleClass("cTelnetButton");
		
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
							// Put the telnet output area
							me.wTextAreaOutput,
							
							new sap.m.Label ({
								text : "Enter command:"
							}),
							new sap.m.HBox({
								layoutData : new sap.m.FlexItemData({
									growFactor : 1
								}),
								items : [
									me.wInputTelnetCommand,
									me.wBtnExecuteCommand
								]
							}).addStyleClass(""),
							new sap.m.HBox({
								layoutData : new sap.m.FlexItemData({
									growFactor : 1
								}),
								items : [
									me.wToggleShowDebug,
									me.wBtnCheckLink,
									me.wBtnListDevices
								]
							}).addStyleClass("TextCenter")
						]
					}).addStyleClass("PadLeft7px PadRight7px")
				]
			}).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
		);
		return oPage;
	}

});
