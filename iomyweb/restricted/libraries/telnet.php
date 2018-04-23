<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This Class is used for using telnet to the Hub and supported devices.
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


class PHPTelnet {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sNetworkAddress      = '';           //-- STRING:        Used to hold the IP Address or Network name of the Device.  --//
	protected $sNetworkPort         = '';           //-- STRING:        Used to hold the IP Port that is used for Telent.           --//
	protected $sTelnetType          = '';           //-- STRING:        --//
	protected $iDebuggingType       = 0;            //-- INTEGER:       This sets what DebuggingType to use. 0=None; 1=DebuggingArrayOnly; 2=OutputAll --//
	protected $aOptions             = array();      //-- ARRAY:         --//
	
	protected $iSockErrNo           = 0;            //-- INTEGER:       --//
	protected $sSockErrStr          = "";           //-- STRING:        --//
	
	protected $sDeviceOnvifUrl      = '';           //-- STRING:        --//
	protected $iDeltaTime           = 0;            //-- INTEGER:       --//
	protected $aDateAndTime         = array();      //-- ARRAY:         --//
	
	public $bInitialised            = false;        //-- BOOLEAN:       --//
	public $aErrorMessges           = array();      //-- ARRAY:         --//
	public $aDebuggingLogs          = array();      //-- ARRAY:         --//
	
	
	protected $oSocket              = null;         //-- OBJECT:        --//
	
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT FUNCTIONS                                                                                        ==//
	//========================================================================================================================//
	public function __construct( $sIPAddress, $sIPPort="23", $sTelnetType="WatchInputs", $iDebuggingType=0, $aOptions=array() ) {
		//----------------------------------------------------------------//
		//-- 1.0 - Initialise                                           --//
		//----------------------------------------------------------------//
		
		$iSockErrNo             = 0;
		$sSockErrStr            = "";
		
		//----------------------------------------------------------------//
		//-- 2.0 - Store certain construction parameters                --//
		//----------------------------------------------------------------//
		$this->sNetworkAddress  = $sIPAddress;
		$this->sNetworkPort     = $sIPPort;
		$this->sTelnetType      = $sTelnetType;
		$this->iDebuggingType   = $iDebuggingType;
		$this->aOptions         = $aOptions;
		
		//$this->sUsername        = $sUsername;
		//$this->sPassword        = $sPassword;
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - Begin                                                --//
		//----------------------------------------------------------------//
		try {
			//------------------------------------//
			//-- Setup the Socket Object        --//
			//------------------------------------//
			error_reporting(E_ALL ^ E_WARNING);
			
			$this->oSocket = fsockopen( $sIPAddress, $sIPPort, $this->iSockErrNo, $this->sSockErrStr, 2 );
			
			
			//-- Check that the Socket object is not false --//
			if( $this->oSocket ) {
				
				stream_set_blocking( $this->oSocket, 1 );
				stream_set_timeout( $this->oSocket, 2 );
				
				//--------------------------------------------------------//
				//-- IF Type is WatchInputs                             --//
				//--------------------------------------------------------//
				if( $this->sTelnetType==="WatchInputs" ) {
					//-- Perform Login --//
					$aLoginTemp = $this->FetchRows( "watchinputslogin", 64, 3, false, false );
					
					if( is_array( $aLoginTemp ) ) {
						if( count( $aLoginTemp )>=1 ) {
							$aLastOutput = array_slice( $aLoginTemp, -1 );
							
							if( isset( $aLastOutput[0] ) && $aLastOutput[0]===">") {
								$this->bInitialised = true;
							}
						}
					}
					
					//echo "\n^^^^^^^^^^^\n";
					//var_dump( $aLoginTemp );
					//echo "\n^^^^^^^^^^^\n";
					
				//--------------------------------------------------------//
				//-- ELSE flag that this is initialised                 --//
				//--------------------------------------------------------//
				} else {
					$this->bInitialised = true;
				}
				
			} else {
				//-- Error --//
				//echo "Failed to connect!\nError ".$iSockErrNo.":".$sSockErrStr;
				$this->aErrorMessges[] = "Failed to connect!\nError ".$iSockErrNo.":".$sSockErrStr;
			}
			
			
		} catch( Exception $e0001 ) {
			//-- Flag that an error occurred --//
			$this->bInitialised = false;
			$this->aErrorMessges[] = "Critical error in fsock!\n".$e0001->getMessage();
			
		}
	}
	
	
	//========================================================================================================================//
	//== #3.0# - DESTRUCT FUNCTIONS                                                                                         ==//
	//========================================================================================================================//
	public function __destruct() {
		//-- Close the Connection --//
		if( $this->oSocket ) {
			fclose( $this->oSocket );
		}
	}
	
	
	
	public function AddToDebuggingLog( $aLog ) {
		try {
			switch( $this->iDebuggingType ) {
				//------------------------------------//
				//-- IF Add to debugging array      --//
				//------------------------------------//
				case 1:
					//-- Add to the Logs --//
					$this->aDebuggingLogs[] = $aLog;
					
					//-- Success --//
					return true;
					
					break;
					
				
				//------------------------------------//
				//-- IF Output debugging            --//
				//------------------------------------//
				case 2:
					//-- Add to the Logs --//
					$this->aDebuggingLogs[] = $aLog;
					
					//-- Output the debugging --//
					if( is_string( $aLog ) ) {
						echo $aLog."\n";
					} else {
						echo json_encode( $aLog );
						echo "\n";
					}
					
					//-- Success --//
					return true;
					
					break;
					
				//------------------------------------//
				//-- IF do nothing                  --//
				//------------------------------------//
				case 0:
					//-- Do nothing but return success --//
					return true;
					
					break;
			}
			
		} catch( Exception $e0001 ) {
			//-- Return that an error occurred --//
			return false;
		}
		
		//--------------------------------//
		//-- Return that it failed      --//
		//--------------------------------//
		return false;
	}
	
	
	//========================================================================================================================//
	//== #4.0# - INPUT FUNCTIONS                                                                                            ==//
	//========================================================================================================================//
	public function WriteArray($aInputArray) {
		//------------------------------------//
		//-- 1 - Initialise                 --//
		//------------------------------------//
		$iInputsWritten = 0;
		
		//------------------------------------//
		//-- 3 - Write the Array            --//
		//------------------------------------//
		if( $this->bInitialised===true ) {
			foreach( $aInputArray as $sInput ) {
				//-- Write the output --//
				$InputResult = fwrite( $this->oSocket, $sInput );
				
				//-- Add to the Debugging log --//
				$this->AddToDebuggingLog( 
					array(
						"Type"   => "Input",
						"Result" => $InputResult,
						"Input"  => $sInput
					)
				);
				
				//-- Increment the count of how many successful Input --//
				$iInputsWritten++;
			}
			
			//-- If more than one Input was Written --//
			if( $iInputsWritten>= 1) {
				return true;
			}
		}
		//-- TODO: Add an ELSE ErrMesg --//
		
		//------------------------------------//
		//-- 9 - Return failure             --//
		//------------------------------------//
		return false;
	}
	
	//========================================================================================================================//
	//== #5.0# - OUTPUT FUNCTIONS                                                                                           ==//
	//========================================================================================================================//
	
	
	//========================================================================================//
	//== #5.1# -                                                                            ==//
	//========================================================================================//
	public function FetchRows( $sFetchType="normal", $iMaxCol=null, $iMaxRows=25, $bHideComments=false, $bHideEndOfOutputChars=true ) {
		//--------------------------------------------------------//
		//-- 1.0 - Declare Variables                            --//
		//--------------------------------------------------------//
		$bError             = false;        //-- BOOLEAN:  --//
		$sErrMesg           = "";           //-- STRING:   --//
		$j                  = 0;            //-- INTEGER:  Used to store how many invalid rows have been found --//
		$aResult            = array();      //-- ARRAY:    --//
		
		
		//--------------------------------------------------------//
		//-- 3.0 - Check the Values                             --//
		//--------------------------------------------------------//
		try {
			//--------------------------------------------//
			//-- 3.1 - Check Max Column Count           --//
			//--------------------------------------------//
			if( $iMaxCol===null || $iMaxCol<30 ) {
				$this->AddToDebuggingLog(
					array(
						"Type"   => "Error",
						"Value"  => "Unsupported 'MaxCol' parameter. "
					)
				);
				return false;
			}
			
			//--------------------------------------------//
			//-- 3.2 - Check Max Rows Count             --//
			//--------------------------------------------//
			if( $iMaxRows===null || $iMaxRows>30 ) {
				$this->AddToDebuggingLog(
					array(
						"Type"   => "Error",
						"Value"  => "Unsupported 'MaxRows' parameter. "
					)
				);
				return false;
			}
		} catch( Exception $e30 ) {
			$bError   = true;
			$sErrMesg = "Critical Error: Performing !";
		}
		
		//--------------------------------------------------------//
		//-- 5.0 - Fetch the Output                             --//
		//--------------------------------------------------------//
		if( $bError===false ) {
			try {
				switch( $this->sTelnetType ) {
					case "WatchInputs":
						$aResult = $this->GetRowsWatchInputs( $sFetchType, $iMaxCol, $iMaxRows, $bHideComments, $bHideEndOfOutputChars );
						break;
						
					default:
						$bError   = true;
						$sErrMesg = "Unsupported Telnet Type!";
						break;
				}
			} catch( Exception $e50 ) {
				$bError   = true;
				$sErrMesg = "Critical Error: When fetching rows from the Telnet Interface!";
			}
		}
		
		//--------------------------------------------------------//
		//-- 9.0 - Return the failure response                  --//
		//--------------------------------------------------------//
		if( $bError===false ){ 
			return $aResult;
			
		} else {
			$this->AddToDebuggingLog(
				array(
					"Type"   => "Error",
					"Value"  => $sErrMesg
				)
			);
			
			return false;
		}
	}
	
	
	//========================================================================================//
	//== #5.2# - WatchInputs Variant                                                        ==//
	//========================================================================================//
	private function GetRowsWatchInputs( $sFetchType, $iMaxCol, $iMaxRows, $bHideComments, $bHideEndOfOutputChars ) {
		//--------------------------------------------------------------------//
		//-- 1.0 - Declare Variables                                        --//
		//--------------------------------------------------------------------//
		$bError             = false;        //-- BOOLEAN:  --//
		$sErrMesg           = "";           //-- STRING:   --//
		$sOutput            = "";           //--  --//
		$aResult            = array();      //--  --//
		$j                  = 0;            //--  --//
		$sTemp1             = "";           //-- STRING:   Used to hold a tempory string for the output formatting --//
		
		$bFinished          = false;        //-- BOOLEAN:   --//
		
		//--------------------------------------------------------------------//
		//-- 2.0 - Prepare                                                  --//
		//--------------------------------------------------------------------//
		$sFetchType = strtolower( $sFetchType );
		
		//--------------------------------------------------------------------//
		//-- 5.0 - Fetch Data                                               --//
		//--------------------------------------------------------------------//
		while( 
			!feof( $this->oSocket )   && 
			$j<=$iMaxRows             && 
			$bFinished===false 
		) {
			
			//-- Fetch the output --//
			$sOutput = fgets( $this->oSocket, $iMaxCol )."\n";
			
			//-- If output isn't false --//
			if( $sOutput!==false ) {
				//--------------------------------------------//
				//-- STEP 1 - Trim Whitespace               --//
				//--------------------------------------------//
				$sTrimedOutput   = trim( $sOutput );
				
				//--------------------------------------------//
				//-- STEP 2 - Filter unwanted characters    --//
				//--------------------------------------------//
				$sFilteredOutput = filter_var( $sTrimedOutput, FILTER_UNSAFE_RAW, array( 'flags' => FILTER_FLAG_STRIP_LOW|FILTER_FLAG_STRIP_HIGH ) );
				
				//--------------------------------------------//
				//-- STEP 3 - Perform FetchType Checks      --//
				//--------------------------------------------//
				if( $sFetchType==="watchinputslogin" ) {
					
					if( $sFilteredOutput==="Username:" ) {
						if( isset( $this->aOptions['Username'] ) ) {
							$bResult1 = fwrite ( $this->oSocket, $this->aOptions['Username']."\n" );
							$this->AddToDebuggingLog(
								array(
									"Type"   => "Output",
									"Mesg"   => "Writing username!"
								)
							);
						}
						
						
					} else if( $sFilteredOutput==="Password:" ) {
						if( isset( $this->aOptions['Password'] ) ) {
							$bResult2 = fwrite ( $this->oSocket, $this->aOptions['Password']."\n" );
							
							$this->AddToDebuggingLog(
								array(
									"Type"   => "Output",
									"Mesg"   => "Writing password!"
								)
							);
						}
					}
				}
				
				
				//--------------------------------------------//
				//-- STEP 5 - Remove GreaterThan symbols    --//
				//--------------------------------------------//
				if( $bHideEndOfOutputChars===true ) {
					if( $sFilteredOutput==="> logout" ) {
						$sFilteredOutput = "";
						
						//-- Add to the debugging log --//
						$this->AddToDebuggingLog(
							array(
								"Type"   => "Debug",
								"Mesg"   => "Hide the logout message!"
							)
						);
						
					} else if( substr($sFilteredOutput, 0, 2)==='> ' ) {
						$bFinished = true;
						
						//-- Add to the Result --//
						$sFilteredOutput = substr( $sFilteredOutput, 2 );
						
					} else if( $sFilteredOutput==='>' ) {
						$bFinished = true;
						$sFilteredOutput = "";
					}
					
				} else if( substr($sFilteredOutput, 0, 1)==='>' ) {
					$bFinished = true;
				}
				
				//--------------------------------------------//
				//-- STEP 6 - Return the Results            --//
				//--------------------------------------------//
				if( !empty($sFilteredOutput)  ) {
					//------------------------------------------------------------//
					//-- IF Comment and filter out is enabled                   --//
					//------------------------------------------------------------//
					if( $bHideComments===true && substr($sFilteredOutput, 0, 1)==='#' ) {
						//-- Add to the debugging log --//
						$this->AddToDebuggingLog(
							array(
								"Type"   => "Debug",
								"Value"  => "Removed comment from output"
							)
						);
					//------------------------------------------------------------//
					//-- ELSE Format the output                                 --//
					//------------------------------------------------------------//
					} else {
						//-- Add to the debugging log --//
						$this->AddToDebuggingLog(
							array(
								"Type"   => "Output",
								"Value"  => $sFilteredOutput
							)
						);
						
						//--------------------------------------------//
						//-- Format the Output in the desired way   --//
						switch( $sFetchType ) {
							case "json":
								$sTemp1 .= $sFilteredOutput;
								break;
								
							default:
								//-- Add to Iterative Array --//
								$aResult[] = $sFilteredOutput;
						}
					}
				} else {
					//-- Increment the count of invalid rows --//
					$j++;
				}
			}	//-- ENDIF OUTPUT ISNT FALSE --//
		}	//-- ENDWHILE --//
		
		//--------------------------------------------------------------------//
		//-- 8.0 - Perform any formatting that needs to be done             --//
		//--------------------------------------------------------------------//
		if( $bError===false ){ 
			switch( $sFetchType ) {
				case "json":
					$aResult = json_decode( $sTemp1, true );
					break;
					
				default:
					
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 9.0 - Return the Results                                       --//
		//--------------------------------------------------------------------//
		if( $bError===false ){ 
			return $aResult;
			
		} else {
			$this->AddToDebuggingLog(
				array(
					"Type"   => "Error",
					"Value"  => $sErrMesg
				)
			);
			
			return false;
		}
	}
}









?>