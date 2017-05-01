/*
Title: Rules Overview View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
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

sap.ui.jsview("mjs.staging.DeviceList", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.DeviceList
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.DeviceList";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.DeviceList
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
//		var oPage = new sap.m.Page(me.createId("page"),{
//			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
//			footer : IOMy.widgets.getAppFooter(),
//			content : [
//                // -- Navigational Header -- // 
//				IOMy.widgets.getNavigationalSubHeader("Rules Overview", "sap-icon://GoogleMaterial/home", me),
//            
//            ]
//		}).addStyleClass("height100Percent width100Percent MainBackground");
        
        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "Overview"
        });
        
        oPage.addContent(
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content: [
                    // -- Parent VBox. Aligns children vertically -- //
                    new sap.m.VBox({
                        items : [
                            // -- Device Header -- //
                            new sap.m.HBox({
                                items : [
                                    // -- HBox Label Container. Aligns children horizontally -- //
                                    new sap.m.HBox({
                                        items : [
										 new sap.m.Link({
											text : "Premise 1",
											width: "100%",
											press : function () {
												IOMy.common.NavigationChangePage("pSettingsPremiseInfo");
											}
										}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20")
                                        ]
                                    }).addStyleClass("MarLeft3px"),
									 new sap.m.HBox({
										width: "90%",
										justifyContent: "End",
										items : [
											 new sap.m.Link({
												text : "Demohub",
												width: "100%",
												press : function () {
													IOMy.common.NavigationChangePage("pSettingsPremiseHub", { "hub": { "HubId":1 } }, false);
												 }
											}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20")
										]
									}).addStyleClass("MarRight3px")
                                ]
                            }).addStyleClass("ConsistentMenuHeader ListItem width100Percent"),
                            // -- TV --//
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
											new sap.m.HBox({
												layoutData : new sap.m.FlexItemData({
													growFactor : 1
												}),
												items : [
													new sap.m.Link({
														layoutData : new sap.m.FlexItemData({
															growFactor : 9
														}),
														text : "Tv",
														width: "100%",
														press : function () {
															IOMy.common.NavigationChangePage("pDeviceData", { "ThingId":3 }, false);
														}
													}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d0Rem iOmyLink"),
													new  sap.ui.core.Icon ({
														layoutData : new sap.m.FlexItemData({
															growFactor : 0.25
														}),
														src: "sap-icon://edit",
														press : function () {
															IOMy.common.NavigationChangePage("pSettingsEditThing", { "device": { "ThingId":3 } }, false );
														}
													}).addStyleClass("Text_grey_20 MarTop1d25Rem"),
												]
											}),
                                            new sap.m.HBox({
                                                width: "100%",
                                                items : [
													new sap.m.Label({
                                                        text: "Type: Zigbee Smart Plug"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20"),
													 new sap.m.HBox({
														layoutData : new sap.m.FlexItemData({
															growFactor : 1
														}),
														justifyContent: "End",
														items: [
															new sap.m.Label({
																text: "SN: 00137A000000AD26"
															}).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
														]
													}),
												]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft4px PadRight4px"),
                                ]
                            }).addStyleClass("minheight58px ListItem"),
                            // -- Fridge --//
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
											new sap.m.HBox({
												layoutData : new sap.m.FlexItemData({
													growFactor : 1
												}),
												items : [
													new sap.m.Link({
														layoutData : new sap.m.FlexItemData({
															growFactor : 9
														}),
														text : "Fridge",
														width: "100%",
														press : function () {
															IOMy.common.NavigationChangePage("pDeviceData", { "ThingId":2 }, false);
														}
													}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d0Rem iOmyLink"),
													new  sap.ui.core.Icon ({
														layoutData : new sap.m.FlexItemData({
															growFactor : 0.25
														}),
														src: "sap-icon://edit",
														press : function () {
															IOMy.common.NavigationChangePage("pSettingsEditThing", { "device": { "ThingId":2 } }, false );
														}
													}).addStyleClass("Text_grey_20 MarTop1d25Rem"),
												]
											}),
                                            new sap.m.HBox({
                                                width: "100%",
                                                items : [
													new sap.m.Label({
                                                        text: "Type: Zigbee Smart Plug"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20"),
													 new sap.m.HBox({
														layoutData : new sap.m.FlexItemData({
															growFactor : 1
														}),
														justifyContent: "End",
														items: [
															new sap.m.Label({
																text: "SN: 00137A000000AD8A"
															}).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
														]
													}),
												]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft4px PadRight4px"),
                                ]
                            }).addStyleClass("minheight58px ListItem"),
							 // -- Lamp --//
							new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
											new sap.m.HBox({
												layoutData : new sap.m.FlexItemData({
													growFactor : 1
												}),
												items : [
													new sap.m.Link({
														layoutData : new sap.m.FlexItemData({
															growFactor : 9
														}),
														text : "Lamp",
														width: "100%",
														press : function () {
															IOMy.common.NavigationChangePage("pDeviceData", { "ThingId":4 }, false);
														}
													}).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d25Rem iOmyLink"),
													new  sap.ui.core.Icon ({
														layoutData : new sap.m.FlexItemData({
															growFactor : 0.25
														}),
														src: "sap-icon://edit",
														press : function () {
															IOMy.common.NavigationChangePage("pSettingsEditThing", { "device": { "ThingId":4 } }, false );
														}
													}).addStyleClass("Text_grey_20 MarTop1d25Rem"),
												]
											}),
                                            new sap.m.HBox({
                                                width: "100%",
                                                items : [
													new sap.m.Label({
                                                        text: "Type: Zigbee Smart Plug"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20"),
													 new sap.m.HBox({
														layoutData : new sap.m.FlexItemData({
															growFactor : 1
														}),
														justifyContent: "End",
														items: [
															new sap.m.Label({
																text: "SN: 00137A000000AD88"
															}).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
														]
													}),
												]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft4px PadRight4px"),
                                ]
                            }).addStyleClass("minheight58px ListItem"),
                        ]
                    })
                ]
            }).addStyleClass("MasterPanel PanelNoPadding PadBottom10px UserInputForm MarTop3px")
        );
		
		return oPage;
	}

});