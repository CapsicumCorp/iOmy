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
    
    RSDisabledPTZControls   : 3968,
    RSStreamAuthRequired    : 3969,
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
    
    saveStreamInformation : function (mSettings) {
        var iLinkId             = 0;
        var iThingId            = 0;
        var mThing              = {};
        var aErrorMessages      = [];
        var sDisplayName        = "";
        var sStreamProfile      = "";
        var sThumbnailProfile   = "";
        var sAPIMode            = "";
        var mAPIData            = {};
        var iAuthType           = 0;        // No authentication is default.
        var sStreamUsername     = "";
        var sStreamPassword     = "";
        
        var fnSuccess       = function () {};
        var fnFail          = function () {};
        
        var sNoLinkIdMessage  = "Link ID must be specified for adding a stream.";
        var sNoThingIdMessage = "Thing ID must be specified for editing a stream.";
        
        try {
            //------------------------------------------------------------------------------//
            // Process the settings map if it's there.
            //------------------------------------------------------------------------------//
            if (iomy.validation.isValueGiven(mSettings)) {
                mThing = iomy.common.ThingList["_"+iThingId];

                //------------------------------------------------------------------------------//
                // See if the link ID is given. If so, then we are adding a stream.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.linkID )) {
                    iLinkId = mSettings.linkID;
                    sAPIMode = "NewThing";
                    
                    //------------------------------------------------------------------------------//
                    // Check that the link ID is valid.
                    //------------------------------------------------------------------------------//
                    var mLinkIdValidation = iomy.validation.isLinkIDValid(iLinkId);

                    if (!mLinkIdValidation.bIsValid) {
                        aErrorMessages = aErrorMessages.concat( mLinkIdValidation.aErrorMessages );
                    }
                    
                } else {
                    //------------------------------------------------------------------------------//
                    // Otherwise, see if the thing ID is given. For editing a stream this is required.
                    //------------------------------------------------------------------------------//
                    if (iomy.validation.isValueGiven( mSettings.thingID )) {
                        iThingId = mSettings.thingID;
                        sAPIMode = "ChangeThingProfiles";

                        //------------------------------------------------------------------------------//
                        // Check that the thing ID is valid.
                        //------------------------------------------------------------------------------//
                        var mThingIdValidation = iomy.validation.isThingIDValid(iThingId);

                        if (!mThingIdValidation.bIsValid) {
                            aErrorMessages = aErrorMessages.concat( mThingIdValidation.aErrorMessages );
                        }

                    } else {
                        aErrorMessages.push(sNoThingIdMessage);
                    }
                }
                
                //------------------------------------------------------------------------------//
                // Check that the display name is given.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.displayName )) {
                    sDisplayName = mSettings.displayName;
                } else {
                    aErrorMessages.push("The display name for the stream must be given.");
                }
                
                //------------------------------------------------------------------------------//
                // Check that the stream profile is given.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.streamProfile )) {
                    sStreamProfile = mSettings.streamProfile;
                } else {
                    aErrorMessages.push("Stream profile needs to be specified.");
                }

                //------------------------------------------------------------------------------//
                // Check that the thumbnail profile is given.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.streamProfile )) {
                    sThumbnailProfile = mSettings.thumbnailProfile;
                } else {
                    aErrorMessages.push("Thumbnail profile needs to be specified.");
                }

                //------------------------------------------------------------------------------//
                // Read the authentication type of the stream. 0 is the default (No Auth).
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.authType )) {
                    iAuthType = mSettings.authType;

                    //------------------------------------------------------------------------------//
                    // If stream authentication is selected, make sure its username and password are
                    // given.
                    //------------------------------------------------------------------------------//
                    if (iAuthType === 2) {
                        if (iomy.validation.isValueGiven( mSettings.streamUsername )) {
                            sStreamUsername = mSettings.streamUsername;
                        } else {
                            aErrorMessages.push("Stream username is required.");
                        }

                        if (iomy.validation.isValueGiven( mSettings.streamPassword )) {
                            sStreamPassword = mSettings.streamPassword;
                        } else {
                            aErrorMessages.push("Stream password is required.");
                        }
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a success callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onSuccess)) {
                    if (iomy.validation.isFunction(mSettings.onSuccess)) {
                        fnSuccess = mSettings.onSuccess;
                        
                    } else {
                        aErrorMessages.push("onSuccess is not a function. Found " + typeof mSettings.onSuccess);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a failure callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onFail)) {
                    if (iomy.validation.isFunction(mSettings.onFail)) {
                        fnFail = mSettings.onFail;
                        
                    } else {
                        aErrorMessages.push("onFail is not a function. Found " + typeof mSettings.onFail);
                    }
                }
                
            } else {
                aErrorMessages.push(sNoLinkIdMessage);
                aErrorMessages.push(sNoThingIdMessage);
            }

            if (aErrorMessages.length > 0) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
            //------------------------------------------------------------------------------//
            // Attempt to save the data.
            //------------------------------------------------------------------------------//
            mAPIData = {
                "Mode" : sAPIMode,
                "CameraName" : sDisplayName,
                "StreamProfile" : sStreamProfile,
                "ThumbnailProfile" : sThumbnailProfile
            };
            
            switch (sAPIMode) {
                case "NewThing" :
                    mAPIData.LinkId = iLinkId;
                    break;
                    
                case "ChangeThingProfiles" :
                    mAPIData.ThingId = iThingId;
                    break;
            }
            
            if (iAuthType === 2) {
                mAPIData.StreamAuth = JSON.stringify({
                    "AuthType" : iAuthType,
                    "Username" : sStreamUsername,
                    "Password" : sStreamPassword
                });
            } else {
                mAPIData.StreamAuth = JSON.stringify({
                    "AuthType" : iAuthType
                });
            }
            
            iomy.apiphp.AjaxRequest({
                url : iomy.apiphp.APILocation("onvif"),
                data : mAPIData,
                
                onSuccess : function (sType, mData) {
                    try {
                        if (sType === "JSON") {
                            if (mData.Error === true) {
                                $.sap.log.error(mData.ErrMesg);
                                fnFail(mData.ErrMesg);
                                
                            } else {
                                fnSuccess(mData);
                            }
                        } else {
                            fnFail("API returned " + sType + " saveStreamInformation(), expected JSON.");
                        }
                    } catch (e) {
                        fnFail("Failure in the success callback in saveStreamInformation() ("+e.name+"): " + e.message);
                    }
                },
                
                onFail : function (response) {
                    fnFail(response.responseText);
                }
            });
            
        } catch (e) {
            fnFail("Error occurred in saveStreamInformation ("+e.name+"): " + e.message);
        }
    },
    
    changeStreamAuthMethod : function (mSettings) {
        var iThingId            = 0;
        var aErrorMessages      = [];
        var mAPIData            = {};
        var iAuthType           = 0;        // No authentication is default.
        var sStreamUsername     = "";
        var sStreamPassword     = "";
        
        var fnSuccess   = function () {};
        var fnFail      = function () {};
        var fnComplete  = function () {};
        
        var sNoThingIdMessage = "Thing ID must be specified for editing a stream.";
        
        try {
            if (iomy.validation.isValueGiven(mSettings)) {
                //------------------------------------------------------------------------------//
                // Otherwise, see if the thing ID is given. For editing a stream this is required.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.thingID )) {
                    iThingId = mSettings.thingID;

                    //------------------------------------------------------------------------------//
                    // Check that the thing ID is valid.
                    //------------------------------------------------------------------------------//
                    var mThingIdValidation = iomy.validation.isThingIDValid(iThingId);

                    if (!mThingIdValidation.bIsValid) {
                        aErrorMessages = aErrorMessages.concat( mThingIdValidation.aErrorMessages );
                    }

                } else {
                    aErrorMessages.push(sNoThingIdMessage);
                }

                //------------------------------------------------------------------------------//
                // Read the authentication type of the stream. 0 is the default (No Auth).
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.authType )) {
                    iAuthType = mSettings.authType;

                    //------------------------------------------------------------------------------//
                    // If stream authentication is selected, make sure its username and password are
                    // given.
                    //------------------------------------------------------------------------------//
                    if (iAuthType === 2) {
                        if (iomy.validation.isValueGiven( mSettings.streamUsername )) {
                            sStreamUsername = mSettings.streamUsername;
                        } else {
                            aErrorMessages.push("Stream username is required.");
                        }

//                        if (iomy.validation.isValueGiven( mSettings.streamPassword )) {
//                            sStreamPassword = mSettings.streamPassword;
//                        } else {
//                            aErrorMessages.push("Stream password is required.");
//                        }
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a success callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onSuccess)) {
                    if (iomy.validation.isFunction(mSettings.onSuccess)) {
                        fnSuccess = mSettings.onSuccess;
                        
                    } else {
                        aErrorMessages.push("onSuccess is not a function. Found " + typeof mSettings.onSuccess);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a failure callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onFail)) {
                    if (iomy.validation.isFunction(mSettings.onFail)) {
                        fnFail = mSettings.onFail;
                        
                    } else {
                        aErrorMessages.push("onFail is not a function. Found " + typeof mSettings.onFail);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a completed callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onComplete)) {
                    if (iomy.validation.isFunction(mSettings.onComplete)) {
                        fnComplete = mSettings.onComplete;
                        
                    } else {
                        aErrorMessages.push("onComplete is not a function. Found " + typeof mSettings.onComplete);
                    }
                }
            }
            
            //------------------------------------------------------------------------------//
            // Attempt to save the data.
            //------------------------------------------------------------------------------//
            mAPIData = {
                "Mode" : "ChangeStreamAuth",
                "ThingId" : iThingId
            };
            
            if (iAuthType === 2) {
                mAPIData.StreamAuth = JSON.stringify({
                    "AuthType" : iAuthType,
                    "Username" : sStreamUsername,
                    "Password" : sStreamPassword
                });
            } else {
                mAPIData.StreamAuth = JSON.stringify({
                    "AuthType" : iAuthType
                });
            }
            
            iomy.apiphp.AjaxRequest({
                url : iomy.apiphp.APILocation("onvif"),
                data : mAPIData,
                
                onSuccess : function (sType, mData) {
                    try {
                        if (sType === "JSON") {
                            if (mData.Error === true) {
                                $.sap.log.error(mData.ErrMesg);
                                fnFail(mData.ErrMesg);
                                fnComplete();
                                
                            } else {
                                fnSuccess(mData);
                                fnComplete();
                            }
                        } else {
                            fnFail("API returned " + sType + " changeStreamAuthMethod(), expected JSON.");
                            fnComplete();
                        }
                    } catch (e) {
                        fnFail("Failure in the success callback in changeStreamAuthMethod() ("+e.name+"): " + e.message);
                        fnComplete();
                    }
                },
                
                onFail : function (response) {
                    fnFail(response.responseText);
                    fnComplete();
                }
            });
        } catch (e) {
            fnFail("Error occurred in changeStreamAuthMethod ("+e.name+"): " + e.message);
        }
    },
    
    togglePTZControls : function (mSettings) {
        var iThingId            = 0;
        var aErrorMessages      = [];
        var mAPIData            = {};
        var iEnabled            = 0;
        
        var fnSuccess   = function () {};
        var fnFail      = function () {};
        var fnComplete  = function () {};
        
        var sNoThingIdMessage = "Thing ID must be specified for editing a stream.";
        
        try {
            if (iomy.validation.isValueGiven(mSettings)) {
                //------------------------------------------------------------------------------//
                // Otherwise, see if the thing ID is given. For editing a stream this is required.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.thingID )) {
                    iThingId = mSettings.thingID;

                    //------------------------------------------------------------------------------//
                    // Check that the thing ID is valid.
                    //------------------------------------------------------------------------------//
                    var mThingIdValidation = iomy.validation.isThingIDValid(iThingId);

                    if (!mThingIdValidation.bIsValid) {
                        aErrorMessages = aErrorMessages.concat( mThingIdValidation.aErrorMessages );
                    }

                } else {
                    aErrorMessages.push(sNoThingIdMessage);
                }

                //---------------------------------------------------------------------------//
                // Check that the new state is present.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.disabled)) {
                    if (iomy.validation.isBoolean(mSettings.disabled)) {
                        if (mSettings.disabled) {
                            iEnabled = 1;
                        } else {
                            iEnabled = 0;
                        }
                        
                    } else if (iomy.validation.isNumber(mSettings.disabled)) {
                        if (mSettings.disabled < 0 || mSettings.disabled > 1) {
                            iEnabled = 0;
                            $.sap.log.error("enabled was not 0 or 1. Defaulting to disabled (0).");
                        } else {
                            iEnabled = mSettings.disabled;
                        }
                        
                    } else {
                        aErrorMessages.push("enabled is not a boolean. Found " + typeof mSettings.disabled);
                    }
                } else {
                    aErrorMessages.push("Whether the PTZ controls are enabled or not should be specified.");
                }
                
                //---------------------------------------------------------------------------//
                // If there is a success callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onSuccess)) {
                    if (iomy.validation.isFunction(mSettings.onSuccess)) {
                        fnSuccess = mSettings.onSuccess;
                        
                    } else {
                        aErrorMessages.push("onSuccess is not a function. Found " + typeof mSettings.onSuccess);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a failure callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onFail)) {
                    if (iomy.validation.isFunction(mSettings.onFail)) {
                        fnFail = mSettings.onFail;
                        
                    } else {
                        aErrorMessages.push("onFail is not a function. Found " + typeof mSettings.onFail);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a completed callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onComplete)) {
                    if (iomy.validation.isFunction(mSettings.onComplete)) {
                        fnComplete = mSettings.onComplete;
                        
                    } else {
                        aErrorMessages.push("onComplete is not a function. Found " + typeof mSettings.onComplete);
                    }
                }
            }
            
            //------------------------------------------------------------------------------//
            // Attempt to save the data.
            //------------------------------------------------------------------------------//
            mAPIData = {
                "Mode" : "ChangeUIPTZControls",
                "ThingId" : iThingId,
                "NewUIControlValue" : iEnabled
            };
            
            iomy.apiphp.AjaxRequest({
                url : iomy.apiphp.APILocation("onvif"),
                data : mAPIData,
                
                onSuccess : function (sType, mData) {
                    try {
                        if (sType === "JSON") {
                            if (mData.Error === true) {
                                $.sap.log.error(mData.ErrMesg);
                                fnFail(mData.ErrMesg);
                                fnComplete();
                                
                            } else {
                                fnSuccess(mData);
                                fnComplete();
                            }
                        } else {
                            fnFail("API returned " + sType + " in togglePTZControls(), expected JSON.");
                            fnComplete();
                        }
                    } catch (e) {
                        fnFail("Failure in the success callback in togglePTZControls() ("+e.name+"): " + e.message);
                        fnComplete();
                    }
                },
                
                onFail : function (response) {
                    fnFail(response.responseText);
                    fnComplete();
                }
            });
        } catch (e) {
            fnFail("Error occurred in togglePTZControls() ("+e.name+"): " + e.message);
            fnComplete();
        }
    },
    
    loadStreamAuthMethod : function (mSettings) {
        var iThingId        = null;
        var iIOId           = null;
        var mThing          = {};
        var aErrorMessages  = [];
        var fnSuccess       = function () {};
        var fnFail          = function () {};
        var fnComplete      = function () {};
        
        var sNoThingIdMessage = "Thing ID must be specified for loading stream authentication settings.";
        
        try {
            if (iomy.validation.isValueGiven(mSettings)) {
                //------------------------------------------------------------------------------//
                // Otherwise, see if the thing ID is given. For editing a stream this is required.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.thingID )) {
                    iThingId = mSettings.thingID;

                    //------------------------------------------------------------------------------//
                    // Check that the thing ID is valid.
                    //------------------------------------------------------------------------------//
                    var mThingIdValidation = iomy.validation.isThingIDValid(iThingId);

                    if (!mThingIdValidation.bIsValid) {
                        aErrorMessages = aErrorMessages.concat( mThingIdValidation.aErrorMessages );
                    } else {
                        mThing = iomy.common.ThingList["_"+iThingId];
                    }

                } else {
                    aErrorMessages.push(sNoThingIdMessage);
                }

                //---------------------------------------------------------------------------//
                // If there is a success callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onSuccess)) {
                    if (iomy.validation.isFunction(mSettings.onSuccess)) {
                        fnSuccess = mSettings.onSuccess;
                        
                    } else {
                        aErrorMessages.push("onSuccess is not a function. Found " + typeof mSettings.onSuccess);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a failure callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onFail)) {
                    if (iomy.validation.isFunction(mSettings.onFail)) {
                        fnFail = mSettings.onFail;
                        
                    } else {
                        aErrorMessages.push("onFail is not a function. Found " + typeof mSettings.onFail);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a completed callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onComplete)) {
                    if (iomy.validation.isFunction(mSettings.onComplete)) {
                        fnComplete = mSettings.onComplete;
                        
                    } else {
                        aErrorMessages.push("onComplete is not a function. Found " + typeof mSettings.onComplete);
                    }
                }
                
            } else {
                aErrorMessages.push(sNoThingIdMessage);
            }
            
            if (aErrorMessages.length > 0) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
            //--------------------------------------------------------------------------------//
            // Find the stream auth IO.
            //--------------------------------------------------------------------------------//
            $.each(mThing.IO, function (sI, mIO) {
                if (mIO.RSTypeId == iomy.devices.onvif.RSStreamAuthRequired) {
                    iIOId = mIO.Id;
                    return false;
                }
            });
            
            //--------------------------------------------------------------------------------//
            // Run the OData request if the IO is found.
            //--------------------------------------------------------------------------------//
            if (iIOId !== null) {
                iomy.apiodata.AjaxRequest({
                    Url             : iomy.apiodata.ODataLocation("dataint"),
                    Columns         : ["CALCEDVALUE"],
                    WhereClause     : ["IO_PK eq " + iIOId],
                    OrderByClause   : ["UTS desc"],
                    
                    onSuccess : function (responseType, data) {
                        try {
                            if (responseType === "JSON") {
                                if (data.length > 0 && data[0] !== undefined && data[0].CALCEDVALUE !== null && data[0].CALCEDVALUE !== undefined) {
                                    // Parse the stream authentication type ID through the success callback function.
                                    fnSuccess(data[0].CALCEDVALUE);
                                    fnComplete();
                                } else {
                                    $.sap.log.error("Value found upon error: " + data[0].CALCEDVALUE);
                                    $.sap.log.error(JSON.stringify(data));
                                    fnFail("Cannot find the stream auth settings.");
                                    fnComplete();
                                }
                            } else {
                                fnFail("API returned " + responseType + " in loadStreamAuthMethod(), expected JSON.");
                                fnComplete();
                            }
                            
                        } catch (e) {
                            fnFail("Failure in the success callback in loadStreamAuthMethod() ("+e.name+"): " + e.message);
                            fnComplete();
                        }
                    },
            
                    onFail : function (response) {
                        fnFail(response);
                        fnComplete();
                    }
                });
                
            } else {
                fnFail("Cannot retrieve the stream auth settings.");
                fnComplete();
            }
            
        } catch (e) {
            fnFail(e.message);
            fnComplete();
        }
    },
    
    loadPTZControlStatus : function (mSettings) {
        var iThingId        = null;
        var iIOId           = null;
        var mThing          = {};
        var aErrorMessages  = [];
        var fnSuccess       = function () {};
        var fnFail          = function () {};
        var fnComplete      = function () {};
        
        var sNoThingIdMessage = "Thing ID must be specified for finding out whether the PTZ controls are disabled or not.";
        
        try {
            if (iomy.validation.isValueGiven(mSettings)) {
                //------------------------------------------------------------------------------//
                // Otherwise, see if the thing ID is given. For editing a stream this is required.
                //------------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven( mSettings.thingID )) {
                    iThingId = mSettings.thingID;

                    //------------------------------------------------------------------------------//
                    // Check that the thing ID is valid.
                    //------------------------------------------------------------------------------//
                    var mThingIdValidation = iomy.validation.isThingIDValid(iThingId);

                    if (!mThingIdValidation.bIsValid) {
                        aErrorMessages = aErrorMessages.concat( mThingIdValidation.aErrorMessages );
                    } else {
                        mThing = iomy.common.ThingList["_"+iThingId];
                    }

                } else {
                    aErrorMessages.push(sNoThingIdMessage);
                }

                //---------------------------------------------------------------------------//
                // If there is a success callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onSuccess)) {
                    if (iomy.validation.isFunction(mSettings.onSuccess)) {
                        fnSuccess = mSettings.onSuccess;
                        
                    } else {
                        aErrorMessages.push("onSuccess is not a function. Found " + typeof mSettings.onSuccess);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a failure callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onFail)) {
                    if (iomy.validation.isFunction(mSettings.onFail)) {
                        fnFail = mSettings.onFail;
                        
                    } else {
                        aErrorMessages.push("onFail is not a function. Found " + typeof mSettings.onFail);
                    }
                }
                
                //---------------------------------------------------------------------------//
                // If there is a completed callback defined, use it after making sure it's a
                // function.
                //---------------------------------------------------------------------------//
                if (iomy.validation.isValueGiven(mSettings.onComplete)) {
                    if (iomy.validation.isFunction(mSettings.onComplete)) {
                        fnComplete = mSettings.onComplete;
                        
                    } else {
                        aErrorMessages.push("onComplete is not a function. Found " + typeof mSettings.onComplete);
                    }
                }
                
            } else {
                aErrorMessages.push(sNoThingIdMessage);
            }
            
            if (aErrorMessages.length > 0) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
            //--------------------------------------------------------------------------------//
            // Find the stream auth IO.
            //--------------------------------------------------------------------------------//
            $.each(mThing.IO, function (sI, mIO) {
                if (mIO.RSTypeId == iomy.devices.onvif.RSDisabledPTZControls) {
                    iIOId = mIO.Id;
                    return false;
                }
            });
            
            //--------------------------------------------------------------------------------//
            // Run the OData request if the IO is found.
            //--------------------------------------------------------------------------------//
            if (iIOId !== null) {
                iomy.apiodata.AjaxRequest({
                    Url             : iomy.apiodata.ODataLocation("datatinyint"),
                    Columns         : ["CALCEDVALUE"],
                    WhereClause     : ["IO_PK eq " + iIOId],
                    OrderByClause   : ["UTS desc"],
                    
                    onSuccess : function (responseType, data) {
                        try {
                            var iState = 0;
                            
                            if (responseType === "JSON") {
                                if (data.length > 0 && data[0] !== undefined && data[0].CALCEDVALUE !== null && data[0].CALCEDVALUE !== undefined) {
                                    // Save the state from the database.
                                    iState = data[0].CALCEDVALUE;
                                    
                                } else {
                                    // The IO was not found, print a warning that it is assumed that the controls are enabled.
                                    $.sap.log.error(JSON.stringify(data));
                                    $.sap.log.error("PTZ control status not found. Assuming that it's enabled.");
                                }
                                
                                fnSuccess(iState);
                                fnComplete();
                            } else {
                                fnFail("API returned " + responseType + " in loadPTZControlStatus(), expected JSON.");
                                fnComplete();
                            }
                            
                        } catch (e) {
                            fnFail("Failure in the success callback in loadPTZControlStatus() ("+e.name+"): " + e.message);
                            fnComplete();
                        }
                    },
            
                    onFail : function (response) {
                        fnFail(response);
                        fnComplete();
                    }
                });
                
            } else {
                fnFail("Cannot retrieve the PTZ control disabled status.");
                fnComplete();
            }
            
        } catch (e) {
            fnFail(e.message);
            fnComplete();
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