/*
Title: Template UI5 View
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

sap.ui.jsview("mjs.staging.AddRule", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.AddRule
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.AddRule";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.AddRule
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
//		var oPage = new sap.m.Page(me.createId("page"),{
//			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
//			footer : IOMy.widgets.getAppFooter(),
//			content : [
//                //-- Navigational Header --//
//				IOMy.widgets.getNavigationalSubHeader("Add Rule", "sap-icon://GoogleMaterial/home", me),
//            
//            ]
//		}).addStyleClass("height100Percent width100Percent MainBackground");

        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "New Rule"
        });
        
        oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content: [
                    new sap.m.VBox ({
                        items : [
                            new sap.m.Label ({
                                text: "Display Name"
                            }),
                            new sap.m.Input ({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),
                                value: "TV",
                                enabled: false,
                            }).addStyleClass(""),
                        ]
                    }),
                    new sap.m.HBox ({	
                        items : [
                            new sap.m.VBox ({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),
                                items : [
                                    new sap.m.Label ({
                                        text: "On Time"
                                    }),
                                    new sap.m.TimePicker ({
                                        id: "TP1",
                                        valueFormat: "hh:mm a",
                                        displayFormat: "hh:mm a",
                                        change: "handleChange",
                                        placeholder: "Select a On Time",
                                    }).addStyleClass("width100Percent"),
                                ]
                            }).addStyleClass("MarRight10px"),
                            new sap.m.VBox ({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),
                                items : [
                                    new sap.m.Label ({
                                        text: "Off Time"
                                    }),
                                    new sap.m.TimePicker ({
                                        id: "TP2",
                                        valueFormat: "hh:mm a",
                                        displayFormat: "hh:mm a",
                                        change: "handleChange",
                                        placeholder: "Select a Off Time",
                                    }).addStyleClass("width100Percent"),
                                ]
                            }).addStyleClass("MarLeft10px"),
                        ]
                    }).addStyleClass("MarTop10px"),
                    new sap.m.HBox ({	
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 1
                        }),
                        items : [
                            new sap.m.Button({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),
                                type:"Default",
                                text: "Cancel",
                            }).addStyleClass("width80px"),
                            new sap.m.Button({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),									
                                type:"Accept",
                                text: "Apply",
                            }).addStyleClass("width80px"),
                            new sap.m.Button({
                                layoutData : new sap.m.FlexItemData({
                                    growFactor : 1
                                }),									
                                type:"Reject",
                                text: "Discard",
								press: function () {
									sap.m.MessageBox.show(
											"Are you sure that you wish to discard the current rule?", 
											{ 	//text displayed in content area of the message box
												icon: sap.m.MessageBox.Icon.INFORMATION,                            //icon : Icon displayed on the header
												title: "Warning",   	                                            //title : Header text
												actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO], //Supported action in message box
											});
										}
								}).addStyleClass("width80px "),
                        ]
                    }).addStyleClass("MarTop15px TextCenter")
                ]
            }).addStyleClass("PadBottom10px UserInputForm MarTop3px")
        );
		
		return oPage;
	}

});