/*
Title: IP Camera Page UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the controls to view a camera feed, capture a screenshot or
    record some pictures, and any motion activity.
Copyright: Capsicum Corporation 2016, 2017

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

sap.ui.controller("pages.device.OnvifCamera", {
	bUIDrawn : false,
    bPTZDisabled : true,
    
    aElementsToDestroy : [],
    
    wCameraFeed         : null,
    wBtnMoveUp          : null,
    wBtnMoveLeft        : null,
    wBtnMoveRight       : null,
    wBtnMoveDown        : null,
    wSnapshotTimeField  : null,
    wLocationField      : null,
    wPanel              : null,
    
    oThing : null,
    
    iThingId : null,
    UTSLastUpdate : null,
    sStreamProfileName : null,
    sStreamProfileUrl : null,
    sThumbnailProfileName : null,
    sThumbnailProfileUrl : null,
    
    oTimeoutThumbnailRefresh : null,
    sMode: "",
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.device.OnvifCamera
*/
	onInit: function() {
		var oController = this;
		var oView = oController.getView();
        
        // Import the device label functions
        //var LabelFunctions = iomy.functions.DeviceLabels;
		
		oView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                
                if (evt.data.ThingId !== null && evt.data.ThingId !== undefined) {
                    // Import the given Thing
                    oController.oThing = iomy.common.ThingList['_'+evt.data.ThingId];
                    oController.iThingId = evt.data.ThingId;

    //                oController.loadLinkConn(oController.oThing.LinkId);
    //                oController.displayRoomLocation();

                    oView.wSnapshotTimeField.setText("Loading...");

                    oView.byId("ToolbarTitle").setText( iomy.common.ThingList["_"+evt.data.ThingId].DisplayName );

                    //-- Store the Page Mode --//
                    oController.sMode = "Thumbnail";

                    if( typeof evt.data.Mode!=="undefined") {
                        oController.sMode = evt.data.Mode;
                    }

    //				if( oController.sMode==="Player" ) {
    //					oView.byId("PageContainer_Thumbnail").setVisible( false );
    //					oView.byId("PageContainer_Player").setVisible( true );
    //				} else {
    //					oView.byId("PageContainer_Thumbnail").setVisible( true );
    //					oView.byId("PageContainer_Player").setVisible( false );
    //				}

                    oController.RefreshModel();
                    oController.loadProfile();
                    oController.SetPTZControlStatus();
                    
                } else {
                    $.sap.log.error("Thing ID was not given as a parameter.");
                }
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.device.OnvifCamera
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.device.OnvifCamera
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.device.OnvifCamera
*/
//	onExit: function() {
//
//	}

//    displayRoomLocation : function () {
//        var oController = this;
//        var oView       = this;
//    },
//    
//    loadLinkConn : function (iLinkId) {
//        this.mLinkConnInfo = iomy.functions.getLinkConnInfo(iLinkId);
//        this.sDeviceNetworkAddress = this.mLinkConnInfo.LinkConnAddress;
//        this.iDeviceOnvifPort = this.mLinkConnInfo.LinkConnPort;
//        this.sOnvifUsername = this.mLinkConnInfo.LinkConnUsername;
//        this.sOnvifPassword = this.mLinkConnInfo.LinkConnPassword;
//    },
    
    //---------------------------------------------------//
    // PTZ Functionality
    //---------------------------------------------------//
    bHasPTZ : true,
    bPTZButtonsEnabled : false,
    
    setPTZButtonsEnabled : function(bStatus) {
        var oController = this;
        var oView       = this.getView();
        var oModel      = oView.getModel();
        
        try {
            oModel.setProperty("/enabled/Always", bStatus);
        } catch (e) {
            $.sap.log.error("Unexpected error toggling PTZ buttons. ("+e.name+"): " + e.message);
        }
    },
    
    RefreshModel : function () {
        var oController     = this;
        var oView           = oController.getView();
        var oData           = {};
        var oModel          = null;
        
        try {
            oData = {
                "visible" : {
                    "IfPTZControlsAreEnabled" : false
                }
            };
            
            oModel = new sap.ui.model.json.JSONModel(oData);
            oView.setModel(oModel);
            
        } catch (e) {
            $.sap.log.error("Failed to refresh the model ("+e.name+"): " + e.message);
        }
    },
    
    SetPTZControlStatus : function () {
        var oController     = this;
        var oView           = oController.getView();
        var oModel          = oView.getModel();
        var aErrorMessages  = [];
        
        //---------------------------------------------------------------------------//
        // Load the PTZ Control status.
        //---------------------------------------------------------------------------//
        try {
            iomy.devices.onvif.loadPTZControlStatus({
                thingID : oController.oThing.Id,

                onSuccess : function (iStatus) {
                    var bState = iStatus === 0;
                    
                    oController.bPTZDisabled = !bState;

                    oModel.setProperty("/visible/IfPTZControlsAreEnabled", bState);
                },

                onFail : function (sErrorMessage) {
                    aErrorMessages.push(sErrorMessage);
                },

                onComplete : function () {
                    if (aErrorMessages.length > 0) {
                        iomy.common.showError(aErrorMessages.join("\n\n"), "Error",
                            function () {
//                                oController.ToggleStreamDataFields(true);
//                                oController.ToggleOnvifStreamAuthenticationForm();
                            }
                        );

                    } else {
//                        oController.ToggleStreamDataFields(true);
//                        oController.ToggleOnvifStreamAuthenticationForm();
                    }
                }
            });
        } catch (e) {
            iomy.common.showError(e.message, "Error",
                function () {
//                    oController.ToggleStreamDataFields(true);
//                    oController.ToggleOnvifStreamAuthenticationForm();
                }
            );
        }
    },
    
	/**
     * Wrapper function for the PTZ Move command in the iomy.devices.onvif
     * library to send the desired number of steps vertically and horizontally
     * to the function.
     * 
     * Examples:
     * 
     * * PTZMove(-4,2)      4 steps left and 2 steps up
     * * PTZMove(2,2)       2 steps right and 2 steps up
     * * PTZMove(0,-5)      5 steps down
     * 
     * @param {type} iPosX      Steps to move horizontally
     * @param {type} iPosY      Steps to move vertically
     */
    PTZMove : function (iPosX, iPosY) {
        var oController = this;
        
        // Lock all the PTZ buttons
        oController.setPTZButtonsEnabled(false);
        
        try {
            iomy.devices.onvif.PTZMove({
                thingID : oController.oThing.Id,
                profileName : oController.sThumbnailProfileName,
                xpos : iPosX,
                ypos : iPosY,

                onSuccess : function (response) {
                    jQuery.sap.log.debug(JSON.stringify(response));
                    if( oController.sMode==="Thumbnail" ) {
                        oController.loadThumbnail();
                    }

                },

                onFail : function (sErrMesg) {
                    jQuery.sap.log.error(sErrMesg);
                    iomy.common.showError(sErrMesg, "Error",
                        function () {
                            // Unlock all the PTZ buttons
                            if( oController.sMode==="Thumbnail" ) {
                                oController.setPTZButtonsEnabled(true);
                            }
                        }
                    );
                }
            });
        } catch (e) {
            $.sap.log.error("Failed to run a PTZ move command ("+e.name+"): " + e.message);
        }
    },
    
    PTZMoveUp : function () {
        var oController = this;
        
        oController.PTZMove(0, 5);
    },
    
    PTZMoveDown : function () {
        var oController = this;
        
        oController.PTZMove(0, -5);
    },
    
    PTZMoveLeft : function () {
        var oController = this;
        
        oController.PTZMove(-5, 0);
    },
    
    PTZMoveRight : function () {
        var oController = this;
        
        oController.PTZMove(5, 0);
    },
    
    //---------------------------------------------------//
    // Thumbnail Load
    //---------------------------------------------------//
    dateThumbnailUpdate : null,
    
    updateThumnailTimestamp : function () {
        var oController = this;
        var oView       = this.getView();
        
        oController.dateThumbnailUpdate = new Date();
        oView.wSnapshotTimeField.setText(iomy.functions.getTimestampString(oController.dateThumbnailUpdate));
    },
    
    /**
     * Loads a thumbnail from the current Onvif camera. Repeats every 5 minutes.
     */
    loadThumbnail : function() {
        var oController = this;
        var oView       = this.getView();
        
        oView.wSnapshotTimeField.setText("Loading...");
        
        //---------------------------------------------------//
        // Check that it can find the device before it does anything
        //---------------------------------------------------//
        try {
            iomy.devices.onvif.LookupProfiles({ 
                linkID : oController.oThing.LinkId,

                // Function if Lookup is successful (Onvif server is attached)
                onSuccess : function () {
                    var sThumbnailUrl = iomy.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+oController.oThing.Id;

                    // Set the CSS rule using the API URL with parameters
                    document.getElementById(oController.createId("CameraThumbnail")).style = "background-image: url("+sThumbnailUrl+")";

                    // Update the JS time stamp
                    oController.updateThumnailTimestamp();

                    // Clear the old timeout instance to avoid a race condition when either
                    // accessing the page multiple times with the same or a different
                    // device.
                    if (oController.oTimeoutThumbnailRefresh !== null) {
                        clearTimeout(oController.oTimeoutThumbnailRefresh);
                        oController.oTimeoutThumbnailRefresh = null;
                    }

                    // Create the new timeout to call this function again after 5 minutes
                    // (300 seconds).
                    if (oController.oTimeoutThumbnailRefresh === null) {
                        oController.oTimeoutThumbnailRefresh = setTimeout(function() {
                            oController.loadThumbnail();
                        }, 300000);
                    }
                    // Unlock all the PTZ buttons
                    oController.setPTZButtonsEnabled(true);
                },

                // Function if Lookup fails (Onvif server not found)
                onFail : function (response) {
                    jQuery.sap.log.error("Error checking for the Onvif device (onFail): "+iomy.devices.onvif.sProfileLookupErrors);
                    oView.wSnapshotTimeField.setText("Failed to load the latest snapshot");

                    // If there is an error, the page is to be redrawn when the user
                    // goes back to the same device.
                    oController.bUIDrawn = false;
                }
            });
        } catch (e) {
            $.sap.log.error("Failed to refresh the model ("+e.name+"): " + e.message);
        }
    },
    
    //---------------------------------------------------//
    //-- Sets the FFMPEG Player up                     --//
    //---------------------------------------------------//
    loadFFMPEGPlayer : function() {
        var oController = this;
        var oView       = this.getView();
        
        var sFrameUrl = "<iframe height='300px' width='700' scrolling='no' frameborder='0' src='resources/video/streamplayer.php?StreamId="+oController.oThing.Id+"'></iframe>";
        
        try {
			iomy.apiphp.AjaxRequest({
				url: iomy.apiphp.APILocation("onvifthumbnail"),
				type: "POST",
				data: { 
					"Mode":    "SetupStream", 
					"ThingId": oController.oThing.Id
				},
				onSuccess : function( sExpectedDataType, aAjaxData ) {
				
					var oPlayerFrame = oView.byId("PlayerFrame");
					if( oPlayerFrame!==undefined && oPlayerFrame!==null && oPlayerFrame!==false ) {
						//-- Set the Player Up --//
						oPlayerFrame.setContent( sFrameUrl );
					}
				},
				onFail : function(response) {
					//-- TODO: Fix error message --//
					iomy.common.showError(response.message, "Error Changing Device Status");
				},
			});
            
        } catch( e001 ) {
            //-- TODO: Error Message --//
            $.sap.log.error("Failed to setup the stream ("+e001.name+"): " + e001.message);
        }
        
        
        
    },
    
    //---------------------------------------------------//
    // Profile Load
    //---------------------------------------------------//
    
    loadProfile : function() {
        var oController         = this;
        var oView               = this.getView();
        var aNameWhereClause    = [];
        var sNameWhereClause    = "";
        var aUrlWhereClause     = [];
        var sUrlWhereClause     = "";
        var bCollectingName     = true;
        
        try {
            // Prepare the filter statements for both OData requests
            $.each(oController.oThing.IO, function(sI,mIO) {

                if (sI !== null && sI !== undefined && mIO !== null && mIO !== undefined) {
                    if (bCollectingName) {
                        aNameWhereClause.push("IO_PK eq "+mIO.Id);
                        // Switch the collecting name status
                        bCollectingName = !bCollectingName;
                    } else {
                        aUrlWhereClause.push("IO_PK eq "+mIO.Id);
                        bCollectingName = !bCollectingName;
                    }
                }

            });

            sNameWhereClause = aNameWhereClause.join(" or ");
            sUrlWhereClause = aUrlWhereClause.join(" or ");



            // Start loading the profile names
            iomy.apiodata.AjaxRequest({
                Url             : iomy.apiodata.ODataLocation("datashortstring"),
                Columns         : ["DATASHORTSTRING_VALUE"],
                WhereClause     : [sNameWhereClause],
                OrderByClause   : [],

                onSuccess : function (type, data) {

                    if (data.length > 0) {
                        oController.sStreamProfileName       = data[0].DATASHORTSTRING_VALUE;
                        oController.sThumbnailProfileName    = data[1].DATASHORTSTRING_VALUE;
                    }

                    // Then start loading the profile URLs
                    iomy.apiodata.AjaxRequest({
                        Url             : iomy.apiodata.ODataLocation("datamedstring"),
                        Columns         : ["DATAMEDSTRING_VALUE"],
                        WhereClause     : [sUrlWhereClause],
                        OrderByClause   : [],

                        onSuccess : function (type, data) {
                            var oRoomInfo       = iomy.common.RoomsList["_"+oController.oThing.PremiseId]["_"+oController.oThing.RoomId];
                            var sThumbnailUrl   = iomy.apiphp.APILocation("onvifthumbnail")+"?Mode=OpenThingThumbnail&ThingId="+oController.oThing.Id;

                            if (data.length > 0) {
                                oController.sStreamProfileUrl        = data[0].DATAMEDSTRING_VALUE;
                                oController.sThumbnailProfileUrl     = data[1].DATAMEDSTRING_VALUE;
                            }

                            // Display the location of the camera.
                            oView.wLocationField.setText(oRoomInfo.RoomName + " in " + oRoomInfo.PremiseName);


                            if( oController.sMode==="Player" ) {
                                //----------------------------------------//
                                //-- IF FFMPEG PLAYER MODE              --//
                                //----------------------------------------//
                                oController.loadFFMPEGPlayer();

                            } else {
                                //----------------------------------------//
                                //-- IF THUMBNAIL MODE                  --//
                                //----------------------------------------//

                                // Set the CSS rule using the API URL with parameters
                                document.getElementById(oController.createId("CameraThumbnail")).style = "background-image: url("+sThumbnailUrl+")";

                                oController.loadThumbnail();

                            }



                        },
                        onFail : function (response) {
                            jQuery.sap.log.error("Error loading the profile URLs: "+JSON.stringify(response));
                            iomy.common.showError("Error loading the profile URLs");
                        }
                    });
                },

                onFail : function (response) {
                    jQuery.sap.log.error("Error loading the profile names: "+JSON.stringify(response));
                    iomy.common.showError("Error loading the profile names");
                }
            });
        
        } catch (e) {
            $.sap.log.error("Failed to load the profiles ("+e.name+"): " + e.message);
        }
                
    }

});