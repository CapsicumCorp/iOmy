/*
Title: Add Link page UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the form to add a link.
Copyright: Capsicum Corporation 2016, 2017

This file is part of the iOmy project.

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

sap.ui.controller("mjs.settings.links.LinkAdd", {
    
    // WIDGETS
    // TODO: Have all major widgets defined in the scope of the controller itself
    // rather than in DrawUI().
    wDeviceOptionCBox       : null,
	wDeviceOptionCBoxHolder : null,
    wRoomCBox               : null,
    wRoomCBoxHolder         : null,
    wVertBox                : null,
    
    bUIReadyToBeWiped			: true,
    aElementsToDestroy			: [],
    aElementsForAFormToDestroy	: [],
	
	iLinkTypeId			: null,
	iLinkId				: null,
	
	DeviceOptions		: IOMy.functions.getNewDeviceOptions(),
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.links.LinkAdd
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				
				if (evt.data.LinkTypeId !== undefined) {
					me.iLinkTypeId = evt.data.LinkTypeId;
				}
				
				// Start the form creation
				me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
				me.DrawUI();            // STEP 2: Draw the actual user interface        
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.links.LinkAdd
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.links.LinkAdd
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.links.LinkAdd
*/
//	onExit: function() {
//
//	},

    ValidateFormData : function () {
        var me                      = this;
        //var mHubInfo                = {};
        var mIPAddressInfo          = {};
        var mIPPortInfo				= {};
        var mDeviceUserTokenInfo    = {};
        var mOpenWeatherMapInfo     = {};
		var mOnvifStreamInfo		= {};
        var mValidationInfo         = {};
        var bError                  = false;
        var aErrorMessages          = [];
		var mEntry					= me.DeviceOptions[ me.byId("linkTypeCBox").getSelectedKey() ];
        var iId                     = null;
        
        //mHubInfo        = me.ValidateHub();
        //mLinkTypeInfo   = me.ValidateLinkType();
        
//        if (mHubInfo.bError === true) {
//            bError = true;
//            aErrorMessages = aErrorMessages.concat(mHubInfo.aErrorMessages);
//        }
        
//        if (mLinkTypeInfo.bError === true) {
//            bError = true;
//            aErrorMessages = aErrorMessages.concat(mLinkTypeInfo.aErrorMessages);
//        }
        
        if (bError === false) {
            try {
				if (mEntry.Type === "type") {
					//====================================================================//
					// ONVIF SERVER                                                       //
					//====================================================================//
					if (mEntry.Id == 6) {
						//-------------------------------------------------//
						// Is the IP address and port present and correct? //
						//-------------------------------------------------//
						mIPAddressInfo = IOMy.validation.isIPv4AddressValid( me.byId("IPAddressField").getValue() );
						mIPPortInfo = IOMy.validation.isIPv4PortValid( me.byId("IPPortField").getValue() );
						
						if (mIPAddressInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mIPAddressInfo.aErrorMessages);
						}
						
						if (mIPPortInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mIPPortInfo.aErrorMessages);
						}

					//====================================================================//
					// PHILIPS HUE BRIDGE                                                 //
					//====================================================================//
					} else if (mEntry.Id == 7) {
						//-------------------------------------------------//
						// Is the IP address and port present and correct? //
						//-------------------------------------------------//
						mIPAddressInfo = IOMy.validation.isIPv4AddressValid( me.byId("IPAddressField").getValue() );
						mIPPortInfo = IOMy.validation.isIPv4PortValid( me.byId("IPPortField").getValue() );
						
						if (mIPAddressInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mIPAddressInfo.aErrorMessages);
						}
						
						if (mIPPortInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mIPPortInfo.aErrorMessages);
						}

						//-------------------------------------------------//
						// Is the device user token given?                 //
						//-------------------------------------------------//
						mDeviceUserTokenInfo = me.ValidateDeviceUserToken();
						if (mDeviceUserTokenInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mDeviceUserTokenInfo.aErrorMessages);
						}

					//====================================================================//
					// OPEN WEATHER MAP                                                   //
					//====================================================================//
					} else if (mEntry.Id == 8) {
						mOpenWeatherMapInfo = IOMy.devices.weatherfeed.ValidateLinkFormData(me);
						if (mOpenWeatherMapInfo.bError === true) {
							bError = true;
							aErrorMessages = aErrorMessages.concat(mOpenWeatherMapInfo.aErrorMessages);
						}
					}
					
				} else if (mEntry.Type === "device") {
					mOnvifStreamInfo = IOMy.devices.onvif.ValidateThingFormData(me);
					if (mOnvifStreamInfo.bError === true) {
						bError = true;
						aErrorMessages = aErrorMessages.concat(mOnvifStreamInfo.aErrorMessages);
					}
				}
            } catch (e) {
                bError = true;
                aErrorMessages.push("Error 0x1000: There was an error validating form data: "+e.message);
            }
        }
        
        mValidationInfo.bError = bError;
        mValidationInfo.aErrorMessages = aErrorMessages;
        
        return mValidationInfo;
    },
    
//    ValidateHub : function () {
//        var me                      = this;
//        var bError                  = false;
//        var aErrorMessages          = [];
//        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
//        
//        //-------------------------------------------------//
//        // Is the hub a proper hub (does it have an ID)    //
//        //-------------------------------------------------//
//        try {
//            // TODO: Is this really needed anymore?
//            if (me.byId("hubCBox").getSelectedKey() === "") {
//                bError = true;
//                aErrorMessages.push("Hub is not valid");
//            }
//        } catch (e) {
//            bError = true;
//            aErrorMessages.push("Error 0x1001: There was an error checking the hub: "+e.message);
//        }
//        
//        // Prepare the return value
//        mInfo.bError = bError;
//        mInfo.aErrorMessages = aErrorMessages;
//        
//        return mInfo;
//    },
    
//    ValidateLinkType : function () {
//        var me                      = this;
//        var bError                  = false;
//        var aErrorMessages          = [];
//        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
//        
//        //----------------------------------------------------------//
//        // Is the link type a proper link type (does it have an ID) //
//        //----------------------------------------------------------//
//        try {
//            // -- #TODO:# Is this really needed anymore? -- //
//            if (me.byId("linkTypeCBox").getSelectedKey() === "") {
//                bError = true;
//                aErrorMessages.push("Link type is not valid");
//            }
//        } catch (e) {
//            bError = true;
//            aErrorMessages.push("Error 0x1002: There was an error checking the link type: "+e.message);
//        }
//        
//        // Prepare the return value
//        mInfo.bError = bError;
//        mInfo.aErrorMessages = aErrorMessages;
//        
//        return mInfo;
//    },
    
    ValidateIPAddress : function () {
        var me                      = this;
        var bError                  = false;
        var bIPAddressFormatError   = false;
        var aErrorMessages          = [];
        var mInfo                   = {};
        // IP Address validation
        var aThreeDots;
        var aIPAddressParts;
        // Form data variables
        var sIPAddress              = me.byId("IPAddressField").getValue();
        var sIPPort                 = me.byId("IPPortField").getValue();
        
        //-------------------------------------------------//
        // Is the IP address given?                        //
        //-------------------------------------------------//
        try {
            if (sIPAddress === "") {
                bError = true; // No
                aErrorMessages.push("IP address must be filled out");

            //-------------------------------------------------//
            // If so, is it a valid IP address?                //
            //-------------------------------------------------//
            } else {
                //-------------------------------------------------//
                // Are there three dots in the IP Address?         //
                //-------------------------------------------------//
                aThreeDots = sIPAddress.match(/\./g);

                if (aThreeDots === null || aThreeDots.length !== 3) {
                    bError = true; // No. FAIL!
                    aErrorMessages.push("IP address is not valid - there must be only 4 parts separated by dots ('.') in an IPv4 address");
                } else {
                    //---------------------------------------------------------//
                    // There are three dots. Are the four parts valid numbers? //
                    //---------------------------------------------------------//
                    aIPAddressParts = sIPAddress.split('.');

                    // Check each number
                    for (var i = 0; i < aIPAddressParts.length; i++) {
                        for (var j = 0; j < aIPAddressParts[i].length; j++) {
                            // Spaces and the plus symbol are ignored by isNaN(). isNaN() covers the rest.
                            if (aIPAddressParts[i].charAt(j) === ' ' || aIPAddressParts[i].charAt(j) === '+' || isNaN(aIPAddressParts[i].charAt(j))) {
                                bIPAddressFormatError = true; // INVALID CHARACTER
                                break;
                            }
                        }

                        if (bIPAddressFormatError === true) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers contains invalid characters");
                            break;
                        } else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers is greater than 255 or a negative number");
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1003: There was an error checking the IP Address: "+e.message);
        }
        
        //-------------------------------------------------//
        // Is the port given?                              //
        //-------------------------------------------------//
        try {
            if (sIPPort === "") {
                bError = true;
                aErrorMessages.push("IP port must be filled out");
            // Now, is the port a valid number...
            } else {
                for (var i = 0; i < sIPPort.length; i++) {
                    // Spaces, and the plus and minus symbols are ignored by isNaN(). isNaN() covers the rest.
                    if (sIPPort.charAt(i) === ' ' || sIPPort.charAt(i) === '-' ||
                        sIPPort.charAt(i) === '+' || isNaN(sIPPort.charAt(i)))
                    {
                        bError = true; // INVALID CHARACTER!
                        aErrorMessages.push("IP port not valid");
                        break;
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1004: There was an error checking the IP Port: "+e.message);
        }
        
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    /**
     * Validates the device user token for a new Philips Hue Bridge.
     * 
     * @returns             Validation results
     */
    ValidateDeviceUserToken : function () {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------//
        // Is the device user token given?                 //
        //-------------------------------------------------//
        try {
            if (me.byId("DeviceUserTokenField").getValue() === "") {
                bError = true; // No.
                aErrorMessages.push("Device user token for this bridge must be filled out");
            }
        } catch (e) {
            bError = true; // No.
            aErrorMessages.push("Error 0x1005: There was an error checking the device user token: "+e.message);
        }
        
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    /**
     * Fetches a map of information to use when performing an AJAX request on an API that
     * will add a link or bridge. It will produce a map that contains the URL, API
     * parameters, function to call if successful and another to call for failure. The URL
     * and the API parameters will differ depending on the link type selected.
     * 
     * @returns {map}
     */
    FetchAPIAndParameters : function () {
        var me					= this;           // Preserving this scope
        var mData				= {};             // Map for the AJAX request
		var mOnvifCamValidation	= {};
        var sLinkType			= "";
		var sSBoxKey			= me.byId("linkTypeCBox").getSelectedItem().getKey();
		var mEntry				= me.DeviceOptions[sSBoxKey];
        
        try {
			if (mEntry.Type === "type") {
				//--------------------------------------------------------------------//
				// ONVIF SERVER                                                       //
				//--------------------------------------------------------------------//
				if (mEntry.Id == 6) {
					sLinkType = "Onvif Server";

					mData.url = IOMy.apiphp.APILocation("onvif");
					mData.data = {
						"Mode" : "AddNewOnvifServer",
						"HubId" : me.byId("hubCBox").getSelectedKey(),
						"DeviceNetworkAddress" : me.byId("IPAddressField").getValue(),
						"DeviceOnvifPort" : me.byId("IPPortField").getValue(),
						"OnvifUsername" : me.byId("Username").getValue(),
						"OnvifPassword" : me.byId("Password").getValue()
					};
				//--------------------------------------------------------------------//
				// PHILIPS HUE BRIDGE                                                 //
				//--------------------------------------------------------------------//
				} else if (mEntry.Id == 7) {
					sLinkType = "Philips Hue Bridge";

					mData.url = IOMy.apiphp.APILocation("philipshue");
					mData.data = {
						"Mode" : "AddNewBridge",
						"HubId" : me.byId("hubCBox").getSelectedKey(),
						"DeviceNetworkAddress" : me.byId("IPAddressField").getValue(),
						"DevicePort" : me.byId("IPPortField").getValue(),
						"DeviceUserToken" : me.byId("DeviceUserTokenField").getValue()
					};
				//--------------------------------------------------------------------//
				// WEATHER STATION                                                    //
				//--------------------------------------------------------------------//
				} else if (mEntry.Id == 8) {
					sLinkType = "Open Weather Map Feed";

					mData = IOMy.devices.weatherfeed.FetchAddLinkAPIAndParameters(me);
				}
				
			} else if (mEntry.Type === "device") {

				sLinkType = "Onvif Stream";

                mData.url = IOMy.apiphp.APILocation("onvif");
                mData.data = {
                    "Mode" : "NewThing",
                    "LinkId" : me.iLinkId,
                    "StreamProfile" : me.byId("StreamProfileField").getSelectedKey(),
                    "ThumbnailProfile" : me.byId("ThumbnailProfileField").getSelectedKey(),
                    "CameraName" : me.byId("CameraNameField").getValue()
                };
			}
        } catch (e2000) {
            throw "Error 0x2000: "+e2000.message;
        }
        
        // These functions are not necessarily to do with a specific device type.
        mData.onSuccess = function (response, data) {
            jQuery.sap.log.debug("Success: "+JSON.stringify(response));
            jQuery.sap.log.debug("Success: "+JSON.stringify(data));
            
            //--------------------------------------------------------------//
            // Find the new Link ID                                         //
            //--------------------------------------------------------------//
            var iLinkId = 0;
            
            // Should be in this variable
            if (data.Data !== undefined) {
                if (data.Data.LinkId !== undefined) {
                    iLinkId = data.Data.LinkId;
                }
            // I found the Open Weather Map feed link ID in this variable!
            } else if (data.WeatherStation !== undefined) {
                if (data.WeatherStation.LinkId !== undefined) {
                    iLinkId = data.WeatherStation.LinkId;
                }
            } else {
                jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                IOMy.common.showError("Error creating "+sLinkType+":\n\n"+error.responseText);
            }
			
			console.log(iLinkId);

            try {
                // REFRESH LINK LIST
                if (data.Error === false || data.Error === undefined) {
					IOMy.common.RefreshCoreVariables({
						onSuccess : function () {
							IOMy.common.showMessage({
								text : sLinkType+" successfully created",
								view : me.getView()
							});
							
							// Set the flag to clear the way for a new UI instance
							me.bUIReadyToBeWiped = true;

							if (me.DeviceOptions[ me.wDeviceOptionCBox.getSelectedKey() ].Type === "type") {
								var fnSuccess;
								var fnFail;

								fnSuccess = function () {
									IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.

									if (IOMy.functions.getLinkTypeIDOfLink(iLinkId) === 6) {
										me.DeviceOptions = IOMy.functions.getNewDeviceOptions();

										me.wDeviceOptionCBox.destroy();
										me.wDeviceOptionCBox = IOMy.widgets.selectBoxNewDeviceOptions(me.createId("linkTypeCBox")).addStyleClass("SettingsDropDownInput");
										me.wDeviceOptionCBox.setSelectedKey("device"+iLinkId);
										me.wDeviceOptionCBoxHolder.addItem( me.wDeviceOptionCBox );

										me.ChangeLinkForm(me.wDeviceOptionCBox);
									} else {
										IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
									}
								};

								fnFail = function (err) {
									IOMy.common.showWarning("Successfully created device, but could not place it in "+me.wRoomCBox.getSelectedItem().getText()+".", "Warning", fnSuccess);

								};

								if (me.wRoomCBox !== null) {
									IOMy.devices.AssignDeviceToRoom({
										"linkID" : iLinkId,
										"roomID" : me.wRoomCBox.getSelectedKey(),

										"onSuccess" : fnSuccess,
										"onFail"	: fnFail
									});
								} else {
									fnSuccess();
								}
							} else {
								IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
							}
						}
					});
							
                } else {
                    jQuery.sap.log.error("Error creating "+sLinkType+":"+data.ErrMesg, "Error");
                    IOMy.common.showError("Error creating "+sLinkType+":\n\n"+data.ErrMesg, "Error");
                }
            } catch (e) {
                jQuery.sap.log.error("Error refreshing core variables: "+e.message);
                IOMy.common.showWarning(sLinkType+" successfully created but there was an error refreshing core variables: "+e.message, "Errors");
            }
        };
        
        mData.onFail = function (error) {
            jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            IOMy.common.showError("Error creating "+sLinkType+":\n\n"+error.responseText);
            
            // Re-enable the add link button
            me.byId("addButton").setEnabled(true);
        };
        
        return mData;
    },
    
    ChangeLinkForm : function (oSBox) {
        var me = this;
        // Grab the link type ID
        var sKey		= oSBox.getSelectedKey();
		var mEntry		= me.DeviceOptions[sKey];
        var iLinkTypeId;

        // Erase the old set of fields
        me.DestroySpecificFormUI();

        //-------------------------------------//
        // Choose a form to load               //
        //-------------------------------------//

		if (mEntry.Type === "type") {
			iLinkTypeId = mEntry.Id;
			me.iLinkId = null;
			
			me.byId("addButton").setEnabled(true);
			
			// If the form is for the Zigbee device type, hide the add device button.
			if (iLinkTypeId == 2) {
				me.byId("addButton").setVisible(false);
			} else {
				me.byId("addButton").setVisible(true);
			}
			
			// Zigbee 
			if (iLinkTypeId == 2) {
				IOMy.devices.zigbeesmartplug.CreateLinkForm(me, me.byId("formBox"));
				IOMy.devices.zigbeesmartplug.PopulateTelnetLogArea(me);
			// Onvif Server
			} else if (iLinkTypeId == 6) {
				me.CreateOnvifServerForm();
			// Philips Hue Bridge
			} else if (iLinkTypeId == 7) {
				me.CreatePhilipsHueBridgeForm();
			// Open Weather Map
			} else if (iLinkTypeId == 8) {
				IOMy.devices.weatherfeed.CreateLinkForm(me, me.byId("formBox"));
			}
		} else if (mEntry.Type === "device") {
			me.iLinkId = mEntry.Id;
			me.byId("addButton").setEnabled(false);
			me.byId("addButton").setVisible(true);
			
			IOMy.devices.onvif.CreateThingForm(me, me.iLinkId, me.byId("formBox"), [me.byId("addButton")]);
		}
    },

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
			}
        }
		
		if (me.wRoomCBox !== null) {
			me.wRoomCBox.destroy();
		}
        
        if (me.wVertBox !== null) {
            me.wVertBox.destroy();
        }
        
        // Destroy whatever other elements are left.
        me.DestroySpecificFormUI();
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    /**
     * Procedure that destroys specific form elements. These elements pertain to the a 
     */
    DestroySpecificFormUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsForAFormToDestroy.length; i++) {
            sCurrentID = me.aElementsForAFormToDestroy[i];
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
            }
        }
        
        // Clear the array
        me.aElementsForAFormToDestroy = [];
    },

    /**
     * Constructs the user interface for the form to add a link.
     */
    DrawUI : function() {
        //===============================================//
        // DECLARE VARIABLES                             //
        //===============================================//
        var me = this;
        var thisView = me.getView();
        // UI5 Objects used in all link forms
        var oLinkTypeLabel, oHubLabel;
        var oHubCBox;
        var oRoomLabel;
        var oAddButton; // Button to add link
        var oFormBox, oPanel; // Container elements
        
        //=======================================================//
        // CONSTRUCT ELEMENTS                                    //
        //=======================================================//
        
        // Refresh the Navigational buttons
        IOMy.common.NavigationRefreshButtons( me );
        
        //-------------------------------------------------------//
        // HUB SELECT BOX                                        //
        //-------------------------------------------------------//
        oHubLabel = new sap.m.Label({
            text : "Hub to connect this device to"
        });
        
        oHubCBox = IOMy.widgets.getHubSelector(me.createId("hubCBox")).addStyleClass("width100Percent SettingsDropDownInput");
        
        //-------------------------------------------------------//
        // ROOM SELECT BOX                                       //
        //-------------------------------------------------------//
        oRoomLabel = new sap.m.Label({
            text : "Room to put this device in"
        });
        
		try {
			me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_1").addStyleClass("width100Percent SettingsDropDownInput");
			me.wRoomCBox.setSelectedItem(null);

			me.wRoomCBoxHolder = new sap.m.VBox({
				items : [me.wRoomCBox]
			}).addStyleClass("width100Percent");
		} catch (ex) {
			me.wRoomCBoxHolder = null;
			me.wRoomCBox = null;
		} finally {
			if (IOMy.functions.getNumberOfRooms() === 0) {
				oRoomLabel.setVisible(false);
			}
		}
        
        //-------------------------------------------------------//
        // LINK TYPE SELECT BOX                                  //
        //-------------------------------------------------------//
        oLinkTypeLabel = new sap.m.Label({
            text : "Device"
        });
        
        me.wDeviceOptionCBox = IOMy.widgets.selectBoxNewDeviceOptions(me.createId("linkTypeCBox")).addStyleClass("SettingsDropDownInput");
		//me.wDeviceOptionCBox.setSelectedKey(me.iLinkTypeId);
        me.wDeviceOptionCBox.attachChange(
            function () {
                me.ChangeLinkForm(this);
            }
        );
	
		me.wDeviceOptionCBoxHolder = new sap.m.VBox({
			items : [me.wDeviceOptionCBox]
		}).addStyleClass("width100Percent");
        
        //-------------------------------------------------------//
        // FORM BOX                                              //
        //-------------------------------------------------------//
        me.aElementsToDestroy.push("formBox");
        oFormBox = new sap.m.VBox(me.createId("formBox"),{});
        
        //=======================================================//
        // PLACE ALL THE PIECES TOGETHER                         //
        //=======================================================//
        
        me.wVertBox = new sap.m.VBox({
            items : [
                oHubLabel,oHubCBox,
                oLinkTypeLabel,me.wDeviceOptionCBoxHolder,
                oRoomLabel,me.wRoomCBoxHolder,
                oFormBox
            ]
        }).addStyleClass("UserInputForm");
        
        //-------------------------------------------------------//
        // Add device button
        //-------------------------------------------------------//
        me.aElementsToDestroy.push("addButton");
        oAddButton = new sap.m.VBox({
            items : [
                new sap.m.Link(me.createId("addButton"), {
                    text : "Add Device",
					
                    //--------------------------------------------------------------------//
                    // Add Device, TODO: Move these functions into separate areas!
                    //--------------------------------------------------------------------//
                    press : function() {
                        var thisButton = this; // Captures the scope of the calling button.
                        thisButton.setEnabled(false); // Lock the button
                        
                        // Error checking variables
						var bError                  = false;
						var mInfo                   = false;
						var aErrorMessages          = [];
						var sErrorMessage           = "";
                
                        // VALIDATE FORM DATA
                        if (bError === false) {
                            mInfo = me.ValidateFormData();
                            bError = mInfo.bError;
                            aErrorMessages = mInfo.aErrorMessages;

                            //------------------------------------------------//
                            // Try to add the device                          //
                            //------------------------------------------------//
                            try {
                                // IF EVERYTHING IS VALID, ADD THE DEVICE
                                if (bError === false) {
                                    var mData = me.FetchAPIAndParameters();
                                    IOMy.apiphp.AjaxRequest(mData);

                                // OTHERWISE BRING UP AN ERROR MESSAGE ON THE SCREEN 
                                } else {
                                    if (aErrorMessages.length === 1) {
                                        sErrorMessage = "There was an error: \n\n"+aErrorMessages.join('\n');
                                    } else {
                                        sErrorMessage = "There were "+aErrorMessages.length+" errors:\n\n"+aErrorMessages.join('\n\n');
                                    }

                                    jQuery.sap.log.error(sErrorMessage);
                                    IOMy.common.showError(sErrorMessage, "",
										function () {
											thisButton.setEnabled(true);
										}
									);
                                }
                            } catch (e) {
                                bError = true; // No.
                                aErrorMessages.push("Error 0x1010: There was an error retrieving the API parameters: "+e.message);
                                
                                if (aErrorMessages.length === 1) {
                                    sErrorMessage = "There was an error: \n\n"+aErrorMessages.join('\n');
                                } else {
                                    sErrorMessage = "There were "+aErrorMessages.length+" errors:\n\n"+aErrorMessages.join('\n\n');
                                }
                                
                                jQuery.sap.log.error(sErrorMessage);
                                IOMy.common.showError(sErrorMessage, "", 
									function () {
										thisButton.setEnabled(true);
									}
								);
                            }
                        }
                    }
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
            ]
        }).addStyleClass("TextCenter MarTop12px");
        me.wVertBox.addItem(oAddButton);
        
        me.aElementsToDestroy.push("panel");
        oPanel = new sap.m.Panel(me.createId("panel"), {
            content : [me.wVertBox]
        });
        
        thisView.byId("page").addContent(oPanel);
        
        // Disable the refresh functionality until a new link is added.
        me.bUIReadyToBeWiped = false;
        
        // Create the rest of the link form.
        me.ChangeLinkForm(me.wDeviceOptionCBox);
		
		
    },
    
	
	// #TODO:# Move Function to "util\devices\onvif.js"
    CreateOnvifServerForm : function () {
        //===============================================//
        // DECLARE VARIABLES                             //
        //===============================================//
        
        var me = this;                  // Used for capturing this scope.
        
        // Labels
        var oIPAddressAndPortLabel;
        var oDeviceUserNameLabel;
        var oDeviceUserPasswordLabel;
        // Fields
        // --IP Address and Port
        var oIPAddressField;            // sap.m.Input
        var oColon;                     // sap.m.Text
        var oIPPort;                    // sap.m.Input
        var oIPAddressAndPortBox;       // sap.m.HBox
        // --Device User Token
        var oDeviceUserNameField;      // sap.m.Input
        var oDeviceUserPasswordField;  // sap.m.Input
        
        //--------------------------------------------------------------------//
        // Change the help message for the New Link page.
        //--------------------------------------------------------------------//
		// TODO: Stick this in the locale file. Alter the mechanism to accommodate these extra messages.
        IOMy.help.PageInformation["pSettingsLinkAdd"] = "" +
            "To create an Onvif Server, enter the IP address and port of the " +
            "onvif supported camera. The default port is normally 888.\n\nAfter " +
            "the server is created, iOmy will take you to add a camera item to " +
            "the newly created server.";
        
        //===============================================//
        // CONSTRUCT ELEMENTS                            //
        //===============================================//
        
        //-----------------------------------------------//
        // IP ADDRESS AND PORT                           //
        //-----------------------------------------------//
        
        // IP ADDRESS LABEL
        me.aElementsForAFormToDestroy.push("IPAddressLabel");
        oIPAddressAndPortLabel = new sap.m.Label(me.createId("IPAddressLabel"), {
            text : "IP Address and port (eg. 10.9.9.9:80)"
        });
        me.byId("formBox").addItem(oIPAddressAndPortLabel);
        
        // IP ADDRESS INPUT
        me.aElementsForAFormToDestroy.push("IPAddressField");
        oIPAddressField = new sap.m.Input(me.createId("IPAddressField"), {
			layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
			placeholder : "Enter IP Address..."
		}).addStyleClass("SettingsTextInput");
        
		// TEXT BOX
        me.aElementsForAFormToDestroy.push("Colon");
        oColon = new sap.m.Text(me.createId("Colon"), {
            text : ":"
        }).addStyleClass("PadLeft5px PadRight5px FlexNoShrink MarTop15px");
        
		// PORT INPUT
        me.aElementsForAFormToDestroy.push("IPPortField");
        oIPPort = new sap.m.Input(me.createId("IPPortField"), {
            value : "888",
			placeholder : "Port"
        }).addStyleClass("maxwidth80px SettingsTextInput");
        
		// HBOX CONTAINER
        me.aElementsForAFormToDestroy.push("IPBox");
        oIPAddressAndPortBox = new sap.m.HBox(me.createId("IPBox"), {
			layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
            items : [ oIPAddressField,oColon,oIPPort ]
        }).addStyleClass("IPAddressBox");
        me.byId("formBox").addItem(oIPAddressAndPortBox);
        
        //-----------------------------------------------//
        // USERNAME                                      //
        //-----------------------------------------------//
        
        // LABEL
        me.aElementsForAFormToDestroy.push("UsernameLabel");
        oDeviceUserNameLabel = new sap.m.Label(me.createId("UsernameLabel"), {
            text : "Username"
        });
        me.byId("formBox").addItem(oDeviceUserNameLabel);
        
        // FIELD
        me.aElementsForAFormToDestroy.push("Username");
        oDeviceUserNameField = new sap.m.Input(me.createId("Username"), {
			placeholder : "Username for the camera"
		}).addStyleClass("width100Percent SettingsTextInput");
        me.byId("formBox").addItem(oDeviceUserNameField);
        
        //-----------------------------------------------//
        // PASSWORD                                      //
        //-----------------------------------------------//
        
        // LABEL
        me.aElementsForAFormToDestroy.push("PasswordLabel");
        oDeviceUserPasswordLabel = new sap.m.Label(me.createId("PasswordLabel"), {
            text : "Password"
        });
        me.byId("formBox").addItem(oDeviceUserPasswordLabel);
        
        // FIELD
        me.aElementsForAFormToDestroy.push("Password");
        oDeviceUserPasswordField = new sap.m.Input(me.createId("Password"), {
            type : sap.m.InputType.Password,
			placeholder : "Password for the camera"
        }).addStyleClass("width100Percent SettingsTextInput");
        me.byId("formBox").addItem(oDeviceUserPasswordField);
    },
    
	
	// #TODO:# Move Function to "util\devices\philipshue.js" 
    CreatePhilipsHueBridgeForm : function () {
        //===============================================//
        // DECLARE VARIABLES                             //
        //===============================================//
        
        var me = this;                  // Used for capturing this scope.
        
        // Labels
        var oIPAddressAndPortLabel;
        var oDeviceUserTokenLabel;
        // Fields
        // IP Address and Port
        var oIPAddressField;            // sap.m.Input
        var oColon;                     // sap.m.Text
        var oIPPort;                    // sap.m.Input
        var oIPAddressAndPortBox;       // sap.m.HBox
        // Device User Token
        var oDeviceUserTokenField;      // sap.m.Input
        
        //--------------------------------------------------------------------//
        // Change the help message for the New Link page.
        //--------------------------------------------------------------------//
		// TODO: Stick this in the locale file. Alter the mechanism to accommodate these extra messages.
        IOMy.help.PageInformation["pSettingsLinkAdd"] = "" +
            "Enter the IP address and port of the Philips Hue bridge, and also " +
            "the device user token for your device. This is located in your " +
            "Philips Hue bridge manual.\n\nAdding the bridge to iOmy will also " +
            "attempt to add all devices attached to the bridge as items in iOmy.";
        
        //===============================================//
        // CONSTRUCT ELEMENTS                            //
        //===============================================//
        
        //-----------------------------------------------//
        // IP ADDRESS AND PORT                           //
        //-----------------------------------------------//
        
        // LABEL
        me.aElementsForAFormToDestroy.push("IPAddressLabel");
        oIPAddressAndPortLabel = new sap.m.Label(me.createId("IPAddressLabel"), {
            text : "IP Address and port (eg. 10.9.9.9 : 80)"
        });
        me.byId("formBox").addItem(oIPAddressAndPortLabel);
        
        // FIELD
        me.aElementsForAFormToDestroy.push("IPAddressField");
        oIPAddressField = new sap.m.Input(me.createId("IPAddressField"), {
			layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
			placeholder : "Enter IP Address..."
		}).addStyleClass("width100Percent SettingsTextInput");
        
        me.aElementsForAFormToDestroy.push("Colon");
        oColon = new sap.m.Text(me.createId("Colon"), {
            text : ":"
        }).addStyleClass("PadLeft5px PadRight5px FlexNoShrink MarTop15px");
        
        me.aElementsForAFormToDestroy.push("IPPortField");
        oIPPort = new sap.m.Input(me.createId("IPPortField"), {
			value : "80"
		}).addStyleClass("maxwidth80px SettingsTextInput");
        
        me.aElementsForAFormToDestroy.push("IPBox");
        oIPAddressAndPortBox = new sap.m.HBox(me.createId("IPBox"), {
			layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
            items : [ oIPAddressField,oColon,oIPPort ]
        }).addStyleClass("width100Percent IPAddressBox");
        me.byId("formBox").addItem(oIPAddressAndPortBox);
        
        //-----------------------------------------------//
        // DEVICE USER TOKEN FIELD                       //
        //-----------------------------------------------//
        
        // LABEL
        me.aElementsForAFormToDestroy.push("DeviceUserTokenLabel");
        oDeviceUserTokenLabel = new sap.m.Label(me.createId("DeviceUserTokenLabel"), {
            text : "Device User Token Label"
        });
        me.byId("formBox").addItem(oDeviceUserTokenLabel);
        
        // FIELD
        me.aElementsForAFormToDestroy.push("DeviceUserTokenField");
        oDeviceUserTokenField = new sap.m.Input(me.createId("DeviceUserTokenField"), {
			placeholder : "Located in your Philips Hue bridge manual"
		}).addStyleClass("width100Percent SettingsTextInput");
        me.byId("formBox").addItem(oDeviceUserTokenField);
    }

});