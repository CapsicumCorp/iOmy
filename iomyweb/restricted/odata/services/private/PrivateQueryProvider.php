<?php
 

	/** 
	 * Implementation of IDataServiceQueryProvider.
	 * 
	 * PHP version 5.3
	 * 
	 * @category	Service
	 * @package		Private;
	 * @author		MySQLConnector <odataphpproducer_alias@microsoft.com>
	 * @copyright	2011 Microsoft Corp. (http://www.microsoft.com)
	 * @license		New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
	 * @version		SVN: 1.0
	 * @link		http://odataphpproducer.codeplex.com
	 */
	
	
	use ODataProducer\UriProcessor\ResourcePathProcessor\SegmentParser\KeyDescriptor;
	use ODataProducer\Providers\Metadata\ResourceSet;
	use ODataProducer\Providers\Metadata\ResourceProperty;
	use ODataProducer\Providers\Query\IDataServiceQueryProvider2;
	require_once "PrivateMetadata.php";
	require_once "ODataProducer/Providers/Query/IDataServiceQueryProvider2.php";



	/**
	 * PrivateQueryProvider implemetation of IDataServiceQueryProvider2.
	 * @category	Service
	 * @package		Private;
	 * @author		MySQLConnector <odataphpproducer_alias@microsoft.com>
	 * @copyright	2011 Microsoft Corp. (http://www.microsoft.com)
	 * @license		New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
	 * @version		Release: 1.0
	 * @link		http://odataphpproducer.codeplex.com
	 */
	class PrivateQueryProvider implements IDataServiceQueryProvider2 {
		/**
		 * Handle to connection to Database
		 */
		private $_connectionHandle = null;

		private $_expressionProvider = null;

		/**
		 * Constructs a new instance of PrivateQueryProvider
		 * 
		 */
		public function __construct() {
			global $oRestrictedDB;

			//-----------------------------//
			//-- NEW DATABASE CONNECTION --//
			//-----------------------------//
			require_once SITE_BASE.'/restricted/libraries/restrictedapicore.php';
			
			if( $aRestrictedApiCore['RestrictedDB']===false ) {
				echo "Access Denied to the Restricted Database!";
				die();
			}
			
			$this->_connectionHandle = $oRestrictedDB;
			
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

			//if( $sResourceSetName!=='VR_USERSPREMISES' && $sResourceSetName!=='VR_USERSLINK' ) {
			//	die('(PrivateQueryProvider) Unknown resource set ' . $sResourceSetName);
			//}
			
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
				default:
					die('(PrivateQueryProvider) Unknown resource set ' . $sResourceSetName);
				
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
					}
				}
			}
			return $aReturnResults;
			
		}


		/**
		 * Gets an entity instance from an entity set identifed by a key
		 * @param ResourceSet	$resourceSet   The entity set from which an entity needs to be fetched
		 * @param KeyDescriptor $keyDescriptor The key to identify the entity to be fetched
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
				default:
					die('(PrivateQueryProvider) Unknown resource set ' . $sResourceSetName);
				
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
			
			//if( $sResourceSetName==="VR_USERSPREMISES" ) {
			//	echo "Test2";
			//	var_dump($sSQL);
			//}
			
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
		 * @param ResourceSet			$sourceResourceSet		The entity set related to the entity to be fetched.
		 * @param object				$sourceEntityInstance	The related entity instance.entity needs to be fetched.
		 * @param ResourceProperty		$targetProperty			The metadata of the target  property.
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
			$key = rtrim($key, ' and ');
			if($srcClass === 'VR_USERSPREMISES' ) {
				
			}
			
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
			if($srcClass === 'VR_USERSPREMISES') {
				
			}
			
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
			if($srcClass==='VR_USERSPREMISES') {

			}
			return $result;
		}
			
		
		
		
		private function _serializeVR_USERSINFO($record)	{
		 	$VR_USERSINFO = new VR_USERSINFO();
			$VR_USERSINFO->USERS_PK							= $record['USERS_PK'];
			$VR_USERSINFO->USERS_STATE						= $record['USERS_STATE'];
			$VR_USERSINFO->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSINFO->USERADDRESS_PK					= $record['USERADDRESS_PK'];
			$VR_USERSINFO->USERADDRESS_LINE3				= $record['USERADDRESS_LINE3'];
			$VR_USERSINFO->USERADDRESS_LINE2				= $record['USERADDRESS_LINE2'];
			$VR_USERSINFO->USERADDRESS_LINE1				= $record['USERADDRESS_LINE1'];
			$VR_USERSINFO->USERADDRESS_POSTALLINE3			= $record['USERADDRESS_POSTALLINE3'];
			$VR_USERSINFO->USERADDRESS_POSTALLINE2			= $record['USERADDRESS_POSTALLINE2'];
			$VR_USERSINFO->USERADDRESS_POSTALLINE1			= $record['USERADDRESS_POSTALLINE1'];
			$VR_USERSINFO->COUNTRIES_PK						= $record['COUNTRIES_PK'];
			$VR_USERSINFO->COUNTRIES_NAME				= $record['COUNTRIES_NAME'];
			$VR_USERSINFO->COUNTRIES_ABREVIATION			= $record['COUNTRIES_ABREVIATION'];
			$VR_USERSINFO->LANGUAGE_PK						= $record['LANGUAGE_PK'];
			$VR_USERSINFO->LANGUAGE_NAME					= $record['LANGUAGE_NAME'];
			$VR_USERSINFO->LANGUAGE_LANGUAGE				= $record['LANGUAGE_LANGUAGE'];
			$VR_USERSINFO->LANGUAGE_VARIANT					= $record['LANGUAGE_VARIANT'];
			$VR_USERSINFO->LANGUAGE_ENCODING				= $record['LANGUAGE_ENCODING'];
			$VR_USERSINFO->POSTCODE_PK						= $record['POSTCODE_PK'];
			$VR_USERSINFO->POSTCODE_NAME					= $record['POSTCODE_NAME'];
			$VR_USERSINFO->STATEPROVINCE_PK					= $record['STATEPROVINCE_PK'];
			$VR_USERSINFO->STATEPROVINCE_SHORTNAME			= $record['STATEPROVINCE_SHORTNAME'];
			$VR_USERSINFO->STATEPROVINCE_NAME			= $record['STATEPROVINCE_NAME'];
			$VR_USERSINFO->TIMEZONE_PK						= $record['TIMEZONE_PK'];
			$VR_USERSINFO->TIMEZONE_CC						= $record['TIMEZONE_CC'];
			$VR_USERSINFO->TIMEZONE_LATITUDE				= $record['TIMEZONE_LATITUDE'];
			$VR_USERSINFO->TIMEZONE_LONGITUDE				= $record['TIMEZONE_LONGITUDE'];
			$VR_USERSINFO->TIMEZONE_TZ						= $record['TIMEZONE_TZ'];
			$VR_USERSINFO->USERSINFO_PK						= $record['USERSINFO_PK'];
			$VR_USERSINFO->USERSINFO_TITLE					= $record['USERSINFO_TITLE'];
			$VR_USERSINFO->USERSINFO_GIVENNAMES				= $record['USERSINFO_GIVENNAMES'];
			$VR_USERSINFO->USERSINFO_SURNAMES				= $record['USERSINFO_SURNAMES'];
			$VR_USERSINFO->USERSINFO_DISPLAYNAME			= $record['USERSINFO_DISPLAYNAME'];
			$VR_USERSINFO->USERSINFO_EMAIL					= $record['USERSINFO_EMAIL'];
			$VR_USERSINFO->USERSINFO_PHONENUMBER			= $record['USERSINFO_PHONENUMBER'];
			$VR_USERSINFO->USERSINFO_DOB					= $record['USERSINFO_DOB'];
			$VR_USERSINFO->USERSGENDER_PK					= $record['USERSGENDER_PK'];
			$VR_USERSINFO->USERSGENDER_NAME					= $record['USERSGENDER_NAME'];
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
			$VR_USERSPREMISES->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSPREMISES->PERMISSIONS_OWNER			= $record['PERMISSIONS_OWNER'];
			$VR_USERSPREMISES->PERMISSIONS_WRITE			= $record['PERMISSIONS_WRITE'];
			$VR_USERSPREMISES->PERMISSIONS_STATETOGGLE		= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSPREMISES->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
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
			$VR_USERSPREMISELOCATIONS->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSPREMISELOCATIONS->PERMISSIONS_OWNER			= $record['PERMISSIONS_OWNER'];
			$VR_USERSPREMISELOCATIONS->PERMISSIONS_WRITE			= $record['PERMISSIONS_WRITE'];
			$VR_USERSPREMISELOCATIONS->PERMISSIONS_STATETOGGLE		= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSPREMISELOCATIONS->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
			$VR_USERSPREMISELOCATIONS->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSPREMISELOCATIONS->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSPREMISELOCATIONS->PREMISE_DESCRIPTION			= $record['PREMISE_DESCRIPTION'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_PK			= $record['PREMISEADDRESS_PK'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE1         	= $record['PREMISEADDRESS_LINE1'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE2 		= $record['PREMISEADDRESS_LINE2'];
			$VR_USERSPREMISELOCATIONS->PREMISEADDRESS_LINE3 		= $record['PREMISEADDRESS_LINE3'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_PK					= $record['LANGUAGE_PK'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_NAME				= $record['LANGUAGE_NAME'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_LANGUAGE			= $record['LANGUAGE_LANGUAGE'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_VARIANT				= $record['LANGUAGE_VARIANT'];
			$VR_USERSPREMISELOCATIONS->LANGUAGE_ENCODING			= $record['LANGUAGE_ENCODING'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_PK					= $record['COUNTRIES_PK'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_NAME			= $record['COUNTRIES_NAME'];
			$VR_USERSPREMISELOCATIONS->COUNTRIES_ABREVIATION		= $record['COUNTRIES_ABREVIATION'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_PK				= $record['STATEPROVINCE_PK'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_SHORTNAME		= $record['STATEPROVINCE_SHORTNAME'];
			$VR_USERSPREMISELOCATIONS->STATEPROVINCE_NAME		= $record['STATEPROVINCE_NAME'];
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
			$VR_USERSHUB->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSHUB->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_USERSHUB->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_USERSHUB->PERMISSIONS_STATETOGGLE			= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSHUB->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
			$VR_USERSHUB->PREMISE_PK						= $record['PREMISE_PK'];
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
			$VR_USERSROOMS->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_USERSROOMS->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_USERSROOMS->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_USERSROOMS->PERMISSIONS_STATETOGGLE			= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSROOMS->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
			$VR_USERSROOMS->PREMISE_PK						= $record['PREMISE_PK'];
			$VR_USERSROOMS->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSROOMS->ROOMS_PK						= $record['ROOMS_PK'];
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
			$VR_USERSLINK->USERS_USERNAME						= $record['USERS_USERNAME'];
			$VR_USERSLINK->PERMISSIONS_OWNER					= $record['PERMISSIONS_OWNER'];
			$VR_USERSLINK->PERMISSIONS_WRITE					= $record['PERMISSIONS_WRITE'];
			$VR_USERSLINK->PERMISSIONS_STATETOGGLE			= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSLINK->PERMISSIONS_READ					= $record['PERMISSIONS_READ'];
			$VR_USERSLINK->PREMISE_PK							= $record['PREMISE_PK'];
			$VR_USERSLINK->PREMISE_NAME						= $record['PREMISE_NAME'];
			$VR_USERSLINK->HUB_PK								= $record['HUB_PK'];
			$VR_USERSLINK->HUB_NAME							= $record['HUB_NAME'];
			$VR_USERSLINK->HUBTYPE_PK							= $record['HUBTYPE_PK'];
			$VR_USERSLINK->HUBTYPE_NAME						= $record['HUBTYPE_NAME'];
			$VR_USERSLINK->LINK_PK								= $record['LINK_PK'];
			$VR_USERSLINK->LINK_SERIALCODE						= $record['LINK_SERIALCODE'];
			$VR_USERSLINK->LINK_NAME							= $record['LINK_NAME'];
			$VR_USERSLINK->LINK_CONNECTED						= $record['LINK_CONNECTED'];
			$VR_USERSLINK->LINK_STATE							= $record['LINK_STATE'];
			$VR_USERSLINK->LINK_STATECHANGECODE					= $record['LINK_STATECHANGECODE'];
			$VR_USERSLINK->LINK_ROOMS_FK						= $record['LINK_ROOMS_FK'];
			$VR_USERSLINK->LINKTYPE_PK						= $record['LINKTYPE_PK'];
			$VR_USERSLINK->LINKTYPE_NAME						= $record['LINKTYPE_NAME'];
			$VR_USERSLINK->LINKINFO_PK						= $record['LINKINFO_PK'];
			$VR_USERSLINK->LINKINFO_NAME						= $record['LINKINFO_NAME'];
			$VR_USERSLINK->LINKINFO_MANUFACTURER				= $record['LINKINFO_MANUFACTURER'];
			$VR_USERSLINK->LINKINFO_MANUFACTURERURL			= $record['LINKINFO_MANUFACTURERURL'];
			$VR_USERSLINK->LINKCONN_PK						= $record['LINKCONN_PK'];
			$VR_USERSLINK->LINKCONN_NAME						= $record['LINKCONN_NAME'];
			$VR_USERSLINK->LINKCONN_ADDRESS						= $record['LINKCONN_ADDRESS'];
			$VR_USERSLINK->LINKCONN_USERNAME					= $record['LINKCONN_USERNAME'];
			$VR_USERSLINK->LINKCONN_PASSWORD					= $record['LINKCONN_PASSWORD'];
			$VR_USERSLINK->LINKCONN_PORT						= $record['LINKCONN_PORT'];
			$VR_USERSLINK->LINKPROTOCOL_NAME					= $record['LINKPROTOCOL_NAME'];
			$VR_USERSLINK->LINKCRYPTTYPE_NAME					= $record['LINKCRYPTTYPE_NAME'];
			$VR_USERSLINK->LINKFREQ_NAME						= $record['LINKFREQ_NAME'];
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
			$VR_USERSTHING->USERS_USERNAME				= $record['USERS_USERNAME'];
			$VR_USERSTHING->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_USERSTHING->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_USERSTHING->PERMISSIONS_STATETOGGLE		= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSTHING->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
//			$VR_USERSTHING->PERMISSIONS_PK				= $record['PERMISSIONS_PK'];
			$VR_USERSTHING->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSTHING->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSTHING->HUB_PK						= $record['HUB_PK'];
			$VR_USERSTHING->HUB_NAME						= $record['HUB_NAME'];
			$VR_USERSTHING->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			$VR_USERSTHING->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_USERSTHING->LINK_PK							= $record['LINK_PK'];
			$VR_USERSTHING->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_USERSTHING->LINK_NAME						= $record['LINK_NAME'];
			$VR_USERSTHING->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_USERSTHING->LINK_STATE						= $record['LINK_STATE'];
			$VR_USERSTHING->LINK_STATECHANGECODE			= $record['LINK_STATECHANGECODE'];
			$VR_USERSTHING->LINK_ROOMS_FK					= $record['LINK_ROOMS_FK'];
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
			$VR_USERSIO->USERS_USERNAME				= $record['USERS_USERNAME'];
//			$VR_USERSIO->PERMISSIONS_PK				= $record['PERMISSIONS_PK'];
			$VR_USERSIO->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_USERSIO->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_USERSIO->PERMISSIONS_STATETOGGLE		= $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSIO->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
			$VR_USERSIO->PREMISE_PK					= $record['PREMISE_PK'];
			$VR_USERSIO->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_USERSIO->HUB_PK						= $record['HUB_PK'];
			$VR_USERSIO->HUB_NAME						= $record['HUB_NAME'];
			$VR_USERSIO->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			$VR_USERSIO->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_USERSIO->LINK_PK							= $record['LINK_PK'];
			$VR_USERSIO->LINK_ROOMS_FK					= $record['LINK_ROOMS_FK'];
			$VR_USERSIO->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_USERSIO->LINK_NAME						= $record['LINK_NAME'];
			$VR_USERSIO->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_USERSIO->LINK_STATE						= $record['LINK_STATE'];
			$VR_USERSIO->LINK_STATECHANGECODE			= $record['LINK_STATECHANGECODE'];
			$VR_USERSIO->LINKTYPE_NAME				= $record['LINKTYPE_NAME'];
			$VR_USERSIO->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_USERSIO->THING_PK					= $record['THING_PK'];
			$VR_USERSIO->THING_HWID					= $record['THING_HWID'];
			$VR_USERSIO->THING_OUTPUTHWID			= $record['THING_OUTPUTHWID'];
			$VR_USERSIO->THING_STATE					= $record['THING_STATE'];
			$VR_USERSIO->THING_STATECHANGEID			= $record['THING_STATECHANGEID'];
			$VR_USERSIO->THING_NAME					= $record['THING_NAME'];
			$VR_USERSIO->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_USERSIO->THINGTYPE_NAME				= $record['THINGTYPE_NAME'];
			$VR_USERSIO->IO_PK						= $record['IO_PK'];
			$VR_USERSIO->IO_BASECONVERT			= $record['IO_BASECONVERT'];
			$VR_USERSIO->IO_NAME					= $record['IO_NAME'];
			$VR_USERSIO->IO_SAMPLERATELIMIT		= $record['IO_SAMPLERATELIMIT'];
			$VR_USERSIO->IO_SAMPLERATEMAX			= $record['IO_SAMPLERATEMAX'];
			$VR_USERSIO->IO_SAMPLERATECURRENT		= $record['IO_SAMPLERATECURRENT'];
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
			$VR_DATATINYINT->DATATYPE_PK = $record['DATATYPE_PK'];
			$VR_DATATINYINT->DATATYPE_NAME = $record['DATATYPE_NAME'];
			$VR_DATATINYINT->USERS_PK = $record['USERS_PK'];
			$VR_DATATINYINT->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_DATATINYINT->PREMISE_PK = $record['PREMISE_PK'];
			$VR_DATATINYINT->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_DATATINYINT->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_DATATINYINT->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_DATATINYINT->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_DATATINYINT->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATATINYINT->HUB_PK = $record['HUB_PK'];
			$VR_DATATINYINT->HUB_NAME = $record['HUB_NAME'];
			$VR_DATATINYINT->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_DATATINYINT->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
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
			$VR_DATAINT->DATAINT_PK = $record['DATAINT_PK'];
			$VR_DATAINT->DATAINT_DATE = $record['DATAINT_DATE'];
			$VR_DATAINT->DATAINT_VALUE = $record['DATAINT_VALUE'];
			$VR_DATAINT->DATATYPE_PK = $record['DATATYPE_PK'];
			$VR_DATAINT->DATATYPE_NAME = $record['DATATYPE_NAME'];
			$VR_DATAINT->USERS_PK = $record['USERS_PK'];
			$VR_DATAINT->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_DATAINT->PREMISE_PK = $record['PREMISE_PK'];
			$VR_DATAINT->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_DATAINT->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_DATAINT->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_DATAINT->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_DATAINT->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATAINT->HUB_PK = $record['HUB_PK'];
			$VR_DATAINT->HUB_NAME = $record['HUB_NAME'];
			$VR_DATAINT->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_DATAINT->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
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
			$VR_DATABIGINT->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_DATABIGINT->PREMISE_PK						= $record['PREMISE_PK'];
			$VR_DATABIGINT->PREMISE_NAME					= $record['PREMISE_NAME'];
			$VR_DATABIGINT->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_DATABIGINT->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_DATABIGINT->PERMISSIONS_READ				= $record['PERMISSIONS_READ'];
			$VR_DATABIGINT->PERMISSIONS_STATETOGGLE			= $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATABIGINT->HUB_PK						= $record['HUB_PK'];
			$VR_DATABIGINT->HUB_NAME						= $record['HUB_NAME'];
			$VR_DATABIGINT->HUBTYPE_PK					= $record['HUBTYPE_PK'];
			$VR_DATABIGINT->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_DATABIGINT->LINK_PK							= $record['LINK_PK'];
			$VR_DATABIGINT->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_DATABIGINT->LINK_NAME							= $record['LINK_NAME'];
			$VR_DATABIGINT->LINK_CONNECTED					= $record['LINK_CONNECTED'];
			$VR_DATABIGINT->LINK_STATE						= $record['LINK_STATE'];
			$VR_DATABIGINT->LINK_STATECHANGECODE				= $record['LINK_STATECHANGECODE'];
			$VR_DATABIGINT->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_DATABIGINT->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_DATABIGINT->THING_PK						= $record['THING_PK'];
			$VR_DATABIGINT->THING_HWID					= $record['THING_HWID'];
			$VR_DATABIGINT->THING_OUTPUTHWID				= $record['THING_OUTPUTHWID'];
			$VR_DATABIGINT->THING_STATE					= $record['THING_STATE'];
			$VR_DATABIGINT->THING_STATECHANGEID			= $record['THING_STATECHANGEID'];
			$VR_DATABIGINT->THING_NAME					= $record['THING_NAME'];
			$VR_DATABIGINT->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_DATABIGINT->THINGTYPE_NAME					= $record['THINGTYPE_NAME'];
			$VR_DATABIGINT->IO_BASECONVERT				= $record['IO_BASECONVERT'];
			$VR_DATABIGINT->IO_PK						= $record['IO_PK'];
			$VR_DATABIGINT->IO_NAME						= $record['IO_NAME'];
			$VR_DATABIGINT->IO_SAMPLERATELIMIT			= $record['IO_SAMPLERATELIMIT'];
			$VR_DATABIGINT->IO_SAMPLERATEMAX			= $record['IO_SAMPLERATEMAX'];
			$VR_DATABIGINT->IO_SAMPLERATECURRENT		= $record['IO_SAMPLERATECURRENT'];
			$VR_DATABIGINT->IO_STATECHANGEID			= $record['IO_STATECHANGEID'];
			$VR_DATABIGINT->IO_STATE					= $record['IO_STATE'];
			$VR_DATABIGINT->IOTYPE_PK					= $record['IOTYPE_PK'];
			$VR_DATABIGINT->IOTYPE_NAME					= $record['IOTYPE_NAME'];
			$VR_DATABIGINT->IOTYPE_ENUM					= $record['IOTYPE_ENUM'];
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
			$VR_DATAFLOAT->USERS_USERNAME					= $record['USERS_USERNAME'];
			$VR_DATAFLOAT->PREMISE_PK						= $record['PREMISE_PK'];
			$VR_DATAFLOAT->PREMISE_NAME						= $record['PREMISE_NAME'];
			$VR_DATAFLOAT->PERMISSIONS_OWNER				= $record['PERMISSIONS_OWNER'];
			$VR_DATAFLOAT->PERMISSIONS_WRITE				= $record['PERMISSIONS_WRITE'];
			$VR_DATAFLOAT->PERMISSIONS_READ					= $record['PERMISSIONS_READ'];
			$VR_DATAFLOAT->PERMISSIONS_STATETOGGLE			= $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATAFLOAT->HUB_PK							= $record['HUB_PK'];
			$VR_DATAFLOAT->HUB_NAME						= $record['HUB_NAME'];
			$VR_DATAFLOAT->HUBTYPE_PK						= $record['HUBTYPE_PK'];
			$VR_DATAFLOAT->HUBTYPE_NAME					= $record['HUBTYPE_NAME'];
			$VR_DATAFLOAT->LINK_PK							= $record['LINK_PK'];
			$VR_DATAFLOAT->LINK_SERIALCODE					= $record['LINK_SERIALCODE'];
			$VR_DATAFLOAT->LINK_NAME							= $record['LINK_NAME'];
			$VR_DATAFLOAT->LINK_CONNECTED						= $record['LINK_CONNECTED'];
			$VR_DATAFLOAT->LINK_STATE							= $record['LINK_STATE'];
			$VR_DATAFLOAT->LINK_STATECHANGECODE				= $record['LINK_STATECHANGECODE'];
			$VR_DATAFLOAT->LINKTYPE_PK					= $record['LINKTYPE_PK'];
			$VR_DATAFLOAT->LINKTYPE_NAME					= $record['LINKTYPE_NAME'];
			$VR_DATAFLOAT->THING_PK						= $record['THING_PK'];
			$VR_DATAFLOAT->THING_HWID						= $record['THING_HWID'];
			$VR_DATAFLOAT->THING_OUTPUTHWID				= $record['THING_OUTPUTHWID'];
			$VR_DATAFLOAT->THING_STATE					= $record['THING_STATE'];
			$VR_DATAFLOAT->THING_STATECHANGEID			= $record['THING_STATECHANGEID'];
			$VR_DATAFLOAT->THING_NAME						= $record['THING_NAME'];
			$VR_DATAFLOAT->THINGTYPE_PK					= $record['THINGTYPE_PK'];
			$VR_DATAFLOAT->THINGTYPE_NAME					= $record['THINGTYPE_NAME'];
			$VR_DATAFLOAT->IO_BASECONVERT				= $record['IO_BASECONVERT'];
			$VR_DATAFLOAT->IO_PK						= $record['IO_PK'];
			$VR_DATAFLOAT->IO_NAME						= $record['IO_NAME'];
			$VR_DATAFLOAT->IO_SAMPLERATELIMIT			= $record['IO_SAMPLERATELIMIT'];
			$VR_DATAFLOAT->IO_SAMPLERATEMAX				= $record['IO_SAMPLERATEMAX'];
			$VR_DATAFLOAT->IO_SAMPLERATECURRENT			= $record['IO_SAMPLERATECURRENT'];
			$VR_DATAFLOAT->IO_STATECHANGEID				= $record['IO_STATECHANGEID'];
			$VR_DATAFLOAT->IO_STATE						= $record['IO_STATE'];
			$VR_DATAFLOAT->IOTYPE_PK					= $record['IOTYPE_PK'];
			$VR_DATAFLOAT->IOTYPE_NAME					= $record['IOTYPE_NAME'];
			$VR_DATAFLOAT->IOTYPE_ENUM					= $record['IOTYPE_ENUM'];
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
			$VR_DATATINYSTRING->CALCEDVALUE = $record['CALCEDVALUE'];
			$VR_DATATINYSTRING->UTS = $record['UTS'];
			$VR_DATATINYSTRING->DATATINYSTRING_PK = $record['DATATINYSTRING_PK'];
			$VR_DATATINYSTRING->DATATINYSTRING_DATE = $record['DATATINYSTRING_DATE'];
			$VR_DATATINYSTRING->DATATINYSTRING_VALUE = $record['DATATINYSTRING_VALUE'];
			$VR_DATATINYSTRING->DATATYPE_PK = $record['DATATYPE_PK'];
			$VR_DATATINYSTRING->DATATYPE_NAME = $record['DATATYPE_NAME'];
			$VR_DATATINYSTRING->USERS_PK = $record['USERS_PK'];
			$VR_DATATINYSTRING->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_DATATINYSTRING->PREMISE_PK = $record['PREMISE_PK'];
			$VR_DATATINYSTRING->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_DATATINYSTRING->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_DATATINYSTRING->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_DATATINYSTRING->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_DATATINYSTRING->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATATINYSTRING->HUB_PK = $record['HUB_PK'];
			$VR_DATATINYSTRING->HUB_NAME = $record['HUB_NAME'];
			$VR_DATATINYSTRING->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_DATATINYSTRING->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
			$VR_DATATINYSTRING->LINK_PK = $record['LINK_PK'];
			$VR_DATATINYSTRING->LINK_SERIALCODE = $record['LINK_SERIALCODE'];
			$VR_DATATINYSTRING->LINK_NAME = $record['LINK_NAME'];
			$VR_DATATINYSTRING->LINK_CONNECTED = $record['LINK_CONNECTED'];
			$VR_DATATINYSTRING->LINK_STATE = $record['LINK_STATE'];
			$VR_DATATINYSTRING->LINK_STATECHANGECODE = $record['LINK_STATECHANGECODE'];
			$VR_DATATINYSTRING->LINKTYPE_PK = $record['LINKTYPE_PK'];
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
			$VR_DATASHORTSTRING->CALCEDVALUE = $record['CALCEDVALUE'];
			$VR_DATASHORTSTRING->UTS = $record['UTS'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_PK = $record['DATASHORTSTRING_PK'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_DATE = $record['DATASHORTSTRING_DATE'];
			$VR_DATASHORTSTRING->DATASHORTSTRING_VALUE = $record['DATASHORTSTRING_VALUE'];
			$VR_DATASHORTSTRING->DATATYPE_PK = $record['DATATYPE_PK'];
			$VR_DATASHORTSTRING->DATATYPE_NAME = $record['DATATYPE_NAME'];
			$VR_DATASHORTSTRING->USERS_PK = $record['USERS_PK'];
			$VR_DATASHORTSTRING->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_DATASHORTSTRING->PREMISE_PK = $record['PREMISE_PK'];
			$VR_DATASHORTSTRING->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_DATASHORTSTRING->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_DATASHORTSTRING->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_DATASHORTSTRING->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_DATASHORTSTRING->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATASHORTSTRING->HUB_PK = $record['HUB_PK'];
			$VR_DATASHORTSTRING->HUB_NAME = $record['HUB_NAME'];
			$VR_DATASHORTSTRING->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_DATASHORTSTRING->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
			$VR_DATASHORTSTRING->LINK_PK = $record['LINK_PK'];
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
			$VR_DATAMEDSTRING->CALCEDVALUE = $record['CALCEDVALUE'];
			$VR_DATAMEDSTRING->UTS = $record['UTS'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_PK = $record['DATAMEDSTRING_PK'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_DATE = $record['DATAMEDSTRING_DATE'];
			$VR_DATAMEDSTRING->DATAMEDSTRING_VALUE = $record['DATAMEDSTRING_VALUE'];
			$VR_DATAMEDSTRING->DATATYPE_PK = $record['DATATYPE_PK'];
			$VR_DATAMEDSTRING->DATATYPE_NAME = $record['DATATYPE_NAME'];
			$VR_DATAMEDSTRING->USERS_PK = $record['USERS_PK'];
			$VR_DATAMEDSTRING->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_DATAMEDSTRING->PREMISE_PK = $record['PREMISE_PK'];
			$VR_DATAMEDSTRING->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_DATAMEDSTRING->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_DATAMEDSTRING->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_DATAMEDSTRING->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_DATAMEDSTRING->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_DATAMEDSTRING->HUB_PK = $record['HUB_PK'];
			$VR_DATAMEDSTRING->HUB_NAME = $record['HUB_NAME'];
			$VR_DATAMEDSTRING->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_DATAMEDSTRING->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
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
			$VR_USERSPREMISELOG->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_NAME = $record['PREMISELOGACTION_NAME'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_DESC = $record['PREMISELOGACTION_DESC'];
			$VR_USERSPREMISELOG->PREMISELOG_USERS_FK = $record['PREMISELOG_USERS_FK'];
			$VR_USERSPREMISELOG->PREMISE_PK = $record['PREMISE_PK'];
			$VR_USERSPREMISELOG->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_USERSPREMISELOG->PREMISE_DESCRIPTION = $record['PREMISE_DESCRIPTION'];
			$VR_USERSPREMISELOG->PREMISELOGACTION_PK = $record['PREMISELOGACTION_PK'];
			$VR_USERSPREMISELOG->PREMISELOG_PK = $record['PREMISELOG_PK'];
			$VR_USERSPREMISELOG->PREMISELOG_UTS = $record['PREMISELOG_UTS'];
			$VR_USERSPREMISELOG->PREMISELOG_CUSTOM1 = $record['PREMISELOG_CUSTOM1'];
			$VR_USERSPREMISELOG->USERSINFO_DISPLAYNAME = $record['USERSINFO_DISPLAYNAME'];
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
			$VR_USERSCOMM->USERS_PK = $record['USERS_PK'];
			$VR_USERSCOMM->USERS_USERNAME = $record['USERS_USERNAME'];
			$VR_USERSCOMM->PERMISSIONS_OWNER = $record['PERMISSIONS_OWNER'];
			$VR_USERSCOMM->PERMISSIONS_WRITE = $record['PERMISSIONS_WRITE'];
			$VR_USERSCOMM->PERMISSIONS_STATETOGGLE = $record['PERMISSIONS_STATETOGGLE'];
			$VR_USERSCOMM->PERMISSIONS_READ = $record['PERMISSIONS_READ'];
			$VR_USERSCOMM->PREMISE_PK = $record['PREMISE_PK'];
			$VR_USERSCOMM->PREMISE_NAME = $record['PREMISE_NAME'];
			$VR_USERSCOMM->PREMISE_DESCRIPTION = $record['PREMISE_DESCRIPTION'];
			$VR_USERSCOMM->COMM_PK = $record['COMM_PK'];
			$VR_USERSCOMM->COMM_NAME = $record['COMM_NAME'];
			$VR_USERSCOMM->COMM_JOINMODE = $record['COMM_JOINMODE'];
			$VR_USERSCOMM->COMM_ADDRESS = $record['COMM_ADDRESS'];
			$VR_USERSCOMM->COMMTYPE_PK = $record['COMMTYPE_PK'];
			$VR_USERSCOMM->COMMTYPE_NAME = $record['COMMTYPE_NAME'];
			$VR_USERSCOMM->HUB_PK = $record['HUB_PK'];
			$VR_USERSCOMM->HUB_NAME = $record['HUB_NAME'];
			$VR_USERSCOMM->HUB_SERIALNUMBER = $record['HUB_SERIALNUMBER'];
			$VR_USERSCOMM->HUB_IPADDRESS = $record['HUB_IPADDRESS'];
			$VR_USERSCOMM->HUBTYPE_PK = $record['HUBTYPE_PK'];
			$VR_USERSCOMM->HUBTYPE_NAME = $record['HUBTYPE_NAME'];
			return $VR_USERSCOMM;
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
				$this->_expressionProvider = new PrivateDSExpressionProvider();
			}
	
			return $this->_expressionProvider;
		}
	}

?>
