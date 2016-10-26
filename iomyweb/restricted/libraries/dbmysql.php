<?php

//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: MySQL Database Library
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



class DBMySQL {
	//====================================================//
	//== 1.0 - CLASS VARIABLE DECLARATION               ==//
	//====================================================//
	
	//-- 1.1 - Protected Variables --//
	protected	$DBConn;						//-- OBJECT:	Declare the database connection													--//
	
	//-- 1.2 - Public Variables --//
	public      $Initialised        = false;    //-- BOOLEAN:   If Database Connection succeeds then this variable is set to true				--//
	public      $QueryLogs          = array();  //-- ARRAY:     An array used to store the various SQL Queries that get passed to this function	--//
	public      $DataSchema         = "";       //-- STRING:    Used to store the Schema name for when doing SQL Inserts and Updates			--// 
	public      $ViewSchema         = "";       //-- STRING:    Used to store the Schema name for when looking up views							--// 
	public      $bTrasactionStarted = false;    //-- BOOLEAN:   --//
	
	//====================================================//
	//== 2.0 - Class Construction functions             ==//
	//====================================================//
	function __construct( $aConfig, $UName="", $UPWord="" ) {
		//----------------------------------------------------//
		//-- Declare Variables                              --//
		//----------------------------------------------------//
		$sDBUrl         = "";
		$sDBUser        = "";
		$sDBPassword    = "";
		
		try {
			//----------------------------------------------------//
			//-- Setup the Database Url                         --//
			//----------------------------------------------------//
			
			//-- IF the database name is present    --//
			if( isset($aConfig['schema']) ) {
				//-- Create the Database Url --//
				$sDBUrl        = $aConfig['uri']."dbname=".$aConfig['schema'].";";
				
				//-- Setup the default Schema --//
				$this->DataSchema = $aConfig['schema'];
				
				
			//-- ELSE the database isn't present    --//
			} else {
				//-- Create the Database Url --//
				$sDBUrl        = $aConfig['uri'];
			}
			
			if( isset($aConfig['viewschema']) ) {
				$this->ViewSchema = $aConfig['viewschema'];
			}
			
			
			//----------------------------------------------------//
			//-- PHP 5.3.6 or newer Character encoding          --//
			//----------------------------------------------------//
			if( isset( $aConfig['charset'] ) ) {
				if( strlen($aConfig['charset']) > 1 ) {
					if( !version_compare( PHP_VERSION,    '5.3.6',    '<' )) {
						$sDBUrl    .= $aConfig['charset'].";";
					}
				}
			}
			
			//----------------------------------------------------//
			//-- Setup the Username and Password                --//
			//----------------------------------------------------//
			
			//-- IF Encrypted Session Mode --//
			if( $aConfig['mode']==="EncryptedSession" ) {
				$sDBUser        = $UName;
				$sDBPassword    = $UPWord;
				
			//-- Normal Mode (aka Read from Config variable) --//
			} else {
				$sDBUser        = $aConfig['user'];
				$sDBPassword    = $aConfig['password'];
			}
			
			
			//----------------------------------------------------//
			//-- Setup the Database Connection                  --//
			//----------------------------------------------------//
			$this->DBConn = new PDO( $sDBUrl, $sDBUser, $sDBPassword );
			
			//----------------------------------------------------//
			//-- Check if Database Connection was successful    --//
			//----------------------------------------------------//
			if( $this->DBConn!=false ) {
				$this->Initialised = true;
				
				if( isset( $aConfig['schema'] ) ) {
					$this->DataSchema  = $aConfig['schema'];
				}
				
				
				//-- Matthew's suggestion to turn off PDO's prepared statement emulation --//
				//$this->DBConn->setAttribute( PDO::ATTR_EMULATE_PREPARES, false );
				
				//----------------------------------------------------//
				//-- LEGACY CHARSET                                 --//
				//----------------------------------------------------//
				if( isset( $aConfig['charset'] ) ) {
					if( strlen($aConfig['charset']) > 1 ) {
						if( version_compare( PHP_VERSION,    '5.3.6',    '<' ) ){
							$this->DBConn->execute("SET NAMES ".$aConfig['charset']);
						}
					}
				}
			}
			
		} catch(PDOException $e) {
			$this->Initialised = false;
			//echo "PDO Connection Error: Failed to establish a connection to Database(DBId=".$iDBId.")\n<br />";
			//echo $e->getMessage();
			//die();
		}
	}
	
	function __destruct() {
		//-- Close the database link on destruction of DB object --//
		//$this->DBConn = null;
	}
	
	//====================================================//
	//== 3.0 - Mini Misc Functions                      ==//
	//====================================================//
	protected function ConvertUTSToString( $iUTS ) {
		
		$sDate = date("Y-m-d h:i:s", $iUTS );
		
		return $sDate;
	}
	
	
	protected function xssafe( $sData , $sEncoding='UTF-8' ) {
		//-- This is a simple function to "HTML Escape" the code that the database outputs --//
		return htmlspecialchars( $sData, ENT_QUOTES | ENT_HTML401, $sEncoding);
	}
	
	
	//====================================================//
	//== 4.0 - Special Database Control functions       ==//
	//====================================================//
	public function dbBeginTransaction() {
		try {
			//----------------//
			//-- LEGACY     --//
			//----------------//
			//$dbConn = $this->DBConn;
			//$sSQL   = "BEGIN";
			//$result = $dbConn->query($sSQL);
			
			//----------------//
			//-- CURRENT    --//
			//----------------//
			$result = $this->DBConn->beginTransaction();
			if( $result==false ) {
				return false;
			} else {
				//-- Flag that the transaction has started --//
				$this->bTrasactionStarted = true;
				//-- Return that it was Successful --//
				return true;
			}
		} catch(PDOException $e) {
			//echo "PDO Connection Error: Failed to initiate a Transaction\n";
			//echo $e->getMessage();
			//die();
			
			//-- Store the error message --//
			$aDebugQuery = array( "Type"=>"Transaction", "ErrMesg"=>"PDO Connection Error: Failed to initiate a Transaction!\n".$e->getMessage() );
			array_push( $this->QueryLogs, $aDebugQuery );
			return false;
		}
	}
	
	
	public function dbEndTransaction() {
		//----------------//
		//-- LEGACY     --//
		//----------------//
		//$dbConn = $this->DBConn;
		//$sSQL   = "COMMIT";
		//$result = $dbConn->query($sSQL);
		
		//----------------//
		//-- CURRENT    --//
		//----------------//
		$result = $this->DBConn->commit();
		if( $result==false ) {
			$this->dbRollback();
			return false;
		} else {
			//-- Flag that the transaction has ended --//
			$this->bTrasactionStarted = false;
			//-- Return that it was Successful --//
			return true;
		}
	}
	
	
	public function dbRollback() {
		try {
			//----------------//
			//-- LEGACY     --//
			//----------------//
			//$dbConn = $this->DBConn;
			//$sSQL   = "ROLLBACK";
			//$result = $dbConn->query($sSQL);
			
			//----------------//
			//-- CURRENT    --//
			//----------------//
			$result = $this->DBConn->rollBack();
			if( $result==false ) {
				return false;
			} else {
				//-- Flag that the transaction has ended --//
				$this->bTrasactionStarted = false;
				//-- Return that it was Successful --//
				return true;
			}
		} catch(PDOException $e) {
			//-- Dump to the Query Logs --//
			$aDebugQuery = array( "Type"=>"Transaction", "ErrMesg"=>"PDO Connection Error: Failed to roll back a Transaction\n".$e->getMessage() );
			array_push( $this->QueryLogs, $aDebugQuery );
			
			echo "PDO Connection Error: Failed to roll back a Transaction\n";
			echo $e->getMessage();
			die();
		}
	}
	
	
	
	
	//====================================================//
	//== 5.0 - Main Database functions                  ==//
	//====================================================//
	public function InputBindQuery($sSQL, $aInputVals, $iFetchType) {
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError             = false;        //-- BOOLEAN:   --//
		$sErrMesg           = "";           //-- STRING:    Used to store an error message. --//
		$iInputColCount     = 0;            //-- INTEGER:   Used as to count how many Input values there are. --//
		$iOutputColCount    = 0;            //-- INTEGER:   Used as to count how many Output values there are. --//
		$j                  = 0;            //-- INTEGER:   Used as a incremental variable to keep track of how many iterations it has gone. --// 
		$aResults           = array();      //-- ARRAY:     Associative array used to store the SQL Query results in. --//
		$aReturn            = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion. --//
		
		
		//-- Store the Query and Parameters in the Log --//
		$aDebugQuery = array( "Type"=>"SelectQueryBasic", "Fetchtype"=>$iFetchType, "SQL"=>$sSQL, "Inputs"=>$aInputVals );
		array_push( $this->QueryLogs, $aDebugQuery );
		
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the SelectQueryBasic the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			
			try {
				//-- 2.1 - Count Input and Output Variables	--//
				$iInputColCount		= count($aInputVals);
				
				//-- 2.2 - Open the database connection --//
				$dbConn = $this->DBConn;
				
				//-- 2.3 - Prepare SQL --//
				$sth = $dbConn->prepare($sSQL);
				
				if( $sth!==null && $sth!==false ) {
					//-- 2.4 - Bind All Input Variables--//
					for($j=0; $j<$iInputColCount; $j++) {
						//-- 2.4.1 - Debugging --//
						if( $bError===false ) {
							$bExistsValue	= array_key_exists("value", $aInputVals[$j]);
							$bExistsType	= array_key_exists("type", $aInputVals[$j]);
							$bExistsName	= array_key_exists("Name", $aInputVals[$j]);
							
							if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
								
								//-- 2.4.1 - Prepare the key --//
								if( $aInputVals[$j]["Name"]===null || $aInputVals[$j]["Name"]===null || $aInputVals[$j]["Name"]===0 ) {
									$key = $j+1;
								} else {
									$key = ":".$aInputVals[$j]["Name"];
								}
								
								//-- If "null" (NULL) --//
								if( $aInputVals[$j]["value"]===null ) {
									$sth->bindParam($key, null, PDO::PARAM_NULL);
										
								//-- Else If "Boolean" (BOOL) --//
								} else if( $aInputVals[$j]["type"]==="BOOL" ) {
									
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_BOOL);
									
								//-- Else If "Integer" (INT) --//
								} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" ) {
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_INT);
								
								//-- Else If "String" (STR) --//
								} else if( $aInputVals[$j]["type"]==="STR" ) {
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_STR);
								
								//-- Else --//
								} else {
									$sth->bindParam($key, $aInputVals[$j]["value"]);
								}
							} else if( $bExistsName===false ) {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryBasic!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
								
							} else if( $bExistsType===false ) {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryBasic!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
								
							} else {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryBasic!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
							}
						}
					}
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: UpdateQuery!\n";
					$sErrMesg .= "Failed to prepare the SQL Query!\n";
				}
				
			} catch(PDOException $e2) {
				//-- TODO: Create an error message --//
				$bError = true;
				$sErrMesg .= $e2->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 3.0 - Execute Query            --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- 3.1 - Execute the SQL Select statement --//
				$Query = $sth->execute();
				
			} catch(PDOException $e3) {
				//-- TODO: Create an error message --//
				$bError = true;
				$sErrMesg .= $e3->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 4.0 - Fetch the Results        --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				
				//-- 4.1.A - Fetch All --//
				if( $iFetchType===0 ) {
					$aResults = $sth->fetchAll(PDO::FETCH_ASSOC);
						
				//-- 4.1.B - Fetch First --//
				} else {
					$aResults = $sth->fetch(PDO::FETCH_ASSOC);
				}
				//-- 4.2 No Rows check --//
				if($aResults===false) {
					//-- NO ROWS ERROR --//
					$bError    = true;
					$sErrMesg .= "No Rows Found! Code:".$iFetchType;
				}
				
			} catch(PDOException $e4) {
				//-- TODO: Create an error message --//
				$bError = true;
				$sErrMesg .= $e4->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 9.0 - Return the Results		--//
		//------------------------------------//
		if( $bError===false ) {
			//----------------//
			//-- SUCCESS    --//
			//----------------//
			$aReturn["Error"]	= false;
			$aReturn["Data"]	= $aResults;
			
			
		} else  {
			//----------------//
			//-- FAILURE    --//
			//----------------//
			$aReturn["Error"]	= true;
			$aReturn["ErrMesg"]	= $sErrMesg;
		}
		
		return $aReturn;
	}
	
	
	public function FullBindQuery($sSQL, $aInputVals, $aOutputVals, $iFetchType) {
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError				= false;		//-- BOOLEAN:	Used to flag if an error has occurred	--//
		$sErrMesg			= "";			//-- STRING:	Used to store the Error Message when an error occurs	--//
		$iInputColCount		= 0;			//-- INTEGER:	Used as to count how many Input values there are --//
		$iOutputColCount	= 0;			//-- INTEGER:	Used as to count how many Output values there are --//
		$i					= 0;			//-- INTEGER:	Used as a incremental variable to keep track of how many iterations has happened --// 
		$j					= 0;			//-- INTEGER:	Used as a incremental variable to keep track of how many iterations has happened --// 
		$aResults			= array();		//-- ARRAY:		Associative array used to store the SQL Query results in --//
		$aReturn			= array();		//-- ARRAY:		Associative array used by this function to return the outcome of calling this function --//
		
		
		//-- Store the Query and Parameters in the Log --//
		$aDebugQuery = array( "Type"=>"SelectQueryAdv", "Fetchtype"=>$iFetchType, "SQL"=>$sSQL, "Inputs"=>$aInputVals, "Outputs"=>$aOutputVals );
		array_push( $this->QueryLogs, $aDebugQuery );
		
		//var_dump($aDebugQuery);
		//echo "<br />\n";
		
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the SelectQueryAdv the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- 2.1 - Count Input and Output Variables	--//
				$iInputColCount		= count($aInputVals);
				$iOutputColCount	= count($aOutputVals);
				
				
				//-- 2.3 - Prepare SQL --//
				$sth = $this->DBConn->prepare($sSQL);
				
				if( $sth!==null && $sth!==false ) {
					//-- 2.4 - Bind Input Variables--//
					for($j=0; $j<$iInputColCount; $j++) {
						//-- 2.4.1 - Debugging --//
						if( $bError===false ) {
							$bExistsValue	= array_key_exists("value", $aInputVals[$j]);
							$bExistsType	= array_key_exists("type", $aInputVals[$j]);
							$bExistsName	= array_key_exists("Name", $aInputVals[$j]);
							
							if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
								
								//-- 2.4.2 - Prepare the key --//
								if( $aInputVals[$j]["Name"]===null || $aInputVals[$j]["Name"]===false || $aInputVals[$j]["Name"]===0 ) {
									$key = $j+1;
								} else {
									$key = ":".$aInputVals[$j]["Name"];
								}
								
								//-- 2.4.3 - Prepare the key --//
								//-- If "null" (NULL) --//
								if( $aInputVals[$j]["value"]===null ) {
									$sth->bindParam($key, null, PDO::PARAM_NULL);
										
								//-- Else If "Boolean" (BOOL) --//
								} else if( $aInputVals[$j]["type"]==="BOOL" ) {
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_BOOL);
									
								//-- Else If "Integer" (INT) --//
								} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" || $aInputVals[$j]["type"]==="FLO" ) {
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_INT);
								
								//-- Else If "String" (STR) --//
								} else if( $aInputVals[$j]["type"]==="STR" ) {
									$sth->bindParam($key, $aInputVals[$j]["value"], PDO::PARAM_STR);
								
								//-- Else --//
								} else {
									$sth->bindParam($key, $aInputVals[$j]["value"]);
								}
								
								
							} else if( $bExistsName===false ) {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryAdv!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
								
							} else if( $bExistsType===false ) {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryAdv!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
								
							} else {
								$bError = true;
								$sErrMesg .= "Critical Error: SelectQueryAdv!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
							}
						}
					}
					
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: UpdateQuery!\n";
					$sErrMesg .= "Failed to prepare the SQL Query!\n";
				}
				
			} catch(PDOException $e2) {
				//-- TODO: Create an error message --//
				$bError    = true;
				$sErrMesg .= $e42->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 3.0 - Execute Query            --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- 3.1 - Execute the SQL Select statement --//
				$Query = $sth->execute();
				
				if($Query==false) {
					$bError    = true;
					$sErrMesg .= "SQL Execution returned false";
				}
				
			} catch(PDOException $e3) {
				//-- TODO: Create an error message --//
				$bError    = true;
				$sErrMesg .= $e3->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 4.0 - Fetch the Results        --//
		//------------------------------------//
		if($bError===false) {
			try {
				//-- 4.1.A - IF Fetch All --//
				if( $iFetchType===0 ) {
					$i = 0;
					
					//-- Fetch the rows of data --//
					$aRows = $sth->fetchAll(PDO::FETCH_NUM);
					
					//-- NO ROWS ERROR --//
					if($aRows==false) {
						$bError    = true;
						$sErrMesg .= "No Rows Found! Code:".$iFetchType;
					}
					
					//-- Foreach Row of Data --//
					if( $bError===false ) {
						foreach ( $aRows as $aRow ) {
						
							//-- Foreach Output type --//
							for($j=0; $j<$iOutputColCount; $j++) {
								
								$sColumnAlias	= $aOutputVals[$j]["Name"];
								$sColumnType	= $aOutputVals[$j]["type"];
								
								//-- Integer Types --//
								if( $sColumnType==="INT" || $sColumnType==="BINT" ) {
									//TODO: Convert to integer --// 
									$iTempValue						= (int)$aRow[$j];
									$aResults[$i][$sColumnAlias]	= $iTempValue;
	
								//-- Floating Point Types --//
								} else if( $sColumnType==="FLO" || $sColumnType==="DEC" ) {
									$fTempValue						= (float)$aRow[$j];
									$aResults[$i][$sColumnAlias]	= $fTempValue;
										
								//-- Decimal to 3 places --//
								} else if( $sColumnType==="DEC3" ) {
									$fTempValue						= (float)$aRow[$j];
									$aResults[$i][$sColumnAlias]	= (float)round($fTempValue*1000) / 1000;
									
								//-- Decimal to 6 places --//
								} else if( $sColumnType==="DEC6" ) {
									$fTempValue						= (float)$aRow[$j];
									$aResults[$i][$sColumnAlias]	= (float)round($fTempValue*1000000) / 1000000;
									
								//-- Time stamp convert --//
								} else if( $sColumnType==="TSC" ) {
									$iTempValue						= (int)$aRow[$j];
									$aResults[$i][$sColumnAlias]	= $iTempValue;
									
								} else if( $sColumnType==="STR" ) {
									$iTempValue						= $aRow[$j];
									$aResults[$i][$sColumnAlias]	= $iTempValue;
									
								//-- String --//
								} else {
									$sTempValue						= $aRow[$j];
									$aResults[$i][$sColumnAlias]	= $sTempValue;
								} 
							}
							//-- Increment $i --//
							$i++;
						}
					}
					
					
					
				//-- 4.1.B - ELSE Fetch First --//
				} else {
					//-- Fetch the row of data --//
					$aRow = $sth->fetch(PDO::FETCH_NUM);
					
					
					//-- NO ROWS ERROR --//
					if($aRow==false) {
						$bError    = true;
						$sErrMesg .= "No Rows Found! Code:".$iFetchType;
					}
					
					//-- DEBUGGING CODE --//
					//echo "\n";
					//var_dump($iOutputColCount);
					//echo ">>> Row Dump Start <<<\n";
					//var_dump($aRow);
					//echo ">>> Row Dump End <<<\n";
					
					if( $bError===false ) {
						//-- Foreach Output type --//
						for($j=0; $j<$iOutputColCount; $j++) {
							
							$sColumnAlias	= $aOutputVals[$j]["Name"];
							$sColumnType	= $aOutputVals[$j]["type"];
									
							//-- Integer Types --//
							if( $sColumnType==="INT" || $sColumnType==="BINT" ) {
								//TODO: Convert to integer --// 
								$iTempValue					= (int)$aRow[$j];
								$aResults[$sColumnAlias]	= $iTempValue;
							
							//-- Floating Point Types --//
							} else if( $sColumnType==="FLO" || $sColumnType==="DEC" ) {
								//TODO: Convert to integer --// 
								$fTempValue					= (float)$aRow[$j];
								$aResults[$sColumnAlias]	= $fTempValue;
							
							//-- Decimal to 3 places --//
							} else if( $sColumnType==="DEC3" ) {
								$fTempValue					= (float)$aRow[$j];
								$aResults[$sColumnAlias]	= (float)round($fTempValue*1000) / 1000;
								
							//-- Decimal to 6 places --//
							} else if( $sColumnType==="DEC6" ) {
								$fTempValue					= (float)$aRow[$j];
								$aResults[$sColumnAlias]	= (float)round($fTempValue*1000000) / 1000000;
								
							//-- Time stamp convert --//
							} else if( $sColumnType==="TSC" ) {
								$iTempValue					= (int)$aRow[$j];
								$aResults[$sColumnAlias]	= $iTempValue;
								
							//-- String --//
							} else {
								$sTempValue					= $aRow[$j];
								$aResults[$sColumnAlias]	= $sTempValue;
							}
						}
					}
				}
			} catch(PDOException $e4) {
				//-- TODO: Create an error message --//
				$bError    = true;
				$sErrMesg .= $e4->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//----------------//
			//-- SUCCESS	--//
			$aReturn["Error"]	= false;
			$aReturn["Data"]	= $aResults;
			return $aReturn;
			
		} else  {
			//----------------//
			//-- FAILURE	--//
			$aReturn["Error"]	= true;
			$aReturn["ErrMesg"]	= $sErrMesg;
			return $aReturn;
		}
	}
	
	
	
	public function InputBindUpdateQuery($sSQL, $aInputVals) {
		//-- This function is used to do SQL "Update" & "Delete" Queries    --//
		//-- when no results are required to be passed back to the user     --//
		
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bTransactionActive     = false;        //-- BOOLEAN:   --//
		$bError                 = false;        //-- BOOLEAN:   --//
		$sErrMesg               = "";           //-- BOOLEAN:   --//
		$iInputColCount         = 0;            //-- INTEGER:   Used as to count how many Input values there are --//
		$aReturn                = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion --//
		$bSQLExecutionResult    = false;        //-- BOOLEAN:   Used to store if the SQL was successful or not--//

		$iInputColCount         = 0;            //-- INTEGER:   Used as to count how many Input values there are --//
		$j                      = 0;            //-- INTEGER:   Used as a incremantal variable to keep track of how many iterations it has gone --// 
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the UpdateQuery the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- Store the Query and Parameters in the Log --//
				$aDebugQuery = array( "Type"=>"UpdateQuery", "SQL"=>$sSQL, "Inputs"=>$aInputVals );
				array_push( $this->QueryLogs, $aDebugQuery );
				
				//var_dump($aDebugQuery);
				//echo "<br />\n";
				
				//-- 2.1 - Count Input Variables	--//
				$iInputColCount = count($aInputVals);
				
				//-- Begin the Transaction --//
				$bTransactionActive = $this->dbBeginTransaction();
				
				if( $bTransactionActive===true ) {
					//-- 2.3 - Prepare SQL --//
					$sth = $this->DBConn->prepare($sSQL);
					
					if( $sth!==null && $sth!==false) {
						//-- 2.4 - Bind Input Variables--//
						for($j=0; $j<$iInputColCount; $j++) {
							
							
							if( $bError===false ) {
								//-- 2.4.1 - Debugging --//
								$bExistsValue	= array_key_exists("value", $aInputVals[$j]);
								$bExistsType	= array_key_exists("type", $aInputVals[$j]);
								$bExistsName	= array_key_exists("Name", $aInputVals[$j]);
								
								if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
									
									//-- 2.4.2 - Prepare the key --//
									if( $aInputVals[$j]["Name"]==false ) {
										$key = $j+1;
									} else {
										$key = ":".$aInputVals[$j]["Name"];
									}
									
									//-- If "null" (NULL) --//
									if( $aInputVals[$j]["value"]===null || $aInputVals[$j]["type"]==="NUL" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_NULL );
										
									//-- Else If "Boolean" (BOOL) --//
									} else if( $aInputVals[$j]["type"]==="BOOL" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_BOOL );
										
									//-- Else If "Integer" (INT) --//
									} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_INT );
									
									//-- Else If "String" (STR) --//
									} else if( $aInputVals[$j]["type"]==="STR" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_STR);
									
									//-- Else --//
									} else {
										$sth->bindParam($key, $aInputVals[$j]["value"]);
									}
									
								} else if( $bExistsName!==true ) {
									$bError    = true;
									$sErrMesg .= "Critical Error: UpdateQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
									
								} else if( $bExistsType!==true ) {
									$bError    = true;
									$sErrMesg .= "Critical Error: UpdateQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
									
								} else {
									$bError    = true;
									$sErrMesg .= "Critical Error: UpdateQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
								}
							}
						}
					} else {
						$bError = true;
						$sErrMesg .= "Critical Error: UpdateQuery!\n";
						$sErrMesg .= "Failed to prepare the SQL Query!\n";
					}
					
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: UpdateQuery!\n";
					$sErrMesg .= "Couldn't get the SQL Transaction to begin!\n";
				}
				
				if($bError===false) {
					//------------------------------------//
					//-- 3.0 - Execute Query            --//
					//------------------------------------//
					
					//-- 3.1 - Execute the SQL Insert,Update,Delete,etc --//
					$bSQLExecutionResult = $sth->execute();
					
					if($bSQLExecutionResult===true) {
						//-- Commit the Changes --//
						$this->dbEndTransaction();
					} else {
						$this->dbRollback();
						$bError    = true;
						$sErrMesg .= "Database rejected the execution of this SQL Query";
					}
					
				}
			} catch(PDOException $e3) {
				
				if( $bTransactionActive===true ) {
					//-- Rollback Changes --//
					$this->dbRollback();
				}
				
				$bError    = true;
				$sErrMesg .= $e3->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			return array( "Error"=>false );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	public function InputBindInsertQuery($sSQL, $aInputVals) {
		//-- This function is used to do SQL "Insert" Queries	--//
		//-- when no results are required to be passed back to the user		--//
		
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError                 = false;        //-- BOOLEAN:   --//
		$sErrMesg               = "";           //-- STRING:    --//
		$iInputColCount         = 0;            //-- INTEGER:   Used as to count how many Input values there are --//
		$aReturn                = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion --//
		$j                      = 0;            //-- INTEGER:   Used as a incremantal variable to keep track of how many iterations it has gone --// 
		$bSQLExecutionResult    = false;        //-- BOOLEAN:   Used to indicate if the SQL Query Execution was succcessful or not	--//
		$sth                    = null;         //-- OBJECT     --//
		
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the InsertQuery the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- Store the Query and Parameters in the Log --//
				$aDebugQuery = array( "Type"=>"InsertQuery", "SQL"=>$sSQL, "Inputs"=>$aInputVals );
				array_push( $this->QueryLogs, $aDebugQuery );
				
				//var_dump($aDebugQuery);
				//echo "<br />\n";
				//------------------------------------//
				//-- 2.0 - Prepeare the Query       --//
				//------------------------------------//
				
				//-- 2.1 - Count Input Variables	--//
				$iInputColCount = count($aInputVals);
				
				//-- Begin the Transaction --//
				$bTransactionActive = $this->dbBeginTransaction();
				
				//-- 2.3 - Bind Input Variables--//
				if( $bTransactionActive===true) {
					
					//-- 2.4 - Prepare SQL --//
					$sth = $this->DBConn->prepare($sSQL);
					
					if( $sth!==null && $sth!==false ) {
					
						for($j=0; $j<$iInputColCount; $j++) {	
							
							if( $bError===false ) {
								//-- 2.4.1 - Debugging --//
								$bExistsValue   = array_key_exists("value", $aInputVals[$j]);
								$bExistsType    = array_key_exists("type", $aInputVals[$j]);
								$bExistsName    = array_key_exists("Name", $aInputVals[$j]);
								
								if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
									
									//-- 2.4.2 - Prepare the key --//
									if( $aInputVals[$j]["Name"]==false ) {
										$key = $j+1;
									} else {
										$key = ":".$aInputVals[$j]["Name"];
									}
									
									//-- If "null" (NULL) --//
									if( $aInputVals[$j]["value"]===null || $aInputVals[$j]["type"]==="NUL" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_NULL );
										
									//-- Else If "Boolean" (BOOL) --//
									} else if( $aInputVals[$j]["type"]==="BOOL" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_BOOL );
										
									//-- Else If "Integer" (INT) --//
									} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_INT );
									
									//-- Else If "String" (STR) --//
									} else if( $aInputVals[$j]["type"]==="STR" ) {
										$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_STR);
									
									//-- Else --//
									} else {
										$sth->bindParam($key, $aInputVals[$j]["value"]);
									}
									
								} else if( $bExistsName!==true ) {
									$bError    = true;
									$sErrMesg .= "Critical Error: InsertQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
									
								} else if( $bExistsType!==true ) {
									$bError    = true;
									$sErrMesg .= "Critical Error: InsertQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
									
								} else {
									$bError    = true;
									$sErrMesg .= "Critical Error: InsertQuery!\n";
									$sErrMesg .= "API Writer possibly created this error!\n";
									$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
								}
							}
						}
					} else {
						$bError = true;
						$sErrMesg .= "Critical Error: InsertQuery!\n";
						$sErrMesg .= "Failed to prepare the SQL Query!\n";
					}
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: InsertQuery!\n";
					$sErrMesg .= "Couldn't get the SQL Transaction to begin!\n";
				}
				
				
				if($bError===false) {
					//------------------------------------//
					//-- 3.0 - Execute Query            --//
					//------------------------------------//
					
					//-- 3.1 - Execute the SQL Insert,Update,Delete,etc --//
					$bSQLExecutionResult = $sth->execute();
					
					if( $bSQLExecutionResult!==false) {
						//-- 3.2 - Fetch the most recent Id --//
						$sLastInsertId = $this->DBConn->lastInsertId();
						
						if( is_numeric($sLastInsertId) ) {
							$iLastInsertId = intval($sLastInsertId);
							
							if( !($iLastInsertId>=1) ) {
								$this->dbRollback();
								$bError = true;
								$sErrMesg .= "Critical Error: InsertQuery!\n";
								$sErrMesg .= "Not valid InsertId returned from the database!\n";
							} else {
								//-- Commit the Changes --//
								$this->dbEndTransaction();
							}
						} else {
							$this->dbRollback();
							$bError = true;
							$sErrMesg .= "Critical Error: InsertQuery!\n";
							$sErrMesg .= "Invalid InsertId returned from the database!\n";
						}
						
					} else {
						$this->dbRollback();
						$bError = true;
						$sErrMesg .= "Critical Error: InsertQuery!\n";
						$sErrMesg .= "SQL Query Execution returned false!\n";
					}
				}
				
			} catch(PDOException $e3) {
				
				if( $bTransactionActive===true ) {
					//-- Rollback Changes --//
					$this->dbRollback();
				}
				
				$bError    = true;
				$sErrMesg .= "";
				$sErrMesg .= $e3->getMessage();
			}
		}
		
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			 return array( "Error"=>false, "LastId"=>$iLastInsertId );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	
	
	public function InputBindNonCommittedInsertQuery($sSQL, $aInputVals) {
		//--------------------------------------------------------------------------------//
		//-- Description: This function operates very similar to the function above     --//
		//--    except that it doesn't perform the transaction as it expects that       --//
		//--    whatever has triggered this function to be called is managing the       --//
		//--    Transactions.                                                           --//
		//--------------------------------------------------------------------------------//
		
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError                 = false;        //-- BOOLEAN:   --//
		$sErrMesg               = "";           //-- STRING:    --//
		$iInputColCount         = 0;            //-- INTEGER:   Used as to count how many Input values there are --//
		$aReturn                = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion --//
		$j                      = 0;            //-- INTEGER:   Used as a incremantal variable to keep track of how many iterations it has gone --// 
		$bSQLExecutionResult    = false;        //-- BOOLEAN:   Used to indicate if the SQL Query Execution was succcessful or not  --//
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the NonCommitedInsertQuery the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- Store the Query and Parameters in the Log --//
				$aDebugQuery = array( "Type"=>"NonCommitedInsertQuery", "SQL"=>$sSQL, "Inputs"=>$aInputVals );
				array_push( $this->QueryLogs, $aDebugQuery );
				
				//var_dump($aDebugQuery);
				//echo "<br />\n";
				//------------------------------------//
				//-- 2.0 - Prepeare the Query       --//
				//------------------------------------//
				
				//-- 2.1 - Count Input Variables     --//
				$iInputColCount = count($aInputVals);
				
				//-- 2.3 - Prepare SQL --//
				$sth = $this->DBConn->prepare($sSQL);
				
				
				if( $sth!==null && $sth!==false ) {
					//-- 2.4 - Bind Input Variables --//
					for( $j=0; $j<$iInputColCount; $j++ ) {
						
						
						if( $bError===false ) {
							//-- 2.4.1 - Debugging --//
							$bExistsValue   = array_key_exists("value", $aInputVals[$j]);
							$bExistsType    = array_key_exists("type", $aInputVals[$j]);
							$bExistsName    = array_key_exists("Name", $aInputVals[$j]);
							
							if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
								
								//-- 2.4.2 - Prepare the key --//
								if( $aInputVals[$j]["Name"]==false ) {
									$key = $j+1;
								} else {
									$key = ":".$aInputVals[$j]["Name"];
								}
								
								//-- If "null" (NULL) --//
								if( $aInputVals[$j]["value"]===null || $aInputVals[$j]["type"]==="NUL" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_NULL );
									
								//-- Else If "Boolean" (BOOL) --//
								} else if( $aInputVals[$j]["type"]==="BOOL" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_BOOL );
									
								//-- Else If "Integer" (INT) --//
								} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_INT );
								
								//-- Else If "String" (STR) --//
								} else if( $aInputVals[$j]["type"]==="STR" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_STR);
								
								//-- Else --//
								} else {
									$sth->bindParam($key, $aInputVals[$j]["value"]);
								}
								
							} else if( $bExistsName!==true ) {
								$bError    = true;
								$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
								
							} else if( $bExistsType!==true ) {
								$bError    = true;
								$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
								
							} else {
								$bError    = true;
								$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
							}
						}
					}
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: NonCommittedInsertQuery!\n";
					$sErrMesg .= "Failed to prepare the SQL Query!\n";
				}
				
				if($bError===false) {
					//------------------------------------//
					//-- 3.0 - Execute Query            --//
					//------------------------------------//
					
					//-- 3.1 - Execute the SQL Insert,Update,Delete,etc --//
					$bSQLExecutionResult = $sth->execute();
					
					if( $bSQLExecutionResult!==false) {
						//-- 3.2 - Fetch the most recent Id --//
						$sLastInsertId = $this->DBConn->lastInsertId();
						
						
						if( is_numeric($sLastInsertId) ) {
							$iLastInsertId = intval($sLastInsertId);
							
							if( !($iLastInsertId>=1) ) {
								$bError = true;
								$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
								$sErrMesg .= "Not valid InsertId returned from the database!\n";
							} 
						} else {
							$bError = true;
							$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
							$sErrMesg .= "Invalid InsertId returned from the database!\n";
						}
						
					} else {
						$bError = true;
						$sErrMesg .= "Critical Error: NonCommitedInsertQuery!\n";
						$sErrMesg .= "SQL Query Execution returned false!\n";
					}
				}
				
			} catch(PDOException $e3) {
				$bError    = true;
				$sErrMesg .= "";
				$sErrMesg .= $e3->getMessage();
			}
		}
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			 return array( "Error"=>false, "LastId"=>$iLastInsertId );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	
	public function NonCommittedCreateQuery($sSQL) {
		//--------------------------------------------------------------------------------//
		//-- Description: This function is only used under special circumstances.       --//
		//--    It is suppose to only be used to do things like create the tables,      --//
		//--    foreign keys, etc that doesn't insert rows or contain user input from   --//
		//--    a non-admin user.                                                       --//
		//--------------------------------------------------------------------------------//
		
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError                 = false;        //-- BOOLEAN:   --//
		$sErrMesg               = "";           //-- STRING:    --//
		$aReturn                = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion --//
		$j                      = 0;            //-- INTEGER:   Used as a incremantal variable to keep track of how many iterations it has gone --// 
		$bSQLExecutionResult    = false;        //-- BOOLEAN:   Used to indicate if the SQL Query Execution was succcessful or not  --//
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the NonCommitedCreateQuery the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- Store the Query and Parameters in the Log --//
				$aDebugQuery = array( "Type"=>"NonCommitedCreateQuery", "SQL"=>$sSQL );
				array_push( $this->QueryLogs, $aDebugQuery );
				
				//var_dump($aDebugQuery);
				//echo "<br />\n";
				
				
				//------------------------------------//
				//-- 2.3 - Prepare SQL              --//
				//------------------------------------//
				$sth = $this->DBConn->prepare($sSQL);
				
				if( $sth===null || $sth===false ) {
					$bError = true;
					$sErrMesg .= "Critical Error: NonCommitedCreateQuery!\n";
					$sErrMesg .= "Failed to prepare the SQL Query!\n";
				}
				
				//------------------------------------------------//
				//-- 3.0 - Execute Query and check for errors   --//
				//------------------------------------------------//
				if($bError===false) {
					//------------------------------------------------//
					//-- 3.1 - Execute the SQL Query                --//
					//------------------------------------------------//
					$bSQLExecutionResult = $sth->execute();
					
					//------------------------------------------------//
					//-- 3.2 - Check for errors                     --//
					//------------------------------------------------//
					if( $bSQLExecutionResult===false ) {
						$bError = true;
						$sErrMesg .= "Critical Error: NonCommitedCreateQuery!\n";
						$sErrMesg .= "SQL Query Execution returned false!\n";
						
						//$sErrMesg .= json_encode( $this->DBConn->errorInfo() );
						$sErrMesg .= $sSQL;
						//var_dump( $this->QueryLogs );
						//echo "\n\n";
					}
				}
			} catch(PDOException $e3) {
				$bError    = true;
				$sErrMesg .= "";
				$sErrMesg .= $e3->getMessage();
			}
		}
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			return array( "Error"=>false, "Result"=>$bSQLExecutionResult );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
	
	
	public function InputBindNonCommittedCreateQuery($sSQL, $aInputVals) {
		//--------------------------------------------------------------------------------//
		//-- Description: This function operates very similar to the function above     --//
		//--    except that it doesn't perform the transaction as it expects that       --//
		//--    whatever has triggered this function to be called is managing the       --//
		//--    Transactions.                                                           --//
		//--------------------------------------------------------------------------------//
		
		//------------------------------------//
		//-- 1.0 - Initialise Variable      --//
		//------------------------------------//
		$bError                 = false;        //-- BOOLEAN:   --//
		$sErrMesg               = "";           //-- STRING:    --//
		$iInputColCount         = 0;            //-- INTEGER:   Used as to count how many Input values there are --//
		$aReturn                = array();      //-- ARRAY:     Associative array used by this function to return the outcome of calling this fucntion --//
		$j                      = 0;            //-- INTEGER:   Used as a incremantal variable to keep track of how many iterations it has gone --// 
		$bSQLExecutionResult    = false;        //-- BOOLEAN:   Used to indicate if the SQL Query Execution was succcessful or not  --//
		
		//-- SQL Check --//
		$sSqldataType = gettype($sSQL);
		if( $sSqldataType!=="string" ) {
			$bError    = true;
			$sErrMesg .= "The SQL Parameter does not appear to be a String! \n";
			$sErrMesg .= "Note for the API Writer: In the InputBindNonCommittedCreateQuery the SQL Parameter is a '".$sSqldataType."' \n";
		}
		
		
		//------------------------------------//
		//-- 2.0 - Prepeare the Query       --//
		//------------------------------------//
		if( $bError===false ) {
			try {
				//-- Store the Query and Parameters in the Log --//
				$aDebugQuery = array( "Type"=>"InputBindNonCommittedCreateQuery", "SQL"=>$sSQL, "Inputs"=>$aInputVals );
				array_push( $this->QueryLogs, $aDebugQuery );
				
				//var_dump($aDebugQuery);
				//echo "<br />\n";
				//------------------------------------//
				//-- 2.0 - Prepeare the Query       --//
				//------------------------------------//
				
				//-- 2.1 - Count Input Variables     --//
				$iInputColCount = count($aInputVals);
				
				//-- 2.3 - Prepare SQL --//
				$sth = $this->DBConn->prepare($sSQL);
				
				
				if( $sth!==null && $sth!==false ) {
					//-- 2.4 - Bind Input Variables --//
					for( $j=0; $j<$iInputColCount; $j++ ) {
						
						
						if( $bError===false ) {
							//-- 2.4.1 - Debugging --//
							$bExistsValue   = array_key_exists("value", $aInputVals[$j]);
							$bExistsType    = array_key_exists("type", $aInputVals[$j]);
							$bExistsName    = array_key_exists("Name", $aInputVals[$j]);
							
							if( $bExistsName===true && $bExistsType===true && $bExistsValue===true ) {
								
								//-- 2.4.2 - Prepare the key --//
								if( $aInputVals[$j]["Name"]==false ) {
									$key = $j+1;
								} else {
									$key = ":".$aInputVals[$j]["Name"];
								}
								
								//-- If "null" (NULL) --//
								if( $aInputVals[$j]["value"]===null || $aInputVals[$j]["type"]==="NUL" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_NULL );
									
								//-- Else If "Boolean" (BOOL) --//
								} else if( $aInputVals[$j]["type"]==="BOOL" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_BOOL );
									
								//-- Else If "Integer" (INT) --//
								} else if( $aInputVals[$j]["type"]==="INT" || $aInputVals[$j]["type"]==="BINT" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_INT );
								
								//-- Else If "String" (STR) --//
								} else if( $aInputVals[$j]["type"]==="STR" ) {
									$sth->bindParam( $key, $aInputVals[$j]["value"], PDO::PARAM_STR);
								
								//-- Else --//
								} else {
									$sth->bindParam($key, $aInputVals[$j]["value"]);
								}
								
							} else if( $bExistsName!==true ) {
								$bError    = true;
								$sErrMesg .= "Critical Error: InputBindNonCommittedCreateQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"Name\" input binding parameter!\n";
								
							} else if( $bExistsType!==true ) {
								$bError    = true;
								$sErrMesg .= "Critical Error: InputBindNonCommittedCreateQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"type\" input binding parameter!\n";
								
							} else {
								$bError    = true;
								$sErrMesg .= "Critical Error: InputBindNonCommittedCreateQuery!\n";
								$sErrMesg .= "API Writer possibly created this error!\n";
								$sErrMesg .= "Couldn't find the \"value\" input binding parameter!\n";
							}
						}
					}
				} else {
					$bError = true;
					$sErrMesg .= "Critical Error: InputBindNonCommittedCreateQuery!\n";
					$sErrMesg .= "Failed to prepare the SQL Query!\n";
				}
				
				if($bError===false) {
					//------------------------------------//
					//-- 3.0 - Execute Query            --//
					//------------------------------------//
					
					//-- 3.1 - Execute the SQL Insert,Update,Delete,etc --//
					$bSQLExecutionResult = $sth->execute();
					
					if( $bSQLExecutionResult!==true ) {
						$bError = true;
						$sErrMesg .= "Critical Error: InputBindNonCommittedCreateQuery!\n";
						$sErrMesg .= "SQL Query Execution returned false!\n";
					}
				}
				
			} catch(PDOException $e3) {
				$bError    = true;
				$sErrMesg .= "";
				$sErrMesg .= $e3->getMessage();
			}
		}
		//------------------------------------//
		//-- 9.0 - Return the Results       --//
		//------------------------------------//
		if( $bError===false ) {
			//------------------------//
			//-- 9.A - SUCCESS      --//
			//------------------------//
			 return array( "Error"=>false, "Result"=>$bSQLExecutionResult );
			
		} else {
			//------------------------//
			//-- 9.B - FAILURE      --//
			//------------------------//
			return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
			
		}
	}
		
} //-- END OF DBMySQL CLASS --//


?>