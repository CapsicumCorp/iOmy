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
				oController.RefreshModel( oController, {} );
				
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

	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView            = oController.getView();
		var aUserData = {};
		
		//------------------------------------------------//
		//-- Setup New UserData Array                --//
		//------------------------------------------------//
		if( typeof IomyRe.common.UserInfo!=="undefined" ) {
			aUserData = JSON.parse(JSON.stringify(IomyRe.common.UserInfo ));
		}
		
		//oController.aVisibleHouses     = MyApp.common.VisibleHouseTypes();	
		//oController.aVisibleInclusions = MyApp.common.VisibleInclusionsForHouseType( oController.aVisibleHouses[0].Id );
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oView.setModel( 
			new sap.ui.model.json.JSONModel({
				"Regions":               IomyRe.common.Regions,
				"Languages":             IomyRe.common.Languages,
				"Timezones":             IomyRe.common.Timezones,
				"Premise":               IomyRe.common.PremiseList,
				"Rooms":                 IomyRe.common.AllRoomsList,
				"UserInfo":              aUserData
			})
		);	
		
		
		//oController.UpdateVisibleInclusions( oController );
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	},
	
	UpdateUserInfoValues: function (oController) {
		var bError   = false;
		var sErrMesg = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
		//var oTest = oController.getView().getModel();
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		//if( oCurrentFormData.InclusionId <= 0 ) {
		//	bError    = true;
		//	sErrMesg  = "Please choose a valid Inclusion!";
		//}
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				IomyRe.apiphp.AjaxRequest({
					url:       IomyRe.apiphp.APILocation("users"),
					data:      {
						"Mode":              "EditUserInfo",
						"Title":             oCurrentFormData.UserTitle,
						"Givennames":        oCurrentFormData.Givenname,
						"Surnames":          oCurrentFormData.Surname,
						"Displayname":       oCurrentFormData.Displayname,
						"Email":             oCurrentFormData.Email,
						"Phone":             oCurrentFormData.Phone,
						"Gender":            oCurrentFormData.Gender
					},
					onSuccess: function ( sType, aData ) {
						try {
							if( sType==="JSON" && aData.Error===false ) {
								try {
									//------------------------------------------------//
									//-- STEP 5 - Update Global LandPackagesList    --//
									//------------------------------------------------//
									IomyRe.common.RefreshUserInfoList({
										onSuccess: $.proxy( function() {
											//------------------------------------------------//
											//-- STEP 6 - Update the Controller Model       --//
											//------------------------------------------------//
											oController.RefreshModel( oController, {
												onSuccess: $.proxy( function() {
													//------------------------------------------------//
													//-- STEP 8 - Load the Display Fragment         --//
													//------------------------------------------------//
													oController.ToggleButtonsAndView( oController, "ShowInfo" );
														
														
													}, oController )
												});    //-- END RefreshControllerModel (STEP 6) --//
										}, oController )
									});    //-- END LandPackagesList (STEP 5) --//
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'InfoEdit' success event that was passed as a parameter in the 'InfoEdit' controller! "+e3.message);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'InfoEdit' successful API result in the 'InfoEdit' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'InfoEdit' success in the 'InfoEdit' controller! "+e2.message);
						}
					},
					onFail: function () {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
						jQuery.sap.log.error("Error with the 'InfoEdit' API Request when editing a LandPackage in the 'InfoEdit' controller!");
					}
				});
			} else {
				IomyRe.common.showError( sErrMesg, "Error" );
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with the 'InfoEdit' in the 'InfoEdit' controller! "+e1.message);
		}
	},
	
	UpdateUserAddressValues: function (oController) {
		var bError   = false;
		var sErrMesg = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
		//var oTest = oController.getView().getModel();
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		//if( oCurrentFormData.InclusionId <= 0 ) {
		//	bError    = true;
		//	sErrMesg  = "Please choose a valid Inclusion!";
		//}
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				IomyRe.apiphp.AjaxRequest({
					url:       IomyRe.apiphp.APILocation("users"),
					data:      {
						"Mode":                       "EditUserAddress",
						"AddressLine1":               oCurrentFormData.AddressLine1,
						"AddressLine2":               oCurrentFormData.AddressLine2,
						"AddressLine3":               oCurrentFormData.AddressLine3,
						"AddressRegion":              oCurrentFormData.RegionId,
						"AddressSubRegion":           oCurrentFormData.SubRegion,
						"AddressPostcode":            oCurrentFormData.Postcode,
						"AddressTimezone":            oCurrentFormData.TimezoneId,
						"AddressLanguage":            oCurrentFormData.LanguageId
					},
					onSuccess: function ( sType, aData ) {
						try {
							if( sType==="JSON" && aData.Error===false ) {
								try {
									//------------------------------------------------//
									//-- STEP 5 - Update Global LandPackagesList    --//
									//------------------------------------------------//
									IomyRe.common.RefreshUserInfoList({
										onSuccess: $.proxy( function() {
											//------------------------------------------------//
											//-- STEP 6 - Update the Controller Model       --//
											//------------------------------------------------//
											oController.RefreshModel( oController, {
												onSuccess: $.proxy( function() {
													//------------------------------------------------//
													//-- STEP 8 - Load the Display Fragment         --//
													//------------------------------------------------//
													oController.ToggleButtonsAndView( oController, "ShowAddress" );
														
														
													}, oController )
												});    //-- END RefreshControllerModel (STEP 6) --//
										}, oController )
									});    //-- END LandPackagesList (STEP 5) --//
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'AddressEdit' success event that was passed as a parameter in the 'AddressEdit' controller! "+e3.message);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'AddressEdit' successful API result in the 'AddressEdit' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'AddressEdit' success in the 'AddressEdit' controller! "+e2.message);
						}
					},
					onFail: function () {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
						jQuery.sap.log.error("Error with the 'AddressEdit' API Request when editing a LandPackage in the 'AddressEdit' controller!");
					}
				});
			} else {
				IomyRe.common.showError( sErrMesg, "Error" );
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with the 'AddressEdit' in the 'AddressEdit' controller! "+e1.message);
		}
	},
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();
		
		//console.log(sMode);
		try {	
			switch(sMode) {
				case "ShowInfo":
					//-- Show Info --//
					oView.byId("InfoBlock_BtnEdit").setVisible( true );
					oView.byId("InfoBlock_BtnSave").setVisible( false );
					oView.byId("InfoBlock_BtnCancel").setVisible( false );
					IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserInfoDisplay", "InfoBlock_Form", "FormContainer" );
				break;
				case "EditInfo":
					//-- Edit Info --//
					oView.byId("InfoBlock_BtnEdit").setVisible( false );
					oView.byId("InfoBlock_BtnSave").setVisible( true );
					oView.byId("InfoBlock_BtnCancel").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "UserInfoEdit", "InfoBlock_Form", "FormContainer" );
				break;
				case "ShowAddress":
					//-- Show Address --//
					oView.byId("AddrBlock_BtnEdit").setVisible( true );
					oView.byId("AddrBlock_BtnSave").setVisible( false );
					oView.byId("AddrBlock_BtnCancel").setVisible( false );
					IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserAddressDisplay", "AddrBlock_Form", "FormContainer" );
				break;
				case "EditAddress":
					//-- Edit Address --//
					oView.byId("AddrBlock_BtnEdit").setVisible( false );
					oView.byId("AddrBlock_BtnSave").setVisible( true );
					oView.byId("AddrBlock_BtnCancel").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "UserAddressEdit", "AddrBlock_Form", "FormContainer" );
				break;
				
				case "ShowPremPermissions":
					//-- Show Permissions --//
					IomyRe.forms.ToggleFormMode(oController, "PremPBlock_Form", false);
					IomyRe.common.ShowFormFragment(oController, "UserPremisePermissionDisplay", "PremPBlock_Form", "FormContainer");
				break;
				case "ShowRoomPermissions":
					//-- Show Permissions --//
					oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( true );
					oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( false );
					oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( false );
					IomyRe.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", false);
					IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionDisplay", "UserRoomPermissionsBlock_Form", "FormContainer" );
				break;	
				case "EditRoomPermissions":
					//-- Edit Permissions --//
					oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( false );
					oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( true );
					oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "UserRoomPermissionsBlock_Form", "FormContainer" );
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