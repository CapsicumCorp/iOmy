<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a special API for use with WatchInputs only.
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
//-- #1.1# - Configure Variables                            --//
//------------------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../../..');
}


//------------------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES                             --//
//------------------------------------------------------------//
$aRestrictedApiCore                 = array();
$aRestrictedApiCore['DBId']         = 0;      //-- INTEGER:     The database defined in the iomy_vanilla.php file to attempt to login to. --//
$aRestrictedApiCore['LoginResult']  = false;  //-- BOOLEAN:     This is used to flag if the User succeeded in logging in. --//
$aRestrictedApiCore['ValidSession'] = false;  //-- BOOLEAN:     This is used to flag if the User has a valid session. Default is set to false --//
$aRestrictedApiCore['RestrictedDB'] = false;  //-- BOOLEAN:     This is used to flag if there is a Restricted Database Connection. Default is set to false --//


$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
$iErrCode                   = 0;            //-- INTEGER:       Used to indicate what the error code of the api is used. --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        This is the output that this PHP API returns. --//

$aResult                    = array();      //-- ARRAY:         Used to store the value returned from the function call.                                        --//
$aRequiredParmaters         = array();      //-- ARRAY:         Used to store the expected HTTP POST Parameters.                                                --//
$sPostMode                  = "";           //-- STRING:        Holds the desired Mode that this API should function.                                           --//
$sPostAccess                = "";           //-- STRING:        Holds in JSON string form the Username an Password to log into the Database with.               --//
$sPostData                  = "";           //-- STRING:        Holds in JSON string form the Data of what Links, Things and/or IOs that need to be created.    --//
$aPostAccess                = array();      //-- ARRAY:         The POST 'Access' array after being converted from a JSON string.                               --//
$aPostData                  = array();      //-- ARRAY:         The POST 'Data' array after being converted from a JSON string.                                 --//
$oRestrictedDB              = null;         //-- OBJECT:        Database Access and functions will be stored in this object variable.                           --//
$bTransactionStarted        = false;        //-- BOOLEAN:       Used to indicate if the Transactions has been started so that it knows if rollback is needed.   --//
$iVerPrimary                = 0;            //-- INTEGER:       --//
$iVerSecondary              = 0;            //-- INTEGER:       --//
$sVerTertiary               = 0;            //-- INTEGER:       --//
$aVerTemp                   = array();      //-- ARRAY:         --//

$iLinkId                    = 0;            //-- INTEGER:       --//
$iThingId                   = 0;            //-- INTEGER:       The current ThingId that is either retrieved from the POST Variable or after an Thing Insert occurs. --//


//------------------------------------------------------------//
//-- 1.3 - Import Required Libraries                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/constants.php';
require_once SITE_BASE.'/restricted/libraries/dbmysql.php';
require_once SITE_BASE.'/restricted/libraries/functions.php';
require_once SITE_BASE.'/restricted/libraries/userauth.php';



//------------------------------------------------------------//
//-- 1.4 -              --//
//------------------------------------------------------------//

class PseudoRestrictedAPICore {
	//-- Declare Public Variables --//
	public      $bRestrictedDB          = false;
	public      $oRestrictedDB;
	
	//--  --//
	
	
	
	
	
	
}



//====================================================================//
//== 2.0 - RETRIEVE POST                                            ==//
//====================================================================//

//------------------------------------------------------------//
//-- 2.1 - Fetch the Parameters                             --//
//------------------------------------------------------------//
if($bError===false) {
	$aRequiredParmaters = array(
		array( "Name"=>'Mode',          "DataType"=>'STR' ),
		array( "Name"=>'Version',       "DataType"=>'STR' ),
		array( "Name"=>'Access',        "DataType"=>'STR' ),
		array( "Name"=>'Data',          "DataType"=>'STR' )
	);
	
	$aHTTPData = FetchHTTPDataParameters( $aRequiredParmaters );
}


//------------------------------------------------------------//
//-- 2.2 - Store the POST Parameters into their variables   --//
//------------------------------------------------------------//
if($bError===false) {
	//----------------------------------------------------//
	//-- 2.2.1 - Extract the API "Mode"                 --//
	//----------------------------------------------------//
	try {
		//-- Extract the "Mode" Parameter --//
		$sPostMode = $aHTTPData["Mode"];
		//-- NOTE: Valid modes are going to be "AddComm", "AddLink", "AddThing", "AddIO" --//
		
		
		//-- Display an error if the mode is unsupported --//
		if( $sPostMode!=="AddComm" && $sPostMode!=="AddLink" && $sPostMode!=="AddThing" && $sPostMode!=="AddIO") {
			$bError = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddLink\", \"AddThing\", \"AddIO\" & \"AddComm\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddLink\", \"AddThing\", \"AddIO\" & \"AddComm\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve the API "Version"             --//
	//----------------------------------------------------//
	try {
		$sPostVersion = $aHTTPData["Version"];
		
		//-- Verify that the mode is supported --//
		if( $sPostVersion==="" ) {
			$bError = true;
			$iErrCode  = 103;
			$sErrMesg .= "Error Code:'0103' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"AddLink\" \n\n";
		}
		
	} catch( Exception $e0104 ) {
		$bError = true;
		$iErrCode  = 104;
		$sErrMesg .= "Error Code:'0104' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"AddLink\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Extract the "Access" Parameter         --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Extract the "Access" Parameter --//
			$sPostAccess = $aHTTPData["Access"];
			
			if( $sPostAccess===false ) {
				$bError = true;
				$iErrCode  = 105;
				$sErrMesg .= "Error Code:'0105' \n";
				$sErrMesg .= "Invalid \"Access\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Access\" parameter\n";
				$sErrMesg .= "eg. \n \n\n";
			}
			
		} catch( Exception $e0106 ) {
			$bError = true;
			$iErrCode  = 106;
			$sErrMesg .= "Error Code:'0106' \n";
			$sErrMesg .= "Incorrect \"Access\" parameter!";
			$sErrMesg .= "Please use a valid \"Access\" parameter";
			$sErrMesg .= "eg. \n \n\n";
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.4 - Extract the "Data" Parameter           --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			//-- Retrieve the "Data" --//
			$sPostData = $aHTTPData["Data"];
			
			if( $sPostData===false ) {
				$bError    = true;
				$iErrCode  = 107;
				$sErrMesg .= "Error Code:'0107' \n";
				$sErrMesg .= "Non numeric \"Data\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Data\" parameter\n";
				//$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
			}
			
		} catch( Exception $e0108 ) {
			$bError    = true;
			$iErrCode  = 108;
			$sErrMesg .= "Error Code:'0108' \n";
			$sErrMesg .= "Incorrect \"Data\" parameter!";
			$sErrMesg .= "Please use a valid \"Data\" parameter";
			//$sErrMesg .= "eg. \n 1, 2, 3 \n\n";
		}
	}
}	//-- END of POST --//



//====================================================================//
//== 3.0 - PREPARE                                                  ==//
//====================================================================//
if($bError===false) {
	try {
		//================================================================//
		//== 3.1 - API SUPPORT LIBRARY SELECTION                        ==//
		//================================================================//
		//if( $bError===false ) {
			try {
				//------------------------------------------------//
				//-- EXTRACT THE VERSION DATA                   --//
				//------------------------------------------------//
				try {
					
					$aVerTemp = explode( '.', $sPostVersion, 3 );
					
					//var_dump($aVerTemp);
					//--------------------------------//
					//-- PRIMARY VERSION NUMBER     --//
					//--------------------------------//
					if( isset( $aVerTemp[0] ) && is_numeric( $aVerTemp[0] ) ) {
						$iVerPrimary            = intval( $aVerTemp[0] );
						
					} else {
						$bError = true;
						$iErrCode  = 201;
						$sErrMesg .= "Error Code:'0201' \n";
						$sErrMesg .= "Problem with the HTTP POST \"Version\" primary parameter! \n";
					}
					
					
					//--------------------------------//
					//-- SECONDARY VERSION NUMBER   --//
					//--------------------------------//
					if( isset( $aVerTemp[1] ) && is_numeric( $aVerTemp[1] ) ) {
						$iVerSecondary            = intval( $aVerTemp[1] );
					} else {
						$bError = true;
						$iErrCode  = 202;
						$sErrMesg .= "Error Code:'0202' \n";
						$sErrMesg .= "Problem with the HTTP POST \"Version\" secondary parameter! \n";
					}
					
					
					//--------------------------------//
					//-- TERTIARY VERSION NUMBER    --//
					//--------------------------------//
					if( isset( $aVerTemp[2] ) && is_numeric( $aVerTemp[2] ) ) {
						$sVerTertiary            = $aVerTemp[2];
					} else {
						//-- Set the tertiary to 0 --//
						$sVerTertiary = "0";
					}
					
				} catch( Exception $e0204 ) {
					$bError = true;
					$iErrCode  = 204;
					$sErrMesg .= "Error Code:'0204' \n";
					$sErrMesg .= "Problem with the HTTP POST \"Version\" parameter! \n";
					$sErrMesg .= $e0204->getMessage();
				}
				
				//------------------------------------------------//
				//-- LOAD THE APPROPIATE SUPPORT LIBRARY        --//
				//------------------------------------------------//
				//if( $iVerPrimary===0 ) {
					//if( $iVerPrimary ) {
						require_once SITE_BASE.'/restricted/libraries/special/versions/0.4.3.php';
					//}
				//}
				
			} catch( Exception $e0205 ) {
				$bError = true;
				$iErrCode  = 205;
				$sErrMesg .= "Error Code:'0205' \n";
				$sErrMesg .= "Problem when loading the \"Version\" module! \n";
				$sErrMesg .= $e0205->getMessage();
			}
		//}
		
		
		//================================================================//
		//== 3.2 - CONVERT JSON STRING "ACCESS" TO AN ARRAY             ==//
		//================================================================//
		if( $bError===false ) {
			try {
				//------------------------------------------------//
				//-- "ACCESS" JSON PARSING                      --//
				//------------------------------------------------//
				$aPostAccess = json_decode( $sPostAccess, true );
				
				//------------------------------------------------//
				//-- IF "null" or a false like value            --//
				//------------------------------------------------//
				if( $aPostAccess===null || $aPostAccess==false ) {
					$bError = true;
					$iErrCode  = 206;
					$sErrMesg .= "Error Code:'0206' \n";
					$sErrMesg .= "Invalid HTTP POST \"Access\" parameter ";
				}
				
			} catch( Exception $e0207 ) {
				$bError = true;
				$iErrCode  = 207;
				$sErrMesg .= "Error Code:'0207' \n";
				$sErrMesg .= "Problem with the HTTP POST \"Access\" parameter! \n";
				$sErrMesg .= $e0207->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.3 - EXTRACT THE DATA FROM THE "ACCESS" ARRAY             ==//
		//================================================================//
		if( $bError===false ) {
			try {
				//---------------------------------//
				//-- Check Username & Password   --//
				//---------------------------------//
				if( isset($aPostAccess[0]) && isset($aPostAccess[1]) ) {
					//-- Check to make sure they aren't empty --//
					if( trim($aPostAccess[0])!=="" && trim($aPostAccess[1])!=="" ) {
						
						//$Config['DB'][0]['mode'] = "normal";
						
						//------------------------------------------//
						//-- Open Database Connection             --//
						//------------------------------------------//
						$oRestrictedDB = new DBMySQL(
							$Config['DB'][0],
							$aPostAccess[0],
							$aPostAccess[1]
						);
						
						//var_dump($oRestrictedDB);
						
						
						//------------------------------------------//
						//-- Check if the DB connection succeeded --//
						//------------------------------------------//
						if( $oRestrictedDB->Initialised===true ) {
							
							$oRestrictedApiCore = new PseudoRestrictedAPICore();
							
							$oRestrictedApiCore->oRestrictedDB = $oRestrictedDB;
							$oRestrictedApiCore->bRestrictedDB = true;
							
							
							if( $oRestrictedApiCore->bRestrictedDB===false ) {
								//-- No Database username detected --//
								$bError    = true;
								$iErrCode  = 11;
								$sErrMesg .= "Error Code:'0211' \n";
								$sErrMesg .= "Can't access the database! \n";
								$sErrMesg .= "Possibly invalid Username and/or Password combination.\n";
							}
					
						} else {
							//-- LOGIN ATTEMPT HAD AN ERROR --//
							$bError    = true;
							$iErrCode  = 12;
							$sErrMesg .= "Error Code:'0212' \n";
							$sErrMesg .= "Can't access the database! \n";
							$sErrMesg .= "Failed to initialise the database connection.\n";
						}
					} else {
						//-- Parameters are missing --//
						$bError    = true;
						$iErrCode  = 12;
						$sErrMesg .= "Error Code:'0212' \n";
						$sErrMesg .= "Can't access the database! \n";
						$sErrMesg .= "Invalid Username and/or Password parameters.\n";
						
					}
				} else {
					//-- Parameters are missing --//
					$bError    = true;
					$iErrCode  = 12;
					$sErrMesg .= "Error Code:'0012' \n";
					$sErrMesg .= "Can't access the database! \n";
					$sErrMesg .= "Invalid Username and/or Password parameters.\n";
				}
				
			} catch( Exception $e1 ) {
				$bError = true;
				$iErrCode  = 10;
				$sErrMesg .= "Error Code:'0010' \n";
				$sErrMesg .= "Critical error when attempting to access the database! \n";
				$sErrMesg .= $e1->getMessage();
			}
		}
		
		
		//================================================================//
		//== 3.4 - CONVERT JSON STRING "DATA" TO AN ARRAY               ==//
		//================================================================//
		if( $bError===false ) {
			try {
				//------------------------------------------------//
				//-- "ACCESS" JSON PARSING                      --//
				//------------------------------------------------//
				$aPostData = json_decode( $sPostData, true );
				
				//------------------------------------------------//
				//-- IF "null" or a false like value            --//
				//------------------------------------------------//
				if( $aPostData===null || $aPostData==false ) {
					$bError    = true;
					$iErrCode  = 208;
					$sErrMesg .= "Error Code:'0208' \n";
					$sErrMesg .= "Invalid POST \"Data\" \n";
				}
				
			} catch( Exception $e0209 ) {
				$bError    = true;
				$iErrCode  = 209;
				$sErrMesg .= "Error Code:'0209' \n";
				$sErrMesg .= $e0209->getMessage();
			}
		}
		
	} catch( Exception $e0200 ) {
		$bError    = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= $e0200->getMessage();
	}
}



//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if($bError===false) {
	try {
		//================================================================//
		//== 5.1 - MODE: Add Link                                       ==//
		//================================================================//
		if( $sPostMode==="AddLink" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.1.1 -                                                    --//
				//----------------------------------------------------------------//
				
				
				
				//----------------------------------------------------------------//
				//-- 5.1.4 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.1.5 - Add the new Link                                   --//
				//----------------------------------------------------------------//
				$aResult = PrepareAddNewLink( $aPostData );
				//-- NOTE: This function requires an allocation of over 20 error codes --//
				
				
				//----------------------------------------------------------------//
				//-- 5.1.6 - Check for errors                                   --//
				//----------------------------------------------------------------//
				if( $aResult["Error"]===true ) {
					//-- Display an Error Message --//
					$bError    = true;
					$iErrCode  = 1421+$aResult["ErrCode"];
					$sErrMesg .= $aResult["ErrMesg"];
				}
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 1400;
				$sErrMesg .= "Error Code:'1400' \n";
				$sErrMesg .= $e1400->getMessage();
			}
			
			
		//================================================================//
		//== 5.2 - MODE: Add Thing                                      ==//
		//================================================================//
		} else if( $sPostMode==="AddThing" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.2.1 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.2.4 - Extract the Link Id                                --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( isset( $aPostData['LinkId'] ) ) {
						
						//-- Perform Validation --//
						if ( is_int( $aPostData['LinkId'] ) && $aPostData['LinkId']>0 ) {
							//-- INTEGER --//
							$iLinkId = $aPostData['LinkId'];
							
						} else if( is_string( $aPostData['LinkId'] ) && is_numeric( $aPostData['LinkId'] ) ) {
							//-- STRING --//
							$iLinkId = intval( $aPostData['LinkId'] );
							
						} else {
							//-- Error --//
							$bError    = true;
							$iErrCode  = 2401;
							$sErrMesg .= "Error Code:'2401' \n";
							$sErrMesg .= "Problem with the 'LinkId' variable in the data array!\n";
						}
					} else {
						//-- Error --//
						$bError    = true;
						$iErrCode  = 2402;
						$sErrMesg .= "Error Code:'2402' \n";
						$sErrMesg .= "Can not detect the 'LinkId' variable in the data array!\n";
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.2.5 - Add the new Thing                                  --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					//-- Add the new thing --//
					$aResult = PrepareAddNewThing( $iLinkId, $aPostData, 0, "", "" );
					
					//-- Check for errors --//
					if( $aTempResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 2410+$aTempResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aTempResult["ErrMesg"];
					}
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 2400;
				$sErrMesg .= "Error Code:'2400' \n";
				$sErrMesg .= $e2400->getMessage();
			}
			
		//================================================================//
		//== 5.3 - MODE: Add IO                                         ==//
		//================================================================//
		} else if( $sPostMode==="AddIO" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.3.1 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
				
				if( $bTransactionStarted===false ) {
					$bError    = true;
					$iErrCode  = 16;
					$sErrMesg .= "Error Code:'0016' \n";
					$sErrMesg .= "Database Error! \n";
					$sErrMesg .= "Problem when trying to start the transaction! \n";
				}
				
				//----------------------------------------------------------------//
				//-- 5.3.3 - Extract the Thing Id                               --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					if( isset($aPostData['ThingId']) ) {
						
						//-- Perform Validation --//
						if ( is_int( $aPostData['ThingId'] ) && $aPostData['ThingId']>0 ) {
							//-- INTEGER --//
							$iThingId = $aPostData['ThingId'];
							
						} else if( is_string( $aPostData['ThingId'] ) && is_numeric( $aPostData['ThingId'] ) ) {
							//-- STRING --//
							$iThingId = intval( $aPostData['ThingId'] );
							
						} else {
							$bError = true;
							$iErrCode  = 3401;
							$sErrMesg .= "Error Code:'3401' \n";
							$sErrMesg .= "Problem with the 'ThingId' variable in the data array!\n";
						}
					} else {
						//-- Error --//
						$bError = true;
						$iErrCode  = 3402;
						$sErrMesg .= "Error Code:'3402' \n";
						$sErrMesg .= "Can not detect the 'ThingId' variable in the data array!\n";
					}
				}
				
				
				//----------------------------------------------------------------//
				//-- 5.3.5 - Add the new IO                                     --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					//-- Add the new thing --//
					$aResult = PrepareAddNewIO( $iThingId, $aPostData, 0 );
					
					//-- Check for errors --//
					if( $aResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 3410+$aResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
				
			} catch( Exception $e3400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 3400;
				$sErrMesg .= "Error Code:'3400' \n";
				$sErrMesg .= $e3400->getMessage();
			}
			
			
		//================================================================//
		//== 5.4 - MODE: Add Comm                                       ==//
		//================================================================//
		} else if( $sPostMode==="AddComm" ) {
			try {
				//----------------------------------------------------------------//
				//-- 5.4.4 - Begin the transaction                              --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
					
					if( $bTransactionStarted===false ) {
						$bError    = true;
						$iErrCode  = 16;
						$sErrMesg .= "Error Code:'0016' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "Problem when trying to start the transaction! \n";
					}
				}
				
				//----------------------------------------------------------------//
				//-- 5.3.5 - Add the new IO                                     --//
				//----------------------------------------------------------------//
				if( $bError===false ) {
					
					//-- Add the new thing --//
					$aResult = PrepareAddNewComm( $aPostData, 0 );
					
					//-- Check for errors --//
					if( $aResult["Error"]===true ) {
						//-- Display an Error Message --//
						$bError    = true;
						$iErrCode  = 4410+$aResult['ErrCode'];
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= $aResult["ErrMesg"];
					}
				}
				
				
			} catch( Exception $e4400 ) {
				//-- Display an Error Message --//
				$bError    = true;
				$iErrCode  = 4400;
				$sErrMesg .= "Error Code:'4400' \n";
				$sErrMesg .= $e4400->getMessage();
			}
			
		//================================================================//
		//== 5.? - ERROR: UNSUPPORTED MODE                              ==//
		//================================================================//
		} else {
			$bError    = true;
			$iErrCode  = 0401;
			$sErrMesg .= "Error Code:'0401' \n";
			$sErrMesg .= "Unsupported Mode! \n";
		}
		
	} catch( Exception $e0400 ) {
		$bError    = true;
		$iErrCode  = 0400;
		$sErrMesg .= "Error Code:'0400' \n";
		$sErrMesg .= $e0400->getMessage();
	}
}


//====================================================================//
//== 7.0 - FINALISE THE TRANSACTION                                 ==//
//====================================================================//
if( $bTransactionStarted===true ) {
	//----------------------------------------//
	//-- SQL COMMIT OR ROLLBACK             --//
	//----------------------------------------//
	if( $bError===false ) {
		//-- Commit the changes --//
		$oRestrictedApiCore->oRestrictedDB->dbEndTransaction();
		
	} else {
		//-- Rollback changes --//
		$oRestrictedApiCore->oRestrictedDB->dbRollback();
		
	}
}


//====================================================================//
//== 8.0 - LOG THE RESULTS                                          ==//
//====================================================================//

//header('Content-Type: text/plain');
//$bError = true;
//if( $oRestrictedDB ) {
	//var_dump( $oRestrictedDB->QueryLogs );
	//echo "\n\n";
//}


//====================================================================//
//== 9.0 - FINALISE                                                 ==//
//====================================================================//

//----------------------------------------//
//-- API didn't encounter an Error      --//
//----------------------------------------//
if( $bError===false && $aResult!=false ) {
	try {
		//-- Force the page to JSON --//
		header('Content-Type: application/json');
		
		//-- Convert results to a string --//
		$sOutput .= json_encode( $aResult );
		
		//-- Output results --//
		echo $sOutput;
		
	} catch( Exception $e0001 ) {
		
		//-- The aResult array cannot be turned into a string due to corruption of the array --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 1,
			"ErrMesg" => "Error Code:'0001' \n ".$e0001->getMessage()." "
		);
		
		echo json_encode( $aResult );
		
	}
	
	
//----------------------------------------//
//-- API Error has occurred             --//
//----------------------------------------//
} else {
	//-- Set the page to JSON when an error. Note this can be changed to "text/html" or "test/plain". --//
	header('Content-Type: application/json');
	
	//--------------------------------------------//
	//-- PREPARE THE CORRECT ERROR MESSAGE      --//
	//--------------------------------------------//
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 2,
			"ErrMesg" => "Error Code:'0002' \n No Result!"
		);
		$sOutput = json_encode( $aResult );
		
	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 3,
			"ErrMesg" => "Error Code:'0003' \n Critical Error has occured!\n Undefinable Error Message"
		);
		$sOutput = json_encode( $aResult );
		
		
	} else if( $sErrMesg!=false ) {
		//-- Output the Error Message --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => $iErrCode,
			"ErrMesg" => $sErrMesg
		);
		$sOutput = json_encode( $aResult );
		
		
	} else {
		//-- Error Message is blank --//
		$sOutput  = "Error Code:'0004' \n Critical Error has occured!";
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 4,
			"ErrMesg" => "Error Code:'0004' \n Critical Error has occured!"
		);
		$sOutput = json_encode( $aResult );
	}
	
	//--------------------------------------------//
	//-- OUTPUT THE ERROR MESSAGE               --//
	//--------------------------------------------//
	try {
		//-- Text Error Message --//
		echo $sOutput;
		
	} catch( Exception $e0005 ) {
		//-- Failsafe Error Message --//
		$aResult = array(
			"Error"   => true,
			"ErrCode" => 5,
			"ErrMesg" => "Error Code:'0005' \n Critical Error has occured!"
		);
		
		echo json_encode( $aResult );
	}
}


?>