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

sap.ui.jsview("pages.staging.user.NewUser", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.UserSettings
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.user.NewUser";
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
					sections : [
						IomyRe.widgets.UserForm(oController, "Login", "LoginBlock", "LoginBlock_Form", true , "Login Details"),
						IomyRe.widgets.UserForm(oController, "DBAuth", "DBAuthBlock", "DBAuthBlock_Form", true , "Database Authentication"),
						IomyRe.widgets.UserForm(oController, "Info", "InfoBlock", "InfoBlock_Form", true , "Information"),
						IomyRe.widgets.UserForm(oController, "Address", "AddrBlock", "AddrBlock_Form", true , "Address"),					
						IomyRe.widgets.UserForm(oController, "Premise", "PremPermBlock", "PremPermBlock_Form", true , "Premise Permissions"),					
						IomyRe.widgets.UserForm(oController, "Room", "RoomPermBlock", "RoomPermBlock_Form", true , "Room Permissions"),					
					]
					
				}).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
	}
});