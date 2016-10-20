/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.premise.DynamicToolbar", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.premise.DynamicToolbar
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function() {
				//-- Debugging --//
				if (me.byId("verticalBox") !== undefined)
                    me.byId("verticalBox").destroy();
                
                var oToolHeader = new sap.tnt.ToolHeader({
                    content : [
                        new sap.m.Button({
                            icon: "sap-icon://edit",
                            text: 'Device',
                            type: sap.m.ButtonType.Transparent
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://edit",
                            text: 'IO',
                            type: sap.m.ButtonType.Transparent
                        }),
                        new sap.m.Button({
                            icon: "sap-icon://edit",
                            text: 'IOPort',
                            type: sap.m.ButtonType.Transparent
                        })
                    ]
                });

                // Create the main placeholder
                var oVertBox = new sap.m.VBox(me.createId("verticalBox"), {
                    items: [oToolHeader]
                });
                
				// Destroy the old panel if it exists.
                if (me.byId("panel") !== undefined) 
                    me.byId("panel").destroy();
                var oPanel = new sap.m.Panel(me.createId("panel"), {
                    content: [oVertBox] //-- End of Panel Content --//
                }).addStyleClass("height100Percent PanelNoPadding MarTop0px");

                thisView.byId("page").addContent(oPanel);
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.premise.DynamicToolbar
*/
//	onBeforeRendering: function() {},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.premise.DynamicToolbar
*/
//	onAfterRendering: function() {
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.premise.DynamicToolbar
*/
//	onExit: function() {
//
//	}
	
});
