/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.premise.PremiseViewInfo", {
    
    /*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.premise.PremiseViewInfo
	****************************************************************************************************/
	getControllerName : function() {
        return "mjs.settings.premise.PremiseViewInfo";
    },

    /*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.premise.PremiseViewInfo
	****************************************************************************************************/
	createContent : function(oController) {
        var me = this;
        
		var oPageNavigationHeader = new sap.m.VBox({
			items: [ IOMy.widgets.getNavigationalSubHeader("EDIT PREMISE", "sap-icon://GoogleMaterial/home", me) ]
		});
		
		return new sap.m.Page(this.createId("page"), {
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content: [oPageNavigationHeader]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
	}

});
