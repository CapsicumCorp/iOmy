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

sap.ui.controller("pages.staging.device.OnvifCamera", {
	bUIDrawn : false,
    
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
    mLinkConnInfo : null,
    
    iID : null,
    UTSLastUpdate : null,
    sDeviceNetworkAddress : null,
    iDeviceOnvifPort : null,
    sOnvifUsername : null,
    sOnvifPassword : null,
    sStreamProfileName : null,
    sStreamProfileUrl : null,
    sThumbnailProfileName : null,
    sThumbnailProfileUrl : null,
    
    oTimeoutThumbnailRefresh : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.staging.device.OnvifCamera
*/
	onInit: function() {
		var oController = this;
		var oView = oController.getView();
        
        // Import the device label functions
        //var LabelFunctions = IomyRe.functions.DeviceLabels;
		
		oView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
                
                // Import the given Thing
                oController.oThing = IomyRe.common.ThingList['_'+evt.data.ThingId];

                oController.loadLinkConn(oController.oThing.LinkId);
                oController.displayRoomLocation();
                
                oView.wSnapshotTimeField.setText("Loading...");
                
                //console.log(oController.oThing);
                //console.log(oController.oThing.DisplayName.toUpperCase());
                // Add the subheading title widget to the list of labels that display the Thing name.
//                LabelFunctions.addThingLabelWidget(oController.oThing.Id,
//                    {
//                        widgetID : oController.createId("NavSubHead_Title"),
//                        uppercase : true
//                    }
//                );
                
                // Boolean for determining if a different camera to the previous
                // one is accessed.
//                var bNowForDifferentCamera = oController.iID !== evt.data.ThingId;
//                var bUpdated = oController.UTSLastUpdate !== IomyRe.common.ThingList["_"+evt.data.ThingId].UILastUpdate;
//                
//                // Decide whether the page needs to be reloaded.
//                if (bNowForDifferentCamera || bUpdated ) {
//                    oController.bUIDrawn = false;
//                }
//                
//                if (!oController.bUIDrawn) {
//                    // Store the ID and the last update timestamp.
//                    oController.iID = oController.oThing.Id;
//                    oController.UTSLastUpdate = oController.oThing.UILastUpdate;
//
//                    // Wipe out the old instance of the UI and redraw the page.
//                    oController.DestroyUI();
//                    oController.DrawUI();
//                }

                oController.loadProfile();
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.staging.device.OnvifCamera
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.staging.device.OnvifCamera
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.staging.device.OnvifCamera
*/
//	onExit: function() {
//
//	}

    displayRoomLocation : function () {
        var oController = this;
        var oView       = this;
    },
    
    loadLinkConn : function (iLinkId) {
        this.mLinkConnInfo = IomyRe.functions.getLinkConnInfo(iLinkId);
        this.sDeviceNetworkAddress = this.mLinkConnInfo.LinkConnAddress;
        this.iDeviceOnvifPort = this.mLinkConnInfo.LinkConnPort;
        this.sOnvifUsername = this.mLinkConnInfo.LinkConnUsername;
        this.sOnvifPassword = this.mLinkConnInfo.LinkConnPassword;
    },
    
    //---------------------------------------------------//
    // PTZ Functionality
    //---------------------------------------------------//
    bHasPTZ : true,
    bPTZButtonsEnabled : false,
    
    setPTZButtonsEnabled : function(bStatus) {
        var oController = this;
        var oView       = this.getView();
        
        // If the camera has NO PTZ capability, this command is useless, so
        // terminate the function.
        if (oController.bHasPTZ === false) {
            return;
        }
        
        // Default behaviour is to enable the PTZ controls.
        if (bStatus === undefined) {
            bStatus = true;
        }
        
        oController.bPTZButtonsEnabled = bStatus;
        
        oView.wBtnMoveUp.setEnabled(bStatus);
        oView.wBtnMoveDown.setEnabled(bStatus);
        oView.wBtnMoveLeft.setEnabled(bStatus);
        oView.wBtnMoveRight.setEnabled(bStatus);
    },
    
	/**
     * Wrapper function for the PTZ Move command in the IomyRe.devices.onvif
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
        
        IomyRe.devices.onvif.PTZMove({
            thingID : oController.oThing.Id,
            profileName : oController.sThumbnailProfileName,
            xpos : iPosX,
            ypos : iPosY,
            
            onSuccess : function (response) {
                jQuery.sap.log.debug(JSON.stringify(response));
                oController.loadThumbnail();
            },

            onFail : function (sErrMesg) {
                jQuery.sap.log.error(sErrMesg);
                IomyRe.common.showError(sErrMesg, "Error",
                    function () {
                        // Unlock all the PTZ buttons
                        oController.setPTZButtonsEnabled(true);
                    }
                );
            }
        });
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
        oView.wSnapshotTimeField.setText(IomyRe.functions.getTimestampString(oController.dateThumbnailUpdate));
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
        IomyRe.devices.onvif.LookupProfiles({ 
            linkID : oController.oThing.LinkId,
            
            // Function if Lookup is successful (Onvif server is attached)
            onSuccess : function () {
                var sThumbnailUrl = IomyRe.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+oController.oThing.Id;

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
                jQuery.sap.log.error("Error checking for the Onvif device (onFail): "+IomyRe.devices.onvif.sProfileLookupErrors);
                oView.wSnapshotTimeField.setText("Failed to load the latest snapshot");
                
                // If there is an error, the page is to be redrawn when the user
                // goes back to the same device.
                oController.bUIDrawn = false;
            }
        });
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
        
        // Prepare the filter statements for both OData requests
        $.each(oController.oThing.IO, function(sI,mIO) {
            
            if (sI !== null && sI !== undefined && mIO !== null && mIO !== undefined) {
                if (bCollectingName) {
                    aNameWhereClause.push("IO_PK eq "+mIO.Id);
                    // Switch the collecting name status
                    bCollectingName = !bCollectingName;
                } else {
                    aUrlWhereClause.push("IO_PK eq "+mIO.Id)
                    bCollectingName = !bCollectingName;
                }
            }
            
        });
        
        sNameWhereClause = aNameWhereClause.join(" or ");
        sUrlWhereClause = aUrlWhereClause.join(" or ");
        
        // Start loading the profile names
        IomyRe.apiodata.AjaxRequest({
            Url             : IomyRe.apiodata.ODataLocation("datashortstring"),
            Columns         : ["DATASHORTSTRING_VALUE"],
            WhereClause     : [sNameWhereClause],
            OrderByClause   : [],
            
            onSuccess : function (type, data) {
                
                if (data.length > 0) {
                    oController.sStreamProfileName       = data[0].DATASHORTSTRING_VALUE;
                    oController.sThumbnailProfileName    = data[1].DATASHORTSTRING_VALUE;
                }
                
                // Then start loading the profile URLs
                IomyRe.apiodata.AjaxRequest({
                    Url             : IomyRe.apiodata.ODataLocation("datamedstring"),
                    Columns         : ["DATAMEDSTRING_VALUE"],
                    WhereClause     : [sUrlWhereClause],
                    OrderByClause   : [],

                    onSuccess : function (type, data) {
                        var oRoomInfo       = IomyRe.common.RoomsList["_"+oController.oThing.PremiseId]["_"+oController.oThing.RoomId];
                        var sThumbnailUrl   = IomyRe.apiphp.APILocation("onvifthumbnail")+"?Mode=OpenThingThumbnail&ThingId="+oController.oThing.Id;
        
                        
                        if (data.length > 0) {
                            oController.sStreamProfileUrl        = data[0].DATAMEDSTRING_VALUE;
                            oController.sThumbnailProfileUrl     = data[1].DATAMEDSTRING_VALUE;
                        }
                        
                        // Display the location of the camera.
                        oView.wLocationField.setText(oRoomInfo.RoomName + " in " + oRoomInfo.PremiseName);
                    
                        // Set the CSS rule using the API URL with parameters
                        document.getElementById(oController.createId("CameraThumbnail")).style = "background-image: url("+sThumbnailUrl+")";

                        oController.loadThumbnail();
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading the profile URLs: "+JSON.stringify(response));
                        IomyRe.common.showError("Error loading the profile URLs");
                    }
                });
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error loading the profile names: "+JSON.stringify(response));
                IomyRe.common.showError("Error loading the profile names");
            }
        });
        
                
    }

});