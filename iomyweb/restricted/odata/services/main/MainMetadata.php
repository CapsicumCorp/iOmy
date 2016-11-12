<?php

/*
This file is part of iOmy.

iOmy is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

iOmy is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with iOmy.  If not, see <http://www.gnu.org/licenses/>.

*/


//====================================================//
//== Table of Contents                              ==//
//====================================================//
//------------------------------------------------//
//-- 3.0  - CLASS DECLARATIONS                  --//
//-- 3.1   - User Info                          --//
//-- 3.2   - Users Premises                     --//
//-- 3.3   - Premise Locations                  --//
//-- 3.4   - Users Hubs                         --//
//-- 3.5   - Users Rooms                        --//
//-- 3.6   - Users IO                           --//
//-- 3.7   - Users Thing                        --//
//-- 3.8   - Users Sensors                      --//
//-- 3.9   - Data TinyInt                       --//
//-- 3.10  - Data Int                           --//
//-- 3.11  - Data BigInt                        --//
//-- 3.12  - Data Float                         --//
//-- 3.13  - Data TinyString                    --//
//-- 3.14  - Data ShortString                   --//
//-- 3.15  - Data Medstring                     --//
//-- 3.16  - Users Premise Log                  --//
//-- 3.17  - Users Gateways                     --//
//-- 3.101 - PREMISETYPES                       --//
//-- 3.102 - PREMISEBUILDINGTYPES               --//
//-- 3.103 - PREMISEOCCUPANTS                   --//
//-- 3.104 - PREMISEBEDROOMS                    --//
//-- 3.105 - PREMISEFLOORS                      --//
//-- 3.106 - PREMISEROOMS                       --//
//-- 3.107 - POSTCODES                          --//
//-- 3.108 - TIMEZONES                          --//
//-- 3.109 - STATEPROVINCE                      --//
//-- 3.110 - COUNTRIES                          --//
//-- 3.111 - CURRENCIES                         --//
//-- 3.112 - LANGUAGES                          --//
//-- 3.113 - RSCAT                              --//
//-- 3.114 - RSSUBCAT                           --//
//-- 3.115 - RSTARIFF                           --//
//-- 3.116 - RSTYPES                            --//
//-- 3.117 - UOMS                               --//
//-- 3.118 - ICONS                              --//
//-- 3.119 - GENDER                             --//
//-- 3.120 - ROOMTYPE                           --//
//-- 3.121 - LINKTYPE                           --//
//------------------------------------------------//
//-- 4.0   - METADATA DECLARATION               --//
//-- 4.1   - User Info                          --//
//-- 4.2   - Users Premises                     --//
//-- 4.3   - Premise Locations                  --//
//-- 4.4   - Users Units                        --//
//-- 4.5   - Users Rooms                        --//
//-- 4.6   - Users IO                           --//
//-- 4.7   - Users Thing                        --//
//-- 4.8   - Users Sensors                      --//
//-- 4.9   - Data TinyInt                       --//
//-- 4.10  - Data Int                           --//
//-- 4.11  - Data BigInt                        --//
//-- 4.12  - Data Float                         --//
//-- 4.13  - Data TinyString                    --//
//-- 4.14 -  Data ShortString                   --//
//-- 4.15  - Data Medstring                     --//
//-- 4.16  - Users Premise Log                  --//
//-- 4.17  - Users Gateways                     --//
//-- 4.101 - PREMISETYPES                       --//
//-- 4.102 - PREMISEBUILDINGTYPES               --//
//-- 4.103 - PREMISEOCCUPANTS                   --//
//-- 4.104 - PREMISEBEDROOMS                    --//
//-- 4.105 - PREMISEFLOORS                      --//
//-- 4.106 - PREMISEROOMS                       --//
//-- 4.107 - POSTCODES                          --//
//-- 4.108 - TIMEZONES                          --//
//-- 4.109 - STATEPROVINCE                      --//
//-- 4.110 - COUNTRIES                          --//
//-- 4.111 - CURRENCIES                         --//
//-- 4.112 - LANGUAGES                          --//
//-- 4.113 - RSCAT                              --//
//-- 4.114 - RSSUBCAT                           --//
//-- 4.115 - RSTARIFF                           --//
//-- 4.116 - RSTYPES                            --//
//-- 4.117 - UOMS                               --//
//-- 4.118 - ICONS                              --//
//-- 4.119 - GENDER                             --//
//-- 4.120 - ROOMTYPE                           --//
//-- 4.121 - LINKTYPE                           --//
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
//== 3.0  - CLASS DECLARATIONS                                                                                                  ==//
//================================================================================================================================//
/**
 * 3.1 - VR_USERSINFO entity type.
 */
class VR_USERSINFO{
	public $USERS_PK;
	public $USERS_STATE;
	public $USERS_USERNAME;
	public $USERADDRESS_PK;
	public $USERADDRESS_LINE3;
	public $USERADDRESS_LINE2;
	public $USERADDRESS_LINE1;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
	public $LANGUAGE_PK;
	public $LANGUAGE_NAME;
	public $LANGUAGE_LANGUAGE;
	public $LANGUAGE_VARIANT;
	public $LANGUAGE_ENCODING;
	public $POSTCODE_PK;
	public $POSTCODE_NAME;
	public $STATEPROVINCE_PK;
	public $STATEPROVINCE_SHORTNAME;
	public $STATEPROVINCE_NAME;
	public $TIMEZONE_PK;
	public $TIMEZONE_CC;
	public $TIMEZONE_LATITUDE;
	public $TIMEZONE_LONGITUDE;
	public $TIMEZONE_TZ;
	public $USERSINFO_PK;
	public $USERSINFO_TITLE;
	public $USERSINFO_GIVENNAMES;
	public $USERSINFO_SURNAMES;
	public $USERSINFO_DISPLAYNAME;
	public $USERSINFO_EMAIL;
	public $USERSINFO_PHONENUMBER;
	public $USERSINFO_DOB;
	public $USERSGENDER_PK;
	public $USERSGENDER_NAME;
}

/**
 * 3.2 - VR_USERSPREMISES entity type.
 */

class VR_USERSPREMISES{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PREMISE_DESCRIPTION;
	public $PREMISEFLOORS_PK;
	public $PREMISEFLOORS_NAME;
	public $PREMISEINFO_PK;
	public $PREMISEROOMS_PK;
	public $PREMISEROOMS_NAME;
	public $PREMISEBEDROOMS_PK;
	public $PREMISEBEDROOMS_COUNT;
	public $PREMISEOCCUPANTS_PK;
	public $PREMISEOCCUPANTS_NAME;
}

/**
 * 3.3 - VR_USERSPREMISELOCATIONS entity type.
 */
class VR_USERSPREMISELOCATIONS{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PREMISE_DESCRIPTION;
	public $PREMISEADDRESS_PK;
	public $PREMISEADDRESS_LINE1;
	public $PREMISEADDRESS_LINE2;
	public $PREMISEADDRESS_LINE3;
	public $LANGUAGE_PK;
	public $LANGUAGE_NAME;
	public $LANGUAGE_LANGUAGE;
	public $LANGUAGE_VARIANT;
	public $LANGUAGE_ENCODING;
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
	public $STATEPROVINCE_PK;
	public $STATEPROVINCE_SHORTNAME;
	public $STATEPROVINCE_NAME;
	public $POSTCODE_PK;
	public $POSTCODE_NAME;
	public $TIMEZONE_PK;
	public $TIMEZONE_CC;
	public $TIMEZONE_LATITUDE;
	public $TIMEZONE_LONGITUDE;
	public $TIMEZONE_TZ;
}

/**
 * 3.4 - VR_USERSHUB entity type.
 */
class VR_USERSHUB{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUB_SERIALNUMBER;
	public $HUB_IPADDRESS;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;

}

/**
 * 3.5 - VR_USERSROOMS entity type.
 */
class VR_USERSROOMS{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $ROOMS_PK;
	public $ROOMS_NAME;
	public $ROOMS_FLOOR;
	public $ROOMS_DESC;
	public $ROOMTYPE_PK;
	public $ROOMTYPE_NAME;
	public $ROOMTYPE_OUTDOORS;
}

/**
 * 3.6 - VR_USERSLINK entity type.
 */

class VR_USERSLINK{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINK_ROOMS_FK;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $LINKINFO_PK;
	public $LINKINFO_NAME;
	public $LINKINFO_MANUFACTURER;
	public $LINKINFO_MANUFACTURERURL;
	public $LINKCONN_PK;
	public $LINKCONN_NAME;
	public $LINKCONN_ADDRESS;
	public $LINKCONN_USERNAME;
	public $LINKCONN_PASSWORD;
	public $LINKCONN_PORT;
	public $LINKPROTOCOL_NAME;
	public $LINKCRYPTTYPE_NAME;
	public $LINKFREQ_NAME;
}

/**
 * 3.7 - VR_USERSTHING entity type.
 */
class VR_USERSTHING{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINK_ROOMS_FK;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
}


/**
 * 3.8 - VR_USERSIO entity type.
 */
class VR_USERSIO{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_ROOMS_FK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_NAME;
	public $LINKTYPE_PK;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_PK;
	public $IO_BASECONVERT;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATE;
	public $IO_STATECHANGEID;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
	public $IOTYPE_DATATYPE_FK;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}



/**
 * 3.9 - VR_DATATINYINT entity type.
 */
class VR_DATATINYINT{
	public $CALCEDVALUE;
	public $UTS;
	public $DATATINYINT_PK;
	public $DATATINYINT_DATE;
	public $DATATINYINT_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.10 - VR_DATAINT entity type.
 */
class VR_DATAINT{
	public $CALCEDVALUE;
	public $UTS;
	public $DATAINT_PK;
	public $DATAINT_DATE;
	public $DATAINT_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.11 - VR_DATABIGINT entity type.
 */
class VR_DATABIGINT{
	public $CALCEDVALUE;
	public $UTS;
	public $DATABIGINT_PK;
	public $DATABIGINT_DATE;
	public $DATABIGINT_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.12 - VR_DATAFLOAT entity type.
 */
class VR_DATAFLOAT{
	public $CALCEDVALUE;
	public $UTS;
	public $DATAFLOAT_PK;
	public $DATAFLOAT_DATE;
	public $DATAFLOAT_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;

}

/**
 * 3.13 - VR_DATATINYSTRING entity type.
 */
class VR_DATATINYSTRING{
	public $CALCEDVALUE;
	public $UTS;
	public $DATATINYSTRING_PK;
	public $DATATINYSTRING_DATE;
	public $DATATINYSTRING_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.14 - VR_DATASHORTSTRING entity type.
 */
class VR_DATASHORTSTRING{
	public $CALCEDVALUE;
	public $UTS;
	public $DATASHORTSTRING_PK;
	public $DATASHORTSTRING_DATE;
	public $DATASHORTSTRING_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.15 - VR_DATAMEDSTRING entity type.
 */
class VR_DATAMEDSTRING{
	public $CALCEDVALUE;
	public $UTS;
	public $DATAMEDSTRING_PK;
	public $DATAMEDSTRING_DATE;
	public $DATAMEDSTRING_VALUE;
	public $DATATYPE_PK;
	public $DATATYPE_NAME;
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_READ;
	public $PERMISSIONS_STATETOGGLE;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;
	public $LINK_PK;
	public $LINK_SERIALCODE;
	public $LINK_NAME;
	public $LINK_CONNECTED;
	public $LINK_STATE;
	public $LINK_STATECHANGECODE;
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	public $THING_PK;
	public $THING_HWID;
	public $THING_OUTPUTHWID;
	public $THING_STATE;
	public $THING_STATECHANGEID;
	public $THING_NAME;
	public $THINGTYPE_PK;
	public $THINGTYPE_NAME;
	public $IO_BASECONVERT;
	public $IO_PK;
	public $IO_NAME;
	public $IO_SAMPLERATELIMIT;
	public $IO_SAMPLERATEMAX;
	public $IO_SAMPLERATECURRENT;
	public $IO_STATECHANGEID;
	public $IO_STATE;
	public $IOTYPE_PK;
	public $IOTYPE_NAME;
	public $IOTYPE_ENUM;
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
	public $UOMCAT_PK;
	public $UOMCAT_NAME;
	public $UOMSUBCAT_PK;
	public $UOMSUBCAT_NAME;
	public $UOM_PK;
	public $UOM_NAME;
	public $UOM_RATE;
}

/**
 * 3.16 - VR_USERSPREMISELOG entity type.
 */
class VR_USERSPREMISELOG{
	public $PERMISSIONS_READ;
	public $PREMISELOGACTION_NAME;
	public $PREMISELOGACTION_DESC;
	public $PREMISELOG_USERS_FK;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PREMISE_DESCRIPTION;
	public $PREMISELOGACTION_PK;
	public $PREMISELOG_PK;
	public $PREMISELOG_UTS;
	public $PREMISELOG_CUSTOM1;
	public $USERSINFO_DISPLAYNAME;

}

/**
 * 3.17 - VR_USERSCOMM entity type.
 */
class VR_USERSCOMM{
	public $USERS_PK;
	public $USERS_USERNAME;
	public $PERMISSIONS_OWNER;
	public $PERMISSIONS_WRITE;
	public $PERMISSIONS_STATETOGGLE;
	public $PERMISSIONS_READ;
	public $PREMISE_PK;
	public $PREMISE_NAME;
	public $PREMISE_DESCRIPTION;
	public $COMM_PK;
	public $COMM_NAME;
	public $COMM_JOINMODE;
	public $COMM_ADDRESS;
	public $COMMTYPE_PK;
	public $COMMTYPE_NAME;
	public $HUB_PK;
	public $HUB_NAME;
	public $HUB_SERIALNUMBER;
	public $HUB_IPADDRESS;
	public $HUBTYPE_PK;
	public $HUBTYPE_NAME;

}


/**
 * 3.101 - VP_PREMISETYPES entity type.
 */
class VP_PREMISETYPES{
	public $PREMISETYPE_PK;
	public $PREMISETYPE_NAME;
}

/**
 * 3.103 - VP_PREMISEOCCUPANTS entity type.
 */
class VP_PREMISEOCCUPANTS{
	public $PREMISEOCCUPANTS_PK;
	public $PREMISEOCCUPANTS_NAME;
}

/**
 * 3.104 - VP_PREMISEBEDROOMS entity type.
 */
class VP_PREMISEBEDROOMS{
	public $PREMISEBEDROOMS_PK;
	public $PREMISEBEDROOMS_COUNT;
}


/**
 * 3.15 - VP_PREMISEFLOORS entity type.
 */
class VP_PREMISEFLOORS{
	public $PREMISEFLOORS_PK;
	public $PREMISEFLOORS_NAME;
}


/**
 * 3.106 - VP_PREMISEROOMS entity type.
 */
class VP_PREMISEROOMS{
	public $PREMISEROOMS_PK;
	public $PREMISEROOMS_NAME;
}


/**
 * 3.107 - VP_POSTCODES entity type.
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
 * 3.108 - VP_TIMEZONES entity type.
 */
class VP_TIMEZONES{
	public $TIMEZONE_PK;
	public $TIMEZONE_CC;
	public $TIMEZONE_LATITUDE;
	public $TIMEZONE_LONGITUDE;
	public $TIMEZONE_TZ;
}

/**
 * 3.109 - VP_STATEPROVINCE entity type.
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
 * 3.110 - VP_COUNTRIES entity type.
 */
class VP_COUNTRIES{
	public $COUNTRIES_PK;
	public $COUNTRIES_NAME;
	public $COUNTRIES_ABREVIATION;
}


/**
 * 3.111 - VP_CURRENCIES entity type.
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
 * 3.112 - VP_LANGUAGES entity type.
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
 * 3.113 - VP_RSCAT entity type.
 */
class VP_RSCAT{
	public $RSCAT_PK;
	public $RSCAT_NAME;
	public $RSCAT_FORMUTILITY;
}

/**
 * 3.114 - VP_RSSUBCAT entity type.
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
 * 3.115 - VP_RSTARIFF entity type.
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
 * 3.116 - VP_RSTYPES entity type.
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
 * 3.117 - VP_UOMS entity type.
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
 * 3.118 - VP_ICONS entity type.
 */
class VP_ICONS{
	public $ICONS_PK;
	public $ICONS_NAME;
	public $ICONS_ICON;
	public $ICONSTYPE_NAME;
	public $ICONSTYPE_PK;
}


/**
 * 3.119 - VP_USERSGENDER entity type.
 */
class VP_USERSGENDER{
	public $USERSGENDER_PK;
	public $USERSGENDER_NAME;
}


/**
 * 3.120 - VP_ROOMTYPE entity type.
 */
class VP_ROOMTYPE{
	public $ROOMTYPE_PK;
	public $ROOMTYPE_NAME;
	public $ROOMTYPE_OUTDOORS;
	
}


/**
 * 3.121 - VP_LINKTYPE entity type.
 */
class VP_LINKTYPE{
	public $LINKTYPE_PK;
	public $LINKTYPE_NAME;
	
}



//================================================================================================================================//
//== 4.0  - METADATA DECLARATION                                                                                                ==//
//================================================================================================================================//

/**
 * Create Main metadata.
 */
class CreateMainMetadata
{
	/**
	 * create metadata
	 * 
	 * @return MainMetadata
	 */
	public static function create() {
		$metadata = new ServiceBaseMetadata('MainEntities',    'Main');
		
		
		//------------------------------------------------------------//
		//-- 4.1 - USER INFORMATION                                 --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSINFO'
		$VR_USERSINFOEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSINFO'),    'VR_USERSINFO',    'Main' );
		
		$metadata->addKeyProperty(          $VR_USERSINFOEntityType,        'USERS_PK',                 EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERS_STATE',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERS_USERNAME',           EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERADDRESS_PK',           EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERADDRESS_LINE3',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERADDRESS_LINE2',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERADDRESS_LINE1',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'COUNTRIES_PK',             EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'COUNTRIES_NAME',           EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'LANGUAGE_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'LANGUAGE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'LANGUAGE_LANGUAGE',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'LANGUAGE_VARIANT',         EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'LANGUAGE_ENCODING',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'POSTCODE_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'POSTCODE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'STATEPROVINCE_PK',         EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'STATEPROVINCE_SHORTNAME',  EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'STATEPROVINCE_NAME',       EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'TIMEZONE_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'TIMEZONE_CC',              EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'TIMEZONE_LATITUDE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'TIMEZONE_LONGITUDE',       EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'TIMEZONE_TZ',              EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_PK',             EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_TITLE',          EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_GIVENNAMES',     EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_SURNAMES',       EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_DISPLAYNAME',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_EMAIL',          EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_PHONENUMBER',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSINFO_DOB',            EdmPrimitiveType::DATETIME      );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSGENDER_PK',           EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSINFOEntityType,        'USERSGENDER_NAME',         EdmPrimitiveType::CHARARRAY     );
		
		$VR_USERSINFOsResourceSet = $metadata->addResourceSet(
			'VR_USERSINFO', $VR_USERSINFOEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.2 - USER PREMISES                                    --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSPREMISES'
		$VR_USERSPREMISESEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSPREMISES'),    'VR_USERSPREMISES',    'Main' );
		
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'USERS_PK',                 EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'USERS_USERNAME',           EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PERMISSIONS_STATETOGGLE',  EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PERMISSIONS_READ',         EdmPrimitiveType::INT16         );
		$metadata->addKeyProperty(          $VR_USERSPREMISESEntityType,    'PREMISE_PK',               EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISE_NAME',             EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISE_DESCRIPTION',      EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEFLOORS_PK',         EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEFLOORS_NAME',       EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEINFO_PK',           EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEROOMS_PK',          EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEROOMS_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEBEDROOMS_PK',       EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEBEDROOMS_COUNT',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEOCCUPANTS_PK',      EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISESEntityType,    'PREMISEOCCUPANTS_NAME',    EdmPrimitiveType::CHARARRAY     );
			
		$VR_USERSPREMISESsResourceSet = $metadata->addResourceSet( 'VR_USERSPREMISES', $VR_USERSPREMISESEntityType );

		//------------------------------------------------------------//
		//-- 4.3 - USER PREMICE LOCATION                            --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSPREMISELOCATIONS'
		$VR_USERSPREMISELOCATIONSEntityType = $metadata->addEntityType(
			new ReflectionClass('VR_USERSPREMISELOCATIONS'),    'VR_USERSPREMISELOCATIONS',    'Main'
		);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'USERS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'USERS_USERNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PERMISSIONS_OWNER', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PERMISSIONS_WRITE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addKeyProperty(          $VR_USERSPREMISELOCATIONSEntityType,    'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISE_DESCRIPTION', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISEADDRESS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISEADDRESS_LINE1', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISEADDRESS_LINE2', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'PREMISEADDRESS_LINE3', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'LANGUAGE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'LANGUAGE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'LANGUAGE_LANGUAGE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'LANGUAGE_VARIANT', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'LANGUAGE_ENCODING', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'COUNTRIES_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'COUNTRIES_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'COUNTRIES_ABREVIATION', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'STATEPROVINCE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'STATEPROVINCE_SHORTNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'STATEPROVINCE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'POSTCODE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'POSTCODE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'TIMEZONE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'TIMEZONE_CC', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'TIMEZONE_LATITUDE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'TIMEZONE_LONGITUDE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOCATIONSEntityType,    'TIMEZONE_TZ', EdmPrimitiveType::CHARARRAY);
		
		$VR_USERSPREMISELOCATIONSsResourceSet = $metadata->addResourceSet( 'VR_USERSPREMISELOCATIONS', $VR_USERSPREMISELOCATIONSEntityType );


		//------------------------------------------------------------//
		//-- 4.4 - USER HUB                                         --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSHUB'
		$VR_USERSHUBEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSHUB'),    'VR_USERSHUB',    'Main' );
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'USERS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'USERS_USERNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PERMISSIONS_OWNER', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PERMISSIONS_WRITE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addKeyProperty(          $VR_USERSHUBEntityType,    'HUB_PK', EdmPrimitiveType::INT64 );
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'HUB_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'HUB_SERIALNUMBER', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'HUB_IPADDRESS', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'HUBTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSHUBEntityType,    'HUBTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		
		$VR_USERSHUBsResourceSet = $metadata->addResourceSet( 'VR_USERSHUB', $VR_USERSHUBEntityType );
		
		//------------------------------------------------------------//
		//-- 4.5 - USER ROOMS                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSROOMS'
		$VR_USERSROOMSEntityType = $metadata->addEntityType(new ReflectionClass('VR_USERSROOMS'),    'VR_USERSROOMS',    'UsersroomsView');
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'USERS_PK',                    EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'USERS_USERNAME',              EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PERMISSIONS_OWNER',           EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PERMISSIONS_WRITE',           EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PERMISSIONS_READ',            EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PREMISE_PK',					EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY);
		$metadata->addKeyProperty(              $VR_USERSROOMSEntityType,    'ROOMS_PK',					EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMS_NAME',					EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMS_FLOOR',				EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMS_DESC',					EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMTYPE_PK',				EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMTYPE_NAME',				EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(        $VR_USERSROOMSEntityType,    'ROOMTYPE_OUTDOORS',            EdmPrimitiveType::INT16);
		
		$VR_USERSROOMSsResourceSet = $metadata->addResourceSet( 'VR_USERSROOMS', $VR_USERSROOMSEntityType );
		
		//------------------------------------------------------------//
		//-- 4.6 - USER LINK                                        --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSLINK'
		$VR_USERSLINKEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSLINK'),    'VR_USERSLINK',    'Main' );
		
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'USERS_PK',                 EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'USERS_USERNAME',           EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PERMISSIONS_STATETOGGLE',  EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PERMISSIONS_READ',         EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PREMISE_PK',               EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'PREMISE_NAME',             EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'HUB_PK',                   EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'HUB_NAME',                 EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'HUBTYPE_PK',               EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'HUBTYPE_NAME',             EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VR_USERSLINKEntityType,            'LINK_PK',                  EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_SERIALCODE',          EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_NAME',                EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_CONNECTED',           EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_STATE',               EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_STATECHANGECODE',     EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINK_ROOMS_FK',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKTYPE_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKINFO_PK',              EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKINFO_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKINFO_MANUFACTURER',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKINFO_MANUFACTURERURL', EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_PK',              EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_ADDRESS',         EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_USERNAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_PASSWORD',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCONN_PORT',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKPROTOCOL_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKCRYPTTYPE_NAME',       EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSLINKEntityType,            'LINKFREQ_NAME',            EdmPrimitiveType::CHARARRAY     );
		
		$VR_USERSLINKsResourceSet = $metadata->addResourceSet( 'VR_USERSLINK', $VR_USERSLINKEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.7 - USER THING	             --//
		//------------------------------------------------------------//
		
		//Register the entity (resource) type 'VR_USERSTHING'
		$VR_USERSTHINGEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSTHING'),    'VR_USERSTHING',    'Main' );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'USERS_PK',                EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'USERS_USERNAME',          EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PERMISSIONS_OWNER',       EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PERMISSIONS_WRITE',       EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PERMISSIONS_READ',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PREMISE_PK',              EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'PREMISE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'HUB_PK',                  EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'HUB_NAME',                EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'HUBTYPE_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_PK',                 EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_SERIALCODE',         EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_NAME',               EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_CONNECTED',          EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_STATE',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_STATECHANGECODE',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINK_ROOMS_FK',           EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINKTYPE_PK',             EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'LINKTYPE_NAME',           EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VR_USERSTHINGEntityType,        'THING_PK',                EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THING_HWID',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THING_STATE',             EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THING_STATECHANGEID',     EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THING_NAME',              EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSTHINGEntityType,        'THINGTYPE_NAME',          EdmPrimitiveType::CHARARRAY     );
		
		$VR_USERSTHINGsResourceSet = $metadata->addResourceSet(
			'VR_USERSTHING', $VR_USERSTHINGEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.8 - USER IO	             --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSIO'
		$VR_USERSIOEntityType = $metadata->addEntityType( new ReflectionClass('VR_USERSIO'),    'VR_USERSIO',    'Main' );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'USERS_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'USERS_USERNAME',            EdmPrimitiveType::CHARARRAY     );
//		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PERMISSIONS_PK',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PERMISSIONS_READ',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PREMISE_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'HUB_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'HUB_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'HUBTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_ROOMS_FK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_SERIALCODE',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_CONNECTED',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_STATE',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINK_STATECHANGECODE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'LINKTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_HWID',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_STATE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_STATECHANGEID',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THING_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'THINGTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VR_USERSIOEntityType,        'IO_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_BASECONVERT',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_SAMPLERATELIMIT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_SAMPLERATEMAX',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_SAMPLERATECURRENT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_STATE',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IO_STATECHANGEID',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IOTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IOTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IOTYPE_ENUM',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'IOTYPE_DATATYPE_FK',    EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'DATATYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'DATATYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_USERSIOEntityType,        'UOM_RATE',					EdmPrimitiveType::CHARARRAY     );

		$VR_USERSIOsResourceSet = $metadata->addResourceSet( 'VR_USERSIO', $VR_USERSIOEntityType );
		
		
		
		//------------------------------------------------------------//
		//-- 4.9 - DATA TINYINT	             --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATATINYINT'
		$VR_DATATINYINTEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATATINYINT'),    'VR_DATATINYINT',    'Main' );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'CALCEDVALUE',				EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UTS',						EdmPrimitiveType::INT64         );
		$metadata->addKeyProperty(          $VR_DATATINYINTEntityType,        'DATATINYINT_PK',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'DATATINYINT_DATE',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'DATATINYINT_VALUE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'DATATYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'DATATYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'USERS_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'USERS_USERNAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PREMISE_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PERMISSIONS_READ',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'HUB_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'HUB_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_SERIALCODE',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_CONNECTED',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_STATE',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINK_STATECHANGECODE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINKTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_HWID',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_STATE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_STATECHANGEID',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THING_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'THINGTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_BASECONVERT',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_SAMPLERATELIMIT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_SAMPLERATEMAX',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_SAMPLERATECURRENT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_STATECHANGEID',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IO_STATE',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IOTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IOTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'IOTYPE_ENUM',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATATINYINTEntityType,        'UOM_RATE',					EdmPrimitiveType::CHARARRAY     );
		
		$VR_DATATINYINTsResourceSet = $metadata->addResourceSet( 'VR_DATATINYINT', $VR_DATATINYINTEntityType );
		
		//------------------------------------------------------------//
		//-- 4.10 - DATA INT		             --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATAINT'
		$VR_DATAINTEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATAINT'), 'VR_DATAINT', 'Main' );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'CALCEDVALUE',				EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UTS',						EdmPrimitiveType::INT64         );
		$metadata->addKeyProperty(          $VR_DATAINTEntityType,            'DATAINT_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'DATAINT_DATE',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'DATAINT_VALUE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'DATATYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'DATATYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'USERS_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'USERS_USERNAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PREMISE_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PERMISSIONS_READ',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'HUB_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'HUB_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'HUBTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_SERIALCODE',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_CONNECTED',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_STATE',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINK_STATECHANGECODE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINKTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_HWID',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_STATE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_STATECHANGEID',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THING_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'THINGTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_BASECONVERT',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_SAMPLERATELIMIT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_SAMPLERATEMAX',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_SAMPLERATECURRENT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_STATECHANGEID',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IO_STATE',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IOTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IOTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'IOTYPE_ENUM',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAINTEntityType,            'UOM_RATE',					EdmPrimitiveType::CHARARRAY     );
		
		$VR_DATAINTsResourceSet = $metadata->addResourceSet( 'VR_DATAINT', $VR_DATAINTEntityType );
		
		//------------------------------------------------------------//
		//-- 4.11 -DATA BIGINT	             --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATABIGINT'
		$VR_DATABIGINTEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATABIGINT'), 'VR_DATABIGINT', 'Main' );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'CALCEDVALUE',				EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UTS',						EdmPrimitiveType::INT64         );
		$metadata->addKeyProperty(          $VR_DATABIGINTEntityType,        'DATABIGINT_PK',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'DATABIGINT_DATE',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'DATABIGINT_VALUE',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'DATATYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'DATATYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'USERS_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'USERS_USERNAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PREMISE_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PERMISSIONS_READ',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'HUB_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'HUB_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'HUBTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_SERIALCODE',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_CONNECTED',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_STATE',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINK_STATECHANGECODE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINKTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_HWID',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_STATE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_STATECHANGEID',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THING_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'THINGTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_BASECONVERT',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_SAMPLERATELIMIT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_SAMPLERATEMAX',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_SAMPLERATECURRENT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_STATECHANGEID',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IO_STATE',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IOTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IOTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'IOTYPE_ENUM',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATABIGINTEntityType,        'UOM_RATE',					EdmPrimitiveType::CHARARRAY     );
		
		$VR_DATABIGINTsResourceSet = $metadata->addResourceSet( 'VR_DATABIGINT', $VR_DATABIGINTEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.12 - DATA FLOAT	             --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATAFLOAT'
		$VR_DATAFLOATEntityType = $metadata->addEntityType(	new ReflectionClass('VR_DATAFLOAT'), 'VR_DATAFLOAT', 'Main');
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'CALCEDVALUE',				EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UTS',						EdmPrimitiveType::INT64         );
		$metadata->addKeyProperty(          $VR_DATAFLOATEntityType,        'DATAFLOAT_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'DATAFLOAT_DATE',            EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'DATAFLOAT_VALUE',            EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'DATATYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'DATATYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'USERS_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'USERS_USERNAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PREMISE_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PREMISE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PERMISSIONS_OWNER',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PERMISSIONS_WRITE',        EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PERMISSIONS_READ',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'PERMISSIONS_STATETOGGLE',    EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'HUB_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'HUB_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'HUBTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'HUBTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_PK',					EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_SERIALCODE',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_CONNECTED',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_STATE',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINK_STATECHANGECODE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINKTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'LINKTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_HWID',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_OUTPUTHWID',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_STATE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_STATECHANGEID',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THING_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THINGTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'THINGTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_BASECONVERT',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_PK',				EdmPrimitiveType::INT64         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_SAMPLERATELIMIT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_SAMPLERATEMAX',        EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_SAMPLERATECURRENT',    EdmPrimitiveType::DOUBLE		);
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_STATECHANGEID',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IO_STATE',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IOTYPE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IOTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'IOTYPE_ENUM',            EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VR_DATAFLOATEntityType,        'UOM_RATE',					EdmPrimitiveType::CHARARRAY     );
		
		$VR_DATAFLOATsResourceSet = $metadata->addResourceSet( 'VR_DATAFLOAT', $VR_DATAFLOATEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.13 - DATA FLOAT                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATATINYSTRING'
		$VR_DATATINYSTRINGEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATATINYSTRING'), 'VR_DATATINYSTRING', 'Main' );
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'CALCEDVALUE',             EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'UTS',                     EdmPrimitiveType::INT64);
		$metadata->addKeyProperty(          $VR_DATATINYSTRINGEntityType,    'DATATINYSTRING_PK',       EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'DATATINYSTRING_DATE',     EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'DATATINYSTRING_VALUE',    EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'DATATYPE_PK',             EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'DATATYPE_NAME',           EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'USERS_PK',                EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'USERS_USERNAME',          EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PREMISE_PK',              EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PREMISE_NAME',            EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PERMISSIONS_OWNER',       EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PERMISSIONS_WRITE',       EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PERMISSIONS_READ',        EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType,    'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'HUB_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'HUB_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'HUBTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'HUBTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_SERIALCODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_CONNECTED', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINK_STATECHANGECODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINKTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'LINKTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_HWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_OUTPUTHWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THING_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THINGTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'THINGTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_BASECONVERT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_SAMPLERATELIMIT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_SAMPLERATEMAX', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_SAMPLERATECURRENT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IO_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IOTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IOTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'IOTYPE_ENUM', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSSUBCAT_TYPE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSTARIFF_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSTARIFF_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'RSTYPE_MAIN', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOMCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOMCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOMSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOMSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOM_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOM_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATATINYSTRINGEntityType, 'UOM_RATE', EdmPrimitiveType::CHARARRAY);
		
		$VR_DATATINYSTRINGsResourceSet = $metadata->addResourceSet( 'VR_DATATINYSTRING', $VR_DATATINYSTRINGEntityType );
		
		//------------------------------------------------------------//
		//-- 4.14 - DATA SHORT STRING                               --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATASHORTSTRING'
		$VR_DATASHORTSTRINGEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATASHORTSTRING'), 'VR_DATASHORTSTRING', 'DatashortstringView' );
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'CALCEDVALUE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UTS', EdmPrimitiveType::INT64);
		$metadata->addKeyProperty(          $VR_DATASHORTSTRINGEntityType, 'DATASHORTSTRING_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'DATASHORTSTRING_DATE', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'DATASHORTSTRING_VALUE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'DATATYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'DATATYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'USERS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'USERS_USERNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PERMISSIONS_OWNER', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PERMISSIONS_WRITE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'HUB_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'HUB_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'HUBTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'HUBTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_SERIALCODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_CONNECTED', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINK_STATECHANGECODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINKTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'LINKTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_HWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_OUTPUTHWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THING_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THINGTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'THINGTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_BASECONVERT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_SAMPLERATELIMIT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_SAMPLERATEMAX', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_SAMPLERATECURRENT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IO_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IOTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IOTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'IOTYPE_ENUM', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSSUBCAT_TYPE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSTARIFF_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSTARIFF_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'RSTYPE_MAIN', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOMCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOMCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOMSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOMSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOM_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOM_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATASHORTSTRINGEntityType, 'UOM_RATE', EdmPrimitiveType::CHARARRAY);
		
		$VR_DATASHORTSTRINGsResourceSet = $metadata->addResourceSet( 'VR_DATASHORTSTRING', $VR_DATASHORTSTRINGEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.15 - DATA MEDIUM STRING                              --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_DATAMEDSTRING'
		$VR_DATAMEDSTRINGEntityType = $metadata->addEntityType( new ReflectionClass('VR_DATAMEDSTRING'), 'VR_DATAMEDSTRING', 'Main' );
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'CALCEDVALUE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UTS', EdmPrimitiveType::INT64);
		$metadata->addKeyProperty(          $VR_DATAMEDSTRINGEntityType, 'DATAMEDSTRING_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'DATAMEDSTRING_DATE', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'DATAMEDSTRING_VALUE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'DATATYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'DATATYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'USERS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'USERS_USERNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PERMISSIONS_OWNER', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PERMISSIONS_WRITE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'HUB_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'HUB_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'HUBTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'HUBTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_SERIALCODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_CONNECTED', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINK_STATECHANGECODE', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINKTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'LINKTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_HWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_OUTPUTHWID', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THING_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THINGTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'THINGTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_BASECONVERT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_SAMPLERATELIMIT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_SAMPLERATEMAX', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_SAMPLERATECURRENT', EdmPrimitiveType::DOUBLE);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_STATECHANGEID', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IO_STATE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IOTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IOTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'IOTYPE_ENUM', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSSUBCAT_TYPE', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSTARIFF_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSTARIFF_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'RSTYPE_MAIN', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOMCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOMCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOMSUBCAT_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOMSUBCAT_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOM_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOM_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_DATAMEDSTRINGEntityType, 'UOM_RATE', EdmPrimitiveType::CHARARRAY);
		
		$VR_DATAMEDSTRINGsResourceSet = $metadata->addResourceSet( 'VR_DATAMEDSTRING', $VR_DATAMEDSTRINGEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.16 - USERS PREMISELOG                                --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSPREMISELOG'
		$VR_USERSPREMISELOGEntityType = $metadata->addEntityType(
			new ReflectionClass('VR_USERSPREMISELOG'), 'VR_USERSPREMISELOG', 'Main'
		);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOGACTION_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOGACTION_DESC', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOG_USERS_FK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISE_DESCRIPTION', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOGACTION_PK', EdmPrimitiveType::INT32);
		$metadata->addKeyProperty(          $VR_USERSPREMISELOGEntityType, 'PREMISELOG_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOG_UTS', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'PREMISELOG_CUSTOM1', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSPREMISELOGEntityType, 'USERSINFO_DISPLAYNAME', EdmPrimitiveType::CHARARRAY);
		
		$VR_USERSPREMISELOGsResourceSet = $metadata->addResourceSet( 'VR_USERSPREMISELOG', $VR_USERSPREMISELOGEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.17 - USERS COMM                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VR_USERSCOMM'
		$VR_USERSCOMMEntityType = $metadata->addEntityType(
			new ReflectionClass('VR_USERSCOMM'), 'VR_USERSCOMM', 'Main'
		);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'USERS_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'USERS_USERNAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PERMISSIONS_OWNER', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PERMISSIONS_WRITE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PERMISSIONS_STATETOGGLE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PERMISSIONS_READ', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PREMISE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PREMISE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'PREMISE_DESCRIPTION', EdmPrimitiveType::CHARARRAY);
		$metadata->addKeyProperty(          $VR_USERSCOMMEntityType, 'COMM_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'COMM_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'COMM_JOINMODE', EdmPrimitiveType::INT16);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'COMM_ADDRESS', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'COMMTYPE_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'COMMTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUB_PK', EdmPrimitiveType::INT64);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUB_NAME', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUB_SERIALNUMBER', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUB_IPADDRESS', EdmPrimitiveType::CHARARRAY);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUBTYPE_PK', EdmPrimitiveType::INT32);
		$metadata->addPrimitiveProperty(    $VR_USERSCOMMEntityType, 'HUBTYPE_NAME', EdmPrimitiveType::CHARARRAY);
		
		$VR_USERSCOMMsResourceSet = $metadata->addResourceSet( 'VR_USERSCOMM', $VR_USERSCOMMEntityType );
		
		
		//------------------------------------------------------------//
		//-- 4.101 - PREMISE TYPES                                  --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISETYPES'
		$VP_PREMISETYPESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISETYPES'), 'VP_PREMISETYPES', 'Public'
		);
		$metadata->addKeyProperty(          $VP_PREMISETYPESEntityType,     'PREMISETYPE_PK',           EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_PREMISETYPESEntityType,     'PREMISETYPE_NAME',         EdmPrimitiveType::CHARARRAY     );
			
		$VP_PREMISETYPESsResourceSet = $metadata->addResourceSet(
			'VP_PREMISETYPES', $VP_PREMISETYPESEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.103 - PREMISE OCCUPANTS                              --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEOCCUPANTS'
		$VP_PREMISEOCCUPANTSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEOCCUPANTS'), 'VP_PREMISEOCCUPANTS', 'Public'
		);
		$metadata->addKeyProperty(          $VP_PREMISEOCCUPANTSEntityType,         'PREMISEOCCUPANTS_PK',              EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_PREMISEOCCUPANTSEntityType,         'PREMISEOCCUPANTS_NAME',            EdmPrimitiveType::CHARARRAY     );
			
		$VP_PREMISEOCCUPANTSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEOCCUPANTS', $VP_PREMISEOCCUPANTSEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.104 - PREMISE BEDROOMS                               --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEBEDROOMS'
		$VP_PREMISEBEDROOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEBEDROOMS'), 'VP_PREMISEBEDROOMS', 'Public'
		);
		$metadata->addKeyProperty(          $VP_PREMISEBEDROOMSEntityType,            'PREMISEBEDROOMS_PK',               EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_PREMISEBEDROOMSEntityType,            'PREMISEBEDROOMS_COUNT',            EdmPrimitiveType::CHARARRAY     );
			
		$VP_PREMISEBEDROOMSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEBEDROOMS', $VP_PREMISEBEDROOMSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.105 - PREMISE BEDROOMS                               --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEFLOORS'
		$VP_PREMISEFLOORSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEFLOORS'), 'VP_PREMISEFLOORS', 'Public'
		);
		$metadata->addKeyProperty(          $VP_PREMISEFLOORSEntityType,            'PREMISEFLOORS_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_PREMISEFLOORSEntityType,            'PREMISEFLOORS_NAME',        EdmPrimitiveType::CHARARRAY     );
			
		$VP_PREMISEFLOORSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEFLOORS', $VP_PREMISEFLOORSEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.106 - PREMISE ROOMS                                  --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_PREMISEROOMS'
		$VP_PREMISEROOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_PREMISEROOMS'), 'VP_PREMISEROOMS', 'Public'
		);
		$metadata->addKeyProperty(          $VP_PREMISEROOMSEntityType,				'PREMISEROOMS_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_PREMISEROOMSEntityType,				'PREMISEROOMS_NAME',        EdmPrimitiveType::CHARARRAY     );
			
		$VP_PREMISEROOMSsResourceSet = $metadata->addResourceSet(
			'VP_PREMISEROOMS', $VP_PREMISEROOMSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.107 - POSTCODES                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_POSTCODES'
		$VP_POSTCODESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_POSTCODES'), 'VP_POSTCODES', 'Public'
		);
		$metadata->addKeyProperty(          $VP_POSTCODESEntityType,				'POSTCODE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'POSTCODE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'STATEPROVINCE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'STATEPROVINCE_SHORTNAME',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'STATEPROVINCE_NAME',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'COUNTRIES_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'TIMEZONE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'TIMEZONE_CC',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'TIMEZONE_LATITUDE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'TIMEZONE_LONGITUDE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_POSTCODESEntityType,				'TIMEZONE_TZ',				EdmPrimitiveType::CHARARRAY     );
			
		$VP_POSTCODESsResourceSet = $metadata->addResourceSet(
			'VP_POSTCODES', $VP_POSTCODESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.108 - TIMEZONES                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_TIMEZONES'
		$VP_TIMEZONESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_TIMEZONES'), 'VP_TIMEZONES', 'Public'
		);
		$metadata->addKeyProperty(          $VP_TIMEZONESEntityType,				'TIMEZONE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_TIMEZONESEntityType,				'TIMEZONE_CC',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_TIMEZONESEntityType,				'TIMEZONE_LATITUDE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_TIMEZONESEntityType,				'TIMEZONE_LONGITUDE',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_TIMEZONESEntityType,				'TIMEZONE_TZ',				EdmPrimitiveType::CHARARRAY     );
		
		$VP_TIMEZONESsResourceSet = $metadata->addResourceSet(
			'VP_TIMEZONES', $VP_TIMEZONESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.109 - STAEPROVINCE                                   --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_STATEPROVINCE'
		$VP_STATEPROVINCEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_STATEPROVINCE'), 'VP_STATEPROVINCE', 'Public'
		);
		$metadata->addKeyProperty(          $VP_STATEPROVINCEEntityType,            'STATEPROVINCE_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_STATEPROVINCEEntityType,            'STATEPROVINCE_SHORTNAME',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_STATEPROVINCEEntityType,            'STATEPROVINCE_NAME',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_STATEPROVINCEEntityType,            'COUNTRIES_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_STATEPROVINCEEntityType,            'COUNTRIES_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_STATEPROVINCEEntityType,            'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
		
		$VP_STATEPROVINCEsResourceSet = $metadata->addResourceSet(
			'VP_STATEPROVINCE', $VP_STATEPROVINCEEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.110 - COUNTRIES                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_COUNTRIES'
		$VP_COUNTRIESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_COUNTRIES'), 'VP_COUNTRIES', 'Public'
		);
		$metadata->addKeyProperty(          $VP_COUNTRIESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_COUNTRIESEntityType,				'COUNTRIES_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_COUNTRIESEntityType,				'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
			
		$VP_COUNTRIESsResourceSet = $metadata->addResourceSet(
			'VP_COUNTRIES', $VP_COUNTRIESEntityType
		);

		//------------------------------------------------------------//
		//-- 4.111 - CURRENCIES                                     --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_CURRENCIES'
		$VP_CURRENCIESEntityType = $metadata->addEntityType( new ReflectionClass('VP_CURRENCIES'), 'VP_CURRENCIES', 'Public');
		
		$metadata->addKeyProperty(          $VP_CURRENCIESEntityType,				'CURRENCIES_PK',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_CURRENCIESEntityType,				'CURRENCIES_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_CURRENCIESEntityType,				'CURRENCIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_CURRENCIESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_CURRENCIESEntityType,				'COUNTRIES_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_CURRENCIESEntityType,				'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
		
		$VP_CURRENCIESsResourceSet = $metadata->addResourceSet(
			'VP_CURRENCIES', $VP_CURRENCIESEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.112 - LANGUAGES                                      --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_LANGUAGES'
		$VP_LANGUAGESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_LANGUAGES'), 'VP_LANGUAGES', 'Public'
		);
		$metadata->addKeyProperty(          $VP_LANGUAGESEntityType,				'LANGUAGE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'LANGUAGE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'LANGUAGE_LANGUAGE',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'LANGUAGE_VARIANT',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'LANGUAGE_ENCODING',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'COUNTRIES_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'COUNTRIES_NAME',        EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_LANGUAGESEntityType,				'COUNTRIES_ABREVIATION',    EdmPrimitiveType::CHARARRAY     );
			
		$VP_LANGUAGESsResourceSet = $metadata->addResourceSet(
			'VP_LANGUAGES', $VP_LANGUAGESEntityType
		);
	
		//------------------------------------------------------------//
		//-- 4.113 - RSCAT                                          --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSCAT'
		$VP_RSCATEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSCAT'), 'VP_RSCAT', 'Public'
		);
		$metadata->addKeyProperty(          $VP_RSCATEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSCATEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSCATEntityType,					'RSCAT_FORMUTILITY',        EdmPrimitiveType::INT16         );
			
		$VP_RSCATsResourceSet = $metadata->addResourceSet(
			'VP_RSCAT', $VP_RSCATEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.114 - RSSUBCAT                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSSUBCAT'
		$VP_RSSUBCATEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSSUBCAT'), 'VP_RSSUBCAT', 'Public'
		);
		$metadata->addPrimitiveProperty(    $VP_RSSUBCATEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSSUBCATEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VP_RSSUBCATEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSSUBCATEntityType,					'RSSUBCAT_RSCAT_FK',        EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSSUBCATEntityType,					'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSSUBCATEntityType,					'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
			
		$VP_RSSUBCATsResourceSet = $metadata->addResourceSet(
			'VP_RSSUBCAT', $VP_RSSUBCATEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.115 - RSTARIFF                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSTARIFF'
		$VP_RSTARIFFEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSTARIFF'), 'VP_RSTARIFF', 'Public'
		);
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addKeyProperty(          $VP_RSTARIFFEntityType,					'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTARIFFEntityType,					'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
			
		$VP_RSTARIFFsResourceSet = $metadata->addResourceSet(
			'VP_RSTARIFF', $VP_RSTARIFFEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.116 - RS TYPES                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_RSTYPES'
		$VP_RSTYPESEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_RSTYPES'), 'VP_RSTYPES', 'Public'
		);
		
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSCAT_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSCAT_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSSUBCAT_TYPE',            EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSTARIFF_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSTARIFF_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VP_RSTYPESEntityType,					'RSTYPE_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_RSTYPESEntityType,					'RSTYPE_MAIN',				EdmPrimitiveType::INT16         );
			
		$VP_RSTYPESsResourceSet = $metadata->addResourceSet(
			'VP_RSTYPES', $VP_RSTYPESEntityType
		);
		
		//------------------------------------------------------------//
		//-- 4.117 - UNIT OF MEASUREMENT                            --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_UOMS'
		$VP_UOMSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_UOMS'), 'VP_UOMS', 'Public'
		);
		$metadata->addPrimitiveProperty(    $VP_UOMSEntityType,						'UOMCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_UOMSEntityType,						'UOMCAT_NAME',				EdmPrimitiveType::CHARARRAY     ); 
		$metadata->addPrimitiveProperty(    $VP_UOMSEntityType,						'UOMSUBCAT_PK',				EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_UOMSEntityType,						'UOMSUBCAT_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addKeyProperty(          $VP_UOMSEntityType,						'UOM_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_UOMSEntityType,						'UOM_NAME',					EdmPrimitiveType::CHARARRAY     );
		
		$VP_UOMSsResourceSet = $metadata->addResourceSet(
			'VP_UOMS', $VP_UOMSEntityType
		);
	
		
		//------------------------------------------------------------//
		//-- 4.118 - ICONS                                          --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_ICONS'
		$VP_ICONSEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_ICONS'), 'VP_ICONS', 'Public'
		);
		$metadata->addKeyProperty(          $VP_ICONSEntityType,            'ICONS_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_ICONSEntityType,            'ICONS_NAME',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_ICONSEntityType,            'ICONS_ICON',				EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_ICONSEntityType,            'ICONSTYPE_NAME',            EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_ICONSEntityType,            'ICONSTYPE_PK',				EdmPrimitiveType::INT32         );
			
		$VP_ICONSsResourceSet = $metadata->addResourceSet(
			'VP_ICONS', $VP_ICONSEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.119 - GENDER                                         --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_USERSGENDER'
		$VP_USERSGENDEREntityType = $metadata->addEntityType(
			new ReflectionClass('VP_USERSGENDER'), 'VP_USERSGENDER', 'Public'
		);
		$metadata->addKeyProperty(          $VP_USERSGENDEREntityType,            'USERSGENDER_PK',             EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_USERSGENDEREntityType,            'USERSGENDER_NAME',           EdmPrimitiveType::CHARARRAY     );
	
		$VP_USERSGENDERsResourceSet = $metadata->addResourceSet(
			'VP_USERSGENDER', $VP_USERSGENDEREntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.120 - ROOMTYPE                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_USERSGENDER'
		$VP_ROOMTYPEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_ROOMTYPE'), 'VP_ROOMTYPE', 'Public'
		);
		$metadata->addKeyProperty(          $VP_ROOMTYPEEntityType,     'ROOMTYPE_PK',                  EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_ROOMTYPEEntityType,     'ROOMTYPE_NAME',                EdmPrimitiveType::CHARARRAY     );
		$metadata->addPrimitiveProperty(    $VP_ROOMTYPEEntityType,     'ROOMTYPE_OUTDOORS',            EdmPrimitiveType::INT16		);
	
		$VP_ROOMTYPEsResourceSet = $metadata->addResourceSet(
			'VP_ROOMTYPE', $VP_ROOMTYPEEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- 4.121 - LINKTYPE                                       --//
		//------------------------------------------------------------//
		//Register the entity (resource) type 'VP_LINKTYPE'
		$VP_LINKTYPEEntityType = $metadata->addEntityType(
			new ReflectionClass('VP_LINKTYPE'), 'VP_LINKTYPE', 'Public'
		);
		$metadata->addKeyProperty(          $VP_LINKTYPEEntityType,            'LINKTYPE_PK',					EdmPrimitiveType::INT32         );
		$metadata->addPrimitiveProperty(    $VP_LINKTYPEEntityType,            'LINKTYPE_NAME',				EdmPrimitiveType::CHARARRAY     );
	
		$VP_LINKTYPEsResourceSet = $metadata->addResourceSet(
			'VP_LINKTYPE', $VP_LINKTYPEEntityType
		);
		
		
		//------------------------------------------------------------//
		//-- RETURN THE METADATA                                    --//
		//------------------------------------------------------------//
		//Register the assoications (navigations)
		return $metadata;
	}
}
?>
