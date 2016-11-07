<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is used to hold the PHP functions that have SQL Code so that it can be quickly
//==         rewritten to support a different database type. The functions in this file are currently
//==         written for use with a MySQL database and the "dbmysql.php" library.
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
//--                                                                --//
//-- #1.0#  - View Functions                                        --//
//-- #2.0#  - Time Functions                                        --//
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
//--                                                                --//
//====================================================================//





//========================================================================================================================//
//== #1.0# - Functions to lookup View names                                                                             ==//
//========================================================================================================================//

//--------------------------------------------//
//-- #1.1# - Data Views                     --//
//--------------------------------------------//
//-- Used to lookup the data view names     --//
//--------------------------------------------//
function DataViewName($sViewCategory, $sViewType) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	$aResult = array();    //-- ARRAY:		This variable is what is returned from calling this function --//
	
	//----------------------------------------//
	//-- 3.0 - Insert the new UserInfo      --//
	//----------------------------------------//
	if($sViewCategory==="Attribute") {
		//-- Tiny Integer --//
		if($sViewType==="TinyInteger") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATATINYINT", 
				"UTS"               => "DATATINYINT_DATE",
				"Value"             => "DATATINYINT_VALUE",
				"CalcedValueType"   => "FLO"
			);
		//-- Integer --//
		} else if($sViewType==="Integer") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATAINT", 
				"UTS"               => "DATAINT_DATE",
				"Value"             => "DATAINT_VALUE",
				"CalcedValueType"   => "FLO"
			);
		//-- Big Integer --//
		} else if($sViewType==="BigInteger") {
			$aResult = array(
				"Error"             => false,
				"View"              => "VR_DATABIGINT",
				"UTS"               => "DATABIGINT_DATE",
				"Value"             => "DATABIGINT_VALUE",
				"CalcedValueType"   => "FLO"
			);
		//-- Float --//
		} else if($sViewType==="Float") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATAFLOAT", 
				"UTS"               => "DATAFLOAT_DATE",
				"Value"             => "DATAFLOAT_VALUE",
				"CalcedValueType"   => "FLO"
			);
		//-- Characters (16-Char) --//
		} else if($sViewType==="TinyString") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATATINYSTRING", 
				"UTS"               => "DATATINYSTRING_DATE",
				"Value"             => "DATATINYSTRING_VALUE",
				"CalcedValueType"   => "STR"
			);
			
		//-- Short String (32-Char) --//
		} else if($sViewType==="ShortString") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATASHORTSTRING", 
				"UTS"               => "DATASHORTSTRING_DATE",
				"Value"             => "DATASHORTSTRING_VALUE",
				"CalcedValueType"   => "STR"
			);
			
		//-- Medium String (64-Char) --//
		} else if($sViewType==="MediumString") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATAMEDSTRING", 
				"UTS"               => "DATAMEDSTRING_DATE",
				"Value"             => "DATAMEDSTRING_VALUE",
				"CalcedValueType"   => "STR"
			);
			
		//-- Long String (128-Char) --//
		} else if($sViewType==="LongString") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATALONGSTRING", 
				"UTS"               => "DATALONGSTRING_DATE",
				"Value"             => "DATALONGSTRING_VALUE",
				"CalcedValueType"   => "STR"
			);
		//-- String255 (255-Char) --//
		} else if($sViewType==="String255") {
			$aResult = array(
				"Error"             => false, 
				"View"              => "VR_DATASTRING255", 
				"UTS"               => "DATASTRING255_DATE",
				"Value"             => "DATASTRING255_VALUE",
				"CalcedValueType"   => "STR"
			);
		//-- Unsupported View --//
		} else {
			//-- No such View --//
			$aResult = array( "Error"=>true );
		} 

	//-- Unsupported Category --//
	} else {
		//-- No such View --//
		$aResult = array( "Error"=>true );
	}
	
	//-- Return the Results --//
	return $aResult;
}

//--------------------------------------------//
//-- #1.2# - Non-data Views                 --//
//--------------------------------------------//
//-- Used to lookup the non-data view names --//
//--------------------------------------------//
function NonDataViewName($sViewType) {
	if( $sViewType==="Users" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSINFO" );
		
	} else if( $sViewType==="Premises" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSPREMISES" );
		
	} else if( $sViewType==="Premisesaddress" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSPREMISELOCATIONS" );
		
	} else if( $sViewType==="PremiseLogs" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSPREMISELOG" );
		
	} else if( $sViewType==="Hub" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSHUB" );
		
	} else if( $sViewType==="Rooms" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSROOMS" );
		
	} else if( $sViewType==="Comm" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSCOMM" );
		
	} else if( $sViewType==="Link" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSLINK" );
		
	} else if( $sViewType==="Thing" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSTHING" );
		
	} else if( $sViewType==="IO" ) {
		$aResult = array( "Error"=>false, "View"=>"VR_USERSIO" );
		
	} else if( $sViewType==="RSTypes" ) {
		$aResult = array( "Error"=>false, "View"=>"VP_RSTYPES" );
		
	} else if( $sViewType==="RSTariff" ) {
		$aResult = array( "Error"=>false, "View"=>"VP_RSTARIFFS" );
		
	} else if( $sViewType==="RSSubCat" ) {
		$aResult = array( "Error"=>false, "View"=>"VP_RSSUBCAT" );
		
	} else if( $sViewType==="RSCat" ) {
		$aResult = array( "Error"=>false, "View"=>"VP_RSCAT" );
		
	} else if( $sViewType==="Icons" ) {
		$aResult = array( "Error"=>false, "View"=>"VP_ICONS" );
		
	} else {
		//-- Unsupported type --//
		$aResult = array( "Error"=>true, "ErrMesg"=>"Unsupported View" );
	}
	return $aResult;
}


function getCurrentSchema() {
	global$oRestrictedDB;
	
	$sResult = $oRestrictedDB->DataSchema;
	
	return $sResult;
}



//========================================================================================================================//
//== #2.0# - Time Functions                                                                                             ==//
//========================================================================================================================//


//========================================================================================================================//
//== #3.0# - Premise Log Functions                                                                                      ==//
//========================================================================================================================//
function dbAddPresetLogToPremiseLog( $iUserId, $iPresetLogActionId, $iUTS, $iPremiseId, $sCustom1 ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$bValidNumeric          = false;            //-- BOOLEAN:   Used for checking if a number is valid or not --//
	$bError                 = false;            //-- BOOL:      --//
	$sErrMesg               = "";               //-- STRING:    --//
	$aReturn                = array();          //-- ARRAY:     --//
	
	$sSchema                = "";               //-- STRING:    Used to store the Current Schema --//
	$sQueryId               = "";               //-- STRING:    Used to store the SQL string that is used to retrieve the Sequence			--//
	$sQueryInsert           = "";               //-- STRING:    Used to store the SQL string so it can be passed to the database functions	--//
	
	$aResultId              = array();          //-- ARRAY:     --//
	$aResultInsert          = array();          //-- ARRAY:     --//
	$aOutputColsId          = array();          //-- ARRAY:     An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//

	$aInputValsInsert       = array();          //-- ARRAY:     SQL bind input parameters	--//
	$iInsertId              = -1;               //-- INTEGER:   Used to store Sequence that will be used as the Primary Key in the "Insert Query" --//
	
	//----------------------------------------//
	//-- 3.0 - Insert the new UserInfo      --//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			
			//----------------------------------------//
			//-- SQL Query - Insert PremiseLog      --//
			//----------------------------------------//
			$sQueryInsert .= "INSERT INTO `PREMISELOG` ";
			$sQueryInsert .= "( ";
			$sQueryInsert .= "    `PREMISELOG_PREMISE_FK`, `PREMISELOG_USERS_FK`, `PREMISELOG_PREMISELOGACTION_FK`, ";
			$sQueryInsert .= "    `PREMISELOG_CUSTOMLOG_FK`, `PREMISELOG_UTS`, `PREMISELOG_CUSTOM1` ";
			$sQueryInsert .= ") ";
			$sQueryInsert .= "VALUES( ";
			$sQueryInsert .= "    :PremiseId, :UserId, :LogPresetId, ";				//-- premiseFK, usersFK, PremiseLogActionFK,			--//
			$sQueryInsert .= "    :LogCustomId, :UTS, :String ";					//-- CustomLogFK, UTS, Custom1							--//
			$sQueryInsert .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseId",         "type"=>"BINT",         "value"=>$iPremiseId            ),
				array( "Name"=>"UserId",            "type"=>"BINT",         "value"=>$iUserId               ),
				array( "Name"=>"LogPresetId",       "type"=>"INT",          "value"=>$iPresetLogActionId    ),
				array( "Name"=>"LogCustomId",       "type"=>"NUL",          "value"=>null                   ),
				array( "Name"=>"UTS",               "type"=>"BINT",         "value"=>$iUTS                  ),
				array( "Name"=>"String",            "type"=>"STR",          "value"=>$sCustom1              )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindUpdateQuery( $sQueryInsert, $aInputValsInsert );
			
			//----------------------------//
			//-- Error Checking         --//
			//----------------------------//
			if( $aResultInsert["Error"]===true ) {
				//-- Error Occurred when Inserting --//
				$bError     = true;
				$sErrMesg  .= "Error inserting the new \"PremiseLog\"! \n";
				$sErrMesg  .= $aResultInsert["ErrMesg"]." \n";
				//$sErrMesg  .= "\n ".$sQueryInsert." \n";
				//$sErrMesg  .= "\n ".JSON.stringify($aInputValsInsert)." \n";
			}
		
		} catch( Exception $e30 ) {
			//-- Debugging: Catch any unexpected errors --//
			$bError = true;
			$sErrMesg  = "Unexpected Error! \n";
			$sErrMesg .= "Error occurred when inserting a new \"PremiseLog\". \n";
			$sErrMesg .= $e30->getMessage()." \n";
		}
	}
	
	//echo "-----------<br />\n";
	//var_dump( $oRestrictedDB->QueryLogs );
	//echo "-----------<br />\n";
	
	//--------------------------------------------//
	//-- 9.0 Return Results or Error Message    --//
	//--------------------------------------------//
	if($bError===false) {
		return $aResultInsert;

	} else {
		return array( "Error"=>true, "ErrMesg"=>"Insert PremiseLog: ".$sErrMesg );
	}
}


function dbGetPremiseLogsBetweenUTS( $iPremiseId, $iStartstamp, $iEndstamp) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult        = array();
	$aReturn        = array();
	$sSQL           = "";
	$bError         = false;
	$sErrMesg       = "";
	
	$aTemporaryView = array();
	$sView          = "";

	//----------------------------------------//
	//-- 3.0 - Insert the new Utility       --//
	//----------------------------------------//
	//-- Retrieve the View in an array --//
	$aTemporaryView = NonDataViewName("PremiseLogs");
	
	if($aTemporaryView["Error"]===true) {
		//-- If an error has occurred --//
		$aReturn = array("Error"=>true,"ErrMesg"=>"Unsupported View");
		
		//-- Return the Result --//
		return $aReturn;
		
	} else {
		//-- store the view --//
		$sView = $aTemporaryView["View"]; 

		$sSQL .= "SELECT ";
		$sSQL .= "	`PREMISE_PK`, ";
		$sSQL .= "	`PREMISE_NAME`, ";
		$sSQL .= "	`PREMISE_DESCRIPTION`, ";
		$sSQL .= "	`PREMISELOG_PK`, ";
		$sSQL .= "	`PREMISELOG_UTS`, ";
		$sSQL .= "	`PREMISELOG_CUSTOM1`, ";
		$sSQL .= "	`USERSINFO_DISPLAYNAME`, ";
		$sSQL .= "	`PREMISELOGACTION_PK`, ";
		$sSQL .= "	`PREMISELOGACTION_NAME`, ";
		$sSQL .= "	`PREMISELOGACTION_DESC` ";
		$sSQL .= "FROM `".$sView."` ";
		$sSQL .= "WHERE `PREMISE_PK` = :PremiseId ";
		$sSQL .= "AND `PREMISELOG_UTS` > :Startstamp ";
		$sSQL .= "AND `PREMISELOG_UTS` <= :Endstamp ";
		$sSQL .= "ORDER BY `PREMISELOG_UTS` ASC ";
		
		//-- SQL Input Values --//
		$aInputVals = array(
			array( "Name"=>"PremiseId",         "type"=>"BINT",     "value"=>$iPremiseId ),
			array( "Name"=>"Startstamp",        "type"=>"BINT",     "value"=>$iStartstamp ),
			array( "Name"=>"Endstamp",          "type"=>"BINT",     "value"=>$iEndstamp )
		);
		
		$aOutputCols = array(
			array( "Name"=>"PremiseId",                 "type"=>"INT" ),
			array( "Name"=>"PremiseName",               "type"=>"STR" ),
			array( "Name"=>"PremiseDesc",               "type"=>"STR" ),
			array( "Name"=>"PremiseLogId",              "type"=>"INT" ),
			array( "Name"=>"PremiseLogUTS",             "type"=>"INT" ),
			array( "Name"=>"PremiseLogCustom1",         "type"=>"STR" ),
			array( "Name"=>"PremiseLogUser",            "type"=>"STR" ),
			array( "Name"=>"LogPresetId",               "type"=>"INT" ),
			array( "Name"=>"LogPresetName",             "type"=>"STR" ),
			array( "Name"=>"LogPresetDesc",             "type"=>"STR" )
		);

		$aResult = $oRestrictedDB->FullBindQuery($sSQL, $aInputVals, $aOutputCols, 0);
		//-- Error Catching --//
		try {
			if($aResult["Error"] === true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			} 
		} catch(Exception $e) {
			//--TODO: Write an actual Error Message --//
		}

		//--------------------------------------------//
		//-- 9.0 - Return Results or Error Message	--//
		//--------------------------------------------// 
		if($bError===false) {
			return array( "Error"=>false, "Data"=>$aResult["Data"] );

		} else {
			return array( "Error"=>true, "ErrMesg"=>"Get PremiseLog: ".$sErrMesg );
		}
	}
}

//========================================================================================================================//
//== #4.0# - User Lookup Functions                                                                                      ==//
//========================================================================================================================//

function dbGetCurrentUserDetails() {
	//----------------------------------------//
	//-- 1.0 - Declare Variables			--//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult				= array();
	$aReturn				= array();
	$sSQL					= "";
	$bError					= false;
	$sErrMesg				= "";
	$aTemporaryView			= array();
	$sView					= "";
	
	
	//----------------------------------------//
	//-- 3.0 - Retrieve User Address        --//
	//----------------------------------------//
	
	//-- Retrieve the View in an array --//
	$aTemporaryView = NonDataViewName("Users");
	$sView = $aTemporaryView["View"];

	$sSQL .= "SELECT ";
	$sSQL .= "	`USERS_PK`, `USERS_USERNAME` ";
	$sSQL .= "FROM `".$sView."` ";
	
	$aInputVals = array();
	
	$aOutputCols = array(
		array( "Name"=>"UserId",				"type"=>"INT" ),
		array( "Name"=>"Username",				"type"=>"STR" )
	);

	$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
	//-- Error Catching --//
	try {
		if( $aResult["Error"]===true ) {
			$bError		= true;
			$sErrMesg	= $aResult["ErrMesg"];
		} 
	} catch(Exception $e) {
		//--TODO: Write an actual Error Message --//
	}

	//--------------------------------------------//
	//-- 9.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if($bError===false) {
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		$aReturn = array( "Error"=>true, "ErrMesg"=>"UserAddressInfo: ".$sErrMesg );
	}
	return $aReturn;
}


function dbGetCurrentUserInfo() {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult				= array();
	$aReturn				= array();
	$sSQL					= "";
	$bError					= false;
	$sErrMesg				= "";
	$aTemporaryView			= array();
	$sView					= "";

	//----------------------------------------//
	//-- 3.0 - SQL QUERY                    --//
	//----------------------------------------//
	if( $bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Users");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];
	
			} else {
				
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`USERS_PK`, ";
				$sSQL .= "	`USERS_STATE`, ";
				$sSQL .= "	`USERS_USERNAME`, ";
				$sSQL .= "	`USERADDRESS_PK`, ";
				$sSQL .= "	`USERADDRESS_LINE1`, ";
				$sSQL .= "	`USERADDRESS_LINE2`, ";
				$sSQL .= "	`USERADDRESS_LINE3`, ";
				$sSQL .= "	`USERADDRESS_POSTALLINE1`, ";
				$sSQL .= "	`USERADDRESS_POSTALLINE2`, ";
				$sSQL .= "	`USERADDRESS_POSTALLINE3`, ";
				$sSQL .= "	`COUNTRIES_PK`, ";
				$sSQL .= "	`COUNTRIES_NAME`, ";
				$sSQL .= "	`COUNTRIES_ABREVIATION`, ";
				$sSQL .= "	`LANGUAGE_PK`, ";
				$sSQL .= "	`LANGUAGE_NAME`, ";
				$sSQL .= "	`LANGUAGE_LANGUAGE`, ";
				$sSQL .= "	`LANGUAGE_VARIANT`, ";
				$sSQL .= "	`LANGUAGE_ENCODING`, ";
				$sSQL .= "	`POSTCODE_PK`, ";
				$sSQL .= "	`POSTCODE_NAME`, ";
				$sSQL .= "	`STATEPROVINCE_PK`, ";
				$sSQL .= "	`STATEPROVINCE_SHORTNAME`, ";
				$sSQL .= "	`STATEPROVINCE_NAME`, ";
				$sSQL .= "	`TIMEZONE_PK`, ";
				$sSQL .= "	`TIMEZONE_CC`, ";
				$sSQL .= "	`TIMEZONE_LATITUDE`, ";
				$sSQL .= "	`TIMEZONE_LONGITUDE`, ";
				$sSQL .= "	`TIMEZONE_TZ`, ";
				$sSQL .= "	`USERSINFO_PK`, ";
				$sSQL .= "	`USERSINFO_TITLE`, ";
				$sSQL .= "	`USERSINFO_GIVENNAMES`, ";
				$sSQL .= "	`USERSINFO_SURNAMES`, ";
				$sSQL .= "	`USERSINFO_DISPLAYNAME`, ";
				$sSQL .= "	`USERSINFO_EMAIL`, ";
				$sSQL .= "	`USERSINFO_PHONENUMBER`, ";
				$sSQL .= "	`USERSINFO_DOB`, ";
				$sSQL .= "	`USERSGENDER_PK`, ";
				$sSQL .= "	`USERSGENDER_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				
				$aInputVals = array();
				
				$aOutputCols = array(
					array( "Name"=>"UserId",							"type"=>"INT" ),
					array( "Name"=>"UserState",							"type"=>"STR" ),
					array( "Name"=>"Username",							"type"=>"STR" ),
					array( "Name"=>"UserAddressId",						"type"=>"STR" ),
					array( "Name"=>"UserAddressLine1",					"type"=>"STR" ),
					array( "Name"=>"UserAddressLine2",					"type"=>"STR" ),
					array( "Name"=>"UserAddressLine3",					"type"=>"STR" ),
					array( "Name"=>"UserAddressPostalLine1",			"type"=>"STR" ),
					array( "Name"=>"UserAddressPostalLine2",			"type"=>"STR" ),
					array( "Name"=>"UserAddressPostalLine3",			"type"=>"STR" ),
					array( "Name"=>"UserAddressCountryId",				"type"=>"INT" ),
					array( "Name"=>"UserAddressCountryName",			"type"=>"STR" ),
					array( "Name"=>"UserAddressCountryAbrv",			"type"=>"STR" ),
					array( "Name"=>"UserAddressLanguageId",				"type"=>"INT" ),
					array( "Name"=>"UserAddressLanguageName",			"type"=>"STR" ),
					array( "Name"=>"UserAddressLanguage",				"type"=>"STR" ),
					array( "Name"=>"UserAddressLanguageVariant",		"type"=>"STR" ),
					array( "Name"=>"UserAddressLanguageEncoding",		"type"=>"STR" ),
					array( "Name"=>"UserAddressPostcodeId",				"type"=>"INT" ),
					array( "Name"=>"UserAddressPostcodeName",			"type"=>"STR" ),
					array( "Name"=>"UserAddressStateProvinceId",		"type"=>"INT" ),
					array( "Name"=>"UserAddressStateProvinceShort",		"type"=>"STR" ),
					array( "Name"=>"UserAddressStateProvinceName",		"type"=>"STR" ),
					array( "Name"=>"UserAddressTimezoneId",				"type"=>"INT" ),
					array( "Name"=>"UserAddressTimezoneCC",				"type"=>"STR" ),
					array( "Name"=>"UserAddressTimezoneLatitude",		"type"=>"STR" ),
					array( "Name"=>"UserAddressTimezoneLongitude",		"type"=>"STR" ),
					array( "Name"=>"UserAddressTimezoneTZ",				"type"=>"STR" ),
					array( "Name"=>"UserInfoId",						"type"=>"INT" ),
					array( "Name"=>"UserInfoTitle",						"type"=>"STR" ),
					array( "Name"=>"UserInfoGivennames",				"type"=>"STR" ),
					array( "Name"=>"UserInfoSurnames",					"type"=>"STR" ),
					array( "Name"=>"UserInfoDisplayname",				"type"=>"STR" ),
					array( "Name"=>"UserInfoEmail",						"type"=>"STR" ),
					array( "Name"=>"UserInfoPhonenumber",				"type"=>"STR" ),
					array( "Name"=>"UserInfoDoB",						"type"=>"STR" ),
					array( "Name"=>"UserInfoGenderId",					"type"=>"INT" ),
					array( "Name"=>"UserInfoGenderName",				"type"=>"STR" )
				);
				
				//----------------------------------------------//
				//-- 
				//----------------------------------------------//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a proper error message --//
		}
	}

	//--------------------------------------------//
	//-- 9.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if($bError===false) {
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		$aReturn = array( "Error"=>true, "ErrMesg"=>"UserAddressInfo: ".$sErrMesg );
	}
	return $aReturn;
}


function dbChangeUserInformation( $iUserInfoId, $iGender, $sTitle, $sGivenames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables				--//
	//--------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `USERSINFO` ";
			$sSQL .= "SET ";
			$sSQL .= "	`USERSINFO_USERSGENDER_FK`	= :Gender, ";
			$sSQL .= "	`USERSINFO_TITLE`			= :Title, ";
			$sSQL .= "	`USERSINFO_GIVENNAMES`		= :Givenames, ";
			$sSQL .= "	`USERSINFO_SURNAMES`		= :Surnames, ";
			$sSQL .= "	`USERSINFO_DISPLAYNAME`		= :Displayname, ";
			$sSQL .= "	`USERSINFO_EMAIL`			= :Email, ";
			$sSQL .= "	`USERSINFO_PHONENUMBER`		= :Phone ";
			$sSQL .= "WHERE `USERSINFO_PK`			= :UserInfoId ";
			
			$aInputVals = array(
				array( "Name"=>"Gender",			"type"=>"INT",		"value"=>$iGender		),
				array( "Name"=>"Title",				"type"=>"STR",		"value"=>$sTitle		),
				array( "Name"=>"Givenames",			"type"=>"STR",		"value"=>$sGivenames	),
				array( "Name"=>"Surnames",			"type"=>"STR",		"value"=>$sSurnames		),
				array( "Name"=>"Displayname",		"type"=>"STR",		"value"=>$sDisplayname	),
				array( "Name"=>"Email",				"type"=>"STR",		"value"=>$sEmail		),
				array( "Name"=>"Phone",				"type"=>"STR",		"value"=>$sPhoneNumber	),
				array( "Name"=>"UserInfoId",		"type"=>"BINT",		"value"=>$iUserInfoId	)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully"));
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"ChangeUserInfo: ".$sErrMesg );
	}
}


function dbChangeUserAddress( $iUserAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressPostalLine1, $sAddressPostalLine2, $sAddressPostalLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables				--//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `USERADDRESS` ";
			$sSQL .= "SET ";
			$sSQL .= "	`USERADDRESS_LINE1`				= :AddressLine1, ";
			$sSQL .= "	`USERADDRESS_LINE2`				= :AddressLine2, ";
			$sSQL .= "	`USERADDRESS_LINE3`				= :AddressLine3, ";
			$sSQL .= "	`USERADDRESS_POSTALLINE1`		= :AddressPostalLine1, ";
			$sSQL .= "	`USERADDRESS_POSTALLINE2`		= :AddressPostalLine2, ";
			$sSQL .= "	`USERADDRESS_POSTALLINE3`		= :AddressPostalLine3, ";
			$sSQL .= "	`USERADDRESS_COUNTRIES_FK`		= :AddressCountryId, ";
			$sSQL .= "	`USERADDRESS_STATEPROVINCE_FK`	= :AddressProvinceId, ";
			$sSQL .= "	`USERADDRESS_POSTCODE_FK`		= :AddressPostcodeId, ";
			$sSQL .= "	`USERADDRESS_TIMEZONE_FK`		= :AddressTimezoneId, ";
			$sSQL .= "	`USERADDRESS_LANGUAGE_FK`		= :AddressLanguageId ";
			$sSQL .= "WHERE `USERADDRESS_PK`			= :UserAddressId ";
			
			$aInputVals = array(
				array( "Name"=>"AddressLine1",			"type"=>"STR",		"value"=>$sAddressLine1			),
				array( "Name"=>"AddressLine2",			"type"=>"STR",		"value"=>$sAddressLine2			),
				array( "Name"=>"AddressLine3",			"type"=>"STR",		"value"=>$sAddressLine3			),
				array( "Name"=>"AddressPostalLine1",	"type"=>"STR",		"value"=>$sAddressPostalLine1	),
				array( "Name"=>"AddressPostalLine2",	"type"=>"STR",		"value"=>$sAddressPostalLine2	),
				array( "Name"=>"AddressPostalLine3",	"type"=>"STR",		"value"=>$sAddressPostalLine3	),
				array( "Name"=>"AddressCountryId",		"type"=>"INT",		"value"=>$sAddressCountry		),
				array( "Name"=>"AddressProvinceId",		"type"=>"INT",		"value"=>$sAddressStateProvince	),
				array( "Name"=>"AddressPostcodeId",		"type"=>"INT",		"value"=>$sAddressPostcode		),
				array( "Name"=>"AddressTimezoneId",		"type"=>"INT",		"value"=>$sAddressTimezone		),
				array( "Name"=>"AddressLanguageId",		"type"=>"INT",		"value"=>$sAddressLanguage		),
				array( "Name"=>"UserAddressId",			"type"=>"BINT",		"value"=>$iUserAddressId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
			
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully"));
		
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"UserChangeAddress: ".$sErrMesg );
	}
}



function dbChangeUserPassword( $sPassword ) {
	
	//-- TODO: Make a fallback to use the "MySQL 5.7.6" Method for when this method is no longer supported --//
	
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "SET PASSWORD = PASSWORD( :NewPassword )";
			
			$aInputVals = array(
				array( "Name"=>"NewPassword",           "type"=>"STR",      "value"=>$sPassword     )
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,   "Data"=>array("Result"=>"Updated succesfully")  );
	} else {
		return array( "Error"=>true,    "ErrMesg"=>"ChangeUserPassword: ".$sErrMesg     );
	}
}


function dbGetUserServerPermissions() {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult            = array();      //-- ARRAY:     --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOL:      --//
	$sErrMesg           = "";           //-- STRING:    --//
	$aInputVals         = array();      //-- ARRAY:     --//
	
	
	$sCurrentSchema     = getCurrentSchema();
	
	//----------------------------------------//
	//-- 3.0 - SQL QUERY                    --//
	//----------------------------------------//
	if( $bError===false) {
		try {
			
			$sSQL .= "SELECT ";
			$sSQL .= "	`USERS_PK`, ";
			$sSQL .= "	`USERS_STATE`, ";
			$sSQL .= "	`USERS_USERNAME`, ";
			$sSQL .= "	`USERADDRESS_PK`, ";
			$sSQL .= "	`USERADDRESS_LINE1`, ";
			$sSQL .= "	`USERADDRESS_LINE2`, ";
			$sSQL .= "	`USERADDRESS_LINE3`, ";
			$sSQL .= "	`USERADDRESS_POSTALLINE1`, ";
			$sSQL .= "	`USERADDRESS_POSTALLINE2`, ";

			$sSQL .= "FROM `".$sView."` ";
			$sSQL .= "LEFT JOIN `PERMSERVER` ON `USERS_PK` = `PERMSERVER_USERS_FK` ";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') ";
				
			$aInputVals = array();
				
			$aOutputCols = array(
				array( "Name"=>"UserId",							"type"=>"INT" ),
				array( "Name"=>"UserState",							"type"=>"STR" ),
				array( "Name"=>"Username",							"type"=>"STR" ),
				array( "Name"=>"UserAddressId",						"type"=>"STR" ),
				array( "Name"=>"UserAddressLine1",					"type"=>"STR" ),
				array( "Name"=>"UserAddressLine2",					"type"=>"STR" ),
				array( "Name"=>"UserAddressLine3",					"type"=>"STR" ),
				array( "Name"=>"UserAddressPostalLine1",			"type"=>"STR" ),
				array( "Name"=>"UserAddressPostalLine2",			"type"=>"STR" ),
				array( "Name"=>"UserAddressPostalLine3",			"type"=>"STR" ),
				array( "Name"=>"UserAddressCountryId",				"type"=>"INT" ),
				array( "Name"=>"UserAddressCountryName",			"type"=>"STR" ),
				array( "Name"=>"UserAddressCountryAbrv",			"type"=>"STR" ),
				array( "Name"=>"UserAddressLanguageId",				"type"=>"INT" ),
				array( "Name"=>"UserAddressLanguageName",			"type"=>"STR" ),
				array( "Name"=>"UserAddressLanguage",				"type"=>"STR" ),
				array( "Name"=>"UserAddressLanguageVariant",		"type"=>"STR" ),
				array( "Name"=>"UserAddressLanguageEncoding",		"type"=>"STR" ),
				array( "Name"=>"UserAddressPostcodeId",				"type"=>"INT" ),
				array( "Name"=>"UserAddressPostcodeName",			"type"=>"STR" ),
				array( "Name"=>"UserAddressStateProvinceId",		"type"=>"INT" ),
				array( "Name"=>"UserAddressStateProvinceShort",		"type"=>"STR" ),
				array( "Name"=>"UserAddressStateProvinceName",		"type"=>"STR" ),
				array( "Name"=>"UserAddressTimezoneId",				"type"=>"INT" ),
				array( "Name"=>"UserAddressTimezoneCC",				"type"=>"STR" ),
				array( "Name"=>"UserAddressTimezoneLatitude",		"type"=>"STR" ),
				array( "Name"=>"UserAddressTimezoneLongitude",		"type"=>"STR" ),
				array( "Name"=>"UserAddressTimezoneTZ",				"type"=>"STR" ),
				array( "Name"=>"UserInfoId",						"type"=>"INT" ),
				array( "Name"=>"UserInfoTitle",						"type"=>"STR" ),
				array( "Name"=>"UserInfoGivennames",				"type"=>"STR" ),
				array( "Name"=>"UserInfoSurnames",					"type"=>"STR" ),
				array( "Name"=>"UserInfoDisplayname",				"type"=>"STR" ),
				array( "Name"=>"UserInfoEmail",						"type"=>"STR" ),
				array( "Name"=>"UserInfoPhonenumber",				"type"=>"STR" ),
				array( "Name"=>"UserInfoDoB",						"type"=>"STR" ),
				array( "Name"=>"UserInfoGenderId",					"type"=>"INT" ),
				array( "Name"=>"UserInfoGenderName",				"type"=>"STR" )
			);
				
			//----------------------------------------------//
			//-- 
			//----------------------------------------------//
			$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a proper error message --//
		}
	}

	//--------------------------------------------//
	//-- 9.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if($bError===false) {
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		$aReturn = array( "Error"=>true, "ErrMesg"=>"UserAddressInfo: ".$sErrMesg );
	}
	return $aReturn;
}






//========================================================================================================================//
//== #5.0# - Premise Functions                                                                                          ==//
//========================================================================================================================//

function dbGetPremisesInfoFromPremiseId( $iId ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOLEAN:		--//
	$sErrMesg			= "";			//-- STRING:		--//
	$sView				= "";			//-- STRING:		--//
	
	$aTemporaryView		= array();		//-- ARRAY:		A array to store information about which view to use like the viewname and columns. --//
	$aInputVals			= array();		//-- ARRAY:		SQL bind input parameters --//
	$aOutputCols		= array();		//-- ARRAY:		An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation				--//
	//----------------------------------------//
	if( $bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Premises");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];

			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];

				$sSQL .= "SELECT ";
				$sSQL .= "    `PERMISSIONS_OWNER`, ";
				$sSQL .= "    `PERMISSIONS_WRITE`, ";
				$sSQL .= "    `PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "    `PERMISSIONS_READ`, ";
				$sSQL .= "    `PREMISE_PK`, ";
				$sSQL .= "    `PREMISE_NAME`, ";
				$sSQL .= "    `PREMISE_DESCRIPTION`, ";
				$sSQL .= "    `PREMISEINFO_PK`, ";
				$sSQL .= "    `PREMISEBEDROOMS_PK`, ";
				$sSQL .= "    `PREMISEBEDROOMS_COUNT`, ";
				$sSQL .= "    `PREMISEOCCUPANTS_PK`, ";
				$sSQL .= "    `PREMISEOCCUPANTS_NAME`, ";
				$sSQL .= "    `PREMISEROOMS_PK`, ";
				$sSQL .= "    `PREMISEROOMS_NAME`, ";
				$sSQL .= "    `PREMISEFLOORS_PK`, ";
				$sSQL .= "    `PREMISEFLOORS_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `PREMISE_PK` = :PremiseId ";
				$sSQL .= "LIMIT 1 ";

				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array( "Name"=>"PremiseId",		"type"=>"INT",		"value"=>$iId		)
				);
					
				//-- Set the SQL Output Columns --//
				$aOutputCols = array(
					array( "Name"=>"PermOwner",						"type"=>"INT" ),
					array( "Name"=>"PermWrite",						"type"=>"INT" ),
					array( "Name"=>"PermStateToggle",				"type"=>"INT" ),
					array( "Name"=>"PermRead",						"type"=>"INT" ),
					array( "Name"=>"PremiseId",						"type"=>"INT" ),
					array( "Name"=>"PremiseName",					"type"=>"STR" ),
					array( "Name"=>"PremiseDesc",					"type"=>"STR" ),
					array( "Name"=>"PremiseInfoId",					"type"=>"INT" ),
					array( "Name"=>"BedroomsId",					"type"=>"INT" ),
					array( "Name"=>"BedroomsName",					"type"=>"STR" ),
					array( "Name"=>"OccupantsId",					"type"=>"INT" ),
					array( "Name"=>"OccupantsName",					"type"=>"STR" ),
					array( "Name"=>"RoomsId",						"type"=>"INT" ),
					array( "Name"=>"RoomsName",						"type"=>"STR" ),
					array( "Name"=>"FloorsId",						"type"=>"INT" ),
					array( "Name"=>"FloorsName",					"type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1);
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a proper error message --//
		}
	}

	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>"GetPremiseInfoFromId: ".$sErrMesg );
	}
}


function dbGetPremisesAddressFromPremiseId( $iPremiseId ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOLEAN:		--//
	$sErrMesg			= "";			//-- STRING:		--//
	$sView				= "";			//-- STRING:		--//
	
	$aTemporaryView		= array();		//-- ARRAY:		A array to store information about which view to use like the viewname and columns. --//
	$aInputVals			= array();		//-- ARRAY:		SQL bind input parameters --//
	$aOutputCols		= array();		//-- ARRAY:		An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation				--//
	//----------------------------------------//
	if( $bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Premisesaddress");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];

			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];

				$sSQL .= "SELECT ";
				$sSQL .= "    `PERMISSIONS_OWNER`, ";
				$sSQL .= "    `PERMISSIONS_WRITE`, ";
				$sSQL .= "    `PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "    `PERMISSIONS_READ`, ";
				$sSQL .= "    `PREMISE_PK`, ";
				$sSQL .= "    `PREMISE_NAME`, ";
				$sSQL .= "    `PREMISE_DESCRIPTION`, ";
				$sSQL .= "    `PREMISEADDRESS_PK`, ";
				$sSQL .= "    `PREMISEADDRESS_LINE1`, ";
				$sSQL .= "    `PREMISEADDRESS_LINE2`, ";
				$sSQL .= "    `PREMISEADDRESS_LINE3`, ";
				$sSQL .= "    `COUNTRIES_PK`, ";
				$sSQL .= "    `COUNTRIES_NAME`, ";
				$sSQL .= "    `COUNTRIES_ABREVIATION`, ";
				$sSQL .= "    `LANGUAGE_PK`, ";
				$sSQL .= "    `LANGUAGE_NAME`, ";
				$sSQL .= "    `LANGUAGE_LANGUAGE`, ";
				$sSQL .= "    `LANGUAGE_VARIANT`, ";
				$sSQL .= "    `LANGUAGE_ENCODING`, ";
				$sSQL .= "    `POSTCODE_PK`, ";
				$sSQL .= "    `POSTCODE_NAME`, ";
				$sSQL .= "    `STATEPROVINCE_PK`, ";
				$sSQL .= "    `STATEPROVINCE_SHORTNAME`, ";
				$sSQL .= "    `STATEPROVINCE_NAME`, ";
				$sSQL .= "    `TIMEZONE_PK`, ";
				$sSQL .= "    `TIMEZONE_CC`, ";
				$sSQL .= "    `TIMEZONE_LATITUDE`, ";
				$sSQL .= "    `TIMEZONE_LONGITUDE`, ";
				$sSQL .= "    `TIMEZONE_TZ` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `PREMISE_PK` = :PremiseId ";
				$sSQL .= "LIMIT 1 ";

				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array( "Name"=>"PremiseId",		"type"=>"INT",		"value"=>$iPremiseId		)
				);
					
					
				//-- Set the SQL Output Columns --//
				$aOutputCols = array(
					array( "Name"=>"PermOwner",						"type"=>"INT" ),
					array( "Name"=>"PermWrite",						"type"=>"INT" ),
					array( "Name"=>"PermStateToggle",				"type"=>"INT" ),
					array( "Name"=>"PermRead",						"type"=>"INT" ),
					array( "Name"=>"PremiseId",						"type"=>"INT" ),
					array( "Name"=>"PremiseName",					"type"=>"STR" ),
					array( "Name"=>"PremiseDesc",					"type"=>"STR" ),
					array( "Name"=>"AddressId",						"type"=>"INT" ),
					array( "Name"=>"AddressLine1",					"type"=>"STR" ),
					array( "Name"=>"AddressLine2",					"type"=>"STR" ),
					array( "Name"=>"AddressLine3",					"type"=>"STR" ),
					array( "Name"=>"AddressCountryId",				"type"=>"INT" ),
					array( "Name"=>"AddressCountryName",			"type"=>"STR" ),
					array( "Name"=>"AddressCountryAbrv",			"type"=>"STR" ),
					array( "Name"=>"AddressLanguageId",				"type"=>"INT" ),
					array( "Name"=>"AddressLanguageName",			"type"=>"STR" ),
					array( "Name"=>"AddressLanguage",				"type"=>"STR" ),
					array( "Name"=>"AddressLanguageVariant",		"type"=>"STR" ),
					array( "Name"=>"AddressLanguageEncoding",		"type"=>"STR" ),
					array( "Name"=>"AddressPostcodeId",				"type"=>"INT" ),
					array( "Name"=>"AddressPostcodeName",			"type"=>"STR" ),
					array( "Name"=>"AddressStateProvinceId",		"type"=>"INT" ),
					array( "Name"=>"AddressStateProvinceShortName",	"type"=>"STR" ),
					array( "Name"=>"AddressStateProvinceName",		"type"=>"STR" ),
					array( "Name"=>"AddressTimezoneId",				"type"=>"INT" ),
					array( "Name"=>"AddressTimezoneCC",				"type"=>"STR" ),
					array( "Name"=>"AddressTimezoneLatitude",		"type"=>"STR" ),
					array( "Name"=>"AddressTimezoneLongitude",		"type"=>"STR" ),
					array( "Name"=>"AddressTimezoneTZ",				"type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1);
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch(Exception $e) {
			//-- TODO: Add a proper error message --//
		}
	}

	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message	--//
	//--------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false,	"Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"GetPremiseInfoFromId: ".$sErrMesg );
	}
}



function dbChangePremiseName( $iPremiseId, $sName ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables				--//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `PREMISE` ";
			$sSQL .= "SET `PREMISE_NAME` = :PremiseName ";
			$sSQL .= "WHERE `PREMISE_PK` = :PremiseId ";
			
			$aInputVals = array(
				array( "Name"=>"PremiseName",			"type"=>"STR",		"value"=>$sName			),
				array( "Name"=>"PremiseId",				"type"=>"BINT",		"value"=>$iPremiseId	)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully"));
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"PremiseChangeName: ".$sErrMesg );
	}
}

function dbChangePremiseDesc( $iPremiseId, $sDescription ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `PREMISE` ";
			$sSQL .= "SET `PREMISE_DESCRIPTION` = :PremiseDesc ";
			$sSQL .= "WHERE `PREMISE_PK` = :PremiseId ";
			
			$aInputVals = array(
				array( "Name"=>"PremiseDesc",		"type"=>"STR",		"value"=>$sDescription		),
				array( "Name"=>"PremiseId",			"type"=>"BINT",		"value"=>$iPremiseId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
			
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully"));
		
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"PremiseChangeDesc: ".$sErrMesg );
	}
}


function dbChangePremiseAddress( $iPremiseAddressId, $sAddressLine1, $sAddressLine2, $sAddressLine3, $sAddressCountry, $sAddressStateProvince, $sAddressPostcode, $sAddressTimezone, $sAddressLanguage ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `PREMISEADDRESS` ";
			$sSQL .= "SET ";
			$sSQL .= "	`PREMISEADDRESS_LINE1`				= :AddressLine1, ";
			$sSQL .= "	`PREMISEADDRESS_LINE2`				= :AddressLine2, ";
			$sSQL .= "	`PREMISEADDRESS_LINE3`				= :AddressLine3, ";
			$sSQL .= "	`PREMISEADDRESS_COUNTRIES_FK`		= :AddressCountryId, ";
			$sSQL .= "	`PREMISEADDRESS_STATEPROVINCE_FK`	= :AddressProvinceId, ";
			$sSQL .= "	`PREMISEADDRESS_POSTCODE_FK`		= :AddressPostcodeId, ";
			$sSQL .= "	`PREMISEADDRESS_TIMEZONE_FK`		= :AddressTimezoneId, ";
			$sSQL .= "	`PREMISEADDRESS_LANGUAGE_FK`		= :AddressLanguageId ";
			$sSQL .= "WHERE `PREMISEADDRESS_PK`				= :PremiseAddressId ";
			
			$aInputVals = array(
				array( "Name"=>"AddressLine1",			"type"=>"STR",		"value"=>$sAddressLine1			),
				array( "Name"=>"AddressLine2",			"type"=>"STR",		"value"=>$sAddressLine2			),
				array( "Name"=>"AddressLine3",			"type"=>"STR",		"value"=>$sAddressLine3			),
				array( "Name"=>"AddressCountryId",		"type"=>"INT",		"value"=>$sAddressCountry		),
				array( "Name"=>"AddressProvinceId",		"type"=>"INT",		"value"=>$sAddressStateProvince	),
				array( "Name"=>"AddressPostcodeId",		"type"=>"INT",		"value"=>$sAddressPostcode		),
				array( "Name"=>"AddressTimezoneId",		"type"=>"INT",		"value"=>$sAddressTimezone		),
				array( "Name"=>"AddressLanguageId",		"type"=>"INT",		"value"=>$sAddressLanguage		),
				array( "Name"=>"PremiseAddressId",		"type"=>"BINT",		"value"=>$iPremiseAddressId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
			
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully"));
		
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"PremiseChangeAddress: ".$sErrMesg );
	}
}



function dbChangePremiseInfo( $iPremiseInfoId, $sPostInfoOccupants, $sPostInfoBedrooms, $sPostInfoFloors, $sPostInfoRooms ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables				--//
	//--------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `PREMISEINFO` ";
			$sSQL .= "SET ";
			$sSQL .= "	`PREMISEINFO_PREMISEBEDROOMS_FK`	= :PremiseBedroomsId, ";
			$sSQL .= "	`PREMISEINFO_PREMISEOCCUPANTS_FK`	= :PremiseOccupantsId, ";
			$sSQL .= "	`PREMISEINFO_PREMISEROOMS_FK`		= :PremiseRoomsId, ";
			$sSQL .= "	`PREMISEINFO_PREMISEFLOORS_FK`		= :PremiseFloorsId ";
			$sSQL .= "WHERE `PREMISEINFO_PK`				= :PremiseInfoId ";
			
			$aInputVals = array(
				array( "Name"=>"PremiseBedroomsId",			"type"=>"INT",		"value"=>$sPostInfoBedrooms		),
				array( "Name"=>"PremiseOccupantsId",		"type"=>"INT",		"value"=>$sPostInfoOccupants	),
				array( "Name"=>"PremiseRoomsId",			"type"=>"INT",		"value"=>$sPostInfoRooms		),
				array( "Name"=>"PremiseFloorsId",			"type"=>"INT",		"value"=>$sPostInfoFloors		),
				array( "Name"=>"PremiseInfoId",				"type"=>"BINT",		"value"=>$iPremiseInfoId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
			
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully") );
		
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"PremiseChangeInfo: ".$sErrMesg );
	}
}

//========================================================================================================================//
//== #6.0# - Rooms Functions                                                                                            ==//
//========================================================================================================================//



function dbGetRoomInfoFromRoomId( $iRoomId ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables			--//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult			= array();			//-- ARRAY:		--//
	$aReturn			= array();
	$sSQL				= "";				//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;			//-- BOOL:		--//
	$sErrMesg			= "";				//-- STRING:		--//
	$sView				= "";				//-- STRING:		--//
	
	$aTemporaryView		= array();			//-- ARRAY: A array to store information about which view to use like the viewname and columns. --//
	$aInputVals			= array();			//-- ARRAY: SQL bind input parameters --//
	$aOutputColsId		= array();			//-- ARRAY: An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//


	//----------------------------------------//
	//-- 2.0 - SQL Preperation				--//
	//----------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Rooms");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];

			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];

				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`PREMISE_PK`, ";
				$sSQL .= "	`PREMISE_NAME`, ";
				$sSQL .= "	`ROOMS_PK`, ";
				$sSQL .= "	`ROOMS_NAME`, ";
				$sSQL .= "	`ROOMS_FLOOR`, ";
				$sSQL .= "	`ROOMS_DESC`, ";
				$sSQL .= "	`ROOMTYPE_PK`, ";
				$sSQL .= "	`ROOMTYPE_NAME`, ";
				$sSQL .= "	`ROOMTYPE_OUTDOORS` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `ROOMS_PK` = :RoomId ";
				$sSQL .= "LIMIT 1 ";

				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array(	"Name"=>"RoomId",		"type"=>"INT",		"value"=>$iRoomId	)
				);
				
				//-- Set the SQL Output Columns --//
				$aOutputColsId = array(
					array( "Name"=>"PermOwner",					"type"=>"INT" ),
					array( "Name"=>"PermWrite",					"type"=>"INT" ),
					array( "Name"=>"PermStateToggle",			"type"=>"INT" ),
					array( "Name"=>"PermRead",					"type"=>"INT" ),
					array( "Name"=>"PremiseId",					"type"=>"INT" ),
					array( "Name"=>"PremiseName",				"type"=>"STR" ),
					
					array( "Name"=>"RoomId",					"type"=>"INT" ),
					array( "Name"=>"RoomName",					"type"=>"STR" ),
					array( "Name"=>"RoomFloor",					"type"=>"INT" ),
					array( "Name"=>"RoomDesc",					"type"=>"STR" ),
					array( "Name"=>"RoomTypeId",				"type"=>"INT" ),
					array( "Name"=>"RoomTypeName",				"type"=>"STR" ),
					array( "Name"=>"RoomTypeOutdoors",			"type"=>"INT" )
				);

				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery($sSQL, $aInputVals, $aOutputColsId, 1);
			}
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if($bError===false) {
		try {
			if($aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch(Exception $e) {
			//-- TODO: Add an error message here --//
		}
	}

	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message	--//
	//--------------------------------------------// 
	if($bError===false) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>"GetRoomInfoFromId: ".$sErrMesg );
	}
}



function dbChangeRoomInfo( $iRoomId, $sName, $iFloor, $sDesc, $iRoomsTypeId ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables				--//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOL:		--//
	$sErrMesg			= "";			//-- STRING:	--//
	$sSchema			= "";			//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();		//-- ARRAY:		--//


	//--------------------------------------------//
	//-- 2.0 - SQL Query						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `ROOMS` ";
			$sSQL .= "SET ";
			$sSQL .= "	`ROOMS_NAME`			= :RoomName, ";
			$sSQL .= "	`ROOMS_FLOOR`			= :RoomFloor, ";
			$sSQL .= "	`ROOMS_DESC`			= :RoomDesc, ";
			$sSQL .= "	`ROOMS_ROOMTYPE_FK`		= :RoomTypeId ";
			$sSQL .= "WHERE `ROOMS_PK`			= :RoomId ";

			$aInputVals = array(
				array( "Name"=>"RoomName",			"type"=>"STR",		"value"=>$sName			),
				array( "Name"=>"RoomFloor",			"type"=>"STR",		"value"=>$iFloor		),
				array( "Name"=>"RoomDesc",			"type"=>"STR",		"value"=>$sDesc			),
				array( "Name"=>"RoomTypeId",		"type"=>"STR",		"value"=>$iRoomsTypeId	),
				array( "Name"=>"RoomId",			"type"=>"BINT",		"value"=>$iRoomId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg .= $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}

	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( 
			"Error"=>$aResult["Error"], 
			"Data"=>array( "Result"=>"Updated succesfully") 
		);

	} else {
		return array( "Error"=>true, "ErrMesg"=>"RoomChangeInfo: ".$sErrMesg );
	}
}


function dbAddNewRoom( $iPremiseId, $iRoomsTypeId, $sName, $iFloor, $sDescription ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables			--//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$bError					= false;			//-- BOOL:		--//
	$sErrMesg				= "";				//-- STRING:	--//
	$aReturn				= array();			//-- ARRAY:		--//

	$sQueryInsert			= "";				//-- STRING:	Used to store the SQL string so it can be passed to the database functions	--//
	$aResultInsert			= array();			//-- ARRAY:		--//
	$aInputValsInsert		= array();			//-- ARRAY:		SQL bind input parameters	--//
	$aOutputColsId			= array();			//-- ARRAY:		An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------//
	//-- 3.0 - Insert the new UserInfo		--//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			
			//----------------------------------------//
			//-- SQL Query - Insert Rooms           --//
			//----------------------------------------//
			$sQueryInsert .= "INSERT INTO `ROOMS` ";
			$sQueryInsert .= "( ";
			$sQueryInsert .= "    `ROOMS_PREMISE_FK`,       `ROOMS_ROOMTYPE_FK`, ";
			$sQueryInsert .= "    `ROOMS_NAME`,             `ROOMS_FLOOR`, ";
			$sQueryInsert .= "    `ROOMS_DESC` ";
			$sQueryInsert .= ") VALUES ( ";
			$sQueryInsert .= "    :PremiseId,       :RoomTypeId, ";				//-- PremiseFK, RoomTypeFK,				--//
			$sQueryInsert .= "    :RoomName,        :RoomFloor, ";				//-- RoomName, RoomFloor				--//
			$sQueryInsert .= "    :RoomDesc ";									//-- RoomDesc 							--//
			$sQueryInsert .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseId",					"type"=>"BINT",				"value"=>$iPremiseId	),
				array( "Name"=>"RoomTypeId",				"type"=>"INT",				"value"=>$iRoomsTypeId	),
				array( "Name"=>"RoomName",					"type"=>"STR",				"value"=>$sName			),
				array( "Name"=>"RoomFloor",					"type"=>"INT",				"value"=>$iFloor		),
				array( "Name"=>"RoomDesc",					"type"=>"STR",				"value"=>$sDescription	)
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sQueryInsert, $aInputValsInsert );
			
			//----------------------------//
			//-- Error Checking         --//
			//----------------------------//
			if( $aResultInsert["Error"]===true ) {
				//-- Error Occurred when Inserting		--//
				$bError     = true;
				$sErrMesg  .= "Error inserting the new \"Room\"! \n";
				$sErrMesg  .= $aResultInsert["ErrMesg"]." \n";
				//$sErrMesg  .= "\n ".$sQueryInsert." \n";
				//$sErrMesg  .= "\n ".JSON.stringify($aInputValsInsert)." \n";
			}
		
		} catch( Exception $e30 ) {
			//-- Debugging: Catch any unexpected errors --//
			$bError = true;
			$sErrMesg  = "Unexpected Error! \n";
			$sErrMesg .= "Error occurred when inserting a new \"Room\". \n";
			$sErrMesg .= $e30->getMessage()." \n";
		}
	}
	//--------------------------------------------//
	//-- 9.0 Return Results or Error Message    --//
	//--------------------------------------------//
	if($bError===false) {
		return $aResultInsert;

	} else {
		return array( "Error"=>true, "ErrMesg"=>"Insert Room: ".$sErrMesg );
	}
}


function dbDeleteExistingRoom( $iRoomId ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables			--//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$bError					= false;			//-- BOOL:		--//
	$sErrMesg				= "";				//-- STRING:	--//
	$aReturn				= array();			//-- ARRAY:		--//

	$sQuery					= "";				//-- STRING:	Used to store the SQL string so it can be passed to the database functions	--//
	$aResult				= array();			//-- ARRAY:		--//
	$aInputVals				= array();			//-- ARRAY:		SQL bind input parameters	--//
	$aOutputColsId			= array();			//-- ARRAY:		An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------//
	//-- 3.0 - Perform the SQLQuery			--//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			
			//----------------------------------------//
			//-- SQL Query - Delete Room			--//
			//----------------------------------------//
			$sQuery .= "DELETE FROM `ROOMS` ";
			$sQuery .= "WHERE `ROOMS_PK` = :RoomId ";
			
			
			//-- Input binding --//
			$aInputVals = array(
				array( "Name"=>"RoomId",					"type"=>"BINT",				"value"=>$iRoomId	)
			);
			
			//-- Run the SQL Query and save the results --//
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sQuery, $aInputVals );
			
			//----------------------------//
			//-- Error Checking			--//
			//----------------------------//
			if( $aResult["Error"]===true ) {
				//-- Error Occurred when Inserting		--//
				$bError     = true;
				$sErrMesg  .= "Error deleting the existing \"Room\"! \n";
				$sErrMesg  .= $aResult["ErrMesg"]." \n";
			}
		
		} catch( Exception $e30 ) {
			//-- Debugging: Catch any unexpected errors --//
			$bError = true;
			$sErrMesg  = "Unexpected Error! \n";
			$sErrMesg .= "Error occurred when deleting an existing \"Room\". \n";
			$sErrMesg .= $e30->getMessage()." \n";
		}
	}
	//--------------------------------------------//
	//-- 9.0 Return Results or Error Message    --//
	//--------------------------------------------//
	if($bError===false) {
		return $aResult;

	} else {
		return array( "Error"=>true, "ErrMesg"=>"Delete Room: ".$sErrMesg );
	}
}


//========================================================================================================================//
//== #7.0# - Hub Functions                                                                                              ==//
//========================================================================================================================//
function dbHubRetrieveInfoAndPermission( $iHubId ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOLEAN:		--//
	$sErrMesg			= "";			//-- STRING:		--//
	$sView				= "";			//-- STRING:		--//
	
	$aTemporaryView     = array();      //-- ARRAY:     A array to store information about which view to use like the viewname and columns. --//
	$aInputVals         = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aOutputCols        = array();      //-- ARRAY:     An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation              --//
	//----------------------------------------//
	if( $bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Hub");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];

			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];

				$sSQL .= "SELECT ";
				$sSQL .= "    `PERMISSIONS_OWNER`, ";
				$sSQL .= "    `PERMISSIONS_WRITE`, ";
				$sSQL .= "    `PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "    `PERMISSIONS_READ`, ";
				$sSQL .= "    `PREMISE_PK`, ";
				$sSQL .= "    `PREMISE_NAME`, ";
				//$sSQL .= "    `PREMISE_DESCRIPTION`, ";
				$sSQL .= "    `HUB_PK`, ";
				$sSQL .= "    `HUB_NAME`, ";
				$sSQL .= "    `HUB_SERIALNUMBER`, ";
				//$sSQL .= "    `HUB_INITED`, ";
				$sSQL .= "    `HUB_IPADDRESS`, ";
				$sSQL .= "    `HUBTYPE_PK`, ";
				$sSQL .= "    `HUBTYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `HUB_PK` = :HubId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array( "Name"=>"HubId",     "type"=>"INT",      "value"=>$iHubId    )
				);
				
				//-- Set the SQL Output Columns --//
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                     "type"=>"INT" ),
					array( "Name"=>"PermWrite",						"type"=>"INT" ),
					array( "Name"=>"PermStateToggle",				"type"=>"INT" ),
					array( "Name"=>"PermRead",						"type"=>"INT" ),
					array( "Name"=>"PremiseId",						"type"=>"INT" ),
					array( "Name"=>"PremiseName",					"type"=>"STR" ),
					//array( "Name"=>"PremiseDesc",					"type"=>"STR" ),
					array( "Name"=>"HubId",							"type"=>"INT" ),
					array( "Name"=>"HubName",						"type"=>"STR" ),
					array( "Name"=>"HubSerialCode",					"type"=>"STR" ),
					//array( "Name"=>"HubInited",						"type"=>"INT" ),
					array( "Name"=>"HubIpaddress",					"type"=>"STR" ),
					array( "Name"=>"HubTypeId",						"type"=>"INT" ),
					array( "Name"=>"HubTypeName",					"type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1);
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a proper error message --//
		}
	}

	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>"GetPremiseInfoFromId: ".$sErrMesg );
	}
}



function dbChangeHubName( $iHubId, $sName ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `HUB` ";
			$sSQL .= "SET `HUB_NAME` = :HubName ";
			$sSQL .= "WHERE `HUB_PK` = :HubId ";
			
			$aInputVals = array(
				array( "Name"=>"HubName",			"type"=>"STR",		"value"=>$sName		),
				array( "Name"=>"HubId",				"type"=>"BINT",		"value"=>$iHubId	)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check						--//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully") );
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"HubChangeName: ".$sErrMesg );
	}
}

//========================================================================================================================//
//== #8.0# - HUB COMM Functions                                                                                         ==//
//========================================================================================================================//
function dbGetCommInfo( $iCommId ) {
	//--------------------------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                                           --//
	//--    This function is used to lookup the Info for a particular Comm                      --// 
	//--------------------------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Comm");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`COMM_PK`, ";
				$sSQL .= "	`COMM_NAME`, ";
				$sSQL .= "	`COMM_JOINMODE`, ";
				$sSQL .= "	`COMMTYPE_PK`, ";
				$sSQL .= "	`COMMTYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `COMM_PK` = :CommId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"CommId",        "type"=>"INT",    "value"=>$iCommId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT" ),
					array( "Name"=>"PermWrite",                 "type"=>"INT" ),
					array( "Name"=>"PermStateToggle",           "type"=>"INT" ),
					array( "Name"=>"PermRead",                  "type"=>"INT" ),
					array( "Name"=>"HubId",                     "type"=>"INT" ),
					array( "Name"=>"HubName",                   "type"=>"STR" ),
					array( "Name"=>"HubTypeId",                 "type"=>"INT" ),
					array( "Name"=>"HubTypeName",               "type"=>"STR" ),
					array( "Name"=>"CommId",                    "type"=>"INT" ),
					array( "Name"=>"CommName",                  "type"=>"STR" ),
					array( "Name"=>"CommJoinMode",              "type"=>"INT" ),
					array( "Name"=>"CommTypeId",                "type"=>"INT" ),
					array( "Name"=>"CommTypeName",              "type"=>"STR" )
				);
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function dbGetCommsFromHubId( $iHubId ) {
	//--------------------------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                                           --//
	//--    This function is used to find all the Comms on a particular Hub for other functions --//
	//--    that need that list of Comms                                                        --// 
	//--------------------------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Comm");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
			
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`COMM_PK`, ";
				$sSQL .= "	`COMM_NAME`, ";
				$sSQL .= "	`COMM_JOINMODE`, ";
				$sSQL .= "	`COMMTYPE_PK`, ";
				$sSQL .= "	`COMMTYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `HUB_PK` = :HubId ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"HubId",        "type"=>"INT",    "value"=>$iHubId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT" ),
					array( "Name"=>"PermWrite",                 "type"=>"INT" ),
					array( "Name"=>"PermStateToggle",           "type"=>"INT" ),
					array( "Name"=>"PermRead",                  "type"=>"INT" ),
					array( "Name"=>"HubId",                     "type"=>"INT" ),
					array( "Name"=>"HubName",                   "type"=>"STR" ),
					array( "Name"=>"HubTypeId",                 "type"=>"INT" ),
					array( "Name"=>"HubTypeName",               "type"=>"STR" ),
					array( "Name"=>"CommId",                    "type"=>"INT" ),
					array( "Name"=>"CommName",                  "type"=>"STR" ),
					array( "Name"=>"CommJoinMode",              "type"=>"INT" ),
					array( "Name"=>"CommTypeId",                "type"=>"INT" ),
					array( "Name"=>"CommTypeName",              "type"=>"STR" )
				);
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
				
				try {
					if( $aResult["Error"]===true ) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



//----------------------------------------------------------------------------//
//-- ADD HUB COMM                                                           --//
//----------------------------------------------------------------------------//
function dbAddNewHubComm( $iCommHubId, $iCommTypeId, $sCommName, $sCommAddress, $bSQLTransaction ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add a new Hub Comm to the database     --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert Comm            --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `COMM` ";
			$sSQL .= "( ";
			$sSQL .= "    `COMM_HUB_FK`,        `COMM_COMMTYPE_FK`, ";
			$sSQL .= "    `COMM_NAME`,          `COMM_JOINMODE`, ";
			$sSQL .= "    `COMM_ADDRESS` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :CommHubId,        :CommTypeId, ";
			$sSQL .= "    :CommName,         :CommAutoJoin, ";
			$sSQL .= "    :CommAddress ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"CommHubId",       "type"=>"BINT",     "value"=>$iCommHubId    ),
				array( "Name"=>"CommTypeId",      "type"=>"INT",      "value"=>$iCommTypeId   ),
				array( "Name"=>"CommName",        "type"=>"STR",      "value"=>$sCommName     ),
				array( "Name"=>"CommAutoJoin",    "type"=>"INT",      "value"=>0              ),
				array( "Name"=>"CommAddress",     "type"=>"STR",      "value"=>$sCommAddress  )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CommAdd: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- UPDATE COMM                                                            --//
//----------------------------------------------------------------------------//
function dbUpdateCommDetails( $iCommId, $iCommTypeId, $sCommName, $sCommAddress ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used update the Comm entry that links the      --//
	//--    WatchInputs App entry to the Comm entries                       --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			$sSQL .= "UPDATE `".$sSchema."`.`COMM` ";
			$sSQL .= "SET ";
			$sSQL .= "    `COMM_COMMTYPE_FK`      = :CommTypeId, ";
			$sSQL .= "    `COMM_NAME`             = :CommName, ";
			$sSQL .= "    `COMM_ADDRESS`          = :CommAddress ";
			$sSQL .= "WHERE `COMM_PK`             = :CommId ";
			
			$aInputVals = array(
				array( "Name"=>"CommTypeId",     "type"=>"INT",      "value"=>$iCommTypeId   ),
				array( "Name"=>"CommName",       "type"=>"STR",      "value"=>$sCommName     ),
				array( "Name"=>"CommAddress",    "type"=>"STR",      "value"=>$sCommAddress  ),
				array( "Name"=>"CommId",         "type"=>"INT",      "value"=>$iCommId       )
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>$aResult["Error"], "Data"=> array( "Result"=>"Updated succesfully") );
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"CommUpdate: ".$sErrMesg );
	}
}


//========================================================================================================================//
//== #9.0# - Link Functions                                                                                             ==//
//========================================================================================================================//
function dbGetLinkInfo($iLinkId) {
	//----------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                           --//
	//--    This is used to get more information about a "Link" than what the   --//
	//--    "StateAndPermission" function provides.                             --//
	//----------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Link");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`COMM_PK`, ";
				$sSQL .= "	`COMMTYPE_PK`, ";
				$sSQL .= "	`COMMTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_SERIALCODE`, ";
				$sSQL .= "	`LINK_CONNECTED`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`LINKINFO_PK`, ";
				$sSQL .= "	`LINKINFO_NAME`, ";
				$sSQL .= "	`LINKINFO_MANUFACTURER`, ";
				$sSQL .= "	`LINKINFO_MANUFACTURERURL`, ";
				$sSQL .= "	`LINKCONN_PK`, ";
				$sSQL .= "	`LINKCONN_NAME`, ";
				$sSQL .= "	`LINKCONN_ADDRESS`, ";
				$sSQL .= "	`LINKCONN_USERNAME`, ";
				$sSQL .= "	`LINKCONN_PASSWORD`, ";
				$sSQL .= "	`LINKCONN_PORT`, ";
				$sSQL .= "	`LINKPROTOCOL_PK`, ";
				$sSQL .= "	`LINKPROTOCOL_NAME`, ";
				$sSQL .= "	`LINKCRYPTTYPE_PK`, ";
				$sSQL .= "	`LINKCRYPTTYPE_NAME`, ";
				$sSQL .= "	`LINKFREQ_PK`, ";
				$sSQL .= "	`LINKFREQ_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `LINK_PK` = :LinkId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"LinkId",        "type"=>"INT",    "value"=>$iLinkId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT"),
					array( "Name"=>"PermWrite",                 "type"=>"INT"),
					array( "Name"=>"PermStateToggle",           "type"=>"INT"),
					array( "Name"=>"PermRead",                  "type"=>"INT"),
					array( "Name"=>"HubId",                     "type"=>"INT"),
					array( "Name"=>"HubName",                   "type"=>"STR"),
					array( "Name"=>"HubTypeId",                 "type"=>"INT"),
					array( "Name"=>"HubTypeName",               "type"=>"STR"),
					array( "Name"=>"CommId",                    "type"=>"INT"),
					array( "Name"=>"CommTypeId",                "type"=>"INT"),
					array( "Name"=>"CommTypeName",              "type"=>"STR"),
					array( "Name"=>"LinkId",                    "type"=>"INT"),
					array( "Name"=>"LinkName",                  "type"=>"STR"),
					array( "Name"=>"LinkSerialCode",            "type"=>"STR"),
					array( "Name"=>"LinkConnected",             "type"=>"INT"),
					array( "Name"=>"LinkRoomId",                "type"=>"INT"),
					array( "Name"=>"LinkStatus",                "type"=>"INT"),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR"),
					array( "Name"=>"LinkTypeId",                "type"=>"INT"),
					array( "Name"=>"LinkTypeName",              "type"=>"STR"),
					array( "Name"=>"LinkInfoId",                "type"=>"INT"),
					array( "Name"=>"LinkInfoName",              "type"=>"STR"),
					array( "Name"=>"LinkInfoManufacturer",      "type"=>"STR"),
					array( "Name"=>"LinkInfoManufacturerURL",   "type"=>"STR"),
					array( "Name"=>"LinkConnId",                "type"=>"INT"),
					array( "Name"=>"LinkConnName",              "type"=>"STR"),
					array( "Name"=>"LinkConnAddress",           "type"=>"STR"),
					array( "Name"=>"LinkConnUsername",          "type"=>"STR"),
					array( "Name"=>"LinkConnPassword",          "type"=>"STR"),
					array( "Name"=>"LinkConnPort",              "type"=>"INT"),
					array( "Name"=>"LinkConnProtocolId",        "type"=>"INT"),
					array( "Name"=>"LinkConnProtocolName",      "type"=>"STR"),
					array( "Name"=>"LinkConnCryptId",           "type"=>"INT"),
					array( "Name"=>"LinkConnCryptName",         "type"=>"STR"),
					array( "Name"=>"LinkConnFreqId",            "type"=>"INT"),
					array( "Name"=>"LinkConnFreqName",          "type"=>"STR")
					
				);
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function dbGetLinksFromRoomId($iRoomId) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError				= false;
	$sErrMesg			= "";
	$aResult			= array();
	$aReturn			= array();
	$sSQL				= "";
	$aInputVals			= array();
	$aTemporaryView		= array();
	$sView				= "";
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation              --//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Link");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError		= true;
				$sErrMesg	= "Unsupported View";
			} else {
				//-- Store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`PREMISE_PK`, ";
				$sSQL .= "	`PREMISE_NAME`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`LINKINFO_PK`, ";
				$sSQL .= "	`LINKINFO_NAME`, ";
				$sSQL .= "	`LINKINFO_MANUFACTURER`, ";
				$sSQL .= "	`LINKINFO_MANUFACTURERURL`, ";
				$sSQL .= "	`LINKCONN_PK`, ";
				$sSQL .= "	`LINKCONN_NAME`, ";
				$sSQL .= "	`LINKPROTOCOL_NAME`, ";
				$sSQL .= "	`LINKCRYPTTYPE_NAME`, ";
				$sSQL .= "	`LINKFREQ_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `LINK_ROOMS_FK` = :RoomId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"RoomId",       "type"=>"INT",   "value"=>$iRoomId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT" ),
					array( "Name"=>"PermWrite",                 "type"=>"INT" ),
					array( "Name"=>"PermStateToggle",           "type"=>"INT" ),
					array( "Name"=>"PermRead",                  "type"=>"INT" ),
					array( "Name"=>"PremiseId",                 "type"=>"INT" ),
					array( "Name"=>"PremiseName",               "type"=>"STR" ),
					array( "Name"=>"HubId",                     "type"=>"INT" ),
					array( "Name"=>"HubName",                   "type"=>"STR" ),
					array( "Name"=>"HubTypeId",                 "type"=>"INT" ),
					array( "Name"=>"HubTypeName",               "type"=>"STR" ),
					array( "Name"=>"LinkId",                    "type"=>"INT" ),
					array( "Name"=>"LinkName",                  "type"=>"STR" ),
					array( "Name"=>"LinkRoomId",                "type"=>"INT" ),
					array( "Name"=>"LinkStatus",                "type"=>"INT" ),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR" ),
					array( "Name"=>"LinkTypeId",                "type"=>"INT" ),
					array( "Name"=>"LinkTypeName",              "type"=>"STR" ),
					array( "Name"=>"LinkInfoId",                "type"=>"INT" ),
					array( "Name"=>"LinkInfoName",              "type"=>"STR" ),
					array( "Name"=>"LinkInfoManufacturer",      "type"=>"STR" ),
					array( "Name"=>"LinkInfoManufacturerUrl",   "type"=>"STR" ),
					array( "Name"=>"LinkConnectionId",          "type"=>"INT" ),
					array( "Name"=>"LinkConnectionName",        "type"=>"STR" ),
					array( "Name"=>"LinkProtocolName",          "type"=>"STR" ),
					array( "Name"=>"LinkCryptType",             "type"=>"STR" ),
					array( "Name"=>"LinkFrequencyValue",        "type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function dbChangeLinkName( $iLinkId, $sName ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//

	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `LINK` ";
			$sSQL .= "SET `LINK_NAME` = :LinkName ";
			$sSQL .= "WHERE `LINK_PK` = :LinkId ";
			
			$aInputVals = array(
				array( "Name"=>"LinkName",              "type"=>"STR",      "value"=>$sName		),
				array( "Name"=>"LinkId",                "type"=>"BINT",     "value"=>$iLinkId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( 
			"Error"=>$aResult["Error"], 
			"Data"=>array( "Result"=>"Updated succesfully") 
		);
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"LinkChangeName: ".$sErrMesg );
	}
}


function dbChangeLinkRoom( $iLinkId, $iRoomId ) {
	
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOL:		--//
	$sErrMesg			= "";			//-- STRING:	--//
	$sSchema			= "";			//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();		//-- ARRAY:		--//


	//--------------------------------------------//
	//-- 2.0 - SQL Preperation                  --//
	//--------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();

			$sSQL .= "UPDATE `LINK` ";
			$sSQL .= "SET `LINK_ROOMS_FK` = :RoomId ";
			$sSQL .= "WHERE `LINK_PK` = :LinkId ";

			$aInputVals = array(
				array( "Name"=>"RoomId",			"type"=>"BINT",		"value"=>$iRoomId		),
				array( "Name"=>"LinkId",			"type"=>"BINT",		"value"=>$iLinkId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );

		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}

	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 9.0 - Return Results or Error Message  --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( 
			"Error" => $aResult["Error"], 
			"Data"  => array( "Result"=>"Updated succesfully" ) 
		);

	} else {
		return array( "Error"=>true, "ErrMesg"=>"LinkChangeRoom: ".$sErrMesg );
	}
}




function dbLinkRetrieveState( $iLinkId, $bRetrievePermissions ) {
	//----------------------------------------//
	//-- 1.0 Declare Variables              --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult			= array();			//-- ARRAY:		--//
	$aReturn			= array();
	$sSQL				= "";				//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;			//-- BOOL:		--//
	$sErrMesg			= "";				//-- STRING:		--//
	$sView				= "";				//-- STRING:		--//
	
	$aTemporaryView		= array();			//-- ARRAY:		A array to store information about which view to use like the viewname and columns. --//
	$aInputVals			= array();			//-- ARRAY:		SQL bind input parameters --//
	$aOutputCols		= array();			//-- ARRAY:		An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	$sExtraCols			= "";				//-- STRING:	--//
	
	//----------------------------------------//
	//-- 2.0 SQL Preparation                --//
	//----------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Link");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true;
				$sErrMesg = $aTemporaryView["ErrMesg"];

			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];

				//--------------------------------------------------------//
				//-- IF retrieve StateToggle permission is false        --//
				//--------------------------------------------------------//
				if( $bRetrievePermissions===false ) {
					
					$sExtraCols .=	" ";
					
					//-- Set the SQL Output Columns --//
					$aOutputCols = array(
						array( "Name"=>"PremiseId",               "type"=>"INT" ),
						array( "Name"=>"LinkId",                  "type"=>"INT" ),
						array( "Name"=>"LinkName",                "type"=>"STR" ),
						array( "Name"=>"LinkStatus",              "type"=>"INT" ),
						//-- Link Extra --//
						array( "Name"=>"LinkInfoId",              "type"=>"INT" ),
						array( "Name"=>"LinkInfoName",            "type"=>"STR" ),
						array( "Name"=>"LinkManufacturer",        "type"=>"STR" ),
						array( "Name"=>"LinkConnId",              "type"=>"INT" ),
						array( "Name"=>"LinkConnName",            "type"=>"STR" ),
						array( "Name"=>"LinkConnUsername",        "type"=>"STR" ),
						array( "Name"=>"LinkConnPassword",        "type"=>"STR" ),
						array( "Name"=>"LinkConnProtocolId",      "type"=>"INT" ),
						array( "Name"=>"LinkConnProtocolName",    "type"=>"STR" ),
						array( "Name"=>"LinkConnCryptId",         "type"=>"INT" ),
						array( "Name"=>"LinkConnCryptName",       "type"=>"STR" ),
						array( "Name"=>"LinkConnFrequencyId",     "type"=>"INT" ),
						array( "Name"=>"LinkConnFrequencyName",   "type"=>"STR" )
						
					);
				//--------------------------------------------------------//
				//-- ELSEIF retrieve StateToggle Permission is false    --//
				//--------------------------------------------------------//
				} else {
					
					$sExtraCols .=	",    `PERMISSIONS_WRITE`, ";
					$sExtraCols .=	"    `PERMISSIONS_STATETOGGLE`, ";
					$sExtraCols .=	"    `PERMISSIONS_READ` ";
					
					//-- Set the SQL Output Columns --//
					$aOutputCols = array(
						array( "Name"=>"PremiseId",                 "type"=>"INT" ),
						array( "Name"=>"LinkId",                    "type"=>"INT" ),
						array( "Name"=>"LinkName",                  "type"=>"STR" ),
						array( "Name"=>"LinkStatus",                "type"=>"INT" ),
						//-- LinkExtra --//
						array( "Name"=>"LinkInfoId",                "type"=>"INT" ),
						array( "Name"=>"LinkInfoName",              "type"=>"STR" ),
						array( "Name"=>"LinkManufacturer",          "type"=>"STR" ),
						array( "Name"=>"LinkConnId",                "type"=>"INT" ),
						array( "Name"=>"LinkConnName",              "type"=>"STR" ),
						array( "Name"=>"LinkConnUsername",          "type"=>"STR" ),
						array( "Name"=>"LinkConnPassword",          "type"=>"STR" ),
						array( "Name"=>"LinkConnProtocolId",        "type"=>"INT" ),
						array( "Name"=>"LinkConnProtocolName",      "type"=>"STR" ),
						array( "Name"=>"LinkConnCryptId",           "type"=>"INT" ),
						array( "Name"=>"LinkConnCryptName",         "type"=>"STR" ),
						array( "Name"=>"LinkConnFrequencyId",       "type"=>"INT" ),
						array( "Name"=>"LinkConnFrequencyName",     "type"=>"STR" ),
						//-- Permissions --//
						array( "Name"=>"PermWrite",                 "type"=>"INT" ),
						array( "Name"=>"PermStateToggle",           "type"=>"INT" ),
						array( "Name"=>"PermRead",                  "type"=>"INT" )
					);
				}
				
				
				$sSQL .= "SELECT ";
				$sSQL .= "    `PREMISE_PK`, ";
				$sSQL .= "    `LINK_PK`, ";
				$sSQL .= "    `LINK_NAME`, ";
				$sSQL .= "    `LINK_STATE`, ";
				$sSQL .= "    `LINKINFO_PK`, ";
				$sSQL .= "    `LINKINFO_NAME`, ";
				$sSQL .= "    `LINKINFO_MANUFACTURER`, ";
				//$sSQL .= "    `LINKINFO_MANUFACTURERURL`, ";
				$sSQL .= "    `LINKCONN_PK`, ";
				$sSQL .= "    `LINKCONN_NAME`, ";
				$sSQL .= "    `LINKCONN_USERNAME`, ";
				$sSQL .= "    `LINKCONN_PASSWORD`, ";
				$sSQL .= "    `LINKPROTOCOL_PK`, ";
				$sSQL .= "    `LINKPROTOCOL_NAME`, ";
				$sSQL .= "    `LINKCRYPTTYPE_PK`, ";
				$sSQL .= "    `LINKCRYPTTYPE_NAME`, ";
				$sSQL .= "    `LINKFREQ_PK`, ";
				$sSQL .= "    `LINKFREQ_NAME` ";
				//-- Add the extra columns if applicable --//
				$sSQL .= $sExtraCols;
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `LINK_PK` = :LinkId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array( "Name"=>"LinkId",		"type"=>"INT",		"value"=>$iLinkId )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1);
				
			}
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if($bError===false) {
		try {
			if($aResult["Error"]===true) {
				$bError		= true;
				$sErrMesg	= $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Write an error message here --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );
		return $aReturn;

	} else {
		return array( "Error"=>true, "ErrMesg"=>"RetrieveLinkStatus: ".$sErrMesg );
	}
}


function dbChangeLinkState( $iLinkId, $iNewState ) {
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult			= array();		//-- ARRAY:		--//
	$sSQL				= "";			//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;		//-- BOOL:		--//
	$sErrMesg			= "";			//-- STRING:	--//
	$sSchema			= "";			//-- STRING:	Used to store the name of the schema that needs updating.    --//
	$aInputVals			= array();		//-- ARRAY:		--//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();

			$sSQL .= "UPDATE `".$sSchema."`.`LINK` ";
			$sSQL .= "SET `LINK_STATE` = :LinkState ";
			$sSQL .= "WHERE `LINK_PK` = :LinkId ";

			$aInputVals = array(
				array( "Name"=>"LinkState",			"type"=>"INT",		"value"=>$iNewState		),
				array( "Name"=>"LinkId",			"type"=>"BINT",		"value"=>$iLinkId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>$aResult["Error"], "Data"=> array( "Result"=>"Updated succesfully") );
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"ChangeLinkStatus: ".$sErrMesg );
	}
}

//----------------------------------------------------------------------------//
//-- CHECK IF LINK ALREADY EXISTS                                           --//
//----------------------------------------------------------------------------//
function dbCheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sAddress, $sInfoName ) {
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();          //-- ARRAY:     Used to store the Database function's result. --//
	$sSQL               = "";               //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;            //-- BOOLEAN:   Used to flag when an error has been caught. --//
	$sErrMesg           = "";               //-- STRING:    Used to store the error message when an error has been caught so that it can be passed along --//
	$aTemporaryView     = array();          //-- ARRAY:     A array to store information about which view to use like the viewname and columns. --//
	$sView              = "";               //-- STRING:    Used to store the name of the View to perform the SQL Query on --//
	$aInputVals         = array();          //-- ARRAY:     SQL bind input parameters --//
	$aOutputCols        = array();          //-- ARRAY:     An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Link");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError		= true;
				$sErrMesg	= "Unsupported View";
				
			} else {
				//-- Store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`COMM_PK`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_SERIALCODE`, ";
				$sSQL .= "	`LINKINFO_NAME`, ";
				$sSQL .= "	`LINKCONN_ADDRESS` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `COMM_PK`           = :CommId ";
				$sSQL .= "AND `LINK_SERIALCODE`     = :LinkSerial ";
				$sSQL .= "AND `LINKINFO_NAME`       = :LinkInfoName ";
				$sSQL .= "AND `LINKCONN_ADDRESS`    = :LinkConnAddress ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"CommId",             "type"=>"INT",   "value"=>$iCommId ),
					array( "Name"=>"LinkSerial",         "type"=>"STR",   "value"=>$sSerialCode ),
					array( "Name"=>"LinkInfoName",       "type"=>"STR",   "value"=>$sInfoName ),
					array( "Name"=>"LinkConnAddress",    "type"=>"STR",   "value"=>$sAddress )
				);
				
				$aOutputCols = array(
					array( "Name"=>"CommId",                 "type"=>"INT" ),
					array( "Name"=>"LinkId",                 "type"=>"INT" ),
					array( "Name"=>"LinkSerialCode",         "type"=>"STR" ),
					array( "Name"=>"LinkInfoName",           "type"=>"STR" ),
					array( "Name"=>"LinkConnAddress",        "type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"]===true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2["message"];
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			if($aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a error message --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	
	} else {
		return array( "Error"=>true,  "ErrMesg"=>"CheckLinkAlreadyExists: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD LINK                                                               --//
//----------------------------------------------------------------------------//
function dbAddNewLink( $iCommId, $iLinkTypeId, $iInfoId, $iConnectionId, $sSerialCode, $sName, $iState, $iRoomId, $bSQLTransaction ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add a new Link to the database.        --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught.                               --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught.                     --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.                   --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert Link            --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `LINK` ";
			$sSQL .= "( ";
			$sSQL .= "    `LINK_COMM_FK`,           `LINK_LINKTYPE_FK`, ";
			$sSQL .= "    `LINK_LINKINFO_FK`,       `LINK_LINKCONN_FK`, ";
			$sSQL .= "    `LINK_ROOMS_FK`,          `LINK_SERIALCODE`, ";
			$sSQL .= "    `LINK_NAME`,              `LINK_CONNECTED`, ";
			$sSQL .= "    `LINK_STATE`,             `LINK_STATECHANGECODE` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :LinkCommId,              :LinkTypeId, ";
			$sSQL .= "    :LinkInfoId,              :LinkConnectionId, ";
			$sSQL .= "    :LinkRoomId,              :LinkSerialCode, ";
			$sSQL .= "    :LinkName,                :LinkConnected, ";
			$sSQL .= "    :LinkState,               :LinkStateChangeCode ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"LinkCommId",          "type"=>"BINT",     "value"=>$iCommId          ),
				array( "Name"=>"LinkTypeId",          "type"=>"INT",      "value"=>$iLinkTypeId      ),
				array( "Name"=>"LinkInfoId",          "type"=>"BINT",     "value"=>$iInfoId          ),
				array( "Name"=>"LinkConnectionId",    "type"=>"BINT",     "value"=>$iConnectionId    ),
				array( "Name"=>"LinkRoomId",          "type"=>"NUL",      "value"=>$iRoomId          ),
				array( "Name"=>"LinkSerialCode",      "type"=>"STR",      "value"=>$sSerialCode      ),
				array( "Name"=>"LinkName",            "type"=>"STR",      "value"=>$sName            ),
				array( "Name"=>"LinkConnected",       "type"=>"INT",      "value"=>1                 ),
				array( "Name"=>"LinkState",           "type"=>"INT",      "value"=>$iState           ),
				array( "Name"=>"LinkStateChangeCode", "type"=>"STR",      "value"=>"Initialise"      )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"AddLink: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD LINK CONNECTION                                                    --//
//----------------------------------------------------------------------------//
function dbAddNewLinkConnectionInfo( $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $iConnPort, $sConnName, $sConnUsername="", $sConnPassword="", $bSQLTransaction ) {
	
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used add the LINKCONN entry                    --//
	//--    that holds the info on how the gateway connects to.             --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function  --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert LinkConn        --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `LINKCONN` ";
			$sSQL .= "( ";
			$sSQL .= "    `LINKCONN_LINKPROTOCOL_FK`,      `LINKCONN_LINKFREQ_FK`, ";
			$sSQL .= "    `LINKCONN_LINKCRYPTTYPE_FK`,     `LINKCONN_ADDRESS`, ";
			$sSQL .= "    `LINKCONN_PORT`,                 `LINKCONN_NAME`, ";
			$sSQL .= "    `LINKCONN_USERNAME`,             `LINKCONN_PASSWORD` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :ProtocolId,      :FrequencyId, ";
			$sSQL .= "    :CryptTypeId,     :Address, ";
			$sSQL .= "    :Port,            :Name, ";
			$sSQL .= "    :Username,        :Password ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"ProtocolId",        "type"=>"INT",      "value"=>$iConnProtocolId       ),
				array( "Name"=>"FrequencyId",       "type"=>"INT",      "value"=>$iConnFrequencyId      ),
				array( "Name"=>"CryptTypeId",       "type"=>"INT",      "value"=>$iConnCryptTypeId      ),
				array( "Name"=>"Address",           "type"=>"STR",      "value"=>$sConnAddress          ),
				array( "Name"=>"Port",              "type"=>"INT",      "value"=>$iConnPort             ),
				array( "Name"=>"Name",              "type"=>"STR",      "value"=>$sConnName             ),
				array( "Name"=>"Username",          "type"=>"STR",      "value"=>$sConnUsername         ),
				array( "Name"=>"Password",          "type"=>"STR",      "value"=>$sConnPassword         )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"LinkConnAdd: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD LINK INFO                                                          --//
//----------------------------------------------------------------------------//
function dbAddNewLinkInfo( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl, $bSQLTransaction ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used add the LINK INFO entry                   --//
	//--    that holds the Misc data about the LINK                         --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert LinkInfo        --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `LINKINFO` ";
			$sSQL .= "( ";
			$sSQL .= "    `LINKINFO_MANUFACTURER`,    `LINKINFO_NAME`, ";
			$sSQL .= "    `LINKINFO_MANUFACTURERURL` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :LinkInfoManufacturer,      :LinkInfoName, ";
			$sSQL .= "    :LinkInfoManufacturerUrl ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"LinkInfoManufacturer",      "type"=>"STR",      "value"=>$sLinkInfoManufacturer      ),
				array( "Name"=>"LinkInfoName",              "type"=>"STR",      "value"=>$sLinkInfoName              ),
				array( "Name"=>"LinkInfoManufacturerUrl",   "type"=>"STR",      "value"=>$sLinkInfoManufacturerUrl   )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"LinkInfoAdd: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- UPDATE LINK CONNECTION                                                 --//
//----------------------------------------------------------------------------//
function dbUpdateLinkConnectionInfo( $iConnId, $iConnProtocolId, $iConnFrequencyId, $iConnCryptTypeId, $sConnAddress, $sConnName, $sUsername, $sPassword ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used update the LINKCONN entry                 --//
	//--    that holds the info on how the gateway connects to.             --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			$sSQL .= "UPDATE `".$sSchema."`.`LINKCONN` ";
			$sSQL .= "SET ";
			$sSQL .= "    `LINKCONN_IOPROTOCOL_FK`  = :ProtocolId, ";
			$sSQL .= "    `LINKCONN_IOFREQUENCY_FK` = :FrequencyId, ";
			$sSQL .= "    `LINKCONN_IOCRYPTTYPE_FK` = :CryptTypeId, ";
			$sSQL .= "    `LINKCONN_ADDRESS`        = :Address, ";
			$sSQL .= "    `LINKCONN_NAME`           = :Name, ";
			$sSQL .= "    `LINKCONN_USERNAME`       = :Username, ";
			$sSQL .= "    `LINKCONN_PASSWORD`       = :Password ";
			$sSQL .= "WHERE `LINKCONN_PK`           = :ConnId ";
			
			
			$aInputVals = array(
				array( "Name"=>"ProtocolId",        "type"=>"INT",      "value"=>$iConnProtocolId       ),
				array( "Name"=>"FrequencyId",       "type"=>"INT",      "value"=>$iConnFrequencyId      ),
				array( "Name"=>"CryptTypeId",       "type"=>"INT",      "value"=>$iConnCryptTypeId      ),
				array( "Name"=>"Address",           "type"=>"STR",      "value"=>$sConnAddress          ),
				array( "Name"=>"Name",              "type"=>"STR",      "value"=>$sConnName             ),
				array( "Name"=>"Username",          "type"=>"STR",      "value"=>$sUsername             ),
				array( "Name"=>"Password",          "type"=>"STR",      "value"=>$sPassword             ),
				array( "Name"=>"ConnId",            "type"=>"INT",      "value"=>$iConnId               )
			);
			
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery($sSQL, $aInputVals);
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>$aResult["Error"], "Data"=> array( "Result"=>"Updated succesfully") );
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"LinkConnUpdate: ".$sErrMesg );
	}
}


function dbCheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl ) {
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();          //-- ARRAY:     Used to store the Database function's result. --//
	$sSQL               = "";               //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;            //-- BOOLEAN:   Used to flag when an error has been caught. --//
	$sErrMesg           = "";               //-- STRING:    Used to store the error message when an error has been caught so that it can be passed along --//
	$aTemporaryView     = array();          //-- ARRAY:     A array to store information about which view to use like the viewname and columns. --//
	$sView              = "";               //-- STRING:    Used to store the name of the View to perform the SQL Query on --//
	$aInputVals         = array();          //-- ARRAY:     SQL bind input parameters --//
	$aOutputCols        = array();          //-- ARRAY:     An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//------------------------------------//
			//-- SQL                            --//
			//------------------------------------//
			$sSQL .= "SELECT ";
			$sSQL .= "    `LINKINFO_PK`, ";
			$sSQL .= "    `LINKINFO_NAME`, ";
			$sSQL .= "    `LINKINFO_MANUFACTURER`, ";
			$sSQL .= "    `LINKINFO_MANUFACTURERURL` ";
			$sSQL .= "FROM `LINKINFO` ";
			$sSQL .= "WHERE `LINKINFO_NAME` = :LinkInfoName ";
			$sSQL .= "AND `LINKINFO_MANUFACTURER` = :LinkInfoManufacturer ";
			$sSQL .= "AND `LINKINFO_MANUFACTURERURL` = :LinkInfoManufacturerUrl ";
			$sSQL .= "LIMIT 1 ";
			
			//-- Set the SQL Input Parameters --//
			$aInputVals = array(
				array( "Name"=>"LinkInfoName",                "type"=>"STR",      "value"=>$sLinkInfoName ),
				array( "Name"=>"LinkInfoManufacturer",        "type"=>"STR",      "value"=>$sLinkInfoManufacturer ),
				array( "Name"=>"LinkInfoManufacturerUrl",     "type"=>"STR",      "value"=>$sLinkInfoManufacturerUrl )
			);
			
			//-- Set the SQL Output Columns --//
			$aOutputCols = array(
				array( "Name"=>"LinkInfoId",                  "type"=>"INT" ),
				array( "Name"=>"LinkInfoName",                "type"=>"STR" ),
				array( "Name"=>"LinkInfoManufacturer",        "type"=>"STR" ),
				array( "Name"=>"LinkInfoManufacturerUrl",     "type"=>"STR" )
			);
			
			//-- Execute the SQL Query --//
			$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2["message"];
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			if($aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a error message --//
			
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	
	} else {
		return array( "Error"=>true,  "ErrMesg"=>"LookupLinkInfoId: ".$sErrMesg );
	}
}

//========================================================================================================================//
//== #9.0# - Thing Functions                                                                                            ==//
//========================================================================================================================//
function dbGetThingInfo( $iThingId ) {
	//----------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                           --//
	//--	This is used to get more information about a "Thing" than what the  --//
	//--	"StateAndPermission" function provides.                             --//
	//----------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Thing");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_SERIALCODE`, ";
				$sSQL .= "	`LINK_CONNECTED`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`THING_PK`, ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_HWID`, ";
				$sSQL .= "	`THING_OUTPUTHWID`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THING_STATECHANGEID`, ";
				$sSQL .= "	`THING_SERIALCODE`, ";
				$sSQL .= "	`THINGTYPE_PK`, ";
				$sSQL .= "	`THINGTYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `THING_PK` = :ThingId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"ThingId",        "type"=>"INT",    "value"=>$iThingId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT"),
					array( "Name"=>"PermWrite",                 "type"=>"INT"),
					array( "Name"=>"PermStateToggle",           "type"=>"INT"),
					array( "Name"=>"PermRead",                  "type"=>"INT"),
					array( "Name"=>"HubId",                     "type"=>"INT"),
					array( "Name"=>"HubName",                   "type"=>"STR"),
					array( "Name"=>"HubTypeId",                 "type"=>"INT"),
					array( "Name"=>"HubTypeName",               "type"=>"STR"),
					array( "Name"=>"LinkId",                    "type"=>"INT"),
					array( "Name"=>"LinkName",                  "type"=>"STR"),
					array( "Name"=>"LinkSerialCode",            "type"=>"STR"),
					array( "Name"=>"LinkConnected",             "type"=>"INT"),
					array( "Name"=>"LinkRoomId",                "type"=>"INT"),
					array( "Name"=>"LinkStatus",                "type"=>"INT"),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR"),
					array( "Name"=>"LinkTypeId",                "type"=>"INT"),
					array( "Name"=>"LinkTypeName",              "type"=>"STR"),
					array( "Name"=>"ThingId",                   "type"=>"INT"),
					array( "Name"=>"ThingName",                 "type"=>"STR"),
					array( "Name"=>"ThingHWId",                 "type"=>"INT"),
					array( "Name"=>"ThingOHWId",                "type"=>"INT"),
					array( "Name"=>"ThingStatus",               "type"=>"INT"),
					array( "Name"=>"ThingStatusCode",           "type"=>"STR"),
					array( "Name"=>"ThingSerialCode",           "type"=>"STR"),
					array( "Name"=>"ThingTypeId",               "type"=>"INT"),
					array( "Name"=>"ThingTypeName",             "type"=>"STR")
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
		
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function dbChangeThingName( $iThingId, $sName ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult			= array();	//-- ARRAY:		--//
	$sSQL				= "";		//-- STRING:	Used to store the SQL string so it can be passed to the database functions. --//
	$bError				= false;	//-- BOOL:		--//
	$sErrMesg			= "";		//-- STRING:	--//
	$sSchema			= "";		//-- STRING:	Used to store the name of the schema that needs updating. --//
	$aInputVals			= array();	//-- ARRAY:		--//
	
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "UPDATE `THING` ";
			$sSQL .= "SET `THING_NAME` = :ThingName ";
			$sSQL .= "WHERE `THING_PK` = :ThingId ";
			
			$aInputVals = array(
				array( "Name"=>"ThingName",				"type"=>"STR",		"value"=>$sName			),
				array( "Name"=>"ThingId",				"type"=>"BINT",		"value"=>$iThingId		)
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( 
			"Error"=>$aResult["Error"], 
			"Data"=>array( "Result"=>"Updated succesfully")
		);
	} else {
		return array( "Error"=>true, "ErrMesg"=>"ThingChangeName: ".$sErrMesg );
	}
}


function dbRetrieveThingState( $iThingId, $bRetrievePermissions ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();          //-- ARRAY:     --//
	$sSQL               = "";               //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;            //-- BOOLEAN:   --//
	$sErrMesg           = "";               //-- STRING:    --//
	$sView              = "";               //-- STRING:    --//
	$sTimeCol           = "";
	$aTemporaryView     = array();          //-- ARRAY:     A array to store information about which view to use like the viewname and columns. --//
	$aInputVals         = array();          //-- ARRAY:     SQL bind input parameters --//
	$aOutputCols        = array();          //-- ARRAY:     An array with information about what columns are expected to be returned from the database and any extra formatting that needs to be done. --//
	$sExtraCols         = "";               //-- STRING:    --//
	//----------------------------------------//
	//-- 2.0 - SQL Preperation              --//
	//----------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Thing");
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError		= true;
				$sErrMesg	= $aTemporaryView["ErrMesg"];
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				//--------------------------------------------------------//
				//-- If retrieve StateToggle permission is false        --//
				//--------------------------------------------------------//
				if( $bRetrievePermissions===false ) {
					$sExtraCols .=	" ";
					
					//-- Set the SQL Output Columns --//
					$aOutputCols = array(
						array( "Name"=>"ThingId",               "type"=>"INT" ),
						array( "Name"=>"ThingName",             "type"=>"STR" ),
						array( "Name"=>"ThingStatus",           "type"=>"INT" )
					);
				//--------------------------------------------------------//
				//-- ElseIf retrieve StateToggle Permission is false    --//
				//--------------------------------------------------------//
				} else {
					
					$sExtraCols .=	",    `PREMISE_PK`, ";
					$sExtraCols .=	"    `PERMISSIONS_WRITE`, ";
					$sExtraCols .=	"    `PERMISSIONS_STATETOGGLE`, ";
					$sExtraCols .=	"    `PERMISSIONS_READ` ";
					
					//-- Set the SQL Output Columns --//
					$aOutputCols = array(
						array( "Name"=>"ThingId",               "type"=>"INT" ),
						array( "Name"=>"ThingName",             "type"=>"STR" ),
						array( "Name"=>"ThingStatus",           "type"=>"INT" ),
						array( "Name"=>"PremiseId",             "type"=>"INT" ),
						array( "Name"=>"PermWrite",             "type"=>"INT" ),
						array( "Name"=>"PermStateToggle",       "type"=>"INT" ),
						array( "Name"=>"PermRead",              "type"=>"INT" )
					);
				}
				
				//------------------------------------//
				//-- SQL                            --//
				//------------------------------------//
				$sSQL .= "SELECT ";
				$sSQL .= "    `THING_PK`, ";
				$sSQL .= "    `THING_NAME`, ";
				$sSQL .= "    `THING_STATE` ";
				
				$sSQL .= $sExtraCols;
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `THING_PK` = :ThingId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- Set the SQL Input Parameters --//
				$aInputVals = array(
					array( "Name"=>"ThingId",       "type"=>"INT",      "value"=>$iThingId )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery($sSQL, $aInputVals, $aOutputCols, 1);
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2["message"];
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if($bError===false) {
		try {
			if($aResult["Error"]===true) {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Add a error message --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		return array( "Error"=>true, "ErrMesg"=>"RetrieveThingStatus: ".$sErrMesg );
	}
}



function dbGetThingsFromLinkId( $iLinkId ) {
	//--------------------------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                                           --//
	//--    This function is used to find all the IOs on a particular thing for other functions --//
	//--    eg. Looking up the 
	//--------------------------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL PREPARATION                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("Thing");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_SERIALCODE`, ";
				$sSQL .= "	`LINK_CONNECTED`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`THING_PK`, ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_HWID`, ";
				$sSQL .= "	`THING_OUTPUTHWID`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THING_STATECHANGEID`, ";
				$sSQL .= "	`THING_SERIALCODE`, ";
				$sSQL .= "	`THINGTYPE_PK`, ";
				$sSQL .= "	`THINGTYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `LINK_PK` = :LinkId ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"LinkId",        "type"=>"INT",    "value"=>$iLinkId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT" ),
					array( "Name"=>"PermWrite",                 "type"=>"INT" ),
					array( "Name"=>"PermStateToggle",           "type"=>"INT" ),
					array( "Name"=>"PermRead",                  "type"=>"INT" ),
					array( "Name"=>"HubId",                     "type"=>"INT" ),
					array( "Name"=>"HubName",                   "type"=>"STR" ),
					array( "Name"=>"HubTypeId",                 "type"=>"INT" ),
					array( "Name"=>"HubTypeName",               "type"=>"STR" ),
					array( "Name"=>"LinkId",                    "type"=>"INT" ),
					array( "Name"=>"LinkName",                  "type"=>"STR" ),
					array( "Name"=>"LinkSerialCode",            "type"=>"STR" ),
					array( "Name"=>"LinkConnected",             "type"=>"INT" ),
					array( "Name"=>"LinkRoomId",                "type"=>"INT" ),
					array( "Name"=>"LinkStatus",                "type"=>"INT" ),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR" ),
					array( "Name"=>"LinkTypeId",                "type"=>"INT" ),
					array( "Name"=>"LinkTypeName",              "type"=>"STR" ),
					array( "Name"=>"ThingId",                   "type"=>"INT" ),
					array( "Name"=>"ThingName",                 "type"=>"STR" ),
					array( "Name"=>"ThingHWId",                 "type"=>"INT" ),
					array( "Name"=>"ThingOHWId",                "type"=>"INT" ),
					array( "Name"=>"ThingStatus",               "type"=>"INT" ),
					array( "Name"=>"ThingStatusCode",           "type"=>"STR" ),
					array( "Name"=>"ThingSerialCode",           "type"=>"STR" ),
					array( "Name"=>"ThingTypeId",               "type"=>"INT" ),
					array( "Name"=>"ThingTypeName",             "type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function dbChangeThingState( $iThingId, $iNewState ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//	
	$aResult            = array();      //-- ARRAY:     Used to hold the results of the database function. --//
	$aReturn            = array();      //-- ARRAY:     This variable is used to return the result of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   --//
	$sErrMesg           = "";           //-- STRING:    --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     --//
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation              --//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the Schema name	--//
			$sSchema = getCurrentSchema();
			
			$sSQL .= "UPDATE `".$sSchema."`.`THING` ";
			$sSQL .= "SET `THING_STATE`= :ThingState ";
			$sSQL .= "WHERE `THING_PK` = :ThingId ";
			
			$aInputVals = array(
				array( "Name"=>"ThingState",        "type"=>"INT",      "value"=>$iNewState     ),
				array( "Name"=>"ThingId",           "type"=>"BINT",     "value"=>$iThingId      )
			);
			
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg  = $aResult["ErrMesg"];
			}
		} catch(Exception $e) {
			//-- TODO: Add an Error Message --//
		}
	}
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		$aReturn = array( "Error"=>$aResult["Error"], "Data"=>array( "Result"=>"Updated succesfully" ) );
		return $aReturn;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"ChangeThingStatus: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD THING                                                              --//
//----------------------------------------------------------------------------//
function dbAddNewThing( $iLinkId, $iThingTypeId, $iThingHWID, $iThingOutputID, $iThingState, $sThingName, $sThingSerialCode, $bSQLTransaction ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add a new THING to the database.       --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert THING           --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `THING` ";
			$sSQL .= "( ";
			$sSQL .= "    `THING_LINK_FK`,      `THING_THINGTYPE_FK`, ";
			$sSQL .= "    `THING_HWID`,         `THING_OUTPUTHWID`, ";
			$sSQL .= "    `THING_STATE`,        `THING_STATECHANGEID`, ";
			$sSQL .= "    `THING_NAME`,         `THING_SERIALCODE` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :LinkId,              :ThingTypeId, ";
			$sSQL .= "    :ThingHWID,           :ThingOutputID, ";
			$sSQL .= "    :ThingState,          :ThingStateChangeID, ";
			$sSQL .= "    :ThingName,           :ThingSerialCode ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"LinkId",                  "type"=>"BINT",     "value"=>$iLinkId                 ),
				array( "Name"=>"ThingTypeId",             "type"=>"INT",      "value"=>$iThingTypeId            ),
				array( "Name"=>"ThingHWID",               "type"=>"INT",      "value"=>$iThingHWID              ),
				array( "Name"=>"ThingOutputID",           "type"=>"INT",      "value"=>$iThingOutputID          ),
				array( "Name"=>"ThingState",              "type"=>"INT",      "value"=>$iThingState             ),
				array( "Name"=>"ThingStateChangeID",      "type"=>"STR",      "value"=>"Initialise"             ),
				array( "Name"=>"ThingName",               "type"=>"STR",      "value"=>$sThingName              ),
				array( "Name"=>"ThingSerialCode",         "type"=>"STR",      "value"=>$sThingSerialCode        )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"AddThing: ".$sErrMesg );
	}
}



//========================================================================================================================//
//== #11.0# - IO Functions                                                                                              ==//
//========================================================================================================================//
function dbIODetection() {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$sSQL           = "";               //-- STRING:        This is used to hold the SQL Query for it to be passed to the database function.     --//
	$aResult        = array();          //-- ARRAY:         Used to hold the result that the database library function returns.                  --//
	$aReturn        = array();          //-- ARRAY:         This array is used to be passed as the returned variable from calling this function. --//
	$bError         = false;            //-- BOOLEAN:       Used as a flag to indicate if an Error has occurred.                                 --//
	$sErrMesg       = "";               //-- STRING:        Used to store an error message when an error occurs.                                 --//
	$aInputVals     = array();          //-- ARRAY:         SQL Input binding array which is used bind the Input to prevent injection.           --//
	$aOutputCols    = array();          //-- ARRAY:         SQL Output binding array which converts to the results to the correct data type.     --//
	$aTemporaryView = array();          //-- ARRAY:         --//
	$sView          = "";               //-- STRING:        --//
	
	//----------------------------------------//
	//-- 2.0 - SQL Preperation              --//
	//----------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("IO");
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError		= true;
				$sErrMesg	= "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`USERS_USERNAME`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`PREMISE_PK`, ";
				$sSQL .= "	`PREMISE_NAME`, ";
				$sSQL .= "	`RSCAT_PK`, ";
				$sSQL .= "	`RSCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_PK`, ";
				$sSQL .= "	`RSSUBCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_TYPE`, ";
				$sSQL .= "	`RSTARIFF_PK`, ";
				$sSQL .= "	`RSTYPE_PK`, ";
				$sSQL .= "	`RSTYPE_NAME`, ";
				$sSQL .= "	`RSTYPE_MAIN`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`THING_PK`,  ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THINGTYPE_PK`,  ";
				$sSQL .= "	`THINGTYPE_NAME`, ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`IO_NAME`, ";
				$sSQL .= "	`IO_STATE`, ";
				$sSQL .= "	`IO_SAMPLERATECURRENT`, ";
				$sSQL .= "	`IO_SAMPLERATEMAX`, ";
				$sSQL .= "	`IO_SAMPLERATELIMIT`, ";
				$sSQL .= "	`IO_BASECONVERT`, ";
				$sSQL .= "	`UOM_PK`, ";
				$sSQL .= "	`UOM_NAME`, ";
				$sSQL .= "	`UOMSUBCAT_PK`, ";
				$sSQL .= "	`UOMSUBCAT_NAME`, ";
				$sSQL .= "	`UOMCAT_PK`, ";
				$sSQL .= "	`UOMCAT_NAME`, ";
				$sSQL .= "	`IOTYPE_PK`, ";
				$sSQL .= "	`IOTYPE_NAME`, ";
				$sSQL .= "	`IOTYPE_DATATYPE_FK`, ";
				$sSQL .= "	`IOTYPE_ENUM`, ";
				$sSQL .= "	`DATATYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `RSTYPE_PK` >= 1 ";             //-- Filters out IOs with broken 'Resource Types' --//
				$sSQL .= "AND `UOM_PK` >= 1 ";                  //-- Filters out IOs with broken 'Unit of Measurement' --//
				$sSQL .= "AND `IOTYPE_DATATYPE_FK` >= 1 ";      //-- Filters out IOs that do not have a 'Data Type' therefore cannot access any data for them --//
				$sSQL .= "AND `IO_BASECONVERT` <> 0 ";          //-- Filters out IOs that will attempt to divide by zero --//
				$sSQL .= "ORDER BY `USERS_PK` ASC, `PREMISE_PK` ASC, `LINK_PK` ASC, `THING_PK` ASC, `IO_PK` ASC ";
		
				$aOutputCols = array(
					array( "Name"=>"Username",                  "type"=>"STR" ),
					array( "Name"=>"PermissionWrite",           "type"=>"INT" ),
					array( "Name"=>"PermissionStateToggle",     "type"=>"INT" ),
					array( "Name"=>"PermissionRead",            "type"=>"INT" ),
					array( "Name"=>"PremiseId",                 "type"=>"INT" ),
					array( "Name"=>"PremiseName",               "type"=>"STR" ),
					array( "Name"=>"RSCatId",                   "type"=>"INT" ),
					array( "Name"=>"RSCatName",                 "type"=>"STR" ),
					array( "Name"=>"RSSubCatId",                "type"=>"INT" ),
					array( "Name"=>"RSSubCatName",              "type"=>"STR" ),
					array( "Name"=>"RSSubCatType",              "type"=>"INT" ),
					array( "Name"=>"RSTariffId",                "type"=>"INT" ),
					array( "Name"=>"RSTypeId",                  "type"=>"INT" ),
					array( "Name"=>"RSTypeName",                "type"=>"STR" ),
					array( "Name"=>"RSTypeMain",                "type"=>"INT" ),
					array( "Name"=>"UnitId",                    "type"=>"INT" ),
					array( "Name"=>"LinkId",                    "type"=>"INT" ),
					array( "Name"=>"LinkDisplayName",           "type"=>"STR" ),
					array( "Name"=>"LinkStatus",                "type"=>"INT" ),
					array( "Name"=>"RoomId",                    "type"=>"INT" ),
					array( "Name"=>"ThingId",                   "type"=>"INT" ),
					array( "Name"=>"ThingName",                 "type"=>"STR" ),
					array( "Name"=>"ThingStatus",               "type"=>"INT" ),
					array( "Name"=>"ThingTypeId",               "type"=>"INT" ),
					array( "Name"=>"ThingTypeName",             "type"=>"STR" ),
					array( "Name"=>"IOId",                      "type"=>"INT" ),
					array( "Name"=>"IOName",                    "type"=>"STR" ),
					array( "Name"=>"IOStatus",                  "type"=>"INT" ),
					array( "Name"=>"IOSamplerate",              "type"=>"INT" ),
					array( "Name"=>"IOSamplerateMax",           "type"=>"INT" ),
					array( "Name"=>"IOSamplerateLimit",         "type"=>"INT" ),
					array( "Name"=>"IOConvertRate",             "type"=>"INT" ),
					array( "Name"=>"UomId",                     "type"=>"INT" ),
					array( "Name"=>"UomName",                   "type"=>"STR" ),
					array( "Name"=>"UomSubCatId",               "type"=>"INT" ),
					array( "Name"=>"UomSubCatName",             "type"=>"STR" ),
					array( "Name"=>"UomCatId",                  "type"=>"INT" ),
					array( "Name"=>"UomCatName",                "type"=>"STR" ),
					array( "Name"=>"IOTypeId",                  "type"=>"INT" ),
					array( "Name"=>"IOTypeName",                "type"=>"STR" ),
					array( "Name"=>"DataType",                  "type"=>"INT" ),
					array( "Name"=>"DataTypeEnum",              "type"=>"INT" ),
					array( "Name"=>"DataTypeName",              "type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function dbGetIOInfo( $iIOId ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("IO");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`THING_PK`, ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THING_STATECHANGEID`, ";
				$sSQL .= "	`THINGTYPE_PK`, ";
				$sSQL .= "	`THINGTYPE_NAME`, ";
				$sSQL .= "	`RSCAT_PK`, ";
				$sSQL .= "	`RSCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_PK`, ";
				$sSQL .= "	`RSSUBCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_TYPE`, ";
				$sSQL .= "	`RSTARIFF_PK`, ";
				$sSQL .= "	`RSTARIFF_NAME`, ";
				$sSQL .= "	`RSTYPE_PK`, ";
				$sSQL .= "	`RSTYPE_NAME`, ";
				$sSQL .= "	`RSTYPE_MAIN`, ";
				$sSQL .= "	`UOMCAT_PK`, ";
				$sSQL .= "	`UOMCAT_NAME`, ";
				$sSQL .= "	`UOMSUBCAT_PK`, ";
				$sSQL .= "	`UOMSUBCAT_NAME`, ";
				$sSQL .= "	`UOM_PK`, ";
				$sSQL .= "	`UOM_NAME`, ";
				$sSQL .= "	`UOM_RATE`, ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`IO_NAME`, ";
				$sSQL .= "	`IO_BASECONVERT`, ";
				$sSQL .= "	`IO_SAMPLERATECURRENT`, ";
				$sSQL .= "	`IO_SAMPLERATELIMIT`, ";
				$sSQL .= "	`IO_SAMPLERATEMAX`, ";
				$sSQL .= "	`IO_STATE`, ";
				$sSQL .= "	`IO_STATECHANGEID`, ";
				$sSQL .= "	`IOTYPE_PK`, ";
				$sSQL .= "	`IOTYPE_NAME`, ";
				$sSQL .= "	`IOTYPE_ENUM`, ";
				$sSQL .= "	`DATATYPE_PK`, ";
				$sSQL .= "	`DATATYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `IO_PK` = :IOId ";
				$sSQL .= "LIMIT 1 ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"IOId",        "type"=>"INT",    "value"=>$iIOId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT"),
					array( "Name"=>"PermWrite",                 "type"=>"INT"),
					array( "Name"=>"PermStateToggle",           "type"=>"INT"),
					array( "Name"=>"PermRead",                  "type"=>"INT"),
					array( "Name"=>"HubId",                     "type"=>"INT"),
					array( "Name"=>"HubName",                   "type"=>"STR"),
					array( "Name"=>"HubTypeId",                 "type"=>"INT"),
					array( "Name"=>"HubTypeName",               "type"=>"STR"),
					array( "Name"=>"LinkId",                    "type"=>"INT"),
					array( "Name"=>"LinkName",                  "type"=>"STR"),
					array( "Name"=>"LinkRoomId",                "type"=>"INT"),
					array( "Name"=>"LinkStatus",                "type"=>"INT"),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR"),
					array( "Name"=>"LinkTypeId",                "type"=>"INT"),
					array( "Name"=>"LinkTypeName",              "type"=>"STR"),
					array( "Name"=>"ThingId",                   "type"=>"INT"),
					array( "Name"=>"ThingName",                 "type"=>"STR"),
					array( "Name"=>"ThingStatus",               "type"=>"INT"),
					array( "Name"=>"ThingStatusCode",           "type"=>"STR"),
					array( "Name"=>"ThingTypeId",               "type"=>"INT"),
					array( "Name"=>"ThingTypeName",             "type"=>"STR"),
					array( "Name"=>"RSCatId",                   "type"=>"INT"),
					array( "Name"=>"RSCatName",                 "type"=>"STR"),
					array( "Name"=>"RSSubCatId",                "type"=>"INT"),
					array( "Name"=>"RSSubCatName",              "type"=>"STR"),
					array( "Name"=>"RSSubCatType",              "type"=>"INT"),
					array( "Name"=>"RSTariffId",                "type"=>"INT"),
					array( "Name"=>"RSTariffName",              "type"=>"STR"),
					array( "Name"=>"RSTypeId",                  "type"=>"INT"),
					array( "Name"=>"RSTypeName",                "type"=>"STR"),
					array( "Name"=>"RSTypeMain",                "type"=>"INT"),
					array( "Name"=>"UoMCatId",                  "type"=>"INT"),
					array( "Name"=>"UoMCatName",                "type"=>"STR"),
					array( "Name"=>"UoMSubCatId",               "type"=>"INT"),
					array( "Name"=>"UoMSubCatName",             "type"=>"STR"),
					array( "Name"=>"UoMId",                     "type"=>"INT"),
					array( "Name"=>"UoMName",                   "type"=>"STR"),
					array( "Name"=>"UoMRate",                   "type"=>"STR"),
					array( "Name"=>"IOId",                      "type"=>"INT"),
					array( "Name"=>"IOName",                    "type"=>"STR"),
					array( "Name"=>"IOBaseConvert",             "type"=>"FLO"),
					array( "Name"=>"IOSampleRateCurrent",       "type"=>"INT"),
					array( "Name"=>"IOSampleRateLimit",         "type"=>"INT"),
					array( "Name"=>"IOSampleRateMax",           "type"=>"INT"),
					array( "Name"=>"IOStatus",                  "type"=>"INT"),
					array( "Name"=>"IOStatusCode",              "type"=>"STR"),
					array( "Name"=>"IOTypeId",                  "type"=>"INT"),
					array( "Name"=>"IOTypeName",                "type"=>"STR"),
					array( "Name"=>"DataEnumeration",           "type"=>"INT"),
					array( "Name"=>"DataTypeId",                "type"=>"INT"),
					array( "Name"=>"DataTypeName",              "type"=>"STR")
				);
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}



function dbGetIOsFromThingId( $iThingId ) {
	//--------------------------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                                           --//
	//--    This function is used to find all the IOs on a particular thing for other functions --//
	//--    eg. Looking up the 
	//--------------------------------------------------------------------------------------------//
	
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;                //-- BOOLEAN:   --//
	$sErrMesg           = "";                   //-- STRING:    --//
	$aResult            = array();
	$aReturn            = array();
	$sSQL               = "";
	$aInputVals         = array();
	$aTemporaryView     = array();
	$sView              = "";
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("IO");
			
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError     = true;
				$sErrMesg   = "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`PERMISSIONS_OWNER`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`HUB_NAME`, ";
				$sSQL .= "	`HUBTYPE_PK`, ";
				$sSQL .= "	`HUBTYPE_NAME`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_ROOMS_FK`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`LINK_STATECHANGECODE`, ";
				$sSQL .= "	`LINKTYPE_PK`, ";
				$sSQL .= "	`LINKTYPE_NAME`, ";
				$sSQL .= "	`THING_PK`, ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THING_STATECHANGEID`, ";
				$sSQL .= "	`THINGTYPE_PK`, ";
				$sSQL .= "	`THINGTYPE_NAME`, ";
				$sSQL .= "	`RSCAT_PK`, ";
				$sSQL .= "	`RSCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_PK`, ";
				$sSQL .= "	`RSSUBCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_TYPE`, ";
				$sSQL .= "	`RSTARIFF_PK`, ";
				$sSQL .= "	`RSTARIFF_NAME`, ";
				$sSQL .= "	`RSTYPE_PK`, ";
				$sSQL .= "	`RSTYPE_NAME`, ";
				$sSQL .= "	`RSTYPE_MAIN`, ";
				$sSQL .= "	`UOMCAT_PK`, ";
				$sSQL .= "	`UOMCAT_NAME`, ";
				$sSQL .= "	`UOMSUBCAT_PK`, ";
				$sSQL .= "	`UOMSUBCAT_NAME`, ";
				$sSQL .= "	`UOM_PK`, ";
				$sSQL .= "	`UOM_NAME`, ";
				$sSQL .= "	`UOM_RATE`, ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`IO_NAME`, ";
				$sSQL .= "	`IO_BASECONVERT`, ";
				$sSQL .= "	`IO_SAMPLERATECURRENT`, ";
				$sSQL .= "	`IO_SAMPLERATELIMIT`, ";
				$sSQL .= "	`IO_SAMPLERATEMAX`, ";
				$sSQL .= "	`IO_STATE`, ";
				$sSQL .= "	`IO_STATECHANGEID`, ";
				$sSQL .= "	`IOTYPE_PK`, ";
				$sSQL .= "	`IOTYPE_NAME`, ";
				$sSQL .= "	`IOTYPE_ENUM`, ";
				$sSQL .= "	`DATATYPE_PK`, ";
				$sSQL .= "	`DATATYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `THING_PK` = :ThingId ";
				
				//-- SQL Input Values --//
				$aInputVals = array(
					array( "Name"=>"ThingId",        "type"=>"INT",    "value"=>$iThingId )
				);
				
				$aOutputCols = array(
					array( "Name"=>"PermOwner",                 "type"=>"INT"),
					array( "Name"=>"PermWrite",                 "type"=>"INT"),
					array( "Name"=>"PermStateToggle",           "type"=>"INT"),
					array( "Name"=>"PermRead",                  "type"=>"INT"),
					array( "Name"=>"HubId",                     "type"=>"INT"),
					array( "Name"=>"HubName",                   "type"=>"STR"),
					array( "Name"=>"HubTypeId",                 "type"=>"INT"),
					array( "Name"=>"HubTypeName",               "type"=>"STR"),
					array( "Name"=>"LinkId",                    "type"=>"INT"),
					array( "Name"=>"LinkName",                  "type"=>"STR"),
					array( "Name"=>"LinkRoomId",                "type"=>"INT"),
					array( "Name"=>"LinkStatus",                "type"=>"INT"),
					array( "Name"=>"LinkStatusCode",            "type"=>"STR"),
					array( "Name"=>"LinkTypeId",                "type"=>"INT"),
					array( "Name"=>"LinkTypeName",              "type"=>"STR"),
					array( "Name"=>"ThingId",                   "type"=>"INT"),
					array( "Name"=>"ThingName",                 "type"=>"STR"),
					array( "Name"=>"ThingStatus",               "type"=>"INT"),
					array( "Name"=>"ThingStatusCode",           "type"=>"STR"),
					array( "Name"=>"ThingTypeId",               "type"=>"INT"),
					array( "Name"=>"ThingTypeName",             "type"=>"STR"),
					array( "Name"=>"RSCatId",                   "type"=>"INT"),
					array( "Name"=>"RSCatName",                 "type"=>"STR"),
					array( "Name"=>"RSSubCatId",                "type"=>"INT"),
					array( "Name"=>"RSSubCatName",              "type"=>"STR"),
					array( "Name"=>"RSSubCatType",              "type"=>"INT"),
					array( "Name"=>"RSTariffId",                "type"=>"INT"),
					array( "Name"=>"RSTariffName",              "type"=>"STR"),
					array( "Name"=>"RSTypeId",                  "type"=>"INT"),
					array( "Name"=>"RSTypeName",                "type"=>"STR"),
					array( "Name"=>"RSTypeMain",                "type"=>"INT"),
					array( "Name"=>"UoMCatId",                  "type"=>"INT"),
					array( "Name"=>"UoMCatName",                "type"=>"STR"),
					array( "Name"=>"UoMSubCatId",               "type"=>"INT"),
					array( "Name"=>"UoMSubCatName",             "type"=>"STR"),
					array( "Name"=>"UoMId",                     "type"=>"INT"),
					array( "Name"=>"UoMName",                   "type"=>"STR"),
					array( "Name"=>"UoMRate",                   "type"=>"STR"),
					array( "Name"=>"IOId",                      "type"=>"INT"),
					array( "Name"=>"IOName",                    "type"=>"STR"),
					array( "Name"=>"IOBaseConvert",             "type"=>"FLO"),
					array( "Name"=>"IOSampleRateCurrent",       "type"=>"INT"),
					array( "Name"=>"IOSampleRateLimit",         "type"=>"INT"),
					array( "Name"=>"IOSampleRateMax",           "type"=>"INT"),
					array( "Name"=>"IOStatus",                  "type"=>"INT"),
					array( "Name"=>"IOStatusCode",              "type"=>"STR"),
					array( "Name"=>"IOTypeId",                  "type"=>"INT"),
					array( "Name"=>"IOTypeName",                "type"=>"STR"),
					array( "Name"=>"DataEnumeration",           "type"=>"INT"),
					array( "Name"=>"DataTypeId",                "type"=>"INT"),
					array( "Name"=>"DataTypeName",              "type"=>"STR")
				);
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
	
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}


function dbDebugIODetection() {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$sSQL           = "";               //-- STRING:        This is used to hold the SQL Query for it to be passed to the  --//
	$aResult        = array();          //-- ARRAY:         
	$aReturn        = array();          //-- ARRAY:         This array is used to pass the Results.             --//
	$bError         = false;            //-- BOOLEAN:       Used to indicate if an Error has occurred.          --//
	$sErrMesg       = "";               //-- STRING:        Used to store an error message when an error occurs --//
	$aInputVals     = array();          //-- ARRAY:         --//
	$aTemporaryView = array();          //-- ARRAY:         --//
	$sView          = "";               //-- STRING:        --//
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL Preperation                                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = NonDataViewName("IO");
			if( $aTemporaryView["Error"]===true) {
				//-- VIEW ERROR --//
				$bError		= true;
				$sErrMesg	= "Unsupported View";
			} else {
				//-- store the view --//
				$sView = $aTemporaryView["View"];
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`USERS_USERNAME`, ";
				$sSQL .= "	`PERMISSIONS_WRITE`, ";
				$sSQL .= "	`PERMISSIONS_STATETOGGLE`, ";
				$sSQL .= "	`PERMISSIONS_READ`, ";
				$sSQL .= "	`PREMISE_PK`, ";
				$sSQL .= "	`RSCAT_PK`, ";
				$sSQL .= "	`RSCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_PK`, ";
				$sSQL .= "	`RSSUBCAT_NAME`, ";
				$sSQL .= "	`RSSUBCAT_TYPE`, ";
				$sSQL .= "	`RSTARIFF_PK`, ";
				$sSQL .= "	`RSTYPE_PK`, ";
				$sSQL .= "	`RSTYPE_NAME`, ";
				$sSQL .= "	`RSTYPE_MAIN`, ";
				$sSQL .= "	`HUB_PK`, ";
				$sSQL .= "	`LINK_PK`, ";
				$sSQL .= "	`LINK_NAME`, ";
				$sSQL .= "	`LINK_STATE`, ";
				$sSQL .= "	`THING_PK`,  ";
				$sSQL .= "	`THING_NAME`, ";
				$sSQL .= "	`THING_STATE`, ";
				$sSQL .= "	`THINGTYPE_PK`,  ";
				$sSQL .= "	`THINGTYPE_NAME`, ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`IO_NAME`, ";
				$sSQL .= "	`IO_STATE`, ";
				$sSQL .= "	`IO_SAMPLERATECURRENT`, ";
				$sSQL .= "	`IO_SAMPLERATEMAX`, ";
				$sSQL .= "	`IO_SAMPLERATELIMIT`, ";
				$sSQL .= "	`IO_BASECONVERT`, ";
				$sSQL .= "	`UOM_PK`, ";
				$sSQL .= "	`UOM_NAME`, ";
				$sSQL .= "	`IOTYPE_PK`, ";
				$sSQL .= "	`IOTYPE_NAME`, ";
				$sSQL .= "	`IOTYPE_DATATYPE_FK`, ";
				$sSQL .= "	`IOTYPE_ENUM`, ";
				$sSQL .= "	`DATATYPE_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
		//		sSQL += "WHERE `RSTYPE_PK` >= 1 ";                          //-- Filters out IOs with broken 'Resource Types' --//
		//		sSQL += "AND `UOM_PK` >= 1 ";                               //-- Filters out IOs with broken 'Unit of Measurement' --//
		//		sSQL += "AND `IOTYPE_DATATYPE_FK` >= 1 ";                   //-- Filters out IOs that do not have a 'Data Type' therefore cannot access any data for them --//
		//		sSQL += "AND `IO_BASECONVERT` <> 0 ";                       //-- Filters out IOs that will attempt to divide by zero --//
				$sSQL .= "ORDER BY `USERS_PK` ASC, `PREMISE_PK` ASC, `LINK_PK` ASC, `THING_PK` ASC, `IO_PK` ASC ";
				
				$aOutputCols = array(
					array( "Name"=>"Username",                  "type"=>"STR" ),
					array( "Name"=>"PermissionWrite",           "type"=>"INT" ),
					array( "Name"=>"PermissionStateToggle",     "type"=>"INT" ),
					array( "Name"=>"PermissionRead",            "type"=>"INT" ),
					array( "Name"=>"PremiseId",                 "type"=>"INT" ),
					array( "Name"=>"RSCatId",                   "type"=>"INT" ),
					array( "Name"=>"RSCatName",                 "type"=>"STR" ),
					array( "Name"=>"RSSubCatId",                "type"=>"INT" ),
					array( "Name"=>"RSSubCatName",              "type"=>"STR" ),
					array( "Name"=>"RSSubCatType",              "type"=>"INT" ),
					array( "Name"=>"RSTariffId",                "type"=>"INT" ),
					array( "Name"=>"RSTypeId",                  "type"=>"INT" ),
					array( "Name"=>"RSTypeName",                "type"=>"STR" ),
					array( "Name"=>"RSTypeMain",                "type"=>"INT" ),
					array( "Name"=>"UnitId",                    "type"=>"INT" ),
					array( "Name"=>"LinkId",                    "type"=>"INT" ),
					array( "Name"=>"LinkDisplayName",           "type"=>"STR" ),
					array( "Name"=>"LinkStatus",                "type"=>"INT" ),
					array( "Name"=>"ThingId",                   "type"=>"INT" ),
					array( "Name"=>"ThingName",                 "type"=>"STR" ),
					array( "Name"=>"ThingStatus",               "type"=>"INT" ),
					array( "Name"=>"ThingTypeId",               "type"=>"INT" ),
					array( "Name"=>"ThingTypeName",             "type"=>"STR" ),
					array( "Name"=>"IOId",                      "type"=>"INT" ),
					array( "Name"=>"IOName",                    "type"=>"STR" ),
					array( "Name"=>"IOStatus",                  "type"=>"INT" ),
					array( "Name"=>"IOSamplerate",              "type"=>"INT" ),
					array( "Name"=>"IOSamplerateMax",           "type"=>"INT" ),
					array( "Name"=>"IOSamplerateLimit",         "type"=>"INT" ),
					array( "Name"=>"IOConvertRate",             "type"=>"INT" ),
					array( "Name"=>"UomId",                     "type"=>"INT" ),
					array( "Name"=>"UomName",                   "type"=>"STR" ),
					array( "Name"=>"IOTypeId",                  "type"=>"INT" ),
					array( "Name"=>"IOTypeName",                "type"=>"STR" ),
					array( "Name"=>"DataType",                  "type"=>"INT" ),
					array( "Name"=>"DataTypeEnum",              "type"=>"INT" ),
					array( "Name"=>"DataTypeName",              "type"=>"STR" )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
				
				try {
					if( $aResult["Error"] === true) {
						$bError = true;
						$sErrMesg = $aResult["ErrMesg"];
					}
				} catch( Exception $e) {
					//-- TODO: Write error message for when Database Library returns an unexpected result --//
				}
			}
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	//--------------------------------------------------------------------//
	//-- 9.0 - Return the Result of the function                        --//
	//--------------------------------------------------------------------//
	if( $bError===false) {
		//-- Return the Results --//
		$aReturn = array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		//-- Return an Error Message --//
		$aReturn =  array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
	return $aReturn;
}



function dbGetIODebuggingInfo( $sDataType, $iIO ) {
	//--------------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                        --//
	//--------------------------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   
	$sErrMesg           = "";           //-- STRING:    
	$aResult            = array();      //-- ARRAY:     This variable is for the SQL result. --//
	$aReturn            = array();      //-- ARRAY:     This is what is returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    --//
	
	$aTemporaryView     = array();      //-- ARRAY:     --//
	$sView              = "";           //-- STRING:    --//
	$sUTSCol            = "";           //-- STRING:    --//
	$aInputVals         = array();      //-- ARRAY:     --//
	$aOutputCols        = array();      //-- ARRAY:     --//
	
	//--------------------------------------------------------------------//
	//-- 2.0 - SQL                                                      --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = DataViewName( "Attribute", $sDataType );
			
			if ( $aTemporaryView["Error"]===true ) {
				//-- if an error has occurred --//
				$bError = true; 
				$sErrMesg = "Debug: Unsupported datatype! \n datatype=".$sDataType;
			} else {
				//-- store the view --//
				$sView		= $aTemporaryView["View"];
				$sUTSCol	= $aTemporaryView["UTS"];
				//sValCol  = aTemporaryView.Value; 
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`".$sUTSCol."`, ";
				$sSQL .= "	`".$sUTSCol."` AS \"UnixTS\" ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `IO_PK` = :IOId  ";
				$sSQL .= "ORDER BY `".$sUTSCol."` DESC ";
				$sSQL .= "LIMIT 1 ";
				
				//-- Input Binding --//	
				$aInputVals = array(
					array( "Name"=>"IOId",      "type"=>"INT",      "value"=>$iIO   )
				);
				
				//-- Output Binding --//
				$aOutputCols = array(
					array( "Name"=>"IOId",              "type"=>"INT"   ),
					array( "Name"=>"TS",                "type"=>"TSC"   ),
					array( "Name"=>"UnixTS",            "type"=>"INT"   )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				//echo json_encode($oRestrictedDB->QueryLogs)."\n\n<br /><br />\n";
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2getMessage();
		}
	}
	
	//--------------------------------------------------------------------//
	//-- 4.0 - Error Check                                              --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) { 
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			}
		} catch( Exception $e) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	
	//--------------------------------------------------------------------//
	//-- 5.0 - Return Results or Error Message                          --//
	//--------------------------------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		return array( "Error"=>true, "ErrMesg"=>"DebugIOSensor: ".$sErrMesg );
	}
}


//----------------------------------------------------------------------------//
//-- ADD IO                                                                 --//
//----------------------------------------------------------------------------//
function dbAddNewIO( $iThingId, $iRSTypesId, $iUoMId, $iIOTypeId, $iIOState, $fSampleCurrent, $fSampleMax, $fSampleLimit, $fBaseConvert, $sName, $bSQLTransaction ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add a new IO to the database.          --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$sSchema            = "";           //-- STRING:    Used to store the name of the schema that needs updating.    --//
	$aInputVals         = array();      //-- ARRAY:     Used to store the SQL Input values so they can be bound to the query to help prevent injection. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//-- Retrieve the Schema name --//
			$sSchema = getCurrentSchema();
			
			//----------------------------------------//
			//-- SQL Query - Insert IO              --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `IO` ";
			$sSQL .= "( ";
			$sSQL .= "    `IO_THING_FK`,           `IO_RSTYPES_FK`, ";
			$sSQL .= "    `IO_UOM_FK`,             `IO_IOTYPE_FK`, ";
			$sSQL .= "    `IO_STATE`,              `IO_STATECHANGEID`, ";
			$sSQL .= "    `IO_SAMPLERATECURRENT`,  `IO_SAMPLERATEMAX`, ";
			$sSQL .= "    `IO_SAMPLERATELIMIT`,    `IO_BASECONVERT`, ";
			$sSQL .= "    `IO_NAME` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :ThingId,             :RSTypesId, ";
			$sSQL .= "    :UoMId,               :IOTypeId, ";
			$sSQL .= "    :IOState,             :IOStateChangeID, ";
			$sSQL .= "    :IOSampleCur,         :IOSampleMax, ";
			$sSQL .= "    :IOSampleLim,         :IOBaseConvert, ";
			$sSQL .= "    :IOName ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"ThingId",                   "type"=>"BINT",     "value"=>$iThingId         ),
				array( "Name"=>"RSTypesId",                 "type"=>"INT",      "value"=>$iRSTypesId       ),
				array( "Name"=>"UoMId",                     "type"=>"INT",      "value"=>$iUoMId           ),
				array( "Name"=>"IOTypeId",                  "type"=>"INT",      "value"=>$iIOTypeId        ),
				array( "Name"=>"IOState",                   "type"=>"INT",      "value"=>$iIOState         ),
				array( "Name"=>"IOStateChangeID",           "type"=>"STR",      "value"=>"Initialise"      ),
				array( "Name"=>"IOSampleCur",               "type"=>"FLO",      "value"=>$fSampleCurrent   ),
				array( "Name"=>"IOSampleMax",               "type"=>"FLO",      "value"=>$fSampleMax       ),
				array( "Name"=>"IOSampleLim",               "type"=>"FLO",      "value"=>$fSampleLimit     ),
				array( "Name"=>"IOBaseConvert",             "type"=>"FLO",      "value"=>$fBaseConvert     ),
				array( "Name"=>"IOName",                    "type"=>"STR",      "value"=>$sName            )
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bSQLTransaction===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindInsertQuery( $sSQL, $aInputValsInsert );
			}
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"IOSensorAdd: ".$sErrMesg );
	}
}



//========================================================================================================================//
//== #11.0# - IO DATA Functions                                                                                         ==//
//========================================================================================================================//
function dbGetIODataAggregation( $sAggregationType, $sDataType, $iIOId, $iStartUTS, $iEndUTS ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$aResult            = array();      //-- ARRAY:     This variable is for the SQL result --//
	$aReturn            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function.  --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions.  --//

	$aTemporaryView     = array();      //-- ARRAY:     This variable is used to hold the response from the function that looks up the SQL View name --//
	$sView              = "";           //-- STRING:    Used to hold the extracted string that contains the SQL View name  --//
	$sCalcedValueType   = "";           //-- STRING:    --//
	$aInputVals         = array();      //-- ARRAY:     Used to hold an array of values to do the SQL Input Binding --//
	$aOutputCols        = array();      //-- ARRAY:     Used to hold an array of values to do the formatting of the SQL Output data --//
	
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = DataViewName( "Attribute", $sDataType );
			
			if ( $aTemporaryView["Error"]===true ) {
				//-- If an error has occurred --//
				$bError = true; 
				$sErrMesg = "Debug: Unsupported datatype! \n datatype=".$sDataType;
			} else {
				//-- store the view --//
				$sView              = $aTemporaryView["View"];
				$sCalcedValueType   = $aTemporaryView["CalcedValueType"];
				//sValCol  = aTemporaryView.Value; 
				
				$sSQL .= "SELECT ";
				switch( $sAggregationType ) {
					case "Min":
						$sSQL .= "	MIN(`CALCEDVALUE`), ";
						break;
					case "Max":
						$sSQL .= "	MAX(`CALCEDVALUE`), ";
						break;
					case "Sum":
						$sSQL .= "	SUM(`CALCEDVALUE`), ";
						break;
					default:
						$sSQL .= "	COUNT(`CALCEDVALUE`), ";
						break;
				}
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`UOM_NAME` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `IO_PK` = :IOId ";
				$sSQL .= "AND `UTS` > :StartUTS ";
				$sSQL .= "AND `UTS` <= :EndUTS ";
				$sSQL .= "GROUP BY `IO_PK`, `UOM_NAME` ";
				
				//-- Input Binding --//
				$aInputVals = array(
					array( "Name"=>"IOId",              "type"=>"INT",     "value"=>$iIOId        ),
					array( "Name"=>"StartUTS",          "type"=>"INT",     "value"=>$iStartUTS    ),
					array( "Name"=>"EndUTS",            "type"=>"INT",     "value"=>$iEndUTS      )
				);
				
				//-- Output Binding --//
				$aOutputCols = array(
					array( "Name"=>"Value",             "type"=>$sCalcedValueType  ),
					array( "Name"=>"IOId",              "type"=>"INT"              ),
					array( "Name"=>"UOM_NAME",          "type"=>"STR"              )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
				//echo json_encode($oRestrictedDB->QueryLogs)."\n\n<br /><br />\n";
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				if( $aResult["ErrMesg"]==="No Rows Found! Code:1") {
					//-- Return no results --//
					$aResult = array(
						"Error"	=> false,
						"Data"	=> array(
							"Value"		=> 0,
							"IOId"		=> $iIOId
						)
					);
				} else {
					$bError = true;
					$sErrMesg = $aResult["ErrMesg"];
				}
			}
		} catch( Exception $e) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>"IODataAggregation: ".$sErrMesg );
	}
}


function dbGetIODataMostRecent( $sDataType, $iIOId, $iEndUTS ) {
	//----------------------------------------//
	//-- 1.0 - Declare Variables            --//
	//----------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught --//
	$aResult            = array();      //-- ARRAY:     This variable is for the SQL result --//
	$aReturn            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function.  --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions.  --//

	$aTemporaryView     = array();      //-- ARRAY:     This variable is used to hold the response from the function that looks up the SQL View name --//
	$sView              = "";           //-- STRING:    Used to hold the extracted string that contains the SQL View name  --//
	$sCalcedValueType   = "";           //-- STRING:    --//
	$aInputVals         = array();      //-- ARRAY:     Used to hold an array of values to do the SQL Input Binding --//
	$aOutputCols        = array();      //-- ARRAY:     Used to hold an array of values to do the formatting of the SQL Output data --//
	
	if( $bError===false ) {
		try {
			//-- Retrieve the View in an array --//
			$aTemporaryView = DataViewName( "Attribute", $sDataType );
			
			if ( $aTemporaryView["Error"]===true ) {
				//-- If an error has occurred --//
				$bError = true; 
				$sErrMesg = "Debug: Unsupported datatype! \n datatype=".$sDataType;
			} else {
				//-- store the view --//
				$sView              = $aTemporaryView["View"];
				$sCalcedValueType   = $aTemporaryView['CalcedValueType'];
				//sValCol  = aTemporaryView.Value; 
				
				$sSQL .= "SELECT ";
				$sSQL .= "	`CALCEDVALUE`, ";
				$sSQL .= "	`IO_PK`, ";
				$sSQL .= "	`UTS`, ";
				$sSQL .= "	`UOM_NAME`, ";
				$sSQL .= "	`UOM_PK` ";
				$sSQL .= "FROM `".$sView."` ";
				$sSQL .= "WHERE `IO_PK` = :IOId ";
				$sSQL .= "AND `UTS` <= :EndUTS ";
				$sSQL .= "ORDER BY `UTS` DESC ";
				$sSQL .= "LIMIT 1 ";
				
				//-- Input Binding --//
				$aInputVals = array(
					array( "Name"=>"IOId",              "type"=>"INT",     "value"=>$iIOId        ),
					array( "Name"=>"EndUTS",            "type"=>"INT",     "value"=>$iEndUTS      )
				);
				
				//-- Output Binding --//
				$aOutputCols = array(
					array( "Name"=>"Value",             "type"=>$sCalcedValueType ),
					array( "Name"=>"IOId",              "type"=>"INT"   ),
					array( "Name"=>"UTS",               "type"=>"BINT"  ),
					array( "Name"=>"UomName",           "type"=>"STR"   ),
					array( "Name"=>"UomId",             "type"=>"INT"   )
				);
				
				//-- Execute the SQL Query --//
				$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 1 );
				
			}
		} catch( Exception $e2 ) {
			$bError   = true;
			$sErrMesg = $e2getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				if( $aResult["ErrMesg"]==="No Rows Found! Code:1") {
					//-- Return no results --//
					if( $sCalcedValueType==="STR" ) {
						$aResult = array(
							"Error"	=> false,
							"Data"	=> array(
								"Value"     => "",
								"IOId"      => $iIOId,
								"UTS"       => 0
							)
						);
					} else {
						$aResult = array(
							"Error"    => false,
							"Data"     => array(
								"Value"     => 0,
								"IOId"      => $iIOId,
								"UTS"       => 0
							)
						);
						
					}

				} else {
					$bError = true;
					$sErrMesg = $aResult["ErrMesg"];
				}
			}
		} catch( Exception $e) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 - Return Results or Error Message  --//
	//--------------------------------------------//
	if( $bError===false ) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );
	} else {
		return array( "Error"=>true, "ErrMesg"=>"IODataMostRecent: ".$sErrMesg );
	}
}


function dbInsertNewIODataValue( $sTableName, $iIOId, $iUTS, $Value, $sBindType, $bNonCommited=false ) {
	//----------------------------------------------------//
	//-- DESCRIPTION: This function is used to insert   --//
	//--    new rows into the DATA tables for various   --//
	//--    APIs.                                       --//
	//----------------------------------------------------//
	
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$bValidNumeric          = false;            //-- BOOLEAN:	Used for checking if a number is valid or not --//
	$bError                 = false;            //-- BOOL:		--//
	$sErrMesg               = "";               //-- STRING:	--//
	$aReturn                = array();          //-- ARRAY:		--//
	$sQueryInsert           = "";               //-- STRING:	Used to store the SQL string so it can be passed to the database functions	--//
	$aResultInsert          = array();          //-- ARRAY:		--//
	$aInputVals             = array();          //-- ARRAY:		SQL bind input parameters --//
	
	
	//----------------------------------------------------//
	//-- 3.0 - Insert the new UserInfo                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			
			//----------------------------------------//
			//-- SQL Query - Insert PremiseLog      --//
			//----------------------------------------//
			$sQueryInsert .= "INSERT INTO `".$sTableName."` ";
			$sQueryInsert .= "( ";
			$sQueryInsert .= "    `".$sTableName."_IO_FK`, `".$sTableName."_DATE`,  ";
			$sQueryInsert .= "    `".$sTableName."_VALUE` ";
			$sQueryInsert .= ") ";
			$sQueryInsert .= "VALUES( ";
			$sQueryInsert .= "    :IOId,  :UTS, ";
			$sQueryInsert .= "    :Value ";
			$sQueryInsert .= ") ";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"IOId",						"type"=>"BINT",				"value"=>$iIOId			),
				array( "Name"=>"UTS",						"type"=>"BINT",				"value"=>$iUTS			),
				array( "Name"=>"Value",						"type"=>$sBindType,			"value"=>$Value			)
			);
			
			//-- Run the SQL Query and save the results --//
			if( $bNonCommited===true ) {
				$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sQueryInsert, $aInputValsInsert );
			} else {
				$aResultInsert = $oRestrictedDB->InputBindUpdateQuery( $sQueryInsert, $aInputValsInsert );
			}
			
			//----------------------------//
			//-- Error Checking         --//
			//----------------------------//
			if( $aResultInsert["Error"]===true ) {
				//-- Error Occurred when Inserting  --//
				$bError     = true;
				$sErrMesg  .= "Error inserting the new \"Data Value\"!\n";
				$sErrMesg  .= $aResultInsert["ErrMesg"]." \n";
			}
		
		} catch( Exception $e30 ) {
			//-- Debugging: Catch any unexpected errors --//
			$bError = true;
			$sErrMesg  = "Unexpected Error! \n";
			$sErrMesg .= "Error occurred when inserting the new \"Data Value\". \n";
			$sErrMesg .= $e30->getMessage()." \n";
		}
	}
	
	//----------------------------------------------------//
	//-- 9.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if($bError===false) {
		return $aResultInsert;
	} else {
		//echo "-----------<br />\n";
		//var_dump( $oRestrictedDB->QueryLogs );
		//echo "-----------<br />\n";
		
		return array( "Error"=>true, "ErrMesg"=>"Insert DataValue: ".$sErrMesg );
	}
}



//========================================================================================================================//
//== #13.0# - RSCat & UoM Functions                                                                                     ==//
//========================================================================================================================//





?>