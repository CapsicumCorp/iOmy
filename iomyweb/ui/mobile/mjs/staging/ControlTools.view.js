/*
Title: Control Tools
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Gives an example page for UI5 Control Objects
Copyright: Capsicum Corporation 2016, 2017

This file is part of iOmy.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/

sap.ui.jsview("mjs.staging.ControlTools", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.template.Template
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.ControlTools";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.template.Template
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		//var oPage = new sap.m.Page(me.createId("page"),{
		//	customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
		//	footer : IOMy.widgets.getAppFooter(),
		//	content : [
        //       //-- Navigational Header --//
		//		IOMy.widgets.getNavigationalSubHeader("Template", "sap-icon://GoogleMaterial/home", me)
        //    ]
		// }).addStyleClass("height100Percent width100Percent MainBackground");
		
		 var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "Widgets"
        });
        
        oPage.addContent(
            new sap.m.Panel( me.createId("panel"), {
                backgroundDesign: "Transparent",
                content : [ 
                    new sap.m.List({
                        items:[
							new sap.m.InputListItem({
								label : "Toggle Button:",
								content:[
									new sap.m.ToggleButton({
										text: "Pressed",
										enabled: true,
										Pressed: true
									})
								]
							}),
							new sap.m.InputListItem({
								label : "Check Box:",
								content:[
									new sap.m.CheckBox({
										selected: "true"
									})
								]
							}),
							new sap.m.InputListItem({
								label : "Select Box:",
								content: [
									new sap.m.Select({								
										items: [
											new sap.ui.core.Item ({
												text: "item 1",
												key: "key1",
											}),
											new sap.ui.core.Item ({
												text: "item 2",
												key: "key2",
											}),
										],
									})
								]
							}),	
							new sap.m.InputListItem({
								label : "Date Picker:",
								content: [
									new sap.m.DatePicker({})
								]
							}),	
							new sap.m.InputListItem({
								label : "Time Picker:",
								content: [
									new sap.m.TimePicker({})
								]
							}),								
							new sap.m.InputListItem({
								label : "Slider:",
								content: [
									new sap.m.Slider({})
								]
							}),									
							new sap.m.InputListItem({
								label : "Switch:",
								content: [
									new sap.m.Switch({})
								]
							}),							
                        ]
                    })
                ]
            }).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
        );
		
		return oPage;
	}

});