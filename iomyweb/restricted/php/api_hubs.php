<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is only used so far for editing Hub information.
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


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError         = false;    //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg       = "";       //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput        = "";       //-- STRING:        --//
$aResult        = array();  //-- ARRAY:         Used to store the results. --//
$sPostMode      = "";       //-- STRING:        Used to store which Mode the API should function in. --//
$iPostId        = "";       //-- STRING:        Used to store the "Hub Id" --//
$sPostName      = "";       //-- STRING:        Used to store the desired "Hub Name".  --//
$aHubInfo       = array();  //-- ARRAY:         Used to store the "Hub Information" that most modes in this API depend on.  --//
$iPremiseId     = 0;        //-- INTEGER:       This variable is used to identify the Premise for the Premise Log. --//
$iLogNowUTS     = 0;        //-- INTEGER:       --//
$iPresetLogId   = 0;        //-- INTEGER:       --//
$sLogCustom1    = "";       //-- STRING:        Special variable for the Premise Log. --//

//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//




//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Id',            "DataType"=>'INT' ),
		array( "Name"=>'Name',          "DataType"=>'STR' ),
		array( "Name"=>'Desc',          "DataType"=>'STR' )
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
		//-- NOTE: Valid modes are going to be "EditName" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="EditName" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"EditName\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"EditName\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Hub "Id"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "IOId" --//
			$iPostId = $aHTTPData["Id"];
			
			if( $iPostId===false ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0103' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
			
		} catch( Exception $e0104 ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0104' \n";
			$sErrMesg .= "Incorrect \"Id\" parameter!\n";
			$sErrMesg .= "Please use a valid \"Id\" parameter\n";
			$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve the Hub "Name"              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditName" ) {
			try {
				//-- Retrieve the "Hub name" --//
				$sPostName = $aHTTPData["Name"];
				
				if( $sPostName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105 \n";
					$sErrMesg .= "Invalid \"Name\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Name\" parameter\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Name\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Name\" parameter\n";
			}
		}
	}
}

//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Edit Hub Name                                  ==//
		//================================================================//
		if( $sPostMode==="EditName" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup information about the Hub                       --//
				//--------------------------------------------------------------------//
				$aHubInfo = HubRetrieveInfoAndPermission( $iPostId );
				
				if( !(isset($aHubInfo["Error"])) || $aHubInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1406' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aHubInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aHubInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Hub --//
						$aResult = ChangeHubName( $iPostId, $sPostName );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'1402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iPresetLogId		= 13;
							//$iPremiseId		= $aHubInfo["Data"]["PremiseId"];
							//$sLogCustom1		= $aHubInfo["Data"]["DevicePortName"];
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Hub name! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1100' \n";
				$sErrMesg .= $e1400->getMessage();
			}
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
		}
		
	} catch( Exception $e1000 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e1000->getMessage();
	}
}

//====================================================================//
//== 8.0 - Log the Results                                          ==//
//====================================================================//
if( $bError===false ) {
	try {
		if( $iPresetLogId!==0 ) {
			$iLogNowUTS = time();
			//-- Log the Results --//
			//$aLogResult = AddPresetLogToPremiseLog( $iPresetLogId, $iLogNowUTS, $iPremiseId, $sLogCustom1 );
			//echo "<br />\n";
			//var_dump( $aLogResult );
			//echo "<br />\n";
		}
	} catch( Exception $e0980 ) {
		//-- Error Catching --//
		$bError = true;
		$sErrMesg .= "Error Code:'0980' \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Premise Log Error! \n";
	}
}

//====================================================================//
//== 9.0 - FINALISE                                                 ==//
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
	}

//-- API Error has occurred --//
} else {
	//-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json" --//
	header('Content-Type: text/plain');
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$sOutput = "Error Code:'0002' \n No Result";

	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$sOutput  = "Error Code:'0003' \n Critical Error has occured!\n Undefinable Error Message\n";

	} else if( $sErrMesg!=false ) {
		//-- Output the Error Message --//
		$sOutput  = $sErrMesg;
		
	} else {
		//-- Error Message is blank --//
		$sOutput  = "Error Code:'0004' \n Critical Error has occured!";
	}

	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005' \n Critical Error has occured!";
	}
}


?>