<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for changing states of Links and Things.
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
$bError                 = false;        //-- BOOLEAN:       A flag used to indicate if an error has been caught																	--//
$sErrMesg               = "";           //-- STRING:        This is used to hold the error message once an error has been caught												--//
$aResult                = array();      //-- ARRAY:         This is an array (usually associative) that is used to store the results before it is converted into final product	--//
$sOutput                = "";           //-- STRING:        --//
$sPostMode              = "";           
$sPostId                = "";           //-- INTEGER:       --//
$iPostId                = 0;            //-- STRING:        --//
$aLinkChangeState       = array();      //-- ARRAY:         Used to Hold the Link Change State results --//
$aThingChangeState      = array();      //-- ARRAY:         Used to Hold the Thing Change State results --//
$aStateResults          = array();      
$aStateResultsNew       = array();      
$aLinkResults           = array();      //-- ARRAY:         Used to store the results of doing a lookup on the Link's Data          --//
$iNewState              = 0;            //-- INTEGER:       Used to store what the new state should be before updating the database. --//
$iPremiseId             = 0;            //-- INTEGER:       This variable is used to identify the Premise for the Premise Log. --//
$iLogNowUTS             = 0;            //-- INTEGER:       --//
$iPresetLogId           = 0;            //-- INTEGER:       --//
$sLogCustom1            = "";           //-- STRING:        Special variable for the Premise Log. --//

$bUsePHPObject          = false;        //-- BOOLEAN:       Used to indicate if a special PHP Object should be used to Toggle the State --//
$oSpecialPHPObject      = null;         //-- OBJECT:        Holds the special PHP Object that controls that particular device --//

//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//




//====================================================================//
//== 2.0 - RETRIEVE POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
$aRequiredParmaters = array(
	array( "Name"=>'Mode',      "DataType"=>'STR' ),
	array( "Name"=>'Id',        "DataType"=>'INT' )
);

$aHTTPData = FetchHTTPDataParameters($aRequiredParmaters);


//----------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                  --//
//----------------------------------------------------//
if($bError===false) {
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "GetLinkStatus", "GetThingStatus", "LinkToggleStatus", "ThingToggleStatus", "LinkSetState", "ThingSetState" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="GetLinkStatus" && $sPostMode!=="LinkToggleStatus" && $sPostMode!=="GetThingStatus" && $sPostMode!=="ThingToggleStatus" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"GetLinkStatus\", \"LinkToggleStatus\", \"GetThingStatus\", \"ThingToggleStatus\" \n\n";
		}
		
	} catch( Exception $e0101 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"GetLinkStatus\", \"LinkToggleStatus\", \"GetThingStatus\", \"ThingToggleStatus\" \n\n";
		//sErrMesg += e0101.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Link/Thing "Id"               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="GetLinkStatus" || $sPostMode==="LinkToggleStatus" || $sPostMode==="GetThingStatus" || $sPostMode==="ThingToggleStatus" ) {
			try {
				//-- Retrieve the Link/Thing "Id" --//
				$iPostId = $aHTTPData["Id"];
				
				if( $sPostId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"Id\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Id\" parameter\n";
					$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"Id\" parameter!";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		}
	}
}


//====================================================================//
//== 5.0 - Main                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== MODE 1: Retrieve the status of the Thing                   ==//
		//================================================================//
		if( $sPostMode==="GetThingStatus" ) {
			try {
				//-- Retrieve the state of the Thing --//
				$aStateResults = ThingRetrieveState( $iPostId );
					
				if($aStateResults['Error']===false) {
					$aResult = $aStateResults["Data"];
					
				} else {
					//-- Display an Error message --//
					$bError    = true;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aStateResults["ErrMesg"];
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
		
		//================================================================//
		//== MODE 2: Toggle the status of the Thing                     ==//
		//================================================================//
		} else if( $sPostMode==="ThingToggleStatus" ) {
			//-- Error Checking --//
			try {
				
				//----------------------------------------------------//
				//-- PART 2 - Retrieve current Thing State          --//
				//----------------------------------------------------//
				$aStateResults = GetThingInfo( $iPostId );
				
				if( $aStateResults["Error"]===true ) {
					//-- Display an Error message --//
					$bError = true;
					$sErrMesg .= "Error Code:'2401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aStateResults["ErrMesg"];
				}
				
				//----------------------------------------------------------------------------//
				//-- PART 3 - Lookup the Link status to decide if it has special rules      --//
				//----------------------------------------------------------------------------//
				if( $bError===false ) {
					$aLinkResults = GetLinkInfo( $aStateResults['Data']['LinkId'] );
					
					if( $aLinkResults["Error"]===true ) {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aLinkResults["ErrMesg"];
					}
				}
				
				
				//----------------------------------------------------------------------------//
				//-- PART 3 - Lookup the Comm                                               --//
				//----------------------------------------------------------------------------//
				if( $bError===false ) {
					$aCommInfo = GetCommInfo( $aLinkResults['Data']['LinkCommId'] );
					
					if( $aCommInfo["Error"]===true ) {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2403' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aCommInfo["ErrMesg"];
					}
				}
				
				
				//----------------------------------------------------------------------------//
				//-- PART 4 - Work out which new ThingState the Thing needs to be set to    --//
				//----------------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the User has permission to toggle stuff on the premise --//
					if( $aStateResults["Data"]["PermStateToggle"]===1 ) {
						
						//----------------------------------------//
						//-- IF THE API MANAGES THE THING       --//
						//----------------------------------------//
						if( $aCommInfo['Data']['CommTypeId']===LookupFunctionConstant("APICommTypeId") ) {
							
							//----------------------------------------//
							//-- PHILIPS HUE LIGHT                  --//
							//----------------------------------------//
							if( $aStateResults['Data']['ThingTypeId']===LookupFunctionConstant("HueThingTypeId") ) {
								
								require_once SITE_BASE.'/restricted/libraries/philipshue.php';
								
								
								//-- Prepare the Variables --//
								$sNetworkAddress  = $aLinkResults['Data']['LinkConnAddress'];
								$sNetworkPort     = $aLinkResults['Data']['LinkConnPort'];
								$sUserToken       = $aLinkResults['Data']['LinkConnUsername'];
								$sHWId            = strval( $aStateResults['Data']['ThingHWId'] );
								
								$bUsePHPObject     = true;
								$oSpecialPHPObject = new PHPPhilipsHue( $sNetworkAddress, $sNetworkPort, $sUserToken );
								
								
								if( $oSpecialPHPObject->bInitialised===true ) {
									
									$aTempFunctionResult1   = $oSpecialPHPObject->GetLightsList();
									
									//----------------------------//
									//-- LOOKUP THING STATE     --//
									//----------------------------//
									if( isset($aTempFunctionResult1[$sHWId]) ) {
										
										$aTemp = $oSpecialPHPObject->GetThingState($sHWId);
										
										if( $aTemp['Error']===false ) {
											//-- Toggle Lights --//
											if( $aTemp['State']===false ) {
												//-- Turn "Thing" On --//
												$iNewState = 1;
												
											} else if( $aTemp['State']===true ) {
												//-- Turn "Thing" Off --//
												$iNewState = 0;
											}
											
											//----------------------------//
											//-- CHANGE THING STATE     --//
											//----------------------------//
											$oSpecialPHPObject->ChangeThingState( $sHWId, $iNewState );
										}
										
									} else {
										$bError = true;
										$sErrMesg .= "Error Code:'2407' \n";
										$sErrMesg .= "Device is unknown! \n";
										$sErrMesg .= "That particular Philips Hue device may have been disconnected or invalid credentials used!\n";
									}
								} else {
									$bError = true;
									$sErrMesg .= "Error Code:'2407' \n";
									$sErrMesg .= "Failed to setup the Philips Hue Gateway!\n";
								}
							} else {
								//-- API doesn't know what to do with that custom state --//
								$bError = true;
								$sErrMesg .= "Error Code:'2407' \n";
								$sErrMesg .= "Internal API Error! \n";
								$sErrMesg .= "This API hasn't been configured on what to do with this particular Thing Type!";
							}
							
						//----------------------------------------//
						//-- ELSE SOMETHING ELSE MANAGES IT     --//
						//----------------------------------------//
						} else {
							
							if( $aStateResults["Data"]["ThingStatus"]===0 ) {
								//-- Turn "Thing" On --//
								$iNewState = 1;
								
							} else if( $aStateResults["Data"]["ThingStatus"]===1 ) {
								//-- Turn "Thing" Off --//
								$iNewState = 0;
								
							} else {
								//-- API doesn't know what to do with that custom state --//
								$bError = true;
								$sErrMesg .= "Error Code:'2408' \n";
								$sErrMesg .= "Internal API Error! \n";
								$sErrMesg .= "Error Special State Detected!";
							}
						}
						
					} else {
						//-- Critical Error - Insufficient Permission --//
						$bError = true;
						$sErrMesg .= "Error Code:'2409' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Thing state! \n";
						//var_dump($aStateResults);
					}
				}
				
				//----------------------------------------------------------------//
				//-- PART 5 - UPDATE THE THING'S STATE IN THE DATABASE          --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- Change the state --//
					$aThingChangeState = ThingChangeState( $iPostId, $iNewState );
					
					//-- Check for errors --//
					if( $aThingChangeState["Error"]===true ) {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2410' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aThingChangeState["ErrMesg"];
					}
				}
				
				//----------------------------------------------------------------//
				//-- PART 6 - Retrieve current Thing State                      --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					$aStateResultsNew = ThingRetrieveState( $iPostId );
					
					if( $aStateResultsNew["Error"]===false ) {
						//----------------------------------------------------//
						//-- Store the result in the aResults variable      --//
						//----------------------------------------------------//
						$aResult = $aStateResultsNew["Data"];
						
						//-------------------------------------------//
						//-- Prepare variables for the Premise Log --//
						//-------------------------------------------//
						if( $iNewState===1 ) {
							$iPresetLogId = 12;
						} else if( $iNewState===0 ) {
							$iPresetLogId = 11;
						}
						
						$aThingState = ThingRetrieveStateAndPermission( $iPostId );
						
						if( $aThingState['Error']===false ) {
							$iPremiseId		= $aThingState["Data"]["PremiseId"];
							$sLogCustom1	= $aStateResults["Data"]["ThingName"];
						} else {
							//-- Display an Error message --//
							$bError = true;
							$sErrMesg .= "Error Code:'2411' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= $aThingState["ErrMesg"];
						}
						
						//var_dump($aStateResults);
						
					} else {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2410' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aStateResultsNew["ErrMesg"];
					}
				}
				
			//----------------------------------------------------//
			//-- Catch an error if one occurs that is catchable --//
			//----------------------------------------------------//
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}
		//================================================================//
		//== MODE 3: Retrieve the status of the Link                    ==//
		//================================================================//
		} else if( $sPostMode==="GetLinkStatus" ) {
			try {
				//-- Retrieve the state of the Link --//
				$aStateResults = LinkRetrieveState( $iPostId );

				//-- If no errors are found --//
				if( $aStateResults["Error"]===false ) {
					
					//-- Extract the Result from the function data --//
					$aResult = $aStateResults["Data"];
					
				} else {
					//-- Display an Error message --//
					$bError = true;
					$sErrMesg .= "Error Code:'3406' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aStateResults["ErrMesg"];
				}
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError = true;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
		//================================================================//
		//== MODE 4: Toggle the status of the Link                      ==//
		//================================================================//
		} else if( $sPostMode==="LinkToggleStatus" ) {
			//-- Error Checking --//
			try {
				
				//----------------------------------------------------//
				//-- PART 1 - Retrieve current Link State           --//
				//----------------------------------------------------//
				$aStateResults = LinkRetrieveStateAndPermission( $iPostId );
				
				if( $aStateResults["Error"]===true ) {
					//-- Display an Error message --//
					$bError = true;
					$sErrMesg .= "Error Code:'4406' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aStateResults["ErrMesg"];
				}
				
				//----------------------------------------------------------------------------//
				//-- PART 2 - Work out which new Link State the Link needs to be set to     --//
				//----------------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the User has permission to toggle stuff on the premise --//
					if( $aStateResults["Data"]["PermStateToggle"]===1 ) {
						
						if( $aStateResults["Data"]["LinkStatus"]===0 ) {
							//-- Turn "Link" On --//
							$iNewState = 1;
							
						} else if( $aStateResults["Data"]["LinkStatus"]===1 ) {
							//-- Turn "Link" Off --//
							$iNewState = 0;
							
						} else {
							//-- API doesn't know what to do with that custom state --//
							$bError = true;
							$sErrMesg .= "Error Code:'4407' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= "API aborting due to the Link having a state that this API doesn't support. \n";
						}
					} else {
						$bError = true;
						$sErrMesg .= "Error Code:'4408' \n";
						$sErrMesg .= "It appears your User Account doesn't have the neccessary permission to toggle the state for this Link. \n";
						$sErrMesg .= "You will need to request access from the Premise Owner to modify a Link's state. \n";
					}
				}
				
				//----------------------------------------------------//
				//-- PART 4 - Change the state of the Link          --//
				//----------------------------------------------------//
				if( $bError===false ) {
					//-- Change the state --//
					$aLinkChangeState = LinkChangeState( $iPostId, $iNewState );
					
					//-- Check for errors --//
					if( $aLinkChangeState["Error"]===true ) {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'4410' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aLinkChangeState["ErrMesg"];
					}
				}
				
				//----------------------------------------------------//
				//-- PART 5 - Retrieve current Link State           --//
				//----------------------------------------------------//
				if( $bError===false ) {
					$aStateResultsNew = LinkRetrieveState( $iPostId );
					
					if( $aStateResultsNew["Error"]===false ) {
						$aResult = $aStateResultsNew["Data"];
						
						//-------------------------------------------//
						//-- Prepare variables for the Premise Log --//
						//-------------------------------------------//
						if( $iNewState===1 ) {
							$iPresetLogId = 8;
						} else if( $iNewState===0 ) {
							$iPresetLogId = 7;
						}
						$iPremiseId		= $aStateResults["Data"]["PremiseId"];
						$sLogCustom1	= $aStateResults["Data"]["LinkName"];
						
					} else {
						//-- Display an Error message --//
						$bError = true;
						$sErrMesg .= "Error Code:'4411' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= $aStateResultsNew["ErrMesg"];
					}
				}
			//----------------------------------------------------//
			//-- Catch an error if one occurs that is catchable --//
			//----------------------------------------------------//
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError = true;
				$sErrMesg .= "Error Code:4400 \n";
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
			$aLogResult = AddPresetLogToPremiseLog( $iPresetLogId, $iLogNowUTS, $iPremiseId, $sLogCustom1 );
			//echo "<br />\n";
			//var_dump( $aLogResult );
			//echo "<br />\n";
		}
	} catch( Exception $e9800 ) {
		//-- Error Catching --//
		$bError = true;
		$sErrMesg .= "Error Code:'0400 \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Premise Log Error! \n";
	}
}

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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()." \n";
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
		
	} catch( Exception $e9995 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005'!\n Critical Error has occured!";
	}
}






?>