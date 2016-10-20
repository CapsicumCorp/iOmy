<?php
 

	/** 
	 * Implementation of IDataServiceQueryProvider.
	 * 
	 * PHP version 5.3
	 * 
	 * @category	Service
	 * @package		Public;
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
	require_once "PublicMetadata.php";
	require_once "ODataProducer/Providers/Query/IDataServiceQueryProvider2.php";
	



	/**
	 * PublicQueryProvider implemetation of IDataServiceQueryProvider2.
	 * @category	Service
	 * @package		Public;
	 * @author		MySQLConnector <odataphpproducer_alias@microsoft.com>
	 * @copyright	2011 Microsoft Corp. (http://www.microsoft.com)
	 * @license		New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
	 * @version		Release: 1.0
	 * @link		http://odataphpproducer.codeplex.com
	 */
	class PublicQueryProvider implements IDataServiceQueryProvider2 {
		/**
		 * Handle to connection to Database
		 */
		private $_connectionHandle = null;

		private $_expressionProvider = null;

		/**
		 * Constructs a new instance of PublicQueryProvider
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
		 *				 False If user is going to take care of orderby, skip
		 *				 and top options
		 */
		public function canApplyQueryOptions() {
			return true;
		}
		/**
		 * Gets collection of entities belongs to an entity set
		 * 
		 * @param ResourceSet $resourceSet The entity set whose entities needs to be fetched
		 * 
		 * @return array(Object)
		 */
		public function getResourceSet(ResourceSet $resourceSet, $filterOption = null, $select=null, $orderby=null, $top=null, $skip=null) {
			$aReturnResults = array();
			
			
			$sResourceSetName =  $resourceSet->getName();
			
			
			switch($sResourceSetName) {
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
//				case 'VP_PREMISEBUILDINGTYPES':
//					break;
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
					die('(PublicQueryProvider) Unknown resource set ' . $sResourceSetName);
				
			}
			
			$sSQL = "SELECT * FROM $sResourceSetName";
			
			if ($filterOption != null) {
				$sSQL .= ' WHERE ' . $filterOption;
			}
			
			
			
			//$stmt = mysql_query($query);
			//if ($stmt === false) {
			//	die(print_r(mysql_error(), true));
			//}
			//$returnResult = array();
			//switch ($resourceSetName) {
			//	case 'VR_USERSPREMISES':
			//		$returnResult = $this->_serializeVR_USERSPREMISESs($stmt);
			//		break;
			//	
			//}
			//mysql_free_result($stmt);
			
			$aSQLResult = $this->_connectionHandle->InputBindQuery($sSQL, array(), 0) ;
			
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
//						case 'VP_PREMISEBUILDINGTYPES':
//							$aReturnResults[] = $this->_serializeVP_PREMISEBUILDINGTYPES($aRow);
//							break;
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
		 * @param ResourceSet	$resourceSet   The entity set from which an entity needs to be fetched
		 * @param KeyDescriptor $keyDescriptor The key to identify the entity to be fetched
		 * @return Object/NULL Returns entity instance if found else null
		 */
		public function getResourceFromResourceSet(ResourceSet $resourceSet, KeyDescriptor $keyDescriptor) {
			$sResourceSetName =  $resourceSet->getName();

/*
			if($resourceSetName === 'VR_USERSPREMISESs') {
				$resourceSetName = 'VR_USERSPREMISES';
			}
*/
			if( $resourceSetName !== 'VR_USERSPREMISES' && $sResourceSetName!=='VR_USERSIO' && $sResourceSetName!=='VP_CURRENCIES' ) {
				die('(PublicQueryProvider) Unknown resource set ' . $resourceSetName);
			}
			
			$namedKeyValues = $keyDescriptor->getValidatedNamedValues();
			$condition = null;
			foreach ($namedKeyValues as $key => $value) {
				$condition .= $key . ' = ' . $value[0] . ' and ';
			}

			$len = strlen($condition);
			$condition = substr($condition, 0, $len - 5); 
			
/*
			$query = "SELECT * FROM $resourceSetName WHERE $condition";
			$stmt = mysql_query($query);
			if ($stmt === false) {
				die(print_r(mysql_error(), true));
			}

			//If resource not found return null to the library
			if (!mysql_num_rows($stmt)) {
				return null;
			}

			$result = null;
			while ( $record = mysql_fetch_array($stmt, MYSQL_ASSOC) ) {
				switch ($resourceSetName) {
					case 'VR_USERSPREMISES':
						$returnResult = $this->_serializeVR_USERSPREMISES($record);
						break;
				}
			}
			mysql_free_result($stmt);
*/
			$aReturnResults = array();
			
			
			$sSQL = "SELECT * FROM $resourceSetName WHERE $condition";
			
			$aSQLResult = $this->_connectionHandle->InputBindQuery($sSQL, array(), 0) ;
			
			//-- IF errors have occurred --//
			if( $aSQLResult["Error"]===true ) {
				//-- Check to return null if no rows --//
				if( $aSQLResult["ErrMesg"]==="No Rows Found! Code:0" ) {
					//-- No Rows found --//
					$result = null;
					
				} else {
					//-- TODO: Fix up this error message --//
					echo "Database Query Error!";
					echo $aSQLResult["ErrMesg"];
					die();
				}
				
			//-- ELSE No Errors have occurred --//
			} else {
				foreach( $aSQLResult["Data"] as $aRow ) {
					switch( $sResourceSetName ) {
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
//						case 'VP_PREMISEBUILDINGTYPES':
//							$aReturnResults[] = $this->_serializeVP_PREMISEBUILDINGTYPES($aRow);
//							break;
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
			
		
		/**
		 * 3.1 - 
		 * Serialize the sql row into RSCAT object
		 * 
		 * @param array $record each row of RSCAT
		 * 
		 * @return Object
		 */
		private function _serializeVP_PREMISETYPES($record)
		{
			$VP_PREMISETYPES = new VP_PREMISETYPES();
			$VP_PREMISETYPES->PREMISETYPE_PK					= $record['PREMISETYPE_PK'];
			$VP_PREMISETYPES->PREMISETYPE_NAME					= $record['PREMISETYPE_NAME'];

			return $VP_PREMISETYPES;
		}
		
		
		 
		/**
		 * 3.2 - 
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
//		private function _serializeVP_PREMISEBUILDINGTYPES($record)
//		{
//			$VP_PREMISEBUILDINGTYPES = new VP_PREMISEBUILDINGTYPES();
//			$VP_PREMISEBUILDINGTYPES->BUILDINGTYPES_PK			= $record['BUILDINGTYPES_PK'];
//			$VP_PREMISEBUILDINGTYPES->BUILDINGTYPES_NAME                    = $record['BUILDINGTYPES_NAME'];
//			$VP_PREMISEBUILDINGTYPES->PREMISETYPE_PK			= $record['PREMISETYPE_PK'];
//			$VP_PREMISEBUILDINGTYPES->PREMISETYPE_NAME			= $record['PREMISETYPE_NAME'];
//
//			return $VP_PREMISEBUILDINGTYPES;
//		}
		
		
		/**
		 * 3.3 - 
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_PREMISEOCCUPANTS($record)
		{
			$VP_PREMISEOCCUPANTS = new VP_PREMISEOCCUPANTS();
			$VP_PREMISEOCCUPANTS->PREMISEOCCUPANTS_PK					= $record['PREMISEOCCUPANTS_PK'];
			$VP_PREMISEOCCUPANTS->PREMISEOCCUPANTS_NAME					= $record['PREMISEOCCUPANTS_NAME'];

			return $VP_PREMISEOCCUPANTS;
		}
		
		
		/**
		 * 3.4 - 
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
		 * 3.5 - 
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
		 * 3.6 - 
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
		 * 3.7 - 
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
		 * 3.8 -
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
		 * 3.9 - 
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
		 * 3.10 - COUNTRIES
		 * Serialize the sql row into RSCAT object
		 * @param array $record each row of RSCAT
		 * @return Object
		 */
		private function _serializeVP_COUNTRIES($record) {
			$VP_COUNTRIES = new VP_COUNTRIES();
			$VP_COUNTRIES->COUNTRIES_PK						= $record['COUNTRIES_PK'];
			$VP_COUNTRIES->COUNTRIES_NAME				= $record['COUNTRIES_NAME'];
			$VP_COUNTRIES->COUNTRIES_ABREVIATION			= $record['COUNTRIES_ABREVIATION'];
			return $VP_COUNTRIES;
		}
		
		

		
		
		/**
		 * 3.11 - CURRENCIES
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
		/* 3.12 - LANGUAGES
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
		 * 3.13 -
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
		 * 3.14 - 
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
		
		
		
		/* 3.15 -
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
		
		
		
		/* 3.16 - 
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
		
		
		
		/* 3.17 -
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
		
		
		/* 3.18 - 
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
		
		
		/* 3.19 - 
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
		
		
		/* 3.20 - 
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
		
		
		/* 3.21 - 
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
		* NOTE: Because we are using PDO this isn't as important
		*/
		public function __destruct()
		{
			if ($this->_connectionHandle) {
				//-- Use PDO's Documentation's prefered way to close the connection --//
				$this->_connectionHandle = null;
			}
		}
	
		public function getExpressionProvider() {
			if (is_null($this->_expressionProvider)) {
				$this->_expressionProvider = new PublicDSExpressionProvider();
			}
			return $this->_expressionProvider;
		}
	}

?>
