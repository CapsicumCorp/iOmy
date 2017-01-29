<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: Legacy API used for debugging the IOs and when they were last used.
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
//== 1.0 - INITIALISE												==//
//====================================================================//

if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}




//----------------------------------------------------//
//-- 1.2 - INITIALISE VARIABLES						--//
//----------------------------------------------------//
$bError						= false;		//-- BOOLEAN:		Used to indicate if an error has been caught --//
$sErrMesg					= "";			//-- STRING:		Used to store the error message after an error has been caught --//
$sOutput					= "";			//-- STRING:		--//


$aResult					= array();		//-- ARRAY:			Used to store the results. --//
$aSensorList				= array();		//-- ARRAY:			Used to store the 

$sHTML						= "";			//-- STRING:		Used to store the HTML Code to display to the user --//
$iRowNumber					= 0;			//-- INTEGER: 		--//
//----------------------------------------------------//
//-- 1.3 - Import Required Libraries				--//
//----------------------------------------------------//
require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';		//-- This should call all the additional libraries needed --//


//------------------------------------------------------------//
//-- 1.4 - Flag an Error is there is no Database access		--//
//------------------------------------------------------------//
if( $oRestrictedApiCore->bRestrictedDB===false ) {
	$bError    = true;
	$sErrMesg .= "Can't access the database! User may not be logged in";
}

//====================================================================//
//== 2.0 - Retrieve POST											==//
//====================================================================//



//====================================================================//
//== 4.0 - Prepare													==//
//====================================================================//
$sHTML .= "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\"> \n";
$sHTML .= "<html> \n";
$sHTML .= "<head> \n";
$sHTML .= "	<meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\" /> \n";
$sHTML .= "	<meta name=\"author\" content=\"Capsicum Corporation\" /> \n";
$sHTML .= "	<title>Capsicum Corp API Testing Website</title> \n";
$sHTML .= "	<style> \n";
$sHTML .= "		html, body {  \n";
$sHTML .= "			min-height:							100%; \n";
$sHTML .= "		} \n";
$sHTML .= "		/* Setup link cursors */ \n";
$sHTML .= "		a:hover { \n";
$sHTML .= "		cursor: pointer; \n";
$sHTML .= "		} \n";
$sHTML .= "		/* IE default blue border fix */ \n";
$sHTML .= "		a img {border: none; } \n";
$sHTML .= "		body { \n";
$sHTML .= "			font-family:					arial, helvetica, sans-serif; \n";
$sHTML .= "			margin: 0px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.floatclear { \n";
$sHTML .= "			clear:	both; \n";
$sHTML .= "		} \n";
$sHTML .= "		.floatleft { \n";
$sHTML .= "			float: left; \n";
$sHTML .= "		} \n";
$sHTML .= "		.textcenter { \n";
$sHTML .= "			text-align: center; \n";
$sHTML .= "		} \n";
$sHTML .= "		.textright { \n";
$sHTML .= "			text-align: right; \n";
$sHTML .= "		} \n";
$sHTML .= "		.divcenter { \n";
$sHTML .= "			margin:							auto; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_white { \n";
$sHTML .= "			background-color:	#FFFFFF; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_red { \n";
$sHTML .= "			background-color:	#FF0000; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_red_4 { \n";
$sHTML .= "			background-color:	#FFA7A7; \n";
$sHTML .= "		} \n";	
$sHTML .= "		.BG_orange_4 {";
$sHTML .= "			background-color:	#FFDDA7; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_yellow_4 {";
$sHTML .= "			background-color:	#FEFFA7; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_green_4 {";
$sHTML .= "			background-color:	#A7FFA7; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_seagreen_4 {";
$sHTML .= "			background-color:	#A7FFCE; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_cyan_4 {";
$sHTML .= "			background-color:	#A7FFFE; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_skyblue_4 {";
$sHTML .= "			background-color:	#A7E5FF; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_blue_4 {";
$sHTML .= "			background-color:	#A7ABFF; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_indigo_4 {";
$sHTML .= "			background-color:	#D9A7FF; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_grey_4 {";
$sHTML .= "			background-color:	#D3D3D3; \n";
$sHTML .= "		} \n";
$sHTML .= "		.BG_grey_7 {";
$sHTML .= "			background-color:	#B2B2B2; \n";
$sHTML .= "		} \n"; 
$sHTML .= "		.BG_grey_9 {";
$sHTML .= "			background-color:	#9C9C9C; \n";
$sHTML .= "		} \n"; 
$sHTML .= "		.BG_Backdrop { \n";
$sHTML .= "			background-color: #B8FFFF; \n";
$sHTML .= "			background-image: linear-gradient(			top, rgb(7,72,163) 0%,		rgb(184,255,255) 100%); \n";
$sHTML .= "			background-image: -moz-linear-gradient(		top, rgb(7,72,163) 0%,		rgb(184,255,255) 100%); \n";
$sHTML .= "			background-image: -o-linear-gradient(		top, rgb(7,72,163) 0%,		rgb(184,255,255) 100%); \n";
$sHTML .= "			background-image: -webkit-linear-gradient(	top, rgb(7,72,163) 0%,		rgb(184,255,255) 100%); \n";
$sHTML .= "			background-image: -ms-linear-gradient(		top, rgb(7,72,163) 0%,		rgb(184,255,255) 100%); \n";
$sHTML .= "		} \n";
$sHTML .= "		.MinWidth50 { \n";
$sHTML .= "			min-width: 50px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.MinWidth100 { \n";
$sHTML .= "			min-width: 100px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.MinWidth180 { \n";
$sHTML .= "			min-width: 180px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.MinWidth200 { \n";
$sHTML .= "			min-width: 200px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.MinWidth250 { \n";
$sHTML .= "			min-width: 250px; \n";
$sHTML .= "		} \n";
$sHTML .= "		.Width1600 {\n";
$sHTML .= "			width:1600px; \n";
$sHTML .= "		} \n";
$sHTML .= "		table {";
$sHTML .= "			border-collapse:collapse; \n";
$sHTML .= "		} \n";
$sHTML .= "		table, th, td { \n";
$sHTML .= "			border: 1px solid black; \n";
$sHTML .= "		} \n";
$sHTML .= "		.Box {\n";	
$sHTML .= "			border: 1px solid rgb(30, 80, 150); \n";
$sHTML .= "			border-bottom-left-radius: 5px; \n";
$sHTML .= "			border-bottom-right-radius: 5px; \n";
$sHTML .= "			box-shadow: 2px 2px 5px rgba(30, 80, 150, 0.8); \n";
$sHTML .= "		} \n";
$sHTML .= "	</style>\n";
$sHTML .= "</head> \n";
$sHTML .= "<body class=\"BG_Backdrop\"> \n";
$sHTML .= "	<div class=\"BG_white divcenter textcenter Width1600 Box\" >"; 
$sHTML .= "		<h3> Legend - Indicates time offline</h3> \n";
$sHTML .= "		<table> \n";
$sHTML .= "			<tr> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_red_4\">&gt; 8 weeks</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_orange_4\">4-8 weeks</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_yellow_4\">2-4 weeks</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_green_4\">1-2 weeks</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_seagreen_4\">3-7 days</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_cyan_4\">2-3 days</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_skyblue_4\">1-2 days</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_blue_4\">6-24 hours</td> \n";
$sHTML .= "				<td class=\"MinWidth100 BG_indigo_4\">1-6 hours</td> \n";
$sHTML .= "			</tr> \n";
$sHTML .= "		</table> \n";
$sHTML .= "		<h3> Sensor List </h3>\n";
$sHTML .= "		<table> \n";
$sHTML .= "			<tr>\n";
$sHTML .= "				<th class=\"MinWidth100 BG_grey_7\">Username</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_9\">PremiseId</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_7\">UnitId</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_9\">IOId</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_7\">DeviceName</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_9\">SensorId</th> \n";
$sHTML .= "				<th class=\"MinWidth250 BG_grey_7\">Sensor Name</th> \n";
$sHTML .= "				<th class=\"MinWidth50 BG_grey_9\">DataType</th> \n";
$sHTML .= "				<th class=\"MinWidth100 BG_grey_7\">Unix Last Update</th> \n";
$sHTML .= "				<th class=\"MinWidth180 BG_grey_9\">UTC Last Update</th> \n";
$sHTML .= "				<th class=\"MinWidth200 BG_grey_7\">Local</th> \n";
$sHTML .= "			</tr> \n";
			
//====================================================================//
//== 5.0 - Main														==//
//====================================================================//

if($bError===false) {
	try {
		//----------------------------------------//
		//-- 5.1 - 
		//----------------------------------------//
		
		//-- Lookup the current time --//
		$iCurrentDate = time();
		
		//-- Lookup All available Sensors--//
		$aSensorList = DebugSensorDetection();
		
		//-- If no errors occurred during the function --//
		if( $aSensorList["Error"]===false ) {
			//-- Foreach Sensor --//
			foreach( $aSensorList["Data"] as $sSubArrayNum => $aSensor ) {
				if( $aSensor ) {
			 	//if( $sSubArrayNum < 1 ) {
					//echo $aSensor["SensorId"]." <br />\n";
					
					$aTempArray = array();
					
					//-- STEP 1: Extact the Main Data and convert it to the format the UI prefers --//
					$aTempArray["Id"]				= $aSensor["SensorId"];
					$aTempArray["Name"]				= $aSensor["SensorName"];
					$aTempArray["IOPortId"]			= $aSensor["IOPortId"];
					$aTempArray["IOId"]				= $aSensor["IOId"];
					$aTempArray["IODisplayName"]	= $aSensor["IODisplayName"];
					$aTempArray["UnitId"]			= $aSensor["UnitId"];
					$aTempArray["PremiseId"]		= $aSensor["PremiseId"];
					$aTempArray["Username"]			= $aSensor["Username"];
					$aTempArray["DataType"]			= $aSensor["DataType"];
					$aTempArray["DataTypeName"]		= $aSensor["DataTypeName"];
					
					//-- STEP 2: Retrieve and Store the last timestamp --//
					$aSensorDataTemp = getSensorDebuggingInfo( $aSensor["SensorId"], $aSensor["DataType"] );
					
					if( $aSensorDataTemp["Error"]===false ) {
						//-- SUCCESS --//
						$aTempArray["Error"]		= false;
						$aTempArray["UnixTS"]		= $aSensorDataTemp["Data"]["UnixTS"];
						$aTempArray["TS"]			= $aSensorDataTemp["Data"]["TS"];
						
					} else {
						//-- ERROR --//
						$aTempArray["Error"]		= true;
						$aTempArray["ErrMesg"]		= $aSensorDataTemp["ErrMesg"];
					}
					//-- STEP 3: Store the Sensor Information in the DataArray --//
					$aDataArray[]					= $aTempArray;
					
				}
			}
			

			try {
				//for($i=0; $i<$aDataArray.length; $i++) {
				foreach ( $aDataArray as $aSensorDisplay ) {
					try { 
						
						if( $aSensorDisplay["Error"]===true ) {
							if( $aSensorDisplay["ErrMesg"]==="DebugSensor: No Rows Found! Code:1" ) {
								$sHTML .= "			<tr> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["Username"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["PremiseId"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["UnitId"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["IOId"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["IODisplayName"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["Id"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["Name"]."</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\">".$aSensorDisplay["DataTypeName"]."</td> \n";
								//$sHTML .= "				<td class=\"BG_grey_4\" colspan=\"3\">Sensor has never submitted data!</td> \n";
								$sHTML .= "				<td class=\"BG_grey_4\" colspan=\"3\">".$aSensorDisplay["ErrMesg"]."</td> \n";
								$sHTML .= "			</tr> \n";
							} else {
								$sHTML .= "<tr> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["Username"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["PremiseId"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["UnitId"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["IOId"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["IODisplayName"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["Id"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["Name"]."</td> \n";
								$sHTML .= "	<td class=\"BG_red\">".$aSensorDisplay["DataTypeName"]."</td>\n";
								$sHTML .= "	<td class=\"BG_red\">Error</td> \n";
								$sHTML .= "	<td class=\"BG_red\" colspan=\"2\">".$aSensorDisplay["ErrMesg"]."</td> \n";
							}
		
						} else {
						
							$iTempInt = $aSensorDisplay["UnixTS"];
		
							if( $iTempInt < ( $iCurrentDate-4838400) ) {
								//-- Over 8 week --//
								$sTableCellClass = "BG_red_4";
							} else if( $iTempInt < ( $iCurrentDate-2419200 ) ) {
								//-- Over 4 week --//
								$sTableCellClass = "BG_orange_4";
							} else if( $iTempInt < ( $iCurrentDate-1209600 ) ) {
								//-- Over 2 week --//
								$sTableCellClass = "BG_yellow_4";
							} else if( $iTempInt < ( $iCurrentDate-604800 ) ) {
								//-- Over 1 week --//
								$sTableCellClass = "BG_green_4";
							} else if( $iTempInt < ( $iCurrentDate-259200 ) ) {
								//-- Over 3 days --//
								$sTableCellClass = "BG_seagreen_4";
							} else if( $iTempInt < ( $iCurrentDate-172800 ) ) {
								//-- Over 2 days --//
								$sTableCellClass = "BG_cyan_4";
							} else if( $iTempInt < ( $iCurrentDate-86400 ) ) {
								//-- Over 1 day --//
								$sTableCellClass = "BG_skyblue_4";
							} else if( $iTempInt < ( $iCurrentDate-15600 ) ) {
								//-- Over 6 hours --//
								$sTableCellClass = "BG_blue_4";
							} else if( $iTempInt < ( $iCurrentDate-3600 ) ) {
								//-- Over 1 hour --//
								$sTableCellClass = "BG_indigo_4";
							} else {
								$sTableCellClass = "";
							}
		
							$sHTML .= "<tr>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["Username"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["PremiseId"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["UnitId"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["IOId"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["IODisplayName"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["Id"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["Name"]."</td>\n";
							$sHTML .= "	<td class=\"".$sTableCellClass."\">".$aSensorDisplay["DataTypeName"]."</td>\n";
							$sHTML .= "	<td id=\"UTS_".$iRowNumber."\" class=\"".$sTableCellClass."\">".$aSensorDisplay["UnixTS"]."</td>\n";
							$sHTML .= "	<td id=\"UTC_".$iRowNumber."\" class=\"".$sTableCellClass."\">".$aSensorDisplay["TS"]."</td>\n";
							$sHTML .= "	<td id=\"Local_".$iRowNumber."\" class=\"".$sTableCellClass."\"></td>\n";
							$sHTML .= "</tr>\n";
							$iRowNumber++;
						}
		
					} catch( Exception $e335 ) {
						$bError = true;
						$sErrMesg = "E335Debug: ".$e335->getMessage()."   ".json_encode($aDataArray);
					} 
				}
				
			} catch( Exception $e334 ) {
				$bError = true;
				$sErrMesg = "E334Debug: ".$e334->getMessage();
			}
			

		//-- Else if errors occur --//
		} else {
			
			//-- Check if it is the "No Rows Error" --//
			if( $aSensorList["ErrMesg"]==="DSD: No Rows Found! Code:0" ) {

				$sHTML .= "<tr>\n";
				$sHTML .= "	<td class=\"BG_red_4\" colspan=\"11\">The logged in user doesn't have any sensors available</td>";
				$sHTML .= "</tr>\n";
				$iRowNumber++;				
				
			//-- ELSE The error is not expected so display the error message --//
			} else {
				//----------------------------//
				//-- ERROR HAS OCCURRED		--//
				//----------------------------//
				$bError = true;
				$sErrMesg .= "E21Debug: ".$aSensorList["ErrMesg"];
			}
			

		}

		
	} catch( Exception $e20) {
		$bError = true;
		$sErrMesg .= "E20Debug: ".$e20->getMessage();
	}
}



if( $bError===false ) {
	
	$sHTML .= "		</table> \n";
	$sHTML .= "		<h3> Legend - Indicates time offline</h3> \n";
	$sHTML .= "		<table> \n";
	$sHTML .= "			<tr> \n";	
	$sHTML .= "				<td class=\"MinWidth100 BG_red_4\">&gt; 8 weeks</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_orange_4\">4-8 weeks</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_yellow_4\">2-4 weeks</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_green_4\">1-2 weeks</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_seagreen_4\">3-7 days</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_cyan_4\">2-3 days</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_skyblue_4\">1-2 days</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_blue_4\">6-24 hours</td> \n";
	$sHTML .= "				<td class=\"MinWidth100 BG_indigo_4\">1-6 hours</td> \n";
	$sHTML .= "			</tr> \n";
	$sHTML .= "		</table> \n";
	$sHTML .= "		<div>".$_SERVER["REMOTE_ADDR"]."</div>\n";
	$sHTML .= "	</div> \n";


	$sHTML .= '	<script language="javascript" type="text/javascript">'."\n";
	$sHTML .= '		window.onload = function() {'."\n";
	$sHTML .= '			var iMaxRows='.$iRowNumber.'; '."\n";
	$sHTML .= '			var oOldRow; '."\n";
	$sHTML .= '			var oNewRow; '."\n";
	$sHTML .= '			var sTableValue = ""; '."\n";
	$sHTML .= '			var iTableValue = 0; '."\n";
	$sHTML .= '			var dDate = new Date(); '."\n";
	$sHTML .= '			'."\n";
	
	$sHTML .= '			for( var i=0; i<iMaxRows; i++ ) {'."\n";
	$sHTML .= '				oOldRow = document.getElementById("UTS_"+i)'."\n";
	$sHTML .= '				if(oOldRow!==null && oOldRow!== false) {'."\n";
	$sHTML .= '					//alert(oOldRow.innerHTML);'."\n";
	$sHTML .= '					sTableValue = oOldRow.innerHTML;'."\n";
	$sHTML .= '					iTableValue = parseInt( sTableValue, 10 );'."\n";
	$sHTML .= '					if(iTableValue!==null && iTableValue!== false) {'."\n";
	$sHTML .= '						//alert(oOldRow.innerHTML);'."\n";	
	$sHTML .= '						dDate.setTime(iTableValue*1000)'."\n";
	$sHTML .= '						oNewRow = document.getElementById("Local_"+i)'."\n";
	$sHTML .= '						oNewRow.innerHTML = dDate.toLocaleString();'."\n";
	$sHTML .= '					}'."\n";
	$sHTML .= '				}'."\n";
	$sHTML .= '			}'."\n";
	$sHTML .= '		}'."\n";
	$sHTML .= '	</script>'."\n";
	//$sHTML .= " <div>".json_encode( $oRestrictedApiCore->oRestrictedDB->QueryLogs[1] )."</div>\n";
	$sHTML .= "</body>\n";
	$sHTML .= "</html>\n";
	
	
	
}



//====================================================================//
//== 8.0 - Log the Results											==//
//====================================================================//

//====================================================================//
//== 9.0 - Finalise													==//
//====================================================================//

//-- API didn't incur an Error --//
if( $bError===false ) {
	try {
		
		//-- Force the page to HTML --//
		header('Content-Type: text/html');
		
		//-- Output results --//
		echo $sHTML;

	} catch( Exception $e9999 ) {
		header('Content-Type: text/plain');
		//-- The aResult array cannot be turned into a string due to corruption of the array --//
		echo "Error Code:0x9999! \n ".$e9999->getMessage()."\" ";
	}

//-- API Error has occurred --//
} else {
	//-- Set the Page to Plain Text on Error. Note this can be changed to "text/html" or "application/json" --//
	header('Content-Type: text/plain');
	if( $bError===false ) {
		//-- The aResult array has become undefined due to corruption of the array --//
		$sOutput = "Error Code:0x9998!\n No Result";

	} else if( $sErrMesg===null || $sErrMesg===false || $sErrMesg==="" ) {
		//-- The Error Message has been corrupted --//
		$sOutput  = "Error Code:0x9997!\n Critical Error has occured!\n Undefinable Error Message\n";

	} else if( $sErrMesg!==false ) {
		//-- Output the Error Message --//
		$sOutput  = $sErrMesg;
		
	} else {
		//-- Error Message is blank --//
		$sOutput  = "Error Code:0x9996!\n Critical Error has occured!";
	}

	try {
		//-- Text Error Message --//
		echo $sOutput;	
		
	} catch( Exception $e9995 ) {
		//-- Failsafe Error Message --//
		echo "Error Code:0x9995!\n Critical Error has occured!";
	}
}




?>