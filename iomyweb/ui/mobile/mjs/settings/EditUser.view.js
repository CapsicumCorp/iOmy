/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.EditUser", {
	
	getControllerName : function() {
        return "mjs.settings.EditUser";
    },
    
    createContent : function(oController) {
		var me = this;
		
		this.destroyContent();
    	
    	var oPage = new sap.m.Page(this.createId("EditUserPage"), {
            customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			content: [IOMy.widgets.getNavigationalSubHeader("SETTINGS EDIT USER", "", me)],
			footer : IOMy.widgets.getAppFooter()
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		
		return oPage;
    }
    
});
