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

sap.ui.jsview("pages.staging.user.UserForm", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.user.UserForm";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.UserSettings
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "User Settings",
			header : IomyRe.widgets.getToolPageHeader(oController),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				new sap.uxap.ObjectPageLayout (oView.createId("ObjectPageLayout"), {
					isObjectIconAlwaysVisible: true,
					enableLazyLoading: true,
					showTitleinHeaderContent: true,
					headerTitle : oController.getObjectPageTitle(oController),
					sections : [
						IomyRe.widgets.UserForm(oController, "Login", "LoginBlock", "LoginBlock_Form", true , "Login Details"),
						IomyRe.widgets.UserForm(oController, "DBAuth", "DBAuthBlock", "DBAuthBlock_Form", true , "Database Authentication"),
						IomyRe.widgets.UserForm(oController, "Info", "InfoBlock", "InfoBlock_Form", false , "Information"),
						IomyRe.widgets.UserForm(oController, "Address", "AddrBlock", "AddrBlock_Form", false , "Address"),
						new sap.uxap.ObjectPageSection(oView.createId("PremPermissions"), {
							showTitle: false,
							title: "Premise Permissions",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("PremPermBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("PremPermBlock_Form"),{
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
													new sap.m.ToolbarSpacer ({}),
													new sap.m.Button ( oView.createId("PremPermBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
															oController.ToggleButtonsAndView( oController, "EditPremPermissions" );
														}
													}),
													new sap.m.Button( oView.createId("PremPermBlock_BtnSave"), {
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															//oController.UpdateValues( oController );
															oController.ToggleButtonsAndView( oController, "ShowPremPermissions" );
														}
													}),
													new sap.m.Button( oView.createId("PremPermBlock_BtnCancel"), {
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
															//oController.RefreshModel( oController, {} );
															oController.ToggleButtonsAndView( oController, "ShowPremPermissions" );
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
						new sap.uxap.ObjectPageSection(oView.createId("RoomPerm"), {
							showTitle: false,
							title: "Room Permissions",
							subSections : [
								new sap.uxap.ObjectPageSubSection(oView.createId("RoomPermBlock"), {
									blocks : [
										new sap.ui.layout.form.Form( oView.createId("RoomPermBlock_Form"),{
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
													new sap.m.Button ( oView.createId("RoomPermBlock_BtnEdit"), {
														icon:    "sap-icon://edit",
														type:    "Transparent",
														press:   function() {
															oController.ToggleButtonsAndView( oController, "EditRoomPermissions" );
														}
													}),
													new sap.m.Button( oView.createId("RoomPermBlock_BtnSave"), {
														icon:    "sap-icon://save",
														visible: false,
														press:   function( oEvent ) {
															//oController.UpdateValues( oController );
															oController.ToggleButtonsAndView( oController, "ShowRoomPermissions" );
														}
													}),
													new sap.m.Button( oView.createId("RoomPermBlock_BtnCancel"), {
														icon:    "sap-icon://cancel",
														visible: false,
														press:   function( oEvent ) {
															//oController.RefreshModel( oController, {} );
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