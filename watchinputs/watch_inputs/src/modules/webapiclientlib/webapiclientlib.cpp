/*
Title: Web API Client Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: This module connects to the ioMy Web API to pass various info back and forth
Copyright: Capsicum Corporation 2016-2017

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

//Use Boost Chrono instead of C++11 chrono
#define BOOST_ASIO_DISABLE_STD_CHRONO

#include <stdio.h>
#include <cctype>
#include <cstring>
#include <iomanip>
#include <iostream>
#include <istream>
#include <ostream>
#include <list>
#include <map>
#include <string>
#include <sstream>
#include <typeinfo>
#include <boost/chrono.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/recursive_mutex.hpp>
#include <boost/atomic/atomic.hpp>
#include <boost/asio.hpp>
#include <boost/asio/steady_timer.hpp>
#include <boost/asio/system_timer.hpp>
#include <boost/bind.hpp>
#include <boost/archive/iterators/base64_from_binary.hpp>
#include <boost/archive/iterators/binary_from_base64.hpp>
#include <boost/archive/iterators/transform_width.hpp>
#include <boost/archive/iterators/remove_whitespace.hpp>
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "webapiclientlib.hpp"
#include "modules/commonlib/commonlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/configlib/configlib.hpp"

using boost::asio::ip::tcp;

static std::list<webapiclient_link_t *> webapi_links_queue;

//List is a pointer so can hold derived objects instead of just the base class
static std::list<webapiclient_comm_t *> webapi_comms_queue;

static std::list<webapiclient_thing_t *> webapi_things_queue;

static boost::recursive_mutex webapiclientlibmutex;

static boost::thread webapiclientlib_mainthread;

//Function Declarations
static bool webapiclientlib_add_zigbee_link_to_webapi_queue(const webapiclient_zigbeelink_t& zigbeelink);
static bool webapiclientlib_add_csrmesh_link_to_webapi_queue(const webapiclient_csrmeshlink_t& csrmeshlink);
static bool webapiclientlib_add_zigbee_comm_to_webapi_queue(const webapiclient_zigbeecomm_t& zigbeecomm);
static bool webapiclientlib_add_bluetooth_comm_to_webapi_queue(const webapiclient_bluetoothcomm_t& bluetoothcomm);
static bool webapiclientlib_add_csrmesh_thing_to_webapi_queue(const webapiclient_csrmeshthing_t& csrmeshthing);
static void webapiclientlib_setneedtoquit(bool val);
static int webapiclientlib_getneedtoquit();
static int webapiclientlib_start(void);
static void webapiclientlib_stop(void);
static int webapiclientlib_init(void);
static void webapiclientlib_shutdown(void);

//C Exports
extern "C" {

BOOST_SYMBOL_EXPORT moduleinfo_ver_generic_t *webapiclientlib_getmoduleinfo();

//JNI Exports
#ifdef __ANDROID__
JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_WebApiClientLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
#endif
}

//Module Interface Definitions

static webapiclientlib_ifaceptrs_ver_1_t webapiclientlib_ifaceptrs_ver_1={
  webapiclientlib_init,
  webapiclientlib_shutdown,
  webapiclientlib_add_zigbee_link_to_webapi_queue,
  webapiclientlib_add_csrmesh_link_to_webapi_queue,
  webapiclientlib_add_zigbee_comm_to_webapi_queue,
  webapiclientlib_add_bluetooth_comm_to_webapi_queue,
  webapiclientlib_add_csrmesh_thing_to_webapi_queue
};

static moduleiface_ver_1_t webapiclientlib_ifaces[]={
  {
    &webapiclientlib_ifaceptrs_ver_1,
    WEBAPICLIENTLIBINTERFACE_VER_1
  },
  {
    nullptr, 0
	}
};

static moduledep_ver_1_t webapiclientlib_deps[]={
  {
    "debuglib",
    nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "dblib",
		nullptr,
    DBLIBINTERFACE_VER_1,
    1
  },
  {
    "configlib",
		nullptr,
    CONFIGLIBINTERFACECPP_VER_1,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

//NOTE: Need to cast the deps as in this library it is defined as a fixed size
static const moduleinfo_ver_1_t webapiclientlib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "webapiclientlib",
  webapiclientlib_init,
  webapiclientlib_shutdown,
  webapiclientlib_start,
  webapiclientlib_stop,
  nullptr,
  nullptr,
	(moduleiface_ver_1_t (* const)[]) &webapiclientlib_ifaces,
  (moduledep_ver_1_t (*)[]) &webapiclientlib_deps,
};

//Find a pointer to module interface pointer
//Returns the pointer to the interface or nullptr if not found
//NOTE: A little slower than referencing the array element directly, but less likely to cause a programming fault
//  due to rearranging depencencies
static const void *webapiclientlib_getmoduledepifaceptr(const char *modulename, unsigned ifacever) {
	int i=0;

	while (webapiclientlib_deps[i].modulename) {
		if (std::strcmp(webapiclientlib_deps[i].modulename, modulename)==0) {
			if (webapiclientlib_deps[i].ifacever==ifacever) {
				return webapiclientlib_deps[i].ifaceptr;
			}
		}
		++i;
	}
	return nullptr;
}

//Returns an encoded string from a unencoded string
//Based on http://stackoverflow.com/questions/10521581/base64-encode-using-boost-throw-exception/10973348#10973348
//The line break inserting at character 76 has been removed
static std::string base64_encode(const std::string& s) {
  typedef boost::archive::iterators::base64_from_binary<boost::archive::iterators::transform_width<std::string::const_iterator,6,8> > it_base64_t;

  unsigned int writePaddChars = (3-s.length()%3)%3;
  std::string base64(it_base64_t(s.begin()),it_base64_t(s.end()));
  base64.append(writePaddChars,'=');

	return base64;
}

//Returns a decoded string from a base64 encoded string
//Based on http://stackoverflow.com/questions/10521581/base64-encode-using-boost-throw-exception/10973348#10973348
static std::string base64_decode(const std::string& base64) {
	typedef boost::archive::iterators::transform_width< boost::archive::iterators::binary_from_base64<boost::archive::iterators::remove_whitespace<std::string::const_iterator> >, 8, 6 > it_binary_t;
	std::string tmps=base64;

	unsigned int paddChars = count(tmps.begin(), tmps.end(), '=');
  std::replace(tmps.begin(),tmps.end(),'=','A'); // replace '=' by base64 encoding of '\0'
  std::string result(it_binary_t(tmps.begin()), it_binary_t(tmps.end())); // decode
  result.erase(result.end()-paddChars,result.end());  // erase padding '\0' characters

	return result;
}

//From http://stackoverflow.com/questions/154536/encode-decode-urls-in-c
static std::string url_encode(const std::string &value) {
    std::ostringstream escaped;
    escaped.fill('0');
    escaped << std::hex;

    for (auto const& it : value) {
        std::string::value_type c = it;

        // Keep alphanumeric and other accepted characters intact
        if (std::isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
            escaped << c;
            continue;
        }

        // Any other characters are percent-encoded
        escaped << std::uppercase;
        escaped << '%' << std::setw(2) << int((unsigned char) c);
        escaped << std::nouppercase;
    }

    return escaped.str();
}

std::string link_to_json(const webapiclient_link_t& link) {
	using boost::property_tree::ptree;
	ptree pt;
	std::ostringstream tmphexstr;

	pt.put("CommId", link.localpk);
  if (typeid(link)==typeid(webapiclient_zigbeelink_t)) {
    pt.put("Type", 2); //2=Zigbee device
  } else if (typeid(link)==typeid(webapiclient_csrmeshlink_t)) {
    pt.put("Type", 15); //15=Qualcomm CSRmesh Link
  } else {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

    debuglibifaceptr->debuglib_printf(1, "%s: Unknown Typeid=%s\n", __func__, typeid(link).name());
  }
	pt.put("InfoName", link.modelname);

	//Zigbee Addresses are 64-bit hexidecimal without the 0x part
	tmphexstr.width(16);
	tmphexstr.fill('0');
	tmphexstr << std::uppercase << std::hex << link.addr;
	pt.put("SerialCode", tmphexstr.str());
	pt.put("Displayname", link.userstr);
  if (typeid(link)==typeid(webapiclient_csrmeshlink_t)) {
    pt.put("State", 1);
    pt.put("InfoManufacturer", "Qualcomm");
    pt.put("InfoManufacturerUrl", "www.qualcomm.com");
    pt.put("ConnCryptTypeId", 1);
    pt.put("ConnUsername", "");
    pt.put("ConnPassword", dynamic_cast<const webapiclient_csrmeshlink&>(link).networkKey);
  }
  if (typeid(link)==typeid(webapiclient_zigbeelink_t)) {
    ptree thingspt;
    for (const auto &thingit : dynamic_cast<const webapiclient_zigbeelink_t&>(link).things) {
      ptree thingpt;

      thingpt.put("Type", thingit.second.type);
      thingpt.put("State", thingit.second.state);
      thingpt.put("HWId", thingit.first);

      ptree iospt;
      for (const auto &ioit : thingit.second.io) {
        ptree iopt;

        iopt.put("RSType", ioit.rstype);
        iopt.put("UoM", ioit.uom);
        iopt.put("Type", ioit.iotype);
        iopt.put("Name", ioit.name);
        iopt.put("BaseConvert", ioit.baseconvert);
        iopt.put("SampleRate", ioit.samplerate);

        iospt.push_back(std::make_pair("", iopt));
      }
      thingpt.put_child("IOs", iospt);

      thingspt.push_back(std::make_pair("", thingpt));
    }
    pt.put_child("Things", thingspt);
  }
	std::ostringstream streamstr;
	write_json(streamstr, pt);

	return streamstr.str();
}

std::string comm_to_json(const webapiclient_comm_t& comm) {
  using boost::property_tree::ptree;
  ptree pt;

  pt.put("HubId", comm.hubpk);
  pt.put("Type", comm.type);
  pt.put("Name", comm.name);

  //Zigbee Addresses are 64-bit hexidecimal without the 0x part
  std::ostringstream tmphexstr;
  tmphexstr.width(16);
  tmphexstr.fill('0');
  tmphexstr << std::uppercase << std::hex << comm.addr;
  pt.put("Address", tmphexstr.str());

  std::ostringstream streamstr;
  write_json(streamstr, pt);

  return streamstr.str();
}

std::string thing_to_json(const webapiclient_thing_t& thing) {
  using boost::property_tree::ptree;
  ptree pt;
  ptree thingpt;
  std::ostringstream tmphexstr;

  thingpt.put("LinkId", thing.linkpk);
  thingpt.put("Type", thing.type);
  thingpt.put("State", thing.state);
  thingpt.put("HWId", thing.hwid);
  thingpt.put("Name", thing.name);
  if (typeid(thing)==typeid(webapiclient_csrmeshthing_t)) {
    const webapiclient_csrmeshthing_t& csrmeshthing=dynamic_cast<const webapiclient_csrmeshthing_t&>(thing);

    thingpt.put("SerialCode", csrmeshthing.serialcode);
    ptree iospt;
    for (const auto &ioit : csrmeshthing.io) {
      ptree iopt;

      iopt.put("RSType", ioit.rstype);
      iopt.put("UoM", ioit.uom);
      iopt.put("Type", ioit.iotype);
      iopt.put("Name", ioit.name);
      iopt.put("BaseConvert", ioit.baseconvert);
      iopt.put("SampleRate", ioit.samplerate);

      iospt.push_back(std::make_pair("", iopt));
    }
    thingpt.put_child("IOs", iospt);
  }
  std::ostringstream streamstr;
  write_json(streamstr, thingpt);

  return streamstr.str();
}

//Add a link to a queue for adding via the web api
static bool webapiclientlib_add_link_to_webapi_queue(webapiclient_link_t* link) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "%s: Adding device with address: %016" PRIX64 " to webapi queue\n", __func__, link->addr);

  {
    boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);

    //Just add to the queue and quickly exit as the list can be pruned later in the webapi thread
    webapi_links_queue.push_back(link);
  }

  //Testing Code
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: JSON output: \"%s\"\n", __func__, link_to_json(*link).c_str());

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  return true;
}

//Add a zigbee link to a queue for adding via the web api
static bool webapiclientlib_add_zigbee_link_to_webapi_queue(const webapiclient_zigbeelink_t& zigbeelink) {
  webapiclient_zigbeelink_t *link=new webapiclient_zigbeelink_t;
  *link=zigbeelink;
  return webapiclientlib_add_link_to_webapi_queue(link);
}

//Add a CSRMesh link to a queue for adding via the web api
static bool webapiclientlib_add_csrmesh_link_to_webapi_queue(const webapiclient_csrmeshlink_t& csrmeshlink) {
  webapiclient_csrmeshlink_t *link=new webapiclient_csrmeshlink_t;
  *link=csrmeshlink;
  return webapiclientlib_add_link_to_webapi_queue(link);
}

//Add a comm to a queue for adding via the web api
static bool webapiclientlib_add_comm_to_webapi_queue(webapiclient_comm_t* comm) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "%s: Adding Comm with address: %016" PRIX64 " to webapi queue\n", __func__, comm->addr);
  {
    boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);

    //Just add to the queue and quickly exit as the list can be pruned later in the webapi thread
    webapi_comms_queue.push_back(comm);
  }
  //Testing Code
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: JSON output: \"%s\"\n", __func__, comm_to_json(*comm).c_str());

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  return true;
}

//Add a zigbee comm to a queue for adding via the web api
static bool webapiclientlib_add_zigbee_comm_to_webapi_queue(const webapiclient_zigbeecomm_t& zigbeecomm) {
  webapiclient_zigbeecomm_t *comm=new webapiclient_zigbeecomm_t;
  *comm=zigbeecomm;
  return webapiclientlib_add_comm_to_webapi_queue(comm);
}

//Add a bluetooth comm to a queue for adding via the web api
static bool webapiclientlib_add_bluetooth_comm_to_webapi_queue(const webapiclient_bluetoothcomm_t& bluetoothcomm) {
  webapiclient_bluetoothcomm_t *comm=new webapiclient_bluetoothcomm_t;
  *comm=bluetoothcomm;
  return webapiclientlib_add_comm_to_webapi_queue(comm);
}

//Add a thing to a queue for adding via the web api
static bool webapiclientlib_add_thing_to_webapi_queue(webapiclient_thing_t* thing) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  debuglibifaceptr->debuglib_printf(1, "%s: Adding device with name: %s to webapi queue\n", __func__, thing->name.c_str());
  {
    boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);

    //Just add to the queue and quickly exit as the list can be pruned later in the webapi thread
    webapi_things_queue.push_back(thing);
  }

  //Testing Code
  debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: JSON output: \"%s\"\n", __func__, thing_to_json(*thing).c_str());

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  return true;
}

//Add a CSRMesh thing to a queue for adding via the web api
static bool webapiclientlib_add_csrmesh_thing_to_webapi_queue(const webapiclient_csrmeshthing_t& csrmeshthing) {
  webapiclient_csrmeshthing_t *thing=new webapiclient_csrmeshthing_t;
  *thing=csrmeshthing;
  return webapiclientlib_add_thing_to_webapi_queue(thing);
}

//Setup a http request
//Only POST is supported at the moment
class httpclient {
private:
	//Name, Value pair
	std::map<std::string, std::string> headers;

	//Name, Value pair
	std::map<std::string, std::string> formfields;
	std::string httppath;
	bool haveHttpAuth=false;
	std::string httpusername;
	std::string httppassword;
public:
	httpclient() {
		addHeader("Accept", "*/*");
		addHeader("User-Agent", "HTTP-Client 1.0");
		addHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	}

	void addHeader(const std::string& name, const std::string& value) {
		headers[name]=value;
	}

	//Added an entire string as a header
	//Example: Host: www.example.com
	void addHeader(const std::string& str) {
		std::istringstream ss(str);
		std::string name, value;

		ss >> name;
		ss >> value;
		name.erase(name.end()-1); //Remove : at the end of the name
		addHeader(name, value);
	}

	void addFormField(const std::string& name, const std::string& value) {
		formfields[name]=value;
	}

	void addFormField(const std::string& name, const long int value) {
		std::ostringstream ss;

		ss << value;
		formfields[name]=ss.str();
	}

	void setPath(std::string path) {
		this->httppath=path;
	}

	void addHttpAuth(const std::string& username, const std::string& password) {
		this->httpusername=username;
		this->httppassword=password;
		haveHttpAuth=true;
	}
	
	std::string toString() {
		std::ostringstream stream;
		std::ostringstream body;

		//Generate the body from the form data
		bool firstfield=true;
		for (auto const& formfieldit : formfields) {
			if (!firstfield) {
				body << "&";
			}
			body << url_encode(formfieldit.first) << '=' << url_encode(formfieldit.second);
			firstfield=false;
		}
		stream << "POST " << httppath << " HTTP/1.0\r\n";
		if (haveHttpAuth) {
			std::ostringstream authstring;
			authstring << httpusername << ':' << httppassword;
			stream << "Authorization: Basic " << base64_encode(authstring.str()) << "\r\n";
		}
		for (auto const& headerit : headers) {
			stream << headerit.first << ": " << headerit.second << "\r\n";
		}
		stream << "Content-Length: " << body.str().size() << "\r\n";
		stream << "\r\n";
		stream << body.str();

		return stream.str();
	}
};

//Based on http://www.boost.org/doc/libs/1_61_0/doc/html/boost_asio/example/cpp03/http/client/async_client.cpp
//  and http://www.boost.org/doc/libs/1_61_0/doc/html/boost_asio/example/cpp03/timeouts/async_tcp_client.cpp
//NOTE: Android doesn't know about service: "http" so have to use 80 for the port
class asioclient {
private:
	boost::atomic<bool> stopped_;
	tcp::resolver resolver_;
  tcp::socket socket_;
  boost::asio::streambuf response_;
	boost::asio::system_timer deadline_;
	std::string httpserver;
	std::string httppath;
	std::string webapiport;
	std::string apiusername, apipassword;
	std::string httpusername;
	std::string httppassword;
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr;
	std::string http_version;
	unsigned httpstatuscode;
	long httpbodylen;
	std::list<webapiclient_link_t *>::iterator linksit;
	std::list<webapiclient_comm_t *>::iterator commsit;
  std::list<webapiclient_thing_t *>::iterator thingsit;
	int requestmode; //1=Adding Link, 2=Adding Comm, 3=Adding Thing

	//See http://stackoverflow.com/questions/21120361/boostasioasync-write-and-buffers-over-65536-bytes
	//These variables need to stay allocated while the asio request is active so can't be local to a single function
  httpclient hc;
  boost::asio::streambuf commrequest_;
  boost::asio::streambuf linkrequest_;
  boost::asio::streambuf thingrequest_;

public:
	asioclient(boost::asio::io_service& io_service)
		: stopped_(true), resolver_(io_service), socket_(io_service), deadline_(io_service) {
			//NOTE: When initialised globally, debuglibifaceptr won't be initialised yet
		}

	// Called by the user of the client class to initiate the connection process.
  // The endpoint iterator will have been obtained using a tcp::resolver.
  void start(const std::string& server, const std::string& webapiport, const std::string& path, const std::string& username, const std::string& password, const std::string &httpusername, const std::string &httppassword) {
		debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

		// Form the request. We specify the "Connection: close" header so that the
    // server will close the socket after transmitting the response. This will
    // allow us to treat all data up until the EOF as the content.
		if (!stopped_) {
			return;
		}
		stopped_=false;
		httpserver=server;
		httppath=path;
		this->webapiport=webapiport;
		apiusername=username;
		apipassword=password;
		this->httpusername=httpusername;
		this->httppassword=httppassword;

		//NOTE: We set the Mode and Data later on when submitting the request
		hc.setPath(httppath);
		if (httpusername != "") {
			//Send the http password straight away to reduce the number of packets
			hc.addHttpAuth(httpusername, httppassword);
		}
		hc.addHeader("Host", httpserver);
		hc.addFormField("Version", "0.4.11");
		if (apiusername != "") {
			std::ostringstream tmpstr;
			tmpstr << "[\"" << apiusername << "\",\"" << apipassword << "\"]";
			hc.addFormField("Access", tmpstr.str());
		}
		//Loop through the zigbee comms and links queues adding each one at a time
		{
			boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);
			if (webapi_links_queue.empty() && webapi_comms_queue.empty() && webapi_things_queue.empty()) {
				//No need to connect if the queue is empty
				return;
			}
			commsit=webapi_comms_queue.begin();
			linksit=webapi_links_queue.begin();
      thingsit=webapi_things_queue.begin();
		}
		// Start an asynchronous resolve to translate the server and service names
    // into a list of endpoints.
		tcp::resolver::query query(httpserver, this->webapiport);
		resolver_.async_resolve(query,
			boost::bind(&asioclient::handle_resolve, this,
				boost::asio::placeholders::error,
				boost::asio::placeholders::iterator));

		//Set a starting deadline timer
    deadline_.expires_from_now(boost::chrono::seconds(60));

		// Start the deadline actor
    deadline_.async_wait(boost::bind(&asioclient::check_deadline, this));
	}

	// This function terminates all the actors to shut down the connection. It
  // may be called by the user of the client class, or by the class itself in
  // response to graceful termination or an unrecoverable error.
  void stop() {
		debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

		if (stopped_) {
			return;
		}
		stopped_ = true;
    boost::system::error_code ignored_ec;
		try {
			socket_.shutdown(tcp::socket::shutdown_both, ignored_ec);
		} catch (std::exception& e) {
			//Ignore errors from this function for now
		}
    socket_.close(ignored_ec);
		deadline_.cancel();
		response_.consume(response_.size());
	}
private:
	void handle_resolve(const boost::system::error_code& err, tcp::resolver::iterator endpoint_iterator) {
		if (stopped_) {
			return;
		}
		if (!err)
    {
			std::stringstream tmps;
			tmps << endpoint_iterator->endpoint();
			debuglibifaceptr->debuglib_printf(1, "%s: Trying %s...\n", __func__, tmps.str().c_str());

			// Set a deadline for the connect operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

      // Attempt a connection to each endpoint in the list until we
      // successfully establish a connection.
      boost::asio::async_connect(socket_, endpoint_iterator,
          boost::bind(&asioclient::handle_connect, this,
            boost::asio::placeholders::error));
    }
    else
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s, Hostname: %s, Port: %s\n", __func__, err.message().c_str(), this->httpserver.c_str(), this->webapiport.c_str());
			stop();
    }
  }

  void reset_http_body() {
    http_version="";
		httpstatuscode=0;
		httpbodylen=0;
	}

	void handle_connect(const boost::system::error_code& err) {
		if (stopped_) {
			return;
		}
		if (!err)
    {
      // The connection was successful. Send the comm requests
			send_comm_request();
    }
    else
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __func__, err.message().c_str());
			stop();
    }
  }


  void send_comm_request(void) {
		bool commokay;
		std::list<webapiclient_comm_t *>::iterator commsendit;

		//Send the next request or close connection if nothing else to send
		{
			boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);
			commsendit=webapi_comms_queue.end();
		}
		//Don't send the zigbee comm until all checks pass
		commokay=false;
		while (!commokay && commsit!=commsendit) {
			if (!(*commsit)->hubpk || !(*commsit)->okaytoadd) {
				//Step to next comm
				++commsit;
				
				continue;
			}
			commokay=true;
		}
		if (commokay && !webapiclientlib_getneedtoquit()) {
			reset_http_body();

			hc.addFormField("Mode", "AddComm");
			hc.addFormField("Data", comm_to_json(**commsit).c_str());
			std::ostream request_stream(&commrequest_);
			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Sending comm request: %s\n", __func__, hc.toString().c_str());
			request_stream << hc.toString();

			requestmode=2;
			boost::asio::async_write(socket_, commrequest_,
					boost::bind(&asioclient::handle_write_request, this,
						boost::asio::placeholders::error));
		} else if (!webapiclientlib_getneedtoquit()) {
			send_link_request();
		} else {
			stop();
		}
	}

  void send_link_request(void) {
		bool linkokay;
		std::list<webapiclient_link_t *>::iterator linksendit;

		//Send the next request or close connection if nothing else to send
		{
			boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);
			linksendit=webapi_links_queue.end();
		}
		//Don't send the link until all checks pass
    linkokay=false;
		while (!linkokay && linksit!=linksendit) {
			if (!(*linksit)->localpk || !(*linksit)->okaytoadd) {
				//Step to next link
				++linksit;
				
				continue;
			}
			linkokay=true;
		}
		if (linkokay && !webapiclientlib_getneedtoquit()) {
			reset_http_body();

			hc.addFormField("Mode", "AddLink");
			hc.addFormField("Data", link_to_json(**linksit));
			std::ostream request_stream(&linkrequest_);
			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Sending link request: %s\n", __func__, hc.toString().c_str());
			request_stream << hc.toString();

			requestmode=1;
			boost::asio::async_write(socket_, linkrequest_,
					boost::bind(&asioclient::handle_write_request, this,
						boost::asio::placeholders::error));
    } else if (!webapiclientlib_getneedtoquit()) {
      send_thing_request();
		} else {
			stop();
		}
	}

  void send_thing_request(void) {
    bool thingokay;
    std::list<webapiclient_thing_t *>::iterator thingsendit;

    //Send the next request or close connection if nothing else to send
    {
      boost::lock_guard<boost::recursive_mutex> guard(webapiclientlibmutex);
      thingsendit=webapi_things_queue.end();
    }
    //Don't send the thing until all checks pass
    thingokay=false;
    while (!thingokay && thingsit!=thingsendit) {
      if (!(*thingsit)->linkpk || !(*thingsit)->okaytoadd) {
        //Step to next thing
        ++thingsit;

        continue;
      }
      thingokay=true;
    }
    if (thingokay && !webapiclientlib_getneedtoquit()) {
      reset_http_body();

      hc.addFormField("Mode", "AddThing");
      hc.addFormField("Data", thing_to_json(**thingsit));
      std::ostream request_stream(&thingrequest_);
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Sending thing request: %s\n", __func__, hc.toString().c_str());
      request_stream << hc.toString();

      requestmode=3;
      boost::asio::async_write(socket_, thingrequest_,
          boost::bind(&asioclient::handle_write_request, this,
            boost::asio::placeholders::error));
    } else {
      stop();
    }
  }

	void handle_write_request(const boost::system::error_code& err) {
		if (stopped_) {
			return;
		}
    if (!err)
    {
			// Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

			// Read the response status line. The response_ streambuf will
      // automatically grow to accommodate the entire line. The growth may be
      // limited by passing a maximum size to the streambuf constructor.
      boost::asio::async_read_until(socket_, response_, "\r\n",
          boost::bind(&asioclient::handle_read_status_line, this,
            boost::asio::placeholders::error));
    }
    else
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __func__, err.message().c_str());
			stop();
    }
  }

	void handle_read_status_line(const boost::system::error_code& err) {
		if (stopped_) {
			return;
		}
    if (!err) {
      // Check that response is OK.
      std::istream response_stream(&response_);
      response_stream >> http_version;
      response_stream >> httpstatuscode;
      std::string status_message;
      std::getline(response_stream, status_message);
      if (!response_stream || http_version.substr(0, 5) != "HTTP/") {
				debuglibifaceptr->debuglib_printf(1, "%s: Invalid response: %s\n", __func__, http_version.c_str());
				stop();
        return;
      } else if (httpstatuscode == 401) {
				//Abort as the password was incorrect
				debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __func__);
				stop();
				return;
			} else if (httpstatuscode != 200) {
				debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __func__, httpstatuscode);
				stop();
        return;
			}
			// Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

			// Read the response headers, which are terminated by a blank line.
      boost::asio::async_read_until(socket_, response_, "\r\n\r\n",
          boost::bind(&asioclient::handle_read_headers, this,
            boost::asio::placeholders::error));
    }
    else
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __func__, err.message().c_str());
			stop();
    }
  }

	void handle_read_headers(const boost::system::error_code& err) {
		if (stopped_) {
			return;
		}
    if (!err)
    {
      // Process the response headers.
      std::istream response_stream(&response_);
      std::string header;
			bool havebodylen=false;
      while (std::getline(response_stream, header) && header != "\r") {
				if (header.substr(0, 15) == "Content-Length:") {
					std::stringstream contentlengthstr(header.substr(15));
					contentlengthstr >> httpbodylen;
					havebodylen=true;
					debuglibifaceptr->debuglib_printf(1, "%s: Content-Length=%ld\n", __func__, httpbodylen);
				}
				debuglibifaceptr->debuglib_printf(1, "%s: Header: %s\n", __func__, header.c_str());
			}
			if (!havebodylen) {
				//Can't continue without proper body length so abort
				debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to retrieve Content-Length\n", __func__);
				stop();
				return;
			}
			// Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

      if (httpstatuscode == 401) {
				//Abort as the password was incorrect
				debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __func__);
				stop();
				return;
			} else if (httpstatuscode != 200) {
				debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __func__, httpstatuscode);

        // Dummy read the body
        boost::asio::async_read(socket_, response_,
            boost::asio::transfer_exactly(httpbodylen-response_.size()),
            boost::bind(&asioclient::dummy_read_content, this,
              boost::asio::placeholders::error));
				stop();
				return;
			} else {
        // Read the body
        boost::asio::async_read(socket_, response_,
            boost::asio::transfer_exactly(httpbodylen-response_.size()),
            boost::bind(&asioclient::handle_read_content, this,
              boost::asio::placeholders::error));
			}
    }
    else
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __func__, err.message().c_str());
			stop();
    }
  }

  int process_response(std::string body) {
		int errcode=0;

		try {
			boost::property_tree::ptree pt;
			std::istringstream streamstr(body);

			read_json(streamstr, pt);
			bool iserror=pt.get<bool>("Error");
			if (iserror) {
				errcode=pt.get<int>("ErrCode");
				std::string errorstr=pt.get<std::string>("ErrMesg");
				debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned error code: %d, error message: %s\n", __func__, errcode, errorstr.c_str());
				if (errcode==0) {
					//Error code 0 normally means success so if there was an error adjust to -1 for the return
					errcode=-1;
				}
			}
		} catch (boost::property_tree::ptree_error &e) {
			debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned an unknown result\n", __func__);
			return -1;
		}
		return errcode;
	}

	void dummy_read_content(const boost::system::error_code& err) {
		response_.consume(httpbodylen);
	}

  void handle_read_content(const boost::system::error_code& err) {
    if (!err || err == boost::asio::error::eof) {
      // Write all of the data that has been read so far.
			std::string httpbody;
			int c;
      while ( (c=response_.sbumpc())!=EOF ) {
				httpbody+=(char) c;
			}
			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Body: \"%s\"\n", __func__, httpbody.c_str());

			int result=process_response(httpbody);

			if (result==0) {
				successful_send();
			} else {
				failed_send();
			}
    }
    else if (err != boost::asio::error::eof)
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __func__, err.message().c_str());
			stop();
    }
  }

  //Do processing after the request has been sent and then send the next request
  void successful_send() {
		if (requestmode==1) {
			std::list<webapiclient_link_t *>::iterator linksprevit=linksit;

			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Removing Link from add queue due to success\n", __func__);

			//Step to next link before erasing the one that just got added
			++linksit;

			//Erase the link that just got added
      delete (*linksprevit);
			webapi_links_queue.erase(linksprevit);

      //Only send one request at a time for now until HTTP/1.1 with Chunked Transfer Encoding is implemented
      stop();
			//Send next request
			//send_link_request();
    } else if (requestmode==3) {
      std::list<webapiclient_thing_t *>::iterator thingsprevit=thingsit;

      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Removing Thing from add queue due to success\n", __func__);

      //Step to next thing before erasing the one that just got added
      ++thingsit;

      //Erase the thing that just got added
      delete (*thingsprevit);
      webapi_things_queue.erase(thingsprevit);

      //Only send one request at a time for now until HTTP/1.1 with Chunked Transfer Encoding is implemented
      stop();
      //Send next request
      //send_link_request();
		} else if (requestmode==2) {
			std::list<webapiclient_comm_t *>::iterator commsprevit=commsit;

			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Removing Comm from add queue due to success\n", __func__);

			//Step to next comm before erasing the one that just got added
			++commsit;

			//Erase the comm that just got added
      delete (*commsprevit);
			webapi_comms_queue.erase(commsprevit);

      //Only send one request at a time for now until HTTP/1.1 with Chunked Transfer Encoding is implemented
      stop();
			//Send next request
			//send_comm_request();
		}
	}

  //Do processing after the request has been sent and then send the next request
  void failed_send() {
		if (requestmode==1) {
			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Skipping adding Link for now due to error\n", __func__);

			//Skip the current link for now and step to next link
			++linksit;

			//Send next request
			send_link_request();
    } else if (requestmode==3) {
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Skipping adding Thing for now due to error\n", __func__);

      //Skip the current thing for now and step to next link
      ++thingsit;

      //Send next request
      send_thing_request();
		} else if (requestmode==2) {
			debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Skipping adding Comm for now due to error\n", __func__);

			//Skip the current comm link for now and step to next comm link
			++commsit;

			//Send next request
			send_comm_request();
		}
	}

  void check_deadline() {
    if (stopped_)
      return;

    // Check whether the deadline has passed. We compare the deadline against
    // the current time since a new asynchronous operation may have moved the
    // deadline before this actor had a chance to run.
    if (deadline_.expires_at() <= boost::chrono::system_clock::now())
    {
			debuglibifaceptr->debuglib_printf(1, "%s: Server took too long to respond\n", __func__);

			//Shutdown first as per Boost header file portability recommendation
			try {
				socket_.shutdown(tcp::socket::shutdown_both);
			} catch (std::exception& e) {
				//Ignore errors from this function for now
			}
      // The deadline has passed. The socket is closed so that any outstanding
      // asynchronous operations are cancelled.
      socket_.close();
    } else {
			// Put the actor back to sleep.
			deadline_.async_wait(boost::bind(&asioclient::check_deadline, this));
		}
  }
};

class webapiclientloop_asyncloop {
private:
	boost::mutex mtx_;
	boost::asio::io_service io_service;
	boost::asio::system_timer timer;
	asioclient client;

public:
	webapiclientloop_asyncloop()
	  : timer(io_service), client(io_service) {
		}

	void start() {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
		update_timer_loop();
		try {
			io_service.run();
			io_service.reset();
		} catch (std::exception& e) {
			debuglibifaceptr->debuglib_printf(1, "%s: Error while running service: %s\n", __func__, e.what());
		}
	}

	void stop() {
		boost::lock_guard<boost::mutex> guard(mtx_);
		client.stop();
		timer.expires_from_now(boost::chrono::seconds(0));
	}
private:
	//Get the hub pk for the comm devices from the configuration
	void set_hubpk_for_comm_devices(void) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
		configlib_ifaceptrs_ver_1_cpp_t *configlibifaceptr=(configlib_ifaceptrs_ver_1_cpp_t *) webapiclientlib_getmoduledepifaceptr("configlib", CONFIGLIBINTERFACECPP_VER_1);
		std::string hubpkstr;

		bool result=configlibifaceptr->getnamevalue_cpp("general", "hubpk", hubpkstr);
		if (!result) {
			return;
		}
		std::int64_t hubpk=std::atol(hubpkstr.c_str());

		//Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
		webapiclientlibmutex.lock();
		auto webapi_comms_queueitbegin=webapi_comms_queue.begin();
		auto webapi_comms_queueitend=webapi_comms_queue.end();
		webapiclientlibmutex.unlock();

		for (auto &it=webapi_comms_queueitbegin; it!=webapi_comms_queueitend; it++) {
			webapiclientlibmutex.lock();
            (*it)->hubpk=hubpk;
			webapiclientlibmutex.unlock();
			debuglibifaceptr->debuglib_printf(1, "%s: Found Hub PK: %" PRId64 " for Queued device: %016" PRIX64 "\n", __func__, hubpk, (*it)->addr);
		}
	}

	//Get the local pk for links based on the local address
	void set_locakpk_for_links(void) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
		dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", 	DBLIBINTERFACE_VER_1);;
    int result;

		//Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
		webapiclientlibmutex.lock();
		auto webapi_links_queueitbegin=webapi_links_queue.begin();
		auto webapi_links_queueitend=webapi_links_queue.end();
		webapiclientlibmutex.unlock();

    result=dblibifaceptr->begin();
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
      return;
    }
		for (auto &it=webapi_links_queueitbegin; it!=webapi_links_queueitend; it++) {
			int result;
			int64_t commpk;

			//Check the database to see if the link is linked to a comm
			debuglibifaceptr->debuglib_printf(1, "%s: Searching for Comm PK from address: %016" PRIX64 " for Queued Link: %016" PRIX64 "\n", __func__, (*it)->localaddr, (*it)->addr);
			result=dblibifaceptr->getcommpk((*it)->localaddr, &commpk);
			if (result==0) {
				webapiclientlibmutex.lock();
				(*it)->localpk=commpk;
				webapiclientlibmutex.unlock();
				debuglibifaceptr->debuglib_printf(1, "%s: Found Comm PK: %" PRId64 " from address: %016" PRIX64 " for Queued Link: %016" PRIX64 "\n", __func__, commpk, (*it)->localaddr, (*it)->addr);
			}
		}
		result=dblibifaceptr->end();
    if (result<0) {
      dblibifaceptr->rollback();
    }
	}

//Get the link pk for things based on the local address
  void set_linkpk_for_things(void) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
    dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib",  DBLIBINTERFACE_VER_1);;
    int result;

    //Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
    webapiclientlibmutex.lock();
    auto webapi_things_queueitbegin=webapi_things_queue.begin();
    auto webapi_things_queueitend=webapi_things_queue.end();
    webapiclientlibmutex.unlock();

    result=dblibifaceptr->begin();
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
      return;
    }
    for (auto &it=webapi_things_queueitbegin; it!=webapi_things_queueitend; it++) {
      int result;
      int64_t linkpk;

      //Check the database to see if the link is linked to a comm
      debuglibifaceptr->debuglib_printf(1, "%s: Searching for Link PK from address: %016" PRIX64 " for Queued Thing: %08" PRIX32 "\n", __func__, (*it)->localaddr, (*it)->hwid);
      result=dblibifaceptr->getlinkpk((*it)->localaddr, &linkpk);
      if (result==0) {
        webapiclientlibmutex.lock();
        (*it)->linkpk=linkpk;
        webapiclientlibmutex.unlock();
        debuglibifaceptr->debuglib_printf(1, "%s: Found Link PK: %" PRId64 " from address: %016" PRIX64 " for Queued Thing: %08" PRIX32 "\n", __func__, linkpk, (*it)->localaddr, (*it)->hwid);
      }
    }
    result=dblibifaceptr->end();
    if (result<0) {
      dblibifaceptr->rollback();
    }
  }

	//Remove comm devices from the webapi queue that don't need to be re-added
	void remove_already_added_comm_devices(void) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
		dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", 	DBLIBINTERFACE_VER_1);;
    int result;

		//debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

		//Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
		webapiclientlibmutex.lock();
		auto webapi_comms_queueitbegin=webapi_comms_queue.begin();
		auto webapi_comms_queueitend=webapi_comms_queue.end();
		webapiclientlibmutex.unlock();
		std::list< std::list<webapiclient_comm_t *>::iterator > comms_to_remove;

		result=dblibifaceptr->begin();
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
      return;
    }
		for (auto &it=webapi_comms_queueitbegin; it!=webapi_comms_queueitend; it++) {
			int result;
			int64_t commpk;

			//Check the database to see if the link has already been added
			result=dblibifaceptr->getcommpk((*it)->addr, &commpk);
			if (result==0) {
				debuglibifaceptr->debuglib_printf(1, "%s: Going to remove Comm device from queue: %016" PRIX64 " as it is already in the database\n", __func__, (*it)->addr);
				comms_to_remove.push_back(it);
			} else if (result<-1) {
				debuglibifaceptr->debuglib_printf(1, "%s: Failed to check with database for Comm device: %016" PRIX64 ", postponing sending to webapi\n", __func__, (*it)->addr);
			} else {
                (*it)->okaytoadd=true;
			}
		}
		result=dblibifaceptr->end();
    if (result<0) {
      dblibifaceptr->rollback();
    }
		webapiclientlibmutex.lock();
		for (auto const &it : comms_to_remove) {
			debuglibifaceptr->debuglib_printf(1, "%s: Removing Comm device from queue: %016" PRIX64 "\n", __func__, (*it)->addr);
      delete (*it);
			webapi_comms_queue.erase(it);
		}
		webapiclientlibmutex.unlock();
		//debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
	}
	
	//Remove links from the webapi queue that don't need to be re-added
	void remove_already_added_links(void) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
		dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", 	DBLIBINTERFACE_VER_1);;
    int result;

		//debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

		//Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
		webapiclientlibmutex.lock();
		auto webapi_links_queueitbegin=webapi_links_queue.begin();
		auto webapi_links_queueitend=webapi_links_queue.end();
		webapiclientlibmutex.unlock();
		std::list< std::list<webapiclient_link_t *>::iterator > links_to_remove;

		result=dblibifaceptr->begin();
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
      return;
    }
		for (auto &it=webapi_links_queueitbegin; it!=webapi_links_queueitend; it++) {
			int result;
			int64_t linkpk;

			//Check the database to see if the link has already been added
			result=dblibifaceptr->getlinkpk((*it)->addr, &linkpk);
			if (result==0) {
				debuglibifaceptr->debuglib_printf(1, "%s: Going to remove Link from queue: %016" PRIX64 " as it is already in the database\n", __func__, (*it)->addr);
				links_to_remove.push_back(it);
			} else if (result<-1) {
				debuglibifaceptr->debuglib_printf(1, "%s: Failed to check with database for Link: %016" PRIX64 ", postponding sending to webapi\n", __func__, (*it)->addr);
			} else {
				(*it)->okaytoadd=true;
			}
		}
		result=dblibifaceptr->end();
    if (result<0) {
      dblibifaceptr->rollback();
    }
		webapiclientlibmutex.lock();
		for (auto const &it : links_to_remove) {
			debuglibifaceptr->debuglib_printf(1, "%s: Removing Link from queue: %016" PRIX64 "\n", __func__, (*it)->addr);
      delete (*it);
			webapi_links_queue.erase(it);
		}
		webapiclientlibmutex.unlock();
		//debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
	}

  //Remove things from the webapi queue that don't need to be re-added
  void remove_already_added_things(void) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
    dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib",  DBLIBINTERFACE_VER_1);;
    int result;

    //debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

    //Once we have begin and end iterators we shouldn't need a lock to traverse the list unless we modify the contents
    webapiclientlibmutex.lock();
    auto webapi_things_queueitbegin=webapi_things_queue.begin();
    auto webapi_things_queueitend=webapi_things_queue.end();
    webapiclientlibmutex.unlock();
    std::list< std::list<webapiclient_thing_t *>::iterator > things_to_remove;

    result=dblibifaceptr->begin();
    if (result<0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to start database transaction\n", __func__);
      return;
    }
    for (auto &it=webapi_things_queueitbegin; it!=webapi_things_queueitend; it++) {
      int result;
      int64_t thingpk;

      //Check the database to see if the thing has already been added
      result=dblibifaceptr->getthingpk((*it)->serialcode, (*it)->hwid, &thingpk);
      if (result==0) {
        debuglibifaceptr->debuglib_printf(1, "%s: Going to remove Thing from queue: %08" PRIX32 " as it is already in the database\n", __func__, (*it)->hwid);
        things_to_remove.push_back(it);
      } else if (result<-1) {
        debuglibifaceptr->debuglib_printf(1, "%s: Failed to check with database for Thing: %08" PRIX32 ", postponding sending to webapi\n", __func__, (*it)->hwid);
      } else {
        (*it)->okaytoadd=true;
      }
    }
    result=dblibifaceptr->end();
    if (result<0) {
      dblibifaceptr->rollback();
    }
    webapiclientlibmutex.lock();
    for (auto const &it : things_to_remove) {
      debuglibifaceptr->debuglib_printf(1, "%s: Removing Thing from queue: %08" PRIX32 "\n", __func__, (*it)->hwid);
      delete (*it);
      webapi_things_queue.erase(it);
    }
    webapiclientlibmutex.unlock();
    //debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
  }

	void update_timer_loop() {
		dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1);;
		configlib_ifaceptrs_ver_1_cpp_t *configlibifaceptr=(configlib_ifaceptrs_ver_1_cpp_t *) webapiclientlib_getmoduledepifaceptr("configlib", CONFIGLIBINTERFACECPP_VER_1);
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

	boost::lock_guard<boost::mutex> guard(mtx_);
		timer.expires_from_now(boost::chrono::seconds(5));
		timer.async_wait(boost::bind(&webapiclientloop_asyncloop::timer_handler, this, boost::asio::placeholders::error));

    if (dblibifaceptr->is_initialised()) {
			set_hubpk_for_comm_devices();
			remove_already_added_comm_devices();
			set_locakpk_for_links();
			remove_already_added_links();
      set_linkpk_for_things();
      remove_already_added_things();
			std::string webapihostname="", webapiport="80", webapiurl="", webapihttpuser="", webapihttppass="", webapiuser="", webapipass="";
			bool result, missingval=false;

			result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "hostname", webapihostname);
			if (!result) {
				missingval=true;
			}
			result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "port", webapiport);
			result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "url", webapiurl);
			if (!result) {
				missingval=true;
			}
			configlibifaceptr->getnamevalue_cpp("webapiconfig", "httpusername", webapihttpuser);
			configlibifaceptr->getnamevalue_cpp("webapiconfig", "httppassword", webapihttppass);
			configlibifaceptr->getnamevalue_cpp("webapiconfig", "apiusername", webapiuser);
			configlibifaceptr->getnamevalue_cpp("webapiconfig", "apipassword", webapipass);
			if (!missingval && (!webapi_links_queue.empty() || !webapi_comms_queue.empty() || !webapi_things_queue.empty())) {
				debuglibifaceptr->debuglib_printf(1, "%s: Starting client connection\n", __func__);
				client.start(webapihostname, webapiport, webapiurl, webapiuser, webapipass, webapihttpuser, webapihttppass);
			}
		}
	}

	//Called every time the main timer triggers
	void timer_handler(const boost::system::error_code& error) {
		if (!webapiclientlib_getneedtoquit()) {
			update_timer_loop();
		}
	}
};

webapiclientloop_asyncloop gasyncloop;

static void webapiclientlib_mainloop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	while (!webapiclientlib_getneedtoquit()) {
		//Auto restart the loop if it crashes before we are ready to quit
		gasyncloop.start();
	}
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static boost::atomic<bool> webapiclientlib_needtoquit(false);

static void webapiclientlib_setneedtoquit(bool val) {
  webapiclientlib_needtoquit.store(val);
}

static int webapiclientlib_getneedtoquit() {
  return webapiclientlib_needtoquit.load();
}

static bool webapiclientlib_havemainthread=false;

static int webapiclientlib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
	int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
	if (!webapiclientlib_havemainthread) {
		try {
			debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
			webapiclientlib_mainthread=boost::thread(webapiclientlib_mainloop);
			webapiclientlib_havemainthread=true;
		} catch (boost::thread_resource_error& e) {
			debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
		}
	}
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

static void webapiclientlib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
	if (webapiclientlib_havemainthread) {
		debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    webapiclientlib_setneedtoquit(true);
		gasyncloop.stop();
		webapiclientlib_mainthread.interrupt();
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    webapiclientlib_mainthread.join();
    webapiclientlib_havemainthread=false;
	}
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

static int webapiclientlib_inuse=0; //Only do full shutdown when inuse = 0
static bool webapiclientlib_shuttingdown=false;

static int webapiclientlib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1);;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (webapiclientlib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __func__);
    return -1;
  }
  ++webapiclientlib_inuse;
  if (webapiclientlib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, webapiclientlib_inuse);
    return -1;
  }
  //Let the database library know that we want to use it
  dblibifaceptr->init();

  webapiclientlib_needtoquit=false;
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

static void webapiclientlib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1);
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) webapiclientlib_getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1);;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (webapiclientlib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --webapiclientlib_inuse;
  if (webapiclientlib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, webapiclientlib_inuse);
    return;
  }
  //Start shutting down library
  webapiclientlib_shuttingdown=true;

  //Finished using the database library
  dblibifaceptr->shutdown();

  for (auto const &it : webapi_links_queue) {
    delete it;
  }
	webapi_links_queue.clear();

  for (auto const &it : webapi_comms_queue) {
    delete it;
  }
  webapi_comms_queue.clear();

	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  //Finished shutting down
  webapiclientlib_shuttingdown=false;
}

moduleinfo_ver_generic_t *webapiclientlib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &webapiclientlib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
JNIEXPORT jlong JNICALL Java_com_capsicumcorp_iomy_libraries_watchinputs_WebApiClientLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj)) {
  return (jlong) webapiclientlib_getmoduleinfo();
}
#endif
