/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.SettingsOverview", {
    
    /**
     * Information about different links to the settings pages are here in an
     * array of maps/associative arrays.
     */
    aLinkInfo : [],
    
    oNavMenu:	false,			//-- OBJECT:		Used to hold the NavMenu Popup --//
    
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.SettingsOverview
*/
	onInit: function() {
        var me = this;
        var thisView = me.getView();
        
        thisView.addEventDelegate({
            onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				
				
            	
                IOMy.functions.destroyItemsByIdFromView(me, ["panel"]);
                
                var oVertBox = new sap.m.VBox({
                    items: []
                });
                
                me.aLinkInfo = [
                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsPremiseList", {} );
                        },
                        "label" : "Premise & Hubs",
                        "rhsInfo" : [],
                        "sDescription":	"Configuration settings for Premises and Hubs"
                    },
                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsDeviceList", {} );
                        },
                        "label" : "Device Configuration",
                        "rhsInfo" : [],
                        "sDescription":	"Add Device, Rename Device, Change a Device's Room, etc"
                    },
                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsUser", {} );
                        },
                        "label" : "User Account",
                        "rhsInfo" : [],
                        "sDescription":	"Edit Password, Change Contact Details/Address, etc"
                    },
                ];
                
                var mInfo;
                for (var i = 0; i < me.aLinkInfo.length; i++) {
                    mInfo = me.aLinkInfo[i];
                    oVertBox.addItem(
                        new sap.m.HBox({
                            items: [
//                                new sap.m.Image({
//                                    src : mInfo.icon,
//                                    densityAware: false,
//                                    press : mInfo.press
//                                }).addStyleClass("PadTop5px"),
								new sap.m.Link({
									text : mInfo.label,
									press : mInfo.press
								}).addStyleClass("Font-RobotoCondensed Font-Medium PadLeft6px Setting-ItemLabel TextLeft Text_grey_20 width140px "),
//                                new sap.m.VBox({
//                                    items: []
//                                }).addStyleClass("Setting-ItemAjaxBox minwidth100px"),
								new sap.m.FlexBox({
									direction:		"Column",
									alignItems:		"Start",
									justifyContent:	"Center",
									items:[
										new sap.m.Text({
											text:	mInfo.sDescription
										}).addStyleClass("PadBottom3px")
									]
								}).addStyleClass("PadLeft3px maxwidth800px minwidth150px")
                            ]
                        }).addStyleClass("MainPanelElement MarTop3px width100Percent PadTop8px PadBottom8px")
                    );
                }
                
                //--------------------------------------------//
                //-- 2.5 - CREATE THE PANEL					--//
                //--------------------------------------------//
                var oPanel = new sap.m.Panel(me.createId("panel"),{
                	backgroundDesign: "Transparent",
                    content: [oVertBox] //-- End of Panel Content --//
                }).addStyleClass("PanelNoPadding");

                thisView.byId("page").addContent(oPanel);
                
                me.aLinkInfo = []; // Clear the link info.
            }
        })
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.SettingsOverview
*/
//	onBeforeRendering: function() {
//		
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.SettingsOverview
*/
//	onAfterRendering: function() {
//		
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.SettingsOverview
*/
//	onExit: function() {
//
//	},
	
	

	
	

});