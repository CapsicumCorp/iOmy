/*
Title: iOmy Functions Module
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Declares various functions that are used across multiple pages.
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

$.sap.declare("IOMy.functions.updateRoom",true);

$.extend(IOMy.functions, {
    
    /**
     * Updates a room, specified by its ID (corresponds to its PK in the
     * database), with new information. Sources of information can include a
     * javascript map (associative array/object) of the data to update a given
     * room with. If not, it will attempt to find the correctly named fields in
     * either the view or controller.
     * 
     * The second parameter, mInfo, contains information about a given room to
     * update the room with.
     * 
     * Throws an exception if either room ID, room information map (mInfo), or
     * both are not specified. Also throws an exception if the room does not
     * exist.
     * 
     * @param {type} iRoomId            ID of the room.
     * @param {type} mInfo              New room information, including the widget that called the function.
     */
    updateRoom : function (iRoomId, mInfo)  {
        //--------------------------------------------------------------------//
        // Declare and initialise important variables
        //--------------------------------------------------------------------//
        var bError              = false;
        var aErrorMessages      = [];
        var sRoomText           = "";
        var sRoomDesc           = "";
        var iRoomTypeId         = 0;
        var wCallingWidget      = null;
        var wRoomName           = null;
        var wRoomDescription    = null;
        var wRoomType           = null;
		var oContext			= null;
        
        var mRoomValidation     = IOMy.validation.isRoomIDValid(iRoomId);
        
        //--------------------------------------------------------------------//
        // Check for required parameters
        //--------------------------------------------------------------------//
        
        //-- Check that room ID exists, is valid and it isn't the mInfo parameter --//
        if (mRoomValidation.bIsValid === false) {
            bError = true;
            aErrorMessages = aErrorMessages.concat( mRoomValidation.aErrorMessages );
        } else {
            //-- If it does exist, check that the room information map is there. --//
            if (mInfo === undefined) {
                bError = true;
                aErrorMessages.push("A map (associative array) of room information is required!");
            }
        }
        
        // Throw an exception if one or more function parameters are not specified.
        if (bError) {
            throw aErrorMessages.join('\n');
        }
        
        //--------------------------------------------------------------------//
        // Check room info map and assign default values if necessary.
        //--------------------------------------------------------------------//
        
        //-- Check that the calling widget is specified. --//
        if (mInfo.callingWidget === undefined || mInfo.callingWidget === null) {
            wCallingWidget = null; // No UI5 widget has called this function.
        } else {
            // If so, capture it and disable it.
            wCallingWidget = mInfo.callingWidget;
            wCallingWidget.setEnabled(false);
        }
		
		//-- Check that the controller or view context is specified. --//
        if (mInfo.view !== undefined || mInfo.view !== null) {
            oContext = mInfo.view;
        }
        
        //----------------------------------------------//
        //-- Check that room name field is specified. --//
        //----------------------------------------------//
        if (mInfo.roomName === undefined || mInfo.roomName === null) {
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
            wRoomName = mInfo.roomName;
        }
        
        //-----------------------------------------------------//
        //-- Check that room description field is specified. --//
        //-----------------------------------------------------//
        if (mInfo.roomDescription === undefined) {
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
            wRoomDescription = mInfo.roomDescription;
        }
        
        //----------------------------------------------//
        //-- Check that room type field is specified. --//
        //----------------------------------------------//
        if (mInfo.roomType === undefined) {
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
            wRoomType = mInfo.roomType;
        }
        
        //--------------------------------------------------------------------//
        // Retrieve and validate the given data 
        //--------------------------------------------------------------------//
        
        var sRoomText   = wRoomName.getValue();
        var sRoomDesc   = wRoomDescription.getValue();
        var iRoomTypeId = wRoomType.getSelectedKey();

        if (sRoomText === "") {
            bError = true;
            aErrorMessages.push("Room must have a name");
        }

        //--------------------------------------------------------------------//
        // Report any errors
        //--------------------------------------------------------------------//
        if (bError) {
            jQuery.sap.log.error(aErrorMessages.join("\n"));
            IOMy.common.showError(aErrorMessages.join("\n\n"), "Errors",
                function () {
                    //-- Re enable the calling button if one is specified. --//
                    if (wCallingWidget !== null) {
                        wCallingWidget.setEnabled(true);
                    }
                }
            );
        } else {
            //----------------------------------------------------------------//
            // If there are no errors, run the API to update the room.
            //----------------------------------------------------------------//
            try {
                IOMy.apiphp.AjaxRequest({
                    url : IOMy.apiphp.APILocation("rooms"),
                    data : {"Mode" : "EditInfo", "Id" : iRoomId, "Name" : sRoomText,
                            "Desc" : sRoomDesc, "Floor" : 1,
                            "RoomTypeId" : iRoomTypeId},
                    onSuccess : function () {
						
						//-- REFRESH ROOMS --//
						IOMy.common.RefreshCoreVariables({
							//-------------------------------//
							// Success callback function
							//-------------------------------//
							onSuccess : function() {
								try {
									if (oContext !== null) {
										IOMy.common.showMessage({
											text : "Room updated successfully.",
											view : oContext
										});
									}

									//-- Flag that the Core Variables have been configured --//
									IOMy.common.CoreVariablesInitialised = true;
									IOMy.common.NavigationChangePage("pPremiseOverview", {}, true);

								} catch(e654321) {
									//-- ERROR:  TODO: Write a better error message--//
									jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
								}
							},

							//-------------------------------//
							// Failure callback function
							//-------------------------------//
							onFail : function() {
								if (wCallingWidget !== null) {
									wCallingWidget.setEnabled(true);
								}
								
								if (oContext !== null) {
									IOMy.common.NavigationToggleNavButtons(oContext, true);
								}
							}
						});
                    },
                    onFail : function (response) {
                        IOMy.common.showError(response.responseText, "Error");
                        jQuery.sap.log.error(JSON.stringify(response));

                        // Finish the request by enabling the edit button
                        this.onComplete();
                    },

                    onComplete : function () {
                        //----------------------------------------------------//
                        // Re-enable the calling widget once the request and the
                        // callback functions have finished executing.
                        //----------------------------------------------------//
                        if (wCallingWidget !== null) {
                            wCallingWidget.setEnabled(true);
                        }
						
						if (oContext !== null) {
							IOMy.common.NavigationToggleNavButtons(oContext, true);
						}
                    }
                });
            } catch (e00033) {
                IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                if (wCallingWidget !== null) {
                    wCallingWidget.setEnabled(true);
                }
            }
        }
    }
    
});