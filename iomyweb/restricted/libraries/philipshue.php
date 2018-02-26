<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This Class is used for connecting to "Philips hue bridges".
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


class PHPPhilipsHue {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sNetworkAddress      = '';           //-- STRING:    Holds the IP Address or Network name of the Device. --//
	protected $sNetworkPort         = '';           //-- STRING:    Holds the IP Port that is used for Onvif. --//
	protected $sUserToken           = '';           //-- STRING:    --//
	protected $sAPIUrl              = '';           //-- STRING:    --//
	protected $sObjectState         = '';           //-- STRING:        Used to indicate what State that the Object is in. --//
	public $bInitialised            = false;        //-- BOOLEAN:   --//
	public $aErrorMessges           = array();      //-- ARRAY:     --//
	public $aHueBridgeConfig        = array();      //-- ARRAY:     --//
	public $aLightList              = array();      //-- ARRAY:     Holds the List of known lights --//
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT & DESTRUCT FUNCTIONS                                                                             ==//
	//========================================================================================================================//
	public function __construct( $sNetworkAddress, $sIPPort="80", $sUserToken="admin", $aObjectData=null ) {
		//----------------------------------------------------//
		//-- 1.0 - INITIALISE                               --//
		//----------------------------------------------------//
		$this->sNetworkAddress		= $sNetworkAddress;
		$this->sNetworkPort			= $sIPPort;
		$this->sUserToken			= $sUserToken;
		
		//-- CREATE THE API URL --//
		//-- TODO: Change this into a function --//
		$this->sAPIUrl				= 'http://'.$sNetworkAddress.':'.$sIPPort.'/api/'.$sUserToken;
		
		//-- Extract the ObjectState (if applicable) --//
		if( $aObjectData!==null ) {
			if( isset( $aObjectData['ObjectState'] )  ) {
				$this->sObjectState = $aObjectData['ObjectState'];
				
			} else {
				$this->sObjectState = "Normal";
			}
		} else {
			$this->sObjectState = "Normal";
		}
		
		
		
		//----------------------------------------------------//
		//-- 3.0 - FETCH THE USER CONFIGURATION             --//
		//----------------------------------------------------//
		$aHueBridgeConfig			= $this->GetConfiguration();
		
		//----------------------------------------------------//
		//-- 4.0 - PARSE THE USER CONFIGURATION             --//
		//----------------------------------------------------//
		if( $aHueBridgeConfig["Error"]===false ) {
			//-- Store the User Config --//
			$this->aHueBridgeConfig = $aHueBridgeConfig['Data'];
			
			//-- Refresh the Lights List --//
			$aLightsLookup = $this->RefreshLightsList();
				
			if( $aLightsLookup['Error']===false ) {
				//-- Flag that the initial connection was made --//
				$this->bInitialised = true;
				
			} else {
				//--------------------//
				//-- ERROR          --//
				//--------------------//
				$this->aErrorMessges[] = "InitialConnection: Couldn't extract the Light List!";
			}
			
			
		} else {
			//--------------------//
			//-- ERROR          --//
			//--------------------//
			$this->aErrorMessges[] = "InitialConnection: Connection Failed!";
		}
	}
	
	
	
	public function __destruct() {
		// nothing to do
	}
	
	
	//========================================================================================================================//
	//== #3.0# - GET API URL FUNCTION                                                                                       ==//
	//========================================================================================================================//
	private function GetAPIUrl( $bUseUserToken, $sUrlSuffix ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sAddress		= $this->sNetworkAddress;
		$sPort			= $this->sNetworkPort;
		$sUserToken		= $this->sUserToken;
		
		
		//----------------------------------------------------------------//
		//-- IF THE USER TOKEN DOESN'T NEED TO BE USED                  --//
		//----------------------------------------------------------------//
		if( $bUseUserToken===false ) {
			if( $sUrlSuffix==="" ) {
				
				return 'http://'.$sAddress.':'.$sPort.'/api';
			} else {
				
				return 'http://'.$sAddress.':'.$sPort.'/api/'.$sUrlSuffix;
			}
			
		//----------------------------------------------------------------//
		//-- ELSE --//
		//----------------------------------------------------------------//
		} else {
			if( $sUrlSuffix==="" ) {
				return 'http://'.$sAddress.':'.$sPort.'/api/'.$sUserToken;
				
			} else {
				return 'http://'.$sAddress.':'.$sPort.'/api/'.$sUserToken."/".$sUrlSuffix;
				
			}
		}
	}
	
	
	
	
	public function GetConfiguration() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$sErrMesg       = "";
		$aResult        = array();				//-- ARRAY:			Stores the Result of the HTTP Request --//
		$aTemp          = array();
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPRequest( "config", null, false );
		
		if( $aResult['Error']===true ) {
			$bError = true;
			$sErrMesg .= "Error retrieving the Config! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		} else {
			//-- TODO: Implement a "try catch" here --//
			$aTemp = json_decode( $aResult["Result"], true );
			
			//var_dump( $aTemp );
			//echo "\n\n";
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aTemp );
		
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	
	//================================================================================================//
	//== LIGHT LIST FUNCTIONS                                                                       ==//
	//================================================================================================//
	private function LookupLightsList() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$sErrMesg       = "";
		$aReturn        = array();
		$aResult        = array();				//-- ARRAY:			Stores the Result of the HTTP Request --//
		$aTemp          = array();
		
		//----------------------------------------------------------------//
		//-- 3.0 - PERFORM THE HTTP REQUEST                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPRequest( "lights", null, true );
		
		
		//----------------------------------------------------------------//
		//-- 4.0 - PARSE THE RESULTS                                    --//
		//----------------------------------------------------------------//
		if( $aResult['Error']===true ) {
			$bError = true;
			$sErrMesg .= "Error retrieving Lights! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		} else {
			//-- TODO: Implement a "try catch" here --//
			$aTemp = json_decode($aResult["Result"], true);
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			$aReturn = array( "Error"=>false, "Data"=>$aTemp );
			
		} else {
			//-- Error Occurred --//
			$aReturn = array ( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
		return $aReturn;
	}
	
	
	public function RefreshLightsList() {
		$aTemp = $this->LookupLightsList();
		
		if( $aTemp['Error']===false ) {
			$this->aLightList = $aTemp['Data'];
			return $aTemp;
			
		} else {
			return $aTemp;
			
		}
	}
	
	
	public function GetLightsList() {
		//-- Quick function to return the current Light list --//
		return $this->aLightList;
	}
	
	
	//================================================================================================//
	//== HUE SATURATION BRIGHTNESS FUNCTIONS                                                        ==//
	//================================================================================================//
	public function ChangeLightHueSatBright( $iPostLightId, $iPostHue, $iPostSaturation, $iPostBrightness ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$sErrMesg       = "";
		$aReturn        = array();
		$aResult        = array();				//-- ARRAY:			Stores the Result of the HTTP Request --//
		$aTemp          = array();
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aPostData = array(
			"hue" => $iPostHue,
			"sat" => $iPostSaturation,
			"bri" => $iPostBrightness,
		);
		
		
		$aResult = $this->HTTPRequest( "lights/".$iPostLightId."/state", $aPostData, true );
		
		//----------------------------------------------------------------//
		//-- 4.0 - PARSE THE RESULTS                                    --//
		//----------------------------------------------------------------//
		if( $aResult['Error']===true ) {
			$bError = true;
			$sErrMesg .= "Error changing the Light's Hue, Saturation and Brightness! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		} else {
			//-- TODO: Implement a "try catch" here --//
			$aTemp = json_decode($aResult["Result"], true);
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aTemp );
			
		} else {
			//-- Error Occurred --//
			return array ( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	//================================================================================================//
	//== ON/OFF FUNCTIONS                                                                           ==//
	//================================================================================================//
	public function GetThingState( $sPostLightId ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$sErrMesg       = "";
		
		//----------------------------------------------------------------//
		//-- 5.0 - MAIN                                                 --//
		//----------------------------------------------------------------//
		if( isset($this->aLightList[$sPostLightId] ) ) {
			if( isset($this->aLightList[$sPostLightId]['state']) ) {
				if( isset($this->aLightList[$sPostLightId]['state']['on']) ) {
					return array(
						"Error" => false,
						"State" => $this->aLightList[$sPostLightId]['state']['on']
					);
				}
			}
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN ERROR                                         --//
		//----------------------------------------------------------------//
		return array(
			"Error"   => true,
			"ErrMesg" => "Thing State not found in Philips Hue Object"
		);
	}
	
	
	
	public function ChangeThingState( $iPostLightId, $State ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$sErrMesg       = "";
		$aReturn        = array();
		$aResult        = array();				//-- ARRAY:			Stores the Result of the HTTP Request --//
		$aTemp          = array();
		$bDesiredState  = false;                //-- BOOLEAN:       Holds the new state --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Work out desired state                               --//
		//----------------------------------------------------------------//
		if( $State ) {
			$bDesiredState = true;
		} else {
			$bDesiredState = false;
		}
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aPostData = array(
			"on" => $bDesiredState
		);
		
		
		$aResult = $this->HTTPRequest( "lights/".$iPostLightId."/state", $aPostData, true );
		
		//----------------------------------------------------------------//
		//-- 4.0 - PARSE THE RESULTS                                    --//
		//----------------------------------------------------------------//
		if( $aResult['Error']===true ) {
			$bError = true;
			$sErrMesg .= "Error changing Lights On/Off State! \n";
			$sErrMesg .= $aResult["ErrMesg"];
		} else {
			//-- TODO: Implement a "try catch" here --//
			$aTemp = json_decode($aResult["Result"], true);
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aTemp );
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	//================================================================================================//
	//==  ==//
	//================================================================================================//
	public function AutoAddNewLights( $iLinkId ) {
		//------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                   --//
		//------------------------------------------------------------------------//
		
		//-- 1.1 - Declare Global variables --//
		global $oRestrictedApiCore;
		
		//-- 1.2 - Declare normal variables --//
		$bError                 = false;            //-- BOOLEAN:   Used to indicate if an error has been caught. --//
		$sErrMesg               = "";               //-- STRING:    --//
		$bFound                 = false;            //-- BOOLEAN:   Used to indicate to identify if a detected light is already in the database or not. --//
		$bTransactionStarted    = false;            //-- BOOLEAN:   Used to indicate that the transaction has started. --//
		$sHWId                  = "";               //-- STRING:    Used to store the Hardware Id of the Light on the Philips hue bridge --//
		$aDetectedLightsTemp    = array();          //-- ARRAY:     This is used to hold the Lights that were detected by this API. --//
		$aDatabaseLightsTemp    = array();          //-- ARRAY:     This is used to hold the Lights that are stored in the database --//
		$aDatabaseLights        = array();          //-- ARRAY:     --//
		$aThingData             = array();          //-- ARRAY:     This is used when adding a new Light to the database as it contains all the Info needed to perform this action. --//
		$iNewLightState         = false;            //-- BOOLEAN:   Used to hold the new Light's State.   --//
		$sNewLightName          = "";               //-- STRING:    Used to hold the new Light's name.    --//
		$aNewThingResult        = array();          //-- ARRAY:     --//
		
		
		//-- 1.5 - Required Libraries --//
		require_once SITE_BASE.'/restricted/libraries/special/dbinsertfunctions.php';
		
		//------------------------------------------------------------------------//
		//-- 2.0 - SETUP VARIABLES                                              --//
		//------------------------------------------------------------------------//
		
		//-- Add the new lights into the database --//
		$aDetectedLightsTemp    = $this->aLightList;
		
		
		//-- Check what to do for this ObjectState --//
		if( $this->sObjectState==="WatchInputs" ) {
			$aDatabaseLightsTemp    = WatchInputsGetThingsFromLinkId( $iLinkId );
		} else {
			$aDatabaseLightsTemp    = GetThingsFromLinkId( $iLinkId );
		}
		
		
		if( $aDatabaseLightsTemp['Error']===true ) {
			if( $aDatabaseLightsTemp["ErrMesg"]!=="No Things Found! \nCouldn't find Things on that particular Link.\n" ) {
				//----------------//
				//-- ERROR      --//
				//----------------//
				$bError    = true;
				$sErrMesg .= "Problem getting a list of Lights that are already in the database!\n";
				$sErrMesg .= $aDatabaseLightsTemp['ErrMesg'];
				
			}
		} else {
			//-- Extract the DatabaseLights to the variable --//
			$aDatabaseLights = $aDatabaseLightsTemp['Data'];
		}
		
		
		//------------------------------------------------------------------------//
		//-- 5.0 - Get the list of all the other known Lights on the Bridge     --//
		//------------------------------------------------------------------------//
		if( $bError===false ) {
			if( $aDetectedLightsTemp!==null ) {
				$aResult = array (
					"Error"		=> false,
					"Data"		=> array()
				);
				
				//----------------------------------------------------------------//
				//-- Verify that all lights are added                           --//
				//----------------------------------------------------------------//
				foreach( $aDetectedLightsTemp as $sHWId => $aNewLight ) {
					if( $bError===false ) {
						//echo "\n Detected Id = ";
						//var_dump( $sHWId );
						
						if( $sHWId>=0 ) {
							//----------------------------------------------------//
							//-- Reset Variables                                --//
							//----------------------------------------------------//
							$bFound = false;
							
							//----------------------------------------------------//
							//-- Check if it is found in the list of Lights     --//
							//----------------------------------------------------//
							foreach( $aDatabaseLights as $aThing ) {
								if( $bFound===false ) {
									//-- Check if the HWIds match --//
									if( strval($aThing['ThingHWId'])===$sHWId ) {
										$bFound = true;
									} else if( $aThing['ThingHWId']===$sHWId ) {
										$bFound = true;
									}
									//echo "\n DB Ids = ";
									//var_dump( $aThing['ThingHWId'] );
								}
							}
							
							
							//----------------------------------------------------//
							//-- Add the new Light                              --//
							//----------------------------------------------------//
							if( $bFound===false ) {
								
								//------------------------//
								//-- Hue Light Name     --//
								//------------------------//
								if( isset($aNewLight['name']) ) {
									$sNewLightName = $aNewLight['name'];
									
								} else {
									$sNewLightName = "New Philips Hue ".$sHWId;
								}
								
								
								//------------------------//
								//-- State              --//
								//------------------------//
								if( isset($aNewLight['state']) ) {
									if( isset($aNewLight['state']['on']) ) {
										if( $aNewLight['state']['on'] ) {
											$iNewLightState = 1;
										} else {
											$iNewLightState = 0;
										}
										
									} else {
										$iNewLightState = 0;
									}
								} else {
									$iNewLightState = 0;
								}
								
								
								//--------------------------------------------//
								//-- Prepare the array for Inserting        --//
								//--------------------------------------------//
								$aThingData = array(
									"Type"		=> "13",
									"Name"		=> $sNewLightName,
									"State"		=> $iNewLightState,
									"HWId"		=> $sHWId,
									"IOs"		=> array(
									/*
										array(
											"RSType"			=> "3901",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Hue",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "300",
											"SampleRateMax"		=> "300",
											"SampleRateLimit"	=> "1200"
										),
										array(
											"RSType"			=> "3902",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Saturation",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "300",
											"SampleRateMax"		=> "300",
											"SampleRateLimit"	=> "1200"
										),
										array(
											"RSType"			=> "3903",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Brightness",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "300",
											"SampleRateMax"		=> "300",
											"SampleRateLimit"	=> "1200"
										)
									*/
										array(
											"RSType"			=> "3906",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Red",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "-1",
											"SampleRateMax"		=> "-1",
											"SampleRateLimit"	=> "-1"
										),
										array(
											"RSType"			=> "3907",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Green",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "-1",
											"SampleRateMax"		=> "-1",
											"SampleRateLimit"	=> "-1"
										),
										array(
											"RSType"			=> "3908",
											"UoM"				=> "1",
											"Type"				=> "2",
											"Name"				=> "Blue",
											"BaseConvert"		=> "1",
											"SampleRate"		=> "-1",
											"SampleRateMax"		=> "-1",
											"SampleRateLimit"	=> "-1"
										)
									)
								);
								
								//--------------------------------------------//
								//-- Start the Transaction                  --//
								//--------------------------------------------//
								$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
								
								if( $bTransactionStarted===false ) {
									$bError    = true;
									$iErrCode  = 16;
									$sErrMesg .= "Database Error! \n";
									$sErrMesg .= "Problem when trying to start the transaction! \n";
								}
								
								
								//--------------------------------------------//
								//-- Call the Insert Function               --//
								//--------------------------------------------//
								//-- Add the new thing --//
								$aNewThingResult = PrepareAddNewThing( $iLinkId, $aThingData, 0, "", "" );
								
								
								//-- Check for errors --//
								if( $aNewThingResult["Error"]===true ) {
									//-- Display an Error Message --//
									$bError    = true;
									$iErrCode  = $aNewThingResult['ErrCode'];
									$sErrMesg .= "Problem Adding a new thing! \n";
									$sErrMesg .= $aNewThingResult["ErrMesg"];
								} else {
									$aNewThingResult['Data'][] = $aNewThingResult['Thing'];
								}
								
								
								//--------------------------------------------//
								//-- End the Transaction                    --//
								//--------------------------------------------//
								if( $bError===false ) {
									//-- Commit the changes --//
									$oRestrictedApiCore->oRestrictedDB->dbEndTransaction();
									
								} else {
									//-- Rollback changes --//
									$oRestrictedApiCore->oRestrictedDB->dbRollback();
									
								}
							}
						}		//-- ENDIF New Light has been found. --/
					}		//-- ENDIF Error has been flagged. --//
				}		//-- ENDFORAECH Light in the Bridge's Light List --//
			} else {
				$bError    = true;
				$iErrCode  = 0;
				$sErrMesg .= "Problem looking up the Philips Hue Bridge's light list! \n";
			}
		//-- ENDIF No Errors looking up the Database's Light List --//
		} else {
			//-- Display an Error Message --//
			$bError    = true;
			$iErrCode  = 0;
			$sErrMesg .= "Problem looking up the database's light list! \n";
			$sErrMesg .= $aDatabaseLights["ErrMesg"];
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return $aResult;
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrCode"=>$iErrCode, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	//================================================================================================//
	//== ADD THE CURRENT BRIDGE TO DATABASE                                                         ==//
	//================================================================================================//
	public function AddThisBridgeToTheDatabase( $iCommId, $iRoomId=-1 ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//--  --//
		$bError			= false;
		$sErrMesg		= "";
		$aLinkData		= array();
		$aLinkResult	= array();
		$aResult		= array();
		
		//-- Fetch some of the Data from the configuration data --//
		$sSerialCode	= $this->aHueBridgeConfig['bridgeid'];
		$sModelId		= $this->aHueBridgeConfig['modelid'];
		$sLinkName		= $this->aHueBridgeConfig['name'];
		$sConnAddress	= $this->sNetworkAddress;
		$iLinkType		= 7;
		$sInfoName		= "Philips Hue Bridge ".$sModelId;
		
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - Check ObjectState                                    --//
		//----------------------------------------------------------------//
		if( $this->sObjectState==="WatchInputs" ) {
			$bError    = false;
			$sErrMesg .= "The requested function is not supported this ObjectState!\n";
		}
			
		//----------------------------------------------------------------//
		//-- 4.0 - Make sure that the Bridge isn't in the database      --//
		//----------------------------------------------------------------//
		$aCheckLink = CheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sConnAddress, $sInfoName );
		
		if( $aCheckLink!==false ) {
			$bError     = true;
			$sErrMesg   = "The Device(Link) already exists in the database\n";
		}
		
		
		//----------------------------------------------------------------//
		//-- 6.0 - Create the Philips Hue Bridge Data                   --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$aLinkData = array(
				"CommId"                => $iCommId,
				"Type"                  => $iLinkType,
				"SerialCode"            => $sSerialCode,
				"Displayname"           => $sLinkName,
				"State"                 => "1",
				"InfoName"              => $sInfoName,
				"InfoManufacturer"      => "Philips",
				"InfoManufacturerUrl"   => "www.meethue.com",
				"ConnFrequencyId"       => "1",
				"ConnProtocolId"        => "1",
				"ConnCryptTypeId"       => "1",
				"ConnAddress"           => $this->sNetworkAddress,
				"ConnPort"              => $this->sNetworkPort,
				"ConnName"              => "Philips Hue Bridge",
				"ConnUsername"          => $this->sUserToken,
				"ConnPassword"          => "",
				"Things"                => array()
			);
			
			if( $iRoomId>=1 ) {
				$aLinkData['RoomId'] = $iRoomId;
			}
		}
		
		//----------------------------------------------------------------//
		//-- 8.0 - ADD THE BRIDGE TO THE DATABASE                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$aLinkResult = PrepareAddNewLink( $aLinkData );
			
			if( $aLinkResult['Error']===true ) {
				//--------------------------------------------//
				//-- Flag that an error occurred            --//
				//--------------------------------------------//
				$bError = true;
				$sErrMesg .= "";
				$sErrMesg .= $aLinkResult['ErrMesg'];
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
	
	
	
	
	//================================================================================================//
	//== HTTP REQUEST FUNCTION                                                                      ==//
	//================================================================================================//
	protected function HTTPRequest( $sUrlSuffix, $aPOSTData, $bUserTokenNeeded=true ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aResult		= array();		//-- ARRAY:			Used to hold the result of if this function succeeded or failed in getting the desired result.	--//
		$sURL			= "";			//-- STRING:		--//
		
		//----------------------------------------------------------------//
		//-- 2.0 - PREAPARE FOR HTTP REQUEST                            --//
		//----------------------------------------------------------------//
		$sURL = $this->GetAPIUrl( $bUserTokenNeeded, $sUrlSuffix );
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - SETUP PHP CLIENT URL                                 --//
		//----------------------------------------------------------------//
		$oRequest       = curl_init();
		
		curl_setopt( $oRequest, CURLOPT_URL,                $sURL       );
		curl_setopt( $oRequest, CURLOPT_CONNECTTIMEOUT,     3           );
		curl_setopt( $oRequest, CURLOPT_TIMEOUT,            4           );
		curl_setopt( $oRequest, CURLOPT_RETURNTRANSFER,     true        );
		
		if( $aPOSTData!==null && $aPOSTData!==false ) {
			$sPOSTData = json_encode( $aPOSTData );
			
			curl_setopt( $oRequest, CURLOPT_CUSTOMREQUEST,      "PUT"       );
			curl_setopt( $oRequest, CURLOPT_POSTFIELDS,         $sPOSTData  );
			curl_setopt( $oRequest, CURLOPT_HTTPHEADER,         array( 
				'Content-Type: application/json', 
				'Content-Length: '.strlen( $sPOSTData )
			));
		}
		
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
				"Error"		=> true,
				"ErrMesg"	=> "Error! Couldn't execute \"http\" request! ".json_encode( $aPOSTData )
			);
		
		//--------------------------------------------------------//
		//-- ELSE then there isn't an error                     --//
		} else {
			$aResult = array(
				"Error"		=> false,
				"Result"	=> $oHTTPRequestResult
			);
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                                   --//
		//----------------------------------------------------------------//
		return $aResult;
	}
}



?>