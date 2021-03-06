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

sap.ui.jsview("pages.rules.RulesForm", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.rules.RulesForm";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
        
        var oDevicesTemplate = new sap.ui.core.Item({
            "key"   : "{Id}",
            "text"  : "{DisplayName}"
        });
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Room Form",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				new sap.uxap.ObjectPageLayout (oView.createId("ObjectPageLayout"), {
					isObjectIconAlwaysVisible: true,
					enableLazyLoading: true,
					showTitleinHeaderContent: true,
					sections : [
						new sap.uxap.ObjectPageSection(oView.createId("Rule"), {
							showTitle: false,
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("RuleBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("RuleBlock_Form"),{
											editable: true,
											layout : new sap.ui.layout.form.ResponsiveGridLayout ({
												labelSpanXL: 3,
												labelSpanL: 3,
												labelSpanM: 3,
												labelSpanS: 12,
												adjustLabelSpan: false,
												emptySpanXL: 3,
												emptySpanL: 2,
												emptySpanM: 0,
												emptySpanS: 0,
												columnsXL: 1,
												columnsL: 1,
												columnsM: 1,
												columnsS: 1,
												singleContainerFullSize: false
											}),
											toolbar : new sap.m.Toolbar({
												content : [
													new sap.m.Title (oView.createId("RuleToolbarTitle"),{
                                                        text : "{/ToolbarTitle}"
													}),
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
												new sap.ui.layout.form.FormContainer({
													formElements : [
														new sap.ui.layout.form.FormElement({
															//"Rule Type" Defined in Database 
															label : "Rule Type",
															fields: [
																new sap.m.Select({
																	selectedKey : "{/Form/TypeId}",
                                                                    enabled : "{/FormControlsEnabled}",
																	items : [
																		new sap.ui.core.Item ({
																			key: "1",
																			text: "Turn On Device (One-time)"
																		}),
																		new sap.ui.core.Item ({
																			key: "2",
																			text: "Turn Off Device (One-time)"
																		}),
																		new sap.ui.core.Item ({
																			key: "3",
																			text: "Turn On Device (Recurring)"
																		}),
																		new sap.ui.core.Item ({
																			key: "4",
																			text: "Turn Off Device (Recurring)"
																		}),
																	]
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															//label : "Display Name",
															label : "Device",
															fields: [
																new sap.m.Select({
																	selectedKey : "{/Form/ThingId}",
                                                                    enabled : "{/DeviceSBoxEnabled}",
																	items : {
                                                                        path : "/SupportedDevices",
                                                                        template : oDevicesTemplate
                                                                    }
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															//label : "Display Name",
															label : iomy.widgets.RequiredLabel("Rule Name"),
															fields: [
																new sap.m.Input({
                                                                    value : "{/Form/Name}",
                                                                    enabled : "{/FormControlsEnabled}"
                                                                })
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : iomy.widgets.RequiredLabel("Time"),
															fields: [
																new sap.m.TimePicker ({
																	valueFormat: "HH:mm:ss",
																	displayFormat: "hh:mm a",
																	placeholder: "Select a time",
                                                                    enabled : "{/FormControlsEnabled}",
                                                                    value : "{/Form/Time}"
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															//"Rule Type" Defined in Database 
															label : "Enabled",
															fields: [
																new sap.m.CheckBox({
                                                                    selected : "{/Form/Enabled}",
                                                                    enabled : "{/FormControlsEnabled}"
                                                                })
															]
														}),
														new sap.ui.layout.form.FormElement({
															label: "",
															fields: [
																new sap.m.Button (oView.createId("ButtonSubmit"), {
																	text: "Update",
																	type: sap.m.ButtonType.Accept,
                                                                    enabled : "{/UpdateEnabled}",
                                                                    press : function () {
                                                                        oController.submitRuleInformation();
                                                                    }
																}),
																new sap.m.Button (oView.createId("ButtonCancel"), {
																	text: "Cancel",
																	type: sap.m.ButtonType.Reject,
                                                                    enabled : "{/FormControlsEnabled}",
                                                                    
                                                                    press : function () {
                                                                        oController.GoToRulesList();
                                                                    }
																})
															]
														})
													]
												})
											]
										})
									]									
									
								})
							]
						}),
					]
					
				}).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
	}
});