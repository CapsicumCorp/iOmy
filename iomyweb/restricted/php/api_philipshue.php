<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used for features of "Philips hue" devices.
//== @Copyright: Capsicum Corporation 2016
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


//====================================================================//
//== 1.0 - INITIALISE                                               ==//
//====================================================================//

//----------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE           --//
//----------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//
$sPostNetworkAddress        = "";           //-- STRING:        Used to store the "DeviceNetworkAddress" that is passed as a HTTP POST variable.		--//
$sPostToken                 = "";           //-- STRING:        Used to store the "Philips Hue Bridge" "User Token" that is used for authentication.	--//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//
$aSensorList                = array();      //-- ARRAY:         Used to store the 
$aTempFunctionResult1       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult2       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult3       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult4       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult5       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//

$iPostHubId                 = 0;            //-- INTEGER:       This is used to store which HubId that the new Bridge should be added to. --//
$iPostLinkId                = 0;            //-- INTEGER:       This is used to store which "Philips Hue Bridge" to connect to --//
$iPostThingId               = 0;            //-- INTEGER:       This is used to store which "Philips Hue Light" that the user wants to change. --//
$iPostRoomId                = 0;            //-- INTEGER:       This is used to store which room the "Philips Hue Bridge" gets added to --//
$iLinkId                    = 0;            //-- INTEGER:       Used to hold the Link Id of the newly created Philips Hue Bridge in the database --//
$iThingTypeId               = 0;            //-- INTEGER:       Stores the ThingTypeId to verify if they are --//

$iPostRed                   = 0;            //-- INTEGER:       --//
$iPostGreen                 = 0;            //-- INTEGER:       --//
$iPostBlue                  = 0;            //-- INTEGER:       --//
$iRedIOId                   = 0;            //-- INTEGER:       --//
$iGreenIOId                 = 0;            //-- INTEGER:       --//
$iBlueIOId                  = 0;            //-- INTEGER:       --//

$iPostHue                   = 0;            //-- INTEGER:       --//
$iPostSaturation            = 0;            //-- INTEGER:       --//
$iPostBrightness            = 0;            //-- INTEGER:       --//
$iHueIOId                   = 0;            //-- INTEGER:       --//
$iSaturationIOId            = 0;            //-- INTEGER:       --//
$iBrightnessIOId            = 0;            //-- INTEGER:       --//
$sNetworkAddress            = "";           //-- STRING:        --//
$iNetworkPort               = 0;            //-- INTEGER:       --//
$sUserToken                 = "";           //-- STRING:        --//
$iHWId                      = 0;            //-- INTEGER:       --//
$sLightId                   = "";           //-- STRING:        Used to store the --//
$bUsePHPObject              = false;        //-- BOOLEAN:       --//
$iUTS                       = 0;            //-- INTEGER:       --//
$aThingList                 = array();      //-- ARRAY:         Used to hold the list of things.  --//
$aInsertThing               = array();      //-- ARRAY:         Used to hold the results of the function that inserts a new Light if a new one is detected. --//
$aThingData                 = array();      //-- ARRAY:         Used to hold the data that gets passed to the function so that it can insert a light if a new one is detected. --//
$aHubData                   = array();      //-- ARRAY:         --//
$aNewCommData               = array();      //-- ARRAY:         --//
$bTransactionStarted        = false;        //-- BOOLEAN:       --//
$bFound                     = false;        //-- BOOLEAN:       Used to indicate if a match is found or not --//
$iWritePerm                 = 0;            //-- INTEGER:       Used for storing the write permission of a Thing --//

//- Constants that need to be added to a function in the fuctions library --//
$iHueThingTypeId            = 0;            //-- INTEGER:       This is used to hold the "ThingTypeId" of a Philips Hue Light.     --//
$iDemoCommTypeId            = 0;            //-- INTEGER:       Used to store the "Comm Type Id" of the "Demo Comm Type".          --//
$iAPICommTypeId             = 0;            //-- INTEGER:       Used to store the "Comm Type Id" of the "PHP API Comm Type".       --//
$iHueRSTypeId               = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Hue Controls".        --//
$iSaturationRSTypeId        = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Saturation Controls". --//
$iBrightnessRSTypeId        = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Brightness Controls". --//



//----------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//
require_once SITE_BASE.'/restricted/libraries/philipshue.php';
require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';
require_once SITE_BASE.'/restricted/libraries/color.php';


//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iDemoCommTypeId         = LookupFunctionConstant("DemoCommTypeId");
$iAPICommTypeId          = LookupFunctionConstant("APICommTypeId");
$iHueThingTypeId         = LookupFunctionConstant("HueThingTypeId");
$iHueRSTypeId            = LookupFunctionConstant("LightHueRSTypeId");
$iSaturationRSTypeId     = LookupFunctionConstant("LightSaturationRSTypeId");
$iBrightnessRSTypeId     = LookupFunctionConstant("LightBrightnessRSTypeId");

$iRedRSTypeId            = LookupFunctionConstant("LightRedRSTypeId");
$iGreenRSTypeId          = LookupFunctionConstant("LightGreenRSTypeId");
$iBlueRSTypeId           = LookupFunctionConstant("LightBlueRSTypeId");

//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'DeviceNetworkAddress',      "DataType"=>'STR' ),
		array( "Name"=>'DevicePort',                "DataType"=>'INT' ),
		array( "Name"=>'DeviceUserToken',           "DataType"=>'STR' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' ),
		array( "Name"=>'RoomId',                    "DataType"=>'INT' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' ),
		array( "Name"=>'Data',                      "DataType"=>'STR' ),
		array( "Name"=>'DisplayName',               "DataType"=>'STR' )
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
		//-- NOTE: Valid modes are going to be "AddNewBridge", "ChangeHueSatLig", "Test" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="AddNewBridge" && $sPostMode!=="ChangeColorHSL" && $sPostMode!=="ChangeColorHSV" && $sPostMode!=="ChangeColorHSB" && $sPostMode!=="ChangeColorRGB" ) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddNewBridge\", \"ChangeColorHSL\" or \"ChangeColorRGB\"  \n\n";
		}
		
		//-- Set the Mode Aliases to the real modes --//
		if( $sPostMode==="ChangeColorHSB" ) {
			$sPostMode="ChangeColorHSV";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddNewBridge\", \"ChangeColorHSL\" or \"ChangeColorRGB\"  \n\n";
		//sErrMesg .= e0102.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2.A - Retrieve "DeviceNetworkAddress"      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "DeviceIPAddress" --//
				$sPostNetworkAddress = $aHTTPData["DeviceNetworkAddress"];
				
				if( $sPostNetworkAddress===false ) {
					$bError = true;
					$iErrCode  = 11;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"DeviceNetworkAddress\" parameter! \n";
					$sErrMesg .= "Please use a valid \"DeviceNetworkAddress\" parameter\n";
					$sErrMesg .= "eg. \n \"10.1.1.42\", \"10.1.1.24\", \"10.1.1.30\" \n\n";
					
				} else {
					//-- Convert IPAddress --//
					$iLongIPAddress = ip2long( $sPostNetworkAddress );
					
					if( !($iLongIPAddress>0) ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0103' \n";
						$sErrMesg .= "Invalid \"DeviceNetworkAddress\" parameter! \n";
						$sErrMesg .= "Please use a valid \"DeviceNetworkAddress\" parameter\n";
						$sErrMesg .= "eg. \n \"10.1.1.42\", \"10.1.1.24\", \"10.1.1.30\" \n\n";
					}
				}
			} catch( Exception $e0105 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"DeviceNetworkAddress\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DeviceNetworkAddress\" parameter\n";
				$sErrMesg .= "eg. \n \"10.1.1.42\", \"10.1.1.24\", \"10.1.1.30\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve "DevicePort"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "DevicePort" --//
				$iPostDevicePort = $aHTTPData["DevicePort"];
				
				if( $iPostDevicePort===false ) {
					$iPostDevicePort = 8000;
				}
				
			} catch( Exception $e0015 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"DevicePort\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DevicePort\" parameter\n";
				$sErrMesg .= "eg. \n 8000 \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.4.A - Retrieve "DeviceUserToken"           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "DeviceUserToken" --//
				$sPostToken = $aHTTPData["DeviceUserToken"];
				
				if( $sPostToken===false ) {
					$sPostToken = "admin";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"DeviceUserToken\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DeviceUserToken\" parameter\n";
				$sErrMesg .= "eg. \n \"admin\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.5.A - Retrieve "HubId"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false || !($iPostHubId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Invalid \"HubId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0017 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"HubId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5.B - Retrieve "ThingId"                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" || $sPostMode==="ChangeColorRGB" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0111' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0017 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.13.? - Retrieve Room Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "RoomId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false || !($iPostRoomId>=1) ) {
					//-- Use default if none is specified --//
					$iPostRoomId = -1;
				}
				
			} catch( Exception $e0128 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0128' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.14.? - Retrieve "CameraName"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "CameraName" --//
				$sPostDisplayName = $aHTTPData["DisplayName"];
				
				if( $sPostDisplayName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'029' \n";
					$sErrMesg .= "Invalid \"DisplayName\" parameter! \n";
					$sErrMesg .= "Please use a valid \"DisplayName\" parameter\n";
					$sErrMesg .= "eg. \n \"Philips Hue Bridge\" \n\n";
				}
				
			} catch( Exception $e0130 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0130' \n";
				$sErrMesg .= "Incorrect \"DisplayName\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DisplayName\" parameter\n";
				$sErrMesg .= "eg. \n \"Philips Hue Bridge\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.? - Retrieve "Data"                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( 
			$sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" ||
			$sPostMode==="ChangeColorRGB" 
		) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
					//------------------------------------------------//
					//-- JSON Parsing                               --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 145;
						$sErrMesg .= "Error Code:'0145' \n";
						$sErrMesg .= "Invalid POST \"Data\"! \n";
						$sErrMesg .= "Couldn't extract JSON values from the \"Data\" parameter \n";
					}
				} else {
					$bError    = true;
					$iErrCode  = 145;
					$sErrMesg .= "Error Code:'0145' \n";
					$sErrMesg .= "Invalid POST \"Data\" parameter! \n";
					$sErrMesg .= "Please use a valid data in the \"Data\" parameter \n";
				}
			} catch( Exception $e0146 ) {
				$bError    = true;
				$sErrMesg .= "Error Code:'0146' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter.";
			}
		}
	}
}


//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//----------------------------------------------------------------//
				//-- STEP 1 - Lookup details for the Hub                        --//
				//----------------------------------------------------------------//
				$aHubData = HubRetrieveInfoAndPermission( $iPostHubId );
				
				if( $aHubData['Error']===true ) {
					$bError = true;
					$iErrCode  = 1202;
					$sErrMesg .= "Error Code:'1202' \n";
					$sErrMesg .= "Problem looking up the data for the selected Hub\n";
					$sErrMesg .= $aHubData['ErrMesg'];
					
				} else {
					//-- Extract the Premise Id --//
					$iPremiseId = $aHubData['Data']['PremiseId'];
					
					//----------------------------------------------------------------//
					//-- STEP 2 - Validate the Room with desired Hub                --//
					//----------------------------------------------------------------//
					$aRoomValidate = ValidateRoomAccess( $iPostRoomId, $iPremiseId );
					
					if( $aRoomValidate['Error']===true ) {
						$bError    = true;
						$sErrMesg .= "Error Code:'1203' \n";
						$sErrMesg .= $aRoomValidate['ErrMesg'];
						
					} else {
						//----------------------------------------------------------------//
						//-- STEP 3 - Lookup Room details                               --//
						//----------------------------------------------------------------//
						$aRoomInfo = GetRoomInfoFromRoomId( $iPostRoomId );
						
						if( $aRoomInfo['Error']===true ) {
							$bError    = true;
							$sErrMesg .= "Error Code:'1204' \n";
							$sErrMesg .= "Problem looking up Room! \n";
							$sErrMesg .= $aRoomInfo['ErrMesg'];
							
						} else {
							//----------------------------------------------------------------//
							//-- STEP 4 - Check if a "PHP API" Comm is setup on the Hub     --//
							//----------------------------------------------------------------//
							$aTempFunctionResult1 = GetCommsFromHubId( $iPostHubId );
							
							if( $aTempFunctionResult1['Error']===false ) {
								//-- FOREACH Comm found --//
								foreach( $aTempFunctionResult1['Data'] as $aComm ) {
									//-- If no errors and no matches found --//
									if( $bError===false && $bFound===false ) {
										//-- Perform the check to see if CommType matches --//
										if( $aComm['CommTypeId']===$iAPICommTypeId ) {
											//-- Match found --//
											$bFound  = true;
											$iCommId = $aComm['CommId'];
										}
									}
								} //-- ENDFOREACH Comm --//
							} else {
								//-- ELSE No Comms are found --//
								$bFound = false;
								
								//------------------------------------------------------------//
								//-- If no Comm is setup then check Hub Write Permission    --//
								//------------------------------------------------------------//
								if( $aHubData['Data']['PermWrite']===0 ) {
									$bError = true;
									$iErrCode  = 1205;
									$sErrMesg .= "Error Code:'1205' \n";
									$sErrMesg .= "Permission issue detected!\n";
									$sErrMesg .= "The User doesn't appear to have the \"Write\" permission for that Hub\n";
								}
							}
						}
					}
				}
			} catch( Exception $e1201 ) {
				$bError = true;
				$iErrCode  = 1201;
				$sErrMesg .= "Error Code:'1201' \n";
				$sErrMesg .= "Critical Error Occurred!\n";
				$sErrMesg .= "Problem occurred when preparing for the main function\n";
			}
			
		//--------------------------------------------------------//
		//-- 4.1.B ELSEIF One of the change color modes         --//
		//--------------------------------------------------------//
		} else if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" || $sPostMode==="ChangeColorRGB" ) {
			//------------------------------------------------------------//
			//-- STEP 1: Extract the values from JSON Array             --//
			//------------------------------------------------------------//
			if( $bError===false ) {
				//----------------------------------------//
				//-- (Optional) HUE MAX                 --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['HMax'] ) && is_numeric( $aPostData['HMax'] ) ) {
						$fColorHueMax = floatval( $aPostData['HMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: HUE MAX           --//
						$fColorHueMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) HUE                     --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['H'] ) && is_numeric( $aPostData['H'] ) ) {
						//-- Verify the Hue value --//
						$fColorHue = floatval( $aPostData['H'] );
						
						if( $fColorHue<0 || $fColorHue>$fColorHueMax ) {
							//-- ERROR: Hue is outside of boundries --//
							$bError = true;
							$iErrCode   = 3301;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"H\" value (Hue) exceeds one of the allowed min/max limits. \n";
						}
						
					} else {
						//-- ERROR: Missing value --//
						$bError = true;
						$iErrCode   = 3302;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"H\" value (Hue). \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) SATURATION MAX          --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['SatMax'] ) && is_numeric( $aPostData['SatMax'] ) ) {
						$fColorSatMax = floatval( $aPostData['SatMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: SATURATION MAX    --//
						$fColorSatMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) SATURATION              --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['S'] ) && is_numeric( $aPostData['S'] ) ) {
						//-- Verify the Sat value --//
						$fColorSat = floatval( $aPostData['S'] );
						
						if( $fColorSat<0 || $fColorSat>$fColorSatMax ) {
							//-- ERROR: Sat is outside of boundries --//
							$bError = true;
							$iErrCode   = 3303;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"S\" value (Saturation) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3304;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"S\" value (Saturation). \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) LIGHT MAX               --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL"  ) {
					if( isset( $aPostData['LightMax'] ) && is_numeric( $aPostData['LightMax'] ) ) {
						$fColorLightMax = floatval( $aPostData['LightMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: LIGHT MAX         --//
						$fColorLightMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) LIGHT                   --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSL" ) {
					if( isset( $aPostData['L'] ) && is_numeric( $aPostData['L'] ) ) {
						//-- Verify the Light value --//
						$fColorLight = floatval( $aPostData['L'] );
						
						if( $fColorLight<0 || $fColorLight>$fColorLightMax ) {
							//-- ERROR: Light is outside of boundries --//
							$bError = true;
							$iErrCode   = 3305;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"L\" value (Light) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3306;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"L\" value (Light) value. \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) BRIGHTNESS MAX          --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['BMax'] ) && is_numeric( $aPostData['BMax'] ) ) {
						$fColorBrightnessMax = floatval( $aPostData['BMax'] );
						
					} else if( $aPostData['VMax'] && is_numeric( $aPostData['VMax'] ) ) {
						$fColorBrightnessMax = floatval( $aPostData['VMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: BRIGHTNESS MAX    --//
						$fColorBrightnessMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) BRIGHTNESS              --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorHSV" ) {
					if( isset( $aPostData['B'] ) && is_numeric( $aPostData['B'] ) ) {
						//-- Verify the Brightness value --//
						$fColorBrightness = floatval( $aPostData['B'] );
						
						if( $fColorBrightness<0 || $fColorBrightness>$fColorBrightnessMax ) {
							//-- ERROR: Brightness is outside of boundries --//
							$bError = true;
							$iErrCode   = 3307;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"B\" value (Brightness) exceeds one of the allowed min/max limits. \n";
						}
					} else if( isset( $aPostData['V'] ) && is_numeric( $aPostData['V'] ) ) {
						//-- Verify the Brightness value --//
						$fColorBrightness = floatval( $aPostData['V'] );
						
						if( $fColorBrightness<0 || $fColorBrightness>$fColorBrightnessMax ) {
							//-- ERROR: Brightness is outside of boundries --//
							$bError = true;
							$iErrCode   = 3308;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"V\" value (Brightness) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3308;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"B\" value (Brightness). \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) RED MAX                 --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB"  ) {
					if( isset( $aPostData['RMax'] ) && is_numeric( $aPostData['RMax'] ) ) {
						$fColorRedMax = floatval( $aPostData['RMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: RED MAX           --//
						$fColorRedMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) RED                     --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB" ) {
					if( isset( $aPostData['R'] ) && is_numeric( $aPostData['R'] ) ) {
						//-- Verify the Red value --//
						$fColorRed = floatval( $aPostData['R'] );
						
						if( $fColorRed<0 || $fColorRed>$fColorRedMax ) {
							//-- ERROR: Red is outside of boundries --//
							$bError = true;
							$iErrCode   = 3309;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"R\" value (Red) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3310;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"R\" value (Red). \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) GREEN MAX               --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB"  ) {
					if( isset( $aPostData['GMax'] ) && is_numeric( $aPostData['GMax'] ) ) {
						$fColorGreenMax = floatval( $aPostData['GMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: GREEN MAX         --//
						$fColorGreenMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) GREEN                   --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB" ) {
					if( isset( $aPostData['G'] ) && is_numeric( $aPostData['G'] ) ) {
						//-- Verify the Green value --//
						$fColorGreen = floatval( $aPostData['G'] );
						
						if( $fColorGreen<0 || $fColorGreen>$fColorGreenMax ) {
							//-- ERROR: Green is outside of boundries --//
							$bError = true;
							$iErrCode   = 3311;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"G\" value (Green) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3312;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"G\" value (Green). \n";
					}
				}
				
				//----------------------------------------//
				//-- (Optional) BLUE MAX                --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB"  ) {
					if( isset( $aPostData['BMax'] ) && is_numeric( $aPostData['BMax'] ) ) {
						$fColorBlueMax = floatval( $aPostData['BMax'] );
						
					} else {
						//--------------------------------//
						//-- DEFAULT: BLUE MAX          --//
						$fColorBlueMax = 360;
					}
				}
				
				//----------------------------------------//
				//-- (Required) BLUE                    --//
				//----------------------------------------//
				if( $sPostMode==="ChangeColorRGB" ) {
					if( isset( $aPostData['B'] ) && is_numeric( $aPostData['B'] ) ) {
						//-- Verify the Blue value --//
						$fColorBlue = floatval( $aPostData['B'] );
						
						if( $fColorBlue<0 || $fColorBlue>$fColorBlueMax ) {
							//-- ERROR: Blue is outside of boundries --//
							$bError = true;
							$iErrCode   = 3313;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
							$sErrMesg  .= "The \"B\" value (Blue) exceeds one of the allowed min/max limits. \n";
						}
					} else {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3314;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when extracting values from the \"Data\" JSON parameter!\n";
						$sErrMesg  .= "Can't find the \"B\" value (Blue). \n";
					}
				}
				
				
				
			}
			
			//------------------------------------------------------------//
			//-- STEP 2: Lookup the details on that particular "Thing"  --//
			//------------------------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult1 = GetThingInfo( $iPostThingId );
				
				
				if( $aTempFunctionResult1['Error']===false ) {
					$iThingTypeId   = $aTempFunctionResult1['Data']['ThingTypeId'];
					$iLinkId        = $aTempFunctionResult1['Data']['LinkId'];
					$iWritePerm     = $aTempFunctionResult1['Data']['PermWrite'];
					
					//-- Display an error if the Thing Type is not a Philips Hue --//
					//-- TODO: Add the correct ThingTypeId --//
					if( $iThingTypeId!==$iHueThingTypeId ) {
						//-- The ThingId that the user passed is not a Philips Hue --//
						$bError     = true;
						$iErrCode   = 3201;
						$sErrMesg  .= "Error Code:'3201' \n";
						$sErrMesg  .= "The specified device is not a Philips Hue!\n";
						$sErrMesg  .= "Please use the ThingId of a valid Philips Hue.\n";
					}
					
				} else {
					//-- TODO: Add Error Message --//
					$bError = true;
					$iErrCode   = 3202;
					$sErrMesg  .= "Error Code:'3202' \n";
					$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
					$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
				}
			}
			
			//----------------------------------------------------------------------------//
			//-- STEP 3: Look up the details to the "Link" that belongs to that "Thing" --//
			//----------------------------------------------------------------------------//
			if( $bError===false ) {
				//-- Fetch the Info about the Link --//
				$aTempFunctionResult2 = GetLinkInfo( $iLinkId );
				
				//-- Extract the desired variables out of the results --//
				if( $aTempFunctionResult2['Error']===false ) {
					
					//-- Lookup the Comm Information --//
					$aCommInfo = GetCommInfo( $aTempFunctionResult2['Data']['LinkCommId'] );
					
					if( $aCommInfo['Error']===false ) {
						
						//-- Extract the Desired Variables --//
						$iLinkCommType        = $aCommInfo['Data']['CommTypeId'];
						
						//-- If the API Controls the Philips Hue Light bulb rather than WatchInputs then extract the variables required --//
						if( $iLinkCommType===$iAPICommTypeId ) {
							//-- Extract the required variables from the function results --//
							$sNetworkAddress  = $aTempFunctionResult2['Data']['LinkConnAddress'];
							$sNetworkPort     = $aTempFunctionResult2['Data']['LinkConnPort'];
							$sUserToken       = $aTempFunctionResult2['Data']['LinkConnUsername'];
							$sHWId            = strval( $aTempFunctionResult1['Data']['ThingHWId'] );
							
							//-- Flag that this request needs to use the "PhilipsHue" PHP Object to update the device --//
							$bUsePHPObject = true;
						}
						
					} else {
						$bError = true;
						$iErrCode  = 3205;
						$sErrMesg .= "Error Code:'3205' \n";
						$sErrMesg .= "Problem when fetching the Link's Comm info\n";
						$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
					}
					
				} else {
					$bError = true;
					$iErrCode  = 3204;
					$sErrMesg .= "Error Code:'3204' \n";
					$sErrMesg .= "Problem when fetching the Link info\n";
					$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
				}
			}
			
			//----------------------------------------------------------------------------//
			//-- STEP 5: Lookup the IOs that need their values updated                  --//
			//----------------------------------------------------------------------------//
			if( $bError===false ) {
				//-- List all IOs attached to that Thing --//
				$aTempFunctionResult1 = GetIOsFromThingId( $iPostThingId );
				//-- Parse the results --//
				if( $aTempFunctionResult1['Error']===false ) {
					
					//-----------------------------------------------------------------------------------------//
					//-- Verify that the 3 desired IO Ids are found and stored to their appropiate variables --//
					//-----------------------------------------------------------------------------------------//
					foreach( $aTempFunctionResult1['Data'] as $aIO ) {
						//----------------------------//
						//-- Mode 1: Hue            --//
						//----------------------------//
						if( $aIO['RSTypeId']===$iHueRSTypeId ) {
							$iHueIOId = $aIO['IOId'];
							
						//----------------------------//
						//-- Mode 1: Saturation     --//
						//----------------------------//
						} else if( $aIO['RSTypeId']===$iSaturationRSTypeId ) {
							$iSaturationIOId = $aIO['IOId'];
							
						//----------------------------//
						//-- Mode 1: Lightness      --//
						//----------------------------//
						} else if( $aIO['RSTypeId']===$iBrightnessRSTypeId ) {
							$iBrightnessIOId = $aIO['IOId'];
							
							
						//----------------------------//
						//-- Mode 2: Red            --//
						//----------------------------//
						} else if( $aIO['RSTypeId']===$iRedRSTypeId ) {
							$iRedIOId = $aIO['IOId'];
							
						//----------------------------//
						//-- Mode 2: Green          --//
						//----------------------------//
						} else if( $aIO['RSTypeId']===$iGreenRSTypeId ) {
							$iGreenIOId = $aIO['IOId'];
							
						//----------------------------//
						//-- Mode 2: Blue           --//
						//----------------------------//
						} else if( $aIO['RSTypeId']===$iBlueRSTypeId ) {
							$iBlueIOId = $aIO['IOId'];
							
						}
						
					} //-- END Foreach IO --//
					
					
					//----------------------------------------------------//
					//-- IF a IOId couldn't be retrieved                --//
					//----------------------------------------------------//
					$iSystemType = 0;
					
					//----------------------------------------//
					//-- IF Using the new RGB System        --//
					//----------------------------------------//
					if( $iRedIOId>=1 && $iGreenIOId>=1 && $iBlueIOId>=1 ) {
						$iSystemType = 2;
						
						
					//----------------------------------------//
					//-- ELSEIF Using the old HSB System    --//
					//----------------------------------------//
					} else if( $iHueIOId>=1 && $iSaturationIOId>=1 && $iBrightnessIOId>=1 ) {
						$iSystemType = 1;
						
						
					//----------------------------------------//
					//-- ELSE Missing IOs                   --//
					//----------------------------------------//
					} else {
						$bError = true;
						$iErrCode  = 3211;
						$sErrMesg .= "Error Code:'3211' \n";
						$sErrMesg .= "Can not find enough of the required IOs.\n";
						$sErrMesg .= "The accepted IO combinations are as followed.\n";
						$sErrMesg .= " RGB) \"Red\", \"Green\" & \"Blue\"  \n";
						$sErrMesg .= " HSB) \"Hue\", \"Saturation\" & \"Brightness\" \n";
						$sErrMesg .= "Please contact an administrator to rectify the issue.\n";
					}
				} else {
					//-- Display the error --//
					$bError = true;
					$iErrCode  = 3210;
					$sErrMesg .= "Error Code:'3210' \n";
					$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
					$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
				}
			}
			
			//----------------------------------------------------------------------------//
			//-- STEP 6: Validate the new values                                        --//
			//----------------------------------------------------------------------------//
			if( $bError===false ) {
				
				
				//----------------------------------------------------------------//
				//-- IF "ChangeRGB" mode                                        --//
				//----------------------------------------------------------------//
				if( $sPostMode==="ChangeColorRGB" ) {
					
					//------------------------------------------------//
					//-- Generate the PhilipsHue HSB                --//
					//------------------------------------------------//
					$aTempPH_HSB = Color_RGB_to_HSV( $fColorRed, $fColorGreen, $fColorBlue, array(
						"InputRedMax"    => $fColorRedMax,
						"InputGreenMax"  => $fColorGreenMax,
						"InputBlueMax"   => $fColorBlueMax,
						"OutputHueMax"   => 65535,
						"OutputSatMax"   => 254,
						"OutputValMax"   => 254,
						"OutputHueRound" => true,
						"OutputSatRound" => true,
						"OutputValRound" => true
					));
					
					if( $aTempPH_HSB===null || $aTempPH_HSB===false ) {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3351;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"RGB\" Mode!\n";
						
					} else if( $aTempPH_HSB['Error']===true ) {
						//-- ERROR:  --//
						$bError = true;
						$iErrCode   = 3351;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"RGB\" Mode!\n";
						$sErrMesg  .= $aTempPH_HSB['ErrMsg']."\n";
					}
					
					
					//------------------------------------------------//
					//-- Generate the RGB                           --//
					//------------------------------------------------//
					if( $bError===false ) {
						$aTempDB_RGB = Color_RGB_Rescale( $fColorRed, $fColorGreen, $fColorBlue, array(
							"InputRedMax"      => $fColorRedMax,
							"InputGreenMax"    => $fColorGreenMax,
							"InputBlueMax"     => $fColorBlueMax,
							"OutputRedMax"     => 255,
							"OutputGreenMax"   => 255,
							"OutputBlueMax"    => 255,
							"OutputRedRound"   => true,
							"OutputGreenRound" => true,
							"OutputBlueRound"  => true
						));
						
						if( $aTempDB_RGB===null || $aTempDB_RGB===false ) {
							//-- ERROR: --//
							$bError = true;
							$iErrCode   = 3352;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"RGB\" Mode!\n";
							
						} else if( $aTempDB_RGB['Error']===true ) {
							//-- ERROR:  --//
							$bError = true;
							$iErrCode   = 3352;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"RGB\" Mode!\n";
							$sErrMesg  .= $aTempDB_RGB['ErrMsg']."\n";
						}
					}
					
					
					
				//----------------------------------------------------------------//
				//-- ELSEIF "HSV" mode                                          --//
				//----------------------------------------------------------------//
				} else if( $sPostMode==="ChangeColorHSV"  ) {
					//------------------------------------------------//
					//-- Calculate the RGB                          --//
					//------------------------------------------------//
					$aTempDB_RGB = Color_HSV_to_RGB( $fColorHue, $fColorSat, $fColorBrightness, array(
						"InputHueMax"      => $fColorHueMax,
						"InputSatMax"      => $fColorSatMax,
						"InputValMax"      => $fColorBrightnessMax,
						"OutputRedMax"     => 255,
						"OutputGreenMax"   => 255,
						"OutputBlueMax"    => 255,
						"OutputRedRound"   => true,
						"OutputGreenRound" => true,
						"OutputBlueRound"  => true
					));
					
					if( $aTempDB_RGB===null || $aTempDB_RGB===false ) {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3353;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"HSV\" Mode!\n";
						
					} else if( $aTempDB_RGB['Error']===true ) {
						//-- ERROR:  --//
						$bError = true;
						$iErrCode   = 3353;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"HSV\" Mode!\n";
						$sErrMesg  .= $aTempDB_RGB['ErrMsg']."\n";
					}
					
					//------------------------------------------------//
					//-- Generate the PhilipsHue HSB                --//
					//------------------------------------------------//
					if( $bError===false ) {
						$aTempPH_HSB = Color_RGB_to_HSV( $aTempDB_RGB['Red'], $aTempDB_RGB['Green'], $aTempDB_RGB['Blue'], array(
							"InputRedMax"    => 255,
							"InputGreenMax"  => 255,
							"InputBlueMax"   => 255,
							"OutputHueMax"   => 65535,
							"OutputSatMax"   => 254,
							"OutputValMax"   => 254,
							"OutputHueRound" => true,
							"OutputSatRound" => true,
							"OutputValRound" => true
						));
						
						if( $aTempPH_HSB===null || $aTempPH_HSB===false ) {
							//-- ERROR: --//
							$bError = true;
							$iErrCode   = 3351;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"HSV\" Mode!\n";
							
						} else if( $aTempPH_HSB['Error']===true ) {
							//-- ERROR:  --//
							$bError = true;
							$iErrCode   = 3351;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"HSV\" Mode!\n";
							$sErrMesg  .= $aTempPH_HSB['ErrMsg']."\n";
						}
					}
					
					
				//----------------------------------------------------------------//
				//-- ELSEIF "HSL" mode                                          --//
				//----------------------------------------------------------------//
				} else if( $sPostMode==="ChangeColorHSL"  ) {
					//------------------------------------------------//
					//-- Calculate the RGB                          --//
					//------------------------------------------------//
					$aTempDB_RGB = Color_HSL_to_RGB( $fColorHue, $fColorSat, $fColorLight, array(
						"InputHueMax"      => $fColorHueMax,
						"InputSatMax"      => $fColorSatMax,
						"InputValMax"      => $fColorLightMax,
						"OutputRedMax"     => 255,
						"OutputGreenMax"   => 255,
						"OutputBlueMax"    => 255,
						"OutputRedRound"   => true,
						"OutputGreenRound" => true,
						"OutputBlueRound"  => true
					));
					
					if( $aTempDB_RGB===null || $aTempDB_RGB===false ) {
						//-- ERROR: --//
						$bError = true;
						$iErrCode   = 3353;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"HSL\" Mode!\n";
						
					} else if( $aTempDB_RGB['Error']===true ) {
						//-- ERROR:  --//
						$bError = true;
						$iErrCode   = 3353;
						$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg  .= "Problem when calculating the \"DB_RGB\" color values when using the \"HSL\" Mode!\n";
						$sErrMesg  .= $aTempDB_RGB['ErrMsg']."\n";
					}
					
					//------------------------------------------------//
					//-- Generate the PhilipsHue HSB                --//
					//------------------------------------------------//
					if( $bError===false ) {
						$aTempPH_HSB = Color_RGB_to_HSV( $aTempDB_RGB['Red'], $aTempDB_RGB['Green'], $aTempDB_RGB['Blue'], array(
							"InputRedMax"    => 255,
							"InputGreenMax"  => 255,
							"InputBlueMax"   => 255,
							"OutputHueMax"   => 65535,
							"OutputSatMax"   => 254,
							"OutputValMax"   => 254,
							"OutputHueRound" => true,
							"OutputSatRound" => true,
							"OutputValRound" => true
						));
					
						if( $aTempPH_HSB===null || $aTempPH_HSB===false ) {
							//-- ERROR: --//
							$bError = true;
							$iErrCode   = 3351;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"HSL\" Mode!\n";
							
						} else if( $aTempPH_HSB['Error']===true ) {
							//-- ERROR:  --//
							$bError = true;
							$iErrCode   = 3351;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Problem when calculating the \"PH_HSB\" color values when using the \"HSL\" Mode!\n";
							$sErrMesg  .= $aTempPH_HSB['ErrMsg']."\n";
						}
					}
					
				} else {
					echo "Unexpected Else!";
				}
			} //-- ENDIF no errors have occurred --//
			
		}
	} catch( Exception $e0200 ) {
		$bError = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= "Critical Error Occurred!\n";
		$sErrMesg .= "Problem occurred when preparing for the main function\n";
	}
}

//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE:              ==//
		//================================================================//
		if( $sPostMode==="AddNewBridge" ) {
			try {
				
				//----------------------------------------------------------------//
				//-- Add the "PHP API" Comm if it can't be found                --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- If no matches found --//
					if( $bFound===false ) {
						
						$aNewCommData = array(
							"HubId"     => $iPostHubId,
							"Type"      => "2",
							"Name"      => "PHP API",
							"Address"   => ""
						);
						
						//-- Add the "PHP API" Comm to the Database --//
						$aTempFunctionResult2 = PrepareAddNewComm( $aNewCommData, null );
						
						if( $aTempFunctionResult2['Error']===false ) {
							//-- Extract the CommId from the Results --//
							$iCommId = $aTempFunctionResult2['CommId'];
							
						} else {
							//-- Display an error --//
							$bError = true;
							$iErrCode  = 1401+$aTempFunctionResult2['ErrCode'];
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem when adding the new Comm to the database\n";
							$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
						}
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- Connect and add the Philips Hue Bridge to the database     --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					//-- Create the PHP Philips Hue Object --//
					$oPHPPhilipsHue           = new PHPPhilipsHue( $sPostNetworkAddress, $iPostDevicePort, $sPostToken );
					
					//-- Check if the Connection is successful --//
					if( $oPHPPhilipsHue->bInitialised===true ) {
						
						//-- Add the Philips Hue Bridge to the Database --//
						$aTempFunctionResult3 = $oPHPPhilipsHue->AddThisBridgeToTheDatabase( $iCommId, $iPostRoomId, $sPostDisplayName );
						
						//-- Check for errors --//
						if( $aTempFunctionResult3['Error']===false ) {
							
							//-- Extract the Link Id --//
							$iLinkId = $aTempFunctionResult3['Data']['LinkId'];
							
							//-- Lookup the list of lights --//
							$aTempFunctionResult5 = $oPHPPhilipsHue->RefreshLightsList();
							
							
							if( $aTempFunctionResult5['Error']===false ) {
								//-- Add the Lights to the Philips Hue Bridge --//
								$aTempFunctionResult4 = $oPHPPhilipsHue->AutoAddNewLights( $iLinkId );
								
								//echo "\n\n";
								//var_dump( $aTempFunctionResult5 );
								//echo "\n\n";
								//var_dump( $aTempFunctionResult3 );
								//echo "\n\n";
								//var_dump( $aTempFunctionResult4 );
								//echo "\n\n";
								
								
								if( $aTempFunctionResult4['Error']===false ) {
									//-- Add the Philips Hue Bridge --//
									$aResult = array( 
										"Error"     => false,
										"Data"      => $aTempFunctionResult3['Data']
									);
									
									//-- Add the Philips Hue Lights --//
									$aResult['Data']['Things'] = $aTempFunctionResult4['Data'];
									
									
								} else {
									//-- ERROR --//
									$bError = true;
									$iErrCode  = 1436;
									$sErrMesg .= "Error Code:'1436' \n";
									$sErrMesg .= "Problem adding the detectable lights on the Philips Hue Bridge to the Database!\n";
									$sErrMesg .= $aTempFunctionResult4['ErrMesg'];
								}
							} else {
								//-- ERROR --//
								$bError = true;
								$iErrCode  = 1435;
								$sErrMesg .= "Error Code:'1435' \n";
								$sErrMesg .= "Problem looking up the list of detectable lights on the Philips Hue Bridge!\n";
								$sErrMesg .= $aTempFunctionResult5['ErrMesg'];
							}
							
						} else {
							//-- ERROR --//
							$bError = true;
							$iErrCode  = 1434;
							$sErrMesg .= "Error Code:'1434' \n";
							$sErrMesg .= "Problem adding the Philips Hue Bridge to the Database!\n";
							$sErrMesg .= $aTempFunctionResult3['ErrMesg'];
						}
						
					} else {
						//-- ERROR --//
						$bError = true;
						$iErrCode  = 1433;
						$sErrMesg .= "Error Code:'1433' \n";
						$sErrMesg .= "Problem connecting to the Philips Hue Bridge!\n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Lists all the lights on the Bridge             ==//
		//================================================================//
		} else if( $sPostMode==="ListLights" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Create the Object from the Class                       --//
				//--------------------------------------------------------------------//
				//$oPHPPhilipsHue         = new PHPPhilipsHue( $sPostNetworkAddress, $iPostDeviceOnvifPort, $sPostToken );
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Check if 												--//
				//--------------------------------------------------------------------//
				//$aTempFunctionResult1   = $oPHPPhilipsHue->GetLightsList();
				
				
				//var_dump( $oPHPPhilipsHue->GetConfiguration() );
				//--------------------------------------------------------------------//
				//-- 5.2.3 - Check if 												--//
				//--------------------------------------------------------------------//
				//$aResult			= $oPHPOnvifClient->ExtractDeviceDateAndTime( $aTempFunctionResult1 );
				//$aResult = $aTempFunctionResult1;
				
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 0;
				$sErrMesg  .= "Error Code:'2400' \n";
				$sErrMesg  .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Change Hue, Saturation, Brightness             ==//
		//================================================================//
		} else if( $sPostMode==="ChangeColorHSL" || $sPostMode==="ChangeColorHSV" || $sPostMode==="ChangeColorRGB" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.3.1 - UPDATE THE DEVICE                                  --//
				//----------------------------------------------------------------//
				if( $bUsePHPObject===true ) {
					
					//--------------------------------------------------------------------//
					//-- 5.3.1.1 - Create the Object from the Class                     --//
					//--------------------------------------------------------------------//
					$oPHPPhilipsHue         = new PHPPhilipsHue( $sNetworkAddress, $sNetworkPort, $sUserToken );
					
					//--------------------------------------------------------------------//
					//-- 5.3.1.2 - Get all lights to verify access to the Light         --//
					//--------------------------------------------------------------------//
					if( $oPHPPhilipsHue->bInitialised===true ) {
						$aTempFunctionResult1   = $oPHPPhilipsHue->GetLightsList();
						
						//------------------------------------------------------------------------//
						//-- 5.3.1.2.1 - Update the HueSatBright of the Light if it is found    --//
						//------------------------------------------------------------------------//
						if( isset($aTempFunctionResult1[$sHWId]) ) {
							//------------------------------------//
							//-- CHANGE THE LIGHT'S HSL         --//
							//------------------------------------//
							
							$aResult = $oPHPPhilipsHue->ChangeLightHueSatBright( $sHWId, $aTempPH_HSB['Hue'], $aTempPH_HSB['Sat'], $aTempPH_HSB['Val'] );
							//$aResult = $oPHPPhilipsHue->ChangeLightHueSatBright( $sHWId, $iPostHue, $iPostSaturation, $iPostBrightness );
							
							
							if($aResult['Error']===true) {
								$bError     = true;
								$iErrCode   = 3401;
								$sErrMesg  .= "Error Code:'3401' \n";
								$sErrMesg  .= "Problem with updating the 'Hue', 'Saturation' and/or 'Brightness'. \n";
							}
							
						} else {
							$bError     = true;
							$iErrCode   = 3402;
							$sErrMesg  .= "Error Code:'3402' \n";
							$sErrMesg  .= "Problem with looking up the specified Philips Hue Light! \n";
							$sErrMesg  .= "The Light may be disconnected or incorrect credentials have been used. \n";
						}
						
						//----------------------------------------------------------------//
						//-- Check if the Light List needs updating                     --//
						//----------------------------------------------------------------//
						try {
							//-- If the User has Write Permission --//
							if( $iWritePerm===1 ) {
								
								$aTempFunctionResult4 = $oPHPPhilipsHue->AutoAddNewLights( $iLinkId );
								
							}	//-- ENDIF User has the Write Permission --//
						} catch( Exception $e3403 ) {
							//echo "AutoAdd Error!";
						}
						
						
					} else {
						$bError     = true;
						$iErrCode   = 3406;
						$sErrMesg  .= "Error Code:'3406' \n";
						$sErrMesg  .= "Problem when connecting to the Philips Hue Bridge! \n";
						$sErrMesg  .= $oPHPPhilipsHue->aErrorMessges[0];
					}
				} else if( $iLinkCommType===$iDemoCommTypeId ) {
					
					//-- Return a fake success message --//
					$aResult = array(
						"Error"     => false,
						"Data"      => array(
							array( "Success" => true )
						)
					);
				}
				
				//----------------------------------------------------------------//
				//-- 5.3.2 - UPDATE THE DATABASE                                --//
				//----------------------------------------------------------------//
				
				//--------------------------------------------//
				//-- Setup the current unix timestamp       --//
				//--------------------------------------------//
				$iUTS = time();
				
				
				if( $bError===false ) {
					//--------------------------------------------//
					//-- IF New IO system                       --//
					//--------------------------------------------//
					if( $iSystemType===2 ) {
						//--------------------------------------------//
						//-- Insert the new Red value               --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iRedIOId, $iUTS, $aTempDB_RGB['Red'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3412;
								$sErrMesg  .= "Error Code:'3412' \n";
								$sErrMesg  .= "Critical Error updating the \"Red\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
						
						//--------------------------------------------//
						//-- Insert the new Green value             --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iGreenIOId, $iUTS, $aTempDB_RGB['Green'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3413;
								$sErrMesg  .= "Error Code:'3413' \n";
								$sErrMesg  .= "Critical Error updating the \"Green\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
						
						//--------------------------------------------//
						//-- Insert the new Blue value              --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iBlueIOId, $iUTS, $aTempDB_RGB['Blue'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3414;
								$sErrMesg  .= "Error Code:'3414' \n";
								$sErrMesg  .= "Critical Error updating the \"Blue\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
						
					//--------------------------------------------//
					//-- ELSE Old IO system                     --//
					//--------------------------------------------//
					} else {
						
						
						//--------------------------------------------//
						//-- Insert the new Hue value               --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iHueIOId, $iUTS, $aTempPH_HSB['Hue'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3422;
								$sErrMesg  .= "Error Code:'3422' \n";
								$sErrMesg  .= "Critical Error updating the \"Hue\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
						
						//--------------------------------------------//
						//-- Insert the new Saturation value        --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iSaturationIOId, $iUTS, $aTempPH_HSB['Sat'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3423;
								$sErrMesg  .= "Error Code:'3423' \n";
								$sErrMesg  .= "Critical Error updating the \"Saturation\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
						
						//--------------------------------------------//
						//-- Insert the new Brightness value        --//
						//--------------------------------------------//
						if( $bError===false ) {
							$aTempFunctionResult4 = InsertNewIODataValue( $iBrightnessIOId, $iUTS, $aTempPH_HSB['Val'] );
							
							if( $aTempFunctionResult4['Error']===true ) {
								$bError     = true;
								$iErrCode   = 3424;
								$sErrMesg  .= "Error Code:'3424' \n";
								$sErrMesg  .= "Critical Error updating the \"Brightness\" value!\n";
								$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
							}
						}
					} //-- ENDELSE Old System of IOs --//
				} //-- ENDIF No errors have occurred --//
				
			} catch( Exception $e3415 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3415' \n";
				$sErrMesg .= "Critical Error in the main section of the \"ChangeColor\" Mode!\n";
				$sErrMesg .= $e3415->getMessage();
			}
		//================================================================//
		//== UNSUPPORTED MODE                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$iErrCode  = 401;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$iErrCode  = 400;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}
//====================================================================//
//== 8.0 - Log the Results											==//
//====================================================================//







//====================================================================//
//== 9.0 - Finalise													==//
//====================================================================//

//-- API didn't encounter an Error --//
if( $bError===false && $aResult!=false ) {
	try {
		//-- Force the page to JSON --//
		header('Content-Type: application/json');
		
		//-- Convert results to a string --//
		$sOutput .= json_encode( $aResult );
		
		//-- Output results --//
		echo $sOutput;
	
	} catch( Exception $e0001 ) {
		header('Content-Type: text/plain');
		//-- The aResult array cannot be turned into a string due to corruption of the array --//
		echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
	}
	
//-- API Error has occurred --//
} else {
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
		$sOutput  = "Error Code:'0004'!\n Critical Error has occured!\n";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!\n";
	}
}




?>