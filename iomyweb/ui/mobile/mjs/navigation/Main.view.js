/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.navigation.Main", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.navigation.Main
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.navigation.Main";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.navigation.Main
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("Page"),{
			//title: "Navigation",
			//customHeader : IOMy.widgets.getCustomHeader("", false),
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content: [
				new sap.m.Panel( me.createId("Panel"), {
					backgroundDesign: "Transparent",
					content: []
				}).addStyleClass("PanelNoPadding")
			]

		}).addStyleClass("MainBackground height100Percent width100Percent");
			//.addHeaderContent(IOMy.widgets.getSwitchUserButton());
		
		return oPage;
	}

});
