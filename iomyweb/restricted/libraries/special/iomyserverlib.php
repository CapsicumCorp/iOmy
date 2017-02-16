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
	Countries
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
			
			$sSQL .= "create table `".$sDBName."`.COREADDON \n";
			$sSQL .= "( \n";
			$sSQL .= "   COREADDON_PK         integer not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   COREADDON_CORE_FK    integer not null comment 'Foreign Key', \n";
			$sSQL .= "   COREADDON_NAME       varchar(40) not null, \n";
			$sSQL .= "   COREADDON_VERSION1   integer not null, \n";
			$sSQL .= "   COREADDON_VERSION2   integer not null, \n";
			$sSQL .= "   COREADDON_VERSION3   integer not null, \n";
			$sSQL .= "   COREADDON_SETUPUTS  bigint not null, \n";
			$sSQL .= "   primary key (COREADDON_PK) \n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset."; \n"; 
			break;
			
		/*==============================================================*/
		/* Table: COUNTRIES & CURRENCIES                                */
		/*==============================================================*/
		case 'Countries':
			$sSQL .= "create table `".$sDBName."`.`COUNTRIES` \n";
			$sSQL .= "(\n";
			$sSQL .= "   COUNTRIES_PK         int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   COUNTRIES_CURRENCIES_FK int comment 'Foreign Key', \n";
			$sSQL .= "   COUNTRIES_NAME      varchar(64) not null, \n";
			$sSQL .= "   COUNTRIES_ABREVIATION varchar(16) not null, \n";
			$sSQL .= "   primary key (COUNTRIES_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`COUNTRIES` comment 'Stores a list of supported countries.';\n";
			
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
		/* Table: LANGUAGE & STATEPROVINCE                              */
		/*==============================================================*/
		case 'Language':
			$sSQL .= "create table `".$sDBName."`.`LANGUAGE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   LANGUAGE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   LANGUAGE_COUNTRIES_FK int comment 'Foreign Key', \n";
			$sSQL .= "   LANGUAGE_NAME        varchar(64), \n";
			$sSQL .= "   LANGUAGE_LANGUAGE    int not null, \n";
			$sSQL .= "   LANGUAGE_VARIANT     varchar(64), \n";
			$sSQL .= "   LANGUAGE_ENCODING    varchar(32), \n";
			$sSQL .= "   primary key (LANGUAGE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table `".$sDBName."`.`LANGUAGE` comment 'Stores a list of supported languages.';\n";
			
			$sSQL .= "create table `".$sDBName."`.`STATEPROVINCE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   STATEPROVINCE_PK     int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   STATEPROVINCE_COUNTRIES_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   STATEPROVINCE_SHORTNAME varchar(8), \n";
			$sSQL .= "   STATEPROVINCE_NAME varchar(64) not null, \n";
			$sSQL .= "   primary key (STATEPROVINCE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".STATEPROVINCE comment 'Stores a list of supported states.';\n";
			break;
			
		/*==============================================================*/
		/* Table: POSTCODE & TIMEZONE                                   */
		/*==============================================================*/
		case 'Postcode':
			$sSQL .= "create table `".$sDBName."`.`POSTCODE` \n";
			$sSQL .= "(\n";
			$sSQL .= "   POSTCODE_PK          int not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   POSTCODE_STATEPROVINCE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   POSTCODE_TIMEZONES_FK int comment 'Foreign Key', \n";
			$sSQL .= "   POSTCODE_NAME        varchar(48) not null, \n";
			$sSQL .= "   primary key (POSTCODE_PK)\n";
			$sSQL .= ") ENGINE=InnoDB  DEFAULT CHARSET=".$sDefaultCharset.";\n";
			$sSQL .= "alter table ".$sDBName.".POSTCODE comment 'Stores a list of supported postcodes.';\n";
			
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
			$sSQL .= "   USERADDRESS_PK       bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   USERADDRESS_USERS_FK bigint not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_LANGUAGE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_COUNTRIES_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_STATEPROVINCE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_POSTCODE_FK int not null comment 'Foreign Key', \n";
			$sSQL .= "   USERADDRESS_TIMEZONE_FK int not null comment 'Foreign Key', \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE1 varchar(128) not null, \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE2 varchar(128) not null, \n";
//			$sSQL .= "   USERADDRESS_POSTALLINE3 varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE1    varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE2    varchar(128) not null, \n";
			$sSQL .= "   USERADDRESS_LINE3    varchar(128) not null, \n";
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
			$sSQL .= "   PREMISEADDRESS_PK    bigint not null auto_increment comment 'Primary Key', \n";
			$sSQL .= "   PREMISEADDRESS_PREMISE_FK bigint comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_LANGUAGE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_COUNTRIES_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_STATEPROVINCE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_POSTCODE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_TIMEZONE_FK int comment 'Foreign Key', \n";
			$sSQL .= "   PREMISEADDRESS_LINE1 varchar(128), \n";
			$sSQL .= "   PREMISEADDRESS_LINE2 varchar(128), \n";
			$sSQL .= "   PREMISEADDRESS_LINE3 varchar(128), \n";
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
	Countries
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
		/* Table: COUNTRIES & CURRENCIES                                */
		/*==============================================================*/
		case 'Countries':
			$sSQL .= "alter table `".$sDBName."`.COUNTRIES add constraint FK_COUNTRIES_CURRENCIES foreign key (COUNTRIES_CURRENCIES_FK) references `".$sDBName."`.CURRENCIES (CURRENCIES_PK) on delete restrict on update restrict; \n";
			break;
		
		/*==============================================================*/
		/* Table: LANGUAGE & STATEPROVINCE                              */
		/*==============================================================*/
		case 'Language':
			$sSQL .= "alter table `".$sDBName."`.STATEPROVINCE add constraint FK_STATEPROVINCE_COUNTRIES foreign key (STATEPROVINCE_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict; \n";
			$sSQL .= "alter table `".$sDBName."`.LANGUAGE add constraint FK_LANGUAGE_COUNTRIES foreign key (LANGUAGE_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: POSTCODE & TIMEZONE                                   */
		/*==============================================================*/
		case 'Postcode':
			//$sSQL .= "alter table `".$sDBName."`.POSTCODE add constraint FK_POSTCODE_STATEPROVINCE foreign key (POSTCODE_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.POSTCODE add constraint FK_POSTCODE_TIMEZONE foreign key (POSTCODE_TIMEZONES_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.POSTCODE \n";
			$sSQL .= "    add constraint FK_POSTCODE_STATEPROVINCE foreign key (POSTCODE_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_POSTCODE_TIMEZONE foreign key (POSTCODE_TIMEZONES_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";
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
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_COUNTRIES foreign key (USERADDRESS_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_LANGUAGE foreign key (USERADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_POSTCODE foreign key (USERADDRESS_POSTCODE_FK) references `".$sDBName."`.POSTCODE (POSTCODE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_STATEPROVINCE foreign key (USERADDRESS_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_TIMEZONE foreign key (USERADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.USERADDRESS add constraint FK_USERADDRESS_USERS foreign key (USERADDRESS_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.USERADDRESS \n";
			$sSQL .= "    add constraint FK_USERADDRESS_COUNTRIES foreign key (USERADDRESS_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_LANGUAGE foreign key (USERADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_POSTCODE foreign key (USERADDRESS_POSTCODE_FK) references `".$sDBName."`.POSTCODE (POSTCODE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_STATEPROVINCE foreign key (USERADDRESS_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_TIMEZONE foreign key (USERADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_USERADDRESS_USERS foreign key (USERADDRESS_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
			
			
			break;
			
		/*==============================================================*/
		/* Table: PERMISSIONS                                           */
		/*==============================================================*/
		case 'Permissions1':
			//$sSQL .= "alter table `".$sDBName."`.PERMPREMISE add constraint FK_PERMPREMISE_PREMISE foreign key (PERMPREMISE_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PERMPREMISE add constraint FK_PERMPREMISE_USERS foreign key (PERMPREMISE_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.PERMPREMISE \n";
			$sSQL .= "    add constraint FK_PERMPREMISE_PREMISE foreign key (PERMPREMISE_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PERMPREMISE_USERS foreign key (PERMPREMISE_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
			break;
			
		case 'Permissions2':
			//$sSQL .= "alter table `".$sDBName."`.PERMROOMS add constraint FK_PERMROOMS_ROOMS foreign key (PERMROOMS_ROOMS_FK) references `".$sDBName."`.ROOMS (ROOMS_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PERMROOMS add constraint FK_PERMROOMS_USERS foreign key (PERMROOMS_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
			
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
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_COUNTRIES foreign key (PREMISEADDRESS_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_LANGUAGE foreign key (PREMISEADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_POSTCODE foreign key (PREMISEADDRESS_POSTCODE_FK) references `".$sDBName."`.POSTCODE (POSTCODE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_PREMISE foreign key (PREMISEADDRESS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_STATEPROVINCE foreign key (PREMISEADDRESS_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS add constraint FK_PREMISEADDRESS_TIMEZONE foreign key (PREMISEADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.PREMISEADDRESS \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_COUNTRIES foreign key (PREMISEADDRESS_COUNTRIES_FK) references `".$sDBName."`.COUNTRIES (COUNTRIES_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_LANGUAGE foreign key (PREMISEADDRESS_LANGUAGE_FK) references `".$sDBName."`.LANGUAGE (LANGUAGE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_POSTCODE foreign key (PREMISEADDRESS_POSTCODE_FK) references `".$sDBName."`.POSTCODE (POSTCODE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_PREMISE foreign key (PREMISEADDRESS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_STATEPROVINCE foreign key (PREMISEADDRESS_STATEPROVINCE_FK) references `".$sDBName."`.STATEPROVINCE (STATEPROVINCE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_PREMISEADDRESS_TIMEZONE foreign key (PREMISEADDRESS_TIMEZONE_FK) references `".$sDBName."`.TIMEZONE (TIMEZONE_PK) on delete restrict on update restrict; \n";

			
			break;
			
		/*==============================================================*/
		/* Table: PREMISELOG & PREMISELOGACTION                         */
		/*==============================================================*/
		case 'PremiseLog':
			//$sSQL .= "alter table `".$sDBName."`.PREMISELOG add constraint FK_PREMISELOG_CUSTOMLOG foreign key (PREMISELOG_CUSTOMLOG_FK) references `".$sDBName."`.CUSTOMLOG (CUSTOMLOG_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISELOG add constraint FK_PREMISELOG_PREMISE foreign key (PREMISELOG_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISELOG add constraint FK_PREMISELOG_PREMISELOGACTION foreign key (PREMISELOG_PREMISELOGACTION_FK) references `".$sDBName."`.PREMISELOGACTION (PREMISELOGACTION_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISELOG add constraint FK_PREMISELOG_USERS foreign key (PREMISELOG_USERS_FK) references `".$sDBName."`.USERS (USERS_PK) on delete restrict on update restrict; \n";
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
			//$sSQL .= "alter table `".$sDBName."`.PREMISEINFO add constraint FK_PREMISEINFO_PREMISEBEDROOMS foreign key (PREMISEINFO_PREMISEBEDROOMS_FK) references `".$sDBName."`.PREMISEBEDROOMS (PREMISEBEDROOMS_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEINFO add constraint FK_PREMISEINFO_PREMISEFLOORS foreign key (PREMISEINFO_PREMISEFLOORS_FK) references `".$sDBName."`.PREMISEFLOORS (PREMISEFLOORS_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEINFO add constraint FK_PREMISEINFO_PREMISEOCCUPANTS foreign key (PREMISEINFO_PREMISEOCCUPANTS_FK) references `".$sDBName."`.PREMISEOCCUPANTS (PREMISEOCCUPANTS_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.PREMISEINFO add constraint FK_PREMISEINFO_PREMISEROOMS foreign key (PREMISEINFO_PREMISEROOMS_FK) references `".$sDBName."`.PREMISEROOMS (PREMISEROOMS_PK) on delete restrict on update restrict; \n";
			
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
			//$sSQL .= "alter table `".$sDBName."`.ROOMS add constraint FK_ROOMS_PREMISE foreign key (ROOMS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.ROOMS add constraint FK_ROOMS_ROOMTYPE foreign key (ROOMS_ROOMTYPE_FK) references `".$sDBName."`.ROOMTYPE (ROOMTYPE_PK) on delete restrict on update restrict; \n";
			
			$sSQL .= "alter table `".$sDBName."`.ROOMS \n";
			$sSQL .= "    add constraint FK_ROOMS_PREMISE foreign key (ROOMS_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict, \n";
			$sSQL .= "    add constraint FK_ROOMS_ROOMTYPE foreign key (ROOMS_ROOMTYPE_FK) references `".$sDBName."`.ROOMTYPE (ROOMTYPE_PK) on delete restrict on update restrict; \n";
			break;
			
		/*==============================================================*/
		/* Table: HUB & HUBTYPE                                         */
		/*==============================================================*/
		case 'Hub':
			//$sSQL .= "alter table `".$sDBName."`.HUB add constraint FK_HUB_HUBTYPE foreign key (HUB_HUBTYPE_FK) references `".$sDBName."`.HUBTYPE (HUBTYPE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.HUB add constraint FK_HUB_PREMISE foreign key (HUB_PREMISE_FK) references `".$sDBName."`.PREMISE (PREMISE_PK) on delete restrict on update restrict; \n";
			
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
			//$sSQL .= "alter table `".$sDBName."`.LINK add constraint FK_LINK_COMM foreign key (LINK_COMM_FK) references `".$sDBName."`.COMM (COMM_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINK add constraint FK_LINK_LINKCONN foreign key (LINK_LINKCONN_FK) references `".$sDBName."`.LINKCONN (LINKCONN_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINK add constraint FK_LINK_LINKINFO foreign key (LINK_LINKINFO_FK) references `".$sDBName."`.LINKINFO (LINKINFO_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINK add constraint FK_LINK_LINKTYPE foreign key (LINK_LINKTYPE_FK) references `".$sDBName."`.LINKTYPE (LINKTYPE_PK) on delete restrict on update restrict; \n";
			//$sSQL .= "alter table `".$sDBName."`.LINK add constraint FK_LINK_ROOMS foreign key (LINK_ROOMS_FK) references `".$sDBName."`.ROOMS (ROOMS_PK) on delete restrict on update restrict; \n";
			
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
	3.06 - PublicCountries
	3.07 - PublicCurrencies
	3.08 - PublicLanguages
	3.09 - PublicPostcodes
	3.10 - PublicStateProvince
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
	
	6.01 - WatchInputsUsersHub
	6.02 - WatchInputsUsersComm
	6.03 - WatchInputsUsersLink
	6.04 - WatchInputsUsersThing
	6.05 - WatchInputsUsersIO
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
		  == #3.6# - COUNTRIES                                      ==
		  ============================================================*/
		case "PublicCountries":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_COUNTRIES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION` \n";
			$sSQL .= "FROM `".$sDBName."`.`COUNTRIES`; \n";
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
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION` \n";
			$sSQL .= "FROM `".$sDBName."`.`CURRENCIES` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `CURRENCIES_PK`=`COUNTRIES_CURRENCIES_FK`;\n";
			break;
			
		/*============================================================
		  == #3.8# - LANGUAGES                                      ==
		  ============================================================*/
		case "PublicLanguages":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_LANGUAGES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `LANGUAGE_PK`, \n";
			$sSQL .= "    `LANGUAGE_NAME`, \n";
			$sSQL .= "    `LANGUAGE_LANGUAGE`, \n";
			$sSQL .= "    `LANGUAGE_VARIANT`, \n";
			$sSQL .= "    `LANGUAGE_ENCODING`, \n";
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION` \n";
			$sSQL .= "FROM `".$sDBName."`.`LANGUAGE` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `LANGUAGE_COUNTRIES_FK`=`COUNTRIES_PK`;\n";
			break;
			
		/*============================================================
		  == #3.9# - POSTCODES                                      ==
		  ============================================================*/
		case "PublicPostcodes":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_POSTCODES` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `POSTCODE_PK`, \n";
			$sSQL .= "    `POSTCODE_NAME`, \n";
			$sSQL .= "    `STATEPROVINCE_PK`, \n";
			$sSQL .= "    `STATEPROVINCE_SHORTNAME`, \n";
			$sSQL .= "    `STATEPROVINCE_NAME`, \n";
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION`, \n";
			$sSQL .= "    `TIMEZONE_PK`, \n";
			$sSQL .= "    `TIMEZONE_CC`, \n";
			$sSQL .= "    `TIMEZONE_LATITUDE`, \n";
			$sSQL .= "    `TIMEZONE_LONGITUDE`, \n";
			$sSQL .= "    `TIMEZONE_TZ` \n";
			$sSQL .= "FROM `".$sDBName."`.`POSTCODE` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`TIMEZONE` ON `POSTCODE_TIMEZONES_FK`=`TIMEZONE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`STATEPROVINCE` ON `POSTCODE_STATEPROVINCE_FK`=`STATEPROVINCE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `STATEPROVINCE_COUNTRIES_FK`=`COUNTRIES_PK`;\n";
			break;
			
		/*============================================================
		  == #3.10# - STATEPROVINCE                                 ==
		  ============================================================*/
		case "PublicStateProvince":
			$sSQL .= "CREATE VIEW `".$sDBName."`.`VP_STATEPROVINCE` AS\n";
			$sSQL .= "SELECT\n";
			$sSQL .= "    `STATEPROVINCE_PK`, \n";
			$sSQL .= "    `STATEPROVINCE_SHORTNAME`, \n";
			$sSQL .= "    `STATEPROVINCE_NAME`, \n";
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION` \n";
			$sSQL .= "FROM `".$sDBName."`.`STATEPROVINCE` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `STATEPROVINCE_COUNTRIES_FK`=`COUNTRIES_PK`;\n";
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
			$sSQL .= "	`USERADDRESS_PK`, \n";
			$sSQL .= "	`USERADDRESS_LINE3`, \n";
			$sSQL .= "	`USERADDRESS_LINE2`, \n";
			$sSQL .= "	`USERADDRESS_LINE1`, \n";
//			$sSQL .= "	`USERADDRESS_POSTALLINE3`, \n";
//			$sSQL .= "	`USERADDRESS_POSTALLINE2`, \n";
//			$sSQL .= "	`USERADDRESS_POSTALLINE1`, \n";
			$sSQL .= "	`COUNTRIES_PK`, \n";
			$sSQL .= "	`COUNTRIES_NAME`, \n";
			$sSQL .= "	`COUNTRIES_ABREVIATION`, \n";
			$sSQL .= "	`LANGUAGE_PK`, \n";
			$sSQL .= "	`LANGUAGE_NAME`, \n";
			$sSQL .= "	`LANGUAGE_LANGUAGE`, \n";
			$sSQL .= "	`LANGUAGE_VARIANT`, \n";
			$sSQL .= "	`LANGUAGE_ENCODING`, \n";
			$sSQL .= "	`POSTCODE_PK`, \n";
			$sSQL .= "	`POSTCODE_NAME`, \n";
			$sSQL .= "	`STATEPROVINCE_PK`, \n";
			$sSQL .= "	`STATEPROVINCE_SHORTNAME`, \n";
			$sSQL .= "	`STATEPROVINCE_NAME`, \n";
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
			$sSQL .= "LEFT JOIN `".$sDBName."`.`USERADDRESS` ON `USERS_PK`=`USERADDRESS_USERS_FK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`LANGUAGE` ON `USERADDRESS_LANGUAGE_FK`=`LANGUAGE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `USERADDRESS_COUNTRIES_FK`=`COUNTRIES_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`STATEPROVINCE` ON `USERADDRESS_STATEPROVINCE_FK`=`STATEPROVINCE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`POSTCODE` ON `USERADDRESS_POSTCODE_FK`=`POSTCODE_PK` \n";
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
			$sSQL .= "    `LANGUAGE_PK`, \n";
			$sSQL .= "    `LANGUAGE_NAME`, \n";
			$sSQL .= "    `LANGUAGE_LANGUAGE`, \n";
			$sSQL .= "    `LANGUAGE_VARIANT`, \n";
			$sSQL .= "    `LANGUAGE_ENCODING`, \n";
			$sSQL .= "    `COUNTRIES_PK`, \n";
			$sSQL .= "    `COUNTRIES_NAME`, \n";
			$sSQL .= "    `COUNTRIES_ABREVIATION`, \n";
			$sSQL .= "    `STATEPROVINCE_PK`, \n";
			$sSQL .= "    `STATEPROVINCE_SHORTNAME`, \n";
			$sSQL .= "    `STATEPROVINCE_NAME`, \n";
			$sSQL .= "    `POSTCODE_PK`, \n";
			$sSQL .= "    `POSTCODE_NAME`, \n";
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
			$sSQL .= "LEFT JOIN `".$sDBName."`.`COUNTRIES` ON `PREMISEADDRESS_COUNTRIES_FK`=`COUNTRIES_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`STATEPROVINCE` ON `PREMISEADDRESS_STATEPROVINCE_FK`=`STATEPROVINCE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`POSTCODE` ON `PREMISEADDRESS_POSTCODE_FK`=`POSTCODE_PK` \n";
			$sSQL .= "LEFT JOIN `".$sDBName."`.`TIMEZONE` ON `PREMISEADDRESS_TIMEZONE_FK`=`TIMEZONE_PK` \n";
			$sSQL .= "WHERE CURRENT_USER LIKE CONCAT(`USERS_USERNAME`, '@%') AND `PERMPREMISE_READ` = 1; \n";
			break;
			
		/*============================================================
		  == #4.04# - USERSPREMISELOG                               ==
		  ============================================================*/
		case "PrivateUsersPremiseLog":
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSPREMISELOG` AS\n";
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
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSCOMM` AS\n";
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
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSROOMS` AS\n";
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
			$sSQL .= "CREATE SQL SECURITY INVOKER VIEW `".$sDBName."`.`VR_USERSTHING` AS\n";
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
		  == #6.01# - USERSHUB                                      ==
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
		  == #6.02# - USERSCOMM                                     ==
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
		  == #6.03# - USERSLINK                                     ==
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
		  == #6.04# - USERSTHING                                    ==
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
		  == #6.05# - USERSIO                                       ==
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
					$sErrMesg .= "Problem Creating Table ".$aTemp1['ErrMesg'];
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
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_NAME,CURRENCIES_ABREVIATION) VALUES ('Australian Dollar','AUD'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`CURRENCIES` (CURRENCIES_NAME,CURRENCIES_ABREVIATION) VALUES ('British Pound','£'); \n";
			
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
			  == #6.9# - COUNTRIES                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (1, null,'Afghanistan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (2, null,'Albania',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (3, null,'Algeria',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (4, null,'American Samoa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (5, null,'Andorra',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (6, null,'Angola',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (7, null,'Anguilla',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (8, null,'Antarctica',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (9, null,'Antigua and Barbuda',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (10, null,'Argentina',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (11, null,'Armenia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (13, null,'Aruba',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (14, 1, 'Australia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (15, null,'Austria',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (16, null,'Azerbaijan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (18, null,'Bahamas',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (19, null,'Bahrain',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (20, null,'Bangladesh',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (21, null,'Barbados',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (22, null,'Belarus',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (23, null,'Belgium',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (24, null,'Belize',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (25, null,'Benin',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (26, null,'Bermuda',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (27, null,'Bhutan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (28, null,'Bolivia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (29, null,'Bosnia and Herzegovina',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (30, null,'Botswana',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (31, null,'Bouvet Island',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (32, null,'Brazil',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (33, null,'British Indian Ocean Territory',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (34, null,'Brunei Darussalam',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (35, null,'Bulgaria',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (36, null,'Burkina Faso',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (37, null,'Burundi',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (38, null,'Cambodia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (39, null,'Cameroon',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (40, null,'Canada',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (41, null,'Cape Verde',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (42, null,'Cayman Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (43, null,'Central African Republic',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (44, null,'Chad',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (45, null,'Chile',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (46, null,'China',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (47, null,'Christmas Island',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (49, null,'Colombia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (50, null,'Comoros',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (51, null,'Congo',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (52, null,'Congo, The Democratic Republic of The',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (53, null,'Cook Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (54, null,'Costa Rica',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (55, null,'Cote D''ivoire',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (56, null,'Croatia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (57, null,'Cuba',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (58, null,'Cyprus',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (60, null,'Czech Republic',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (61, null,'Denmark',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (62, null,'Djibouti',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (63, null,'Dominica',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (64, null,'Dominican Republic',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (65, null,'Easter Island',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (66, null,'Ecuador',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (67, null,'Egypt',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (68, null,'El Salvador',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (69, null,'Equatorial Guinea',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (70, null,'Eritrea',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (71, null,'Estonia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (72, null,'Ethiopia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (74, null,'Faroe Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (75, null,'Fiji',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (76, null,'Finland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (77, null,'France',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (78, null,'French Guiana',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (79, null,'French Polynesia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (80, null,'French Southern Territories',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (81, null,'Gabon',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (82, null,'Gambia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (83, null,'Georgia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (85, null,'Germany',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (86, null,'Ghana',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (87, null,'Gibraltar',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (88, null,'Greece',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (89, null,'Greenland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (91, null,'Grenada',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (92, null,'Guadeloupe',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (93, null,'Guam',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (94, null,'Guatemala',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (95, null,'Guinea',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (96, null,'Guinea-bissau',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (97, null,'Guyana',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (98, null,'Haiti',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (99, null,'Heard Island and Mcdonald Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (100, null,'Honduras',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (101, null,'Hong Kong',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (102, null,'Hungary',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (103, null,'Iceland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (104, null,'India',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (105, null,'Indonesia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (107, null,'Iran',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (108, null,'Iraq',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (109, null,'Ireland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (110, null,'Israel',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (111, null,'Italy',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (112, null,'Jamaica',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (113, null,'Japan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (114, null,'Jordan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (115, null,'Kazakhstan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (117, null,'Kenya',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (118, null,'Kiribati',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (119, null,'Korea, North',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (120, null,'Korea, South',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (121, null,'Kosovo',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (122, null,'Kuwait',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (123, null,'Kyrgyzstan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (124, null,'Laos',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (125, null,'Latvia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (126, null,'Lebanon',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (127, null,'Lesotho',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (128, null,'Liberia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (129, null,'Libyan Arab Jamahiriya',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (130, null,'Liechtenstein',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (131, null,'Lithuania',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (132, null,'Luxembourg',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (133, null,'Macau',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (134, null,'Macedonia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (135, null,'Madagascar',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (136, null,'Malawi',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (137, null,'Malaysia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (138, null,'Maldives',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (139, null,'Mali',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (140, null,'Malta',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (141, null,'Marshall Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (142, null,'Martinique',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (143, null,'Mauritania',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (144, null,'Mauritius',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (145, null,'Mayotte',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (146, null,'Mexico',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (147, null,'Micronesia, Federated States of',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (148, null,'Moldova, Republic of',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (149, null,'Monaco',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (150, null,'Mongolia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (151, null,'Montenegro',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (152, null,'Montserrat',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (153, null,'Morocco',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (154, null,'Mozambique',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (155, null,'Myanmar',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (156, null,'Namibia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (157, null,'Nauru',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (158, null,'Nepal',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (159, null,'Netherlands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (160, null,'Netherlands Antilles',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (161, null,'New Caledonia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (162, null,'New Zealand',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (163, null,'Nicaragua',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (164, null,'Niger',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (165, null,'Nigeria',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (166, null,'Niue',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (167, null,'Norfolk Island',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (168, null,'Northern Mariana Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (169, null,'Norway',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (170, null,'Oman',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (171, null,'Pakistan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (172, null,'Palau',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (173, null,'Palestinian Territory',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (174, null,'Panama',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (175, null,'Papua New Guinea',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (176, null,'Paraguay',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (177, null,'Peru',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (178, null,'Philippines',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (179, null,'Pitcairn',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (180, null,'Poland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (181, null,'Portugal',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (182, null,'Puerto Rico',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (183, null,'Qatar',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (184, null,'Reunion',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (185, null,'Romania',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (186, null,'Russia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (188, null,'Rwanda',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (189, null,'Saint Helena',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (190, null,'Saint Kitts and Nevis',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (191, null,'Saint Lucia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (192, null,'Saint Pierre and Miquelon',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (193, null,'Saint Vincent and The Grenadines',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (194, null,'Samoa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (195, null,'San Marino',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (196, null,'Sao Tome and Principe',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (197, null,'Saudi Arabia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (198, null,'Senegal',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (199, null,'Serbia and Montenegro',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (200, null,'Seychelles',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (201, null,'Sierra Leone',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (202, null,'Singapore',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (203, null,'Slovakia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (204, null,'Slovenia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (205, null,'Solomon Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (206, null,'Somalia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (207, null,'South Africa',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (208, null,'South Georgia and The South Sandwich Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (209, null,'Spain',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (210, null,'Sri Lanka',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (211, null,'Sudan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (212, null,'Suriname',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (213, null,'Svalbard and Jan Mayen',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (214, null,'Swaziland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (215, null,'Sweden',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (216, null,'Switzerland',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (217, null,'Syria',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (218, null,'Taiwan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (219, null,'Tajikistan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (220, null,'Tanzania, United Republic of',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (221, null,'Thailand',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (222, null,'Timor-leste',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (223, null,'Togo',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (224, null,'Tokelau',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (225, null,'Tonga',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (226, null,'Trinidad and Tobago',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (227, null,'Tunisia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (228, null,'Turkey',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (230, null,'Turkmenistan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (231, null,'Turks and Caicos Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (232, null,'Tuvalu',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (233, null,'Uganda',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (234, null,'Ukraine',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (235, null,'United Arab Emirates',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (236, null,'United Kingdom',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (237, null,'United States',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (238, null,'United States Minor Outlying Islands',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (239, null,'Uruguay',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (240, null,'Uzbekistan',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (241, null,'Vanuatu',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (242, null,'Vatican City',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (243, null,'Venezuela',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (244, null,'Vietnam',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (245, null,'Virgin Islands, British',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (246, null,'Virgin Islands, U.S.',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (247, null,'Wallis and Futuna',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (248, null,'Western Sahara',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (250, null,'Yemen',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (251, null,'Zambia',''); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COUNTRIES` (COUNTRIES_PK,COUNTRIES_CURRENCIES_FK,COUNTRIES_NAME,COUNTRIES_ABREVIATION) VALUES (252, null,'Zimbabwe',''); \n";
			
			/*============================================================
			  == #6.10# - LANGUAGE                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (LANGUAGE_PK,LANGUAGE_COUNTRIES_FK,LANGUAGE_NAME,LANGUAGE_LANGUAGE,LANGUAGE_VARIANT,LANGUAGE_ENCODING) VALUES (1,1,'Australian English',1,'AU','EN-AU'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LANGUAGE` (LANGUAGE_PK,LANGUAGE_COUNTRIES_FK,LANGUAGE_NAME,LANGUAGE_LANGUAGE,LANGUAGE_VARIANT,LANGUAGE_ENCODING) VALUES (2,236,'United Kingdom English',2,'','EN-GB'); \n";
			
			/*============================================================
			  == #6.11# - STATEPROVINCE                                 ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (1,14,'QLD','Queensland'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (2,14,'NSW','New South Wales'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (3,14,'VIC','Victoria'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (4,14,'SA','South Australia'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (5,14,'WA','Western Australia'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (6,14,'TAS','Tasmania'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (7,14,'NT','Northern Territory'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`STATEPROVINCE` (STATEPROVINCE_PK,STATEPROVINCE_COUNTRIES_FK,STATEPROVINCE_SHORTNAME,STATEPROVINCE_NAME) VALUES (8,14,'ACT','Australian Capital Territory'); \n";
			
			/*============================================================
			  == #6.12# - TIMEZONE                                      ==
			  ============================================================*/ 
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3455','+13835','Australia/Adelaide'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-2728','+15302','Australia/Brisbane'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3157','+14127','Australia/Broken_Hill'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3956','+14352','Australia/Currie'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-1228','+13050','Australia/Darwin'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3143','+12852','Australia/Eucla'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-4253','+14719','Australia/Hobart'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-2016','+14900','Australia/Lindeman'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3133','+15905','Australia/Lord_Howe'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3749','+14456','Australia/Melbourne'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3157','+11551','Australia/Perth'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`TIMEZONE` (TIMEZONE_CC,TIMEZONE_LATITUDE,TIMEZONE_LONGITUDE,TIMEZONE_TZ) VALUES ('AU','-3352','+15113','Australia/Sydney'); \n";
			
			/*============================================================
			  == #6.13# - POSTCODE                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`POSTCODE` (POSTCODE_STATEPROVINCE_FK,POSTCODE_TIMEZONES_FK,POSTCODE_NAME) VALUES (1,1,'4655'); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`POSTCODE` (POSTCODE_STATEPROVINCE_FK,POSTCODE_TIMEZONES_FK,POSTCODE_NAME) VALUES (1,1,'4006'); \n";
			
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
			  == #6.9# - COMMTYPES                                      ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK, COMMTYPE_NAME ) VALUES ( 1, 'Legacy' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK ,COMMTYPE_NAME ) VALUES ( 2, 'PHP API' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`COMMTYPE` ( COMMTYPE_PK ,COMMTYPE_NAME ) VALUES ( 3, 'Zigbee' ); \n";
			
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
			$sSQL .= "INSERT INTO `".$sDBName."`.`DATATYPE` ( DATATYPE_PK, DATATYPE_NAME ) VALUES ( 11, 'mediumstring' ); \n";
			
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
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Zigbee Home Automation Meter' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Android Smartphone' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'iPhone' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Bluetooth Device' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Onvif IP Camera' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Philips Hue Bridge' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Open Weather Map Feed' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`LINKTYPE` ( `LINKTYPE_NAME` ) VALUES ( 'Netvox Motion Sensor' ); \n";
			
			
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
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'BT HeartRateMon' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'DevelCo LED Energy Meter Interface' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Zigbee Netvox SmartPlugPlus' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Onvif Camera Stream' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Philips Hue Light' ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`THINGTYPE` ( `THINGTYPE_NAME` ) VALUES ( 'Weather Feed' ); \n";
			
			
			/*============================================================
			  == #6.9# -ROOMTYPE                                        ==
			  ============================================================*/
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Master Bedroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Bedroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Bathroom', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Kitchen', 0 ); \n";
			$sSQL .= "INSERT INTO `".$sDBName."`.`ROOMTYPE` ( `ROOMTYPE_NAME`, `ROOMTYPE_OUTDOORS` ) VALUES ( 'Laundry', 0 ); \n";
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
		return array( "Error"=>true, "ErrMesg"=>"CreateDefaultData3: ".$sErrMesg );
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


function DB_InsertUserAddress( $sDBName, $iUserId, $iLanguageId, $iCountriesId, $iStateProvinceId, $iPostcodeId, $iTimezoneId, $sLine1, $sLine2, $sLine3 ) {
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
			$sSQL .= "    `USERADDRESS_COUNTRIES_FK`,       `USERADDRESS_STATEPROVINCE_FK`, ";
			$sSQL .= "    `USERADDRESS_POSTCODE_FK`,        `USERADDRESS_TIMEZONE_FK`, ";
			$sSQL .= "    `USERADDRESS_LINE1`,              `USERADDRESS_LINE2`, ";
			$sSQL .= "    `USERADDRESS_LINE3` ";
			$sSQL .= ") VALUES ( ";
			$sSQL .= "    :UserId,          :LanguageId, ";
			$sSQL .= "    :CountriesId,     :StateProvinceId, ";
			$sSQL .= "    :PostcodeId,      :TimezoneId, ";
			$sSQL .= "    :Line1,           :Line2, ";
			$sSQL .= "    :Line3 ";
			$sSQL .= ") ";
			
			
			//----------------------------------------//
			//-- Input binding                      --//
			//----------------------------------------//
			$aInputValsInsert = array(
				array( "Name"=>"UserId",            "type"=>"INT",          "value"=>$iUserId                 ),
				array( "Name"=>"LanguageId",        "type"=>"INT",          "value"=>$iLanguageId             ),
				array( "Name"=>"CountriesId",       "type"=>"INT",          "value"=>$iCountriesId            ),
				array( "Name"=>"StateProvinceId",   "type"=>"INT",          "value"=>$iStateProvinceId        ),
				array( "Name"=>"PostcodeId",        "type"=>"INT",          "value"=>$iPostcodeId             ),
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
		$aCoreResult = DB_InsertCore( $sDBName, "iOmy (Vanilla)", 0, 4, 3, $iCurrentUTS );
		
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
		$aCoreAddonResult = DB_InsertCoreAddon( $sDBName, $iCoreId, "iOmy Schema", 0, 4, 3, $iCurrentUTS );
		
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