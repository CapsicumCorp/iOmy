<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for viewing the premise logs.
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

//----------------------------------------------------//
//-- 1.1 - DECLARE CONSTANTS                        --//
//----------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//

$bError                     = false;        //-- BOOLEAN:       A flag used to indicate if an error has been caught																	--//
$sErrMesg                   = "";           //-- STRING:        This is used to hold the error message once an error has been caught												--//
$sOutput                    = "";           //-- STRING:        --//
$aResult                    = array();      //-- ARRAY:         --//
$sPostMode                  = "";           //-- STRING:        --//

$sPostPremiseId             = "";           //-- STRING:        The desired Premise's PK while still in string format before it is converted to a integer.	--//
$sPostStartstamp            = "";           //-- STRING:        
$sPostEndstamp              = "";           //-- STRING:        

$iPremiseId                 = 0;            //-- INTEGER:       The Premise's PK after being converted to an integer.	--//
$iStartstamp                = 0;            //-- INTEGER:       The startstamp.	--//
$iEndstamp                  = 0;            //-- INTEGER:       The endstamp.	--//

$aPremiseLogs               = array();      //-- ARRAY:         --//
$aPremiseInfo               = array();      //-- ARRAY:         --//

$sSubArrayNum               = "";           //-- STRING:        --//
$sTempString1               = "";           //-- STRING:        --//
$sTempString2               = "";           //-- STRING:        --//
$sTempString3               = "";           //-- STRING:        --//
$sTempString4               = "";           //-- STRING:        --//


//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';		//-- This should call all the additional libraries needed --//


//------------------------------------------------------------//
//-- 1.4 - Flag an Error is there is no Database access     --//
//------------------------------------------------------------//
if( $oRestrictedApiCore->bRestrictedDB===false ) {
	$bError    = true;
	$sErrMesg .= "Can't access the database! User may not be logged in";
}

//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
	
$RequiredParmaters = array(
	array( "Name"=>'Mode',          "DataType"=>'STR' ),
	array( "Name"=>'Id',            "DataType"=>'INT' ),
	array( "Name"=>'Start',         "DataType"=>'INT' ),
	array( "Name"=>'End',           "DataType"=>'INT' )
);

$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);



//----------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                  --//
//----------------------------------------------------//
if($bError===false) {
	
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "BetweenTimestamps" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="BetweenTimestamps" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"BetweenTimestamps\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"BetweenTimestamps\" \n\n";
		//sErrMesg .= e0011.message;
	}

	//----------------------------------------------------//
	//-- 2.2.2.A - Retrieve "Id" (PremiseId)            --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="BetweenTimestamps" ) {
			try {
				//-- Retrieve the PremiseId --//
				$iPremiseId = $aHTTPData["Id"];
				
				if( $iPremiseId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"Id\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Id\" parameter\n";
					$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
				}
			} catch( Exception $e0013A ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"Id\" parameter!";
				$sErrMesg .= "Please use a valid \"Id\" parameter";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		}
	}

	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve "Start" (UTS Start)         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="BetweenTimestamps" ) {
			try {
				//-- Retrieve the "IOPortId" --//
				$iStartStamp = $aHTTPData["Start"];
				
				if( $iStartStamp===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Non numeric \"Start\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Start\" parameter\n";
				}
			} catch( Exception $e0015A ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Start\" parameter!";
				$sErrMesg .= "Please use a valid \"Start\" parameter";
			}
		}
	}

	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve "Start" (UTS Start)         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="BetweenTimestamps" ) {
			try {
				//-- Retrieve the "IOPortId" --//
				$iEndstamp = $aHTTPData["End"];
				
				if( $iEndstamp===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"End\" parameter! \n";
					$sErrMesg .= "Please use a valid \"End\" parameter\n";
				}
				
			} catch( Exception $e0017A ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"End\" parameter! \n";
				$sErrMesg .= "Please use a valid \"End\" parameter \n";
			}
		}
	}
}

//====================================================================//
//== 3.0 - PREPARATIONS                                             ==//
//====================================================================//
if( $bError===false ) {
	try {
		//--------------------------------------------------------------------//
		//-- 3.1 - MODE: Fetch Logs between timestamps                      --//
		//--------------------------------------------------------------------//
		if( $sPostMode==="BetweenTimestamps" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 3.1.1 - Check to make sure the timestamps seem valid           --//
				//--------------------------------------------------------------------//
				if( $iStartStamp>=1 ) {
					if( $iEndstamp<=$iStartStamp ) {
						$bError = true;
						$sErrMesg .= "Error Code:'1301' \n";
						$sErrMesg .= "Endstamp isn't bigger than the Startstamp! \n";
					} 
				} else {
					$bError = true;
					$sErrMesg .= "Error Code:'1302' \n";
					$sErrMesg .= "Startstamp issues! \n";
				}

				//--------------------------------------------------------------------//
				//-- 3.1.2 - Lookup Existing information about the Premise          --//
				//--------------------------------------------------------------------//
				$aPremiseInfo = GetPremisesInfoFromPremiseId( $iPremiseId );
				
				//--------------------------------------------------------------------//
				//-- 3.1.2 - Check for the "Write" Permission                       --//
				//--------------------------------------------------------------------//
				if( $aPremiseInfo["Error"]===false ) {
					//-- Check if the user has the "Write" permission to the premise --//
					if( $aPremiseInfo["Data"]["PermRead"]!==1 ) {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1305' \n";
						$sErrMesg .= "Access was denied when attempting to make changes to the \"Premise\"! \n";
						$sErrMesg .= "Your user doesn't have the \"Read\" permission for that Premise. ";
					}		//-- Else assume the user has permission and continue --//
					
				} else {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1307' \n";
					$sErrMesg .= $aPremiseInfo["ErrMesg"];
					
					//var_dump($oRestrictedApiCore->oRestrictedDB->QueryLogs);
				}

			} catch( Exception $e1308 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1308' \n";
				$sErrMesg .= $e1308->getMessage();
			}
		}
		
	//--------------------------------------------------------------------//
	//-- UNEXPECTED ERROR                                               --//
	//--------------------------------------------------------------------//
	} catch( Exception $e0300 ) {
		//-- Display an Error Message --//
		$bError    = true;
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
		//== 5.1 - MODE: Edit IO Name                                   ==//
		//================================================================//
		if( $sPostMode==="BetweenTimestamps" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Fetch the premise logs between those times             --//
				//--------------------------------------------------------------------//

				$aPremiseLogs = GetPremiseLogsBetweenUTS( $iPremiseId, $iStartstamp, $iEndstamp );
				
				if( $aPremiseLogs["Error"]===true ) {
					if( $aPremiseLogs["ErrMesg"]==="Error retrieving PremiseLog! \nGet PremiseLog: No Rows Found! Code:0" ) {
						$aPremiseLogs = array(
							"Error"=>false,
							"Data"=>array()
						);
					} else {
						//-- Display the Error Message that the function returned --//
						$bError = true;
						$sErrMesg .= "Error Code:'1401' \n";
						$sErrMesg .= $aPremiseLogs["ErrMesg"];
					}
				}
				
				
				//------------------------------------------------------------//
				//-- 5.1.2 - Fetch the premise logs between those times     --//
				//------------------------------------------------------------//
				if( $bError===false ) {
					
					$aResult["logs"] = array();
					//-- 5.1.3.1 - Foreach Sensor --//
					foreach( $aPremiseLogs["Data"] as $sArrayKey=>$sSubArrayValue ) {
						if( $aPremiseLogs["Data"][$sArrayKey]!=false ) {
							//-- 5.1.3.1.1 - If No Errors have occurred --//
							if( $bError===false ) {
								
								//-- Build the String --//
								$sTempString1 = $aPremiseLogs["Data"][$sArrayKey]["LogPresetDesc"];
								
								//-- Start replacing the appropriate bits of the tempstring --//
								$sTempString2 = str_replace( "{UD}", "'".$aPremiseLogs["Data"][$sArrayKey]["PremiseLogUser"]."'", $sTempString1 );
								
								$sTempString3 = str_replace( "{PN}", "'".$aPremiseLogs["Data"][$sArrayKey]["PremiseName"]."'", $sTempString2 );
								
								$sTempString4 = str_replace( "{C1}", "'".$aPremiseLogs["Data"][$sArrayKey]["PremiseLogCustom1"]."'", $sTempString3 );
								
								$aResult["logs"][] = array( "UTS"=>$aPremiseLogs["Data"][$sArrayKey]["PremiseLogUTS"], "Desc"=>$sTempString4  );
							}	//-- END IF no errors have occurred --//
						}
					} //-- END FOR LOOP that iterates through the sensors --//
				}
				
			} catch( Exception $e1400) {
				//-- Display an Error Message --//
				$bError = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400["message"];
			}
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			//-- Error Catching --//
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Internal API Error! \n";
			$sErrMesg .= "Critical Error: Problem with the API Mode!\n";
			$sErrMesg .= "The Mode appears to be unsupported at this stage.\n";
		}
		
	//================================================================//
	//== Unexpected Error                                           ==//
	//================================================================//
	} catch(Exception $e0400) {
		//-- Error Catching --//
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= "Internal API Error! \n";
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
		echo "Error Code:'0001' \n ".$e0001->getMessage()."\" ";
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