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
    
    bAdvancedFirstRun               : true,
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
        
        oView.byId("ColourBox").setSrc(IomyRe.apiphp.APILocation("colorbox")+"?Mode=HSL&H="+iHue+"&S="+iSat+"&L="+Math.floor(iBright/2));
    },
    
    SetSliderValues : function (iHue, iSat, iBright) {
        var oView       = this.getView();
        
        oView.byId("hueSlider").setValue(iHue);
        oView.byId("satSlider").setValue(iSat);
        oView.byId("briSlider").setValue(iBright);
    },
	
    ToggleSliders : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("hueSlider").setEnabled(bEnabled);
        oView.byId("satSlider").setEnabled(bEnabled);
        oView.byId("briSlider").setEnabled(bEnabled);
    },
    
	//-- Sets the RGB Color parameters based on data from the database --//
	RGBInit: function (iHue, iSaturation, iLight) {
        var oController     = this;
		var oView           = this.getView();
        var iDeviceState    = IomyRe.common.ThingList["_"+oController.iThingId].Status;
        var sColourString;
        
        iHue            = Math.floor(iHue / this.fHueConversionRate);
        iSaturation     = Math.floor(iSaturation / this.fSaturationConversionRate);
        iLight          = Math.floor(iLight / this.fLightConversionRate);
        
        sColourString   = "hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")";
        
        if (oView.byId("CPicker") !== undefined) {
            oView.byId("CPicker").setEnabled(iDeviceState == 1);
            
            oView.byId("WhiteLight_Cont").setEnabled(iDeviceState == 1);
            oView.byId("CPicker").setColorString(sColourString);
        }
	},
		
	//-- Adds a "WhiteLight" button if the devicetype === "CSR" --//
	RGBUiDraw: function () {
        var oController = this;
		var oView       = oController.getView();
        var mThing      = IomyRe.common.ThingList["_"+oController.iThingId];
		
		try {
            if (oView.byId("WhiteLight_Cont") !== undefined) {
                oView.byId("WhiteLight_Cont").destroy();
            }
            
			if (mThing.TypeId == IomyRe.devices.philipshue.ThingTypeId) {
				
			} else if (mThing.TypeId == IomyRe.devices.csrmesh.ThingTypeId) {
				oView.byId("RGB_Cont").addContent(
                    IomyRe.widgets.CSRbutton(oController, function (oEvent) {
                        var oSrc = oView.byId("ButtonWhiteLight");
                        oSrc.setEnabled(false);
                        
                        if (!oController.bUsingAdvancedUI) {
                            oController.ToggleSliders(false);
                        }
                        
                        IomyRe.devices.csrmesh.turnOnWhiteLight({
                            thingID : oController.iThingId,
                            
                            onSuccess : function () {
                                oSrc.setEnabled(true);
                                
                                if (!oController.bUsingAdvancedUI) {
                                    oController.ToggleSliders(true);
                                }
                            },
                            
                            onFail : function (sErrorMessage) {
                                IomyRe.common.showError(sErrorMessage, "Failed to set 'White Light'",
                                    function () {
                                        oSrc.setEnabled(true);
                                        
                                        if (!oController.bUsingAdvancedUI) {
                                            oController.ToggleSliders(true);
                                        }
                                    }
                                );
                            }
                        });
                    })
                );
            
                oView.byId("ButtonWhiteLight").setEnabled(false);
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
            
            oContainer.addContent(
                IomyRe.widgets.LightBulbControlsContainer(oController, {
                    hue             : 180,
                    saturation      : 100,
                    brightness      : 100,
                    
                    advancedViewPress : function () {
                        oView.byId("ViewSwitchButton").setEnabled(false);
                        oController.SwitchToAdvancedView();
                    },
                    
                    switchChange : function () {
                        oController.RunLightSwitch();
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
            
            //-- Load the slider data. --//
            oController.InitialDeviceInfoLoad();
        }
    },
    
    SwitchToAdvancedView : function () {
        var oController     = this;
        var oView           = this.getView();
        var oContainer      = oView.byId("RGB_Cont");
        var iHue            = oView.byId("hueSlider").getValue();
        var iSat            = oView.byId("satSlider").getValue();
        var iBright         = oView.byId("briSlider").getValue();
        
        // Clear the simple view.
        oContainer.destroyContent();
        
        if (!oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = true;
            oController.bAdvancedFirstRun = true;
            
            //----------------------------------------------------------------//
            // Create the Colour Picker.
            //----------------------------------------------------------------//
            oContainer.addContent(IomyRe.widgets.LightBulbColorPicker(oController, {
                colorString : "hsv("+iHue+","+iSat+","+iBright+")",
                
                simpleViewPress : function () {
                    oView.byId("ViewSwitchButton").setEnabled(false);
                    oController.SwitchToSimpleView();
                },
                
                change : function (oEvent) {
                    oController.ChangeLightColour(oEvent);
                }
            }));
            
            oController.RGBUiDraw();
            
            if (oView.byId("ButtonWhiteLight") !== undefined) {
                oView.byId("ButtonWhiteLight").setEnabled(true);
            }
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
        
        oController.ToggleSliders(false);
        
        if (oView.byId("ViewSwitchButton") !== undefined) {
            oView.byId("ViewSwitchButton").setEnabled(false);
        }
        
        oView.byId("LightSwitch").setEnabled(false);
        
        try {
            
            IomyRe.devices.loadLightBulbInformation({
                thingID : oController.iThingId,

                onSuccess : function (iHue, iSaturation, iLight) {
                    var iDeviceState = IomyRe.common.ThingList["_"+oController.iThingId].Status;
                    
                    //--------------------------------------------------------//
                    // Set the colour on the page.
                    //--------------------------------------------------------//
                    if (oController.bUsingAdvancedUI === true) {
                        oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
                    } else {
                        oController.ChangeColourInBox(Math.round(iHue), Math.round(iSaturation), Math.round(iLight));
                        oController.SetSliderValues(iHue, iSaturation, iLight);
                    }
                    
                    //--------------------------------------------------------//
                    // Show the current on/off state on the switch.
                    //--------------------------------------------------------//
                    if (iDeviceState == 1) {
                        oView.byId("LightSwitch").setState(true);
                        
                    } else {
                        oView.byId("LightSwitch").setState(false);
                    }
                    
                    oView.byId("LightSwitch").setEnabled(true);
                    oView.byId("ViewSwitchButton").setEnabled(true);
                    oController.ToggleSliders(true);
                    
                    if (oView.byId("ButtonWhiteLight") !== undefined) {
                        oView.byId("ButtonWhiteLight").setEnabled(true);
                    }
                },

                onFail : function (sErrorMessage) {
                    
                    IomyRe.common.showError(sErrorMessage, "Error loading information",
                        function () {
                            oView.byId("LightSwitch").setEnabled(true);
                            oView.byId("ViewSwitchButton").setEnabled(true);
                        }
                    );
                    
                    jQuery.sap.log.error("Error Code 9300: There was a fatal error loading current device information: "+sErrorMessage);
                }
            });
        } catch (e) {
            jQuery.sap.log.error("There was an error loading the OData service: "+e.message);
        }
    },
    
    RunLightSwitch : function () {
        var oController = this;
        var oView       = this.getView();
        var oSwitch     = oView.byId("LightSwitch");
        
        oSwitch.setEnabled(false);
        
        IomyRe.devices.RunSwitch({
            thingID : oController.iThingId,

            onSuccess : function (iNewState) {
                
                if (iNewState === 1) {
                    oSwitch.setState(true);
                    oController.ChangeLightColour();
                } else {
                    oSwitch.setState(false);
                }
                
                oSwitch.setEnabled(true);
            },

            onFail : function (sErrorMessage) {
                IomyRe.common.showError(sErrorMessage, "Failed to run the switch",
                    function () {
                        oSwitch.setState( !oSwitch.getState() );
                        oSwitch.setEnabled(true);
                    }
                );
            }
        });
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
        
        var mRequestData    = {
            "method" : "POST",
            "onFail" : function (response) {
                jQuery.sap.log.error("There was a fatal error changing light bulb properties: "+JSON.stringify(response));
            }
        };
        
        if (!oController.bAdvancedFirstRun) {
            
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
            
        } else {
            oController.bAdvancedFirstRun = false;
        }
    }
		
});