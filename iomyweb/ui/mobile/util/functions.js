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

$.sap.declare("IOMy.functions",true);

IOMy.functions = new sap.ui.base.Object();

$.extend(IOMy.functions,{
	/**********************************************\
	 * IOMy Global Objects
	\**********************************************/
	oData : IOMy.apiodata,
	
	/**
     * Procedure that sets the text of the User button in the IOMy button to be
     * the username of the current user.
     * 
     * @param {type} oController        UI5 Controller or View that invokes this procedure.
     */
    setCurrentUserNameForNavigation : function (oController) {
        var me = this;
        
        me.oData.AjaxRequest({
            Url : me.oData.ODataLocation("users"),
            Columns : ["USERS_USERNAME"],
            WhereClause : [],
            OrderByClause : [],
            Limit : 0,
            
            onSuccess : function (response, data) {
                oController.byId("UsernameButton").setText(data[0].USERS_USERNAME);
            },
            
            onFail : function (response) {
                oController.byId("UsernameButton").setText("Current User");
                // TODO: Bring up a notice to display that the session has timed out.
                // because that's what usually happens. After the box closes, the
                // app must refresh to log back in.
                jQuery.sap.log.error("Loading User OData failed: "+response.message);
            }
        });
    },
    
    /**
     * Adds a label widget containing the name of a thing/item/device into the
     * widget list in the Thing List.
     * 
     * @param {type} iThingId       Thing ID to access the thing in the list
     * @param {type} oWidget        Label containing the Device/Thing Name
     */
    addThingLabelWidget : function (iThingId, oWidget) {
        //-------------------------------------------//
        // DECLARE VARIABLES
        //-------------------------------------------//
        var aThingLabels = IOMy.common.ThingList["_"+iThingId].LabelWidgets;
        var bExists = false;
        
        //-------------------------------------------//
        // Check if the widget is in the list already.
        //-------------------------------------------//
        for (var i = 0; i < aThingLabels.length; i++) {
            if (aThingLabels[i] === oWidget) {
                bExists = true;
                break; // The widget is already in the list. We do not add duplicates!
            }
        }
        
        //-------------------------------------------//
        // Insert widget if it is not in the list.
        //-------------------------------------------//
        if (!bExists) {
            IOMy.common.ThingList["_"+iThingId].LabelWidgets.push(oWidget);
        }
    },
    
    /**
     * Updates all the labels that belong to a given item/thing.
     * 
     * @param {type} iThingId             Device ID
     * @param {type} sText                New label
     */
    updateThingLabels : function (iThingId, sText) {
        for (var i = 0; i < IOMy.common.ThingList["_"+iThingId].length; i++) {
            IOMy.common.ThingList["_"+iThingId][i].setText(sText);
        }
    },
    
    /**
     * Generates a human-readable timestamp from a JS Date.
     * 
     * @param {type} date       Given date
     * @param {type} sFormat    Date format in dd/mm/yy or mm/dd/yy
     * @returns {String}        Human-readable date and time
     */
    getTimestampString : function (date, sFormat) {
        var iHour       = date.getHours();
        var vMinutes    = date.getMinutes();
        var vSeconds    = date.getSeconds();
        var sSuffix     = "";
        
        var iYear       = date.getFullYear();
        var vMonth      = date.getMonth() + 1;
        var vDay        = date.getDate();
        
        var sDate       = ""; // Set according to the given format
        
        if (iHour >= 12) {
            sSuffix = "PM";
        } else {
            sSuffix = "AM";
        }
        
        iHour = iHour % 12;
        if (iHour === 0) {
            iHour = 12;
        }
        
        if (vMonth < 10) {
            vMonth = "0"+vMonth;
        }
        
        if (vDay < 10) {
            vDay = "0"+vDay;
        }
        
        if (vSeconds < 10) {
            vSeconds = "0"+vSeconds;
        }
        
        if (vMinutes < 10) {
            vMinutes = "0"+vMinutes;
        }
        
        if (sFormat === undefined) {
            sFormat = "dd/mm/yyyy";
        }
        
        if (sFormat === "dd/mm/yyyy" || sFormat === "dd/mm/yy") {
            sDate = vDay+"/"+vMonth+"/"+iYear+" ";
        } else if (sFormat === "mm/dd/yyyy" || sFormat === "mm/dd/yy") {
            sDate = vMonth+"/"+vDay+"/"+iYear+" ";
        } else {
            sDate = "";
        }
        
        return sDate+iHour+":"+vMinutes+":"+vSeconds+sSuffix;
    },
	
    /**
     * Retrieve the number of devices the current user has access to.
     * 
     * @returns {Number}    Number of devices.
     */
	getNumberOfDevices : function () {
		var iNum = 0;
		$.each(IOMy.common.ThingList, function () {
			iNum++;
		});
		return iNum;
	},
    
    /**
     * Retrieve the number of devices the current user has access to in a given
     * room.
     * 
     * @param {type} iRoomId
     * @returns {Number}    Number of devices in a given room.
     */
    getNumberOfDevicesInRoom : function (iRoomId) {
		var iNum = 0;
		$.each(IOMy.common.ThingList, function (sIndex, aDevice) {
            if (aDevice.RoomId == iRoomId) {
                iNum++;
            }
		});
		return iNum;
	},
    
    /**
     * Retrieve the number of objects attached to a link the current user has 
     * access to.
     * 
     * @param {type} iRoomId
     * @returns {Number}    Number of devices in a given room.
     */
    getNumberOfThingsInLink : function (iLinkId) {
		var iNum = 0;
		$.each(IOMy.common.ThingList, function (sIndex, aDevice) {
            if (aDevice.LinkId == iLinkId) {
                iNum++;
            }
		});
		return iNum;
	},
    
    /**
     * Retrieve the number of rooms the current user has access to.
     * 
     * @returns {Number}    Number of rooms.
     */
    getNumberOfRooms : function () {
		var iNum = 0;
		$.each(IOMy.common.RoomsList, function (sIndex, aPremise) {
            if (sIndex !== null && sIndex !== undefined && aPremise !== null && aPremise !== undefined) {
                $.each(aPremise, function (sJndex, aRoom) {
                    if (sJndex !== "Unassigned" && sJndex !== null && sJndex !== undefined && aRoom !== null && aRoom !== undefined) {
                        iNum++;
                    }
                });
            }
		});
		return iNum;
	},
    
    /**
     * Retrieve the number of rooms the current user has access to in a given
     * premise.
     * 
     * @param {type} iPremiseId     ID of the premise.
     * @returns {Number}            Number of rooms in a given premise.
     */
    getNumberOfRoomsInPremise : function (iPremiseId) {
		var iNum = 0;
		$.each(IOMy.common.RoomsList, function (sIndex, aPremise) {
            if (sIndex !== null && sIndex !== undefined && aPremise !== null && aPremise !== undefined) {
                $.each(aPremise, function (sJndex, aRoom) {
                    if (sJndex !== "Unassigned" && sJndex !== null && sJndex !== undefined && aRoom !== null && aRoom !== undefined) {
                        if (aRoom.PremiseId === iPremiseId) {
                            iNum++;
                        }
                    }
                });
            }
		});
		return iNum;
	},
    
    /**
     * Retrieves the number of premises that are visible to the current user.
     * 
     * @returns {Number}    Number of premises visible to the user.
     */
    getNumberOfPremises : function () {
		var iNum = 0;
		
        for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
            iNum++;
        }
        
		return iNum;
	},
    
    /**
     * Retrieves the number of hubs visible to the user in a given premise.
     * 
     * @param {type} iPremiseId     ID of the premise.
     * @returns {Number}            Number of hubs in a given premise.
     */
    getNumberOfHubsInPremise : function (iPremiseId) {
		var iNum = 0;
		$.each(IOMy.common.HubList, function (sIndex, aHub) {
            if (aHub.PremiseId == iPremiseId) {
                iNum++;
            }
		});
		return iNum;
	},
    
    /**
     * Gets the link type ID from a given link.
     * 
     * @param {type} iLinkId    Given Link ID
     * @returns                 Link Type ID or NULL
     */
    getLinkTypeIDOfLink : function (iLinkId) {
        var iLinkTypeId = null;
        var oLink;
        
        for (var i = 0; i < IOMy.common.LinkList.length; i++) {
            oLink = IOMy.common.LinkList[i];
            if (oLink.LinkId == iLinkId) {
                iLinkTypeId = oLink.LinkTypeId;
                break;
            }
        }
        
        return iLinkTypeId;
    },
    
    /**
     * Gathers the Link Conn information from a given link.
     * 
     * @param {type} iLinkId        ID of the link to retrieve the information from
     * @returns {map}               Link Conn Information
     */
    getLinkConnInfo : function (iLinkId) {
        var mLinkConnInfo = {};
        var oLink;
        
        for (var i = 0; i < IOMy.common.LinkList.length; i++) {
            oLink = IOMy.common.LinkList[i];
            if (oLink.LinkId == iLinkId) {
                // Collect the Link Conn information from memory.
                mLinkConnInfo.LinkConnId = oLink.LinkConnId;
                mLinkConnInfo.LinkConnName = oLink.LinkConnName;
                mLinkConnInfo.LinkConnAddress = oLink.LinkConnAddress;
                mLinkConnInfo.LinkConnUsername = oLink.LinkConnUsername;
                mLinkConnInfo.LinkConnPassword = oLink.LinkConnPassword;
                mLinkConnInfo.LinkConnPort = oLink.LinkConnPort;
                
                break;
            }
        }
        
        return mLinkConnInfo;
    },
    
    /**
     * Retrieves the premise ID of a given hub.
     * 
     * @param {type} iHubId         ID of the hub to inspect
     * @returns                     The premise ID or -1 if the hub couldn't be found
     */
    getPremiseIDFromHub : function (iHubId) {
        var iPremiseId = -1;
        var aHubList = IOMy.common.HubList;
        var mHub;
        
        for (var i = 0; i < aHubList.length; i++) {
            mHub = aHubList[i];
            
            // If the target hub is found, then grab its Premise ID, and end the loop.
            if (mHub.HubId == iHubId) {
                iPremiseId = mHub.PremiseId;
                break;
            }
        }
        
        return iPremiseId;
    },
	
	/***************************\
	|* Display the help dialog *|
	\***************************/
    
    /**
     * Displays a dialog containing information about the purpose of the current page.
     * It grabs the ID of the current page and uses it to determine what information
     * it should display.
     * 
     * NOTE: If the ID itself is displayed, that means that there is no help info and
     * it's not explicitly stated in the function (A BUG IF THIS HAPPENS).
     */
	showHelpDialog : function () {
		var sHelpMessage;
		//==============================
        // PREMISE OVERVIEW
        //==============================
		if ( oApp.getCurrentPage().getId() === "pPremiseOverview" ) {
			sHelpMessage = "The Premise Overview features a combo box complete with "
                        + "a list of premises that are available to the user. Below the premise combo box "
                        + "is a list of rooms that are registered with the currently selected premise.\n\n"
                        + "There is a button to the right of the name of the room that allows you to show "
                        + "or hide its list of devices.\n\n Each device can be tapped to lead into the device "
                        + "information page.\n\nThe action menu will allow you to edit the information and address "
                        + "of the currently selected premise, and add a new room.";
                
        //==============================
        // DEVICE OVERVIEW
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pDeviceOverview" ) {
			sHelpMessage = "This is the home page.\n\nHere is a list of all the devices that the current user "
                        + "has access to, regardless of their location. Some of these can be switched on or off "
                        + "depending on whether the current user has permission to do this.";
                
        //==============================
        // ADD ROOM
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsRoomAdd" ) {
			sHelpMessage = "Use this page to create a room with a name (required), description(optional), "
                        + "what floor it belongs to, and the type of room it is.";
        
        //==============================
        // EDIT ROOM
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsRoomEdit" ) {
			sHelpMessage = "Use this page to modify details about the selected room, i.e. name (required), "
                        + "description (optional), and the type of room it is. "
                        + "\n\nYou can delete the currently selected room also.";
                
        //==============================
        // ROOM OVERVIEW
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pRoomsOverview" ) {
			sHelpMessage = "This page lists all devices in the selected room and their current readings of "
						+ "voltage, amps, kilowatts, and kilowatt/hour.\n\nYou can also switch these devices on or off.";
                
        //==============================
        // ZIGBEE DEVICE DATA
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pDeviceData" ) {
			sHelpMessage = "This page lists the current state (on/off) all the current readings of voltage, amps, "
						+ "kilowatts, and kilowatt/hour from the current device.";
                
        //==============================
        // PHILIPS HUE DEVICE DATA
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pPhilipsHue" ) {
			sHelpMessage = "This page shows the current the colour (hue), saturation, and brightness of the "
						+ "currently selected device. Each has its own slide to easily change the levels of "
                        + "each setting. There is also a switch to turn it either on or off.";
                
        //==============================
        // DEVICE LIST (SETTINGS)
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsDeviceList" ) {
			sHelpMessage = "Here is a list of links and their objects. Tap a name to view or edit "
						+ "the link or object details. Each link has a list of any objects that may "
                        + "be connected to it. These lists are expandable.\n\nThere are two entries in "
                        + "the action menu, one to add a link, and the other to add an item to a link.";
                
        //==============================
        // EDIT LINK
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsEditLink" ) {
			sHelpMessage = "You can change the name of a link in this page.";
			
        //==============================
        // EDIT THING/ITEM
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsEditThing" ) {
			sHelpMessage = "You can change the name of an item in this page.";
			
        //==============================
        // ADD LINK
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsLinkAdd" ) {
			sHelpMessage = "Allows you to add a link. Different link types are supported and each one will "
                        + "have its own specific form.";
			
        //==============================
        // EDIT USER INFORMATION
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsUserInfo" ) {
			sHelpMessage = "This page is where you can change your name(s) and your contact details.";
            
        //==============================
        // EDIT USER PASSWORD
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsUserPassword" ) {
			sHelpMessage = "Enter your currrent password to change your password. Enter the new "
                        + "password twice to confirm.";
            
        //==============================
        // EDIT USER ADDRESS
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsUserAddress" ) {
			sHelpMessage = "This page allows you to change your residential and/or postal addresses.";
            
        //==============================
        // PREMISE LIST (SETTINGS)
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsPremiseList" ) {
			sHelpMessage = "This page is a list of premises that are available to the user. Any hubs that "
                        + "the current user has access to will be displayed under their own premise once its "
                        + "list is expanded.";
            
        //==============================
        // EDIT PREMISE INFORMATION
        //==============================
        } else if ( oApp.getCurrentPage().getId() === "pSettingsPremiseInfo" ) {
			sHelpMessage = "The user can change the premise name and its description. If the current user "
                        + "owns the premise, a button to change the permissions will be available.";
                
        //==============================
        // EDIT PREMISE ADDRESS
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsPremiseAddress" ) {
			sHelpMessage = "This page allows you to change the location address of the selected premise.";
            
        //==============================
        // EDIT HUB
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pSettingsPremiseGateway" ) {
			sHelpMessage = "The user can change the name of the selected hub on this page.";
            
        //==============================
        // IP CAMERA INFORMATION
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pOnvif" ) {
			sHelpMessage = "Displays the camera stream thumbnail if the camera is on.";
            
        //==============================
        // CHANGE USERS
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pForceSwitchUser" ) {
			sHelpMessage = "If at anytime you wish to switch from one user to the next, simply enter the "
						+ "username and password.";
                
        //==============================
        // APP LOGIN
        //==============================
		} else if ( oApp.getCurrentPage().getId() === "pLogin" ) {
			sHelpMessage = "Before you can use the app, you need to enter your username and password to "
						+ "view and manage your devices.";
                
        } else {
            // This else statement is only run when there is no help info for
            // the current page. For DEVELOPMENT ASSISTANCE.
            //
            // If this is executed, there is a bug.
			sHelpMessage = oApp.getCurrentPage().getId();
		}
		
		sap.m.MessageBox.show(
			sHelpMessage,
			{
				icon: sap.m.MessageBox.Icon.INFORMATION,
				title: "Help",
				actions: sap.m.MessageBox.Action.CLOSE,
				styleClass : "HelpDialog",
				onClose: function () {}
			}
		);
	},
    
    ValidateIPAddress : function (mSettings) {
        //-----------------------------------------------------//
        // Check the required fields
        //-----------------------------------------------------//
        var sUndefinedErrors = "";
        if (mSettings !== undefined) {
            // Does 'scope' exist?
            if (mSettings.scope === undefined) {
                sUndefinedErrors += "'scope' is undefined.";
            }
            
            // Does 'ipAddressFieldId' exist?
            if (mSettings.ipAddressFieldId === undefined) {
                if (sUndefinedErrors.length > 0) {
                    sUndefinedErrors += '\n';
                }
                sUndefinedErrors += "'ipAddressFieldId' is undefined";
            }
            
            // Does 'ipPortFieldId' exist?
            if (mSettings.ipPortFieldId === undefined) {
                if (sUndefinedErrors.length > 0) {
                    sUndefinedErrors += '\n';
                }
                sUndefinedErrors += "'ipPortFieldId' is undefined";
            }
            
            // If one or more fields were not found, throw the error messages
            if (sUndefinedErrors.length === 0) {
                throw sUndefinedErrors;
            }
        } else {
            throw "No settings were specified. Three settings are required: scope, ipAddressFieldId, and ipPortFieldId.";
        }
        
        var me                      = this;
        var bError                  = false;
        var bIPAddressFormatError   = false;
        var aErrorMessages          = [];
        var mInfo                   = {};
        // IP Address validation
        var aThreeDots;
        var aIPAddressParts;
        // Form data variables
        var sIPAddress              = me.byId("IPAddressField").getValue();
        var sIPPort                 = me.byId("IPPortField").getValue();
        
        //-------------------------------------------------\\
        // Is the IP address given?
        //-------------------------------------------------\\
        try {
            if (sIPAddress === "") {
                bError = true;// No
                aErrorMessages.push("IP address must be filled out");

            //-------------------------------------------------\\
            // If so, is it a valid IP address?
            //-------------------------------------------------\\
            } else {
                //-------------------------------------------------\\
                // Are there three dots in the IP Address?
                //-------------------------------------------------\\
                aThreeDots = sIPAddress.match(/\./g);

                if (aThreeDots === null || aThreeDots.length !== 3) {
                    bError = true; // No. FAIL!
                    aErrorMessages.push("IP address is not valid - there must be only 4 parts separated by dots ('.') in an IPv4 address");
                } else {
                    //-------------------------------------------------\\
                    // There are three dots. Are the four parts valid numbers?
                    //-------------------------------------------------\\
                    aIPAddressParts = sIPAddress.split('.');

                    // Check each number
                    for (var i = 0; i < aIPAddressParts.length; i++) {
                        for (var j = 0; j < aIPAddressParts[i].length; j++) {
                            // Spaces and the plus symbol are ignored by isNaN(). isNaN() covers the rest.
                            if (aIPAddressParts[i].charAt(j) === ' ' || aIPAddressParts[i].charAt(j) === '+' || isNaN(aIPAddressParts[i].charAt(j))) {
                                bIPAddressFormatError = true; // INVALID CHARACTER
                                break;
                            }
                        }

                        if (bIPAddressFormatError === true) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers contains invalid characters");
                            break;
                        } else if (parseInt(aIPAddressParts[i]) < 0 || parseInt(aIPAddressParts[i]) > 255) {
                            bError = true;
                            aErrorMessages.push("IP address is not valid - one of the numbers is greater than 255 or a negative number");
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1003: There was an error checking the IP Address: "+e.message);
        }
        
        //-------------------------------------------------\\
        // Is the port given?
        //-------------------------------------------------\\
        try {
            if (sIPPort === "") {
                bError = true;
                aErrorMessages.push("IP port must be filled out");
            // Now, is the port a valid number...
            } else {
                for (var i = 0; i < sIPPort.length; i++) {
                    // Spaces, and the plus and minus symbols are ignored by isNaN(). isNaN() covers the rest.
                    if (sIPPort.charAt(i) === ' ' || sIPPort.charAt(i) === '-' ||
                        sIPPort.charAt(i) === '+' || isNaN(sIPPort.charAt(i)))
                    {
                        bError = true; // INVALID CHARACTER!
                        aErrorMessages.push("IP port not valid");
                        break;
                    }
                }
            }
        } catch (e) {
            bError = true;
            aErrorMessages.push("Error 0x1004: There was an error checking the IP Port: "+e.message);
        }
        
        mInfo.bError = bError;
        mInfo.aErrorMessages = aErrorMessages;
        
        return mInfo;
    },
	
	/***************************\
	|* Miscellaneous functions *|
	\***************************/
	/**
	 * Takes a list of IDs and destroys the objects with one of those IDs if it exists.
	 * Used for elements with IDs that are registered globally (sap.ui.getCore().byId() to
	 * access). DEPRECATED! New views and controllers will do the purging of old instances
     * of widgets with IDs.
	 * 
	 * @param aIds		List of IDs to look for
	 */
	destroyItemsById : function (aIds) {
		for (var i = 0; i < aIds.length; i++) {
			if (sap.ui.getCore().byId(aIds[i]) !== undefined) {
				sap.ui.getCore().byId(aIds[i]).destroy();
			}
		}
	},
	
	/**
	 * Takes a list of IDs and destroys the objects with one of those IDs if it exists.
	 * Used for elements with IDs that are registered for a specific view or controller
	 * (this.byId() to access). DEPRECATED! New views and controllers will do the
     * purging of old instances of widgets with IDs.
	 * 
	 * @param view		View (or controller) to search the elements in
	 * @param aIds		List of IDs to look for
	 */
	destroyItemsByIdFromView : function (view, aIds) {
		for (var i = 0; i < aIds.length; i++) {
			if (view.byId(aIds[i]) !== undefined) {
				view.byId(aIds[i]).destroy();
			}
		}
	},
    
    /**
     * Procedure loads countries, languages, states and provinces, postcodes,
     * and timezones into their respective combo boxes through a series of AJAX
     * requests. What will be populated in these combo boxes depends on which
     * country the user has selected.
     * 
     * Should run every time a country is changed in a form handling locale
     * information.
     * 
     * @param {type} oView          UI5 Controller or View that has the combo boxes
     * @param {type} iCountryId     
     * @param {type} displayData
     */
    loadLocaleCBoxItems : function (oView, iCountryId, displayData) {
        var me = oView;     // Change the variable name of the scope.
        
        // Arrays to store combo box items that have been created using data
        // from the OData services.
        var aCountries = [];
        var aLanguages = [];
        var aStates = [];
        var aPostcodes = [];
        var aTimezones = [];
        
        // Gather the PK and Display text (NAME) of each country available
        me.odata.AjaxRequest({
            Url : me.odata.ODataLocation("countries"),
            Columns : ["COUNTRIES_NAME", "COUNTRIES_PK"],
            WhereClause : [],
            OrderByClause : ["COUNTRIES_NAME asc"],

            onSuccess : function (responseType, data) {
                try {
                    for (var i = 0; i < data.length; i++) {
                        aCountries.push(
                            new sap.ui.core.Item({
                                text : data[i].COUNTRIES_NAME,
                                key : data[i].COUNTRIES_PK
                            })
                        );
                    }
                } catch (e) {

                    jQuery.sap.log.error("Error gathering Countries: "+JSON.stringify(e.message));

                } finally {
                    this.onProceed(iCountryId, displayData);
                }
            },

            onFail : function (response) {
                jQuery.sap.log.error("Error loading countries OData: "+JSON.stringify(response));
                this.onProceed(iCountryId, displayData);
            },

            /**
             * These onProceed functions are called no matter whether there
             * was success or failure in running the public OData query.
             * These are used to continue the flow of execution of other
             * OData services so if there are errors with one or more, the
             * others will at least still work.
             * 
             * @param {type} iCountryId
             * @returns {undefined}
             */
            onProceed : function (iCountryId, displayData) {
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("language"),
                    Columns : ["LANGUAGE_PK","LANGUAGE_NAME"],
                    WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                    OrderByClause : ["LANGUAGE_NAME asc"],

                    onSuccess : function (responseType, data) {
                        try {
                            for (var i = 0; i < data.length; i++) {
                                aLanguages.push(
                                    new sap.ui.core.Item({
                                        text : data[i].LANGUAGE_NAME,
                                        key : data[i].LANGUAGE_PK
                                    })
                                );
                            }
                        } catch (e) {

                            jQuery.sap.log.error("Error gathering Languages: "+JSON.stringify(e.message));

                        } finally {
                            this.onProceed(iCountryId, displayData);
                        }
                    },

                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading languages OData: "+JSON.stringify(response));
                        this.onProceed(iCountryId, displayData);
                    },

                    onProceed : function (iCountryId, displayData) {
                        me.odata.AjaxRequest({
                            Url : me.odata.ODataLocation("stateprovince"),
                            Columns : ["STATEPROVINCE_PK","STATEPROVINCE_NAME"],
                            WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                            OrderByClause : ["STATEPROVINCE_NAME asc"],

                            onSuccess : function (responseType, data) {
                                try {
                                    for (var i = 0; i < data.length; i++) {
                                        aStates.push(
                                            new sap.ui.core.Item({
                                                text : data[i].STATEPROVINCE_NAME,
                                                key : data[i].STATEPROVINCE_PK
                                            })
                                        );
                                    }
                                } catch (e) {

                                    jQuery.sap.log.error("Error gathering States and Provinces: "+JSON.stringify(e.message));

                                } finally {
                                    this.onProceed(iCountryId, displayData);
                                }
                            },

                            onFail : function (response) {
                                jQuery.sap.log.error("Error loading stateprovince OData: "+JSON.stringify(response));
                                this.onProceed(iCountryId, displayData);
                            },

                            onProceed : function (iCountryId, displayData) {
                                me.odata.AjaxRequest({
                                    Url : me.odata.ODataLocation("postcode"),
                                    Columns : ["POSTCODE_PK","POSTCODE_NAME"],
                                    WhereClause : ["COUNTRIES_PK eq "+iCountryId],
                                    OrderByClause : ["POSTCODE_NAME asc"],

                                    onSuccess : function (responseType, data) {
                                        try {
                                            for (var i = 0; i < data.length; i++) {
                                                aPostcodes.push(
                                                    new sap.ui.core.Item({
                                                        text : data[i].POSTCODE_NAME,
                                                        key : data[i].POSTCODE_PK
                                                    })
                                                );
                                            }
                                        } catch (e) {

                                            jQuery.sap.log.error("Error gathering Post codes: "+JSON.stringify(e.message));

                                        } finally {
                                            this.onProceed(displayData);
                                        }
                                    },

                                    onFail : function (response) {
                                        jQuery.sap.log.error("Error loading stateprovince OData: "+JSON.stringify(response));
                                        this.onProceed(displayData);
                                    },

                                    onProceed : function (displayData) {
                                        me.odata.AjaxRequest({
                                            Url : me.odata.ODataLocation("timezones"),
                                            Columns : ["TIMEZONE_PK","TIMEZONE_TZ"],
                                            WhereClause : [],
                                            OrderByClause : ["TIMEZONE_TZ asc"],

                                            onSuccess : function (responseType, data) {
                                                try {
                                                    for (var i = 0; i < data.length; i++) {
                                                        aTimezones.push(
                                                            new sap.ui.core.Item({
                                                                text : data[i].TIMEZONE_TZ,
                                                                key : data[i].TIMEZONE_PK
                                                            })
                                                        );
                                                    }
                                                } catch (e) {

                                                    jQuery.sap.log.error("Error gathering Timezones: "+JSON.stringify(e.message));

                                                } finally {
                                                    this.onProceed(displayData);
                                                }
                                            },

                                            onFail : function (response) {
                                                jQuery.sap.log.error("Error loading timezone OData: "+JSON.stringify(response));
                                                this.onProceed(displayData);
                                            },

                                            onProceed : function (displayData) {
                                                // Populate the combo boxes with the items that were
                                                // created using information from the OData.
                                                me.byId("addressCountry").destroyItems();
                                                for (var i = 0; i < aCountries.length; i++)
                                                    me.byId("addressCountry").addItem(aCountries[i]);

                                                me.byId("addressLanguage").destroyItems();
                                                for (var i = 0; i < aLanguages.length; i++)
                                                    me.byId("addressLanguage").addItem(aLanguages[i]);

                                                me.byId("addressState").destroyItems();
                                                for (var i = 0; i < aStates.length; i++)
                                                    me.byId("addressState").addItem(aStates[i]);

                                                me.byId("addressPostCode").destroyItems();
                                                for (var i = 0; i < aPostcodes.length; i++)
                                                    me.byId("addressPostCode").addItem(aPostcodes[i]);

                                                me.byId("addressTimezone").destroyItems();
                                                for (var i = 0; i < aTimezones.length; i++)
                                                    me.byId("addressTimezone").addItem(aTimezones[i]);
                                                
                                                if (displayData !== undefined) {
                                                    // Display the information retrieved from the Premise Location OData
                                                    // and set any foreign keys as item keys in the combo boxes.
                                                    me.byId("addressCountry").setSelectedKey(displayData.COUNTRIES_PK);
                                                    me.byId("addressLanguage").setSelectedKey(displayData.LANGUAGE_PK);
                                                    me.byId("addressState").setSelectedKey(displayData.STATEPROVINCE_PK);
                                                    me.byId("addressPostCode").setSelectedKey(displayData.POSTCODE_PK);
                                                    me.byId("addressTimezone").setSelectedKey(displayData.TIMEZONE_PK);
                                                    me.byId("UpdateLink").setEnabled(true);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
	
});