/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.devices.DeviceInfo", {
	
    getControllerName : function() {
        return "mjs.settings.devices.DeviceInfo";
    },
    
    createContent : function(oController) {
    	var me = this;
    	this.destroyContent();
    	
    	var oPage = new sap.m.Page(this.createId("DeviceInfoPage"), {
    		customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			content: [IOMy.widgets.getNavigationalSubHeader("IO PORT INFORMATION", "", me)],
			footer : IOMy.widgets.getAppFooter()
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		
		return oPage;
    }
    
});
