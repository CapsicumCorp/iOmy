/*
Title: Onvif Camera Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Onvif stream entry, and other functionality
    pertaining to Onvif devices.
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

$.sap.declare("iomy.devices.onvif",true);
iomy.devices.onvif = new sap.ui.base.Object();

$.extend(iomy.devices.onvif,{
    
    aProfiles               : [],
    sProfileLookupErrors    : [],
    
    proceedToCreateItem     : true,
    
    LinkTypeId                : 6,
    ThingTypeId               : 12,
    
    RSStreamProfile         : 3970,
    RSStreamURL             : 3971,
    RSThumbnailProfile      : 3972,
    RSThumbnailURL          : 3973,
    RSPTZAxisX              : 3974,
    RSPTZAxisY              : 3975,
    
    getStreamURL : function(mSettings) {
        var me                = this;
        var bError            = false;
        var aErrorMessages    = [];
        var iIOId             = null;
        var iThingId;
        var sUrl;
        var mThingIdInfo;
        var mThing;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            mThingIdInfo    = iomy.validation.isThingIDValid(mSettings.ThingId);
            bError            = !mThingIdInfo.bIsValid;
            aErrorMessages    = mThingIdInfo.aErrorMessages;
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new ThingIDNotValidException("* "+aErrorMessages.join("\n* "));
            } else {
                iThingId = mSettings.ThingId;
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
            throw new MissingSettingsMapException("Thing ID must be given.");
        }
        
//        //--------------------------------------------------------------------//
//        // Check that the Thing ID passed the test. Throw an exception if not.
//        //--------------------------------------------------------------------//
//        if (bError) {
//            throw new ThingIDNotValidException(aErrorMessages.join("\n"));
//        }
        
        //--------------------------------------------------------------------//
        // Fetch the IO for the stream URL
        //--------------------------------------------------------------------//
        mThing = iomy.common.ThingList["_"+iThingId];
        
        $.each(mThing.IO, function (sIndex, mIO) {
            
            if (sIndex !== undefined && sIndex !== null && mIO !== undefined && mIO !== null) {
                if (mIO.RSTypeId === me.RSStreamURL) {
                    iIOId = mIO.Id;
                }
            }
            
        });
        
        if (iIOId === null) {
            throw new StreamURLNotFoundException();
        }
        
        //--------------------------------------------------------------------//
        // Run a request to fetch the URL
        //--------------------------------------------------------------------//
        sUrl = iomy.apiodata.ODataLocation("datamedstring");
        
        iomy.apiodata.AjaxRequest({
            Url                : sUrl,
            Columns            : ["CALCEDVALUE"],
            WhereClause        : ["IO_PK eq " + iIOId],
            OrderByClause    : [],
            
            onSuccess : function (response, data) {
                var mErrorInfo = {};
                
                if (data.length > 0 && data[0] !== undefined && data[0].CALCEDVALUE) {
                    // Parse the URL through the success callback function.
                    fnSuccess(data[0].CALCEDVALUE);
                } else {
                    mErrorInfo.status = -1;
                    mErrorInfo.responseText = "No Stream URL Found";
                    fnFail(mErrorInfo);
                }
            },
            
            onFail : function (response) {
                fnFail(response);
            }
        });
    },
    
    getThumbnailURL : function(mSettings) {
        var me                = this;
        var bError            = false;
        var aErrorMessages    = [];
        var iIOId             = null;
        var mRequest          = null;
        var bRunRequest       = true;
        var aUrlWhereClause   = [];
        var sUrlWhereClause   = "";
        var bCollectingUrl    = false;
        var iThingId;
        var sUrl;
        var mThingIdInfo;
        var mThing;
        var fnSuccess;
        var fnFail;
        
        //--------------------------------------------------------------------//
        // Check that all the parameters are there
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Find the hub ID
            //----------------------------------------------------------------//
            mThingIdInfo    = iomy.validation.isThingIDValid(mSettings.ThingId);
            bError            = !mThingIdInfo.bIsValid;
            aErrorMessages    = mThingIdInfo.aErrorMessages;
            
            //----------------------------------------------------------------//
            // Check for errors and throw an exception if there are errors.
            //----------------------------------------------------------------//
            if (bError) {
                throw new ThingIDNotValidException("* "+aErrorMessages.join("\n* "));
            } else {
                iThingId = mSettings.ThingId;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Run the request now, or simply return the request
            // data? (Default is to run it.
            //----------------------------------------------------------------//
            if (mSettings.runRequest !== undefined) {
                bRunRequest = mSettings.runRequest;
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
            throw new MissingSettingsMapException("Thing ID must be given.");
        }
        
//        //--------------------------------------------------------------------//
//        // Check that the Thing ID passed the test. Throw an exception if not.
//        //--------------------------------------------------------------------//
//        if (bError) {
//            throw new ThingIDNotValidException(aErrorMessages.join("\n"));
//        }
        
        //--------------------------------------------------------------------//
        // Fetch the IO for the thumbnail URL
        //--------------------------------------------------------------------//
        mThing = iomy.common.ThingList["_"+iThingId];
        
//        $.each(mThing.IO, function (sIndex, mIO) {
//            
//            if (sIndex !== undefined && sIndex !== null && mIO !== undefined && mIO !== null) {
//                if (mIO.RSTypeId === me.RSThumbnailURL) {
//                    iIOId = mIO.Id;
//                }
//            }
//            
//        });
//        
//        if (iIOId === null) {
//            throw new ThumbnailURLNotFoundException();
//        }
        
        // Prepare the filter statements for both OData requests
        $.each(mThing.IO, function(sI,mIO) {
            
            if (sI !== null && sI !== undefined && mIO !== null && mIO !== undefined) {
                if (bCollectingUrl) {
                    aUrlWhereClause.push("IO_PK eq "+mIO.Id);
                }
                
                bCollectingUrl = !bCollectingUrl;
            }
            
        });
        
        sUrlWhereClause = aUrlWhereClause.join(" or ");
        
        //--------------------------------------------------------------------//
        // Run a request to fetch the URL
        //--------------------------------------------------------------------//
        sUrl = iomy.apiodata.ODataLocation("datamedstring");
        mRequest = {
            Url             : sUrl,
            Columns         : ["DATAMEDSTRING_VALUE"],
            WhereClause     : [sUrlWhereClause],
            OrderByClause   : [],
            
            onSuccess : function (response, data) {
                var mErrorInfo = {};
                
                if (data.length > 0 && data[0] !== undefined && data[0].CALCEDVALUE) {
                    // Parse the URL through the success callback function.
                    fnSuccess(data[0].CALCEDVALUE);
                } else {
                    mErrorInfo.status = -1;
                    mErrorInfo.responseText = "No Thumbnail URL Found";
                    fnFail(mErrorInfo);
                }
            },
            
            onFail : function (response) {
                fnFail(response);
            }
        };
        
        if (bRunRequest) {
            iomy.apiodata.AjaxRequest(mRequest);
        }
        
        return mRequest;
    },
    
    loadStream : function (iThingId) {
        try {
            iomy.devices.onvif.getStreamURL({
                ThingId : iThingId,

                onSuccess : function(sUrl) {
                    iomy.widgets.showOnvifStreamPopup({
                        thingID         : iThingId,
                        url             : sUrl
                    });
                },

                onFail : function (response) {
                    iomy.common.showError(response.responseText, "Couldn't load the stream");
                }
            });

            //iomy.common.NavigationChangePage( "pOnvifSnapshot" , { "ThingId": mDevice.DeviceId, "Mode":"Player" } , false);


        } catch (ex) {
            iomy.common.showError(ex.message, "Couldn't load the stream");
        }
    },
    
    /**
     * Retrives a list of profiles within an Onvif server identified by its link
     * ID. A callback function must be used if you wish to retrieve the results.
     * 
     * @param {type} iLinkId            ID of the Onvif server
     * @param {type} fnCallback         Function called if successful
     * 
     * @throws IllegalArgumentException if the link ID is missing or invalid.
     * @throws MissingSettingsMapException if there are no parameters specified in a JSON array.
     */
    LookupProfiles : function(mSettings) {
        var me = this;
        var bError = false;
        var iLinkId;
        var fnFailCallback;
        var fnSuccessCallback;
        
        //---------------------------------------------------------------//
        // Check that both the link ID and callback functions are given. //
        //---------------------------------------------------------------//
        if (mSettings !== undefined || mSettings !== null) {
            if (mSettings.linkID === undefined || isNaN(mSettings.linkID)) {
                throw new IllegalArgumentException("Link ID (linkID) must be given and be a valid number.");
            } else {
                iLinkId = mSettings.linkID;
            }

            if (mSettings.onFail === undefined) {
                fnFailCallback = function () {};
            } else {
                fnFailCallback = mSettings.onFail;
            }

            if (mSettings.onSuccess === undefined) {
                fnSuccessCallback = function () {};
            } else {
                fnSuccessCallback = mSettings.onSuccess;
            }
            
        } else {
            throw new MissingSettingsMapException("Link ID (linkID) must be given and be a valid number.");
        }
        
        // If all went well...
        if (bError === false) {
            //------------------------------------------------------------//
            // Call the API to collect the profiles from an Onvif server. //
            //------------------------------------------------------------//
            var sUrl = iomy.apiphp.APILocation("onvif");
            var sMode = "LookupProfiles";

            iomy.apiphp.AjaxRequest({
                url: sUrl,
                data: {
                    "Mode" : sMode,
                    "LinkId" : iLinkId
                },

                onSuccess : function (status, response) {
                    // Call the callback function if one is defined.
                    fnSuccessCallback(response.Data);
                },

                onFail : function (response) {
                    jQuery.sap.log.error(response.responseText);
                    me.sProfileLookupErrors = response.responseText;
                    
                    // Call the fail callback function if one is defined.
                    fnFailCallback(response);
                }
            });
        }
        
    },
    
    //------------------------------------------------------------------------//
    // Create the PTZ control functionality
    //------------------------------------------------------------------------//
    PTZMove : function (mSettings) {
        var bError          = false;
        var aErrorMessages  = [];
        var iPosX;
        var iPosY;
        var iThingId;
        var sProfileName;
        var mThingIdInfo;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sMessage) {
            bError = true;
            aErrorMessages.push(sMessage);
        };
        
        if (mSettings !== undefined) {
            
            mThingIdInfo = iomy.validation.isThingIDValid(mSettings.thingID)
            if (mThingIdInfo.bIsValid) {
                iThingId = mSettings.thingID;
            } else {
                bError          = true;
                aErrorMessages  = mThingIdInfo.aErrorMessages;
            }
            
            if (mSettings.xpos !== undefined) {
                iPosX = parseInt(mSettings.xpos);
            } else {
                iPosX = 0;
            }
            
            if (mSettings.ypos !== undefined) {
                iPosY = parseInt(mSettings.ypos);
            } else {
                iPosY = 0;
            }
            
            if (iPosX === 0 && iPosY === 0) {
                fnAppendError("X and Y positions are not set to change.");
            }
            
            if (mSettings.profileName !== undefined) {
                sProfileName = mSettings.profileName;
            } else {
                fnAppendError("Profile name has not been given.");
            }
            
            if (mSettings.onSuccess !== undefined) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
        } else {
            throw new MissingSettingsMapException("Parameters are required. (profileName, xpos and/or ypos, thingID)");
        }

        try {
            iomy.apiphp.AjaxRequest({
                url : iomy.apiphp.APILocation("onvif"),
                data : {
                    Mode : "PTZTimedMove",
                    ProfileName : sProfileName,
                    PosX : iPosX, PosY : iPosY,
                    ThingId : iThingId
                },

                onSuccess : function (data) {
                    if (data.Error) {
                        fnFail(data.ErrMesg);
                    } else {
                        fnSuccess();
                    }
                },
                
                onFail : function (response) {
                    fnFail(response.responseText);
                }
            });

        } catch (ePTZError) {
            fnFail(ePTZError.message);
        }
    },
    
    showSnapshot : function (iThingId, oCallingButton, oPage) {
        var oRPopover = new sap.m.ResponsivePopover({
            title : iomy.common.ThingList["_"+iThingId].DisplayName,
            content : [
                iomy.common.showLoading({
                    "show" : true,
                    "text" : "Fetching Snapshot...",
                    "context" : oPage
                }),
                    
                new sap.m.Image({
                    densityAware : false,
                    alt : "Failed to acquire snapshot",
                    src : iomy.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+iThingId,
                    width: "100%",
                    
                    load : function () {
                        iomy.common.showLoading({
                            "show" : false,
                            "context" : oPage
                        });
                    },
                    
                    error : function () {
                        this.destroy();
                        
                        iomy.common.showLoading({
                            "show" : false,
                            "context" : oPage
                        });
                        
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
                    }
                })
            ]
        });
        
        oRPopover.openBy(oCallingButton);
    },
    
    getListOfOnvifStreams : function () {
        var aStreams = [];
        
        try {
            $.each(iomy.common.ThingList, function (sI, mThing) {
                if (mThing.TypeId == iomy.devices.onvif.ThingTypeId) {
                    aStreams.push({
                        ThingId     : mThing.Id,
                        ThingName   : mThing.DisplayName
                    });
                }
            });
            
        } catch (e) {
            $.sap.log.error("Failed to retrieve a list of Onvif streams ("+e.name+"): " + e.message);
        }
        
        return aStreams;
    },
    
    GetUITaskList : function (mSettings) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        //var oModule         = this;
        var aTasks          = { "High":[], "Low":[] };
        
        try {
            if (mSettings === undefined || mSettings === null) {
                throw new MissingSettingsMapException("Task data was not given (mSettings).");
            }
            
            aTasks.High.push({
                "Type":"Function", 
                "Execute": function () {
                    try {
                        iomy.devices.pingDevice({
                            thingID     : mSettings.deviceData.DeviceId,
                            onComplete  : mSettings.onComplete
                        });
                    } catch (e) {
                        $.sap.log.error("Failed to run iomy.devices.pingDevice() ("+e.name+"): " + e.message);
                        mSettings.onComplete("N/A");
                    }
                }
            });
        } catch (e) {
            $.sap.log.error("Failed to add an Onvif stream task ("+e.name+"): " + e.message);
            mSettings.onComplete("N/A");
            
        } finally {
            return aTasks;
        }
    }
});