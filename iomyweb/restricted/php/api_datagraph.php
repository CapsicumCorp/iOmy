<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used to fetch the graph data for a particular IO
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

if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                     --//
//----------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                           --//
$iErrCode                   = 0;            //-- INTEGER:       --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                         --//
$sOutput                    = "";           //-- STRING:        Used to store the String that this API passes back to the user has the response body    --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.                                                              --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.                                    --//
$sPostData                  = "";           //-- STRING:        --//
$aPostData                  = array();      //-- ARRAY:         --//
$iPostStartUTS              = 0;            //-- INTEGER:       --//
$iPostEndUTS                = 0;            //-- INTEGER:       --//

$sDataType                  = "";           //-- STRING:        --//
$iIOId                      = 0;            //-- INTEGER:       --//
$bUsesIO                    = false;        //-- BOOLEAN:       --//


//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/graph_jqplot.php';
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//


//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//


//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	
	//-- 2.1.1 - Setup the array to contain what HTTP POST Parameters to look for and format --//
	$RequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Data',          "DataType"=>'STR' ),
		array( "Name"=>'StartUTS',      "DataType"=>'INT' ),
		array( "Name"=>'EndUTS',        "DataType"=>'INT' ),
		array( "Name"=>'Points',        "DataType"=>'INT' )
	);
	
	//-- 2.1.2- Call the function that checks to make sure the HTTP POST Parameters exist --//
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
	
	//-- Verify that no errors have been found --//
	//if( $aHTTPData===null ) {
	//	$bError = true;
	//}
}


//----------------------------------------------------//
//-- 2.2 - Retrieve the POST Parameters             --//
//----------------------------------------------------//
if($bError===false) {
	
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "GraphLine" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="GraphLine" && $sPostMode!=="6HourPiePreviousDay" ) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter. \n";
			$sErrMesg .= "eg. \n \"GraphLine\" and \"6HourPiePreviousDay\" \n\n";
		}
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter. \n";
		$sErrMesg .= "eg. \n \"GraphLine\" and \"6HourPiePreviousDay\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve the JSON "Data"               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "Data" --//
			$sPostData = $aHTTPData["Data"];
			
			if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
				//------------------------------------------------//
				//-- "Data" JSON Parsing                        --//
				//------------------------------------------------//
				$aPostData = json_decode( $sPostData, true );
				
				//------------------------------------------------//
				//-- IF "null" or a false like value            --//
				//------------------------------------------------//
				if( $aPostData===null || $aPostData==false ) {
					$bError    = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid POST \"Data\"! \n";
					$sErrMesg .= "Couldn't extract JSON values from the \"Data\" Parameter \n";
					$sErrMesg .= "eg. \n { \"Type\":\"NormalAvg\", \"IOId\":1 } \n\n";
				}
			} else {
				$bError = true;
				$iErrCode  = 103;
				$sErrMesg .= "Error Code:'0103' \n";
				$sErrMesg .= "Invalid \"Data\" parameter! \n";
				$sErrMesg .= "Please use a valid JSON \"Data\" parameter.\n";
				$sErrMesg .= "eg. \n { \"Type\":\"NormalAvg\", \"IOId\":1 } \n\n";
			}
		} catch( Exception $e0104 ) {
			$bError    = true;
			$iErrCode  = 104;
			$sErrMesg .= "Error Code:'0104' \n";
			$sErrMesg .= "Incorrect \"Data\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Data\" parameter. \n";
			$sErrMesg .= "eg. \n { \"Type\":\"NormalAvg\", \"IOId\":1 } \n\n";
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "StartUTS"                    --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $sPostMode==="GraphLine" ) {
				//-- Retrieve the "StartUTS" --//
				$iPostStartUTS = $aHTTPData["StartUTS"];
				
				if( $iPostStartUTS===false ) {
					$bError    = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Non numeric \"StartUTS\" parameter! \n";
					$sErrMesg .= "Please use a valid \"StartUTS\" parameter\n";
				}
			}
		} catch( Exception $e0106 ) {
			$bError = true;
			$iErrCode  = 106;
			$sErrMesg .= "Error Code:'0106' \n";
			$sErrMesg .= "Non numeric \"StartUTS\" parameter! \n";
			$sErrMesg .= "Please use a valid \"StartUTS\" parameter\n";
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.4 - Retrieve "EndUTS"                      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "EndUTS" --//
			$iPostEndUTS = $aHTTPData["EndUTS"];
			
			if( $iPostEndUTS===false ) {
				$bError = true;
				$iErrCode  = 107;
				$sErrMesg .= "Error Code:'0107' \n";
				$sErrMesg .= "Non numeric \"EndUTS\" parameter!\n";
				$sErrMesg .= "Please use a valid \"EndUTS\" parameter\n";
				
			} else if( $iPostEndUTS<=$iPostStartUTS ) {
				$bError = true;
				$iErrCode  = 107;
				$sErrMesg .= "Error Code:'0107' \n";
				$sErrMesg .= "Problem with the \"EndUTS\" parameter!\n";
				$sErrMesg .= "It appears to be either equal or less than the \"StartUTS\" parameter.\n";
			}
		} catch( Exception $e0108 ) {
			$bError = true;
			$iErrCode  = 108;
			$sErrMesg .= "Error Code:'0108' \n";
			$sErrMesg .= "Non numeric \"EndUTS\" parameter!\n";
			$sErrMesg .= "Please use a valid \"EndUTS\" parameter. \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5 - Retrieve Desired "Points"              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $sPostMode==="GraphLine" ) {
				//-- Retrieve the "Points" --//
				$iPostPoints = $aHTTPData["Points"];
				
				if( $iPostPoints===false ) {
					$bError    = true;
					$iErrCode  = 109;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Non numeric \"Points\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Points\" parameter.\n";
					$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
				}
			}
		} catch( Exception $e0110 ) {
			$bError    = true;
			$iErrCode  = 110;
			$sErrMesg .= "Error Code:'0110' \n";
			$sErrMesg .= "Incorrect \"Points\" parameter!\n";
			$sErrMesg .= "Please use a valid \"Points\" parameter.\n";
			$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
}





//====================================================================//
//== 4.0 - PREPARATION FOR MAIN SECTION                             ==//
//====================================================================//
if( $bError===false ) {
	try {
		//--------------------------------------------------------------------//
		//-- 4.1 - Extract the JSON "Data" Array                            --//
		//--------------------------------------------------------------------//
		if( $sPostMode==="GraphLine" || $sPostMode==="6HourPiePreviousDay" ) {
			try {
				//-- If Both Variables are present in JSON Data array --//
				if( isset( $aPostData['Type'] ) ) {
					
					//----------------------------------------------------//
					//-- Extract the Type                               --//
					//----------------------------------------------------//
					if( is_string( $aPostData['Type'] ) && trim($aPostData['Type'])!=="" ) {
						
						//-- Store the DataType --//
						$sDataType = $aPostData['Type'];
						
						//----------------------------------------------------//
						//-- Extract the other variables that the Type uses --//
						//----------------------------------------------------//
						if( $sPostMode==="GraphLine" || $sPostMode==="6HourPiePreviousDay" ) {
							
							//----------------------------//
							//-- IO Id                  --//
							//----------------------------//
							if( isset( $aPostData['IOId'] ) ) {
								
								if( $sPostMode==="GraphLine" && $sDataType==="NormalAvg" ) {
									//-- Extract the IO Id and flag that the IO is used --//
									$bUsesIO = true;
									$iIOId   = $aPostData['IOId'];
									
								} else if( $sPostMode==="6HourPiePreviousDay" && $sDataType==="Normal" ) {
									//-- Extract the IO Id and flag that the IO is used --//
									$bUsesIO = true;
									$iIOId   = $aPostData['IOId'];
									
								} else {
									//-- ERROR: Unsupported DataType --//
									$bError    = true;
									$iErrCode  = 305;
									$sErrMesg .= "Error Code:'0305' \n";
									$sErrMesg .= "Unsupported \"Type\" used in the \"Data\" parameter! \n";
									$sErrMesg .= "Please check that the \"Type\" provided in the \"Data\" parameter is supported by the provided \"Mode\". \n";
								}
								
							} else {
								//-- Error --//
								$bError    = true;
								$iErrCode  = 304;
								$sErrMesg .= "Error Code:'0304' \n";
								$sErrMesg .= "Invalid or missing \"Type\" in the \"Data\" parameter! \n";
								$sErrMesg .= "";
							}
							
						} //-- ELSE the mode doesn't need anything but the type --//
						
					} else {
						//-- DataType is not valid --//
						$bError    = true;
						$iErrCode  = 303;
						$sErrMesg .= "Error Code:'0303' \n";
						$sErrMesg .= "Invalid \"Type\" in the \"Data\" parameter! \n";
					}
						
				} else {
					//-- Error --//
					$bError    = true;
					$iErrCode  = 302;
					$sErrMesg .= "Error Code:'0302' \n";
					$sErrMesg .= "Invalid or missing \"Type\" in the \"Data\" parameter! \n";
					$sErrMesg .= "";
				}
			} catch( Exception $e0301 ) {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 301;
				$sErrMesg .= "Error Code:'0301' \n";
				$sErrMesg .= "Critical Error parsing the JSON \"Data\" Parameter! \n";
				$sErrMesg .= " \n";
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 4.2 - Verify that the user can access the IO                   --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			try{
				//-- If the Mode is one that may use IO data --//
				if( $bUsesIO===true ) {
					//-- Call the function that checks if the user has access to the IO --//
					$aTempIOInfo = GetIOInfo($iIOId);
						
					//-- IF no errors have occurred --//
					if( $aTempIOInfo["Error"]===false ) {
						$aIOInfo    = $aTempIOInfo["Data"];
						
						//----------------------------------------------------//
						//-- Extract the commonly used IO Information       --//
						//----------------------------------------------------//
						
						//-- Data Read Permission --//
						if( isset( $aIOInfo['PermDataRead'] ) ) {
							$bIOPermDataRead = $aIOInfo['PermDataRead'];
						}
						
						//-- Extract the Base Convert  --//
						if( isset( $aIOInfo['IOBaseConvert'] ) ) {
							$iIOBaseConvert = $aIOInfo['IOBaseConvert'];
						}
						
						//-- Extract the SampleRate --//
						if( isset( $aIOInfo['IOSampleRateCurrent'] ) ) {
							$iIOSampleRate = $aIOInfo['IOSampleRateCurrent'];
						}
						
						//-- Extract the SampleRateMax --//
						if( isset( $aIOInfo['IOSampleRateMax'] ) ) {
							$iIOSampleRateMax = $aIOInfo['IOSampleRateMax'];
						}
						
						//-- Extract the IO's DataType --//
						if( isset( $aIOInfo['DataTypeId'] ) ) {
							$iIODataType = $aIOInfo['DataTypeId'];
						}
						
						//-- Extract the Enumeration Type --//
						if( isset( $aIOInfo['DataEnumeration'] ) ) {
							$iIODataEnumeration = $aIOInfo['DataEnumeration'];
						}
						
						//-- Extract the UoM Id --//
						if( isset( $aIOInfo['UoMId'] ) ) {
							$iIOUoMId = $aIOInfo['UoMId'];
						}
						
						//-- Extract the UoM Name --//
						if( isset( $aIOInfo['UoMName'] ) ) {
							$sIOUoMName = $aIOInfo['UoMName'];
						}
						
						//-- Debugging --//
						//var_dump( $aIOInfo );
						
					//-- ELSE store the error --//
					} else {
						$bError    = true;
						$iErrCode  = 326;
						$sErrMesg .= "Error Code:'0326' \n";
						$sErrMesg .= "Failed to find or lookup anything about the IO! \n";
						$sErrMesg .= "IO either doesn't exist or you do not have permission to access it! \n";
						//$sErrMesg .= $aTempIOInfo["ErrMesg"];
					}
				} //-- ELSE The Type doesn't use an IO --//
			} catch( Exception $e0325 ) {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 325;
				$sErrMesg .= "Error Code:'0325' \n";
				$sErrMesg .= "Critical Error looking up information about an IO! \n";
				$sErrMesg .= $e0325>getMessage();
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 4.3 - Validate of the IO Data                                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			try {
				if( $sPostMode==="GraphLine" ) {
					//-- "IO Line" Sample rate checks --//
					if( $sDataType==="NormalAvg" ) {
						//-- Make sure that the Sample Rate of the IO indicates that it is suitable --//
						if( $iIOSampleRate>=1 && $iIOSampleRateMax>=1 ) {
							//-- Work out the Difference stamp --//
							$iLineGraphDiff = getDiffStampForGraph( $iPostStartUTS, $iPostEndUTS, $iIOSampleRateMax, $iPostPoints );
							
						} else {
							//-- ERROR: IO is not setup to be used by an averaged linegraph --//
							$bError    = true;
							$iErrCode  = 331;
							$sErrMesg .= "Error Code:'0331' \n";
							$sErrMesg .= "Problem with the provided IO's Samplerates! \n";
							$sErrMesg .= "The IO is not marked as having constant database submission times which is a requirement for \"NormalAvg\" line graphs. \n";
						}
					}
				}	//-- ELSE The current mode does not require any extra checking of the IO' Information before proceeding --//
			} catch( Exception $e0330 ) {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 330;
				$sErrMesg .= "Error Code:'0330' \n";
				$sErrMesg .= "Problem when checking and validating the IO's Information! \n";
				$sErrMesg .= "";
			}
		}
	} catch( Exception $e0300 ) {
		$bError    = true;
		$iErrCode  = 300;
		$sErrMesg .= "Error Code:'0300' \n";
		$sErrMesg .= "Problem when checking and validating the IO's Information! \n";
		$sErrMesg .= $e0300->getMessage();
	}
}



//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Line                                           ==//
		//================================================================//
		if( $sPostMode==="GraphLine" ) {
			try {
				if( $sDataType==="NormalAvg" ) {
					//-- Fetch the Line Data --//
					$aResult = GetGraphLineIOAvg( $iIOId, $iIODataType, $iPostStartUTS, $iPostEndUTS, $iLineGraphDiff );
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 1400;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= "Critical error occurred when trying to get the Line Graph data! \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
			
		//================================================================//
		//== 5.2 - MODE: 6Hour Pie before Midnight Graph                ==//
		//================================================================//
		} else if( $sPostMode==="6HourPiePreviousDay" ) {
			try {
				//--------------------------------//
				//-- Setup the Result variable  --//
				//--------------------------------//
				$aResult = array(
					"Error"     => false,
					"Data"      => array(
						"UoMId"     => $iIOUoMId,
						"UoMName"   => $sIOUoMName
					)
				);
				
				//--------------------------------//
				//-- Evening                    --//
				//--------------------------------//
				if( $bError===false ) {
					//-- Setup the Timestamps --//
					$iEndStamp   = $iPostEndUTS;
					$iStartStamp = $iPostEndUTS - 60*60*6;
					
					//-- Get the Value --//
					$aTempResult1 = GetIOSpecialTotaledEnumValue( $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
					
					//-- IF an error occurred trying to value --//
					if( $aTempResult1['Error']===false ) {
						//-- Store the result --//
						$aResult["Data"]["Evening"] = $aTempResult1['Data']['Value'];
						
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2401;
						$sErrMesg .= "Error Code:'2401' \n";
						$sErrMesg .= "Problem with the \"Evening\" data! \n";
						$sErrMesg .= "The issue occurred when trying to make the \"Six Hour Pie Graph\" data. \n";
					}
				}
				
				
				//--------------------------------//
				//-- Afternoon                  --//
				//--------------------------------//
				if( $bError===false ) {
					//-- Setup the Timestamps --//
					$iEndStamp   = $iStartStamp;
					$iStartStamp = $iEndStamp - 60*60*6;
					
					//-- Get the Value --//
					$aTempResult1 = GetIOSpecialTotaledEnumValue( $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
					
					//-- IF an error occurred trying to value --//
					if( $aTempResult1['Error']===false ) {
						//-- Store the result --//
						$aResult['Data']["Afternoon"] = $aTempResult1['Data']['Value'];
						
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2402;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= "Problem with the \"Afternoon\" data! \n";
						$sErrMesg .= "The issue occurred when trying to make the \"Six Hour Pie Graph\" data. \n";
					}
				}
				
				
				//--------------------------------//
				//-- Morning                    --//
				//--------------------------------//
				if( $bError===false ) {
					//-- Setup the Timestamps --//
					$iEndStamp   = $iStartStamp;
					$iStartStamp = $iEndStamp - 60*60*6;
					
					//-- Get the Value --//
					$aTempResult1 = GetIOSpecialTotaledEnumValue( $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
					
					//-- IF an error occurred trying to value --//
					if( $aTempResult1['Error']===false ) {
						//-- Store the result --//
						$aResult['Data']["Morning"] = $aTempResult1['Data']['Value'];
						
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2403;
						$sErrMesg .= "Error Code:'2403' \n";
						$sErrMesg .= "Problem with the \"Morning\" data! \n";
						$sErrMesg .= "The issue occurred when trying to make the \"Six Hour Pie Graph\" data. \n";
					}
				}
				
				//--------------------------------//
				//-- Night                      --//
				//--------------------------------//
				if( $bError===false ) {
					//-- Setup the Timestamps --//
					$iEndStamp   = $iStartStamp;
					$iStartStamp = $iEndStamp - 60*60*6;
					
					//-- Get the Value --//
					$aTempResult1 = GetIOSpecialTotaledEnumValue( $iIODataType, $iIOId, $iStartStamp, $iEndStamp );
					
					//-- IF an error occurred trying to value --//
					if( $aTempResult1['Error']===false ) {
						//-- Store the result --//
						$aResult['Data']["Night"] = $aTempResult1['Data']['Value'];
						
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2404;
						$sErrMesg .= "Error Code:'2404' \n";
						$sErrMesg .= "Problem with the \"Night\" data! \n";
						$sErrMesg .= "The issue occurred when trying to make the \"Six Hour Pie Graph\" data. \n";
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 2400;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= "Critical error occurred when trying to get the Line Graph data! \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== Unsupported Mode                                           ==//
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
		$sErrMesg .= "Critical error occurred in the main section of the API! \n";
		$sErrMesg .= $e0400->getMessage();
	}
}
//====================================================================//
//== 8.0 - Log the Results                                          ==//
//====================================================================//




//====================================================================//
//== 9.0 - Finalise                                                 ==//
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
		$sOutput = "Error Code:'0002' \n No Result!";
	
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