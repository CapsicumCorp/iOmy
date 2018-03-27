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
        
        var oCameraTypeTemplate = new sap.ui.core.Item({
            key:  "{Id}",
            text: "{Name}"
        });
        
        var oOnvifCameraTemplate = new sap.ui.core.Item({
            key:  "{ThingId}",
            text: "{ThingName}"
        });
		
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
														text:"{/title}"
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
                                                                    enabled : "{/controlsEnabled/MostControls}",
																	selectedKey: "{/fields/CameraType}",
																	items: {
																		path : "/options/CameraTypes",
                                                                        template : oCameraTypeTemplate
																	}
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Select Camera",
															fields: [
																new sap.m.Select ({
																	enabled : "{/controlsEnabled/IfHasStreams}",
																	selectedKey: "{/fields/SelectedCamera}",
																	items: {
                                                                        path : "/options/OnvifCameras",
                                                                        template : oOnvifCameraTemplate
                                                                    }
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Stream Name*",
															fields: [
																new sap.m.Input ({
																	enabled : "{/controlsEnabled/MostControls}",
																	value :"{/fields/Name}"
																})
															]
														}),
														new sap.ui.layout.form.FormElement({
															label : "Enable Stream",
															fields: [
																new sap.m.CheckBox ({
                                                                    enabled : "{/controlsEnabled/MostControls}",
																	selected : "{/fields/Enabled}"
                                                                })
															]
														}),
														new sap.ui.layout.form.FormElement({
															label: "",
															fields: [
																new sap.m.Button (oView.createId("ButtonSubmit"), {
																	enabled : "{/controlsEnabled/IfHasStreams}",
																	text: "Save",
																	type: sap.m.ButtonType.Accept,
																	press:   function( oEvent ) {
                                                                        oController.submitStreamInformation();
																	}
																}),
																new sap.m.Button (oView.createId("ButtonCancel"), {
																	enabled : "{/controlsEnabled/MostControls}",
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
						})
					]
					
				}).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
	}
});