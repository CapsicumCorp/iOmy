/*
Title: List of Users for Room Permission
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Retrieve a list of users to be shown on the Room Permissions page.
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

$.sap.declare("IOMy.widgets.getListOfUsersForRoomPermissions",true);

$.extend(IOMy.widgets,{
    
    /**
     * Retrieve a list of users to be shown on the Room Permissions page.
     * 
     * @param {type} oSBox                      Select/combo box to populate
     * @param {type} iUser                      User ID
     * @param {type} iPremise                   Premise ID
     * @param {type} fnSuccessCallback          Function to call after the select box is created or changed.
     * @param {type} fnFailCallback             Function to call after failure.
     */
    getListOfUsersForRoomPermissions : function (oSBox, iUser, iPremise, fnSuccessCallback, fnFailCallback) {
        var sUrl = IOMy.apiphp.APILocation("permissions");
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupUsersForRoomPerms",
                "PremiseId" : iPremise
            },
            
            onSuccess : function (responseType, data) {
                //------------------------------------------------------------//
                // If there are no errors, add the users to the select box.
                //------------------------------------------------------------//
                if (data.Error === false) {
                    var mUserInfo;
                    var mFirstUserInfo = null;
                    var iNumOfUsers = data.Data.length;
                    var iErrors = 0;
                    
                    for (var i = 0; i < data.Data.length; i++) {
                        try {
                            mUserInfo = data.Data[i];
                             
                            // Catch the first user in the list and get it's ID later
                            if (mFirstUserInfo === null) {
                                mFirstUserInfo = mUserInfo;
                            }
                            
                            oSBox.addItem(
                                new sap.ui.core.Item({
                                    text : mUserInfo.UserDisplayName,
                                    key : mUserInfo.UsersId
                                })
                            );
                        } catch (e) {
                            iErrors++;
                            jQuery.sap.log.error("Failed to add the User Details to the select box: "+e.message);
                        }
                    }
                    
                    // Set the selected key to be that of the first item in the select box,
                    // OR a particular user.
                    oSBox.setSelectedKey(iUser);
                    
                    if (iUser !== null) {
                        oSBox.setEnabled(false);
                    } else {
                        oSBox.setEnabled(true);
                    }
                    
                    if (iNumOfUsers !== iErrors) {
                        oSBox.attachChange(fnSuccessCallback);
                        fnSuccessCallback();
                    } else {
                        fnFailCallback("Failed to add any users to the select box");
                    }
                }
                //------------------------------------------------------------//
                // Otherwise report the error
                //------------------------------------------------------------//
                else {
                    var sErrorMessage = "There was an error accessing the list of users: "+data.ErrMesg;
                    jQuery.sap.log.error(sErrorMessage);
                    fnFailCallback(sErrorMessage);
                }
            },
            
            onFail : function (response) {
                jQuery.sap.log.error("There was an error accessing the list of users: "+JSON.stringify(response));
                IOMy.common.showError("There was an error accessing the list of users", "Error");
            }
        });
    }
    
});