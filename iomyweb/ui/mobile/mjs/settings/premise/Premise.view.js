/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.jsview("mjs.settings.premise.Premise", {
	
    /*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.premise.Premise
	****************************************************************************************************/
	getControllerName : function() {
        return "mjs.settings.premise.Premise";
    },
    
    /*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.premise.Premise
	****************************************************************************************************/
    createContent : function(oController) {
    	var me = this;
        
    	this.destroyContent();
    	
    	var oPage = new sap.m.Page(this.createId("page"), {
            customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			content: [IOMy.widgets.getNavigationalSubHeader("PREMISE INFO", "", me)],
			footer : IOMy.widgets.getAppFooter()
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		
		return oPage;
    }
    
});
