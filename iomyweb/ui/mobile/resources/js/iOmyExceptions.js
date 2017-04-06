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
function IOmyException(message) {
    this.name       = "iOmyException";
    this.message    = message;
    
    this.getMessage = function () {
        return this.name + ": " + this.message;
    };
    
    //jQuery.sap.log.error(message);
}

//----------------------------------------------------------------------------//
// Pages
//----------------------------------------------------------------------------//

//----------------------------------------------------------------------------//
// Sessions, Users, and Permissions
//----------------------------------------------------------------------------//
function UserNotSignedInException(message) {
    IOmyException.call(this, message);
    this.name       = "UserNotSignedInException";
}

function PermissionException(message) {
    IOmyException.call(this, message);
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
    IOmyException.call(this, message);
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
    IOmyException.call(this, message);
    this.name       = "IllegalArgumentException";
}

//----------------------------------------------------------------------------//
// Room Management
//----------------------------------------------------------------------------//
function RoomException(message, roomName) {
    IOmyException.call(this, message);
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
// Premises
//----------------------------------------------------------------------------//
function NoPremisesVisibleException(message) {
    IOmyException.call(this, message);
    this.name       = "NoPremisesVisibleException";
}

//----------------------------------------------------------------------------//
// Objects not found
//----------------------------------------------------------------------------//
function ObjectNotFoundException(message) {
    IOmyException.call(this, message);
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