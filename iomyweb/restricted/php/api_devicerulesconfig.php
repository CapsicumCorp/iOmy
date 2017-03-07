<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used for telnet commands to the Hub.
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
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.  --//
$iPostHubId                 = 0;            //-- INTEGER:       This is used to store which HubId that should be telnetted to. --//
$sPostConfig                = "";           //-- STRING:        --//
$aPostConfig                = array();      //-- ARRAY:         --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.  --//
$sNetworkAddress            = "";           //-- STRING:        --//
$iNetworkPort               = 0;            //-- INTEGER:       --//
$aHubData                   = array();      //-- ARRAY:         --//
$bFound                     = false;        //-- BOOLEAN:       Used to indicate if a match is found or not. --//
$sFileContents              = "";           //-- STRING:        --//
$aDeviceRulesVariable       = array();      //-- ARRAY:         --//
$sTestFileContents          = "";           //-- STRING:        --//
$sNewConfigFileContents     = 

//- Constants that need to be added to a function in the fuctions library --//
$iWatchInputsHubTypeId      = 0;            //-- INTEGER:       --//
$sDeviceRulesFilename       = "";


//------------------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                          //-- This should call all the additional libraries needed --//
require_once SITE_BASE.'/restricted/libraries/editconfig/device_rules.php'; 


//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iWatchInputsHubTypeId      = LookupFunctionConstant("AndroidWatchInputsHubTypeId");
$sDeviceRulesFilename       = '/sdcard/iOmy/timerules.cfg';



//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//------------------------------------------------------------//
//-- 2.1 - Fetch the Parameters                             --//
//------------------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'RulesConfig',               "DataType"=>'STR' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
}

//------------------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                          --//
//------------------------------------------------------------//
if($bError===false) {
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "FetchConfigArray", "SaveConfigArray" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="FetchConfigArray" && $sPostMode!=="SaveConfigArray" ) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"FetchConfigArray\" or \"SaveConfigArray\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"FetchConfigArray\" or \"SaveConfigArray\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "RulesConfig"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="SaveConfigArray" ) {
			try {
				//-- Retrieve the "RulesConfig" --//
				$sPostConfig = $aHTTPData["RulesConfig"];
				
				if( $sPostConfig===false ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"RulesConfig\" parameter! \n";
					$sErrMesg .= "Please use a valid \"RulesConfig\" parameter.\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"RulesConfig\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RulesConfig\" parameter.";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "HubId"                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="FetchConfigArray" || $sPostMode==="SaveConfigArray" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false ) {
					$bError    = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Non numeric \"HubId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0106 ) {
				$bError = true;
				$iErrCode  = 106;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Non numeric \"HubId\" parameter! \n";
				$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
}

//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		//----------------------------------------------------------------//
		//-- 4.2 - CONVERT JSON STRING "CONFIG" TO AN ARRAY             --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				if( $sPostMode==="SaveConfigArray" ) {
					//------------------------------------------------//
					//-- "CONFIG" JSON PARSING                      --//
					//------------------------------------------------//
					$aPostConfig = json_decode( $sPostConfig, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostConfig===null || $aPostConfig==false ) {
						$bError    = true;
						$iErrCode  = 206;
						$sErrMesg .= "Error Code:'0206' \n";
						$sErrMesg .= "Invalid HTTP POST \"Config\" parameter ";
					}
				}
			} catch( Exception $e0207 ) {
				$bError    = true;
				$iErrCode  = 207;
				$sErrMesg .= "Error Code:'0207' \n";
				$sErrMesg .= "Problem with the HTTP POST \"Config\" parameter! \n";
				$sErrMesg .= $e0207->getMessage();
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 4.3 - Check the HubInfo                                    --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="FetchConfigArray" || $sPostMode==="SaveConfigArray" ) {
				try {
					$aHubData = HubRetrieveInfoAndPermission( $iPostHubId );
					
					if( $aHubData['Error']===false ) {
						//-- Store the Write Permission --//
						$iHubOwnerPerm      = $aHubData['Data']['PermOwner'];
						$iHubWritePerm      = $aHubData['Data']['PermWrite'];
						$sHubName           = $aHubData['Data']['HubName'];
						$sHubIPAddress      = $aHubData['Data']['HubIpaddress'];
						$iHubTypeId         = $aHubData['Data']['HubTypeId'];
						
						if( $iHubOwnerPerm!==1 && $iHubOwnerPerm!=="1" ) {
							$bError    = true;
							$iErrCode  = 211;
							$sErrMesg .= "Error Code:'0211' \n";
							$sErrMesg .= "Insufficient Priviledges.\n";
							$sErrMesg .= "You user is missing the 'Premise Owner' permission.\n";
						
						} else if( $iHubTypeId!==$iWatchInputsHubTypeId ) {
							$bError    = true;
							$iErrCode  = 213;
							$sErrMesg .= "Error Code:'0213' \n";
							$sErrMesg .= "The HubType is not supported by this API.\n";
							$sErrMesg .= "Please use a valid HubId of a supported Hub (Android WatchInputs).\n";
							
						} else if( $sHubIPAddress!=="localhost" && $sHubIPAddress!=="127.0.0.1" ) {
							$bError    = true;
							$iErrCode  = 216;
							$sErrMesg .= "Error Code:'0216' \n";
							$sErrMesg .= "The network address for this Hub does not seem suitable!\n";
							$sErrMesg .= "At this point in time only the webserver's WatchInputs Hub is supported.\n";
						}
						
						//-- Debugging --//
						//var_dump( $aHubData['Data'] );
						
					} else {
						$bError = true;
						$iErrCode  = 217;
						$sErrMesg .= "Error Code:'0217' \n";
						$sErrMesg .= "Problem looking up the Info for the selected Hub\n";
						$sErrMesg .= $aHubData['ErrMesg'];
					}
					
				} catch( Exception $e0218 ) {
					$bError = true;
					$iErrCode  = 218;
					$sErrMesg .= "Error Code:'1218' \n";
					$sErrMesg .= "Critical Error Occurred!\n";
					$sErrMesg .= "Problem occurred when preparing for the main function\n";
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
		//== 5.1 - MODE: Get Config array from the file                 ==//
		//================================================================//
		if( $sPostMode==="FetchConfigArray" ) {
			try {
				
				if( file_exists( $sDeviceRulesFilename ) ) {
					//--------------------------------------------//
					//-- Get the contents of the Config file    --//
					//--------------------------------------------//
					$sFileContents        = file_get_contents( $sDeviceRulesFilename );
					
					//--------------------------------------------//
					//-- Parse the Config                       --//
					//--------------------------------------------//
					$aDeviceRulesVariable = SpecialConfigParser( $sFileContents );
					
					//--------------------------------------------//
					//-- Prepare the Results                    --//
					//--------------------------------------------//
					if( count($aDeviceRulesVariable) >=1 ) {
						$aResult = array(
							"Error" => false,
							"Data"  => $aDeviceRulesVariable
						);
					} else {
						$bError     = true;
						$iErrCode   = 1402;
						$sErrMesg  .= "Error Code:'1402' \n";
						$sErrMesg  .= "The Device Rules file doesn't appear to be setup!\n";
					}
				} else {
					$bError     = true;
					$iErrCode   = 1401;
					$sErrMesg  .= "Error Code:'1401' \n";
					$sErrMesg  .= "Problem finding the Device Rules Config file!\n";
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e1400->getMessage();
			}
		
		//================================================================//
		//== 5.2 - MODE:                  ==//
		//================================================================//
		} else if( $sPostMode==="SaveConfigArray" ) {
			try {
				if( file_exists( $sDeviceRulesFilename ) ) {
					//-- Build the file contents from the array --//
					$sNewConfigFileContents = ConfigCreateFromArray( $aPostConfig );
					
					//-- Save the Data in to the file --//
					$iTemp = file_put_contents($sDeviceRulesFilename, $sNewConfigFileContents );
					
					if( $iTemp!==null && $iTemp!==false ) {
						
						$aResult = array(
							"Error"      => false,
							"Data"       => array(
								"Success" => true
							)
						);
						
						
					} else {
						$bError     = true;
						$iErrCode   = 2401;
						$sErrMesg  .= "Error Code:'2401' \n";
						$sErrMesg  .= "Problem finding the Device Rules Config file!\n";
					}
				} else {
					$bError     = true;
					$iErrCode   = 2401;
					$sErrMesg  .= "Error Code:'2401' \n";
					$sErrMesg  .= "Problem finding the Device Rules Config file!\n";
				}
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 2400;
				$sErrMesg  .= "Error Code:'2400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e2400->getMessage();
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