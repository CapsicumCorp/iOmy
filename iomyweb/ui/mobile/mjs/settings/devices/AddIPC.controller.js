/*
Title: Add IP Camera
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: UI backend for the form to add a webcam.
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

sap.ui.controller("mjs.settings.devices.AddIPC", {
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.devices.AddIPC
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.devices.AddIPC
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.devices.AddIPC
*/
	onAfterRendering: function() {
		
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.devices.AddIPC
*/
	onExit: function() {

	},
	
	ToggleAuthenticationFields : function (bEnabled) {
		var oView = this.getView();
		
		oView.wUsername.setEnabled(bEnabled);
		oView.wPassword.setEnabled(bEnabled);
	},
	
	ToggleControlButtons : function (bEnabled) {
		var oView = this.getView();
		
		//-- Toggle buttons --//
		oView.wSubmitButton.setEnabled(bEnabled);
		oView.wCancelButton.setEnabled(bEnabled);
		
		//-- Toggle navigation buttons --//
		IOMy.common.NavigationToggleNavButtons(this, bEnabled);
	},
	
	CancelInput : function () {
		var oView = this.getView();
		
		//oView.wFileType.setSelectedIndex(null);
		oView.wHubSelector.setSelectedIndex(null);
		
		oView.wProtocol.setValue("");
		oView.wIPAddress.setValue("");
		oView.wIPPort.setValue("");
		oView.wStreamPath.setValue("");
		
		oView.wAuthenticationCheckBox.setSelected(false);
		oView.wUsername.setValue("");
		oView.wPassword.setValue("");
		
	},
	
	SubmitForm : function () {
		//-- Disable buttons to avoid race conditions. --//
		this.ToggleControlButtons(false);
		
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var me							= this;
		var oView						= me.getView();
		var bError						= false;
		var aErrorMessages				= [];
		var sAPIDataString				= "";
		var sFileType					= oView.wFileTypeSelector.getSelectedKey();
		var iHubId						= oView.wHubSelector.getSelectedKey();
		var sProtocol					= oView.wProtocol.getValue();
		var sIPAddress					= oView.wIPAddress.getValue();
		var sIPPort						= oView.wIPPort.getValue();
		var sStreamPath					= oView.wStreamPath.getValue();
		var bAuthenticationRequired		= oView.wAuthenticationCheckBox.getSelected();
		var sUsername					= oView.wUsername.getValue();
		var sPassword					= oView.wPassword.getValue();
		var mIPAddressResult;
		
		var fnAppendError = function (sMessage) {
			bError = true;
			aErrorMessages.push(sMessage);
		};
		
		//--------------------------------------------------------------------//
		// Check that all the fields are filled out. Exception is the protocol
		// field, which defaults to 'http'
		//--------------------------------------------------------------------//
		if (sProtocol === "") {
			sProtocol = "http";
		}
		
		//-- Check IP Address --//
		if (sIPAddress === "") {
			fnAppendError("IP Address must be specified!");
		} else {
			//-- Verify that the IP address format is correct. --//
			try {
				mIPAddressResult = IOMy.validation.isIPv4AddressValid(sIPAddress);
				
				bError = !mIPAddressResult.bValid;
				aErrorMessages = aErrorMessages.concat(mIPAddressResult.aErrorMessages);
			} catch (ex) {
				fnAppendError("Could not validate IP address: " + ex.name + ", " + ex.message);
			}
		}
		
		//-- Check Port --//
		if (sIPPort === "") {
			sIPPort = "80";
		}
		
		//-- Stream Path --//
		if (sStreamPath === "") {
			fnAppendError("Path to the stream must be specified.");
		}
		
		//-- If authentication is required, check that the username and --//
		//-- password is specified.										--//
		if (bAuthenticationRequired) {
			if (sUsername === "") {
				fnAppendError("Username must be specified.");
			}
			
			if (sPassword === "") {
				fnAppendError("Password must be given.");
			}
		}
		
		//--------------------------------------------------------------------//
		// Report any errors via a message toast popup. Otherwise continue
		// execution.
		//--------------------------------------------------------------------//
		if (bError) {
			IOMy.common.showMessage(aErrorMessages.join("\n"));
			me.ToggleControlButtons(true);
		} else {
//			IOMy.common.NavigationToggleNavButtons(me, false);
//			setTimeout(
//				function () {
//					IOMy.common.NavigationToggleNavButtons(me, true);
//					IOMy.common.showSuccess("Success!");
//					me.CancelInput();
//					IOMy.common.NavigationTriggerBackForward();
//				}, 5000
//			);

			//----------------------------------------------------------------//
			// Prepare the 'Data' parameter string.
			//----------------------------------------------------------------//
			sAPIDataString += "Mode=AddNewIPCamera&IPCamType="+sFileType+"&HubId="+iHubId;
			sAPIDataString += "&Data={\"NetworkAddress\":\""+sIPAddress+"\",\"NetworkPort\":\""+sIPPort+"\",\"Protocol\":\""+sProtocol+"\",\"Path\":\""+sStreamPath+"\"";
			// TODO: Place the parameters for the username and password once they become available
			if (bAuthenticationRequired) {
				sAPIDataString += ",\"Username\":\""+sUsername+"\",\"Password\":\""+sPassword+"\"";
			}
			sAPIDataString += "}";
		
			IOMy.apiphp.AjaxRequest({
				"url"		: IOMy.apiphp.APILocation("ipcamera"),
				"type"		: "POST",
				"data"		: sAPIDataString,
				
				"onSuccess"	: function (responseType, data) {
					try {
						if (data.Error === true) {
							IOMy.common.showMessage(data.ErrMesg, "Error");
							me.ToggleControlButtons(true);
						} else {
							IOMy.common.RefreshCoreVariables({
								
								onSuccess : function () {
									IOMy.common.showMessage("Webcam successfully added!");
									me.CancelInput();
									IOMy.common.NavigationTriggerBackForward();
									me.ToggleControlButtons(true);
								}
								
							});
							
						}
					} catch (ex) {
						IOMy.common.showMessage("Error adding the camera: "+ex.message);
						me.ToggleControlButtons(true);
					}
				},
				
				"onFail"	: function (error) {
					IOMy.common.showMessage("Error adding the camera: "+error.responseText);
					me.ToggleControlButtons(true);
				}
			});
		}
	}
	
});