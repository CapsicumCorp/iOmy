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

sap.ui.jsview("pages.staging.Login", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.Login
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.Login";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.Login
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
        return new sap.m.Page( oView.createId("page"), {
			title: "Login",
			content: [ 
				new sap.m.Panel( oView.createId("panel"), {
					backgroundDesign: "Transparent",
					content : [ 
						new sap.m.VBox ({
							items : [
								new sap.m.Image ({
									src : "resources/images/logo.png",
									densityAware: false,
								}).addStyleClass("height200px MarTop15px")
							]
						}).addStyleClass("height200px"),
						new sap.m.VBox ({
							items : [
								new sap.m.Input({
									type: "Text",
									placeholder: "Username",
									maxLength: 40,
									width: "200px"
								}).addStyleClass("LoginTextInput"),
								new sap.m.Input({
									type: "Text",
									placeholder: "Password",
									maxLength: 40,
									width: "200px"
								}).addStyleClass("LoginTextInput"),
								new sap.m.Button({
									tooltip: "Login",
									text: "Login",
									type: "Default",
									icon: "sap-icon://accept",
									iconFirst: false,
									width: "200px",
									press : function () {
										IomyRe.common.NavigationChangePage( "pBlock" , {} , false);
									},
								}).addStyleClass("")
							]
						}).addStyleClass("LoginForm"),
					]
				}).addStyleClass("TextCenter") 
			],
			/* footer : Termite.common.getAppFooter() */
		}).setShowHeader(false).addStyleClass("MainBackground");
	}

});