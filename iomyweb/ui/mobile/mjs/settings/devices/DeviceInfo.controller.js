/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.devices.DeviceInfo", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.devices.DeviceInfo
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				// Collect values parsed from the device list.
                IOMy.common.DeviceSelected = evt.data.device;
				var aDevice = IOMy.common.DeviceSelected;
				var iDeviceID = aDevice.Id;
				var sDeviceName = aDevice.DisplayName;
				
				// Start rendering the page
                
                var oCol1 = new sap.m.VBox({
                    items : [
                        new sap.m.Text({
                            text : sDeviceName
                        }).addStyleClass("TextBold"),
                        new sap.m.Text({
                            text : aDevice.Status === 1 ? "On" : "Off"
                        }).addStyleClass(aDevice.Status === 1 ? "Text_green_17" : "Text_red_15"),
                        new sap.m.Text({
                            text : "Type: "
                        }).addStyleClass("TextBold"),
                        new sap.m.Text({
                            text : aDevice.TypeName
                        }),
                        new sap.m.Text({
                            text : "Port:"
                        }).addStyleClass("TextBold"),
                        new sap.m.Text({
                            text : aDevice.DisplayName
                        }).addStyleClass("MarLeft6px")
                    ]
                }).addStyleClass("width100Percent");
                var oCol2 = new sap.m.VBox({
                    items : [
                        new sap.m.Link({
                            text: "Edit Name",
                            press : function () {
                                IOMy.common.NavigationChangePage("pSettingsEditThing", {device : aDevice});
                            }
                        }).addStyleClass("SettingsLinks width25Percent minwidth150px AcceptSubmitButton TextCenter MarTop5px")
                    ]
                }).addStyleClass("TextCenter MarAll12px MarTop0px width140px MarRight20px");
                
				var oVertBox = new sap.m.VBox({
					items : [
                        new sap.m.HBox({
                            items : [oCol1, oCol2]
                        })
                    ]
				});
    		    
		    	// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("devicePanel") !== undefined)
					me.byId("devicePanel").destroy();
    		    
    		    var oPanel = new sap.m.Panel(me.createId("devicePanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
                
				thisView.byId("DeviceInfoPage").addContent(oPanel);
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.devices.DeviceInfo
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.devices.DeviceInfo
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.devices.DeviceInfo
*/
//	onExit: function() {
//
//	}

});