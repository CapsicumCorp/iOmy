<?php



	
	
	use ODataProducer\UriProcessor\ResourcePathProcessor\SegmentParser\KeyDescriptor;
	use ODataProducer\Providers\Metadata\ResourceSet;
	use ODataProducer\Providers\Metadata\ResourceProperty;
	use ODataProducer\Providers\Query\IDataServiceQueryProvider2;
	require_once "MainMetadata.php";
	require_once "ODataProducer/Providers/Query/IDataServiceQueryProvider2.php";



	class MainQueryProvider implements IDataServiceQueryProvider2 {
		/**
		 * Handle to connection to Database
		 */
		private $_connectionHandle = null;

		private $_expressionProvider = null;
		/**
		 * Constructs a new instance of MainQueryProvider
		 * 
		 */
		public function __construct() {
			global $oRestrictedApiCore;

			//-----------------------------//
			//-- NEW DATABASE CONNECTION --//
			//-----------------------------//
			require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';
			
			if( $oRestrictedApiCore->bRestrictedDB===false ) {
				echo "Access Denied to the Restricted Database!";
				die();
			}
			
			$this->_connectionHandle = $oRestrictedApiCore->oRestrictedDB;
			
		}

		/**
		 * Library will use this function to check whether library has to
		 * apply orderby, skip and top.
		 * Note: Library will not delegate $select/$expand operation to IDSQP2
		 * implementation, they will always handled by Library.
		 * 
		 * @return Boolean True If user want library to apply the query options
		 * 				False If user is going to take care of orderby, skip and top options
		 */
		public function canApplyQueryOptions() {
			return true;
		}

		/**
		 * Gets collection of entities belongs to an entity set
		 * 
		 * @param ResourceSet $resourceSet The entity set whose entities needs to be fetched
		 * @return array(Object)
		 */

		public function getResourceSet(ResourceSet $resourceSet, $filterOption = null, $select=null, $orderby=null, $top=null, $skip=null) {
			$aReturnResults = array();
			
			$sResourceSetName =  $resourceSet->getName();
			
			switch($sResourceSetName) {
				case 'VR_USERSINFO':
					break;
				case 'VR_USERSPREMISES':
					break;
				case 'VR_USERSPREMISELOCATIONS':
					break;
				case 'VR_USERSHUB':
					break;
				case 'VR_USERSROOMS':
					break;
				case 'VR_USERSLINK':
					break;
				case 'VR_USERSTHING':
					break;
				case 'VR_USERSIO':
					break;
				case 'VR_DATATINYINT':
					break;
				case 'VR_DATAINT':
					break;
				case 'VR_DATABIGINT':
					break;
				case 'VR_DATAFLOAT':
					break;
				case 'VR_DATATINYSTRING':
					break;
				case 'VR_DATASHORTSTRING':
					break;
				case 'VR_DATAMEDSTRING':
					break;
				case 'VR_USERSPREMISELOG':
					break;
				case 'VR_USERSCOMM':
					break;
				case 'VP_COUNTRIES':
					break;
				case 'VP_CURRENCIES':
					break;
				case 'VP_LANGUAGES':
					break;
				case 'VP_POSTCODES':
					break;
				case 'VP_TIMEZONES':
					break;
				case 'VP_STATEPROVINCE':
					break;
				case 'VP_PREMISEBEDROOMS':
					break;
				case 'VP_PREMISEFLOORS':
					break;
				case 'VP_PREMISEOCCUPANTS':
					break;
				case 'VP_PREMISEROOMS':
					break;
				case 'VP_PREMISETYPES':
					break;
				case 'VP_ICONS':
					break;
				case 'VP_RSCAT':
					break;
				case 'VP_RSSUBCAT':
					break;
				case 'VP_RSTARIFF':
					break;
				case 'VP_RSTYPES':
					break;
				case 'VP_UOMS':
					break;
				case 'VP_USERSGENDER':
					break;
				case 'VP_ROOMTYPE':
					break;
				case 'VP_LINKTYPE':
					break;
				default:
					die('(MainQueryProvider) Unknown resource set ' . $sResourceSetName);
				
			}
			
			$sSQL = "SELECT * FROM $sResourceSetName";
			
			if ($filterOption != null) {
				$sSQL .= ' WHERE '.$filterOption;
			}
			
			
			//-- DEBUGGING --//
			$sSQL .= ' LIMIT 10000 ';
			
			$aSQLResult = $this->_connectionHandle->InputBindQuery($sSQL, array(), 0);
			
			//if( $sResourceSetName==="VR_USERSPREMISES" ) {
			//	echo "Test1";
			//	var_dump($sSQL);
			//}
			
			//-- IF an error has occurred --//
			if( $aSQLResult["Error"]===true ) {
				//-- Check to return null if no rows --//
				if( $aSQLResult["ErrMesg"]==="No Rows Found! Code:0" ) {
					//-- No Rows found --//
					$aReturnResults = array();
					
				} else {
					//-- TODO: Fix up this error message --//
					echo "Database Query Error!";
					echo $aSQLResult["ErrMesg"];
					die();
				}
				
			//-- ELSE no errors have occurred --//
			} else {
				
				foreach( $aSQLResult["Data"] as $aRow ) {
					switch( $sResourceSetName ) {
						
						case 'VR_USERSINFO':
							$aReturnResults[] = $this->_serializeVR_USERSINFO($aRow);
							break;
						case 'VR_USERSPREMISES':
							$aReturnResults[] = $this->_serializeVR_USERSPREMISES($aRow);
							break;
						case 'VR_USERSPREMISELOCATIONS':
							$aReturnResults[] = $this->_serializeVR_USERSPREMISELOCATIONS($aRow);
							break;
						case 'VR_USERSHUB':
							$aReturnResults[] = $this->_serializeVR_USERSHUB($aRow);
							break;
						case 'VR_USERSROOMS':
							$aReturnResults[] = $this->_serializeVR_USERSROOMS($aRow);
							break;
						case 'VR_USERSLINK':
							$aReturnResults[] = $this->_serializeVR_USERSLINK($aRow);
							break;
						case 'VR_USERSTHING':
							$aReturnResults[] = $this->_serializeVR_USERSTHING($aRow);
							break;
						case 'VR_USERSIO':
							$aReturnResults[] = $this->_serializeVR_USERSIO($aRow);
							break;
						case 'VR_DATATINYINT':
							$aReturnResults[] = $this->_serializeVR_DATATINYINT($aRow);
							break;
						case 'VR_DATAINT':
							$aReturnResults[] = $this->_serializeVR_DATAINT($aRow);
							break;
						case 'VR_DATABIGINT':
							$aReturnResults[] = $this->_serializeVR_DATABIGINT($aRow);
							break;
						case 'VR_DATAFLOAT':
							$aReturnResults[] = $this->_serializeVR_DATAFLOAT($aRow);
							break;
						case 'VR_DATATINYSTRING':
							$aReturnResults[] = $this->_serializeVR_DATATINYSTRING($aRow);
							break;
						case 'VR_DATASHORTSTRING':
							$aReturnResults[] = $this->_serializeVR_DATASHORTSTRING($aRow);
							break;
						case 'VR_DATAMEDSTRING':
							$aReturnResults[] = $this->_serializeVR_DATAMEDSTRING($aRow);
							break;
						case 'VR_USERSPREMISELOG':
							$aReturnResults[] = $this->_serializeVR_USERSPREMISELOG($aRow);
							break;
						case 'VR_USERSCOMM':
							$aReturnResults[] = $this->_serializeVR_USERSCOMM($aRow);
							break;
						case 'VP_COUNTRIES':
							$aReturnResults[] = $this->_serializeVP_COUNTRIES($aRow);
							break;
						case 'VP_CURRENCIES':
							$aReturnResults[] = $this->_serializeVP_CURRENCIES($aRow);
							break;
						case 'VP_LANGUAGES':
							$aReturnResults[] = $this->_serializeVP_LANGUAGES($aRow);
							break;
						case 'VP_POSTCODES':
							$aReturnResults[] = $this->_serializeVP_POSTCODES($aRow);
							break;
						case 'VP_TIMEZONES':
							$aReturnResults[] = $this->_serializeVP_TIMEZONES($aRow);
							break;
						case 'VP_STATEPROVINCE':
							$aReturnResults[] = $this->_serializeVP_STATEPROVINCE($aRow);
							break;
						case 'VP_PREMISEBEDROOMS':
							$aReturnResults[] = $this->_serializeVP_PREMISEBEDROOMS($aRow);
							break;
						case 'VP_PREMISEFLOORS':
							$aReturnResults[] = $this->_serializeVP_PREMISEFLOORS($aRow);
							break;
						case 'VP_PREMISEOCCUPANTS':
							$aReturnResults[] = $this->_serializeVP_PREMISEOCCUPANTS($aRow);
							break;
						case 'VP_PREMISEROOMS':
							$aReturnResults[] = $this->_serializeVP_PREMISEROOMS($aRow);
							break;
						case 'VP_PREMISETYPES':
							$aReturnResults[] = $this->_serializeVP_PREMISETYPES($aRow);
							break;
						case 'VP_ICONS':
							$aReturnResults[] = $this->_serializeVP_ICONS($aRow);
							break;
						case 'VP_RSCAT':
							$aReturnResults[] = $this->_serializeVP_RSCAT($aRow);
							break;
						case 'VP_RSSUBCAT':
							$aReturnResults[] = $this->_serializeVP_RSSUBCAT($aRow);
							break;
						case 'VP_RSTARIFF':
							$aReturnResults[] = $this->_serializeVP_RSTARIFF($aRow);
							break;
						case 'VP_RSTYPES':
							$aReturnResults[] = $this->_serializeVP_RSTYPES($aRow);
							break;
						case 'VP_UOMS':
							$aReturnResults[] = $this->_serializeVP_UOMS($aRow);
							break;
						case 'VP_USERSGENDER':
							$aReturnResults[] = $this->_serializeVP_USERSGENDER($aRow);
							break;
						case 'VP_ROOMTYPE':
							$aReturnResults[] = $this->_serializeVP_ROOMTYPE($aRow);
							break;
						case 'VP_LINKTYPE':
							$aReturnResults[] = $this->_serializeVP_LINKTYPE($aRow);
							break;
					}
				}
			}
			return $aReturnResults;
		}


		/**
		 * Gets an entity instance from an entity set identifed by a key
		 * @param ResourceSet      $resourceSet     The entity set from which an entity needs to be fetched
		 * @param KeyDescriptor    $keyDescriptor   The key to identify the entity to be fetched
		 * @return Object/NULL Returns entity instance if found else null
		 */
		public function getResourceFromResourceSet(ResourceSet $resourceSet, KeyDescriptor $keyDescriptor) {
			$aReturnResults = array();
			$sResourceSetName =  $resourceSet->getName();

			switch($sResourceSetName) {
				case 'VR_USERSINFO':
					break;
				case 'VR_USERSPREMISES':
					break;
				case 'VR_USERSPREMISELOCATIONS':
					break;
				case 'VR_USERSHUB':
					break;
				case 'VR_USERSROOMS':
					break;
				case 'VR_USERSLINK':
					break;
				case 'VR_USERSTHING':
					break;
				case 'VR_USERSIO':
					break;
				case 'VR_DATATINYINT':
					break;
				case 'VR_DATAINT':
					break;
				case 'VR_DATABIGINT':
					break;
				case 'VR_DATAFLOAT':
					break;
				case 'VR_DATATINYSTRING':
					break;
				case 'VR_DATASHORTSTRING':
					break;
				case 'VR_DATAMEDSTRING':
					break;
				case 'VR_USERSPREMISELOG':
					break;
				case 'VR_USERSCOMM':
					break;
				case 'VP_COUNTRIES':
					break;
				case 'VP_CURRENCIES':
					break;
				case 'VP_LANGUAGES':
					break;
				case 'VP_POSTCODES':
					break;
				case 'VP_TIMEZONES':
					break;
				case 'VP_STATEPROVINCE':
					break;
				case 'VP_PREMISEBEDROOMS':
					break;
				case 'VP_PREMISEFLOORS':
					break;
				case 'VP_PREMISEOCCUPANTS':
					break;
				case 'VP_PREMISEROOMS':
					break;
				case 'VP_PREMISETYPES':
					break;
				case 'VP_ICONS':
					break;
				case 'VP_RSCAT':
					break;
				case 'VP_RSSUBCAT':
					break;
				case 'VP_RSTARIFF':
					break;
				case 'VP_RSTYPES':
					break;
				case 'VP_UOMS':
					break;
				case 'VP_USERSGENDER':
					break;
				case 'VP_ROOMTYPE':
					break;
				case 'VP_LINKTYPE':
					break;
				default:
					die('(MainQueryProvider) Unknown resource set ' . $sResourceSetName);
				
			}
			
			$namedKeyValues = $keyDescriptor->getValidatedNamedValues();
			$condition = null;
			foreach ($namedKeyValues as $key => $value) {
				$condition .= $key.' = '.$value[0].' and ';
			}

			$len = strlen($condition);
			$condition = substr($condition, 0, $len - 5); 
			
			$sSQL = "SELECT * FROM $sResourceSetName WHERE $condition";
			
			//-- DEBUGGING --//
			$sSQL .= ' LIMIT 10000 ';
			
			$aSQLResult = $this->_connectionHandle->InputBindQuery($sSQL, array(), 1) ;
			
			$aReturnResults = array();
			
			//-- IF no errors have occurred --//
			if( $aSQLResult["Error"]===true ) {
				//-- Check to return null if no rows --//
				if( $aSQLResult["ErrMesg"]==="No Rows Found! Code:1" ) {
					//-- No Rows found --//
					$aReturnResults = array();
					
				} else {
					//-- TODO: Fix up this error message --//
					echo "Database Query Error!";
					echo $aSQLResult["ErrMesg"];
					die();
				}

				
			//-- ELSE No Errors have occurred --//
			} else {
				//foreach( $aSQLResult["Data"] as $aRow ) {
					switch( $sResourceSetName ) {
						case 'VR_USERSINFO':
							$aReturnResults = $this->_serializeVR_USERSINFO($aSQLResult["Data"]);
							break;
						case 'VR_USERSPREMISES':
							$aReturnResults = $this->_serializeVR_USERSPREMISES($aSQLResult["Data"]);
							break;
						case 'VR_USERSPREMISELOCATIONS':
							$aReturnResults = $this->_serializeVR_USERSPREMISELOCATIONS($aSQLResult["Data"]);
							break;
						case 'VR_USERSHUB':
							$aReturnResults = $this->_serializeVR_USERSHUB($aSQLResult["Data"]);
							break;
						case 'VR_USERSROOMS':
							$aReturnResults = $this->_serializeVR_USERSROOMS($aSQLResult["Data"]);
							break;
						case 'VR_USERSLINK':
							$aReturnResults = $this->_serializeVR_USERSLINK($aSQLResult["Data"]);
							break;
						case 'VR_USERSTHING':
							$aReturnResults = $this->_serializeVR_USERSTHING($aSQLResult["Data"]);
							break;
						case 'VR_USERSIO':
							$aReturnResults = $this->_serializeVR_USERSIO($aSQLResult["Data"]);
							break;
						case 'VR_DATATINYINT':
							$aReturnResults = $this->_serializeVR_DATATINYINT($aSQLResult["Data"]);
							break;
						case 'VR_DATAINT':
							$aReturnResults = $this->_serializeVR_DATAINT($aSQLResult["Data"]);
							break;
						case 'VR_DATABIGINT':
							$aReturnResults = $this->_serializeVR_DATABIGINT($aSQLResult["Data"]);
							break;
						case 'VR_DATAFLOAT':
							$aReturnResults = $this->_serializeVR_DATAFLOAT($aSQLResult["Data"]);
							break;
						case 'VR_DATATINYSTRING':
							$aReturnResults = $this->_serializeVR_DATATINYSTRING($aSQLResult["Data"]);
							break;
						case 'VR_DATASHORTSTRING':
							$aReturnResults = $this->_serializeVR_DATASHORTSTRING($aSQLResult["Data"]);
							break;
						case 'VR_DATAMEDSTRING':
							$aReturnResults = $this->_serializeVR_DATAMEDSTRING($aSQLResult["Data"]);
							break;
						case 'VR_USERSPREMISELOG':
							$aReturnResults = $this->_serializeVR_USERSPREMISELOG($aSQLResult["Data"]);
							break;
						case 'VR_USERSCOMM':
							$aReturnResults = $this->_serializeVR_USERSCOMM($aSQLResult["Data"]);
							break;
						case 'VP_COUNTRIES':
							$aReturnResults = $this->_serializeVP_COUNTRIES($aSQLResult["Data"]);
							break;
						case 'VP_CURRENCIES':
							$aReturnResults = $this->_serializeVP_CURRENCIES($aSQLResult["Data"]);
							break;
						case 'VP_LANGUAGES':
							$aReturnResults = $this->_serializeVP_LANGUAGES($aSQLResult["Data"]);
							break;
						case 'VP_POSTCODES':
							$aReturnResults = $this->_serializeVP_POSTCODES($aSQLResult["Data"]);
							break;
						case 'VP_TIMEZONES':
							$aReturnResults = $this->_serializeVP_TIMEZONES($aSQLResult["Data"]);
							break;
						case 'VP_STATEPROVINCE':
							$aReturnResults = $this->_serializeVP_STATEPROVINCE($aSQLResult["Data"]);
							break;
						case 'VP_PREMISEBEDROOMS':
							$aReturnResults = $this->_serializeVP_PREMISEBEDROOMS($aSQLResult["Data"]);
							break;
						case 'VP_PREMISEFLOORS':
							$aReturnResults = $this->_serializeVP_PREMISEFLOORS($aSQLResult["Data"]);
							break;
						case 'VP_PREMISEOCCUPANTS':
							$aReturnResults = $this->_serializeVP_PREMISEOCCUPANTS($aSQLResult["Data"]);
							break;
						case 'VP_PREMISEROOMS':
							$aReturnResults = $this->_serializeVP_PREMISEROOMS($aSQLResult["Data"]);
							break;
						case 'VP_PREMISETYPES':
							$aReturnResults = $this->_serializeVP_PREMISETYPES($aSQLResult["Data"]);
							break;
						case 'VP_ICONS':
							$aReturnResults = $this->_serializeVP_ICONS($aSQLResult["Data"]);
							break;
						case 'VP_RSCAT':
							$aReturnResults = $this->_serializeVP_RSCAT($aSQLResult["Data"]);
							break;
						case 'VP_RSSUBCAT':
							$aReturnResults = $this->_serializeVP_RSSUBCAT($aSQLResult["Data"]);
							break;
						case 'VP_RSTARIFF':
							$aReturnResults = $this->_serializeVP_RSTARIFF($aSQLResult["Data"]);
							break;
						case 'VP_RSTYPES':
							$aReturnResults = $this->_serializeVP_RSTYPES($aSQLResult["Data"]);
							break;
						case 'VP_UOMS':
							$aReturnResults = $this->_serializeVP_UOMS($aSQLResult["Data"]);
							break;
						case 'VP_USERSGENDER':
							$aReturnResults = $this->_serializeVP_USERSGENDER($aSQLResult["Data"]);
							break;
						case 'VP_ROOMTYPE':
							$aReturnResults = $this->_serializeVP_ROOMTYPE($aSQLResult["Data"]);
							break;
						case 'VP_LINKTYPE':
							$aReturnResults = $this->_serializeVP_LINKTYPE($aSQLResult["Data"]);
							break;
					}
				//}
			}
			
			//if( $sResourceSetName==="VR_USERSPREMISES" ) {
			//	echo "<br />\n";
			//	var_dump($aReturnResults);
			//}
			
			return $aReturnResults;
		}
		
		/**
		 * Gets a related entity instance from an entity set identifed by a key
		 * 
		 * @param ResourceSet           $sourceResourceSet		The entity set related to the entity to be fetched.
		 * @param object                $sourceEntityInstance	The related entity instance.entity needs to be fetched.
		 * @param ResourceProperty      $targetProperty			The metadata of the target  property.
		 * @param KeyDescriptor			$keyDescriptor			The key to identify the entity to be fetched.
		 * 
		 * @return Object/NULL Returns entity instance if found else null
		 */
		public function  getResourceFromRelatedResourceSet(ResourceSet $sourceResourceSet, 
			$sourceEntityInstance, 
			ResourceSet $targetResourceSet,
			ResourceProperty $targetProperty,
			KeyDescriptor $keyDescriptor
		) {
			$result = array();
			$srcClass = get_class($sourceEntityInstance);
			$navigationPropName = $targetProperty->getName();
			$key = null;
			foreach ($keyDescriptor->getValidatedNamedValues() as $keyName => $valueDescription) {
				$key = $key . $keyName . '=' . $valueDescription[0] . ' and ';
			}
			$key = rtrim($key,    ' and ');
			
			return empty($result) ? null : $result[0];	
		}
		
	
		/**
		 * Get related resource set for a resource
		 * 
		 * @param ResourceSet			$sourceResourceSet			The source resource set
		 * @param mixed					$sourceEntityInstance		The resource
		 * @param ResourceSet			$targetResourceSet			The resource set of the navigation property
		 * @param ResourceProperty		$targetProperty				The navigation property to be retrieved
		 * @return array(Objects)/array() Array of related resource if exists, if no related resources found returns empty array
		 */
		public function  getRelatedResourceSet(ResourceSet $sourceResourceSet, 
			$sourceEntityInstance, 
			ResourceSet $targetResourceSet,
			ResourceProperty $targetProperty,
			$filterOption = null,
			$select=null, $orderby=null, $top=null, $skip=null
		) {
			$result = array();
			$srcClass = get_class($sourceEntityInstance);
			$navigationPropName = $targetProperty->getName();
			return $result;
		}
		
		/**
		 * Get related resource for a resource
		 * 
		 * @param ResourceSet			$sourceResourceSet			The source resource set
		 * @param mixed					$sourceEntityInstance		The source resource
		 * @param ResourceSet			$targetResourceSet			The resource set of the navigation property
		 * @param ResourceProperty		$targetProperty				The navigation property to be retrieved
		 * 
		 * @return Object/null The related resource if exists else null
		 */
		public function getRelatedResourceReference(ResourceSet $sourceResourceSet, 
			$sourceEntityInstance, 
			ResourceSet $targetResourceSet,
			ResourceProperty $targetProperty
		) {
			$result = null;
			$srcClass = get_class($sourceEntityInstance);
			$navigationPropName = $targetProperty->getName();
			return $result;
		}
			
		
		
		
		private function _serializeVR_USERSINFO($record)	{
		 	$VR_USERSINFO = new VR_USERSINFO();
			$VR_USERSINFO->USERS_PK                         = $record['USERS_PK'];
			$VR_USERSINFO->USERS_STATE                      = $record['USERS_STATE'];
			$VR_USERSINFO->USERS_USERNAME                   = $record['USERS_USERNAME'];
			$VR_USERSINFO->USERADDRESS_PK                   = $record['USERADDRESS_PK'];
			$VR_USERSINFO->USERADDRESS_LINE3                = $record['USERADDRESS_LINE3'];
			$VR_USERSINFO->USERADDRESS_LINE2                = $record['USERADDRESS_LINE2'];
			$VR_USERSINFO->USERADDRESS_LINE1                = $record['USERADDRESS_LINE1'];
//			$VR_USERSINFO->USERADDRESS_POSTALLINE3          = $record['USERADDRESS_POSTALLINE3'];
//			$VR_USERSINFO->USERADDRESS_POSTALLINE2          = $record['USERADDRESS_POSTALLINE2'];
//			$VR_USERSINFO->USERADDRESS_POSTALLINE1          = $record['USERADDRESS_POSTALLINE1'];
			$VR_USERSINFO->COUNTRIES_PK                     = $record['COUNTRIES_PK'];
			$VR_USERSINFO->COUNTRIES_NAME                   = $record['COUNTRIES_NAME'];
			$VR_USERSINFO->COUNTRIES_ABREVIATION            = $record['COUNTRIES_ABREVIATION'];
			$VR_USERSINFO->LANGUAGE_PK                      = $record['LANGUAGE_PK'];
			$VR_USERSINFO->LANGUAGE_NAME                    = $record['LANGUAGE_NAME'];
			$VR_USERSINFO->LANGUAGE_LANGUAGE                = $record['LANGUAGE_LANGUAGE'];
			$VR_USERSINFO->LANGUAGE_VARIANT                 = $record['LANGUAGE_VARIANT'];
			$VR_USERSINFO->LANGUAGE_ENCODING                = $record['LANGUAGE_ENCODING'];
			$VR_USERSINFO->POSTCODE_PK                      = $record['POSTCODE_PK'];
			$VR_USERSINFO->POSTCODE_NAME                    = $record['POSTCODE_NAME'];
			$VR_USERSINFO->STATEPROVINCE_PK                 = $record['STATEPROVINCE_PK'];
			$VR_USERSINFO->STATEPROVINCE_SHORTNAME          = $record['STATEPROVINCE_SHORTNAME'];
			$VR_USERSINFO->STATEPROVINCE_NAME               = $record['STATEPROVINCE_NAME'];
			$VR_USERSINFO->TIMEZONE_PK                      = $record['TIMEZONE_PK'];
			$VR_USERSINFO->TIMEZONE_CC                      = $record['TIMEZONE_CC'];
			$VR_USERSINFO->TIMEZONE_LATITUDE                = $record['TIMEZONE_LATITUDE'];
			$VR_USERSINFO->TIMEZONE_LONGITUDE               = $record['TIMEZONE_LONGITUDE'];
			$VR_USERSINFO->TIMEZONE_TZ                      = $record['TIMEZONE_TZ'];
			$VR_USERSINFO->USERSINFO_PK                     = $record['USERSINFO_PK'];
			$VR_USERSINFO->USERSINFO_TITLE                  = $record['USERSINFO_TITLE'];
			$VR_USERSINFO->USERSINFO_GIVENNAMES             = $record['USERSINFO_GIVENNAMES'];
			$VR_USERSINFO->USERSINFO_SURNAMES               = $record['USERSINFO_SURNAMES'];
			$VR_USERSINFO->USERSINFO_DISPLAYNAME            = $record['USERSINFO_DISPLAYNAME'];
			$VR_USERSINFO->USERSINFO_EMAIL                  = $record['USERSINFO_EMAIL'];
			$VR_USERSINFO->USERSINFO_PHONENUMBER            = $record['USERSINFO_PHONENUMBER'];
			$VR_USERSINFO->USERSINFO_DOB                    = $record['USERSINFO_DOB'];
			$VR_USERSINFO->USERSGENDER_PK                   = $record['USERSGENDER_PK'];
			$VR_USERSINFO->USERSGENDER_NAME                 = $record['USERSGENDER_NAME'];
			return $VR_USERSINFO;
		}
		
		
		
		/**
		 * Serialize the sql row into UsersPremise object
		 * 
		 * @param array $record each row of UsersPremise
		 * @return Object
		 */
		private function _serializeVR_USERSPREMISES($record)
		{
			$VR_USERSPREMISES = new VR_USERSPREMISES();
			$VR_USERSPREMISES->USERS_PK						= $record['USERS_PK'];
			//$VR_USERSPREMISES->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSPREMISES->PERMPREMISE_OWNER			= $record['PERMPREMISE_OWNER'];
			$VR_USERSPREMISES->PERMPREMISE_WRITE			= $record['PERMPREMISE_WRITE'];
			$VR_USERSPREMISES->PERMPREMISE_STATETOGGLE		= $record['PERMPREMISE_STATETOGGLE'];
			$VR_USERSPREMISES->PERMPREMISE_READ				= $record['PERMPREMISE_READ'];
			$VR_USERSPREMISES->PERMPREMISE_ROOMADMIN		= $record['PERMPREMISE_ROOMADMIN'];
			$VR_USERSPREMISES->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSPREMISES->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSPREMISES->PREMISE_DESCRIPTION			= $record['PREMISE_DESCRIPTION'];
			$VR_USERSPREMISES->PREMISEFLOORS_PK				= $record['PREMISEFLOORS_PK'];
			$VR_USERSPREMISES->PREMISEFLOORS_NAME			= $record['PREMISEFLOORS_NAME'];
			$VR_USERSPREMISES->PREMISEINFO_PK				= $record['PREMISEINFO_PK'];
			$VR_USERSPREMISES->PREMISEROOMS_PK				= $record['PREMISEROOMS_PK'];
			$VR_USERSPREMISES->PREMISEROOMS_NAME			= $record['PREMISEROOMS_NAME'];
			$VR_USERSPREMISES->PREMISEBEDROOMS_PK			= $record['PREMISEBEDROOMS_PK'];
			$VR_USERSPREMISES->PREMISEBEDROOMS_COUNT		= $record['PREMISEBEDROOMS_COUNT'];
			$VR_USERSPREMISES->PREMISEOCCUPANTS_PK			= $record['PREMISEOCCUPANTS_PK'];
			$VR_USERSPREMISES->PREMISEOCCUPANTS_NAME		= $record['PREMISEOCCUPANTS_NAME'];
			return $VR_USERSPREMISES;
		}
		
		
		/**
		 * Serialize the sql row into UsersPremiseLocations object
		 * 
		 * @param array $record each row of UsersPremiseLocations
		 * @return Object
		 */
		private function _serializeVR_USERSPREMISELOCATIONS($record) {
			$VR_USERSPREMISELOCATIONS = new VR_USERSPREMISELOCATIONS();
			$VR_USERSPREMISELOCATIONS->USERS_PK						= $record['USERS_PK'];
			//$VR_USERSPREMISELOCATIONS->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSPREMISELOCATIONS->PERMPREMISE_OWNER			= $record['PERMPREMISE_OWNER'];
			$VR_USERSPREMISELOCATIONS->PERMPREMISE_WRITE			= $record['PERMPREMISE_WRITE'];
			$VR_USERSPREMISELOCATIONS->PERMPREMISE_STATETOGGLE		= $record['PERMPREMISE_STATETOGGLE'];
			$VR_USERSPREMISELOCATIONS->PERMPREMISE_READ				= $record['PERMPREMISE_READ'];
			$VR_USERSPREMISELOCATIONS->PERMPREMISE_ROOMADMIN		= $record['PERMPREMISE_ROOMADMIN'];
			$VR_USERSPREMISELOCATIONS->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSPREMISELOCATIONS->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSPREMISELOCATIONS->PREMISE_DESCRIPTION			= $record['PREMISE_DESCRIPTION'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_PK			= $record['PREMISEADDRESS_PK'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE1			= $record['PREMISEADDRESS_LINE1'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE2			= $record['PREMISEADDRESS_LINE2'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE3			= $record['PREMISEADDRESS_LINE3'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_PK					= $record['LANGUAGE_PK'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_NAME				= $record['LANGUAGE_NAME'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_LANGUAGE			= $record['LANGUAGE_LANGUAGE'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_VARIANT				= $record['LANGUAGE_VARIANT'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_ENCODING			= $record['LANGUAGE_ENCODING'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_PK					= $record['COUNTRIES_PK'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_NAME				= $record['COUNTRIES_NAME'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_ABREVIATION		= $record['COUNTRIES_ABREVIATION'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_PK				= $record['STATEPROVINCE_PK'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_SHORTNAME		= $record['STATEPROVINCE_SHORTNAME'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_NAME			= $record['STATEPROVINCE_NAME'];
			$VR_USERSPREMISELOCATIONS->POSTCODE_PK					= $record['POSTCODE_PK'];
			$VR_USERSPREMISELOCATIONS->POSTCODE_NAME				= $record['POSTCODE_NAME'];
			$VR_USERSPREMISELOCATIONS->TIMEZONE_PK					= $record['TIMEZONE_PK'];
			$VR_USERSPREMISELOCATIONS->TIMEZONE_CC					= $record['TIMEZONE_CC'];
			$VR_USERSPREMISELOCATIONS->TIMEZONE_LATITUDE			= $record['TIMEZONE_LATITUDE'];
			$VR_USERSPREMISELOCATIONS->TIMEZONE_LONGITUDE			= $record['TIMEZONE_LONGITUDE'];
			$VR_USERSPREMISELOCATIONS->TIMEZONE_TZ					= $record['TIMEZONE_TZ'];
			return $VR_USERSPREMISELOCATIONS;
		}
		
		/**
		 * Serialize the sql row into RSCAT object
		 * 
		 * @param array $record each row of RSCAT
		 * 
		 * @return Object
		 */
		private function _serializeVR_USERSHUB($record)
		{
			$VR_USERSHUB = new VR_USERSHUB();
			$VR_USERSHUB->USERS_PK						= $record['USERS_PK'];
			//$VR_USERSHUB->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSHUB->PERMPREMISE_OWNER				= $record['PERMPREMISE_OWNER'];
			$VR_USERSHUB->PERMPREMISE_WRITE				= $record['PERMPREMISE_WRITE'];
			$VR_USERSHUB->PERMPREMISE_STATETOGGLE		= $record['PERMPREMISE_STATETOGGLE'];
			$VR_USERSHUB->PERMPREMISE_READ				= $record['PERMPREMISE_READ'];
			$VR_USERSHUB->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSHUB->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSHUB->HUB_PK						= $record['HUB_PK'];
			$VR_USERSHUB->HUB_NAME						= $record['HUB_NAME'];
			$VR_USERSHUB->HUB_SERIALNUMBER				= $record['HUB_SERIALNUMBER'];
			$VR_USERSHUB->HUB_IPADDRESS					= $record['HUB_IPADDRESS'];
			$VR_USERSHUB->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			$VR_USERSHUB->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			return $VR_USERSHUB;
		}

		/**
		 * Serialize the sql row into UsersRooms object
		 * 
		 * @param array $record each row of UsersRooms
		 * 
		 * @return Object
		 */
		private function _serializeVR_USERSROOMS($record)
		{
			$VR_USERSROOMS = new VR_USERSROOMS();
			$VR_USERSROOMS->USERS_PK						= $record['USERS_PK'];
			//$VR_USERSROOMS->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSROOMS->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_USERSROOMS->PERMROOMS_WRITE					= $record['PERMROOMS_WRITE'];
			$VR_USERSROOMS->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			$VR_USERSROOMS->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			//$VR_USERSROOMS->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_USERSROOMS->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSROOMS->ROOMS_PK						= $record['ROOMS_PK'];
			$VR_USERSROOMS->ROOMS_PREMISE_FK				= $record['ROOMS_PREMISE_FK'];
			$VR_USERSROOMS->ROOMS_NAME						= $record['ROOMS_NAME'];
			$VR_USERSROOMS->ROOMS_FLOOR						= $record['ROOMS_FLOOR'];
			$VR_USERSROOMS->ROOMS_DESC						= $record['ROOMS_DESC'];
			$VR_USERSROOMS->ROOMTYPE_PK						= $record['ROOMTYPE_PK'];
			$VR_USERSROOMS->ROOMTYPE_NAME					= $record['ROOMTYPE_NAME'];
			$VR_USERSROOMS->ROOMTYPE_OUTDOORS				= $record['ROOMTYPE_OUTDOORS'];
			return $VR_USERSROOMS;
		}
		
		
		/**
		 * Serialize the sql row into UsersIo object
		 * 
		 * @param array $record each row of UsersIo
		 * @return Object
		 */
		private function _serializeVR_USERSLINK($record) {
			$VR_USERSLINK = new VR_USERSLINK();
			$VR_USERSLINK->USERS_PK							= $record['USERS_PK'];
			//$VR_USERSLINK->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSLINK->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_USERSLINK->PERMROOMS_WRITE					= $record['PERMROOMS_WRITE'];
			$VR_USERSLINK->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			$VR_USERSLINK->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			//$VR_USERSLINK->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_USERSLINK->PREMISE_NAME						= $record['PREMISE_NAME'];
			//$VR_USERSLINK->HUB_PK							= $record['HUB_PK'];
			//$VR_USERSLINK->HUB_NAME							= $record['HUB_NAME'];
			//$VR_USERSLINK->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			//$VR_USERSLINK->HUBTYPE_NAME						= $record['HUBTYPE_NAME'];
			$VR_USERSLINK->ROOMS_PK							= $record['ROOMS_PK'];
			$VR_USERSLINK->ROOMS_PREMISE_FK					= $record['ROOMS_PREMISE_FK'];
			$VR_USERSLINK->ROOMS_NAME						= $record['ROOMS_NAME'];
			$VR_USERSLINK->ROOMS_FLOOR						= $record['ROOMS_FLOOR'];
			$VR_USERSLINK->ROOMS_DESC						= $record['ROOMS_DESC'];
			$VR_USERSLINK->LINK_PK							= $record['LINK_PK'];
			$VR_USERSLINK->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_USERSLINK->LINK_NAME						= $record['LINK_NAME'];
			$VR_USERSLINK->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_USERSLINK->LINK_STATE						= $record['LINK_STATE'];
			$VR_USERSLINK->LINK_STATECHANGECODE				= $record['LINK_STATECHANGECODE'];
			$VR_USERSLINK->LINK_COMM_FK						= $record['LINK_COMM_FK'];
			$VR_USERSLINK->LINKTYPE_PK						= $record['LINKTYPE_PK'];
			$VR_USERSLINK->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_USERSLINK->LINKINFO_PK						= $record['LINKINFO_PK'];
			$VR_USERSLINK->LINKINFO_NAME					= $record['LINKINFO_NAME'];
			$VR_USERSLINK->LINKINFO_MANUFACTURER			= $record['LINKINFO_MANUFACTURER'];
			$VR_USERSLINK->LINKINFO_MANUFACTURERURL			= $record['LINKINFO_MANUFACTURERURL'];
			$VR_USERSLINK->LINKCONN_PK						= $record['LINKCONN_PK'];
			$VR_USERSLINK->LINKCONN_NAME					= $record['LINKCONN_NAME'];
			$VR_USERSLINK->LINKCONN_ADDRESS					= $record['LINKCONN_ADDRESS'];
			$VR_USERSLINK->LINKCONN_USERNAME				= $record['LINKCONN_USERNAME'];
			$VR_USERSLINK->LINKCONN_PASSWORD				= $record['LINKCONN_PASSWORD'];
			$VR_USERSLINK->LINKCONN_PORT					= $record['LINKCONN_PORT'];
			$VR_USERSLINK->LINKPROTOCOL_NAME				= $record['LINKPROTOCOL_NAME'];
			$VR_USERSLINK->LINKCRYPTTYPE_NAME				= $record['LINKCRYPTTYPE_NAME'];
			$VR_USERSLINK->LINKFREQ_NAME					= $record['LINKFREQ_NAME'];
			return $VR_USERSLINK;
		}
		
		
		
		/**
		 * Serialize the sql row into UsersIOPorts object
		 * 
		 * @param array $record each row of UsersIOPorts
		 * 
		 * @return Object
		 */
		private function _serializeVR_USERSTHING($record) {
			$VR_USERSTHING = new VR_USERSTHING();
			$VR_USERSTHING->USERS_PK						= $record['USERS_PK'];
			//$VR_USERSTHING->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSTHING->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_USERSTHING->PERMROOMS_WRITE					= $record['PERMROOMS_WRITE'];
			$VR_USERSTHING->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			$VR_USERSTHING->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			//$VR_USERSTHING->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_USERSTHING->PREMISE_NAME					= $record['PREMISE_NAME'];
			//$VR_USERSTHING->HUB_PK							= $record['HUB_PK'];
			//$VR_USERSTHING->HUB_NAME						= $record['HUB_NAME'];
			//$VR_USERSTHING->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			//$VR_USERSTHING->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_USERSTHING->ROOMS_PK						= $record['ROOMS_PK'];
			$VR_USERSTHING->ROOMS_PREMISE_FK				= $record['ROOMS_PREMISE_FK'];
			$VR_USERSTHING->LINK_PK							= $record['LINK_PK'];
			$VR_USERSTHING->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_USERSTHING->LINK_NAME						= $record['LINK_NAME'];
			$VR_USERSTHING->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_USERSTHING->LINK_STATE						= $record['LINK_STATE'];
			$VR_USERSTHING->LINK_STATECHANGECODE			= $record['LINK_STATECHANGECODE'];
			$VR_USERSTHING->LINK_COMM_FK					= $record['LINK_COMM_FK'];
			$VR_USERSTHING->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_USERSTHING->LINKTYPE_NAME				= $record['LINKTYPE_NAME'];
			$VR_USERSTHING->THING_PK					= $record['THING_PK'];
			$VR_USERSTHING->THING_HWID					= $record['THING_HWID'];
			$VR_USERSTHING->THING_OUTPUTHWID			= $record['THING_OUTPUTHWID'];
			$VR_USERSTHING->THING_STATE					= $record['THING_STATE'];
			$VR_USERSTHING->THING_STATECHANGEID			= $record['THING_STATECHANGEID'];
			$VR_USERSTHING->THING_NAME					= $record['THING_NAME'];
			$VR_USERSTHING->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_USERSTHING->THINGTYPE_NAME				= $record['THINGTYPE_NAME'];
			return $VR_USERSTHING;
		}		
		
		
		/**
		 * Serialize the sql row into UsersIOs object
		 * 
		 * @param array $record each row of UsersIOs
		 * 
		 * @return Object
		 */
		private function _serializeVR_USERSIO($record) {
			$VR_USERSIO = new VR_USERSIO();
			$VR_USERSIO->USERS_PK						= $record['USERS_PK'];
//			$VR_USERSIO->USERS_USERNAME				= $record['USERS_USERNAME'];
//			$VR_USERSIO->PERMISSIONS_PK				= $record['PERMISSIONS_PK'];
			$VR_USERSIO->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_USERSIO->PERMROOMS_WRITE				= $record['PERMROOMS_WRITE'];
			$VR_USERSIO->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			$VR_USERSIO->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			//$VR_USERSIO->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_USERSIO->PREMISE_NAME					= $record['PREMISE_NAME'];
			//$VR_USERSIO->HUB_PK							= $record['HUB_PK'];
			//$VR_USERSIO->HUB_NAME						= $record['HUB_NAME'];
			//$VR_USERSIO->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			//$VR_USERSIO->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_USERSIO->ROOMS_PK						= $record['ROOMS_PK'];
			$VR_USERSIO->ROOMS_PREMISE_FK				= $record['ROOMS_PREMISE_FK'];
			$VR_USERSIO->LINK_PK						= $record['LINK_PK'];
			$VR_USERSIO->LINK_COMM_FK					= $record['LINK_COMM_FK'];
			$VR_USERSIO->LINK_SERIALCODE				= $record['LINK_SERIALCODE'];
			$VR_USERSIO->LINK_NAME						= $record['LINK_NAME'];
			$VR_USERSIO->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_USERSIO->LINK_STATE						= $record['LINK_STATE'];
			$VR_USERSIO->LINK_STATECHANGECODE			= $record['LINK_STATECHANGECODE'];
			$VR_USERSIO->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_USERSIO->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_USERSIO->THING_PK						= $record['THING_PK'];
			$VR_USERSIO->THING_HWID						= $record['THING_HWID'];
			$VR_USERSIO->THING_OUTPUTHWID				= $record['THING_OUTPUTHWID'];
			$VR_USERSIO->THING_STATE					= $record['THING_STATE'];
			$VR_USERSIO->THING_STATECHANGEID			= $record['THING_STATECHANGEID'];
			$VR_USERSIO->THING_NAME						= $record['THING_NAME'];
			$VR_USERSIO->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_USERSIO->THINGTYPE_NAME					= $record['THINGTYPE_NAME'];
			$VR_USERSIO->IO_PK							= $record['IO_PK'];
			$VR_USERSIO->IO_BASECONVERT					= $record['IO_BASECONVERT'];
			$VR_USERSIO->IO_NAME						= $record['IO_NAME'];
			$VR_USERSIO->IO_SAMPLERATELIMIT				= $record['IO_SAMPLERATELIMIT'];
			$VR_USERSIO->IO_SAMPLERATEMAX				= $record['IO_SAMPLERATEMAX'];
			$VR_USERSIO->IO_SAMPLERATECURRENT			= $record['IO_SAMPLERATECURRENT'];
			$VR_USERSIO->IO_STATE					= $record['IO_STATE'];
			$VR_USERSIO->IO_STATECHANGEID			= $record['IO_STATECHANGEID'];
			$VR_USERSIO->IOTYPE_PK					= $record['IOTYPE_PK'];
			$VR_USERSIO->IOTYPE_NAME				= $record['IOTYPE_NAME'];
			$VR_USERSIO->IOTYPE_ENUM				= $record['IOTYPE_ENUM'];
			$VR_USERSIO->IOTYPE_DATATYPE_FK		= $record['IOTYPE_DATATYPE_FK'];
			$VR_USERSIO->DATATYPE_PK					= $record['DATATYPE_PK'];
			$VR_USERSIO->DATATYPE_NAME					= $record['DATATYPE_NAME'];
			$VR_USERSIO->RSCAT_PK						= $record['RSCAT_PK'];
			$VR_USERSIO->RSCAT_NAME					= $record['RSCAT_NAME'];
			$VR_USERSIO->RSSUBCAT_PK					= $record['RSSUBCAT_PK'];
			$VR_USERSIO->RSSUBCAT_NAME					= $record['RSSUBCAT_NAME'];
			$VR_USERSIO->RSSUBCAT_TYPE					= $record['RSSUBCAT_TYPE'];
			$VR_USERSIO->RSTARIFF_PK					= $record['RSTARIFF_PK'];
			$VR_USERSIO->RSTARIFF_NAME					= $record['RSTARIFF_NAME'];
			$VR_USERSIO->RSTYPE_PK						= $record['RSTYPE_PK'];
			$VR_USERSIO->RSTYPE_NAME					= $record['RSTYPE_NAME'];
			$VR_USERSIO->RSTYPE_MAIN					= $record['RSTYPE_MAIN'];
			$VR_USERSIO->UOMCAT_PK						= $record['UOMCAT_PK'];
			$VR_USERSIO->UOMCAT_NAME					= $record['UOMCAT_NAME'];
			$VR_USERSIO->UOMSUBCAT_PK					= $record['UOMSUBCAT_PK'];
			$VR_USERSIO->UOMSUBCAT_NAME				= $record['UOMSUBCAT_NAME'];
			$VR_USERSIO->UOM_PK						= $record['UOM_PK'];
			$VR_USERSIO->UOM_NAME						= $record['UOM_NAME'];
			$VR_USERSIO->UOM_RATE						= $record['UOM_RATE'];
			return $VR_USERSIO;
		}
		
		
		/**
		 * Serialize the sql row into DataTinyInt object
		 * 
		 * @param array $record each row of DataTinyInt
		 * @return Object
		 */
		private function _serializeVR_DATATINYINT($record) {
			$VR_DATATINYINT = new VR_DATATINYINT();
			$VR_DATATINYINT->CALCEDVALUE = $record['CALCEDVALUE'];
			$VR_DATATINYINT->UTS = $record['UTS'];
			$VR_DATATINYINT->DATATINYINT_PK = $record['DATATINYINT_PK'];
			$VR_DATATINYINT->DATATINYINT_DATE = $record['DATATINYINT_DATE'];
			$VR_DATATINYINT->DATATINYINT_VALUE = $record['DATATINYINT_VALUE'];
			$VR_DATATINYINT->DATATYPE_PK                    = $record['DATATYPE_PK'];
			$VR_DATATINYINT->DATATYPE_NAME                  = $record['DATATYPE_NAME'];
			$VR_DATATINYINT->USERS_PK                       = $record['USERS_PK'];
			//$VR_DATATINYINT->USERS_USERNAME                 = $record['USERS_USERNAME'];
			//$VR_DATATINYINT->PREMISE_PK                     = $record['PREMISE_PK'];
			$VR_DATATINYINT->PREMISE_NAME                   = $record['PREMISE_NAME'];
			$VR_DATATINYINT->PERMROOMS_READ                 = $record['PERMROOMS_READ'];
			$VR_DATATINYINT->PERMROOMS_WRITE                = $record['PERMROOMS_WRITE'];
			$VR_DATATINYINT->PERMROOMS_STATETOGGLE          = $record['PERMROOMS_STATETOGGLE'];
			$VR_DATATINYINT->PERMROOMS_DATAREAD             = $record['PERMROOMS_DATAREAD'];
			//$VR_DATATINYINT->HUB_PK                         = $record['HUB_PK'];
			//$VR_DATATINYINT->HUB_NAME                       = $record['HUB_NAME'];
			//$VR_DATATINYINT->HUBTYPE_PK                     = $record['HUBTYPE_PK'];
			//$VR_DATATINYINT->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
			$VR_DATATINYINT->LINK_PK = $record['LINK_PK'];
			$VR_DATATINYINT->LINK_SERIALCODE = $record['LINK_SERIALCODE'];
			$VR_DATATINYINT->LINK_NAME = $record['LINK_NAME'];
			$VR_DATATINYINT->LINK_CONNECTED = $record['LINK_CONNECTED'];
			$VR_DATATINYINT->LINK_STATE = $record['LINK_STATE'];
			$VR_DATATINYINT->LINK_STATECHANGECODE = $record['LINK_STATECHANGECODE'];
			$VR_DATATINYINT->LINKTYPE_PK = $record['LINKTYPE_PK'];
			$VR_DATATINYINT->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			$VR_DATATINYINT->THING_PK = $record['THING_PK'];
			$VR_DATATINYINT->THING_HWID = $record['THING_HWID'];
			$VR_DATATINYINT->THING_OUTPUTHWID = $record['THING_OUTPUTHWID'];
			$VR_DATATINYINT->THING_STATE = $record['THING_STATE'];
			$VR_DATATINYINT->THING_STATECHANGEID = $record['THING_STATECHANGEID'];
			$VR_DATATINYINT->THING_NAME = $record['THING_NAME'];
			$VR_DATATINYINT->THINGTYPE_PK = $record['THINGTYPE_PK'];
			$VR_DATATINYINT->THINGTYPE_NAME = $record['THINGTYPE_NAME'];
			$VR_DATATINYINT->IO_BASECONVERT = $record['IO_BASECONVERT'];
			$VR_DATATINYINT->IO_PK = $record['IO_PK'];
			$VR_DATATINYINT->IO_NAME = $record['IO_NAME'];
			$VR_DATATINYINT->IO_SAMPLERATELIMIT = $record['IO_SAMPLERATELIMIT'];
			$VR_DATATINYINT->IO_SAMPLERATEMAX = $record['IO_SAMPLERATEMAX'];
			$VR_DATATINYINT->IO_SAMPLERATECURRENT = $record['IO_SAMPLERATECURRENT'];
			$VR_DATATINYINT->IO_STATECHANGEID = $record['IO_STATECHANGEID'];
			$VR_DATATINYINT->IO_STATE = $record['IO_STATE'];
			$VR_DATATINYINT->IOTYPE_PK = $record['IOTYPE_PK'];
			$VR_DATATINYINT->IOTYPE_NAME = $record['IOTYPE_NAME'];
			$VR_DATATINYINT->IOTYPE_ENUM = $record['IOTYPE_ENUM'];
			$VR_DATATINYINT->RSCAT_PK = $record['RSCAT_PK'];
			$VR_DATATINYINT->RSCAT_NAME = $record['RSCAT_NAME'];
			$VR_DATATINYINT->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VR_DATATINYINT->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VR_DATATINYINT->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VR_DATATINYINT->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VR_DATATINYINT->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VR_DATATINYINT->RSTYPE_PK = $record['RSTYPE_PK'];
			$VR_DATATINYINT->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VR_DATATINYINT->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VR_DATATINYINT->UOMCAT_PK = $record['UOMCAT_PK'];
			$VR_DATATINYINT->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VR_DATATINYINT->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VR_DATATINYINT->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VR_DATATINYINT->UOM_PK = $record['UOM_PK'];
			$VR_DATATINYINT->UOM_NAME = $record['UOM_NAME'];
			$VR_DATATINYINT->UOM_RATE = $record['UOM_RATE'];
			return $VR_DATATINYINT;
		}
		
		/**
		 * Serialize the sql row into DataInt object
		 * 
		 * @param array $record each row of DataInt
		 * @return Object
		 */
		private function _serializeVR_DATAINT($record) {
			$VR_DATAINT = new VR_DATAINT();
			$VR_DATAINT->CALCEDVALUE = $record['CALCEDVALUE'];
			$VR_DATAINT->UTS = $record['UTS'];
			$VR_DATAINT->DATAINT_PK					= $record['DATAINT_PK'];
			$VR_DATAINT->DATAINT_DATE				= $record['DATAINT_DATE'];
			$VR_DATAINT->DATAINT_VALUE				= $record['DATAINT_VALUE'];
			$VR_DATAINT->DATATYPE_PK				= $record['DATATYPE_PK'];
			$VR_DATAINT->DATATYPE_NAME				= $record['DATATYPE_NAME'];
			$VR_DATAINT->USERS_PK					= $record['USERS_PK'];
			//$VR_DATAINT->USERS_USERNAME				= $record['USERS_USERNAME'];
			//$VR_DATAINT->PREMISE_PK					= $record['PREMISE_PK'];
			//$VR_DATAINT->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_DATAINT->PERMROOMS_READ				= $record['PERMROOMS_READ'];
			$VR_DATAINT->PERMROOMS_WRITE			= $record['PERMROOMS_WRITE'];
			$VR_DATAINT->PERMROOMS_STATETOGGLE		= $record['PERMROOMS_STATETOGGLE'];
			$VR_DATAINT->PERMROOMS_DATAREAD			= $record['PERMROOMS_DATAREAD'];
			//$VR_DATAINT->HUB_PK						= $record['HUB_PK'];
			//$VR_DATAINT->HUB_NAME					= $record['HUB_NAME'];
			//$VR_DATAINT->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			//$VR_DATAINT->HUBTYPE_NAME				= $record['HUBTYPE_NAME'];
			$VR_DATAINT->LINK_PK = $record['LINK_PK'];
			$VR_DATAINT->LINK_SERIALCODE = $record['LINK_SERIALCODE'];
			$VR_DATAINT->LINK_NAME = $record['LINK_NAME'];
			$VR_DATAINT->LINK_CONNECTED = $record['LINK_CONNECTED'];
			$VR_DATAINT->LINK_STATE = $record['LINK_STATE'];
			$VR_DATAINT->LINK_STATECHANGECODE = $record['LINK_STATECHANGECODE'];
			$VR_DATAINT->LINKTYPE_PK = $record['LINKTYPE_PK'];
			$VR_DATAINT->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			$VR_DATAINT->THING_PK = $record['THING_PK'];
			$VR_DATAINT->THING_HWID = $record['THING_HWID'];
			$VR_DATAINT->THING_OUTPUTHWID = $record['THING_OUTPUTHWID'];
			$VR_DATAINT->THING_STATE = $record['THING_STATE'];
			$VR_DATAINT->THING_STATECHANGEID = $record['THING_STATECHANGEID'];
			$VR_DATAINT->THING_NAME = $record['THING_NAME'];
			$VR_DATAINT->THINGTYPE_PK = $record['THINGTYPE_PK'];
			$VR_DATAINT->THINGTYPE_NAME = $record['THINGTYPE_NAME'];
			$VR_DATAINT->IO_BASECONVERT = $record['IO_BASECONVERT'];
			$VR_DATAINT->IO_PK = $record['IO_PK'];
			$VR_DATAINT->IO_NAME = $record['IO_NAME'];
			$VR_DATAINT->IO_SAMPLERATELIMIT = $record['IO_SAMPLERATELIMIT'];
			$VR_DATAINT->IO_SAMPLERATEMAX = $record['IO_SAMPLERATEMAX'];
			$VR_DATAINT->IO_SAMPLERATECURRENT = $record['IO_SAMPLERATECURRENT'];
			$VR_DATAINT->IO_STATECHANGEID = $record['IO_STATECHANGEID'];
			$VR_DATAINT->IO_STATE = $record['IO_STATE'];
			$VR_DATAINT->IOTYPE_PK = $record['IOTYPE_PK'];
			$VR_DATAINT->IOTYPE_NAME = $record['IOTYPE_NAME'];
			$VR_DATAINT->IOTYPE_ENUM = $record['IOTYPE_ENUM'];
			$VR_DATAINT->RSCAT_PK = $record['RSCAT_PK'];
			$VR_DATAINT->RSCAT_NAME = $record['RSCAT_NAME'];
			$VR_DATAINT->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VR_DATAINT->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VR_DATAINT->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VR_DATAINT->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VR_DATAINT->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VR_DATAINT->RSTYPE_PK = $record['RSTYPE_PK'];
			$VR_DATAINT->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VR_DATAINT->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VR_DATAINT->UOMCAT_PK = $record['UOMCAT_PK'];
			$VR_DATAINT->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VR_DATAINT->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VR_DATAINT->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VR_DATAINT->UOM_PK = $record['UOM_PK'];
			$VR_DATAINT->UOM_NAME = $record['UOM_NAME'];
			$VR_DATAINT->UOM_RATE = $record['UOM_RATE'];

			return $VR_DATAINT;
		}
		
		/**
		 * Serialize the sql row into DATABIGINT object
		 * 
		 * @param array $record each row of DATABIGINT
		 * @return Object
		 */
		private function _serializeVR_DATABIGINT($record) {
			$VR_DATABIGINT = new VR_DATABIGINT();
			$VR_DATABIGINT->CALCEDVALUE						= $record['CALCEDVALUE'];
			$VR_DATABIGINT->UTS								= $record['UTS'];
			$VR_DATABIGINT->DATABIGINT_PK					= $record['DATABIGINT_PK'];
			$VR_DATABIGINT->DATABIGINT_DATE					= $record['DATABIGINT_DATE'];
			$VR_DATABIGINT->DATABIGINT_VALUE				= $record['DATABIGINT_VALUE'];
			$VR_DATABIGINT->DATATYPE_PK						= $record['DATATYPE_PK'];
			$VR_DATABIGINT->DATATYPE_NAME					= $record['DATATYPE_NAME'];
			$VR_DATABIGINT->USERS_PK						= $record['USERS_PK'];
			//$VR_DATABIGINT->USERS_USERNAME					= $record['USERS_USERNAME'];
			//$VR_DATABIGINT->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_DATABIGINT->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_DATABIGINT->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_DATABIGINT->PERMROOMS_WRITE					= $record['PERMROOMS_WRITE'];
			$VR_DATABIGINT->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			$VR_DATABIGINT->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			//$VR_DATABIGINT->HUB_PK							= $record['HUB_PK'];
			//$VR_DATABIGINT->HUB_NAME						= $record['HUB_NAME'];
			//$VR_DATABIGINT->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			//$VR_DATABIGINT->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_DATABIGINT->LINK_PK							= $record['LINK_PK'];
			$VR_DATABIGINT->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_DATABIGINT->LINK_NAME						= $record['LINK_NAME'];
			$VR_DATABIGINT->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_DATABIGINT->LINK_STATE						= $record['LINK_STATE'];
			$VR_DATABIGINT->LINK_STATECHANGECODE			= $record['LINK_STATECHANGECODE'];
			$VR_DATABIGINT->LINKTYPE_PK						= $record['LINKTYPE_PK'];
			$VR_DATABIGINT->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_DATABIGINT->THING_PK						= $record['THING_PK'];
			$VR_DATABIGINT->THING_HWID						= $record['THING_HWID'];
			$VR_DATABIGINT->THING_OUTPUTHWID				= $record['THING_OUTPUTHWID'];
			$VR_DATABIGINT->THING_STATE						= $record['THING_STATE'];
			$VR_DATABIGINT->THING_STATECHANGEID				= $record['THING_STATECHANGEID'];
			$VR_DATABIGINT->THING_NAME						= $record['THING_NAME'];
			$VR_DATABIGINT->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_DATABIGINT->THINGTYPE_NAME					= $record['THINGTYPE_NAME'];
			$VR_DATABIGINT->IO_BASECONVERT					= $record['IO_BASECONVERT'];
			$VR_DATABIGINT->IO_PK							= $record['IO_PK'];
			$VR_DATABIGINT->IO_NAME							= $record['IO_NAME'];
			$VR_DATABIGINT->IO_SAMPLERATELIMIT				= $record['IO_SAMPLERATELIMIT'];
			$VR_DATABIGINT->IO_SAMPLERATEMAX				= $record['IO_SAMPLERATEMAX'];
			$VR_DATABIGINT->IO_SAMPLERATECURRENT			= $record['IO_SAMPLERATECURRENT'];
			$VR_DATABIGINT->IO_STATECHANGEID				= $record['IO_STATECHANGEID'];
			$VR_DATABIGINT->IO_STATE						= $record['IO_STATE'];
			$VR_DATABIGINT->IOTYPE_PK						= $record['IOTYPE_PK'];
			$VR_DATABIGINT->IOTYPE_NAME						= $record['IOTYPE_NAME'];
			$VR_DATABIGINT->IOTYPE_ENUM						= $record['IOTYPE_ENUM'];
			$VR_DATABIGINT->RSCAT_PK						= $record['RSCAT_PK'];
			$VR_DATABIGINT->RSCAT_NAME						= $record['RSCAT_NAME'];
			$VR_DATABIGINT->RSSUBCAT_PK						= $record['RSSUBCAT_PK'];
			$VR_DATABIGINT->RSSUBCAT_NAME					= $record['RSSUBCAT_NAME'];
			$VR_DATABIGINT->RSSUBCAT_TYPE					= $record['RSSUBCAT_TYPE'];
			$VR_DATABIGINT->RSTARIFF_PK						= $record['RSTARIFF_PK'];
			$VR_DATABIGINT->RSTARIFF_NAME					= $record['RSTARIFF_NAME'];
			$VR_DATABIGINT->RSTYPE_PK						= $record['RSTYPE_PK'];
			$VR_DATABIGINT->RSTYPE_NAME						= $record['RSTYPE_NAME'];
			$VR_DATABIGINT->RSTYPE_MAIN						= $record['RSTYPE_MAIN'];
			$VR_DATABIGINT->UOMCAT_PK						= $record['UOMCAT_PK'];
			$VR_DATABIGINT->UOMCAT_NAME						= $record['UOMCAT_NAME'];
			$VR_DATABIGINT->UOMSUBCAT_PK					= $record['UOMSUBCAT_PK'];
			$VR_DATABIGINT->UOMSUBCAT_NAME					= $record['UOMSUBCAT_NAME'];
			$VR_DATABIGINT->UOM_PK							= $record['UOM_PK'];
			$VR_DATABIGINT->UOM_NAME						= $record['UOM_NAME'];
			$VR_DATABIGINT->UOM_RATE						= $record['UOM_RATE'];
			return $VR_DATABIGINT;
		}
		
		/**
		 * Serialize the sql row into DATAFLOAT object
		 * 
		 * @param array $record each row of DATAFLOAT
		 * @return Object
		 */
		private function _serializeVR_DATAFLOAT($record) {
			$VR_DATAFLOAT = new VR_DATAFLOAT();
			$VR_DATAFLOAT->CALCEDVALUE						= $record['CALCEDVALUE'];
			$VR_DATAFLOAT->UTS								= $record['UTS'];
			$VR_DATAFLOAT->DATAFLOAT_PK						= $record['DATAFLOAT_PK'];
			$VR_DATAFLOAT->DATAFLOAT_DATE					= $record['DATAFLOAT_DATE'];
			$VR_DATAFLOAT->DATAFLOAT_VALUE					= $record['DATAFLOAT_VALUE'];
			$VR_DATAFLOAT->DATATYPE_PK						= $record['DATATYPE_PK'];
			$VR_DATAFLOAT->DATATYPE_NAME					= $record['DATATYPE_NAME'];
			$VR_DATAFLOAT->USERS_PK							= $record['USERS_PK'];
			//$VR_DATAFLOAT->USERS_USERNAME					= $record['USERS_USERNAME'];
			//$VR_DATAFLOAT->PREMISE_PK						= $record['PREMISE_PK'];
			//$VR_DATAFLOAT->PREMISE_NAME						= $record['PREMISE_NAME'];
			$VR_DATAFLOAT->PERMROOMS_READ					= $record['PERMROOMS_READ'];
			$VR_DATAFLOAT->PERMROOMS_WRITE					= $record['PERMROOMS_WRITE'];
			$VR_DATAFLOAT->PERMROOMS_DATAREAD				= $record['PERMROOMS_DATAREAD'];
			$VR_DATAFLOAT->PERMROOMS_STATETOGGLE			= $record['PERMROOMS_STATETOGGLE'];
			//$VR_DATAFLOAT->HUB_PK							= $record['HUB_PK'];
			//$VR_DATAFLOAT->HUB_NAME							= $record['HUB_NAME'];
			//$VR_DATAFLOAT->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			//$VR_DATAFLOAT->HUBTYPE_NAME						= $record['HUBTYPE_NAME'];
			$VR_DATAFLOAT->LINK_PK							= $record['LINK_PK'];
			$VR_DATAFLOAT->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_DATAFLOAT->LINK_NAME						= $record['LINK_NAME'];
			$VR_DATAFLOAT->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_DATAFLOAT->LINK_STATE						= $record['LINK_STATE'];
			$VR_DATAFLOAT->LINK_STATECHANGECODE				= $record['LINK_STATECHANGECODE'];
			$VR_DATAFLOAT->LINKTYPE_PK						= $record['LINKTYPE_PK'];
			$VR_DATAFLOAT->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_DATAFLOAT->THING_PK							= $record['THING_PK'];
			$VR_DATAFLOAT->THING_HWID						= $record['THING_HWID'];
			$VR_DATAFLOAT->THING_OUTPUTHWID					= $record['THING_OUTPUTHWID'];
			$VR_DATAFLOAT->THING_STATE						= $record['THING_STATE'];
			$VR_DATAFLOAT->THING_STATECHANGEID				= $record['THING_STATECHANGEID'];
			$VR_DATAFLOAT->THING_NAME						= $record['THING_NAME'];
			$VR_DATAFLOAT->THINGTYPE_PK						= $record['THINGTYPE_PK'];
			$VR_DATAFLOAT->THINGTYPE_NAME					= $record['THINGTYPE_NAME'];
			$VR_DATAFLOAT->IO_BASECONVERT					= $record['IO_BASECONVERT'];
			$VR_DATAFLOAT->IO_PK							= $record['IO_PK'];
			$VR_DATAFLOAT->IO_NAME							= $record['IO_NAME'];
			$VR_DATAFLOAT->IO_SAMPLERATELIMIT				= $record['IO_SAMPLERATELIMIT'];
			$VR_DATAFLOAT->IO_SAMPLERATEMAX					= $record['IO_SAMPLERATEMAX'];
			$VR_DATAFLOAT->IO_SAMPLERATECURRENT				= $record['IO_SAMPLERATECURRENT'];
			$VR_DATAFLOAT->IO_STATECHANGEID					= $record['IO_STATECHANGEID'];
			$VR_DATAFLOAT->IO_STATE							= $record['IO_STATE'];
			$VR_DATAFLOAT->IOTYPE_PK						= $record['IOTYPE_PK'];
			$VR_DATAFLOAT->IOTYPE_NAME						= $record['IOTYPE_NAME'];
			$VR_DATAFLOAT->IOTYPE_ENUM						= $record['IOTYPE_ENUM'];
			$VR_DATAFLOAT->RSCAT_PK							= $record['RSCAT_PK'];
			$VR_DATAFLOAT->RSCAT_NAME						= $record['RSCAT_NAME'];
			$VR_DATAFLOAT->RSSUBCAT_PK						= $record['RSSUBCAT_PK'];
			$VR_DATAFLOAT->RSSUBCAT_NAME					= $record['RSSUBCAT_NAME'];
			$VR_DATAFLOAT->RSSUBCAT_TYPE					= $record['RSSUBCAT_TYPE'];
			$VR_DATAFLOAT->RSTARIFF_PK						= $record['RSTARIFF_PK'];
			$VR_DATAFLOAT->RSTARIFF_NAME					= $record['RSTARIFF_NAME'];
			$VR_DATAFLOAT->RSTYPE_PK						= $record['RSTYPE_PK'];
			$VR_DATAFLOAT->RSTYPE_NAME						= $record['RSTYPE_NAME'];
			$VR_DATAFLOAT->RSTYPE_MAIN						= $record['RSTYPE_MAIN'];
			$VR_DATAFLOAT->UOMCAT_PK						= $record['UOMCAT_PK'];
			$VR_DATAFLOAT->UOMCAT_NAME						= $record['UOMCAT_NAME'];
			$VR_DATAFLOAT->UOMSUBCAT_PK						= $record['UOMSUBCAT_PK'];
			$VR_DATAFLOAT->UOMSUBCAT_NAME					= $record['UOMSUBCAT_NAME'];
			$VR_DATAFLOAT->UOM_PK							= $record['UOM_PK'];
			$VR_DATAFLOAT->UOM_NAME							= $record['UOM_NAME'];
			$VR_DATAFLOAT->UOM_RATE							= $record['UOM_RATE'];
			return $VR_DATAFLOAT;
		}
		
		
		/**
		 * Serialize the sql row into DataTinyString object
		 * 
		 * @param array $record each row of DataTinyString
		 * @return Object
		 */
		private function _serializeVR_DATATINYSTRING($record)
		{
			$VR_DATATINYSTRING = new VR_DATATINYSTRING();
			$VR_DATATINYSTRING->CALCEDVALUE					= $record['CALCEDVALUE'];
			$VR_DATATINYSTRING->UTS							= $record['UTS'];
			$VR_DATATINYSTRING->DATATINYSTRING_PK			= $record['DATATINYSTRING_PK'];
			$VR_DATATINYSTRING->DATATINYSTRING_DATE			= $record['DATATINYSTRING_DATE'];
			$VR_DATATINYSTRING->DATATINYSTRING_VALUE		= $record['DATATINYSTRING_VALUE'];
			$VR_DATATINYSTRING->DATATYPE_PK					= $record['DATATYPE_PK'];
			$VR_DATATINYSTRING->DATATYPE_NAME				= $record['DATATYPE_NAME'];
			$VR_DATATINYSTRING->USERS_PK					= $record['USERS_PK'];
			//$VR_DATATINYSTRING->USERS_USERNAME				= $record['USERS_USERNAME'];
			//$VR_DATATINYSTRING->PREMISE_PK					= $record['PREMISE_PK'];
			//$VR_DATATINYSTRING->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_DATATINYSTRING->PERMROOMS_READ				= $record['PERMROOMS_READ'];
			$VR_DATATINYSTRING->PERMROOMS_WRITE				= $record['PERMROOMS_WRITE'];
			$VR_DATATINYSTRING->PERMROOMS_STATETOGGLE		= $record['PERMROOMS_STATETOGGLE'];
			$VR_DATATINYSTRING->PERMROOMS_DATAREAD			= $record['PERMROOMS_DATAREAD'];
			//$VR_DATATINYSTRING->HUB_PK						= $record['HUB_PK'];
			//$VR_DATATINYSTRING->HUB_NAME					= $record['HUB_NAME'];
			//$VR_DATATINYSTRING->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			//$VR_DATATINYSTRING->HUBTYPE_NAME				= $record['HUBTYPE_NAME'];
			$VR_DATATINYSTRING->LINK_PK						= $record['LINK_PK'];
			$VR_DATATINYSTRING->LINK_SERIALCODE				= $record['LINK_SERIALCODE'];
			$VR_DATATINYSTRING->LINK_NAME					= $record['LINK_NAME'];
			$VR_DATATINYSTRING->LINK_CONNECTED				= $record['LINK_CONNECTED'];
			$VR_DATATINYSTRING->LINK_STATE					= $record['LINK_STATE'];
			$VR_DATATINYSTRING->LINK_STATECHANGECODE		= $record['LINK_STATECHANGECODE'];
			$VR_DATATINYSTRING->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_DATATINYSTRING->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			$VR_DATATINYSTRING->THING_PK = $record['THING_PK'];
			$VR_DATATINYSTRING->THING_HWID = $record['THING_HWID'];
			$VR_DATATINYSTRING->THING_OUTPUTHWID = $record['THING_OUTPUTHWID'];
			$VR_DATATINYSTRING->THING_STATE = $record['THING_STATE'];
			$VR_DATATINYSTRING->THING_STATECHANGEID = $record['THING_STATECHANGEID'];
			$VR_DATATINYSTRING->THING_NAME = $record['THING_NAME'];
			$VR_DATATINYSTRING->THINGTYPE_PK = $record['THINGTYPE_PK'];
			$VR_DATATINYSTRING->THINGTYPE_NAME = $record['THINGTYPE_NAME'];
			$VR_DATATINYSTRING->IO_BASECONVERT = $record['IO_BASECONVERT'];
			$VR_DATATINYSTRING->IO_PK = $record['IO_PK'];
			$VR_DATATINYSTRING->IO_NAME = $record['IO_NAME'];
			$VR_DATATINYSTRING->IO_SAMPLERATELIMIT = $record['IO_SAMPLERATELIMIT'];
			$VR_DATATINYSTRING->IO_SAMPLERATEMAX = $record['IO_SAMPLERATEMAX'];
			$VR_DATATINYSTRING->IO_SAMPLERATECURRENT = $record['IO_SAMPLERATECURRENT'];
			$VR_DATATINYSTRING->IO_STATECHANGEID = $record['IO_STATECHANGEID'];
			$VR_DATATINYSTRING->IO_STATE = $record['IO_STATE'];
			$VR_DATATINYSTRING->IOTYPE_PK = $record['IOTYPE_PK'];
			$VR_DATATINYSTRING->IOTYPE_NAME = $record['IOTYPE_NAME'];
			$VR_DATATINYSTRING->IOTYPE_ENUM = $record['IOTYPE_ENUM'];
			$VR_DATATINYSTRING->RSCAT_PK = $record['RSCAT_PK'];
			$VR_DATATINYSTRING->RSCAT_NAME = $record['RSCAT_NAME'];
			$VR_DATATINYSTRING->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VR_DATATINYSTRING->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VR_DATATINYSTRING->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VR_DATATINYSTRING->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VR_DATATINYSTRING->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VR_DATATINYSTRING->RSTYPE_PK = $record['RSTYPE_PK'];
			$VR_DATATINYSTRING->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VR_DATATINYSTRING->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VR_DATATINYSTRING->UOMCAT_PK = $record['UOMCAT_PK'];
			$VR_DATATINYSTRING->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VR_DATATINYSTRING->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VR_DATATINYSTRING->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VR_DATATINYSTRING->UOM_PK = $record['UOM_PK'];
			$VR_DATATINYSTRING->UOM_NAME = $record['UOM_NAME'];
			$VR_DATATINYSTRING->UOM_RATE = $record['UOM_RATE'];
			return $VR_DATATINYSTRING;
		}
		
		/**
		 * Serialize the sql row into DataShortString object
		 * 
		 * @param array $record each row of DataShortString
		 * @return Object
		 */
		private function _serializeVR_DATASHORTSTRING($record) {
			$VR_DATASHORTSTRING = new VR_DATASHORTSTRING();
			$VR_DATASHORTSTRING->CALCEDVALUE				= $record['CALCEDVALUE'];
			$VR_DATASHORTSTRING->UTS						= $record['UTS'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_PK			= $record['DATASHORTSTRING_PK'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_DATE		= $record['DATASHORTSTRING_DATE'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_VALUE		= $record['DATASHORTSTRING_VALUE'];
			$VR_DATASHORTSTRING->DATATYPE_PK				= $record['DATATYPE_PK'];
			$VR_DATASHORTSTRING->DATATYPE_NAME				= $record['DATATYPE_NAME'];
			$VR_DATASHORTSTRING->USERS_PK					= $record['USERS_PK'];
			//$VR_DATASHORTSTRING->USERS_USERNAME				= $record['USERS_USERNAME'];
			//$VR_DATASHORTSTRING->PREMISE_PK					= $record['PREMISE_PK'];
			//$VR_DATASHORTSTRING->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_DATASHORTSTRING->PERMROOMS_READ				= $record['PERMROOMS_READ'];
			$VR_DATASHORTSTRING->PERMROOMS_WRITE			= $record['PERMROOMS_WRITE'];
			$VR_DATASHORTSTRING->PERMROOMS_STATETOGGLE		= $record['PERMROOMS_STATETOGGLE'];
			$VR_DATASHORTSTRING->PERMROOMS_DATAREAD			= $record['PERMROOMS_DATAREAD'];
			//$VR_DATASHORTSTRING->HUB_PK						= $record['HUB_PK'];
			//$VR_DATASHORTSTRING->HUB_NAME					= $record['HUB_NAME'];
			//$VR_DATASHORTSTRING->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			//$VR_DATASHORTSTRING->HUBTYPE_NAME				= $record['HUBTYPE_NAME'];
			$VR_DATASHORTSTRING->LINK_PK					= $record['LINK_PK'];
			$VR_DATASHORTSTRING->LINK_SERIALCODE = $record['LINK_SERIALCODE'];
			$VR_DATASHORTSTRING->LINK_NAME = $record['LINK_NAME'];
			$VR_DATASHORTSTRING->LINK_CONNECTED = $record['LINK_CONNECTED'];
			$VR_DATASHORTSTRING->LINK_STATE = $record['LINK_STATE'];
			$VR_DATASHORTSTRING->LINK_STATECHANGECODE = $record['LINK_STATECHANGECODE'];
			$VR_DATASHORTSTRING->LINKTYPE_PK = $record['LINKTYPE_PK'];
			$VR_DATASHORTSTRING->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			$VR_DATASHORTSTRING->THING_PK = $record['THING_PK'];
			$VR_DATASHORTSTRING->THING_HWID = $record['THING_HWID'];
			$VR_DATASHORTSTRING->THING_OUTPUTHWID = $record['THING_OUTPUTHWID'];
			$VR_DATASHORTSTRING->THING_STATE = $record['THING_STATE'];
			$VR_DATASHORTSTRING->THING_STATECHANGEID = $record['THING_STATECHANGEID'];
			$VR_DATASHORTSTRING->THING_NAME = $record['THING_NAME'];
			$VR_DATASHORTSTRING->THINGTYPE_PK = $record['THINGTYPE_PK'];
			$VR_DATASHORTSTRING->THINGTYPE_NAME = $record['THINGTYPE_NAME'];
			$VR_DATASHORTSTRING->IO_BASECONVERT = $record['IO_BASECONVERT'];
			$VR_DATASHORTSTRING->IO_PK = $record['IO_PK'];
			$VR_DATASHORTSTRING->IO_NAME = $record['IO_NAME'];
			$VR_DATASHORTSTRING->IO_SAMPLERATELIMIT = $record['IO_SAMPLERATELIMIT'];
			$VR_DATASHORTSTRING->IO_SAMPLERATEMAX = $record['IO_SAMPLERATEMAX'];
			$VR_DATASHORTSTRING->IO_SAMPLERATECURRENT = $record['IO_SAMPLERATECURRENT'];
			$VR_DATASHORTSTRING->IO_STATECHANGEID = $record['IO_STATECHANGEID'];
			$VR_DATASHORTSTRING->IO_STATE = $record['IO_STATE'];
			$VR_DATASHORTSTRING->IOTYPE_PK = $record['IOTYPE_PK'];
			$VR_DATASHORTSTRING->IOTYPE_NAME = $record['IOTYPE_NAME'];
			$VR_DATASHORTSTRING->IOTYPE_ENUM = $record['IOTYPE_ENUM'];
			$VR_DATASHORTSTRING->RSCAT_PK = $record['RSCAT_PK'];
			$VR_DATASHORTSTRING->RSCAT_NAME = $record['RSCAT_NAME'];
			$VR_DATASHORTSTRING->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VR_DATASHORTSTRING->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VR_DATASHORTSTRING->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VR_DATASHORTSTRING->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VR_DATASHORTSTRING->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VR_DATASHORTSTRING->RSTYPE_PK = $record['RSTYPE_PK'];
			$VR_DATASHORTSTRING->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VR_DATASHORTSTRING->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VR_DATASHORTSTRING->UOMCAT_PK = $record['UOMCAT_PK'];
			$VR_DATASHORTSTRING->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VR_DATASHORTSTRING->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VR_DATASHORTSTRING->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VR_DATASHORTSTRING->UOM_PK = $record['UOM_PK'];
			$VR_DATASHORTSTRING->UOM_NAME = $record['UOM_NAME'];
			$VR_DATASHORTSTRING->UOM_RATE = $record['UOM_RATE'];

			return $VR_DATASHORTSTRING;
		}
		
		/**
		 * Serialize the sql row into DataMedString object
		 * 
		 * @param array $record each row of DataMedString
		 * @return Object
		 */
		private function _serializeVR_DATAMEDSTRING($record) {
			$VR_DATAMEDSTRING = new VR_DATAMEDSTRING();
			$VR_DATAMEDSTRING->CALCEDVALUE				= $record['CALCEDVALUE'];
			$VR_DATAMEDSTRING->UTS						= $record['UTS'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_PK			= $record['DATAMEDSTRING_PK'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_DATE		= $record['DATAMEDSTRING_DATE'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_VALUE		= $record['DATAMEDSTRING_VALUE'];
			$VR_DATAMEDSTRING->DATATYPE_PK				= $record['DATATYPE_PK'];
			$VR_DATAMEDSTRING->DATATYPE_NAME			= $record['DATATYPE_NAME'];
			$VR_DATAMEDSTRING->USERS_PK					= $record['USERS_PK'];
			//$VR_DATAMEDSTRING->USERS_USERNAME			= $record['USERS_USERNAME'];
			//$VR_DATAMEDSTRING->PREMISE_PK				= $record['PREMISE_PK'];
			//$VR_DATAMEDSTRING->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_DATAMEDSTRING->PERMROOMS_READ			= $record['PERMROOMS_READ'];
			$VR_DATAMEDSTRING->PERMROOMS_WRITE			= $record['PERMROOMS_WRITE'];
			$VR_DATAMEDSTRING->PERMROOMS_STATETOGGLE	= $record['PERMROOMS_STATETOGGLE'];
			$VR_DATAMEDSTRING->PERMROOMS_DATAREAD		= $record['PERMROOMS_DATAREAD'];
			//$VR_DATAMEDSTRING->HUB_PK					= $record['HUB_PK'];
			//$VR_DATAMEDSTRING->HUB_NAME					= $record['HUB_NAME'];
			//$VR_DATAMEDSTRING->HUBTYPE_PK				= $record['HUBTYPE_PK'];
			//$VR_DATAMEDSTRING->HUBTYPE_NAME				= $record['HUBTYPE_NAME'];
			$VR_DATAMEDSTRING->LINK_PK = $record['LINK_PK'];
			$VR_DATAMEDSTRING->LINK_SERIALCODE = $record['LINK_SERIALCODE'];
			$VR_DATAMEDSTRING->LINK_NAME = $record['LINK_NAME'];
			$VR_DATAMEDSTRING->LINK_CONNECTED = $record['LINK_CONNECTED'];
			$VR_DATAMEDSTRING->LINK_STATE = $record['LINK_STATE'];
			$VR_DATAMEDSTRING->LINK_STATECHANGECODE = $record['LINK_STATECHANGECODE'];
			$VR_DATAMEDSTRING->LINKTYPE_PK = $record['LINKTYPE_PK'];
			$VR_DATAMEDSTRING->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			$VR_DATAMEDSTRING->THING_PK = $record['THING_PK'];
			$VR_DATAMEDSTRING->THING_HWID = $record['THING_HWID'];
			$VR_DATAMEDSTRING->THING_OUTPUTHWID = $record['THING_OUTPUTHWID'];
			$VR_DATAMEDSTRING->THING_STATE = $record['THING_STATE'];
			$VR_DATAMEDSTRING->THING_STATECHANGEID = $record['THING_STATECHANGEID'];
			$VR_DATAMEDSTRING->THING_NAME = $record['THING_NAME'];
			$VR_DATAMEDSTRING->THINGTYPE_PK = $record['THINGTYPE_PK'];
			$VR_DATAMEDSTRING->THINGTYPE_NAME = $record['THINGTYPE_NAME'];
			$VR_DATAMEDSTRING->IO_BASECONVERT = $record['IO_BASECONVERT'];
			$VR_DATAMEDSTRING->IO_PK = $record['IO_PK'];
			$VR_DATAMEDSTRING->IO_NAME = $record['IO_NAME'];
			$VR_DATAMEDSTRING->IO_SAMPLERATELIMIT = $record['IO_SAMPLERATELIMIT'];
			$VR_DATAMEDSTRING->IO_SAMPLERATEMAX = $record['IO_SAMPLERATEMAX'];
			$VR_DATAMEDSTRING->IO_SAMPLERATECURRENT = $record['IO_SAMPLERATECURRENT'];
			$VR_DATAMEDSTRING->IO_STATECHANGEID = $record['IO_STATECHANGEID'];
			$VR_DATAMEDSTRING->IO_STATE = $record['IO_STATE'];
			$VR_DATAMEDSTRING->IOTYPE_PK = $record['IOTYPE_PK'];
			$VR_DATAMEDSTRING->IOTYPE_NAME = $record['IOTYPE_NAME'];
			$VR_DATAMEDSTRING->IOTYPE_ENUM = $record['IOTYPE_ENUM'];
			$VR_DATAMEDSTRING->RSCAT_PK = $record['RSCAT_PK'];
			$VR_DATAMEDSTRING->RSCAT_NAME = $record['RSCAT_NAME'];
			$VR_DATAMEDSTRING->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VR_DATAMEDSTRING->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VR_DATAMEDSTRING->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VR_DATAMEDSTRING->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VR_DATAMEDSTRING->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VR_DATAMEDSTRING->RSTYPE_PK = $record['RSTYPE_PK'];
			$VR_DATAMEDSTRING->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VR_DATAMEDSTRING->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VR_DATAMEDSTRING->UOMCAT_PK = $record['UOMCAT_PK'];
			$VR_DATAMEDSTRING->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VR_DATAMEDSTRING->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VR_DATAMEDSTRING->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VR_DATAMEDSTRING->UOM_PK = $record['UOM_PK'];
			$VR_DATAMEDSTRING->UOM_NAME = $record['UOM_NAME'];
			$VR_DATAMEDSTRING->UOM_RATE = $record['UOM_RATE'];
			return $VR_DATAMEDSTRING;
		}
		
		
		/**
		 * Serialize the sql row into PremiseLog object
		 * 
		 * @param array $record each row of PremiseLog
		 * @return Object
		 */
		private function _serializeVR_USERSPREMISELOG($record) {
			$VR_USERSPREMISELOG = new VR_USERSPREMISELOG();
			$VR_USERSPREMISELOG->PERMPREMISE_READ			= $record['PERMPREMISE_READ'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_NAME		= $record['PREMISELOGACTION_NAME'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_DESC		= $record['PREMISELOGACTION_DESC'];
			$VR_USERSPREMISELOG->PREMISELOG_USERS_FK		= $record['PREMISELOG_USERS_FK'];
			$VR_USERSPREMISELOG->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSPREMISELOG->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_USERSPREMISELOG->PREMISE_DESCRIPTION		= $record['PREMISE_DESCRIPTION'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_PK		= $record['PREMISELOGACTION_PK'];
			$VR_USERSPREMISELOG->PREMISELOG_PK				= $record['PREMISELOG_PK'];
			$VR_USERSPREMISELOG->PREMISELOG_UTS				= $record['PREMISELOG_UTS'];
			$VR_USERSPREMISELOG->PREMISELOG_CUSTOM1			= $record['PREMISELOG_CUSTOM1'];
			$VR_USERSPREMISELOG->USERSINFO_DISPLAYNAME		= $record['USERSINFO_DISPLAYNAME'];
			return $VR_USERSPREMISELOG;
		}
		
		
		/**
		 * Serialize the sql row into Gateway object
		 * 
		 * @param array $record each row of PremiseLog
		 * @return Object
		 */
		private function _serializeVR_USERSCOMM($record) {
			$VR_USERSCOMM = new VR_USERSCOMM();
			$VR_USERSCOMM->USERS_PK					= $record['USERS_PK'];
			//$VR_USERSCOMM->USERS_USERNAME			= $record['USERS_USERNAME'];
			$VR_USERSCOMM->PERMPREMISE_OWNER		= $record['PERMPREMISE_OWNER'];
			$VR_USERSCOMM->PERMPREMISE_WRITE		= $record['PERMPREMISE_WRITE'];
			$VR_USERSCOMM->PERMPREMISE_STATETOGGLE	= $record['PERMPREMISE_STATETOGGLE'];
			$VR_USERSCOMM->PERMPREMISE_READ			= $record['PERMPREMISE_READ'];
			$VR_USERSCOMM->PREMISE_PK				= $record['PREMISE_PK'];
			$VR_USERSCOMM->PREMISE_NAME				= $record['PREMISE_NAME'];
			$VR_USERSCOMM->PREMISE_DESCRIPTION		= $record['PREMISE_DESCRIPTION'];
			$VR_USERSCOMM->COMM_PK					= $record['COMM_PK'];
			$VR_USERSCOMM->COMM_NAME				= $record['COMM_NAME'];
			$VR_USERSCOMM->COMM_JOINMODE			= $record['COMM_JOINMODE'];
			$VR_USERSCOMM->COMM_ADDRESS				= $record['COMM_ADDRESS'];
			$VR_USERSCOMM->COMMTYPE_PK				= $record['COMMTYPE_PK'];
			$VR_USERSCOMM->COMMTYPE_NAME			= $record['COMMTYPE_NAME'];
			$VR_USERSCOMM->HUB_PK					= $record['HUB_PK'];
			$VR_USERSCOMM->HUB_NAME					= $record['HUB_NAME'];
			$VR_USERSCOMM->HUB_SERIALNUMBER			= $record['HUB_SERIALNUMBER'];
			$VR_USERSCOMM->HUB_IPADDRESS			= $record['HUB_IPADDRESS'];
			$VR_USERSCOMM->HUBTYPE_PK				= $record['HUBTYPE_PK'];
			$VR_USERSCOMM->HUBTYPE_NAME				= $record['HUBTYPE_NAME'];
			return $VR_USERSCOMM;
		}
		
		
		/**
		 * Serialize the sql row into RSCAT object
		 * 
		 * @param array $record each row of RSCAT
		 * 
		 * @return Object
		 */
		private function _serializeVP_PREMISETYPES($record)
		{
			$VP_PREMISETYPES = new VP_PREMISETYPES();
			$VP_PREMISETYPES->PREMISETYPE_PK		= $record['PREMISETYPE_PK'];
			$VP_PREMISETYPES->PREMISETYPE_NAME		= $record['PREMISETYPE_NAME'];

			return $VP_PREMISETYPES;
		}
		
		
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_PREMISEOCCUPANTS($record)
		{
			$VP_PREMISEOCCUPANTS = new VP_PREMISEOCCUPANTS();
			$VP_PREMISEOCCUPANTS->PREMISEOCCUPANTS_PK		= $record['PREMISEOCCUPANTS_PK'];
			$VP_PREMISEOCCUPANTS->PREMISEOCCUPANTS_NAME		= $record['PREMISEOCCUPANTS_NAME'];

			return $VP_PREMISEOCCUPANTS;
		}
		
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_PREMISEBEDROOMS($record)
		{
			$VP_PREMISEBEDROOMS = new VP_PREMISEBEDROOMS();
			$VP_PREMISEBEDROOMS->PREMISEBEDROOMS_PK					= $record['PREMISEBEDROOMS_PK'];
			$VP_PREMISEBEDROOMS->PREMISEBEDROOMS_COUNT					= $record['PREMISEBEDROOMS_COUNT'];

			return $VP_PREMISEBEDROOMS;
		}


		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_PREMISEFLOORS($record)
		{
			$VP_PREMISEFLOORS = new VP_PREMISEFLOORS();
			$VP_PREMISEFLOORS->PREMISEFLOORS_PK					= $record['PREMISEFLOORS_PK'];
			$VP_PREMISEFLOORS->PREMISEFLOORS_NAME				= $record['PREMISEFLOORS_NAME'];

			return $VP_PREMISEFLOORS;
		}
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_PREMISEROOMS($record)
		{
			$VP_PREMISEROOMS = new VP_PREMISEROOMS();
			$VP_PREMISEROOMS->PREMISEROOMS_PK					= $record['PREMISEROOMS_PK'];
			$VP_PREMISEROOMS->PREMISEROOMS_NAME					= $record['PREMISEROOMS_NAME'];

			return $VP_PREMISEROOMS;
		}
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_POSTCODES($record)
		{
			$VP_POSTCODES = new VP_POSTCODES();
			$VP_POSTCODES->POSTCODE_PK							= $record['POSTCODE_PK'];
			$VP_POSTCODES->POSTCODE_NAME						= $record['POSTCODE_NAME'];
			$VP_POSTCODES->STATEPROVINCE_PK = $record['STATEPROVINCE_PK'];
			$VP_POSTCODES->STATEPROVINCE_SHORTNAME = $record['STATEPROVINCE_SHORTNAME'];
			$VP_POSTCODES->STATEPROVINCE_NAME = $record['STATEPROVINCE_NAME'];
			$VP_POSTCODES->COUNTRIES_PK = $record['COUNTRIES_PK'];
			$VP_POSTCODES->COUNTRIES_NAME = $record['COUNTRIES_NAME'];
			$VP_POSTCODES->COUNTRIES_ABREVIATION = $record['COUNTRIES_ABREVIATION'];
			$VP_POSTCODES->TIMEZONE_PK = $record['TIMEZONE_PK'];
			$VP_POSTCODES->TIMEZONE_CC = $record['TIMEZONE_CC'];
			$VP_POSTCODES->TIMEZONE_LATITUDE = $record['TIMEZONE_LATITUDE'];
			$VP_POSTCODES->TIMEZONE_LONGITUDE = $record['TIMEZONE_LONGITUDE'];
			$VP_POSTCODES->TIMEZONE_TZ = $record['TIMEZONE_TZ'];

			return $VP_POSTCODES;
		}
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_TIMEZONES($record)
		{
			$VP_TIMEZONES = new VP_TIMEZONES();
			$VP_TIMEZONES->TIMEZONE_PK = $record['TIMEZONE_PK'];
			$VP_TIMEZONES->TIMEZONE_CC = $record['TIMEZONE_CC'];
			$VP_TIMEZONES->TIMEZONE_LATITUDE = $record['TIMEZONE_LATITUDE'];
			$VP_TIMEZONES->TIMEZONE_LONGITUDE = $record['TIMEZONE_LONGITUDE'];
			$VP_TIMEZONES->TIMEZONE_TZ = $record['TIMEZONE_TZ'];

			return $VP_TIMEZONES;
		}
		
		/**
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_STATEPROVINCE($record)
		{
			$VP_STATEPROVINCE = new VP_STATEPROVINCE();
			$VP_STATEPROVINCE->STATEPROVINCE_PK = $record['STATEPROVINCE_PK'];
			$VP_STATEPROVINCE->STATEPROVINCE_SHORTNAME = $record['STATEPROVINCE_SHORTNAME'];
			$VP_STATEPROVINCE->STATEPROVINCE_NAME = $record['STATEPROVINCE_NAME'];
			$VP_STATEPROVINCE->COUNTRIES_PK = $record['COUNTRIES_PK'];
			$VP_STATEPROVINCE->COUNTRIES_NAME = $record['COUNTRIES_NAME'];
			$VP_STATEPROVINCE->COUNTRIES_ABREVIATION = $record['COUNTRIES_ABREVIATION'];

			return $VP_STATEPROVINCE;
		}
		
		
		
		/**
		 * 3.110 - COUNTRIES
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_COUNTRIES($record) {
			$VP_COUNTRIES = new VP_COUNTRIES();
			$VP_COUNTRIES->COUNTRIES_PK						= $record['COUNTRIES_PK'];
			$VP_COUNTRIES->COUNTRIES_NAME					= $record['COUNTRIES_NAME'];
			$VP_COUNTRIES->COUNTRIES_ABREVIATION			= $record['COUNTRIES_ABREVIATION'];
			return $VP_COUNTRIES;
		}
		
		
		
		
		/**
		 * 3.111 - CURRENCIES
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		
		private function _serializeVP_CURRENCIES($record) {
			$VP_CURRENCIES = new VP_CURRENCIES();
			$VP_CURRENCIES->CURRENCIES_PK					= $record['CURRENCIES_PK'];
			$VP_CURRENCIES->CURRENCIES_NAME					= $record['CURRENCIES_NAME'];
			$VP_CURRENCIES->CURRENCIES_ABREVIATION			= $record['CURRENCIES_ABREVIATION'];
			$VP_CURRENCIES->COUNTRIES_PK					= $record['COUNTRIES_PK'];
			$VP_CURRENCIES->COUNTRIES_NAME				= $record['COUNTRIES_NAME'];
			$VP_CURRENCIES->COUNTRIES_ABREVIATION			= $record['COUNTRIES_ABREVIATION'];
			return $VP_CURRENCIES;
		}
		
		/**
		/* 3.112 - LANGUAGES
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_LANGUAGES($record)
		{
			$VP_LANGUAGES = new VP_LANGUAGES();
			$VP_LANGUAGES->LANGUAGE_PK = $record['LANGUAGE_PK'];
			$VP_LANGUAGES->LANGUAGE_NAME = $record['LANGUAGE_NAME'];
			$VP_LANGUAGES->LANGUAGE_LANGUAGE = $record['LANGUAGE_LANGUAGE'];
			$VP_LANGUAGES->LANGUAGE_VARIANT = $record['LANGUAGE_VARIANT'];
			$VP_LANGUAGES->LANGUAGE_ENCODING = $record['LANGUAGE_ENCODING'];
			$VP_LANGUAGES->COUNTRIES_PK = $record['COUNTRIES_PK'];
			$VP_LANGUAGES->COUNTRIES_NAME = $record['COUNTRIES_NAME'];
			$VP_LANGUAGES->COUNTRIES_ABREVIATION = $record['COUNTRIES_ABREVIATION'];

			return $VP_LANGUAGES;
		}
		
		/**
		 * 3.113 -
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_RSCAT($record)
		{
			$VP_RSCAT = new VP_RSCAT();
			$VP_RSCAT->RSCAT_PK					= $record['RSCAT_PK'];
			$VP_RSCAT->RSCAT_NAME				= $record['RSCAT_NAME'];
			$VP_RSCAT->RSCAT_FORMUTILITY		= $record['RSCAT_FORMUTILITY'];

			return $VP_RSCAT;
		}
		
		/**
		 * 3.114 - 
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_RSSUBCAT($record)
		{
			$VP_RSSUBCAT = new VP_RSSUBCAT();
			$VP_RSSUBCAT->RSSUBCAT_PK			= $record['RSSUBCAT_PK'];
			$VP_RSSUBCAT->RSSUBCAT_RSCAT_FK		= $record['RSSUBCAT_RSCAT_FK'];
			$VP_RSSUBCAT->RSSUBCAT_NAME			= $record['RSSUBCAT_NAME'];
			$VP_RSSUBCAT->RSSUBCAT_TYPE			= $record['RSSUBCAT_TYPE'];

			return $VP_RSSUBCAT;
		}
		
		
		
		/* 3.115 -
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_RSTARIFF($record)
		{
			$VP_RSTARIFF = new VP_RSTARIFF();
			$VP_RSTARIFF->RSTARIFF_NAME			= $record['RSTARIFF_NAME'];
			$VP_RSTARIFF->RSTARIFF_PK			= $record['RSTARIFF_PK'];
			$VP_RSTARIFF->RSCAT_PK				= $record['RSCAT_PK'];
			$VP_RSTARIFF->RSCAT_NAME			= $record['RSCAT_NAME'];
			$VP_RSTARIFF->RSSUBCAT_NAME			= $record['RSSUBCAT_NAME'];
			$VP_RSTARIFF->RSSUBCAT_TYPE			= $record['RSSUBCAT_TYPE'];
			$VP_RSTARIFF->RSSUBCAT_PK			= $record['RSSUBCAT_PK'];

			return $VP_RSTARIFF;
		}
		
		
		
		/* 3.116 - 
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_RSTYPES($record)
		{
			$VP_RSTYPES = new VP_RSTYPES();
			$VP_RSTYPES->RSSUBCAT_PK = $record['RSSUBCAT_PK'];
			$VP_RSTYPES->RSSUBCAT_NAME = $record['RSSUBCAT_NAME'];
			$VP_RSTYPES->RSSUBCAT_TYPE = $record['RSSUBCAT_TYPE'];
			$VP_RSTYPES->RSTARIFF_PK = $record['RSTARIFF_PK'];
			$VP_RSTYPES->RSTARIFF_NAME = $record['RSTARIFF_NAME'];
			$VP_RSTYPES->RSTYPE_PK = $record['RSTYPE_PK'];
			$VP_RSTYPES->RSTYPE_NAME = $record['RSTYPE_NAME'];
			$VP_RSTYPES->RSTYPE_MAIN = $record['RSTYPE_MAIN'];
			$VP_RSTYPES->RSCAT_PK = $record['RSCAT_PK'];
			$VP_RSTYPES->RSCAT_NAME = $record['RSCAT_NAME'];

			return $VP_RSTYPES;
		}
		
		
		
		/* 3.117 -
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_UOMS($record)
		{
			$VP_UOMS = new VP_UOMS();
			$VP_UOMS->UOMCAT_PK = $record['UOMCAT_PK'];
			$VP_UOMS->UOMCAT_NAME = $record['UOMCAT_NAME'];
			$VP_UOMS->UOMSUBCAT_PK = $record['UOMSUBCAT_PK'];
			$VP_UOMS->UOMSUBCAT_NAME = $record['UOMSUBCAT_NAME'];
			$VP_UOMS->UOM_PK = $record['UOM_PK'];
			$VP_UOMS->UOM_NAME = $record['UOM_NAME'];

			return $VP_UOMS;
		}
		
		
		/* 3.118 - 
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_ICONS($record)
		{
			$VP_ICONS = new VP_ICONS();
			$VP_ICONS->ICONS_PK = $record['ICONS_PK'];
			$VP_ICONS->ICONS_NAME = $record['ICONS_NAME'];
			$VP_ICONS->ICONS_ICON = $record['ICONS_ICON'];
			$VP_ICONS->ICONSTYPE_NAME = $record['ICONSTYPE_NAME'];
			$VP_ICONS->ICONSTYPE_PK = $record['ICONSTYPE_PK'];

			return $VP_ICONS;
		}
		
		
		/* 3.119 - 
		 * Serialize the sql row into USERSGENDER object
		 * @param array $record each row of USERSGENDER 
		 * @return Object
		 */
		private function _serializeVP_USERSGENDER($record)
		{
			$VP_USERSGENDER = new VP_USERSGENDER();
			$VP_USERSGENDER->USERSGENDER_PK = $record['USERSGENDER_PK'];
			$VP_USERSGENDER->USERSGENDER_NAME = $record['USERSGENDER_NAME'];

			return $VP_USERSGENDER;
		}
		
		
		/* 3.120 - 
		 * Serialize the sql row into ROOMTYPE object
		 * @param array $record each row of ROOMTYPE 
		 * @return Object
		 */
		private function _serializeVP_ROOMTYPE($record)
		{
			$VP_ROOMTYPE = new VP_ROOMTYPE();
			$VP_ROOMTYPE->ROOMTYPE_PK = $record['ROOMTYPE_PK'];
			$VP_ROOMTYPE->ROOMTYPE_NAME = $record['ROOMTYPE_NAME'];
			$VP_ROOMTYPE->ROOMTYPE_OUTDOORS = $record['ROOMTYPE_OUTDOORS'];

			return $VP_ROOMTYPE;
		}
		
		
		/* 3.121 - 
		 * Serialize the sql row into LINKTYPE object
		 * @param array $record each row of LINKTYPE 
		 * @return Object
		 */
		private function _serializeVP_LINKTYPE($record)
		{
			$VP_LINKTYPE = new VP_LINKTYPE();
			$VP_LINKTYPE->LINKTYPE_PK = $record['LINKTYPE_PK'];
			$VP_LINKTYPE->LINKTYPE_NAME = $record['LINKTYPE_NAME'];
			
			return $VP_LINKTYPE;
		}
	
	
	
		/**
		* The destructor
		* NOTE: Because PDO is used connection closing isn't really able be to speed up
		*/
		public function __destruct()
		{
			if ($this->_connectionHandle) {
				$this->_connectionHandle = null;
			}
		}
	
		public function getExpressionProvider()
		{
			if (is_null($this->_expressionProvider)) {
				$this->_expressionProvider = new MainDSExpressionProvider();
			}
	
			return $this->_expressionProvider;
		}
	}

?>
