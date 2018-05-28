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

sap.ui.jsview("pages.security.SecurityData", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.Advanced
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.security.SecurityData";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.Advanced
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "SecurityData",
            header : iomy.widgets.getToolPageHeader( oController ),
            sideContent : iomy.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                new sap.m.ScrollContainer({
                    width : "100%",
                    height : "100%",
                    vertical : true,
                    
                    content : [
                        new sap.m.ObjectHeader({
                            title: "{/title}",
                            number: "{/count/thumbnails}",
                            numberUnit: "Thumbnail",
                        }),
                        new sap.m.IconTabBar({
                            items : [
                                new sap.m.IconTabFilter({
                                    text: "Stream",
                                    icon : "sap-icon://video",
                                    content : [
                                        new sap.m.Carousel (oView.createId("streamTab"), {
                                            pages: [
                                                
                                            ]
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter({
                                    text: "Thumbnails",
                                    icon : "sap-icon://camera",
                                    content : [
                                        new sap.m.Carousel (oView.createId("thumbnailTab"), {
                                            pages: [
                                                new sap.m.Image ({
                                                    densityAware : false,
                                                    width : "90%",
                                                    height : "90%",
                                                    src:"{/data/thumbnailUrl}"
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter({
                                    text: "Settings",
                                    icon : "sap-icon://settings",
                                    content : [
                                        new sap.ui.layout.form.Form( oView.createId("CameraSettings_Form"),{
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
													new sap.m.Title (oView.createId("CameraSettingsTitle"),{
                                                        text : "Camera Settings"
													}),
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
												new sap.ui.layout.form.FormContainer({
													formElements : [
														/* new sap.ui.layout.form.FormElement({
															label : "Onvif Authentication",
															fields: [
																new sap.m.Select({
																	items : [
																		new sap.ui.core.Item ({
																			key: "1",
																			text: "No Auth"
																		}),
                                                                        new sap.ui.core.Item ({
																			key: "2",
																			text: "Username Only"
																		}),
																		new sap.ui.core.Item ({
																			key: "3",
																			text: "Username and Password"
																		})
                                                                    ]
																})
															]
														}),*/
                                                        new sap.ui.layout.form.FormElement({
															label : "Stream Authentication",
															fields: [
																new sap.m.Select({
                                                                    enabled : "{/enabled/IfAllowed}",
                                                                    selectedKey : "{/fields/streamAuthType}",
																	items : [
																		new sap.ui.core.Item ({
																			key: 0,
																			text: "No Auth Required"
																		}),
                                                                        new sap.ui.core.Item ({
																			key: 1,
																			text: "Camera Username and Password"
																		}),
																		new sap.ui.core.Item ({
																			key: 2,
																			text: "Stream Username and Password"
																		})
                                                                    ],
                                                                    
                                                                    change : function () {
                                                                        oController.ToggleOnvifStreamAuthenticationForm();
                                                                    }
																})
															]
														}),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : iomy.widgets.RequiredLabel("Stream Username"),
                                                            visible : "{/visible/IfStreamAuthSelected}",
                                                            fields: [ 
                                                                new sap.m.Input({
                                                                    value : "{/fields/streamUsername}",
                                                                    enabled : "{/enabled/IfAllowed}"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : iomy.widgets.RequiredLabel("Stream Password"),
                                                            visible : "{/visible/IfStreamAuthSelected}",
                                                            fields: [
                                                                new sap.m.Input({
                                                                    value : "{/fields/streamPassword}",
                                                                    enabled : "{/enabled/IfAllowed}",
                                                                    type : sap.m.InputType.Password
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
															label : "Disable PTZ Controls",
															fields: [
																new sap.m.CheckBox({
                                                                    enabled : "{/enabled/IfAllowed}",
                                                                    selected : "{/fields/ptzDisabled}",
                                                                })
															]
														}),
														new sap.ui.layout.form.FormElement({
															label: "",
															fields: [
																new sap.m.Button (oView.createId("ButtonSubmit"), {
																	text: "Update",
																	type: sap.m.ButtonType.Accept,
                                                                    enabled : "{/enabled/IfAllowed}",
                                                                    press : function () {
                                                                        oController.SaveStreamSettings();
                                                                    }
																}),
																new sap.m.Button (oView.createId("ButtonCancel"), {
																	text: "Cancel",
																	type: sap.m.ButtonType.Reject,
                                                                    enabled : "{/enabled/Always}",
                                                                    
                                                                    press : function () {
                                                                        oController.LoadStreamSettings();
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
                })
            ]
        }).addStyleClass("MainBackground");
    }
});