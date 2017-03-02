/*
Title: Thermostat Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI and functionality for a Thermostat entry.
Copyright: Capsicum Corporation 2017

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

$.sap.declare("IOMy.devices.thermostat",true);
IOMy.devices.thermostat = new sap.ui.base.Object();

$.extend(IOMy.devices.thermostat,{
	Devices: [],
    
    //---------------------------------------------------//
    // Module properties
    //---------------------------------------------------//
    
    // -- INTEGERS
    iODataFieldsToFetch         : 2,
    iODataFieldsFailedToFetch   : 0,
    bWaitingToLoadAPI           : false,
    bLoadingFieldsFromAPI       : false,
    bLoadingMotionSensorFields  : false,
    
    // -- Resource Types for the Window Sensor IOs
    RSBattery       : 2111,
    RSMisc          : 4000,
    RSBitwiseStatus : 3909,
    RSTemperature   : 1701,
    
    //-- Link and Thing Types IDs --//
    LinkTypeID          : -6,
    ThingTypeID         : -6,
	
	GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        
        //------------------------------------//
		//-- 2.0 - Fetch UI					--//
		//------------------------------------//
		
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
                                IOMy.common.NavigationChangePage("pDeviceTestThermostat", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px Text_grey_20")
                    ]
                }).addStyleClass("BorderRight width80Percent DeviceLabelMargin"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.HBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//
                            items: [
                                new sap.m.VBox({
                                    items : [
                                        //----------------------------------//
                                        // Temperature
                                        //----------------------------------//
										new sap.m.Label({
                                            text : "Temp: 29°C"
                                        }).addStyleClass("Font-RobotoCondensed width65px"),
                                    ]
                                }),
								new sap.m.VBox({
                                    items : [
                                        //----------------------------------//
                                        // Temperature
                                        //----------------------------------//
										new sap.m.Label({
                                            text : "Mode: Off"
                                        }).addStyleClass("Font-RobotoCondensed width65px MarLeft15px"),
                                    ]
                                })
                            ]
                        }).addStyleClass("MarLeft12px MarAuto0px")
                    ]
                }).addStyleClass("minheight58px minwidth170px")
            ]
        }).addStyleClass("ListItem");
		
		
		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
    
   /* Not Currently Being used as switched over to CommonUI
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
                                IOMy.common.NavigationChangePage("pDeviceTestThermostat", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("width100Percent Font-RobotoCondensed TextSizeMedium PadLeft6px DeviceOverview-ItemLabel TextLeft Text_grey_20")
                    ]
                }).addStyleClass("BorderRight testlabelcont"),

                //------------------------------------//
                //-- 2nd is the Device Data			--//
                //------------------------------------//
                new sap.m.VBox({
                    items : [
                        new sap.m.VBox( oViewScope.createId( sPrefix+"_DataContainer"), {
                            //--------------------------------//
                            //-- Draw the Data Boxes		--//
                            //--------------------------------//

                            items: [
                                new sap.m.HBox({
                                    items : [
                                        //----------------------------------//
                                        // Last Motion
                                        //----------------------------------//
                                        new sap.m.Label({
                                            text : "Last Motion:"
                                        }).addStyleClass("Font-RobotoCondensed"),
                                        
                                        new sap.m.Text( oViewScope.createId( sPrefix+"_LastMotion" ),	{} ).addStyleClass("PadLeft5px Font-RobotoCondensed width110px")
                                    ]
                                })
                            ]
                        }).addStyleClass("DeviceOverview-ItemLabel PadLeft5px MarBottom3px MarRight10px TextLeft")
                    ]
                }).addStyleClass("width10Percent minwidth70px")
            ]
        }).addStyleClass("ListItem");


		//------------------------------------//
		//-- 9.0 - RETURN THE RESULTS		--//
		//------------------------------------//
		return oUIObject;
	},
	*/
	
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
            this.CallAPI(aDeviceData.DeviceId, null, oViewScope.byId( Prefix+"_LastMotion" ));
        } else {
            //-- TODO: Write a error message --//
            jQuery.sap.log.error("Device "+aDeviceData.DeviceName+" has no IOs");
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