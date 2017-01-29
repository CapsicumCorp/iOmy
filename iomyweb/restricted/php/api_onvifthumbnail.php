<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used to give the UI access to an Onvif supported devices.
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


//====================================================================//
//== 1.0 - INITIALISE                                               ==//
//====================================================================//

//------------------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE                   --//
//------------------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//
$sPostNetworkAddress        = "";           //-- STRING:        Used to store the "DeviceNetworkAddress" that is passed as a HTTP POST variable.		--//
$iPostNetworkPort           = "";           //-- INTEGER:       Used to store the "".				--//
$sPostUsername              = "";           //-- STRING:        Used to store the "".				--//
$sPostPassword              = "";           //-- STRING:        Used to store the "".				--//
$sPostStreamProfileName     = "";           //-- STRING:        --//
$sPostThumbProfileName      = "";           //-- STRING:        --//
$sPostCapabilitiesType      = "";           //-- STRING:        --//
$sOnvifCameraName           = "";           //-- STRING:        --//
$sOnvifProfileName          = "";           //-- STRING:        --//
$aSensorList                = array();      //-- ARRAY:         Used to store the 
$aTempFunctionResult        = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be returned.		--//
$iPostLinkId                = 0;            //-- INTEGER:       --//
$iPostThingId               = 0;            //-- INTEGER:       --//
$aTempFunctionResult1       = array();      //-- ARRAY:         --//
$aTempFunctionResult2       = array();      //-- ARRAY:         --//
$aTempFunctionResult3       = array();      //-- ARRAY:         --//
$bFound                     = false;        //-- BOOLEAN:       Used to indicate if a match is found or not --//


$iAPICommTypeId             = 0;            //-- INTEGER:       Will hold the the CommTypeId for comparisons --//
$iLinkPermWrite             = 0;            //-- INTEGER:       --//
$iThumbUrlRSTypeId          = 0;            //-- INTEGER:       --//
$iThumbUrlId                = 0;            //-- INTEGER:       --//
$iUTS                       = 0;


//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/onvif.php';
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';       //-- This should call all the additional libraries needed --//
require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';        //-- This library is used to perform the inserting of a new Onvif Server and Streams into the database --//


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
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' )
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
		//-- NOTE: Valid modes are going to be "OpenThingThumbnail", "OpenLinkProfileThumbnail"  --//
		
		//-- Verify that the mode is supported --//
		//if( $sPostMode!=="OpenThingThumbnail" && $sPostMode!=="OpenLinkProfileThumbnail" ) {
		if( $sPostMode!=="OpenThingThumbnail" && $sPostMode!=="UpdateThingThumbnail" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"OpenThingThumbnail\" or \"UpdateThingThumbnail\" \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"OpenThingThumbnail\" or \"UpdateThingThumbnail\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Link Id                     --//
	//----------------------------------------------------//
/*
	if( $bError===false ) {
		if( $sPostMode==="OpenLinkProfileThumbnail" ) {
			try {
				//-- Retrieve the "LinkId" --//
				$iPostLinkId = $aHTTPData["LinkId"];
				
				if( $iPostLinkId===false || !($iPostLinkId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"LinkId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0017 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"LinkId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"LinkId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
*/
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Thing Id                    --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="OpenThingThumbnail" || $sPostMode==="UpdateThingThumbnail" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0017 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
}



//====================================================================//
//== 4.0 - PREPARATION FOR MAIN SECTION                             ==//
//====================================================================//
if( $bError===false ) {
	try {
		
		//================================================================//
		//== 4.2 - Lookup Thing Info                                    ==//
		//================================================================//
		if( $sPostMode==="OpenThingThumbnail" || $sPostMode==="UpdateThingThumbnail" ) {
			
			$iOnvifThingTypeId = LookupFunctionConstant("OnvifThingTypeId");
			
			//----------------------------------------------------------------------------//
			//-- STEP 1: Lookup Thing Information                                       --//
			//----------------------------------------------------------------------------//
			$aTempFunctionResult1 = GetThingInfo( $iPostThingId );
			
			if( $aTempFunctionResult1['Error']===false ) {
				$iThingTypeId       = $aTempFunctionResult1['Data']['ThingTypeId'];
				$iPostLinkId        = $aTempFunctionResult1['Data']['LinkId'];
				$bWritePerm         = $aTempFunctionResult1['Data']['PermWrite'];
				$sOnvifProfileName  = $aTempFunctionResult1['Data']['ThingSerialCode'];
				
				if( $iThingTypeId!==$iOnvifThingTypeId ) {
					//-- The ThingId that the user passed is not a Philips Hue --//
					$bError     = true;
					$iErrCode   = 1303;
					$sErrMesg  .= "Error Code:'1303' \n";
					$sErrMesg  .= "The specified Thing is not a Onvif Stream!\n";
					$sErrMesg  .= "Please use the ThingId of a valid Onvif Stream.\n";
				}
				
			} else {
				//-- TODO: Add Error Message --//
				$bError = true;
				$iErrCode   = 1302;
				$sErrMesg  .= "Error Code:'1302' \n";
				$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
				$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
			}
		}
		
		
		//================================================================//
		//== 4.3 - Lookup Link Info                                     ==//
		//================================================================//
		if( $sPostMode==="OpenThingThumbnail"   || $sPostMode==="OpenLinkProfileThumbnail"   || $sPostMode==="UpdateThingThumbnail" ) {
			//----------------------------------------------------------------------------//
			//-- STEP 2: Look up the details to the "Link" that belongs to that "Thing" --//
			//----------------------------------------------------------------------------//
			if( $bError===false ) {
				//-- Fetch the Info about the Link --//
				$aTempFunctionResult2 = GetLinkInfo( $iPostLinkId );
				
				//-- Extract the desired variables out of the results --//
				if( $aTempFunctionResult2['Error']===false ) {
					
					
					//-- Extract the required variables from the function results --//
					$sPostNetworkAddress    = $aTempFunctionResult2['Data']['LinkConnAddress'];
					$iPostNetworkPort       = $aTempFunctionResult2['Data']['LinkConnPort'];
					$sPostUsername          = $aTempFunctionResult2['Data']['LinkConnUsername'];
					$sPostPassword          = $aTempFunctionResult2['Data']['LinkConnPassword'];
					$iLinkPermWrite         = $aTempFunctionResult2['Data']['PermWrite'];
					
					
					
					//-- Lookup the Comm Info --//
					
					//-- Lookup the Link's Comm --//
					$aCommInfo = GetCommInfo( $aTempFunctionResult2['Data']['LinkCommId'] );
									
					if( $aCommInfo['Error']===false ) {
						//-- Extract the Desired Variables --//
						$iLinkCommType          = $aCommInfo['Data']['CommTypeId'];
						
						//-- Flag that this request needs to use the "PhilipsHue" PHP Object to update the device --//
						$bUsePHPObject = true;
					} else {
						$bError = true;
						$iErrCode  = 0306;
						$sErrMesg .= "Error Code:'0306' \n";
						$sErrMesg .= "Problem when fetching the Link info\n";
						$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
					}
					
				} else {
					$bError = true;
					$iErrCode  = 0307;
					$sErrMesg .= "Error Code:'0307' \n";
					$sErrMesg .= "Problem when fetching the Link info\n";
					$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
				}
			}	//-- ENDIF No errors detected --//
		}	//-- ENDIF --//
		
		//----------------------------------------------------------------------------//
		//-- 4.4 - ESTABLISH THE PHP ONVIF OBJECT                                   --//
		//----------------------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="OpenThingThumbnail"       || $sPostMode==="UpdateThingThumbnail"         || $sPostMode==="AddStreamsAsThing"        ) {
				//--------------------------------------------------------------------//
				//-- 4.3.1 - Check if a PHPOnvif class can be created for that IP   --//
				//--------------------------------------------------------------------//
				$oPHPOnvifClient = new PHPOnvif( $sPostNetworkAddress, $iPostNetworkPort, $sPostUsername, $sPostPassword );
				
				if( $oPHPOnvifClient->bInitialised===false ) {
					$bError = true;
					$iErrCode  = 0309;
					$sErrMesg .= "Error Code:'0309'\n";
					$sErrMesg .= "Couldn't initialise Onvif Class!\n";
					$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
				}
			}
		}	//-- ENDIF No errors detected --//
		
		
		
		//----------------------------------------------------------------------------//
		//-- 4.5 - LOOKUP THE DESIRED IOs FROM THE THINGID                          --//
		//----------------------------------------------------------------------------//
		if( $bError===false ) {
			
			if( $sPostMode==="OpenThingThumbnail" || $sPostMode==="UpdateThingThumbnail" ) {
				$iThumbUrlRSTypeId = LookupFunctionConstant('OnvifThumbnailUrlRSTypeId');
				
				//-- List all IOs attached to that Thing --//
				$aTempFunctionResult1 = GetIOsFromThingId( $iPostThingId );
				//-- Parse the results --//
				if( $aTempFunctionResult1['Error']===false ) {
						
					//-----------------------------------------------------------------------------------------//
					//-- Verify that the 3 desired IO Ids are found and stored to their appropiate variables --//
					//-----------------------------------------------------------------------------------------//
					foreach( $aTempFunctionResult1['Data'] as $aIO ) {
						//--------------------//
						//-- Hue            --//
						//--------------------//
						if( $aIO['RSTypeId']===$iThumbUrlRSTypeId ) {
							$iThumbUrlId = $aIO['IOId'];
								
						} 
					} //-- END Foreach --//
						
						
					//----------------------------------------------------//
					//-- IF a IOId couldn't be retrieved                --//
					//----------------------------------------------------//
					if( !($iThumbUrlId>0) ) {
						//-- Id isn't greater than zero --//
						$bError = true;
						$iErrCode  = 0310;
						$sErrMesg .= "Error Code:'0310' \n";
						$sErrMesg .= "Can not find the 'ThumbnailUrl' IO.\n";
					
					//----------------------------------------------------//
					//-- ELSE Assume that there isn't any errors        --//
					//----------------------------------------------------//
					} else {
						
						//-- Lookup the IO Info for the ThumbnailUrl from the database --//
						$aTempFunctionResult2 = GetIOInfo( $iThumbUrlId );
						
						if( $aTempFunctionResult2['Error']===true ) {
							$bError = true;
							$iErrCode  = 0311;
							$sErrMesg .= "Error Code:'0311' \n";
							$sErrMesg .= "Can not retrieve the 'ThumbnailUrl' IO Info.\n";
							$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
							//$sErrMesg .= "\n".$iThumbUrlId;
						}
						
						//-- Lookup the most recent ThumbnailUrl from the database --//
						if( $bError===false ) {
							//-- Get the current time --//
							$iUTS = time();
							
							$aTempFunctionResult3 = GetIODataMostRecent( $aTempFunctionResult2['Data']['DataTypeId'], $iThumbUrlId, $iUTS );
							
							if( $aTempFunctionResult3['Error']===false ) {
								$sThumbnailUrl = $aTempFunctionResult3['Data']['Value'];
								
							} else {
								$bError = true;
								$iErrCode  = 0312;
								$sErrMesg .= "Error Code:'0313' \n";
								$sErrMesg .= "Can not retrieve the 'ThumbnailUrl' most recent value.\n";
								$sErrMesg .= $aTempFunctionResult3['ErrMesg'];
								//$sErrMesg .= json_encode( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
							}
						}
					} //-- ENDELSE No errors --//
				} else {
					//-- Display the error --//
					$bError = true;
					$iErrCode  = 0313;
					$sErrMesg .= "Error Code:'0313' \n";
					$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
					$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
				} //-- ENDELSE An error was caught --//
			}
		} //-- ENDIF No errors detected --//
		
	} catch( Exception $e0300 ) {
		$bError = true;
		$iErrCode  = 0300;
		$sErrMesg .= "Error Code:'0300' \n";
		$sErrMesg .= $e0300->getMessage();
	}
}



//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Open Thumbnail                                 ==//
		//================================================================//
		if( $sPostMode==="OpenThingThumbnail" || $sPostMode==="UpdateThingThumbnail" ) {
			
			try {
				$sThumbnailFilename = SITE_BASE."/../tmp/".$iPostThingId.".jpg";
				
				//----------------------------------------//
				//-- GENERATE THE THUMBNAIL             --//
				//----------------------------------------//
				if( $bError===false ) {
					if( $sPostMode==="UpdateThingThumbnail" ) {
						if( $sThumbnailUrl!=="" && $sThumbnailUrl!==0 ) {
							$aTemp = $oPHPOnvifClient->CreateThumbnail( $sThumbnailUrl, $sThumbnailFilename );
							
							if( $aTemp['Error']===true ) {
								$bError = true;
								$sErrMesg .= "Error Code:'1401'\n";
								$sErrMesg .= "Couldn't initialise Onvif Class!\n";
								$sErrMesg .= json_encode( $oPHPOnvifClient->aErrorMessges );
							}
						} else {
							$bError = true;
							$sErrMesg .= "Error Code:'1402'\n";
							$sErrMesg .= "Problem extracting thumbnail URL!\n";
							//var_dump($aTempFunctionResult3);
						}
					}
				}
				
				
				//----------------------------------------//
				//-- OPEN THE THUMBNAIL AND PASS IT ON  --//
				//----------------------------------------//
				if( $bError===false ) {
					
					//var_dump( $aTemp );
					//-- Set the Page Headers --//
					header("Content-Type: image/jpeg");
					header("Content-Length: ".filesize( $sThumbnailFilename ));
					
					//-- Pass the Thumbnail to the Browser --//
					readfile( $sThumbnailFilename );
					
					
				}
			} catch( Exception $e1400) {
				$bError = true;
				$sErrMesg .= "Error Code:'1400'\n";
				$sErrMesg .= "Problem generating or opening the Thumbnail!\n";
				$sErrMesg .= $e1400->getMessage();
			}
		
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Problem with the 'Mode' Parameters! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0402' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}


//====================================================================//
//== 8.0 - Log the Results                                          ==//
//====================================================================//




//====================================================================//
//== 9.0 - Finalise                                                 ==//
//====================================================================//


//-- API Error has occurred --//
if( $bError===true) {
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