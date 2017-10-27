/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
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
    
    bDeviceOptionSelectorDrawn  : false,
    
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
                
                if (!oController.bDeviceOptionSelectorDrawn) {
                    var oSBox = IomyRe.widgets.selectBoxNewDeviceOptions (oView.createId("DevTypeSelect"),{
                        selectedKey : "start",
                        change : function () {
                            var DevTypeSelect = this;
                            var sDevType = DevTypeSelect.getSelectedKey();
                            oController.DevTypeToggle(oController, sDevType);
                        }
                    });

                    oView.byId("DeviceTypeFormElement").addField(oSBox);
                    
                    oController.bDeviceOptionSelectorDrawn = true;
                }
                
                //-- Check the parameters --//
                oView.byId("DevTypeSelect").setSelectedKey("start");
                oView.byId("DevSettings").setVisible( false );
                
                //-- Defines the Device Type --//
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                //-- Are we editing an existing device? --//
                if (oEvent.data.editing !== undefined) {
                    oController.bEditExisting = oEvent.data.editing;
                } else {
                    oController.bEditExisting = false;
                }
                
                oController.DeviceOptions = IomyRe.functions.getNewDeviceOptions();
                
                oController.RefreshModel();
            }
            
        });
        
    },
    
    onBeforeRendering : function () {
        
    },
    
    ToggleOnvifStreamControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("SelectOnvifServer").setEnabled(bEnabled);
        oView.byId("InputStreamName").setEnabled(bEnabled);
        oView.byId("SelectStreamProfile").setEnabled(bEnabled);
        oView.byId("SelectThumbnailProfile").setEnabled(bEnabled);
        oView.byId("ButtonSubmit").setEnabled(bEnabled);
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
        
        oView.setModel( 
            new sap.ui.model.json.JSONModel(oJSON)
        );
        
        //------------------------------------------------//
        //-- Trigger the onSuccess Event                --//
        //------------------------------------------------//
        if( oConfig.onSuccess ) {
            oConfig.onSuccess();
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
        var aRoomList           = JSON.parse( JSON.stringify( IomyRe.common.RoomsList["_"+iPremiseId] ) );
        var iRoomCount          = IomyRe.functions.getNumberOfRoomsInPremise(iPremiseId);
        var iUnassignedRoomId   = 0;
        var bUnassignedOnly     = true;
        
        $.each(aRoomList, function (sI, mRoom) {
            iUnassignedRoomId = mRoom.RoomId;
            
            if (mRoom.RoomName === "Unassigned" && iRoomCount === 1) {
                bUnassignedOnly = true;
            } else {
                bUnassignedOnly = false;
            }
            
            return false;
        });
        
        if (bUnassignedOnly) {
            aRoomList = {};
            aRoomList["_"+iUnassignedRoomId] = {
                "RoomId" : iUnassignedRoomId,
                "RoomName" : "No rooms configured for premise"
            };
        } else {
            delete aRoomList["_"+iUnassignedRoomId];
        }
        
        return aRoomList;
    },
    
    CancelInput : function () {
        IomyRe.common.NavigationTriggerBackForward();
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
                        "Data" : "{\"NetworkAddress\":\""+oCurrentFormData.IPAddress+"\",\"NetworkPort\":\""+oCurrentFormData.IPPort+"\",\"Protocol\":\""+oCurrentFormData.Protocol+"\",\"Path\":\""+oCurrentFormData.Path+"\",\"DisplayName\":\""+oCurrentFormData.DisplayName+"\",\"LinkName\":\""+oCurrentFormData.LinkName+"\"}"
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
                                    //IomyRe.common.NavigationChangePage("pBlock", {}, true);
                                }
                                
                                if (oView.byId("DevTypeSelect").getSelectedKey() === "thingType"+IomyRe.devices.onvif.ThingTypeId) {
                                    oController.ToggleOnvifStreamControls(false);
                                    oView.byId("SelectOnvifServer").setEnabled(true);
                                }
                            }
                        });
                    }
                });
            } else {
                jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                IomyRe.common.showError("Error creating device:\n\n"+data.ErrMesg);
            }
            
        };
        
        mData.onFail = function (error) {
            jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            IomyRe.common.showError("Error creating device:\n\n"+error.responseText, "");
        };
        
        //--------------------------------------------------------------------//
        // Run the request to create or edit an existing device.
        //--------------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest(mData);
    },
    
    RunZigbeeCommand : function () {
        var oView               = this.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var iHubId              = oView.getModel().getProperty( "/"+sDevTypeKey+"/" ).Hub;
        var sCommand            = oView.byId("CustomTelnetInput").getValue();
        var oLogContents        = oView.byId("TelnetOutput").getValue();
        
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
        var oView               = this.getView();
        var iCommId             = oView.byId("ZigModemSelect").getSelectedKey();
        
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
                
                        oLogContents += JSON.stringify(result)+"\n-------------------------------------\n";
                        oView.byId("TelnetOutput").setValue(oLogContents);
                
                        // Force it to scroll down to the bottom.
                        document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;
                        
                        IomyRe.common.RefreshCoreVariables({
                            onSuccess : function () {
                                IomyRe.common.showMessage({
                                    text : "Join completed. Your devices should appear within 5 minutes.",
                                    view : oView
                                });
                            }
                        });
                    },
                    
                    onFail : function (sError) {
                        var oLogContents = oView.byId("TelnetOutput").getValue();
                
                        oLogContents += result+"\n-------------------------------------\n";
                        oView.byId("TelnetOutput").setValue(oLogContents);
                    }
                });
                
                
            },
            
            onFail : function (sError) {
                var oLogContents = oView.byId("TelnetOutput").getValue();
                oLogContents += sError+"\n-------------------------------------\n";
                
                oView.byId("TelnetOutput").setValue(oLogContents);
                
                // Force it to scroll down to the bottom.
                document.getElementById(oView.createId("TelnetOutput-inner")).scrollTop = document.getElementById(oView.createId("TelnetOutput-inner")).scrollHeight;
            }
        });
    }
    
});