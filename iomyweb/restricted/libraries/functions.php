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
//-- #13.0# - RSCat & UoM Functions                                 --//
//====================================================================//



//========================================================================================================================//
//== #1.0# - Required PHP Libraries                                                                                     ==//
//========================================================================================================================//
require_once("http_post.php");
require_once("dbfunctions.php");


//========================================================================================================================//
//== #2.0# - Common Functions                                                                                           ==//
//========================================================================================================================//

function LookupFunctionConstant( $sValue ) {
	//-- TODO: Decide if this is going to be the best spot and place to do this --//
	switch( $sValue ) {
		
		//-- COMMS --//
		case "APICommTypeId":
			return 2;
			
		//-- LINKS --//
		case "HueBridgeLinkTypeId":
			return 7;
			
		case "OnvifLinkTypeId":
			return 6;
			
		//-- THINGS --//
		case "HueThingTypeId":
			return 13;
			
		case "OnvifThingTypeId":
			return 12;
			
		//-- RSTYPES --//
		case "OnvifThumbnailUrlRSTypeId":
			return 3973;
			
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
		//-- 2.2.A - If an error has been caught		--//
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
			$bError = true;
			$sErrMesg .= "Error Code:0x9804! \n";
			$sErrMesg .= "Error submitting log to the PremiseLog! \n";
			$sErrMesg .= "Critical Error \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
		
	} catch( Exception $e2 ) {
		$bError = true;
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
	//-- 9.0 - Return the Results or Error Message				--//
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


function ChangeUserAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressPostalLine1, $sAddressPostalLine2, $sAddressPostalLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
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
		$aResult = dbChangeUserAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressPostalLine1, $sAddressPostalLine2, $sAddressPostalLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage );
		
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


//========================================================================================================================//
//== #5.0# - Premise Functions																							==//
//========================================================================================================================//
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


function ChangePremiseAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
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
		$aResult = dbChangePremiseAddress( $iAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage );
		
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

//========================================================================================================================//
//== #6.0# - Rooms Functions																							==//
//========================================================================================================================//

function GetRoomInfoFromRoomId( $iRoomId ) {
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
		//-- 9.A - SUCCESS		--//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"RoomId"	=>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function DeleteExistingRoom( $iPremiseId ) {
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
		$aResult = dbDeleteExistingRoom( $iPremiseId );
		
		if( $aResult["Error"]===true ) {
			$bError = true;
			$sErrMesg .= "Error occurred when attempting to delete an existing room! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		}
	} catch( Exception $e1 ) {
		$bError = true;
		$sErrMesg .= "Critical Error occurred when attempting to delete an existing room! \n";
		$sErrMesg .= $e1->getMessage();
	}
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message				--//
	//------------------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return $aResult;
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}

//========================================================================================================================//
//== #7.0# - Hub Functions																								==//
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
	//-- 1.0 - Initialise										--//
	//------------------------------------------------------------//
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	//------------------------------------------------------------//
	//-- 2.0 - Begin											--//
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
	
	//------------------------------------------------//
	//-- 9.0 - Return the Results or Error Message	--//
	//------------------------------------------------//
	if($bError===false) {
		//-- 9.A - SUCCESS		--//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
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
		return array( "Error"=>true, "ErrMesg"=>"No Comms Found! \nCouldn't find IOs on that particular Hub.\n");
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
		//-- 9.A - SUCCESS		--//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"CommId"	=>$aResult["LastId"]
			)
		);
	} else {
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



//========================================================================================================================//
//== #9.0# - Link Functions																								==//
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
		
		$aResult = dbChangeLinkRoom( $iIOId, $iRoomId );
		
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



function AddNewLink( $iCommId, $iLinkTypeId, $iInfoId, $iConnectionId, $sSerialCode, $sName, $iState, $bSQLTransaction=false ) {
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
		$aResult = dbAddNewLink( $iCommId, $iLinkTypeId, $iInfoId, $iConnectionId, $sSerialCode, $sName, $iState, $bSQLTransaction );
		
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



function LinkUpdateConnectionInfo( $iConnId, $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $sConnName, $sUsername, $sPassword ) {
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
		$aResult = dbUpdateLinkConnectionInfo( $iConnId, $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $sConnName, $sUsername, $sPassword );
		
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
		//-- 9.A - SUCCESS		--//
		return array(
			"Error"		=>false, 
			"Data"		=>array( 
				"LinkInfoId"	=>$aResult["LastId"]
			)
		);
	} else {
		//------------------------//
		//-- 9.B - FAILURE		--//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


//========================================================================================================================//
//== #10.0# - Thing Functions																							==//
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

//========================================================================================================================//
//== #11.0# - IO Functions																							==//
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
	$bError			= false;
	$sErrMesg		= "";
	$aResult		= array();
	
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
	//--------------------------------------------------------//
	//-- 1.0 - Initialise                                   --//
	//--------------------------------------------------------//
	$bError             = false;
	$sErrMesg           = "";
	$aResult            = array();
	$aReturn            = array();			//-- ARRAY:		This is the array that this function returns --//
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


	//--------------------------------------------//
	//-- 3.0 - Run the query                    --//
	//--------------------------------------------//
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

	//--------------------------------------------//
	//-- 4.0 - Check for Errors                 --//
	//--------------------------------------------//
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
	
	//--------------------------------------------//
	//-- 9.0 - Return the Results               --//
	//--------------------------------------------//
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
	$iIOId			= intval( $sIOId, 10 );
	$iStartUTS		= intval( $sStartUTS, 10 );
	$iEndUTS		= intval( $sEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iDataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetIODataAggregation( $sAggregationType, $aConvertedDataType["Value"], $iIOId, $iStartUTS, $iEndUTS );
	//-- Return the results --//
	return $aResult;
	
}


function GetIODataMostRecent( $iDataType, $sIOId, $sEndUTS ) {
	
	//--  --//
	$iIOId			= intval( $sIOId, 10 );
	$iEndUTS		= intval( $sEndUTS, 10 );
	
	//-- Convert Datatype to name --//
	$aConvertedDataType = ConvertDataTypeToName( $iDataType );
	
	//-- Retrieve the IO Aggregation Data --//
	$aResult = dbGetIODataMostRecent( $aConvertedDataType["Value"], $iIOId, $iEndUTS );
	//-- Return the results --//
	return $aResult;
	
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


//========================================================================================================================//
//== #13.0# - RSCat & UoM Functions																						==//
//========================================================================================================================//









//========================================================================================================================//
//== #20.0# - Onvif Functions                                                                                           ==//
//========================================================================================================================//
function CheckIfDeviceSupportsOnvif( $sNetworkAddress, $iPort = 8000 ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$aResult		= array();		//-- ARRAY:			Used to hold the result of if this function succeeded or failed in getting the desired result.	--//
	$sURL			= "";			//-- STRING:		--//
	
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	$sURL		= 'http://'.$sNetworkAddress.":".$iPort.'/onvif/device_service';
	$sPOSTData	= '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/></s:Body></s:Envelope>';
	
	$oRequest = curl_init();
	curl_setopt( $oRequest, CURLOPT_URL, $sURL );
	
	//-- TODO: Re-implement Proxy Code if needed --//
	curl_setopt( $oRequest, CURLOPT_CONNECTTIMEOUT,    1            );
	curl_setopt( $oRequest, CURLOPT_TIMEOUT,           2            );
	curl_setopt( $oRequest, CURLOPT_RETURNTRANSFER,    true         );
	curl_setopt( $oRequest, CURLOPT_SSL_VERIFYPEER,    false        );
	curl_setopt( $oRequest, CURLOPT_SSL_VERIFYHOST,    false        );
	curl_setopt( $oRequest, CURLOPT_POST,              true         );
	curl_setopt( $oRequest, CURLOPT_POSTFIELDS,        $sPOSTData   );
	curl_setopt( $oRequest, CURLOPT_HTTPHEADER,        array( 
		'Content-Type: text/xml; charset=utf-8', 
		'Content-Length: '.strlen( $sPOSTData ) 
	));
	
	$oResult = curl_exec( $oRequest );
	
	if( $oResult===false ) {
		//------------------------------------//
		//-- ONVIF NOT SUPPORTED			--//
		//------------------------------------//
		$sErrMesg = curl_error( $oRequest );
		
		return false;
		
	} else {
		//------------------------------------//
		//-- ONVIF SUPPORTED				--//
		//------------------------------------//
		return true;
	}
}


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






?>