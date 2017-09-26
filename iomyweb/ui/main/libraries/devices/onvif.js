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

$.sap.declare("IomyRe.devices.onvif",true);
IomyRe.devices.onvif = new sap.ui.base.Object();

$.extend(IomyRe.devices.onvif,{
	Devices                 : [],
    
    aProfiles               : [],
    sProfileLookupErrors    : [],
    
    proceedToCreateItem     : true,
	
	LinkTypeId				: 6,
	ThingTypeId				: 12,
    
    /**
     * These IDs are used in the elements that are defined in this module. These
     * elements are used in forms that handle information about onvif devices.
     */
    uiIDs       : {
        sCameraNameLabelID       : "CameraNameLabel",
        sCameraNameFieldID       : "CameraNameField",
        sStreamProfileLabelID    : "StreamProfileLabel",
        sStreamProfileFieldID    : "StreamProfileField",
        sThumbnailProfileLabelID : "ThumbnailProfileLabel",
        sThumbnailProfileFieldID : "ThumbnailProfileField"
    },
	
	RSStreamProfile		: 3970,
	RSStreamURL			: 3971,
	RSThumbnailProfile	: 3972,
	RSThumbnailURL		: 3973,
	RSPTZAxisX			: 3974,
	RSPTZAxisY			: 3975,
	
	DevicePageID : "pOnvif",
	
	getStreamURL : function(mSettings) {
		var me				= this;
		var bError			= false;
		var aErrorMessages	= [];
		var iIOId			= null;
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
			mThingIdInfo	= IomyRe.validation.isThingIDValid(mSettings.ThingId);
			bError			= !mThingIdInfo.bIsValid;
			aErrorMessages	= mThingIdInfo.aErrorMessages;
            
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
		mThing = IomyRe.common.ThingList["_"+iThingId];
		
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
		sUrl = IomyRe.apiodata.ODataLocation("datamedstring");
		
		IomyRe.apiodata.AjaxRequest({
			Url				: sUrl,
			Columns			: ["CALCEDVALUE"],
			WhereClause		: ["IO_PK eq " + iIOId],
			OrderByClause	: [],
			
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
    
    /**
     * Retrives a list of profiles within an Onvif server identified by its link
     * ID. A callback function must be used if you wish to retrieve the results.
     * 
     * @param {type} iLinkId            ID of the Onvif server
     * @param {type} fnCallback         Function called if successful
     */
    LookupProfiles : function(iLinkId, fnSuccessCallback, fnFailCallback) {
        var me = this;
        var bError = false;
        
        //---------------------------------------------------------------//
        // Check that both the link ID and callback functions are given. //
        //---------------------------------------------------------------//
        if (iLinkId === undefined || isNaN(iLinkId)) {
            bError = true;
            jQuery.sap.log.error("A valid link ID must be given and must be a number.");
        }
        
        if (fnFailCallback === undefined) {
            fnFailCallback = function () {};
        }
        
        if (fnSuccessCallback === undefined) {
            fnSuccessCallback = function () {};
        }
        
        // If all went well...
        if (bError === false) {
            //------------------------------------------------------------//
            // Call the API to collect the profiles from an Onvif server. //
            //------------------------------------------------------------//
            var sUrl = IomyRe.apiphp.APILocation("onvif");
            var sMode = "LookupProfiles";

            IomyRe.apiphp.AjaxRequest({
                url: sUrl,
                data: {
                    "Mode" : sMode,
                    "LinkId" : iLinkId
                },

                onSuccess : function (status, response) {
                    // Capture the profiles
                    me.aProfiles = response.Data;

                    // Call the callback function if one is defined.
                    fnSuccessCallback();
                },

                onFail : function (response) {
                    jQuery.sap.log.error(response.responseText);
                    me.sProfileLookupErrors = response.responseText;
                    
                    // Call the fail callback function if one is defined.
                    fnFailCallback();
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
            
            mThingIdInfo = IomyRe.validation.isThingIDValid(mSettings.thingID)
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
            IomyRe.apiphp.AjaxRequest({
                url : IomyRe.apiphp.APILocation("onvif"),
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
    
    ValidateStreamProfile: function (oScope) {
        var me                      = this;   // Scope of the onvif module
        var bError                  = false;  //
        var aErrorMessages          = [];     //
        var mInfo                   = {};     // MAP: Contains the error status and any error messages.
        
        //---------------------------------------------------//
        // Is the stream profile valid? (does it have an ID) //
        //---------------------------------------------------//
        try {
            if (oScope.byId(me.uiIDs.sStreamProfileFieldID).getSelectedKey() === "") {
                bError = true;
                aErrorMessages.push("Stream profile is not valid");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x12001: There was an error checking the stream profile: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    ValidateThumbnailProfile : function (oScope) {
        var me                      = this; // Scope of the onvif module
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------\\
        // Is the thumbnail profile valid? (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oScope.byId(me.uiIDs.sThumbnailProfileFieldID).getSelectedKey() === "") {
                bError = true;
                aErrorMessages.push("Thumbnail profile is not valid");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x12002: There was an error checking the thumbnail profile: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    ValidateThingFormData : function (oScope) {
        var me                      = this;   // Scope of the onvif module
        var bError                  = false;  //
        var aErrorMessages          = [];     //
        var mInfo                   = {};     // MAP: Contains the error status and any error messages.
        var mStreamProfileInfo      = {};     //
        var mThumbnailProfileInfo   = {};     //
        
        //-------------------------------------------------//
        // Check the Onvif stream form data                //
        //-------------------------------------------------//
        try {
			if (oScope.byId(me.uiIDs.sCameraNameFieldID).getValue().length === 0) {
				bError = true;
				aErrorMessages.push("A name must be given for the camera.");
			}
			
            // Check the stream profile
            mStreamProfileInfo      = me.ValidateStreamProfile(oScope);
            if (mStreamProfileInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mStreamProfileInfo.aErrorMessages);
            }
            
            // Check the thumbnail profile
            mThumbnailProfileInfo   = me.ValidateThumbnailProfile(oScope);
            if (mThumbnailProfileInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mThumbnailProfileInfo.aErrorMessages);
            }
            
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x12003: There was an error checking the onvif stream data: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    showSnapshot : function (iThingId, oCallingButton, oPage) {
        var oRPopover = new sap.m.ResponsivePopover({
            title : IomyRe.common.ThingList["_"+iThingId].DisplayName,
            content : [
                IomyRe.common.showLoading({
                    "show" : true,
                    "text" : "Fetching Snapshot...",
                    "context" : oPage
                }),
                    
                new sap.m.Image({
                    densityAware : false,
                    alt : "Failed to acquire snapshot",
                    src : IomyRe.apiphp.APILocation("onvifthumbnail")+"?Mode=UpdateThingThumbnail&ThingId="+iThingId,
                    width: "100%",
                    
                    load : function () {
                        IomyRe.common.showLoading({
                            "show" : false,
                            "context" : oPage
                        });
                    },
                    
                    error : function () {
                        this.destroy();
                        
                        IomyRe.common.showLoading({
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
    
    /**
     * Creates a Onvif stream UI entry in a page such as room overview. This is to be
     * called from the GetCommonUI in the main devices module.
     * 
     * @param {type} sPrefix
     * @param {type} oViewScope
     * @param {type} aDeviceData
     * @returns {unresolved}
     */
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var me					= this;
		var oUIObject			= null;   //-- OBJECT:            --//
		var aUIObjectItems		= [];     //-- ARRAY:             --//
         
        //------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		aUIObjectItems.push(
            //------------------------------------//
            //-- 1st is the Device Label		--//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
						width: "85%",
                        text : aDeviceData.DeviceName,
                        press : function () {
                            IomyRe.common.NavigationChangePage("pOnvif", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                ]
            }).addStyleClass("BorderRight width80Percent webkitflex")
        );
		
		aUIObjectItems.push(
            //------------------------------------//
			//-- 2nd is the onvif buttons		--//
			//------------------------------------//
			new sap.m.HBox({
                items : [
                    new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                        //--------------------------------//
                        //-- Take Snapshot              --//
                        //--------------------------------//
                        items: [
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Button ({
                                        width: "100%",
                                        icon : "sap-icon://GoogleMaterial/photo_camera",
                                        press : function () {
                                            me.showSnapshot(aDeviceData.DeviceId, this, oViewScope);
                                        }
                                    })
                                ]
                            })
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
											try {
												me.getStreamURL({
													ThingId : aDeviceData.DeviceId,

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
		//-- 3.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    GetCommonUITaskList: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
		return aTasks;
	},
    
    GetCommonUIForDeviceOverview: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		//console.log(aDeviceData.DeviceId);

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: [
                //------------------------------------//
                //-- 1st is the Device Label		--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
                            text : aDeviceData.DeviceName,
                            press : function () {
                                IomyRe.common.NavigationChangePage("pOnvif", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px Text_grey_20")
                    ]
                }).addStyleClass("BorderRight width80Percent DeviceLabelMargin"),
				
				//------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.HBox({
                    items : [
						new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//
                            items: [
                                new sap.m.VBox({
                                    items : [
										new sap.m.Button ({
											width: "100%",
											icon : "sap-icon://GoogleMaterial/visibility",
										})
                                    ]
                                })
                            ]
                        }).addStyleClass("MarLeft10px MarAuto0px minwidth70px"),
                        new sap.m.VBox( oViewScope.createId( sPrefix+"_Screenshot"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//
                            items: [
                                new sap.m.VBox({
                                    items : [
										new sap.m.Button ({
											width: "100%",
											icon : "sap-icon://GoogleMaterial/camera",
										})
                                    ]
                                })
                            ]
                        }).addStyleClass("MarLeft10px MarAuto0px minwidth70px")
                    ]
                }).addStyleClass("minwidth170px minheight58px")
            ]
        }).addStyleClass("ListItem");

		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	
	GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		//console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                
            });
        } else {
            //  #TODO:# - Write a error message
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no IOs");
        }
		return aTasks;
	},
	
	GetObjectIdList: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		//-- TODO: These devices need to be in their own definition file --//
		if( aDeviceData.DeviceTypeId===2 ) {
			
			aObjectIdList = [
				sPrefix+"_Container",
				sPrefix+"_Label",
				sPrefix+"_DataContainer",
				sPrefix+"_StatusContainer",
				sPrefix+"_StatusToggle"
			];
			
		}
	
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
});