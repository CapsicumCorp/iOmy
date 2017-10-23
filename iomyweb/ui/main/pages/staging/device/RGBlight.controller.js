/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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
$.sap.require("sap.ui.unified.ColorPicker");
sap.ui.controller("pages.staging.device.RGBlight", {
    
    fHueConversionRate              : 65535 / 360,  // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
    fSaturationConversionRate       : 1.44,         // 144 / 100 (100 being the max saturation value)
    fLightConversionRate            : 2.54,         // 254 / 100 (likewise)
	iThingId                        : null,
	iThingTypeId                        : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/
	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (oEvent) {
                var iTypeId;
                
                if (oEvent.data.ThingId !== undefined && oEvent.data.ThingId !== null) {
                    oController.iThingId = oEvent.data.ThingId;
                    iTypeId = IomyRe.common.ThingList["_"+oEvent].TypeId;
                }
				
				oController.InitialDeviceInfoLoad();
				oController.RGBUiDraw();
                
                if (iTypeId == IomyRe.devices.philipshue.ThingTypeId) {
                    oController.fHueConversionRate          = 65535 / 360;  // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                    oController.fSaturationConversionRate   = 1.44;         // 144 / 100 (100 being the max saturation value)
                    oController.fLightConversionRate        = 2.54;         // 254 / 100 (likewise)
                    
                } else if (iTypeId == IomyRe.devices.csrmesh.ThingTypeId) {
                    oController.fHueConversionRate          = 1;
                    oController.fSaturationConversionRate   = 2.55;
                    oController.fLightConversionRate        = 2.55;
                }
                
                oController.iThingTypeId = iTypeId;
				
				//-- Defines the Screen Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
				
				//-- Updates Paramaters & ID's on Load --//
				//-- Brent to add in logic to update the UI with id's from the Database --//
			}
		});		
	},
	
	//-- Sets the RGB Color parameters based on static data --//
	//--  (#ToDo# - convert to pull from the DB) --//
	RGBInit: function (sHSV) {
		var oView = this.getView();
		oView.byId("CPicker").setColorString(sHSV);
	},
		
	//-- Adds a "WhiteLight" button if the devicetype === "CSR" --//
	//--  (#ToDo# - Convert to pull RGBType from Thinglist) --//
	RGBUiDraw: function () {
		var oView       = this.getView();
        var mThing      = IomyRe.common.ThingList["_"+this.iThingId];
		
		try {
			if (mThing.TypeId === IomyRe.devices.philipshue.ThingTypeId) {
				//$.sap.log.error("RGBUiDraw:" +RGBType);
			} else if (mThing.TypeId === IomyRe.devices.csrmesh.ThingTypeId) {
				oView.byId("RGB_Cont").addContent(IomyRe.widgets.CSRbutton(this));
			}		
		} catch(e1) {
			$.sap.log.error("RGBUiDraw: Critcal Error."+e1.message);
			$.sap.log.error("RGBType set incorrectly. Device Type ID received:"+mThing.TypeId);
			return false;
		}		
		
	},
    
    /**
     * Loads the information about the currently selected Philips Hue light (colour/hue,
     * saturation, brightness, and on/off status) through an AJAX request to the Philips
     * Hue API.
     */
    InitialDeviceInfoLoad : function () {
        var oController = this;
        //--------------------------------------------------------------------//
        // Acquire the thing's IOs and construct the query strings.
        //--------------------------------------------------------------------//
        var mIOs        = IomyRe.common.ThingList["_"+this.iThingId].IO;
        var aIOFilter   = [];
        
        try {
            $.each(mIOs, function (sI, aIO) {
                if (sI !== undefined && sI !== null && aIO !== undefined && aIO !== null) {
                    aIOFilter.push("IO_PK eq "+aIO.Id);
                }
            });
            
            IomyRe.apiodata.AjaxRequest({
                Url : IomyRe.apiodata.ODataLocation("dataint"),
                Columns : ["CALCEDVALUE","UTS","RSTYPE_PK","IO_PK"],
                WhereClause : [
                    "THING_PK eq "+oController.iThingId,
                    "("+aIOFilter.join(" or ")+")",

                    //"RSTYPE_PK eq "+3901+" or RSTYPE_PK eq "+3902+" or RSTYPE_PK eq "+3903
                ],
                OrderByClause : ["UTS desc"],
                Limit : 3,
                format : 'json',

                onSuccess : function (response, data) {
                    var iHue;
                    var iSaturation;
                    var iLight;
                    
                    for (var i = 0; i < data.length; i++) {
                        //console.log(JSON.stringify(data));
                        //----------------------------------------------------//
                        // If we're grabbing the HUE value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3901) {
                            iHue = data[i].CALCEDVALUE / oController.fHueConversionRate;
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the SATURATION value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3902) {
                            iSaturation = data[i].CALCEDVALUE / oController.fSaturationConversionRate;
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the BRIGHTNESS value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3903) {
                            iLight = data[i].CALCEDVALUE / oController.fLightConversionRate;
                        }
                    }
                    
                    //--------------------------------------------------------//
                    // Set the colour on the page
                    //--------------------------------------------------------//
                    oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
                },

                onFail : function (response) {
                    jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
                }
            });
        } catch (e) {
            jQuery.sap.log.error("There was an error loading the OData services: "+e.message);
        }
    },
    
    /**
     * Event function that is called whenever the colour values have changed in
     * the colour picker.
     * 
     * @param {object} oEvent       UI5 Control Event of the calling widget.
     */
    ChangeLightColour : function (oEvent) {
        var oController = this;
        var mParameters = oEvent.getParameters();
        var iHue        = Math.floor(mParameters.h * this.fHueConversionRate);
        var iSat        = Math.floor(mParameters.s * this.fSaturationConversionRate);
        var iLight      = Math.floor(mParameters.v * this.fLightConversionRate);
        
        IomyRe.apiphp.AjaxRequest({
            url : IomyRe.apiphp.APILocation("philipshue"),
            method : "POST",
            data : {
                Mode : "ChangeHueSatLig",
                ThingId : oController.iThingId,
                Hue : iHue,
                Saturation : iSat,
                Brightness : iLight
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was a fatal error changing information about the current Hue device: "+JSON.stringify(response));
            }
        });
    }
		
});