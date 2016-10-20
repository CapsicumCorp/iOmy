/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.EditUser", {
	functions : IOMy.functions,
	
    aLinkInfo : [],
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.EditUser
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function() {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				
				//====================================================//
                //== 2.1 - Declare items to go on this page			==//
                //====================================================//
                me.aLinkInfo = [
                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsUserInfo", {} );
                        },
                        "label" : "EDIT USER INFO",
                        "rhsInfo" : []
                    },

                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsUserAddress", {} );
                        },
                        "label" : "EDIT USER ADDRESS",
                        "rhsInfo" : []
                    },
                    {
                        "icon" : "resources/images/settingslogo.png",
                        "press" : function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsUserPassword", {} );
                        },
                        "label" : "CHANGE PASSWORD",
                        "rhsInfo" : []
                    },
                ];
                
                var oVertBox = new sap.m.VBox({
                    items: []
                });
                
                var mInfo;
                for (var i = 0; i < me.aLinkInfo.length; i++) {
                    mInfo = me.aLinkInfo[i];
                    oVertBox.addItem(
                        new sap.m.HBox({
                            items: [
                                new sap.m.Image({
                                    src : mInfo.icon,
                                    densityAware: false,
                                    press : mInfo.press
                                }).addStyleClass("minwidth50px PadTop5px"),
                                new sap.m.Link({
                                    text : mInfo.label,
                                    press : mInfo.press
                                }).addStyleClass("Font-RobotoCondensed Font-Medium PadLeft6px Setting-ItemLabel-NoBorder TextLeft Text_grey_20 width100Percent")
                            ]
                        }).addStyleClass("MainPanelElement MarTop3px PadTop8px PadBottom8px")
                    );
                }
                
                if (me.byId("userPanel") !== undefined)
                    me.byId("userPanel").destroy();
                
                var oPanel = new sap.m.Panel(me.createId("userPanel"), {
                	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				}).addStyleClass("PanelNoPadding");

                thisView.byId("EditUserPage").addContent(oPanel);
                me.aLinkInfo = []; // Clear the link information array
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.EditUser
*/
//	onBeforeRendering: function() {
//		
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.EditUser
*/
//	onAfterRendering: function() {
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.EditUser
*/
//	onExit: function() {
//
//	}
	
});
