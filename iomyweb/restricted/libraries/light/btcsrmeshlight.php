<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This PHP class is used for Netvox Motion Sensors.
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


class BTCSRMeshLight {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sObjectState         = '';           //-- STRING:        Used to indicate what State that the Object is in (eg. Dealing with a non-database weather source or dealing with a weather source from the database )--//
	protected $aThingInfo           = array();      //-- ARRAY:         --//
	protected $aLinkInfo            = array();      //-- ARRAY:         --//
	protected $aCommInfo            = array();      //-- ARRAY:         --//
	
	
	protected $aIOs                 = array();      //-- ARRAY:         Holds the IOs Info for other functions so it doesn't have to be looked up multiple times --//'
	
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
			//-- NOTE: Do an "isset" on "ObjectState" in future versions --//
			
			//----------------------------------------------------//
			//-- 2.0 - INITIALISE OPTIONAL VARIABLES            --//
			//----------------------------------------------------//
			
			//----------------------------------------------------//
			//-- 3.0 - Check that the Object State is valid     --//
			//----------------------------------------------------//
			switch( $this->sObjectState ) {
				case "non-DB":
					$this->bInitialised = true;
					break;
					
				case "DBThing":
					if( $this->InitialiseDBThing( $aDeviceData ) ) {
						$this->bInitialised = true;
					} else {
						$this->aErrorMessges[] = "Problem when trying to initialise this object!";
					}
					break;
					
				default:
					$this->aErrorMessges[] = "Unregonized Object State!";
					
			}
			
		} catch( Exception $e0001 ) {
			$this->bInitialised = false;
			$this->aErrorMessges[] = "Problem Initialising Light class Class! \n".$e0001->getMessage();
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
	public function InitialiseDBThing( $aDeviceData ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError             = false;        //-- BOOLEAN:   Used to flag if an error has occurred --//
		$sErrMesg           = "";           //-- STRING:    --//
		$aIOsTemp           = array();      //-- ARRAY:     --//
		
		//-- Get the current time --//
		$iUTS = time();
		
		//----------------------------------------------------------------//
		//-- 3.0 - Extract the Values                                   --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				if( isset( $aDeviceData['ThingInfo'] ) && isset( $aDeviceData['LinkInfo'] ) && isset( $aDeviceData['CommInfo'] ) ) {
					//----------------------------------------//
					//-- THING INFO                         --//
					//----------------------------------------//
					$this->aThingInfo = $aDeviceData['ThingInfo'];
					
					//----------------------------------------//
					//-- LINK INFO                          --//
					//----------------------------------------//
					$this->aLinkInfo = $aDeviceData['LinkInfo'];
					
					//----------------------------------------//
					//-- COMM INFO                          --//
					//----------------------------------------//
					$this->aCommInfo = $aDeviceData['CommInfo'];
					
				} else {
					//-- Error --//
					$bError    = true;
					
					//-- Thing Info --//
					if( !isset( $aDeviceData['ThingInfo'] ) ) {
						$sErrMesg .= "Failed to extract the \"ThingInfo\" when initialising the Device Object! \n";
					}
					
					//-- Link Info --//
					if( !isset( $aDeviceData['LinkInfo'] ) ) {
						$sErrMesg .= "Failed to extract the \"LinkInfo\" when initialising the Device Object! \n";
					}
					
					//-- Comm Info --//
					if( !isset( $aDeviceData['CommInfo'] ) ) {
						$sErrMesg .= "Failed to extract the \"CommInfo\" when initialising the Device Object! \n";
					}
				}
			} catch( Exception $e03 ) {
				//-- Error --//
				$bError    = true;
				$sErrMesg .= "Critical error when initialising the Device Object! \n";
				$sErrMesg .= "Failed when extracting data when initialising. \n";
				$sErrMesg .= $e03->getMessage();
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 5.0 - Lookup the Motion Sensor's IOs                       --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				$aIOsTemp           = GetIOsFromThingId( $this->aThingInfo['ThingId'] );
				
				if( $aIOsTemp['Error']===false ) {
					$this->aIOs = $aIOsTemp['Data'];
					
				} else {
					$bError    = true;
					$sErrMesg .= "Problem looking up IOs on the device! \n";
					
				}
			} catch( Exception $e05 ) {
				$bError    = true;
				$sErrMesg .= "Critical errors when looking up IOs on the Device! \n";
				$sErrMesg .= $e05->getMessage();
			}
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - Return the Results                                   --//
		//----------------------------------------------------------------//
		if( $bError===true ) {
			//----------------------------//
			//-- FAILURE ( ERROR )      --//
			$this->aErrorMessges[] = $sErrMesg;
			return false;
		} else {
			//----------------------------//
			//-- SUCCESS                --//
			return true;
		}
		
	}
	
	
	public function ChangeHueSaturation( $iNewHue, $iNewSaturation, $iNewBrightness ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//----------------------------------------------------//
		//-- 1.1 - Declare Variables                        --//
		//----------------------------------------------------//
		$bError                  = false;        //-- BOOLEAN:   Used to flag if an error has occurred --//
		$iErrCode                = 0;            //-- INTEGER:   --//
		$sErrMesg                = "";           //-- STRING:    --//
		
		$aIOs                    = array();      //-- ARRAY:     --//
		$iModeIOId               = -1;           //-- INTEGER:   --//
		$iHueIOId                = -1;           //-- INTEGER:   --//
		$iSaturaIOId             = -1;           //-- INTEGER:   --//
		$iBrighIOId              = -1;           //-- INTEGER:   --//
		
		$iModeRSTypeId           = 0;            //-- INTEGER:   --//
		$iHueRSTypeId            = 0;            //-- INTEGER:   --//
		$iSaturaRSTypeId         = 0;            //-- INTEGER:   --//
		$iBrightRSTypeId         = 0;            //-- INTEGER:   --//
		
		$aTempFunctionResult1    = array();
		$aTempFunctionResult2    = array();
		$aTempFunctionResult3    = array();
		$aTempFunctionResult4    = array();
		
		
		//----------------------------------------------------//
		//-- 1.2 - Get Constants                            --//
		//----------------------------------------------------//
		$iModeRSTypeId           = LookupFunctionConstant("ModeRSTypeId");
		$iHueRSTypeId            = LookupFunctionConstant("LightHueRSTypeId");
		$iSaturaRSTypeId         = LookupFunctionConstant("LightSaturationRSTypeId");
		$iBrightRSTypeId         = LookupFunctionConstant("LightBrightnessRSTypeId");
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - GET THE IOS                                          --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				//----------------------------------------------------//
				//-- 3.1 - Get the IOs                              --//
				//----------------------------------------------------//
				$aIOs = $this->aIOs;
				
				//----------------------------------------------------//
				//-- 3.2 - Check to make sure each of the IOs exist --//
				//----------------------------------------------------//
				foreach( $aIOs as $aIO ) {
					//-- IF RSType is Mode --//
					//if( $aIO['RSTypeId']===$iModeRSTypeId ) {
					//	$iModeIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Hue --//
					//} else if( $aIO['RSTypeId']===$iHueRSTypeId ) {
					if( $aIO['RSTypeId']===$iHueRSTypeId ) {
						$iHueIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Saturation --//
					} else if( $aIO['RSTypeId']===$iSaturaRSTypeId ) {
						$iSaturaIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Brightness --//
					} else if( $aIO['RSTypeId']===$iBrightRSTypeId ) {
						$iBrightIOId = $aIO['IOId'];
						
					}
				}
				
				//----------------------------------------------------//
				//-- 3.3 - Verify All IOs were found                --//
				//----------------------------------------------------//
				//if( !($iModeIOId>0) ) {
				//	$bError    = true;
				//	$iErrCode  = 3;
				//	$sErrMesg .= "Can not find the 'Mode' IO.\n";
					
				//} else if( !($iHueIOId>0) ) {
				if( !($iHueIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Hue' IO.\n";
					
				} else if( !($iSaturaIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Saturation' IO.\n";
					
				} else if( !($iBrightIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Brightness' IO.\n";
				}
				
				//----------------------------------------------------//
				//-- 3.4 - Perform Validation on the values         --//
				//----------------------------------------------------//
				
				//-- Make sure the Hue is valid --//
				if( $iNewHue<0 || $iNewHue>359 ) {
					$bError    = true;
					$iErrCode  = 4;
					$sErrMesg .= "Please use a valid number for the 'Hue' value!\n";
					$sErrMesg .= "Eg. 0-359!\n";
				}
				
				//-- Make sure the Saturation is valid --//
				if( $iNewSaturation<0 || $iNewSaturation>255 ) {
					$bError    = true;
					$iErrCode  = 5;
					$sErrMesg .= "Please use a valid number for the 'Saturation' value!\n";
					$sErrMesg .= "Eg. 0-255!\n";
				}
				
				//-- Make sure the Brightness is valid --//
				if( $iNewBrightness<0 || $iNewBrightness>255 ) {
					$bError    = true;
					$iErrCode  = 6;
					$sErrMesg .= "Please use a valid number for the 'Brightness' value!\n";
					$sErrMesg .= "Eg. 0-255!\n";
				}
				
			} catch( Exception $e03 ) {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Critical Error whith the IOs or their new values! \n";
				$sErrMesg .= "Problem when looking up the IOs or the ";
			}
		}
		
		//----------------------------------------------------------------//
		//-- 4.0 - UPDATE THE VALUES                                    --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				//--------------------------------//
				//-- CREATE UNIX TIMESTAMP      --//
				$iUTS = time();
				
				//--------------------------------//
				//-- MODE                       --//
				//if( $bError===false ) {
				//	$aTempFunctionResult1 = InsertNewIODataValue( $iModeIOId, $iUTS, $iNewMode );
					
				//	if( $aTempFunctionResult1['Error']===true ) {
				//		$bError     = true;
				//		$iErrCode   = 11;
				//		$sErrMesg  .= "Critical Error updating the \"Mode\" value!\n";
				//		$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
				//	}
				//}
				
				//--------------------------------//
				//-- HUE                        --//
				if( $bError===false ) {
					$aTempFunctionResult2 = InsertNewIODataValue( $iHueIOId, $iUTS, $iNewHue );
					
					if( $aTempFunctionResult2['Error']===true ) {
						$bError     = true;
						$iErrCode   = 12;
						$sErrMesg  .= "Critical Error updating the \"Hue\" value!\n";
						$sErrMesg  .= $aTempFunctionResult2['ErrMesg'];
					}
				}
				
				//--------------------------------//
				//-- SATURATION                 --//
				if( $bError===false ) {
					$aTempFunctionResult3 = InsertNewIODataValue( $iSaturaIOId, $iUTS, $iNewSaturation );
					
					if( $aTempFunctionResult3['Error']===true ) {
						$bError     = true;
						$iErrCode   = 13;
						$sErrMesg  .= "Critical Error updating the \"Saturation\" value!\n";
						$sErrMesg  .= $aTempFunctionResult3['ErrMesg'];
					}
				}
				
				//--------------------------------//
				//-- BRIGHTNESS                 --//
				if( $bError===false ) {
					$aTempFunctionResult4 = InsertNewIODataValue( $iBrightIOId, $iUTS, $iNewBrightness );
					
					if( $aTempFunctionResult4['Error']===true ) {
						$bError     = true;
						$iErrCode   = 14;
						$sErrMesg  .= "Critical Error updating the \"Brightness\" value!\n";
						$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
					}
				}
				
				
				
			} catch( Exception $e10 ) {
				$bError     = true;
				$iErrCode   = 10;
				$sErrMesg  .= "Critical Error inserting the new database IO values!\n";
				$sErrMesg  .= $e10->getMessage();
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                                   --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			return array(
				"Error"   => false,
				"Result"  => "Success"
			);
			
		} else {
			return array(
				"Error"   => true,
				"ErrCode" => $iErrCode,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	
	
	
	public function ChangeColorRGB( $iNewRed, $iNewGreen, $iNewBlue ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//----------------------------------------------------//
		//-- 1.1 - Declare Variables                        --//
		//----------------------------------------------------//
		$bError                  = false;        //-- BOOLEAN:   Used to flag if an error has occurred --//
		$iErrCode                = 0;            //-- INTEGER:   --//
		$sErrMesg                = "";           //-- STRING:    --//
		
		$aIOs                    = array();      //-- ARRAY:     --//
		$iModeIOId               = -1;           //-- INTEGER:   --//
		$iRedIOId                = -1;           //-- INTEGER:   --//
		$iGreenIOId              = -1;           //-- INTEGER:   --//
		$iBlueIOId               = -1;           //-- INTEGER:   --//
		
		$iModeRSTypeId           = 0;            //-- INTEGER:   --//
		$iRedRSTypeId            = 0;            //-- INTEGER:   --//
		$iGreenRSTypeId          = 0;            //-- INTEGER:   --//
		$iBlueRSTypeId           = 0;            //-- INTEGER:   --//
		
		$aTempFunctionResult1    = array();
		$aTempFunctionResult2    = array();
		$aTempFunctionResult3    = array();
		$aTempFunctionResult4    = array();
		
		
		//----------------------------------------------------//
		//-- 1.2 - Get Constants                            --//
		//----------------------------------------------------//
		$iModeRSTypeId           = LookupFunctionConstant("ModeRSTypeId");
		$iRedRSTypeId            = LookupFunctionConstant("LightRedRSTypeId");
		$iGreenRSTypeId          = LookupFunctionConstant("LightGreenRSTypeId");
		$iBlueRSTypeId           = LookupFunctionConstant("LightBlueRSTypeId");
		
		//----------------------------------------------------------------//
		//-- 3.0 - GET THE IOS                                          --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				//----------------------------------------------------//
				//-- 3.1 - Get the IOs                              --//
				//----------------------------------------------------//
				$aIOs = $this->aIOs;
				
				//----------------------------------------------------//
				//-- 3.2 - Check to make sure each of the IOs exist --//
				//----------------------------------------------------//
				foreach( $aIOs as $aIO ) {
					//-- IF RSType is Mode --//
					//if( $aIO['RSTypeId']===$iModeRSTypeId ) {
					//	$iModeIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Red --//
					//} else if( $aIO['RSTypeId']===$iRedRSTypeId ) {
					if( $aIO['RSTypeId']===$iRedRSTypeId ) {
						$iRedIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Green --//
					} else if( $aIO['RSTypeId']===$iGreenRSTypeId ) {
						$iGreenIOId = $aIO['IOId'];
						
					//-- ELSEIF RSType is Blue --//
					} else if( $aIO['RSTypeId']===$iBlueRSTypeId ) {
						$iBlueIOId = $aIO['IOId'];
						
					}
				}
				
				//----------------------------------------------------//
				//-- 3.3 - Verify All IOs were found                --//
				//----------------------------------------------------//
				//if( !($iModeIOId>0) ) {
				//	$bError    = true;
				//	$iErrCode  = 3;
				//	$sErrMesg .= "Can not find the 'Mode' IO.\n";
					
				//} else if( !($iRedIOId>0) ) {
				if( !($iRedIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Red' IO.\n";
					
				} else if( !($iGreenIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Green' IO.\n";
					
				} else if( !($iBlueIOId>0) ) {
					$bError    = true;
					$iErrCode  = 3;
					$sErrMesg .= "Can not find the 'Blue' IO.\n";
				}
				
				//----------------------------------------------------//
				//-- 3.4 - Perform Validation on the values         --//
				//----------------------------------------------------//
				
				//-- Make sure the Red is valid --//
				if( $iNewRed<0 || $iNewRed>255 ) {
					$bError    = true;
					$iErrCode  = 4;
					$sErrMesg .= "Please use a valid number for the 'Red' value!\n";
					$sErrMesg .= "Eg. 0-359!\n";
				}
				
				//-- Make sure the Green is valid --//
				if( $iNewGreen<0 || $iNewGreen>255 ) {
					$bError    = true;
					$iErrCode  = 5;
					$sErrMesg .= "Please use a valid number for the 'Green' value!\n";
					$sErrMesg .= "Eg. 0-255!\n";
				}
				
				//-- Make sure the Blue is valid --//
				if( $iNewBlue<0 || $iNewBlue>255 ) {
					$bError    = true;
					$iErrCode  = 6;
					$sErrMesg .= "Please use a valid number for the 'Blue' value!\n";
					$sErrMesg .= "Eg. 0-255!\n";
				}
				
			} catch( Exception $e03 ) {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg .= "Critical Error whith the IOs or their new values! \n";
				$sErrMesg .= "Problem when looking up the IOs or the ";
			}
		}
		
		//----------------------------------------------------------------//
		//-- 4.0 - UPDATE THE VALUES                                    --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			try {
				//--------------------------------//
				//-- CREATE UNIX TIMESTAMP      --//
				$iUTS = time();
				
				//--------------------------------//
				//-- MODE                       --//
				//if( $bError===false ) {
				//	$aTempFunctionResult1 = InsertNewIODataValue( $iModeIOId, $iUTS, $iNewMode );
					
				//	if( $aTempFunctionResult1['Error']===true ) {
				//		$bError     = true;
				//		$iErrCode   = 11;
				//		$sErrMesg  .= "Critical Error updating the \"Mode\" value!\n";
				//		$sErrMesg  .= $aTempFunctionResult1['ErrMesg'];
				//	}
				//}
				
				//--------------------------------//
				//-- RED                        --//
				if( $bError===false ) {
					$aTempFunctionResult2 = InsertNewIODataValue( $iRedIOId, $iUTS, $iNewRed );
					
					if( $aTempFunctionResult2['Error']===true ) {
						$bError     = true;
						$iErrCode   = 12;
						$sErrMesg  .= "Critical Error updating the \"Red\" value!\n";
						$sErrMesg  .= $aTempFunctionResult2['ErrMesg'];
					}
				}
				
				//--------------------------------//
				//-- GREEN                      --//
				if( $bError===false ) {
					$aTempFunctionResult3 = InsertNewIODataValue( $iGreenIOId, $iUTS, $iNewGreen );
					
					if( $aTempFunctionResult3['Error']===true ) {
						$bError     = true;
						$iErrCode   = 13;
						$sErrMesg  .= "Critical Error updating the \"Green\" value!\n";
						$sErrMesg  .= $aTempFunctionResult3['ErrMesg'];
					}
				}
				
				//--------------------------------//
				//-- BLUE                       --//
				if( $bError===false ) {
					$aTempFunctionResult4 = InsertNewIODataValue( $iBlueIOId, $iUTS, $iNewBlue );
					
					if( $aTempFunctionResult4['Error']===true ) {
						$bError     = true;
						$iErrCode   = 14;
						$sErrMesg  .= "Critical Error updating the \"Blue\" value!\n";
						$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
					}
				}
				
				
				
			} catch( Exception $e10 ) {
				$bError     = true;
				$iErrCode   = 10;
				$sErrMesg  .= "Critical Error inserting the new database IO values!\n";
				$sErrMesg  .= $e10->getMessage();
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                                   --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			return array(
				"Error"   => false,
				"Result"  => "Success"
			);
			
		} else {
			return array(
				"Error"   => true,
				"ErrCode" => $iErrCode,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	
	
}

?>