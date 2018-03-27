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

sap.ui.controller("pages.Development.AddStream", {
    bStreamsAvailable : false,
    mStream : null,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			
			onBeforeShow: function ( oEvent ) {
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                if (oEvent.data.Stream !== null && oEvent.data.Stream !== undefined) {
                    oController.mStream = oEvent.data.Stream;
                } else {
                    oController.mStream = null;
                }
                
                oController.RefreshModel(oController, {});
			}
			
		});	
	},
    
    ToggleControls : function (bEnabled) {
        try {
            var oController = this;
            var oView       = this.getView();
            var oModel      = oView.getModel();
            var sControl    = "/controlsEnabled/";

            oModel.setProperty(sControl + "MostControls",   bEnabled);
            oModel.setProperty(sControl + "IfHasStreams",   bEnabled && oController.bStreamsAvailable);
        } catch (e) {
            $.sap.log.error("Error enabling or disabling controls ("+e.name+"): " + e.message);
        }
    },
    
    RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView           = oController.getView();
        var oModel          = null;
        var oModelData      = {};
        var sTitle          = "";
        var aStreams        = iomy.devices.onvif.getListOfOnvifStreams();
        var bEnabled        = true;
        
        if (oController.mStream === null) {
            sTitle = "Add Managed Camera Stream";
        } else {
            sTitle = "Edit Managed Camera Stream";
        }
        
        if (aStreams.length === 0) {
            oController.bStreamsAvailable = false;
            
            aStreams.push({
                ThingId : 0,
                ThingName : "No streams available."
            });
        } else {
            oController.bStreamsAvailable = true;
        }
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
        oModelData = {
            "title" : sTitle,
            "fields" : {},
            "options" : {
                "OnvifCameras" : aStreams,
                "CameraTypes" : [
                    {
                        "Id" : "1",
                        "Name" : "Onvif Camera"
                    }
                ]
            },
            "controlsEnabled" : {
                "MostControls"  : true,
                "IfHasStreams"  : true && oController.bStreamsAvailable
            }
        };
        
        if (oController.mStream !== null) {
            if (oController.mStream.State === "Enabled") {
                bEnabled = true;
            } else {
                bEnabled = false;
            }
            
            oModelData.fields = {
                "CameraType" : "1",
                "SelectedCamera" : oController.mStream.ThingId,
                "Name" : oController.mStream.DeviceName,
                "Enabled" : bEnabled
            };
        } else {
            oModelData.fields = {
                "CameraType" : "1",
                "SelectedCamera" : aStreams[0].ThingId,
                "Name" : "",
                "Enabled" : bEnabled
            };
        }
        
		oModel = new sap.ui.model.json.JSONModel(oModelData);
        oModel.setSizeLimit(420);
        oView.setModel( oModel );
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	},
    
    submitStreamInformation : function () {
        var oController = this;
        var oView       = this.getView();
        var oFormData   = oView.getModel().getProperty("/fields/");
        
        var aErrorMessages  = [];
        
        var iCameraType = oFormData.CameraType;
        var iCamId      = oFormData.SelectedCamera;
        var sName       = oFormData.Name;
        var vEnabled    = oFormData.Enabled;
        var sDataString = "";
        var sMode       = "";
        
        oController.ToggleControls(false);
        
        if (sName === "") {
            aErrorMessages.push("Stream name must be given.");
        }
        
        if (aErrorMessages.length > 0) {
            iomy.common.showError(aErrorMessages.join("\n"), "Error",
                function () {
                    oController.ToggleControls(true);
                }
            );
            return;
        }
        
        if (vEnabled) {
            vEnabled = 1;
        } else {
            vEnabled = 0;
        }
        
        if (oController.mStream !== null) {
            sMode = "EditStream";
            sDataString = JSON.stringify({
                "Name" : sName,
                "Enabled" : vEnabled,
                "StreamId" : oController.mStream.StreamId
            });
            
        } else {
            sMode = "AddStream";
            sDataString = JSON.stringify({
                "Name" : sName,
                "Enabled" : vEnabled,
                "ThingId" : iCamId
            });
        }
        
        try {
            iomy.apiphp.AjaxRequest({
                url     : iomy.apiphp.APILocation("managedstreams"),
                data    : {
                    "Mode" : sMode,
                    "Id" : iCameraType,
                    "Data" : sDataString
                },
                
                onSuccess : function () {
                    var sSuccessMessage;
                    
                    if (oController.mStream === null) {
                        sSuccessMessage = sName + " created.";
                    } else {
                        sSuccessMessage = sName + " updated.";
                    }
                    
                    //-- Append the message to allow about a minute before it will appear in the list. --//
                    sSuccessMessage += " Changes should appear in the list in about 60 seconds.";
                    
                    oController.ToggleControls(true);
                    
                    iomy.common.showMessage({
                        text : sSuccessMessage
                    });
                    
                    iomy.common.NavigationChangePage( "pManagedStreams" ,  {} , false);
                },
                
                onFail : function (response) {
                    iomy.common.showError(response.responseText, "Error",
                        function () {
                            oController.ToggleControls(true);
                        }
                    );
                }
            });
            
        } catch (e) {
            $.sap.log.error("Error attempting to run the managed stream API ("+e.name+"): "+ e.message);
            oController.ToggleControls(true);
        }
    }
});