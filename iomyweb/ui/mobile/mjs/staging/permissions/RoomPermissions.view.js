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

sap.ui.jsview("mjs.staging.permissions.RoomPermissions", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.RoomPermissions
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.permissions.RoomPermissions";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.RoomPermissions
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("page"),{
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content : [
                //-- Navigational Header --//
				IOMy.widgets.getNavigationalSubHeader("Room Permissions", "sap-icon://GoogleMaterial/settings", me),
				new sap.m.Panel( me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content : [
						new sap.m.List ({
							headerText : "User",
							items : [
								//-- Select User --//
								new sap.m.CustomListItem ({
									content : [
										new sap.m.Select ({
											width: "100%",
											items : [
												new sap.ui.core.Item({
													key: "utest1",
													text: "Test User 1",
												}),
												new sap.ui.core.Item({
													key: "utest2",
													text: "Test User 2",
												}),
											]
										}).addStyleClass(""),
									]
								}),
							] //-- Items End --//
						}).addStyleClass("ListMenuHeader"),
						new sap.m.List ({
							headerText : "Premise",
							items : [
								//-- Select Premise--//
								new sap.m.CustomListItem ({
									content : [
										new sap.m.Select ({
											width: "100%",
											items : [
												new sap.ui.core.Item({
													key: "ptest1",
													text: "Test Premise 1",
												}),
												new sap.ui.core.Item({
													key: "ptest2",
													text: "Test Premise 2",
												}),
											]
										}).addStyleClass(""),
									]
								}).addStyleClass(""),
							] //-- Items End --//
						}).addStyleClass("ListMenuHeader"),
						new sap.m.List ({
							headerText : "Permissions",
							items : [
								new sap.m.CustomListItem({
									content : [
										new sap.m.VBox({
											items : [
												new sap.m.Label({
													text: "Allow this user access?"
												}),
												new sap.m.HBox({
													items: [
														new sap.m.RadioButton ({
															groupName: "GroupG",
															text: "Yes",
															selected: true
														}),
														new sap.m.RadioButton ({
															groupName: "GroupG",
															text: "No"
														})
													]
												})
											]
										}).addStyleClass(""),
										new sap.m.VBox({
											items : [
												new sap.m.Label({
													text: "Allow this user to view room details?"
												}),
												new sap.m.HBox({
													items: [
														new sap.m.RadioButton ({
															groupName: "GroupH",
															text: "Yes",
															selected: true
														}),
														new sap.m.RadioButton ({
															groupName: "GroupH",
															text: "No"
														})
													]
												})
											]
										}).addStyleClass(""),
										new sap.m.VBox({
											items : [
												new sap.m.Label({
													text: "Allow this user to modify room?"
												}),
												new sap.m.HBox({
													items: [
														new sap.m.RadioButton ({
															groupName: "GroupI",
															text: "Yes",
															selected: true
														}),
														new sap.m.RadioButton ({
															groupName: "GroupI",
															text: "No"
														})
													]
												})
											]
										}).addStyleClass(""),
										new sap.m.VBox({
											items : [
												new sap.m.Label({
													text: "Allow this user to manage devices?"
												}),
												new sap.m.HBox({
													items: [
														new sap.m.RadioButton ({
															groupName: "GroupJ",
															text: "Yes",
															selected: true
														}),
														new sap.m.RadioButton ({
															groupName: "GroupJ",
															text: "No"
														})
													]
												})
											]
										}).addStyleClass(""),
										new sap.m.VBox({
											items : [
												new sap.m.Label({
													text: "Allow this user to manage rooms?"
												}),
												new sap.m.HBox({
													items: [
														new sap.m.RadioButton ({
															groupName: "GroupK",
															text: "Yes",
															selected: true
														}),
														new sap.m.RadioButton ({
															groupName: "GroupK",
															text: "No"
														})
													]
												})
											]
										}).addStyleClass(""),
									]
								}),
							] //-- Items End --//
						}).addStyleClass("ListMenuHeader PermissionPadding"),
						new sap.m.List ({
							headerText : "Apply Permissions To",
							items : [
								new sap.m.CustomListItem({
									content : [
										new sap.m.VBox({
											items : [
												new sap.m.CheckBox ({
													text: "Test Room 1"
												}),
												new sap.m.CheckBox ({
													text: "Test Room 2"
												}),
												new sap.m.CheckBox ({
													text: "Test Room 3"
												}),
											]
										}).addStyleClass(""),
									]
								}),
							] //-- Items End --//
						}).addStyleClass("ListMenuHeader BorderBottom"),
						new sap.m.List ({
							items: [
								new sap.m.InputListItem ({
									content : [
										//-- Column 2 for Current Temp Row --//
										new sap.m.Button({
											text : "Apply",
											width: "100px",
											press : function () {
												IOMy.common.NavigationChangePage("pStagingHome", {}, false);
											}
										}).addStyleClass("")
									]
								}).addStyleClass("textaligncenter ListApply ")
							]
						})
					] //-- Panel End--//
                }).addStyleClass("PadBottom10px UserInputForm")
            ] //-- Page End --//
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}

});