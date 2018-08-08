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

sap.ui.controller("pages.device.DeviceForm", {
    aFormFragments:     {},
    
    bRoomsExist             : false,
    bEditExisting           : false,
    bLoadingOnvifProfiles   : false,
    bSubmitting             : false,
    bProfilesLoaded         : false,
    bAcceptingInput         : false,
    bZigbeeCommandMenuOpen  : false,
    DeviceOptions           : null,
    iThingId                : null,
    iThingTypeId            : null,
    iRoomId                 : null,
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
        
//        if (!iomy.common.bLinkTypesLoaded) {
//            iomy.common.RetrieveLinkTypeList({
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
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                //-- Are we editing an existing device? --//
                if (oEvent.data.ThingId !== undefined && oEvent.data.ThingId !== null) {
                    oController.bEditExisting   = true;
                    oController.iThingId        = oEvent.data.ThingId;
                    
                    oController.sOldThingText   = iomy.common.ThingList["_"+oController.iThingId].DisplayName;
                    oController.iOldRoomID      = iomy.common.ThingList["_"+oController.iThingId].RoomId;
                } else {
                    oController.bEditExisting   = false;
                    oController.iThingId        = null;
                }
                
                //-- Are we preselecting a room when adding a device? --//
                if (oEvent.data.RoomId !== undefined && oEvent.data.RoomId !== null && !oController.bEditExisting) {
                    oController.iRoomId = oEvent.data.RoomId;
                } else {
                    oController.iRoomId = null;
                }
                
                //-- Are we preselecting a room when adding a device? --//
                if (oEvent.data.PremiseId !== undefined && oEvent.data.PremiseId !== null && !oController.bEditExisting) {
                    oController.iPremiseId = oEvent.data.PremiseId;
                } else {
                    oController.iPremiseId = null;
                }
                
                oController.bAcceptingInput = false;
                
                oController.loadDeviceForm();
            }
            
        });
        
    },
    
    loadDeviceForm : function () {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        if (oView.byId("DeviceName") !== undefined) {
            oView.byId("DeviceName").destroy();
        }
        
        if (oView.byId("DeviceRoom") !== undefined) {
            oView.byId("DeviceRoom").destroy();
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

        oController.DeviceOptions = iomy.functions.getNewDeviceOptions();

        if (oController.bEditExisting) {
            oController.iThingTypeId = iomy.common.ThingList["_"+oController.iThingId].TypeId;

            if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
                oView.byId("DevType").setVisible( false );
                oView.byId("DevSettings").setVisible( true );
                iomy.common.ShowFormFragment( oController, "DeviceFormEditIPCamera", "DevSettingsBlock", "Block" );
            } else {
                oView.byId("DevType").setVisible( true );
                oView.byId("DevSettings").setVisible( false );
                iomy.common.ShowFormFragment( oController, "DeviceFormEdit", "DevTypeBlock", "Block" );
            }

            if (oController.bNoRooms && oView.byId("EditThingRoomSelector") !== undefined) {
                oView.byId("EditThingRoomSelector").setVisible(false);
            }
            
            oController.ToggleSubmitButton();

            //oController.bDeviceOptionSelectorDrawn = false;
        } else {
            oView.byId("DevType").setVisible( true );
            oView.byId("DevSettings").setVisible( false );
            oController.iThingTypeId = null;

            iomy.common.ShowFormFragment( oController, "DeviceFormAdd", "DevTypeBlock", "Block" );

            //if (!oController.bDeviceOptionSelectorDrawn) {
                var oSBox = iomy.widgets.selectBoxNewDeviceOptions (oView.createId("DevTypeSelect"), {
                    selectedKey : "start",
                    enabled : "{/enabled/Always}",
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
    },
    
    ToggleZigbeeControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("CustomTelnetInput").setEnabled(bEnabled);
        oView.byId("CustomTelnetButton").setEnabled(bEnabled);
        oView.byId("JoinDevicesButton").setEnabled(bEnabled && iomy.devices.zigbeesmartplug.bZigbeeModemsFound);
    },
    
    ToggleControls : function (bEnabled) {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        oModel.setProperty("/enabled/Always",                       bEnabled);
        oModel.setProperty("/enabled/IfRoomsExist",                 bEnabled && oController.bRoomsExist);
        oModel.setProperty("/enabled/IfRoomsExistAndAcceptingInput",bEnabled && oController.bRoomsExist && oController.bAcceptingInput);
        oModel.setProperty("/enabled/IfOnvifProfilesHaveLoaded",    bEnabled && !oController.bLoadingOnvifProfiles && !oController.bSubmitting);
        oModel.setProperty("/enabled/IfAcceptingInput",             bEnabled && oController.bAcceptingInput);
        oModel.setProperty("/enabled/IfOnvifCameraIsSelected",      bEnabled && oController.bOnvifCameraSelected);
        oModel.setProperty("/enabled/IfOnvifProfilesFound",         bEnabled && oController.bOnvifCameraSelected && oController.bProfilesLoaded);
        
//        oView.byId("ButtonSubmit").setEnabled(bEnabled);
//        oView.byId("ButtonCancel").setEnabled(bEnabled);
    },
    
    ToggleOnvifStreamControls : function (bEnabled) {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        oModel.setProperty("/enabled/IfOnvifCameraIsSelected", bEnabled && oController.bOnvifCameraSelected);
    },
    
    ToggleOnvifStreamAuthenticationForm : function () {
        var oView       = this.getView();
        var oModel      = oView.getModel();
        var iAuthType   = oModel.getProperty("/thingType"+iomy.devices.onvif.ThingTypeId+"/StreamAuthMethod");
        var bVisible    = iAuthType == 2;
        
        oModel.setProperty("/visible/IfStreamAuthSelected", bVisible);
        
        if (!bVisible) {
            oModel.setProperty("/thingType"+iomy.devices.onvif.ThingTypeId+"/StreamUsername", "");
            oModel.setProperty("/thingType"+iomy.devices.onvif.ThingTypeId+"/StreamPassword", "");
        }
    },
    
    ToggleEditIPWebcamControls : function (bEnabled) {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        oModel.setProperty("/enabled/IfAcceptingInput", bEnabled && !oController.bLoadingOnvifProfiles);
        
        this.ToggleControls(bEnabled);
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
                case "linkType"+iomy.devices.zigbeesmartplug.LinkTypeId:
                    iomy.common.ShowFormFragment( oController, "ZigbeeSmartPlug", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Philips Hue Bridge --//
                case "linkType"+iomy.devices.philipshue.LinkTypeId:
                    iomy.common.ShowFormFragment( oController, "PhillipsHueBridge", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Onvif Server --//
                case "linkType"+iomy.devices.onvif.LinkTypeId:
                    iomy.common.ShowFormFragment( oController, "OnvifServer", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Onvif Stream --//
                case "thingType"+iomy.devices.onvif.ThingTypeId:
                    iomy.common.ShowFormFragment( oController, "OnvifCamera", "DevSettingsBlock", "Block" );
                    
                    oController.SetHubIdOfOnvifServer();
                    oController.LoadOnvifProfilesForSelectBoxes();
                    oController.SetOnvifServer();
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- IP Webcam (MJPEG Stream) --//
                case "linkType"+iomy.devices.ipcamera.LinkTypeId:
                    iomy.common.ShowFormFragment( oController, "IPCamera", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                //-- Open Weather Map --//
                case "linkType"+iomy.devices.weatherfeed.LinkTypeId:
                    iomy.common.ShowFormFragment( oController, "OpenWeatherMap", "DevSettingsBlock", "Block" );
                    
                    if (bEditing) {
                        
                    }
                    
                    break;
                    
                default:
                    $.sap.log.error("DevTypeToggle: Critcal Error. sDevType set incorrectly:"+sDevType);
                    break;
            }
        }
    },

    RefreshModel: function( oConfig ) {
        try {
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
            var oJSON = iomy.functions.getDeviceFormJSON({
                roomID : oController.iRoomId,
                premiseID : oController.iPremiseId
            });

            oJSON.Rooms         = oController.PrepareRoomListForModel(1);
            oJSON.Hubs          = iomy.common.HubList;
            oJSON.OnvifProfiles = {};
            oJSON.IPCamTypes    = {
                "_1" : {
                    "TypeName" : "MJPEG"
                }
            };

            oJSON.enabled = {
                "Always"                        : true,
                "IfRoomsExist"                  : true && oController.bRoomsExist,
                "IfRoomsExistAndAcceptingInput" : true && oController.bRoomsExist && oController.bAcceptingInput,
                "IfAcceptingInput"              : true && oController.bAcceptingInput,
                "IfOnvifProfilesHaveLoaded"     : true && !oController.bLoadingOnvifProfiles && !oController.bSubmitting,
                "IfOnvifCameraIsSelected"       : true && oController.bOnvifCameraSelected,
                "IfOnvifProfilesFound"          : true && oController.bOnvifCameraSelected && oController.bProfilesLoaded
            };

            oJSON.visible = {
                "IfStreamAuthSelected" : false
            };

            var fnComplete = function () {
                var oModel = new sap.ui.model.json.JSONModel(oJSON);
                oView.setModel(oModel);
            
                oModel.setProperty("/enabled/IfSettingsChanged", true);

                //------------------------------------------------//
                //-- Trigger the onSuccess Event                --//
                //------------------------------------------------//
                if( oConfig.onSuccess ) {
                    oConfig.onSuccess();
                }
            };

            if (oController.bEditExisting) {
                var oCurrentDevice = JSON.parse( JSON.stringify( iomy.common.ThingList["_"+oController.iThingId] ) );

                oJSON.CurrentDevice = {
                    "ThingName" : oCurrentDevice.DisplayName,
                    "RoomId"    : oCurrentDevice.RoomId
                };

                //----------------------------------------------------------------//
                // If editing an IP Webcam, load the connection information as 
                // well.
                //----------------------------------------------------------------//
                if (oCurrentDevice.TypeId == iomy.devices.ipcamera.ThingTypeId) {

                    var fnSetData = function (mData) {
                        oJSON.CurrentDevice.HubId       = mData.hubID;

                        oJSON.CurrentDevice.Protocol    = mData.protocol;
                        oJSON.CurrentDevice.IPAddress   = mData.address;
                        oJSON.CurrentDevice.IPPort      = mData.port;

                        oJSON.CurrentDevice.Path        = mData.path;
                        oJSON.CurrentDevice.Username    = mData.username;
                        oJSON.CurrentDevice.Password    = mData.password;
                    };

                    fnComplete(); // Just to wipe the old data.

                    iomy.devices.ipcamera.loadCameraInformation({
                        thingID : oController.iThingId,

                        onSuccess : function (mData) {
                            fnSetData(mData);

                            fnComplete();
                            oController.bAcceptingInput = true;
                            oController.ToggleControls(true);
                        },

                        onWarning : function (mData, sErrorMessage) {
                            fnSetData(mData);

                            iomy.common.showWarning(sErrorMessage, "Failed to load some data",
                                function () {
                                    fnComplete();
                                    oController.bAcceptingInput = true;
                                    oController.ToggleControls(true);
                                }
                            );
                        },

                        onFail : function (sErrorMessage) {
                            iomy.common.showError(sErrorMessage, "Failed to load data",
                                function () {
                                    fnComplete();
                                    oController.ToggleControls(true);
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
            
        } catch (e) {
            $.sap.log.error("Failed to refresh the model in the device form ("+e.name+"): " + e.message);
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
        var bEditing            = this.bEditExisting;
        var aRoomList           = JSON.parse( JSON.stringify( iomy.common.RoomsList["_"+iPremiseId] ) );
        var iRoomCount          = iomy.functions.getNumberOfRoomsInPremise(iPremiseId);
        var iUnassignedRoomId   = 0;
        var bUnassignedOnly     = false;
        var bHasUnassigned      = false;
        
        $.each(aRoomList, function (sI, mRoom) {
            iUnassignedRoomId = mRoom.RoomId;
            mRoom.Enabled = true;
            
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
            oController.bRoomsExist = false;
            
            oController.bNoRooms = true;
            
        } else {
            oController.bNoRooms = false;
            oController.bRoomsExist = true;
            
            if (bHasUnassigned) {
                if (bEditing) {
                    aRoomList["_"+iUnassignedRoomId].Enabled = false || oController.isOldRoomTheUnassigned();
                } else {
                    delete aRoomList["_"+iUnassignedRoomId];
                }
            }
        }
        
        return aRoomList;
    },
    
    CancelInput : function () {
        var oController = this;
        
        iomy.common.NavigationChangePage("pDevice", { "bEditing" : oController.iThingId !== null }, true);
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
        
        if (iLinkId > 0) {
            oController.bProfilesLoaded = false;
            oController.bLoadingOnvifProfiles = true;
            oController.bOnvifCameraSelected = false;
            oController.ToggleControls(false);
            
            oModelData.OnvifProfiles = {
                "loading" : {
                    "Token" : "loading",
                    "Name" : "Loading Profiles..."
                }
            };

            oView.setModel( 
                new sap.ui.model.json.JSONModel(oModelData)
            );
            
            iomy.devices.onvif.LookupProfiles({
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
                    
                    oView.setModel( 
                        new sap.ui.model.json.JSONModel(oModelData)
                    );

                    oController.bLoadingOnvifProfiles = false;
                    oController.bProfilesLoaded = true;
                    oController.bOnvifCameraSelected = true;
                    oController.ToggleControls(true);
                },

                onFail : function () {
                    var oModelData = JSON.parse(oView.getModel().getJSON());
                    oModelData.OnvifProfiles = {
                        "error" : {
                            "Token" : "error",
                            "Name" : "Failed to load profiles."
                        }
                    };

                    oView.setModel( 
                        new sap.ui.model.json.JSONModel(oModelData)
                    );

                    oController.bLoadingOnvifProfiles = false;
                    oController.bOnvifCameraSelected = true;
                    oController.bProfilesLoaded = false;
                    oController.ToggleControls(true);
                }
            });
        } else {
            oModelData.OnvifProfiles = {};
            oController.bLoadingOnvifProfiles = false;
            oController.bOnvifCameraSelected = false;
            oController.bProfilesLoaded = false;

            oView.setModel( 
                new sap.ui.model.json.JSONModel(oModelData)
            );
            
            oController.ToggleControls(true);
        }
    },
    
    SetHubIdOfOnvifServer : function () {
        var oController         = this;
        var oView               = oController.getView();
//        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
//        var iLinkId             = oView.getModel().getProperty("/"+sDevTypeKey+"/Server");
//        
//        oView.getModel().setProperty( "/"+sDevTypeKey+"/HubId", iomy.functions.getHubConnectedToLink(iLinkId).HubId);
        
        oView.byId("DevTypeSelect").setSelectedKey("thingType"+iomy.devices.onvif.ThingTypeId);
    },
    
    SetOnvifServer : function () {
        var oController         = this;
        var oView               = oController.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
//        var iLinkId             = oView.getModel().getProperty("/"+sDevTypeKey+"/Server");
//        
        oView.getModel().setProperty( "/"+sDevTypeKey+"/OnvifServer", "");
    },
    
    CreateDevice : function () {
        var oController         = this;
        var oView               = oController.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var oCurrentFormData    = oView.getModel().getProperty( "/"+sDevTypeKey+"/" );
        var mData               = {};
        //var oModel              = oView.getModel();
        
        // If the Room ID either less than 1 or an invalid value, like null or 
        // undefined, set it to the 'Unassigned' room.
        if (isNaN(oCurrentFormData.Room) || oCurrentFormData.Room < 1) {
            oCurrentFormData.Room = 1;
        }
        
        oController.bSubmitting = true;
        oController.ToggleControls(false);
        
        //--------------------------------------------------------------------//
        // Validate input first. If everything checks out, then create the
        // device. Otherwise, show an error popup and stop.
        //--------------------------------------------------------------------//
        var mInputInfo = iomy.validation.validateNewDeviceData(sDevTypeKey, oCurrentFormData);
        
        if (!mInputInfo.bIsValid) {
            iomy.common.showError(mInputInfo.aErrorMessages.join("\n\n"), "Error",
                function () {
                    oController.bSubmitting = false;
                    oController.ToggleControls(true);
                }
            )
        } else {
        
            //--------------------------------------------------------------------//
            // Prepare the URL and parameters for the call to create a device.
            //--------------------------------------------------------------------//
            switch (sDevTypeKey) {
                // Onvif Camera Device
                case "linkType"+iomy.devices.onvif.LinkTypeId :
                    mData = {
                        url : iomy.apiphp.APILocation("onvif"),
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
                case "linkType"+iomy.devices.philipshue.LinkTypeId :
                    mData = {
                        url : iomy.apiphp.APILocation("philipshue"),
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
                case "linkType"+iomy.devices.weatherfeed.LinkTypeId :
                    mData = {
                        url : iomy.apiphp.APILocation("weather"),
                        data : {
                            "Mode" : "AddWeatherStation",
                            "HubId" : oCurrentFormData.Hub,
                            "DisplayName" : oCurrentFormData.DisplayName,
                            "WeatherType" : "OpenWeatherMap",
                            "Username" : oCurrentFormData.KeyCode,
                            "StationCode" : oCurrentFormData.StationCode,
                            "RoomId" : oCurrentFormData.Room,
                            "Data" : JSON.stringify({
                                "LinkName" : oCurrentFormData.DisplayName,
                                "ThingName" : oCurrentFormData.DisplayName
                            })
                        }
                    };
                    break;

                // IP Webcam Stream
                case "linkType"+iomy.devices.ipcamera.LinkTypeId :
                    mData = {
                        url : iomy.apiphp.APILocation("ipcamera"),
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
                case "thingType"+iomy.devices.onvif.ThingTypeId :
                    mData = {
                        url : iomy.apiphp.APILocation("onvif"),
                        data : {
                            "Mode" : "NewThing",
                            "LinkId" : oCurrentFormData.OnvifServer,
                            "StreamProfile" : oCurrentFormData.StreamProfile,
                            "ThumbnailProfile" : oCurrentFormData.ThumbnailProfile,
                            "CameraName" : oCurrentFormData.CameraName
                        }
                    };
                    
                    //--------------------------------------------------------------------//
                    // Check what authorisation method is used and add it to the request
                    // parameters.
                    //--------------------------------------------------------------------//
                    oCurrentFormData.StreamAuthMethod = parseInt(oCurrentFormData.StreamAuthMethod);
                    switch (oCurrentFormData.StreamAuthMethod) {
                        case 1:
                            mData.data.StreamAuth = JSON.stringify({
                                "AuthType" : oCurrentFormData.StreamAuthMethod
                            });
                            break;

                        case 2:
                            mData.data.StreamAuth = JSON.stringify({
                                "AuthType" : oCurrentFormData.StreamAuthMethod,
                                "Username" : oCurrentFormData.StreamUsername,
                                "Password" : oCurrentFormData.StreamPassword
                            });
                            break;
                            
                        default:
                            break;
                    }
                    
                    break;

                default :
                    throw new IllegalArgumentException("Invalid device type");

            }

            mData.onSuccess = function (response, data) {
                try {
                    if (data.Error !== true) {
                        jQuery.sap.log.debug("Success: "+JSON.stringify(response));
                        jQuery.sap.log.debug("Success: "+JSON.stringify(data));

                        //--------------------------------------------------------------//
                        // Find the new Link ID.
                        //--------------------------------------------------------------//
                        var iLinkId = 0;
                        
                        var aErrorMessages = [];

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

                        //----------------------------------------------------------------------------------------//
                        // If a stream was added, then we should apply the PTZ control option.
                        //----------------------------------------------------------------------------------------//
                        if (sDevTypeKey === "thingType"+iomy.devices.onvif.ThingTypeId) {
                            iomy.devices.onvif.togglePTZControls({
                                thingID : data.Data.Data[0].ThingId,
                                disabled : oCurrentFormData.PTZDisabled,

                                onFail : function (sErrorMessage) {
                                    aErrorMessages.push(sErrorMessage);
                                },

                                onComplete : function () {
                                    if (aErrorMessages.length > 0) {
                                        iomy.common.showWarning("Unable to set the PTZ control settings:\n\n" + aErrorMessages.join("\n\n"), "", function () {
                                            oController.ReloadCoreVariables(iLinkId);
                                        });
                                    } else {
                                        oController.ReloadCoreVariables(iLinkId);
                                    }
                                }
                            });
                        } else {
                            oController.ReloadCoreVariables(iLinkId);
                        }
                    } else {
                        jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                        iomy.common.showError("Error creating device:\n\n"+data.ErrMesg, "", function () {
                            oController.bSubmitting = false;
                            oController.ToggleControls(true);
                        });
                    }
                } catch (e) {
                    var sErrorMessage = "Error creating device:\n\n"+e.message+"\n\n"+iomy.common.showContactSupportMessage();
                    jQuery.sap.log.error(sErrorMessage);
                    iomy.common.showError(sErrorMessage, "", function () {
                        oController.bSubmitting = false;
                        oController.ToggleControls(true);
                    });
                }

            };

            mData.onFail = function (error) {
                jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
                iomy.common.showError("Error creating device:\n\n"+error.responseText, "", function () {
                    oController.bSubmitting = false;
                    oController.ToggleControls(true);
                });
            };

            //--------------------------------------------------------------------//
            // Run the request to create a device.
            //--------------------------------------------------------------------//
            iomy.apiphp.AjaxRequest(mData);
        }
    },
    
    ReloadCoreVariables : function (iLinkId) {
        var oController         = this;
        var oView               = oController.getView();
        
        try {
            iomy.common.RefreshCoreVariables({
                onSuccess : function () {
                    oController.RefreshModel({
                        onSuccess : function () {
                            iomy.common.showMessage({
                                text : "Device successfully created"
                            });

                            if (iomy.functions.getLinkTypeIDOfLink(iLinkId) === 6) {
                                oView.byId("DevTypeSelect").setSelectedKey("thingType"+iomy.devices.onvif.ThingTypeId);

                                //oCurrentFormData.OnvifServer = iLinkId;
                                oController.DevTypeToggle(oController, "thingType"+iomy.devices.onvif.ThingTypeId);

                            } else {
                                oController.DevTypeToggle(oController, oView.byId("DevTypeSelect").getSelectedKey());
                                //iomy.common.NavigationChangePage("pBlock", {}, true);
                            }

                            if (oView.byId("DevTypeSelect").getSelectedKey() === "thingType"+iomy.devices.onvif.ThingTypeId) {
                                oController.bLoadingOnvifProfiles = false;
                                oController.bOnvifCameraSelected = false;
                                oController.bProfilesLoaded = false;
                            }

                            oController.bSubmitting = false;
                            oController.ToggleControls(true);

                        }
                    });
                }
            });
        } catch (e) {
            $.sap.log.error("Error attempting to refresh the core variables after creating a device ("+e.name+"): " + e.message);
        }
    },
    
    EditDevice : function () {
        var oController         = this;
        var oView               = oController.getView();
        var bError              = false;
        var oCurrentFormData    = oView.getModel().getProperty( "/CurrentDevice/" );
        
        //--------------------------------------------------------------------//
        // Check that the display name is filled out.
        //--------------------------------------------------------------------//
        if (oCurrentFormData.ThingName === "") {
            bError = true;
            iomy.common.showError("A device name must be given.", "Error");
        }
        
        if (!bError) {
            //if (oController.areThereChanges()) {
                oController.ToggleControls(false);

                //--------------------------------------------------------------------//
                // Run the request to edit an existing device.
                //--------------------------------------------------------------------//
                try {
                    iomy.devices.editThing({
                        thingID     : oController.iThingId,
                        thingName   : oCurrentFormData.ThingName,
                        roomID      : oCurrentFormData.RoomId,

                        onSuccess : function () {
                            if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
                                oController.SubmitIPWebcamData();
                            } else {
                                oController.ToggleControls(true);
                                oController.CancelInput();
                            }
                        },

                        onWarning : function () {
                            oController.ToggleControls(true);
                        },

                        onFail : function () {
                            oController.ToggleControls(true);
                        }
                    });
                } catch (e) {
                    iomy.common.showError(e.message, "Error",
                        function () {
                            oController.ToggleControls(true);
                        }
                    );
                }
//            } else {
//                if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
//                    oController.ToggleControls(false);
//                    oController.SubmitIPWebcamData();
//                } else {
//                    oController.ToggleControls(true);
//                }
//            }
        }
    },
    
    areThereChanges : function () {
        var oController             = this;
        var oView                   = oController.getView();
        var oModel                  = oView.getModel();
        var iRoomId                 = oModel.getProperty("/CurrentDevice/RoomId");
        var sThingText              = oModel.getProperty("/CurrentDevice/ThingName");
        
		var bDifferentThingName     = oController.sOldThingText !== sThingText;
        var bDifferentRoom          = oController.iOldRoomID != iRoomId;
        
        return (bDifferentThingName || bDifferentRoom);
    },
    
    SubmitIPWebcamData : function () {
        var oController         = this;
        var oView               = this.getView();
        var oCurrentFormData    = oView.getModel().getProperty( "/CurrentDevice/" );
        
        try {
            var mInputInfo = iomy.validation.validateEditIPWebCamForm(oCurrentFormData);
            
            if (!mInputInfo.bIsValid) {
                throw new IllegalArgumentException(mInputInfo.aErrorMessages.join("\n\n"));
            }
            
            //--------------------------------------------------------------------//
            // Only attempt the submission if the device being added or modified
            // is an MJPEG stream
            //--------------------------------------------------------------------//
            if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
                oController.bAcceptingInput = false;
                oController.ToggleControls(false);
                
                iomy.devices.ipcamera.submitWebcamInformation({
                    thingID             : oController.iThingId,
                    
                    hubID               : oCurrentFormData.HubId,
                    ipAddress           : oCurrentFormData.IPAddress,
                    ipPort              : oCurrentFormData.IPPort,
                    streamPath          : oCurrentFormData.Path,
                    protocol            : oCurrentFormData.Protocol,
                    username            : oCurrentFormData.Username,
                    password            : oCurrentFormData.Password,
                    fileType            : "MJPEG",
                    
                    editing : true,

                    onSuccess : function () {
                        iomy.common.RefreshCoreVariables({
                            onSuccess : function () {
                                oController.RefreshModel();
                                
                                iomy.common.showMessage({
                                    text : "IP Webcam updated."
                                });

                                oController.bAcceptingInput = true;
                                oController.ToggleControls(true);
                                oController.CancelInput();
                            }
                        });
                    },

                    onFail : function (sErrorMessage) {
                        iomy.common.showError(sErrorMessage, "Failed to update settings",
                            function () {
                                oController.bAcceptingInput = true;
                                oController.ToggleControls(true);
                            }
                        );
                    }
                });

            }

        } catch (e) {
            //-- An unexpected error occurred. --//
            iomy.common.showError(e.message, "Failed to update settings",
                function () {
                    oController.bAcceptingInput = true;
                    oController.ToggleControls(true);
                }
            );
        }
    },
    
    isOldRoomTheUnassigned : function () {
        var iOldRoomID              = iomy.common.ThingList["_"+this.iThingId].RoomId;
            
        return iOldRoomID == 1;
    },
    
    ToggleSubmitButton : function () {
        //this.getView().byId("ButtonSubmit").setEnabled( this.areThereChanges() );
    },
    
    //========================================================================//
    // Zigbee Telnet functionality.
    //========================================================================//
    
    RunZigbeeCommand : function () {
        var oController         = this;
        var oView               = this.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var iHubId              = oView.getModel().getProperty( "/"+sDevTypeKey+"/" ).Hub;
        var sCommand            = oView.byId("CustomTelnetInput").getValue();
        var oLogContents        = oView.byId("TelnetOutput").getValue();
        
        oController.ToggleZigbeeControls(false);
        
        try {
            if (sCommand.startsWith("rapidha_form_network") || sCommand.startsWith("rapidha_form_network_netvoxchan")) {
                var sUUIDRequired = "RapidHA UUID is required. Run 'get_rapidha_info' to find it.";

                iomy.common.showInformation(sUUIDRequired, "UUID Required.",
                    function () {
                        oController.ToggleZigbeeControls(true);
                    }
                );

            } else {
                oLogContents += "Running "+sCommand+"...\n";
                oView.byId("TelnetOutput").setValue(oLogContents);
                
                iomy.telnet.RunCommand({
                    command : sCommand,
                    hubID : iHubId,

                    onSuccess : function (result) {

                        try {
                            oLogContents = oView.byId("TelnetOutput").getValue();
                            oLogContents += result+"\n-------------------------------------\n";
                            oView.byId("TelnetOutput").setValue(oLogContents);

                            // Force it to scroll down to the bottom.
                            document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                            iomy.common.showMessage({
                                text : sCommand+" executed successfully"
                            });
                        } catch (e) {
                            oLogContents += e.name + ": " + e.message +"\n-------------------------------------\n";
                            oView.byId("TelnetOutput").setValue(oLogContents);
                            
                        } finally {
                            oController.ToggleZigbeeControls(true);
                        }
                    },

                    onFail : function (sError) {
                        var oLogContents = oView.byId("TelnetOutput").getValue();

                        oLogContents += sError+"\n-------------------------------------\n";
                        oView.byId("TelnetOutput").setValue(oLogContents);

                        oController.ToggleZigbeeControls(true);
                    }
                });
            }
        } catch (e) {
            oLogContents = oView.byId("TelnetOutput").getValue();
            
            oLogContents += e.name + ": " + e.message +"\n-------------------------------------\n";
            oView.byId("TelnetOutput").setValue(oLogContents);

            oController.ToggleZigbeeControls(true);
        }
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
            "get_zigbee_info",
            "rapidha_form_network",
            "rapidha_form_network_netvoxchan"
        ];
        
        try {
            //------------------------------------------------------------//
            // Insert each of the telnet commands to the menu.            //
            //------------------------------------------------------------//
            $.each(aCommands, function (iIndex, sCommand) {
                oNavList.addItem(
                    new sap.tnt.NavigationListItem({
                        text : sCommand,
                        select : function() {
                            oView.byId("CustomTelnetInput").setValue(sCommand);

                            oController.RunZigbeeCommand();
                        
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
        } catch (e) {
            $.sap.log.error("Failure in the zigbee menu function in the device form ("+e.name+"): " + e.message);
        }
    },
    
    StartZigbeeJoin : function () {
        var oController         = this;
        var oView               = this.getView();
        var iCommId             = oView.byId("ZigModemSelect").getSelectedKey();
        
        oController.ToggleZigbeeControls(false);
        
        try {
            iomy.devices.zigbeesmartplug.TurnOnZigbeeJoinMode({
                modemID : iCommId,

                onSuccess : function (result) {

                    try {
                        var oLogContents = oView.byId("TelnetOutput").getValue();

                        oLogContents += result+"\n-------------------------------------\n";
                        oView.byId("TelnetOutput").setValue(oLogContents);

                        // Force it to scroll down to the bottom.
                        document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                        iomy.devices.zigbeesmartplug.GetRapidHAInfo({
                            modemID : iCommId,

                            onSuccess : function (result) {

                                try {
                                    var oLogContents = oView.byId("TelnetOutput").getValue();

                                    oLogContents += JSON.stringify(result)+"\n-------------------------------------\n\nWaiting 30 seconds for devices to join.";
                                    oView.byId("TelnetOutput").setValue(oLogContents);

                                    // Force it to scroll down to the bottom.
                                    document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                                    setTimeout(
                                        function () {
                                            oController.ToggleZigbeeControls(true);

                                            iomy.common.showMessage({
                                                text : "Join completed."
                                            });
            //                                iomy.common.RefreshCoreVariables({
            //                                    onSuccess : function () {
            //                                        oController.ToggleZigbeeControls(true);
            //
            //                                        iomy.common.showMessage({
            //                                            text : "Join completed."
            //                                        });
            //                                    },
            //                                    
            //                                    onFail : function () {
            //                                        oController.ToggleZigbeeControls(true);
            //                                        
            //                                        iomy.common.showMessage({
            //                                            text : "Join completed. But unable to refresh the device list."
            //                                        });
            //                                    }
            //                                });
                                        },
                                    30000);
                                } catch (e) {
                                    $.sap.log.error("Error with the success callback after retrieving RapidHA info ("+e.name+"): " + e.message);
                                    iomy.common.showError(e.name + ": " + e.message, "Failed to join devices.", function () {
                                        oController.ToggleZigbeeControls(true);
                                    });
                                }
                            },

                            onFail : function (sError) {
                                try {
                                    var oLogContents = oView.byId("TelnetOutput").getValue();

                                    oLogContents += result+"\n-------------------------------------\n";
                                    oView.byId("TelnetOutput").setValue(oLogContents);

                                    // Force it to scroll down to the bottom.
                                    document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                                    iomy.common.showError(sError, "Error", function () {
                                        oController.ToggleZigbeeControls(true);
                                    });
                                } catch (e) {
                                    $.sap.log.error("Error with the failure callback after retrieving RapidHA info ("+e.name+"): " + e.message);
                                    iomy.common.showError(e.name + ": " + e.message, "Failed to join devices.", function () {
                                        oController.ToggleZigbeeControls(true);
                                    });
                                }
                            }
                        });
                        
                    } catch (e) {
                        $.sap.log.error("Error with the success callback after turning on join mode ("+e.name+"): " + e.message);
                        iomy.common.showError(e.name + ": " + e.message, "Failed to join devices.", function () {
                            oController.ToggleZigbeeControls(true);
                        });
                    }

                },

                onFail : function (sError) {
                    try {
                        var oLogContents = oView.byId("TelnetOutput").getValue();
                        oLogContents += sError+"\n-------------------------------------\n";

                        oView.byId("TelnetOutput").setValue(oLogContents);

                        // Force it to scroll down to the bottom.
                        document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;

                        iomy.common.showError(sError, "Failed to join devices.", function () {
                            oController.ToggleZigbeeControls(true);
                        });
                    } catch (e) {
                        $.sap.log.error("Error with the failure callback after after turning on join mode ("+e.name+"): " + e.message);
                        iomy.common.showError(e.name + ": " + e.message, "Failed to join devices.", function () {
                            oController.ToggleZigbeeControls(true);
                        });
                    }
                }
            });
        } catch (e) {
            iomy.common.showError(e.name + ": " + e.message, "Failed to join devices.", function () {
                oController.ToggleZigbeeControls(true);
            });
        }
    }
    
});