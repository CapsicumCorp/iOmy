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

$iLinkId                    = 0;            //-- INTEGER:       Used to hold the Link Id of the newly created Philips Hue Bridge in the database --//
$iThingTypeId               = 0;            //-- INTEGER:       Stores the ThingTypeId to verify if they are --//

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



//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iDemoCommTypeId         = LookupFunctionConstant("DemoCommTypeId");
$iAPICommTypeId          = LookupFunctionConstant("APICommTypeId");
$iHueThingTypeId         = LookupFunctionConstant("HueThingTypeId");
$iHueRSTypeId            = LookupFunctionConstant("LightHueRSTypeId");
$iSaturationRSTypeId     = LookupFunctionConstant("LightSaturationRSTypeId");
$iBrightnessRSTypeId     = LookupFunctionConstant("LightBrightnessRSTypeId");

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
		array( "Name"=>'ThingId',                   "DataType"=>'INT' ),
		array( "Name"=>'Hue',                       "DataType"=>'INT' ),
		array( "Name"=>'Saturation',                "DataType"=>'INT' ),
		array( "Name"=>'Brightness',                "DataType"=>'INT' )
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
		if( $sPostMode!=="AddNewBridge" && $sPostMode!=="ChangeHueSatLig" ) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddNewBridge\" or \"ChangeHueSatLig\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddNewBridge\" or  \"ChangeHueSatLig\" \n\n";
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
	//-- 2.2.4.A - Retrieve "Username"                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewBridge" ) {
			try {
				//-- Retrieve the "DeviceUsername" --//
				$sPostToken = $aHTTPData["DeviceUserToken"];
				
				if( $sPostToken===false ) {
					$sPostToken = "admin";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"Username\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Username\" parameter\n";
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
	//-- 2.2.5.A - Retrieve "ThingId"                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeHueSatLig" ) {
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
	//-- 2.2.6.B - Retrieve "Hue"                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeHueSatLig" ) {
			try {
				//-- Retrieve the "Hue" --//
				$iPostHue = $aHTTPData["Hue"];
				
			} catch( Exception $e0114 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"Hue\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Hue\" parameter\n";
				$sErrMesg .= "eg. \n \"0\", \"25500\", \"46920\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.7.B - Retrieve "Saturation"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeHueSatLig" ) {
			try {
				//-- Retrieve the "Saturation" --//
				$iPostSaturation = $aHTTPData["Saturation"];
				
			} catch( Exception $e0116 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"Saturation\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Saturation\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"126\" or \"254\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.8.B - Retrieve "Brightness"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeHueSatLig" ) {
			try {
				//-- Retrieve the "Brightness" --//
				$iPostBrightness = $aHTTPData["Brightness"];
				
			} catch( Exception $e0118 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"Brightness\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Brightness\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"126\" or \"254\" \n\n";
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
				//-- Check if the User has the "Write" permission to the Hub    --//
				//----------------------------------------------------------------//
				$aHubData = HubRetrieveInfoAndPermission( $iPostHubId );
				
				if( $aHubData['Error']===false) {
					//-- Store the Write Permission --//
					$iWritePermission = $aHubData['Data']['PermWrite'];
					
					if( $iWritePermission===0 ) {
						$bError = true;
						$iErrCode  = 1203;
						$sErrMesg .= "Error Code:'1203' \n";
						$sErrMesg .= "Permission issue detected!\n";
						$sErrMesg .= "The User doesn't appear to have the \"Write\" permission for that Hub\n";
					}
					
				} else {
					$bError = true;
					$iErrCode  = 1202;
					$sErrMesg .= "Error Code:'1202' \n";
					$sErrMesg .= "Problem looking up the data for the selected Hub\n";
					$sErrMesg .= $aHubData['ErrMesg'];
				}
				
				//----------------------------------------------------------------//
				//-- Check if a "PHP API" Comm is setup on the Hub              --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
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
						
					}
				}
			} catch( Exception $e1201 ) {
				$bError = true;
				$iErrCode  = 1201;
				$sErrMesg .= "Error Code:'1201' \n";
				$sErrMesg .= "Critical Error Occurred!\n";
				$sErrMesg .= "Problem occurred when preparing for the main function\n";
			}
			
			
		} else if( $sPostMode==="ChangeHueSatLig" ) {
			//------------------------------------------------------------//
			//-- STEP 2: Lookup the details on that particular "Thing"  --//
			//------------------------------------------------------------//
			$aTempFunctionResult1 = GetThingInfo( $iPostThingId );
			
			
			if( $aTempFunctionResult1['Error']===false ) {
				$iThingTypeId   = $aTempFunctionResult1['Data']['ThingTypeId'];
				$iLinkId        = $aTempFunctionResult1['Data']['LinkId'];
				$bWritePerm     = $aTempFunctionResult1['Data']['PermWrite'];
				
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
						//--------------------//
						//-- Hue            --//
						//--------------------//
						if( $aIO['RSTypeId']===$iHueRSTypeId ) {
							$iHueIOId = $aIO['IOId'];
							
						//--------------------//
						//-- Saturation     --//
						//--------------------//
						} else if( $aIO['RSTypeId']===$iSaturationRSTypeId ) {
							$iSaturationIOId = $aIO['IOId'];
							
						//--------------------//
						//-- Lightness      --//
						//--------------------//
						} else if( $aIO['RSTypeId']===$iBrightnessRSTypeId ) {
							$iBrightnessIOId = $aIO['IOId'];
							
						}
					} //-- END Foreach --//
					
					
					//----------------------------------------------------//
					//-- IF a IOId couldn't be retrieved                --//
					//----------------------------------------------------//
					if( !($iHueIOId>0) ) {
						//-- Id isn't greater than zero --//
						$bError = true;
						$iErrCode  = 3210;
						$sErrMesg .= "Error Code:'3210' \n";
						$sErrMesg .= "Can not find the 'Hue' IO.\n";
						
					} else if( !($iSaturationIOId>0) ) {
						//-- Id isn't greater than zero --//
						$bError = true;
						$iErrCode  = 3211;
						$sErrMesg .= "Error Code:'3211' \n";
						$sErrMesg .= "Can not find the 'Saturation' IO.\n";
						
					} else if( !($iBrightnessIOId>0) ) {
						//-- Id isn't greater than zero --//
						$bError = true;
						$iErrCode  = 3212;
						$sErrMesg .= "Error Code:'3212' \n";
						$sErrMesg .= "Can not find the 'Brightness' IO.\n";
						
					//----------------------------------------------------//
					//-- ELSE Assume that there isn't any errors        --//
					//----------------------------------------------------//
					} else {
						//-- Check if the user has tried to update atleast one value --//
						if( $iPostHue===false && $iPostSaturation===false && $iPostBrightness===false ) {
							$bError = true;
							$iErrCode  = 3213;
							$sErrMesg .= "Error Code:'3213' \n";
							$sErrMesg .= "Problem with the \"Hue\", \"Saturation\" and \"Brightness\" values!.\n";
							
						} else {
							//----------------------------------------//
							//-- Perform Validation on the values   --//
							//----------------------------------------//
							
							//-- Make sure the Hue is valid --//
							if( $iPostHue<0 || $iPostHue>65535 ) {
								$bError = true;
								$iErrCode  = 3215;
								$sErrMesg .= "Error Code:'3215' \n";
								$sErrMesg .= "Please use a valid number for the 'Hue' value!\n";
								$sErrMesg .= "Eg. 0-65535!\n";
							}
							
							//-- Make sure the Saturation is valid --//
							if( $iPostSaturation<0 || $iPostSaturation>254 ) {
								$bError = true;
								$iErrCode  = 3216;
								$sErrMesg .= "Error Code:'3216' \n";
								$sErrMesg .= "Please use a valid number for the 'Saturation' value!\n";
								$sErrMesg .= "Eg. 0-254!\n";
							}
							
							//-- Make sure the Brightness is valid --//
							if( $iPostBrightness<0 || $iPostBrightness>254 ) {
								$bError = true;
								$iErrCode  = 3217;
								$sErrMesg .= "Error Code:'3217' \n";
								$sErrMesg .= "Please use a valid number for the 'Brightness' value!\n";
								$sErrMesg .= "Eg. 0-254!\n";
							}
						}
					}
				} else {
					//-- Display the error --//
					$bError = true;
					$iErrCode  = 3220;
					$sErrMesg .= "Error Code:'3220' \n";
					$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
					$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
				}
			}
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
						$aTempFunctionResult3 = $oPHPPhilipsHue->AddThisBridgeToTheDatabase( $iCommId );
						
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
		} else if( $sPostMode==="ChangeHueSatLig" ) {
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
							$aResult = $oPHPPhilipsHue->ChangeLightHueSatBright( $sHWId, $iPostHue, $iPostSaturation, $iPostBrightness );
							
							
							//----------------------------------------------------------------//
							//-- If Successful then check if the Light List needs updating  --//
							//----------------------------------------------------------------//
							if($aResult['Error']===false) {
								//-- If the User has Write Permission --//
								if( $bWritePerm===true ) {
									
									$aTempFunctionResult4 = $oPHPPhilipsHue->AutoAddNewLights( $iLinkId );
									
									
								}	//-- ENDIF User has the Write Permission --//
							} else {
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
						
					} else {
						$bError     = true;
						$iErrCode   = 3403;
						$sErrMesg  .= "Error Code:'3403' \n";
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
				
				//--------------------------------------------//
				//-- Insert the new Hue value               --//
				//--------------------------------------------//
				if( $bError===false ) {
					if( $iPostHue!==false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iHueIOId, $iUTS, $iPostHue );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3412;
							$sErrMesg  .= "Error Code:'3412' \n";
							$sErrMesg  .= "Critical Error updating the \"Hue\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
				}
				
				//--------------------------------------------//
				//-- Insert the new Saturation value        --//
				//--------------------------------------------//
				if( $bError===false ) {
					if( $iPostSaturation!==false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iSaturationIOId, $iUTS, $iPostSaturation );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3413;
							$sErrMesg  .= "Error Code:'3413' \n";
							$sErrMesg  .= "Critical Error updating the \"Saturation\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
				}
				
				//--------------------------------------------//
				//-- Insert the new Brightness value        --//
				//--------------------------------------------//
				if( $bError===false ) {
					if( $iPostBrightness!==false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iBrightnessIOId, $iUTS, $iPostBrightness );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3414;
							$sErrMesg  .= "Error Code:'3414' \n";
							$sErrMesg  .= "Critical Error updating the \"Brightness\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
				}
				
				
			} catch( Exception $e3415 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3415' \n";
				$sErrMesg .= "Critical Error in the main section of the \"ChangeHueSatLig\" Mode!\n";
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