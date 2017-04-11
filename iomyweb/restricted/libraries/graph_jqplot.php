<?php
//========================================================================================================//
//== @Authors: Andrew Somerville <support@capsicumcorp.com>
//== @Description: jqPlot 
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




function getDiffStampForGraph( $iStartUTS, $iEndUTS, $iSampleRate, $iPoints ) {
	//-- @Description: Basic function used to calculate the recommended Difference --//
	
	//--------------------------------------------------------//
	//-- 1.0 - Declare Variables                            --//
	//--------------------------------------------------------//
	$iDifference         = 0;       //-- INTEGER:   Store the Total time difference in secs --//
	$iMinSecs            = 0;       //-- INTEGER:   The minimum allowed difference in secs (The sample rate is the minimum) --//
	$iDesiredSecs        = 0;       //-- INTEGER:   A number that is calculated from desired points --//
	$iAppprovedSecs      = 0;       //-- INTEGER:   The number that is returned by this function --//
	$iTempSecs           = 0;       //-- INTEGER:   A variable to hold a temporary variable --//
	
	
	
	//--------------------------------------------------------//
	//-- 2.0 - Preparation                                  --//
	//--------------------------------------------------------//
	
	//-- Total Difference between Start and End --//
	$iDifference = $iEndUTS - $iStartUTS;
	
	//-- Get the Minimum Allowable Difference in seconds --//
	$iMinSecs = $iSampleRate;
	
	//-- Calculate the desired DiffStamp --//
	$iDesiredSecs = $iDifference / $iPoints;
	
	//--------------------------------------------------------//
	//-- 3.0 - Calculate the recommended point difference   --//
	//--------------------------------------------------------//
	
	//-- Check to see if the Desired time is below minimum allowed --//
	if( $iDesiredSecs < $iMinSecs ) {
		//-- See if the Minimum is within a 100% threshold --//
		$iTempSecs = $iDesiredSecs * 2;
		if( $iTempSecs > $iMinSecs ) {
			//-- less than 100% threshold use Minimum --//
			$iAppprovedSecs = $iMinSecs;
		} else {
			//-- Decide next closest fallback number --//
			$iAppprovedSecs = $iMinSecs;
		}
		
	//-- Else Desired time has been apprroved --//    
	} else {
		$iAppprovedSecs = $iDesiredSecs;
	}
	
	//--------------------------------------------------------//
	//-- 9.0 - Return Results                               --//
	//--------------------------------------------------------//
	return $iAppprovedSecs;
}



?>