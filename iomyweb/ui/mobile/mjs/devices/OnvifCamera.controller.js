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

sap.ui.controller("mjs.devices.OnvifCamera", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
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
* @memberOf mjs.devices.OnvifCamera
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
        
        // Import the device label functions
        var LabelFunctions = IOMy.functions.DeviceLabels;
		
		thisView.addEventDelegate({
			// Everything is rendered in this function before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
                
                // Import the given Thing
                me.oThing = IOMy.common.ThingList['_'+evt.data.ThingId];

                me.loadLinkConn(me.oThing.LinkId);
                //console.log(me.oThing);
                //console.log(me.oThing.DisplayName.toUpperCase());
                // Add the subheading title widget to the list of labels that display the Thing name.
//                LabelFunctions.addThingLabelWidget(me.oThing.Id,
//                    {
//                        widgetID : me.createId("NavSubHead_Title"),
//                        uppercase : true
//                    }
//                );
                
                // Boolean for determining if a different camera to the previous
                // one is accessed.
                var bNowForDifferentCamera = me.iID !== evt.data.ThingId;
                var bUpdated = me.UTSLastUpdate !== IOMy.common.ThingList["_"+evt.data.ThingId].UILastUpdate;
                
                // Decide whether the page needs to be reloaded.
                if (bNowForDifferentCamera || bUpdated ) {
                    me.bUIDrawn = false;
                }
                
                if (!me.bUIDrawn) {
                    // Store the ID and the last update timestamp.
                    me.iID = me.oThing.Id;
                    me.UTSLastUpdate = me.oThing.UILastUpdate;

                    // Wipe out the old instance of the UI and redraw the page.
                    me.DestroyUI();
                    me.DrawUI();
                }
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.OnvifCamera
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.OnvifCamera
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.OnvifCamera
*/
//	onExit: function() {
//
//	}

    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        var sCurrentID  = "";
        
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            sCurrentID = me.aElementsToDestroy[i];
            if (me.byId(sCurrentID) !== undefined) {
                me.byId(sCurrentID).destroy();
            }
        }
        
        if (me.wCameraFeed !== null) {
            me.wCameraFeed.destroy();
        }
        
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    DrawUI : function () {
        var me = this;
        var thisView = me.getView();
        var oRoomInfo = IOMy.common.RoomsList["_"+me.oThing.PremiseId]["_"+me.oThing.RoomId];
        
        // Create the title on the page.
        me.byId("NavSubHead_Title").setText(me.oThing.DisplayName.toUpperCase());
                

        //==============================================//
        // Create PTZ Controls
        //==============================================//

        //-----------------//
        // Up
        //-----------------//
        me.wBtnMoveUp = new sap.m.Button({
            tooltip: "PTZ Up",
            icon : "sap-icon://slim-arrow-up",
            enabled : me.bPTZButtonsEnabled,
            press : function () {
                me.PTZMoveUp();
            }
        }).addStyleClass("width100Percent height30px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Left
        //-----------------//
        me.wBtnMoveLeft = new sap.m.Button({
            tooltip: "PTZ Left",
            icon : "sap-icon://slim-arrow-left",
            enabled : me.bPTZButtonsEnabled,
            press : function () {
                me.PTZMoveLeft();
            }
        }).addStyleClass("width30px height240px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Right
        //-----------------//
        me.wBtnMoveRight = new sap.m.Button({
            tooltip: "PTZ Right",
            icon : "sap-icon://slim-arrow-right",
            enabled : me.bPTZButtonsEnabled,
            press : function () {
                me.PTZMoveRight();
            }
        }).addStyleClass("width30px height240px IOMYButton ButtonIconWhite CameraPTZButton");

        //-----------------//
        // Down
        //-----------------//
        me.wBtnMoveDown = new sap.m.Button({
            tooltip: "PTZ Down",
            icon : "sap-icon://slim-arrow-down",
            enabled : me.bPTZButtonsEnabled,
            press : function () {
                me.PTZMoveDown();
            }
        }).addStyleClass("width100Percent height30px IOMYButton ButtonIconWhite CameraPTZButton")
        //==============================================\\
        // DRAW CAMERA FEED                             \\
        //==============================================\\
        
        me.wCameraFeed = new sap.m.VBox(me.createId("CameraThumbnail"), {
            items : [
                // UP BUTTON
                me.wBtnMoveUp,

                // MIDDLE SECTION
                new sap.m.HBox({
                    items : [
                        // LEFT BUTTON
                        me.wBtnMoveLeft,

                        // CENTER AREA
                        new sap.m.VBox({}).addStyleClass("width100Percent heightAuto"),

                        // RIGHT BUTTON
                        me.wBtnMoveRight
                    ]
                }).addStyleClass("width100Percent"),

                // DOWN ARROW
                me.wBtnMoveDown
            ]
        }).addStyleClass("width100Percent height300px BG_grey_10 CameraThumbnail");

        //==============================================\\
        // DRAW DATE, TIME, AND ROOM                    \\
        //==============================================\\
        me.wLocationField = new sap.m.Label({
            text : oRoomInfo.RoomName + " in " + oRoomInfo.PremiseName
        });
        
        me.wSnapshotTimeField = new sap.m.Label({});
        
//        me.aElementsToDestroy.push("CameraInfoBox");
//        me.aElementsToDestroy.push("SnapshotField");
        var oInfoBox = new sap.m.VBox({
            items : [
                //------------------------------------------------------------------//
                // Camera Location
                //------------------------------------------------------------------//
                new sap.m.HBox({
                    items :[
                        new sap.m.Label({
                            text : "Location:"
                        }).addStyleClass("width120px"),

                        me.wLocationField
                    ]
                }),
                //------------------------------------------------------------------//
                // Time and Date
                //------------------------------------------------------------------//
                new sap.m.HBox({
                    items :[
                        new sap.m.Label({
                            text : "Snapshot Taken:"
                        }).addStyleClass("width120px"),

                        me.wSnapshotTimeField
                    ]
                })
            ]
        });

        var oVertBox = new sap.m.VBox({
            items : [ me.wCameraFeed, oInfoBox ]
        });

        me.wPanel = new sap.m.Panel({
            content: [oVertBox]
        }).addStyleClass("PanelNoPadding height100Percent UserInputForm")

        thisView.byId("page").addContent(me.wPanel);

        //----------------------------------------------------------------------------//
        //-- REDO THE ACTION MENU                                                   --//
        //----------------------------------------------------------------------------//
        try {
            thisView.byId("extrasMenuHolder").destroyItems();
            thisView.byId("extrasMenuHolder").addItem(
                IOMy.widgets.getActionMenu({
                    id : me.createId("extrasMenu"+me.oThing.Id),        // Uses the page ID
                    icon : "sap-icon://GoogleMaterial/more_vert",
                    items : [
                        {
                            text: "Edit Stream Information",
                            select:	function (oControlEvent) {
                                IOMy.common.NavigationChangePage( "pSettingsEditThing", {device : me.oThing}, false );
                            }
                        }
                    ]
                })
            );
        } catch (e) {
            jQuery.sap.log.error("Error redrawing the extras menu: "+e.message);
        }

        // Set the drawn flag so that it will always be loaded.
        me.bUIDrawn = true;

        //----------------------------------------------------------------------------//
        //-- LOAD THE PROFILE NAMES AND URLS                                        --//
        //----------------------------------------------------------------------------//
        me.loadProfile();
    },
    
    loadLinkConn : function (iLinkId) {
        this.mLinkConnInfo = IOMy.functions.getLinkConnInfo(iLinkId);
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
        var me = this;
        
        // If the camera has NO PTZ capability, this command is useless, so
        // terminate the function.
        if (me.bHasPTZ === false) {
            return;
        }
        
        // Default behaviour is to enable the PTZ controls.
        if (bStatus === undefined) {
            bStatus = true;
        }
        
        me.bPTZButtonsEnabled = bStatus;
        
        me.wBtnMoveUp.setEnabled(bStatus);
        me.wBtnMoveDown.setEnabled(bStatus);
        me.wBtnMoveLeft.setEnabled(bStatus);
        me.wBtnMoveRight.setEnabled(bStatus);
    },
    
    PTZMove : function (iPosX, iPosY) {
        var me = this;
        
        // Lock all the PTZ buttons
        me.setPTZButtonsEnabled(false);

        try {
            IOMy.apiphp.AjaxRequest({
                url : IOMy.apiphp.APILocation("onvif"),
                data : { Mode : "PTZTimedMove",
                         ProfileName : me.sThumbnailProfileName,
                         PosX : iPosX, PosY : iPosY, ThingId : me.iID},

                onSuccess : function (response) {
                    jQuery.sap.log.debug(JSON.stringify(response));
                    me.loadThumbnail();
                },

                onFail : function (response) {
                    jQuery.sap.log.error(JSON.stringify(response));
                    // Unlock all the PTZ buttons
                    me.setPTZButtonsEnabled(true);
                }
            });

        } catch (ePTZError) {
            jQuery.sap.log.error(JSON.stringify(ePTZError.message));
            IOMy.common.showError(ePTZError.message);
            // Unlock all the PTZ buttons
            me.setPTZButtonsEnabled(true);
        }
    },
    
    PTZMoveUp : function () {
        var me = this;
        
        me.PTZMove(0, 1);
    },
    
    PTZMoveDown : function () {
        var me = this;
        
        me.PTZMove(0, -1);
    },
    
    PTZMoveLeft : function () {
        var me = this;
        
        me.PTZMove(-1, 0);
    },
    
    PTZMoveRight : function () {
        var me = this;
        
        me.PTZMove(1, 0);
    },
    
    //---------------------------------------------------//
    // Thumbnail Load
    //---------------------------------------------------//
    dateThumbnailUpdate : null,
    
    updateThumnailTimestamp : function () {
        var me = this;
        me.dateThumbnailUpdate = new Date();
        me.wSnapshotTimeField.setText(IOMy.functions.getTimestampString(me.dateThumbnailUpdate));
    },
    
    /**
     * Loads a thumbnail from the current Onvif camera. Repeats every 5 minutes.
     */
    loadThumbnail : function() {
        var me = this;
        var sAPIUrl = IOMy.apiphp.APILocation("onvif");
        //---------------------------------------------------//
        // Check that it can find the device before it does anything
        //---------------------------------------------------//
        IOMy.devices.onvif.LookupProfiles(me.oThing.LinkId, 
            // Function if Lookup is successful (Onvif server is attached)
            function () {
                var sThumbnailUrl = IOMy.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+me.iID;

                // Set the CSS rule using the API URL with parameters
                document.getElementById(me.createId("CameraThumbnail")).style = "background-image: url("+sThumbnailUrl+")";

                // Update the JS time stamp
                me.updateThumnailTimestamp();

                // Clear the old timeout instance to avoid a race condition when either
                // accessing the page multiple times with the same or a different
                // device.
                if (me.oTimeoutThumbnailRefresh !== null) {
                    clearTimeout(me.oTimeoutThumbnailRefresh);
                    me.oTimeoutThumbnailRefresh = null;
                }

                // Create the new timeout to call this function again after 5 minutes
                // (300 seconds).
                if (me.oTimeoutThumbnailRefresh === null) {
                    me.oTimeoutThumbnailRefresh = setTimeout(function() {
                        me.loadThumbnail();
                    }, 300000);
                }
                // Unlock all the PTZ buttons
                me.setPTZButtonsEnabled(true);
            },
            
            // Function if Lookup fails (Onvif server not found)
            function (response) {
                jQuery.sap.log.error("Error checking for the Onvif device (onFail): "+IOMy.devices.onvif.sProfileLookupErrors);
                me.wSnapshotTimeField.setText("Failed to load snapshot");
            }
        );
    },
    
    //---------------------------------------------------//
    // Profile Load
    //---------------------------------------------------//
    
    loadProfile : function() {
        var me = this;
        var aNameWhereClause = [];
        var sNameWhereClause = "";
        var aUrlWhereClause = [];
        var sUrlWhereClause = "";
        var bCollectingName = true;
        
        // Prepare the filter statements for both OData requests
        $.each(me.oThing.IO, function(sI,mIO) {
            
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
        
        //console.log(JSON.stringify(sNameWhereClause));
        //console.log(JSON.stringify(sUrlWhereClause));
        
        // Start loading the profile names
        IOMy.apiodata.AjaxRequest({
            Url             : IOMy.apiodata.ODataLocation("datashortstring"),
            Columns         : ["DATASHORTSTRING_VALUE"],
            WhereClause     : [sNameWhereClause],
            OrderByClause   : [],
            
            onSuccess : function (type, data) {
               //console.log(type);
                //console.log(JSON.stringify(data));
                
                if (data.length > 0) {
                    me.sStreamProfileName       = data[0].DATASHORTSTRING_VALUE;
                    me.sThumbnailProfileName    = data[1].DATASHORTSTRING_VALUE;
                }
                
                // Then start loading the profile URLs
                IOMy.apiodata.AjaxRequest({
                    Url             : IOMy.apiodata.ODataLocation("datamedstring"),
                    Columns         : ["DATAMEDSTRING_VALUE"],
                    WhereClause     : [sUrlWhereClause],
                    OrderByClause   : [],

                    onSuccess : function (type, data) {
                        if (data.length > 0) {
                            me.sStreamProfileUrl        = data[0].DATAMEDSTRING_VALUE;
                            me.sThumbnailProfileUrl     = data[1].DATAMEDSTRING_VALUE;
                        }
                        
                        var sThumbnailUrl = IOMy.apiphp.APILocation("onvifthumbnail")+"?Mode=OpenThingThumbnail&ThingId="+me.iID;
                    
                        // Set the CSS rule using the API URL with parameters
                        document.getElementById(me.createId("CameraThumbnail")).style = "background-image: url("+sThumbnailUrl+")";

                        me.loadThumbnail();
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading the profile URLs: "+JSON.stringify(response));
                        IOMy.common.showError("Error loading the profile URLs");
                    }
                });
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("Error loading the profile names: "+JSON.stringify(response));
                IOMy.common.showError("Error loading the profile names");
            }
        });
        
                
    },

});