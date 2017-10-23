<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used to give the UI access to an IP Camera device.
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
$sOutput                    = "";           //-- STRING:        Used to hold this API Request's body when everything is successful. --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.  --//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//
$sPostNetworkAddress        = "";           //-- STRING:        Used to store the "DeviceNetworkAddress" that is passed as a HTTP POST variable. --//
$iPostNetworkPort           = 0;            //-- INTEGER:       Used to store the "". --//
$sPostProtocol              = "";           //-- STRING:        --//
$sPostUsername              = "";           //-- STRING:        Used to store the "". --//
$sPostPassword              = "";           //-- STRING:        Used to store the "". --//
$sPostStreamProfileName     = "";           //-- STRING:        --//
$sPostThumbProfileName      = "";           //-- STRING:        --//
$sPostCapabilitiesType      = "";           //-- STRING:        --//
$sOnvifCameraName           = "";           //-- STRING:        --//
$sOnvifProfileName          = "";           //-- STRING:        --//
$aSensorList                = array();      //-- ARRAY:         Used to store the --//
$aTempFunctionResult        = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be returned. --//
$iPostLinkId                = 0;            //-- INTEGER:       --//
$iPostThingId               = 0;            //-- INTEGER:       --//
$iPostRoomId                = 0;            //-- INTEGER:       --//
$aTempFunctionResult1       = array();      //-- ARRAY:         --//
$aTempFunctionResult2       = array();      //-- ARRAY:         --//
$aTempFunctionResult3       = array();      //-- ARRAY:         --//
$bFound                     = false;        //-- BOOLEAN:       Used to indicate if a match is found or not --//
$iAPICommTypeId             = 0;            //-- INTEGER:       Will hold the the CommTypeId for comparisons --//
$iLinkPermWrite             = 0;            //-- INTEGER:       --//
$aCommInfo                  = array();      //-- ARRAY:         --//
$sUrlAuthSection            = "";           //-- STRING:        --//
$bDebugging                 = false;        //-- BOOLEAN:       Used to enable debugging output if set to true --//


$iPremiseId                 = 0;            //-- INTEGER:       --//
$aHubData                   = array();      //-- ARRAY:         --//
$aRoomInfo                  = array();      //-- ARRAY:         --//


//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';        //-- This library is used to perform the inserting of a new Onvif Server and Streams into the database --//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//


//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//


//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'HubId',                     "DataType"=>'INT' ),
		array( "Name"=>'RoomId',                    "DataType"=>'INT' ),
		array( "Name"=>'LinkId',                    "DataType"=>'INT' ),
		array( "Name"=>'ThingId',                   "DataType"=>'INT' ),
		array( "Name"=>'IPCamType',                 "DataType"=>'STR' ),
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
		//-- NOTE: Valid modes are going to be "NetAddressLookupDeviceTime", "LookupVideoSources", "LookupStreamInfo", "OnvifData", "NetAddressCheckForOnvif"  --//
		
		//-- Verify that the mode is supported --//
		if( 
			$sPostMode!=="AddNewIPCamera"               && $sPostMode!=="TestStream"                    && 
			$sPostMode!=="FetchStreamUrl"               && $sPostMode!=="EditIPCamera"                  
		) {
			$bError    = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"TestStream\", \"FetchStreamUrl\", \"AddNewIPCamera\" or \"EditIPCamera\" \n\n";
		}
		
	} catch( Exception $e0011 ) {
		$bError    = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"TestStream\", \"FetchStreamUrl\", \"AddNewIPCamera\" or \"EditIPCamera\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "Data"                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="TestStream" || $sPostMode==="AddNewIPCamera" || $sPostMode==="EditIPCamera" ) {
			try {
				//-- Retrieve the json "Data" --//
				$sPostData = $aHTTPData["Data"];
				
				if( $sPostData===false ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'0103' \n";
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
						$iErrCode  = 103;
						$sErrMesg .= "Error Code:'0103' \n";
						$sErrMesg .= "Invalid json \"Data\" parameter.\n";
						$sErrMesg .= "Please use a valid json \"Data\" parameter.\n";
					}
				}
			} catch( Exception $e0104 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"Data\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Data\" parameter.\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "IPCamType"                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="TestStream" || $sPostMode==="AddNewIPCamera" || $sPostMode==="EditIPCamera" ) {
			try {
				//-- Retrieve the "IPCamType" --//
				$sPostIPCamType = $aHTTPData["IPCamType"];
				
				if( $sPostIPCamType!=="MJPEG" ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"IPCamType\" parameter!\n";
					$sErrMesg .= "Please use a valid \"IPCamType\" parameter.\n";
					$sErrMesg .= "eg. \n MJPEG \n\n";
				}
				
			} catch( Exception $e0106 ) {
				$bError    = true;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"IPCamType\" parameter!n\n";
				$sErrMesg .= "Please use a valid \"IPCamType\" parameter.\n";
				$sErrMesg .= "eg. \n MJPEG \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.9 - Retrieve Hub Id                        --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewIPCamera" ) {
			try {
				//-- Retrieve the "HubId" --//
				$iPostHubId = $aHTTPData["HubId"];
				
				if( $iPostHubId===false || !($iPostHubId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0117' \n";
					$sErrMesg .= "Invalid \"HubId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0112 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"HubId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"HubId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.10 - Retrieve Thing Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="FetchStreamUrl" || $sPostMode==="EditIPCamera" ) {
			try {
				//-- Retrieve the "ThingId" --//
				$iPostThingId = $aHTTPData["ThingId"];
				
				if( $iPostThingId===false || !($iPostThingId>=1) ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0119' \n";
					$sErrMesg .= "Invalid \"ThingId\" parameter!\n";
					$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
					$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
				}
				
			} catch( Exception $e0120 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0120' \n";
				$sErrMesg .= "Incorrect \"ThingId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ThingId\" parameter\n";
				$sErrMesg .= "eg. \n \"1\", \"2\" or \"3\" \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.?.? - Retrieve Room Id                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddNewIPCamera" ) {
			try {
				//-- Retrieve the "RoomId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false || !($iPostRoomId>=1) ) {
					//-- Use default if none is specified --//
					$iPostRoomId = -1;
				}
				
			} catch( Exception $e0140 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0140' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter\n";
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
		//== 4.1 - Check if the Modes is supported in demo mode         ==//
		//================================================================//
		
		
		
		
		//================================================================//
		//== 4.2 - Lookup Hub and Comm Info                             ==//
		//================================================================//
		if( $sPostMode==="AddNewIPCamera" ) {
			//-- Lookup the "API Comm" Type to be used to be compared --//
			$iAPICommTypeId = LookupFunctionConstant("APICommTypeId");
			
			//----------------------------------------------------------------//
			//-- STEP 1 - Lookup details for the Hub                        --//
			//----------------------------------------------------------------//
			$aHubData = HubRetrieveInfoAndPermission( $iPostHubId );
			
			if( $aHubData['Error']===true ) {
				$bError = true;
				$iErrCode  = 1202;
				$sErrMesg .= "Error Code:'1202' \n";
				$sErrMesg .= "Problem looking up the data for the selected Hub\n";
				$sErrMesg .= $aHubData['ErrMesg'];
				
			} else {
				//-- Extract the Premise Id --//
				$iPremiseId = $aHubData['Data']['PremiseId'];
				
				//----------------------------------------------------------------//
				//-- STEP 2 - Validate the Room with desired Hub                --//
				//----------------------------------------------------------------//
				$aRoomValidate = ValidateRoomAccess( $iPostRoomId, $iPremiseId );
				
				if( $aRoomValidate['Error']===true ) {
					$bError    = true;
					$sErrMesg .= "Error Code:'1203' \n";
					$sErrMesg .= $aRoomValidate['ErrMesg'];
					
				} else {
					//----------------------------------------------------------------//
					//-- STEP 3 - Lookup Room details                               --//
					//----------------------------------------------------------------//
					$aRoomInfo = GetRoomInfoFromRoomId( $iPostRoomId );
					
					if( $aRoomInfo['Error']===true ) {
						$bError    = true;
						$sErrMesg .= "Error Code:'1204' \n";
						$sErrMesg .= "Problem looking up Room! \n";
						$sErrMesg .= $aRoomInfo['ErrMesg'];
						
					} else {
						//----------------------------------------------------------------//
						//-- STEP 4 - Check if a "PHP API" Comm is setup on the Hub     --//
						//----------------------------------------------------------------//
						$aTempFunctionResult1 = GetCommsFromHubId( $iPostHubId );
						
						if( $aTempFunctionResult1['Error']===false ) {
							//-- FOREACH Comm found --//
							foreach( $aTempFunctionResult1['Data'] as $aComm ) {
								//-- If no errors and no matches found --//
								if( $bError===false && $bFound===false ) {
									//-- Perform the check to see if CommType matches --//
									if( $aComm['CommTypeId']===$iAPICommTypeId ) {
										//-- Match found --//
										$bFound  = true;
										$iCommId = $aComm['CommId'];
									}
								}
							} //-- ENDFOREACH Comm --//
						} else {
							//-- ELSE No Comms are found --//
							$bFound = false;
							
							//------------------------------------------------------------//
							//-- If no Comm is setup then check Hub Write Permission    --//
							//------------------------------------------------------------//
							if( $aHubData['Data']['PermWrite']===0 ) {
								$bError = true;
								$iErrCode  = 1205;
								$sErrMesg .= "Error Code:'1205' \n";
								$sErrMesg .= "Permission issue detected!\n";
								$sErrMesg .= "The User doesn't appear to have the \"Write\" permission for that Hub\n";
							}
						}
					}
				}
			}
		}
		
		//================================================================//
		//== 4.4 - Lookup Thing Info                                    ==//
		//================================================================//
		if( $sPostMode==="FetchStreamUrl" || $sPostMode==="EditIPCamera" ) {
			$iIPCameraLinkTypeId       = LookupFunctionConstant("IPCameraLinkTypeId");
			$iIPCameraMJPEGThingTypeId = LookupFunctionConstant("IPCameraMJPEGThingTypeId");
			
			//----------------------------------------------------------------------------//
			//-- 4.4.1 - Lookup Thing Information                                       --//
			//----------------------------------------------------------------------------//
			$aTempFunctionResult1   = GetThingInfo( $iPostThingId );
			
			if( $aTempFunctionResult1['Error']===false ) {
				$iThingTypeId       = $aTempFunctionResult1['Data']['ThingTypeId'];
				$iLinkTypeId        = $aTempFunctionResult1['Data']['LinkTypeId'];
				$iPostLinkId        = $aTempFunctionResult1['Data']['LinkId'];
				$bWritePerm         = $aTempFunctionResult1['Data']['PermWrite'];
				$sOnvifProfileName  = $aTempFunctionResult1['Data']['ThingSerialCode'];
				
				if( $iLinkTypeId!==$iIPCameraLinkTypeId ) {
					//-- The ThingId that the user passed is not a IP Camera --//
					$bError     = true;
					$iErrCode   = 340;
					$sErrMesg  .= "Error Code:'0340' \n";
					$sErrMesg  .= "The specified Thing is not a IP Camera!\n";
					$sErrMesg  .= "Please use the ThingId of a valid IP Camera.\n";
					
					
				} else {
					//-- If a supported ThingId Type --//
					if( $iThingTypeId===$iIPCameraMJPEGThingTypeId ) {
						//-- Motion JPEG IP Camera --//
						$sPostIPCamType = "MJPEG";
						
					} else {
						$bError     = true;
						$iErrCode   = 341;
						$sErrMesg  .= "Error Code:'0341' \n";
						$sErrMesg  .= "The specified Thing is not a IP Camera!\n";
						$sErrMesg  .= "Please use the ThingId of a valid IP Camera.\n";
					}
				}
			} else {
				//-- ERROR: Could not get Thing Info --//
				$bError     = true;
				$iErrCode   = 349;
				$sErrMesg  .= "Error Code:'0349' \n";
				$sErrMesg  .= "Problem when looking up the ThingInfo!\n";
				$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
			}
		}
		
		if( $bError===false ) {
			if( $sPostMode==="TestStream" || $sPostMode==="AddNewIPCamera" ) {
				$sObjectMode = "Non-DB";
				$aObjectData = array();
			}
		}
		
		
		//----------------------------------------------------------------------------//
		//-- 4.6 - ESTABLISH THE PHP IP CAMERA OBJECT                               --//
		//----------------------------------------------------------------------------//
		if( $bError===false ) {
			if( 
				$sPostMode==="TestStream"                || $sPostMode==="AddNewIPCamera"            
			) {
				switch( $sPostIPCamType ) {
					case "MJPEG":
						//-- Load the required Library --//
						require_once SITE_BASE.'/restricted/libraries/ipcamera/mjpeg.php';
						
						//-- Create the PHP Object --//
						$oIPCam = new IPCamera( $sObjectMode, $aObjectData);
						
						//-- Check if it initialised --//
						if( $oIPCam->bInitialised===false ) {
							$bError    = true;
							$iErrCode  = 360;
							$sErrMesg .= "Error Code:'0360'\n";
							$sErrMesg .= "Couldn't initialise IP Camera Class!\n";
							$sErrMesg .= json_encode( $oIPCam->aErrorMessges );
						}
						
						break;
					default: 
						$bError    = true;
						$iErrCode  = 360;
						$sErrMesg .= "Error Code:'0360'\n";
						$sErrMesg .= "Couldn't initialise IP Camera Class!\n";
						break;
				}
			} else if( 
				$sPostMode==="FetchStreamUrl"              || $sPostMode==="EditIPCamera"                
			) {
				switch( $sPostIPCamType ) {
					case "MJPEG":
						//-- Load the required Library --//
						require_once SITE_BASE.'/restricted/libraries/ipcamera/mjpeg.php';
						
						//-- Create the PHP Object --//
						$oIPCam = new IPCamera( "DB", array( "LinkId"=>$iPostLinkId, "ThingId"=>$iPostThingId ) );
						
						//-- Check if it initialised --//
						if( $oIPCam->bInitialised===false ) {
							$bError    = true;
							$iErrCode  = 360;
							$sErrMesg .= "Error Code:'0360'\n";
							$sErrMesg .= "Couldn't initialise IP Camera Class!\n";
							$sErrMesg .= json_encode( $oIPCam->aErrorMessges );
						}
						
						break;
					default: 
						$bError    = true;
						$iErrCode  = 360;
						$sErrMesg .= "Error Code:'0360'\n";
						$sErrMesg .= "Couldn't initialise IP Camera Class!\n";
						break;
				}
			}
		}	//-- ENDIF No errors detected --//
	} catch( Exception $e0300 ) {
		$bError = true;
		$iErrCode  = 300;
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
		//== 5.1 - MODE: Test the Stream                                ==//
		//================================================================//
		if( $sPostMode==="TestStream" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Motion JPEG Stream                                     --//
				//--------------------------------------------------------------------//
				$aResult = $oIPCam->TestStream( $aPostData );
				
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Add IP Camera                                  ==//
		//================================================================//
		} else if( $sPostMode==="AddNewIPCamera" ) {
			try {
				//--------------------------------------------------------------------//
				//-- Add the Bridge to the database                                 --//
				//--------------------------------------------------------------------//
				if( $bFound===false ) {
					
					$aNewCommData = array(
						"HubId"     => $iPostHubId,
						"Type"      => "2",
						"Name"      => "PHP API",
						"Address"   => ""
					);
					
					//-- Add the "PHP API" Comm to the Database --//
					$aTempFunctionResult2 = PrepareAddNewComm( $aNewCommData, null );
					
					if( $aTempFunctionResult2['Error']===false ) {
						//-- Extract the CommId from the Results --//
						$iCommId = $aTempFunctionResult2['CommId'];
						
					} else {
						//-- Display an error --//
						$bError    = true;
						$iErrCode  = 2405+$aTempFunctionResult2['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem when adding the new Comm to the database\n";
						$sErrMesg .= $aTempFunctionResult2['ErrMesg'];
					}
				}
				
				
				//--------------------------------------------------------------------//
				//-- Add the Bridge to the database                                 --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aResult = $oIPCam->AddToTheDatabase( $iCommId, $iPostRoomId, $aPostData );
					
					//var_dump($aResult);
					if( $aResult['Error']===true ) {
						$bError    = true;
						$sErrMesg .= "Error Code:'2401' \n";
						$sErrMesg .= "Error occurred while submitting the Thing into the Database\n";
						$sErrMesg .= $aResult['ErrMesg'];
					}
				}
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
			
		//================================================================//
		//== 5.3 - MODE: Fetch Stream Url                               ==//
		//================================================================//
		} else if( $sPostMode==="FetchStreamUrl" ) {
			
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Motion JPEG Stream                                     --//
				//--------------------------------------------------------------------//
				$aResult = $oIPCam->FetchStreamUrl( $iPostThingId );
				
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
			
		//================================================================//
		//== 5.4 - MODE: Edit IP Camera                                 ==//
		//================================================================//
		} else if( $sPostMode==="EditIPCamera" ) {
			
			try {
				//--------------------------------------------------------------------//
				//-- 5.4.1 - Motion JPEG Stream                                     --//
				//--------------------------------------------------------------------//
				$aResult = $oIPCam->UpdateDeviceDetails( $aPostData );
				
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
			
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Problem with the 'Mode' Parameter! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
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