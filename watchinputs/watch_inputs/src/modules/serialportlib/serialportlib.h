/*
Title: Serial Port Abstraction Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for serialportlib.c
Copyright: Capsicum Corporation 2014-2016

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

#ifndef SERIALPORTLIB_H
#define SERIALPORTLIB_H

#include <stdint.h>

#pragma pack(push)
#pragma pack(1) //Pack the structures to 1 byte boundary as pointers to the structure variables will be passed around between multiple libraries

//Interface for this library to interface with low level serial device libraries
//NOTE: You can always cleanup your serial device structures when your shutdown function is called regardless
//  of whether other libraries are marked as using unless other libraries have called your init function
//  as well to indicate in use.
typedef struct {
  //Get the name of the library handling this serial port
  //Should return the name of the module
  const char *(*serial_port_get_module_name)(void *serialport);

  //Get a unique id for this serial port
  //Should return a fairly unique id that other libraries can identify this serial port with
  const char *(*serial_port_get_unique_id)(void *serialport);
  int (*serial_port_reset)(void *serialport);
  int (*serial_port_get_baud_rate)(void *serialport);
  int (*serial_port_set_baud_rate)(void *serialport, int32_t baudrate);
  int (*serial_port_send)(void *serialport, const void *buf, size_t count);

  //Check if a serial port has data available in the receive buffer
  //Returns 1 if ready to receive data, 0 if no data is available, or negative value if serial port has an error
  //Set this function to NULL if not implemented
  int (*serial_port_get_ready_to_receive)(void *serialport);

  //Wait until a serial port has data available in the receive buffer
  //Returns 1 if ready to receive data, 0 if no data is available, or negative value if serial port has an error
  //Set this function to NULL if not implemented
  int (*serial_port_wait_ready_to_receive)(void *serialport);

  //Get data from the serial port
  //Returns number of bytes received, 0 if no data is available, or negative value if serial port has an error
  //Args: serbuf The buffer to store the data in
  //      count The maximum size of the buffer
  int (*serial_port_receive_data)(void *serialport, char *serbuf, int count);

  //This library will call this function when the structures for this serial port are no longer needed
  //After this function is called, the low level library can remove all info about this serial port
  void (*serial_port_no_longer_using)(void *serialport);
} serialdevicelib_iface_ver_1_t;

//Interfer for this library to interface with high level library handlers
typedef struct {
  //The name of the library for this serial handler
  const char *modulename;

  //A function used to check if the handler supports a serial device
  int (*isDeviceSupportedptr)(int serdevidx, int (*sendFuncptr)(int serdevidx, const void *buf, size_t count));

  //A function called when the serial device receives data
  void (*receiveFuncptr)(int serdevidx, int handlerdevidx, char *serbuf, int serbufcnt);

  //A function called when the serial device has been removed
  //Should return 1 on success, 0 if still in use, or negative value on error
  int (*serial_device_removed)(int serdevidx);
} serialdevicehandler_iface_ver_1_t;

//Array of pointers to functions and variables we want to make available to other modules
//Public interface for seriallib module
typedef struct {
  //Initialise this serial port library or tell this library that it is in use by another library
  int (*init)(void);

  //Shutdown this serial port library or tell this library that it is no longer in use by another library
  void (*shutdown)(void);

  //Tell this library that a new serial port is available for use
  //The low level library that calls this function must open the serial port before calling this function
  //WARNING: You should never add the same serial port more than once without previously removing it
  //Args: serialdevicelib is a pointer to a structure with functions that this library can call to interface with the serial port
  //      serialport is a pointer to a private structure that contains info about the open serial port
  //Returns: 1 on success or negative value on error
  //  If an error is returned, assume that the serial port wasn't added to this library
  int (*serial_port_add)(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport);

  //Tell this library to remove a serial port that was being used
  //The low level library that calls this function must keep the serial port structure in tact until this function is complete
  //  but doesn't need to have the serial port open.  This library may need to get the unique id
  //  to find the correct structure to remove
  //Args: serialdevicelib is a pointer to a structure with functions that this library can call to interface with the serial port
  //      serialport is a pointer to a private structure that contains info about the open serial port
  //Returns: 1 on success or negative value on error
  //  If an error is returned assume that the serial port wasn't removed from this library
  int (*serial_port_remove)(const serialdevicelib_iface_ver_1_t *serialdevicelib, void *serialport);

  //Use by high level libraries to send serial data over a serial port
  int (*serialsend)(int serdevidx, const void *buf, size_t count);

  //Get the unique id string of a serial port
  const char *(*serial_port_get_unique_id)(int serdevidx);

  int (*register_serial_handler)(serialdevicehandler_iface_ver_1_t *serialdevicehandler);
  int (*unregister_serial_handler)(serialdevicehandler_iface_ver_1_t *serialdevicehandler);
} serialportlib_ifaceptrs_ver_1_t;

#pragma pack(pop)

#define SERIALPORTLIBINTERFACE_VER_1 1 //A version number for the serialportlib interface version

#define SERIALDEVICELIBINTERFACE_VER_1 1 //A version number for the interface that low level serial libraries use

#define SERIALDEVICEHANDLERINTERFACE_VER_1 1 //A version number for the interface that high level serial libraries use

#endif
