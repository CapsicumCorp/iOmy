<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP class is used for connecting to "Open Weather Map" weather stations.
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


class Weather_OpenWeatherMap {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sObjectState         = '';           //-- STRING:        --//
	protected $sUsername            = '';           //-- STRING:        --//
	protected $sPassword            = '';           //-- STRING:        --//
	protected $sWeatherCode         = '';           //-- STRING:        Weatherstation code that is used to poll the data. --//
	protected $iLinkId              = 0;            //-- INTEGER:       --//
	protected $iThingId             = 0;            //-- INTEGER:       --//
	public $bInitialised            = false;        //-- BOOLEAN:       --//
	public $aErrorMessges           = array();      //-- ARRAY:         --//
	
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
						} 
					} else {
						//-- ERROR --//
						$this->aErrorMessges[] = "Unregonized Object State!";
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
		//-- 2.0 -                      --//
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
						}
						
						//-- Lookup the most recent StationCode from the database --//
						$aStationCodeResult = GetIODataMostRecent( $aStationIOInfo['Data']['DataTypeId'], $aIO['IOId'], $iUTS );
							
						if( $aStationCodeResult['Error']===false ) {
							$this->sWeatherCode = $aStationCodeResult['Data']['Value'];
							return true;
						}
					}
				}
			}	//-- ENDFOREACH --//
		}
		
		return false;
	}
	
	
	//================================================================================================//
	//== #3.1# - ADD THE CURRENT BRIDGE TO DATABASE                                                 ==//
	//================================================================================================//
	public function AddThisToTheDatabase( $iCommId, $iRoomId, $sLinkName ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aLinkData          = array();
		$aLinkResult        = array();
		$aResult            = array();
		$iLinkType          = 8;
		
		//----------------------------------------------------------------//
		//-- 4.0 - Check the type of this Object                        --//
		//----------------------------------------------------------------//
		if( $this->sObjectState!=="non-DB" ) {
			$bError = true;
			$bErrMesg = "This Object is not setup to be able to add itself to the database";
		}
		
		
		//----------------------------------------------------------------//
		//-- 6.0 - Create the Philips Hue Bridge Data                   --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$aLinkData = array(
				"CommId"                => $iCommId,
				"Type"                  => $iLinkType,
				"SerialCode"            => "",
				"Displayname"           => $sLinkName,
				"State"                 => "1",
				"InfoName"              => "OpenWeatherMap Connector",
				"InfoManufacturer"      => "OpenWeatherMap",
				"InfoManufacturerUrl"   => "http://openweathermap.org",
				"ConnFrequencyId"       => "1",
				"ConnProtocolId"        => "1",
				"ConnCryptTypeId"       => "1",
				"ConnAddress"           => "",
				"ConnPort"              => "",
				"ConnName"              => "OpenWeatherMap Feed",
				"ConnUsername"          => $this->sUsername,
				"ConnPassword"          => $this->sPassword,
				"RoomId"                => $iRoomId,
				"Things"                => array(
					array(
						"Type"          => "14",
						"Name"          => "Outside Weather Feed",
						"State"         => 1,
						"HWId"          => 0,
						"OutputHWId"    => 0,
						"IOs"           => array(
							array(
								"RSType"            => "1600",
								"UoM"               => "1",
								"Type"              => "6",
								"Name"              => "Weather Station Id",
								"BaseConvert"       => "1",
								"SampleRate"        => "300",
								"SampleRateMax"     => "300",
								"SampleRateLimit"   => "1200"
							),
							array(
								"RSType"            => "1601",
								"UoM"               => "16",
								"Type"              => "4",
								"Name"              => "Temperature",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							),
							array(
								"RSType"            => "1602",
								"UoM"               => "2",
								"Type"              => "4",
								"Name"              => "Humidity",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							),
							array(
								"RSType"            => "1603",
								"UoM"               => "20",
								"Type"              => "2",
								"Name"              => "Pressure",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							),
							array(
								"RSType"            => "1604",
								"UoM"               => "1",
								"Type"              => "7",
								"Name"              => "Conditions",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							),
							array(
								"RSType"            => "1605",
								"UoM"               => "1",
								"Type"              => "4",
								"Name"              => "Directions",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							),
							array(
								"RSType"            => "1606",
								"UoM"               => "26",
								"Type"              => "4",
								"Name"              => "Speed",
								"BaseConvert"       => "1",
								"SampleRate"        => "7200",
								"SampleRateMax"     => "7200",
								"SampleRateLimit"   => "14400"
							)
						)
					)
				)
			);
		} //-- ENIF No errors have occurred --//
		
		//----------------------------------------------------------------//
		//-- 7.0 - ADD THE BRIDGE TO THE DATABASE                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$aLinkResult = PrepareAddNewLink( $aLinkData );
			
			if( $aLinkResult['Error']===true ) {
				//--------------------------------------------//
				//-- Flag that an error occurred            --//
				//--------------------------------------------//
				$bError = true;
				$sErrMesg .= "Problem adding the OpenWeatherFeed!\n";
				$sErrMesg .= $aLinkResult['ErrMesg'];
			}
		}
		
		//----------------------------------------------------------------//
		//-- 8.0 - EXTRACT THE LINKID AND THING ID                      --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			
			if( isset($aLinkResult['Data']['LinkId']) ) {
				//-- Store the LinkId in this Object --//
				$this->iLinkId = $aLinkResult['Data']['LinkId'];
				
				if( isset( $aLinkResult['Data']['Things'][0] ) ) {
					//-- Store the ThingId in this Object --//
					$this->iThingId = $aLinkResult['Data']['Things'][0]['ThingId'];
					
					//-- Set that this Weatherstation is in the database --//
					$this->sObjectState = "DB";
					
				} else {
					$bError    = true;
					$sErrMesg .= "Problem extracting the ThingId after inserting into the database!\n";
					
					var_dump($aLinkResult['Data']);
				}
			} else {
				$bError    = true;
				$sErrMesg .= "Problem extracting the LinkId after inserting into the database!\n";
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aLinkResult['Data'] );
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
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
		
		$iMostRecentValue   = 0;
		
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
						$aIO['RSTypeId']===1605     || $aIO['RSTypeId']===1606
					) {
						
						//-- Get the most recent value from that IO --//
						$aTempResult = GetIODataMostRecent( $aIO['DataTypeId'], $aIO['IOId'], $iUTS );
						
						//-- IF No errors have occurred in the function results --//
						if( $aTempResult['Error']===false ) {
							//-- 
							if( isset($aTempResult['Data']['UomId']) ) {
								switch( $aIO['RSTypeId'] ) {
									//----------------------------//
									//-- TEMPERATURE            --//
									//----------------------------//
									case 1601:
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
										$aResult['WindSpeed'] = array(
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
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aIOsTemp           = array();
		$bFound             = false;
		
		$iUTS               = time();
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DB" ) {
			$bError    = true;
			$sErrMesg .= "This Object is not setup in database therefore cannot update the database!";
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			$aIOsTemp           = GetIOsFromThingId( $iThingId );
			
			
			if( $aIOsTemp['Error']===false ) {
				foreach( $aIOsTemp['Data'] as $aIO ) {
					
					//----------------------------------------------------------------//
					//-- Insert the appropriate value                               --//
					//----------------------------------------------------------------//
					if( $bError===false ) {
						if( isset( $aIO['RSTypeId'] ) ) {
							//----------------------------//
							//-- Check the RSType       --//
							//----------------------------//
							switch( $aIO['RSTypeId'] ) {
								//-- Stream Profile --//
								case 1600:
									$aInsertResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sWeatherStationCode, true );
									
									if( $aInsertResult['Error']===true ) {
										$bError = true;
										$sErrMesg .= "Error inserting data in the new IOs!\n";
										$sErrMesg .= $aInsertResult['ErrMesg'];
										$sErrMesg .= "\n";
									} else {
										//-- Mark that the IO is found --//
										$bFound = true;
										
										//-- Update the Weather Code in this object --//
										$this->sWeatherCode = $sWeatherStationCode;
										
										//-- Add the results to the function return --//
										$aResult = array( "LastId" => $aInsertResult['LastId'] );
										
									}
									break;
								
							}	//-- ENDSWITCH  --//
							
						}	//-- ENDIF RSTypeId is present --//
					}	//-- ENDIF No errors have occurred --//
					
				}	//-- ENDFOREACH IO --//
				
				
				if( $bFound===false ) {
					$bError = true;
					$sErrMesg .= "The WeatherStationCode IO was not found!";
				}
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
	
	
	
	//================================================================================================//
	//== #4.3# - POLL WEATHER FROM SOURCE                                                           ==//
	//================================================================================================//
	public function PollWeather() {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		$bError                     = false;
		$sErrMesg                   = "";
		$aResult                    = array();
		$aIO                        = array();
		$aStationCodeResult         = array();
		$aStationIOInfo             = array();
		$sJsonData                  = "";
		$aJsonData                  = array();
		$aHTTPResponse              = array();
		$aWeatherIOsToBeParsed      = array();
		$sTemp1                     = "";
		$sTemp2                     = "";
		$iUTS                       = time();

		$iWeatherStationIOId        = 0;
		$iTemperatureIOId           = 0;            //-- INTEGER:       --//
		$iHumidityIOId              = 0;            //-- INTEGER:       --//
		$iPressureIOId              = 0;            //-- INTEGER:       --//
		$iConditionsIOId            = 0;            //-- INTEGER:       --//
		$iWindDirectionIOId         = 0;            //-- INTEGER:       --//
		$iWindSpeedIOId             = 0;            //-- INTEGER:       --//


		$iWeatherStationRSTypeId    = LookupFunctionConstant("WeatherStationRSTypeId");
		$iTemperatureRSTypeId       = LookupFunctionConstant("TemperatureRSTypeId");
		$iHumidityRSTypeId          = LookupFunctionConstant("HumidityRSTypeId");
		$iPressureRSTypeId          = LookupFunctionConstant("PressureRSTypeId");
		$iConditionsRSTypeId        = LookupFunctionConstant("ConditionsRSTypeId");
		$iWindDirectionRSTypeId     = LookupFunctionConstant("WindDirectionRSTypeId");
		$iWindSpeedRSTypeId         = LookupFunctionConstant("WindSpeedRSTypeId");

		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DB" ) {
			$bError    = true;
			$sErrMesg  = "Weather Object is not setup to be able to perform this request!";
		}
		
		
		if( $bError===false ) {
			$aWeatherIOs = GetIOsFromThingId( $this->iThingId );
			//-- Parse the results --//
			if( $aWeatherIOs['Error']===false ) {
					
				//-----------------------------------------------------------------------------------------//
				//-- Verify that the desired IO Ids are found and stored to their appropiate variables   --//
				//-----------------------------------------------------------------------------------------//
				foreach( $aWeatherIOs['Data'] as $aIO ) {
					//------------------------------------//
					//-- WU Station                     --//
					//------------------------------------//
					if( $aIO['RSTypeId']===$iWeatherStationRSTypeId ) {
						$iWeatherStationIOId = $aIO['IOId'];
						
					//------------------------------------//
					//-- Temperature                    --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iTemperatureRSTypeId ) {
						$iTemperatureIOId   = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "Temperature",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "main", "temp" )
						);
						//ExtractValueFromMultiArray
					//------------------------------------//
					//-- Humidity                       --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iHumidityRSTypeId ) {
						$iHumidityIOId      = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "Humidity",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "main", "humidity" )
						);
						
					//------------------------------------//
					//-- Pressure                       --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iPressureRSTypeId ) {
						$iPressureIOId      = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "Pressure",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "main", "pressure" )
						);
						
					//------------------------------------//
					//-- Conditions                     --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iConditionsRSTypeId ) {
						$iConditionsIOId    = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "Conditions",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "weather", 0, "main" )
						);
						
					//------------------------------------//
					//-- Wind Direction                 --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iWindDirectionRSTypeId ) {
						$iWindDirectionIOId = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "WindDir",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "wind", "deg" )
						);
						
					//------------------------------------//
					//-- Wind Speed                     --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iWindSpeedRSTypeId ) {
						$iWindSpeedIOId     = $aIO['IOId'];
						
						$aWeatherIOsToBeParsed[] = array(
							"Type"    => "WindSpeed",
							"IOId"    => $aIO['IOId'],
							"UoMId"   => $aIO['UoMId'],
							"UoMName" => $aIO['UoMName'],
							"Src"     => array( "wind", "speed" )
						);
						
					}
				} //-- END Foreach --//
				
				//----------------------------------------------------//
				//-- IF a IOId couldn't be retrieved                --//
				//----------------------------------------------------//
				if( !($iWeatherStationIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError = true;
					$sErrMesg .= "Can not find the 'Weatherstation' IO.\n";
					
				//----------------------------------------------------//
				//-- ELSE Assume that there isn't any errors        --//
				//----------------------------------------------------//
				} else {
					//-- Lookup the Station Code --//
					$aStationIOInfo = GetIOInfo( $iWeatherStationIOId );
					
					if( $aStationIOInfo['Error']===true ) {
						$bError    = true;
						$sErrMesg .= "Can not retrieve the 'StationCode' IO Info.\n";
						$sErrMesg .= $aStationIOInfo['ErrMesg'];
						//$sErrMesg .= "\n".$iWeatherStationIOId;
					}
					
					//-- Lookup the most recent StationCode from the database --//
					if( $bError===false ) {
						$aStationCodeResult = GetIODataMostRecent( $aStationIOInfo['Data']['DataTypeId'], $iWeatherStationIOId, $iUTS );
						
						if( $aStationCodeResult['Error']===false ) {
							if( isset( $aStationCodeResult['Data']['Value'] ) ) {
								$this->sWeatherCode = $aStationCodeResult['Data']['Value'];
								
								
							} else {
								$bError = true;
								$sErrMesg .= "The 'StationCode' IO may be incorrectly setup.\n";
								$sErrMesg .= $aStationCodeResult['ErrMesg'];
							}
							
						} else {
							$bError = true;
							$sErrMesg .= "Can not retrieve the 'StationCode' IO value.\n";
							$sErrMesg .= $aStationCodeResult['ErrMesg'];
							//$sErrMesg .= json_encode( $oRestrictedDB->QueryLogs );
						}
					} //-- ENDIF No errors detected --//
				}	//-- ENDELSE Assume no errors --//
			} else {
				//-- Display the error --//
				$bError = true;
				$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
				$sErrMesg .= $aWeatherIOs['ErrMesg'];
			}
		}
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - GET THE JSON VALUES FOR THIS WEATHER DEVICE                        --//
		//------------------------------------------------------------------------------//
		if( $bError===false) {
			//-- 4.1 - Setup the URL            --//
			$sURL = "http://api.openweathermap.org/data/2.5/weather?id=".$this->sWeatherCode."&units=metric&appid=".$this->sUsername;
			
			//-- 4.2 - Perform the HTTP Request --//
			$aHTTPResponse = $this->HTTPRequest( $sURL );
			
			//-- 4.3 - Extract the Response     --//
			if( $aHTTPResponse['Error']===false ) {
				$aJsonData = json_decode( $aHTTPResponse["Result"] , true );
				
				if( $aJsonData!==null && $aJsonData!==false ) {
					
					//----------------------------------------//
					//-- Extract the real value             --//
					//----------------------------------------//
					foreach( $aWeatherIOsToBeParsed as $sKey => $aWeatherInfo ) {
						//-- Extract the location in the json data --//
						if( isset( $aWeatherInfo['Src'] ) ) {
							
							$sValue = ExtractValueFromMultiArray( $aJsonData, $aWeatherInfo['Src']);
							
							if( $sValue!==null ) {
								//-- Return the Result --//
								$aResult[$sKey] = array(
									"Value"   => $sValue,
									"UomId"   => $aWeatherInfo['UoMId'],
									"UomName" => $aWeatherInfo['UoMName'],
									"UTS"     => $iUTS
								);
								
								//-- Add the new value to the database --//
								$aTempFunctionResult = InsertNewIODataValue( $aWeatherInfo['IOId'], $iUTS, $sValue );
								//-- TODO: Check for errors --//
								
								
								//-- Debugging --//
								//echo "Success: Id=".$aWeatherInfo['IOId']." iUTS=".$iUTS." Value=".$sValue." \n";
							} else {
								//-- Debugging --//
								//echo "Error: Id=".$aWeatherInfo['IOId']." iUTS=".$iUTS." Value=".$sValue." \n";
							}
						}
					} //-- ENDFOREACH --//
				} else {
					$bError = true;
					$sErrMesg .= "OpenWeatherMap returned an invalid response!\n";
					$sErrMesg .= "Can't parse the JSON response from the weather server!\n";
				}
			} else {
				$bError = true;
				$sErrMesg .= "OpenWeatherMap returned an invalid response!\n";
				$sErrMesg .= $aHTTPResponse['ErrMesg'];
			}
		}
		
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
	} //-- ENDFUNCTION POLLWEATHER --//
	
	
	
	//================================================================================================//
	//== #9.1# - HTTP REQUEST FUNCTION                                                              ==//
	//================================================================================================//
	protected function HTTPRequest( $sUrl, $aPostData=null ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aResult        = array();      //-- ARRAY:         Used to hold the result of if this function succeeded or failed in getting the desired result.	--//
		
		//----------------------------------------------------------------//
		//-- 2.0 - PREAPARE FOR HTTP REQUEST                            --//
		//----------------------------------------------------------------//
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - SETUP PHP CLIENT URL                                 --//
		//----------------------------------------------------------------//
		$oRequest       = curl_init();
		
		curl_setopt( $oRequest, CURLOPT_URL,                $sUrl       );
		curl_setopt( $oRequest, CURLOPT_CONNECTTIMEOUT,     3           );
		curl_setopt( $oRequest, CURLOPT_TIMEOUT,            4           );
		curl_setopt( $oRequest, CURLOPT_RETURNTRANSFER,     true        );
		
		//----------------------------------------------------------------//
		//-- 4.0 - EXECUTE HTTP REQUEST                                 --//
		//----------------------------------------------------------------//
		$oHTTPRequestResult = curl_exec( $oRequest );
		
		
		//----------------------------------------------------------------//
		//-- 5.0 - PARSE THE RESPONSE                                   --//
		//----------------------------------------------------------------//
		
		
		//--------------------------------------------------------//
		//-- IF there isn't a result from the HTTP Request      --//
		if( $oHTTPRequestResult===false ) {
			$aResult = array(
				"Error"     => true,
				"ErrMesg"   => "Error! Couldn't execute \"http\" request! ".$sUrl
			);
		
		//--------------------------------------------------------//
		//-- ELSE then there isn't an error                     --//
		} else {
			$aResult = array(
				"Error"     => false,
				"Result"    => $oHTTPRequestResult
			);
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                                   --//
		//----------------------------------------------------------------//
		return $aResult;
	}


}

?>