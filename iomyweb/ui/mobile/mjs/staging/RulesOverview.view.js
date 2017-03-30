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

sap.ui.jsview("mjs.staging.RulesOverview", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.RulesOverview
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.RulesOverview";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.RulesOverview
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
            title : "Rules Overview"
        });
        
        oPage.addContent(
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content: [
                    // -- Parent VBox. Aligns children vertically -- //
                    new sap.m.VBox({
                        items : [
                            // -- Device Header -- //
                            new sap.m.VBox({
                                items : [
                                    // -- HBox Label Container. Aligns children horizontally -- //
                                    new sap.m.HBox({
                                        items : [
                                            new sap.m.Label({
                                                text: "Zigbee Smart Plug"
                                            }).addStyleClass("Font-RobotoCondensed")
                                        ]
                                    }).addStyleClass("MarLeft3px")
                                ]
                            }).addStyleClass("ConsistentMenuHeader ListItem width100Percent"),
                            // -- Device Display Name w/ Onpress Event Link --//
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
                                            new sap.m.Link({
                                                text : "Tv",
                                                width: "100%",
                                                press : function () {
                                                    IOMy.common.NavigationChangePage("pAddRule");
                                                }
                                            }).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d25Rem iOmyLink"),
                                            new sap.m.HBox({
                                                width: "100%",
                                                justifyContent: "End",
                                                items : [
                                                    // -- Example Serial Number -- //
                                                    new sap.m.Label({
                                                        text: "SN: 00137A000000AD88"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
                                                ]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft3px BorderRight PadRight3px"),
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 1
                                        }),
                                        items: [
                                            new sap.m.VBox({
                                                items : [
                                                    new sap.m.Label({
                                                        text : "Turn On: 6:00pm"
                                                    }).addStyleClass("Font-RobotoCondensed width100px"),

                                                    new sap.m.Label({
                                                        text : "Turn Off: 12:00am"
                                                    }).addStyleClass("Font-RobotoCondensed width100px")
                                                ]
                                            })
                                        ]
                                    }).addStyleClass("MarTop12px TextCenter")
                                ]
                            }).addStyleClass("minheight58px ListItem"),
                            // -- Device Display Name w/ Onpress Event Link --//
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
                                            new sap.m.Link({
                                                text : "Fridge",
                                                width: "100%",
                                                press : function () {
                                                    IOMy.common.NavigationChangePage("pAddRule");
                                                }
                                            }).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d25Rem iOmyLink"),
                                            new sap.m.HBox({
                                                width: "100%",
                                                justifyContent: "End",
                                                items : [
                                                    // -- Example Serial Number -- //
                                                    new sap.m.Label({
                                                        text: "SN: 00137A000000AD87"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
                                                ]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft3px BorderRight PadRight3px"),
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 1
                                        }),
                                        items: [
                                            new sap.m.VBox({
                                                items : [
                                                    new sap.m.Label({
                                                        text : "Turn On: 8:00am"
                                                    }).addStyleClass("Font-RobotoCondensed width100px"),

                                                    new sap.m.Label({
                                                        text : "Turn Off: 5:00pm"
                                                    }).addStyleClass("Font-RobotoCondensed width100px")
                                                ]
                                            })
                                        ]
                                    }).addStyleClass("MarTop12px TextCenter")
                                ]
                            }).addStyleClass("minheight58px ListItem"),
                            // -- Device Display Name w/ Onpress Event Link --//
                            new sap.m.HBox({
                                items : [
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 8
                                        }),
                                        items : [
                                            new sap.m.Link({
                                                text : "Lamp",
                                                width: "100%",
                                                press : function () {
                                                    IOMy.common.NavigationChangePage("pAddRule");
                                                }
                                            }).addStyleClass("Font-RobotoCondensed TextSizeMedium Text_grey_20 MarTop1d25Rem iOmyLink"),
                                            new sap.m.HBox({
                                                width: "100%",
                                                justifyContent: "End",
                                                items : [
                                                    // -- Example Serial Number -- //
                                                    new sap.m.Label({
                                                        text: "SN: 00137A000000AD86"
                                                    }).addStyleClass("Font-RobotoCondensed TextSizeXSmall Text_grey_20")
                                                ]
                                            }).addStyleClass("")
                                        ]
                                    }).addStyleClass("MarLeft3px BorderRight PadRight3px"),
                                    new sap.m.VBox({
                                        layoutData : new sap.m.FlexItemData({
                                            growFactor : 1
                                        }),
                                        items: [
                                            new sap.m.VBox({
                                                items : [
                                                    new sap.m.Label({
                                                        text : "Turn On: 11:00pm"
                                                    }).addStyleClass("Font-RobotoCondensed width100px"),

                                                    new sap.m.Label({
                                                        text : "Turn Off: 6:00am"
                                                    }).addStyleClass("Font-RobotoCondensed width100px")
                                                ]
                                            })
                                        ]
                                    }).addStyleClass("MarTop12px TextCenter")
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