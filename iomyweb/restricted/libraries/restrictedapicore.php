<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: This is the core component that allows a User access to the iOmy Database.
//==         It handles logging in/out of the database as well as well as loading required PHP Libraries
//==         so that the required PHP APIs and Odata Services have their requirements
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



//========================================//
//== NOTES                              ==//
//========================================//
//-- 
//-- The encryption method came from stackoverflow and was created by ircmaxell and Getz
//-- URL:   http://stackoverflow.com/questions/5089841/two-way-encryption-i-need-to-store-passwords-that-can-be-retrieved/5093422#5093422
//-- We will need to replace this another method in the future as mcrypt is being deprecated --//




//========================================//
//== TODO LIST                          ==//
//========================================//
//-- *  Make a php object in order to better protect the variables that are contained in here                   --//
//-- ** NOTE: Unset the configuration variables that are only used to setup the "RestrictedAPICore" that        --//
//--        setup the object to help protect the "RestrictedAPIs" section against php attacks.                  --//



//========================================================================================================//
//== #1.0# - INITIALSE                                                                                  ==//
//========================================================================================================//


//------------------------------------------------//
//-- #1.1# - Configure Variables                --//
//------------------------------------------------//
if (!defined('SITE_BASE')) {
	@define('SITE_BASE', dirname(__FILE__).'/../..');
}


//------------------------------------------------//
//-- #1.2# - Load Required Libraries            --//
//------------------------------------------------//
require_once SITE_BASE.'/restricted/config/iomy_vanilla.php';
require_once SITE_BASE.'/restricted/libraries/constants.php';
require_once SITE_BASE.'/restricted/libraries/dbmysql.php';
require_once SITE_BASE.'/restricted/libraries/functions.php';
require_once SITE_BASE.'/restricted/libraries/userauth.php';



class RestrictedAPICore {
	//====================================================//
	//== 1.0 - CLASS VARIABLE DECLARATION               ==//
	//====================================================//
	
	//-- 1.1 - Protected Variables --//
	protected   $aEncrytionVars         = array();      //-- ARRAY:     --//
	protected   $aPrimaryDBConfig       = array();      //-- ARRAY:     --//
	protected   $aIOMyDBVersion         = array();      //-- ARRAY:     Used to indicate what version the database is so that it can be compared against the API Version to see if it is compatible --//
	protected   $aDBServerAddons        = array();      //-- ARRAY:     --//
	protected   $bVanillaIOMy           = false;        //-- BOOLEAN:   Used to indicate if the Database is still in a vanilla state--//
	protected   $bDemoMode              = false;        //-- BOOLEAN:   A special state used to let the UI know that the server is not functioning --//
	protected   $bMaintenanceMode       = false;        //-- BOOLEAN:   A special state used to let the UI know if the server is in maintenance mode --//
	
	
	//-- 1.2 - Public Variables --//
	public      $bRestrictedDB          = false;        //-- BOOLEAN:   Used to indicate when the primary database connection has been setup. --//
	public      $bSecondaryDB           = false;        //-- BOOLEAN:   Used to indicate when the special database connection has been setup. --//
	public      $bValidSession          = false;        //-- BOOLEAN:   This is used to flag if the User has a valid session. Default is set to false --//
	public      $bLoginResult           = false;        //-- BOOLEAN:   This is used to flag if the User succeeded in logging in. --//
	public      $bDebugging             = false;        //-- BOOLEAN:   Used to indicate that the iOmy Server is in debugging mode.  --//
	public      $sDebugMessage          = "";           //-- STRING:    Used to hold the debugging message. --//
	public      $oRestrictedDB;                         //-- OBJECT:    Declare the main database connection. Default is set to false. --//
	public      $oSecondaryDB;                          //-- OBJECT:    --//
	
	
	
	//====================================================//
	//== 2.0 - Class Construction functions             ==//
	//====================================================//
	function __construct( $aConfig ) {
		//--------------------------------------------------------------------//
		//-- Declare Variables                                              --//
		//--------------------------------------------------------------------//
		
		//-- Local variables --//
		$iDBId                  = 0;            //-- INTEGER:   --//
		$iCurrentIP             = 0;            //-- INTEGER:   --//
		$bValidParameter        = false;        //-- BOOLEAN:   --//
		
		
		//--------------------------------------------------------------------//
		//-- If the Config is setup                                         --//
		//--------------------------------------------------------------------//
		if( isset($aConfig['Core']) ) {
			if( isset($aConfig['Core']['CryptKey']) ) {
				
				//--------------------------------------------------------------------//
				//-- 2.1 - Setup the Encryption Variables                           --//
				//--------------------------------------------------------------------//
				$this->aEncrytionVars = array(
					"cipher"        => MCRYPT_BLOWFISH,
					"mode"          => MCRYPT_MODE_CBC,
					"iRounds"       => 1000,
					"sCryptKey"     => $aConfig['Core']['CryptKey']
				);
				
				if( isset( $aConfig['Debug']['restrictapicore_login'] ) ) {
					$this->bDebugging = $aConfig['Debug']['restrictapicore_login'];
				}
				
				//--------------------------------------------------------------------//
				//-- 2.2 - PHP Session                                              --//
				//--------------------------------------------------------------------//
				session_start();
				
				
				
				
				
				//--------------------------------------------------------------------//
				//-- 2.3.A - If the User attempting to login                        --//
				//--------------------------------------------------------------------//
				$bAttemptLogin = false;
				
				
				if( isset($_POST['AttemptLogin'] ) ) {
					switch( $_POST['AttemptLogin'] ) {
						case "TRUE":
							$bAttemptLogin = true;
							break;
						case "True":
							$bAttemptLogin = true;
							break;
						case "true":
							$bAttemptLogin = true;
							break;
						case "1":
							$bAttemptLogin = true;
							break;
						case 1:
							$bAttemptLogin = true;
							break;
						case true:
							$bAttemptLogin = true;
							break;
							
					}
				}
				
				if( $bAttemptLogin ) {
					$iDBId = 0;
					
					//--------------------------------------------------------------------//
					//-- STEP 1: Perform Checks on the Login                            --//
					//--------------------------------------------------------------------//
					//-- This makes sure that a blacklisted parameters are not used --//
					$bValidParameter = $this->userauth_checkparameters( $_POST['username'], $_POST['password'] );
					
					
					//--------------------------------------------------------------------//
					//-- STEP 2 - If valid then attempt a connection to the database    --//
					//--------------------------------------------------------------------//
					if( $bValidParameter===true ) {
						//-- Store the config inside a protected variable --//
						$this->aPrimaryDBConfig = $aConfig['DB'][$iDBId];
						
						//-- Open the Database connection --//
						$this->oRestrictedDB = new DBMySQL(
							$this->aPrimaryDBConfig,
							$_POST['username'],
							$_POST['password']
						);
						
						
						//-- Check if the DB connection succeeded --//
						if( $this->oRestrictedDB->Initialised===true ) {
							//----------------------------------//
							//-- LOGIN ATTEMPT WAS SUCCESSFUL --//
							//----------------------------------//
							
							//-- STORE THE USER DETAILS IN THE SESSION INFORMATION --//
							$_SESSION['User']                   = array();
							$_SESSION['User'][SESSION_LOGGEDIN] = true;
							$_SESSION['User'][SESSION_LASTON]   = time();
							$_SESSION['User'][SESSION_USER]     = $this->encrypt( $_POST['username'] );
							$_SESSION['User'][SESSION_PASSWORD] = $this->encrypt( $_POST['password'] );
							$_SESSION['User'][SESSION_IP]       = getenv( "REMOTE_ADDR" );
							
							//-- FLAG THAT THE LOGIN ATTEMPT IS SUCCESSFUL --//
							$this->bLoginResult  = true;
							//-- FLAG THAT THERE IS ACCESS TO THE RESTRICTED DATABASE --//
							$this->bRestrictedDB = true;
							
							//-- DEBUGGING --//
							if( $this->bDebugging===true ) { 
								$this->sDebugMessage .= "DB_Connection! \n"; 
							}
							
						} else {
							//----------------------------------//
							//-- LOGIN ATTEMPT HAD AN ERROR   --//
							//----------------------------------//
							$this->bLoginResult = false;
							
							sleep(1);
							
							//-- DEBUGGING --//
							if( $this->bDebugging===true ) { 
								$this->sDebugMessage .= "DB_Rejection!\n";
							}
						}
					} else {
						//-- DEBUGGING --//
						if( $this->bDebugging===true ) { 
							$this->sDebugMessage .= "Username and Password failed the basic checks! \n";
						}
					}
					
					//--------------------------------------------------------------------//
					//-- STEP 3 - Setup Server Version Variables                        --//
					//--------------------------------------------------------------------//
					if( $this->bLoginResult===true && $this->bRestrictedDB===true ) {
						
						//-- Setup the array --//
						$_SESSION['SoftwareVersion'] = array(
							"Main"         => array(),
							"Addons"       => array(),
							"DemoMode"     => false,
							"VanillaMode"  => false
						);
						
						
						
						//-- Fetch the Server Version --//
						$aServerVersionTemp = dbSpecialGetServerVersion( $this->oRestrictedDB );
						
						//-- Check for errors --//
						if( $aServerVersionTemp['Error']===false ) {
							//-- Extract the VersionIds --//
							$this->aIOMyDBVersion = $aServerVersionTemp['Data'];
							
							//-- Store the Version in the session that way we don't have to poll it evertime --//
							$_SESSION['SoftwareVersion']['Main'] = $this->CheckDBVersion();
							
							//--------------------------------------------------------//
							//-- STEP 3.2 - Lookup Addons                           --//
							//--------------------------------------------------------//
							$aServerAddonsTemp = dbSpecialGetServerAddonVersions( $this->oRestrictedDB, $aServerVersionTemp['Data']['CoreId'] );
							
							if( $aServerAddonsTemp['Error']===false ) {
								//--------------------------------------------//
								//-- OPTION A: ADDONS DETECTED              --//
								//--------------------------------------------//
								
								//-- Store the Server version --//
								$this->aDBServerAddons = $aServerAddonsTemp['Data'];
								
								//-- Store the Server Addons in the session --//
								$_SESSION['SoftwareVersion']['Addons'] = $aServerAddonsTemp['Data'];
								
								//-- Setup a variable to check if a non-standard add-on is installed --//
								$bNonStandardAddon = false;
								
								//-- Check if the server is in demonstration mode --//
								foreach( $this->aDBServerAddons as $aDBServerAddon ) {
									
									if( $aDBServerAddon['AddonName']==="Demo Mode" ) {
										//--------------------------------------------//
										//-- OPTION A: DEMO MODE                    --//
										//--------------------------------------------//
										$this->bDemoMode = true;
										$_SESSION['SoftwareVersion']['DemoMode'] = true;
										//-- Flag that the Demo Data Addon is installed --//
										$bNonStandardAddon = true;
										
									} else if( $aDBServerAddon['AddonName']==="iOmy (Vanilla)" ) {
										//-- Non-standard add-on detected --//
										$bNonStandardAddon = true;
									}
								}
								
								if( $bNonStandardAddon===false ) {
									//--------------------------------------------//
									//-- OPTION B: VANILLA IOMY                 --//
									//--------------------------------------------//
									$this->bVanillaIOMy = true;
									$_SESSION['SoftwareVersion']['VanillaMode'] = true;
									
								} else {
									//--------------------------------------------//
									//-- OPTION C: IOMY WITH ADDONS             --//
									//--------------------------------------------//
									$this->bVanillaIOMy = false;
									$_SESSION['SoftwareVersion']['VanillaMode'] = false;
								}
								
							} else {
								//--------------------------------------------//
								//-- OPTION E: FAILED TO LOAD ADDONS        --//
								//--------------------------------------------//
								
							}
						} else {
							//--------------------------------------------//
							//-- OPTION F: FAILED TO LOAD VERSION       --//
							//--------------------------------------------//
							
						} //-- END OF VERSION --//
					}
					
					//--------------------------------------------------------------------//
					//-- STEP 4 - Setup User Data                                       --//
					//--------------------------------------------------------------------//
					if( $this->bLoginResult===true && $this->bRestrictedDB===true ) {
						$this->LoadUserDataIntoSession();
					}
					
					//--------------------------------------------------------------------//
					//-- STEP 5 - CLEANUP VARIABLES                                     --//
					//--------------------------------------------------------------------//
					$_POST['username'] = "";
					$_POST['password'] = "";
					
					
				//--------------------------------------------------------------------//
				//-- 2.1.B - ELSEIF check if the User is logged in                  --//
				//--------------------------------------------------------------------//
				} else {
					//--------------------------------------------------------------------//
					//-- VERIFICATION STEP 1: Is the User Session's Info setup          --//
					//--------------------------------------------------------------------//
					if( isset($_SESSION['User'][SESSION_LOGGEDIN]) ) {
						//--------------------------------------------------------------------//
						//-- VERIFICATION STEP 2: Is the User flagged as logged in          --//
						//--------------------------------------------------------------------//
						if( $_SESSION['User'][SESSION_LOGGEDIN]===true ) {
							
							//-- Get the Users IP Address --//
							$iCurrentIP = getenv("REMOTE_ADDR");
							
							//---------------------------------------------------------------------//
							//-- VERIFICATION STEP 3: Is the User still using the same ipaddress --//
							//---------------------------------------------------------------------//
							if( isset($_SESSION['User'][SESSION_IP]) ) {
								if( $_SESSION['User'][SESSION_IP]===$iCurrentIP ) {
									//--  --//
									$dSessionExpirary = time() - SESSION_LOGOUTTIME;
									
									//--------------------------------------------------------------------//
									//-- VERIFICATION STEP 4: Check if Session has expired              --//
									//--------------------------------------------------------------------//
									if( isset($_SESSION['User'][SESSION_LASTON]) && $_SESSION['User'][SESSION_LASTON]>=($dSessionExpirary) ) {
										//-- Set last update to the current time --//
										$_SESSION['User'][SESSION_LASTON] = time();
										
										//----------------------------------------------------------------------//
										//-- VERIFICATION STEP 5: Is the Username and Password in the session --//
										//----------------------------------------------------------------------//
										if( isset($_SESSION['User'][SESSION_USER]) && isset($_SESSION['User'][SESSION_PASSWORD]) ) {
											//--------------------------------------------------------------------//
											//-- VERIFICATION STEP 6: Is the Username and Password valid        --//
											//--------------------------------------------------------------------//
											if( (trim($_SESSION['User'][SESSION_USER])!=="" ) && (trim($_SESSION['User'][SESSION_PASSWORD])!=="") ) {
												//----------------------------------------------------------------------------------//
												//-- VERIFICATION STEP 7: Connect to the Database using the decrypted credentials --//
												//----------------------------------------------------------------------------------//
												$iDBId = 0;
												
												//-- Store the config inside a protected variable --//
												$this->aPrimaryDBConfig = $aConfig['DB'][$iDBId];
												
												//-- Open the Database connection --//
												$this->oRestrictedDB = new DBMySQL(
													$this->aPrimaryDBConfig, 
													$this->decrypt( $_SESSION['User'][SESSION_USER] ),
													$this->decrypt( $_SESSION['User'][SESSION_PASSWORD] )
												);
												
												//--------------------------------------------------------------------//
												//-- VERIFICATION STEP 8: Check if the DB connection succeeded      --//
												//--------------------------------------------------------------------//
												if( $this->oRestrictedDB->Initialised===true ) {
													//-- Flag that the session is valid so that the session won't be purged --//
													$this->bValidSession = true;
													$this->bRestrictedDB = true;
													
													//-- DEBUGGING --//
													if( $this->bDebugging===true ) { 
														$this->sDebugMessage .= "API Access Granted!\n";
													}
													
													//--------------------------------------------------------------------//
													//-- Check that the user account is still active                    --//
													//--------------------------------------------------------------------//
													$this->LookupUserData();
													
													//--------------------------------------------------------------------//
													//-- Load the Session data                                          --//
													//--------------------------------------------------------------------//
													$this->LoadSessionData();
													
													
												} else {
													//--------------------------------------------------//
													//-- Failed to initialise the Database Connection --//
													//--------------------------------------------------//
													
													//-- DEBUGGING --//
													if( $this->bDebugging===true ) { 
														$this->sDebugMessage .= "Failed to open the Database connection!\n";
													}
												}
											}
										}
									} else {
										//-- DEBUGGING --//
										if( $this->bDebugging===true ) { 
											$this->sDebugMessage .= "Session over 15 minutes!\n";
										}
									}
								} else {
									//-- DEBUGGING --//
									if( $this->bDebugging===true ) { 
										$this->sDebugMessage .= "IP Address does not match!\n";
									}
								}
							} else {
								//-- DEBUGGING --//
								if( $this->bDebugging===true ) { 
									$this->sDebugMessage .= "IP Address does not appear to be setup in the session!\n";
								}
							}
							//-- Purge the IP Address --//
							unset($iCurrentIP);
						}
					} else {
						//-- DEBUGGING --//
						if( $this->bDebugging===true ) { 
							$this->sDebugMessage .= "User doesn't have valid session data so the User will need to log in!\n";
						}
					}
				}
				
				
				//--------------------------------------------------------------------//
				//-- 2.5 - IF ANYTHING WENT WRONG THEN PURGE THE SESSION            --//
				//--------------------------------------------------------------------//
				if( $this->bValidSession===false && $this->bLoginResult===false ) {
					
					//-- PURGE THE SESSION INFORMATION --//
					$this->userauth_logout();
					
					//-- DEBUGGING --//
					if( $this->bDebugging===true && $this->sDebugMessage==="" ) { 
						$this->sDebugMessage .= "User either failed to login or doesn't have a valid login session!\n";
						
					}
				}
				
				
				//-- Mark that all changes to the Session are completed and release it --//
				session_write_close();
				
			} else {
				//-- ERROR: No Crypt Key was found in the session --//
				$this->UserAuth_ServerNotDeployed();
			}
		} else {
			//-- ERROR: No Config was found --//
			$this->UserAuth_ServerNotDeployed();
		}
	}
	
	
	function __destruct() {
		
		
		
	}
	
	
	//====================================================//
	//== 3.0 - Mini Misc Functions                      ==//
	//====================================================//
	public function VerifyPassword( $sCurrentPassword ) {
		
		if( gettype($sCurrentPassword)==="string" ) {
			if( $this->decrypt($_SESSION['User'][SESSION_PASSWORD])===$sCurrentPassword ) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	
	
	
	//----------------------------------------------------------------------------//
	//-- #3.2# - LOGIN PARAMETER CHECK FUNCTION                                 --//
	//----------------------------------------------------------------------------//
	private function userauth_checkparameters( $sUname, $sPword ) {
		//------------------------------------------------//
		//-- 1.0 - Initialise Variables                 --//
		//------------------------------------------------//
		
		//-- 1.2 - --//
		$bAbortLogin = false;   //-- BOOLEAN: Flag used to indicate if the login attempt has failed and not to continue --//
		
		//----------------------------------------------------------------------------------//
		//-- 2.0 - Check to see if the username has a space at the start or the end of it --//
		//----------------------------------------------------------------------------------//
		if( $bAbortLogin===false ) {
			
			//-- Uname --//
			$sTest = trim($sUname);
			if( empty($sTest)===true ) {
				
				//-- Flag that the uname is invalid --//
				$bAbortLogin = true;
				
				//-- DEBUGGING --//
				if( $this->bDebugging===true ) { 
					$this->sDebugMessage = "No Username or Password!\n";
				}
			}
			
			//-- Pword --//
			$sTest = trim($sPword);
			if( empty($sTest)===true ) {
				//-- Flag that the pword is invalid --//
				$bAbortLogin = true;
				
				//-- DEBUGGING --//
				if( $this->bDebugging===true ) { 
					$this->sDebugMessage = "No Username or Password!\n";
				}
			}
			
			//-- Empty the sTest Variable --//
			$sTest = "";
			unset($sTest);
		}
		
		//----------------------------------------------------------------------------------//
		//-- 3.0 - Check to see if the username has a space at the start or the end of it --//
		//----------------------------------------------------------------------------------//
		if( $bAbortLogin===false ) {
			
			//-- Check to see if the Username has a space on the start or end --//
			$bValidUname1 = preg_match('((?=^)(\s*))', $sUname);
			$bValidUname2 = preg_match('((\s*)(?>$))', $sUname);
			
			if( $bValidUname1===0 || $bValidUname1===2 ) {
				//-- Flag that the uname is invalid --//
				//$bAbortLogin = true;
				//-- DEBUGGING --//
				
				//if( $Config['Debug']['restrictapicore_login']===true ) { echo "Space at the start or end of the Username!"; }
			}
		}
		
		//----------------------------------------------------------------------------------//
		//-- 4.0 - Check to see if the username has symbols in it                         --//
		//----------------------------------------------------------------------------------//
		if( $bAbortLogin===false ) {
			$bValidUname = AlphaNumericCheck($sUname);
			
			if( $bValidUname!==true ) {
				//-- Flag that the uname is invalid --//
				$bAbortLogin = true;
				
				//-- DEBUGGING --//
				if( $this->bDebugging===true ) { 
					$sDebugMessage = "Symbols in Name!\n";
				}
			}
		}
		
		//----------------------------------------------------------------------------------//
		//-- 5.0 - Check to see if the username is in the list of blacklisted names       --//
		//----------------------------------------------------------------------------------//
		if( $bAbortLogin===false ) {
			$sLUname = strtolower($sUname);
			if( userauth_usernameblacklistcheck( $sUname ) ) {
				
				//-- Flag that the login shouldn't be attempted --//
				$bAbortLogin = true;
				
				//-- Penalise the attempted login further. --//
				sleep(1);
				
				//-- DEBUGGING --//
				if( $this->bDebugging===true ) { 
					$sDebugMessage = "Blacklisted Username!\n";
				}
			}
		}
		
		//----------------------------------------------------------------------------------//
		//-- 6.0 - Cleanup variables                                                      --//
		//----------------------------------------------------------------------------------//
		$sUname = "";
		$sPword = "";
		unset($sUname);
		unset($sPword);
		
		//----------------------------------------------------------------------------------//
		//-- 7.0 - Return the Results                                                     --//
		//----------------------------------------------------------------------------------//
		if( $bAbortLogin===false ) {
			return true;
		} else {
			return false;
		}
	}
	
	
	//----------------------------------------------------------------------------//
	//-- #3.3# - LOGOUT FUNCTION                                                --//
	//----------------------------------------------------------------------------//
	//-- Description: Logout a user by wiping all session data                  --//
	//----------------------------------------------------------------------------//
	public function userauth_logout() {
		
		//-- Unset all of the session variables --//
		$_SESSION = array();
		
		//-- If it's desired to kill the session, also delete the session cookie --//
		//-- Note: This will destroy the session, and not just the session data! --//
		if( isset( $_COOKIE[session_name()] ) ) {
			setcookie(session_name(), '', time()-42000, '/');
		}
		
		//-- Finally, destroy the session --//
		session_destroy();
		
		return true;
	}
	
	
	
	//----------------------------------------------------------------------------//
	//-- #?.?# - CHECK VERSION FUNCTION                                         --//
	//----------------------------------------------------------------------------//
	public function CheckDBVersion() {
		
		
		//-- Check to makes sure all the variables exist --//
		if( 
			isset( $this->aIOMyDBVersion['Version1'] ) && 
			isset( $this->aIOMyDBVersion['Version2'] ) && 
			isset( $this->aIOMyDBVersion['Version3'] ) && 
			isset( $this->aIOMyDBVersion['Name'] )
		) {
			//-- Success --//
			return array(
				"Version1" => $this->aIOMyDBVersion['Version1'],
				"Version2" => $this->aIOMyDBVersion['Version2'],
				"Version3" => $this->aIOMyDBVersion['Version3'],
				"Name"     => $this->aIOMyDBVersion['Name']
			);
			
		} else {
			//-- Failure --//
			return null;
		}
	}
	
	//----------------------------------------------------------------------------//
	//-- #?.?# - CHECK VERSION FUNCTION                                         --//
	//----------------------------------------------------------------------------//
	public function CheckIfDemoMode() {
		//-- Check if Demo Mode has been detected --//
		if( $this->bDemoMode===true ) {
			return true;
			
		} else {
			return false;
			
		}
	}
	
	
	private function LoadSessionData() {
		//--------------------------------------------------------------------//
		//-- Lookup the Server version                                      --//
		//--------------------------------------------------------------------//
		$this->aIOMyDBVersion  = $_SESSION['SoftwareVersion']['Main'];
		$this->aDBServerAddons = $_SESSION['SoftwareVersion']['Addons'];
		$this->bDemoMode       = $_SESSION['SoftwareVersion']['DemoMode'];
		$this->bVanillaIOMy    = $_SESSION['SoftwareVersion']['VanillaMode'];
		
		//--------------------------------------------------------------------//
		//-- Set the Timezone from the session value                        --//
		//--------------------------------------------------------------------//
		if( isset( $_SESSION['UserData']['UserAddressTimezoneTZ'] ) ) {
			if( $_SESSION['UserData']['UserAddressTimezoneTZ']!==null && $_SESSION['UserData']['UserAddressTimezoneTZ']!==false && $_SESSION['UserData']['UserAddressTimezoneTZ']!=="" ) {
				date_default_timezone_set( $_SESSION['UserData']['UserAddressTimezoneTZ'] );
			}
		} 
		
		return true;
	}
	
	private function LookupUserData() {
		
		$aUserTemp = APICore_UserData( $this->oRestrictedDB );
		
		if( $aUserTemp['Error']===false ) {
			if( $aUserTemp['Data']['UserState']>=1 ) {
				//-- Success: Return the result --//
				return $aUserTemp['Data'];
				
			} else {
				//-- Critical Error: User has been disabled --//
				userauth_rejected();
				
			}
		} else {
			//-- Critical Error: Can't lookup user data --//
			$this->UserAuth_UserDetails();
			
			
		}
	}
	
	
	
	private function LoadUserDataIntoSession() {
		//------------------------------------------------------------//
		//-- 1.0 - Initialise Variables                             --//
		//------------------------------------------------------------//
		
		
		//----------------------------------------------------------------------------------//
		//-- 2.0 - Check to see if the username has a space at the start or the end of it --//
		//----------------------------------------------------------------------------------//
		$aResult = APICore_UserData( $this->oRestrictedDB );
		
		//------------------------------------------------------------//
		//-- 9.0 - Return the results                               --//
		//------------------------------------------------------------//
		if( $aResult['Error']===false ) {
			$_SESSION['UserData'] = $this->LookupUserData();
			return true;
			
		} else {
			return false;
			
		}
	}
	
	
	public function RefreshSessionData() {
		//-- NOTE: This function is used by APIs to refresh Session data (like "User Timezone") --//
		
		
		//------------------------------------------------------------//
		//-- 2.0 - Re-open the session                              --//
		//------------------------------------------------------------//
		session_start();
		
		//------------------------------------------------------------//
		//-- 4.0 - Update the User Data in the session              --//
		//------------------------------------------------------------//
		$this->LoadUserDataIntoSession();
		
		//------------------------------------------------------------//
		//-- 5.0 - Load the session data into this object           --//
		//------------------------------------------------------------//
		$this->LoadSessionData();
		
		//------------------------------------------------------------//
		//-- 6.0 - Close the Session                                --//
		//------------------------------------------------------------//
		session_write_close();
		
		//------------------------------------------------------------//
		//-- 9.0 - Return the results                               --//
		//------------------------------------------------------------//
		return true;
	}
	
	
	
	/**
	 **********************************************************************************************************
	 * Decrypt the data with the provided key
	 **********************************************************************************************************
	 * @param string    $sData          The encrypted data to decrypt
	 * @param string    $sCryptKey      The key to use for decryption. If null then use the default key
	 * 
	 * @returns string|false The returned string if decryption is successful false if it is not
	 **********************************************************************************************************/
	public function decrypt($sData, $sCryptKey=null) {
		
		//-- STEP 1 - Use Default Key if none has been provided --//
		if($sCryptKey===null) {
			$sCryptKey = $this->aEncrytionVars["sCryptKey"];
		}
		
		//-- STEP 2 - Setup the other variables --//
		$salt   = substr( $sData, 0, 128 );
		$enc    = substr( $sData, 128, -64 );
		$mac    = substr( $sData, -64 );

		//-- STEP 3 --//
		list ($cipherKey, $macKey, $iv) = $this->Crypt_getKeys($salt, $sCryptKey);
		
		if ( !hash_equals(hash_hmac('sha512', $enc, $macKey, true), $mac) ) {
			 return false;
		}
		
		$dec = mcrypt_decrypt($this->aEncrytionVars["cipher"], $cipherKey, $enc, $this->aEncrytionVars["mode"], $iv);
		
		$sData = $this->Crypt_unpad($dec);
		
		return $sData;
	}

	/**
	 **********************************************************************************************************
	 * Encrypt the supplied data using the supplied key
	 **********************************************************************************************************
	 * @param string $sData The data to encrypt
	 * @param string $sCryptKey The key to encrypt with. If null then use the default key
	 *
	 * @returns string The encrypted data
	 **********************************************************************************************************/
	public function encrypt($sData, $sCryptKey=null) {
		//-- STEP 1 - Use Default Key if none has been provided --//
		if($sCryptKey===null) {
			$sCryptKey = $this->aEncrytionVars["sCryptKey"];
		}
		
		//-- STEP 2 - Setup the other variables --//
		$salt = mcrypt_create_iv(128, MCRYPT_DEV_URANDOM);
		list ($cipherKey, $macKey, $iv) = $this->Crypt_getKeys($salt, $sCryptKey);
		
		$sData = $this->Crypt_pad($sData);
		
		$enc = mcrypt_encrypt($this->aEncrytionVars["cipher"], $cipherKey, $sData, $this->aEncrytionVars["mode"], $iv);
		
		$mac = hash_hmac('sha512', $enc, $macKey, true);
		return $salt . $enc . $mac;
	}

	/**
	 **********************************************************************************************************
	 * Generates a set of keys given a random salt and a master key
	 **********************************************************************************************************
	 * @param string $salt A random string to change the keys each encryption
	 * @param string $key  The supplied key to encrypt with
	 *
	 * @returns array An array of keys (a cipher key, a mac key, and a IV)
	 **********************************************************************************************************/
	protected function Crypt_getKeys($salt, $key) {
		$ivSize     = mcrypt_get_iv_size( $this->aEncrytionVars["cipher"], $this->aEncrytionVars["mode"] );
		$keySize    = mcrypt_get_key_size( $this->aEncrytionVars["cipher"], $this->aEncrytionVars["mode"] );
		$length     = 2 * $keySize + $ivSize;
		$key        = $this->Crypt_pbkdf2('sha512', $key, $salt, $this->aEncrytionVars["iRounds"], $length);
		$cipherKey  = substr($key, 0, $keySize);
		$macKey     = substr($key, $keySize, $keySize);
		$iv         = substr($key, 2 * $keySize);
		return array($cipherKey, $macKey, $iv);
	}
	
	/**
	 **********************************************************************************************************
	 * Stretch the key using the PBKDF2 algorithm
	 **********************************************************************************************************
	 * @see http://en.wikipedia.org/wiki/PBKDF2
	 *
	 * @param string    $algo       The algorithm to use
	 * @param string    $key        The key to stretch
	 * @param string    $salt       A random salt
	 * @param int       $iRounds    The number of rounds to derive
	 * @param int       $length     The length of the output key
	 *
	 * @returns string The derived key.
	 **********************************************************************************************************/
	protected function Crypt_pbkdf2($algo, $key, $salt, $iRounds, $length) {
		$size   = strlen(hash($algo, '', true));
		$len    = ceil($length / $size);
		$result = '';
		for( $i = 1; $i <= $len; $i++ ) {
			$tmp = hash_hmac($algo, $salt . pack('N', $i), $key, true);
			$res = $tmp;
			for( $j = 1; $j < $iRounds; $j++ ) {
				$tmp  = hash_hmac($algo, $tmp, $key, true);
				$res ^= $tmp;
			}
			$result .= $res;
		}
		return substr($result, 0, $length);
	}
	
	/**
	 **********************************************************************************************************
	 * 
	 **********************************************************************************************************
	 * 
	 * 
	 **********************************************************************************************************/
	protected function Crypt_pad($data) {
		$length = mcrypt_get_block_size($this->aEncrytionVars["cipher"], $this->aEncrytionVars["mode"]);
		$padAmount = $length - strlen($data) % $length;
		if ($padAmount == 0) {
			$padAmount = $length;
		}
		return $data . str_repeat(chr($padAmount), $padAmount);
	}
	
	
	/**
	 **********************************************************************************************************
	 * 
	 **********************************************************************************************************
	 * 
	 * 
	 **********************************************************************************************************/
	protected function Crypt_unpad($data) {
		$length = mcrypt_get_block_size( $this->aEncrytionVars["cipher"], $this->aEncrytionVars["mode"] );
		$last = ord($data[strlen($data) - 1]);
		if ($last > $length) {
			return false;
		} else if (substr($data, -1 * $last) !== str_repeat(chr($last), $last)) {
			return false;
		} else {
			return substr($data, 0, -1 * $last);
		}
	}
	
	
	
	
	/**
	 **********************************************************************************************************
	 * 
	 **********************************************************************************************************
	 * Initialises the "SecondaryDB" connection from the "PrimaryDB" connection configuration.
	 * 
	 **********************************************************************************************************/
	public function InitialiseSecondaryDatabaseFromPrimary( $sUsername, $sPassword ) {
		//----------------------------------------------------------------------------------//
		//-- 1.0 - Initialise Variables                                                   --//
		//----------------------------------------------------------------------------------//
		$bError                 = false;            //-- BOOLEAN:   --//
		$sErrMesg               = "";               //-- STRING:    --//
		$aUserPermissions       = array();          //-- ARRAY:     --//
		$bPerm1                 = false;            //-- BOOLEAN:   --//
		$bPerm2                 = false;            //-- BOOLEAN:   --//
		$bPerm3                 = false;            //-- BOOLEAN:   --//
		
		//----------------------------------------------------------------------------------//
		//-- 3.0 - Verify that the current User is a Server Admin                         --//
		//----------------------------------------------------------------------------------//
		if( $bError===false ) {
			//-- Lookup User Permissions --//
			$aUserPermissions = GetUserServerPermissions( $bPerm1, $bPerm2, $bPerm3 );
			
			if( $aUserPermissions['Error']===false ) {
				$bPerm1 = $aUserPermissions['Data']['PermServerAddUser'];
				$bPerm2 = $aUserPermissions['Data']['PermServerAddPremiseHub'];
				$bPerm3 = $aUserPermissions['Data']['PermServerUpgrade'];
				
				
				//-- Check if the User has a iOmy Server Permission that needs more than one database connection --//
				if( $bPerm1===false && $bPerm2===false && $bPerm3===false ) {
					$bError   = true;
					$sErrMesg = "The User doesn't seem to be authorized to setup a secondary database connection!\n";
				}
				
			} else {
				$bError   = true;
				$sErrMesg = "Problem looking up the User's permissions to open a secondary database connection!\n";
			}
		}
		
		
		//----------------------------------------------------------------------------------//
		//-- 4.0 - Setup the Secondary Database Connection                                --//
		//----------------------------------------------------------------------------------//
		if( $bError===false ) {
			if( strlen( $sUsername )>=2 ) {
				if( strlen( $sPassword )>=2 ) {
					if( $this->bRestrictedDB===true ) {
						//--------------------------------------------//
						//-- Setup the Secondary Database           --//
						//--------------------------------------------//
						$this->oSecondaryDB = new DBMySQL (
							$this->aPrimaryDBConfig,
							$sUsername,
							$sPassword
						);
						
						//--------------------------------------------//
						//-- Check if Initialised                   --//
						//--------------------------------------------//
						if( $this->oSecondaryDB->Initialised===true ) {
							
							$this->bSecondaryDB = true;
							
						} else {
							//-- Error Messages --//
							$bError         = true;
							$sErrMesg       = "Failed to initialised the secondary database!\n";
						}
						
					} else {
						//-- Error Messages --//
						$bError         = true;
						$sErrMesg       = "Couldn't initialise the secondary database connection because the primary isn't initialised!\n";
					}
				} else {
					//-- Error Messages --//
					$bError         = true;
					$sErrMesg       = "Problem with the Password!\n";
				}
			} else {
				//-- Error Messages --//
				$bError         = true;
				$sErrMesg       = "Problem with the Username!\n";
			}
		}
		
		//----------------------------------------------------------------------------------//
		//-- 9.0 - Return the Results                                                     --//
		//----------------------------------------------------------------------------------//
		if( $bError===false ) {
			//-- No Errors have occurred --//
			return array( "Error"=>false );
			
		} else {
			//-- Error --//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
		}
	}
	
	public function UserAuth_ServerNotDeployed() {
		header('HTTP/1.0 501 Not Implemented');
		echo '<html><head><title>501 iOMy Server Not Deployed</title></head><body><h1>Please try setting up the server before accessing this API</h1></body></html>';
		die();
	}
	
	
	public function UserAuth_UserDetails() {
		header('HTTP/1.0 520 User Account Corruption');
		echo '<html><head><title>520 User Error</title></head><body><h1>User account has become corrupted!</h1></body></html>';
		die();
	}
}





?>