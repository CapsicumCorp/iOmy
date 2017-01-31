<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for editing User Information or changing the user's password.
//== @Copyright: Capsicum Corporation 2015-2016
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

if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        Used to hold this API Request's body when everything is successful.  --//
$aResult                    = array();      //-- ARRAY:         Used to store the results. --//

$aRequiredParameters        = array();      //-- ARRAY:         Used to store an array of which HTTP POST Parameters to collect and what type to format them to. --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//


$iPostUserId                = 0;            //-- INTEGER:       Used to store the UserId.       --//
$iPostPremiseId             = 0;            //-- INTEGER:       Used to store the PremiseId.    --//
$iPostRoomId                = 0;            //-- INTEGER:       Used to store the RoomId.       --//
$sPostData                  = "";           //-- STRING:        --//
$aPostData                  = array();      //-- ARRAY:         --//

$aPremiseResults            = array();      //-- ARRAY:         --//
$aRoomResults               = array();      //-- ARRAY:         --//


$iLogNowUTS                 = 0;            //-- INTEGER:       --//
$iPresetLogId               = 0;            //-- INTEGER:       --//
$sLogCustom1                = "";           //-- STRING:        Special variable for the User Log. --//

//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//




//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$aRequiredParameters = array(
		array( "Name"=>'Mode',                  "DataType"=>'STR' ),
		array( "Name"=>'UserId',                "DataType"=>'INT' ),
		array( "Name"=>'PremiseId',             "DataType"=>'INT' ),
		array( "Name"=>'RoomId',                "DataType"=>'INT' ),
		array( "Name"=>'Data',                  "DataType"=>'STR' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($aRequiredParameters);
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
		//-- NOTE: Valid modes are going to be "UpdatePremisePerms", "UpdateRoomPerms" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="UpdatePremisePerms" && $sPostMode!=="UpdateRoomPerms" && $sPostMode!=="LookupPremisePerms" && $sPostMode!=="LookupRoomPerms" && $sPostMode!=="LookupUsersForPremisePerms" && $sPostMode!=="LookupUsersForRoomPerms" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"UpdatePremisePerms\", \"UpdateRoomPerms\", \"LookupPremisePerms\", \"LookupRoomPerms\", \"LookupUsersForPremisePerms\", or \"LookupUsersForRoomPerms\". \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"UpdatePremisePerms\", \"UpdateRoomPerms\", \"LookupPremisePerms\", \"LookupRoomPerms\", \"LookupUsersForPremisePerms\", or \"LookupUsersForRoomPerms\". \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve the "UserId"                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="UpdatePremisePerms" || $sPostMode==="UpdateRoomPerms" || $sPostMode==="LookupPremisePerms" || $sPostMode==="LookupRoomPerms" ) {
			try {
				//-- Retrieve the "UserId" --//
				$iPostUserId = $aHTTPData["UserId"];
				
				if( $iPostUserId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"UserId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"UserId\" parameter\n";
				}
			} catch( Exception $e0104 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"UserId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"UserId\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve the "PremiseId"               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="UpdatePremisePerms" || $sPostMode==="LookupPremisePerms" || $sPostMode==="LookupUsersForPremisePerms" || $sPostMode==="LookupUsersForRoomPerms" ) {
			try {
				//-- Retrieve the "PremiseId" --//
				$iPostPremiseId = $aHTTPData["PremiseId"];
				
				if( $iPostPremiseId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"PremiseId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"PremiseId\" parameter\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"PremiseId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"PremiseId\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.4 - Retrieve the "RoomId"                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="UpdateRoomPerms" || $sPostMode==="LookupRoomPerms" ) {
			try {
				//-- Retrieve the "RoomId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Invalid \"RoomId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.5 - Retrieve the "Data"                    --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="UpdatePremisePerms" || $sPostMode==="UpdateRoomPerms" ) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Invalid \"Data\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Data\" parameter\n";
				} else {
					$aPostData = json_decode( $sPostData, true );
					
					if( $aPostData===null || $aPostData===false ) {
						$bError    = true;
						$sErrMesg .= "Error Code:'0109' \n";
						$sErrMesg .= "Invalid JSON in the \"Data\" parameter! \n";
						$sErrMesg .= "Please use a valid JSON \"Data\" parameter\n";
					}
				}
				
			} catch( Exception $e0110 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter\n";
			}
		}
	}
}

//====================================================================//
//== 3.0 - PREPARATION                                              ==//
//====================================================================//
if( $bError===false ) {
	try {
		
		
		
	} catch( Exception $e0200 ) {
		
		
	}
}


//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Edit User's Premise Permissions                ==//
		//================================================================//
		if( $sPostMode==="UpdatePremisePerms" ) {
			try {
				
				$aResult = UpdateUserPremisePermissions( $iPostUserId, $iPostPremiseId, $aPostData );
				
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e1400->getMessage();
			}
		
		//================================================================//
		//== 5.2 - MODE: Edit User's Room Permissions                   ==//
		//================================================================//
		} else if( $sPostMode==="UpdateRoomPerms" ) {
			try {
				$aResult = UpdateUserRoomPermissions( $iPostUserId, $iPostRoomId, $aPostData );
				
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Lookup Permissions                             ==//
		//================================================================//
		} else if( $sPostMode==="LookupPremisePerms" || $sPostMode==="LookupRoomPerms" ) {
			try {
				
				if( $sPostMode==="LookupPremisePerms" ) {
					$aResult = LookupUserPremisePermissions( $iPostUserId, $iPostPremiseId );
				} else {
					$aResult = LookupUserRoomPermissions( $iPostUserId, $iPostRoomId );
				}
				
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
		//================================================================//
		//== 5.4 - MODE: Lookup Users                                   ==//
		//================================================================//
		} else if( $sPostMode==="LookupUsersForPremisePerms" || $sPostMode==="LookupUsersForRoomPerms" ) {
			try {
				if( $sPostMode==="LookupUsersForPremisePerms" ) {
					$aResult = SpecialLookupUsersForPremisePerms( $iPostPremiseId );
				} else {
					$aResult = SpecialLookupUsersForRoomPerms( $iPostPremiseId );
				}
				
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
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
//== 9.0 - RETURN THE RESULTS OR ERROR MESSAGE                      ==//
//====================================================================//

//-- API didn't incur an Error --//
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()." ";
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