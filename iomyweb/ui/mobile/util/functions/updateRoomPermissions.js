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

$.sap.declare("IOMy.functions.deleteRoom",true);

$.extend(IOMy.functions, {
    
    /**
     * Gives or revokes certain permissions of a given room from a specified
     * user.
     * 
     * A Javascript object must be parsed and has the following parameters:
     * 
     * * Required:
     *      - userID            : {Number}              ID of the user
     *      - roomID            : {Number}              ID of the room
     *      - read              : {Boolean | Number}    New read permission
     *      - details           : {Boolean | Number}    New room details permission
     *      - write             : {Boolean | Number}    New write permission
     *      - deviceManagement  : {Boolean | Number}    New device management permission
     *      
     * * Optional:
     *      - callingWidget     : {UI5 object}      Widget that invoked this function. (default: null)
     *      - onSuccess         : {function}        Function to run if successful. (default: empty function)
     *      - onFail            : {function}        Function to run on failure. (default: empty function)
     * 
     * @throws 
     * @param {type} mSettings
     * @returns {undefined}
     */
    updateRoomPermissions : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise important variables
        //--------------------------------------------------------------------//
        var bError              = false;
        var aErrorMessages      = [];
        var wCallingWidget      = null;
        var iUserId             = 0;
        var iRoomId             = 0;
        var iReadAccess         = 0;
        var iInfoAccess         = 0;
        var iWriteAccess        = 0;
        var iDeviceManageAccess = 0;
		var oPage;
        
        //--------------------------------------------------------------------//
        // Check the settings map and assign default values if necessary.
        //--------------------------------------------------------------------//
        //-- If it does exist, check that the room information map is there. --//
        if (mSettings === undefined) {
            bError = true;
            aErrorMessages.push("A map (associative array) of room information is required!");
        }
        
        // Throw an exception if the settings map is missing.
        if (bError) {
            throw new MissingSettingsMapException(aErrorMessages.join('\n'));
        }
        
        //--------------------------------------------------------------------//
        // Check the settings map for the user ID
        //--------------------------------------------------------------------//
        if (mSettings.userID !== undefined) {
            iUserId = mSettings.userID;
        } else {
            bError = true;
            aErrorMessages.push("User ID is required!");
        }

        //--------------------------------------------------------------------//
        // Check the settings map for the room ID
        //--------------------------------------------------------------------//
        if (mSettings.roomID !== undefined) {
            iRoomId = mSettings.roomID;
        } else {
            bError = true;
            aErrorMessages.push("Room ID is required!");
        }
        
        //--------------------------------------------------------------------//
        // Check that the new permission settings are specified.
        //--------------------------------------------------------------------//
        //---------------------//
        //-- Read permission --//
        //---------------------//
        if (mSettings.read !== undefined && mSettings.read !== null) {
            if (typeof mSettings.read === "boolean") {
                iReadAccess = mSettings.read === true ? 1 : 0;
                
            } else if (isNaN(mSettings.read) === false) {
                iReadAccess = mSettings.read;
                
            } else {
                bError = true;
                aErrorMessages.push("Read permission setting must be set either as a boolean or a number (0 or 1)!");
            }
        } else {
            // If so, capture it and disable it.
            bError = true;
            aErrorMessages.push("Read permission setting must be set either as a boolean or a number (0 or 1)!");
        }
        
        //----------------------------//
        //-- Information permission --//
        //----------------------------//
        if (mSettings.details !== undefined && mSettings.details !== null) {
            if (typeof mSettings.details === "boolean") {
                iInfoAccess = mSettings.details === true ? 1 : 0;
                
            } else if (isNaN(mSettings.details) === false) {
                iInfoAccess = mSettings.details;
                
            } else {
                bError = true;
                aErrorMessages.push("Room detail permission setting must be set either as a boolean or a number (0 or 1)!");
            }
        } else {
            // If so, capture it and disable it.
            bError = true;
            aErrorMessages.push("Room detail permission setting must be set either as a boolean or a number (0 or 1)!");
        }
        
        //----------------------//
        //-- Write permission --//
        //----------------------//
        if (mSettings.write !== undefined && mSettings.write !== null) {
            if (typeof mSettings.write === "boolean") {
                iWriteAccess = mSettings.write === true ? 1 : 0;
                
            } else if (isNaN(mSettings.write) === false) {
                iWriteAccess = mSettings.write;
                
            } else {
                bError = true;
                aErrorMessages.push("Write permission setting must be set either as a boolean or a number (0 or 1)!");
            }
        } else {
            // If so, capture it and disable it.
            bError = true;
            aErrorMessages.push("Write permission setting must be set either as a boolean or a number (0 or 1)!");
        }
        
        //----------------------------------//
        //-- Device management permission --//
        //----------------------------------//
        if (mSettings.deviceManagement !== undefined && mSettings.deviceManagement !== null) {
            if (typeof mSettings.deviceManagement === "boolean") {
                iDeviceManageAccess = mSettings.deviceManagement === true ? 1 : 0;
                
            } else if (isNaN(mSettings.deviceManagement) === false) {
                iDeviceManageAccess = mSettings.deviceManagement;
                
            } else {
                bError = true;
                aErrorMessages.push("Device management permission setting must be set either as a boolean or a number (0 or 1)!");
            }
        } else {
            // If so, capture it and disable it.
            bError = true;
            aErrorMessages.push("Device management permission setting must be set either as a boolean or a number (0 or 1)!");
        }
		
		//----------------------------------------------//
        //-- Check that premise field is specified.   --//
        //----------------------------------------------//
        if (mSettings.view === undefined || mSettings.view === null) {
            bError = true;
            aErrorMessages.push("UI5 view or controller not specified.");
        } else {
            oPage = mSettings.view;
        }
        
        //--------------------------------------------------------------------//
        // Check that the calling widget is specified.
        //--------------------------------------------------------------------//
        if (mSettings.callingWidget === undefined || mSettings.callingWidget === null) {
            wCallingWidget = null; // No UI5 widget has called this function.
        } else {
            // If so, capture it and disable it.
            wCallingWidget = mSettings.callingWidget;
            wCallingWidget.setEnabled(false);
        }
        
        //--------------------------------------------------------------------//
        // Check the settings map for two callback functions.
        //--------------------------------------------------------------------//
        //-- Success callback --//
        if (mSettings.onSuccess === undefined) {
            fnSuccess = function () {};
        } else {
            fnSuccess = mSettings.onSuccess;
        }

        //-- Failure callback --//
        if (mSettings.onFail === undefined) {
            fnFail = function () {};
        } else {
            fnFail = mSettings.onFail;
        }
        
        //--------------------------------------------------------------------//
        // If all is well, run the API to give permission to the current user to
        // access it.
        //--------------------------------------------------------------------//
        if (bError === false) {
            try {
                IOMy.apiphp.AjaxRequest({
                    url : IOMy.apiphp.APILocation("permissions"),
                    data : {
                        "Mode" : "UpdateRoomPerms",
                        "UserId" : iUserId,
                        "RoomId" : iRoomId,
                        "Data" : "{\"Read\":"+iReadAccess+",\"DataRead\":"+iInfoAccess+",\"Write\":"+iWriteAccess+",\"StateToggle\":"+iDeviceManageAccess+"}"
                    },

                    onSuccess : function (responseType, permData) {
                        var sErrMessage;
                        
                        if (permData.Error === false) {
                            //-- Execute the success callback function. --//
                            fnSuccess();
                        } else {
                            sErrMessage = "There was an error updating the room permissions: "+permData.ErrMesg;
                            jQuery.sap.log.error(sErrMessage);
                            
                            //-- Execute the failure callback function. --//
                            fnFail();
                            
                            //-- Enable this switch --//
                            if (wCallingWidget !== null) {
                                wCallingWidget.setEnabled(true);
                            }
							
							IOMy.common.NavigationToggleNavButtons(oPage, true);
                        }
                    },

                    onFail : function (response) {
                        var sErrMessage = "There was an error updating the room permissions: "+JSON.stringify(response);
                        jQuery.sap.log.error(sErrMessage);
                        
                        //-- Execute the failure callback function. --//
                        fnFail();
                        
                        //-- Enable this switch --//
                        if (wCallingWidget !== null) {
                            wCallingWidget.setEnabled(true);
                        }
						
						IOMy.common.NavigationToggleNavButtons(oPage, true);
                    }

                });
            } catch (eUpdatePermissionsError) {
                jQuery.sap.log.error(eUpdatePermissionsError.message);
                IOMy.common.showError(eUpdatePermissionsError.message, "Server Error");
            }
        }
    }
    
});