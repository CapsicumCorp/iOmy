/*
Title: IP Camera Page UI5 View
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates the page to view a camera feed, capture a screenshot or
    record some pictures, and any motion activity.
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

sap.ui.jsview("pages.device.OnvifCamera", {
    wCameraFeed         : null,
    wBtnMoveUp          : null,
    wBtnMoveLeft        : null,
    wBtnMoveRight       : null,
    wBtnMoveDown        : null,
    wSnapshotTimeField  : null,
    wLocationField      : null,
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.device.OnvifCamera
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.device.OnvifCamera";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.device.OnvifCamera
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;
        
        //==============================================//
        // Create PTZ Controls
        //==============================================//

        //-----------------//
        // Up
        //-----------------//
        oView.wBtnMoveUp = new sap.m.Button({
            tooltip: "PTZ Up",
            icon : "sap-icon://slim-arrow-up",
            enabled : oView.bPTZButtonsEnabled,
            visible : "{/visible/IfPTZIsNotDisabled}",
            press : function () {
                oController.PTZMoveUp();
            }
        }).addStyleClass("width100Percent height30px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Left
        //-----------------//
        oView.wBtnMoveLeft = new sap.m.Button({
            tooltip: "PTZ Left",
            icon : "sap-icon://slim-arrow-left",
            enabled : oView.bPTZButtonsEnabled,
            visible : "{/visible/IfPTZIsNotDisabled}",
            press : function () {
                oController.PTZMoveLeft();
            }
        }).addStyleClass("height240px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Right
        //-----------------//
        oView.wBtnMoveRight = new sap.m.Button({
            tooltip: "PTZ Right",
            icon : "sap-icon://slim-arrow-right",
            enabled : oView.bPTZButtonsEnabled,
            visible : "{/visible/IfPTZIsNotDisabled}",
            press : function () {
                oController.PTZMoveRight();
            }
        }).addStyleClass("height240px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Down
        //-----------------//
        oView.wBtnMoveDown = new sap.m.Button({
            tooltip: "PTZ Down",
            icon : "sap-icon://slim-arrow-down",
            enabled : oView.bPTZButtonsEnabled,
            visible : "{/visible/IfPTZIsNotDisabled}",
            press : function () {
                oController.PTZMoveDown();
            }
        }).addStyleClass("width100Percent height30px IOMYButton ButtonIconWhite CameraPTZButton")
        
        oView.wLocationField = new sap.m.Label({}).addStyleClass("NormalWS");
        
        oView.wSnapshotTimeField = new sap.m.Label({});
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "OnvifStream",
			header : iomy.widgets.getToolPageHeader( oController ),
			sideContent : iomy.widgets.getToolPageSideContent(oController),
			mainContents : [

				new sap.m.ScrollContainer ({
                    //width: "100%",
                    height: "100%",
                    vertical : true,
                    content : [
                        iomy.widgets.DeviceToolbar(oController, "Onvif Stream"),
                        
                        new sap.m.VBox( oView.createId("PageContainer_Thumbnail"), {
                            items : [
                                //------------------------------------------------------------------//
                                // Screenshot
                                //------------------------------------------------------------------//
                                new sap.m.VBox(oView.createId("CameraThumbnail"), {
                                    items : [
                                        // UP BUTTON
                                        //oView.wBtnMoveUp,

                                        // MIDDLE SECTION
                                        new sap.m.HBox({
                                            items : [
                                                // LEFT BUTTON
                                                //oView.wBtnMoveLeft,

                                                // CENTER AREA
                                                new sap.m.VBox({}).addStyleClass("width100Percent heightAuto"),

                                                // RIGHT BUTTON
                                                //oView.wBtnMoveRight
                                            ]
                                        }).addStyleClass("width100Percent"),

                                        // DOWN ARROW
                                        //oView.wBtnMoveDown
                                    ]
                                }).addStyleClass("width100Percent height300px BG_grey_10 CameraThumbnail"),
                                
                                //------------------------------------------------------------------//
                                // Camera Information
                                //------------------------------------------------------------------//
                                new sap.m.VBox({
                                    items : [
                                        //------------------------------------------------------------------//
                                        // Camera Location
                                        //------------------------------------------------------------------//
                                        new sap.m.HBox({
                                            items :[
                                                new sap.m.Label({
                                                    text : "Location:"
                                                }).addStyleClass("width120px"),

                                                oView.wLocationField
                                            ]
                                        }),
                                        //------------------------------------------------------------------//
                                        // Time and Date
                                        //------------------------------------------------------------------//
                                        new sap.m.HBox({
                                            items :[
                                                new sap.m.Label({
                                                    text : "Snapshot Taken:"
                                                }).addStyleClass("width120px"),

                                                oView.wSnapshotTimeField
                                            ]
                                        })
                                    ]
                                }).addStyleClass("PadAll3px PadTop15px")
                            ]
                        }).addStyleClass("maxwidth550px HorizontalCenter"),



						new sap.m.VBox({
                            visible : "{/visible/IfPTZControlsAreEnabled}",
							items : [
								new sap.m.FlexBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items: [
										new sap.m.FlexBox ({
                                            layoutData : new sap.m.FlexItemData({
                                                growFactor : 1
                                            }),
                                            items: [
                                                new sap.m.VBox ({
                                                    width: "200px",
                                                    items: [
                                                        new sap.m.Button ({
                                                            height: "50px",
                                                            width: "200px",
                                                            icon : "sap-icon://slim-arrow-up",
                                                            value : "{/enabled/Always}",

                                                            press : function () {
                                                                oController.PTZMove(0, 5);
                                                            }
                                                        }),
                                                        new sap.m.HBox ({
                                                            items : [
                                                                new sap.m.Button ({
                                                                    height: "50px",
                                                                    width: "50px",
                                                                    icon : "sap-icon://slim-arrow-left",
                                                                    value : "{/enabled/Always}",

                                                                    press : function () {
                                                                        oController.PTZMove(-5, 0);
                                                                    }
                                                                }),
                                                                new sap.m.HBox ({
                                                                    height: "50px",
                                                                    width: "90px",
                                                                    //text:"Center"
                                                                }).addStyleClass("MarLeft5px MarRight5px"),
                                                                new sap.m.Button ({
                                                                    height: "50px",
                                                                    width: "50px",
                                                                    icon : "sap-icon://slim-arrow-right",
                                                                    value : "{/enabled/Always}",

                                                                    press : function () {
                                                                        oController.PTZMove(5, 0);
                                                                    }
                                                                }),
                                                            ]
                                                        }),
                                                        new sap.m.Button ({
                                                            height: "50px",
                                                            width: "200px",
                                                            icon : "sap-icon://slim-arrow-down",
                                                            value : "{/enabled/Always}",

                                                            press : function () {
                                                                oController.PTZMove(0, -5);
                                                            }
                                                        })
                                                    ]
                                                }).addStyleClass("ElementCenter")
                                            ]
                                        })
									]
								})
							]
						}) //-- END VBOX PageContainer_Player --//
					]
				})

			]
		}).addStyleClass("MainBackground");
	}

});