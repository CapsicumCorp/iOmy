<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used to deploy the schema, setup the first User and then write the Config 
//==     file for the other APIs to use
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





//====================================================================================//
//== (00) Database Check                                                            ==//
//====================================================================================//
//-- 00_CheckStatus             ( Indicates if the webserver has been deployed ) --//

//====================================================================================//
//== (02) Local Setup                                                               ==//
//====================================================================================//
//== NOTE: That once a PHP Config is written then these APIs will cease to function ==//
//====================================================================================//
//-- 02_DBConnectTest           ( Checks that the provided credentials('Port', 'Username', 'Password') actually work --//
//-- 02_NewSchema               ( Creates a new schema if the user has permission to do so ) --//
//-- 02_CreateTables            ( Adds the tables and views into the selected Schema )
//-- 02_CreateForeignKeys       ( Adds the foreign key restraints on each table )
//-- 02_CreateDefaultData       ( Adds the static default data into the tables )
//-- 02_CreatePHPConfig         ( Writes to the PHP Config for the webserver )

//====================================================================================//
//== (03) All Setup                                                                 ==//
//====================================================================================//
//-- 03_CreatePremise           ( Adds the new premise )




//====================================================================//
//== #1.0# - INITIALISE                                             ==//
//====================================================================//

//------------------------------------------------------------//
//-- #1.1# - DECLARE CONSTANTS                              --//
//------------------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'');
}


//------------------------------------------------------------//
//-- #1.2# - DECLARE NORMAL VARIABLES                       --//
//------------------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used. --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        This is the output that this PHP API returns. --//

$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
$aRequiredParmaters         = array();      //-- ARRAY:         Used to store the expected HTTP POST Parameters.                                                --//
$sPostMode                  = "";           //-- STRING:        Holds the desired Mode that this API should function.                                           --//

$bConfigSet                 = false;
$bConfigEnableAddHubMode    = false;

$bNeedsDatabaseAccess       = false;        //-- BOOLEAN:       --//
$bDatabaseConnection        = false;        //-- BOOLEAN:       Used to indicate if a database connection is available. --//
$bTransactionStarted        = false;        //-- BOOLEAN:       Used to indicate if a SQL Transaction has started so that it knows if it has to commit or rollback. --//
$sPostDatabaseName          = "";           //-- STRING:        Used to the hold the Database name that the user provides. --//
$sNewPassword               = "";           //-- STRING:        Used to hold the new password --//

$aTempResult1               = array();      //-- ARRAY:         --//
$aTempResult2               = array();      //-- ARRAY:         --//
$aTempResult3A              = array();      //-- ARRAY:         --//
$aTempResult3B              = array();      //-- ARRAY:         --//
$aTempResult3C              = array();      //-- ARRAY:         --//
$aTempResult4A              = array();      //-- ARRAY:         --//
$aTempResult4B              = array();      //-- ARRAY:         --//
$aTempResult4C              = array();      //-- ARRAY:         --//
$aTempResult4D              = array();      //-- ARRAY:         --//


$iRoomId                    = 0;
$sHubAddress                = "";

//------------------------------------------------------------//
//-- #1.3# - IMPORT REQUIRED LIBRARIES                      --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/constants.php';
require_once SITE_BASE.'/restricted/libraries/dbmysql.php';
require_once SITE_BASE.'/restricted/libraries/http_post.php';
require_once SITE_BASE.'/restricted/libraries/special/iomyserverlib.php';
require_once SITE_BASE.'/restricted/libraries/userauth.php';


//------------------------------------------------------------//
//-- #1.4# - Perform the Check to see if the config exists  --//
//------------------------------------------------------------//
if( isset($Config) ) {
	$bConfigSet = true;
	
	if( isset($Config['Core']) ) {
		if( isset($Config['Core']['EnableAddHubMode']) ) {
			$bConfigEnableAddHubMode = $Config['Core']['EnableAddHubMode'];
		} else {
			$bConfigEnableAddHubMode = false;
		}
	} else {
		$bConfigEnableAddHubMode = false;
	}
	
} else {
	$bConfigSet = false;
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
		array( "Name"=>'Access',        "DataType"=>'STR' ),
		array( "Name"=>'Data',          "DataType"=>'STR' ),
		array( "Name"=>'DBName',        "DataType"=>'STR' )
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
		$sPostMode = $aHTTPData["Mode"];        //-- NOTE: What modes are valid change based upon the if the config works or not --//
		
		//----------------------------------------------------------------------------//
		//-- IF the PHP Configuration is written then only have a couple of modes   --//
		//----------------------------------------------------------------------------//
		if( $bConfigSet===true ) {
			if( $bConfigEnableAddHubMode===true ) {
				if( $sPostMode!=="00_CheckStatus" && $sPostMode!=="03_AddHub" ) {
					//-- ERROR --//
					$bError = true;
					$iErrCode  = 101;
					$sErrMesg .= "Error Code:'0101' \n";
					$sErrMesg .= "Invalid \"Mode\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
					$sErrMesg .= "eg. \n \"00_CheckStatus\" \n\n";
				}
			} else {
				if( $sPostMode!=="00_CheckStatus" ) {
					//-- ERROR --//
					$bError = true;
					$iErrCode  = 101;
					$sErrMesg .= "Error Code:'0101' \n";
					$sErrMesg .= "Invalid \"Mode\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
					$sErrMesg .= "eg. \n \"00_CheckStatus\" \n\n";
				}
			}
			
		//----------------------------------------------------------------------------//
		//-- ELSE the PHP Configuration isn't written so have the full set of modes --//
		//----------------------------------------------------------------------------//
		} else {
			if(
				$sPostMode!=="00_CheckStatus"            && $sPostMode!=="01_DBPasswordInit"         && 
				$sPostMode!=="02_DBConnectTest"          && $sPostMode!=="02_NewSchema"              && 
				$sPostMode!=="02_CreateTables1"          && $sPostMode!=="02_CreateTables2"          && 
				$sPostMode!=="02_CreateTables3"          && $sPostMode!=="02_CreateTables4"          && 
				$sPostMode!=="02_CreateTables5"          && $sPostMode!=="02_CreateTables6"          && 
				$sPostMode!=="02_CreateForeignKeys1"     && $sPostMode!=="02_CreateForeignKeys2"     && 
				$sPostMode!=="02_CreateForeignKeys3"     && $sPostMode!=="02_CreateForeignKeys4"     && 
				$sPostMode!=="02_CreateForeignKeys5"     && $sPostMode!=="02_CreateForeignKeys6"     && 
				$sPostMode!=="02_CreateForeignKeys7"     && $sPostMode!=="02_CreateForeignKeys8"     && 
				$sPostMode!=="02_CreateForeignKeys9"     && $sPostMode!=="02_CreateForeignKeys10"    && 
				$sPostMode!=="02_CreateForeignKeys11"    && $sPostMode!=="02_CreateForeignKeys12"    && 
				$sPostMode!=="02_CreateForeignKeys13"    && $sPostMode!=="02_CreateForeignKeys14"    && 
				$sPostMode!=="02_CreateForeignKeys15"    && $sPostMode!=="02_CreateForeignKeys16"    && 
				$sPostMode!=="02_CreateForeignKeys17"    && $sPostMode!=="02_CreateForeignKeys18"    && 
				$sPostMode!=="02_CreateForeignKeys19"    && $sPostMode!=="02_CreateForeignKeys20"    && 
				$sPostMode!=="02_CreateViewsPublic1"     && $sPostMode!=="02_CreateViewsPublic2"     && 
				$sPostMode!=="02_CreateViewsPublic3"     && $sPostMode!=="02_CreateViewsPublic4"     && 
				$sPostMode!=="02_CreateViewsPublic5"     && $sPostMode!=="02_CreateViewsPublic6"     && 
				$sPostMode!=="02_CreateViewsRestricted1" && $sPostMode!=="02_CreateViewsRestricted2" && 
				$sPostMode!=="02_CreateViewsRestricted3" && $sPostMode!=="02_CreateViewsRestricted4" && 
				$sPostMode!=="02_CreateViewsRestricted5" && $sPostMode!=="02_CreateViewsRestricted6" && 
				$sPostMode!=="02_CreateDefaultData1"     && $sPostMode!=="02_CreateDefaultData2"     && 
				$sPostMode!=="02_CreateDefaultData3"     && $sPostMode!=="02_CreateDefaultData4"     && 
				$sPostMode!=="02_CreatePHPConfig"
			) {
				//-- ERROR  --//
				$bError = true;
				$iErrCode  = 101;
				$sErrMesg .= "Error Code:'0101' \n";
				$sErrMesg .= "Invalid \"Mode\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
				$sErrMesg .= "eg. \n \"00_CheckStatus\" \n\n";
			}
		}
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"00_CheckStatus\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//================================================================//
	//== 2.2.2 - CHECK IF MODE NEEDS DATABASE ACCESS                ==//
	//================================================================//
	if( $bError===false ) {
		try {
			//----------------------------------------------------//
			//-- Perform the check                              --//
			//----------------------------------------------------//
			if( $bConfigSet===false ) {
				if(
					$sPostMode==="01_DBPasswordInit"         || 
					$sPostMode==="02_DBConnectTest"          || $sPostMode==="02_NewSchema"              || 
					$sPostMode==="02_CreateTables1"          || $sPostMode==="02_CreateTables2"          || 
					$sPostMode==="02_CreateTables3"          || $sPostMode==="02_CreateTables4"          || 
					$sPostMode==="02_CreateTables5"          || $sPostMode==="02_CreateTables6"          || 
					$sPostMode==="02_CreateForeignKeys1"     || $sPostMode==="02_CreateForeignKeys2"     || 
					$sPostMode==="02_CreateForeignKeys3"     || $sPostMode==="02_CreateForeignKeys4"     || 
					$sPostMode==="02_CreateForeignKeys5"     || $sPostMode==="02_CreateForeignKeys6"     || 
					$sPostMode==="02_CreateForeignKeys7"     || $sPostMode==="02_CreateForeignKeys8"     || 
					$sPostMode==="02_CreateForeignKeys9"     || $sPostMode==="02_CreateForeignKeys10"    || 
					$sPostMode==="02_CreateForeignKeys11"    || $sPostMode==="02_CreateForeignKeys12"    || 
					$sPostMode==="02_CreateForeignKeys13"    || $sPostMode==="02_CreateForeignKeys14"    || 
					$sPostMode==="02_CreateForeignKeys15"    || $sPostMode==="02_CreateForeignKeys16"    || 
					$sPostMode==="02_CreateForeignKeys17"    || $sPostMode==="02_CreateForeignKeys18"    || 
					$sPostMode==="02_CreateForeignKeys19"    || $sPostMode==="02_CreateForeignKeys20"    || 
					$sPostMode==="02_CreateViewsPublic1"     || $sPostMode==="02_CreateViewsPublic2"     || 
					$sPostMode==="02_CreateViewsPublic3"     || $sPostMode==="02_CreateViewsPublic4"     || 
					$sPostMode==="02_CreateViewsPublic5"     || $sPostMode==="02_CreateViewsPublic6"     || 
					$sPostMode==="02_CreateViewsRestricted1" || $sPostMode==="02_CreateViewsRestricted2" || 
					$sPostMode==="02_CreateViewsRestricted3" || $sPostMode==="02_CreateViewsRestricted4" || 
					$sPostMode==="02_CreateViewsRestricted5" || $sPostMode==="02_CreateViewsRestricted6" || 
					$sPostMode==="02_CreateDefaultData1"     || $sPostMode==="02_CreateDefaultData2"     || 
					$sPostMode==="02_CreateDefaultData3"     || $sPostMode==="02_CreateDefaultData4"     || 
					$sPostMode==="02_CreatePHPConfig"
					
				) {
					$bNeedsDatabaseAccess = true;
					//echo "2000\n";
				} else {
					$bNeedsDatabaseAccess = false;
				}
				
			} else {
				if( $sPostMode==="03_AddHub" ) {
					$bNeedsDatabaseAccess = true;
					//echo "1000\n";
				} else {
					$bNeedsDatabaseAccess = false;
				}
			}
			
			
			//----------------------------------------------------//
			//-- Extract the Access variables                   --//
			//----------------------------------------------------//
			if( $bNeedsDatabaseAccess===true ) {
				//-- Extract the "Access" Parameter --//
				$sPostAccess = $aHTTPData["Access"];
				
				if( $sPostAccess===false ) {
					$bError = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"Access\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Access\" parameter\n";
					//$sErrMesg .= "eg. \n \n\n";
				}
			}
			
		} catch( Exception $e0103 ) {
			$bError = true;
			$iErrCode  = 102;
			$sErrMesg .= "Error Code:'0102' \n";
			$sErrMesg .= "No \"Access\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Access\" parameter\n";
			//$sErrMesg .= "eg. \n\n";
		}
	}
	
	
	
	//================================================================//
	//== 2.2.3 - CONVERT JSON STRING "DATA" TO AN ARRAY             ==//
	//================================================================//
	if( $bError===false ) {
		try {
			if( $sPostMode==="01_DBPasswordInit" || $sPostMode==="03_AddHub" ) {
				
				//-- Extract the 'Data' string from the HTTP Parameters --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
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
						$sErrMesg .= "Invalid POST \"Data\"! \n";
						$sErrMesg .= "Couldn't extract JSON values from the \"Data\" Parameter \n";
					}
					
				} else {
					$bError    = true;
					$iErrCode  = 208;
					$sErrMesg .= "Error Code:'0208' \n";
					$sErrMesg .= "Invalid POST \"Data\" Parameter! \n";
					$sErrMesg .= "Please use a valid data in the \"Data\" Parameter \n";
				}
			}
		} catch( Exception $e0209 ) {
			$bError    = true;
			$iErrCode  = 209;
			$sErrMesg .= "Error Code:'0209' \n";
			$sErrMesg .= $e0209->getMessage();
		}
	}
	
	
	//================================================================//
	//-- 2.2.1 - Extract the API "DBName"                           --//
	//================================================================//
	if( $bError===false ) {
		try {
			if(
				$sPostMode==="02_NewSchema"              || $sPostMode==="02_CreateTables1"          || 
				$sPostMode==="02_CreateTables2"          || $sPostMode==="02_CreateTables3"          || 
				$sPostMode==="02_CreateTables4"          || $sPostMode==="02_CreateTables5"          || 
				$sPostMode==="02_CreateTables6"          || 
				$sPostMode==="02_CreateForeignKeys1"     || $sPostMode==="02_CreateForeignKeys2"     || 
				$sPostMode==="02_CreateForeignKeys3"     || $sPostMode==="02_CreateForeignKeys4"     || 
				$sPostMode==="02_CreateForeignKeys5"     || $sPostMode==="02_CreateForeignKeys6"     || 
				$sPostMode==="02_CreateForeignKeys7"     || $sPostMode==="02_CreateForeignKeys8"     || 
				$sPostMode==="02_CreateForeignKeys9"     || $sPostMode==="02_CreateForeignKeys10"    || 
				$sPostMode==="02_CreateForeignKeys11"    || $sPostMode==="02_CreateForeignKeys12"    || 
				$sPostMode==="02_CreateForeignKeys13"    || $sPostMode==="02_CreateForeignKeys14"    || 
				$sPostMode==="02_CreateForeignKeys15"    || $sPostMode==="02_CreateForeignKeys16"    || 
				$sPostMode==="02_CreateForeignKeys17"    || $sPostMode==="02_CreateForeignKeys18"    || 
				$sPostMode==="02_CreateForeignKeys19"    || $sPostMode==="02_CreateForeignKeys20"    || 
				$sPostMode==="02_CreateViewsPublic1"     || $sPostMode==="02_CreateViewsPublic2"     || 
				$sPostMode==="02_CreateViewsPublic3"     || $sPostMode==="02_CreateViewsPublic4"     || 
				$sPostMode==="02_CreateViewsPublic5"     || $sPostMode==="02_CreateViewsPublic6"     || 
				$sPostMode==="02_CreateViewsRestricted1" || $sPostMode==="02_CreateViewsRestricted2" || 
				$sPostMode==="02_CreateViewsRestricted3" || $sPostMode==="02_CreateViewsRestricted4" || 
				$sPostMode==="02_CreateViewsRestricted5" || $sPostMode==="02_CreateViewsRestricted6" || 
				$sPostMode==="02_CreateDefaultData1"     || $sPostMode==="02_CreateDefaultData2"     || 
				$sPostMode==="02_CreateDefaultData3"     || $sPostMode==="02_CreateDefaultData4"     ||
				$sPostMode==="02_CreatePHPConfig"        || $sPostMode==="03_AddHub"                 
			) {
				
				if( isset($aHTTPData['DBName']) ) {
					//-- Extract the Database name --//
					$sPostDatabaseName = $aHTTPData['DBName'];
					
					//-- Lowercase the name for checking against invalid names --//
					$sTemp = strtolower( $sPostDatabaseName );
					
					//-- Check against invalid name --//
					if( $sTemp==="information_schema" || $sTemp==="test" || $sTemp==="tmp" || $sTemp==="temp" ) {
						$bError    = true;
						$iErrCode  = 0;
						$sErrMesg .= "Error Code:'0000' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "The provided Database schema name is a reserved word! \n";
					}
				} else {
					//-- Error message --//
					$bError    = true;
					$iErrCode  = 0;
					$sErrMesg .= "Error Code:'0000' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "The provided Database schema name is not set! \n";
				}
			}
			
		} catch( Exception $e0209 ) {
			$bError    = true;
			$iErrCode  = 209;
			$sErrMesg .= "Error Code:'0209' \n";
			$sErrMesg .= $e0209->getMessage();
		}
	}
}	//-- END of POST --//



//====================================================================//
//== 3.0 - PREPARE                                                  ==//
//====================================================================//
if($bError===false) {
	try {
		//================================================================//
		//== 3.2 - CONVERT JSON STRING "ACCESS" TO AN ARRAY             ==//
		//================================================================//
		if( $bError===false ) {
			if( $bNeedsDatabaseAccess===true ) {
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
						
					} else {
						//---------------------------------//
						//-- Check Username & Password   --//
						//---------------------------------//
						if( isset($aPostAccess['Username']) && isset($aPostAccess['Password']) ) {
							//-- NOTE: The database adminsitrator accounts are allowed to be used here --//
							$sDBUsername = $aPostAccess['Username'];
							$sDBPassword = $aPostAccess['Password'];
							
							//-- URI --//
							if( isset($aPostAccess['URI']) ) {
								$sDBURI      = $aPostAccess['URI'];
							} else {
								$sDBURI      = "127.0.0.1";
							}
							
							//-- URI Port --//
							if( isset($aPostAccess['Port']) ) {
								$sDBPort     = $aPostAccess['Port'];
							} else {
								$sDBPort     = "3306";
							}
							
							//-- Build DB Connect String --//
							$sDBConnectString = 'mysql:host='.$sDBURI.';port='.$sDBPort.'';
							
							if( $sPostMode==="01_DBPasswordInit" ) {
								if( trim( $sDBUsername )==="" ) {
									//-- Parameters are missing --//
									$bError    = true;
									$iErrCode  = 12;
									$sErrMesg .= "Error Code:'0012' \n";
									$sErrMesg .= "Can't access the database! \n";
									$sErrMesg .= "Invalid Username and/or Password parameters.\n";
								}
								
							} else {
								//-- Check to make sure they aren't empty --//
								if( trim( $sDBUsername )==="" || trim( $sDBPassword )==="" ) {
									//-- Parameters are missing --//
									$bError    = true;
									$iErrCode  = 12;
									$sErrMesg .= "Error Code:'0012' \n";
									$sErrMesg .= "Can't access the database! \n";
									$sErrMesg .= "Invalid Username and/or Password parameters.\n";
								}
							}
							
							
							if( $bError===false ) {
								//------------------------------------------//
								//-- Setup the Database Config            --//
								//------------------------------------------//
								$aDBConfig = array(
									'uri'       => $sDBConnectString,
									'mode'      => 'EncryptedSession',
									'charset'   => 'utf8mb4'
								);
								
								//------------------------------------------//
								//-- Open Database Connection             --//
								//------------------------------------------//
								$oRestrictedDB = new DBMySQL(
									$aDBConfig,
									$sDBUsername,
									$sDBPassword
								);
								
								//------------------------------------------//
								//-- Check if the DB connection succeeded --//
								//------------------------------------------//
								if( $oRestrictedDB->Initialised===true ) {
									//-- FLAG THAT THERE IS ACCESS TO THE RESTRICTED DATABASE --//
									$bDatabaseConnection = true;
									
								} else {
									//-- DATABASE CONNECTION ATTEMPT HAD AN ERROR --//
									$bDatabaseConnection = false;
								}
							}	//-- ENDIF No errors --//
						} else {
							//-- Parameters are missing --//
							$bError    = true;
							$iErrCode  = 12;
							$sErrMesg .= "Error Code:'0012' \n";
							$sErrMesg .= "Can't access the database! \n";
							$sErrMesg .= "Invalid Username and/or Password parameters.\n";
						}
					}
					
				} catch( Exception $e0207 ) {
					$bError = true;
					$iErrCode  = 207;
					$sErrMesg .= "Error Code:'0207' \n";
					$sErrMesg .= "Problem with the HTTP POST \"Access\" parameter! \n";
					$sErrMesg .= $e0207->getMessage();
				}
			} //-- ENDIF Database access is needed --//
		}
		
		
		//================================================================//
		//== 3.4 - Setup Variables for "01_DBPasswordInit"              ==//
		//================================================================//
		if( $bError===false ) {
			try {
				if( $sPostMode==="01_DBPasswordInit" ) {
					//-- Check to see if the "root" user has been used with no password --//
					if( $sDBUsername==="root" && $sDBPassword==="" ) {
						
						//------------------------------------------------------------//
						//-- Check the 'Password' in the data parameter             --//
						//------------------------------------------------------------//
						if( isset($aPostData['Password']) ) {
							if( $aPostData['Password']!==null && $aPostData['Password']!==false ) {
								if( strlen( trim( $aPostData['Password'] ) ) > 6 ) {
									$sNewPassword = $aPostData['Password'];
									
								} else {
									//-- ERROR: Insufficient Length --//
									$bError = true;
									$iErrCode  = 0;
									$sErrMesg .= "Error Code:'0000' \n";
									$sErrMesg .= "Password is not long enough! \n";
								}
								
							} else {
								//-- ERROR: Problem with the password --//
								$bError = true;
								$iErrCode  = 0;
								$sErrMesg .= "Error Code:'0000' \n";
								$sErrMesg .= "Problem with the Password from the Data parameters! \n";
							}
							
						} else {
							//-- ERROR:  --//
							$bError = true;
							$iErrCode  = 0;
							$sErrMesg .= "Error Code:'0000' \n";
							$sErrMesg .= "Problem extracting the Password from the Data parameters! \n";
						}
					}
				}
				
			} catch( Exception $e0209 ) {
				$bError    = true;
				$iErrCode  = 209;
				$sErrMesg .= "Error Code:'0209' \n";
				$sErrMesg .= $e0209->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.5 - Setup Variables for "03_AddHub"                      ==//
		//================================================================//
		if( $bError===false ) {
			try {
				if( $sPostMode==="03_AddHub" ) {
					//------------------------------------------------------------//
					//-- Check the 'Type' to see which function we should use   --//
					//------------------------------------------------------------//
					if( isset($aPostData['InsertType']) ) {
						$sInsertType = $aPostData['InsertType'];
						
						//-- Check if the --//
						//if( $sInsertType!=="NewAll" && $sInsertType!=="NewPremise" && $sInsertType!=="NewHub") {
						//}
						
						//----------------------------------------------------//
						//-- 5.6.3.1. - Check the passed data parameters    --//
						//----------------------------------------------------//
						
						//-- Check to make sure both the Premise Name and the Premise Description exist --//
						if( $sInsertType==="NewAll" || $sInsertType==="NewPremise") {
							
							if( isset($aPostData['PremiseName']) && isset($aPostData['PremiseDesc']) ) {
								//-- Extract the PremiseName and Premise Desc --//
								$sPremiseName = $aPostData['PremiseName'];
								$sPremiseDesc = $aPostData['PremiseDesc'];
								
								//-- Verify that the PremiseName is not null or too short to be valid --//
								if( !( strlen( trim( $aPostData['PremiseName'] ) ) > 3 ) ) {
									//-- Flag an error --//
									$bError = true;
									$iErrCode  = 0;
									$sErrMesg .= "Error Code:'7301' \n";
									$sErrMesg .= "Problem extracting the 'PremiseName' from the 'Data' parameter! \n";
								}
							} else {
								//-- Flag an error --//
								$bError = true;
								$iErrCode  = 0;
								$sErrMesg .= "Error Code:'7302' \n";
								$sErrMesg .= "Problem with either the 'PremiseName' or the 'PremiseDesc' from the 'Data' parameter! \n";
							}
						}
						
						//--------------------------------------------------------------------//
						//-- Check if the Owner Username and password seem fine             --//
						//--------------------------------------------------------------------//
						if( $bError===false ) {
							//-- IF The Mode needs a "New User" Created --//
							if( $aPostData['InsertType']==="NewAll" ) {
								if( isset( $aPostData['OwnerUsername'] ) && isset( $aPostData['OwnerPassword'] ) ) {
									//-- Extract the username and password --//
									$sOwnerUsername = $aPostData['OwnerUsername'];
									$sOwnerPassword = $aPostData['OwnerPassword'];
									
									//-- Check the 'Username' is invalid --//
									if( !( strlen( trim( $sOwnerUsername ) ) > 1 ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7304;
										$sErrMesg .= "Error Code:'7304' \n";
										$sErrMesg .= "Problem with the 'OwnerUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "Unable to see any alphanumeric characters. \n";
										
									//-- Check if the 'Password' is invalid --//
									} else if( !( strlen( $sOwnerPassword ) > 6 ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7305;
										$sErrMesg .= "Error Code:'7305' \n";
										$sErrMesg .= "Problem with the 'OwnerPassword' from the 'Data' parameter! \n";
										$sErrMesg .= "The 'OwnerPassword' length is not sufficient. \n";
										
									//-- Check the 'Username' has not allowed characters --//
									} else if( AlphaNumericCheck( $sOwnerUsername )!==true ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7306;
										$sErrMesg .= "Error Code:'7306' \n";
										$sErrMesg .= "Problem 'OwnerUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "Invalid characters detected in the 'OwnerUsername' from the 'Data' parameter! \n";
									
									//-- Check the 'Username' is blacklisted --//
									} else if( userauth_usernameblacklistcheck( $sOwnerUsername ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7307;
										$sErrMesg .= "Error Code:'7307' \n";
										$sErrMesg .= "Problem 'OwnerUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "Blacklisted 'OwnerUsername' was used. \n";
										
									}
								} else {
									//-- Flag an error --//
									$bError = true;
									$iErrCode  = 7308;
									$sErrMesg .= "Error Code:'7308' \n";
									$sErrMesg .= "Problem with either the 'OwnerUsername' or the 'OwnerPassword' from the 'Data' parameter! \n";
								}
							}
						}
						
						//--------------------------------------------------------------------//
						//-- Check if the WatchInputs Username and password seem fine       --//
						//--------------------------------------------------------------------//
						if( $bError===false ) {
							//-- IF The Mode needs a "New User" Created --//
							if( $aPostData['InsertType']==="NewAll" ) {
								if( isset( $aPostData['WatchInputsUsername'] ) && isset( $aPostData['WatchInputsPassword'] ) ) {
									//-- Extract the username and password --//
									$sWatchInputsUsername = $aPostData['WatchInputsUsername'];
									$sWatchInputsPassword = $aPostData['WatchInputsPassword'];
									
									//-- Check the 'Username' isn't invalid --//
									if( !( strlen( trim( $sWatchInputsUsername ) ) > 1 ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7310;
										$sErrMesg .= "Error Code:'7310' \n";
										$sErrMesg .= "Problem with the 'WatchInputsUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "The WatchInputs Username might be insufficient length or have other issues.\n";
										
									//-- Check if the 'Password' isn't invalid --//
									} else if( !( strlen( $sWatchInputsPassword ) > 6 ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7311;
										$sErrMesg .= "Error Code:'7311' \n";
										$sErrMesg .= "Problem with the 'WatchInputsPassword' from the 'Data' parameter! \n";
										$sErrMesg .= "The WatchInputs Password might be insufficient length or have other issues.\n";
									
									//-- Check the 'Username' has not allowed characters --//
									} else if( AlphaNumericCheck( $sWatchInputsUsername )!==true ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7312;
										$sErrMesg .= "Error Code:'7312' \n";
										$sErrMesg .= "Problem with the 'WatchInputsUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "Invalid characters detected in the 'WatchInputsUsername' from the 'Data' parameter! \n";
										
									//-- Check the 'Username' is blacklisted --//
									} else if( userauth_usernameblacklistcheck( $sWatchInputsUsername ) ) {
										//-- Flag an error --//
										$bError = true;
										$iErrCode  = 7313;
										$sErrMesg .= "Error Code:'7313' \n";
										$sErrMesg .= "Problem with the 'WatchInputsUsername' from the 'Data' parameter! \n";
										$sErrMesg .= "A blacklisted 'WatchInputsUsername' from the 'Data' parameter was used! \n";
										
									}
								} else {
									//-- Flag an error --//
									$bError = true;
									$iErrCode  = 7314;
									$sErrMesg .= "Error Code:'7314' \n";
									$sErrMesg .= "Problem with either the 'WatchInputsUsername' or the 'WatchInputsPassword' from the 'Data' parameter! \n";
								}
							}
						}
						//--------------------------------------------------------------------//
						//-- Check if the 'HubName', 'HubType' & 'HubSerialCode' seem fine  --//
						//--------------------------------------------------------------------//
						if( $bError===false ) {
							if( isset( $aPostData['HubName'] ) && isset( $aPostData['HubType'] ) ) {
								//-- Extract the 'HubName', 'HubType' & 'HubSerialCode' --//
								$sHubName          = $aPostData['HubName'];
								$sHubTypeId        = $aPostData['HubType'];
								if( isset( $aPostData['HubSerialCode'] ) ) {
									$sHubSerialCode    = $aPostData['HubSerialCode'];
								} else {
									$sHubSerialCode    = "";
								}
								
								//-- Check the 'HubName' isn't invalid --//
								if( !( strlen( trim( $sHubName ) ) > 1 ) ) {
									//-- Flag an error --//
									$bError = true;
									$iErrCode  = 0;
									$sErrMesg .= "Error Code:'7317' \n";
									$sErrMesg .= "Problem with the 'HubName' from the 'Data' parameter! \n";
								}
								
								//-- Check to make sure that "HubType" is numeric and above 1 --//
								if( is_numeric($sHubTypeId)  ) {
									$iHubTypeId = intval( $sHubTypeId );
									
									if( !($iHubTypeId>=1 ) ) {
										$bError = true;
										$iErrCode  = 0;
										$sErrMesg .= "Error Code:'7318' \n";
										$sErrMesg .= "Problem with the 'HubName' from the 'Data' parameter! \n";
									}
								} else {
									//-- Flag an error --//
									$bError = true;
									$iErrCode  = 0;
									$sErrMesg .= "Error Code:'7318' \n";
									$sErrMesg .= "Problem with the 'HubName' from the 'Data' parameter! \n";
								}
								
								//-- Check if Hub IP Address is valid if not then assume local host --//
								if( isset( $aPostData['HubAddress'] ) ) {
									$sHubAddress = $aPostData['HubAddress'];
								} else {
									$sHubAddress = "127.0.0.1";
								}
								
								//------------------------------------//
								//-- Hub Username                   --//
								//------------------------------------//
								if( isset( $aPostData['HubUsername'] ) ) {
									if( is_string( $aPostData['HubUsername'] ) ) {
										if( strlen( trim( $aPostData['HubUsername'] ) ) >= 1 ) {
											$sHubUsername = $aPostData['HubUsername'];
											
										} else {
											$sHubUsername = "";
										}
									} else {
										$sHubUsername = "";
									}
								} else {
									$sHubUsername = "";
								}
								
								//------------------------------------//
								//-- Hub Password                   --//
								//------------------------------------//
								if( isset( $aPostData['HubPassword'] ) ) {
									if( is_string( $aPostData['HubPassword'] ) ) {
										if( strlen( $aPostData['HubPassword'] ) ) {
											$sHubPassword = $aPostData['HubPassword'];
											
										} else {
											$sHubPassword = "";
											
										}
									} else {
										$sHubPassword = "";
										
									}
								} else {
									$sHubPassword = "";
									
								}
								
							} else {
								//-- Flag an error --//
								$bError = true;
								$iErrCode  = 0;
								$sErrMesg .= "Error Code:'7321' \n";
								$sErrMesg .= "Problem with either the 'HubName', 'HubType' or the 'HubSerialCode' from the 'Data' parameter! \n";
							}
						}
					} else {
						//-- ERROR:  --//
						$bError = true;
						$iErrCode  = 0;
						$sErrMesg .= "Error Code:'0000' \n";
						$sErrMesg .= "Problem extracting the PremiseName from the Data parameters! \n";
					}
				}
				
			} catch( Exception $e0210 ) {
				$bError    = true;
				$iErrCode  = 210;
				$sErrMesg .= "Error Code:'0210' \n";
				$sErrMesg .= $e0210->getMessage();
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
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if($bError===false) {
	try {
		//================================================================//
		//== 5.1 - MODE: Check Status                                   ==//
		//================================================================//
		if( $sPostMode==="00_CheckStatus" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.1.1 - Setup the Result variable                          --//
				//----------------------------------------------------------------//
				
				//--------------------------------------------//
				//-- IF the PHP Config is setup             --//
				//--------------------------------------------//
				if( $bConfigSet===true ) {
					$aResult = array(
						"Deployed"	=> true
					);
					
				//--------------------------------------------//
				//-- ELSE the PHP Config isn't setup        --//
				//--------------------------------------------//
				} else {
					$aResult = array(
						"Deployed"	=> false
					);
				}
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 1400;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Check Status                                   ==//
		//================================================================//
		} else if( $sPostMode==="01_DBPasswordInit" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.2.1 - Check to see if there is a database connction      --//
				//----------------------------------------------------------------//
				if( $bDatabaseConnection===false ) {
					//-- No Database username detected --//
					$bError    = true;
					$iErrCode  = 11;
					$sErrMesg .= "Error Code:'0011' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.2.3 - Insert new database                                --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- Change the Password --//
					$aResult = DB_ChangeUserPassword( $sNewPassword );
					
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 2402;
						$sErrMesg .= "Error Code:'2402' \n";
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
		//== 5.3 - MODE: Check Status                                   ==//
		//================================================================//
		} else if( $sPostMode==="02_DBConnectTest" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.3.1 - Setup the Result variable                          --//
				//----------------------------------------------------------------//
				
				//--------------------------------------------//
				//-- IF the PHP Config is setup             --//
				//--------------------------------------------//
				if( $bDatabaseConnection===true ) {
					$aResult = array(
						"Connection"	=> true
					);
					
				//--------------------------------------------//
				//-- ELSE the PHP Config isn't setup        --//
				//--------------------------------------------//
				} else {
					$aResult = array(
						"Connection"	=> false
					);
				}
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 3400;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
		//================================================================//
		//== 5.4 - MODE: New Schema                                     ==//
		//================================================================//
		} else if( $sPostMode==="02_NewSchema" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.4.1 - Check to see if there is a database connction      --//
				//----------------------------------------------------------------//
				if( $bDatabaseConnection===false ) {
					//-- No Database username detected --//
					$bError    = true;
					$iErrCode  = 11;
					$sErrMesg .= "Error Code:'0011' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.4.2 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					$bTransactionStarted = $oRestrictedDB->dbBeginTransaction();
					
					if( $bTransactionStarted===false ) {
						$bError    = true;
						$iErrCode  = 16;
						$sErrMesg .= "Error Code:'0016' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "Problem when trying to start the transaction! \n";
					}
				}
				
				//----------------------------------------------------------------//
				//-- 5.4.3 - Insert new database                                --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( trim($sPostDatabaseName)!=="" ) {
						$sTemp = strtolower( $sPostDatabaseName );
						
						if( $sTemp==="information_schema" || $sTemp==="mysql" || $sTemp==="test" || $sTemp==="tmp" || $sTemp==="temp" ) {
							$bError    = true;
							$iErrCode  = 4402;
							$sErrMesg .= "Error Code:'4402' \n";
							$sErrMesg .= "Database Error! \n";
							$sErrMesg .= "The provided Database schema name is a reserved word! \n";
						} else {
							$aResult = DB_CreateDatabase( $sPostDatabaseName );
						}
					} else {
						//-- Error message --//
						$bError    = true;
						$iErrCode  = 4401;
						$sErrMesg .= "Error Code:'4401' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "The provided Database schema name isn't valid! \n";
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
		//== 5.5 - MODE: Create Tables, Foreign Keys or Views           ==//
		//================================================================//
		} else if( 
			$sPostMode==="02_CreateTables1"          || $sPostMode==="02_CreateTables2"          || 
			$sPostMode==="02_CreateTables3"          || $sPostMode==="02_CreateTables4"          || 
			$sPostMode==="02_CreateTables5"          || $sPostMode==="02_CreateTables6"          || 
			$sPostMode==="02_CreateForeignKeys1"     || $sPostMode==="02_CreateForeignKeys2"     || 
			$sPostMode==="02_CreateForeignKeys3"     || $sPostMode==="02_CreateForeignKeys4"     || 
			$sPostMode==="02_CreateForeignKeys5"     || $sPostMode==="02_CreateForeignKeys6"     || 
			$sPostMode==="02_CreateForeignKeys7"     || $sPostMode==="02_CreateForeignKeys8"     || 
			$sPostMode==="02_CreateForeignKeys9"     || $sPostMode==="02_CreateForeignKeys10"    || 
			$sPostMode==="02_CreateForeignKeys11"    || $sPostMode==="02_CreateForeignKeys12"    || 
			$sPostMode==="02_CreateForeignKeys13"    || $sPostMode==="02_CreateForeignKeys14"    || 
			$sPostMode==="02_CreateForeignKeys15"    || $sPostMode==="02_CreateForeignKeys16"    || 
			$sPostMode==="02_CreateForeignKeys17"    || $sPostMode==="02_CreateForeignKeys18"    || 
			$sPostMode==="02_CreateForeignKeys19"    || $sPostMode==="02_CreateForeignKeys20"    || 
			$sPostMode==="02_CreateViewsPublic1"     || $sPostMode==="02_CreateViewsPublic2"     || 
			$sPostMode==="02_CreateViewsPublic3"     || $sPostMode==="02_CreateViewsPublic4"     || 
			$sPostMode==="02_CreateViewsPublic5"     || $sPostMode==="02_CreateViewsPublic6"     || 
			$sPostMode==="02_CreateViewsRestricted1" || $sPostMode==="02_CreateViewsRestricted2" || 
			$sPostMode==="02_CreateViewsRestricted3" || $sPostMode==="02_CreateViewsRestricted4" || 
			$sPostMode==="02_CreateViewsRestricted5" || $sPostMode==="02_CreateViewsRestricted6" || 
			$sPostMode==="02_CreateDefaultData1"     || $sPostMode==="02_CreateDefaultData2"     || 
			$sPostMode==="02_CreateDefaultData3"     || $sPostMode==="02_CreateDefaultData4"    
		) {
			try {
				
				//----------------------------------------------------------------//
				//-- 5.5.1 - Check to see if there is a database Connction      --//
				//----------------------------------------------------------------//
				if( $bDatabaseConnection===false ) {
					//-- No Database username detected --//
					$bError    = true;
					$iErrCode  = 11;
					$sErrMesg .= "Error Code:'0011' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.5.2 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.5.3 - Call the function to create the Tables or FKs      --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					switch( $sPostMode ) {
						//--------------------//
						//-- Tables         --//
						//--------------------//
						case "02_CreateTables1":
							$aTemp   = DB_CreateTables( $sPostDatabaseName, array( "Core", "CoreAddon", "Region", "Currency", "Language", "Timezone" ) );
							
							//-- Insert the Core Values --//
							if( $aTemp['Error']===false ) {
								$aResult = InsertTheDatabaseCoreValues( $sPostDatabaseName );
							} else {
								$bError    = true;
								$iErrCode  = 16;
								$sErrMesg  = $aTemp['ErrMesg'];
							}
							
							break;
						
						case "02_CreateTables2":
							$aResult = DB_CreateTables( $sPostDatabaseName, array( "Users", "UserAddress", "Permissions", "Premise", "PremiseLog" ) );
							break;
							
						case "02_CreateTables3":
							$aResult = DB_CreateTables( $sPostDatabaseName, array( "PremiseInfo1", "PremiseInfo2", "Rooms", "Hub", "HubInfo", "Comm") );
							break;
							
						case "02_CreateTables4":
							$aResult = DB_CreateTables( $sPostDatabaseName, array( "Link", "LinkInfo", "LinkConn1", "LinkConn2", "Thing" ) );
							break;
						
						case "02_CreateTables5":
							$aResult = DB_CreateTables( $sPostDatabaseName, array( "IO", "Data1", "Data2", "Data3", "Data4", "Data5" ) );
							break;
							
						case "02_CreateTables6":
							$aResult = DB_CreateTables( $sPostDatabaseName, array( "Datatype", "RSCat", "RSType", "UoM", "Rule1" ) );
							break;
							
						//--------------------//
						//-- Foreign Keys   --//
						//--------------------//
						case "02_CreateForeignKeys1":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Core", "Users" ) );
							break;
							
						case "02_CreateForeignKeys2":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "UserAddress" ) );
							break;
							
						case "02_CreateForeignKeys3":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Permissions1" ) );
							break;
							
						case "02_CreateForeignKeys4":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Permissions2" ) );
							break;
							
						case "02_CreateForeignKeys5":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Premise" ) );
							break;
							
						case "02_CreateForeignKeys6":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "PremiseLog" ) );
							break;
							
						case "02_CreateForeignKeys7":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "PremiseInfo1" ) );
							break;
							
						case "02_CreateForeignKeys8":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Rooms" ) );
							break;
							
						case "02_CreateForeignKeys9":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Hub" ) );
							break;
							
						case "02_CreateForeignKeys10":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Comm" ) );
							break;
							
						case "02_CreateForeignKeys11":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Link" ) );
							break;
							
						case "02_CreateForeignKeys12":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "LinkConn1" ) );
							break;
							
						case "02_CreateForeignKeys13":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Thing" ) );
							break;
							
						case "02_CreateForeignKeys14":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "IO" ) );
							break;
							
						case "02_CreateForeignKeys15":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Data1" ) );
							break;
						
						case "02_CreateForeignKeys16":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Data2", "Data3" ) );
							break;
							
						case "02_CreateForeignKeys17":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Data4" ) );
							break;
							
						case "02_CreateForeignKeys18":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "Data5" ) );
							break;
							
						case "02_CreateForeignKeys19":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "RSType" ) );
							break;
							
						case "02_CreateForeignKeys20":
							$aResult = DB_CreateForeignKeys( $sPostDatabaseName, array( "UoM", "Rule1" ) );
							break;
						
						//--------------------//
						//-- Views          --//
						//--------------------//
						case "02_CreateViewsPublic1":
							//$aResult = DB_CreateViewsPublic( $sPostDatabaseName );
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicRSCat", "PublicRSSubCat", "PublicRSTariff", "PublicRSTypes" ) );
							break;
							
						case "02_CreateViewsPublic2":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicUoM", "PublicRegion", "PublicCurrencies" ) );
							break;
							
						case "02_CreateViewsPublic3":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicLanguages" ) );
							break;
							
						case "02_CreateViewsPublic4":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicTimezones", "PublicGenders", "PublicRoomTypes" ) );
							break;
							
						case "02_CreateViewsPublic5":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicLinkTypes", "PublicPremiseBedrooms", "PublicPremiseFloors" ) );
							break;
							
						case "02_CreateViewsPublic6":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PublicPremiseRooms", "PublicPremiseOccupants" ) );
							break;
							
						case "02_CreateViewsRestricted1":
							//$aResult = DB_CreateViewsRestricted1( $sPostDatabaseName );
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PrivateUsersInfo", "PrivateUsersPremises", "PrivateUsersPremiseLocations", "PrivateUsersPremiseLog" ) );
							break;
							
						case "02_CreateViewsRestricted2":
							//$aResult = DB_CreateViewsRestricted2( $sPostDatabaseName );
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PrivateUsersHub", "PrivateUsersPremiseRooms", "PrivateUsersRooms", "PrivateUsersComm", "PrivateUsersLink", "PrivateUsersThing" ) );
							break;
							
						case "02_CreateViewsRestricted3":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PrivateUsersIO", "PrivateUsersServerPerms", "PrivateDataTinyInt", "PrivateDataInt", "PrivateDataBigInt" ) );
							break;
							
						case "02_CreateViewsRestricted4":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PrivateDataFloat", "PrivateDataTinyString", "PrivateDataShortString", "PrivateDataMedString", "PrivateDataLongString" ) );
							break;
							
						case "02_CreateViewsRestricted5":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "PrivateDataString255", "PrivateDataTinyIntEnum", "PrivateDataIntEnum", "PrivateDataBigIntEnum" ) );
							break;
							
						case "02_CreateViewsRestricted6":
							$aResult = DB_CreateViews( $sPostDatabaseName, array( "WatchInputsHub", "WatchInputsPremise", "WatchInputsComm", "WatchInputsLink", "WatchInputsThing", "WatchInputsIO" ) );
							break;
							
						//--------------------//
						//-- Default Data   --//
						//--------------------//
						case "02_CreateDefaultData1":
							$aResult = DB_CreateDefaultData1( $sPostDatabaseName );
							break;
						
						case "02_CreateDefaultData2":
							$aResult = DB_CreateDefaultData2( $sPostDatabaseName );
							break;
							
						case "02_CreateDefaultData3":
							//--  --//
							$aTempResult1 = DB_CreateDefaultData3( $sPostDatabaseName );
							
							if( $aTempResult1['Error']===false ) {
								//--  --//
								$aTempResult2 = DB_CreateDefaultData4( $sPostDatabaseName );
								
								if( $aTempResult2['Error']===false ) {
									//-- Build a Results array --//
									$aResult = array(
										"Error"   => false,
										"Data"    => array(
											"Part1" => $aTempResult1['Result'],
											"Part2" => $aTempResult2['Result']
										)
									);
									
								} else {
									$bError    = true;
									$iErrCode  = 5409;
									$sErrMesg .= "Error Code:'5409' \n";
									$sErrMesg .= $aTempResult2['ErrMesg'];
								}
							} else {
								$bError    = true;
								$iErrCode  = 5408;
								$sErrMesg .= "Error Code:'5408' \n";
								$sErrMesg .= $aTempResult1['ErrMesg'];
							}
							
							break;
							
						case "02_CreateDefaultData4":
							$aResult = DB_CreateDefaultData5( $sPostDatabaseName );
							break;
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.5.4 - Check for Errors                                   --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 5402;
						$sErrMesg .= "Error Code:'5402' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
			} catch( Exception $e5400 ) {
				//--------------------------------//
				//-- Display an Error Message   --//
				//--------------------------------//
				$bError    = true;
				$iErrCode  = 5400;
				$sErrMesg .= "Error Code:'5400' \n";
				$sErrMesg .= $e5400->getMessage();
			}
			
			
		//================================================================//
		//== 5.6 - MODE: Create PHP Config                              ==//
		//================================================================//
		} else if( $sPostMode==="02_CreatePHPConfig" ) {
			try {
				
				//----------------------------------------------------------------//
				//-- 5.6.1 - Write the PHP Config file                          --//
				//----------------------------------------------------------------//
				$aResult = PHPConfig_Write( $sPostDatabaseName, $sDBURI, $sDBPort );
				
				
				//----------------------------------------------------------------//
				//-- 5.6.4 - Check for Errors                                   --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 6402;
						$sErrMesg .= "Error Code:'6402' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
			} catch( Exception $e6400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 6400;
				$sErrMesg .= "Error Code:'6400' \n";
				$sErrMesg .= $e6400->getMessage();
			}
			
			
		//================================================================//
		//== 5.7 - MODE: Create Hub                                     ==//
		//================================================================//
		} else if( $sPostMode==="03_AddHub" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.7.1 - Check to see if there is a database Connction      --//
				//----------------------------------------------------------------//
				if( $bDatabaseConnection===false ) {
					//-- No Database username detected --//
					$bError    = true;
					$iErrCode  = 11;
					$sErrMesg .= "Error Code:'0011' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
				}
				
				//----------------------------------------------------//
				//-- 5.7.3.6.A - IF Type is "NewAll"                --//
				//----------------------------------------------------//
				if( $aPostData['InsertType']==="NewAll" ) {
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.1 - Check to make sure the User isn't already in the database --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult1 = DB_GetUsersWithName( $sPostDatabaseName, $sOwnerUsername );
							
						if( $aTempResult1['Error']===false ) {
							$bError    = true;
							$iErrCode  = 7401;
							$sErrMesg .= "Error Code:'7401' \n";
							$sErrMesg .= "There is already an existing user with that Username! \n";
							
						} else {
							if( $aTempResult1['ErrMesg']!=="GetUsersWithName: No Rows Found! Code:0" ) {
								$bError    = true;
								$iErrCode  = 7402;
								$sErrMesg .= "Error Code:'7402' \n";
								$sErrMesg .= "Problem looking up all the Users with that Username! \n";
							}
						}
					}
					
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.2 - Add the actual database user                              --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult2 = DB_CreateDatabaseUser( $sPostDatabaseName, $sOwnerUsername, $sDBURI, $sOwnerPassword );
						
						if( $aTempResult2['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7403;
							$sErrMesg .= "Error Code:'7403' \n";
							$sErrMesg .= "Problem creating the database user! \n";
							$sErrMesg .= "This is usually caused by the database user is already setup! \n";
							
						}
					}
					
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.3 - BEGIN THE TRANSACTION                                     --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						$bTransactionStarted = $oRestrictedDB->dbBeginTransaction();
					
						if( $bTransactionStarted===false ) {
							$bError    = true;
							$iErrCode  = 16;
							$sErrMesg .= "Error Code:'0016' \n";
							$sErrMesg .= "Database Error! \n";
							$sErrMesg .= "Problem when trying to start the transaction! \n";
						}
					}
					
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.4 - Add the Premise, PremiseInfo & Hub                        --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult3A = DB_InsertPremiseInfo( $sPostDatabaseName, 1, 1, 1, 1 );
						
						if( $aTempResult3A['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7406;
							$sErrMesg .= "Error Code:'7406' \n";
							$sErrMesg .= "Problem inserting the Premise Info! \n";
							$sErrMesg .= $aTempResult3A['ErrMesg'];
							
						} else {
							//-- Extract the PremiseInfoId --//
							$iPremiseInfoId = $aTempResult3A['LastId'];
							
							$aTempResult3B = DB_InsertPremise( $sPostDatabaseName, $iPremiseInfoId, $sPremiseName, $sPremiseDesc );
							
							if( $aTempResult3B['Error']===true ) {
								$bError    = true;
								$iErrCode  = 7407;
								$sErrMesg .= "Error Code:'7407' \n";
								$sErrMesg .= "Problem inserting the Premise! \n";
								$sErrMesg .= $aTempResult3B['ErrMesg'];
							} else {
								//-- Extract the PremiseId --//
								$iPremiseId = $aTempResult3B['LastId'];
								
								
								$aTempResult3C = DB_InsertPremiseAddress( $sPostDatabaseName, $iPremiseId, 1, 310, 36, "", "0000", "123 Your Street Name", "", "" );
								
								if( $aTempResult3C['Error']===true ) {
									$bError    = true;
									$iErrCode  = 7408;
									$sErrMesg .= "Error Code:'7408' \n";
									$sErrMesg .= "Problem inserting the Premise Address! \n";
									$sErrMesg .= $aTempResult3C['ErrMesg'];
								} else {
									//-- Extract the PremiseAddressId --//
									$iPremiseAddressId = $aTempResult3C['LastId'];
									
									$aTempResult3D = DB_InsertHub( $sPostDatabaseName, $iPremiseId, $iHubTypeId, $sHubName, $sHubSerialCode, $sHubAddress );
									
									if( $aTempResult3D['Error']===true ) {
										$bError    = true;
										$iErrCode  = 7410;
										$sErrMesg .= "Error Code:'7410' \n";
										$sErrMesg .= "Problem inserting the Hubs! \n";
										$sErrMesg .= $aTempResult3D['ErrMesg'];
										
									} else {
										//-- Extract the HubId --//
										$iHubId = $aTempResult3C['LastId'];
										
										$aTempResult3D = DB_InsertRoom( $sPostDatabaseName, $iPremiseId );
										
										if( $aTempResult3D['Error']===true ) {
											$bError    = true;
											$iErrCode  = 7411;
											$sErrMesg .= "Error Code:'7411' \n";
											$sErrMesg .= "Problem inserting the Rooms! \n";
											$sErrMesg .= $aTempResult3D['ErrMesg'];
											
										} else {
											//-- Extract the RoomId --//
											$iRoomId = $aTempResult3D['LastId'];
											
											//-- Insert the Hub Security --//
											$aTempResult3E = DB_InsertHubSec( $sPostDatabaseName, $iHubId, $sHubUsername, $sHubPassword );
											
											if( $aTempResult3E['Error']===true ) {
												$bError    = true;
												$iErrCode  = 7412;
												$sErrMesg .= "Error Code:'7412' \n";
												$sErrMesg .= "Problem inserting the HubSecurity! \n";
												$sErrMesg .= $aTempResult3E['ErrMesg'];
											}
										}
									}
								}
							}
						}
					}
					
					
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.5 - Add the UserInfo, User, Permissions                       --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						$aTempResult4A = DB_InsertUserInfo( $sPostDatabaseName, 1, "", "", "", $sOwnerUsername, "", "", "01/01/1990" );
						
						if( $aTempResult4A['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7420;
							$sErrMesg .= "Error Code:'7420' \n";
							$sErrMesg .= "Problem inserting the UserInfo! \n";
							$sErrMesg .= $aTempResult4A['ErrMesg'];
							
						} else {
							//-- Extract the User Id --//
							$iUserInfoId = $aTempResult4A['LastId'];
							
							$aTempResult4B = DB_InsertUser( $sPostDatabaseName, $iUserInfoId, $sOwnerUsername, 1 );
							
							if( $aTempResult4B['Error']===true ) {
								$bError    = true;
								$iErrCode  = 7421;
								$sErrMesg .= "Error Code:'7421' \n";
								$sErrMesg .= "Problem inserting the User into the 'User' table! \n";
								$sErrMesg .= $aTempResult4B['ErrMesg'];
								
							} else {
								//-- Extract the User Id --//
								$iUserId = $aTempResult4B['LastId'];
								
								
								//-- Give the user address --//
								$aTempResult4C = DB_InsertUserAddress( $sPostDatabaseName, $iUserId, 1, 36, "", "0000", 1, "", "", "" );
								
								if( $aTempResult4C['Error']===true ) {
									$bError    = true;
									$iErrCode  = 7422;
									$sErrMesg .= "Error Code:'7422' \n";
									$sErrMesg .= "Problem inserting the UserAddress! \n";
									$sErrMesg .= $aTempResult4C['ErrMesg'];
									
								} else {
									//-- Extract the User Address Id --//
									$iUserAddressId = $aTempResult4C['LastId'];
									
									//-- Give the user permission to do admin modes --//
									$aTempResult4D = DB_InsertPermPremise( $sPostDatabaseName, $iUserId, $iPremiseId, 1, 1, 1, 1, 1 );
									
									if( $aTempResult4D['Error']===true ) {
										$bError    = true;
										$iErrCode  = 7424;
										$sErrMesg .= "Error Code:'7424' \n";
										$sErrMesg .= "Problem inserting the Permissions1! \n";
										$sErrMesg .= "User=".$iUserId."  Premise=".$iPremiseId."\n";
										$sErrMesg .= $aTempResult4D['ErrMesg'];
										
									} else {
										//-- Extract the PermissionId --//
										$iPermissionId = $aTempResult4D['LastId'];
										
										//-- Grant the Owner all server permissions --//
										$aTempResult4E = DB_InsertPermServer( $sPostDatabaseName, $iUserId, 1, 1, 1 );
										
										if( $aTempResult4E['Error']===true ) {
											$bError    = true;
											$iErrCode  = 7425;
											$sErrMesg .= "Error Code:'7425' \n";
											$sErrMesg .= "Problem inserting the Permissions2! \n";
											$sErrMesg .= $aTempResult4E['ErrMesg'];
											
										} else {
											//-- Extract the PermissionId --//
											$iPermServerId = $aTempResult4E['LastId'];
											
											//-- Grant the Owner all room permissions --//
											$aTempResult4F = DB_InsertPermRoom( $sPostDatabaseName, $iUserId, $iRoomId, 1, 1, 1, 1 );
											
											if( $aTempResult4F['Error']===true ) {
												$bError    = true;
												$iErrCode  = 7428;
												$sErrMesg .= "Error Code:'7428' \n";
												$sErrMesg .= "Problem inserting the Permissions3! \n";
												//$sErrMesg .= "UId = ".$iUserId." RId = ".$iRoomId."! \n";
												
												$sErrMesg .= $aTempResult4F['ErrMesg'];
												
												
											} else {
												//-- Extract the PermissionId --//
												$iPermRoomId = $aTempResult4F['LastId'];
											}
										}
									}
								}
							}
						}
					}
					
					
					//-----------------------------------------------------------------------------//
					//-- 5.7.3.6.A.6 - Add the WatchInputs User                                  --//
					//-----------------------------------------------------------------------------//
					if( $bError===false ) {
						
						$aTempResult5A = DB_CreateDatabaseUser( $sPostDatabaseName, $sWatchInputsUsername, $sDBURI, $sWatchInputsPassword );
						
						if( $aTempResult5A['Error']===true ) {
							$bError    = true;
							$iErrCode  = 7430;
							$sErrMesg .= "Error Code:'7430' \n";
							$sErrMesg .= "Problem creating the \"WatchInputs\" database user! \n";
							
						} else {
							$aTempResult5B = DB_InsertUserInfo( $sPostDatabaseName, 1, "", "", "", $sWatchInputsUsername, "", "", "01/01/1990" );
							
							if( $aTempResult5B['Error']===true ) {
								$bError    = true;
								$iErrCode  = 7431;
								$sErrMesg .= "Error Code:'7431' \n";
								$sErrMesg .= "Problem inserting the \"WatchInputs\" UserInfo! \n";
								$sErrMesg .= $aTempResult5B['ErrMesg'];
								
							} else {
								$aTempResult5C = DB_InsertUser( $sPostDatabaseName, $aTempResult5B['LastId'], $sWatchInputsUsername, -1 );
								
								if( $aTempResult5C['Error']===true ) {
									$bError    = true;
									$iErrCode  = 7432;
									$sErrMesg .= "Error Code:'7432' \n";
									$sErrMesg .= "Problem inserting the \"WatchInputs\" user into the 'User' table! \n";
									$sErrMesg .= $aTempResult5C['ErrMesg'];
									
								} else {
									//-- Extract the User Id --//
									$iWatchInputsUserId = $aTempResult5C['LastId'];
									
									//-- Give the user address --//
									$aTempResult5D = DB_InsertUserAddress( $sPostDatabaseName, $iWatchInputsUserId, 1, 36, "", "0000", 1, "", "", "" );
									
									if( $aTempResult5D['Error']===true ) {
										$bError    = true;
										$iErrCode  = 7433;
										$sErrMesg .= "Error Code:'7433' \n";
										$sErrMesg .= "Problem inserting the UserAddress! \n";
										$sErrMesg .= $aTempResult5D['ErrMesg'];
										
									} else {
										//-- Extract the User Address Id --//
										$iWatchInputsUserAddressId = $aTempResult5D['LastId'];
									
										//-- Give the WatchInputs User special permission to the Hub --//
										$aTempResult5E = DB_InsertPermHub( $sPostDatabaseName, $iWatchInputsUserId, $iHubId );
										//$aTempResult5E1 = DB_InsertPermPremise( $sPostDatabaseName, $iWatchInputsUserId, $iPremiseId, 1, 1, 1, 1, 1 );
										
										
										if( $aTempResult5E['Error']===true ) {
											$bError    = true;
											$iErrCode  = 7434;
											$sErrMesg .= "Error Code:'7434' \n";
											$sErrMesg .= "Problem granting the \"WatchInputs\" user permission to the hub! \n";
											$sErrMesg .= $aTempResult5E['ErrMesg'];
											
										} else {
											//-- Extract the User Id --//
											$iWatchInputsPermHubId = $aTempResult5E['LastId'];
											
										}
									}
								}
							}
						}
					}	//-- ENDIF No errors have occurred --//
					
					
					if( $bError===false ) {
						//----------------------------//
						//-- PREPARE THE RESULTS    --//
						//----------------------------//
						$aResult = array(
							"Error"     => false,
							"Data"      => array(
								"UserInfoId"        => $iUserInfoId,
								"UserId"            => $iUserId,
								"PremiseInfoId"     => $iPremiseInfoId,
								"PremiseId"         => $iPremiseId,
								"PermPremiseId"     => $iPermissionId,
								"PermServerId"      => $iPermissionId,
								"HubId"             => $iHubId,
								"WatchInputsUserId" => $iWatchInputsUserId
							)
						);
					}
					
				//----------------------------------------------------//
				//-- 5.7.3.6.B - ELSEIF Type is "NewPremise"        --//
				//----------------------------------------------------//
				} else if( $aPostData['InsertType']==="NewPremise" ) {
					
					
					
				//----------------------------------------------------//
				//-- 5.7.3.6.C - ELSEIF Type is "NewHub"            --//
				//----------------------------------------------------//
				} else if( $aPostData['InsertType']==="NewHub" ) {
					
					
					
				//----------------------------------------------------//
				//-- 5.7.3.6.D - ELSE Error                         --//
				//----------------------------------------------------//
				} else {
					//-- ERROR: Unsupported "InsertType" --//
					$bError = true;
					$iErrCode  = 7599;
					$sErrMesg .= "Error Code:'7599' \n";
					$sErrMesg .= "When attempting to 'InsertHub' an unsupported 'InsertType' was used! \n";
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
		$oRestrictedDB->dbEndTransaction();
		
	} else {
		//-- Rollback changes --//
		$oRestrictedDB->dbRollback();
	}
}


//====================================================================//
//== 9.0 - FINALISE                                                 ==//
//====================================================================//

//----------------------------------------//
//-- IF API didn't encounter an Error   --//
//----------------------------------------//
if( $bError===false && $aResult!=false ) {
	try {
		//-- Force the page to JSON --//
		header("Access-Control-Allow-Origin: *");
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
//-- ELSE API Error has occurred        --//
//----------------------------------------//
} else {
	//-- Set the page to JSON when an error. Note this can be changed to "text/html" or "test/plain". --//
	header("Access-Control-Allow-Origin: *");
	header('Content-Type: application/json');
	
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
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 4,
			"ErrMesg" => "Error Code:'0004' \n Critical Error has occured!"
		);
		$sOutput = json_encode( $aResult );
	}
	
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