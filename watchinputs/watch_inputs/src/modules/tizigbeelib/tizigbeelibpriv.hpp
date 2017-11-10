/*
Title: Texas Instruments Z-Stack Library Header for Watch Inputs
Author: Matthew Stapleton (Capsicum Corporation) <matthew@capsicumcorp.com>
Description: Header File for tizigbeelib.c
Copyright: Capsicum Corporation 2017

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

Xbee info sourced from Digi docs
*/

#ifndef TIZIGBEELIB_HPP
#define TIZIGBEELIB_HPP

//TI Zigbee Structures

//This header is present in every TI Zigbee api packet
//LSB 1-byte Checksum follows the payload and is the sum of all values from primary header to end of payload
typedef struct {
  uint8_t frame_start; //Always set to 0xFE
  uint8_t length; //Number of bytes between the length and the checksum
  uint16_t cmd; //TI Zigbee Command : First byte: MSB, Second byte: LSB
  uint8_t payload; //Payload goes here: set by the caller, variable length
} __attribute__((packed)) tizigbee_api_header_t;

#endif
