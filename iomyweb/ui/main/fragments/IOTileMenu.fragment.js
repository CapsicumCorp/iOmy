/*
Title: Edit Thing/Item Page (UI5 Controller)
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: A fragment for the IO Menu
Copyright: Capsicum Corporation 2016, 2017

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

sap.ui.jsfragment("fragments.IOTileMenu", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - CREATE UI5 IDS FOR UI5 OBJECTS   --//
		//--------------------------------------------//
		var sID_Menu			= this.createId( "Menu" );
		var sID_AnalyticsRB		= this.createId( "AnalyticsRB" );
		var sID_TimeRB			= this.createId( "TimeRB" );
		var sID_FilterRB		= this.createId( "FilterRB" );
		
		
		//--------------------------------------------//
		//-- 2.0 - ADD TO THE REMOVAL LIST          --//
		//--------------------------------------------//
		oController.aElementsToDestroy.push( sID_Menu );
		oController.aElementsToDestroy.push( sID_TimeRB );
		oController.aElementsToDestroy.push( sID_FilterRB );
		
		
		//-------------------------------------------------------------//
		//-- 3.0 - GET IO TYPE ENUMERATION AND ENABLE CERTAIN GRAPHS --//
		//-------------------------------------------------------------//
		var iIOTypeEnum = IomyRe.common.ThingList["_"+oController.iCurrentThing].IO["_"+oController.iSelectedIOId].DataTypeEnum;
		var bLineGraphEnabled	= iIOTypeEnum === 0;
		var bBarGraphEnabled	= iIOTypeEnum === 2;
		
		//--------------------------------------------//
		//-- 4.0 - CREATE THE TILE SENSOR MENU      --//
		//--------------------------------------------//
		var oTileSensorMenu = new sap.m.ViewSettingsDialog( sID_Menu, {
			"title":		"Sensor",
			"confirm": function() {
				// Selected index of the analytical options radio button group.
				var iSelectedIndex = sap.ui.getCore().byId(sID_AnalyticsRB).getSelectedIndex();
				
				// If a graph option is selected, we need to direct the user to the selected graph page.
				if (oController.bDrawGraph) {
					// If the line graph option was selected, draw one
					if (iSelectedIndex === 2) {
						IomyRe.common.NavigationChangePage("pGraphLine", { "IO_ID" : oController.iSelectedIOId, "ThingId" : oController.iCurrentThing, "TimePeriod" : oController.sSelectedTimePeriod });
						
					// If the bar graph option was selected, draw one
					} else if (iSelectedIndex === 3) {
						IomyRe.common.NavigationChangePage("pGraphBar", { "IO_ID" : oController.iSelectedIOId, "ThingId" : oController.iCurrentThing, "TimePeriod" : oController.sSelectedTimePeriod });
						
					// If the pie graph option was selected, draw one
					} else if (iSelectedIndex === 4) {
						IomyRe.common.NavigationChangePage("pGraphPie", { "IO_ID" : oController.iSelectedIOId, "ThingId" : oController.iCurrentThing });
						
					}
				}
			},
			"customTabs":	[
				//--------------------------------//
				//-- ANALYTICS TAB              --//
				//--------------------------------//
				new sap.m.ViewSettingsCustomTab({
					"icon":		"sap-icon://activate",
					"title":	"Analytics",
					"content":	[
						new sap.m.Panel({
							"backgroundDesign": "Transparent",
							"content": [
								new sap.m.VBox({
									"items": [
										new sap.m.Text({
											"width":	"100%",
											"text":		'NOTE: The analytical options below will use the "Time Period" (except bar and pie graphs) and the "Filter" values setup in the previous tabs in this Menu.'
										}).addStyleClass("MarBottom20px BG_white PadAll8px BorderRad7px"),
										new sap.m.RadioButtonGroup( sID_AnalyticsRB, {
											buttons : [
												new sap.m.RadioButton({
													"tooltip":    "Show tile data",
													"enabled":	true,
													"text":		"Show Data on Tile",
													"width":	"210px",
													"select":	function () {
														oController.bDrawGraph = false;
													}
												}),
												new sap.m.RadioButton({
													"tooltip":    "Create Table",
													"enabled":	false,
													"text":		"Create Table",
													"width":	"210px",
													"select":	function () {
														oController.bDrawGraph = false;
													}
												}),
												new sap.m.RadioButton({
													"tooltip":    "Create Line Graph",
													"enabled":	bLineGraphEnabled,
													"text":		"Create Line Graph",
													"width":	"210px",
													"select":	function () {
														oController.bDrawGraph = true;
													}
												}),
												new sap.m.RadioButton({
													"tooltip":    "Create Bar Graph",
													"enabled":	bBarGraphEnabled,
													"text":		"Create Bar Graph",
													"width":	"210px",
													"select":	function () {
														oController.bDrawGraph = true;
													}
												}),
												new sap.m.RadioButton({
													"tooltip":    "Create Pie Graph",
													"enabled":	bBarGraphEnabled,
													"text":		"Create 6-Hour Pie Graph",
													"width":	"210px",
													"select":	function () {
														oController.bDrawGraph = true;
													}
												})
											]
										}).addStyleClass("iOmyRadioButtons")
									]
								}).addStyleClass("TextCenter")
							]
						}).addStyleClass("")
					]
				}),
				//--------------------------------//
				//-- PERIOD TAB					--//
				//--------------------------------//
				new sap.m.ViewSettingsCustomTab({
					"icon":		"sap-icon://history",
					"title":	"TimePeriod",
					"editable":	true,
					"content":	[
						new sap.m.Panel({
							"backgroundDesign": "Transparent",
							"content": [
								new sap.m.RadioButtonGroup( sID_TimeRB, {
									buttons:	[]
								}).addStyleClass("iOmyRadioButtons")
							]
						})
					]
				}),
				//--------------------------------//
				//-- FILTER TAB					--//
				//--------------------------------//
				new sap.m.ViewSettingsCustomTab({
					"icon":		"sap-icon://filter",
					"title":	"Filter",
					"editable":	true,
					"content":	[
						new sap.m.Panel({
							"backgroundDesign": "Transparent",
							"content": [
								new sap.m.RadioButtonGroup( sID_FilterRB, {
									buttons:	[]
								}).addStyleClass("iOmyRadioButtons")
							]
						}).addStyleClass("")
					]
				})
			]
		}).addStyleClass("TileSensorMenu");
		
		
		//--------------------------------------------//
		//-- RETURN THE MENU POPUP                  --//
		//--------------------------------------------//
		return oTileSensorMenu;
	}
	
});