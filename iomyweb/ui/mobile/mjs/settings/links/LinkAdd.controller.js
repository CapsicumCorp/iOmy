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

$.sap.require("IOMy.widgets.AcceptCancelButtonGroup");

sap.ui.controller("mjs.settings.links.LinkAdd", {
    
    // WIDGETS
    // TODO: Have all major widgets defined in the scope of the controller itself
    // rather than in DrawUI().
    wDeviceOptionCBox       : null,
    wDeviceOptionCBoxHolder : null,
    wRoomLabel              : null,
    wRoomCBox               : null,
    wRoomCBoxHolder         : null,
    wFormBox                : null,
    wVertBox                : null,
    
    bUIReadyToBeWiped             : true,
    aElementsToDestroy            : [],
    aElementsForAFormToDestroy    : [],
    
    iLinkTypeId             : null,
    iLinkId                 : null,
    iRoomId                 : null,
    
    DeviceOptions        : null,
    
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
                
                //-- Device type to select --//
                if (evt.data.LinkTypeId !== undefined) {
                    me.iLinkTypeId = evt.data.LinkTypeId;
                } else {
                    me.iLinkTypeId = null;
                }
                
                //-- Room to select --//
                if (evt.data.RoomId !== undefined) {
                    me.iRoomId = evt.data.RoomId;
                } else {
                    me.iRoomId = null;
                }
                
                if (IOMy.common.bLinkTypesLoaded) {
                    me.DeviceOptions = IOMy.functions.getNewDeviceOptions();
                    
                    // Start the form creation
                    me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                    me.DrawUI();            // STEP 2: Draw the actual user interface        
                } else {
                    IOMy.common.RetrieveLinkTypeList({
                        onSuccess : function () {
                            me.DeviceOptions = IOMy.functions.getNewDeviceOptions();
                            
                            me.DestroyUI();         // STEP 1: Clear any old forms to avoid duplicate IDs
                            me.DrawUI();            // STEP 2: Draw the actual user interface
                        }
                    });
                }
            }
        });
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.links.LinkAdd
*/
//    onBeforeRendering: function() {
//
//    },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.links.LinkAdd
*/
//    onAfterRendering: function() {
//        
//    },
    
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.links.LinkAdd
*/
//    onExit: function() {
//
//    },

    ValidateFormData : function () {
        var me                      = this;
        var mIPAddressInfo          = {};
        var mIPPortInfo             = {};
        var mDeviceUserTokenInfo    = {};
        var mOpenWeatherMapInfo     = {};
        var mOnvifStreamInfo        = {};
        var mValidationInfo         = {};
        var bError                  = false;
        var aErrorMessages          = [];
        var mEntry                  = me.DeviceOptions[ me.byId("linkTypeCBox").getSelectedKey() ];
        
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
                        
                        if (mIPAddressInfo.bValid === false) {
                            bError = true;
                            aErrorMessages = aErrorMessages.concat(mIPAddressInfo.aErrorMessages);
                        }
                        
                        if (mIPPortInfo.bValid === false) {
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
                        
                        if (mIPAddressInfo.bValid === false) {
                            bError = true;
                            aErrorMessages = aErrorMessages.concat(mIPAddressInfo.aErrorMessages);
                        }
                        
                        if (mIPPortInfo.bValid === false) {
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
        var me          = this;           // Preserving this scope
        var mData       = {};             // Map for the AJAX request
        var sLinkType   = "";
        var sSBoxKey    = me.byId("linkTypeCBox").getSelectedItem().getKey();
        var mEntry      = me.DeviceOptions[sSBoxKey];
        
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
        } catch (e) {
            jQuery.sap.log.error("Error refreshing core variables: "+e.message);
            IOMy.common.showWarning(sLinkType+" successfully created but there was an error refreshing core variables: "+e.message, "Errors");
        }
        
        // These functions are not necessarily to do with a specific device type.
        mData.onSuccess = function (response, data) {
            var bCompletelySuccessful = true;
            
            if (data.Error !== true) {
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
                }
            } else {
                jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                IOMy.common.showError("Error creating "+sLinkType+":\n\n"+data.ErrMesg);
            }

            try {
                // REFRESH LINK LIST
                if (data.Error === false || data.Error === undefined) {
                    // Set the flag to clear the way for a new UI instance
                    me.bUIReadyToBeWiped = true;

                    if (mEntry.Type === "type") {
                        var fnSuccess;
                        var fnFail;
                        var iRoomId;

                        fnSuccess = function () {
                            IOMy.common.RefreshCoreVariables({
                                onSuccess : function () {
                                    if (bCompletelySuccessful) {
                                        IOMy.common.showMessage({
                                            text : sLinkType+" successfully created",
                                            view : me.getView()
                                        });
                                    }
                                    
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
                                }
                            });
                        };

                        fnFail = function (err) {
                            bCompletelySuccessful = false;
                            
                            jQuery.sap.log.error(err);
                            IOMy.common.showWarning("Successfully created device, but could not place it in "+me.byId("roomCBox").getSelectedItem().getText()+".", "Warning", fnSuccess);

                        };

                        if (me.byId("roomCBox") !== null && me.byId("roomCBox") !== undefined) {
                            iRoomId = me.byId("roomCBox").getSelectedKey();
                        } else {
                            iRoomId = 1;
                        }

                        if (iRoomId === "") {
                            iRoomId = 1;
                        }

                        IOMy.devices.AssignDeviceToRoom({
                            "linkID" : iLinkId,
                            "roomID" : iRoomId,

                            "onSuccess" : fnSuccess,
                            "onFail"    : fnFail
                        });
                        
                    } else {
                        IOMy.common.RefreshCoreVariables({
                            onSuccess : function () {
                                IOMy.common.showMessage({
                                    text : me.byId("CameraNameField").getValue()+" successfully created",
                                    view : me.getView()
                                });
                                
                                IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
                                IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
                            }
                        });
                    }
                            
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
            me.byId("buttonBox").setEnabled(true);
        };
        
        return mData;
    },
    
    ChangeLinkForm : function (oSBox) {
        var me = this;
        // Grab the link type ID
        var sKey        = oSBox.getSelectedKey();
        var mEntry        = me.DeviceOptions[sKey];
        var iLinkTypeId;

        // Erase the old set of fields
        me.DestroySpecificFormUI();

        //-------------------------------------//
        // Choose a form to load               //
        //-------------------------------------//

        if (mEntry.Type === "type") {
            iLinkTypeId = mEntry.Id;
            me.iLinkId = null;
            
            me.byId("buttonBox").setEnabled(true);
            
            // If the form is for the Zigbee device type, hide the add device button.
            if (iLinkTypeId == 2) {
                me.byId("buttonBox").setVisible(false);
            } else {
                me.byId("buttonBox").setVisible(true);
            }
            
            // Zigbee 
            if (iLinkTypeId == 2) {
                IOMy.devices.zigbeesmartplug.CreateLinkForm(me, me.byId("formBox"));
                IOMy.devices.zigbeesmartplug.PopulateTelnetLogArea(me);
                
                if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
                    me.wRoomCBox.setVisible(false);
                    me.wRoomLabel.setVisible(false);
                }
            // Onvif Server
            } else if (iLinkTypeId == 6) {
                IOMy.devices.onvif.CreateLinkForm(me);
                
                if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
                    me.wRoomCBox.setVisible(true);
                    me.wRoomLabel.setVisible(true);
                }
                
            // Philips Hue Bridge
            } else if (iLinkTypeId == 7) {
                IOMy.devices.philipshue.CreateLinkForm(me);
                
                if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
                    me.wRoomCBox.setVisible(true);
                    me.wRoomLabel.setVisible(true);
                }
            // Open Weather Map
            } else if (iLinkTypeId == 8) {
                IOMy.devices.weatherfeed.CreateLinkForm(me, me.byId("formBox"));
                
                if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
                    me.wRoomCBox.setVisible(true);
                    me.wRoomLabel.setVisible(true);
                }
            // IP Webcam
            } else if (iLinkTypeId == IOMy.devices.ipcamera.LinkTypeId) {
                IOMy.devices.ipcamera.createNewDeviceForm();
                
                if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
                    me.wRoomCBox.setVisible(true);
                    me.wRoomLabel.setVisible(true);
                }
            }
        } else if (mEntry.Type === "device") {
            me.iLinkId = mEntry.Id;
            me.byId("buttonBox").setEnabled(false);
            me.byId("buttonBox").setVisible(true);
            
            IOMy.devices.onvif.CreateThingForm(me, me.iLinkId, me.byId("formBox"), [me.byId("buttonBox")]);
            me.byId("buttonBox").setCancelEnabled(true);
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
        
        if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
            me.wRoomCBox.destroy();
            me.wRoomCBox = null;
        }
        
        if (me.wVertBox !== null) {
            me.wVertBox.destroy();
            me.wVertBox = null;
        }
        
        // Destroy whatever other elements are left.
        me.DestroySpecificFormUI();
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    /**
     * Procedure that destroys specific form elements.
     */
    DestroySpecificFormUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        if (me.wFormBox !== null && me.wFormBox !== undefined) {
            me.wFormBox.destroyItems();
        }
        
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
        var oAddButton; // Button to add link
        var oPanel; // Container
        
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
        me.wRoomLabel = new sap.m.Label({
            text : "Room to put this device in"
        });
        
        try {
            me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_1");
            me.wRoomCBoxHolder = new sap.m.VBox({
                items : [me.wRoomCBox]
            }).addStyleClass("width100Percent");
        } catch (ex) {
            me.wRoomCBoxHolder = null;
            me.wRoomCBox = null;
            jQuery.sap.log.error(ex.message);
        } finally {
            if (IOMy.functions.getNumberOfRooms() === 0) {
                me.wRoomLabel.setVisible(false);
            }
        }
        
        if (me.wRoomCBox !== null && me.wRoomCBox !== undefined) {
            me.wRoomCBox.setSelectedKey(me.iRoomId);
            me.wRoomCBox.addStyleClass("width100Percent SettingsDropDownInput");
        }
        
        //-------------------------------------------------------//
        // LINK TYPE SELECT BOX                                  //
        //-------------------------------------------------------//
        oLinkTypeLabel = new sap.m.Label({
            text : "Device"
        });
        
        me.wDeviceOptionCBox = IOMy.widgets.selectBoxNewDeviceOptions(me.createId("linkTypeCBox")).addStyleClass("SettingsDropDownInput");

        if (me.iLinkTypeId !== null) {
            me.wDeviceOptionCBox.setSelectedKey("type"+me.iLinkTypeId);
        } else {
            me.wDeviceOptionCBox.setSelectedKey(null);
        }
        
        if (me.iRoomId !== null) {
            me.wDeviceOptionCBox.setSelectedKey("type"+IOMy.devices.onvif.LinkTypeId);
        }
        
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
        me.wFormBox = new sap.m.VBox(me.createId("formBox"),{});
        
        //=======================================================//
        // PLACE ALL THE PIECES TOGETHER                         //
        //=======================================================//
        
        me.wVertBox = new sap.m.VBox({
            items : [
                oHubLabel,oHubCBox,
                oLinkTypeLabel,me.wDeviceOptionCBoxHolder,
                me.wRoomLabel,me.wRoomCBoxHolder,
                me.wFormBox
            ]
        }).addStyleClass("UserInputForm");
        
        //-------------------------------------------------------//
        // Add device button
        //-------------------------------------------------------//
        me.aElementsToDestroy.push("buttonBox");
        oAddButton = new IOMy.widgets.AcceptCancelButtonGroup(me.createId("buttonBox"), {
            
            cancelPress : function () {
                IOMy.common.NavigationTriggerBackForward();
            },
            
            //----------------------------------------------------------------//
            // Add Device, TODO: Move these functions into separate areas!
            //----------------------------------------------------------------//
            acceptPress : function() {
                me.createDevice();
            }
            
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
    
    createDevice : function () {
        var me = this; // Captures the scope of the calling button.
        var thisView = me.getView();
        
        me.byId("buttonBox").setEnabled(false); // Lock the button
        IOMy.common.NavigationToggleNavButtons(me, false); // Lock the navigation buttons.

        // Error checking variables
        var bError                  = false;
        var mInfo                   = false;
        var aErrorMessages          = [];
        var sErrorMessage           = "";
        var mEntry                  = me.DeviceOptions[ me.byId("linkTypeCBox").getSelectedKey() ];

        var fnFail = function (sErrMesg) {
            IOMy.common.showError("Error adding the camera:\n\n"+sErrMesg, "", 
                function () {
                    me.byId("buttonBox").setEnabled(true);
                    IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
                }
            );
        };

        // If this is a webcam we're adding, there is a different mechanism for
        // adding it.
        if (mEntry.Type === "type" && mEntry.Id == IOMy.devices.ipcamera.LinkTypeId) {
            try {
                IOMy.devices.ipcamera.submitWebcamInformation({
                    "fileType"        : me.wFileTypeSelector.getSelectedKey(),
                    "hubID"           : me.byId("hubCBox").getSelectedKey(),
                    "protocol"        : me.wProtocol.getValue(),
                    "ipAddress"       : me.wIPAddress.getValue(),
                    "ipPort"          : me.wIPPort.getValue(),
                    "streamPath"      : me.wStreamPath.getValue(),

                    "onSuccess" : function (mData) {
                        
                        if (mData.Error === false) {
                            
                            IOMy.devices.AssignDeviceToRoom({
                                "linkID" : mData.Data.LinkId,
                                "roomID" : me.byId("roomCBox").getSelectedKey(),

                                "onSuccess" : function() {
                                    IOMy.common.RefreshCoreVariables({

                                        "onSuccess" : function () {
                                            IOMy.common.showMessage({
                                                "text" : "New webcam successfully created!",
                                                "view" : thisView
                                            });

                                            IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
                                            IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
                                        }

                                    });
                                },

                                "onFail"    : function () {
                                    IOMy.common.RefreshCoreVariables({

                                        "onSuccess" : function () {
                                            IOMy.common.showWarning("Successfully created device, but could not place it in "+me.byId("roomCBox").getSelectedItem().getText()+".", "Warning",
                                                function () {
                                                    IOMy.common.NavigationToggleNavButtons(me, true); // Enable the navigation buttons.
                                                    IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
                                                }
                                            );
                                        }

                                    });
                                }
                            });
                        } else {
                            fnFail(mData.ErrMesg);
                        }

                    },

                    "onFail" : fnFail
                });
            } catch (ex) {
                fnFail(ex.message);
            }

        } else {
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
                                me.byId("buttonBox").setEnabled(true);
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
                            me.byId("buttonBox").setEnabled(true);
                        }
                    );
                }
            }
        }
    }
});