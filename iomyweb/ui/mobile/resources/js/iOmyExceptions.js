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
}

//----------------------------------------------------------------------------//
// Sessions and Users
//----------------------------------------------------------------------------//
function UserNotSignedInException(message) {
    IOmyException.call(this, message);
    this.name       = "UserNotSignedInException";
}

//----------------------------------------------------------------------------//
// Missing arguments
//----------------------------------------------------------------------------//
function MissingArgumentException(message) {
    IOmyException.call(this, message);
    this.name       = "MissingArgumentException";
}

function MissingSettingsMapException(message) {
    MissingArgumentException.call(this, message);
    this.name       = "MissingSettingsMapException";
}

//----------------------------------------------------------------------------//
// Room Management
//----------------------------------------------------------------------------//
function DevicesStillInRoomException(message) {
    IOmyException.call(this, message);
    this.name       = "DevicesStillInRoomException";
}

function AttemptToDeleteOnlyRoomException(message) {
    IOmyException.call(this, message);
    this.name       = "AttemptToDeleteOnlyRoomException";
}