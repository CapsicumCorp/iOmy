/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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
$.sap.require("sap.ui.table.Table");
sap.ui.controller("pages.staging.user.UserList", {
	sMode:              "Show",
	aFormFragments: 	{},
	
	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({

			onBeforeShow: function ( oEvent ) {
				//-- Store the Current Id --//
				//oController.iCurrentId = oEvent.data.Id;
				
				//-- Refresh Nav Buttons --//
				//MyApp.common.NavigationRefreshButtons( oController );
				
				//-- Update the Model --//
				//oController.RefreshModel( oController, {} );
				
				//-- Check the parameters --//
				oController.GetListOfUsers();
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    GetListOfUsers : function() {
        var oController = this;
        var bError      = false;
        var sErrMesg    = "";

        //------------------------------------------------//
        //-- STEP 1 - Fetch User List from Database     --//
        //------------------------------------------------//
        try {
            if( bError===false ) {
                IomyRe.apiphp.AjaxRequest({
                    url:       IomyRe.apiphp.APILocation("users"),
                    data:      {
                        "Mode":              "AdminUserList",
                    },
                    
                    onSuccess: function ( sType, aData ) {
                        var aConfig = this;
                        
                        try {
                            if( sType==="JSON" && aData.Error===false ) {
                                try {
                                    if(typeof aData.Data!=="undefined") {
                                        IomyRe.common.UserList = {};
                                        
                                        for (var i = 0; i < aData.Data.length; i++) {
                                            IomyRe.common.UserList["_"+aData.Data.UserId] = aData.Data;
                                        }
                                        //------------------------------------------------//
                                        //-- STEP 2 - Update the Controller Model       --//
                                        //------------------------------------------------//
                                        oController.RefreshModel( oController, { data : aData.Data } );
                                        //-- END RefreshControllerModel (STEP 2) --//
                                    } else {
                                        jQuery.sap.log.error("Error with the 'aData.Data' in 'GetListOfUsers' function ");
                                    }
                                } catch( e3 ) {
                                    jQuery.sap.log.error("Error with a bug in the code that processes the User List data! "+e3.message);
                                }
                            } else {
                                //-- Run the fail event
                                if( aConfig.onFail ) {
                                    aConfig.onFail();
                                }
                                
                                jQuery.sap.log.error("Error with a bug in the 'AdminUserList' successful API result! Expecting JSON. Received "+sType);
                            }
                        } catch( e2 ) {
                            jQuery.sap.log.error("Error with the 'AdminUserList' success in the 'UserList' controller! "+e2.message);
                        }
                    },
                    onFail: function (response) {
                        jQuery.sap.log.error("Error with the 'AdminUserList' API Request! "+response.responseText);
                    }
                });
            } else {
                IomyRe.common.showError( sErrMesg, "Error" );
            }
        } catch( e1 ) {
            jQuery.sap.log.error("Error with the 'UserList' in the 'UserList' controller! "+e1.message);
        }
        
    },
    
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView           = oController.getView();
        var aUsers          = [];
        
        if (oConfig.data) {
            
            //------------------------------------------------//
            //-- Create the user list for the model         --//
            //------------------------------------------------//
            for (var i = 0; i < oConfig.data.length; i++) {
                aUsers.push({
                    "UserId" : oConfig.data[i].UserId,
                    "Username": oConfig.data[i].Username,
                    "FirstName": oConfig.data[i].UserGivennames,
                    "LastName" : oConfig.data[i].UserSurnames,
                    "DisplayName" : oConfig.data[i].UserDisplayname,
                    "Status" : oConfig.data[i].UserState === 1 ? "Enabled" : "Disabled"
                });
            }

            //------------------------------------------------//
            //-- Build and Bind Model to the View           --//
            //------------------------------------------------//
            oView.setModel( 
                new sap.ui.model.json.JSONModel({
                    "UserList": aUsers
                })
            );

            //------------------------------------------------//
            //-- Trigger the onSuccess Event                --//
            //------------------------------------------------//
            if( oConfig.onSuccess ) {
                oConfig.onSuccess();
            }
        } else {
            throw new MissingArgumentException("User data is required. This is obtained from the users API to list all users.");
        }
	}

});