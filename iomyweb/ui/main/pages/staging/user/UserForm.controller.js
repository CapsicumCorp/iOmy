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
				oController.UserForm( oController, "AddUser");
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
	
	UserForm: function (oController, sForm) {
		try {			
			if(sForm === "AddUser") {
				oController.ToggleButtonsAndView( oController, "AddLogin");
				oController.ToggleButtonsAndView( oController, "DBAuth");
				oController.ToggleButtonsAndView( oController, "AddInfo");
				oController.ToggleButtonsAndView( oController, "AddAddress");
				oController.ToggleButtonsAndView( oController, "AddPremPermissions");
				oController.ToggleButtonsAndView( oController, "AddRoomPermissions");
				
			} else if(sForm === "EditUser") {
				oController.ToggleButtonsAndView( oController, "ShowInfo");
				oController.ToggleButtonsAndView( oController, "ShowAddress");
				oController.ToggleButtonsAndView( oController, "ShowPremPermissions");
				oController.ToggleButtonsAndView( oController, "ShowRoomPermissions");
			} else {
				$.sap.log.error("UserForm: Critcal Error. sForm set incorrectly:"+sForm);
			}
		} catch(e1) {
			$.sap.log.error("UserForm: Critcal Error:"+e1.message);
			return false;
		}
	},
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();	
		
		try {
			if(sMode === "AddLogin") {
				//-- New User Login Info --//
				oView.byId("Login").setVisible( true );
				IomyRe.common.ShowFormFragment( oController, "AddLogin", "LoginBlock_Form", "FormContainer" );
			} else if(sMode === "DBAuth") {
				//-- DB Auth Credentials --//
				oView.byId("DBAuth").setVisible( true );
				IomyRe.common.ShowFormFragment( oController, "DBAuth", "DBAuthBlock_Form", "FormContainer" );
			} else if( sMode === "ShowInfo" ) {
				//-- Show Info --//
				oView.byId("Info").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
				IomyRe.common.ShowFormFragment( oController, "UserInfoDisplay", "InfoBlock_Form", "FormContainer" );
				
			} else if( sMode === "AddInfo" ) {
				//-- Edit Info --//
				oView.byId("Info").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserInfoEdit", "InfoBlock_Form", "FormContainer" );
				
			} else if ( sMode === "ShowAddress" ) {
				//-- Show Address --//
				oView.byId("Address").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
				IomyRe.common.ShowFormFragment( oController, "UserAddressDisplay", "AddrBlock_Form", "FormContainer" );
				
			} else if ( sMode === "AddAddress" ) {
				//-- Edit Address --//
				oView.byId("Address").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserAddressEdit", "AddrBlock_Form", "FormContainer" );
				
			} else if ( sMode === "ShowPremPermissions" ) {
				//-- Show Permissions --//
				oView.byId("PremPermBlock_BtnEdit").setVisible( true );
				oView.byId("PremPermBlock_BtnSave").setVisible( false );
				oView.byId("PremPermBlock_BtnCancel").setVisible( false );
				IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", false);
				IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionDisplay", "PremPermBlock_Form", "FormContainer" );
				
			} else if ( sMode === "AddPremPermissions" ) {
				//-- Edit Permissions --//
				oView.byId("PremPermBlock_BtnEdit").setVisible( false );
				oView.byId("PremPermBlock_BtnSave").setVisible( false );
				oView.byId("PremPermBlock_BtnCancel").setVisible( false );
				IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionEdit", "PremPermBlock_Form", "FormContainer" );
			
			} else if ( sMode === "EditPremPermissions" ) {
				//-- Edit Permissions --//
				oView.byId("PremPermBlock_BtnEdit").setVisible( false );
				oView.byId("PremPermBlock_BtnSave").setVisible( true );
				oView.byId("PremPermBlock_BtnCancel").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionEdit", "PremPermBlock_Form", "FormContainer" );
			
			} else if ( sMode === "ShowRoomPermissions" ) {
				//-- Show Permissions --//
				oView.byId("RoomPermBlock_BtnEdit").setVisible( true );
				oView.byId("RoomPermBlock_BtnSave").setVisible( false );
				oView.byId("RoomPermBlock_BtnCancel").setVisible( false );
				IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", false);
				IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionDisplay", "RoomPermBlock_Form", "FormContainer" );
				
			} else if ( sMode === "AddRoomPermissions" ) {
				//-- Edit Permissions --//
				oView.byId("RoomPermBlock_BtnEdit").setVisible( false );
				oView.byId("RoomPermBlock_BtnSave").setVisible( false );
				oView.byId("RoomPermBlock_BtnCancel").setVisible( false );
				IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "RoomPermBlock_Form", "FormContainer" );
				
			} else if ( sMode === "EditRoomPermissions" ) {
				//-- Edit Permissions --//
				oView.byId("RoomPermBlock_BtnEdit").setVisible( false );
				oView.byId("RoomPermBlock_BtnSave").setVisible( true );
				oView.byId("RoomPermBlock_BtnCancel").setVisible( true );
				IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", true);
				IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "RoomPermBlock_Form", "FormContainer" );
			} else {
				$.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	},

});