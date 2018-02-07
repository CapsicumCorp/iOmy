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

sap.ui.jsview("pages.staging.FFMPEG", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.Block
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.FFMPEG";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.Block
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Home",
			header : iomy.widgets.getToolPageHeader( oController ),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [
				new sap.m.ScrollContainer({
					vertical: true,
					horizontal: false,
					height: "100%",
					content : [
						iomy.widgets.DeviceToolbar(oController, "FFMPEG"),
						new sap.m.ScrollContainer({
							vertical: true,
							width: "100%",
							content: [
								new sap.m.VBox ({
									items : [
										new sap.ui.core.HTML({
											preferDOM: true,
										   content: "<iframe height='300px' width='700' scrolling='no' frameborder='0' src='resources/video/test.html'></iframe>"
										}),
									]
								}).addStyleClass("ChildFlexGrow ChildTextCenter"),
							]
						}),
						new sap.m.FlexBox ({
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
							items: [
								new sap.m.VBox ({
									width: "200px",
									items: [
										new sap.m.Button ({
											height: "50px",
											width: "200px",
											text: "^"
										}),
										new sap.m.HBox ({
											items : [
												new sap.m.Button ({
													height: "50px",
													width: "50px",
													text: "<"
												}),
												new sap.m.Button ({
													height: "50px",
													width: "90px",
													text:"Center"
												}).addStyleClass("MarLeft5px MarRight5px"),
												new sap.m.Button ({
													height: "50px",
													width: "50px",
													text: ">"
												}),
											]
										}),
										new sap.m.Button ({
											height: "50px",
											width: "200px",
											text: "v"
										}),
									]
								}).addStyleClass("ElementCenter"),
							]
						})
					]
				})
			],
		}).addStyleClass("MainBackground");
	}
});