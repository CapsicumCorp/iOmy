/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.devices.DeviceAddManually", {
	api : IOMy.apiphp,	
	common : IOMy.common,
	oData : IOMy.apiodata,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.devices.DeviceAddManually
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//-- Enable/Disable Navigational Forward Button --//
				if( IOMy.common.NavigationForwardPresent()===true ) {
					me.byId("NavSubHead_ForwardBtn").setVisible(true);
				} else {
					me.byId("NavSubHead_ForwardBtn").setVisible(false);
				}
				
				
				if (me.byId("devName") !== undefined)
					me.byId("devName").destroy();
				
				if (me.byId("devType") !== undefined)
					me.byId("devType").destroy();
				
				if (me.byId("verticalBox") !== undefined)
					me.byId("verticalBox").destroy();
				
				var oVertBox = new sap.m.VBox(me.createId("verticalBox"), {
					items: [
						new sap.m.Label({
							text : "Device Name"
						}),
						new sap.m.Input(me.createId("devName"), {}).addStyleClass("width100Percent SettingsTextInput"), 
                        new sap.m.Label({
							text : "Device Type"
						}),
						new sap.m.ComboBox(me.createId("devType"), {
							items : [
								new sap.ui.core.Item({
									text : "Netvox Zigbee Smart Plug",
									key : "8"
								})
							]
						}).addStyleClass("width100Percent SettingsDropdownInput").setValue("Netvox Zigbee Smart Plug").setSelectedKey("8"),
						new sap.m.VBox({
							items : [
								new sap.m.Link({
									text : "Add Device"
								}).addStyleClass("SettingsLinks width25Percent minwidth150px AcceptSubmitButton TextCenter")
							]
						}).addStyleClass("TextCenter MarAll12px MarRight14px")
					]
				}).addStyleClass("height100Percent");
				
				// Destroy the old panel if it exists.
				if (me.byId("panel") !== undefined) 
					me.byId("panel").destroy();
				var oPanel = new sap.m.Panel(me.createId("panel"), {
					backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				}).addStyleClass("height100Percent");

				thisView.byId("page").addContent(oPanel);
			}
		});
	}
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.devices.DeviceAddManually
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.devices.DeviceAddManually
*/
//	onAfterRendering: function() {
//		
//	}
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.devices.DeviceAddManually
*/
//	onExit: function() {
//
//	}

});
