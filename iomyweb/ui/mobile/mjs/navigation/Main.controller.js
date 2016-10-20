/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.navigation.Main", {
	functions : IOMy.functions,
	
	
	aTasks:				{ "Low":[], "Medium":[], "High":[] },			//-- ARRAY:			Used to store the list of tasks that are used to update values on the page --//
	dLastAjaxUpdate:	null,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.navigation.Main
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function() {
                me.RefreshTasksForUI();
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.navigation.Main
*/
	onBeforeRendering: function() {
		var me = this;
		var thisView = me.getView();


		//-- DEBUGGING --//
		var dDate = new Date();
		var iDate = dDate.getTime() / 1000
		console.log("NavMain BeforeRender: "+iDate);
		//====================================================//
		//== 2.1 - Declare items to go on this page			==//
		//====================================================//
	
		var oPremise = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://home",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pPremiseOverview", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"PREMISES",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pPremiseOverview", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.FlexBox({
					direction:		"Column",
					alignItems:		"Start",
					justifyContent:	"Center",
					items:[
						//-- ITEM 1 --//
						new sap.m.HBox( me.createId("oDeviceOverview_Data_Devices"), {
							items : [
								new sap.m.Text( me.createId('oDeviceOverview_Data_DevicesCount'), {
									textAlign:"Center",
									text: IOMy.functions.getNumberOfDevices()
								}).addStyleClass("NavMain_Data_Value_2DigitCircle NavMain-DataValue_darkgreen"),
								new sap.m.Text({
									text:"Devices"
								}).addStyleClass("NavMain_Data_ValueNormal PadLeft4px PadTop5px")
							]
						}).addStyleClass("MarLeft5px PadTop3px PadBottom3px"),
						
						//-- ITEM 2 --//
						new sap.m.HBox( me.createId("oDeviceOverview_Data_Rooms"), {
							items : [
								new sap.m.Text( me.createId('oDeviceOverview_Data_RoomsCount'), {
									textAlign:"Center",
									text: IOMy.functions.getNumberOfRooms()
								}).addStyleClass("NavMain_Data_Value_2DigitCircle NavMain-DataValue_darkgreen"),
								new sap.m.Text({
									text:"Rooms"
								}).addStyleClass("NavMain_Data_ValueNormal PadLeft4px PadTop5px")
							]
						}).addStyleClass("MarLeft5px PadTop3px PadBottom3px")
					]
				}).addStyleClass("NavMain-ItemAjaxBox NavMain-DividingBorder minwidth130px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");
		
		thisView.byId("Panel").addContent(oPremise).addStyleClass("MarTop8px");
		
		var oHealth = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://nutrition-activity",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pHealth", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"HEALTH",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pHealth", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.FlexBox({
					direction:		"Column",
					alignItems:		"Start",
					justifyContent:	"Center",
					items:[
						new sap.m.HBox( me.createId("oDeviceOverview_Data_HealthUser"), {
							items : [
								new sap.m.Text( me.createId('oDeviceOverview_Data_HealthUserCount'), {
									textAlign:"Center",
									text: "1"
								}).addStyleClass("NavMain_Data_Value_2DigitCircle NavMain-DataValue_darkgreen"),
								new sap.m.Text({
									text:"User"
								}).addStyleClass("NavMain_Data_ValueNormal PadLeft4px PadTop5px")
							]
						}).addStyleClass("MarLeft5px PadTop3px PadBottom3px")
					]
				}).addStyleClass("NavMain-ItemAjaxBox NavMain-DividingBorder minwidth130px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");
		

		thisView.byId("Panel").addContent(oHealth);
		
		//------------------------------------//
		//-- SECURITY 						--//
		//------------------------------------//
		
		var oSecurity = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://locked",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pSecurity", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"SECURITY",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pSecurity", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.FlexBox({
					direction:		"Column",
					alignItems:		"Start",
					justifyContent:	"Center",
					items:[
						new sap.m.Text({
							text : "No Warnings"
						}).addStyleClass("TextSizeMedium")
					]
				}).addStyleClass("NavMain-ItemAjaxBox NavMain-DividingBorder minwidth130px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");
		
		thisView.byId("Panel").addContent(oSecurity);
        
        //------------------------------------//
		//-- ACTIVITY 						--//
		//------------------------------------//
        var oActivity = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://document-text",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pActivity", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"ACTIVITY",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pActivity", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.FlexBox({
					direction:		"Column",
					alignItems:		"Start",
					justifyContent:	"Center",
					items:[
						new sap.m.Text({
							text : "No Warnings"
						}).addStyleClass("TextSizeMedium")
					]
				}).addStyleClass("NavMain-ItemAjaxBox NavMain-DividingBorder minwidth130px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");
		
		thisView.byId("Panel").addContent(oActivity);
        
		
		//------------------------------------//
		//-- SETTINGS						--//
		//------------------------------------//

		var oSettings = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://action-settings",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pSettingsOverview", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"SETTINGS",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pSettingsOverview", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.VBox({
					items:[]
				}).addStyleClass("NavMain-ItemAjaxBox NavMain-DividingBorder minwidth130px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");

		thisView.byId("Panel").addContent(oSettings);
        
        //------------------------------------//
		//-- SWITCH USER					--//
		//------------------------------------//

		var oSwitchUser = new sap.m.HBox({
			items: [
				//-- HBox that has the OnPress Event --//
				new sap.m.HBox({
					items:[
						//-- NAVIGATIONAL ITEM ICON --//
						new sap.ui.core.Icon({
							src :	"sap-icon://log",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pForceSwitchUser", {} );
							}
						}).addStyleClass("NavMain-ItemIcon"),
						
						//-- NAVIGATIONAL ITEM LABEL --//
						new sap.m.Link({
							text:	"LOG OUT",
							//-- ONPRESS EVENT --//
							press : function (oControlEvent) {
								IOMy.common.NavigationChangePage( "pForceSwitchUser", {} );
							}
						}).addStyleClass("Font-RobotoCondensed TextSize18px PadLeft6px NavMain-ItemLabel TextLeft Text_grey_20 width120px")
						//-- END LABEL --//
					]
				}),
				//-- VBox that gets the AJAX data loaded into it --//
				new sap.m.VBox({
					items:[]
				}).addStyleClass("NavMain-ItemAjaxBox minwidth100px PadLeft5px")
			]
		}).addStyleClass("MainPanelElement MarTop3px PadLeft3px PadRight3px PadTop8px PadBottom8px minheight70px width90Percent");
		
		
		thisView.byId("Panel").addContent(oSwitchUser);
        
        me.dLastAjaxUpdate = Date();
		
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.navigation.Main
*/
//	onAfterRendering: function() {
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.navigation.Main
*/
//	onExit: function() {
//
//	}

	RefreshTasksForUI: function() {
		//-- 1.0 - Initialisation --//
		var me = this;
		var thisView = me.getView();
		
		console.log("NavMain RefreshTasks");
		
		//-- 2.0 - Execute Tasks --//
		if( me.dLastAjaxUpdate!==null) {
			thisView.byId('oDeviceOverview_Data_DevicesCount').setText( IOMy.functions.getNumberOfDevices() );
			thisView.byId('oDeviceOverview_Data_RoomsCount').setText( IOMy.functions.getNumberOfRooms() );
			me.dLastAjaxUpdate = Date();
		}

	}
	
});
