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
    iCameraTypeId : null,
	
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
                
                oController.iCameraTypeId = iDeviceType;
                oController.LoadStream();
                
                switch (iDeviceType) {
                    case iomy.devices.onvif.ThingTypeId:
                        oController.UpdateThumbnail();
                        oController.LoadStreamSettings();
                        break;
                        
                }
                
			}
		});
			
		
	},
    
    ToggleStreamDataFields : function (bEnabled) {
        var oController = this;
        var oView       = oController.getView();
        var oModel      = oView.getModel();
        
        oModel.setProperty("/enabled/IfAllowed", bEnabled);
        oModel.setProperty("/enabled/Always", bEnabled);
    },
    
    ToggleOnvifStreamAuthenticationForm : function () {
        var oView       = this.getView();
        var oModel      = oView.getModel();
        var iAuthType   = oModel.getProperty("/fields/streamAuthType");
        var bVisible    = iAuthType == 2;
        
        oModel.setProperty("/visible/IfStreamAuthSelected", bVisible);
        
        if (!bVisible) {
            oModel.setProperty("/fields/streamUsername", "");
            oModel.setProperty("/fields/streamPassword", "");
        }
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
                },
                "enabled" : {
                    "IfAllowed" : true
                },
                "visible" : {
                    "IfStreamAuthSelected" : false
                },
                "fields" : {
                    "ptzDisabled" : false,
                    "streamAuthType" : 0,
                    "streamUsername" : "",
                    "streamPassword" : ""
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
            oModel.setProperty("/count/thumbnails", 1);
            
        } catch (e) {
            $.sap.log.error("Failed to update thumbnail ("+e.name+"): " + e.message);
        }
    },
    
    /**
     * Loads either an Onvif stream managed by WatchInputs, or an image tag
     * pointing to a MJPEG stream.
     */
    LoadStream : function () {
        var oController     = this;
        var oView           = this.getView();
        var oModel          = oView.getModel();
        var sErrorMessage   = "Onvif stream not managed.";
        
        oView.byId("streamTab").removeAllPages();
        oView.byId("streamTab").addPage(
            new sap.m.ObjectListItem ({
                title: "Loading..."
            })
        );
        
        try {
            
            switch (oController.iCameraTypeId) {
                case iomy.devices.ipcamera.ThingTypeId:
                    oView.byId("streamTab").removeAllPages();
                    //--------------------------------------------------------//
                    // Create the content of the stream tab.
                    //--------------------------------------------------------//
                    oView.byId("streamTab").addPage(
                        new sap.m.Image ({
                            densityAware : false,
                            src:"{/data/streamUrl}",
                           
                            error : function () {
                                //--------------------------------------------------------//
                                // Create a notice that the stream failed to load.
                                //--------------------------------------------------------//
                                oView.byId("streamTab").removeAllPages();
                                oView.byId("streamTab").addPage(
                                    new sap.m.ObjectListItem ({
                                        title: "Failed to load the stream"
                                    })
                                );
                            }
                        })
                    );
                
                    //--------------------------------------------------------//
                    // Load stream URL.
                    //--------------------------------------------------------//
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
                    
                    break; // The all-important break.
                    
                case iomy.devices.onvif.ThingTypeId:
                    try {
                        //--------------------------------------------------------//
                        // Generate a list of managed streams.
                        //--------------------------------------------------------//
                        iomy.devices.getManagedStreamList({

                            onSuccess : function (aData) {
                                //--------------------------------------------------------------------//
                                // Process the list of streams to see if the Onvif stream is managed.
                                //--------------------------------------------------------------------//
                                var bManagedStream  = false;
                                oView.byId("streamTab").removeAllPages();

                                for (var i = 0; i < aData.length; i++) {
                                    var mStream         = aData[i];

                                    if (mStream.ThingId === oController.iCameraId) {
                                        bManagedStream = true;
                                        break;
                                    }
                                }

                                if (bManagedStream) {
                                    //--------------------------------------------------------//
                                    // Create the content of the stream tab.
                                    //--------------------------------------------------------//
                                    oView.byId("streamTab").addPage(
                                        new sap.ui.core.HTML({
                                            preferDOM: true,
                                            content: "{/data/videoContent}"
                                        })
                                    );

                                    oModel.setProperty("/data/videoContent", "<iframe height='300px' width='100%' scrolling='no' frameborder='0' src='resources/video/streamplayer.php?StreamId="+oController.iCameraId+"'></iframe>");

                                } else {
                                    //--------------------------------------------------------//
                                    // Create a notice to add this camera to the managed stream
                                    // list.
                                    //--------------------------------------------------------//
                                    oView.byId("streamTab").addPage(
                                        new sap.m.ObjectListItem ({
                                            title: sErrorMessage,
                                            type: "Active",
                                            attributes : [
                                                new sap.m.ObjectAttribute ({
                                                    text: "Tap to manage this stream"
                                                })
                                            ],
                                            press : function () {
                                                iomy.common.NavigationChangePage("pAddStream" , { "ThingId" : oController.iCameraId } , false);
                                            }
                                        })
                                    );
                                }
                            },

                            onFail : function (response) {
                                oView.byId("streamTab").removeAllPages();
                                iomy.common.showError(response, "Error");
                                
                                //--------------------------------------------------------//
                                // Create a notice that the stream failed to load.
                                //--------------------------------------------------------//
                                oView.byId("streamTab").addPage(
                                    new sap.m.ObjectListItem ({
                                        title: "Failed to load the stream"
                                    })
                                );
                            }

                        });
                    } catch (e) {
                        //--------------------------------------------------------//
                        // Create a notice that the camera stream must be managed.
                        //--------------------------------------------------------//
                        if (e.name === "PermissionException") {
                            oView.byId("streamTab").addPage(
                                new sap.m.ObjectListItem ({
                                    title: sErrorMessage
                                })
                            );

                        } else {
                            throw e; // Rethrow the exception because something else has gone wrong;
                        }
                    }
                    
                    break;
            }
        } catch (e) {
            //--------------------------------------------------------//
            // Create a notice that the stream failed to load.
            //--------------------------------------------------------//
            oView.byId("streamTab").addPage(
                new sap.m.ObjectListItem ({
                    title: "Failed to load the stream"
                })
            );
            
            $.sap.log.error("Failed to load the stream: " + e.message);
        }
    },
    
    SaveStreamSettings : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oModel              = oView.getModel();
        var oSettingsFormData   = oModel.getProperty("/fields");
        var aErrorMessages      = [];
        
        try {
            oController.ToggleStreamDataFields(false);
            
            //---------------------------------------------------------------------------------//
            // Go to change the stream authentication type and then toggle PTZ controls.
            //---------------------------------------------------------------------------------//
            iomy.devices.onvif.changeStreamAuthMethod({
                thingID : oController.iCameraId,
                authType : parseInt(oSettingsFormData.streamAuthType),
                streamUsername : oSettingsFormData.streamUsername,
                streamPassword : oSettingsFormData.streamPassword,
                
                onComplete : function () {
                    //-- Toggle PTZ controls no matter what. --//
                    iomy.devices.onvif.togglePTZControls({
                        thingID : oController.iCameraId,
                        enabled : !oSettingsFormData.ptzDisabled,

                        onComplete : function () {
                            if (aErrorMessages.length === 0) {
                                var iNewAuthType = oSettingsFormData.streamAuthType;
                                
                                iomy.common.showMessage({
                                    text : "Stream data updated."
                                });

                                oController.ToggleStreamDataFields(true);
                                oController.RefreshModel();
                                oModel.setProperty("/fields/streamAuthType", iNewAuthType);
                                oController.ToggleOnvifStreamAuthenticationForm();

                                switch (oController.iCameraTypeId) {
                                    case iomy.devices.onvif.ThingTypeId:
                                        oController.UpdateThumbnail();
                                        break;

                                }
                            } else {
                                iomy.common.showError(aErrorMessages.join("\n\n"), "Error",
                                    function () {
                                        oController.ToggleStreamDataFields(true);
                                    }
                                );
                            }
                        },

                        onFail : function (sErrorMessage) {
                            aErrorMessages.push(sErrorMessage);
                        }
                    });
                },
                
                onFail : function (sErrorMessage) {
                    aErrorMessages.push(sErrorMessage);
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.ToggleStreamDataFields(true);
                }
            );
        }
    },
    
    LoadStreamSettings : function () {
        var oController     = this;
        var aErrorMessages  = [];
        var oView           = oController.getView();
        var oModel          = oView.getModel();
        
        try {
            oController.ToggleStreamDataFields(false);
            
            iomy.devices.onvif.loadStreamAuthMethod({
                thingID : oController.iCameraId,
                
                onSuccess : function (iAuthType) {
                    //console.log(iAuthType);
                    oModel.setProperty("/fields/streamAuthType", iAuthType);
                    
                },
                
                onFail : function (sErrorMessage) {
                    aErrorMessages.push(sErrorMessage);
                },
                
                onComplete : function () {
                    //---------------------------------------------------------------------------//
                    // Load the PTZ Control status.
                    //---------------------------------------------------------------------------//
                    iomy.devices.onvif.loadPTZControlStatus({
                        thingID : oController.iCameraId,
                        
                        onSuccess : function (iStatus) {
                            var bState = iStatus === 1;
                            
                            oModel.setProperty("/fields/ptzDisabled", bState);
                        },
                        
                        onFail : function (sErrorMessage) {
                            aErrorMessages.push(sErrorMessage);
                        },
                        
                        onComplete : function () {
                            if (aErrorMessages.length > 0) {
                                iomy.common.showError(aErrorMessages.join("\n\n"), "Error",
                                    function () {
                                        oController.ToggleStreamDataFields(true);
                                        oController.ToggleOnvifStreamAuthenticationForm();
                                    }
                                );
                            
                            } else {
                                oController.ToggleStreamDataFields(true);
                                oController.ToggleOnvifStreamAuthenticationForm();
                            }
                        }
                    });
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.ToggleStreamDataFields(true);
                    oController.ToggleOnvifStreamAuthenticationForm();
                }
            );
        }
    }
});