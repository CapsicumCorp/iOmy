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

sap.ui.jsview("pages.Development.AddStream", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.Development.AddStream";
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
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Stream Form",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				new sap.uxap.ObjectPageLayout (oView.createId("ObjectPageLayout"), {
					isObjectIconAlwaysVisible: true,
					enableLazyLoading: true,
					showTitleinHeaderContent: true,
					sections : [
						new sap.uxap.ObjectPageSection(oView.createId("Stream"), {
							showTitle: false,
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("StreamBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("StreamBlock_Form"),{
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
													new sap.m.Title (oView.createId("StreamToolbarTitle"),{
														text:"Add Managed Camera Stream"
													}),
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
												new sap.ui.layout.form.FormContainer({
													formElements : [
														new sap.ui.layout.form.FormElement({
															// Only Onvif for now until we support other camera types
															label : "Camera Type",
															fields: [
																new sap.m.Select ({
																	selectedKey: "1",
																	items: [
																		new sap.ui.core.Item({
																			key:  "1",
																			text: "Onvif Camera"
																		})
																	]
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Select Camera",
															fields: [
																new sap.m.Select ({
																	selectedKey: "1",
																	items: [
																		new sap.ui.core.Item({
																			key:  "1",
																			text: "Name"
																		}),
																		new sap.ui.core.Item({
																			key:  "2",
																			text: "Name"
																		}),
																		new sap.ui.core.Item({
																			key:  "3",
																			text: "Name"
																		}),
																	]
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Stream Description",
															fields: [
																new sap.m.Input ({
																	value:""
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Enable Stream",
															fields: [
																new sap.m.CheckBox ({})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label: "",
															fields: [
																new sap.m.Button (oView.createId("ButtonSubmit"), {
																	text: "Save",
																	type: sap.m.ButtonType.Accept,
																	press:   function( oEvent ) {
																		iomy.common.NavigationChangePage( "pManagedStreams" ,  {} , false);
																	}
																}),
																new sap.m.Button (oView.createId("ButtonCancel"), {
																	text: "Cancel",
																	type: sap.m.ButtonType.Reject,
																	press:   function( oEvent ) {
																		iomy.common.NavigationChangePage( "pManagedStreams" ,  {} , false);
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