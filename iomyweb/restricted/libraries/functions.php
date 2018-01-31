<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a library that has a common list of functions for the APIs
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
//== TABLE OF CONTENTS                                              ==//
//====================================================================//
//-- #1.0#  - Required Libraries                                    --//
//-- #3.0#  - Premise Log Functions                                 --//
//-- #4.0#  - Users Function                                        --//
//-- #5.0#  - Premise Functions                                     --//
//-- #6.0#  - Room Functions                                        --//
//-- #7.0#  - Hub Functions                                         --//
//-- #8.0#  - Comm Functions                                        --//
//-- #9.0#  - Link Functions                                        --//
//-- #10.0# - Thing Functions                                       --//
//-- #11.0# - IO Functions                                          --//
//-- #12.0# - IO Data Functions                                     --//
//-- #12.0# - Graph Functions                                       --//
//-- #15.0# - RSCat & UoM Functions                                 --//
//-- #21.0# - Rules Functions                                       --//
//====================================================================//



//========================================================================================================================//
//== #1.0# - Required PHP Libraries                                                                                     ==//
//========================================================================================================================//
//------------------------------------------------//
//-- #1.1# - Configure Variables                --//
//------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}

//------------------------------------------------//
//-- #1.2# - Load Required Libraries            --//
//------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/http_post.php';
require_once SITE_BASE.'/restricted/libraries/dbfunctions.php';



//========================================================================================================================//
//== #2.0# - Common Functions                                                                                           ==//
//========================================================================================================================//

function LookupFunctionConstant( $sValue ) {
	//-- TODO: Replace this with a better solution --//
	switch( $sValue ) {
		//----------------//
		//-- HUBS       --//
		//----------------//
		case "AndroidWatchInputsHubTypeId":
			return 2;
			
		//----------------//
		//-- COMMS      --//
		//----------------//
		case "DemoCommTypeId":
			return 1;
			
		case "APICommTypeId":
			return 2;
			
		case "ZigbeeCommTypeId":
			return 3;
		
		//----------------//
		//-- LINKS      --//
		//----------------//
		case "GenericZigbeeHALinkTypeId":
			return 2;
		
		case "HueBridgeLinkTypeId":
			return 7;
			
		case "OnvifLinkTypeId":
			return 6;
			
		case "OWMLinkTypeId":
			return 8;
			
		case "NetvoxMotionSensorLinkTypeId":
			return 9;
			
		case "IPCameraLinkTypeId":
			return 14;
			
		case "CSRMeshLinkTypeId":
			return 15;
			
		//----------------//
		//-- THINGS     --//
		//----------------//
		case "HueThingTypeId":
			return 13;
			
		case "OnvifThingTypeId":
			return 12;
		
		case "WeatherThingTypeId":
			return 14;
			
		case "NetvoxMotionSensorThingTypeId":
			return 3;
			
		case "IPCameraMJPEGThingTypeId":
			return 18;
			
		case "LivsmartThingTypeId":
			return 19;
			
		//----------------//
		//-- RSTYPES    --//
		//----------------//
		case "WeatherStationRSTypeId":
			return 1600;
		
		case "TemperatureRSTypeId":
			return 1601;
			
		case "HumidityRSTypeId":
			return 1602;
			
		case "PressureRSTypeId":
			return 1603;
			
		case "ConditionsRSTypeId":
			return 1604;
			
		case "WindDirectionRSTypeId":
			return 1605;
			
		case "WindSpeedRSTypeId":
			return 1606;
			
		case "SunriseRSTypeId":
			return 1607;
			
		case "SunsetRSTypeId":
			return 1608;
			
		case "LightHueRSTypeId":
			return 3901;
			
		case "LightSaturationRSTypeId":
			return 3902;
			
		case "LightBrightnessRSTypeId":
			return 3903;
			
		case "StreamProtocolRSTypeId":
			return 3965;
			
		case "StreamNetworkAddressRSTypeId":
			return 3960;
			
		case "StreamNetworkPortRSTypeId":
			return 3961;
			
		case "StreamUsernameRSTypeId":
			return 3962;
			
		case "StreamPasswordRSTypeId":
			return 3963;
			
		case "StreamPathRSTypeId":
			return 3964;
			
		case "OnvifStreamProfileRSTypeId":
			return 3970;
			
		case "OnvifStreamUrlRSTypeId":
			return 3971;
			
		case "OnvifThumbnailProfileRSTypeId":
			return 3972;
			
		case "OnvifThumbnailUrlRSTypeId":
			return 3973;
			
		case "ModeRSTypeId":
			return 3995;
			
		default:
			return false;
		
	}
	return false;
}




//========================================================================================================================//
//== #?.0# - 																											==//
//========================================================================================================================//


function ConvertDataTypeToName( $iDataType, $bTableName=false ) {
	//--------------------------------------------//
	//-- 1.0 - INITIALISE                       --//
	//--------------------------------------------//
	$bError                 = false;
	$sErrMesg               = "";
	$sConvertedDataType     = "";
	$sName                  = "";
	$sType                  = "";
	$aResult                = array();
	
	
	
	if( $bTableName===false ) {
		//--------------------------------------------//
		//-- Retrieve the DataType                  --//
		//--------------------------------------------//
		switch($iDataType) {
			case 1:
				$sConvertedDataType = "TinyInteger";
				break;
			case 2:
				$sConvertedDataType = "Integer";
				break;
			case 3:
				$sConvertedDataType = "BigInteger";
				break;
			case 4:
				$sConvertedDataType = "Float";
				break;
			case 5:
				$sConvertedDataType = "TinyString";
				break;
			case 6:
				$sConvertedDataType = "ShortString";
				break;
			case 7:
				$sConvertedDataType = "MediumString";
				break;
			case 8:
				$sConvertedDataType = "LongString";
				break;
			case 9:
				$sConvertedDataType = "String255";
				break;
			default:
				$bError = true;
				$sErrMesg = "Unknown Data Type! Type=".$iDataType; 
		}
		
		//-- Prepare the Result (Assuming that an Error hasn't been flagged) --//
		$aResult = array( "Error"=>false, "Value"=>$sConvertedDataType );
		
	} else {
		//--------------------------------------------//
		//-- Retrieve the DataType                  --//
		//--------------------------------------------//
		switch($iDataType) {
			case 1:
				$sName      = "DATATINYINT";
				$sType      = "INT";
				break;
			case 2:
				$sName      = "DATAINT";
				$sType      = "INT";
				break;
			case 3:
				$sName      = "DATABIGINT";
				$sType      = "BINT";
				break;
			case 4:
				$sName      = "DATAFLOAT";
				$sType      = "FLO";
				break;
			case 5:
				$sName      = "DATATINYSTRING";
				$sType      = "STR";
				break;
			case 6:
				$sName      = "DATASHORTSTRING";
				$sType      = "STR";
				break;
			case 7:
				$sName      = "DATAMEDSTRING";
				$sType      = "STR";
				break;
			case 8:
				$sName      = "DATALONGSTRING";
				$sType      = "STR";
				break;
			case 9:
				$sName      = "DATASTRING255";
				$sType      = "STR";
				break;
			default:
				$bError = true;
				$sErrMesg = "Unknown Data Type! Type=".$iDataType; 
		}
		
		//-- Prepare the Result (Assuming that an Error hasn't been flagged) --//
		$aResult = array( "Error"=>false, "Value"=>$sName, "Type"=>$sType );
	}
	//--------------------------------------------//
	//-- Retrieve the DataType                  --//
	//--------------------------------------------//
	
	
	//--------------------------------------------//
	//-- Return Error or Success!               --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- Success! --//
		return $aResult;
		
	} else {
		//-- Failure! --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



//========================================================================================================================//
//== #3.0# - PremiseLog Functions                                                                                       ==//
//========================================================================================================================//
function AddPresetLogToPremiseLog( $iPresetLogId, $iUTS, $iPremiseId, $sCustom1 ) {
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError				= false;			//-- BOOLEAN:	Used to flag when an error has occurred. --//
	$sErrMesg			= "";				//-- STRING:	Once an error has occurred this is the variable that stores the error message. --//	
	$aResult			= array();			//-- ARRAY:		--//
	$aUserId			= array();			//-- ARRAY:		--//
	$iUserId			= 0;				//-- INTEGER:	--//
	$bNumericCheck1		= false;			//-- BOOLEAN:	--//
	
	//------------------------------------------------------------//
	//-- 2.0 - Lookup the User's Id                             --//
	//------------------------------------------------------------//
	try {
		//--------------------------------------------------------//
		//-- 2.1 - Call the function to retrieve the UserId     --//
		//--------------------------------------------------------//
		$aUserId = dbGetCurrentUserDetails();
		
		//------------------------------------------------//
		//-- 2.2.A - If an error has been caught        --//
		if( $aUserId['Error']===true ) {
			//-- Display the Error Message that the function returned --//
			//-- TODO: Write an error message --//
			$bError = true;
			$sErrMesg .= "Error Code:0x9801! \n";
			$sErrMesg .= "Error submitting log to the PremiseLog! \n";
			$sErrMesg .= "Couldn't retrieve the UserId \n";
			$sErrMesg .= $aUserId['ErrMesg'];
			
		//----------------------------------------------------//
		//-- 2.2.B - Else no errors have been caught yet    --//
		} else {
			//--------------------------------------------//
			//-- Extract the User Id from the Array     --//
			$iUserId = $aUserId["Data"]["UserId"];
			
			//--------------------------------//
			//-- Perform an Numeric Check   --//
			$bNumericCheck1 = is_numeric($iUserId);
			
			if( $bNumericCheck1===false ) {
				//-- Flag an error message --//
				$bError = true;
				$sErrMesg .= "Error Code:0x9802! \n";
				$sErrMesg .= "Error submitting log to the PremiseLog! \n";
				$sErrMesg .= "The UserId appears to be corrupted \n";
			}
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Error Code:0x9803! \n";
		$sErrMesg .= "Error submitting log to the PremiseLog! \n";
		$sErrMesg .= "Critical Error when retrieving the UserId \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 8.0 - Store in the logs                                --//
	//------------------------------------------------------------//
	try {
		
		//-- Insert the new premise log into the database --//
		$aResult = dbAddPresetLogToPremiseLog( $iUserId, $iPresetLogId, $iUTS, $iPremiseId, $sCustom1 );
		
		//-- Check to see if any Errors have occurred --//
		if( $aResult["Error"]===true ) {
			//-- Display the Error Message that the function returned --//
			$bError    = true;
			$sErrMesg .= "Error Code:0x9804! \n";
			$sErrMesg .= "Error submitting log to the PremiseLog! \n";
			$sErrMesg .= "Critical Error \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e2 ) {
		$bError    = true;
		$sErrMesg .= "Error Code:0x9805! \n";
		$sErrMesg .= "Error submitting log to the PremiseLog! \n";
		$sErrMesg .= "Critical Error \n";
		$sErrMesg .= $e2->getMessage();
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false);

	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function GetPremiseLogsBetweenUTS( $iPremiseId, $iStartstamp, $iEndstamp ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError			= false;			//-- BOOLEAN:	Used to flag when an error has occurred. --//
	$sErrMesg		= "";				//-- STRING:	Once an error has occurred this is the variable that stores the error message. --//
	$aResult		= array();			//-- ARRAY:		--//
	$aReturn		= array();			//-- ARRAY:		--//
	
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetPremiseLogsBetweenUTS( $iPremiseId, $iStartstamp, $iEndstamp );
		
		if( $aResult["Error"]===true ) {
			//-- Display the Error Message that the function returned --//
			$bError = true;
			$sErrMesg .= "Error retrieving PremiseLog! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1) {
		$bError = true;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Critical Error fetching PremiseLog! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- No Errors --//
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		//-- Error Occurred --//
		$aReturn = array ( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
	return $aReturn;
}


//========================================================================================================================//
//== #4.0# - User Functions                                                                                             ==//
//========================================================================================================================//
function GetCurrentUserDetails() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult		= dbGetCurrentUserDetails();
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	return $aResult;
}



function GetCurrentUserInfo() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult		= dbGetCurrentUserInfo();
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	return $aResult;
}


function GetCurrentUserAddress() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult		= dbGetCurrentUserAddress();
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"User's Address Information wasn't found! \nPlease contact the administrator of this system to look into the issue with your user address!\n" );
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	return $aResult;
}


function ChangeUserInfo( $iUserInfoId, $iGender, $sTitle, $sGivenames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult		= dbChangeUserInformation( $iUserInfoId, $iGender, $sTitle, $sGivenames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber);
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	return $aResult;
}


function ChangeUserPassword( $sPassword ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult		= dbChangeUserPassword( $sPassword );
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	return $aResult;
}


function ChangeUserAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressRegion, $sAddressSubRegion, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangeUserAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressRegion, $sAddressSubRegion, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change User Address! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change User Address! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function InsertUserInfo( $iGenderId, $sTitle, $sGivennames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber, $sDoB ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError     = false;
	$sErrMesg   = "";
	$aResult    = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbInsertUserInfo( $iGenderId, $sTitle, $sGivennames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber, $sDoB );
	
	
	//------------------------------------------------------------//
	//-- 8.0 - Check for errors                                 --//
	//------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		$bError    = true;
		$sErrMesg .= "Problem inserting the User's Info!\n";
		$sErrMesg .= $aResult['ErrMesg'];
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array( "LastId"=>$aResult['LastId'] ) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function InsertUser( $iUserInfoId, $sUsername, $iUserState ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError     = false;
	$sErrMesg   = "";
	$aResult    = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbInsertUser( $iUserInfoId, $sUsername, $iUserState );
	
	//------------------------------------------------------------//
	//-- 8.0 - Check for errors                                 --//
	//------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		$bError    = true;
		$sErrMesg .= "Problem looking up the User's Address!\n";
		$sErrMesg .= $aResult['ErrMesg'];
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array( "LastId"=>$aResult['LastId'] ) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function InsertUserAddress( $iUserId, $iLanguageId, $iRegionId, $sSubRegion, $sPostcode, $iTimezoneId, $sLine1, $sLine2, $sLine3 ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError     = false;
	$sErrMesg   = "";
	$aResult    = array();
	
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbInsertUserAddress( $iUserId, $iLanguageId, $iRegionId, $sSubRegion, $sPostcode, $iTimezoneId, $sLine1, $sLine2, $sLine3 );
	
	
	
	//------------------------------------------------------------//
	//-- 8.0 - Check for errors                                 --//
	//------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		$bError    = true;
		$sErrMesg .= "Problem looking up the User's Server Permissions!\n";
		$sErrMesg .= $aResult['ErrMesg'];
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array( "LastId"=>$aResult['LastId'] ) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function CreateDatabaseUser( $sUsername, $sPassword, $sLocation ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError     = false;
	$sErrMesg   = "";
	$aResult    = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbCreateDatabaseUser( $sUsername, $sPassword, $sLocation );
	
	
	//------------------------------------------------------------//
	//-- 8.0 - Check for errors                                 --//
	//------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		$bError    = true;
		$sErrMesg .= "Problem creating the new user!\n";
		$sErrMesg .= "It could be caused by one of the following reasons.\n";
		$sErrMesg .= "a.) The database user may not have permission to make new users. \n";
		$sErrMesg .= "b.) The user may already exist as a database user.\n";
		//$sErrMesg .= $aResult['ErrMesg'];
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function GetUserServerPermissions() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError     = false;
	$sErrMesg   = "";
	$aResult    = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbGetUserServerPermissions();
	
	
	//------------------------------------------------------------//
	//-- 8.0 - Check for errors                                 --//
	//------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		$bError = true;
		$sErrMesg = "Problem lookinging up the User's Server Permissions!";
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function LookupUserPremisePermissions( $iUserId, $iPremiseId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	$iOwnerPerm             = 0;            //-- INTEGER:   --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is the Owner       --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iOwnerPerm = $aPremiseResults['Data']['PermOwner'];
				
				//-- If the Current User isn't the Owner of the Premise --//
				if( $iOwnerPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"Owner\" permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersPremisePermissions( $iUserId, $iPremiseId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				//-- IF No results found --//
				if( $aPermissionsResult['ErrMesg']==="GetOtherUsersPremisePerms: No Rows Found! Code:1" ) {
					//-- Create the Results --//
					$aResult = array(
						"Owner"       => 0,
						"RoomAdmin"   => 0,
						"Write"       => 0,
						"StateToggle" => 0,
						"Read"        => 0
					);
					
				//-- ELSE Normal Error --//
				} else {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Unexpected error fetching Premise Permissions!\n";
					$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				}
			} else {
				//-- Extract the Permissions Id --//
				if( $aPermissionsResult['Data']['PermId']>=1 ) {
					//-- Create the Results --//
					$aResult = array(
						"Owner"       => $aPermissionsResult['Data']['PermOwner'],
						"RoomAdmin"   => $aPermissionsResult['Data']['PermRoomAdmin'],
						"Write"       => $aPermissionsResult['Data']['PermWrite'],
						"StateToggle" => $aPermissionsResult['Data']['PermStateToggle'],
						"Read"        => $aPermissionsResult['Data']['PermRead']
					);
				}
			}
		}
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

function LookupUserAllPremisePermissions( $iUserId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	$iOwnerPerm             = 0;            //-- INTEGER:   --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is the Owner       --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aUserServerPerms = GetUserServerPermissions();
			if( $aUserServerPerms['Error']===false ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"AddUser\" server permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersAllPremisePermissions( $iUserId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				//-- IF No results found --//
				$bError    = true;
				$iErrCode  = 3;
				$sErrMesg .= "Unexpected error fetching Premise Permissions!\n";
				$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				
			} else {
				//-- Extract the Permissions Id --//
				foreach( $aPermissionsResult['Data'] as $aPremPerm ) {
					if( $aPremPerm['PremiseId']>=1 ) {
						$aTemp = array(
							"PremiseId"   => $aPremPerm['PremiseId'],
							"PremiseName" => $aPremPerm['PremiseName'],
						);
						
						//-- OWNER --//
						if( $aPremPerm['PermOwner']===null || $aPremPerm['PermOwner']===false ) {
							$aTemp["PermOwner"] = 0;
						} else {
							$aTemp["PermOwner"] = $aPremPerm['PermOwner'];
						}
						//-- ROOM ADMIN --//
						if( $aPremPerm['PermRoomAdmin']===null || $aPremPerm['PermRoomAdmin']===false ) {
							$aTemp["PermRoomAdmin"] = 0;
						} else {
							$aTemp["PermRoomAdmin"] = $aPremPerm['PermRoomAdmin'];
						}
						//-- WRITE --//
						if( $aPremPerm['PermWrite']===null || $aPremPerm['PermWrite']===false ) {
							$aTemp["PermWrite"] = 0;
						} else {
							$aTemp["PermWrite"] = $aPremPerm['PermWrite'];
						}
						//-- READ --//
						if( $aPremPerm['PermRead']===null || $aPremPerm['PermRead']===false ) {
							$aTemp["PermRead"] = 0;
						} else {
							$aTemp["PermRead"] = $aPremPerm['PermRead'];
						}
					}
					
					//-- Create the Results --//
					$aResult[] = $aTemp;
				
				}
			}
		}
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

function LookupUserAllRoomPermissions( $iUserId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	$iOwnerPerm             = 0;            //-- INTEGER:   --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is the Owner       --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aUserServerPerms = GetUserServerPermissions();
			if( $aUserServerPerms['Error']===false ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"AddUser\" server permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersAllRoomPermissions( $iUserId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				$bError    = true;
				$iErrCode  = 3;
				$sErrMesg .= "Unexpected error fetching Room Permissions!\n";
				$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				
			} else {
				//-- Extract the Permissions Id --//
				foreach( $aPermissionsResult['Data'] as $aPremPerm ) {
					if( $aPremPerm['RoomId']>=1 ) {
						//-- Create the Results --//
						$aResult[] = array(
							"RoomId"          => $aPremPerm['RoomId'],
							"RoomName"        => $aPremPerm['RoomName'],
							"PremiseId"       => $aPremPerm['RoomPremiseId'],
							"PermWrite"       => $aPremPerm['PermWrite'],
							"PermStateToggle" => $aPremPerm['PermStateToggle'],
							"PermDataRead"    => $aPremPerm['PermDataRead'],
							"PermRead"        => $aPremPerm['PermRead']
						);
					}
				}
			}
		}
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function SpecialLookupUsersForPremisePerms( $iPremiseId ) {
	//-- TODO: The functions that gets used by this may need to be put in object to secure against misuse --//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is the Owner       --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iOwnerPerm = $aPremiseResults['Data']['PermOwner'];
				
				//-- If the Current User isn't the Owner of the Premise --//
				if( $iOwnerPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"Owner\" permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Fetch the UserIds and Display Names          --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aResult = dbSpecialLookupUsersForPremisePerms();
			
			if( $aResult['Error']===true ) {
				$bError = true;
				$iErrCode  = 3;
				$sErrMesg .= "Error when looking up the UserList!\n";
				$sErrMesg .= $aResult['ErrMesg'];
			}
		}
		
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult['Data'] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function UpdateUserPremisePermissions( $iUserId, $iPremiseId, $aDesiredPermissions ) {
	//-- TODO: The functions that gets used by this may need to be put in object to secure against misuse --//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	
	$bDebugging             = false;        //-- BOOLEAN:   --//
	$bNeedsInserting        = false;        //-- BOOLEAN:   --//
	$iOwnerPerm             = 0;            //-- INTEGER:   --//
	$iPremisePermId         = 0;            //-- INTEGER:   --//
	$iFetchedOwnerPerm      = 0;            //-- INTEGER:   --//
	$iNewPermRoomAdmin      = 0;            //-- INTEGER:   --//
	$iNewPermWrite          = 0;            //-- INTEGER:   --//
	$iNewPermStateToggle    = 0;            //-- INTEGER:   --//
	$iNewPermRead           = 0;            //-- INTEGER:   --//
	
	$bDesiredChangePresent  = false;        //-- BOOLEAN:   --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is the Owner       --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iOwnerPerm = $aPremiseResults['Data']['PermOwner'];
				
				//-- If the Current User isn't the Owner of the Premise --//
				if( $iOwnerPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"Owner\" permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersPremisePermissions( $iUserId, $iPremiseId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				//-- IF No results found --//
				if( $aPermissionsResult['ErrMesg']==="GetOtherUsersPremisePerms: No Rows Found! Code:1" ) {
					$bNeedsInserting = true;
					
				//-- ELSE Normal Error --//
				} else {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Unexpected error fetching Premise Permissions!\n";
					$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				}
			} else {
				//-- Extract the Permissions Id --//
				if( $aPermissionsResult['Data']['PermId']>=1 ) {
					$iPremisePermId      = $aPermissionsResult['Data']['PermId'];
					$iFetchedOwnerPerm   = $aPermissionsResult['Data']['PermOwner'];
					$iNewPermRoomAdmin   = $aPermissionsResult['Data']['PermRoomAdmin'];
					$iNewPermWrite       = $aPermissionsResult['Data']['PermWrite'];
					$iNewPermStateToggle = $aPermissionsResult['Data']['PermStateToggle'];
					$iNewPermRead        = $aPermissionsResult['Data']['PermRead'];
					
					if( $iFetchedOwnerPerm===1 ) {
						$bError    = true;
						$iErrCode  = 4;
						$sErrMesg .= "Permissions Error!\n";
						$sErrMesg .= "The target user is flagged as an \"Owner\"!.\n";
						$sErrMesg .= "The API can not revoke an Owner's permission to their own Premise.\n";
					}
				}
			}
		}
		
		
		//--------------------------------------------------------//
		//-- 5.4 - Parse the desired Permissions changes        --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			//--------------------//
			//-- ROOMADMIN      --//
			//--------------------//
			if( isset( $aDesiredPermissions['RoomAdmin']) ) {
				if( $aDesiredPermissions['RoomAdmin']===0 || $aDesiredPermissions['RoomAdmin']===1 ) {
					$iNewPermRoomAdmin     = $aDesiredPermissions['RoomAdmin'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- WRITE          --//
			//--------------------//
			if( isset( $aDesiredPermissions['Write']) ) {
				if( $aDesiredPermissions['Write']===0 || $aDesiredPermissions['Write']===1 ) {
					$iNewPermWrite         = $aDesiredPermissions['Write'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- STATETOGGLE    --//
			//--------------------//
			if( isset( $aDesiredPermissions['StateToggle']) ) {
				if( $aDesiredPermissions['StateToggle']===0 || $aDesiredPermissions['StateToggle']===1 ) {
					$iNewPermStateToggle   = $aDesiredPermissions['StateToggle'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- READ           --//
			//--------------------//
			if( isset( $aDesiredPermissions['Read']) ) {
				if( $aDesiredPermissions['Read']===0 || $aDesiredPermissions['Read']===1 ) {
					$iNewPermRead          = $aDesiredPermissions['Read'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- DEBUGGING      --//
			//--------------------//
			if( isset( $aDesiredPermissions['Debugging']) ) {
				if( $aDesiredPermissions['Debugging']===1 ) {
					$bDebugging = true;
				}
			}
			
			//--------------------//
			//-- ERROR CHECKING --//
			//--------------------//
			if( $bDesiredChangePresent===false ) {
				//-- Error - No desired changes present --//
				$bError    = true;
				$iErrCode  = 5;
				$sErrMesg .= "No compatible desired changes present! \n";
				//var_dump( $aDesiredPermissions );
			}
			
			
		}
		
		//--------------------------------------------------------//
		//-- 5.5 - Update the User Premise Permissions          --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			//----------------------------------------//
			//-- 5.5.2 - Update the Database        --//
			//----------------------------------------//
			if( $bDebugging===true ) {
				echo "Insert          = ".$bNeedsInserting."\n";
				echo "Premise Perm    = ".$iPremisePermId."\n";
				echo "New RoomAdmin   = ".$iNewPermRoomAdmin."\n";
				echo "New Write       = ".$iNewPermWrite."\n";
				echo "New StateToggle = ".$iNewPermStateToggle."\n";
				echo "New Read        = ".$iNewPermRead."\n";
				
				$bError = true;
				$sErrMesg = "Debugging";
				
			//-- IF Needs inserting into the database --//
			} else if( $bNeedsInserting===true ) {
				$aResult = dbInsertUserPremisePermissions( $iUserId, $iPremiseId, $iNewPermRoomAdmin, $iNewPermWrite, $iNewPermStateToggle, $iNewPermRead );
				
			//-- ELSE Update the existing Permissions entry --//
			} else {
				$aResult = dbUpdateUserPremisePermissions( $iPremisePermId, $iNewPermRoomAdmin, $iNewPermWrite, $iNewPermStateToggle, $iNewPermRead );
			}
		}
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array("Success"=>true) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function SpecialLookupUsersForRoomPerms( $iPremiseId ) {
	//-- TODO: The functions that gets used by this may need to be put in object to secure against misuse --//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	
	
	//------------------------------------------------------------//
	//-- 5.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		//--------------------------------------------------------//
		//-- 5.2 - Check if the Current User is a RoomAdmin     --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iOwnerPerm = $aPremiseResults['Data']['PermRoomAdmin'];
				
				//-- If the Current User isn't a RoomAdmin of the Premise --//
				if( $iOwnerPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 1;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"RoomAdmin\" permission needed to perform this operation.";
					//var_dump($aPremiseResults);
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.3 - Fetch the UserIds and Display Names          --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aResult = dbSpecialLookupUsersForRoomPerms( $iPremiseId );
			
			if( $aResult['Error']===true ) {
				$bError = true;
				$sErrMesg .= "Error when looking up the UserList!\n";
				$sErrMesg .= $aResult['ErrMesg'];
			}
		}
		
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult['Data'] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function LookupUserRoomPermissions( $iUserId, $iRoomId ) {
	//-- TODO: The functions that gets used by this may need to be put in object to secure against misuse --//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	
	$iPremiseId             = 0;            //-- INTEGER:   --//
	$iRoomAdminPerm         = 0;            //-- INTEGER:   --//
	
	//------------------------------------------------------------//
	//-- 3.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		//--------------------------------------------------------//
		//--- 3.1 Lookup which Premise the Room is located in   --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aRoomPremiseId = dbSpecialRoomPremiseIdLookup( $iRoomId );
			
			if( $aRoomPremiseId['Error']===false ) {
				if( $aRoomPremiseId['Data']['PremiseId']>=1 ) {
					$iPremiseId = $aRoomPremiseId['Data']['PremiseId'];
					
				} else {
					$bError    = true;
					$iErrCode  = 2;
					$sErrMesg .= "Problem looking up the Room! \n";
					$sErrMesg .= "There might be something wrong with the Room.";
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aRoomPremiseId['ErrMesg'];
			}
			
		}
		
		
		//--------------------------------------------------------//
		//-- 3.2 Check if the User has the "RoomAdmin" Perm     --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iRoomAdminPerm = $aPremiseResults['Data']['PermRoomAdmin'];
				
				//-- If the Current User isn't a room admin of the premise --//
				if( $iRoomAdminPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"RoomAdmin\" permission needed to perform this operation.";
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 4;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		
		//--------------------------------------------------------//
		//-- 3.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersRoomPermissions( $iUserId, $iRoomId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				//-- IF No results found --//
				if( $aPermissionsResult['ErrMesg']==="GetOtherUsersRoomPerms: No Rows Found! Code:1" ) {
					//-- Create the Results --//
					$aResult = array(
						"Read"        => 0,
						"Write"       => 0,
						"StateToggle" => 0,
						"DataRead"    => 0
					);
					
				//-- ELSE Normal Error --//
				} else {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Unexpected error fetching Room Permissions!\n";
					$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				}
			} else {
				//-- Extract the Permissions Id --//
				if( $aPermissionsResult['Data']['PermId']>=1 ) {
					
					//-- Create the Results --//
					$aResult = array(
						"Read"        => $aPermissionsResult['Data']['PermRead'],
						"Write"       => $aPermissionsResult['Data']['PermWrite'],
						"StateToggle" => $aPermissionsResult['Data']['PermStateToggle'],
						"DataRead"    => $aPermissionsResult['Data']['PermDataRead']
					);
				}
			}
		}
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function UpdateUserRoomPermissions( $iUserId, $iRoomId, $aDesiredPermissions ) {
	//-- TODO: The functions that gets used by this may need to be put in object to secure against misuse --//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError                 = false;        //-- BOOLEAN:   --//
	$iErrCode               = 0;            //-- INTEGER:   --//
	$sErrMesg               = "";           //-- STRING:    --//
	$aResult                = array();      //-- ARRAY:     --//
	
	$bDebugging             = false;        //-- BOOLEAN:   --//
	$bNeedsInserting        = false;        //-- BOOLEAN:   --//
	$iPremiseId             = 0;            //-- INTEGER:   --//
	$iRoomPermId            = 0;            //-- INTEGER:   --//
	$iNewPermDataRead       = 0;            //-- INTEGER:   --//
	$iNewPermWrite          = 0;            //-- INTEGER:   --//
	$iNewPermStateToggle    = 0;            //-- INTEGER:   --//
	$iNewPermRead           = 0;            //-- INTEGER:   --//
	
	$bDesiredChangePresent  = false;        //-- BOOLEAN:   --//
	
	//------------------------------------------------------------//
	//-- 3.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		//--------------------------------------------------------//
		//--- 3.1 - Lookup which Premise the Room is located in --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aRoomPremiseId = dbSpecialRoomPremiseIdLookup( $iRoomId );
			
			if( $aRoomPremiseId['Error']===false ) {
				if( $aRoomPremiseId['Data']['PremiseId']>=1 ) {
					$iPremiseId = $aRoomPremiseId['Data']['PremiseId'];
					
				} else {
					$bError    = true;
					$iErrCode  = 2;
					$sErrMesg .= "Problem looking up the Room! \n";
					$sErrMesg .= "There might be something wrong with the Room.";
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aRoomPremiseId['ErrMesg'];
			}
			
		}
		
		
		//--------------------------------------------------------//
		//-- 3.2 - Check if the User has the "RoomAdmin" Perm   --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseResults = GetPremisesInfoFromPremiseId( $iPremiseId );
			
			if( $aPremiseResults['Error']===false ) {
				//-- Extract the Owner Permission --//
				$iRoomAdminPerm = $aPremiseResults['Data']['PermRoomAdmin'];
				
				//-- If the Current User isn't a room admin of the premise --//
				if( $iRoomAdminPerm!==1 ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"RoomAdmin\" permission needed to perform this operation.";
				}
				
			} else {
				$bError    = true;
				$iErrCode  = 4;
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $aPremiseResults['ErrMesg'];
			}
		}
		
		
		//--------------------------------------------------------//
		//-- 3.3 - Check if the User has a permissions entry    --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			$aPermissionsResult = dbSpecialOtherUsersRoomPermissions( $iUserId, $iRoomId );
			
			//-- IF An error occurred in the results --//
			if( $aPermissionsResult['Error']===true ) {
				//-- IF No results found --//
				if( $aPermissionsResult['ErrMesg']==="GetOtherUsersRoomPerms: No Rows Found! Code:1" ) {
					$bNeedsInserting = true;
					
				//-- ELSE Normal Error --//
				} else {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Unexpected error fetching Room Permissions!\n";
					$sErrMesg .= "Check with your iOmy Administrator on if there is a version mismatch!\n";
				}
			} else {
				//-- Extract the Permissions Id --//
				if( $aPermissionsResult['Data']['PermId']>=1 ) {
					$iRoomPermId         = $aPermissionsResult['Data']['PermId'];
					
					$iNewPermRead        = $aPermissionsResult['Data']['PermRead'];
					$iNewPermWrite       = $aPermissionsResult['Data']['PermWrite'];
					$iNewPermStateToggle = $aPermissionsResult['Data']['PermStateToggle'];
					$iNewPermDataRead    = $aPermissionsResult['Data']['PermDataRead'];
					
					if( !($iRoomPermId>=1) ) {
						$bError    = true;
						$iErrCode  = 4;
						$sErrMesg .= "Permissions Error!\n";
						$sErrMesg .= "Error when fetching the Room Permissions Id.";
					}
				}
			}
		}
		
		
		//--------------------------------------------------------//
		//-- 3.4 - Parse the desired Permissions changes        --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			//--------------------//
			//-- WRITE          --//
			//--------------------//
			if( isset( $aDesiredPermissions['Write']) ) {
				if( $aDesiredPermissions['Write']===0 || $aDesiredPermissions['Write']===1 ) {
					$iNewPermWrite         = $aDesiredPermissions['Write'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- READ           --//
			//--------------------//
			if( isset( $aDesiredPermissions['Read']) ) {
				if( $aDesiredPermissions['Read']===0 || $aDesiredPermissions['Read']===1 ) {
					$iNewPermRead          = $aDesiredPermissions['Read'];
					$bDesiredChangePresent = true;
				}
			}
			
			//--------------------//
			//-- STATETOGGLE    --//
			//--------------------//
			if( isset( $aDesiredPermissions['StateToggle']) ) {
				if( $aDesiredPermissions['StateToggle']===0 || $aDesiredPermissions['StateToggle']===1 ) {
					$iNewPermStateToggle   = $aDesiredPermissions['StateToggle'];
					$bDesiredChangePresent = true;
				}
			}
			
			
			//--------------------//
			//-- DATA READ      --//
			//--------------------//
			if( isset( $aDesiredPermissions['DataRead']) ) {
				if( $aDesiredPermissions['DataRead']===0 || $aDesiredPermissions['DataRead']===1 ) {
					$iNewPermDataRead      = $aDesiredPermissions['DataRead'];
					$bDesiredChangePresent = true;
				}
			}
			
			
			//--------------------//
			//-- DEBUGGING      --//
			//--------------------//
			if( isset( $aDesiredPermissions['Debugging']) ) {
				if( $aDesiredPermissions['Debugging']===1 ) {
					$bDebugging = true;
				}
			}
			
			//--------------------//
			//-- ERROR CHECKING --//
			//--------------------//
			if( $bDesiredChangePresent===false ) {
				//-- Error - No desired changes present --//
				$bError    = true;
				$iErrCode  = 5;
				$sErrMesg .= "No compatible desired changes present! \n";
				//var_dump( $aDesiredPermissions );
			}
		}
		
		//--------------------------------------------------------//
		//-- 5.5 - Update the User Room Permissions             --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			//----------------------------------------//
			//-- 5.5.2 - Update the Database        --//
			//----------------------------------------//
			 if( $bDebugging===true ) {
				echo "Insert          = ".$bNeedsInserting."\n";
				echo "Room Perm       = ".$iRoomPermId."\n";
				echo "New Write       = ".$iNewPermWrite."\n";
				echo "New StateToggle = ".$iNewPermStateToggle."\n";
				echo "New Read        = ".$iNewPermRead."\n";
				echo "New DataRead    = ".$iNewPermDataRead."\n";
				
				$bError = true;
				$sErrMesg = "Debugging";
				
			//-- IF Needs inserting into the database --//
			} else if( $bNeedsInserting===true ) {
				$aResult = dbInsertUserRoomPermissions( $iUserId, $iRoomId, $iNewPermRead, $iNewPermWrite, $iNewPermStateToggle, $iNewPermDataRead );
				
				if( $aResult['Error']===true ) {
					$bError    = true;
					$iErrCode  = 5;
					$sErrMesg .= "Problem inserting the User Room Permissions! \n";
					$sErrMesg .= $aResult['ErrMesg'];
				}
				
				
			//-- ELSE Update the existing Permissions entry --//
			} else {
				$aResult = dbUpdateUserRoomPermissions( $iRoomPermId, $iNewPermRead, $iNewPermWrite, $iNewPermStateToggle, $iNewPermDataRead );
				
				if( $aResult['Error']===true ) {
					$bError    = true;
					$iErrCode  = 5;
					$sErrMesg .= "Problem updating the User Room Permissions! \n";
					$sErrMesg .= $aResult['ErrMesg'];
				}
			}
		}
		
	} catch( Exception $e0001 ) {
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0001->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array("Success"=>true) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function ChangeUserState( $iUserId, $iUserState ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError           = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$iErrCode         = 0;                //-- INTEGER:       --//
	$sErrMesg         = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult          = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aUserServerPerms = array();          //-- ARRAY:         --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		
		//-- Check if the User has Add User Permissions --//
		$aUserServerPerms = GetUserServerPermissions();
		
		
		if( $aUserServerPerms['Error']===false ) {
			//-- Check if the variable is set --//
			if( isset($aUserServerPerms['Data']['PermServerAddUser']) ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']===1 ) {
					
					//-- Update the User State --//
					$aResult = dbChangeUserState( $iUserId, $iUserState );
					
					if( $aResult["Error"]===true ) {
						$bError = true;
						$iErrCode  = 4;
						$sErrMesg .= "Error occurred when attempting to change the user state! \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
					
				} else {
					//-- ERROR: User doesn't have permission --//
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "The user doesn't seem to have permission to change the user state.\n";
				}
				
			} else {
				//-- ERROR: Can not see the correct permission --//
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Unexpected error when looking up the current user's permissions to change the user state.\n";
			}
		} else {
			//-- ERROR:  --//
			$bError    = true;
			$iErrCode  = 1;
			$sErrMesg .= "Problem looking up the current user's server permissions.\n";
			$sErrMesg .= $aUserServerPermissions['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$iErrCode  = 0;
		$sErrMesg .= "Critical Error occurred when attempting to change the user state! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg, "ErrCode"=>$iErrCode );
		
	}
}


function GetAllUsers() {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError           = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg         = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult          = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aUserServerPerms = array();          //-- ARRAY:         --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		
		//-- Check if the User has Add User Permissions --//
		$aUserServerPerms = GetUserServerPermissions();
		
		
		if( $aUserServerPerms['Error']===false ) {
			//-- Check if the variable is set --//
			if( isset($aUserServerPerms['Data']['PermServerAddUser']) ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']===1 ) {
					
					//-- Update the User State --//
					$aResult = dbGetAllUsers();
					
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg .= "Error occurred when attempting to lookup the user list! \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
					
				} else {
					//-- ERROR: User doesn't have permission --//
					$bError    = true;
					$sErrMesg .= "The user doesn't seem to have permission to lookup the user list.\n";
				}
				
			} else {
				//-- ERROR: Can not see the correct permission --//
				$bError    = true;
				$sErrMesg .= "Unexpected error when looking up the current user's permissions to lookup the user list.\n";
			}
		} else {
			//-- ERROR:  --//
			$bError    = true;
			$sErrMesg .= "Problem looking up the current user's server permissions.\n";
			$sErrMesg .= $aUserServerPermissions['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the user list! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}

//========================================================================================================================//
//== #5.0# - Premise Functions                                                                                          ==//
//========================================================================================================================//
function GetAllPremiseInfo() {
	//------------------------------------------------//
	//-- 1.0 - Declare Variables                    --//
	//------------------------------------------------//
	$aResult = array();
	
	
	//------------------------------------------------//
	//-- 5.0 - Fetch from the Database              --//
	//------------------------------------------------//
	try {
		//-- Lookup all Premise Info --//
		$aResult = dbGetAllPremiseInfo();
		
		//-- Check for errors --//
		if( $aResult["Error"]===true ) {
			$aResult = array( "Error"=>true, "ErrMesg"=>"No Premise found! \nYour user account doesn't seem to have permission to access at least one premise!\n" );
		}
		
	} catch( Exception $e1 ) {
		$aResult = array( "Error"=>true, "ErrMesg"=>"Critical Error! \nProblem when looking up the info on all the premises.\n" );
		
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the result                    --//
	//------------------------------------------------//
	return $aResult;
}


function GetPremisesInfoFromPremiseId( $iId ) {
	//-- Retrieve all the premises --//
	$aResult = dbGetPremisesInfoFromPremiseId( $iId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Premise wasn't found! \nPremise either doesn't exist or you do not have permission to access it!\n" );
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//-- Return the results --//
	return $aResult;
}


function GetPremiseFromHubId( $iHubId ) {
	$aResult = dbGetPremiseFromHubId( $iHubId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Premise wasn't found! \nPremise either doesn't exist or you do not have permission to access it!\n" );
	} 
	
	//-- Return the results --//
	return $aResult;
}

function GetPremisesAddressFromPremiseId($iPremiseId) {
	//-- Retrieve all the premises --//
	$aResult = dbGetPremisesAddressFromPremiseId($iPremiseId);
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Premise and/or its Address wasn't found! \nPremise may not exist, is incorrectly setup or your user may not have permission to access this premise!\n" );
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//-- Return the results --//
	return $aResult;
}


function ChangePremiseName( $iPremiseId, $sPremiseName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();

	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangePremiseName( $iPremiseId, $sPremiseName );
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Premise name! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Premise name! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS		--//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE		--//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ChangePremiseDesc( $iPremiseId, $sPremiseDescription ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangePremiseDesc( $iPremiseId, $sPremiseDescription );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Premise description! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Premise description! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ChangePremiseAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressRegion, $sAddressSubRegion, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangePremiseAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressRegion, $sAddressSubRegion, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Premise address! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Premise address! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ChangePremiseInfo( $aPremiseInfo, $sPostInfoOccupants, $sPostInfoBedrooms, $sPostInfoFloors, $sPostInfoRooms ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangePremiseInfo( $aPremiseInfo, $sPostInfoOccupants, $sPostInfoBedrooms, $sPostInfoFloors, $sPostInfoRooms );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Premise info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Premise info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function SpecialGetAllPremises() {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError           = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg         = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult          = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aUserServerPerms = array();          //-- ARRAY:         --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		
		//-- Check if the User has Add User Permissions --//
		$aUserServerPerms = GetUserServerPermissions();
		
		
		if( $aUserServerPerms['Error']===false ) {
			//-- Check if the variable is set --//
			if( isset($aUserServerPerms['Data']['PermServerAddUser']) ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']===1 ) {
					
					//-- Update the User State --//
					$aResult = dbSpecialGetAllPremises();
					
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg .= "Error occurred when attempting to lookup the premise list! \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
					
				} else {
					//-- ERROR: User doesn't have permission --//
					$bError    = true;
					$sErrMesg .= "The user doesn't seem to have permission to lookup the premise list.\n";
				}
				
			} else {
				//-- ERROR: Can not see the correct permission --//
				$bError    = true;
				$sErrMesg .= "Unexpected error when looking up the current user's permissions to lookup the premise list.\n";
			}
		} else {
			//-- ERROR:  --//
			$bError    = true;
			$sErrMesg .= "Problem looking up the current user's server permissions.\n";
			$sErrMesg .= $aUserServerPermissions['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the premise list! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}
//========================================================================================================================//
//== #6.0# - Rooms Functions                                                                                            ==//
//========================================================================================================================//
function GetRoomInfoFromRoomId( $iRoomId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetRoomInfoFromRoomId( $iRoomId );
		
		if( $aResult["Error"]===true ) {
			if( $aResult["ErrMesg"]==="GetRoomInfoFromId: No Rows Found! Code:1" ) {
				$bError = true;
				$sErrMesg .= "Room not found! \nRoom either doesn't exist or you do not have permission to access it!\n";
				
			} else {
				$bError = true;
				$sErrMesg .= "Error occurred when attempting to lookup Room Info! \n";
				$sErrMesg .= $aResult["ErrMesg"];
			}
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup Room Info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function ValidateRoomAccess( $iRoomId, $iDesiredPremiseId ) {
	//----------------------------------------------------------------//
	//-- DESCRIPTION:                                               --//
	//-- This function is for verifing that the User can access the --//
	//-- the Room and that the room is in the desired premise       --//
	//----------------------------------------------------------------//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError       = false;
	$sErrMesg     = "";
	$aRoomData    = array();
	$aPremiseData = array();
	$aResult      = array();
	
	try {
		//------------------------------------------------------------//
		//-- 2.0 - Lookup Room Info                                 --//
		//------------------------------------------------------------//
		$aRoomData = GetRoomInfoFromRoomId( $iRoomId );
		
		
		if( $aRoomData['Error']===true ) {
			$bError    = true;
			$sErrMesg .= "Room wasn't found! \n";
			$sErrMesg .= "Room either doesn't exist or you do not have permission to access it!\n";
			
		}
		//------------------------------------------------------------//
		//-- 3.0 - Checking if Room is in premise                   --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $aRoomData['Data']['PremiseId']!==$iDesiredPremiseId ) {
				$bError    = true;
				$sErrMesg .= "Room is not located in the desired premise! \n";
				$sErrMesg .= "Please choose a room that is located in the same premise \n";
			}
		}
		
		
		//------------------------------------------------------------//
		//-- 4.0 - Check if the User has permission                 --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			$aPremiseData = GetPremisesInfoFromPremiseId( $iDesiredPremiseId );
			
			if( $aPremiseData['Error']===true ) {
				$bError    = true;
				$sErrMesg .= "Problem looking up the Premise for that Room! \n";
				$sErrMesg .= "Premise either doesn't exist or you do not have permission to access it \n";
				
			} else if( $aPremiseData['Data']['PermRoomAdmin']!==1 && $aPremiseData['Data']['PermRoomAdmin']!=="1" ) {
				$bError    = true;
				$sErrMesg .= "Insufficient Premise permissions! \n";
				$sErrMesg .= "Your User account is missing the RoomAdmin permission to the Hub's Premise! \n";
				
			}
		}
	} catch( Exception $e1 ) {
		$bError    = true;
		$sErrMesg .= "Problem validating the Room! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>array( "Valid"=>true ) );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function GetFirstRoomIdFromRoomList() {
	//-- Retrieve the Premise Info --//
	$aResult = dbGetFirstRoomIdFromRoomList();
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"An error has occurred looking up the first RoomId that is present in the User's Room List!\n" );
	}
	
	//-- Return the results --//
	return $aResult;
}


function ChangeRoomInfo( $iRoomId, $sName, $iFloor, $sDesc, $iRoomsTypeId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangeRoomInfo( $iRoomId, $sName, $iFloor, $sDesc, $iRoomsTypeId );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Room Info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Room Info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
		
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function AddNewRoom( $iPremiseId, $sName, $iFloor, $sDesc, $iRoomsTypeId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbAddNewRoom( $iPremiseId, $iRoomsTypeId, $sName, $iFloor, $sDesc );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to create a new room! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to create a new room! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"RoomId"	=>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function DeleteExistingRoom( $iRoomId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	$aTempRestult   = array();
	
			
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aTempRestult = dbDeleteExistingRoomPerms( $iRoomId );
		
		if( $aTempRestult['Error']===false ) {
			$aResult = dbDeleteExistingRoom( $iRoomId );
			
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= "Error occurred when attempting to delete an existing room! \n";
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} else {
			$bError    = true;
			$sErrMesg .= "Error occurred when attempting to delete the remaining room permissions! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to delete an existing room! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS  --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE  --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function WatchInputsGetFirstRoomIdFromPremiseId( $iPremiseId ) {
	//-- Retrieve the Premise Info --//
	$aResult = dbWatchInputsGetFirstRoomIdFromPremiseId( $iPremiseId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"An error has occurred looking up the first RoomId that is present in a Premise!\n" );
	}
	
	//-- Return the results --//
	return $aResult;
}



function SpecialGetAllRooms() {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError           = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg         = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult          = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aUserServerPerms = array();          //-- ARRAY:         --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		
		//-- Check if the User has Add User Permissions --//
		$aUserServerPerms = GetUserServerPermissions();
		
		
		if( $aUserServerPerms['Error']===false ) {
			//-- Check if the variable is set --//
			if( isset($aUserServerPerms['Data']['PermServerAddUser']) ) {
				if( $aUserServerPerms['Data']['PermServerAddUser']===1 ) {
					
					//-- Update the User State --//
					$aResult = dbSpecialGetAllRooms();
					
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg .= "Error occurred when attempting to lookup the room list! \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
					
				} else {
					//-- ERROR: User doesn't have permission --//
					$bError    = true;
					$sErrMesg .= "The user doesn't seem to have permission to lookup the room list.\n";
				}
				
			} else {
				//-- ERROR: Can not see the correct permission --//
				$bError    = true;
				$sErrMesg .= "Unexpected error when looking up the current user's permissions to lookup the room list.\n";
			}
		} else {
			//-- ERROR:  --//
			$bError    = true;
			$sErrMesg .= "Problem looking up the current user's server permissions.\n";
			$sErrMesg .= $aUserServerPermissions['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the room list! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}



function SpecialGetAllRoomsFromPremiseId( $iPremiseId ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError           = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg         = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult          = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aPremiseInfo     = array();          //-- ARRAY:         --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		//-- Check if the User has RoomAdmin Permission for the Premise --//
		$aPremiseInfo = GetPremisesInfoFromPremiseId( $iPremiseId );
		
		
		if( $aPremiseInfo['Error']===false ) {
			//-- Check if the variable is set --//
			if( isset($aPremiseInfo['Data']['PermRoomAdmin']) ) {
				if( $aPremiseInfo['Data']['PermRoomAdmin']===1 ) {
					
					//-- Update the User State --//
					$aResult = dbSpecialGetAllRoomsFromPremiseId( $iPremiseId );
					
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg .= "Error occurred when attempting to lookup the room list! \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
					
				} else {
					//-- ERROR: User doesn't have permission --//
					$bError    = true;
					$sErrMesg .= "The user doesn't seem to have permission to lookup the room list.\n";
				}
				
			} else {
				//-- ERROR: Can not see the correct permission --//
				$bError    = true;
				$sErrMesg .= "Unexpected error when looking up the current user's permissions to lookup the room list.\n";
			}
		} else {
			//-- ERROR:  --//
			$bError    = true;
			$sErrMesg .= "Problem looking up the current user's premise permissions.\n";
			$sErrMesg .= $aPremiseInfo['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the room list! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}


//========================================================================================================================//
//== #7.0# - Hub Functions                                                                                              ==//
//========================================================================================================================//
function HubRetrieveInfoAndPermission($iHubId) {
	//-- Retrieve the Hub Info --//
	$aResult = dbHubRetrieveInfoAndPermission($iHubId);
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Hub wasn't found! \nHub either doesn't exist or you do not have permission to access it!\n" );
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//-- Return the results --//
	return $aResult;
}


function ChangeHubName( $iHubId, $sHubName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangeHubName( $iHubId, $sHubName );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change Hub name! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change Hub name! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function WatchInputsHubRetrieveInfoAndPermission($iHubId) {
	//-- Description: This is a special function for Watch Inputs Users Only --//
	
	//-- Retrieve the Hub Info --//
	$aResult = dbWatchInputsHubRetrieveInfoAndPermission($iHubId);
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Hub wasn't found! \nHub either doesn't exist or you do not have permission to access it!\n" );
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//-- Return the results --//
	return $aResult;
}

//========================================================================================================================//
//== #8.0# - Comm Functions                                                                                             ==//
//========================================================================================================================//
function GetCommInfo( $iCommId ) {
	//------------------------------------------------//
	//-- 1.0 - INITIALISE                           --//
	//------------------------------------------------//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an error has been caught.       --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message of the caught message.     --//
	$aResult            = array();      //-- ARRAY:     Used to store the Database function results.        --//
	
	
	//------------------------------------------------//
	//-- 2.0 - MAIN                                 --//
	//------------------------------------------------//
	$aResult = dbGetCommInfo( $iCommId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No Comm Found! \nComm either doesn't exist or you do not have permission to access it.\n");
		//-- Debugging Only Message --//
		//return array( "Error"=>true, "ErrMesg"=>"No Comm Found! \n".$aResult["ErrMesg"] );
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS      --//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE      --//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function GetCommsFromHubId( $iHubId ) {
	//------------------------------------------------//
	//-- 1.0 - INITIALISE                           --//
	//------------------------------------------------//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an error has been caught.       --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message of the caught message.     --//
	$aResult            = array();      //-- ARRAY:     Used to store the Database function results.        --//
	
	
	//------------------------------------------------//
	//-- 2.0 - MAIN                                 --//
	//------------------------------------------------//
	
	$aResult = dbGetCommsFromHubId( $iHubId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No Comms Found! \nCouldn't find Comms on that particular Hub.\n");
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS      --//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE      --//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function AddNewHubComm( $iCommHubId, $iCommTypeId, $sCommName, $sCommAddress, $bSQLTransaction=false ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbAddNewHubComm( $iCommHubId, $iCommTypeId, $sCommName, $sCommAddress, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to insert the new Comm! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to insert the new Comm! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array(
			"Error"     =>false, 
			"Data"      =>array( 
				"CommId"    =>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function WatchInputsGetCommInfo( $iCommId ) {
	//------------------------------------------------//
	//-- 1.0 - INITIALISE                           --//
	//------------------------------------------------//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an error has been caught.       --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message of the caught message.     --//
	$aResult            = array();      //-- ARRAY:     Used to store the Database function results.        --//
	
	//------------------------------------------------//
	//-- 2.0 - MAIN                                 --//
	//------------------------------------------------//
	$aResult = dbWatchInputsGetCommInfo( $iCommId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No Comm Found! \nComm either doesn't exist or you do not have permission to access it.\n");
		//-- Debugging Only Message --//
		//return array( "Error"=>true, "ErrMesg"=>"No Comm Found! \n".$aResult["ErrMesg"] );
	} else {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	}
}



//========================================================================================================================//
//== #9.0# - Link Functions                                                                                             ==//
//========================================================================================================================//
function GetLinkInfo( $iLinkId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Link Info                                 --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetLinkInfo( $iLinkId );
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg .= "No Link Found! \nLink either doesn't exist or you do not have permission to access it!\n";
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Link Information! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS      --//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE      --//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function LinkRetrieveStateAndPermission( $iId ) {

	//-- Retrieve the LinkState --//
	$aResult = dbLinkRetrieveState( $iId, true );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"No Device Found! \nDevice either doesn't exist or you do not have permission to access it!\n");
		//$aResult = array( "Error"=>true, "ErrMesg"=>$aResult["ErrMesg"] );
	}
	//-- Return the results --//
	return $aResult;
}


function GetLinksFromRoomId( $iRoomId ) {
	//----------------------------------------------------------------------------------------------------//
	//-- Description: This function is used to fetch all the Links that are assigned to a certain room. --//
	//-- Requirements: Checks to see if the user has access to the room should be performed before      --//
	//--    calling this function.                                                                      --//
	//----------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError				= false;		//-- BOOLEAN:   Used to indicate if an error has been caught.		--//
	$sErrMesg			= "";			//-- STRING:    Stores the error message of the caught message.		--//
	$aResult			= array();		//-- ARRAY:     Used to store the Database function results.		--//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	$aResult = dbGetLinksFromRoomId( $iRoomId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No Devices Found! \nNo Devices assigned to this room!\n");
	} 
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ChangeLinkName( $iLinkId, $sLinkName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();

	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangeLinkName( $iLinkId, $sLinkName );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change device name! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change device name! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message	--//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS		--//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		//------------------------//
		//-- 9.B - FAILURE		--//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function ChangeLinkRoom( $iLinkId, $iRoomId ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise							--//
	//------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	
	//------------------------------------------------//
	//-- 2.0 - Main									--//
	//------------------------------------------------//
	try {
		
		$aResult = dbChangeLinkRoom( $iLinkId, $iRoomId );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change which room the device is in! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change which room the device is in! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message	--//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function LinkRetrieveState( $iId ) {
	//-- Retrieve the LinkState --//
	$aResult = dbLinkRetrieveState( $iId, false );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"No Device Found! \nDevice either doesn't exist or you do not have permission to access it!\n");
	} 
	//-- Return the results --//
	return $aResult;
}


function LinkChangeState( $iId, $iNewState ) {
	//-- Retrieve the LinkState --//
	$aResult = dbChangeLinkState( $iId, $iNewState );
	//-- Return the results --//
	return $aResult;
}


function CheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sConnAddress, $sInfoName ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbCheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sConnAddress, $sInfoName );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to check if Link exists! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to check if Link exists! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		//return array( "Error"=>false, "Data"=>$aResult["Data"] );
		return $aResult["Data"]["LinkId"];
		
	} else {
		//-- Error Occurred --//
		//return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		return false;
		
	}
}



function AddNewLink( $iCommId, $iLinkTypeId, $iInfoId, $iConnectionId, $sSerialCode, $sName, $iState, $iRoomId=null, $bSQLTransaction=false ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbAddNewLink( $iCommId, $iLinkTypeId, $iInfoId, $iConnectionId, $sSerialCode, $sName, $iState, $iRoomId, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to insert the new Link! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to insert the new Link! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"LinkId"	=>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function LinkUpdateConnectionInfo( $iConnId, $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $sConnName, $sUsername, $sPassword, $iPort ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbUpdateLinkConnectionInfo( $iConnId, $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $sConnName, $sUsername, $sPassword, $iPort );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to update the Link Connection info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to update the Link Connection info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}


function LinkUpdateConnectionAddress( $iConnId, $sConnAddress ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbUpdateLinkConnectionAddress( $iConnId, $sConnAddress );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to update the Link Connection info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to update the Link Connection info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
		
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		
	}
}


function AddNewLinkConnectionInfo( $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $iConnPort, $sConnName, $sUsername, $sPassword, $bSQLTransaction=false ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbAddNewLinkConnectionInfo( $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $iConnPort, $sConnName, $sUsername, $sPassword, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to update the Link Connection info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to update the Link Connection info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"LinkConnId"	=>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

function CheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbCheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to check the Link Connection info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to check the Link Connection info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		//return array( "Error"=>false, "Data"=>$aResult["Data"] );
		return $aResult["Data"]["LinkInfoId"];
		
	} else {
		//-- Error Occurred --//
		//return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		return false;
		
	}
}

function AddNewLinkInfo( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl, $bSQLTransaction=false ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbAddNewLinkInfo( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to create a new Link Info entry! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to create a new Link Info entry! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS      --//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"LinkInfoId"	=>$aResult["LastId"]
			)
		);
	} else {
		//------------------------//
		//-- 9.B - FAILURE      --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function WatchInputsGetLinkInfo( $iLinkId ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Link Info                                 --//
	//------------------------------------------------------------//
	try {
		$aResult = dbWatchInputsGetLinkInfo( $iLinkId );
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg .= "No Link Found! \nLink either doesn't exist or you do not have permission to access it!\n";
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Link Information! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS      --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE      --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

function WatchInputsCheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise                           --//
	//------------------------------------------------//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";               //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();          //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------//
	//-- 2.0 - Main                                 --//
	//------------------------------------------------//
	try {
		$aResult = dbWatchInputsCheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to check the Link Connection info! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to check the Link Connection info! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return $aResult["Data"]["LinkInfoId"];
	} else {
		//-- Error Occurred --//
		return false;
	}
}


//========================================================================================================================//
//== #10.0# - Thing Functions                                                                                           ==//
//========================================================================================================================//
function GetThingInfo($iThingId) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Thing Info                                --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetThingInfo($iThingId);
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg = "No Thing Found! \nThing either doesn't exist or you do not have permission to access it!\n";
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Thing Information! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS		--//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE		--//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ChangeThingName( $iThingId, $sThingName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
	//------------------------------------------------------------//
	try {
		$aResult = dbChangeThingName( $iThingId, $sThingName );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to change thing name! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to change thing name! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//------------------------//
		//-- 9.A - SUCCESS		--//
		//------------------------//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//------------------------//
		//-- 9.B - FAILURE		--//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function ThingRetrieveStateAndPermission( $iThingId ) {
	//-- Retrieve the ThingState --//
	$aResult = dbRetrieveThingState( $iThingId, true );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"No Thing Found! \nThing either doesn't exist or you do not have permission to access it!\n");
		
	}
	//-- Return the results --//
	return $aResult;
}


function ThingRetrieveState( $iThingId ) {
	//-- Retrieve the ThingState --//
	$aResult = dbRetrieveThingState( $iThingId, false );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"No Thing Found! \nThing either doesn't exist or you do not have permission to access it!\n");
	} 
	//-- Return the results --//
	return $aResult;
}



function GetThingsFromLinkId( $iLinkId ) {
	//----------------------------------------------------------------------------------------------------//
	//-- Description: This function is used to fetch all the IOs that are attached to a certain Thing.  --//
	//----------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an error has been caught.       --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message of the caught message.     --//
	$aResult            = array();      //-- ARRAY:     Used to store the Database function results.        --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbGetThingsFromLinkId( $iLinkId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No Things Found! \nCouldn't find Things on that particular Link.\n");
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function ThingChangeState( $iId, $iNewState ) {
	//-- Update the ThingState --//
	$aResult = dbChangeThingState( $iId, $iNewState );
	//-- Return the results --//
	return $aResult;
}


//----------------------------------------------------------------------------//
//-- ADD THING                                                              --//
//----------------------------------------------------------------------------//
function AddNewThing( $iLinkId, $iThingTypeId, $iThingHWID, $iThingOutputID, $iThingState, $sName, $sThingSerialCode, $bSQLTransaction=false ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";           //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();      //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbAddNewThing( $iLinkId, $iThingTypeId, $iThingHWID, $iThingOutputID, $iThingState, $sName, $sThingSerialCode, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to create a new Thing entry! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to create a new Thing entry! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array(
			"Error"     =>false, 
			"Data"      =>array( 
				"ThingId"  =>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

function WatchInputsGetThingInfo($iThingId) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Thing Info                                --//
	//------------------------------------------------------------//
	try {
		$aResult = dbWatchInputsGetThingInfo($iThingId);
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg = "No Thing Found! \nThing either doesn't exist or you do not have permission to access it!\n";
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Thing Information! \n";
		$sErrMesg .= $e1->getMessage();
	}
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message  --//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS      --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE      --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


//========================================================================================================================//
//== #11.0# - IO Functions                                                                                              ==//
//========================================================================================================================//

function GetIOInfo($sIOId) {
	
	$iIOId = intval($sIOId, 10);
	//-- Retrieve the IO State --//
	$aResult = dbGetIOInfo( $sIOId );
	//-- Return the results --//
	return $aResult;
}


function IODetection() {
	//-- 1.0 - Initialisation --//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	
	//-- Retrieve Values from database --//
	try{
		$aResult = dbIODetection();
		
		if( $aResult["Error"]===false) {
			//-- RETURN RESULTS --//
			return array( "Error"=>false,		"Data"=>$aResult["Data"] );
			
		} else {
			if( $aResult["ErrMesg"]==="No Rows Found! Code:0" ) {
				//-- Rewrite the result as empty array --//
				$aResult = array( "Error"=>false,	"Data"=>array()		);
				
			} else {
				//-- RETURN ERROR --//
				return array( "Error"=>true, "ErrMesg"=>"IODetect: ".$aResult["ErrMesg"] );
			}
		}
	} catch( Exception $e0001 ) {
		//-- Corrupted Results (Usually no Error Element in function result array) --//
		return array( "Error"=>true, "ErrMesg"=>"IO Detect Results Corrupted!\n" );
		
	}
}



function DebugIODetection() {
	//-----------------------------------------------------------//
	//-- 1.0 - Initialise                                      --//
	//-----------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	
	//-----------------------------------------------------------//
	//-- 2.0 - Start of the body of function code              --//
	//-----------------------------------------------------------//
	try{
		$aResult = dbDebugIODetection();
		
	} catch( Exception $e0001 ) {
		//-- Display an Error message --//
		$bError		= true;
		$sErrMesg  .= "Error calling inner IO Detect function!\n";
		$sErrMesg  .= $e0001->getMessage();
	}
	
	//-----------------------------------------------------------//
	//-- 9.0 - Return the Results                              --//
	//-----------------------------------------------------------//
	try {
		//-- If no errors have been flagged --//
		if( $bError===false ) {
			if( $aResult["Error"]===false) {
				//-- RETURN RESULTS --//
				return  array( "Error"=>false, "Data"=>$aResult["Data"] );
			} else {
				//-- RETURN ERROR --//
				return array( "Error"=>true, "ErrMesg"=>"DSD: ".$aResult["ErrMesg"] );
			}
		//-- Else an error has been flagged --//
		} else {
			return array( "Error"=>true, "ErrMesg"=>"DSD: ".$sErrMesg );
		}
	//-- If an Error is caught --//
	} catch( Exception $e2 ) {
		return array( "Error"=>true, "ErrMesg"=>"IO Detect Results Corrupted!\n" );
	}
}


function getIODebuggingInfo( $sIOId, $sDataType) {
	//-----------------------------------------------------------//
	//-- 1.0 - Initialise                                      --//
	//-----------------------------------------------------------//
	$bError             = false;
	$sErrMesg           = "";
	$aResult            = array();
	$aReturn            = array();          //-- ARRAY:     This is the array that this function returns --//
	$iIOId              = 0;
	$bNumericCheck1     = false;
	$sPlugDataType      = "";
	$aIOType            = array();
	$aConvertedDataType = array();
	$sConvertedDataType = "";
	$iDataType          = 0;
	
	//-----------------------------------------------------------//
	//-- 2.0 - Start of the body of function code              --//
	//-----------------------------------------------------------//
	
	//-- Ensure that the IOId is a integer --//
	$bNumericCheck1 = is_numeric( $sIOId );
	if($bNumericCheck1===true) {
		$iIOId = intval( $sIOId, 10 );
	} else {
		$bError	= true;
		$sErrMesg .= "Error Code:0x120 \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Non numeric IOId has been passed \n";
	}

	//-- Ensure that the DataType is a integer --//
	$bNumericCheck1 = is_numeric( $sDataType );
	if( $bNumericCheck1===true) {
		$iDataType = intval( $sDataType, 10);
	} else {
		$bError	= true;
		$sErrMesg .= "Error Code:0x121 \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Non numeric DataTypeId has been passed \n";
	}

	
	//-- Convert datatype to string --//
	$aConvertedDataType = ConvertDataTypeToName( $iDataType );
	//sConvertedDataType = aConvertedDataType.Value


	//-----------------------------------------------------------//
	//-- 3.0 - Run the query                                   --//
	//-----------------------------------------------------------//
	if( $bError===false ) {
		try {
			$aResult = dbGetIODebuggingInfo( $aConvertedDataType["Value"], $iIOId );
		} catch( Exception $e7 ) {
			$bError	= true;
			$sErrMesg .= "Error Code:0x120 \n";
			$sErrMesg .= "Internal API Error! \n";
			$sErrMesg .= "Error retrieving IO information \n";
			$sErrMesg .= $e7->getMessage();
		}
	}

	//-----------------------------------------------------------//
	//-- 4.0 - Check for Errors                                --//
	//-----------------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) { 
				
				if( $aResult["ErrMesg"]==="Error Occurred! Debug: No Rows Found! Code:1" ) {
					$aResult = array( "UnixTS"=>"No Results Found!" );
				} else {
					$bError = true;
					$sErrMesg .= $aResult["ErrMesg"];
				}
			}
		} catch( Exception $e ) {
			//-- Catching here is normal and means no errors --//
		}
	}
	
	//-----------------------------------------------------------//
	//-- 9.0 - Return the Results                              --//
	//-----------------------------------------------------------//
	if( $bError===false) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function GetIOsFromThingId( $iThingId ) {
	//----------------------------------------------------------------------------------------------------//
	//-- Description: This function is used to fetch all the IOs that are attached to a certain Thing.  --//
	//----------------------------------------------------------------------------------------------------//
	
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an error has been caught.       --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message of the caught message.     --//
	$aResult            = array();      //-- ARRAY:     Used to store the Database function results.        --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	$aResult = dbGetIOsFromThingId( $iThingId );
	
	if( $aResult["Error"]===true ) {
		//-- Display an Error --//
		return array( "Error"=>true, "ErrMesg"=>"No IOs Found! \nCouldn't find IOs on that particular Thing.\n");
	} 
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD IO                                                                 --//
//----------------------------------------------------------------------------//
function AddNewIO( $iThingId, $iRSTypesId, $iUoMId, $iIOTypeId, $iIOState, $fSampleCurrent, $fSampleMax, $fSampleLimit, $fBaseConvert, $sName, $bSQLTransaction=false ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";           //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();      //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Begin                                            --//
	//------------------------------------------------------------//
	try {
		$aResult = dbAddNewIO( $iThingId, $iRSTypesId, $iUoMId, $iIOTypeId, $iIOState, $fSampleCurrent, $fSampleMax, $fSampleLimit, $fBaseConvert, $sName, $bSQLTransaction );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to create a new IO entry! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to create a new IO entry! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array(
			"Error"     =>false, 
			"Data"      =>array( 
				"IOId"  =>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




//========================================================================================================================//
//== #12.0# - IO Data Functions                                                                                         ==//
//========================================================================================================================//
function GetIODataAggregation( $sAggregationType, $iDataType, $sIOId, $sStartUTS, $sEndUTS ) {
	
	//--  --//
	$iIOId          = intval( $sIOId, 10 );
	$iStartUTS      = intval( $sStartUTS, 10 );
	$iEndUTS        = intval( $sEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iDataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetIODataAggregation( $sAggregationType, $aConvertedDataType["Value"], $iIOId, $iStartUTS, $iEndUTS );
	//-- Return the results --//
	return $aResult;
	
}


function GetIODataMostRecent( $iDataType, $sIOId, $sEndUTS, $iRowLimit=1 ) {
	
	//-- Ensure that certain parameters are integers --//
	$iIOId          = intval( $sIOId, 10 );
	$iEndUTS        = intval( $sEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iDataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetIODataMostRecent( $aConvertedDataType["Value"], $iIOId, $iEndUTS, $iRowLimit );
	//-- Return the results --//
	return $aResult;
}


function GetIODataMostRecentEnum( $iDataType, $sIOId, $sEndUTS, $iRowLimit=1 ) {
	
	//-- Ensure that certain parameters are integers --//
	$iIOId          = intval( $sIOId, 10 );
	$iEndUTS        = intval( $sEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	if( $iDataType===1 || $iDataType===2 || $iDataType===3 ) {
		//-- Retrieve the IO Aggregation Data --//
		$aResult = dbGetIODataMostRecentEnum( $iDataType, $iIOId, $iEndUTS, $iRowLimit );
		//-- Return the results --//
		return $aResult;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"The DataType of the provided IO doesn't support enumeration." );
	}
}

function GetIODataMostRecentEnumBit( $iDataType, $sIOId, $sEndUTS, $iBitsToCheckFor, $iRowLimit=1 ) {
	
	//-- Ensure that certain parameters are integers --//
	$iIOId          = intval( $sIOId, 10 );
	$iEndUTS        = intval( $sEndUTS, 10 );
	
	
	//-- Convert Datatype to name --//
	if( $iDataType===1 || $iDataType===2 || $iDataType===3 ) {
		
		//-- Retrieve the IO Aggregation Data --//
		$aResult = dbGetIODataMostRecentEnumBit( $iDataType, $iIOId, $iEndUTS, $iBitsToCheckFor, $iRowLimit );
		//-- Return the results --//
		return $aResult;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"The DataType of the provided IO doesn't support enumeration." );
	}
}

function InsertNewIODataValue( $iIOId, $iUTS, $Value, $bNonCommited=false ) {
	//------------------------------------------------------------//
	//-- 1.0 - INITIALISE VARIABLES                             --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$sErrMesg       = "";           //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();      //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	$aIOInfo        = array();      //-- ARRAY:         --//
	
	//------------------------------------------------------------//
	//-- 2.0 - LOOKUP THE IO DETAILS                            --//
	//------------------------------------------------------------//
	$aIOInfo = dbGetIOInfo( $iIOId );
	
	
	if( $aIOInfo['Error']===false ) {
		//-- Verify that the user has the "write" permission --//
		if( $aIOInfo['Data']['PermWrite']===1 ) {
			//-- Extract the DataTypeId --//
			$iDataType  = $aIOInfo['Data']['DataTypeId'];
			
		} else {
			//-- User doesn't have write permission --//
			$bError     = true;
			$sErrMesg   = "The User doesn't have the \"write\" permission! \n";
		}
	} else {
		//-- An Error Occurred --//
		$bError     = true;
		$sErrMesg   = "Can't find the IO.\n";
		$sErrMesg  .= "The user may not have permission to access it!\n";
	}
	
	
	//------------------------------------------------------------//
	//-- 3.0 - CONVERT THE DATATYPE TO TABLE NAME               --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- Fetch Table Name --//
		$aConvertedDataType = ConvertDataTypeToName( $iDataType, true );
		
		//-- Check for Errors --//
		if( $aConvertedDataType['Error']===true ) {
			//-- An Error Occurred --//
			$bError     = true;
			$sErrMesg   = "DataType of the IO is unsupported!\n";
		}
		//var_dump($aConvertedDataType);
	}
	
	
	//------------------------------------------------------------//
	//-- 5.0 - INSERT THE NEW IO DATA VALUE                     --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- Insert the new IO Data Value --//
		$aResult = dbInsertNewIODataValue( $aConvertedDataType["Value"], $iIOId, $iUTS, $Value, $aConvertedDataType["Type"], $bNonCommited );
		
		//-- Check for errors when inserting the new data value --//
		if( $aResult['Error']===true) {
			//-- An Error Occurred --//
			$bError     = true;
			$sErrMesg  .= "Error setting new IO Data Value!\n";
			$sErrMesg  .= $aResult['ErrMesg'];
		}
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - RETURN THE RESULTS                               --//
	//------------------------------------------------------------//
	if( $bError===false) {
		return $aResult;
	} else {
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function GetIOSpecialTotaledEnumValue( $iIODataType, $iIOId, $iStartStamp, $iEndStamp ) {
	//------------------------------------------------------------//
	//-- 1.0 - INITIALISE VARIABLES                             --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:       Used to indicate if at least one error has been caught.     --//
	$iErrCode       = 0;            //-- INTEGER:       Used to store the error code of the error that occurred     --//
	$sErrMesg       = "";           //-- STRING:        Stores the error message when an error is caught.           --//
	$aResult        = array();      //-- ARRAY:         Stores the result of this function if no errors occur.      --//
	
	
	//------------------------------------------------------------//
	//-- 3.0 - FETCH THE MAXIMUM                                --//
	//------------------------------------------------------------//
	try {
		$aTempResult1 = GetIODataAggregation( "Max", $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
		
		if( $aTempResult1['Error']===false ) {
			//------------------------------------------------------------//
			//-- 4.0 - FETCH THE MINIMUM                                --//
			//------------------------------------------------------------//
			$aTempResult2 = GetIODataAggregation( "Min", $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
			
			if( $aTempResult2['Error']===false ) {
				//------------------------------------------------------------//
				//-- 5.0 - STORE THE RESULT                                 --//
				//------------------------------------------------------------//
				$aResult = array(
					"Error"     => false,
					"Data"      => array(
						"Value"     => $aTempResult1['Data']['Value'] - $aTempResult2['Data']['Value']
					)
				);
			} else {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 1;
				$sErrMesg .= "Problem looking up the Minimum value!\n";
			}
		} else {
			//-- Error --//
			$bError    = true;
			$iErrCode  = 2;
			$sErrMesg .= "Problem looking up the Maximum value!\n";
		}
	} catch( Exception $e1 ) {
		//-- Error --//
		$bError    = true;
		$iErrCode  = 0;
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - RETURN THE RESULTS                               --//
	//------------------------------------------------------------//
	if( $bError===false) {
		return $aResult;
	} else {
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


//========================================================================================================================//
//== #13.0# - Graph Functions                                                                                           ==//
//========================================================================================================================//

function GetGraphLineIOAvg( $sIOId, $iIODataType, $sPostStartUTS, $sPostEndUTS, $iLineGraphDiff ) {
	
	//-- Ensure that certain parameters are integers --//
	$iIOId          = intval( $sIOId, 10 );
	$iStartUTS      = intval( $sPostStartUTS, 10 );
	$iEndUTS        = intval( $sPostEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iIODataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetGraphLineIOAvg( $aConvertedDataType["Value"], $iIOId, $iStartUTS, $iEndUTS, $iLineGraphDiff );
	//-- Return the results --//
	return $aResult;
}


function GetGraphLineIO( $sIOId, $iIODataType, $sPostStartUTS, $sPostEndUTS ) {
	
	//-- Ensure that certain parameters are integers --//
	$iIOId          = intval( $sIOId, 10 );
	$iStartUTS      = intval( $sPostStartUTS, 10 );
	$iEndUTS        = intval( $sPostEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iIODataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetGraphLineIO( $aConvertedDataType["Value"], $iIOId, $iStartUTS, $iEndUTS );
	//-- Return the results --//
	return $aResult;
}



//========================================================================================================================//
//== #15.0# - RSCat & UoM Functions                                                                                     ==//
//========================================================================================================================//
















//========================================================================================================================//
//== #19.0# - Server Functions                                                                                          ==//
//========================================================================================================================//
function GetServerVersion() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Thing Info                                --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetServerVersion();
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg = "Error: Couldn't lookup the server version!\n";
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Server Version! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function GetServerAddonVersions() {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Thing Info                                --//
	//------------------------------------------------------------//
	try {
		$aResult = dbGetServerAddonVersions();
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg = "Error: Couldn't lookup the server version!\n";
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the Server Version! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function APICore_UserData( $oDBConnection ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup Thing Info                                --//
	//------------------------------------------------------------//
	try {
		
		$aResult = DB_APICore_UserData( $oDBConnection );
		
		if( $aResult['Error']===true) {
			$bError    = true;
			$sErrMesg .= "Error occurred when attempting to lookup the User Information! \n";
			$sErrMesg .= $aResult['ErrMesg'];
		}
		
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to lookup the User Information! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



//========================================================================================================================//
//== #20.0# - Server Modification Functions                                                                             ==//
//========================================================================================================================//

function SpecialLookupTableIndicies( $sTableName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup all the Indicies                          --//
	//------------------------------------------------------------//
	try {
		$aResult = dbLookupTableIndicies( $sTableName );
		
		
		if( $aResult["Error"]===true ) {
			//-- Display an Error --//
			$bError = true;
			$sErrMesg = "Error: Couldn't lookup the table indicies!\n";
		}
		
	} catch( exception $e001 ) {
		$bError   = true;
		$sErrMesg = "";
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return array( "Error"=>false, "Data"=>$aResult['Data'] );
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function CreateIndexOnTable( $oDBConn, $sTableName, $sNewIndexName, $sTableColumn ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup all the Indicies                          --//
	//------------------------------------------------------------//
	try {
		$aResult = dbCreateIndexOnTable( $oDBConn, $sTableName, $sNewIndexName, $sTableColumn );
		
		
	} catch( exception $e001 ) {
		$bError   = true;
		$sErrMesg = "Critical Error: Problem creating a table index!";
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function DeleteIndexOnTable( $oDBConn, $sTableName, $sIndexName ) {
	//------------------------------------------------------------//
	//-- 1.0 - Initialise                                       --//
	//------------------------------------------------------------//
	$bError         = false;        //-- BOOLEAN:   --//
	$sErrMesg       = "";           //-- STRING:    --//
	$aResult        = array();      //-- ARRAY:     --//
	
	//------------------------------------------------------------//
	//-- 5.0 - Lookup all the Indicies                          --//
	//------------------------------------------------------------//
	try {
		$aResult = dbDeleteIndexOnTable( $oDBConn, $sTableName, $sIndexName );
		
		
	} catch( exception $e001 ) {
		$bError   = true;
		$sErrMesg = "Critical Error: Problem deleting a table index!";
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS --//
		return $aResult['Data'];
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

//========================================================================================================================//
//== #21.0# - Rule Functions                                                                                            ==//
//========================================================================================================================//
function ExtractTimeValuesFromString( $sString ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	//--------------------------------------------//
	//-- 2.0 - Breakup the String               --//
	//--------------------------------------------//
	$aTimeTemp = explode( ":", $sString );
	
	
	//--------------------------------------------//
	//-- 3.0 - Parse the Values                 --//
	//--------------------------------------------//
	
	//------------------------//
	//-- Hour               --//
	if( $aTimeTemp[0]>=0 && $aTimeTemp[0]<=23 ) {
		$iHour = $aTimeTemp[0];
	} else {
		$bError    = true;
		$sErrMesg .= "Problem with the Hour value.\n";
	}
	
	//------------------------//
	//-- Minute             --//
	if( $aTimeTemp[1]>=0 && $aTimeTemp[1]<=59 ) {
		$iMinute = $aTimeTemp[1];
	} else {
		$bError    = true;
		$sErrMesg .= "Problem with the Minute value.\n";
	}
	
	//------------------------//
	//-- Seconds            --//
	if( $aTimeTemp[2]>=0 && $aTimeTemp[2]<=59 ) {
		$iSecond = $aTimeTemp[2];
	} else {
		$bError    = true;
		$sErrMesg .= "Problem with the Seconds value.\n";
	}
	
	
	//--------------------------------------------//
	//-- 9.0 - Return the Results               --//
	//--------------------------------------------//
	if( $bError===false ) {
		return array(
			"Error" => false,
			"Data"  => array(
				"Hour" => $iHour,
				"Min"  => $iMinute,
				"Sec"  => $iSecond
			)
		);
	} else {
		return array(
			"Error"   => $bError,
			"ErrMesg" => $sErrMesg
		);
	}
}



function ExtractDateTimeValuesFromUnixTS( $iUnixTS, $sTimezone ) {
	
	$dDateTime = DateTime::createFromFormat( "U", $iUnixTS );
	$dDateTime->setTimezone( new DateTimeZone($sTimezone) );
	
	$aReturn = array(
		"Year"  => $dDateTime->format('Y'),
		"Month" => $dDateTime->format('m'),
		"Day"   => $dDateTime->format('d'),
		"Hour"  => $dDateTime->format('H'),
		"Min"   => $dDateTime->format('i'),
		"Sec"   => $dDateTime->format('s')
	);
	
	//echo "FormatA = ".$dDateTime->format('Y-m-d H:i:s')."\n";
	//echo "Output = ".date( 'Y-m-d H:i:s', $dDateTime->getTimestamp())."\n";
	//var_dump( $aReturn );
	
	return $aReturn;
}

function CreateUnixTSFromTimeData( $aTimeData, $sTimezone ) {
	
	//------------------------------------------------//
	//-- STEP 1 - Create the String                 --//
	//------------------------------------------------//
	$sDateTime    = $aTimeData['Year']."-".$aTimeData["Month"]."-".$aTimeData['Day']." ".$aTimeData['Hour'].":".$aTimeData['Min'].":".$aTimeData['Sec'];
	
	//var_dump( $sDateTime );
	//echo "\n\n";
	//------------------------------------------------//
	//-- STEP 2- Create the Date Time Object        --//
	//------------------------------------------------//
	$dDateTime    = DateTime::createFromFormat( "Y-m-d H:i:s", $sDateTime, new DateTimeZone( $sTimezone ) );
	
	//var_dump( $dDateTime );
	//echo "\n\n";
	//------------------------------------------------//
	//-- Get Unix TS from DateTimeObject            --//
	//------------------------------------------------//
	if( $dDateTime!==false ) {
		$iUnixTS      = $dDateTime->getTimestamp();
		
		//var_dump( $iUnixTS );
		//echo "\n\n";
	
	} else {
		$iUnixTS = 0;
	}
	
	return $iUnixTS;
}



function FindNextUTSFromTime( $sTimezone, $sTime, $iMinSecsFromNow=0 ) {
	//------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                --//
	//------------------------------------------------------------//
	$bError       = false;
	$sErrMesg     = "";
	$bTimePassed  = false;
	
	//------------------------------------------------------------//
	//-- 2.0 - Prepare                                          --//
	//------------------------------------------------------------//
	
	//-- Extract the desired time values from string --//
	if( $bError===false ) {
		$aTime = ExtractTimeValuesFromString( $sTime );
		
		if( $aTime['Error']===true ) {
			$bError    = true;
			$sErrMesg .= $aTime['ErrMesg'];
		}
	}
	
	//-- Get the Current DateTime to compare against --//
	if( $bError===false ) {
		$aCurrentDateTimeData = ExtractDateTimeValuesFromUnixTS( time(), $sTimezone );
	}
	
	
	//------------------------------------------------------------//
	//-- 4.0 - Check if the Time has passed for the current day --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//--------------------//
		//-- Hour Check     --//
		if( $aTime['Data']['Hour'] < $aCurrentDateTimeData['Hour'] ) {
			//-- Desired time already happened today --//
			$bTimePassed = true;
			
		} else if( $aTime['Data']['Hour']===$aCurrentDateTimeData['Hour'] ) {
			//--------------------//
			//-- Minute Check   --//
			if( $aTime['Data']['Min'] < $aCurrentDateTimeData['Min'] ) {
				$bTimePassed = true;
				
			} else if( $aTime['Data']['Min']===$aCurrentDateTimeData['Min'] ) {
				//--------------------//
				//-- Seconds Check  --//
				if( $aTime['Data']['Min'] <= $aCurrentDateTimeData['Min'] ) {
					$bTimePassed = true;
				}
			}
		}
	}
	
	//------------------------------------------------------------//
	//-- 5.0 - Create the new UTS                               --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		$aNewDateTimeData = array(
			"Year"  => $aCurrentDateTimeData['Year'],
			"Month" => $aCurrentDateTimeData['Month'],
			"Day"   => $aCurrentDateTimeData['Day'],
			"Hour"  => $aTime['Data']['Hour'],
			"Min"   => $aTime['Data']['Min'],
			"Sec"   => $aTime['Data']['Sec']
		);
		
		$iUnixTS = CreateUnixTSFromTimeData( $aNewDateTimeData, $sTimezone );
		
		if( $bTimePassed===true ) {
			//-- TODO: Replace this with a better way --//
			$iUnixTS += 86400;
		}
	}
	
	//------------------------------------------------------------//
	//-- 7.0 - Check UTS is above minimum from now              --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- Calculate the Timestamp that is too early --//
		$iEarliestAllowed = time()+$iMinSecsFromNow;
		
		//-- Check to make sure that the UnixTS is passed the minimum --//
		if( $iUnixTS < $iEarliestAllowed ) {
			//-- Increment the UnixTS to the next day --//
			//-- TODO: Replace this with a better way --//
			$iUnixTS += 86400;
		}
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results                               --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		return array(
			"Error"  => false,
			"UnixTS" => $iUnixTS
		);
	} else {
		return array(
			"Error"   => true,
			"ErrMesg" => $sErrMesg
		);
	}
}



function CheckUserPermissionsForRules( $iHubId=null ) {
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	$bPermHub  = false;
	$bPermPrem = false;
	
	//----------------------------------------------------//
	//-- 2.0 - Check Hub Permissions                    --//
	//----------------------------------------------------//
	try {
		//-- TODO: Better checks will have to be performed when we upgrade to a iomy version that has multi-premise support --//
		//-- NOTE: This section doesn't return an error if can't find anything because Step 2 only happens if this step doesn't find anything --//
		
		if( $iHubId!==null ) {
			$aTempFunctionResult1 = WatchInputsHubRetrieveInfoAndPermission( $iHubId );
		} else {
			$aTempFunctionResult1 = WatchInputsHubRetrieveInfoAndPermission( 1 );
		}
		
		if( $aTempFunctionResult1['Error']===false ) {
			if( $aTempFunctionResult1['Data']['HubId']>=1 ) {
				//-- Found a Hub Permission --//
				$bPermHub = true;
			}
		}
	} catch( Exception $e0211 ) {
		
	}
	
	//----------------------------------------------------//
	//-- STEP 2 - Check Premise Permissions             --//
	//----------------------------------------------------//
	if( $bPermHub===false ) {
		try {
			$aTempFunctionResult2 = GetAllPremiseInfo();
			
			if( $aTempFunctionResult2['Error']===false ) {
				foreach( $aTempFunctionResult2['Data'] as $PremKey => $aPremise ) {
					if( $aPremise['PermOwner']===1 ) {
						$bPermPrem = true;
					}
				}
			}
		} catch( Exception $e0212 ) {
			
		}
	}
	
	//----------------------------------------------------//
	//-- Return Results                                 --//
	//----------------------------------------------------//
	if( $bPermHub===false && $bPermPrem===false ) {
		return false;
		
		//$bError    = true;
		//$iErrCode  = 201;
		//$sErrMesg .= "Error Code:'0201' \n";
		//$sErrMesg .= "Your User account doesn't seem to have permission to access the Rules system!\n";
	} else {
		return true;
	}
}


function GetAllRules( $bActiveRulesOnly=false ) {
	//----------------------------------------------------------------//
	//-- This is for fetching all the rules                         --//
	//-- ErrCode Range: 0-3                                         --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( null );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
	} catch( Exception $e20 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 0,
			"ErrMesg" => "Critical Error: Problem checking the permissions to the Rule system!\n "
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Get all Rules                                        --//
	//----------------------------------------------------------------//
	try {
		$aResult = dbGetAllRules( $bActiveRulesOnly );
		
		
	} catch( exception $e50 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Critical Error: Problem getting the list of all the Rules!\n"
		);
	}
	
	//----------------------------------------------------//
	//-- 9.0 - Return Results                           --//
	//----------------------------------------------------//
	if( $aResult['Error']===true ) {
		return array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => $aResult['ErrMesg']
		);
	} else {
		return $aResult;
	}
}


function GetRuleFromRuleId( $iRuleId ) {
	//----------------------------------------------------------------//
	//-- This is for fetching all the rules                         --//
	//-- ErrCode Range: 0-3                                         --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	
	//----------------------------------------------------------------//
	//-- 5.0 - Lookup the Rule from the Id                          --//
	//----------------------------------------------------------------//
	try {
		//-- 5.1 - Lookup the Rule --//
		$aResult = dbGetRuleFromRuleId( $iRuleId );
		
		if( $aResult['Error']===false ) {
			//-- 5.2 - Check User Permissions --//
			$bPermission = CheckUserPermissionsForRules( $aResult['Data']['HubId'] );
			
			//-- 5.3 - Check Permissions --//
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
			
		} else {
			return array(
				"Error"   => true,
				"ErrCode" => 1,
				"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
			);
		}
		
	} catch( exception $e50 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Critical Error: Problem looking up the Rule!\n"
		);
	}
	
	//----------------------------------------------------------------//
	//-- 9.0 - Return Results                                       --//
	//----------------------------------------------------------------//
	if( $aResult['Error']===true ) {
		return array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => $aResult['ErrMesg']
		);
	} else {
		return $aResult;
	}
}


function UpdateRuleEnabledStatus( $iRuleId, $iNewStatus ) {
	//----------------------------------------------------------------//
	//-- Used for setting if a Rule is enabled/disabled             --//
	//-- ErrCode Range: 0-3                                         --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( null );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
	} catch( Exception $e20 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 0,
			"ErrMesg" => "Critical Error: Problem checking the permissions to the Rule system!\n "
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Get all Rules                                        --//
	//----------------------------------------------------------------//
	try {
		$aResult = dbUpdateRuleEnabledStatus( $iRuleId, $iNewStatus );
		
		
	} catch( exception $e50 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Critical Error: Problem setting the Rule Status!\n"
		);
	}
	
	
	//----------------------------------------------------//
	//-- 9.0 - Return Results                           --//
	//----------------------------------------------------//
	if( $aResult['Error']===true ) {
		return array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => "Error: Problem setting the Rule Status! \n".$aResult['ErrMesg']
		);
	} else {
		return $aResult;
	}
}


function RuleMarkAsRan( $iRuleId, $iNextRun, $iLastRun, $iHubId ) {
	//----------------------------------------------------------------//
	//-- Used for setting if a Rule is enabled/disabled             --//
	//-- ErrCode Range: 0-3                                         --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( $iHubId );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
	} catch( Exception $e20 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 0,
			"ErrMesg" => "Critical Error: Problem checking the permissions to the Rule system!\n "
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Get all Rules                                        --//
	//----------------------------------------------------------------//
	try {
		$aResult = dbRuleMarkAsRan( $iRuleId, $iNextRun, $iLastRun );
		
		
	} catch( exception $e50 ) {
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Critical Error: Problem setting the Rule Status!\n"
		);
	}
	
	
	//----------------------------------------------------//
	//-- 9.0 - Return Results                           --//
	//----------------------------------------------------//
	if( $aResult['Error']===true ) {
		return array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => "Error: Problem setting the Rule Status! \n".$aResult['ErrMesg']
		);
	} else {
		return $aResult;
	}
}


function AddNewRuleToDatabase( $iRuleTypeId, $iHubId, $sName, $sTime, $aParameter, $iEnabled, $iNextRun ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( $iHubId );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
		//----------------------------------------------------//
		//-- 2.2 - Convert Parameter array into JSON        --//
		//----------------------------------------------------//
		if( $bError===false ) {
			$sParameter = json_encode( $aParameter );
		}
		
		//----------------------------------------------------//
		//-- 2.3 - Lookup User Details                      --//
		//----------------------------------------------------//
		if( $bError===false ) {
			$aUserDetails = GetCurrentUserDetails();
			
			if( $aUserDetails['Error']===false ) {
				$iUserId = $aUserDetails['Data']['UserId'];
				
			} else {
				$sErrMesg  = "Error: Problem occurred when checking the prerequisites for adding a new Rule!\n";
				$sErrMesg .= "There is an issue with looking up the User Details!\n";
				$sErrMesg .= $aUserDetails['ErrMesg'];
				
				return array(
					"Error"   => true,
					"ErrCode" => 2,
					"ErrMesg" => $sErrMesg
				);
			}
		}
		
		
		//----------------------------------------------------//
		//-- 2.4 - Convert Parameter array into JSON        --//
		//----------------------------------------------------//
		if( $bError===false ) {
			$iLastModified     = time();
			$sLastModifiedCode = "Initialise_U".$iUserId;
		}
		
	} catch( Exception $e2 ) {
		$sErrMesg  = "Critical Error: Problem occurred when checking the prerequisites for adding a new Rule!\n";
		$sErrMesg .= $e2->getMessage();
		$sErrMesg .= "\n";
		
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => $sErrMesg
		);
	}
	
	
	//----------------------------------------------------------------//
	//-- 5.0 - Main                                                 --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		try {
			$aResult = dbAddNewRule( $iRuleTypeId, $iHubId, $sName, $sTime, $sParameter, $iEnabled, $iLastModified, $sLastModifiedCode, -1, $iNextRun );
			
			if( $aResult["Error"]===true ) {
				$sErrMesg  = "Error: Problem occurred when attempting to create a new rule!\n";
				$sErrMesg .= $aResult["ErrMesg"];
				
				return array(
					"Error"   => true,
					"ErrCode" => 3,
					"ErrMesg" => $sErrMesg
				);
			}
		} catch( Exception $e5 ) {
			$sErrMesg  = "Critical Error: Problem occurred when attempting to create a new rule!\n";
			$sErrMesg .= $e5->getMessage();
			
			return array(
				"Error"   => true,
				"ErrCode" => 4,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	
	//----------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message                  --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		//-- 9.A - SUCCESS --//
		return array(
			"Error"  =>false, 
			"Data"   =>array( 
				"RuleId"    =>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrCode"=>0, "ErrMesg"=>$sErrMesg );
	}
}




function ChangeRule( $iRuleId, $iHubId, $iRuleTypeId, $sName, $sTime, $iEnabled, $iNextRun ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError   = false;
	$sErrMesg = "";
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( $iHubId );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
		//----------------------------------------------------//
		//-- 2.2 - Lookup User Details                      --//
		//----------------------------------------------------//
		if( $bError===false ) {
			$aUserDetails = GetCurrentUserDetails();
			
			if( $aUserDetails['Error']===false ) {
				$iUserId = $aUserDetails['Data']['UserId'];
				
				
			} else {
				$sErrMesg  = "Error: Problem occurred when checking the prerequisites for editing a Rule!\n";
				$sErrMesg .= "There is an issue with looking up the User Details!\n";
				$sErrMesg .= $aUserDetails['ErrMesg'];
				
				return array(
					"Error"   => true,
					"ErrCode" => 2,
					"ErrMesg" => $sErrMesg
				);
			}
		}
		
		
		//----------------------------------------------------//
		//-- 2.4 - Convert Parameter array into JSON        --//
		//----------------------------------------------------//
		if( $bError===false ) {
			$iLastModified     = time();
			$sLastModifiedCode = "Edit_U".$iUserId;
		}
		
	} catch( Exception $e2 ) {
		$sErrMesg  = "Critical Error: Problem occurred when checking the prerequisites for editing Rule!\n";
		$sErrMesg .= $e2->getMessage();
		$sErrMesg .= "\n";
		
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => $sErrMesg
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Begin                                                --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		try {
			$aResult = dbChangeRule( $iRuleId, $iRuleTypeId, $sName, $sTime, $iEnabled, $iLastModified, $sLastModifiedCode, $iNextRun );
			
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= "Error occurred when attempting to change Rule! \n";
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e1 ) {
			$bError = true;
			$sErrMesg .= "Critical Error occurred when attempting to change Rule! \n";
			$sErrMesg .= $e1->getMessage();
		}
	}
	
	//----------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message                  --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		//-- 9.A - SUCCESS --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE --//
		return array( "Error"=>true, "ErrCode"=>0, "ErrMesg"=>$sErrMesg );
	}
}


function DeleteExistingRule( $iRuleId ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	$aTempRestult   = array();
	
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( null );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
		
	} catch( Exception $e2 ) {
		$sErrMesg  = "Critical Error: Problem occurred when checking the prerequisites for deleting a Rule!\n";
		$sErrMesg .= $e2->getMessage();
		$sErrMesg .= "\n";
		
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => $sErrMesg
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Begin                                                --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		try {
			$aResult = dbDeleteRule( $iRuleId );
			
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= "Error occurred when attempting to delete Rule! \n";
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e1 ) {
			$bError = true;
			$sErrMesg .= "Critical Error occurred when attempting to delete Rule! \n";
			$sErrMesg .= $e1->getMessage();
		}
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS  --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE  --//
		return array( "Error"=>true, "ErrCode"=>0, "ErrMesg"=>$sErrMesg );
	}
}


function RuleNextRunUpdate( $iRuleId, $iNextRun ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	$aResult        = array();
	$aTempRestult   = array();
	
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- 2.1 - Check if the User has permission         --//
		if( $bError===false ) {
			$bPermission = CheckUserPermissionsForRules( null );
			
			if( $bPermission===false ) {
				return array(
					"Error"   => true,
					"ErrCode" => 1,
					"ErrMesg" => "Error: Your User account doesn't seem to have permission to access the Rules system!\n"
				);
			}
		}
		
		
	} catch( Exception $e2 ) {
		$sErrMesg  = "Critical Error: Problem occurred when checking the prerequisites for updating a Rule's next run timestamp!\n";
		$sErrMesg .= $e2->getMessage();
		$sErrMesg .= "\n";
		
		return array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => $sErrMesg
		);
	}
	
	//----------------------------------------------------------------//
	//-- 5.0 - Begin                                                --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		try {
			$aResult = dbRuleNextRunUpdate( $iRuleId, $iNextRun );
			
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= "Error occurred when attempting to delete Rule! \n";
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e1 ) {
			$bError = true;
			$sErrMesg .= "Critical Error occurred when attempting to delete Rule! \n";
			$sErrMesg .= $e1->getMessage();
		}
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message              --//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS  --//
		return $aResult;
	} else {
		//-- 9.B - FAILURE  --//
		return array( "Error"=>true, "ErrCode"=>0, "ErrMesg"=>$sErrMesg );
	}
}



//========================================================================================================================//
//== #25.0# - Onvif Functions                                                                                           ==//
//========================================================================================================================//
//-- TODO: Move some of these functions into a onvif library --//


function recursive_array_search( $sSearchString, $aArrayToSearch, $bCaseSensitive=true, $bXmlSoapSearch=false ) {
	//----------------------------------------------------------------//
	//-- This is a simple function used to search through a array   --//
	//-- NOTE: "XmlSoapSearch" implies case insensitive             --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$aResultArray           = array();      //-- ARRAY:         This is used to build an array that is returned if this function successfully finds something that it was looking for. --//
	$sSearchStringLowerCase = "";           //-- STRING:        Used to hold the a lower case version of the string to allow for case insensitive searches. --//
	$sArrayStringLowerCase  = "";           //-- STRING:        Used to hold the a lower case version of the string to allow for case insensitive searches. --//
	$aSoapTag               = "";           //-- ARRAY:         --//
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	foreach( $aArrayToSearch as $sKey => $ArrayElement ) {
		if( is_array($ArrayElement) ) {
			
			$aRecursiveSearchResults = recursive_array_search( $sSearchString, $ArrayElement );
			
			
			if( $aRecursiveSearchResults!==false ) {
				//------------------------------------------------------------//
				//-- If a result is found then pass return the results      --//
				//-- as well as what key the result was found in.           --//
				//------------------------------------------------------------//
				$aResultArray   = $aRecursiveSearchResults;
				$aResultArray[] = $sKey;
				
				//echo "Returning SubResult\n";
				return $aResultArray;
			}
			
		} else {
			if( is_string($ArrayElement) ) {
				
				//----------------------------//
				//-- NORMAL MODE            --//
				//----------------------------//
				if( $bXmlSoapSearch===false ) {
					if( $bCaseSensitive===true ) {
						//----------------------------//
						//-- CASE SENSITIVE         --//
						//----------------------------//
						if( $ArrayElement===$sSearchString ) {
							//-- Return the Current Key (SUCCESS) --//
							//echo "Success!\n";
							return array($sKey);
						}
						
					} else {
						//----------------------------//
						//-- CASE IN-SENSITIVE      --//
						//----------------------------//
						$sSearchStringLowerCase  = strtolower( $sSearchString );
						$sArrayStringLowerCase   = strtolower( $ArrayElement );
						
						//-- Check if the array's lower case string matches the search's lower case string --//
						if( $sSearchStringLowerCase===$sArrayStringLowerCase ) {
							return array($sKey);
						}
					}
					
				//----------------------------//
				//-- XML SOAP MODE          --//
				//----------------------------//
				} else {
					//------------------------------------------------------------//
					//-- STEP 1 - Breakup the string into the appropiate parts  --//
					//------------------------------------------------------------//
					$aSoapElement = explode( ":", $ArrayElement, 3 );
					
					
					//-- IF there is a sub-name as well as the namespace --//
					if( isset( $aSoapElement[1] ) ) {
						//--------------------------------//
						//-- Non Namespaced search      --//
						//--------------------------------//
						$sSoapElementSubname = $aSoapElement[1];
							
						//-- Convert to lower case --//
						$sSearchStringLowerCase    = strtolower( $sSearchString );
						$sSubnameStringLowerCase   = strtolower( $sSoapElementSubname );
						
						//-- Check if the array's lower case string matches the search's lower case string --//
						if( $sSearchStringLowerCase===$sSubnameStringLowerCase ) {
							return array($sKey);
						}
						
					//-- ELSEIF there is only a name and no namespace --//
					} else if( isset($aSoapElement[1]) ) {
						
						//--------------------------------//
						//-- CASE IN-SENSITIVE          --//
						//--------------------------------//
						$sSearchStringLowerCase  = strtolower( $sSearchString );
						$sArrayStringLowerCase   = strtolower( $ArrayElement );
						
						//-- Check if the array's lower case string matches the search's lower case string --//
						if( $sSearchStringLowerCase===$sArrayStringLowerCase ) {
							return array($sKey);
						}
					}
				}		//-- END of Normal/Soap Mode --//
			}
		}
	}
	return false;
}


function ExtractValueFromMultiArray( $aArray, $aArrayLocation ) {
	//-- A recursive function used for extracting a value from a known location in a multi-dimensional array --// 

	$sLocation      = array_shift($aArrayLocation);
	$iLocationsToGo = count($aArrayLocation);
	
	if( isset( $aArray[$sLocation] ) ) {
		//-- If more locations to go to the target then perform recursion --//
		if( $iLocationsToGo>=1 ) {
			//-- Recurse --//
			return ExtractValueFromMultiArray( $aArray[$sLocation], $aArrayLocation);
		} else {
			//-- Success: Found it --//
			return $aArray[$sLocation];
		}
	} else {
		//-- Failure: Can't find it --//
		return null;
	}
}


function ExtractArrayContentsFromArraySearchResults( $aArray, $aSearchResults, $iStartingElement ) {
	//----------------------------------------------------------------//
	//-- DESCRIPTION:                                               --//
	//--    Used to extract the contents of a sub-element that is   --//
	//--    multiple child elements inside of a multi-dimensional   --//
	//--    array.                                                  --//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$aDesiredArray      = array();
	$aTempArray         = array();
	$sTempString        = "";
	$iArrayCount        = 0;
	
	//----------------------------------------------------------------//
	//-- 2.0 - Setup variables                                      --//
	//----------------------------------------------------------------//
	$iArrayCount        = count( $aSearchResults ) - 1;
	$aTempArray         = $aArray;
	
	//----------------------------------------------------------------//
	//-- 3.0 -  --//
	//----------------------------------------------------------------//
	for( $i=$iArrayCount; $i>=$iStartingElement; $i-- ) {
		$sTempString    = $aSearchResults[$i];
		$aTempArray     = $aTempArray[$sTempString];
		
		//echo "i=".$i." LowerLimit=".$iStartingElement." \n";
		//var_dump($aTempArray);
	}
	
	//----------------------------------------------------------------//
	//-- 9.0 - Return the Results                                   --//
	//----------------------------------------------------------------//
	return $aTempArray;
}






function XmlConversion( $sXMLText ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise											--//
	//----------------------------------------------------------------//
	$oXML			= new DOMDocument( "1.0", "UTF-8");		//-- OBJECT:	--//
	$aXML			= array();								//-- ARRAY:		--//
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin building the XML PHP Array						--//
	//----------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 2.1 - Load the XML Data into the XML Object	--//
	$oXML->LoadXML($sXMLText);
	
	//----------------------------------------------------//
	//-- 2.2 - Add the Element's Tag to the PHP Array	--//
	$aXML["XMLTagName"]	= $oXML->documentElement->tagName;
	
	//----------------------------------------------------//
	//-- 2.3 - Add Attributes							--//
	if( $oXML->documentElement->hasAttributes() ) {
		//foreach($oXML->documentElement->attributes as $sAttrName => $attrNode) {
		//	$aXML[$sAttrName] = (string)$attrNode->value;
		$i = 0;
		foreach($oXML->documentElement->attributes as $attrNode) {
			//echo "AttributeName:".$attrNode->nodeName."\n";
			
			$aXML[ $attrNode->nodeName ] = $attrNode->nodeValue;
			$i++;
		}
		//echo "Count:".$i."\n";
	} else {
		//echo "No Attributes\n";
	}
	
	//----------------------------------------------------//
	//-- 2.4 - Add Children								--//
	foreach( $oXML->documentElement->childNodes as $oChild) {
		//-- Create the array for Child Elements if it isn't created --//
		if( !isset($aXML["+"]) ) {
			$aXML["+"]			= array();
		}
		
		$aXML["+"][] = XmlGetChildData($oChild);
	}
	
	//----------------------------------------------------------------//
	//-- 9.0 - Return the Results									--//
	//----------------------------------------------------------------//
	//var_dump($oXML->documentElement);
	//echo "\n\n".json_encode( $aXML )."\n\n";
	//var_dump( $aXML );
	//echo "\n\n(XMLNodeType:)\n".json_encode( $oXML->documentElement->nodeType )."\n\n";
	
	return $aXML;
}
	
	
	
function XmlGetChildData( $oObject ) {
	$aReturn = array();
	
	switch ($oObject->nodeType) {
		
		case XML_TEXT_NODE:
			$aReturn = $oObject->textContent;
			break;

		case XML_ELEMENT_NODE:
			$aReturn["XMLTagName"] = $oObject->tagName;
			
			//-- Add Attributes --//
			if( $oObject->hasAttributes() ) {
				foreach( $oObject->attributes as $attrName => $attrNode ) {
					$aReturn[$attrName] = (string)$attrNode->value;
				}
			}
			//-- Add Children --//
			foreach( $oObject->childNodes as $oChild ) {
				if($oChild) {
					if( !isset($aReturn["+"]) ) {
						$aReturn["+"] = array();
					}
					$aReturn["+"][] = XmlGetChildData( $oChild );
				}
			}
			
			break;
	}	//-- END SWITCH Statement --//
	return $aReturn;
}


function GetChildTag($aParentArray, $sTagName, $iMode=2 ) {
	//--------------------------------------------//
	//-- 1.0 - INITIALISE VARIABLES             --//
	//--------------------------------------------//
	$aTemp          = array();          //-- ARRAY:     Used to store an array temporarily. --//
	$sTemp          = "";               //-- STRING:    Used to store a string temporarily. --//
	
	//--------------------------------------------//
	//-- 5.0 - Seach for matching child element --//
	//--------------------------------------------//
	try {
		if( isset($aParentArray['+']) ) {
			if( is_array( $aParentArray['+'] ) ) {
				//--  --//
				foreach( $aParentArray['+'] as $aChild ) {
					if( $aChild ) {
						//-- Check Tag Name Exists	--//
						if( isset($aChild['XMLTagName']) ) {
							
							try {
								//echo "\n-- Dumping GetChildTag --\n";
								//echo "Mode=".json_encode($iMode)."  \n";
								//echo "XmlTag=".json_encode($aChild['XMLTagName'])." \n";
								//echo "Search=".json_encode($sTagName)." \n\n";
								
								
								switch( $iMode ) {
									
									//----------------------------------------//
									//-- (0) - Exact Match                  --//
									//----------------------------------------//
									case 0:
										if( $aChild['XMLTagName']===$sTagName ) {
											//-- If Match is found then return the Child Element --//
											return $aChild;
										}
										break;
										
									//----------------------------------------//
									//-- (1) - XML Soap Tag matches string  --//
									//----------------------------------------//
									case 1:
										//-- Break the tag subname away from the XML SOAP namespace --//
										$aTemp = explode( ":", $aChild['XMLTagName'], 3 );
										if( isset( $aTemp[1] ) ) {
											//-- If the lowercase versions of the names match each other --//
											if( strtolower( $aTemp[1] )===strtolower( $sTagName ) ){
												return $aChild;
											}
											
										} else if( $aTemp[0] ) {
											//-- If the lowercase versions of the names match each other --//
											if( strtolower( $aTemp[0] )===strtolower( $sTagName ) ) {
												return $aChild;
											}
											
										}
										break;
										
									//----------------------------------------//
									//-- (2) - Tag contains the String      --//
									//----------------------------------------//
									case 2:
										if( stripos($aChild['XMLTagName'], $sTagName)!==false ) {
											return $aChild;
										}
										break;
								}
							} catch( Exception $e) {
								//-- Ignore the current as something might be wrong with it --//
							}
						}	//-- ELSE TagName not present --//
					}
				}
			}
		}
	} catch( Exception $e ) {
		//-- Critical Error so return false --//
		return false;
	}
	
	//-- No Result found --//
	return false;
	
}


function ContainsPhpXmlSoapAttribute( $aXmlSoapElement, $sAttributeName, $bRemoveNamespace=false ) {
	//--------------------------------------------//
	//-- 1.0 - INITIALISE VARIABLES             --//
	//--------------------------------------------//
	
	$aNameTemp              = array();          //-- ARRAY:         --//
	$sAttributeNameLower    = "";               //-- STRING:        --//
	$sAttributeNamespace    = "";               //-- STRING:        --//
	$sAttributeSubName      = "";               //-- STRING:        --//
	
	$aSubElementStrings     = array();
	$sSubElementSubString   = "";
	
	//--------------------------------------------//
	//-- 5.0 - CHECK SUBELEMENTS FOR ATTRIBUTES --//
	//--------------------------------------------//
	try {
		$sAttributeNameLower = strtolower( $sAttributeName );
		
		
		//-- FOREACH SubElement (with the array key) --//
		foreach( $aXmlSoapElement as $sKey => $SubElement ) {
			//-- Verify SubElement --//
			if( $SubElement && is_string( $SubElement ) ) {
				if( $sKey!==null && $sKey!==false ) {
					//-- Extract Array Key and break it up --//
					$aNameTemp = explode( ":", $sKey, 3 );
					
					
					//-- IF there is a valid SubName --//
					if( isset( $aNameTemp[1] ) ) {
						//$sAttributeNamespace = strtolower( );
						$sAttributeSubName = strtolower( $aNameTemp[1] );
						
						//-- IF the lowercase names match --//
						if( $sAttributeSubName===$sAttributeNameLower ) {
							
							//-- If set to remove the namespace --//
							if( $bRemoveNamespace===true) {
								//-- Extract the value if it has a namespace --//
								$aSubElementStrings = explode( ":", $SubElement, 2 );
								
								if( isset($aSubElementStrings[1]) ) {
									return $aSubElementStrings[1];
									
								} else {
									return $aSubElementStrings[0];
									
								}
								
								
							} else {
								//-- Return Sub Element --//
								return $SubElement;
							}
						}
						
					//-- ELSEIF just use the only name --//
					} else if( isset( $aNameTemp[0] ) ) {
						$sAttributeNamespace = strtolower( $aNameTemp[0] );
						
						//-- IF the lowercase names match --//
						if( $sAttributeNamespace===$sAttributeNameLower ) {
							
							//-- If set to remove the namespace --//
							if( $bRemoveNamespace===true) {
								//-- Extract the value if it has a namespace --//
								$aSubElementStrings = explode( ":", $SubElement, 2 );
								
								if( isset($aSubElementStrings[1]) ) {
									return $aSubElementStrings[1];
									
								} else {
									return $aSubElementStrings[0];
									
								}
								
								
							} else {
								//-- Return Sub Element --//
								return $SubElement;
							}
						}
					}
				}
			}//-- ENDIF Verify SubElement --//
		}//-- END FOREACH SubElement --//
		
	} catch( Exception $e ) {
		//-- Critical Error so return false --//
		return false;
	}
	
	//--------------------------------------------//
	//-- 9.0 - RETURN FALSE                     --//
	//--------------------------------------------//
	return false;
	
}



function ParseReplaceAndRebuildUrl( $sUrl, $aReplaceData ) {
	//--------------------------------------------//
	//-- 1.0 - DECLARE VARIABLES                --//
	//--------------------------------------------//
	$bError           = false;
	$sErrMesg         = "";
	$aResult          = array();
	
	$sFinalUrl        = "";
	$aUrlParmeters    = array();
	
	
	//--------------------------------------------//
	//-- 2.0 - EXTRACT VARIABLES FROM URL       --//
	//--------------------------------------------//
	$aUrlParmeters = parse_url( $sUrl );
	
	if( $aUrlParmeters===false ) {
		$bError    = false;
		$sErrMesg .= "Unable to parse the URL! \n";
	}
	
	
	//--------------------------------------------//
	//-- 4.0 - EDIT PART OF THE URL             --//
	//--------------------------------------------//
	if( $bError===false ) {
		//------------------------//
		//-- 4.1 - Protocol     --//
		if( isset( $aReplaceData['protocol'] ) ) {
			$aUrlParmeters['scheme'] = $aReplaceData['protocol'];
		}
		
		//------------------------//
		//-- 4.2 - Host         --//
		if( isset( $aReplaceData['host'] ) ) {
			$aUrlParmeters['host'] = $aReplaceData['host'];
		}
		
		//------------------------//
		//-- 4.3 - Port         --//
		if( isset( $aReplaceData['port'] ) ) {
			$aUrlParmeters['port'] = $aReplaceData['port'];
		}
		
		//------------------------//
		//-- 4.4 - User         --//
		if( isset( $aReplaceData['user'] ) ) {
			$aUrlParmeters['user'] = $aReplaceData['user'];
		}
		
		//------------------------//
		//-- 4.5 - Password     --//
		if( isset( $aReplaceData['password'] ) ) {
			$aUrlParmeters['password'] = $aReplaceData['password'];
		}
		
		//------------------------//
		//-- 4.6 - Path         --//
		if( isset( $aReplaceData['path'] ) ) {
			$aUrlParmeters['path'] = $aReplaceData['path'];
		}
		
		//------------------------//
		//-- 4.7 - Query        --//
		if( isset( $aReplaceData['query'] ) ) {
			$aUrlParmeters['query'] = $aReplaceData['query'];
		}
		
		//------------------------//
		//-- 4.8 - Fragment     --//
		if( isset( $aReplaceData['fragment'] ) ) {
			$aUrlParmeters['fragment'] = $aReplaceData['fragment'];
		}
	}
	
	
	//--------------------------------------------//
	//-- 8.0 - BUILD THE URL                    --//
	//--------------------------------------------//
	if( $bError===false ) {
		$sFinishedURL = RebuildTheURL( $aUrlParmeters );
	}
	
	
	//--------------------------------------------//
	//-- 9.0 - RETURN RESULTS                   --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Url"=>$sFinishedURL );
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function RebuildTheURL( $aUrlParameters ) {
	
	//--------------------------------------------//
	//-- 1.0 - DECLARE VARIABLES                --//
	//--------------------------------------------//
	$bError             = false;
	$sErrMesg           = "";
	$aResult            = array();
	
	$sFinishedURL       = "";
	$sProtocol          = "";
	$sAuthSection       = "";
	$sHostname          = "";
	$sPort              = "";
	$sQuery             = "";
	$sFragment          = "";
	
	//----------------------------------------------------//
	//-- 4.0 - SETUP THE VARIABLES                      --//
	//----------------------------------------------------//
	
	//------------------------------------//
	//-- 4.1 - Scheme / Protocol        --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['scheme'] ) ) {
			//-- Check if it is the special 'file' rule --//
			if( $aUrlParameters['scheme']==="file" ) {
				//-- Add the special triple slash --//
				$sProtocol = "file:///";
				
			} else {
				//-- Add the Scheme / Protocol --//
				$sProtocol = $aUrlParameters['scheme']."://";
				
			}
		} else {
			//-- Default to "http://" --//
			$sProtocol = "http://";
		}
	}
	
	
	//------------------------------------//
	//-- 4.2 - Username and Password    --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['user'] ) && isset( $aUrlParameters['password'] ) ) {
			//-- Check if the 'user' and 'password' is valid --//
			if( $aUrlParameters['user']!==null && $aUrlParameters['user']!==false && $aUrlParameters['user']!=="" ) {
				if( $aUrlParameters['password']!==null && $aUrlParameters['password']!==false && $aUrlParameters['password']!=="" ) {
					//-- Create the Authentication section --//
					$sAuthSection = urlencode( $aUrlParameters['user'] ).":".urlencode( $aUrlParameters['password']."@" );
				}
			}
		} else {
			//-- Leave blank --//
			
		}
	}
	
		
	//------------------------------------//
	//-- 4.3 - Host                     --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['host'] ) ) {
			if( $aUrlParameters['host']!==null && $aUrlParameters['host']!==false && $aUrlParameters['host']!=="" ) {
				//-- Set the hostname --//
				$sHostname = $aUrlParameters['host'];
			}
			
		} else {
			//-- ERROR:  --//
			$bError = true;
			$sErrMesg .= "Missing the Hostname!";
			
		}
	}
		
	//------------------------------------//
	//-- 4.4 - Port                     --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['port'] ) ) {
			if( $aUrlParameters['port']!==null && $aUrlParameters['port']!==false && $aUrlParameters['port']!=="" ) {
				//-- Set the Port --//
				$sPort = ":".$aUrlParameters['port'];
				
			}
		}
	}
	
	//------------------------------------//
	//-- 4.5 - Path                     --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['query'] ) ) {
			if( $aUrlParameters['query']!==null && $aUrlParameters['query']!==false && $aUrlParameters['query']!=="" ) {
				//-- Query --//
				$sQuery = $aUrlParameters['query'];
				
			}
		}
	}
	
	//------------------------------------//
	//-- 4.6 - Fragment                 --//
	if( $bError===false ) {
		if( isset( $aUrlParameters['fragment'] ) ) {
			if( $aUrlParameters['fragment']!==null && $aUrlParameters['fragment']!==false && $aUrlParameters['fragment']!=="" ) {
				//-- Fragment --//
				$sFragment = $aUrlParameters['fragment'];
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - BUILD THE URL                            --//
	//----------------------------------------------------//
	if( $bError===false ) {
		$sFinishedURL = $sProtocol.$sAuthSection.$sHostname.$sPort.$sQuery.$sFragment;
	}
	
	//--------------------------------------------//
	//-- 9.0 - RETURN RESULTS                   --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- No Errors --//
		return array( "Error"=>false, "Url"=>$sFinishedURL );
	} else {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
	
}


?>