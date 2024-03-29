/*
Title: Template UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
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

sap.ui.controller("pages.Device", {
    
    bEditing            : false,            //-- BOOLEAN:   Determine whether the list is for editing device information or act as a way to view device data.
    mPageData           : {},               //-- OBJECT:    Map containing data to parse to page.   --//
    sPageId             : {},               //-- STRING:    ID of the page that each entry should go to. Either "pDevice" or "pDeviceForm".         --//
    
    aaDeviceList : {},
    
    aAjaxTasks:{ 
        "Low": [],            //-- ARRAY:            Sub-array that is used to hold the list of slower ajax requests which can be left to last to be run.        --//
        "Mid": [],            //-- ARRAY:            Sub-array that is used to hold the list of mid range ajax requests which can be left to lrun in between the high and low tasks.        --//
        "High": []            //-- ARRAY:            Sub-array that is used to hold the list of quick ajax requests that can be run before the slower tasks.        --//
    }, //-- ARRAY:            Used to store the list of Ajax tasks to execute to update the page. --//
    
    iIOCount:                       0,          //-- INTEGER:       Counts the number of IOs detected. --//
    iIOErrorCount:                  0,          //-- INTEGER:       Counts the number of IOs that failed to load. --//
    aIOErrorMessages:               [],         //-- ARRAY:         An array for the error messages that are generated when an error occurs with one of the IOs. --//
    
    iCachingSeconds:                300,        //-- INTEGER:        The Time in seconds of how long to cache the Page before it needs refreshing. (Hugely decreases the Server workload)    --//
    dLastAjaxUpdate:                null,       //-- DATE:            Stores the last time the page had the Ajax values updated.            --//
    dLastDeviceUpdate:              null,       //-- DATE:            Stores the last time the page had the Ajax values updated.            --//
    iLastRoomId:                    null,       //-- INTEGER:        Stores the last RoomId.     --//
    iLastPremiseId:                 null,       //-- INTEGER:        Stores the last PremiseId.  --//
    aCurrentRoomData:               {},         //-- ARRAY:            Used to store the current room data            --//
    aElementsToDestroy:             [],         //-- ARRAY:            Stores a list of Ids of UI5 Objects to destroy on Page Redraw        --//
    
    bLoadCompleted:                 false,      //-- BOOLEAN:       Flag to indicate whether the device list has finished loading or not. --//
    
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        oView.addEventDelegate({
            onBeforeShow : function (evt) {
                oController.RefreshPage(evt.data);
            }
        });
            
        
    },
    
    RefreshPage : function (mData) {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
        
        oController.bLoadCompleted = false;
        
        //----------------------------------------------------//
        // Find the premise ID, if specified, and store it.
        //----------------------------------------------------//
        if (mData.PremiseId !== undefined && mData.PremiseId !== null) {
            oController.iLastPremiseId = mData.PremiseId;

        } else {
            oController.iLastPremiseId = null;
        }

        //----------------------------------------------------//
        // Find the room ID, if specified, and store it.
        //----------------------------------------------------//
        if (mData.RoomId !== undefined && mData.RoomId !== null) {
            oController.iLastRoomId = mData.RoomId;
            
        } else {
            oController.iLastRoomId = null;
        }

        if (oController.iLastPremiseId === null && oController.iLastRoomId === null) {
            oView.byId("ToolbarTitle").setText("Devices");

        } else if (oController.iLastPremiseId !== null && oController.iLastRoomId !== null) {
            // If both the Premise ID and Room ID are given, use the room ID.
            oView.byId("ToolbarTitle").setText("Devices in " + iomy.functions.getRoom( oController.iLastRoomId ).RoomName);

        } else {
            if (oController.iLastPremiseId !== null) {
                oView.byId("ToolbarTitle").setText("Devices in " + iomy.common.PremiseList["_"+oController.iLastPremiseId].Name);

            } else if (oController.iLastRoomId !== null) {
                oView.byId("ToolbarTitle").setText("Devices in " + iomy.functions.getRoom( oController.iLastRoomId ).RoomName);

            }
        }

        if (mData.bEditing !== undefined && mData.bEditing !== null) {
            oController.bEditing = mData.bEditing;
        } else {
            oController.bEditing = false;
        }

        oController.IndicateWhetherInEditModeOrNot();

        //-- Defines the Device Type --//
        iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);

        oController.aAjaxTasks = { 
            "Low": [],
            "Mid": [],
            "High": []
        };
        
        oController.RefreshModel();

        oController.InitialiseDeviceList();
    },
    
    /**
     * Changes the title of the page to indicate whether the list is to be used
     * for accessing or editing devices.
     */
    IndicateWhetherInEditModeOrNot : function () {
        var oController = this;
        var oView       = this.getView();
        var sTitle      = oView.byId("ToolbarTitle").getText();
        
        //-- Remove the "Edit " prefix --//
        if (sTitle.indexOf("Edit ") === 0) {
            sTitle = sTitle.replace("Edit ", "");
            
            if (oController.iLastPremiseId === null && oController.iLastRoomId === null) {
                oView.byId("ToolbarTitle").setText("Devices");
            } else {
                oView.byId("ToolbarTitle").setText(sTitle);
            }
        }
        
        //-- If we're editing add the prefix "Edit ". --//
        if (oController.bEditing) {
            oView.byId("ToolbarTitle").setText( "Edit " + sTitle );
        }
    },
    
    ClearFilters : function () {
        this.iLastRoomId    = null;
        this.iLastPremiseId = null;
    },
    
    RefreshModel : function () {
        var oController = this;
        var oView       = this.getView();
        var oJSON       = {};
        var oModel      = null;
        
        if (oController.bEditing) {
            oJSON.CameraTapInstructions = "Tap to edit details";
            oJSON.MotionSensorInstructions = "Tap to edit details";
        } else {
            oJSON.CameraTapInstructions = "Tap to view stream";
            oJSON.MotionSensorInstructions = "Tap to view more information";
        }
        
        oModel = new sap.ui.model.json.JSONModel(oJSON);
        
        oView.setModel(oModel);
    },
    
    InitialiseDeviceList : function () {
        var oController         = this;
        var oView               = this.getView();
        var mRefreshSettings    = {};
        
        try {
            //----------------------------------------------------------------//
            // Apply the settings for refreshing the core variables.
            //----------------------------------------------------------------//
            mRefreshSettings = {
                onSuccess : function () {
                    if (oController.bLoadCompleted !== true) {
                        oController.BuildDeviceListUI();
                        oController.RefreshAjaxDataForUI();
                    }
                }
            };
            
            oView.byId("DeviceList").destroyItems();
            oView.byId("DeviceList").addItem(
                new sap.m.ObjectListItem (oView.createId("loading"), {        
                    title: "Loading Devices...",
                    type: "Active",
                    attributes : []
                })
            );

            oController.RefreshDeviceVariables(mRefreshSettings);
        } catch (e) {
            $.sap.log.error("Failed to launch the device list loading ("+e.name+"): " + e.message);
        }
    },
    
    RefreshDeviceVariables : function (aConfig) {
        var oController = this;
        
        try {
            //------------------------------------------------------------------//
            //-- IF The Core variables aren't already in currently refreshing --//
            //------------------------------------------------------------------//
            if( iomy.common.bCoreRefreshInProgress===false ) {

                //-- Flag that the CoreVariables are refreshing --//
                iomy.common.bCoreRefreshInProgress = true;

                //-- Remove the Restart flag --//
                iomy.common.bCoreVariablesRestart = false;

                //----------------------------------------//
                //-- PART 1: REFRESH LINK LIST          --//
                //----------------------------------------//
                iomy.common.RetrieveLinkList({
                    onSuccess: $.proxy( function() {

                        //----------------------------------------//
                        //-- PART 2: REFRESH THING LIST         --//
                        //----------------------------------------//
                        iomy.common.RefreshThingList({
                            onSuccess: $.proxy( function() {

                                //-------------------------------------------------------//
                                //-- Flag that the Core Variables have been configured --//
                                //-------------------------------------------------------//
                                iomy.common.CoreVariablesInitialised = true;


                                //-------------------------------------------------------//
                                //-- Perform the onSuccess event                       --//
                                //-------------------------------------------------------//
                                try {
                                    //-- Update when the last core variables occurred --//
                                    var oTemp = new Date();
                                    iomy.common.iCoreVariablesLastRefresh = oTemp.getTime();

                                    //------------------------------------------------------------//
                                    //-- Trigger the normal "onSuccess" event                   --//
                                    //------------------------------------------------------------//
                                    if( aConfig.onSuccess ) {
                                        try {
                                            aConfig.onSuccess();
                                        } catch( e00a ) {
                                            jQuery.sap.log.error("Critical Error: Problem when triggering the onSuccess event for the RefreshCoreVariables function.\n"+e00a.message);
                                        }
                                    }

                                    //------------------------------------------------------------//
                                    //-- Run all the on Success events in the current config    --//
                                    //------------------------------------------------------------//
                                    if( iomy.common.aCoreVariablesResConfig.length >= 1 ) {
                                        $.each( iomy.common.aCoreVariablesResConfig, function ( iIndex, aTempConfig ) {
                                            //-- Trigger any onSuccess events --//
                                            if( aTempConfig.onSuccess ) {
                                                try {
                                                    aTempConfig.onSuccess();
                                                } catch( e00b ) {
                                                    jQuery.sap.log.error("Critical Error: Problem when triggering the one of multiple onSuccess events for the RefreshCoreVariables function.\n"+e00b.message);
                                                }
                                            }
                                        });

                                        //-- Reset the array so this can't be accidentally triggered --//
                                        iomy.common.aCoreVariablesResConfig = [];
                                    }

                                    //------------------------------------------------------------//
                                    //-- If the Core Variables needs to restart on completion   --// 
                                    if( iomy.common.bCoreVariablesRestart===false ) {
                                        //-- Turn off the "RefreshInProgress" state as the refresh has finished --//
                                        iomy.common.bCoreRefreshInProgress = false;

                                    } else {
                                        //-- Replace the Current Config with the next --//
                                        iomy.common.aCoreVariablesResConfig = iomy.common.aCoreVariablesResNextConfig;
                                        iomy.common.aCoreVariablesResNextConfig = [];

                                        //-- Start the next refresh Core Variables --//
                                        iomy.common.bCoreRefreshInProgress = false;
                                        iomy.common.RefreshCoreVariables({});
                                    }

                                } catch( e00 ) {
                                    jQuery.sap.log.error("Critical Error: Problem when doing the final processing in the RefreshCoreVariables function.\n"+e00.message);
                                }

                            }, oController),
                            onFail: $.proxy( function() {
                                iomy.common.bCoreRefreshInProgress = false;
                                jQuery.sap.log.error("Error: Failed to update the ThingList for the RefreshCoreVariables function.");

                            }, oController)
                        }); //-- END PART 2 ( THING LIST ) --//

                    }, oController),
                    onFail: $.proxy(function() {
                        iomy.common.bCoreRefreshInProgress = false;
                        jQuery.sap.log.error("Error: Failed to update the LinkList for the RefreshCoreVariables function.");

                    }, oController)
                }); //-- END PART 1 ( LINK LIST ) --//
            }
        } catch (e) {
            $.sap.log.error("Error attempting to reload the device variables ("+e.name+"): " + e.message);
        }
    },
    
    BuildDeviceListUI : function () {
        var oController     = this;
        var oView           = this.getView();
        var wList           = oView.byId("DeviceList");
        var bHasDevices     = false;
//        var bEditing        = oController.bEditing;
        var sPageId         = "";
        
        try {
            // Wipe the loading entry.
            wList.destroyItems();

            // Fetch the list from the core variables.
            oController.aaDeviceList = iomy.functions.createDeviceListData({
                filter : {
                    roomID : oController.iLastRoomId,
                    premiseID : oController.iLastPremiseId
                }
            });

            //--------------------------------------------------------------------//
            // Construct the Device List
            //--------------------------------------------------------------------//
            $.each(oController.aaDeviceList, function (sI, mTypeBlock) {

                bHasDevices = true;

                //----------------------------------------------------------------//
                // Create the Group Header
                //----------------------------------------------------------------//
                wList.addItem(
                    new sap.m.GroupHeaderListItem ({
                        title: mTypeBlock.Name
                    })
                );

                //----------------------------------------------------------------//
                // Create the items under that grouping
                //----------------------------------------------------------------//
                $.each(mTypeBlock.Devices, function (sJ, mDevice) {
                    //var iState = iomy.common.ThingList["_"+mDevice.DeviceId];

                    switch (mDevice.DeviceTypeId) {
                        //--------------------------------------------------------//
                        // Zigbee Smart Plug UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.zigbeesmartplug.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "Loading...",
                                    numberUnit: "",
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "link",
                                            customContent : new sap.m.Link ({
                                                text: "Toggle State",
                                                enabled : iomy.functions.permissions.isCurrentUserAbleToEditDevice(mDevice.DeviceId),
                                                press : function () {
                                                    oController.RunSwitch({
                                                        "thingID" : mDevice.DeviceId,
                                                        "switchWidget" : this,
                                                        "statusAttribute" : oView.byId("deviceStatus"+mDevice.DeviceId)
                                                    });
                                                }
                                            })
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceStatus"+mDevice.DeviceId), {
                                            text: "Status: " + (mDevice.DeviceStatus == 1 ? "On" : "Off")
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceSerial"+mDevice.DeviceId), {
                                            text: "Serial: " + iomy.devices.getSerialCodeOfDevice(mDevice.DeviceId)
                                        })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pTile";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );
                            break;

                        //--------------------------------------------------------//
                        // Philips Hue UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.philipshue.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "Loading...",
                                    numberUnit: "Current Colour",
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "link",
                                            customContent : new sap.m.Link ({
                                                text: "Toggle State",
                                                enabled : iomy.functions.permissions.isCurrentUserAbleToEditDevice(mDevice.DeviceId),
                                                press : function () {
                                                    oController.RunSwitch({
                                                        "thingID" : mDevice.DeviceId,
                                                        "switchWidget" : this,
                                                        "statusAttribute" : oView.byId("deviceStatus"+mDevice.DeviceId)
                                                    });
                                                }
                                            })
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceStatus"+mDevice.DeviceId), {
                                            text: "Status: " + (mDevice.DeviceStatus == 1 ? "On" : "Off")
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceSerial"+mDevice.DeviceId), {
                                            text: "Serial: " + iomy.devices.getSerialCodeOfDevice(mDevice.DeviceId)
                                        })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pRGBlight";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // CSR Mesh Light
                        //--------------------------------------------------------//
                        case iomy.devices.csrmesh.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "Loading...",
                                    numberUnit: "Current Colour",
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "link",
                                            customContent : new sap.m.Link ({
                                                text: "Toggle State",
                                                enabled : iomy.functions.permissions.isCurrentUserAbleToEditDevice(mDevice.DeviceId),
                                                press : function () {
                                                    oController.RunSwitch({
                                                        "thingID" : mDevice.DeviceId,
                                                        "switchWidget" : this,
                                                        "statusAttribute" : oView.byId("deviceStatus"+mDevice.DeviceId)
                                                    });
                                                }
                                            })
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceStatus"+mDevice.DeviceId), {
                                            text: "Status: "+(mDevice.DeviceStatus == 1 ? "On" : "Off")
                                        })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pRGBlight";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // Onvif Stream UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.onvif.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "",
                                    numberUnit: "",//iomy.devices.getDeviceAddress(mDevice.DeviceId),
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "link",
                                            customContent : new sap.m.Link ({
                                                text: "View Thumbnail",
                                                press : function () {
                                                    iomy.common.NavigationChangePage( "pOnvifSnapshot" , { "ThingId": mDevice.DeviceId, "Mode":"Thumbnail" } , false);

                                                }
                                            })
                                        }),
                                        new sap.m.ObjectAttribute ({
                                            text: "{/CameraTapInstructions}"
                                        })
                                    ],

                                    press : function () {

                                        //----------------------------------------------------------//
                                        // If were looking to edit a device, open the form,
                                        // otherwise, open the stream popup.
                                        //----------------------------------------------------------//
                                        if (oController.bEditing) {
                                            iomy.common.NavigationChangePage( "pDeviceForm" , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);

                                        } else {
//                                            iomy.devices.onvif.loadStream(mDevice.DeviceId);
                                            iomy.common.NavigationChangePage( "pSecurityData" , { "CameraId" : mDevice.DeviceId } , false);
                                        }
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // IP Webcam Stream UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.ipcamera.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "",
                                    numberUnit: "",//iomy.devices.getDeviceAddress(mDevice.DeviceId),
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "{/CameraTapInstructions}"
                                        })
    //                                    new sap.m.ObjectAttribute ({
    //                                        text: "link",
    //                                        customContent : new sap.m.Link ({
    //                                            text: "Take Screenshot"
    //                                        })
    //                                    }),
    //                                    new sap.m.ObjectAttribute ({
    //                                        text: "link",
    //                                        customContent : new sap.m.Link ({
    //                                            text: "Record"
    //                                        })
    //                                    })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            iomy.common.NavigationChangePage( "pDeviceForm" , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                        } else {
                                            iomy.common.NavigationChangePage( "pSecurityData" , { "CameraId" : mDevice.DeviceId } , false);
                                        }
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // Weather Feed UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.weatherfeed.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "",
                                    numberUnit: "",
                                    attributes : [
                                        new sap.m.ObjectAttribute (oView.createId("humidity"+mDevice.DeviceId), {
                                            text: "Loading..."
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("outside"+mDevice.DeviceId), {
                                            text: ""
                                        })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pWeatherFeed";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // Motion Sensor UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.motionsensor.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "Last Motion",
                                    numberUnit: "Loading...",
                                    attributes : [
                                        new sap.m.ObjectAttribute ({
                                            text: "{/MotionSensorInstructions}"
                                        }),
                                        new sap.m.ObjectAttribute (oView.createId("deviceSerial"+mDevice.DeviceId), {
                                            text: "Serial: " + iomy.devices.getSerialCodeOfDevice(mDevice.DeviceId)
                                        })
    //                                    new sap.m.ObjectAttribute ({
    //                                        text: "link",
    //                                        customContent : new sap.m.Link ({
    //                                            text: "Enable Alarm"
    //                                        })
    //                                    }),
    //                                    new sap.m.ObjectAttribute ({
    //                                        text: "link",
    //                                        customContent : new sap.m.Link ({
    //                                            text: "Disable Alarm"
    //                                        })
    //                                    })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pMotionSensor";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // Temperature UI Entry
                        //--------------------------------------------------------//
                        case iomy.devices.temperature.ThingTypeId:

                            wList.addItem(
                                new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                    title: mDevice.DeviceName,
                                    type: "Active",
                                    number: "Loading...",
                                    numberUnit: "",
                                    attributes : [
                                        new sap.m.ObjectAttribute (oView.createId("deviceSerial"+mDevice.DeviceId), {
                                            text: "Serial: " + iomy.devices.getSerialCodeOfDevice(mDevice.DeviceId)
                                        })
                                    ],
                                    press : function () {
                                        if (oController.bEditing) {
                                            sPageId = "pDeviceForm";
                                        } else {
                                            sPageId = "pTile";
                                        }

                                        iomy.common.NavigationChangePage( sPageId , { "ThingId": mDevice.DeviceId, bEditing : oController.bEditing } , false);
                                    }
                                })
                            );

                            break;

                        //--------------------------------------------------------//
                        // Nothing that we have an entry for yet.
                        //--------------------------------------------------------//
                        default:
                            break;
                    }
                });

            });
        } catch (e) {
            $.sap.log.error("Failed to draw the device list entries ("+e.name+"): " + e.message);
        }
        
        try {
            //--------------------------------------------------------------------//
            // If there were no devices, give the option to add one.
            //--------------------------------------------------------------------//
            if (!bHasDevices) {
                wList.addItem(
                    new sap.m.ObjectListItem ({        
                        title: "No devices",
                        type: "Active",
                        attributes : [
                            new sap.m.ObjectAttribute ({
                                text: "Tap to add a device"
                            })
                        ],
                        press : function () {
                            iomy.common.NavigationChangePage( "pDeviceForm" , { 
                                "RoomId"    : oController.iLastRoomId,
                                "PremiseId" : oController.iLastPremiseId
                            } , false);
                        }
                    })
                );
            }
            
            // Flag that the loading has completed
            oController.bLoadCompleted = true;
            
        } catch (e) {
            $.sap.log.error("Failed to draw the entry to add a device ("+e.name+"): " + e.message);
        }
    },
    
    /**
     * Calls the API to turn a given device (thingID) on or off.
     * 
     * The map must contain these parameters:
     * 
     * thingID:         ID of the device to switch on or off.
     * switchWidget:    Link or button that called this function.
     * statusAttribute: A sap.m.ObjectAttribute instance that shows the status.
     * 
     * @param {type} mSettings
     */
    RunSwitch : function (mSettings) {
        var sThingIDMissing         = "Thing ID must be given.";
        var sSwitchWidgetMissing    = "Switch widget must be given.";
        var sSwitchStatusMissing    = "Switch status attribute must be given.";
        var aErrors                 = [];
        
        var mThingIdInfo;
        var oCallingWidget;
        var oStatusAttribute;
        var iThingId;
        
        try {
            //--------------------------------------------------------------------//
            // Fetch the Thing ID, switch button, and the status attribute widget.
            //--------------------------------------------------------------------//
            if (mSettings !== undefined) {
                if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                    mThingIdInfo = iomy.validation.isThingIDValid(mSettings.thingID);

                    if (!mThingIdInfo.bIsValid) {
                        throw new IllegalArgumentException(mThingIdInfo.aErrorMessages.join("\n"));
                    } else {
                        iThingId = mSettings.thingID;
                    }

                } else {
                    throw new MissingArgumentException("Thing ID must be given.");
                }

                if (mSettings.switchWidget !== undefined && mSettings.switchWidget !== null) {
                    oCallingWidget = mSettings.switchWidget;
                } else {
                    throw new MissingArgumentException("Switch widget must be given.");
                }

                if (mSettings.statusAttribute !== undefined && mSettings.statusAttribute !== null) {
                    oStatusAttribute = mSettings.statusAttribute;
                } else {
                    throw new MissingArgumentException("Switch status attribute must be given.");
                }

            } else {
                aErrors = [ sThingIDMissing, sSwitchWidgetMissing, sSwitchStatusMissing ];
                
                throw new MissingSettingsMapException(aErrors.join("\n\n"));
            }
            
            //--------------------------------------------------------------------//
            // Disable the calling widget and toggle the on/off status.
            //--------------------------------------------------------------------//
            oCallingWidget.setEnabled(false);

            iomy.devices.RunSwitch({
                thingID : iThingId,

                onSuccess : function (iStatus) {
                    try {
                        if (iStatus === 0) {
                            oStatusAttribute.setText("Status: Off");
                        } else if (iStatus === 1) {
                            oStatusAttribute.setText("Status: On");
                        }
                    } catch (e1) {
                        jQuery.sap.log.error("Error in the Run Switch onSuccess:"+e1.message); 
                    }
                    oCallingWidget.setEnabled(true);
                },

                onFail : function (sErrMessage) {
                    iomy.common.showError(sErrMessage, "Error",
                        function () {
                            oStatusAttribute.setText( "Status: "+(iomy.common.ThingList["_"+iThingId].Status === 1 ? "On" : "Off") );
                            oCallingWidget.setEnabled(true);
                        }
                    );
                }
            });
        } catch (e) {
            jQuery.sap.log.error("Error attempting to run a switch (Device ID "+iThingId+") ("+e.name+"): "+e.message);
            
            iomy.common.showError(e.message, "Error",
                function () {
                    oCallingWidget.setEnabled(true);
                }
            );
        }
    },
    
    RefreshAjaxDataForUI: function() {
        //----------------------------------------------------//
        //-- 1.0 - Initialise Variables                        --//
        //----------------------------------------------------//
        var oController            = this;
        var oView                  = oController.getView();
        
        //----------------------------------------------------//
        //-- 2.0 - Fetch a list of Ajax tasks                --//
        //----------------------------------------------------//
        try {
            $.each( oController.aaDeviceList, function( sIndex, aGrouping ) {
                //-- 3.1.3 - Draw the UI for each Device --//
                $.each( aGrouping.Devices, function( sIndex, aDevice ) {
                    //-- Create the Prefix --//
                    var sPrefix     = "entry"+aDevice.DeviceId;
                    var aNewTasks   = [];
                    
                    var mTaskListSettings = {
                        deviceData : aDevice,
                        labelWidgetID : sPrefix
                    };
                    
                    if (aDevice.DeviceTypeId == iomy.devices.zigbeesmartplug.ThingTypeId) {
                        mTaskListSettings.onFail = function (sErrMessage) {
                            $.sap.log.error(sErrMessage);

                            if (oView.byId(sPrefix) !== undefined) {
                                oView.byId(sPrefix).setNumber("N/A");

                                //-- Recursively check for more Tasks --//
                                oController.RecursiveLoadAjaxData();
                            }
                        };
                    }
                    
                    //------------------------------------------------------------//
                    // For certain devices extra information should be parsed to it.
                    //------------------------------------------------------------//
                    if (iomy.devices.weatherfeed !== undefined) {
                        
                        //--------------------------------------------------------//
                        // For Open Weather Map feeds, create functions to display
                        // information on the device entry.
                        //--------------------------------------------------------//
                        if (aDevice.DeviceTypeId == iomy.devices.weatherfeed.ThingTypeId) {
                            mTaskListSettings.onSuccess = function (data) {
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumber(data.Temperature.Value.toFixed(1) + data.Temperature.UomName);
    
                                    oView.byId("humidity"+aDevice.DeviceId).setText("Humidity: " + data.Humidity.Value + data.Humidity.UomName);
                                    oView.byId("outside"+aDevice.DeviceId).setText("Outside: " + data.Condition.Value);
    
                                    //-- Update the Last Ajax Request Date --//
                                    oController.dLastAjaxUpdate    = new Date();
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                            
                            mTaskListSettings.onFail = function (sErrMessage) {
                                $.sap.log.error(sErrMessage);
                                
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumber("N/A");
    
                                    oView.byId("humidity"+aDevice.DeviceId).setText("Failed to load data");
    
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                        }
                    }
                    
                    if (iomy.devices.motionsensor !== undefined) {
                        //--------------------------------------------------------//
                        // For motion sensors, create functions to display
                        // information on the device entry.
                        //--------------------------------------------------------//
                        if (aDevice.DeviceTypeId == iomy.devices.motionsensor.ThingTypeId) {
                            mTaskListSettings.onSuccess = function (data) {
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumberUnit(data.HumanReadable.UTS);
    
                                    //-- Update the Last Ajax Request Date --//
                                    oController.dLastAjaxUpdate    = new Date();
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                            
                            mTaskListSettings.onFail = function (sErrMessage) {
                                $.sap.log.error(sErrMessage);
                                
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumberUnit("N/A");
    
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                        }
                    }
                    
                    if (iomy.devices.temperature !== undefined) {
                        //--------------------------------------------------------//
                        // For temperature sensors, create functions to display
                        // information on the device entry.
                        //--------------------------------------------------------//
                        if (aDevice.DeviceTypeId == iomy.devices.temperature.ThingTypeId) {
                            mTaskListSettings.onSuccess = function (sTemperature) {
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumber(sTemperature);
    
                                    //-- Update the Last Ajax Request Date --//
                                    oController.dLastAjaxUpdate    = new Date();
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                            
                            mTaskListSettings.onFail = function (sErrMessage) {
                                $.sap.log.error(sErrMessage);
                                
                                if (oView.byId(sPrefix) !== undefined) {
                                    oView.byId(sPrefix).setNumber("N/A");
    
                                    //-- Recursively check for more Tasks --//
                                    oController.RecursiveLoadAjaxData();
                                }
                            };
                        }
                    }
                    
                    //--------------------------------------------------------//
                    // For light bulbs show the hex code of the bulb's colour.
                    //--------------------------------------------------------//
                    if (aDevice.DeviceTypeId == iomy.devices.philipshue.ThingTypeId ||
                        aDevice.DeviceTypeId == iomy.devices.csrmesh.ThingTypeId)
                    {
                        mTaskListSettings.onSuccess = function (sHexString) {
                            if (oView.byId(sPrefix) !== undefined) {
                                oView.byId(sPrefix).setNumber("#"+sHexString);
    
                                //-- Update the Last Ajax Request Date --//
                                oController.dLastAjaxUpdate    = new Date();
                                //-- Recursively check for more Tasks --//
                                oController.RecursiveLoadAjaxData();
                            }
                        };
    
                        mTaskListSettings.onFail = function (sErrMessage) {
                            $.sap.log.error(sErrMessage);
    
                            if (oView.byId(sPrefix) !== undefined) {
                                oView.byId(sPrefix).setNumber("N/A");
    
                                //-- Recursively check for more Tasks --//
                                oController.RecursiveLoadAjaxData();
                            }
                        };
                    }
                    
                    //--------------------------------------------------------//
                    // For cameras show the IP address and whether it's online
                    // or not.
                    //--------------------------------------------------------//
        //                if (aDevice.DeviceTypeId == iomy.devices.ipcamera.ThingTypeId ||
        //                    aDevice.DeviceTypeId == iomy.devices.onvif.ThingTypeId)
        //                {
        //                    mTaskListSettings.onComplete = function (sResult) {
        //                        oView.byId(sPrefix).setNumber(sResult);
        //
        //                        //-- Update the Last Ajax Request Date --//
        //                        oController.dLastAjaxUpdate    = new Date();
        //                        //-- Recursively check for more Tasks --//
        //                        oController.RecursiveLoadAjaxData();
        //                    };
        //                }
                    
                    //-- Add the Tasks to populate the UI --//
                    //console.log(JSON.stringify(aDevice));
                    aNewTasks = iomy.devices.GetUITaskList(mTaskListSettings);
                    //jQuery.sap.log.debug( JSON.stringify(aNewTasks) );
                    
                    //-- High Priority --//
                    if( aNewTasks.High!==undefined && aNewTasks.High!==null ) {
                        if( aNewTasks.High.length > 0 ) {
                            oController.aAjaxTasks.High.push.apply( oController.aAjaxTasks.High, aNewTasks.High );
                        }
                    }
                    //-- Low Priority --//
                    if( aNewTasks.Low!==undefined && aNewTasks.Low!==null ) {
                        if( aNewTasks.Low.length > 0 ) {
                            oController.aAjaxTasks.Low.push.apply( oController.aAjaxTasks.Low, aNewTasks.Low );
                        }
                    }
                });
            });
        } catch (e1) {
            jQuery.sap.log.error("An error has occured within RefreshAjaxDataForUI: "+e1.message);
        }
        
        //----------------------------------------------------//
        //-- 3.0 - Execute the Ajax Tasks                    --//
        //----------------------------------------------------//
        //-- Invert the array so that the tasks that were added first will be the first to be fetched --//
        oController.aAjaxTasks.High.reverse();
        oController.aAjaxTasks.Low.reverse();
        
        //-- Load 2 recursive Ajax Tasks --//
        oController.RecursiveLoadAjaxData();
        oController.RecursiveLoadAjaxData();
        
        //-- Update when the last Ajax data request occurred --//
        oController.dLastAjaxUpdate = new Date();
        
    },
    
    //====================================================//
    //== RECURSIVE AJAX LOADER                            ==//
    //====================================================//
    RecursiveLoadAjaxData: function() {
        var oController     = this;          //-- SCOPE:        Binds the current controller scope for subfunctions                    --//
        var aTask           = {};            //-- ARRAY:        This will hold a task that has being pulled from the task list --//
        try {
            if (oApp.getCurrentPage().getId() === "pDevice") {
                if (iomy.common.bSessionTerminated === false) {
                    //-- Check the Length of the array to see if there is any jobs to do --//
                    if( oController.aAjaxTasks.High.length > 0 ) {
                        //-- Pull a task from the array --//
                        aTask = oController.aAjaxTasks.High.pop();
                        oController.RunAjaxTask(aTask);
    
                    } else if( oController.aAjaxTasks.Mid.length > 0 ) {
                        //-- Pull a task from the array --//
                        aTask = oController.aAjaxTasks.Mid.pop();
                        oController.RunAjaxTask(aTask);
    
                    } else {
                        if( oController.aAjaxTasks.Low.length > 0 ) {
                            //-- Pull a task from the array --//
                            aTask = oController.aAjaxTasks.Low.pop();
                            oController.RunAjaxTask(aTask);
    
//                        } else {
//                            // Flag that the loading has completed
//                            oController.bLoadCompleted = true;
                        }
                    }
                }
            } else {
                //-- The user is no longer on the device page so no need to load anymore information --//
                oController.aAjaxTasks = { 
                    "Low": [],
                    "Mid": [],
                    "High": []
                };
            }
        } catch (e1) {
            jQuery.sap.log.error("An error has occured within RecursiveLoadAjaxData: "+e1.message);
        }
    },
    
    RunAjaxTask: function( aTask ) {
        
        //-- Extract the task type --//
        var sTaskType = aTask.Type;
        
        switch( sTaskType ) {
            case "DeviceValueKWHTotal":
                this.GetDeviceIOTotaledValue( aTask );
                break;
                
            case "DeviceValueKW":
                this.GetDeviceIORecentValue( aTask );
                break;
                
            case "DeviceValueVolt":
                this.GetDeviceIORecentValue( aTask );
                break;
                
            case "DeviceValueAmp":
                this.GetDeviceIORecentValue( aTask );
                break;
                
            case "Function":
                aTask.Execute();
                break;
                
            default:
                //-- ERROR: Unknown Task Type --//
            
        }
        return true;
    },
    
    GetDeviceIORecentValue: function ( aTask ) {
        //--------------------------------------------------------//
        //-- 1.0 - Initialise                                    --//
        //--------------------------------------------------------//
        var oController           = this;         //-- OBJECT:        Binds the current Controller's scope to a variable for sub-functions to access    --//
        var iIOId                 = 0;            //-- INTEGER:        The IO Id to poll the Data for                                                   --//
        var sIODataType           = "";           //-- STRING:        The IO's Datatype is stored so that we know what Odata URL to poll                --//
        var sIOLabel              = "";           //-- STRING:        This will hold the nickname of which odata url to poll for data                   --//
        
        //--------------------------------------------------------//
        //-- 2.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        try {
            iIOId               = aTask.Data.IOId;
            sIODataType         = aTask.Data.IODataType;
            sIOLabel            = aTask.Data.LabelId;
            // Add to the IO count
            oController.iIOCount++;
            
        } catch( e1000 ) {
            jQuery.sap.log.error("Error: Extracting Task data!"); 
        }
        
        //--------------------------------------------------------//
        //-- 3.0 - Prepare for Ajax Request                        --//
        //--------------------------------------------------------//
        
        //--------------------------------------------------------//
        //-- 4.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        try {
            iomy.apiphp.AjaxRequest({
                "url": iomy.apiphp.APILocation("mostrecent"),
                "data": {
                    "Mode":     "MostRecentValue",
                    "Id":       iIOId
                },
                "onSuccess": function ( sResponseType, aData ) {
                    try {
                        if( aData!==undefined && aData!==null) {
                            if(aData.UTS!==undefined && aData.UTS!==null) {
                                //-- If the UTS is less than 10 minutes from the endstamp --//
    //                            if( iSampleRateLimit !== null && iSampleRateLimit>=1 && ( aData.UTS <= ( iUTS_End - iSampleRateLimit ) ) ) {
    //                                //-- Flag that the IO is offline --//
    //                                oController.byId( sIOLabel ).setText("IO Offline");
    //                                
    //                            } else {
                                    //-- Display the most recent value --//
                                    var oUI5Object = oController.byId( sIOLabel );
                                    if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {

                                        //-- IF the Uom is present --//
                                        if( typeof aData.UomName!=="undefined" && aData.UomName!==null && aData.UomName!==false && aData.UomName!=="") {
                                            //----------------------------------------//
                                            //-- Round to 3 decimal places          --//
                                            //----------------------------------------//
                                            var fCalcedValue = ( Math.round( aData.Value * 1000 ) ) / 1000;

                                            //----------------------------------------//
                                            //-- Show the Results                   --//
                                            //----------------------------------------//
                                            oUI5Object.setNumber( fCalcedValue );
                                            oUI5Object.setNumberUnit( aData.UomName );

                                        } else {
                                            //-- Set it to an empty text field --//
                                            oUI5Object.setNumber("");
                                            oUI5Object.setNumberUnit("");

                                        }

                                    } else {
                                        $.sap.log.error("Critical Error: PHP API (Most Recent) OnSuccess can't find "+sIOLabel);
                                    }
    //                            }
                            } else {
                                oController.byId( sIOLabel ).setNumber("N/A");
                            }
                        } else {
                            oController.byId( sIOLabel ).setNumber("N/A");
                        }

                    } catch( e5678) {
                        $.sap.log.error( e5678.message );
                    }

                    //-- Update the Last Ajax Request Date --//
                    oController.dLastAjaxUpdate    = new Date();

                    //-- Recursively check for more Tasks --//
                    oController.RecursiveLoadAjaxData();
                },
                "onFail" : function (response) {
//                    iomy.common.showMessage({
//                        text : "There was an error retriving the value of IO "+iIOId,
//                        view : oController.getView()
//                    });
//                    
                    oController.byId( sIOLabel ).setNumber("N/A");
                    // Add to the IO Error count
                    oController.iIOErrorCount++;

                    //-- Recursively check for more Tasks --//
                    oController.RecursiveLoadAjaxData();
                }
            });
        } catch (e) {
            $.sap.log.error("Error looking up the most recent value ("+e.name+"): " + e.message);
            
            oController.dLastAjaxUpdate    = Date();
            
            //-- Recursively check for more Tasks --//
            oController.RecursiveLoadAjaxData();
        }
    
    },
    
    GetDeviceIOTotaledValue: function ( aTask ) {
        //------------------------------------------------------------------------------------//
        //-- NOTE:    This is a special workaround for when the Device doesn't have the        --//
        //--        "Current kWh" but only the "Total kWh the device has ever seen"            --//
        //------------------------------------------------------------------------------------//
        
        //--------------------------------------------------------//
        //-- 1.0 - Initialise                                    --//
        //--------------------------------------------------------//
        var oController      = this;
        var iIOId            = 0;            //-- INTEGER:        The IO Id to poll the Data for                                         --//
        var sIOLabel         = "";           //-- STRING:        This will hold the nickname of which odata url to poll for data         --//
        var sIOUoMName       = "";           //-- STRING:                                                                                --//
        var iUTS_Start       = 0;            //-- INTEGER:        Used to hold the current period's starting Unix Timestamp              --//
        var iUTS_End         = 0;            //-- INTEGER:        Used to hold the current period's ending Unix Timestamp                --//
        
        //--------------------------------------------------------//
        //-- 2.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        try {
            iIOId            = aTask.Data.IOId;
            sIOLabel         = aTask.Data.LabelId;
            sIOUoMName       = aTask.Data.IOUoMName;
        } catch( e1000 ) {
            jQuery.sap.log.error("Error: Extracting Task data!"); 
        }
        
        //--------------------------------------------------------//
        //-- 3.0 - Prepare for Ajax Request                        --//
        //--------------------------------------------------------//
        try {
            iUTS_Start              = iomy.common.GetStartOfCurrentPeriod();
            iUTS_End                = iomy.common.GetEndOfCurrentPeriod();
            
        } catch (e) {
            $.sap.log.error("Failed to get the UTS times required ("+e.name+"): " + e.message);
        }
        
        //--------------------------------------------------------//
        //-- 4.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        
        try {
            //----------------------------//
            //-- 4.1 - Maximum Value    --//
            //----------------------------//
            iomy.apiphp.AjaxRequest({
                "url": iomy.apiphp.APILocation("aggregation"),
                "data": {
                    "Id":        iIOId,
                    "Mode":        "Max",
                    "StartUTS":    iUTS_Start,
                    "EndUTS":    iUTS_End
                },
                "onSuccess": function ( sResponseType, aMaxData ) {
                    try {
                        //----------------------------//
                        //-- 4.2 - Minimum Value    --//
                        //----------------------------//
                        iomy.apiphp.AjaxRequest({
                            "url": iomy.apiphp.APILocation("aggregation"),
                            "data": {
                                "Id":        iIOId,
                                "Mode":        "Min",
                                "StartUTS":    iUTS_Start,
                                "EndUTS":    iUTS_End
                            },
                            "onSuccess": function ( sResponseType, aMinData ) {
                                //--------------------------------------------------------------------//
                                //-- STEP 3: Minimum Value                                            --//
                                //-- Make a guess at the kWh (minus Minimum from Maximum value)        --//
                                //--------------------------------------------------------------------//

                                try {
                                    if( aMaxData.Value!==undefined && aMaxData.Value!==null ) {
                                        if( aMinData.Value!==undefined && aMinData.Value!==null ) {

                                            var iValue        = ( Math.round( (aMaxData.Value - aMinData.Value) * 1000) ) / 1000;
                                            var sUoM        = aMaxData.UOM_NAME;

                                            var oUI5Object = oController.byId( sIOLabel );
                                            if( oUI5Object!==undefined && oUI5Object!==null && oUI5Object!==false ) {
                                                if(aMaxData.UOM_NAME!==undefined && aMaxData.UOM_NAME!==null ) {

                                                    oUI5Object.setNumber( iValue );
                                                    oUI5Object.setNumberUnit( sUoM );
                                                    
                                                } else {
                                                    oUI5Object.setNumber( iValue );
                                                    oUI5Object.setNumberUnit( sIOUoMName );
                                                }
                                            } else {
                                                console.log("Critical Error: Odata OnSuccess can't find "+sIOLabel);
                                            }


                                        } else {
                                            //-- TODO: Write a better error message --//
                                            oController.byId( sIOLabel ).setText("IO Offline");
                                        }
                                    } else {
                                        //-- TODO: Write a better error message --//
                                        oController.byId( sIOLabel ).setText("IO Offline");
                                    }
                                } catch (e) {
                                    $.sap.log.error("Error processing the totalled data ("+e.name+"): " + e.message);
                                }


                                //-- Update the Last Ajax Request Date --//
                                //me.aLastAjaxUpdatePerRoom["_"+me.roomID]    = Date();
                                oController.dLastAjaxUpdate    = Date();

                                //-- Recursively check for more Tasks --//
                                oController.RecursiveLoadAjaxData();
                            },
                            "onFail": function (response) {
                                oController.byId( sIOLabel ).setText("IO Offline");

                                $.sap.log.error("There was an error retrieving the Totalled value: " + response.responseText);

                                //-- Update the Last Ajax Request Date --//
                                //me.aLastAjaxUpdatePerRoom["_"+me.roomID]    = Date();
                                oController.dLastAjaxUpdate    = Date();

                                //-- Recursively check for more Tasks --//
                                oController.RecursiveLoadAjaxData();
                            }
                        });
                        
                    } catch (e) {
                        $.sap.log.error("Error running the min aggregation API ("+e.name+"): " + e.message);
                    }

                },
                "onFail": function (response) {
                    $.sap.log.error("There was an error retrieving the Totalled value: " + response.responseText);
                    
                    oController.dLastAjaxUpdate    = Date();
                    
                    //-- Recursively check for more Tasks --//
                    oController.RecursiveLoadAjaxData();
                }
            });
        } catch (e) {
            $.sap.log.error("Error running the max aggregation API ("+e.name+"): " + e.message);
            
            oController.dLastAjaxUpdate    = Date();
            
            //-- Recursively check for more Tasks --//
            oController.RecursiveLoadAjaxData();
        }
    }
    
});