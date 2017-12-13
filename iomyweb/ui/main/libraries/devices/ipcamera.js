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

$.sap.declare("IomyRe.devices.ipcamera",true);
IomyRe.devices.ipcamera = new sap.ui.base.Object();

$.extend(IomyRe.devices.ipcamera,{
    
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
        var mData             = {
            address     : "",
            port        : "",
            protocol    : "",
            username    : "",
            password    : "",
            path        : ""
        };
        var iThingId;
        var sUrl;
        var mThingIdInfo;
        var mThing;
        var fnSuccess;
        var fnWarning;
        var fnFail;
        
        //-- Variables to handle the concurrent calls to the OData service. --//
        var aConfigs        = [];
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            mThingIdInfo    = IomyRe.validation.isThingIDValid(mSettings.thingID);
            bError          = !mThingIdInfo.bIsValid;
            aErrorMessages  = mThingIdInfo.aErrorMessages;
            
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
            // OPTIONAL: Find the onWarning callback function
            //----------------------------------------------------------------//
            if (mSettings.onWarning === undefined) {
                fnWarning = function () {};
            } else {
                fnWarning = mSettings.onWarning;
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
        
        //-- Put the hub ID into the data. --//
        mData.hubID = IomyRe.functions.getHubConnectedToThing(iThingId).HubId;
        
        var oAjaxRequestQueue = new AjaxRequestQueue({
            executeNow              : false,
            concurrentRequests      : 4,
            
            onSuccess : function () {
                if (aErrorMessages.length > 0) {
                    fnWarning(mData, aErrorMessages.join("\n\n"));
                } else {
                    fnSuccess(mData);
                }
            },
            
            onWarning : function () {
                fnWarning(mData, aErrorMessages.join("\n\n"));
            },
            
            onFail : function () {
                fnFail(aErrorMessages.join("\n\n"));
            }
        });
        
        //--------------------------------------------------------------------//
        // Fetch the IO for the stream URL
        //--------------------------------------------------------------------//
        mThing = IomyRe.common.ThingList["_"+iThingId];
        
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
        // Prepare the requests.
        //--------------------------------------------------------------------//
        sUrl = IomyRe.apiodata.ODataLocation("datashortstring");
        
        aConfigs = [
            {
                "ID" : iNetAddrIO,
                "onSuccess" : function (response, data) {
                    mData.address = data[0].CALCEDVALUE;
                }
            },
            {
                "ID" : iNetPortIO,
                "onSuccess" : function (response, data) {
                    mData.port = data[0].CALCEDVALUE;
                }
            },
            {
                "ID" : iProtocolIO,
                "onSuccess" : function (response, data) {
                    mData.protocol = data[0].CALCEDVALUE;
                }
            },
            {
                "ID" : iPathIO,
                "onSuccess" : function (response, data) {
                    mData.path = data[0].CALCEDVALUE;
                }
            },
            {
                "ID" : iUsernameIO,
                "onSuccess" : function (response, data) {
                    mData.username = data[0].CALCEDVALUE;
                }
            },
            {
                "ID" : iPasswordIO,
                "onSuccess" : function (response, data) {
                    mData.password = data[0].CALCEDVALUE;
                }
            }
            
        ];
        
        //--------------------------------------------------------------------//
        // Compile the list of requests
        //--------------------------------------------------------------------//
        for (var i = 0; i < aConfigs.length; i++) {
            oAjaxRequestQueue.addRequest({
                library          : "odata",
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
        
        //--------------------------------------------------------------------//
        // Run them
        //--------------------------------------------------------------------//
        oAjaxRequestQueue.execute();
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
                mThingIDInfo = IomyRe.validation.isThingIDValid(mSettings.thingID);
                
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
        IomyRe.apiphp.AjaxRequest({
            url         : IomyRe.apiphp.APILocation("ipcamera"),
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
        var mAPIDataString               = {};
        var iThingId;
        var iLinkName;
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
                    mIPAddressResult = IomyRe.validation.isIPv4AddressValid(mSettings.ipAddress);

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
                        
                        mThingIdResult = IomyRe.validation.isThingIDValid(mSettings.thingID);
                        
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
            fnAppendError("File type must be specified.");
            fnAppendError("Hub ID must be specified.");
            fnAppendError("IP Address must be specified!");
            fnAppendError("Path to the stream must be specified.");
            
            throw new MissingSettingsMapException("* "+aErrorMessages.join("\n* "));
        }
        
        var mThing  = IomyRe.common.ThingList["_"+iThingId];
        iLinkName   = IomyRe.common.LinkList["_"+mThing.LinkId].LinkName;
        
        //----------------------------------------------------------------//
        // Prepare the 'Data' parameter string.
        //----------------------------------------------------------------//
        if (bEditing) {
            mAPIDataString.Mode = "EditIPCamera";
            mAPIDataString.ThingId = iThingId;
            //sMode = "Mode=EditIPCamera&ThingId="+iThingId;
        } else {
            mAPIDataString.Mode = "AddNewIPCamera";
            //sMode = "Mode=AddNewIPCamera";
        }

//        mAPIDataString += sMode+"&IPCamType="+sFileType+"&HubId="+iHubId;
//        mAPIDataString += "&Data={\"NetworkAddress\":\""+sIPAddress+"\",\"NetworkPort\":\""+sIPPort+"\",\"Protocol\":\""+sProtocol+"\",\"Path\":\""+sStreamPath+"\"";

//            if (bAuthenticationRequired) {
//                mAPIDataString += ",\"Username\":\""+sUsername+"\",\"Password\":\""+sPassword+"\"";
//            }
//        mAPIDataString += "}";
        
        mAPIDataString.IPCamType = sFileType;
        mAPIDataString.HubId = iHubId;
        mAPIDataString.Data = JSON.stringify({
            NetworkAddress  : sIPAddress,
            NetworkPort     : sIPPort,
            Protocol        : sProtocol,
            Path            : sStreamPath,
            LinkName        : iLinkName,
            DisplayName     : mThing.DisplayName
        });
        
//            if (bAuthenticationRequired) {
//                mAPIDataString.Username = sUsername;
//                mAPIDataString.Password = sPassword;
//            }

        //----------------------------------------------------------------//
        // Run the request
        //----------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest({
            "url"        : IomyRe.apiphp.APILocation("ipcamera"),
            "type"        : "POST",
            "data"        : mAPIDataString,

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
            title : IomyRe.common.ThingList["_"+iThingId].DisplayName,
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
    
    GetUITaskList : function (mSettings) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };
        
        aTasks.High.push({
            "Type":"Function", 
            "Execute": function () {
                IomyRe.devices.pingDevice({
                    thingID     : mSettings.deviceData.DeviceId,
                    onComplete  : mSettings.onComplete
                });
            }
        });
        
        return aTasks;
    }
    
});