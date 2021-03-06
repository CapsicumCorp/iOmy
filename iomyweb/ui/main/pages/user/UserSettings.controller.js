/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
    Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
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

sap.ui.controller("pages.user.UserSettings", {
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
				//-- Find out if the current user is a premise owner. --//
                var bIsOwner    = oController.isUserOwner();
				
				oController.RefreshModel( oController, {} );

                oView.byId("PageHeader").setObjectTitle(iomy.common.UserInfo.Username);

                if (bIsOwner) {
                    oView.byId("PageHeader").setObjectSubtitle("Owner");

                } else {
                    oView.byId("PageHeader").setObjectSubtitle("iOmy User");

                }

                //-- Check the parameters --//
                oController.ToggleButtonsAndView( oController, "ShowPassword");
                oController.ToggleButtonsAndView( oController, "ShowInfo");
                oController.ToggleButtonsAndView( oController, "ShowAddress");
                oController.ToggleButtonsAndView( oController, "ShowPremPermissions");
                oController.ToggleButtonsAndView( oController, "ShowRoomPermissions");

                //-- Defines the Device Type --//
                iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},

	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView     = oController.getView();
		var aUserData = {};
        var oModel    = {};
        var oData     = {};
        
        //-- Make sure the previous data isn't shown before refresh. --//
        oView.setModel( new sap.ui.model.json.JSONModel({}) );
        
        try {
            //------------------------------------------------//
            //-- Setup New UserData Array                   --//
            //------------------------------------------------//
            if( typeof iomy.common.UserInfo!=="undefined" ) {
                aUserData = JSON.parse(JSON.stringify(iomy.common.UserInfo ));
            }
            
            //------------------------------------------------//
            //-- Build and Bind Model to the View           --//
            //------------------------------------------------//
            oData = {
                "Regions":               iomy.common.Regions,
                "Languages":             iomy.common.Languages,
                "Timezones":             iomy.common.Timezones,
                "Premises":              iomy.common.PremiseList,
                "Rooms":                 iomy.common.AllRoomsList,
                "UserInfo":              aUserData,
                "Password":              {
                    OldPassword         : "",
                    NewPassword         : "",
                    ConfirmPassword     : ""
                },

                "PremisePermInfo": {
                    "CurrentLevel"  : 2,
                    "PremiseId"     : 1
                },
                
                "RoomPermInfo": {
                    "CurrentLevel"  : 2,
                    "RoomId"        : 0,
                    "PremiseId"     : 1
                },

                "PermLevels":            {
                   "_1" : {
                        "Key" : 1,
                        "Text" : "No Access"
                    },
                    "_2" : {
                        "Key" : 2,
                        "Text" : "Read"
                    },
                    "_3" : {
                        "Key" : 3,
                        "Text" : "Read, Device Toggle"
                    },
                    "_4" : {
                        "Key" : 4,
                        "Text" : "Read/Write"
                    }
                },
                
                "enabled" : {
                    "Always" : true
                }
            };
            
            oModel = new sap.ui.model.json.JSONModel(oData);
            
            oModel.setSizeLimit(420);
            oView.setModel( oModel );
            
            iomy.common.RetrieveRoomAdminRoomList({

                onSuccess : function () {
                    try {
                        var aRoomData = JSON.parse(JSON.stringify(iomy.common.RoomAdminRoomsList));
                        aRoomData['_0'] = {
                            RoomId: "0",
                            RoomName: "All Rooms"
                        };

                        oData.RoomOptions = aRoomData;

                        oModel = new sap.ui.model.json.JSONModel(oData);
                        oModel.setSizeLimit(420);
                        oView.setModel( oModel );

                        //------------------------------------------------//
                        //-- Trigger the onSuccess Event                --//
                        //------------------------------------------------//
                        if( oConfig.onSuccess ) {
                            oConfig.onSuccess();
                        }
                    } catch (e) {
                        $.sap.log.error(e.name + ": " + e.message);
                    }
                },
                
                onFail : function (sError) {
                    $.sap.log.error("Error loading the room options: "+sError);
                    oView.setModel( oModel );
                    
                    //------------------------------------------------//
                    //-- Trigger the onSuccess Event (TEMPORARY)    --//
                    //------------------------------------------------//
                    if( oConfig.onSuccess ) {
                        oConfig.onSuccess();
                    }
                }
            });
            
        } catch (e) {
            $.sap.log.error("Failed to refresh the model ("+e.name + "): " + e.message);
        }
		
	},
    
    isUserOwner: function(  ) {
        var bPremiseOwner = false;
        
        try {
            $.each(iomy.common.PremiseList, function (sI, mPremise) {
                
                if (mPremise.PermOwner === 1) {
                    bPremiseOwner = true;
                    return false;
                }
                
            });
            
            
        } catch (e) {
            $.sap.log.error("Error searching for the first hub for telnet communication ("+e.name+"): " + e.message);
            
        } finally {
            return bPremiseOwner;
        }
	},
    
    TogglePasswordControls : function (bEnabled) {
        var oView           = this.getView();
        var oModel          = oView.getModel();
        
        try {
            oModel.setProperty("/enabled/Always", bEnabled);
        } catch (e) {
            $.sap.log.error("Error toggling password text fields ("+e.name+"): " + e.message);
        }
    },
    
    ToggleInformationControls : function (bEnabled) {
        var oView           = this.getView();
        var oModel          = oView.getModel();
        
        try {
            oModel.setProperty("/enabled/Always", bEnabled);
        } catch (e) {
            $.sap.log.error("Error toggling user information text fields ("+e.name+"): " + e.message);
        }
    },
    
    ToggleAddressControls : function (bEnabled) {
        var oView           = this.getView();
        var oModel          = oView.getModel();
        
        try {
            oModel.setProperty("/enabled/Always", bEnabled);
        } catch (e) {
            $.sap.log.error("Error toggling user address text fields ("+e.name+"): " + e.message);
        }
    },
	
	UpdateUserInfoValues: function () {
        var oController = this;
        var oView       = this.getView();
		var bError      = false;
		var sErrMesg    = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
		//var oTest = oController.getView().getModel();
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		
        oController.ToggleInformationControls(false);
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				iomy.apiphp.AjaxRequest({
					url:       iomy.apiphp.APILocation("users"),
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
									iomy.common.RefreshUserInfoList({
										onSuccess: $.proxy( function() {
											//------------------------------------------------//
											//-- STEP 6 - Update the Controller Model       --//
											//------------------------------------------------//
											oController.RefreshModel( oController, {});
                                            
                                            //------------------------------------------------//
                                            //-- STEP 8 - Load the Display Fragment         --//
                                            //------------------------------------------------//
                                            iomy.common.showMessage({
                                                text : "User information successfully updated."
                                            });

                                            if (oView.byId("openMenu") !== undefined) {
                                                var sDisplayName = iomy.common.UserInfo.Displayname || iomy.common.UserInfo.Username;
                                                oView.byId("openMenu").setText("Hi, "+sDisplayName);
                                            }

                                            oController.ToggleButtonsAndView( oController, "ShowInfo" );
                                            
                                            //-- END RefreshControllerModel (STEP 6) --//
										}, oController )
									});    //-- END LandPackagesList (STEP 5) --//
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' success event that was passed as a parameter in the 'UserSettings' controller! "+e3.message);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' successful API result in the 'UserSettings' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' success in the 'UserSettings' controller! "+e2.message);
						}
					},
					onFail: function () {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
						jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' API Request when editing a LandPackage in the 'UserSettings' controller!");
                        oController.ToggleInformationControls(true);
					}
				});
			} else {
				iomy.common.showError( sErrMesg, "Error", function () {
                    oController.ToggleInformationControls(true);
                });
			}
		} catch( e1 ) {
            var sErrorMesg = "Error with'UpdateUserInfoValues' in the 'UserSettings' controller! "+e1.message;
            
			jQuery.sap.log.error(sErrorMesg);
            iomy.common.showError( sErrorMesg, "Error", function () {
                oController.ToggleInformationControls(true);
            });
		}
	},
	
	UpdateUserAddressValues: function () {
        var oController = this;
		var bError      = false;
		var sErrMesg    = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
        
        oController.ToggleAddressControls(false);
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				iomy.apiphp.AjaxRequest({
					url:       iomy.apiphp.APILocation("users"),
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
									iomy.common.RefreshUserInfoList({
										onSuccess: $.proxy( function() {
											//------------------------------------------------//
											//-- STEP 6 - Update the Controller Model       --//
											//------------------------------------------------//
											oController.RefreshModel( oController, {});
                                            
                                            //------------------------------------------------//
                                            //-- STEP 8 - Load the Display Fragment         --//
                                            //------------------------------------------------//
                                            oController.ToggleButtonsAndView( oController, "ShowAddress" );
                                            
                                            iomy.common.showMessage({
                                                text : "User address successfully updated."
                                            });
                                            
                                            //-- END RefreshControllerModel (STEP 6) --//
										}, oController )
									});    //-- END LandPackagesList (STEP 5) --//
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'AddressEdit' success event that was passed as a parameter in the 'AddressEdit' controller! "+e3.message);
                                    oController.ToggleAddressControls(true);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'AddressEdit' successful API result in the 'AddressEdit' controller!");
                                oController.ToggleAddressControls(true);
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'AddressEdit' success in the 'AddressEdit' controller! "+e2.message);
                            oController.ToggleAddressControls(true);
						}
					},
					onFail: function () {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
						jQuery.sap.log.error("Error with the 'AddressEdit' API Request when editing a LandPackage in the 'AddressEdit' controller!");
                        oController.ToggleAddressControls(true);
					}
				});
			} else {
				iomy.common.showError( sErrMesg, "Error", function () {
                    oController.ToggleAddressControls(true);
                });
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with the 'AddressEdit' in the 'AddressEdit' controller! "+e1.message);
            oController.ToggleAddressControls(true);
		}
	},
    
    UpdateUserPassword : function () {
        var oController         = this;
        var oView               = this.getView();
        var oFormData           = oView.getModel().getProperty("/Password/");
        
        oController.TogglePasswordControls(false);
        
        try {
            oController.changeUserPassword({
                oldPassword         : oFormData.OldPassword,
                newPassword         : oFormData.NewPassword,
                confirmNewPassword  : oFormData.ConfirmPassword,
                
                onSuccess : function () {
                    iomy.common.showMessage({
                        text : "Log back in to continue using iOmy."
                    });
                    
                    oController.TogglePasswordControls(true);
                    iomy.common.Logout();
                },
                
                onFail : function (sError) {
                    iomy.common.showError(sError, "Update failed",
                        function () {
                            oController.TogglePasswordControls(true);
                        }
                    );
                }
            });
        } catch (e) {
            iomy.common.showError(e.message, "Invalid Input",
                function () {
                    oController.TogglePasswordControls(true);
                }
            );
        }
    },
    
    changeUserPassword : function (mSettings) {
        var bError          = false;
        var aErrorMessages  = [];
        var iUserId         = iomy.common.UserInfo.UserId;
        var fnSuccess       = function () {};
        var fnFail          = function () {};
        var sOldPassword;
        var sNewPassword;
        var sConfirmPassword;

        var sMissingOldPasswordMessage  = "You must enter your current password first.";
        var sMissingNewPasswordMessage  = "A new password is required.";
        var sMissingConfirmationMessage = "You must enter the new password twice to confirm that it's correct.";
        
        var sDifferentPasswordsMessage  = "Passwords don't match.";
        
        var fnAppendError = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };

        //--------------------------------------------------------------------//
        // Process the settings map for passwords given.
        //--------------------------------------------------------------------//
        if (mSettings !== undefined && mSettings !== null) {
            //----------------------------------------------------------------//
            // Find the current user's password.
            //----------------------------------------------------------------//
            if (mSettings.oldPassword !== undefined && mSettings.oldPassword !== null &&
                    mSettings.oldPassword !== "")
            {
                sOldPassword = mSettings.oldPassword;
            } else {
                fnAppendError(sMissingOldPasswordMessage);
            }
            
            //----------------------------------------------------------------//
            // Find the new password and check that it is secure.
            //----------------------------------------------------------------//
            if (mSettings.newPassword !== undefined && mSettings.newPassword !== null &&
                    mSettings.newPassword !== "") 
            {
                sNewPassword = mSettings.newPassword;
                
                var mPasswordInfo = iomy.validation.isPasswordSecure(sNewPassword);
                
                if (!mPasswordInfo.bIsValid) {
                    bError = true;
                    aErrorMessages = aErrorMessages.concat(mPasswordInfo.aErrorMessages);
                }
                
                //----------------------------------------------------------------//
                // Find that the password was entered twice and that it is the same
                // as the first password.
                //----------------------------------------------------------------//
                if (mSettings.confirmNewPassword !== undefined && mSettings.confirmNewPassword !== null &&
                        mSettings.confirmNewPassword !== "")
                {
                    sConfirmPassword = mSettings.confirmNewPassword;
                    
                    if (sNewPassword !== sConfirmPassword) {
                        fnAppendError(sDifferentPasswordsMessage);
                    }
                } else {
                    fnAppendError(sMissingConfirmationMessage);
                }
                
            } else {
                fnAppendError(sMissingNewPasswordMessage);
            }
            
            //----------------------------------------------------------------//
            // Find the success callback function.
            //----------------------------------------------------------------//
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
                
                if (typeof fnSuccess !== "function") {
                    fnAppendError("The success callback given is not a function. '"+typeof fnSuccess+"' variable was given.");
                }
            }
            
            //----------------------------------------------------------------//
            // Find the failure callback function.
            //----------------------------------------------------------------//
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
                
                if (typeof fnFail !== "function") {
                    fnAppendError("The failure callback given is not a function. '"+typeof fnFail+"' variable was given.");
                }
            }
            
            //----------------------------------------------------------------//
            // Any errors? Throw an exception.
            //----------------------------------------------------------------//
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join('\n'));
            }
            
        } else {
            fnAppendError(sMissingOldPasswordMessage);
            fnAppendError(sMissingNewPasswordMessage);
            fnAppendError(sMissingConfirmationMessage);
            
            throw new MissingSettingsMapException(aErrorMessages.join('\n'));
        }

        //--------------------------------------------------------------------//
        // Run the API to update the user's password.
        //--------------------------------------------------------------------//
        try {
            iomy.apiphp.AjaxRequest({
                url : iomy.apiphp.APILocation("users"),
                data : {
                    "Mode" : "EditPassword", "Id" : iUserId,
                    "OldPassword" : sOldPassword, "NewPassword" : sNewPassword
                },
                onSuccess : function (type, data) {
                    try {
                        if (data.Error !== true) {
                            fnSuccess();
                        } else {
                            fnFail(data.ErrMesg);
                        }
                    } catch (e) {
                        fnFail(e.name + ": " + e.message);
                    }
                },
                onFail : function (response) {
                    fnFail(response.responseText);
                }
            });
        } catch (e) {
            fnFail(e.name + ": " + e.message);
        }
    },
    
    ToggleRoomPermissionControls : function (bEnabled) {
        var oView = this.getView();
        
        if (oView.byId("SelectPremise") !== undefined) {
            oView.byId("SelectPremise").setEnabled(bEnabled);
        }
        
        if (oView.byId("SelectRoom") !== undefined) {
            oView.byId("SelectRoom").setEnabled(bEnabled);
        }
        
        if (oView.byId("SelectCurrentLevel") !== undefined) {
            oView.byId("SelectCurrentLevel").setEnabled(bEnabled);
        }
    },
    
    DisplayRoomPermissions : function (iLevel) {
        var oController     = this;
        var oView           = this.getView();
        var oModel          = JSON.parse(oView.getModel().getJSON());
        
        oModel.RoomPermInfo.CurrentLevel = iLevel;
        
        oView.setModel( new sap.ui.model.json.JSONModel(oModel) );
    },
    
    FetchUserRoomPermissions : function () {
        var oController     = this;
        var oView           = this.getView();
        var oFormData       = oView.getModel();
        var iRoomId         = oFormData.getProperty("/RoomPermInfo/RoomId");
        var iPremiseId      = oFormData.getProperty("/RoomPermInfo/PremiseId");
        
        oController.ToggleRoomPermissionControls(false);
        
        try {
            iomy.functions.permissions.fetchRoomPermissions({
                userID          : iomy.common.UserInfo.UserId,
                roomID          : iRoomId,
                premiseID       : iPremiseId,

                onSuccess : function (iLevel) {

                    oController.DisplayRoomPermissions(iLevel);
                    oController.ToggleButtonsAndView( oController, "EditRoomPermissions" );

                    oController.ToggleRoomPermissionControls(true);
                },

                onWarning : function (iLevel, sErrors) {
                    iomy.common.showWarning(sErrors, "Unable to find permissions for some rooms.");

                    oController.DisplayRoomPermissions(iLevel);
                    oController.ToggleButtonsAndView( oController, "EditRoomPermissions" );

                    oController.ToggleRoomPermissionControls(true);
                },

                onFail : function (sErrors) {
                    iomy.common.showError(sErrors, "Failed to retrieve room permissions.");

                    oController.ToggleRoomPermissionControls(true);
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.message, "Error", function () {
                oController.ToggleRoomPermissionControls(true);
            });
        }
    },
    
    UpdateUserRoomPermissions : function () {
        var oController     = this;
        var oView           = this.getView();
        var oFormData       = oView.getModel();
        var iLevel          = oFormData.getProperty("/RoomPermInfo/CurrentLevel");
        var iRoomId         = oFormData.getProperty("/RoomPermInfo/RoomId");
        var iPremiseId      = oFormData.getProperty("/RoomPermInfo/PremiseId");
        
        oController.ToggleRoomPermissionControls(false);
        
        try {
            iomy.functions.permissions.updateRoomPermissions({
                level           : parseInt(iLevel),
                userID          : iomy.common.UserInfo.UserId,
                roomID          : iRoomId,
                premiseID       : iPremiseId,

                onSuccess : function () {
                    iomy.common.RefreshCoreVariables({

                        onSuccess : function () {
                            oController.RefreshModel( oController, {} );
                            oController.ToggleButtonsAndView( oController, "ShowRoomPermissions" );
                            
                            iomy.common.showMessage({
                                "text" : "Updated permissions successfully"
                            });

                        }

                    });
                },

                onWarning : function (sErrors) {
                    iomy.common.showWarning(sErrors, "Unable to update for some rooms.");

                    oController.ToggleRoomPermissionControls(true);
                },

                onFail : function (sErrors) {
                    iomy.common.showError(sErrors, "Failed to update room permissions.");

                    oController.ToggleRoomPermissionControls(true);
                }
            });
            
        } catch (e) {
            iomy.common.showError(e.message, "Invalid input", function () {
                oController.ToggleRoomPermissionControls(true);
            });
        }
    },
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();
		
		//console.log(sMode);
		try {	
			switch(sMode) {
				case "ShowPassword":
					//-- Show Password (not quite showing the password though) --//
					oView.byId("PasswordBlock_BtnEdit").setVisible( true );
					oView.byId("PasswordBlock_BtnSave").setVisible( false );
					oView.byId("PasswordBlock_BtnCancel").setVisible( false );
					iomy.forms.ToggleFormMode(oController, "PasswordBlock_Form", false);
					iomy.common.ShowFormFragment( oController, "UserPasswordDisplay", "PasswordBlock_Form", "FormContainer" );
				break;
				case "EditPassword":
					//-- Edit Password --//
					oView.byId("PasswordBlock_BtnEdit").setVisible( false );
					oView.byId("PasswordBlock_BtnSave").setVisible( true );
					oView.byId("PasswordBlock_BtnCancel").setVisible( true );
					iomy.forms.ToggleFormMode(oController, "PasswordBlock_Form", true);
					iomy.common.ShowFormFragment( oController, "UserPasswordEdit", "PasswordBlock_Form", "FormContainer" );
				break;
				case "ShowInfo":
					//-- Show Info --//
					oView.byId("InfoBlock_BtnEdit").setVisible( true );
					oView.byId("InfoBlock_BtnSave").setVisible( false );
					oView.byId("InfoBlock_BtnCancel").setVisible( false );
					iomy.forms.ToggleFormMode(oController, "InfoBlock_Form", false);
					iomy.common.ShowFormFragment( oController, "UserInfoDisplay", "InfoBlock_Form", "FormContainer" );
				break;
				case "EditInfo":
					//-- Edit Info --//
					oView.byId("InfoBlock_BtnEdit").setVisible( false );
					oView.byId("InfoBlock_BtnSave").setVisible( true );
					oView.byId("InfoBlock_BtnCancel").setVisible( true );
					iomy.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
					iomy.common.ShowFormFragment( oController, "UserInfoEdit", "InfoBlock_Form", "FormContainer" );
				break;
				case "ShowAddress":
					//-- Show Address --//
					oView.byId("AddrBlock_BtnEdit").setVisible( true );
					oView.byId("AddrBlock_BtnSave").setVisible( false );
					oView.byId("AddrBlock_BtnCancel").setVisible( false );
					iomy.forms.ToggleFormMode(oController, "AddrBlock_Form", false);
					iomy.common.ShowFormFragment( oController, "UserAddressDisplay", "AddrBlock_Form", "FormContainer" );
				break;
				case "EditAddress":
					//-- Edit Address --//
					oView.byId("AddrBlock_BtnEdit").setVisible( false );
					oView.byId("AddrBlock_BtnSave").setVisible( true );
					oView.byId("AddrBlock_BtnCancel").setVisible( true );
					iomy.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
					iomy.common.ShowFormFragment( oController, "UserAddressEdit", "AddrBlock_Form", "FormContainer" );
				break;
				
				case "ShowPremPermissions":
					//-- Show Permissions --//
					iomy.forms.ToggleFormMode(oController, "PremPBlock_Form", false);
					iomy.common.ShowFormFragment(oController, "UserPremisePermissionDisplay", "PremPBlock_Form", "FormContainer");
				break;
				case "ShowRoomPermissions":
					//-- Show Permissions --//
					oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( true );
					oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( false );
					oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( false );
					iomy.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", false);
					iomy.common.ShowFormFragment( oController, "UserRoomPermissionDisplay", "UserRoomPermissionsBlock_Form", "FormContainer" );
				break;	
				case "EditRoomPermissions":
					//-- Edit Permissions --//
					oView.byId("UserRoomPermissionsBlock_BtnEdit").setVisible( false );
					oView.byId("UserRoomPermissionsBlock_BtnSave").setVisible( true );
					oView.byId("UserRoomPermissionsBlock_BtnCancel").setVisible( true );
					iomy.forms.ToggleFormMode(oController, "UserRoomPermissionsBlock_Form", true);
					iomy.common.ShowFormFragment( oController, "UserRoomPermissionEdit", "UserRoomPermissionsBlock_Form", "FormContainer" );
				break;
				default:
					$.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	}

});