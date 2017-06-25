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

$.sap.declare("IOMy.devices.ipcamera",true);
IOMy.devices.ipcamera = new sap.ui.base.Object();

$.extend(IOMy.devices.ipcamera,{
	
	RSNetworkAddress	: 3960,
	RSNetworkPort		: 3961,
	RSUsername			: 3962,
	RSPassword			: 3963,
	RSPath				: 3964,
	RSProtocol			: 3965,
	
	urlAddress			: null,
	urlPort				: null,
	urlProtocol			: null,
	urlPath				: null,
	urlUsername			: null,
	urlPassword			: null,
	
	ODataCallsToMake	: 6,
	runningODataCalls	: false,
	
	
	DevicePageID : "pDeviceMPEGStream",
	
	loadCameraInformation : function(mSettings) {
		var me				= this;
		var bError			= false;
		var aErrorMessages	= [];
		var iNetAddrIO		= 0;
		var iNetPortIO		= 0;
		var iUsernameIO		= 0;
		var iPasswordIO		= 0;
		var iPathIO			= 0;
		var iProtocolIO		= 0;
		var iThingId;
		var sUrl;
		var mThingIdInfo;
		var mThing;
		var fnSuccess;
		var fnFail;
		
		//-- Variables to handle the concurrent calls to the OData service. --//
		var aConfigs		= [];
		var fnUpdateCounter = function () {
			me.ODataCallsToMake--;
			if (me.ODataCallsToMake === 0) {
				var mThing					= IOMy.common.ThingList["_"+iThingId];
				var bAuthenticationRequired = false;
				var mData		= {
					Hub		: IOMy.functions.getHubConnectedToThing(mThing.Id).HubId,
					
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
				
				mData.Protocol					= me.urlProtocol;
				mData.Address					= me.urlAddress;
				mData.Port						= me.urlPort;
				mData.Path						= me.urlPath;
				mData.Username					= me.urlUsername;
				mData.Password					= me.urlPassword;
				mData.AuthenticationRequired	= bAuthenticationRequired;
				
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
			mThingIdInfo	= IOMy.validation.isThingIDValid(mSettings.thingID);
			bError			= !mThingIdInfo.bIsValid;
			aErrorMessages	= mThingIdInfo.aErrorMessages;
            
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
				Url				: sUrl,
				Columns			: ["CALCEDVALUE"],
				WhereClause		: ["IO_PK eq " + aConfigs[i].ID],
				OrderByClause	: ["UTS desc"],
				Limit			: 1,

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
	 * @param {type} iThingId			ID of the camera to load the stream for.
	 */
	loadStreamUrl : function (mSettings) {
		var bError					= false;
		var aErrorMessages			= [];
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
				
				bError			= !mThingIDInfo.bIsValid;
				aErrorMessages	= aErrorMessages.concat(mThingIDInfo.aErrorMessages);
				
				if (!bError) {
					iThingId = mSettings.thingID;
				}
			} else {
				fnAppendError("Thing ID (thingID) must be specified!");
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
			throw new MissingSettingsMapException();
		}
		
		//--------------------------------------------------------------------//
		// Attempt to load the URL and parse it to the MJPEG page and report
		// any errors.
		//--------------------------------------------------------------------//
		IOMy.apiphp.AjaxRequest({
			url			: IOMy.apiphp.APILocation("ipcamera"),
			type		: "POST",
			data		: "Mode=FetchStreamUrl&ThingId="+iThingId,

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
                            IOMy.common.NavigationChangePage("pDeviceMPEGStream", { "ThingId" : aDeviceData.DeviceId });
                        }
                    }).addStyleClass("MarLeft6px MarTop20px TextSizeMedium Text_grey_20 iOmyLink")
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