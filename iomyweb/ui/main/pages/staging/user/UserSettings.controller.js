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

sap.ui.controller("pages.staging.user.UserSettings", {
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
				oController.ToggleButtonsAndView( oController, "ShowInfo");
				oController.ToggleButtonsAndView( oController, "ShowAddress");
				oController.ToggleButtonsAndView( oController, "ShowPremPermissions");
				oController.ToggleButtonsAndView( oController, "ShowRoomPermissions");
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();
		
		//console.log(sMode);
		
		if( sMode === "ShowInfo" ) {
			//-- Show Info --//
			oView.byId("InfoBlock_BtnEdit").setVisible( true );
			oView.byId("InfoBlock_BtnSave").setVisible( false );
			oView.byId("InfoBlock_BtnCancel").setVisible( false );
			IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
			IomyRe.common.ShowFormFragment( oController, "UserInfoDisplay", "InfoBlock_Form", "FormContainer" );
			
		} else if( sMode === "EditInfo" ) {
			//-- Edit Info --//
			oView.byId("InfoBlock_BtnEdit").setVisible( false );
			oView.byId("InfoBlock_BtnSave").setVisible( true );
			oView.byId("InfoBlock_BtnCancel").setVisible( true );
			IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
			IomyRe.common.ShowFormFragment( oController, "UserInfoEdit", "InfoBlock_Form", "FormContainer" );
			
		} else if ( sMode === "ShowAddress" ) {
			//-- Show Address --//
			oView.byId("AddrBlock_BtnEdit").setVisible( true );
			oView.byId("AddrBlock_BtnSave").setVisible( false );
			oView.byId("AddrBlock_BtnCancel").setVisible( false );
			IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
			IomyRe.common.ShowFormFragment( oController, "UserAddressDisplay", "AddrBlock_Form", "FormContainer" );
			
		} else if ( sMode === "EditAddress" ) {
			//-- Edit Address --//
			oView.byId("AddrBlock_BtnEdit").setVisible( false );
			oView.byId("AddrBlock_BtnSave").setVisible( true );
			oView.byId("AddrBlock_BtnCancel").setVisible( true );
			IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
			IomyRe.common.ShowFormFragment( oController, "UserAddressEdit", "AddrBlock_Form", "FormContainer" );
			
		} else if ( sMode === "ShowPremPermissions" ) {
			//-- Show Permissions --//
			oView.byId("PremPBlock_BtnEdit").setVisible( true );
			oView.byId("PremPBlock_BtnSave").setVisible( false );
			oView.byId("PremPBlock_BtnCancel").setVisible( false );
			IomyRe.forms.ToggleFormMode(oController, "PremPBlock_Form", false);
			IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionDisplay", "PremPBlock_Form", "FormContainer" );
			
		} else if ( sMode === "EditPremPermissions" ) {
			//-- Edit Permissions --//
			oView.byId("PremPBlock_BtnEdit").setVisible( false );
			oView.byId("PremPBlock_BtnSave").setVisible( true );
			oView.byId("PremPBlock_BtnCancel").setVisible( true );
			IomyRe.forms.ToggleFormMode(oController, "PremPBlock_Form", true);
			IomyRe.common.ShowFormFragment( oController, "UserPremisePermissionEdit", "PremPBlock_Form", "FormContainer" );
		
		} else if ( sMode === "ShowRoomPermissions" ) {
			//-- Show Permissions --//
			oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( true );
			oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( false );
			oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( false );
			IomyRe.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", false);
			IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionDisplay", "UserRoomPermissionsBlock_Form", "FormContainer" );
			
		} else if ( sMode === "EditRoomPermissions" ) {
			//-- Edit Permissions --//
			oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( false );
			oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( true );
			oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( true );
			IomyRe.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", true);
			IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "UserRoomPermissionsBlock_Form", "FormContainer" );
		} else {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
		}
		
	},

});