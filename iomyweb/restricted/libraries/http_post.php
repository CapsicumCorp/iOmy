<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is a library that has a common list of functions for the APIs
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


function FetchHTTPDataParameters( $aParameters ) {
	//------------------------------------//
	//-- 1.0 - INITIALISE               --//
	//------------------------------------//
	
	//-- Declare Globals --//
	global $bError, $sErrMesg;
	
	
	$aResult = array();
	//------------------------------------//
	//-- 2.0 - HTTP REQUEST DATA        --//
	//------------------------------------//
	
	
	//-- If there are HTTP POST data --// 
	if( $_POST ) {
		$aHTTPData = $_POST;
		
	//-- ElseIf there are HTTP GET data --// 
	} else if ( $_GET ) {
		$aHTTPData = $_GET;
	
	//-- Else display an error due to parameters being required --//
	} else {
		$bError    = true;
		$sErrMesg .= "Error Code:0x0010 \n\n";
		$sErrMesg .= "No POST Parameters found!\n";
		$sErrMesg .= "Please use a valid \"Mode\" parameter\n";
	}
	
	
	//------------------------------------//
	//-- 3.0 - FETCH THE EXPECTED DATA  --//
	//------------------------------------//
	if($bError===false) {
		//-- 
		foreach ( $aParameters as $iKey => $aParameter ) {
			
			if( $bError===false ) {
				//-- Make sure there are the required parameters --//
				if( isset($aParameter["DataType"]) && isset($aParameter["Name"]) ) {
					//-- Fetch the key for the associative array for the parameter passed --//
					$sKey = $aParameter["Name"];
					
					//-- Check if the POST Value exists --//
					if( isset($aHTTPData[$sKey]) ) {
						//--------------------//
						//-- INTEGER        --//
						//--------------------//
						if( $aParameter["DataType"]==="INT" ) {
							try {
								//-- Convert to a Integer --//
								$Value = ConvertPostStringToInteger( $aHTTPData[$sKey] );
								//-- Add the Value to the list of values to return --//
								$aReturn[$sKey] = $Value;
								
							} catch( Exception $e ) {
								$aReturn[$sKey] = false;
							}
						
						//--------------------//
						//-- FLOAT          --//
						//--------------------//
						} else if( $aParameter["DataType"]==="FLO" ) {
							
							try {
								if( is_numeric($aHTTPData[$sKey]) ) {
									//-- Convert to a Float --//
									$Value = (float)$aHTTPData[$sKey];
									//-- Add the Value to the list of values to return --//
									$aReturn[$sKey] = $Value;
								} else {
									//-- Flag that the value is invalid --//
									$aReturn[$sKey] = false;
								}
								
							} catch( Exception $e ) {
								$bError = true;
								$sErrMesg .= "Error Converting Float";
							}
						
						//--------------------//
						//-- STRING         --//
						//--------------------//
						} else if( $aParameter["DataType"]==="STR" ) {
							
							try {
								if( $aHTTPData[$sKey]===null || $aHTTPData[$sKey]===false || $aHTTPData[$sKey]===true ) {
									$aReturn[$sKey] = "";
								} else {
									if( is_string($aHTTPData[$sKey]) || is_int($aHTTPData[$sKey]) || is_float($aHTTPData[$sKey]) ) {
										//----------------------------//
										//-- Convert to a String    --//
										//----------------------------//
										$Value = (string)$aHTTPData[$sKey];
										//-- Add the Value to the list of values to return --//
										$aReturn[$sKey] = $Value;
										
										
									} else {
										//----------------------//
										//-- Unsupported type --//
										//----------------------//
										$bError = true;
										$sErrMesg .= "Error Converting String!\n";
										$sErrMesg .= "The String is not in a suitable format.\n";
									}
								}
								
								
							} catch( Exception $e ) {
								$bError = true;
								$sErrMesg .= "Error Converting String!\n";
								$sErrMesg .= "Critical exception has occurred.\n";
							}
						}
						
					//-- ELSE the parameter wasn't found so return --//'
					} else {
						//-- Return false as that variable isn't found --//
						$aReturn[$sKey] = false;
					}
					
				} else {
					echo "API Writer made a mistake";
				}
			}
			//-- Debugging --//
			//echo "Key: $iKey; Value: $Value<br />\n";
		}
	}
	
	
	//------------------------------------//
	//-- 9.0 - RETURN RESULTS           --//
	//------------------------------------//
	if($bError===false) {
		return $aReturn;
	} else {
		return array();
	}
}


function ConvertPostStringToInteger($sNumber) {
	//--------------------------------------------------------------------//
	//-- DESCRIPTION: Used to convert a String into a numerical format. --//
	//--------------------------------------------------------------------//
	
	//-- Check for False variables --//
	if( $sNumber===null || $sNumber===false || $sNumber==="" ) {
		return false;
		
	//-- Check if already a Integer --//
	} else if( is_int($sNumber) ) {
		//-- Return the Integer --//
		return $sNumber;
		
	//-- Check if already a numeric --//
	} else if( is_float($sNumber) ) {
		//-- Return the Integer --//
		return (int) $sNumber;
		
	//-- Check if a String --//	
	} else if( is_string($sNumber) ) {
		
		//-- Check if it possible to convert to numeric --//
		if( is_numeric($sNumber) ) {
			
			//-- Check to make sure no extra characters are added (Decimals will be converted to Integers) --//
			if( preg_match( '/^[-+]?[0-9]*\.?[0-9]+$/', $sNumber ) ) {
				//-- Convert to Int --//
				return (int) $sNumber;
				
			//-- Invalid Characters detected --//
			} else {
				return false;
			}
		} else {
			return false;
		}
	} else {
		return false;
	}
}





function xssafe( $sData , $sEncoding='UTF-8' ) {
	return htmlspecialchars( $sData, ENT_QUOTES | ENT_HTML401, $sEncoding);
}


?>