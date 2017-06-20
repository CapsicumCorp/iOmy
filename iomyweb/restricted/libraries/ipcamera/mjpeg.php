<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This Library contains function and a PHP Class that is used for connecting to "mjpeg" supported ip cameras.
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


class IPCamera {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sObjectState         = '';           //-- STRING:        Used to indicate what State that the Object is in (eg. Dealing with a non-database source or a source from the database )--//
	protected $aInitVars            = array();      //-- ARRAY:         Used to hold the variables that get passed during the initialisation --//
	protected $iLinkId              = 0;            //-- INTEGER:       Holds the LinkId of the desired IP Camera  --//
	protected $iThingId             = 0;            //-- INTEGER:       Holds the ThingId (as there should only be ever be 1)  --//
	
	
	public $bInitialised            = false;        //-- BOOLEAN:       --//
	public $aErrorMessges           = array();      //-- ARRAY:         --//
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT FUNCTIONS                                                                                        ==//
	//========================================================================================================================//
	public function __construct( $sMode, $aDeviceData ) {
		//----------------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                        --//
		//----------------------------------------------------//
		$sUrlAuthSection = "";
		
		try {
			//----------------------------------------------------//
			//-- 2.0 - SETUP VARIABLES                          --//
			//----------------------------------------------------//
			
			//-- 2.1 - MANDATORY VARIABLES --//
			$this->sObjectState       = $sMode;
				
				
			//-- 2.2 - OPTIONAL VARIABLES --//
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
				case "Non-DB":
					$this->bInitialised = true;
					break;
					
				case "DB":
					if( $this->iLinkId>=1 && $this->iThingId>=1 ) {
						$this->bInitialised = true;
						
					} else {
						//-- ERROR --//
						$this->aErrorMessges[] = "Problem with either the LinkId or the ThingId!";
					}
					break;
					
				default:
					$this->aErrorMessges[] = "Unregonized IP Camera Object State!";
			}
			
			
		} catch( Exception $e0230 ) {
			
		}
	}
	
	
	//========================================================================================================================//
	//== #3.0# - DESTRUCT FUNCTIONS                                                                                         ==//
	//========================================================================================================================//
	public function __destruct() {
		// nothing to do
	}
	
	
	//========================================================================================================================//
	//== #4.0# - CUSTOM FUNCTION FUNCTION                                                                          ==//
	//========================================================================================================================//
	public function CustomCommand( $sMode, $aData ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError         = false;
		$iErrCode       = 0;
		$sErrMesg       = "";
		$aResult        = array();  //-- ARRAY:         Stores the Result of the HTTP Request --//
		$sCommand       = "";
		
		try {
			//----------------------------------------------------------------//
			//-- 2.0 - Prepare                                              --//
			//----------------------------------------------------------------//
			
			
			//----------------------------------------------------------------//
			//-- 5.0 - Main Section                                         --//
			//----------------------------------------------------------------//
			switch( $sMode ) {
				case "TestStream":
					$aResult = $this->TestStream( $aData );
					break;
				
				case "BuildStream":
					$aResult = $this->TestStream( $aData );
					break;
					
				default:
					$bError    = false;
					$iErrCode  = 0;
					$sErrMesg  = "Unsupported Custom Command";
					
			}
		} catch( Exception $e01 ) {
			$bError    = false;
			$iErrCode  = 0;
			$sErrMesg  = "Unsupported Custom Command";
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			return $aResult;
		} else {
			return array(
				"Error" => true,
				"ErrCode" => $iErrCode,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	
	
	//========================================================================================================================//
	//== #5.0# - GET ALL CAPABILITIES FUNCTION                                                                              ==//
	//========================================================================================================================//
	public function BuildStreamUrl( $aData ) {
		//----------------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                        --//
		//----------------------------------------------------//
		$bError                 = false;
		$iErrCode               = 0;
		$sErrMesg               = "";
		
		$sNetworkAddress        = "";
		$iNetworkPort           = "";
		$sUsername              = "";
		$sPassword              = "";
		$sProtocol              = "";
		$sPath                  = "";
		
		$sUrlAuthSection        = "";
		$sUrl                   = "";
		
		
		//----------------------------------------------------//
		//-- 2.0 - EXTRACT VARIABLES                        --//
		//----------------------------------------------------//
		try {
			
			//-- Setup the URL --//
			if( isset( $aData['Username'] ) ) {
				$sUsername = $aData['Username'];
			}
			
			if( isset( $aData['Password'] ) ) {
				$sPassword = $aData['Password'];
			}
			
			
			$sProtocol       = $aData['Protocol'];
			$sNetworkAddress = $aData['NetworkAddress'];
			$iNetworkPort    = $aData['NetworkPort'];
			$sPath           = $aData['Path'];
			
			
		} catch( Exception $e0230 ) {
			$bError    = true;
			//$iErrCode  = 230;
			//$sErrMesg .= "Error Code:'0230' \n";
			$sErrMesg .= $e0230->getMessage();
		}
			
		//----------------------------------------------------//
		//-- 5.0 - BUILD THE URL                            --//
		//----------------------------------------------------//
		try {
			//-- Check if both Username and Password are present --//
			if( $sUsername!=="" && $sPassword!=="" ) {
				$sUrlAuthSection = $sUsername.":".$sPassword."@";
			} else {
				$sUrlAuthSection = "";
			}
			
			//-- Start creating the URL  --//
			if( $iNetworkPort!==false ) {
				//-- If the Port is present --//
				$sUrl = $sProtocol."://".$sUrlAuthSection.$sNetworkAddress.":".$iNetworkPort;
				
			} else {
				//-- Default Port --//
				$sUrl = $sProtocol."://".$sUrlAuthSection.$sNetworkAddress;
			}
			
			//-- Add the Path to the Url--//
			if( $sPath!=="" && $sPath!=="/" ) {
				$sUrl .= "/".$sPath;
			}
			
		} catch( Exception $e0230 ) {
			$this->aErrorMessges[] = "InitialConnection: Failed to setup!";
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			return array(
				"Error"   => false,
				"sUrl"    => $sUrl
			);
		} else {
			return array(
				"Error"   => true,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	
	
	public function FetchStreamUrl() {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		
		//-- 1.1 - Declare variables --//
		$bError             = false;
		$sErrMesg           = "";
		$aResult            = array();
		$iUTS               = time();
		
		
		$iMostRecentValue   = 0;                    //-- INTEGER:   Used to hold the most recent value's timestamp --//
		
		$sNetworkAddress    = "";
		$sNetworkPort       = "";
		$sUsername          = "";
		$sPassword          = "";
		$sUrlPath           = "";
		$sUrlProtocol       = "";
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DB" ) {
			$bError    = true;
			$sErrMesg  = "IP Camera Object is not setup to be able to perform this request!";
		}
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			$aIOsTemp           = GetIOsFromThingId( $this->iThingId );
			
			if( $aIOsTemp['Error']===false ) {
				foreach( $aIOsTemp['Data'] as $aIO ) {
					
					if( 
						$aIO['RSTypeId']===3960     || $aIO['RSTypeId']===3961     || 
						$aIO['RSTypeId']===3962     || $aIO['RSTypeId']===3963     || 
						$aIO['RSTypeId']===3964     || $aIO['RSTypeId']===3965     
					) {
						
						//-- Get the most recent value from that IO --//
						$aTempResult = GetIODataMostRecent( $aIO['DataTypeId'], $aIO['IOId'], $iUTS );
						
						//-- IF No errors have occurred in the function results --//
						if( $aTempResult['Error']===false ) {
							//--  --//
							if( isset($aTempResult['Data']['Value']) ) {
								switch( $aIO['RSTypeId'] ) {
									//----------------------------//
									//-- Network Address        --//
									//----------------------------//
									case 3960:
										$sNetworkAddress = $aTempResult['Data']['Value'];
										break;
									
									//----------------------------//
									//-- Network Port           --//
									//----------------------------//
									case 3961:
										$sNetworkPort    = $aTempResult['Data']['Value'];
										break;
									
									//----------------------------//
									//-- Username               --//
									//----------------------------//
									case 3962:
										$sUsername       = $aTempResult['Data']['Value'];
										break;
									
									//----------------------------//
									//-- Password               --//
									//----------------------------//
									case 3963:
										$sPassword       = $aTempResult['Data']['Value'];
										break;
										
									//----------------------------//
									//-- Path                   --//
									//----------------------------//
									case 3964:
										$sUrlPath        = $aTempResult['Data']['Value'];
										break;
									
									//----------------------------//
									//-- Protocol               --//
									//----------------------------//
									case 3965:
										$sUrlProtocol    = $aTempResult['Data']['Value'];
										break;
									
										
								}	//-- ENDSWITCH --//
							}	//-- ENDIF Valid UoMId is passed (No UoM in the results is just a response when there is no data)--//
						}	//-- ENDIF --//
					}	//-- ENDIF Valid Weather RSTYPE --//
				}
			}	//-- ENDFOREACH IO --//
		}	//-- ENDIF No Errors --//
		
		
		if( $bError===false ) {
			
			$aTemp1 = array(
				"Username"       => $sUsername,
				"Password"       => $sPassword,
				"NetworkAddress" => $sNetworkAddress,
				"NetworkPort"    => $sNetworkPort,
				"Path"           => $sUrlPath,
				"Protocol"       => $sUrlProtocol
			);
			
			$aTemp2 = $this->BuildStreamUrl( $aTemp1 );
			
			if( $aTemp2['Error']===false ) {
				//-- Extract Results --//
				$sStreamUrl = $aTemp2['sUrl'];
			} else {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 1;
				$sErrMesg .= "Failed to make the Stream Url!";
				$sErrMesg .= $aTemp2['ErrMesg'];
			}
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 9.0 - PARSE THE JSON REPONSE                                             --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			return array( 
				"Error" => false, 
				"Data"  => array(
					"sUrl"  => $sStreamUrl
				)
			);
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}

	}
	
	public function TestStream( $aData ) {
		//--------------------------------------------------------------------------------------------//
		//-- DESCRIPTION:  --//
		//--       --//
		//--------------------------------------------------------------------------------------------//
		
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError          = false;
		$sErrMesg        = "";
		
		$sTemp           = "";
		$sData           = "";
		$iStreamStart    = 0;
		$iStreamOffset   = 0;
		$iFrameStart     = 0;
		$iFrameEnd       = 0;
		$sFrame          = "";
		$aTemp1          = array();
		$aTemp2          = array();
		$sDividerWindows = "\r\n--";
		$sDividerLinux   = "\n--";
		$oFile           = false;
		
		
		error_reporting(E_ERROR | E_PARSE);
		//----------------------------------------//
		//-- 2.0 - BUILD THE STREAM URL         --//
		//----------------------------------------//
		if( $this->sObjectState==="Non-DB") {
			$aTemp1 = $this->BuildStreamUrl($aData);
			
			if( $aTemp1['Error']===false ) {
				//-- Extract Results --//
				$sStreamUrl = $aTemp1['sUrl'];
			} else {
				//-- Error --//
				$bError    = true;
				$iErrCode  = 1;
				$sErrMesg .= "Failed to make the Stream Url!";
				$sErrMesg .= $aTemp1['ErrMesg'];
			}
		} else {
			//-- Extract from data parameter --//
			$sStreamUrl = $aData['$sStreamUrl'];
		}
		
		//----------------------------------------//
		//-- Open the Stream                    --//
		//----------------------------------------//
		try {
			$oFile = fopen( $sStreamUrl, "r" );
			
			if( !$oFile ) {
				$bError    = true;
				$iErrCode  = 2;
				$sErrMesg  = "Failed to open stream!";
				
			} else {
				//------------------------------------//
				//-- Extract the Content            --//
				//------------------------------------//
				while( substr_count( $sData,"Content-Length" )!=2 ) {
					$sTemp    = fread( $oFile, 512 );
					$sData   .= $sTemp;
					$aTemp2[] = $sTemp;
				}
				
				//------------------------------------//
				//-- WINDOWS FORMAT                 --//
				//------------------------------------//
				$iStreamStart = strpos( $sData, $sDividerWindows );
				
				//-- IF Windows Format --//
				if( $iStreamStart!==false ) {
					preg_match('/Content-Length:\s*[0-9]*\s*/', $sData, $aFirstConLength );
					if( isset( $aFirstConLength[0] ) ) {
						$sFirstConLength = $aFirstConLength[0];
						$iStreamStart    = strpos( $sData, $sFirstConLength );
						$iStreamOffset   = strlen( $sFirstConLength );
						$iFrameStart     = $iStreamStart+$iStreamOffset;
						$iFrameEnd       = strpos( $sData, $sDividerWindows, $iFrameStart );
						$sFrame          = substr( $sData, $iFrameStart, $iFrameEnd );
					} else {
						//-- Error: Failed to find Content-Length --//
						$bError    = true;
						$iErrCode  = 3;
						$sErrMesg .= "Error Code:'0000'\n";
						$sErrMesg .= "Failed to extract the Content-Length from the MJPEG Stream.\n";
						$sErrMesg .= "\n";
					}
				//-- ELSE Try other formats --//
				} else {
					//------------------------------------//
					//-- UNIX FORMAT                    --//
					//------------------------------------//
					$iStreamStart = strpos( $sData, $sDividerLinux );
					//-- IF Unix Format --//
					if( $iStreamStart!==false ) {
						preg_match('/Content-Length:\s*[0-9]*\s*/', $sData, $aFirstConLength );
						if( isset( $aFirstConLength[0] ) ) {
							$sFirstConLength = $aFirstConLength[0];
							$iStreamStart    = strpos( $sData, $sFirstConLength );
							$iStreamOffset   = strlen( $sFirstConLength );
							$iFrameStart     = $iStreamStart+$iStreamOffset;
							$iFrameEnd       = strpos( $sData, $sDividerLinux, $iFrameStart );
							$sFrame          = substr( $sData, $iFrameStart, $iFrameEnd );
						} else {
							//-- Error: Failed to find Content-Length --//
							$bError    = true;
							$iErrCode  = 4;
							$sErrMesg .= "Error Code:'0000'\n";
							$sErrMesg .= "Failed to extract the Content-Length from the MJPEG Stream.\n";
							$sErrMesg .= "\n";
						}
					} else {
						//-- Error: Unknown MJPEG Stream --//
						$bError    = true;
						$iErrCode  = 5;
						$sErrMesg .= "Error Code:'0000'\n";
						$sErrMesg .= "Unknown type of MJPEG Stream.\n";
						$sErrMesg .= "\n";
					}
				}
				
				//-- Close the stream --//
				fclose($oFile);
				
				if( $bError===false ) {
					header("Content-type: image/jpeg");
					echo $sFrame;
					die();
				}
			}
		} catch( Exception $e1 ) {
			$bError    = true;
			$iErrCode  = 0;
			$sErrMesg .= "Error Code:'0000'\n";
			$sErrMesg .= "Critical Error.\n";
			$sErrMesg .= "\n";
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if( $bError===false ) {
			return array(
				"Error"   => false
			);
		} else {
			return array(
				"Error"   => true,
				"ErrCode" => $iErrCode,
				"ErrMesg" => $sErrMesg
			);
		}
	}
	

	
	//================================================================================================//
	//== ADD THE CURRENT BRIDGE TO DATABASE                                                         ==//
	//================================================================================================//
	public function AddToTheDatabase( $iCommId, $aData ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError                 = false;
		$iErrCode               = 0;
		$sErrMesg               = "";
		
		$iLinkType              = 0;                //-- INTEGER:   Used to hold the "IP Camera Link Type" constant. --//
		$iThingType             = 0;                //-- INTEGER:   Used to hold the "IP Camera MJPEG Thing Type" constant. --//
		$bTransactionStarted    = false;            //-- BOOLEAN:   Used to indicate is a database transaction has been started or not. --//
		
		$sNetworkAddress        = "";
		$iNetworkPort           = "";
		$sUsername              = "";
		$sPassword              = "";
		$sProtocol              = "";
		$sPath                  = "";
		$sModelId               = "";
		$sSerialCode            = "";
		$sManufacturer          = "";
		
		$aCheckLink             = array();          //-- ARRAY:     --//
		$aLinkData              = array();          //-- ARRAY:     --//
		$aLinkResult            = array();
		$aIOInfoTemp            = array();          //-- ARRAY:     
		$aInsertResult          = array();          //-- ARRAY:     Used to hold the result of the insert IO data function. --//
		$aResult                = array();          //-- ARRAY:     The result that his function returns. --//
		
		//-- Declare global variables --//
		global $oRestrictedApiCore;
		
		
		
		try {
			//----------------------------------------------------------------//
			//-- 2.0 - LOOKUP IPCAMERA LINK TYPE                            --//
			//----------------------------------------------------------------//
			$iLinkType      = LookupFunctionConstant("IPCameraLinkTypeId");
			$iThingType     = LookupFunctionConstant("IPCameraMJPEGThingTypeId");
			
			
			//----------------------------------------------------------------//
			//-- 3.0 - SETUP VARIABLES                                      --//
			//----------------------------------------------------------------//
			
			//-- 3.1 - Check the Object state --//
			if( $bError===false ) {
				if( $this->sObjectState!=="Non-DB" ) {
					$bError   = true;
					$iErrCode = 1;
					$sErrMesg = "This Object is not setup to be able to add itself to the database";
				}
			}
			
			//-- 3.2 - Validate Parameters --//
			if( $bError===false ) {
				
				//-- Parse the Data --//
				$aParsedData     = $this->ValidateData($aData);
				
				
				if( $aParsedData['Error']===false ) {
					$sUsername         = $aParsedData['Data']['Username'];
					$sPassword         = $aParsedData['Data']['Password'];
					$sNetworkAddress   = $aParsedData['Data']['NetworkAddress'];
					$iNetworkPort      = $aParsedData['Data']['NetworkPort'];
					$sPath             = $aParsedData['Data']['Path'];
					$sProtocol         = $aParsedData['Data']['Protocol'];
					
				} else {
					$bError      = true;
					$sErrMesg   .= "Failed to validate the parameters!\n";
					$sErrMesg   .= $aParsedData['ErrMesg'];
				}
			}
			
			//-- 3.3 - Setup the Device's Link info --//
			if( $bError===false ) {
				$sLinkName       = "IP Camera MJPEG";
				$sInfoName       = "IP Camera MJPEG";
				$sInfoManu       = "";
				$sConnAddress    = $sNetworkAddress;
			}
			
			//----------------------------------------------------------------//
			//-- 4.0 - Make sure that the Bridge isn't in the database      --//
			//----------------------------------------------------------------//
			if($bError===false) {
				$aCheckLink = CheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sConnAddress, $sInfoName );
				
				if( $aCheckLink!==false ) {
					$bError     = true;
					$iErrCode   = 2;
					$sErrMesg   = "The Device(Link) already exists in the database\n";
				}
			}
			
			//----------------------------------------------------------------//
			//-- 5.0 - Create the IP Camera Link                            --//
			//----------------------------------------------------------------//
			if($bError===false) {
				$aLinkData = array(
					"CommId"                => $iCommId,
					"Type"                  => $iLinkType,
					"SerialCode"            => "",
					"Displayname"           => $sInfoName,
					"State"                 => "1",
					"InfoName"              => $sInfoName,
					"InfoManufacturer"      => $sInfoManu,
					"InfoManufacturerUrl"   => "",
					"ConnFrequencyId"       => "1",
					"ConnProtocolId"        => "1",
					"ConnCryptTypeId"       => "1",
					"ConnAddress"           => $sConnAddress,
					"ConnPort"              => $iNetworkPort,
					"ConnName"              => "IP Camera MJPEG",
					"ConnUsername"          => $sUsername,
					"ConnPassword"          => $sPassword,
					"Things"                => array(
						array(
							"Type"          => $iThingType,
							"Name"          => "IP Camera MJPEG",
							"State"         => 1,
							"HWId"          => 0,
							"OutputHWId"    => 0,
							"IOs"           => array(
								array(
									"RSType"            => "3960",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Network Address",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								),
								array(
									"RSType"            => "3961",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Network Port",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								),
								array(
									"RSType"            => "3962",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Username",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								),
								array(
									"RSType"            => "3963",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Password",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								),
								array(
									"RSType"            => "3964",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Path",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								),
								array(
									"RSType"            => "3965",
									"UoM"               => "1",
									"Type"              => "6",
									"Name"              => "Protocol",
									"BaseConvert"       => "1",
									"SampleRate"        => "-1",
									"SampleRateMax"     => "-1",
									"SampleRateLimit"   => "-1"
								)
							)
						)
					)
				);
				
				//------------------------//
				//-- DEBUGGING          --//
				//echo "\n";
				//var_dump($aLinkData);
				//echo "\n";
				//-- END DEBUGGING      --//
				//------------------------//
			}
		} catch( Exception $e3 ) {
			$bError    = true;
			$iErrCode  = 3;
			$sErrMesg .= $e3->getMessage();
		}
		
		//----------------------------------------------------------------//
		//-- 6.0 - ADD THE BRIDGE TO THE DATABASE                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
			
			if( $bTransactionStarted===false ) {
				$bError    = true;
				$iErrCode  = 16;
				$sErrMesg .= "Database Error! \n";
				$sErrMesg .= "Problem when trying to start the transaction! \n";
			} else {
				$aLinkResult = PrepareAddNewLink( $aLinkData );
			
				if( $aLinkResult['Error']===true ) {
					//--------------------------------------------//
					//-- Flag that an error occurred            --//
					//--------------------------------------------//
					$bError = true;
					$iErrCode  = 5;
					$sErrMesg .= "Problem adding the device to the database! \n";
					$sErrMesg .= $aLinkResult['ErrMesg'];
				}
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 7.0 - Insert the Profile Names and URLs into the database      --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			
			//-- Store the current time --//
			$iUTS = time();
			
			//----------------------------------------------------------------//
			//-- Foreach IO add the appropriate value to the database       --//
			//----------------------------------------------------------------//
			foreach( $aLinkResult['Data']['Things'] as $aThing ) {
				foreach( $aThing['IOs'] as $iIOId ) {
					if( $bError===false ) {
						if( $iIOId!==null && $iIOId!==false && $iIOId>0 ) {
							//----------------------------------------------------------------//
							//-- Lookup the IO Info                                         --//
							//----------------------------------------------------------------//
							$aIOInfoTemp = GetIOInfo( $iIOId );
							
							if( $aIOInfoTemp['Error']===true ) {
								$bError    = true;
								$iErrCode  = 6;
								$sErrMesg .= "Problem looking up one of the new IO! \n";
								$sErrMesg .= $aIOInfoTemp["ErrMesg"];
							}
							
							//----------------------------------------------------------------//
							//-- Insert the appropriate value                               --//
							//----------------------------------------------------------------//
							if( $bError===false ) {
								if( isset( $aIOInfoTemp['Data']['RSTypeId'] ) ) {
									//----------------------------//
									//-- Check the RSType       --//
									//----------------------------//
									switch( $aIOInfoTemp['Data']['RSTypeId'] ) {
										//-- Network Address --//
										case 3960:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sNetworkAddress, true );
											break;
											
										//-- Network Port --//
										case 3961:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $iNetworkPort, true );
											break;
											
										//-- Username --//
										case 3962:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sUsername, true );
											break;
											
										//-- Password --//
										case 3963:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sPassword, true );
											break;
											
										//-- Path --//
										case 3964:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sPath, true );
											break;
											
										//-- Protocol --//
										case 3965:
											$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sProtocol, true );
											break;
											
										//-- Unknown Id --//
										default:
											//$aInsertResult = array( 
											//	"Error"   => true,
											//	"ErrMesg" => "Unknown RSTypeId!"
											//);
											break;
										
									}	//-- ENDSWITCH  --//
									
									//----------------------------//
									//-- Check for Errors       --//
									//----------------------------//
									if( $aInsertResult['Error']===true ) {
										$bError    = true;
										$sErrMesg .= "Error inserting data in the new IOs!\n";
										//$sErrMesg .= $aInsertResult['ErrMesg'];
										//$sErrMesg .= "\n";
									}
								}	//-- ENDIF RSTypeId is present --//
							}	//-- ENDIF No errors have occurred --//
						}
					}	//-- ENDIF No errors --//
				}	//-- ENDFOREACH IO --//
			}	//-- ENDFOREACH THING --//
		}	//-- ENDIF No errors --//
		
		
		//--------------------------------------------------------------------//
		//-- 8.0 - Insert the Profile Names and URLs into the database      --//
		//--------------------------------------------------------------------//
		if($bTransactionStarted===true) {
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
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aLinkResult['Data'] );
			
		} else {
			//-- Error Occurred --//
			return array( 
				"Error"   => true, 
				"ErrCode" => $iErrCode,
				"ErrMesg" => $sErrMesg 
			);
		}
	} //-- ENDFUNCTION AddToTheDatabase --//
	
	
	private function ValidateData( $aData ) {
		//------------------------------------------------------------------------------//
		//-- 1.0 - DECLARE VARIABLES                                                  --//
		//------------------------------------------------------------------------------//
		$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
		$sErrMesg                   = "";           //-- STRING:        Used to contain the error message if an error gets caught. --//
		$aResult                    = array();      //-- ARRAY:         Used to hold the result that this function returns if successful. --//
		
		$sNetworkAddress            = "";
		$iNetworkPort               = 0;
		$sUsername                  = "";
		$sPassword                  = "";
		$sProtocol                  = "";
		$sPath                      = "";
		
		//------------------------------------------------------------------------------//
		//-- 4.0 - Optional Variables                                                 --//
		//------------------------------------------------------------------------------//
		
		//-- 4.1 - Username (Optional)  --//
		if( isset( $aData['Username'] ) ) {
			if( $aData['Username']!==null && $aData['Username']!==false && is_string( $aData['Username'] ) ) {
				
				$sUsername = $aData['Username'];
			}
		}
		
		
			
		//-- 4.2 - Password (Optional) --//
		if( isset( $aData['Password'] ) ) {
			if( $aData['Username']!==null && $aData['Username']!==false && is_string( $aData['Password'] ) ) {
				$sPassword = $aData['Password'];
			}
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 5.0 - Mandatory Variables                                                --//
		//------------------------------------------------------------------------------//
		
		//------------------------------------//
		//-- 5.1 - Network Address          --//
		if( $bError===false ) {
			if( isset( $aData['NetworkAddress'] ) ) {
				//-- Check if it is a string --//
				if( is_string( $aData['NetworkAddress'] ) ) {
					//-- Extract the variable --//
					$sNetworkAddress = $aData['NetworkAddress'];
					
				} else {
					//-- ERROR: Invalid String --//
					$bError    = true;
					$sErrMesg .= "The \"NetworkAddress\" is not a valid string! \n";
				}
			} else {
				//-- ERROR: Failed to find the element in the array --//
				$bError    = true;
				$sErrMesg .= "Failed to find the \"NetworkAddress\" in the array! \n";
			}
		}
		
		//------------------------------------//
		//-- 5.2 - Network Port             --//
		if( $bError===false ) {
			if( isset( $aData['NetworkPort'] ) ) {
				//-- Check if it is numeric --//
				if( is_numeric( $aData['NetworkPort'] ) ) {
					//-- Convert to an Integer --//
					$iNetworkPort = intval( $aData['NetworkPort'] );
					
					
				} else {
					//-- ERROR: Invalid String --//
					$bError    = true;
					$sErrMesg .= "The \"NetworkPort\" is not a valid string! \n";
				}
			} else {
				//-- ERROR: Failed to find the element in the array --//
				$bError    = true;
				$sErrMesg .= "Failed to find the \"NetworkPort\" in the array! \n";
			}
		}
		
		//------------------------------------//
		//-- 5.3 - Path                     --//
		if( $bError===false ) {
			if( isset( $aData['Path'] ) ) {
				//-- Check if it is a string --//
				if( is_string( $aData['Path'] ) ) {
					//-- Extract the variable --//
					$sPath = $aData['Path'];
					
				} else {
					//-- ERROR: Invalid String --//
					$bError    = true;
					$sErrMesg .= "The \"Path\" is not a valid string! \n";
				}
			} else {
				//-- ERROR: Failed to find the element in the array --//
				$bError    = true;
				$sErrMesg .= "Failed to find the \"Path\" in the array! \n";
			}
		}
		
		//------------------------------------//
		//-- 5.4 - Protocol                 --//
		if( $bError===false ) {
			if( isset( $aData['Protocol'] ) ) {
				//-- Check if it is a string --//
				if( is_string( $aData['Protocol'] ) ) {
					//-- Extract the variable --//
					$sProtocol = $aData['Protocol'];
					
				} else {
					//-- ERROR: Invalid String --//
					$bError    = true;
					$sErrMesg .= "The \"Protocol\" is not a valid string! \n";
				}
			} else {
				//-- ERROR: Failed to find the element in the array --//
				$bError    = true;
				$sErrMesg .= "Failed to find the \"Protocol\" in the array! \n";
			}
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 9.0 - PARSE THE JSON REPONSE                                             --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			//--------------------------------//
			//-- 9.A - SUCCESS              --//
			//--------------------------------//
			return array( 
				"Error" => false, 
				"Data"  => array(
					"Username"       => $sUsername,
					"Password"       => $sPassword,
					"NetworkAddress" => $sNetworkAddress,
					"NetworkPort"    => $iNetworkPort,
					"Path"           => $sPath,
					"Protocol"       => $sProtocol
				)
			);
		} else {
			//--------------------------------//
			//-- 9.B - FAILURE              --//
			//--------------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	public function UpdateDeviceDetails( $aData ) {
		//------------------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                                         --//
		//------------------------------------------------------------------------------//
		$bError                     = false;        //-- BOOLEAN:       Used to indicate if an error has been caught. --//
		$sErrMesg                   = "";           //-- STRING:        Used to contain the error message if an error gets caught. --//
		$aResult                    = array();      //-- ARRAY:         Used to hold the result that this function returns if successful. --//
		
		$iUTS                       = time();       //-- INTEGER:       Holds the Current Unix Timestamp.  --//
		$aIOList                    = array();      //-- ARRAY:         Holds the IOs that this Thing has. --//
		$aThingInfo                 = array();      //-- ARRAY:         --//
		$aInsertErrMesgs            = array();      //-- ARRAY:         --//
		
		$sUsername                  = "";           //-- STRING:        --//
		$sPassword                  = "";           //-- STRING:        --//
		$sNetworkAddress            = "";           //-- STRING:        --//
		$iNetworkPort               = 0;            //-- INTEGER:       --//
		$sPath                      = "";           //-- STRING:        --//
		$sProtocol                  = "";           //-- STRING:        --//
		
		$bNetworkAddressSubmit      = false;        //-- BOOLEAN:       --//
		$bNetworkPortSubmit         = false;        //-- BOOLEAN:       --//
		$bUsernameSubmit            = false;        //-- BOOLEAN:       --//
		$bPasswordSubmit            = false;        //-- BOOLEAN:       --//
		$bPathSubmit                = false;        //-- BOOLEAN:       --//
		$bProtocolSubmit            = false;        //-- BOOLEAN:       --//
		
		
		//-- Constants --//
		$iNetworkAddressRSTypeId    = LookupFunctionConstant("StreamNetworkAddressRSTypeId");
		$iNetworkPortRSTypeId       = LookupFunctionConstant("StreamNetworkPortRSTypeId");
		$iNetworkUsernameRSTypeId   = LookupFunctionConstant("StreamUsernameRSTypeId");
		$iNetworkPasswordRSTypeId   = LookupFunctionConstant("StreamPasswordRSTypeId");
		$iStreamPathRSTypeId        = LookupFunctionConstant("StreamPathRSTypeId");
		$iStreamProtocolRSTypeId    = LookupFunctionConstant("StreamProtocolRSTypeId");
		
		
		//------------------------------------------------------------------------------//
		//-- 2.0 - CHECK TO MAKE SURE THIS OBJECT CAN POLL DATA                       --//
		//------------------------------------------------------------------------------//
		if( $this->sObjectState!=="DB" ) {
			$bError    = true;
			$sErrMesg  = "IP Camera Object is not setup to be able to perform this request!";
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 3.0 - CHECK THE THING PERMISSIONS                                        --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			$aThingInfo = GetThingInfo( $this->iThingId );
			
			if( $aThingInfo['Error']===false ) {
				if( !($aThingInfo['Data']['PermWrite']>=1) ) {
					//-- ERROR: User is missing the Write Permission --//
					$bError    = true;
					$sErrMesg .= "Insufficient permissions!\n";
					$sErrMesg .= "Your user doesn't appear to have the \"Write\" permission needed to perform this operation.\n";
				}
			} else {
				//-- ERROR: Failed to lookup the Thing Info --//
				$bError    = true;
				$sErrMesg .= "Can not retrieve the Thing Info.\n";
				$sErrMesg .= $aThingInfo['ErrMesg'];
			}
		}
		//------------------------------------------------------------------------------//
		//-- 4.0 - EXTRACT THE VARIABLES AND TEST THE STREAM                          --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			//-- Parse the Data --//
			$aParsedData     = $this->ValidateData($aData);
			
			
			if( $aParsedData['Error']===false ) {
				$sUsername         = $aParsedData['Data']['Username'];
				$sPassword         = $aParsedData['Data']['Password'];
				$sNetworkAddress   = $aParsedData['Data']['NetworkAddress'];
				$iNetworkPort      = $aParsedData['Data']['NetworkPort'];
				$sPath             = $aParsedData['Data']['Path'];
				$sProtocol         = $aParsedData['Data']['Protocol'];
				
			} else {
				$bError      = true;
				$sErrMesg   .= "Failed to validate the parameters!\n";
				$sErrMesg   .= $aParsedData['ErrMesg'];
			}
		}
		
		//------------------------------------------------------------------------------//
		//-- 5.0 -                                                                    --//
		//------------------------------------------------------------------------------//
		if( $bError===false ) {
			$aIOList = GetIOsFromThingId( $this->iThingId );
			
			//-- Check for errors --//
			if( $aIOList['Error']===false ) {
			
				//-----------------------------------------------------------------------------------------//
				//-- Verify that the desired IO Ids are found and stored to their appropiate variables   --//
				//-----------------------------------------------------------------------------------------//
				foreach( $aIOList['Data'] as $aIO ) {
					//------------------------------------//
					//-- Stream Network Address         --//
					//------------------------------------//
					if( $aIO['RSTypeId']===$iNetworkAddressRSTypeId ) {
						
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sNetworkAddress );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Network Address\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bNetworkAddressSubmit     = true;
							$aResult['NetworkAddress'] = array( "Success"=>true );
						}
						
					//------------------------------------//
					//-- Stream Network Port            --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iNetworkPortRSTypeId ) {
						
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $iNetworkPort );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Network Port\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bNetworkPortSubmit     = true;
							$aResult['NetworkPort'] = array( "Success"=>true );
						}
						
					//------------------------------------//
					//-- Stream Username                --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iNetworkUsernameRSTypeId ) {
						
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sUsername );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Username\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bUsernameSubmit     = true;
							$aResult['Username'] = array( "Success"=>true );
						}
						
					//------------------------------------//
					//-- Stream Password                --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iNetworkPasswordRSTypeId ) {
						
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sPassword );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Password\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bPasswordSubmit = true;
							$aResult['Password'] = array( "Success"=>true );
						}
						
					//------------------------------------//
					//-- Stream Path                    --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iStreamPathRSTypeId ) {
						
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sPath );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Path\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bPathSubmit = true;
							$aResult['Path'] = array( "Success"=>true );
						}
						
					//------------------------------------//
					//-- Stream Protocol                --//
					//------------------------------------//
					} else if( $aIO['RSTypeId']===$iStreamProtocolRSTypeId ) {
						$aTempFunctionResult = InsertNewIODataValue( $aIO['IOId'], $iUTS, $sProtocol );
						
						if( $aTempFunctionResult['Error']===true ) {
							$aInsertErrMesgs[] = "Problem submitting the \"Protocol\" to the Database! ".$aTempFunctionResult['ErrMesg'];
						} else {
							$bProtocolSubmit = true;
							$aResult['Protocol'] = array( "Success"=>true );
						}
					}
				} //-- END Foreach --//
				
			} else {
				//-- Display the error --//
				$bError = true;
				$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
				$sErrMesg .= $aWeatherIOs['ErrMesg'];
			}
		}
		
		
		//------------------------------------------------------------------------------//
		//-- 7.0 - CHECK TO SEE IF AN INSERT FAILED                                   --//
		//------------------------------------------------------------------------------//
		if( $bError===false) {
			if( count($aInsertErrMesgs)>=1 ) {
				//-- Flag an Error --//
				$bError    = true;
				//-- Add all the insert error messsages --//
				foreach( $aInsertErrMesgs as $sInsertErrMesg ) {
					$sErrMesg .= "Problem submitting the \"Network address\" to the Database! ";
				}
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
	
}
	
?>