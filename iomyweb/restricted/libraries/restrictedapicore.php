<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is the core component that allows a User access to the iOmy Database.
//==         It handles logging in/out of the database as well as well as loading required PHP Libraries
//==         so that the required PHP APIs and Odata Services have their requirements
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



//========================================//
//== TODO LIST                          ==//
//========================================//
//-- *  Make a php object in order to better protect the variables that are contained in here                   --//
//-- ** NOTE: Unset the configuration variables that are only used to setup the "RestrictedAPICore" that        --//
//--        setup the object to help protect the "RestrictedAPIs" section against php attacks.                  --//


//========================================================================================================//
//== #1.0# - INITIALSE                                                                                  ==//
//========================================================================================================//

//------------------------------------------------//
//-- #1.1# - Configure Variables                --//
//------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


$aRestrictedApiCore                     = array();
$aRestrictedApiCore['DBId']             = 0;            //-- INTEGER:	The database defined in the iomy_vanilla.php file to attempt to login to.	--//
$aRestrictedApiCore['LoginResult']      = false;        //-- BOOLEAN:	This is used to flag if the User succeeded in loggin in. --//
$aRestrictedApiCore['ValidSession']     = false;        //-- BOOLEAN:	This is used to flag if the User has a valid session. Default is set to false --//
$aRestrictedApiCore['RestrictedDB']     = false;        //-- BOOLEAN:	This is used to flag if there is a Restricted Database Connection. Default is set to false --//

//------------------------------------------------//
//-- #1.2# - Load Required Libraries            --//
//------------------------------------------------//
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/constants.php';
require_once SITE_BASE.'/restricted/libraries/encryption_advanced.php';
require_once SITE_BASE.'/restricted/libraries/dbmysql.php';
require_once SITE_BASE.'/restricted/libraries/functions.php';
require_once SITE_BASE.'/restricted/libraries/userauth.php';


//------------------------------------------------//
//-- #1.3# - Setup Objects                      --//
//------------------------------------------------//

//-- Setup the Encryption Object --//
$oAdvEncryption = new TestEncryption(MCRYPT_BLOWFISH, MCRYPT_MODE_CBC, 10000, $Config['Core']['CryptKey']);


//------------------------------------------------//
//-- #1.4# - PHP Session                        --//
//------------------------------------------------//
session_start();


//========================================================================================================//
//== #2.0# - DECIDE WHAT TO DO                                                                          ==//
//========================================================================================================//


//--------------------------------------------------------------------//
//-- 2.1.A - If the User attempting to login                        --//
//--------------------------------------------------------------------//
if( isset($_POST['AttemptLogin']) && $_POST['AttemptLogin']==true) {
	$iDBId = $aRestrictedApiCore['DBId'];
	
	
	
	//--------------------------------------------------------------------//
	//-- STEP 1: Perform Checks on the Login                            --//
	//--------------------------------------------------------------------//
	//-- This makes sure that a blacklisted parameter is not used --//
	$bValidParameter = userauth_checkparameters( $_POST['username'], $_POST['password'] );
	
	
	//--------------------------------------------------------------------//
	//-- STEP 2 - If valid then attempt a connection to the database    --//
	//--------------------------------------------------------------------//
	if( $bValidParameter===true ) {
		
		$oRestrictedDB = new DBMySQL(
			$Config['DB'][$iDBId],
			$_POST['username'],
			$_POST['password']
		);
		//-- 2.1.A.2.2: Check if the DB connection succeeded --//
		if( $oRestrictedDB->Initialised===true ) {
			//----------------------------------//
			//-- LOGIN ATTEMPT WAS SUCCESSFUL --//
			//----------------------------------//
			
			//-- STORE THE USER DETAILS IN THE SESSION INFORMATION --//
			$_SESSION['User']                   = array();
			$_SESSION['User'][SESSION_LOGGEDIN] = true;
			$_SESSION['User'][SESSION_LASTON]   = time();
			$_SESSION['User'][SESSION_USER]     = $oAdvEncryption->encrypt($_POST['username']);
			$_SESSION['User'][SESSION_PASSWORD] = $oAdvEncryption->encrypt($_POST['password']);
			$_SESSION['User'][SESSION_IP]       = getenv( "REMOTE_ADDR" );
			
			//-- FLAG THAT THE LOGIN ATTEMPT IS SUCCESSFUL --//
			$aRestrictedApiCore['LoginResult']  = true;
			//-- FLAG THAT THERE IS ACCESS TO THE RESTRICTED DATABASE --//
			$aRestrictedApiCore['RestrictedDB'] = true;
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "DB_Connection!"; }
			
		} else {
			//-- LOGIN ATTEMPT HAD AN ERROR --//
			$aRestrictedApiCore['LoginResult'] = false;
			
			sleep(1);
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "DB_Rejection!"; }
		}
	}
	//--------------------------------------------------------------------//
	//-- STEP 3: CLEANUP VARIABLES                                      --//
	//--------------------------------------------------------------------//
	$_POST['username'] = "";
	$_POST['password'] = "";
	
	
//--------------------------------------------------------------------//
//-- 2.1.B - ELSEIF check if the User is logged in                  --//
//--------------------------------------------------------------------//
} else {
	//--------------------------------------------------------------------//
	//-- VERIFICATION STEP 1: Is the User Session's Info setup          --//
	//--------------------------------------------------------------------//
	if( isset($_SESSION['User'][SESSION_LOGGEDIN]) ) {
		//--------------------------------------------------------------------//
		//-- VERIFICATION STEP 2: Is the User flagged as logged in          --//
		//--------------------------------------------------------------------//
		if( $_SESSION['User'][SESSION_LOGGEDIN]===true ) {
			
			//-- Get the Users --//
			$iCurrentIP = getenv("REMOTE_ADDR");
			
			//---------------------------------------------------------------------//
			//-- VERIFICATION STEP 3: Is the User still using the same ipaddress --//
			//---------------------------------------------------------------------//
			if( isset($_SESSION['User'][SESSION_IP]) ) {
				if( $_SESSION['User'][SESSION_IP]===$iCurrentIP ) {
					//-- 
					$dSessionExpirary = time() - SESSION_LOGOUTTIME;
					
					//--------------------------------------------------------------------//
					//-- VERIFICATION STEP 4: Check if Session has expired              --//
					//--------------------------------------------------------------------//
					if( isset($_SESSION['User'][SESSION_LASTON]) && $_SESSION['User'][SESSION_LASTON]>=($dSessionExpirary) ) {
						//-- Set last update to the current time --//
						$_SESSION['User'][SESSION_LASTON] = time();
						
						//----------------------------------------------------------------------//
						//-- VERIFICATION STEP 5: Is the Username and Password in the session --//
						//----------------------------------------------------------------------//
						if( isset($_SESSION['User'][SESSION_USER]) && isset($_SESSION['User'][SESSION_PASSWORD]) ) {
							//--------------------------------------------------------------------//
							//-- VERIFICATION STEP 6: Is the Username and Password valid        --//
							//--------------------------------------------------------------------//
							if( (trim($_SESSION['User'][SESSION_USER])!=="" ) && (trim($_SESSION['User'][SESSION_PASSWORD])!=="") ) {
								//----------------------------------------------------------------------------------//
								//-- VERIFICATION STEP 7: Connect to the Database using the decrypted credentials --//
								//----------------------------------------------------------------------------------//
								$iDBId = $aRestrictedApiCore['DBId'];
								
								$oRestrictedDB = new DBMySQL(
									$Config['DB'][$iDBId], 
									$oAdvEncryption->decrypt($_SESSION['User'][SESSION_USER]),
									$oAdvEncryption->decrypt($_SESSION['User'][SESSION_PASSWORD])
								);
								//--------------------------------------------------------------------//
								//-- VERIFICATION STEP 8: Check if the DB connection succeeded      --//
								//--------------------------------------------------------------------//
								if( $oRestrictedDB->Initialised===true ) {
									//-- Flag that the session is valid so that the session won't be purged --//
									$aRestrictedApiCore['ValidSession'] = true;
									$aRestrictedApiCore['RestrictedDB'] = true;
									
									//-- DEBUGGING --//
									if( $Config['Debug']['restrictapicore_login']===true ) { echo "API Access Granted!"; }
								}
							}
						}
					} else {
						//-- DEBUGGING --//
						if( $Config['Debug']['restrictapicore_login']===true ) { echo "Session over 15 minutes!"; }
					}
				}
			}
			unset($iCurrentIP);
		}
	}
}


//========================================================================================================//
//== #3.0# - IF ANYTHING WENT WRONG THEN PURGE THE SESSION                                              ==//
//========================================================================================================//
if( $aRestrictedApiCore['ValidSession']===false && $aRestrictedApiCore['LoginResult']===false ) {
	
	//-- PURGE THE SESSION INFORMATION --//
	userauth_logout();
	
}


//-- Mark that all changes to the Session are completed --//
session_write_close();


//========================================================================================================//
//== #4.0# - API FUNCTIONS                                                                              ==//
//========================================================================================================//

//-- This function is for checking if the User's supplied Password matches what is in the session		--//
function VerifyUserPassword($sCurrentPassword) {
	global $oAdvEncryption;
	
	if( gettype($sCurrentPassword)==="string" ) {
		if( $oAdvEncryption->decrypt($_SESSION['User'][SESSION_PASSWORD])===$sCurrentPassword ) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
	
}













?>