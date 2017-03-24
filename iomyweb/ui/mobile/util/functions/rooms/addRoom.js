/*
Title: Extension of Function Library (Add Room)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Includes a function to add a room 
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

$.sap.declare("IOMy.functions.rooms.addRoom",true);

$.extend(IOMy.functions, {
    
    addRoom : function (mSettings) {
        //--------------------------------------------------------------------//
        // Declare and initialise important variables
        //--------------------------------------------------------------------//
        var me                  = this;
        var bError              = false;
        var aErrorMessages      = [];
        var sRoomText           = "";
        var sRoomDesc           = "";
        var iRoomTypeId         = 0;
        var iPremiseId          = 0;
        var iUserId             = 0;
        var wCallingWidget      = null;
        var wPremise            = null;
        var wRoomName           = null;
        var wRoomDescription    = null;
        var wRoomType           = null;
        
        //--------------------------------------------------------------------//
        // Check room info map and assign default values if necessary.
        //--------------------------------------------------------------------//
        //-- If it does exist, check that the room information map is there. --//
        if (mSettings === undefined) {
            bError = true;
            aErrorMessages.push("A map (associative array) of room information is required!");
        }
        
        // Throw an exception if one or more parameters are not specified.
        if (bError) {
            throw aErrorMessages.join('\n');
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
        // Check the settings map for the user ID
        //--------------------------------------------------------------------//
        if (mSettings.userID !== undefined) {
            iUserId = mSettings.userID;
        }

        //----------------------------------------------//
        //-- Check that premise field is specified.   --//
        //----------------------------------------------//
        if (mSettings.roomPremise === undefined || mSettings.roomPremise === null) {
            //---------------------------------------------------------//
            //-- If not, see if the field variable wPremise exists.  --//
            //---------------------------------------------------------//
            try {
                wPremise = IOMy.functions.findInputWidget("wPremise");
            } catch (eInputWidgetError) {
                //-- An exception is thrown if something is wrong. --//
                bError = true;
                aErrorMessages.push(eInputWidgetError.message);
            }
        } else {
            wPremise = mSettings.roomPremise;
        }
        
        //----------------------------------------------//
        //-- Check that room name field is specified. --//
        //----------------------------------------------//
        if (mSettings.roomName === undefined || mSettings.roomName === null) {
            //---------------------------------------------------------//
            //-- If not, see if the field variable wRoomName exists. --//
            //---------------------------------------------------------//
            try {
                wRoomName = IOMy.functions.findInputWidget("wRoomName");
            } catch (eInputWidgetError) {
                //-- An exception is thrown if something is wrong. --//
                bError = true;
                aErrorMessages.push(eInputWidgetError.message);
            }
        } else {
            wRoomName = mSettings.roomName;
        }
        
        //-----------------------------------------------------//
        //-- Check that room description field is specified. --//
        //-----------------------------------------------------//
        if (mSettings.roomDescription === undefined || mSettings.roomDescription === null) {
            //----------------------------------------------------------------//
            // If not, see if the field variable wRoomDescription exists.
            //----------------------------------------------------------------//
            try {
                wRoomDescription = IOMy.functions.findInputWidget("wRoomDescription");
            } catch (eInputWidgetError) {
                //-- An exception is thrown if something is wrong. --//
                bError = true;
                aErrorMessages.push(eInputWidgetError.message);
            }
        } else {
            wRoomDescription = mSettings.roomDescription;
        }
        
        //----------------------------------------------//
        //-- Check that room type field is specified. --//
        //----------------------------------------------//
        if (mSettings.roomType === undefined || mSettings.roomType === null) {
            //----------------------------------------------------------------//
            // If not, see if the field variable wRoomType exists.
            //----------------------------------------------------------------//
            try {
                wRoomType = IOMy.functions.findInputWidget("wRoomType");
            } catch (eInputWidgetError) {
                //-- An exception is thrown if something is wrong. --//
                bError = true;
                aErrorMessages.push(eInputWidgetError.message);
            }
        } else {
            wRoomType = mSettings.roomType;
        }
        
        // Throw an exception if there are errors.
        if (bError) {
            throw aErrorMessages.join('\n');
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
        // Fetch the data
        //--------------------------------------------------------------------//
        iPremiseId  = wPremise.getSelectedKey();
        sRoomText   = wRoomName.getValue();
        sRoomDesc   = wRoomDescription.getValue();
        iRoomTypeId = wRoomType.getSelectedKey();

        if (sRoomText === "") {
            aErrorMessages.push("Room must have a name");
            bError = true;
        }

        if (bError === true) {
            jQuery.sap.log.error(aErrorMessages.join("\n"));
            IOMy.common.showError(aErrorMessages.join("\n\n"), "Errors",
                function () {
                    if (wCallingWidget !== null) {
                        wCallingWidget.setEnabled(true);
                    }
                }
            );

        } else {
            //----------------------------------------------------------//
            // Run the API to add the room
            //----------------------------------------------------------//
            try {
                IOMy.apiphp.AjaxRequest({
                    url : IOMy.apiphp.APILocation("rooms"),
                    data : {
                        "Mode" : "AddRoom",
                        "PremiseId" : iPremiseId,
                        "Name" : sRoomText,
                        "Desc" : sRoomDesc, 
                        "Floor" : 1,
                        "RoomTypeId" : iRoomTypeId
                    },

                    onSuccess : function (responseType, roomData) {

                        var iRoomId = roomData.Data.RoomId;

                        if (parseInt(iUserId) !== 0) {
                            //------------------------------------------------//
                            // Run the API to give full permission to the user
                            // for the new room.
                            //------------------------------------------------//
                            me.updateRoomPermissions({
                                userID          : parseInt(iUserId),
                                roomID          : iRoomId,
                                callingWidget   : wCallingWidget,
                                onSuccess       : fnSuccess,
                                onFail          : fnFail,
                                
                                // Permissions
                                read                : true,
                                details             : true,
                                write               : true,
                                deviceManagement    : true
                            });
                        }

                    },
                    onFail : function (response) {
                        IOMy.common.showError("Update failed.", "Error");
                        jQuery.sap.log.error(JSON.stringify(response));
                        //-- Enable this switch --//
                        if (wCallingWidget !== null) {
                            wCallingWidget.setEnabled(true);
                        }
                    }
                });
            } catch (e00033) {
                IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
            }
        }
    }
    
});