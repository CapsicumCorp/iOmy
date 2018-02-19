/*
Title: Camera Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with cameras
Copyright: Capsicum Corporation 2018

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

//NOTE: POSIX_C_SOURCE is needed for the following
//  CLOCK_REALTIME
//  sem_timedwait
#define _POSIX_C_SOURCE 200112L

//NOTE: _XOPEN_SOURCE is needed for the following
//  pthread_mutexattr_settype
//  PTHREAD_MUTEX_ERRORCHECK
#define _XOPEN_SOURCE 500L

//Needed for endian.h functions
#define _BSD_SOURCE

//Use Boost Chrono instead of C++11 chrono
#define BOOST_ASIO_DISABLE_STD_CHRONO

//These definitions will be picked up by commonlib.h
#ifdef DEBUG
#define ENABLE_PTHREAD_DEBUG_V2
#endif
#ifdef CAMERALIB_LOCKDEBUG
#define LOCKDEBUG
#endif
#ifdef CAMERALIB_MOREDEBUG
#define MOREDEBUG
#endif

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <termios.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <pthread.h>
#include <time.h>
#include <semaphore.h>
#include <endian.h>
#include <arpa/inet.h>
#include <array>
#include <list>
#include <vector>
#include <map>
#include <string>
#include <sstream>
#include <boost/algorithm/string.hpp>
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
#include <android/log.h>
#endif
#include "moduleinterface.h"
#include "cameralibpriv.hpp"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/commonlib/commonlib.h"
#include "modules/configlib/configlib.hpp"

//From cmdserverlib.h
//These lines will be needed at the top of your C or C++ file below the includes
//  if using interface version >= 2 until interface 1 is removed from this file
#undef CMDLISTENER_NOERROR
#undef CMDLISTENER_NOTHANDLED
#undef CMDLISTENER_CMDINVALID

//Quick hack to work around problem where Android implements le16toh as letoh16
//NOTE: Newer versions of Android correctly define le16toh
#ifdef __ANDROID__
#ifndef le16toh
#define le16toh(x) letoh16(x)
#endif
#endif

namespace cameralib {

static const int WEBAPI_ACCESS_INTERVAL=5; //Number of seconds between web api accesses

using boost::asio::ip::tcp;

static boost::recursive_mutex thislibmutex;

static int ginuse=0; //Only shutdown when inuse = 0
static int gshuttingdown=0;

static char gneedtoquit=0; //Set to 1 when this library should exit

static pthread_t gmainthread=0;

static bool gneedmoreinfo=false; //Set to false when a device needs more info to indicate that we shouldn't sleep for very long

std::int64_t ghubpk;

//global iface pointers set once for improved performance compared to for every function that uses it,
//  as the pointer value shouldn't change apart from during init/shutdown stage
static const cmdserverlib_ifaceptrs_ver_2_t *cmdserverlibifaceptr;
static const dblib_ifaceptrs_ver_1_t *dblibifaceptr;
static const debuglib_ifaceptrs_ver_1_t *debuglibifaceptr;
static const configlib_ifaceptrs_ver_2_cpp_t *configlibifaceptr;

//Static Function Declarations

//Function Declarations
static void setneedtoquit(bool val);
static bool getneedtoquit(void);
static int start(void);
static void stop(void);
static int init(void);
static void shutdown(void);
static void register_listeners(void);
static void unregister_listeners(void);

//Module Interface Definitions
static moduledep_ver_1_t gdeps[]={
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
    "cmdserverlib",
    nullptr,
    CMDSERVERLIBINTERFACE_VER_2,
    0
  },
  {
    "commonlib",
    nullptr,
    COMMONLIBINTERFACE_VER_1,
    1
  },
  {
    "configlib",
    nullptr,
    CONFIGLIBINTERFACECPP_VER_2,
    1
  },
  {
    nullptr, nullptr, 0, 0
  }
};

static moduleinfo_ver_1_t gmoduleinfo_ver_1={
  MODULEINFO_VER_1,
  "cameralib",
  init,
  shutdown,
  start,
  stop,
  register_listeners,
  unregister_listeners,
  nullptr,
  (moduledep_ver_1_t (*)[]) &gdeps
};

//Find a pointer to module interface pointer
//Returns the pointer to the interface or NULL if not found
//NOTE: A little slower than referencing the array element directly, but less likely to cause a programming fault
//  due to rearranging depencencies
static const void *getmoduledepifaceptr(const char *modulename, unsigned ifacever) {
  int i=0;

  while (gdeps[i].modulename) {
    if (strcmp(gdeps[i].modulename, modulename)==0) {
      if (gdeps[i].ifacever==ifacever) {
        return gdeps[i].ifaceptr;
      }
    }
    ++i;
  }
  return NULL;
}

#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
static void thislib_backtrace(void) {
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __PRETTY_FUNCTION__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __PRETTY_FUNCTION__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __PRETTY_FUNCTION__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
static void thislib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

/*
  Thread unsafe get need more info value
*/
static bool _getneedmoreinfo(void) {
  return gneedmoreinfo;
}

/*
  Thread safe get need more info value
*/
static bool getneedmoreinfo() {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  return _getneedmoreinfo();
}

/*
  Thread unsafe set need more info value
*/
static void _setneedmoreinfo(bool needmoreinfo) {
  gneedmoreinfo=needmoreinfo;
}

/*
  Thread safe set need more info value
*/
static void setneedmoreinfo(bool needmoreinfo) {
  boost::lock_guard<boost::recursive_mutex> guard(thislibmutex);
  _setneedmoreinfo(needmoreinfo);
}


//----------------------
//Class/Struct functions
//----------------------

//----------------------

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
  std::string http_version;
  unsigned httpstatuscode;
  long httpbodylen;
  WEBAPI_REQUEST_MODES requestmode;

  //See http://stackoverflow.com/questions/21120361/boostasioasync-write-and-buffers-over-65536-bytes
  //These variables need to stay allocated while the asio request is active so can't be local to a single function
  httpclient hc;

public:
  asioclient(boost::asio::io_service& io_service)
    : stopped_(true), resolver_(io_service), socket_(io_service), deadline_(io_service) {
      //NOTE: When initialised globally, debuglibifaceptr won't be initialised yet
    }

  // Called by the user of the client class to initiate the connection process.
  // The endpoint iterator will have been obtained using a tcp::resolver.
  void start(const std::string& server, const std::string& webapiport, const std::string& path, const std::string& username, const std::string& password, const std::string &httpusername, const std::string &httppassword) {
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
    struct timespec curtime;
    clock_gettime(CLOCK_REALTIME, &curtime);

    // Start an asynchronous resolve to translate the server and service names
    // into a list of endpoints.
    tcp::resolver::query query(httpserver, this->webapiport);
    resolver_.async_resolve(query,
      boost::bind(&asioclient::handle_resolve, this,
        boost::asio::placeholders::error,
        boost::asio::placeholders::iterator));

    //Set a starting deadline timer for 10 seconds (Queries shouldn't take longer than that
    deadline_.expires_from_now(boost::chrono::seconds(10));

    // Start the deadline actor
    deadline_.async_wait(boost::bind(&asioclient::check_deadline, this));
  }

  // This function terminates all the actors to shut down the connection. It
  // may be called by the user of the client class, or by the class itself in
  // response to graceful termination or an unrecoverable error.
  void stop() {
    if (stopped_) {
      return;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Stopping connection\n", __PRETTY_FUNCTION__);
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
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      std::stringstream tmps;
      tmps << endpoint_iterator->endpoint();
      debuglibifaceptr->debuglib_printf(1, "%s: Trying %s...\n", __PRETTY_FUNCTION__, tmps.str().c_str());

      // Set a deadline for the connect operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Attempt a connection to each endpoint in the list until we
      // successfully establish a connection.
      boost::asio::async_connect(socket_, endpoint_iterator,
          boost::bind(&asioclient::handle_connect, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s, Hostname: %s, Port: %s\n", __PRETTY_FUNCTION__, err.message().c_str(), this->httpserver.c_str(), this->webapiport.c_str());
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
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      //TODO: Call processing function here
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void handle_write_request(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
      return;
    }
    if (!err)
    {
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Read the response status line. The response_ streambuf will
      // automatically grow to accommodate the entire line. The growth may be
      // limited by passing a maximum size to the streambuf constructor.
      boost::asio::async_read_until(socket_, response_, "\r\n",
          boost::bind(&asioclient::handle_read_status_line, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void handle_read_status_line(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
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
        debuglibifaceptr->debuglib_printf(1, "%s: Invalid response: %s\n", __PRETTY_FUNCTION__, http_version.c_str());
        stop();
        return;
      } else if (httpstatuscode == 401 || httpstatuscode == 403) {
        //Abort as the password was incorrect
        debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __PRETTY_FUNCTION__);
        stop();
        return;
      } else if (httpstatuscode != 200) {
        debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __PRETTY_FUNCTION__, httpstatuscode);
        stop();
        return;
      }
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(10));

      // Read the response headers, which are terminated by a blank line.
      boost::asio::async_read_until(socket_, response_, "\r\n\r\n",
          boost::bind(&asioclient::handle_read_headers, this,
            boost::asio::placeholders::error));
    }
    else
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  void handle_read_headers(const boost::system::error_code& err) {
    if (stopped_) {
      debuglibifaceptr->debuglib_printf(1, "%s: Connection Aborted\n", __PRETTY_FUNCTION__);
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
          debuglibifaceptr->debuglib_printf(1, "%s: Content-Length=%ld\n", __PRETTY_FUNCTION__, httpbodylen);
        }
        debuglibifaceptr->debuglib_printf(1, "%s: Header: %s\n", __PRETTY_FUNCTION__, header.c_str());
      }
      if (!havebodylen) {
        //Can't continue without proper body length so abort
        debuglibifaceptr->debuglib_printf(1, "%s: Error: Failed to retrieve Content-Length\n", __PRETTY_FUNCTION__);
        stop();
        return;
      }
      // Set a deadline for the read operation.
      deadline_.expires_from_now(boost::chrono::seconds(60));

      if (httpstatuscode == 401 || httpstatuscode==403) {
        //Abort as the password was incorrect
        debuglibifaceptr->debuglib_printf(1, "%s: Authentication Failure\n", __PRETTY_FUNCTION__);
        stop();
        return;
      } else if (httpstatuscode != 200) {
        debuglibifaceptr->debuglib_printf(1, "%s: Response returned with status code: %u\n", __PRETTY_FUNCTION__, httpstatuscode);

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
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
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
        debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned error code: %d, error message: %s\n", __PRETTY_FUNCTION__, errcode, errorstr.c_str());
        if (errcode==0) {
          //Error code 0 normally means success so if there was an error adjust to -1 for the return
          errcode=-1;
        }
      }
    } catch (boost::property_tree::ptree_error &e) {
      debuglibifaceptr->debuglib_printf(1, "%s: Webapi server returned an unknown result\n", __PRETTY_FUNCTION__);
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
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Body: \"%s\"\n", __PRETTY_FUNCTION__, httpbody.c_str());

      int result=process_response(httpbody);

      if (result==0) {
        successful_send();
      } else {
        failed_send();
      }
    }
    else if (err != boost::asio::error::eof)
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Error: %s\n", __PRETTY_FUNCTION__, err.message().c_str());
      stop();
    }
  }

  //Do processing after the request has been sent and then send the next request
  void successful_send() {
    if (stopped_) {
      //Send next request
      debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG: Sending next request\n", __PRETTY_FUNCTION__);
      start(httpserver, webapiport, httppath, apiusername, apipassword, httpusername, httppassword);
    }
  }

  void failed_send() {
    //Stop processing and sleep until the next scheduled webapi call
    stop();
  }

  void check_deadline() {
    if (stopped_)
      return;

    // Check whether the deadline has passed. We compare the deadline against
    // the current time since a new asynchronous operation may have moved the
    // deadline before this actor had a chance to run.
    if (deadline_.expires_at() <= boost::chrono::system_clock::now())
    {
      debuglibifaceptr->debuglib_printf(1, "%s: Server took too long to respond\n", __PRETTY_FUNCTION__);

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


class asyncloop {
private:
  boost::mutex mtx_;
  boost::asio::io_service io_service;
  boost::asio::system_timer mainTimer;
  boost::asio::system_timer webapiTimer;
  asioclient client;

public:
  asyncloop()
    : mainTimer(io_service), webapiTimer(io_service), client(io_service) {
    }

  void start() {
    //webapi_timer_loop();
    main_timer_loop();
    try {
      io_service.run();
      io_service.reset();
    } catch (std::exception& e) {
      debuglibifaceptr->debuglib_printf(1, "%s: Error while running service: %s\n", __PRETTY_FUNCTION__, e.what());
    }
  }

  void stop() {
    debuglibifaceptr->debuglib_printf(1, "%s: Got here 1\n", __PRETTY_FUNCTION__);
    boost::lock_guard<boost::mutex> guard(mtx_);
    client.stop();
    mainTimer.expires_from_now(boost::chrono::seconds(0));
    webapiTimer.expires_from_now(boost::chrono::seconds(0));
  }
private:
  void main_timer_loop() {
    mainTimer.expires_from_now(boost::chrono::seconds(1)); //Run main loop every second
    mainTimer.async_wait(boost::bind(&asyncloop::main_timer_handler, this, boost::asio::placeholders::error));
  }

  void webapi_timer_loop() {
    std::string webapihostname="", webapiport="80", webapiurl="", webapihttpuser="", webapihttppass="", webapiuser="", webapipass="";
    bool result, missingval=false;
    std::string hubpkstr;

    boost::lock_guard<boost::mutex> guard(mtx_);

    result=configlibifaceptr->getnamevalue_cpp("general", "hubpk", hubpkstr);
    if (!result) {
      missingval=true;
    }
    ghubpk=std::atol(hubpkstr.c_str());

    result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "hostname", webapihostname);
    if (!result) {
      missingval=true;
    }
    result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "port", webapiport);
    result=configlibifaceptr->getnamevalue_cpp("webapiconfig", "hubcameraurl", webapiurl);
    if (!result) {
      missingval=true;
    }
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "httpusername", webapihttpuser);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "httppassword", webapihttppass);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "apiusername", webapiuser);
    configlibifaceptr->getnamevalue_cpp("webapiconfig", "apipassword", webapipass);
    if (!missingval) {
      webapiTimer.expires_from_now(boost::chrono::seconds(WEBAPI_ACCESS_INTERVAL)); //Restart every WEBAPI_ACCESS_INTERVAL seconds
      webapiTimer.async_wait(boost::bind(&asyncloop::webapi_timer_handler, this, boost::asio::placeholders::error));

      debuglibifaceptr->debuglib_printf(1, "%s: Starting client connection\n", __PRETTY_FUNCTION__);
      client.start(webapihostname, webapiport, webapiurl, webapiuser, webapipass, webapihttpuser, webapihttppass);
    } else {
      webapiTimer.expires_from_now(boost::chrono::seconds(1)); //Restart every second when config isn't ready
      webapiTimer.async_wait(boost::bind(&asyncloop::webapi_timer_handler, this, boost::asio::placeholders::error));

      debuglibifaceptr->debuglib_printf(1, "%s: Configuration not yet ready\n", __PRETTY_FUNCTION__);
    }
  }

  //Called every time the main timer triggers
  void main_timer_handler(const boost::system::error_code& error) {
    if (!getneedtoquit()) {
      main_timer_loop();
    }
  }

  //Called every time the webapi timer triggers
  void webapi_timer_handler(const boost::system::error_code& error) {
    if (!getneedtoquit()) {
      webapi_timer_loop();
    }
  }
};

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
static int processcommand(const char *buffer, int clientsock) {
  std::string bufferstring;
  std::vector<std::string> buffertokens;

  if (!cmdserverlibifaceptr) {
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();

  //Convert the string to tokens using C++ Boost algorithms for easier access
  bufferstring=buffer;
  boost::algorithm::trim(bufferstring);
  boost::algorithm::split(buffertokens, bufferstring, boost::algorithm::is_any_of(" "), boost::algorithm::token_compress_on);
  if (buffertokens.size()==0) {
    //No valid tokens found
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  {
    return *cmdserverlibifaceptr->CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return *cmdserverlibifaceptr->CMDLISTENER_NOERROR;
}

asyncloop gasyncloop;

/*
  Main thread loop that manages operation of rules
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
static void *mainloop(void *UNUSED(val)) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  while (!getneedtoquit()) {
    if (getneedtoquit()) {
      break;
    }
    //Auto restart the loop if it crashes before we are ready to quit
    gasyncloop.start();
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return (void *) 0;
}

static boost::atomic<bool> needtoquit(false);

static void setneedtoquit(bool val) {
  needtoquit.store(val);

  //Trigger stop in the main async loop
  gasyncloop.stop();
}

static bool getneedtoquit() {
  return needtoquit.load();
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int start(void) {
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  //Start a thread for auto detecting Xbee modules
  if (gmainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __PRETTY_FUNCTION__);
    result=pthread_create(&gmainthread, nullptr, mainloop, nullptr);
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __PRETTY_FUNCTION__);
      result=-1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
static void stop(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gmainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __PRETTY_FUNCTION__);
    setneedtoquit(true);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __PRETTY_FUNCTION__);
    pthread_join(gmainthread, nullptr);
    gmainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static int init(void) {
  cmdserverlibifaceptr=reinterpret_cast<const cmdserverlib_ifaceptrs_ver_2_t *>(getmoduledepifaceptr("cmdserverlib", CMDSERVERLIBINTERFACE_VER_2));
  dblibifaceptr=reinterpret_cast<const dblib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("dblib", DBLIBINTERFACE_VER_1));;
  debuglibifaceptr=reinterpret_cast<const debuglib_ifaceptrs_ver_1_t *>(getmoduledepifaceptr("debuglib", DEBUGLIBINTERFACE_VER_1));
  configlibifaceptr=reinterpret_cast<const configlib_ifaceptrs_ver_2_cpp_t *>(getmoduledepifaceptr("configlib", CONFIGLIBINTERFACECPP_VER_2));

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);

  if (gshuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __PRETTY_FUNCTION__);
    return -1;
  }
  ++ginuse;
  if (ginuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return -1;
  }
  gneedtoquit=0;
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
static void shutdown(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (ginuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __PRETTY_FUNCTION__);
    return;
  }
  --ginuse;
  if (ginuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __PRETTY_FUNCTION__, ginuse);
    return;
  }
  //Start shutting down library
  gshuttingdown=1;

  gshuttingdown=0;

  //Free allocated memory
  ghubpk=0;

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Register all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void register_listeners(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->register_cmd_listener(processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

/*
  Unregister all the listeners for this library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
static void unregister_listeners(void) {
  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __PRETTY_FUNCTION__);
  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->unregister_cmd_listener(processcommand);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __PRETTY_FUNCTION__);
}

} //End of namespace

//C Exports
extern "C" {

extern moduleinfo_ver_generic_t *cameralib_getmoduleinfo();

}

extern moduleinfo_ver_generic_t *cameralib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &cameralib::gmoduleinfo_ver_1;
}

#ifdef __ANDROID__

//JNI Exports
extern "C" {
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CameraLib_jnigetmodulesinfo( JNIEnv* env, jobject obj);
}

JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_CameraLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  //First cast to from pointer to long as that is the same size as a pointer then extend to jlong if necessary
  //  jlong is always >= unsigned long
  return (jlong) ((unsigned long) cameralib_getmoduleinfo());
}
#endif
