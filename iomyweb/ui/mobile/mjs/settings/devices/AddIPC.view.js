/*
Title: Add IP Camera
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
	Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the form to add a webcam to iOmy.
Copyright: Capsicum Corporation 2017

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

sap.ui.jsview("mjs.settings.devices.AddIPC", {
	//------------------------------------------------------------------------//
	// Important widgets
	//------------------------------------------------------------------------//
	wFileTypeSelector		: null,
	wHubSelector			: null,
	wProtocol				: null,
	wIPAddress				: null,
	wIPPort					: null,
	wStreamPath				: null,
	wAuthenticationCheckBox	: null,
	wUsername				: null,
	wPassword				: null,
	wCancelButton			: null,
	wSubmitButton			: null,
	wPanel					: null,
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.settings.devices.AddIPC
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.settings.devices.AddIPC";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.settings.devices.AddIPC
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;
		
		//--------------------------------------------------------------------//
		// Draw the important widgets
		//--------------------------------------------------------------------//
		
		//-- File Type --//
		me.wFileTypeSelector = new sap.m.Select({
			width: "100%",											
			items: [
				new sap.ui.core.Item ({
					text: "MJPEG",
					key: "MJPEG"
				})
			]
		});
		
		//-- Hub --//
		me.wHubSelector = IOMy.widgets.getHubSelector("hub");
		
		//-- Protocol --//
		me.wProtocol = new sap.m.Input ({
			type:"Text",
			placeholder:"http"
		}).addStyleClass("");
		
		//-- IP Address --//
		me.wIPAddress = new sap.m.Input ({
			type: "Url",
			placeholder: "10.0.0.1"
		}).addStyleClass("");
		
		//-- IP Port --//
		me.wIPPort = new sap.m.Input ({
			type:"Number",
			placeholder:"80"
		}).addStyleClass("");
		
		//-- Video stream path --//
		me.wStreamPath = new sap.m.Input ({
			type:"Text",
			placeholder:"/Video"
		}).addStyleClass("");
		
		//-- Authentication required tick box --//
		me.wAuthenticationCheckBox = new sap.m.CheckBox({
			select : function () {
				oController.ToggleAuthenticationFields(this.getSelected());
			}
		});
		
		//-- Username --//
		me.wUsername = new sap.m.Input ({
			type:"Text",
			enabled: false
		}).addStyleClass("");
		
		//-- Password --//
		me.wPassword = new sap.m.Input ({
			type:"Password",
			enabled: false
		}).addStyleClass("");
		
		//-- Cancel Button --//
		me.wCancelButton = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),
			type:"Default",
			text: "Cancel",
			press: function () {
				oController.CancelInput();
				IOMy.common.NavigationTriggerBackForward();
			}
		}).addStyleClass("width80px");
		
		//-- Submit Button --//
		me.wSubmitButton = new sap.m.Button({
			layoutData : new sap.m.FlexItemData({
				growFactor : 1
			}),									
			type:"Accept",
			text: "Submit",
			press: function () {
				oController.SubmitForm();
			}
		}).addStyleClass("width80px");
		
		//-- The page itself --//
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
									me.wFileTypeSelector,
								]
							}).addStyleClass("MarRight5px"),
							/* Parent VBox for Hub ID */
							new sap.m.VBox ({
								layoutData : new sap.m.FlexItemData({
									growFactor : 1
								}),
								items : [	
									new sap.m.Label ({
										text: "Hub:"
									}),
									me.wHubSelector,
								]
							}).addStyleClass("MarLeft5px")
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
									me.wProtocol
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
									me.wIPAddress
								]
							}).addStyleClass("MarLeft10px MarRight10px"),
							
							/* Parent VBox for Port */
							new sap.m.VBox ({
								items : [	
									new sap.m.Label ({
										text: "Port:"
									}),
									me.wIPPort
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
									me.wStreamPath
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
									me.wAuthenticationCheckBox
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
									me.wUsername
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
									me.wPassword
								]
							}).addStyleClass("")
						]
					}).addStyleClass("PadTop5px"),
					/* Parent HBox for Cancel, Apply, Discard */
					new sap.m.HBox ({	
						layoutData : new sap.m.FlexItemData({
							growFactor : 1
						}),
						items : [
							/* Cancel (Default Type) */
							me.wCancelButton,
							/* Submit (Accept Type) */
							me.wSubmitButton
						]
					}).addStyleClass("MarTop15px TextCenter")
				]
			}).addStyleClass("PadBottom10px MotionJPEG MarTop3px")
		);
		
		return oPage;
	}

});