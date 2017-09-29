<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP API is used for editing the various Links that the user has access to.
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


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught --//
$iErrCode                   = 0;            //-- INTEGER:       --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught --//
$sOutput                    = "";           //-- STRING:        Holds the HTTP Response that will be returned to the HTTP Client that requested this API.--//
$aResult                    = array();      //-- ARRAY:         Used to store the results.                        --//
$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in. --//
$iPostId                    = "";           //-- STRING:        Used to store the "Device Id"                     --//
$sPostName                  = "";           //-- STRING:        Used to store the desired Device "Name"           --//
$iPostRoomId                = "";           //-- STRING:        Used to store the desired Device's "Room"         --//
$iPostConFrequencyId        = 0;            //-- INTEGER:       Stores the desired "Link Connection Frequency Id".  --//
$iPostConCryptTypeId        = 0;            //-- INTEGER:       Stores the desired "Link Connection CryptType Id".  --//
$iPostConProtocolId         = 0;            //-- INTEGER:       Stores the desired "Link Connection Protocol Id".   --//
$iPostConPort               = 0;            //-- INTEGER:       Stores the desired "Link Connection Port".          --//
$sPostConAddress            = "";           //-- STRING:        Stores the desired "Link Connection Address".       --//
$sPostConName               = "";           //-- STRING:        Stores the desired "Link Connection Name".          --//
$sPostConUsername           = "";           //-- STRING:        Stores the desired "Link Connection Username".      --//
$sPostConPassword           = "";           //-- STRING:        Stores the desired "Link Connection Password".      --//


$aLinkInfo                  = array();      //-- ARRAY:         --//
$aRoomResult                = array();      //-- ARRAY:         Used to store the Results of room Information lookup --//
$iPremiseId                 = 0;            //-- INTEGER:       This variable is used to identify the Premise for the Premise Log. --//
$iLogNowUTS                 = 0;            //-- INTEGER:       --//
$iPresetLogId               = 0;            //-- INTEGER:       --//
$sLogCustom1                = "";           //-- STRING:        Special variable for the Premise Log. --//


//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//




//====================================================================//
//== 2.0 - RETRIEVE POST                                            ==//
//====================================================================//

//------------------------------------------------------------//
//-- 2.1 - Fetch the Parameters                             --//
//------------------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                  "DataType"=>'STR' ),
		array( "Name"=>'Id',                    "DataType"=>'INT' ),
		array( "Name"=>'Name',                  "DataType"=>'STR' ),
		array( "Name"=>'RoomId',                "DataType"=>'INT' ),
		array( "Name"=>'ConnFrequencyId',       "DataType"=>'INT' ),
		array( "Name"=>'ConnCryptTypeId',       "DataType"=>'INT' ),
		array( "Name"=>'ConnProtocolId',        "DataType"=>'INT' ),
		array( "Name"=>'ConnAddress',           "DataType"=>'STR' ),
		array( "Name"=>'ConnPort',              "DataType"=>'INT' ),
		array( "Name"=>'ConnName',              "DataType"=>'STR' ),
		array( "Name"=>'ConnUsername',          "DataType"=>'STR' ),
		array( "Name"=>'ConnPassword',          "DataType"=>'STR' )
	);
	
	$aHTTPData = FetchHTTPDataParameters($RequiredParmaters);
}


//------------------------------------------------------------//
//-- 2.2 - Retrieve the API "Mode"                          --//
//------------------------------------------------------------//
if($bError===false) {
	
	//----------------------------------------------------//
	//-- 2.2.1 - Retrieve the API "Mode"                --//
	//----------------------------------------------------//
	try {
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "EditName", "EditConnectData", "AddInfo", "EditInfo", "ChooseRoom" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="EditName" && $sPostMode!=="ChooseRoom" && $sPostMode!=="EditConnectData" ) {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"EditName\", \"ChooseRoom\" or \"EditConnectData\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"EditName\", \"ChooseRoom\" or \"EditConnectData\" \n\n";
		//sErrMesg .= e0011.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve Link "Id"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the Link "Id" --//
			$iPostId = $aHTTPData["Id"];
			
			if( $iPostId===false ) {
				$bError = true;
				$iErrCode  = 103;
				$sErrMesg .= "Error Code:'0103' \n";
				$sErrMesg .= "Non numeric \"Id\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Id\" parameter\n";
				$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
		} catch( Exception $e0104 ) {
			$bError = true;
			$iErrCode  = 104;
			$sErrMesg .= "Error Code:'0104' \n";
			$sErrMesg .= "Incorrect \"Id\" parameter!";
			$sErrMesg .= "Please use a valid \"Id\" parameter";
			$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
	
	//----------------------------------------------------//
	//-- 2.2.3.A - Retrieve Link "Name"                 --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditName" ) {
			try {
				//-- Retrieve the desired "Name" --//
				$sPostName = $aHTTPData["Name"];
				
				if( $sPostName===false ) {
					$bError = true;
					$iErrCode  = 105;
					$sErrMesg .= "Error Code:'0105' \n";
					$sErrMesg .= "Invalid \"Name\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Name\" parameter\n";
				}
			} catch( Exception $e0106 ) {
				$bError = true;
				$iErrCode  = 106;
				$sErrMesg .= "Error Code:'0106' \n";
				$sErrMesg .= "Incorrect \"Name\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Name\" parameter.\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3.B - Retrieve "Room Id"                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChooseRoom" ) {
			try {
				//-- Retrieve the "IOPortId" --//
				$iPostRoomId = $aHTTPData["RoomId"];
				
				if( $iPostRoomId===false ) {
					$bError = true;
					$iErrCode  = 107;
					$sErrMesg .= "Error Code:'0107' \n";
					$sErrMesg .= "Non numeric \"RoomId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"RoomId\" parameter.\n";
				}
			} catch( Exception $e0108 ) {
				$bError = true;
				$iErrCode  = 108;
				$sErrMesg .= "Error Code:'0108' \n";
				$sErrMesg .= "Incorrect \"RoomId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"RoomId\" parameter.\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- ConnFrequenccyId                               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the "FrequencyId" --//
				$iPostConFrequencyId = $aHTTPData["ConnFrequencyId"];
				
				if( $iPostConFrequencyId===false ) {
					$bError = true;
					$iErrCode  = 109;
					$sErrMesg .= "Error Code:'0109' \n";
					$sErrMesg .= "Non numeric \"ConnFrequencyId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnFrequencyId\" parameter.\n";
				}
			} catch( Exception $e0110 ) {
				$bError = true;
				$iErrCode  = 110;
				$sErrMesg .= "Error Code:'0110' \n";
				$sErrMesg .= "Incorrect \"ConnFrequencyId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnFrequencyId\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnCryptTypeId --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link Conn "CryptTypeId" --//
				$iPostConCryptTypeId = $aHTTPData["ConnCryptTypeId"];
				
				if( $iPostConCryptTypeId===false ) {
					$bError = true;
					$iErrCode  = 111;
					$sErrMesg .= "Error Code'0111' \n";
					$sErrMesg .= "Non numeric \"ConnCryptTypeId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnCryptTypeId\" parameter.\n";
				}
			} catch( Exception $e0112 ) {
				$bError = true;
				$iErrCode  = 112;
				$sErrMesg .= "Error Code:'0112' \n";
				$sErrMesg .= "Incorrect \"ConnCryptTypeId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnCryptTypeId\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnProtocolId --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link Conn "ProtocolId" --//
				$iPostConProtocolId = $aHTTPData["ConnProtocolId"];
				
				if( $iPostConProtocolId===false ) {
					$bError = true;
					$iErrCode  = 113;
					$sErrMesg .= "Error Code:'0113' \n";
					$sErrMesg .= "Non numeric \"ConnProtocolId\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnProtocolId\" parameter.\n";
				}
			} catch( Exception $e0114 ) {
				$bError = true;
				$iErrCode  = 114;
				$sErrMesg .= "Error Code:'0114' \n";
				$sErrMesg .= "Incorrect \"ConnProtocolId\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnProtocolId\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnAddress --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link Conn "AddressId" --//
				$sPostConAddress = $aHTTPData["ConnAddress"];
				
				if( $sPostConAddress===false ) {
					$bError = true;
					$iErrCode  = 115;
					$sErrMesg .= "Error Code:'0115' \n";
					$sErrMesg .= "Invalid \"ConnAddress\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnAddress\" parameter\n";
				}
			} catch( Exception $e0116 ) {
				$bError = true;
				$iErrCode  = 116;
				$sErrMesg .= "Error Code:'0116' \n";
				$sErrMesg .= "Incorrect \"ConnAddress\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnAddress\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnName --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link Conn "Name" --//
				$sPostConName = $aHTTPData["ConnName"];
				
				if( $sPostConName===false ) {
					$bError = true;
					$iErrCode  = 117;
					$sErrMesg .= "Error Code:'0117' \n";
					$sErrMesg .= "Invalid \"ConnName\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnName\" parameter\n";
				}
			} catch( Exception $e0118 ) {
				$bError = true;
				$iErrCode  = 118;
				$sErrMesg .= "Error Code:'0118' \n";
				$sErrMesg .= "Incorrect \"ConnName\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnName\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnUsername --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link "ConnUsername" --//
				$sPostConUsername = $aHTTPData["ConnUsername"];
				
				if( $sPostConUsername===false ) {
					$bError = true;
					$iErrCode  = 119;
					$sErrMesg .= "Error Code:'0119' \n";
					$sErrMesg .= "Invalid \"ConnUsername\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnUsername\" parameter\n";
				}
			} catch( Exception $e0120 ) {
				$bError = true;
				$iErrCode  = 120;
				$sErrMesg .= "Error Code:'0120' \n";
				$sErrMesg .= "Incorrect \"ConnUsername\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnUsername\" parameter.\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- ConnPassword                                   --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link "ConnPassword" --//
				$sPostConPassword = $aHTTPData["ConnPassword"];
				
				if( $sPostConPassword===false ) {
					$bError = true;
					$iErrCode  = 121;
					$sErrMesg .= "Error Code:'0121' \n";
					$sErrMesg .= "Invalid \"ConnPassword\" parameter! \n";
					$sErrMesg .= "Please use a valid \"ConnPassword\" parameter\n";
				}
			} catch( Exception $e0122 ) {
				$bError = true;
				$iErrCode  = 122;
				$sErrMesg .= "Error Code:'0122' \n";
				$sErrMesg .= "Incorrect \"ConnPassword\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnPassword\" parameter.\n";
			}
		}
	}
	
	//----------------------------------------------------//
	//-- ConnPort                                       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="EditConnectData" ) {
			try {
				//-- Retrieve the Link "ConnPort" --//
				$iPostConPort = $aHTTPData["ConnPort"];
				
				if( $iPostConPort===false ) {
					$iPostConPort = null;
				}
			} catch( Exception $e0122 ) {
				$bError = true;
				$iErrCode  = 122;
				$sErrMesg .= "Error Code:'0122' \n";
				$sErrMesg .= "Incorrect \"ConnPort\" parameter!\n";
				$sErrMesg .= "Please use a valid \"ConnPort\" parameter.\n";
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
		//== 5.1 - MODE: Edit Link Name                                 ==//
		//================================================================//
		if( $sPostMode==="EditName" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup information about the Link                      --//
				//--------------------------------------------------------------------//
				$aLinkInfo = LinkRetrieveStateAndPermission( $iPostId );
				
				if( $aLinkInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$iErrCode  = 1401;
					$sErrMesg .= "Error Code:'1401' \n";
					$sErrMesg .= $aLinkInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.1.2 - Verify that the user has permission to change the name --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aLinkInfo["Data"]["PermWrite"]===1 ) {
						
						//-- Change the Name of the Link --//
						$aResult = ChangeLinkName( $iPostId, $sPostName );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$iErrCode  = 1402;
							$sErrMesg .= "Error Code:'1402' \n";
							$sErrMesg .= $aResult["ErrMesg"];
							
						} else {
							
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							//$iPresetLogId   = 9;
							//$iPremiseId     = $aLinkInfo["Data"]["PremiseId"];
							//$sLogCustom1    = $aLinkInfo["Data"]["LinkName"];
							
						}
					} else {
						//-- Display an Error Message --//
						$bError = true;
						$iErrCode  = 1403;
						$sErrMesg .= "Error Code:'1403' \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Link name! \n";
					}
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 1400;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Edit Link Room                                 ==//
		//================================================================//
		} else if( $sPostMode==="ChooseRoom" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.2.1 - Lookup information about the Link                      --//
				//--------------------------------------------------------------------//
				$aLinkInfo = LinkRetrieveStateAndPermission( $iPostId );
				
				if( $aLinkInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$iErrCode  = 2401;
					$sErrMesg .= "Error Code:'2401' \n";
					$sErrMesg .= $aLinkInfo["ErrMesg"];
				}
				
				
				//--------------------------------------------------------------------//
				//-- 5.1.1 - Lookup information about the Comm                      --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					$aCommInfo = GetCommInfo( $aLinkInfo['Data']['CommId'] );
					
					if( $aCommInfo["Error"]===true ) {
						//-- Display an Error Message --//
						$bError = true;
						$iErrCode  = 2402;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= $aCommInfo["ErrMesg"];
						
					} else if( $aCommInfo['Data']['PermRoomAdmin']!==1 ) {
						//-- Flag an error that the User doesn't have sufficient privileges to change the device's room --//
						$bError = true;
						$iErrCode  = 2403;
						$sErrMesg .= "Error Code:'2403' \n";
						$sErrMesg .= "Your user doesn't have the 'RoomAdmin' permission which is required to assign the link to a different room! \n";
						
					} else {
						//-- Store the PremiseId --//
						$iCommPremiseId = $aCommInfo['Data']['PremiseId'];
					}
				}
				
				
				//--------------------------------------------------------------------//
				//-- 5.2.2 - Verify that the user has permission to change the Link --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					
					//--------------------------------------------------------------------//
					//-- IF the user wants to unassign a Link from a room               --//
					//--------------------------------------------------------------------//
					if($iPostRoomId===0) {
						
						//--------------------------------------------------------------------//
						//-- 5.2.3.A.1 - Change the Link's Room                             --//
						//--------------------------------------------------------------------//
						$aResult = ChangeLinkRoom( $iPostId, null );
						
						//-- Check for caught Errors --//
						if( $aResult["Error"]===true ) {
							$bError = true;
							$iErrCode  = 2404;
							$sErrMesg .= "Error Code:'2404' \n";
							$sErrMesg .= $aResult["ErrMesg"];
						
						} else {
							//-------------------------------------------//
							//-- Prepare variables for the Premise Log --//
							//-------------------------------------------//
							$iPresetLogId   = 0;
							$iPremiseId     = $aLinkInfo["Data"]["PremiseId"];
							$sLogCustom1    = "Unassigned Room";
						}
						
					//--------------------------------------------------------------------//
					//-- ELSE the user must want a Link assigned to a real room         --//
					//--------------------------------------------------------------------//
					} else {
						//--------------------------------------------------------------------//
						//-- 5.2.3.B.1 - Lookup Information about the Room                  --//
						//--------------------------------------------------------------------//
						$aRoomInfo = GetRoomInfoFromRoomId( $iPostRoomId );
						
						if( $aRoomInfo["Error"]===true ) {
							//-- Display an Error Message --//
							$bError = true;
							$iErrCode  = 2405;
							$sErrMesg .= "Error Code:'2405' \n";
							$sErrMesg .= $aRoomInfo["ErrMesg"];
							
						//-- ELSEIF The PremiseId does not match between the Comm's Premise and the Room's Premise --// 
						} else if( $iCommPremiseId!==$aRoomInfo["Data"]["PremiseId"] ) {
							//-- Display an Error Message --//
							$bError = true;
							$iErrCode  = 2406;
							$sErrMesg .= "Error Code:'2406' \n";
							$sErrMesg .= $aRoomInfo["ErrMesg"];
							
						}
						
						//--------------------------------------------------------------------//
						//-- 5.2.3.B.2 - Verify that the User has permission to the Room    --//
						//--------------------------------------------------------------------//
						if( $bError===false ) {
							//-- Lookup the Link's Comm --//
							$aCommInfo = GetCommInfo( $aLinkInfo['Data']['CommId'] );
							
							if( $aCommInfo['Error']===false ) {
								//-- Check to make sure the Comm and the Room are in the same premise --//
								if( $aRoomInfo["Data"]["PremiseId"]===$aCommInfo["Data"]["PremiseId"] ) {
									
									//-- Change which room the Link is in --//
									$aResult = ChangeLinkRoom( $iPostId, $iPostRoomId );
									
									
									//-- Check for caught Errors --//
									if( $aResult["Error"]===true ) {
										$bError = true;
										$iErrCode  = 2407;
										$sErrMesg .= "Error Code:'2407' \n";
										$sErrMesg .= $aResult["ErrMesg"];
										
									} else {
										//-------------------------------------------//
										//-- Prepare variables for the Premise Log --//
										//-------------------------------------------//
										//$iPresetLogId   = 0;
										//$iPremiseId     = $aRoomInfo["Data"]["PremiseId"];
										//$sLogCustom1    = $aRoomInfo["Data"]["RoomName"];
									}
									
								} else {
									//-- Display an Error Message --//
									$bError = true;
									$iErrCode  = 2408;
									$sErrMesg .= "Error Code:'2408' \n";
									$sErrMesg .= "The desired Room's PremiseId doesn't match the Link's PremiseId! \n";
								}
								
							} else {
								//-- Display an Error Message --//
								$bError = true;
								$iErrCode  = 2409;
								$sErrMesg .= "Error Code:'2409' \n";
								$sErrMesg .= "Problem looking up the Link's Comm Information! \n";
							}
						} //-- ENDIF No errors --//
					} //-- ENDELSE --//
				}
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 2400;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Edit Link Connection                           ==//
		//================================================================//
		} else if( $sPostMode==="EditConnectData" ) {
			try {
				//--------------------------------------------------------------------//
				//-- 5.3.1 - Lookup information about the Link                      --//
				//--------------------------------------------------------------------//
				$aLinkInfo = LinkRetrieveStateAndPermission( $iPostId );
				
				if( $aLinkInfo["Error"]===true ) {
					//-- Display an Error Message --//
					$bError = true;
					$iErrCode  = 3407;
					$sErrMesg .= "Error Code:'3407' \n";
					$sErrMesg .= $aLinkInfo["ErrMesg"];
				}
				
				//--------------------------------------------------------------------//
				//-- 5.3.2 - Verify that the user has permission to change the Link --//
				//--------------------------------------------------------------------//
				if( $bError===false ) {
					//-- Verify that the user has permission to change the name --//
					if( $aLinkInfo["Data"]["PermWrite"]===1 ) {
						//--------------------------------------------------------------------//
						//-- 5.3.2.A.2 - Update Connection Info                             --//
						//--------------------------------------------------------------------//
						$aResult = LinkUpdateConnectionInfo( $aLinkInfo["Data"]["LinkConnId"], $iPostConProtocolId, $iPostConFrequencyId, $iPostConCryptTypeId, $sPostConAddress, $sPostConName, $sPostConUsername, $sPostConPassword, $iPostConPort );
						
						if( $aResult["Error"]===true ) {
							//-- Display an Error Message --//
							$bError = true;
							$iErrCode  = 3406;
							$sErrMesg .= "Error Code:'3406' \n";
							$sErrMesg .= $aResult["ErrMesg"];
						}
						
					} else {
						//var_dump( $aLinkInfo );
						
						//-- Display an Error Message --//
						$bError = true;
						$iErrCode  = 3409;
						$sErrMesg .= "Error Code:'3409' \n";
						$sErrMesg .= "Your user doesn't have sufficient privilege to change the Link Connection info! \n";
						$sErrMesg .= "Please try again when you have been granted the \"Write\" permission! \n";
					}
				}
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 3400;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= "Internal API Error! \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
		//================================================================//
		//== Unsupported Mode                                           ==//
		//================================================================//
		} else {
			$bError = true;
			$iErrCode  = 401;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Internal API Error! \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError = true;
		$iErrCode  = 400;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= "Internal API Error! \n";
		$sErrMesg .= $e0400->getMessage();
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
	} catch( Exception $e0800 ) {
		//-- Error Catching --//
		$bError = true;
		$iErrCode  = 800;
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
		echo "Error Code:'0001'! \n ".$e0001->getMessage()."\" ";
	}

//-- API Error has occurred --//
} else {
	//-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json" --//
	header('Content-Type: text/plain');
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$sOutput = "Error Code:'0003' \n No Result";

	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$sOutput  = "Error Code:'0004' \n Critical Error has occured!\n Undefinable Error Message\n";

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