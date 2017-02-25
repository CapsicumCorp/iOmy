<?php
//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is used to indicate if a user is logged in or not.
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




//========================================================================================================//
//== #1.0# - INITIALSE                                                                                  ==//
//========================================================================================================//

//------------------------------------------------//
//-- #1.1# - Configure SITE_BASE                --//
//------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//------------------------------------------------//
//-- #1.2# - Load Required Libraries            --//
//------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';


//------------------------------------------------//
//-- #1.3# - Configure normal variables         --//
//------------------------------------------------//
$aResult        = array();      //-- ARRAY:     Used to store the results of a function --//
$aReturn        = array();      //-- ARRAY:     Used to return the results to the User --//
$bFailedLogin   = false;        //-- BOOLEAN:   Used to indicate if a login attempt failed --//



if( isset( $Config ) ) {
	//----------------------------------------------------------------//
	//-- Create the Object                                          --//
	//----------------------------------------------------------------//
	$oRestrictedApiCore = new RestrictedAPICore( $Config );
	
	//----------------------------------------------------------------//
	//-- 
	//----------------------------------------------------------------//
	
	//-- Check if the User attempted to login to the database --// 
	if( isset($_POST['AttemptLogin']) && $_POST['AttemptLogin']==true ) {
		if( $oRestrictedApiCore->bLoginResult===false ) {
			//-- Flag that the Login failed --//
			$bFailedLogin = true;
			
			if( $oRestrictedApiCore->bDebugging===true ) {
				//-- Prepare the array with the data to be returned --//
				$aReturn = array( 
					"login"=>false,
					"ErrCode"=>"0001",
					"ErrMesg"=>$oRestrictedApiCore->sDebugMessage
				);
			} else {
				//-- Prepare the array with the data to be returned --//
				$aReturn = array( 
					"login"=>false,
					"ErrCode"=>"0001",
					"ErrMesg"=>"Login attempt was unsuccessful!"
				);
			}
		}
	}
	
	//----------------------------------------------------------------//
	//-- IF The user hasn't attempted to login                      --//
	//----------------------------------------------------------------//
	
	//-- IF	a failed login attempt hasn't occurred --//
	if( $bFailedLogin===false ) {
		//-- IF	the user has access to the restricted database --//
		if( $oRestrictedApiCore->bRestrictedDB===true ) {
		
			$aResult = GetCurrentUserDetails();
			
			if( $aResult['Error']===false ) {
				//-- Debugging --//
				//var_dump($oRestrictedDB->QueryLogs);
				//echo "\n";
				//var_dump($aResult);
				//echo "\n";
				
				$aReturn = array( 
					"login"             => true, 
					"Username"          => $aResult['Data']['Username'], 
					"UserId"            => $aResult['Data']['UserId'],
					"ServerDBVer"       => $oRestrictedApiCore->CheckDBVersion(),
					"ServerDemoMode"    => $oRestrictedApiCore->CheckIfDemoMode()
				);
				
			} else {
				//-- An Error occurred so return false --//
				$aReturn = array( 
					"login"=>false,
					"ErrCode"=>"0002",
					"ErrMesg"=>"Cannot access the User's Data!\nPlease check with the database administrator(s) to see if they have setup your account properly."
				);
			}
			
		//-- ELSE	The user doesn't have access to the restricted database --//
		} else {
			//-- No connection to the Restricted Database --//
			if( $oRestrictedApiCore->bDebugging===true ) {
				//-- Prepare the array with the data to be returned --//
				$aReturn = array( 
					"login"=>false,
					"ErrCode"=>"0000",
					"ErrMesg"=>$oRestrictedApiCore->sDebugMessage
				);
			} else {
				//-- Prepare the array with the data to be returned --//
				$aReturn = array( 
					"login"=>false, 
					"ErrCode"=>"0000",
					"ErrMesg"=>"User is not logged in!"
				);
			}
		}
	}
	
} else {
	
	//----------------------------------------------------------------//
	//-- THE SYSTEM IS NOT SETUP                                    --//
	//----------------------------------------------------------------//
	$aReturn = array( 
		"login"=>false, 
		"ErrCode"=>"0003",
		"ErrMesg"=>"Server is not deployed!"
	);
	
	
	
}

//========================================================================================================//
//== #2.0# - Check if the User is logged in                                                             ==//
//========================================================================================================//






//========================================================================================================//
//== #9.0# - OUTPUT THE RESULTS                                                                         ==//
//========================================================================================================//

header('Content-type: application/json');
echo json_encode($aReturn);


?>