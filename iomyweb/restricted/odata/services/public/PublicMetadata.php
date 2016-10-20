<?php

/** 
 * Implementation of IDataServiceMetadataProvider.
 * 
 * PHP version 5.3
 * 
 * @category  Service
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   SVN: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 * 
 */


//====================================================//
//== Table of Contents								==//
//====================================================//
//------------------------------------------------//
//-- 3.1  - PREMISETYPES						--//
//-- 3.2  - PREMISEBUILDINGTYPES				--//
//-- 3.3  - PREMISEOCCUPANTS					--//
//-- 3.4  - PREMISEBEDROOMS						--//
//-- 3.5  - PREMISEFLOORS						--//
//-- 3.6  - PREMISEROOMS						--//
//-- 3.7  - POSTCODES							--//
//-- 3.8  - TIMEZONES							--//
//-- 3.9  - STATEPROVINCE						--//
//-- 3.10 - COUNTRIES							--//
//-- 3.11 - CURRENCIES							--//
//-- 3.12 - LANGUAGES							--//
//-- 3.13 - RSCAT								--//
//-- 3.14 - RSSUBCAT							--//
//-- 3.15 - RSTARIFF							--//
//-- 3.16 - RSTYPES								--//
//-- 3.17 - UOMS								--//
//-- 3.18 - ICONS								--//
//-- 3.19 - GENDER								--//
//-- 3.20 - ROOMTYPE							--//
//-- 3.21 - LINKTYPE							--//
//------------------------------------------------//
//-- 4.0  - METADATA DECLARATION				--//
//-- 4.1  - PREMISETYPES						--//
//-- 4.2  - PREMISEBUILDINGTYPES				--//
//-- 4.3  - PREMISEOCCUPANTS					--//
//-- 4.4  - PREMISEBEDROOMS						--//
//-- 4.5  - PREMISEFLOORS						--//
//-- 4.6  - PREMISEROOMS						--//
//-- 4.7  - POSTCODES							--//
//-- 4.8  - TIMEZONES							--//
//-- 4.9  - STATEPROVINCE						--//
//-- 4.10 - COUNTRIES							--//
//-- 4.11 - CURRENCIES							--//
//-- 4.12 - LANGUAGES							--//
//-- 4.13 - RSCAT								--//
//-- 4.14 - RSSUBCAT							--//
//-- 4.15 - RSTARIFF							--//
//-- 4.16 - RSTYPES								--//
//-- 4.17 - UOMS								--//
//-- 4.18 - ICONS								--//
//-- 4.19 - GENDER								--//
//-- 4.20 - ROOMTYPE							--//
//-- 4.21 - LINKTYPE							--//
//------------------------------------------------//


use ODataProducer\Providers\Metadata\ResourceStreamInfo;
use ODataProducer\Providers\Metadata\ResourceAssociationSetEnd;
use ODataProducer\Providers\Metadata\ResourceAssociationSet;
use ODataProducer\Common\NotImplementedException;
use ODataProducer\Providers\Metadata\Type\EdmPrimitiveType;
use ODataProducer\Providers\Metadata\ResourceSet;
use ODataProducer\Providers\Metadata\ResourcePropertyKind;
use ODataProducer\Providers\Metadata\ResourceProperty;
use ODataProducer\Providers\Metadata\ResourceTypeKind;
use ODataProducer\Providers\Metadata\ResourceType;
use ODataProducer\Common\InvalidOperationException;
use ODataProducer\Providers\Metadata\IDataServiceMetadataProvider;
require_once 'ODataProducer/Providers/Metadata/IDataServiceMetadataProvider.php';
use ODataProducer\Providers\Metadata\ServiceBaseMetadata;
//Begin Resource Classes


//================================================================================================================================//
//== 3.0  - CLASS DECLARATIONS																									==//
//================================================================================================================================//

/**
 * 3.1 - VP_PREMISETYPES entity type.
 * 
 * @category  Service
 * @package   Service_PremisetypesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_PREMISETYPES{
	public $PREMISETYPE_PK;
	public $PREMISETYPE_NAME;
}


/**
 * 3.2 - VP_PREMISEBUILDINGTYPES entity type.
 * 
 * @category  Service
 * @package   Service_PremisebuildingtypesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
//class VP_PREMISEBUILDINGTYPES{
//	public $BUILDINGTYPES_PK;
//	public $BUILDINGTYPES_NAME_ZH;
//	public $BUILDINGTYPES_NAME_EN;
//	public $PREMISETYPE_PK;
//	public $PREMISETYPE_NAME;
//}

/**
 * 3.3 - VP_PREMISEOCCUPANTS entity type.
 * 
 * @category  Service
 * @package   Service_PremiseoccupantsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_PREMISEOCCUPANTS{
	public $PREMISEOCCUPANTS_PK;
	public $PREMISEOCCUPANTS_NAME;
}

/**
 * 3.4 - VP_PREMISEBEDROOMS entity type.
 * 
 * @category  Service
 * @package   Service_PremisebedroomsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_PREMISEBEDROOMS{
	public $PREMISEBEDROOMS_PK;
	public $PREMISEBEDROOMS_COUNT;
}


/**
 * 3.5 - VP_PREMISEFLOORS entity type.
 * 
 * @category  Service
 * @package   Service_PremisefloorsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_PREMISEFLOORS{
	public $PREMISEFLOORS_PK;
	public $PREMISEFLOORS_NAME;
}


/**
 * 3.6 - VP_PREMISEROOMS entity type.
 * 
 * @category  Service
 * @package   Service_PremiseroomsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_PREMISEROOMS{
	public $PREMISEROOMS_PK;
	public $PREMISEROOMS_NAME;
}


/**
 * 3.7 - VP_POSTCODES entity type.
 * 
 * @category  Service
 * @package   Service_PostcodesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_POSTCODES{
	public $POSTCODE_PK;
	public $POSTCODE_NAME;
	public $STATEPROVINCE_PK;
	public $STATEPROVINCE_SHORTNAME;
	public $STATEPROVINCE_NAME;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
	public $TIMEZONE_PK;
	public $TIMEZONE_CC;
	public $TIMEZONE_LATITUDE;
	public $TIMEZONE_LONGITUDE;
	public $TIMEZONE_TZ;
}

/**
 * 3.8 - VP_TIMEZONES entity type.
 * 
 * @category  Service
 * @package   Service_TimezoneView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_TIMEZONES{
	public $TIMEZONE_PK;
	public $TIMEZONE_CC;
	public $TIMEZONE_LATITUDE;
	public $TIMEZONE_LONGITUDE;
	public $TIMEZONE_TZ;
}

/**
 * 3.9 - VP_STATEPROVINCE entity type.
 * 
 * @category  Service
 * @package   Service_StateprovinceView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_STATEPROVINCE{
	public $STATEPROVINCE_PK;
	public $STATEPROVINCE_SHORTNAME;
	public $STATEPROVINCE_NAME;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
}


/**
 * 3.10 - VP_COUNTRIES entity type.
 * 
 * @category  Service
 * @package   Service_CountriesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_COUNTRIES{
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
}


/**
 * 3.11 - VP_CURRENCIES entity type.
 * 
 * @category  Service
 * @package   Service_CurrenciesView
 * @author    Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link      http://odataphpproducer.codeplex.com
 */
 
class VP_CURRENCIES{
	public $CURRENCIES_PK;
	public $CURRENCIES_NAME;
	public $CURRENCIES_ABREVIATION;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
}

/**
 * 3.12 - VP_LANGUAGES entity type.
 * 
 * @category  Service
 * @package   Service_LanguagesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_LANGUAGES{
	public $LANGUAGE_PK;
	public $LANGUAGE_NAME;
	public $LANGUAGE_LANGUAGE;
	public $LANGUAGE_VARIANT;
	public $LANGUAGE_ENCODING;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
}


/**
 * 3.13 - VP_RSCAT entity type.
 * 
 * @category  Service
 * @package   Service_RscatView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_RSCAT{
	public $RSCAT_PK;
	public $RSCAT_NAME;
	public $RSCAT_FORMUTILITY;
}

/**
 * 3.14 - VP_RSSUBCAT entity type.
 * 
 * @category  Service
 * @package   Service_RssubcatView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_RSSUBCAT{
	public $RSCAT_PK;
	public $RSCAT_NAME;
	public $RSSUBCAT_PK;
	public $RSSUBCAT_RSCAT_FK;
	public $RSSUBCAT_NAME;
	public $RSSUBCAT_TYPE;
}

/**
 * 3.15 - VP_RSTARIFF entity type.
 * 
 * @category  Service
 * @package   Service_RstariffView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_RSTARIFF{
	public $RSCAT_PK;
	public $RSCAT_NAME;
	public $RSTARIFF_NAME;
	public $RSTARIFF_PK;
	public $RSSUBCAT_NAME;
	public $RSSUBCAT_TYPE;
	public $RSSUBCAT_PK;
}

/**
 * 3.16 - VP_RSTYPES entity type.
 * 
 * @category  Service
 * @package   Service_RstypesView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_RSTYPES{
	public $RSCAT_PK;
	public $RSCAT_NAME;
	public $RSSUBCAT_PK;
	public $RSSUBCAT_NAME;
	public $RSSUBCAT_TYPE;
	public $RSTARIFF_PK;
	public $RSTARIFF_NAME;
	public $RSTYPE_PK;
	public $RSTYPE_NAME;
	public $RSTYPE_MAIN;

}


/**
 * 3.17 - VP_UOMS entity type.
 * 
 * @category  Service
 * @package   Service_UomsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_UOMS{
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
}


/**
 * 3.18 - VP_ICONS entity type.
 * 
 * @category  Service
 * @package   Service_IconsView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_ICONS{
	public $ICONS_PK;
	public $ICONS_NAME;
	public $ICONS_ICON;
	public $ICONSTYPE_NAME;
	public $ICONSTYPE_PK;
}


/**
 * 3.19 - VP_USERSGENDER entity type.
 * 
 * @category  Service
 * @package   Service_UsersgenderView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_USERSGENDER{
	public $USERSGENDER_PK;
	public $USERSGENDER_NAME;
}


/**
 * 3.20 - VP_ROOMTYPE entity type.
 * 
 * @category  Service
 * @package   Service_RoomtypeView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_ROOMTYPE{
	public $ROOMTYPE_PK;
	public $ROOMTYPE_NAME;
	public $ROOMTYPE_OUTDOORS;
	
}


/**
 * 3.21 - VP_LINKTYPE entity type.
 * 
 * @category  Service
 * @package   Service_RoomtypeView
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class VP_LINKTYPE{
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	
}



/**
 * Create Public metadata.
 * 
 * @category  Service
 * @package   Service_Public
 * @author	Yash K. Kothari <odataphpproducer_alias@microsoft.com>
 * @copyright 2011 Microsoft Corp. (http://www.microsoft.com)
 * @license   New BSD license, (http://www.opensource.org/licenses/bsd-license.php)
 * @version   Release: 1.0
 * @link	  http://odataphpproducer.codeplex.com
 */
class CreatePublicMetadata
{
	/**
	 * create metadata
	 * 
	 * @return PublicMetadata
	 */
	public static function create() {
		$metadata = new ServiceBaseMetadata('PublicEntities',	'Public');
		
		//------------------------------------------------------------//
		//-- 4.1 - PREMISE TYPES									--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISETYPES'
		$VP_PREMISETYPESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISETYPES'), 'VP_PREMISETYPES', 'Public'
		);
		$metadata->addKeyProperty(			$VP_PREMISETYPESEntityType,		'PREMISETYPE_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_PREMISETYPESEntityType,		'PREMISETYPE_NAME',			EdmPrimitiveType::CHARARRAY		);
			
		$VP_PREMISETYPESsResourceSet = $metadata->addResourceSet(
			'VP_PREMISETYPES', $VP_PREMISETYPESEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.2 - PREMISE BUILDING TYPES							--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEBUILDINGTYPES'
//		$VP_PREMISEBUILDINGTYPESEntityType = $metadata->addEntityType(
//			new ReflectionClass('VP_PREMISEBUILDINGTYPES'), 'VP_PREMISEBUILDINGTYPES', 'Public'
//		);
//		$metadata->addKeyProperty(			$VP_PREMISEBUILDINGTYPESEntityType,		'BUILDINGTYPES_PK',			EdmPrimitiveType::INT32			);
//		$metadata->addPrimitiveProperty(	$VP_PREMISEBUILDINGTYPESEntityType,		'BUILDINGTYPES_NAME',	EdmPrimitiveType::CHARARRAY		);
//		$metadata->addPrimitiveProperty(	$VP_PREMISEBUILDINGTYPESEntityType,		'PREMISETYPE_PK',			EdmPrimitiveType::INT32			);
//		$metadata->addPrimitiveProperty(	$VP_PREMISEBUILDINGTYPESEntityType,		'PREMISETYPE_NAME',			EdmPrimitiveType::CHARARRAY		);
//			
//		$VP_PREMISEBUILDINGTYPESsResourceSet = $metadata->addResourceSet(
//			'VP_PREMISEBUILDINGTYPES', $VP_PREMISEBUILDINGTYPESEntityType
//		);
		
		
		//------------------------------------------------------------//
		//-- 4.3 - PREMISE OCCUPANTS								--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEOCCUPANTS'
		$VP_PREMISEOCCUPANTSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEOCCUPANTS'), 'VP_PREMISEOCCUPANTS', 'Public'
		);
		$metadata->addKeyProperty(			$VP_PREMISEOCCUPANTSEntityType,			'PREMISEOCCUPANTS_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_PREMISEOCCUPANTSEntityType,			'PREMISEOCCUPANTS_NAME',			EdmPrimitiveType::CHARARRAY		);
			
		$VP_PREMISEOCCUPANTSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEOCCUPANTS', $VP_PREMISEOCCUPANTSEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.4 - PREMISE BEDROOMS									--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEBEDROOMS'
		$VP_PREMISEBEDROOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEBEDROOMS'), 'VP_PREMISEBEDROOMS', 'Public'
		);
		$metadata->addKeyProperty(			$VP_PREMISEBEDROOMSEntityType,			'PREMISEBEDROOMS_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_PREMISEBEDROOMSEntityType,			'PREMISEBEDROOMS_COUNT',			EdmPrimitiveType::CHARARRAY		);
			
		$VP_PREMISEBEDROOMSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEBEDROOMS', $VP_PREMISEBEDROOMSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.5 - PREMISE BEDROOMS									--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEFLOORS'
		$VP_PREMISEFLOORSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEFLOORS'), 'VP_PREMISEFLOORS', 'Public'
		);
		$metadata->addKeyProperty(			$VP_PREMISEFLOORSEntityType,			'PREMISEFLOORS_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_PREMISEFLOORSEntityType,			'PREMISEFLOORS_NAME',		EdmPrimitiveType::CHARARRAY		);
			
		$VP_PREMISEFLOORSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEFLOORS', $VP_PREMISEFLOORSEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.6 - PREMISE ROOMS									--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEROOMS'
		$VP_PREMISEROOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEROOMS'), 'VP_PREMISEROOMS', 'Public'
		);
		$metadata->addKeyProperty(			$VP_PREMISEROOMSEntityType,				'PREMISEROOMS_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_PREMISEROOMSEntityType,				'PREMISEROOMS_NAME',		EdmPrimitiveType::CHARARRAY		);
			
		$VP_PREMISEROOMSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEROOMS', $VP_PREMISEROOMSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.7 - POSTCODES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_POSTCODES'
		$VP_POSTCODESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_POSTCODES'), 'VP_POSTCODES', 'Public'
		);
		$metadata->addKeyProperty(			$VP_POSTCODESEntityType,				'POSTCODE_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'POSTCODE_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'STATEPROVINCE_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'STATEPROVINCE_SHORTNAME',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'STATEPROVINCE_NAME',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'COUNTRIES_NAME',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'COUNTRIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'TIMEZONE_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'TIMEZONE_CC',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'TIMEZONE_LATITUDE',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'TIMEZONE_LONGITUDE',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_POSTCODESEntityType,				'TIMEZONE_TZ',				EdmPrimitiveType::CHARARRAY		);
			
		$VP_POSTCODESsResourceSet = $metadata->addResourceSet(
			'VP_POSTCODES', $VP_POSTCODESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.8 - TIMEZONES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_TIMEZONES'
		$VP_TIMEZONESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_TIMEZONES'), 'VP_TIMEZONES', 'Public'
		);
		$metadata->addKeyProperty(			$VP_TIMEZONESEntityType,				'TIMEZONE_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_TIMEZONESEntityType,				'TIMEZONE_CC',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_TIMEZONESEntityType,				'TIMEZONE_LATITUDE',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_TIMEZONESEntityType,				'TIMEZONE_LONGITUDE',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_TIMEZONESEntityType,				'TIMEZONE_TZ',				EdmPrimitiveType::CHARARRAY		);
		
		$VP_TIMEZONESsResourceSet = $metadata->addResourceSet(
			'VP_TIMEZONES', $VP_TIMEZONESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.9 - STAEPROVINCE										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_STATEPROVINCE'
		$VP_STATEPROVINCEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_STATEPROVINCE'), 'VP_STATEPROVINCE', 'Public'
		);
		$metadata->addKeyProperty(			$VP_STATEPROVINCEEntityType,			'STATEPROVINCE_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_STATEPROVINCEEntityType,			'STATEPROVINCE_SHORTNAME',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_STATEPROVINCEEntityType,			'STATEPROVINCE_NAME',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_STATEPROVINCEEntityType,			'COUNTRIES_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_STATEPROVINCEEntityType,			'COUNTRIES_NAME',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_STATEPROVINCEEntityType,			'COUNTRIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
		
		$VP_STATEPROVINCEsResourceSet = $metadata->addResourceSet(
			'VP_STATEPROVINCE', $VP_STATEPROVINCEEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.10 - COUNTRIES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_COUNTRIES'
		$VP_COUNTRIESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_COUNTRIES'), 'VP_COUNTRIES', 'Public'
		);
		$metadata->addKeyProperty(			$VP_COUNTRIESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_COUNTRIESEntityType,				'COUNTRIES_NAME',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_COUNTRIESEntityType,				'COUNTRIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
			
		$VP_COUNTRIESsResourceSet = $metadata->addResourceSet(
			'VP_COUNTRIES', $VP_COUNTRIESEntityType
		);

		//------------------------------------------------------------//
		//-- 4.11 - CURRENCIES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_CURRENCIES'
		$VP_CURRENCIESEntityType = $metadata->addEntityType( new ReflectionClass('VP_CURRENCIES'), 'VP_CURRENCIES', 'Public');
		
		$metadata->addKeyProperty(			$VP_CURRENCIESEntityType,				'CURRENCIES_PK',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_CURRENCIESEntityType,				'CURRENCIES_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_CURRENCIESEntityType,				'CURRENCIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_CURRENCIESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_CURRENCIESEntityType,				'COUNTRIES_NAME',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_CURRENCIESEntityType,				'COUNTRIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
		
		$VP_CURRENCIESsResourceSet = $metadata->addResourceSet(
			'VP_CURRENCIES', $VP_CURRENCIESEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.12 - LANGUAGES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_LANGUAGES'
		$VP_LANGUAGESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_LANGUAGES'), 'VP_LANGUAGES', 'Public'
		);
		$metadata->addKeyProperty(			$VP_LANGUAGESEntityType,				'LANGUAGE_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'LANGUAGE_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'LANGUAGE_LANGUAGE',		EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'LANGUAGE_VARIANT',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'LANGUAGE_ENCODING',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'COUNTRIES_NAME',		EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_LANGUAGESEntityType,				'COUNTRIES_ABREVIATION',	EdmPrimitiveType::CHARARRAY		);
			
		$VP_LANGUAGESsResourceSet = $metadata->addResourceSet(
			'VP_LANGUAGES', $VP_LANGUAGESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.13 - RSCAT											--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSCAT'
		$VP_RSCATEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSCAT'), 'VP_RSCAT', 'Public'
		);
		$metadata->addKeyProperty(			$VP_RSCATEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSCATEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSCATEntityType,					'RSCAT_FORMUTILITY',		EdmPrimitiveType::INT16			);
			
		$VP_RSCATsResourceSet = $metadata->addResourceSet(
			'VP_RSCAT', $VP_RSCATEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.14 - RSSUBCAT										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSSUBCAT'
		$VP_RSSUBCATEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSSUBCAT'), 'VP_RSSUBCAT', 'Public'
		);
		$metadata->addPrimitiveProperty(	$VP_RSSUBCATEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSSUBCATEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addKeyProperty(			$VP_RSSUBCATEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSSUBCATEntityType,					'RSSUBCAT_RSCAT_FK',		EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSSUBCATEntityType,					'RSSUBCAT_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSSUBCATEntityType,					'RSSUBCAT_TYPE',			EdmPrimitiveType::INT32			);
			
		$VP_RSSUBCATsResourceSet = $metadata->addResourceSet(
			'VP_RSSUBCAT', $VP_RSSUBCATEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.15 - RSTARIFF										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSTARIFF'
		$VP_RSTARIFFEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSTARIFF'), 'VP_RSTARIFF', 'Public'
		);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSSUBCAT_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSSUBCAT_TYPE',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32			);
		$metadata->addKeyProperty(			$VP_RSTARIFFEntityType,					'RSTARIFF_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTARIFFEntityType,					'RSTARIFF_NAME',			EdmPrimitiveType::CHARARRAY		);
			
		$VP_RSTARIFFsResourceSet = $metadata->addResourceSet(
			'VP_RSTARIFF', $VP_RSTARIFFEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.16 - RS TYPES										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSTYPES'
		$VP_RSTYPESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSTYPES'), 'VP_RSTYPES', 'Public'
		);
		
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSSUBCAT_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSSUBCAT_TYPE',			EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSTARIFF_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSTARIFF_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addKeyProperty(			$VP_RSTYPESEntityType,					'RSTYPE_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_RSTYPESEntityType,					'RSTYPE_MAIN',				EdmPrimitiveType::INT16			);
			
		$VP_RSTYPESsResourceSet = $metadata->addResourceSet(
			'VP_RSTYPES', $VP_RSTYPESEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.17 - UNIT OF MEASUREMENT								--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_UOMS'
		$VP_UOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_UOMS'), 'VP_UOMS', 'Public'
		);
		$metadata->addPrimitiveProperty(	$VP_UOMSEntityType,						'UOMCAT_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_UOMSEntityType,						'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY		); 
		$metadata->addPrimitiveProperty(	$VP_UOMSEntityType,						'UOMSUBCAT_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_UOMSEntityType,						'UOMSUBCAT_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addKeyProperty(			$VP_UOMSEntityType,						'UOM_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_UOMSEntityType,						'UOM_NAME',					EdmPrimitiveType::CHARARRAY		);
		
		$VP_UOMSsResourceSet = $metadata->addResourceSet(
			'VP_UOMS', $VP_UOMSEntityType
		);
	
		
		//------------------------------------------------------------//
		//-- 4.18 - ICONS											--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_ICONS'
		$VP_ICONSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_ICONS'), 'VP_ICONS', 'Public'
		);
		$metadata->addKeyProperty(			$VP_ICONSEntityType,			'ICONS_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_ICONSEntityType,			'ICONS_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_ICONSEntityType,			'ICONS_ICON',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_ICONSEntityType,			'ICONSTYPE_NAME',			EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_ICONSEntityType,			'ICONSTYPE_PK',				EdmPrimitiveType::INT32			);
			
		$VP_ICONSsResourceSet = $metadata->addResourceSet(
			'VP_ICONS', $VP_ICONSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.19 - GENDER											--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_USERSGENDER'
		$VP_USERSGENDEREntityType = $metadata->addEntityType(
			new ReflectionClass('VP_USERSGENDER'), 'VP_USERSGENDER', 'Public'
		);
		$metadata->addKeyProperty(		$VP_USERSGENDEREntityType,			'USERSGENDER_PK',				EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_USERSGENDEREntityType,		'USERSGENDER_NAME',				EdmPrimitiveType::CHARARRAY		);
	
		$VP_USERSGENDERsResourceSet = $metadata->addResourceSet(
			'VP_USERSGENDER', $VP_USERSGENDEREntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.20 - ROOMTYPE										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_USERSGENDER'
		$VP_ROOMTYPEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_ROOMTYPE'), 'VP_ROOMTYPE', 'Public'
		);
		$metadata->addKeyProperty(		$VP_ROOMTYPEEntityType,			'ROOMTYPE_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_ROOMTYPEEntityType,		'ROOMTYPE_NAME',				EdmPrimitiveType::CHARARRAY		);
		$metadata->addPrimitiveProperty(	$VP_ROOMTYPEEntityType,		'ROOMTYPE_OUTDOORS',			EdmPrimitiveType::INT16		);
	
		$VP_ROOMTYPEsResourceSet = $metadata->addResourceSet(
			'VP_ROOMTYPE', $VP_ROOMTYPEEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.21 - LINKTYPE										--//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_LINKTYPE'
		$VP_LINKTYPEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_LINKTYPE'), 'VP_LINKTYPE', 'Public'
		);
		$metadata->addKeyProperty(		$VP_LINKTYPEEntityType,			'LINKTYPE_PK',					EdmPrimitiveType::INT32			);
		$metadata->addPrimitiveProperty(	$VP_LINKTYPEEntityType,		'LINKTYPE_NAME',				EdmPrimitiveType::CHARARRAY		);
	
		$VP_LINKTYPEsResourceSet = $metadata->addResourceSet(
			'VP_LINKTYPE', $VP_LINKTYPEEntityType
		);
		
			
		//------------------------------------------------------------//
		//-- RETURN THE METADATA									--//
		//------------------------------------------------------------//
		//Register the assoications (navigations)
		return $metadata;
	}
}
?>
