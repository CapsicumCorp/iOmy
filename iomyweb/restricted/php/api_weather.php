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
$iErrCode                   = 0;            //-- INTEGER:       --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//
$aRequiredParmaters         = array();      //-- ARRAY:         Used to store which HTTP POST Parameters to look for --//
$aHTTPData                  = array();      //-- ARRAY:         --//

$sPostMode                  = "";           //-- STRING:        --//
$sPostWeatherType           = "";           //-- STRING:        --//
$sPostStationCode           = "";           //-- STRING:        --//
$sPostUsername              = "";           //-- STRING:        --//
$iPostRoomId                = 0;            //-- INTEGER:       --//
$iPostThingId               = 0;            //-- INTEGER:       --//
$iPostHubId                 = 0;            //-- INTEGER:       --//
$sPostData                  = "";           //-- STRING:        --//
$aPostData                  = array();      //-- ARRAY:         --//


$iPremiseId                 = 0;            //-- INTEGER:       --//
$iPermRoomWrite             = 0;            //-- INTEGER:       --//
$iWeatherStationIOId        = 0;            //-- INTEGER:       --//

$iTemperatureIOId           = 0;            //-- INTEGER:       --//
$iHumidityIOId              = 0;            //-- INTEGER:       --//
$iPressureIOId              = 0;            //-- INTEGER:       --//
$iConditionsIOId            = 0;            //-- INTEGER:       --//
$iWindDirectionIOId         = 0;            //-- INTEGER:       --//
$iWindSpeedIOId             = 0;            //-- INTEGER:       --//
$bFound                     = false;        //-- BOOLEAN:       --//
$iCommId                    = 0;            //-- INTEGER:       --//
$iAPICommTypeId             = 0;            //-- INTEGER:       --//
$iWeatherStationRSTypeId    = 0;            //-- INTEGER:       --//

$iTemperatureRSTypeId       = 0;            //-- INTEGER:       --//
$iHumidityRSTypeId          = 0;            //-- INTEGER:       --//
$iPressureRSTypeId          = 0;            //-- INTEGER:       --//
$iConditionsRSTypeId        = 0;            //-- INTEGER:       --//
$iWindDirectionRSTypeId     = 0;            //-- INTEGER:       --//
$iWindSpeedRSTypeId         = 0;            //-- INTEGER:       --//
$sLinkSerial                = "";           //-- STRING:        --//
$sStationCode               = "";           //-- STRING:        --//

$aNewCommData               = array();      //-- ARRAY:         --//
$aRoomInfo                  = array();      //-- ARRAY:         --//
$aCommsLookup               = array();      //-- ARRAY:         --//
$aLinkData                  = array();      //-- ARRAY:         --//
$aLinkResult                = array();      //-- ARRAY:         --//
$aWeatherIOs                = array();      //-- ARRAY:         --//
$aStationCodeResult         = array();      //-- ARRAY:         --//
$aTempFunctionResult        = array();      //-- ARRAY:         --//
$aCommInfo                  = array();      //-- ARRAY:         Used to hold the Comm Info--//

$bTransactionStarted        = false;        //-- BOOLEAN:       --//
$bTemp1                     = false;        //-- BOOLEAN:       --//
$bTemp2                     = false;        //-- BOOLEAN:       --//
$iTemp1                     = 0;            //-- INTEGER:       A variable for storing temporary values for parsing purposes --//
$sTemp1                     = "";           //-- STRING:        --//
$sTemp2                     = "";           //-- STRING:        --//
$sLinkName                  = "";           //-- STRING:        --//


$aWeatherIOsToBeParsed      = array();      //-- ARRAY:         --//
$aWeatherStationResult      = array();      //-- ARRAY:         --//

$oWeather                   = null;         //-- OBJECT:        --//
$aWeatherObjectData         = array();      //-- ARRAY:         --//

$aInsertResult              = array();      //-- ARRAY:         --//






//------------------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//


require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';        //-- This library is used to perform the inserting of a new Onvif Server and Streams into the database --//
require_once SITE_BASE.'/restricted/libraries/weather/owm.php';
require_once SITE_BASE.'/restricted/libraries/weather/demoweather.php';




//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iAPICommTypeId             = LookupFunctionConstant("APICommTypeId");
$iOWMLinkTypeId             = LookupFunctionConstant("OWMLinkTypeId");
$iWeatherThingTypeId        = LookupFunctionConstant("WeatherThingTypeId");
$iWeatherStationRSTypeId    = LookupFunctionConstant("StationRSTypeId");
$iTemperatureRSTypeId       = LookupFunctionConstant("TemperatureRSTypeId");
$iHumidityRSTypeId          = LookupFunctionConstant("HumidityRSTypeId");
$iPressureRSTypeId          = LookupFunctionConstant("PressureRSTypeId");
$iConditionsRSTypeId        = LookupFunctionConstant("ConditionsRSTypeId");
$iWindDirectionRSTypeId     = LookupFunctionConstant("WindDirectionRSTypeId");
$iWindSpeedRSTypeId         = LookupFunctionConstant("WindSpeedRSTypeId");



//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//



//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$aRequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'WeatherType',               "DataType"=>'STR' ),
		array( "Name"=>'Username',                  "DataType"=>'STR' ),
		array( "Name"=>'StationCode',               "DataType"=>'STR' ),
		array( "Name"=>'Data',                      "DataType"=>'STR' ),
		array( "Name"=>'RoomId',                    "DataType"=>'INT' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' )
	);
	$aHTTPData = FetchHTTPDataParameters($aRequiredParmaters);
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
		//-- NOTE: Valid modes are going to be "FetchCurrentWeather", "AddWeatherStation", or "" --//
		
		//-- Verify that the mode is supported --//
		if( 
			$sPostMode!=="FetchCurrentWeather"     && $sPostMode!=="AddWeatherStation"      
		) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"FetchCurrentWeather\", \"AddWeatherStation\" or \"\" \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"FetchCurrentWeather\", \"AddWeatherStation\" or \"\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "WeatherType"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Retrieve the "WeatherType" --//
				$sPostWeatherType = $aHTTPData["WeatherType"];
				
				if( $sPostWeatherType===false ) {
					$bError = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"WeatherType\" parameter! \n";
					$sErrMesg .= "Please use a valid \"WeatherType\" parameter\n";
					$sErrMesg .= "eg. \n \"OpenWeatherMap\", \"\", \"\" \n\n";
				} 
			} catch( Exception $e0104 ) {
				$bError = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"WeatherType\" parameter!\n";
				$sErrMesg .= "Please use a valid \"WeatherType\" parameter\n";
				$sErrMesg .= "eg. \n \"\", \"\", \"\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve Weather "Username"            --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Retrieve the "WeatherType" --//
				$sPostUsername = $aHTTPData["Username"];
				
				if( $sPostUsername===false ) {
					$bError = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Non numeric \"Username\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Username\" parameter\n";
					$sErrMesg .= "eg. \n \"\", \"\", \"\" \n\n";
				} 
			} catch( Exception $e0106 ) {
				$bError = true;
				$iErrCode  = 106;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Username\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Username\" parameter\n";
				$sErrMesg .= "eg. \n \"\", \"\", \"\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.4 - Retrieve "StationCode"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Retrieve the "StationCode" --//
				$sPostStationCode = $aHTTPData["StationCode"];
				
				if( $sPostStationCode===false ) {
					$bError = true;
					$iErrCode  = 107;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"StationCode\" parameter! \n";
					$sErrMesg .= "Please use a valid \"StationCode\" parameter\n";
					$sErrMesg .= "eg. \n \"\", \"\", \"\" \n\n";
				}
				
			} catch( Exception $e0108 ) {
				$bError = true;
				$iErrCode  = 108;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"StationCode\" parameter!\n";
				$sErrMesg .= "Please use a valid \"StationCode\" parameter\n";
				$sErrMesg .= "eg. \n \"\", \"\", \"\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5 - Retrieve Room Id                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Retrieve the "RoomId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false || !($iPostRoomId>=1) ) {
					$bError = true;
					$iErrCode  = 109;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Invalid \"RoomId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0110 ) {
				$bError = true;
				$iErrCode  = 110;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.6 - Retrieve Hub Id                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false || !($iPostHubId>=1) ) {
					$bError = true;
					$iErrCode  = 111;
					$sErrMesg .= "Error Code:'0111' \n";
					$sErrMesg .= "Invalid \"HubId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0112 ) {
				$bError = true;
				$iErrCode  = 112;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"HubId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.7 - Retrieve Thing Id                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="FetchCurrentWeather" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$iErrCode  = 113;
					$sErrMesg .= "Error Code:'0113' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0114 ) {
				$bError = true;
				$iErrCode  = 114;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.8 - Retrieve Data                          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- The 'Data' variable contents changes what based upon what weather type is chosen. --//
		//-- The whole contents is just passed to the specific class that manages that object. --// 
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//-- Extract the 'Data' string from the HTTP Parameters --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
					//------------------------------------------------//
					//-- "ACCESS" JSON PARSING                      --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 115;
						$sErrMesg .= "Error Code:'0115' \n";
						$sErrMesg .= "Invalid POST \"Data\"! \n";
						$sErrMesg .= "Couldn't extract JSON values from the \"Data\" Parameter \n";
					}
					
				} else {
					$bError    = true;
					$iErrCode  = 115;
					$sErrMesg .= "Error Code:'0115' \n";
					$sErrMesg .= "Invalid POST \"Data\" Parameter! \n";
					$sErrMesg .= "Please use a valid \"Data\" Parameter \n";
				}
				
			} catch( Exception $e0116 ) {
				$bError = true;
				$iErrCode  = 116;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter\n";
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
		//== 4.1 - Check to see if the Room exists and what its details ==//
		//================================================================//
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				$aRoomInfo = GetRoomInfoFromRoomId( $iPostRoomId );
				
				if( $aRoomInfo['Error']===false ) {
					//-- Extract the Values --//
					$iPremiseId     = $aRoomInfo['Data']['PremiseId'];
					$iPermRoomWrite = $aRoomInfo['Data']['PermWrite'];
					
				} else {
					$bError = true;
					$sErrMesg .= "Error Code:'0302' \n";
					$sErrMesg .= "Problem looking up Room! \n";
					$sErrMesg .= $aRoomInfo['ErrMesg'];
				}
				
				
			} catch( Exception $e0301 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'0301' \n";
				$sErrMesg .= $e0301->getMessage();
			}
		}
		
		//================================================================//
		//== 4.2 - Check if PHP API Comm has been setup on the Premise  ==//
		//================================================================//
		if( $bError===false ) {
			if( $sPostMode==="AddWeatherStation" ) {
				try {
					$aCommsLookup = GetCommsFromHubId( $iPostHubId );
					
					if( $aCommsLookup['Error']===false ) {
						//-------------------------------------------------------------//
						//-- Check each Comm to see if it matches the "PHP API" Comm --//
						//-------------------------------------------------------------//
						foreach( $aCommsLookup['Data'] as $aComm ) {
							//-- If no errors and no matches found --//
							if( $bError===false && $bFound===false ) {
								//-- Perform the check to see if CommType matches --//
								if( $aComm['CommTypeId']===$iAPICommTypeId ) {
									//-- Match found --//
									$bFound         = true;
									$iCommId        = $aComm['CommId'];
									$iPermRoomWrite = $aComm['PermWrite'];
								}
							}
						}
					} else {
						$bError = true;
						$sErrMesg .= "Error Code:'0304' \n";
						$sErrMesg .= $aCommsLookup['ErrMesg'];
					}
					
				} catch( Exception $e0305 ) {
					//-- Display an Error Message --//
					$bError    = true;
					$sErrMesg .= "Error Code:'0305' \n";
					$sErrMesg .= $e0305->getMessage();
				}
			}
		} //-- ENDIF No errors have occurred --//
		
		//================================================================//
		//== 4.3 - Check the Thing Information                          ==//
		//================================================================//
		if( $bError===false ) {
			if( $sPostMode==="FetchCurrentWeather" ) {
				try {
					$aThingInfo = GetThingInfo( $iPostThingId );
					
					if( $aThingInfo['Error']===false ) {
						$iPostLinkId        = $aThingInfo['Data']['LinkId'];
						$bWritePerm         = $aThingInfo['Data']['PermWrite'];
						$iLinkType          = $aThingInfo['Data']['LinkTypeId'];
						$iThingTypeId       = $aThingInfo['Data']['ThingTypeId'];
						
						//-- If the Link Type is not a Weather Link --//
						if( $iThingTypeId!==$iWeatherThingTypeId ) {
							$bError    = true;
							$sErrMesg .= "Error Code:'0331' \n";
							$sErrMesg .= "The ThingId doesn't isn't attached to a \"Weather\" Thing! ";
							$sErrMesg .= "Please use a valid ThingId! ";
						}
						
					} else {
						$bError    = true;
						$sErrMesg .= "Error Code:'0332' \n";
						$sErrMesg .= $aThingInfo['ErrMesg'];
					}
				} catch( Exception $e0305 ) {
					//-- Display an Error Message --//
					$bError    = true;
					$sErrMesg .= "Error Code:'0330' \n";
					$sErrMesg .= $e0305->getMessage();
				}
			}
		} //-- ENDIF No errors have occurred --//
		
		//================================================================//
		//== 4.4 - Lookup the Link Data                                 ==//
		//================================================================//
		if( $bError===false ) {
			if( $sPostMode==="FetchCurrentWeather" ) {
				//----------------------------------------------------------------------------//
				//-- STEP 1: Lookup Thing Information                                       --//
				//----------------------------------------------------------------------------//
				$aLinkInfo = GetLinkInfo( $iPostLinkId );
				
				if( $aLinkInfo['Error']===false ) {
					
					//-- Extract the required variables from the function results --//
					$sNetworkPort     = $aLinkInfo['Data']['LinkConnPort'];
					$sUserToken       = $aLinkInfo['Data']['LinkConnUsername'];
					
					$aCommInfo = GetCommInfo( $aLinkInfo['Data']['LinkCommId'] );
					
					
					if( $aCommInfo['Error']===false ) {
						//-- Extract the Desired Variables --//
						$iLinkCommType    = $aCommInfo['Data']['CommTypeId'];
						
					} else {
						$bError = true;
						$iErrCode   = 335;
						$sErrMesg  .= "Error Code:'0335' \n";
						$sErrMesg  .= "Problem when looking up the CommInfo!\n";
						$sErrMesg  .= $aLinkInfo['ErrMesg'];
					}
					
				} else {
					$bError = true;
					$iErrCode   = 336;
					$sErrMesg  .= "Error Code:'0336' \n";
					$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
					$sErrMesg  .= $aLinkInfo['ErrMesg'];
				}
				
				//----------------------------------------------------------------------------//
				//-- STEP 2: Lookup WeatherStationCode                                      --//
				//----------------------------------------------------------------------------//
				if( $bError===false ) {
					
					//----------------------------------------------------------------------------//
					//-- IF TYPE: OpenWeatherMap                                                --//
					//----------------------------------------------------------------------------//
					if( $iLinkType===$iOWMLinkTypeId ) {
						//----------------------------------------//
						//-- Setup the Data to the Object       --//
						//----------------------------------------//
						$aWeatherObjectData = array(
							"ObjectState" => "DB",
							"UserToken"   => $sUserToken,
							"LinkId"      => $iPostLinkId,
							"ThingId"     => $iPostThingId
						);
						
						//-- If the iOmy System is currently running in Demo Mode --//
						if( $oRestrictedApiCore->CheckIfDemoMode() ) {
							//--------------------------------------------//
							//-- Load the demonstration weather object  --//
							//--------------------------------------------//
							$oWeather = new Weather_DemoWeather( $aWeatherObjectData );
						} else {
							//--------------------------------------------//
							//-- Load the normal weather object         --//
							//--------------------------------------------//
							$oWeather = new Weather_OpenWeatherMap( $aWeatherObjectData );
						}
						
						if( $oWeather->bInitialised===false ) {
							$bError = true;
							$iErrCode  = 338;
							$sErrMesg .= "Error Code:'0338' \n";
							$sErrMesg .= "Critical error! \n";
							$sErrMesg .= "Failed to initialise weather object. \n";
							
						}
						
					//----------------------------------------------------------------------------//
					//-- ELSE TYPE: Unsupported Weather Object                                  --//
					//----------------------------------------------------------------------------//
					} else {
						$bError    = true;
						$iErrCode  = 339;
						$sErrMesg .= "Error Code:'0339' \n";
						$sErrMesg .= "Unsupported Weather Type!";
					}
				}
			}
		}	//-- ENDIF No errors --//
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
		//== 5.1 - MODE: ADD THE NEW WU Station to the Premise          ==//
		//================================================================//
		if( $sPostMode==="AddWeatherStation" ) {
			try {
				//--------------------------------------------//
				//-- Start the Transaction                  --//
				//--------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				
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
						$aCommResult = PrepareAddNewComm( $aNewCommData, null );
						
						if( $aCommResult['Error']===false ) {
							//-- Extract the CommId from the Results --//
							$iCommId = $aCommResult['CommId'];
							
						} else {
							//-- Display an error --//
							$bError = true;
							$iErrCode  = 1501+$aCommResult['ErrCode'];
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem when adding the new Comm to the database\n";
							$sErrMesg .= $aCommResult['ErrMesg'];
						}
					}
				}
				
				
				//--------------------------------------------------------------------//
				//-- 5.1.4 - If Comm is found then Add the Thing                    --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-------------------------------------------------//
					//-- If the User has permission to edit the room --//
					//-------------------------------------------------//
					if( $iPermRoomWrite===1 ) {
						//-----------------------------------------------------//
						//-- CHECK TO SEE IF THE WEATHER FEED IS SUPPORTED   --//
						//-----------------------------------------------------//
						
						
						//----------------------------------------------------------------------------//
						//-- IF TYPE: OpenWeatherMap                                                --//
						//----------------------------------------------------------------------------//
						if( $sPostWeatherType==="OpenWeatherMap" ) {
							//----------------------------------------//
							//-- Setup the Data to the Object       --//
							//----------------------------------------//
							$aWeatherObjectData = array(
								"ObjectState" => "non-DB",
								"UserToken"   => $sPostUsername,
								"WeatherCode" => $sPostStationCode
							);
							
							//----------------------------------------//
							//-- Create the OpenWeatherMap Object   --//
							//----------------------------------------//
							$oWeather = new Weather_OpenWeatherMap( $aWeatherObjectData );
							
							
							if( $oWeather->bInitialised===true ) {
								
								if( isset($aPostData['Name']) ) {
									$sLinkName = $aPostData['Name'];
								} else {
									$sLinkName = "OWM Feed";
								}
								
								//------------------------------------//
								//-- Add to the Database            --//
								//------------------------------------//
								$aInsertResult = $oWeather->AddThisToTheDatabase( $iCommId, $iPostRoomId, $sLinkName );
								
								if( $aInsertResult['Error']===true ) {
									$bError = true;
									$iErrCode  = 1410;
									$sErrMesg .= "Error Code:'1410' \n";
									$sErrMesg .= "Failed to add the weather feed to the database!\n";
									$sErrMesg .= $aInsertResult['ErrMesg'];
									
								} else {
									//----------------------------------------------------------------//
									//-- Foreach IO add the appropriate value to the database       --//
									//----------------------------------------------------------------//
									if( isset($aInsertResult['Data']['Things']) ) {
										if( isset( $aInsertResult['Data']['Things'][0] ) ) {
											$aWeatherStationResult = $oWeather->UpdateTheWeatherStationCode( $aInsertResult['Data']['Things'][0]['ThingId'], $sPostStationCode );
											
											if( $aWeatherStationResult['Error']===false ) {
												
												$aResult = array(
													"WeatherStation" => $aInsertResult['Data'],
													"WeatherStationData" => $aWeatherStationResult['Data']
												);
												
											} else {
												$bError = true;
												$iErrCode  = 1407;
												$sErrMesg .= "Error Code:'1407' \n";
												$sErrMesg .= "Failed to add the weather feed to the database!";
											}
										} else {
											$bError = true;
											$iErrCode  = 1406;
											$sErrMesg .= "Error Code:'1406' \n";
											$sErrMesg .= "Problem when updating the weatherstationcode.\n";
										} 
									} else {
										$bError = true;
										$iErrCode  = 1405;
										$sErrMesg .= "Error Code:'1405' \n";
										$sErrMesg .= "Problem when updating the weatherstationcode.\n";
									}
								}
								
							} else {
								$bError = true;
								$iErrCode  = 1404;
								$sErrMesg .= "Error Code:'1404' \n";
								$sErrMesg .= "Problem when setting up the Weather Object.\n";
								$sErrMesg .= json_encode( $oWeather->aErrorMessges );
							}
							
						//----------------------------------------------------------------------------//
						//-- ELSE TYPE: Unsupported                                                 --//
						//----------------------------------------------------------------------------//
						} else {
							$bError    = true;
							$iErrCode  = 1402;
							$sErrMesg .= "Error Code:'1402' \n";
							$sErrMesg .= "Unsupported Weather Type!";
						}
						
						
					} else {
						$bError    = true;
						$iErrCode  = 1401;
						$sErrMesg .= "Error Code:'1401' \n";
						$sErrMesg .= "User has no write permission!";
					}	//-- ENDIF User has write permission to a room --//
				}	//-- ENDIF No errors are found --//
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
			//--------------------------------//
			//-- END THE TRANSACTION        --//
			//--------------------------------//
			if( $bError===true ) {
				if( $bTransactionStarted===true ) {
					$oRestrictedApiCore->oRestrictedDB->dbRollback();
				}
			} else {
				if( $bTransactionStarted===true ) {
					$oRestrictedApiCore->oRestrictedDB->dbEndTransaction();
				}
			}
			
			
		//================================================================//
		//== 5.3 - MODE: Fetch the Current Weather                      ==//
		//================================================================//
		} else if( $sPostMode==="FetchCurrentWeather" ) {
			try {
				
				//--------------------------------------------------------------------//
				//-- 5.2.0 - If Comm is found then Add the Thing                    --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aResult = $oWeather->GetMostRecentDBWeather();
					
					if( $aResult['Error']===false ) {
						$iUTS = time();
						
						//-- Only Poll the Weatherstation if 2 hours have passed --//
						if( $aResult['Data']['UTS']<=($iUTS-7200) ) {
							$aResultTemp = $oWeather->PollWeather();
							
							if( $aResultTemp['Error']===false ) {
								$aResult = $oWeather->GetMostRecentDBWeather();
							} else {
								$bError = true;
								$sErrMesg .= "Error: failed to get new values! \n";
								$sErrMesg .= $aResultTemp['ErrMesg'];
							}
						}
						
					//------------------------------------------------------//
					//-- ELSEIF No data has ever been fetched for the IOs --//
					} else if( $aResult['ErrMesg']==="No Data could be found for these IOs") {
						$aResultTemp = $oWeather->PollWeather();
							
						if( $aResultTemp['Error']===false ) {
							
							$aResult = $oWeather->GetMostRecentDBWeather();
						} else {
							$bError = true;
							$sErrMesg .= "Error: failed to get new values! \n";
							$sErrMesg .= $aResultTemp['ErrMesg'];
						}
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
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
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}

//====================================================================//
//== 9.0 - FINALISE                                                 ==//
//====================================================================//

//----------------------------------------//
//-- IF API didn't encounter an Error   --//
//----------------------------------------//
if( $bError===false && $aResult!=false ) {
	try {
		//-- Force the page to JSON --//
		header('Content-Type: application/json');
		
		//-- Convert results to a string --//
		$sOutput .= json_encode( $aResult );
		
		//-- Output results --//
		echo $sOutput;
		
	} catch( Exception $e0001 ) {
		
		//-- The aResult array cannot be turned into a string due to corruption of the array --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 1,
			"ErrMesg" => "Error Code:'0001' \n ".$e0001->getMessage()." "
		);
		
		echo json_encode( $aResult );
	}
	
//----------------------------------------//
//-- ELSE API Error has occurred        --//
//----------------------------------------//
} else {
	//-- Set the page to JSON when an error. Note this can be changed to "text/html" or "test/plain". --//
	header('Content-Type: application/json');
	
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Error Code:'0002' \n No Result!"
		);
		$sOutput = json_encode( $aResult );
		
	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => "Error Code:'0003' \n Critical Error has occured!\n Undefinable Error Message"
		);
		$sOutput = json_encode( $aResult );
		
		
	} else if( $sErrMesg!=false ) {
		//-- Output the Error Message --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => $iErrCode,
			"ErrMesg" => $sErrMesg
		);
		$sOutput = json_encode( $aResult );
		
		
	} else {
		//-- Error Message is blank --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 4,
			"ErrMesg" => "Error Code:'0004' \n Critical Error has occured!"
		);
		$sOutput = json_encode( $aResult );
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 5,
			"ErrMesg" => "Error Code:'0005' \n Critical Error has occured!"
		);
		
		echo json_encode( $aResult );
	}
}


?>