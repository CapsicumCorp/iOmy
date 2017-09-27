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

$.sap.require("IomyRe.functions.getNewDeviceOptions");

sap.ui.controller("pages.staging.device.DeviceForm", {
	aFormFragments: 	{},
    
    bEditExisting       : false,
	DeviceOptions       : null,
    
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
	
	
	DevTypeToggle : function ( oController, sDevType) {
        var bEditing = oController.bEditExisting;
		var oView = oController.getView();
		var oTarget = oView.byId("DevType");
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
//			new sap.ui.model.json.JSONModel({
//				"":             MyApp.common.aEstatesList,
//				"Houses":              oController.aVisibleHouses,
//				"Inclusions":          oController.aVisibleInclusions,
//				"CurrentLandPackage":  aLandPackageData
//			})
			new sap.ui.model.json.JSONModel(oJSON)
		);
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
//		if( oConfig.onSuccess ) {
//			oConfig.onSuccess();
//		}
		
	}
	
});