/*
Title: Web Api Client Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for webapiclient.cpp
Copyright: Capsicum Corporation 2016

This file is part of Watch Inputs which is part of the iOmy project.

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

#ifndef WEBAPICLIENTLIB_H
#define WEBAPICLIENTLIB_H

#include <boost/config.hpp>

#include <cinttypes>
#include <string>
#include <map>
#include <list>

#include <boost/config/abi_prefix.hpp>

typedef struct webapiclient_zigbeelink webapiclient_zigbeelink_t;
typedef struct webapiclient_zigbeecomm webapiclient_zigbeecomm_t;

typedef struct webapiclientlib_ifaceptrs_ver_1 webapiclientlib_ifaceptrs_ver_1_t;
struct webapiclientlib_ifaceptrs_ver_1 {
  int (*init)(void);
  void (*shutdown)(void);
	bool (*add_zigbee_link_to_webapi_queue)(const webapiclient_zigbeelink_t& zigbeelink);
	bool (*add_zigbee_comm_to_webapi_queue)(const webapiclient_zigbeecomm_t& zigbeecomm);
};

typedef struct webapiclient_io webapiclient_io_t;
struct webapiclient_io {
	std::int32_t rstype;
	std::int32_t uom;
	std::int32_t iotype;
	std::int32_t samplerate;
	std::int32_t baseconvert;
	std::string name;
};

typedef struct webapiclient_zigbeething webapiclient_zigbeething_t;
struct webapiclient_zigbeething {
	std::int32_t type; //Thing Type
	std::int32_t state;
	std::list<webapiclient_io_t> io;
};

//Defines a structure for a zigbee device for all the fields of the web api
struct webapiclient_zigbeelink {
	std::int64_t localaddr; //64-bit address of the local device that this device is attached to
	std::int32_t localpk=0; //Database PK value of the local device (filled in by the web api)
	std::string modelname; //Manu string + model string ; maps to api: InfoName
	std::uint64_t addr; //Maps to SerialCode
	std::string userstr; //Maps to api: Displayname
	bool okaytoadd=false; //Set to true when we have successfully checked with tha database that the link doesn't exist

	//hwid, thing
	std::map<std::int32_t, webapiclient_zigbeething_t> things;
};

//Defines a structure for a zigbee comm device for all the fields of the web api
struct webapiclient_zigbeecomm {
	std::int64_t hubpk=0; //Database PK value of the hub (Webapi may use the serial number or hostname of the device to lookup)
	std::string name;
	std::uint64_t addr;
	bool okaytoadd=false; //Set to true when we have successfully checked with tha database that the comm doesn't exist
};

#define WEBAPICLIENTLIBINTERFACE_VER_1 1 //A version number for the webapiclientlib interface version

#include <boost/config/abi_suffix.hpp>

#endif
