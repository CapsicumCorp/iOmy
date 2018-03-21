<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is only used so far for editing Hub information.
//== @Copyright: Capsicum Corporation 2018
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
//== #1.0# - INITIALISE                                                                                 ==//
//========================================================================================================//

//------------------------------------------------------------//
//-- 1.1 - DECLARE THE SITE BASE VARIABLE                   --//
//------------------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError         = false;    //-- BOOLEAN:       Used to indicate if an error has been caught --//
$sErrMesg       = "";       //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput        = "";       //-- STRING:        --//
$aResult        = array();  //-- ARRAY:         Used to store the results. --//
$sPostMode      = "";       //-- STRING:        Used to store which Mode the API should function in. --//
$iPostId        = "";       //-- STRING:        Used to store the "Hub Id" --//
$sPostJSONData  = "";       //-- STRING:        --//
$aPostJSONData  = array();  //-- ARRAY:         --//


$sPostName      = "";       //-- STRING:        Used to store the desired "Hub Name".  --//
$aHubInfo       = array();  //-- ARRAY:         Used to store the "Hub Information" that most modes in this API depend on.  --//
$iPremiseId     = 0;        //-- INTEGER:       This variable is used to identify the Premise for the Premise Log. --//
$iLogNowUTS     = 0;        //-- INTEGER:       --//
$iPresetLogId   = 0;        //-- INTEGER:       --//
$sLogCustom1    = "";       //-- STRING:        Special variable for the Premise Log. --//

//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//



//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//
$iTelnetHubTypeId1       = LookupFunctionConstant("AndroidWatchInputsHubTypeId");


//========================================================================================================//
//== #2.0# - Retrieve POST                                                                              ==//
//========================================================================================================//


//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Id',            "DataType"=>'INT' ),
		array( "Name"=>'Data',          "DataType"=>'STR' )
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
		//-- NOTE: Valid modes are going to be "LookupStreams", "AddStream", "EditStream", "", "" --//
		
		//-- Verify that the mode is supported --//
		if( 
			$sPostMode!=="LookupStreams"        && $sPostMode!=="AddStream"            &&
			$sPostMode!=="EditStream"           
			
		) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"LookupStreams\", \"AddStream\" and \"EditStream\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"LookupStreams\", \"AddStream\" and \"EditStream\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Hub "Id"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $sPostMode==="AddStream" || $sPostMode==="EditStream" ) {
				//-- Retrieve the Stream "Id" --//
				$iPostId = $aHTTPData["Id"];
				
				if( $iPostId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Non numeric \"Id\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Id\" parameter\n";
					$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
				}
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
	//-- 2.2.3.A - Retrieve the JSON "Data"             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if(
				$sPostMode==="AddStream"             || $sPostMode==="EditStream"            
			) {
				try {
					//-- Retrieve the "Data" --//
					$sPostJSONData = $aHTTPData["Data"];
					
					if( $sPostJSONData===false ) {
						$bError    = true;
						$iErrCode  = 106;
						$sErrMesg .= "Error Code:'0106' \n";
						$sErrMesg .= "Non string \"Data\" parameter! \n";
						$sErrMesg .= "Please use a valid \"Data\" parameter\n";
						
					} else {
						//------------------------------------------------//
						//-- "ACCESS" JSON PARSING                      --//
						//------------------------------------------------//
						$aPostJSONData = json_decode( $sPostJSONData, true );
						
						//------------------------------------------------//
						//-- IF "null" or a false like value            --//
						//------------------------------------------------//
						if( $aPostJSONData===null || $aPostJSONData==false ) {
							$bError    = true;
							$iErrCode  = 106;
							$sErrMesg .= "Error Code:'0106' \n";
							$sErrMesg .= "Invalid POST \"Data\" \n";
							$sErrMesg .= "Failed to decode the json ";
						}
					}
				} catch( Exception $e0108 ) {
					$bError    = true;
					$iErrCode  = 108;
					$sErrMesg .= "Error Code:'0108' \n";
					$sErrMesg .= "Incorrect \"Data\" parameter!";
					$sErrMesg .= "Please use a valid \"Data\" parameter";
				}
			}
		} catch( Exception $e0108 ) {
			$bError    = true;
			$iErrCode  = 108;
			$sErrMesg .= "Error Code:'0108' \n";
			$sErrMesg .= "Incorrect \"Data\" parameter!";
			$sErrMesg .= "Please use a valid \"Data\" parameter";
		}
	}
}

//========================================================================================================//
//== #3.0# - PREPARE                                                                                    ==//
//========================================================================================================//
if($bError===false) {
	try {
		//------------------------------------------------------------//
		//-- 3.1 - Check if the User has permission to use this API --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			
			//----------------------------------------------------------------//
			//-- Check the CommInfo                                         --//
			//----------------------------------------------------------------//
			$aHubData = HubRetrieveInfoAndPermission( $iPostId );
			
			if( $aHubData['Error']===false ) {
				//-- Store the Write Permission --//
				$iHubOwnerPerm      = $aHubData['Data']['PermOwner'];
				$iHubWritePerm      = $aHubData['Data']['PermWrite'];
				$sHubName           = $aHubData['Data']['HubName'];
				$sHubIPAddress      = $aHubData['Data']['HubIpaddress'];
				$iHubTypeId         = $aHubData['Data']['HubTypeId'];
				
				
				if( $iHubTypeId!==$iTelnetHubTypeId1 ) {
					//------------------------------------------------//
					//-- ERROR: Unsupported HubType                 --//
					//------------------------------------------------//
					$bError = true;
					$iErrCode  = 201;
					$sErrMesg .= "Error Code:'0201' \n";
					$sErrMesg .= "The HubType is not supported by this API.\n";
					$sErrMesg .= "Please use a valid HubId of a supported Hub (Android WatchInputs).\n";
					
				} else if( $iHubOwnerPerm!==1 && $iHubOwnerPerm!=="1" ) {
					//------------------------------------------------//
					//-- ERROR: Invalid Permissions                 --//
					//------------------------------------------------//
					$bError = true;
					$iErrCode  = 202;
					$sErrMesg .= "Error Code:'0202' \n";
					$sErrMesg .= "The HubType is not supported by this API.\n";
					$sErrMesg .= "Please use a valid HubId of a supported Hub (Android WatchInputs).\n";
					
				} else if( $sHubIPAddress===false || $sHubIPAddress===null || $sHubIPAddress==="" || strlen($sHubIPAddress)<2 ) {
					//------------------------------------------------//
					//-- ERROR: Invalid Network Address             --//
					//------------------------------------------------//
					$bError = true;
					$iErrCode  = 203;
					$sErrMesg .= "Error Code:'0203' \n";
					$sErrMesg .= "The network address for this Hub does not seem suitable!\n";
					$sErrMesg .= "Please check the database to ensure this Hub has a suitable network address.\n";
				}
				
				//var_dump( $aHubData['Data'] );
				
			} else {
				$bError    = true;
				$iErrCode  = 204;
				$sErrMesg .= "Error Code:'0204' \n";
				$sErrMesg .= "Problem looking up the Info for the selected Hub.\n";
				$sErrMesg .= $aHubData['ErrMesg'];
			}
			
		}
		
		//------------------------------------------------------------//
		//-- 3.2 - Extract values from the 'Data' JSON Parameter    --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			
			//----------------------------------------------------//
			//-- 3.2.1 - Extract 'Name'                         --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddStream" || $sPostMode==="EditStream" ) {
					try {
						if( isset( $aPostJSONData['Name'] ) ) {
							$sPostName = $aPostJSONData['Name'];
							
							if( $sPostName===false || $sPostName===null ) {
								//------------------------------------//
								//-- ERROR: Invalid Timestamp       --//
								//------------------------------------//
								$bError    = true;
								$iErrCode  = 212;
								$sErrMesg .= "Error Code:'0212' \n";
								$sErrMesg .= "Error: The 'Name' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							//------------------------------------//
							$bError    = true;
							$iErrCode  = 211;
							$sErrMesg .= "Error Code:'0211' \n";
							$sErrMesg .= "Error: The 'Name' value in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0211 ) {
						$bError = true;
						$iErrCode  = 211;
						$sErrMesg .= "Error Code:'0211' \n";
						$sErrMesg .= "Error: Problem extracting the 'Name' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- 3.2.2 - Extract 'Enabled'                      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddStream" || $sPostMode==="EditStream" ) {
					try {
						if( isset( $aPostJSONData['Enabled'] ) ) {
							$iPostEnabled = $aPostJSONData['Enabled'];
							
							if( 
								$iPostEnabled!==0         && $iPostEnabled!=="0"      &&
								$iPostEnabled!==1         && $iPostEnabled!=="1"      
							) {
								//------------------------------------//
								//-- ERROR: Invalid Timestamp       --//
								//------------------------------------//
								$bError    = true;
								$iErrCode  = 214;
								$sErrMesg .= "Error Code:'0214' \n";
								$sErrMesg .= "Error: The 'Name' value in the 'Data' JSON parameter is not supported!\n";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							//------------------------------------//
							$bError    = true;
							$iErrCode  = 213;
							$sErrMesg .= "Error Code:'0213' \n";
							$sErrMesg .= "Error: The 'Name' value in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0213 ) {
						$bError = true;
						$iErrCode  = 213;
						$sErrMesg .= "Error Code:'0213' \n";
						$sErrMesg .= "Error: Problem extracting the 'Name' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- 3.2.3 - Extract 'ThingId'                      --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="AddStream" ) {
					try {
						if( isset( $aPostJSONData['ThingId'] ) ) {
							if( is_numeric( $aPostJSONData['ThingId'] ) ) {
								$iPostThingId = intval( $aPostJSONData['ThingId'] );
								
								//-- IF the number is positive --//
								if( !($iPostThingId >= 1) ) {
									//------------------------------------//
									//-- ERROR: Invalid ThingId         --//
									//------------------------------------//
									$bError    = true;
									$iErrCode  = 216;
									$sErrMesg .= "Error Code:'0216' \n";
									$sErrMesg .= "Error: The 'ThingId' value in the 'Data' JSON parameter is not supported!\n";
									$sErrMesg .= "The value is not greater than or equal to one.";
								}
							} else {
								//------------------------------------//
								//-- ERROR: Non-Numeric             --//
								//------------------------------------//
								$bError    = true;
								$iErrCode  = 216;
								$sErrMesg .= "Error Code:'0216' \n";
								$sErrMesg .= "Error: The 'ThingId' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "Please use a numeric value.\n";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							//------------------------------------//
							$bError    = true;
							$iErrCode  = 215;
							$sErrMesg .= "Error Code:'0215' \n";
							$sErrMesg .= "Error: The 'ThingId' value in the 'Data' JSON parameter is not supported!\n";
						}
						
					} catch( Exception $e0215 ) {
						$bError = true;
						$iErrCode  = 215;
						$sErrMesg .= "Error Code:'0215' \n";
						$sErrMesg .= "Error: Problem extracting the 'ThingId' value in the 'Data' JSON parameter!\n";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- 3.2.4 - Extract 'StreamId'                     --//
			//----------------------------------------------------//
			if( $bError===false ) {
				if( $sPostMode==="EditStream" ) {
					try {
						if( isset( $aPostJSONData['StreamId'] ) ) {
							if( is_numeric( $aPostJSONData['StreamId'] ) ) {
								$iPostStreamId = intval( $aPostJSONData['StreamId'] );
								
								//-- IF the number is positive --//
								if( !($iPostStreamId >= 1) ) {
									//------------------------------------//
									//-- ERROR: Invalid Id              --//
									//------------------------------------//
									$bError    = true;
									$iErrCode  = 218;
									$sErrMesg .= "Error Code:'0218' \n";
									$sErrMesg .= "Error: The 'Id' value in the 'Data' JSON parameter is not supported!\n";
									$sErrMesg .= "The value is not greater than or equal to one.";
								}
							} else {
								//------------------------------------//
								//-- ERROR: Non-Numeric             --//
								//------------------------------------//
								$bError    = true;
								$iErrCode  = 218;
								$sErrMesg .= "Error Code:'0218' \n";
								$sErrMesg .= "Error: The 'Id' value in the 'Data' JSON parameter is not supported!\n";
								$sErrMesg .= "Please use a numeric value.\n";
							}
						} else {
							//------------------------------------//
							//-- ERROR: Missing Parameter       --//
							//------------------------------------//
							$bError    = true;
							$iErrCode  = 217;
							$sErrMesg .= "Error Code:'0217' \n";
							$sErrMesg .= "Error: The 'Id' value in the 'Data' JSON parameter is not supported!\n";
						}
					} catch( Exception $e0217 ) {
						$bError = true;
						$iErrCode  = 217;
						$sErrMesg .= "Error Code:'0217' \n";
						$sErrMesg .= "Error: Problem extracting the 'Id' value in the 'Data' JSON parameter!\n";
					}
				}
			}
		}	//-- ENDIF No Errors check ( 3.1 Extract desired values from the 'Data' json parameter ) --//
		
		
		//------------------------------------------------------------//
		//-- 3.2 - Lookup the ThingId                               --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="AddStream" ) {
				try {
					if( $bError===false ) {
						$aThingInfoTemp = GetThingInfo( $iPostThingId );
						
						if( $aThingInfoTemp['Error']===false ) {
							$aThingInfo = $aThingInfoTemp['Data'];
						} else {
							$bError = true;
							$iErrCode  = 231;
							$sErrMesg .= "Error Code:'0231' \n";
							$sErrMesg .= "Error: Couldn't access the Thing Info of the provided ThingId! \n";
							$sErrMesg .= $aThingData['ErrMesg'];
						}
					}
					
				} catch( Exception $e0230 ) {
					$bError = true;
					$iErrCode  = 230;
					$sErrMesg .= "Error Code:'0230' \n";
					$sErrMesg .= "Critical Error: Problem occurred when looking up the Thing Info! \n";
				}
			}
		}
		
		//------------------------------------------------------------//
		//-- 3.3 - Lookup the Managed Stream Id                     --//
		//------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="EditStream" ) {
				try {
					$aFunctionTemp2 = WatchInputsGetManagedCameraStreamFromStreamId( $iPostStreamId );
					
					if( $aFunctionTemp2['Error']===true ) {
						$bError    = true;
						$iErrCode  = 3201;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem editing the WatchInputs cameralib managed stream!\n";
						$sErrMesg .= "Failed to lookup the existing stream. \n";
						$sErrMesg .= "The stream may either not exist or your User may not have permission to it. \n";
					}
					
				} catch( Exception $e0240 ) {
					$bError = true;
					$iErrCode  = 240;
					$sErrMesg .= "Error Code:'' \n";
					$sErrMesg .= "Error: \n";
				}
			}
		}
	} catch( Exception $e0200 ) {
		$bError    = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= $e0200->getMessage();
	}
}


//========================================================================================================//
//== #5.0# - MAIN                                                                                       ==//
//========================================================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Edit Hub Name                                  ==//
		//================================================================//
		if( $sPostMode==="LookupStreams" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup the Values in the database                      --//
				//--------------------------------------------------------------------//
				$aFunctionTemp1 = WatchInputsGetManagedCameraStreams();
				
				if( $aFunctionTemp1['Error']===true ) {
					$bError    = true;
					$iErrCode  = 1401;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Problem looking up WatchInputs cameralib !\n";
					$sErrMesg .= "There is already a WatchInputs cameralib stream with that Id. \n";
				}
				
				$aResult = $aFunctionTemp1;
				
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
		//================================================================//
		//== 5.2 - MODE: Edit Hub Name                                  ==//
		//================================================================//
		} else if( $sPostMode==="AddStream" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Check to make sure the stream doesn't already exist    --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aFunctionTemp2 = WatchInputsGetManagedCameraStreamFromThingId( $iPostThingId );
					
					if( $aFunctionTemp2['Error']===false ) {
						$bError    = true;
						$iErrCode  = 2401;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem inserting the new WatchInputs cameralib managed stream!\n";
						$sErrMesg .= "There is already a WatchInputs cameralib stream with that Id. \n";
					}
				}
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Add the Managed Stream                                 --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aResult = WatchInputsManagedStreamAdd( $iPostThingId, $sPostName, $iPostEnabled );
					
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 2403;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem inserting the new WatchInputs cameralib managed stream!\n";
						$sErrMesg .= $aResult['ErrMesg'];
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Edit Hub Name                                  ==//
		//================================================================//
		} else if( $sPostMode==="EditStream" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Add the Managed Stream                                 --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aResult = WatchInputsManagedStreamEdit( $iPostStreamId, $sPostName, $iPostEnabled );
					
					if( $aResult['Error']===true ) {
						$bError    = true;
						$iErrCode  = 3403;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem editing WatchInputs cameralib managed stream!\n";
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
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			//-- ERROR --//
			$bError = true;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Error: Unsupported 'Mode' Parameter!\n";
		}
		
	} catch( Exception $e1000 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e1000->getMessage();
	}
}

//========================================================================================================//
//== #8.0# - Log the Results                                                                            ==//
//========================================================================================================//
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
	} catch( Exception $e0980 ) {
		//-- Error Catching --//
		$bError = true;
		$sErrMesg .= "Error Code:'0980' \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= "Premise Log Error! \n";
	}
}

//========================================================================================================//
//== #9.0# - FINALISE                                                                                   ==//
//========================================================================================================//

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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
	}
	
//-- API Error has occurred --//
} else {
	//-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json" --//
	header('Content-Type: text/plain');
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$sOutput = "Error Code:'0002' \n No Result";
	
	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$sOutput  = "Error Code:'0003' \n Critical Error has occured!\n Undefinable Error Message\n";
	
	} else if( $sErrMesg!=false ) {
		//-- Output the Error Message --//
		$sOutput  = $sErrMesg;
		
	} else {
		//-- Error Message is blank --//
		$sOutput  = "Error Code:'0004' \n Critical Error has occured!";
	}
	
	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:'0005' \n Critical Error has occured!";
	}
}


?>