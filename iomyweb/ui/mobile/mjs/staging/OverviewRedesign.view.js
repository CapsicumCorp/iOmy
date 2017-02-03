/*
Title: OverviewRedesign View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all devices and their information in a given
    room.
Copyright: Capsicum Corporation 2016

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

sap.ui.jsview("mjs.staging.OverviewRedesign", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.OverviewRedesign
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.OverviewRedesign";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.OverviewRedesign
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new sap.m.Page(me.createId("page"),{
			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
			footer : IOMy.widgets.getAppFooter(),
			content : [
                //-- Navigational Header --//
				IOMy.widgets.getNavigationalSubHeader("Staging Home", "sap-icon://GoogleMaterial/home", me),
				new sap.m.Panel( me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content : [
						new sap.m.List ({
							items : [
								//-- Weather Feed Group Title --//
								new sap.m.InputListItem ({
									label : "Weather Feed",
								}).addStyleClass(""),
								//-- Weather Feed 1 --//
								new sap.m.InputListItem ({
									label : "Outside Weather Feed",
									content : [
										//-- Column 2 for Status Row --//
										new sap.m.Text ({
											text : "28°C",
											textAlign : "Center",
											width : "50%"
										}),
										new sap.m.Text ({
											text : "Clear",
											textAlign : "Center",
											width : "50%"
										}),
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Zigbee Netvox SmartPlug Group Title --//
								new sap.m.InputListItem ({
									label : "Zigbee Netvox SmartPlug",
								}).addStyleClass(""),
								new sap.m.InputListItem ({
									label : "Fridge",
									content : [
										//-- Column 2 for Last Accessed Row --//
										new sap.m.FlexBox ({
											items : [
												new sap.m.Text ({
													text : "0.088 kW",
													textAlign : "Center",
													width : "50%"
												})
											]
										}),
										new sap.m.FlexBox ({
											items : [
												new sap.m.Switch ({
												state : true,
												})
											]
										}),
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								new sap.m.InputListItem ({
									label : "Lamp",
									content : [
										//-- Column 2 for Last Accessed Row --//
										new sap.m.Text ({
											text : "0.093 kW",
											textAlign : "Center",
											width : "50%"
										}),
										new sap.m.Switch ({
											state : true,
										}).addStyleClass(""),
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								new sap.m.InputListItem ({
									label : "Tv",
									content : [
										//-- Column 2 for Last Accessed Row --//
										new sap.m.Text ({
											text : "IO Offline",
											textAlign : "Center",
											width : "50%"
										}),
										new sap.m.Switch ({
											state : false,
										}).addStyleClass(""),
									]
								}).addStyleClass("maxlabelwidth50Percent"),
								//-- Phillips Hue Light --//
								new sap.m.InputListItem ({
									label : "Phillips Hue Light",
								}).addStyleClass(""),
								new sap.m.InputListItem ({
									label : "Phillips Hue Lamp",
									content : [
										//-- Column 2 for Phillips Hue Light --//
										new sap.m.Text ({
											text : "",
											textAlign : "Center",
											width : "50%"
										}),
										new sap.m.Switch ({
											state : true,
										}).addStyleClass(""),
									]
								}).addStyleClass("maxlabelwidth50Percent"),
							]
						})
					]
                }).addStyleClass("PadBottom10px PanelNoPadding UserInputForm")
            ]
		}).addStyleClass("height100Percent width100Percent MainBackground");
		
		return oPage;
	}
 //-- test --//
});