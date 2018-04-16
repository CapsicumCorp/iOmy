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

sap.ui.controller("pages.security.SecurityData", {
    
    iCameraId : null,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.Advanced
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				var iDeviceType = 0;
                
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                if (evt.data.CameraId !== undefined && evt.data.CameraId !== null) {
                    oController.iCameraId = evt.data.CameraId;
                } else {
                    oController.iCameraId = null;
                }
                
                iDeviceType = iomy.common.ThingList["_"+oController.iCameraId].TypeId;
                oController.RefreshModel();
                
                switch (iDeviceType) {
                    case iomy.devices.ipcamera.ThingTypeId:
                        oController.LoadMJPEGStream();
                        break;
                        
                    case iomy.devices.onvif.ThingTypeId:
                        oController.UpdateThumbnail();
                        break;
                        
                }
			}
		});
			
		
	},
	
    RefreshModel : function () {
        var oController = this;
        var oView       = this.getView();
        var oData       = {};
        var oModel      = null;
        
        try {
            //------------------------------------------------//
            //-- Build and Bind Model to the View           --//
            //------------------------------------------------//
            oData = {
                "title" : iomy.common.ThingList["_"+oController.iCameraId].DisplayName,
                "count" : {
                    "thumbnails" : 0
                },
                "data"  : {
                    "streamUrl" : "",
                    "thumbnailUrl" : ""
                }
            };

            oModel = new sap.ui.model.json.JSONModel(oData);
            oModel.setSizeLimit(420);
            oView.setModel(oModel);
        } catch (e) {
            $.sap.log.error("Failed to refresh the model ("+e.name+"): " + e.message);
        }
        
    },
    
    UpdateThumbnail : function () {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        try {
            var sUrl = iomy.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+oController.iCameraId;
            
            oModel.setProperty("/data/thumbnailUrl", sUrl);
            
        } catch (e) {
            $.sap.log.error("Failed to update thumbnail ("+e.name+"): " + e.message);
        }
    },
    
    LoadMJPEGStream : function () {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        try {
            iomy.devices.ipcamera.loadStreamUrl({
                thingID : oController.iCameraId,

                onSuccess : function (sUrl) {
                    oModel.setProperty("/data/streamUrl", sUrl);
                },

                onFail : function (sError) {
                    $.sap.log.error("Failed to load the stream URL: " + sError);
                    iomy.common.showError("Ensure that the connection settings are correct, and that the stream is online.", "Stream Not Available");
                }
            });
        } catch (e) {
            $.sap.log.error("Failed to load the stream URL: " + e.message);
        }
    }
});