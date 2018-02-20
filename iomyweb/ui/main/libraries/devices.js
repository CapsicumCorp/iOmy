/*
Title: Devices Module for iOmy
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Helps to draw the list entry of a device and its information. Used
    as a wrapper for a variety of modules for each device type, which follow a
    similar structure to this module such as same function names to this one.
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

$.sap.declare("iomy.devices",true);
iomy.devices = new sap.ui.base.Object();

/**
 * This global module provides a mechanism to draw a device entry in lists such as
 * Device Overview, and Room Overview. Each entry will display information about
 * the device, or otherwise item, whether it's on or off, it varies between each
 * device type.
 * 
 * There are also functions for validation and status that pertain to all types
 * of devices.
 */
$.extend(iomy.devices,{
    Devices: [],
    
    iODataFieldsToFetch                : 0,
    bWaitingToLoadAPI                : false,
    bLoadingFieldsFromAPI            : false,
    bLoadingFieldsFromOData            : false,
    
    /**
     * Returns the current on/off status of a given device in the form of "On"
     * or "Off".
     * 
     * @param {type} iThingId               ID of the device.
     * @returns {String} Human-readable status
     */
    GetDeviceStatus : function (iThingId) {
        var sStatus;
        var iStatus = iomy.common.ThingList["_"+iThingId].Status;
        
        if (iStatus === 1) {
            sStatus = "On";
        } else if (iStatus === 0) {
            sStatus = "Off";
        }
        
        return sStatus;
    },
    
    /**
     * Turns a device on or off. The settings map takes the following
     * required parameters:
     * 
     * thingID:         ID of the device to switch on or off.
     * 
     * Optional Parameters:
     * 
     * onSuccess:       Function to run if successful.
     * onFail:          Function to run after an error occurs.
     * 
     * @param {type} mSettings          The parameters
     */
    RunSwitch : function (mSettings) {
        var mThingIdInfo;
        var iThingId;
        var fnSuccess;
        var fnFail;
        
        var sThingIDMissing = "Thing ID must be given.";
        
        //--------------------------------------------------------------------//
        // Fetch the Thing ID and the onSuccess and onFail callbacks.
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
                throw new MissingArgumentException(sThingIDMissing);
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            throw new MissingSettingsMapException(sThingIDMissing);
        }

        try {
            //--------------------------------------------------------------------//
            // Run the AJAX request to switch on or off.
            //--------------------------------------------------------------------//
            iomy.apiphp.AjaxRequest({
                url: iomy.apiphp.APILocation("statechange"),
                type: "POST",
                data: { 
                    "Mode":"ThingToggleStatus", 
                    "Id": iThingId
                },
                onFail : function(response) {

                    fnFail(response.responseText);

                },
                onSuccess : function( sExpectedDataType, aAjaxData ) {
                    try {
                        if (aAjaxData.Error !== true) {
                            if( aAjaxData.ThingStatus!==undefined && aAjaxData.ThingStatus!==null ) {
                                iomy.common.ThingList["_"+iThingId].Status = aAjaxData.ThingStatus;
                            }
                            fnSuccess(aAjaxData.ThingStatus);
                        } else {
                            fnFail(aAjaxData.ErrMesg);
                        }
                    } catch (e1) {
                        jQuery.sap.log.error("An error has occured within the RunSwitch Ajax Request onSuccess: "+e1.message);
                    }
                }
            });
            
        } catch (e) {
            var sErrMesg = "Error attempting to switch a device on or off (ID: "+iThingId+") ("+e.name+"): " + e.message
            $.sap.log.error(sErrMesg);
            fnFail(sErrMesg);
        }
    },
    
    /**
     * Returns a map of the link a thing (specified by its ID) is connected to.
     * 
     * @param {type} iThingId        ID of the thing
     * @returns {object}             Link referenced by its thing/item
     */
    GetLinkOfThing : function(iThingId) {
        var iLinkId = iomy.common.ThingList["_"+iThingId].LinkId;
        var oLink = null;
        
        try {
            // Using the Link List found in common because the scope is global.
            if (iomy.common.LinkList["_"+iLinkId] !== undefined) {
                oLink = iomy.common.getLink(iLinkId);
            }
            return oLink;
        
        } catch (e1) {
            jQuery.sap.log.error("An error has occured within GetLinkOfThing: "+e1.message);
            return null;
        }
        
    },
    
    /**
     * Performs an AJAX request to assign a given device to a given room.
     * 
     * Required parameters:
     * 
     * thingID OR linkID:       Takes either the thing ID (preferred) or link ID to indicate which link to move.
     * roomID:                  The ID of the room to move the device to.
     * 
     * Optional parameters:
     * 
     * onSuccess:       Function to run after a successful execution.
     * onFail:          Function to run after an error is encountered.
     * 
     * @param {type} mSettings
     */
    AssignDeviceToRoom : function (mSettings) {
        //------------------------------------------------------------//
        // Declare variables
        //------------------------------------------------------------//
        var bError            = false;
        var aErrorMessages    = [];
        var sUrl              = iomy.apiphp.APILocation("link");
        var iLinkId;
        var iRoomId;
        var mDeviceIDInfo;
        var mRoomIDInfo;
        var fnSuccess;
        var fnFail;
        
        var sDeviceIDMissing    = "Thing (thingID) or Link (linkID) must be specified!";
        var sRoomIDMissing      = "Room ID (roomID) must be specified!";
        
        //--------------------------------------------------------------------//
        // Read the settings map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Either a valid Thing ID to get the link ID, or the
            // Link ID itself.
            //----------------------------------------------------------------//
            if (mSettings.thingID !== undefined) {
                mDeviceIDInfo = iomy.validation.isThingIDValid(mSettings.thingID);
                
                bError            = !mDeviceIDInfo.bIsValid;
                aErrorMessages    = aErrorMessages.concat(mDeviceIDInfo.aErrorMessages);
                
                if (!bError) {
                    iLinkId = iomy.common.ThingList["_"+mSettings.thingID].LinkId;
                }
            } else {
                if (mSettings.linkID !== undefined) {
//                    mDeviceIDInfo = iomy.validation.isLinkIDValid(mSettings.linkID);
//                
//                    bError            = !mDeviceIDInfo.bIsValid;
//                    aErrorMessages    = aErrorMessages.concat(mDeviceIDInfo.aErrorMessages);
//                    
//                    if (!bError) {
                        iLinkId = mSettings.linkID;
//                    }
                } else {
                    fnAppendError(sDeviceIDMissing);
                }
            }
            
            if (bError) {
                throw new IllegalArgumentException( aErrorMessages.join("\n") );
            }
            
            //----------------------------------------------------------------//
            // Valid Room ID
            //----------------------------------------------------------------//
            if (mSettings.roomID !== undefined) {
                //-- Room ID --//
                mRoomIDInfo        = iomy.validation.isRoomIDValid(mSettings.roomID);

                bError            = !mRoomIDInfo.bIsValid;
                aErrorMessages    = aErrorMessages.concat(mRoomIDInfo.aErrorMessages);
                
                // Throw an exception if the room ID is invalid.
                if (bError) {
                    throw new IllegalArgumentException( aErrorMessages.join("\n") );
                } else {
                    iRoomId        = mSettings.roomID;
                }
            } else {
                fnAppendError(sRoomIDMissing);
            }
            
            //--------------------------------------------------------------------//
            // Check the settings map for two callback functions.
            //--------------------------------------------------------------------//
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
            fnAppendError(sDeviceIDMissing);
            fnAppendError(sRoomIDMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n"));
        }
        
        try {
            //------------------------------------------------------------//
            // Begin request
            //------------------------------------------------------------//
            iomy.apiphp.AjaxRequest({
                url : sUrl,
                data : {"Mode" : "ChooseRoom", "Id" : parseInt(iLinkId), "RoomId" : parseInt(iRoomId)},

                onSuccess : function (response, data) {
                    try {
                        if (data.Error === false) {
                            fnSuccess();

                        } else {
                            fnFail(data.ErrMesg);
                        }
                    } catch (ex) {
                        fnFail(ex.message);
                    }
                },

                onFail : function (error) {
                    var sErrMessage = "Error (HTTP Status "+error.status+"): "+error.responseText;
                    jQuery.sap.log.error(sErrMessage);
                    fnFail(sErrMessage);
                }
            });
            
        } catch (e) {
            var sErrMessage = "Error attempting to assign a device to a room ("+e.name+"): " + e.message;
            $.sap.log.error(sErrMessage);
            fnFail(sErrMessage);
        }
    },
    
    editThing : function (mSettings) {
        var bError                    = false;
        var aErrorMessages            = [];
        var sThingText;
        var iThingId;
        var sOldThingText;
        var iOldRoomID;
        
        var bEditingThing;
        var mThingIDInfo;
        var mRoomIDInfo;
        var bChangingRoom;

        var iRoomId;
        var sRoomText;
        
        var fnThingSuccess;
        var fnThingFail;
        
        var fnRoomSuccess;
        var fnRoomFail;
        
        var fnSuccess;
        var fnWarning;
        var fnFail;
        
        var mThingChangeSettings = {};
        var mRoomChangeSettings = {};
        
        var sThingIDMissing     = "Thing ID (thingID) must be specified!";
        var sThingNameMissing   = "New Thing Name (thingName) must be specified!";
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
            //jQuery.sap.log.error(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Read the settings map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Valid Thing ID
            //----------------------------------------------------------------//
            if (mSettings.thingID !== undefined) {
                mThingIDInfo    = iomy.validation.isThingIDValid(mSettings.thingID);
                
                bError          = !mThingIDInfo.bIsValid;
                aErrorMessages  = aErrorMessages.concat(mThingIDInfo.aErrorMessages);
                
                if (!bError) {
                    iThingId = mSettings.thingID;
                    sOldThingText = iomy.common.ThingList["_"+iThingId].DisplayName;
                }
            } else {
                fnAppendError(sThingIDMissing);
            }
            
            //----------------------------------------------------------------//
            // REQUIRED: Thing Name
            //----------------------------------------------------------------//
            if (mSettings.thingName === undefined) {
                fnAppendError(sThingNameMissing);
            } else {
                sThingText = mSettings.thingName;
            }
            
            //----------------------------------------------------------------//
            // OPTIONAL: Valid Room ID
            //----------------------------------------------------------------//
            if (mSettings.roomID !== undefined) {
                mRoomIDInfo = iomy.validation.isRoomIDValid(mSettings.roomID);
                
                bError            = !mRoomIDInfo.bIsValid;
                aErrorMessages    = aErrorMessages.concat(mRoomIDInfo.aErrorMessages);
                
                if (!bError) {
                    iRoomId     = mSettings.roomID;
                    iOldRoomID  = iomy.common.ThingList["_"+iThingId].RoomId;
                }
            } else {
                iRoomId = 0;
            }
            
            if (bError) {
                throw new IllegalArgumentException( aErrorMessages.join("\n") );
            }
            
            //--------------------------------------------------------------------//
            // Check the settings map for three callback functions.
            //--------------------------------------------------------------------//
            //-- Success callback --//
            if (mSettings.onSuccess === undefined) {
                fnSuccess = function () {};
            } else {
                fnSuccess = mSettings.onSuccess;
            }
            
            //-- Success callback --//
            if (mSettings.onWarning === undefined) {
                fnWarning = function () {};
            } else {
                fnWarning = mSettings.onWarning;
            }

            //-- Failure callback --//
            if (mSettings.onFail === undefined) {
                fnFail = function () {};
            } else {
                fnFail = mSettings.onFail;
            }
            
        } else {
            fnAppendError(sThingIDMissing);
            fnAppendError(sThingNameMissing);
            
            throw new MissingSettingsMapException( aErrorMessages.join("\n") );
        }

        //--------------------------------------------------------------------//
        // Has the thing name changed?
        //--------------------------------------------------------------------//
        if (sThingText === sOldThingText) {
            bEditingThing = false;
        } else {
            bEditingThing = true;
        }
        
        //--------------------------------------------------------------------//
        // Check that a different room has actually been changed.
        //--------------------------------------------------------------------//
        if (iRoomId == iOldRoomID || iRoomId === 0) {
            iRoomId         = null;
            sRoomText       = null;
            bChangingRoom   = false;
        } else {
            sRoomText       = iomy.functions.getRoom(iRoomId).RoomName;
            bChangingRoom   = true;
        }
        
        if (bError === false) {
            try {
                mThingChangeSettings.thingID    = iThingId;
                mThingChangeSettings.thingName  = sThingText;

                mRoomChangeSettings.thingID     = iThingId;
                mRoomChangeSettings.roomID      = iRoomId;

                //----------------------------------------------------------------//
                // Create the onSuccess and onFail functions based on what fields
                // are enabled and/or changed.
                //----------------------------------------------------------------//
                if (bEditingThing && (bChangingRoom && iRoomId !== null) ) {

                    //------------------------------------------------------------//
                    // We're editing both the thing name and assigning it to a
                    // room.
                    //------------------------------------------------------------//
                    mThingChangeSettings.successful = true;

                    //------------------------------------------------------------//
                    // Create the success function that will create the callback
                    // functions for the room assignment function.
                    //------------------------------------------------------------//
                    fnThingSuccess = function () {
                        //--------------------------------------------------------//
                        // Create the success function that will popup a message,
                        // indicating complete or partial success.
                        //--------------------------------------------------------//
                        mRoomChangeSettings.onSuccess = function () {
                            try {
                                iomy.common.RefreshCoreVariables({
                                    onSuccess : function () {
                                        try {
                                            var sMessage;

                                            if (mThingChangeSettings.successful === true) {
                                                sMessage = "Device renamed to "+sThingText+" and is now located in "+sRoomText;
                                                iomy.common.showMessage({
                                                    text : sMessage,
                                                });

                                                fnSuccess();

                                            } else {
                                                sMessage = "Device couldn't be renamed to "+sThingText+", but is now located in "+sRoomText;

                                                iomy.common.showWarning(sMessage, "New Location", function () {
                                                    fnWarning();
                                                });
                                            }

                                            fnSuccess();
                                        } catch (e) {
                                            $.sap.log.error(e.name + ": " + e.message);
                                        }
                                    },

                                    onFail : fnThingFail
                                });
                            } catch (e) {
                                $.sap.log.error(e.name + ": " + e.message);
                            }
                        };

                        //--------------------------------------------------------//
                        // Create the success function that will popup a message,
                        // indicating complete or partial failure.
                        //--------------------------------------------------------//
                        mRoomChangeSettings.onFail = function (sErrorMessage) {
                            try {
                                iomy.common.RefreshCoreVariables({
                                    onSuccess : function () {
                                        try {
                                            var sMessage;

                                            if (mThingChangeSettings.successful === true) {
                                                sMessage = "Device renamed to "+sThingText+", but failed to move device to "+sRoomText;

                                                iomy.common.showWarning(sMessage, "Device Renamed", function () {
                                                    fnWarning(sMessage);
                                                });

                                                jQuery.sap.log.warning(sMessage);
                                            } else {
                                                sMessage = "Device couldn't be renamed. Failed to move device to "+sRoomText;

                                                iomy.common.showError(sMessage, "Error", function () {
                                                    fnFail();
                                                });

                                                jQuery.sap.log.error(sMessage);
                                            }
                                        } catch (e) {
                                            $.sap.log.error(e.name + ": " + e.message);
                                        }
                                    }
                                });
                            } catch (e) {
                                $.sap.log.error(e.name + ": " + e.message);
                            }
                        };

                        //-- Call the room assignment function with the correct configuration. --//
                        try {
                            iomy.devices.AssignDeviceToRoom(mRoomChangeSettings);

                        } catch (e) {
                            jQuery.sap.log.error(e.name + ": " + e.message);
                        }
                    };

                    //------------------------------------------------------------//
                    // Create the failure function that will report a failure and
                    // then run the success function to proceed to assign a device
                    // to a room
                    //------------------------------------------------------------//
                    fnThingFail = function (sErrMesg) {
                        jQuery.sap.log.error(sErrMesg);
                        mThingChangeSettings.successful = false;
                        fnThingSuccess();
                    };

                    mThingChangeSettings.onSuccess    = fnThingSuccess;
                    mThingChangeSettings.onFail       = fnThingFail;

                    // Run the API to update the device (thing) name
                    try {
                        iomy.devices.editThingName(mThingChangeSettings);

                    } catch (e00033) {
                        jQuery.sap.log.error(e00033.message);
                    }
                } else if (!bEditingThing && !(bChangingRoom && iRoomId !== null)) {
                    //-- Skip this step and run the success callback --//
                    fnSuccess();

                } else {
                    //------------------------------------------------------------//
                    // We're simply changing the name of a thing.
                    //------------------------------------------------------------//
                    if (bEditingThing) {
                        fnThingFail = function () {
                            var sMessage = "Device couldn't be renamed.";

                            iomy.common.showError(sMessage, "", function () {
                                fnFail();
                            });

                            jQuery.sap.log.error(sMessage);
                        };

                        fnThingSuccess = function () {
                            try {
                                iomy.common.RefreshCoreVariables({
                                    onSuccess : function () {
                                        iomy.common.showMessage({
                                            text : "Device renamed to \""+sThingText+"\"."
                                        });

                                        fnSuccess();
                                    }
                                });
                            } catch (e) {
                                $.sap.log.error(e.name + ": " + e.message);
                            }
                        };

                        mThingChangeSettings.onSuccess    = fnThingSuccess;
                        mThingChangeSettings.onFail       = fnThingFail;

                        // Run the API to update the device (thing) name
                        try {
                            iomy.devices.editThingName(mThingChangeSettings);

                        } catch (e) {
                            jQuery.sap.log.error(e.name + ": " + e.message);
                        }
                    }

                    //------------------------------------------------------------//
                    // Or moving a device to another room.
                    //------------------------------------------------------------//
                    if (bChangingRoom && iRoomId !== null) {
                        fnRoomFail = function (sMessage) {
                            iomy.common.showError(sMessage, "Error", function () {
                                fnFail();
                            });
                        };

                        fnRoomSuccess = function () {
                            try {
                                iomy.common.RefreshCoreVariables({ 
                                    onSuccess : function () {
                                        iomy.common.showMessage({
                                            text : "Device is now located in "+sRoomText
                                        });

                                        fnSuccess();
                                    }
                                });
                            } catch (e) {
                                
                            }
                        };

                        mRoomChangeSettings.onSuccess    = fnRoomSuccess;
                        mRoomChangeSettings.onFail       = fnRoomFail;

                        try {
                            iomy.devices.AssignDeviceToRoom(mRoomChangeSettings);

                        } catch (e) {
                            jQuery.sap.log.error(e.name + ": " + e.message);
                        }
                    }
                }
            } catch (e) {
                iomy.common.showError(e.name + ": " + e.message, "Error");
            }
            
        } else {
            iomy.common.showError(aErrorMessages.join("\n\n"), "");
            jQuery.sap.log.error(aErrorMessages.join("\n"));
        }
    },
    
    editThingName : function (mSettings) {
        var bError                    = false;
        var aErrorMessages            = [];
        var iThingId;
        var sThingName;
        var mThingIDInfo;
        var fnSuccess;
        var fnFail;
        
        // Lambda function to run if there are errors.
        var fnAppendError   = function (sErrMesg) {
            bError = true;
            aErrorMessages.push(sErrMesg);
            //jQuery.sap.log.error(sErrMesg);
        };
        
        //--------------------------------------------------------------------//
        // Read the settings map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined) {
            //----------------------------------------------------------------//
            // REQUIRED: Valid Thing ID
            //----------------------------------------------------------------//
            if (mSettings.thingID !== undefined) {
                mThingIDInfo = iomy.validation.isThingIDValid(mSettings.thingID);
                
                bError            = !mThingIDInfo.bIsValid;
                aErrorMessages    = aErrorMessages.concat(mThingIDInfo.aErrorMessages);
                
                if (!bError) {
                    iThingId = mSettings.thingID;
                }
            } else {
                fnAppendError("Thing ID (thingID) must be specified!");
            }
            
            //----------------------------------------------------------------//
            // REQUIRED: Thing Name
            //----------------------------------------------------------------//
            if (mSettings.thingName === undefined) {
                fnAppendError("Thing Name (thingName) must be specified!");
            } else {
                sThingName = mSettings.thingName;
            }
            
            if (bError) {
                throw new IllegalArgumentException( aErrorMessages.join("\n") );
            }
            
            //--------------------------------------------------------------------//
            // Check the settings map for two callback functions.
            //--------------------------------------------------------------------//
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
            fnAppendError("Thing ID (thingID) must be specified!");
            fnAppendError("Thing Name (thingName) must be specified!");
            throw new MissingSettingsMapException( aErrorMessages.join("\n") );
        }
        
        try {
            //--------------------------------------------------------------------//
            // Run the API to change the thing name.
            //--------------------------------------------------------------------//
            iomy.apiphp.AjaxRequest({
                "url" : iomy.apiphp.APILocation("thing"),
                "data" : {"Mode" : "EditName", "Id" : iThingId, "Name" : sThingName},
                "onSuccess" : function (responseType, data) {

                    try {
                        if (data.Error === false) {
                            fnSuccess();

                        } else {
                            fnFail(data.ErrMesg);
                        }
                    } catch (e) {
                        fnFail(e.message);
                    }

                },
                "onFail" : function (err) {
                    fnFail(err.responseText);
                }
            });
        } catch (e) {
            var sErrMessage = "Error attempting to change the device name ("+e.name+"): " + e.message;
            $.sap.log.error(sErrMessage);
            fnFail(sErrMessage);
        }
    },
    
    /**
     * Fetches the ID of a specific page to interact with a particular device.
     * 
     * @param {Number} iThingTypeId             ID of the thing type.
     * @returns {string} Page ID of the appropriate device page.
     */
    getDevicePageID : function (iThingTypeId) {
        try {
            //-- Zigbee Netvox Smart Plug --//
            if( iThingTypeId===2 ) {
                return iomy.devices.zigbeesmartplug.DevicePageID;
                
            //-- Philips Hue --//
            } else if( iThingTypeId===13 ) {
                return iomy.devices.philipshue.DevicePageID;
                
            //-- Onvif Stream --//
            } else if ( iThingTypeId===12) {
                return iomy.devices.onvif.DevicePageID;
                
            //-- Motion Sensor --//
            } else if ( iThingTypeId===3) {
                return iomy.devices.motionsensor.DevicePageID;
                
            //-- Temperature Sensor --//
            } else if ( iThingTypeId===4) {
                return iomy.devices.temperaturesensor.DevicePageID;
                
            //-- DevelCo Energy Meter --//
            } else if ( iThingTypeId===10) {
                return iomy.devices.develco.DevicePageID;
                
            //-- Weather Feed --//
            } else if ( iThingTypeId===14) {
                return iomy.devices.weatherfeed.DevicePageID;
                
            //-- IP Camera --//
            } else if ( iThingTypeId===18) {
                return iomy.devices.ipcamera.DevicePageID;
            }
        } catch (e1) {
            jQuery.sap.log.error("Error: Getting Device Page ID:"+e1.message); 
        }
    },
    
    getSerialCodeOfDevice : function (iThingId) {
        var sSerialCode = "N/A";
        try {
            $.each(iomy.common.ThingList, function (sI, mThing) {
                if (mThing.Id == iThingId) {
                    sSerialCode = iomy.common.LinkList["_"+mThing.LinkId].LinkSerialCode;
                    return false;
                }
            });
            
            if (sSerialCode === null) {
                sSerialCode = "N/A";
            }
            
            return sSerialCode;
        } catch (e1) {
            jQuery.sap.log.error("Error: Getting Serial Code of Device:"+e1.message);
            return "N/A";
        }
    },
    
    GetUITaskList: function( mSettings ) {
        //------------------------------------//
        //-- 1.0 - Initialise Variables        --//
        //------------------------------------//
        //console.log(JSON.stringify(aDeviceData));
        var aTasks            = { "High":[], "Low":[] };                    //-- ARRAY:            --//
        
        var bError          = false;
        var aErrorMessages  = [];
        
        var fnAppendError = function (sErrMessage) {
            bError          = true;
            aErrorMessages  = sErrMessage;
        };
        
//        mSettings.deviceData;
//        mSettings.labelWidgetID;
//        mSettings.onSuccess;
//        mSettings.onFail;

        if (mSettings !== undefined && mSettings !== null) {
            
            if (mSettings.deviceData === undefined || mSettings.deviceData === null) {
                fnAppendError("Device information from the Thing List must be given.");
            }
            
            if (mSettings.labelWidgetID === undefined || mSettings.labelWidgetID === null) {
                fnAppendError("ID of the label widget should be given so that any data can be displayed.");
            }
            
            if (bError) {
                throw new MissingArgumentException(aErrorMessages.join("\n"));
            }
            
        } else {
            fnAppendError("Device information from the Thing List must be given.");
            fnAppendError("ID of the label widget should be given so that any data can be displayed.");
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n"));
        }
        
        //------------------------------------//
        //-- 2.0 - Fetch TASKS                --//
        //------------------------------------//
        
        try {
            if( mSettings.deviceData.IOs!==undefined ) {
                if( mSettings.deviceData.DeviceTypeId===iomy.devices.zigbeesmartplug.ThingTypeId ) {
                    aTasks = iomy.devices.zigbeesmartplug.GetUITaskList(mSettings);
                }

                if( mSettings.deviceData.DeviceTypeId===iomy.devices.weatherfeed.ThingTypeId ) {
                    aTasks = iomy.devices.weatherfeed.GetUITaskList(mSettings);
                }

                if( mSettings.deviceData.DeviceTypeId===iomy.devices.motionsensor.ThingTypeId ) {
                    aTasks = iomy.devices.motionsensor.GetUITaskList(mSettings);
                }

                if( mSettings.deviceData.DeviceTypeId===iomy.devices.philipshue.ThingTypeId ) {
                    aTasks = iomy.devices.philipshue.GetUITaskList(mSettings);
                }

                if( mSettings.deviceData.DeviceTypeId===iomy.devices.csrmesh.ThingTypeId ) {
                    aTasks = iomy.devices.csrmesh.GetUITaskList(mSettings);
                }

                if( mSettings.deviceData.DeviceTypeId===iomy.devices.temperature.ThingTypeId ) {
                    aTasks = iomy.devices.temperature.GetUITaskList(mSettings);
                }

    //            if( mSettings.deviceData.DeviceTypeId===iomy.devices.ipcamera.ThingTypeId ) {
    //                aTasks = iomy.devices.ipcamera.GetUITaskList(mSettings);
    //            }
    //            
    //            if( mSettings.deviceData.DeviceTypeId===iomy.devices.onvif.ThingTypeId ) {
    //                aTasks = iomy.devices.onvif.GetUITaskList(mSettings);
    //            }

            } else {
                //-- TODO: Write a error message --//
                jQuery.sap.log.error("Device "+mSettings.deviceData.DisplayName+" has no IOs");
            }
        } catch (e) {
            // Something else has gone hideously wrong.
            aTasks = { "High":[], "Low":[] };
            $.sap.log.error("Fatal error generating request list for device (ID: "+mSettings.deviceData.DeviceId+") ("+e.name+"): " + e.message);
            
        } finally {
            return aTasks;
        }
    },
    
    getHexOfLightColour : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var iThingId;
        var iTypeId;
        
        var sThingIDMissing         = "Thing ID (thingID) must be given.";
        
        var fnSuccess   = function () {};
        var fnFail      = function () {};
        
        var fnAppendError = function (sErrMessage) {
            bError          = true;
            aErrorMessages  = sErrMessage;
        };
        
        //--------------------------------------------------------------------//
        // Process the parameter map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                iThingId = mSettings.thingID;
                
                var mInfo = iomy.validation.isThingIDValid(iThingId);
                
                if (mInfo.bIsValid) {
                    iTypeId  = iomy.common.ThingList["_"+iThingId].TypeId;
                    
                    if (iTypeId !== iomy.devices.philipshue.ThingTypeId && iTypeId !== iomy.devices.csrmesh.ThingTypeId) {
                        fnAppendError("Device given is not a light bulb.");
                    }
                    
                } else {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
                }
            } else {
                fnAppendError(sThingIDMissing);
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
                
                if (typeof fnSuccess !== "function") {
                    fnAppendError("Success callback is not a function. Found '"+typeof fnSuccess+"' instead.");
                }
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
                
                if (typeof fnFail !== "function") {
                    fnAppendError("Failure callback is not a function. Found '"+typeof fnFail+"' instead.");
                }
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n\n"));
            }
            
        } else {
            fnAppendError(sThingIDMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n\n"));
        }
        
        //--------------------------------------------------------------------//
        // Load the information and attempt to perform the calculation.
        //--------------------------------------------------------------------//
        try {
            
            iomy.devices.loadLightBulbInformation({
                thingID : iThingId,

                onSuccess : function (iHue, iSaturation, iLight) {
                    try {
                        var sHexString = iomy.functions.convertHSL255ToHex( iHue, iSaturation, iLight );

                        fnSuccess(sHexString);
                    } catch (e) {
                        $.sap.log.error(e.name + ": " + e.message);
                        fnFail(e.name + ": " + e.message);
                    }
                },

                onFail : function (sErrorMessage) {
                    fnFail(sErrorMessage);
                }
            });
        } catch (e) {
            var sErrorMessage = "There was an error while attempting to load the light bulb information ("+e.name+"): "+e.message
            jQuery.sap.log.error(sErrorMessage);
            fnFail(sErrorMessage);
        }
    },
    
    loadLightBulbInformation : function (mSettings) {
        var bError              = false;
        var aErrorMessages      = [];
        var aIOFilter           = [];
        var iThingId;
        var iTypeId;
        var mThing;
        var mIOs;
        
        var sThingIDMissing         = "Thing ID (thingID) must be given.";
        
        var fnSuccess   = function () {};
        var fnFail      = function () {};
        
        var fnAppendError = function (sErrMessage) {
            bError          = true;
            aErrorMessages  = sErrMessage;
        };
        
        //--------------------------------------------------------------------//
        // Process the parameter map
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                iThingId = mSettings.thingID;
                
                var mInfo = iomy.validation.isThingIDValid(iThingId);
                
                if (mInfo.bIsValid) {
                    mThing  = iomy.common.ThingList["_"+iThingId];
                    iTypeId = mThing.TypeId;
                    
                    if (iTypeId !== iomy.devices.philipshue.ThingTypeId && iTypeId !== iomy.devices.csrmesh.ThingTypeId) {
                        fnAppendError("Device given is not a light bulb.");
                    }
                    
                } else {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mInfo.aErrorMessages);
                }
            } else {
                fnAppendError(sThingIDMissing);
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
                
                if (typeof fnSuccess !== "function") {
                    fnAppendError("Success callback is not a function. Found '"+typeof fnSuccess+"' instead.");
                }
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
                
                if (typeof fnFail !== "function") {
                    fnAppendError("Failure callback is not a function. Found '"+typeof fnFail+"' instead.");
                }
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n\n"));
            }
            
        } else {
            fnAppendError(sThingIDMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n\n"));
        }
        
        //--------------------------------------------------------------------//
        // Acquire the thing and its IOs
        //--------------------------------------------------------------------//
        mThing      = iomy.common.ThingList["_"+iThingId];
        mIOs        = mThing.IO;
        
        //--------------------------------------------------------------------//
        // Determine the conversion rates as the figures from the database will
        // need to be converted for use with each light bulb type.
        //--------------------------------------------------------------------//
        //if (mThing.TypeId == iomy.devices.philipshue.ThingTypeId) {
        //    fHueConversionRate          = 65535 / 360;  // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
        //    fSaturationConversionRate   = 1.44;         // 144 / 100 (100 being the max saturation value)
        //    fLightConversionRate        = 2.54;         // 254 / 100 (likewise)

        //} else if (mThing.TypeId == iomy.devices.csrmesh.ThingTypeId) {
        //    fHueConversionRate          = 1;
        //    fSaturationConversionRate   = 2.55;
        //    fLightConversionRate        = 2.55;
        //}
        
        try {
            $.each(mIOs, function (sI, aIO) {
                if (sI !== undefined && sI !== null && aIO !== undefined && aIO !== null) {
                    aIOFilter.push("IO_PK eq "+aIO.Id);
                }
            });
            
            iomy.apiodata.AjaxRequest({
                Url : iomy.apiodata.ODataLocation("dataint"),
                Columns : ["CALCEDVALUE","UTS","RSTYPE_PK","IO_PK"],
                WhereClause : [
                    "THING_PK eq "+iThingId,
                    "("+aIOFilter.join(" or ")+")",
                ],
                OrderByClause : ["UTS desc"],
                Limit : 3,
                RetryLimit : 5,
                Retries : 0,
                format : 'json',

                onSuccess : function (response, data) {
                    var iHue        = null;
                    var iSaturation = null;
                    var iLight      = null;
                    var bError      = false;
                    var sErrMessage = "";
                    
                    try {
                        for (var i = 0; i < data.length; i++) {
                            //console.log(JSON.stringify(data));
                            //----------------------------------------------------//
                            // If we're grabbing the HUE value
                            //----------------------------------------------------//
                            if (data[i].RSTYPE_PK === 3901 && iHue === null) {
                                //iHue = Math.round(data[i].CALCEDVALUE / fHueConversionRate);
                                iHue = data[i].CALCEDVALUE;
                            }

                            //----------------------------------------------------//
                            // If we're grabbing the SATURATION value
                            //----------------------------------------------------//
                            if (data[i].RSTYPE_PK === 3902 && iSaturation === null) {
                                //iSaturation = Math.round(data[i].CALCEDVALUE / fSaturationConversionRate);
                                iSaturation = data[i].CALCEDVALUE;
                            }

                            //----------------------------------------------------//
                            // If we're grabbing the LUMINANCE value
                            //----------------------------------------------------//
                            if (data[i].RSTYPE_PK === 3903 && iLight === null) {
                                //iLight = Math.round(data[i].CALCEDVALUE / fLightConversionRate);
                                iLight = data[i].CALCEDVALUE;
                            }

                            //----------------------------------------------------//
                            // If we already have what we need, we can finish the
                            // loop.
                            //----------------------------------------------------//
                            if (iHue !== null && iSaturation !== null && iLight !== null) {
                                break;
                            } else {
                                //-----------------------------------------------------//
                                // Otherwise, if we've finished processing the data and
                                // we don't have all of it, then increase the limit and
                                // run the request again. Do this up to 5 times before
                                // giving up.
                                //-----------------------------------------------------//
                                if (i === data.length - 1) {
                                    this.Limit += 3;
                                    this.Retries++;

                                    if (this.Retries < this.RetryLimit) {
                                        iomy.apiodata.AjaxRequest(this);
                                        //return;
                                    } else {
                                        fnFail("Failed to find all of the data for "+mThing.DisplayName+".");
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        bError = true;
                        sErrMessage = "Failed to find all of the data for "+mThing.DisplayName+" ("+e.name+"): " + e.message;
                        $.sap.log.error(sErrMessage);
                    }
                    
                    if (!bError) {
                        try {
                            //----------------------------------------------------//
                            //-- Convert the Values                             --//
                            //----------------------------------------------------//
                            var mConvertedHSL = iomy.functions.convertHSL( "DB", "Normal", mThing.TypeId, iHue, iSaturation, iLight );

                            if( mConvertedHSL.Error===false ) {
                                fnSuccess( mConvertedHSL.Hue, mConvertedHSL.Sat, mConvertedHSL.Lig );
                            } else {
                                fnFail("Failed to convert HSL data! "+mConvertedHSL.ErrMesg+".");
                            }
                            
                        } catch (e) {
                            sErrMessage = "Failed to process the light bulb data for "+mThing.DisplayName+" ("+e.name+"): " + e.message;
                            $.sap.log.error(sErrMessage);
                            fnFail(sErrMessage);
                        }
                    } else {
                        fnFail(sErrMessage);
                    }
                },

                onFail : function (response) {
                    jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
                    fnFail(response.responseText);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("There was an error loading the OData service: "+e.message);
            fnFail(e.name + ": " + e.message);
        }
    },
    
    /******** Experimental functions that will need to be fixed up. ********/
    
    getDeviceAddress : function (iThingId) {
        var iLinkId         = iomy.common.ThingList["_"+iThingId].LinkId;
        var sAddress        = iomy.common.LinkList["_"+iLinkId].LinkConnAddress;
        var sPort           = iomy.common.LinkList["_"+iLinkId].LinkConnPort;
        
        return sAddress + ":" + sPort;
    },
    
    pingDevice : function (mSettings) {
        var iThingId        = 0;
        
        var fnResult        = function () {};
        var sThingIDMissing = "Thing ID must be given (thingID).";
        
        //--------------------------------------------------------------------//
        // Find and validate the thing ID and a callback function if given.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.thingID !== undefined && mSettings.thingID !== null) {
                iThingId = mSettings.thingID;
                
                var mInfo = iomy.validation.isThingIDValid(iThingId);
                
                if (!mInfo.bIsValid) {
                    throw new ThingIDNotValidException(mInfo.aErrorMessages.join("\n\n"));
                }
            } else {
                throw new MissingArgumentException(sThingIDMissing)
            }
            
            if (mSettings.onComplete !== undefined && mSettings.onComplete !== null) {
                fnResult = mSettings.onComplete;
                
                if (typeof fnResult !== "function") {
                    throw new IllegalArgumentException("'onComplete' is not a function. Received "+typeof fnResult);
                }
            }
            
        } else {
            throw new MissingSettingsMapException(sThingIDMissing);
        }
        
        //--------------------------------------------------------------------//
        // Prepare the request.
        //--------------------------------------------------------------------//
        try {
            $.ajax("http://"+this.getDeviceAddress(iThingId), {
                crossDomain:            true,
                type:                   "POST",
                
                beforeSend : function (xhr) {
                    xhr.onreadystatechange = function() {
                        if (this.status == 404) {
                           fnResult("Offline");
                        }
                    };
                },

                statusCode: {
                    404: function() {
                        fnResult("Offline");
                    }
                },

                success : function () {
                    fnResult("Online");
                },

                error : function(err) {
                    if (err.status == '403' || err.status == '401') {
                        fnResult("Inaccessible");
                    } else {
                        fnResult("Offline");

                        if (err.status == '500') {
                            //-- Bugger! --//
                            $.sap.log.error("A HTTP 500 error occurred! Check the web server logs.");
                        }
                    }
                }
            });
        } catch (e) {
            fnResult("Offline");
        }
    }
    
});


$.sap.require("iomy.devices.zigbeesmartplug");
$.sap.require("iomy.devices.philipshue");
$.sap.require("iomy.devices.csrmesh");
$.sap.require("iomy.devices.onvif");
$.sap.require("iomy.devices.ipcamera");
$.sap.require("iomy.devices.motionsensor");
$.sap.require("iomy.devices.weatherfeed");
$.sap.require("iomy.devices.temperature");