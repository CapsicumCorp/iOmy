<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a special API for use with WatchInputs only.
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
//-- #1.1# - Configure Variables                            --//
//------------------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../../..');
}


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$aRestrictedApiCore                 = array();
$aRestrictedApiCore['DBId']         = 0;      //-- INTEGER:     The database defined in the iomy_vanilla.php file to attempt to login to. --//
$aRestrictedApiCore['LoginResult']  = false;  //-- BOOLEAN:     This is used to flag if the User succeeded in logging in. --//
$aRestrictedApiCore['ValidSession'] = false;  //-- BOOLEAN:     This is used to flag if the User has a valid session. Default is set to false --//
$aRestrictedApiCore['RestrictedDB'] = false;  //-- BOOLEAN:     This is used to flag if there is a Restricted Database Connection. Default is set to false --//


$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used. --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        This is the output that this PHP API returns. --//

$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
$aRequiredParmaters         = array();      //-- ARRAY:         Used to store the expected HTTP POST Parameters.                                                --//
$sPostMode                  = "";           //-- STRING:        Holds the desired Mode that this API should function.                                           --//
$sPostAccess                = "";           //-- STRING:        Holds in JSON string form the Username an Password to log into the Database with.               --//
$sPostData                  = "";           //-- STRING:        Holds in JSON string form the Data of what Links, Things and/or IOs that need to be created.    --//
$aPostAccess                = array();      //-- ARRAY:         The POST 'Access' array after being converted from a JSON string.                               --//
$aPostData                  = array();      //-- ARRAY:         The POST 'Data' array after being converted from a JSON string.                                 --//
$oRestrictedDB              = null;         //-- OBJECT:        Database Access and functions will be stored in this object variable.                           --//
$bTransactionStarted        = false;        //-- BOOLEAN:       Used to indicate if the Transactions has been started so that it knows if rollback is needed.   --//
$iVerPrimary                = 0;            //-- INTEGER:       --//
$iVerSecondary              = 0;            //-- INTEGER:       --//
$sVerTertiary               = 0;            //-- INTEGER:       --//
$aVerTemp                   = array();      //-- ARRAY:         --//

$iLinkId                    = 0;            //-- INTEGER:       --//
$iThingId                   = 0;            //-- INTEGER:       The current ThingId that is either retrieved from the POST Variable or after an Thing Insert occurs. --//


//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/constants.php';
require_once SITE_BASE.'/restricted/libraries/dbmysql.php';
require_once SITE_BASE.'/restricted/libraries/functions.php';
require_once SITE_BASE.'/restricted/libraries/userauth.php';



//------------------------------------------------------------//
//-- 1.4 -              --//
//------------------------------------------------------------//

class PseudoRestrictedAPICore {
	//-- Declare Public Variables --//
	public      $bRestrictedDB          = false;
	public      $oRestrictedDB;
	
	//--  --//
}



//====================================================================//
//== 2.0 - RETRIEVE POST                                            ==//
//====================================================================//

//------------------------------------------------------------//
//-- 2.1 - Fetch the Parameters                             --//
//------------------------------------------------------------//
if($bError===false) {
	$aRequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Version',       "DataType"=>'STR' ),
		array( "Name"=>'Access',        "DataType"=>'STR' ),
		array( "Name"=>'Data',          "DataType"=>'STR' ),
		array( "Name"=>'Id',            "DataType"=>'INT' )
	);
	
	$aHTTPData = FetchHTTPDataParameters( $aRequiredParmaters );
}


//------------------------------------------------------------//
//-- 2.2 - Store the POST Parameters into their variables   --//
//------------------------------------------------------------//
if($bError===false) {
	//----------------------------------------------------//
	//-- 2.2.1 - Extract the API "Mode"                 --//
	//----------------------------------------------------//
	try {
		//-- Extract the "Mode" Parameter --//
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "AddComm", "AddLink", "AddThing", "AddIO" --//
		
		
		//-- Display an error if the mode is unsupported --//
		if( 
			$sPostMode!=="AddComm"               && $sPostMode!=="AddLink"               &&
			$sPostMode!=="AddThing"              && $sPostMode!=="AddIO"                 &&
			$sPostMode!=="ListAllActiveRules"    && $sPostMode!=="UpdateRuleNextTS"      &&
			$sPostMode!=="RuleJustTriggered"     && $sPostMode!=="RuleTriggeredAt"       &&
			$sPostMode!=="SetThingState"         && $sPostMode!=="GetStreamURL"          &&
			$sPostMode!=="LookupCamStreams"      && $sPostMode!=="UpdateCamStreamCount"  
			
		) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddLink\", \"AddThing\", \"AddIO\", \"AddComm\", \"RuleJustTriggered\" & \"RuleTriggeredAt\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddLink\", \"AddThing\", \"AddIO\", \"AddComm\", \"RuleJustTriggered\" & \"RuleTriggeredAt\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve the API "Version"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddComm" || $sPostMode==="AddLink" || $sPostMode==="AddThing" || $sPostMode==="AddIO" ) {
			try {
				$sPostVersion = $aHTTPData["Version"];
				//-- Verify that the mode is supported --//
				if( $sPostVersion==="" ) {
					$bError = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"Mode\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
					$sErrMesg .= "eg. \n \"AddLink\" \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "No \"Mode\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
				$sErrMesg .= "eg. \n \"AddLink\" \n\n";
				//sErrMesg .= e0102.message;
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Extract the "Access" Parameter         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Extract the "Access" Parameter --//
			$sPostAccess = $aHTTPData["Access"];
			
			if( $sPostAccess===false ) {
				$bError = true;
				$iErrCode  = 105;
				$sErrMesg .= "Error Code:'0105' \n";
				$sErrMesg .= "Invalid \"Access\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Access\" parameter\n";
				$sErrMesg .= "eg. \n \n\n";
			}
			
		} catch( Exception $e0106 ) {
			$bError = true;
			$iErrCode  = 106;
			$sErrMesg .= "Error Code:'0106' \n";
			$sErrMesg .= "Incorrect \"Access\" parameter!";
			$sErrMesg .= "Please use a valid \"Access\" parameter";
			$sErrMesg .= "eg. \n \n\n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.4 - Extract the "Data" Parameter           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if(
			$sPostMode==="AddComm"               || $sPostMode==="AddLink"               || 
			$sPostMode==="AddThing"              || $sPostMode==="AddIO"                 || 
			$sPostMode==="RuleTriggeredAt"       || $sPostMode==="SetThingState"         ||
			$sPostMode==="UpdateCamStreamCount" 
		) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData===false ) {
					$bError    = true;
					$iErrCode  = 107;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non string \"Data\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Data\" parameter\n";
				}
				
			} catch( Exception $e0108 ) {
				$bError    = true;
				$iErrCode  = 108;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!";
				$sErrMesg .= "Please use a valid \"Data\" parameter";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.5 - Retrieve "Id"                          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( 
			$sPostMode==="UpdateRuleNextTS"      || $sPostMode==="RuleJustTriggered"     || 
			$sPostMode==="RuleTriggeredAt"       || $sPostMode==="SetThingState"         || 
			$sPostMode==="GetStreamURL"          || $sPostMode==="UpdateCamStreamCount" 
		) {
			try {
				//-- Retrieve the "RuleId" --//
				$iPostId = $aHTTPData["Id"];
				
				if( $iPostId===false ) {
					$bError = true;
					$iErrCode  = 109;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Non numeric \"Id\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Id\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0110 ) {
				$bError = true;
				$iErrCode  = 110;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
}	//-- END of POST --//



//====================================================================//
//== 3.0 - PREPARE                                                  ==//
//====================================================================//
if($bError===false) {
	try {
		//================================================================//
		//== 3.1 - API SUPPORT LIBRARY SELECTION                        ==//
		//================================================================//
		//if( $bError===false ) {
		if( $sPostMode==="AddComm" || $sPostMode==="AddLink" || $sPostMode==="AddThing" || $sPostMode==="AddIO" ) {
			try {
				//------------------------------------------------//
				//-- EXTRACT THE VERSION DATA                   --//
				//------------------------------------------------//
				try {
					
					$aVerTemp = explode( '.', $sPostVersion, 3 );
					
					//var_dump($aVerTemp);
					//--------------------------------//
					//-- PRIMARY VERSION NUMBER     --//
					//--------------------------------//
					if( isset( $aVerTemp[0] ) && is_numeric( $aVerTemp[0] ) ) {
						$iVerPrimary            = intval( $aVerTemp[0] );
						
					} else {
						$bError = true;
						$iErrCode  = 201;
						$sErrMesg .= "Error Code:'0201' \n";
						$sErrMesg .= "Problem with the HTTP POST \"Version\" primary parameter! \n";
					}
					
					
					//--------------------------------//
					//-- SECONDARY VERSION NUMBER   --//
					//--------------------------------//
					if( isset( $aVerTemp[1] ) && is_numeric( $aVerTemp[1] ) ) {
						$iVerSecondary            = intval( $aVerTemp[1] );
					} else {
						$bError = true;
						$iErrCode  = 202;
						$sErrMesg .= "Error Code:'0202' \n";
						$sErrMesg .= "Problem with the HTTP POST \"Version\" secondary parameter! \n";
					}
					
					
					//--------------------------------//
					//-- TERTIARY VERSION NUMBER    --//
					//--------------------------------//
					if( isset( $aVerTemp[2] ) && is_numeric( $aVerTemp[2] ) ) {
						$sVerTertiary            = $aVerTemp[2];
					} else {
						//-- Set the tertiary to 0 --//
						$sVerTertiary = "0";
					}
					
				} catch( Exception $e0204 ) {
					$bError = true;
					$iErrCode  = 204;
					$sErrMesg .= "Error Code:'0204' \n";
					$sErrMesg .= "Problem with the HTTP POST \"Version\" parameter! \n";
					$sErrMesg .= $e0204->getMessage();
				}
				
				//------------------------------------------------//
				//-- LOAD THE APPROPIATE SUPPORT LIBRARY        --//
				//------------------------------------------------//
				//if( $iVerPrimary===0 ) {
					//if( $iVerPrimary ) {
						require_once SITE_BASE.'/restricted/libraries/special/versions/0.4.3.php';
					//}
				//}
				
			} catch( Exception $e0205 ) {
				$bError = true;
				$iErrCode  = 205;
				$sErrMesg .= "Error Code:'0205' \n";
				$sErrMesg .= "Problem when loading the \"Version\" module! \n";
				$sErrMesg .= $e0205->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.2 - CONVERT JSON STRING "ACCESS" TO AN ARRAY             ==//
		//================================================================//
		if( $bError===false ) {
			try {
				//------------------------------------------------//
				//-- "ACCESS" JSON PARSING                      --//
				//------------------------------------------------//
				$aPostAccess = json_decode( $sPostAccess, true );
				
				//------------------------------------------------//
				//-- IF "null" or a false like value            --//
				//------------------------------------------------//
				if( $aPostAccess===null || $aPostAccess==false ) {
					$bError = true;
					$iErrCode  = 206;
					$sErrMesg .= "Error Code:'0206' \n";
					$sErrMesg .= "Invalid HTTP POST \"Access\" parameter ";
				}
				
			} catch( Exception $e0207 ) {
				$bError = true;
				$iErrCode  = 207;
				$sErrMesg .= "Error Code:'0207' \n";
				$sErrMesg .= "Problem with the HTTP POST \"Access\" parameter! \n";
				$sErrMesg .= $e0207->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.3 - EXTRACT THE DATA FROM THE "ACCESS" ARRAY             ==//
		//================================================================//
		if( $bError===false ) {
			try {
				//---------------------------------//
				//-- Check Username & Password   --//
				//---------------------------------//
				if( isset($aPostAccess[0]) && isset($aPostAccess[1]) ) {
					//-- Check to make sure they aren't empty --//
					if( trim($aPostAccess[0])!=="" && trim($aPostAccess[1])!=="" ) {
						
						//$Config['DB'][0]['mode'] = "normal";
						
						//------------------------------------------//
						//-- Open Database Connection             --//
						//------------------------------------------//
						$oRestrictedDB = new DBMySQL(
							$Config['DB'][0],
							$aPostAccess[0],
							$aPostAccess[1]
						);
						
						//var_dump($oRestrictedDB);
						
						
						//------------------------------------------//
						//-- Check if the DB connection succeeded --//
						//------------------------------------------//
						if( $oRestrictedDB->Initialised===true ) {
							
							$oRestrictedApiCore = new PseudoRestrictedAPICore();
							
							$oRestrictedApiCore->oRestrictedDB = $oRestrictedDB;
							$oRestrictedApiCore->bRestrictedDB = true;
							
							
							if( $oRestrictedApiCore->bRestrictedDB===false ) {
								//-- No Database username detected --//
								$bError    = true;
								$iErrCode  = 11;
								$sErrMesg .= "Error Code:'0211' \n";
								$sErrMesg .= "Can't access the database! \n";
								$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
							}
							
						} else {
							//-- LOGIN ATTEMPT HAD AN ERROR --//
							$bError    = true;
							$iErrCode  = 12;
							$sErrMesg .= "Error Code:'0212' \n";
							$sErrMesg .= "Can't access the database! \n";
							$sErrMesg .= "Failed to initialise the database connection.\n";
						}
					} else {
						//-- Parameters are missing --//
						$bError    = true;
						$iErrCode  = 12;
						$sErrMesg .= "Error Code:'0212' \n";
						$sErrMesg .= "Can't access the database! \n";
						$sErrMesg .= "Invalid Username and/or Password parameters.\n";
						
					}
				} else {
					//-- Parameters are missing --//
					$bError    = true;
					$iErrCode  = 12;
					$sErrMesg .= "Error Code:'0012' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Invalid Username and/or Password parameters.\n";
				}
				
			} catch( Exception $e1 ) {
				$bError = true;
				$iErrCode  = 10;
				$sErrMesg .= "Error Code:'0010' \n";
				$sErrMesg .= "Critical error when attempting to access the database! \n";
				$sErrMesg .= $e1->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.4 - CONVERT JSON STRING "DATA" TO AN ARRAY               ==//
		//================================================================//
		if( $bError===false ) {
			if(
				$sPostMode==="AddComm"               || $sPostMode==="AddLink"               || 
				$sPostMode==="AddThing"              || $sPostMode==="AddIO"                 || 
				$sPostMode==="RuleTriggeredAt"       || $sPostMode==="SetThingState"         || 
				$sPostMode==="UpdateCamStreamCount" 
			) {
				try {
					//------------------------------------------------//
					//-- "ACCESS" JSON PARSING                      --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 208;
						$sErrMesg .= "Error Code:'0208' \n";
						$sErrMesg .= "Invalid POST \"Data\" \n";
					}
					
				} catch( Exception $e0209 ) {
					$bError    = true;
					$iErrCode  = 209;
					$sErrMesg .= "Error Code:'0209' \n";
					$sErrMesg .= $e0209->getMessage();
				}
			}
		}
	} catch( Exception $e0200 ) {
		$bError    = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= $e0200->getMessage();
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
			//-- 4.1.1 - Extract 'TriggeredUnixTS'              --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="RuleTriggeredAt" ) {
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
			
			//----------------------------------------------------//
			//-- 4.1.2 - Extract 'Count'                        --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="UpdateCamStreamCount" ) {
					try {
						//-- IF Exists --//
						if( isset( $aPostData['Count'] ) ) {
							//-- IF Numeric --//
							if( is_numeric( $aPostData['Count'] ) ) {
								$iPostCount = intval( $aPostData['Count'] );
								
								//-- IF the number is positive --//
								if( !($iPostCount >= 1) ) {
									//------------------------------------//
									//-- ERROR: Invalid Timestamp       --//
									$bError    = true;
									$iErrCode  = 214;
									$sErrMesg .= "Error Code:'0214' \n";
									$sErrMesg .= "Error: The 'Count' value in the 'Data' JSON parameter is not supported!\n";
									$sErrMesg .= "The value is not greater than or equal to one.";
								}
							} else {
								//------------------------------------//
								//-- ERROR: Non-Numeric             --//
								$bError    = true;
								$iErrCode  = 214;
								$sErrMesg .= "Error Code:'0213' \n";
								$sErrMesg .= "Error: The 'Count' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "Please use a numeric value.\n";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							$bError    = true;
							$iErrCode  = 213;
							$sErrMesg .= "Error Code:'0213' \n";
							$sErrMesg .= "Error: The 'Count' value in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0211 ) {
						$bError = true;
						$iErrCode  = 213;
						$sErrMesg .= "Error Code:'0211' \n";
						$sErrMesg .= "Error: Problem extracting the 'Count' value in the 'Data' JSON parameter!\n";
					}
				}
			}
		}
		
		//------------------------------------------------------------//
		//-- 4.2 - Lookup the Rule Data                             --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( 
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="RuleJustTriggered"  || 
				$sPostMode==="RuleTriggeredAt"  
			) {
				//-- Lookup Rule --//
				$aRuleTemp = GetRuleFromRuleId( $iPostId );
				
				if( $aRuleTemp['Error']===false ) {
					$iPostHubId = $aRuleTemp['Data']['HubId'];
					
					//--------------------------------------------//
					//-- IF Edit Mode                           --//
					//--------------------------------------------//
					if( $sPostMode==="UpdateRuleNextTS" || $sPostMode==="RuleJustTriggered" || $sPostMode==="RuleTriggeredAt" ) {
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
			if( 
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="RuleJustTriggered"  || 
				$sPostMode==="RuleTriggeredAt"  
			) {
				//------------------------------------------------//
				//-- 4.3.1 - Lookup Hub Data for Rule           --//
				//------------------------------------------------//
				if( $bError===false ) {
					$aHubTemp  = WatchInputsHubRetrieveInfoAndPermission( $iPostHubId );
					
					if( $aHubTemp['Error']===true ) {
						$bError    = true;
						$iErrCode  = 240;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the Hub information for the HubId parameter.\n";
						$sErrMesg .= $aHubTemp['ErrMesg'];
					}
				}
				
				//------------------------------------------------//
				//-- 4.3.2 - Lookup PremiseAddress              --//
				//------------------------------------------------//
				if( $bError===false ) {
					$aPremiseAddressTemp = WatchInputsGetPremise( $aHubTemp['Data']['PremiseId'] );
					
					if( $aPremiseAddressTemp['Error']===false ) {
						$sTimezone = $aPremiseAddressTemp['Data']['AddressTimezoneTZ'];
						
					} else {
						$bError    = true;
						$iErrCode  = 250;
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
				$sPostMode==="UpdateRuleNextTS" || $sPostMode==="RuleJustTriggered"  || 
				$sPostMode==="RuleTriggeredAt"  
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
		//-- 4.5 - Lookup the Thing Information                     --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="GetStreamURL" ) {
				try {
					$iOnvifThingTypeId = LookupFunctionConstant("OnvifThingTypeId");
					
					//----------------------------------------------------------------------------//
					//-- 4.5.1 - Lookup Thing Information                                       --//
					//----------------------------------------------------------------------------//
					$aTempFunctionResult1 = WatchInputsGetThingInfo( $iPostId );
					
					if( $aTempFunctionResult1['Error']===false ) {
						
						$iThingTypeId       = $aTempFunctionResult1['Data']['ThingTypeId'];
						$iPostLinkId        = $aTempFunctionResult1['Data']['LinkId'];
						
						if( $iThingTypeId!==$iOnvifThingTypeId ) {
							//-- The ThingId that the user passed is not a Onvif Stream --//
							$bError     = true;
							$iErrCode   = 7201;
							$sErrMesg  .= "Error Code:'7201' \n";
							$sErrMesg  .= "The specified Thing is not a Onvif Stream!\n";
							$sErrMesg  .= "Please use the ThingId of a valid Onvif Stream.\n";
						}
						
					} else {
						//-- The ThingId that the user passed is not a Onvif Stream --//
						$bError     = true;
						$iErrCode   = 7204;
						$sErrMesg  .= "Error Code:'7204' \n";
						$sErrMesg  .= "Failed to find the ThingId of the desired device!\n";
						$sErrMesg  .= "Please use the valid ThingId in the HTTP POST \"Id\" parameter of a Thing that this user has access to.\n";
					}
					
					//----------------------------------------------------------------------------//
					//-- 4.5.2 - Fetch the Info about the Link                                  --//
					//----------------------------------------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult2 = WatchInputsGetLinkInfo( $iPostLinkId );
						
						//-- Extract the desired variables out of the results --//
						if( $aTempFunctionResult2['Error']===false ) {
							//-- Extract the Desired Variables --//
							
							//-- Extract the required variables from the function results --//
							$sPostNetworkAddress    = $aTempFunctionResult2['Data']['LinkConnAddress'];
							$iPostNetworkPort       = $aTempFunctionResult2['Data']['LinkConnPort'];
							$sPostUsername          = $aTempFunctionResult2['Data']['LinkConnUsername'];
							$sPostPassword          = $aTempFunctionResult2['Data']['LinkConnPassword'];
							
							//-- Flag that this request needs to use the "PhilipsHue" PHP Object to update the device --//
							$bUsePHPObject = true;
							
							//-- Lookup the Comm Info --//
							$aCommInfo = WatchInputsGetCommInfo( $aTempFunctionResult2['Data']['LinkCommId'] );
							
							if( $aCommInfo['Error']===false ) {
								//-- Extract the Hub's Comm Type --//
								$iLinkCommType          = $aCommInfo['Data']['CommTypeId'];
								
							} else {
								$bError = true;
								$iErrCode  = 7206;
								$sErrMesg .= "Error Code:'7206' \n";
								$sErrMesg .= "Problem when fetching the Link Comm Info\n";
								$sErrMesg .= $aCommInfo['ErrMesg'];
							}
							
						} else {
							$bError = true;
							$iErrCode  = 7205;
							$sErrMesg .= "Error Code:'7205' \n";
							$sErrMesg .= "Problem when fetching the Link info\n";
							$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
						}
					}
					
					//--------------------------------------------------------------------//
					//-- 4.5.3 - Check if a PHPOnvif class can be created for that IP   --//
					//--------------------------------------------------------------------//
					if( $bError===false ) {
						require_once SITE_BASE.'/restricted/libraries/onvif/main.php';
						
						$oPHPOnvifClient = new PHPOnvif( $sPostNetworkAddress, $iPostNetworkPort, $sPostUsername, $sPostPassword );
						
						if( $oPHPOnvifClient->bInitialised===false ) {
							$bError = true;
							$iErrCode  = 7210; 
							$sErrMesg .= "Error Code:'7210'\n";
							$sErrMesg .= "Couldn't initialise Onvif Class!\n";
							$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
						}
					}
				} catch( exception $e7200 ) {
					$bError = true;
					$iErrCode  = 7200;
					$sErrMesg .= "Error Code:'7200' \n";
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
if($bError===false) {
	try {
		//================================================================//
		//== 5.1 - MODE: Add Link                                       ==//
		//================================================================//
		if( $sPostMode==="AddLink" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.1.1 -                                                    --//
				//----------------------------------------------------------------//
				
				
				
				//----------------------------------------------------------------//
				//-- 5.1.4 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.1.5 - Add the new Link                                   --//
				//----------------------------------------------------------------//
				$aResult = PrepareAddNewLink( $aPostData );
				//-- NOTE: This function requires an allocation of over 20 error codes --//
				
				
				//----------------------------------------------------------------//
				//-- 5.1.6 - Check for errors                                   --//
				//----------------------------------------------------------------//
				if( $aResult["Error"]===true ) {
					//-- Display an Error Message --//
					$bError    = true;
					$iErrCode  = 1421+$aResult["ErrCode"];
					$sErrMesg .= $aResult["ErrMesg"];
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 1400;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
			
		//================================================================//
		//== 5.2 - MODE: Add Thing                                      ==//
		//================================================================//
		} else if( $sPostMode==="AddThing" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.2.1 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.2.4 - Extract the Link Id                                --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( isset( $aPostData['LinkId'] ) ) {
						
						//-- Perform Validation --//
						if ( is_int( $aPostData['LinkId'] ) && $aPostData['LinkId']>0 ) {
							//-- INTEGER --//
							$iLinkId = $aPostData['LinkId'];
							
						} else if( is_string( $aPostData['LinkId'] ) && is_numeric( $aPostData['LinkId'] ) ) {
							//-- STRING --//
							$iLinkId = intval( $aPostData['LinkId'] );
							
						} else {
							//-- Error --//
							$bError    = true;
							$iErrCode  = 2401;
							$sErrMesg .= "Error Code:'2401' \n";
							$sErrMesg .= "Problem with the 'LinkId' variable in the data array!\n";
						}
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2402;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= "Can not detect the 'LinkId' variable in the data array!\n";
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.2.5 - Add the new Thing                                  --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- Add the new thing --//
					$aResult = PrepareAddNewThing( $iLinkId, $aPostData, 0, "", "" );
					
					//-- Check for errors --//
					if( $aResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 2410+$aResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 2400;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Add IO                                         ==//
		//================================================================//
		} else if( $sPostMode==="AddIO" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.3.1 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.3.3 - Extract the Thing Id                               --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( isset($aPostData['ThingId']) ) {
						
						//-- Perform Validation --//
						if ( is_int( $aPostData['ThingId'] ) && $aPostData['ThingId']>0 ) {
							//-- INTEGER --//
							$iThingId = $aPostData['ThingId'];
							
						} else if( is_string( $aPostData['ThingId'] ) && is_numeric( $aPostData['ThingId'] ) ) {
							//-- STRING --//
							$iThingId = intval( $aPostData['ThingId'] );
							
						} else {
							$bError = true;
							$iErrCode  = 3401;
							$sErrMesg .= "Error Code:'3401' \n";
							$sErrMesg .= "Problem with the 'ThingId' variable in the data array!\n";
						}
					} else {
						//-- Error --//
						$bError = true;
						$iErrCode  = 3402;
						$sErrMesg .= "Error Code:'3402' \n";
						$sErrMesg .= "Can not detect the 'ThingId' variable in the data array!\n";
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.3.5 - Add the new IO                                     --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- Add the new thing --//
					$aResult = PrepareAddNewIO( $iThingId, $aPostData, 0 );
					
					//-- Check for errors --//
					if( $aResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 3410+$aResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 3400;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
			
		//================================================================//
		//== 5.4 - MODE: Add Comm                                       ==//
		//================================================================//
		} else if( $sPostMode==="AddComm" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.4.4 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
					
					if( $bTransactionStarted===false ) {
						$bError    = true;
						$iErrCode  = 16;
						$sErrMesg .= "Error Code:'0016' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "Problem when trying to start the transaction! \n";
					}
				}
				
				//----------------------------------------------------------------//
				//-- 5.3.5 - Add the new IO                                     --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					//-- Add the new thing --//
					$aResult = PrepareAddNewComm( $aPostData, 0 );
					
					//-- Check for errors --//
					if( $aResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 4410+$aResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
				
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 4400;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
			
		//================================================================//
		//== 5.5 - MODE: Rules                                          ==//
		//================================================================//
		} else if( 
			$sPostMode==="ListAllActiveRules" || $sPostMode==="UpdateRuleNextTS"   ||
			$sPostMode==="RuleJustTriggered"  || $sPostMode==="RuleTriggeredAt" 
		) {
			
			//----------------------------------------------------//
			//-- 5.5.A - ELSEIF Active Only Rules               --//
			//----------------------------------------------------//
			if( $sPostMode==="ListAllActiveRules" ) {
				$aResult = GetAllRules( true, true );
				
			//----------------------------------------------------//
			//-- 5.5.B - ELSEIF UpdateRuleNextTS                --//
			//----------------------------------------------------//
			} else if( $sPostMode==="UpdateRuleNextTS" ) {
				$aTempFunctionResult4 = RuleNextRunUpdate( $iPostId, $iNextRun );
					
				if( $aTempFunctionResult4['Error']===false ) {
					$aResult = GetRuleFromRuleId( $iPostId );
				} else {
					$bError     = true;
					$iErrCode   = 5401;
					$sErrMesg  .= "Error Code:'5401' \n";
					$sErrMesg  .= "Error: Problem in the main section of the \"".$sPostMode."\" Mode!\n";
					$sErrMesg  .= $aResult['ErrMesg'];
				} 
				
				
			//----------------------------------------------------//
			//-- 5.5.C - ELSEIF Rule Just Trigged               --//
			//----------------------------------------------------//
			} else if( $sPostMode==="RuleJustTriggered" || $sPostMode==="RuleTriggeredAt" ) {
				//--------------------------------------------------------//
				//-- 5.5.C.1 - Prepare                                  --//
				//--------------------------------------------------------//
				
				//------------------------------------//
				//-- IF Mode is RuleJustTriggered   --//
				//------------------------------------//
				if( $sPostMode==="RuleJustTriggered" ) {
					//-- Set the Triggered UnixTS as the current timestamp --//
					$iPostDataLastRunUnixTS = time();
					
				//------------------------------------//
				//-- ELSE Mode is RuleTriggeredAt   --//
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
						$iErrCode  = 5401;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem with the 'TriggeredUnixTS' !\n";
						$sErrMesg .= "The new UnixTS is not newer than the previous UnixTS.";
					}
				}
				
				//--------------------------------------------------------//
				//-- 5.5.C.2 - Calculate next run event time            --//
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
							$iErrCode  = 5430;
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
							$iErrCode  = 5440;
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
			}
			
		//================================================================//
		//== 5.6 - MODE: Set Thing State                                ==//
		//================================================================//
		} else if( $sPostMode==="SetThingState" ) {
			try {
				//------------------------------------------------------------//
				//-- 5.6.2 - Check what the "Desired Thing State"           --//
				//------------------------------------------------------------//
				if( $bError===false ) {
					if( isset( $aPostData['NewState'] ) ) {
						//--------------------------------------------//
						//-- Check if the new state is valid        --//
						//--------------------------------------------//
						if( $aPostData['NewState']===1 || $aPostData['NewState']==="1" ) {
							//-- Turn On --//
							$iNewState = 1;
							
							
						} else if( $aPostData['NewState']===0 || $aPostData['NewState']==="0" ) {
							//-- Turn Off --//
							$iNewState = 0;
							
							
						} else {
							//-- ERROR: Not recognised StateType --//
							$bError    = true;
							$iErrCode  = 6411;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "The provided \"NewState\" value in the \"Data\" JSON Parameter is not valid\"! \n";
						}
						
					} else {
						//-- ERROR: Failed to find the NewState Value --//
						$bError    = true;
						$iErrCode  = 6410;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Failed to find the \"NewState\" value in the \"Data\" JSON Parameter! \n";
					}
				}
				
				//------------------------------------------------------------//
				//-- 5.6.3 - Lookup the required Information                --//
				//------------------------------------------------------------//
				if( $bError===false ) {
					
					//------------------------------------------------------------//
					//-- 3.6.3.1 - Lookup Thing Information                     --//
					//------------------------------------------------------------//
					$aTempResult1 = WatchInputsGetThingInfo( $iPostId );
						
					if( $aTempResult1['Error']===false ) {
						//-- Extract the ThingResults --//
						$aThingInfo = $aTempResult1['Data'];
						
						//-- Lookup the current ThingState --//
						$iOldThingState = $aTempResult1['Data']['ThingStatus'];
						
					} else {
						//-- ERROR: Can't find the requested Thing --//
						$bError    = true;
						$iErrCode  = 6420;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the Thing Information! \n";
					}
					
					
					//------------------------------------------------------------//
					//-- 3.6.3.2 - Lookup Link Information                      --//
					//------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult2 = WatchInputsGetLinkInfo( $aThingInfo['LinkId'] );
						
						//-- Check for errors --//
						if( $aTempResult2['Error']===false ) {
							$aLinkInfo = $aTempResult2['Data'];
							
						} else {
							//-- ERROR: Can't find the requested Link --//
							$bError    = true;
							$iErrCode  = 6424;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem looking up the Link Information! \n";
						}
					}
					
					
					//------------------------------------------------------------//
					//-- 3.6.3.3 - Lookup Comm Information                      --//
					//------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult3 = WatchInputsGetCommInfo( $aLinkInfo['LinkCommId'] );
						
						//-- Check for errors --//
						if( $aTempResult3['Error']===false ) {
							$aCommInfo = $aTempResult3['Data'];
							
						} else {
							//-- ERROR: Can't find the requested Comm --//
							$bError    = true;
							$iErrCode  = 6428;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Problem looking up the Comm Information! \n";
							
						}
					}
				}
				
				//------------------------------------------------------------//
				//-- 5.6.4 - Change the "Desired Thing State"               --//
				//------------------------------------------------------------//
				if( $bError===false ) {
					
					//----------------------------------------//
					//-- IF THE API MANAGES THE THING       --//
					//----------------------------------------//
					if( $aCommInfo['CommTypeId']===LookupFunctionConstant("APICommTypeId") ) {
						
						//----------------------------------------//
						//-- PHILIPS HUE LIGHT                  --//
						//----------------------------------------//
						if( $aThingInfo['ThingTypeId']===LookupFunctionConstant("HueThingTypeId") ) {
							
							require_once SITE_BASE.'/restricted/libraries/philipshue.php';
							
							
							//-- Prepare the Variables --//
							$sNetworkAddress  = $aLinkInfo['LinkConnAddress'];
							$sNetworkPort     = $aLinkInfo['LinkConnPort'];
							$sUserToken       = $aLinkInfo['LinkConnUsername'];
							$sHWId            = strval( $aThingInfo['ThingHWId'] );
							
							$bUsePHPObject     = true;
							$oSpecialPHPObject = new PHPPhilipsHue( $sNetworkAddress, $sNetworkPort, $sUserToken );
							
							
							if( $oSpecialPHPObject->bInitialised===true ) {
								
								$aTempFunctionResult4   = $oSpecialPHPObject->GetLightsList();
								
								//----------------------------//
								//-- LOOKUP THING STATE     --//
								//----------------------------//
								if( isset($aTempFunctionResult4[$sHWId]) ) {
									
									$aTemp = $oSpecialPHPObject->GetThingState($sHWId);
									
									if( $aTemp['Error']===false ) {
										
										//--------------------------------------------//
										//-- IF Lights need to be turned on         --//
										//--------------------------------------------//
										if( $aTemp['State']===false && $iNewState===1 ) {
											//-- Turn "Thing" On --//
											$oSpecialPHPObject->ChangeThingState( $sHWId, $iNewState );
										
										//--------------------------------------------//
										//-- ELSEIF Light needs to be turned off    --//
										//--------------------------------------------//
										} else if( $aTemp['State']===true && $iNewState===0 ) {
											//-- Turn "Thing" Off --//
											$oSpecialPHPObject->ChangeThingState( $sHWId, $iNewState );
											
										//--------------------------------------------//
										//-- ELSE Do nothing                        --//
										//--------------------------------------------//
										}
									}
									
								} else {
									//-- Flag an Error --//
									$bError = true;
									$iErrCode  = 6441;
									$sErrMesg .= "Error Code:'".$iErrCode."' \n";
									$sErrMesg .= "Device is unknown! \n";
									$sErrMesg .= "That particular Philips Hue device may have been disconnected or invalid credentials used!\n";
								}
								
								//--------------------------------------------------------//
								//-- Check for new lights                               --//
								//--------------------------------------------------------//
								try {
									//-- If the User has Write Permission --//
									$aTempFunctionResult5 = $oSpecialPHPObject->AutoAddNewLights( $aThingInfo['LinkId'] );
									
								} catch( Exception $e6442 ) {
									//echo "AutoAdd Error!";
								}
							} else {
								$bError = true;
								$iErrCode  = 6443;
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= "Failed to setup the Philips Hue Gateway!\n";
							}
						} else {
							//-- API doesn't know what to do with that custom state --//
							$bError = true;
							$iErrCode  = 6444;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= "This API hasn't been configured on what to do with this particular Thing Type!";
							
							echo "Actual Type: ".$aThingInfo['ThingTypeId']."\n";
							echo "Expected HueType: ".LookupFunctionConstant("HueThingTypeId")." \n";
						}
						
					//----------------------------------------//
					//-- ELSE SOMETHING ELSE MANAGES IT     --//
					//----------------------------------------//
					}
					
					
					//----------------------------------------------------------------//
					//-- PART 5 - UPDATE THE THING'S STATE IN THE DATABASE          --//
					//----------------------------------------------------------------//
					if( $bError===false ) {
						//-- Change the state --//
						$aResult = ThingChangeState( $iPostId, $iNewState );
						
						//-- Check for errors --//
						if( $aResult["Error"]===true ) {
							//-- Display an Error message --//
							$bError = true;
							$iErrCode  = 6445;
							$sErrMesg .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
						}
					}
				} //-- ENDIF No errors have occurred --//
			} catch( Exception $e6400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 6400;
				$sErrMesg .= "Error Code:'6400' \n";
				$sErrMesg .= $e6400->getMessage();
			}
		
		
		//================================================================//
		//== 5.7 - MODE: FFMPEG Stream                                  ==//
		//================================================================//
		} else if( $sPostMode==="GetStreamURL" || $sPostMode==="LookupCamStreams" || $sPostMode==="UpdateCamStreamCount" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.7.A - MODE GetStreamURL                                  --//
				//----------------------------------------------------------------//
				if( $sPostMode==="GetStreamURL" ) {
					try {
						//----------------------------------------------------//
						//-- IF ONVIF Server                                --//
						//----------------------------------------------------//
						if( $iThingTypeId===$iOnvifThingTypeId ) {
							
							$aResult = WatchInputsGetMostRecentOnvifStreamProfile( $iPostId );
							
							if( $aResult["Error"]===false ) {
								//----------------//
								//-- RTSP       --//
								//----------------//
								$aProfile = array (
									"ProfileToken" => $aResult["Data"]["DataValue"]
								);
								
								$aStreamUriRTSP = $oPHPOnvifClient->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
								
								if( $aStreamUriRTSP['Error']===false ) {
									if( isset( $aStreamUriRTSP['Uri'] ) ) {
										$aResult = array(
											"Error"  => false,
											"Data"   => array(
												$aStreamUriRTSP['Uri'] 
											)
										);
										
										//var_dump( $aStreamUriRTSP['Uri'] );
										//echo "\n\n";
									}
								} else {
									$bError    = true;
									$iErrCode  = 7403;
									$sErrMesg .= "Error Code:'7403' \n";
									$sErrMesg .= "Problem extracting the Stream from the Onvif request!\n";
									$sErrMesg .= $aStreamUriRTSP["ErrMesg"];
								}
							} else {
								//-- ERROR:  --//
								$bError    = true;
								$iErrCode  = 7402;
								$sErrMesg .= "Error Code:'7402' \n";
								$sErrMesg .= "Error loooking up the !\n";
								$sErrMesg .= $aResult['ErrMesg']." \n";
							}
						}
					} catch( Exception $e7401 ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 7401;
						$sErrMesg .= "Error Code:'7401' \n";
						$sErrMesg .= $e7401->getMessage();
					}
					
				//----------------------------------------------------------------//
				//-- 5.7.B - LookupCamStreams                                   --//
				//----------------------------------------------------------------//
				} else if( $sPostMode==="LookupCamStreams" ) {
					try {
						$aResult = WatchInputsGetManagedCameraStreams();
						
						if( $aResult['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7431;
							$sErrMesg .= "Error Code:'7431' \n";
							$sErrMesg .= $aResult['ErrMesg']." \n";
						}
						
					} catch( Exception $e7430 ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 7430;
						$sErrMesg .= "Error Code:'7430' \n";
						$sErrMesg .= $e7430->getMessage();
					}
				//----------------------------------------------------------------//
				//-- 5.7.C - UpdateStreamCount                                  --//
				//----------------------------------------------------------------//
				} else {
					try {
						//------------------------------------------------------//
						//-- STEP 1: Lookup the ThingId to check if it exists --//
						//------------------------------------------------------//
						$aStreamInfo = WatchInputsGetManagedCameraStreamFromThingId( $iPostId );
						
						if( $aStreamInfo['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7462;
							$sErrMesg .= "Error Code:'7462' \n";
							$sErrMesg .= $aStreamInfo['ErrMesg']." \n";
						}
						
						//------------------------------------------------------//
						//-- STEP 2: Update the RunCount                      --//
						//------------------------------------------------------//
						if( $bError===false ) {
							$aResult = WatchInputsUpdateManagedStreamRunCount( $iPostId, $iPostCount );
							
							if( $aResult['Error']===true ) {
								$bError    = true;
								$iErrCode  = 7461;
								$sErrMesg .= "Error Code:'7461' \n";
								$sErrMesg .= $aResult['ErrMesg']." \n";
							}
						}
						
					} catch( Exception $e7460 ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 7460;
						$sErrMesg .= "Error Code:'7460' \n";
						$sErrMesg .= $e7460->getMessage();
					}
				}
			} catch( Exception $e7400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 7400;
				$sErrMesg .= "Error Code:'7400' \n";
				$sErrMesg .= $e7400->getMessage();
			}
			
		//================================================================//
		//== 5.? - ERROR: UNSUPPORTED MODE                              ==//
		//================================================================//
		} else {
			$bError    = true;
			$iErrCode  = 401;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError    = true;
		$iErrCode  = 400;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}


//====================================================================//
//== 7.0 - FINALISE THE TRANSACTION                                 ==//
//====================================================================//
if( $bTransactionStarted===true ) {
	//----------------------------------------//
	//-- SQL COMMIT OR ROLLBACK             --//
	//----------------------------------------//
	if( $bError===false ) {
		//-- Commit the changes --//
		$oRestrictedApiCore->oRestrictedDB->dbEndTransaction();
		
	} else {
		//-- Rollback changes --//
		$oRestrictedApiCore->oRestrictedDB->dbRollback();
		
	}
}


//====================================================================//
//== 8.0 - LOG THE RESULTS                                          ==//
//====================================================================//

//header('Content-Type: text/plain');
//$bError = true;
//if( $oRestrictedDB ) {
	//var_dump( $oRestrictedDB->QueryLogs );
	//echo "\n\n";
//}


//====================================================================//
//== 9.0 - FINALISE                                                 ==//
//====================================================================//

//----------------------------------------//
//-- API didn't encounter an Error      --//
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
//-- API Error has occurred             --//
//----------------------------------------//
} else {
	//-- Set the page to JSON when an error. Note this can be changed to "text/html" or "test/plain". --//
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
}


?>