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

sap.ui.jsview("pages.staging.telnet.Telnet", {
	
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
	* @memberOf pages.staging.telnet.Telnet
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.telnet.Telnet";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.telnet.Telnet
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
		oView.wTextAreaOutput = new sap.m.TextArea(oView.createId("telnetOutput"), {
			editable : false
		}).addStyleClass("width100Percent TelnetOutput");
		
		oView.wInputTelnetCommand = new sap.m.Input ({
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
		
		oView.wBtnExecuteCommand = new sap.m.Button({
			text: "Run",
			press : function () {
				if (oView.wInputTelnetCommand.getValue().length > 0) {
					oController.ExecuteCommand(oView.wInputTelnetCommand.getValue());
                    oView.wInputTelnetCommand.setValue("");
				}
			}
		});
		
		oView.wToggleShowDebug = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Debug",
			
			press : function () {
				oController.ExecuteCommand("debug output show");
			}
		}).addStyleClass("cTelnetButton");
		
		oView.wBtnCheckLink = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Version",
			
			press : function () {
				oController.ExecuteCommand("versioninfo");
			}
		}).addStyleClass("cTelnetButton");
		
		oView.wBtnListDevices = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Show Modules",
			
			press : function () {
				oController.ExecuteCommand("modulesinfo");
			}
		}).addStyleClass("cTelnetButton");
		
		return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "MJPEG",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents : [
				IomyRe.widgets.DeviceToolbar(oController, "Telnet Console"),
                
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
                                oView.wTextAreaOutput,

                                new sap.m.Label ({
                                    text : "Enter command:"
                                }),
                                new sap.m.HBox({
                                    layoutData : new sap.m.FlexItemData({
                                        growFactor : 1
                                    }),
                                    items : [
                                        oView.wInputTelnetCommand,
                                        oView.wBtnExecuteCommand
                                    ]
                                }).addStyleClass(""),
                                new sap.m.HBox({
                                    layoutData : new sap.m.FlexItemData({
                                        growFactor : 1
                                    }),
                                    items : [
                                        oView.wToggleShowDebug,
                                        oView.wBtnCheckLink,
                                        oView.wBtnListDevices
                                    ]
                                }).addStyleClass("TextCenter")
                            ]
                        }).addStyleClass("PadLeft7px PadRight7px")
                    ]
                }).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
			]
		}).addStyleClass("MainBackground");
	}

});