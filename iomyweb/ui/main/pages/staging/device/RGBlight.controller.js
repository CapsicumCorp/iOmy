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
                if (oController.bUsingAdvancedUI) {
                    oController.SwitchToSimpleView();
                } else {
                    oController.InitialDeviceInfoLoad();
                }
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
				
				//-- Defines the Screen Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
		});		
	},
    
    ChangeColourInBox : function (iHue, iSat, iBright) {
        var oController = this;
        var oView       = this.getView();
        
        console.log("H:"+iHue);
        console.log("S:"+iSat);
        console.log("L:"+iBright);
        
        oView.byId("ColourBox").setSrc(IomyRe.apiphp.APILocation("colorbox")+"?Mode=HSL&H="+iHue+"&S="+iSat+"&L="+(iBright/2));
    },
    
    SetSliderValues : function (iHue, iSat, iBright) {
        var oView       = this.getView();
        
        oView.byId("hueSlider").setValue(iHue);
        oView.byId("satSlider").setValue(iSat);
        oView.byId("briSlider").setValue(iBright);
    },
	
	//-- Sets the RGB Color parameters based on data from the database --//
	RGBInit: function (iHue, iSaturation, iLight) {
        var oController     = this;
		var oView           = this.getView();
        var sColourString;
        
        iHue            = Math.floor(iHue / this.fHueConversionRate);
        iSaturation     = Math.floor(iSaturation / this.fSaturationConversionRate);
        iLight          = Math.floor(iLight / this.fLightConversionRate);
        
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
        //var mSliderValues   = IomyRe.functions.convertRGBToHSL(oView.byId("CPicker").getColorString());
        
        //console.log(mSliderValues);
        
        oContainer.destroyContent();
        
        if (oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = false;
            
//            console.log(mSliderValues.hue * this.fHueConversionRate);
//            console.log(mSliderValues.saturation * this.fSaturationConversionRate);
//            console.log(mSliderValues.light * this.fLightConversionRate);
            
            oContainer.addContent(
                IomyRe.widgets.LightBulbControlsContainer(oController, {
                    hue             : 0,//mSliderValues.hue,
                    saturation      : 0,//mSliderValues.saturation,
                    brightness      : 0,//mSliderValues.light * 2,
                    
                    advancedViewPress : function () {
                        oView.byId("ViewSwitchButton").setEnabled(false);
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
        
            oController.RGBUiDraw();
        
//            oController.ChangeColourInBox(
//                oView.byId("hueSlider").getValue(),
//                oView.byId("satSlider").getValue(),
//                oView.byId("briSlider").getValue()
//            );

            oController.InitialDeviceInfoLoad();
        }
    },
    
    SwitchToAdvancedView : function () {
        var oController = this;
        var oView       = this.getView();
        var oContainer  = oView.byId("RGB_Cont");
        var iHue = oView.byId("hueSlider").getValue();
        var iSat = oView.byId("satSlider").getValue();
        var iBright = oView.byId("briSlider").getValue();
        
        console.log(oView.byId("hueSlider").getValue());
        console.log(oView.byId("satSlider").getValue());
        console.log(oView.byId("briSlider").getValue());
        
        oContainer.destroyContent();
        
        if (!oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = true;
            
            oContainer.addContent(IomyRe.widgets.LightBulbColorPicker(oController, {
                colorString : "hsv("+iHue+","+iSat+","+iBright+")",
                
                simpleViewPress : function () {
                    oView.byId("ViewSwitchButton").setEnabled(false);
                    oController.SwitchToSimpleView();
                },
                
                change : function (oEvent) {
                    oController.ChangeLightColour(oEvent);
                },
            }));
            
            oController.RGBUiDraw();
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
        
        if (oView.byId("ViewSwitchButton") !== undefined) {
            oView.byId("ViewSwitchButton").setEnabled(false);
        }
        
        try {
            $.each(mIOs, function (sI, aIO) {
                if (sI !== undefined && sI !== null && aIO !== undefined && aIO !== null) {
                    aIOFilter.push("IO_PK eq "+aIO.Id);
                }
            });
            
//            $.each(mIOs, function (sI, aIO) {
//                if (sI !== undefined && sI !== null && aIO !== undefined && aIO !== null) {
//                    IomyRe.apiodata.AjaxRequest({
//                        Url : IomyRe.apiodata.ODataLocation("dataint"),
//                        Columns : ["CALCEDVALUE","UTS","RSTYPE_PK"],
//                        WhereClause : ["THING_PK eq "+oController.iThingId, "IO_PK eq "+aIO.Id],
//                        OrderByClause : ["UTS desc"],
//                        limit : 1,
//                        format : 'json',
//
//                        onSuccess : function (response, data) {
//                            if (data.length > 0) {
//                                data = data[0];
//                                
//                                var iHue;
//                                var iSaturation;
//                                var iLight;
//                                
//                                //console.log(JSON.stringify(data));
//                                //----------------------------------------------------//
//                                // If we're grabbing the HUE value
//                                //----------------------------------------------------//
//                                if (data.RSTYPE_PK === 3901) {
//                                    iHue = Math.round(data.CALCEDVALUE / oController.fHueConversionRate);
//                                }
//
//                                //----------------------------------------------------//
//                                // If we're grabbing the SATURATION value
//                                //----------------------------------------------------//
//                                if (data.RSTYPE_PK === 3902) {
//                                    iSaturation = Math.round(data.CALCEDVALUE / oController.fSaturationConversionRate);
//                                }
//
//                                //----------------------------------------------------//
//                                // If we're grabbing the BRIGHTNESS value
//                                //----------------------------------------------------//
//                                if (data.RSTYPE_PK === 3903) {
//                                    iLight = Math.round(data.CALCEDVALUE / oController.fLightConversionRate);
//                                }
//                            }
//
//                            //--------------------------------------------------------//
//                            // Set the colour on the page
//                            //--------------------------------------------------------//
//                            if (oController.bUsingAdvancedUI === true) {
//                                oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
//                            } else {
//                                oController.ChangeColourInBox(Math.round(iHue), Math.round(iSaturation), Math.round(iLight));
//                                oController.SetSliderValues(iHue, iSaturation, iLight);
//                            }
//                        },
//
//                        onFail : function (response) {
//                            jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
//                        }
//                    });
//                }
//            });
            
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
                    var iHue        = null;
                    var iSaturation = null;
                    var iLight      = null;
                    
                    for (var i = 0; i < data.length; i++) {
                        //console.log(JSON.stringify(data));
                        //----------------------------------------------------//
                        // If we're grabbing the HUE value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3901 && iHue === null) {
                            iHue = Math.round(data[i].CALCEDVALUE / oController.fHueConversionRate);
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the SATURATION value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3902 && iSaturation === null) {
                            iSaturation = Math.round(data[i].CALCEDVALUE / oController.fSaturationConversionRate);
                        }
                        
                        //----------------------------------------------------//
                        // If we're grabbing the BRIGHTNESS value
                        //----------------------------------------------------//
                        if (data[i].RSTYPE_PK === 3903 && iLight === null) {
                            iLight = Math.round(data[i].CALCEDVALUE / oController.fLightConversionRate);
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
                            // run the request again.
                            //-----------------------------------------------------//
                            if (i === data.length - 1) {
                                this.Limit += 3;
                                
                                IomyRe.apiodata.AjaxRequest(this);
                            }
                        }
                    }
                    
                    console.log("H:"+iHue);
                    console.log("S:"+iSaturation);
                    console.log("L:"+iLight);
                    //--------------------------------------------------------//
                    // Set the colour on the page
                    //--------------------------------------------------------//
                    if (oController.bUsingAdvancedUI === true) {
                        oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
                    } else {
                        oController.ChangeColourInBox(Math.round(iHue), Math.round(iSaturation), Math.round(iLight));
                        oController.SetSliderValues(iHue, iSaturation, iLight);
                    }
                    
                    oView.byId("ViewSwitchButton").setEnabled(true);
                },

                onFail : function (response) {
                    jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+JSON.stringify(response));
                    oView.byId("ViewSwitchButton").setEnabled(true);
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
                h : oView.byId("hueSlider").getValue(),// / oController.fHueConversionRate,
                s : oView.byId("satSlider").getValue(),// / oController.fSaturationConversionRate,
                v : oView.byId("briSlider").getValue(),// / oController.fLightConversionRate
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
        
        console.log("H:"+iHue);
        console.log("S:"+iSat);
        console.log("L:"+iLight);
        
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