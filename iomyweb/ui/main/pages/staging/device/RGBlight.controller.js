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
	iThingTypeId                    : null,
    
    bFirstRun                       : true,
    bUsingAdvancedUI                : false,
    
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
                    iTypeId = IomyRe.common.ThingList["_"+oEvent.data.ThingId].TypeId;
                    oView.byId("ToolbarTitle").setText( IomyRe.common.ThingList["_"+oEvent.data.ThingId].DisplayName );
                }
                
                oController.iThingTypeId = iTypeId;
                oController.RGBUiDraw();
                
                if (iTypeId == IomyRe.devices.philipshue.ThingTypeId) {
                    oController.InitialDeviceInfoLoad();
                    oController.fHueConversionRate          = 65535 / 360;  // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                    oController.fSaturationConversionRate   = 1.44;         // 144 / 100 (100 being the max saturation value)
                    oController.fLightConversionRate        = 2.54;         // 254 / 100 (likewise)
                    
                    oView.byId("hueSlider").setMax(65535);
                    oView.byId("satSlider").setMax(144);
                    oView.byId("briSlider").setMax(254);
                    
                } else if (iTypeId == IomyRe.devices.csrmesh.ThingTypeId) {
                    oController.fHueConversionRate          = 1;
                    oController.fSaturationConversionRate   = 2.55;
                    oController.fLightConversionRate        = 2.55;
                    
                    oView.byId("hueSlider").setMax(360);
                    oView.byId("satSlider").setMax(255);
                    oView.byId("briSlider").setMax(255);
                }
				
				//-- Defines the Screen Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
		});		
	},
    
    ChangeColourInBox : function (iHue, iSat, iBright) {
        var oController = this;
        var oView       = this.getView();
        
        iHue            = Math.floor(iHue / this.fHueConversionRate);
        iSat            = Math.floor(iSat / this.fSaturationConversionRate);
        iBright         = Math.floor(iBright / this.fLightConversionRate) / 2;
        
        console.log("H:"+iHue);
        console.log("S:"+iSat);
        console.log("B:"+iBright);
        
        document.getElementById(oView.createId("ColourBox")).style = "background: hsl("+iHue+","+iSat+"%,"+iBright+"%);";
    },
    
    SetSliderValues : function (iHue, iSat, iBright) {
        var oView       = this.getView();
        
        oView.byId("hueSlider").setValue(iHue);
        oView.byId("satSlider").setValue(iSat);
        oView.byId("briSlider").setValue(iBright);
    },
	
	//-- Sets the RGB Color parameters based on static data --//
	RGBInit: function (iHue, iSaturation, iLight) {
        var oController     = this;
		var oView           = this.getView();
        var sColourString;
        
        iHue            = Math.floor(iHue / this.fHueConversionRate);
        iSaturation     = Math.floor(iSaturation / this.fSaturationConversionRate);
        iLight          = Math.floor(iLight / this.fLightConversionRate) / 2;
        
        sColourString   = "hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")";
        
        if (oView.byId("CPicker") !== undefined) {
            oView.byId("CPicker").setColorString(sColourString);
        }
	},
		
	//-- Adds a "WhiteLight" button if the devicetype === "CSR" --//
	RGBUiDraw: function () {
		var oView       = this.getView();
        var mThing      = IomyRe.common.ThingList["_"+this.iThingId];
		
		try {
            if (oView.byId("WhiteLight_Cont") !== undefined) {
                oView.byId("WhiteLight_Cont").destroy();
            }
            
            //this.SwitchToSimpleView();
            
			if (mThing.TypeId == IomyRe.devices.philipshue.ThingTypeId) {
				//$.sap.log.error("RGBUiDraw:" +RGBType);
			} else if (mThing.TypeId == IomyRe.devices.csrmesh.ThingTypeId) {
				oView.byId("RGB_Cont").addContent(IomyRe.widgets.CSRbutton(this));
			}		
		} catch(e1) {
			$.sap.log.error("RGBUiDraw: Critcal Error."+e1.message);
			$.sap.log.error("RGBType set incorrectly. Device Type ID received:"+mThing.TypeId);
			return false;
		}		
		
	},
    
    SwitchToSimpleView : function () {
        var oController     = this;
        var oView           = this.getView();
        var oContainer      = oView.byId("RGB_Cont");
        var mSliderValues   = IomyRe.functions.convertRGBToHSL(oView.byId("CPicker").getColorString());
        
        oContainer.destroyContent();
        
        if (oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = false;
            
            var iMaxHue, iMaxSaturation, iMaxBrightness;
            
            if (oController.iThingTypeId == IomyRe.devices.philipshue.ThingTypeId) {
                iMaxHue         = 65535;
                iMaxSaturation  = 144;
                iMaxBrightness  = 254;
                
            } else if (oController.iThingTypeId == IomyRe.devices.csrmesh.ThingTypeId) {
                iMaxHue         = 360;
                iMaxSaturation  = 255;
                iMaxBrightness  = 255;
            }
            
            oContainer.addContent(
                IomyRe.widgets.LightBulbControlsContainer(oController, {
                    maxHue          : iMaxHue,
                    maxSaturation   : iMaxSaturation,
                    maxBrightness   : iMaxBrightness,
                    
                    hue             : mSliderValues.hue * this.fHueConversionRate,
                    saturation      : mSliderValues.saturation * this.fSaturationConversionRate,
                    brightness      : mSliderValues.light * this.fLightConversionRate,
                    
                    advancedViewPress : function () {
                        oController.SwitchToAdvancedView();
                    },
                    
                    change : function () {
                        oController.ChangeLightColour();
                    },
                    
                    liveChange : function () {
                        var iHue = oView.byId("hueSlider").getValue();
                        var iSat = oView.byId("satSlider").getValue();
                        var iBright = oView.byId("briSlider").getValue();
                    
                        oController.ChangeColourInBox(iHue, iSat, iBright);
                    }
                })
            );
        
            oController.ChangeColourInBox(mSliderValues.hue, mSliderValues.saturation, mSliderValues.light);
        }
    },
    
    SwitchToAdvancedView : function () {
        var oController = this;
        var oView       = this.getView();
        var oContainer  = oView.byId("RGB_Cont");
        var iHue = oView.byId("hueSlider").getValue();
        var iSat = oView.byId("satSlider").getValue();
        var iBright = oView.byId("briSlider").getValue();
        
        iHue    = Math.floor(iHue / this.fHueConversionRate);
        iSat    = Math.floor(iSat / this.fSaturationConversionRate);
        iBright = Math.floor(iBright / this.fLightConversionRate);
        
        oContainer.destroyContent();
        
        if (!oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = true;
            
            oContainer.addContent(IomyRe.widgets.LightBulbColorPicker(oController, {
                colorString : "hsv("+iHue+","+iSat+","+iBright+")",
                
                simpleViewPress : function () {
                    oController.SwitchToSimpleView();
                },
                
                change : function (oEvent) {
                    oController.ChangeLightColour(oEvent);
                },
            }));
        }
    },
    
    /**
     * Loads the information about the currently selected Philips Hue light (colour/hue,
     * saturation, brightness, and on/off status) through an AJAX request to the Philips
     * Hue API.
     */
    InitialDeviceInfoLoad : function () {
        var oController = this;
        var oView       = this.getView();
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
                            iHue = data[i].CALCEDVALUE;// / oController.fHueConversionRate;
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the SATURATION value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3902) {
                            iSaturation = data[i].CALCEDVALUE;// / oController.fSaturationConversionRate;
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the BRIGHTNESS value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3903) {
                            iLight = data[i].CALCEDVALUE;// / oController.fLightConversionRate;
                        }
                    }
                    
                    //--------------------------------------------------------//
                    // Set the colour on the page
                    //--------------------------------------------------------//
                    if (oController.bUsingAdvancedUI) {
                        oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
                    } else {
                        oController.ChangeColourInBox(Math.round(iHue), Math.round(iSaturation), Math.round(iLight));
                        oController.SetSliderValues(iHue, iSaturation, iLight);
                    }
                },

                onFail : function (response) {
                    jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
                }
            });
        } catch (e) {
            jQuery.sap.log.error("There was an error loading the OData service: "+e.message);
        }
    },
    
    /**
     * Event function that is called whenever the colour values have changed in
     * the colour picker.
     * 
     * @param {object} oEvent       UI5 Control Event of the calling widget.
     */
    ChangeLightColour : function (oEvent) {
        var oController     = this;
        var oView           = this.getView();
        var mParameters;
        
        if (oEvent === undefined) {
            mParameters = {
                h : oView.byId("hueSlider").getValue() / oController.fHueConversionRate,
                s : oView.byId("satSlider").getValue() / oController.fSaturationConversionRate,
                v : oView.byId("briSlider").getValue() / oController.fLightConversionRate
            };
        } else {
            mParameters = oEvent.getParameters();
        }
        
        if (mParameters.h === 360) {
            mParameters.h = 0;
        }
        
        var iHue            = Math.floor(mParameters.h * this.fHueConversionRate);
        var iSat            = Math.floor(mParameters.s * this.fSaturationConversionRate);
        var iLight          = Math.floor(mParameters.v * this.fLightConversionRate);
        var iDeviceType     = IomyRe.common.ThingList["_"+this.iThingId].TypeId;
        
        var mRequestData    = {
            "method" : "POST",
            "onFail" : function (response) {
                jQuery.sap.log.error("There was a fatal error changing light bulb properties: "+JSON.stringify(response));
            }
        };
        
//        if (!oController.bFirstRun) {
            
            if (iDeviceType == IomyRe.devices.philipshue.ThingTypeId) {
                mRequestData.url    = IomyRe.apiphp.APILocation("philipshue");
                mRequestData.data   = {
                    "Mode" : "ChangeHueSatLig",
                    "ThingId" : oController.iThingId,
                    "Hue" : iHue,
                    "Saturation" : iSat,
                    "Brightness" : iLight
                };
                
                IomyRe.apiphp.AjaxRequest(mRequestData);
                
            } else if (iDeviceType == IomyRe.devices.csrmesh.ThingTypeId) {
                mRequestData.url    = IomyRe.apiphp.APILocation("light");
                mRequestData.data   = {
                    "Mode" : "ChangeColorBrightness",
                    "ThingId" : oController.iThingId,
                    "Data" : JSON.stringify({
                        "NewValue" : {
                            "Hue" : iHue,
                            "Saturation" : iSat,
                            "Brightness" : iLight
                        }
                    })
                };
                
                IomyRe.apiphp.AjaxRequest(mRequestData);
                
            }
            
//        } else {
//            oController.bFirstRun = false;
//        }
    }
		
});