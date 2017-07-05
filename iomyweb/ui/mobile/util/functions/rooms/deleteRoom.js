/*
Title: Extension of Function Library (Delete Room)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes a function to delete a room 
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

$.sap.declare("IOMy.functions.rooms.deleteRoom",true);

$.extend(IOMy.functions, {
    
    /**
     * Deletes a given room from the user and takes any further action specified
     * by a given function if one is specified.
     * 
     * Throws an exception when either the room ID is not valid or if the API
     * to delete a room could not be called.
     * 
     * @param {type} iRoomId        ID of the room to remove
     * @param {type} fnCallback     Function to run once done. (OPTIONAL)
     */
    deleteRoom : function (iRoomId, fnCallback) {
        //--------------------------------------------------------------------//
        // Declare and initialise variables and verify that the room ID is given
        // and that it is valid.
        //--------------------------------------------------------------------//
        var validator               = IOMy.validation;
        var mRoomIDResult           = validator.isRoomIDValid(iRoomId);
        var oRoomToDelete           = null;
        var iNumOfDevices           = 0;
        var sErrMessage             = "";
        var iNumOfRooms             = 0;
        
        if (mRoomIDResult.bResult === false) {
            throw mRoomIDResult.aErrorMessages.join('\n');
        }
        
        //-- Check the callback function. --//
        //-- TODO: This parameter will be used in this function later. --//
        if (fnCallback === undefined) {
            fnCallback = function () {}; // Declare that it's an empty function.
        }

        //--------------------------------------------------------------------//
        // If there are any devices still attached, these will need to be
        // removed first. Throw an exception.
        //--------------------------------------------------------------------//
        iNumOfDevices = IOMy.functions.getNumberOfDevicesInRoom(iRoomId);
        if (iNumOfDevices > 0) {
            sErrMessage += "There ";
            
            if (iNumOfDevices === 1) {
                sErrMessage += "is "+iNumOfDevices+" device";
            } else {
                sErrMessage += "are "+iNumOfDevices+" devices";
            }
            
            sErrMessage += " still assigned to this room.\n\n";
            sErrMessage += "Remove the devices from this room before deleting it.";

            jQuery.sap.log.error(sErrMessage);
            
            throw new DevicesStillInRoomException(sErrMessage);
            
        }
        
        //--------------------------------------------------------------------//
        // If this room is the only one registered in iOmy, it should not be
        // deleted.
        //--------------------------------------------------------------------//
        iNumOfRooms             = IOMy.functions.getNumberOfRooms(true); // TRUE to include the "Unassigned" room.
        if (iNumOfRooms === 1) {
            sErrMessage = "This is the only room left in iOmy! You need at least "+
                    "one room to assign new devices to. This room will not be deleted " +
                    "until you create another one.";
            
            jQuery.sap.log.error(sErrMessage);
            
            throw new AttemptToDeleteOnlyRoomException(sErrMessage);
        }
        
        //--------------------------------------------------------------------//
        // Run the API Ajax request to delete the room.
        //--------------------------------------------------------------------//
        try {
            IOMy.apiphp.AjaxRequest({
                url: IOMy.apiphp.APILocation("rooms"),
                data : {"Mode" : "DeleteRoom", "Id" : iRoomId},

                onSuccess : function () {
                    
                    IOMy.common.RefreshCoreVariables({
						onSuccess : fnCallback
					});
					
                },

                onFail : function (response) {

                    IOMy.common.showError(oRoomToDelete.RoomName+" could not be removed:\n\n" + response.ErrMesg, "Error");
                    jQuery.sap.log.error(oRoomToDelete.RoomName+" could not be removed.\n" + response.ErrMesg);

                }
            });
        } catch (eAPIAccessError) {
            throw eAPIAccessError.message;
        }
    }
    
});