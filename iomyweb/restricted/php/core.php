<?php
//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is included in the APIs to setup the RestrictedAPICore and add any required libraries.
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
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';


//------------------------------------------------//
//-- #1.3# - Setup Variables                    --//
//------------------------------------------------//
$oRestrictedApiCore         = null;     //-- OBJECT:    This is the variable that the APIs use to.  --//





//========================================================================================================//
//== #1.0# - CREATE RESTRICTEDAPICORE OBJECT                                                            ==//
//========================================================================================================//

//-- If the Cconfig file is setup --//
if( isset( $Config ) ) {
	//-- Create the Object --//
	$oRestrictedApiCore = new RestrictedAPICore( $Config );
	
	//-- Check if there is a Database Connection --//
	if( $oRestrictedApiCore->bRestrictedDB===false ) {
		userauth_rejected();
	}
	
} else {
	//-- FLAG AN ERROR: So that the APIs themselves know that --//
	//$bError    = true;
	//$iErrCode   = 3;
	//$sErrMesg  .= "Error Code:'0003' \n";
	//$sErrMesg  .= "This system isn't setup at the moment!\n";
	//$sErrMesg  .= "If this system hasn't been used before please run the 'First Run Wizard' for this system to set it up.\n";
	userauth_noconfig();
}






?>