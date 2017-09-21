<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used for features of "Philips hue" devices.
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

//----------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE           --//
//----------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//



$iPostThingId               = 0;            //-- INTEGER:       This is used to store which "Motion Sensor" ThingId.  --//
$sPostMode                  = "";           //-- STRING:        --//
$iLinkId                    = 0;            //-- INTEGER:       This is used to store which "Motion Sensor" LinkId. --//
$iIOId                      = 0;            //-- INTEGER:       --//

$iNumericCheck1             = 0;            //-- INTEGER:       --//
$iNumericCheck2             = 0;            //-- INTEGER:       --//
$iNumericCheck3             = 0;            //-- INTEGER:       --//
$iNumericCheck4             = 0;            //-- INTEGER:       --//
$bStringCheck               = false;        //-- BOOLEAN:       --//

$aThingInfo                 = array();      //-- ARRAY:         --//
$aIOList                    = array();      //-- ARRAY:         --//
$aIOData                    = array();      //-- ARRAY:         --//

$iLinkTypeId                = 0;            //-- INTEGER:       --//
$iThingTypeId               = 0;            //-- INTEGER:       --//
$iNetvoxMotionLinkTypeId    = 0;            //-- INTEGER:       --//
$iNetvoxMotionThingTypeId   = 0;            //-- INTEGER:       --//

//----------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                --//
//----------------------------------------------------//

//-- Core Libraries --//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//

//-- Add-on Libraries --//
require_once SITE_BASE.'/restricted/libraries/motion/netvox.php';



//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iNetvoxMotionLinkTypeId  = LookupFunctionConstant("NetvoxMotionSensorLinkTypeId");
$iNetvoxMotionThingTypeId = LookupFunctionConstant("NetvoxMotionSensorThingTypeId");



//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//


//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' )
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
		//-- NOTE: Valid modes are going to be "GetMotionData",  --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="GetMotionData" ) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"GetMotionData\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"GetMotionData\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "ThingId"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="GetMotionData" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "LinkId"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="Special" ) {
			try {
				//-- Retrieve the "LinkId" --//
				$iPostLinkId = $aHTTPData["LinkId"];
				
				if( $iPostLinkId===false || !($iPostLinkId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"LinkId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"LinkId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
}


//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		if( $sPostMode==="GetMotionData" ) {
			try {
				//----------------------------------------------------------------//
				//-- Lookup the Motion Sensor Thing Info                        --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					$aThingInfo = GetThingInfo( $iPostThingId );
					
					if( $aThingInfo['Error']===false ) {
						//-- Dump the results --//
						//var_dump( $aThingInfo );
						//echo "\n";
						
						//-- Check that the User has permissions --//
						if( $aThingInfo['Data']['PermRead']===1 && $aThingInfo['Data']['PermDataRead']===1 ) {
							//-- Extract the LinkTypeId and the ThingTypeId for use in validating if this is a supported motion sensor --//
							$iLinkTypeId    = $aThingInfo['Data']['LinkTypeId'];
							$iThingTypeId   = $aThingInfo['Data']['ThingTypeId'];
							
						} else {
							//-- ERROR --//
							$bError = true;
							$iErrCode  = 1203;
							$sErrMesg .= "Error Code:'1203' \n";
							$sErrMesg .= "Insufficient privilleges!\n";
							$sErrMesg .= "Your user is either missing the 'read' or 'dataread' permission!\n";
						}
						
					} else {
						//-- ERROR --//
						$bError = true;
						$iErrCode  = 1202;
						$sErrMesg .= "Error Code:'1202' \n";
						$sErrMesg .= "Problem looking up the ThingInfo!\n";
						$sErrMesg .= $aThingInfo['ErrMesg'];
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- Lookup the IOs on that particular Motion Sensor            --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					$aIOList = GetIOsFromThingId( $iPostThingId );
					
					if( $aIOList['Error']===false ) {
						//-- Dump the results --//
						//echo "\n";
						//var_dump( $aIOList );
						//echo "\n";
						
					} else {
						//-- ERROR --//
						$bError = true;
						$iErrCode  = 1210;
						$sErrMesg .= "Error Code:'1210' \n";
						$sErrMesg .= "Problem looking up the IOs on the Thing!\n";
						$sErrMesg .= $aIOList['ErrMesg'];
					}
				}
				
				
				if( $bError===false ) {
					//-- Check if the LinkTypeId matches up with a known type of motion sensor --//
					
					//============================================//
					//== NETVOX MOTION SENSOR                   ==//
					//============================================//
					if( $iLinkTypeId===$iNetvoxMotionLinkTypeId ) {
						//-- IF Netvox Motion Sensor itself and not the Thermometer --//
						if( $iThingTypeId===$iNetvoxMotionThingTypeId ) {
							
							//-- Prepare for creating the motion sensor object --//
							$aMotionObjectData = array(
								"ObjectState"   => "DBThing",
								"ThingId"       => $iPostThingId
							);
							
							//-- Load up the Netvox Motion Sensor Module --//
							$oMotionSensor = new MotionSensor_Netvox( $aMotionObjectData );
							
						//-- ELSE Possibly a Thermometer --//
						} else {
							$bError     = true;
							$iErrCode   = 1401;
							$sErrMesg  .= "Error Code:'1401' \n";
							$sErrMesg  .= "The ThingId does not match the Motion Sensor component. \n";
							$sErrMesg  .= "Please provide the ThingId to the Motion Sensor component and not something like the Thermometer. \n";
						}
						
					//============================================//
					//== ELSE: UNSUPPORTED DEVICE               ==//
					//============================================//
					} else {
						//-- Display an Error Message --//
						$bError     = true;
						$iErrCode   = 1290;
						$sErrMesg  .= "Error Code:'1290' \n";
						$sErrMesg  .= "Unsupported Motion Sensor! \n";
						$sErrMesg  .= "Please use a supported Motion Sensor. \n";
					}
				}
				
			} catch( Exception $e1201 ) {
				$bError = true;
				$iErrCode  = 1201;
				$sErrMesg .= "Error Code:'1201' \n";
				$sErrMesg .= "Critical Error Occurred!\n";
				$sErrMesg .= "Problem occurred when preparing for the main function\n";
			}
		} //-- ENDIF Mode is GetMotionData --//
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
		//== 5.1 - MODE: Get Motion Data                                ==//
		//================================================================//
		if( $sPostMode==="GetMotionData" ) {
			try {
				//-- Debugging --//
				//var_dump( $oMotionSensor );
				//echo "\n";
				//var_dump( $oMotionSensor->GetMostRecentDBMotion() );
				//echo "\n";
				//var_dump( $oMotionSensor->GetCurrentStatusData() );
				//echo "\n";
				
				
				$aMostRecent    = $oMotionSensor->GetMostRecentDBMotion();
				$aCurrentStatus = $oMotionSensor->GetCurrentStatusData();
				
				
				//-- IF There is both the "Current Status" as well as the "Most Recent Motion" --//
				if( $aMostRecent['Error']===false && $aCurrentStatus['Error']===false ) {
					//----------------------------------------//
					//-- OPTION 1: Ideal                    --//
					//----------------------------------------//
					$aResult = array(
						"Error"     => false,
						"Data"      => array(
							"MostRecentMotion"  => $aMostRecent['Data']['UTS'],
							"CurrentStatus"     => array(
								"Motion"            => $aCurrentStatus['Data']['CurrentMotion'],
								"Tamper"            => $aCurrentStatus['Data']['Tamper'],
								"LowBattery"        => $aCurrentStatus['Data']['LowBattery'],
								"UTS"               => $aCurrentStatus['Data']['UTS'],
							)
						)
					);
					
				//-- ELSE  --//
				} else {
					//----------------------------------------//
					//-- OPTION 2: Never seen a Motion      --//
					//----------------------------------------//
					if( $aCurrentStatus['Error']===false ) {
						$aResult = array(
							"Error"     => false,
							"Data"      => array(
								"MostRecentMotion"  => null,
								"CurrentStatus"     => array(
									"Motion"            => $aCurrentStatus['Data']['CurrentMotion'],
									"Tamper"            => $aCurrentStatus['Data']['Tamper'],
									"LowBattery"        => $aCurrentStatus['Data']['LowBattery'],
									"UTS"               => $aCurrentStatus['Data']['UTS'],
								)
							)
							
						);
						
						
					//----------------------------------------//
					//-- OPTION 3: No Data                  --//
					//----------------------------------------//
					} else {
						$bError = true;
						$iErrCode  = 1401;
						$sErrMesg .= "Error Code:'1401' \n";
						$sErrMesg .= "Couldn't find any data for the Motion Sensor to determine its current status!\n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= $e1400->getMessage();
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
//== 9.0 - FINALISE                                                 ==//
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