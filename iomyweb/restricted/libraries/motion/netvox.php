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


class MotionSensor_Netvox {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sObjectState         = '';           //-- STRING:        Used to indicate what State that the Object is in (eg. Dealing with a non-database weather source or dealing with a weather source from the database )--//
	protected $iLinkId              = 0;            //-- INTEGER:       Holds the LinkId of the desired Weather device --//
	protected $iThingId             = 0;            //-- INTEGER:       Holds the ThingId (as there should only be ever be 1)  --//
	protected $iStatusRSTypeId      = 3909;         //-- INTEGER:       Holds the RSTypeId of the Status IO. --//
	protected $iMotionEnum          = 1;            //-- INTEGER:       
	protected $iTamper1Enum         = 2;            //-- INTEGER:       
	protected $iTamper2Enum         = 4;            //-- INTEGER:       
	protected $iLowBateryEnum       = 8;            //-- INTEGER:       
	
	protected $aIOs                 = array();      //-- ARRAY:         Holds the Status IOs Info for other functions so it doesn't have to be looked up multiple times --//'
	
	public $bInitialised            = false;        //-- BOOLEAN:       Used to indicate if this object was successful at setting itself up or if errors occurred --//
	public $aErrorMessges           = array();      //-- ARRAY:         Used to hold all the error messages that have occured with this object as they are all useful for debugging purposes --//
	
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT / DESTRUCT FUNCTIONS                                                                             ==//
	//========================================================================================================================//
	
	
	
	
	//================================================================================================//
	//== #2.1# - Construct                                                                          ==//
	//================================================================================================//
	public function __construct( $aDeviceData ) {
		try {
			//----------------------------------------------------//
			//-- 1.0 - INITIALISE MANDATORY VARIABLES           --//
			//----------------------------------------------------//
			$this->sObjectState         = $aDeviceData['ObjectState'];
			
			
			//----------------------------------------------------//
			//-- 2.0 - INITIALISE OPTIONAL VARIABLES            --//
			//----------------------------------------------------//
			if( isset($aDeviceData['LinkId']) ) {
				$this->iLinkId        = $aDeviceData['LinkId'];
			}
			
			if( isset($aDeviceData['ThingId']) ) {
				$this->iThingId       = $aDeviceData['ThingId'];
			}
			
			//----------------------------------------------------//
			//-- 3.0 - Check that the Object State is valid     --//
			//----------------------------------------------------//
			switch( $this->sObjectState ) {
				case "non-DB":
					$this->bInitialised = true;
					break;
					
				case "DBThing":
					if( $this->iThingId >=1 ) {
						if( $this->InitialiseDBThingMotionSensor() ) {
							$this->bInitialised = true;
						} else {
							$this->aErrorMessges[] = "Problem when trying to initialise this object!";
						}
					} else {
						//-- ERROR --//
						$this->aErrorMessges[] = "Problem with the ThingId!";
					}
					break;
					
				default:
					$this->aErrorMessges[] = "Unregonized Weather Object State!";
					
			}
			
		} catch( Exception $e0001 ) {
			$this->bInitialised = false;
			$this->aErrorMessges[] = "Problem Initialising MotionSensor Class! \n".$e0001->getMessage();
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
	public function InitialiseDBThingMotionSensor() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$iRSTypeId          = 0;            //-- INTEGER:   Holds the RSTypeId in a integer format.  --//
		$sRSTypeId          = "";           //-- STRING:    --//
		$aIOsTemp           = array();      //-- ARRAY:     --//
		$aIOInfo            = array();      //-- ARRAY:     --//
		$aIORecentData      = array();      //-- ARRAY:     --//
		
		//-- Get the current time --//
		$iUTS = time();
		
		//----------------------------------------------------------------//
		//-- 3.0 - Lookup the Motion Sensor's IOs                       --//
		//----------------------------------------------------------------//
		$aIOsTemp           = GetIOsFromThingId( $this->iThingId );
		
		if( $aIOsTemp['Error']===false ) {
			foreach( $aIOsTemp['Data'] as $aIO ) {
				
				if( isset( $aIO['RSTypeId'] ) ) {
					
					//-- Extract the RSTypeId --//
					$iRSTypeId     = $aIO['RSTypeId'];
					//-- Convert it to a string for usage as an associative array key --//
					$sRSTypeId     = (string)$iRSTypeId;
					
					
					//-- Check the RSType and that the data type is an enumeration --//
					if( $iRSTypeId===$this->iStatusRSTypeId ) {
						$aIOInfo = GetIOInfo( $aIO['IOId'] );
						
						if( $aIOInfo['Error']===false ) {
							
							//-- Check to make sure the SensorType is an Enumeration --//
							if( $aIOInfo['Data']['DataEnumeration']===1 ) {
								//-- Store the Status IO --//
								$this->aIOs[$sRSTypeId] = $aIOInfo['Data'];
								
								//-- Lookup the most recent Status code from the database --//
								$aIORecentData = GetIODataMostRecentEnum( $aIOInfo['Data']['DataTypeId'], $aIO['IOId'], $iUTS );
								
								echo "\n\n-----------------------------------------------------------\n";
								var_dump($aIOInfo);
								echo "\n";
								var_dump($aIO);
								echo "\n\n";
								echo "\n\n-----------------------------------------------------------\n";
								var_dump($aIORecentData);
								
								echo "\n\n-----------------------------------------------------------\n";
								global $oRestrictedApiCore;
								var_dump( $oRestrictedApiCore->oRestrictedDB->QueryLogs );
								echo "\n\n";
								
								
								if( $aIORecentData['Error']===false ) {
									$this->aIOs[$sRSTypeId]['MostRecentData'] = $aIORecentData['Data']['Value'];
									$this->aIOs[$sRSTypeId]['MostRecentUTS']  = $aIORecentData['Data']['UTS'];
									return true;
									
								} else {
									var_dump($aIORecentData);
									echo "\n";
								}
							}
							
						} else {
							//-- Store the error message --//
							$this->aErrorMessges[] = "Can not retrieve the 'StationCode' IO Info.\n".$aStationIOInfo['ErrMesg'];
							return false;
						}
					}
				}
			}	//-- ENDFOREACH --//
		}
		return false;
	}
	
	
	
	
	public function GetMostRecentDBMotion() {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aResult            = array();
		$sRSTypeId          = "";
		$iUTS               = time();
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT IS READY TO ACCESS THE DATABASE     --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DBThing" ) {
			$bError    = true;
			$sErrMesg  = "Motion Sensor Object is not setup to be able to perform this request!";
			
		} else if( $this->bInitialised!==true ) {
			$bError    = true;
			$sErrMesg  = "Motion Sensor Object is not initialised and therefore no able to perform this request!";
		}
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			
			//-- Create the RSTypeId key to search for --//
			$sRSTypeId = (string)$this->iStatusRSTypeId;
			
			//-- Check to make sure the Thing has been located located --//
			if( isset( $this->aIOs[$sRSTypeId] ) ) {
				//-- Fetch the Most Recent Motion --//
				$aResult = GetIODataMostRecentEnumBit( $this->aIOs[$sRSTypeId]['DataTypeId'], $this->aIOs[$sRSTypeId]['IOId'], $iUTS, $this->iMotionEnum );
				
			}
		}	//-- ENDIF No Errors --//
		
		//------------------------------------------------------------------------------//
		//-- 9.0 - PARSE THE JSON REPONSE                                             --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			//-- 9.A - SUCCESS --//
			return array( "Error"=>false, "Data"=>$aResult );
	
		} else {
			//-- 9.B - FAILURE --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	public function GetCurrentStatusData() {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aResult            = array();
		
		$sRSTypeId          = "";
		$iMostRecentValue   = 0;
		
		$iUTS               = time();
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT IS READY TO ACCESS THE DATABASE     --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DBThing" ) {
			$bError    = true;
			$sErrMesg  = "Motion Sensor Object is not setup to be able to perform this request!";
			
		} else if( $this->bInitialised!==true ) {
			$bError    = true;
			$sErrMesg  = "Motion Sensor Object is not initialised and therefore no able to perform this request!";
		}
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			
			//-- Create the RSTypeId key to search for --//
			$sRSTypeId = (string)$this->iStatusRSTypeId;
			
			//-- Check to make sure the Thing has been located located --//
			if( isset( $this->aIOs[$sRSTypeId] ) ) {
				//-- Only if there is recent Data --//
				if( isset($this->aIOs[$sRSTypeId]['MostRecentData']) ) {
					
					//--------------------------------//
					//-- Check for Motion           --//
					//--------------------------------//
					if( $this->aIOs[$sRSTypeId]['MostRecentData'] & $this->iMotionEnum ) {
						$aResult['CurrentMotion'] = true;
						
					} else {
						$aResult['CurrentMotion'] = false;
						
					}
					
					//--------------------------------//
					//-- Check for Tamper           --//
					//--------------------------------//
					if( ($this->aIOs[$sRSTypeId]['MostRecentData'] & $this->iTamper1Enum ) || ( $this->aIOs[$sRSTypeId]['MostRecentData'] & $this->iTamper2Enum ) ) {
						$aResult['Tamper'] = true;
					} else {
						$aResult['Tamper'] = false;
					}
					
					//--------------------------------//
					//-- Check for Low Battery      --//
					//--------------------------------//
					if( ($this->aIOs[$sRSTypeId]['MostRecentData'] & $this->iLowBateryEnum ) ) {
						$aResult['LowBattery'] = true;
					} else {
						$aResult['LowBattery'] = false;
					}
					
					//--------------------------------//
					//-- Last Timestamp             --//
					//--------------------------------//
					$aResult['UTS'] = $this->aIOs[$sRSTypeId]['MostRecentUTS']; 
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

	
	
	//================================================================================================//
	//== #9.1# - HTTP REQUEST FUNCTION                                                              ==//
	//================================================================================================//

}

?>