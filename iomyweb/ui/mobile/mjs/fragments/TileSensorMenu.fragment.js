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
								}).addStyleClass("")
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
								}).addStyleClass("")
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