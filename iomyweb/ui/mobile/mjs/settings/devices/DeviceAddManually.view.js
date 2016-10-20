/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.devices.DeviceAddManually", {
	getControllerName : function() {
        return "mjs.settings.devices.DeviceAddManually";
    },

    createContent : function(oController) {
    	var me = this;
    	
    	return new sap.m.Page(this.createId("page"), {
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content: [IOMy.widgets.getNavigationalSubHeader("MANUALLY ADD DEVICE", "", me)]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
    }
    
});
