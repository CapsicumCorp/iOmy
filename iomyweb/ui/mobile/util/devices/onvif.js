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

$.sap.declare("IOMy.devices.onvif",true);
IOMy.devices.onvif = new sap.ui.base.Object();

$.extend(IOMy.devices.onvif,{
	Devices                 : [],
    
    aProfiles               : [],
    sProfileLookupErrors    : [],
    
    proceedToCreateItem     : true,
    
    /**
     * These IDs are used in the elements that are defined in this module. These
     * elements are used in forms that handle information about onvif devices.
     */
    uiIDs       : {
        sStreamProfileLabelID : "StreamProfileLabel",
        sStreamProfileFieldID : "StreamProfileField",
        sThumbnailProfileLabelID : "ThumbnailProfileLabel",
        sThumbnailProfileFieldID : "ThumbnailProfileField"
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
        
        //------------------------------------------------------------//
        // Check that both the link ID and callback functions are given.
        //------------------------------------------------------------//
        if (fnFailCallback === undefined) {
            fnFailCallback = function () {};
        }
        
        if (fnSuccessCallback === undefined) {
            fnSuccessCallback = function () {};
        }
        
        if (iLinkId === undefined || isNaN(iLinkId)) {
            bError = true;
            jQuery.sap.log.error("A valid link ID must be given and must be a number.");
        }
        
        // If all went well...
        if (bError === false) {
            //------------------------------------------------------------//
            // Call the API to collect the profiles from an Onvif server.
            //------------------------------------------------------------//
            var sUrl = IOMy.apiphp.APILocation("onvif");
            var sMode = "LookupProfiles";

            IOMy.apiphp.AjaxRequest({
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
    
    CreateThingForm : function(oScope, iLinkId, oFormBox, aElementsToEnableOnSuccess, aElementsToEnableOnFailure) {
        var me = this; // Scope of the Onvif module.
        
        // Disable the update button on its form
        //oUpdateButton.setEnabled(false);
        
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        var oStreamProfileLabel;
        var oStreamProfileField;
        var oThumbnailProfileLabel;
        var oThumbnailProfileField;
        
        
        //===============================================\\
        // ASSIGN DEFAULT VALUES TO THE ELEMENT ARRAY
        //===============================================\\
        if (aElementsToEnableOnSuccess === undefined) {
            aElementsToEnableOnSuccess = [];
        }
        
        if (aElementsToEnableOnFailure === undefined) {
            aElementsToEnableOnFailure = aElementsToEnableOnSuccess;
        }
        
        //===============================================\\
        // CONSTRUCT ELEMENTS
        //===============================================\\
        
        //-----------------------------------------------\\
        // STREAM PROFILE
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sStreamProfileLabelID);
        oStreamProfileLabel = new sap.m.Label(oScope.createId(me.uiIDs.sStreamProfileLabelID),{
            text : "Profile to use for the video stream"
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oStreamProfileLabel);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sStreamProfileFieldID);
        oStreamProfileField = new sap.m.ComboBox(oScope.createId(me.uiIDs.sStreamProfileFieldID),{
            value : "Loading Profiles"
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oStreamProfileField);
        
        //-----------------------------------------------\\
        // THUMBNAIL PROFILE
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sThumbnailProfileLabelID);
        oThumbnailProfileLabel = new sap.m.Label(oScope.createId(me.uiIDs.sThumbnailProfileLabelID),{
            text : "Profile to use for thumbnails"
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oThumbnailProfileLabel);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sThumbnailProfileFieldID);
        oThumbnailProfileField = new sap.m.ComboBox(oScope.createId(me.uiIDs.sThumbnailProfileFieldID),{
            value : "Loading Profiles"
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oThumbnailProfileField);
        
        //===============================================\\
        // POPULATE THE COMBO BOXES
        //===============================================\\
        me.LookupProfiles(iLinkId,
            // On Success
            function () {
                // Populate the combo boxes
                for (var i = 0; i < me.aProfiles.length; i++) {
                    // CBox for Stream profile
                    oStreamProfileField.addItem(
                        new sap.ui.core.Item({
                            text : me.aProfiles[i].ProfileName,
                            key : me.aProfiles[i].ProfileToken
                        })
                    );
            
                    // CBox for Thumbnail profile
                    oThumbnailProfileField.addItem(
                        new sap.ui.core.Item({
                            text : me.aProfiles[i].ProfileName,
                            key : me.aProfiles[i].ProfileToken
                        })
                    );
                }
                oStreamProfileField.setSelectedKey(me.aProfiles[0].ProfileToken);
                oThumbnailProfileField.setSelectedKey(me.aProfiles[0].ProfileToken);
                
                // Enable the elements that are needed.
                for (var i = 0; i < aElementsToEnableOnSuccess.length; i++) {
                    try {
                        aElementsToEnableOnSuccess[i].setEnabled(true);
                    } catch (e) {
                        jQuery.sap.log.error("Could not enable a particular element probably because it doesn't have an enabled property. Skipping.");
                    }
                }
            },
            
            // On Failure
            function () {
                // Change the text to notify of a failure.
                oStreamProfileField.setValue("Failed to load profiles.");
                oThumbnailProfileField.setValue("Failed to load profiles.");
                
                // Enable the elements that are needed.
                for (var i = 0; i < aElementsToEnableOnFailure.length; i++) {
                    try {
                        aElementsToEnableOnFailure[i].setEnabled(true);
                    } catch (e) {
                        jQuery.sap.log.error("Could not enable a UI5 element probably because it doesn't have an enabled property. Skipping.");
                    }
                }
            }
        );
        
    },
    
    ValidateStreamProfile: function (oScope) {
        var me                      = this;  // Scope of the onvif module
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------\\
        // Is the stream profile valid? (does it have an ID)
        //-------------------------------------------------\\
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
        var me                      = this; // Scope of the onvif module
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var mStreamProfileInfo      = {};
        var mThumbnailProfileInfo   = {};
        
        //-------------------------------------------------\\
        // Check the Onvif stream form data
        //-------------------------------------------------\\
        try {
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
    
    /**
     * Creates a Onvif stream UI entry in a page such as room overview. This is to be
     * called from the GetCommonUI in the main devices module.
     * 
     * @param {type} sPrefix
     * @param {type} oViewScope
     * @param {type} aDeviceData
     * @param {type} bIsUnassigned
     * @returns {unresolved}
     */
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData, bIsUnassigned ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        
        //-- 1.1 - Set default values		--//
        if (bIsUnassigned === undefined)
            bIsUnassigned = false;
		
		//------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);
        
        // If the UI is for the Unassigned Devices List, include 
        if (bIsUnassigned === true) {
            aUIObjectItems.push(
                new sap.m.CheckBox(oViewScope.createId(sPrefix+"_Selected"), {
                    selected : false
                }).addStyleClass("MarTop10px")
            );
        }
        
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
                            IOMy.common.NavigationChangePage("pOnvif", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20")
                ]
            }).addStyleClass("BorderRight width80Percent jbMR1tempfix")
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
                                IOMy.common.NavigationChangePage("pOnvif", {ThingId : aDeviceData.DeviceId});
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
            //-- TODO: Write a error message --//
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