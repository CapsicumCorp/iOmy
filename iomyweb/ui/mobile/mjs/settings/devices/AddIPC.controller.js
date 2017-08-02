/*
Title: Add IP Camera
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
	Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: UI backend for the form to add or edit a webcam.
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
	
	//------------------------------------------------------------------------//
	// Form Data
	//------------------------------------------------------------------------//
	sFileType				: null,
	iHubId					: null,
	sProtocol				: "",
	sIPAddress				: "",
	iIPPort					: "",
	sStreamPath				: "",
	bAuthenticationRequired	: false,
	sUsername				: "",
	sPassword				: "",
	
	bEditing				: false,
	iThingId				: 0,
	
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
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				//------------------------------------------------------------//
				// If the Thing ID is given, it will go into edit mode.
				//------------------------------------------------------------//
				if (evt.data.ThingId !== undefined) {
					me.byId("NavSubHead_Title").setText( IOMy.common.ThingList["_"+evt.data.ThingId].DisplayName.toUpperCase() );
					
					me.bEditing = true;
					me.iThingId = evt.data.ThingId;
					
					//--------------------------------------------------------//
					// Clear all fields, disable buttons, and show the loading
					// animation, hiding the panel.
					//--------------------------------------------------------//
					me.CancelInput();
					me.ToggleControlButtons(false);
					me.ToggleFields(false);
					thisView.byId("page").addContent(
						IOMy.common.showLoading({
							show : true,
							context : thisView
						})
					);
					thisView.wPanel.setVisible(false);
					
					//--------------------------------------------------------//
					// Load the camera information.
					//--------------------------------------------------------//
					IOMy.devices.ipcamera.loadCameraInformation({
						"thingID" : evt.data.ThingId,
						
						"onSuccess" : function (mData) {
							//------------------------------------------------//
							// Populate the fields and bring the page back up.
							//------------------------------------------------//
							thisView.wHubSelector.setSelectedKey(mData.Hub);
							thisView.wProtocol.setValue(mData.Protocol);
							thisView.wIPAddress.setValue(mData.Address);
							thisView.wIPPort.setValue(mData.Port);
							thisView.wStreamPath.setValue(mData.Path);
//							thisView.wUsername.setValue(mData.Username);
//							thisView.wPassword.setValue(mData.Password);

							//thisView.wAuthenticationCheckBox.setSelected(mData.AuthenticationRequired);
							
							me.ToggleControlButtons(true);
							me.ToggleFields(true);
							
							thisView.wPanel.setVisible(true);
							IOMy.common.showLoading({
								show : false,
								context : thisView
							});
						},
						
						"onFail" : function () {
							//------------------------------------------------//
							// Populate the fields.
							//------------------------------------------------//
							thisView.wPanel.setVisible(true);
							IOMy.common.showLoading({
								show : false,
								context : thisView
							});
							
							IOMy.common.showMessage({
								text : "Failed to load camera information",
								view : thisView
							});
						}
					});
				} else {
					me.bEditing = false;
				}
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
	
	/**
	 * Enables or disables all input fields. Called when loading data into the
	 * form or submitting data from the form.
	 * 
	 * @param {type} bEnabled		Enabled flag
	 */
	ToggleFields : function (bEnabled) {
		var oView = this.getView();
		
		oView.wFileTypeSelector.setEnabled(bEnabled);
		oView.wHubSelector.setEnabled(bEnabled);
		oView.wProtocol.setEnabled(bEnabled);
		oView.wIPAddress.setEnabled(bEnabled);
		oView.wIPPort.setEnabled(bEnabled);
		oView.wStreamPath.setEnabled(bEnabled);
		
//		if (oView.wAuthenticationCheckBox.getSelected() === true) {
//			this.ToggleAuthenticationFields(bEnabled);
//		} else {
//			this.ToggleAuthenticationFields(false);
//		}
//		
//		oView.wAuthenticationCheckBox.setEnabled(bEnabled);
	},
	
	/**
	 * Enables or disables the username and password fields. Called by the
	 * select event of the authentication checkbox.
	 * 
	 * @param {type} bEnabled		Enabled flag
	 */
	ToggleAuthenticationFields : function (bEnabled) {
		var oView = this.getView();
		
		oView.wUsername.setEnabled(bEnabled);
		oView.wPassword.setEnabled(bEnabled);
	},
	
	/**
	 * Enables or disables the cancel and submit buttons and any navigation
	 * buttons to prevent the user pressing them causing unwanted behaviour.
	 * Called once when the data is being loaded, or submitted, and again once
	 * completed.
	 * 
	 * @param {type} bEnabled		Enabled flag
	 */
	ToggleControlButtons : function (bEnabled) {
		var oView = this.getView();
		
		//-- Toggle buttons --//
		oView.wSubmitButton.setEnabled(bEnabled);
		oView.wCancelButton.setEnabled(bEnabled);
		
		//-- Toggle navigation buttons --//
		IOMy.common.NavigationToggleNavButtons(this, bEnabled);
	},
	
	/**
	 * Wipes all fields of content, resetting the form to its original state.
	 */
	CancelInput : function () {
		var oView = this.getView();
		
		//oView.wFileType.setSelectedIndex(null);
		oView.wHubSelector.setSelectedIndex(null);
		
		oView.wProtocol.setValue("");
		oView.wIPAddress.setValue("");
		oView.wIPPort.setValue("");
		oView.wStreamPath.setValue("");
		
//		oView.wAuthenticationCheckBox.setSelected(false);
//		oView.wUsername.setValue("");
//		oView.wPassword.setValue("");
		
	},
	
//	CheckAuthenticationFieldsForSpaces : function () {
//		var oView = this.getView();
//		
//		var sUsername = oView.wUsername.getValue();
//		var sPassword =	oView.wPassword.getValue();
//		
//		return (sUsername.indexOf(" ") > -1 || sPassword.indexOf(" ") > -1);
//	},
	
	/**
	 * Takes all of the data from the form and checks that all of the required
	 * fields are filled out. Once the data is verified, the API to create a new
	 * camera in the database will be executed.
	 * 
	 * The required parameters are:
	 * 
	 * * IP address
	 * * Stream path
	 * * Username and password (if the authentication check box is ticked)
	 * 
	 * The default port is 80. The default protocol is http.
	 */
	SubmitForm : function () {
		//--------------------------------------------------------------------//
		// Variables
		//--------------------------------------------------------------------//
		var me							= this;
		var oView						= me.getView();
		var bError						= false;
		var aErrorMessages				= [];
		var sMode						= "";
		var sAPIDataString				= "";
		var sFileType					= oView.wFileTypeSelector.getSelectedKey();
		var iHubId						= oView.wHubSelector.getSelectedKey();
		var sProtocol					= oView.wProtocol.getValue();
		var sIPAddress					= oView.wIPAddress.getValue();
		var sIPPort						= oView.wIPPort.getValue();
		var sStreamPath					= oView.wStreamPath.getValue();
//		var bAuthenticationRequired		= oView.wAuthenticationCheckBox.getSelected();
//		var sUsername					= oView.wUsername.getValue();
//		var sPassword					= oView.wPassword.getValue();
		var mIPAddressResult;
		
		var fnAppendError = function (sMessage) {
			bError = true;
			aErrorMessages.push(sMessage);
		};
		
		//-- Disable buttons to avoid race conditions. --//
		this.ToggleControlButtons(false);
		IOMy.common.NavigationToggleNavButtons(me, false); // Disable the navigation buttons.
		
		//--------------------------------------------------------------------//
		// Check that all the fields are filled out. Exception is the protocol
		// field, which defaults to 'http'
		//--------------------------------------------------------------------//
		
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
		
		//-- Stream Path --//
		if (sStreamPath === "") {
			fnAppendError("Path to the stream must be specified.");
		}
		
		//-- Check Port --//
		if (sIPPort === "") {
			sIPPort = "80";
		}
		
		//-- Check Protocol --//
		if (sProtocol === "") {
			sProtocol = "http";
		}
		
		//--------------------------------------------------------------------//
		// If authentication is required, check that the username and
		// password are specified.
		//--------------------------------------------------------------------//
//		if (bAuthenticationRequired) {
//			if (sUsername === "") {
//				fnAppendError("Username must be specified.");
//			}
//			
//			if (sPassword === "") {
//				fnAppendError("Password must be given.");
//			}
//			
//			if (me.CheckAuthenticationFieldsForSpaces() === true) {
//				fnAppendError("Neither the username nor the password can contain spaces.");
//			}
//		}
		
		//--------------------------------------------------------------------//
		// Report any errors via a message toast popup. Otherwise continue
		// execution.
		//--------------------------------------------------------------------//
		if (bError) {
			IOMy.common.showMessage({
				text : aErrorMessages.join("\n"),
				view : oView
			});
			
			me.ToggleControlButtons(true);
			IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
		} else {
			//----------------------------------------------------------------//
			// Prepare the 'Data' parameter string.
			//----------------------------------------------------------------//
			if (me.bEditing) {
				sMode = "Mode=EditIPCamera&ThingId="+me.iThingId;
			} else {
				sMode = "Mode=AddNewIPCamera";
			}
			
			sAPIDataString += sMode+"&IPCamType="+sFileType+"&HubId="+iHubId;
			sAPIDataString += "&Data={\"NetworkAddress\":\""+sIPAddress+"\",\"NetworkPort\":\""+sIPPort+"\",\"Protocol\":\""+sProtocol+"\",\"Path\":\""+sStreamPath+"\"";
			
//			if (bAuthenticationRequired) {
//				sAPIDataString += ",\"Username\":\""+sUsername+"\",\"Password\":\""+sPassword+"\"";
//			}
			sAPIDataString += "}";
		
			//----------------------------------------------------------------//
			// Run the request
			//----------------------------------------------------------------//
			IOMy.apiphp.AjaxRequest({
				"url"		: IOMy.apiphp.APILocation("ipcamera"),
				"type"		: "POST",
				"data"		: sAPIDataString,
				
				"onSuccess"	: function (responseType, data) {
					try {
						if (data.Error === true) {
							IOMy.common.showError(data.ErrMesg, "Error",
								function () {
									me.ToggleControlButtons(true);
									IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
								}
							);
							
						} else {
							IOMy.common.RefreshCoreVariables({
								
								onSuccess : function () {
									if (me.bEditing) {
										IOMy.common.showMessage({
											text : "Connection configuration updated successfully.",
											view : oView
										});
									} else {
										IOMy.common.showMessage({
											text : "Webcam successfully added!",
											view : oView
										});
									}
									
									me.CancelInput();
									IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
									IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
									me.ToggleControlButtons(true);
									me.ToggleFields(true);
								}
								
							});
							
						}
					} catch (ex) {
						IOMy.common.showMessage({
							text : "Error adding the camera: "+ex.message,
							view : oView
						});
						
						me.ToggleControlButtons(true);
						IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
					}
				},
				
				"onFail"	: function (error) {
					IOMy.common.showMessage({
						text : "Error adding the camera: "+error.responseText,
						view : oView
					});
					
					me.ToggleControlButtons(true);
					IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
				}
			});
		}
	}
	
});