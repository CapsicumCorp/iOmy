<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP class is used for displaying weather data that is presetup in the database.
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


class Weather_DemoWeather {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sObjectState         = '';           //-- STRING:        Used to indicate what State that the Object is in (eg. Dealing with a non-database weather source or dealing with a weather source from the database )--//
	protected $sUsername            = '';           //-- STRING:        The usertoken used to access the Weather Source --//
	protected $sPassword            = '';           //-- STRING:        The password ( Empty string for OpenWeatherMap ) --//
	protected $sWeatherCode         = '';           //-- STRING:        Weatherstation code that is used to poll the data. --//
	protected $iLinkId              = 0;            //-- INTEGER:       Holds the LinkId of the desired Weather device --//
	protected $iThingId             = 0;            //-- INTEGER:       Holds the ThingId (as there should only be ever be 1)  --//
	
	public $bInitialised            = false;        //-- BOOLEAN:       Used to indicate if this object was successful at setting itself up or if errors occurred --//
	public $aErrorMessges           = array();      //-- ARRAY:         Used to hold all the error messages that have occured with this object as they are all useful for debugging purposes --//
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT / DESTRUCT FUNCTIONS                                                                             ==//
	//========================================================================================================================//
	
	
	
	
	//================================================================================================//
	//== #2.1# - Construct                                                                          ==//
	//================================================================================================//
	public function __construct( $aWeatherStationData ) {
		try {
			//----------------------------------------------------//
			//-- 1.0 - INITIALISE MANDATORY VARIABLES           --//
			//----------------------------------------------------//
			$this->sObjectState         = $aWeatherStationData['ObjectState'];
			$this->sUsername            = $aWeatherStationData['UserToken'];
			
			
			//----------------------------------------------------//
			//-- 2.0 - INITIALISE OPTIONAL VARIABLES            --//
			//----------------------------------------------------//
			if( isset( $aWeatherStationData['WeatherCode'] ) ) {
				$this->sWeatherCode   = $aWeatherStationData['WeatherCode'];
			}
			
			if( isset($aWeatherStationData['LinkId']) ) {
				$this->iLinkId        = $aWeatherStationData['LinkId'];
			}
			
			if( isset($aWeatherStationData['ThingId']) ) {
				$this->iThingId       = $aWeatherStationData['ThingId'];
			}
			
			//----------------------------------------------------//
			//-- 3.0 - Check that the Object State is valid     --//
			//----------------------------------------------------//
			switch( $this->sObjectState ) {
				case "non-DB":
					$this->bInitialised = true;
					break;
					
				case "DB":
					if( $this->iLinkId>=1 && $this->iThingId>=1 ) {
						if( $this->InitialiseWeatherCode() ) {
							$this->bInitialised = true;
						} else {
							$this->aErrorMessges[] = "Failed to get the Weather Information that is needed to connect!";
						}
					} else {
						//-- ERROR --//
						$this->aErrorMessges[] = "Problem with either the LinkId or the ThingId!";
					}
					break;
					
				default:
					$this->aErrorMessges[] = "Unregonized Weather Object State!";
					
			}
			
		} catch( Exception $e0001 ) {
			$this->bInitialised = false;
			$this->aErrorMessges[] = "Problem Initialising Weather Class! \n".$e0001->getMessage();
		}
	}
	
	//================================================================================================//
	//== #2.1# - Destruct                                                                           ==//
	//================================================================================================//
	public function __destruct() {
		//-- nothing to do --//
	}
	
	
	
	//========================================================================================================================//
	//== #3.0# - OTHER FUNCTIONS                                                                                            ==//
	//========================================================================================================================//
	public function InitialiseWeatherCode() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aIOsTemp           = GetIOsFromThingId( $this->iThingId );
		
		//-- Get the current time --//
		$iUTS = time();
		
		//----------------------------------------------------------------//
		//-- 2.0 - Search for the WeatherCode IO and fetch its data     --//
		//----------------------------------------------------------------//
		if( $aIOsTemp['Error']===false ) {
			foreach( $aIOsTemp['Data'] as $aIO ) {
				if( isset( $aIO['RSTypeId'] ) ) {
					//-- Check the RSType --//
					if( $aIO['RSTypeId']===1600 ) {
						$aStationIOInfo = GetIOInfo( $aIO['IOId'] );
							
						if( $aStationIOInfo['Error']===true ) {
							$this->aErrorMessges[] = "Can not retrieve the 'StationCode' IO Info.\n".$aStationIOInfo['ErrMesg'];
							return false;
							
						} else {
							//-- Lookup the most recent StationCode from the database --//
							$aStationCodeResult = GetIODataMostRecent( $aStationIOInfo['Data']['DataTypeId'], $aIO['IOId'], $iUTS );
								
							if( $aStationCodeResult['Error']===false ) {
								$this->sWeatherCode = $aStationCodeResult['Data']['Value'];
								return true;
							}
						}
					}
				}
			}	//-- ENDFOREACH --//
		}
		//-- Failure to find the correct IO --//
		return false;
	}
	
	
	//================================================================================================//
	//== #3.1# - ADD THE CURRENT BRIDGE TO DATABASE                                                 ==//
	//================================================================================================//
	public function AddThisToTheDatabase( $iCommId, $iRoomId, $sLinkName ) {
		//-- Error Occurred --//
		return array( "Error"=>true, "ErrMesg"=>"This feature is not supported while the iOmy server is in demonstration mode" );
	}
	
	
	public function GetMostRecentDBWeather() {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aResult            = array();
		$iUTS               = time();
		
		
		$iMostRecentValue   = 0;                    //-- INTEGER:   Used to hold the most recent value's timestamp --//
		$bDataFound         = false;                //-- BOOLEAN:   Used to indicate --//
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DB" ) {
			$bError    = true;
			$sErrMesg  = "Weather Object is not setup to be able to perform this request!";
		}
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			$aIOsTemp           = GetIOsFromThingId( $this->iThingId );
			
			if( $aIOsTemp['Error']===false ) {
				foreach( $aIOsTemp['Data'] as $aIO ) {
					
					if( 
						$aIO['RSTypeId']===1601     || $aIO['RSTypeId']===1602     || 
						$aIO['RSTypeId']===1603     || $aIO['RSTypeId']===1604     || 
						$aIO['RSTypeId']===1605     || $aIO['RSTypeId']===1606     ||
						$aIO['RSTypeId']===1607     || $aIO['RSTypeId']===1608
					) {
						
						//-- Get the most recent value from that IO --//
						$aTempResult = GetIODataMostRecent( $aIO['DataTypeId'], $aIO['IOId'], $iUTS );
						
						//-- IF No errors have occurred in the function results --//
						if( $aTempResult['Error']===false ) {
							//--  --//
							if( isset($aTempResult['Data']['UomId']) ) {
								switch( $aIO['RSTypeId'] ) {
									//----------------------------//
									//-- TEMPERATURE            --//
									//----------------------------//
									case 1601:
										$bDataFound = true;
										
										$aResult['Temperature'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
									
									//----------------------------//
									//-- HUMIDITY               --//
									//----------------------------//
									case 1602:
										$bDataFound = true;
										
										$aResult['Humidity']= array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
									
									//----------------------------//
									//-- PRESSURE               --//
									//----------------------------//
									case 1603:
										$bDataFound = true;
										
										$aResult['Pressure'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
									
									//----------------------------//
									//-- CONDITION              --//
									//----------------------------//
									case 1604:
										$bDataFound = true;
										
										$aResult['Condition'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
									
									//----------------------------//
									//-- WIND DIRECTION         --//
									//----------------------------//
									case 1605:
										$bDataFound = true;
										
										$aResult['WindDirection'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
									
									//----------------------------//
									//-- WIND SPEED             --//
									//----------------------------//
									case 1606:
										$bDataFound = true;
										
										$aResult['WindSpeed'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
										
										
									//----------------------------//
									//-- SUNRISE                --//
									//----------------------------//
									case 1607:
										$bDataFound = true;
										
										$aResult['Sunrise'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										
										break;
									//----------------------------//
									//-- SUNSET                 --//
									//----------------------------//
									case 1608:
										$bDataFound = true;
										
										$aResult['Sunset'] = array(
											"Value"     => $aTempResult['Data']['Value'],
											"UomId"     => $aTempResult['Data']['UomId'],
											"UomName"   => $aTempResult['Data']['UomName']
										);
										if( $aTempResult['Data']['UTS'] > $iMostRecentValue ) {
											$iMostRecentValue = $aTempResult['Data']['UTS'];
										}
										break;
										
								}	//-- ENDSWITCH --//
							}	//-- ENDIF Valid UoMId is passed (No UoM in the results is just a response when there is no data)--//
						}	//-- ENDIF --//
					}	//-- ENDIF Valid Weather RSTYPE --//
					
					//-- Add the most recent timestamp to the results --//
					$aResult['UTS'] = $iMostRecentValue;
				}
			}	//-- ENDFOREACH IO --//
			
			
			if( $bDataFound===false ) {
				$bError    = true;
				$sErrMesg .= "No Data could be found for these IOs";
			}
		}	//-- ENDIF No Errors --//
		
		//------------------------------------------------------------------------------//
		//-- 9.0 - PARSE THE JSON REPONSE                                             --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			return array( "Error"=>false, "Data"=>$aResult );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
		
	}
	
	
	public function UpdateTheWeatherStationCode( $iThingId, $sWeatherStationCode ) {
		//------------------------//
		//-- 9.B - FAILURE      --//
		//------------------------//
		return array( "Error"=>true, "ErrMesg"=>"This feature is not supported while the iOmy server is in demonstration mode" );
	}
	
	
	
	//================================================================================================//
	//== #4.3# - POLL WEATHER FROM SOURCE                                                           ==//
	//================================================================================================//
	public function PollWeather() {
		//------------------------//
		//-- 9.A - SUCCESS      --//
		//------------------------//
		return array( "Error"=>false, "Data"=>array( "Success"=>true ) );
	} //-- ENDFUNCTION POLLWEATHER --//
	

}

?>