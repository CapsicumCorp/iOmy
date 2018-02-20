<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used for controlling lights.
//== @Copyright: Capsicum Corporation 2017
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

//----------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE           --//
//----------------------------------------------------//
if( !defined('SITE_BASE') ) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        This is the --//

$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//
$aTempFunctionResult1       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult2       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult3       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult4       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTempFunctionResult5       = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//
$sPostData                  = "";           //-- STRING:        Used to hold the JSON Data parameter passed before it gets turned into an array --//
$aPostData                  = array();      //-- ARRAY:         --//

$bUsePHPObject              = false;        //-- BOOLEAN:       --//
$oSpecialPHPObject          = array();      //-- ARRAY:         Used to hold the item  --//

$iLivsmartThingTypeId       = 0;            //-- INTEGER:       This is used to hold the "ThingTypeId" of a Livsmart Light Bulb.   --//
$iCSRMeshLinkTypeId         = 0;            //-- INTEGER:       This is used to hold the "LinkTypeId" of a Bluetooth CSR Mesh.     --//


$aThingData                 = array();      //-- ARRAY:         --//
$aLinkData                  = array();      //-- ARRAY:         --//
$aCommData                  = array();      //-- ARRAY:         --//


//-- Constants that need to be added to a function in the fuctions library --//

$iHueThingTypeId            = 0;            //-- INTEGER:       This is used to hold the "ThingTypeId" of a Philips Hue Light.     --//
$iDemoCommTypeId            = 0;            //-- INTEGER:       Used to store the "Comm Type Id" of the "Demo Comm Type".          --//
$iAPICommTypeId             = 0;            //-- INTEGER:       Used to store the "Comm Type Id" of the "PHP API Comm Type".       --//
$iHueRSTypeId               = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Hue Controls".        --//
$iSaturationRSTypeId        = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Saturation Controls". --//
$iBrightnessRSTypeId        = 0;            //-- INTEGER:       Used to store the "Resource Type Id" of the "Brightness Controls". --//



//----------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//



//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iLivsmartThingTypeId    = LookupFunctionConstant("LivsmartThingTypeId");
$iCSRMeshLinkTypeId      = LookupFunctionConstant("CSRMeshLinkTypeId");



//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' ),
		array( "Name"=>'Data',                      "DataType"=>'STR' )
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
		//-- NOTE: Valid modes are going to be "ChangeColorRGB" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="ChangeColorRGB" ) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"ChangeColorRGB\" or \"\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"ChangeColorRGB\" or \"\" \n\n";
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "ThingId"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeColorRGB" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError    = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"ThingId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0105 ) {
				$bError    = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "Data"                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeColorRGB" ) {
			try {
				//-- Retrieve the json "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData===false ) {
					$bError    = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid json \"Data\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Data\" parameter.\n";
					
				} else {
					//------------------------------------------------//
					//-- "Data" json parsing                        --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 105;
						$sErrMesg .= "Error Code:'0105' \n";
						$sErrMesg .= "Invalid json \"Data\" parameter.\n";
						$sErrMesg .= "Please use a valid json \"Data\" parameter.\n";
					}
				}
			} catch( Exception $e0106 ) {
				$bError    = true;
				$iErrCode  = 106;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter.\n";
			}
		}
	}
}



//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 4.1 - Lookup details on what type of device                ==//
		//================================================================//
		if( $sPostMode==="ChangeColorRGB" ) {
			
			//----------------------------------------------------------------------------//
			//-- STEP 1: Lookup the details of that particular "Thing".                 --//
			//----------------------------------------------------------------------------//
			$aTempFunctionResult1 = GetThingInfo( $iPostThingId );
			
			
			if( $aTempFunctionResult1['Error']===true ) {
				//--------------------------------//
				//-- Error Message              --//
				//--------------------------------//
				$bError     = true;
				$iErrCode   = 201;
				$sErrMesg  .= "Error Code:'0201' \n";
				$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
				$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
				
			} else {
				//--------------------------------//
				//-- Extract the values         --//
				//--------------------------------//
				$iThingTypeId   = $aTempFunctionResult1['Data']['ThingTypeId'];
				$iLinkId        = $aTempFunctionResult1['Data']['LinkId'];
				$iWritePerm     = $aTempFunctionResult1['Data']['PermWrite'];
				
				//--------------------------------------------//
				//-- Store the Thing Data                   --//
				//--------------------------------------------//
				$aThingData     = $aTempFunctionResult1['Data'];
				
				//----------------------------------------------------------------------------//
				//-- STEP 2: Lookup the details of the "Link"                               --//
				//----------------------------------------------------------------------------//
				$aTempFunctionResult2 = GetLinkInfo( $aTempFunctionResult1['Data']['LinkId'] );
				
				if( $aTempFunctionResult2['Error']===true ) {
					//--------------------------------//
					//-- Error Message              --//
					//--------------------------------//
					$bError    = true;
					$iErrCode  = 0202;
					$sErrMesg .= "Error Code:'0202' \n";
					$sErrMesg .= "Problem when fetching the LinkInfo\n";
					$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
					
				} else {
					//--------------------------------------------//
					//-- Store the Link Data                    --//
					//--------------------------------------------//
					$aLinkData     = $aTempFunctionResult2['Data'];
					
					//----------------------------------------------------------------------------//
					//-- STEP 3: Lookup the details of the "Comm"                               --//
					//----------------------------------------------------------------------------//
					$aTempFunctionResult3 = GetCommInfo( $aTempFunctionResult2['Data']['LinkCommId'] );
					
					if( $aTempFunctionResult3['Error']===true ) {
						//--------------------------------//
						//-- Error Message              --//
						//--------------------------------//
						$bError    = true;
						$iErrCode  = 0203;
						$sErrMesg .= "Error Code:'0203' \n";
						$sErrMesg .= "Problem when fetching the CommInfo\n";
						$sErrMesg .= $aTempFunctionResult3['ErrMesg'];
						
					} else {
						//--------------------------------------------//
						//-- Store the Link Data                    --//
						//--------------------------------------------//
						$aCommData     = $aTempFunctionResult3['Data'];
						
						//--------------------------------------------//
						//-- Flag that a PHP Object should be used  --//
						//--------------------------------------------//
						$bUsePHPObject     = true;
						
						
					}	//-- END Comm Info Lookup --//
				}	//-- END Link Info Lookup --//
			}	//-- END Thing Info Lookup --//
		}
		
		
		//================================================================//
		//== 4.9 - Setup the PHP Object to manage the device            ==//
		//================================================================//
		if( $bUsePHPObject===true ) {
			//------------------------------------------------//
			//-- 
			//------------------------------------------------//
			if( $aThingData['ThingTypeId']===$iLivsmartThingTypeId ) {
				//------------------------------------------------//
				//-- 
				//------------------------------------------------//
				require SITE_BASE.'/restricted/libraries/light/btcsrmeshlight.php';
				
				//------------------------------------------------//
				//-- Create the Object                          --//
				//------------------------------------------------//
				$aPHPObjectParameters = array(
					"ObjectState" => "DBThing",
					"ThingInfo"   => $aThingData,
					"LinkInfo"    => $aLinkData,
					"CommInfo"    => $aCommData
				);
				
				$oSpecialPHPObject = new BTCSRMeshLight( $aPHPObjectParameters );
				
			//------------------------------------------------//
			//-- ELSE Unsupported Device                    --//
			//------------------------------------------------//
			} else {
				$bError    = true;
				$iErrCode  = 399;
				$sErrMesg .= "Error Code:'0399' \n";
				$sErrMesg .= "Problem setting up the PHP Object!\n";
			}
			
			
			//------------------------------------------------//
			//-- Check if the Object is Initialised         --//
			//------------------------------------------------//
			if( $bError===false ) {
				if( $oSpecialPHPObject->bInitialised===false ) {
					//-- ERROR --//
					$bError = true;
					$iErrCode  = 390;
					$sErrMesg .= "Error Code:'0390' \n";
					$sErrMesg .= "Problem setting up the PHP Object!\n";
				}
			}
		}
	} catch( Exception $e0200 ) {
		$bError = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= "Critical Error Occurred!\n";
		$sErrMesg .= "Problem occurred when preparing for the main function\n";
	}
}


//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Change the RGB                                 ==//
		//================================================================//
		if( $sPostMode==="ChangeColorRGB" ) {
			try {
				//----------------------------------------------------------------//
				//-- Change the Colour Brightness                               --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					//-- Extract the Values --//
					if( isset( $aPostData['NewValue'] ) ) {
						//if( isset( $aPostData['NewValue']['Mode'] ) && isset( $aPostData['NewValue']['Hue'] ) && isset( $aPostData['NewValue']['Saturation'] ) && isset( $aPostData['NewValue']['Brightness'] ) ) {
						if( isset( $aPostData['NewValue']['Red'] ) && isset( $aPostData['NewValue']['Green'] ) && isset( $aPostData['NewValue']['Blue'] ) ) {
							//$iNewMode       = $aPostData['NewValue']['Mode'];
							$iNewRed    = $aPostData['NewValue']['Red'];
							$iNewGreen  = $aPostData['NewValue']['Green'];
							$iNewBlue   = $aPostData['NewValue']['Blue'];
							
							//-- Pass the parameters to the object --//
							//$aResult = $oSpecialPHPObject->ChangeHueSaturation( $iNewMode, $iNewHue, $iNewSaturation, $iNewBrightness );
							$aResult = $oSpecialPHPObject->ChangeColorRGB( $iNewRed, $iNewGreen, $iNewBlue );
							
							if( $aResult['Error']===true ) {
								//-- Error --//
								$bError    = true;
								$iErrCode  = 1500+$aResult['ErrCode'];
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= $aResult['ErrMesg'];
							}
							
						} else {
							$bError     = true;
							$iErrCode   = 1401;
							$sErrMesg  .= "Error Code:'1401' \n";
							$sErrMesg  .= "Problem finding the 'Red', 'Green', or 'Blue' in the 'NewValue' array in the 'Data' Parameter! \n";
							//$sErrMesg  .= "Problem finding the 'Mode', 'Hue', 'Saturation', or 'Brightness' in the 'NewValue' array in the 'Data' Parameter! \n";
						}
						
					} else {
						$bError     = true;
						$iErrCode   = 1402;
						$sErrMesg  .= "Error Code:'1402' \n";
						$sErrMesg  .= "Problem finding the 'NewValue' array in the 'Data' Parameter! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= $e1400->getMessage();
			}
			
		//================================================================//
		//== UNSUPPORTED MODE                                           ==//
		//================================================================//
		} else {
			$bError    = true;
			$iErrCode  = 401;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$iErrCode  = 400;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}
//====================================================================//
//== 8.0 - Log the Results                                          ==//
//====================================================================//







//====================================================================//
//== 9.0 - Finalise                                                 ==//
//====================================================================//

//-- API didn't encounter an Error --//
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
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
		$sOutput  = "Error Code:'0004'!\n Critical Error has occured!\n";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!\n";
	}
}




?>