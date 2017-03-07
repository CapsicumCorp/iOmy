<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP class is used for editing the device rules config file
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

define("CustomConfig1stCategory", "aaa_BeforeOtherCategories");



function ConfigLineParse( $sTrimmedLine ) {
	//--------------------------------------------------------//
	//-- 1.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	$bMatch                = false;     //-- BOOLEAN:       Used to indicate if a suitable match has been found. --//
	$sChar1                = "";        //-- STRING:        Used to store the first character in the line. --//
	$sChar2                = "";        //-- STRING:        Used to hold the last character to see if it is a category. --//
	$iStringLength         = 0;         //-- INTEGER:       --//
	$iCharPosition         = 0;         //-- INTEGER:       --//
	$sPart1                = "";        //-- STRING:        --//
	$sPart2                = "";        //-- STRING:        --//
	$aResult               = array();   //-- ARRAY:         --//
	
	
	//--------------------------------------------------------//
	//-- 2.0 - Prepare for checking the line                --//
	//--------------------------------------------------------//
	//-- Extract the first character --//
	$sChar1 = mb_substr( $sTrimmedLine, 0, 1, 'UTF8' );
	
	
	//--------------------------------------------------------//
	//-- 5.1.A - Check if the line is a category            --//
	//--------------------------------------------------------//
	if( $sChar1==="[" ) { 
		
		//-- Find the string length --//
		$iStringLength = mb_strlen( $sTrimmedLine );
		
		//-- Find the Last Character --//
		$sChar2 = mb_substr( $sTrimmedLine, ( $iStringLength - 1 ), 1, 'UTF8' );
		
		
		if( $sChar2==="]" ) {
			//-- Extract the Category --//
			$sCurrentCategory = mb_substr( $sTrimmedLine, 1, ( $iStringLength - 2 ), 'UTF8' );
			
			if( $sCurrentCategory!==null && $sCurrentCategory!==false && $sCurrentCategory!=="" ) {
				//--------------------------------//
				//-- OPTION 1: CATEGORY         --//
				//--------------------------------//
				$bMatch  = true;
				$aResult = array(
					"Type"      => "Category",
					"Value"     => $sCurrentCategory
				);
			}
		}
		
	//--------------------------------------------------------//
	//-- 5.1.B - Check if the line is a comment             --//
	//--------------------------------------------------------//
	} else if( $sChar1==="#" || $sChar1===";" ) {
		//--------------------------------//
		//-- OPTION 2: Comment          --//
		//--------------------------------//
		$bMatch  = true;
		$aResult = array(
			"Type"  => "Comment",
			"Value" => $sTrimmedLine
		);
		
		
	//--------------------------------------------------------//
	//-- 5.1.C - Else look at the rest of the string        --//
	//--------------------------------------------------------//
	} else {
		//----------------------------------------------------//
		//-- Search to see if there is an equals character  --//
		$iCharPosition = mb_strpos( $sTrimmedLine, "=", 0 , "UTF8" );
		
		//-- IF a equals character is found --//
		if( $iCharPosition!==false ) {
			//--------------------------------------------------------//
			//-- OPTION 3: Variable Assignment                      --//
			//--------------------------------------------------------//
			
			//-- Fetch the assignment variable --//
			$sPart1 = trim ( mb_substr( $sTrimmedLine, 0, $iCharPosition, 'UTF8' ) );
			
			//-- Fetch the assignment value --//
			$sPart2 = trim ( mb_substr( $sTrimmedLine, ($iCharPosition+1), null, 'UTF8' ) );
			
			//-- Prepare the Results --//
			$bMatch  = true;
			$aResult = array(
				"Type"  => "Assignment",
				"Var"   => $sPart1,
				"Value" => $sPart2
			);
		//-- ELSE do nothing --//
		}
	}
	
	
	//--------------------------------------------------------//
	//-- 9.0 - Return the Results                           --//
	//--------------------------------------------------------//
	if( $bMatch===true) {
		//-- Success --//
		return $aResult;
		
	} else {
		//-- Failure --//
		return false;
		
	}
}


function SpecialConfigParser( $sFileContent ) {
	//--------------------------------------------------------//
	//-- 1.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	
	//-- Original Variables --//
	$sCurrentCategory      = "";
	$aFileLines            = array();
	$sTrimmedLine          = "";
	$aExtractedFileData    = array();
	$aTemp                 = array();
	$bPerformNormalAdd     = false;
	
	
	//-- Special Addon variables --//
	$aSpecialAssignTemp    = array();
	$bSpecialPending       = false;			//-- BOOLEAN: Used to indicate if there is a special group of lines pending --//
	$bSpecialFlag1         = false;
	$bSpecialFlag2         = false;
	$bSpecialFlag3         = false;
	$bPerformSpecialAdd    = false;         //-- BOOLEAN:  --//

	
	//--------------------------------------------------------//
	//-- 2.0 - Preparation                                  --//
	//--------------------------------------------------------//
	
	//-- Breakup each line to an element in an array --//
	$aFileLines = explode("\n", $sFileContent);
	
	//-- Setup the special category --//
	$sCurrentCategory = CustomConfig1stCategory;
	
	//--------------------------------------------------------//
	//-- 4.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	foreach( $aFileLines as $sFileLine ) {
		//-- Trim the line to remove excess whitespace that doesn't do anything --//
		$sTrimmedLine = trim( $sFileLine );
		
		//--------------------------------------------------------//
		//-- 4.2 - IF The trimmed line is not a empty string    --//
		//--------------------------------------------------------//
		if( $sTrimmedLine!=="" && $sTrimmedLine!==null && $sTrimmedLine!==null ) {
			
			//-- Parse the line --//
			$aTemp = ConfigLineParse( $sTrimmedLine );
			
			
			if( $aTemp!==false ) {
				//--------------------------------------------------------//
				//-- Reset the Perform                                  --//
				//--------------------------------------------------------//
				$bPerformNormalAdd = true;
				
				
				//--------------------------------------------------------//
				//-- Special Devices                                    --//
				//--------------------------------------------------------//
				if( $bSpecialPending===true ) {
					//-- Check if all pieces are present --//
					if( $bSpecialFlag1===true && $bSpecialFlag2===true && $bSpecialFlag3 ) {
						$bPerformSpecialAdd = true;
					}
					
					
					//--------------------------------------------------------//
					//-- IF the Category changes                            --//
					//--------------------------------------------------------//
					if( $aTemp['Type']==="Category" ) {
						//-- Add the special device before the Category Changes --//
						$bPerformSpecialAdd = true;
						
					//--------------------------------------------------------//
					//-- ELSEIF Check to see if the next device def starts  --//
					//--    before the current ends properly                --//
					//--------------------------------------------------------//
					} else if( $aTemp['Type']==="Assignment" ) {
						if( $aTemp['Var']==="device" ) {
							if( $bSpecialFlag1===true ) {
								//-- Duplicate Assignment present so save existing --//
								$bPerformSpecialAdd = true;
							}
						} else if( $aTemp['Var']==="ontime" ) {
							if( $bSpecialFlag2===true ) {
								//-- Duplicate Assignment present so save existing --//
								$bPerformSpecialAdd = true;
							}
						} else if( $aTemp['Var']==="offtime" ) {
							if( $bSpecialFlag3===true ) {
								//-- Duplicate Assignment present so save existing --//
								$bPerformSpecialAdd = true;
							}
						}
					}
					
					//--------------------------------------------------------//
					//-- SPECIAL: Device Rules                              --//
					//--------------------------------------------------------//
					if( $bPerformSpecialAdd===true ) {
						//-- Check if all pieces are present or discard them --//
						if( $bSpecialFlag1===true && $bSpecialFlag2===true && $bSpecialFlag3===true ) {
							$aExtractedFileData[$sCurrentCategory][] = array(
								"Type"      => "DeviceTimeRule",
								"Serial"    => $aSpecialAssignTemp['Serial'],
								"Ontime"    => $aSpecialAssignTemp['Ontime'],
								"Offtime"   => $aSpecialAssignTemp['Offtime']
							);
						} //-- Else discard the changes --//
						
						//-- Reset the Variables --//
						$aSpecialAssignTemp    = array();
						$bSpecialFlag1         = false;
						$bSpecialFlag2         = false;
						$bSpecialFlag3         = false;
						$bPerformSpecialAdd    = false;
						$bSpecialPending       = false;
					}
				}
				
				
				//----------------------------//
				//-- Other                  --//
				//----------------------------//
				if( $aTemp['Type']==="Comment" || $aTemp['Type']==="Assignment" ) {
					//-- Check to make sure the Category is defined --//
					if( !isset( $aExtractedFileData[$sCurrentCategory] ) ) {
						//-- Create the Category --//
						$aExtractedFileData[$sCurrentCategory] = array();
					}
					
					//--------------------------------------------------------//
					//-- SPECIAL DEVICES                                    --//
					//--------------------------------------------------------//
					if( $aTemp['Type']==="Assignment" ) {
						//-- If one of the types that are used by the special rules --//
						if( $aTemp['Var']==="device" || $aTemp['Var']==="ontime" || $aTemp['Var']==="offtime" ) {
							
							//-- Set the new Flag --//
							if( $aTemp['Var']==="device" ) {
								$bSpecialFlag1 = true;
								$aSpecialAssignTemp['Serial'] = $aTemp['Value'];
								
							} else if( $aTemp['Var']==="ontime" ) {
								$bSpecialFlag2 = true;
								$aSpecialAssignTemp['Ontime'] = $aTemp['Value'];
								
							} else if( $aTemp['Var']==="offtime" ) {
								$bSpecialFlag3 = true;
								$aSpecialAssignTemp['Offtime'] = $aTemp['Value'];
							}
							
							//-- Flag that the normal add shouldn't be done --//
							$bPerformNormalAdd = false;
							$bSpecialPending   = true;
						}
					}
					//--------------------------------------------------------//
					
					
					if( $bPerformNormalAdd===true ) { 
						//-- Add to the current Category --//
						$aExtractedFileData[$sCurrentCategory][] = $aTemp;
					}
					
					
				//----------------------------//
				//-- Category               --//
				//----------------------------//
				} else if( $aTemp['Type']==="Category" ) {
					//-- Set the Category as the Current Category --//
					$sCurrentCategory = $aTemp['Value'];
					
				}
			}
		}
	} //-- ENDFOREACH Line in the Device Rules config file --//
	
	
	
	//--------------------------------------------------------//
	//-- 6.0 - Add the remaining device to the array        --//
	//--------------------------------------------------------//
	if( $bSpecialPending===true ) {
		//-- Check if all pieces are present or discard them --//
		if( $bSpecialFlag1===true && $bSpecialFlag2===true && $bSpecialFlag3===true ) {
			$aExtractedFileData[$sCurrentCategory][] = array(
				"Type"      => "DeviceTimeRule",
				"Serial"    => $aSpecialAssignTemp['Serial'],
				"Ontime"    => $aSpecialAssignTemp['Ontime'],
				"Offtime"   => $aSpecialAssignTemp['Offtime']
			);
		} //-- Else discard the changes --//
	}
	
	
	//--------------------------------------------------------//
	//-- 9.0 - Return the Results                           --//
	//--------------------------------------------------------//
	return $aExtractedFileData;
}


function ConfigLineCreate( $aLineArray ) {
	//--------------------------------------------------------//
	//-- 1.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	$sResult = "";
	
	
	//--------------------------------------------------------//
	//-- 5.0 - Create the File Line from the Line array     --//
	//--------------------------------------------------------//
	switch( $aLineArray['Type'] ) {
		case "Category":
			$sResult = "[".$aLineArray['Value']."]\n";
			break;
			
		case "Comment":
			$sResult = "".$aLineArray['Value']."\n";
			break;
			
		case "Assignment":
			$sResult = "".$aLineArray['Var']."=".$aLineArray['Value']."\n";
			break;
		
		case "DeviceTimeRule":
			$sResult .= "device=".$aLineArray['Serial']."\n";
			$sResult .= "ontime=".$aLineArray['Ontime']."\n";
			$sResult .= "offtime=".$aLineArray['Offtime']."\n\n";
			break;
	}
	
	//--------------------------------------------------------//
	//-- 9.0 - Return the Results                           --//
	//--------------------------------------------------------//
	return $sResult;
	
}


function ConfigCreateFromArray( $aConfigFileContents ) {
	//--------------------------------------------------------//
	//-- 1.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	$sFileContents         = "";
	
	//--------------------------------------------------------//
	//-- 4.0 - Check if there is a Special Category         --//
	//--------------------------------------------------------//
	if( isset( $aConfigFileContents[CustomConfig1stCategory] ) ) {
		foreach ( $aConfigFileContents[CustomConfig1stCategory] as $aLineArray ) {
			//-- Add the Line --//
			$sFileContents .= ConfigLineCreate( $aLineArray );
		}
	}
	
	//--------------------------------------------------------//
	//-- 5.0 - Add the categorized lines to the string      --//
	//--------------------------------------------------------//
	if( count( $aConfigFileContents) >= 1 ) {
		//-- FOREACH Category --//
		foreach( $aConfigFileContents as $sCategoryName => $aCategoryData ) {
			
			//-- Ignore the Before Category Ini file --//
			if( $sCategoryName!==CustomConfig1stCategory ) {
				//-- Create the Category --//
				$sFileContents .= ConfigLineCreate( 
					array(
						"Type"  => "Category",
						"Value" => $sCategoryName
					)
				);
				
				//-- FOREACH Line in the Category --//
				foreach( $aCategoryData as $iIndex => $aItem ){
					//-- Add the Line --//
					$sFileContents .= ConfigLineCreate( $aItem );
					
				}
			}
		}
	}
	
	//--------------------------------------------------------//
	//-- 6.0 - Add the remaining Text                       --//
	//--------------------------------------------------------//
	return $sFileContents;
	
}



?>