/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.SettingsOverview", {
	oData : IOMy.apiodata,
	common : IOMy.common,
	widgets : IOMy.widgets,

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.SettingsOverview
	*/ 
	getControllerName : function() {
		return "mjs.settings.SettingsOverview";
	},
	
	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.SettingsOverview
	*/ 
	createContent : function(oController) {
		var me = this;
		
		//----------------------------------------//
		//-- 2.1 - THE NAVIGATION SUBHEADER		--//
		//----------------------------------------//
		var oPageNavigationHeader = new sap.m.VBox({
			items: [ this.widgets.getNavigationalSubHeader("SETTINGS", "", me) ]
		});
		
		//--------------------------------------------//
		//-- 2.2 - RENDER THE PAGE					--//
		//--------------------------------------------//
		return new sap.m.Page(this.createId("page"), {
			//customHeader : IOMy.widgets.getIOMYPageHeader(),
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content: [oPageNavigationHeader]
		}).addStyleClass("height100Percent width100Percent MainBackground")
	}
});