<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a library used to do inserting for WatchInputs as well as other APIs.
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




function PrepareAddNewComm( $aComm, $iParamHubId=0 ) {
	//----------------------------------------------------//
	//-- INITIALISE VARIABLES                           --//
	//----------------------------------------------------//
	
	//-- 1.2 - Initialise normal variables --//
	$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                                   --//
	$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used.                                        --//
	$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                                 --//
	$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
	$iCommHubId                 = 0;            //-- INTEGER:       --//
	$iCommTypeId                = 0;            //-- INTEGER:       --//
	$sCommName                  = "";           //-- STRING:        --//
	$sCommAddress               = "";           //-- STRING:        --//
	$iCommId                    = 0;            //-- INTEGER:       Used to store the CommId after the Comm has been added to the database. --//
	
	
	//----------------------------------------------------//
	//-- (Required) Check Comm 'HubId' variable         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aComm['HubId']) ) {
			if ( is_int( $aComm['HubId'] ) && $aComm['HubId']>0 ) {
				//-- INTEGER --//
				$iCommHubId = $aComm['HubId'];
				
			} else if( is_string( $aComm['HubId'] ) && is_numeric( $aComm['HubId'] ) ) {
				//-- STRING --//
				$iCommHubId = intval( $aComm['HubId'] );
				
			} else {
				if( $iParamHubId>0 ) {
					$iCommHubId = $iParamHubId;
				} else {
					//-- ERROR --//
					$bError = true;
					$iErrCode  = 1;
					$sErrMesg .= "Problem the 'HubId' variable in one of the 'Comm' arrays! \n";
				}
			}
		} else {
			if( $iParamHubId>0 ) {
				$iCommHubId = $iParamHubId;
			} else {
				$bError = true;
				$iErrCode  = 2;
				$sErrMesg .= "Can not detect the 'HubId' variable in one of the 'Comm' arrays! \n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check 'Type' variable               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aComm['Type']) ) {
			if ( is_int( $aComm['Type'] ) && $aComm['Type']>0 ) {
				//-- INTEGER --//
				$iCommTypeId = $aComm['Type'];
				
			} else if( is_string( $aComm['Type'] ) && is_numeric( $aComm['Type'] ) ) {
				//-- STRING --//
				$iCommTypeId = intval( $aComm['Type'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 3;
				$sErrMesg .= "Problem with the 'Type' variable in one of the 'Comm' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 4;
			$sErrMesg .= "Can not detect the 'Type' variable in one of the 'Comm' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check Comm 'Name' variable          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aComm['Name']) ) {
			if(  is_string( $aComm['Name'] ) && $aComm['Name']!==""  ) {
				//-- Store the "Name" --//
				$sCommName = $aComm['Name'];
			} else {
				$bError = true;
				$iErrCode  = 5;
				$sErrMesg .= "Problem with the 'Name' variable in one of the 'Comm' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 6;
			$sErrMesg .= "Can not detect the 'Name' variable in one of the 'Comm' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check Comm 'Address' variable       --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aComm['Address']) ) {
			if(  is_string( $aComm['Address'] )  ) {
				//-- Store the "Address" --//
				$sCommAddress = $aComm['Address'];
			} else {
				$bError = true;
				$iErrCode  = 7;
				$sErrMesg .= "Problem with the 'Address' variable in one of the 'Comm' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 8;
			$sErrMesg .= "Can not detect the 'Address' variable in one of the 'Comm' arrays! \n";
		}
	}
	
	
	//--------------------------------------------------------//
	//-- 4.0 - Check to make sure the User has permission   --//
	//--------------------------------------------------------//
	if( $bError===false ) {
		$aVerifyResults = WatchInputsHubRetrieveInfoAndPermission( $iCommHubId );
		
		if( $aVerifyResults['Error']===true ) {
			$bError = true;
			$iErrCode  = 9;
			$sErrMesg .= "Problem when looking up Hub Info! \n";
			$sErrMesg .= $aVerifyResults['ErrMesg'];
		}
	}
	
	
	//--------------------------------------------------------//
	//-- 5.0 - Add the Comm to the database                 --//
	//--------------------------------------------------------//
	if( $bError===false ) {
		$aResult = AddNewHubComm( $iCommHubId, $iCommTypeId, $sCommName, $sCommAddress, true );
		
		if( $aResult['Error']===true ) {
			//----------------------------------------------------//
			//-- ERROR:                                         --//
			//----------------------------------------------------//
			$bError    = true;
			$iErrCode  = 15;
			$sErrMesg .= "Problem when adding the 'Comm' into the database! \n";
			$sErrMesg .= $aResult['ErrMesg'];
			
		} else {
			//-- Extract the CommId from the insert results --//
			$iCommId = $aResult['Data']['CommId'];
		}
	}
	
	
	//--------------------------------------------------------//
	//-- 9.0 - Return the Results                           --//
	//--------------------------------------------------------//
	if( $bError===false ) {
		return array(
			"Error"     => false,
			"CommId"    => $iCommId
		);
		
	} else {
		return array(
			"Error"     => true,
			"ErrCode"   => $iErrCode,
			"ErrMesg"   => $sErrMesg
		);
	}
}



function PrepareAddNewLink( $aLink ) {
	//----------------------------------------------------//
	//-- INITIALISE VARIABLES                           --//
	//----------------------------------------------------//
	//-- 1.1 - Declare global variables --//
	global $iThingDefaultHWID;
	
	//-- 1.2 - Declare normal variables --//
	$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                                   --//
	$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used.                                        --//
	$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                                 --//
	$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
	
	$iLinkId                    = 0;            //-- INTEGER:       --//
	$iLinkCommId                = 0;            //-- INTEGER:       Used to hold the CommId. --//
	$iLinkTypeId                = 0;            //-- INTEGER:       --//
	$sLinkInfoName              = "";           //-- STRING:        --//
	$sLinkDisplayName           = "";           //-- STRING:        --//
	$sLinkSerialCode            = "";           //-- STRING:        --//
	$iLinkState                 = 1;            //-- INTEGER:       This holds the Link State that the Link is set to. --//
	$sLinkInfoManufacturer      = "";           //-- STRING:        Holds the Link Info "Manufacturer Name" variable. --//
	$sLinkInfoManufacturerUrl   = "";           //-- STRING:        Holds the Link Info "Manufacturer URL" variable.  --//
	$iLinkConnProtocolId        = 0;            //-- INTEGER:       --//
	$iLinkConnFrequencyId       = 0;            //-- INTEGER:       --//
	$iLinkConnCryptTypeId       = 0;            //-- INTEGER:       --//
	$sLinkConnAddress           = "";           //-- STRING:        --//
	$iLinkConnPort              = 0;            //-- INTEGER:       --//
	$sLinkConnName              = "";           //-- STRING:        --//
	$sLinkConnUsername          = "";           //-- STRING:        Will hold the "Link Connection Username" if specified. --//
	$sLinkConnPassword          = "";           //-- STRING:        Will hold the "Link Connection Password" if specified. --//
	
	$iLinkRoomId                = 0;            //-- INTEGER:       NOTE: This will be set to null if no value is provided --//
	$iLinkInfoId                = 0;            //-- INTEGER:       --//
	$iLinkConnectionId          = 0;            //-- INTEGER:       --//
	$aThings                    = array();      //-- ARRAY:         --//
	$aVerifyResults             = array();      //-- ARRAY:         Used to hold the results of the verification. --//
	
	$aTempResult1               = array();      //-- ARRAY:         Used to store the results that a function returned. --//
	$aTempResult2               = array();      //-- ARRAY:         Used to store the results that a function returned. --//
	$aTempResult3               = array();      //-- ARRAY:         Used to store the results that a function returned. --//
	$aTempResult4               = array();      //-- ARRAY:         Used to store the results that a function returned. --//
	
	
	//----------------------------------------------------//
	//-- EXTRACT THE VALUES                             --//
	//----------------------------------------------------//
	try {
		//----------------------------------------------------//
		//-- (Required) Check Link 'CommId' variable        --//
		//----------------------------------------------------//
		if( isset($aLink['CommId']) ) {
			//-- Store the "CommId" --//
			$iLinkCommId = $aLink['CommId'];
			
			//-- Perform Validation --//
			if ( is_int( $aLink['CommId'] ) && $aLink['CommId']>0) {
				//-- INTEGER --//
				$iLinkCommId = $aLink['CommId'];
				
			} else if( is_string( $aLink['CommId'] ) && is_numeric( $aLink['CommId'] ) ) {
				//-- STRING --//
				$iLinkCommId = intval( $aLink['CommId'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 1;
				$sErrMesg .= "Problem with the CommId! \n";
			}
			
		} else {
			//-- Error --//
			$bError = true;
			$iErrCode  = 2;
			$sErrMesg .= "Can not detect the CommId variable in the 'data' array!\n";
		}
		
		//----------------------------------------------------//
		//-- (Required) Check Link 'Type' Id variable       --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset($aLink['Type']) ) {
				
				//-- Perform Validation --//
				if ( is_int( $aLink['Type'] ) && $aLink['Type']>0 ) {
					//-- INTEGER --//
					$iLinkTypeId = $aLink['Type'];
				
				} else if( is_string( $aLink['Type'] ) && is_numeric( $aLink['Type'] ) ) {
					//-- STRING --//
					$iLinkTypeId = intval( $aLink['Type'] );
					
				} else {
					$bError = true;
					$iErrCode  = 3;
					$sErrMesg .= "Problem with the 'Type' variable in the data array!\n";
				}
			} else {
				//-- Error --//
				$bError = true;
				$iErrCode  = 4;
				$sErrMesg .= "Can not detect the 'Type' variable in the data array!\n";
			}
		}
		
		//----------------------------------------------------//
		//-- (Required) Check Link 'Displayname'            --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset($aLink['Displayname']) ) {
				//-- Store the "DisplayName" --//
				$sLinkDisplayName = $aLink['Displayname'];
				
				//-- Perform Validation --//
				if(  !is_string( $sLinkDisplayName )  ) {
					//-- Error --//
					$bError = true;
					$iErrCode  = 5;
					$sErrMesg .= "Problem with the 'Displayname' variable in the data array! \n";
				}
			} else {
				//-- Error --//
				$bError = true;
				$iErrCode  = 6;
				$sErrMesg .= "Can not detect the 'Displayname' variable in the data array!\n";
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'SerialCode'             --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset($aLink['SerialCode']) ) {
				//-- Store the "SerialCode" --//
				$sLinkSerialCode = $aLink['SerialCode'];
				
				//-- Perform Validation --//
				if(  !is_string( $sLinkSerialCode )  ) {
					$sLinkSerialCode = "";
				}
			} else {
				$sLinkSerialCode = "";
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'State'                  --//
		//----------------------------------------------------//
		//-- NOTES: If the Link State isn't specified then use the default which is 1 --//
		if( $bError===false ) {
			if( isset( $aLink['State'] ) ) {
				if ( is_int( $aLink['State'] ) && $aLink['State']>0) {
					//-- INTEGER --//
					$iLinkState = $aLink['State'];
					
				} else if( is_string( $aLink['State'] ) && is_numeric( $aLink['State'] ) ) {
					//-- STRING --//
					$iLinkState = intval( $aLink['State'] );
					
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'InfoName'               --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset($aLink['InfoName']) ) {
				//-- Perform Validation --//
				if(  is_string( $aLink['InfoName'] )  ) {
					//-- Store the "InfoName" --//
					$sLinkInfoName = $aLink['InfoName'];
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'InfoManufacturer'       --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['InfoManufacturer'] ) ) {
				if( is_string( $aLink['InfoManufacturer'] ) ) {
					$sLinkInfoManufacturer = $aLink['InfoManufacturer'];
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'InfoManufacturerUrl'    --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['InfoManufacturerUrl'] ) ) {
				if( is_string( $aLink['InfoManufacturerUrl'] ) ) {
					$sLinkInfoManufacturerUrl = $aLink['InfoManufacturerUrl'];
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnFrequencyId'        --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnFrequencyId'] ) ) {
				if ( is_int( $aLink['ConnFrequencyId'] ) && $aLink['ConnFrequencyId']>0 ) {
					//-- INTEGER --//
					$iLinkConnFrequencyId = $aLink['ConnFrequencyId'];
					
				} else if( is_string( $aLink['ConnFrequencyId'] ) && is_numeric( $aLink['ConnFrequencyId'] ) ) {
					//-- STRING --//
					$iLinkConnFrequencyId = intval( $aLink['ConnFrequencyId'] );
					
				} else {
					$iLinkConnFrequencyId = 1;
				}
			} else {
				$iLinkConnFrequencyId = 1;
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnProtocolId'         --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnProtocolId'] ) ) {
				if ( is_int( $aLink['ConnProtocolId'] ) && $aLink['ConnProtocolId']>0 ) {
					//-- INTEGER --//
					$iLinkConnProtocolId = $aLink['ConnProtocolId'];
					
				} else if( is_string( $aLink['ConnProtocolId'] ) && is_numeric( $aLink['ConnProtocolId'] ) ) {
					//-- STRING --//
					$iLinkConnProtocolId = intval( $aLink['ConnProtocolId'] );
					
				} else {
					$iLinkConnProtocolId = 1;
				}
			} else {
				$iLinkConnProtocolId = 1;
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnCryptTypeId'        --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnCryptTypeId'] ) ) {
				if ( is_int( $aLink['ConnCryptTypeId'] ) && $aLink['ConnCryptTypeId']>0 ) {
					//-- INTEGER --//
					$iLinkConnCryptTypeId = $aLink['ConnCryptTypeId'];
					
				} else if( is_string( $aLink['ConnCryptTypeId'] ) && is_numeric( $aLink['ConnCryptTypeId'] ) ) {
					//-- STRING --//
					$iLinkConnCryptTypeId = intval( $aLink['ConnCryptTypeId'] );
					
				} else {
					$iLinkConnCryptTypeId = 1;
				}
			} else {
				$iLinkConnCryptTypeId = 1;
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnAddress'            --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnAddress'] ) ) {
				if( is_string( $aLink['ConnAddress'] ) ) {
					$sLinkConnAddress = $aLink['ConnAddress'];
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnPort'               --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnPort'] ) ) {
				if( is_int( $aLink['ConnPort'] ) ) {
					//-- INTEGER --//
					$iLinkConnPort = $aLink['ConnPort'];
				} else if( is_string( $aLink['State'] ) && is_numeric( $aLink['State'] ) ) {
					//-- STRING --//
					$iLinkConnPort = intval( $aLink['ConnPort'] );
						
				} else {
					//-- ELSE NULL --//
					$iLinkConnPort = null;
				}
			} else {
				$iLinkConnPort = null;
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnName'               --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnName'] ) ) {
				if( is_string( $aLink['ConnName'] ) ) {
					$sLinkConnName = $aLink['ConnName'];
				}
			}
		}
		
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnUsername'           --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnUsername'] ) ) {
				if( is_string( $aLink['ConnUsername'] ) ) {
					$sLinkConnUsername = $aLink['ConnUsername'];
				}
			}
		}
		
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'ConnPassword'           --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset( $aLink['ConnPassword'] ) ) {
				if( is_string( $aLink['ConnPassword'] ) ) {
					$sLinkConnPassword = $aLink['ConnPassword'];
				}
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'RoomId'                 --//
		//----------------------------------------------------//
		//-- NOTE: Requires the Comm Validation to be completed --//
		if( $bError===false ) {
			if( isset( $aLink['RoomId'] ) ) {
				if( is_string( $aLink['RoomId'] ) ) {
					$iRoomId = intval( $aLink['RoomId'] );
				} else if( is_int($aLink['RoomId']) && $aLink['RoomId']>=1 ) {
					$iRoomId = intval( $aLink['RoomId'] );
				} else {
					$iRoomId = null;
				}
			} else {
				$iRoomId = null;
			}
		}
		
		//----------------------------------------------------//
		//-- (Optional) Check Link 'Things'                 --//
		//----------------------------------------------------//
		if( $bError===false ) {
			if( isset($aLink['Things']) ) {
				if( is_array( $aLink['Things'] ) ) {
					$aThings = $aLink['Things'];
				}
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 4.2 - Verify that the User has access to the Link's Comm   --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			
			$aVerifyResults = WatchInputsGetCommInfo( $iLinkCommId );
			
			if( $aVerifyResults['Error']===false ) {
				
				
				if( $iRoomId===null ) {
					//-- IF The Comm is available the lookup all the rooms on that Premise --//
					$aFirstRoomIdsList = WatchInputsGetFirstRoomIdFromPremiseId( $aVerifyResults['Data']['PremiseId'] );
					
					if( $aFirstRoomIdsList['Error']===false ) {
						$iRoomId = $aFirstRoomIdsList['Data']['RoomId'];
						
					} else {
						$bError = true;
						$iErrCode  = 9;
						$sErrMesg .= "Problem choosing a default room for a Link! \n";
						$sErrMesg .= $aVerifyResults['ErrMesg'];
					}
				}
				
			} else {
				$bError = true;
				$iErrCode  = 9;
				$sErrMesg .= "Problem when looking up Link's Comm Info! \n";
				$sErrMesg .= $aVerifyResults['ErrMesg'];
			}
		}
		
		//----------------------------------------------------------------//
		//-- 4.3 - Add the LinkInfo to the database                     --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			
			//-- Check if the LinkInfo already exists --//
			$iLinkInfoId = WatchInputsCheckIfLinkInfoAlreadyExists( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl );
			
			//-- Check if a result was found --//
			if( $iLinkInfoId===null || $iLinkInfoId===false || $iLinkInfoId<=0 ) {
				//------------------------------------------------//
				//-- Insert a new Entry since                   --//
				//------------------------------------------------//
				$aTempResult1 = AddNewLinkInfo( $sLinkInfoName, $sLinkInfoManufacturer, $sLinkInfoManufacturerUrl, true );
				
				if( $aTempResult1['Error']===false ) {
					//----------------------------------------------------//
					//-- IF no Errors occured then extract the value    --//
					//----------------------------------------------------//
					$iLinkInfoId = $aTempResult1['Data']['LinkInfoId'];
					
				} else {
					//----------------------------------------------------//
					//-- ERROR:                                         --//
					//----------------------------------------------------//
					$bError = true;
					$iErrCode  = 10;
					$sErrMesg .= "Problem when inserting the LinkInfo! \n";
					$sErrMesg .= $aTempResult1['ErrMesg'];
				}
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 4.3 - Add the LinkConnection to the database               --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			
			//-- Add the new Link Info --//
			$aTempResult2 = AddNewLinkConnectionInfo( $iLinkConnProtocolId, $iLinkConnFrequencyId, $iLinkConnCryptTypeId, $sLinkConnAddress, $iLinkConnPort, $sLinkConnName, $sLinkConnUsername, $sLinkConnPassword, true );
			
			if( $aTempResult2['Error']===false ) {
				//----------------------------------------------------//
				//-- IF no Errors occured then extract the value    --//
				//----------------------------------------------------//
				if( $aTempResult2['Data']['LinkConnId'] ) {
					$iLinkConnectionId = $aTempResult2['Data']['LinkConnId'];
					
				} else {
					$bError = true;
					$iErrCode  = 11;
					$sErrMesg .= "Problem when inserting the LinkConnectionInfo! \n";
					$sErrMesg .= $aTempResult2['ErrMesg'];
				}
				
			} else {
				//----------------------------------------------------//
				//-- ERROR:                                         --//
				//----------------------------------------------------//
				$bError = true;
				$iErrCode  = 12;
				$sErrMesg .= "Problem when inserting the LinkConnectionInfo! \n";
				$sErrMesg .= $aTempResult2['ErrMesg'];
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 4.4 - Add the Link to the database                         --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			
			$aTempResult3 = AddNewLink( $iLinkCommId, $iLinkTypeId, $iLinkInfoId, $iLinkConnectionId, $sLinkSerialCode, $sLinkDisplayName, $iLinkState, $iRoomId, true );
			
			if( $aTempResult3['Error']===true ) {
				//----------------------------------------------------//
				//-- ERROR:                                         --//
				//----------------------------------------------------//
				$bError = true;
				$iErrCode  = 13;
				$sErrMesg .= "Problem when inserting the Link! \n";
				$sErrMesg .= $aTempResult3['ErrMesg'];
			} else {
				//-- Extract the LinkId from the insert results --//
				$iLinkId = $aTempResult3['Data']['LinkId'];
				
				//-- Create the Result array --//
				$aResult = array(
					"LinkId"     => $iLinkId,
					"LinkConnId" => $iLinkConnectionId,
					"LinkInfoId" => $iLinkInfoId,
					"Things"     => array()
				);
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 4.5 - Add the Things and IOs to the database               --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			//-- Reset the Thing Default HWId --//
			$iThingDefaultHWID = 0;
			
			//--  --//
			foreach( $aThings as $aThing ) {
				if( $bError===false ) {
					$aTempResult4 = PrepareAddNewThing( $iLinkId, $aThing, $iThingDefaultHWID, $sLinkDisplayName, $iLinkState );
					
					if( $aTempResult4['Error']===false ) {
						//-- Add the AddNewThing result to the list of Things to return --//
						$aResult['Things'][] = $aTempResult4["Thing"];
						
					} else {
						//-- ERROR --//
						$bError = true;
						$iErrCode  = 15+$aTempResult4["ErrCode"];
						$sErrMesg .= "Error Code:0x".$iErrCode." \n";
						$sErrMesg .= $aTempResult4["ErrMesg"];
					}
					
					$iThingDefaultHWID++;
				}
			} //-- END FOREACH Thing --//
		}
		
	} catch( Exception $e0 ) {
		$bError = true;
		$iErrCode  = 0;
		$sErrMesg .= $e0->getMessage();
	}
	
	//----------------------------------------------------------------//
	//-- Return the Results                                         --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		//--------------------//
		//-- SUCCESS        --//
		//--------------------//
		return array(
			"Error"     => false,
			"Data"      => $aResult
		);
	} else {
		//--------------------//
		//-- ERROR          --//
		//--------------------//
		return array(
			"Error"     => true,
			"ErrCode"   => $iErrCode,
			"ErrMesg"   => $sErrMesg
		);
	}
}



function PrepareAddNewThing( $iLinkId, $aThing, $iThingDefaultHWID, $sLinkDisplayName, $iLinkState ) {
	//----------------------------------------------------//
	//-- INITIALISE VARIABLES                           --//
	//----------------------------------------------------//
	//-- 1.1 - Declare global variables --//
	
	
	//-- 1.2 - declare normal variables --//
	$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                                           --//
	$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used.                                                --//
	$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                                         --//
	$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                                --//
	$iThingId                   = 0;            //-- INTEGER:       The current ThingId that is either retrieved from the POST Variable or after an Thing Insert occurs.    --//
	$sThingName                 = "";           //-- STRING:        --//
	$iThingTypeId               = 0;            //-- INTEGER:       --//
	$iThingState                = 0;            //-- INTEGER:       --//
	$iThingHWID                 = 0;            //-- INTEGER:       Used to store the ThingHWID.                                                                            --//
	$iThingOutputID             = 0;            //-- INTEGER:       Used to indicate what the ThingOutputHWID.                                                              --//
	$sThingSerialCode           = "";           //-- STRING:        --//
	$aTempResult5               = array();      //-- ARRAY:         --//
	$aTempResult6               = array();      //-- ARRAY:         --//
	$aIOs                       = array();      //-- ARRAY:         --//
	$aVerifyResults             = array();      //-- ARRAY:         Used to hold the results of the function used for verification. --//
	
	
	
	//----------------------------------------------------------------//
	//-- 5.1.5.1 - Fetch Variables                                  --//
	//----------------------------------------------------------------//
	
	
	//----------------------------------------------------------------//
	//-- (Required) Check Thing 'Type' Id variable                  --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['Type']) ) {
			if ( is_int( $aThing['Type'] ) && $aThing['Type']>0 ) {
				//-- INTEGER --//
				$iThingTypeId = $aThing['Type'];
				
			} else if( is_string( $aThing['Type'] ) && is_numeric( $aThing['Type'] ) ) {
				//-- STRING --//
				$iThingTypeId = intval( $aThing['Type'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 1;
				$sErrMesg .= "Problem with the Thing 'Type' Id in an element of the 'Things' array!\n";
			}
		} else {
			//-- ERROR --//
			$bError = true;
			$iErrCode  = 2;
			$sErrMesg .= "Can not detect the Thing 'Type' Id in an element of the 'Things' array!\n";
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'Name' variable                     --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['Name']) ) {
			if(  is_string( $aThing['Name'] ) && $aThing['Name']!==""  ) {
				//-- Store the "Name" --//
				$sThingName = $aThing['Name'];
			} else {
				if( $sLinkDisplayName!=="" ) {
					$sThingName = $sLinkDisplayName;
				} else {
					$bError = true;
					$iErrCode  = 3;
					$sErrMesg .= "Problem with the Thing 'Name' in an element of the 'Things' array!\n";
				}
			}
		//-- ELSE Use the Link Display name --//
		} else {
			if( is_string( $sLinkDisplayName ) ) {
				$sThingName = $sLinkDisplayName;
			} else {
				$bError = true;
				$iErrCode  = 4;
				$sErrMesg .= "Problem with the Thing 'Name' in an element of the 'Things' array!\n";
			}
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'State' variable                    --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['State']) ) {
			if ( is_int( $aThing['State'] ) && $aThing['State']>=0 ) {
				//-- INTEGER --//
				$iThingState = $aThing['State'];
				
			} else if( is_string( $aThing['State'] ) && is_numeric( $aThing['State'] ) ) {
				//-- STRING --//
				$iThingState = intval( $aThing['State'] );
				
			} else if( $aThing['State']===true ) {
				$iThingState = 1;
				
			} else if( $aThing['State']===false ) {
				$iThingState = 0;
				
			} else if( $aThing['State']===null ) {
				$iThingState = 0;
				
			} else {
				//-- Set the ThingState to the Link's state --//
				if( $iLinkState!=="" ) {
					$iThingState = $iLinkState;
				} else {
					$bError = true;
					$iErrCode  = 5;
					$sErrMesg .= "Problem with the Thing 'State' in an element of the 'Things' array!\n";
				}
			}
		} else {
			//-- Set the ThingState to the Link's state --//
			if( $iLinkState!=="" ) {
				$iThingState = $iLinkState;
			} else {
				$iThingState = 0;
			}
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'HWId' variable                     --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['HWId']) ) {
			//-- Perform Validation --//
			if ( is_int( $aThing['HWId'] ) && $aThing['HWId']>0 ) {
				//-- INTEGER --//
				$iThingHWID = $aThing['HWId'];
			} else if( is_string( $aThing['HWId'] ) && is_numeric( $aThing['HWId'] ) ) {
				//-- STRING --//
				$iThingHWID = intval( $aThing['HWId'] );
			} else {
				//-- Set the ThingDefault to the default --//
				$iThingHWID = $iThingDefaultHWID;
			}
		} else {
			$iThingHWID = $iThingDefaultHWID;
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'OutputHWId' variable               --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['OutputHWId']) ) {
			if( $aThing['OutputHWId']===null || $aThing['OutputHWId']==="null" ) {
				$iThingOutputID = null;
			} else if ( is_int( $aThing['OutputHWId'] ) && $aThing['OutputHWId']>0 ) {
				//-- INTEGER --//
				$iThingOutputID = $aThing['OutputHWId'];
			} else if( is_string( $aThing['OutputHWId'] ) && is_numeric( $aThing['OutputHWId'] ) ) {
				//-- STRING --//
				$iThingOutputID = intval( $aThing['OutputHWId'] );
			} else {
				$iThingOutputID = null;
			}
		} else {
			$iThingOutputID = null;
		}
	}
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'SerialCode' variable               --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['SerialCode']) ) {
			if(  is_string( $aThing['SerialCode'] ) ) {
				//-- Store the "SerialCode" --//
				$sThingSerialCode = $aThing['SerialCode'];
			} else {
				if( $aThing['SerialCode']===null || $aThing['SerialCode']===false ) {
					$sThingSerialCode = "";
				} else {
					$bError = true;
					$iErrCode  = 3;
					$sErrMesg .= "Problem with the Thing 'SerialCode' in an element of the 'Things' array!\n";
				}
			}
		} else {
			$sThingSerialCode = "";
		}
	}
	
	//----------------------------------------------------------------//
	//-- (Optional) Check Thing 'IOs' variable                      --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		if( isset($aThing['IOs']) ) {
			if( is_array($aThing['IOs']) ) {
				$aIOs = $aThing['IOs'];
			}
		}
	}
	
	//----------------------------------------------------------------//
	//-- 5.1.5.3 - Verify that the User has permission              --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		
		$aVerifyResults = WatchInputsGetLinkInfo( $iLinkId );
		
		if( $aVerifyResults['Error']===true ) {
			$bError = true;
			$iErrCode  = 14;
			$sErrMesg .= "Critical Error adding the new Thing! \n";
			$sErrMesg .= "Problem when looking up Link Info! \n";
			$sErrMesg .= $aVerifyResults['ErrMesg'];
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- 5.1.5.4 - Add the Thing to the database                    --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		$aTempResult5 = AddNewThing( $iLinkId, $iThingTypeId, $iThingHWID, $iThingOutputID, $iThingState, $sThingName, $sThingSerialCode, true );
		
		if( $aTempResult5['Error']===true ) {
			//----------------------------------------------------//
			//-- ERROR:                                         --//
			//----------------------------------------------------//
			$bError = true;
			$iErrCode  = 15;
			$sErrMesg .= "Problem when adding the 'Thing' into the database! \n";
			$sErrMesg .= $aTempResult5['ErrMesg'];
			
		} else {
			//----------------------------------------------------//
			//-- Extract the ThingId from the insert results    --//
			//----------------------------------------------------//
			$iThingId = $aTempResult5['Data']['ThingId'];
			
			$aResult = array (
				"ThingId" => $iThingId,
				"IOs"     => array()
			);
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- 5.1.5.5 - Add the Thing's IOs to the database              --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		foreach( $aIOs as $aIO ) {
			if( $bError===false ) {
				//----------------------------//
				//-- Add the IO             --//
				//----------------------------//
				$aTempResult6 = PrepareAddNewIO( $iThingId, $aIO, $iThingState );
				
				//----------------------------//
				//-- Extract the Results    --//
				//----------------------------//
				if( $aTempResult6['Error']===false ) {
					//-- Add the IO result to the List of IOs to return --//
					$aResult['IOs'][] = $aTempResult6["IOId"];
				} else {
					$bError = true;
					$iErrCode  = 20+$aTempResult6['ErrCode'];
					$sErrMesg .= $aTempResult6['ErrMesg'];
				}
			}	//-- END IF no errors --//
		}	//-- END FOREACH IO --//
	}
	
	//----------------------------------------------------------------//
	//-- Return the Results                                         --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		//--------------------//
		//-- SUCCESS        --//
		//--------------------//
		return array(
			"Error"     => false,
			"Thing"     => $aResult
		);
	} else {
		//--------------------//
		//-- ERROR          --//
		//--------------------//
		return array(
			"Error"     => true,
			"ErrCode"   => $iErrCode,
			"ErrMesg"   => $sErrMesg
		);
	}
}



function PrepareAddNewIO( $iThingId, $aIO, $iThingState ) {
	//----------------------------------------------------//
	//-- INITIALISE VARIABLES                           --//
	//----------------------------------------------------//
	
	//-- 1.2 - Initialise normal variables --//
	$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught.                                                   --//
	$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used.                                        --//
	$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught.                                 --//
	$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
	$iIORSTypeId                = 0;            //-- INTEGER:       --//
	$iIOUoMId                   = 0;            //-- INTEGER:       --//
	$iIOTypeId                  = 0;            //-- INTEGER:       Used to hold the IO Type which governs what data table the IO stores its data in and if it is an Enumeration or not. --//
	$iIOState                   = 0;            //-- INTEGER:       --//
	$fIOSampleRate              = 0.0;          //-- FLOAT:         Used to hold the Sample Rate of when to expect the next submission of data since the last. (Useful for things like line graphs). --//
	$fIOSampleRateMax           = 0.0;          //-- FLOAT:         Used to hold the Sample Rate Max (Not used at this stage). --//
	$fIOSampleRateLimit         = 0.0;          //-- FLOAT:         Used to hold the Sample Rate Limit which is used to indicate the time in seconds that a IOMy device should have submitted data in before assuming that it is offline --//
	$fIOBaseConvert             = 0.0;          //-- FLOAT:         Used to hold the base convert value which is used to convert the value that the device provides into the Real Value that has a Unit of Measurement --//
	$sIOName                    = "";           //-- STRING:        Used to hold the IO name so that it can be stored in the database. --//
	$aTempResult7               = array();      //-- ARRAY:         --//
	$iIOId                      = 0;            //-- INTEGER:       Used to store the IOId after the IO has been added to the database. --//
	
	
	//----------------------------------------------------//
	//-- (Required) Check IO 'RSType' variable          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['RSType']) ) {
			if ( is_int( $aIO['RSType'] ) && $aIO['RSType']>0 ) {
				//-- INTEGER --//
				$iIORSTypeId = $aIO['RSType'];
				
			} else if( is_string( $aIO['RSType'] ) && is_numeric( $aIO['RSType'] ) ) {
				//-- STRING --//
				$iIORSTypeId = intval( $aIO['RSType'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 1;
				$sErrMesg .= "Problem the 'RSType' variable in one of the 'IO' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 2;
			$sErrMesg .= "Can not detect the 'RSType' variable in one of the 'IO' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check IO 'UoM' variable             --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['UoM']) ) {
			//-------------------------------------//
			//-- Fetch the UoM Id                --//
			//-------------------------------------//
			if ( is_int( $aIO['UoM'] ) && $aIO['UoM']>0 ) {
				//-- INTEGER --//
				$iIOUoMId = $aIO['UoM'];
				
			} else if( is_string( $aIO['UoM'] ) && is_numeric( $aIO['UoM'] ) ) {
				//-- STRING --//
				$iIOUoMId = intval( $aIO['UoM'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 3;
				$sErrMesg .= "Problem with the 'UoM' variable in one of the 'IO' arrays! \n";
			}
			
			//-------------------------------------//
			//-- Verify that the UoM Id is valid --//
			//-------------------------------------//
			if( $bError===false ) {
				if( !( $iIOUoMId>=1 ) ) {
					//-- ERROR --//
					$bError = true;
					$iErrCode  = 3;
					$sErrMesg .= "Problem with the 'UoM' variable in one of the 'IO' arrays! \n";
				}
			}
		} else {
			$bError = true;
			$iErrCode  = 4;
			$sErrMesg .= "Can not detect the 'UoM' variable in one of the 'IO' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check 'Type' variable               --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['Type']) ) {
			if ( is_int( $aIO['Type'] ) && $aIO['Type']>0 ) {
				//-- INTEGER --//
				$iIOTypeId = $aIO['Type'];
				
			} else if( is_string( $aIO['Type'] ) && is_numeric( $aIO['Type'] ) ) {
				//-- STRING --//
				$iIOTypeId = intval( $aIO['Type'] );
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 5;
				$sErrMesg .= "Problem with the 'Type' variable in one of the 'IO' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 6;
			$sErrMesg .= "Can not detect the 'Type' variable in one of the 'IO' arrays! \n";
		}
	}
	
	//----------------------------------------------------//
	//-- (Required) Check IO 'Name' variable            --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['Name']) ) {
			if(  is_string( $aIO['Name'] ) && $aIO['Name']!==""  ) {
				//-- Store the "Name" --//
				$sIOName = $aIO['Name'];
			} else {
				$bError = true;
				$iErrCode  = 7;
				$sErrMesg .= "Problem with the 'Name' variable in one of the 'IO' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 8;
			$sErrMesg .= "Can not detect the 'Name' variable in one of the 'IO' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check IO 'BaseConvert' variable     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['BaseConvert']) ) {
			//-------------------------------------//
			//-- Extract the Base Convert        --//
			//-------------------------------------//
			if ( is_numeric( $aIO['BaseConvert'] ) ) {
				//-- FLOAT --//
				$fIOBaseConvert = floatval( $aIO['BaseConvert'] );
				
			} else if( is_string( $aIO['BaseConvert'] ) && is_numeric( $aIO['BaseConvert'] ) ) {
				//-- STRING --//
				$fIOBaseConvert = floatval( $aIO['BaseConvert'] );
				
			} else {
				$bError = true;
				$iErrCode  = 9;
				$sErrMesg .= "Problem with the 'BaseConvert' variable in one of the 'IO' arrays! \n";
			}
			
			//-------------------------------------//
			//-- Verify the BaseConvert          --//
			//-------------------------------------//
			if( $bError===false ) {
				if(  $fIOBaseConvert===0 && $fIOBaseConvert===-0.0 ) {
					//-- ERROR: The value is either 0 or something similar --//
					$bError = true;
					$iErrCode  = 9;
					$sErrMesg .= "Problem with the 'BaseConvert' variable in one of the 'IO' arrays! \n";
					$sErrMesg .= "The 'BaseConvert' may be set to an unsupported value! \n";
				}
			}
		} else {
			$bError = true;
			$iErrCode  = 10;
			$sErrMesg .= "Can not detect the 'BaseConvert' variable in one of the 'IO' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Required) Check 'SampleRate' variable         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['SampleRate']) ) {
			if( is_string($aIO['SampleRate']) && is_numeric( $aIO['SampleRate'] ) ) {
				//-- STRING --//
				$fIOSampleRate = floatval( $aIO['SampleRate'] );
				
			} else if(  is_numeric( $aIO['SampleRate'] )  &&  ( $aIO['SampleRate']>0 )  ) {
				//-- FLOAT --//
				$fIOSampleRate = $aIO['SampleRate'];
				
			} else {
				//-- ERROR --//
				$bError = true;
				$iErrCode  = 11;
				$sErrMesg .= "Problem with the 'SampleRate' variable in one of the 'IO' arrays! \n";
			}
		} else {
			$bError = true;
			$iErrCode  = 12;
			$sErrMesg .= "Can not detect the 'SampleRate' variable in one of the 'IO' arrays! \n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Optional) Check 'SampleRateMax' variable      --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['SampleRateMax']) ) {
			
			if( is_string($aIO['SampleRateMax']) && is_numeric( $aIO['SampleRateMax'] ) ) {
				//-- STRING --//
				$fIOSampleRateMax = floatval( $aIO['SampleRateMax'] );
				
			} else if(  is_numeric( $aIO['SampleRateMax'] )  &&  ( $aIO['SampleRateMax']>0 )  ) {
				//-- FLOAT --//
				$fIOSampleRateMax = $aIO['SampleRateMax'];
				
			} else {
				//-- Set the SampleRateMax to the normal Sample Rate --//
				$fIOSampleRateMax = $fIOSampleRate;
			}
		} else {
			//-- Set the SampleRateMax to the normal Sample Rate --//
			$fIOSampleRateMax = $fIOSampleRate;
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Optional) Check 'SampleRateLimit' variable    --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['SampleRateLimit']) ) {
			
			if( is_string($aIO['SampleRateLimit']) && is_numeric( $aIO['SampleRateLimit'] ) ) {
				//-- STRING --//
				$fIOSampleRateLimit = floatval( $aIO['SampleRateLimit'] );
				
			} else if(  is_numeric( $aIO['SampleRateLimit'] )  &&  ( $aIO['SampleRateLimit']>0 )  ) {
				//-- FLOAT --//
				$fIOSampleRateLimit = $aIO['SampleRateLimit'];
				
			} else {
				//-- Set the SampleRateLimit to the normal Sample Rate times three --//
				$fIOSampleRateLimit = $fIOSampleRate * 3;
			}
		} else {
			//-- Set the SampleRateLimit to the normal Sample Rate times three --//
			$fIOSampleRateLimit = $fIOSampleRate * 3;
		}
	}
	
	
	//----------------------------------------------------//
	//-- (Optional) Check IO 'State' variable           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( isset($aIO['State']) ) {
			
			if ( is_int( $aIO['State'] ) && $aIO['State']>0) {
				//-- INTEGER --//
				$iIOState = $aIO['State'];
				
			} else if( is_string( $aIO['State'] ) && is_numeric( $aIO['State'] ) ) {
				//-- STRING --//
				$iIOState = intval( $aIO['State'] );

			} else if( $aIO['State']===true ) {
				$iIOState = 1;
				
			} else if( $aIO['State']===false ) {
				$iIOState = 0;
				
			} else {
				//-- Set the IO "State" to the Thing "State" --//
				$iIOState = $iThingState;
			}
		} else {
			//-- Set the IO "State" to the Thing "State" --//
			$iIOState = $iThingState;
		}
	}
	
	
	//----------------------------------------------------------------//
	//-- 5.1.5.3 - Verify that the User has permission              --//
	//----------------------------------------------------------------//
	if( $bError===false ) {
		
		$aVerifyResults = WatchInputsGetThingInfo( $iThingId );
		
		if( $aVerifyResults['Error']===true ) {
			$bError = true;
			$iErrCode  = 14;
			$sErrMesg .= "Critical Error adding the new IO! \n";
			$sErrMesg .= "Problem when looking up the Thing Info! \n";
			$sErrMesg .= $aVerifyResults['ErrMesg'];
		}
	}
	
	
	//--------------------------------------------------------//
	//-- 5.1.5.4.3 - Add the IO to the database             --//
	//--------------------------------------------------------//
	if( $bError===false ) {
		$aTempResult7 = AddNewIO( $iThingId, $iIORSTypeId, $iIOUoMId, $iIOTypeId, $iIOState, $fIOSampleRate, $fIOSampleRateMax, $fIOSampleRateLimit, $fIOBaseConvert, $sIOName, true );
		
		if( $aTempResult7['Error']===true ) {
			//----------------------------------------------------//
			//-- ERROR:                                         --//
			//----------------------------------------------------//
			$bError = true;
			$iErrCode  = 15;
			$sErrMesg .= "Problem when adding the 'IO' into the database! \n";
			$sErrMesg .= $aTempResult7['ErrMesg'];
			
		} else {
			//-- Extract the IOId from the insert results --//
			$iIOId = $aTempResult7['Data']['IOId'];
		}
	}
	
	
	//--------------------------------------------------------//
	//-- Return the Results                                 --//
	//--------------------------------------------------------//
	if( $bError===false ) {
		return array(
			"Error"     => false,
			"IOId"      => $iIOId
		);
		
	} else {
		return array(
			"Error"     => true,
			"ErrCode"   => $iErrCode,
			"ErrMesg"   => $sErrMesg
		);
	}
}




?>