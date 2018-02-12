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

sap.ui.jsview("pages.Tile", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.Tile
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.Tile";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.Tile
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
		
		return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Device Tile View",
			header : iomy.widgets.getToolPageHeader( oController ),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents: [ 
			iomy.widgets.DeviceToolbar(oController, "Tile View"),
				new sap.ui.layout.HorizontalLayout ({
					allowWrapping : true,
					content: [
						new sap.m.GenericTile({
							header: "Toggle State",
							frameType: "OneByOne",
							Size: "Auto",
							tileContent: [ 
								new sap.m.TileContent ({
									content: [
										new sap.m.NumericContent ({
											value: "On",
										})
									]
								})
							]
						}).addStyleClass("MarAll0d5Rem"),
						new sap.m.GenericTile({
							header: "kW Use",
							frameType: "OneByOne",
							Size: "Auto",
							tileContent: [ 
								new sap.m.TileContent ({
									unit: "kW",
									content: [
										new sap.m.NumericContent ({
											value: "0.088",
										})
									]
								})
							]
						}).addStyleClass("MarAll0d5Rem"),
						new sap.m.GenericTile({
							header: "Volts",
							frameType: "OneByOne",
							Size: "Auto",
							tileContent: [ 
								new sap.m.TileContent ({
									unit: "V",
									content: [
										new sap.m.NumericContent ({
											value: "239",
										})
									]
								})
							]
						}).addStyleClass("MarAll0d5Rem"),
						new sap.m.GenericTile({
							header: "Amps",
							frameType: "OneByOne",
							Size: "Auto",
							tileContent: [ 
								new sap.m.TileContent ({
									unit: "AMP",
									content: [
										new sap.m.NumericContent ({
											value: "0.377",
										})
									]
								})
							]
						}).addStyleClass("MarAll0d5Rem"),
						new sap.m.GenericTile({
							header: "Total kWh Use",
							frameType: "OneByOne",
							Size: "Auto",
							tileContent: [ 
								new sap.m.TileContent ({
									unit: "kWh",
									content: [
										new sap.m.NumericContent ({
											value: "0",
										})
									]
								})
							]
						}).addStyleClass("MarAll0d5Rem"),
					],
				}).addStyleClass("PadAll0d75Rem"),
			],
		}).addStyleClass("MainBackground");
        return new sap.m.Page( oView.createId("page"), {
			title: "Home",
			content: [ 
				
			],
			footer : new sap.m.Bar ({
				contentLeft : [
						new sap.m.Button ({
							text: "Help",
							press : function () {
								iomy.common.NavigationChangePage( "pJobSearch", {} , false);
							}
						}),

					],
				contentRight : [
						new sap.m.Image ({
							layoutData : new sap.m.OverflowToolbarLayoutData({
								priority : sap.m.OverflowToolbarPriority.NeverOverflow
							}),
							width: "120px",
							height: "28px",
							src: "../iomy_redesign/resources/images/capcorplogo.png",
						}),
					]
			}),
		}).setShowHeader(false).addStyleClass("MainBackground");
	}

});