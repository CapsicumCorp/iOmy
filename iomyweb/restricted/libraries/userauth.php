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
$userauth_realm = "IOMy";


//========================================================================================================//
//-- #2.0# - CUSTOM HTTP RESPONSE PAGE FUNCTIONS                                                        --//
//========================================================================================================//
function userauth_rejected() {
	header('HTTP/1.0 403 Forbidden');
	//http_response_code ( 403 );
	echo "<html>\n";
	echo "<head><title>403 - Forbidden</title></head>\n";
	echo "<body>\n";
	echo "<h1>403 - Forbidden</h1>\n";
	echo "<p>Invalid Credentials!</p>\n";
	echo "<p>Please sign in with valid credentials to a valid login API to continue.</p>\n";
	echo "</body>\n";
	echo "</html>\n";
	die();
}

function userauth_noconfig() {
	header('HTTP/1.0 501 Not Implemented');
	//http_response_code ( 403 );
	echo "<html>\n";
	echo "<head><title>501 - iOmy Server Not Deployed</title></head>\n";
	echo "<body>\n";
	echo "<h1>501 - iOmy Server Not Deployed</h1>\n";
	echo "<p>Please try setting up the server before accessing this API!</p>\n";
	echo "</body>\n";
	echo "</html>\n";
	die();
}


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
	
	//-- If it's desired to kill the session, also delete the session cookie --//
	//-- Note: This will destroy the session, and not just the session data! --//
	if( isset( $_COOKIE[session_name()] ) ) {
		setcookie(session_name(), '', time()-42000, '/');
	}
	
	//-- Finally, destroy the session --//
	session_destroy();
	
	return true;
}





function AlphaNumericCheck( $sString ) {
	//-- Checks if a string has non alphanumeric characters and returns false if it finds anything non-alphanumeric --//
	$iMatch = preg_match('/[^a-zA-Z0-9\s]+/', $sString);
	
	if( $iMatch===0 ) {
		return true;
	} else {
		return false;
	}
}


function userauth_usernameblacklistcheck( $sUsername ) {
	//-- This function is used for checking to see if a username is blacklisted is not --//
	
	$sLowerUsername = strtolower($sUsername);
	if( $sLowerUsername==="root" || $sLowerUsername==="admin" || $sLowerUsername==="administrator" || $sLowerUsername==="sys" || $sLowerUsername==="manager" ) {
		return true;
	} else {
		return false;
	}
}





?>