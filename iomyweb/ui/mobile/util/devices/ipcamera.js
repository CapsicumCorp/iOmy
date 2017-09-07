/*
Title: IP Webcam (MJPEG) Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the functionality for IP Webcam support for phones running
    video stream servers using apps such as IP Webcam.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

$.sap.declare("IOMy.devices.ipcamera",true);
IOMy.devices.ipcamera = new sap.ui.base.Object();

$.extend(IOMy.devices.ipcamera,{
    
    RSNetworkAddress : 3960,
    RSNetworkPort    : 3961,
    RSUsername       : 3962,
    RSPassword       : 3963,
    RSPath           : 3964,
    RSProtocol       : 3965,
    
    urlAddress  : null,
    urlPort     : null,
    urlProtocol : null,
    urlPath     : null,
    urlUsername : null,
    urlPassword : null,
    
    ODataCallsToMake     : 6,
    runningODataCalls    : false,
    
    LinkTypeId          : 14,
    ThingTypeId         : 18,
    
    DevicePageID : "pDeviceMPEGStream",
    
    loadCameraInformation : function(mSettings) {
        var me                = this;
        var bError            = false;
        var aErrorMessages    = [];
        var iNetAddrIO        = 0;
        var iNetPortIO        = 0;
        var iUsernameIO       = 0;
        var iPasswordIO       = 0;
        var iPathIO           = 0;
        var iProtocolIO       = 0;
        var iThingId;
        var sUrl;
        var mThingIdInfo;
        var mThing;
        var fnSuccess;
        var fnFail;
        
        //-- Variables to handle the concurrent calls to the OData service. --//
        var aConfigs        = [];
        var fnUpdateCounter = function () {
            me.ODataCallsToMake--;
            if (me.ODataCallsToMake === 0) {
                var mThing                    = IOMy.common.ThingList["_"+iThingId];
                var bAuthenticationRequired   = false;
                var mData        = {
                    Hub        : IOMy.functions.getHubConnectedToThing(mThing.Id).HubId
                };
                
                //------------------------------------------------------------//
                // Begin gathering connection data.
                //------------------------------------------------------------//
                if ( (me.urlUsername !== undefined && me.urlUsername !== null) &&
                     (me.urlPassword !== undefined && me.urlPassword !== null) )
                {
                    bAuthenticationRequired = true;
                }
                
                me.runningODataCalls = false;
                me.ODataCallsToMake = 6;
                
                mData.Protocol                    = me.urlProtocol;
                mData.Address                     = me.urlAddress;
                mData.Port                        = me.urlPort;
                mData.Path                        = me.urlPath;
                mData.Username                    = me.urlUsername;
                mData.Password                    = me.urlPassword;
                mData.AuthenticationRequired      = bAuthenticationRequired;
                
                //-- Run the success callback with the connection settings. --//
                fnSuccess(mData);
            }
        };
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            mThingIdInfo    = IOMy.validation.isThingIDValid(mSettings.thingID);
            bError            = !mThingIdInfo.bIsValid;
            aErrorMessages    = mThingIdInfo.aErrorMessages;
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new ThingIDNotValidException("* "+aErrorMessages.join("\n* "));
            } else {
                iThingId = mSettings.thingID;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onSuccess callback function
            //----------------------------------------------------------------//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Find the onFail callback function
            //----------------------------------------------------------------//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Check that the Thing ID passed the test. Throw an exception if not.
        //--------------------------------------------------------------------//
        if (bError) {
            throw new ThingIDNotValidException(aErrorMessages.join("\n"));
        }
        
        //--------------------------------------------------------------------//
        // Fetch the IO for the stream URL
        //--------------------------------------------------------------------//
        mThing = IOMy.common.ThingList["_"+iThingId];
        
        $.each(mThing.IO, function (sIndex, mIO) {
            //----------------------------------------------------------------//
            // Get the correct IOs
            //----------------------------------------------------------------//
            if (sIndex !== undefined && sIndex !== null && mIO !== undefined && mIO !== null) {
                if (mIO.RSTypeId === me.RSNetworkAddress) {
                    iNetAddrIO = mIO.Id;
                } else if (mIO.RSTypeId === me.RSNetworkPort) {
                    iNetPortIO = mIO.Id;
                } else if (mIO.RSTypeId === me.RSUsername) {
                    iUsernameIO = mIO.Id;
                } else if (mIO.RSTypeId === me.RSPassword) {
                    iPasswordIO = mIO.Id;
                } else if (mIO.RSTypeId === me.RSPath) {
                    iPathIO = mIO.Id;
                } else if (mIO.RSTypeId === me.RSProtocol) {
                    iProtocolIO = mIO.Id;
                }
            }
            
        });
        
        //--------------------------------------------------------------------//
        // If any of the IOs are missing, then this is not a valid IP camera.
        //--------------------------------------------------------------------//
        if (iNetAddrIO === 0 || iNetPortIO === 0 || iUsernameIO === 0 ||
            iPasswordIO === 0 || iPathIO === 0 || iProtocolIO === 0)
        {
            throw new StreamURLNotFoundException();
        }
        
        //--------------------------------------------------------------------//
        // Run a request to fetch the URL
        //--------------------------------------------------------------------//
        sUrl = IOMy.apiodata.ODataLocation("datashortstring");
        
        aConfigs = [
            
            {
                "ID" : iNetAddrIO,
                "onSuccess" : function (response, data) {
                    me.urlAddress = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            },
            {
                "ID" : iNetPortIO,
                "onSuccess" : function (response, data) {
                    me.urlPort = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            },
            {
                "ID" : iProtocolIO,
                "onSuccess" : function (response, data) {
                    me.urlProtocol = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            },
            {
                "ID" : iPathIO,
                "onSuccess" : function (response, data) {
                    me.urlPath = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            },
            {
                "ID" : iUsernameIO,
                "onSuccess" : function (response, data) {
                    me.urlUsername = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            },
            {
                "ID" : iPasswordIO,
                "onSuccess" : function (response, data) {
                    me.urlPassword = data[0].CALCEDVALUE;
                    
                    //-- Update the remaining call count --//
                    fnUpdateCounter();
                }
            }
            
        ];
        
        me.runningODataCalls = true;
        
        for (var i = 0; i < aConfigs.length; i++) {
            IOMy.apiodata.AjaxRequest({
                Url              : sUrl,
                Columns          : ["CALCEDVALUE"],
                WhereClause      : ["IO_PK eq " + aConfigs[i].ID],
                OrderByClause    : ["UTS desc"],
                Limit            : 1,

                onSuccess : aConfigs[i].onSuccess,

                onFail : function (response) {
                    fnFail(response);
                }
            });
        }
    },
    
    /**
     * Loads the URL of the stream and parses it to the motion JPEG page.
     * 
     * @param {type} iThingId            ID of the camera to load the stream for.
     */
    loadStreamUrl : function (mSettings) {
        var bError                    = false;
        var aErrorMessages            = [];
        var iThingId;
        var mThingIDInfo;
        var fnSuccess;
        var fnFail;
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Read the settings map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Valid Thing ID
            //----------------------------------------------------------------//
            if (mSettings.thingID !== undefined) {
                mThingIDInfo = IOMy.validation.isThingIDValid(mSettings.thingID);
                
                bError            = !mThingIDInfo.bIsValid;
                aErrorMessages    = aErrorMessages.concat(mThingIDInfo.aErrorMessages);
                
                if (!bError) {
                    iThingId = mSettings.thingID;
                }
            } else {
                fnAppendError("Thing ID (thingID) must be specified!");
            }
            
            //----------------------------------------------------------------//
            // Check the settings map for two callback functions.
            //----------------------------------------------------------------//
            
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }

            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            throw new MissingSettingsMapException();
        }
        
        //--------------------------------------------------------------------//
        // Attempt to load the URL and parse it to the MJPEG page and report
        // any errors.
        //--------------------------------------------------------------------//
        IOMy.apiphp.AjaxRequest({
            url         : IOMy.apiphp.APILocation("ipcamera"),
            type        : "POST",
            data        : "Mode=FetchStreamUrl&ThingId="+iThingId,

            onSuccess : function(responseType, data) {
                try {
                    if (data.Error === false) {
                        fnSuccess(data.Data.sUrl);
                    } else {
                        fnFail(data.ErrMesg);
                    }
                } catch (ex) {
                    fnFail(ex.message);
                }
                
            },

            onFail : function (response) {
                fnFail(response.responseText);
            }
        });
    },
    
    createNewDeviceForm : function () {
        var oPage               = oApp.getPage("pSettingsLinkAdd").getController();
        
        //--------------------------------------------------------------------//
        // Change the help message for the New Link page.
        //--------------------------------------------------------------------//
        IOMy.help.PageInformation["pSettingsLinkAdd"] = "" +
            "You will need to specify the IP address of the device, and the path of the video stream. " +
            "The default protocol is 'http', and the default port is 80.";
        
        //-- File Type --//
        oPage.wFileTypeSelector = new sap.m.Select({
            width: "100%",                                            
            items: [
                new sap.ui.core.Item ({
                    text: "MJPEG",
                    key: "MJPEG"
                })
            ]
        });
        
        //-- Protocol --//
        oPage.wProtocol = new sap.m.Input ({
            type:"Text",
            placeholder:"http"
        }).addStyleClass("");
        
        //-- IP Address --//
        oPage.wIPAddress = new sap.m.Input ({
            type: "Url",
            placeholder: "e.g. 10.0.0.1"
        }).addStyleClass("");
        
        //-- IP Port --//
        oPage.wIPPort = new sap.m.Input ({
            type:"Number",
            placeholder:"80"
        }).addStyleClass("");
        
        //-- Video stream path --//
        oPage.wStreamPath = new sap.m.Input ({
            type:"Text",
            placeholder:"e.g. video"
        }).addStyleClass("");
        
        oPage.wFormBox.addItem(
            /* Parent HBox for Type & Hub Containers */
            new sap.m.HBox ({
                items : [
                    /* Parent VBox for Type */
                    new sap.m.VBox ({
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 1
                        }),
                        items : [
                            new sap.m.Label ({
                                text: "Type:"
                            }),
                            oPage.wFileTypeSelector,
                        ]
                    }),
                ]
            }).addStyleClass()
        );
        
        oPage.wFormBox.addItem(
            /* Parent HBox for Protocol, Network Address & Port Containers */
            new sap.m.HBox ({
                items : [
                    /* Parent VBox for Protocol */
                    new sap.m.VBox ({
                        items : [
                            new sap.m.Label ({
                                text: "Protocol:"
                            }),
                            oPage.wProtocol
                        ]
                    }).addStyleClass("width65px"),

                    /* Parent VBox for Network Address */
                    new sap.m.VBox ({
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 1
                        }),
                        items : [    
                            new sap.m.Label ({
                                text: "Network Address:"
                            }),
                            oPage.wIPAddress
                        ]
                    }).addStyleClass("MarLeft10px MarRight10px"),

                    /* Parent VBox for Port */
                    new sap.m.VBox ({
                        items : [    
                            new sap.m.Label ({
                                text: "Port:"
                            }),
                            oPage.wIPPort
                        ]
                    }).addStyleClass("width65px"),
                ]
            }).addStyleClass("PadTop5px")
        );

        oPage.wFormBox.addItem(
            /* Parent HBox for Video Path Container */
            new sap.m.HBox ({
                items : [
                    /* Parent VBox for Video Path Input */
                    new sap.m.VBox ({
                        layoutData : new sap.m.FlexItemData({
                            growFactor : 1
                        }),
                        items : [
                            new sap.m.Label ({
                                text: "Path:"
                            }),
                            oPage.wStreamPath
                        ]
                    }).addStyleClass(""),
                ]
            }).addStyleClass("PadTop5px")
        );
    },
    
    /**
     * Takes all of the data from the form and checks that all of the required
     * fields are filled out. Once the data is verified, the API to create a new
     * camera in the database will be executed.
     * 
     * The required parameters are:
     * 
     * * IP address
     * * Stream path
     * 
     * The default port is 80. The default protocol is http.
     */
    submitWebcamInformation : function (mSettings) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var me                           = this;
        var bError                       = false;
        var aErrorMessages               = [];
        var sMode                        = "";
        var sAPIDataString               = "";
        var iThingId;
        var bEditing;
        var sFileType;
        var iHubId;
        var sProtocol;
        var sIPAddress;
        var sIPPort;
        var sStreamPath;
//        var bAuthenticationRequired;
//        var sUsername;
//        var sPassword;
        var mIPAddressResult;
        var mThingIdResult;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sMessage) {
            bError = true;
            aErrorMessages.push(sMessage);
        };
        
        //--------------------------------------------------------------------//
        // Read the settings map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            
            //--------------------------------------------------------------------//
            // Check that all the fields are filled out. Exception is the protocol
            // field, which defaults to 'http'
            //--------------------------------------------------------------------//
            
            //-- File Type --//
            if (mSettings.fileType === "" || mSettings.fileType === undefined || mSettings.fileType === null) {
                fnAppendError("File type must be specified.");
            } else {
                sFileType = mSettings.fileType;
            }
            
            //-- Hub ID --//
            if (mSettings.hubID === "" || mSettings.hubID === undefined || mSettings.hubID === null) {
                fnAppendError("Hub ID must be specified.");
            } else {
                iHubId = mSettings.hubID;
            }

            //-- Check IP Address --//
            if (mSettings.ipAddress === "" || mSettings.ipAddress === null || mSettings.ipAddress === undefined) {
                fnAppendError("IP Address must be specified!");
            } else {
                //-- Verify that the IP address format is correct. --//
                try {
                    mIPAddressResult = IOMy.validation.isIPv4AddressValid(mSettings.ipAddress);

                    if (!mIPAddressResult.bValid) {
                        bError = true;
                        aErrorMessages = aErrorMessages.concat(mIPAddressResult.aErrorMessages);
                    }
                    
                    if (!bError) {
                        sIPAddress = mSettings.ipAddress;
                    }
                } catch (ex) {
                    fnAppendError("Could not validate IP address: " + ex.name + ", " + ex.message);
                }
            }

            //-- Stream Path --//
            if (mSettings.streamPath === "" || mSettings.streamPath === undefined || mSettings.streamPath === null) {
                fnAppendError("Path to the stream must be specified.");
            } else {
                sStreamPath = mSettings.streamPath;
            }
            
            //--------------------------------------------------------------------//
            // If authentication is required, check that the username and
            // password are specified.
            //--------------------------------------------------------------------//
            // TODO : Once we support authentication, modify this code to suit this function.
    //        if (bAuthenticationRequired) {
    //            if (sUsername === "") {
    //                fnAppendError("Username must be specified.");
    //            } else {
    //            
    //            if (sPassword === "") {
    //                fnAppendError("Password must be given.");
    //            }
    //            
    //            if (me.CheckAuthenticationFieldsForSpaces() === true) {
    //                fnAppendError("Neither the username nor the password can contain spaces.");
    //            }
    //        }

            //-- Check Port --//
            if (mSettings.ipPort === "" || mSettings.ipPort === undefined || mSettings.ipPort === null) {
                sIPPort = "80";
            } else {
                sIPPort = mSettings.ipPort;
            }

            //-- Check Protocol --//
            if (mSettings.protocol === "") {
                sProtocol = "http";
            } else {
                sProtocol = mSettings.protocol;
            }

            //-- Editing --//
            if (mSettings.editing === null || mSettings.editing === undefined) {
                bEditing = false;
            } else {
                bEditing = mSettings.editing;
                
                //-- ID of thing to edit --//
                if (bEditing) {
                    if (mSettings.thingID !== null && mSettings.thingID !== undefined && mSettings.thingID !== "") {
                        
                        mThingIdResult = IOMy.validation.isThingIDValid(mSettings.thingID);
                        
                        if (!mThingIdResult.bIsValid) {
                            bError = true;
                            aErrorMessages = aErrorMessages.concat(mThingIdResult.aErrorMessages);
                        }
                        
                        if (!bError) {
                            iThingId = mSettings.thingID;
                        }
                    } else {
                        fnAppendError("ID of the IP Camera must be given when editing.");
                    }
                }
            }

            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
            if (bError) {
                throw new IllegalArgumentException("* "+aErrorMessages.join("\n* "));
            }
        } else {
            throw new MissingSettingsMapException("No settings were provided. The file type, hub ID, IP address, port and video path are required. Device ID is also required if editing. (BUG IF YOU SEE THIS!)");
        }
        
        //----------------------------------------------------------------//
        // Prepare the 'Data' parameter string.
        //----------------------------------------------------------------//
        if (bEditing) {
            sMode = "Mode=EditIPCamera&ThingId="+iThingId;
        } else {
            sMode = "Mode=AddNewIPCamera";
        }

        sAPIDataString += sMode+"&IPCamType="+sFileType+"&HubId="+iHubId;
        sAPIDataString += "&Data={\"NetworkAddress\":\""+sIPAddress+"\",\"NetworkPort\":\""+sIPPort+"\",\"Protocol\":\""+sProtocol+"\",\"Path\":\""+sStreamPath+"\"";

//            if (bAuthenticationRequired) {
//                sAPIDataString += ",\"Username\":\""+sUsername+"\",\"Password\":\""+sPassword+"\"";
//            }
        sAPIDataString += "}";

        //----------------------------------------------------------------//
        // Run the request
        //----------------------------------------------------------------//
        IOMy.apiphp.AjaxRequest({
            "url"        : IOMy.apiphp.APILocation("ipcamera"),
            "type"        : "POST",
            "data"        : sAPIDataString,

            "onSuccess"    : function (responseType, data) {
                try {
                    if (data.Error === true) {
                        fnFail(data.ErrMesg);

                    } else {
                        fnSuccess(data);

                    }
                } catch (ex) {
                    fnFail(ex.message);
                }
            },

            "onFail"    : function (error) {
                fnFail(error.responseText);
            }
        });
    },
    
    showSnapshot : function (iThingId, oCallingButton) {
        var me = this;
        var oRPopover = new sap.m.ResponsivePopover({
            title : IOMy.common.ThingList["_"+iThingId].DisplayName,
        });
        
        var fnShowUnavailable = function () {
            oRPopover.addContent(
                new sap.m.VBox({
                    items : [
                        new sap.m.Text({
                            text : "Snapshot not available",
                            textAlign : sap.ui.core.TextAlign.Center
                        }).addStyleClass("width100Percent TextBold MarTop20px")
                    ]
                })
            );
        };
        
        me.loadStreamUrl({
            thingID : iThingId,
            onSuccess : function (sUrl) {
                oRPopover.addContent(
                    new sap.m.Image({
                        densityAware : false,
                        alt : "Failed to acquire snapshot",
                        src : sUrl,
                        width: "100%",

                        error : function () {
                            this.destroy();

                            fnShowUnavailable();
                        }
                    })
                );

            },
            
            onFail : function () {
                fnShowUnavailable();
            }
        });
        
        oRPopover.openBy(oCallingButton);
    },
    
    /**
     * Creates an IP Camera UI entry in a page such as room overview. This is to be
     * called from the GetCommonUI in the main devices module.
     * 
     * @param {type} sPrefix
     * @param {type} oViewScope
     * @param {type} aDeviceData
     * @returns {object}
     */
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables     --//
        //------------------------------------//
        
        var me                    = this;
        var oUIObject            = null;   //-- OBJECT:            --//
        var aUIObjectItems        = [];     //-- ARRAY:             --//
         
        //------------------------------------//
        //-- 2.0 - Fetch UI                 --//
        //------------------------------------//
        aUIObjectItems.push(
            //------------------------------------//
            //-- 1st is the Device Label        --//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
                        width: "85%",
                        text : aDeviceData.DeviceName,
                        press : function () {
                            IOMy.common.NavigationChangePage("pDeviceMPEGStream", { "ThingId" : aDeviceData.DeviceId });
                        }
                    }).addStyleClass("MarLeft6px MarTop20px TextSizeMedium Text_grey_20 iOmyLink")
                ]
            }).addStyleClass("BorderRight width80Percent webkitflex")
        );
        
        aUIObjectItems.push(
            //------------------------------------//
            //-- 2nd is the onvif buttons       --//
            //------------------------------------//
            new sap.m.HBox({
                items : [
                    new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                        //--------------------------------//
                        //-- Take Snapshot              --//
                        //--------------------------------//
                        items: [
//                            new sap.m.VBox({
//                                items : [
//                                    new sap.m.Button ({
//                                        width: "100%",
//                                        icon : "sap-icon://GoogleMaterial/photo_camera",
//                                        press : function () {
//                                            me.showSnapshot(aDeviceData.DeviceId, this);
//                                        }
//                                    })
//                                ]
//                            })
                        ]
                    }).addStyleClass("MarLeft10px MarAuto0px minwidth70px"),
                    new sap.m.VBox( oViewScope.createId( sPrefix+"_Screenshot"), {
                        //--------------------------------//
                        //-- Open Live Stream           --//
                        //--------------------------------//
                        items: [
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Button ({
                                        width: "100%",
                                        icon : "sap-icon://GoogleMaterial/videocam",
                                        press : function () {
                                            IOMy.common.NavigationChangePage("pDeviceMPEGStream", { "ThingId" : aDeviceData.DeviceId });
                                        }
                                    })
                                ]
                            })
                        ]
                    }).addStyleClass("MarLeft10px MarAuto0px minwidth70px")
                ]
            }).addStyleClass("minwidth170px minheight58px")
        );
        
        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");
        
        
        //------------------------------------//
        //-- 3.0 - RETURN THE RESULTS        --//
        //------------------------------------//
        return oUIObject;
    },
    
    GetCommonUITaskList: function( Prefix, oViewScope, aDeviceData ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        
        var aTasks            = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        //------------------------------------//
        //-- 2.0 - Fetch TASKS                --//
        //------------------------------------//
        if( aDeviceData.IOs!==undefined ) {
            
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
        return aTasks;
    }
    
});