<?php
//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>, 
//==      Brent Jarmaine <brenton@capsicumcorp.com>
//== @Description: This PHP API is used to draw a coloured pixel using either RGB or HSL values. This is
//      used for showing what colour a light bulb is currently showing.
//== @Copyright: Capsicum Corporation 2017
//== 
//== This file is part of Backend of the iOmy project.
//========================================================================================================//
//== iOmy is free software: you can redistribute it and/or modify it under the terms of the
//== GNU General Public License as published by the Free Software Foundation, either version 3 of the
//== License, or (at your option) any later version.
//== 
//== iOmy is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
//== without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//== See the GNU General Public License for more details.
//== 
//== You should have received a copy of the GNU General Public License along with iOmy.
//== If not, see <http://www.gnu.org/licenses/>.
//========================================================================================================//

// Based on the code found at https://www.xarg.org/2011/01/create-a-simple-and-small-gif-with-php/

//====================================================================//
//== 1.0 - INITIALISE                                               ==//
//====================================================================//

//------------------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE                   --//
//------------------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}

//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$aResult                    = array();      //-- ARRAY:         Used to store the results. --//
$iRed                       = 50;           //-- NUMBER:        Stores the Red value. --//
$iGreen                     = 255;          //-- NUMBER:        Stores the Green value. --//
$iBlue                      = 50;           //-- NUMBER:        Stores the Blue value. --//
$iHue                       = 0;            //-- NUMBER:        Stores the Hue value for processing. --//
$fSaturation                = 0;            //-- NUMBER:        Stores the Saturation value for processing. --//
$fLuminance                 = 0.5;          //-- NUMBER:        Stores the Luminance value for processing. --//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//

//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/http_post.php';

//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' )
	);
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
}


//----------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                  --//
//----------------------------------------------------//
if($bError===false) {
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "OpenThingThumbnail", "OpenLinkProfileThumbnail"  --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="RGB" && $sPostMode!=="HSL" ) {
			$bError    = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"RGB\" or \"HSL\" \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError    = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"RGB\" or \"HSL\" \n\n";
		//sErrMesg .= e0011.message;
	}
}

//====================================================================//
//== 4.0 - PREPARATION FOR MAIN SECTION                             ==//
//====================================================================//
if ( $bError === false ) {
    if ($sPostMode === "RGB") {
        //-- Red --//
        if( isset( $_GET['R'] )) {
            if (is_numeric($_GET['R'])) {
                $iRed = $_GET['R'];
                
                if ($iRed < 0 || $iRed > 255) {
                    $bError      = true;
                    $sErrMesg   .= "R value must be between 0 - 255.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "R value contains non-numeric characters. Should be between 0 - 255.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "R value must be specified. (0 - 255)\n";
        }

        //-- Green --//
        if( isset( $_GET['G'] )) {
            if (is_numeric($_GET['G'])) {
                $iGreen = $_GET['G'];
                
                if ($iGreen < 0 || $iGreen > 255) {
                    $bError      = true;
                    $sErrMesg   .= "G value must be between 0 - 255.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "G value contains non-numeric characters. Should be between 0 - 255.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "G value must be specified. (0 - 255)\n";
        }

        //-- Blue --//
        if( isset( $_GET['B'] )) {
            if (is_numeric($_GET['B'])) {
                $iBlue = $_GET['B'];
                
                if ($iBlue < 0 || $iBlue > 255) {
                    $bError      = true;
                    $sErrMesg   .= "B value must be between 0 - 255.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "B value contains non-numeric characters. Should be between 0 - 255.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "B value must be specified. (0 - 255)\n";
        }
        
    } else if ($sPostMode === "HSL") {
        $vFigureToCheck;
        
        //-- Hue --//
        if( isset( $_GET['H'] )) {
            if (is_numeric($_GET['H'])) {
                $vFigureToCheck = $_GET['H'];
                
                if ($vFigureToCheck < 0 || $vFigureToCheck > 360) {
                    $bError      = true;
                    $sErrMesg   .= "H value must be between 0 - 360.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "H value contains non-numeric characters. Should be between 0 - 360.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "H value must be specified. (0 - 360)\n";
        }

        //-- Saturation --//
        if( isset( $_GET['S'] )) {
            if (is_numeric($_GET['S'])) {
                $vFigureToCheck = $_GET['S'];
                
                if ($vFigureToCheck < 0 || $vFigureToCheck > 100) {
                    $bError      = true;
                    $sErrMesg   .= "S value must be between 0 - 100.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "S value contains non-numeric characters. Should be between 0 - 100.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "S value must be specified. (0 - 100)\n";
        }

        //-- Luminance --//
        if( isset( $_GET['L'] )) {
            if (is_numeric($_GET['L'])) {
                $vFigureToCheck = $_GET['L'];
                
                if ($vFigureToCheck < 0 || $vFigureToCheck > 100) {
                    $bError      = true;
                    $sErrMesg   .= "L value must be between 0 - 100.\n";
                }
                
            } else {
                $bError      = true;
                $sErrMesg   .= "L value contains non-numeric characters. Should be between 0 - 100.\n";
            }
        } else {
            $bError      = true;
            $sErrMesg   .= "L value must be specified. (0 - 100)\n";
        }
    }
}

//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: RGB                                            ==//
		//================================================================//
		if( $sPostMode==="RGB" ) {
			try {
				
                //-- Red --//
                if( isset( $_GET['R'] )) {
                    $iRed = $_GET['R'];
                } else {
                    $iRed = 50;
                }

                //-- Green --//
                if( isset( $_GET['G'] )) {
                    $iGreen = $_GET['G'];
                } else {
                    $iGreen = 255;
                }

                //-- Blue --//
                if( isset( $_GET['B'] )) {
                    $iBlue = $_GET['B'];
                } else {
                    $iBlue = 50;
                }
                
			} catch( Exception $e1400) {
				$bError = true;
				$sErrMesg .= "Error Code:'1400'\n";
				$sErrMesg .= "Problem processing colour values!\n";
				$sErrMesg .= $e1400->getMessage();
			}
        
		//================================================================//
		//== 5.2 - MODE: HSL                                            ==//
		//================================================================//
        } else if( $sPostMode==="HSL" ) {
			try {
				
                //-- Red --//
                if( isset( $_GET['H'] )) {
                    $iHue = $_GET['H'];
                } else {
                    $iHue = 0;
                }

                //-- Green --//
                if( isset( $_GET['S'] )) {
                    $fSaturation = $_GET['S'] / 100;
                } else {
                    $fSaturation = 0;
                }

                //-- Blue --//
                if( isset( $_GET['L'] )) {
                    $fLuminance = $_GET['L'] / 100;
                } else {
                    $fLuminance = 0.5;
                }
                
                //============================================================//
                // Find the RGB Values
                //============================================================//
                if ($fSaturation == 0) {
                    //--------------------------------------------------------//
                    // No saturation means it's grey so all the RGB values are
                    // the same.
                    //--------------------------------------------------------//
                    $iProduct = round($fLuminance * 255);
                    
                    $iRed   = $iProduct;
                    $iGreen = $iProduct;
                    $iBlue  = $iProduct;
                    
                } else {
                    //--------------------------------------------------------------------------------------//
                    // Functionality based on example found at http://hsl2rgb.nichabi.com/php-function.php
                    //--------------------------------------------------------------------------------------//
                    
                    //--------------------------------------------------------//
                    // Process the Hue for calculation
                    //--------------------------------------------------------//
                    $iHue /= 60;
                    if ($iHue < 0) {
                        $iHue = 6 - fmod(-$iHue, 6);
                    }
                    $iHue = fmod($iHue, 6);

                    //--------------------------------------------------------//
                    // Get the Chroma and the X value
                    //--------------------------------------------------------//
                    $fChroma = (1 - abs((2 * $fLuminance) - 1)) * $fSaturation;
                    $fX = $fChroma * (1 - abs(fmod($iHue, 2) - 1));

                    //--------------------------------------------------------//
                    // Find the points on the RGB cube.
                    //--------------------------------------------------------//
                    if ($iHue < 1) {
                        $iRed   = $fChroma;
                        $iGreen = $fX;
                        $iBlue  = 0;
                        
                    } elseif ($iHue < 2) {
                        $iRed   = $fX;
                        $iGreen = $fChroma;
                        $iBlue  = 0;
                        
                    } elseif ($iHue < 3) {
                        $iRed   = 0;
                        $iGreen = $fChroma;
                        $iBlue  = $fX;
                        
                    } elseif ($iHue < 4) {
                        $iRed   = 0;
                        $iGreen = $fX;
                        $iBlue  = $fChroma;
                        
                    } elseif ($iHue < 5) {
                        $iRed   = $fX;
                        $iGreen = 0;
                        $iBlue  = $fChroma;
                        
                    } else {
                        $iRed   = $fChroma;
                        $iGreen = 0;
                        $iBlue  = $fX;
                        
                    }

                    //--------------------------------------------------------//
                    // Find the individual RGB values to match brightness.
                    //--------------------------------------------------------//
                    $m      = $fLuminance - $fChroma / 2;
                    $iRed   = round(($iRed + $m) * 255);
                    $iGreen = round(($iGreen + $m) * 255);
                    $iBlue  = round(($iBlue + $m) * 255);
                }
                
			} catch( Exception $e1400) {
				$bError = true;
				$sErrMesg .= "Error Code:'1400'\n";
				$sErrMesg .= "Problem processing colour values!\n";
				$sErrMesg .= $e1400->getMessage();
			}
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Problem with the 'Mode' Parameters! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0402' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}


$t      = false;
$bDebug = false;

if ($t) {
    $sT = '21f90401000001002c00000000010001000002024c01003b';
} else {
    $sT = '2c00000000010001000002024c01003b';
}

if (isset($_GET["Debug"])) {
    if ($_GET["Debug"] == 1) {
        $bDebug = true;
    } else {
        $bDebug = false;
    }
}

if ($bError) {
    //-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json" --//
	header('Content-Type: text/plain');
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$sOutput = "Error Code:'0002'!\n No Result";
	
	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$sOutput  = "Error Code:'0003'!\n Critical Error has occured!\n Undefinable Error Message\n";
	
	} else if( $sErrMesg!=false ) {
		//-- Output the Error Message --//
		$sOutput  = $sErrMesg;
		
	} else {
		//-- Error Message is blank --//
		$sOutput  = "Error Code:'0004'!\n Critical Error has occured!";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!";
	}
    
} else {
    if ($bDebug) {
        echo "<pre>";
        var_dump($iRed);
        var_dump($iGreen);
        var_dump($iBlue);

        echo "</pre>";

    } else {

        header('Content-Type: image/png');
        header('Content-Length: ' . 8 * (4.375 + $t));
        echo pack( 'H32CCCH*', '47494638396101000100900100ffffff', $iRed, $iGreen, $iBlue, $sT );
    }
}

//-- The End --//
?>