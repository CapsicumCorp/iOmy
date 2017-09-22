/*
Title: Template UI5 View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all Premises and their information in a given
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

sap.ui.jsview("pages.staging.Room", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.Room
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.Room";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.Room
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Room List",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents: [ 
			IomyRe.widgets.DeviceToolbar(oController, "Room List"),
				new sap.m.ScrollContainer ({
					width: "100%",
					height: "100%",
					vertical : true,
					content : [
						new sap.m.List ({
							mode: sap.m.ListMode.None,
							items: [
								new sap.m.GroupHeaderListItem ({
									title: "Freshwater Office"
								}),
								new sap.m.ObjectListItem ({		
									title: "Reception",
									type: "Active",
									number: "3",
									numberUnit: "Devices",
									attributes : [
										new sap.m.ObjectAttribute ({
											text: "link",
											customContent : new sap.m.Link ({
												text: "Toggle Room State"
											})
										}),
										new sap.m.ObjectAttribute ({
											text: "Status: On"
										}),							
									],
									press : function () {
										IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
									},
								}),
								new sap.m.ObjectListItem ({		
									title: "Matthew's Office",
									type: "Active",
									number: "2",
									numberUnit: "Devices",
									attributes : [
										new sap.m.ObjectAttribute ({
											text: "link",
											customContent : new sap.m.Link ({
												text: "Toggle Room State"
											})
										}),
										new sap.m.ObjectAttribute ({
											text: "Status: On"
										}),								
									],
									press : function () {
										IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
									},
								}),
								new sap.m.ObjectListItem ({		
									title: "Back Area",
									type: "Active",
									number: "5",
									numberUnit: "Devices",
									attributes : [
										new sap.m.ObjectAttribute ({
											text: "link",
											customContent : new sap.m.Link ({
												text: "Toggle Room State"
											})
										}),
										new sap.m.ObjectAttribute ({
											text: "Status: On"
										}),								
									],
									press : function () {
										IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
									},
								}),
								new sap.m.ObjectListItem ({		
									title: "Kitchen",
									type: "Active",
									number: "2",
									numberUnit: "Devices",
									attributes : [
										new sap.m.ObjectAttribute ({
											text: "link",
											customContent : new sap.m.Link ({
												text: "Toggle Room State"
											})
										}),
										new sap.m.ObjectAttribute ({
											text: "Status: On"
										}),							
									],
									press : function () {
										IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
									},
								}),
							],
						}).addStyleClass("DevicePage")
					]
				})
			]
		}).addStyleClass("MainBackground");
	}
});