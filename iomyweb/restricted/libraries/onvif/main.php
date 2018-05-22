<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This Library contains function and a PHP Class that is used for connecting to "Onvif" supported devices.
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


function CheckIfDeviceSupportsOnvif( $sNetworkAddress, $iPort = 8000 ) {
	//----------------------------------------------------------------//
	//-- 1.0 - Initialise                                           --//
	//----------------------------------------------------------------//
	$aResult        = array();      //-- ARRAY:         Used to hold the result of if this function succeeded or failed in getting the desired result.	--//
	$sURL           = "";           //-- STRING:        --//
	
	//----------------------------------------------------------------//
	//-- 2.0 - Begin                                                --//
	//----------------------------------------------------------------//
	$sURL       = 'http://'.$sNetworkAddress.":".$iPort.'/onvif/device_service';
	$sPOSTData  = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/></s:Body></s:Envelope>';
	
	$oRequest = curl_init();
	
	//-- IF 'curl_init' succeeded in initialising --//
	if( $oRequest ) {
		curl_setopt( $oRequest, CURLOPT_URL, $sURL );
	
		//-- TODO: Re-implement Proxy Code if needed --//
		curl_setopt( $oRequest, CURLOPT_CONNECTTIMEOUT,    1            );
		curl_setopt( $oRequest, CURLOPT_TIMEOUT,           2            );
		curl_setopt( $oRequest, CURLOPT_RETURNTRANSFER,    true         );
		curl_setopt( $oRequest, CURLOPT_SSL_VERIFYPEER,    false        );
		curl_setopt( $oRequest, CURLOPT_SSL_VERIFYHOST,    false        );
		curl_setopt( $oRequest, CURLOPT_POST,              true         );
		curl_setopt( $oRequest, CURLOPT_POSTFIELDS,        $sPOSTData   );
		curl_setopt( $oRequest, CURLOPT_HTTPHEADER,        array( 
			'Content-Type: text/xml; charset=utf-8', 
			'Content-Length: '.strlen( $sPOSTData ) 
		));
		
		$oResult = curl_exec( $oRequest );
		
	} else {
		//-- ELSE failure to prepare to do a basic onvif request --//
		$oResult = false;
	}
	
	
	if( $oResult===false ) {
		//------------------------------------//
		//-- ONVIF NOT SUPPORTED            --//
		//------------------------------------//
		$sErrMesg = curl_error( $oRequest );
		
		return false;
		
	} else {
		//------------------------------------//
		//-- ONVIF SUPPORTED                --//
		//------------------------------------//
		return true;
	}
}


class PHPOnvif {
	//========================================================================================================================//
	//== #1.0# - INITIALISE VARIABLES                                                                                       ==//
	//========================================================================================================================//
	protected $sNetworkAddress      = '';           //-- STRING:        Used to hold the IP Address or Network name of the Device.		--//
	protected $sNetworkPort         = '';           //-- STRING:        Used to hold the IP Port that is used for Onvif				--//
	protected $sUsername            = '';           //-- STRING:        --//
	protected $sPassword            = '';           //-- STRING:        --//
	protected $bEnvelopeSecurity    = false;        //-- BOOLEAN:       --//
	protected $sDeviceOnvifUrl      = '';           //-- STRING:        --//
	protected $iDeltaTime           = 0;            //-- INTEGER:       --//
	protected $aDateAndTime         = array();      //-- ARRAY:         --//
	
	public $bInitialised            = false;        //-- BOOLEAN:       --//
	public $aErrorMessges           = array();      //-- ARRAY:         --//
	
	
	//========================================================================================================================//
	//== #2.0# - CONSTRUCT FUNCTIONS                                                                                        ==//
	//========================================================================================================================//
	public function __construct( $sIPAddress, $sIPPort="8000", $sUsername="admin", $sPassword="admin" ) {
		//----------------------------------------------------//
		//-- 1.0 - INITIALISE                               --//
		//----------------------------------------------------//
		$bNoAuth      = false;
		
		
		$this->sNetworkAddress  = $sIPAddress;
		$this->sNetworkPort     = $sIPPort;
		$this->sUsername        = $sUsername;
		$this->sPassword        = $sPassword;
		
		//-- CREATE THE ONVIF URL --//
		$this->sDeviceOnvifUrl  = 'http://'.$sIPAddress.':'.$sIPPort.'/onvif/device_service';
		
		//$datetime = $this->GetDeviceDateAndTime();
		$aTempDateAndTime       = $this->GetDeviceDateAndTime();
		
		//--------------------------------------------//
		//-- IF no errors fetching Date and Time    --//
		//--------------------------------------------//
		if( $aTempDateAndTime["Error"]===false ) {
			$aDateAndTime       = $this->ExtractDeviceDateAndTime( $aTempDateAndTime );
			
			//--------------------------------------------//
			//-- IF no Errors extracting Date and Time  --//
			//--------------------------------------------//
			if( $aDateAndTime['Error']===false ) {
				//-- Store the Extracted Date and Time data for future use --//
				$this->DateAndTime  = $aDateAndTime;
				
				//-- Setup the Time for the User Token --//
				$timestamp = mktime( $aDateAndTime['Data']['Hour'], $aDateAndTime['Data']['Minute'], $aDateAndTime['Data']['Second'], $aDateAndTime['Data']['Month'], $aDateAndTime['Data']['Day'], $aDateAndTime['Data']['Year'] );
				$this->iDeltaTime   = time() - $timestamp - 5;
				
				//-- Flag that the initial connection was made --//
				$this->bInitialised = true;
				$this->SetEnvelopeSecurity(true);
				
			//--------------------------------------------//
			//-- ELSE IF No date and time support       --//
			//--------------------------------------------//
			} else {
				
				$aChild1 = GetChildTag( $aTempDateAndTime['Result'], "Body", 1 );
				
				if( $aChild1 ) {
					$aChild2 = GetChildTag( $aChild1, "GetSystemDateAndTimeResponse", 1 );
					
					if( $aChild2 ) {
						$bNoAuth = true;
						
					}
				}
				
				if( $bNoAuth ) {
					$this->SetEnvelopeSecurity(false);
					$this->bInitialised = true;
					
				//--------------------------------------------//
				//-- ELSE error extracting Date and Time    --//
				//--------------------------------------------//
				} else {
					
					$this->aErrorMessges[] = "InitialConnection: Couldn't extract date and time!";
					
				}
			}
			
			
		//--------------------------------------------//
		//-- ELSE Error fetching Date and Time      --//
		//--------------------------------------------//
		} else {
			$this->aErrorMessges[] = "InitialConnection: Connection Failed!";
		}
	}
	
	
	//========================================================================================================================//
	//== #3.0# - DESTRUCT FUNCTIONS                                                                                         ==//
	//========================================================================================================================//
	public function __destruct() {
		// nothing to do
	}
	
	
	//========================================================================================================================//
	//== #4.0# - GET DEVICE DATE AND TIME FUNCTION                                                                          ==//
	//========================================================================================================================//
	public function SetEnvelopeSecurity( $bEnvelopeSecurity ) {
		$this->bEnvelopeSecurity = $bEnvelopeSecurity;
		
		return true;
	}
	
	
	
	public function GetDeviceDateAndTime() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";       //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();  //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$sEnvelope .= '<GetSystemDateAndTime xmlns="http://www.onvif.org/ver10/device/wsdl"/>';
		
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//echo "\n Envelope=\n";
		//var_dump( $aResult );
		//echo "\n\nResult=\n";
		//var_dump( $aResult );
		//echo "\n";
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	//========================================================================================================================//
	//== #5.0# - GET ALL CAPABILITIES FUNCTION                                                                              ==//
	//========================================================================================================================//
	public function GetAllCapabilities( $sCapabilityType="All" ) {
		//--------------------------------------------------------------------------------------------//
		//-- DESCRIPTION: Fetches the capabilities of the device.                                   --//
		//--     Valid Modes are "All", "Analytics", "Device", "Events", "Imaging", "Media", "PTZ"  --//
		//--------------------------------------------------------------------------------------------//
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";           //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();      //-- ARRAY:         Stores the Result of the HTTP Request --//
		$aTokenDetails  = array();      //-- ARRAY:         Holds the token details for the envelope header --//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - PREPARE FOR HTTP REQUEST                             --//
		//----------------------------------------------------------------//
		$sEnvelope     .= '<GetCapabilities xmlns="http://www.onvif.org/ver10/device/wsdl">';
		$sEnvelope     .= '<Category>'.$sCapabilityType.'</Category>';
		$sEnvelope     .= '</GetCapabilities>';
		
		//----------------------------------------------------------------//
		//-- 3.0 - EXECUTE THE HTTP REQUEST                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	//========================================================================================================================//
	//== #5.0# - GET ALL CAPABILITIES FUNCTION                                                                              ==//
	//========================================================================================================================//
	public function GetDeviceInformation() {
		//--------------------------------------------------------------------------------------------//
		//-- DESCRIPTION: Fetches the capabilities of the device.                                   --//
		//--     Valid Modes are "All", "Analytics", "Device", "Events", "Imaging", "Media", "PTZ"  --//
		//--------------------------------------------------------------------------------------------//
		
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";           //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();      //-- ARRAY:         Stores the Result of the HTTP Request --//
		$aTokenDetails  = array();      //-- ARRAY:         Holds the token details for the envelope header --//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - PREPARE FOR HTTP REQUEST                             --//
		//----------------------------------------------------------------//
		$sEnvelope .= '<GetDeviceInformation xmlns="http://www.onvif.org/ver10/device/wsdl" />';
		
		//----------------------------------------------------------------//
		//-- 3.0 - EXECUTE THE HTTP REQUEST                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
		
	}
	
	
	//========================================================================================================================//
	
	//========================================================================================================================//
	public function GetVideoSources() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";       //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();  //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$sEnvelope      .= '<GetVideoSources xmlns="http://www.onvif.org/ver10/media/wsdl"/>';
		
		
		//var_dump( $sEnvelope );
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	public function GetProfiles() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";       //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();  //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$sEnvelope      .= '<GetProfiles xmlns="http://www.onvif.org/ver10/media/wsdl"/>';
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	public function GetStreamUri( $sToken, $sProtocol, $sStream ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope      = "";       //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult        = array();  //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$sEnvelope      .= '<StreamSetup>';
		$sEnvelope      .= '<Stream xmlns="http://www.onvif.org/ver10/schema">%%STREAM%%</Stream>';
		$sEnvelope      .= '<Transport xmlns="http://www.onvif.org/ver10/schema">';
		$sEnvelope      .= '<Protocol>%%PROTOCOL%%</Protocol>';
		$sEnvelope      .= '</Transport>';
		$sEnvelope      .= '</StreamSetup>';
		$sEnvelope      .= '<ProfileToken>%%PROFILETOKEN%%</ProfileToken>';
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	
	public function ExtractDeviceDateAndTime( $aXMLResponse ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aResult    = true;     //-- BOOLEAN:       --//
		$iYear      = 0;        //-- INTEGER:       --//
		$iMonth     = 0;        //-- INTEGER:       --//
		$iDay       = 0;        //-- INTEGER:       --//
		$iHour      = 0;        //-- INTEGER:       --//
		$iMinute    = 0;        //-- INTEGER:       --//
		$iSeconds   = 0;        //-- INTEGER:       --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Extract the Values                                   --//
		//----------------------------------------------------------------//
		$aYearSearch        = recursive_array_search( 'tt:Year',    $aXMLResponse, false, false );
		$aMonthSearch       = recursive_array_search( 'tt:Month',   $aXMLResponse, false, false );
		$aDaySearch         = recursive_array_search( 'tt:Day',     $aXMLResponse, false, false );
		$aHourSearch        = recursive_array_search( 'tt:Hour',    $aXMLResponse, false, false );
		$aMinuteSearch      = recursive_array_search( 'tt:Minute',  $aXMLResponse, false, false );
		$aSecondSearch      = recursive_array_search( 'tt:Second',  $aXMLResponse, false, false );
		
		
		if( $aYearSearch!==false && $aMonthSearch!==false && $aDaySearch!==false && $aHourSearch!==false && $aMinuteSearch!==false && $aSecondSearch!==false ) {
			
			//-- Extract the Year --//
			$aYear      = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aYearSearch,		1 );
			//-- Grab the first child value from the converted XML tag --//
			$iYear      = $aYear['+'][0];
			
			//-- Extracted the Month --//
			$aMonth     = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aMonthSearch,		1 );
			$iMonth     = $aMonth['+'][0];
			
			//-- Extracted the Day --//
			$aDay       = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aDaySearch,		1 );
			$iDay       = $aDay['+'][0];
			
			//-- Extracted the Hour --//
			$aHour      = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aHourSearch,		1 );
			$iHour      = $aHour['+'][0];
			
			//-- Extracted the Minute --//
			$aMinute    = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aMinuteSearch,		1 );
			$iMinute    = $aMinute['+'][0];
			
			//-- Extracted the Second --//
			$aSecond    = ExtractArrayContentsFromArraySearchResults( $aXMLResponse,	$aSecondSearch,		1 );
			$iSecond    = $aSecond['+'][0];
			
			return array(
				"Error" => false,
				"Data"  => array(
					"Year"      => $iYear,
					"Month"     => $iMonth,
					"Day"       => $iDay,
					"Hour"      => $iHour,
					"Minute"    => $iMinute,
					"Second"    => $iSecond
				)
			);
			
		} else {
			return array(
				"Error"     => true,
				"ErrMesg"   => "Could not extract the Date and Time from the data returned from the device!\n"
			);
		}
	}
	
	
	public function ExtractVideoSources( $aXMLEnvelope ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aVideoSourcesList      = array();
		$aResult                = array();
		$aXMLBody               = array();
		$aXMLVideoSources       = array();
		
		//----------------------------------------------------------------//
		//-- 2.0 - EXTRACT THE VALUES                                   --//
		//----------------------------------------------------------------//
		//echo "\n-- dumping video source response --\n";
		//echo json_encode( $aXMLEnvelope );
		//echo "\n\n";
		
		
		//-- If the Body Tag of the Envelope exists --//
		$aXMLBody = GetChildTag( $aXMLEnvelope, "Body", 1);
		if( $aXMLBody ) {
			
			//-- Check if VideoSources tag of the Body exists --//
			$aXMLVideoSources = GetChildTag( $aXMLBody, "GetVideoSourcesResponse", 1);
			if( $aXMLVideoSources ) {
				
				if( isset($aXMLVideoSources['+']) ) {
					$i                  = 0;
					$aResult            = array( "Error"=>false, "Data"=>array() );
					$aVideoSourcesList  = $aXMLVideoSources['+'];
					
					
					foreach( $aVideoSourcesList as $aVideoSource ) {
						
						$aResult['Data'][$i] = array(
							"token"     => $aVideoSource['token']
						);
						
						//------------------------------------------------//
						//-- Foreach Child in the video source          --//
						//------------------------------------------------//
						if( isset($aVideoSource['+']) ) {
							foreach( $aVideoSource['+'] as $aVideoSourceChildAttribute ) {
								if( $aVideoSourceChildAttribute ) {
									
									if( isset( $aVideoSourceChildAttribute["XMLTagName"]) ) {
										switch( $aVideoSourceChildAttribute["XMLTagName"] ) {
											//----------------------------//
											//-- CASE: FRAMERATE        --//
											//----------------------------//
											case "tt:Framerate":
												$aResult['Data'][$i]['Framerate']	= $aVideoSourceChildAttribute['+'][0];
												break; //-- END "tt:Framerate" CASE --//
											
											//----------------------------//
											//-- CASE: RESOLUTION       --//
											//----------------------------//
											case "tt:Resolution":
												$aResult['Data'][$i]['Resolution'] = array();
												
												if( isset($aVideoSourceChildAttribute['+']) ) {
													foreach( $aVideoSourceChildAttribute['+'] as $aResolutionChild ) {
														$sTempTagName = $aResolutionChild["XMLTagName"];
														
														//-- RESOLUTION WIDTH --//
														if( $sTempTagName==="tt:Width" ) {
															$aResult['Data'][$i]['Resolution']['Width']         = $aResolutionChild["+"][0];
															
														//-- RESOLUTION HEIGHT --//
														} else if( $sTempTagName==="tt:Height" ) {
															$aResult['Data'][$i]['Resolution']['Height']        = $aResolutionChild["+"][0];
														
														//-- RESOLUTION OTHER --//
														} else {
															$aResult['Data'][$i]['Resolution'][$sTempTagName]   = $aResolutionChild["+"][0];
														}
													}		//-- ENDFOREACH Resolution Child --//
												}
												break; //-- END "tt:Resolution" CASE --//
										}	//-- ENDSWITCH XML Tag Name --//
									}
								}
							}		//-- ENDFOREACH --//
						}
						
						//-- Increment the "i" variable --//
						$i++;
					}    //-- ENDFOREACH Video Source --//
				}
			} else {
				$aResult = array(
					"Error"     => true,
					"ErrMesg"   => "No sub-tag matching the requested criteria inside of the Body tag"
				);
			}
		} else {
			$aResult = array(
				"Error"     => true,
				"ErrMesg"   => "No sub-tag matching the requested criteria inside of the Envelope tag"
			);
		}
		return $aResult;
	}
	
	
	public function ExtractProfiles( $aXMLEnvelope ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError                 = false;        //-- BOOLEAN:       --//
		$sErrMesg               = "";           //-- STRING:        --//
		$aResult                = array();
		$aXMLBody               = array();
		$aXMLProfileResponse    = array();
		$sTemp                  = "";
		
		//----------------------------------------------------------------//
		//-- 2.0 - EXTRACT THE VALUES                                   --//
		//----------------------------------------------------------------//
		
		//-- If the Body Tag of the Envelope exists --//
		$aXMLBody = GetChildTag( $aXMLEnvelope, "Body", 1);
		if( $aXMLBody ) {
			
			//-- Check if ProfileResponse tag of the Body exists --//
			$aXMLProfileResponse = GetChildTag( $aXMLBody, "GetProfilesResponse", 1 );
			if( $aXMLProfileResponse ) {
				
				//echo "\n-- dumping profile response --\n";
				//echo json_encode( $aXMLProfileResponse );
				//echo "\n\n";
				
				if( isset($aXMLProfileResponse['+']) ) {
					
					//-- Foreach Child --//
					foreach( $aXMLProfileResponse['+'] as $aProfile ) {
						//-- Only Procced if the Profile is valid --//
						if( $aProfile ) {
							
							//----------------------------------------------------------------//
							//-- PART 1 - Setup the array                                   --//
							//----------------------------------------------------------------//
							$aTempProfile = array(
								"ProfileToken"  => null,
								"ProfileName"   => null,
								"Video"         => array(
									"Source"        => array(),
									"Enc"           => array()
								),
								"Audio"         => array(
									"Source"        => array()
								),
								"PTZ"           => array()
							);
							
							
							//----------------------------------------------------------------//
							//-- PART 2 - Profile                                           --//
							//----------------------------------------------------------------//
							
							//------------------------------------//
							//-- PART 2.1 - Profile Token       --//
							$sTemp = ContainsPhpXmlSoapAttribute( $aProfile, "token", true );
							if( $sTemp==="0" || $sTemp ) {
								$aTempProfile['ProfileToken'] = $sTemp;
							}
							
							//------------------------------------//
							//-- PART 2.2 - Profile Name        --//
							$aTemp = GetChildTag( $aProfile, "Name", 1 );
							
							if( $aTemp ) {
								if( isset( $aTemp['+'] ) ) {
									if( isset($aTemp['+'][0]) ) {
										$aTempProfile['ProfileName'] = $aTemp['+'][0];
									}
								}
							}
							
							//----------------------------------------------------------------//
							//-- PART 3 - Video Source                                      --//
							//----------------------------------------------------------------//
							$aProfileVideoSource = GetChildTag( $aProfile, "VideoSourceConfiguration", 1 );
							
							if( $aProfileVideoSource ) {
								//--------------------------------------------//
								//-- PART 3.1 - VidSource Token             --//
								$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoSource, "token", true );
								if( $sTemp==="0" || $sTemp ) {
									$aTempProfile['Video']['Source']['Token'] = $sTemp;
								}
								
								//--------------------------------------------//
								//-- PART 3.2 - VidSource Name              --//
								$aTemp = GetChildTag( $aProfileVideoSource, "Name", 1 );
							
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset($aTemp['+'][0]) ) {
											$aTempProfile['Video']['Source']['Name'] = $aTemp['+'][0];
										}
									}
								}
								
								
								//--------------------------------------------//
								//-- PART 3.3 - VidSource UseCount          --//
								$aTemp = GetChildTag( $aProfileVideoSource, "UseCount", 1 );
							
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset($aTemp['+'][0]) ) {
											$aTempProfile['Video']['Source']['UseCount'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 3.4 - VidSource SourceToken       --//
								
								//-- TODO: Look into if this is different from the other video token or just an alias --//
								$aTemp = GetChildTag( $aProfileVideoSource, "SourceToken", 1 );
							
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset($aTemp['+'][0]) ) {
											$aTempProfile['Video']['Source']['SourceToken'] = $aTemp['+'][0];
										}
									}
								}
								
								
								//--------------------------------------------//
								//-- PART 3.5 - VidSource Bounds            --//
								$aProfileVideoSourceBounds = GetChildTag( $aProfileVideoSource, "Bounds", 1 );
								
								if( $aProfileVideoSourceBounds ) {
									
									//--------------------------------------------//
									//-- PART 3.5.1 - VidSource Bounds Height   --//
									$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoSourceBounds, "height", true );
									
									if( $sTemp==="0" || $sTemp ) {
										$aTempProfile['Video']['Source']['BoundsHeight'] = $sTemp;
									}
									
									//--------------------------------------------//
									//-- PART 3.5.2 - VidSource Bounds Width    --//
									$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoSourceBounds, "width", true );
									
									if( $sTemp==="0" || $sTemp ) {
										$aTempProfile['Video']['Source']['BoundsWidth'] = $sTemp;
									}
									
									//--------------------------------------------//
									//-- PART 3.5.3 - VidSource Bounds X        --//
									$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoSourceBounds, "x", true );
									
									if( $sTemp==="0" || $sTemp ) {
										$aTempProfile['Video']['Source']['BoundsX'] = $sTemp;
									}
									
									//--------------------------------------------//
									//-- PART 3.5.4 - VidSource Bounds Y        --//
									$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoSourceBounds, "y", true );
									
									if( $sTemp==="0" || $sTemp ) {
										$aTempProfile['Video']['Source']['BoundsY'] = $sTemp;
									}
								}
							} //-- END Part 3 - Video Source --//
							
							
							//----------------------------------------------------------------//
							//-- PART 4 - Video Encoding                                    --//
							//----------------------------------------------------------------//
							$aProfileVideoEnc = GetChildTag( $aProfile, "VideoEncoderConfiguration", 1 );
							
							if( $aProfileVideoEnc ) {
								//--------------------------------------------//
								//-- PART 4.1 - VideoEnc Token              --//
								$sTemp = ContainsPhpXmlSoapAttribute( $aProfileVideoEnc, "token", true );
									
								if( $sTemp==="0" || $sTemp ) {
									$aTempProfile['Video']['Enc']['Token'] = $sTemp;
								}
								
								//--------------------------------------------//
								//-- PART 4.2 - VideoEnc Name               --//
								$aTemp = GetChildTag( $aProfileVideoEnc, "Name", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Video']['Enc']['Name'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 4.3 - VideoEnc UseCount           --//
								$aTemp = GetChildTag( $aProfileVideoEnc, "UseCount", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Video']['Enc']['UseCount'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 4.4 - VideoEnc Encoding           --//
								$aTemp = GetChildTag( $aProfileVideoEnc, "Encoding", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Video']['Enc']['Encoding'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 4.5 - VideoEnc Quality            --//
								$aTemp = GetChildTag( $aProfileVideoEnc, "Quality", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Video']['Enc']['Quality'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 4.6 - VideoEnc Session Timeout    --//
								$aTemp = GetChildTag( $aProfileVideoEnc, "SessionTimeout", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Video']['Enc']['SessionTimeout'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 4.7 - VideoEnc Res                --//
								$aProfileVideoEncRes = GetChildTag( $aProfileVideoEnc, "Resolution", 1 );
								
								if( $aProfileVideoEncRes ) {
									//--------------------------------------------//
									//-- PART 4.7.1 - VideoEnc Res Width        --//
									$aTemp = GetChildTag( $aProfileVideoEncRes, "Width", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['ResWidth'] = $aTemp['+'][0];
											}
										}
									}
									
									//--------------------------------------------//
									//-- PART 4.7.2 - VideoEnc Res Height       --//
									$aTemp = GetChildTag( $aProfileVideoEncRes, "Height", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['ResHeight'] = $aTemp['+'][0];
											}
										}
									}
									
								} //-- END Part 4.7 - Video Encoding Resolution --//
								
								
								//--------------------------------------------//
								//-- PART 4.8 - VideoEnc Rate Control       --//
								$aProfileVideoEncRateControl = GetChildTag( $aProfileVideoEnc, "RateControl", 1 );
								
								if( $aProfileVideoEncRateControl ) {
									//--------------------------------------------//
									//-- PART 4.8.1 - VideoEnc Rate Limit       --//
									$aTemp = GetChildTag( $aProfileVideoEncRateControl, "FrameRateLimit", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['RateControlFrameRateLimit'] = $aTemp['+'][0];
											}
										}
									}
									
									//--------------------------------------------//
									//-- PART 4.8.2 - VideoEnc Rate EncInterval --//
									$aTemp = GetChildTag( $aProfileVideoEncRateControl, "EncodingInterval", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['RateControlEncodingInterval'] = $aTemp['+'][0];
											}
										}
									}
									
									//--------------------------------------------//
									//-- PART 4.8.3 - VideoEnc Res Width        --//
									$aTemp = GetChildTag( $aProfileVideoEncRateControl, "BitrateLimit", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['RateControlBitrateLimit'] = $aTemp['+'][0];
											}
										}
									}
								} //-- END Part 4.8 - Video Encoding Rate Control --//
								
								
								//--------------------------------------------//
								//-- PART 4.9 - VideoEnc H264 Config        --//
								$aProfileVideoEncodingConfig = GetChildTag( $aProfileVideoEnc, "H264", 1 );
								
								if( $aProfileVideoEncodingConfig ) {
									//--------------------------------------------//
									//-- PART 4.9.1 - VideoEnc H264 GovLength   --//
									$aTemp = GetChildTag( $aProfileVideoEncodingConfig, "GovLength", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['H264GovLength'] = $aTemp['+'][0];
											}
										}
									}
									
									//--------------------------------------------//
									//-- PART 4.9.2 - VideoEnc H264 Profile     --//
									$aTemp = GetChildTag( $aProfileVideoEncodingConfig, "H264Profile", 1 );
									
									if( $aTemp ) {
										if( isset( $aTemp['+'] ) ) {
											if( isset( $aTemp['+'][0] ) ) {
												$aTempProfile['Video']['Enc']['H264Profile'] = $aTemp['+'][0];
											}
										}
									}
									
								} //-- END Part 4.9 - Video Encoding H264 Config --//
							} //-- END Part 4 - Video Encoding --//
							
							
							//----------------------------------------------------------------//
							//-- PART 5 - Audio Source                                      --//
							//----------------------------------------------------------------//
							$aProfileAudioSource = GetChildTag( $aProfile, "AudioSourceConfiguration", 1 );
							
							if( $aProfileAudioSource ) {
								//--------------------------------------------//
								//-- PART 5.1 - Audio Source Token          --//
								$sTemp = ContainsPhpXmlSoapAttribute( $aProfileAudioSource, "token", true );
									
								if( $sTemp==="0" || $sTemp ) {
									$aTempProfile['Audio']['Source']['Token'] = $sTemp;
								}
								
								//--------------------------------------------//
								//-- PART 5.2 - Audio Source Name           --//
								$aTemp = GetChildTag( $aProfileAudioSource, "Name", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Source']['Name'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 5.3 - Audio Source UseCount       --//
								$aTemp = GetChildTag( $aProfileAudioSource, "UseCount", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Source']['UseCount'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 5.4 - Audio Source Token 2        --//
								
								//-- TODO: Work out if this is just an alias  --//
								$aTemp = GetChildTag( $aProfileAudioSource, "SourceToken", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Source']['SourceToken'] = $aTemp['+'][0];
										}
									}
								}
								
							} //-- END Part 5 - Audio Source --//
							
							
							//----------------------------------------------------------------//
							//-- PART 6 - Audio Encoding                                    --//
							//----------------------------------------------------------------//
							$aProfileAudioEnc = GetChildTag( $aProfile, "AudioEncoderConfiguration", 1 );
							
							if( $aProfileAudioEnc ) {
								//--------------------------------------------//
								//-- PART 6.1 - Audio Enc Token             --//
								$sTemp = ContainsPhpXmlSoapAttribute( $aProfileAudioEnc, "token", true );
									
								if( $sTemp==="0" || $sTemp ) {
									$aTempProfile['Audio']['Enc']['Token'] = $sTemp;
								}
								
								//--------------------------------------------//
								//-- PART 6.2 - Audio Enc Name              --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "Name", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['Name'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 6.3 - Audio Enc UseCount          --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "UseCount", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['UseCount'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 6.4 - Audio Enc Encoding          --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "Encoding", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['Encoding'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 6.5 - Audio Enc Bitrate           --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "Bitrate", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['Bitrate'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 6.6 - Audio Enc Samplerate        --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "Samplerate", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['Samplerate'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 6.7 - Audio Enc Timeout           --//
								$aTemp = GetChildTag( $aProfileAudioEnc, "SessionTimeout", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['Audio']['Enc']['SessionTimeout'] = $aTemp['+'][0];
										}
									}
								}
							} //-- END Part 6 - Audio Enc --//
							
							//----------------------------------------------------------------//
							//-- PART 7 - PTZ                                               --//
							//----------------------------------------------------------------//
							$aProfilePTZ = GetChildTag( $aProfile, "PTZConfiguration", 1 );
							
							if( $aProfilePTZ ) {
								//--------------------------------------------//
								//-- PART 7.1 - PTZ Token                   --//
								$sTemp = ContainsPhpXmlSoapAttribute( $aProfilePTZ, "token", true );
									
								if( $sTemp==="0" || $sTemp ) {
									$aTempProfile['PTZ']['Token'] = $sTemp;
								}
								
								//--------------------------------------------//
								//-- PART 7.2 - PTZ Name                    --//
								$aTemp = GetChildTag( $aProfilePTZ, "Name", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['PTZ']['Name'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 7.3 - PTZ NodeToken               --//
								$aTemp = GetChildTag( $aProfilePTZ, "NodeToken", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['PTZ']['NodeToken'] = $aTemp['+'][0];
										}
									}
								}
								
								//--------------------------------------------//
								//-- PART 7.4 - PTZ Default Speed           --//
								$aProfilePTZDefaultSpeed = GetChildTag( $aProfilePTZ, "DefaultPTZSpeed", 1 );
								
								if( $aProfilePTZDefaultSpeed ) {
									//--------------------------------------------//
									//-- PART 7.4.1 - PTZ DefaultSpd Pan Tilt   --//
									$aProfilePTZDefaultSpeedPanTilt = GetChildTag( $aProfilePTZDefaultSpeed, "PanTilt", 1 );
									
									if( $aProfilePTZDefaultSpeedPanTilt ) {
										//--------------------------------------------//
										//-- PART 7.4.1.1 - PTZ DS Pan Tilt X       --//
										$sTemp = ContainsPhpXmlSoapAttribute( $aProfilePTZDefaultSpeedPanTilt, "x", true );
										
										if( $sTemp==="0" || $sTemp ) {
											$aTempProfile['PTZ']['DefaultSpeedPanTiltX'] = $sTemp;
										}
										
										//--------------------------------------------//
										//-- PART 7.4.1.2 - PTZ DS Pan Tilt Y       --//
										$sTemp = ContainsPhpXmlSoapAttribute( $aProfilePTZDefaultSpeedPanTilt, "y", true );
										
										if( $sTemp==="0" || $sTemp ) {
											$aTempProfile['PTZ']['DefaultSpeedPanTiltY'] = $sTemp;
										}
									}
									
									//--------------------------------------------//
									//-- PART 7.4.2 - PTZ DefaultSpd Zoom       --//
									$aProfilePTZDefaultSpeedZoom = GetChildTag( $aProfilePTZDefaultSpeed, "Zoom", 1 );
									
									if( $aProfilePTZDefaultSpeedZoom ) {
										//--------------------------------------------//
										//-- PART 7.4.2.1 - PTZ DS Zoom X           --//
										$sTemp = ContainsPhpXmlSoapAttribute( $aProfilePTZDefaultSpeedZoom, "x", true );
										
										if( $sTemp==="0" || $sTemp ) {
											$aTempProfile['PTZ']['DefaultSpeedZoomX'] = $sTemp;
										}
									}
								} //-- END Part 7.4 - PTZ Default Speed --//
								
								//--------------------------------------------//
								//-- PART 7.5 - PTZ Timeout                 --//
								$aTemp = GetChildTag( $aProfilePTZ, "DefaultPTZTimeout", 1 );
								
								if( $aTemp ) {
									if( isset( $aTemp['+'] ) ) {
										if( isset( $aTemp['+'][0] ) ) {
											$aTempProfile['PTZ']['DefaultTimeout'] = $aTemp['+'][0];
										}
									}
								}
								
								
								//--------------------------------------------//
								//-- PART 7.6 - PTZ PanTiltLimits           --//
								$aProfilePTZPanTiltLimits = GetChildTag( $aProfileVideoEnc, "PanTiltLimits", 1 );
								
								if( $aProfilePTZPanTiltLimits ) {
									//--------------------------------------------//
									//-- PART 7.6.1 - PTZ PTL Range             --//
									$aProfilePTZPanTiltLimitsRange = GetChildTag( $aProfilePTZPanTiltLimits, "Range", 1 );
									
									
									if( $aProfilePTZPanTiltLimitsRange ) {
										//--------------------------------------------//
										//-- PART 7.6.1.1 - PTZ PTL Range X         --//
										$aProfilePTZPanTiltLimitsRangeX = GetChildTag( $aProfilePTZPanTiltLimitsRange, "XRange", 1 );
										
										
										if( $aProfilePTZPanTiltLimitsRangeX ) {
											//--------------------------------------------//
											//-- PART 7.6.1.1.1 - PTZ PTL Range X Min   --//
											$aTemp = GetChildTag( $aProfilePTZPanTiltLimitsRangeX, "Min", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['PanTiltLimitRangeXMin'] = $aTemp['+'][0];
													}
												}
											}
											
											//--------------------------------------------//
											//-- PART 7.6.1.1.2 - PTZ PTL Range X Max   --//
											$aTemp = GetChildTag( $aProfilePTZPanTiltLimitsRangeX, "Max", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['PanTiltLimitRangeXMax'] = $aTemp['+'][0];
													}
												}
											}
										}
										
										//--------------------------------------------//
										//-- PART 7.6.1.2 - PTZ PTL Range Y         --//
										$aProfilePTZPanTiltLimitsRangeY = GetChildTag( $aProfilePTZPanTiltLimits, "YRange", 1 );
										
										
										if( $aProfilePTZPanTiltLimitsRangeY ) {
											//--------------------------------------------//
											//-- PART 7.6.1.2.1 - PTZ PTL Range Y Min   --//
											$aTemp = GetChildTag( $aProfilePTZPanTiltLimitsRangeY, "Min", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['PanTiltLimitRangeYMin'] = $aTemp['+'][0];
													}
												}
											}
											
											//--------------------------------------------//
											//-- PART 7.6.1.2.2 - PTZ PTL Range Y Max   --//
											$aTemp = GetChildTag( $aProfilePTZPanTiltLimitsRangeY, "Max", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['PanTiltLimitRangeYMax'] = $aTemp['+'][0];
													}
												}
											}
										}
									}    //-- ENDIF Part 7.6.1 - PTZ Pan Tilt Limit Range --//
								}    //-- END Part 7.6 - PTZ Pan Tilt Limit --//
								
								
								//--------------------------------------------//
								//-- PART 7.7 - PTZ Zoom Limits             --//
								$aProfilePTZZoomLimits = GetChildTag( $aProfileVideoEnc, "ZoomLimits", 1 );
								
								
								if( $aProfilePTZZoomLimits ) {
									//--------------------------------------------//
									//-- PART 7.7.1 - PTZ Zoom Range            --//
									$aProfilePTZZoomLimitsRange = GetChildTag( $aProfilePTZZoomLimits, "Range", 1 );
									
									
									if( $aProfilePTZZoomLimitsRange ) {
										//--------------------------------------------//
										//-- PART 7.7.1.1 - PTZ Zoom Range X        --//
										$aProfilePTZZoomLimitsRangeX = GetChildTag( $aProfilePTZZoomLimitsRange, "XRange", 1 );
										
										
										if( $aProfilePTZZoomLimitsRangeX ) {
											//--------------------------------------------//
											//-- PART 7.7.1.1.1 - PTZ Zoom Range X Min  --//
											$aTemp = GetChildTag( $aProfilePTZZoomLimitsRangeX, "Min", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['ZoomLimitRangeXMin'] = $aTemp['+'][0];
													}
												}
											}
											
											//--------------------------------------------//
											//-- PART 7.7.1.1.2 - PTZ Zoom Range X Max  --//
											$aTemp = GetChildTag( $aProfilePTZZoomLimitsRangeX, "Max", 1 );
											
											if( $aTemp ) {
												if( isset( $aTemp['+'] ) ) {
													if( isset( $aTemp['+'][0] ) ) {
														$aTempProfile['PTZ']['ZoomLimitRangeXMax'] = $aTemp['+'][0];
													}
												}
											}
										}
									}    //-- ENDIF Part 7.7.1 - PTZ Zoom Limit Range --//
								}    //-- END Part 7.7 - PTZ Zoom Limit --//
							}    //-- END Part 7 - PTZ --//
							
							//echo "\n-- dumping profile custom --\n";
							//echo json_encode( $aTempProfile );
							//echo "\n\n";
							
							
							$aResult[] = $aTempProfile;
							
						}
					}
				}
			}
			
		} else {
			$bError = true;
			$sErrMesg .= "No sub-tag in the Envelope tag!";
		}
		
		//------------------------------------------------------------//
		//-- 9.0 - Return the Results or Error Message              --//
		//------------------------------------------------------------//
		if($bError===false) {
			//-- 9.A - SUCCESS      --//
			return array( "Error"=>false, "Data"=>$aResult );
		} else {
			//-- 9.B - FAILURE      --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	
	public function GetAndExtractStreamURI( $aProfile, $sProtocol, $bStreamMulticast=false ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request. --//
		$sStreamType        = "";                   //-- STRING:        --//
		$sProfileToken      = "";                   //-- STRING:        --//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		
		//--------------------------------//
		//-- Setup the Stream Type      --//
		//--------------------------------//
		if( $bStreamMulticast===true ) {
			$sStreamType = "RTP-Multicast";
		} else {
			$sStreamType = "RTP-Unicast";
		}
		
		//-- Protocol Options (RTSP, UDP, HTTP, TCP) --//
		
		//--------------------------------//
		//-- Extract the Profile Token  --//
		//--------------------------------//
		$sProfileToken = $aProfile['ProfileToken'];
		
		//--------------------------------//
		//-- Create the Security Token  --//
		//--------------------------------//
		$aTokenDetails	= $this->CreateToken();
		
		//--------------------------------//
		//-- Create the Envelope        --//
		//--------------------------------//
		$sEnvelope      .= '<GetStreamUri xmlns="http://www.onvif.org/ver10/media/wsdl">';
		$sEnvelope      .= '<ProfileToken>'.$sProfileToken.'</ProfileToken>';
		$sEnvelope      .= '<StreamSetup>';
		$sEnvelope      .= '<Stream xmlns="http://www.onvif.org/ver10/schema">'.$sStreamType.'</Stream>';
		$sEnvelope      .= '<Transport xmlns="http://www.onvif.org/ver10/schema">';
		$sEnvelope      .= '<Protocol>'.$sProtocol.'</Protocol>';
		$sEnvelope      .= '</Transport>';
		$sEnvelope      .= '</StreamSetup>';
		$sEnvelope      .= '</GetStreamUri>';
		
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aXMLResponse = $this->HTTPOnvifRequest( $sEnvelope );
		
		
		//----------------------------------------------------------------//
		//-- 4.0 - Extract the URI from the XML Response                --//
		//----------------------------------------------------------------//
		
		if( $aXMLResponse['Error']===false ) {
			//-- If the Body Tag of the Envelope exists --//
			$aXMLBody = GetChildTag( $aXMLResponse['Result'], "Body", 1);
			if( $aXMLBody ) {
				//-- Check if StreamUriResponse tag of the Body exists --//
				$aXMLStreamUriResponse = GetChildTag( $aXMLBody, "GetStreamUriResponse", 1 );
				if( $aXMLStreamUriResponse ) {
					
					$aXMLStreamUriMedia = GetChildTag( $aXMLStreamUriResponse, "MediaUri", 1 );
					if( $aXMLStreamUriMedia ) {
						
						$aXMLStreamUriMediaUri = GetChildTag( $aXMLStreamUriMedia, "Uri", 1 );
						if( $aXMLStreamUriMediaUri ) {
							
							if( isset($aXMLStreamUriMediaUri['+']) ) {
								if( isset($aXMLStreamUriMediaUri['+'][0]) ) {
									
									return array(
										"Error"     => false,
										"Uri"       => stripslashes( $aXMLStreamUriMediaUri['+'][0] )
									);
								}
							}
						}
					}
				}
			}
		}
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN Error                                         --//
		//----------------------------------------------------------------//
		return array(
			"Error"     => true,
			"ErrMesg"   => "Couldn't extract the Stream Uri"
		);
	}
	
	
	
	public function ExtractDeviceInformation( $aXMLEnvelope ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$bError                 = false;        //-- BOOLEAN:       --//
		$sErrMesg               = "";           //-- STRING:        --//
		
		$aVideoSourcesList      = array();
		$aResult                = array();
		$aXMLBody               = array();
		$aXMLDeviceInfo         = array();
		
		$aManufacturer          = array();
		$aModel                 = array();
		$aFirmwareVer           = array();
		$aSerialNumber          = array();
		$aHardwareId            = array();
		//----------------------------------------------------------------//
		//-- 2.0 - EXTRACT THE VALUES                                   --//
		//----------------------------------------------------------------//
		
		//echo "\n-- dumping device informations response --\n";
		//echo json_encode( $aXMLEnvelope );
		//echo "\n\n";
		
		//-- If the Body Tag of the Envelope exists --//
		$aXMLBody = GetChildTag( $aXMLEnvelope, "Body", 1);
		if( $aXMLBody ) {
			
			//-- Check if VideoSources tag of the Body exists --//
			$aXMLDeviceInfo = GetChildTag( $aXMLBody, "GetDeviceInformationResponse", 1);
			if( $aXMLDeviceInfo ) {
				
				
				//-- Extract Manufacturer       --//
				$aManufacturer = GetChildTag( $aXMLDeviceInfo, "Manufacturer", 1);
				if( $aManufacturer ) {
					if( isset( $aManufacturer['+'] ) ) {
						if( isset( $aManufacturer['+'][0] ) ) {
							$aResult['Manufacturer'] = $aManufacturer['+'][0];
						}
					}
				}
				
				//-- Extract Model              --//
				$aModel = GetChildTag( $aXMLDeviceInfo, "Model", 1);
				if( $aModel ) {
					if( isset( $aModel['+'] ) ) {
						if( isset( $aModel['+'][0] ) ) {
							$aResult['Model'] = $aModel ['+'][0];
						}
					}
				}
				
				//-- Extract Firmware Version   --//
				$aFirmwareVer = GetChildTag( $aXMLDeviceInfo, "FirmwareVersion", 1);
				if( $aFirmwareVer ) {
					if( isset( $aFirmwareVer['+'] ) ) {
						if( isset( $aFirmwareVer['+'][0] ) ) {
							$aResult['FirmwareVer'] = $aFirmwareVer['+'][0];
						}
					}
				}
				
				//-- Extract Serial Number      --//
				$aSerialNumber = GetChildTag( $aXMLDeviceInfo, "SerialNumber", 1);
				if( $aSerialNumber ) {
					if( isset( $aSerialNumber['+'] ) ) {
						if( isset( $aSerialNumber['+'][0] ) ) {
							$aResult['SerialNumber'] = $aSerialNumber['+'][0];
						}
					}
				}
				
				//-- Extract Hardware Id        --//
				$aHardwareId = GetChildTag( $aXMLDeviceInfo, "HardwareId", 1);
				if( $aHardwareId ) {
					if( isset( $aHardwareId['+'] ) ) {
						if( isset( $aHardwareId['+'][0] ) ) {
							$aResult['HardwareId'] = $aHardwareId['+'][0];
						}
					}
				}
				
			} else {
				//-- Error --//
				$bError   = true;
				$sErrMesg = "No sub-tag matching the requested criteria inside of the Envelope tag";
				
			}
		} else {
			//-- Error --//
			$bError   = true;
			$sErrMesg = "No sub-tag matching the requested criteria inside of the Envelope tag";
			
		}
		
		//------------------------------------------------------------//
		//-- 9.0 - Return the Results or Error Message              --//
		//------------------------------------------------------------//
		if($bError===false) {
			//-- 9.A - SUCCESS		--//
			return array( "Error"=>false, "Data"=>$aResult );
		} else {
			//-- 9.B - FAILURE		--//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	public function GetPTZInfo() {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$aTokenDetails      = $this->CreateToken();
		
		
		//--------------------------------//
		//-- Create the Envelope        --//
		//--------------------------------//
		$sEnvelope      .= '<GetConfigurations xmlns="http://www.onvif.org/ver20/ptz/wsdl/GetConfigurations" />';
	
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	public function PTZRelativeMove( $sProfileToken, $fTransX, $fTransY, $fSpeedX=null, $fSpeedY=null ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request								--//
		//----------------------------------------------------------------//

		//--------------------------------//
		//-- Create the Envelope        --//
		//--------------------------------//
		$sEnvelope      .= '<RelativeMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">';
		$sEnvelope      .= '<ProfileToken>'.$sProfileToken.'</ProfileToken>';
		$sEnvelope      .= '<Translation>';
		$sEnvelope      .= '<PanTilt x="'.$fTransX.'" y="'.$fTransY.'" space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/TranslationGenericSpace" xmlns="http://www.onvif.org/ver10/schema"/>';
		$sEnvelope      .= '</Translation>';
		//-- Add the Speed Controls if applicable --//
//		if( $fSpeedX!==null && $fSpeedY!==null ) {
//			$sEnvelope      .= '	<Speed>';
//			$sEnvelope      .= '		<PanTilt x="'.$fSpeedX.'" y="'.$fSpeedY.'" space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/GenericSpeedSpace" xmlns="http://www.onvif.org/ver10/schema"/>';
//			$sEnvelope      .= '	</Speed>';
//		}
		$sEnvelope      .= '</RelativeMove>';
				
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	public function PTZAbsoluteMove( $sProfileToken, $fPosX, $fPosY, $fZoom ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		//--------------------------------//
		//-- Create the Envelope        --//
		//--------------------------------//

		$sEnvelope      .= '<AbsoluteMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">';
		$sEnvelope      .= '<ProfileToken>'.$sProfileToken.'</ProfileToken>';
		$sEnvelope      .= '<Position>';
		//-- Pan Tilt --//
		if( $fPosX!==false && $fPosY!==false ) {
			$sEnvelope      .= '<PanTilt x="'.$fPosX.'" y="'.$fPosY.'"  space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/PositionGenericSpace" xmlns="http://www.onvif.org/ver10/schema"/>';
		}
		//-- Zoom --//
		if( $fZoom!==false ) {
			$sEnvelope      .= '';
		}
		$sEnvelope      .= '</Position>';
		$sEnvelope      .= '</AbsoluteMove>';
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	
	public function PTZContinousMove( $sProfileToken, $fPosX, $fPosY, $fZoom=false ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//

		//--------------------------------//
		//-- Create the Envelope        --//
		//--------------------------------//
		$sEnvelope      .= '<ContinuousMove xmlns="http://www.onvif.org/ver20/ptz/wsdl">';
		$sEnvelope      .= '<ProfileToken>'.$sProfileToken.'</ProfileToken>';
		$sEnvelope      .= '<Velocity>';
		$sEnvelope      .= '<PanTilt x="'.$fPosX.'" y="'.$fPosY.'" space="http://www.onvif.org/ver10/tptz/PanTiltSpaces/VelocityGenericSpace" xmlns="http://www.onvif.org/ver10/schema"/>';
		$sEnvelope      .= '</Velocity>';
		$sEnvelope      .= '</AbsoluteMove>';
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	
	public function PTZStop( $sProfileToken ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$sEnvelope          = "";                   //-- STRING:        Stores the XML Envelope that is passed as a HTTP POST Parameter in the HTTP Request. --//
		$aResult            = array();              //-- ARRAY:         Stores the Result of the HTTP Request --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - Prepare for HTTP Request                             --//
		//----------------------------------------------------------------//
		$aTokenDetails   = $this->CreateToken();
		//----------------------------------------------------------------//
		//-- 4.0 - Create the Envelope                                  --//
		//----------------------------------------------------------------//
		$sEnvelope      .= '<Stop xmlns="http://www.onvif.org/ver20/ptz/wsdl">';
		$sEnvelope      .= '<ProfileToken>'.$sProfileToken.'</ProfileToken>';
		//$sEnvelope      .= '<PanTilt>';
		//$sEnvelope      .= '</PanTilt>';
		$sEnvelope      .= '</Stop>';
		//----------------------------------------------------------------//
		//-- 3.0 - Execute the HTTP Request                             --//
		//----------------------------------------------------------------//
		$aResult = $this->HTTPOnvifRequest( $sEnvelope );
		
		
		//----------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                       --//
		//----------------------------------------------------------------//
		return $aResult;
	}
	
	
	
	
	
	//================================================================================================//
	//== ADD THE CURRENT BRIDGE TO DATABASE                                                         ==//
	//================================================================================================//
	public function AddThisBridgeToTheDatabase( $iCommId, $iRoomId=-1, $sPostDisplayname ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError         = false;
		$sErrMesg       = "";
		$aLinkData      = array();
		$aLinkResult    = array();
		$aResult        = array();
		$iLinkType      = 0;
		
		$sModelId       = "";
		$sSerialCode    = "";
		$sManufacturer  = "";
		
		//----------------------------------------------------------------//
		//-- 2.0 - LOOKUP ONVIF LINK TYPE                               --//
		//----------------------------------------------------------------//
		$iLinkType      = LookupFunctionConstant("OnvifLinkTypeId");
		
		
		
		//----------------------------------------------------------------//
		//-- 4.0 - LOOKUP DEVICE INFORMATION                            --//
		//----------------------------------------------------------------//
		
		$aDeviceDataTemp = $this->GetDeviceInformation();
		
		//----------------------------------------------------//
		//-- Check for Errors in the Device Information     --//
		//----------------------------------------------------//
		if( $aDeviceDataTemp['Error']===false ) {
			
			//var_dump( $aDeviceDataTemp );
			$bFaultCheck = $this->CheckResponseForFault( $aDeviceDataTemp['Result'] );
			
			//------------------------//
			//-- DEBUGGING          --//
			//var_dump( $aDeviceDataTemp['Result'] );
			//echo "\n\n";
			//-- END DEBUGGING      --//
			//------------------------//
				
			//----------------------------------------//
			//-- ELSE Identified Onvif Server       --//
			//----------------------------------------//
			if( $bFaultCheck===false ) {
				
				$aDeviceData = $this->ExtractDeviceInformation( $aDeviceDataTemp['Result'] );
				
				if( $aDeviceData['Error']===false ) {
					if( isset($aDeviceData["Data"]['Model']) ){
						$sModelId       = $aDeviceData["Data"]['Model'];
					}
					
					if( isset($aDeviceData["Data"]['Model']) ){
						$sSerialCode    = $aDeviceData["Data"]['SerialNumber'];
					}
					
					if( isset($aDeviceData["Data"]['Model']) ){
						$sManufacturer  = $aDeviceData["Data"]['Manufacturer'];
					}
					
					
					$sSerialCode    = $sSerialCode;
					$sLinkName      = $sPostDisplayname;
					$sInfoName      = "Onvif Server ".$sModelId;
					$sInfoManu      = $sManufacturer;
					$sConnAddress   = $this->sNetworkAddress;
				}
				
				
			//----------------------------------------//
			//-- ELSE Unidentified Onvif Server     --//
			//----------------------------------------//
			} else {
				$sSerialCode    = "";
				$sLinkName      = "Unidentified Onvif Server";
				$sInfoName      = "Unidentified Onvif Server";
				$sInfoManu      = "Non-Appliable";
				$sConnAddress   = $this->sNetworkAddress;
			}
			
			
		} else {
			$bError = true;
			$sErrMesg .= "Problem fetching the Device Information!\n";
		}
		
		
		//----------------------------------------------------------------//
		//-- 5.0 - Make sure that the Bridge isn't in the database      --//
		//----------------------------------------------------------------//
		if($bError===false) {
			$aCheckLink = CheckIfLinkAlreadyExists( $iCommId, $sSerialCode, $sConnAddress, $sInfoName );
			
			if( $aCheckLink!==false ) {
				$bError     = true;
				$sErrMesg   = "The Device(Link) already exists in the database\n";
			}
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
				"InfoName"              => $sInfoName,
				"InfoManufacturer"      => $sInfoManu,
				"InfoManufacturerUrl"   => "http://www.onvif.org",
				"ConnFrequencyId"       => "1",
				"ConnProtocolId"        => "1",
				"ConnCryptTypeId"       => "1",
				"ConnAddress"           => $sConnAddress,
				"ConnPort"              => $this->sNetworkPort,
				"ConnName"              => "Onvif Server",
				"ConnUsername"          => $this->sUsername,
				"ConnPassword"          => $this->sPassword,
				"Things"                => array()
			);
			
			
			if( $iRoomId>=1 ) {
				$aLinkData['RoomId'] = $iRoomId;
			}
			//------------------------//
			//-- DEBUGGING          --//
			//echo "\n";
			//var_dump($aLinkData);
			//echo "\n";
			//-- END DEBUGGING      --//
			//------------------------//
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
	//== ADD THE STREAMS AS A DEVICE IN THE DATABASE                                                ==//
	//================================================================================================//
	public function AddStreamsAsThingInDatabase( $iLinkId, $sStreamProfileName, $sThumbnailProfileName, $sOnvifCameraName, $aPostStreamAuth ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError                 = false;            //-- BOOLEAN:   --//
		$sErrMesg               = "";               //-- STRING:    --//
		$aThingData             = array();          //-- ARRAY:     Used to store the Thing data 
		$aThingResult           = array();          //-- ARRAY:     Used to store the results of the function that inserts the Thing and its IOs into the database --//
		$aResult                = array();          //-- ARRAY:     --//
		
		$bFound1                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		$bFound2                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		
		$aStreamProfile         = array();          //-- ARRAY:     Used to hold the desired Stream profile once it has been found from the other profiles --//
		$aThumbProfile          = array();          //-- ARRAY:     Used to hold the desired Thumbnail profile once it has been found from the other profiles --//
		$aIOInfoTemp            = array();          //-- ARRAY:     Used to hold the IO Info lookup 
		$aInsertResult          = array();          //-- ARRAY:     --//
		$bTransactionStarted    = false;            //-- BOOLEAN:   Used to inidicates if a transacation has been started so that either a commit or rollback can be passed to the database --//
		
		$iUTS                   = 0;                //-- INTEGER:   --//
		$iAuthType              = 0;                //-- INTEGER:   --//
		$sUsername              = "";               //-- STRING:    --//
		$sPassword              = "";               //-- STRING:    --//
		
		//-- Global Variables --//
		global $oRestrictedApiCore;
		
		//--------------------------------------------------------------------//
		//-- 2.0 - Lookup the List of Stream Profiles                       --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			$aTempFunctionResult	= $this->GetProfiles();
			
			if( $aTempFunctionResult['Error']===false ) {
				$aProfiles = $this->ExtractProfiles( $aTempFunctionResult['Result'] );
				
				if( $aProfiles['Error']===true ) {
					$bError = true;
					$sErrMesg .= "Failed to extract the Onvif Profiles!\n";
				}
			} else {
				$bError = true;
				$sErrMesg .= "Failed to fetch the Onvif Profiles!\n";
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 3.0 - Fetch each Stream Uri from each profile                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------//
			//-- Reset the "bFound" Variables   --//
			//------------------------------------//
			$bFound1 = false;
			$bFound2 = false;
			
			//------------------------------------//
			//-- FOREACH Profile                --//
			//------------------------------------//
			foreach( $aProfiles['Data'] as $Key => $aProfile ) {
				//------------------------------------------------------------//
				//-- If no match has been found for the "StreamProfile"     --//
				//------------------------------------------------------------//
				if( $bFound1===false ) {
					//----------------------------------------//
					//-- "StreamProfile" match is found     --//
					//----------------------------------------//
					if( $aProfile['ProfileToken']===$sStreamProfileName ) {
						
						//-- Flag that a match has been found for the "StreamProfile" --//
						$bFound1 = true;
						
						//-- Lookup the stream URI --//
						$aStreamUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
						
						//-- IF no Errors --//
						if( $aStreamUri['Error']===false ) {
							//-- IF a Url is returned --//
							if( isset( $aStreamUri['Uri'] ) ) {
								//----------------------------------------//
								//-- SETUP THE STREAM PROFILE ARRAY     --//
								//----------------------------------------//
								$aStreamProfile        = $aProfile;
								$aStreamProfile['Uri'] = $aStreamUri['Uri'];
								
								
								//----------------------------------------------------------------//
								//-- If the "Thumb" profile is the same as the "Stream" profile --//
								//----------------------------------------------------------------//
								if( $sStreamProfileName===$sThumbnailProfileName ) {
									//-- Flag that the "ThumbProfile" has been found --//
									$bFound2 = true;
									//-- Copy the StreamProfile to the ThumbProfile --//
									$aThumbProfile = $aStreamProfile;
								}
								
							//-- Else no stream uri was returned --//
							} else {
								$bError = true;
								$sErrMesg .= "Error looking up the Stream Profile\n";
								$sErrMesg .= "Can't find the Url in the results\n";
							}
							
						//-- Else error looking up the stream URI --//
						} else {
							$bError = true;
							$sErrMesg .= "Error looking up the Stream Profile\n";
							$sErrMesg .= $aStreamUri['ErrMesg']."\n";
						}
					} //-- ELSE do nothing --//
				}
				
				
				//------------------------------------------------------------//
				//-- If no match has been found for the "ThumbProfile"      --//
				//------------------------------------------------------------//
				if( $bFound2===false ) {
					if( $aProfile['ProfileToken']===$sThumbnailProfileName ) {
						
						//-- Flag that a match has been found for the "StreamProfile" --//
						$bFound2 = true;
						
						//-- Lookup the stream URI --//
						$aThumbUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
						
						//-- IF no Errors --//
						if( $aThumbUri['Error']===false ) {
							//--------------------------------//
							//-- IF a Url is returned       --//
							//--------------------------------//
							if( isset( $aThumbUri['Uri'] ) ) {
								//-- SETUP THE STREAM PROFILE ARRAY     --//
								$aThumbProfile        = $aProfile;
								$aThumbProfile['Uri'] = $aThumbUri['Uri'];
								
							//-------------------------------------------
							//-- ELSE error looking up the stream URI --//
							} else {
								$bError = true;
								$sErrMesg .= "Error looking up the Stream Profile\n";
								$sErrMesg .= $aThumbUri['ErrMesg']."\n";
							}
						} //-- ELSE do nothing --//
					} //-- ENDIF Profile matches the "Thumbnail Profile Name" --//
				} //-- ENDIF No matches for thumbanils (bFound2) --//
			} //-- ENDFOREACH Profile --//
			
			
			//------------------------------------------------------------//
			//-- Error Checking                                         --//
			//------------------------------------------------------------//
			if( $bError===false ) {
				if( $bFound1===false && $bFound2===false ) {
					//-- ERROR: Both the "Stream" and "Thumbnail" profiles can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "Both the Stream profile and the Thumbnail profile can not be found!\n";
					
				} else if( $bFound1===false ) {
					//-- ERROR: The "Stream" profile can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "The Stream profile can not be found!\n";
					
				} else if( $bFound2===false ) {
					//-- ERROR: The "Thumbnail" profile can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "The Thumbnail profile can not be found!\n";
					
				}
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 4.0 - Setup AuthType                                           --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------------------------------//
			//-- 4.1 - Setup AuthType                                   --//
			//------------------------------------------------------------//
			if( $aPostStreamAuth!==false && $aPostStreamAuth!==null && isset( $aPostStreamAuth['AuthType'] ) ) {
				//------------------------------------------------------------//
				//-- 6.2.A.1 - Set the AuthType                             --//
				//------------------------------------------------------------//
				
				//--------------------------------------------------------//
				//-- IF AuthType is Link Username and Password          --//
				//--------------------------------------------------------//
				if( $aPostStreamAuth['AuthType']===1 || $aPostStreamAuth['AuthType']==="1" ) {
					$iAuthType = 1;
					
					
				//--------------------------------------------------------//
				//-- ELSEIF AuthType is Custom Username and Password    --//
				//--------------------------------------------------------//
				} else if( $aPostStreamAuth['AuthType']===2 || $aPostStreamAuth['AuthType']==="2" ) {
					$iAuthType = 2;
					
				//--------------------------------------------------------//
				//-- ELSE No extra Auth needed                          --//
				//--------------------------------------------------------//
				} else {
					$iAuthType = 0;
				}
				
				//------------------------------------------------------------//
				//-- 6.2.A.2 - Store the Username and Password              --//
				//------------------------------------------------------------//
				if( $iAuthType===1 || $iAuthType===2 ) {
					//--------------------------------------------//
					//-- Set Variables                          --//
					//--------------------------------------------//
					if( $iAuthType===1 ) {
						$aLinkInfo = dbGetLinkInfo( $iLinkId );
						
						if( $aLinkInfo['Error']===false ) {
							$sUsername = $aLinkInfo['Data']['LinkConnUsername'];
							$sPassword = $aLinkInfo['Data']['LinkConnPassword'];
						}
						
					} else if( $iAuthType===2 ) {
						if( isset( $aPostStreamAuth['Username'] ) ) {
							$sUsername = $aPostStreamAuth['Username'];
						}
						
						if( isset( $aPostStreamAuth['Password'] ) ) {
							$sPassword = $aPostStreamAuth['Password'];
						}
					}
					
					
					//--------------------------------------------//
					//-- Add the Username (and Password)        --//
					//--------------------------------------------//
					if( $sUsername!==null && $sUsername!==false && $sUsername!=="" ) {
						if( $sPassword!==null && $sPassword!==false && $sPassword!=="" ) {
							//----------------------------------------------------//
							//-- Add the Username and password to the URLs      --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $aStreamProfile['Uri'], array( "user"=>$sUsername, "password"=>$sPassword ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbProfile['Uri'],  array( "user"=>$sUsername, "password"=>$sPassword ) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$aStreamProfile['Uri'] = $aFunctionTemp4['Url'];
								$aThumbProfile['Uri']  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
							
						} else {
							//----------------------------------------------------//
							//-- Add the Username to the URLs                   --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $aStreamProfile['Uri'], array( "user"=>$sUsername ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbProfile['Uri'],  array( "user"=>$sUsername) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$aStreamProfile['Uri'] = $aFunctionTemp4['Url'];
								$aThumbProfile['Uri']  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
						}
					}
				}
			} else {
				$iAuthType = 0;
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 5.0 - Insert the Thing into the database                       --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------------------//
			//-- 5.1 - Setup the array of data to insert    --//
			//------------------------------------------------//
			$aThingData = array(
				"Type"           => 12,
				"Name"           => $sOnvifCameraName,
				"State"          => "0",
				"HWId"           => "0",
				"OutputHWId"     => null,
				"SerialCode"     => "0000",
				"IOs"   => array(
					//-- Stream Profile Name --//
					array(
						"RSType"            => "3970",
						"UoM"               => "1",
						"Type"              => "6",
						"Name"              => "Stream Profile",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Stream Url --//
					array(
						"RSType"            => "3971",
						"UoM"               => "1",
						"Type"              => "7",
						"Name"              => "Stream Url",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Thumbnail Profile Name --//
					array(
						"RSType"            => "3972",
						"UoM"               => "1",
						"Type"              => "6",
						"Name"              => "Thumbnail Profile",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Thumbnail Url --//
					array(
						"RSType"            => "3973",
						"UoM"               => "1",
						"Type"              => "7",
						"Name"              => "Thumbnail Url",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Stream Username --//
					array(
						"RSType"            => "3962",
						"UoM"               => "1",
						"Type"              => "7",
						"Name"              => "Username",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Stream Password --//
					array(
						"RSType"            => "3963",
						"UoM"               => "1",
						"Type"              => "7",
						"Name"              => "Password",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					),
					//-- Auth Type --//
					array(
						"RSType"            => "3969",
						"UoM"               => "1",
						"Type"              => "2",
						"Name"              => "AuthType",
						"BaseConvert"       => "1",
						"SampleRate"        => "-1",
						"SampleRateMax"     => "-1",
						"SampleRateLimit"   => "-1"
					)
				)
			);
			
			
			//--------------------------------------------//
			//-- 5.5 - Start the Transaction            --//
			//--------------------------------------------//
			$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
			
			if( $bTransactionStarted===false ) {
				$bError    = true;
				$iErrCode  = 16;
				$sErrMesg .= "Database Error! \n";
				$sErrMesg .= "Problem when trying to start the transaction! \n";
			}
			
			
			//--------------------------------------------//
			//-- 5.6 - Call the Insert Function         --//
			//--------------------------------------------//
			//-- Add the new thing --//
			$aNewThingResult = PrepareAddNewThing( $iLinkId, $aThingData, 0, "", "" );
			
			//-- Check for errors --//
			if( $aNewThingResult["Error"]===true ) {
				//-- Display an Error Message --//
				$bError    = true;
				//$iErrCode  = $aNewThingResult['ErrCode'];
				$sErrMesg .= "Problem Adding a new thing! \n";
				$sErrMesg .= $aNewThingResult["ErrMesg"];
			} else {
				$aResult['Data'][] = $aNewThingResult['Thing'];
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 6.0 - Insert the Profile Names and URLs into the database      --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//-- Store the current time --//
			$iUTS = time();
			
			//----------------------------------------------------------------//
			//-- Foreach IO add the appropriate value to the database       --//
			//----------------------------------------------------------------//
			foreach( $aNewThingResult['Thing']['IOs'] as $iIOId ) {
				if( $bError===false ) {
					if( $iIOId!==null && $iIOId!==false && $iIOId>0 ) {
						//----------------------------------------------------------------//
						//-- Lookup the IO Info                                         --//
						//----------------------------------------------------------------//
						$aIOInfoTemp = GetIOInfo( $iIOId );
						
						if( $aIOInfoTemp['Error']===true ) {
							$bError    = true;
							$iErrCode  = 0;
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
									//-- Stream Profile --//
									case 3970:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sStreamProfileName, true );
										break;
										
									//-- Stream Url --//
									case 3971:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $aStreamProfile['Uri'], true );
										break;
										
									//-- Thumbnail Profile --//
									case 3972:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sThumbnailProfileName, true );
										break;
										
									//-- Thumbnail Url --//
									case 3973:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $aThumbProfile['Uri'], true );
										break;
										
									//-- Username --//
									case 3962:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sUsername, true );
										break;
										
									//-- Password --//
									case 3963:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $sPassword, true );
										break;
										
									//-- AuthType --//
									case 3969:
										$aInsertResult = InsertNewIODataValue( $iIOId, $iUTS, $iAuthType, true );
										break;
										
									//-- Unknown Id --//
									default:
										//echo "<br />\nUnknown RSTypeId!<br />\n";
										//$aInsertResult = array( "Error"=>false );
										break;
										
								}	//-- ENDSWITCH  --//
								
								//----------------------------//
								//-- Check for Errors       --//
								//----------------------------//
								if( $aInsertResult['Error']===true ) {
									$bError = true;
									$sErrMesg .= "Error inserting data in the new IOs!\n";
									$sErrMesg .= $aInsertResult['ErrMesg'];
									$sErrMesg .= "\n";
								}
								
							}	//-- ENDIF RSTypeId is present --//
						}	//-- ENDIF No errors have occurred --//
					}
				}	//-- ENDIF No errors --//
			}	//-- ENDFOREACH IO --//
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
		
		//--------------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                           --//
		//--------------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return array( "Error"=>false, "Data"=>$aResult );
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	
	
	//================================================================================================//
	//== EDIT EXISTING DEVICE IN THE DATABASE                                                       ==//
	//================================================================================================//
	public function EditThingStreamsInDatabase( $iThingId, $sStreamProfileName, $sThumbnailProfileName, $aPostStreamAuth ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError                 = false;            //-- BOOLEAN:   --//
		$sErrMesg               = "";               //-- STRING:    --//
		$aResult                = array();          //-- ARRAY:     --//
		
		
		$aIOList                = array();          //-- ARRAY:     Holds the list of IOs that can be found on the Thing --//
		$bFound1                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		$bFound2                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		
		
		$aThingData             = array();          //-- ARRAY:     Used to store the Thing data 
		$aThingResult           = array();          //-- ARRAY:     Used to store the results of the function that inserts the Thing and its IOs into the database --//
		$aStreamProfile         = array();          //-- ARRAY:     Used to hold the desired Stream profile once it has been found from the other profiles --//
		$aThumbProfile          = array();          //-- ARRAY:     Used to hold the desired Thumbnail profile once it has been found from the other profiles --//
		$aIOInfoTemp            = array();          //-- ARRAY:     Used to hold the IO Info lookup 
		$aInsertResult          = array();          //-- ARRAY:     --//
		$bTransactionStarted    = false;            //-- BOOLEAN:   Used to inidicates if a transacation has been started so that either a commit or rollback can be passed to the database --//
		
		$iUTS                   = 0;                //-- INTEGER:   --//
		$sUsername              = "";               //-- STRING:    --//
		$sPassword              = "";               //-- STRING:    --//
		
		
		$iStreamProfileIOId     = 0;                //-- INTEGER:   --//
		$iStreamUrlIOId         = 0;                //-- INTEGER:   --//
		$iThumbnailProfileIOId  = 0;                //-- INTEGER:   --//
		$iThumbnailUrlIOId      = 0;                //-- INTEGER:   --//
		$iUsernameIOId          = 0;                //-- INTEGER:   --//
		$iPasswordIOId          = 0;                //-- INTEGER:   --//
		$iAuthTypeIOId          = 0;                //-- INTEGER:   --//
		
		$aLinkInfo              = array();          //-- ARRAY:     --//
		$iAuthType              = 0;                //-- INTEGER:   --//
		$sUsername              = "";               //-- STRING:    --//
		$sPassword              = "";               //-- STRING:    --//
		
		//-- Global Variables --//
		global $oRestrictedApiCore;
		
		//-- Constants --//
		$iRSTypeIdStreamProfile    = LookupFunctionConstant("OnvifStreamProfileRSTypeId");
		$iRSTypeIdStreamUrl        = LookupFunctionConstant("OnvifStreamUrlRSTypeId");
		$iRSTypeIdThumbnailProfile = LookupFunctionConstant("OnvifThumbnailProfileRSTypeId");
		$iRSTypeIdThumbnailUrl     = LookupFunctionConstant("OnvifThumbnailUrlRSTypeId");
		$iRSTypeIdUsername         = LookupFunctionConstant("StreamUsernameRSTypeId");
		$iRSTypeIdPassword         = LookupFunctionConstant("StreamPasswordRSTypeId");
		$iRSTypeIdAuthType         = LookupFunctionConstant("StreamAuthTypeRSTypeId");
		
		//--------------------------------------------------------------------//
		//-- 3.1 - Lookup the List of Stream Profiles                       --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			$aTempFunctionResult = $this->GetProfiles();
			
			if( $aTempFunctionResult['Error']===false ) {
				$aProfiles = $this->ExtractProfiles( $aTempFunctionResult['Result'] );
				
				if( $aProfiles['Error']===true ) {
					$bError = true;
					$sErrMesg .= "Failed to extract the Onvif Profiles!\n";
				}
			} else {
				$bError = true;
				$sErrMesg .= "Failed to fetch the Onvif Profiles!\n";
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 3.2 - Fetch each Stream Uri from each profile                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------//
			//-- Reset the "bFound" Variables   --//
			//------------------------------------//
			$bFound1 = false;
			$bFound2 = false;
			
			//------------------------------------//
			//-- FOREACH Profile                --//
			//------------------------------------//
			foreach( $aProfiles['Data'] as $Key => $aProfile ) {
				//------------------------------------------------------------//
				//-- If no match has been found for the "StreamProfile"     --//
				//------------------------------------------------------------//
				if( $bFound1===false ) {
					//----------------------------------------//
					//-- "StreamProfile" match is found     --//
					//----------------------------------------//
					if( $aProfile['ProfileToken']===$sStreamProfileName ) {
						
						//-- Flag that a match has been found for the "StreamProfile" --//
						$bFound1 = true;
						
						//-- Lookup the stream URI --//
						$aStreamUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
						
						//-- IF no Errors --//
						if( $aStreamUri['Error']===false ) {
							//-- IF a Url is returned --//
							if( isset( $aStreamUri['Uri'] ) ) {
								//----------------------------------------//
								//-- SETUP THE STREAM PROFILE ARRAY     --//
								//----------------------------------------//
								$aStreamProfile        = $aProfile;
								$aStreamProfile['Uri'] = $aStreamUri['Uri'];
								
								
								//----------------------------------------------------------------//
								//-- If the "Thumb" profile is the same as the "Stream" profile --//
								//----------------------------------------------------------------//
								if( $sStreamProfileName===$sThumbnailProfileName ) {
									//-- Flag that the "ThumbProfile" has been found --//
									$bFound2 = true;
									//-- Copy the StreamProfile to the ThumbProfile --//
									$aThumbProfile = $aStreamProfile;
								}
								
							//-- Else no stream uri was returned --//
							} else {
								$bError = true;
								$sErrMesg .= "Error looking up the Stream Profile\n";
								$sErrMesg .= "Can't find the Url in the results\n";
							}
							
						//-- Else error looking up the stream URI --//
						} else {
							$bError = true;
							$sErrMesg .= "Error looking up the Stream Profile\n";
							$sErrMesg .= $aStreamUri['ErrMesg']."\n";
						}
					} //-- ELSE do nothing --//
				}
				
				
				//------------------------------------------------------------//
				//-- If no match has been found for the "ThumbProfile"      --//
				//------------------------------------------------------------//
				if( $bFound2===false ) {
					if( $aProfile['ProfileToken']===$sThumbnailProfileName ) {
						
						//-- Flag that a match has been found for the "StreamProfile" --//
						$bFound2 = true;
						
						//-- Lookup the stream URI --//
						$aThumbUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
						
						//-- IF no Errors --//
						if( $aThumbUri['Error']===false ) {
							//--------------------------------//
							//-- IF a Url is returned       --//
							//--------------------------------//
							if( isset( $aThumbUri['Uri'] ) ) {
								//-- SETUP THE STREAM PROFILE ARRAY     --//
								$aThumbProfile        = $aProfile;
								$aThumbProfile['Uri'] = $aThumbUri['Uri'];
								
							//-------------------------------------------
							//-- ELSE error looking up the stream URI --//
							} else {
								$bError = true;
								$sErrMesg .= "Error looking up the Stream Profile\n";
								$sErrMesg .= $aThumbUri['ErrMesg']."\n";
							}
						} //-- ELSE do nothing --//
					} //-- ENDIF Profile matches the "Thumbnail Profile Name" --//
				} //-- ENDIF No matches for thumbanils (bFound2) --//
			} //-- ENDFOREACH Profile --//
			
			
			//--------------------------------//
			//-- Error Checking             --//
			//--------------------------------//
			if( $bError===false ) {
				if( $bFound1===false && $bFound2===false ) {
					//-- ERROR: Both the "Stream" and "Thumbnail" profiles can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "Both the Stream profile and the Thumbnail profile can not be found!\n";
					
				} else if( $bFound1===false ) {
					//-- ERROR: The "Stream" profile can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "The Stream profile can not be found!\n";
					
				} else if( $bFound2===false ) {
					//-- ERROR: The "Thumbnail" profile can't be found --//
					$bError = true;
					$sErrMesg .= "Problem looking up the profiles!\n";
					$sErrMesg .= "The Thumbnail profile can not be found!\n";
				}
			}
			
			//--------------------------------------------------------------------//
			//-- Check if the Username and Password are required on the streams --//
			//--------------------------------------------------------------------//
			//if( isset( $aPostStreamAuth['Username'] ) && isset( $aPostStreamAuth['Password'] ) ) {
			//	$sUsername = $aPostStreamAuth['Username'];
			//	$sPassword = $aPostStreamAuth['Password'];
			//	
			//	
			//	if( $sUsername!==null && $sUsername!==false && $sUsername!=="" ) {
			//		if( $sPassword!==null && $sPassword!==false && $sPassword!=="" ) {
			//			
			//			//-- Add the Username and password to the URLs --//
			//			$aStreamProfile['Uri'] = ParseReplaceAndRebuildUrl( $aStreamProfile['Uri'], array( "user"=>$sUsername, "password"=>$sPassword ) );
			//			$aThumbProfile['Uri']  = ParseReplaceAndRebuildUrl( $aThumbProfile['Uri'],  array( "user"=>$sUsername, "password"=>$sPassword ) );
			//		}
			//	}
			//}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 3.3 - Setup AuthType                                           --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------------------------------//
			//-- 4.1 - Setup AuthType                                   --//
			//------------------------------------------------------------//
			if( $aPostStreamAuth!==false && $aPostStreamAuth!==null && isset( $aPostStreamAuth['AuthType'] ) ) {
				//------------------------------------------------------------//
				//-- 6.2.A.1 - Set the AuthType                             --//
				//------------------------------------------------------------//
				
				//--------------------------------------------------------//
				//-- IF AuthType is Link Username and Password          --//
				//--------------------------------------------------------//
				if( $aPostStreamAuth['AuthType']===1 || $aPostStreamAuth['AuthType']==="1" ) {
					$iAuthType = 1;
					
					
				//--------------------------------------------------------//
				//-- ELSEIF AuthType is Custom Username and Password    --//
				//--------------------------------------------------------//
				} else if( $aPostStreamAuth['AuthType']===2 || $aPostStreamAuth['AuthType']==="2" ) {
					$iAuthType = 2;
					
				//--------------------------------------------------------//
				//-- ELSE No extra Auth needed                          --//
				//--------------------------------------------------------//
				} else {
					$iAuthType = 0;
				}
				
				//------------------------------------------------------------//
				//-- 6.2.A.2 - Store the Username and Password              --//
				//------------------------------------------------------------//
				if( $iAuthType===1 || $iAuthType===2 ) {
					//--------------------------------------------//
					//-- Set Variables                          --//
					//--------------------------------------------//
					if( $iAuthType===1 ) {
						$aLinkInfo = dbGetLinkInfo( $iLinkId );
						
						if( $aLinkInfo['Error']===false ) {
							$sUsername = $aLinkInfo['Data']['LinkConnUsername'];
							$sPassword = $aLinkInfo['Data']['LinkConnPassword'];
						}
						
					} else if( $iAuthType===2 ) {
						if( isset( $aPostStreamAuth['Username'] ) ) {
							$sUsername = $aPostStreamAuth['Username'];
						}
						
						if( isset( $aPostStreamAuth['Password'] ) ) {
							$sPassword = $aPostStreamAuth['Password'];
						}
					}
					
					//--------------------------------------------//
					//-- Add the Username (and Password)        --//
					//--------------------------------------------//
					if( $sUsername!==null && $sUsername!==false && $sUsername!=="" ) {
						if( $sPassword!==null && $sPassword!==false && $sPassword!=="" ) {
							//----------------------------------------------------//
							//-- Add the Username and password to the URLs      --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $aStreamProfile['Uri'], array( "user"=>$sUsername, "password"=>$sPassword ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbProfile['Uri'],  array( "user"=>$sUsername, "password"=>$sPassword ) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$aStreamProfile['Uri'] = $aFunctionTemp4['Url'];
								$aThumbProfile['Uri']  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
							
						} else {
							//----------------------------------------------------//
							//-- Add the Username to the URLs                   --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $aStreamProfile['Uri'], array( "user"=>$sUsername ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbProfile['Uri'],  array( "user"=>$sUsername) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$aStreamProfile['Uri'] = $aFunctionTemp4['Url'];
								$aThumbProfile['Uri']  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
						}
					}
				}
			} else {
				$iAuthType = 0;
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 5.0 - Lookup the IOs that need to be replaced                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//-- List all IOs attached to that Thing --//
			$aTempFunctionResult1 = GetIOsFromThingId( $iThingId );
			//-- Parse the results --//
			if( $aTempFunctionResult1['Error']===false ) {
				
				//-----------------------------------------------------------------------------------------//
				//-- Verify that the 3 desired IO Ids are found and stored to their appropiate variables --//
				//-----------------------------------------------------------------------------------------//
				foreach( $aTempFunctionResult1['Data'] as $aIO ) {
					//----------------------------//
					//-- Stream Profile         --//
					//----------------------------//
					if( $aIO['RSTypeId']===$iRSTypeIdStreamProfile ) {
						$iStreamProfileIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Stream Url             --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdStreamUrl ) {
						$iStreamUrlIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Thumbnail Profile      --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdThumbnailProfile ) {
						$iThumbnailProfileIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Thumbnail Url          --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdThumbnailUrl ) {
						$iThumbnailUrlIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Username               --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdUsername ) {
						$iUsernameIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Password               --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdPassword ) {
						$iPasswordIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Auth Type              --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdAuthType ) {
						$iAuthTypeIOId = $aIO['IOId'];
					}
				} //-- END Foreach --//
				
				
				//----------------------------------------------------//
				//-- IF a IOId couldn't be retrieved                --//
				//----------------------------------------------------//
				if( !($iStreamProfileIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3210;
					$sErrMesg .= "Error Code:'3210' \n";
					$sErrMesg .= "Can not find the 'Stream Profile' IO.\n";
					
				} else if( !($iStreamUrlIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3211;
					$sErrMesg .= "Error Code:'3211' \n";
					$sErrMesg .= "Can not find the 'Stream Url' IO.\n";
					
				} else if( !($iThumbnailProfileIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3212;
					$sErrMesg .= "Error Code:'3212' \n";
					$sErrMesg .= "Can not find the 'Thumbnail Profile' IO.\n";
					
				} else if( !($iThumbnailUrlIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3213;
					$sErrMesg .= "Error Code:'3213' \n";
					$sErrMesg .= "Can not find the 'Thumbnail Url' IO.\n";
					
				} else if( !($iUsernameIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3214;
					$sErrMesg .= "Error Code:'3214' \n";
					$sErrMesg .= "Can not find the 'Username' IO.\n";
					
				} else if( !($iPasswordIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3215;
					$sErrMesg .= "Error Code:'3215' \n";
					$sErrMesg .= "Can not find the 'Password' IO.\n";
					
				} else if( !($iAuthTypeIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 3216;
					$sErrMesg .= "Error Code:'3216' \n";
					$sErrMesg .= "Can not find the 'AuthType' IO.\n";
					
				//----------------------------------------------------//
				//-- ELSE Assume that there isn't any errors        --//
				//----------------------------------------------------//
				} else {
					//--------------------------------------------//
					//-- Setup the current unix timestamp       --//
					//--------------------------------------------//
					$iUTS = time();
					
					//--------------------------------------------//
					//-- Start the Transaction                  --//
					//--------------------------------------------//
					$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
					
					if( $bTransactionStarted===false ) {
						$bError    = true;
						$iErrCode  = 3420;
						$sErrMesg .= "Error Code:'3420' \n";
						$sErrMesg .= "Database Error! \n";
						$sErrMesg .= "Problem when trying to start the transaction! \n";
					}
			
					//--------------------------------------------//
					//-- Insert the new "Stream Profile"        --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iStreamProfileIOId, $iUTS, $sStreamProfileName, true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3421;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Error updating the \"Stream Profile\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Insert the new "Stream Url"            --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iStreamUrlIOId, $iUTS, $aStreamProfile['Uri'], true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3422;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"Stream Url\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Insert the new "Thumbnail Profile"     --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iThumbnailProfileIOId, $iUTS, $sThumbnailProfileName, true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3423;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"Thumbnail Profile\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					
					//--------------------------------------------//
					//-- Insert the new "Thumbnail Url"         --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iThumbnailUrlIOId, $iUTS, $aThumbProfile['Uri'], true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3424;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"Thumbnail Url\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Insert the new "Username"              --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iUsernameIOId, $iUTS, $sUsername, true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3425;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"Username\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Insert the new "Password"              --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iPasswordIOId, $iUTS, $sPassword, true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3426;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"Password\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Insert the new "AuthType"              --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aTempFunctionResult4 = InsertNewIODataValue( $iAuthTypeIOId, $iUTS, $iAuthType, true );
						
						if( $aTempFunctionResult4['Error']===true ) {
							$bError     = true;
							$iErrCode   = 3427;
							$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
							$sErrMesg  .= "Critical Error updating the \"AuthType\" value!\n";
							$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
						}
					}
					
					//--------------------------------------------//
					//-- Create the Result array                --//
					//--------------------------------------------//
					if( $bError===false ) {
						$aResult = array(
							"Error"     => false,
							"Data"      => array(
								array( "Success" => true )
							)
						);
					}
					
				}
			} else {
				//-- Display the error --//
				$bError = true;
				$iErrCode  = 3220;
				$sErrMesg .= "Error Code:'3220' \n";
				$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
				$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 8.0 - Commit or Rollback Transaction                           --//
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
		
		//--------------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                           --//
		//--------------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return $aResult;
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	

	//================================================================================================//
	//== EDIT EXISTING DEVICE IN THE DATABASE                                                       ==//
	//================================================================================================//
	public function EditThingAuthTypeInDB( $iThingId, $aPostStreamAuth ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError                 = false;            //-- BOOLEAN:   --//
		$iErrCode               = 0;                //-- INTEGER:   --//
		$sErrMesg               = "";               //-- STRING:    --//
		$aResult                = array();          //-- ARRAY:     --//
		
		$aIOList                = array();          //-- ARRAY:     Holds the list of IOs that can be found on the Thing --//
		$bFound1                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		$bFound2                = false;            //-- BOOLEAN:   Used to indicate if a profile has been found --//
		
		$aThingData             = array();          //-- ARRAY:     Used to store the Thing data 
		$aThingResult           = array();          //-- ARRAY:     Used to store the results of the function that inserts the Thing and its IOs into the database --//
		$aStreamProfile         = array();          //-- ARRAY:     Used to hold the desired Stream profile once it has been found from the other profiles --//
		$aThumbProfile          = array();          //-- ARRAY:     Used to hold the desired Thumbnail profile once it has been found from the other profiles --//
		$aIOInfoTemp            = array();          //-- ARRAY:     Used to hold the IO Info lookup 
		$aInsertResult          = array();          //-- ARRAY:     --//
		$bTransactionStarted    = false;            //-- BOOLEAN:   Used to inidicates if a transacation has been started so that either a commit or rollback can be passed to the database --//
		
		$iUTS                   = time();           //-- INTEGER:   --//
		$sUsername              = "";               //-- STRING:    --//
		$sPassword              = "";               //-- STRING:    --//
		
		$iStreamProfileIOId     = 0;                //-- INTEGER:   --//
		$iStreamUrlIOId         = 0;                //-- INTEGER:   --//
		$iThumbnailProfileIOId  = 0;                //-- INTEGER:   --//
		$iThumbnailUrlIOId      = 0;                //-- INTEGER:   --//
		$iUsernameIOId          = 0;                //-- INTEGER:   --//
		$iPasswordIOId          = 0;                //-- INTEGER:   --//
		$iAuthTypeIOId          = 0;                //-- INTEGER:   --//
		$iSProfileIODataTypeId  = 0;                //-- INTEGER:   --//
		$iTProfileIODataTypeId  = 0;                //-- INTEGER:   --//
		
		$aLinkInfo              = array();          //-- ARRAY:     --//
		$iAuthType              = 0;                //-- INTEGER:   --//
		$sUsername              = "";               //-- STRING:    --//
		$sPassword              = "";               //-- STRING:    --//
		
		//-- Global Variables --//
		global $oRestrictedApiCore;
		
		//-- Constants --//
		$iRSTypeIdStreamProfile    = LookupFunctionConstant("OnvifStreamProfileRSTypeId");
		$iRSTypeIdStreamUrl        = LookupFunctionConstant("OnvifStreamUrlRSTypeId");
		$iRSTypeIdThumbnailProfile = LookupFunctionConstant("OnvifThumbnailProfileRSTypeId");
		$iRSTypeIdThumbnailUrl     = LookupFunctionConstant("OnvifThumbnailUrlRSTypeId");
		$iRSTypeIdUsername         = LookupFunctionConstant("StreamUsernameRSTypeId");
		$iRSTypeIdPassword         = LookupFunctionConstant("StreamPasswordRSTypeId");
		$iRSTypeIdAuthType         = LookupFunctionConstant("StreamAuthTypeRSTypeId");
		
		
		//--------------------------------------------------------------------//
		//-- 3.1 - Lookup the IOs that need to be replaced                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//-- List all IOs attached to that Thing --//
			$aTempFunctionResult1 = GetIOsFromThingId( $iThingId );
			//-- Parse the results --//
			if( $aTempFunctionResult1['Error']===false ) {
				
				//-----------------------------------------------------------------------------------------//
				//-- Verify that the desired IO Ids are found and stored to their appropiate variables   --//
				//-----------------------------------------------------------------------------------------//
				foreach( $aTempFunctionResult1['Data'] as $aIO ) {
					//----------------------------//
					//-- Stream Profile         --//
					//----------------------------//
					if( $aIO['RSTypeId']===$iRSTypeIdStreamProfile ) {
						$iStreamProfileIOId    = $aIO['IOId'];
						$iSProfileIODataTypeId = $aIO['DataTypeId'];
						
					//----------------------------//
					//-- Stream Url             --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdStreamUrl ) {
						$iStreamUrlIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Thumbnail Profile      --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdThumbnailProfile ) {
						$iThumbnailProfileIOId = $aIO['IOId'];
						$iTProfileIODataTypeId = $aIO['DataTypeId'];
						
					//----------------------------//
					//-- Thumbnail Url          --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdThumbnailUrl ) {
						$iThumbnailUrlIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Username               --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdUsername ) {
						$iUsernameIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Password               --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdPassword ) {
						$iPasswordIOId = $aIO['IOId'];
						
					//----------------------------//
					//-- Auth Type              --//
					//----------------------------//
					} else if( $aIO['RSTypeId']===$iRSTypeIdAuthType ) {
						$iAuthTypeIOId = $aIO['IOId'];
					}
				} //-- END Foreach --//
				
				
				//----------------------------------------------------//
				//-- IF a IOId couldn't be retrieved                --//
				//----------------------------------------------------//
				if( !($iStreamUrlIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 6511;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Can not find the 'Stream Url' IO.\n";
					
				} else if( !($iThumbnailUrlIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 6513;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Can not find the 'Thumbnail Url' IO.\n";
					
				} else if( !($iUsernameIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 6514;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Can not find the 'Username' IO.\n";
					
				} else if( !($iPasswordIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 6515;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Can not find the 'Password' IO.\n";
					
				} else if( !($iAuthTypeIOId>0) ) {
					//-- Id isn't greater than zero --//
					$bError    = true;
					$iErrCode  = 6516;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Can not find the 'AuthType' IO.\n";
				}
			} else {
				//-- Display the error --//
				$bError = true;
				$iErrCode  = 6520;
				$sErrMesg .= "Error Code:'".$iErrCode."' \n";
				$sErrMesg .= "Error when retrieving the IOs from the ThingId \n";
				$sErrMesg .= $aTempFunctionResult1['ErrMesg'];
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 3.2 - Lookup Current URLs                                      --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------------------------------//
			//-- 3.2.1 - Lookup the Most Recent Profile Values          --//
			//------------------------------------------------------------//
			
			//-- Lookup Most Recent Stream Profile --//
			$aFunctionTemp1 = GetIODataMostRecent( $iSProfileIODataTypeId, $iStreamProfileIOId, $iUTS );
			//-- Lookup Most Recent Thumbnail Profile --//
			$aFunctionTemp2 = GetIODataMostRecent( $iTProfileIODataTypeId, $iThumbnailProfileIOId, $iUTS );
			
			if( $aFunctionTemp1['Error']===false && $aFunctionTemp2['Error']===false ) {
				$sStreamProfileName    = $aFunctionTemp1['Data']['Value'];
				$sThumbnailProfileName = $aFunctionTemp2['Data']['Value'];
				
				//----------------------------------------------------//
				//-- Lookup valid profiles from the Device          --//
				//----------------------------------------------------//
				$aFunctionTemp3 = $this->GetProfiles();
				
				if( $aFunctionTemp3['Error']===false ) {
					$aProfiles = $this->ExtractProfiles( $aFunctionTemp3['Result'] );
					
					if( $aProfiles['Error']===true ) {
						$bError    = true;
						$iErrCode  = 6523;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Failed to extract the Onvif Profiles!\n";
					}
				} else {
					$bError    = true;
					$iErrCode  = 6522;
					$sErrMesg .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg .= "Failed to fetch the Onvif Profiles!\n";
				}
			} else {
				$bError    = true;
				$iErrCode  = 6521;
				$sErrMesg .= "Error Code:'".$iErrCode."' \n";
				$sErrMesg .= "Failed to lookup the current profiles from the database.";
			}
			
			
			//------------------------------------------------------------//
			//-- 3.2.2 - Lookup URLs for those Profiles                 --//
			//------------------------------------------------------------//
			if( $bError===false ) {
				//------------------------------------//
				//-- Reset the "bFound" Variables   --//
				//------------------------------------//
				$bFound1 = false;
				$bFound2 = false;
				
				//------------------------------------//
				//-- FOREACH Profile                --//
				//------------------------------------//
				foreach( $aProfiles['Data'] as $Key => $aProfile ) {
					//------------------------------------------------------------//
					//-- If no match has been found for the "StreamProfile"     --//
					//------------------------------------------------------------//
					if( $bFound1===false ) {
						//----------------------------------------//
						//-- "StreamProfile" match is found     --//
						//----------------------------------------//
						if( $aProfile['ProfileToken']===$sStreamProfileName ) {
							
							//-- Flag that a match has been found for the "StreamProfile" --//
							$bFound1 = true;
							
							//-- Lookup the stream URI --//
							$aStreamUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
							
							//-- IF no Errors --//
							if( $aStreamUri['Error']===false ) {
								//-- IF a Url is returned --//
								if( isset( $aStreamUri['Uri'] ) ) {
									$sStreamProfileURL = $aStreamUri['Uri'];
									
									//----------------------------------------//
									//-- SETUP THE STREAM PROFILE ARRAY     --//
									//----------------------------------------//
									//$aStreamProfile        = $aProfile;
									//$aStreamProfile['Uri'] = $aStreamUri['Uri'];
									
									
									//----------------------------------------------------------------//
									//-- If the "Thumb" profile is the same as the "Stream" profile --//
									//----------------------------------------------------------------//
									if( $sStreamProfileName===$sThumbnailProfileName ) {
										//-- Flag that the "ThumbProfile" has been found --//
										$bFound2 = true;
										//-- Copy the StreamURL to the ThumbnailURL --//
										$aThumbnailProfileURL = $sStreamProfileURL;
									}
									
								//-- Else no stream uri was returned --//
								} else {
									$bError = true;
									$iErrCode  = 6532;
									$sErrMesg .= "Error Code:'".$iErrCode."' \n";
									$sErrMesg .= "Error looking up the Stream Profile\n";
									$sErrMesg .= "Can't find the Url in the results\n";
								}
								
							//-- Else error looking up the stream URI --//
							} else {
								$bError = true;
								$iErrCode  = 6531;
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= "Error looking up the Stream Profile\n";
								$sErrMesg .= $aStreamUri['ErrMesg']."\n";
							}
						} //-- ELSE do nothing --//
					}
					
					
					//------------------------------------------------------------//
					//-- If no match has been found for the "ThumbProfile"      --//
					//------------------------------------------------------------//
					if( $bFound2===false ) {
						if( $aProfile['ProfileToken']===$sThumbnailProfileName ) {
							
							//-- Flag that a match has been found for the "StreamProfile" --//
							$bFound2 = true;
							
							//-- Lookup the stream URI --//
							$aThumbUri = $this->GetAndExtractStreamURI( $aProfile, 'RTSP', false );
							
							//-- IF no Errors --//
							if( $aThumbUri['Error']===false ) {
								//--------------------------------//
								//-- IF a Url is returned       --//
								//--------------------------------//
								if( isset( $aThumbUri['Uri'] ) ) {
									$aThumbnailProfileURL = $aThumbUri['Uri'];
									
								//-------------------------------------------
								//-- ELSE error looking up the stream URI --//
								} else {
									$bError = true;
									$iErrCode  = 6533;
									$sErrMesg .= "Error Code:'".$iErrCode."' \n";
									$sErrMesg .= "Error looking up the Stream Profile\n";
									$sErrMesg .= $aThumbUri['ErrMesg']."\n";
								}
							} //-- ELSE do nothing --//
						} //-- ENDIF Profile matches the "Thumbnail Profile Name" --//
					} //-- ENDIF No matches for thumbanils (bFound2) --//
				} //-- ENDFOREACH Profile --//
				
				
				//--------------------------------//
				//-- Error Checking             --//
				//--------------------------------//
				if( $bError===false ) {
					if( $bFound1===false && $bFound2===false ) {
						//-- ERROR: Both the "Stream" and "Thumbnail" profiles can't be found --//
						$bError = true;
						$iErrCode  = 6535;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the profiles!\n";
						$sErrMesg .= "Both the Stream profile and the Thumbnail profile can not be found!\n";
						
					} else if( $bFound1===false ) {
						//-- ERROR: The "Stream" profile can't be found --//
						$bError = true;
						$iErrCode  = 6536;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the profiles!\n";
						$sErrMesg .= "The Stream profile can not be found!\n";
						
					} else if( $bFound2===false ) {
						//-- ERROR: The "Thumbnail" profile can't be found --//
						$bError = true;
						$iErrCode  = 6537;
						$sErrMesg .= "Error Code:'".$iErrCode."' \n";
						$sErrMesg .= "Problem looking up the profiles!\n";
						$sErrMesg .= "The Thumbnail profile can not be found!\n";
					}
				}
			}
		}
		
		
		//--------------------------------------------------------------------//
		//-- 3.3 - Setup AuthType                                           --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//------------------------------------------------------------//
			//-- 3.3.1 - Setup AuthType                                 --//
			//------------------------------------------------------------//
			if( $aPostStreamAuth!==false && $aPostStreamAuth!==null && isset( $aPostStreamAuth['AuthType'] ) ) {
				//------------------------------------------------------------//
				//-- 3.3.1.A.1 - Set the AuthType                           --//
				//------------------------------------------------------------//
				
				//--------------------------------------------------------//
				//-- IF AuthType is Link Username and Password          --//
				//--------------------------------------------------------//
				if( $aPostStreamAuth['AuthType']===1 || $aPostStreamAuth['AuthType']==="1" ) {
					$iAuthType = 1;
					
				//--------------------------------------------------------//
				//-- ELSEIF AuthType is Custom Username and Password    --//
				//--------------------------------------------------------//
				} else if( $aPostStreamAuth['AuthType']===2 || $aPostStreamAuth['AuthType']==="2" ) {
					$iAuthType = 2;
					
				//--------------------------------------------------------//
				//-- ELSE No extra Auth needed                          --//
				//--------------------------------------------------------//
				} else {
					$iAuthType = 0;
				}
				
				//------------------------------------------------------------//
				//-- 3.3.1.A.2 - Store the Username and Password            --//
				//------------------------------------------------------------//
				if( $iAuthType===1 || $iAuthType===2 ) {
					//--------------------------------------------//
					//-- Set Variables                          --//
					//--------------------------------------------//
					if( $iAuthType===1 ) {
						$aLinkInfo = dbGetLinkInfo( $iLinkId );
						
						if( $aLinkInfo['Error']===false ) {
							$sUsername = $aLinkInfo['Data']['LinkConnUsername'];
							$sPassword = $aLinkInfo['Data']['LinkConnPassword'];
						}
						
					} else if( $iAuthType===2 ) {
						if( isset( $aPostStreamAuth['Username'] ) ) {
							$sUsername = $aPostStreamAuth['Username'];
						}
						
						if( isset( $aPostStreamAuth['Password'] ) ) {
							$sPassword = $aPostStreamAuth['Password'];
						}
					}
					
					//--------------------------------------------//
					//-- Add the Username (and Password)        --//
					//--------------------------------------------//
					if( $sUsername!==null && $sUsername!==false && $sUsername!=="" ) {
						if( $sPassword!==null && $sPassword!==false && $sPassword!=="" ) {
							//----------------------------------------------------//
							//-- Add the Username and password to the URLs      --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $sStreamProfileURL, array( "user"=>$sUsername, "password"=>$sPassword ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbnailProfileURL,  array( "user"=>$sUsername, "password"=>$sPassword ) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$sStreamProfileURL     = $aFunctionTemp4['Url'];
								$aThumbnailProfileURL  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$iErrCode  = 6540;
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
							
						} else {
							//----------------------------------------------------//
							//-- Add the Username to the URLs                   --//
							//----------------------------------------------------//
							$aFunctionTemp4 = ParseReplaceAndRebuildUrl( $sStreamProfileURL, array( "user"=>$sUsername ) );
							$aFunctionTemp5 = ParseReplaceAndRebuildUrl( $aThumbnailProfileURL,  array( "user"=>$sUsername) );
							
							if( $aFunctionTemp4['Error']===false && $aFunctionTemp5['Error']===false ) {
								$sStreamProfileURL     = $aFunctionTemp4['Url'];
								$aThumbnailProfileURL  = $aFunctionTemp5['Url'];
							} else {
								$bError    = true;
								$iErrCode  = 6541;
								$sErrMesg .= "Error Code:'".$iErrCode."' \n";
								$sErrMesg .= "Problem adding the username and password to the Url!\n";
							}
						}
					}
				}
			} else {
				$iAuthType = 0;
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 5.0 - Lookup the IOs that need to be replaced                  --//
		//--------------------------------------------------------------------//
		if( $bError===false ) {
			//--------------------------------------------//
			//-- Setup the current unix timestamp       --//
			//--------------------------------------------//
			
			
			//--------------------------------------------//
			//-- Start the Transaction                  --//
			//--------------------------------------------//
			$bTransactionStarted = $oRestrictedApiCore->oRestrictedDB->dbBeginTransaction();
			
			if( $bTransactionStarted===false ) {
				$bError    = true;
				$iErrCode  = 6542;
				$sErrMesg .= "Error Code:'".$iErrCode."' \n";
				$sErrMesg .= "Database Error! \n";
				$sErrMesg .= "Problem when trying to start the transaction! \n";
			}
			
			//--------------------------------------------//
			//-- Insert the new "Stream Url"            --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult4 = InsertNewIODataValue( $iStreamUrlIOId, $iUTS, $sStreamProfileURL, true );
				
				if( $aTempFunctionResult4['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6543;
					$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg  .= "Critical Error updating the \"Stream Url\" value!\n";
					$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
				}
			}
			
			//--------------------------------------------//
			//-- Insert the new "Thumbnail Url"         --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult4 = InsertNewIODataValue( $iThumbnailUrlIOId, $iUTS, $aThumbnailProfileURL, true );
				
				if( $aTempFunctionResult4['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6544;
					$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg  .= "Critical Error updating the \"Thumbnail Url\" value!\n";
					$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
				}
			}
			
			//--------------------------------------------//
			//-- Insert the new "Username"              --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult4 = InsertNewIODataValue( $iUsernameIOId, $iUTS, $sUsername, true );
				
				if( $aTempFunctionResult4['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6545;
					$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg  .= "Critical Error updating the \"Username\" value!\n";
					$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
				}
			}
			
			//--------------------------------------------//
			//-- Insert the new "Password"              --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult4 = InsertNewIODataValue( $iPasswordIOId, $iUTS, $sPassword, true );
				
				if( $aTempFunctionResult4['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6546;
					$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg  .= "Critical Error updating the \"Password\" value!\n";
					$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
				}
			}
			
			//--------------------------------------------//
			//-- Insert the new "AuthType"              --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aTempFunctionResult4 = InsertNewIODataValue( $iAuthTypeIOId, $iUTS, $iAuthType, true );
				
				if( $aTempFunctionResult4['Error']===true ) {
					$bError     = true;
					$iErrCode   = 6547;
					$sErrMesg  .= "Error Code:'".$iErrCode."' \n";
					$sErrMesg  .= "Critical Error updating the \"AuthType\" value!\n";
					$sErrMesg  .= $aTempFunctionResult4['ErrMesg'];
				}
			}
			
			//--------------------------------------------//
			//-- Create the Result array                --//
			//--------------------------------------------//
			if( $bError===false ) {
				$aResult = array(
					"Error"     => false,
					"Data"      => array(
						array( "Success" => true )
					)
				);
			}
		}
		
		//--------------------------------------------------------------------//
		//-- 8.0 - Commit or Rollback Transaction                           --//
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
		
		//--------------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                           --//
		//--------------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return $aResult;
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrCode"=>$iErrCode, "ErrMesg"=>$sErrMesg );
		}
	}
	
	//================================================================================================//
	//== Edit UI Enable PTZ Controls                                                                ==//
	//================================================================================================//
/*	public function EditUIEnabledPTZControls( $iThingId, $iNewValue ) {
		//--------------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                               --//
		//--------------------------------------------------------------------//
		
		
		//--------------------------------------------------------------------//
		//-- 5.0 - MAIN SECTION                                             --//
		//--------------------------------------------------------------------//
		
		
		
		//--------------------------------------------------------------------//
		//-- 8.0 - COMMIT OR ROLLBACK TRANSACTION                           --//
		//--------------------------------------------------------------------//
		
		
		//--------------------------------------------------------------------//
		//-- 9.0 - RETURN RESULTS                                           --//
		//--------------------------------------------------------------------//
		if($bError===false) {
			//-- No Errors --//
			return $aResult;
			
		} else {
			//-- Error Occurred --//
			return array( "Error"=>true, "ErrCode"=>$iErrCode, "ErrMesg"=>$sErrMesg );
		}
	}
*/

	//================================================================================================//
	//== 
	//================================================================================================//
	public function CreateThumbnail( $sUrl, $sThumbnailFilename ) {
		//------------------------------------------------//
		//-- 1.0 -  --//
		//------------------------------------------------//
		$sScript            = "";
		$oOutput            = array();
		
		//------------------------------------------------//
		//-- 3.0 - Prepare the Script to execute        --//
		//------------------------------------------------//
		
		//-- 3.1 - Call ffmpeg --//
		$sScript .= SITE_BASE."/../scripts/run_ffmpeg.sh ";
		//$sScript .= "ffmpeg ";
		
		//-- 3.2 - System Directory --//
		$sScript .= "/system ".SITE_BASE."/..";
		
		//-- 3.3 - Stream Location --//
		$sScript .= " -i ".$sUrl." ";
		
		//-- 3.4 - Sets up the parameters for thumbnails --//
		$sScript .= " -an -vframes 1 -y ";
		
		//-- 3.5 - Thumbnail name --//
		$sScript .= $sThumbnailFilename;
		
		//------------------------------------------------//
		//-- 4.0 - Execute the script                   --//
		//------------------------------------------------//
		$sResult = exec( $sScript, $oOutput );
		
		
		//------------------------------------------------//
		//-- 5.0 - Parse the output                     --//
		//------------------------------------------------//
		return array( 
			"Error" =>false, 
			"Data"  =>array(
				"Script"            => $sScript,
				"Output"            => $oOutput,
				"Result"            => $sResult
			)
		);
	}
	
	
	//================================================================================================//
	//== *DEPRECATED FUNCTION* 
	//================================================================================================//
/*	public function CreateFFMPEGStream( $sUrl, $sFoldername ) {
		//------------------------------------------------//
		//-- 1.0 - Declare Variables                    --//
		//------------------------------------------------//
		$sScript            = "";
		$sFolderPath        = "";
		$sFilePath          = "";
		$oOutput            = array();
		
		
		try {
			//------------------------------------------------//
			//-- 2.0 -            --//
			//------------------------------------------------//
			$sFolderPath = SITE_BASE."/restricted/streams/".$sFoldername;
			$sFilePath   = $sFolderPath."/stream.m3u8";
			
			//------------------------------------------------//
			//-- 3.0 - Check if the folder exists           --//
			//------------------------------------------------//
			if( !file_exists( $sFolderPath ) ) {
				//-- Create the folder --//
				mkdir( $sFolderPath );
			}
			
			//------------------------------------------------//
			//-- 4.0 - Prepare the Script to execute        --//
			//------------------------------------------------//
			
			//-- 4.1 - Call ffmpeg --//
			$sScript .= SITE_BASE."/../scripts/run_ffmpeg.sh ";
			//$sScript .= "ffmpeg ";
			
			//-- 4.2 - System Directory --//
			$sScript .= "/system ".SITE_BASE."/..";
			
			//-- 4.3  --//
			$sScript .= "-v info ";
			
			//-- 4.4 - Stream Location --//
			$sScript .= " -i ".$sUrl." ";
			
			//-- 4.5  --//
			$sScript .= "-c:v copy -c:a copy -bufsize 1835k -pix_fmt yuv420p -flags -global_header -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ";
			
			//-- 4.6 - FolderPath and file --//
			$sScript .= $sFilePath;
			
			//------------------------------------------------//
			//-- 5.0 - Debugging                            --//
			//------------------------------------------------//
			//$aResult = exec($sScript, $oOutput);
			//echo "Success! \n\n".$sScript."\n\n";
			
			//------------------------------------------------//
			//-- 9.0 - Return the Results                   --//
			//------------------------------------------------//
			
			//-- SUCCESS--//
			
			return array( 
				"Error" =>false, 
				"Data"  =>array(
					"Script"            => $sScript,
					//"Output"            => $oOutput,
					//"Result"            => $aResult,
				)
			);
			
		} catch( Exception $e001 ) {
			//-- FAILURE --//
			return array( 
				"Error"   => true, 
				"ErrMesg" => "Critical Error: ".$e001->getMessage()
			);
		}
	}
*/
	
	//================================================================================================//
	//== GET SOAP BODY FROM RESULT                                                                  ==//
	//================================================================================================//
	public function CheckResponseForFault( $aSoapArray ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		
		//-- Declare Variables --//
		$bError         = false;        //-- BOOLEAN:   --//
		$sErrMesg       = "";           //-- STRING:    --//
		$aResult        = array();      //-- ARRAY:     --//
		
		//----------------------------------------------------------------//
		//-- 2.0 - PARSE THE BODY                                       --//
		//----------------------------------------------------------------//
		//-- If the Body Tag of the Envelope exists --//
		$aXMLBody = GetChildTag( $aSoapArray, "Body", 1);
		if( $aXMLBody ) {
			if( isset($aXMLBody['+']) ) {
				//--------------------------------//
				//-- Search for the fault tag   --//
				//--------------------------------// 
				$aBodyFault = GetChildTag( $aXMLBody, "Fault", 1 );
				
				if( $aBodyFault===false ) {
					return false;
				} else {
					return true;
				}
			}
		}
		
		//----------------------------------------------------------------//
		//-- 9.0 -RETURN TRUE BECAUSE OF BODY TAG ISSUE                 --//
		//----------------------------------------------------------------//
		return true;
	}
	
	
	
	//================================================================================================//
	//== HTTP ONVIF REQUEST FUNCTION                                                                ==//
	//================================================================================================//
	protected function HTTPOnvifRequestSend( $sPOSTData ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aResult        = array();      //-- ARRAY:         Used to hold the result of if this function succeeded or failed in getting the desired result.	--//
		$sURL           = "";           //-- STRING:        --//
		
		
		//----------------------------------------------------------------//
		//-- 2.0 - PREAPARE FOR HTTP REQUEST                            --//
		//----------------------------------------------------------------//
		$sURL		= $this->sDeviceOnvifUrl;
		
		$oRequest	= curl_init();
		curl_setopt( $oRequest, CURLOPT_URL,                $sURL       );
		//-- TODO: Re-implement Proxy Code if needed --//
		curl_setopt( $oRequest, CURLOPT_CONNECTTIMEOUT,     3           );
		curl_setopt( $oRequest, CURLOPT_TIMEOUT,            4           );
		curl_setopt( $oRequest, CURLOPT_RETURNTRANSFER,     true        );
		curl_setopt( $oRequest, CURLOPT_SSL_VERIFYPEER,     false       );
		curl_setopt( $oRequest, CURLOPT_SSL_VERIFYHOST,     false       );
		curl_setopt( $oRequest, CURLOPT_POST,               true        );
		curl_setopt( $oRequest, CURLOPT_POSTFIELDS,         $sPOSTData  );
		curl_setopt( $oRequest, CURLOPT_HTTPHEADER,         array( 
			'Content-Type: text/xml; charset=utf-8', 
			'Content-Length: '.strlen( $sPOSTData )
		));
		
		$oHTTPRequestResult = curl_exec( $oRequest );
		
		//--------------------------------------------------------//
		//-- IF there isn't a result from the HTTP Request      --//
		//--------------------------------------------------------//
		if( $oHTTPRequestResult===false ) {
			$aResult = array(
				"Error"     => true,
				"ErrMesg"   => "Error! Couldn't execute \"Onvif\" command! ".json_encode( $sPOSTData )
			);
		
		//--------------------------------------------------------//
		//-- ELSE then there isn't an error                     --//
		//--------------------------------------------------------//
		} else {
			$aResult = array(
				"Error"     => false,
				"Result"    => XmlConversion($oHTTPRequestResult)
			);
		}
		
		return $aResult;
	}
	
	
	protected function HTTPOnvifRequest( $sEnvelopeContent, $sEnvelopeType="Default" ) {
		//----------------------------------------------------------------//
		//-- 1.0 - INITIALISE                                           --//
		//----------------------------------------------------------------//
		$aTokenDetails = array();
		$sEnvelope     = "";
		
		//----------------------------------------------------------------//
		//-- 3.0 - WORKOUT THE ENVELOPE TYPE                            --//
		//----------------------------------------------------------------//
		if( $sEnvelopeType!=="Basic" && $sEnvelopeType!=="SecurityUsernameToken" ) {
			if( $this->bEnvelopeSecurity!==false ) {
				$sEnvelopeType = "SecurityUsernameToken";
			} else {
				$sEnvelopeType = "Basic";
			}
		}
		
		//----------------------------------------------------------------//
		//-- 4.0 -                                                      --//
		//----------------------------------------------------------------//
		if( $sEnvelopeType==="SecurityUsernameToken" ) {
			$aTokenDetails   = $this->CreateToken();
		}
		
		//----------------------------------------------------------------//
		//-- 5.0 - ADD THE HEADER AND FOOTER                            --//
		//----------------------------------------------------------------//
		$sEnvelope     .= $this->CreateStartOfEnvelope( $sEnvelopeType, $aTokenDetails );
		$sEnvelope     .= $sEnvelopeContent;
		$sEnvelope     .= $this->CreateEndOfEnvelope( $sEnvelopeType );
		
		
		//----------------------------------------------------------------//
		//-- 6.0 - EXECUTE AND RETURN                                   --//
		//----------------------------------------------------------------//
		return $this->HTTPOnvifRequestSend( $sEnvelope );
		
		
	}
	
	
	protected function CreateStartOfEnvelope( $sEnvelopeType, $aData ) {
		//----------------------------------------------------//
		//-- 1.0 - INITIALISE                               --//
		//----------------------------------------------------//
		$sReturn        = "";       //-- STRING:        --//
		$sUsername      = "";       //-- STRING:        --//
		$sPassword      = "";       //-- STRING:        --//
		$sNonce         = "";       //-- STRING:        --//
		$sCreated       = "";       //-- STRING:        --//
		
		//----------------------------------------------------//
		//-- 2.0 - RETURN THE RESULTS                       --//
		//----------------------------------------------------//
		switch( $sEnvelopeType ) {
			case "Basic":
				$sReturn	.= '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">';
				$sReturn	.= '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
				break;
				
			case "SecurityUsernameToken":
				$sReturn	.= '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">';
				$sReturn	.= '<s:Header>';
				$sReturn	.= '<Security s:mustUnderstand="1" xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">';
				$sReturn	.= '<UsernameToken>';
				$sReturn	.= '<Username>'.$aData['Username'].'</Username>';
				$sReturn	.= '<Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">'.$aData['PassDigest'].'</Password>';
				$sReturn	.= '<Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">'.$aData['Nonce'].'</Nonce>';
				$sReturn	.= '<Created xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'.$aData['Timestamp'].'</Created>';
				$sReturn	.= '</UsernameToken>';
				$sReturn	.= '</Security>';
				$sReturn	.= '</s:Header>';
				$sReturn	.= '<s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
				break;
		}
		
		//----------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                       --//
		//----------------------------------------------------//
		return $sReturn;
		
	}
	
	
	protected function CreateEndOfEnvelope( $sEnvelopeType ) {
		//----------------------------------------------------//
		//-- 1.0 - INITIALISE                               --//
		//----------------------------------------------------//
		$sReturn    = "";    //-- STRING:       --//
		
		//----------------------------------------------------//
		//-- 2.0 - RETURN THE RESULTS                       --//
		//----------------------------------------------------//
		switch( $sEnvelopeType ) {
			case "Basic":
				$sReturn	.= '</s:Body>';
				$sReturn	.= '</s:Envelope>';
				break;
				
			case "SecurityUsernameToken":
				$sReturn	.= '</s:Body>';
				$sReturn	.= '</s:Envelope>';
				break;
		}
		
		//----------------------------------------------------//
		//-- 9.0 - RETURN THE RESULTS                       --//
		//----------------------------------------------------//
		return $sReturn;
	}
	
	
	
	protected function CreateToken() {
		
		$iTimestamp     = date( 'Y-m-d\TH:i:s.000\Z', (time() - $this->iDeltaTime) );
		$sUsername      = $this->sUsername;
		$sPassword      = $this->sPassword;
		$iNonce         = mt_rand();
		
		
		$sPassDigest = base64_encode( pack( 'H*', sha1( pack( 'H*', $iNonce ) . pack( 'a*', $iTimestamp ) . pack( 'a*', $sPassword ) ) ) );
		
		
		return array(
			"Username"      => $sUsername,
			"PassDigest"    => $sPassDigest,
			"Nonce"         => base64_encode( pack( 'H*', $iNonce ) ),
			"Timestamp"     => $iTimestamp
		);
	}
}
	
?>