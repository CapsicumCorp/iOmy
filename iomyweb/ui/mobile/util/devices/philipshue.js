/*
Title: Philips Hue Device Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Provides the UI for a Philips Hue device entry.
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

$.sap.declare("IOMy.devices.philipshue",true);
IOMy.devices.philipshue = new sap.ui.base.Object();

$.extend(IOMy.devices.philipshue,{
	Devices: [],
	
	LinkTypeId		: 7,
    
    RSHue           : 3901,
    RSSaturation    : 3902,
    RSBrightness    : 3903,
	
	DevicePageID : "pPhilipsHue",
    
    CreateColourBox : function (sID) {
        var me = this;
        
        me.sColourBoxID = sID;
        
        if (sap.ui.getCore().byId(sID) !== undefined) {
            sap.ui.getCore().byId(sID).destroy();
        }
        
        var oColourBox = new sap.m.FlexBox(sID, {}).addStyleClass("width40px height40px FlexNoShrink");
        return oColourBox;
    },
    
    CreateLinkForm : function (oScope) {
        //===============================================//
        // DECLARE VARIABLES                             //
        //===============================================//
        
        // Labels
        var oIPAddressAndPortLabel;
        var oDeviceUserTokenLabel;
        // Fields
        // IP Address and Port
        var oIPAddressField;            // sap.m.Input
        var oColon;                     // sap.m.Text
        var oIPPort;                    // sap.m.Input
        var oIPAddressAndPortBox;       // sap.m.HBox
        // Device User Token
        var oDeviceUserTokenField;      // sap.m.Input
        
        //--------------------------------------------------------------------//
        // Change the help message for the New Link page.
        //--------------------------------------------------------------------//
        // TODO: Stick this in the locale file. Alter the mechanism to accommodate these extra messages.
        IOMy.help.PageInformation["pSettingsLinkAdd"] = "" +
            "Enter the IP address and port of the Philips Hue bridge, and also " +
            "the device user token for your device. This is located in your " +
            "Philips Hue bridge manual.\n\nAdding the bridge to iOmy will also " +
            "attempt to add all devices attached to the bridge as items in iOmy.";
        
        //===============================================//
        // CONSTRUCT ELEMENTS                            //
        //===============================================//
        
        //-----------------------------------------------//
        // IP ADDRESS AND PORT                           //
        //-----------------------------------------------//
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push("IPAddressLabel");
        oIPAddressAndPortLabel = new sap.m.Label(oScope.createId("IPAddressLabel"), {
            text : "IP Address and port (eg. 10.9.9.9 : 80)"
        });
        oScope.byId("formBox").addItem(oIPAddressAndPortLabel);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push("IPAddressField");
        oIPAddressField = new sap.m.Input(oScope.createId("IPAddressField"), {
            layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
            placeholder : "Enter IP Address..."
        }).addStyleClass("width100Percent SettingsTextInput");
        
        oScope.aElementsForAFormToDestroy.push("Colon");
        oColon = new sap.m.Text(oScope.createId("Colon"), {
            text : ":"
        }).addStyleClass("PadLeft5px PadRight5px FlexNoShrink MarTop15px");
        
        oScope.aElementsForAFormToDestroy.push("IPPortField");
        oIPPort = new sap.m.Input(oScope.createId("IPPortField"), {
            value : "80"
        }).addStyleClass("maxwidth80px SettingsTextInput");
        
        oScope.aElementsForAFormToDestroy.push("IPBox");
        oIPAddressAndPortBox = new sap.m.HBox(oScope.createId("IPBox"), {
            layoutData : new sap.m.FlexItemData({ growFactor : 1 }),
            items : [ oIPAddressField,oColon,oIPPort ]
        }).addStyleClass("width100Percent IPAddressBox");
        oScope.byId("formBox").addItem(oIPAddressAndPortBox);
        
        //-----------------------------------------------//
        // DEVICE USER TOKEN FIELD                       //
        //-----------------------------------------------//
        
        // LABEL
        oScope.aElementsForAFormToDestroy.push("DeviceUserTokenLabel");
        oDeviceUserTokenLabel = new sap.m.Label(oScope.createId("DeviceUserTokenLabel"), {
            text : "Device User Token Label"
        });
        oScope.byId("formBox").addItem(oDeviceUserTokenLabel);
        
        // FIELD
        oScope.aElementsForAFormToDestroy.push("DeviceUserTokenField");
        oDeviceUserTokenField = new sap.m.Input(oScope.createId("DeviceUserTokenField"), {
            placeholder : "Located in your Philips Hue bridge manual"
        }).addStyleClass("width100Percent SettingsTextInput");
        oScope.byId("formBox").addItem(oDeviceUserTokenField);
    },
    
    GetCommonUI: function( sPrefix, oViewScope, aDeviceData ) {
		//------------------------------------//
		//-- 1.0 - Initialise Variables		--//
		//------------------------------------//
		
		var oUIObject			= null;					//-- OBJECT:			--//
		var aUIObjectItems		= [];					//-- ARRAY:             --//
        
        
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
                            IOMy.common.NavigationChangePage("pPhilipsHue", {ThingId : aDeviceData.DeviceId});
                        }
                    }).addStyleClass("TextSizeMedium MarLeft6px MarTop20px Text_grey_20 iOmyLink")
                ]
            }).addStyleClass("width80Percent BorderRight webkitflex")
        );

        aUIObjectItems.push(
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

                        ]
                    }).addStyleClass("MarLeft6px MarAuto0px ")
                ]
            }).addStyleClass("minwidth90px minheight58px")
        );

        oUIObject = new sap.m.HBox( oViewScope.createId( sPrefix+"_Container"), {
            items: aUIObjectItems
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

        //-- Initialise Variables --//
        var bButtonStatus				= false;

        //-- Store the Device Status --//
        var iDeviceStatus		= aDeviceData.DeviceStatus;
        var iTogglePermission	= aDeviceData.PermToggle;


        //-- Set Text --//
        if( iDeviceStatus===0 ) {
            bButtonStatus		= false;
        } else {
            bButtonStatus		= true;
        }

        //------------------------------------//
        //-- Make the Container				--//
        //------------------------------------//
        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
            items:[] 
        }).addStyleClass("minwidth80px DeviceLabelMargin");	//-- END of VBox that holds the Toggle Button


        //-- Add the Button's background colour class --//
        if( iTogglePermission===0 ) {

            //----------------------------//
            //-- NON TOGGLEABLE BUTTON	--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    enabled: false
                }).addStyleClass("DeviceOverviewStatusToggleSwitch")
            );

        } else {

            //----------------------------//
            //-- SWITCH					--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    change: function () {
                        //-- Bind a link to this button for subfunctions --//
                        var oCurrentButton = this;
						oCurrentButton.setEnabled(false);
						
                        //-- AJAX --//
                        IOMy.apiphp.AjaxRequest({
                            url: IOMy.apiphp.APILocation("statechange"),
                            type: "POST",
                            data: { 
                                "Mode":"ThingToggleStatus", 
                                "Id": aDeviceData.DeviceId
                            },
                            onFail : function(response) {
                                IOMy.common.showError(response.responseText, "Error",
									function () {
										oCurrentButton.setState( !oCurrentButton.getState() );
										
										oCurrentButton.setEnabled(true);
									}
								);
                            },
                            onSuccess : function( sExpectedDataType, aAjaxData ) {
                                if( aAjaxData.ThingStatus!==undefined && aAjaxData.ThingStatus!==null ) {
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
									
									if (aAjaxData.ThingStatus === 0) {
										oCurrentButton.setState(false);
									} else if (aAjaxData.ThingStatus === 1) {
										oCurrentButton.setState(true);
									}
                                }
								oCurrentButton.setEnabled(true);
                            }
                        });
                    }
                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
            );
        }

        oUIObject.addItem(oUIStatusContainer);
		
		
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
                                IOMy.common.NavigationChangePage("pPhilipsHue", {ThingId : aDeviceData.DeviceId});
                            }
                        }).addStyleClass("TextSizeMedium MarLeft6px Text_grey_20")
                    ]
                }).addStyleClass("width80Percent BorderRight DeviceLabelMargin"),

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
							
							]
                        }).addStyleClass("MarLeft6px MarAuto0px")
                    ]
                }).addStyleClass("minheight58px minwidth90px")
            ]
        }).addStyleClass("ListItem");

        //--------------------------------------------------------------------//
        //-- ADD THE STATUS BUTTON TO THE UI								--//
        //--------------------------------------------------------------------//

        //-- Initialise Variables --//
        var bButtonStatus				= false;

        //-- Store the Device Status --//
        var iDeviceStatus		= aDeviceData.DeviceStatus;
        var iTogglePermission	= aDeviceData.PermToggle;
        //var iTogglePermission	= 0;


        //-- Set Text --//
        if( iDeviceStatus===0 ) {
            bButtonStatus		= false;
        } else {
            bButtonStatus		= true;
        }

        //-- DEBUGGING --//
        //jQuery.sap.log.debug("PERM = "+sPrefix+" "+iTogglePermission);

        //------------------------------------//
        //-- Make the Container				--//
        //------------------------------------//
        var oUIStatusContainer = new sap.m.VBox( oViewScope.createId( sPrefix+"_StatusContainer"), {
            items:[] 
        }).addStyleClass("minwidth80px DeviceLabelMargin");	//-- END of VBox that holds the Toggle Button


        //-- Add the Button's background colour class --//
        if( iTogglePermission===0 ) {

            //----------------------------//
            //-- NON TOGGLEABLE BUTTON	--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    enabled: false
                }).addStyleClass("DeviceOverviewStatusToggleSwitch ")
            );

        } else {

            //----------------------------//
            //-- SWITCH					--//
            //----------------------------//
            oUIStatusContainer.addItem(
                new sap.m.Switch( oViewScope.createId( sPrefix+"_StatusToggle"), {
                    state: bButtonStatus,
                    change: function () {
                        //-- Bind a link to this button for subfunctions --//
                        var oCurrentButton = this;
						oCurrentButton.setEnabled(false);
						
                        //-- AJAX --//
                        IOMy.apiphp.AjaxRequest({
                            url: IOMy.apiphp.APILocation("statechange"),
                            type: "POST",
                            data: { 
                                "Mode":"ThingToggleStatus", 
                                "Id": aDeviceData.DeviceId
                            },
                            onFail : function(response) {
                                IOMy.common.showError(response.message, "Error Changing Device Status",
									function () {
										oCurrentButton.setEnabled(true);
									}
								);
                            },
                            onSuccess : function( sExpectedDataType, aAjaxData ) {
                                //jQuery.sap.log.debug( JSON.stringify( aAjaxData ) );
                                if( aAjaxData.DevicePortStatus!==undefined || aAjaxData.DevicePortStatus!==null ) {
                                    IOMy.common.ThingList["_"+aDeviceData.DeviceId].Status = aAjaxData.ThingStatus;
                                }
								oCurrentButton.setEnabled(true);
                            }
                        });
                    }
                }).addStyleClass("DeviceOverviewStatusToggleSwitch") //-- END of ToggleButton --//
            );
        }

        oUIObject.addItem(oUIStatusContainer);
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
		//console.log(JSON.stringify(aDeviceData));
		var aTasks			= { "High":[], "Low":[] };					//-- ARRAY:			--//
		
		//------------------------------------//
		//-- 2.0 - Fetch TASKS				--//
		//------------------------------------//
		if( aDeviceData.IOs!==undefined ) {
            $.each(aDeviceData.IOs, function (sIndex, aIO) {
                if( aIO.RSTypeId===2001 ) {
                    aTasks.High.push({
                        "Type":"DeviceValueKW", 
                        "Data":{ 
                            "IOId":			aIO.Id, 
                            "IODataType":	aIO.DataTypeName,
                            "LabelId":			Prefix+"_kW"
                        }
                    });
                }
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