/*
Title: ZigBee Library for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Library for communicating with Zigbee modules
Copyright: Capsicum Corporation 2010-2016

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

NOTE: Non-static data member initializers are being used as they are supported with C++11
NOTE: RapidHA seems to have a total in transit buffer limit of 5 packets which includes packets that are waiting for a response
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

//Needed for stdint MIN/MAX types
#define __STDC_LIMIT_MACROS

//Needed for inttypes PRI macros
#define __STDC_FORMAT_MACROS

#ifndef __ANDROID__
#include <execinfo.h>
#endif
#include <cstdint>
#include <inttypes.h>
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
#include <exception>
#include <stdexcept>
#include <list>
#include <map>
#include <sstream>
#include <string>
#include <vector>
#ifdef __ANDROID__
#include <jni.h>
#endif
#include "moduleinterface.h"
#include "modules/commonlib/commonlib.h"
#include "zigbeelib.h"
#include "zigbeelibpriv.h"
#include "modules/dbcounterlib/dbcounterlib.h"
#include "modules/commonserverlib/commonserverlib.h"
#include "modules/cmdserverlib/cmdserverlib.h"
#include "modules/debuglib/debuglib.h"
#include "modules/dblib/dblib.h"
#include "modules/webapiclientlib/webapiclientlib.hpp"
#include "modules/configlib/configlib.hpp"
#include "modules/locklib/locklib.h"

//Quick hack to work around problem where Android implements le16toh as letoh16
//NOTE: Newer versions of Android correctly define le16toh
#ifdef __ANDROID__
#ifndef le16toh
#define le16toh(x) letoh16(x)
#endif
#endif

#ifdef ZIGBEELIB_DEBUGWITHOUTDATABASE
#warning "zigbeelib: Debugging without database has been enabled"
#endif

/*#ifdef DEBUG
/*#warning "ZIGBEELIB_PTHREAD_LOCK and ZIGBEELIB_PTHREAD_UNLOCK debugging has been enabled"
#include <errno.h>
#define ZIGBEELIB_PTHREAD_LOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_lock(mutex); \
  if (lockresult==EDEADLK) { \
    printf("-------------------- WARNING --------------------\nMutex deadlock in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    zigbeelib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex lock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    zigbeelib_backtrace(); \
  } \
}

#define ZIGBEELIB_PTHREAD_UNLOCK(mutex) { \
  int lockresult; \
  lockresult=pthread_mutex_unlock(mutex); \
  if (lockresult==EPERM) { \
    printf("-------------------- WARNING --------------------\nMutex already unlocked in file: %s function: %s line: %d\n-------------------------------------------------\n", __FILE__, __func__, __LINE__); \
    zigbeelib_backtrace(); \
  } else if (lockresult!=0) { \
    printf("-------------------- WARNING --------------------\nMutex unlock returned error: %d in file: %s function: %s line: %d\n-------------------------------------------------\n", lockresult, __FILE__, __func__, __LINE__); \
    zigbeelib_backtrace(); \
  } \
}

#else

#define ZIGBEELIB_PTHREAD_LOCK(mutex) pthread_mutex_lock(mutex)
#define ZIGBEELIB_PTHREAD_UNLOCK(mutex) pthread_mutex_unlock(mutex)

#endif
*/

//#define ZIGBEELIB_PTHREAD_LOCK(mutex) LOCKLIB_LOCK(mutex, "zigbeelibmutex")
//#define ZIGBEELIB_PTHREAD_UNLOCK(mutex) LOCKLIB_UNLOCK(mutex, "zigbeelibmutex")

#define ZIGBEELIB_PTHREAD_LOCK(mutex, __FILE__, __func__, __LINE__) \
  locklibifaceptr->pthread_mutex_lock(mutex, "zigbeelibmutex", __FILE__, __func__, __LINE__);

#define ZIGBEELIB_PTHREAD_UNLOCK(mutex, __FILE__, __func__, __LINE__) \
  locklibifaceptr->pthread_mutex_unlock(mutex, "zigbeelibmutex", __FILE__, __func__, __LINE__);

#ifdef ZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_ENTERINGFUNC() { }
#endif

#ifdef ZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define LOCKDEBUG_EXITINGFUNC() { }
#endif

#ifdef ZIGBEELIB_LOCKDEBUG
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define LOCKDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

#ifdef ZIGBEELIB_MOREDEBUG
#define MOREDEBUG_ENTERINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Entering %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_ENTERINGFUNC() { }
#endif

#ifdef ZIGBEELIB_MOREDEBUG
#define MOREDEBUG_EXITINGFUNC() { \
  debuglibifaceptr->debuglib_printf(1, "Exiting %s thread id: %lu line: %d\n", __func__, pthread_self(), __LINE__); \
}
#else
  #define MOREDEBUG_EXITINGFUNC() { }
#endif

#ifdef ZIGBEELIB_MOREDEBUG
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#else
#define MOREDEBUG_ADDDEBUGLIBIFACEPTR() { }
#endif

//NOTE: backtrace doesn't work with static functions so disable if DEBUG is enabled
#ifdef DEBUG
#define STATIC
#else
#define STATIC static
#endif

#ifdef DEBUG
#define INLINE
#else
#define INLINE inline
#endif

//Include the c file inline as it is only definitions at the moment
#include "modules/zigbeelib/zigbeelib_zigbeedeviceids.c.inc"
#include "modules/zigbeelib/zigbeelib_zigbeezclstatus.c.inc"
#include "modules/zigbeelib/zigbeelib_zigbeezclcmds.c.inc"

#define BUFFER_SIZE 256

#define MAX_LOCALZIGBEE_DEVICES 10 //Maximum number of local zigbee devices to allow

#define BROADCAST_WAIT_TIME 60 //Wait 60 seconds in between broadcasts
#define ZIGBEE_MAX_RETRIES 3 //Number of times to retry sending a Zigbee packet that has timed out before removing the Zigbee device
#define ZIGBEE_MAX_PACKET_WAITTIME 20 //Maximum time to wait for a response or timeout to a packet before assuming that the local zigbee device has lost it
#define ZIGBEE_NOTCONNECTED_RETRYWAITTIME 60 //Amount of time to wait before retrying packets on a device marked as not connected
#define ZIGBEE_TEMPJOIN_DURATION 120 //Number of seconds to allow temporary join

#define MAX_SEND_QUEUE_ITEMS 1000 //Maximum number of items to hold in the remote packet send queue

#define MAX_TIME_ZIGBEE_NO_PACKETS 300 //Maximum time allowed for a Zigbee device to not send any packets to the local zigbee device before assuming it is no longer connected

#define ZIGBEE_MIN_MANU_DISC 0x0100 //Some devices timeout if low cluster values are queried for manufacturer specific attributes

typedef struct zigbeecluster zigbeecluster_t;
typedef struct localzigbeedevice localzigbeedevice_t;
typedef struct zigbeelib_sendqueue_item zigbeelib_sendqueue_item_t;

//NOTE: Even though each item may become unused in random order we still use an
//  index for sending that always advances forward (and wraps around) so packets
//  get sent in fifo order as that will ensure that all packets eventually get sent.

//if sendqueueindex increments to an inused item, then keep stepping until we reach an unused item
//Also use a remainingsendqueueitems variable so we know how many slots are still available
//If the queue gets full (overloaded) just reject new send requests for now (In the future we may handle
//  waiting for important requests or maybe support priorities so some packets can be thrown
//  away to make room for higher priority packets)
//NOTE: RapidHA Zigbee timeout is 10 seconds by default
//NOTE2: If we have the sequence number we can use that for matching instead of the netaddr and cluster
struct zigbeelib_sendqueue_item {
  char inuse; //Whether this item is in use
  char sent; //1=The packet has been sent
  char waitingforsendstatus; //Used if the parent library can report send status with this packet
  char waitingforresponse; //Waiting for response from the Zigbee device
  time_t startsendtime; //Set to the current time when this packet has been sent
  char retrycnt; //Number of times we have retried sending this packet to the Zigbee device
  int zigbeeidx; //Index number to the zigbee device this packet is sending to or -1 if no match
  uint8_t packettype; //ZIGBEE_ZIGBEE_ZDO or ZIGBEE_ZIGBEE_ZCL_GENERAL
  uint16_t send_netaddr; //16-bit Network Address when sending this packet
  uint16_t send_cluster; //16-bit Cluster when sending this packet
  uint16_t recv_netaddr; //16-bit Expected Network Address when receiving this packet
  uint16_t recv_cluster; //16-bit Expected Cluster when receiving this packet
  char haveseqnumber; //Set to 1 if we have the Zigbee sequence number that is being used to send this packet
                      //NOTE: May arrive later if the parent device auto generates the sequence number
  uint8_t seqnumber; //Any value is valid
  uint8_t packetlen; //The length of the packet to send
  uint8_t *packet; //The packet to send
};

//NOTE: When a two-way value syncs to the database it may take a few seconds to sync from output counter to input counter
//  so we need to wait a few seconds before processing again

//When we copy straight from packet buffer only the bytes used by the attribute value should be copied instead of the entire size of the attrval structure so use zigbeelib_copy_attribute_data_value in the constructor for zigbeeattrmultival

static int zigbeelib_copy_attribute_data_value(zigbee_attrval_t *attrdest, const zigbee_attrval_t& attrsrc, uint8_t datatype);

class zigbeedbmultival;

//For the copy and compare operations if the number isn't directly compatible then best effort will be used
class zigbeeattrmultival {
private:
	zigbee_attrval_t val;
	uint8_t datatype; //The Zigbee data type of the attribute (This is defined in the Zigbee standard and never changes)
public:
	zigbeeattrmultival(uint8_t datatype=ZIGBEE_ZCL_TYPE_NULL) { this->datatype=datatype; };
	zigbeeattrmultival(const zigbee_attrval_t& val, uint8_t datatype=ZIGBEE_ZCL_TYPE_NULL) {
		zigbeelib_copy_attribute_data_value(&this->val, val, datatype);
		this->datatype=datatype;
	};
	zigbee_attrval_t getval() const { return val; };
	uint8_t getdatatype() const { return datatype; };
	void setdatatype(uint8_t datatype) { this->datatype=datatype; }; //NOTE: This may invalidate any values currently set
	int getSize() const; //Get the number of bytes used by the current value
	std::string toString() const;
	zigbeeattrmultival& operator=(uint64_t val);
	zigbeeattrmultival& operator=(int64_t val);
	zigbeeattrmultival& operator=(const std::string& val);
	zigbeeattrmultival& operator=(const zigbeedbmultival& val);
	bool operator==(const zigbeeattrmultival& val) const;
	bool operator==(const zigbeedbmultival& val) const;
	bool operator!=(const zigbeeattrmultival& val) const;
	bool operator!=(const zigbeedbmultival& val) const;
};

//For the copy and compare operations if the number isn't directly compatible then best effort will be used
class zigbeedbmultival {
private:
	multitypeval_t val;
	int datatype;
public:
	zigbeedbmultival(int datatype=DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT) { this->datatype=datatype; };
	zigbeedbmultival(const multitypeval_t& val, int datatype=DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT) { this->val=val; this->datatype=datatype; };
	multitypeval_t getval() const { return val; };
	int getdatatype() const { return datatype; };
	void setdatatype(int datatype) { this->datatype=datatype; }; //NOTE: This may invalidate any values currently set
	int getSize() const; //Get the number of bytes used by the current value
	std::string toString() const;
	zigbeedbmultival& operator=(uint64_t val);
	zigbeedbmultival& operator=(int64_t val);
	zigbeedbmultival& operator=(const zigbeeattrmultival& val);
	bool operator==(const zigbeedbmultival& val) const;
	bool operator==(const zigbeeattrmultival& val) const;
	bool operator!=(const zigbeedbmultival& val) const;
	bool operator!=(const zigbeeattrmultival& val) const;
};

//NOTE: Don't need to initialise the values as time=0 lets us know they have never been set
typedef struct zigbeeattr zigbeeattr_t;
typedef struct zigbeeattrdefs zigbeeattrdefs_t;
struct zigbeeattr {
	time_t invaltime=0; //The time that the attribute value was received from the Zigbee device
	time_t outvaltime=0; //The time that the attribute value was sent to the Zigbee device
	time_t indbvaltime=0; //The time that the attribute value was read from the in counter
	time_t outdbvaltime=0; //The time that the attribute value was sent to an out/update counter
	time_t invalchangedtime=0; //The last time that the received attribute value from the Zigbee device was different from the previous value
	time_t indbvalchangedtime=0; //The last time that the incoming database value was different from the previous value
	zigbeeattrmultival prevval, val; //Updated each time a attribute value arrives from the Zigbee device
	zigbeedbmultival prevdbval, dbval; //Updated each time an in counter is read
	bool requestpending=false; //A poll request for the Zigbee attribute value has been sent

	int dbincounter=-1, dbupdatecounter=-1, dboutcounter=-1;

  std::string name; //Name of Attribute
  uint8_t datatype=0; //The Zigbee data type of the attribute (This is defined in the Zigbee standard and never changes)
  int reporting=0; //0=Don't configure this attribute for reporting only poll, 1 (default)=This attribute should be configured for reporting
  int reportingconfigured=0; //1=Reporting configured, 2=Reporting config is enabled but not configurable
  bool fastreportingconfigured=false; //If true this attribute has had fast reporting configured to improve polling performance
  uint16_t reportmininterval;
  uint16_t reportmaxinterval;
  uint16_t reporttimeout;
  zigbeeattrmultival reportchange;
	int dbfieldtype;
	int dbsensortype;
	std::string dbfieldname;
	long dbinfieldinitialinterval=-1;
	long dbinfieldinterval=-1;
	long dbupdatefieldinterval=-1;
	long dboutfieldinterval=-1;
	int32_t dbrstype=4000;
	int32_t dbuom=1;
	int32_t dbbaseconvert=1;

	zigbeeattr(); //Constructor
	~zigbeeattr(); //Destructor
	zigbeeattr& operator=(const zigbeeattrdefs& attrdef);
};

//NOTE: We should only request discovery of 16 attributes at a time to keep the response packet small
//NOTE2: canreport should be attribute specific as only some attributes might reject reporting
struct zigbeecluster {
  uint16_t id=0; //The id of the cluster
  char needmoreattrs=0; //This cluster is waiting for more attribute info
  char isbound=0; //0=Bind wasn't successful for this cluster so need to use polling

  //Manufacturer ID, Attribute ID, zigbeeattrdefs struct
  //NOTE: At the moment we'll assume when Manufacturer ID=0, that this is a normal attribute
  std::map<uint16_t, std::map<uint16_t, zigbeeattr_t> > attrs;
};

//Default to home automation profile
//Default to device type that could implement multiple clusters
struct zigbeeendpoint {
  uint8_t id=0; //The id of the endpoint
  uint16_t profile=ZIGBEE_HOME_AUTOMATION_PROFILE; //Zigbee profile supported by this endpoint
  uint16_t devid=ZIGBEE_DEVICEID_HA_COMBINED_INTERFACE; //Device description identifier supported on this endpoint
  uint8_t devver=0x00; //Device description version supported on this endpoint
  int32_t thingtype=1;
	int thingport=0;
  char reportingconfigured=0; //1=Reporting has been configured on this endpoint for selected clusters
  uint8_t numiclusters=0;
  uint8_t numoclusters=0;
  std::map<uint16_t, zigbeecluster_t> iclusters, oclusters;
};

//Default to reporting enabled as it is more efficient
struct zigbeedevice {
  char removed=0; //This zigbee device has been removed so is free to be reused by a new zigbee device
  char needtoremove=0; //This zigbee device has been scheduled for removal so functions should stop using it
  char havemanu=0; //1=We have the manufacturer code
  char devicetype; //0=This is a Coordinator, 1=This is a Router, 2=This is an end device, 3=Unknown
  char rxonidle; //1=This device always has the receiver enabled, 0=This device powers down the receiver during idle, 2=rxonidle is Unknown
  char retrycnt=0; //Number of times we have retried sending to this Zigbee device
  char notconnected=0; //1=This device has been marked as not connected so packet sending will be suspended
  time_t connectretrytime=0; //The time to retry sending of a packet on a device that has been marked as not connected
  long inuse=0; //This zigbee device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  localzigbeedevice_t *parentlocaldevice; //The parent device that this zigbee device is associated with (Map it to the structure for the parent local zigbee device when using)
  int timeoutcnt=0; //Starts at 0 and incremented every time a timeout occurs when sending to this device
  uint64_t addr; //64-bit IEEE address of the device
  uint16_t netaddr; //16-bit network address of the device
  uint16_t manu=0; //Manufacturer Code
  int reporting=1; //0=This device doesn't support reporting only polling, 1=This device supports reporting, 2=This device supports reporting/binding but report intevals and attributes are fixed and can't be configured
  uint8_t numendpoints=0; //If this is 0 then we haven't received full info for the endpoints
  //zigbeeendpoint_t *endpoints;
  std::map<uint8_t, zigbeeendpoint_t> endpoints;

	bool havecounters=false;

	uint16_t minmanudisc=ZIGBEE_MIN_MANU_DISC; //Some devices have manufacturer specific attributes in low cluster ranges so this can be used to discovery them

  //Info from the basic cluster
  bool havebasicclusterendpointid=false; //false=We don't have it yet, true=We have it
  bool havebasicclusterinfo=false; //false=We don't have basic cluster info, true=We have basic cluster info
  bool basicinfonotrecognised=false; //false=Basic info (once we have it has been recognised), true=Basic Info hasn't been recognised so full discovery should be done
  int basicclusterendpointid=0; //Endpoint id to use when querying basic cluster attributes
  bool havebasicmanuname=false;
  bool havebasicmodel=false;
  std::string basicmanuname=""; //Manufacturer Name from Basic Cluster
  std::string basicmodel=""; //Model Name from Basic Cluster
  std::string userstr=""; //User friendly name for the zigbee device
  uint16_t subdevicetype=0; //The detected type of device that indicates the custom data structure to use
  time_t lastresponsetime=0; //The time in seconds that the last response was received
};

//NOTE: A non versioned private definition of localzigbeedevice that contains extra fields needed by this library
struct localzigbeedevice {
  char removed=1; //This local zigbee device has been removed so is free to be reused by a new local zigbee device
  char needtoremove=0; //This local zigbee device has been scheduled for removal so functions should stop using it
  long inuse=0; //This local zigbee device is currently in use, increment before using and decrement when finished using, 0=available for reuse
  unsigned long long features=0; //A bitwise value indicating what features are supported by the local zigbee device
  char *devicetype=nullptr; //A user friendly name for the type of zigbee device this is: RapidHA or Xbee Pro for example
  uint64_t addr=0; //64-bit IEEE address of the zigbee device
  uint8_t haendpointid=0; //Home Automation Endpoint ID retrieved via the Zigbee api
  void *deviceptr=nullptr; //A pointer to the parent library's structure for the device

  //A pointer to functions used by this library to interface with the parent library that implements the low level support for the local zigbee device
  //NOTE: Current using zigbeelib_localzigbeedevice_iface_ver_1_t as there is only one interface version at the moment
  zigbeelib_localzigbeedevice_iface_ver_1_t *libraryiface=nullptr;

  //Zigbee data
  int broadcastcount=0; //Number of times a broadcast has been sent
  time_t last_broadcasttime=0; //The timestamp of the last time the broadcast was sent
  int numzigbeedevices=0;
	std::map<int16_t, zigbeedevice_t> zigbeedevices;
	std::map<uint64_t, int16_t> zigbeedeviceaddr; //Mapping between zigbee device 64-bit addresses and the index into the main zigbeedevices array
	std::map<uint16_t, int16_t> zigbeedevicenetaddr; //Mapping between zigbee device 16-bit addresses and the index into the main zigbeedevices array

	//Send queue for remote packets as parent devices have a limited buffer size for in transit packets
  //RapidHA might only allow 1 packet to be in transit at a time
  char parent_sends_zdo_status=0; //Set to 1 if the parent will report a status packet for each ZDO packet sent
  char parent_zdo_status_hasaddr=0; //Set to 1 if the parent's ZDO status packet contains the associated network address
  char parent_zdo_status_hasseqnumber=0; //Set to 1 if the parent's ZDO status packet contains the associated sequence number
  char parent_sends_zcl_status=0; //Set to 1 if the parent will report a status packet for each ZCL packet sent
  char parent_zcl_status_hasaddr=0; //Set to 1 if the parent's ZCL status packet contains the associated network address
  char parent_zcl_status_hasseqnumber=0; //Set to 1 if the parent's ZCL status packet contains the associated sequence number

  zigbeelib_sendqueue_item_t sendqueue_items[MAX_SEND_QUEUE_ITEMS];
  int sendqueuelastitemsentidx=0; //The index of the last queue item sent
  int sendqueuelastitemaddedidx=0; //The index of the last queue item added
  int remainingsendqueueitems=0; //Keeps a count of available send queue items so can reject packets when the queue is full
};

//Zigbee Device Layout definition
typedef struct zigbeedevicelayout zigbeedevicelayout_t;
struct zigbeedevicelayout {
  std::string name; //Name of the Layout
  std::map<uint8_t, zigbeeendpoint_t> endpoints; //Endpoints, Clusters, and Attributes associated with this layout
};

//Slightly different to zigbeedevice structure for known zigbee device info loaded from database/file
//Manufacturer and model strings are stored as map entries
//Default to reporting enabled as it is more efficient
typedef struct knownzigbeedevice knownzigbeedevice_t;
struct knownzigbeedevice {
  std::string name=""; //User friendly name for the zigbee device
  uint16_t manu=0; //Manufacturer id of the device
	uint16_t minmanudisc=ZIGBEE_MIN_MANU_DISC; //Some devices have manufacturer specific attributes in low cluster ranges so this can be used to discovery them
  std::string zigbeelayout=""; //The name of the Zigbee Layout associated with this device
  int reporting=1; //0=This device doesn't support reporting only polling, 1=This device supports reporting, 2=This device supports reporting/binding but report intevals and attributes are fixed and can't be configured
};

//ZigBee standard attribute definitions
//Set standard reporting values by default
struct zigbeeattrdefs {
  std::string name=""; //Name of Attribute
  uint8_t datatype=0; //The Zigbee data type of the attribute (This is defined in the Zigbee standard and never changes
  int reporting=1; //0=Don't configure this attribute for reporting only poll, 1 (default)=This attribute should be configured for reporting
  uint16_t reportmininterval=1;
  uint16_t reportmaxinterval=60;
  uint16_t reporttimeout=90;
  zigbeeattrmultival reportchange;
	int dbfieldtype=0;
	int dbsensortype=0;
	std::string dbfieldname="";
	long dbinfieldinitialinterval=-1;
	long dbinfieldinterval=-1;
	long dbupdatefieldinterval=-1;
	long dboutfieldinterval=-1;
	int32_t dbrstype=4000;
	int32_t dbuom=1;
	int32_t dbbaseconvert=1;
};

typedef struct zigbeeclusterdefs zigbeeclusterdefs_t;
struct zigbeeclusterdefs {
  std::string name; //Name of Cluster

  //Manufacturer ID, Attribute ID, zigbeeattrdefs struct
  //NOTE: At the moment we'll assume when Manufacturer ID=0, that this is a normal attribute
  std::map<uint16_t, std::map<uint16_t, zigbeeattrdefs_t> > attrdefs;
};

#define LINEBUF_SIZE 1024

//Cluster ID, zigbeeclusterdefs struct
static std::map<uint16_t, zigbeeclusterdefs_t> gzigbeeclusterdefs;

static std::map<std::string, uint16_t> gzigbeemanucodes;
static std::map<uint16_t, std::string> gzigbeemanucodesstr; //Reverse of gzigbeemanucodes
static std::map<std::string, uint8_t> gzclattrtypes;
static std::map<uint8_t, std::string> gzclattrtypesstr; //Reverse of gzclattrtypes
static std::map<std::string, zigbeedevicelayout_t> gzigbeedevicelayouts;

//Manufacturer String, Model String, info
static std::map<std::string, std::map<std::string, knownzigbeedevice_t> > gknownzigbeedevices;

static pthread_mutex_t zigbeelibmutex = PTHREAD_MUTEX_INITIALIZER;

static sem_t zigbeelib_mainthreadsleepsem; //Used for main thread sleeping

static int zigbeelib_inuse=0; //Only shutdown when inuse = 0
static int zigbeelib_shuttingdown=0;

static char needtoquit=0; //Set to 1 when zigbeehalib should exit

static pthread_t zigbeelib_mainthread=0;

static int zigbeelib_numlocalzigbeedevices=0;
static localzigbeedevice_t *zigbeelib_localzigbeedevices; //A list of detected local zigbee devices: RapidHA or XBee for example handled by a parent library

static bool zigbeelib_zigbeedefsloaded=false;

#ifdef DEBUG
static locklib_ifaceptrs_ver_1_t *locklibifaceptr;
#endif

//Function Declarations
static void zigbee_send_multi_attribute_configure_reporting_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, const uint16_t *manu, std::list<zigbee_zcl_configure_reporting_attr_record_t> attrs, long *localzigbeelocked, long *zigbeelocked);
void zigbeelib_send_queue_match_zdo_response(int localzigbeeindex, char timeout, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);
void zigbeelib_send_queue_match_zcl_response(int localzigbeeindex, char timeout, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked);

void zigbee_send_discover_attributes_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, char usemanu, uint16_t firstattr, uint8_t maxattrs, long *localzigbeelocked, long *zigbeelocked);

STATIC zigbeeendpoint_t *zigbeelib_find_zigbee_endpointptr_match_profile(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, long *localzigbeelocked, long *zigbeelocked);
STATIC uint8_t zigbeelib_find_zigbee_endpoint_match_profile(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, long *localzigbeelocked, long *zigbeelocked);
STATIC zigbeeendpoint_t *_zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked);
STATIC zigbeeendpoint_t *zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked);
STATIC uint8_t _zigbeelib_find_zigbee_endpoint_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked);
STATIC uint8_t zigbeelib_find_zigbee_endpoint_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked);

static void zigbeelib_match_zigbeedevice_basicinfo(int localzigbeeindex, int zigbeeidx, long *localzigbeelocked, long *zigbeelocked);

STATIC void zigbeelib_setneedtoquit(int val, long *zigbeelocked);
STATIC int zigbeelib_getneedtoquit(long *zigbeelocked);

//JNI Exports
#ifdef __ANDROID__
extern "C" {
JNIEXPORT jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_ZigbeeLib_jnigetmodulesinfo( JNIEnv* UNUSED(env), jobject UNUSED(obj));
}
#endif

//Module Interface Definitions

#define DEBUGLIB_DEPIDX 0
#define DBCOUNTERLIB_DEPIDX 1
#define COMMONSERVERLIB_DEPIDX 2
#define CMDSERVERLIB_DEPIDX 3
#define DBLIB_DEPIDX 4
#define WEBAPICLIENTLIB_DEPIDX 5
#define CONFIGLIB_DEPIDX 6
#define LOCKLIB_DEPIDX 7

static zigbeelib_ifaceptrs_ver_1_t zigbeelib_ifaceptrs_ver_1={
  zigbeelib_process_zdo_send_status,
  zigbeelib_process_zcl_send_status,
  zigbeelib_process_zdo_seqnumber,
  zigbeelib_process_zcl_seqnumber,
  zigbeelib_process_zdo_response_received,
  process_zdo_response_timeout,
  zigbeelib_decode_zigbee_home_automation_attribute,
  zigbeelib_process_zcl_response_received,
  process_zcl_response_timeout,
  zigbeelib_find_zigbee_device,
  zigbeelib_add_zigbee_device,
  zigbeelib_remove_zigbee_device,
  zigbeelib_remove_all_zigbee_devices,
  zigbeelib_get_zigbee_info,
  zigbeelib_get_zigbee_endpoints,
  zigbeelib_get_zigbee_next_endpoint_info,
  zigbeelib_register_home_automation_endpointid,
  zigbeelib_add_localzigbeedevice,
  zigbeelib_remove_localzigbeedevice
};

static moduleiface_ver_1_t zigbeelib_ifaces[]={
  {
    &zigbeelib_ifaceptrs_ver_1,
    ZIGBEELIBINTERFACE_VER_1
  },
  {
    nullptr, 0
  }
};

static moduledep_ver_1_t zigbeelib_deps[]={
  {
    "debuglib",
		nullptr,
    DEBUGLIBINTERFACE_VER_1,
    1
  },
  {
    "dbcounterlib",
		nullptr,
    DBCOUNTERLIBINTERFACE_VER_1,
    1
  },
  {
    "commonserverlib",
		nullptr,
    COMMONSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "cmdserverlib",
		nullptr,
    CMDSERVERLIBINTERFACE_VER_1,
    0
  },
  {
    "dblib",
		nullptr,
    DBLIBINTERFACE_VER_1,
    0
  },
	{
		"webapiclientlib",
		nullptr,
		WEBAPICLIENTLIBINTERFACE_VER_1,
		1
	},
  {
    "configlib",
		nullptr,
    CONFIGLIBINTERFACECPP_VER_1,
    1
  },
  {
    "locklib",
    nullptr,
    LOCKLIBINTERFACE_VER_1,
    1
  },
  {
    nullptr, nullptr, 0, 0
  },
};

moduleinfo_ver_1_t zigbeelib_moduleinfo_ver_1={
  MODULEINFO_VER_1,
  "zigbeelib",
  zigbeelib_init,
  zigbeelib_shutdown,
  zigbeelib_start,
  zigbeelib_stop,
  zigbeelib_register_listeners,
  zigbeelib_unregister_listeners,
  (moduleiface_ver_1_t (* const)[]) &zigbeelib_ifaces,
  (moduledep_ver_1_t (*)[]) &zigbeelib_deps
};




#ifndef __ANDROID__
//Display a stack back trace
//Modified from the backtrace man page example
STATIC void zigbeelib_backtrace(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int j, nptrs;
  void *buffer[100];
  char **strings;

  nptrs = backtrace(buffer, 100);
  debuglibifaceptr->debuglib_printf(1, "%s: backtrace() returned %d addresses\n", __func__, nptrs);

  //The call backtrace_symbols_fd(buffer, nptrs, STDOUT_FILENO)
  //would produce similar output to the following:

  strings = backtrace_symbols(buffer, nptrs);
  if (strings == NULL) {
    debuglibifaceptr->debuglib_printf(1, "%s: More backtrace info unavailable\n", __func__);
    return;
  }
  for (j = 0; j < nptrs; j++) {
    debuglibifaceptr->debuglib_printf(1, "%s: %s\n", __func__, strings[j]);
  }
  free(strings);
}
#else
//backtrace is only supported on glibc
STATIC INLINE void zigbeelib_backtrace(void) {
  //Do nothing on non-backtrace supported systems
}
#endif

static pthread_key_t lockkey;
static pthread_once_t lockkey_onceinit = PTHREAD_ONCE_INIT;
static bool havelockkey=false;

//Initialise a thread local store for the lock counter
static void zigbeelib_makelockkey() {
	int result;

  result=pthread_key_create(&lockkey, NULL);
	if (result!=0) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Failed to create lockkey: %d\n", __func__, pthread_self(), result);
	} else {
		havelockkey=true;
	}
}

#ifdef DEBUG
#define zigbeelib_lockzigbee(zigbeelocked) \
  _zigbeelib_lockzigbee(__FILE__, __func__, __LINE__);
#define zigbeelib_unlockzigbee(zigbeelocked) \
  _zigbeelib_unlockzigbee(__FILE__, __func__, __LINE__);

/*
  Apply the zigbee mutex lock if not already applied otherwise increment the lock count
*/
static void _zigbeelib_lockzigbee(const char *filename, const char *funcname, int lineno) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, zigbeelib_makelockkey);
  if (!havelockkey) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    //Allocate storage for the lock counter and set to 0
    lockcnt=(long *) calloc(1, sizeof(long));
    (void) pthread_setspecific(lockkey, lockcnt);
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    ZIGBEELIB_PTHREAD_LOCK(&zigbeelibmutex, filename, funcname, lineno);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef ZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}

/*
  Decrement the lock count and if 0, release the zigbee mutex lock
*/
static void _zigbeelib_unlockzigbee(const char *filename, const char *funcname, int lineno) {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, zigbeelib_makelockkey);
  if (!havelockkey) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
    return;
  }
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    zigbeelib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    ZIGBEELIB_PTHREAD_UNLOCK(&zigbeelibmutex, filename, funcname, lineno);
  }
#ifdef ZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=nullptr;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}
#else
/*
  Apply the zigbee mutex lock if not already applied otherwise increment the lock count
*/
static void zigbeelib_lockzigbee() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, zigbeelib_makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
		debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
		return;
	}
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
    //Allocate storage for the lock counter and set to 0
    lockcnt=(long *) calloc(1, sizeof(long));
    (void) pthread_setspecific(lockkey, lockcnt);
  }
  if ((*lockcnt)==0) {
    //Lock the thread if not already locked
    ZIGBEELIB_PTHREAD_LOCK(&zigbeelibmutex);
  }
  //Increment the lock count
  ++(*lockcnt);

#ifdef ZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif
}
static void zigbeelib_lockzigbee(long *zigbeelocked) {
	zigbeelib_lockzigbee();
}

/*
  Decrement the lock count and if 0, release the zigbee mutex lock
*/
static void zigbeelib_unlockzigbee() {
  LOCKDEBUG_ADDDEBUGLIBIFACEPTR();
  long *lockcnt;

  LOCKDEBUG_ENTERINGFUNC();

  (void) pthread_once(&lockkey_onceinit, zigbeelib_makelockkey);
	if (!havelockkey) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
		debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lockkey not created\n", __func__, pthread_self(), __LINE__);
		return;
	}
  //Get the lock counter from thread local store
  lockcnt = (long *) pthread_getspecific(lockkey);
  if (lockcnt==nullptr) {
		debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu LOCKING MISMATCH TRIED TO UNLOCK WHEN LOCK COUNT IS 0 AND ALREADY UNLOCKED\n", __func__, pthread_self());
    zigbeelib_backtrace();
    return;
  }
  --(*lockcnt);
  if ((*lockcnt)==0) {
    //Unlock the thread if not already unlocked
    ZIGBEELIB_PTHREAD_UNLOCK(&zigbeelibmutex);
  }
#ifdef ZIGBEELIB_LOCKDEBUG
  debuglibifaceptr->debuglib_printf(1, "Exiting %s: thread id: %lu line: %d Lock count=%ld\n", __func__, pthread_self(), __LINE__, *lockcnt);
#endif

  if ((*lockcnt)==0) {
    //Deallocate storage for the lock counter so don't have to free it at thread exit
    free(lockcnt);
    lockcnt=nullptr;
    (void) pthread_setspecific(lockkey, lockcnt);
  }
}
static void zigbeelib_unlockzigbee(long *zigbeelocked) {
	zigbeelib_unlockzigbee();
}
#endif

//Thread unsafe get the number of local zigbee devices
static int _zigbeelib_getnumlocalzigbeedevices() {
	return zigbeelib_numlocalzigbeedevices;
}

//Thread safe get the number of local zigbee devices
static int zigbeelib_getnumlocalzigbeedevices() {
  int val;

  zigbeelib_lockzigbee();
	val=_zigbeelib_getnumlocalzigbeedevices();
  zigbeelib_unlockzigbee();

  return val;
}
static int zigbeelib_getnumlocalzigbeedevices(long *zigbeelocked) {
	return zigbeelib_getnumlocalzigbeedevices();
}

//Thread Unsafe Check that the local zigbee index value is within the proper limits
//Returns true if okay or false if not okay
static bool _zigbeelib_validate_localzigbeeindex(int localzigbeeindex) {
  if (localzigbeeindex<0 || localzigbeeindex>=_zigbeelib_getnumlocalzigbeedevices()) {
    return false;
  }
  return true;
}

//Thread Safe Check that the local zigbee index value is within the proper limits
//Returns 1 if okay or 0 if not okay
static int zigbeelib_validate_localzigbeeindex(int localzigbeeindex, long *zigbeelocked) {
  if (localzigbeeindex<0 || localzigbeeindex>=zigbeelib_getnumlocalzigbeedevices(zigbeelocked)) {
    return 0;
  }
  return 1;
}

/*
  Thread safe mark a local zigbee device as in use
  Returns 0 on success or negative value on error
*/
static int zigbeelib_marklocalzigbee_inuse(localzigbeedevice_t *localzigbeedevice) {
#ifdef ZIGBEELIB_MOREDEBUG
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif

  zigbeelib_lockzigbee();
  if (localzigbeedevice->removed || localzigbeedevice->needtoremove) {
    //This device shouldn't be used as it is either removed or is scheduled for removab
    zigbeelib_unlockzigbee();

    return -1;
  }
  //Increment local zigbee inuse value
  ++(localzigbeedevice->inuse);
#ifdef ZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Local Zigbee: %016llX now inuse: %d\n", __func__, pthread_self(), localzigbeedevice->addr, localzigbeedevice->inuse);
#endif

  zigbeelib_unlockzigbee();

  return 0;
}
static int zigbeelib_marklocalzigbee_inuse(localzigbeedevice_t *localzigbeedevice, long *localzigbeelocked, long *zigbeelocked) {
	return zigbeelib_marklocalzigbee_inuse(localzigbeedevice);
}

/*
  Thread safe mark a local zigbee device as not in use
  Returns 0 on success or negative value on error
*/
static int zigbeelib_marklocalzigbee_notinuse(localzigbeedevice_t *localzigbeedevice) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  zigbeelib_lockzigbee();
  if (localzigbeedevice->removed) {
    //This device shouldn't be used as it is removed
    zigbeelib_unlockzigbee();

    return -1;
  }
  if (!localzigbeedevice->inuse) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu INUSE MISMATCH TRIED TO MARK AS NOT IN USE WHEN INUSE COUNT IS 0\n", __func__, pthread_self());
    zigbeelib_backtrace();
    zigbeelib_unlockzigbee();
    return -2;
  }
  //Decrement local zigbee inuse value
  --(localzigbeedevice->inuse);

#ifdef ZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Local Zigbee: %016llX now inuse: %d\n", __func__, pthread_self(), localzigbeedevice->addr, localzigbeedevice->inuse);
#endif
  zigbeelib_unlockzigbee();

  return 0;
}
static int zigbeelib_marklocalzigbee_notinuse(localzigbeedevice_t *localzigbeedevice, long *localzigbeelocked, long *zigbeelocked) {
	return zigbeelib_marklocalzigbee_notinuse(localzigbeedevice);
}

/*
  Thread safe mark a zigbee device as in use
  Returns 0 on success or negative value on error
*/
static int zigbeelib_markzigbee_inuse(zigbeedevice_t *zigbeedevice) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  int result;
  localzigbeedevice_t *localzigbeedevice;

  zigbeelib_lockzigbee();
  if (zigbeedevice->removed || zigbeedevice->needtoremove) {
    //This device shouldn't be used as it is either removed or is scheduled for removab
    zigbeelib_unlockzigbee();

    return -1;
  }
  //Map the parent local zigbee device to mark it in use before marking the zigbee device in use
  localzigbeedevice=zigbeedevice->parentlocaldevice;

  result=zigbeelib_marklocalzigbee_inuse(localzigbeedevice);
  if (result) {
    //Unable to mark zigbee device as in use as we failed to mark the parent local zigbee device in use
    zigbeelib_unlockzigbee();

    return result;
  }
  //Increment zigbee inuse value
  ++(zigbeedevice->inuse);

#ifdef ZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Zigbee: %016llX now inuse: %d\n", __func__, pthread_self(), zigbeedevice->addr, zigbeedevice->inuse);
#endif
  zigbeelib_unlockzigbee();

  return 0;
}
static int zigbeelib_markzigbee_inuse(zigbeedevice_t *zigbeedevice, long *localzigbeelocked, long *zigbeelocked) {
	return zigbeelib_markzigbee_inuse(zigbeedevice);
}

/*
  Thread safe mark a zigbee device as not in use
  Returns 0 on success or negative value on error
*/
static int zigbeelib_markzigbee_notinuse(zigbeedevice_t *zigbeedevice) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedevice;

  zigbeelib_lockzigbee();
  if (zigbeedevice->removed) {
    //This device shouldn't be used as it is removed
    zigbeelib_unlockzigbee();

    return -1;
  }
  if (!zigbeedevice->inuse) {
    debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu INUSE MISMATCH TRIED TO MARK AS NOT IN USE WHEN INUSE COUNT IS 0\n", __func__, pthread_self());
    zigbeelib_backtrace();
    zigbeelib_unlockzigbee();
    return -2;
  }
  //Decrement zigbee inuse value
  --(zigbeedevice->inuse);

  //Map the parent local zigbee device to mark it as not in use after marking the zigbee device in use
  localzigbeedevice=zigbeedevice->parentlocaldevice;

  //Ignore the result of local zigbee mark notinuse result for now
  zigbeelib_marklocalzigbee_notinuse(localzigbeedevice);
  
#ifdef ZIGBEELIB_MOREDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: thread id: %lu Local Zigbee: %016llX now inuse: %d\n", __func__, pthread_self(), zigbeedevice->addr, zigbeedevice->inuse);
#endif
  zigbeelib_unlockzigbee();

  return 0;
}
static int zigbeelib_markzigbee_notinuse(zigbeedevice_t *zigbeedevice, long *localzigbeelocked, long *zigbeelocked) {
	return zigbeelib_markzigbee_notinuse(zigbeedevice);
}

//Return a string for a given code
const char *zigbeelib_get_code_string(const value_string value_string_struct[], uint16_t value) {
  //debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

  i=0;
  while (value_string_struct[i].strptr) {
    //debuglibifaceptr->debuglib_printf(1, "%s: Check %u against %u with %s\n", __func__, value, value_string_struct[i].value, value_string_struct[i].strptr);
    if (value_string_struct[i].value==value) {
      return value_string_struct[i].strptr;
    }
    ++i;
  }
  return "Unknown";
}

//Return a string for the Zigbee Cluster ID
//Args: clusterid The cluster id
static std::string zigbeelib_get_zigbee_clusterid_string(uint16_t clusterid) {
	try {
	  return gzigbeeclusterdefs.at(clusterid).name;
	} catch (std::out_of_range& e) {
	}
	return "Unknown Cluster";
}

//Return a string for the Zigbee Manufacturer
//Args: manu The manufacturer id
static std::string zigbeelib_get_zigbee_manufacturer_string(uint16_t manu) {
	if (manu==0) {
		return "General";
	} else {
		try {
		  return gzigbeemanucodesstr.at(manu);
		} catch (std::out_of_range& e) {
		}
	}
	return "Unknown";
}

//Return a string for the Zigbee Attribute ID
//Args: clusterid The cluster id that the attribute is in
//      manu The manufacturer id that the attribute is in or 0x0000 for general attribute
//      attr The attribute id
static std::string zigbeelib_get_zigbee_attrid_string(uint16_t clusterid, uint16_t manu, uint16_t attr) {
	try {
	  return gzigbeeclusterdefs.at(clusterid).attrdefs.at(manu).at(attr).name;
	} catch (std::out_of_range& e) {
	}
	return "Unknown Attribute";
}

//Return a string for the Zigbee Attribute Data Type
//Args: attrdatetype The attribute data type
static std::string zigbeelib_get_zigbee_attrdatatype_string(uint8_t attrdatatype) {
	try {
	  return gzclattrtypesstr.at(attrdatatype);
	} catch (std::out_of_range& e) {
	}
	return "Unknown Data Type";
}

//Return a string for the Zigbee Device ID
//Args: devid The device id
const char *zigbeelib_get_zigbee_deviceid_string(uint16_t profile, uint16_t devid) {
  if (profile==ZIGBEE_HOME_AUTOMATION_PROFILE) {
    return zigbeelib_get_code_string(zigbee_deviceid_names, devid);
  } else {
  }
  return "Unknown";
}

//Return a string for the Zigbee ZCL Status
//Args: status The ZCL Status
const char *zigbeelib_get_zigbee_zclstatus_string(uint8_t status) {
  return zigbeelib_get_code_string(zigbee_zclstatus_names, status);
}

//Return a string for the Zigbee ZCL Commands
//Args: status The ZCL Command
const char *zigbeelib_get_zigbee_zclcmd_string(uint8_t zclcmd) {
  return zigbeelib_get_code_string(zigbee_zclcmd_names, zclcmd);
}

//Return true if an attribute data type is analog or false if discrete
static bool zigbeelib_is_attribute_datatype_analog(uint8_t datatype) {
  if ( ((datatype & 0xf0)==0x20 || (datatype & 0xf8)==0x38) || (datatype & 0xf8) == 0xe0) {
    return true;
  }
  return false;
}

//Return true if an attribute data type is an unsigned integer
//Returns true if the data type is an unsigned integer
static int zigbeelib_is_attribute_datatype_unsigned_int(uint8_t datatype) {
  switch (datatype) {
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
      return true;
  }
  return false;
}

//Return true if an attribute data type is a signed integer
//Returns true if the data type is an signed integer
static int zigbeelib_is_attribute_datatype_signed_int(uint8_t datatype) {
  switch (datatype) {
    case ZIGBEE_ZCL_TYPE_S8:
    case ZIGBEE_ZCL_TYPE_S16:
    case ZIGBEE_ZCL_TYPE_S24:
    case ZIGBEE_ZCL_TYPE_S32:
    case ZIGBEE_ZCL_TYPE_S40:
    case ZIGBEE_ZCL_TYPE_S48:
    case ZIGBEE_ZCL_TYPE_S56:
    case ZIGBEE_ZCL_TYPE_S64:
      return true;
  }
  return false;
}

//Return true if an attribute data type is a string
static int zigbeelib_is_attribute_datatype_string(uint8_t datatype) {
  switch (datatype) {
    case ZIGBEE_ZCL_TYPE_CHAR_STRING:
      return true;
  }
  return false;
}

//Copy an attribute value from one attribute data structure to another
//Returns the number of bytes copied or -1 if not copied/supported
//NOTE: Using overloaded functions to make it more flexible
static int zigbeelib_copy_attribute_data_value(zigbee_attrval_t *attrdest, const zigbee_attrval_t& attrsrc, uint8_t datatype) {
  int attrsize=-1;

  //Copy non-variable length values
  switch (datatype) {
    case ZIGBEE_ZCL_TYPE_NULL:
      attrsize=0;
      break;
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
      attrdest->uval8bit=attrsrc.uval8bit;
      attrsize=1;
      break;
    case ZIGBEE_ZCL_TYPE_S8:
      attrdest->sval8bit=attrsrc.sval8bit;
      attrsize=1;
      break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
      attrdest->uval16bit=attrsrc.uval16bit;
      attrsize=2;
      break;
    case ZIGBEE_ZCL_TYPE_S16:
      attrdest->sval16bit=attrsrc.sval16bit;
      attrsize=2;
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
      attrdest->uval24bit.val=attrsrc.uval24bit.val;
      attrsize=3;
      break;
    case ZIGBEE_ZCL_TYPE_S24:
      attrdest->sval24bit.val=attrsrc.sval24bit.val;
      attrsize=3;
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
      attrdest->uval32bit=attrsrc.uval32bit;
      attrsize=4;
      break;
    case ZIGBEE_ZCL_TYPE_S32:
      attrdest->sval32bit=attrsrc.sval32bit;
      attrsize=4;
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
      attrdest->uval40bit.val=attrsrc.uval40bit.val;
      attrsize=5;
      break;
    case ZIGBEE_ZCL_TYPE_S40:
      attrdest->sval40bit.val=attrsrc.sval40bit.val;
      attrsize=5;
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
      attrdest->uval48bit.val=attrsrc.uval48bit.val;
      attrsize=6;
      break;
    case ZIGBEE_ZCL_TYPE_S48:
      attrdest->sval48bit.val=attrsrc.sval48bit.val;
      attrsize=6;
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
      attrdest->uval56bit.val=attrsrc.uval56bit.val;
      attrsize=7;
      break;
    case ZIGBEE_ZCL_TYPE_S56:
      attrdest->sval56bit.val=attrsrc.sval56bit.val;
      attrsize=7;
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
      attrdest->uval64bit=attrsrc.uval64bit;
      attrsize=8;
      break;
    case ZIGBEE_ZCL_TYPE_S64:
      attrdest->sval64bit=attrsrc.sval64bit;
      attrsize=8;
      break;
    case ZIGBEE_ZCL_TYPE_CHAR_STRING:
    {
      int stringlen=attrsrc.bytes[0];

      if (stringlen==255) {
        //The string is invalid so just copy the length byte
        attrdest->bytes[0]=attrsrc.bytes[0];
        attrsize=1;
      } else {
        memcpy(attrdest->bytes, attrsrc.bytes, stringlen+1);
        attrsize=stringlen+1;
      }
      break;
    }
  }
  return attrsize;
}

//Class/Struct funcions

zigbeeattr::zigbeeattr() {
	//Do nothing at the moment
}
zigbeeattr::~zigbeeattr() {
  dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=(dbcounterlib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBCOUNTERLIB_DEPIDX].ifaceptr;

	if (this->dbincounter!=-1) {
		dbcounterlibifaceptr->scheduledeletecounter(this->dbincounter);
		this->dbincounter=-1;
	}
	if (this->dbupdatecounter!=-1) {
		dbcounterlibifaceptr->scheduledeletecounter(this->dbupdatecounter);
		this->dbupdatecounter=-1;
	}
	if (this->dboutcounter!=-1) {
		dbcounterlibifaceptr->scheduledeletecounter(this->dboutcounter);
		this->dboutcounter=-1;
	}
}

zigbeeattr& zigbeeattr::operator=(const zigbeeattrdefs& attrdef) {
	this->name=attrdef.name;
	this->val.setdatatype(attrdef.datatype);
	this->dbval.setdatatype(attrdef.dbfieldtype);
	this->datatype=attrdef.datatype;
	this->reporting=attrdef.reporting;
	this->reportmininterval=attrdef.reportmininterval;
	this->reportmaxinterval=attrdef.reportmaxinterval;
	this->reporttimeout=attrdef.reporttimeout;
	this->reportchange=attrdef.reportchange;
	this->dbfieldtype=attrdef.dbfieldtype;
	this->dbsensortype=attrdef.dbsensortype;
	this->dbfieldname=attrdef.dbfieldname;
	this->dbinfieldinitialinterval=attrdef.dbinfieldinitialinterval;
	this->dbinfieldinterval=attrdef.dbinfieldinterval;
	this->dbupdatefieldinterval=attrdef.dbupdatefieldinterval;
	this->dboutfieldinterval=attrdef.dboutfieldinterval;

	this->dbrstype=attrdef.dbrstype;
	this->dbuom=attrdef.dbuom;
	this->dbbaseconvert=attrdef.dbbaseconvert;

	return *this;
}

//Get the number of bytes used by the current attribute value
//Returns -1 if currently an unsupported data type
int zigbeeattrmultival::getSize() const {
  int attrsize=-1;

  //Copy non-variable length values
  switch (this->datatype) {
    case ZIGBEE_ZCL_TYPE_NULL:
      attrsize=0;
      break;
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
    case ZIGBEE_ZCL_TYPE_S8:
      attrsize=1;
      break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
    case ZIGBEE_ZCL_TYPE_S16:
    case ZIGBEE_ZCL_TYPE_FLOAT_SEMI:
      attrsize=2;
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
    case ZIGBEE_ZCL_TYPE_S24:
      attrsize=3;
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
    case ZIGBEE_ZCL_TYPE_S32:
    case ZIGBEE_ZCL_TYPE_FLOAT_SINGLE:
      attrsize=4;
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
    case ZIGBEE_ZCL_TYPE_S40:
      attrsize=5;
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
    case ZIGBEE_ZCL_TYPE_S48:
      attrsize=6;
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
    case ZIGBEE_ZCL_TYPE_S56:
      attrsize=7;
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
    case ZIGBEE_ZCL_TYPE_S64:
    case ZIGBEE_ZCL_TYPE_FLOAT_DOUBLE:
      attrsize=8;
      break;
    case ZIGBEE_ZCL_TYPE_CHAR_STRING:
    {
      int stringlen=this->val.bytes[0];

      if (stringlen==255) {
        //The string is invalid
        attrsize=1;
      } else {
        attrsize=stringlen+1;
      }
      break;
    }
  }
  return attrsize;
}

//Return a string representation of the attribute value
std::string zigbeeattrmultival::toString() const {
  std::string attrstr="<Unsupported Attribute Datatype>";
  char attrcharstr[1024];

  //Copy non-variable length values
  switch (this->datatype) {
    case ZIGBEE_ZCL_TYPE_NULL:
      strcpy(attrcharstr, "NULL");
      break;
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
      sprintf(attrcharstr, "%" PRIu8, this->val.uval8bit);
      break;
    case ZIGBEE_ZCL_TYPE_S8:
      sprintf(attrcharstr, "%" PRId8, this->val.sval8bit);
      break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
      sprintf(attrcharstr, "%" PRIu16, this->val.uval16bit);
      break;
    case ZIGBEE_ZCL_TYPE_S16:
      sprintf(attrcharstr, "%" PRId16, this->val.sval16bit);
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
      sprintf(attrcharstr, "%" PRIu32, (uint32_t) this->val.uval24bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_S24:
      sprintf(attrcharstr, "%" PRId32, (int32_t) this->val.sval24bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
      sprintf(attrcharstr, "%" PRIu32, this->val.uval32bit);
      break;
    case ZIGBEE_ZCL_TYPE_S32:
      sprintf(attrcharstr, "%" PRId32, this->val.sval32bit);
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
      sprintf(attrcharstr, "%" PRIu64, (uint64_t) this->val.uval40bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_S40:
      sprintf(attrcharstr, "%" PRId64, (int64_t) this->val.sval40bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
      sprintf(attrcharstr, "%" PRIu64, (uint64_t) this->val.uval48bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_S48:
      sprintf(attrcharstr, "%" PRId64, (int64_t) this->val.sval48bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
      sprintf(attrcharstr, "%" PRIu64, (uint64_t) this->val.uval56bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_S56:
      sprintf(attrcharstr, "%" PRId64, (int64_t) this->val.sval56bit.val);
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
      sprintf(attrcharstr, "%" PRIu64, this->val.uval64bit);
      break;
    case ZIGBEE_ZCL_TYPE_S64:
      sprintf(attrcharstr, "%" PRId64, this->val.sval64bit);
      break;
    case ZIGBEE_ZCL_TYPE_CHAR_STRING:
    {
      int stringlen=this->val.bytes[0];
      if (stringlen==255) {
        //The string is invalid
        strcpy(attrcharstr, "<Invalid String>");
      } else {
        memcpy(attrcharstr, (char *) (&this->val.bytes[1]), stringlen);
        attrcharstr[stringlen]=0;
      }
      break;
    }
		default:
			return attrstr;
  }
  return attrstr=attrcharstr;
}

//Copy a 64-bit unsigned integer to an attribute data value
zigbeeattrmultival& zigbeeattrmultival::operator=(uint64_t val) {
  switch (this->datatype) {
		//Unsigned Integer Attribute
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
      this->val.uval8bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
      this->val.uval16bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
      this->val.uval24bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
      this->val.uval32bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
      this->val.uval40bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
      this->val.uval48bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
      this->val.uval56bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
      this->val.uval64bit=val;
      break;
		//Signed Integer Attribute
    case ZIGBEE_ZCL_TYPE_S8:
      this->val.sval8bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S16:
      this->val.sval16bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S24:
      this->val.sval24bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S32:
      this->val.sval32bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S40:
      this->val.sval40bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S48:
      this->val.sval48bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S56:
      this->val.sval56bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S64:
      this->val.sval64bit=val;
      break;
  }
  return *this;
}

//Copy a 64-bit signed integer to an attribute data value
zigbeeattrmultival& zigbeeattrmultival::operator=(int64_t val) {
  switch (this->datatype) {
		//Unsigned Integer Attribute
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
      this->val.uval8bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
      this->val.uval16bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
      this->val.uval24bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
      this->val.uval32bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
      this->val.uval40bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
      this->val.uval48bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
      this->val.uval56bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
      this->val.uval64bit=val;
      break;
		//Signed Integer Attribute
    case ZIGBEE_ZCL_TYPE_S8:
      this->val.sval8bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S16:
      this->val.sval16bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S24:
      this->val.sval24bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S32:
      this->val.sval32bit=val;
      break;
    case ZIGBEE_ZCL_TYPE_S40:
      this->val.sval40bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S48:
      this->val.sval48bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S56:
      this->val.sval56bit.val=val;
      break;
    case ZIGBEE_ZCL_TYPE_S64:
      this->val.sval64bit=val;
      break;
  }
  return *this;
}

zigbeeattrmultival& zigbeeattrmultival::operator=(const std::string& val) {
  uint64_t uval=0;
  int64_t sval=0;
  if (zigbeelib_is_attribute_datatype_unsigned_int(this->datatype)) {
    sscanf(val.c_str(), "%" SCNu64, &uval);
		*this=uval;
	} else if (zigbeelib_is_attribute_datatype_signed_int(this->datatype)) {
    sscanf(val.c_str(), "%" SCNd64, &sval);
		*this=val;
	} else {
		switch (this->datatype) {
			case ZIGBEE_ZCL_TYPE_CHAR_STRING:
			{
				size_t len=val.length();

				if (len>254) {
					//Max length allowed for this string type is 254 characters
					this->val.bytes[0]=254;
					val.copy((char *) this->val.bytes+1, 254);
				} else {
					this->val.bytes[0]=len;
					val.copy((char *) this->val.bytes+1, len);
				}
			}
    }
	}
	return *this;
}

//Copy a database multival to an attribute data value
zigbeeattrmultival& zigbeeattrmultival::operator=(const zigbeedbmultival& val) {
	multitypeval_t dbval=val.getval();

	switch (val.getdatatype()) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
			*this=(int64_t) dbval.sval32bit;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
			//TODO: Cast to double when support is added
			*this=(int64_t) dbval.doubleval;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
			*this=(int64_t) dbval.sval64bit;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
			*this=(uint64_t) dbval.uval8bit;
			break;
	}
	return *this;
}

bool zigbeeattrmultival::operator==(const zigbeeattrmultival& val) const {
	if (this->datatype!=val.datatype) {
		//Different attribute type comparisons not allowed at the moment
    return false;
	}
  switch (this->datatype) {
    case ZIGBEE_ZCL_TYPE_NULL:
      return true;
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
			if (this->val.uval8bit==val.val.uval8bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S8:
			if (this->val.sval8bit==val.val.sval8bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
			if (this->val.uval16bit==val.val.uval16bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S16:
			if (this->val.sval16bit==val.val.sval16bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
			if (this->val.uval24bit.val==val.val.uval24bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S24:
			if (this->val.sval24bit.val==val.val.sval24bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
			if (this->val.uval32bit==val.val.uval32bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S32:
			if (this->val.sval32bit==val.val.sval32bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
			if (this->val.uval40bit.val==val.val.uval40bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S40:
			if (this->val.sval40bit.val==val.val.sval40bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
			if (this->val.uval48bit.val==val.val.uval48bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S48:
			if (this->val.sval48bit.val==val.val.sval48bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
			if (this->val.uval56bit.val==val.val.uval56bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S56:
			if (this->val.sval56bit.val==val.val.sval56bit.val) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
			if (this->val.uval64bit==val.val.uval64bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_S64:
			if (this->val.sval64bit==val.val.sval64bit) {
				return true;
			}
			break;
    case ZIGBEE_ZCL_TYPE_CHAR_STRING:
    {
			if (this->val.bytes[0]!=val.val.bytes[0]) {
				return false;
			}
      int stringlen=val.val.bytes[0];

      if (stringlen==255) {
        //The string is invalid
				if (this->val.bytes[0]==255) {
					return true;
				}
			} else if (memcmp(this->val.bytes, val.val.bytes, stringlen+1)==0) {
				return true;
			}
      return false;;
    }
  }
  return false;
}

bool zigbeeattrmultival::operator==(const zigbeedbmultival& val) const {
	zigbeeattrmultival srcattrval;

	//Copy the type from the destination attribute
	srcattrval=*this;

	//Then convert the database value to an attribute
	srcattrval=val;

	//Now compare with the attribute value
	return (*this==srcattrval);
}

bool zigbeeattrmultival::operator!=(const zigbeeattrmultival& val) const {
	return !(*this==val);
}

bool zigbeeattrmultival::operator!=(const zigbeedbmultival& val) const {
	return !(*this==val);
}


//Get the number of bytes used by the current database value
//Returns -1 if currently an unsupported data type
int zigbeedbmultival::getSize() const {
	switch (this->datatype) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
			return sizeof(int32_t);
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
			return sizeof(double);
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
			return sizeof(int64_t);
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
			return sizeof(uint8_t);
	}
	return -1;
}

//Return a string representation of the database value
std::string zigbeedbmultival::toString() const {
  std::string dbstr="<Unsupported Database Field Type>";
  char dbcharstr[1024];

  switch (this->datatype) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
      sprintf(dbcharstr, "%" PRId32, this->val.sval32bit);
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
      sprintf(dbcharstr, "%f", this->val.doubleval);
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
      sprintf(dbcharstr, "%" PRId64, this->val.sval64bit);
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
      sprintf(dbcharstr, "%" PRIu8, this->val.uval8bit);
			break;
		default:
			return dbstr;
	}
  return dbstr=dbcharstr;
}

zigbeedbmultival& zigbeedbmultival::operator=(uint64_t val) {
  switch (this->datatype) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
      this->val.sval32bit=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
      this->val.doubleval=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
      this->val.sval64bit=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
      this->val.uval8bit=val;
			break;
	}
	return *this;
}

zigbeedbmultival& zigbeedbmultival::operator=(int64_t val) {
  switch (this->datatype) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
      this->val.sval32bit=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
      this->val.doubleval=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
      this->val.sval64bit=val;
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
      this->val.uval8bit=val;
			break;
	}
	return *this;
}

zigbeedbmultival& zigbeedbmultival::operator=(const zigbeeattrmultival& val) {
	zigbee_attrval_t attrval=val.getval();

  switch (val.getdatatype()) {
		//Unsigned Integer Attribute
    case ZIGBEE_ZCL_TYPE_8BITMAP:
    case ZIGBEE_ZCL_TYPE_8BIT:
    case ZIGBEE_ZCL_TYPE_U8:
    case ZIGBEE_ZCL_TYPE_8ENUM:
    case ZIGBEE_ZCL_TYPE_BOOL:
			*this=(uint64_t) attrval.uval8bit;
			break;
    case ZIGBEE_ZCL_TYPE_16BITMAP:
    case ZIGBEE_ZCL_TYPE_16BIT:
    case ZIGBEE_ZCL_TYPE_U16:
    case ZIGBEE_ZCL_TYPE_16ENUM:
      *this=(uint64_t) attrval.uval16bit;
      break;
    case ZIGBEE_ZCL_TYPE_24BIT:
    case ZIGBEE_ZCL_TYPE_24BITMAP:
    case ZIGBEE_ZCL_TYPE_U24:
			*this=(uint64_t) attrval.uval24bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_32BIT:
    case ZIGBEE_ZCL_TYPE_32BITMAP:
    case ZIGBEE_ZCL_TYPE_U32:
			*this=(uint64_t) attrval.uval32bit;
      break;
    case ZIGBEE_ZCL_TYPE_40BIT:
    case ZIGBEE_ZCL_TYPE_40BITMAP:
    case ZIGBEE_ZCL_TYPE_U40:
			*this=(uint64_t) attrval.uval40bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_48BIT:
    case ZIGBEE_ZCL_TYPE_48BITMAP:
    case ZIGBEE_ZCL_TYPE_U48:
			*this=(uint64_t) attrval.uval48bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_56BIT:
    case ZIGBEE_ZCL_TYPE_56BITMAP:
    case ZIGBEE_ZCL_TYPE_U56:
			*this=(uint64_t) attrval.uval56bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_64BIT:
    case ZIGBEE_ZCL_TYPE_64BITMAP:
    case ZIGBEE_ZCL_TYPE_U64:
			*this=(uint64_t) attrval.uval64bit;
      break;
		//Signed Integer Attribute
    case ZIGBEE_ZCL_TYPE_S8:
			*this=(int64_t) attrval.sval8bit;
      break;
    case ZIGBEE_ZCL_TYPE_S16:
			*this=(int64_t) attrval.sval16bit;
      break;
    case ZIGBEE_ZCL_TYPE_S24:
			*this=(int64_t) attrval.sval24bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_S32:
			*this=(int64_t) attrval.sval32bit;
      break;
    case ZIGBEE_ZCL_TYPE_S40:
			*this=(int64_t) attrval.sval40bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_S48:
			*this=(int64_t) attrval.sval48bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_S56:
			*this=(int64_t) attrval.sval56bit.val;
      break;
    case ZIGBEE_ZCL_TYPE_S64:
			*this=(int64_t) attrval.sval64bit;
      break;
		case ZIGBEE_ZCL_TYPE_CHAR_STRING:
			//A string can't always be represented as a value
			*this=zigbeedbmultival();
  }
  return *this;
}

bool zigbeedbmultival::operator==(const zigbeedbmultival& val) const {
	if (this->datatype!=val.datatype) {
		//Different database field type comparisons not allowed at the moment
		return false;
	}
	switch (this->datatype) {
		case DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE:
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT:
			if (this->val.sval32bit==val.val.sval32bit) {
				return true;
			}
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT:
			if (this->val.doubleval==val.val.doubleval) {
				//TODO: Improve this test as comparing two doubles with == is unrealiable
				return true;
			}
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT:
			if (this->val.sval64bit==val.val.sval64bit) {
				return true;
			}
			break;
		case DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT:
			if (this->val.uval8bit==val.val.uval8bit) {
				return true;
			}
			break;
	}
  return false;
}

bool zigbeedbmultival::operator==(const zigbeeattrmultival& val) const {
	zigbeeattrmultival destattrval;

	//Copy the type from the source attribute
	destattrval=val;

	//Then convert the database value to an attribute
	//(Do it this way as there are more attribute types than database types
	destattrval=*this;

	//Now compare with the attribute value
	return (destattrval==val);
}

bool zigbeedbmultival::operator!=(const zigbeedbmultival& val) const {
	return !(*this==val);
}

bool zigbeedbmultival::operator!=(const zigbeeattrmultival& val) const {
	return !(*this==val);
}

//==================
//Protocol Functions
//==================

//NOTE: All uses of this function both lock the zigbee mutex and mark local zigbee in use so no need to do it again here
STATIC void __zigbeelib_send_queue_remove_packet(int localzigbeeindex, int packetidx, long *localzigbeelocked, long *zigbeelocked) {
#if defined(ZIGBEELIB_SENDDEBUG) || (ZIGBEELIB_MOREDEBUG)
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (localzigbeedeviceptr->sendqueue_items[packetidx].inuse) {
#ifdef ZIGBEELIB_SENDDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Removing packet from send queue, index=%d, packet type: %s, destnetaddr=%04hX, destcluster=%04hX, length=%d\n", __func__, packetidx, (localzigbeedeviceptr->sendqueue_items[packetidx].packettype==ZIGBEE_ZIGBEE_ZDO) ? "ZDO" : "ZCL", localzigbeedeviceptr->sendqueue_items[packetidx].send_netaddr, localzigbeedeviceptr->sendqueue_items[packetidx].send_cluster, localzigbeedeviceptr->sendqueue_items[packetidx].packetlen);
#endif
    localzigbeedeviceptr->sendqueue_items[packetidx].inuse=0;
    if (localzigbeedeviceptr->sendqueue_items[packetidx].packet) {
      free(localzigbeedeviceptr->sendqueue_items[packetidx].packet);
      localzigbeedeviceptr->sendqueue_items[packetidx].packet=nullptr;
    }
    ++localzigbeedeviceptr->remainingsendqueueitems;
  }
  MOREDEBUG_EXITINGFUNC();
}

//There have been too many retries while sending to a Zigbee device so remove it from memory
//NOTE: The caller should mark localzigbee inuse before calling this function
void __zigbeelib_send_queue_too_many_retries(int localzigbeeindex, int zigbeeidx, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  zigbeedevice_t *zigbeedeviceptr;
  uint64_t addr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[zigbeeidx];

  if (zigbeelib_markzigbee_inuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedeviceptr->addr;

  if (!zigbeedeviceptr->notconnected) {
    struct timespec curtime;

    debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016llX, %04hX has had too many timeouts and will be marked as not connected\n", __func__, addr, netaddr);
 
    //Mark the zigbee device as not connected
    zigbeedeviceptr->notconnected=1;

    clock_gettime(CLOCK_REALTIME, &curtime);

    zigbeedeviceptr->connectretrytime=curtime.tv_sec+ZIGBEE_NOTCONNECTED_RETRYWAITTIME;
  }
  zigbeelib_markzigbee_notinuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked);

  //Remove all packets queued to send to the destination as they are most likely all timing out
  {
    int i;

    for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
      if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].send_netaddr==netaddr) {
        __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
      }
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();

}

//Currently setup only for RapidHA rules due to limited time
//TODO: Support xbee as well
STATIC int __zigbeelib_send_queue_find_next_packet_to_send(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  int zigbeewaiting;
  int i, j, intransitwithoutsendstatuscnt, intransitwithoutresponsecnt;
  int sleepydestidx; //If the next packet to send is going to a sleepy device, we mark the index value and then search for packets to non-sleepy devices to send first
  int packetretryingidx; //If the next packet to send is going to be a packet that been retried before, see if any other packets are available to send first
  struct timespec curtime;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];

  //Check for packets to timeout
  clock_gettime(CLOCK_REALTIME, &curtime);
  for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
    if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].sent) {
      if (localzigbeedeviceptr->sendqueue_items[i].startsendtime+ZIGBEE_MAX_PACKET_WAITTIME<curtime.tv_sec) {
        //Treat the packet as a timeout as it hasn't received a response
        uint8_t *seqnumber=nullptr;

        if (localzigbeedeviceptr->sendqueue_items[i].haveseqnumber) {
          seqnumber=&localzigbeedeviceptr->sendqueue_items[i].seqnumber;
        }
        //debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %04hX at index=%d, clusterid=%04hX, seqnumber=%02hhX\n", __func__, localzigbeedeviceptr->sendqueue_items[i].send_netaddr, i, localzigbeedeviceptr->sendqueue_items[i].send_cluster, localzigbeedeviceptr->sendqueue_items[i].seqnumber);
        if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZDO) {
          zigbeelib_send_queue_match_zdo_response(localzigbeeindex, 1, localzigbeedeviceptr->sendqueue_items[i].send_netaddr, localzigbeedeviceptr->sendqueue_items[i].recv_cluster, seqnumber, localzigbeelocked, zigbeelocked);
        } else if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
          zigbeelib_send_queue_match_zcl_response(localzigbeeindex, 1, localzigbeedeviceptr->sendqueue_items[i].send_netaddr, localzigbeedeviceptr->sendqueue_items[i].recv_cluster, seqnumber, localzigbeelocked, zigbeelocked);
        }
      }
    }
  }
  //Find to the next packet that needs to be sent
  if (localzigbeedeviceptr->libraryiface->request_send_packet) {
    int result;

    //The parent library has some in transit buffer handling so reserve a buffer for sending
    result=localzigbeedeviceptr->libraryiface->request_send_packet(localzigbeedeviceptr->deviceptr, localzigbeelocked);
    if (result<0) {
      //Failed to reserve space to send a packet
      //TODO: Implement better handling for the type of failure
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return -4;
    }
  } else {
    //Basic in transit buffer handling
    intransitwithoutsendstatuscnt=0;
    for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
      //Testing whether we can have more than one packet in transit
      if (localzigbeedeviceptr->sendqueue_items[i].inuse) {
        if (localzigbeedeviceptr->sendqueue_items[i].sent) {
          if (localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus) {
            ++intransitwithoutsendstatuscnt;
          }
        }
      }
    }
    if (intransitwithoutsendstatuscnt>0) {
      //Need to wait for the send status before sending another packet
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return -2;
    }
    //Count for all zigbee devices
    intransitwithoutresponsecnt=0;

    for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
      if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].sent) {
        zigbeedevice_t *zigbeedeviceptr;

        //We are waiting for a response from this packet
        if (localzigbeedeviceptr->sendqueue_items[i].zigbeeidx>=0) {
          zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ];
//          TODO: Test this more to see if xbee has similar problems
//          if (zigbeedeviceptr->devicetype==ZIGBEE_DEVICE_TYPE_END_DEVICE) {
//            //Ignore the global buffer limit for end devices as the Zigbee parent should have a dedicated send buffer
              //NOTE: RapidHA seems to have a fixed global limit of 5 packets even with end devices
//            continue;
//          }
        }
        ++intransitwithoutresponsecnt;
      }
    }
    if (intransitwithoutresponsecnt>=1) {
      //Only allow a maximum of 1 packet in transit with basic in transit buffer handling
      //debuglibifaceptr->debuglib_printf(1, "%s: Can't send packet: index=%d\n", __func__, i);
      //debuglibifaceptr->debuglib_printf(1, "%s: In Transit count=%d\n", __func__, intransitwithoutresponsecnt);
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return -3;
    }
  }
  //The next check is to ensure that we only send one packet at a time to each Zigbee device
  sleepydestidx=-1;
	packetretryingidx=-1;
  i=(localzigbeedeviceptr->sendqueuelastitemsentidx + 1) % MAX_SEND_QUEUE_ITEMS;
  do {
    if (localzigbeedeviceptr->sendqueue_items[i].inuse && !localzigbeedeviceptr->sendqueue_items[i].sent) {
      //Check if we are waiting for a response from this Zigbee device from other packets in transit
      zigbeewaiting=0;

      for (j=0; j<MAX_SEND_QUEUE_ITEMS; j++) {
        if (i==j) {
          continue;
        }
        if (localzigbeedeviceptr->sendqueue_items[j].inuse && localzigbeedeviceptr->sendqueue_items[j].sent && localzigbeedeviceptr->sendqueue_items[i].send_netaddr==localzigbeedeviceptr->sendqueue_items[j].send_netaddr) {
          //If we are waiting for a response on a zigbee device, don't send another packet on that zigbee device
          //  as the in transit buffer is normally global on the local zigbee module
          //debuglibifaceptr->debuglib_printf(1, "%s: Index: %d and Index: %d are both sending to same device\n", __func__, i, j);
          zigbeewaiting=1;
        }
      }
      if (!zigbeewaiting) {
        int wasntconnected=0;
        zigbeedevice_t *zigbeedeviceptr;

        //Check if this Zigbee device is marked as not connected and if it should be connected yet
        if (localzigbeedeviceptr->sendqueue_items[i].zigbeeidx>=0) {
          zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ];
          if (zigbeedeviceptr->notconnected) {
            struct timespec curtime;

            clock_gettime(CLOCK_REALTIME, &curtime);
            if (curtime.tv_sec>zigbeedeviceptr->connectretrytime && zigbeedeviceptr->lastresponsetime+MAX_TIME_ZIGBEE_NO_PACKETS<curtime.tv_sec) {
              zigbeedeviceptr->notconnected=0;

							//Reconfigure reporting and assume pending attribute requests in case the device has lost them
							for (auto &endpointit : zigbeedeviceptr->endpoints) {
								for (auto &clusterit : endpointit.second.iclusters) {
									clusterit.second.isbound=0;
									for (auto &manuit : clusterit.second.attrs) {
										for (auto &attrit : manuit.second) {
											attrit.second.requestpending=false;
											attrit.second.reportingconfigured=0;
											attrit.second.fastreportingconfigured=false;
										}
									}
								}
							}
              //Mark this Zigbee device as connected to try and send packets again
              debuglibifaceptr->debuglib_printf(1, "%s: Marking Zigbee device: %016llX, %04hX as connected to retry queued packets\n", __func__, zigbeedeviceptr->addr, zigbeedeviceptr->netaddr);
            }
            wasntconnected=1;
          }
        }
        if (!wasntconnected) {
          int rxonidle=1; //Assume device isn't sleepy by default for sending

          //Check if destination device is sleepy
          if (localzigbeedeviceptr->sendqueue_items[i].zigbeeidx>=0) {
            zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ];
            if (zigbeedeviceptr->rxonidle==0) {
              rxonidle=0; //Device is sleepy
            }
          }
          if (packetretryingidx==-1) {
						//Check if this packet is being retried and only send if no other packets to send
						if (localzigbeedeviceptr->sendqueue_items[i].retrycnt>0) {
							packetretryingidx=i;
						}
					}
          //Send this packet next but first check if sleepy
          if (rxonidle==1 && !localzigbeedeviceptr->sendqueue_items[i].retrycnt>0) {
            //This packet is sending to a non-sleepy device so okay to send
            //debuglibifaceptr->debuglib_printf(1, "%s: Suggesting to send Index: %d\n", __func__, i);
            zigbeelib_unlockzigbee(zigbeelocked);
            MOREDEBUG_EXITINGFUNC();
            return i;
          }
          if (sleepydestidx==-1 && rxonidle==0 && !localzigbeedeviceptr->sendqueue_items[i].retrycnt>0) {
            //Only mark the first packet for sending to a sleepy device
            //debuglibifaceptr->debuglib_printf(1, "%s: DELAYING SEND OF PACKET TO SLEEPY: %d: %016" PRIX64 "\n", __func__, i, zigbeedeviceptr->addr);
            sleepydestidx=i;
          }
        }
      }
    }
    i=(i + 1) % MAX_SEND_QUEUE_ITEMS;
  } while (i!=((localzigbeedeviceptr->sendqueuelastitemsentidx + 1) % MAX_SEND_QUEUE_ITEMS));
  if (sleepydestidx!=-1) {
    //If we get here, their are no non-sleepy packets to send but there is a sleepy packet to send so send it
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
#ifdef ZIGBEELIB_SENDDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: NOW SENDING TO SLEEPY: %d\n", __func__, sleepydestidx);
#endif
    return sleepydestidx;
  }
  if (packetretryingidx!=-1) {
		//If we get here, there are no non-retrying packets to send
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
#ifdef ZIGBEELIB_SENDDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: NOW SENDING TO RETRY: %d\n", __func__, packetretryingidx);
#endif
		return packetretryingidx;
	}
  if (localzigbeedeviceptr->libraryiface->cancel_request_send_packet) {
    //Can't sent a packet at this time so cancel the reservation
    localzigbeedeviceptr->libraryiface->cancel_request_send_packet(localzigbeedeviceptr->deviceptr, localzigbeelocked);
  }
  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();

  return -3;
}

//Send the next waiting item from the queue and set sent status
//Also remove the item from the queue if we don't need to wait for a response
//Use packettype=0 if you haven't received a response packet or aren't expecting to receive a response packet
//For addrs and clusters, pass in NULL for that value to be ignored in the search
STATIC void __zigbeelib_send_queue_send_next_packet(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked) {
#if defined(ZIGBEELIB_SENDDEBUG) || (ZIGBEELIB_MOREDEBUG)
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  localzigbeedevice_t *localzigbeedeviceptr;
  zigbeedevice_t *zigbeedeviceptr;
  zdo_general_request_t *zdocmd;
  zcl_general_request_t *zclcmd;
  int i;
  char rxonidle;
  struct timespec curtime;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (localzigbeedeviceptr->remainingsendqueueitems==MAX_SEND_QUEUE_ITEMS) {
    //The queue is empty
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Check if there is a free send slot on the parent device and
  //  continue to send packets until we can't send anymore
  i=0;
  while (1) {
    i=__zigbeelib_send_queue_find_next_packet_to_send(localzigbeeindex, localzigbeelocked, zigbeelocked);
    if (i<0) {
      //Can't send any more packets at the moment
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
    //Select the function needed to send the packet and send it
    //TODO: Implement error handling as the parent function might fail to send the packet
    //NOTE: If you set expect response to 0 then you won't receive a response
#ifdef ZIGBEELIB_SENDDEBUG
    if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZDO) {
      debuglibifaceptr->debuglib_printf(1, "%s: Sending ZDO packet: index=%d\n", __func__, i);
    } else if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
      debuglibifaceptr->debuglib_printf(1, "%s: Sending ZCL packet: index=%d\n", __func__, i);
    }
#endif
    if (localzigbeedeviceptr->sendqueue_items[i].zigbeeidx!=-1) {
      zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ];
      rxonidle=zigbeedeviceptr->rxonidle;
    } else {
      rxonidle=1; //Use short timeout if the zigbee device couldn't be found
    }
    if (localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus || localzigbeedeviceptr->sendqueue_items[i].waitingforresponse) {
			//Set sent flag first as some parent send functions call the process seqnumber function before returning from send
			//  and it depends on the sent flag being set
      clock_gettime(CLOCK_REALTIME, &curtime);
      localzigbeedeviceptr->sendqueue_items[i].startsendtime=curtime.tv_sec;
      localzigbeedeviceptr->sendqueue_items[i].sent=1;
    }
    if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZDO) {
      zdocmd=(zdo_general_request_t *) localzigbeedeviceptr->sendqueue_items[i].packet;
      if (localzigbeedeviceptr->libraryiface->send_zigbee_zdo) {
        localzigbeedeviceptr->libraryiface->send_zigbee_zdo(localzigbeedeviceptr->deviceptr, zdocmd, localzigbeedeviceptr->sendqueue_items[i].waitingforresponse, rxonidle, localzigbeelocked, zigbeelocked);
      }
    } else if (localzigbeedeviceptr->sendqueue_items[i].packettype==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
      zclcmd=(zcl_general_request_t *) localzigbeedeviceptr->sendqueue_items[i].packet;
      if (zclcmd->cmdid==ZIGBEE_ZCL_CMD_READ_ATTRIB) {
        if ((zclcmd->frame_control & 0x4)!=0x4) {
          if (localzigbeedeviceptr->libraryiface->send_zigbee_zcl_multi_attribute_read) {
            //The parent library has a specialised handler for attribute reading
            localzigbeedeviceptr->libraryiface->send_zigbee_zcl_multi_attribute_read(localzigbeedeviceptr->deviceptr, zclcmd, localzigbeelocked, zigbeelocked);
          } else {
            if (localzigbeedeviceptr->libraryiface->send_zigbee_zcl) {
              localzigbeedeviceptr->libraryiface->send_zigbee_zcl(localzigbeedeviceptr->deviceptr, zclcmd, localzigbeedeviceptr->sendqueue_items[i].waitingforresponse, rxonidle, localzigbeelocked, zigbeelocked);
            }
          }
        } else {
          if (localzigbeedeviceptr->libraryiface->send_multi_attribute_read_with_manufacturer_request) {
            //The parent library has a specialised handler for manufacturer specific attribute reading
            localzigbeedeviceptr->libraryiface->send_multi_attribute_read_with_manufacturer_request(localzigbeedeviceptr->deviceptr, zclcmd, localzigbeelocked, zigbeelocked);
          } else {
            //debuglibifaceptr->debuglib_printf(1, "%s: Sending ZCL Read Attrib packet to Zigbee device: %04hX\n", __func__, zclcmd->netaddr);
            if (localzigbeedeviceptr->libraryiface->send_zigbee_zcl) {
              localzigbeedeviceptr->libraryiface->send_zigbee_zcl(localzigbeedeviceptr->deviceptr, zclcmd, localzigbeedeviceptr->sendqueue_items[i].waitingforresponse, rxonidle, localzigbeelocked, zigbeelocked);
            }
          }
        }
      } else {
        //Just use standard function for other ZCL commands
        if (localzigbeedeviceptr->libraryiface->send_zigbee_zcl) {
          localzigbeedeviceptr->libraryiface->send_zigbee_zcl(localzigbeedeviceptr->deviceptr, zclcmd, localzigbeedeviceptr->sendqueue_items[i].waitingforresponse, rxonidle, localzigbeelocked, zigbeelocked);
        }
      }
    }
    localzigbeedeviceptr->sendqueuelastitemsentidx=i;

    if (!localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus && !localzigbeedeviceptr->sendqueue_items[i].waitingforresponse) {
      __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

//Add a packet to a Zigbee send queue or reject the packet if the queue is full
STATIC int __zigbeelib_add_packet_to_send_queue(int localzigbeeindex, uint8_t *packet, uint8_t packetlen, uint8_t packettype, char waitforresponse, uint16_t send_netaddr, uint16_t send_cluster, uint16_t recv_netaddr, uint16_t recv_cluster, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  int i, pos;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  if (localzigbeedeviceptr->remainingsendqueueitems==0) {
    //The queue is full
    debuglibifaceptr->debuglib_printf(1, "%s: The send queue is full for %s device: %016llX, current queue size=%d\n", __func__, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr, MAX_SEND_QUEUE_ITEMS);
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  //Check if this packet is already in the queue as duplicate packets just overload the network and aren't normally necessary
  for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
    if (localzigbeedeviceptr->sendqueue_items[i].inuse) {
      if (localzigbeedeviceptr->sendqueue_items[i].packettype==packettype && localzigbeedeviceptr->sendqueue_items[i].packetlen==packetlen) {
        if (memcmp(localzigbeedeviceptr->sendqueue_items[i].packet, packet, packetlen)==0) {
          //This packet is already in the queue
          zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
          zigbeelib_unlockzigbee(zigbeelocked);
          MOREDEBUG_EXITINGFUNC();
          return -4;
        }
      }
    }
  }
  //Step to the next empty slot (We do this here as other functions may free up a slot after this function is called)
  i=(localzigbeedeviceptr->sendqueuelastitemaddedidx + 1) % MAX_SEND_QUEUE_ITEMS;
  do {
    if (!localzigbeedeviceptr->sendqueue_items[i].inuse) {
      break;
    }
    i=(i + 1) % MAX_SEND_QUEUE_ITEMS;
  } while (i!=((localzigbeedeviceptr->sendqueuelastitemaddedidx + 1) % MAX_SEND_QUEUE_ITEMS));

  if (localzigbeedeviceptr->sendqueue_items[i].inuse) {
    //The send queue seems to be full even though remainingsendqueueitems is not 0
    debuglibifaceptr->debuglib_printf(1, "%s: The send queue is full for %s device: %016llX, current queue size=%d\n", __func__, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr, MAX_SEND_QUEUE_ITEMS);
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -2;
  }
  localzigbeedeviceptr->sendqueue_items[i].packet=(unsigned char *) malloc(packetlen*sizeof(unsigned char));
  if (!localzigbeedeviceptr->sendqueue_items[i].packet) {
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to allocate memory for send queue item for %s device: %016llX\n", __func__, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr);
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -2;
  }
  pos=zigbeelib_find_zigbee_device(localzigbeeindex, 0x000000000000FFFF, send_netaddr, localzigbeelocked, zigbeelocked);

  localzigbeedeviceptr->sendqueuelastitemaddedidx=i;

  memcpy(localzigbeedeviceptr->sendqueue_items[i].packet, packet, packetlen);
  localzigbeedeviceptr->sendqueue_items[i].packetlen=packetlen;

  localzigbeedeviceptr->sendqueue_items[i].packettype=packettype;
  localzigbeedeviceptr->sendqueue_items[i].send_netaddr=send_netaddr;
  localzigbeedeviceptr->sendqueue_items[i].send_cluster=send_cluster;
  localzigbeedeviceptr->sendqueue_items[i].recv_netaddr=recv_netaddr;
  localzigbeedeviceptr->sendqueue_items[i].recv_cluster=recv_cluster;
  localzigbeedeviceptr->sendqueue_items[i].inuse=1;
  localzigbeedeviceptr->sendqueue_items[i].sent=0;
  if (!localzigbeedeviceptr->libraryiface->request_send_packet) {
    //We only need to wait for send status if the parent library doesn't support buffering info about intransit packets
    localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus=1; //TODO: Add checking if this is supported
  } else {
    localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus=0;
  }
  localzigbeedeviceptr->sendqueue_items[i].waitingforresponse=waitforresponse;
  localzigbeedeviceptr->sendqueue_items[i].startsendtime=0;
  localzigbeedeviceptr->sendqueue_items[i].haveseqnumber=0; //The sequence number will arrive in the status packet
  localzigbeedeviceptr->sendqueue_items[i].seqnumber=0;
  localzigbeedeviceptr->sendqueue_items[i].zigbeeidx=pos;
  if (pos!=-1) {
    localzigbeedeviceptr->zigbeedevices[pos].retrycnt=0;
  }
#ifdef ZIGBEELIB_SENDDEBUG
  debuglibifaceptr->debuglib_printf(1, "%s: Added packet to send queue, index=%d, packet type: %s, destnetaddr=%04hX, destcluster=%04hX, length=%d\n", __func__, i, (packettype==ZIGBEE_ZIGBEE_ZDO) ? "ZDO" : "ZCL", send_netaddr, send_cluster, packetlen);
#endif

  --localzigbeedeviceptr->remainingsendqueueitems;

  __zigbeelib_send_queue_send_next_packet(localzigbeeindex, localzigbeelocked, zigbeelocked);

  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return 0;
}

//Status=0 means success, other value means a problem
//NOTE: We have a specific function for timeout
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_process_send_status(int localzigbeeindex, uint8_t packettype, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
#if defined(ZIGBEELIB_SENDDEBUG) || (ZIGBEELIB_MOREDEBUG)
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  localzigbeedevice_t *localzigbeedeviceptr;
  int i;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  i=-1;
  if (seqnumber) {
    if (localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].inuse && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].packettype==packettype && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].sent) {
      if (localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].haveseqnumber && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].seqnumber==*seqnumber) {
        i=localzigbeedeviceptr->sendqueuelastitemsentidx;
      } else if (localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].waitingforsendstatus) {
        i=localzigbeedeviceptr->sendqueuelastitemsentidx;
      }
    }
    if (i==-1) {
      for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
        if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].packettype==packettype && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].sent) {
          if (localzigbeedeviceptr->sendqueue_items[i].haveseqnumber && localzigbeedeviceptr->sendqueue_items[i].seqnumber==*seqnumber) {
            break;
          } else if (localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus) {
            break;
          }
        }
      }
      if (i==MAX_SEND_QUEUE_ITEMS) {
        i=-1;
      }
    }
    if (status!=0) {
      if (i>=0) {
        //Remove the packet as it failed to send
        //TODO: Implement retries
#ifdef ZIGBEELIB_SENDDEBUG
				debuglibifaceptr->debuglib_printf(1, "%s: Removing packet from send queue due to status=%d, index=%d, sequence number: %d\n", __func__, (unsigned) status, i, *seqnumber);
        __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
#endif
      }
    } else {
      if (i>=0) {
        if (!localzigbeedeviceptr->sendqueue_items[i].waitingforresponse) {
          //Can remove the packet now as we are waiting for a response from the device
          __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
        } else {
#ifdef ZIGBEELIB_SENDDEBUG
          debuglibifaceptr->debuglib_printf(1, "%s: Adding sequence number to packet in send queue, index=%d, sequence number: %d\n", __func__, i, *seqnumber);
#endif
          localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus=0;
          localzigbeedeviceptr->sendqueue_items[i].haveseqnumber=1;
          localzigbeedeviceptr->sendqueue_items[i].seqnumber=*seqnumber;
        }
      }
    }
  }
  __zigbeelib_send_queue_send_next_packet(localzigbeeindex, localzigbeelocked, zigbeelocked);

  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

void zigbeelib_process_seqnumber(int localzigbeeindex, uint8_t packettype, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked) {
#if defined(ZIGBEELIB_SENDDEBUG) || (ZIGBEELIB_MOREDEBUG)
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
#endif
  localzigbeedevice_t *localzigbeedeviceptr;
  int i;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  i=-1;
  if (localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].inuse && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].packettype==packettype && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].sent && localzigbeedeviceptr->sendqueue_items[ localzigbeedeviceptr->sendqueuelastitemsentidx ].send_netaddr==netaddr) {
    i=localzigbeedeviceptr->sendqueuelastitemsentidx;
  } else {
    for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
      if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].packettype==packettype && localzigbeedeviceptr->sendqueue_items[i].sent && localzigbeedeviceptr->sendqueue_items[i].send_netaddr==netaddr) {
        break;
      }
    }
    if (i==MAX_SEND_QUEUE_ITEMS) {
      i=-1;
    }
  }
  if (i>=0) {
#ifdef ZIGBEELIB_SENDDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Adding sequence number to packet in send queue, index=%d, sequence number: %d\n", __func__, i, seqnumber);
#endif
    localzigbeedeviceptr->sendqueue_items[i].haveseqnumber=1;
    localzigbeedeviceptr->sendqueue_items[i].seqnumber=seqnumber;
  }
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

//Status=0 means success, other value means a problem
//NOTE: We have a specific function for timeout
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_process_zdo_send_status(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_process_send_status(localzigbeeindex, ZIGBEE_ZIGBEE_ZDO, status, seqnumber, localzigbeelocked, zigbeelocked);
}

//Status=0 means success, other value means a problem
//NOTE: We have a specific function for timeout
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_process_zcl_send_status(int localzigbeeindex, uint8_t status, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_process_send_status(localzigbeeindex, ZIGBEE_ZIGBEE_ZCL_GENERAL, status, seqnumber, localzigbeelocked, zigbeelocked);
}

//Used to provide the sequence number being used to send a packet
void zigbeelib_process_zdo_seqnumber(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_process_seqnumber(localzigbeeindex, ZIGBEE_ZIGBEE_ZDO, netaddr, seqnumber, localzigbeelocked, zigbeelocked);
}

void zigbeelib_process_zcl_seqnumber(int localzigbeeindex, uint16_t netaddr, uint8_t seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_process_seqnumber(localzigbeeindex, ZIGBEE_ZIGBEE_ZCL_GENERAL, netaddr, seqnumber, localzigbeelocked, zigbeelocked);
}

//Match a packet response with a sent packet and if we find a match, remove the packet from the send queue
//If timeout=0 then we treat as though the packet was successful, otherwise we use timeout processing code with possibly retries
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_send_queue_match_packet_response(int localzigbeeindex, uint8_t packettype, char timeout, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
//  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  localzigbeedevice_t *localzigbeedeviceptr;
  zigbeedevice_t *zigbeedeviceptr;
  zdo_general_request_t *zdocmd;
  zcl_general_request_t *zclcmd;
  int i;
  const char *packettypestr;

  MOREDEBUG_ENTERINGFUNC();
  if (packettype==ZIGBEE_ZIGBEE_ZDO) {
    packettypestr="ZDO";
  } else {
    packettypestr="ZCL";
  }
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (!timeout) {
    int pos;

    pos=zigbeelib_find_zigbee_device(localzigbeeindex, 0x000000000000FFFF, netaddr, localzigbeelocked, zigbeelocked);
    if (pos!=-1) {
      zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[pos];

      if (zigbeedeviceptr->notconnected) {
        uint64_t addr;

        //Mark the zigbee device as connected as we have received a packet
        zigbeedeviceptr->notconnected=0;
        addr=zigbeedeviceptr->addr;

				//Reconfigure reporting and assume pending attribute requests in case the device has lost them
				for (auto &endpointit : zigbeedeviceptr->endpoints) {
					for (auto &clusterit : endpointit.second.iclusters) {
						clusterit.second.isbound=0;
						for (auto &manuit : clusterit.second.attrs) {
							for (auto &attrit : manuit.second) {
								attrit.second.requestpending=false;
								attrit.second.reportingconfigured=0;
								attrit.second.fastreportingconfigured=false;
							}
						}
					}
				}
        debuglibifaceptr->debuglib_printf(1, "%s: Marking Zigbee device: %016llX, %04hX as connected as a packet has been received\n", __func__, addr, netaddr);
      }
    }
  }
  for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
    if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].sent && localzigbeedeviceptr->sendqueue_items[i].waitingforresponse) {
      if (localzigbeedeviceptr->sendqueue_items[i].send_netaddr==netaddr && !timeout) {
        //Reset timeouts since a packet has been received from the zigbee device
        localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ].retrycnt=0;
      }
      if (localzigbeedeviceptr->sendqueue_items[i].packettype==packettype) {
        if (packettype==ZIGBEE_ZIGBEE_ZDO) {
          zdocmd=(zdo_general_request_t *) localzigbeedeviceptr->sendqueue_items[i].packet;
          if (zdocmd->netaddr==netaddr && (zdocmd->clusterid | 0x8000)==clusterid) {
            if (seqnumber && localzigbeedeviceptr->sendqueue_items[i].haveseqnumber) {
              if (localzigbeedeviceptr->sendqueue_items[i].seqnumber==*seqnumber) {
                //Match with sequence number
                break;
              }
            } else {
              //Match without using sequence number
              break;
            }
          }
        } else if (packettype==ZIGBEE_ZIGBEE_ZCL_GENERAL) {
          zclcmd=(zcl_general_request_t *) localzigbeedeviceptr->sendqueue_items[i].packet;
          if (zclcmd->netaddr==netaddr && zclcmd->clusterid==clusterid) {
            if (seqnumber && localzigbeedeviceptr->sendqueue_items[i].haveseqnumber) {
              if (localzigbeedeviceptr->sendqueue_items[i].seqnumber==*seqnumber) {
                //Match with sequence number
                break;
              }
            } else {
              //Match without using sequence number
              break;
            }
          }
        }
      }
    }
  }
  if (i==MAX_SEND_QUEUE_ITEMS) {
    //Couldn't find a match
#ifdef ZIGBEELIB_SENDDEBUG
    if (seqnumber) {
      debuglibifaceptr->debuglib_printf(1, "%s: Couldn't find a match for %s response: timeout=%s, netaddr=%04hX, clusterid=%04hX, seqnumber=%02hhX\n", __func__, packettypestr, ((timeout) ? "Yes" : "No"), netaddr, clusterid, *seqnumber);
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: Couldn't find a match for %s response: timeout=%s, netaddr=%04hX, clusterid=%04hX\n", __func__, packettypestr, ((timeout) ? "Yes" : "No"), netaddr, clusterid);
    }
#endif
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  } else {
#ifdef ZIGBEELIB_SENDDEBUG
    if (seqnumber) {
      debuglibifaceptr->debuglib_printf(1, "%s: Found a match index=%d for %s response: timeout=%d, netaddr=%04hX, clusterid=%04hX, seqnumber=%02hhX\n", __func__, i, packettypestr, timeout, netaddr, clusterid, *seqnumber);
    } else {
      debuglibifaceptr->debuglib_printf(1, "%s: Found a match index=%d for %s response: timeout=%d, netaddr=%04hX, clusterid=%04hX\n", __func__, i, packettypestr, timeout, netaddr, clusterid);
    }
#endif
  }

  zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[ localzigbeedeviceptr->sendqueue_items[i].zigbeeidx ];
  if (!timeout) {
    //NOTE: We only send next packet if there wasn't a timeout as send next packet sometimes calls this function with timeout
    __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
    __zigbeelib_send_queue_send_next_packet(localzigbeeindex, localzigbeelocked, zigbeelocked);
  } else {
    if (zigbeedeviceptr->retrycnt<ZIGBEE_MAX_RETRIES && !zigbeedeviceptr->notconnected) {
      if (localzigbeedeviceptr->sendqueue_items[i].retrycnt<ZIGBEE_MAX_RETRIES) {
        //Retry sending the packet but only if connected
        debuglibifaceptr->debuglib_printf(1, "%s: %s Packet index=%d to netaddr=%04hX, clusterid=%04hX has timed out so retrying\n", __func__, packettypestr, i, netaddr, clusterid);
        localzigbeedeviceptr->sendqueue_items[i].sent=0;
        localzigbeedeviceptr->sendqueue_items[i].waitingforsendstatus=1; //TODO: Add checking if this is supported
        localzigbeedeviceptr->sendqueue_items[i].haveseqnumber=0; //The sequence number will arrive in the status packet
        localzigbeedeviceptr->sendqueue_items[i].seqnumber=0;
        localzigbeedeviceptr->sendqueue_items[i].startsendtime=0;
        ++localzigbeedeviceptr->sendqueue_items[i].retrycnt;
        ++zigbeedeviceptr->retrycnt;
      } else {
        //This packet is having problems sending so remove it from the queue
        debuglibifaceptr->debuglib_printf(1, "%s: %s Packet index=%d to netaddr=%04hX, clusterid=%04hX is having problems so removing from the queue\n", __func__, packettypestr, i, netaddr, clusterid);
        __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
      }
    } else {
      //Remove the pending packet (A new request can be sent again anyway) and then call handler for too many retries)
      __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
      __zigbeelib_send_queue_too_many_retries(localzigbeeindex, localzigbeedeviceptr->sendqueue_items[i].zigbeeidx, netaddr, localzigbeelocked, zigbeelocked);
    }
  }
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

//Match a ZDO response with a sent ZDO packet and if we find a match, remove the ZDO packet from the send queue
//If timeout=0 then we treat as though the packet was successful, otherwise we use timeout processing code with possibly retries
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_send_queue_match_zdo_response(int localzigbeeindex, char timeout, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_send_queue_match_packet_response(localzigbeeindex, ZIGBEE_ZIGBEE_ZDO, timeout, netaddr, clusterid, seqnumber, localzigbeelocked, zigbeelocked);
}

//Match a ZCL response with a sent ZCL packet and if we find a match, remove the ZCL packet from the send queue
//If timeout=0 then we treat as though the packet was successful, otherwise we use timeout processing code with possibly retries
//Pass seqnumber as NULL if not available or as pointer to value if available
void zigbeelib_send_queue_match_zcl_response(int localzigbeeindex, char timeout, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_send_queue_match_packet_response(localzigbeeindex, ZIGBEE_ZIGBEE_ZCL_GENERAL, timeout, netaddr, clusterid, seqnumber, localzigbeelocked, zigbeelocked);
}




/*
  Send an IEEE Address Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    start_index: Indicates the starting index in the neighbor table to return neighbor entries
*/
void zigbeelib_send_zigbee_zdo_ieee_address_request_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint8_t start_index, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_ieee_address_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_ieee_address_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_IEEE_ADDRESS_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_ieee_address_request_t);
  zigbeepayload=(zigbee_zdo_ieee_address_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->netaddr=netaddr;
  zigbeepayload->request_type=1; //Use Extended Response to get a list of associated devices
  zigbeepayload->start_index=start_index;
  
  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Node Descriptor Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
*/
void zigbeelib_send_zigbee_zdo_node_descriptor_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_node_descriptor_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_node_descriptor_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_NODE_DESCRIPTOR_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_node_descriptor_request_t);
  zigbeepayload=(zigbee_zdo_node_descriptor_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->netaddr=netaddr;

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Simple Descriptor Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    endpoint: The endpoint on the destination from which to obtain the simple descriptor
*/
void zigbeelib_send_zigbee_zdo_simple_descriptor_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint8_t endpointid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_simple_descriptor_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_simple_descriptor_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_simple_descriptor_request_t);
  zigbeepayload=(zigbee_zdo_simple_descriptor_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->netaddr=htole16(netaddr);
  zigbeepayload->endpoint=endpointid;

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send an Active Endpoints Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
*/
void zigbeelib_send_zigbee_zdo_active_endpoints_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_active_endpoints_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_active_endpoints_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_ACTIVE_ENDPOINTS_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_active_endpoints_request_t);
  zigbeepayload=(zigbee_zdo_active_endpoints_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->netaddr=htole16(netaddr);

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Some ZDO queries don't need to be send the destination device directly.  They can
    answered on behalf of the device by another device.  If a device is sleepy we should
    always prefer to use the coordinator.  If the local zigbee is a coordinator, always use
    that to reduce network traffic where possible.
  On return the addr and netaddr will be set to the address that should send to
  NOTE: Some ZDO queries can't be done from non-direct
*/
void zigbeelib_check_if_send_zdo_to_device_direct(int localzigbeeindex, uint64_t& addr, uint16_t& netaddr, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  localzigbeedevice_t *localzigbeedeviceptr;
  uint64_t localzigbeeaddr;
  int lclzigbeeidx, zigbeeidx;
  int preferdest=1;
  int localiscoord=0;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;

  //Find the zigbee device info for the local zigbee device if available
  localzigbeeaddr=localzigbeedeviceptr->addr;
  lclzigbeeidx=zigbeelib_find_zigbee_device(localzigbeeindex, localzigbeeaddr, 0xFFFF, localzigbeelocked, zigbeelocked);

  //Find the zigbee device info for the destination zigbee device
  zigbeeidx=zigbeelib_find_zigbee_device(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);

  if (zigbeeidx!=-1) {
    if (zigbeedevices[zigbeeidx].devicetype==ZIGBEE_DEVICE_TYPE_END_DEVICE || zigbeedevices[zigbeeidx].devicetype==ZIGBEE_DEVICE_TYPE_UKN) {
      //Don't prefer sending to destination if it is an end device or we don't know what type of device it is
      preferdest=0;
    }
  }
  if (lclzigbeeidx!=-1) {
    if (zigbeedevices[lclzigbeeidx].netaddr==0x0000) {
      //The local zigbee is a coordinator so can probably maintain more info about the network compared to other devices
      localiscoord=1;
    }
  }
  if (localiscoord) {
    //Always use the local zigbee device if it is the coordinator
    addr=zigbeedevices[lclzigbeeidx].addr;
    netaddr=zigbeedevices[lclzigbeeidx].netaddr;
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (!preferdest) {
    if (lclzigbeeidx!=-1) {
      //Don't send to the destination device directly
      addr=zigbeedevices[lclzigbeeidx].addr;
      netaddr=zigbeedevices[lclzigbeeidx].netaddr;
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Send an Active Endpoints Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    profileid: The profile id to be matched at the destination
    numiclusters The number of input cluster ids to be used for matching
    iclusters The list of input cluster ids
    numoclusters The number of output cluster ids to be used for matching
    oclusters The list of output cluster ids
    NOTE: This query must be done direct to the destination device
*/
void zigbeelib_send_zigbee_zdo_match_descriptor_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint16_t profileid, uint8_t numiclusters, uint16_t iclusters[], uint8_t numoclusters, uint16_t oclusters[], long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_match_descriptor_request_t *zigbeepayload;
  zigbee_zdo_node_clusters_t *zigbeeclusters;
  uint8_t zdocmdlen;
  int i;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  //Then minus 1 again for clusterlist but then + 2 for numiclusters and numoclusters
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_match_descriptor_request)+numiclusters*2+numoclusters*2;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_MATCH_DESCRIPTOR_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_match_descriptor_request_t)+1+numiclusters*2+numoclusters*2;
  zigbeepayload=(zigbee_zdo_match_descriptor_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->netaddr=htole16(netaddr);
  zigbeepayload->profileid=htole16(profileid);
  zigbeeclusters=(zigbee_zdo_node_clusters_t *) &(zigbeepayload->clusterlist);
  zigbeeclusters->numclusters=numiclusters;
  for (i=0; i<numiclusters; ++i) {
    zigbeeclusters->clusters[i]=htole16(iclusters[i]);
  }
  //Step the the location for the output cluster id list
  zigbeeclusters=(zigbee_zdo_node_clusters_t *) (((uint8_t *) zigbeeclusters)+1+numiclusters*2);

  zigbeeclusters->numclusters=numiclusters;
  for (i=0; i<numoclusters; ++i) {
    zigbeeclusters->clusters[i]=htole16(oclusters[i]);
  }
  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Bind Request Cluster ZDO zigbee command to a Zigbee device
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    srcaddr: 64-bit address of the source device for binding
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    endpoint: The endpoint of the source device for binding
    clusterid: Cluser ID to bind
    destaddr: 64-bit Extended Address of the destination device for binding
    destendpoint: The endpoint of the destination device for binding
*/
void zigbeelib_send_zigbee_zdo_bind_request_cluster(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint64_t srcaddr, uint8_t endpoint, uint16_t clusterid, uint64_t destaddr, uint8_t destendpoint, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_bind_request_cluster_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_bind_request_cluster_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_BIND_REQUEST_CLUSTER;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_bind_request_cluster_t);
  zigbeepayload=(zigbee_zdo_bind_request_cluster_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->srcaddr=htole64(srcaddr);
  zigbeepayload->endpoint=endpoint;
  zigbeepayload->clusterid=htole16(clusterid);
  zigbeepayload->addrmode=3; //Only Unicast Address mode support at the moment
  zigbeepayload->destaddr=htole64(destaddr);
  zigbeepayload->destendpoint=destendpoint;

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Management LQI (Neighbor Table) ZDO zigbee command
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    start_index: Indicates the starting index in the neighbor table to return neighbor entries
*/
void zigbeelib_send_zigbee_zdo_management_neighbor_table_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint8_t start_index, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_management_neighbor_table_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_management_neighbor_table_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_management_neighbor_table_request_t);
  zigbeepayload=(zigbee_zdo_management_neighbor_table_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->start_index=start_index;

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Management Leave Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to the local zigbee to use
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    destaddr: The 64-bit address of the device that should leave the network
    destnetaddr: The 16-bit address of the device that should leave the network
    rejoin: If set the device is asked to rejoin the network
  NOTE: The leave response status will come from the destaddr so need the destnetaddr for the queue
*/
void zigbeelib_send_zigbee_zdo_management_leave_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint64_t destaddr, uint16_t destnetaddr, bool rejoin, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_management_leave_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_management_leave_request)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_REQUEST_MGMT_LEAVE;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_management_leave_request_t);
  zigbeepayload=(zigbee_zdo_management_leave_request *) &(zdocmd->zigbeepayload);
  zigbeepayload->destaddr=destaddr;
	zigbeepayload->options=0;
	if (rejoin) {
		zigbeepayload->options|=1;
	}
  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, destnetaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Send a Management Permit Joining Request ZDO zigbee command
  Arguments:
    localzigbeeindex An index to the local zigbee to use
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFF=Broadcast
    duration: The time that joining should be enabled (in seconds) or 0xFF to enable permanently
    trust_center_significance: If set to 1 and remote is a trust center, the command affects the trust center authentication policy, otherwise it has no effect
*/
void zigbeelib_send_zigbee_zdo_management_permit_joining_request(int localzigbeeindex, uint64_t addr, uint16_t netaddr, uint8_t duration, uint8_t trust_center_significance, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zdo_general_request_t *zdocmd;
  zigbee_zdo_management_permit_joining_request_t *zigbeepayload;
  uint8_t zdocmdlen;

  MOREDEBUG_ENTERINGFUNC();

  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first byte of the zigbee command
  zdocmdlen=sizeof(zdo_general_request_t)+sizeof(zigbee_zdo_management_permit_joining_request_t)-1;
  zdocmd=(zdo_general_request_t *) calloc(1, zdocmdlen);
  if (!zdocmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zdocmd->addr=addr;
  zdocmd->netaddr=netaddr;
  zdocmd->clusterid=ZIGBEE_ZDO_MANAGEMENT_PERMIT_JOINING_REQUEST;
  zdocmd->zigbeelength=sizeof(zigbee_zdo_management_permit_joining_request_t);
  zigbeepayload=(zigbee_zdo_management_permit_joining_request_t *) &(zdocmd->zigbeepayload);
  zigbeepayload->duration=duration;
  zigbeepayload->trust_center_significance=trust_center_significance;

  //ZDO received packet uses clusterid + 0x8000
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zdocmd, zdocmdlen, ZIGBEE_ZIGBEE_ZDO, 1, zdocmd->netaddr, zdocmd->clusterid, zdocmd->netaddr, zdocmd->clusterid|0x8000, localzigbeelocked, zigbeelocked);

  free(zdocmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Get the addr, netaddr, profileid, and manufacturerid from the zigbee device info
  Do it within a lock as the values might change outside of the lock
  Only fills in manufacturerid if not NULL
  Returns 0 on success or -1 if unable to retrieve the values
*/
STATIC int zigbeelib_get_zigbee_send_values(int localzigbeeindex, int zigbeedeviceindex, uint8_t destendpnt, uint64_t *addr, uint16_t *netaddr, uint16_t *profileid, uint16_t *manufacturerid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  localzigbeedevice_t *localzigbeedeviceptr;
  int numzigbeedevices;

  //No need to mark localzigbee in use here as marking a zigbee device inuse does that anyway
  //This might need to change if we change to marking zigbee as not in use before sending the packet
  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;
  numzigbeedevices=localzigbeedeviceptr->numzigbeedevices;
  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeedeviceindex], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  if (!zigbeedevices[zigbeedeviceindex].havemanu && manufacturerid) {
    //Can't send this command until we have the manufacturer code
    zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeedeviceindex], localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  //Get the addr, netaddr, profileid, and manufacturerid from the zigbee device info
  //Do it within a lock as the values might change outside of the lock
  *addr=zigbeedevices[zigbeedeviceindex].addr;
  *netaddr=zigbeedevices[zigbeedeviceindex].netaddr;
  if (manufacturerid) {
    *manufacturerid=zigbeedevices[zigbeedeviceindex].manu;
  }
  try {
    *profileid=zigbeedevices[zigbeedeviceindex].endpoints.at(destendpnt).profile;
  } catch (std::exception& e) {
    //Do nothing as the profile was found
  }
  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeedeviceindex], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  return 0;
}

static zcl_general_request_t *zigbeelib_prepare_zcl_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, const uint16_t *manu, uint8_t cmdid, uint8_t payloadlen, uint8_t& zclcmdlen, long *localzigbeelocked, long *zigbeelocked) {
  zcl_general_request_t *zclcmd;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, localzigbeelocked, zigbeelocked)!=0) {
    return nullptr;
  }
  if (manu) {
    manufacturerid=*manu;
  } else {
    manufacturerid=0;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    return nullptr;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  zclcmdlen=sizeof(zcl_general_request_t)+payloadlen-1;
  zclcmd=(zcl_general_request_t *) calloc(1, zclcmdlen);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    return nullptr;
  }
  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  zclcmd->frame_control=0x04; //Include Manufacturer ID in payload
  zclcmd->manu=htole16(manufacturerid);
  zclcmd->cmdid=cmdid;
  zclcmd->zigbeelength=payloadlen;

  return nullptr;
}

/*
  Request the value of multiple non-manufacturer specific attributes
  Use to read 1 attribute at a time
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
    attributeids: An array of 16-bit attribute ids to read
    numattribs: Number of attributes in the array
*/
static void zigbeelib_send_multi_attribute_read(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, std::list<uint16_t> attributeids, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zcl_general_request_t *zclcmd;
  zigbee_zcl_command_read_attribute_list_t *zclattrlist;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, localzigbeelocked, zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  zclcmdlen=sizeof(zcl_general_request_t)+(sizeof(uint16_t)*attributeids.size())-1;
  zclcmd=(zcl_general_request_t *) calloc(1, zclcmdlen);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  zclcmd->frame_control=0x00; //Dont include Manufacturer ID in payload
  zclcmd->manu=0;
  zclcmd->cmdid=ZIGBEE_ZCL_CMD_READ_ATTRIB;
  zclcmd->zigbeelength=sizeof(uint16_t)*attributeids.size();
  zclattrlist=(zigbee_zcl_command_read_attribute_list_t *) &(zclcmd->zigbeepayload);
  uint16_t attridx=0;
  for (auto &attridit : attributeids) {
    zclattrlist->attr[attridx]=htole16(attridit);
		++attridx;
  }
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Request the value of multiple manufacturer specific attributes
  Use to read 1 attribute at a time
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
    attributeids: An array of 16-bit attribute ids to read
    numattribs: Number of attributes in the array
    manufacturerid: The manufacturer id to use when sending the request
*/
static void zigbeelib_send_multi_attribute_read_with_manufacturer_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, const uint16_t *manu, std::list<uint16_t> attributeids, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zcl_general_request_t *zclcmd;
  zigbee_zcl_command_read_attribute_list_t *zclattrlist;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid;

  zclcmd=zigbeelib_prepare_zcl_request(localzigbeeindex, zigbeedeviceindex, srcendpnt, destendpnt, clusterid, manu, ZIGBEE_ZCL_CMD_READ_ATTRIB, sizeof(uint16_t)*attributeids.size(), zclcmdlen, localzigbeelocked, zigbeelocked);

  //Fill in the entered values
  zclattrlist=(zigbee_zcl_command_read_attribute_list_t *) &(zclcmd->zigbeepayload);
  uint16_t attridx=0;
  for (auto &attridit : attributeids) {
    zclattrlist->attr[attridx]=htole16(attridit);
		++attridx;
  }
  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Write multiple attributes
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    manu: The manufacturer id to use when sending the request or NULL if non-manu
    profileid: The profile id to use for the transmission
    outattrs: A map of attributes to send
*/
void zigbee_send_multi_attribute_write_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, const uint16_t *manu, const std::map<uint16_t, zigbeeattrmultival>& outattrs, long& localzigbeelocked, long& zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zcl_general_request_t *zclcmd;
  uint8_t *zclattrlist;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid;
  int zigbeelength;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, &localzigbeelocked, &zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (manu) {
    manufacturerid=*manu;
  } else {
    manufacturerid=0;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  int attrtotsize=0;
	for (auto const &attrit : outattrs) {
		attrtotsize+=attrit.second.getSize();
	}
  zclcmd=(zcl_general_request_t *) calloc(1, sizeof(zcl_general_request_t)+( (sizeof(uint16_t)+sizeof(uint8_t))*outattrs.size())+attrtotsize-1);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  if (manu) {
    zclcmd->frame_control=0x04; //Include Manufacturer ID in payload
    zclcmd->manu=htole16(manufacturerid);
  } else {
    zclcmd->frame_control=0; //Don't include Manufacturer ID in payload
    zclcmd->manu=0;
  }
  zclcmd->cmdid=ZIGBEE_ZCL_CMD_WRITE_ATTRIB;

  zclattrlist=(uint8_t *) &(zclcmd->zigbeepayload);
  zigbeelength=0;
	for (auto const &attrit : outattrs) {
    //Copy non-variable length values
		zigbee_zcl_write_attr_record_t *destattrptr=(zigbee_zcl_write_attr_record_t *) zclattrlist;

		destattrptr->attr=attrit.first;
		destattrptr->attrtype=attrit.second.getdatatype();
    zigbeelib_copy_attribute_data_value(&destattrptr->attrdata, attrit.second.getval(), attrit.second.getdatatype());
    zclattrlist+=3+attrit.second.getSize();
    zigbeelength+=3+attrit.second.getSize();
    if (zigbeelength>250) {
      debuglibifaceptr->debuglib_printf(1, "%s: ERROR: Write Attribute Packet will be larger than 250 bytes\n", __func__); free(zclcmd);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  zclcmd->zigbeelength=zigbeelength;
  zclcmdlen=sizeof(zcl_general_request_t)-1+zigbeelength;

  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, &localzigbeelocked, &zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Configure reporting of multiple manufacturer specific attributes
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
    attrs: An array of attribute reporting records to configure
    numattribs: Number of attributes in the array
    manufacturerid: The manufacturer id to use when sending the request
*/
static void zigbee_send_multi_attribute_configure_reporting_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, const uint16_t *manu, std::list<zigbee_zcl_configure_reporting_attr_record_t> attrs, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zcl_general_request_t *zclcmd;
  uint8_t *zclattrlist;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid;
  int zigbeelength;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, localzigbeelocked, zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (manu) {
    manufacturerid=*manu;
  } else {
    manufacturerid=0;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  //Use a fixed size now for allocation as we don't know the size beforehand
  zclcmd=(zcl_general_request_t *) calloc(1, sizeof(zcl_general_request_t)+(100)-1);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  if (manu) {
    zclcmd->frame_control=0x04; //Include Manufacturer ID in payload
    zclcmd->manu=htole16(manufacturerid);
  } else {
    zclcmd->frame_control=0; //Don't include Manufacturer ID in payload
    zclcmd->manu=0;
  }
  zclcmd->cmdid=ZIGBEE_ZCL_CMD_CONFIG_REPORT;

  zclattrlist=(uint8_t *) &(zclcmd->zigbeepayload);
  zigbeelength=0;
  for (auto &attrit : attrs) {
    int attrsize=0;
    zigbee_attrval_t *attrvalptr;

    //Copy non-variable length values
    if (attrit.direction==0) {
      //Device is sending reports
      memcpy(zclattrlist, &attrit, 8);
      //Only include the value if Analog type not Discrete type
      if (zigbeelib_is_attribute_datatype_analog(attrit.attrtype)) {
        attrvalptr=(zigbee_attrval_t *) (zclattrlist+8);
        attrsize=zigbeelib_copy_attribute_data_value(attrvalptr, attrit.reportchange, attrit.attrtype);
				if (attrsize==-1) {
					attrsize=0;
					debuglibifaceptr->debuglib_printf(1, "%s: ERROR: Unable to copy attribute: %04" PRIX16 " for report configuring\n", __func__, attrit);
				}
      } else {
        attrsize=0;
      }
      zclattrlist+=8+attrsize;
      zigbeelength+=8+attrsize;
    } else {
      //Device is receiving reports
      memcpy(zclattrlist, &attrit, 3);

      attrvalptr=(zigbee_attrval_t *) (zclattrlist+3);
      attrvalptr->uval16bit=attrit.timeout;

      zclattrlist+=3+sizeof(uint16_t);
      zigbeelength+=3+sizeof(uint16_t);
    }
    if (zigbeelength>100) {
      debuglibifaceptr->debuglib_printf(1, "%s: ERROR: Configure Reporting Packet will be larger than 100 bytes\n", __func__); free(zclcmd);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
  }
  zclcmd->zigbeelength=zigbeelength;
  zclcmdlen=sizeof(zcl_general_request_t)-1+zigbeelength;

  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Request the value of multiple non-manufacturer specific attributes
  Use to read 1 attribute at a time
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
    attributeids: An array of 16-bit attribute ids to read
    numattribs: Number of attributes in the array
*/
void zigbeelib_send_read_reporting_configuration_record(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, uint16_t *manu, zigbee_zcl_read_reporting_configuration_record_t attrs[], uint16_t numattribs, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zcl_general_request_t *zclcmd;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, localzigbeelocked, zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (manu) {
    manufacturerid=*manu;
  } else {
    manufacturerid=0;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  zclcmdlen=sizeof(zcl_general_request_t)+sizeof(zigbee_zcl_read_reporting_configuration_record_t)*numattribs-1;
  zclcmd=(zcl_general_request_t *) calloc(1, zclcmdlen);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  if (manu) {
    zclcmd->frame_control=0x04; //Include Manufacturer ID in payload
    zclcmd->manu=htole16(manufacturerid);
  } else {
    zclcmd->frame_control=0; //Don't include Manufacturer ID in payload
    zclcmd->manu=0;
  }
  zclcmd->cmdid=ZIGBEE_ZCL_CMD_READ_REPORT_CFG;
  zclcmd->zigbeelength=sizeof(zigbee_zcl_read_reporting_configuration_record_t)*numattribs;
  memcpy(&zclcmd->zigbeepayload, attrs, sizeof(zigbee_zcl_read_reporting_configuration_record_t)*numattribs);

  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Discover available attributes on a cluster
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    clusterid: The cluster id to use for the transmission
    profileid: The profile id to use for the transmission
    attrs: An array of attribute reporting records to configure
    numattribs: Number of attributes in the array
    manufacturerid: The manufacturer id to use when sending the request
*/
void zigbee_send_discover_attributes_request(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint16_t clusterid, char usemanu, uint16_t firstattr, uint8_t maxattrs, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zcl_general_request_t *zclcmd;
  zigbee_zcl_command_discover_attributes_request_t *zclattrreq;
  uint8_t zclcmdlen;
  uint64_t addr;
  uint16_t netaddr, profileid=0, manufacturerid=0, *manuptr;

  //manufacturerid is only needed in this function if usemanu is requested
  if (usemanu) {
    manuptr=&manufacturerid;
  } else {
    manuptr=nullptr;
  }
  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, manuptr, localzigbeelocked, zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrlist
  //Use a fixed size now for attributes as we don't know the size beforehand
  zclcmdlen=sizeof(zcl_general_request_t)+sizeof(zigbee_zcl_command_discover_attributes_request_t)-1;
  zclcmd=(zcl_general_request_t *) calloc(1, zclcmdlen);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(clusterid);
  zclcmd->profileid=htole16(profileid);
  if (usemanu) {
    zclcmd->frame_control=0x04; //Include Manufacturer ID in payload
    zclcmd->manu=htole16(manufacturerid);
  } else {
    zclcmd->frame_control=0x00; //Don't Include Manufacturer ID in payload
    zclcmd->manu=0;
  }
  zclcmd->cmdid=ZIGBEE_ZCL_CMD_DISC_ATTRIB;
  zclcmd->zigbeelength=sizeof(zigbee_zcl_command_discover_attributes_request_t);
  zclattrreq=(zigbee_zcl_command_discover_attributes_request_t *) &(zclcmd->zigbeepayload);
  zclattrreq->firstattr=firstattr;
  zclattrreq->maxattrs=maxattrs;

  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, zclcmdlen, ZIGBEE_ZIGBEE_ZCL_GENERAL, 1, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Request to turn a Zigbee device on, off, or toggle
  Have a look at 075366r01ZB_AFG-ZigBee_Cluster_Library_Public_download_version.pdf in the On/Off Cluster section for more info
  Arguments:
    localzigbeeindex An index to localzigbee structure used to send the serial data
    addr: The 64-bit destination IEEE address to send the command to
      0x0000000000000000=Coordinator
      0x000000000000FFFF=Broadcast
    netaddr: The 16-bit destination network address to send the command to
      0x0000=Coordinator
      0xFFFE=Broadcast
    srcendpnt: The source endpoint for the transmission
    destendpnt: The destination endpoint for the transmission
    onoff: 0=Off, 1=On, 2=Toggle
*/
void zigbeelib_homeautomation_send_on_off(int localzigbeeindex, int zigbeedeviceindex, uint8_t srcendpnt, uint8_t destendpnt, uint8_t onoff, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  zcl_general_request_t *zclcmd;
  uint64_t addr;
  uint16_t netaddr, profileid=0;

  if (zigbeelib_get_zigbee_send_values(localzigbeeindex, zigbeedeviceindex, destendpnt, &addr, &netaddr, &profileid, nullptr, localzigbeelocked, zigbeelocked)!=0) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (profileid==0) {
    //Since profile id of 0x0000 is ZDO it shouldn't appear in a normal endpoint
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: We do minus 1 as the zigbeepayload value will overlap with the first by of zclattrrecord
  zclcmd=(zcl_general_request_t *) calloc(1, sizeof(zcl_general_request_t)-1);
  if (!zclcmd) {
    //Failed to alloc ram for the zigbee command
    MOREDEBUG_EXITINGFUNC();
    return;
  }

  //Fill in the entered values
  zclcmd->addr=htole64(addr);
  zclcmd->netaddr=htole16(netaddr);
  zclcmd->destendpnt=destendpnt;
  zclcmd->srcendpnt=srcendpnt;
  zclcmd->clusterid=htole16(ZIGBEE_HOME_AUTOMATION_ONOFF_CLUSTER);
  zclcmd->profileid=htole16(profileid);
  zclcmd->frame_control=0x01; //Command is specific to cluster
  zclcmd->manu=0;
  zclcmd->cmdid=onoff;
  zclcmd->zigbeelength=0;

  __zigbeelib_add_packet_to_send_queue(localzigbeeindex, (uint8_t *) zclcmd, sizeof(zcl_general_request_t)+(sizeof(uint16_t)+2)-1, ZIGBEE_ZIGBEE_ZCL_GENERAL, 0, zclcmd->netaddr, zclcmd->clusterid, zclcmd->netaddr, zclcmd->clusterid, localzigbeelocked, zigbeelocked);

  free(zclcmd);
  MOREDEBUG_EXITINGFUNC();
}





/*
  Process a Zigbee ZDO ieee address response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
*/
void zigbeelib_process_zigbee_zdo_ieee_address_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_ieee_address_response_t *zdocmd, uint16_t srcnetaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t addr;
  uint16_t netaddr;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zdocmd->addr;
  netaddr=zdocmd->netaddr;

  //Search for the Zigbee device based on the network address returned in the response as a router may return
  //  the 64-bit address for an end device
  zigbeeidx=zigbeelib_find_zigbee_device(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
  if (zigbeeidx==-1) {
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (zigbeedevices[zigbeeidx].addr!=addr) {
    //Update the 64-bit Zigbee address
    zigbeedevices[zigbeeidx].addr=addr;
		localzigbeedeviceptr->zigbeedeviceaddr[addr]=zigbeeidx;
  }
  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: Addr=%016llX, %04hX, Number of IEEE Address Entries=%d : Start Index=0x%02hhX\n", __func__, addr, netaddr, zdocmd->numaddrs, zdocmd->startidx);

  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee ZDO device announce
  Args: zigbeeindex An index to the zigbee devices structure array
        zdocmd Pointer to the ZDO part of the received packet
*/
STATIC void zigbeelib_process_zdo_device_announce(int localzigbeeindex, zigbee_zdo_device_announce_received_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint16_t netaddr;
  uint64_t addr;
  uint8_t capabilities;
  int pos;
  char devicetype, rxonidle;

  MOREDEBUG_ENTERINGFUNC();
  addr=zdocmd->addr;
  netaddr=zdocmd->netaddr;
  capabilities=zdocmd->capabilities;
  debuglibifaceptr->debuglib_printf(1, "%s: Zigbee Device Announced: %016llX, %04hX\nCapabilities:\n  Alternate Coordinator: %s\n  Device Type: %s\n  Mains Powered: %s\n  Receiver On When Idle: %s\n  Security Capability: %s\n  Allocate Short Addresses: %s\n", __func__, addr, netaddr, (capabilities & 1) ? "True" : "False", (capabilities & 0x2) ? "Full Function/Router" : "Sleepy/End Device", (capabilities & 0x4) ? "True" : "False", (capabilities & 0x8) ? "True" : "False", (capabilities & 0x40) ? "True" : "False", (capabilities & 0x80) ? "True" : "False");

  if (netaddr==0x0000) {
    //Coordinator always uses address: 0x0000
    devicetype=ZIGBEE_DEVICE_TYPE_COORDINATOR;
  } else {
    if (capabilities & 0x2) {
      devicetype=ZIGBEE_DEVICE_TYPE_ROUTER;
    } else {
      devicetype=ZIGBEE_DEVICE_TYPE_END_DEVICE;
    }
  }
  if (capabilities & 0x8) {
    rxonidle=1;
  } else {
    rxonidle=0;
  }
  pos=zigbeelib_add_zigbee_device(localzigbeeindex, addr, netaddr, devicetype, rxonidle, localzigbeelocked, zigbeelocked);
  if (pos!=-1) {
    zigbeelib_lockzigbee(zigbeelocked);
    zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices[pos].timeoutcnt=0;
    zigbeelib_unlockzigbee(zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee ZDO node descriptor response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
        zdocmd Pointer to the ZDO part of the received packet
*/
void zigbeelib_generic_process_zigbee_zdo_node_descriptor_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_node_descriptor_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint16_t olddevicetype, devicetype;
  uint8_t oldrxonidle, rxonidle, maxbufsize;
  uint16_t netaddr, manu, maxinbufsize, maxoutbufsize;
  uint64_t addr;
  bool havezigbeeendpoints=false;

  MOREDEBUG_ENTERINGFUNC();
  netaddr=htole16(zdocmd->netaddr);
  manu=htole16(zdocmd->manu);

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;
  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  //Update the device type and rx on idle in case it isn't up to date
  olddevicetype=zigbeedevices[zigbeeidx].devicetype;
  oldrxonidle=zigbeedevices[zigbeeidx].rxonidle;
  devicetype=zigbeedevices[zigbeeidx].devicetype=zdocmd->nodedescriptor.devicetype;
  rxonidle=zigbeedevices[zigbeeidx].rxonidle=zdocmd->capability.rxonidle;
  maxbufsize=zdocmd->maxbufsize;
  maxinbufsize=zdocmd->maxinbufsize;
  maxoutbufsize=zdocmd->maxoutbufsize;
  zigbeedevices[zigbeeidx].havemanu=1;
  zigbeedevices[zigbeeidx].manu=manu;
  if (zigbeedevices[zigbeeidx].numendpoints>0) {
    havezigbeeendpoints=true;
  } else {
    havezigbeeendpoints=false;
  }
  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: Added manufacturer: %s (%04hX) for Zigbee device: %016llX, %04hX\n", __func__, zigbeelib_get_zigbee_manufacturer_string(manu).c_str(), manu, addr, netaddr);
  if (olddevicetype!=devicetype) {
    const char *olddevicetypestr, *devicetypestr;

    switch (olddevicetype) {
      case 0: olddevicetypestr="Cordinator";
              break;
      case 1: olddevicetypestr="Router";
              break;
      case 2: olddevicetypestr="End Device";
              break;
      default: olddevicetypestr="Unknown";
               break;
    }
    switch (devicetype) {
      case 0: devicetypestr="Cordinator";
              break;
      case 1: devicetypestr="Router";
              break;
      case 2: devicetypestr="End Device";
              break;
      default: devicetypestr="Unknown";
               break;
    }
    debuglibifaceptr->debuglib_printf(1, "%s:   Device Type changed from %s to %s\n", __func__, olddevicetypestr, devicetypestr);
  }
  if (oldrxonidle!=rxonidle) {
    const char *oldrxonidlestr, *rxonidlestr;

    switch (oldrxonidle) {
      case 0: oldrxonidlestr="False";
              break;
      case 1: oldrxonidlestr="True";
              break;
      default: oldrxonidlestr="Unknown";
               break;
    }
    switch (rxonidle) {
      case 0: rxonidlestr="False";
              break;
      case 1: rxonidlestr="True";
              break;
      default: rxonidlestr="Unknown";
               break;
    }
    debuglibifaceptr->debuglib_printf(1, "%s:   Receiver On When Idle changed from %s to %s\n", __func__, oldrxonidlestr, rxonidlestr);
  }
  debuglibifaceptr->debuglib_printf(1, "%s:   Maximum Buffer Size: %u\n", __func__, maxbufsize);
  debuglibifaceptr->debuglib_printf(1, "%s:   Maximum Imcoming Transfer Size: %u\n", __func__, maxinbufsize);
  debuglibifaceptr->debuglib_printf(1, "%s:   Maximum Outgoing Transfer Size: %u\n", __func__, maxoutbufsize);

  //Now find the endpoints as the queueing system can queue and retry this if necessary
  if (!havezigbeeendpoints) {
    zigbeelib_get_zigbee_endpoints(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee ZDO simple descriptor response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
        zdocmd Pointer to the ZDO part of the received packet
TODO: Add a callback or some way of telling RapidHA about the endpoint id info
*/
void zigbeelib_generic_process_zigbee_zdo_simple_descriptor_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_simple_descriptor_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbee_zdo_node_clusters_t *iclusters, *oclusters;
  uint8_t i, endpointid, localzigbee_haendpointid;
  uint16_t netaddr, manu, profile, devid, devver, minmanudisc;
  uint64_t localzigbee_addr, addr;
  int pos;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();

  netaddr=htole16(zdocmd->netaddr);
  endpointid=zdocmd->endpoint;
  profile=htole16(zdocmd->profileid);
  devid=htole16(zdocmd->deviceid);
  devver=zdocmd->devicever & 0xF;
  iclusters=(zigbee_zdo_node_clusters_t *) &(zdocmd->clusterlist);
  oclusters=(zigbee_zdo_node_clusters_t *) ((size_t) iclusters+sizeof(uint8_t)+(iclusters->numclusters*sizeof(uint16_t)));

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto zigbeedeviceit=localzigbeedeviceptr->zigbeedevices.find(zigbeeidx);

  if (zigbeelib_markzigbee_inuse(&zigbeedeviceit->second, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedeviceit->second.addr;
	auto zigbeeendpointit=zigbeedeviceit->second.endpoints.find(endpointid);
	if (zigbeeendpointit==zigbeedeviceit->second.endpoints.end()) {
    //Endpoint not found in the Zigbee cache table so ignore
    zigbeelib_markzigbee_notinuse(&zigbeedeviceit->second, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (zigbeeendpointit->second.profile) {
    //Endpoint already configured
    zigbeelib_markzigbee_notinuse(&zigbeedeviceit->second, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    debuglibifaceptr->debuglib_printf(1, "%s: Already configured Zigbee device: %016llX, %04hX, Endpoint: %02hhX\n", __func__, addr, netaddr, endpointid);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  if (localzigbeedeviceptr->addr==addr) {
    //Store the endpoint id in the local zigbee device structure
    if (profile==ZIGBEE_HOME_AUTOMATION_PROFILE) {
      localzigbeedeviceptr->haendpointid=endpointid;
    }
  }
  localzigbee_addr=localzigbeedeviceptr->addr;
  localzigbee_haendpointid=localzigbeedeviceptr->haendpointid;

  //NOTE: The changes below are currently only done once by this function and the remove zigbee function
  //  so as long as the zigbee is marked inuse most of this code can run unlocked
  zigbeeendpointit->second.profile=profile;
  zigbeeendpointit->second.devid=devid;
  zigbeeendpointit->second.devver=devver;
  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016llX, %04hX, Endpoint: %02hhX\n", __func__, addr, netaddr, endpointid);
  debuglibifaceptr->debuglib_printf(1, "%s:   Profile ID: %04hX, Device ID: %s (%04hX), Device Version: %02hhX\n", __func__, profile, zigbeelib_get_zigbee_deviceid_string(profile, devid), devid, devver);

  debuglibifaceptr->debuglib_printf(1, "%s:   Number of Input Clusters=%u\n", __func__, iclusters->numclusters);
  pos=33;
  if (iclusters->numclusters>0) {
    zigbeeendpointit->second.iclusters.clear();
    for (i=0; i<iclusters->numclusters; i++) {
      zigbeeendpointit->second.iclusters[ iclusters->clusters[i] ].id=iclusters->clusters[i];
      debuglibifaceptr->debuglib_printf(1, "%s:   Input Cluster: %s (%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_clusterid_string(iclusters->clusters[i]).c_str(), iclusters->clusters[i]);
    }
    pos+=(iclusters->numclusters*2);
  }
  debuglibifaceptr->debuglib_printf(1, "%s:   Number of Output Clusters=%u\n", __func__, oclusters->numclusters);
  ++pos;
  if (oclusters->numclusters>0) {
    zigbeeendpointit->second.oclusters.clear();
    for (i=0; i<oclusters->numclusters; i++) {
      zigbeeendpointit->second.oclusters[ oclusters->clusters[i] ].id=oclusters->clusters[i];
      debuglibifaceptr->debuglib_printf(1, "%s:   Output Cluster: %s (%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_clusterid_string(oclusters->clusters[i]).c_str(), oclusters->clusters[i]);
    }
  }
  zigbeelib_lockzigbee(zigbeelocked);
  zigbeeendpointit->second.numiclusters=iclusters->numclusters;
  zigbeeendpointit->second.numoclusters=oclusters->numclusters;
	manu=zigbeedeviceit->second.manu;
	minmanudisc=zigbeedeviceit->second.minmanudisc;
  zigbeelib_unlockzigbee(zigbeelocked);

  if (localzigbee_haendpointid!=0 && zigbeeendpointit->second.profile==ZIGBEE_HOME_AUTOMATION_PROFILE) {
    //These commands are specific to Home automation profile so don't query if the endpoint uses a different profile
    for (auto const &clusterit : zigbeeendpointit->second.iclusters) {
      //Retrieve all the supported attributes for each cluster
      //Only request 16 at a time to keep the packet size low
      //NOTE: Scanning for manufacturer specific attributes seems to often cause timeouts
			debuglibifaceptr->debuglib_printf(1, "%s: Discovering attributes for Cluster: %s (%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first);
      zigbee_send_discover_attributes_request(localzigbeeindex, zigbeeidx, localzigbee_haendpointid, zigbeeendpointit->first, clusterit.first, 0, 0x0000, 16, localzigbeelocked, zigbeelocked);
      if (clusterit.first>=minmanudisc) {
        //General clusters don't normally have manufacturer specific attributes and some devices timeout if queried
				debuglibifaceptr->debuglib_printf(1, "%s: Discovering attributes for Cluster: %s (%04" PRIX16 "), Manufacturer: %s (%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manu).c_str(), manu);
        zigbee_send_discover_attributes_request(localzigbeeindex, zigbeeidx, localzigbee_haendpointid, zigbeeendpointit->first, clusterit.first, 1, 0x0000, 16, localzigbeelocked, zigbeelocked);
      }
    }
  }
  //------------------------------------
  zigbeelib_markzigbee_notinuse(&zigbeedeviceit->second, localzigbeelocked, zigbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Zigbee ZDO active endpoints response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
  Only minimal locking is needed since this function is only called by the receive thread
*/
void zigbeelib_process_zigbee_zdo_active_endpoints_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_active_endpoints_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint8_t numendpoints;
  uint64_t addr;
  uint16_t netaddr;
  int i;

  MOREDEBUG_ENTERINGFUNC();

  netaddr=htole16(zdocmd->netaddr);
  numendpoints=zdocmd->numendpoints;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;

  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  if (zigbeedevices[zigbeeidx].endpoints.size()>0) {
    //Endpoints already added for this device
    zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    debuglibifaceptr->debuglib_printf(1, "%s: Endpoints already added for Zigbee device: %016llX, %04hX\n", __func__, addr, netaddr);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: The changes below are currently only done once by this function and the remove zigbee function
  //  so as long as the zigbee is marked inuse most of this code can run unlocked
  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: Number of endpoints=0x%02hhX for Zigbee device: %016llX, %04hX\n", __func__, numendpoints, addr, netaddr);
  for (i=0; i<numendpoints; i++) {
    debuglibifaceptr->debuglib_printf(1, "%s:   endpoint id=%02hhX\n", __func__, zdocmd->endpoints[i]);
    memset(&zigbeedevices[zigbeeidx].endpoints[ zdocmd->endpoints[i] ], 0, sizeof(zigbeeendpoint_t));
    zigbeedevices[zigbeeidx].endpoints[ zdocmd->endpoints[i] ].id=zdocmd->endpoints[i];
  }
  //Now get endpoint info as the queueing system can queue and retry this if necessary
  //Don't need to check if endpoint info is already added here as we should only get this area once per zigbee
  zigbeelib_get_zigbee_next_endpoint_info(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);

  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Zigbee ZDO match descriptor response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
  Only minimal locking is needed since this function is only called by the receive thread
  NOTE: Reduced checking as this function is only used to find the basic cluster at the moment
*/
void zigbeelib_process_zigbee_zdo_match_descriptor_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_match_descriptor_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  uint8_t numendpoints;
  uint64_t addr;
  uint16_t netaddr;

  MOREDEBUG_ENTERINGFUNC();

  netaddr=htole16(zdocmd->netaddr);
  numendpoints=zdocmd->numendpoints;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;

  //Search for the Zigbee device based on the network address returned in the response
  zigbeeidx=zigbeelib_find_zigbee_device(localzigbeeindex, 0xFFFFFFFFFFFFFFFF, netaddr, localzigbeelocked, zigbeelocked);
  if (zigbeeidx==-1) {
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;

  //debuglibifaceptr->debuglib_printf(1, "%s: Number of endpoints=0x%02hhX matched for Zigbee device: %016llX, %04hX\n", __func__, numendpoints, addr, netaddr);
  //for (i=0; i<numendpoints; i++) {
  //  debuglibifaceptr->debuglib_printf(1, "%s:   endpoint id=%02hhX\n", __func__, zdocmd->endpoints[i]);
  //}
  //Just use the first matched endpoint with basic cluster for pre-discovery
  zigbeedevices[zigbeeidx].havebasicclusterendpointid=true;
  zigbeedevices[zigbeeidx].basicclusterendpointid=zdocmd->endpoints[0];

  //Fill in enough info for attribute read to work
  //If the basic cluster info is unrecognised this will need to be reset for full discovery to work
  memset(&zigbeedevices[zigbeeidx].endpoints[ zdocmd->endpoints[0] ], 0, sizeof(zigbeeendpoint_t));
  zigbeedevices[zigbeeidx].endpoints[ zdocmd->endpoints[0] ].id=zdocmd->endpoints[0];
  zigbeedevices[zigbeeidx].endpoints[ zdocmd->endpoints[0] ].profile=ZIGBEE_HOME_AUTOMATION_PROFILE;

  if (!zigbeedevices[zigbeeidx].havebasicclusterinfo) {
    //debuglibifaceptr->debuglib_printf(1, "%s: Attribute Read: %d, %d, %02hhX, %02hhX\n", __func__, localzigbeeindex, zigbeeidx, zigbeelib_localzigbeedevices[localzigbeeindex].haendpointid, zdocmd->endpoints[0]);
    std::list<uint16_t> readattribs={0x0004, 0x0005};

    //Retrieve the basic cluster attribute values
    zigbeelib_send_multi_attribute_read(localzigbeeindex, zigbeeidx, zigbeelib_localzigbeedevices[localzigbeeindex].haendpointid, zdocmd->endpoints[0], ZIGBEE_HOME_AUTOMATION_BASIC_CLUSTER, readattribs, localzigbeelocked, zigbeelocked);
  }
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Zigbee ZDO bind response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
  Only minimal locking is needed since this function is only called by the receive thread
*/
void zigbeelib_process_zigbee_zdo_bind_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_bind_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t addr;
  uint16_t netaddr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;

  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  netaddr=zigbeedevices[zigbeeidx].netaddr;

  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  if (zdocmd->status==ZIGBEE_ZDO_STATUS_SUCCESS) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received successful bind from Zigbee device: %016llX, %04hX\n", __func__, addr, netaddr);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee ZDO neighbor table response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
*/
void zigbeelib_process_zigbee_zdo_management_neighbor_table_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_management_neighbor_table_response_t *zdocmd, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t addr;
  uint8_t num_table_entries, start_index, num_returned_entries, i;

  MOREDEBUG_ENTERINGFUNC();

  num_table_entries=zdocmd->totentries;
  start_index=zdocmd->startidx;
  num_returned_entries=zdocmd->numentries;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;
  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  zigbeelib_unlockzigbee(zigbeelocked);

  //debuglibifaceptr->debuglib_printf(1, "%s: Addr=%04hX, Number of Neighbor Table Entries=%d : Start Index=0x%02hhX : Number of Returned Entries in this response=%d\n", __func__, netaddr, num_table_entries, start_index, num_returned_entries);
  for (i=0; i<num_returned_entries; i++) {
    uint64_t tmpaddr, tmpnetaddr;
    char devicetype, rxonidle=1;
    uint8_t various;
    const char *devicetypestr, *relationship;

    tmpaddr=htole64(zdocmd->entries[i].addr);
    tmpnetaddr=htole16(zdocmd->entries[i].netaddr);
    various=htole16(zdocmd->entries[i].various1);
    devicetype=(various & 3U);
    switch (various & 3U) {
      case 0: devicetypestr="Cordinator";
              break;
      case 1: devicetypestr="Router";
              break;
      case 2: devicetypestr="End Device";
              break;
      default: devicetypestr="Unknown";
               break;
    }
    switch ((various >> 2) & 3U) {
      case 0: rxonidle=0;
              break;
      case 1:
      case 2: rxonidle=1;
    }
    switch ((various >> 4) & 7U) {
      case 0: relationship="Parent";
              break;
      case 1: relationship="Child";
              break;
      case 2: relationship="Sibling";
              break;
      case 3: relationship="None";
              break;
      case 4: relationship="Previous Child";
              break;
      default: relationship="Unknown";
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Zigbee Device Info from %016llX, %04hX\n", __func__, addr, netaddr);
    debuglibifaceptr->debuglib_printf(1, "%s:   Zigbee Device: %016llX, %04hX\n", __func__, tmpaddr, tmpnetaddr);
    debuglibifaceptr->debuglib_printf(1, "%s:   Device Type: %s\n", __func__, devicetypestr);
    debuglibifaceptr->debuglib_printf(1, "%s:   Receiver On When Idle: %s\n", __func__, (rxonidle==1) ? "True" : "False");
    debuglibifaceptr->debuglib_printf(1, "%s:   Relationship: %s\n", __func__, relationship);

    zigbeelib_add_zigbee_device(localzigbeeindex, tmpaddr, tmpnetaddr, devicetype, rxonidle, localzigbeelocked, zigbeelocked);
  }
  if (num_table_entries>(start_index+num_returned_entries)) {
    //Retrieve the rest of the entries from the device
    debuglibifaceptr->debuglib_printf(1, "%s: Scanning for more Zigbee devices known by ZigBee device=%016" PRIX64 ", %04" PRIX16 "\n", __func__, addr, netaddr);
    zigbeelib_send_zigbee_zdo_management_neighbor_table_request(localzigbeeindex, addr, netaddr, start_index+num_returned_entries, localzigbeelocked, zigbeelocked);
  }
  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Zigbee ZDO management leave response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
  Only minimal locking is needed since this function is only called by the receive thread
*/
void zigbeelib_process_zigbee_zdo_management_leave_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_management_leave_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t addr;
  uint16_t netaddr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;

  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  netaddr=zigbeedevices[zigbeeidx].netaddr;

  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  if (zdocmd->status==ZIGBEE_ZDO_STATUS_SUCCESS) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received successful leave from Zigbee device: %016" PRIX64 ", %04" PRIX16 "\n", __func__, addr, netaddr);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process an Zigbee ZDO permit joining response
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
  Only minimal locking is needed since this function is only called by the receive thread
*/
void zigbeelib_process_zigbee_zdo_permit_joining_response(int localzigbeeindex, int zigbeeidx, zigbee_zdo_management_permit_joining_response_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t addr;
  uint16_t netaddr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  auto &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;

  if (zigbeelib_markzigbee_inuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  addr=zigbeedevices[zigbeeidx].addr;
  netaddr=zigbeedevices[zigbeeidx].netaddr;

  zigbeelib_markzigbee_notinuse(&zigbeedevices[zigbeeidx], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  if (zdocmd->status==ZIGBEE_ZDO_STATUS_SUCCESS) {
    debuglibifaceptr->debuglib_printf(1, "%s: Received successful permit join from Zigbee device: %016" PRIX64 ", %04" PRIX16 "\n", __func__, addr, netaddr);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a ZDO Response Received
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet
*/
void zigbeelib_process_zdo_response_received(int localzigbeeindex, zigbee_zdo_response_header_t *zdocmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int pos;
  uint16_t netaddr, clusterid;
  uint8_t status;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();

  netaddr=zdocmd->srcnetaddr;
  clusterid=zdocmd->clusterid;
  status=zdocmd->status;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;

  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  pos=zigbeelib_find_zigbee_device(localzigbeeindex, 0x000000000000FFFF, netaddr, localzigbeelocked, zigbeelocked);
  if (pos!=-1) {
    struct timespec curtime;

    if (zigbeelib_markzigbee_inuse(&zigbeedevices[pos], localzigbeelocked, zigbeelocked)<0) {
      //Failed to mark zigbee device as inuse
      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
    clock_gettime(CLOCK_REALTIME, &curtime);
    zigbeedevices[pos].lastresponsetime=curtime.tv_sec;
    zigbeedevices[pos].timeoutcnt=0;
    if (zigbeedevices[pos].notconnected) {
      //Mark the zigbee device as connected as we have received a packet
      zigbeedevices[pos].notconnected=0;

			//Reconfigure reporting and assume pending attribute requests in case the device has lost them
			for (auto &endpointit : zigbeedevices[pos].endpoints) {
				for (auto &clusterit : endpointit.second.iclusters) {
					clusterit.second.isbound=0;
					for (auto &manuit : clusterit.second.attrs) {
						for (auto &attrit : manuit.second) {
							attrit.second.requestpending=false;
							attrit.second.reportingconfigured=0;
							attrit.second.fastreportingconfigured=false;
						}
					}
				}
			}
      debuglibifaceptr->debuglib_printf(1, "%s: Marking Zigbee device: %016llX, %04hX as connected as a packet has been received\n", __func__, zigbeedevices[pos].addr, zigbeedevices[pos].netaddr);
    }
  }
  //For IEEE Address response the response for an end device may come from a router so we need to use the netaddr
  //  in the response data instead of the main netaddr
  if (clusterid == ZIGBEE_ZDO_IEEE_ADDRESS_RESPONSE && status==0) {
    zigbeelib_send_queue_match_zdo_response(localzigbeeindex, 0, ((zigbee_zdo_ieee_address_response_t *) &(zdocmd->seqnumber))->netaddr, clusterid, &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
  } else {
    zigbeelib_send_queue_match_zdo_response(localzigbeeindex, 0, netaddr, clusterid, &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
  }
  if ((clusterid & 0x8000) && status!=0) {
    uint64_t addr;

    if (pos!=-1) {
      addr=zigbeedevices[pos].addr;
      zigbeelib_markzigbee_notinuse(&zigbeedevices[pos], localzigbeelocked, zigbeelocked);
    } else {
      addr=0x000000000000FFFF;
    }
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);

    //NOTE: Only clusters | 0x8000 have a real status field
    //Invalid message received
    debuglibifaceptr->debuglib_printf(1, "%s: ZDO ERROR Status=%02hhX, Zigbee device: %016llX, %04hX, clusterid=%04hX, seqnumber=%02hhX\n", __func__, status, addr, netaddr, clusterid, &zdocmd->seqnumber);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  //NOTE: Since we use index values instead of pointers it should be okay to unlock here as long as
  //  we mark the zigbee inuse
  zigbeelib_unlockzigbee(zigbeelocked);

  //Check if we are waiting for this response packet
  switch (clusterid) {
    case ZIGBEE_ZDO_IEEE_ADDRESS_RESPONSE:
      zigbeelib_process_zigbee_zdo_ieee_address_response(localzigbeeindex, pos, (zigbee_zdo_ieee_address_response_t *) &zdocmd->seqnumber, netaddr, localzigbeelocked, zigbeelocked);
      break;
    case ZIGBEE_ZDO_END_DEVICE_ANNOUNCE:
      zigbeelib_process_zdo_device_announce(localzigbeeindex, (zigbee_zdo_device_announce_received_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      break;
    case ZIGBEE_ZDO_NODE_DESCRIPTOR_RESPONSE:
      if (pos!=-1) {
        zigbeelib_generic_process_zigbee_zdo_node_descriptor_response(localzigbeeindex, pos, (zigbee_zdo_node_descriptor_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      }
      break;
    case ZIGBEE_ZDO_SIMPLE_DESCRIPTOR_RESPONSE:
      if (pos!=-1) {
        zigbeelib_generic_process_zigbee_zdo_simple_descriptor_response(localzigbeeindex, pos, (zigbee_zdo_simple_descriptor_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      }
      break;
    case ZIGBEE_ZDO_ACTIVE_ENDPOINTS_RESPONSE:
      if (pos!=-1) {
        zigbeelib_process_zigbee_zdo_active_endpoints_response(localzigbeeindex, pos, (zigbee_zdo_active_endpoints_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      }
      break;
    case ZIGBEE_ZDO_MATCH_DESCRIPTOR_RESPONSE:
      if (pos!=-1) {
        zigbeelib_process_zigbee_zdo_match_descriptor_response(localzigbeeindex, pos, (zigbee_zdo_match_descriptor_response *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      }
      break;
    case ZIGBEE_ZDO_BIND_RESPONSE_CLUSTER:
      if (pos!=-1) {
        zigbeelib_process_zigbee_zdo_bind_response(localzigbeeindex, pos, (zigbee_zdo_bind_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      }
      break;
    case ZIGBEE_ZDO_MANAGEMENT_NEIGHBOR_TABLE_RESPONSE:
      zigbeelib_process_zigbee_zdo_management_neighbor_table_response(localzigbeeindex, pos, (zigbee_zdo_management_neighbor_table_response_t *) &zdocmd->seqnumber, netaddr, localzigbeelocked, zigbeelocked);
      break;
		case ZIGBEE_ZDO_MANAGEMENT_LEAVE_RESPONSE:
		  zigbeelib_process_zigbee_zdo_management_leave_response(localzigbeeindex, pos, (zigbee_zdo_management_leave_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
			break;
    case ZIGBEE_ZDO_MANAGEMENT_PERMIT_JOINING_RESPONSE:
			zigbeelib_process_zigbee_zdo_permit_joining_response(localzigbeeindex, pos, (zigbee_zdo_management_permit_joining_response_t *) &zdocmd->seqnumber, localzigbeelocked, zigbeelocked);
      break;
    default:
      debuglibifaceptr->debuglib_printf(1, "%s: Unknown clusterid: %04hX received from Zigbee device: %04hX\n", __func__, clusterid, netaddr);
      break;
  }
  if (pos!=-1) {
    zigbeelib_markzigbee_notinuse(&zigbeedevices[pos], localzigbeelocked, zigbeelocked);
  }
  //Call add zigbee device in case the device hasn't been added yet but call after packet processing as
  //  packet processing might be able to add the device with more info
  zigbeelib_add_zigbee_device(localzigbeeindex, 0x000000000000FFFF, netaddr, ZIGBEE_DEVICE_TYPE_UKN, ZIGBEE_RXONIDLE_UKN, localzigbeelocked, zigbeelocked);

  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

void process_zdo_response_timeout(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  //The ZDO response is always 0x8000
  zigbeelib_send_queue_match_zdo_response(localzigbeeindex, 1, netaddr, clusterid | 0x8000, seqnumber, localzigbeelocked, zigbeelocked);
}

/*
  Decode and handle a received Zigbee Home Automation attribute
  Args: attrid The attribute id
        status The status of the attribute
        attrtype The attribute data type
        attrvalptr Pointer to variable length attribute value
        attrsizeptr Returns the size of the attribute value so the caller can step to the next attribute in a list
*/
extern void zigbeelib_decode_zigbee_home_automation_attribute(int localzigbeeindex, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, uint16_t attrid, uint8_t status, uint8_t attrtype, const zigbee_attrval_t * const attrvalptr, uint8_t *attrsizeptr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint64_t zigbeeaddr=0;
	localzigbeedevice_t *localzigbeedeviceptr;
	int idx;
	std::string clusterstr, manustr;
  std::string attrnamestr, attrtypestr;

  MOREDEBUG_ENTERINGFUNC();

	(*attrsizeptr)=0xff; //0xff is returned on error
	attrnamestr=zigbeelib_get_zigbee_attrid_string(clusterid, manu, attrid);
	attrtypestr=zigbeelib_get_zigbee_attrdatatype_string(attrtype);
	clusterstr=zigbeelib_get_zigbee_clusterid_string(clusterid);
	manustr=zigbeelib_get_zigbee_manufacturer_string(manu);
	zigbeelib_lockzigbee(zigbeelocked);

	localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
	auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;

	idx=zigbeelib_find_zigbee_device(localzigbeeindex, 0x000000000000FFFF, netaddr, localzigbeelocked, zigbeelocked);
	if (idx!=-1) {
		if (zigbeelib_markzigbee_inuse(&zigbeedevices[idx], localzigbeelocked, zigbeelocked)<0) {
			//Failed to mark zigbee device as inuse
			zigbeelib_unlockzigbee(zigbeelocked);
			MOREDEBUG_EXITINGFUNC();
			return;
		}
	} else {
		//Zigbee device not found
		zigbeelib_unlockzigbee(zigbeelocked);
		MOREDEBUG_EXITINGFUNC();
		return;
	}
	zigbeeaddr=zigbeedevices[idx].addr;

  if (status!=ZIGBEE_ZCL_STATUS_SUCCESS) {
    debuglibifaceptr->debuglib_printf(1, "%s: Error: %s (%02" PRIX8 ") from Zigbee device: %016" PRIX64 ", %04" PRIX16 " Endpoint ID: %02" PRIX8 ", Cluster ID: %s (0x%04" PRIX16 "), Attribute: %s (%04" PRIX16 "), Manu: %s (%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_zclstatus_string(status), status, zigbeeaddr, netaddr, endpoint, clusterstr.c_str(), clusterid, attrnamestr.c_str(), attrid, manustr.c_str(), manu);
  } else {
		zigbeeattr_t *attrptr=NULL;
		zigbeeattrmultival attrval;

		//First see if we can process the attribute value
		attrval=zigbeeattrmultival(*attrvalptr, attrtype);
		if (attrval.getSize()!=-1) {
			//This function can handle more data types than copy attribute so still set the size even if we sometimes can't copy the value
			(*attrsizeptr)=attrval.getSize();
		}
		debuglibifaceptr->debuglib_printf(1, "%s: Received Endpoint ID: %02" PRIX8 ", Cluster ID: %s (0x%04" PRIX16 "), Manu: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ") Value: %s (%s) from Zigbee device: %016" PRIX64 ", %04" PRIX16 "\n", __func__, endpoint, clusterstr.c_str(), clusterid, manustr.c_str(), manu, attrnamestr.c_str(), attrid, attrval.toString().c_str(), attrtypestr.c_str(), zigbeeaddr, netaddr);

		struct timespec curtime;

		clock_gettime(CLOCK_REALTIME, &curtime);
		try {
			attrptr=&zigbeedevices[idx].endpoints.at(endpoint).iclusters.at(clusterid).attrs.at(manu).at(attrid);
		} catch (std::out_of_range& e) {
			if (clusterid==0x0000 && (attrid==0x0004 || attrid==0x0005)) {
				//Special Handling for identity info
				if (attrid==0x0004) {
					zigbeedevices[idx].havebasicmanuname=true;
					zigbeedevices[idx].basicmanuname=attrval.toString();
				} else if (attrid==0x0005) {
					zigbeedevices[idx].havebasicmodel=true;
					zigbeedevices[idx].basicmodel=attrval.toString();
				}
				if (zigbeedevices[idx].havebasicmanuname && zigbeedevices[idx].havebasicmodel) {
					zigbeedevices[idx].havebasicclusterinfo=true;
					zigbeelib_match_zigbeedevice_basicinfo(localzigbeeindex, idx, localzigbeelocked, zigbeelocked);
				}
			} else {
				debuglibifaceptr->debuglib_printf(1, "%s:   Ignored\n", __func__);
			}
			zigbeelib_markzigbee_notinuse(&zigbeedevices[idx], localzigbeelocked, zigbeelocked);
			zigbeelib_unlockzigbee(zigbeelocked);

			return;
		}
		//Make a copy of the previous value
		attrptr->prevval=attrptr->val;

		//Update current attribute value
		attrptr->val=attrval;
		debuglibifaceptr->debuglib_printf(1, "%s:   Handled\n", __func__);

		attrptr->requestpending=false;
		if (attrptr->invaltime==0) {
			//First time reading so set prevval to match current value
			attrptr->prevval=attrptr->val;
			attrptr->invalchangedtime=curtime.tv_sec;
		} else if (attrptr->prevval!=attrptr->val) {
			//Compare prevval with val and only if different update time
			debuglibifaceptr->debuglib_printf(1, "%s:   Value changed from %s\n", __func__, attrptr->prevval.toString().c_str());
			//Set time that the value changed for syncing operations
			attrptr->invalchangedtime=curtime.tv_sec;
		}
		//Always update the inval time
		attrptr->invaltime=curtime.tv_sec;
	}
	zigbeelib_markzigbee_notinuse(&zigbeedevices[idx], localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

	MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee public profile read attribute command response
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_read_attribute_response(int localzigbeeindex, zigbee_zcl_command_read_attributes_response_t *zcldata, uint8_t zcllen, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, int UNUSED(hasmanu), long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint8_t attrsize;
  uint16_t attrlen, attributeid;
  uint8_t zcl_status;

  MOREDEBUG_ENTERINGFUNC();

  attrlen=zcllen;
  while (attrlen>0) {
    attributeid=le16toh(zcldata->attr);
    zcl_status=zcldata->status;
    if (zcl_status!=ZIGBEE_ZCL_STATUS_SUCCESS) {
      //NOTE: The attribute data type and attribute value are only included if status = SUCCESS
      debuglibifaceptr->debuglib_printf(1, "%s: Attribute Error: %s (%02hhX) from Zigbee device: %04hX clusterid: %04hX, attribute=%04hX, Manu: %04hX\n", __func__, zigbeelib_get_zigbee_zclstatus_string(zcl_status), zcl_status, netaddr, clusterid, attributeid, manu);
      attrsize=3; //Attribute Id, Status
    } else {
      zigbeelib_decode_zigbee_home_automation_attribute(localzigbeeindex, netaddr, endpoint, clusterid, manu, attributeid, zcl_status, zcldata->attrtype, (zigbee_attrval_t *) &zcldata->value, &attrsize, localzigbeelocked, zigbeelocked);
      if (attrsize==0xff) {
        //An unsupported data type was encounted so stop parsing
        break;
      }
      attrsize+=4; //Attribute Id, Status, Attribute Data Type
    }
    //Step to the next attribute in the zcldata
    zcldata=(zigbee_zcl_command_read_attributes_response_t *) (((char *) zcldata)+attrsize);
    attrlen-=attrsize;
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee public profile write attribute command response
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_write_attribute_response(int UNUSED(localzigbeeindex), uint16_t UNUSED(netaddr), uint16_t UNUSED(clusterid), uint16_t UNUSED(manu), int UNUSED(hasmanu), long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();

  MOREDEBUG_ENTERINGFUNC();
  //TODO: Implement processing of the write attribute response

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee public profile discover attributes command response
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_discover_attributes_response(int localzigbeeindex, int zigbeeidx, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint8_t i, numattrs;
  uint16_t attrval;
  zigbee_zcl_command_discover_attributes_response_t *zcldiscattrresp;

  MOREDEBUG_ENTERINGFUNC();
  zcldiscattrresp=(zigbee_zcl_command_discover_attributes_response_t *) &(zclcmd->zigbeepayload);

  debuglibifaceptr->debuglib_printf(1, "%s: Zigbee Device: %04" PRIX16 " Endpoint ID=%02" PRIX8", Cluster: %s (%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 ")\n", __func__, zclcmd->srcnetaddr, zclcmd->srcendpnt, zigbeelib_get_zigbee_clusterid_string(zclcmd->clusterid).c_str(), zclcmd->clusterid, zigbeelib_get_zigbee_manufacturer_string(zclcmd->manu).c_str(), zclcmd->manu);
  numattrs=(zclcmd->zigbeelength-1)/(sizeof(uint16_t)+sizeof(uint8_t));
  attrval=0;
	if (numattrs>0) {
		for (i=0; i<numattrs; i++) {
			debuglibifaceptr->debuglib_printf(1, "%s:   Attribute: %s (%04" PRIX16 ") Data Type: %s (%02" PRIX8 ")\n", __func__, zigbeelib_get_zigbee_attrid_string(zclcmd->clusterid, zclcmd->manu, zcldiscattrresp->attrinfo[i].attr).c_str(), zcldiscattrresp->attrinfo[i].attr, zigbeelib_get_zigbee_attrdatatype_string(zcldiscattrresp->attrinfo[i].attrtype).c_str(), zcldiscattrresp->attrinfo[i].attrtype);
			attrval=zcldiscattrresp->attrinfo[i].attr;
		}
	} else {
		debuglibifaceptr->debuglib_printf(1, "%s:   No Attributes\n", __func__);
	}
  if (!zcldiscattrresp->disccompl) {
    uint8_t localzigbee_haendpointid;

    zigbeelib_lockzigbee(zigbeelocked);
    localzigbee_haendpointid=zigbeelib_localzigbeedevices[localzigbeeindex].haendpointid;
    zigbeelib_unlockzigbee(zigbeelocked);

    //Scan the next 16 attributes
    if (!(zclcmd->frame_control & 4)) {
			//General attribute discovery
			zigbee_send_discover_attributes_request(localzigbeeindex, zigbeeidx, localzigbee_haendpointid, zclcmd->srcendpnt, zclcmd->clusterid, 0, attrval+1, 16, localzigbeelocked, zigbeelocked);
		} else {
			//Manufactuer specific attribute discovery
			zigbee_send_discover_attributes_request(localzigbeeindex, zigbeeidx, localzigbee_haendpointid, zclcmd->srcendpnt, zclcmd->clusterid, 1, attrval+1, 16, localzigbeelocked, zigbeelocked);
		}
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee public profile discover attributes command response
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_configure_reporting_response(int localzigbeeindex, int zigbeeidx, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint8_t i;
  int payloadpos;
  zigbee_zcl_command_configure_reporting_response_t *zclconfigrepresp;

  MOREDEBUG_ENTERINGFUNC();
  zclconfigrepresp=(zigbee_zcl_command_configure_reporting_response_t *) &(zclcmd->zigbeepayload);

  if (zclcmd->zigbeelength==1) {
    //All attributes were successful
    debuglibifaceptr->debuglib_printf(1, "%s: Reporting for Zigbee Device: %04hX Endpoint ID: %02hhX, ClusterID: %04hX was successfully configured\n", __func__, zclcmd->srcnetaddr, zclcmd->srcendpnt, zclcmd->clusterid);
  } else {
    debuglibifaceptr->debuglib_printf(1, "%s: Some Attributes failed when configuring reporting for Zigbee Device: %04hX Endpoint ID: %02hhX, ClusterID: %04hX\n", __func__, zclcmd->srcnetaddr, zclcmd->srcendpnt, zclcmd->clusterid);
    payloadpos=0;
    i=0;
    while (payloadpos<zclcmd->zigbeelength) {
      debuglibifaceptr->debuglib_printf(1, "%s:   Attribute: %04hX, Direction: %s (%d), Status: %s (%d)\n", __func__, zclconfigrepresp->statusrecord[i].attr, (zclconfigrepresp->statusrecord[i].direction==1) ? "Sending Report" : "Receive Report", zclconfigrepresp->statusrecord[i].direction, zigbeelib_get_zigbee_zclstatus_string(zclconfigrepresp->statusrecord[i].status), zclconfigrepresp->statusrecord[i].status);
      ++i;
      payloadpos+=sizeof(zigbee_zcl_configure_reporting_response_attribute_status_record_t);
    }
  }
  MOREDEBUG_EXITINGFUNC();
}


/*
  Process a Zigbee public profile report attribute command
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_report_attributes_response(int localzigbeeindex, zigbee_zcl_command_report_attributes_reponse_attr_record_t *zcldata, uint8_t zcllen, uint16_t netaddr, uint8_t endpoint, uint16_t clusterid, uint16_t manu, int UNUSED(hasmanu), long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  uint8_t attrsize;
  uint16_t attrlen, attributeid;

  MOREDEBUG_ENTERINGFUNC();

	debuglibifaceptr->debuglib_printf(1, "SUPER DEBUG %s: Received a report from netaddr: %04hX, clusterid: %s (0x%04" PRIX16 ")\n", __func__, netaddr, zigbeelib_get_zigbee_clusterid_string(clusterid).c_str(), clusterid);
  attrlen=zcllen;
  while (attrlen>0) {
    attributeid=le16toh(zcldata->attr);
    zigbeelib_decode_zigbee_home_automation_attribute(localzigbeeindex, netaddr, endpoint, clusterid, manu, attributeid, ZIGBEE_ZCL_STATUS_SUCCESS, zcldata->attrtype, (zigbee_attrval_t *) &zcldata->attrdata, &attrsize, localzigbeelocked, zigbeelocked);
    if (attrsize==0xff) {
      //An unsupported data type was encounted so stop parsing
      break;
    }
    attrsize+=3; //Attribute Id, Attribute Data Type
    zcldata=(zigbee_zcl_command_report_attributes_reponse_attr_record_t *) (((uint8_t *) zcldata)+attrsize);
    attrlen-=attrsize;
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee public profile discover attributes command response
  hasmanu: 1=The response constains the manufacturer id
*/
void zigbeelib_process_api_zigbee_public_profile_default_response(int localzigbeeindex, int zigbeeidx, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbee_zcl_command_default_response_t *zcldefaultresp;

  MOREDEBUG_ENTERINGFUNC();
  zcldefaultresp=(zigbee_zcl_command_default_response_t *) &(zclcmd->zigbeepayload);

  debuglibifaceptr->debuglib_printf(1, "%s: Receive ZCL Default Response from Zigbee Device: %04hX Endpoint ID: %02hhX, ClusterID: %04hX for Command: %s (%02hhX), Status: %s (%02hhX)\n", __func__, zclcmd->srcnetaddr, zclcmd->srcendpnt, zclcmd->clusterid, zigbeelib_get_zigbee_zclcmd_string(zcldefaultresp->cmdid), zcldefaultresp->cmdid, zigbeelib_get_zigbee_zclstatus_string(zcldefaultresp->status), zcldefaultresp->status);

  MOREDEBUG_EXITINGFUNC();
}

/*
  Process a Zigbee ZCL Response Received
  Args: localzigbeeindex A pointer to local zigbee device structure used to store info about the device including the receive buffer containing the packet

zclcmd point to zigbee_zcl_response_received_header_t frame_control
*/
void zigbeelib_process_zcl_response_received(int localzigbeeindex, zigbee_zcl_command_with_manu_t *zclcmd, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int pos;
	uint8_t srcendpoint;
  uint16_t srcnetaddr, clusterid, manu;
  uint8_t frame_control, command;
  int hasmanu;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();

  srcnetaddr=zclcmd->srcnetaddr;
	srcendpoint=zclcmd->srcendpnt;
  clusterid=zclcmd->clusterid;
  manu=0;
  hasmanu=0;
  frame_control=zclcmd->frame_control;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  auto &zigbeedevices=localzigbeedeviceptr->zigbeedevices;

  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  pos=zigbeelib_find_zigbee_device(localzigbeeindex, 0x000000000000FFFF, srcnetaddr, localzigbeelocked, zigbeelocked);
  if (pos!=-1) {
    struct timespec curtime;

    if (zigbeelib_markzigbee_inuse(&zigbeedevices[pos], localzigbeelocked, zigbeelocked)<0) {
      //Failed to mark zigbee device as inuse
      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
    clock_gettime(CLOCK_REALTIME, &curtime);
    zigbeedevices[pos].lastresponsetime=curtime.tv_sec;
    zigbeedevices[pos].timeoutcnt=0;

    if (zigbeedevices[pos].notconnected) {
      //Mark the zigbee device as connected as we have received a packet
      zigbeedevices[pos].notconnected=0;

			//Reconfigure reporting and assume pending attribute requests in case the device has lost them
			for (auto &endpointit : zigbeedevices[pos].endpoints) {
				for (auto &clusterit : endpointit.second.iclusters) {
					clusterit.second.isbound=0;
					for (auto &manuit : clusterit.second.attrs) {
						for (auto &attrit : manuit.second) {
							attrit.second.requestpending=false;
							attrit.second.reportingconfigured=0;
							attrit.second.fastreportingconfigured=false;
						}
					}
				}
			}
      debuglibifaceptr->debuglib_printf(1, "%s: Marking Zigbee device: %016llX, %04hX as connected as a packet has been received\n", __func__, zigbeedevices[pos].addr, zigbeedevices[pos].netaddr);
    }
  }
  //NOTE: As long as we have the zigbee marked inuse we don't need to lock unless accessing variables from the localzigbee or zigbee
  zigbeelib_unlockzigbee(zigbeelocked);

  if (zclcmd->cmdid!=ZIGBEE_ZCL_CMD_REPORT_ATTRIB) {
    //Report Attribute command is never a reponse to a Zigbee request
    zigbeelib_send_queue_match_zcl_response(localzigbeeindex, 0, srcnetaddr, clusterid, &zclcmd->seqnumber, localzigbeelocked, zigbeelocked);
  }
  if ( (frame_control & 0x3)==0) {
    //Command acts across the entire profile
    if ( ((frame_control >> 2) & 1)==1) {
      hasmanu=1;
      manu=zclcmd->manu;
    } else {
      manu=0;
    }
    command=zclcmd->cmdid; //The command from the device
    if ( ((frame_control >> 3) & 1)!=1) {
      debuglibifaceptr->debuglib_printf(1, "%s: Received packet with wrong direction from Zigbee device: %04hX clusterid: %04hX\n", __func__, srcnetaddr, clusterid);
    }
    switch (command) {
      case ZIGBEE_ZCL_CMD_READ_ATTRIB_RESP:
        zigbeelib_process_api_zigbee_public_profile_read_attribute_response(localzigbeeindex, (zigbee_zcl_command_read_attributes_response_t *) &zclcmd->zigbeepayload, zclcmd->zigbeelength, srcnetaddr, srcendpoint, clusterid, manu, hasmanu, localzigbeelocked, zigbeelocked);
        break;
      case ZIGBEE_ZCL_CMD_WRITE_ATTRIB_RESP:
        zigbeelib_process_api_zigbee_public_profile_write_attribute_response(localzigbeeindex, srcnetaddr, clusterid, manu, hasmanu, localzigbeelocked, zigbeelocked);
        break;
      case ZIGBEE_ZCL_CMD_DISC_ATTRIB_RESP:
        zigbeelib_process_api_zigbee_public_profile_discover_attributes_response(localzigbeeindex, pos, zclcmd, localzigbeelocked, zigbeelocked);
        break;
      case ZIGBEE_ZCL_CMD_CONFIG_REPORT_RESP:
        zigbeelib_process_api_zigbee_public_profile_configure_reporting_response(localzigbeeindex, pos, zclcmd, localzigbeelocked, zigbeelocked);
        break;
      case ZIGBEE_ZCL_CMD_REPORT_ATTRIB:
        zigbeelib_process_api_zigbee_public_profile_report_attributes_response(localzigbeeindex, (zigbee_zcl_command_report_attributes_reponse_attr_record_t *) &zclcmd->zigbeepayload, zclcmd->zigbeelength, srcnetaddr, srcendpoint, clusterid, manu, hasmanu, localzigbeelocked, zigbeelocked);
        break;
      case ZIGBEE_ZCL_CMD_DEFAULT_RESP:
        zigbeelib_process_api_zigbee_public_profile_default_response(localzigbeeindex, pos, zclcmd, localzigbeelocked, zigbeelocked);
        break;
      default:
        debuglibifaceptr->debuglib_printf(1, "%s: Received unhandled command: %s %02hhX from Zigbee device: %04hX clusterid: %04hX\n", __func__, zigbeelib_get_zigbee_zclcmd_string(command), command, srcnetaddr, clusterid);
        break;
    }
  } else {
    //Cluster specific command
    command=zclcmd->cmdid; //The command from the device

    debuglibifaceptr->debuglib_printf(1, "%s: Unknown cluster specific command received from Zigbee device: %04hX clusterid: %04hX, Command ID: %02hhX\n", __func__, srcnetaddr, clusterid, command);
  }
  if (pos!=-1) {
    zigbeelib_markzigbee_notinuse(&zigbeedevices[pos], localzigbeelocked, zigbeelocked);
  }
  //Call add zigbee device in case the device hasn't been added yet but call after packet processing as
  //  packet processing might be able to add the device with more info
  zigbeelib_add_zigbee_device(localzigbeeindex, 0x000000000000FFFF, srcnetaddr, ZIGBEE_DEVICE_TYPE_UKN, ZIGBEE_RXONIDLE_UKN, localzigbeelocked, zigbeelocked);

  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

void process_zcl_response_timeout(int localzigbeeindex, uint16_t netaddr, uint16_t clusterid, uint8_t *seqnumber, long *localzigbeelocked, long *zigbeelocked) {
  zigbeelib_send_queue_match_zcl_response(localzigbeeindex, 1, netaddr, clusterid, seqnumber, localzigbeelocked, zigbeelocked);
}




//=========================
//End of Protocol Functions
//=========================

/*
  Thread safe find a local zigbee device in the local zigbee table
  Arguments:
    addr: The 64-bit destination IEEE address of the device
  Returns the index of the local zigbee device or -1 if not found
  NOTE: Returns -1 if the local zigbee is marked as needtoremove
*/
int zigbeelib_find_local_zigbee_device(uint64_t addr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i, numlocalzigbeedevices;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee();
	numlocalzigbeedevices=_zigbeelib_getnumlocalzigbeedevices();
	for (i=0; i<numlocalzigbeedevices; i++) {
		if (zigbeelib_localzigbeedevices[i].removed || zigbeelib_localzigbeedevices[i].needtoremove) {
			continue;
		}
		if (zigbeelib_localzigbeedevices[i].addr==addr) {
			break;
		}
	}
  zigbeelib_unlockzigbee();

	if (i!=numlocalzigbeedevices) {
		return i;
	}
	debuglibifaceptr->debuglib_printf(1, "%s: Failed to find local zigbee device: %016" PRIX64 "\n", __func__, addr);

	MOREDEBUG_EXITINGFUNC();
  return -1;
}

/*
  Thread safe find a local zigbee device in the local zigbee table and
    atomically mark in use
  Arguments:
    addr: The 64-bit destination IEEE address of the device
  Returns the index of the local zigbee device or -1 if not found
  NOTE: Returns -1 if the local zigbee is marked as needtoremove
  NOTE2: Unlocks mutex on exit as once marked in use the local zigbee device will stay available
*/
int zigbeelib_find_local_zigbee_device_and_use(uint64_t addr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i, numlocalzigbeedevices;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee();
	numlocalzigbeedevices=_zigbeelib_getnumlocalzigbeedevices();
	for (i=0; i<numlocalzigbeedevices; i++) {
		if (zigbeelib_localzigbeedevices[i].removed || zigbeelib_localzigbeedevices[i].needtoremove) {
			continue;
		}
		if (zigbeelib_localzigbeedevices[i].addr==addr) {
			break;
		}
	}
	if (i!=numlocalzigbeedevices) {
		if (zigbeelib_marklocalzigbee_inuse(&zigbeelib_localzigbeedevices[i])<0) {
			//Failed to mark local zigbee as inuse
			zigbeelib_unlockzigbee();
			debuglibifaceptr->debuglib_printf(1, "%s: Unable to mark local zigbee: %016" PRIX64 " in use\n", __func__, addr);
			i=-1;
		} else {
			//Success so keep i as is
		}
	} else {
		debuglibifaceptr->debuglib_printf(1, "%s: Failed to find local zigbee device: %016" PRIX64 "\n", __func__, addr);
		i=-1;
	}
  zigbeelib_unlockzigbee();

	MOREDEBUG_EXITINGFUNC();
  return i;
}

/*
  Thread safe find a zigbee device in the zigbee table
  Arguments:
    localzigbeeindex An index to the local zigbee structure associated with the device
    addr: The 64-bit destination IEEE address of the device or 0x000000000000FFFF to not search 64-bit address
    netaddr: The 16-bit destination network address of the device or 0xFFFF to not search 16-bit address
  Returns the index of the zigbee device or -1 if not found or marked for removal
*/
int zigbeelib_find_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int match_found=-1;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee();
  if (!_zigbeelib_validate_localzigbeeindex(localzigbeeindex)) {
    zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Local Zigbee Index out of range: %d\n", __func__, localzigbeeindex);
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to mark local zigbee in use\n", __func__);
    return -1;
  }
  //Search the cache to see if we can match one of the addresses
  if (addr!=0x0000000000000000 && addr!=0x000000000000FFFF && addr!=0xFFFFFFFFFFFFFFFF) {
		try {
			//Can search with 64-bit address as not a broadcast
			int16_t zigbeeidx=localzigbeedeviceptr->zigbeedeviceaddr.at(addr);
			if (!localzigbeedeviceptr->zigbeedevices[zigbeeidx].removed && !localzigbeedeviceptr->zigbeedevices[zigbeeidx].needtoremove) {
				//This Zigbee device should be available
				match_found=zigbeeidx;
			}
		} catch (std::out_of_range& e) {
			//Do nothing
		}
	}
	if (match_found==-1 && netaddr<0xFFFC) {
		//Search with 16-bit address
		try {
			//Can search with 64-bit address as not a broadcast
			int16_t zigbeeidx=localzigbeedeviceptr->zigbeedevicenetaddr.at(netaddr);
			if (!localzigbeedeviceptr->zigbeedevices[zigbeeidx].removed && !localzigbeedeviceptr->zigbeedevices[zigbeeidx].needtoremove) {
				//This Zigbee device should be available
				match_found=zigbeeidx;
			}
		} catch (std::out_of_range& e) {
			//Do nothing
		}
	}
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr);

  zigbeelib_unlockzigbee();

  if (match_found==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to find zigbee device: %016" PRIX64 ", %04" PRIX16 " on local zigbee: %d\n", __func__, addr, netaddr, localzigbeeindex);
  }
  MOREDEBUG_EXITINGFUNC();
  return match_found;
}
int zigbeelib_find_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
	return zigbeelib_find_zigbee_device(localzigbeeindex, addr, netaddr);
}

/*
  Thread safe find a zigbee device in the zigbee table and
    atomically mark in use
  Arguments:
    localzigbeeindex An index to the local zigbee structure associated with the device
    addr: The 64-bit destination IEEE address of the device or 0x000000000000FFFF to not search 64-bit address
    netaddr: The 16-bit destination network address of the device or 0xFFFF to not search 16-bit address
  Returns the index of the zigbee device or -1 if not found or marked for removal
  NOTE: Unlocks mutex on exit as once marked in use the zigbee device will stay available
  NOTE2: Doesn't keep local zigbee marked in use as marking zigbee in use will also mark its parent local zigbee in use
    so caller only needs to unmark zigbee inuse and not local zigbee
*/
int zigbeelib_find_zigbee_device_and_use(int localzigbeeindex, uint64_t addr, uint16_t netaddr) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int match_found=-1;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee();
  if (!_zigbeelib_validate_localzigbeeindex(localzigbeeindex)) {
    zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Local Zigbee Index out of range: %d\n", __func__, localzigbeeindex);
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Unable to mark local zigbee in use\n", __func__);
    return -1;
  }
  //Search the cache to see if we can match one of the addresses
  if (addr!=0x0000000000000000 && addr!=0x000000000000FFFF && addr!=0xFFFFFFFFFFFFFFFF) {
		try {
			//Can search with 64-bit address as not a broadcast
			int16_t zigbeeidx=localzigbeedeviceptr->zigbeedeviceaddr.at(addr);
			if (!localzigbeedeviceptr->zigbeedevices[zigbeeidx].removed && !localzigbeedeviceptr->zigbeedevices[zigbeeidx].needtoremove) {
				//This Zigbee device should be available
				match_found=zigbeeidx;
			}
		} catch (std::out_of_range& e) {
			//Do nothing
		}
	}
	if (match_found==-1 && netaddr<0xFFFC) {
		//Search with 16-bit address
		try {
			//Can search with 64-bit address as not a broadcast
			int16_t zigbeeidx=localzigbeedeviceptr->zigbeedevicenetaddr.at(netaddr);
			if (!localzigbeedeviceptr->zigbeedevices[zigbeeidx].removed && !localzigbeedeviceptr->zigbeedevices[zigbeeidx].needtoremove) {
				//This Zigbee device should be available
				match_found=zigbeeidx;
			}
		} catch (std::out_of_range& e) {
			//Do nothing
		}
	}
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr);

  if (match_found==-1) {
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to find zigbee device: %016" PRIX64 ", %04" PRIX16 " on local zigbee: %d\n", __func__, addr, netaddr, localzigbeeindex);
  } else {
		//NOTE: This is okay even after local zigbee unmark as it is all within a mutex lock
		//  Parent library also won't be able to release its device until this local zigbee is marked not in use
		if (zigbeelib_markzigbee_inuse(&localzigbeedeviceptr->zigbeedevices[match_found])<0) {
			//Failed to mark zigbee device as inuse
			debuglibifaceptr->debuglib_printf(1, "%s: Unable to mark zigbee device: %016" PRIX64 ", %04" PRIX16 " in use\n", __func__, addr, netaddr);
			match_found=-1;
		}
	}
  zigbeelib_unlockzigbee();

  MOREDEBUG_EXITINGFUNC();
  return match_found;
}

/*
  Thread safe add a zigbee device to the local zigbee table if not already added
  Arguments:
    localzigbeeindex An index to the local zigbee structure associated with the device
    addr: The 64-bit destination IEEE address of the device
    netaddr: The 16-bit destination network address of the device
  Returns the index of the zigbee device or -1 if ignored (broadcast address) or on error
*/
int zigbeelib_add_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, char devicetype, char rxonidle, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int16_t i, match_found=-1;
  localzigbeedevice_t *localzigbeedeviceptr;
  std::map<int16_t, zigbeedevice_t>::iterator zigbeedeviceit;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark rapidha as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  //Search the cache to see if we can match one of the addresses
  try {
		if (addr!=0x0000000000000000 && addr!=0x000000000000FFFF && addr!=0xFFFFFFFFFFFFFFFF) {
			match_found=localzigbeedeviceptr->zigbeedeviceaddr.at(addr);
		}
	} catch (std::out_of_range& e) {
		//Do nothing
	}
	if (match_found==-1) {
		try {
			if (netaddr<0xFFFC) {
				match_found=localzigbeedeviceptr->zigbeedevicenetaddr.at(netaddr);
			}
		} catch (std::out_of_range& e) {
			//Do nothing
		}
	}
	if (match_found!=-1 && localzigbeedeviceptr->zigbeedevices.at(match_found).needtoremove) {
		//We are re-adding the device as a new entry so clear references to the old entry
		match_found=-1;
		localzigbeedeviceptr->zigbeedeviceaddr.erase(addr);
		localzigbeedeviceptr->zigbeedevicenetaddr.erase(netaddr);
	}
  if (match_found==-1) {
    //Zigbee device not found so add it
    switch (addr) {
      case 0x0000000000000000:
      case 0x000000000000FFFF:
      case 0xFFFFFFFFFFFFFFFF:
        addr=0x000000000000FFFF;
        break;
      default:
        break;
    }
    if (netaddr>=0xFFFC) {
      if (devicetype==ZIGBEE_DEVICE_TYPE_COORDINATOR || devicetype==ZIGBEE_DEVICE_TYPE_ROUTER) {
        netaddr=0xFFFC; //Broadcast to all routers and coordinator
      } else if (rxonidle==1) {
        netaddr=0xFFFD; //Broadcast to all Non-Sleepy Devices
      } else {
        netaddr=0xFFFF; //Broadcast to all Devices
      }
    }
    //First search for an empty slot id
    for (i=0; i<INT16_MAX; i++) {
			if (localzigbeedeviceptr->zigbeedevices.find(i)==localzigbeedeviceptr->zigbeedevices.end()) {
				break;
			}
		}
    if (i==INT16_MAX) {
      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
      zigbeelib_unlockzigbee(zigbeelocked);
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d zigbee devices has been reached\n", __func__, INT16_MAX);
      MOREDEBUG_EXITINGFUNC();
      return -1;
    }
    debuglibifaceptr->debuglib_printf(1, "%s: Adding Zigbee device: %016llX, %04hX to zigbee table at index: %d for %s device: %016llX\n", __func__, addr, netaddr, i, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr);
		localzigbeedeviceptr->zigbeedevices.insert( std::pair<int16_t, zigbeedevice_t>(i, zigbeedevice()) );
    zigbeedeviceit=localzigbeedeviceptr->zigbeedevices.find(i);

		zigbeedeviceit->second.addr=addr;
		zigbeedeviceit->second.netaddr=netaddr;
    zigbeedeviceit->second.parentlocaldevice=localzigbeedeviceptr;
    zigbeedeviceit->second.devicetype=devicetype;
    zigbeedeviceit->second.rxonidle=rxonidle;

		if (addr!=0x0000000000000000 && addr!=0x000000000000FFFF && addr!=0xFFFFFFFFFFFFFFFF) {
			localzigbeedeviceptr->zigbeedeviceaddr[addr]=i;
		}
		if (netaddr<0xFFFC) {
			localzigbeedeviceptr->zigbeedevicenetaddr[netaddr]=i;
		}
    //New device

    //find_zigbee_devices now handles calling get_zigbee_info
    if (zigbeedeviceit->second.devicetype!=ZIGBEE_DEVICE_TYPE_UKN && zigbeedeviceit->second.rxonidle!=ZIGBEE_RXONIDLE_UKN) {
      //Only get zigbee info if the device type and rxonidle value are known
      zigbeelib_get_zigbee_info(localzigbeeindex, addr, netaddr, i, localzigbeelocked, zigbeelocked);
    }
  } else {
    int devicetypenowknown=0, rxonidlenowknown=0;

    //Check if we can fill in missing info
    zigbeedeviceit=localzigbeedeviceptr->zigbeedevices.find(match_found);

    if (zigbeedeviceit->second.netaddr!=netaddr && netaddr<0xFFFC && zigbeedeviceit->second.netaddr<0xFFFC) {
      //The network address has changed so this might be a rejoin and we need to reset some values
      debuglibifaceptr->debuglib_printf(1, "%s: 16-bit address for Zigbee device: %016" PRIX64 " has changed from %04" PRIX16 " to %04" PRIX16 "\n", __func__, addr, zigbeedeviceit->second.netaddr, netaddr);

      zigbeedeviceit->second.notconnected=0;

			//Reconfigure reporting and assume pending attribute requests in case the device has lost them
			for (auto &endpointit : zigbeedeviceit->second.endpoints) {
				for (auto &clusterit : endpointit.second.iclusters) {
					clusterit.second.isbound=0;
					for (auto &manuit : clusterit.second.attrs) {
						for (auto &attrit : manuit.second) {
							attrit.second.requestpending=false;
							attrit.second.reportingconfigured=0;
							attrit.second.fastreportingconfigured=false;
						}
					}
				}
			}
      //Remove all packets queued to send to the destination as they are most likely all timing out
      {
        int i;

        for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
          if (localzigbeedeviceptr->sendqueue_items[i].inuse && localzigbeedeviceptr->sendqueue_items[i].send_netaddr==zigbeedeviceit->second.netaddr) {
            __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
          }
        }
      }
      localzigbeedeviceptr->zigbeedevicenetaddr.erase(zigbeedeviceit->second.netaddr);
			localzigbeedeviceptr->zigbeedevicenetaddr[netaddr]=match_found;
      zigbeedeviceit->second.netaddr=netaddr;
    }
    if (netaddr<0xFFFC && zigbeedeviceit->second.netaddr>=0xFFFC) {
      debuglibifaceptr->debuglib_printf(1, "%s: Adding missing 16-bit address: %04" PRIX16 " for Zigbee device: %016" PRIX64 "\n", __func__, netaddr, addr);
      zigbeedeviceit->second.netaddr=netaddr;
			localzigbeedeviceptr->zigbeedevicenetaddr[netaddr]=match_found;
    }
    if (addr!=0x0000000000000000 && addr!=0x000000000000FFFF && addr!=0xFFFFFFFFFFFFFFFF && zigbeedeviceit->second.addr==0x000000000000FFFF) {
      debuglibifaceptr->debuglib_printf(1, "%s: Adding missing 64-bit address: %016" PRIX64 " for Zigbee device: %04" PRIX16 "\n", __func__, addr, netaddr);
      zigbeedeviceit->second.addr=addr;
			localzigbeedeviceptr->zigbeedeviceaddr[addr]=match_found;
    }
    if (zigbeedeviceit->second.devicetype!=devicetype && zigbeedeviceit->second.devicetype==ZIGBEE_DEVICE_TYPE_UKN) {
      zigbeedeviceit->second.devicetype=devicetype;
      devicetypenowknown=1;
    }
    if (zigbeedeviceit->second.rxonidle!=rxonidle && zigbeedeviceit->second.rxonidle==ZIGBEE_RXONIDLE_UKN) {
      zigbeedeviceit->second.rxonidle=rxonidle;
      rxonidlenowknown=1;
    }
    if (devicetypenowknown && rxonidlenowknown) {
      //Get zigbee info now that the device type and rxonidle value are known
      zigbeelib_get_zigbee_info(localzigbeeindex, addr, netaddr, match_found, localzigbeelocked, zigbeelocked);
    }
  }
  if (zigbeedeviceit->second.addr==0x000000000000FFFF) {
    //Get the 64-bit address from the device as we don't have it yet
    zigbeelib_send_zigbee_zdo_ieee_address_request_request(localzigbeeindex, 0x000000000000FFFF, zigbeedeviceit->second.netaddr, 0x00, localzigbeelocked, zigbeelocked);
  }
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return match_found;
}

/*
  Remove a zigbee device from the local zigbee table
  Arguments:
    localzigbeeindex An index to the local zigbee structure associated with the device
    addr: The 64-bit destination IEEE address of the device
    netaddr: The 16-bit destination network address of the device
  Returns the index of the zigbee device or -1 if ignored (broadcast address) or on error
*/
int zigbeelib_remove_zigbee_device(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int match_found=-1;
	size_t numzigbeedevices;
  char *localzigbee_devicetype;
  uint64_t localzigbee_addr;
  localzigbeedevice_t *localzigbeedeviceptr;
  zigbeedevice_t *zigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark rapidha as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  //Search the cache to see if we can match one of the addresses
  match_found=zigbeelib_find_zigbee_device(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
  if (match_found==-1) {
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[match_found];
  zigbeedeviceptr->needtoremove=1;

  localzigbee_devicetype=localzigbeedeviceptr->devicetype;
  localzigbee_addr=localzigbeedeviceptr->addr;
  numzigbeedevices=localzigbeedeviceptr->zigbeedevices.size();
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016llX, %04hX has been scheduled for removal from zigbee table for %s device: %016llX, numdevices=%d\n", __func__, addr, netaddr, localzigbee_devicetype, localzigbee_addr, numzigbeedevices);

  MOREDEBUG_EXITINGFUNC();

  return match_found;
}

/*
  Remove zigbee devices from the local zigbee table
  Arguments:
    localzigbeeindex An index to the local zigbee structure associated with the device
    addr: The 64-bit destination IEEE address of the device
    netaddr: The 16-bit destination network address of the device
  Returns the index of the zigbee device or -1 if ignored (broadcast address) or on error
*/
void zigbeelib_remove_all_zigbee_devices(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];

  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark rapidha as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
    if (!zigbeedeviceit.second.removed && !zigbeedeviceit.second.needtoremove) {
      zigbeedeviceit.second.needtoremove=1;
      debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016llX, %04hX has been scheduled for removal from zigbee table for %s device: %016llX, numdevices=%d\n", __func__, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr, localzigbeedeviceptr->zigbeedevices.size());
    }
  }
  //Enable Re-broadcast for Zigbee devices
  localzigbeedeviceptr->broadcastcount=0;

  //Normally when removing all zigbee devices it is because there is a problem with the ZigBee network so
  //  we need to start again with sending all packets
  for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
    if (localzigbeedeviceptr->sendqueue_items[i].inuse) {
      __zigbeelib_send_queue_remove_packet(localzigbeeindex, i, localzigbeelocked, zigbeelocked);
    }
  }
  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);

  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();
}

/*
  Find a Zigbee device's endpoint structure for the specified profile id
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
  Returns: A pointer to endpoint structure if found or NULL if not found
*/
//NOTE: You should mark the zigbee device inuse before calling this function
STATIC zigbeeendpoint_t *zigbeelib_find_zigbee_endpointptr_match_profile(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zigbeeendpoint_t *endpointptr=NULL;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  for (auto &endpointit : zigbeedeviceptr->endpoints) {
    if (endpointit.second.profile==profileid) {
      endpointptr=&endpointit.second;
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return endpointptr;
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return NULL;
}

/*
  Find a Zigbee device's endpoint id for the specified profile id
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
  Returns: The endpoint id if found or 0 if not found (We haven't seen any zigbee devices that return an endpoint id of 0 in its list
*/
STATIC uint8_t zigbeelib_find_zigbee_endpoint_match_profile(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zigbeeendpoint_t *endpointptr;
  uint8_t endpointid;

  MOREDEBUG_ENTERINGFUNC();
  //The profileid is set at the same time as numendpoints so we should only need a small lock to get numendpoints value
  zigbeelib_lockzigbee(zigbeelocked);
  if (zigbeelib_markzigbee_inuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  endpointptr=zigbeelib_find_zigbee_endpointptr_match_profile(zigbeedeviceptr, profileid, localzigbeelocked, zigbeelocked);
  if (endpointptr) {
    endpointid=endpointptr->id;
  } else {
    endpointid=0;
  }
  //Mark zigbee as not longer in use as we are returning a copy of the endpoint id
  zigbeelib_markzigbee_notinuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return endpointid;
}

/*
  Find a Zigbee device's endpoint structure for the specified profile id and input cluster id
  Unlocked version
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
        oclusterid The cluster id to search for
  Returns: A pointer to endpoint structure if found or NULL if not found
*/
//NOTE: You should mark the zigbee device inuse before calling this function
STATIC zigbeeendpoint_t *_zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zigbeeendpoint_t *endpointptr=NULL;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);

  for (auto &endpointit : zigbeedeviceptr->endpoints) {
    if (endpointit.second.profile==profileid) {
      try {
        if (endpointit.second.iclusters.at(iclusterid).id) {
          endpointptr=&endpointit.second;
          zigbeelib_unlockzigbee(zigbeelocked);
          MOREDEBUG_EXITINGFUNC();
          return endpointptr;
        }
      } catch (std::out_of_range& e) {
        //Cluster ID not found; do nothing
      }
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return NULL;
}

/*
  Find a Zigbee device's endpoint structure for the specified profile id and input cluster id
  Thread Safe lock version
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
        oclusterid The cluster id to search for
  Returns: A pointer to endpoint structure if found or NULL if not found
*/
STATIC zigbeeendpoint_t *zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked) {
  return _zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedeviceptr, profileid, iclusterid, localzigbeelocked, zigbeelocked);
}

/*
  Find a Zigbee device's endpoint id for the specified profile id and input cluster id
  Unlocked version
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
        oclusterid The cluster id to search for
  Returns: The endpoint id if found or 0 if not found (We haven't seen any zigbee devices that return an endpoint id of 0 in its list
*/
STATIC uint8_t _zigbeelib_find_zigbee_endpoint_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  zigbeeendpoint_t *endpointptr;
  uint8_t endpointid;

  MOREDEBUG_ENTERINGFUNC();
  zigbeelib_lockzigbee(zigbeelocked);
  if (zigbeelib_markzigbee_inuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark zigbee device as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  endpointptr=_zigbeelib_find_zigbee_endpointptr_match_profile_match_icluster(zigbeedeviceptr, profileid, iclusterid, localzigbeelocked,  zigbeelocked);
  if (endpointptr) {
    endpointid=endpointptr->id;
  } else {
    endpointid=0;
  }
  //Mark zigbee as not longer in use as we are returning a copy of the endpoint id
  zigbeelib_markzigbee_notinuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked);
  zigbeelib_unlockzigbee(zigbeelocked);
  MOREDEBUG_EXITINGFUNC();

  return endpointid;
}

/*
  Find a Zigbee device's endpoint id for the specified profile id and input cluster id
  Thread Safe lock version
  Args: zigbeedeviceptr A pointer to the Zigbee structure
        profileid The profile id to search for
        oclusterid The cluster id to search for
  Returns: The endpoint id if found or 0 if not found (We haven't seen any zigbee devices that return an endpoint id of 0 in its list
*/
STATIC uint8_t zigbeelib_find_zigbee_endpoint_match_profile_match_icluster(zigbeedevice_t *zigbeedeviceptr, uint16_t profileid, uint16_t iclusterid, long *localzigbeelocked, long *zigbeelocked) {
  return _zigbeelib_find_zigbee_endpoint_match_profile_match_icluster(zigbeedeviceptr, profileid, iclusterid, localzigbeelocked, zigbeelocked);
}

//Get info about a detected Zigbee device on a local zigbee device
void zigbeelib_get_zigbee_info(int localzigbeeindex, uint64_t addr, uint16_t netaddr, int pos, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  zigbeedevice_t *zigbeedevice;
  char havemanu;
  bool havebasicclusterendpointid;
  bool havebasicclusterinfo;
  bool basicinfonotrecognised;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  zigbeedevice=&localzigbeedeviceptr->zigbeedevices[pos];
  havemanu=zigbeedevice->havemanu;
  havebasicclusterendpointid=zigbeedevice->havebasicclusterendpointid;
  havebasicclusterinfo=zigbeedevice->havebasicclusterinfo;
  basicinfonotrecognised=zigbeedevice->basicinfonotrecognised;
  zigbeelib_unlockzigbee(zigbeelocked);

  if (zigbeedevice->devicetype!=ZIGBEE_DEVICE_TYPE_END_DEVICE) {
    //Scan for devices that this Zigbee device knows about
    //NOTE: Broadcast is more efficient than sending to each individual device but with unicast we can detect timeouts and match send status reports more easily
    debuglibifaceptr->debuglib_printf(1, "%s: Scanning for Zigbee devices known by ZigBee device=%016" PRIX64 ", %04" PRIX16 "\n", __func__, addr, netaddr);
    zigbeelib_send_zigbee_zdo_management_neighbor_table_request(localzigbeeindex, addr, netaddr, 0x00, localzigbeelocked, zigbeelocked);
  }
  if ((localzigbeedeviceptr->features&ZIGBEE_FEATURE_NOHACLUSTERS)!=ZIGBEE_FEATURE_NOHACLUSTERS || localzigbeedeviceptr->addr!=addr) {
		if (havebasicclusterendpointid==false) {
			uint16_t basiciclusters[1], basicoclusters[1];

			basiciclusters[0]=0x0000;
			basicoclusters[0]=0x0000;

			debuglibifaceptr->debuglib_printf(1, "%s: Scanning for home automation basic cluster endpoint from zigbee device=%016llX, %04hX, pos=%d\n", __func__, addr, netaddr, pos);
			zigbeelib_send_zigbee_zdo_match_descriptor_request(localzigbeeindex, addr, netaddr, ZIGBEE_HOME_AUTOMATION_PROFILE, 1, basiciclusters, 0, basicoclusters, localzigbeelocked, zigbeelocked);
		}
	} else {
		//Unable to read basic info from the local device
		zigbeelib_lockzigbee(zigbeelocked);
		zigbeedevice->basicinfonotrecognised=true;
		zigbeelib_unlockzigbee(zigbeelocked);
	}
  if (!basicinfonotrecognised) {
    //Don't get legacy info until we have attempted to match basic info with the database
    return;
  }
  if (!havemanu) {
    debuglibifaceptr->debuglib_printf(1, "%s: Scanning for node descriptor to get manufacturer info from zigbee device=%016llX, %04hX, pos=%d\n", __func__, addr, netaddr, pos);
    zigbeelib_send_zigbee_zdo_node_descriptor_request(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
  }
}

//Get active endpoints for a detected Zigbee device on a local zigbee device
void zigbeelib_get_zigbee_endpoints(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "%s: Scanning for endpoints from zigbee device=%016llX, %04hX\n", __func__, addr, netaddr);

  zigbeelib_send_zigbee_zdo_active_endpoints_request(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
}

//Get info for next endpoint that needs info for a detected Zigbee device on a local zigbee device
//Returns -1 if no more endpoints need info
//TODO: If more than one endpoint is on the device we should only send 1 request
//  at a time instead of sending all the requests at once
void zigbeelib_get_zigbee_next_endpoint_info(int localzigbeeindex, uint64_t addr, uint16_t netaddr, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  int pos;
  zigbeedevice_t *zigbeedeviceptr;
  uint64_t zigbeeaddr;
  uint16_t zigbeenetaddr;

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  pos=zigbeelib_find_zigbee_device(localzigbeeindex, addr, netaddr, localzigbeelocked, zigbeelocked);
  if (pos!=-1) {
    zigbeedeviceptr=&localzigbeedeviceptr->zigbeedevices[pos];
    if (zigbeelib_markzigbee_inuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
      //Failed to mark zigbee device as inuse
      zigbeelib_unlockzigbee(zigbeelocked);
      MOREDEBUG_EXITINGFUNC();
      return;
    }
    zigbeeaddr=zigbeedeviceptr->addr;
    zigbeenetaddr=zigbeedeviceptr->netaddr;
    for (auto const &endpointit : zigbeedeviceptr->endpoints) {
      uint8_t endpointid=endpointit.second.id;
      uint16_t endpointprofile=endpointit.second.profile;

      if (endpointprofile==0) {
        debuglibifaceptr->debuglib_printf(1, "%s: Scanning for endpoint info for endpoint: %d (simple descriptor request) from zigbee device=%016llX, pos=%d\n", __func__, endpointid, zigbeeaddr, pos);
        zigbeelib_send_zigbee_zdo_simple_descriptor_request(localzigbeeindex, zigbeeaddr, zigbeenetaddr, endpointid, localzigbeelocked, zigbeelocked);
      }
    }
    zigbeelib_markzigbee_notinuse(zigbeedeviceptr, localzigbeelocked, zigbeelocked);
  }
  zigbeelib_unlockzigbee(zigbeelocked);
}

/*
  Process a command sent by the user using the cmd network interface
  Input: buffer The command buffer containing the command
         clientsock The network socket for sending output to the cmd network interface
  Returns: A CMDLISTENER definition depending on the result
*/
STATIC int zigbeelib_processcommand(const char *buffer, int clientsock) {
  commonserverlib_ifaceptrs_ver_1_t *commonserverlibifaceptr=(commonserverlib_ifaceptrs_ver_1_t *) zigbeelib_deps[COMMONSERVERLIB_DEPIDX].ifaceptr;
  char tmpstrbuf[50];
	std::string tmpstring;
  int i, len, found;
  uint64_t addr, zigbeeaddr=0;
  long localzigbeelocked=0, zigbeelocked=0;

  if (!commonserverlibifaceptr) {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_ENTERINGFUNC();
  len=strlen(buffer);
  if (strncmp(buffer, "zigbee_enable_tempjoin", 22)==0) {
    //Format: zigbee_enable_tempjoin : Enable on all coordinators and routers but only if 1 local zigbee device is connected
		//        zigbee_enable_tempjoin <64-bit address> : Enable on all coordinators and routers on the same network as the specified address
		//        zigbee_enable_tempjoin <64-bit address> single : Enable on a single zigbee device
    zigbeelib_lockzigbee();
		if (len<39) {
			int localzigbeecnt=0;

			//Enable temporary joining on all coordinators and routers but only if 1 local Zigbee device is connected
			//First find out how many local zigbee devices are connected
			for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
				if (zigbeelib_marklocalzigbee_inuse(&zigbeelib_localzigbeedevices[i])<0) {
					//Unable to mark this local zigbee for use
					continue;
				}
				zigbeelib_marklocalzigbee_notinuse(&zigbeelib_localzigbeedevices[i]);
				++localzigbeecnt;
			}
			if (localzigbeecnt>1) {
				tmpstring="Unable to enable temp join on all zigbee devices when more than one local zigbee device is connected\n";
			} else {
				for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
					if (zigbeelib_marklocalzigbee_inuse(&zigbeelib_localzigbeedevices[i])<0) {
						//Unable to mark this local zigbee for use
						continue;
					}
					for (auto &zigbeedeviceit : zigbeelib_localzigbeedevices[i].zigbeedevices) {
						if (zigbeelib_markzigbee_inuse(&zigbeedeviceit.second)<0) {
							//Unable to mark this zigbee device for use
							continue;
						}
						if (zigbeedeviceit.second.devicetype!=ZIGBEE_DEVICE_TYPE_END_DEVICE) {
							zigbeelib_send_zigbee_zdo_management_permit_joining_request(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, ZIGBEE_TEMPJOIN_DURATION, 0, &localzigbeelocked, &zigbeelocked);
						}
						zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second);
					}
					zigbeelib_marklocalzigbee_notinuse(&zigbeelib_localzigbeedevices[i]);
					tmpstring="Enabled Zigbee Permit Joining on the Coordinator and all Routers\n";
				}
			}
		} else if (len<46) {
			//Enable temporary joining on all coordinators and routers on the same network as the specified address
			sscanf(buffer+23, "%016llX", (unsigned long long *) &addr);
			found=-1;
			for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
				found=zigbeelib_find_zigbee_device_and_use(i, addr, 0xFFFF);
				if (found!=-1) {
					break;
				}
			}
			if (found!=-1) {
				for (auto &zigbeedeviceit : zigbeelib_localzigbeedevices[i].zigbeedevices) {
					if (zigbeedeviceit.second.devicetype!=ZIGBEE_DEVICE_TYPE_END_DEVICE) {
						if (zigbeelib_markzigbee_inuse(&zigbeedeviceit.second)<0) {
							//Unable to mark this zigbee device for use
							continue;
						}
						zigbeelib_send_zigbee_zdo_management_permit_joining_request(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, ZIGBEE_TEMPJOIN_DURATION, 0, &localzigbeelocked, &zigbeelocked);
						zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second);
					}
				}
				zigbeelib_marklocalzigbee_notinuse(&zigbeelib_localzigbeedevices[i]);
				tmpstring="Enabled Zigbee Permit Joining on the Coordinator and all Routers on the same network as Zigbee device: ";
				sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
				tmpstring+=tmpstrbuf;
			} else {
				tmpstring="Zigbee Device not found: ";
				sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
				tmpstring+=tmpstrbuf;
			}
		} else if (strncmp(buffer+39, " single", 7)==0) {
			//Enable temporary joining on just one Zigbee device
			sscanf(buffer+23, "%016llX", (unsigned long long *) &addr);
			found=-1;
			for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
				found=zigbeelib_find_zigbee_device_and_use(i, addr, 0xFFFF);
				if (found!=-1) {
					break;
				}
			}
			if (found!=-1) {
				uint16_t netaddr=zigbeelib_localzigbeedevices[i].zigbeedevices[found].netaddr;
				zigbeelib_send_zigbee_zdo_management_permit_joining_request(i, addr, netaddr, ZIGBEE_TEMPJOIN_DURATION, 0, &localzigbeelocked, &zigbeelocked);
				zigbeelib_markzigbee_notinuse(&zigbeelib_localzigbeedevices[i].zigbeedevices[found]);
				tmpstring="Enabled Zigbee Permit Joining on Zigbee device: ";
				sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
				tmpstring+=tmpstrbuf;
			} else {
				tmpstring="Zigbee Device not found: ";
				sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
				tmpstring+=tmpstrbuf;
			}
		} else {
			tmpstring="ERROR\n";
		}
    zigbeelib_unlockzigbee();
    commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
	} else if (strncmp(buffer, "zigbee_leave_network ", 21)==0) {
    //Format: zigbee_leave_network <64-bit address> : Ask a Zigbee device to leave the network
		int16_t zigbeeidx;
		sscanf(buffer+22, "%016llX", (unsigned long long *) &addr);
		found=-1;
    zigbeelib_lockzigbee();
		for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
			found=zigbeelib_find_zigbee_device_and_use(i, addr, 0xFFFF);
			if (found!=-1) {
				break;
			}
		}
		if (found!=-1) {
			uint64_t destaddr=addr;
			uint64_t destnetaddr=zigbeelib_localzigbeedevices[i].zigbeedevices[found].netaddr;
			uint64_t addr=zigbeelib_localzigbeedevices[i].addr;
			uint16_t netaddr;

			//Get netaddr of local zigbee device
			zigbeeidx=zigbeelib_find_local_zigbee_device(addr);
			if (zigbeeidx!=-1) {
					netaddr=zigbeelib_localzigbeedevices[i].zigbeedevices[zigbeeidx].netaddr;
			} else {
				//Send leave request direct to zigbee device as we can't get the index to the local zigbee
				addr=destaddr;
				netaddr=destnetaddr;
			}
			//Setting rejoin to true doesn't seem to make any difference
			//NOTE: Some devices won't leave the network if you send from the local zigbee instead of direct to them
			zigbeelib_send_zigbee_zdo_management_leave_request(i, destaddr, destnetaddr, destaddr, destnetaddr, false, &localzigbeelocked, &zigbeelocked);
			zigbeelib_marklocalzigbee_notinuse(&zigbeelib_localzigbeedevices[i]);
			tmpstring="Zigbee Leave request sent to Zigbee device: ";
			sprintf(tmpstrbuf, "%016" PRIX64, destaddr);
			tmpstring+=tmpstrbuf;
			tmpstring+=" from Zigbee device: ";
			sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
			tmpstring+=tmpstrbuf;
		} else {
			tmpstring="Zigbee Device not found: ";
			sprintf(tmpstrbuf, "%016" PRIX64 "\n", addr);
			tmpstring+=tmpstrbuf;
		}
    zigbeelib_unlockzigbee();
    commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
  } else if (strncmp(buffer, "get_zigbee_info", 15)==0) {
    localzigbeedevice_t *localzigbeedeviceptr;
    int foundzigbee=0;

    //Format: get_zigbee_info
    zigbeelib_lockzigbee();
    for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
      localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
      if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr)<0) {
        //Unable to mark this local zigbee for use
        continue;
      }
      tmpstring=localzigbeedeviceptr->devicetype;
			tmpstring+=" ADDRESS: ";
      sprintf(tmpstrbuf, "%016llX\n", (unsigned long long) localzigbeedeviceptr->addr);
			tmpstring+=tmpstrbuf;
      commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
			for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
        uint16_t netaddr, manu;
        const char *devicetypestr, *rxonidlestr;

        if (zigbeelib_markzigbee_inuse(&zigbeedeviceit.second)<0) {
          //Unable to mark this zigbee for use
          continue;
        }
        foundzigbee=1;
        zigbeeaddr=zigbeedeviceit.second.addr;
        netaddr=zigbeedeviceit.second.netaddr;
        manu=zigbeedeviceit.second.manu;
				tmpstring="  ZIGBEE ADDRESS: ";
        sprintf(tmpstrbuf, "%016" PRIX64 " : %04" PRIX16 "\n", zigbeeaddr, netaddr);
				tmpstring+=tmpstrbuf;
        commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
        if (zigbeedeviceit.second.havemanu) {
					tmpstring="    Manufacturer: "+zigbeelib_get_zigbee_manufacturer_string(manu)+"(";
					sprintf(tmpstrbuf, "%04" PRIX16 ")\n", manu);
					tmpstring+=tmpstrbuf;
        } else {
          tmpstring="    Manufacturer: Unknown\n";
        }
        commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
        switch (zigbeedeviceit.second.devicetype) {
          case 0: devicetypestr="Cordinator";
                  break;
          case 1: devicetypestr="Router";
                  break;
          case 2: devicetypestr="End Device";
                  break;
          default: devicetypestr="Unknown";
                  break;
        }
        switch (zigbeedeviceit.second.rxonidle) {
          case 0: rxonidlestr="False";
                  break;
          case 1: rxonidlestr="True";
                  break;
          default: rxonidlestr="Unknown";
                  break;
        }
        tmpstring="    Device Type: ";
				tmpstring+=devicetypestr;
				tmpstring+='\n';
        commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
        tmpstring="    Receiver On When Idle: ";
				tmpstring+=rxonidlestr;
				tmpstring+='\n';
        commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
        if (!zigbeedeviceit.second.notconnected) {
          tmpstring="    Currently Connected\n";
        } else {
          tmpstring="    Currently Not Connected\n";
        }
        commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
        zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second);
      }
      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr);
    }
    zigbeelib_unlockzigbee();
    if (!foundzigbee) {
      commonserverlibifaceptr->serverlib_netputs("NO ZIGBEE DEVICES FOUND\n", clientsock, NULL);
    }
  } else if (strncmp(buffer, "refresh_zigbee_info ", 20)==0 && len>=36) {
    //Format: refresh_zigbee_info <64-bit addr>
    sscanf(buffer+20, "%016llX", (unsigned long long *) &addr);
    found=-1;
    zigbeelib_lockzigbee();
    for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
			found=zigbeelib_find_local_zigbee_device_and_use(addr);
			if (found!=-1) {
				break;
			}
    }
    zigbeelib_unlockzigbee();
    if (found!=-1) {
      commonserverlibifaceptr->serverlib_netputs("Removing cached list of ZigBee devices\n", clientsock, NULL);
      zigbeelib_remove_all_zigbee_devices(found, &localzigbeelocked, &zigbeelocked);

      zigbeelib_marklocalzigbee_notinuse(&zigbeelib_localzigbeedevices[found]);
    } else {
			tmpstring="Local Zigbee Device: ";
      sprintf(tmpstrbuf, "%016llX", (unsigned long long) addr);
			tmpstring+=tmpstrbuf;
			tmpstring+=" NOT FOUND\n";
      commonserverlibifaceptr->serverlib_netputs(tmpstring.c_str(), clientsock, NULL);
    }
  } else {
    return CMDLISTENER_NOTHANDLED;
  }
  MOREDEBUG_EXITINGFUNC();

  return CMDLISTENER_NOERROR;
}

//Remove zigbee devices that have been scheduled for removal
STATIC void zigbeelib_remove_scheduled_for_removal_zigbeedevices(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  int i, numlocalzigbeedevices;
  long localzigbeelocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(&zigbeelocked);

  //Look through all available local zigbee devices
  numlocalzigbeedevices=zigbeelib_getnumlocalzigbeedevices(&zigbeelocked);
  for (i=0; i<numlocalzigbeedevices; i++) {
    localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
    if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked)<0) {
      //Unable to mark this local zigbee for use
      continue;
    }
    //Check each Zigbee device to see if it is scheduled for removal
    std::list<int16_t> zigbeedevicestoremove; //Removing within for loop iterating can be hard to get right so add the list of items to remove to a list and iterate through the list to remove at the end
		for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
      if (!zigbeedeviceit.second.removed && !zigbeedeviceit.second.inuse && zigbeedeviceit.second.needtoremove) {
        debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016" PRIX64 " : %04" PRIX16 " at index: %d has been removed\n", __func__, (unsigned long long) zigbeedeviceit.second.addr, (unsigned short) zigbeedeviceit.second.netaddr, zigbeedeviceit.first);

				zigbeedevicestoremove.push_back(zigbeedeviceit.first);
				localzigbeedeviceptr->zigbeedeviceaddr.erase(zigbeedeviceit.second.addr);
				localzigbeedeviceptr->zigbeedevicenetaddr.erase(zigbeedeviceit.second.netaddr);
      }
    }
    for (auto const &it : zigbeedevicestoremove) {
			//NOTE: C++ destructors will auto cleanup when the parent structures are cleared
			localzigbeedeviceptr->zigbeedevices.erase( it );
		}
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
  }
  zigbeelib_unlockzigbee(&zigbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

//Register a home automation endpoint id for the local zigbee device
//Use if the local zigbee doesn't implement a home automation endpoint itself and relies on software to handle everything
//Returns 0 on success or other value on error
int zigbeelib_register_home_automation_endpointid(int localzigbeeindex, uint8_t haendpointid, long *localzigbeelocked, long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];

  if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked)<0) {
    //Failed to mark local zigbee as inuse
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr->haendpointid=haendpointid;

  zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, localzigbeelocked, zigbeelocked);

  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();

  return 0;
}

//Add a local zigbee device to the web api client queue
static void zigbeelib_add_localzigbee_device_to_webapiclient_queue(int localzigbeeindex) {
  webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=(webapiclientlib_ifaceptrs_ver_1_t *) zigbeelib_deps[WEBAPICLIENTLIB_DEPIDX].ifaceptr;
  webapiclient_zigbeecomm_t zigbeecomm;

  zigbeecomm.hubpk=0;
  zigbeecomm.name=zigbeelib_localzigbeedevices[localzigbeeindex].devicetype;
  zigbeecomm.addr=zigbeelib_localzigbeedevices[localzigbeeindex].addr;

  webapiclientlibifaceptr->add_zigbee_comm_to_webapi_queue(zigbeecomm);
}

//Tell this library to start using a local zigbee home automation device handled by a lower level library
//The low level library that calls this function should fill in the local zigbee device structure before calling this function
//WARNING: You should never add the same zigbee device more than once without previously removing it
//Args: zigbeedeviceinfo is a structure with info about the zigbee device
//      zigbeedeviceiface is a pointer to functions that this library can call to interface with the local zigbee device
//Returns: Index number to use with other functions on success or negative value on error
//  If an error is returned, assume that the zigbee device wasn't added to this library
int zigbeelib_add_localzigbeedevice(zigbeelib_localzigbeedevice_ver_1_t *localzigbeedevice, zigbeelib_localzigbeedevice_iface_ver_1_t *zigbeedeviceiface, unsigned long long features, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;

  if (!localzigbeedevice->devicetype) {
    //Need a device type
    return -1;
  }
  if (localzigbeedevice->devicetype[0]==0) {
    //Need a device type
    return -1;
  }
  zigbeelib_lockzigbee(zigbeelocked);
  for (i=0; i<MAX_LOCALZIGBEE_DEVICES; i++) {
    if (zigbeelib_localzigbeedevices[i].removed) {
      break;
    }
    if (zigbeelib_localzigbeedevices[i].addr==localzigbeedevice->addr) {
      char *devicetype;
      uint64_t addr;

      devicetype=localzigbeedevice->devicetype;
      addr=localzigbeedevice->addr;
      zigbeelib_unlockzigbee(zigbeelocked);
      debuglibifaceptr->debuglib_printf(1, "%s line %d: %s device with address: %016llX has already been added at index: %d\n", __func__, __LINE__, devicetype, addr, i);
      return i;
    }
  }
  if (i==MAX_LOCALZIGBEE_DEVICES) {
    zigbeelib_unlockzigbee(zigbeelocked);
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Max limit of %d local zigbee devices has been reached\n", __func__, MAX_LOCALZIGBEE_DEVICES);
    MOREDEBUG_EXITINGFUNC();
    return -2;
  }
	zigbeelib_localzigbeedevices[i].removed=0;
	zigbeelib_localzigbeedevices[i].needtoremove=0;
	zigbeelib_localzigbeedevices[i].inuse=0;
	zigbeelib_localzigbeedevices[i].haendpointid=0;
	zigbeelib_localzigbeedevices[i].broadcastcount=0;
	zigbeelib_localzigbeedevices[i].last_broadcasttime=0;
	zigbeelib_localzigbeedevices[i].numzigbeedevices=0;
	zigbeelib_localzigbeedevices[i].zigbeedevices.clear();
	zigbeelib_localzigbeedevices[i].zigbeedeviceaddr.clear();
	zigbeelib_localzigbeedevices[i].zigbeedevicenetaddr.clear();
	zigbeelib_localzigbeedevices[i].parent_sends_zdo_status=0;
	zigbeelib_localzigbeedevices[i].parent_zdo_status_hasaddr=0;
	zigbeelib_localzigbeedevices[i].parent_zdo_status_hasseqnumber=0;
	zigbeelib_localzigbeedevices[i].parent_sends_zcl_status=0;
	zigbeelib_localzigbeedevices[i].parent_zcl_status_hasaddr=0;
	zigbeelib_localzigbeedevices[i].parent_zcl_status_hasseqnumber=0;
	memset(zigbeelib_localzigbeedevices[i].sendqueue_items, 0, sizeof(zigbeelib_localzigbeedevices[i].sendqueue_items));

  zigbeelib_localzigbeedevices[i].features=features;
  zigbeelib_localzigbeedevices[i].devicetype=localzigbeedevice->devicetype;
  zigbeelib_localzigbeedevices[i].addr=localzigbeedevice->addr;
  zigbeelib_localzigbeedevices[i].deviceptr=localzigbeedevice->deviceptr;
  zigbeelib_localzigbeedevices[i].libraryiface=zigbeedeviceiface;
  zigbeelib_localzigbeedevices[i].sendqueuelastitemsentidx=MAX_SEND_QUEUE_ITEMS-1; //Start at max-1 as queue does + 1 which wraps around to 0 at startup
  zigbeelib_localzigbeedevices[i].sendqueuelastitemaddedidx=MAX_SEND_QUEUE_ITEMS-1;
  zigbeelib_localzigbeedevices[i].remainingsendqueueitems=MAX_SEND_QUEUE_ITEMS-1;

  if (i==zigbeelib_numlocalzigbeedevices) {
    ++zigbeelib_numlocalzigbeedevices;
  }
  zigbeelib_add_localzigbee_device_to_webapiclient_queue(i);

  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s line %d: Adding %s device with address: %016llX to index: %d\n", __func__, __LINE__, localzigbeedevice->devicetype, localzigbeedevice->addr, i);

  return i;
}

/*
  A function called by the parent library when the local zigbee device has been removed
  If the local zigbee device is still in use we return negative value but mark the local zigbee for removal so
    it won't be used again and can be removed on the next call to this function
  Return 1 if removed, 0 if still in use, or negative value on error
*/
int zigbeelib_remove_localzigbeedevice(int localzigbeeindex, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  localzigbeedevice_t *localzigbeedeviceptr;
  char *devicetype;
  uint64_t addr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);

  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return -1;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];

  if (localzigbeedeviceptr->removed) {
    //This local zigbee is removed so we can't trust any other values
    //Return success so the parent library knows it can cleanup its structures
    zigbeelib_unlockzigbee(zigbeelocked);

    MOREDEBUG_EXITINGFUNC();
    return 1;
  }
  devicetype=localzigbeedeviceptr->devicetype;
  addr=localzigbeedeviceptr->addr;
  if (!localzigbeedeviceptr->needtoremove) {
    //Mark that this local zigbee needs to be removed so other functions stop using it
    debuglibifaceptr->debuglib_printf(1, "%s: Marking %s device %016llX at index: %d for removal\n", __func__, devicetype, addr, localzigbeeindex);
    localzigbeedeviceptr->needtoremove=1;
  }
  if (localzigbeedeviceptr->inuse) {
    long inuse;

    inuse=localzigbeedeviceptr->inuse;
    zigbeelib_unlockzigbee(zigbeelocked);

    //Still in use so we can't cleanup yet
    debuglibifaceptr->debuglib_printf(1, "%s: %s device %016llX at index: %d is still in use: %d so it cannot be fully removed yet\n", __func__, devicetype, addr, localzigbeeindex, inuse);

    MOREDEBUG_EXITINGFUNC();
    return 0;
  }
  //Remove the local zigbee from ram

  //Remove all the Zigbee devices
  //NOTE: C++ destructors will auto cleanup when the parent structures are cleared
  localzigbeedeviceptr->zigbeedevices.clear();
  localzigbeedeviceptr->zigbeedeviceaddr.clear();
  localzigbeedeviceptr->zigbeedevicenetaddr.clear();
  for (i=0; i<MAX_SEND_QUEUE_ITEMS; i++) {
    if (localzigbeedeviceptr->sendqueue_items[i].packet) {
      free(localzigbeedeviceptr->sendqueue_items[i].packet);
    }
  }
  //We can remove the local zigbee device as it isn't in use
  memset(localzigbeedeviceptr, 0, sizeof(localzigbeedevice_t));
  localzigbeedeviceptr->removed=1;

  zigbeelib_unlockzigbee(zigbeelocked);

  debuglibifaceptr->debuglib_printf(1, "%s: %s device %016llX at index: %d has been removed\n", __func__, devicetype, addr, localzigbeeindex);

  MOREDEBUG_EXITINGFUNC();

  //The device was successfully removed
  return 1;
}

//Remove local zigbee devices that have been scheduled for removal
STATIC void zigbeelib_remove_scheduled_for_removal_localzigbeedevices(long *zigbeelocked) {
  MOREDEBUG_ADDDEBUGLIBIFACEPTR();
  localzigbeedevice_t *localzigbeedeviceptr;
  int i, numlocalzigbeedevices;
  long localzigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);

  //Look through all available local zigbee devices
  numlocalzigbeedevices=zigbeelib_getnumlocalzigbeedevices(zigbeelocked);
  for (i=0; i<numlocalzigbeedevices; i++) {
    localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
    if (localzigbeedeviceptr->removed) {
      continue;
    }
    if (localzigbeedeviceptr->needtoremove) {
      zigbeelib_remove_localzigbeedevice(i, &localzigbeelocked, zigbeelocked);
    }
  }
  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

//Scan for Zigbee devices and fill in data structures with discovered Zigbee info
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
STATIC void zigbeelib_find_zigbee_devices(time_t currenttime) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;//, k;
  int numlocalzigbeedevices;
  localzigbeedevice_t *localzigbeedeviceptr;
  long localzigbeelocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();

  //Scan for Zigbee devices from all available local zigbees if time to do so
  numlocalzigbeedevices=zigbeelib_getnumlocalzigbeedevices(&localzigbeelocked);
  for (i=0; i<numlocalzigbeedevices; i++) {
    int send_neighbor_table_request=0;

    localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
    if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked)<0) {
      //Unable to mark this local zigbee for use
      continue;
    }
    //Check if the local zigbee module is connected to a network
    if (!localzigbeedeviceptr->libraryiface->localzigbeedevice_connected_to_network(localzigbeedeviceptr->deviceptr, &localzigbeelocked)) {
      //RapidHA modules normally don't respond to Zigbee packets unless the network is up
      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
      continue;
    }
    //Check if time to refresh the entire ZigBee network for new devices
    zigbeelib_lockzigbee(&zigbeelocked);
    if (currenttime>(localzigbeedeviceptr->last_broadcasttime+BROADCAST_WAIT_TIME)) {
      send_neighbor_table_request=1;
      localzigbeedeviceptr->last_broadcasttime=currenttime;
    }
    zigbeelib_unlockzigbee(&zigbeelocked);

    //Get info about all detected Zigbee devices on this local zigbee device if needed
		for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
      zigbeelib_lockzigbee(&zigbeelocked);
      if (zigbeedeviceit.second.removed || zigbeedeviceit.second.needtoremove) {
        zigbeelib_unlockzigbee(&zigbeelocked);
        continue;
      }
      if (zigbeedeviceit.second.devicetype==ZIGBEE_DEVICE_TYPE_UKN || zigbeedeviceit.second.rxonidle==ZIGBEE_RXONIDLE_UKN) {
        //Don't do discovery until we have device type and rxonidle value for the device
        //It can come from the management neighbor tables
        zigbeelib_unlockzigbee(&zigbeelocked);
        continue;
      }
      if (zigbeedeviceit.second.notconnected) {
        zigbeelib_unlockzigbee(&zigbeelocked);
        continue;
      }
      if (send_neighbor_table_request && (zigbeedeviceit.second.devicetype==ZIGBEE_DEVICE_TYPE_COORDINATOR || zigbeedeviceit.second.devicetype==ZIGBEE_DEVICE_TYPE_ROUTER)) {
        //Query the management neighbor table from all known coordinators and routers on this Zigbee network
        debuglibifaceptr->debuglib_printf(1, "%s: Scanning for Zigbee devices known by ZigBee device=%016" PRIX64 ", %04" PRIX16 "\n", __func__, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr);
        //NOTE: Broadcast should be more efficient as only one outgoing packet is sent but on RapidHA sending
        //  unicode request works better as then we can match the send status reports more easily
        zigbeelib_send_zigbee_zdo_management_neighbor_table_request(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, 0x00, &localzigbeelocked, &zigbeelocked);
      }
			if ((localzigbeedeviceptr->features&ZIGBEE_FEATURE_NOHACLUSTERS)!=ZIGBEE_FEATURE_NOHACLUSTERS || localzigbeedeviceptr->addr!=zigbeedeviceit.second.addr) {
				if (!zigbeedeviceit.second.havebasicclusterendpointid) {
					zigbeelib_get_zigbee_info(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, zigbeedeviceit.first, &localzigbeelocked, &zigbeelocked);
				}
				if (zigbeedeviceit.second.havebasicclusterendpointid && !zigbeedeviceit.second.havebasicclusterinfo) {
					std::list<uint16_t> readattribs={0x0004, 0x0005};

					//Retrieve the basic cluster attribute values
					zigbeelib_send_multi_attribute_read(i, zigbeedeviceit.first, localzigbeedeviceptr->haendpointid, zigbeedeviceit.second.basicclusterendpointid, ZIGBEE_HOME_AUTOMATION_BASIC_CLUSTER, readattribs, &localzigbeelocked, &zigbeelocked);
				}
			} else {
				//Unable to read basic info from the local device
				zigbeedeviceit.second.basicinfonotrecognised=true;
			}
			if (!zigbeedeviceit.second.basicinfonotrecognised) {
					//Wait until we have attempted to get basic info and match with our database
        //  or don't need to get legacy info as the basic info was recognised
        zigbeelib_unlockzigbee(&zigbeelocked);
        continue;
      }
      if (!zigbeedeviceit.second.havemanu) {
#ifdef ZIGBEELIB_MOREDEBUG
        debuglibifaceptr->debuglib_printf(1, "%s: Getting Zigbee manufacturer info for device: %016llX\n", __func__, zigbeedeviceit.second.addr);
#endif
          zigbeelib_get_zigbee_info(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, zigbeedeviceit.first, &localzigbeelocked, &zigbeelocked);

          //Normally we shouldn't need to continue getting more info after this as the next request for info will be
          //  sent when the response for this request is received
          zigbeelib_unlockzigbee(&zigbeelocked);
          continue;
      }
      if (zigbeedeviceit.second.endpoints.size()==0) {
#ifdef ZIGBEELIB_MOREDEBUG
          debuglibifaceptr->debuglib_printf(1, "%s: Getting Zigbee endpoints for device: %016llX\n", __func__, zigbeedeviceit.second.addr);
#endif
          zigbeelib_get_zigbee_endpoints(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, &localzigbeelocked, &zigbeelocked);

          //Normally we shouldn't need to continue getting more info after this as the next request for info will be
          //  sent when the response for this request is received
          zigbeelib_unlockzigbee(&zigbeelocked);
          continue;
      }
      if (zigbeedeviceit.second.endpoints.size()==0) {
        if (!zigbeedeviceit.second.endpoints.begin()->second.profile) {
#ifdef ZIGBEELIB_MOREDEBUG
            debuglibifaceptr->debuglib_printf(1, "%s: Getting Zigbee endpoint info for device: %016llX\n", __func__, zigbeedeviceit.second.addr);
#endif
            zigbeelib_get_zigbee_next_endpoint_info(i, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, &localzigbeelocked, &zigbeelocked);
        }
      }
      zigbeelib_unlockzigbee(&zigbeelocked);
    }
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

//Identify known Zigbee devices and associate with the appropriate data structure
//NOTE: Need to do nearly full locking since a lot of variables used by this function will be modified by the receive functions
STATIC void zigbeelib_identify_known_zigbee_devices(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=(dbcounterlib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBCOUNTERLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBLIB_DEPIDX].ifaceptr;
  localzigbeedevice_t *localzigbeedeviceptr;
  int numlocalzigbeedevices;
  int i;
  long localzigbeelocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();
  numlocalzigbeedevices=zigbeelib_getnumlocalzigbeedevices(&localzigbeelocked);

  for (i=0; i<numlocalzigbeedevices; i++) {
    localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
    if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked)<0) {
      //Unable to mark this local zigbee for use
      continue;
    }
    //Identify the Zigbee devices
    for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
      uint64_t addr;
      uint16_t netaddr;
      int dbschemaversion=0;

      if (zigbeelib_markzigbee_inuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked)<0) {
        continue;
      }
      if (dblibifaceptr) {
        dbschemaversion=dblibifaceptr->getschemaversion();
        //debuglibifaceptr->debuglib_printf(1, "%s: Database Schema Version=%d\n", __func__, dbschemaversion);
      }
#ifdef ZIGBEELIB_DEBUGWITHOUTDATABASE
      if (dbschemaversion==0) {
        //DEBUG: Force the schema to 1 so can test counters
        dbschemaversion=1;
      }
#endif
      zigbeelib_lockzigbee(&zigbeelocked);
      addr=zigbeedeviceit.second.addr;
      netaddr=zigbeedeviceit.second.netaddr;

			if (!zigbeedeviceit.second.basicinfonotrecognised && zigbeedeviceit.second.havebasicclusterinfo && !zigbeedeviceit.second.havecounters) {
				//We have basic info and it is recognised

				debuglibifaceptr->debuglib_printf(1, "%s: Allocating counters for Zigbee device: %016" PRIX64 ", %04" PRIX16 " (%s)\n", __func__, addr, netaddr, zigbeedeviceit.second.userstr.c_str());

				//Allocate database counters for the attributes
				//TODO: Get the port number from the zigbeedefs file instead of just using port 0
				int failcnt=0;
        for (auto &endpointsit : zigbeedeviceit.second.endpoints) {
					for (auto &clusterit : endpointsit.second.iclusters) {
						for (auto &manuit : clusterit.second.attrs) {
						  for (auto &attrit : manuit.second) {
							  debuglibifaceptr->debuglib_printf(1, "%s:   Endpoint: %02" PRIX8 ", Cluster: %04" PRIX16 ", Manu: %s (%04" PRIX16 "), Attr: %s (%04" PRIX16 ")\n", __func__, endpointsit.first, clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first);
								if (attrit.second.dbinfieldinitialinterval>0 && attrit.second.dbinfieldinterval && attrit.second.dbincounter==-1) {
									attrit.second.dbincounter=dbcounterlibifaceptr->new_1multival_incounter(addr, endpointsit.second.thingport, attrit.second.dbfieldtype, attrit.second.dbfieldname.c_str(), attrit.second.dbinfieldinitialinterval, attrit.second.dbinfieldinterval);
									if (attrit.second.dbincounter==-1) {
										++failcnt;
									}
								}
								if (attrit.second.dbupdatefieldinterval>0 && attrit.second.dbupdatecounter==-1) {
									attrit.second.dbupdatecounter=dbcounterlibifaceptr->new_1multival_updatecounter(addr, endpointsit.second.thingport, attrit.second.dbfieldtype, attrit.second.dbfieldname.c_str(), attrit.second.dbupdatefieldinterval);
									if (attrit.second.dbupdatecounter==-1) {
										++failcnt;
									}
								}
								if (attrit.second.dboutfieldinterval>0 && attrit.second.dboutcounter==-1) {
									attrit.second.dboutcounter=dbcounterlibifaceptr->new_1multival_outcounter(addr, endpointsit.second.thingport, attrit.second.dbfieldtype, attrit.second.dbfieldname.c_str(), attrit.second.dboutfieldinterval);
									if (attrit.second.dboutcounter==-1) {
										++failcnt;
									}
								}
							}
						}
					}
				}
				if (failcnt==0) {
					zigbeedeviceit.second.havecounters=true;
				}
			}
      zigbeelib_unlockzigbee(&zigbeelocked);
      zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked);
    }
    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

static void zigbeelib_configure_zigbeedevice_reporting(int localzigbeeindex, std::pair<const int16_t, zigbeedevice_t> &zigbeedeviceit, uint64_t localzigbee_addr, uint16_t localzigbee_netaddr, uint8_t localzigbee_haendpointid, unsigned long long localzigbee_features, long& localzigbeelocked, long& zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
	uint64_t zigbeeaddr;
	uint16_t zigbeenetaddr;
	char zigbeerxonidle;

	zigbeeaddr=zigbeedeviceit.second.addr;
	zigbeenetaddr=zigbeedeviceit.second.netaddr;
	zigbeerxonidle=zigbeedeviceit.second.rxonidle;

	//As we progress through various tests, these values may change for the Zigbee device
	//Start with best possible options
	int configurereporting=1;
	bool configurefastreport=false;
	bool configurebinding=true;

	if ((localzigbee_features&ZIGBEE_FEATURE_RECEIVEREPORTPACKETS)!=ZIGBEE_FEATURE_RECEIVEREPORTPACKETS) {
		//The local zigbee device doesn't support receiving reports
		//debuglibifaceptr->debuglib_printf(1, "%s: Local Zigbee Device: %016" PRIX64 ", %04" PRIX16 " can't receive report packets\n", __func__, localzigbee_addr, localzigbee_netaddr);
		configurebinding=false;
		configurereporting=0;
		if (zigbeerxonidle==0) {
			//End Devices that turn the radio off will need quick reporting on one attribute for polling to work properly
			//They may also need binding configured for the fast report to activate
			configurebinding=true;
			configurefastreport=true;
		}
	}
	if (zigbeedeviceit.second.reporting==0) {
		//Reporting not supported on this zigbee device
		//No point binding the device either
		//debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016" PRIX64 ", %04" PRIX16 " doesn't support reporting\n", __func__, zigbeeaddr, zigbeenetaddr);
		configurebinding=false;
		configurereporting=0;
		configurefastreport=false;
	}
	else if (zigbeedeviceit.second.reporting==2) {
		//This device supports reporting/binding but report intervals and attributes are fixed and can't be configured
		//debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016" PRIX64 ", %04" PRIX16 " only supports fixed reporting\n", __func__, zigbeeaddr, zigbeenetaddr);
		configurereporting=2;
		configurefastreport=false;
	}
	//debuglibifaceptr->debuglib_printf(1, "%s: TEMP DEBUG Reporting disabled TEMP DEBUG\n", __func__);
	//configurereporting=0;
	//Configure binding on clusters that have attributes with reporting
	if (configurebinding) {
		for (auto &endpointit : zigbeedeviceit.second.endpoints) {
      for (auto &clusterit : endpointit.second.iclusters) {
				if (!clusterit.second.isbound) {
					//Search attributes as only clusters with reportable attributes need binding
					uint16_t reportableattrs=0;
					for (auto &manuit : clusterit.second.attrs) {
						for (auto &attrit : manuit.second) {
							if (attrit.second.reporting==1) {
								++reportableattrs;
							}
						}
					}
					if (reportableattrs>0) {
							debuglibifaceptr->debuglib_printf(1, "%s: Binding cluster: %s (0x%04" PRIX16 ") from Zigbee device: %016" PRIX64 ", %04" PRIX16 " to Zigbee Device: %016" PRIX64 ", %04" PRIX16 "\n", __func__, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeeaddr, zigbeenetaddr, localzigbee_addr, localzigbee_netaddr);

							zigbeelib_send_zigbee_zdo_bind_request_cluster(localzigbeeindex, zigbeeaddr, zigbeenetaddr, zigbeeaddr, endpointit.first, clusterit.first, localzigbee_addr, localzigbee_haendpointid, &localzigbeelocked, &zigbeelocked);

							//Client Bind
							zigbeelib_send_zigbee_zdo_bind_request_cluster(localzigbeeindex, localzigbee_addr, localzigbee_netaddr, zigbeeaddr, endpointit.first, clusterit.first, localzigbee_addr, localzigbee_haendpointid, &localzigbeelocked, &zigbeelocked);
					}
					//Always set 1 for now to indicate binding has been processed and at least attempted to be configured for this cluster
					clusterit.second.isbound=1;
				}
			}
		}
	}
	//Configure reporting on attributes
	if (configurefastreport) {
		bool fastreportconfigured=false;

		//Search for the first attribute to configure for fast reporting
		for (auto &endpointit : zigbeedeviceit.second.endpoints) {
      for (auto &clusterit : endpointit.second.iclusters) {
				for (auto &manuit : clusterit.second.attrs) {
					std::list<zigbee_zcl_configure_reporting_attr_record_t> attrs;
					for (auto &attrit : manuit.second) {
						if (attrit.second.reporting && !attrit.second.fastreportingconfigured) {
							zigbee_zcl_configure_reporting_attr_record_t attr;

							debuglibifaceptr->debuglib_printf(1, "%s: Configuring fast reporting for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ")\n", __func__, zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first);
							attr.direction=0;
							attr.attr=attrit.first;
							attr.attrtype=attrit.second.datatype;
							attr.minintval=1;
							attr.maxintval=5;
							attr.timeout=60;
							if (zigbeelib_is_attribute_datatype_analog(attrit.second.datatype)) {
								attr.reportchange=attrit.second.reportchange.getval();
							}
							//Always assume reporting config succeeded for now
							attrit.second.fastreportingconfigured=true;
							fastreportconfigured=true;
							try {
								attrs.push_back(attr);
							} catch (std::bad_alloc& e) {
								debuglibifaceptr->debuglib_printf(1, "%s:   ERROR: Failed to allocate ram for reporting config\n", __func__);
							}
							break;
						}
					}
					if (attrs.size()>0) {
						if (manuit.first==0) {
							zigbee_send_multi_attribute_configure_reporting_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, nullptr, attrs, &localzigbeelocked, &zigbeelocked);
						} else {
							zigbee_send_multi_attribute_configure_reporting_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, &manuit.first, attrs, &localzigbeelocked, &zigbeelocked);
						}
					}
					if (fastreportconfigured) {
						break;
					}
				}
				if (fastreportconfigured) {
					break;
				}
			}
			if (fastreportconfigured) {
				break;
			}
		}
	}
	if (configurereporting) {
		//Search attributes to configure for reporting
		for (auto &endpointit : zigbeedeviceit.second.endpoints) {
      for (auto &clusterit : endpointit.second.iclusters) {
				for (auto &manuit : clusterit.second.attrs) {
					std::list<zigbee_zcl_configure_reporting_attr_record_t> attrs;
					for (auto &attrit : manuit.second) {
						if (attrit.second.reporting && !attrit.second.reportingconfigured && !attrit.second.fastreportingconfigured) {
							if (configurereporting==1) {
								zigbee_zcl_configure_reporting_attr_record_t attr;

								debuglibifaceptr->debuglib_printf(1, "%s: Configuring reporting for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %04" PRIX16 ", Attribute: %04" PRIX16 "\n", __func__, zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, manuit.first, attrit.first);
								attr.direction=0;
								attr.attr=attrit.first;
								attr.attrtype=attrit.second.datatype;
								attr.minintval=attrit.second.reportmininterval;
								attr.maxintval=attrit.second.reportmaxinterval;
								attr.timeout=attrit.second.reporttimeout;
								if (zigbeelib_is_attribute_datatype_analog(attrit.second.datatype)) {
									attr.reportchange=attrit.second.reportchange.getval();
								}
								//Always assume reporting config succeeded for now
								attrit.second.reportingconfigured=1;
								try {
									attrs.push_back(attr);
								} catch (std::bad_alloc& e) {
									debuglibifaceptr->debuglib_printf(1, "%s:   ERROR: Failed to allocate ram for reporting config\n", __func__);
								}
							} else {
								debuglibifaceptr->debuglib_printf(1, "%s: Assuming Fixed Reporting for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %04" PRIX16 ", Attribute: %04" PRIX16 "\n", __func__, zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, manuit.first, attrit.first);
								attrit.second.reportingconfigured=2;
							}
						}
					}
					if (attrs.size()>0) {
						if (manuit.first==0) {
							zigbee_send_multi_attribute_configure_reporting_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, nullptr, attrs, &localzigbeelocked, &zigbeelocked);
						} else {
							zigbee_send_multi_attribute_configure_reporting_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, &manuit.first, attrs, &localzigbeelocked, &zigbeelocked);
						}
					}
				}
			}
		}
	}
}

static void zigbeelib_sync_zigbee_attributes_to_database(int localzigbeeindex, std::pair<const int16_t, zigbeedevice_t> &zigbeedeviceit, uint64_t localzigbee_addr, uint16_t localzigbee_netaddr, uint8_t localzigbee_haendpointid, unsigned long long localzigbee_features, long& localzigbeelocked, long& zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=(dbcounterlib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBCOUNTERLIB_DEPIDX].ifaceptr;
	uint64_t zigbeeaddr;
	uint16_t zigbeenetaddr;
	char zigbeerxonidle;
	int result;
  struct timespec curtime;

	zigbeeaddr=zigbeedeviceit.second.addr;
	zigbeenetaddr=zigbeedeviceit.second.netaddr;
	zigbeerxonidle=zigbeedeviceit.second.rxonidle;

  clock_gettime(CLOCK_REALTIME, &curtime);
	for (auto &endpointit : zigbeedeviceit.second.endpoints) {
		for (auto &clusterit : endpointit.second.iclusters) {
			for (auto &manuit : clusterit.second.attrs) {
				std::list<uint16_t> attrs;
				std::map<uint16_t, zigbeeattrmultival> outattrs;
				for (auto &attrit : manuit.second) {
					struct timespec curtime;

					//Get the time for every attribute as it may take a while to iterate over all the attributes
					clock_gettime(CLOCK_REALTIME, &curtime);

					//Database -> Attribute
					if (curtime.tv_sec>attrit.second.invalchangedtime+5 && curtime.tv_sec>attrit.second.outvaltime+5 && attrit.second.invaltime>0) {
						//Only check the value of the database if it has been at least 5 seconds since the last incoming
						//  attribute value change (needs time to output to database
						//  and attribute write and a value has been received at least once from the attribute
						if (attrit.second.dbincounter>=0) {
							//Get value from database
							multitypeval_t tmpmultival;
							result=dbcounterlibifaceptr->get_1multival_incountervalues(attrit.second.dbincounter, &tmpmultival);
							if (result==DBCOUNTERLIB_INCOUNTER_STATUS_ALLVALUESSET) {
								zigbeedbmultival tmpdbmultival=zigbeedbmultival(tmpmultival, attrit.second.dbfieldtype);
								attrit.second.indbvaltime=curtime.tv_sec;
								if (attrit.second.indbvalchangedtime==0 || attrit.second.dbval!=tmpdbmultival) {
									//Only update if we haven't updated yet or the value is different from previous
									attrit.second.indbvalchangedtime=curtime.tv_sec;
									attrit.second.prevdbval=attrit.second.dbval;
									attrit.second.dbval=tmpdbmultival;

									if (attrit.second.val!=attrit.second.dbval) {
										zigbeeattrmultival tmpattrmultival;

										//Copy to write val as it is different
										attrit.second.outvaltime=curtime.tv_sec;
										tmpattrmultival=attrit.second.val; //Initialise with type
										tmpattrmultival=attrit.second.dbval; //Now set the new value
										debuglibifaceptr->debuglib_printf(1, "%s: Changing value for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ") from %s to %s\n", __func__, zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first, attrit.second.val.toString().c_str(), attrit.second.dbval.toString().c_str());
										try {
											outattrs[attrit.first]=tmpattrmultival;
										} catch (std::bad_alloc& e) {
											debuglibifaceptr->debuglib_printf(1, "%s:   ERROR: Failed to allocate ram for writing attribute value\n", __func__);
										}
									}
								}
							}
						}
					}
					if (attrit.second.reportmaxinterval==0xffff) {
						continue;
					}
					//Optional Poll Attribute
					if (attrit.second.reportingconfigured==0 || ((localzigbee_features&ZIGBEE_FEATURE_NORECEIVEMANUREPORTPACKETS)==ZIGBEE_FEATURE_NORECEIVEMANUREPORTPACKETS && manuit.first!=0x0000) || attrit.second.invaltime==0) {
						//Need to poll from this attribute
						if (!attrit.second.requestpending) {
							if (attrit.second.invaltime+attrit.second.reportmininterval<curtime.tv_sec) {
								debuglibifaceptr->debuglib_printf(1, "%s: Sending attribute value request for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ")\n", __func__, zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first);
								attrit.second.requestpending=true;
								try {
									attrs.push_back(attrit.first);
								} catch (std::bad_alloc& e) {
									debuglibifaceptr->debuglib_printf(1, "%s:   ERROR: Failed to allocate ram for reading attribute value\n", __func__);
								}
							}
						}
					}
					//Attribute -> Database
					if ((attrit.second.dboutcounter>=0 || attrit.second.dbupdatecounter>=0) && attrit.second.invalchangedtime>0) {
						if (attrit.second.invalchangedtime>attrit.second.outdbvaltime && curtime.tv_sec>attrit.second.outvaltime+5) {
							//Database may need updating as the Zigbee attribute value has changed since last database write
							//Only update if it has been more than 5 seconds since a write to the Zigbee attribute as
							//  it may take a while to refresh from the write
							if (attrit.second.val!=attrit.second.dbval || attrit.second.dbincounter==-1) {
								//If there isn't an in counter than the database value should always be updated to a new
								//  Zigbee attribute value when it changes, otherwise compare with current db value
								attrit.second.prevdbval=attrit.second.dbval;
								attrit.second.dbval=attrit.second.val;
								if (attrit.second.dboutcounter>=0) {
									debuglibifaceptr->debuglib_printf(1, "%s: Outputing to database with attribute value %s for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ")\n", __func__, attrit.second.val.toString().c_str(), zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first);
									dbcounterlibifaceptr->addto1multivaloutcounter(attrit.second.dboutcounter, attrit.second.dbval.getval());
								}
								if (attrit.second.dbupdatecounter>=0) {
									debuglibifaceptr->debuglib_printf(1, "%s: Updating database with attribute value %s for Zigbee device: %016" PRIX64 ", %04" PRIX16 ", Endpoint: %02" PRIX8 ", Cluster: %s (0x%04" PRIX16 ") Manufacturer: %s (%04" PRIX16 "), Attribute: %s (%04" PRIX16 ")\n", __func__, attrit.second.val.toString().c_str(), zigbeeaddr, zigbeenetaddr, endpointit.first, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first, attrit.second.name.c_str(), attrit.first);
									dbcounterlibifaceptr->addto1multivalupdatecounter(attrit.second.dbupdatecounter, attrit.second.dbval.getval());
								}
								attrit.second.outdbvaltime=curtime.tv_sec;
							}
						}
					}
				}
				if (attrs.size()>0) {
					if (manuit.first==0) {
						zigbeelib_send_multi_attribute_read(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, attrs, &localzigbeelocked, &zigbeelocked);
					} else {
						zigbeelib_send_multi_attribute_read_with_manufacturer_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, &manuit.first, attrs, &localzigbeelocked, &zigbeelocked);
					}
				}
				if (outattrs.size()>0) {
					std::map<uint16_t, zigbeeattrmultival> newoutattrs;
					//Filter out special values that must be sent via commands
					if (manuit.first==0) {
						for (auto const &outattrit : outattrs) {
							bool handled=false;
							if (clusterit.first==ZIGBEE_HOME_AUTOMATION_ONOFF_CLUSTER) {
								if (outattrit.first==0x0000) {
									//Need to send a special command to change on/off value
									zigbeelib_homeautomation_send_on_off(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, outattrit.second.getval().uval8bit, &localzigbeelocked, &zigbeelocked);
									handled=true;
								}
							}
							if (!handled) {
								newoutattrs[outattrit.first]=outattrit.second;
							}
						}
						if (newoutattrs.size()>0) {
							zigbee_send_multi_attribute_write_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, NULL, newoutattrs, localzigbeelocked, zigbeelocked);
						}
					} else {
						//There are no known manufacturer specific commands yet
						zigbee_send_multi_attribute_write_request(localzigbeeindex, zigbeedeviceit.first, localzigbee_haendpointid, endpointit.first, clusterit.first, &manuit.first, outattrs, localzigbeelocked, zigbeelocked);
					}
				}
			}
		}
	}
}

//Refresh data from zigbee devices
//NOTE: Only need to do minimal thread locking since a lot of the variables used won't change while this function is running
STATIC void zigbeelib_refresh_zigbee_data(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int i;
  int numlocalzigbeedevices;
  uint16_t zigbeedevicetype;
  long localzigbeelocked=0, zigbeelocked=0;

  MOREDEBUG_ENTERINGFUNC();
  //Refresh data from zigbee devices
  numlocalzigbeedevices=zigbeelib_getnumlocalzigbeedevices(&zigbeelocked);
  for (i=0; i<numlocalzigbeedevices; i++) {
    localzigbeedevice_t *localzigbeedeviceptr;
    int localzigbee_zigbeeidx;
    uint64_t localzigbee_addr;
    uint16_t localzigbee_netaddr;
    uint8_t localzigbee_haendpointid;
    unsigned long long localzigbee_features;

    localzigbeedeviceptr=&zigbeelib_localzigbeedevices[i];
    if (zigbeelib_marklocalzigbee_inuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked)<0) {
      //Unable to mark this local zigbee for use
      continue;
    }
    zigbeelib_lockzigbee(&zigbeelocked);
    localzigbee_addr=localzigbeedeviceptr->addr;
    localzigbee_zigbeeidx=zigbeelib_find_zigbee_device(i, localzigbee_addr, 0xFFFF, &localzigbeelocked, &zigbeelocked);
    if (localzigbee_zigbeeidx!=-1) {
      localzigbee_netaddr=localzigbeedeviceptr->zigbeedevices[localzigbee_zigbeeidx].netaddr;
    } else {
      localzigbee_netaddr=0xFFFC;
    };
    localzigbee_haendpointid=localzigbeedeviceptr->haendpointid;
    localzigbee_features=localzigbeedeviceptr->features;
    zigbeelib_unlockzigbee(&zigbeelocked);
    if (localzigbee_haendpointid==0) {
      debuglibifaceptr->debuglib_printf(1, "%s: No Home Automation profile endpoint found yet on %s device: %016llX\n", __func__, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->addr);

      zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
      continue;
    }/* else {
      debuglibifaceptr->debuglib_printf(1, "%s: Using source endpoint id: %02hhX for Home Automation profile on %s device: %016llX\n", __func__, localzigbeedeviceptr->devicetype, localzigbeedeviceptr->haendpointid, localzigbeedeviceptr->addr);
    }*/
    for (auto &zigbeedeviceit : localzigbeedeviceptr->zigbeedevices) {
      uint64_t zigbeeaddr;
      uint16_t zigbeenetaddr;
      uint16_t zigbeemanu;
      char zigbeerxonidle;

      if (zigbeelib_markzigbee_inuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked)<0) {
        continue;
      }
      zigbeelib_lockzigbee(&zigbeelocked);
			if (!zigbeedeviceit.second.havecounters) {
				//Don't retrieve attributes until the counters are configured
        zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked);
        zigbeelib_unlockzigbee(&zigbeelocked);
				continue;
			}
      zigbeeaddr=zigbeedeviceit.second.addr;
      zigbeenetaddr=zigbeedeviceit.second.netaddr;
      zigbeedevicetype=zigbeedeviceit.second.subdevicetype;
      zigbeemanu=zigbeedeviceit.second.manu;
      zigbeerxonidle=zigbeedeviceit.second.rxonidle;

      if (zigbeeaddr==localzigbeedeviceptr->addr) {
        //We don't support monitoring of any local zigbee devices yet
        zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked);
        zigbeelib_unlockzigbee(&zigbeelocked);
        continue;
      }
			zigbeelib_configure_zigbeedevice_reporting(i, zigbeedeviceit, localzigbee_addr, localzigbee_netaddr, localzigbee_haendpointid, localzigbee_features, localzigbeelocked, zigbeelocked);
			zigbeelib_sync_zigbee_attributes_to_database(i, zigbeedeviceit, localzigbee_addr, localzigbee_netaddr, localzigbee_haendpointid, localzigbee_features, localzigbeelocked, zigbeelocked);

      if (!zigbeedeviceit.second.notconnected) {
        struct timespec curtime;

        clock_gettime(CLOCK_REALTIME, &curtime);
        if (zigbeedeviceit.second.lastresponsetime+MAX_TIME_ZIGBEE_NO_PACKETS<curtime.tv_sec) {
          //Mark the zigbee device as not connected
          debuglibifaceptr->debuglib_printf(1, "%s: Zigbee device: %016llX, %04hX hasn't checked in for more than %d seconds so will be marked as not connected\n", __func__, zigbeedeviceit.second.addr, zigbeedeviceit.second.netaddr, MAX_TIME_ZIGBEE_NO_PACKETS);

          zigbeedeviceit.second.notconnected=1;
        }
      }
      zigbeelib_markzigbee_notinuse(&zigbeedeviceit.second, &localzigbeelocked, &zigbeelocked);
      zigbeelib_unlockzigbee(&zigbeelocked);
    }
    //Check if we need to send a pending packet
    __zigbeelib_send_queue_send_next_packet(i, &localzigbeelocked, &zigbeelocked);

    zigbeelib_marklocalzigbee_notinuse(localzigbeedeviceptr, &localzigbeelocked, &zigbeelocked);
  }
  MOREDEBUG_EXITINGFUNC();
}

/*
  Main Zigbee thread loop that manages initialisation, shutdown, and outgoing communication to the zigbee devices
  NOTE: Don't need to thread lock since the functions this calls will do the thread locking, we just disable canceling of the thread
*/
STATIC void *zigbeelib_mainloop(void* UNUSED(val)) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  time_t currenttime;
  time_t prevzigbeescantime;
  struct timespec semwaittime;
  long zigbeelocked=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  //Loop until this thread is canceled
  prevzigbeescantime=0;
  while (!zigbeelib_getneedtoquit(&zigbeelocked)) {
		bool local_zigbeedefsloaded;

    clock_gettime(CLOCK_REALTIME, &semwaittime);
    currenttime=semwaittime.tv_sec;

		zigbeelib_lockzigbee();
		local_zigbeedefsloaded=zigbeelib_zigbeedefsloaded;
		zigbeelib_unlockzigbee();
		if (local_zigbeedefsloaded) {
			//TODO: Possibly add the ability for the zigbee functions to do some things even before the zigbee definitions have been loaded
			if (prevzigbeescantime+1<currenttime) {
				//Only scan for zigbee info once a second
				prevzigbeescantime=currenttime;

				zigbeelib_find_zigbee_devices(currenttime);

				//Identify known Zigbee devices
				zigbeelib_identify_known_zigbee_devices();
			}
			//Refresh data from zigbee devices
			zigbeelib_refresh_zigbee_data();
		}
    zigbeelib_remove_scheduled_for_removal_zigbeedevices();
    zigbeelib_remove_scheduled_for_removal_localzigbeedevices(&zigbeelocked);

    if (zigbeelib_getneedtoquit(&zigbeelocked)) {
      break;
    }
    //Sleep until the next second so enough time for Zigbee monitoring
    semwaittime.tv_sec+=1;
    semwaittime.tv_nsec=0;
#ifdef ZIGBEELIB_MOREDEBUG
    debuglibifaceptr->debuglib_printf(1, "%s: Sleeping\n", __func__);
#endif
    sem_timedwait(&zigbeelib_mainthreadsleepsem, &semwaittime);
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return (void *) 0;
}

STATIC void zigbeelib_setneedtoquit(int val, long *zigbeelocked) {
  zigbeelib_lockzigbee(zigbeelocked);
  needtoquit=val;
  zigbeelib_unlockzigbee(zigbeelocked);
}

STATIC int zigbeelib_getneedtoquit(long *zigbeelocked) {
  int val;

  zigbeelib_lockzigbee(zigbeelocked);
  val=needtoquit;
  zigbeelib_unlockzigbee(zigbeelocked);

  return val;
}

typedef struct dbtypes dbtypes_t;
struct dbtypes {
	int dbfieldtype;
	int dbsensortype;
};

//Load Zigbee Definitions from a file
//NOTE: Manufacturer value of 0 means normal non-manufacturer specific
//This function supports the following file versions: 1
static void initZigbeeDefs(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  auto configlibifaceptr=(configlib_ifaceptrs_ver_1_cpp_t *) zigbeelib_deps[CONFIGLIB_DEPIDX].ifaceptr;
  size_t tmplen;
  char linebuf[LINEBUF_SIZE];
  FILE *file=NULL;
  std::string curfield="", curfield2="";
  std::string curblock="";
  int64_t filemaxver=0, fileminver=0; //Use 64-bit to future proof the file version
  uint16_t curclusterid=0, curattr=0, curmanu=0;
  std::string curmanustr="", curmodelstr="";
  uint8_t curendpointid=0;
  std::string curlayoutname="";
  zigbeedevicelayout_t *curzigbeelayout=NULL;
  zigbeeendpoint_t *curendpoint=NULL;
  zigbeecluster_t *curcluster=NULL;
	bool result;
	std::string zigbeedefsfilename="";

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

	//Place a lock around this so other functions accessing zigbee defs don't get corrupted values
  zigbeelib_lockzigbee();
	if (zigbeelib_zigbeedefsloaded) {
		zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Loading of Zigbee definitions more than once isn't currently supported\n", __func__);
		return;
	}

  result=configlibifaceptr->getnamevalue_cpp("zigbeeconfig", "zigbeedefsfilename", zigbeedefsfilename);
  if (!result) {
		zigbeelib_unlockzigbee();
		return;
	}
  file=fopen(zigbeedefsfilename.c_str(), "rb");
  if (file==NULL) {
		zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "%s: Failed to open file: %s\n", __func__, zigbeedefsfilename.c_str());
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
    return;
  }
  gzclattrtypes.clear();
  gzclattrtypesstr.clear();
  gzigbeeclusterdefs.clear();
  gzigbeedevicelayouts.clear();
  gknownzigbeedevices.clear();

	std::map<std::string, dbtypes_t> dbtypes;

	//NOTE: The sensor type numbers must match the values in the database
	dbtypes["IOPORT_STATE"]={ DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE, 0 }; //This type doesn't have a sensor type mapping
	dbtypes["SENSOR_DATAFLOAT"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT, 4 };
	dbtypes["SENSOR_DATABIGINT"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT, 3 };
	dbtypes["SENSOR_DATAINT"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT, 2 };
	dbtypes["SENSOR_DATATINYINT"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT, 1 };
	dbtypes["SENSOR_DATAFLOAT_TOTAL"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAFLOAT, 204 };
	dbtypes["SENSOR_DATABIGINT_TOTAL"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT, 203 };
	dbtypes["SENSOR_DATAINT_TOTAL"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT, 202 };
	dbtypes["SENSOR_DATATINYINT_ENUM"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATATINYINT, 101 };
	dbtypes["SENSOR_DATABIGINT_ENUM"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATABIGINT, 103 };
	dbtypes["SENSOR_DATAINT_ENUM"]={ DBCOUNTERLIB_COUNTER_WATTUSE_SENSOR_DATAINT, 102 };
	
  while (fgets(linebuf, LINEBUF_SIZE, file) !=NULL) {
    tmplen=strlen(linebuf)-1;
    if (tmplen>0 && linebuf[tmplen] == '\n') {
      //Remove the newline at the end of the line
      linebuf[tmplen]=0;
      --tmplen;
    }
    if (tmplen>0 && linebuf[tmplen] == '\r') {
      //Remove the carriage return at the end of the line
      linebuf[tmplen]=0;
      --tmplen;
    }
    if (linebuf[0]==0 || linebuf[0]=='#' || linebuf[0]==';') {
      //Ignore commented lines
      continue;
    }
    if (linebuf[0]=='[' && linebuf[tmplen]==']') {
      linebuf[tmplen]=0;
      curblock=linebuf+1;
      debuglibifaceptr->debuglib_printf(1, "%s: Found block: %s\n", __func__, curblock.c_str()); 
      continue;
    }
    if (curblock=="") {
      if (strncmp(linebuf, "maxversion=", 11)==0) {
        sscanf(linebuf+11, "%" SCNi64, &filemaxver);
        if (filemaxver<1) {
          //In the future the format could change but don't abort as minversion might still be recognised
          debuglibifaceptr->debuglib_printf(1, "%s: Warning: Unsupported max file version: %s\n", __func__, linebuf+11);
        }
      } else if (strncmp(linebuf, "minversion=", 11)==0) {
        sscanf(linebuf+11, "%" SCNi64, &fileminver);
        if (fileminver!=1) {
          debuglibifaceptr->debuglib_printf(1, "%s: Error: Unsupported min file version: %s\n", __func__, linebuf+11);
          break;
        }
      }
    }
    if (fileminver==0) {
      //Don't start processing blocks until the min version is known
      continue;
    }
    if (curblock=="manucodes") {
      //NOTE: This block should go at the top so other blocks can use these values
      char *equalsptr;

      equalsptr=strchr(linebuf, '=');
      if (!equalsptr) {
        //Not found
        continue;
      }
      //Left side of equals is the value
      //Right side of equals is the attr type string
      *equalsptr=0; //Convert = into nul
      curfield=equalsptr+1;
      sscanf(linebuf, "0x%" SCNx16, &gzigbeemanucodes[curfield]);
      gzigbeemanucodesstr[ gzigbeemanucodes[curfield] ]=curfield;
      //debuglibifaceptr->debuglib_printf(1, "%s: Found a Manufacturer: %s=%04" PRIX16 "\n", __func__, curfield.c_str(), gzigbeemanucodes[curfield]);
    } else if (curblock=="zclattrtypes") {
      //NOTE: This block should go at the top so other blocks can use these values
      char *equalsptr;

      equalsptr=strchr(linebuf, '=');
      if (!equalsptr) {
        //Not found
        continue;
      }
      //Left side of equals is the value
      //Right side of equals is the attr type string
      *equalsptr=0; //Convert = into nul
      curfield=equalsptr+1;
      sscanf(linebuf, "0x%" SCNx8, &gzclattrtypes[curfield]);
      gzclattrtypesstr[ gzclattrtypes[curfield] ]=curfield;
      //debuglibifaceptr->debuglib_printf(1, "%s: Found a ZCL attribute data type: %s=%02" PRIX8 "\n", __func__, curfield.c_str(), gzclattrtypes[curfield]);
    } else if (curblock=="clusterdefs") {
      if (strncmp(linebuf, "cluster=", 8)==0) {
        sscanf(linebuf+8, "0x%" SCNx16, &curclusterid);
        curattr=0;
        curmanu=0;
      }
      else if (strncmp(linebuf, "name=", 5)==0) {
        //Initialise cluster definition
        gzigbeeclusterdefs[curclusterid].attrdefs.clear();

        gzigbeeclusterdefs[curclusterid].name=linebuf+5;
        //debuglibifaceptr->debuglib_printf(1, "%s: Processing Cluster: %s=%04" PRIX16 "\n", __func__, gzigbeeclusterdefs[curclusterid].name.c_str(), curclusterid);
      } else if (strncmp(linebuf, "attr=", 5)==0) {
        sscanf(linebuf+5, "0x%" SCNx16, &curattr);
      } else if (strncmp(linebuf, "manu=", 5)==0) {
        if (linebuf[5]=='0' && linebuf[6]=='x') {
          //Hexadecimal type
          sscanf(linebuf+5, "0x%" SCNx16, &curmanu);
        } else {
          try {
            curmanu=gzigbeemanucodes.at(linebuf+5);
          } catch (std::out_of_range& e) {
            debuglibifaceptr->debuglib_printf(1, "%s: Error: Cluster: %04" PRIX16 ", Unknown Manufacturer: %s\n", __func__, curclusterid, linebuf+5);
          }
        }
      } else if (strncmp(linebuf, "attrname=", 9)==0) {
        //Initialise attribute definition
        gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].name=linebuf+9;
      } else if (strncmp(linebuf, "attrdatatype=", 13)==0) {
        if (linebuf[13]=='0' && linebuf[14]=='x') {
          //Hexadecimal type
          sscanf(linebuf+13, "0x%" SCNx8, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype);
        } else {
          try {
            gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype=gzclattrtypes.at(linebuf+13);
          } catch (std::out_of_range& e) {
            debuglibifaceptr->debuglib_printf(1, "%s: Error: Cluster: %04" PRIX16 ", Manufacturer: %04" PRIX16 ", Attribute: %04" PRIX16 ", Unknown Attribute Data Type: %s\n", __func__, curclusterid, curmanu, curattr, linebuf+13);
          }
        }
        //Report value depends on the data type, set to 1
        if (zigbeelib_is_attribute_datatype_analog(gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype)) {
          gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportchange.setdatatype(gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype);
					gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportchange=(uint64_t) 1;
        }
			} else if (strncmp(linebuf, "reporting=", 10)==0) {
				sscanf(linebuf+10, "%d", &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reporting);
      } else if (strncmp(linebuf, "reportmininterval=", 18)==0) {
        if (linebuf[18]=='0' && linebuf[19]=='x') {
					sscanf(linebuf+18, "0x%" SCNx16, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportmininterval);
				} else {
					sscanf(linebuf+18, "%" SCNu16, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportmininterval);
				}
      } else if (strncmp(linebuf, "reportmaxinterval=", 18)==0) {
        if (linebuf[18]=='0' && linebuf[19]=='x') {
					sscanf(linebuf+18, "0x%" SCNx16, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportmaxinterval);
				} else {
					sscanf(linebuf+18, "%" SCNu16, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportmaxinterval);
				}
      } else if (strncmp(linebuf, "reporttimeout=", 14)==0) {
        sscanf(linebuf+14, "%" SCNu16, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reporttimeout);
      } else if (strncmp(linebuf, "reportchange=", 13)==0) {
        if (zigbeelib_is_attribute_datatype_analog(gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype)) {
          gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].reportchange=linebuf+13;
        } else {
          try {
            debuglibifaceptr->debuglib_printf(1, "%s: Reporting Change not allowed for data type: %s\n", __func__, gzclattrtypesstr.at(gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].datatype).c_str());
          } catch (std::out_of_range& e) {
            //Do nothing
          }
        }
      } else if (strncmp(linebuf, "dbfieldtype=", 12)==0) {
				try {
					gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbfieldtype=dbtypes.at(linebuf+12).dbfieldtype;
					gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbsensortype=dbtypes.at(linebuf+12).dbsensortype;
				} catch (std::out_of_range& e) {
					debuglibifaceptr->debuglib_printf(1, "%s: Unknown dbfieldtype: %s\n", __func__, linebuf+12);
				}
			} else if (strncmp(linebuf, "dbfieldname=", 12)==0) {
				gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbfieldname=linebuf+12;
			} else if (strncmp(linebuf, "dbinfieldinitialinterval=", 25)==0) {
				sscanf(linebuf+25, "%ld", &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbinfieldinitialinterval);
			} else if (strncmp(linebuf, "dbinfieldinterval=", 18)==0) {
				sscanf(linebuf+18, "%ld", &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbinfieldinterval);
			} else if (strncmp(linebuf, "dbupdatefieldinterval=", 22)==0) {
				sscanf(linebuf+22, "%ld", &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbupdatefieldinterval);
			} else if (strncmp(linebuf, "dboutfieldinterval=", 19)==0) {
				sscanf(linebuf+19, "%ld", &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dboutfieldinterval);
			} else if (strncmp(linebuf, "dbrstype=", 9)==0) {
				sscanf(linebuf+9, "%" SCNd32, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbrstype);
			} else if (strncmp(linebuf, "dbuom=", 6)==0) {
				sscanf(linebuf+6, "%" SCNd32, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbuom);
			} else if (strncmp(linebuf, "dbbaseconvert=", 14)==0) {
				sscanf(linebuf+14, "%" SCNd32, &gzigbeeclusterdefs[curclusterid].attrdefs[curmanu][curattr].dbbaseconvert);
			}
    } else if (curblock=="zigbeedevicelayouts") {
      if (strncmp(linebuf, "name=", 5)==0) {
        curlayoutname=linebuf+5;

        //Initialise zigbee layout definition
        curzigbeelayout=&gzigbeedevicelayouts[curlayoutname];
        curzigbeelayout->name=curlayoutname;
        curzigbeelayout->endpoints.clear();
				curendpoint=NULL;
				curcluster=NULL;
				curendpointid=0;
				curclusterid=0;
				curmanu=0;
				curattr=0;
      } else if (strncmp(linebuf, "endpointid=", 11)==0) {
        //Hexadecimal type
        sscanf(linebuf+11, "0x%" SCNx8, &curendpointid);
        curendpoint=&curzigbeelayout->endpoints[curendpointid];
        curendpoint->id=curendpointid;
        curendpoint->iclusters.clear();
        curendpoint->oclusters.clear();
        //debuglibifaceptr->debuglib_printf(1, "%s: Processing endpoint: %" PRIx8 "\n", __func__, curendpoint);
      } else if (strncmp(linebuf, "profileid=", 10)==0) {
        uint16_t profileid;
        sscanf(linebuf+10, "0x%" SCNx16, &profileid);
        curendpoint->profile=profileid;
      } else if (strncmp(linebuf, "devid=", 6)==0) {
        uint16_t devid;
        sscanf(linebuf+6, "0x%" SCNx16, &devid);
        curendpoint->devid=devid;
      } else if (strncmp(linebuf, "devver=", 7)==0) {
        uint16_t devver;
        sscanf(linebuf+7, "0x%" SCNx16, &devver);
        curendpoint->devver=devver;
			} else if (strncmp(linebuf, "thingtype=", 10)==0) {
				result=sscanf(linebuf+10, "%" SCNd32, &curendpoint->thingtype);
			} else if (strncmp(linebuf, "thingport=", 10)==0) {
				sscanf(linebuf+10, "%d", &curendpoint->thingport);
      } else if (strncmp(linebuf, "iclusterid=", 11)==0) {
        sscanf(linebuf+11, "0x%" SCNx16, &curclusterid);
        curcluster=&curendpoint->iclusters[curclusterid];
        curcluster->id=curclusterid;
        curcluster->needmoreattrs=0;
        curcluster->isbound=0;
      } else if (strncmp(linebuf, "manu=", 5)==0) {
        if (linebuf[5]=='0' && linebuf[6]=='x') {
          //Hexadecimal type
          sscanf(linebuf+5, "0x%" SCNx16, &curmanu);
        } else {
          try {
            curmanu=gzigbeemanucodes.at(linebuf+5);
          } catch (std::out_of_range& e) {
            debuglibifaceptr->debuglib_printf(1, "%s: Error: Cluster: %04" PRIX16 ", Unknown Manufacturer: %s\n", __func__, curclusterid, linebuf+5);
          }
        }
			} else if (strncmp(linebuf, "attr=", 5)==0) {
				sscanf(linebuf+5, "0x%" SCNx16, &curattr);
				try {
					//Copy attribute values from attribute definition and initialise other attribute values
					curcluster->attrs[curmanu][curattr]=gzigbeeclusterdefs.at(curclusterid).attrdefs.at(curmanu).at(curattr);
				} catch (std::out_of_range& e) {
					debuglibifaceptr->debuglib_printf(1, "%s: Error: Unknown Attribute: %04" PRIX16 " for Cluster: %04" PRIX16 ", Manufacturer: %s (%04" PRIX16 ")\n", __func__, curattr, curclusterid, gzigbeemanucodesstr.at(curmanu).c_str(), curmanu);
					curcluster->attrs[curmanu].erase(curattr);
				}
			}
    } else if (curblock=="zigbeedevices") {
      if (strncmp(linebuf, "manustr=", 8)==0) {
        curmanustr=linebuf+8;
        curmodelstr="";
      } else if (strncmp(linebuf, "model=", 6)==0) {
        curmodelstr=linebuf+6;
      } else if (strncmp(linebuf, "userstr=", 8)==0) {
        gknownzigbeedevices[curmanustr][curmodelstr].name=linebuf+8;
      } else if (strncmp(linebuf, "manu=", 5)==0) {
        if (linebuf[5]=='0' && linebuf[6]=='x') {
          //Hexadecimal type
          sscanf(linebuf+5, "0x%" SCNx16, &gknownzigbeedevices[curmanustr][curmodelstr].manu);
        } else {
          try {
            gknownzigbeedevices[curmanustr][curmodelstr].manu=gzigbeemanucodes.at(linebuf+5);
          } catch (std::out_of_range& e) {
            debuglibifaceptr->debuglib_printf(1, "%s: Error: Zigbee Manuafacturer: %s Device: %s, Unknown Manufacturer: %s\n", __func__, curmanustr.c_str(), curmodelstr.c_str(), linebuf+5);
          }
        }
			} else if (strncmp(linebuf, "minmanudisc=", 12)==0) {
				sscanf(linebuf+12, "0x%" SCNx16, &gknownzigbeedevices[curmanustr][curmodelstr].minmanudisc);
      } else if (strncmp(linebuf, "zigbeelayout=", 13)==0) {
        gknownzigbeedevices[curmanustr][curmodelstr].zigbeelayout=linebuf+13;
      } else if (strncmp(linebuf, "reporting=", 10)==0) {
				sscanf(linebuf+10, "%d", &gknownzigbeedevices[curmanustr][curmodelstr].reporting);
			}
    }
  }
  fclose(file);

  if (fileminver!=1) {
		zigbeelib_unlockzigbee();
    debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
    return;
  }
	zigbeelib_zigbeedefsloaded=true;

  zigbeelib_unlockzigbee();

	debuglibifaceptr->debuglib_printf(1, "%s: Finished loading zigbee definitions\n\n", __func__);

	//Display file version
  debuglibifaceptr->debuglib_printf(1, "%s: Detected max file version: %" PRIi64 ", min file version: %" PRIi64 "\n", __func__, filemaxver, fileminver);

  //Display manucodes
	debuglibifaceptr->debuglib_printf(1, "%s: ------------------\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: Manufacturer Codes\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: ------------------\n", __func__);
  for (auto const &zigbeemanucodesit : gzigbeemanucodes) {
    debuglibifaceptr->debuglib_printf(1, "%s: Manufacturer: %s=%02" PRIX16 "\n", __func__, zigbeemanucodesit.first.c_str(), zigbeemanucodesit.second);
  }
  //Display ZCL Attribute Types
	debuglibifaceptr->debuglib_printf(1, "%s: -------------------\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: ZCL Attribute Types\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: -------------------\n", __func__);
  for (auto const &zclattrtypesit : gzclattrtypes) {
    debuglibifaceptr->debuglib_printf(1, "%s: ZCL Attribute Data Type: %s=%02" PRIX8 "\n", __func__, zclattrtypesit.first.c_str(), zclattrtypesit.second);
  }
  //Display Clusters and Attribute definitions
	debuglibifaceptr->debuglib_printf(1, "%s: -------------------\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: Cluster Definitions\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: -------------------\n", __func__);
  for (auto const &clusterdefit : gzigbeeclusterdefs) {
    debuglibifaceptr->debuglib_printf(1, "%s: Cluster: %s (0x%04" PRIX16 ")\n", __func__, clusterdefit.second.name.c_str(), clusterdefit.first);
    for (auto const &manudefit : clusterdefit.second.attrdefs) {
      debuglibifaceptr->debuglib_printf(1, "%s:   Manufacturer: %s (0x%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_manufacturer_string(manudefit.first).c_str(), manudefit.first);
      for (auto const &attrdefit : manudefit.second) {
        debuglibifaceptr->debuglib_printf(1, "%s:     Attribute: %s (0x%04" PRIX16 ") Data Type: %s (%02" PRIX8 ")\n", __func__, attrdefit.second.name.c_str(), attrdefit.first, zigbeelib_get_zigbee_attrdatatype_string(attrdefit.second.datatype).c_str(), attrdefit.second.datatype);
				debuglibifaceptr->debuglib_printf(1, "%s:       Reporting Enabled: %d\n", __func__, attrdefit.second.reporting);
        debuglibifaceptr->debuglib_printf(1, "%s:       Reporting Min Interval=%" PRIu16 " Reporting Max Interval=%" PRIu16 "\n", __func__, attrdefit.second.reportmininterval, attrdefit.second.reportmaxinterval);
        if (zigbeelib_is_attribute_datatype_analog(attrdefit.second.datatype)) {
          debuglibifaceptr->debuglib_printf(1, "%s:       Reporting Timeout=%" PRIu16 " Reporting Change=%s\n", __func__, attrdefit.second.reporttimeout, attrdefit.second.reportchange.toString().c_str());
        } else {
          debuglibifaceptr->debuglib_printf(1, "%s:       Reporting Timeout=%" PRIu16 "\n", __func__, attrdefit.second.reporttimeout);
        }
        debuglibifaceptr->debuglib_printf(1, "%s:       Database Field Type: 0x%04X\n", __func__, attrdefit.second.dbfieldtype);
				debuglibifaceptr->debuglib_printf(1, "%s:       Database Field Name: %s\n", __func__, attrdefit.second.dbfieldname.c_str());
				if (attrdefit.second.dbinfieldinitialinterval>0 && attrdefit.second.dbinfieldinterval>0) {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database Initial In Interval: %ld, In Interval: %d\n", __func__, attrdefit.second.dbinfieldinitialinterval, attrdefit.second.dbinfieldinterval);
				} else {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database In Disabled\n", __func__);
				}
				if (attrdefit.second.dbupdatefieldinterval>0) {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database Update Interval: %ld\n", __func__, attrdefit.second.dbupdatefieldinterval);
				} else {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database Update Disabled\n", __func__);
				}
				if (attrdefit.second.dboutfieldinterval>0) {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database Output Interval: %ld\n", __func__, attrdefit.second.dboutfieldinterval);
				} else {
					debuglibifaceptr->debuglib_printf(1, "%s:       Database Output Disabled\n", __func__);
				}
				debuglibifaceptr->debuglib_printf(1, "%s:       Database RS Type: %ld\n", __func__, attrdefit.second.dbrstype);
				debuglibifaceptr->debuglib_printf(1, "%s:       Database UOM: %ld\n", __func__, attrdefit.second.dbuom);
				debuglibifaceptr->debuglib_printf(1, "%s:       Database Base Convert: %ld\n", __func__, attrdefit.second.dbbaseconvert);
      }
    }
  }
	//Display Zigbee Device Layouts
	debuglibifaceptr->debuglib_printf(1, "%s: ---------------------\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: Zigbee Device Layouts\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: ---------------------\n", __func__);
	for (auto const &layoutit : gzigbeedevicelayouts) {
		debuglibifaceptr->debuglib_printf(1, "%s: Layout Name: %s\n", __func__, layoutit.first.c_str());
		for (auto const &endpointit : layoutit.second.endpoints) {
			debuglibifaceptr->debuglib_printf(1, "%s:   Endpoint=0x%02" PRIX8 "\n", __func__, endpointit.first);
			debuglibifaceptr->debuglib_printf(1, "%s:   Profileid=0x%04" PRIX16 "\n", __func__, endpointit.second.profile);
			debuglibifaceptr->debuglib_printf(1, "%s:   Devid=0x%04" PRIX16 "\n", __func__, endpointit.second.devid);
			debuglibifaceptr->debuglib_printf(1, "%s:   Devid=0x%02" PRIX8 "\n", __func__, endpointit.second.devver);
			debuglibifaceptr->debuglib_printf(1, "%s:   Thing Type=%" PRId32 "\n", __func__, endpointit.second.thingtype);
			debuglibifaceptr->debuglib_printf(1, "%s:   Thing Port=%d\n", __func__, endpointit.second.thingport);
			for (auto const &clusterit : endpointit.second.iclusters) {
				debuglibifaceptr->debuglib_printf(1, "%s:   Cluster: %s (0x%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_clusterid_string(clusterit.first).c_str(), clusterit.first);
				for (auto const &manuit : clusterit.second.attrs) {
					debuglibifaceptr->debuglib_printf(1, "%s:     Manufacturer: %s (0x%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_manufacturer_string(manuit.first).c_str(), manuit.first);
					for (auto const &attrit : manuit.second) {
						debuglibifaceptr->debuglib_printf(1, "%s:       Attribute: %s (0x%04" PRIX16 ") Data Type: %s (%02" PRIX8 ")\n", __func__, attrit.second.name.c_str(), attrit.first, zigbeelib_get_zigbee_attrdatatype_string(attrit.second.datatype).c_str(), attrit.second.datatype);
					}
				}
			}
		}
	}
	//Display Known Zigbee Devices
	debuglibifaceptr->debuglib_printf(1, "%s: --------------------\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: Known Zigbee Devices\n", __func__);
	debuglibifaceptr->debuglib_printf(1, "%s: --------------------\n", __func__);
	for (auto const &knownmanuit : gknownzigbeedevices) {
		debuglibifaceptr->debuglib_printf(1, "%s: Manufacturer: %s\n", __func__, knownmanuit.first.c_str());
		for (auto const &knowndevit : knownmanuit.second) {
			debuglibifaceptr->debuglib_printf(1, "%s:   Device Model: %s\n", __func__, knowndevit.first.c_str());
			debuglibifaceptr->debuglib_printf(1, "%s:   User Friendly Name: %s\n", __func__, knowndevit.second.name.c_str());
			debuglibifaceptr->debuglib_printf(1, "%s:   Manufacturer: %s (0x%04" PRIX16 ")\n", __func__, zigbeelib_get_zigbee_manufacturer_string(knowndevit.second.manu).c_str(), knowndevit.second.manu);
			debuglibifaceptr->debuglib_printf(1, "%s:   Minimum Manufacturer Specific Discover Cluster: 0x%04" PRIX16 "\n", __func__, knowndevit.second.minmanudisc);
			debuglibifaceptr->debuglib_printf(1, "%s:   Associated Zigbee Layout: %s\n", __func__, knowndevit.second.zigbeelayout.c_str());
			debuglibifaceptr->debuglib_printf(1, "%s:   Reporting: %d\n", __func__, knowndevit.second.reporting);
		}
	}
	debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//Add a zigbee device to the web api client queue
//TODO: Add a check to see if this is the gateway device
static void zigbeelib_add_device_to_webapiclient_queue(int localzigbeeindex, int zigbeeidx) {
  webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=(webapiclientlib_ifaceptrs_ver_1_t *) zigbeelib_deps[WEBAPICLIENTLIB_DEPIDX].ifaceptr;
	webapiclient_zigbeelink_t zigbeelink;

	std::map<int16_t, zigbeedevice_t> &zigbeedevices=zigbeelib_localzigbeedevices[localzigbeeindex].zigbeedevices;
	if (zigbeedevices[zigbeeidx].addr==zigbeelib_localzigbeedevices[localzigbeeindex].addr) {
		//This is a local zigbee
		return;
	}
	std::ostringstream tmpmanuname;

	zigbeelink.localpk=0;
	zigbeelink.localaddr=zigbeelib_localzigbeedevices[localzigbeeindex].addr;
	tmpmanuname << zigbeedevices[zigbeeidx].basicmanuname << " " << zigbeedevices[zigbeeidx].basicmodel;
	zigbeelink.modelname=tmpmanuname.str();
	zigbeelink.addr=zigbeedevices[zigbeeidx].addr;
	zigbeelink.userstr=zigbeedevices[zigbeeidx].userstr;

	for (auto const &endpointit : zigbeedevices[zigbeeidx].endpoints) {
		//debuglibifaceptr->debuglib_printf(1, "%s: SUPER DEBUG Endpoint ID: %d, thingport=%d\n", __func__, endpointit.first, endpointit.second.thingport);
		zigbeelink.things[ endpointit.second.thingport ].type=endpointit.second.thingtype;
		zigbeelink.things[ endpointit.second.thingport ].state=1; //Start in the On state for newly added devices
		for (auto const &clusterit : endpointit.second.iclusters) {
			for (auto const &manuit : clusterit.second.attrs) {
				for (auto const &attrit : manuit.second) {
					webapiclient_io io;

					if (attrit.second.dbfieldtype==DBCOUNTERLIB_COUNTER_WATTUSE_IOPORT_STATE) {
						//Only add sensors here
						continue;
					}
					if (attrit.second.dbfieldname=="") {
						//Need a valid database name to add to the database
						continue;
					}
					io.rstype=attrit.second.dbrstype;
					io.uom=attrit.second.dbuom;
					io.iotype=attrit.second.dbsensortype;
					io.samplerate=0;
					if (attrit.second.dbinfieldinterval>0) {
						io.samplerate=attrit.second.dbinfieldinterval;
					}
					if (attrit.second.dbupdatefieldinterval>0) {
						io.samplerate=attrit.second.dbupdatefieldinterval;
					}
					if (attrit.second.dboutfieldinterval>0) {
						io.samplerate=attrit.second.dboutfieldinterval;
					}
					io.baseconvert=attrit.second.dbbaseconvert;
					io.name=attrit.second.dbfieldname;
					if (io.samplerate>0) {
						//Only add the io if the attribute has a sample rate
						zigbeelink.things[ endpointit.second.thingport ].io.push_back(io);
					}
				}
			}
		}
	}
	webapiclientlibifaceptr->add_zigbee_link_to_webapi_queue(zigbeelink);
}

/*
  Match a zigbee device's basic info with info from the ini file
*/
static void zigbeelib_match_zigbeedevice_basicinfo(int localzigbeeindex, int zigbeeidx, long *localzigbeelocked, long *zigbeelocked) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  zigbeedevice_t *zigbeedeviceptr;
  localzigbeedevice_t *localzigbeedeviceptr;

  MOREDEBUG_ENTERINGFUNC();

  zigbeelib_lockzigbee(zigbeelocked);
  if (!zigbeelib_validate_localzigbeeindex(localzigbeeindex, zigbeelocked)) {
    zigbeelib_unlockzigbee(zigbeelocked);
    MOREDEBUG_EXITINGFUNC();
    return;
  }
  localzigbeedeviceptr=&zigbeelib_localzigbeedevices[localzigbeeindex];
  std::map<int16_t, zigbeedevice_t> &zigbeedevices=localzigbeedeviceptr->zigbeedevices;
  zigbeedeviceptr=&zigbeedevices[zigbeeidx];

	try {
		std::string zigbeeuserstr, zigbeelayoutstr;

		zigbeeuserstr=gknownzigbeedevices.at(zigbeedeviceptr->basicmanuname).at(zigbeedeviceptr->basicmodel).name;
		zigbeelayoutstr=gknownzigbeedevices.at(zigbeedeviceptr->basicmanuname).at(zigbeedeviceptr->basicmodel).zigbeelayout;

		zigbeedeviceptr->userstr=zigbeeuserstr;
		zigbeedeviceptr->havemanu=1;
		zigbeedeviceptr->manu=gknownzigbeedevices.at(zigbeedeviceptr->basicmanuname).at(zigbeedeviceptr->basicmodel).manu;
		zigbeedeviceptr->minmanudisc=gknownzigbeedevices.at(zigbeedeviceptr->basicmanuname).at(zigbeedeviceptr->basicmodel).minmanudisc;
		zigbeedeviceptr->reporting=gknownzigbeedevices.at(zigbeedeviceptr->basicmanuname).at(zigbeedeviceptr->basicmodel).reporting;
		if (zigbeelayoutstr!="") {
			debuglibifaceptr->debuglib_printf(1, "%s, Recognised device: %016" PRIX64 ", %04" PRIX16 " as \"%s\" using layout: %s\n", __func__, zigbeedeviceptr->addr, zigbeedeviceptr->netaddr, zigbeeuserstr.c_str(), zigbeelayoutstr.c_str());
			zigbeedeviceptr->endpoints=gzigbeedevicelayouts.at(zigbeelayoutstr).endpoints;
			zigbeedeviceptr->numendpoints=zigbeedeviceptr->endpoints.size();
			zigbeelib_add_device_to_webapiclient_queue(localzigbeeindex, zigbeeidx);
		} else {
			debuglibifaceptr->debuglib_printf(1, "%s, Recognised device: %016" PRIX64 ", %04" PRIX16 " as \"%s\" with no layout, falling back to full discovery\n", __func__, zigbeedeviceptr->addr, zigbeedeviceptr->netaddr, zigbeeuserstr.c_str());
			zigbeedeviceptr->endpoints.clear();
			zigbeedeviceptr->numendpoints=0;
			zigbeedeviceptr->basicinfonotrecognised=true;

			//Get legacy info straight away
			zigbeelib_get_zigbee_info(localzigbeeindex, zigbeedeviceptr->addr, zigbeedeviceptr->netaddr, zigbeeidx, localzigbeelocked, zigbeelocked);
		}
	} catch (std::exception& e) {
		debuglibifaceptr->debuglib_printf(1, "%s, Unknown device: %s by Manufacturer: %s, falling back to full discovery\n", __func__, zigbeedeviceptr->basicmodel.c_str(), zigbeedeviceptr->basicmanuname.c_str());
		zigbeedeviceptr->basicinfonotrecognised=true;

		//NOTE: Currently needed for the full discovery to work
		zigbeedeviceptr->endpoints.clear();

		//Get legacy info straight away
		zigbeelib_get_zigbee_info(localzigbeeindex, zigbeedeviceptr->addr, zigbeedeviceptr->netaddr, zigbeeidx, localzigbeelocked, zigbeelocked);
	}
  zigbeelib_unlockzigbee(zigbeelocked);

  MOREDEBUG_EXITINGFUNC();
}

//Operations to do just after the configuration is loaded
int zigbeelib_configload_post() {
  initZigbeeDefs();

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int zigbeelib_start(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  int result=0;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  //Start a thread for auto detecting ZigBee devices and adding pulse monitors for them
  if (zigbeelib_mainthread==0) {
    debuglibifaceptr->debuglib_printf(1, "%s: Starting the main thread\n", __func__);
    result=pthread_create(&zigbeelib_mainthread, NULL, zigbeelib_mainloop, (void *) ((unsigned short) 0));
    if (result!=0) {
      debuglibifaceptr->debuglib_printf(1, "%s: Failed to spawn main thread\n", __func__);
      result=-1;
    }
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return result;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
//NOTE: No need to wait for response and detecting device since the other libraries will also have their stop function called before
//  this library's shutdown function is called.
void zigbeelib_stop(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (zigbeelib_mainthread!=0) {
    //Cancel the main thread and wait for it to exit
    debuglibifaceptr->debuglib_printf(1, "%s: Cancelling the main thread\n", __func__);
    PTHREAD_LOCK(&zigbeelibmutex);
    needtoquit=1;
    sem_post(&zigbeelib_mainthreadsleepsem);
    PTHREAD_UNLOCK(&zigbeelibmutex);
    debuglibifaceptr->debuglib_printf(1, "%s: Waiting for main thread to exit\n", __func__);
    pthread_join(zigbeelib_mainthread, NULL);
    zigbeelib_mainthread=0;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
int zigbeelib_init(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=(dbcounterlib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBCOUNTERLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBLIB_DEPIDX].ifaceptr;
  webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=(webapiclientlib_ifaceptrs_ver_1_t *) zigbeelib_deps[WEBAPICLIENTLIB_DEPIDX].ifaceptr;
  int i;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

#ifdef DEBUG
  locklibifaceptr=(locklib_ifaceptrs_ver_1_t *) zigbeelib_deps[LOCKLIB_DEPIDX].ifaceptr;
#endif

  if (zigbeelib_shuttingdown) {
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already shutting down\n", __func__);
    return -1;
  }
  ++zigbeelib_inuse;
  if (zigbeelib_inuse>1) {
    //Already initialised
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, already initialised, use count=%d\n", __func__, zigbeelib_inuse);
    return -1;
  }
  //Let the dbcounter library know that we want to use it
  dbcounterlibifaceptr->init();
  //Let the database library know that we want to use it
  if (dblibifaceptr) {
    dblibifaceptr->init();
  }
  //Let the web api client library know that we want to use it
  webapiclientlibifaceptr->init();

  needtoquit=0;
  if (sem_init(&zigbeelib_mainthreadsleepsem, 0, 0)==-1) {
    //Can't initialise semaphore
    debuglibifaceptr->debuglib_printf(1, "Exiting %s: Can't initialise main thread sleep semaphore\n", __func__);
    return -2;
  }
  zigbeelib_numlocalzigbeedevices=0;
  if (!zigbeelib_localzigbeedevices) {
		try {
			zigbeelib_localzigbeedevices=new localzigbeedevice_t[MAX_LOCALZIGBEE_DEVICES];
		} catch (std::bad_alloc& e) {
      debuglibifaceptr->debuglib_printf(1, "Exiting %s: Failed to allocate ram for local zigbee devices\n", __func__);
      return -3;
    }
	}
  //Clear and initialise the new array elements
  for (i=0; i<MAX_LOCALZIGBEE_DEVICES; i++) {
    zigbeelib_localzigbeedevices[i].removed=1;
  }
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);

  return 0;
}

//NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
void zigbeelib_shutdown(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  dbcounterlib_ifaceptrs_ver_1_t *dbcounterlibifaceptr=(dbcounterlib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBCOUNTERLIB_DEPIDX].ifaceptr;
  dblib_ifaceptrs_ver_1_t *dblibifaceptr=(dblib_ifaceptrs_ver_1_t *) zigbeelib_deps[DBLIB_DEPIDX].ifaceptr;
  webapiclientlib_ifaceptrs_ver_1_t *webapiclientlibifaceptr=(webapiclientlib_ifaceptrs_ver_1_t *) zigbeelib_deps[WEBAPICLIENTLIB_DEPIDX].ifaceptr;
  int i, j;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);
  if (zigbeelib_inuse==0) {
    //Already uninitialised
    debuglibifaceptr->debuglib_printf(1, "WARNING: Exiting %s, Already shutdown\n", __func__);
    return;
  }
  --zigbeelib_inuse;
  if (zigbeelib_inuse>0) {
    //Module still in use
    debuglibifaceptr->debuglib_printf(1, "Exiting %s, Still in use, use count=%d\n", __func__, zigbeelib_inuse);
    return;
  }
  //Start shutting down library
  zigbeelib_shuttingdown=1;

  //Finished using the web api client library
  webapiclientlibifaceptr->shutdown();

  //Finished using the database library
  if (dblibifaceptr) {
    dblibifaceptr->shutdown();
  }
  zigbeelib_shuttingdown=0;

  //Free allocated memory
  if (zigbeelib_localzigbeedevices) {
    for (i=0; i<zigbeelib_numlocalzigbeedevices; i++) {
			//NOTE: C++ destructors will auto cleanup when the parent structures are cleared
			zigbeelib_localzigbeedevices[i].zigbeedevices.clear();
			zigbeelib_localzigbeedevices[i].zigbeedeviceaddr.clear();
			zigbeelib_localzigbeedevices[i].zigbeedevicenetaddr.clear();
      for (j=0; j<MAX_SEND_QUEUE_ITEMS; j++) {
        if (zigbeelib_localzigbeedevices[i].sendqueue_items[j].packet) {
          free(zigbeelib_localzigbeedevices[i].sendqueue_items[j].packet);
        }
      }
    }
    zigbeelib_numlocalzigbeedevices=0;
    delete[] zigbeelib_localzigbeedevices;
    zigbeelib_localzigbeedevices=NULL;
  }
  //Finished using the dbcounter library
  dbcounterlibifaceptr->shutdown();

  sem_destroy(&zigbeelib_mainthreadsleepsem);

  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Register all the listeners for zigbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void zigbeelib_register_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) zigbeelib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;
  auto configlibifaceptr=(configlib_ifaceptrs_ver_1_cpp_t *) zigbeelib_deps[CONFIGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_register_cmd_listener(zigbeelib_processcommand);
  }
  configlibifaceptr->configlib_register_readcfgfile_post_listener(zigbeelib_configload_post);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

/*
  Unregister all the listeners for zigbee library
  NOTE: Don't need to thread lock since when this function is called only one thread will be using the variables that are used in this function
*/
void zigbeelib_unregister_listeners(void) {
  debuglib_ifaceptrs_ver_1_t *debuglibifaceptr=(debuglib_ifaceptrs_ver_1_t *) zigbeelib_deps[DEBUGLIB_DEPIDX].ifaceptr;
  cmdserverlib_ifaceptrs_ver_1_t *cmdserverlibifaceptr=(cmdserverlib_ifaceptrs_ver_1_t *) zigbeelib_deps[CMDSERVERLIB_DEPIDX].ifaceptr;
  auto configlibifaceptr=(configlib_ifaceptrs_ver_1_cpp_t *) zigbeelib_deps[CONFIGLIB_DEPIDX].ifaceptr;

  debuglibifaceptr->debuglib_printf(1, "Entering %s\n", __func__);

  if (cmdserverlibifaceptr) {
    cmdserverlibifaceptr->cmdserverlib_unregister_cmd_listener(zigbeelib_processcommand);
  }
  configlibifaceptr->configlib_unregister_readcfgfile_post_listener(zigbeelib_configload_post);
  debuglibifaceptr->debuglib_printf(1, "Exiting %s\n", __func__);
}

moduleinfo_ver_generic_t *zigbeelib_getmoduleinfo() {
  return (moduleinfo_ver_generic_t *) &zigbeelib_moduleinfo_ver_1;
}

#ifdef __ANDROID__
jlong Java_com_capsicumcorp_iomy_libraries_watchinputs_ZigbeeLib_jnigetmodulesinfo( JNIEnv* env, jobject obj) {
  return (jlong) zigbeelib_getmoduleinfo();
}
#endif
