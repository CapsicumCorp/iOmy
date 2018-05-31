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

sap.ui.jsview("pages.user.UserSettings", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.user.UserSettings";
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
			title: "User Settings",
			header : iomy.widgets.getToolPageHeader(oController),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				new sap.uxap.ObjectPageLayout (oView.createId("ObjectPageLayout"), {
					isObjectIconAlwaysVisible: true,
					enableLazyLoading: true,
					showTitleinHeaderContent: true,
					headerTitle : new sap.uxap.ObjectPageHeader (oView.createId("PageHeader"), {
						objectTitle: "",
						objectShape: sap.uxap.ObjectPageHeaderPictureShape.Circle,
						objectSubtitle: "",
					}),
					sections : [
						new sap.uxap.ObjectPageSection(oView.createId("Password"), {
							showTitle: false,
							title: "Password",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("PasswordBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("PasswordBlock_Form"),{
											editable: false,
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
													new sap.m.Title ({
														text: "Password"
													}),
													new sap.m.ToolbarSpacer ({}),
													new sap.m.Button ( oView.createId("PasswordBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
															oController.ToggleButtonsAndView( oController, "EditPassword" );
														}
													}),
													new sap.m.Button( oView.createId("PasswordBlock_BtnSave"), {
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															oController.UpdateUserPassword();
														}
													}),
													new sap.m.Button( oView.createId("PasswordBlock_BtnCancel"), {
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
                                                            oController.RefreshModel(oController, {});
															oController.ToggleButtonsAndView( oController, "ShowPassword" );
														}
													})
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
											
											]
										})
									]
								})
							]
						}),
						new sap.uxap.ObjectPageSection(oView.createId("Info"), {
							showTitle: false,
							title: "Information",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("InfoBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("InfoBlock_Form"),{
											editable: false,
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
													new sap.m.Title ({
														text: "Information",
													}),
													new sap.m.ToolbarSpacer ({}),
													new sap.m.Button ( oView.createId("InfoBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
															oController.ToggleButtonsAndView( oController, "EditInfo" );
														}
													}),
													new sap.m.Button( oView.createId("InfoBlock_BtnSave"), {
														enabled : "{/enabled/Always}",
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															oController.UpdateUserInfoValues( oController );
															//oController.ToggleButtonsAndView( oController, "ShowInfo" );
														}
													}),
													new sap.m.Button( oView.createId("InfoBlock_BtnCancel"), {
                                                        enabled : "{/enabled/Always}",
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
															oController.RefreshModel( oController, {} );
															oController.ToggleButtonsAndView( oController, "ShowInfo" );
														}
													})
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
											
											]
										})
									]
								})
							]
						}),
						new sap.uxap.ObjectPageSection(oView.createId("Address"), {
							showTitle: false,
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("AddrBlock"), {
									title: "Address",
									blocks : [ 
										new sap.ui.layout.form.Form( oView.createId("AddrBlock_Form"),{
											editable: false,
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
													new sap.m.Title ({
														text: "Address",
													}),
													new sap.m.ToolbarSpacer ({}),
													new sap.m.Button ( oView.createId("AddrBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
															oController.ToggleButtonsAndView( oController, "EditAddress" );
														}
													}),
													new sap.m.Button( oView.createId("AddrBlock_BtnSave"), {
														enabled : "{/enabled/Always}",
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															oController.UpdateUserAddressValues( oController );
														}
													}),
													new sap.m.Button( oView.createId("AddrBlock_BtnCancel"), {
														enabled : "{/enabled/Always}",
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
															oController.RefreshModel( oController, {} );
															oController.ToggleButtonsAndView( oController, "ShowAddress" );
														}
													})
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
											
											]
										})
									]										
								})
							]
						}),
						new sap.uxap.ObjectPageSection(oView.createId("PremPermissions"), {
							showTitle: false,
							title: "Premise Permissions",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("PremPBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("PremPBlock_Form"),{
											editable: false,
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
													new sap.m.Title ({
														text: "Premise Permissions",
													}),
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
                                                
											]
										})
									]									
									
								})
							]
						}),
						new sap.uxap.ObjectPageSection(oView.createId("UserRoomPermissions"), {
							showTitle: false,
							title: "Room Permissions",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("UserRoomPermissionsBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("UserRoomPermissionsBlock_Form"),{
											editable: false,
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
													new sap.m.Title ({
														text: "Room Permissions",
													}),
													new sap.m.ToolbarSpacer ({}),
													new sap.m.Button ( oView.createId("UserRoomPermissionsBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
                                                            oController.FetchUserRoomPermissions();
														}
													}),
													new sap.m.Button( oView.createId("UserRoomPermissionsBlock_BtnSave"), {
														enabled : "{/enabled/Always}",
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															oController.UpdateUserRoomPermissions();
														}
													}),
													new sap.m.Button( oView.createId("UserRoomPermissionsBlock_BtnCancel"), {
														enabled : "{/enabled/Always}",
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
															oController.RefreshModel( oController, {} );
															oController.ToggleButtonsAndView( oController, "ShowRoomPermissions" );
														}
													})
												]
											}).addStyleClass("MarBottom1d0Rem"),
											formContainers : [
											
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