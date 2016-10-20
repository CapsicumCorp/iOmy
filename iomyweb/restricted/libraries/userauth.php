<?php


//========================================================================================================//
//== @Created on: 11/12/2008
//== @Author(s): Matthew Stapleton <matthew@capsicumcorp.com>
//==             Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a standard Capsicum Corp Website file used for authentication.
//==         This file has been modified by Andrew Somerville to be used in iOmy on 19/10/2015.
//== @Copyright: Capsicum Corporation 2008-2016
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


//-- Define the SITE_BASE variable --//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//========================================================================================================//
//== #1.0# - DECLARE VARIABLES & INITIALSE                                                              ==//
//========================================================================================================//
$realm = "IOMy";



//========================================================================================================//
//== #3.0# - LOGOUT & LOGIN FUNCTIONS                                                                   ==//
//========================================================================================================//



//----------------------------------------------------------------------------//
//-- #3.1# - LOGOUT FUNCTION                                                --//
//----------------------------------------------------------------------------//
//-- Description: Logout a user by wiping all session data                  --//
//----------------------------------------------------------------------------//
function userauth_logout() {

	//-- Unset all of the session variables --//
	$_SESSION = array();
	
	//-- If it's desired to kill the session, also delete the session cookie	--//
	//-- Note: This will destroy the session, and not just the session data!	--//
	if( isset( $_COOKIE[session_name()] ) ) {
		setcookie(session_name(), '', time()-42000, '/');
	}
	
	//-- Finally, destroy the session --//
	session_destroy();
	
	return true;
}


//----------------------------------------------------------------------------//
//-- #3.2# - LOGIN PARAMETER CHECK FUNCTION                                 --//
//----------------------------------------------------------------------------//
function userauth_checkparameters( $sUname, $sPword ) {
	//------------------------------------------------//
	//-- 1.0 - Initialise Variables                 --//
	//------------------------------------------------//
	
	//-- 1.1 - Declare global variables --//
	global $Config, $oAdvEncryption;
	
	//-- 1.2 - --//
	$bAbortLogin = false;			//-- BOOLEAN: Flag used to indicate to not continue down the path of attempting to login --//
	
	//----------------------------------------------------------------------------------//
	//-- 2.0 - Check to see if the username has a space at the start or the end of it --//
	//----------------------------------------------------------------------------------//
	if( $bAbortLogin===false ) {
		
		//-- Uname --//
		$sTest = trim($sUname);
		if( empty($sTest)===true ) {
			
			//-- Flag that the uname is invalid --//
			$bAbortLogin = true;
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "No Username or Password!"; }
		}
		
		//-- Pword --//
		$sTest = trim($sPword);
		if( empty($sTest)===true ) {
			//-- Flag that the pword is invalid --//
			$bAbortLogin = true;
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "No Username or Password!"; }
		}
		
		//-- Empty the sTest Variable --//
		$sTest = "";
		unset($sTest);
	}
	
	//----------------------------------------------------------------------------------//
	//-- 3.0 - Check to see if the username has a space at the start or the end of it --//
	//----------------------------------------------------------------------------------//
	if( $bAbortLogin===false ) {
		
		//-- Check to see if the Username has a space on the start or end --//
		$bValidUname1 = preg_match('((?=^)(\s*))', $sUname);
		$bValidUname2 = preg_match('((\s*)(?>$))', $sUname);
		
		if( $bValidUname1===0 || $bValidUname1===2 ) {
			//-- Flag that the uname is invalid --//
			//$bAbortLogin = true;
			//-- DEBUGGING --//
			
			//if( $Config['Debug']['restrictapicore_login']===true ) { echo "Space at the start or end of the Username!"; }
		}
	}
	
	//----------------------------------------------------------------------------------//
	//-- 4.0 - Check to see if the username has symbols in it                         --//
	//----------------------------------------------------------------------------------//
	if( $bAbortLogin===false ) {
		$bValidUname = preg_match('/[a-zA-Z0-9\s]+/', $sUname);

		if( $bValidUname===0 ) {
			//-- Flag that the uname is invalid --//
			$bAbortLogin = true;
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "Symbols in Name!"; }
		}
	}
	
	//----------------------------------------------------------------------------------//
	//-- 5.0 - Check to see if the username is in the list of blacklisted names       --//
	//----------------------------------------------------------------------------------//
	if( $bAbortLogin===false ) {
		$sLUname = strtolower($sUname);
		if( $sLUname==="root" || $sLUname==="admin" || $sLUname==="administrator" || $sLUname==="sys" || $sLUname==="manager" ) {
			
			//-- Flag that the login shouldn't be attempted --//
			$bAbortLogin = true;
			
			//-- Penalise the attempted login further. This is due to the fact that the username they entered is common database Admin account and it is insulting that they thought we would leave those usernames exposed --//
			sleep(1);
			
			//-- DEBUGGING --//
			if( $Config['Debug']['restrictapicore_login']===true ) { echo "Insulting Username!"; }
		}
	}
	
	//----------------------------------------------------------------------------------//
	//-- 6.0 - Cleanup variables                                                      --//
	//----------------------------------------------------------------------------------//
	$sUname = "";
	$sPword = "";
	unset($sUname);
	unset($sPword);
	
	//----------------------------------------------------------------------------------//
	//-- 7.0 - Return the Results                                                     --//
	//----------------------------------------------------------------------------------//
	if($bAbortLogin===false) {
		return true;
	} else {
		return false;
	}
}







//----------------------------------------------------------------------------//
//-- #?.1# - AUTHENTICATION MESSAGE FUNCTION								--//
//----------------------------------------------------------------------------//
//-- Description: Default Error Message to display							--//
//----------------------------------------------------------------------------//
function displayAuthMessage() {
	global $realm;
	
	header('WWW-Authenticate: Basic realm="' . $realm . '"');
	header('HTTP/1.0 401 Unauthorized');
	echo '<html><head><title>401 Authorization Required</title></head><body><h1>Authorization Required</h1></body></html>';
}








?>