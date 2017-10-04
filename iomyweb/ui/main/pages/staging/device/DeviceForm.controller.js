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
	aFormFragments: 	{},
    
    bEditExisting           : false,
    bLoadingOnvifProfiles   : false,
	DeviceOptions           : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
//		if (!IomyRe.common.bLinkTypesLoaded) {
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
	
    ToggleOnvifStreamControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("InputStreamName").setEnabled(bEnabled);
        oView.byId("SelectStreamProfile").setEnabled(bEnabled);
        oView.byId("SelectThumbnailProfile").setEnabled(bEnabled);
        oView.byId("ButtonSubmit").setEnabled(bEnabled);
    },
	
	DevTypeToggle : function ( oController, sDevType) {
        var bEditing = oController.bEditExisting;
		var oView = oController.getView();
		//var oTarget = oView.byId("DevType");
		console.log(sDevType);
        
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
		
//		try {
//			if (sDevType === "ZSP") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "ZigbeeSmartPlug", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "PHB") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "PhillipsHueBridge", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "CSRM") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "CSRMesh", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "IPC") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "IPCamera", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "OWM") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "OpenWeatherMap", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "OnVCam") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "OnvifCamera", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "OnVServ") {
//				oView.byId("DevSettings").setVisible( true );
//				IomyRe.common.ShowFormFragment( oController, "OnvifServer", "DevSettingsBlock", "Block" );
//			} else if (sDevType === "start") {
//				oView.byId("DevSettings").setVisible( false );
//			} else {
//				$.sap.log.error("DevTypeToggle: Critcal Error. sDevType set incorrectly:"+sDevType);
//			}
//		} catch(e1) {
//			$.sap.log.error("DevTypeToggle: Critcal Error:"+e1.message);
//			return false;
//		}
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
    
    LoadOnvifProfilesForSelectBoxes : function () {
        var oController = this;
        var oView       = oController.getView();
        var iLinkId     = oView.byId("SelectOnvifServer").getSelectedKey();
        
        oController.ToggleOnvifStreamControls(false);
        
        oView.byId("SelectStreamProfile").destroyItems();
        oView.byId("SelectThumbnailProfile").destroyItems();
        
        if (iLinkId > 0) {
            oController.bLoadingOnvifProfiles = true;
            
            IomyRe.devices.onvif.LookupProfiles({
                linkID : iLinkId,

                onSuccess : function (aProfiles) {
                    for (var i = 0; i < aProfiles.length; i++) {

                        oView.byId("SelectStreamProfile").addItem(
                            new sap.ui.core.Item({
                                key : aProfiles[i].ProfileToken,
                                text : aProfiles[i].ProfileName
                            })
                        );

                        oView.byId("SelectThumbnailProfile").addItem(
                            new sap.ui.core.Item({
                                key : aProfiles[i].ProfileToken,
                                text : aProfiles[i].ProfileName
                            })
                        );

                    }

                    oController.ToggleOnvifStreamControls(true);
                    oController.bLoadingOnvifProfiles = false;
                },

                onFail : function () {
                    oView.byId("SelectStreamProfile").addItem(
                        new sap.ui.core.Item({
                            text : "Failed to load profiles."
                        })
                    );

                    oView.byId("SelectThumbnailProfile").addItem(
                        new sap.ui.core.Item({
                            text : "Failed to load profiles."
                        })
                    );

                    oController.ToggleOnvifStreamControls(false);

                    oController.bLoadingOnvifProfiles = false;
                }
            });
        }
    },
    
    CreateDevice : function () {
        var oController         = this;
        var oView               = oController.getView();
        var sDevTypeKey         = oView.byId("DevTypeSelect").getSelectedKey();
        var oCurrentFormData    = oView.getModel().getProperty( "/"+sDevTypeKey+"/" );
        var mData               = {};
        
        switch (sDevTypeKey) {
            case "linkType"+IomyRe.devices.onvif.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("onvif"),
                    data : {
                        "Mode" : "AddNewOnvifServer",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "DeviceNetworkAddress" : oCurrentFormData.IPAddress,
                        "DeviceOnvifPort" : oCurrentFormData.IPPort,
                        "OnvifUsername" : oCurrentFormData.Username,
                        "OnvifPassword" : oCurrentFormData.Password
                    }
                };
                break;
            
            case "linkType"+IomyRe.devices.philipshue.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("philipshue"),
                    data : {
                        "Mode" : "AddNewBridge",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "DeviceNetworkAddress" : oCurrentFormData.IPAddress,
                        "DevicePort" : oCurrentFormData.IPPort,
                        "DeviceUserToken" : oCurrentFormData.DeviceToken
                    }
                };
                break;
            
            case "linkType"+IomyRe.devices.weatherfeed.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("weather"),
                    data : {
                        "Mode" : "AddWeatherStation",
                        "HubId" : oCurrentFormData.Hub,
                        "WeatherType" : "OpenWeatherMap",
                        "Username" : oCurrentFormData.KeyCode,
                        "StationCode" : oCurrentFormData.StationCode,
                        "RoomId" : oCurrentFormData.Room,
                        "Data" : "{\"Name\" : \""+oCurrentFormData.DisplayName+"\"}"
                    }
                };
                break;
            
            case "linkType"+IomyRe.devices.ipcamera.LinkTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("ipcamera"),
                    data : {
                        "Mode" : "AddNewIPCamera",
                        "HubId" : oCurrentFormData.Hub,
                        "RoomId" : oCurrentFormData.Room,
                        "Data" : {
                            "NetworkAddress" : oCurrentFormData.IPAddress,
                            "NetworkPort" : oCurrentFormData.IPPort,
                            "Protocol" : oCurrentFormData.Protocol,
                            "Path" : oCurrentFormData.Path
                        }
                    }
                };
                break;
                
            case "thingType"+IomyRe.devices.onvif.ThingTypeId :
                mData = {
                    url : IomyRe.apiphp.APILocation("onvif"),
                    data : {
                        "Mode" : "NewThing",
                        "LinkId" : oCurrentFormData.Server,
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
            } else {
                jQuery.sap.log.error("An error has occurred with the link ID: consult the \"Success\" output above this console");
                IomyRe.common.showError("Error creating device:\n\n"+data.ErrMesg);
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
                                oCurrentFormData.OnvifServer = iLinkId;
                                oController.DevTypeToggle(oController, "thingType"+IomyRe.devices.onvif.ThingTypeId);

                            } else {
                                IomyRe.common.NavigationChangePage("pDeviceOverview", {}, true);
                            }
                        }
                    });
                }
            });
        };
        
        mData.onFail = function (error) {
            jQuery.sap.log.error("Error (HTTP Status "+error.status+"): "+error.responseText);
            IomyRe.common.showError("Error creating device:\n\n"+error.responseText, "",
                function () {
                    
                }
            );
        };
        
        //--------------------------------------------------------------------//
        // Run the request to create or edit an existing device.
        //--------------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest(mData);
    }
	
});