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

sap.ui.controller("pages.device.RGBlight", {
    
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
                    iTypeId = iomy.common.ThingList["_"+oEvent.data.ThingId].TypeId;
                    oView.byId("ToolbarTitle").setText( iomy.common.ThingList["_"+oEvent.data.ThingId].DisplayName );
                }
                
                oController.iThingTypeId = iTypeId;
                if (oController.bUsingAdvancedUI) {
                    oController.SwitchToSimpleView();
                } //else {
                    oController.InitialDeviceInfoLoad();
                //}
                oController.RGBUiDraw();
                
                if (iTypeId == iomy.devices.philipshue.ThingTypeId) {
                    oController.fHueConversionRate          = 65535 / 360;  // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                    oController.fSaturationConversionRate   = 1.44;         // 144 / 100 (100 being the max saturation value)
                    oController.fLightConversionRate        = 2.54;         // 254 / 100 (likewise)
                    
                } else if (iTypeId == iomy.devices.csrmesh.ThingTypeId) {
                    oController.fHueConversionRate          = 1;
                    oController.fSaturationConversionRate   = 2.55;
                    oController.fLightConversionRate        = 2.55;
                }
				
				//-- Defines the Screen Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
		});		
	},
    
    ChangeColourInBox : function (iHue, iSat, iBright) {
        var oController = this;
        var oView       = this.getView();
        
        //oView.byId("ColourBox").setSrc(iomy.apiphp.APILocation("colorbox")+"?Mode=HSL&H="+iHue+"&S="+iSat+"&L="+Math.floor(iBright/2));
        oView.byId("ColourBox").setSrc(iomy.apiphp.APILocation("colorbox")+"?Mode=HSL&H="+iHue+"&S="+iSat+"&L="+iBright);
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
        var iDeviceState    = iomy.common.ThingList["_"+oController.iThingId].Status;
        var sColourString;
        
//        iHue            = Math.floor(iHue / this.fHueConversionRate);
//        iSaturation     = Math.floor(iSaturation / this.fSaturationConversionRate);
//        iLight          = Math.floor(iLight / this.fLightConversionRate);
        
        sColourString   = "rgb("+iHue+","+iSaturation+","+iLight+")";
        
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
        var mThing      = iomy.common.ThingList["_"+oController.iThingId];
		
		try {
            if (oView.byId("WhiteLight_Cont") !== undefined) {
                oView.byId("WhiteLight_Cont").destroy();
            }
            
			if (mThing.TypeId == iomy.devices.philipshue.ThingTypeId) {
				
			} else if (mThing.TypeId == iomy.devices.csrmesh.ThingTypeId) {
				oView.byId("RGB_Cont").addContent(
                    iomy.widgets.CSRbutton(oController, function (oEvent) {
                        var oSrc = oView.byId("ButtonWhiteLight");
                        oSrc.setEnabled(false);
                        
                        if (!oController.bUsingAdvancedUI) {
                            oController.ToggleSliders(false);
                        }
                        
                        iomy.devices.csrmesh.turnOnWhiteLight({
                            thingID : oController.iThingId,
                            
                            onSuccess : function () {
                                oSrc.setEnabled(true);
                                
                                if (!oController.bUsingAdvancedUI) {
                                    oController.ToggleSliders(true);
                                }
                            },
                            
                            onFail : function (sErrorMessage) {
                                iomy.common.showError(sErrorMessage, "Failed to set 'White Light'",
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
        var mRGBColors      = oView.byId("CPicker").getRGB();
        var mSliderValues   = iomy.functions.convertRGBToHSL( mRGBColors.r, mRGBColors.g, mRGBColors.b );
        
        //console.log(mSliderValues);
        
        oContainer.destroyContent();
        
        if (oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = false;
            
            oContainer.addContent(
                iomy.widgets.LightBulbControlsContainer(oController, {
                    hue             : mSliderValues.hue,
                    saturation      : mSliderValues.saturation,
                    brightness      : mSliderValues.light,
                    
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

            oController.ChangeColourInBox(
                mSliderValues.hue,
                mSliderValues.saturation,
                mSliderValues.light
            );
            
            oController.RGBUiDraw();
            
            if(oView.byId("ButtonWhiteLight") !== undefined) {
                oView.byId("ButtonWhiteLight").setEnabled(true);
            }
            
            //-- Load the slider data. --//
            //oController.InitialDeviceInfoLoad();
        }
    },
    
    SwitchToAdvancedView : function () {
        var oController     = this;
        var oView           = this.getView();
        var oContainer      = oView.byId("RGB_Cont");
        var iHue            = oView.byId("hueSlider").getValue();
        var iSat            = oView.byId("satSlider").getValue();
        var iBright         = oView.byId("briSlider").getValue();
        var mNormalHSL      = {};
        var mRGB            = {};
        var iRed            = 0;
        var iGreen          = 0;
        var iBlue           = 0;
        
        
        //----------------------------------------------------------------//
        //-- Calculate the RGB Values 
        //----------------------------------------------------------------//
        
        //-- Convert HSL from "Simple Slider" to "Normal" --//
        //mNormalHSL = iomy.functions.convertHSL( "SimpleSlider", "Normal", oController.iThingTypeId, iHue, iSat, iBright );
        
        //if( mNormalHSL.Error===false ) {
            //-- Calculate RGB Values from the HSL values --//
            mRGB = iomy.functions.convertHSLToRGB( iHue, iSat, iBright );
            
            iRed   = mRGB.red;
            iGreen = mRGB.green;
            iBlue  = mRGB.blue;
            
        //}
        
        
        // Clear the simple view.
        oContainer.destroyContent();
        
        if (!oController.bUsingAdvancedUI) {
            oController.bUsingAdvancedUI = true;
            oController.bAdvancedFirstRun = true;
            
            //----------------------------------------------------------------//
            // Create the Colour Picker.
            //----------------------------------------------------------------//
            oContainer.addContent(iomy.widgets.LightBulbColorPicker(oController, {
                //colorString : "hsv("+iHue+","+iSat+","+iBright+")",
                colorString : "rgb("+iRed+","+iGreen+","+iBlue+")",
                
                simpleViewPress : function () {
                    oView.byId("ViewSwitchButton").setEnabled(false);
                    oController.SwitchToSimpleView();
                },
                
                change : function (oEvent) {
                    oController.ChangeLightColour(oEvent);
                }
            }));
            
            oController.RGBUiDraw();
            
            if(oView.byId("ButtonWhiteLight") !== undefined) {
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
            
            iomy.devices.loadLightBulbInformation({
                thingID : oController.iThingId,
                colourFormat : "RGB",

                onSuccess : function (iRed, iGreen, iBlue) {
                    var iDeviceState = iomy.common.ThingList["_"+oController.iThingId].Status;
                    
                    
                    //--------------------------------------------------------//
                    // Set the colour on the page.
                    //--------------------------------------------------------//
                    if (oController.bUsingAdvancedUI === true) {
                        //oController.RGBInit("hsv("+Math.round(iHue)+","+Math.round(iSaturation)+","+Math.round(iLight)+")");
                        oController.RGBInit( iRed, iGreen, iBlue );
                    } else {
                        //oController.ChangeColourInBox(Math.round(iHue), Math.round(iSaturation), Math.round(iLight));
                        var mNewHSL = iomy.functions.convertRGBToHSL( iRed, iGreen, iBlue );
                        
                        oController.SetSliderValues( mNewHSL.hue, mNewHSL.saturation, mNewHSL.light );
                        //oController.ChangeColourInBox( Math.round(iHue), Math.round( iSaturation / 2.55 ), Math.round( iLight / 2.55 ));
                        oController.ChangeColourInBox( mNewHSL.hue, mNewHSL.saturation, mNewHSL.light );
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
                    
                    iomy.common.showError(sErrorMessage, "Error loading information",
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
        
        try {
            iomy.devices.RunSwitch({
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
                    iomy.common.showError(sErrorMessage, "Failed to run the switch",
                        function () {
                            oSwitch.setState( !oSwitch.getState() );
                            oSwitch.setEnabled(true);
                        }
                    );
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.name + ": " + e.message + "\n\n" + iomy.common.getContactSupportMessage(), "Failed to run the switch",
                function () {
                    oSwitch.setState( !oSwitch.getState() );
                    oSwitch.setEnabled(true);
                }
            );
        }
    },
    
    
    /**
     * Event function that is called whenever the colour values have changed in
     * the colour picker.
     * 
     * @param {object} oEvent       UI5 Control Event of the calling widget.
     */
    ChangeLightColour : function (oEvent) {
        var bError          = false;
        var aErrorMessages  = [];
        var oController     = this;
        var oView           = this.getView();
        var mParameters;
        
        var mNewHSL         = {};
        var iNewHue         = 0;
        var iNewSat         = 0;
        var iNewLig         = 0;
        
        
        try {
            if (oEvent === undefined) {
                //mParameters = {
                //    h : oView.byId("hueSlider").getValue(),// / oController.fHueConversionRate,
                //    s : oView.byId("satSlider").getValue(),// / oController.fSaturationConversionRate,
                //    v : oView.byId("briSlider").getValue(),// / oController.fLightConversionRate
                //};

                mNewHSL = iomy.functions.convertHSL( "SimpleSlider", "DB", oController.iThingTypeId, oView.byId("hueSlider").getValue(), oView.byId("satSlider").getValue(), oView.byId("briSlider").getValue() );
                if( mNewHSL.Error===false ) {
                    iNewHue = mNewHSL.Hue;
                    iNewSat = mNewHSL.Sat;
                    iNewLig = mNewHSL.Lig;
                } else {
                    bError = true;
                    aErrorMessages.push(mNewHSL.ErrMesg);
                }

            } else {
                //----------------------------------------------------------------------------------------//
                //-- TODO: This seems to be triggered when the User goes from "Simple" to "Advanced"    --//
                //--     This will need to be looked at down the track                                  --//
                //----------------------------------------------------------------------------------------//

                mParameters = oEvent.getParameters();

                var mNewHSLTemp = iomy.functions.convertRGBToHSL255( mParameters.r, mParameters.g, mParameters.b );

                mNewHSL = iomy.functions.convertHSL( "Normal", "DB", oController.iThingTypeId, mNewHSLTemp.hue, mNewHSLTemp.saturation, mNewHSLTemp.light );
                if( mNewHSL.Error===false ) {
                    iNewHue = mNewHSL.Hue;
                    iNewSat = mNewHSL.Sat;
                    iNewLig = mNewHSL.Lig;
                } else {
                    bError = true;
                    aErrorMessages.push(mNewHSL.ErrMesg);
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Failed to convert HSL figures (ID: "+oController.iThingId+") ("+e.name+"): " + e.message);
        }
        
        /*
        if (mParameters.h === 360) {
            mParameters.h = 0;
        }
        var iHue            = Math.floor(mParameters.h * this.fHueConversionRate);
        var iSat            = Math.floor(mParameters.s * this.fSaturationConversionRate);
        var iLight          = Math.floor(mParameters.v * this.fLightConversionRate);
        var iDeviceType     = iomy.common.ThingList["_"+this.iThingId].TypeId;
        */
        
        if (!bError) {
            try {
                var mRequestData    = {
                    "method" : "POST",
                    "onFail" : function (response) {
                        jQuery.sap.log.error("There was a fatal error changing light bulb properties: "+JSON.stringify(response));
                    }
                };


                if (!oController.bAdvancedFirstRun) {
                    var mRGB;

                    //if (iDeviceType == iomy.devices.philipshue.ThingTypeId) {
                    if (oController.iThingTypeId == iomy.devices.philipshue.ThingTypeId) {
                        if (oController.bUsingAdvancedUI) {
                            mRGB = oView.byId("CPicker").getRGB();
                            
                            mRGB = {
                                red     : mRGB.r,
                                green   : mRGB.g,
                                blue    : mRGB.b
                            };
                        } else {
                            mRGB = iomy.functions.convertHSLToRGB(
                                oView.byId("hueSlider").getValue(),
                                oView.byId("satSlider").getValue(),
                                oView.byId("briSlider").getValue()
                            );
                        }
                        
                        mRequestData.url    = iomy.apiphp.APILocation("philipshue");
                        mRequestData.data   = {
                            "Mode" : "ChangeColorRGB",
                            "ThingId" : oController.iThingId,
                            "Data" : JSON.stringify({
                                "R":mRGB.red    ,"RMax":255,
                                "G":mRGB.green  ,"GMax":255,
                                "B":mRGB.blue   ,"BMax":255
                            })
                        };

                        iomy.apiphp.AjaxRequest(mRequestData);

                    //} else if (iDeviceType == iomy.devices.csrmesh.ThingTypeId) {
                    } else if(oController.iThingTypeId == iomy.devices.csrmesh.ThingTypeId) {
                        if (oController.bUsingAdvancedUI) {
                            mRGB = oView.byId("CPicker").getRGB();
                            
                            mRGB = {
                                red     : mRGB.r,
                                green   : mRGB.g,
                                blue    : mRGB.b
                            };
                        } else {
                            mRGB = iomy.functions.convertHSLToRGB(
                                oView.byId("hueSlider").getValue(),
                                oView.byId("satSlider").getValue(),
                                oView.byId("briSlider").getValue()
                            );
                        }
                        
                        mRequestData.url    = iomy.apiphp.APILocation("light");
                        mRequestData.data   = {
                            "Mode" : "ChangeColorRGB",
                            "ThingId" : oController.iThingId,
                            "Data" : JSON.stringify({
                                "NewValue" : {
                                    //"Hue" : iHue,
                                    //"Saturation" : iSat,
                                    //"Brightness" : iLight
                                    "Red":   mRGB.red,
                                    "Green": mRGB.green,
                                    "Blue":  mRGB.blue
                                }
                            })
                        };

                        iomy.apiphp.AjaxRequest(mRequestData);

                    }

                } else {
                    oController.bAdvancedFirstRun = false;
                }
                
            } catch (e) {
                $.sap.log.error("Cannot change the light properties (ID: "+oController.iThingId+") ("+e.name+"): " + e.message);
            }
        } else {
            $.sap.log.error(aErrorMessages.join("\n"));
        }
    }
		
});