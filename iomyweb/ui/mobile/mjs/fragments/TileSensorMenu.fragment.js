/*
Title: Edit Thing/Item Page (UI5 Controller)
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
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

sap.ui.jsfragment("mjs.fragments.TileSensorMenu", {
	
	createContent: function( oController ) {
		
		//--------------------------------------------//
		//-- 1.0 - CREATE UI5 IDS FOR UI5 OBJECTS   --//
		//--------------------------------------------//
		var sID_Menu			= this.createId( "Menu" );
		var sID_TimeRB			= this.createId( "TimeRB" );
		var sID_FilterRB		= this.createId( "FilterRB" );
		
		
		//--------------------------------------------//
		//-- 2.0 - ADD TO THE REMOVAL LIST          --//
		//--------------------------------------------//
		oController.aElementsToDestroy.push( sID_Menu );
		oController.aElementsToDestroy.push( sID_TimeRB );
		oController.aElementsToDestroy.push( sID_FilterRB );
		
		
		//--------------------------------------------//
		//-- 3.0 - CREATE THE TILE SENSOR MENU      --//
		//--------------------------------------------//
		var oTileSensorMenu = new sap.m.ViewSettingsDialog( sID_Menu, {
			"title":		"Sensor",
			"customTabs":	[
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
								}).addStyleClass("RadioHover")
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
								}).addStyleClass("RadioHover")
							]
						}).addStyleClass("")
					]
				}),
				//--------------------------------//
				//-- ANALYTICS TAB				--//
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
											"text":		'NOTE: The analytical buttons below will use the "Time Period" and the "Filter" values setup in the previous tabs in this Menu.'
										}).addStyleClass("MarBottom20px BG_white PadAll8px BorderRad7px"),
										new sap.m.Button({
											"enabled":	false,
											"text":		"Create Table",
											//"type":		"Accept",
											"width":	"210px",
											"icon":		"sap-icon://table-chart"
											//"icon":		"sap-icon://GoogleMaterial/adb"
										}),
										new sap.m.Button({
											"enabled":	false,
											"text":		"Create Line Graph",
											//"type":		"Accept",
											"width":	"210px",
											"icon":		"sap-icon://line-chart"
										}),
										new sap.m.Button({
											"enabled":	false,
											"text":		"Create Bar Graph",
											//"type":		"Accept", 
											"width":	"210px",
											"icon":		"sap-icon://vertical-bar-chart-2"
										}),
										new sap.m.Button({
											"enabled":	false,
											"text":		"Create Pie Graph",
											//"type":		"Accept",
											"width":	"210px",
											"icon":		"sap-icon://pie-chart"
										})
									]
								}).addStyleClass("TextCenter")
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