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

	protected $sDeviceOnvifUrl      = '';           //-- STRING:        --//
	protected $iDeltaTime           = 0;            //-- INTEGER:       --//
	protected $aDateAndTime         = array();      //-- ARRAY:         --//
	
	public $bInitialised            = false;        //-- BOOLEAN:       --//
	public $aErrorMessges           = array();      //-- ARRAY:         --//
	public $aDebbugingLogs          = array();      //-- ARRAY:         --//
	
	
	protected $oSocket              = null;         //-- OBJECT:        --//
	
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT FUNCTIONS                                                                                        ==//
	//========================================================================================================================//
	public function __construct( $sIPAddress, $sIPPort="23", $sTelnetType="WatchInputs", $iDebuggingType=0 ) {
		//----------------------------------------------------//
		//-- 1 - Initialise                                 --//
		//----------------------------------------------------//
		
		$iSockErrNo             = 0;
		$sSockErrStr            = "";
		
		//----------------------------------------------------//
		//-- 2 - Store certain construction parameters      --//
		//----------------------------------------------------//
		$this->sNetworkAddress  = $sIPAddress;
		$this->sNetworkPort     = $sIPPort;
		$this->sTelnetType      = $sTelnetType;
		$this->iDebuggingType   = $iDebuggingType;
		
		//$this->sUsername        = $sUsername;
		//$this->sPassword        = $sPassword;
		
		
		//----------------------------------------------------//
		//-- 3 - Begin                                      --//
		//----------------------------------------------------//
		try {
			//------------------------------------//
			//-- Setup the Socket Object        --//
			//------------------------------------//
			error_reporting(E_ALL ^ E_WARNING); 
			
			$this->oSocket = fsockopen( $sIPAddress, $sIPPort, $iSockErrNo, $sSockErrStr, 2 );
			
			
			//-- Check that the Socket object is not false --//
			if( $this->oSocket ) {
				
				stream_set_blocking( $this->oSocket, 1 );
				stream_set_timeout( $this->oSocket, 2 );
				$this->bInitialised = true;
				
				
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
	
	
	
	public function AddToDebuggingLog( $sString ) {
		
		try {
			switch( $this->iDebuggingType ) {
				//------------------------------------//
				//-- IF Add to debugging array      --//
				//------------------------------------//
				case 1:
					//-- Add to the Logs --//
					$this->aDebbugingLogs[] = $sString;
					
					//-- Success --//
					return true;
					
					break;
					
				
				//------------------------------------//
				//-- IF Output debugging            --//
				//------------------------------------//
				case 2:
					//-- Add to the Logs --//
					$this->aDebbugingLogs[] = $sString;
					
					//-- Output the debugging --//
					echo $sString."\n";
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
				$InputRestult = fwrite ( $this->oSocket, $sInput );
				
				$this->AddToDebuggingLog( "Input: (".$InputRestult.") = ".$sInput );
				//-- Increment the count of how many successful Input --//
				$iInputsWritten++;
			}
			
			//-- If more than one Input was Written --//
			if( $iInputsWritten>= 1) {
				return true;
			}
		}
		
		//------------------------------------//
		//-- 9 - Return failure             --//
		//------------------------------------//
		return false;
	}
	
	
	
	
	
	public function FetchRows( $iColumnMax=null, $iMaxRows=25, $bHideComments=false ) {
		//--------------------------------------------//
		//-- 1 - Initialise                         --//
		//--------------------------------------------//
		$j                  = 0;            //-- INTEGER:  Used to store how many invalid rows have been found --//
		$aResult            = array();      //-- ARRAY:    --//
		
		
		//--------------------------------------------//
		//-- 3 - Fetch the Output                   --//
		//--------------------------------------------//
		if( $iColumnMax!==null ) {
			//-- Check to see if iMax rows is greater than 0 --//
			if( $iMaxRows>=1 ) {
				//--------------------------------------------//
				//-- 3.A - Limited Mode                     --//
				//--------------------------------------------//
				
				//-- While not "End of File" or has not exceeded the max empty rows --//
				while( !feof( $this->oSocket ) && $j<=$iMaxRows ) {
					
					//-- Fetch the output --//
					$sOutput = fgets( $this->oSocket, $iColumnMax )."\n";
					
					//-- If output isn't false --//
					if( $sOutput!==false ) {
						//--------------------------------------------//
						//-- IF the TelnetType is WatchInputs       --//
						//--------------------------------------------//
						if( $this->sTelnetType==="WatchInputs") {
							//-- Trim the Output --//
							$sTrimedOutput = trim( $sOutput );
							
							if( !empty($sTrimedOutput) ) {
								
								if( $bHideComments===false ) {
									//-- Add to the Result --//
									$aResult[] = $sTrimedOutput;
									
									//-- Add to the debugging log --//
									$this->AddToDebuggingLog( "Output: ".$sTrimedOutput."\n" );
									
								} else {
									//-- IF the first character isn't the character used for comments --//
									if( substr($sTrimedOutput, 0, 1)!=='#' ) {
										//-- Add to the Result --//
										$aResult[] = $sTrimedOutput;
										
										//-- Add to the debugging log --//
										$this->AddToDebuggingLog( "Output: ".$sTrimedOutput."\n" );
										
									} //-- ELSE the Output is a comment so do nothing --//
								}
								
							} else {
								//-- Increment the count of invalid rows --//
								$j++;
							}
							
						//--------------------------------------------//
						//-- ELSE Just do the Normal                --//
						//--------------------------------------------//
						} else {
							//-- TODO: This --//
							
							
							
						}
					} else {
						//-- Value is false indicating that it couldn't retrieve the value --//
						$j++;
					}
				}
				
				
				//--------------------------------------------//
				//-- Return the Results                     --//
				//--------------------------------------------//
				return $aResult;
			}
		}
		
		//--------------------------------------------//
		//-- Return the failure response            --//
		//--------------------------------------------//
		return false;
	}
}









?>