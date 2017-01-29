<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for viewing/editing the various IOs that the user has access to.
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
$bError         = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg       = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput        = "";           //-- STRING:        This is the --//
$aResult        = array();      //-- ARRAY:         Used to store the results. --//
$aIOList        = array();      //-- ARRAY:         Used to store the 


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
//-- Non Applicable for this API --//
//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	
/*
	$RequiredParmaters = array(
		array( "Name"=>'Mode',			"DataType"=>'STR' ),
		array( "Name"=>'Id',			"DataType"=>'INT' ),
		array( "Name"=>'Name',			"DataType"=>'STR' ),
		array( "Name"=>'RoomId',		"DataType"=>'INT' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
*/
}

//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//





//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if($bError===false) {
	try {
		//----------------------------------------//
		//-- 5.1 - 
		//----------------------------------------//
		
		//-- Lookup the current time --//
		$iCurrentDate = time();
		
		//-- Lookup All available IOs --//
		$aIOList = IODetection();
		
		//-- If no errors occurred during the function --//
		if( $aIOList["Error"]===true ) {
			//------------------------------------//
			//-- ERROR HAS OCCURRED             --//
			//------------------------------------//
			$bError = true;
			$sErrMesg .= $aIOList["ErrMesg"];
			
		} else {
			if( count($aIOList["Data"])<1 ) {
				$aResult = array();
			} else {
				$aResult = $aIOList["Data"];
			}
		}
	} catch( Exception $e20) {
		$bError = true;
		$sErrMesg .= "E20Debug: ".$e20->getMessage();
	}
}


//====================================================================//
//== 8.0 - LOG THE RESULTS                                          ==//
//====================================================================//





//====================================================================//
//== 9.0 - FINALISE                                                 ==//
//====================================================================//

//-- API didn't encounter an Error --//
//-- NOTE: This API needs to be able to return an empty array --//
if( $bError===false ) {
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