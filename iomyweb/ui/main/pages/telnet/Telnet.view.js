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

sap.ui.jsview("pages.telnet.Telnet", {
	
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
	* @memberOf pages.telnet.Telnet
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.telnet.Telnet";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.telnet.Telnet
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
		oView.wTextAreaOutput = new sap.m.TextArea(oView.createId("telnetOutput"), {
			editable : false,
		}).addStyleClass("width100Percent TelnetOutput");
		
		oView.wInputTelnetCommand = new sap.m.Input ({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			width: "240px",
			placeholder: "Enter Command",
			submit : function () {
				if (this.getValue().length > 0) {
					oController.ExecuteCommand(this.getValue());
                    this.setValue("");
				}
			}
		}).addStyleClass("");
		
		oView.wBtnExecuteCommand = new sap.m.Button({
			layoutData : new sap.m.OverflowToolbarLayoutData({
				priority : sap.m.OverflowToolbarPriority.NeverOverflow
			}),
			text: "Run",
			press : function () {
				if (oView.wInputTelnetCommand.getValue().length > 0) {
					oController.ExecuteCommand(oView.wInputTelnetCommand.getValue());
                    oView.wInputTelnetCommand.setValue("");
				}
			}
		});
		
		return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "MJPEG",
			header : iomy.widgets.getToolPageHeader( oController ),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents : [
				
				new sap.m.ScrollContainer({
					vertical: true,
					height: "100%",
					content : [
						iomy.widgets.DeviceToolbar(oController, "Telnet Console"),
						// Put the telnet output area
						new sap.m.VBox ({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
							items : [
								oView.wTextAreaOutput
							]
						}),				
						new sap.m.OverflowToolbar ({
							content: [
								oView.wInputTelnetCommand,
								oView.wBtnExecuteCommand,
								oView.wToggleShowDebug,
								oView.wBtnCheckLink,
								oView.wBtnListDevices,
								new sap.m.Button({
									type:"Default",
									text: "Show Debug",
									press : function () {
										oController.ExecuteCommand("debug output show");
									}
								}),
								//-- Version Info --//
								new sap.m.Button({
									type:"Default",
									text: "Show Version",
									press : function () {
										oController.ExecuteCommand("versioninfo");
									}
								}),
								//-- Modules Info --//
								new sap.m.Button({
									type:"Default",
									text: "Show Modules",
									press : function () {
										oController.ExecuteCommand("modulesinfo");
									}
								}),
								//-- Get RapidHA Information --//
								new sap.m.Button({
									type:"Default",
									text: "Get RapidHA Info",
									press : function () {
										oController.ExecuteCommand("get_rapidha_info");
									}
								}),
								
								//-- Get Zigbee Information --//
								new sap.m.Button({
									type:"Default",
									text: "Get Zigbee Info",
									press : function () {
										oController.ExecuteCommand("get_zigbee_info");
									}
								}),
								//-- Get RapidHA Information --//
								new sap.m.Button({
									type:"Default",
									text: "Form Network",
									press : function () {
										oController.ExecuteCommand("rapidha_form_network");
									}
								}),
								//-- Get Zigbee Information --//
								new sap.m.Button({
									type:"Default",
									text: "Form Network (Netvox)",
									press : function () {
										oController.ExecuteCommand("rapidha_form_network_netvoxchan");
									}
								})
							]
						})					
					]
				}).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
	}

});
