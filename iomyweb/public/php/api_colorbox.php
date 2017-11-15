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
$iRed                       = 50;
$iGreen                     = 255;
$iBlue                      = 50;
$iHue                       = 0;
$iSaturation                = 0;
$iLuminace                  = 50;

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
                if( isset( $_GET['R'] )) {
                    $iHue = $_GET['R'];
                } else {
                    $iHue = 50;
                }

                //-- Green --//
                if( isset( $_GET['G'] )) {
                    $iSaturation = $_GET['G'] / 100;
                } else {
                    $iSaturation = 255;
                }

                //-- Blue --//
                if( isset( $_GET['B'] )) {
                    $iLuminace = $_GET['B'] / 100;
                } else {
                    $iLuminace = 50;
                }
                
                //============================================================//
                // Calculate the RGB Values
                //============================================================//
                if ($iHue === 0 && $iSaturation === 0) {
                    $iRed   = $iLuminace * 255;
                    $iGreen = $iLuminace * 255;
                    $iBlue  = $iLuminace * 255;
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


if ($t) {
    $sT = '21f90401000001002c00000000010001000002024c01003b';
} else {
    $sT = '2c00000000010001000002024c01003b';
}

header('Content-Type: image/gif');
header('Content-Length: ' . 8 * (4.375 + $t));
echo pack( 'H32CCCH*', '47494638396101000100900100ffffff', $iRed, $iGreen, $iBlue, $sT );
?>