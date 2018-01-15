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

sap.ui.controller("pages.staging.user.NewUser", {
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
				//-- Update the Model --//
				oController.RefreshModel( oController, {} );
				
				//-- Check the parameters --//
				oController.ToggleButtonsAndView( oController, "AddUser");
				oView.byId("ObjectPageLayout").setHeaderTitle(oController.getObjectPageTitle(oController));
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    ToggleSubmitCancelButtons : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("SubmitButton").setEnabled(bEnabled);
        oView.byId("CancelButton").setEnabled(bEnabled);
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
			DOB:               new Date(1990,0,1),
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
	
	InsertNewUserInfo: function (oController) {
		var bError          = false;
		var aErrorMessages  = [];
        
        var fnAppendError   = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/NewUser/");
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		var sDate = oCurrentFormData.DOB.getFullYear()+'-'+(oCurrentFormData.DOB.getMonth()+1)+'-'+oCurrentFormData.DOB.getDate();
        
        var sUsername               = oCurrentFormData.Username;
        var sPassword               = oCurrentFormData.Password;
        var sConfirmPassword        = oCurrentFormData.ConfirmPassword;
        var dDOB                    = oCurrentFormData.DOB;
        var sDBUser                 = oCurrentFormData.DBUser;
        var sDBPassword             = oCurrentFormData.DBPassword;
        
        oController.ToggleSubmitCancelButtons(false);
        
        //--------------------------------------------------------------------//
        // Check the username (required)
        //--------------------------------------------------------------------//
        if (sUsername !== "") {
            //-- Found the username, make sure it's not one of the blacklisted ones. --//
            var sLowerCaseUsername = sUsername.toLowerCase();

            if (sLowerCaseUsername === "admin" || sLowerCaseUsername === "root" ||
                    sLowerCaseUsername === "administrator" || sLowerCaseUsername === "sys" ||
                    sLowerCaseUsername === "manager")
            {
                fnAppendError("Username must not be any variation of 'admin', 'administrator', 'manager', 'sys', or 'root.");
            }
        } else {
            fnAppendError("Username is required.");
        }
        
        //--------------------------------------------------------------------//
        // Find the password
        //--------------------------------------------------------------------//
        if (sPassword !== "") {
            //----------------------------------------------------------------//
            // Make sure it's a secure password.
            //----------------------------------------------------------------//
            var mPasswordInfo = IomyRe.validation.isPasswordSecure(sPassword);
            
            if (!mPasswordInfo.bIsValid) {
                aErrorMessages = aErrorMessages.concat(mPasswordInfo.aErrorMessages);
            }
            
        } else {
            fnAppendError("Password is required");
        }
		
        //--------------------------------------------------------------------//
        // Confirm the password
        //--------------------------------------------------------------------//
        if (sConfirmPassword !== "") {
            if (sPassword === "") {
                fnAppendError("Password is required");
                
            } else if (sPassword !== sConfirmPassword) {
                fnAppendError("Passwords don't match.");
            }
            
        } else {
            fnAppendError("Please confirm your password.");
        }
        
        //--------------------------------------------------------------------//
        // Make sure both the database username and password are there.
        //--------------------------------------------------------------------//
        if (sDBUser === "") {
            fnAppendError("Database Username is required.");
        }
        
        if (sDBPassword === "") {
            fnAppendError("Database Password is required. Find this by opening the iOmy app on the device it is running on, swipe from the left side of the screen, and select 'Settings'. It will be located in under 'MySQL Root Password' entry in the settings page.");
        }
        
        //--------------------------------------------------------------------//
        // Validate the date of birth
        //--------------------------------------------------------------------//
//        if (dDOB !== "") {
//            var mDOBValidationInfo = IOMy.validation.isDOBValid(dDOB);
//            
//            if (mDOBValidationInfo.bIsValid === false) {
//                aLogErrors.push(mDOBValidationInfo.aErrorMessages.join("\n"));
//            }
//            
//            if (mDOBValidationInfo.date !== null) {
//                dDOB = IOMy.functions.getTimestampString(mDOBValidationInfo.date, "yyyy-mm-dd", false);
//            }
//        }
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		//-- Add User Section --//
		try {
			if( bError===false ) {
				 IomyRe.apiphp.AjaxRequest({
                    url : IomyRe.apiphp.APILocation("users"),
                    data : {
                        "Mode" :                 "AddUser",
                        "Title" :                oCurrentFormData.Title,
                        "Givennames" :           oCurrentFormData.Givenname,
                        "Surnames" :             oCurrentFormData.Surname,
                        "Displayname" :          oCurrentFormData.Displayname,
                        "Email" :                oCurrentFormData.Email,
                        "Phone" :                oCurrentFormData.Phone,
                        "Gender" :               oCurrentFormData.Gender,
                        "DoB" :                  sDate,
                        "AddressLine1" :         oCurrentFormData.AddressLine1,
                        "AddressLine2" :         oCurrentFormData.AddressLine2,
                        "AddressLine3" :         oCurrentFormData.AddressLine3,
                        "AddressRegion" :        oCurrentFormData.RegionId,
                        "AddressSubRegion" :     oCurrentFormData.SubRegion,
                        "AddressPostcode" :      oCurrentFormData.Postcode,
                        "AddressTimezone" :      oCurrentFormData.TimezoneId,
                        "AddressLanguage" :      oCurrentFormData.LanguageId,
                        "Username" :             oCurrentFormData.Username,
                        "NewPassword" :          oCurrentFormData.Password,
                        "Data" :                 "{\"Username\":\""+oCurrentFormData.DBUser+"\",\"Password\":\""+oCurrentFormData.DBPassword+"\",\"URI\":\"localhost\"}"
                    },
					onSuccess: function ( sType, mData ) {
						//-- Premise Permissions Section --//
						try {
							if( sType==="JSON" && mData.Error===false ) {
								try {
									if(typeof mData.Data.UserId !== "undefined") {
										var sUserId = mData.Data.UserId;
										var iUserId = parseInt(sUserId);
										
										var iPremiseRead = 0;
										var iPremiseWrite = 0;
										var iRoomAdmin = 0;
										
										//-- If check to see what permissions need to be passed --//
										if (oCurrentFormData.PremPermId == 2 ) {
											//-- Read Access--//
											iPremiseRead = 1;
											iPremiseWrite = 0;
											iRoomAdmin = 0; 
										} else if (oCurrentFormData.PremPermId == 3) {
											//-- Read/Write Access--//
											iPremiseRead = 1;
											iPremiseWrite = 1;
											iRoomAdmin = 0;
											
										} else if (oCurrentFormData.PremPermId == 4) {
											//-- Room Admin Access--//
											iPremiseRead = 1;
											iPremiseWrite = 1;
											iRoomAdmin = 1;
											
										} else {
											//-- No Access--//
											iPremiseRead = 0;
											iPremiseWrite = 0;
											iRoomAdmin = 0;
										}
										
										//-- If Check to see if single premise or all premise --//
										if (oCurrentFormData.PremiseId === 0) {
											$.each(IomyRe.common.PremiseList, function (sI, mPremise) {
												oController.mxUpdateRequests.synchronize({
													task : function () {
														IomyRe.apiphp.AjaxRequest({
															url : IomyRe.apiphp.APILocation("permissions"),
															data : {
																"Mode" : "UpdatePremisePerms",
																"UserId" : iUserId,
																"PremiseId" : mPremise.Id,
																"Data" : "{\"Read\":"+iPremiseRead+",\"Write\":"+iPremiseWrite+",\"RoomAdmin\":"+iRoomAdmin+"}"
															},			
															onSuccess : function (responseType, data) {
																// Keep the queue going.
																oController.mxUpdateRequests.dequeue();
																
																// The queue is empty
																if (!oController.mxUpdateRequests.busy) {
																	oController.InsertNewRoomPermissions(oController, sType, mData);
																}
															},
															onFail : function (response) {
																IomyRe.common.showError(response.responseText, "Error",
																	function () {
																		if (oController.mxUpdateRequests.busy) {
																			oController.mxUpdateRequests.dequeue();
																		}
																		
																		if (!oController.mxUpdateRequests.busy) {
																			
																		}
																	}
																);
															}
														});
													}
												});
											});										
											oController.mxUpdateRequests.dequeue();
										} else {
											IomyRe.apiphp.AjaxRequest({
												url : IomyRe.apiphp.APILocation("permissions"),
												data : {
													"Mode" : "UpdatePremisePerms",
													"UserId" : iUserId,
													"PremiseId" : oCurrentFormData.PremiseId,
													"Data" : "{\"Read\":"+iPremiseRead+",\"Write\":"+iPremiseWrite+",\"RoomAdmin\":"+iRoomAdmin+"}"
												},
												onSuccess : function (responseType, mData) {
													if (data.Error === false) {
														oController.InsertNewRoomPermissions(oController, sType, mData);
													} else {
														jQuery.sap.log.error("There was an error updating the premise permissions: "+mData.ErrMesg);
                                                        oController.ToggleSubmitCancelButtons(true);
													}
												},
												onFail : function (response) {
													jQuery.sap.log.error("There was an error updating the premise permissions: "+JSON.stringify(response));
                                                    
                                                    IomyRe.common.showError( response.responseText, "Error",
                                                        function () {
                                                            oController.ToggleSubmitCancelButtons(true);
                                                        }
                                                    );
												}
											});
										}
									} else {
										jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller!");
                                        oController.ToggleSubmitCancelButtons(true);
									}
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller! "+e3.message);
                                    oController.ToggleSubmitCancelButtons(true);
								}
							} else {
								jQuery.sap.log.error("Error with the 'UpdateRoomPerms' successful API result in the 'RoomForm' controller!");
                                oController.ToggleSubmitCancelButtons(true);
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success in the 'RoomForm' controller! "+e2.message);
                            oController.ToggleSubmitCancelButtons(true);
						}
					},
					onFail: function (response) {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
						jQuery.sap.log.error("Error with the 'UpdateRoomPerms' API Request when inserting Room Permissions in the 'RoomForm' controller!\n\n" + response.responseText);
                        IomyRe.common.showError( response.responseText, "Error",
                            function () {
                                oController.ToggleSubmitCancelButtons(true);
                            }
                        );
					}
				});
			} else {
				IomyRe.common.showError( aErrorMessages.join("\n\n"), "Error",
                    function () {
                        oController.ToggleSubmitCancelButtons(true);
                    }
                );
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with 'AddRoom' in the 'RoomForm' controller! "+e1.message);
		}
	},
	
	InsertNewRoomPermissions: function (oController, sType, mData ) {
		var oCurrentFormData = oController.getView().getModel().getProperty("/NewUser/");
		//-- Premise Permissions Section --//
		try {
			if( sType==="JSON" && mData.Error===false ) {
				try {
					if(typeof mData.Data.UserId !== "undefined") {
						var sUserId = mData.Data.UserId;
						var iUserId = parseInt(sUserId);
						
						var iRoomRead = 0;
						var iRoomDataRead = 0;
						var iRoomWrite = 0;
						var iRoomStateToggle = 0;
						
						//-- If check to see what permissions need to be passed --//
						if (oCurrentFormData.RoomPermId == 2 ) {
							//-- Read Access--//
							iRoomRead = 1;
							iRoomDataRead = 1;
							iRoomWrite = 0;
							iRoomStateToggle = 0;
							
						} else if (oCurrentFormData.RoomPermId == 3) {
							//-- Read / Device Toggle Access--//
							iRoomRead = 1;
							iRoomDataRead = 1;
							iRoomWrite = 0;
							iRoomStateToggle = 1;
							
						} else if (oCurrentFormData.RoomPermId == 4) {
							//-- Read/Write Access--//
							iRoomRead = 1;
							iRoomDataRead = 1;
							iRoomWrite = 1;
							iRoomStateToggle = 1;
							
						} else {
							//-- No Access--//
							iRoomRead = 0;
							iRoomDataRead = 0;
							iRoomWrite = 0;
							iRoomStateToggle = 0;
						}
						
						//-- If Check to see if single Room or all Rooms --//
						if (oCurrentFormData.RoomId === 0) {
							$.each(IomyRe.common.AllRoomsList, function (sI, mRoom) {
								oController.mxUpdateRequests.synchronize({
									task : function () {
										IomyRe.apiphp.AjaxRequest({
											url : IomyRe.apiphp.APILocation("permissions"),
											data : {
												"Mode" : "UpdateRoomPerms",
												"UserId" : iUserId,
												"RoomId" : mRoom.RoomId,
												"Data" : "{\"Read\":"+iRoomRead+",\"DataRead\":"+iRoomDataRead+",\"Write\":"+iRoomWrite+",\"StateToggle\":"+iRoomStateToggle+"}"
											},			
											onSuccess : function (responseType, data) {
												// Keep the queue going.
												oController.mxUpdateRequests.dequeue();
												
												// The queue is empty
												if (!oController.mxUpdateRequests.busy) {
													IomyRe.common.RefreshCoreVariables({
														onSuccess : function () {
                                                            IomyRe.common.showMessage({
                                                                text : "New iOmy user \""+oCurrentFormData.Username+"\" created."
                                                            });
                                                            
                                                            oController.ToggleSubmitCancelButtons(true);
															IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
														}
													});
												}
											},
											onFail : function (response) {
												IomyRe.common.showError(response.responseText, "Error",
													function () {
														if (oController.mxUpdateRequests.busy) {
															oController.mxUpdateRequests.dequeue();
														}
														
														if (!oController.mxUpdateRequests.busy) {
															oController.ToggleSubmitCancelButtons(true);
														}
													}
												);
											}
										});
									}
								});
							});										
							oController.mxUpdateRequests.dequeue();
						} else {
							IomyRe.apiphp.AjaxRequest({
								url : IomyRe.apiphp.APILocation("permissions"),
								data : {
									"Mode" : "UpdateRoomPerms",
									"UserId" : iUserId,
									"RoomId" : oCurrentFormData.RoomId,
									"Data" : "{\"Read\":"+iRoomRead+",\"DataRead\":"+iRoomDataRead+",\"Write\":"+iRoomWrite+",\"StateToggle\":"+iRoomStateToggle+"}"
								},
								onSuccess : function (responseType, mData) {
                                    IomyRe.common.showMessage({
                                        text : "New iOmy user \""+oCurrentFormData.Username+"\" created."
                                    });

                                    oController.ToggleSubmitCancelButtons(true);
									IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
								},
								onFail : function (response) {
									jQuery.sap.log.error("There was an error updating the room permissions: "+JSON.stringify(response));
                                    
                                    IomyRe.common.showError( response.responseText, "Error",
                                        function () {
                                            oController.ToggleSubmitCancelButtons(true);
                                        }
                                    );
								}
							});
						}
					} else {
						jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller!");
					}
					
				} catch( e3 ) {
					jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller! "+e3.message);
				}
			} else {
				jQuery.sap.log.error("Error with the 'UpdateRoomPerms' successful API result in the 'RoomForm' controller!");
			}
		} catch( e2 ) {
			jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success in the 'RoomForm' controller! "+e2.message);
		}
	},
	
	getObjectPageTitle : function (oController) {
		var sObjectTitle = "";
		var oPageHeader = "";
		
		sObjectTitle = "Add User";

		oPageHeader = new sap.uxap.ObjectPageHeader ({
			objectTitle: sObjectTitle
		});
		return oPageHeader;
	},
	
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView = this.getView();	
		
		try {
			switch(sMode) {
				case "AddUser":
					//-- New User Login Info --//
					oView.byId("Login").setVisible( true );
					IomyRe.common.ShowFormFragment( oController, "AddLogin", "LoginBlock_Form", "FormContainer" );
					//-- DB Auth Credentials --//
					oView.byId("DBAuth").setVisible( true );
					IomyRe.common.ShowFormFragment( oController, "DBAuth", "DBAuthBlock_Form", "FormContainer" );
					//-- Add Info --//
					oView.byId("Info").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "InfoBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "AddUserInfo", "InfoBlock_Form", "FormContainer" );
					//-- Add Address --//
					oView.byId("Address").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "AddrBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "AddUserAddress", "AddrBlock_Form", "FormContainer" );
					//-- Add Permissions --//
					oView.byId("Premise").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "PremPermBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "AddPremisePermission", "PremPermBlock_Form", "FormContainer" );
					//-- Add Permissions --//
					oView.byId("Room").setVisible( true );
					IomyRe.forms.ToggleFormMode(oController, "RoomPermBlock_Form", true);
					IomyRe.common.ShowFormFragment( oController, "AddRoomPermission", "RoomPermBlock_Form", "FormContainer" );
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