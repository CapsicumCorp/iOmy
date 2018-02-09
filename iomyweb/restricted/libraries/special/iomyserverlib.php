<?php
//========================================================================================================//
//== @Author: Andrew Somerville <support@capsicumcorp.com>
//== @Description: Set of functions for deploying the schema in 
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



function DB_CreateDatabase( $sDatabaseName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add a new database.                    --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Insert Database        --//
			//----------------------------------------//
			$sSQL .= "CREATE DATABASE ".$sDatabaseName." CHARACTER SET utf8 COLLATE utf8_unicode_ci;";
			
			
			//-- Run the SQL Query and save the results --//
			$aResult = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResult;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDatabase: ".$sErrMesg );
	}
}




function DB_FetchCreateTableSQL( $sDBName, $sName, $sDefaultCharset="utf8" ) {
	/*
	Core
	Region
	Language
	Timezone
	
	Users
	UserAddress
	Permissions
	Premise
	PremiseLog
	PremiseInfo1
	PremiseInfo2
	Rooms
	Hub
	Comm
	Link
	LinkInfo
	LinkConn1
	LinkConn2
	Thing
	IO
	Data1
	Data2
	Data3
	Data4
	Data5
	Datatype
	RSCat
	RSType
	UoM
	Rules
	*/
	
	$sSQL            = "";
	
	
	switch( $sName ) {
		/*==============================================================*/
		/* Table: CORE & COREADDON                                      */
		/*==============================================================*/
		case 'Core':
			$sSQL .= "create table `".$sDBName."`.`CORE` \n";
			$sSQL .= "( \n";
			$sSQL .= "   CORE_PK              integer not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   CORE_NAME            varchar(40) not null, \n";
			$sSQL .= "   CORE_VERSION1        integer not null comment 'Main Version number', \n";
			$sSQL .= "   CORE_VERSION2        integer not null comment 'Minor Version number', \n";
			$sSQL .= "   CORE_VERSION3        integer not null comment 'Trivial Version number', \n";
			$sSQL .= "   CORE_SETUPUTS        bigint not null comment 'Unix Timestamp when setup', \n";
			$sSQL .= "   primary key (CORE_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.`CORE` comment 'This table is used to store what the current and previous versions have been setup'; \n";
			break;
			
		case 'CoreAddon':
			$sSQL .= "create table `".$sDBName."`.COREADDON \n";
			$sSQL .= "( \n";
			$sSQL .= "   COREADDON_PK         integer not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   COREADDON_CORE_FK    integer not null comment 'Foreign Key', \n";
			$sSQL .= "   COREADDON_NAME       varchar(40) not null, \n";
			$sSQL .= "   COREADDON_VERSION1   integer not null, \n";
			$sSQL .= "   COREADDON_VERSION2   integer not null, \n";
			$sSQL .= "   COREADDON_VERSION3   integer not null, \n";
			$sSQL .= "   COREADDON_SETUPUTS   bigint not null, \n";
			$sSQL .= "   primary key (COREADDON_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n"; 
			break;
			
		/*==============================================================*/
		/* Table: REGION                                                */
		/*==============================================================*/
		case 'Region':
			//-- Region --//
			$sSQL .= "create table `".$sDBName."`.`REGION` \n";
			$sSQL .= "( \n";
			$sSQL .= "   REGION_PK            int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   REGION_REGIONSUBLOC_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   REGION_CURRENCIES_FK int comment 'Foreign Key', \n";
			$sSQL .= "   REGION_NAME          varchar(64) not null, \n";
			$sSQL .= "   REGION_NAME2         varchar(7) not null, \n";
			$sSQL .= "   REGION_NAME3         varchar(7) not null, \n";
			$sSQL .= "   REGION_NAME4         varchar(14) not null, \n";
			$sSQL .= "   primary key (REGION_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.`REGION` comment 'Stores a list of supported regions.'; \n";
			
			//-- Region Sub Location --//
			$sSQL .= "create table `".$sDBName."`.`REGIONSUBLOC` \n";
			$sSQL .= "( \n";
			$sSQL .= "   REGIONSUBLOC_PK      int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   REGIONSUBLOC_REGIONLOC_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   REGIONSUBLOC_NAME    varchar(30) not null, \n";
			$sSQL .= "   primary key (REGIONSUBLOC_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			
			//-- Region Location --//
			$sSQL .= "create table `".$sDBName."`.`REGIONLOC` \n";
			$sSQL .= "( \n";
			$sSQL .= "   REGIONLOC_PK         int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   REGIONLOC_NAME       varchar(30) not null, \n";
			$sSQL .= "   primary key (REGIONLOC_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			break;
			
		/*==============================================================*/
		/* Table: CURRENCIES                                            */
		/*==============================================================*/
		case 'Currency':
			$sSQL .= "create table `".$sDBName."`.`CURRENCIES` \n";
			$sSQL .= "(\n";
			$sSQL .= "   CURRENCIES_PK        int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   CURRENCIES_NAME      varchar(64) not null, \n";
			$sSQL .= "   CURRENCIES_ABREVIATION varchar(16) not null, \n";
			$sSQL .= "   primary key (CURRENCIES_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`CURRENCIES` comment 'Stores a list of supported currencies.';\n";
			break;
		
		/*==============================================================*/
		/* Table: LANGUAGE                                              */
		/*==============================================================*/
		case 'Language':
			$sSQL .= "create table `".$sDBName."`.`LANGUAGE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LANGUAGE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LANGUAGE_NAME        varchar(64), \n";
			$sSQL .= "   LANGUAGE_ENCODING    varchar(32), \n";
			$sSQL .= "   primary key (LANGUAGE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LANGUAGE` comment 'Stores a list of supported languages.';\n";
			break;
			
		/*==============================================================*/
		/* Table: TIMEZONE                                              */
		/*==============================================================*/
		case 'Timezone':
			$sSQL .= "create table `".$sDBName."`.`TIMEZONE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   TIMEZONE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TIMEZONE_CC          varchar(4), \n";
			$sSQL .= "   TIMEZONE_LATITUDE    varchar(12), \n";
			$sSQL .= "   TIMEZONE_LONGITUDE   varchar(12), \n";
			$sSQL .= "   TIMEZONE_TZ          varchar(30) not null, \n";
			$sSQL .= "   primary key (TIMEZONE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TIMEZONE comment 'Stores a list of supported timezones.';\n";
			break;
			
		/*==============================================================*/
		/* Table: USERS & USERSINFO                                     */
		/*==============================================================*/
		case 'Users':
			$sSQL .= "create table `".$sDBName."`.`USERS` \n";
			$sSQL .= "( \n";
			$sSQL .= "   USERS_PK             bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   USERS_USERSINFO_FK   bigint comment 'Foreign Key', \n";
			$sSQL .= "   USERS_USERNAME       varchar(64) not null comment 'username', \n";
			$sSQL .= "   USERS_STATE          int not null, \n";
			$sSQL .= "   primary key (USERS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".USERS comment 'Links Username and UserDetails to the UserId.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`USERSINFO` \n";
			$sSQL .= "( \n";
			$sSQL .= "   USERSINFO_PK         bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   USERSINFO_USERSGENDER_FK tinyint not null comment 'Foreign Key', \n";
			$sSQL .= "   USERSINFO_TITLE      varchar(6), \n";
			$sSQL .= "   USERSINFO_GIVENNAMES varchar(64) not null, \n";
			$sSQL .= "   USERSINFO_SURNAMES   varchar(64) not null, \n";
			$sSQL .= "   USERSINFO_DISPLAYNAME varchar(64) not null, \n";
			$sSQL .= "   USERSINFO_EMAIL      varchar(80), \n";
			$sSQL .= "   USERSINFO_PHONENUMBER varchar(20), \n";
			$sSQL .= "   USERSINFO_DOB        date, \n";
			$sSQL .= "   primary key (USERSINFO_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			break;

		/*==============================================================*/
		/* Table: USERADDRESS & USERSGENDER                             */
		/*==============================================================*/
		case 'UserAddress':
			$sSQL .= "create table `".$sDBName."`.`USERADDRESS` \n";
			$sSQL .= "( \n";
			$sSQL .= "   USERADDRESS_PK            bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   USERADDRESS_USERS_FK      bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_LANGUAGE_FK   int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_REGION_FK     int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_SUBREGION     varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_POSTCODE      varchar(12) not null, \n";
			$sSQL .= "   USERADDRESS_TIMEZONE_FK   int not null comment 'Foreign Key', \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE1 varchar(128) not null, \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE2 varchar(128) not null, \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE3 varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE1         varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE2         varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE3         varchar(128) not null, \n";
			$sSQL .= "   primary key (USERADDRESS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";

			$sSQL .= "create table `".$sDBName."`.`USERSGENDER` \n";
			$sSQL .= "( \n";
			$sSQL .= "   USERSGENDER_PK       tinyint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   USERSGENDER_NAME     varchar(16) not null, \n";
			$sSQL .= "   primary key (USERSGENDER_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".USERSGENDER comment 'Labels for the GenderId in the UserInfo Table';\n";
			break;
			
		/*==============================================================*/
		/* Table: PERMPREMISE & PERMROOMS & PERMSERVER                  */
		/*==============================================================*/
		case 'Permissions':
			$sSQL .= "create table `".$sDBName."`.`PERMPREMISE` \n";
			$sSQL .= "( \n";
			$sSQL .= "   PERMPREMISE_PK       bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PERMPREMISE_USERS_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   PERMPREMISE_PREMISE_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   PERMPREMISE_OWNER    tinyint not null default 0, \n";
			$sSQL .= "   PERMPREMISE_WRITE    tinyint not null default 0, \n";
			$sSQL .= "   PERMPREMISE_STATETOGGLE tinyint not null default 0, \n";
			$sSQL .= "   PERMPREMISE_READ     tinyint not null default 0, \n";
			$sSQL .= "   PERMPREMISE_ROOMADMIN tinyint not null default 0, \n";
			$sSQL .= "   primary key (PERMPREMISE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PERMPREMISE comment 'Governs what access users have to a premise.';\n";
			
			$sSQL .= "create table ".$sDBName.".PERMROOMS \n";
			$sSQL .= "( \n";
			$sSQL .= "   PERMROOMS_PK         bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PERMROOMS_ROOMS_FK   bigint not null comment 'Primary Key', \n";
			$sSQL .= "   PERMROOMS_USERS_FK   bigint not null comment 'Primary Key', \n";
			$sSQL .= "   PERMROOMS_READ       tinyint not null default 0, \n";
			$sSQL .= "   PERMROOMS_WRITE      tinyint not null default 0, \n";
			$sSQL .= "   PERMROOMS_STATETOGGLE tinyint not null default 0, \n";
			$sSQL .= "   PERMROOMS_DATAREAD   tinyint not null default 0, \n";
			$sSQL .= "   primary key (PERMROOMS_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table ".$sDBName.".PERMROOMS comment 'Governs what access users have to a room.'; \n";
			
			$sSQL .= "create table ".$sDBName.".PERMSERVER \n";
			$sSQL .= "( \n";
			$sSQL .= "   PERMSERVER_PK        bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PERMSERVER_USERS_FK  bigint not null comment 'Primary Key', \n";
			$sSQL .= "   PERMSERVER_ADDUSER   tinyint not null comment 'username', \n";
			$sSQL .= "   PERMSERVER_ADDPREMISEHUB tinyint not null, \n";
			$sSQL .= "   PERMSERVER_UPGRADE   tinyint not null, \n";
			$sSQL .= "   primary key (PERMSERVER_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table ".$sDBName.".PERMSERVER comment 'Used to store what permissions a User has on the server'; \n";
			
			$sSQL .= "create table ".$sDBName.".PERMHUB\n";
			$sSQL .= "(\n";
			$sSQL .= "   PERMHUB_PK           bigint not null auto_increment comment 'Primary Key',\n";
			$sSQL .= "   PERMHUB_USERS_FK      bigint not null comment 'Foreign Key',\n";
			$sSQL .= "   PERMHUB_HUB_FK       bigint not null comment 'Foreign Key',\n";
			$sSQL .= "   primary key (PERMHUB_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table ".$sDBName.".PERMHUB comment 'Used to store what permissions a WatchInputs User has to a Hub';\n";
			break;

		/*==============================================================*/
		/* Table: PREMISE & PREMISEADDRESS                              */
		/*==============================================================*/
		case 'Premise':
			$sSQL .= "create table `".$sDBName."`.`PREMISE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISE_PK           bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISE_PREMISEINFO_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   PREMISE_NAME         varchar(64) not null, \n";
			$sSQL .= "   PREMISE_DESCRIPTION  varchar(128), \n";
			$sSQL .= "   primary key (PREMISE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISE comment 'Used to store the Premises that have been setup.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`PREMISEADDRESS` \n";
			$sSQL .= "( \n";
			$sSQL .= "   PREMISEADDRESS_PK            bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISEADDRESS_PREMISE_FK    bigint comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_LANGUAGE_FK   int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_REGION_FK     int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_SUBREGION     varchar(128) not null, \n";
			$sSQL .= "   PREMISEADDRESS_POSTCODE      varchar(12) not null, \n";
			$sSQL .= "   PREMISEADDRESS_TIMEZONE_FK   int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_LINE1         varchar(128), \n";
			$sSQL .= "   PREMISEADDRESS_LINE2         varchar(128), \n";
			$sSQL .= "   PREMISEADDRESS_LINE3         varchar(128), \n";
			$sSQL .= "   primary key (PREMISEADDRESS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEADDRESS comment 'Used to store the location of the Premise.';\n";
			break;
			
		/*==============================================================*/
		/* Table: PREMISELOG & PREMISELOGACTION                         */
		/*==============================================================*/
		case 'PremiseLog':
			$sSQL .= "create table `".$sDBName."`.`PREMISELOG` \n";
			$sSQL .= "( \n";
			$sSQL .= "   PREMISELOG_PK        bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISELOG_PREMISE_FK bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   PREMISELOG_USERS_FK  bigint comment 'Foreign Key', \n";
			$sSQL .= "   PREMISELOG_PREMISELOGACTION_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISELOG_CUSTOMLOG_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   PREMISELOG_UTS       bigint not null, \n";
			$sSQL .= "   PREMISELOG_CUSTOM1   varchar(64), \n";
			$sSQL .= "   primary key (PREMISELOG_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISELOG comment 'Stores changes done to a premise.';\n";

			$sSQL .= "create table `".$sDBName."`.`PREMISELOGACTION` \n";
			$sSQL .= "( \n";
			$sSQL .= "   PREMISELOGACTION_PK  int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISELOGACTION_NAME varchar(32) not null, \n";
			$sSQL .= "   PREMISELOGACTION_DESC varchar(120) not null, \n";
			$sSQL .= "   primary key (PREMISELOGACTION_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISELOGACTION comment 'List of preset messages for the premise logs';\n";
			
			/*==============================================================*/
			/* Table: CUSTOMLOG                                             */
			/*==============================================================*/
			$sSQL .= "create table `".$sDBName."`.`CUSTOMLOG` \n";
			$sSQL .= "(\n";
			$sSQL .= "   CUSTOMLOG_PK         bigint not null, \n";
			$sSQL .= "   primary key (CUSTOMLOG_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			break;
			
		/*==============================================================*/
		/* Table: PREMISEINFO & PREMISEBEDROOMS                         */
		/*==============================================================*/
		case 'PremiseInfo1':
			$sSQL .= "create table `".$sDBName."`.`PREMISEINFO` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISEINFO_PK       bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISEINFO_PREMISEBEDROOMS_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEINFO_PREMISEOCCUPANTS_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEINFO_PREMISEROOMS_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEINFO_PREMISEFLOORS_FK int comment 'Foreign Key', \n";
			$sSQL .= "   primary key (PREMISEINFO_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEINFO comment 'Used to store basic statistical data.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`PREMISEBEDROOMS` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISEBEDROOMS_PK   int not null comment 'Primary Key', \n";
			$sSQL .= "   PREMISEBEDROOMS_COUNT varchar(16) not null, \n";
			$sSQL .= "   primary key (PREMISEBEDROOMS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEBEDROOMS comment 'Label for the BedroomId in the PremiseInfo Table.';\n";
			break;
			
		/*==============================================================*/
		/* Table: PREMISEFLOORS & PREMISEOCCUPANTS & PREMISEROOMS       */
		/*==============================================================*/
		case 'PremiseInfo2':
			$sSQL .= "create table `".$sDBName."`.`PREMISEFLOORS` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISEFLOORS_PK     int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISEFLOORS_NAME   varchar(8) not null, \n";
			$sSQL .= "   primary key (PREMISEFLOORS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEFLOORS comment 'Label for PremiseFloorsId in the PremiseInfo Table.';\n";

			$sSQL .= "create table `".$sDBName."`.`PREMISEOCCUPANTS` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISEOCCUPANTS_PK  int not null comment 'Primary Key', \n";
			$sSQL .= "   PREMISEOCCUPANTS_NAME varchar(128) not null, \n";
			$sSQL .= "   primary key (PREMISEOCCUPANTS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEOCCUPANTS comment 'Label for OccupantsId that is in the PremiseInfo.';\n";

			$sSQL .= "create table `".$sDBName."`.`PREMISEROOMS` \n";
			$sSQL .= "(\n";
			$sSQL .= "   PREMISEROOMS_PK      int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISEROOMS_NAME    varchar(8) not null, \n";
			$sSQL .= "   primary key (PREMISEROOMS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".PREMISEROOMS comment 'Labels for PremiseRoomsId in the PremiseInfo Table.';\n";
			break;
			
		/*==============================================================*/
		/* Table: ROOMS & ROOMTYPE                                      */
		/*==============================================================*/
		case 'Rooms':
			$sSQL .= "create table `".$sDBName."`.`ROOMS` \n";
			$sSQL .= "(\n";
			$sSQL .= "   ROOMS_PK             bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   ROOMS_PREMISE_FK     bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   ROOMS_ROOMTYPE_FK    int not null comment 'Foreign Key', \n";
			$sSQL .= "   ROOMS_NAME           varchar(64) not null, \n";
			$sSQL .= "   ROOMS_FLOOR          int, \n";
			$sSQL .= "   ROOMS_DESC           varchar(64), \n";
			$sSQL .= "   primary key (ROOMS_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".ROOMS comment 'Table used to store the Rooms that each User creates.';\n";

			$sSQL .= "create table `".$sDBName."`.`ROOMTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   ROOMTYPE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   ROOMTYPE_NAME        varchar(32) not null, \n";
			$sSQL .= "   ROOMTYPE_OUTDOORS    tinyint not null, \n";
			$sSQL .= "   primary key (ROOMTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".ROOMTYPE comment 'Table used to categorise with common room types.';\n";
			break;
			
		/*==============================================================*/
		/* Table: HUB & HUBTYPE                                         */
		/*==============================================================*/
		case 'Hub':
			$sSQL .= "create table `".$sDBName."`.`HUB` \n";
			$sSQL .= "(\n";
			$sSQL .= "   HUB_PK               bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   HUB_PREMISE_FK       bigint comment 'Foreign Key', \n";
			$sSQL .= "   HUB_HUBTYPE_FK       bigint comment 'Foreign Key', \n";
			$sSQL .= "   HUB_NAME             varchar(64) not null, \n";
			$sSQL .= "   HUB_SERIALNUMBER     varchar(32) not null comment 'Unit''s Serial Number.', \n";
			$sSQL .= "   HUB_IPADDRESS        varchar(32) not null, \n";
			$sSQL .= "   HUB_LAST_MODIFIED    timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (HUB_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`HUB` comment 'Used to store sources that submit to the Database. Eg. Andro';\n";

			$sSQL .= "create table `".$sDBName."`.`HUBTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   HUBTYPE_PK           bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   HUBTYPE_NAME         varchar(64) not null, \n";
			$sSQL .= "   primary key (HUBTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`HUBTYPE` comment 'Labels for the HubTypeId in the Hub Table';\n";
			break;

		/*==============================================================*/
		/* Table: COMM & COMMTYPE                                       */
		/*==============================================================*/
		case 'Comm':
			$sSQL .= "create table `".$sDBName."`.`COMM` \n";
			$sSQL .= "(\n";
			$sSQL .= "   COMM_PK              bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   COMM_HUB_FK          bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   COMM_COMMTYPE_FK     int not null comment 'Foreign Key', \n";
			$sSQL .= "   COMM_NAME            varchar(64) not null, \n";
			$sSQL .= "   COMM_JOINMODE        boolean not null, \n";
			$sSQL .= "   COMM_ADDRESS         varchar(64) not null comment 'TODO: Needs to become a 64bit Unsigned Integer.', \n";
			$sSQL .= "   primary key (COMM_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`COMM` comment 'Communication configuration between HUB and Link';\n";

			$sSQL .= "create table `".$sDBName."`.`COMMTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   COMMTYPE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   COMMTYPE_NAME        varchar(64) not null, \n";
			$sSQL .= "   primary key (COMMTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`COMMTYPE` comment 'Labels for the CommTypeId in the COMM Table';\n";
			break;
			
		/*==============================================================*/
		/* Table: LINK & LINKTYPE                                       */
		/*==============================================================*/
		case 'Link':
			$sSQL .= "create table `".$sDBName."`.`LINK` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINK_PK              bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINK_COMM_FK         bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   LINK_LINKTYPE_FK     int not null comment 'Foreign Key', \n";
			$sSQL .= "   LINK_LINKINFO_FK     bigint comment 'Foreign Key', \n";
			$sSQL .= "   LINK_LINKCONN_FK     bigint comment 'Foreign Key', \n";
			$sSQL .= "   LINK_ROOMS_FK        bigint comment 'Foreign Key', \n";
			$sSQL .= "   LINK_SERIALCODE      varchar(50) not null, \n";
			$sSQL .= "   LINK_NAME            varchar(64) not null, \n";
			$sSQL .= "   LINK_CONNECTED       tinyint, \n";
			$sSQL .= "   LINK_STATE           int not null, \n";
			$sSQL .= "   LINK_STATECHANGECODE varchar(30), \n";
			$sSQL .= "   LINK_LAST_MODIFIED   timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (LINK_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINK` comment 'Stores the various links between Hubs and Things';\n";
			
			$sSQL .= "create table `".$sDBName."`.`LINKTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKTYPE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKTYPE_NAME        varchar(64) not null, \n";
			$sSQL .= "   primary key (LINKTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINKTYPE` comment 'Has the labels for the various Link Types.';\n";
			break;
			
		/*==============================================================*/
		/* Table: LINKINFO                                              */
		/*==============================================================*/
		case 'LinkInfo':
			$sSQL .= "create table `".$sDBName."`.`LINKINFO` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKINFO_PK            bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKINFO_NAME          varchar(100) not null, \n";
			$sSQL .= "   LINKINFO_MANUFACTURER  varchar(64), \n";
			$sSQL .= "   LINKINFO_MANUFACTURERURL varchar(128), \n";
			$sSQL .= "   primary key (LINKINFO_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINKINFO` comment 'Additional information about the LINK.';\n";
			break;
			
		/*==============================================================*/
		/* Table: LINKCONN                                              */
		/*==============================================================*/
		case 'LinkConn1':
			$sSQL .= "create table `".$sDBName."`.`LINKCONN` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKCONN_PK          bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKCONN_LINKPROTOCOL_FK int comment 'Foreign Key', \n";
			$sSQL .= "   LINKCONN_LINKFREQ_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   LINKCONN_LINKCRYPTTYPE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   LINKCONN_ADDRESS     varchar(20), \n";
			$sSQL .= "   LINKCONN_NAME        varchar(22) not null comment 'Name', \n";
			$sSQL .= "   LINKCONN_USERNAME    varchar(50), \n";
			$sSQL .= "   LINKCONN_PASSWORD    varchar(50), \n";
			$sSQL .= "   LINKCONN_PORT        integer comment 'Port Number', \n";
			$sSQL .= "   LINKCONN_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (LINKCONN_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.`LINKCONN` comment 'Connection information for how the HUB connects to the LINK.'; \n";
			
			$sSQL .= "create table `".$sDBName."`.`LINKPROTOCOL` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKPROTOCOL_PK      int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKPROTOCOL_NAME    varchar(22) not null comment 'Name', \n";
			$sSQL .= "   primary key (LINKPROTOCOL_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINKPROTOCOL` comment 'Label of the protocol to access an IO.';\n";
			break;
			
		/*==============================================================*/
		/* Table: LINKCRYPTTYPE & LINKFREQ                              */
		/*==============================================================*/
		case 'LinkConn2':
			$sSQL .= "create table `".$sDBName."`.`LINKCRYPTTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKCRYPTTYPE_PK       int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKCRYPTTYPE_NAME     varchar(22) not null comment 'Name', \n";
			$sSQL .= "   primary key (LINKCRYPTTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINKCRYPTTYPE` comment 'Label for the encryption used between the HUB and the LINK.';\n";

			$sSQL .= "create table `".$sDBName."`.`LINKFREQ` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LINKFREQ_PK          bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LINKFREQ_NAME        varchar(40) not null comment 'Name', \n";
			$sSQL .= "   primary key (LINKFREQ_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LINKFREQ` comment 'Label for the Frequency/Channel of an LINK.';\n";
			break;

		/*==============================================================*/
		/* Table: THING & THINGTYPE                                     */
		/*==============================================================*/
		case 'Thing':
			$sSQL .= "create table `".$sDBName."`.`THING` \n";
			$sSQL .= "(\n";
			$sSQL .= "   THING_PK             bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   THING_LINK_FK        bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   THING_THINGTYPE_FK   int not null comment 'Foreign Key', \n";
			$sSQL .= "   THING_HWID           int, \n";
			$sSQL .= "   THING_OUTPUTHWID     int, \n";
			$sSQL .= "   THING_STATE          int not null, \n";
			$sSQL .= "   THING_STATECHANGEID  varchar(30) not null comment 'Unique Code for Device State Change. eg, User clicks button on website, rule turns device off', \n";
			$sSQL .= "   THING_SERIALCODE     varchar(32) default NULL, \n";
			$sSQL .= "   THING_NAME           varchar(64) not null comment 'The display name that appears in the UI as a human friendly name. Can be renamed by the User.', \n";
			$sSQL .= "   THING_LAST_MODIFIED  timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (THING_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".THING comment 'These are the subsections found on a device.';\n";

			$sSQL .= "create table `".$sDBName."`.`THINGTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   THINGTYPE_PK         int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   THINGTYPE_NAME       varchar(64) not null, \n";
			$sSQL .= "   primary key (THINGTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".THINGTYPE comment 'Labels for the ThingTypeIds.';\n";
			break;
			
		/*==============================================================*/
		/* Table: IO & IOTYPE                                           */
		/*==============================================================*/
		case 'IO':
			$sSQL .= "create table `".$sDBName."`.`IO` \n";
			$sSQL .= "(\n";
			$sSQL .= "   IO_PK                bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   IO_THING_FK          bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   IO_RSTYPES_FK        int not null comment 'Foreign Key', \n";
			$sSQL .= "   IO_UOM_FK            int not null comment 'Foreign Key', \n";
			$sSQL .= "   IO_IOTYPE_FK         int not null comment 'Foreign Key', \n";
			$sSQL .= "   IO_STATE             int not null, \n";
			$sSQL .= "   IO_STATECHANGEID     varchar(32) not null comment 'Unique Code for Device State Change. eg, User clicks button on website, rule turns device off', \n";
			$sSQL .= "   IO_SAMPLERATECURRENT double not null default 300, \n";
			$sSQL .= "   IO_SAMPLERATEMAX     double not null comment 'This value is used to by the Graph line API as the minimum sample rate that it will return', \n";
			$sSQL .= "   IO_SAMPLERATELIMIT   double comment 'This is maximum length of time (in Secs) before it can be assumed that the device is off.', \n";
			$sSQL .= "   IO_BASECONVERT       double not null default 1 comment 'Not allowed to be Zero.', \n";
			$sSQL .= "   IO_NAME              varchar(64), \n";
			$sSQL .= "   IO_LAST_MODIFIED     timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (IO_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`IO` comment 'Stores Sensor Information.';\n";

			$sSQL .= "create table `".$sDBName."`.`IOTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   IOTYPE_PK            int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   IOTYPE_DATATYPE_FK   int not null comment 'Foreign Key', \n";
			$sSQL .= "   IOTYPE_NAME          varchar(64) not null, \n";
			$sSQL .= "   IOTYPE_ENUM          tinyint not null comment '0=normal, 1=Enumeration, 2=Totaled', \n";
			$sSQL .= "   primary key (IOTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`IOTYPE` comment 'Categorization of IO data for the APIs and UI.';\n";
			break;
		
		/*==============================================================*/
		/* Table: DATATINYINT & DATAINT                                 */
		/*==============================================================*/
		case 'Data1':
			$sSQL .= "create table `".$sDBName."`.`DATATINYINT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATATINYINT_PK       bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATATINYINT_IO_FK    bigint comment 'Foreign Key', \n";
			$sSQL .= "   DATATINYINT_DATE     bigint not null, \n";
			$sSQL .= "   DATATINYINT_VALUE    tinyint not null, \n";
			$sSQL .= "   DATATINYINT_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATATINYINT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATATINYINT` comment 'Stores Tiny Integers data from the sensors.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`DATAINT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATAINT_PK           bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATAINT_IO_FK        bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATAINT_DATE         bigint not null, \n";
			$sSQL .= "   DATAINT_VALUE        int not null, \n";
			$sSQL .= "   DATAINT_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATAINT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATAINT` comment 'Stores Integer data from the sensors.';\n";
			break;
			
		/*==============================================================*/
		/* Table: DATABIGINT & DATAFLOAT                                */
		/*==============================================================*/
		case 'Data2':
			$sSQL .= "create table `".$sDBName."`.`DATABIGINT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATABIGINT_PK        bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATABIGINT_IO_FK     bigint comment 'Foreign Key', \n";
			$sSQL .= "   DATABIGINT_DATE      bigint not null, \n";
			$sSQL .= "   DATABIGINT_VALUE     bigint not null, \n";
			$sSQL .= "   DATABIGINT_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATABIGINT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATABIGINT` comment 'Stores Big Integer data from the sensors.';\n";

			$sSQL .= "create table `".$sDBName."`.`DATAFLOAT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATAFLOAT_PK         bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATAFLOAT_IO_FK      bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATAFLOAT_DATE       bigint not null, \n";
			$sSQL .= "   DATAFLOAT_VALUE      double not null, \n";
			$sSQL .= "   DATAFLOAT_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATAFLOAT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATAFLOAT` comment 'Stores Double Precision Floating Point data from the sensors';\n";
			break;
			
		/*==============================================================*/
		/* Table: DATATINYSTRING & DATASHORTSTRING                      */
		/*==============================================================*/
		case 'Data3':
			$sSQL .= "create table `".$sDBName."`.`DATATINYSTRING` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATATINYSTRING_PK    bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATATINYSTRING_IO_FK bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATATINYSTRING_DATE  bigint not null, \n";
			$sSQL .= "   DATATINYSTRING_VALUE varchar(16) not null, \n";
			$sSQL .= "   DATATINYSTRING_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATATINYSTRING_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATATINYSTRING` comment 'Stores Tiny String data from the sensors.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`DATASHORTSTRING` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATASHORTSTRING_PK   bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATASHORTSTRING_IO_FK bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATASHORTSTRING_DATE bigint not null, \n";
			$sSQL .= "   DATASHORTSTRING_VALUE varchar(32) not null, \n";
			$sSQL .= "   DATASHORTSTRING_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATASHORTSTRING_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATASHORTSTRING` comment 'Stores Short String data from the sensors.';\n";
			break;
			
		/*==============================================================*/
		/* Table: DATAMEDSTRING                                         */
		/*==============================================================*/
		case 'Data4':
			$sSQL .= "create table `".$sDBName."`.`DATAMEDSTRING` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATAMEDSTRING_PK     bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATAMEDSTRING_IO_FK  bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATAMEDSTRING_DATE   bigint not null, \n";
			$sSQL .= "   DATAMEDSTRING_VALUE  varchar(65) not null, \n";
			$sSQL .= "   DATAMEDSTRING_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATAMEDSTRING_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATAMEDSTRING` comment 'Stores Medium String data from the sensors.';\n";
			
			$sSQL .= "create table `".$sDBName."`.DATALONGSTRING \n";
			$sSQL .= "( \n";
			$sSQL .= "   DATALONGSTRING_PK    bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATALONGSTRING_IO_FK bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATALONGSTRING_DATE  bigint not null, \n";
			$sSQL .= "   DATALONGSTRING_VALUE varchar(127) not null, \n";
			$sSQL .= "   DATALONGSTRING_LAST_MODIFIED timestamp not null default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATALONGSTRING_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.DATALONGSTRING comment 'Stores Long String data from the sensors.'; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATABLOB                                              */
		/*==============================================================*/
		case 'Data5':
			$sSQL .= "create table `".$sDBName."`.`DATASTRING255` \n";
			$sSQL .= "( \n";
			$sSQL .= "   DATASTRING255_PK     bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATASTRING255_IO_FK  bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATASTRING255_DATE   bigint not null, \n";
			$sSQL .= "   DATASTRING255_VALUE  varchar(255) not null, \n";
			$sSQL .= "   DATASTRING255_LAST_MODIFIED timestamp not null default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATASTRING255_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.`DATASTRING255` comment 'Stores String255 data from the sensors.'; \n";


			$sSQL .= "create table `".$sDBName."`.`DATABLOB` \n";
			$sSQL .= "( \n";
			$sSQL .= "   DATABLOB_PK          bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   DATABLOB_IO_FK       bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   DATABLOB_DATE        bigint not null, \n";
			$sSQL .= "   DATABLOB_VALUE       blob not null, \n";
			$sSQL .= "   DATABLOB_LAST_MODIFIED timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \n";
			$sSQL .= "   primary key (DATABLOB_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n";
			$sSQL .= "alter table `".$sDBName."`.`DATABLOB` comment 'Stores Binary Large Object data from the sensors.'; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATATYPE                                              */
		/*==============================================================*/
		case 'Datatype':
			$sSQL .= "create table `".$sDBName."`.`DATATYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   DATATYPE_PK          int not null comment 'Primary Key', \n";
			$sSQL .= "   DATATYPE_NAME        varchar(20) not null, \n";
			$sSQL .= "   primary key (DATATYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`DATATYPE` comment 'Labels for the raw type of data that the sensor records';\n";
			break;
			
		/*==============================================================*/
		/* Table: RSCAT & RSSUBCAT                                      */
		/*==============================================================*/
		case 'RSCat':
			$sSQL .= "create table `".$sDBName."`.`RSCAT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   RSCAT_PK             int not null comment 'Primary Key', \n";
			$sSQL .= "   RSCAT_NAME           varchar(32) not null, \n";
			$sSQL .= "   RSCAT_FORMUTILITY    tinyint not null, \n";
			$sSQL .= "   primary key (RSCAT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".RSCAT comment 'Resource Category. Helps the UI with the sensors.';\n";


			$sSQL .= "create table `".$sDBName."`.`RSSUBCAT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   RSSUBCAT_PK          int not null comment 'Primary Key', \n";
			$sSQL .= "   RSSUBCAT_RSCAT_FK    int not null comment 'Foreign Key', \n";
			$sSQL .= "   RSSUBCAT_NAME        varchar(32) not null, \n";
			$sSQL .= "   RSSUBCAT_TYPE        int not null comment '1=Usage 2=Generation 3=Storage 0=Other', \n";
			$sSQL .= "   primary key (RSSUBCAT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".RSSUBCAT comment 'Resource Subcategory.';\n";
			break;
			
		/*==============================================================*/
		/* Table: RSTARIFF & RSTYPE                                     */
		/*==============================================================*/
		case 'RSType':
			$sSQL .= "create table `".$sDBName."`.`RSTARIFF` \n";
			$sSQL .= "(\n";
			$sSQL .= "   RSTARIFF_PK          int not null comment 'Primary Key', \n";
			$sSQL .= "   RSTARIFF_RSSUBCAT_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   RSTARIFF_NAME        varchar(32) not null, \n";
			$sSQL .= "   primary key (RSTARIFF_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".RSTARIFF comment 'Resource Tariff. Utilities link here where applicable';\n";

			$sSQL .= "create table `".$sDBName."`.`RSTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   RSTYPE_PK            int not null comment 'Primary Key', \n";
			$sSQL .= "   RSTYPE_RSTARIFF_FK   int not null comment 'Foreign Key', \n";
			$sSQL .= "   RSTYPE_NAME          varchar(32) not null, \n";
			$sSQL .= "   RSTYPE_MAIN          tinyint not null default 0, \n";
			$sSQL .= "   primary key (RSTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".RSTYPE comment 'Resource Type. Sensors link to this table for the UI';\n";
			break;
			
		/*==============================================================*/
		/* Table: UOMCAT & UOMSUBCAT & UOM                              */
		/*==============================================================*/
		case 'UoM':
			$sSQL .= "create table `".$sDBName."`.`UOMCAT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   UOMCAT_PK            int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   UOMCAT_NAME          varchar(32) not null, \n";
			$sSQL .= "   primary key (UOMCAT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".UOMCAT comment 'Unit of Measurement Category. Eg. Volume, Distance, etc';\n";

			$sSQL .= "create table `".$sDBName."`.`UOMSUBCAT` \n";
			$sSQL .= "(\n";
			$sSQL .= "   UOMSUBCAT_PK         int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   UOMSUBCAT_UOMCAT_FK  int not null comment 'Foreign Key', \n";
			$sSQL .= "   UOMSUBCAT_NAME       varchar(48) not null, \n";
			$sSQL .= "   primary key (UOMSUBCAT_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".UOMSUBCAT comment 'Unit of Measurment Subcategory.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`UOM` \n";
			$sSQL .= "(\n";
			$sSQL .= "   UOM_PK               int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   UOM_UOMSUBCAT_FK     int not null comment 'Foreign Key', \n";
			$sSQL .= "   UOM_NAME             varchar(32) not null, \n";
			$sSQL .= "   UOM_RATE             varchar(16), \n";
			$sSQL .= "   primary key (UOM_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".UOM comment 'Unit of Measurment. eg. kWh, V, L, mmHg, etc';\n";
			break;
			
			
		/*==============================================================*/
		/* Table: TARGET                                                */
		/*==============================================================*/
		case 'Target':
			$sSQL .= "create table `".$sDBName."`.`TARGET` \n";
			$sSQL .= "(\n";
			$sSQL .= "   TARGET_PK            bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGET_PREMISE_FK    bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_TARGETSTATE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_NAME          varchar(32) not null, \n";
			$sSQL .= "   TARGET_START         bigint not null, \n";
			$sSQL .= "   TARGET_END           bigint not null, \n";
			$sSQL .= "   TARGET_RECUR         tinyint not null, \n";
			$sSQL .= "   TARGET_TARGETTYPE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_TARGETTYPEVALUE bigint, \n";
			$sSQL .= "   TARGET_TARGETCOMP_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_TARGETCOMPMODE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_TARGETCOMPOPERATOR_FK int comment 'Foreign Key', \n";
			$sSQL .= "   TARGET_COMPVALUE     double, \n";
			$sSQL .= "   TARGET_COMPSTART     bigint, \n";
			$sSQL .= "   TARGET_COMPEND       bigint, \n";
			$sSQL .= "   TARGET_COMPREFERENCE bigint, \n";
			$sSQL .= "   primary key (TARGET_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGET comment 'Not Operational Yet.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`TARGETCOMP` \n";
			$sSQL .= "( \n";
			$sSQL .= "   TARGETCOMP_PK        int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGETCOMP_NAME      varchar(32), \n";
			$sSQL .= "   primary key (TARGETCOMP_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGETCOMP comment 'Not Operational Yet.';\n";

			$sSQL .= "create table `".$sDBName."`.`TARGETCOMPMODE` \n";
			$sSQL .= "( \n";
			$sSQL .= "   TARGETCOMPMODE_PK    int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGETCOMPMODE_NAME  varchar(32), \n";
			$sSQL .= "   primary key (TARGETCOMPMODE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGETCOMPMODE comment 'Not Operational Yet.';\n";

			$sSQL .= "create table `".$sDBName."`.`TARGETCOMPOPERATOR` \n";
			$sSQL .= "( \n";
			$sSQL .= "   TARGETCOMPOPERATOR_PK int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGETCOMPOPERATOR_NAME varchar(6) not null, \n";
			$sSQL .= "   primary key (TARGETCOMPOPERATOR_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGETCOMPOPERATOR comment 'Not Operational Yet.';\n";

			$sSQL .= "create table `".$sDBName."`.`TARGETSTATE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   TARGETSTATE_PK       int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGETSTATE_NAME     varchar(40) not null, \n";
			$sSQL .= "   primary key (TARGETSTATE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGETSTATE comment 'Not Operational Yet.';\n";

			$sSQL .= "create table `".$sDBName."`.`TARGETTYPE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   TARGETTYPE_PK        int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   TARGETTYPE_NAME      varchar(32) not null, \n";
			$sSQL .= "   primary key (TARGETTYPE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".TARGETTYPE comment 'Not Operational Yet.';\n";
			break;
			
		/*==============================================================*/
		/* Table: Rule                                                  */
		/*==============================================================*/
		case 'Rule1':
			$sSQL .= "create table `".$sDBName."`.`RULE1` \n";
			$sSQL .= "( \n";
			$sSQL .= "	RULE1_PK             int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "	RULE1_RULE1TYPE_FK   int not null comment 'Foreign Key', \n";
			$sSQL .= "	RULE1_HUB_FK         bigint not null comment 'Foreign Key', \n";
			$sSQL .= "	RULE1_NAME           varchar(128) not null comment 'This is used so the users can assign names to individual rules.', \n";
			$sSQL .= "	RULE1_TIME           time not null comment 'This is used to store the time that gets converted into the next run unix timestamp.', \n";
			$sSQL .= "	RULE1_PARAMETER      varchar(255) not null comment 'This is used to hold the parameters (like which device) in JSON string format.', \n";
			$sSQL .= "	RULE1_ENABLED        tinyint(4) not null comment 'This is used to indicate if a rule is enabled or disabled.', \n";
			$sSQL .= "	RULE1_LASTMODIFIED   int not null comment 'This is used to indicate when the \"Add Rule\" or \"Edit Rule\" modes was last used on this particular rule.', \n";
			$sSQL .= "	RULE1_LASTMODIFIEDCODE varchar(32) not null comment 'This is a code used for debugging the rules system.', \n";
			$sSQL .= "	RULE1_LASTRUN        int not null comment 'Stores the UnixTS of the last time the rile has been run. -1 is used to indicate the Rule hasn ever been run.', \n";
			$sSQL .= "	RULE1_NEXTRUN        int not null comment 'Used to indicate the next time this rule should be run in UnixTS format.', \n";
			$sSQL .= "	primary key (`RULE1_PK`) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".`RULE1` comment 'This table is used to store the first version of the Database rules system. NOTE: Future versions will probably use a different table for new rules.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`RULE1TYPE` \n";
			$sSQL .= "( \n";
			$sSQL .= "	`RULE1TYPE_PK`       int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "	`RULE1TYPE_NAME`     varchar(64) not null, \n";
			$sSQL .= "	primary key (`RULE1TYPE_PK`) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			break;
			
		default:
			$sSQL = null;
			
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results                           --//
	//----------------------------------------------------//
	return $sSQL;
	
}



function DB_FetchCreateForeignKeySQL( $sDBName, $sName ) {
/*
	Core
	Region
	Language
	Postcode
	Users
	UserAddress
	Permissions
	Premise
	PremiseLog
	PremiseInfo1
	PremiseInfo2
	Rooms
	Hub
	Comm
	Link
	LinkInfo
	LinkConn1
	LinkConn2
	Thing
	IO
	Data1
	Data2
	Data3
	Data4
	Data5
	Datatype
	RSCat
	RSType
	UoM
	Rule1
*/
	
	$sSQL = "";
	

	switch( $sName ) {
		/*==============================================================*/
		/* Table: CORE & COREADDON                                      */
		/*==============================================================*/
		case 'Core':
			$sSQL .= "alter table `".$sDBName."`.COREADDON add constraint FK_CORE_COREADDON foreign key (COREADDON_CORE_FK) references `".$sDBName."`.CORE (CORE_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: REGION & CURRENCIES                                   */
		/*==============================================================*/
		case 'Region':
			//$sSQL .= "alter table `".$sDBName."`.REGION add constraint FK_REGION_CURRENCIES foreign key (REGION_CURRENCIES_FK) references `".$sDBName."`.CURRENCIES (CURRENCIES_PK) on delete restrict on update restrict; \n";
			break;
		
		/*==============================================================*/
		/* Table: LANGUAGE                                              */
		/*==============================================================*/
		case 'Language':
			//$sSQL .= "alter table `".$sDBName."`.LANGUAGE add constraint FK_LANGUAGE_REGION foreign key (LANGUAGE_REGION_FK) references `".$sDBName."`.REGION (REGION_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: TIMEZONE                                              */
		/*==============================================================*/
		case 'Timezone':
			break;
			
		/*==============================================================*/
		/* Table: USERS & USERSINFO                                     */
		/*==============================================================*/
		case 'Users':
			$sSQL .= "alter table `".$sDBName."`.USERS add constraint FK_USERS_USERSINFO foreign key (USERS_USERSINFO_FK) references `".$sDBName."`.USERSINFO (USERSINFO_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.USERSINFO add constraint FK_USERSINFO_USERSGENDER foreign key (USERSINFO_USERSGENDER_FK) references `".$sDBName."`.USERSGENDER (USERSGENDER_PK) on delete restrict on update restrict; \n";
			break;

		/*==============================================================*/
		/* Table: USERADDRESS & USERSGENDER                             */
		/*==============================================================*/
		case 'UserAddress':
			$sSQL .= "alter table `".$sDBName."`.USERADDRESS \n";
			$sSQL .= "    add constraint FK_USERADDRESS_REGION foreign key (USERADDRESS_REGION_FK) references `".$sDBName."`.REGION (REGION_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_LANGUAGE foreign key (USERADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_TIMEZONE foreign key (USERADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_USERS foreign key (USERADDRESS_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: PERMISSIONS                                           */
		/*==============================================================*/
		case 'Permissions1':
			$sSQL .= "alter table `".$sDBName."`.PERMPREMISE \n";
			$sSQL .= "    add constraint FK_PERMPREMISE_PREMISE foreign key (PERMPREMISE_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PERMPREMISE_USERS foreign key (PERMPREMISE_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			break;
			
		case 'Permissions2':
			$sSQL .= "alter table `".$sDBName."`.PERMROOMS \n";
			$sSQL .= "    add constraint FK_PERMROOMS_ROOMS foreign key (PERMROOMS_ROOMS_FK) references `".$sDBName."`.ROOMS (ROOMS_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PERMROOMS_USERS foreign key (PERMROOMS_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.PERMSERVER add constraint FK_PERMSERVER_USERS foreign key (PERMSERVER_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: PREMISE & PREMISEADDRESS                              */
		/*==============================================================*/
		case 'Premise':
			$sSQL .= "alter table `".$sDBName."`.PREMISE add constraint FK_PREMISE_PREMISEINFO foreign key (PREMISE_PREMISEINFO_FK) references `".$sDBName."`.PREMISEINFO (PREMISEINFO_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_REGION foreign key (PREMISEADDRESS_REGION_FK) references `".$sDBName."`.REGION (REGION_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_LANGUAGE foreign key (PREMISEADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_PREMISE foreign key (PREMISEADDRESS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_TIMEZONE foreign key (PREMISEADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";
			
			break;
			
		/*==============================================================*/
		/* Table: PREMISELOG & PREMISELOGACTION                         */
		/*==============================================================*/
		case 'PremiseLog':
			$sSQL .= "alter table `".$sDBName."`.PREMISELOG \n";
			$sSQL .= "    add constraint FK_PREMISELOG_CUSTOMLOG foreign key (PREMISELOG_CUSTOMLOG_FK) references `".$sDBName."`.CUSTOMLOG (CUSTOMLOG_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISELOG_PREMISE foreign key (PREMISELOG_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISELOG_PREMISELOGACTION foreign key (PREMISELOG_PREMISELOGACTION_FK) references `".$sDBName."`.PREMISELOGACTION (PREMISELOGACTION_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISELOG_USERS foreign key (PREMISELOG_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			break;
		
		/*==============================================================*/
		/* Table: PREMISEINFO & PREMISEBEDROOMS                         */
		/*==============================================================*/	
		case 'PremiseInfo1':
			$sSQL .= "alter table `".$sDBName."`.PREMISEINFO \n";
			$sSQL .= "    add constraint FK_PREMISEINFO_PREMISEBEDROOMS foreign key (PREMISEINFO_PREMISEBEDROOMS_FK) references `".$sDBName."`.PREMISEBEDROOMS (PREMISEBEDROOMS_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEINFO_PREMISEFLOORS foreign key (PREMISEINFO_PREMISEFLOORS_FK) references `".$sDBName."`.PREMISEFLOORS (PREMISEFLOORS_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEINFO_PREMISEOCCUPANTS foreign key (PREMISEINFO_PREMISEOCCUPANTS_FK) references `".$sDBName."`.PREMISEOCCUPANTS (PREMISEOCCUPANTS_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEINFO_PREMISEROOMS foreign key (PREMISEINFO_PREMISEROOMS_FK) references `".$sDBName."`.PREMISEROOMS (PREMISEROOMS_PK) on delete restrict on update restrict; \n";
			
			
			break;
			
		/*==============================================================*/
		/* Table: PREMISEFLOORS & PREMISEOCCUPANTS & PREMISEROOMS       */
		/*==============================================================*/
		case 'PremiseInfo2':
			$sSQL .= null;
			break;
			
		/*==============================================================*/
		/* Table: ROOMS & ROOMTYPE                                      */
		/*==============================================================*/
		case 'Rooms':
			$sSQL .= "alter table `".$sDBName."`.ROOMS \n";
			$sSQL .= "    add constraint FK_ROOMS_PREMISE foreign key (ROOMS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_ROOMS_ROOMTYPE foreign key (ROOMS_ROOMTYPE_FK) references `".$sDBName."`.ROOMTYPE (ROOMTYPE_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: HUB & HUBTYPE                                         */
		/*==============================================================*/
		case 'Hub':
			$sSQL .= "alter table `".$sDBName."`.HUB \n";
			$sSQL .= "    add constraint FK_HUB_HUBTYPE foreign key (HUB_HUBTYPE_FK) references `".$sDBName."`.HUBTYPE (HUBTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_HUB_PREMISE foreign key (HUB_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: COMM & COMMTYPE                                       */
		/*==============================================================*/
		case 'Comm':
			$sSQL .= "alter table `".$sDBName."`.COMM \n";
			$sSQL .= "    add constraint FK_COMM_COMMTYPE foreign key (COMM_COMMTYPE_FK) references `".$sDBName."`.COMMTYPE (COMMTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_COMM_HUB foreign key (COMM_HUB_FK) references `".$sDBName."`.HUB (HUB_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: LINK & LINKTYPE                                       */
		/*==============================================================*/
		case 'Link':
			$sSQL .= "alter table `".$sDBName."`.LINK \n";
			$sSQL .= "    add constraint FK_LINK_COMM foreign key (LINK_COMM_FK) references `".$sDBName."`.COMM (COMM_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINK_LINKCONN foreign key (LINK_LINKCONN_FK) references `".$sDBName."`.LINKCONN (LINKCONN_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINK_LINKINFO foreign key (LINK_LINKINFO_FK) references `".$sDBName."`.LINKINFO (LINKINFO_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINK_LINKTYPE foreign key (LINK_LINKTYPE_FK) references `".$sDBName."`.LINKTYPE (LINKTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINK_ROOMS foreign key (LINK_ROOMS_FK) references `".$sDBName."`.ROOMS (ROOMS_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: LINKINFO                                              */
		/*==============================================================*/
		case 'LinkInfo':
			$sSQL .= null;
			break;
			
		/*==============================================================*/
		/* Table: LINKCONN                                              */
		/*==============================================================*/
		case 'LinkConn1':
			//$sSQL .= "alter table `".$sDBName."`.LINKCONN add constraint FK_LINKCONN_LINKCRYPTTYPE foreign key (LINKCONN_LINKCRYPTTYPE_FK) references `".$sDBName."`.LINKCRYPTTYPE (LINKCRYPTTYPE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINKCONN add constraint FK_LINKCONN_LINKFREQ foreign key (LINKCONN_LINKFREQ_FK) references `".$sDBName."`.LINKFREQ (LINKFREQ_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINKCONN add constraint FK_LINKCONN_LINKPROTOCOL foreign key (LINKCONN_LINKPROTOCOL_FK) references `".$sDBName."`.LINKPROTOCOL (LINKPROTOCOL_PK) on delete restrict on update restrict; \n";
			
			
			$sSQL .= "alter table `".$sDBName."`.LINKCONN \n";
			$sSQL .= "    add constraint FK_LINKCONN_LINKCRYPTTYPE foreign key (LINKCONN_LINKCRYPTTYPE_FK) references `".$sDBName."`.LINKCRYPTTYPE (LINKCRYPTTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINKCONN_LINKFREQ foreign key (LINKCONN_LINKFREQ_FK) references `".$sDBName."`.LINKFREQ (LINKFREQ_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_LINKCONN_LINKPROTOCOL foreign key (LINKCONN_LINKPROTOCOL_FK) references `".$sDBName."`.LINKPROTOCOL (LINKPROTOCOL_PK) on delete restrict on update restrict; \n";
			
			
			break;
			
		/*==============================================================*/
		/* Table: LINKCRYPTTYPE & LINKFREQ                              */
		/*==============================================================*/
		case 'LinkConn2':
			$sSQL .= null;
			break;
			
		/*==============================================================*/
		/* Table: THING & THINGTYPE                                     */
		/*==============================================================*/
		case 'Thing':
			//$sSQL .= "alter table `".$sDBName."`.THING add constraint FK_THING_LINK foreign key (THING_LINK_FK) references `".$sDBName."`.LINK (LINK_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.THING add constraint FK_THING_THINGTYPE foreign key (THING_THINGTYPE_FK) references `".$sDBName."`.THINGTYPE (THINGTYPE_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.THING \n";
			$sSQL .= "    add constraint FK_THING_LINK foreign key (THING_LINK_FK) references `".$sDBName."`.LINK (LINK_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_THING_THINGTYPE foreign key (THING_THINGTYPE_FK) references `".$sDBName."`.THINGTYPE (THINGTYPE_PK) on delete restrict on update restrict; \n";
			
			break;
			
		/*==============================================================*/
		/* Table: IO & IOTYPE                                           */
		/*==============================================================*/
		case 'IO':
			//$sSQL .= "alter table `".$sDBName."`.IO add constraint FK_IO_THING foreign key (IO_THING_FK) references `".$sDBName."`.THING (THING_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.IO add constraint FK_SENSOR_RSTYPE foreign key (IO_RSTYPES_FK) references `".$sDBName."`.RSTYPE (RSTYPE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.IO add constraint FK_SENSOR_SENSORTYPE foreign key (IO_IOTYPE_FK) references `".$sDBName."`.IOTYPE (IOTYPE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.IO add constraint FK_SENSOR_UOM foreign key (IO_UOM_FK) references `".$sDBName."`.UOM (UOM_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.IO \n";
			$sSQL .= "    add constraint FK_IO_THING foreign key (IO_THING_FK) references `".$sDBName."`.THING (THING_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_SENSOR_RSTYPE foreign key (IO_RSTYPES_FK) references `".$sDBName."`.RSTYPE (RSTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_SENSOR_SENSORTYPE foreign key (IO_IOTYPE_FK) references `".$sDBName."`.IOTYPE (IOTYPE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_SENSOR_UOM foreign key (IO_UOM_FK) references `".$sDBName."`.UOM (UOM_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.IOTYPE add constraint FK_SENSORTYPE_DATATYPE foreign key (IOTYPE_DATATYPE_FK) references `".$sDBName."`.DATATYPE (DATATYPE_PK) on delete restrict on update restrict; \n";
			break;
		
		/*==============================================================*/
		/* Table: DATATINYINT & DATAINT                                 */
		/*==============================================================*/
		case 'Data1':
			$sSQL .= "alter table `".$sDBName."`.DATATINYINT add constraint FK_DATATINYINT_IO foreign key (DATATINYINT_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.DATAINT add constraint FK_DATAINT_IO foreign key (DATAINT_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATABIGINT & DATAFLOAT                                */
		/*==============================================================*/
		case 'Data2':
			$sSQL .= "alter table `".$sDBName."`.DATABIGINT add constraint FK_DATABIGINT_IO foreign key (DATABIGINT_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.DATAFLOAT add constraint FK_DATAFLOAT_IO foreign key (DATAFLOAT_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATATINYSTRING & DATASHORTSTRING                      */
		/*==============================================================*/
		case 'Data3':
			$sSQL .= "alter table `".$sDBName."`.DATATINYSTRING add constraint FK_DATATINYSTRING_IO foreign key (DATATINYSTRING_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.DATASHORTSTRING add constraint FK_DATASHORTSTRING_IO foreign key (DATASHORTSTRING_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATAMEDSTRING & DATALONGSTRING                        */
		/*==============================================================*/
		case 'Data4':
			$sSQL .= "alter table `".$sDBName."`.DATAMEDSTRING add constraint FK_DATAMEDSTRING_IO foreign key (DATAMEDSTRING_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.DATALONGSTRING add constraint FK_DATALONGSTRING_IO foreign key (DATALONGSTRING_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";

			break;
			
		/*==============================================================*/
		/* Table: DATABLOB                                              */
		/*==============================================================*/
		case 'Data5':
			$sSQL .= "alter table `".$sDBName."`.DATABLOB add constraint FK_DATABLOB_IO foreign key (DATABLOB_IO_FK) references `".$sDBName."`.IO (IO_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: DATATYPE                                              */
		/*==============================================================*/
		case 'Datatype':
			$sSQL .= null;
			break;
			
		/*==============================================================*/
		/* Table: RSTARIFF & RSTYPE                                     */
		/*==============================================================*/
		case 'RSType':
			$sSQL .= "alter table `".$sDBName."`.RSTYPE add constraint FK_RSTYPE_RSTARIFF foreign key (RSTYPE_RSTARIFF_FK) references `".$sDBName."`.RSTARIFF (RSTARIFF_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.RSTARIFF add constraint FK_RSTARIFF_RSSUBCAT foreign key (RSTARIFF_RSSUBCAT_FK) references `".$sDBName."`.RSSUBCAT (RSSUBCAT_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.RSSUBCAT add constraint FK_RSSUBCAT_RSCAT foreign key (RSSUBCAT_RSCAT_FK) references `".$sDBName."`.RSCAT (RSCAT_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: UOMCAT & UOMSUBCAT & UOM                              */
		/*==============================================================*/
		case 'UoM':
			$sSQL .= "alter table `".$sDBName."`.UOM add constraint FK_UOM_UOMSUBCAT foreign key (UOM_UOMSUBCAT_FK) references `".$sDBName."`.UOMSUBCAT (UOMSUBCAT_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.UOMSUBCAT add constraint FK_UOMSUBCAT_UOMCAT foreign key (UOMSUBCAT_UOMCAT_FK) references `".$sDBName."`.UOMCAT (UOMCAT_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: TARGET                                                */
		/*==============================================================*/
		case 'Target':
			$sSQL .= null;
			break;
		/*==============================================================*/
		/* Table: RULE1                                                 */
		/*==============================================================*/
		case 'Rule1':
			$sSQL .= "alter table `".$sDBName."`.`RULE1` add constraint FK_REFERENCE_109 foreign key (`RULE1_HUB_FK`) references `".$sDBName."`.HUB (`HUB_PK`) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.`RULE1` add constraint FK_REFERENCE_78 foreign key (`RULE1_RULE1TYPE_FK`) references `".$sDBName."`.`RULE1TYPE` (`RULE1TYPE_PK`) on delete restrict on update restrict; \n";
			break;
		/*==============================================================*/
		/* ERROR: UNSUPPORTED PARAMETER                                 */
		/*==============================================================*/
		default:
			$sSQL = null;
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results                           --//
	//----------------------------------------------------//
	return $sSQL;
}


function DB_FetchCreateViewsSQL( $sDBName, $sViewName ) {
/*
	3.01 - PublicRSCat
	3.02 - PublicRSSubCat
	3.03 - PublicRSTariff
	3.04 - PublicRSTypes
	3.05 - PublicUoM
	3.06 - PublicRegions
	3.07 - PublicCurrencies
	3.08 - PublicLanguages
	3.09 - PublicPostcodes
	3.10 - PublicSubRegion
	3.11 - PublicTimezones
	3.12 - PublicGenders
	3.13 - PublicRoomTypes
	3.14 - PublicLinkTypes
	3.15 - PublicPremiseBedrooms
	3.16 - PublicPremiseFloors
	3.17 - PublicPremiseRooms
	3.18 - PublicPremiseOccupants
	
	4.01 - PrivateUsersInfo
	4.02 - PrivateUsersPremises
	4.03 - PrivateUsersPremiseLocations
	4.04 - PrivateUsersPremiseLog
	4.05 - PrivateUsersHub
	4.06 - PrivateUsersComm
	4.07 - PrivateUsersPremiseRooms
	4.08 - PrivateUsersRooms
	4.09 - PrivateUsersLink
	4.10 - PrivateUsersThing
	4.11 - PrivateUsersIO
	4.12 - PrivateUserServerPerms
	
	5.01 - PrivateDataTinyInt
	5.02 - PrivateDataInt
	5.03 - PrivateDataBigInt
	5.04 - PrivateDataFloat
	5.05 - PrivateDataTinyString
	5.06 - PrivateDataShortString
	5.07 - PrivateDataMedString
	5.08 - PrivateDataLongString
	5.09 - PrivateData255String
	5.21 - PrivateDataTinyIntEnum
	5.22 - PrivateDataIntEnum
	5.23 - PrivateDataBigIntEnum
	
	6.01 - WatchInputsHub
	6.02 - WatchInputsPremise
	6.03 - WatchInputsComm
	6.04 - WatchInputsLink
	6.05 - WatchInputsThing
	6.06 - WatchInputsIO
*/
	
	$sSQL = "";
	
	
	switch( $sViewName ) {
		/*============================================================
		  == #3.1# - RSCAT                                          ==
		  ============================================================*/
		case "PublicRSCat":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_RSCAT` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSCAT_FORMUTILITY` \n";
			$sSQL .= "FROM `".$sDBName."`.`RSCAT`; \n";
			break;
			
		/*============================================================
		  == #3.2# - RSSUBCAT                                       ==
		  ============================================================*/
		case "PublicRSSubCat":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_RSSUBCAT` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE` \n";
			$sSQL .= "FROM `".$sDBName."`.`RSCAT` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSSUBCAT` ON `RSCAT_PK`=`RSSUBCAT_RSCAT_FK`; \n";
			break;
			
		/*============================================================
		  == #3.3# - RSTARIFF                                       ==
		  ============================================================*/
		case "PublicRSTariff":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_RSTARIFF` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`RSCAT` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSSUBCAT` ON `RSCAT_PK`=`RSSUBCAT_RSCAT_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSTARIFF` ON `RSSUBCAT_PK`=`RSTARIFF_RSSUBCAT_FK`;\n";
			break;
			
		/*============================================================
		  == #3.4# - RSTYPES                                        ==
		  ============================================================*/
		case "PublicRSTypes":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_RSTYPES` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN` \n";
			$sSQL .= "FROM `".$sDBName."`.`RSCAT` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSSUBCAT` ON `RSCAT_PK`=`RSSUBCAT_RSCAT_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSTARIFF` ON `RSSUBCAT_PK`=`RSTARIFF_RSSUBCAT_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`RSTYPE` ON `RSTARIFF_PK`=`RSTYPE_RSTARIFF_FK`;\n";
			break;
			
		/*============================================================
		  == #3.5# - UOMS                                           ==
		  ============================================================*/
		case "PublicUoM":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_UOMS` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`UOMCAT` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOMCAT_PK`=`UOMSUBCAT_UOMCAT_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`UOM` ON `UOMSUBCAT_PK`=`UOM_UOMSUBCAT_FK`;\n";
			break;
			
		/*============================================================
		  == #3.6# - Public Regions                                 ==
		  ============================================================*/
		case "PublicRegion":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_REGION` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `REGION_PK`, \n";
			$sSQL .= "    `REGION_NAME`, \n";
			$sSQL .= "    `REGION_NAME2` \n";
			$sSQL .= "FROM `".$sDBName."`.`REGION`; \n";
			break;
			
		/*============================================================
		  == #3.7# - CURRENCIES                                     ==
		  ============================================================*/
		case "PublicCurrencies":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_CURRENCIES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `CURRENCIES_PK`, \n";
			$sSQL .= "    `CURRENCIES_NAME`, \n";
			$sSQL .= "    `CURRENCIES_ABREVIATION`, \n";
			$sSQL .= "    `REGION_PK`, \n";
			$sSQL .= "    `REGION_NAME`, \n";
			$sSQL .= "    `REGION_NAME2` \n";
			$sSQL .= "FROM `".$sDBName."`.`CURRENCIES` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`REGION` ON `CURRENCIES_PK`=`REGION_CURRENCIES_FK`;\n";
			break;
			
		/*============================================================
		  == #3.8# - LANGUAGES                                      ==
		  ============================================================*/
		case "PublicLanguages":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_LANGUAGES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `LANGUAGE_PK`, \n";
			$sSQL .= "    `LANGUAGE_NAME`, \n";
			$sSQL .= "    `LANGUAGE_ENCODING` \n";
			$sSQL .= "FROM `".$sDBName."`.`LANGUAGE`; \n";
			break;
			
			
		/*============================================================
		  == #3.11# - TIMEZONES                                     ==
		  ============================================================*/
		case "PublicTimezones":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_TIMEZONES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `TIMEZONE_PK`, \n";
			$sSQL .= "    `TIMEZONE_CC`, \n";
			$sSQL .= "    `TIMEZONE_LATITUDE`, \n";
			$sSQL .= "    `TIMEZONE_LONGITUDE`, \n";
			$sSQL .= "    `TIMEZONE_TZ` \n";
			$sSQL .= "FROM `".$sDBName."`.`TIMEZONE`;\n";
			break;
			
		/*============================================================
		  == #3.12# - GENDERS                                       ==
		  ============================================================*/
		case "PublicGenders":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_USERSGENDER` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `USERSGENDER_PK`, \n";
			$sSQL .= "    `USERSGENDER_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERSGENDER`;\n";
			break;
			
		/*============================================================
		  == #3.13# - ROOM TYPES                                    ==
		  ============================================================*/
		case "PublicRoomTypes":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_ROOMTYPE` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `ROOMTYPE_PK`, \n";
			$sSQL .= "    `ROOMTYPE_NAME`, \n";
			$sSQL .= "    `ROOMTYPE_OUTDOORS` \n";
			$sSQL .= "FROM `".$sDBName."`.`ROOMTYPE`;\n";
			break;
			
		/*============================================================
		  == #3.14# - LINK TYPES                                    ==
		  ============================================================*/
		case "PublicLinkTypes":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_LINKTYPE` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `LINKTYPE_PK`, \n";
			$sSQL .= "    `LINKTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`LINKTYPE`; \n";
			break;
			
		/*============================================================
		  == #3.15# - PREMISE BEDROOMS                              ==
		  ============================================================*/
		case "PublicPremiseBedrooms":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_PREMISEBEDROOMS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `PREMISEBEDROOMS_PK`, \n";
			$sSQL .= "    `PREMISEBEDROOMS_COUNT` \n";
			$sSQL .= "FROM `".$sDBName."`.`PREMISEBEDROOMS`; \n";
			break;
			
		/*============================================================
		  == #3.16# - PREMISE FLOORS                                ==
		  ============================================================*/
		case "PublicPremiseFloors":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_PREMISEFLOORS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `PREMISEFLOORS_PK`, \n";
			$sSQL .= "    `PREMISEFLOORS_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`PREMISEFLOORS`; \n";
			break;
			
		/*============================================================
		  == #3.17# - PREMISE ROOMS                                 ==
		  ============================================================*/
		case "PublicPremiseRooms":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_PREMISEROOMS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `PREMISEROOMS_PK`, \n";
			$sSQL .= "    `PREMISEROOMS_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`PREMISEROOMS`; \n";
			break;
			
		/*============================================================
		  == #3.18# - PREMISE OCCUPANTS                             ==
		  ============================================================*/
		case "PublicPremiseOccupants":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_PREMISEOCCUPANTS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `PREMISEOCCUPANTS_PK`, \n";
			$sSQL .= "    `PREMISEOCCUPANTS_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`PREMISEOCCUPANTS`; \n";
			break;
			
		/*============================================================
		  == #4.01# - USERSINFO                                     ==
		  ============================================================*/
		case "PrivateUsersInfo":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSINFO` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_STATE`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMSERVER_ADDUSER`, \n";
			$sSQL .= "	`USERADDRESS_PK`, \n";
			$sSQL .= "	`USERADDRESS_LINE3`, \n";
			$sSQL .= "	`USERADDRESS_LINE2`, \n";
			$sSQL .= "	`USERADDRESS_LINE1`, \n";
			$sSQL .= "	`USERADDRESS_POSTCODE`, \n";
			$sSQL .= "	`USERADDRESS_SUBREGION`, \n";
			$sSQL .= "	`REGION_PK`, \n";
			$sSQL .= "	`REGION_NAME`, \n";
			$sSQL .= "	`REGION_NAME2`, \n";
			$sSQL .= "	`LANGUAGE_PK`, \n";
			$sSQL .= "	`LANGUAGE_NAME`, \n";
			$sSQL .= "	`LANGUAGE_ENCODING`, \n";
			$sSQL .= "	`TIMEZONE_PK`, \n";
			$sSQL .= "	`TIMEZONE_CC`, \n";
			$sSQL .= "	`TIMEZONE_LATITUDE`, \n";
			$sSQL .= "	`TIMEZONE_LONGITUDE`, \n";
			$sSQL .= "	`TIMEZONE_TZ`, \n";
			$sSQL .= "	`USERSINFO_PK`, \n";
			$sSQL .= "	`USERSINFO_TITLE`, \n";
			$sSQL .= "	`USERSINFO_GIVENNAMES`, \n";
			$sSQL .= "	`USERSINFO_SURNAMES`, \n";
			$sSQL .= "	`USERSINFO_DISPLAYNAME`, \n";
			$sSQL .= "	`USERSINFO_EMAIL`, \n";
			$sSQL .= "	`USERSINFO_PHONENUMBER`, \n";
			$sSQL .= "	`USERSINFO_DOB`, \n";
			$sSQL .= "	`USERSGENDER_PK`, \n";
			$sSQL .= "	`USERSGENDER_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PERMSERVER` ON `USERS_PK` = `PERMSERVER_USERS_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERADDRESS` ON `USERS_PK`=`USERADDRESS_USERS_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LANGUAGE` ON `USERADDRESS_LANGUAGE_FK`=`LANGUAGE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`REGION` ON `USERADDRESS_REGION_FK`=`REGION_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`TIMEZONE` ON `USERADDRESS_TIMEZONE_FK`=`TIMEZONE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERSINFO` ON `USERS_USERSINFO_FK`=`USERSINFO_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERSGENDER` ON `USERSINFO_USERSGENDER_FK`=`USERSGENDER_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%');\n";
			break;
			
		/*============================================================
		  == #4.02# - USERSPREMISES                                 ==
		  ============================================================*/
		case "PrivateUsersPremises":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSPREMISES` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMPREMISE_OWNER`, \n";
			$sSQL .= "	`PERMPREMISE_WRITE`, \n";
			$sSQL .= "	`PERMPREMISE_STATETOGGLE`, \n";
			$sSQL .= "	`PERMPREMISE_READ`, \n";
			$sSQL .= "	`PERMPREMISE_ROOMADMIN`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`PREMISEFLOORS_PK`, \n";
			$sSQL .= "	`PREMISEFLOORS_NAME`, \n";
			$sSQL .= "	`PREMISEINFO_PK`, \n";
			$sSQL .= "	`PREMISEROOMS_PK`, \n";
			$sSQL .= "	`PREMISEROOMS_NAME`, \n";
			$sSQL .= "	`PREMISEBEDROOMS_PK`, \n";
			$sSQL .= "	`PREMISEBEDROOMS_COUNT`, \n";
			$sSQL .= "	`PREMISEOCCUPANTS_PK`, \n";
			$sSQL .= "	`PREMISEOCCUPANTS_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PREMISE_PK`=`PERMPREMISE_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEINFO` ON `PREMISE_PREMISEINFO_FK`=`PREMISEINFO_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEBEDROOMS` ON `PREMISEINFO_PREMISEBEDROOMS_FK`=`PREMISEBEDROOMS_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEOCCUPANTS` ON `PREMISEINFO_PREMISEOCCUPANTS_FK`=`PREMISEOCCUPANTS_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEROOMS` ON `PREMISEINFO_PREMISEROOMS_FK`=`PREMISEROOMS_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEFLOORS` ON `PREMISEINFO_PREMISEFLOORS_FK`=`PREMISEFLOORS_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMPREMISE_READ` = 1;\n";
			break;
			
		/*============================================================
		  == #4.03# - USERSPREMISELOCATIONS                         ==
		  ============================================================*/
		case "PrivateUsersPremiseLocations":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSPREMISELOCATIONS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "    `USERS_PK`, \n";
			$sSQL .= "    `USERS_USERNAME`, \n";
			$sSQL .= "    `PERMPREMISE_OWNER`,\n";
			$sSQL .= "    `PERMPREMISE_WRITE`, \n";
			$sSQL .= "    `PERMPREMISE_STATETOGGLE`, \n";
			$sSQL .= "    `PERMPREMISE_READ`, \n";
			$sSQL .= "    `PERMPREMISE_ROOMADMIN`, \n";
			$sSQL .= "    `PREMISE_PK`, \n";
			$sSQL .= "    `PREMISE_NAME`, \n";
			$sSQL .= "    `PREMISE_DESCRIPTION`, \n";
			$sSQL .= "    `PREMISEADDRESS_PK`, \n";
			$sSQL .= "    `PREMISEADDRESS_LINE1`, \n";
			$sSQL .= "    `PREMISEADDRESS_LINE2`, \n";
			$sSQL .= "    `PREMISEADDRESS_LINE3`, \n";
			$sSQL .= "    `PREMISEADDRESS_POSTCODE`, \n";
			$sSQL .= "    `PREMISEADDRESS_SUBREGION`, \n";
			$sSQL .= "    `LANGUAGE_PK`, \n";
			$sSQL .= "    `LANGUAGE_NAME`, \n";
			$sSQL .= "    `LANGUAGE_ENCODING`, \n";
			$sSQL .= "    `REGION_PK`, \n";
			$sSQL .= "    `REGION_NAME`, \n";
			$sSQL .= "    `REGION_NAME2`, \n";
			$sSQL .= "    `TIMEZONE_PK`, \n";
			$sSQL .= "    `TIMEZONE_CC`, \n";
			$sSQL .= "    `TIMEZONE_LATITUDE`, \n";
			$sSQL .= "    `TIMEZONE_LONGITUDE`, \n";
			$sSQL .= "    `TIMEZONE_TZ` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS`  \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PREMISE_PK`=`PERMPREMISE_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISEADDRESS` ON `PREMISE_PK`=`PREMISEADDRESS_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LANGUAGE` ON `PREMISEADDRESS_LANGUAGE_FK`=`LANGUAGE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`REGION` ON `PREMISEADDRESS_REGION_FK`=`REGION_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`TIMEZONE` ON `PREMISEADDRESS_TIMEZONE_FK`=`TIMEZONE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMPREMISE_READ` = 1; \n";
			break;
			
		/*============================================================
		  == #4.04# - USERSPREMISELOG                               ==
		  ============================================================*/
		case "PrivateUsersPremiseLog":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSPREMISELOG` AS \n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`PERMPREMISE_READ` AS \"PERMISSIONS_READ\", \n";
			$sSQL .= "	`PREMISELOGACTION_NAME`, \n";
			$sSQL .= "	`PREMISELOGACTION_DESC`, \n";
			$sSQL .= "	`PREMISELOG_USERS_FK`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`PREMISELOGACTION_PK`, \n";
			$sSQL .= "	`PREMISELOG_PK`, \n";
			$sSQL .= "	`PREMISELOG_UTS`, \n";
			$sSQL .= "	`PREMISELOG_CUSTOM1`, \n";
			$sSQL .= "	`USERSINFO_DISPLAYNAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` AS `USERS_1` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_1`.`USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PERMPREMISE_PREMISE_FK`=`PREMISE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISELOG` ON `PREMISE_PK`=`PREMISELOG_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERS` ON `PREMISELOG_USERS_FK`=`USERS_1`.`USERS_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERSINFO` ON `USERS_1`.`USERS_USERSINFO_FK`=`USERSINFO_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PREMISELOGACTION` ON `PREMISELOG_PREMISELOGACTION_FK`=`PREMISELOGACTION_PK` \n";
			$sSQL .= "WHERE `PERMPREMISE_READ` = 1 \n";
			$sSQL .= "AND `USERS_1`.`USERS_PK` = (\n";
			$sSQL .= "	SELECT `USERS_PK` \n";
			$sSQL .= "	FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "	WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%')\n";
			$sSQL .= ");\n";
			break;
			
		/*============================================================
		  == #4.05# - USERSHUB                                      ==
		  ============================================================*/
		case "PrivateUsersHub":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSHUB` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMPREMISE_OWNER`, \n";
			$sSQL .= "	`PERMPREMISE_WRITE`, \n";
			$sSQL .= "	`PERMPREMISE_STATETOGGLE`, \n";
			$sSQL .= "	`PERMPREMISE_READ`, \n";
			$sSQL .= "	`PERMPREMISE_ROOMADMIN`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`HUB_SERIALNUMBER`, \n";
			$sSQL .= "	`HUB_IPADDRESS`, \n";
			$sSQL .= "	`HUBTYPE_PK`, \n";
			$sSQL .= "	`HUBTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PREMISE_PK`=`PERMPREMISE_PREMISE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `PREMISE_PK`=`HUB_PREMISE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUBTYPE` ON `HUB_HUBTYPE_FK`=`HUBTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMPREMISE_READ` = 1;\n";
			break;
			
			
		/*============================================================
		  == #4.06# - USERSCOMM                                     ==
		  ============================================================*/
		case "PrivateUsersComm":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSCOMM` AS \n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMPREMISE_OWNER`, \n";
			$sSQL .= "	`PERMPREMISE_WRITE`, \n";
			$sSQL .= "	`PERMPREMISE_STATETOGGLE`, \n";
			$sSQL .= "	`PERMPREMISE_READ`, \n";
			$sSQL .= "	`PERMPREMISE_ROOMADMIN`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`HUB_SERIALNUMBER`, \n";
			$sSQL .= "	`HUB_IPADDRESS`, \n";
			$sSQL .= "	`HUBTYPE_PK`, \n";
			$sSQL .= "	`HUBTYPE_NAME`, \n";
			$sSQL .= "	`COMM_PK`, \n";
			$sSQL .= "	`COMM_NAME`, \n";
			$sSQL .= "	`COMM_JOINMODE`, \n";
			$sSQL .= "	`COMM_ADDRESS`, \n";
			$sSQL .= "	`COMMTYPE_PK`, \n";
			$sSQL .= "	`COMMTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PREMISE_PK`=`PERMPREMISE_PREMISE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `PREMISE_PK`=`HUB_PREMISE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUBTYPE` ON `HUB_HUBTYPE_FK`=`HUBTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMM` ON `COMM_HUB_FK`=`HUB_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMMTYPE` ON `COMM_COMMTYPE_FK`=`COMMTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMPREMISE_READ` = 1;\n";
			break;
			
		/*============================================================
		  == #4.07# - USERSPREMISEROOMS                             ==
		  ============================================================*/
		case "PrivateUsersPremiseRooms":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSPREMISEROOMS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMPREMISE_OWNER`, \n";
			$sSQL .= "	`PERMPREMISE_WRITE`, \n";
			$sSQL .= "	`PERMPREMISE_STATETOGGLE`, \n";
			$sSQL .= "	`PERMPREMISE_READ`, \n";
			$sSQL .= "	`PERMPREMISE_ROOMADMIN`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`ROOMS_DESC`, \n";
			$sSQL .= "	`ROOMTYPE_PK`, \n";
			$sSQL .= "	`ROOMTYPE_NAME`, \n";
			$sSQL .= "	`ROOMTYPE_OUTDOORS` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMPREMISE` ON `USERS_PK`=`PERMPREMISE_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PREMISE` ON `PREMISE_PK`=`PERMPREMISE_PREMISE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `PREMISE_PK`=`ROOMS_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`ROOMTYPE` ON `ROOMS_ROOMTYPE_FK`=`ROOMTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMPREMISE_READ` = 1 AND `PERMPREMISE_ROOMADMIN` = 1;\n";
			break;
			
		/*============================================================
		  == #4.08# - USERSROOMS                                    ==
		  ============================================================*/
		case "PrivateUsersRooms":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSROOMS` AS \n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`ROOMS_DESC`, \n";
			$sSQL .= "	`ROOMTYPE_PK`, \n";
			$sSQL .= "	`ROOMTYPE_NAME`, \n";
			$sSQL .= "	`ROOMTYPE_OUTDOORS` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`ROOMTYPE` ON `ROOMS_ROOMTYPE_FK`=`ROOMTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMROOMS_READ` = 1;\n";
			break;
			
			
			
		/*============================================================
		  == #4.09# - USERSLINK                                     ==
		  ============================================================*/
		case "PrivateUsersLink":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSLINK` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_DESC`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINK_COMM_FK`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`LINKINFO_PK`, \n";
			$sSQL .= "	`LINKINFO_NAME`, \n";
			$sSQL .= "	`LINKINFO_MANUFACTURER`, \n";
			$sSQL .= "	`LINKINFO_MANUFACTURERURL`, \n";
			$sSQL .= "	`LINKCONN_PK`, \n";
			$sSQL .= "	`LINKCONN_NAME`, \n";
			$sSQL .= "	`LINKCONN_ADDRESS`, \n";
			$sSQL .= "	`LINKCONN_USERNAME`, \n";
			$sSQL .= "	`LINKCONN_PASSWORD`, \n";
			$sSQL .= "	`LINKCONN_PORT`, \n";
			$sSQL .= "	`LINKPROTOCOL_PK`, \n";
			$sSQL .= "	`LINKPROTOCOL_NAME`, \n";
			$sSQL .= "	`LINKCRYPTTYPE_PK`, \n";
			$sSQL .= "	`LINKCRYPTTYPE_NAME`, \n";
			$sSQL .= "	`LINKFREQ_PK`, \n";
			$sSQL .= "	`LINKFREQ_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINK_LINKTYPE_FK`=`LINKTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKINFO` ON `LINK_LINKINFO_FK`=`LINKINFO_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKCONN` ON `LINK_LINKCONN_FK`=`LINKCONN_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKPROTOCOL` ON `LINKCONN_LINKPROTOCOL_FK`=`LINKPROTOCOL_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKFREQ` ON `LINKCONN_LINKFREQ_FK`=`LINKFREQ_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKCRYPTTYPE` ON `LINKCONN_LINKCRYPTTYPE_FK`=`LINKCRYPTTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMROOMS_READ` = 1;\n";
			break;
			
		/*============================================================
		  == #4.10# - USERSTHING                                    ==
		  ============================================================*/
		case "PrivateUsersThing":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSTHING` AS \n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINK_COMM_FK`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THING_SERIALCODE`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THINGTYPE` ON `THINGTYPE_PK`=`THING_THINGTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMROOMS_READ` = 1;\n";
			break;
			
		/*============================================================
		  == #4.11# - USERSIO                                       ==
		  ============================================================*/
		case "PrivateUsersIO":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSIO` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_COMM_FK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THING_SERIALCODE`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`IOTYPE_DATATYPE_FK`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINK_LINKTYPE_FK`=`LINKTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_READ` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0; \n";
			break;
			
			
		/*============================================================
		  == #4.12# - USERSSERVERPERMS                              ==
		  ============================================================*/
		case "PrivateUsersServerPerms":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSSERVERPERMS` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`USERS_USERNAME`, \n";
			$sSQL .= "	`PERMSERVER_PK`, \n";
			$sSQL .= "	`PERMSERVER_ADDUSER`, \n";
			$sSQL .= "	`PERMSERVER_ADDPREMISEHUB`, \n";
			$sSQL .= "	`PERMSERVER_UPGRADE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`PERMSERVER` ON `USERS_PK` = `PERMSERVER_USERS_FK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%'); \n";
			break;
			
			
		/*============================================================
		  == #5.1# - VR_DATATINYINT                                 ==
		  ============================================================*/
		case "PrivateDataTinyInt":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATATINYINT` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	(`DATATINYINT_VALUE` / `IO_BASECONVERT`) AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATATINYINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATATINYINT_PK`, \n";
			$sSQL .= "	`DATATINYINT_DATE`, \n";
			$sSQL .= "	`DATATINYINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATINYINT` ON `IO_PK`=`DATATINYINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `IOTYPE_ENUM` <> 1\n";
			$sSQL .= "AND `DATATYPE_PK` = 1;\n";
			break;
			
		/*============================================================
		  == #5.2# - VR_DATAINT                                     ==
		  ============================================================*/
		case "PrivateDataInt":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATAINT` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	(`DATAINT_VALUE` / `IO_BASECONVERT`) AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATAINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATAINT_PK`, \n";
			$sSQL .= "	`DATAINT_DATE`, \n";
			$sSQL .= "	`DATAINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATAINT` ON `IO_PK`=`DATAINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `IOTYPE_ENUM` <> 1\n";
			$sSQL .= "AND `DATATYPE_PK` = 2;\n";
			break;
		
		/*============================================================
		  == #5.3# - VR_DATABIGINT                                  ==
		  ============================================================*/
		case "PrivateDataBigInt":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATABIGINT` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	(`DATABIGINT_VALUE` / `IO_BASECONVERT`) AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATABIGINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATABIGINT_PK`, \n";
			$sSQL .= "	`DATABIGINT_DATE`, \n";
			$sSQL .= "	`DATABIGINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATABIGINT` ON `IO_PK`=`DATABIGINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `IOTYPE_ENUM` <> 1\n";
			$sSQL .= "AND `DATATYPE_PK` = 3;\n";
			break;
			
		/*============================================================
		  == #5.4# - VR_DATAFLOAT                                   ==
		  ============================================================*/
		case "PrivateDataFloat":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATAFLOAT` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	(`DATAFLOAT_VALUE` / `IO_BASECONVERT`) AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATAFLOAT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATAFLOAT_PK`, \n";
			$sSQL .= "	`DATAFLOAT_DATE`, \n";
			$sSQL .= "	`DATAFLOAT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATAFLOAT` ON `IO_PK`=`DATAFLOAT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `IOTYPE_ENUM` <> 1\n";
			$sSQL .= "AND `DATATYPE_PK` = 4;\n";
			break;
			
		/*============================================================
		  == #5.5# - VR_DATATINYSTRING                              ==
		  ============================================================*/
		case "PrivateDataTinyString":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATATINYSTRING` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`DATATINYSTRING_VALUE` AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATATINYSTRING_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATATINYSTRING_PK`, \n";
			$sSQL .= "	`DATATINYSTRING_DATE`, \n";
			$sSQL .= "	`DATATINYSTRING_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATINYSTRING` ON `IO_PK`=`DATATINYSTRING_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `DATATYPE_PK` = 5; \n";
			break;
			
		/*============================================================
		  == #5.6# - VR_DATASHORTSTRING                             ==
		  ============================================================*/
		case "PrivateDataShortString":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATASHORTSTRING` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`DATASHORTSTRING_VALUE` AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATASHORTSTRING_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATASHORTSTRING_PK`, \n";
			$sSQL .= "	`DATASHORTSTRING_DATE`, \n";
			$sSQL .= "	`DATASHORTSTRING_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATASHORTSTRING` ON `IO_PK`=`DATASHORTSTRING_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `DATATYPE_PK` = 6;\n";
			break;

		/*============================================================
		  == #5.7# - VR_DATAMEDSTRING                               ==
		  ============================================================*/
		case "PrivateDataMedString":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATAMEDSTRING` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`DATAMEDSTRING_VALUE` AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATAMEDSTRING_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATAMEDSTRING_PK`, \n";
			$sSQL .= "	`DATAMEDSTRING_DATE`, \n";
			$sSQL .= "	`DATAMEDSTRING_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATAMEDSTRING` ON `IO_PK`=`DATAMEDSTRING_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `DATATYPE_PK` = 7;\n";
			break;
			

		/*============================================================
		  == #5.8# - VR_DATALONGSTRING                              ==
		  ============================================================*/
		case "PrivateDataLongString":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATALONGSTRING` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`DATALONGSTRING_VALUE` AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATALONGSTRING_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATALONGSTRING_PK`, \n";
			$sSQL .= "	`DATALONGSTRING_DATE`, \n";
			$sSQL .= "	`DATALONGSTRING_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATALONGSTRING` ON `IO_PK`=`DATALONGSTRING_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `DATATYPE_PK` = 8;\n";
			break;
			
		/*============================================================
		  == #5.9# - VR_DATASTRING255                               ==
		  ============================================================*/
		case "PrivateDataString255":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATASTRING255` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`DATASTRING255_VALUE` AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATASTRING255_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATASTRING255_PK`, \n";
			$sSQL .= "	`DATASTRING255_DATE`, \n";
			$sSQL .= "	`DATASTRING255_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATASTRING255` ON `IO_PK`=`DATASTRING255_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0 \n";
			$sSQL .= "AND `DATATYPE_PK` = 9;\n";
			break;

		/*============================================================
		  == #5.21# - VR_DATATINYINT                                ==
		  ============================================================*/
		case "PrivateDataTinyIntEnum":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATATINYINTENUM` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	(`DATATINYINT_VALUE` / `IO_BASECONVERT`) AS \"CALCEDVALUE\", \n";
			$sSQL .= "	`DATATINYINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATATINYINT_PK`, \n";
			$sSQL .= "	`DATATINYINT_DATE`, \n";
			$sSQL .= "	`DATATINYINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATINYINT` ON `IO_PK`=`DATATINYINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `DATATYPE_PK` = 1;\n";
			break;
			
		/*============================================================
		  == #5.22# - VR_DATAINTENUM                                ==
		  ============================================================*/
		case "PrivateDataIntEnum":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATAINTENUM` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`DATAINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATAINT_PK`, \n";
			$sSQL .= "	`DATAINT_DATE`, \n";
			$sSQL .= "	`DATAINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATAINT` ON `IO_PK`=`DATAINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `DATATYPE_PK` = 2;\n";
			break;
		
		/*============================================================
		  == #5.23# - VR_DATABIGINTENUM                             ==
		  ============================================================*/
		case "PrivateDataBigIntEnum":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_DATABIGINTENUM` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`DATABIGINT_DATE` AS \"UTS\", \n";
			$sSQL .= "	`DATABIGINT_PK`, \n";
			$sSQL .= "	`DATABIGINT_DATE`, \n";
			$sSQL .= "	`DATABIGINT_VALUE`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`PERMROOMS_READ`, \n";
			$sSQL .= "	`PERMROOMS_WRITE`, \n";
			$sSQL .= "	`PERMROOMS_STATETOGGLE`, \n";
			$sSQL .= "	`PERMROOMS_DATAREAD`, \n";
			$sSQL .= "	`ROOMS_PK`, \n";
			$sSQL .= "	`ROOMS_NAME`, \n";
			$sSQL .= "	`ROOMS_FLOOR`, \n";
			$sSQL .= "	`ROOMS_PREMISE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMROOMS` ON `USERS_PK`=`PERMROOMS_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`ROOMS` ON `ROOMS_PK`=`PERMROOMS_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `ROOMS_PK`=`LINK_ROOMS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATABIGINT` ON `IO_PK`=`DATABIGINT_IO_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') \n";
			$sSQL .= "AND `PERMROOMS_DATAREAD` = 1 \n";
			$sSQL .= "AND `DATATYPE_PK` = 3;\n";
			break;


		/*============================================================
		  == #6.01# - WATCHINPUTSHUB                                ==
		  ============================================================*/
		case "WatchInputsHub":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_HUB` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`HUB_SERIALNUMBER`, \n";
			$sSQL .= "	`HUB_IPADDRESS`, \n";
			$sSQL .= "	`HUBTYPE_PK`, \n";
			$sSQL .= "	`HUBTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMHUB` ON `USERS_PK`=`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `HUB_PK`=`PERMHUB_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUBTYPE` ON `HUB_HUBTYPE_FK`=`HUBTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1;\n";
			break;
			
			
		/*============================================================
		  == #6.02# - WATCHINPUTSPREMISE                            ==
		  ============================================================*/
		case "WatchInputsPremise":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_PREMISE` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`HUB_SERIALNUMBER`, \n";
			$sSQL .= "	`HUB_IPADDRESS`, \n";
			$sSQL .= "	`PREMISE_PK`, \n";
			$sSQL .= "	`PREMISE_NAME`, \n";
			$sSQL .= "	`PREMISE_DESCRIPTION`, \n";
			$sSQL .= "	`PREMISEADDRESS_PK`, \n";
			$sSQL .= "	`PREMISEADDRESS_LINE1`, \n";
			$sSQL .= "	`PREMISEADDRESS_LINE2`, \n";
			$sSQL .= "	`PREMISEADDRESS_LINE3`, \n";
			$sSQL .= "	`PREMISEADDRESS_POSTCODE`, \n";
			$sSQL .= "	`PREMISEADDRESS_SUBREGION`, \n";
			$sSQL .= "	`LANGUAGE_PK`, \n";
			$sSQL .= "	`LANGUAGE_NAME`, \n";
			$sSQL .= "	`LANGUAGE_ENCODING` \n";
			$sSQL .= "	`REGION_PK`, \n";
			$sSQL .= "	`REGION_NAME`, \n";
			$sSQL .= "	`REGION_NAME2`, \n";
			$sSQL .= "	`TIMEZONE_PK`, \n";
			$sSQL .= "	`TIMEZONE_CC`, \n";
			$sSQL .= "	`TIMEZONE_LATITUDE`, \n";
			$sSQL .= "	`TIMEZONE_LONGITUDE`, \n";
			$sSQL .= "	`TIMEZONE_TZ` \n";
			$sSQL .= "FROM `USERS` \n";
			$sSQL .= "INNER JOIN `PERMHUB` ON `USERS`.`USERS_PK` = `PERMHUB`.`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `HUB` ON `HUB`.`HUB_PK` = `PERMHUB`.`PERMHUB_HUB_FK` \n";
			$sSQL .= "LEFT JOIN `PREMISE` ON `HUB`.`HUB_PREMISE_FK` = `PREMISE`.`PREMISE_PK` \n";
			$sSQL .= "LEFT JOIN `PREMISEADDRESS` ON `PREMISE`.`PREMISE_PK` = `PREMISEADDRESS`.`PREMISEADDRESS_PREMISE_FK` \n";
			$sSQL .= "LEFT JOIN `LANGUAGE` ON `PREMISEADDRESS`.`PREMISEADDRESS_LANGUAGE_FK` = `LANGUAGE`.`LANGUAGE_PK` \n";
			$sSQL .= "LEFT JOIN `REGION` ON `PREMISEADDRESS`.`PREMISEADDRESS_REGION_FK` = `REGION`.`REGION_PK`  \n";
			$sSQL .= "LEFT JOIN `TIMEZONE` ON `PREMISEADDRESS`.`PREMISEADDRESS_TIMEZONE_FK` = `TIMEZONE`.`TIMEZONE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1;\n";
			
		/*============================================================
		  == #6.03# - WATCHINPUTSCOMM                               ==
		  ============================================================*/
		case "WatchInputsComm":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_COMM` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`HUB_SERIALNUMBER`, \n";
			$sSQL .= "	`HUB_IPADDRESS`, \n";
			$sSQL .= "	`HUBTYPE_PK`, \n";
			$sSQL .= "	`HUBTYPE_NAME`, \n";
			$sSQL .= "	`COMM_PK`, \n";
			$sSQL .= "	`COMM_NAME`, \n";
			$sSQL .= "	`COMM_JOINMODE`, \n";
			$sSQL .= "	`COMM_ADDRESS`, \n";
			$sSQL .= "	`COMMTYPE_PK`, \n";
			$sSQL .= "	`COMMTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMHUB` ON `USERS_PK`=`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `HUB_PK`=`PERMHUB_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUBTYPE` ON `HUB_HUBTYPE_FK`=`HUBTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMM` ON `COMM_HUB_FK`=`HUB_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMMTYPE` ON `COMM_COMMTYPE_FK`=`COMMTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1;\n";
			break;
			
			
		/*============================================================
		  == #6.04# - WATCHINPUTSLINK                               ==
		  ============================================================*/
		case "WatchInputsLink":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_LINK` AS \n";
			$sSQL .= "SELECT \n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_HUBTYPE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`COMM_PK`, \n";
			$sSQL .= "	`COMMTYPE_PK`, \n";
			$sSQL .= "	`COMMTYPE_NAME`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_ROOMS_FK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINK_COMM_FK`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`LINKINFO_PK`, \n";
			$sSQL .= "	`LINKINFO_NAME`, \n";
			$sSQL .= "	`LINKINFO_MANUFACTURER`, \n";
			$sSQL .= "	`LINKINFO_MANUFACTURERURL`, \n";
			$sSQL .= "	`LINKCONN_PK`, \n";
			$sSQL .= "	`LINKCONN_NAME`, \n";
			$sSQL .= "	`LINKCONN_ADDRESS`, \n";
			$sSQL .= "	`LINKCONN_USERNAME`, \n";
			$sSQL .= "	`LINKCONN_PASSWORD`, \n";
			$sSQL .= "	`LINKCONN_PORT`, \n";
			$sSQL .= "	`LINKPROTOCOL_PK`, \n";
			$sSQL .= "	`LINKPROTOCOL_NAME`, \n";
			$sSQL .= "	`LINKCRYPTTYPE_PK`, \n";
			$sSQL .= "	`LINKCRYPTTYPE_NAME`, \n";
			$sSQL .= "	`LINKFREQ_PK`, \n";
			$sSQL .= "	`LINKFREQ_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMHUB` ON `USERS_PK`=`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `HUB_PK`=`PERMHUB_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMM` ON `HUB_PK`=`COMM_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMMTYPE` ON `COMM_COMMTYPE_FK`=`COMMTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `COMM_PK`=`LINK_COMM_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINK_LINKTYPE_FK`=`LINKTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKINFO` ON `LINK_LINKINFO_FK`=`LINKINFO_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKCONN` ON `LINK_LINKCONN_FK`=`LINKCONN_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKPROTOCOL` ON `LINKCONN_LINKPROTOCOL_FK`=`LINKPROTOCOL_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKFREQ` ON `LINKCONN_LINKFREQ_FK`=`LINKFREQ_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LINKCRYPTTYPE` ON `LINKCONN_LINKCRYPTTYPE_FK`=`LINKCRYPTTYPE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1;\n";
			break;
			
		/*============================================================
		  == #6.05# - WATCHINPUTSTHING                              ==
		  ============================================================*/
		case "WatchInputsThing":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_THING` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_HUBTYPE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`COMM_PK`, \n";
			$sSQL .= "	`COMM_COMMTYPE_FK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_ROOMS_FK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINK_COMM_FK`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THING_SERIALCODE`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMHUB` ON `USERS_PK`=`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `HUB_PK`=`PERMHUB_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMM` ON `HUB_PK`=`COMM_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `COMM_PK`=`LINK_COMM_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THINGTYPE` ON `THINGTYPE_PK`=`THING_THINGTYPE_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINKTYPE_PK`=`LINK_LINKTYPE_FK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1;\n";
			break;
			
		/*============================================================
		  == #6.06# - WATCHINPUTSIO                                 ==
		  ============================================================*/
		case "WatchInputsIO":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VW_IO` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "	`USERS_PK`, \n";
			$sSQL .= "	`HUB_PK`, \n";
			$sSQL .= "	`HUB_PREMISE_FK`, \n";
			$sSQL .= "	`HUB_HUBTYPE_FK`, \n";
			$sSQL .= "	`HUB_NAME`, \n";
			$sSQL .= "	`COMM_PK`, \n";
			$sSQL .= "	`LINK_PK`, \n";
			$sSQL .= "	`LINK_ROOMS_FK`, \n";
			$sSQL .= "	`LINK_SERIALCODE`, \n";
			$sSQL .= "	`LINK_NAME`, \n";
			$sSQL .= "	`LINK_CONNECTED`, \n";
			$sSQL .= "	`LINK_STATE`, \n";
			$sSQL .= "	`LINK_STATECHANGECODE`, \n";
			$sSQL .= "	`LINKTYPE_NAME`, \n";
			$sSQL .= "	`LINKTYPE_PK`, \n";
			$sSQL .= "	`THING_PK`, \n";
			$sSQL .= "	`THING_HWID`, \n";
			$sSQL .= "	`THING_OUTPUTHWID`, \n";
			$sSQL .= "	`THING_STATE`, \n";
			$sSQL .= "	`THING_STATECHANGEID`, \n";
			$sSQL .= "	`THING_NAME`, \n";
			$sSQL .= "	`THING_SERIALCODE`, \n";
			$sSQL .= "	`THINGTYPE_PK`, \n";
			$sSQL .= "	`THINGTYPE_NAME`, \n";
			$sSQL .= "	`IO_PK`, \n";
			$sSQL .= "	`IO_BASECONVERT`, \n";
			$sSQL .= "	`IO_NAME`, \n";
			$sSQL .= "	`IO_SAMPLERATELIMIT`, \n";
			$sSQL .= "	`IO_SAMPLERATEMAX`, \n";
			$sSQL .= "	`IO_SAMPLERATECURRENT`, \n";
			$sSQL .= "	`IO_STATE`, \n";
			$sSQL .= "	`IO_STATECHANGEID`, \n";
			$sSQL .= "	`IOTYPE_PK`, \n";
			$sSQL .= "	`IOTYPE_NAME`, \n";
			$sSQL .= "	`IOTYPE_ENUM`, \n";
			$sSQL .= "	`IOTYPE_DATATYPE_FK`, \n";
			$sSQL .= "	`DATATYPE_PK`, \n";
			$sSQL .= "	`DATATYPE_NAME`, \n";
			$sSQL .= "	`RSCAT_PK`, \n";
			$sSQL .= "	`RSCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_PK`, \n";
			$sSQL .= "	`RSSUBCAT_NAME`, \n";
			$sSQL .= "	`RSSUBCAT_TYPE`, \n";
			$sSQL .= "	`RSTARIFF_PK`, \n";
			$sSQL .= "	`RSTARIFF_NAME`, \n";
			$sSQL .= "	`RSTYPE_PK`, \n";
			$sSQL .= "	`RSTYPE_NAME`, \n";
			$sSQL .= "	`RSTYPE_MAIN`, \n";
			$sSQL .= "	`UOMCAT_PK`, \n";
			$sSQL .= "	`UOMCAT_NAME`, \n";
			$sSQL .= "	`UOMSUBCAT_PK`, \n";
			$sSQL .= "	`UOMSUBCAT_NAME`, \n";
			$sSQL .= "	`UOM_PK`, \n";
			$sSQL .= "	`UOM_NAME`, \n";
			$sSQL .= "	`UOM_RATE` \n";
			$sSQL .= "FROM `".$sDBName."`.`USERS` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`PERMHUB` ON `USERS_PK`=`PERMHUB_USERS_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`HUB` ON `HUB_PK`=`PERMHUB_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`COMM` ON `HUB_PK`=`COMM_HUB_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINK` ON `COMM_PK`=`LINK_COMM_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`LINKTYPE` ON `LINK_LINKTYPE_FK`=`LINKTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THING` ON `LINK_PK`=`THING_LINK_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`THINGTYPE` ON `THING_THINGTYPE_FK`=`THINGTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IO` ON `THING_PK`=`IO_THING_FK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`IOTYPE` ON `IO_IOTYPE_FK`=`IOTYPE_PK` \n";
			$sSQL .= "INNER JOIN `".$sDBName."`.`DATATYPE` ON `IOTYPE_DATATYPE_FK`=`DATATYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTYPE` ON `IO_RSTYPES_FK`=`RSTYPE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSTARIFF` ON `RSTYPE_RSTARIFF_FK`=`RSTARIFF_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSSUBCAT` ON `RSTARIFF_RSSUBCAT_FK`=`RSSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`RSCAT` ON `RSSUBCAT_RSCAT_FK`=`RSCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOM` ON `IO_UOM_FK`=`UOM_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMSUBCAT` ON `UOM_UOMSUBCAT_FK`=`UOMSUBCAT_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`UOMCAT` ON `UOMSUBCAT_UOMCAT_FK`=`UOMCAT_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `USERS_STATE` = -1 \n";
			$sSQL .= "AND `IO_BASECONVERT` <> 0; \n";
			break;
			
			
			
		//case "":
		//	break;
			
		/*==============================================================*/
		/* ERROR: UNSUPPORTED PARAMETER                                 */
		/*==============================================================*/
		default:
			$sSQL = null;
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results                           --//
	//----------------------------------------------------//
	return $sSQL;
}


function DB_CreateTables( $sDBName, $aTables ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the tables to the database.        --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aTemp1             = array();
	
	//----------------------------------------------------//
	//-- 2.0 - Preperation                              --//
	//----------------------------------------------------//
	//-- Setup Result variable --//
	$aResult = array( "Error"=>false, "Data"=>array() );
	
	//----------------------------------------------------//
	//-- 3.0 - Main Section                             --//
	//----------------------------------------------------//
	try {
		foreach( $aTables as $sTable ) {
			if($bError===false) {
				//----------------------------------------//
				//-- SQL Query - Insert Tables          --//
				//----------------------------------------//
				$sSQL = DB_FetchCreateTableSQL( $sDBName, $sTable );
				
				if( $sSQL!==null ) {
					//-- Run the SQL Query and save the results --//
					$aTemp1 = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
				} else {
					$bError   = true;
					$sErrMesg = "SqlCreateTable: Invalid Sql ".$sTable;
				}
				
				if( $aTemp1['Error']===false) {
					$aResult['Data'][$sTable]= $aTemp1['Result'];
				} else {
					$bError = true;
					$sErrMesg .= "Problem Creating Table (".$sTable.") ".$aTemp1['ErrMesg'];
					
					echo $sSQL."\n";
				}
			}
		}
	} catch(Exception $e2) {
		$bError   = true;
		$sErrMesg = $e2->getMessage();
	}
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResult;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateTables: ".$sErrMesg );
	}
}


function DB_CreateForeignKeys( $sDBName, $aForeignKeys ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the ForeignKey to the database.    --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aTemp1             = array();
	
	//----------------------------------------------------//
	//-- 2.0 - Preperation                              --//
	//----------------------------------------------------//
	//-- Setup Result variable --//
	$aResult = array( "Error"=>false, "Data"=>array() );
	
	//----------------------------------------------------//
	//-- 3.0 - Main Section                             --//
	//----------------------------------------------------//
	try {
		foreach( $aForeignKeys as $sForeignKey ) {
			if($bError===false) {
				//----------------------------------------//
				//-- SQL Query - Insert Foreign Key     --//
				//----------------------------------------//
				$sSQL = DB_FetchCreateForeignKeySQL( $sDBName, $sForeignKey );
				
				if( $sSQL!==null ) {
					//-- Run the SQL Query and save the results --//
					$aTemp1 = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
				} else {
					$bError   = true;
					$sErrMesg = "SqlCreateForeignKey: Invalid Sql ".$sForeignKey;
				}
				
				if( $aTemp1['Error']===false) {
					$aResult['Data'][$sForeignKey]= $aTemp1['Result'];
				} else {
					$bError = true;
					$sErrMesg .= "Problem Creating FK ".$aTemp1['ErrMesg'];
				}
			}
		}
	} catch(Exception $e2) {
		$bError   = true;
		$sErrMesg = $e2->getMessage();
	}
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResult;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateForeignKeys: ".$sErrMesg );
	}
}



function DB_CreateViews( $sDBName, $aViews ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the Views to the database.         --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResult            = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aTemp1             = array();
	
	//----------------------------------------------------//
	//-- 2.0 - Preperation                              --//
	//----------------------------------------------------//
	//-- Setup Result variable --//
	$aResult = array( "Error"=>false, "Data"=>array() );
	
	//----------------------------------------------------//
	//-- 3.0 - Main Section                             --//
	//----------------------------------------------------//
	try {
		foreach( $aViews as $sViewName ) {
			if($bError===false) {
				//----------------------------------------//
				//-- SQL Query - Insert Foreign Key     --//
				//----------------------------------------//
				$sSQL = DB_FetchCreateViewsSQL( $sDBName, $sViewName );
				
				if( $sSQL!==null ) {
					//-- Run the SQL Query and save the results --//
					$aTemp1 = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
				} else {
					$bError   = true;
					$sErrMesg = "SqlCreateView: Invalid Sql ".$sViewName;
				}
				
				if( $aTemp1['Error']===false) {
					$aResult['Data'][$sViewName]= $aTemp1['Result'];
				} else {
					$bError = true;
					$sErrMesg .= "Problem Creating View ".$aTemp1['ErrMesg'];
				}
			}
		}
	} catch(Exception $e2) {
		$bError   = true;
		$sErrMesg = $e2->getMessage();
	}
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResult;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateViews: ".$sErrMesg );
	}
}


function DB_CreateDefaultData1( $sDBName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			
			
			/*============================================================
			  == #6.?# - HUB TYPE                                       ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('Virtual - WebServer'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('Android - WatchInputs'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('Linux - WatchInputs'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('iOS - WatchInputs'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('Windows - WatchInputs'); \n";
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('Android - Native'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUBTYPE` (`HUBTYPE_NAME`) VALUES ('iOS - Native'); \n";
			
			/*============================================================
			  == #6.18# - USER GENDER                                   ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`USERSGENDER` (`USERSGENDER_PK`, `USERSGENDER_NAME`) VALUES (1, 'Female'), (2, 'Male'), (3, 'Other/Unassigned'); \n";
			
			
			/*============================================================
			  == #6.1# - RESOURCE CATEGORY                              ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (1,'Electricity',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (2,'Water',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (3,'Gas',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (4,'Diesel',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (5,'Oil',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (6,'Climate',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (7,'FuelCarbon',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (8,'Health',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (12,'Device Info',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSCAT` (RSCAT_PK,RSCAT_NAME,RSCAT_FORMUTILITY) VALUES (13,'Debugging',0); \n";
			
			/*============================================================
			  == #6.2# - RESOURCE SUBCATEGORY                           ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (1,1,'Electricity Use',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (2,1,'Electricity Generated',2); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (3,1,'Electricity Storage',3); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (4,2,'Water Use',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (5,2,'Water Generated',2); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (6,2,'Water Storage',3); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (7,3,'Gas Use',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (8,3,'Gas Generated',2); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (9,3,'Gas Storage',3); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (10,4,'Diesel/Petrol Use',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (11,4,'Diesel/Petrol Generated',2); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (12,4,'Diesel/Petrol Storage',3); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (13,5,'Oil Use',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (14,5,'Oil Generated',2); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (15,5,'Oil Storage',3); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (16,6,'Weather Underground',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (17,6,'Local Climate',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (18,7,'Total Carbon',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (19,7,'Individual Fuel',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (20,1,'Electricity Energy per Time',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (21,1,'Electrical Potential',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (22,1,'Electrical Current',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (23,3,'Gas per Time',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (24,6,'Climate Control',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (25,8,'User Health Parameter',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (39,12,'Device Info',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSSUBCAT` (RSSUBCAT_PK,RSSUBCAT_RSCAT_FK,RSSUBCAT_NAME,RSSUBCAT_TYPE) VALUES (40,13,'Debugging',0); \n";

			/*============================================================
			  == #6.3# - RESOURCE TARIFF                                ==
			  ============================================================*/
			/* Electricity */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (10,1,'Elec Use Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (11,1,'Elec Use Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (12,1,'Elec Use Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (13,1,'Elec Use Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (14,1,'Elec Use Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (15,1,'Elec Use Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (20,2,'Elec Gen Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (21,2,'Elec Gen Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (22,2,'Elec Gen Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (23,2,'Elec Gen Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (24,2,'Elec Gen Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (25,2,'Elec Gen Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (30,3,'Elec Sto Tariff 1'); \n";

			/* Water */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (40,4,'Water Use Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (41,4,'Water Use Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (42,4,'Water Use Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (43,4,'Water Use Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (44,4,'Water Use Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (45,4,'Water Use Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (50,5,'Water Gen Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (51,5,'Water Gen Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (52,5,'Water Gen Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (53,5,'Water Gen Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (54,5,'Water Gen Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (55,5,'Water Gen Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (60,6,'Water Sto Tariff 1'); \n";

			/* Gas */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (70,7,'Gas Use Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (71,7,'Gas Use Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (72,7,'Gas Use Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (73,7,'Gas Use Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (74,7,'Gas Use Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (75,7,'Gas Use Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (80,8,'Gas Gen Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (81,8,'Gas Gen Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (82,8,'Gas Gen Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (83,8,'Gas Gen Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (84,8,'Gas Gen Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (85,8,'Gas Gen Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (90,9,'Gas Sto Tariff 1'); \n";

			/* Diesel */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (100,10,'Diesel Use Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (101,10,'Diesel Use Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (102,10,'Diesel Use Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (103,10,'Diesel Use Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (104,10,'Diesel Use Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (105,10,'Diesel Use Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (110,11,'Diesel Gen Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (111,11,'Diesel Gen Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (112,11,'Diesel Gen Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (113,11,'Diesel Gen Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (114,11,'Diesel Gen Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (115,11,'Diesel Gen Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (120,12,'Diesel Sto Tariff 1'); \n";

			/* Oil */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (130,13,'Oil Use Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (131,13,'Oil Use Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (132,13,'Oil Use Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (133,13,'Oil Use Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (134,13,'Oil Use Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (135,13,'Oil Use Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (140,14,'Oil Gen Tariff 1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (141,14,'Oil Gen Tariff 2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (142,14,'Oil Gen Tariff 3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (143,14,'Oil Gen Tariff 4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (144,14,'Oil Gen Tariff 5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (145,14,'Oil Gen Tariff 6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (150,15,'Oil Sto Tariff 1'); \n";

			/* Weather & Climate */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (160,16,'Weather Underground'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (170,17,'Local Climate Sensors'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (177,17,'Thermostat Mode'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (178,17,'Thermostat Fans'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (179,17,'Thermostat Temperature'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (180,18,'Total Carbon'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (190,19,'Individual Fuel'); \n";

			/* Electricity Other */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (200,20,'Electricity Energy per Time'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (210,21,'AC Electrical Potential'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (211,21,'DC Electrical Potential'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (220,22,'Electrical Current'); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (230,23,'Gas per Time T1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (231,23,'Gas per Time T2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (232,23,'Gas per Time T3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (250,25,'User Health Parameter'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (390,39,'Port Info T1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (396,39,'Stream Parameters'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (397,39,'Stream Controls'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (399,39,'Device Port Controls'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTARIFF` (RSTARIFF_PK,RSTARIFF_RSSUBCAT_FK,RSTARIFF_NAME) VALUES (400,40,'Debugging T1'); \n";
			
			/*============================================================
			  == #6.4# - RESOURCE TYPE                                  ==
			  ============================================================*/
			/* Electricity */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (100,10,'Electric Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (101,10,'Electric Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (102,10,'Total Electric Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (103,10,'Total Electric Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (110,11,'Electric Use T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (111,11,'Electric Use T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (120,12,'Electric Use T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (121,12,'Electric Use T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (130,13,'Electric Use T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (131,13,'Electric Use T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (140,14,'Electric Use T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (141,14,'Electric Use T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (150,15,'Electric Use T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (151,15,'Electric Use T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (200,20,'Electric Gen T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (201,20,'Electric Gen T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (210,21,'Electric Gen T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (211,21,'Electric Gen T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (220,22,'Electric Gen T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (221,22,'Electric Gen T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (230,23,'Electric Gen T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (231,23,'Electric Gen T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (240,24,'Electric Gen T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (241,24,'Electric Gen T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (250,25,'Electric Gen T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (251,25,'Electric Gen T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (300,30,'Electric Sto T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (301,30,'Electric Sto T1',0); \n";

			/* Water */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (400,40,'Water Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (401,40,'Water Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (410,41,'Water Use T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (411,41,'Water Use T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (420,42,'Water Use T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (421,42,'Water Use T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (430,43,'Water Use T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (431,43,'Water Use T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (440,44,'Water Use T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (441,44,'Water Use T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (450,45,'Water Use T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (451,45,'Water Use T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (500,50,'Water Gen T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (501,50,'Water Gen T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (510,51,'Water Gen T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (511,51,'Water Gen T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (520,52,'Water Gen T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (521,52,'Water Gen T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (530,53,'Water Gen T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (531,53,'Water Gen T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (540,54,'Water Gen T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (541,54,'Water Gen T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (550,55,'Water Gen T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (551,55,'Water Gen T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (600,60,'Water Sto T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (601,60,'Water Sto T1',0); \n";

			/* Gas */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (700,70,'Gas Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (701,70,'Gas Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (710,71,'Gas Use T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (711,71,'Gas Use T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (720,72,'Gas Use T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (721,72,'Gas Use T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (730,73,'Gas Use T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (731,73,'Gas Use T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (740,74,'Gas Use T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (741,74,'Gas Use T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (750,75,'Gas Use T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (751,75,'Gas Use T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (800,80,'Gas Gen T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (801,80,'Gas Gen T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (810,81,'Gas Gen T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (811,81,'Gas Gen T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (820,82,'Gas Gen T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (821,82,'Gas Gen T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (830,83,'Gas Gen T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (831,83,'Gas Gen T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (840,84,'Gas Gen T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (841,84,'Gas Gen T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (850,85,'Gas Gen T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (851,85,'Gas Gen T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (900,90,'Gas Sto T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (901,90,'Gas Sto T1',0); \n";

			/* Diesel */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1000,100,'Diesel Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1001,100,'Diesel Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1010,101,'Diesel Use T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1011,101,'Diesel Use T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1020,102,'Diesel Use T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1021,102,'Diesel Use T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1030,103,'Diesel Use T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1031,103,'Diesel Use T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1040,104,'Diesel Use T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1041,104,'Diesel Use T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1050,105,'Diesel Use T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1051,105,'Diesel Use T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1100,110,'Diesel Gen T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1101,110,'Diesel Gen T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1110,111,'Diesel Gen T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1111,111,'Diesel Gen T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1120,112,'Diesel Gen T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1121,112,'Diesel Gen T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1130,113,'Diesel Gen T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1131,113,'Diesel Gen T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1140,114,'Diesel Gen T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1141,114,'Diesel Gen T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1150,115,'Diesel Gen T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1151,115,'Diesel Gen T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1200,120,'Diesel Sto T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1201,120,'Diesel Sto T1',0); \n";

			/* Oil */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1300,130,'Oil Use T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1301,130,'Oil Use T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1310,131,'Oil Use T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1311,131,'Oil Use T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1320,132,'Oil Use T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1321,132,'Oil Use T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1330,133,'Oil Use T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1331,133,'Oil Use T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1340,134,'Oil Use T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1341,134,'Oil Use T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1350,135,'Oil Use T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1351,135,'Oil Use T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1400,140,'Oil Gen T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1401,140,'Oil Gen T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1410,141,'Oil Gen T2 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1411,141,'Oil Gen T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1420,142,'Oil Gen T3 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1421,142,'Oil Gen T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1430,143,'Oil Gen T4 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1431,143,'Oil Gen T4',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1440,144,'Oil Gen T5 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1441,144,'Oil Gen T5',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1450,145,'Oil Gen T6 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1451,145,'Oil Gen T6',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1500,150,'Oil Sto T1 Main',1); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1501,150,'Oil Sto T1',0); \n";

			/* Weather */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1600,160,'Weather Station Code',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1601,160,'Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1602,160,'Humidity',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1603,160,'Pressure',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1604,160,'Conditions',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1605,160,'Wind Direction',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1606,160,'Wind Speed',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1607,160,'Sunrise',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1608,160,'Sunset',0); \n";
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1701,170,'Local Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1794,179,'Heating Max Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1795,179,'Heating Min Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1796,179,'Heating Desired Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1797,179,'Cooling Max Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1798,179,'Cooling Min Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1799,179,'Cooling Desired Temperature',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1780,179,'Fan Speed',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1781,179,'Available Fan Modes',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1770,179,'Thermostat Mode',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1771,179,'Thermostat Mode Auto',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1772,179,'Thermostat States',0); \n";

			/* Fuel Carbon */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1801,180,'Total Carbon',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1901,190,'Coal',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1902,190,'Gas',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1903,190,'Oil',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1904,190,'Nuclear',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1905,190,'Hydro',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1906,190,'Wind',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1907,190,'Other',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1909,190,'Liquid Fuel',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1908,190,'Foreign',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1910,190,'Renewables',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1911,190,'Biomass',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1912,190,'Geothermal',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (1913,190,'Solar',0); \n";

			/* Electricity Other */
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2001,200,'Electricity Energy per Time',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2101,210,'Electrical Potential',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2111,211,'Battery Voltage',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2201,220,'Electrical Current',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2300,230,'Gas Per Time T1',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2310,231,'Gas Per Time T2',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2320,232,'Gas Per Time T3',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (2510,250,'Health Blood Pressure',0); \n";

			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3900,390,'On/Off',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3901,390,'Hue',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3902,390,'Saturation',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3903,390,'Brightness',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3905,390,'Battery Alarm',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3909,390,'Special Bitwise Status','0'); \n";
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3960,396,'Network Address','0'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3961,396,'Network Port','0'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3962,396,'Username','0'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3963,396,'Password','0'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3964,396,'Path','0'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3965,396,'Protocol','0'); \n";
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3970,399,'Stream Profile Name',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3971,399,'Stream Url',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3972,399,'Thumbnail Profile Name',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3973,399,'Thumbnail Url',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3974,399,'PTZ X Axis',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3975,399,'PTZ Y Axis',0); \n";
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3995,399,'Interface Mode',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3996,399,'Pulses per Value Control',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (3999,399,'DevicePort On/Off State',0); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RSTYPE` (RSTYPE_PK,RSTYPE_RSTARIFF_FK,RSTYPE_NAME,RSTYPE_MAIN) VALUES (4000,400,'Needs Categorization',0); \n";
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData1: ".$sErrMesg );
	}
}


function DB_CreateDefaultData2( $sDBName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			
			/*============================================================
			  == #6.5# - UNIT OF MEASUREMENT CATEGORY                   ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (1,''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (2,'Energy'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (3,'Energy Per Time'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (4,'Electrical Potential'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (5,'Electrical Current'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (6,'Volume'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (7,'Temperature'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (8,'Pressure'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (9,'Distance'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (10,'Speed'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (11,'Frequency'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMCAT` (UOMCAT_PK,UOMCAT_NAME) VALUES (12,'Volume Per Time'); \n";

			/*============================================================
			  == #6.6# - UNIT OF MEASUREMENT SUB-CATEGORY               ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (1,1,''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (2,2,'Energy Electrical'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (3,2,'Energy Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (4,2,'Energy Former Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (5,3,'Energy per Time Electrical'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (6,3,'Energy per Time Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (7,4,'Electric Potential'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (8,5,'Electrical Current'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (9,6,'Volume Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (10,6,'Volume Imperial'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (11,7,'Temperature Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (12,7,'Temperature Imperial'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (13,8,'Pressure Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (14,9,'Distance Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (15,9,'Distance Imperial'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (16,10,'Speed Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (17,10,'Speed Imperial'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (18,11,'Frequency Hertz'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (19,11,'Volume Per Time Metric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (20,8,'Pressure Manometric'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOMSUBCAT` (UOMSUBCAT_PK,UOMSUBCAT_UOMCAT_FK,UOMSUBCAT_NAME) VALUES (21,11,'Frequency Beats'); \n";
			
			/*============================================================
			  == #6.7# - UNIT OF MEASUREMENT                            ==
			  ============================================================*/
			/* UoM types that have no category */
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (1,'',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (1,'%',''); \n";

			/* Common */
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (2,'kWh','kW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (3,'J','J/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (3,'kJ','kJ/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (4,'cal','cal/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (4,'kcal','kcal/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (5,'kW',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (6,'kJ/h',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (7,'V',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (8,'A',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (9,'m³','m³/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (9,'L','L/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (10,'gal(UK)','gal/h(UK)'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (10,'gal(US)','gal/h(US)'); \n";
			
			/* Weather Related */
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (11,'°C',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (11,'°K',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (12,'°F',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (13,'Pa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (13,'hPa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (13,'kPa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (14,'m','m/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (14,'km','km/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (15,'nmi','nmi/h'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (15,'mi','mph'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (16,'km/h',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (16,'m/s',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (17,'kn',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (17,'mph',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (18,'Hz',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (18,'kHz',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (18,'MHz',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (18,'GHz',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (19,'m³/h',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (20,'mmHG',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`UOM` (UOM_UOMSUBCAT_FK,UOM_NAME,UOM_RATE) VALUES (21,'BPM',''); \n";
			
			
			/*============================================================
			  == #6.8# - CURRENCIES                                     ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (  8, 'ALL', 'Albanian lek'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 12, 'DZD', 'Algerian dinar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 32, 'ARS', 'Argentine peso'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 36, 'AUD', 'Australian Dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 44, 'BSD', 'Bahamian dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 48, 'BHD', 'Bahraini dinar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 51, 'AMD', 'Armenian dram'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 52, 'BBD', 'Barbados dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 60, 'BMD', 'Bermudian dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 64, 'BTN', 'Bhutanese ngultrum'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 68, 'BOB', 'Boliviano'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 72, 'BWP', 'Botswana pula'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 84, 'BZD', 'Belize dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 90, 'SBD', 'Solomon Islands dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES ( 96, 'BND', 'Brunei dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (104, 'MMK', 'Myanmar kyat'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (108, 'BIF', 'Burundian franc'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (116, 'KHR', 'Cambodian riel'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (124, 'CAD', 'Canadian dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (132, 'CVE', 'Cape Verde escudo'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (136, 'KYD', 'Cayman Islands dollar'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (144, 'LKR', 'Sri Lankan rupee'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (152, 'CLP', 'Chilean peso'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (156, 'CNY', 'Chinese yuan'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (170, 'COP', 'Colombian peso'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (174, 'KMF', 'Comoro franc'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (188, 'CRC', 'Costa Rican colon'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (191, 'HRK', 'Croatian kuna'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (192, 'CUP', 'Cuban peso'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (203, 'CZK', 'Czech koruna'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (208, 'DKK', 'Danish krone'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (214, 'DOP', 'Dominican peso'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_PK,CURRENCIES_ABREVIATION,CURRENCIES_NAME) VALUES (222, 'SVC', 'Salvadoran colón'); \n";
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData2: ".$sErrMesg );
	}
}


function DB_CreateDefaultData3( $sDBName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			
			
			/*============================================================
			  == #6.9# - REGION                                         ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES (   2, 'Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES (   9, 'Oceania'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES (  10, 'Antarctica'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES (  19, 'Americas'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES ( 142, 'Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONLOC` (`REGIONLOC_PK`, `REGIONLOC_NAME`) VALUES ( 150, 'Europe'); ";

			
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES ( 5, 19, 'South America'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (10, 10, 'Antarctica'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (11,  2, 'Western Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (13, 19, 'Central America'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (14,  2, 'Eastern Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (15,  2, 'Northern Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (17,  2, 'Middle Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (18,  2, 'Southern Africa'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (21,  19, 'Northern America'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (29,  19, 'Caribbean'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (30, 142, 'Eastern Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (34, 142, 'Southern Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (35, 142, 'South-Eastern Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (39, 150, 'Southern Europe'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (53,   9, 'Australia and New Zealand'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (54,   9, 'Melanesia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (57,   9, 'Micronesia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (61,   9, 'Polynesia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (143, 142, 'Central Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (145, 142, 'Western Asia'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (151, 150, 'Eastern Europe'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (154, 150, 'Northern Europe'); ";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGIONSUBLOC` (`REGIONSUBLOC_PK`, `REGIONSUBLOC_REGIONLOC_FK`, `REGIONSUBLOC_NAME`) VALUES (155, 150, 'Western Europe'); ";

			
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (4,   34,  null, 'Afghanistan', 'AF', 'AFG', 'ISO 3166-2:AF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (8,   39,  null, 'Albania', 'AL', 'ALB', 'ISO 3166-2:AL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (10,  10,  null, 'Antarctica', 'AQ', 'ATA', 'ISO 3166-2:AQ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (12,  15,  null, 'Algeria', 'DZ', 'DZA', 'ISO 3166-2:DZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (16,  61,  null, 'American Samoa', 'AS', 'ASM', 'ISO 3166-2:AS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (20,  39,  null, 'Andorra', 'AD', 'AND', 'ISO 3166-2:AD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (24,  17,  null, 'Angola', 'AO', 'AGO', 'ISO 3166-2:AO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (28,  29,  null, 'Antigua and Barbuda', 'AG', 'ATG', 'ISO 3166-2:AG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (31,  145, null, 'Azerbaijan', 'AZ', 'AZE', 'ISO 3166-2:AZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (32,  5,   null, 'Argentina', 'AR', 'ARG', 'ISO 3166-2:AR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (36,  53,  36,    'Australia', 'AU', 'AUS', 'ISO 3166-2:AU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (40,  155, null, 'Austria', 'AT', 'AUT', 'ISO 3166-2:AT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (44,  29,  null, 'Bahamas', 'BS', 'BHS', 'ISO 3166-2:BS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (48,  145, null, 'Bahrain', 'BH', 'BHR', 'ISO 3166-2:BH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (50,  34,  null, 'Bangladesh', 'BD', 'BGD', 'ISO 3166-2:BD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (51,  145, null, 'Armenia', 'AM', 'ARM', 'ISO 3166-2:AM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (52,  29,  null, 'Barbados', 'BB', 'BRB', 'ISO 3166-2:BB'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (56,  155, null, 'Belgium', 'BE', 'BEL', 'ISO 3166-2:BE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (60,  21,  null, 'Bermuda', 'BM', 'BMU', 'ISO 3166-2:BM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (64,  34,  null, 'Bhutan', 'BT', 'BTN', 'ISO 3166-2:BT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (68,  5,   null, 'Bolivia (Plurinational State of)', 'BO', 'BOL', 'ISO 3166-2:BO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (70,  39,  null, 'Bosnia and Herzegovina', 'BA', 'BIH', 'ISO 3166-2:BA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (72,  18,  null, 'Botswana', 'BW', 'BWA', 'ISO 3166-2:BW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (74,  5,   null, 'Bouvet Island', 'BV', 'BVT', 'ISO 3166-2:BV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (76,  5,   null, 'Brazil', 'BR', 'BRA', 'ISO 3166-2:BR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (84,  13,  null, 'Belize', 'BZ', 'BLZ', 'ISO 3166-2:BZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (86,  14,  null, 'British Indian Ocean Territory', 'IO', 'IOT', 'ISO 3166-2:IO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (90,  54,  null, 'Solomon Islands', 'SB', 'SLB', 'ISO 3166-2:SB'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (92,  29,  null, 'Virgin Islands (British)', 'VG', 'VGB', 'ISO 3166-2:VG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (96,  35,  null, 'Brunei Darussalam', 'BN', 'BRN', 'ISO 3166-2:BN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (100, 151, null, 'Bulgaria', 'BG', 'BGR', 'ISO 3166-2:BG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (104, 35,  null, 'Myanmar', 'MM', 'MMR', 'ISO 3166-2:MM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (108, 14,  null, 'Burundi', 'BI', 'BDI', 'ISO 3166-2:BI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (112, 151, null, 'Belarus', 'BY', 'BLR', 'ISO 3166-2:BY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (116, 35,  null, 'Cambodia', 'KH', 'KHM', 'ISO 3166-2:KH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (120, 17,  null, 'Cameroon', 'CM', 'CMR', 'ISO 3166-2:CM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (124, 21,  null, 'Canada', 'CA', 'CAN', 'ISO 3166-2:CA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (132, 11,  null, 'Cabo Verde', 'CV', 'CPV', 'ISO 3166-2:CV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (136, 29,  null, 'Cayman Islands', 'KY', 'CYM', 'ISO 3166-2:KY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (140, 17,  null, 'Central African Republic', 'CF', 'CAF', 'ISO 3166-2:CF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (144, 34,  null, 'Sri Lanka', 'LK', 'LKA', 'ISO 3166-2:LK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (148, 17,  null, 'Chad', 'TD', 'TCD', 'ISO 3166-2:TD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (152, 5,   null, 'Chile', 'CL', 'CHL', 'ISO 3166-2:CL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (156, 30,  null, 'China', 'CN', 'CHN', 'ISO 3166-2:CN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (158, 30,  null, 'Taiwan, Province of China', 'TW', 'TWN', 'ISO 3166-2:TW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (162, 53,  null, 'Christmas Island', 'CX', 'CXR', 'ISO 3166-2:CX'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (166, 53,  null, 'Cocos (Keeling) Islands', 'CC', 'CCK', 'ISO 3166-2:CC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (170, 5,   null, 'Colombia', 'CO', 'COL', 'ISO 3166-2:CO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (174, 14,  null, 'Comoros', 'KM', 'COM', 'ISO 3166-2:KM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (175, 14,  null, 'Mayotte', 'YT', 'MYT', 'ISO 3166-2:YT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (178, 17,  null, 'Congo', 'CG', 'COG', 'ISO 3166-2:CG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (180, 17,  null, 'Congo (Democratic Republic of the)', 'CD', 'COD', 'ISO 3166-2:CD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (184, 61,  null, 'Cook Islands', 'CK', 'COK', 'ISO 3166-2:CK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (188, 13,  null, 'Costa Rica', 'CR', 'CRI', 'ISO 3166-2:CR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (191, 39,  null, 'Croatia', 'HR', 'HRV', 'ISO 3166-2:HR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (192, 29,  null, 'Cuba', 'CU', 'CUB', 'ISO 3166-2:CU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (196, 145, null, 'Cyprus', 'CY', 'CYP', 'ISO 3166-2:CY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (203, 151, null, 'Czech Republic', 'CZ', 'CZE', 'ISO 3166-2:CZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (204, 11,  null, 'Benin', 'BJ', 'BEN', 'ISO 3166-2:BJ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (208, 154, null, 'Denmark', 'DK', 'DNK', 'ISO 3166-2:DK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (212, 29,  null, 'Dominica', 'DM', 'DMA', 'ISO 3166-2:DM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (214, 29,  null, 'Dominican Republic', 'DO', 'DOM', 'ISO 3166-2:DO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (218, 5,   null, 'Ecuador', 'EC', 'ECU', 'ISO 3166-2:EC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (222, 13,  null, 'El Salvador', 'SV', 'SLV', 'ISO 3166-2:SV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (226, 17,  null, 'Equatorial Guinea', 'GQ', 'GNQ', 'ISO 3166-2:GQ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (231, 14,  null, 'Ethiopia', 'ET', 'ETH', 'ISO 3166-2:ET'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (232, 14,  null, 'Eritrea', 'ER', 'ERI', 'ISO 3166-2:ER'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (233, 154, null, 'Estonia', 'EE', 'EST', 'ISO 3166-2:EE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (234, 154, null, 'Faroe Islands', 'FO', 'FRO', 'ISO 3166-2:FO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (238, 5,   null, 'Falkland Islands (Malvinas)', 'FK', 'FLK', 'ISO 3166-2:FK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (239, 5,   null, 'South Georgia and the South Sandwich Islands', 'GS', 'SGS', 'ISO 3166-2:GS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (242, 54,  null, 'Fiji', 'FJ', 'FJI', 'ISO 3166-2:FJ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (246, 154, null, 'Finland', 'FI', 'FIN', 'ISO 3166-2:FI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (248, 154, null, 'Åland Islands', 'AX', 'ALA', 'ISO 3166-2:AX'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (250, 155, null, 'France', 'FR', 'FRA', 'ISO 3166-2:FR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (254, 5,   null, 'French Guiana', 'GF', 'GUF', 'ISO 3166-2:GF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (258, 61,  null, 'French Polynesia', 'PF', 'PYF', 'ISO 3166-2:PF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (260, 14,  null, 'French Southern Territories', 'TF', 'ATF', 'ISO 3166-2:TF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (262, 14,  null, 'Djibouti', 'DJ', 'DJI', 'ISO 3166-2:DJ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (266, 17,  null, 'Gabon', 'GA', 'GAB', 'ISO 3166-2:GA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (268, 145, null, 'Georgia', 'GE', 'GEO', 'ISO 3166-2:GE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (270, 11,  null, 'Gambia', 'GM', 'GMB', 'ISO 3166-2:GM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (275, 145, null, 'Palestine, State of', 'PS', 'PSE', 'ISO 3166-2:PS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (276, 155, null, 'Germany', 'DE', 'DEU', 'ISO 3166-2:DE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (288, 11,  null, 'Ghana', 'GH', 'GHA', 'ISO 3166-2:GH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (292, 39,  null, 'Gibraltar', 'GI', 'GIB', 'ISO 3166-2:GI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (296, 57,  null, 'Kiribati', 'KI', 'KIR', 'ISO 3166-2:KI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (300, 39,  null, 'Greece', 'GR', 'GRC', 'ISO 3166-2:GR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (304, 21,  null, 'Greenland', 'GL', 'GRL', 'ISO 3166-2:GL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (308, 29,  null, 'Grenada', 'GD', 'GRD', 'ISO 3166-2:GD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (312, 29,  null, 'Guadeloupe', 'GP', 'GLP', 'ISO 3166-2:GP'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (316, 57,  null, 'Guam', 'GU', 'GUM', 'ISO 3166-2:GU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (320, 13,  null, 'Guatemala', 'GT', 'GTM', 'ISO 3166-2:GT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (324, 11,  null, 'Guinea', 'GN', 'GIN', 'ISO 3166-2:GN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (328, 5,   null, 'Guyana', 'GY', 'GUY', 'ISO 3166-2:GY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (332, 29,  null, 'Haiti', 'HT', 'HTI', 'ISO 3166-2:HT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (334, 53,  null, 'Heard Island and McDonald Islands', 'HM', 'HMD', 'ISO 3166-2:HM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (336, 39,  null, 'Holy See', 'VA', 'VAT', 'ISO 3166-2:VA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (340, 13,  null, 'Honduras', 'HN', 'HND', 'ISO 3166-2:HN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (344, 30,  null, 'Hong Kong', 'HK', 'HKG', 'ISO 3166-2:HK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (348, 151, null, 'Hungary', 'HU', 'HUN', 'ISO 3166-2:HU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (352, 154, null, 'Iceland', 'IS', 'ISL', 'ISO 3166-2:IS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (356, 34,  null, 'India', 'IN', 'IND', 'ISO 3166-2:IN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (360, 35,  null, 'Indonesia', 'ID', 'IDN', 'ISO 3166-2:ID'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (364, 34,  null, 'Iran (Islamic Republic of)', 'IR', 'IRN', 'ISO 3166-2:IR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (368, 145, null, 'Iraq', 'IQ', 'IRQ', 'ISO 3166-2:IQ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (372, 154, null, 'Ireland', 'IE', 'IRL', 'ISO 3166-2:IE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (376, 145, null, 'Israel', 'IL', 'ISR', 'ISO 3166-2:IL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (380, 39,  null, 'Italy', 'IT', 'ITA', 'ISO 3166-2:IT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (384, 11,  null, 'Côte d''Ivoire', 'CI', 'CIV', 'ISO 3166-2:CI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (388, 29,  null, 'Jamaica', 'JM', 'JAM', 'ISO 3166-2:JM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (392, 30,  null, 'Japan', 'JP', 'JPN', 'ISO 3166-2:JP'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (398, 143, null, 'Kazakhstan', 'KZ', 'KAZ', 'ISO 3166-2:KZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (400, 145, null, 'Jordan', 'JO', 'JOR', 'ISO 3166-2:JO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (404, 14,  null, 'Kenya', 'KE', 'KEN', 'ISO 3166-2:KE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (408, 30,  null, 'Korea (Democratic People''s Republic of)', 'KP', 'PRK', 'ISO 3166-2:KP'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (410, 30,  null, 'Korea (Republic of)', 'KR', 'KOR', 'ISO 3166-2:KR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (414, 145, null, 'Kuwait', 'KW', 'KWT', 'ISO 3166-2:KW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (417, 143, null, 'Kyrgyzstan', 'KG', 'KGZ', 'ISO 3166-2:KG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (418, 35,  null, 'Lao People''s Democratic Republic', 'LA', 'LAO', 'ISO 3166-2:LA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (422, 145, null, 'Lebanon', 'LB', 'LBN', 'ISO 3166-2:LB'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (426, 18,  null, 'Lesotho', 'LS', 'LSO', 'ISO 3166-2:LS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (428, 154, null, 'Latvia', 'LV', 'LVA', 'ISO 3166-2:LV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (430, 11,  null, 'Liberia', 'LR', 'LBR', 'ISO 3166-2:LR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (434, 15,  null, 'Libya', 'LY', 'LBY', 'ISO 3166-2:LY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (438, 155, null, 'Liechtenstein', 'LI', 'LIE', 'ISO 3166-2:LI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (440, 154, null, 'Lithuania', 'LT', 'LTU', 'ISO 3166-2:LT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (442, 155, null, 'Luxembourg', 'LU', 'LUX', 'ISO 3166-2:LU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (446, 30,  null, 'Macao', 'MO', 'MAC', 'ISO 3166-2:MO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (450, 14,  null, 'Madagascar', 'MG', 'MDG', 'ISO 3166-2:MG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (454, 14,  null, 'Malawi', 'MW', 'MWI', 'ISO 3166-2:MW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (458, 35,  null, 'Malaysia', 'MY', 'MYS', 'ISO 3166-2:MY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (462, 34,  null, 'Maldives', 'MV', 'MDV', 'ISO 3166-2:MV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (466, 11,  null, 'Mali', 'ML', 'MLI', 'ISO 3166-2:ML'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (470, 39,  null, 'Malta', 'MT', 'MLT', 'ISO 3166-2:MT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (474, 29,  null, 'Martinique', 'MQ', 'MTQ', 'ISO 3166-2:MQ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (478, 11,  null, 'Mauritania', 'MR', 'MRT', 'ISO 3166-2:MR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (480, 14,  null, 'Mauritius', 'MU', 'MUS', 'ISO 3166-2:MU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (484, 13,  null, 'Mexico', 'MX', 'MEX', 'ISO 3166-2:MX'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (492, 155, null, 'Monaco', 'MC', 'MCO', 'ISO 3166-2:MC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (496, 30,  null, 'Mongolia', 'MN', 'MNG', 'ISO 3166-2:MN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (498, 151, null, 'Moldova (Republic of)', 'MD', 'MDA', 'ISO 3166-2:MD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (499, 39,  null, 'Montenegro', 'ME', 'MNE', 'ISO 3166-2:ME'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (500, 29,  null, 'Montserrat', 'MS', 'MSR', 'ISO 3166-2:MS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (504, 15,  null, 'Morocco', 'MA', 'MAR', 'ISO 3166-2:MA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (508, 14,  null, 'Mozambique', 'MZ', 'MOZ', 'ISO 3166-2:MZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (512, 145, null, 'Oman', 'OM', 'OMN', 'ISO 3166-2:OM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (516, 18,  null, 'Namibia', 'NA', 'NAM', 'ISO 3166-2:NA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (520, 57,  null, 'Nauru', 'NR', 'NRU', 'ISO 3166-2:NR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (524, 34,  null, 'Nepal', 'NP', 'NPL', 'ISO 3166-2:NP'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (528, 155, null, 'Netherlands', 'NL', 'NLD', 'ISO 3166-2:NL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (531, 29,  null, 'Curaçao', 'CW', 'CUW', 'ISO 3166-2:CW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (533, 29,  null, 'Aruba', 'AW', 'ABW', 'ISO 3166-2:AW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (534, 29,  null, 'Sint Maarten (Dutch part)', 'SX', 'SXM', 'ISO 3166-2:SX'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (535, 29,  null, 'Bonaire, Sint Eustatius and Saba', 'BQ', 'BES', 'ISO 3166-2:BQ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (540, 54,  null, 'New Caledonia', 'NC', 'NCL', 'ISO 3166-2:NC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (548, 54,  null, 'Vanuatu', 'VU', 'VUT', 'ISO 3166-2:VU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (554, 53,  null, 'New Zealand', 'NZ', 'NZL', 'ISO 3166-2:NZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (558, 13,  null, 'Nicaragua', 'NI', 'NIC', 'ISO 3166-2:NI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (562, 11,  null, 'Niger', 'NE', 'NER', 'ISO 3166-2:NE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (566, 11,  null, 'Nigeria', 'NG', 'NGA', 'ISO 3166-2:NG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (570, 61,  null, 'Niue', 'NU', 'NIU', 'ISO 3166-2:NU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (574, 53,  null, 'Norfolk Island', 'NF', 'NFK', 'ISO 3166-2:NF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (578, 154, null, 'Norway', 'NO', 'NOR', 'ISO 3166-2:NO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (580, 57,  null, 'Northern Mariana Islands', 'MP', 'MNP', 'ISO 3166-2:MP'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (581, 57,  null, 'United States Minor Outlying Islands', 'UM', 'UMI', 'ISO 3166-2:UM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (583, 57,  null, 'Micronesia (Federated States of)', 'FM', 'FSM', 'ISO 3166-2:FM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (584, 57,  null, 'Marshall Islands', 'MH', 'MHL', 'ISO 3166-2:MH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (585, 57,  null, 'Palau', 'PW', 'PLW', 'ISO 3166-2:PW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (586, 34,  null, 'Pakistan', 'PK', 'PAK', 'ISO 3166-2:PK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (591, 13,  null, 'Panama', 'PA', 'PAN', 'ISO 3166-2:PA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (598, 54,  null, 'Papua New Guinea', 'PG', 'PNG', 'ISO 3166-2:PG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (600, 5,   null, 'Paraguay', 'PY', 'PRY', 'ISO 3166-2:PY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (604, 5,   null, 'Peru', 'PE', 'PER', 'ISO 3166-2:PE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (608, 35,  null, 'Philippines', 'PH', 'PHL', 'ISO 3166-2:PH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (612, 61,  null, 'Pitcairn', 'PN', 'PCN', 'ISO 3166-2:PN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (616, 151, null, 'Poland', 'PL', 'POL', 'ISO 3166-2:PL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (620, 39,  null, 'Portugal', 'PT', 'PRT', 'ISO 3166-2:PT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (624, 11,  null, 'Guinea-Bissau', 'GW', 'GNB', 'ISO 3166-2:GW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (626, 35,  null, 'Timor-Leste', 'TL', 'TLS', 'ISO 3166-2:TL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (630, 29,  null, 'Puerto Rico', 'PR', 'PRI', 'ISO 3166-2:PR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (634, 145, null, 'Qatar', 'QA', 'QAT', 'ISO 3166-2:QA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (638, 14,  null, 'Réunion', 'RE', 'REU', 'ISO 3166-2:RE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (642, 151, null, 'Romania', 'RO', 'ROU', 'ISO 3166-2:RO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (643, 151, null, 'Russian Federation', 'RU', 'RUS', 'ISO 3166-2:RU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (646, 14,  null, 'Rwanda', 'RW', 'RWA', 'ISO 3166-2:RW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (652, 29,  null, 'Saint Barthélemy', 'BL', 'BLM', 'ISO 3166-2:BL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (654, 11,  null, 'Saint Helena, Ascension and Tristan da Cunha', 'SH', 'SHN', 'ISO 3166-2:SH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (659, 29,  null, 'Saint Kitts and Nevis', 'KN', 'KNA', 'ISO 3166-2:KN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (660, 29,  null, 'Anguilla', 'AI', 'AIA', 'ISO 3166-2:AI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (662, 29,  null, 'Saint Lucia', 'LC', 'LCA', 'ISO 3166-2:LC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (663, 29,  null, 'Saint Martin (French part)', 'MF', 'MAF', 'ISO 3166-2:MF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (666, 21,  null, 'Saint Pierre and Miquelon', 'PM', 'SPM', 'ISO 3166-2:PM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (670, 29,  null, 'Saint Vincent and the Grenadines', 'VC', 'VCT', 'ISO 3166-2:VC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (674, 39,  null, 'San Marino', 'SM', 'SMR', 'ISO 3166-2:SM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (678, 17,  null, 'Sao Tome and Principe', 'ST', 'STP', 'ISO 3166-2:ST'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (682, 145, null, 'Saudi Arabia', 'SA', 'SAU', 'ISO 3166-2:SA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (686, 11,  null, 'Senegal', 'SN', 'SEN', 'ISO 3166-2:SN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (688, 39,  null, 'Serbia', 'RS', 'SRB', 'ISO 3166-2:RS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (690, 14,  null, 'Seychelles', 'SC', 'SYC', 'ISO 3166-2:SC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (694, 11,  null, 'Sierra Leone', 'SL', 'SLE', 'ISO 3166-2:SL'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (702, 35,  null, 'Singapore', 'SG', 'SGP', 'ISO 3166-2:SG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (703, 151, null, 'Slovakia', 'SK', 'SVK', 'ISO 3166-2:SK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (704, 35,  null, 'Viet Nam', 'VN', 'VNM', 'ISO 3166-2:VN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (705, 39,  null, 'Slovenia', 'SI', 'SVN', 'ISO 3166-2:SI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (706, 14,  null, 'Somalia', 'SO', 'SOM', 'ISO 3166-2:SO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (710, 18,  null, 'South Africa', 'ZA', 'ZAF', 'ISO 3166-2:ZA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (716, 14,  null, 'Zimbabwe', 'ZW', 'ZWE', 'ISO 3166-2:ZW'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (724, 39,  null, 'Spain', 'ES', 'ESP', 'ISO 3166-2:ES'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (728, 14,  null, 'South Sudan', 'SS', 'SSD', 'ISO 3166-2:SS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (729, 15,  null, 'Sudan', 'SD', 'SDN', 'ISO 3166-2:SD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (732, 15,  null, 'Western Sahara', 'EH', 'ESH', 'ISO 3166-2:EH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (740, 5,   null, 'Suriname', 'SR', 'SUR', 'ISO 3166-2:SR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (744, 154, null, 'Svalbard and Jan Mayen', 'SJ', 'SJM', 'ISO 3166-2:SJ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (748, 18,  null, 'Swaziland', 'SZ', 'SWZ', 'ISO 3166-2:SZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (752, 154, null, 'Sweden', 'SE', 'SWE', 'ISO 3166-2:SE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (756, 155, null, 'Switzerland', 'CH', 'CHE', 'ISO 3166-2:CH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (760, 145, null, 'Syrian Arab Republic', 'SY', 'SYR', 'ISO 3166-2:SY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (762, 143, null, 'Tajikistan', 'TJ', 'TJK', 'ISO 3166-2:TJ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (764, 35,  null, 'Thailand', 'TH', 'THA', 'ISO 3166-2:TH'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (768, 11,  null, 'Togo', 'TG', 'TGO', 'ISO 3166-2:TG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (772, 61,  null, 'Tokelau', 'TK', 'TKL', 'ISO 3166-2:TK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (776, 61,  null, 'Tonga', 'TO', 'TON', 'ISO 3166-2:TO'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (780, 29,  null, 'Trinidad and Tobago', 'TT', 'TTO', 'ISO 3166-2:TT'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (784, 145, null, 'United Arab Emirates', 'AE', 'ARE', 'ISO 3166-2:AE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (788, 15,  null, 'Tunisia', 'TN', 'TUN', 'ISO 3166-2:TN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (792, 145, null, 'Turkey', 'TR', 'TUR', 'ISO 3166-2:TR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (795, 143, null, 'Turkmenistan', 'TM', 'TKM', 'ISO 3166-2:TM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (796, 29,  null, 'Turks and Caicos Islands', 'TC', 'TCA', 'ISO 3166-2:TC'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (798, 61,  null, 'Tuvalu', 'TV', 'TUV', 'ISO 3166-2:TV'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (800, 14,  null, 'Uganda', 'UG', 'UGA', 'ISO 3166-2:UG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (804, 151, null, 'Ukraine', 'UA', 'UKR', 'ISO 3166-2:UA'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (807, 39,  null, 'Macedonia (the former Yugoslav Republic of)', 'MK', 'MKD', 'ISO 3166-2:MK'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (818, 15,  null, 'Egypt', 'EG', 'EGY', 'ISO 3166-2:EG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (826, 154, null, 'United Kingdom of Great Britain and Northern Ireland', 'GB', 'GBR', 'ISO 3166-2:GB'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (831, 154, null, 'Guernsey', 'GG', 'GGY', 'ISO 3166-2:GG'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (832, 154, null, 'Jersey', 'JE', 'JEY', 'ISO 3166-2:JE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (833, 154, null, 'Isle of Man', 'IM', 'IMN', 'ISO 3166-2:IM'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (834, 14,  null, 'Tanzania, United Republic of', 'TZ', 'TZA', 'ISO 3166-2:TZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (840, 21,  null, 'United States of America', 'US', 'USA', 'ISO 3166-2:US'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (850, 29,  null, 'Virgin Islands (U.S.)', 'VI', 'VIR', 'ISO 3166-2:VI'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (854, 11,  null, 'Burkina Faso', 'BF', 'BFA', 'ISO 3166-2:BF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (858, 5,   null, 'Uruguay', 'UY', 'URY', 'ISO 3166-2:UY'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (860, 143, null, 'Uzbekistan', 'UZ', 'UZB', 'ISO 3166-2:UZ'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (862, 5,   null, 'Venezuela (Bolivarian Republic of)', 'VE', 'VEN', 'ISO 3166-2:VE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (876, 61,  null, 'Wallis and Futuna', 'WF', 'WLF', 'ISO 3166-2:WF'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (882, 61,  null, 'Samoa', 'WS', 'WSM', 'ISO 3166-2:WS'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (887, 145, null, 'Yemen', 'YE', 'YEM', 'ISO 3166-2:YE'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`REGION` (`REGION_PK`, `REGION_REGIONSUBLOC_FK`, `REGION_CURRENCIES_FK`, `REGION_NAME`, `REGION_NAME2`, `REGION_NAME3`, `REGION_NAME4`) VALUES (894, 14,  null, 'Zambia', 'ZM', 'ZMB', 'ISO 3166-2:ZM'); \n";
			
			
			
			
			
			
			
			/*============================================================
			  == #6.10# - LANGUAGE                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (1, 'English', 'en'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (2, 'Catalan', 'ca'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (3, 'Czech', 'cs'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (4, 'Danish', 'da'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (5, 'German', 'de'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (6, 'Greek', 'el'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (7, 'Esperanto', 'eo'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (8, 'Spanish', 'es'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (9, 'Estonian', 'et'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (10, 'French', 'fr'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (11, 'Hebrew', 'he'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (12, 'Croatian', 'hr'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (13, 'Italian', 'it'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (14, 'Japanese', 'ja'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (15, 'Korean', 'ko'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (16, 'Luxembourgish', 'ltz'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (17, 'Dutch', 'nl'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (18, 'Norwegian Nynorsk', 'nn'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (19, 'Norwegian', 'no'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (20, 'Polish', 'pl'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (21, 'Portuguese', 'pt'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (22, 'Portuguese (Brazil)', 'pt-BR'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (23, 'Russian', 'ru'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (24, 'Swedish', 'sv'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (25, 'Turkish', 'tr'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (26, 'Chinese (Simplified)', 'zh-CN'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (`LANGUAGE_PK`, `LANGUAGE_NAME`, `LANGUAGE_ENCODING`) VALUES (27, 'Chinese (Traditional)', 'zh-TW'); \n";
			
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData3: ".$sErrMesg );
	}
}


function DB_CreateDefaultData4( $sDBName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			
			/*============================================================
			  == #6.12# - TIMEZONE                                      ==
			  ============================================================*/ 
			
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Abidjan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Accra');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Addis_Ababa');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Algiers');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Asmara');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Bamako');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Bangui');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Banjul');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Bissau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Blantyre');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Brazzaville');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Bujumbura');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Cairo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Casablanca');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Ceuta');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Conakry');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Dakar');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Dar_es_Salaam');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Djibouti');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Douala');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/El_Aaiun');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Freetown');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Gaborone');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Harare');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Johannesburg');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Juba');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Kampala');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Khartoum');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Kigali');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Kinshasa');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Lagos');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Libreville');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Lome');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Luanda');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Lubumbashi');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Lusaka');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Malabo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Maputo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Maseru');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Mbabane');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Mogadishu');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Monrovia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Nairobi');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Ndjamena');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Niamey');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Nouakchott');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Ouagadougou');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Porto-Novo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Sao_Tome');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Tripoli');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Tunis');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Africa/Windhoek');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Adak');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Anchorage');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Anguilla');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Antigua');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Araguaina');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Buenos_Aires');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Catamarca');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Cordoba');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Jujuy');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/La_Rioja');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Mendoza');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Rio_Gallegos');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Salta');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/San_Juan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/San_Luis');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Tucuman');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Argentina/Ushuaia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Aruba');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Asuncion');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Atikokan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Bahia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Bahia_Banderas');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Barbados');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Belem');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Belize');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Blanc-Sablon');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Boa_Vista');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Bogota');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Boise');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Cambridge_Bay');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Campo_Grande');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Cancun');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Caracas');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Cayenne');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Cayman');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Chicago');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Chihuahua');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Costa_Rica');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Creston');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Cuiaba');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Curacao');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Danmarkshavn');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Dawson');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Dawson_Creek');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Denver');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Detroit');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Dominica');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Edmonton');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Eirunepe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/El_Salvador');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Fortaleza');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Glace_Bay');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Godthab');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Goose_Bay');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Grand_Turk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Grenada');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Guadeloupe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Guatemala');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Guayaquil');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Guyana');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Halifax');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Havana');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Hermosillo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Indianapolis');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Knox');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Marengo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Petersburg');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Tell_City');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Vevay');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Vincennes');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Indiana/Winamac');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Inuvik');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Iqaluit');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Jamaica');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Juneau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Kentucky/Louisville');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Kentucky/Monticello');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Kralendijk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/La_Paz');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Lima');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Los_Angeles');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Lower_Princes');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Maceio');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Managua');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Manaus');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Marigot');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Martinique');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Matamoros');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Mazatlan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Menominee');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Merida');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Metlakatla');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Mexico_City');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Miquelon');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Moncton');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Monterrey');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Montevideo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Montserrat');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Nassau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/New_York');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Nipigon');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Nome');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Noronha');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/North_Dakota/Beulah');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/North_Dakota/Center');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/North_Dakota/New_Salem');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Ojinaga');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Panama');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Pangnirtung');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Paramaribo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Phoenix');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Port-au-Prince');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Port_of_Spain');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Porto_Velho');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Puerto_Rico');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Rainy_River');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Rankin_Inlet');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Recife');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Regina');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Resolute');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Rio_Branco');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Santa_Isabel');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Santarem');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Santiago');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Santo_Domingo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Sao_Paulo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Scoresbysund');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Sitka');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Barthelemy');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Johns');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Kitts');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Lucia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Thomas');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/St_Vincent');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Swift_Current');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Tegucigalpa');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Thule');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Thunder_Bay');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Tijuana');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Toronto');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Tortola');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Vancouver');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Whitehorse');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Winnipeg');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Yakutat');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','America/Yellowknife');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Casey');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Davis');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/DumontDUrville');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Macquarie');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Mawson');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/McMurdo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Palmer');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Rothera');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Syowa');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Troll');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Antarctica/Vostok');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Arctic/Longyearbyen');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Aden');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Almaty');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Amman');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Anadyr');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Aqtau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Aqtobe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Ashgabat');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Baghdad');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Bahrain');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Baku');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Bangkok');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Beirut');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Bishkek');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Brunei');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Chita');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Choibalsan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Colombo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Damascus');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Dhaka');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Dili');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Dubai');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Dushanbe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Gaza');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Hebron');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Ho_Chi_Minh');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Hong_Kong');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Hovd');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Irkutsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Jakarta');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Jayapura');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Jerusalem');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kabul');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kamchatka');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Karachi');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kathmandu');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Khandyga');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kolkata');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Krasnoyarsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kuala_Lumpur');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kuching');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Kuwait');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Macau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Magadan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Makassar');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Manila');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Muscat');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Nicosia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Novokuznetsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Novosibirsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Omsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Oral');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Phnom_Penh');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Pontianak');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Pyongyang');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Qatar');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Qyzylorda');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Rangoon');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Riyadh');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Sakhalin');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Samarkand');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Seoul');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Shanghai');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Singapore');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Srednekolymsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Taipei');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Tashkent');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Tbilisi');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Tehran');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Thimphu');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Tokyo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Ulaanbaatar');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Urumqi');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Ust-Nera');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Vientiane');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Vladivostok');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Yakutsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Yekaterinburg');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Asia/Yerevan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Azores');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Bermuda');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Canary');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Cape_Verde');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Faroe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Madeira');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Reykjavik');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/South_Georgia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/St_Helena');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Atlantic/Stanley');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Adelaide');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Brisbane');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Broken_Hill');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Currie');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Darwin');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Eucla');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Hobart');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Lindeman');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Lord_Howe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Melbourne');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Perth');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Australia/Sydney');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Amsterdam');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Andorra');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Athens');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Belgrade');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Berlin');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Bratislava');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Brussels');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Bucharest');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Budapest');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Busingen');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Chisinau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Copenhagen');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Dublin');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Gibraltar');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Guernsey');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Helsinki');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Isle_of_Man');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Istanbul');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Jersey');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Kaliningrad');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Kiev');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Lisbon');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Ljubljana');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/London');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Luxembourg');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Madrid');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Malta');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Mariehamn');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Minsk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Monaco');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Moscow');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Oslo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Paris');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Podgorica');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Prague');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Riga');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Rome');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Samara');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/San_Marino');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Sarajevo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Simferopol');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Skopje');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Sofia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Stockholm');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Tallinn');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Tirane');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Uzhgorod');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Vaduz');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Vatican');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Vienna');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Vilnius');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Volgograd');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Warsaw');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Zagreb');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Zaporozhye');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Europe/Zurich');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Antananarivo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Chagos');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Christmas');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Cocos');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Comoro');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Kerguelen');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Mahe');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Maldives');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Mauritius');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Mayotte');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Indian/Reunion');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Apia');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Auckland');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Bougainville');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Chatham');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Chuuk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Easter');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Efate');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Enderbury');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Fakaofo');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Fiji');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Funafuti');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Galapagos');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Gambier');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Guadalcanal');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Guam');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Honolulu');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Johnston');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Kiritimati');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Kosrae');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Kwajalein');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Majuro');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Marquesas');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Midway');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Nauru');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Niue');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Norfolk');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Noumea');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Pago_Pago');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Palau');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Pitcairn');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Pohnpei');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Port_Moresby');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Rarotonga');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Saipan');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Tahiti');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Tarawa');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Tongatapu');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Wake');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','Pacific/Wallis');";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('','','','UTC');";
			
			
			
			/*============================================================
			  == #6.13# - POSTCODE                                      ==
			  ============================================================*/
			//$sSQL .= "INSERT INTO `".$sDBName."`.`POSTCODE` (POSTCODE_STATEPROVINCE_FK,POSTCODE_TIMEZONES_FK,POSTCODE_NAME) VALUES (1,1,'4655'); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`POSTCODE` (POSTCODE_STATEPROVINCE_FK,POSTCODE_TIMEZONES_FK,POSTCODE_NAME) VALUES (1,1,'4006'); \n";
			
			/*============================================================
			  == #6.14# - PREMISEBEDROOMS                               ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEBEDROOMS` (PREMISEBEDROOMS_PK,PREMISEBEDROOMS_COUNT) VALUES (1,'1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEBEDROOMS` (PREMISEBEDROOMS_PK,PREMISEBEDROOMS_COUNT) VALUES (2,'2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEBEDROOMS` (PREMISEBEDROOMS_PK,PREMISEBEDROOMS_COUNT) VALUES (3,'3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEBEDROOMS` (PREMISEBEDROOMS_PK,PREMISEBEDROOMS_COUNT) VALUES (4,'4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEBEDROOMS` (PREMISEBEDROOMS_PK,PREMISEBEDROOMS_COUNT) VALUES (5,'5+'); \n";
			
			/*============================================================
			  == #6.15# - PREMISEOCCUPANTS                              ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEOCCUPANTS` (PREMISEOCCUPANTS_PK,PREMISEOCCUPANTS_NAME) VALUES (1,'1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEOCCUPANTS` (PREMISEOCCUPANTS_PK,PREMISEOCCUPANTS_NAME) VALUES (2,'2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEOCCUPANTS` (PREMISEOCCUPANTS_PK,PREMISEOCCUPANTS_NAME) VALUES (3,'3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEOCCUPANTS` (PREMISEOCCUPANTS_PK,PREMISEOCCUPANTS_NAME) VALUES (4,'4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEOCCUPANTS` (PREMISEOCCUPANTS_PK,PREMISEOCCUPANTS_NAME) VALUES (5,'5+'); \n";
			
			/*============================================================
			  == #6.16# - PREMISEFLOORS                                 ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('7'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('8'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('9'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEFLOORS` (PREMISEFLOORS_NAME) VALUES ('10'); \n";
			
			/*============================================================
			  == #6.17# - PREMISEROOMS                                  ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('1'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('2'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('3'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('4'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('5'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('6'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('7'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('8'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('9'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEROOMS` (PREMISEROOMS_NAME) VALUES ('10+'); \n";
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData4: ".$sErrMesg );
	}
}
			

function DB_CreateDefaultData5( $sDBName ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			
			
			/*============================================================
			  == #6.9# - COMMTYPES                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK, COMMTYPE_NAME ) VALUES ( 1, 'Legacy' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK, COMMTYPE_NAME ) VALUES ( 2, 'PHP API' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK, COMMTYPE_NAME ) VALUES ( 3, 'Zigbee' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK, COMMTYPE_NAME ) VALUES ( 4, 'Bluetooth' ); \n";
			
			/*============================================================
			  == #6.9# - DATATYPES                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 1, 'tinyint' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 2, 'integer' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 3, 'biginteger' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 4, 'float' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 5, 'tinystring' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 6, 'shortstring' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 7, 'mediumstring' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 8, 'longstring' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 9, 'string255' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 11, 'blob' ); \n";
			
			
			/*============================================================
			  == #6.9# - IOTYPES                                        ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 1, 1, 'Real TinyInt', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 2, 2, 'Real Int', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 3, 3, 'Real BigInt', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 4, 4, 'Real Float', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 5, 5, 'Real Tiny String', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 6, 6, 'Real Short String', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 7, 7, 'Real Medium String', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 8, 8, 'Real Long String', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 9, 9, 'Real String255', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 11, 11, 'Real Blob', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 101, 1, 'Real TinyInt Enum', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 102, 2, 'Real Int Enum', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 103, 3, 'Real BigInt Enum', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 202, 2, 'Real Int Total', 2 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 203, 3, 'Real BigInt Total', 2 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`IOTYPE` ( `IOTYPE_PK`, `IOTYPE_DATATYPE_FK`, `IOTYPE_NAME`, `IOTYPE_ENUM` ) VALUES ( 204, 4, 'Real Float Total', 2 ); \n";
			
			
			/*============================================================
			  == #6.9# - LINKPROTOCOL                                   ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKPROTOCOL` ( `LINKPROTOCOL_NAME` ) VALUES ( 'Non Applicable' ); \n";
			
			
			/*============================================================
			  == #6.9# - LINKFREQUENCY                                  ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKFREQ` ( `LINKFREQ_NAME` ) VALUES ( 'Non Applicable' ); \n";
			
			
			/*============================================================
			  == #6.9# - LINKCRYPTTYPE                                  ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKCRYPTTYPE` ( `LINKCRYPTTYPE_NAME` ) VALUES ( 'None' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKCRYPTTYPE` ( `LINKCRYPTTYPE_NAME` ) VALUES ( 'WEP' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKCRYPTTYPE` ( `LINKCRYPTTYPE_NAME` ) VALUES ( 'WPA' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKCRYPTTYPE` ( `LINKCRYPTTYPE_NAME` ) VALUES ( 'WPA2' ); \n";
			
			
			/*============================================================
			  == #6.9# - LINKTYPE                                       ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Legacy: Cron Task' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Zigbee HA' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Android Smartphone' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'iPhone' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Bluetooth Device' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Onvif IP Camera' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Philips Hue Bridge' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Open Weather Map Feed' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Netvox Motion Sensor' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Thermostat' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Door Lock' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Window Sensor' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Garage Door' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'IP Camera' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Qualcomm CSRmesh' ); \n";
			
			/*============================================================
			  == #6.9# - THINGTYPE                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'DEBUG: Needs Categorization' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Zigbee Netvox SmartPlug' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Motion Sensor' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Temperature' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Thermostat' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'CC_Weather' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'CC_FuelCarbon' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Zigbee Meter' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'BT HeartRateMonitor' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'DevelCo LED Energy Meter Interface' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Zigbee Netvox SmartPlugPlus' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Onvif Camera Stream' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Philips Hue Light' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Weather Feed' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Door Lock' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Window Sensor' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Garage Door' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'MJPEG IP Camera' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'CSRMesh Light Bulb with On/Off' ); \n";
			
			/*============================================================
			  == #6.9# - ROOMTYPE                                       ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Master Bedroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Bedroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Bathroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Kitchen', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Laundry', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Office', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Study', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Living Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Dining Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Media Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'En suite', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Front Door', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Back Door', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Left Side', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Right Side', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Hallway', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Entrance', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Shed', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Garage', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Granny Flat', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Sun Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Play Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Pantry', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Verandah', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Balcony', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Patio', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Gazebo', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Terrace', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Stairway', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Basement', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Attic', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Lobby', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Deck', 1 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Recreation Room', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Utility Cabinet', 1 ); \n";
			
			
			/*============================================================
			  == #6.9# - RULETYPE1                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`RULE1TYPE` ( `RULE1TYPE_PK`, `RULE1TYPE_NAME` ) VALUES ( 1, 'Turn On (Once only)' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RULE1TYPE` ( `RULE1TYPE_PK`, `RULE1TYPE_NAME` ) VALUES ( 2, 'Turn Off (Once only)' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RULE1TYPE` ( `RULE1TYPE_PK`, `RULE1TYPE_NAME` ) VALUES ( 3, 'Turn On (Reoccurring)' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`RULE1TYPE` ( `RULE1TYPE_PK`, `RULE1TYPE_NAME` ) VALUES ( 4, 'Turn Off (Reoccurring)' ); \n";
			
			/*============================================================
			  == #6.9# - TARGETCOMP                                     ==
			  ============================================================*/
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMP` ( `TARGETCOMP_NAME` ) VALUES ( 'Usage/Generation Value' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMP` ( `TARGETCOMP_NAME` ) VALUES ( 'Cost' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMP` ( `TARGETCOMP_NAME` ) VALUES ( 'Carbon' ); \n";
			
			/*============================================================
			  == #6.9# - TARGETCOMPMODE                                 ==
			  ============================================================*/
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMPMODE` ( `TARGETCOMPMODE_NAME` ) VALUES ( 'Self Precise' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMPMODE` ( `TARGETCOMPMODE_NAME` ) VALUES ( 'Self Relative' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMPMODE` ( `TARGETCOMPMODE_NAME` ) VALUES ( 'Sensor Precise' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETCOMPMODE` ( `TARGETCOMPMODE_NAME` ) VALUES ( 'Sensor Relative' ); \n";
			
			/*============================================================
			  == #6.9# - TARGETTYPE                                     ==
			  ============================================================*/
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETTYPE` ( `TARGETTYPE_NAME` ) VALUES ( 'Premise' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETTYPE` ( `TARGETTYPE_NAME` ) VALUES ( 'Device' ); \n";
			//$sSQL .= "INSERT INTO `".$sDBName."`.`TARGETTYPE` ( `TARGETTYPE_NAME` ) VALUES ( 'Room' ); \n";
			
			
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->NonCommittedCreateQuery( $sSQL );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData5: ".$sErrMesg );
	}
}

//============================================================================================================================//
//== USERS
//============================================================================================================================//
function DB_GetUsersWithName( $sDBName, $sUsername ) {
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult		= array();
	$aReturn		= array();
	$sSQL			= "";
	$bError			= false;
	$sErrMesg		= "";
	
	//--------------------------------------------//
	//-- 3.0 - Fetch all users with that name   --//
	//--------------------------------------------//
	
	$sSQL .= "SELECT `USERS_PK`, `USERS_USERNAME` ";
	$sSQL .= "FROM `".$sDBName."`.`USERS` ";
	$sSQL .= "WHERE LOWER( `USERS`.`USERS_USERNAME` ) = LOWER( :LowercaseUsername ) ";
	
		
	//-- SQL Input Values --//
	$aInputVals = array(
		array( "Name"=>"LowercaseUsername",         "type"=>"STR",      "value"=>$sUsername ),
	);
	
	//-- SQL Output Values --//
	$aOutputCols = array(
		array( "Name"=>"UserId",                    "type"=>"INT" ),
		array( "Name"=>"UserName",                  "type"=>"STR" )
	);
	
	$aResult = $oRestrictedDB->FullBindQuery( $sSQL, $aInputVals, $aOutputCols, 0 );
	//-- Error Catching --//
	try {
		if( $aResult["Error"]===true ) {
			//if( $aResult['ErrMesg']==="No Rows Found! Code:0") {
			//	return array( "Error"=>false, "Data"=>array() );
				
			//} else {
				$bError = true;
				$sErrMesg = $aResult["ErrMesg"];
			//}
		}
	} catch(Exception $e) {
		//--TODO: Write an actual Error Message --//
	}
	
	//--------------------------------------------//
	//-- 9.0 - Return Results or Error Message	--//
	//--------------------------------------------// 
	if($bError===false) {
		return array( "Error"=>false, "Data"=>$aResult["Data"] );

	} else {
		return array( "Error"=>true, "ErrMesg"=>"GetUsersWithName: ".$sErrMesg );
	}
}


function DB_CreateDatabaseUser( $sDBName, $sUsername, $sLocation, $sPassword ) {
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult        = array();
	$aReturn        = array();
	$sSQL1          = "";
	$sSQL2          = "";
	$bError         = false;
	$sErrMesg       = "";
	
	//----------------------------------------------------//
	//-- 3.0 - Fetch all users with that name           --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------//
			//-- CREATE THE USER        --//
			//----------------------------//
			$sSQL1 .= "CREATE USER '".$sUsername."'@'".$sLocation."' IDENTIFIED BY :Password;  ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"Password",          "type"=>"STR",          "value"=>$sPassword             )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedCreateQuery( $sSQL1, $aInputValsInsert );
			
			
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
			
			if( $bError===false ) {
				//------------------------------------------//
				//-- SET THE DATABASE USER PERMISSIONS    --//
				//------------------------------------------//
				$sSQL2 .= "GRANT SELECT ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				$sSQL2 .= "GRANT UPDATE ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				$sSQL2 .= "GRANT INSERT ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				$sSQL2 .= "GRANT DELETE ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				$sSQL2 .= "GRANT EXECUTE ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				$sSQL2 .= "GRANT SHOW VIEW ON `".$sDBName."`.* TO '".$sUsername."'@'".$sLocation."'; ";
				
				
				$aResult = $oRestrictedDB->NonCommittedCreateQuery( $sSQL2 );
			}
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"CreateDatabaseUser: ".$sErrMesg );
	}
}


function DB_InsertUserInfo( $sDBName, $iGenderId, $sTitle, $sGivennames, $sSurnames, $sDisplayname, $sEmail, $sPhoneNumber, $sDoB ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the UserInfo to the database.      --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`USERSINFO` (";
			$sSQL .= "    `USERSINFO_USERSGENDER_FK`,      `USERSINFO_TITLE`, ";
			$sSQL .= "    `USERSINFO_GIVENNAMES`,          `USERSINFO_SURNAMES`, ";
			$sSQL .= "    `USERSINFO_DISPLAYNAME`,         `USERSINFO_EMAIL`, ";
			$sSQL .= "    `USERSINFO_PHONENUMBER`,         `USERSINFO_DOB` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :GenderId,        :Title, ";
			$sSQL .= "    :Givennames,      :Surnames, ";
			$sSQL .= "    :Displayname,     :Email, ";
			$sSQL .= "    :PhoneNumber,     :DoB ";
			$sSQL .= ") ";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"GenderId",          "type"=>"INT",          "value"=>$iGenderId             ),
				array( "Name"=>"Title",             "type"=>"STR",          "value"=>$sTitle                ),
				array( "Name"=>"Givennames",        "type"=>"STR",          "value"=>$sGivennames           ),
				array( "Name"=>"Surnames",          "type"=>"STR",          "value"=>$sSurnames             ),
				array( "Name"=>"Displayname",       "type"=>"STR",          "value"=>$sDisplayname          ),
				array( "Name"=>"Email",             "type"=>"STR",          "value"=>$sEmail                ),
				array( "Name"=>"PhoneNumber",       "type"=>"INT",          "value"=>$sPhoneNumber          ),
				array( "Name"=>"DoB",               "type"=>"STR",          "value"=>$sDoB                  )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"InsertUserInfo: ".$sErrMesg );
	}
}



function DB_InsertUser( $sDBName, $iUserInfoId, $sUsername, $iUserState ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the new User to the database.      --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`USERS` ( ";
			$sSQL .= "    `USERS_USERSINFO_FK`, `USERS_USERNAME`, `USERS_STATE` ";
			$sSQL .= ") VALUES (";
			$sSQL .= "    :UserInfo,    :Username,      :UserState ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"UserInfo",          "type"=>"INT",          "value"=>$iUserInfoId             ),
				array( "Name"=>"Username",          "type"=>"STR",          "value"=>$sUsername               ),
				array( "Name"=>"UserState",         "type"=>"INT",          "value"=>$iUserState              )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"InsertUser: ".$sErrMesg );
	}
}


function DB_InsertUserAddress( $sDBName, $iUserId, $iLanguageId, $iRegionId, $sSubRegion, $sPostcode, $iTimezoneId, $sLine1, $sLine2, $sLine3 ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the new User to the database.      --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`USERADDRESS` ( ";
			$sSQL .= "    `USERADDRESS_USERS_FK`,           `USERADDRESS_LANGUAGE_FK`, ";
			$sSQL .= "    `USERADDRESS_REGION_FK`,          `USERADDRESS_SUBREGION`, ";
			$sSQL .= "    `USERADDRESS_POSTCODE`,           `USERADDRESS_TIMEZONE_FK`, ";
			$sSQL .= "    `USERADDRESS_LINE1`,              `USERADDRESS_LINE2`, ";
			$sSQL .= "    `USERADDRESS_LINE3` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,          :LanguageId, ";
			$sSQL .= "    :RegionId,        :SubRegion, ";
			$sSQL .= "    :Postcode,        :TimezoneId, ";
			$sSQL .= "    :Line1,           :Line2, ";
			$sSQL .= "    :Line3 ";
			$sSQL .= ") ";
			
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",            "type"=>"INT",          "value"=>$iUserId                 ),
				array( "Name"=>"LanguageId",        "type"=>"INT",          "value"=>$iLanguageId             ),
				array( "Name"=>"RegionId",          "type"=>"INT",          "value"=>$iRegionId               ),
				array( "Name"=>"SubRegion",         "type"=>"STR",          "value"=>$sSubRegion              ),
				array( "Name"=>"Postcode",          "type"=>"STR",          "value"=>$sPostcode               ),
				array( "Name"=>"TimezoneId",        "type"=>"INT",          "value"=>$iTimezoneId             ),
				array( "Name"=>"Line1",             "type"=>"STR",          "value"=>$sLine1                  ),
				array( "Name"=>"Line2",             "type"=>"STR",          "value"=>$sLine2                  ),
				array( "Name"=>"Line3",             "type"=>"STR",          "value"=>$sLine3                  )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		return array( "Error"=>true, "ErrMesg"=>"InsertUserAddress: ".$sErrMesg );
	}
}


//============================================================================================================================//
//== PREMEISE
//============================================================================================================================//
function DB_InsertPremiseInfo( $sDBName, $iPremiseBedroomsId, $iPremiseOccupantsId, $iPremiseRoomsId, $iPremiseFloorsId ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the PremiseInfo to the database.   --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEINFO` ";
			$sSQL .= "    ( `PREMISEINFO_PREMISEBEDROOMS_FK`, `PREMISEINFO_PREMISEOCCUPANTS_FK`, `PREMISEINFO_PREMISEROOMS_FK`, `PREMISEINFO_PREMISEFLOORS_FK`) ";
			$sSQL .= "VALUES ";
			$sSQL .= "    ( :PremiseBedroomsId, :PremiseOccupantsId, :PremiseRoomsId, :PremiseFloorsId ); ";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseBedroomsId",         "type"=>"INT",          "value"=>$iPremiseBedroomsId    ),
				array( "Name"=>"PremiseOccupantsId",        "type"=>"INT",          "value"=>$iPremiseOccupantsId   ),
				array( "Name"=>"PremiseRoomsId",            "type"=>"INT",          "value"=>$iPremiseRoomsId       ),
				array( "Name"=>"PremiseFloorsId",           "type"=>"INT",          "value"=>$iPremiseFloorsId      )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPremiseInfo: ".$sErrMesg );
	}
}



function DB_InsertPremise( $sDBName, $iPremiseInfoId, $sPremiseName, $sPremiseDesc ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISE` ";
			$sSQL .= "    ( `PREMISE_PREMISEINFO_FK`, `PREMISE_NAME`, `PREMISE_DESCRIPTION` ) ";
			$sSQL .= "VALUES ";
			$sSQL .= "    ( :PremiseInfoId, :PremiseName, :PremiseDesc ); \n";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseInfoId",             "type"=>"BINT",         "value"=>$iPremiseInfoId        ),
				array( "Name"=>"PremiseName",               "type"=>"STR",          "value"=>$sPremiseName          ),
				array( "Name"=>"PremiseDesc",               "type"=>"STR",          "value"=>$sPremiseDesc          )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPremise: ".$sErrMesg );
	}
}


function DB_InsertPremiseAddress( $sDBName, $iPremiseId, $iLanguageId, $iTimezoneId, $iRegionId, $sSubRegion, $sPostcode, $sAddressLine1, $sAddressLine2, $sAddressLine3 ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PREMISEADDRESS` ( ";
			$sSQL .= "    `PREMISEADDRESS_PREMISE_FK`,      `PREMISEADDRESS_LANGUAGE_FK`, ";
			$sSQL .= "    `PREMISEADDRESS_TIMEZONE_FK`,     `PREMISEADDRESS_REGION_FK`, ";
			$sSQL .= "    `PREMISEADDRESS_SUBREGION`,       `PREMISEADDRESS_POSTCODE`, ";
			$sSQL .= "    `PREMISEADDRESS_LINE1`,           `PREMISEADDRESS_LINE2`, ";
			$sSQL .= "    `PREMISEADDRESS_LINE3`            ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :PremiseId,       :LanguageId,   ";
			$sSQL .= "    :TimezoneId,      :RegionId,     ";
			$sSQL .= "    :SubRegion,       :Postcode,     ";
			$sSQL .= "    :AddressLine1,    :AddressLine2, ";
			$sSQL .= "    :AddressLine3     ";
			$sSQL .= "); \n";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseId",                 "type"=>"BINT",         "value"=>$iPremiseId        ),
				array( "Name"=>"LanguageId",                "type"=>"INT",          "value"=>$iLanguageId       ),
				array( "Name"=>"TimezoneId",                "type"=>"INT",          "value"=>$iTimezoneId       ),
				array( "Name"=>"RegionId",                  "type"=>"INT",          "value"=>$iRegionId         ),
				array( "Name"=>"SubRegion",                 "type"=>"STR",          "value"=>$sSubRegion        ),
				array( "Name"=>"Postcode",                  "type"=>"STR",          "value"=>$sPostcode         ),
				array( "Name"=>"AddressLine1",              "type"=>"STR",          "value"=>$sAddressLine1     ),
				array( "Name"=>"AddressLine2",              "type"=>"STR",          "value"=>$sAddressLine2     ),
				array( "Name"=>"AddressLine3",              "type"=>"STR",          "value"=>$sAddressLine3     )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPremiseAddress: ".$sErrMesg );
	}
}

function DB_InsertPermPremise( $sDBName, $iUserId, $iPremiseId, $iPermOwner, $iPermWriter, $iPermStateToggle, $iPermRead, $iPermRoomAdmin ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PERMPREMISE` ";
			$sSQL .= "( ";
			$sSQL .= "    `PERMPREMISE_USERS_FK`,    `PERMPREMISE_PREMISE_FK`, ";
			$sSQL .= "    `PERMPREMISE_OWNER`,       `PERMPREMISE_WRITE`, ";
			$sSQL .= "    `PERMPREMISE_STATETOGGLE`, `PERMPREMISE_READ`, ";
			$sSQL .= "    `PERMPREMISE_ROOMADMIN` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,          :PremiseId, ";
			$sSQL .= "    :PermOwner,       :PermWriter, ";
			$sSQL .= "    :PermStateToggle, :PermRead, ";
			$sSQL .= "    :PermRoomAdmin ";
			$sSQL .= ") ";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",                  "type"=>"INT",          "value"=>$iUserId             ),
				array( "Name"=>"PremiseId",               "type"=>"INT",          "value"=>$iPremiseId          ),
				array( "Name"=>"PermOwner",               "type"=>"INT",          "value"=>$iPermOwner          ),
				array( "Name"=>"PermWriter",              "type"=>"INT",          "value"=>$iPermWriter         ),
				array( "Name"=>"PermStateToggle",         "type"=>"INT",          "value"=>$iPermStateToggle    ),
				array( "Name"=>"PermRead",                "type"=>"INT",          "value"=>$iPermRead           ),
				array( "Name"=>"PermRoomAdmin",           "type"=>"INT",          "value"=>$iPermRoomAdmin      )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
//		var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPermission1: ".$sErrMesg );
	}
}



function DB_InsertPermServer( $sDBName, $iUserId, $iPermAddUser, $iPermAddPremiseHub, $iPermUpgrade ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PERMSERVER` ";
			$sSQL .= "( ";
			$sSQL .= "    `PERMSERVER_USERS_FK`,             `PERMSERVER_ADDUSER`, ";
			$sSQL .= "    `PERMSERVER_ADDPREMISEHUB`,        `PERMSERVER_UPGRADE` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,                  :PermAddUser, ";
			$sSQL .= "    :PermAddPremiseHub,       :PermUpgrade ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",                  "type"=>"INT",          "value"=>$iUserId               ),
				array( "Name"=>"PermAddUser",             "type"=>"INT",          "value"=>$iPermAddUser          ),
				array( "Name"=>"PermAddPremiseHub",       "type"=>"INT",          "value"=>$iPermAddPremiseHub    ),
				array( "Name"=>"PermUpgrade",             "type"=>"INT",          "value"=>$iPermUpgrade          )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
//		var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPermServer2: ".$sErrMesg );
	}
}

function DB_InsertPermRoom( $sDBName, $iUserId, $iRoomId, $iPermRead, $iPermWriter, $iPermStateToggle, $iPermDataRead ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PERMROOMS` ";
			$sSQL .= "( ";
			$sSQL .= "    `PERMROOMS_USERS_FK`,      `PERMROOMS_ROOMS_FK`, ";
			$sSQL .= "    `PERMROOMS_READ`,          `PERMROOMS_WRITE`, ";
			$sSQL .= "    `PERMROOMS_STATETOGGLE`,   `PERMROOMS_DATAREAD` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,              :RoomId, ";
			$sSQL .= "    :PermRead,            :PermWriter, ";
			$sSQL .= "    :PermStateToggle,     :PermDataRead ";
			$sSQL .= ") ";
			
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",                  "type"=>"INT",          "value"=>$iUserId             ),
				array( "Name"=>"RoomId",                  "type"=>"INT",          "value"=>$iRoomId             ),
				array( "Name"=>"PermRead",                "type"=>"INT",          "value"=>$iPermRead           ),
				array( "Name"=>"PermWriter",              "type"=>"INT",          "value"=>$iPermWriter         ),
				array( "Name"=>"PermStateToggle",         "type"=>"INT",          "value"=>$iPermStateToggle    ),
				array( "Name"=>"PermDataRead",            "type"=>"INT",          "value"=>$iPermDataRead       )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
//		var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPermRoom: ".$sErrMesg );
	}
}

function DB_InsertPermHub( $sDBName, $iUserId, $iHubId ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the WatchInputs User Permissions   --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Default Data    --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`PERMHUB` ";
			$sSQL .= "( ";
			$sSQL .= "    `PERMHUB_USERS_FK`,             `PERMHUB_HUB_FK` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,                  :HubId ";
			$sSQL .= ") ";
			
			//-- Input binding --//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",            "type"=>"INT",          "value"=>$iUserId               ),
				array( "Name"=>"HubId",             "type"=>"INT",          "value"=>$iHubId                )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
//		var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertPermHub: ".$sErrMesg );
	}
}




function DB_InsertHub( $sDBName, $iPremiseId, $iHubTypeId, $sHubName, $sHubSerialCode, $sHubIPAddress ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Hub             --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`HUB` ";
			$sSQL .= "( ";
			$sSQL .= "    `HUB_PREMISE_FK`, `HUB_HUBTYPE_FK`, ";
			$sSQL .= "    `HUB_NAME`,       `HUB_SERIALNUMBER`, ";
			$sSQL .= "    `HUB_IPADDRESS` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :PremiseId,   :HubTypeId, ";
			$sSQL .= "    :HubName,     :HubSerialCode, ";
			$sSQL .= "    :HubIPAddress ";
			$sSQL .= ") ";
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseId",         "type"=>"INT",          "value"=>$iPremiseId          ),
				array( "Name"=>"HubTypeId",         "type"=>"INT",          "value"=>$iHubTypeId          ),
				array( "Name"=>"HubName",           "type"=>"STR",          "value"=>$sHubName            ),
				array( "Name"=>"HubSerialCode",     "type"=>"STR",          "value"=>$sHubSerialCode      ),
				array( "Name"=>"HubIPAddress",      "type"=>"STR",          "value"=>$sHubIPAddress       )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertHub: ".$sErrMesg );
	}
}



function DB_InsertRoom( $sDBName, $iPremiseId ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Rooms           --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMS` ";
			$sSQL .= "( ";
			$sSQL .= "    `ROOMS_PREMISE_FK`, `ROOMS_ROOMTYPE_FK`, ";
			$sSQL .= "    `ROOMS_NAME`,       `ROOMS_FLOOR`, ";
			$sSQL .= "    `ROOMS_DESC` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :PremiseId,   1, ";
			$sSQL .= "    'Unassigned', 0, ";
			$sSQL .= "    '' ";
			$sSQL .= ") ";
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"PremiseId",         "type"=>"INT",          "value"=>$iPremiseId          )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertRoom: ".$sErrMesg );
	}
}



function InsertTheDatabaseCoreValues( $sDBName ) {
	
	//------------------------------------------------------------//
	//-- 1.0 - Declare Variables                                --//
	//------------------------------------------------------------//
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aCoreResult        = array();      //-- ARRAY:     --//
	$aCoreAddonResult   = array();      //-- ARRAY:     --//
	$aResult            = array();      //-- ARRAY:     --//
	
	$iCoreId            = 0;            //-- INTEGER:   --//
	$iCurrentUTS        = time();       //-- INTEGER:   Holds the current unix timestamp so that it can be submitted into the database --//
	
	//------------------------------------------------------------//
	//-- 2.0 - Preperation                                      --//
	//------------------------------------------------------------//
	
	
	
	
	//------------------------------------------------------------//
	//-- 3.0 - Call the Add the core version to the database    --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//----------------------------------------------------//
		//-- 3.1 - Perform the insert                       --//
		//----------------------------------------------------//
		$aCoreResult = DB_InsertCore( $sDBName, "iOmy (Vanilla)", 0, 4, 11, $iCurrentUTS );
		
		//----------------------------------------------------//
		//-- 3.2 - Check for errors                         --//
		//----------------------------------------------------//
		if( $aCoreResult['Error']===false ) {
			//-- Extract the CoreId from the results --//
			$iCoreId = $aCoreResult['LastId'];
			
		} else {
			//-- ERROR: Failed to insert the Core values to the database --//
			$bError = true;
			$sErrMesg .= "Error submitting the Core values into the database!\n";
			$sErrMesg .= $aCoreResult['ErrMesg'];
		}
	}
	
	
	//------------------------------------------------------------//
	//-- 4.0 - Add the schema version to the database           --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//----------------------------------------------------//
		//-- 4.1 - Insert the Schema Name into the database --//
		//----------------------------------------------------//
		$aCoreAddonResult = DB_InsertCoreAddon( $sDBName, $iCoreId, "iOmy Schema", 0, 4, 11, $iCurrentUTS );
		
		//----------------------------------------------------//
		//-- 4.2 - Check for errors                         --//
		//----------------------------------------------------//
		if( $aCoreAddonResult['Error']===false ) {
			//-- Prepare the Result --//
			$aResult = array(
				"CoreId"   => $iCoreId,
				"SchemaId" => $aCoreAddonResult['LastId']
			);
			
		} else {
			//-- ERROR: Failed to insert the Schema version into the CoreAddon Table in the database --//
			$bError = true;
			$sErrMesg .= "Error submitting the Core values into the database!\n";
			$sErrMesg .= $aCoreAddonResult['ErrMesg'];
		}
	}
	
	
	
	//------------------------------------------------------------//
	//-- 9.0 - Return the Results                               --//
	//------------------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false, "Data"=>$aResult );
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>$sErrMesg );
	}
}




function DB_InsertCore( $sDBName, $sName, $iVersion1, $iVersion2, $iVersion3, $iSetupUTS ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Core            --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`CORE` ";
			$sSQL .= "( ";
			$sSQL .= "    `CORE_NAME`,      `CORE_VERSION1`, ";
			$sSQL .= "    `CORE_VERSION2`,  `CORE_VERSION3`, ";
			$sSQL .= "    `CORE_SETUPUTS` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :Name,          :Version1, ";
			$sSQL .= "    :Version2,      :Version3, ";
			$sSQL .= "    :SetupUTS ";
			$sSQL .= ") ";
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"Name",              "type"=>"STR",          "value"=>$sName               ),
				array( "Name"=>"Version1",          "type"=>"INT",          "value"=>$iVersion1           ),
				array( "Name"=>"Version2",          "type"=>"INT",          "value"=>$iVersion2           ),
				array( "Name"=>"Version3",          "type"=>"INT",          "value"=>$iVersion3           ),
				array( "Name"=>"SetupUTS",          "type"=>"BINT",         "value"=>$iSetupUTS           )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertCore: ".$sErrMesg );
	}
}

function DB_InsertCoreAddon( $sDBName, $iCoreId, $sName, $iVersion1, $iVersion2, $iVersion3, $iSetupUTS ) {
	//------------------------------------------------------------------------//
	//-- DESCRIPTION:                                                       --//
	//--    This function is used to add the default data to the database.  --//
	//------------------------------------------------------------------------//
	
	
	//----------------------------------------------------//
	//-- 1.0 - Declare Variables                        --//
	//----------------------------------------------------//
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Normal Variables --//
	$bError             = false;        //-- BOOLEAN:   Used to indicate if an Error has been caught. --//
	$sErrMesg           = "";           //-- STRING:    Stores the error message when an error has been caught. --//
	$aInputValsInsert   = array();      //-- ARRAY:     SQL bind input parameters. --//
	$aResultInsert      = array();      //-- ARRAY:     Used to store the result that will be returned at the end of this function. --//
	$sSQL               = "";           //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	
	//----------------------------------------------------//
	//-- 2.0 - SQL Preperation                          --//
	//----------------------------------------------------//
	if($bError===false) {
		try {
			//----------------------------------------//
			//-- SQL Query - Create Core            --//
			//----------------------------------------//
			$sSQL .= "INSERT INTO `".$sDBName."`.`COREADDON` ";
			$sSQL .= "( ";
			$sSQL .= "    `COREADDON_CORE_FK`,   `COREADDON_NAME`, ";
			$sSQL .= "    `COREADDON_VERSION1`,  `COREADDON_VERSION2`, ";
			$sSQL .= "    `COREADDON_VERSION3`,  `COREADDON_SETUPUTS` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :CoreId,         :Name, ";
			$sSQL .= "    :Version1,       :Version2, ";
			$sSQL .= "    :Version3,       :SetupUTS ";
			$sSQL .= ") ";
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"CoreId",            "type"=>"BINT",         "value"=>$iCoreId             ),
				array( "Name"=>"Name",              "type"=>"STR",          "value"=>$sName               ),
				array( "Name"=>"Version1",          "type"=>"INT",          "value"=>$iVersion1           ),
				array( "Name"=>"Version2",          "type"=>"INT",          "value"=>$iVersion2           ),
				array( "Name"=>"Version3",          "type"=>"INT",          "value"=>$iVersion3           ),
				array( "Name"=>"SetupUTS",          "type"=>"BINT",         "value"=>$iSetupUTS           )
			);
			
			//-- Run the SQL Query and save the results --//
			$aResultInsert = $oRestrictedDB->InputBindNonCommittedInsertQuery( $sSQL, $aInputValsInsert );
			
		} catch(Exception $e2) {
			$bError   = true;
			$sErrMesg = $e2->getMessage();
		}
	}
	
	//----------------------------------------------------//
	//-- 4.0 - Error Check                              --//
	//----------------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResultInsert["Error"]===true ) {
				$bError    = true;
				$sErrMesg .= $aResultInsert["ErrMesg"];
			}
		} catch( Exception $e3) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return $aResultInsert;
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"InsertCoreAddon: ".$sErrMesg );
	}
}



function DB_ChangeUserPassword( $sPassword ) {
	//-- TODO: Make a fallback to use the "MySQL 5.7.6" Method for when this method is no longer supported --//
	
	//--------------------------------------------//
	//-- 1.0 - Declare Variables                --//
	//--------------------------------------------//
		
	//-- 1.1 - Global Variables --//
	global $oRestrictedDB;
	
	//-- 1.2 - Other Varirables --//
	$aResult            = array();  //-- ARRAY:     --//
	$sSQL               = "";       //-- STRING:    Used to store the SQL string so it can be passed to the database functions. --//
	$bError             = false;    //-- BOOL:      --//
	$sErrMesg           = "";       //-- STRING:    --//
	$aInputVals         = array();  //-- ARRAY:     --//
	
	
	//--------------------------------------------//
	//-- 2.0 - SQL Query                        --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			$sSQL .= "SET PASSWORD = PASSWORD( :NewPassword ) ";
			
			$aInputVals = array(
				array( "Name"=>"NewPassword",           "type"=>"STR",      "value"=>$sPassword     )
			);
			
			$aResult = $oRestrictedDB->InputBindUpdateQuery( $sSQL, $aInputVals );
			
		} catch( Exception $e2 ) {
			$bError    = true;
			$sErrMesg .= $e2->getMessage();
		}
	}
	
	//--------------------------------------------//
	//-- 4.0 - Error Check                      --//
	//--------------------------------------------//
	if( $bError===false ) {
		try {
			if( $aResult["Error"]===true ) {
				$bError = true;
				$sErrMesg .= $aResult["ErrMesg"];
			}
		} catch( Exception $e ) {
			//-- TODO: Write error message for when Database Library returns an unexpected result --//
		}
	}
	
	//--------------------------------------------//
	//-- 5.0 Return Results or Error Message    --//
	//--------------------------------------------// 
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( "Error"=>false,	"Data"=>array("Result"=>"Updated succesfully")	);
	} else {
		return array( "Error"=>true,	"ErrMesg"=>"ChangeSpecialPassword: ".$sErrMesg		);
	}
}




function PHPConfig_Write( $sDBName, $sDBURI, $sDBPort ) {
	//----------------------------------------------------//
	//-- 1.0 - Initialise Variables                     --//
	//----------------------------------------------------//
	$bError         = false;
	$sErrMesg       = "";
	
	$sTemp          = "";
	$sCryptKey      = "";
	$sConfig        = "";
	
	
	try {
		//----------------------------------------------------//
		//-- 2.0 - Setup Variables                          --//
		//----------------------------------------------------//
		$sTemp = rtrim(base64_encode(md5(microtime().rand( 1000000, 10000000))),"=");
		$sCryptKey = substr( $sTemp, 0, 26 );
		
		//----------------------------------------------------//
		//-- 3.0 - Create Config String                     --//
		//----------------------------------------------------//
		$sConfig  = "<?php \n";
		$sConfig .= "//========================================================================================================// \n";
		$sConfig .= "//== @Author: Andrew Somerville <support@capsicumcorp.com> \n";
		$sConfig .= "//== @Description: Holds the configuration variables for the PHP API Backend \n";
		$sConfig .= "//== @Copyright: Capsicum Corporation 2015-2016 \n";
		$sConfig .= "//==  \n";
		$sConfig .= "//== This file is part of Backend of the iOmy project. \n";
		$sConfig .= "//========================================================================================================// \n";
		$sConfig .= "//== iOmy is free software: you can redistribute it and/or modify it under the terms of the \n";
		$sConfig .= "//== GNU General Public License as published by the Free Software Foundation, either version 3 of the \n";
		$sConfig .= "//== License, or (at your option) any later version. \n";
		$sConfig .= "//==  \n";
		$sConfig .= "//== iOmy is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; \n";
		$sConfig .= "//== without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. \n";
		$sConfig .= "//== See the GNU General Public License for more details. \n";
		$sConfig .= "//==  \n";
		$sConfig .= "//== You should have received a copy of the GNU General Public License along with iOmy. \n";
		$sConfig .= "//== If not, see <http://www.gnu.org/licenses/>. \n";
		$sConfig .= "//========================================================================================================// \n";

		$sConfig .= "//================================================// \n";
		$sConfig .= "//== START of Configurable variables            ==// \n";
		$sConfig .= "//================================================// \n";
		$sConfig .= '$Config = array( '."\n";
		$sConfig .= "	'Core' => array( \n";
		$sConfig .= "		'EnableAddHubMode' => true, \n";
		$sConfig .= "		'SecurityWarnings' => false, \n";
		$sConfig .= "		'EnableUpgradeAPI' => false, \n";
		$sConfig .= "		'CryptKey'         => '".$sCryptKey."' \n";
		$sConfig .= "	), \n";
		$sConfig .= "	'Debug' => array( \n";
		$sConfig .= "		'restrictapicore_login' => false \n";
		$sConfig .= "	), \n";
		$sConfig .= "	'DB' => array( \n";
		$sConfig .= "		array( \n";
		$sConfig .= "			'mode'       => 'EncryptedSession', \n";
		$sConfig .= "			'type'       => 'MySQL', \n";
		$sConfig .= "			'uri'        => 'mysql:host=".$sDBURI.";port=".$sDBPort.";', \n";
		$sConfig .= "			'charset'    => 'utf8', \n"; 
		$sConfig .= "			'schema'     => '".$sDBName."', \n";
		$sConfig .= "			'logschema'  => '".$sDBName."', \n";
		$sConfig .= "			'viewschema' => '".$sDBName."' \n";
		$sConfig .= "		) \n";
		$sConfig .= "	) \n";
		$sConfig .= "); \n";
		$sConfig .= "//================================================// \n";
		$sConfig .= "//== END of Configurable variables              ==// \n";
		$sConfig .= "//================================================// \n";
		$sConfig .= '?>';
		
		//----------------------------------------------------//
		//-- 4.0 - Open and write to the Config file        --//
		//----------------------------------------------------//
		$oFile = fopen( SITE_BASE.'/restricted/config/iomy_vanilla.php', "w" );
		fwrite( $oFile, $sConfig );
		fclose( $oFile );
		
		
		
	} catch( Exception $e3) {
		//-- TODO: Write error message for when Database Library returns an unexpected result --//
		$bError = true;
		$sErrMesg  = "Critical Error!\n";
		$sErrMesg .= $e3->getMessage();
	}
	
	
	//----------------------------------------------------//
	//-- 5.0 - Return Results or Error Message          --//
	//----------------------------------------------------//
	if( $bError===false ) {
		//-- Return that it was successful --//
		return array( 'Error'=>false, "Data"=>"Success" );
		
	} else {
		//var_dump( $oRestrictedDB->QueryLogs );
		return array( "Error"=>true, "ErrMesg"=>"WritePHPFile: ".$sErrMesg );
	}
}





?>
