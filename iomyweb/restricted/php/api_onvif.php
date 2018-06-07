<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used to give the UI access to an Onvif supported devices.
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

//------------------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE                   --//
//------------------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        Used to hold this API Request's body when everything is successful. --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.  --//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//
$sPostDisplayname           = "";           //-- STRING:        --//
$sPostNetworkAddress        = "";           //-- STRING:        Used to store the "DeviceNetworkAddress" that is passed as a HTTP POST variable. --//
$iPostNetworkPort           = "";           //-- INTEGER:       Used to store the "".	--//
$sPostUsername              = "";           //-- STRING:        Used to store the "".	--//
$sPostPassword              = "";           //-- STRING:        Used to store the "".	--//
$sPostStreamProfileName     = "";           //-- STRING:        --//
$sPostThumbProfileName      = "";           //-- STRING:        --//
$sPostCapabilitiesType      = "";           //-- STRING:        --//
$sOnvifCameraName           = "";           //-- STRING:        --//
$sOnvifProfileName          = "";           //-- STRING:        --//
$aSensorList                = array();      //-- ARRAY:         Used to store the --//
$aTempFunctionResult        = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be returned. --//
$iPostLinkId                = 0;            //-- INTEGER:       --//
$iPostThingId               = 0;            //-- INTEGER:       --//
$iPostRoomId                = 0;            //-- INTEGER:       --//
$aTempFunctionResult1       = array();      //-- ARRAY:         --//
$aTempFunctionResult2       = array();      //-- ARRAY:         --//
$aTempFunctionResult3       = array();      //-- ARRAY:         --//
$bFound                     = false;        //-- BOOLEAN:       Used to indicate if a match is found or not --//
$iAPICommTypeId             = 0;            //-- INTEGER:       Will hold the the CommTypeId for comparisons --//
$iLinkPermWrite             = 0;            //-- INTEGER:       --//
$aCommInfo                  = array();      //-- ARRAY:         --//
$sPostStreamAuth            = "";           //-- STRING:        Used to hold the Stream Authentication in a JSON string if the "Stream Url" and the "Thumbnail Url" require it. --//
$aPostStreamAuth            = array();      //-- ARRAY:         Used to Stream Authentication after it has been converted into an array. --//

$iPremiseId                 = 0;            //-- INTEGER:       --//
$aHubData                   = array();      //-- ARRAY:         --//
$aRoomValidate              = array();      //-- ARRAY:         --//
$aRoomInfo                  = array();      //-- ARRAY:         --//
$aTempFunctionResult1       = array();      //-- ARRAY:         --//




//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/onvif/main.php';
require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';        //-- This library is used to perform the inserting of a new Onvif Server and Streams into the database --//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//


//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//


//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'DisplayName',               "DataType"=>'STR' ),
		array( "Name"=>'DeviceNetworkAddress',      "DataType"=>'STR' ),
		array( "Name"=>'DeviceOnvifPort',           "DataType"=>'INT' ),
		array( "Name"=>'OnvifUsername',             "DataType"=>'STR' ),
		array( "Name"=>'OnvifPassword',             "DataType"=>'STR' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' ),
		array( "Name"=>'LinkId',                    "DataType"=>'INT' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' ),
		array( "Name"=>'RoomId',                    "DataType"=>'INT' ),
		array( "Name"=>'ProfileName',               "DataType"=>'STR' ),
		array( "Name"=>'StreamProfile',             "DataType"=>'STR' ),
		array( "Name"=>'ThumbnailProfile',          "DataType"=>'STR' ),
		array( "Name"=>'CameraName',                "DataType"=>'STR' ),
		array( "Name"=>'StreamAuth',                "DataType"=>'STR' ),
		array( "Name"=>'PosX',                      "DataType"=>'FLO' ),
		array( "Name"=>'PosY',                      "DataType"=>'FLO' ),
		array( "Name"=>'Zoom',                      "DataType"=>'FLO' ),
		array( "Name"=>'Timeout',                   "DataType"=>'FLO' ),
		array( "Name"=>'CapabilitiesType',          "DataType"=>'STR' ),
		array( "Name"=>'NewUIControlValue',         "DataType"=>'INT' )
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
		//-- NOTE: Valid modes are going to be "NetAddressLookupDeviceTime", "LookupVideoSources", "LookupStreamInfo", "OnvifData", "NetAddressCheckForOnvif"  --//
		
		//-- Verify that the mode is supported --//
		if( 
			$sPostMode!=="AddNewOnvifServer"            && $sPostMode!=="NetworkAddressServerInfo"      && 
			$sPostMode!=="ListServerInfo"               && $sPostMode!=="NewThing"                      && 
			$sPostMode!=="PTZAbsoluteMove"              && $sPostMode!=="PTZTimedMove"                  && 
			$sPostMode!=="NetAddressCheckForOnvif"      && $sPostMode!=="NetAddressListCapabilities"    && 
			$sPostMode!=="NetAddressLookupDeviceTime"   && $sPostMode!=="LookupVideoSources"            && 
			$sPostMode!=="LookupProfiles"               && $sPostMode!=="ChangeThingProfiles"           &&
			$sPostMode!=="LookupCapabilities"           && $sPostMode!=="ChangeStreamAuth"              &&
			$sPostMode!=="ChangeUIPTZControls"          
		) {
			$bError    = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"NetAddressCheckForOnvif\", \"NetAddressLookupDeviceTime\", \"LookupVideoSources\", \"LookupProfiles\" or \"LookupCapabilities\" \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"NetAddressCheckForOnvif\", \"NetAddressLookupDeviceTime\", \"LookupVideoSources\", \"LookupProfiles\" or \"LookupCapabilities\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2.A - Retrieve "DeviceNetworkAddress"      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" || $sPostMode==="NetworkAddressServerInfo" || $sPostMode==="NetAddressCheckForOnvif" || $sPostMode==="NetAddressLookupDeviceTime" || $sPostMode==="NetAddressListCapabilities" ) {
			try {
				//-- Retrieve the "DeviceNetworkAddress" --//
				$sPostNetworkAddress = $aHTTPData["DeviceNetworkAddress"];
				
				if( $sPostNetworkAddress===false ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"DeviceNetworkAddress\" parameter! \n";
					$sErrMesg .= "Please use a valid \"DeviceNetworkAddress\" parameter\n";
					$sErrMesg .= "eg. \n \"10.1.1.42\", \"10.1.1.24\", \"10.1.1.30\" \n\n";
				}
			} catch( Exception $e0104 ) {
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
		if( $sPostMode==="AddNewOnvifServer" || $sPostMode==="NetworkAddressServerInfo" || $sPostMode==="NetAddressCheckForOnvif" || $sPostMode==="NetAddressLookupDeviceTime" || $sPostMode==="NetAddressListCapabilities" ) {
			try {
				//-- Retrieve the "DeviceOnvifPort" --//
				$iPostNetworkPort = $aHTTPData["DeviceOnvifPort"];
				
				if( $iPostNetworkPort===false ) {
					$iPostNetworkPort = 8000;
				}
				
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"DeviceOnvifPort\" parameter!n\n";
				$sErrMesg .= "Please use a valid \"DeviceOnvifPort\" parameter\n";
				$sErrMesg .= "eg. \n 8000 \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.4.C - Retrieve "OnvifUsername"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" || $sPostMode==="NetworkAddressServerInfo" || $sPostMode==="NetAddressListCapabilities" ) {
			try {
				//-- Retrieve the "DeviceUsername" --//
				$sPostUsername = $aHTTPData["OnvifUsername"];
				
				if( $sPostUsername===false ) {
					$sPostUsername = "admin";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"OnvifUsername\" parameter!\n";
				$sErrMesg .= "Please use a valid \"OnvifUsername\" parameter\n";
				$sErrMesg .= "eg. \n \"admin\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5.C - Retrieve "OnvifPassword"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" || $sPostMode==="NetworkAddressServerInfo" || $sPostMode==="NetAddressListCapabilities" ) {
			try {
				//-- Retrieve the "OnvifPassword" --//
				$sPostPassword = $aHTTPData["OnvifPassword"];
				
				if( $sPostPassword===false ) {
					$sPostPassword = "admin";
				}
			} catch( Exception $e0110 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"OnvifPassword\" parameter!\n";
				$sErrMesg .= "Please use a valid \"OnvifPassword\" parameter\n";
				$sErrMesg .= "eg. \n \"admin\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Link Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="LookupVideoSources" || $sPostMode==="LookupProfiles" || $sPostMode==="ListServerInfo" || $sPostMode==="LookupCapabilities" || $sPostMode==="NewThing" ) {
			try {
				//-- Retrieve the "LinkId" --//
				$iPostLinkId = $aHTTPData["LinkId"];
				
				if( $iPostLinkId===false || !($iPostLinkId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0111' \n";
					$sErrMesg .= "Invalid \"LinkId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0112 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"LinkId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Thing Id                    --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" || $sPostMode==="ChangeThingProfiles" || $sPostMode==="ChangeStreamAuth" || $sPostMode==="ChangeUIPTZControls" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0113' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0114 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Hub Id                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false || !($iPostHubId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0115' \n";
					$sErrMesg .= "Invalid \"HubId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0116 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"HubId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "StreamProfile"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" ) {
			try {
				//-- Retrieve the "StreamProfile" name --//
				$sPostProfileName = $aHTTPData["ProfileName"];
				
				if( $sPostProfileName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0117' \n";
					$sErrMesg .= "Invalid \"ProfileName\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ProfileName\" parameter\n";
					$sErrMesg .= "eg. \n \"profile1\" \n\n";
				}
			} catch( Exception $e0118 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"ProfileName\" parameter!";
				$sErrMesg .= "Please use a valid \"ProfileName\" parameter";
				$sErrMesg .= "eg. \n \"profile1\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "StreamProfile"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="NewThing" || $sPostMode==="ChangeThingProfiles" ) {
			try {
				//-- Retrieve the "StreamProfile" name --//
				$sPostStreamProfileName = $aHTTPData["StreamProfile"];
				
				if( $sPostStreamProfileName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0117' \n";
					$sErrMesg .= "Invalid \"StreamProfile\" parameter! \n";
					$sErrMesg .= "Please use a valid \"StreamProfile\" parameter\n";
					$sErrMesg .= "eg. \n \"profile1\" \n\n";
				}
			} catch( Exception $e0118 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"StreamProfile\" parameter!";
				$sErrMesg .= "Please use a valid \"StreamProfile\" parameter";
				$sErrMesg .= "eg. \n \"profile1\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "ThumbnailProfile"          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="NewThing" || $sPostMode==="ChangeThingProfiles" ) {
			try {
				//-- Retrieve the "ThumbnailProfile" --//
				$sPostThumbProfileName = $aHTTPData["ThumbnailProfile"];
				
				if( $sPostThumbProfileName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0119' \n";
					$sErrMesg .= "Invalid \"ThumbnailProfile\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ThumbnailProfile\" parameter\n";
					$sErrMesg .= "eg. \n \"profile2\" \n\n";
				}
				
			} catch( Exception $e0120 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0120' \n";
				$sErrMesg .= "Incorrect \"ThumbnailProfile\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThumbnailProfile\" parameter\n";
				$sErrMesg .= "eg. \n \"profile2\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "CameraName"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="NewThing" ) {
			try {
				//-- Retrieve the "CameraName" --//
				$sOnvifCameraName = $aHTTPData["CameraName"];
				
				if( $sOnvifCameraName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0121' \n";
					$sErrMesg .= "Invalid \"CameraName\" parameter! \n";
					$sErrMesg .= "Please use a valid \"CameraName\" parameter\n";
					$sErrMesg .= "eg. \n \"profile2\" \n\n";
				}
				
			} catch( Exception $e0122 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0122' \n";
				$sErrMesg .= "Incorrect \"CameraName\" parameter!\n";
				$sErrMesg .= "Please use a valid \"CameraName\" parameter\n";
				$sErrMesg .= "eg. \n \"profile2\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "PosX"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" ) {
			try {
				//-- Retrieve the "PosX" --//
				$sPostOnvifPosX = $aHTTPData["PosX"];
				
			} catch( Exception $e0124 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0124' \n";
				$sErrMesg .= "Incorrect \"PosX\" parameter!\n";
				$sErrMesg .= "Please use a valid \"PosX\" parameter\n";
				$sErrMesg .= "eg. \n \"1\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "PosY"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" ) {
			try {
				//-- Retrieve the "PosY" --//
				$sPostOnvifPosY = $aHTTPData["PosY"];
				
			} catch( Exception $e0126 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0126' \n";
				$sErrMesg .= "Incorrect \"PosY\" parameter!\n";
				$sErrMesg .= "Please use a valid \"PosY\" parameter\n";
				$sErrMesg .= "eg. \n \"1\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "Zoom"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZAbsoluteMove" ) {
			try {
				//-- Retrieve the "Zoom" --//
				$sPostOnvifZoom = $aHTTPData["Zoom"];
				
			} catch( Exception $e0128 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0128' \n";
				$sErrMesg .= "Incorrect \"Zoom\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Zoom\" parameter\n";
				$sErrMesg .= "eg. \n \"\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "Timeout"                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="PTZTimedMove" ) {
			try {
				//-- Retrieve the "Timeout" --//
				$fPostTimeout = $aHTTPData["Timeout"];
				
				//-- Check if the value is not in the valid range --//
				if( !($fPostTimeout>= 0.1) ) {
					//-- Set the invalid value to the default --//
					$fPostTimeout = 200;
				}
			} catch( Exception $e0029 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0130' \n";
				$sErrMesg .= "Incorrect \"Timeout\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Timeout\" parameter\n";
				$sErrMesg .= "eg. \n \"200\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve "CapabilitiesType"          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="NetAddressListCapabilities" || $sPostMode==="LookupCapabilities" ) {
			try {
				//-- Retrieve the "CapabilitiesType" --//
				$sPostCapabilitiesType = $aHTTPData["CapabilitiesType"];
				
				//-- Check if the value is not in the valid range --//
				if( 
					$sPostCapabilitiesType!=="All"      && $sPostCapabilitiesType!=="Analytics" && 
					$sPostCapabilitiesType!=="Device"   && $sPostCapabilitiesType!=="Events"    && 
					$sPostCapabilitiesType!=="Imaging"  && $sPostCapabilitiesType!=="Media"     && 
					$sPostCapabilitiesType!=="PTZ" 
				) {
					//-- Set the invalid value to the default --//
					$sPostCapabilitiesType = "All";
				}
			} catch( Exception $e0029 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0132' \n";
				$sErrMesg .= "Incorrect \"CapabilitiesType\" parameter!\n";
				$sErrMesg .= "Please use a valid \"CapabilitiesType\" parameter\n";
				$sErrMesg .= "eg. \n \"All\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve Stream Authentication       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="NewThing" || $sPostMode==="ChangeThingProfiles" || $sPostMode==="ChangeStreamAuth" ) {
			try {
				//-- Retrieve the "CapabilitiesType" --//
				$sPostStreamAuth = $aHTTPData["StreamAuth"];
				
				if( $sPostStreamAuth!=="" && $sPostStreamAuth!==false && $sPostStreamAuth!==null ) {
					//------------------------------------------------//
					//-- "StreamAuth" JSON Parsing                  --//
					//------------------------------------------------//
					$aPostStreamAuth = json_decode( $sPostStreamAuth, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostStreamAuth===null  ) {
						$aPostStreamAuth = false;
					}
				} else {
					$aPostStreamAuth = false;
				}
				
			} catch( Exception $e0134 ) {
				$bError    = true;
				$iErrCode  = 134;
				$sErrMesg .= "Error Code:'0134' \n";
				$sErrMesg .= "Problem with the \"StreamAuth\" parameter!\n";
				$sErrMesg .= "Please use a valid JSON \"StreamAuth\" parameter.\n";
				$sErrMesg .= "eg. \n { \"Username\":\"Owner\", \"Password\":\"*******\" } \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve Room Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" ) {
			try {
				//-- Retrieve the "RoomId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false || !($iPostRoomId>=1) ) {
					//-- Use default if none is specified --//
					$iPostRoomId = -1;
				}
				
			} catch( Exception $e0136 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0136' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve Room Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewOnvifServer" ) {
			try {
				$sPostDisplayname = $aHTTPData["DisplayName"];
				
				if( $sPostDisplayname===false ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'0137' \n";
					$sErrMesg .= "Invalid \"DisplayName\" parameter! \n";
					$sErrMesg .= "Please use a valid \"DisplayName\" parameter\n";
					$sErrMesg .= "eg. \n \"Home Onvif Server\", \"Work Onvif Server\" or \"Front Door Camera\" \n\n";
				}
				
			} catch( Exception $e0138 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0138' \n";
				$sErrMesg .= "Incorrect \"DisplayName\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DisplayName\" parameter\n";
				$sErrMesg .= "eg. \n \"Home Onvif Server\", \"Work Onvif Server\" or \"Front Door Camera\" \n\n";
			}
		}
	}
	
	
	if( $bError===false ) {
		if( $sPostMode==="ChangeUIPTZControls" ) {
			try {
				$sPostNewUIControlValue = $aHTTPData["NewUIControlValue"];
				
				if( $sPostNewUIControlValue!==0 && $sPostNewUIControlValue!==1 ) {
					$bError    = true;
					$iErrCode  = 139;
					$sErrMesg .= "Error Code:'0139' \n";
					$sErrMesg .= "Invalid \"NewUIControlValue\" parameter! \n";
					$sErrMesg .= "Please use a valid \"NewUIControlValue\" parameter\n";
					$sErrMesg .= "eg. \n 0 or 1 \n\n";
				}
				
			} catch( Exception $e0140 ) {
				$bError = true;
				$iErrCode  = 140;
				$sErrMesg .= "Error Code:'0140' \n";
				$sErrMesg .= "Incorrect \"NewUIControlValue\" parameter!\n";
				$sErrMesg .= "Please use a valid \"NewUIControlValue\" parameter\n";
				$sErrMesg .= "eg. \n 0 or 1 \n\n";
			}
		}
	}
}



//====================================================================//
//== 4.0 - PREPARATION FOR MAIN SECTION                             ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 4.1 - Check if the Modes is supported in demo mode         ==//
		//================================================================//
		if( $oRestrictedApiCore->CheckIfDemoMode() ) {
			//-- IF Mode is unsupported --//
			if( 
				$sPostMode==="AddNewOnvifServer"             && $sPostMode==="ListServerInfo"                && 
				$sPostMode==="NewThing"                      && $sPostMode==="PTZAbsoluteMove"               && 
				$sPostMode==="PTZTimedMove"                  && $sPostMode==="LookupVideoSources"            && 
				$sPostMode==="LookupProfiles"                
			) {
				$bError    = true;
				$iErrCode  = 0310;
				$sErrMesg .= "Error Code:'0310' \n";
				$sErrMesg .= "This feature is not supported while the iOmy server is in demonstration mode!";
			}
		}
		
		//================================================================//
		//== 4.2 - Lookup Hub and Comm Info                             ==//
		//================================================================//
		if( $sPostMode==="AddNewOnvifServer" ) {
			//-- Lookup the "API Comm" Type to be used to be compared --//
			$iAPICommTypeId = LookupFunctionConstant("APICommTypeId");
			
			
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
			
			
			
			//--------------------------------------------------------------------//
			//-- 4.2.5 - Check if the device Supports Onvif                     --//
			//--------------------------------------------------------------------//
			if( $bError===false ) {
				$bResult = CheckIfDeviceSupportsOnvif( $sPostNetworkAddress, $iPostNetworkPort );
				
				if( $bResult===false ) {
					$bError    = true;
					$iErrCode  = 1202;
					$sErrMesg .= "Error Code:'1202' \n";
					$sErrMesg .= "Device isn't a valid Onvif Server! \n";
					$sErrMesg .= "Please use the network address and port of a valid Onvif Server! \n";
				}
			}
		}
		
		//================================================================//
		//== 4.4 - Lookup Thing Info                                    ==//
		//================================================================//
		if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" || $sPostMode==="ChangeThingProfiles" || $sPostMode==="ChangeStreamAuth" || $sPostMode==="ChangeUIPTZControls" ) {
			
			$iOnvifThingTypeId = LookupFunctionConstant("OnvifThingTypeId");
			
			//----------------------------------------------------------------------------//
			//-- 4.4.1 - Lookup Thing Information                                       --//
			//----------------------------------------------------------------------------//
			$aTempFunctionResult1 = GetThingInfo( $iPostThingId );
			
			if( $aTempFunctionResult1['Error']===false ) {
				$iThingTypeId       = $aTempFunctionResult1['Data']['ThingTypeId'];
				$iPostLinkId        = $aTempFunctionResult1['Data']['LinkId'];
				$bWritePerm         = $aTempFunctionResult1['Data']['PermWrite'];
				$sOnvifProfileName  = $aTempFunctionResult1['Data']['ThingSerialCode'];
				
				if( $iThingTypeId!==$iOnvifThingTypeId ) {
					//-- The ThingId that the user passed is not a Onvif Stream --//
					$bError     = true;
					$iErrCode   = 0340;
					$sErrMesg  .= "Error Code:'0340' \n";
					$sErrMesg  .= "The specified Thing is not a Onvif Stream!\n";
					$sErrMesg  .= "Please use the ThingId of a valid Onvif Stream.\n";
				}
				
			} else {
				//-- ERROR: Could not get Thing Info --//
				$bError     = true;
				$iErrCode   = 0341;
				$sErrMesg  .= "Error Code:'0341' \n";
				$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
				$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
			}
		}
		
		
		//================================================================//
		//== 4.5 - Lookup Link Info                                     ==//
		//================================================================//
		if( 
			$sPostMode==="LookupVideoSources"   || $sPostMode==="NewThing"             || 
			$sPostMode==="PTZAbsoluteMove"      || $sPostMode==="PTZTimedMove"         || 
			$sPostMode==="LookupProfiles"       || $sPostMode==="ListServerInfo"       || 
			$sPostMode==="ChangeThingProfiles"  || $sPostMode==="LookupCapabilities"   ||
			$sPostMode==="ChangeStreamAuth"     || $sPostMode==="ChangeUIPTZControls"  
		) {
			//----------------------------------------------------------------------------//
			//-- STEP 2: Look up the details to the "Link" that belongs to that "Thing" --//
			//----------------------------------------------------------------------------//
			if( $bError===false ) {
				//-- Fetch the Info about the Link --//
				$aTempFunctionResult2 = GetLinkInfo( $iPostLinkId );
				
				//-- Extract the desired variables out of the results --//
				if( $aTempFunctionResult2['Error']===false ) {
					//-- Extract the Desired Variables --//
					
					//-- Extract the required variables from the function results --//
					$sPostNetworkAddress    = $aTempFunctionResult2['Data']['LinkConnAddress'];
					$iPostNetworkPort       = $aTempFunctionResult2['Data']['LinkConnPort'];
					$sPostUsername          = $aTempFunctionResult2['Data']['LinkConnUsername'];
					$sPostPassword          = $aTempFunctionResult2['Data']['LinkConnPassword'];
					$iLinkPermWrite         = $aTempFunctionResult2['Data']['PermWrite'];
					
					//-- Flag that this request needs to use the "PhilipsHue" PHP Object to update the device --//
					$bUsePHPObject = true;
					
					//-- Lookup the Comm Info --//
					$aCommInfo = GetCommInfo( $aTempFunctionResult2['Data']['LinkCommId'] );
					
					//--  --//
					if( $aCommInfo['Error']===false ) {
						$iLinkCommType          = $aCommInfo['Data']['CommTypeId'];
						
					} else {
						$bError = true;
						$iErrCode  = 0350;
						$sErrMesg .= "Error Code:'0350' \n";
						$sErrMesg .= "Problem when fetching the Link Comm Info\n";
						$sErrMesg .= $aCommInfo['ErrMesg'];
					}
					
				} else {
					$bError = true;
					$iErrCode  = 0351;
					$sErrMesg .= "Error Code:'0351' \n";
					$sErrMesg .= "Problem when fetching the Link info\n";
					$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
				}
			}	//-- ENDIF No errors detected --//
		}	//-- ENDIF --//
		
		
		//----------------------------------------------------------------------------//
		//-- 4.6 - ESTABLISH THE PHP ONVIF OBJECT                                   --//
		//----------------------------------------------------------------------------//
		if( $bError===false ) {
			if( 
				$sPostMode==="AddNewOnvifServer"        || $sPostMode==="NewThing"                 || 
				$sPostMode==="NetworkAddressServerInfo" || $sPostMode==="ListServerInfo"           || 
				$sPostMode==="LookupVideoSources"       || $sPostMode==="LookupProfiles"           || 
				$sPostMode==="PTZAbsoluteMove"          || $sPostMode==="PTZTimedMove"             || 
				$sPostMode==="PTZTimedMove"             || $sPostMode==="ChangeThingProfiles"      || 
				$sPostMode==="LookupCapabilities"       || $sPostMode==="ChangeStreamAuth"         || 
				$sPostMode==="ChangeUIPTZControls"      
			) {
				//--------------------------------------------------------------------//
				//-- 4.6.1 - Check if a PHPOnvif class can be created for that IP   --//
				//--------------------------------------------------------------------//
				$oPHPOnvifClient = new PHPOnvif( $sPostNetworkAddress, $iPostNetworkPort, $sPostUsername, $sPostPassword );
				
				if( $oPHPOnvifClient->bInitialised===false ) {
					$bError = true;
					$iErrCode  = 0360;
					$sErrMesg .= "Error Code:'0360'\n";
					$sErrMesg .= "Couldn't initialise Onvif Class!\n";
					$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
				}
			}
		}	//-- ENDIF No errors detected --//
		
	} catch( Exception $e0300 ) {
		$bError = true;
		$iErrCode  = 0300;
		$sErrMesg .= "Error Code:'0300' \n";
		$sErrMesg .= $e0300->getMessage();
	}
}



//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Check IP Address for Onvif                     ==//
		//================================================================//
		if( $sPostMode==="NetAddressCheckForOnvif" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Check if  Device Supports Onvif                        --//
				//--------------------------------------------------------------------//
				$bResult = CheckIfDeviceSupportsOnvif( $sPostNetworkAddress, $iPostNetworkPort );
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Prepare the Result                                     --//
				//--------------------------------------------------------------------//
				$aResult = array(
					"Error"             => true,
					"SupportsOnvif"     => $bResult
				);
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Lookup Device Time or Capabilities             ==//
		//================================================================//
		} else if( $sPostMode==="NetAddressLookupDeviceTime" || $sPostMode==="NetAddressListCapabilities" || $sPostMode==="LookupCapabilities" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - INITIALISE THE ONVIF CLIENT                            --//
				//--------------------------------------------------------------------//
				$oPHPOnvifClient        = new PHPOnvif( $sPostNetworkAddress, $iPostNetworkPort, $sPostUsername, $sPostPassword );
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - FETCH RESULTS                                          --//
				//--------------------------------------------------------------------//
				if( $oPHPOnvifClient->bInitialised===true ) {
					
					//----------------------------------------------------//
					//-- IF Mode is NetAddressLookupDeviceTime          --//
					//----------------------------------------------------//
					if( $sPostMode==="NetAddressLookupDeviceTime" ) {
						$aTempFunctionResult    = $oPHPOnvifClient->GetDeviceDateAndTime();
						$aResult                = $oPHPOnvifClient->ExtractDeviceDateAndTime( $aTempFunctionResult );
						
					//----------------------------------------------------//
					//-- ELSEIF Mode is a variant of Capabilities       --//
					//----------------------------------------------------//
					} else if( $sPostMode==="NetAddressListCapabilities" || $sPostMode==="LookupCapabilities" ) {
						//-- Fetch Capabilities --//
						$aTempFunctionResult    = $oPHPOnvifClient->GetAllCapabilities( $sPostCapabilitiesType );
						
						//--------------------------------------------//
						//-- IF no errors have occurred             --//
						//--------------------------------------------//
						if( $aTempFunctionResult['Error']===false ) {
							$aResult = $aTempFunctionResult['Result'];
							
						//----------------------------------------------------------------//
						//-- ELSE error display a message indicating what went wrong    --//
						//----------------------------------------------------------------//
						} else {
							$bError = true;
							$sErrMesg .= "Error Code:'2401' \n";
							$sErrMesg .= "Couldn't initialise Onvif Class!\n";
							$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
						}
					}
				} else {
					//------------------------------------------------------------//
					//-- ERROR: Display a message indicating what went wrong    --//
					//------------------------------------------------------------//
					$bError = true;
					$sErrMesg .= "Error Code:'2402' \n";
					$sErrMesg .= "Couldn't initialise Onvif Class!\n";
					$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
			
		//================================================================//
		//== 5.3 - MODE: Lookup Device Information                      ==//
		//================================================================//
		} else if( $sPostMode==="NetworkAddressServerInfo" || $sPostMode==="ListServerInfo" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Connect to the Onvif Device                            --//
				//--------------------------------------------------------------------//
				$oPHPOnvifClient    = new PHPOnvif( $sPostNetworkAddress, $iPostNetworkPort, $sPostUsername, $sPostPassword );
				
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Fetch the Capabilities of the Onvif Device             --//
				//--------------------------------------------------------------------//
				if( $oPHPOnvifClient->bInitialised===true ) {
					//-- Fetch Device --//
					$aTempFunctionResult2        = $oPHPOnvifClient->GetDeviceInformation();
					
					if( $aTempFunctionResult2['Error']===false ) {
						$aTempFunctionResult3    = $oPHPOnvifClient->ExtractDeviceInformation( $aTempFunctionResult2['Result'] );
						
						if( $aTempFunctionResult3['Error']===false ) {
							$aResult = $aTempFunctionResult3;
							
						} else {
							//--  --//
							$bError    = true;
							$sErrMesg .= "Error Code:'3403'\n";
							$sErrMesg .= "Couldn't initialise Onvif Class!\n";
						}
						
					} else {
						//-- ERROR: Display a message indicating what went wrong --//
						$bError    = true;
						$sErrMesg .= "Error Code:'3402'\n";
						$sErrMesg .= "Couldn't initialise Onvif Class!\n";
					}
					
				} else {
					//-- ERROR: Display a message indicating what went wrong --//
					$bError    = true;
					$sErrMesg .= "Error Code:'3401'\n";
					$sErrMesg .= "Couldn't initialise Onvif Class!\n";
					$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
				}
				
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
		//================================================================//
		//== 5.4 - MODE: Lookup Video Sources                           ==//
		//================================================================//
		} else if( $sPostMode==="LookupVideoSources" ) {
			try {
				if( $bError===false ) {
					$aTempFunctionResult    = $oPHPOnvifClient->GetVideoSources();
					
					if( $aTempFunctionResult['Error']===false ) {
						$aResult = $oPHPOnvifClient->ExtractVideoSources( $aTempFunctionResult['Result'] );
						
					} else {
						$bError = true;
						$sErrMesg .= "Error Code:'4401' \n";
						$sErrMesg .= $oPHPOnvifClient['ErrMesg'];
					}
				}
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
			
		//================================================================//
		//== 5.5 - MODE: Lookup Profiles and Streams                    ==//
		//================================================================//
		} else if( $sPostMode==="LookupProfiles" ) {
			try {
				$aTempFunctionResult    = $oPHPOnvifClient->GetProfiles();
				
				if( $aTempFunctionResult['Error']===false ) {
					
					//-- Debugging --//
					//echo "\n-- dumping profile response --\n";
					//echo json_encode( $aTempFunctionResult['Result'] );
					//echo "\n\n";
					
					$aProfiles = $oPHPOnvifClient->ExtractProfiles( $aTempFunctionResult['Result'] );
					
					
					if( $aProfiles['Error']===true ) {
						$bError = true;
						$sErrMesg .= "Error Code:'5401' \n";
						$sErrMesg .= "Failed to extract the Onvif Profiles!\n";
					}
				} else {
					$bError = true;
					$sErrMesg .= "Error Code:'5402' \n";
					$sErrMesg .= "Failed to fetch the Onvif Profiles!\n";
				}
				
				//--------------------------------------------------------------------//
				//-- 5.5.3 - Fetch each Stream Uri from each profile                --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//------------------------------------//
					//-- FOREACH Profile                --//
					//------------------------------------//
					foreach( $aProfiles['Data'] as $Key => $aProfile ) {
						//----------------//
						//-- RTSP       --//
						//----------------//
						$aStreamUri = $oPHPOnvifClient->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
						
						if( $aStreamUri['Error']===false ) {
							if( isset( $aStreamUri['Uri'] ) ) {
								$aProfiles['Data'][$Key]['Uri_RTSP'] = $aStreamUri['Uri'];
								
								//var_dump( $aStreamUri['Uri'] );
								//echo "\n\n";
							}
						}
						
						//----------------//
						//-- TCP        --//
						//----------------//
						//$aStreamUri = $oPHPOnvifClient->GetAndExtractStreamURI( $aProfile, 'TCP', false );
						
						//if( $aStreamUri['Error']===false ) {
						//	if( isset( $aStreamUri['Uri'] ) ) {
						//		$aProfiles['Data'][$Key]['Uri_TCP'] = $aStreamUri['Uri'];
								
								//var_dump( $aStreamUri['Uri'] );
								//echo "\n\n";
						//	}
						//}
						
						//----------------//
						//-- UDP        --//
						//----------------//
						//$aStreamUri = $oPHPOnvifClient->GetAndExtractStreamURI( $aProfile, 'UDP', false );
						
						//if( $aStreamUri['Error']===false ) {
						//	if( isset( $aStreamUri['Uri'] ) ) {
						//		$aProfiles['Data'][$Key]['Uri_UDP'] = $aStreamUri['Uri'];
								
								//var_dump( $aStreamUri['Uri'] );
								//echo "\n\n";
						//	}
						//}
						
						//----------------//
						//-- HTTP       --//
						//----------------//
						//$aStreamUri = $oPHPOnvifClient->GetAndExtractStreamURI( $aProfile, 'HTTP', false );
						
						//if( $aStreamUri['Error']===false ) {
						//	if( isset( $aStreamUri['Uri'] ) ) {
						//		$aProfiles['Data'][$Key]['Uri_HTTP'] = $aStreamUri['Uri'];
								
								//var_dump( $aStreamUri['Uri'] );
								//echo "\n\n";
						//	}
						//}
					}
					
					//------------------------------------//
					//-- RETURN THE RESULT              --//
					//------------------------------------//
					$aResult = $aProfiles;
				}
			} catch( Exception $e5400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'5400' \n";
				$sErrMesg .= $e5400->getMessage();
			}
			
		//================================================================//
		//== 5.6 - MODE: Add New LINK or THING                          ==//
		//================================================================//
		} else if( 
			$sPostMode==="AddNewOnvifServer"    || $sPostMode==="NewThing"             || 
			$sPostMode==="ChangeThingProfiles"  || $sPostMode==="ChangeStreamAuth"     || 
			$sPostMode==="ChangeUIPTZControls"  
		) {
			try {
				if( $sPostMode==="AddNewOnvifServer" ) {
					//--------------------------------------------------------------------//
					//-- Add the Bridge to the database                                 --//
					//--------------------------------------------------------------------//
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
							$iErrCode  = 6401+$aTempFunctionResult2['ErrCode'];
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem when adding the new Comm to the database.\n";
							$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
						}
					}
					
					//--------------------------------------------------------------------//
					//-- Add the Bridge to the database                                 --//
					//--------------------------------------------------------------------//
					$aResult = $oPHPOnvifClient->AddThisBridgeToTheDatabase( $iCommId, $iPostRoomId, $sPostDisplayname );
					
					if( $aResult['Error']===true ) {
						$bError = true;
						$sErrMesg .= "Error Code:'6431' \n";
						$sErrMesg .= "Error occurred while submitting the Link into the Database.\n";
						$sErrMesg .= $aResult['ErrMesg'];
					}
					
				} else if( $sPostMode==="NewThing" ) {
					//--------------------------------------------------------------------//
					//-- Lookup if the User has the "Write" Permission to the Device    --//
					//--------------------------------------------------------------------//
					if( $iLinkPermWrite!==1 ) {
						$bError = true;
						$sErrMesg .= "Error Code:'6432' \n";
						$sErrMesg .= "Permission issue detected!\n";
						$sErrMesg .= "The User doesn't appear to have the \"Write\" permission to add a Thing.\n";
					}
					
					//--------------------------------------------------------------------//
					//-- Add the stream to the database                                 --//
					//--------------------------------------------------------------------//
					if( $bError===false ) {
						//--------------------------------//
						//-- Create the Profile         --//
						//--------------------------------//
						$aResult = $oPHPOnvifClient->AddStreamsAsThingInDatabase( $iPostLinkId, $sPostStreamProfileName, $sPostThumbProfileName, $sOnvifCameraName, $aPostStreamAuth );
						
						if( $aResult['Error']===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'6433' \n";
							$sErrMesg .= "Error occurred while submitting the Thing into the Database\n";
							$sErrMesg .= $aResult['ErrMesg'];
						}
					}
					
				} else if( $sPostMode==="ChangeThingProfiles" ) {
					//--------------------------------------------------------------------//
					//-- Lookup if the User has the "Write" Permission to the Device   --//
					//--------------------------------------------------------------------//
					if( $iLinkPermWrite!==1 ) {
						$bError = true;
						$sErrMesg .= "Error Code:'6434' \n";
						$sErrMesg .= "Permission issue detected!\n";
						$sErrMesg .= "The User doesn't appear to have the \"Write\" permission to add a Thing.\n";
					}
					
					//--------------------------------------------------------------------//
					//-- Add the stream to the database                                 --//
					//--------------------------------------------------------------------//
					if( $bError===false ) {
						//--------------------------------//
						//-- Create the Profile         --//
						//--------------------------------//
						$aResult = $oPHPOnvifClient->EditThingStreamsInDatabase( $iPostThingId, $iPostLinkId, $sPostStreamProfileName, $sPostThumbProfileName, $aPostStreamAuth );
						
						if( $aResult['Error']===true ) {
							$bError = true;
							//$sErrMesg .= "Error Code:'6435' \n";
							//$sErrMesg .= "Error occurred while submitting the Thing into the Database\n";
							$sErrMesg .= $aResult['ErrMesg'];
						}
					}
				} else if( $sPostMode==="ChangeStreamAuth" ) {
					//--------------------------------------------------------------------//
					//-- Lookup if the User has the "Write" Permission to the Device    --//
					//--------------------------------------------------------------------//
					if( $iLinkPermWrite!==1 ) {
						$bError = true;
						$sErrMesg .= "Error Code:'6500' \n";
						$sErrMesg .= "Permission issue detected!\n";
						$sErrMesg .= "The User doesn't appear to have the \"Write\" permission to add a Thing.\n";
					}
					
					//--------------------------------------------------------------------//
					//-- Add the stream to the database                                 --//
					//--------------------------------------------------------------------//
					if( $bError===false ) {
						//--------------------------------//
						//-- Create the Profile         --//
						//--------------------------------//
						$aResult = $oPHPOnvifClient->EditThingAuthTypeInDB( $iPostThingId, $iPostLinkId, $aPostStreamAuth );
						
						if( $aResult['Error']===true ) {
							$bError = true;
							$iErrCode  = $aResult['ErrCode'];
							$sErrMesg .= $aResult['ErrMesg'];
						}
					}
					
				} else if( $sPostMode==="ChangeUIPTZControls" ) {
					//--------------------------------------------------------------------//
					//-- Lookup if the User has the "Write" Permission to the Device    --//
					//--------------------------------------------------------------------//
					if( $iLinkPermWrite!==1 ) {
						$bError = true;
						$sErrMesg .= "Error Code:'6550' \n";
						$sErrMesg .= "Permission issue detected!\n";
						$sErrMesg .= "The User doesn't appear to have the \"Write\" permission to add a Thing.\n";
					}
					
					//--------------------------------------------------------------------//
					//-- Add the stream to the database                                 --//
					//--------------------------------------------------------------------//
					if( $bError===false ) {
						//--------------------------------//
						//-- Create the Profile         --//
						//--------------------------------//
						$aResult = $oPHPOnvifClient->EditUIEnabledPTZControls( $iPostThingId, $sPostNewUIControlValue );
						
						if( $aResult['Error']===true ) {
							$bError = true;
							$iErrCode  = $aResult['ErrCode'];
							$sErrMesg .= $aResult['ErrMesg'];
						}
					}
				}
			} catch( Exception $e6400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'6400' \n";
				$sErrMesg .= $e6400->getMessage();
			}
			
		//================================================================//
		//== 5.7 - MODE: PTZ Absolute Move                              ==//
		//================================================================//
		} else if( $sPostMode==="PTZAbsoluteMove" || $sPostMode==="PTZTimedMove" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.7.2 - Check if the "onvif profiles" are accessable           --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aTempFunctionResult	= $oPHPOnvifClient->GetProfiles();
					
					if( $aTempFunctionResult['Error']===false ) {
						$aProfiles = $oPHPOnvifClient->ExtractProfiles( $aTempFunctionResult['Result'] );
						
						if( $aProfiles['Error']===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'7401'\n";
							$sErrMesg .= "Failed to extract the Onvif Profiles!\n";
						}
					} else {
						$bError = true;
						$sErrMesg .= "Error Code:'7402'\n";
						$sErrMesg .= "Failed to fetch the Onvif Profiles!\n";
					}
				}
				
				//--------------------------------------------------------------------//
				//-- 5.7.3 - Perform the PTZ Absolute Move                          --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//--------------------------------------------------------------------//
					//-- IF - Mode is PTZAbsoluteMove                                   --//
					//--------------------------------------------------------------------//
					if( $sPostMode==="PTZAbsoluteMove" ) {
						//--------------------------------------------------------------------//
						//-- 5.7.3 - Perform the PTZ Absolute Move                          --//
						//--------------------------------------------------------------------//
						$aResult   = $oPHPOnvifClient->PTZAbsoluteMove( $sPostProfileName, $sPostOnvifPosX, $sPostOnvifPosY, $sPostOnvifZoom );
						
						if( $aResult['Error']===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'7403' \n";
							$sErrMesg .= "Error occurred while submitting the Thing into the Database\n";
							$sErrMesg .= $aResult['ErrMesg'];
						}
						
					//--------------------------------------------------------------------//
					//-- ELSEIF - Mode is PTZTimedMove                                  --//
					//--------------------------------------------------------------------//
					} else if( $sPostMode==="PTZTimedMove" ) {
						
						//--------------------------------------------------------------------//
						//-- 5.8.4 - Perform the PTZ Timed Move                             --//
						//--------------------------------------------------------------------//
						if( $bError===false ) {
							//-- Emulate a "RelativeMove" with a "ContinousMove" and a "Stop" Command. --//
							$aTempFunctionResult   = $oPHPOnvifClient->PTZContinousMove( $sPostProfileName, $sPostOnvifPosX, $sPostOnvifPosY );
							
							//-- If the "ContinousMove" is successful --//
							if( $aTempFunctionResult['Error']===false ) {
								//-- Calculate the Microsecond value from the Millisecond timeout value --//
								$fMicroseconds = $fPostTimeout * 1000;
								
								//-- Wait several milliseconds before stopping --//
								usleep( $fMicroseconds );
								
								//-- Execute the "Onvif PTZ Stop" --//
								$aResult = $oPHPOnvifClient->PTZStop( $sPostProfileName );
								
							}
						}
					}	//-- ENDELSEIF - Mode is PTZTimedMove --//
				}
			} catch( Exception $e7400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'7400' \n";
				$sErrMesg .= $e7400->getMessage();
			}
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Problem with the 'Mode' Parameter! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}
//====================================================================//
//== 8.0 - Log the Results                                          ==//
//====================================================================//




//====================================================================//
//== 9.0 - Finalise                                                 ==//
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
		$sOutput  = "Error Code:'0004'!\n Critical Error has occured!";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!";
	}
}




?>