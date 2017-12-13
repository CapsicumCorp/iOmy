/*
Title: Form for either adding or editing devices
Author: Brent Jarmaine (Capsicum Corporation <brenton@capsicumcorp.com>
    Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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

sap.ui.controller("pages.staging.device.DeviceForm", {
    aFormFragments:     {},
    
    bEditExisting           : false,
    bLoadingOnvifProfiles   : false,
    bZigbeeCommandMenuOpen  : false,
    DeviceOptions           : null,
    iThingId                : null,
    iThingTypeId            : null,
    bNoRooms                : false,
    
    //bDeviceOptionSelectorDrawn  : false,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
//        if (!IomyRe.common.bLinkTypesLoaded) {
//            IomyRe.common.RetrieveLinkTypeList({
//                onSuccess : function () {
//                    
//                }
//            });
//        }
        
        oView.addEventDelegate({

            onBeforeShow: function ( oEvent ) {
                //-- Store the Current Id --//
                //oController.iCurrentId = oEvent.data.Id;
                
                //-- Refresh Nav Buttons --//
                //MyApp.common.NavigationRefreshButtons( oController );
                
                //-- Update the Model --//
                //oController.RefreshModel( oController, {} );
                //oController.DevTypeToggle(oController);
                
                //-- Check the parameters --//
                oView.byId("DevSettings").setVisible( false );
                
                //-- Defines the Device Type --//
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                //-- Are we editing an existing device? --//
                if (oEvent.data.ThingId !== undefined && oEvent.data.ThingId !== null) {
                    oController.bEditExisting   = true;
                    oController.iThingId        = oEvent.data.ThingId;
                } else {
                    oController.bEditExisting   = false;
                    oController.iThingId        = null;
                }
                
                if (oView.byId("DeviceName") !== undefined) {
                    oView.byId("DeviceName").destroy();
                }
                
                if (oView.byId("EditThingRoomSelector") !== undefined) {
                    oView.byId("EditThingRoomSelector").destroy();
                }
                
                if (oView.byId("ButtonSubmit") !== undefined) {
                    oView.byId("ButtonSubmit").destroy();
                }
                
                if (oView.byId("ButtonCancel") !== undefined) {
                    oView.byId("ButtonCancel").destroy();
                }
                
                //oController.bDeviceOptionSelectorDrawn = true;
                
                oController.RefreshModel();
                
                oController.DeviceOptions = IomyRe.functions.getNewDeviceOptions();
                
                if (oController.bEditExisting) {
                    oController.iThingTypeId = IomyRe.common.ThingList["_"+oController.iThingId].TypeId;
                    
                    console.log(oController.iThingTypeId);
                    
                    if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                        oView.byId("DevType").setVisible( false );
                        oView.byId("DevSettings").setVisible( true );
                        IomyRe.common.ShowFormFragment( oController, "DeviceFormEditIPCamera", "DevSettingsBlock", "Block" );
                    } else {
                        oView.byId("DevType").setVisible( true );
                        oView.byId("DevSettings").setVisible( false );
                        IomyRe.common.ShowFormFragment( oController, "DeviceFormEdit", "DevTypeBlock", "Block" );
                    }
                    
                    if (oController.bNoRooms) {
                        oView.byId("EditThingRoomSelector").setVisible(false);
                    }
                    
                    //oController.bDeviceOptionSelectorDrawn = false;
                } else {
                    oView.byId("DevType").setVisible( true );
                    oController.iThingTypeId = null;
                    
                    IomyRe.common.ShowFormFragment( oController, "DeviceFormAdd", "DevTypeBlock", "Block" );
                    
                    //if (!oController.bDeviceOptionSelectorDrawn) {
                        var oSBox = IomyRe.widgets.selectBoxNewDeviceOptions (oView.createId("DevTypeSelect"),{
                            selectedKey : "start",
                            change : function () {
                                var DevTypeSelect = this;
                                var sDevType = DevTypeSelect.getSelectedKey();
                                oController.DevTypeToggle(oController, sDevType);
                            }
                        });

                        oView.byId("DeviceTypeFormElement").addField(oSBox);
                        
                        oView.byId("DevTypeSelect").setSelectedKey("start");
                
                    //}
                }
                
            }
            
        });
        
    },
    
    ToggleZigbeeControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("CustomTelnetInput").setEnabled(bEnabled);
        oView.byId("CustomTelnetButton").setEnabled(bEnabled);
        oView.byId("JoinDevicesButton").setEnabled(bEnabled);
    },
    
    ToggleSubmitCancelButtons : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("ButtonSubmit").setEnabled(bEnabled);
        oView.byId("ButtonCancel").setEnabled(bEnabled);
    },
    
    ToggleOnvifStreamControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("SelectOnvifServer").setEnabled(bEnabled);
        oView.byId("InputStreamName").setEnabled(bEnabled);
        oView.byId("SelectStreamProfile").setEnabled(bEnabled);
        oView.byId("SelectThumbnailProfile").setEnabled(bEnabled);
        oView.byId("ButtonSubmit").setEnabled(bEnabled);
    },
    
    ToggleEditIPWebcamControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("DeviceName").setEnabled(bEnabled);
        oView.byId("SelectRoom").setEnabled(bEnabled);
        oView.byId("InputCamType").setEnabled(bEnabled);
        oView.byId("InputIPProtocol").setEnabled(bEnabled);
        oView.byId("InputIPAddress").setEnabled(bEnabled);
        oView.byId("InputIPPort").setEnabled(bEnabled);
        oView.byId("InputPath").setEnabled(bEnabled);
        oView.byId("InputUsername").setEnabled(bEnabled);
        oView.byId("InputPassword").setEnabled(bEnabled);
        
        this.ToggleSubmitCancelButtons(bEnabled);
    },
    
    DevTypeToggle : function ( oController, sDevType) {
        var bEditing = oController.bEditExisting;
        var oView = oController.getView();
        //var oTarget = oView.byId("DevType");
        
        if (sDevType === "start") {
            oView.byId("DevSettings").setVisible( false );
        } else {
            oView.byId("DevSettings").setVisible( true );
            
            switch (sDevType) {

                //-- Zigbee Devices --//
                case "linkType"+IomyRe.devices.zigbeesmartplug.LinkTypeId:
                    IomyRe.common.ShowFormFragment( oController, "ZigbeeSmartPlug", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Philips Hue Bridge --//
                case "linkType"+IomyRe.devices.philipshue.LinkTypeId:
                    IomyRe.common.ShowFormFragment( oController, "PhillipsHueBridge", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Onvif Server --//
                case "linkType"+IomyRe.devices.onvif.LinkTypeId:
                    IomyRe.common.ShowFormFragment( oController, "OnvifServer", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Onvif Stream --//
                case "thingType"+IomyRe.devices.onvif.ThingTypeId:
                    IomyRe.common.ShowFormFragment( oController, "OnvifCamera", "DevSettingsBlock", "Block" );
                    
                    oController.SetHubIdOfOnvifServer();
                    oController.LoadOnvifProfilesForSelectBoxes();
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- IP Webcam (MJPEG Stream) --//
                case "linkType"+IomyRe.devices.ipcamera.LinkTypeId:
                    IomyRe.common.ShowFormFragment( oController, "IPCamera", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Open Weather Map --//
                case "linkType"+IomyRe.devices.weatherfeed.LinkTypeId:
                    IomyRe.common.ShowFormFragment( oController, "OpenWeatherMap", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- CSR Mesh (Bluetooth) --//
//                case "linkType"+IomyRe.devices.csrmesh.LinkTypeId:
//                    IomyRe.common.ShowFormFragment( oController, "CSRMesh", "DevSettingsBlock", "Block" );
//                    
//                    if (bEditing) {
//                        
//                    }
//                    
//                    break;
                    
                default:
                    $.sap.log.error("DevTypeToggle: Critcal Error. sDevType set incorrectly:"+sDevType);
                    break;
            }
        }
    },

    RefreshModel: function( oConfig ) {
        //---------------------------------------------------//
        // If oConfig is undefined. Give it an empty object.
        //---------------------------------------------------//
        if (oConfig === undefined || oConfig === null) {
            oConfig = {};
        }
        
        //------------------------------------------------//
        //-- Declare Variables                          --//
        //------------------------------------------------//
        var oController      = this;
        var oView            = oController.getView();
        
        //------------------------------------------------//
        //-- Build and Bind Model to the View           --//
        //------------------------------------------------//
        var oJSON = IomyRe.functions.getDeviceFormJSON();
        
        oJSON.Rooms         = oController.PrepareRoomListForModel(1);
        oJSON.Hubs          = IomyRe.common.HubList;
        oJSON.OnvifProfiles = {};
        oJSON.IPCamTypes    = {
            "_1" : {
                "TypeName" : "MJPEG"
            }
        };
        
        var fnComplete = function () {
            oView.setModel( 
                new sap.ui.model.json.JSONModel(oJSON)
            );

            //------------------------------------------------//
            //-- Trigger the onSuccess Event                --//
            //------------------------------------------------//
            if( oConfig.onSuccess ) {
                oConfig.onSuccess();
            }
        };
        
        if (oController.bEditExisting) {
            var oCurrentDevice = JSON.parse( JSON.stringify( IomyRe.common.ThingList["_"+oController.iThingId] ) );
            
            oJSON.CurrentDevice = {
                "ThingName" : oCurrentDevice.DisplayName,
                "RoomId"    : oCurrentDevice.RoomId
            };
            
            //----------------------------------------------------------------//
            // If editing an IP Webcam, load the connection information as 
            // well.
            //----------------------------------------------------------------//
            if (oCurrentDevice.TypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                
                var fnSetData = function (mData) {
                    oJSON.CurrentDevice.HubId       = mData.hubID;
                    
                    oJSON.CurrentDevice.Protocol    = mData.protocol;
                    oJSON.CurrentDevice.IPAddress   = mData.address;
                    oJSON.CurrentDevice.IPPort      = mData.port;

                    oJSON.CurrentDevice.Path        = mData.path;
                    oJSON.CurrentDevice.Username    = mData.username;
                    oJSON.CurrentDevice.Password    = mData.password;
                };
                
                IomyRe.devices.ipcamera.loadCameraInformation({
                    thingID : oController.iThingId,
                    
                    onSuccess : function (mData) {
                        fnSetData(mData);
                        
                        fnComplete();
                        oController.ToggleEditIPWebcamControls(true);
                    },
                    
                    onWarning : function (mData, sErrorMessage) {
                        fnSetData(mData);
                        
                        IomyRe.common.showWarning(sErrorMessage, "Failed to load some data",
                            function () {
                                fnComplete();
                                oController.ToggleEditIPWebcamControls(true);
                            }
                        );
                    },
                    
                    onFail : function (sErrorMessage) {
                        IomyRe.common.showError(sErrorMessage, "Failed to load data",
                            function () {
                                fnComplete();
                                oController.ToggleEditIPWebcamControls(true);
                            }
                        );
                    }
                });
                
            } else {
                fnComplete();
            }
            
        } else {
            fnComplete();
        }
        
    },
    
    SetPremiseId : function () {
        var oController         = this;
        var oView               = oController.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var oCurrentFormData    = oView.getModel().getProperty( "/"+sDevTypeKey+"/" );
        var iPremiseId          = oView.getModel().getProperty("/Hubs")["_"+oCurrentFormData.Hub].PremiseId;
        
        oView.getModel().setProperty("/"+sDevTypeKey+"/Premise", iPremiseId);
        oView.getModel().setProperty("/Rooms/", oController.PrepareRoomListForModel(iPremiseId));
    },
    
    PrepareRoomListForModel : function (iPremiseId) {
        var oController         = this;
        var oView               = this.getView();
        var bEditing            = this.bEditExisting;
        var aRoomList           = JSON.parse( JSON.stringify( IomyRe.common.RoomsList["_"+iPremiseId] ) );
        var iRoomCount          = IomyRe.functions.getNumberOfRoomsInPremise(iPremiseId);
        var iUnassignedRoomId   = 0;
        var bUnassignedOnly     = false;
        var bHasUnassigned      = false;
        
        $.each(aRoomList, function (sI, mRoom) {
            iUnassignedRoomId = mRoom.RoomId;
            
            if (mRoom.RoomName === "Unassigned") {
                if (iRoomCount === 1) {
                    bUnassignedOnly = true;
                }
                
                bHasUnassigned = true;
            }
            
            return false;
        });
        
        if (bUnassignedOnly) {
            aRoomList = {};
            
            if (!bEditing) {
                aRoomList["_"+iUnassignedRoomId] = {
                    "RoomId" : iUnassignedRoomId,
                    "RoomName" : "No rooms configured for premise"
                };
            }
            
            oController.bNoRooms = true;
            
        } else {
            oController.bNoRooms = false;
            
            if (bHasUnassigned) {
                delete aRoomList["_"+iUnassignedRoomId];
            }
        }
        
        return aRoomList;
    },
    
    CancelInput : function () {
        var oController = this;
        
        IomyRe.common.NavigationChangePage("pDevice", { "bEditing" : oController.iThingId !== null }, true);
    },
    
    /**
     * Loads from an Onvif Server all of the available profiles to add in the
     * model for the onvif profiles select boxes on the Onvif Stream fragment.
     */
    LoadOnvifProfilesForSelectBoxes : function () {
        var oController = this;
        var oView       = oController.getView();
        var iLinkId     = oView.byId("SelectOnvifServer").getSelectedKey();
        var oModelData  = JSON.parse(oView.getModel().getJSON());
        
        oController.ToggleOnvifStreamControls(false);
        oView.byId("SelectOnvifServer").setEnabled(false);
        
        if (iLinkId > 0) {
            oController.bLoadingOnvifProfiles = true;
            
            oModelData.OnvifProfiles = {
                "loading" : {
                    "Token" : "loading",
                    "Name" : "Loading Profiles..."
                }
            };

            oView.setModel( 
                new sap.ui.model.json.JSONModel(oModelData)
            );
            
            IomyRe.devices.onvif.LookupProfiles({
                linkID : iLinkId,

                onSuccess : function (aProfiles) {
                    var oModelData = JSON.parse(oView.getModel().getJSON());
                    oModelData.OnvifProfiles = {};
                    
                    for (var i = 0; i < aProfiles.length; i++) {
                        oModelData.OnvifProfiles["token"+aProfiles[i].ProfileToken] = {
                            "Token" : aProfiles[i].ProfileToken,
                            "Name" : aProfiles[i].ProfileName
                        };

                    }

                    oController.ToggleOnvifStreamControls(true);
                    oController.bLoadingOnvifProfiles = false;
                    
                    oView.setModel( 
                        new sap.ui.model.json.JSONModel(oModelData)
                    );
                },

                onFail : function () {
                    var oModelData = JSON.parse(oView.getModel().getJSON());
                    oModelData.OnvifProfiles = {
                        "error" : {
                            "Token" : "error",
                            "Name" : "Failed to load profiles."
                        }
                    };

                    oController.ToggleOnvifStreamControls(false);
                    oView.byId("SelectOnvifServer").setEnabled(true);

                    oController.bLoadingOnvifProfiles = false;
                    
                    oView.setModel( 
                        new sap.ui.model.json.JSONModel(oModelData)
                    );
                }
            });
        } else {
            oModelData.OnvifProfiles = {};

            oView.setModel( 
                new sap.ui.model.json.JSONModel(oModelData)
            );
            
            oView.byId("SelectOnvifServer").setEnabled(true);
        }
    },
    
    SetHubIdOfOnvifServer : function () {
        var oController         = this;
        var oView               = oController.getView();
//        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
//        var iLinkId             = oView.getModel().getProperty("/"+sDevTypeKey+"/Server");
//        
//        oView.getModel().setProperty( "/"+sDevTypeKey+"/HubId", IomyRe.functions.getHubConnectedToLink(iLinkId).HubId);
        
        oView.byId("DevTypeSelect").setSelectedKey("thingType"+IomyRe.devices.onvif.ThingTypeId);
    },
    
    CreateDevice : function () {
        var oController         = this;
        var oView               = oController.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var oCurrentFormData    = oView.getModel().getProperty( "/"+sDevTypeKey+"/" );
        var mData               = {};
        var oModel              = oView.getModel();
        
        // If the Room ID either less than 1 or an invalid value, like null or 
        // undefined, set it to the 'Unassigned' room.
        if (isNaN(oCurrentFormData.Room) || oCurrentFormData.Room < 1) {
            oCurrentFormData.Room = 1;
        }
        
        oController.ToggleSubmitCancelButtons(false);
        
        //--------------------------------------------------------------------//
        // Prepare the URL and parameters for the call to create a device.
        //--------------------------------------------------------------------//
        switch (sDevTypeKey) {
            // Onvif Camera Device
            case "linkType"+IomyRe.devices.onvif.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("onvif"),
                    data : {
                        "Mode" : "AddNewOnvifServer",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "DisplayName" : oCurrentFormData.DisplayName,
                        "DeviceNetworkAddress" : oCurrentFormData.IPAddress,
                        "DeviceOnvifPort" : oCurrentFormData.IPPort,
                        "OnvifUsername" : oCurrentFormData.Username,
                        "OnvifPassword" : oCurrentFormData.Password
                    }
                };
                break;
            
            // Philips Hue Bridge
            case "linkType"+IomyRe.devices.philipshue.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("philipshue"),
                    data : {
                        "Mode" : "AddNewBridge",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "DisplayName" : oCurrentFormData.DisplayName,
                        "DeviceNetworkAddress" : oCurrentFormData.IPAddress,
                        "DevicePort" : oCurrentFormData.IPPort,
                        "DeviceUserToken" : oCurrentFormData.DeviceToken
                    }
                };
                break;
            
            // Open Weather Map
            case "linkType"+IomyRe.devices.weatherfeed.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("weather"),
                    data : {
                        "Mode" : "AddWeatherStation",
                        "HubId" : oCurrentFormData.Hub,
                        "DisplayName" : oCurrentFormData.DisplayName,
                        "WeatherType" : "OpenWeatherMap",
                        "Username" : oCurrentFormData.KeyCode,
                        "StationCode" : oCurrentFormData.StationCode,
                        "RoomId" : oCurrentFormData.Room,
                        "Data" : "{\"Name\" : \""+oCurrentFormData.DisplayName+"\"}"
                    }
                };
                break;
            
            // IP Webcam Stream
            case "linkType"+IomyRe.devices.ipcamera.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("ipcamera"),
                    data : {
                        "Mode" : "AddNewIPCamera",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "IPCamType" : oCurrentFormData.IPCamType,
                        "Data" : JSON.stringify({
                            "NetworkAddress"    : oCurrentFormData.IPAddress,
                            "NetworkPort"       : oCurrentFormData.IPPort,
                            "Protocol"          : oCurrentFormData.Protocol,
                            "Path"              : oCurrentFormData.Path,
                            "DisplayName"       : oCurrentFormData.DisplayName,
                            "LinkName"          : oCurrentFormData.LinkName,
                            "Username"          : oCurrentFormData.Username,
                            "Password"          : oCurrentFormData.Password
                        })
                    }
                };
                break;
                
            // Onvif Stream
            case "thingType"+IomyRe.devices.onvif.ThingTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("onvif"),
                    data : {
                        "Mode" : "NewThing",
                        "LinkId" : oCurrentFormData.OnvifServer,
                        "StreamProfile" : oCurrentFormData.StreamProfile,
                        "ThumbnailProfile" : oCurrentFormData.ThumbnailProfile,
                        "CameraName" : oCurrentFormData.CameraName
                    }
                };
                break;
                
            default :
                throw new IllegalArgumentException("Invalid device type");
            
        }
        
        mData.onSuccess = function (response, data) {
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
                
                IomyRe.common.RefreshCoreVariables({
                    onSuccess : function () {
                        oController.RefreshModel({
                            onSuccess : function () {
                                IomyRe.common.showMessage({
                                    text : "Device successfully created",
                                    view : oView
                                });

                                if (IomyRe.functions.getLinkTypeIDOfLink(iLinkId) === 6) {
                                    oView.byId("DevTypeSelect").setSelectedKey("thingType"+IomyRe.devices.onvif.ThingTypeId);
                                    
                                    //oCurrentFormData.OnvifServer = iLinkId;
                                    oController.DevTypeToggle(oController, "thingType"+IomyRe.devices.onvif.ThingTypeId);

                                } else {
                                    oController.DevTypeToggle(oController, oView.byId("DevTypeSelect").getSelectedKey());
                                    //IomyRe.common.NavigationChangePage("pBlock", {}, true);
                                }
                                
                                if (oView.byId("DevTypeSelect").getSelectedKey() === "thingType"+IomyRe.devices.onvif.ThingTypeId) {
                                    oController.ToggleOnvifStreamControls(false);
                                    oView.byId("SelectOnvifServer").setEnabled(true);
                                    oView.byId("ButtonCancel").setEnabled(true);
                                } else {
                                    oController.ToggleSubmitCancelButtons(true);
                                }
                                
                            }
                        });
                    }
                });
            } else {
                jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                IomyRe.common.showError("Error creating device:\n\n"+data.ErrMesg, "", function () {
                    oView.byId("ButtonSubmit").setEnabled(false);
                });
            }
            
        };
        
        mData.onFail = function (error) {
            jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            IomyRe.common.showError("Error creating device:\n\n"+error.responseText, "", function () {
                oController.ToggleSubmitCancelButtons(true);
            });
        };
        
        //--------------------------------------------------------------------//
        // Run the request to create a device.
        //--------------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest(mData);
    },
    
    EditDevice : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oCurrentFormData    = oView.getModel().getProperty( "/CurrentDevice/" );
        
        if (oController.areThereChanges()) {
            oController.ToggleSubmitCancelButtons(false);
            
            if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                oController.ToggleEditIPWebcamControls(false);
            }

            //--------------------------------------------------------------------//
            // Run the request to edit an existing device.
            //--------------------------------------------------------------------//
            try {
                IomyRe.devices.editThing({
                    thingID     : oController.iThingId,
                    thingName   : oCurrentFormData.ThingName,
                    roomID      : oCurrentFormData.RoomId,

                    onSuccess : function () {
                        if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                            oController.SubmitIPWebcamData();
                        } else {
                            oController.ToggleSubmitCancelButtons(true);
                            oController.ToggleEditIPWebcamControls(true);
                            oController.CancelInput();
                        }
                    },

                    onWarning : function () {
                        oController.ToggleEditIPWebcamControls(true);
                    },

                    onFail : function () {
                        oController.ToggleEditIPWebcamControls(true);
                    }
                });
            } catch (e) {
                IomyRe.common.showError(e.message, "Invalid Input",
                    function () {
                        oController.ToggleSubmitCancelButtons(true);
                        
                        if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                            oController.ToggleEditIPWebcamControls(true);
                        }
                    }
                );
            }
        } else {
            if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                oController.ToggleEditIPWebcamControls(false);
                oController.SubmitIPWebcamData();
            } else {
                oController.ToggleSubmitCancelButtons(true);
            }
        }
    },
    
    areThereChanges : function () {
        var oController             = this;
        var oView                   = oController.getView();
        var iThingID				= oController.iThingId;
		var sOldThingText           = IomyRe.common.ThingList["_"+iThingID].DisplayName;
        var iOldRoomID              = IomyRe.common.ThingList["_"+iThingID].RoomId;
        var oCurrentFormData        = oView.getModel().getProperty( "/CurrentDevice/" );
        var iRoomId                 = oCurrentFormData.RoomId;
        var sThingText;
        
		var bDifferentThingName     = sOldThingText !== sThingText;
        var bDifferentRoom;
            
        if (iOldRoomID == 1) {
            bDifferentRoom = true;
        } else {
            bDifferentRoom = iOldRoomID != iRoomId;
        }
        
        return (bDifferentThingName || bDifferentRoom);
    },
    
    SubmitIPWebcamData : function () {
        var oController         = this;
        var oView               = this.getView();
        var oCurrentFormData    = oView.getModel().getProperty( "/CurrentDevice/" );
        
        try {
            if (oController.iThingTypeId == IomyRe.devices.ipcamera.ThingTypeId) {
                IomyRe.devices.ipcamera.submitWebcamInformation({
                    thingID             : oController.iThingId,
                    
                    hubID               : oCurrentFormData.HubId,
                    ipAddress           : oCurrentFormData.IPAddress,
                    ipPort              : oCurrentFormData.IPPort,
                    streamPath          : oCurrentFormData.Path,
                    protocol            : oCurrentFormData.Protocol,
                    fileType            : "MJPEG",
                    
                    editing : true,

                    onSuccess : function () {
                        IomyRe.common.RefreshCoreVariables({
                            onSuccess : function () {
                                oController.RefreshModel();
                                
                                IomyRe.common.showMessage({
                                    text : "IP Webcam updated."
                                });

                                oController.ToggleEditIPWebcamControls(true);
                                oController.CancelInput();
                            }
                        })
                    },

                    onFail : function (sErrorMessage) {
                        IomyRe.common.showError(sErrorMessage, "Failed to update settings",
                            function () {
                                oController.ToggleEditIPWebcamControls(true);
                            }
                        );
                    }
                });

            }

        } catch (e) {
            IomyRe.common.showError(e.message, "Failed to update settings",
                function () {
                    oController.ToggleSubmitCancelButtons(true);
                }
            );
        }
    },
    
    isOldRoomTheUnassigned : function () {
        var iOldRoomID              = IomyRe.common.ThingList["_"+this.iThingId].RoomId;
            
        return iOldRoomID == 1;
    },
    
    ToggleSubmitButton : function () {
        this.getView().byId("ButtonSubmit").setEnabled( this.areThereChanges() );
    },
    
    RunZigbeeCommand : function () {
        var oController         = this;
        var oView               = this.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var iHubId              = oView.getModel().getProperty( "/"+sDevTypeKey+"/" ).Hub;
        var sCommand            = oView.byId("CustomTelnetInput").getValue();
        var oLogContents        = oView.byId("TelnetOutput").getValue();
        
        oController.ToggleZigbeeControls(false);
        
        oLogContents += "Running "+sCommand+"...\n";
        oView.byId("TelnetOutput").setValue(oLogContents);
        
        IomyRe.telnet.RunCommand({
            command : sCommand,
            hubID : iHubId,

            onSuccess : function (result) {
                //console.log(JSON.stringify(result));

                oLogContents = oView.byId("TelnetOutput").getValue();

                oLogContents += result+"\n-------------------------------------\n";
                oView.byId("TelnetOutput").setValue(oLogContents);

                // Force it to scroll down to the bottom.
                document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                IomyRe.common.RefreshCoreVariables({
                    onSuccess : function () {
                        oController.ToggleZigbeeControls(true);
                        
                        IomyRe.common.showMessage({
                            text : sCommand+" executed successfully",
                            view : oView
                        });
                    }
                });
            },

            onFail : function (sError) {
                var oLogContents = oView.byId("TelnetOutput").getValue();

                oLogContents += sError+"\n-------------------------------------\n";
                oView.byId("TelnetOutput").setValue(oLogContents);
                
                oController.ToggleZigbeeControls(true);
            }
        });
    },
    
    OpenZigbeeMenu : function (oControlEvent) {
        var oController         = this;
        var oView               = this.getView();
        var sMenuID             = "ZigbeeCommandMenu";
        var oNavList            = new sap.tnt.NavigationList({});
        var aCommands           = [
            "versioninfo",
            "modulesinfo",
            "debug output show",
            "debug output hide",
            "get_rapidha_info",
            "get_zigbee_info"
        ];
        
        //------------------------------------------------------------//
        // Insert each of the telnet commands to the menu.            //
        //------------------------------------------------------------//
		$.each(aCommands, function (iIndex, sCommand) {
			oNavList.addItem(
                new sap.tnt.NavigationListItem({
                    text : sCommand,
                    select : function() {
                        oView.byId("CustomTelnetInput").setValue(sCommand);
                        
                        oController.RunZigbeeCommand()
                        
                        sap.ui.getCore().byId(sMenuID).close();
                    }
                })
            );
		});
        
        if (oController.bZigbeeCommandMenuOpen !== true) {
            // Get or create a new extra menu
            var oButton = oControlEvent.getSource();
            var oMenu;
            if (sap.ui.getCore().byId(sMenuID) === undefined) {
                oMenu = new sap.m.Popover(sMenuID, {
                    placement: sap.m.PlacementType.Bottom,
                    showHeader : false,
                    content: [oNavList]
                }).addStyleClass("IOMYNavMenuContainer");
            } else {
                oMenu = sap.ui.getCore().byId(sMenuID);
            }

            oMenu.attachAfterClose(function () {
                oController.bZigbeeCommandMenuOpen = false;
            });

            oMenu.openBy(oButton);
            oController.bZigbeeCommandMenuOpen = true;

        } else {
            sap.ui.getCore().byId(sMenuID).close();
        }
    },
    
    StartZigbeeJoin : function () {
        var oController         = this;
        var oView               = this.getView();
        var iCommId             = oView.byId("ZigModemSelect").getSelectedKey();
        
        oController.ToggleZigbeeControls(false);
        
        IomyRe.devices.zigbeesmartplug.TurnOnZigbeeJoinMode({
            modemID : iCommId,
            
            onSuccess : function (result) {
                
                console.log(JSON.stringify(result));
                
                var oLogContents = oView.byId("TelnetOutput").getValue();
                
                oLogContents += result+"\n-------------------------------------\n";
                oView.byId("TelnetOutput").setValue(oLogContents);
                
                // Force it to scroll down to the bottom.
                document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;
                
                IomyRe.devices.zigbeesmartplug.GetRapidHAInfo({
                    modemID : iCommId,
                    
                    onSuccess : function (result) {
                        
                        //console.log(JSON.stringify(result));
                        
                        var oLogContents = oView.byId("TelnetOutput").getValue();
                
                        oLogContents += JSON.stringify(result)+"\n-------------------------------------\n\nWaiting 30 seconds for devices to join.";
                        oView.byId("TelnetOutput").setValue(oLogContents);
                
                        // Force it to scroll down to the bottom.
                        document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;
                        
                        setTimeout(
                            function () {
                                IomyRe.common.RefreshCoreVariables({
                                    onSuccess : function () {
                                        oController.ToggleZigbeeControls(true);
                                        
                                        IomyRe.common.showMessage({
                                            text : "Join completed."
                                        });
                                    },
                                    
                                    onFail : function () {
                                        oController.ToggleZigbeeControls(true);
                                        
                                        IomyRe.common.showMessage({
                                            text : "Join completed. But unable to refresh the device list."
                                        });
                                    }
                                });
                            },
                        30000);
                    },
                    
                    onFail : function (sError) {
                        var oLogContents = oView.byId("TelnetOutput").getValue();
                
                        oLogContents += result+"\n-------------------------------------\n";
                        oView.byId("TelnetOutput").setValue(oLogContents);
                        
                        IomyRe.common.showError(sError, "Failed to load RapidHA Information.", function () {
                            oController.ToggleZigbeeControls(true);
                        });
                    }
                });
                
                
            },
            
            onFail : function (sError) {
                var oLogContents = oView.byId("TelnetOutput").getValue();
                oLogContents += sError+"\n-------------------------------------\n";
                
                oView.byId("TelnetOutput").setValue(oLogContents);
                
                // Force it to scroll down to the bottom.
                document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;
                
                oController.ToggleZigbeeControls(true);
                
                IomyRe.common.showError(sError, "Failed to join devices.", function () {
                    oController.ToggleZigbeeControls(true);
                });
            }
        });
    }
    
});