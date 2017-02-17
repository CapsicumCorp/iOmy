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

sap.ui.jsview("mjs.staging.StagingHome", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.StagingHome
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.StagingHome";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.StagingHome
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("page"),{
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content : [
                //-- Navigational Header --//
				IOMy.widgets.getNavigationalSubHeader("Staging Home", "sap-icon://GoogleMaterial/home", me),
				new sap.m.Panel( me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content : [ 
						new sap.m.Table({
							columns : [
								new sap.m.Column({
									header: [
										new sap.m.Label ({
											text : "Device Type"
										})
									]
								})
							],
							items:[
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Device Overview",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pOverviewRe", {}, false);
											}
										})
									]
								}),
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Motion Sensor",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pMotionTemp", {}, false);
											}
										})
									]
								}),
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Door Lock",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pDoorLock", {}, false);
											}
										})
									]
								}),
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Window Sensor",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pWindowSensor", {}, false);
											}
										})
									]
								}),
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Thermostat",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pTestThermostat", {}, false);
											}
										})
									]
								}),
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Bluetooth Scales",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pScales", {}, false);
											}
										})
									]
								}),		
								new sap.m.ColumnListItem({
									cells:[
										new sap.m.Link({
											text:"Quadcopter",
											emphasized : true,
											press : function () {
												IOMy.common.NavigationChangePage("pQuadcopter", {}, false);
											}
										})
									]
								})
							]	
						})
					]
                }).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
            ]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}
});