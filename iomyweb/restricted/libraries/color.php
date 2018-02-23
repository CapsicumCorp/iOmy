<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: Colour conversion functions
//========================================================================================================//


//========================================================================================================================//
//== #2.0# - Color Conversion functions                                                                                 ==//
//========================================================================================================================//


//========================================================================//
//== #2.1# - RGB -> HSV Conversion                                      ==//
//========================================================================//
function Color_RGB_to_HSV( $fInputRed, $fInputGreen, $fInputBlue, $aOptions ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare variables                                        --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- 1.1 - Get the Input Values             --//
	//--------------------------------------------//
	if( isset( $aOptions['InputRGBMax'] ) ) {
		$fInputRedConvert   = $aOptions['InputRGBMax'];
		$fInputGreenConvert = $aOptions['InputRGBMax'];
		$fInputBlueConvert  = $aOptions['InputRGBMax'];
		
	} else if( isset($aOptions['InputRedMax']) && isset($aOptions['InputGreenMax']) && isset($aOptions['InputBlueMax']) ) {
		$fInputRedConvert   = $aOptions['InputRedMax'];
		$fInputGreenConvert = $aOptions['InputGreenMax'];
		$fInputBlueConvert  = $aOptions['InputBlueMax'];
		
	} else {
		$fInputRedConvert   = 255;
		$fInputGreenConvert = 255;
		$fInputBlueConvert  = 255;
	}
	
	//--------------------------------------------//
	//-- 1.2 - Get the Output values            --//
	//--------------------------------------------//
	if( isset( $aOptions['OutputHueMax'] ) ) {
		$fOutputHueConvert = $aOptions['OutputHueMax'];
	} else {
		$fOutputHueConvert = 255;
	}
	
	if( isset( $aOptions['OutputSatMax'] ) ) {
		$fOutputSatConvert = $aOptions['OutputSatMax'];
	} else {
		$fOutputSatConvert = 255;
	}
	
	if( isset( $aOptions['OutputValMax'] ) ) {
		$fOutputValConvert = $aOptions['OutputValMax'];
	} else {
		$fOutputValConvert = 255;
	}
	
	//-- Hue Rounding --//
	if( isset($aOptions['OutputHueRound']) ) {
		if( $aOptions['OutputHueRound']===true || $aOptions['OutputHueRound']==="true") {
			$bOutputHueRound = true;
		} else {
			$bOutputHueRound = false;
		}
	} else {
		$bOutputHueRound = true;
	}
	
	
	//-- Saturation Rounding --//
	if( isset($aOptions['OutputSatRound']) ) {
		if( $aOptions['OutputSatRound']===true || $aOptions['OutputSatRound']==="true") {
			$bOutputSatRound = true;
		} else {
			$bOutputSatRound = false;
		}
	} else {
		$bOutputSatRound = true;
	}
	
	//-- Val / Brightness Rounding --//
	if( isset($aOptions['OutputValRound']) ) {
		if( $aOptions['OutputValRound']===true || $aOptions['OutputValRound']==="true") {
			$bOutputValRound = true;
		} else {
			$bOutputValRound = false;
		}
	} else {
		$bOutputValRound = true;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 2.0 - Prepare variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 2.1 - Convert RGB to fraction --//
	if( $fInputRedConvert!==0 && $fInputGreenConvert!==0 && $fInputBlueConvert!==0 ) {
		$fFracRed   = $fInputRed / $fInputRedConvert;
		$fFracGreen = $fInputGreen / $fInputGreenConvert;
		$fFracBlue  = $fInputBlue / $fInputBlueConvert;
	} else {
		$fFracRed   = 0;
		$fFracGreen = 0;
		$fFracBlue  = 0;
	}
	
	//-- 2.2 - Calculate the Max, Min & Difference --//
	$fMax        = max( $fFracRed, $fFracGreen, $fFracBlue );
	$fMin        = min( $fFracRed, $fFracGreen, $fFracBlue );
	$fDifference = $fMax - $fMin;
	
	
	//--------------------------------------------------------------------//
	//-- 3.0 - Begin the Calculations                                   --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- 3.1 - Calculate the Val / Brightness   --//
	//--------------------------------------------//
	$fFracVal = $fMax;
		
	//--------------------------------------------//
	//-- 3.2 - Calculate the Saturation & Hue   --//
	//--------------------------------------------//
	
	//--------------------------------//
	//-- IF Greyscale               --//
	//--------------------------------//
	if( $fMax===$fMin ) {
		$fFracHue = 0;
		$fFracSat = 0;
		
	//--------------------------------//
	//-- ELSE Color                 --//
	//--------------------------------//
	} else {
		//------------------------------//
		//-- Calculate the Saturation --//
		$fFracSat = $fDifference / $fMax;
		
		//------------------------------//
		//-- Calculate the Hue        --//
		switch ( $fMax ) {
			//---------------//
			//-- RED       --//
			//---------------//
			case $fFracRed:
				if( $fFracGreen < $fFracBlue ) {
					$fHueTemp1 = ( ( $fFracGreen - $fFracBlue ) / $fDifference ) + 6;
				} else {
					$fHueTemp1 = ( ( $fFracGreen - $fFracBlue ) / $fDifference ) + 0;
				}
				break;
				
			//---------------//
			//-- GREEN     --//
			//---------------//
			case $fFracGreen:
				$fHueTemp1 = ( ( $fFracBlue - $fFracRed ) / $fDifference ) + 2;
				break;
				
			//---------------//
			//-- BLUE      --//
			//---------------//
			case $fFracBlue:
				$fHueTemp1 = ( ( $fFracBlue - $fFracRed ) / $fDifference ) + 4;
				break;
		}
		
		$fFracHue = $fHueTemp1 / 6;
	}
	
	//--------------------------------------------------------------------//
	//-- 8.0 - Prepare the Output                                       --//
	//--------------------------------------------------------------------//
	
	//------------------------------------//
	//-- Calculate the Hue Output       --//
	//------------------------------------//
	if( $fOutputHueConvert!==1 ) {
		$fOutputHue   = $fFracHue * $fOutputHueConvert;
		
		if( $bOutputHueRound===true ) {
			$fOutputHue = round( $fOutputHue );
		}
	} else {
		$fOutputHue = $fFracHue;
	}
	
	//------------------------------------//
	//-- Calculate the Sat Output       --//
	//------------------------------------//
	if( $fOutputSatConvert!==1 ) {
		$fOutputSat   = $fFracSat * $fOutputSatConvert;
		
		if( $bOutputSatRound===true ) {
			$fOutputSat = round( $fOutputSat );
		}
	} else {
		$fOutputSat = $fFracSat;
	}
	
	//------------------------------------//
	//-- Calculate the Val Output       --//
	//------------------------------------//
	if( $fOutputValConvert!==1 ) {
		$fOutputVal   = $fFracVal * $fOutputValConvert;
		
		if( $bOutputValRound===true ) {
			$fOutputVal = round( $fOutputVal );
		}
	} else {
		$fOutputVal = $fOutputFracVal;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Results                                       --//
	//--------------------------------------------------------------------//
	return array(
		"Error" => false,
		"Hue"   => $fOutputHue,
		"Sat"   => $fOutputSat,
		"Val"   => $fOutputVal
	);
}

//========================================================================//
//== #2.2# - HSV -> RGB Conversion                                      ==//
//========================================================================//
function Color_HSV_to_RGB( $fInputHue, $fInputSat, $fInputVal, $aOptions ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare variables                                        --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- Hue, Saturation & Value Max Values     --//
	//--------------------------------------------//
	if( isset( $aOptions['InputHueMax'] ) ) {
		$iHueConvert = $aOptions['InputHueMax'];
	} else {
		$iHueConvert = 255;
	}
	
	if( isset( $aOptions['InputSatMax'] ) ) {
		$iSatConvert = $aOptions['InputSatMax'];
	} else {
		$iSatConvert = 255;
	}
	
	if( isset( $aOptions['InputValMax'] ) ) {
		$iValConvert = $aOptions['InputValMax'];
	} else {
		$iValConvert = 255;
	}
	
	//--------------------------------------------//
	//-- RGB Max Values                         --//
	//--------------------------------------------//
	if( isset( $aOptions['OutputRGBMax'] ) ) {
		$fRedConvert   = $aOptions['OutputRGBMax'];
		$fGreenConvert = $aOptions['OutputRGBMax'];
		$fBlueConvert  = $aOptions['OutputRGBMax'];
		
	} else if( isset($aOptions['OutputRedMax']) && isset($aOptions['OutputGreenMax']) && isset($aOptions['OutputBlueMax']) ) {
		$fRedConvert   = $aOptions['OutputRedMax'];
		$fGreenConvert = $aOptions['OutputGreenMax'];
		$fBlueConvert  = $aOptions['OutputBlueMax'];
		
	} else {
		$fRedConvert   = 255;
		$fGreenConvert = 255;
		$fBlueConvert  = 255;
		
	}
	
	
	//--------------------------------------------//
	//-- Round off Output                       --//
	//--------------------------------------------//
	//-- Red Rounding --//
	if( isset($aOptions['OutputRedRound']) ) {
		if( $aOptions['OutputRedRound']===true || $aOptions['OutputRedRound']==="true") {
			$bRedOutputRound = true;
		} else {
			$bRedOutputRound = false;
		}
	} else {
		$bRedOutputRound = true;
	}
	
	//-- Green Rounding --//
	if( isset($aOptions['OutputGreenRound']) ) {
		if( $aOptions['OutputGreenRound']===true || $aOptions['OutputGreenRound']==="true") {
			$bGreenOutputRound = true;
		} else {
			$bGreenOutputRound = false;
		}
	} else {
		$bGreenOutputRound = true;
	}
	
	//-- Blue Rounding --//
	if( isset($aOptions['OutputBlueRound']) ) {
		if( $aOptions['OutputBlueRound']===true || $aOptions['OutputBlueRound']==="true") {
			$bBlueOutputRound = true;
		} else {
			$bBlueOutputRound = false;
		}
	} else {
		$bBlueOutputRound = true;
	}
	
	//--------------------------------------------------------------------//
	//-- 2.0 - Prepare variables                                        --//
	//--------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 2.1 - Convert RGB to fraction                  --//
	//----------------------------------------------------//
	if( $iHueConvert!==0 && $iSatConvert!==0 && $iValConvert!==0 ) {
		$fFracHue   = $fInputHue / $iHueConvert;
		$fFracSat   = $fInputSat / $iSatConvert;
		$fFracVal   = $fInputVal / $iValConvert;
	} else {
		$fFracHue   = 0;
		$fFracSat   = 0;
		$fFracVal   = 0;
	}
	
	//----------------------------------------------------//
	//-- 2.2 - Calculate the Hue Hexant location        --//
	//----------------------------------------------------//
	$iHueHexant = floor( $fFracHue * 6 );
	
	//--------------------------------------------------------------------//
	//-- 3.0 - Begin the Calculations                                   --//
	//--------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 3.1 - Chroma and X value                       --//
	//----------------------------------------------------//
	$fChroma = $fFracVal * $fFracSat;
	$fX      = $fChroma * ( 1 - abs( ($iHueHexant % 2) - 1 ) );
	$fM      = $fFracVal - $fChroma;
	
	//----------------------------------------------------//
	//-- 3.2 - Generate Hexant Values                   --//
	//----------------------------------------------------//
	switch( $iHueHexant ) {
		case 0:
			$fRedTemp   = $fChroma;
			$fGreenTemp = $fX;
			$fBlueTemp  = 0;
			break;
		case 1:
			$fRedTemp   = $fX;
			$fGreenTemp = $fChroma;
			$fBlueTemp  = 0;
			break;
		case 2:
			$fRedTemp   = 0;
			$fGreenTemp = $fChroma;
			$fBlueTemp  = $fX;
			break;
		case 3:
			$fRedTemp   = 0;
			$fGreenTemp = $fX;
			$fBlueTemp  = $fChroma;
			break;
		case 4:
			$fRedTemp   = $fX;
			$fGreenTemp = 0;
			$fBlueTemp  = $fChroma;
			break;
		default:
			$fRedTemp   = $fChroma;
			$fGreenTemp = 0;
			$fBlueTemp  = $fX;
	}
	
	//----------------------------------------------------//
	//-- 3.3 - Calculate the RGB Fractions              --//
	//----------------------------------------------------//
	$fFracRed     = $fRedTemp + $fM;
	$fFracGreen   = $fGreenTemp * $fM;
	$fFracBlue    = $fBlueTemp * $fM;
	
	
	//--------------------------------------------------------------------//
	//-- 8.0 - Prepare the Output                                       --//
	//--------------------------------------------------------------------//
	
	//------------------------------------//
	//-- Calculate the Red Output       --//
	//------------------------------------//
	if( $fRedConvert!==1 ) {
		$fRed   = $fFracRed * $fRedConvert;
		
		if( $bRedOutputRound===true ) {
			$fRed = round( $fRed );
		}
	} else {
		$fRed = $fFracRed;
	}
	
	//------------------------------------//
	//-- Calculate the Green Output     --//
	//------------------------------------//
	if( $fGreenConvert!==1 ) {
		$fGreen   = $fFracGreen * $fGreenConvert;
		
		if( $bGreenOutputRound===true ) {
			$fGreen = round( $fGreen );
		}
	} else {
		$fGreen = $fFracGreen;
	}
	
	//------------------------------------//
	//-- Calculate the Blue Output      --//
	//------------------------------------//
	if( $fBlueConvert!==1 ) {
		$fBlue   = $fFracBlue * $fBlueConvert;
		
		if( $bBlueOutputRound===true ) {
			$fBlue = round( $fBlue );
		}
	} else {
		$fBlue = $fFracBlue;
	}
	
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Results                                       --//
	//--------------------------------------------------------------------//
	return array(
		"Error" => false,
		"Red"   => $fRed,
		"Green" => $fGreen,
		"Blue"  => $fBlue
	);
}


function Color_RGB_to_HSL( $iRed, $iGreen, $iBlue, $aOptions ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare variables                                        --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- Get the RGB Max Values                 --//
	//--------------------------------------------//
	if( isset( $aOptions['RGBMax'] ) ) {
		$fRedConvert   = $aOptions['RGBMax'];
		$fGreenConvert = $aOptions['RGBMax'];
		$fBlueConvert  = $aOptions['RGBMax'];
		
	} else if( isset($aOptions['RedMax']) && isset($aOptions['GreenMax']) && isset($aOptions['BlueMax']) ) {
		$fRedConvert   = $aOptions['RedMax'];
		$fGreenConvert = $aOptions['GreenMax'];
		$fBlueConvert  = $aOptions['BlueMax'];
		
	} else {
		$fRedConvert   = 255;
		$fGreenConvert = 255;
		$fBlueConvert  = 255;
		
	}
	
	//--------------------------------------------//
	//-- Hue, Saturation & Light Max            --//
	//--------------------------------------------//
	if( isset( $aOptions['HueMax'] ) ) {
		$iHueConvert = $aOptions['HueMax'];
	} else {
		$iHueConvert = 255;
	}
	
	if( isset( $aOptions['SatMax'] ) ) {
		$iSatConvert = $aOptions['SatMax'];
	} else {
		$iSatConvert = 255;
	}
	
	if( isset( $aOptions['LightMax'] ) ) {
		$iLightConvert = $aOptions['LightMax'];
	} else {
		$iLightConvert = 255;
	}
	
	//--------------------------------------------//
	//-- Round off Output                       --//
	//--------------------------------------------//
	
	//-- Hue Rounding --//
	if( isset($aOptions['HueRound']) ) {
		if( $aOptions['HueRound']===true || $aOptions['HueRound']==="true") {
			$bHueOutputRound = true;
		} else {
			$bHueOutputRound = false;
		}
	} else {
		$bHueOutputRound = true;
	}
	
	
	//-- Saturation Rounding --//
	if( isset($aOptions['SatRound']) ) {
		if( $aOptions['SatRound']===true || $aOptions['SatRound']==="true") {
			$bSatOutputRound = true;
		} else {
			$bSatOutputRound = false;
		}
	} else {
		$bSatOutputRound = true;
	}
	
	//-- Light Rounding --//
	if( isset($aOptions['LightRound']) ) {
		if( $aOptions['LightRound']===true || $aOptions['LightRound']==="true") {
			$bLightOutputRound = true;
		} else {
			$bLightOutputRound = false;
		}
	} else {
		$bLightOutputRound = true;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 2.0 - Prepare variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 2.1 - Convert RGB to fraction --//
	if( $fRedConvert!==0 && $fGreenConvert!==0 && $fBlueConvert!==0 ) {
		$fFracRed   = $iRed / $fRedConvert;
		$fFracGreen = $iGreen / $fGreenConvert;
		$fFracBlue  = $iBlue / $fBlueConvert;
	} else {
		$fFracRed   = 0;
		$fFracGreen = 0;
		$fFracBlue  = 0;
	}
	
	//-- 2.2 - Calculate the Max, Min & Difference --//
	$fMax        = max( $fFracRed, $fFracGreen, $fFracBlue );
	$fMin        = min( $fFracRed, $fFracGreen, $fFracBlue );
	$fDifference = $fMax - $fMin;
	
	
	//--------------------------------------------------------------------//
	//-- 3.0 - Begin the Calculations                                   --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- 3.1 - Calculate the Luminance          --//
	//--------------------------------------------//
	$fFracLight = ( $fMin + $fMax ) / 2;
		
	//--------------------------------------------//
	//-- 3.2 - Calculate the Saturation & Hue   --//
	//--------------------------------------------//
	
	//--------------------------------//
	//-- IF Greyscale               --//
	//--------------------------------//
	if( $fMax===$fMin ) {
		$fFracHue = 0;
		$fFracSat = 0;
		
	
	//--------------------------------//
	//-- ELSE Color                 --//
	//--------------------------------//
	} else {
		//------------------------------//
		//-- Calculate the Saturation --//
		if( $fFracLight>0.5 ) {
			$fFracSat = $fDifference / ( (2 - $fMax) - $fMin );
			
		} else {
			$fFracSat = $fDifference / ( $fMax+$fMin );
		}
		
		//------------------------------//
		//-- Calculate the Hue        --//
		switch ( $fMax ) {
			//---------------//
			//-- RED       --//
			//---------------//
			case $fFracRed:
				if( $fFracGreen < $fFracBlue ) {
					$fHueTemp1 = ( ( $fFracGreen - $fFracBlue ) / $fDifference ) + 6;
				} else {
					$fHueTemp1 = ( ( $fFracGreen - $fFracBlue ) / $fDifference ) + 0;
				}
				break;
				
			//---------------//
			//-- GREEN     --//
			//---------------//
			case $fFracGreen:
				$fHueTemp1 = ( ( $fFracBlue - $fFracRed ) / $fDifference ) + 2;
				break;
				
			//---------------//
			//-- BLUE      --//
			//---------------//
			case $fFracBlue:
				$fHueTemp1 = ( ( $fFracBlue - $fFracRed ) / $fDifference ) + 4;
				break;
		}
		
		$fFracHue = $fHueTemp1 / 6;
	}
	
	//--------------------------------------------------------------------//
	//-- 8.0 - Prepare the Output                                       --//
	//--------------------------------------------------------------------//
	
	//------------------------------------//
	//-- Calculate the Hue Output       --//
	//------------------------------------//
	if( $iHueConvert!==1 ) {
		$fHue   = $fFracHue * $iHueConvert;
		
		if( $bHueOutputRound===true ) {
			$fHue = round( $fHue );
		}
	} else {
		$fHue = $fFracHue;
	}
	
	//------------------------------------//
	//-- Calculate the Sat Output       --//
	//------------------------------------//
	if( $iSatConvert!==1 ) {
		$fSat   = $fFracSat * $iSatConvert;
		
		if( $bSatOutputRound===true ) {
			$fSat = round( $fSat );
		}
	} else {
		$fSat = $fFracSat;
	}
	
	//------------------------------------//
	//-- Calculate the Light Output     --//
	//------------------------------------//
	if( $iLightConvert!==1 ) {
		$fLight   = $fFracLight * $iLightConvert;
		
		if( $bLightOutputRound===true ) {
			$fLight = round( $fLight );
		}
	} else {
		$fLight = $fFracLight;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Results                                       --//
	//--------------------------------------------------------------------//
	return array(
		"Error" => false,
		"Hue"   => $fHue,
		"Sat"   => $fSat,
		"Light" => $fLight
	);
	
}


function Color_HSL_to_RGB( $fHue, $fSat, $fLight, $aOptions ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare variables                                        --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- Hue, Saturation & Light Max Values     --//
	//--------------------------------------------//
	if( isset( $aOptions['HueMax'] ) ) {
		$iHueConvert = $aOptions['HueMax'];
	} else {
		$iHueConvert = 255;
	}
	
	if( isset( $aOptions['SatMax'] ) ) {
		$iSatConvert = $aOptions['SatMax'];
	} else {
		$iSatConvert = 255;
	}
	
	if( isset( $aOptions['LightMax'] ) ) {
		$iLightConvert = $aOptions['LightMax'];
	} else {
		$iLightConvert = 255;
	}
	
	//--------------------------------------------//
	//-- RGB Max Values                         --//
	//--------------------------------------------//
	if( isset( $aOptions['RGBMax'] ) ) {
		$fRedConvert   = $aOptions['RGBMax'];
		$fGreenConvert = $aOptions['RGBMax'];
		$fBlueConvert  = $aOptions['RGBMax'];
		
	} else if( isset($aOptions['RedMax']) && isset($aOptions['GreenMax']) && isset($aOptions['BlueMax']) ) {
		$fRedConvert   = $aOptions['RedMax'];
		$fGreenConvert = $aOptions['GreenMax'];
		$fBlueConvert  = $aOptions['BlueMax'];
		
	} else {
		$fRedConvert   = 255;
		$fGreenConvert = 255;
		$fBlueConvert  = 255;
		
	}
	
	
	//--------------------------------------------//
	//-- Round off Output                       --//
	//--------------------------------------------//
	//-- Red Rounding --//
	if( isset($aOptions['RedRound']) ) {
		if( $aOptions['RedRound']===true || $aOptions['RedRound']==="true") {
			$bRedOutputRound = true;
		} else {
			$bRedOutputRound = false;
		}
	} else {
		$bRedOutputRound = true;
	}
	
	
	//-- Green Rounding --//
	if( isset($aOptions['GreenRound']) ) {
		if( $aOptions['GreenRound']===true || $aOptions['GreenRound']==="true") {
			$bGreenOutputRound = true;
		} else {
			$bGreenOutputRound = false;
		}
	} else {
		$bGreenOutputRound = true;
	}
	
	//-- Blue Rounding --//
	if( isset($aOptions['BlueRound']) ) {
		if( $aOptions['BlueRound']===true || $aOptions['BlueRound']==="true") {
			$bBlueOutputRound = true;
		} else {
			$bBlueOutputRound = false;
		}
	} else {
		$bBlueOutputRound = true;
	}
	
	//--------------------------------------------------------------------//
	//-- 2.0 - Prepare variables                                        --//
	//--------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 2.1 - Convert RGB to fraction                  --//
	//----------------------------------------------------//
	if( $iHueConvert!==0 && $iSatConvert!==0 && $iLightConvert!==0 ) {
		$fFracHue   = $fHue / $iHueConvert;
		$fFracSat   = $fSat / $iSatConvert;
		$fFracLight = $fLight / $iLightConvert;
	} else {
		$fFracHue   = 0;
		$fFracSat   = 0;
		$fFracLight = 0;
	}
	
	//----------------------------------------------------//
	//-- 2.2 - Calculate the Hue Hexant location        --//
	//----------------------------------------------------//
	$iHueHexant = floor( $fFracHue * 6 );
	
	//--------------------------------------------------------------------//
	//-- 3.0 - Begin the Calculations                                   --//
	//--------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 3.1 - Chroma and X value                       --//
	//----------------------------------------------------//
	$fChroma = ( 1 - abs( ( 2 * $fFracLight ) - 1 ) ) * $fFracSat;
	$fX      = $fChroma * ( 1 - abs( ($iHueHexant % 2) - 1 ) );
	$fM      = $fFracLight - ( $fChroma / 2 );
	
	//----------------------------------------------------//
	//-- 3.2 - Generate Hexant Values                   --//
	//----------------------------------------------------//
	switch( $iHueHexant ) {
		case 0:
			$fRedTemp   = $fChroma;
			$fGreenTemp = $fX;
			$fBlueTemp  = 0;
			break;
		case 1:
			$fRedTemp   = $fX;
			$fGreenTemp = $fChroma;
			$fBlueTemp  = 0;
			break;
		case 2:
			$fRedTemp   = 0;
			$fGreenTemp = $fChroma;
			$fBlueTemp  = $fX;
			break;
		case 3:
			$fRedTemp   = 0;
			$fGreenTemp = $fX;
			$fBlueTemp  = $fChroma;
			break;
		case 4:
			$fRedTemp   = $fX;
			$fGreenTemp = 0;
			$fBlueTemp  = $fChroma;
			break;
		default:
			$fRedTemp   = $fChroma;
			$fGreenTemp = 0;
			$fBlueTemp  = $fX;
	}
	
	//----------------------------------------------------//
	//-- 3.3 - Calculate the RGB Fractions              --//
	//----------------------------------------------------//
	$fFracRed     = $fRedTemp * $fM;
	$fFracGreen   = $fGreenTemp * $fM;
	$fFracBlue    = $fBlueTemp * $fM;
	
	
	//--------------------------------------------------------------------//
	//-- 8.0 - Prepare the Output                                       --//
	//--------------------------------------------------------------------//
	
	//------------------------------------//
	//-- Calculate the Red Output       --//
	//------------------------------------//
	if( $fRedConvert!==1 ) {
		$fRed   = $fFracRed * $fRedConvert;
		
		if( $bRedOutputRound===true ) {
			$fRed = round( $fRed );
		}
	} else {
		$fRed = $fFracRed;
	}
	
	//------------------------------------//
	//-- Calculate the Green Output     --//
	//------------------------------------//
	if( $fGreenConvert!==1 ) {
		$fGreen   = $fFracGreen * $fGreenConvert;
		
		if( $bGreenOutputRound===true ) {
			$fGreen = round( $fGreen );
		}
	} else {
		$fGreen = $fFracGreen;
	}
	
	//------------------------------------//
	//-- Calculate the Blue Output      --//
	//------------------------------------//
	if( $fBlueConvert!==1 ) {
		$fBlue   = $fFracBlue * $fBlueConvert;
		
		if( $bBlueOutputRound===true ) {
			$fBlue = round( $fBlue );
		}
	} else {
		$fBlue = $fFracBlue;
	}
	
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Results                                       --//
	//--------------------------------------------------------------------//
	return array(
		"Error" => false,
		"Red"   => $fRed,
		"Green" => $fGreen,
		"Blue"  => $fBlue
	);
	
}




function Color_RGB_Rescale( $fInputRed, $fInputGreen, $fInputBlue, $aOptions ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare variables                                        --//
	//--------------------------------------------------------------------//
	
	//--------------------------------------------//
	//-- 1.1 - Get the Input Values             --//
	//--------------------------------------------//
	if( isset( $aOptions['InputRGBMax'] ) ) {
		$fInputRedConvert   = $aOptions['InputRGBMax'];
		$fInputGreenConvert = $aOptions['InputRGBMax'];
		$fInputBlueConvert  = $aOptions['InputRGBMax'];
		
	} else if( isset($aOptions['InputRedMax']) && isset($aOptions['InputGreenMax']) && isset($aOptions['InputBlueMax']) ) {
		$fInputRedConvert   = $aOptions['InputRedMax'];
		$fInputGreenConvert = $aOptions['InputGreenMax'];
		$fInputBlueConvert  = $aOptions['InputBlueMax'];
		
	} else {
		$fInputRedConvert   = 255;
		$fInputGreenConvert = 255;
		$fInputBlueConvert  = 255;
		
	}
	
	//--------------------------------------------//
	//-- 1.2 - Get the Output Values            --//
	//--------------------------------------------//
	
	//-- Convert Values --//
	if( isset( $aOptions['OutputRGBMax'] ) ) {
		$fOutputRedConvert   = $aOptions['OutputRGBMax'];
		$fOutputGreenConvert = $aOptions['OutputRGBMax'];
		$fOutputBlueConvert  = $aOptions['OutputRGBMax'];
		
	} else if( isset($aOptions['OutputRedMax']) && isset($aOptions['OutputGreenMax']) && isset($aOptions['OutputBlueMax']) ) {
		$fOutputRedConvert   = $aOptions['OutputRedMax'];
		$fOutputGreenConvert = $aOptions['OutputGreenMax'];
		$fOutputBlueConvert  = $aOptions['OutputBlueMax'];
		
	} else {
		$fOutputRedConvert   = 255;
		$fOutputGreenConvert = 255;
		$fOutputBlueConvert  = 255;
		
	}
	
	//-- Red Rounding --//
	if( isset($aOptions['OutputRedRound']) ) {
		if( $aOptions['OutputRedRound']===true || $aOptions['OutputRedRound']==="true") {
			$bOutputRedRound = true;
		} else {
			$bOutputRedRound = false;
		}
	} else {
		$bOutputRedRound = true;
	}
	
	
	//-- Green Rounding --//
	if( isset($aOptions['OutputGreenRound']) ) {
		if( $aOptions['OutputGreenRound']===true || $aOptions['OutputGreenRound']==="true") {
			$bOutputGreenRound = true;
		} else {
			$bOutputGreenRound = false;
		}
	} else {
		$bOutputGreenRound = true;
	}
	
	//-- Blue Rounding --//
	if( isset($aOptions['OutputBlueRound']) ) {
		if( $aOptions['OutputBlueRound']===true || $aOptions['OutputBlueRound']==="true") {
			$bOutputBlueRound = true;
		} else {
			$bOutputBlueRound = false;
		}
	} else {
		$bOutputBlueRound = true;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 2.0 - Prepare variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 2.1 - Convert RGB to fraction --//
	if( $fInputRedConvert!==0 && $fInputGreenConvert!==0 && $fInputBlueConvert!==0 ) {
		$fFracRed   = $fInputRed / $fInputRedConvert;
		$fFracGreen = $fInputGreen / $fInputGreenConvert;
		$fFracBlue  = $fInputBlue / $fInputBlueConvert;
	} else {
		$fFracRed   = 0;
		$fFracGreen = 0;
		$fFracBlue  = 0;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 8.0 - Prepare the Output                                       --//
	//--------------------------------------------------------------------//
	
	//------------------------------------//
	//-- Calculate the Red Output       --//
	//------------------------------------//
	if( $fOutputRedConvert!==1 ) {
		$fOutputRed   = $fFracRed * $fOutputRedConvert;
		
		if( $bOutputRedRound===true ) {
			$fOutputRed = round( $fOutputRed );
		}
	} else {
		$fOutputRed = $fFracRed;
	}
	
	//------------------------------------//
	//-- Calculate the Green Output     --//
	//------------------------------------//
	if( $fOutputGreenConvert!==1 ) {
		$fOutputGreen   = $fFracGreen * $fOutputGreenConvert;
		
		if( $bOutputGreenRound===true ) {
			$fOutputGreen = round( $fOutputGreen );
		}
	} else {
		$fOutputGreen = $fFracGreen;
	}
	
	//------------------------------------//
	//-- Calculate the Blue Output      --//
	//------------------------------------//
	if( $fOutputBlueConvert!==1 ) {
		$fOutputBlue   = $fFracBlue * $fOutputBlueConvert;
		
		if( $bOutputBlueRound===true ) {
			$fOutputBlue = round( $fOutputBlue );
		}
	} else {
		$fOutputBlue = $fFracBlue;
	}
	
	
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Results                                       --//
	//--------------------------------------------------------------------//
	return array(
		"Error" => false,
		"Red"   => $fOutputRed,
		"Green" => $fOutputGreen,
		"Blue"  => $fOutputBlue
	);
}



?>