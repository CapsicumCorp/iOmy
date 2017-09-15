<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for adding/editing the various Rooms that the user has access to.
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
$iPostId                    = 0;            //-- INTEGER:       Used to store the "Room Id" --//
$iPostPremiseId             = 0;            //-- INTEGER:       Used to store the desired Room's "Premise Id" --//
$iPostRoomTypeId            = 0;            //-- INTEGER:       Used to store the desired Room's "RoomType Id" --//
$sPostName                  = "";           //-- STRING:        Used to store the desired Room "Name" --//
$sPostDesc                  = "";           //-- STRING:        Used to store the desired Room "Description" --//
$iPostFloor                 = 0;            //-- INTEGER:       Used to store the desired Room "Floor" --//
$iPostPremiseId             = 0;            //-- INTEGER:       Used to store the desired Room "PremiseId" --//
$aTempDataResult            = array();      //-- ARRAY:         Used to store the Results of either the "Room Info" or "Premise Info" lookup --//
$aTempDataResult2           = array();      //-- ARRAY:         --//
$iPremiseId                 = 0;            //-- INTEGER:       This variable is used to identify the Premise for the Premise Log. --//
$iLogNowUTS                 = 0;            //-- INTEGER:       --//
$iPresetLogId               = 0;            //-- INTEGER:       --//
$sLogCustom1                = "";           //-- STRING:        Special variable for the Premise Log. --//

//----------------------------------------------------//
//-- 1.3 - Import Required Libraries                --//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';                                   //-- This should call all the additional libraries needed --//




//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Id',            "DataType"=>'INT' ),
		array( "Name"=>'Name',          "DataType"=>'STR' ),
		array( "Name"=>'Desc',          "DataType"=>'STR' ),
		array( "Name"=>'Floor',         "DataType"=>'INT' ),
		array( "Name"=>'RoomTypeId',    "DataType"=>'INT' ),
		array( "Name"=>'PremiseId',     "DataType"=>'INT' ),
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
}


//----------------------------------------------------//
//-- 2.2 - Retrieve the API Parameters              --//
//----------------------------------------------------//
if($bError===false) {
	
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "EditInfo", "AddRoom", "DeleteRoom", "" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="AddRoom" && $sPostMode!=="EditInfo" && $sPostMode!=="DeleteRoom" ) {
			$bError = true;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddRoom\", \"EditInfo\" or \"DeleteRoom\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddRoom\", \"EditInfo\" or \"DeleteRoom\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Room "Id"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditInfo" || $sPostMode==="DeleteRoom" ) {
			try {
				//-- Retrieve the Room "Id" --//
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
				$sErrMesg .= "Incorrect \"Id\" parameter!";
				$sErrMesg .= "Please use a valid \"Id\" parameter";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Room "Name"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditInfo" || $sPostMode==="AddRoom" ) {
			try {
				//-- Retrieve the "Name" --//
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
				$sErrMesg .= "Incorrect \"Name\" parameter!";
				$sErrMesg .= "Please use a valid \"Name\" parameter";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.4.A - Retrieve Room "Desc"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditInfo" || $sPostMode==="AddRoom" ) {
			try {
				//-- Retrieve the "Desc" --//
				$sPostDesc = $aHTTPData["Desc"];
				
				if( $sPostDesc===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"Desc\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Desc\" parameter.\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"Desc\" parameter!";
				$sErrMesg .= "Please use a valid \"Desc\" parameter.";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.5.A - Retrieve Room "Floor"                --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditInfo" || $sPostMode==="AddRoom" ) {
			try {
				//-- Retrieve the "Floor" --//
				$iPostFloor = $aHTTPData["Floor"];
				
				if( $sPostName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Non numeric \"Floor\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Floor\" parameter.\n";
				}
			} catch( Exception $e0110 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"Floor\" parameter!";
				$sErrMesg .= "Please use a valid \"Floor\" parameter.";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.7.A - Retrieve Room "RoomTypeId"           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditInfo" || $sPostMode==="AddRoom" ) {
			try {
				//-- Retrieve the "RoomTypeId" --//
				$iPostRoomTypeId = $aHTTPData["RoomTypeId"];
				
				if( $sPostName===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0111' \n";
					$sErrMesg .= "Non numeric \"RoomTypeId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"RoomTypeId\" parameter.\n";
				}
			} catch( Exception $e0112 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"RoomTypeId\" parameter!";
				$sErrMesg .= "Please use a valid \"RoomTypeId\" parameter.";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.8.B - Retrieve Room "PremiseId"            --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="AddRoom" ) {
			try {
				//-- Retrieve the "PremiseId" --//
				$iPostPremiseId = $aHTTPData["PremiseId"];
				
				if( $iPostPremiseId===false ) {
					$bError = true;
					$sErrMesg .= "Error Code:'0113' \n";
					$sErrMesg .= "Non numeric \"PremiseId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"PremiseId\" parameter.\n";
				}
			} catch( Exception $e0114 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"PremiseId\" parameter!";
				$sErrMesg .= "Please use a valid \"PremiseId\" parameter.";
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
		//== 5.1 - MODE: Edit Room Info                                 ==//
		//================================================================//
		if( $sPostMode==="EditInfo" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup information about the Room                      --//
				//--------------------------------------------------------------------//
				$aTempDataResult = GetRoomInfoFromRoomId( $iPostId );
				
				if( $aTempDataResult["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aRoomDataResult["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Verify that the user has permission to change the Info --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aTempDataResult["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Room Info --//
						$aResult = ChangeRoomInfo( $iPostId, $sPostName, $iPostFloor, $sPostDesc, $iPostRoomTypeId );
						
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
							$iPresetLogId   = 0;
							$iPremiseId     = $aTempDataResult["Data"]["PremiseId"];
							$sLogCustom1    = $aTempDataResult["Data"]["RoomId"];
							
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'1407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Room Info! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1100->getMessage();
			}

		//================================================================//
		//== 5.2 - MODE: Add a new Room                                 ==//
		//================================================================//
		} else if( $sPostMode==="AddRoom" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Lookup information about the Room                      --//
				//--------------------------------------------------------------------//
				$aTempDataResult = GetPremisesInfoFromPremiseId( $iPostPremiseId );
				
				if( $aTempDataResult["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code: '2406' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aTempDataResult["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Verify that the user has permission to change the Info --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aTempDataResult["Data"]["PermRoomAdmin"]===1 ) {
						
						//-- Change the Room Info --//
						$aResult = AddNewRoom( $iPostPremiseId, $sPostName, $iPostFloor, $sPostDesc, $iPostRoomTypeId );
						
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
							$iPresetLogId   = 0;
							$iPremiseId     = $aTempDataResult["Data"]["PremiseId"];
							$sLogCustom1    = $aResult["Data"]["RoomId"];
						}
						
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'2407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Room Info! \n";
					}
				}
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}

		//================================================================//
		//== 5.3 - MODE: Delete an existing room                        ==//
		//================================================================//
		} else if( $sPostMode==="DeleteRoom" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Lookup information about the Room                      --//
				//--------------------------------------------------------------------//
				$aTempDataResult = GetRoomInfoFromRoomId( $iPostId );
				
				if( $aTempDataResult["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'3405' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= $aTempDataResult["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Lookup information about the Premise                   --//
				//--------------------------------------------------------------------//
				$aTempDataResult2 = GetPremisesInfoFromPremiseId( $aTempDataResult["Data"]["PremiseId"] );
				
				if( $aTempDataResult2["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$sErrMesg .= "Error Code:'3406' \n";
					$sErrMesg .= "Internal API Error! \n";
					$sErrMesg .= "Problem looking up the Premise information that the Room is in! \n";
					$sErrMesg .= $aTempDataResult2["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.3.3 - Verify that the user has permission to change the Info --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aTempDataResult2["Data"]["PermRoomAdmin"]===1 && $aTempDataResult["Data"]["PermRead"]===1 ) {
						
						//------------------------------------------------------------------------//
						//-- 5.3.3.1 - Check to make sure that no IOs are assigned to the room  --//
						//------------------------------------------------------------------------//
						$aDevicesInfo   = GetLinksFromRoomId( $iPostId );
						
						if( $aDevicesInfo['Error']===false ) {
							//-- Error: Devices are still assigned to the room --//
							$bError = true;
							$sErrMesg .= "Error Code:'3403' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= "Can not delete this Room!\n";
							$sErrMesg .= "There are still devices assigned to this room!";
							
						} else if( $aDevicesInfo['ErrMesg']!=="No Devices Found! \nNo Devices assigned to this room!\n" ) {
							//-- Error: Another error has occurred --//
							$bError = true;
							$sErrMesg .= "Error Code:'3404' \n";
							$sErrMesg .= "Internal API Error! \n";
							$sErrMesg .= "Problem looking up the IOs for this room. \n";
							$sErrMesg .= $aDevicesInfo['ErrMesg'];
							
						} else {
							//-- ELSE no devices are assigned --//
							
							//-- Delete the Room --//
							$aResult = DeleteExistingRoom( $iPostId );
							
							//-- Check for caught Errors --//
							if( $aResult["Error"]===true ) {
								$bError = true;
								$sErrMesg .= "Error Code:'3401' \n";
								$sErrMesg .= "Internal API Error! \n";
								$sErrMesg .= $aResult["ErrMesg"];
								
								echo "\n".json_encode( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
								//var_dump( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
							} else {
								//-------------------------------------------//
								//-- Prepare variables for the Premise Log --//
								//-------------------------------------------//
								$iPresetLogId   = 0;
								$iPremiseId     = $aTempDataResult["Data"]["PremiseId"];
								$sLogCustom1    = $aTempDataResult["Data"]["RoomId"];
							}
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$sErrMesg .= "Error Code:'3407' \n";
						$sErrMesg .= "Internal API Error! \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Room Info! \n";
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
		//if( $iPresetLogId!==0 ) {
			//$iLogNowUTS = time();
			//-- Log the Results --//
			//$aLogResult = AddPresetLogToPremiseLog( $iPresetLogId, $iLogNowUTS, $iPremiseId, $sLogCustom1 );
			//echo "<br />\n";
			//var_dump( $aLogResult );
			//echo "<br />\n";
		//}
	} catch( Exception $e9800 ) {
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()." ";
	}

//-- API Error has occurred --//
} else {
	//-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json". --//
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