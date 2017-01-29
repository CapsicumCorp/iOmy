<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for editing the various Premises that the user has access to.
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
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        --//
$aResult                    = array();      //-- ARRAY:         Used to store the results. --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//
$iPostId                    = "";           //-- STRING:        Used to store the "Premise Id" --//
$sPostName                  = "";           //-- STRING:        Used to store the desired "Premise Name". --//
$sPostDesc                  = "";           //-- STRING:        Used to store the desired "Premise Desc". --//
$sPostAddressLine1          = "";           //-- STRING:        Used to store the desired "Premise Address Line 1".		--//
$sPostAddressLine2          = "";           //-- STRING:        Used to store the desired "Premise Address Line 2".		--//
$sPostAddressLine3          = "";           //-- STRING:        Used to store the desired "Premise Address Line 3".		--//
$sPostAddressCountry        = "";           //-- STRING:        Used to store the desired "Premise Address Country".	--//
$sPostAddressStateProvince  = "";           //-- STRING:        Used to store the desired "Premise Address State".		--//
$sPostAddressPostcode       = "";           //-- STRING:        Used to store the desired "Premise Address Postcode".	--//
$sPostAddressTimezone       = "";           //-- STRING:        Used to store the desired "Premise Address Timezone".	--//
$sPostAddressLanguage       = "";           //-- STRING:        Used to store the desired "Premise Address Language".	--//

$sPostInfoOccupants         = "";           //-- STRING:        Used to store the desired "Premise Info Occupants".		--//
$sPostInfoBedrooms          = "";           //-- STRING:        Used to store the desired "Premise Info Bedrooms".		--//
$sPostInfoFloors            = "";           //-- STRING:        Used to store the desired "Premise Info Floors".		--//
$sPostInfoRooms             = "";           //-- STRING:        Used to store the desired "Premise Info Rooms".			--//

$aPremiseInfo               = array();      //-- ARRAY:         Used to store the "Premise Information" that most modes in this API depend on.  --//
$iLogNowUTS                 = 0;            //-- INTEGER:       --//
$iPresetLogId               = 0;            //-- INTEGER:       --//
$sLogCustom1                = "";           //-- STRING:        Special variable for the Premise Log. --//

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
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                  "DataType"=>'STR' ),
		array( "Name"=>'Id',                    "DataType"=>'INT' ),
		array( "Name"=>'Name',                  "DataType"=>'STR' ),
		array( "Name"=>'Desc',                  "DataType"=>'STR' ),
		array( "Name"=>'AddressLine1',          "DataType"=>'STR' ),
		array( "Name"=>'AddressLine2',          "DataType"=>'STR' ),
		array( "Name"=>'AddressLine3',          "DataType"=>'STR' ),
		array( "Name"=>'AddressCountry',        "DataType"=>'INT' ),
		array( "Name"=>'AddressStateProvince',  "DataType"=>'INT' ),
		array( "Name"=>'AddressPostcode',       "DataType"=>'INT' ),
		array( "Name"=>'AddressTimezone',       "DataType"=>'INT' ),
		array( "Name"=>'AddressLanguage',       "DataType"=>'INT' ),
		array( "Name"=>'PremiseInfoOccupants',  "DataType"=>'INT' ),
		array( "Name"=>'PremiseInfoBedrooms',   "DataType"=>'INT' ),
		array( "Name"=>'PremiseInfoFloors',     "DataType"=>'INT' ),
		array( "Name"=>'PremiseInfoRooms',      "DataType"=>'INT' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
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
		//-- NOTE: Valid modes are going to be "EditName", "EditDesc", "EditPremiseAddress" & "EditPremiseInfo" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="EditName" && $sPostMode!=="EditDesc" && $sPostMode!=="EditPremiseAddress" && $sPostMode!=="EditPremiseInfo" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"EditName\", \"EditDesc\", \"EditPremiseAddress\" or \"EditPremiseInfo\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"EditName\", \"EditDesc\", \"EditPremiseAddress\" or \"EditPremiseInfo\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Premise "Id"                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "IOId" --//
			$iPostId = $aHTTPData["Id"];
			
			if( $iPostId===false ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0103' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		} catch( Exception $e0104 ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0104' \n";
			$sErrMesg .= "Incorrect \"Id\" parameter!\n";
			$sErrMesg .= "Please use a valid \"Id\" parameter\n";
			$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Premise Name                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditName" ) {
			try {
				//-- Retrieve the "IOPortId" --//
				$sPostName = $aHTTPData["Name"];
				
				if( $sPostName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Non numeric \"Name\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Name\" parameter\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Name\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Name\" parameter\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.B - Retrieve Premise Desc                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditDesc" ) {
			try {
				//-- Retrieve the "Desc" --//
				$sPostDesc = $aHTTPData["Desc"];
				
				if( $sPostDesc===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"Desc\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Desc\" parameter\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"Desc\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Desc\" parameter\n";
			}
		}
	}
	
	if( $bError===false ) {
		if( $sPostMode==="EditPremiseAddress" ) {
			//----------------------------------------------------//
			//-- 2.2.3.C - Retrieve Premise Address Line 1      --//
			//----------------------------------------------------//
			try {
				//-- Retrieve the "Address Line 1" --//
				$sPostAddressLine1 = $aHTTPData["AddressLine1"];
				
				if( $sPostAddressLine1===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Non numeric \"AddressLine1\" parameter! \n";
					$sErrMesg .= "Please use a valid \"AddressLine1\" parameter\n";
				}
			} catch( Exception $e0110 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"AddressLine1\" parameter!\n";
				$sErrMesg .= "Please use a valid \"AddressLine1\" parameter\n";
			}
			
			//----------------------------------------------------//
			//-- 2.2.4.C - Retrieve Premise Address Line 2      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 2" --//
					$sPostAddressLine2 = $aHTTPData["AddressLine2"];
					
					if( $sPostAddressLine2===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0111' \n";
						$sErrMesg .= "Non numeric \"AddressLine2\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
					}
				} catch( Exception $e0112 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0112' \n";
					$sErrMesg .= "Incorrect \"AddressLine2\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.5.C - Retrieve Premise Address Line 3      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Line 3" --//
					$sPostAddressLine3 = $aHTTPData["AddressLine3"];
					
					if( $sPostAddressLine3===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0113' \n";
						$sErrMesg .= "Non numeric \"AddressLine3\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLine3\" parameter\n";
					}
				} catch( Exception $e0114 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0114' \n";
					$sErrMesg .= "Incorrect \"AddressLine3\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLine3\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.6.C - Retrieve Premise Address Country     --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Country" --//
					$sPostAddressCountry = $aHTTPData["AddressCountry"];
					
					if( $sPostAddressCountry===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0115' \n";
						$sErrMesg .= "Non numeric \"AddressCountry\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressCountry\" parameter\n";
					}
				} catch( Exception $e0116 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0116' \n";
					$sErrMesg .= "Incorrect \"AddressCountry\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressCountry\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.7.C - Retrieve Premise Address Province    --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Province" --//
					$sPostAddressStateProvince = $aHTTPData["AddressStateProvince"];
					
					if( $sPostAddressStateProvince===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0117' \n";
						$sErrMesg .= "Non numeric \"AddressStateProvince\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressStateProvince\" parameter\n";
					}
				} catch( Exception $e0118 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0118' \n";
					$sErrMesg .= "Incorrect \"AddressStateProvince\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressStateProvince\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.8.C - Retrieve Premise Address Postcode    --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Postcode" --//
					$sPostAddressPostcode = $aHTTPData["AddressPostcode"];
					
					if( $sPostAddressPostcode===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0119' \n";
						$sErrMesg .= "Non numeric \"AddressPostcode\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressPostcode\" parameter\n";
					}
				} catch( Exception $e0120 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0120' \n";
					$sErrMesg .= "Incorrect \"AddressPostcode\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressPostcode\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.9.C - Retrieve Premise Address Timezone    --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Timezone" --//
					$sPostAddressTimezone = $aHTTPData["AddressTimezone"];
					
					if( $sPostAddressTimezone===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0121' \n";
						$sErrMesg .= "Non numeric \"AddressTimezone\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressTimezone\" parameter\n";
					}
				} catch( Exception $e0122 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0122' \n";
					$sErrMesg .= "Incorrect \"AddressTimezone\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressTimezone\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.10.C - Retrieve Premise Address Language   --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Address Language" --//
					$sPostAddressLanguage = $aHTTPData["AddressLanguage"];
					
					if( $sPostAddressLanguage===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0123' \n";
						$sErrMesg .= "Non numeric \"AddressLanguage\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLanguage\" parameter\n";
					}
				} catch( Exception $e0124 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0124' \n";
					$sErrMesg .= "Incorrect \"AddressLanguage\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLanguage\" parameter\n";
				}
			}
		}
	}
	
	
	if( $bError===false ) {
		if( $sPostMode==="EditPremiseInfo" ) {
			//----------------------------------------------------//
			//-- 2.2.3.D - Retrieve Premise Info Occupants      --//
			//----------------------------------------------------//
			try {
				//-- Retrieve the "Premise Info Occupants" --//
				$sPostInfoOccupants = $aHTTPData["PremiseInfoOccupants"];
				
				if( $sPostInfoOccupants===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0125' \n";
					$sErrMesg .= "Non numeric \"PremiseInfoOccupants\" parameter! \n";
					$sErrMesg .= "Please use a valid \"PremiseInfoOccupants\" parameter\n";
				}
			} catch( Exception $e0126 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0126' \n";
				$sErrMesg .= "Incorrect \"PremiseInfoOccupants\" parameter!\n";
				$sErrMesg .= "Please use a valid \"PremiseInfoOccupants\" parameter\n";
			}
			
			//----------------------------------------------------//
			//-- 2.2.4.D - Retrieve Premise Info Bedrooms       --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Premise Info Bedrooms" --//
					$sPostInfoBedrooms = $aHTTPData["PremiseInfoBedrooms"];
					
					if( $sPostInfoBedrooms===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0127' \n";
						$sErrMesg .= "Non numeric \"AddressLine2\" parameter! \n";
						$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
					}
				} catch( Exception $e0019C ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0128' \n";
					$sErrMesg .= "Incorrect \"AddressLine2\" parameter!\n";
					$sErrMesg .= "Please use a valid \"AddressLine2\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.5.D - Retrieve Premise Info Floors         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Premise Info Floors" --//
					$sPostInfoFloors = $aHTTPData["PremiseInfoFloors"];
					
					if( $sPostInfoFloors===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0129' \n";
						$sErrMesg .= "Non numeric \"PremiseInfoFloors\" parameter! \n";
						$sErrMesg .= "Please use a valid \"PremiseInfoFloors\" parameter\n";
					}
				} catch( Exception $e0130 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0130' \n";
					$sErrMesg .= "Incorrect \"PremiseInfoFloors\" parameter!\n";
					$sErrMesg .= "Please use a valid \"PremiseInfoFloors\" parameter\n";
				}
			}
			
			//----------------------------------------------------//
			//-- 2.2.6.D - Retrieve Premise Info Rooms          --//
			//----------------------------------------------------//
			if( $bError===false ) {
				try {
					//-- Retrieve the "Premise Info Rooms" --//
					$sPostInfoRooms = $aHTTPData["PremiseInfoRooms"];
					
					if( $sPostInfoRooms===false ) {
						$bError = true;
						$sErrMesg .= "Error Code:'0131' \n";
						$sErrMesg .= "Non numeric \"PremiseInfoRooms\" parameter! \n";
						$sErrMesg .= "Please use a valid \"PremiseInfoRooms\" parameter\n";
					}
				} catch( Exception $e0132 ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0132' \n";
					$sErrMesg .= "Incorrect \"PremiseInfoRooms\" parameter!\n";
					$sErrMesg .= "Please use a valid \"PremiseInfoRooms\" parameter\n";
				}
			}
		}
	}
}


//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Edit Premise Name                              ==//
		//================================================================//
		if( $sPostMode==="EditName" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup information about the Premise                   --//
				//--------------------------------------------------------------------//
				$aPremiseInfo = GetPremisesInfoFromPremiseId( $iPostId );
				
				if( $aPremiseInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aPremiseInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aPremiseInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Premise --//
						$aResult = ChangePremiseName( $iPostId, $sPostName );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'1402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iPresetLogId		= 13;
							//$iPremiseId		= $aPremiseInfo["Data"]["PremiseId"];
							//$sLogCustom1		= $aPremiseInfo["Data"]["DevicePortName"];
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1403' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Premise name! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}

		//================================================================//
		//== 5.2 - MODE: Edit Premise Desc                              ==//
		//================================================================//
		} else if( $sPostMode==="EditDesc" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Lookup information about the Premise                   --//
				//--------------------------------------------------------------------//
				$aPremiseInfo = GetPremisesInfoFromPremiseId( $iPostId );
				
				if( $aPremiseInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'2401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aPremiseInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aPremiseInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Premise --//
						$aResult = ChangePremiseDesc( $iPostId, $sPostDesc );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'2402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iPresetLogId		= 13;
							//$iPremiseId		= $aPremiseInfo["Data"]["PremiseId"];
							//$sLogCustom1		= $aPremiseInfo["Data"]["DevicePortName"];
							
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Premise description! \n";
					}
				}
			} catch( Exception $e1200 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e1200->getMessage();
			}

		//================================================================//
		//== 5.3 - MODE: Edit Premise Address                           ==//
		//================================================================//
		} else if( $sPostMode==="EditPremiseAddress" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Lookup Premise Addess Info from the PremiseId          --//
				//--------------------------------------------------------------------//
				$aPremiseInfo = GetPremisesAddressFromPremiseId( $iPostId );
				
				if( $aPremiseInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'3401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aPremiseInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Change the Premise Address data                        --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aPremiseInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Premise --//
						$aResult = ChangePremiseAddress( $aPremiseInfo["Data"]["AddressId"], $sPostAddressLine1, $sPostAddressLine2, $sPostAddressLine3, $sPostAddressCountry, $sPostAddressStateProvince, $sPostAddressPostcode, $sPostAddressTimezone, $sPostAddressLanguage );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'3402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iPresetLogId		= 13;
							//$iPremiseId		= $aPremiseInfo["Data"]["PremiseId"];
							//$sLogCustom1		= $aPremiseInfo["Data"]["DevicePortName"];
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'3407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Premise Address! \n";
					}
				}
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
		//================================================================//
		//== 5.4 - MODE: Edit Premise Info                              ==//
		//================================================================//
		} else if( $sPostMode==="EditPremiseInfo" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.4.1 - Lookup information about the Premise Info              --//
				//--------------------------------------------------------------------//
				$aPremiseInfo = GetPremisesInfoFromPremiseId( $iPostId );
				
				if( $aPremiseInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'4401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aPremiseInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.4.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aPremiseInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Premise --//
						$aResult = ChangePremiseInfo( $aPremiseInfo["Data"]["PremiseInfoId"], $sPostInfoOccupants, $sPostInfoBedrooms, $sPostInfoFloors, $sPostInfoRooms );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$sErrMesg .= "Error Code:'4402' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//-- TODO: Fix up the log --//
							//$iPresetLogId		= 13;
							//$iPremiseId		= $aPremiseInfo["Data"]["PremiseId"];
							//$sLogCustom1		= $aPremiseInfo["Data"]["DevicePortName"];
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'4407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Premise Info! \n";
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
			$sErrMesg .= "Internal API Error! \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e1000 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e1000->getMessage();
	}
}

//====================================================================//
//== 8.0 - Log the Results                                          ==//
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
//== 9.0 - FINALISE                                                 ==//
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
		echo "Error Code:'0001' \n ".$e0001->getMessage()."\" ";
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