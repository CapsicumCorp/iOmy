/*
Title: Exceptions for iOmy
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares exception objects specific to iOmy.
Copyright: Capsicum Corporation 2016, 2017

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

/**
 * A general exception object for iOmy.
 * 
 * @param {type} message        Error message
 * @returns {iOmyException}
 */
function iOmyException(message) {
	if (message === undefined || message === null || message === false) {
		message = "An exception has occurred in iOmy. No error message specified.";
	}
	
    this.name       = "iOmyException";
    this.message    = message;
    
    this.getMessage = function () {
        return this.name + ": " + this.message;
    };
    
}

//----------------------------------------------------------------------------//
// Sessions, Users, and Permissions
//----------------------------------------------------------------------------//
function UserNotSignedInException(message) {
    iOmyException.call(this, message);
    this.name       = "UserNotSignedInException";
}

function PermissionException(message) {
    iOmyException.call(this, message);
    this.name       = "PermissionException";
}

function InvalidRoomPermissionException(message) {
    PermissionException.call(this, message);
    this.name       = "InvalidRoomPermissionException";
}

function InvalidPremisePermissionException(message) {
    PermissionException.call(this, message);
    this.name       = "InvalidPremisePermissionException";
}

//----------------------------------------------------------------------------//
// Missing and invalid arguments
//----------------------------------------------------------------------------//
function MissingArgumentException(message) {
    iOmyException.call(this, message);
    this.name       = "MissingArgumentException";
}

function MissingSettingsMapException(message) {
    //------------------------------------------------------------------------//
    // This exception can have a simple default not found message if one is
    // not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "A Javascript object containing parameters is required!";
    }
    
    MissingArgumentException.call(this, message);
    this.name       = "MissingSettingsMapException";
}

function IllegalArgumentException(message) {
    iOmyException.call(this, message);
    this.name       = "IllegalArgumentException";
}

function ThingIDNotValidException(message) {
	IllegalArgumentException.call(this, message);
	this.name       = "ThingIDNotValidException";
}

//----------------------------------------------------------------------------//
// Room Management
//----------------------------------------------------------------------------//
function RoomException(message, roomName) {
    iOmyException.call(this, message);
    this.name       = "RoomException";
    this.room       = roomName;
}

function DevicesStillInRoomException(message, roomName) {
    RoomException.call(this, message, roomName);
    this.name       = "DevicesStillInRoomException";
}

function AttemptToDeleteOnlyRoomException(message, roomName) {
    RoomException.call(this, message, roomName);
    this.name       = "AttemptToDeleteOnlyRoomException";
}

//----------------------------------------------------------------------------//
// Premises and Rooms
//----------------------------------------------------------------------------//
function NoPremisesVisibleException(message) {
    iOmyException.call(this, message);
    this.name       = "NoPremisesVisibleException";
}

function NoRoomsFoundException(message) {
	//------------------------------------------------------------------------//
    // This exception can have a simple "No rooms detected" message if one is
    // not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "No rooms detected!";
    }
    
    ObjectNotFoundException.call(this, message);
    this.name       = "NoRoomsFoundException";
}

//----------------------------------------------------------------------------//
// Objects not found
//----------------------------------------------------------------------------//
function ObjectNotFoundException(message) {
    iOmyException.call(this, message);
    this.name       = "ObjectNotFoundException";
}

function PremiseNotFoundException(message) {
    //------------------------------------------------------------------------//
    // This exception can have a simple "Premise not found" message if one is
    // not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Premise Not Found!";
    }
    
    ObjectNotFoundException.call(this, message);
    this.name       = "PremiseNotFoundException";
}

function HubNotFoundException(message) {
	//------------------------------------------------------------------------//
    // This exception can have a simple "Hub not found" message if one is
    // not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Hub Not Found!";
    }
    
    ObjectNotFoundException.call(this, message);
    this.name       = "HubNotFoundException";
}

function LinkNotFoundException(message) {
    //------------------------------------------------------------------------//
    // This exception can have a simple "Link not found" message if one is not
    // provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Link Not Found!";
    }
    
    ObjectNotFoundException.call(this, message);
    this.name       = "LinkNotFoundException";
}

function RoomNotFoundException(message) {
	//------------------------------------------------------------------------//
    // This exception can have a simple "Room not found" message if one is not
    // provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Room Not Found!";
    }
    
    ObjectNotFoundException.call(this, message);
    this.name       = "RoomNotFoundException";
}

//----------------------------------------------------------------------------//
// Device Exceptions
//----------------------------------------------------------------------------//

function SerialCodeNullException(message) {
    //------------------------------------------------------------------------//
    // This exception can have a simple "Serial Code is null" message if one is
    // not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Serial Code is null.";
    }
    
    iOmyException.call(this, message);
    this.name = "SerialCodeNullException";
}

function NoZigbeeModemsException(message) {
    //------------------------------------------------------------------------//
    // This exception can have a simple "There are no Zigbee modems attached."
    // message if one is not provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "There are no Zigbee modems attached.";
    }
    
    iOmyException.call(this, message);
    this.name = "NoZigbeeModemsException";
}

function StreamURLNotFoundException(message) {
	//------------------------------------------------------------------------//
    // This exception can have a simple not found message if one is not
	// provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Could not find the stream IO in the given thing. The thing given may not be an Onvif stream.";
    }
    
    iOmyException.call(this, message);
    this.name = "StreamURLNotFoundException";
}

function ThumbnailURLNotFoundException(message) {
	//------------------------------------------------------------------------//
    // This exception can have a simple not found message if one is not
	// provided.
    //------------------------------------------------------------------------//
    if (message === undefined || message === null || message === "") {
        message = "Could not find the thumbnail IO in the given thing. The thing given may not be an Onvif stream.";
    }
    
    iOmyException.call(this, message);
    this.name = "ThumbnailURLNotFoundException";
}