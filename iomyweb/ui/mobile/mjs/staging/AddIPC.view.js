/*
Title: Add IP Camera
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

sap.ui.jsview("mjs.staging.AddIPC", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.staging.AddIPC
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.staging.AddIPC";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.staging.AddIPC
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/Camera",
            title : "Add IPC"
        });

		oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content: [
						/* Parent HBox for Type & Hub Containers */
						new sap.m.HBox ({
							items : [
								/* Parent VBox for Type */
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [
										new sap.m.Label ({
											text: "Type:"
										}),
										new sap.m.Select({
											width: "100%",											
											items: [
												new sap.ui.core.Item ({
													text: "MJPEG",
													key: "mjpeg"
												})
											],
										}).addStyleClass(""),
									]
								}).addStyleClass("MarRight5px"),
								/* Parent VBox for Hub ID */
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [	
										new sap.m.Label ({
											text: "Hub ID:"
										}),
										new sap.m.Select({		
											width: "100%",
											items: [
												new sap.ui.core.Item ({
													text: "1",
													key: "1"
												}),
											],
										}).addStyleClass("")
									]
								}).addStyleClass("MarLeft5px"),
							]
						}).addStyleClass(),
						/* Parent HBox for Protocol, Network Address & Port Containers */
						new sap.m.HBox ({
							items : [
								/* Parent VBox for Protocol */
								new sap.m.VBox ({
									items : [
										new sap.m.Label ({
											text: "Protocol:"
										}),
										new sap.m.Input ({
											type:"Text",
											placeholder:"http",
										}).addStyleClass("")
									]
								}).addStyleClass("width65px"),
								/* Parent VBox for Network Address */
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [	
										new sap.m.Label ({
											text: "Network Address:"
										}),
										new sap.m.Input ({
											type:"Url",
											placeholder:"10.0.0.1",
										}).addStyleClass("")
									]
								}).addStyleClass("MarLeft10px MarRight10px"),
								/* Parent VBox for Port */
								new sap.m.VBox ({
									items : [	
										new sap.m.Label ({
											text: "Port:"
										}),
										new sap.m.Input ({
											type:"Number",
											placeholder:"port",
										}).addStyleClass("")
									]
								}).addStyleClass("width65px"),
							]
						}).addStyleClass("PadTop5px"),
						/* Parent HBox for Video Path Container */
						new sap.m.HBox ({
							items : [
								/* Parent VBox for Video Path Input */
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [
										new sap.m.Label ({
											text: "Path:"
										}),
										new sap.m.Input ({
											type:"Text",
											placeholder:"/Video",
										}).addStyleClass("")
									]
								}).addStyleClass(""),
							]
						}).addStyleClass("PadTop5px"),
						/* Parent HBox for Auth Required Container */
						new sap.m.HBox ({
							items : [
								/* Parent HBox for Auth Required Label / Checkbox */
								new sap.m.HBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [
										new sap.m.Label ({
											layoutData : new sap.m.FlexItemData({
												growFactor : 1
											}),
											text: "Authentication Required?"
										}).addStyleClass("PadTop15px"),
										new sap.m.CheckBox ({}).addStyleClass("")
									]
								}).addStyleClass(""),
							]
						}).addStyleClass("PadTop5px"),
						/* Parent HBox for Username / Password Containers */
						new sap.m.HBox ({
							items : [
								/* Parent VBox for Username*/
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [	
										new sap.m.Label ({
											text: "Username:"
										}),
										new sap.m.Input ({
											type:"Text",
										}).addStyleClass("")
									]
								}).addStyleClass("MarRight10px"),
								/* Parent VBox for Password */
								new sap.m.VBox ({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									items : [	
										new sap.m.Label ({
											text: "Password:"
										}),
										new sap.m.Input ({
											type:"Text",
										}).addStyleClass("")
									]
								}).addStyleClass(""),
							]
						}).addStyleClass("PadTop5px"),
						/* Parent HBox for Cancel, Apply, Discard */
						new sap.m.HBox ({	
							layoutData : new sap.m.FlexItemData({
								growFactor : 1
							}),
							items : [
								/* Cancel (Defualt Type) */
								new sap.m.Button({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),
									type:"Default",
									text: "Cancel"
								}).addStyleClass("width80px"),
								/* Apply (Accept Type) */
								new sap.m.Button({
									layoutData : new sap.m.FlexItemData({
										growFactor : 1
									}),									
									type:"Accept",
									text: "Submit"
								}).addStyleClass("width80px")
							]
						}).addStyleClass("MarTop15px TextCenter")
					]
				}).addStyleClass("PadBottom10px MotionJPEG MarTop3px")
			);
		return oPage;
	}

});