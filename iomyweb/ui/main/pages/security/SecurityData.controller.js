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
    aFormFragments:     {},
    
    iCameraId : null,
    iCameraTypeId : null,
    
    bRoomsExist             : false,
    bNoRooms                : false,
    bAcceptingInput         : false,
	
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
                    iDeviceType = iomy.common.ThingList["_"+oController.iCameraId].TypeId;
                } else {
                    oController.iCameraId = null;
                }
                
                oController.RefreshModel();
                oController.ResetTabPosition();
                
                oController.iCameraTypeId = iDeviceType;
                oController.LoadStream();
                
                switch (iDeviceType) {
                    case iomy.devices.onvif.ThingTypeId:
                        iomy.common.ShowFormFragment( oController, "EditOnvifStreamSettings", "CameraSettingsTab", "Content" );
                        oController.UpdateThumbnail();
                        oController.LoadStreamSettings();
                        break;
                        
                    case iomy.devices.ipcamera.ThingTypeId:
                        iomy.common.ShowFormFragment( oController, "DeviceFormEditIPCamera", "CameraSettingsTab", "Content" );
                        break;
                }
                
			}
		});
			
		
	},
    
    ToggleStreamDataFields : function (bEnabled) {
        var oController = this;
        var oView       = oController.getView();
        var oModel      = oView.getModel();
        
        oModel.setProperty("/enabled/Always",                       bEnabled);
        oModel.setProperty("/enabled/IfAllowed",                    bEnabled);
        oModel.setProperty("/enabled/IfRoomsExist",                 bEnabled && oController.bRoomsExist);
        oModel.setProperty("/enabled/IfRoomsExistAndAcceptingInput",bEnabled && oController.bRoomsExist && oController.bAcceptingInput);
        oModel.setProperty("/enabled/IfAcceptingInput",             bEnabled && oController.bAcceptingInput);
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
        var bOnvif      = iomy.common.ThingList["_"+oController.iCameraId].TypeId == iomy.devices.onvif.ThingTypeId;
        var iPremiseId  = iomy.common.ThingList["_"+oController.iCameraId].PremiseId;
        var aRoomList   = iomy.functions.prepareRoomListSelectBoxOptions(oController, iPremiseId);
        
        var fnComplete = function () {
            oModel = new sap.ui.model.json.JSONModel(oData);
            oModel.setSizeLimit(420);
            oView.setModel(oModel);
        }
        
        try {
            //------------------------------------------------//
            //-- Build and Bind Model to the View           --//
            //------------------------------------------------//
            oData = {
                "title" : iomy.common.ThingList["_"+oController.iCameraId].DisplayName,
                "count" : {
                    "thumbnails" : ""
                },
                "data"  : {
                    "streamUrl" : "",
                    "thumbnailUrl" : ""
                },
                "enabled" : {
                    "Always"                        : true,
                    "IfAllowed"                     : true,
                    "IfRoomsExist"                  : true && oController.bRoomsExist,
                    "IfRoomsExistAndAcceptingInput" : true && oController.bRoomsExist && oController.bAcceptingInput,
                    "IfAcceptingInput"              : true && oController.bAcceptingInput
                },
//                "options" : {
//                    "rooms" : aRoomList
//                },
                "misc" : {
                    "thumbnailText" : "",
                    "selectedTab" : null
                },
                "visible" : {
                    "IfStreamAuthSelected" : false,
                    "IfViewingOnvifCamera" : bOnvif
                },
                "fields" : {
                    "ptzDisabled" : false,
                    "streamAuthType" : 0,
                    "streamUsername" : "",
                    "streamPassword" : ""
                },
                
                //-- Model elements that need to be ported to the more structured format. --//
                "Rooms" : aRoomList,
                "Hubs" : iomy.common.HubList,
                "IPCamTypes" : {
                    "_1" : {
                        "TypeName" : "MJPEG"
                    }
                },
                
                "CurrentDevice" : {
                    "Hub" : "",
                    "Premise" : iPremiseId,
                    "Room" : iomy.common.ThingList["_"+oController.iCameraId].RoomId,
                    "IPCamType" : "MJPEG",
                    "Protocol" : "http",
                    "IPAddress" : "",
                    "IPPort" : "",
                    "Path" : "",
                    "DisplayName" : "",
                    "LinkName" : "",
                    "Username" : "",
                    "Password" : ""
                }
            };
            
            if (bOnvif) {
                oData.count.thumbnails = 0;
                oData.misc.thumbnailText = "Thumbnail(s)";
            }
            
            var oCurrentDevice = JSON.parse( JSON.stringify( iomy.common.ThingList["_"+oController.iCameraId] ) );

            oData.CurrentDevice = {
                "ThingName" : oCurrentDevice.DisplayName,
                "RoomId"    : oCurrentDevice.RoomId
            };

            //----------------------------------------------------------------//
            // If editing an IP Webcam, load the connection information as 
            // well.
            //----------------------------------------------------------------//
            if (oCurrentDevice.TypeId == iomy.devices.ipcamera.ThingTypeId) {

                var fnSetData = function (mData) {
                    oData.CurrentDevice.HubId       = mData.hubID;

                    oData.CurrentDevice.Protocol    = mData.protocol;
                    oData.CurrentDevice.IPAddress   = mData.address;
                    oData.CurrentDevice.IPPort      = mData.port;

                    oData.CurrentDevice.Path        = mData.path;
                    oData.CurrentDevice.Username    = mData.username;
                    oData.CurrentDevice.Password    = mData.password;
                };

                fnComplete(); // Just to wipe the old data.

                iomy.devices.ipcamera.loadCameraInformation({
                    thingID : oController.iCameraId,

                    onSuccess : function (mData) {
                        fnSetData(mData);

                        fnComplete();
                        oController.bAcceptingInput = true;
                        oController.ToggleStreamDataFields(true);
                    },

                    onWarning : function (mData, sErrorMessage) {
                        fnSetData(mData);

                        iomy.common.showWarning(sErrorMessage, "Failed to load some data",
                            function () {
                                fnComplete();
                                oController.bAcceptingInput = true;
                                oController.ToggleStreamDataFields(true);
                            }
                        );
                    },

                    onFail : function (sErrorMessage) {
                        iomy.common.showError(sErrorMessage, "Failed to load data",
                            function () {
                                fnComplete();
                                oController.ToggleStreamDataFields(true);
                            }
                        );
                    }
                });

            } else {
                fnComplete();
            }
        } catch (e) {
            $.sap.log.error("Failed to refresh the model ("+e.name+"): " + e.message);
        }
        
    },
    
    ResetTabPosition : function () {
        var oView   = this.getView();
        var oModel  = oView.getModel();
        
        try {
            oModel.setProperty("/misc/selectedTab", null);
        } catch (e) {
            $.sap.log.error("Something weird went wrong ("+e.name+"): " + e.message);
        }
    },
    
    SetMJPEGStream : function (sUrl) {
        var oView   = this.getView();
        var oModel  = oView.getModel();
        
        try {
            oModel.setProperty("/data/streamUrl", sUrl);
        } catch (e) {
            $.sap.log.error("Failed to load MJPEG stream ("+e.name+"): " + e.message);
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
    
    UpdateThumbnailCount : function (iCount) {
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        try {
            //-- Until we have support for multiple thumbnails the default count is 1. --//
            if (!iomy.validation.isValueGiven(iCount)) {
                iCount = 1;
            }
            
            oModel.setProperty("/count/thumbnails", iCount);
            
        } catch (e) {
            $.sap.log.error("Failed to update thumbnail count ("+e.name+"): " + e.message);
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
                    var iDeviceId = oController.iCameraId;
                    
                    oView.byId("streamTab").removeAllPages();
                
                    //--------------------------------------------------------//
                    // Create the content of the stream tab.
                    //--------------------------------------------------------//
                    if (oView.byId("mjpegStream") !== undefined) {
                        oView.byId("mjpegStream").destroy();
                    }
                
                    //--------------------------------------------------------//
                    // Load stream URL.
                    //--------------------------------------------------------//
                    iomy.devices.ipcamera.loadStreamUrl({
                        thingID : oController.iCameraId,

                        onSuccess : function (sUrl) {
                            //oView.byId("mjpegStream").setSrc(sUrl);
                            console.log(sUrl);
                            
                            oView.byId("streamTab").addPage(
                                new sap.m.Image ({
                                    src : sUrl,
                                    densityAware : false,

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
                        },

                        onFail : function (sError) {
                            $.sap.log.error("Failed to load the stream URL: " + sError);
                            if (oApp.getCurrentPage() === oView && iDeviceId === oController.iCameraId) {
                                iomy.common.showError("Ensure that the connection settings are correct, and that the stream is online.", "Stream Not Available");
                            }
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

                                //--------------------------------------------------------//
                                // Create the content of the stream tab.
                                //--------------------------------------------------------//
                                oView.byId("streamTab").addPage(
                                    new sap.ui.core.HTML({
                                        preferDOM: true,
                                        content: "{/data/videoContent}"
                                    })
                                );
                            
                                if (bManagedStream) {
                                    oModel.setProperty("/data/videoContent", "<iframe height='300px' width='100%' scrolling='no' frameborder='0' src='resources/video/streamplayer.php?StreamId="+oController.iCameraId+"'></iframe>");

                                } else {
                                    iomy.devices.onvif.getStreamURL({
                                        ThingId : oController.iCameraId,
                                        
                                        onSuccess : function (sUrl) {
                                            var aVideoHtml = [
                                                '<video width="100%" height="300px" controls>',
                                                '    <source src="'+sUrl+'" type="video/mp4">',
                                                '    Your browser does not support HTML 5 videos.',
                                                '</video>'
                                            ];

                                            oModel.setProperty("/data/videoContent", aVideoHtml.join());
                                        },
                                        
                                        onFail : function (response) {
                                            $.sap.log.error("Failed to load the stream URL: " + response.responseText);
                                            var aVideoHtml = [
                                                '<video width="100%" height="300px" controls>',
                                                //'    <source src="'+sUrl+'" type="video/mp4">',
                                                '    Your browser does not support HTML 5 videos.',
                                                '</video>'
                                            ];

                                            oModel.setProperty("/data/videoContent", aVideoHtml.join());
                                        }
                                    });
                                    //--------------------------------------------------------//
                                    // Create a notice to add this camera to the managed stream
                                    // list.
                                    //--------------------------------------------------------//
//                                    oView.byId("streamTab").addPage(
//                                        new sap.m.ObjectListItem ({
//                                            title: sErrorMessage,
//                                            type: "Active",
//                                            attributes : [
//                                                new sap.m.ObjectAttribute ({
//                                                    text: "Tap to manage this stream"
//                                                })
//                                            ],
//                                            press : function () {
//                                                iomy.common.NavigationChangePage("pAddStream" , { "ThingId" : oController.iCameraId } , false);
//                                            }
//                                        })
//                                    );
                                }
                            },

                            onFail : function (response) {
                                oView.byId("streamTab").removeAllPages();
                                
                                if (response.status == 500 || response.status == 503) {
                                    iomy.common.showError("Please try again. If the problem persists, restart iOmy.", "Failed to load stream");
                                    $.sap.log.error("Failed to load the data: " + response.responseText);
                                } else {
                                    iomy.common.showError(response.responseText, "Error");
                                }
                                
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
                    try {
                        //-- Toggle PTZ controls no matter what. --//
                        iomy.devices.onvif.togglePTZControls({
                            thingID : oController.iCameraId,
                            disabled : oSettingsFormData.ptzDisabled,

                            onComplete : function () {
                                if (aErrorMessages.length === 0) {
                                    var iNewAuthType = oSettingsFormData.streamAuthType;

                                    iomy.common.showMessage({
                                        text : "Stream settings updated."
                                    });

                                    oController.ToggleStreamDataFields(true);
                                    //oController.RefreshModel();
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
                        
                    } catch (e) {
                        iomy.common.showError(e.message, "Error",
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
        
        //--------------------------------------------------------------------//
        // Attempt to load the stream settings.
        //--------------------------------------------------------------------//
        try {
            //-- Disable the controls. --//
            oController.ToggleStreamDataFields(false);
            
            //--------------------------------------------------------------------//
            // Run the function to load the stream
            //--------------------------------------------------------------------//
            iomy.devices.onvif.loadStreamAuthMethod({
                thingID : oController.iCameraId,
                
                onSuccess : function (iAuthType) {
                    oModel.setProperty("/fields/streamAuthType", iAuthType);
                    
                },
                
                onFail : function (sErrorMessage) {
                    aErrorMessages.push(sErrorMessage);
                },
                
                onComplete : function () {
                    //---------------------------------------------------------------------------//
                    // Load the PTZ Control status.
                    //---------------------------------------------------------------------------//
                    try {
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
            
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
                    oController.ToggleStreamDataFields(true);
                    oController.ToggleOnvifStreamAuthenticationForm();
                }
            );
        }
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
            
            if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
                oController.bAcceptingInput = false;
                oController.ToggleStreamDataFields(false);
                
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
                                oController.ToggleStreamDataFields(true);
                            }
                        });
                    },

                    onFail : function (sErrorMessage) {
                        iomy.common.showError(sErrorMessage, "Failed to update settings",
                            function () {
                                oController.bAcceptingInput = true;
                                oController.ToggleStreamDataFields(true);
                            }
                        );
                    }
                });

            }

        } catch (e) {
            iomy.common.showError(e.message, "Failed to update settings",
                function () {
                    oController.bAcceptingInput = true;
                    oController.ToggleStreamDataFields(true);
                }
            );
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
//            if (oController.areThereChanges()) {
                oController.ToggleStreamDataFields(false);

                //--------------------------------------------------------------------//
                // Run the request to edit an existing device.
                //--------------------------------------------------------------------//
                try {
                    iomy.devices.editThing({
                        thingID     : oController.iCameraId,
                        thingName   : oCurrentFormData.ThingName,
                        roomID      : oCurrentFormData.RoomId,

                        onSuccess : function () {
                            if (oController.iCameraTypeId == iomy.devices.ipcamera.ThingTypeId) {
                                oController.SubmitIPWebcamData();
                            } else {
                                oController.ToggleStreamDataFields(true);
                            }
                        },

                        onWarning : function () {
                            oController.ToggleStreamDataFields(true);
                        },

                        onFail : function () {
                            oController.ToggleStreamDataFields(true);
                        }
                    });
                } catch (e) {
                    iomy.common.showError(e.message, "Error",
                        function () {
                            oController.ToggleStreamDataFields(true);
                        }
                    );
                }
//            } else {
//                if (oController.iThingTypeId == iomy.devices.ipcamera.ThingTypeId) {
//                    oController.ToggleStreamDataFields(false);
//                    oController.SubmitIPWebcamData();
//                } else {
//                    oController.ToggleStreamDataFields(true);
//                }
//            }
        }
    }
});