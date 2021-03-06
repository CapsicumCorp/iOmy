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
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code.  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//

$sPostToken                 = "";           //-- STRING:        Used to store the "Philips Hue Bridge" "User Token" that is used for authentication.	--//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//


$bTelnetDebugging           = false;        //-- BOOLEAN:       "CustomTelnetCommand" Mode Only. Used to output the fractions of a second that it took to fetch the data from telnet --//


$aTempFunctionResult1       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult2       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult3       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult4       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult5       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//

$iPostHubId                 = 0;            //-- INTEGER:       This is used to store which HubId that should be telnetted to. --//
$iPostCommId                = 0;            //-- INTEGER:       This is used to store which "Zigbee Comm" to connect to --//
$sNetworkAddress            = "";           //-- STRING:        --//
$iNetworkPort               = 0;            //-- INTEGER:       --//
$bUsePHPObject              = false;        //-- BOOLEAN:       --//
$iUTS                       = 0;            //-- INTEGER:       --//
$aHubData                   = array();      //-- ARRAY:         --//
$bCommNetworkStateFound     = false;        //-- BOOLEAN:       Used to indicate if a Network State for a RapidHA modem was found or not. --//
$bCommNetworkState          = false;        //-- BOOLEAN:       Used to store the current network state that the RapidHa Modem is in. --//

//- Constants that need to be added to a function in the fuctions library --//
$iZigbeeCommTypeId          = 0;            //-- INTEGER:       This is used to hold the Zigbee Comm Type Id to verify if the provided Comm is supported by that mode or not. --//
$iTelnetHubTypeId1          = 0;            //-- INTEGER:       Holds the Hub Type of the only supported Hub Type that can be accessed by telnet. --//

//------------------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/telnet.php';
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//

//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iZigbeeCommTypeId       = LookupFunctionConstant("ZigbeeCommTypeId");
$iTelnetHubTypeId1       = LookupFunctionConstant("AndroidWatchInputsHubTypeId");



//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' ),
		array( "Name"=>'CommId',                    "DataType"=>'INT' ),
		array( "Name"=>'CustomCommand',             "DataType"=>'STR' ),
		//array( "Name"=>'',                          "DataType"=>'INT' ),
		//array( "Name"=>'',                          "DataType"=>'INT' ),
		//array( "Name"=>'',                          "DataType"=>'INT' )
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
		//-- NOTE: Valid modes are going to be "GetRapidHAInfo", "TurnOnZigbeeJoinMode", "RapidHAFormNetwork", "CustomTelnetCommand" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="GetRapidHAInfo" && $sPostMode!=="TurnOnZigbeeJoinMode" && $sPostMode!=="RapidHAFormNetwork" && $sPostMode!=="CustomTelnetCommand" ) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"GetRapidHAInfo\", \"TurnOnZigbeeJoinMode\", \"RapidHAFormNetwork\" or \"CustomTelnetCommand\" \n\n";
		}
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"GetRapidHAInfo\", \"TurnOnZigbeeJoinMode\", \"RapidHAFormNetwork\" or \"CustomTelnetCommand\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "CommId"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="GetRapidHAInfo" || $sPostMode==="TurnOnZigbeeJoinMode" || $sPostMode==="RapidHAFormNetwork" ) {
			try {
				//-- Retrieve the "DeviceIPAddress" --//
				$iPostCommId = $aHTTPData["CommId"];
				
				if( $iPostCommId===false ) {
					$bError = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"CommId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"CommId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Non numeric \"CommId\" parameter! \n";
				$sErrMesg .= "Please use a valid \"CommId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "HubId"                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="CustomTelnetCommand" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false ) {
					$bError = true;
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
	
	//----------------------------------------------------//
	//-- 2.2.4 - Retrieve "CustomCommand"               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="CustomTelnetCommand" ) {
			try {
				//-- Retrieve the "CustomCommand" --//
				$sPostTelnetCommand = $aHTTPData["CustomCommand"];
				
				if( $sPostTelnetCommand===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"CustomCommand\" parameter! \n";
					$sErrMesg .= "Please use a valid \"CustomCommand\" parameter.\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"CustomCommand\" parameter!\n";
				$sErrMesg .= "Please use a valid \"CustomCommand\" parameter.";
			}
		}
	}
}

//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		if( $sPostMode==="TurnOnZigbeeJoinMode" || $sPostMode==="GetRapidHAInfo" || $sPostMode==="RapidHAFormNetwork" ) {
			try {
				//----------------------------------------------------------------//
				//-- Check the CommInfo                                         --//
				//----------------------------------------------------------------//
				$aCommInfo = GetCommInfo( $iPostCommId );
				
				if( $aCommInfo['Error']===false ) {
					$iCommOwnerPerm     = $aCommInfo['Data']['PermOwner'];
					$iCommWritePerm     = $aCommInfo['Data']['PermWrite'];
					$iPostHubId         = $aCommInfo['Data']['HubId'];
					$sCommAddress       = $aCommInfo['Data']['CommAddress'];
					$iCommTypeId        = $aCommInfo['Data']['CommTypeId'];
					//var_dump( $aCommInfo );
					//echo "\n\n";
					
					if( $iCommTypeId!==$iZigbeeCommTypeId ) {
						$bError = true;
						$iErrCode  = 202;
						$sErrMesg .= "Error Code:'0202' \n";
						$sErrMesg .= "The CommType is not supported by this API.\n";
						$sErrMesg .= "Please use a valid CommId of a supported Comm.\n";
					} else if( $sCommAddress===null || $sCommAddress===false || $sCommAddress==="" || !( strlen($sCommAddress)>=4) ) {
						$bError = true;
						$iErrCode  = 203;
						$sErrMesg .= "Error Code:'0203' \n";
						$sErrMesg .= "The network address for this Hub does not seem suitable!\n";
						$sErrMesg .= "Please check the database to ensure this Hub has a suitable network address.\n";
					}
					
				} else {
					$bError = true;
					$iErrCode  = 209;
					$sErrMesg .= "Error Code:'0209' \n";
					$sErrMesg .= "Problem looking up the Info for the selected Comm.\n";
					$sErrMesg .= $aCommInfo['ErrMesg'];
				}
				
			} catch( Exception $e0201 ) {
				$bError = true;
				$iErrCode  = 201;
				$sErrMesg .= "Error Code:'1201' \n";
				$sErrMesg .= "Critical Error Occurred!\n";
				$sErrMesg .= "Problem occurred when preparing for the main function.\n";
			}
		}
		
		//----------------------------------------------------------------//
		//-- Check the HubInfo                                          --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="TurnOnZigbeeJoinMode" || $sPostMode==="GetRapidHAInfo" || $sPostMode==="CustomTelnetCommand" || $sPostMode==="RapidHAFormNetwork" ) {
				try {
					//------------------------------------------------//
					//-- Retrieve Hub Information                   --//
					//------------------------------------------------//
					$aHubData = HubRetrieveInfoAndPermission( $iPostHubId );
					
					if( $aHubData['Error']===false ) {
						//-- Store the Write Permission --//
						$iHubOwnerPerm      = $aHubData['Data']['PermOwner'];
						$iHubWritePerm      = $aHubData['Data']['PermWrite'];
						$sHubName           = $aHubData['Data']['HubName'];
						$sHubIPAddress      = $aHubData['Data']['HubIpaddress'];
						$iHubTypeId         = $aHubData['Data']['HubTypeId'];
						
						if( $iHubTypeId!==$iTelnetHubTypeId1 ) {
							$bError = true;
							$iErrCode  = 211;
							$sErrMesg .= "Error Code:'0211' \n";
							$sErrMesg .= "The HubType is not supported by this API.\n";
							$sErrMesg .= "Please use a valid HubId of a supported Hub (Android WatchInputs).\n";
							
						} else if( $sHubIPAddress===false || $sHubIPAddress===null || $sHubIPAddress==="" || strlen($sHubIPAddress)<2 ) {
							$bError = true;
							$iErrCode  = 212;
							$sErrMesg .= "Error Code:'0212' \n";
							$sErrMesg .= "The network address for this Hub does not seem suitable!\n";
							$sErrMesg .= "Please check the database to ensure this Hub has a suitable network address.\n";
						}
						
						//var_dump( $aHubData['Data'] );
						
						//------------------------------------------------//
						//-- Lookup Hub Security                        --//
						//------------------------------------------------//
						if( $bError===false ) {
							$aHubSecTemp = GetHubSecDetails( $iPostHubId );
							
							if( $aHubSecTemp['Error']===false ) {
								//-- Extract the Username and Password --//
								$aHubTelnetOptions = array(
									"Username" => $aHubSecTemp['Data']['HubSecUsername'],
									"Password" => $aHubSecTemp['Data']['HubSecPassword']
								);
								
							} else {
								//-- ERROR --//
								$bError    = true;
								$iErrCode  = 215;
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= "Problem looking up the Hub Security Info!";
								//$sErrMesg .= "";
							}
						} //-- ENDIF No Errors (Hubsec) --//
					} else {
						$bError    = true;
						$iErrCode  = 213;
						$sErrMesg .= "Error Code:'0213' \n";
						$sErrMesg .= "Problem looking up the Info for the selected Hub.\n";
						$sErrMesg .= $aHubData['ErrMesg'];
					}
					
				} catch( Exception $e0214 ) {
					$bError = true;
					$iErrCode  = 214;
					$sErrMesg .= "Error Code:'1214' \n";
					$sErrMesg .= "Critical Error Occurred!\n";
					$sErrMesg .= "Problem occurred when preparing for the main function.\n";
				}
			}
		}
		
	} catch( Exception $e0200 ) {
		$bError = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= "Critical Error Occurred!\n";
		$sErrMesg .= "Problem occurred when preparing for the main function.\n";
	}
}

//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		
		//================================================================//
		//== 5.1 - MODE: Get RapidHA Info                               ==//
		//================================================================//
		if( $sPostMode==="GetRapidHAInfo" ) {
			try {
				//----------------------------//
				//-- Setup the Results      --//
				//----------------------------//
				$aResult = array(
					"Error"   => false,
					"Data"    => array(
						"RapidHAInfo" => array(),
						"ZigbeeInfo"  => array()
					)
				);
				
				//----------------------------//
				//-- RapidHA Info           --//
				//----------------------------//
				$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
				if( $oTelnet->bInitialised===true ) {
					$oTelnet->WriteArray( array( "get_rapidha_info\n", "quit\n" ) );
					$aResult['Data']['RapidHAInfo'] = $oTelnet->FetchRows( "normal", 128, 5, true );
					
				} else {
					$bError     = true;
					$iErrCode   = 1401;
					$sErrMesg  .= "Error Code:'1401' \n";
					$sErrMesg  .= "Failed to connect to Hub via Telnet.";
				}
				
				//----------------------------//
				//-- Zigbee Info            --//
				//----------------------------//
				$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
				if( $oTelnet->bInitialised===true ) {
					$oTelnet->WriteArray( array( "get_zigbee_info\n", "quit\n" ) );
					$aResult['Data']['ZigbeeInfo'] = $oTelnet->FetchRows( "normal", 128, 5, true );
					
				} else {
					$bError     = true;
					$iErrCode   = 1402;
					$sErrMesg  .= "Error Code:'1402' \n";
					$sErrMesg  .= "Failed to connect to Hub via Telnet.";
				}
				//$oTelnet->WriteArray( array( "versioninfo\n", "get_rapidha_info\n", "get_zigbee_info\n" ) );
				
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Turns on Zigbee Join Mode                      ==//
		//================================================================//
		} else if( $sPostMode==="TurnOnZigbeeJoinMode" ) {
			try {
				if( $iCommWritePerm===1 ) {
					if( strlen( $sCommAddress )>=15 ) {
						
						//----------------------------//
						//-- Setup the Results      --//
						//----------------------------//
						$aResult = array(
							"Error" => false,
							"Data"  => array(
								"JoinMode" => array()
							)
						);
						
						//----------------------------//
						//-- RapidHA Info           --//
						//----------------------------//
						$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
						if( $oTelnet->bInitialised===true ) {
							$oTelnet->WriteArray( array( "zigbee_enable_tempjoin ".$sCommAddress."\n", "quit\n" ) );
							$aResult['Data']['JoinMode'] = $oTelnet->FetchRows( "normal", 128, 5, true );
							
						} else {
							$bError     = true;
							$iErrCode   = 2403;
							$sErrMesg  .= "Error Code:'2403' \n";
							$sErrMesg  .= "Failed to connect to Hub via Telnet.";
						}
					} else {
						$bError     = true;
						$iErrCode   = 2402;
						$sErrMesg  .= "Error Code:'2402' \n";
						$sErrMesg  .= "Problem with the CommAddress of the provided Comm!\n";
						$sErrMesg  .= "Please verify that the Comm supports join mode!\n";
					}
				} else {
					$bError     = true;
					$iErrCode   = 2401;
					$sErrMesg  .= "Error Code:'2401' \n";
					$sErrMesg  .= "Insufficient user permissions.\n";
					$sErrMesg  .= "Check if your user has the write permission to the premise.\n";
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
		//== 5.3 - MODE: Rapid HA Form Network                          ==//
		//================================================================//
		} else if( $sPostMode==="RapidHAFormNetwork" ) {
			try {
				//-- Check if the user has the "Write" permission. --//
				if( $iCommWritePerm===1 ) {
					//----------------------------//
					//-- Setup the Results      --//
					//----------------------------//
					$aResult = array(
						"Error" => false,
						"Data"  => array(
							"FormNetwork" => array()
						)
					);
					
					//----------------------------//
					//-- RapidHA Info           --//
					//----------------------------//
					$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
					if( $oTelnet->bInitialised===true ) {
						$oTelnet->WriteArray( array( "get_rapidha_info\n", "quit\n" ) );
						$aTempFunctionResult1 = $oTelnet->FetchRows( "normal", 128, 5, true );
						
						if( $aTempFunctionResult1===false || count( $aTempFunctionResult1 )<=4 ) {
							$bError     = true;
							$iErrCode   = 3404;
							$sErrMesg  .= "Error Code:'3404' \n";
							$sErrMesg  .= "Problem extracting the rapidha info.";
						}
					} else {
						$bError     = true;
						$iErrCode   = 3403;
						$sErrMesg  .= "Error Code:'3403' \n";
						$sErrMesg  .= "Failed to connect to Hub via Telnet.";
					}
					
					//----------------------------//
					//-- Regex the values       --//
					//----------------------------//
					if( $bError===false ) {
						//-- Setup the initial variables --//
						$sCurrentCommUUID = "Unknown";
						
						foreach( $aTempFunctionResult1 as $sRow ) {
							//-- Clear the variables --//
							$aTempFunctionResult2 = array();
							
							//-- Check if it is the desired Comm --//
							preg_match('/^RAPIDHA ADDRESS.*([0-9a-fA-F]{16})/', $sRow, $aTempFunctionResult2);
							if( count($aTempFunctionResult2)===2 ) {
								$sCurrentCommUUID = $aTempFunctionResult2[1];
							}
							
							//-- Check if the Comm UUID match --//
							if( $sCommAddress===$sCurrentCommUUID ) {
								//-- Check Network State --//
								preg_match('/^Network\s+State.*Network\s([\w]+)$/', $sRow, $aTempFunctionResult2);
								if( count($aTempFunctionResult2)===2 ) {
									$bCommNetworkStateFound = true;
									
									if( $aTempFunctionResult2[1]==="Up" || $aTempFunctionResult2[1]==="up" ) {
										//-- Error --//
										$bError     = true;
										$iErrCode   = 3404;
										$sErrMesg  .= "Error Code:'3404' \n";
										$sErrMesg  .= "Zigbee modem already has a network!\n";
										$sErrMesg  .= "Please remove it from a network before trying to add it to a new one!\n";
									}
								}
								
								//-- Store the row --//
								$aTempFunctionResult3[] = $sRow;
							}
						} //-- ENDFOREACH --//
					}	//-- ENDIF No Errors --//
					
					if( $bError===false ) {
						if( $bCommNetworkStateFound===false ) {
							$bError     = true;
							$iErrCode   = 3405;
							$sErrMesg  .= "Error Code:'3405 \n";
							$sErrMesg  .= "Zigbee Modem's network state cannot be determined!\n";
						}
					}	//-- ENDIF No Errors --//
					
					if( $bError===false ) {
						//----------------------------//
						//-- Form a Network         --//
						//----------------------------//
						$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
						if( $oTelnet->bInitialised===true ) {
							$oTelnet->WriteArray( array( "rapidha_form_network ".$sCommAddress."\n", "quit\n" ) );
							$aResult['Data']['FormNetwork'] = $oTelnet->FetchRows( "normal", 128, 5, true );
							
						} else {
							$bError     = true;
							$iErrCode   = 3409;
							$sErrMesg  .= "Error Code:'3409' \n";
							$sErrMesg  .= "Failed to connect to Hub via Telnet";
						}
					}	//-- ENDIF No Errors --//
				} else {
					$bError     = true;
					$iErrCode   = 3401;
					$sErrMesg  .= "Error Code:'3401' \n";
					$sErrMesg  .= "Insufficient user permissions.\n";
					$sErrMesg  .= "Check if your user has the write permission to the premise.\n";
				}
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 3400;
				$sErrMesg  .= "Error Code:'3400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e3400->getMessage();
			}
			
		//================================================================//
		//== 5.4 - MODE: Custom Telnet Command                          ==//
		//================================================================//
		} else if( $sPostMode==="CustomTelnetCommand" ) {
			try {
				if( $iHubOwnerPerm===1 ) {
					//----------------------------------------------------------------//
					//-- Setup the Results                                          --//
					//----------------------------------------------------------------//
					$aResult = array(
						"Error" => false,
						"Data"  => array(
							"Custom" => array()
						)
					);
					
					//----------------------------------------------------------------//
					//-- Custom Command                                             --//
					//----------------------------------------------------------------//
					$oTelnet = new PHPTelnet( $sHubIPAddress, 64932, "WatchInputs", 0, $aHubTelnetOptions );
					
					if( $oTelnet->bInitialised===true ) {
						
						//----------------------------//
						//-- PRE COMMAND            --//
						//----------------------------//
						if( $bTelnetDebugging===true ) {
							$iTime1Start = microtime();
						}
						
						$aTempFunctionResult4 = $oTelnet->FetchRows( "normal", 128, 1, true );
						
						if( $bTelnetDebugging===true ) {
							$aResult['Data']['Pre'] = $aTempFunctionResult4;
							$iTime1End   = microtime();
							$iTime1Total = floatval( $iTime1End ) - floatval( $iTime1Start );
							$aResult['Data']['PreTime'] = $iTime1Total;
						}
						//----------------------------//
						//-- MAIN COMMAND           --//
						//----------------------------//
						if( $bTelnetDebugging===true ) {
							$iTime2Start = microtime();
						}
						
						$oTelnet->WriteArray( array( $sPostTelnetCommand."\n" ) );
						$aResult['Data']['Custom'] = $oTelnet->FetchRows( "normal", 128, 5, true );
						
						if( $bTelnetDebugging===true ) {
							$iTime2End = microtime();
							$iTime2Total = floatval( $iTime2End ) - floatval( $iTime2Start );
							$aResult['Data']['MainTime'] = $iTime2Total;
						}
						//----------------------------//
						//-- EXIT COMMAND           --//
						//----------------------------//
						if( $bTelnetDebugging===true ) {
							$iTime3Start = microtime();
						}
						
						$oTelnet->WriteArray( array( "quit\n" ) );
						$aTempFunctionResult4 = $oTelnet->FetchRows( "normal", 128, 1, true );
						
						if( $bTelnetDebugging===true ) {
							$aResult['Data']['Exit'] = $aTempFunctionResult4;
							$iTime3End = microtime();
							$iTime3Total = floatval( $iTime3End ) - floatval( $iTime3Start );
							$aResult['Data']['EndTime'] = $iTime3Total;
						}
						//var_dump( $oTelnet->aDebbugingLogs );
						
					} else {
						$bError     = true;
						$iErrCode   = 4401;
						$sErrMesg  .= "Error Code:'4401' \n";
						$sErrMesg  .= "Failed to connect to Hub via Telnet.\n";
					}
				} else {
					$bError     = true;
					$iErrCode   = 4402;
					$sErrMesg  .= "Error Code:'4402' \n";
					$sErrMesg  .= "Insufficient user permissions!\n";
					$sErrMesg  .= "The Owner permission is required to perform this action on the Hub.\n";
					$sErrMesg  .= "\n";
				}
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 4400;
				$sErrMesg  .= "Error Code:'4400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e4400->getMessage();
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