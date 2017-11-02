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

sap.ui.jsview("pages.staging.device.OnvifCamera", {
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
	* @memberOf pages.staging.device.OnvifCamera
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.device.OnvifCamera";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.device.OnvifCamera
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
            press : function () {
                oController.PTZMoveDown();
            }
        }).addStyleClass("width100Percent height30px IOMYButton ButtonIconWhite CameraPTZButton")
        //==============================================//
        // DRAW CAMERA FEED                             //
        //==============================================//
        
        oView.wCameraFeed = new sap.m.VBox(oView.createId("CameraThumbnail"), {
            items : [
                // UP BUTTON
                oView.wBtnMoveUp,

                // MIDDLE SECTION
                new sap.m.HBox({
                    items : [
                        // LEFT BUTTON
                        oView.wBtnMoveLeft,

                        // CENTER AREA
                        new sap.m.VBox({}).addStyleClass("width100Percent heightAuto"),

                        // RIGHT BUTTON
                        oView.wBtnMoveRight
                    ]
                }).addStyleClass("width100Percent"),

                // DOWN ARROW
                oView.wBtnMoveDown
            ]
        }).addStyleClass("width100Percent height300px BG_grey_10 CameraThumbnail");

        //==============================================//
        // DRAW DATE, TIME, AND ROOM                    //
        //==============================================//
        oView.wLocationField = new sap.m.Label({}).addStyleClass("NormalWS");
        
        oView.wSnapshotTimeField = new sap.m.Label({});
        
//        oView.aElementsToDestroy.push("CameraInfoBox");
//        oView.aElementsToDestroy.push("SnapshotField");
        var oInfoBox = new sap.m.VBox({
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
        }).addStyleClass("PadAll3px PadTop15px");

        var oVertBox = new sap.m.VBox({
            items : [ oView.wCameraFeed, oInfoBox ]
        }).addStyleClass("maxwidth550px HorizontalCenter");
		
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "OnvifStream",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents : [
				IomyRe.widgets.DeviceToolbar(oController, "Onvif Camera Screenshot"),
				oVertBox
			]
		}).addStyleClass("MainBackground");
	}

});