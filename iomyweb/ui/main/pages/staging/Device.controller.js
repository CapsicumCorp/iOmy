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

sap.ui.controller("pages.staging.Device", {
    
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
                //----------------------------------------------------//
                // Find the room ID, if specified, and store it.
                //----------------------------------------------------//
                if (evt.data.roomID !== undefined && evt.data.roomID !== null) {
                    oController.iLastRoomId = evt.data.roomID;
                } else {
                    oController.iLastRoomId = null;
                }
                
                if (evt.data.premiseID !== undefined && evt.data.premiseID !== null) {
                    oController.iLastPremiseId = evt.data.premiseID;
                } else {
                    oController.iLastPremiseId = null;
                }
                
                //-- Defines the Device Type --//
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.aAjaxTasks = { 
                    "Low": [],
                    "Mid": [],
                    "High": []
                };
                
                oController.BuildDeviceListUI();
                oController.RefreshAjaxDataForUI();
            }
        });
            
        
    },
    
    
    BuildDeviceListUI : function () {
        var oController     = this;
        var oView           = this.getView();
        var wList           = oView.byId("DeviceList");
        var bHasDevices     = false;
        
        // Wipe the old list.
        wList.destroyItems();
        
        // Fetch the list from the core variables.
        oController.aaDeviceList = IomyRe.functions.createDeviceListData({
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
                switch (mDevice.DeviceTypeId) {
                    //--------------------------------------------------------//
                    // Zigbee Smart Plug UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.zigbeesmartplug.ThingTypeId:
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
                                    IomyRe.common.NavigationChangePage( "pTile" , { "ThingId": mDevice.DeviceId } , false);
                                }
                            })
                        );

                        break;

                    //--------------------------------------------------------//
                    // Philips Hue UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.philipshue.ThingTypeId:
                        wList.addItem(
                            new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                title: mDevice.DeviceName,
                                type: "Active",
                                number: "Blue",
                                numberUnit: "hue",
                                attributes : [
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "Toggle State",
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
                                    IomyRe.common.NavigationChangePage( "pRGBlight" , { "ThingId": mDevice.DeviceId } , false);
                                }
                            })
                        );

                        break;

                    //--------------------------------------------------------//
                    // Onvif Stream UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.onvif.ThingTypeId:
                        wList.addItem(
                            new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                title: mDevice.DeviceName,
                                type: "Active",
                                number: "Monitoring",
                                numberUnit: "activity",
                                attributes : [
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "Take Screenshot"
                                        })
                                    }),
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "View Stream",
                                            press : function () {
                                                try {
                                                    IomyRe.devices.onvif.getStreamURL({
                                                        ThingId : mDevice.DeviceId,

                                                        onSuccess : function(sUrl) {
                                                            window.open(sUrl);
                                                        },

                                                        onFail : function (response) {
                                                            IomyRe.common.showError(response.responseText, "Couldn't load the stream");
                                                        }
                                                    });
                                                } catch (ex) {
                                                    IomyRe.common.showError(ex.message, "Couldn't load the stream");
                                                }
                                            }
                                        })
                                    })
                                ]
                            })
                        );

                        break;

                    //--------------------------------------------------------//
                    // IP Webcam Stream UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.ipcamera.ThingTypeId:
                        wList.addItem(
                            new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                title: mDevice.DeviceName,
                                type: "Active",
                                number: "Monitoring",
                                numberUnit: "activity",
                                attributes : [
//                                    new sap.m.ObjectAttribute ({
//                                        text: "link",
//                                        customContent : new sap.m.Link ({
//                                            text: "Take Screenshot"
//                                        })
//                                    }),
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "Record"
                                        })
                                    })
                                ],
                                press : function () {
                                    IomyRe.common.NavigationChangePage( "pMJPEG" , {} , false);
                                }
                            })
                        );

                        break;

                    //--------------------------------------------------------//
                    // Weather Feed UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.weatherfeed.ThingTypeId:
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
                                    IomyRe.common.NavigationChangePage( "pWeatherFeed" , { "ThingId" : mDevice.DeviceId } , false);
                                }
                            })
                        );

                        break;

                    //--------------------------------------------------------//
                    // Motion Sensor UI Entry
                    //--------------------------------------------------------//
                    case IomyRe.devices.motionsensor.ThingTypeId:
                        wList.addItem(
                            new sap.m.ObjectListItem (oView.createId("entry"+mDevice.DeviceId), {        
                                title: mDevice.DeviceName,
                                type: "Active",
                                number: "Last Motion",
                                numberUnit: "Loading...",
                                attributes : [
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "Enable Alarm"
                                        })
                                    }),
                                    new sap.m.ObjectAttribute ({
                                        text: "link",
                                        customContent : new sap.m.Link ({
                                            text: "Disable Alarm"
                                        })
                                    })
                                ],
                                press : function () {
                                    IomyRe.common.NavigationChangePage( "pMotionSensor" , { "ThingId" : mDevice.DeviceId } , false);
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
        var mThingIdInfo;
        var oCallingWidget;
        var oStatusAttribute;
        var iThingId;
        
        //--------------------------------------------------------------------//
        // Fetch the Thing ID, switch button, and the status attribute widget.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                mThingIdInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
                
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
                throw new MissingArgumentException("Switch status attribute must be given.");
            }
            
            if (mSettings.statusAttribute !== undefined && mSettings.statusAttribute !== null) {
                oStatusAttribute = mSettings.statusAttribute;
            } else {
                throw new MissingArgumentException("Switch status attribute must be given.");
            }
            
        } else {
            throw new MissingSettingsMapException("Thing ID must be given.\nSwitch status attribute must be given.");
        }
        
        
        //--------------------------------------------------------------------//
        // Disable the calling widget and toggle the on/off status.
        //--------------------------------------------------------------------//
        oCallingWidget.setEnabled(false);
        
        IomyRe.devices.RunSwitch({
            thingID : iThingId,
            
            onSuccess : function (iStatus) {
                if (iStatus === 0) {
                    oStatusAttribute.setText("Status: Off");
                } else if (iStatus === 1) {
                    oStatusAttribute.setText("Status: On");
                }
                
                oCallingWidget.setEnabled(true);
            },
            
            onFail : function (sErrMessage) {
                IomyRe.common.showError(sErrMessage, "Error",
                    function () {
                        oStatusAttribute.setText( "Status: "+(IomyRe.common.ThingList["_"+iThingId].Status === 1 ? "On" : "Off") );
                        oCallingWidget.setEnabled(true);
                    }
                );
            }
        });
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
                
                //------------------------------------------------------------//
                // For certain devices extra information should be parsed to it.
                //------------------------------------------------------------//
                if (IomyRe.devices.weatherfeed !== undefined) {
                    
                    //--------------------------------------------------------//
                    // For Open Weather Map feeds, create functions to display
                    // information on the device entry.
                    //--------------------------------------------------------//
                    if (aDevice.DeviceTypeId == IomyRe.devices.weatherfeed.ThingTypeId) {
                        mTaskListSettings.onSuccess = function (data) {
                            oView.byId(sPrefix).setNumber(data.Temperature.Value + data.Temperature.UomName);
                            
                            oView.byId("humidity"+aDevice.DeviceId).setText("Humidity: " + data.Humidity.Value + data.Humidity.UomName);
                            oView.byId("outside"+aDevice.DeviceId).setText("Outside: " + data.Condition.Value);
                            
                            //-- Update the Last Ajax Request Date --//
                            oController.dLastAjaxUpdate    = new Date();
                            //-- Recursively check for more Tasks --//
                            oController.RecursiveLoadAjaxData();
                        };
                        
                        mTaskListSettings.onFail = function (sErrMessage) {
                            $.sap.log.error(sErrMessage);
                            
                            oView.byId(sPrefix).setNumber("N/A");
                            
                            oView.byId("humidity"+aDevice.DeviceId).setText("Failed to load data");
                            
                            //-- Recursively check for more Tasks --//
                            oController.RecursiveLoadAjaxData();
                        };
                    }
                }
                
                if (IomyRe.devices.motionsensor !== undefined) {
                    //--------------------------------------------------------//
                    // For motion sensors, create functions to display
                    // information on the device entry.
                    //--------------------------------------------------------//
                    if (aDevice.DeviceTypeId == IomyRe.devices.motionsensor.ThingTypeId) {
                        mTaskListSettings.onSuccess = function (data) {
                            oView.byId(sPrefix).setNumberUnit(data.HumanReadable.UTS);
                            
                            //-- Update the Last Ajax Request Date --//
                            oController.dLastAjaxUpdate    = new Date();
                            //-- Recursively check for more Tasks --//
                            oController.RecursiveLoadAjaxData();
                        };
                        
                        mTaskListSettings.onFail = function (sErrMessage) {
                            $.sap.log.error(sErrMessage);
                            
                            oView.byId(sPrefix).setNumberUnit("N/A");
                            
                            //-- Recursively check for more Tasks --//
                            oController.RecursiveLoadAjaxData();
                        };
                    }
                }
                
                //-- Add the Tasks to populate the UI --//
                //console.log(JSON.stringify(aDevice));
                aNewTasks = IomyRe.devices.GetUITaskList(mTaskListSettings);
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
        var oController        = this;            //-- SCOPE:        Binds the current controller scope for subfunctions                    --//
        var aTask            = {};            //-- ARRAY:        This will hold a task that has being pulled from the task list --//

        if (IomyRe.common.bSessionTerminated === false) {
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

                }
            }
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
        var oController            = this;            //-- OBJECT:        Binds the current Controller's scope to a variable for sub-functions to access    --//
        var iIOId               = 0;            //-- INTEGER:        The IO Id to poll the Data for                                                --//
        var sIODataType         = "";            //-- STRING:        The IO's Datatype is stored so that we know what Odata URL to poll            --//
        var sIOLabel            = "";            //-- STRING:        This will hold the nickname of which odata url to poll for data                   --//
        var iSampleRateLimit    = null;         //-- INTEGER:        Sample rate limit in seconds                                                --//
        var iUTS_Start            = 0;            //-- INTEGER:        Used to hold the current period's starting Unix Timestamp                         --//
        var iUTS_End            = 0;            //-- INTEGER:        Used to hold the current period's ending Unix Timestamp                           --//
        var sAjaxUrl            = "";            //-- STRING:        --//
        var aAjaxColumns        = [];            //-- ARRAY:            --//
        var aAjaxWhereClause    = [];            //-- ARRAY:            --//
        var aAjaxOrderByClause    = [];            //-- ARRAY:            --//
        
        //--------------------------------------------------------//
        //-- 2.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        try {
            iIOId               = aTask.Data.IOId;
            sIODataType         = aTask.Data.IODataType;
            sIOLabel            = aTask.Data.LabelId;
            iSampleRateLimit    = aTask.Data.SamplerateLimit;
            // Add to the IO count
            oController.iIOCount++;
            
        } catch( e1000 ) {
            jQuery.sap.log.error("Error: Extracting Task data!"); 
        }
        
        //--------------------------------------------------------//
        //-- 3.0 - Prepare for Ajax Request                        --//
        //--------------------------------------------------------//
        //iUTS_Start                = IomyRe.common.GetStartOfCurrentPeriod();
        iUTS_End                = IomyRe.time.GetCurrentUTS();
        
        

        //--------------------------------------------------------//
        //-- 4.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest({
            "url": IomyRe.apiphp.APILocation("mostrecent"),
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
                                    console.log("Critical Error: PHP API (Most Recent) OnSuccess can't find "+sIOLabel);
                                }
//                            }
                        } else {
                            oController.byId( sIOLabel ).setText("IO Offline");
                        }
                    } else {
                        oController.byId( sIOLabel ).setText("IO Offline");
                    }
                    
                } catch( e5678) {
                    console.log( e5678.message );
                }
                
                //-- Update the Last Ajax Request Date --//
                oController.dLastAjaxUpdate    = new Date();
                
                //-- Recursively check for more Tasks --//
                oController.RecursiveLoadAjaxData();
            },
            "onFail" : function (response) {
                IomyRe.common.showMessage({
                    text : "There was an error retriving the value of IO "+iIOId,
                    view : oController.getView()
                });
                // Add to the IO Error count
                oController.iIOErrorCount++;
                
                //-- Recursively check for more Tasks --//
                oController.RecursiveLoadAjaxData();
            }
        });
    
    },
    
    
    
    GetDeviceIOTotaledValue: function ( aTask ) {
        //------------------------------------------------------------------------------------//
        //-- NOTE:    This is a special workaround for when the Device doesn't have the        --//
        //--        "Current kWh" but only the "Total kWh the device has ever seen"            --//
        //------------------------------------------------------------------------------------//
        
        //--------------------------------------------------------//
        //-- 1.0 - Initialise                                    --//
        //--------------------------------------------------------//
        var oController            = this;
        var iIOId            = 0;            //-- INTEGER:        The IO Id to poll the Data for                                         --//
        var sIOLabel        = "";            //-- STRING:        This will hold the nickname of which odata url to poll for data            --//
        var sIOUoMName        = "";
        var iUTS_Start            = 0;            //-- INTEGER:        Used to hold the current period's starting Unix Timestamp                --//
        var iUTS_End            = 0;            //-- INTEGER:        Used to hold the current period's ending Unix Timestamp                    --//
        
        //--------------------------------------------------------//
        //-- 2.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        try {
            iIOId            = aTask.Data.IOId;
            sIOLabel        = aTask.Data.LabelId;
            sIOUoMName        = aTask.Data.IOUoMName;
        } catch( e1000 ) {
            jQuery.sap.log.error("Error: Extracting Task data!"); 
        }
        
        //--------------------------------------------------------//
        //-- 3.0 - Prepare for Ajax Request                        --//
        //--------------------------------------------------------//
        iUTS_Start                = IomyRe.common.GetStartOfCurrentPeriod();
        iUTS_End                = IomyRe.common.GetEndOfCurrentPeriod();
        
        //--------------------------------------------------------//
        //-- 4.0 - Check if Ajax Request should be run            --//
        //--------------------------------------------------------//
        
        //----------------------------//
        //-- 4.1 - Maximum Value    --//
        //----------------------------//
        IomyRe.apiphp.AjaxRequest({
            "url": IomyRe.apiphp.APILocation("aggregation"),
            "data": {
                "Id":        iIOId,
                "Mode":        "Max",
                "StartUTS":    iUTS_Start,
                "EndUTS":    iUTS_End
            },
            "onSuccess": function ( sResponseType, aMaxData ) {
                //----------------------------//
                //-- 4.2 - Minimum Value    --//
                //----------------------------//
                IomyRe.apiphp.AjaxRequest({
                    "url": IomyRe.apiphp.APILocation("aggregation"),
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
                                    console.log("Critical Error: Odata OnSuccess can't find "+sIOLabel)
                                }
                                
                                
                            } else {
                                //-- TODO: Write a better error message --//
                                oController.byId( sIOLabel ).setText("IO Offline");
                            }
                        } else {
                            //-- TODO: Write a better error message --//
                            oController.byId( sIOLabel ).setText("IO Offline");
                        }

                        
                        //-- Update the Last Ajax Request Date --//
                        //me.aLastAjaxUpdatePerRoom["_"+me.roomID]    = Date();
                        oController.dLastAjaxUpdate    = Date();
                        
                        //-- Recursively check for more Tasks --//
                        oController.RecursiveLoadAjaxData();
                    },
                    "onFail": function (response) {
                        oController.byId( sIOLabel ).setText("IO Offline");
                        
                        IomyRe.common.showMessage({
                            text : "There was an error retriving the Totaled value",
                            view : oController.getView()
                        });
                        
                        //-- Update the Last Ajax Request Date --//
                        //me.aLastAjaxUpdatePerRoom["_"+me.roomID]    = Date();
                        oController.dLastAjaxUpdate    = Date();
                        
                        //-- Recursively check for more Tasks --//
                        oController.RecursiveLoadAjaxData();
                    }
                });
                
            },
            "onFail": function (response) {
                IomyRe.common.showMessage({
                    text : "There was an error retriving the Totaled value",
                    view : oController.getView()
                });
            }
        });
    }
    
});