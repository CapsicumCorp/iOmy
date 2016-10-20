/*
Title: Onvif Camera Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Onvif stream entry, and other functionality
    pertaining to Onvif devices.
Copyright: Capsicum Corporation 2016

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
	Devices     : [],
    
    aProfiles   : [],
    
    /**
     * These IDs are used in the elements that are defined in this module. These
     * elements are used in forms that handle information about onvif devices.
     */
    uiIDs       : {
        sCameraNameLabelID : "CameraNameLabel",
        sCameraNameFieldID : "CameraNameField",
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
                    IOMy.common.showError("There was an error retrieving the Onvif profiles: "+response.ErrMesg);
                    
                    // Call the fail callback function if one is defined.
                    fnFailCallback();
                }
            });
        }
        
    },
    
    CreateOnvifStreamForm : function(oScope, iLinkId, oFormBox, oUpdateButton, oLinkCBox, mThingData) {
        var me = this; // Scope of the Onvif module.
        
        // Disable the update button on its form
        oUpdateButton.setEnabled(false);
        
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        var oCameraNameLabel;
        var oCameraNameField;
        var oStreamProfileLabel;
        var oStreamProfileField;
        var oThumbnailProfileLabel;
        var oThumbnailProfileField;
        
        if (mThingData === undefined) {
            mThingData = {};
        }
        
        //===============================================\\
        // CONSTRUCT ELEMENTS
        //===============================================\\
        
        //-----------------------------------------------\\
        // CAMERA NAME
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sCameraNameLabelID);
        oCameraNameLabel = new sap.m.Label(oScope.createId(me.uiIDs.sCameraNameLabelID),{
            text : "Name"
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oCameraNameLabel);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sCameraNameFieldID);
        oCameraNameField = new sap.m.Input(oScope.createId(me.uiIDs.sCameraNameFieldID),{
            value : ""
        }).addStyleClass("width100Percent");
        oFormBox.addItem(oCameraNameField);
        
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
                
                // Enable the update button and the link combo box once all the combo boxes are populated with choices.
                oUpdateButton.setEnabled(true);
                oLinkCBox.setEnabled(true);
            },
            
            // On Failure
            function () {
                // Change the text to notify of a failure.
                oStreamProfileField.setValue("Failed to load profiles.");
                oThumbnailProfileField.setValue("Failed to load profiles.");
                
                // Enable the link combo box.
                oLinkCBox.setEnabled(true);
            }
        );
        
    },
    
    ValidateCameraName : function (oScope) {
        var me                      = this;  // Scope of the onvif module
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        
        //-------------------------------------------------\\
        // Is the camera name filled out?
        //-------------------------------------------------\\
        try {
            if (oScope.byId(me.uiIDs.sCameraNameField).getValue() === "") {
                bError = true;
                aErrorMessages.push("A name must be given for the camera stream.");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x12000: There was an error checking the link type: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
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
            if (oScope.byId(me.uiIDs.sStreamProfileField).getSelectedKey() === "") {
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
            if (oScope.byId(me.uiIDs.sThumbnailProfileField).getSelectedKey() === "") {
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
    
    ValidateOnvifStreamFormData : function (oScope) {
        var me                      = this; // Scope of the onvif module
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var mCameraNameInfo         = {};
        var mStreamProfileInfo      = {};
        var mThumbnailProfileInfo   = {};
        
        //-------------------------------------------------\\
        // Check the Onvif stream form data
        //-------------------------------------------------\\
        try {
            // Check the camera name
            mCameraNameInfo         = me.ValidateCameraName(oScope);
            if (mCameraNameInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mCameraNameInfo.aErrorMessages);
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
		
		console.log(aDeviceData.DeviceId);
        
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
                        text : aDeviceData.DeviceName,
                        press : function () {
                            IOMy.common.NavigationChangePage("pOnvif", {Thing : aDeviceData});
                        }
                    }).addStyleClass("width100Percent Font-RobotoCondensed Font-Medium PadLeft6px DeviceOverview-ItemLabel TextLeft Text_grey_20")
                ]
            }).addStyleClass("width100Percent")
        );

//        aUIObjectItems.push(
//            //------------------------------------//
//            //-- 2nd is the Device Data			--//
//            //------------------------------------//
//            new sap.m.VBox({
//                items : [
//                    new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
//                        //--------------------------------//
//                        //-- Draw the Data Boxes		--//
//                        //--------------------------------//
//
//                        items: [
//
//                        ]
//                    }).addStyleClass("width110px PadLeft5px MarBottom3px MarRight10px TextLeft")
//                ]
//            })
//        );

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

//        //-- Initialise Variables --//
//        var sStatusButtonText			= "";
//        var bButtonStatus				= false;
//
//        //-- Store the Device Status --//
//        var iDeviceStatus		= aDeviceData.DeviceStatus;
//        var iTogglePermission	= aDeviceData.PermToggle;
//        //var iTogglePermission	= 0;
//
//
//        //-- Set Text --//
//        if( iDeviceStatus===0 ) {
//            sStatusButtonText	= "Off";
//            bButtonStatus		= false;
//        } else {
//            sStatusButtonText	= "On";
//            bButtonStatus		= true;
//        }
//
//        //-- DEBUGGING --//
//        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);
//
//        //------------------------------------//
//        //-- Make the Container				--//
//        //------------------------------------//
//        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
//            items:[] 
//        }).addStyleClass("minwidth80px PadTop10px PadLeft5px");	//-- END of VBox that holds the Toggle Button


        //-- Add the Button's background colour class --//
//        if( iTogglePermission===0 ) {
//
//            //----------------------------//
//            //-- NON TOGGLEABLE BUTTON	--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    enabled: false
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
//            );
//
//        } else {
//
//            //----------------------------//
//            //-- TOGGLEABLE BUTTON		--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    change: function () {
//                        //-- Bind a link to this button for subfunctions --//
//                        var oCurrentButton = this;
//                        //-- AJAX --//
//                        IOMy.apiphp.AjaxRequest({
//                            url: IOMy.apiphp.APILocation("statechange"),
//                            type: "POST",
//                            data: { 
//                                "Mode":"ThingToggleStatus", 
//                                "Id": aDeviceData.DeviceId
//                            },
//                            onFail : function(response) {
//                                IOMy.common.showError(response.message, "Error Changing Device Status");
//                            },
//                            onSuccess : function( sExpectedDataType, aAjaxData ) {
//                                console.log(aAjaxData.ThingPortStatus);
//                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
//                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
//                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
//                                }
//                            }
//                        });
//                    }
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
//                //}).addStyleClass("DeviceOverviewStatusToggleButton TextWhite Font-RobotoCondensed Font-Large"); //-- END of ToggleButton --//
//            );
//        }

        //oUIObject.addItem(oUIStatusContainer);
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
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
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                // TODO: Replace with the IOs from the Philips Hue device.
//                if( aIO.RSTypeId===102 || aIO.RSTypeId===103 ) {
//                    aTasks.Low.push({
//                        "Type":"DeviceValueKWHTotal", 
//                        "Data":{ 
//                            "IOId":			aIO.Id, 
//                            "IODataType":	aIO.DataTypeName,
//                            "IOUoMName":	aIO.UoMName,
//                            "LabelId":			Prefix+"_kWh"
//                        }
//                    });
//                    //jQuery.sap.log.debug(aIO.UoMName);
//                }
            });
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no sensors");
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
		
		console.log(aDeviceData.DeviceId);

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
                                IOMy.common.NavigationChangePage("pOnvif", {Thing : aDeviceData});
                            }
                        }).addStyleClass("width100Percent Font-RobotoCondensed Font-Medium PadLeft6px DeviceOverview-ItemLabel TextLeft Text_grey_20")
                    ]
                }).addStyleClass("PadRight3px width100Percent minwidth170px"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
//                new sap.m.VBox({
//                    items : [
//                        new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
//                            //--------------------------------//
//                            //-- Draw the Data Boxes		--//
//                            //--------------------------------//
//
//                            items: []
//                        }).addStyleClass("PadLeft5px MarBottom3px MarRight10px TextLeft")
//                    ]
//                }).addStyleClass("width10Percent minwidth70px")
            ]
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

//        //-- Initialise Variables --//
//        var sStatusButtonText			= "";
//        var bButtonStatus				= false;
//
//        //-- Store the Device Status --//
//        var iDeviceStatus		= aDeviceData.DeviceStatus;
//        var iTogglePermission	= aDeviceData.PermToggle;
//        //var iTogglePermission	= 0;
//
//
//        //-- Set Text --//
//        if( iDeviceStatus===0 ) {
//            sStatusButtonText	= "Off";
//            bButtonStatus		= false;
//        } else {
//            sStatusButtonText	= "On";
//            bButtonStatus		= true;
//        }
//
//        //-- DEBUGGING --//
//        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);
//
//        //------------------------------------//
//        //-- Make the Container				--//
//        //------------------------------------//
//        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
//            items:[] 
//        }).addStyleClass("PadTop5px PadLeft5px width10Percent minwidth80px");	//-- END of VBox that holds the Toggle Button
//
//
//        //-- Add the Button's background colour class --//
//        if( iTogglePermission===0 ) {
//
//            //----------------------------//
//            //-- NON TOGGLEABLE BUTTON	--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    enabled: false
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch ")
//            );
//
//        } else {
//
//            //----------------------------//
//            //-- TOGGLEABLE BUTTON		--//
//            //----------------------------//
//            oUIStatusContainer.addItem(
//                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    state: bButtonStatus,
//                    change: function () {
//                //new sap.m.ToggleButton( oViewScope.createId( sPrefix+"_StatusToggle"), {
//                    //text: sStatusButtonText,
//                    //pressed: bButtonStatus,
//                    //press : function () {
//                        //-- Bind a link to this button for subfunctions --//
//                        var oCurrentButton = this;
//                        //-- AJAX --//
//                        IOMy.apiphp.AjaxRequest({
//                            url: IOMy.apiphp.APILocation("statechange"),
//                            type: "POST",
//                            data: { 
//                                "Mode":"ThingToggleStatus", 
//                                "Id": aDeviceData.DeviceId
//                            },
//                            onFail : function(response) {
//                                IOMy.common.showError(response.message, "Error Changing Device Status");
//                            },
//                            onSuccess : function( sExpectedDataType, aAjaxData ) {
//                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
//                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
//                                    //-- If turned Off --//
//                                    //if( aAjaxData.DevicePortStatus===0 ) {
//                                        //oCurrentButton.setText("Off");
//                                    //-- Else Turned On --//
//                                    //} else {
//                                        //oCurrentButton.setText("On");
//                                    //}
//
//                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
//                                }
//                            }
//                        });
//                    }
//                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
//                //}).addStyleClass("DeviceOverviewStatusToggleButton TextWhite Font-RobotoCondensed Font-Large"); //-- END of ToggleButton --//
//            );
//        }
//
//        oUIObject.addItem(oUIStatusContainer);
        //oUIObject.addItem(new sap.m.VBox({}).addStyleClass("width6px"));


		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	
	GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                
            });
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DisplayName+" has no sensors");
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