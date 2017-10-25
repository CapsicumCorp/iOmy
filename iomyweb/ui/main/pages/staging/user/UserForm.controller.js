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

sap.ui.controller("pages.staging.user.UserForm", {
	aFormFragments: 	{},
	bEditable: false,
	userID : null,
	
	mxFetchRequests     : new Mutex({ manual : true }), // Mutex with the queue managed by the controller rather than the mutex.
    mxUpdateRequests    : new Mutex({ manual : true }), // Mutex with the queue managed by the controller rather than the mutex.
	
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
				//-- Store the page type (Insert / Edit) --//
				oController.bEditable = oEvent.data.bPageType;
				
				//-- Store the Users Id --//
				oController.iUserId = oEvent.data.userID;
				
				//-- Refresh Nav Buttons --//
				//MyApp.common.NavigationRefreshButtons( oController );
				
				//-- Update the Model --//
				oController.RefreshModel( oController, {} );
				
				//-- Check the parameters --//
				oController.ToggleButtonsAndView( oController, "EditUser");
				oController.ToggleButtonsAndView( oController, "ShowPremPermissions");
				oController.ToggleButtonsAndView( oController, "ShowRoomPermissions");
				oView.byId("ObjectPageLayout").setHeaderTitle(oController.getObjectPageTitle(oController));
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
	
	
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView = oController.getView();
		var	aNewUserData = {
			//-- New User Info --//
			Username:          "",
			Password:          "",
			ConfirmPassword:   "",
			//-- Database Login --//
			DBUser:            "root",
			DBPassword:        "",
			//-- User Info --//
			Gender:            3,
			Title:             "",
			Givenname:         "",
			Surname:           "",
			Displayname:       "",
			DOB:               "1990-01-01",
			Email:             "",
			Phone:             "",	
			//-- User Address --//
			LanguageId:        1,
			AddressLine1:      "",
			AddressLine2:      "",
			AddressLine3:      "",
			SubRegion:         "",
			Postcode:          "",
			RegionId:          36,
			TimezoneId:        310,
			//-- User Permissions --//
			PremiseId:         0,
			PremPermId:        2,
			RoomId:            0,
			RoomPermId:        2
		};    
		var aRoomData = {};
		var aPremiseData = {};

		//------------------------------------------------//
		//-- Setup "All" in the Premise & Room Array    --//
		//------------------------------------------------//
		if(oController.bEditable !== true ) {
			try {
				try {
					if( typeof IomyRe.common.AllRoomsList!=="undefined" ) {
						aRoomData = JSON.parse(JSON.stringify(IomyRe.common.AllRoomsList ));
						aRoomData['_0'] = {
							RoomId: 0,
							RoomName: "All Rooms"
						};
					}
				}catch(e1){
					$.sap.log.error("RefreshModel: Critcal Error setting up 'All' in AllRoomsList:"+e1.message);
					return false;
				}
				
				try {
					if( typeof IomyRe.common.PremiseList!=="undefined" ) {
						aPremiseData = JSON.parse(JSON.stringify(IomyRe.common.PremiseList ));
						aPremiseData['_0'] = {
							Id: 0,
							Name: "All Premise"
						};
					}
				}catch(e1){
					$.sap.log.error("RefreshModel: Critcal Error setting up 'All' in PremiseList:"+e1.message);
					return false;
				}
			} catch(e2) {
				$.sap.log.error("RefreshModel: Critcal Error:"+e2.message);
				return false;
			}
		} else {
			if( typeof IomyRe.common.AllRoomsList!=="undefined" ) {
				aRoomData = JSON.parse(JSON.stringify(IomyRe.common.AllRoomsList ));
			}
			if( typeof IomyRe.common.PremiseList!=="undefined" ) {
				aPremiseData = JSON.parse(JSON.stringify(IomyRe.common.PremiseList ));
			}
		}
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		var oModel = new sap.ui.model.json.JSONModel({
			"Regions":               IomyRe.common.Regions,
			"Languages":             IomyRe.common.Languages,
			"Timezones":             IomyRe.common.Timezones,
			"Premise":               aPremiseData,
			"Rooms":                 aRoomData,
			"NewUser":               aNewUserData
		});
		
		oModel.setSizeLimit(420);
		oView.setModel( oModel );	
		
		
		//oController.UpdateVisibleInclusions( oController );
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	},
	
	getObjectPageTitle : function (oController) {
		var sObjectTitle = "";
		var oPageHeader = "";
		
		sObjectTitle = "Edit User";
		
		
		oPageHeader = new sap.uxap.ObjectPageHeader ({
			objectTitle: sObjectTitle
		});
		
		return oPageHeader;
	},
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();	
		
		try {
			switch(sMode) {
				case "EditUser":
					//-- New User Login Info --//
					oView.byId("Login").setVisible( false );
					IomyRe.common.ShowFormFragment( oController, "Blank", "LoginBlock_Form", "FormContainer" );
					//-- DB Auth Credentials --//
					oView.byId("DBAuth").setVisible( false );
					IomyRe.common.ShowFormFragment( oController, "Blank", "DBAuthBlock_Form", "FormContainer" );
					//-- Show Info --//
					oView.byId("Info").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserInfoDisplay", "InfoBlock_Form", "FormContainer" );
					//-- Show Address --//
					oView.byId("Address").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserAddressDisplay", "AddrBlock_Form", "FormContainer" );
				break;
				case "ShowPremPermissions":
					//-- Show Permissions --//
					oView.byId("PremPermBlock_BtnEdit").setVisible( true );
					oView.byId("PremPermBlock_BtnSave").setVisible( false );
					oView.byId("PremPermBlock_BtnCancel").setVisible( false );
					IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionDisplay", "PremPermBlock_Form", "FormContainer" );
				break;
				case "ShowRoomPermissions":
				//-- Show Room Permissions --//
					oView.byId("RoomPermBlock_BtnEdit").setVisible( true );
					oView.byId("RoomPermBlock_BtnSave").setVisible( false );
					oView.byId("RoomPermBlock_BtnCancel").setVisible( false );
					IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionDisplay", "RoomPermBlock_Form", "FormContainer" );	
				break;
				case "EditPremPermissions":
					//-- Edit Permissions --//
					oView.byId("PremPermBlock_BtnEdit").setVisible( false );
					oView.byId("PremPermBlock_BtnSave").setVisible( true );
					oView.byId("PremPermBlock_BtnCancel").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionEdit", "PremPermBlock_Form", "FormContainer" );
				break;
				case "EditRoomPermissions":
					//-- Edit Permissions --//
					oView.byId("RoomPermBlock_BtnEdit").setVisible( false );
					oView.byId("RoomPermBlock_BtnSave").setVisible( true );
					oView.byId("RoomPermBlock_BtnCancel").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "RoomPermBlock_Form", "FormContainer" );
				break;
				default:
					$.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	},

});