<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This API is used for telnet commands to the Hub.
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
$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
$iErrCode                   = 0;            //-- INTEGER:       Used to hold the error code.  --//
$sErrMesg                   = "";           //-- STRING:        Used to store the error message after an error has been caught. --//
$sOutput                    = "";           //-- STRING:        This is the string that gets generated from the results. --//
$aResult                    = array();      //-- ARRAY:         Used to store the results.			--//

$sPostMode                  = "";           //-- STRING:        Used to store which Mode the API should function in.			--//
$sPostCommand               = "";           //-- STRING:        --//


$aTemp1                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp2                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp3                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp4                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp5                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp6                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp7                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp8                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//
$aTemp9                     = array();      //-- ARRAY:         Used to store the functions results before being parsed and converted to the correct format to be extracted or returned.	--//


//------------------------------------------------------------//
//-- 1.3 - IMPORT REQUIRED LIBRARIES                        --//
//------------------------------------------------------------//
require_once SITE_BASE.'/restricted/php/core.php';      //-- This should call all the additional libraries needed --//



//------------------------------------------------------------//
//-- 1.5 - Fetch Constants (Will be replaced)               --//
//------------------------------------------------------------//





//====================================================================//
//== 2.0 - Retrieve POST                                            ==//
//====================================================================//

//----------------------------------------------------//
//-- 2.1 - Fetch the Parameters                     --//
//----------------------------------------------------//
if($bError===false) {
	$RequiredParmaters = array(
		array( "Name"=>'Mode',                      "DataType"=>'STR' ),
		array( "Name"=>'Command',                   "DataType"=>'STR' ),
		array( "Name"=>'Access',                    "DataType"=>'STR' )
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
		//-- NOTE: Valid modes are going to be "CheckOptionalDBIndices", "ChangeOptionalDBIndices" --//
		
		//-- Verify that the mode is supported --//
		if( $sPostMode!=="CheckOptionalDBIndices" && $sPostMode!=="ChangeOptionalDBIndices" ) {
			$bError    = true;
			$iErrCode  = 101;
			$sErrMesg .= "Error Code:'0101' \n";
			$sErrMesg .= "Invalid \"Mode\" parameter! \n";
			$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
			$sErrMesg .= "eg. \n \"CheckOptionalDBIndices\" or \"ChangeOptionalDBIndices\" \n\n";
		}
		
	} catch( Exception $e0102 ) {
		$bError = true;
		$iErrCode  = 102;
		$sErrMesg .= "Error Code:'0102' \n";
		$sErrMesg .= "No \"Mode\" parameter! \n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
		$sErrMesg .= "eg. \n \"CheckOptionalDBIndices\" or \"ChangeOptionalDBIndices\" \n\n";
		//sErrMesg .= e0102.message;
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.2 - Retrieve "Command"                     --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeOptionalDBIndices" ) {
			try {
				//-- Retrieve the "Command" --//
				$sPostCommand = $aHTTPData["Command"];
				
				if( $sPostCommand===false ) {
					$bError = true;
					$iErrCode  = 103;
					$sErrMesg .= "Error Code:'0103' \n";
					$sErrMesg .= "Invalid \"Command\" parameter! \n";
					$sErrMesg .= "Please use a valid \"Command\" parameter\n";
					//$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
				}
				
			} catch( Exception $e0104 ) {
				$bError = true;
				$iErrCode  = 104;
				$sErrMesg .= "Error Code:'0104' \n";
				$sErrMesg .= "Incorrect \"Command\" parameter! \n";
				$sErrMesg .= "Please use a valid \"Command\" parameter\n";
				//$sErrMesg .= "eg. \n \"1\", \"2\", \"3\" \n\n";
			}
		}
	}
	
	
	//----------------------------------------------------//
	//-- 2.2.3 - Retrieve "Data" Array                  --//
	//----------------------------------------------------//
	if( $bError===false ) {
		if( $sPostMode==="ChangeOptionalDBIndices" ) {
			try {
				//-- Retrieve the "Data" --//
				$sPostData = $aHTTPData["Access"];
				
				if( $sPostData!=="" && $sPostData!==false && $sPostData!==null ) {
					//------------------------------------------------//
					//-- JSON Parsing                               --//
					//------------------------------------------------//
					$aPostData = json_decode( $sPostData, true );
					
					//------------------------------------------------//
					//-- IF "null" or a false like value            --//
					//------------------------------------------------//
					if( $aPostData===null || $aPostData==false ) {
						$bError    = true;
						$iErrCode  = 145;
						$sErrMesg .= "Error Code:'0145' \n";
						$sErrMesg .= "Invalid POST \"Access\"! \n";
						$sErrMesg .= "Couldn't extract JSON values from the \"Access\" parameter \n";
					}
					
				} else {
					$bError    = true;
					$iErrCode  = 145;
					$sErrMesg .= "Error Code:'0145' \n";
					$sErrMesg .= "Invalid POST \"Acess\" parameter! \n";
					$sErrMesg .= "Please use a valid data in the \"Access\" parameter \n";
				}
			} catch( Exception $e0146 ) {
				$bError = true;
				$sErrMesg .= "Error Code:'0146' \n";
				$sErrMesg .= "Incorrect \"Access\" parameter!\n";
				$sErrMesg .= "Please use a valid \"Access\" parameter\n";
			}
		}
	}
}



//====================================================================//
//== 4.0 - PREPARE                                                  ==//
//====================================================================//
if( $bError===false ) {
	try {
		//--------------------------------------------------------------------//
		//-- 4.1 -   --//
		//--------------------------------------------------------------------//
		if( $sPostMode==="CheckOptionalDBIndices" || $sPostMode==="ChangeOptionalDBIndices" ) {
			try {
				//----------------------------------------------------------------//
				//-- Check if the User has the "Upgrade" server permission      --//
				//----------------------------------------------------------------//
				$aServerPermissions = GetUserServerPermissions();
				
				
				if( $aServerPermissions['Error']===false ) {
					$iServerUpgradePerm     = $aServerPermissions['Data']['PermServerUpgrade'];
					
					
					if( $iServerUpgradePerm!==1 && $iServerUpgradePerm!=="1" ) {
						$bError    = true;
						$iErrCode  = 202;
						$sErrMesg .= "Error Code:'0202' \n";
						$sErrMesg .= "Your user doesn't appear the \"Server Upgrade\" permission that is required!\n";
						$sErrMesg .= "Please ask the administrator of this iOmy installation to grant you that permission.\n";
					}
					
				} else {
					$bError = true;
					$iErrCode  = 203;
					$sErrMesg .= "Error Code:'0203' \n";
					$sErrMesg .= "Problem looking up your user's server permissions.\n";
					$sErrMesg .= "Please ask the administrator of this iOmy installation for details.\n";
				}
				
			} catch( Exception $e0201 ) {
				$bError = true;
				$iErrCode  = 201;
				$sErrMesg .= "Error Code:'0201' \n";
				$sErrMesg .= "Critical Error Occurred!\n";
				$sErrMesg .= "Problem occurred when looking up your user's server permissions. \n";
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 4.2 - Lookup what the existing indices on the Data Tables are  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="CheckOptionalDBIndices" || $sPostMode==="ChangeOptionalDBIndices" ) {
				try {
					
					$aDataTableIndexList = array(
						array( "Table" => "DATATINYINT",     "Index" => "DATATINYINT_DATE" ),
						array( "Table" => "DATAINT",         "Index" => "DATAINT_DATE" ),
						array( "Table" => "DATABIGINT",      "Index" => "DATABIGINT_DATE" ),
						array( "Table" => "DATAFLOAT",       "Index" => "DATAFLOAT_DATE" ),
						array( "Table" => "DATATINYSTRING",  "Index" => "DATATINYSTRING_DATE" ),
						array( "Table" => "DATASHORTSTRING", "Index" => "DATASHORTSTRING_DATE" ),
						array( "Table" => "DATAMEDSTRING",   "Index" => "DATAMEDSTRING_DATE" ),
						array( "Table" => "DATALONGSTRING",  "Index" => "DATALONGSTRING_DATE" ),
						array( "Table" => "DATASTRING255",   "Index" => "DATASTRING255_DATE" )
					);
					
					
					foreach( $aDataTableIndexList as $aIndexSearch ) {
						
						
						if( $bError===false ) {
							//--------------------------------------------//
							//-- Reset Variables                        --//
							//--------------------------------------------//
							$bIndexFound  = false;
							$sTableName   = $aIndexSearch['Table'];
							$sIndexCol    = $aIndexSearch['Index'];
							
							
							//--------------------------------------------//
							//-- Lookup the Indicies in the Table       --//
							//--------------------------------------------//
							$aTemp1 = SpecialLookupTableIndicies( $sTableName );
							
							
							//--------------------------------------------//
							//-- Check for Errors                       --//
							//--------------------------------------------//
							if( $aTemp1['Error']===false ) {
								
								
								//--------------------------------------------//
								//-- Check if a Date index exists           --//
								//--------------------------------------------//
								foreach( $aTemp1['Data'] as $aIndex ) {
									//-- Check if the Suffix exists --//
									if( $aIndex["Column_name"]===$sIndexCol ) {
										//-- Flag that a match has been found --//
										$bIndexFound = true;
										
										//-- Store the Index --//
										$aTemp2 = $aIndex;
									}
								}	//-- ENDFOREACH --//
								
								
								//--------------------------------------------//
								//-- IF a match is found                    --//
								//--------------------------------------------//
								if( $bIndexFound===true ) {
									$aTemp3['Data'][$sTableName] = array(
										"Status" => 1,
										"Index"  => $aTemp2
									);
									
								} else {
									$aTemp3['Data'][$sTableName] = array(
										"Status" => 0
									);
								}
								
								//--------------------------------------------//
								//-- Debugging                              --//
								//--------------------------------------------//
								//$aResult['Data'][$sTable] = $aTemp1['Data'];
								
							} else {
								$aTemp3['Data'][$sTableName] = array(
									"Status" => -1
								);
							}
						}	//-- ENDIF No Errors have occurred --//
					}	//-- ENDFOREACH TableIndexSearch in TableIndexSearchList --//
					
				} catch( Exception $e0214 ) {
					$bError = true;
					$iErrCode  = 214;
					$sErrMesg .= "Error Code:'0214' \n";
					$sErrMesg .= "Critical Error Occurred! \n";
					$sErrMesg .= "Problem occurred when preparing for the main function. \n";
				}
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- Parse the command that was passed                          --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="ChangeOptionalDBIndices" ) {
				try {
					switch( $sPostCommand ) {
						//--------------------------------//
						//-- DATA TINY INT              --//
						//--------------------------------//
						case "DATATINYINT_Add":
							//-- Setup the variables --//
							$sTableName      = "DATATINYINT";
							$sTableIndexName = "IDX_DATATINYINT_DATE";
							$sTableColumn    = "DATATINYINT_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATATINYINT_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATATINYINT";
							$sTableColumn    = "DATATINYINT_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA INT                   --//
						//--------------------------------//
						case "DATAINT_Add":
							//-- Setup the variables --//
							$sTableName      = "DATAINT";
							$sTableIndexName = "IDX_DATAINT_DATE";
							$sTableColumn    = "DATAINT_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATAINT_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATAINT";
							$sTableColumn    = "DATAINT_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA BIG INT               --//
						//--------------------------------//
						case "DATABIGINT_Add":
							//-- Setup the variables --//
							$sTableName      = "DATABIGINT";
							$sTableIndexName = "IDX_DATABIGINT_DATE";
							$sTableColumn    = "DATABIGINT_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATABIGINT_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATABIGINT";
							$sTableColumn    = "DATABIGINT_DATE";
							$sCommand        = "Remove";
							break;
						
						//--------------------------------//
						//-- DATA FLOAT                 --//
						//--------------------------------//
						case "DATAFLOAT_Add":
							//-- Setup the variables --//
							$sTableName      = "DATAFLOAT";
							$sTableIndexName = "IDX_DATAFLOAT_DATE";
							$sTableColumn    = "DATAFLOAT_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATAFLOAT_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATAFLOAT";
							$sTableColumn    = "DATAFLOAT_DATE";
							$sCommand        = "Remove";
							break;
						
						//--------------------------------//
						//-- DATA TINY STRING           --//
						//--------------------------------//
						case "DATATINYSTRING_Add":
							//-- Setup the variables --//
							$sTableName      = "DATATINYSTRING";
							$sTableIndexName = "IDX_DATATINYSTRING_DATE";
							$sTableColumn    = "DATATINYSTRING_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATATINYSTRING_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATATINYSTRING";
							$sTableColumn    = "DATATINYSTRING_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA SHORT STRING          --//
						//--------------------------------//
						case "DATASHORTSTRING_Add":
							//-- Setup the variables --//
							$sTableName      = "DATASHORTSTRING";
							$sTableIndexName = "IDX_DATASHORTSTRING_DATE";
							$sTableColumn    = "DATASHORTSTRING_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATASHORTSTRING_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATASHORTSTRING";
							$sTableColumn    = "DATASHORTSTRING_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA MEDIUM STRING         --//
						//--------------------------------//
						case "DATAMEDSTRING_Add":
							//-- Setup the variables --//
							$sTableName      = "DATAMEDSTRING";
							$sTableIndexName = "IDX_DATAMEDSTRING_DATE";
							$sTableColumn    = "DATAMEDSTRING_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATAMEDSTRING_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATAMEDSTRING";
							$sTableColumn    = "DATAMEDSTRING_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA LONG STRING           --//
						//--------------------------------//
						case "DATALONGSTRING_Add":
							//-- Setup the variables --//
							$sTableName      = "DATALONGSTRING";
							$sTableIndexName = "IDX_DATALONGSTRING_DATE";
							$sTableColumn    = "DATALONGSTRING_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATALONGSTRING_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATALONGSTRING";
							$sTableColumn    = "DATALONGSTRING_DATE";
							$sCommand        = "Remove";
							break;
							
						//--------------------------------//
						//-- DATA STRING 255            --//
						//--------------------------------//
						case "DATASTRING255_Add":
							//-- Setup the variables --//
							$sTableName      = "DATASTRING255";
							$sTableIndexName = "IDX_DATASTRING255_DATE";
							$sTableColumn    = "DATASTRING255_DATE";
							$sCommand        = "Add";
							break;
							
						case "DATASTRING255_Remove":
							//-- Setup the variables --//
							$sTableName      = "DATASTRING255";
							$sTableColumn    = "DATASTRING255_DATE";
							$sCommand        = "Remove";
							break;
						
						//--------------------------------//
						//-- DEFAULT                    --//
						//--------------------------------//
						default:
							$bError    = true;
							$iErrCode  = 221;
							$sErrMesg .= "Error Code:'0221' \n";
							$sErrMesg .= "Critical Error Occurred! \n";
							$sErrMesg .= "Problem occurred when preparing for the main function. \n";
						
					}
					
				} catch( Exception $e0220 ) {
					$bError = true;
					$iErrCode  = 220;
					$sErrMesg .= "Error Code:'0220' \n";
					$sErrMesg .= "Critical Error Occurred! \n";
					$sErrMesg .= "Problem occurred when preparing for the main function. \n";
				}
			}
		}
		
		//----------------------------------------------------------------//
		//-- Parse the command that was passed                          --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			if( $sPostMode==="ChangeOptionalDBIndices" ) {
				try {
					
					if( $iServerUpgradePerm===1 || $iServerUpgradePerm==="1" ) {
						//------------------------------------------------//
						//-- Extract the DB Username and Password       --//
						//------------------------------------------------//
						if( isset($aPostData['Username']) && isset( $aPostData['Password']) ) {
							if( 
								$aPostData['Username']!==""     && $aPostData['Password']!==""      && 
								$aPostData['Username']!==false  && $aPostData['Password']!==false   && 
								$aPostData['Username']!==null   && $aPostData['Password']!==null
							) {
								$sDBUsername = $aPostData['Username'];
								$sDBPassword = $aPostData['Password'];
								
								//-- URI --//
								if( isset($aPostData['URI']) ) {
									$sDBURI      = $aPostData['URI'];
								} else {
									$sDBURI      = "127.0.0.1";
								}
							} else {
								$bError    = true;
								$sErrMesg .= "Error Code:'2231' \n";
								$sErrMesg .= "Problem adding a new user!\n";
								$sErrMesg .= "Invalid Username or Password!\n";
							}
							
						} else {
							$bError    = true;
							$sErrMesg .= "Error Code:'2232' \n";
							$sErrMesg .= "Problem adding a new user!\n";
							$sErrMesg .= "Invalid Username or Password!\n";
						}
						
						
						//------------------------------------------------//
						//-- Open the secondary DB Connection           --//
						//------------------------------------------------//
						if( $bError===false ) {
							$oRestrictedApiCore->InitialiseSecondaryDatabaseFromPrimary( $sDBUsername, $sDBPassword );
							
							//-- Return an error if it failed to initialise --//
							if( $oRestrictedApiCore->bSecondaryDB===false ) {
								//-- ERROR: Failed to open a connection as a MySQL Administrator --//
								$bError    = true;
								$sErrMesg .= "Error Code:'2233' \n";
								$sErrMesg .= "Problem adding a new user!\n";
								$sErrMesg .= "Failed opening the special database connnection as an administrator.\n";
							}
						}
					}
				} catch( Exception $e2230 ) {
					$bError = true;
					$iErrCode  = 2230;
					$sErrMesg .= "Error Code:'2230' \n";
					$sErrMesg .= "Critical Error Occurred! \n";
					$sErrMesg .= "Problem occurred when preparing for the main function. \n";
				}
			}
		}
		
	} catch( Exception $e0200 ) {
		$bError = true;
		$iErrCode  = 200;
		$sErrMesg .= "Error Code:'0200' \n";
		$sErrMesg .= "Critical Error Occurred! \n";
		$sErrMesg .= "Problem occurred when preparing for the main function. \n";
	}
}



//====================================================================//
//== 5.0 - MAIN                                                     ==//
//====================================================================//
if( $bError===false ) {
	try {
		//================================================================//
		//== 5.1 - MODE: Turns on Zigbee Join Mode                      ==//
		//================================================================//
		if( $sPostMode==="CheckOptionalDBIndices" ) {
			try {
				//-- Return the results of the indicies --//
				$aResult = $aTemp3;
			
			} catch( Exception $e1400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 1400;
				$sErrMesg  .= "Error Code:'1400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e1400->getMessage();
			}
			
		//================================================================//
		//== 5.2 - MODE: Turns on Zigbee Join Mode                      ==//
		//================================================================//
		} else if( $sPostMode==="ChangeOptionalDBIndices" ) {
			try {
				//------------------------------------------------//
				//-- Check if the Indicies List has the Table   --//
				//------------------------------------------------//
				if( isset( $aTemp3['Data'][$sTableName] ) ) {
					//-- IF The Status is "existing" and the command is "remove" --//
					if( $aTemp3['Data'][$sTableName]['Status']===1 && $sCommand==="Remove" ) {
						
						
						//-- Fetch the Table Index Name --//
						$sTableIndexName = $aTemp3['Data'][$sTableName]['Index']['Key_name'];
						
						//-- Delete the Index --//
						$aResult = DeleteIndexOnTable( $oRestrictedApiCore->oSecondaryDB, $sTableName, $sTableIndexName );
						
						
					//-- ELSEIF Status is "not-present" and the command is "add" --//
					} else if( $aTemp3['Data'][$sTableName]['Status']===0 && $sCommand==="Add" ) {
						
						//-- Create the Index --//
						$aResult = CreateIndexOnTable( $oRestrictedApiCore->oSecondaryDB, $sTableName, $sTableIndexName, $sTableColumn );
						
						
					//-- ELSEIF Status is unknown --//
					} else if( $aTemp3['Data'][$sTableName]['Status']!==1 && $aTemp3['Data'][$sTableName]['Status']!==0 ) {
						$bError     = true;
						$iErrCode   = 2441;
						$sErrMesg  .= "Error Code:'2441' \n";
						$sErrMesg  .= "Failed to lookup the status of the optional indicies. \n";
						
						
					//-- ELSE --//
					} else {
						$bError     = true;
						$iErrCode   = 2442;
						$sErrMesg  .= "Error Code:'2442' \n";
						$sErrMesg  .= "The desired change was already in effect! \n";
					}
					
				} else {
					//-- ERROR: Problem with the Table name --//
					$bError     = true;
					$iErrCode   = 2443;
					$sErrMesg  .= "Error Code:'2443' \n";
					$sErrMesg  .= "Something went wrong with the Table Array! \n";
				}
				
			} catch( Exception $e2400 ) {
				//-- Display an Error Message --//
				$bError     = true;
				$iErrCode   = 2400;
				$sErrMesg  .= "Error Code:'2400' \n";
				$sErrMesg  .= "Critical Error in the main section of the \"".$sPostMode."\" Mode!\n";
				$sErrMesg  .= $e2400->getMessage();
			}
			
			
		//================================================================//
		//== UNSUPPORTED MODE                                           ==//
		//================================================================//
		} else {
			$bError = true;
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
	
	//echo json_encode( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
	
	
	
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