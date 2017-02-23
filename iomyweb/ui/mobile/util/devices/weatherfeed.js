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

$.sap.declare("IOMy.devices",true);
IOMy.devices.weatherfeed = new sap.ui.base.Object();

/**
 * This global module provides a mechanism to draw a device entry in lists such as
 * Device Overview, and Room Overview. Each entry will display information about
 * the device, or otherwise item, whether it's on or off, it varies between each
 * device type.
 * 
 * Error Codes are defined according to this convention:
 * 
 * 8:       Link ID
 * 81xx:    Link Form Validation Errors
 * 82xx:    Exceptions
 */
$.extend(IOMy.devices.weatherfeed,{
	Devices: [],
    
    uiIDs : {
        //---------------------------------------------//
        // Mini UI Entry
        //---------------------------------------------//
        sTemperatureDisplayID : "TemperatureDisplay",
        sHumidityDisplayID : "HumidityDisplay",
        sPressureDisplayID : "PressureDiplay",
        sConditionDisplayID : "ConditionDisplay",
        sWindDirectionDisplayID : "WindDirectionDisplay",
        sWindSpeedDisplayID : "WindSpeedDisplay",
        sSunriseDisplayID : "SunriseDisplay",
        sSunsetDisplayID : "SunsetDisplay",
        
        //---------------------------------------------//
        // Add Link Form
        //---------------------------------------------//
        sWeatherTypeID : "WeatherType",
        sKeyCodeID : "KeyCode",
        sStationCodeID : "StationCode",
        sRoomCBoxID : "Room",
        sLinkNameID : "LinkName" 
    },
    
    /**
     * Returns a map of API parameters containing the API URL and parameters.
     * 
     * @param {object} oScope               Scope of a given controller, usually the current one
     * @returns {map}
     */
    FetchAddLinkAPIAndParameters : function (oScope) {
        var me = this;              // Capture the scope of the device module
        var mData = {};             // Map for the AJAX request
        
        try {
            mData.url = IOMy.apiphp.APILocation("weather");
            mData.data = {
                "Mode" : "AddWeatherStation",
                "HubId" : oScope.byId("hubCBox").getSelectedKey(),
                "WeatherType" : "OpenWeatherMap",
                "Username" : oScope.byId(me.uiIDs.sKeyCodeID+"Field").getValue(),
                "StationCode" : oScope.byId(me.uiIDs.sStationCodeID+"Field").getValue(),
                "RoomId" : oScope.wRoomCBox.getSelectedItem().getKey(),
                "Data" : "{\"LinkName\" : \""+oScope.byId(me.uiIDs.sLinkNameID+"Field").getValue()+"\"}"
            };
            
        } catch (eAddLink8200) {
            throw "Error ADDLINK_8200: "+eAddLink8200.message;
        }
        
        return mData;
    },
    
    GetWeatherIcon : function (sText) {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        var me              = this;              // Captures the scope of this device module
        var sIcon           = "";
        
        if (sText === "Clear") {
            sIcon = "sap-icon://GoogleMaterial/wb_sunny";
        } else if (sText === "Clouds") {
            sIcon = "sap-icon://GoogleMaterial/wb_cloudy";
//        } else if (sText === "Rain") {
//            sIcon = "sap-icon://GoogleMaterial/wb_cloudy";
        } else {
            sIcon = ""
        }
        
        return sIcon;
    },
    
    CreateLinkForm : function (oScope, oFormBox, aElementsToEnableOnSuccess, aElementsToEnableOnFailure) {
        //===============================================\\
        // DECLARE VARIABLES
        //===============================================\\
        
        var me = this;                  // Used for capturing this scope.
        
        //var aRooms = IOMy.widgets.getRoomOptions("_"+IOMy.functions.getPremiseIDFromHub(oScope.byId("hubCBox").getSelectedKey()));
        
        var oFormItem;
        
        //===============================================\\
        // CONSTRUCT ELEMENTS
        //===============================================\\
        
        //-----------------------------------------------\\
        // NAME
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sLinkNameID+"Label");
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sLinkNameID+"Label"), {
            text : "Display Name"
        });
        oFormBox.addItem(oFormItem);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sLinkNameID+"Field");
        oFormItem = new sap.m.Input(oScope.createId(me.uiIDs.sLinkNameID+"Field"), {
            value : ""
        }).addStyleClass("width100px SettingsTextInput FlexNoShrink");
        oFormBox.addItem(oFormItem);
        
        //-----------------------------------------------\\
        // KEY CODE
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sKeyCodeID+"Label");
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sKeyCodeID+"Label"), {
            text : "Key Code"
        });
        oFormBox.addItem(oFormItem);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sKeyCodeID+"Field");
        oFormItem = new sap.m.Input(oScope.createId(me.uiIDs.sKeyCodeID+"Field"), {}).addStyleClass("width100Percent SettingsTextInput");
        oFormBox.addItem(oFormItem);
        
        //-----------------------------------------------\\
        // STATION CODE
        //-----------------------------------------------\\
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sStationCodeID+"Label");
        oFormItem = new sap.m.Label(oScope.createId(me.uiIDs.sStationCodeID+"Label"), {
            text : "Station Code"
        });
        oFormBox.addItem(oFormItem);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push(me.uiIDs.sStationCodeID+"Field");
        oFormItem = new sap.m.Input(oScope.createId(me.uiIDs.sStationCodeID+"Field"), {
            
        }).addStyleClass("width100Percent SettingsTextInput");
        oFormBox.addItem(oFormItem);
    },
    
    ValidateLinkFormData : function (oScope) {
        var me                      = this;
        var mNameInfo               = {};
        var mRoomInfo               = {};
        var mKeyCodeInfo            = {};
        var mStationCodeInfo        = {};
        
        var mValidationInfo         = {};
        var bError                  = false;
        var sCatchError             = "";
        var aErrorMessages          = [];
        
        mNameInfo           = me.ValidateName(oScope);
        mKeyCodeInfo        = me.ValidateKeyCode(oScope);
        mStationCodeInfo    = me.ValidateStationCode(oScope);
        
        // Validate Name
        try {
            if (mNameInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mNameInfo.aErrorMessages);
            }
        } catch (e) {
            // An exception is usually thrown because a coding error has occurred somewhere.
            bError = true;
            sCatchError = "ADDLINK_8201: There was an error validating the name. "+e.message;
            aErrorMessages.push(sCatchError);
            jQuery.sap.log.error(sCatchError);
        }
        
        // Validate Key Code
        try {
            if (mKeyCodeInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mKeyCodeInfo.aErrorMessages);
            }
        } catch (e) {
            // An exception is usually thrown because a coding error has occurred somewhere.
            bError = true;
            sCatchError = "ADDLINK_8203: There was an error validating the key code."+e.message;
            aErrorMessages.push(sCatchError);
            jQuery.sap.log.error(sCatchError);
        }

        // Validate Station Code
        try {
            if (mStationCodeInfo.bError === true) {
                bError = true;
                aErrorMessages = aErrorMessages.concat(mStationCodeInfo.aErrorMessages);
            }
        } catch (e) {
            // An exception is usually thrown because a coding error has occurred somewhere.
            bError = true;
            sCatchError = "ADDLINK_8204: There was an error validating the station code."+e.message;
            aErrorMessages.push(sCatchError);
            jQuery.sap.log.error(sCatchError);
        }
        
        mValidationInfo.bError = bError;
        mValidationInfo.aErrorMessages = aErrorMessages;
        
        return mValidationInfo;
    },
    
    ValidateName : function (oScope) {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var oField                  = oScope.byId(me.uiIDs.sLinkNameID+"Field");
        
        //-------------------------------------------------\\
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oField.getValue().trim().length === 0) {
                bError = true;
                aErrorMessages.push("Name must be specified");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x8103: There was an error checking the name: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    /*ValidateRoom : function (oScope) {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var oField                  = oScope.byId(me.uiIDs.sRoomCBoxID+"Field");
        
        //-------------------------------------------------\\
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oField.getSelectedKey() === "") {
                bError = true;
                if (oField.getValue().trim().length === 0) {
                    aErrorMessages.push("Room must be specified");
                } else {
                    aErrorMessages.push("Room is not valid");
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x8101: There was an error checking the room: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },*/
    
    ValidateKeyCode : function (oScope) {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var oField                  = oScope.byId(me.uiIDs.sKeyCodeID+"Field");
        
        //-------------------------------------------------\\
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oField.getValue().trim().length === 0) {
                bError = true;
                aErrorMessages.push("Key code must be specified");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x8103: There was an error checking the key code: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    ValidateStationCode : function (oScope) {
        var me                      = this;
        var bError                  = false;
        var aErrorMessages          = [];
        var mInfo                   = {}; // MAP: Contains the error status and any error messages.
        var oField                  = oScope.byId(me.uiIDs.sStationCodeID+"Field");
        
        //-------------------------------------------------\\
        // Is the hub a proper hub (does it have an ID)
        //-------------------------------------------------\\
        try {
            if (oField.getValue().trim().length === 0) {
                bError = true;
                aErrorMessages.push("Station code must be specified");
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x8104: There was an error checking the station code: "+e.message);
        }
        
        // Prepare the return value
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
    
    FetchCurrentWeather : function (iThingId, oScope, sPrefix) {
        var me = this;
        
        //console.log(iThingId);
        
        IOMy.apiphp.AjaxRequest({
            url : IOMy.apiphp.APILocation("weather"),
            data: {
                "Mode" : "FetchCurrentWeather",
                "ThingId" : iThingId
            },
            
            onSuccess : function (type, data) {
                //console.log(data);
                
                if (data.Error === false) {
                    var temperature     = data.Data.Temperature;
                    var humidity        = data.Data.Humidity;
                    var pressure        = data.Data.Pressure;
                    var condition       = data.Data.Condition;
                    var windDirection   = data.Data.WindDirection;
                    var windSpeed       = data.Data.WindSpeed;
                    var sunrise         = data.Data.Sunrise;
                    var sunset          = data.Data.Sunset;
                    
                    var dateSunrise, dateSunset;
                    
                    //---------------------------------------------------------//
                    // Temperature
                    //---------------------------------------------------------//
                    try {
                        if (oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID).setText( Math.round(temperature.Value).toString() + temperature.UomName );
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Sunrise
                    //---------------------------------------------------------//
                    if (oScope.byId(sPrefix + me.uiIDs.sSunriseDisplayID) !== undefined) {
                        try {
                            dateSunrise = new Date(sunrise.Value * 1000);
                            oScope.byId(sPrefix + me.uiIDs.sSunriseDisplayID).setText( IOMy.functions.getTimestampString(dateSunrise, "") );
                        } catch (e) {
                            jQuery.sap.log.error(e.message);
                            oScope.byId(sPrefix + me.uiIDs.sSunriseDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Sunset
                    //---------------------------------------------------------//
                    if (oScope.byId(sPrefix + me.uiIDs.sSunsetDisplayID) !== undefined) {
                        try {
                            dateSunset = new Date(sunset.Value * 1000);
                            oScope.byId(sPrefix + me.uiIDs.sSunsetDisplayID).setText( IOMy.functions.getTimestampString(dateSunset, "") );
                        } catch (e) {
                            jQuery.sap.log.error(e.message);
                            oScope.byId(sPrefix + me.uiIDs.sSunsetDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Humidity
                    //---------------------------------------------------------//
                    try {                        
                        if (oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID).setText( humidity.Value.toString() + humidity.UomName );
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Air Pressure
                    //---------------------------------------------------------//
                    try {
                        if (oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID).setText( pressure.Value.toString() + pressure.UomName );
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Weather Condition (Rain, hail, or shine)
                    //---------------------------------------------------------//
                    try {
                        if (oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID).setText( condition.Value.toString() + condition.UomName );
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Wind Direction
                    //---------------------------------------------------------//
                    try {
                        if (oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID).setText( windDirection.Value.toString() + windDirection.UomName);
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID).setText( "N/A" );
                        }
                    }
                    
                    //---------------------------------------------------------//
                    // Wind Speed
                    //---------------------------------------------------------//
                    try {
                        if (oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID).setText( windSpeed.Value.toString() + windSpeed.UomName);
                        }
                    } catch (e) {
                        jQuery.sap.log.error(e.message);
                        if (oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID) !== undefined) {
                            oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID).setText( "N/A" );
                        }
                    }
                } else {
                    this.setFailureNotices(data.ErrMesg);
                }
            },
            
            onFail : function (response) {
                this.setFailureNotices(JSON.stringify(response));
            },
            
            setFailureNotices : function (errMessage) {
                IOMy.common.showError("Failed to load the weather information:\n\n"+errMessage, "Error");
                jQuery.sap.log.error(errMessage);
                
                if (oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sTemperatureDisplayID).setText( "N/A" );
                }

                if (oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sHumidityDisplayID).setText( "N/A" );
                }

                if (oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sPressureDisplayID).setText( "N/A" );
                }

                if (oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sConditionDisplayID).setText( "N/A" );
                }

                if (oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sWindDirectionDisplayID).setText( "N/A" );
                }

                if (oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID) !== undefined) {
                    oScope.byId(sPrefix + me.uiIDs.sWindSpeedDisplayID).setText( "N/A" );
                }
            }
            
        });
    },
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData, bIsUnassigned ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        var me                  = this;                 //-- SCOPE: weather feed scope  --//
        
        
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
                        text : aDeviceData.DeviceName,
                        press : function () {
                            //console.log(aDeviceData);
                            IOMy.common.NavigationChangePage("pThermostat", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("width100Percent Font-RobotoCondensed Font-Medium PadLeft6px PadTop20px PadBottom15px TextLeft Text_grey_20")
                ]
            }).addStyleClass("width100Percent BorderRight")
        );

        aUIObjectItems.push(
            //------------------------------------//
            //-- 2nd is the weather information --//
            //------------------------------------//
            new sap.m.HBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sTemperatureDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft"),
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sHumidityDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft"),
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sWindSpeedDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft")
                        ]
                    }).addStyleClass("MarLeft5px"),
                    
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sPressureDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft"),
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sConditionDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft"),
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sWindDirectionDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft")
                        ]
                    }).addStyleClass("MarLeft5px")
                
                ]
            }).addStyleClass("width100Percent")
        );

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");
		
		
		//------------------------------------//
		//-- 3.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
    GetCommonUIForDeviceOverview: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        var me                  = this;                 //-- SCOPE: weather feed scope  --//
        
        
        //------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
		//console.log(aDeviceData.DeviceId);
        
        aUIObjectItems.push(
            //------------------------------------//
            //-- 1st is the Device Label		--//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.Link( oViewScope.createId( sPrefix+"_Label"), {
                        text : aDeviceData.DeviceName,
                        press : function () {
                            //console.log(aDeviceData);
                            IOMy.common.NavigationChangePage("pThermostat", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("width100Percent Font-RobotoCondensed Font-Medium PadLeft6px PadTop20px PadBottom15px TextLeft Text_grey_20")
                ]
            }).addStyleClass("testlabelcont BorderRight")
        );

        aUIObjectItems.push(
            //------------------------------------//
            //-- 2nd is the weather information --//
            //------------------------------------//
            new sap.m.VBox({
                items : [
                    new sap.m.VBox({
                        items : [
                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sTemperatureDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft"),

                            new sap.m.Label(oViewScope.createId(sPrefix + me.uiIDs.sConditionDisplayID),{
                                text : "Loading..."
                            }).addStyleClass("Font-RobotoCondensed Font-Medium TextLeft")
                        ]
                    }).addStyleClass("PadLeft5px DeviceDataBox")
                ]
            }).addStyleClass("minwidth175px")
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
		
        //console.log(aDeviceData);
        this.FetchCurrentWeather(aDeviceData.DeviceId, oViewScope, Prefix);
		
		return aTasks;
	},
    
    GetCommonUITaskListForDeviceOverview: function( Prefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
        //console.log(aDeviceData);
		this.FetchCurrentWeather(aDeviceData.DeviceId, oViewScope, Prefix);
        
		return aTasks;
	},
	
	// TODO: Is this really necessary since each module has this function that is only called internally?
	GetObjectIdList: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		var aObjectIdList = [];
		
		
		//------------------------------------//
		//-- 2.0 - Fetch Definition names	--//
		//------------------------------------//
		
		
        aObjectIdList = [
            sPrefix+"_Container",
            sPrefix+"_Label",
            sPrefix+"_DataContainer",
            sPrefix+"_StatusContainer",
            sPrefix+"_StatusToggle",
            sPrefix + this.uiIDs.sTemperatureDisplayID,
            sPrefix + this.uiIDs.sHumidityDisplayID,
            sPrefix + this.uiIDs.sWindSpeedDisplayID,
            sPrefix + this.uiIDs.sPressureDisplayID,
            sPrefix + this.uiIDs.sConditionDisplayID,
            sPrefix + this.uiIDs.sWindDirectionDisplayID
        ];
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return aObjectIdList;
	}
});