<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for editing User Information or changing the user's password.
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
//== 1.0 - INITIALISE                                               ==//
//====================================================================//

if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        Used to hold this API Request's body when everything is successful.	--//
$aResult                    = array();      //-- ARRAY:         Used to store the results. --//

$aRequiredParameters        = array();      //-- ARRAY:         Used to store an array of which HTTP POST Parameters to collect and what type to format them to. --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//

$sPostTitle                 = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$sPostGivennames            = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$sPostSurname               = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$sPostDisplayname           = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$sPostEmail                 = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$sPostPhoneNumber           = "";           //-- STRING:        Used to store one of the "User Information" HTTP POST Parameters. --//
$iPostGender                = 0;            //-- INTEGER:       --//
$sPostAddressLine1          = "";           //-- STRING:        Used to store the desired "User Address Line 1". --//
$sPostAddressLine2          = "";           //-- STRING:        Used to store the desired "User Address Line 2". --//
$sPostAddressLine3          = "";           //-- STRING:        Used to store the desired "User Address Line 3". --//
$sPostAddressPostalLine1    = "";           //-- STRING:        Used to store the desired "User Address Line 1". --//
$sPostAddressPostalLine2    = "";           //-- STRING:        Used to store the desired "User Address Line 2".   --//
$sPostAddressPostalLine3    = "";           //-- STRING:        Used to store the desired "User Address Line 3".   --//
$iPostAddressCountry        = 0;            //-- INTEGER:       Used to store the desired "User Address Country".  --//
$iPostAddressStateProvince  = 0;            //-- INTEGER:       Used to store the desired "User Address State".    --//
$iPostAddressPostcode       = 0;            //-- INTEGER:       Used to store the desired "User Address Postcode". --//
$iPostAddressTimezone       = 0;            //-- INTEGER:       Used to store the desired "User Address Timezone". --//
$iPostAddressLanguage       = 0;            //-- INTEGER:       Used to store the desired "User Address Language". --//

$sPostOldPassword           = "";           //-- STRING:        Used to store one of the "Change Password" HTTP POST Parameters. --//
$sPostNewPassword           = "";           //-- STRING:        Used to store one of the "Change Password" HTTP POST Parameters. --//
$sPostData                  = "";           //-- STRING:        Used to store the "Data" HTTP POST Parameter while in JSON string form. --//
$aPostData                  = array();      //-- ARRAY:         Used to store the "Data" HTTP POST Parameter while in JSON array form. --//

$aUserInfo                  = array();      //-- ARRAY:         Used to store the "User Information" that most modes in this API depend on.  --//
$aUserServerPermissions     = array();      //-- ARRAY:         --//

$bTransactionStarted        = false;        //-- BOOLEAN:       Used to indicate if a transaction has been started --//
$sDBUsername                = "";           //-- STRING:        --//
$sDBPassword                = "";           //-- STRING:        --//
$sDBURI                     = "";           //-- STRING:        --//
$iUserId                    = 0;            //-- INTEGER:       --//
$sUserLocation              = "";           //-- STRING:        --//

$iLogNowUTS                 = 0;            //-- INTEGER:       --//
$iPresetLogId               = 0;            //-- INTEGER:       --//
$sLogCustom1                = "";           //-- STRING:        Special variable for the User Log. --//

//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';		//-- This should call all the additional libraries needed --//


//------------------------------------------------------------//
//-- 1.4 - Flag an Error is there is no Database access     --//
//------------------------------------------------------------//
if( $oRestrictedApiCore->bRestrictedDB===false ) {
	$bError    = true;
	$sErrMesg .= "Can't access the database! User may not be logged in";
}

//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$aRequiredParameters = array(
		array( "Name"=>'Mode',                  "DataType"=>'STR' ),
		array( "Name"=>'Title',                 "DataType"=>'STR' ),
		array( "Name"=>'Givennames',            "DataType"=>'STR' ),
		array( "Name"=>'Surnames',              "DataType"=>'STR' ),
		array( "Name"=>'Displayname',           "DataType"=>'STR' ),
		array( "Name"=>'Email',                 "DataType"=>'STR' ),
		array( "Name"=>'Phone',                 "DataType"=>'STR' ),
		array( "Name"=>'Gender',                "DataType"=>'INT' ),
		array( "Name"=>'DoB',                   "DataType"=>'STR' ),
		array( "Name"=>'AddressLine1',          "DataType"=>'STR' ),
		array( "Name"=>'AddressLine2',          "DataType"=>'STR' ),
		array( "Name"=>'AddressLine3',          "DataType"=>'STR' ),
//		array( "Name"=>'AddressPostalLine1',    "DataType"=>'STR' ),
//		array( "Name"=>'AddressPostalLine2',    "DataType"=>'STR' ),
//		array( "Name"=>'AddressPostalLine3',    "DataType"=>'STR' ),
		array( "Name"=>'AddressCountry',        "DataType"=>'INT' ),
		array( "Name"=>'AddressStateProvince',  "DataType"=>'INT' ),
		array( "Name"=>'AddressPostcode',       "DataType"=>'INT' ),
		array( "Name"=>'AddressTimezone',       "DataType"=>'INT' ),
		array( "Name"=>'AddressLanguage',       "DataType"=>'INT' ),
		array( "Name"=>'OldPassword',           "DataType"=>'STR' ),
		array( "Name"=>'NewPassword',           "DataType"=>'STR' ),
		array( "Name"=>'Username',              "DataType"=>'STR' ),
		array( "Name"=>'Data',                  "DataType"=>'STR' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($aRequiredParameters);
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
		//-- NOTE: Valid modes are going to be "EditUserInfo", "EditUserAddress", "EditPassword", "AddUser" --//
		
		//-- Verify that the mode is supported --//
		//if( $sPostMode!=="EditUserInfo" && $sPostMode!=="EditUserAddress" && $sPostMode!=="EditPassword" && $sPostMode!=="AddUser" ) {
		if( $sPostMode!=="EditUserInfo" && $sPostMode!=="EditUserAddress" && $sPostMode!=="EditPassword" && $sPostMode!=="AddUser" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter.\n";
			$sErrMesg .= "eg. \n \"EditUserInfo\", \"EditUserAddress\" or \"EditPassword\". \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"EditUserInfo\", \"EditUserAddress\" or \"EditPassword\". \n\n";
		//sErrMesg .= e0011.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2.A - Retrieve User Info "Title"           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Title" --//
				$sPostTitle = $aHTTPData["Title"];
				
				if( $sPostTitle===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"Title\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Title\" parameter\n";
				}
			} catch( Exception $e0104 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"Title\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Title\" parameter\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve User Info "Givenname"       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Givennames" --//
				$sPostGivennames = $aHTTPData["Givennames"];
				
				if( $sPostGivennames===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"Givennames\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Givennames\" parameter\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Givennames\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Givennames\" parameter\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.4.A - Retrieve User Info "Surname"         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Surnames" --//
				$sPostSurname = $aHTTPData["Surnames"];
				
				if( $sPostSurname===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Invalid \"Surname\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Surname\" parameter\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"Surname\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Surname\" parameter\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5.A - Retrieve User Info "Displayname"     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Displayname" --//
				$sPostDisplayname = $aHTTPData["Displayname"];
				
				if( $sPostDisplayname===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Invalid \"Displayname\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Displayname\" parameter\n";
				}
			} catch( Exception $e0110 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"Displayname\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Displayname\" parameter\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.6.A - Retrieve User Info "Email"           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Email" --//
				$sPostEmail = $aHTTPData["Email"];
				
				if( $sPostEmail===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0111' \n";
					$sErrMesg .= "Invalid \"Email\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Email\" parameter\n";
				}
			} catch( Exception $e0112 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"Email\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Email\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.7.A - Retrieve User Info "Phone"           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Phone" --//
				$sPostPhoneNumber = $aHTTPData["Phone"];
				
				if( $sPostPhoneNumber===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0113' \n";
					$sErrMesg .= "Invalid \"Phone\" parameter!\n";
					$sErrMesg .= "Please use a valid \"Phone\" parameter.\n";
				}
			} catch( Exception $e0114 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"Phone\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Phone\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.8.A - Retrieve User Info "Gender"          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserInfo" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Gender" --//
				$iPostGender = $aHTTPData["Gender"];
				
				if( $iPostGender===false || !($iPostGender===1 || $iPostGender===2 || $iPostGender===3) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0115' \n";
					$sErrMesg .= "Invalid \"Gender\" parameter!\n";
					$sErrMesg .= "Please use a valid \"Gender\" parameter.\n";
				}
			} catch( Exception $e0116 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"Gender\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Gender\" parameter.\n";
			}
		}
	}
	
	
	if( $bError===false ) {
		if( $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the Day of Birth --//
				$sPostDoB = $aHTTPData["DoB"];
				
				if( $sPostDoB===false || !( strlen( $sPostDoB )>6 ) ) {
					$sPostDoB = "1980-01-01";
				}
			} catch( Exception $e0116 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"DoB\" parameter!\n";
				$sErrMesg .= "Please use a valid \"DoB\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- "Edit User Address" Mode specific parameters   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditUserAddress" || $sPostMode==="AddUser" ) {
			//----------------------------------------------------//
			//-- 2.2.2.B - Retrieve User Address Line 1         --//
			//----------------------------------------------------//
			try {
				//-- Retrieve the "Address Line 1" --//
				$sPostAddressLine1 = $aHTTPData["AddressLine1"];
				
				if( $sPostAddressLine1===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0117' \n";
					$sErrMesg .= "Non numeric \"AddressLine1\" parameter! \n";
					$sErrMesg .= "Please use a valid \"AddressLine1\" parameter\n";
				}
			} catch( Exception $e0118 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"AddressLine1\" parameter!\n";
				$sErrMesg .= "Please use a valid \"AddressLine1\" parameter\n";
			}
			
			//----------------------------------------------------//
			//-- 2.2.3.B - Retrieve User Address Line 2         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 2" --//
					$sPostAddressLine2 = $aHTTPData["AddressLine2"];
					
					if( $sPostAddressLine2===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0119' \n";
						$sErrMesg .= "Non numeric \"AddressLine2\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
					}
				} catch( Exception $e0120 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0120' \n";
					$sErrMesg .= "Incorrect \"AddressLine2\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.4.B - Retrieve User Address Line 3         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 3" --//
					$sPostAddressLine3 = $aHTTPData["AddressLine3"];
					
					if( $sPostAddressLine3===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0121' \n";
						$sErrMesg .= "Non numeric \"AddressLine3\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLine3\" parameter\n";
					}
				} catch( Exception $e0122 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0122' \n";
					$sErrMesg .= "Incorrect \"AddressLine3\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLine3\" parameter\n";
				}
			}
			
			
			
/*
			//----------------------------------------------------//
			//-- 2.2.5.B - Retrieve User Address Line 1         --//
			//----------------------------------------------------//
			try {
				//-- Retrieve the "Address Line 1" --//
				$sPostAddressPostalLine1 = $aHTTPData["AddressPostalLine1"];
				
				if( $sPostAddressPostalLine1===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0123' \n";
					$sErrMesg .= "Non numeric \"AddressPostalLine1\" parameter! \n";
					$sErrMesg .= "Please use a valid \"AddressPostalLine1\" parameter\n";
				}
			} catch( Exception $e0124 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0124' \n";
				$sErrMesg .= "Incorrect \"AddressPostalLine1\" parameter!\n";
				$sErrMesg .= "Please use a valid \"AddressPostalLine1\" parameter\n";
			}
			
			//----------------------------------------------------//
			//-- 2.2.6.B - Retrieve User Address Line 2         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 2" --//
					$sPostAddressPostalLine2 = $aHTTPData["AddressPostalLine2"];
					
					if( $sPostAddressPostalLine2===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0125' \n";
						$sErrMesg .= "Non numeric \"AddressPostalLine2\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressPostalLine2\" parameter\n";
					}
				} catch( Exception $e0126 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0126' \n";
					$sErrMesg .= "Incorrect \"AddressPostalLine2\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressPostalLine2\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.7.B - Retrieve User Address Line 3         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 3" --//
					$sPostAddressPostalLine3 = $aHTTPData["AddressPostalLine3"];
					
					if( $sPostAddressPostalLine3===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0127' \n";
						$sErrMesg .= "Non numeric \"AddressPostalLine3\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressPostalLine3\" parameter\n";
					}
				} catch( Exception $e0128 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0128' \n";
					$sErrMesg .= "Incorrect \"AddressPostalLine3\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressPostalLine3\" parameter\n";
				}
			}
*/

			//----------------------------------------------------//
			//-- 2.2.8.B - Retrieve User Address Country        --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Country" --//
					$iPostAddressCountry = $aHTTPData["AddressCountry"];
					
					if( $iPostAddressCountry===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0129' \n";
						$sErrMesg .= "Non numeric \"AddressCountry\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressCountry\" parameter\n";
					}
				} catch( Exception $e0130 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0130' \n";
					$sErrMesg .= "Incorrect \"AddressCountry\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressCountry\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.9.B - Retrieve User Address Province       --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Province" --//
					$iPostAddressStateProvince = $aHTTPData["AddressStateProvince"];
					
					if( $iPostAddressStateProvince===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0131' \n";
						$sErrMesg .= "Non numeric \"AddressStateProvince\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressStateProvince\" parameter\n";
					}
				} catch( Exception $e0132 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0132' \n";
					$sErrMesg .= "Incorrect \"AddressStateProvince\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressStateProvince\" parameter\n";
				}
			}
			
			
			//----------------------------------------------------//
			//-- 2.2.10.B - Retrieve User Address Postcode      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Postcode" --//
					$iPostAddressPostcode = $aHTTPData["AddressPostcode"];
					
					if( $iPostAddressPostcode===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0133' \n";
						$sErrMesg .= "Non numeric \"AddressPostcode\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressPostcode\" parameter\n";
					}
				} catch( Exception $e0134 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0134' \n";
					$sErrMesg .= "Incorrect \"AddressPostcode\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressPostcode\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.11.B - Retrieve User Address Timezone      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Timezone" --//
					$iPostAddressTimezone = $aHTTPData["AddressTimezone"];
					
					if( $iPostAddressTimezone===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0135' \n";
						$sErrMesg .= "Non numeric \"AddressTimezone\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressTimezone\" parameter\n";
					}
				} catch( Exception $e0136 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0136' \n";
					$sErrMesg .= "Incorrect \"AddressTimezone\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressTimezone\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.12.B - Retrieve User Address Language      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Language" --//
					$iPostAddressLanguage = $aHTTPData["AddressLanguage"];
					
					if( $iPostAddressLanguage===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0137' \n";
						$sErrMesg .= "Non numeric \"AddressLanguage\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLanguage\" parameter\n";
					}
				} catch( Exception $e0238 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0138' \n";
					$sErrMesg .= "Incorrect \"AddressLanguage\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLanguage\" parameter\n";
				}
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.2.C - Retrieve User Info "OldPassword"     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditPassword" ) {
			try {
				//-- Retrieve the "OldPassword" --//
				$sPostOldPassword = $aHTTPData["OldPassword"];
				
				if( $sPostOldPassword===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0139' \n";
					$sErrMesg .= "Invalid \"OldPassword\" parameter! \n";
					$sErrMesg .= "Please use a valid \"OldPassword\" parameter\n";
				}
			} catch( Exception $e0140 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0140' \n";
				$sErrMesg .= "Incorrect \"OldPassword\" parameter!\n";
				$sErrMesg .= "Please use a valid \"OldPassword\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.C - Retrieve User Info "NewPassword"     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditPassword" || $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "NewPassword" --//
				$sPostNewPassword = $aHTTPData["NewPassword"];
				
				if( $sPostNewPassword===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0141' \n";
					$sErrMesg .= "Invalid \"NewPassword\" parameter! \n";
					$sErrMesg .= "Please use a valid \"NewPassword\" parameter\n";
				}
			} catch( Exception $e0142 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0142' \n";
				$sErrMesg .= "Incorrect \"NewPassword\" parameter!\n";
				$sErrMesg .= "Please use a valid \"NewPassword\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.D - Retrieve User "Username"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Username" --//
				$sPostUsername = $aHTTPData["Username"];
				
				if( $sPostUsername===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0143' \n";
					$sErrMesg .= "Invalid \"Username\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Username\" parameter\n";
				}
			} catch( Exception $e0144 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0144' \n";
				$sErrMesg .= "Incorrect \"Username\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Username\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.E - Retrieve "Data" Array                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddUser" ) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
					//------------------------------------------------//
					//-- JSON Parsing                               --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 145;
						$sErrMesg .= "Error Code:'0145' \n";
						$sErrMesg .= "Invalid POST \"Data\"! \n";
						$sErrMesg .= "Couldn't extract JSON values from the \"Data\" parameter \n";
					}
					
				} else {
					$bError    = true;
					$iErrCode  = 145;
					$sErrMesg .= "Error Code:'0145' \n";
					$sErrMesg .= "Invalid POST \"Data\" parameter! \n";
					$sErrMesg .= "Please use a valid data in the \"Data\" parameter \n";
				}
			} catch( Exception $e0146 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0146' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter\n";
			}
		}
	}
}



//====================================================================//
//== 3.0 - PREPARATION                                              ==//
//====================================================================//
if( $bError===false ) {
	//----------------------------------------//
	//-- If Mode is Add User                --//
	//----------------------------------------//
	if( $sPostMode==="AddUser" ) {
		try {
			//-- Check if the User has Add User Permissions --//
			$aUserServerPermissions = GetUserServerPermissions();
			
			//-- Check for errors --//
			if( $aUserServerPermissions['Error']===false ) {
				//-- Check if the variable is set --//
				if( isset($aUserServerPermissions['Data']['PermServerAddUser']) ) {
					if( $aUserServerPermissions['Data']['PermServerAddUser']===1 ) {
						//------------------------------------------------//
						//-- Extract the DB Username and Password       --//
						//------------------------------------------------//
						if( isset($aPostData['Username']) && isset( $aPostData['Password']) ) {
							if( 
								$aPostData['Username']!==""		&& $aPostData['Password']!==""		&& 
								$aPostData['Username']!==false	&& $aPostData['Password']!==false	&& 
								$aPostData['Username']!==null	&& $aPostData['Password']!==null
							) {
								$sDBUsername = $aPostData['Username'];
								$sDBPassword = $aPostData['Password'];
								
								//-- URI --//
								if( isset($aPostData['URI']) ) {
									$sDBURI      = $aPostData['URI'];
								} else {
									$sDBURI      = "127.0.0.1";
								}
							} else {
								$bError    = true;
								$sErrMesg .= "Error Code:'4301' \n";
								$sErrMesg .= "Problem adding a new user!\n";
								$sErrMesg .= "Invalid Username or Password!\n";
							}
							
						} else {
							$bError    = true;
							$sErrMesg .= "Error Code:'4302' \n";
							$sErrMesg .= "Problem adding a new user!\n";
							$sErrMesg .= "Invalid Username or Password!\n";
						}
						
						//------------------------------------------------//
						//-- Create the DB Conn           --//
						//------------------------------------------------//
						
						
						
						//------------------------------------------------//
						//-- Open the secondary DB Connection           --//
						//------------------------------------------------//
						if( $bError===false ) {
							$oRestrictedApiCore->InitialiseSecondaryDatabaseFromPrimary( $sDBUsername, $sDBPassword );
							
							//-- Return an error if it failed to initialise --//
							if( $oRestrictedApiCore->bSecondaryDB===false ) {
								//-- ERROR: Failed to open a connection as a MySQL Administrator --//
								$bError    = true;
								$sErrMesg .= "Error Code:'4303' \n";
								$sErrMesg .= "Problem adding a new user!\n";
								$sErrMesg .= "Failed opening the special database connnection as .\n";
							}
						}
					} else {
						//-- ERROR: User doesn't have permission --//
						$bError    = true;
						$sErrMesg .= "Error Code:'4304' \n";
						$sErrMesg .= "Problem adding a new user!\n";
						$sErrMesg .= "The user doesn't seem to have permission to add new users.\n";
					}
					
				} else {
					//-- ERROR: Can not see the correct permission --//
					$bError    = true;
					$sErrMesg .= "Error Code:'4305' \n";
					$sErrMesg .= "Problem adding a new user!\n";
					$sErrMesg .= "Unexpected error when looking up the current user's permissions to add new users.\n";
				}
			} else {
				//-- ERROR:  --//
				$bError    = true;
				$sErrMesg .= "Error Code:'4306' \n";
				$sErrMesg .= "Problem adding a new user!\n";
				$sErrMesg .= "Problem looking up the current user's server permissions.\n";
				$sErrMesg .= $aUserServerPermissions['ErrMesg'];
			}
			
		} catch( Exception $e4300 ) {
			//-- CRITICAL ERROR --//
			$bError    = true;
			$sErrMesg .= "Error Code:'4300' \n";
			$sErrMesg .= "Problem adding a new user!\n";
			$sErrMesg .= "Critical error has occurred when looking up the current user's password.\n";
		}
	}
}


//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Edit User Information                          ==//
		//================================================================//
		if( $sPostMode==="EditUserInfo" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup the User's Information                          --//
				//--------------------------------------------------------------------//
				$aUserInfo = GetCurrentUserInfo();
				
				if( !(isset($aUserInfo["Error"])) || $aUserInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aUserInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the UserInfo --//
					if( $aUserInfo["Data"]["UserInfoId"]>=1 ) {
						
						//-- Change the Name of the Gateway --//
						$aResult = ChangeUserInfo( $aUserInfo["Data"]["UserInfoId"], $iPostGender, $sPostTitle, $sPostGivennames, $sPostSurname, $sPostDisplayname, $sPostEmail, $sPostPhoneNumber );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'1402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//--------------------------------------------//
							//-- Prepare variables for the Users Log    --//
							//--------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iUserLogId		= 13;
							//$iUserId			= $aUserInfo["Data"]["UserId"];
							//$sLogCustom1		= $aUserInfo["Data"][""];
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1403' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Can't access your User Details! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e1400->getMessage();
			}
		
		//================================================================//
		//== 5.2 - MODE: Change User Address                            ==//
		//================================================================//
		} else if( $sPostMode==="EditUserAddress" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Lookup the User's Information                          --//
				//--------------------------------------------------------------------//
				$aUserInfo = GetCurrentUserInfo();
				
				if( !(isset($aUserInfo["Error"])) || $aUserInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'2402' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aUserInfo["ErrMesg"];
					
					//echo json_encode( $oRestrictedApiCore->oRestrictedDB->QueryLogs )."\n\n";
				}
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Verify that the User has a UserAddressId               --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aUserInfo["Data"]["UserAddressId"]>=1 ) {
						
						//-- If the Password matches then its fine to swap to the new password --//
						$aResult = ChangeUserAddress( $aUserInfo["Data"]["UserAddressId"], $sPostAddressLine1, $sPostAddressLine2, $sPostAddressLine3, $iPostAddressCountry, $iPostAddressStateProvince, $iPostAddressPostcode, $iPostAddressTimezone, $iPostAddressLanguage);
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'2404' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//--------------------------------------------//
							//-- Prepare variables for the Users Log    --//
							//--------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iUserLogId		= 13;
							//$iUserId			= $aUserInfo["Data"]["UserId"];
							//$sLogCustom1		= $aUserInfo["Data"][""];
						}
						
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Can't access your User Details! \n";
					}
				}
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Edit Change Password                           ==//
		//================================================================//
		} else if( $sPostMode==="EditPassword" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Lookup the User's Information                          --//
				//--------------------------------------------------------------------//
				$aUserInfo = GetCurrentUserInfo();
				
				if( !(isset($aUserInfo["Error"])) || $aUserInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'3402' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aUserInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aUserInfo["Data"]["UserInfoId"]>=1 ) {
						
						//-- Check if the OldPassword is the valid password --//
						if( VerifyUserPassword($sPostOldPassword) ) {
							//-- If the Password matches then its fine to swap to the new password --//
							$aResult = ChangeUserPassword($sPostNewPassword);
							
							//echo "-----------<br />\n";
							//var_dump( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
							//echo "-----------<br />\n";
							
							//-- Check for caught Errors --//
							if( $aResult["Error"]===true ) {
								$bError = true;
								$sErrMesg .= "Error Code:'3404 \n";
								$sErrMesg .= "Internal API Error! \n";
								$sErrMesg .= $aResult["ErrMesg"];
								
							} else {
								//-------------------------------------------//
								//-- Prepare variables for the Users Log   --//
								//-------------------------------------------//
								//-- TODO: Fix up the log --//
								//$iUserLogId		= 13;
								//$iUserId			= $aUserInfo["Data"]["UserId"];
								//$sLogCustom1		= $aUserInfo["Data"][""];
							}
						
						} else {
							//-- Error: User Supplied "Current Password" doesn't match what is in the 'RestrictedAPICore' --//
							$bError = true;
							$sErrMesg .= "Error Code:'3403' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= "Current Password doesn't match what is currently being used! \n";
						}
						
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'3407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Can't access your User Details! \n";
					}
				}
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
			
		//================================================================//
		//== 5.4 - MODE: Add New User                                   ==//
		//================================================================//
		} else if( $sPostMode==="AddUser" ) {
			try {
				//----------------------------------------//
				//-- Begin the Transaction              --//
				//----------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------//
				//-- Add UserInfo                       --//
				//----------------------------------------//
				if( $bError===false ) {
					//-- TODO: Merge the InsertUserInfo, InsertUser, 
					
					//-- Add the user Info --//
					$aUserInfoResult = InsertUserInfo( 1, $sPostTitle, $sPostGivennames, $sPostSurname, $sPostDisplayname, $sPostEmail, $sPostPhoneNumber, $sPostDoB );
					
					//-- IF No errors have occurred then extract the UserInfoId --//
					if( $aUserInfoResult['Error']===false ) {
						
						$iUserInfoId = $aUserInfoResult['Data']['LastId'];
						
					} else {
						$bError    = true;
						$iErrCode  = 4401;
						$sErrMesg .= "Error Code:'4401' \n";
						$sErrMesg .= $aUserInfoResult['Data'];
					}
				}
				
				//----------------------------------------//
				//-- Add User                           --//
				//----------------------------------------//
				if( $bError===false ) {
					
					$aUserResult = InsertUser( $iUserInfoId, $sPostUsername, 1 );
					
					//-- IF No errors have occurred then extract the UserId --//
					if( $aUserResult['Error']===false ) {
						$iUserId = $aUserResult['Data']['LastId'];
						
					//-- ELSE Error --//
					} else {
						$bError    = true;
						$iErrCode  = 4402;
						$sErrMesg .= "Error Code:'4402' \n";
						$sErrMesg .= $aUserResult['Data'];
					}
				}
				
				//----------------------------------------//
				//-- Add User Address                   --//
				//----------------------------------------//
				if( $bError===false ) {
					
					$aUserAddressResult = InsertUserAddress( $iUserId, $iPostAddressLanguage, $iPostAddressCountry, $iPostAddressStateProvince, $iPostAddressPostcode, $iPostAddressTimezone, $sPostAddressLine1, $sPostAddressLine2, $sPostAddressLine3 );
					
					//-- IF No errors have occurred then extract the UserId --//
					if( $aUserAddressResult['Error']===false ) {
						$iUserAddressId = $aUserAddressResult['Data']['LastId'];
						
					//-- ELSE Error --//
					} else {
						$bError    = true;
						$iErrCode  = 4403;
						$sErrMesg .= "Error Code:'4403' \n";
						$sErrMesg .= $aUserAddressResult['Data'];
					}
				}
				
				//----------------------------------------//
				//-- Create Database User               --//
				//----------------------------------------//
				if( $bError===false ) {
					
					//-- Work out if the user is connecting via localhost or not --//
					if( $sDBURI==="localhost" || $sDBURI==="127.0.0.1" || $sDBURI==="::1" ) {
						$sUserLocation = $sDBURI;
					} else {
						$sUserLocation = "%";
					}
					
					
					$aResult = CreateDatabaseUser( $sPostUsername, $sPostNewPassword, $sUserLocation );
					
					//-- IF No errors have occurred then extract the UserId --//
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 4404;
						$sErrMesg .= "Error Code:'4404' \n";
						$sErrMesg .= $aResult['ErrMesg'];
					}
				}
				
				//----------------------------------------//
				//-- Commit or rollback the Changes     --//
				//----------------------------------------//
				if( $bTransactionStarted===true ) {
					if( $bError===false ) {
						//----------------//
						//-- COMMIT     --//
						//----------------//
						$oRestrictedApiCore->oRestrictedDB->dbEndTransaction();
						
					} else {
						//----------------//
						//-- ROLLBACK   --//
						//----------------//
						$oRestrictedApiCore->oRestrictedDB->dbRollback();
						
					}
				}
				
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}



//====================================================================//
//== 8.0 - LOG THE RESULTS                                          ==//
//====================================================================//
if( $bError===false ) {
	try {
		if( $iPresetLogId!==0 ) {
			$iLogNowUTS = time();
			//-- Log the Results --//
			//$aLogResult = AddPresetLogToPremiseLog( $iPresetLogId, $iLogNowUTS, $iPremiseId, $sLogCustom1 );
			//echo "<br />\n";
			//var_dump( $aLogResult );
			//echo "<br />\n";
		}
	} catch( Exception $e0800 ) {
		//-- Error Catching --//
		$bError = true;
		$sErrMesg .= "Error Code:'0800' \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Premise Log Error! \n";
	}
}

//====================================================================//
//== 9.0 - RETURN THE RESULTS OR ERROR MESSAGE                      ==//
//====================================================================//

//-- API didn't incur an Error --//
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()." ";
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
		$sOutput  = "Error Code:'0004'!\n Critical Error has occured!";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!";
	}
}


?>