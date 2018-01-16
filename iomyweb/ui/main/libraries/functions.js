/*
Title: iOmy Functions Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares various functions that are used across multiple pages.
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

$.sap.declare("IomyRe.functions",true);

IomyRe.functions = new sap.ui.base.Object();

$.extend(IomyRe.functions, {
    
    
    createDeviceListData : function (mSettings) {
        var bError                      = false;
        var aaDeviceList                = {};
        var iPremiseId                  = 0;
        var iRoomId                     = 0;
        var aDevicesInAlphabeticalOrder = [];
        
        try {
            //--------------------------------------------------------------------//
            // Look for any specified filters and apply them.
            //--------------------------------------------------------------------//
            if (mSettings !== undefined && mSettings !== null) {

                if (mSettings.filter !== undefined || mSettings.filter !== null) {

                    if (mSettings.filter.premiseID) {
                        iPremiseId = mSettings.filter.premiseID;
                    }

                    if (mSettings.filter.roomID) {
                        iRoomId = mSettings.filter.roomID;
                    }

                }

            }

            $.each( IomyRe.common.ThingList, function( sIndex, mThing ) {

                //-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
                if ( mThing!==undefined ) {

                    if ((iPremiseId === 0 || iPremiseId == mThing.PremiseId) && (iRoomId === 0 || iRoomId == mThing.RoomId)) {
                        //--------------------------------------------//
                        //-- If Grouping isn't setup yet            --//
                        //--------------------------------------------//
                        if( aaDeviceList["thingType"+mThing.TypeId] === undefined ) {
                            //-- Define the Grouping --//
                            aaDeviceList["thingType"+mThing.TypeId] = {
                                "Name": mThing.TypeName,        //-- Display the name of the Grouping --//
                                "Prefix":"Dev",                 //-- Prefix to make object have a unique Id --//
                                "Devices":[]                    //-- Array to store the devices in the Grouping --//
                            };
                        }

                        aDevicesInAlphabeticalOrder.push(mThing);
                    }
                }
            });

            aDevicesInAlphabeticalOrder.sort(
                function (a, b) {
                    var sA = a.DisplayName.toLowerCase();
                    var sB = b.DisplayName.toLowerCase();

                    if (sA === sB) {
                        return 0;
                    } else if (sA > sB) {
                        return 1;
                    } else if (sA < sB) {
                        return -1;
                    }
                }
            );
        
        } catch (e) {
            bError = true;
            $.sap.log.error("Failed to prepare the device list data ("+e.name+"): " + e.message);
            
        } finally {
            try {
                if (!bError) {
                    //--------------------------------------------------------------------//
                    // Construct the Device List using any filters specified.
                    //--------------------------------------------------------------------//
                    $.each( aDevicesInAlphabeticalOrder, function( sIndex, mThing ) {

                        //-- Check to make sure the Device is defined (Best to do this for each result from a foreach) --//
                        if ( mThing!==undefined ) {

                            if ((iPremiseId === 0 || iPremiseId == mThing.PremiseId) && (iRoomId === 0 || iRoomId == mThing.RoomId)) {
                                //--------------------------------------------//
                                //-- Add the Devices into the Grouping        --//
                                //--------------------------------------------//
                                aaDeviceList["thingType"+mThing.TypeId].Devices.push({
                                    "DeviceId":          mThing.Id,
                                    "DeviceName":        mThing.DisplayName,
                                    "DeviceTypeId":      mThing.TypeId,
                                    "DeviceTypeName":    mThing.TypeName,
                                    "DeviceStatus":      mThing.Status,
                                    "LinkId":            mThing.LinkId,
                                    "PermToggle":        mThing.PermToggle,
                                    "IOs":               mThing.IO,
                                    "RoomId":            mThing.RoomId,
                                    "PremiseId":         mThing.PremiseId,
                                    "UILastUpdate":      mThing.UILastUpdate
                                });
                            }
                        }
                    });
                }
            } catch (e) {
                aaDeviceList = {};
                $.sap.log.error("Failed to construct the device list data ("+e.name+"): " + e.message);

            } finally {
                return aaDeviceList;
            }
        }
        
    },
    
    extractRGBValuesFromString : function (sColourString) {
        var aFigures;
        
        //--------------------------------------------------------------------//
        // First check that the colour string is given.
        //--------------------------------------------------------------------//
        if (!sColourString) {
            throw new MissingArgumentException("RGB Colour String must be specified!");
        }
        
        //--------------------------------------------------------------------//
        // Next begin removing the unwanted characters "rgb(" and ")"
        //--------------------------------------------------------------------//
        sColourString = sColourString.replace("rgb(", "");
        sColourString = sColourString.replace(")", "");
        
        //--------------------------------------------------------------------//
        // Split the figures into three in an array and fetch the values in
        // decimal format, that is, divided by 255.
        //--------------------------------------------------------------------//
        aFigures = sColourString.split(",");
        
        return {
            red     : aFigures[0],
            green   : aFigures[1],
            blue    : aFigures[2]
        };
    },
    
    /**
     * Extracts the HSL values out of a RGB colour string.
     * 
     * Based on this code: http://rgb2hsl.nichabi.com/javascript-function.php
     * 
     * @param {type} iRed       Red value
     * @param {type} iGreen     Green value
     * @param {type} iBlue      Blue value
     * 
     * @returns {object}        Map containing the HSL values.
     */
    convertRGBToHSL : function (iRed, iGreen, iBlue) {
        var fRed;
        var fGreen;
        var fBlue;
        
        var fMin, fMax;
        var fDifference;
        
        var iHue;
        var iSat;
        var iLight;
        
        var mResult;
        
        try {
            fRed    = iRed / 255;
            fGreen  = iGreen / 255;
            fBlue   = iBlue / 255;

            //--------------------------------------------------------------------//
            // Determine which of the three numbers is the minimum and maximum.
            //--------------------------------------------------------------------//
            fMin = Math.min( fRed, fGreen, fBlue );
            fMax = Math.max( fRed, fGreen, fBlue );

            fDifference = fMax - fMin;

            //--------------------------------------------------------------------//
            // Find the luminance figure.
            //--------------------------------------------------------------------//
            iLight = ((fMin + fMax)/2);

            //--------------------------------------------------------------------//
            // Find the saturation
            //--------------------------------------------------------------------//
            if (fMax === fMin) {
                iHue = iSat = 0;
            } else {
                fDifference = fMax - fMin;
                iSat = iLight > 0.5 ? fDifference / (2 - fMax - fMin) : fDifference / (fMax + fMin);
                switch (fMax) {
                    case fRed:
                        iHue = (fGreen - fBlue) / fDifference + (fGreen < fBlue ? 6 : 0);
                        break;
                    case fGreen:
                        iHue = (fBlue - fRed) / fDifference + 2;
                        break;
                    case fBlue:
                        iHue = (fRed - fGreen) / fDifference + 4;
                        break;
                }
                iHue /= 6;
            }

            //--------------------------------------------------------------------//
            // Round off the figures.
            //--------------------------------------------------------------------//
            iHue = Math.round(iHue * 360);
            iSat = Math.round(iSat * 100);
            iLight = Math.round(iLight * 100);

    //        console.log(iHue);
    //        console.log(iSat);
    //        console.log(iLight);

            //--------------------------------------------------------------------//
            // Return the figures.
            //--------------------------------------------------------------------//
            mResult = {
                "hue"           : iHue,
                "saturation"    : iSat,
                "light"         : iLight
            };
        } catch (e) {
            mResult = {
                "hue"           : 0,
                "saturation"    : 0,
                "light"         : 0
            };
            
            $.sap.log.error("Error in IomyRe.functions.convertRGBToHSL ("+e.name+"): " + e.message);
            
        } finally {
            return mResult;
        }
    },
    
    convertRGBToHSL255 : function (iOldRed, iOldGreen, iOldBlue) {
        var fOldRed;
        var fOldGreen;
        var fOldBlue;
        
        var fMin, fMax;
        var fDifference;
        
        var iNewHue;
        var iNewSat;
        var iNewLight;
        
        var mResult;
        
        try {
            fOldRed    = iOldRed / 255;
            fOldGreen  = iOldGreen / 255;
            fOldBlue   = iOldBlue / 255;

            //--------------------------------------------------------------------//
            // Determine which of the three numbers is the minimum and maximum.
            //--------------------------------------------------------------------//
            fMin = Math.min( fOldRed, fOldGreen, fOldBlue );
            fMax = Math.max( fOldRed, fOldGreen, fOldBlue );

            fDifference = fMax - fMin;

            //--------------------------------------------------------------------//
            // Find the luminance figure.
            //--------------------------------------------------------------------//
            iNewLight = ((fMin + fMax)/2);

            //--------------------------------------------------------------------//
            // Find the saturation
            //--------------------------------------------------------------------//
            if (fMax === fMin) {
                iNewHue = iNewSat = 0;
            } else {
                fDifference = fMax - fMin;
                iNewSat = iNewLight > 0.5 ? fDifference / (2 - fMax - fMin) : fDifference / (fMax + fMin);
                switch (fMax) {
                    case fOldRed:
                        iNewHue = (fOldGreen - fOldBlue) / fDifference + (fOldGreen < fOldBlue ? 6 : 0);
                        break;
                    case fOldGreen:
                        iNewHue = (fOldBlue - fOldRed) / fDifference + 2;
                        break;
                    case fOldBlue:
                        iNewHue = (fOldRed - fOldGreen) / fDifference + 4;
                        break;
                }
                iNewHue /= 6;
            }

            //--------------------------------------------------------------------//
            // Round off the figures.
            //--------------------------------------------------------------------//
            iNewHue = Math.round(iNewHue * 360);
            iNewSat = Math.round(iNewSat * 255);
            iNewLight = Math.round(iNewLight * 255);

            //--------------------------------------------------------------------//
            // Return the figures.
            //--------------------------------------------------------------------//
            mResult = {
                "hue"           : iNewHue,
                "saturation"    : iNewSat,
                "light"         : iNewLight
            };
            
        } catch (e) {
            mResult = {
                "hue"           : 0,
                "saturation"    : 0,
                "light"         : 0
            };
            
            $.sap.log.error("Error in IomyRe.functions.convertRGBToHSL255 ("+e.name+"): " + e.message);
            
        } finally {
            return mResult;
        }
    },
    /**
     * Converts HSL values to RGB values.
     * 
     * Based on the code found here: http://hsl2rgb.nichabi.com/javascript-function.php
     * 
     * @param {type} iHue       Hue
     * @param {type} iSat       Saturation
     * @param {type} iLight     Luminance
     * @returns {object}        RGB values
     */
    convertHSLToRGB : function (iHue, iSat, iLight) {
        var fSaturation;
        var fLuminance;
        var fChroma;
        var fX;
        var iRed;
        var iGreen;
        var iBlue;
        var fM;
        var mValues;
        
        try {
            if (!isFinite(iHue)) {
                iHue = 0;
            }

            if (!isFinite(iSat)) {
                iSat = 0;
            }

            if (!isFinite(iLight)) {
                iLight = 0;
            }

            //--------------------------------------------------------//
            // Process the Hue for calculation.
            //--------------------------------------------------------//
            iHue /= 60;
            if (iHue < 0) {
                iHue = 6 - ((0-iHue) % 6);
            }
            iHue = iHue % 6;

            //--------------------------------------------------------//
            // Process the saturation and luminance.
            //--------------------------------------------------------//
            fSaturation = Math.max(0, Math.min(1, iSat / 100));
            fLuminance  = Math.max(0, Math.min(1, iLight / 100));

            //--------------------------------------------------------//
            // Get the Chroma and the X value.
            //--------------------------------------------------------//
            fChroma = (1 - Math.abs((2 * fLuminance) - 1)) * fSaturation;
            fX = fChroma * (1 - Math.abs((iHue % 2) - 1));

            //--------------------------------------------------------//
            // Find the points on the RGB cube.
            //--------------------------------------------------------//
            if (iHue < 1) {
                iRed   = fChroma;
                iGreen = fX;
                iBlue  = 0;

            } else if (iHue < 2) {
                iRed   = fX;
                iGreen = fChroma;
                iBlue  = 0;

            } else if (iHue < 3) {
                iRed   = 0;
                iGreen = fChroma;
                iBlue  = fX;

            } else if (iHue < 4) {
                iRed   = 0;
                iGreen = fX;
                iBlue  = fChroma;

            } else if (iHue < 5) {
                iRed   = fX;
                iGreen = 0;
                iBlue  = fChroma;

            } else {
                iRed   = fChroma;
                iGreen = 0;
                iBlue  = fX;

            }

            //--------------------------------------------------------//
            // Find the individual RGB values to match brightness.
            //--------------------------------------------------------//
            fM      = fLuminance - fChroma / 2;
            iRed    = Math.round((iRed + fM) * 255);
            iGreen  = Math.round((iGreen + fM) * 255);
            iBlue   = Math.round((iBlue + fM) * 255);

            mValues = {
                red     : iRed,
                green   : iGreen,
                blue    : iBlue
            };
        } catch (e) {
            mValues = {
                red     : 0,
                green   : 0,
                blue    : 0
            };
            
            $.sap.log.error("Error in IomyRe.functions.convertHSLToRGB ("+e.name+"): " + e.message);
            
        } finally {
            return mValues;
        }
    },
    
    convertHSL255ToRGB : function (iHue, iSat, iLight) {
        //--------------------------------------------//
        //-- Variables used only in calculations    --//
        //--------------------------------------------//
        var fSaturation;
        var fLuminance;
        var fChroma;
        var fX;
        var fM;
        var iTempR = 0;
        var iTempG = 0;
        var iTempB = 0;
        
        //--------------------------------------------//
        //-- For Final Results                      --//
        //--------------------------------------------//
        var iRed;
        var iGreen;
        var iBlue;
        var mValues;
        
        try {
            if (!isFinite(iHue)) {
                iHue = 0;
            }

            if (!isFinite(iSat)) {
                iSat = 0;
            }

            if (!isFinite(iLight)) {
                iLight = 0;
            }
            
            //--------------------------------------------------------//
            // Process the Hue for calculation.
            //--------------------------------------------------------//
            var iRealHue   = Math.abs( iHue ) % 360;
            var iHueHexant = Math.floor( iRealHue / 60 );
            //--------------------------------------------------------//
            // Process the saturation and luminance.
            //--------------------------------------------------------//

            fSaturation = Math.max(0, Math.min(1, iSat / 255));
            fLuminance  = Math.max(0, Math.min(1, iLight / 255));

            //--------------------------------------------------------//
            // Get the Chroma and the X value.
            //--------------------------------------------------------//
            fChroma = (1 - Math.abs((2 * fLuminance) - 1)) * fSaturation;
            fX = fChroma * (1 - Math.abs((iHueHexant % 2) - 1));
            fM = fLuminance - ( fChroma / 2 );

            //--------------------------------------------------------//
            //-- Generate the Hexant Values                         --//
            //--------------------------------------------------------//
            switch( iHueHexant ) {
                case 0:
                    iTempR = fChroma;
                    iTempG = fX;
                    iTempB = 0;
                    break;
                case 1:
                    iTempR = fX;
                    iTempG = fChroma;
                    iTempB = 0;
                    break;
                case 2:
                    iTempR = 0;
                    iTempG = fChroma;
                    iTempB = fX;
                    break;
                case 3:
                    iTempR = 0;
                    iTempG = fX;
                    iTempB = fChroma;
                    break;
                case 4:
                    iTempR = fX;
                    iTempG = 0;
                    iTempB = fChroma;
                    break;
                default:
                    iTempR = fChroma;
                    iTempG = 0;
                    iTempB = fX;
                    break;
            }

            //-- Calculate the RGB values --//
            iRed   = Math.floor( ( iTempR+fM ) * 255 );
            iGreen = Math.floor( ( iTempG+fM ) * 255 );
            iBlue  = Math.floor( ( iTempB+fM ) * 255 );

            mValues = {
                red     : iRed,
                green   : iGreen,
                blue    : iBlue
            };
            
        } catch (e) {
            mValues = {
                red     : 0,
                green   : 0,
                blue    : 0
            };
            
            $.sap.log.error("Error in IomyRe.functions.convertHSL255ToRGB ("+e.name+"): " + e.message);
            
        } finally {
            return mValues;
        }
        
    },
    
    /**
     * Takes a set of RGB values and converts them to hexadecminal notation.
     * 
     * @param {type} mSettings      Map containing the red, green, and blue values.
     * @returns {String}            Hex value
     */
    convertRGBToHex : function (mSettings) {
        var bError          = false;
        var aErrorMessages  = [];
        var sHexString      = "";
        
        var sRedValueMissing    = "Red value is missing.";
        var sGreenValueMissing  = "Green value is missing.";
        var sBlueValueMissing   = "Blue value is missing.";
        
        var fnAppendError = function (sErrorMessages) {
            bError = true;
            aErrorMessages.push(sErrorMessages);
        };
        
        
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.red === undefined || mSettings.red === null) {
                fnAppendError(sRedValueMissing);
            }
            
            if (mSettings.green === undefined || mSettings.green === null) {
                fnAppendError(sGreenValueMissing);
            }
            
            if (mSettings.blue === undefined || mSettings.blue === null) {
                fnAppendError(sBlueValueMissing);
            }
            
            if (bError) {
                throw new MissingArgumentException(aErrorMessages.join('\n\n'));
            }
        } else {
            fnAppendError(sRedValueMissing);
            fnAppendError(sGreenValueMissing);
            fnAppendError(sBlueValueMissing);
            
            throw new MissingSettingsMapException(aErrorMessages.join('\n\n'));
        }
        
        try {
            $.each(mSettings, function (sI, iColourValue) {
                var iResult     = iColourValue;
                var sCharString = "";
                var vRemainder;
                var mHexLetters = {
                    "_10" : "A",
                    "_11" : "B",
                    "_12" : "C",
                    "_13" : "D",
                    "_14" : "E",
                    "_15" : "F"
                };

                if (iResult === 0) {
                    sHexString += "00";

                } else {
                    while (iResult > 0) {
                        vRemainder  = iResult % 16;
                        iResult     = (iResult - vRemainder) / 16;

                        if (vRemainder > 9) {
                            vRemainder = mHexLetters["_"+vRemainder];
                        }

                        sCharString = vRemainder + sCharString;
                    }

                    if (sCharString.length < 2) {
                        sCharString = '0' + sCharString;
                    }
                }

                sHexString += sCharString;

            });
        } catch (e) {
            sHexString = null;
            $.sap.log.error("Error converting RGB values to HEX format ("+e.name+"): " + e.message);
            
        } finally {
            return sHexString;
        }
    },
    
    /**
     * Converts HSL values to a HEX string.
     * 
     * @param {type} iHue       Hue
     * @param {type} iSat       Saturation
     * @param {type} iLight     Luminance
     * @returns {object}        RGB values
     */
    convertHSLToHex : function (iHue, iSat, iLight) {
        return this.convertRGBToHex(this.convertHSLToRGB(iHue, iSat, iLight));
    },
    
    convertHSL255ToHex : function (iHue, iSat, iLight) {
        return this.convertRGBToHex(this.convertHSL255ToRGB(iHue, iSat, iLight));
    },
    
    
    convertHSL: function( sFromType, sToType, iThingType, iOldHue, iOldSat, iOldLig ) {
        //------------------------------------//
        //-- 1.0 - DECLARE VARIABLES        --//
        //------------------------------------//
        var bError       = false;
        var sErrMesg     = "";
        var fHueConvRate = null;
        var fSatConvRate = null;
        var fLigConvRate = null;
        
        
        //------------------------------------------------------------//
        //-- NOTE: The Simple Slider heavily rounds values          --//
        //--     The values returned from the conversion are very   --//
        //-- likely different from the values used to make the      --//
        //-- simple slider values due to the how much rounding is   --//
        //-- done for the simple slider conversion                  --//
        //------------------------------------------------------------//
        
        
        try {
            //------------------------------------//
            //-- 3.0 - ERROR CHECKING           --//
            //------------------------------------//
            if( iThingType!=IomyRe.devices.philipshue.ThingTypeId && iThingType!=IomyRe.devices.csrmesh.ThingTypeId ) {
                bError   = true;
                sErrMesg = "Unsupported ThingType Id! ThingTypeId="+iThingType;
            } 
            
            //------------------------------------//
            //-- 4.0 - LOOKUP CONVERTRATE       --//
            //------------------------------------//
            if( bError===false ) {
                if( sFromType==="DB" ) {
                    //------------------------------------//
                    //-- DB -> Normal                   --//
                    //------------------------------------//
                    if( sToType==="Normal" ) {
                        if( iThingType == IomyRe.devices.philipshue.ThingTypeId) {
                            fHueConvRate   = 360 / 65535;      // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                            fSatConvRate   = 254 / 255;
                            fLigConvRate   = 254 / 255;
                            
                        } else if ( iThingType == IomyRe.devices.csrmesh.ThingTypeId) {
                            fHueConvRate   = 1;
                            fSatConvRate   = 1;
                            fLigConvRate   = 1;
                            
                        }
                    } else {
                        //-- ERROR: --//
                        bError   = true;
                        sErrMesg = "Unsupported From->To Combination!";
                        
                    }
                    
                } else if( sFromType==="Normal" ) {
                    //------------------------------------//
                    //-- Normal -> DB                   --//
                    //------------------------------------//
                    if( sToType==="DB" ) {
                        if( iThingType == IomyRe.devices.philipshue.ThingTypeId ) {
                            fHueConvRate   = 65535 / 360 ;      // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                            fSatConvRate   = 254 / 255;
                            fLigConvRate   = 254 / 255;
                            
                        } else if( iThingType == IomyRe.devices.csrmesh.ThingTypeId ) {
                            fHueConvRate   = 1;
                            fSatConvRate   = 1;
                            fLigConvRate   = 1;
                        }
                    //------------------------------------//
                    //-- Normal -> Simple Slider        --//
                    //------------------------------------//
                    } else if( sToType==="SimpleSlider" ) {
                        fHueConvRate   = 1;
                        fSatConvRate   = 100 / 255;
                        fLigConvRate   = 100 / 255;
                        
                    //------------------------------------//
                    //-- Normal -> Adv Slider           --//
                    //------------------------------------//
                    } else if ( sToType==="AdvancedSlider") {
                        fHueConvRate   = 1;
                        fSatConvRate   = 100 / 255;
                        fLigConvRate   = 100 / 255;
                        
                    } else {
                        //-- ERROR: --//
                        bError   = true;
                        sErrMesg = "Unsupported From->To Combination!";
                        
                    }
                    
                } else if( sFromType==="SimpleSlider" ) {
                    //------------------------------------//
                    //-- Simple Slider -> DB            --//
                    //------------------------------------//
                    if( sToType==="DB" ) {
                        if( iThingType == IomyRe.devices.philipshue.ThingTypeId ) {
                            fHueConvRate   = 65535 / 360;      // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                            fSatConvRate   = 254 / 100 ;
                            fLigConvRate   = 254 / 100 ;
                            
                        } else if( iThingType == IomyRe.devices.csrmesh.ThingTypeId ) {
                            fHueConvRate   = 1;
                            fSatConvRate   = 1;
                            fLigConvRate   = 1;
                            
                        }
                        
                    //------------------------------------//
                    //-- Simple Slider -> Normal        --//
                    //------------------------------------//
                    } else if( sToType==="Normal" ) {
                        fHueConvRate   = 1;
                        fSatConvRate   = 255 / 100;
                        fLigConvRate   = 255 / 100;
                        
                    //------------------------------------//
                    //-- Simple Slider -> Adv Slider    --//
                    //------------------------------------//
                    } else if( sToType==="AdvancedSlider" ) {
                        fHueConvRate   = 1;
                        fSatConvRate   = 1;
                        fLigConvRate   = 1;
                        
                    } else {
                        //-- ERROR: --//
                        bError   = true;
                        sErrMesg = "Unsupported From->To Combination!";
                        
                    }
                    
                } else if( sFromType==="AdvancedSlider" ) {
                    //------------------------------------//
                    //-- Adv Slider -> DB               --//
                    //------------------------------------//
                    if( sToType==="DB" ) {
                        if( iThingType == IomyRe.devices.philipshue.ThingTypeId ) {
                            fHueConvRate   = 65535 / 360;      // 65535 (2^16 - 1) is the maximum value the Philips Hue API will accept.
                            fSatConvRate   = 254 / 100;
                            fLigConvRate   = 254 / 100;
                            
                        } else if( iThingType == IomyRe.devices.csrmesh.ThingTypeId ) {
                            fHueConvRate   = 1;
                            fSatConvRate   = 1;
                            fLigConvRate   = 1;
                            
                        }
                    //------------------------------------//
                    //-- Adv Slider -> Normal           --//
                    //------------------------------------//
                    } else if ( sToType==="Normal") {
                        fHueConvRate   = 1;
                        fSatConvRate   = 1;
                        fLigConvRate   = 1;
                        
                    } else {
                        //-- ERROR: --//
                        bError   = true;
                        sErrMesg = "Unsupported From->To Combination!";
                    }
                } else {
                    //-- ERROR: --//
                    bError   = true;
                    sErrMesg = "Unsupported From->To Combination!";
                    
                }
            }
            
            //------------------------------------//
            //-- 5.0 - CONVERT THE VALUES       --//
            //------------------------------------//
            if( bError===false ) {
                var iNewHue = Math.round( iOldHue * fHueConvRate );
                var iNewSat = Math.round( iOldSat * fSatConvRate );
                var iNewLig = Math.round( iOldLig * fLigConvRate );
                
            }
            
            
            //------------------------------------//
            //-- 9.0 - RETURN THE RESULTS       --//
            //------------------------------------//
            if( bError===false ) {
                return {
                    "Error": false,
                    "Hue":   iNewHue,
                    "Sat":   iNewSat,
                    "Lig":   iNewLig
                };
                
            } else {
                return {
                    "Error":   true,
                    "ErrMesg": "Critical Error: Problem Converting HSL Values! "+sErrMesg
                };
                
            }
        } catch( e01 ) {
            return {
                "Error":   true,
                "ErrMesg": "Critical Error: Problem Converting HSL Values"
            };
        }
    },
    
    
    /**
     * Retrives the hub that a thing is connected to.
     * 
     * @param {type} iThingId        ID of the Thing
     * @returns {Object}            Map containing the hub that a thing is associated with.
     * 
     * @throws IllegalArgumentException when the Thing ID is either not given, invalid, or if it refers to a thing that doesn't exist.
     *\/
    getHubConnectedToLink : function (iLinkId) {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        var bError            = true;
        var aErrorMessages    = [];
        var mLinkIdInfo     = IomyRe.validation.isLinkIDValid(iLinkId);
        var iCommId;
        var iHubId;
        
        //--------------------------------------------------------------------//
        // Check Thing ID
        //--------------------------------------------------------------------//
        bError = !mLinkIdInfo.bIsValid;
        aErrorMessages = aErrorMessages.concat(mLinkIdInfo.aErrorMessages);
        
        if (bError) {
            throw new IllegalArgumentException(aErrorMessages.join("\n"));
        }
        
        //--------------------------------------------------------------------//
        // Find its Comm ID and Hub ID and get the hub using the Hub ID.
        //--------------------------------------------------------------------//
        iCommId    = IomyRe.common.LinkList["_"+iLinkId].CommId;
        iHubId    = IomyRe.common.CommList["_"+iCommId].HubId;
        
        return IomyRe.common.HubList["_"+iHubId];
        
    },*/
    
    /**
     * Creates a JSON structure of New Device form data that is used in the
     * JSON model to store user input for submission.
     * 
     * @returns {Object}        Data structure
     */
    getDeviceFormJSON : function () {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        
        //-- List --//
        var structOptions        = {};
        
        //-- Import core variables --//
        var aDeviceList;
        var aDeviceTypeList;
        
        try {
            //--------------------------------------------------------------------//
            // Get the core variables for this function
            //--------------------------------------------------------------------//
            aDeviceList        = IomyRe.common.LinkList;
            aDeviceTypeList    = IomyRe.common.LinkTypeList;

            //--------------------------------------------------------------------//
            // Begin Constructing the structure by adding device types.
            //--------------------------------------------------------------------//
            $.each(aDeviceTypeList, function (sI, mDeviceType) {
                // TODO: Place all of these options in alphabetical order.
                if (mDeviceType.LinkTypeId === IomyRe.devices.zigbeesmartplug.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Hub" : "",
                        "Premise" : "",
                        "Modem" : ""
                    };
                }

                if (mDeviceType.LinkTypeId === IomyRe.devices.onvif.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Hub" : "",
                        "Premise" : "",
                        "Room" : "1",
                        "IPAddress" : "",
                        "IPPort" : "",
                        "DisplayName" : "",
                        "Username" : "",
                        "Password" : ""
                    };
                }

                if (mDeviceType.LinkTypeId === IomyRe.devices.philipshue.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Hub" : "",
                        "Premise" : "",
                        "Room" : "1",
                        "IPAddress" : "",
                        "IPPort" : "",
                        "DeviceToken" : "",
                        "DisplayName" : ""
                    };
                }

                if (mDeviceType.LinkTypeId === IomyRe.devices.weatherfeed.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Hub" : "",
                        "Premise" : "",
                        "Room" : "1",
                        "DisplayName" : "",
                        "StationCode" : "",
                        "KeyCode" : ""
                    };
                }

                if (mDeviceType.LinkTypeId === IomyRe.devices.ipcamera.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Hub" : "",
                        "Premise" : "",
                        "Room" : "1",
                        "IPCamType" : "MJPEG",
                        "Protocol" : "http",
                        "IPAddress" : "",
                        "IPPort" : "",
                        "Path" : "",
                        "DisplayName" : "",
                        "LinkName" : "",
                        "Username" : "",
                        "Password" : ""
                    };
                }

            });

            //--------------------------------------------------------------------//
            // Add the onvif camera option
            //--------------------------------------------------------------------//
            structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
                "CameraName" : "",
                "OnvifServer" : "",
                "StreamProfile" : "",
                "ThumbnailProfile" : ""
            };
        } catch (e) {
            structOptions = {};
            $.sap.log.error("Failed the load the device form model ("+e.name+"): " + e.message);
            
        } finally {
            return structOptions;
        }
    },
    
    /**
	 * Retrives the hub that a thing is connected to.
	 * 
	 * @param {type} iThingId		ID of the Thing
	 * @returns {Object}			Map containing the hub that a thing is associated with.
	 * 
	 * @throws IllegalArgumentException when the Thing ID is either not given, invalid, or if it refers to a thing that doesn't exist.
	 */
	getHubConnectedToThing : function (iThingId) {
        try {
            //--------------------------------------------------------------------//
            // Variables
            //--------------------------------------------------------------------//
            var bError			= true;
            var aErrorMessages	= [];
            var mThingIdInfo	= IomyRe.validation.isThingIDValid(iThingId);
            var mThing;
            var iCommId;
            var iHubId;

            //--------------------------------------------------------------------//
            // Check Thing ID
            //--------------------------------------------------------------------//
            bError = !mThingIdInfo.bIsValid;
            aErrorMessages = aErrorMessages.concat(mThingIdInfo.aErrorMessages);

            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }

            //--------------------------------------------------------------------//
            // Find its Comm ID and Hub ID and get the hub using the Hub ID.
            //--------------------------------------------------------------------//
            mThing	= IomyRe.common.ThingList["_"+iThingId];
            iCommId	= IomyRe.common.LinkList["_"+mThing.LinkId].CommId;
            iHubId	= IomyRe.common.CommList["_"+iCommId].HubId;

            return IomyRe.common.HubList["_"+iHubId];
        } catch (e) {
            $.sap.log.error("Failed to retrieve hub information for a device ("+e.name+"): " + e.message);
            return null;
        }
		
	},
    
    /**
     * Takes a UTS figure and compares it with the UTS figure created as this
     * function executes. The parameters are as follows:
     * 
     * Required parameters:
     * UTS              : The time in the past. Required for comparing with the UTS now.
     * 
     * Optional parameters:
     * showDay          : Boolean flag to show how many days ago the given point in time was, default: true,
     * showHours        : Boolean flag to show how many hours ago the given point in time was, default: true,
     * showMinutes      : Boolean flag to show how many minutes ago the given point in time was, default: true,
     * showSeconds      : Boolean flag to show how many seconds ago the given point in time was, default: true,
     * showMilliseconds : Boolean flag to show how many milliseconds ago the given point in time was, default: false,
     * 
     * Will throw an exception if the UTS is not given in mSettings.
     * 
     * @param {type} mSettings              Map of both required and optional
     * @returns {string}                    Human-readable format of how long since the given point in time.
     */
    getLengthOfTimePassed : function (mSettings) {
        
        //--------------------------------------------------------------------//
        // Check that the UTS has been given.
        //--------------------------------------------------------------------//
        if (mSettings.UTS === undefined) {
            //----------------------------------------------------------------//
            // Report and throw an exception if no UTS is given.
            //----------------------------------------------------------------//
            jQuery.sap.log.error("IomyRe.functions.getLengthOfTimePassedSince() requires a UTS parameter!");
            throw "IomyRe.functions.getLengthOfTimePassedSince() requires a UTS parameter!";
            
        } else {
            //----------------------------------------------------------------//
            // Populate any undeclared optional parameters with their defaults
            //----------------------------------------------------------------//
            if (mSettings.showDay === undefined) {
                mSettings.showDay = true;
            }
            
            if (mSettings.showHours === undefined) {
                mSettings.showHours = true;
            }
            
            if (mSettings.showMinutes === undefined) {
                mSettings.showMinutes = true;
            }
            
            if (mSettings.showSeconds === undefined) {
                mSettings.showSeconds = true;
            }
            
            if (mSettings.showMilliseconds === undefined) {
                mSettings.showMilliseconds = false;
            }
            
            //----------------------------------------------------------------//
            // Declare variables, fetch parameters.
            //----------------------------------------------------------------//
            var iUTSPast            = mSettings.UTS * 1000;
            var bShowDay            = mSettings.showDay;
            var bShowHours          = mSettings.showHours;
            var bShowMinutes        = mSettings.showMinutes;
            var bShowSeconds        = mSettings.showSeconds;
            var bShowMilliseconds   = mSettings.showMilliseconds;
            
            var dUTSPresent         = new Date();
            var iTimePassed         = dUTSPresent.getTime() - iUTSPast;
            
            var sReadableTimePassed = "";
            var sMillisecondsPassed = "";
            var sSecondsPassed      = "";
            var sMinutesPassed      = "";
            var sHoursPassed        = "";
            var sDaysPassed         = "";
            
            //----------------------------------------------------------------//
            // Start measuring in days, hours, minutes, seconds and milliseconds
            //----------------------------------------------------------------//
            
            // -- If we show milliseconds -- //
            if (bShowMilliseconds) {
                sMillisecondsPassed += Math.floor( iTimePassed % 1000 ) + "ms";
                sReadableTimePassed = sMillisecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show seconds -- //
            if (bShowSeconds) {
                sSecondsPassed += Math.floor( (iTimePassed / 1000) % 60 ) + "s";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sSecondsPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sSecondsPassed + sReadableTimePassed;
            }
            
            // -- If we show minutes -- //
            if (bShowMinutes) {
                sMinutesPassed += Math.floor( ( (iTimePassed / 1000 ) / 60) % 60 ) + "m";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sMinutesPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sMinutesPassed + sReadableTimePassed;
            }
            
            // -- If we show hours -- //
            if (bShowHours) {
                sHoursPassed += Math.floor( ( ( (iTimePassed / 1000 ) / 60 ) / 60) % 24 ) + "h";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sHoursPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sHoursPassed + sReadableTimePassed;
            }
            
            // -- If we show days -- //
            if (bShowDay) {
                sDaysPassed += Math.floor( ( ( ( (iTimePassed / 1000  ) / 60 ) / 60 ) / 24) % 365 ) + "d";
                // Add a space if necessary.
                if (sReadableTimePassed.length > 0) {
                    sDaysPassed += " ";
                }
                // Continue to construct the final string.
                sReadableTimePassed = sDaysPassed + sReadableTimePassed;
            }
            
            return sReadableTimePassed;
            
        }
        
    },
    
    /**
     * Gathers the Conn information from a given link.
     * 
     * @param {type} iLinkId        ID of the link to retrieve the information from
     * @returns {map}               Link Conn Information
     */
    getLinkConnInfo : function (iLinkId) {
        
        try {
            var mLinkValidation = IomyRe.validation.isLinkIDValid(iLinkId);
            
            if (!mLinkValidation.bIsValid) {
                throw new MissingSettingsMapException(mLinkValidation.aErrorMessages.join("\n"));
            }
            
            var mLink = IomyRe.common.LinkList["_"+iLinkId];
            var mLinkConnInfo = {
                LinkConnId              : mLink.LinkConnId,
                LinkConnName            : mLink.LinkConnName,
                LinkConnAddress         : mLink.LinkConnAddress,
                LinkConnUsername        : mLink.LinkConnUsername,
                LinkConnPassword        : mLink.LinkConnPassword,
                LinkConnPort            : mLink.LinkConnPort
            };

            return mLinkConnInfo;
        } catch (e) {
            $.sap.log.error("Failed to fetch LinkConn information ("+e.name+"): " + e.message);
            return null;
        }
    },
    
    /**
     * Gets the link type ID from a given link.
     * 
     * @param {type} iLinkId    Given Link ID
     * @returns                 Link Type ID or NULL
     */
    getLinkTypeIDOfLink : function (iLinkId) {
        var iLinkTypeId = null;
        
        try {
            $.each(IomyRe.common.LinkList, function (sI, mLink) {
                if (mLink.LinkId == iLinkId) {
                    iLinkTypeId = mLink.LinkTypeId;
                    return false;
                }
            });
            
            return iLinkTypeId; 
            
        } catch (e) {
            $.sap.log.error("An error occurred in IomyRe.functions.getLinkTypeIDOfLink(): "+e.name+": "+e.message);
        }
    },
    
    /**
     * Creates a JSON structure that contains a list of device types for users
     * to select from.
     * 
     * Example:
     * 
     * {
     *     "type2" : {
     *         "Id" : 2,
     *         "Name" : "New Zigbee Dongle",
     *         "Type" : "type"
     *     },
     * }
     * 
     * @returns {Object}        Data structure
     */
    getNewDeviceOptions : function () {
        //--------------------------------------------------------------------//
        // Variables
        //--------------------------------------------------------------------//
        
        //-- List --//
        var structOptions        = {};
        
        //-- Import core variables --//
        var aDeviceList;
        var aDeviceTypeList;
        
        try {
            //--------------------------------------------------------------------//
            // Get the core variables for this function
            //--------------------------------------------------------------------//
            aDeviceList        = IomyRe.common.LinkList;
            aDeviceTypeList    = IomyRe.common.LinkTypeList;

            //--------------------------------------------------------------------//
            // Begin Constructing the structure by adding device types.
            //--------------------------------------------------------------------//
            $.each(aDeviceTypeList, function (sI, mDeviceType) {
                // TODO: Place all of these options in alphabetical order.
                if (mDeviceType.LinkTypeId === IomyRe.devices.zigbeesmartplug.LinkTypeId ||
                    mDeviceType.LinkTypeId === IomyRe.devices.onvif.LinkTypeId ||
                    mDeviceType.LinkTypeId === IomyRe.devices.philipshue.LinkTypeId ||
                    mDeviceType.LinkTypeId === IomyRe.devices.weatherfeed.LinkTypeId ||
                    mDeviceType.LinkTypeId === IomyRe.devices.ipcamera.LinkTypeId)
                {
                    structOptions["linkType"+mDeviceType.LinkTypeId] = {
                        "Id"          : mDeviceType.LinkTypeId,
                        "Name"        : mDeviceType.LinkTypeName,
                        "Type"        : "link"
                    };
                }

            });

            //--------------------------------------------------------------------//
            // Add the onvif camera option
            //--------------------------------------------------------------------//
            structOptions["thingType"+IomyRe.devices.onvif.ThingTypeId] = {
                "Id"          : IomyRe.devices.onvif.ThingTypeId,
                "Name"        : "Onvif Stream",
                "Type"        : "thing"
            };
        } catch (e) {
            structOptions = {};
            $.sap.log.error("Failed to generate options for the New Device page ("+e.name+"): " + e.message);
        }
        
        return structOptions;
    },
    
    getNumberOfDevicesInPremise : function (iPremiseId) {
        var iCount = 0;
        
        try {
            var mIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);
        
            if (mIDInfo.bIsValid) {
                $.each(IomyRe.common.ThingList, function (sI, mThing) {
                    if (iPremiseId == mThing.PremiseId) {
                        iCount++;
                    }
                });
            }
        } catch (e) {
            iCount = -1;
            $.sap.log.error("Failed to find the number of devices in the premise (ID: "+iPremiseId+") ("+e.name+"): " + e.message);
            
        } finally {
            return iCount;
        }
    },
    
    getNumberOfDevicesInRoom : function (iRoomId) {
        var iCount = 0;
        
        try {
            var mIDInfo = IomyRe.validation.isRoomIDValid(iRoomId);

            if (mIDInfo.bIsValid) {
                $.each(IomyRe.common.ThingList, function (sI, mThing) {
                    if (iRoomId == mThing.RoomId) {
                        iCount++;
                    }
                });
            }
        } catch (e) {
            iCount = -1;
            $.sap.log.error("Failed to find the number of devices in the room (ID: "+iRoomId+") ("+e.name+"): " + e.message);
            
        } finally {
            return iCount;
        }
    },
    
    getNumberOfRoomsInPremise : function (iPremiseId) {
        var iCount = 0;
        
        try {
            var mIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);

            if (mIDInfo.bIsValid) {
                $.each(IomyRe.common.RoomsList["_"+iPremiseId], function (sI, mRoom) {
                    if (sI !== undefined && sI !== null && mRoom !== undefined && mRoom !== null) {
                        iCount++;
                    }
                });
            }

        } catch (e) {
            iCount = -1;
            $.sap.log.error("Failed to find the number of rooms in the premise (ID: "+iPremiseId+") ("+e.name+"): " + e.message);
            
        } finally {
            return iCount;
        }
    },
    
    getRoom : function (iRoomId, iPremiseId) {
        var mIDInfo     = IomyRe.validation.isRoomIDValid(iRoomId);
        var mFoundRoom  = null;
        
        if (mIDInfo.bIsValid) {
            //----------------------------------------------------------------//
            // Check if the premise ID is given and valid and use that to fetch
            // the room data.
            //----------------------------------------------------------------//
            if (iPremiseId !== undefined && iPremiseId !== null) {
                var mPremiseIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);
                
                if (mPremiseIDInfo.bIsValid) {
                    mFoundRoom = IomyRe.common.RoomsList["_"+iPremiseId]["_"+iRoomId];
                } else {
                    throw new IllegalArgumentException(mPremiseIDInfo.aErrorMessages.join('\n'));
                }
                
            } else {
                //----------------------------------------------------------------//
                // Otherwise, loop through each premise to find the room.
                //----------------------------------------------------------------//
                $.each(IomyRe.common.RoomsList, function (sI, mPremise) {
                    if (sI !== undefined && sI !== null && mPremise !== undefined && mPremise !== null) {
                        var bFound = false;
                        
                        $.each(mPremise, function (sJ, mRoom) {
                            if (sJ !== undefined && sJ !== null && mRoom !== undefined && mRoom !== null) {
                                
                                if (mRoom.RoomId == iRoomId) {
                                    mFoundRoom = mRoom;
                                    bFound = true;
                                    return false;
                                }
                                
                            }
                            
                        });
                        
                        if (bFound) {
                            return false;
                        }
                        
                    }
                });
            }
        } else {
            throw new IllegalArgumentException(mIDInfo.aErrorMessages.join('\n\n'));
        }
        
        return mFoundRoom;
    },
    
    /**
     * Generates a human-readable timestamp from a JS Date.
     * 
     * @param {type} date       Given date
     * @param {type} sFormat    Date format in dd/mm/yy or mm/dd/yy
     * @returns {String}        Human-readable date and time
     */
    getTimestampString : function (date, sFormat, bShowTime, bShowSeconds) {
        //----------------------------------------------------------//
        // Declare variables and define default arguments
        //----------------------------------------------------------//
        var bError          = false;
        var aErrorMessages  = [];
        
        var sDate       = ""; // Set according to the given format
        var sTime       = "";
        var sTimestamp  = "";
        
        var iHour;
        var vMinutes;
        var vSeconds;
        var sSuffix;

        var iYear;
        var vMonth;
        var vDay;

        if (date === undefined || date === null || !(date instanceof Date)) {
            bError = true;
            aErrorMessages.push("Date must be given");
        }
        
        if (bShowTime === undefined) {
            bShowTime = true;
        }
        
        if (bShowSeconds === undefined) {
            bShowSeconds = true;
        }
        
        //--------------------------------------------------------------------//
        // Process the date.
        //--------------------------------------------------------------------//
        try {
            iYear       = date.getFullYear();
            vMonth      = date.getMonth() + 1;
            vDay        = date.getDate();

            if (vMonth < 10) {
                vMonth = "0"+vMonth;
            }

            if (vDay < 10) {
                vDay = "0"+vDay;
            }
            
            if (sFormat === undefined) {
                sFormat = "dd/mm/yyyy";
            }

            if (sFormat === "dd/mm/yyyy" || sFormat === "dd/mm/yy") {
                sDate = vDay+"/"+vMonth+"/"+iYear+" ";
            } else if (sFormat === "mm/dd/yyyy" || sFormat === "mm/dd/yy") {
                sDate = vMonth+"/"+vDay+"/"+iYear+" ";
            } else if (sFormat === "yyyy/mm/dd" || sFormat === "yy/mm/dd") {
                sDate = iYear+"/"+vMonth+"/"+vDay+" ";
            } else if (sFormat === "yyyy-mm-dd" || sFormat === "yy-mm-dd") {
                sDate = iYear+"-"+vMonth+"-"+vDay+" ";
            } else {
                sDate = "";
            }

        } catch (e) {
            sDate = "";
            $.sap.log.error("Error processing the date ("+e.name+"): " + e.message);
        }
        
        //--------------------------------------------------------------------//
        // Process the time.
        //--------------------------------------------------------------------//
        try {
            iHour       = date.getHours();
            vMinutes    = date.getMinutes();
            vSeconds    = date.getSeconds();
            sSuffix     = "";

            if (iHour >= 12) {
                sSuffix = "PM";
            } else {
                sSuffix = "AM";
            }

            iHour = iHour % 12;
            if (iHour === 0) {
                iHour = 12;
            }
            
            if (vSeconds < 10) {
                vSeconds = "0"+vSeconds;
            }

            if (vMinutes < 10) {
                vMinutes = "0"+vMinutes;
            }
            
            if (bShowTime) {
                if (bShowSeconds) {
                    sTime = iHour + ":" + vMinutes + ":" + vSeconds + sSuffix;
                } else {
                    sTime = iHour + ":" + vMinutes + sSuffix;
                }
            }
        } catch (e) {
            sTime = "";
            $.sap.log.error("Error creating the time ("+e.name+"): " + e.message);
        }
        
        //--------------------------------------------------------------------//
        // Create the timestamp string. If it's empty, return N/A.
        //--------------------------------------------------------------------//
        sTimestamp = sDate + sTime;
        
        if (sTimestamp === "") {
            return "N/A";
        } else {
            return sTimestamp;
        }
    },
    
    //------------------------------------------------------------------------//
    // Section for permissions.
    //------------------------------------------------------------------------//
    permissions : {
        
        getRoomPermissionLevel : function (mSettings) {
            var iLevel  = 1;        // No Access for default

            if (mSettings === undefined || mSettings === null) {
                throw new MissingArgumentException("Permission settings are required.");
            }
            
            //----------------------------------------------------//
            // Determine the permission level the current user has
            //----------------------------------------------------//
            if (mSettings.Read === 0) {
                iLevel = 1; // No Access

            } else if (mSettings.Read === 1) {
                iLevel = 2; // Read-only, Device Access

                //----------------------------------------------------//
                // Permission to modify the premise
                //----------------------------------------------------//
                if (mSettings.StateToggle === 1) {
                    iLevel = 3; // Read-only, Device Management

                    if (mSettings.Write === 1) {
                        iLevel = 4; // Device Management and Read/Write (Full Access)
                    }
                }

            }
            
            return iLevel;
        },
        
        getMostCommonPermissionForAllRooms : function (aPermissionLevels) {
            var iMin = null;

            if (aPermissionLevels === undefined || aPermissionLevels === null) {
                throw new MissingArgumentException("Array of permission levels is required.");
            }

            for (var i = 0; i < aPermissionLevels.length; i++) {
                if (iMin === null) {
                    iMin = aPermissionLevels[i];
                } else if (iMin > aPermissionLevels[i]) {
                    iMin = aPermissionLevels[i];
                }
            }

            return iMin;
        },
        
        getIndividualRoomPermissionForALevel : function (iLevel) {
            var iRoomRead = 0;
            var iRoomDataRead = 0;
            var iRoomWrite = 0;
            var iRoomStateToggle = 0;

            //-- If check to see what permissions need to be passed --//
            if (iLevel === undefined || iLevel === null) {
                throw new MissingArgumentException("Permission level must be given.");
                
            } else if (iLevel === 2 ) {
                //-- Read Access--//
                iRoomRead = 1;
                iRoomDataRead = 1;
                iRoomWrite = 0;
                iRoomStateToggle = 0;

            } else if (iLevel === 3) {
                //-- Read / Device Toggle Access--//
                iRoomRead = 1;
                iRoomDataRead = 1;
                iRoomWrite = 0;
                iRoomStateToggle = 1;

            } else if (iLevel === 4) {
                //-- Read/Write Access--//
                iRoomRead = 1;
                iRoomDataRead = 1;
                iRoomWrite = 1;
                iRoomStateToggle = 1;

            } else {
                //-- No Access--//
                iRoomRead = 0;
                iRoomDataRead = 0;
                iRoomWrite = 0;
                iRoomStateToggle = 0;
            }
            
            return {
                "Read"          : iRoomRead,
                "DataRead"      : iRoomDataRead,
                "StateToggle"   : iRoomStateToggle,
                "Write"         : iRoomWrite
            };
        },
        
        isUserRoomAdminForPremise : function (iPremiseId) {
            var mPremiseValidation;
            var bIsAdmin = false;
            
            try {
                mPremiseValidation = IomyRe.validation.isPremiseIDValid(iPremiseId);
                
                if (mPremiseValidation.bIsValid) {
                    bIsAdmin = IomyRe.common.PremiseList["_"+iPremiseId].PermRoomAdmin == 1;
                } else {
                    throw new InvalidArgumentException(mPremiseValidation.aErrorMessages.join('\n\n'));
                }
            } catch (e) {
                bIsAdmin = false;
                $.sap.log.error("Error finding if the user is the room admin ("+e.name+"): " + e.message);
            }
            
            return bIsAdmin;
        },
        
        isUserPremiseOwner : function (iPremiseId) {
            var mPremiseValidation;
            var bIsAdmin = false;
            
            try {
                mPremiseValidation = IomyRe.validation.isPremiseIDValid(iPremiseId);
                
                if (mPremiseValidation.bIsValid) {
                    bIsAdmin = IomyRe.common.PremiseList["_"+iPremiseId].PermOwner == 1;
                } else {
                    throw new InvalidArgumentException(mPremiseValidation.aErrorMessages.join('\n\n'));
                }
            } catch (e) {
                bIsAdmin = false;
                $.sap.log.error("Error finding if the user is the room admin ("+e.name+"): " + e.message);
            }
            
            return bIsAdmin;
        },
        
        fetchRoomPermissions : function (mSettings) {
            var self                = this;               // REMEMBER: 'this' refers to IomyRe.functions.permissions. NOT IomyRe.functions!
            var bError              = false;
            var aErrorMessages      = [];
            var sUrl                = IomyRe.apiphp.APILocation("permissions");
            var iUserId             = null;
            var iRoomId             = null;
            var iPremiseId          = null;
            var aPermissionLevels   = [];

            var fnSuccess;
            var fnWarning;
            var fnFail;
            
            //----------------------------------------------------------------//
            // Missing variable error messages.
            //----------------------------------------------------------------//
            var sNoUserIDMessage        = "User ID is required (userID).";
            var sNoRoomIDMessage        = "Room ID is required (roomID).";
            var sNoPremiseIDMessage     = "Premise ID is required (premiseID).";
            
            var fnAppendError = function (sErrorMessages) {
                bError = true;
                aErrorMessages.push(sErrorMessages);
                jQuery.sap.log.error(sErrorMessages);
            };
            
            //----------------------------------------------------------------//
            // Process the settings map.
            //----------------------------------------------------------------//
            if (mSettings !== undefined && mSettings !== null) {
                
                //------------------------------------------------------------//
                // Find the User ID
                //------------------------------------------------------------//
                if (mSettings.userID !== undefined && mSettings.userID !== null) {
                    iUserId = mSettings.userID;
                } else {
                    fnAppendError(sNoUserIDMessage);
                }
                
                //------------------------------------------------------------//
                // Find and either validate the room ID or find the premise ID.
                //------------------------------------------------------------//
                if (mSettings.roomID !== undefined && mSettings.roomID !== null) {
                    iRoomId = mSettings.roomID;
                    
                    //------------------------------------------------------------//
                    // If the ID is 0, we're finding out the permissions for all
                    // rooms. Make sure the premise is specified and is valid.
                    //------------------------------------------------------------//
                    if (iRoomId == 0) {
                        if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                            iPremiseId = mSettings.premiseID;
                            
                            var mPremiseIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);

                            if (!mPremiseIDInfo.bIsValid) {
                                aErrorMessages = aErrorMessages.concat(mPremiseIDInfo.aErrorMessages);
                            } else {
                                //-- Check that the user has room administration privileges for this premise. --//
                                if (!self.isUserRoomAdminForPremise(iPremiseId)) {
                                    fnAppendError("Room administration privileges are required to modify permissions for each room in the premise.");
                                }
                            }
                        } else {
                            fnAppendError(sNoPremiseIDMessage);
                        }
                        
                    } else {
                        //------------------------------------------------------------//
                        // Otherwise, validate the room ID.
                        //------------------------------------------------------------//
                        var mRoomIDInfo = IomyRe.validation.isRoomIDValid(iRoomId);

                        if (!mRoomIDInfo.bIsValid) {
                            aErrorMessages = aErrorMessages.concat(mRoomIDInfo.aErrorMessages);
                        }
                    }
                    
                } else {
                    fnAppendError(sNoRoomIDMessage);
                }
                
                //------------------------------------------------------------//
                // Check that the success callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                    fnSuccess = mSettings.onSuccess;
                    
                    if (typeof fnSuccess !== "function") {
                        fnAppendError("Success callback function is not a valid function. Received a "+typeof fnSuccess);
                    }
                } else {
                    fnSuccess = function () {};
                }
                        
                //------------------------------------------------------------//
                // Check that the warning callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onWarning !== undefined && mSettings.onWarning !== null) {
                    fnWarning = mSettings.onWarning;

                    if (typeof fnWarning !== "function") {
                        fnAppendError("Warning callback function is not a valid function. Received a "+typeof fnWarning);
                    }
                } else {
                    fnWarning = function () {};
                }
                
                //------------------------------------------------------------//
                // Check that the failure callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                    fnFail = mSettings.onFail;
                    
                    if (typeof fnSuccess !== "function") {
                        fnAppendError("Failure callback function is not a valid function. Received a "+typeof fnFail);
                    }
                } else {
                    fnFail = function () {};
                }
                
                if (bError) {
                    throw new IllegalArgumentException(aErrorMessages.join('\n\n'));
                }
                
            } else {
                fnAppendError(sNoUserIDMessage);
                fnAppendError(sNoRoomIDMessage);
                
                throw new MissingSettingsMapException(aErrorMessages.join);
            }

            //----------------------------------------------------------------//
            // If an ID for a specific room was given, then find the permissions
            // for that room.
            //----------------------------------------------------------------//
            if (iRoomId != 0) {
                try {
                    //--------------------------------------------------------------------//
                    // Load and display the permissions for the currently selected user.
                    //--------------------------------------------------------------------//
                    IomyRe.apiphp.AjaxRequest({
                        url : sUrl,
                        data : {
                            "Mode" : "LookupRoomPerms",
                            "UserId" : iUserId,
                            "RoomId" : iRoomId
                        },

                        onSuccess : function (responseType, data) {
                            try {
                                if (data.Error === false) {
                                    var data = data.Data;
                                    var iLevel = self.getRoomPermissionLevel(data);

                                    fnSuccess(iLevel, data);
                                } else {
                                    fnFail(data.ErrMesg)
                                }
                            } catch (e) {
                                fnFail("Error in the success callback for fetching room permissons:\n" + e.name + ": " + e.message);
                            }
                        },

                        onFail : function (response) {
                            fnFail(response.responseText);
                        }

                    });
                } catch (e) {
                    fnAppendError("Error looking up the room permission level:\n" + e.name + ": " + e.message);
                }
            } else {
                try {
                    //----------------------------------------------------------------//
                    // We will need to lookup permissions for every room in a given
                    // premise.
                    //----------------------------------------------------------------//
                    var aPermissionLevels   = [];
                    var aRequests           = [];
                    var oRequestQueue       = null;

                    //----------------------------------------------------------------//
                    // Prepare each request.
                    //----------------------------------------------------------------//
                    $.each(IomyRe.common.RoomsList["_"+iPremiseId], function (sI, mRoom) {

                        aRequests.push({
                            library : "php",
                            url     : sUrl,
                            data    : {
                                "Mode" : "LookupRoomPerms",
                                "UserId" : iUserId,
                                "RoomId" : mRoom.RoomId
                            },

                            onSuccess : function (responseType, data) {
                                try {
                                    if (data.Error === false) {
                                        var data    = data.Data;
                                        var iLevel  = self.getRoomPermissionLevel(data);

                                        aPermissionLevels.push(iLevel);
                                    } else {
                                        aErrorMessages.push(data.ErrMesg);
                                    }
                                } catch (e) {
                                    aErrorMessages.push("Error processing the permission level of a room (ID: "+mRoom.RoomId+"):\n\n" + e.name + ": " + e.message);
                                }
                            },

                            onFail : function (response) {
                                aErrorMessages.push(response.responseText);
                            }

                        });
                    });

                    //----------------------------------------------------------------//
                    // Run the requests.
                    //----------------------------------------------------------------//
                    oRequestQueue = new AjaxRequestQueue({
                        requests            : aRequests,
                        concurrentRequests  : 2,

                        onSuccess : function () {
                            try {
                                var iLevel = self.getMostCommonPermissionForAllRooms(aPermissionLevels);

                                if (aErrorMessages.length > 0) {
                                    fnWarning(iLevel, aErrorMessages.join('\n\n'));
                                } else {
                                    fnSuccess(iLevel);
                                }
                            } catch (e) {
                                aErrorMessages.push("Error in the success callback of the request queue:\n" + e.name + ": " + e.message);
                                fnWarning(iLevel, aErrorMessages.join('\n\n'));
                            }
                        },

                        onWarning : function () {
                            var iLevel = self.getMostCommonPermissionForAllRooms(aPermissionLevels);

                            fnWarning(iLevel, aErrorMessages.join('\n\n'));
                        },

                        onFail : function () {
                            fnFail(aErrorMessages.join('\n\n'));
                        }
                    });
                } catch (e) {
                    fnAppendError("Error fetching the most common permissions for all rooms:\n" + e.name + ": " + e.message);
                }
            }
            
            //-- If there were any fatal errors, throw an exception. --//
            if (bError) {
                throw new iOmyException(aErrorMessages.join('\n\n'));
            }
        },

        updateRoomPermissions : function (mSettings) {
            var self                = this;               // REMEMBER: 'this' refers to IomyRe.functions.permissions. NOT IomyRe.functions!
            var bError              = false;
            var aErrorMessages      = [];
            var sUrl                = IomyRe.apiphp.APILocation("permissions");
            var iUserId             = null;
            var iRoomId             = null;
            var iPremiseId          = null;
            var iLevel;

            var fnSuccess;
            var fnWarning;
            var fnFail;
            
            //----------------------------------------------------------------//
            // Missing variable error messages.
            //----------------------------------------------------------------//
            var sNoUserIDMessage        = "User ID is required (userID).";
            var sNoRoomIDMessage        = "Room ID is required (roomID).";
            var sNoPremiseIDMessage     = "Premise ID is required (premiseID).";
            var sNoLevelMessage         = "Permissions level is required (level).";
            
            var fnAppendError = function (sErrorMessages) {
                bError = true;
                aErrorMessages.push(sErrorMessages);
                jQuery.sap.log.error(sErrorMessages);
            };
            
            //----------------------------------------------------------------//
            // Permission states.
            //----------------------------------------------------------------//
            var mPermissions;

            var tiRead;
            var tiDataRead;
            var tiWrite;
            var tiStateToggle;

            //----------------------------------------------------------------//
            // Process the settings map.
            //----------------------------------------------------------------//
            if (mSettings !== undefined && mSettings !== null) {

                //------------------------------------------------------------//
                // Find the User ID
                //------------------------------------------------------------//
                if (mSettings.userID !== undefined && mSettings.userID !== null) {
                    iUserId = mSettings.userID;
                } else {
                    fnAppendError(sNoUserIDMessage);
                }

                //------------------------------------------------------------//
                // Find and either validate the room ID or find the premise ID.
                //------------------------------------------------------------//
                if (mSettings.roomID !== undefined && mSettings.roomID !== null) {
                    iRoomId = mSettings.roomID;

                    //------------------------------------------------------------//
                    // If the ID is 0, we're finding out the permissions for all
                    // rooms. Make sure the premise is specified and is valid.
                    //------------------------------------------------------------//
                    if (iRoomId == 0) {
                        if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                            iPremiseId = mSettings.premiseID;

                            var mPremiseIDInfo = IomyRe.validation.isPremiseIDValid(iPremiseId);

                            if (!mPremiseIDInfo.bIsValid) {
                                aErrorMessages = aErrorMessages.concat(mPremiseIDInfo.aErrorMessages);
                            }
                        } else {
                            fnAppendError(sNoPremiseIDMessage);
                        }

                    } else {
                        //------------------------------------------------------------//
                        // Otherwise, validate the room ID.
                        //------------------------------------------------------------//
                        var mRoomIDInfo = IomyRe.validation.isRoomIDValid(iRoomId);

                        if (!mRoomIDInfo.bIsValid) {
                            aErrorMessages = aErrorMessages.concat(mRoomIDInfo.aErrorMessages);
                        }
                    }

                } else {
                    fnAppendError(sNoRoomIDMessage);
                }

                //------------------------------------------------------------//
                // Find the permission level
                //------------------------------------------------------------//
                if (mSettings.level !== undefined && mSettings.level !== null) {
                    iLevel = mSettings.level;
                } else {
                    fnAppendError(sNoLevelMessage);
                }

                //------------------------------------------------------------//
                // Check that the success callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                    fnSuccess = mSettings.onSuccess;

                    if (typeof fnSuccess !== "function") {
                        fnAppendError("Success callback function is not a valid function. Received a "+typeof fnSuccess);
                    }
                } else {
                    fnSuccess = function () {};
                }

                //------------------------------------------------------------//
                // Check that the warning callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onWarning !== undefined && mSettings.onWarning !== null) {
                    fnWarning = mSettings.onWarning;

                    if (typeof fnWarning !== "function") {
                        fnAppendError("Warning callback function is not a valid function. Received a "+typeof fnWarning);
                    }
                } else {
                    fnWarning = function () {};
                }

                //------------------------------------------------------------//
                // Check that the failure callback is provided. If so, make
                // sure that a function was given.
                //------------------------------------------------------------//
                if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                    fnFail = mSettings.onFail;

                    if (typeof fnSuccess !== "function") {
                        fnAppendError("Failure callback function is not a valid function. Received a "+typeof fnFail);
                    }
                } else {
                    fnFail = function () {};
                }

                if (bError) {
                    throw new IllegalArgumentException(aErrorMessages.join('\n\n'));
                }

            } else {
                fnAppendError(sNoUserIDMessage);
                fnAppendError(sNoRoomIDMessage);
                fnAppendError(sNoLevelMessage);

                throw new MissingSettingsMapException(aErrorMessages.join('\n\n'));
            }
            
            try {
                //----------------------------------------------------------------//
                // Fetch the permission status
                //----------------------------------------------------------------//
                mPermissions    = self.getIndividualRoomPermissionForALevel(iLevel);

                tiRead          = mPermissions.Read;
                tiDataRead      = mPermissions.DataRead;
                tiWrite         = mPermissions.Write;
                tiStateToggle   = mPermissions.StateToggle;

                if (iRoomId != 0) {
                    try {
                        IomyRe.apiphp.AjaxRequest({
                            url : sUrl,
                            data : {
                                "Mode" : "UpdateRoomPerms",
                                "UserId" : iUserId,
                                "RoomId" : iRoomId,
                                "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+"}"
                            },

                            onSuccess : function (responseType, data) {
                                try {
                                    if (data.Error !== true) {
                                        fnSuccess();
                                    } else {
                                        fnFail(data.ErrMesg);
                                    }
                                } catch (e) {
                                    fnFail("Error running success callback updating permissions for a single room:\n" + e.name + ": " + e.message);
                                }
                            },

                            onFail : function (response) {
                                fnFail(response.responseType);
                            }

                        });
                    } catch (e) {
                        fnAppendError("Error updating permissions for a single room:\n" + e.name + ": " + e.message);
                    }

                } else {
                    //----------------------------------------------------------------//
                    // We will need to lookup permissions for every room in a given
                    // premise.
                    //----------------------------------------------------------------//
                    var aRequests           = [];
                    var oRequestQueue       = null;

                    try {
                        $.each(IomyRe.common.RoomsList["_"+iPremiseId], function (sI, mRoom) {

                            aRequests.push({
                                library : "php",
                                url     : sUrl,
                                data    : {
                                    "Mode" : "UpdateRoomPerms",
                                    "UserId" : iUserId,
                                    "RoomId" : mRoom.RoomId,
                                    "Data" : "{\"Read\":"+tiRead+",\"DataRead\":"+tiDataRead+",\"Write\":"+tiWrite+",\"StateToggle\":"+tiStateToggle+"}"
                                },

                                onSuccess : function (responseType, data) {
                                    try {
                                        if (data.Error) {
                                            aErrorMessages.push(data.ErrMesg);
                                        }
                                    } catch (e) {
                                        aErrorMessages.push("Error running success callback updating permissions for a single room (ID: \""+mRoom.RoomId+"\"):\n" + e.name + ": " + e.message);
                                    }
                                },

                                onFail : function (response) {
                                    aErrorMessages.push(response.responseText);
                                }

                            });

                        });

                        //----------------------------------------------------------------//
                        // Run the requests.
                        //----------------------------------------------------------------//
                        oRequestQueue = new AjaxRequestQueue({
                            requests            : aRequests,
                            concurrentRequests  : 2,

                            onSuccess : function () {
                                try {
                                    if (aErrorMessages.length > 0) {
                                        fnWarning(aErrorMessages.join('\n\n'));
                                    } else {
                                        fnSuccess();
                                    }
                                } catch (e) {
                                    aErrorMessages.push("Error updating permissions for multiple rooms:\n\n" + e.name + ": " + e.message);
                                    fnWarning(iLevel, aErrorMessages.join('\n\n'));
                                }
                            },

                            onWarning : function () {
                                fnWarning(aErrorMessages.join('\n\n'));
                            },

                            onFail : function () {
                                fnFail(aErrorMessages.join('\n\n'));
                            }
                        });

                    } catch (e) {
                        fnAppendError("Error updating permissions for multiple rooms:\n" + e.name + ": " + e.message);
                    }
                }
            } catch (e) {
                fnAppendError("Error updating room permissions:\n" + e.name + ": " + e.message);
            }
            
            //-- If there were any fatal errors, throw an exception. --//
            if (bError) {
                throw new iOmyException(aErrorMessages.join('\n\n'));
            }
        }
        
    }
    
});
