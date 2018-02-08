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
$iPostHubId                 = 0;            //-- INTEGER:       This is used to store which HubId that should be telnetted to. --//

//------------------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                        --//
//------------------------------------------------------------//
//require_once SITE_BASE.'/restricted/libraries/telnet.php';
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//

//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//




//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Format',                    "DataType"=>'STR' ),
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'Data',                      "DataType"=>'STR' ),
		array( "Name"=>'Id',                        "DataType"=>'INT' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
}


//----------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                  --//
//----------------------------------------------------//
if($bError===false) {
	
	//----------------------------------------------------//
	//-- Extract the output "Format"                    --//
	//----------------------------------------------------//
	try {
		$sPostFormat = $aHTTPData["Format"];
		//-- Check if JSON --//
		if( $sPostFormat==="JSON" || $sPostFormat==="Json" || $sPostFormat==="json" ) {
			$sPostFormat = "json";
		} 
	} catch( Exception $e0100 ) {
		$sPostFormat = "Normal";
	}
	
	
	
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "ListRules", "AddRule", "EditRule", "SetRuleState", "DeleteRule", "UpdateRules", "???",  --//
		
		//-- Verify that the mode is supported --//
		if( 
			$sPostMode!=="ListAllRules"             && $sPostMode!=="ListAllActiveRules"       && 
			$sPostMode!=="AddRule"                  && $sPostMode!=="EditRule"                 && 
			$sPostMode!=="SetRuleEnabled"           && $sPostMode!=="DeleteRule"               && 
			$sPostMode!=="UpdateRuleNextTS"         && $sPostMode!=="JustTriggered"            &&
			$sPostMode!=="TriggeredAt"              
			
		) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"ListAllRules\", \"ListAllActiveRules\", \"AddRule\", \"EditRule\", \"SetRuleState\", \"DeleteRule\", \"JustTriggered\", \"TriggeredAt\" or \"UpdateRuleNextTS\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"ListAllRules\", \"ListAllActiveRules\", \"AddRule\", \"EditRule\", \"SetRuleState\", \"DeleteRule\", \"JustTriggered\", \"TriggeredAt\" or \"UpdateRuleNextTS\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "Id"                          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( 
			$sPostMode==="EditRule"         || $sPostMode==="SetRuleEnabled"   || 
			$sPostMode==="DeleteRule"       || $sPostMode==="JustTriggered"    || 
			$sPostMode==="UpdateRuleNextTS" || $sPostMode==="TriggeredAt"      
		) {
			try {
				//-- Retrieve the "RuleId" --//
				$iPostId = $aHTTPData["Id"];
				
				if( $iPostId===false ) {
					$bError = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"Id\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Id\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "HubId"                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddRule" || $sPostMode==="ListHubRules" || $sPostMode==="ListHubEnabledRules" ) {
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
	//-- 2.2.4 - Retrieve "Data"                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( 
			$sPostMode==="AddRule"             || $sPostMode==="EditRule"            || 
			$sPostMode==="SetRuleEnabled"      || $sPostMode==="ListHubRules"        || 
			$sPostMode==="ListHubEnabledRules" || $sPostMode==="TriggeredAt"         
		) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
					//------------------------------------------------//
					//-- JSON Parsing                               --//
					//------------------------------------------------//
					//var_dump( $sPostData );
					//echo "\n";
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
			} catch( Exception $e0108 ) {
				$bError    = true;
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
		//------------------------------------------------------------//
		//-- 4.1 - Extract JSON Data                                --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			//----------------------------------------------------//
			//-- 4.1.1 - Extract Status                         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddRule"             || $sPostMode==="EditRule"            || $sPostMode==="SetRuleEnabled" ) {
					try {
						if( isset( $aPostData['Enabled'] ) ) {
							$iPostNewStatus = $aPostData['Enabled'];
							
							//------------------------------------//
							//-- Perform validation             --//
							//------------------------------------//
							if( $iPostNewStatus!==0 && $iPostNewStatus!=="0" && $iPostNewStatus!==1 && $iPostNewStatus!=="1" ) {
								//-- Error: Unsupported Enabled status --//
								$bError    = true;
								$iErrCode  = 202;
								$sErrMesg .= "Error Code:'0202' \n";
								$sErrMesg .= "Error: The 'Enabled' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "Supported values are either '0' or '1'.\n";
							}
						} else {
							$bError    = true;
							$iErrCode  = 201;
							$sErrMesg .= "Error Code:'0201' \n";
							$sErrMesg .= "Error: Problem extracting the 'Enabled' value in the 'Data' JSON parameter!\n";
						}
					} catch( Exception $e0201 ) {
						$bError    = true;
						$iErrCode  = 201;
						$sErrMesg .= "Error Code:'0201' \n";
						$sErrMesg .= "Error: Problem extracting the 'Enabled' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			
			//----------------------------------------------------//
			//-- 4.1.2 - Extract Time                           --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddRule" || $sPostMode==="EditRule" ) {
					try {
						if( isset( $aPostData['Time'] ) ) {
							$sPostTime = $aPostData['Time'];
							
							//------------------------------------//
							//-- Perform validation             --//
							//------------------------------------//
							$aTempFunctionResult2 = ExtractTimeValuesFromString( $sPostTime );
							
							if( $aTempFunctionResult2['Error']===true ) {
								$bError    = true;
								$iErrCode  = 204;
								$sErrMesg .= "Error Code:'0204' \n";
								$sErrMesg .= "Error: Problem when parsing the 'Time' value in the 'Data' JSON parameter!\n";
								$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
							}
							
						} else {
							$bError    = true;
							$iErrCode  = 203;
							$sErrMesg .= "Error Code:'0203' \n";
							$sErrMesg .= "Error: Problem extracting the 'Time' value in the 'Data' JSON parameter!\n";
						}
					} catch( Exception $e0203 ) {
						$bError    = true;
						$iErrCode  = 203;
						$sErrMesg .= "Error Code:'0203' \n";
						$sErrMesg .= "Error: Problem extracting the 'Time' variable in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			
			//----------------------------------------------------//
			//-- 4.1.3 - Extract Name                           --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddRule" || $sPostMode==="EditRule" ) {
					try {
						if( isset( $aPostData['Name'] ) ) {
							$sPostName = $aPostData['Name'];
							
							//------------------------------------//
							//-- Perform validation             --//
							//------------------------------------//
							if( !is_string( $sPostName ) || $sPostName==="" ) {
								$bError    = true;
								$iErrCode  = 206;
								$sErrMesg .= "Error Code:'0206' \n";
								$sErrMesg .= "Error: Problem when parsing the 'Name' value in the 'Data' JSON parameter!\n";
								$sErrMesg .= "The 'Name' value doesn't appear to be a valid string or is an empty string.\n";
								
							} else if( strlen( $sPostName ) >= 120 ) {
								$bError    = true;
								$iErrCode  = 206;
								$sErrMesg .= "Error Code:'0206' \n";
								$sErrMesg .= "Error: Problem when parsing the 'Name' value in the 'Data' JSON parameter!\n";
								$sErrMesg .= "The 'Name' value appears to have too many characters in it.\n";
							}
							
						} else {
							$bError    = true;
							$iErrCode  = 205;
							$sErrMesg .= "Error Code:'0205' \n";
							$sErrMesg .= "Error: Problem extracting the 'Name' value in the 'Data' JSON parameter!\n";
						}
					} catch( Exception $e0205 ) {
						$bError = true;
						$iErrCode  = 205;
						$sErrMesg .= "Error Code:'0205' \n";
						$sErrMesg .= "Error: Problem extracting the 'Name' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- 4.1.4 - Extract RuleType                       --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddRule" || $sPostMode==="EditRule" ) {
					try {
						if( isset( $aPostData['RuleTypeId'] ) ) {
							$iPostRuleTypeId = $aPostData['RuleTypeId'];
							
							//------------------------------------//
							//-- Perform validation             --//
							//------------------------------------//
							if( 
								$iPostRuleTypeId!==1    && $iPostRuleTypeId!=="1"    && 
								$iPostRuleTypeId!==2    && $iPostRuleTypeId!=="2"    && 
								$iPostRuleTypeId!==3    && $iPostRuleTypeId!=="3"    && 
								$iPostRuleTypeId!==4    && $iPostRuleTypeId!=="4"    
							) {
								//----------------------------------------//
								//-- ERROR: Unsupported RuleType status --//
								$bError    = true;
								$iErrCode  = 208;
								$sErrMesg .= "Error Code:'0208' \n";
								$sErrMesg .= "Error: The 'RuleType' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "Supported values are either '1', '2', '3' or '4'.\n";
							}
						} else {
							$bError    = true;
							$iErrCode  = 207;
							$sErrMesg .= "Error Code:'0207' \n";
							$sErrMesg .= "Error: Problem extracting the 'RuleTypeId' value in the 'Data' JSON parameter!\n";
						}
					} catch( Exception $e0207 ) {
						$bError = true;
						$iErrCode  = 207;
						$sErrMesg .= "Error Code:'0207' \n";
						$sErrMesg .= "Error: Problem extracting the 'RuleTypeId' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- 4.1.5 - Extract Parameter                      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddRule" ) {
					try {
						if( isset( $aPostData['Parameter'] ) ) {
							$aPostParameter = $aPostData['Parameter'];
							
							//------------------------------------//
							//-- Perform validation             --//
							//------------------------------------//
							
							
							//------------------------------------//
							//-- IF a ThingRule                 --//
							//------------------------------------//
							if( $iPostRuleTypeId===1 || $iPostRuleTypeId===2 || $iPostRuleTypeId===3 || $iPostRuleTypeId===4 ) {
								//------------------------//
								//-- IF ThingId         --//
								//------------------------//
								if( isset( $aPostParameter['ThingId'] ) ) {
									if( is_numeric( $aPostParameter['ThingId'] ) ) {
										$iPostDataParamThingId = $aPostParameter['ThingId'];
										
										//------------------------------------//
										//-- Lookup the ThingInfo           --//
										//------------------------------------//
										
										//------------------------------------//
										//-- Lookup the Thing Data          --//
										//------------------------------------//
										$aTempFunction1 = dbGetThingInfo( $aParamData['ThingId'] ); 
										
										
										//------------------------------------//
										//--  --//
										//------------------------------------//
										if( $aTempFunction1['Error']===false ) {
											
											$aPostParameterEdited = array(
												"LinkId"         => $aTempFunction1['Data']['LinkId'],
												"LinkSerialCode" => $aTempFunction1['Data']['LinkSerialCode'],
												"LinkTypeId"     => $aTempFunction1['Data']['LinkTypeId'],
												"ThingId"        => $iPostDataParamThingId,
												"ThingHWID"      => $aTempFunction1['Data']['ThingHWId']
											);
										} else {
											//------------------------------------//
											//-- ERROR: Can't find Thing        --//
											$bError    = true;
											$iErrCode  = 210;
											$sErrMesg .= "Error Code:'0210' \n";
											$sErrMesg .= "Error: The 'Parameter' array in the 'Data' JSON parameter is not supported!\n";
											$sErrMesg .= "The desired Thing does not exist or your user doesn't have permission to it!\n";
										}
									} else {
										//------------------------------------//
										//-- ERROR: Non-numeric ThingId     --//
										$bError    = true;
										$iErrCode  = 210;
										$sErrMesg .= "Error Code:'0210' \n";
										$sErrMesg .= "Error: The 'Parameter' array in the 'Data' JSON parameter is not supported!\n";
										$sErrMesg .= "Can not find the ThingId in the parameter array!\n";
									}
									
								//------------------------//
								//-- ELSE Error         --//
								//------------------------//
								} else {
									//------------------------------------//
									//-- ERROR: Missing ThingId         --//
									$bError    = true;
									$iErrCode  = 210;
									$sErrMesg .= "Error Code:'0210' \n";
									$sErrMesg .= "Error: The 'Parameter' array in the 'Data' JSON parameter is not supported!\n";
								}
							}
							
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							$bError    = true;
							$iErrCode  = 210;
							$sErrMesg .= "Error Code:'0210' \n";
							$sErrMesg .= "Error: The 'Parameter' array in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0209 ) {
						$bError = true;
						$iErrCode  = 209;
						$sErrMesg .= "Error Code:'0209' \n";
						$sErrMesg .= "Error: Problem extracting the 'Parameter' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			
			//----------------------------------------------------//
			//-- 4.1.6 - Extract Parameter                      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="TriggeredAt" ) {
					try {
						if( isset( $aPostData['TriggeredUnixTS'] ) ) {
							$iPostDataLastRunUnixTS = $aPostData['TriggeredUnixTS'];
							
							if( $iPostDataLastRunUnixTS > time() ) {
								//------------------------------------//
								//-- ERROR: Invalid Timestamp       --//
								$bError    = true;
								$iErrCode  = 212;
								$sErrMesg .= "Error Code:'0212' \n";
								$sErrMesg .= "Error: The 'TriggeredUnixTS' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "The Unix timestamp has not occurred yet.";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							$bError    = true;
							$iErrCode  = 211;
							$sErrMesg .= "Error Code:'0211' \n";
							$sErrMesg .= "Error: The 'TriggeredUnixTS' value in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0211 ) {
						$bError = true;
						$iErrCode  = 211;
						$sErrMesg .= "Error Code:'0211' \n";
						$sErrMesg .= "Error: Problem extracting the 'TriggeredUnixTS' value in the 'Data' JSON parameter!\n";
					}
				}
			}
		}
		
		//------------------------------------------------------------//
		//-- 4.2 - Lookup the Rule Data                             --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( 
				$sPostMode==="EditRule"         || $sPostMode==="DeleteRule"       || 
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="JustTriggered"    || 
				$sPostMode==="TriggeredAt"      
			) {
				//-- Lookup Rule --//
				$aRuleTemp = GetRuleFromRuleId( $iPostId );
				
				if( $aRuleTemp['Error']===false ) {
					$iPostHubId = $aRuleTemp['Data']['HubId'];
					
					//--------------------------------------------//
					//-- IF Edit Mode                           --//
					//--------------------------------------------//
					if( $sPostMode==="EditRule" ) {
						$aFunctionTemp5        = json_decode( $aRuleTemp['Data']['Parameter'], true );
						
						//--------------------------------------------//
						//-- IF The ThingId is present              --//
						//--------------------------------------------//
						if( isset( $aFunctionTemp5['ThingId'] ) ) {
							$iPostDataParamThingId = $aFunctionTemp5['ThingId'];
							
						//--------------------------------------------//
						//-- ELSE Unsupported Parameter             --//
						//--------------------------------------------//
						} else {
							$bError    = true;
							$iErrCode  = 220;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Failed to extract the required values from the existing Rule's parameter!\n";
						}
					} else if( $sPostMode==="UpdateRuleNextTS" || $sPostMode==="JustTriggered" || $sPostMode==="TriggeredAt" ) {
						//-- Extract values --//
						$iPlannedNextRunUnixTS = $aRuleTemp['Data']['NextRunUTS'];
						$sPostTime = $aRuleTemp['Data']['Time'];
						
					}
				} else {
					//-- ERROR: Problem with the results of the desired rule --//
					$bError    = true;
					$iErrCode  = 221+$aRuleTemp['ErrCode'];
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Issue with looking up the desired Rule!\n";
					$sErrMesg .= $aRuleTemp['ErrMesg'];
				}
			}
		}
		
		
		//------------------------------------------------------------//
		//-- 4.3 - Lookup the timezone from HubId                   --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="AddRule"          || $sPostMode==="EditRule"         || 
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="JustTriggered"    || 
				$sPostMode==="TriggeredAt"      
			) {
				//------------------------------------------------//
				//-- 4.2.1 - Lookup Hub Data for Rule           --//
				//------------------------------------------------//
				if( $bError===false ) {
					$aHubTemp  = GetPremiseFromHubId( $iPostHubId );
					
					if( $aHubTemp['Error']===true ) {
						$bError    = true;
						$iErrCode  = 240+$aHubTemp['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the Hub information for the HubId parameter.\n";
						$sErrMesg .= $aHubTemp['ErrMesg'];
					}
				}
				
				//------------------------------------------------//
				//-- 4.2.2 - Lookup PremiseAddress              --//
				//------------------------------------------------//
				if( $bError===false ) {
					$aPremiseAddressTemp = GetPremisesAddressFromPremiseId( $aHubTemp['Data']['PremiseId'] );
					
					if( $aPremiseAddressTemp['Error']===false ) {
						$sTimezone = $aPremiseAddressTemp['Data']['AddressTimezoneTZ'];
						
					} else {
						$bError    = true;
						$iErrCode  = 250+$aPremiseAddressTemp['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the Timezone information for the Rule!\n";
						$sErrMesg .= $aPremiseAddressTemp['ErrMesg'];
					}
				}
			}
		}
		
		//------------------------------------------------------------//
		//-- 4.4 - Lookup the Calculate Next RunTime                --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( 
				$sPostMode==="AddRule"          || $sPostMode==="EditRule"         || 
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="JustTriggered"    || 
				$sPostMode==="TriggeredAt"      
			) {
				$aNextUnixTS = FindNextUTSFromTime( $sTimezone, $sPostTime, 60 );
				
				if( $aNextUnixTS['Error']===false ) {
					$iNextRun = $aNextUnixTS['UnixTS']; 
					
					//-- TODO: Error checking --//
				} else {
					$bError    = true;
					$iErrCode  = 260+$aNextUnixTS['ErrCode'];
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Problem when calculating the next timestamp to run the rule at.\n";
					$sErrMesg .= $aNextUnixTS['ErrMesg'];
				}
			}
		}
		
		//------------------------------------------------------------//
		//-- 4.5 - Check For Conflicts                              --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="AddRule" || $sPostMode==="EditRule" ) {
				//-- Lookup All Rules --//
				$aRuleListTemp = GetAllRules( false );
				
				if( $aRuleListTemp['Error']===false ) {
					foreach( $aRuleListTemp['Data'] as $aRule ) {
						//-- Setup Variables and Extract the values from the database result --//
						$sTempTime      = $aRule['Time'];
						$iTempRuleId    = $aRule['Id'];
						$aTempParamData = json_decode( $aRule['Parameter'], true );
						$iTempThingId   = null;
						
						if( $aTempParamData!==null && $aTempParamData!==false && isset( $aTempParamData['ThingId'] )) {
							$iTempThingId = $aTempParamData['ThingId'];
							
							
							//----------------------------//
							//-- IF AddRule             --//
							if( $sPostMode==="AddRule" ) {
								//-- Check to make sure ThingId and Time do not match --//
								if( $sPostTime===$sTempTime && $iPostDataParamThingId===$iTempThingId ) {
									//-- ERROR: Invalid Add Rule --//
									$bError    = true;
									$iErrCode  = 275;
									$sErrMesg .= "Error Code:'".$iErrCode."' \n";
									$sErrMesg .= "Error: Problem occurred when attempting to add a new Rule!\n";
									$sErrMesg .= "The desired rule conflicts with an existing rule! \n";
									$sErrMesg .= "Please change the Time or pick a different Device.\n";
									break;
								}
								
								
							//----------------------------//
							//-- ELSEIF Edit Rule       --//
							} else if( $sPostMode==="EditRule" ) {
								//-- IF the RuleId is different than check that the Time and ThingId do no match --//
								if( $iPostId!==$iTempRuleId ) {
									if( $sPostTime===$sTempTime && $iPostDataParamThingId===$iTempThingId ) {
										//-- ERROR: Invalid Edit Rule --//
										$bError    = true;
										$iErrCode  = 276;
										$sErrMesg .= "Error Code:'".$iErrCode."' \n";
										$sErrMesg .= "Error: Problem occurred when attempting to edit an existing Rule!\n";
										$sErrMesg .= "The desired rule conflicts with an existing rule! \n";
										$sErrMesg .= "Please change the Time or ThingId to a different value.\n";
										break;
									}
								}
							}
							
						} else {
							//-- ERROR: Abort --//
							$bError    = true;
							$iErrCode  = 274;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Error: Problem occurred when parsing existing rules!\n";
						}
						
					}	//-- ENDFOREACH Database Rule --//
				} else {
					//-- ERROR: --//
					$bError    = true;
					$iErrCode  = 270;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Error: Problem occurred when checking for existing rules!\n";
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
		//== 5.1 - MODE: List Mode variant                              ==//
		//================================================================//
		if( 
			$sPostMode==="ListAllRules"             || $sPostMode==="ListAllActiveRules"       ||
			$sPostMode==="ListHubRules"             || $sPostMode==="ListHubEnabledRules"      
		) {
			try {
				//----------------------------------------------------//
				//-- 5.1.A - IF All Rules                           --//
				//----------------------------------------------------//
				if( $sPostMode==="ListAllRules" ) {
					$aResult = GetAllRules( false, true );
					
				//----------------------------------------------------//
				//-- 5.1.B - ELSEIF Active Only Rules               --//
				//----------------------------------------------------//
				} else if( $sPostMode==="ListAllActiveRules" ) {
					$aResult = GetAllRules( true, true );
					
				//----------------------------------------------------//
				//-- 5.1.C - ELSEIF All Hub Rules                   --//
				//----------------------------------------------------//
					//-- TODO: --//
					
				//----------------------------------------------------//
				//-- 5.1.D - ELSEIF Active Hub Rules                --//
				//----------------------------------------------------//
					//-- TODO: --//
					
				}
				
				if( $aResult['Error']===true ) {
					$bError     = true;
					$iErrCode   = 1401;
					$sErrMesg  .= "Error Code:'1401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= "Critical Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Set Rule State                                 ==//
		//================================================================//
		} else if( $sPostMode==="SetRuleEnabled" ) {
			try {
				$aResult = UpdateRuleEnabledStatus( $iPostId, $iPostNewStatus );
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 2400;
				$sErrMesg  .= "Error Code:'2400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Add Rule                                       ==//
		//================================================================//
		} else if( $sPostMode==="AddRule" ) {
			try {
				$aResult = AddNewRuleToDatabase( $iPostRuleTypeId, $iPostHubId, $sPostName, $sPostTime, $aPostParameterEdited, $iPostNewStatus, $iNextRun );
				
				//----------------------------------------------------//
				//-- 5.3.2 - Check for errors                       --//
				//----------------------------------------------------//
				if( $aResult['Error']===true ) {
					$bError     = true;
					$iErrCode   = 3401;
					$sErrMesg  .= "Error Code:'3401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
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
		//== 5.4 - MODE: Edit Rule                                      ==//
		//================================================================//
		} else if( $sPostMode==="EditRule" ) {
			try {
				$aResult = ChangeRule( $iPostId, $iPostHubId, $iPostRuleTypeId, $sPostName, $sPostTime, $iPostNewStatus, $iNextRun );
				
				//----------------------------------------------------//
				//-- 5.4.2 - Check for errors                       --//
				//----------------------------------------------------//
				if( $aResult['Error']===true ) {
					$bError     = true;
					$iErrCode   = 4401;
					$sErrMesg  .= "Error Code:'4401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
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
		//== 5.5 - MODE: Delete Rule                                    ==//
		//================================================================//
		} else if( $sPostMode==="DeleteRule" ) {
			try {
				$aResult = DeleteExistingRule( $iPostId );
				
				if( $aResult['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6401;
					$sErrMesg  .= "Error Code:'6401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
				}
				
			} catch( Exception $e5400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 5400;
				$sErrMesg  .= "Error Code:'5400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e5400->getMessage();
			}
			
		//================================================================//
		//== 5.6 - MODE: Refresh All Rules Next Update                  ==//
		//================================================================//
		} else if( $sPostMode==="UpdateRuleNextTS" ) {
			try {
				$aTempFunctionResult4 = RuleNextRunUpdate( $iPostId, $iNextRun );
					
				if( $aTempFunctionResult4['Error']===false ) {
					$aResult = GetRuleFromRuleId( $iPostId );
				} else {
					$bError     = true;
					$iErrCode   = 6401;
					$sErrMesg  .= "Error Code:'6401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
				} 
			} catch( Exception $e6400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 6400;
				$sErrMesg  .= "Error Code:'6400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e6400->getMessage();
			}
			
		//================================================================//
		//== 5.7 - MODE: Mark Rule as just executed                     ==//
		//================================================================//
		} else if( $sPostMode==="JustTriggered" || $sPostMode==="TriggeredAt" ) {
			try {
				//--------------------------------------------------------//
				//-- 5.7.1 - Prepare                                    --//
				//--------------------------------------------------------//
				
				//------------------------------------//
				//-- IF Mode is JustTriggered       --//
				//------------------------------------//
				if( $sPostMode==="JustTriggered" ) {
					//-- Set the Triggered UnixTS as the current timestamp --//
					$iPostDataLastRunUnixTS = time();
					
				//------------------------------------//
				//-- ELSE Mode is TriggeredAt       --//
				//------------------------------------//
				} else {
					//----------------------------------------//
					//-- Validate that Triggered UnixTS     --//
					//-- is newer than the previous         --//
					//----------------------------------------//
					if( $iPostDataLastRunUnixTS <= $aRuleTemp['Data']['LastRunUTS'] ) {
						//--------------------------------//
						//-- ERROR: Invalid UnixTS      --//
						//--------------------------------//
						$bError    = true;
						$iErrCode  = 7401;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem with the 'TriggeredUnixTS' !\n";
						$sErrMesg .= "The new UnixTS is not newer than the previous UnixTS.";
					}
				}
				
				//--------------------------------------------------------//
				//-- 5.7.2 - Calculate next run event time              --//
				//--------------------------------------------------------//
				if( $bError===false ) {
					//------------------------------------------------//
					//-- IF The Rule is a re-occuring type          --//
					//------------------------------------------------//
					if( $aRuleTemp['Data']['TypeId']===3 || $aRuleTemp['Data']['TypeId']===4 ) {
						//------------------------------------------------//
						//-- Update the Rule                            --//
						//------------------------------------------------//
						$aResult = RuleMarkAsRan( $iPostId, $iNextRun, $iPostDataLastRunUnixTS, $aRuleTemp['Data']['HubId'] );
						
						if( $aResult['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7430;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem marking that the rule has been executed and calculating the next timestamp that it will run at!\n";
							$sErrMesg .= $aResult['ErrMesg'];
						}
						
					//------------------------------------------------//
					//-- ELSE The Rule is a run once type           --//
					//------------------------------------------------//
					} else {
						//------------------------------------------------//
						//-- Update the Rule                            --//
						//------------------------------------------------//
						$aResult = RuleMarkAsRan( $iPostId, $aRuleTemp['Data']['NextRunUTS'], $iPostDataLastRunUnixTS, $aRuleTemp['Data']['HubId'] );
						
						if( $aResult['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7440;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem marking that the rule has been executed!\n";
							$sErrMesg .= $aResult['ErrMesg'];
						}
						
						//------------------------------------------------//
						//-- Disable the Rule                           --//
						//------------------------------------------------//
						$aTempFunctionResult3 = UpdateRuleEnabledStatus( $iPostId, 0 );
						
					}
				}
			} catch( Exception $e7400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 7400;
				$sErrMesg  .= "Error Code:'7400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e7400->getMessage();
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

//----------------------------------------------------//
//-- IF API didn't encounter an Error               --//
//----------------------------------------------------//
if( $bError===false && $aResult!=false ) {
	try {
		//-- Force the page to JSON --//
		header('Content-Type: application/json');
		
		//-- Convert results to a string --//
		$sOutput .= json_encode( $aResult );
		
		//-- Output results --//
		echo $sOutput;
		
	} catch( Exception $e0001 ) {
		//-- Check the Preferred Output Type --//
		
		//--------------------------------------------//
		//-- IF Format is set to JSON               --//
		//--------------------------------------------//
		if( $sPostFormat==="json" ) {
			header('Content-Type: application/json');
			echo "{\"Error\":true, \"ErrCode\":1, \"ErrMesg\":\"Error Code:'0001'! \n ".$e0001->getMessage()."\" }";
			
		//--------------------------------------------//
		//-- ELSE Assume Format is plain text       --//
		//--------------------------------------------//
		} else {
			header('Content-Type: text/plain');
			//-- The aResult array cannot be turned into a string due to corruption of the array --//
			echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
		
		}
	}
	
//----------------------------------------------------//
//-- ELSE API Error has occurred                    --//
//----------------------------------------------------//
} else {
	//--------------------------------------------//
	//-- IF Format is set to JSON               --//
	//--------------------------------------------//
	if( $sPostFormat==="json" ) {
		try {
			//-- Force the page to JSON --//
			header('Content-Type: application/json');
			
			//--------------------------------------------//
			//-- PREPARE THE CORRECT ERROR MESSAGE      --//
			//--------------------------------------------//
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
				$sOutput  = "Error Code:'0004' \n Critical Error has occured!";
				$aResult = array(
					"Error"   => true,
					"ErrCode" => 4,
					"ErrMesg" => "Error Code:'0004' \n Critical Error has occured!"
				);
				$sOutput = json_encode( $aResult );
			}
			
			//--------------------------------------------//
			//-- OUTPUT THE ERROR MESSAGE               --//
			//--------------------------------------------//
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
		} catch( Exception $e0001 ) {
			//-- Failsafe Error Message --//
			$aResult = array(
				"Error"   => true,
				"ErrCode" => 5,
				"ErrMesg" => "Error Code:'0005' \n Critical Error has occured!"
			);
			
			echo json_encode( $aResult );
		}
		
		
	//--------------------------------------------//
	//-- ELSE Assume Format is plain text       --//
	//--------------------------------------------//
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
}




?>