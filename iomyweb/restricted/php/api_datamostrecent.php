<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used to fetch the most recent value for a particular IO
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

if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                           --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                         --//
$sOutput                    = "";           //-- STRING:        Used to store the String that this API passes back to the user has the response body    --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.                                                              --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.                                    --//
$iPostId                    = "";           //-- INTEGER:       Used to store the "IO Id".                                                              --//
$iEndUTS                    = "";           //-- INTEGER:       Holds the current Unix timestamp       .                                                --//
$aResult                    = array();      //-- ARRAY:         Used to store the Results of room Information lookup.                                   --//

//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//


//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	
	//-- 2.1.1 - Setup the array to contain what HTTP POST Parameters to look for and format --//
	$RequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Id',            "DataType"=>'INT' )
	);
	
	//-- 2.1.2- Call the function that checks to make sure the HTTP POST Parameters exist --//
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
	
	//-- Verify that no errors have been found --//
	//if( $aHTTPData===null ) {
	//	$bError = true;
	//	
	//}
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
		//-- NOTE: Valid modes are going to be "MostRecentValue" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="MostRecentValue" && $sPostMode!=="MostRecentTwoValues" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter. \n";
			$sErrMesg .= "eg. \n \"MostRecentValue\" or \"MostRecentTwoValues\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter. \n";
		$sErrMesg .= "eg. \n \"MostRecentValue\" or \"MostRecentTwoValues\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve IO "Id"                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "IOId" --//
			$iPostId = $aHTTPData["Id"];
			
			if( $iPostId===false ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0103' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter.\n";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		} catch( Exception $e0104 ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0104' \n";
			$sErrMesg .= "Incorrect \"Id\" parameter!";
			$sErrMesg .= "Please use a valid \"Id\" parameter.";
			$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
	

}

//====================================================================//
//== 4.0 - PREPARATION FOR MAIN SECTION                             ==//
//====================================================================//
if( $bError===false ) {
	try {
		//--------------------------------------------------------------------//
		//-- 4.2 - Verify that the user can access the IO                   --//
		//--------------------------------------------------------------------//
		
		//-- Call the function that checks if the user has access to the IO --//
		$aTempIOInfo = GetIOInfo($iPostId);
			
		//-- IF no errors have occurred --//
		if( $aTempIOInfo["Error"]===false ) {
			$aIOInfo    = $aTempIOInfo["Data"];
			
		//-- ELSE store the error --//
		} else {
			$bError     = true;
			$sErrMesg  .= "Error Code:'0301' \n";
			$sErrMesg  .= $aTempIOInfo["ErrMesg"];
		}
		
		//--------------------------------------------------------------------//
		//-- 4.3 - Setup the Endstamp                                       --//
		//--------------------------------------------------------------------//
		$iEndUTS = time();
		
	} catch( Exception $e0300 ) {
		$bError = true;
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
		//== 5.1 - MODE: MostRecentValue                                ==//
		//================================================================//
		if( $sPostMode==="MostRecentValue" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup the most recent value                           --//
				//--------------------------------------------------------------------//
				if( $aIOInfo["DataEnumeration"]===0 || $aIOInfo["DataEnumeration"]===2 ) {
					$aTempResult = GetIODataMostRecent( $aIOInfo["DataTypeId"], $iPostId, $iEndUTS, 1 );
					
				} else if( $aIOInfo["DataEnumeration"]===1 ) {
					$aTempResult = GetIODataMostRecentEnum( $aIOInfo["DataTypeId"], $iPostId, $iEndUTS, 1 );
					
				} else {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= "IO has a unrecognised Enumeration type! \n";
					$sErrMesg .= "Please use a valid IO that this API supports! \n";
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Check for errors                                       --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					if( $aTempResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1402' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aTempResult["ErrMesg"];
					} else {
						$aResult = $aTempResult['Data'];
					}
				}
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
		
		//================================================================//
		//== 5.2 - MODE: MostRecentTwoValues                            ==//
		//================================================================//
		} else if( $sPostMode==="MostRecentTwoValues" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Lookup the most recent value                           --//
				//--------------------------------------------------------------------//
				if( $aIOInfo["DataEnumeration"]===0 || $aIOInfo["DataEnumeration"]===2 ) {
					$aTempResult = GetIODataMostRecent( $aIOInfo["DataTypeId"], $iPostId, $iEndUTS, 2 );
					
				} else if( $aIOInfo["DataEnumeration"]===1 ) {
					$aTempResult = GetIODataMostRecentEnum( $aIOInfo["DataTypeId"], $iPostId, $iEndUTS, 2 );
					
				} else {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'2401' \n";
					$sErrMesg .= "IO has a unrecognised Enumeration type! \n";
					$sErrMesg .= "Please use a valid IO that this API supports! \n";
				}
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Check for errors                                       --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					if( $aTempResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aTempResult["ErrMesg"];
					} else {
						$aResult = $aTempResult['Data'];
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
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
//== 8.0 - Log the Results                                          ==//
//====================================================================//




//====================================================================//
//== 9.0 - Finalise                                                 ==//
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
		$sOutput = "Error Code:'0002' \n No Result!";
	
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