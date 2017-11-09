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
	iUserId : null,
	
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
				oController.FetchPermissionsForPremise({
                    
                });
                
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
    
    determineRoomPermissionLevel : function (mData) {
        var iPermLevel;
        
        //----------------------------------------------------//
        // Determine the permission level the current user has
        //----------------------------------------------------//
        if (mData.Read === 0) {
            iPermLevel = 0; // No Access

        } else if (mData.Read === 1) {
            iPermLevel = 1; // Read-only

            //----------------------------------------------------//
            // Permission to modify the room
            //----------------------------------------------------//
            if (mData.Write === 1) {
                iPermLevel = 2; // Read and Write

                if (mData.DataRead === 1) {
                    iPermLevel = 3; // Device Access and Read/Write

                    if (mData.StateToggle === 1) {
                        iPermLevel = 4; // Device Management and Read/Write
                    }
                }
            }

        }
        
        return iPermLevel;
    },
    
    determineMostCommonPermissionForAllRooms : function (aPermissionLevels) {
        var iMin = null;
        
        for (var i = 0; i < aPermissionLevels.length; i++) {
            if (iMin === null) {
                iMin = aPermissionLevels[i];
            } else if (iMin > aPermissionLevels[i]) {
                iMin = aPermissionLevels[i];
            }
        }
        
        return iMin;
    },
    
    FetchPermissionsForPremise : function (mSettings) {
        var oController     = this;
        var oView           = this.getView();
        var bError          = false;
        var sUrl            = IomyRe.apiphp.APILocation("permissions");
        var aErrorMessages  = [];
        var iUser;
        var iPremise;
        var bLevelOnly;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };
        
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                iPremise = mSettings.premiseID;
            } else {
                fnAppendError("Premise ID (premiseID) must be given when applying permissions to all rooms in a premise.");
            }
            
            if (mSettings.userID !== undefined && mSettings.userID !== null) {
                iUser = mSettings.userID;
            } else {
                fnAppendError("User ID (userID) must be given.");
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
            if (mSettings.levelOnly !== undefined && mSettings.levelOnly !== null) {
                bLevelOnly = mSettings.levelOnly;
            } else {
                bLevelOnly = false;
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            fnAppendError("Premise ID (premiseID) must be given.");
            fnAppendError("User ID (userID) must be given.");
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n"));
        }
        
        //--------------------------------------------------------------------//
        // Load and display the permissions for the currently selected user.
        //--------------------------------------------------------------------//
        IomyRe.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupPremisePerms",
                "UserId" : iUser,
                "PremiseId" : iPremise
            },
            
            onSuccess : function (responseType, data) {
                if (data.Error === false) {
                    try {
                        var data = data.Data;
                        
                        if (bLevelOnly) {
                            var iPermLevel;

                            //----------------------------------------------------//
                            // Determine the permission level the current user has
                            //----------------------------------------------------//
                            if (data.Read === 0) {
                                iPermLevel = 0; // No Access

                            } else if (data.Read === 1) {
                                iPermLevel = 1; // Read-only

                                //----------------------------------------------------//
                                // Permission to modify the premise
                                //----------------------------------------------------//
                                if (data.Write === 1) {
                                    iPermLevel = 2; // Read and Write

                                    if (data.RoomAdmin === 1) {
                                        iPermLevel = 3; // Room Management and Read/Write
                                    }
                                }

                            }

                            fnSuccess(iPermLevel);
                        } else {
                            fnSuccess(data);
                        }
                        
                    } catch (e) {
                        var sErrMessage = "There was an error setting the permissions on the screen: "+e.message;
                        jQuery.sap.log.error(sErrMessage);
                        
                        fnFail(sErrMessage);
                        
                    }
                } else {
                    fnFail(data.ErrMesg);
                }
            },
            
            onFail : function (response) {
                var sErrMessage = "There was an error accessing the premise permissions: "+response.responseText;
                
                jQuery.sap.log.error(sErrMessage);
                fnFail(sErrMessage);
            }
            
        });
    },
    
    FetchPermissionsForRoom : function (mSettings) {
        var oController         = this;
        var bError              = false;
        var sUrl                = IomyRe.apiphp.APILocation("permissions");
        var aErrorMessages      = [];
        var aPermissionLevels   = [];
        var iUser;
        var iPremise;
        var iRoom;
        var bLevelOnly;
        var fnSuccess;
        var fnFail;
        
        var fnAppendError = function (sErrorMessage) {
            bError = true;
            aErrorMessages.push(sErrorMessage);
        };
        
        if (mSettings !== undefined && mSettings !== null) {
            if (mSettings.roomID !== undefined && mSettings.roomID !== null) {
                iRoom = mSettings.roomID;
                
                if (iRoom == 0) {
                    if (mSettings.premiseID !== undefined && mSettings.premiseID !== null) {
                        iPremise = mSettings.premiseID;
                    } else {
                        fnAppendError("Premise ID (premiseID) must be given when fetching permissions for all rooms in a premise.");
                    }
                }
                
            } else {
                fnAppendError("Room ID (roomID) must be given.");
            }
            
            if (mSettings.userID !== undefined && mSettings.userID !== null) {
                iUser = mSettings.userID;
            } else {
                fnAppendError("User ID (userID) must be given.");
            }
            
            if (bError) {
                throw new IllegalArgumentException(aErrorMessages.join("\n"));
            }
            
            if (mSettings.levelOnly !== undefined && mSettings.levelOnly !== null) {
                bLevelOnly = mSettings.levelOnly;
            } else {
                bLevelOnly = false;
            }
            
            if (mSettings.onSuccess !== undefined && mSettings.onSuccess !== null) {
                fnSuccess = mSettings.onSuccess;
            } else {
                fnSuccess = function () {};
            }
            
            if (mSettings.onFail !== undefined && mSettings.onFail !== null) {
                fnFail = mSettings.onFail;
            } else {
                fnFail = function () {};
            }
            
        } else {
            fnAppendError("Room ID (roomID) must be given.");
            fnAppendError("User ID (userID) must be given.");
            
            throw new MissingSettingsMapException(aErrorMessages.join("\n"));
        }
        
        if (iRoom != 0) {
            //----------------------------------------------------------------//
            // Load and display the permissions for the currently selected user.
            //----------------------------------------------------------------//
            IomyRe.apiphp.AjaxRequest({
                url : sUrl,
                data : {
                    "Mode" : "LookupRoomPerms",
                    "UserId" : iUser,
                    "RoomId" : iRoom
                },

                onSuccess : function (responseType, data) {
                    if (data.Error === false) {
                        try {
                            var data = data.Data;

                            if (bLevelOnly) {
                                var iPermLevel = oController.determineRoomPermissionLevel(data);

                                fnSuccess(iPermLevel);
                            } else {
                                fnSuccess(data);
                            }

                        } catch (e) {
                            jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                            fnFail("(BUG IF YOU SEE THIS!)\n"+e.message);
                        }
                    } else {
                        fnFail(data.ErrMesg)
                    }
                },

                onFail : function (response) {
                    jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                    fnFail(response.responseText);
                }

            });
        } else {
            
            $.each(IomyRe.common.RoomsList["_"+iPremise], function (sI, mRoom) {
                oController.mxFetchRequests.synchronize({
                    task : function () {
                        //--------------------------------------------------------------------//
                        // Load and display the permissions for the currently selected user.
                        //--------------------------------------------------------------------//
                        IomyRe.apiphp.AjaxRequest({
                            url : sUrl,
                            data : {
                                "Mode" : "LookupRoomPerms",
                                "UserId" : iUser,
                                "RoomId" : mRoom.RoomId
                            },

                            onSuccess : function (responseType, data) {
                                if (data.Error === false) {
                                    try {
                                        var data = data.Data;

                                        var iPermLevel = oController.determineRoomPermissionLevel(data);
                                        
                                        aPermissionLevels.push(oController.iPermissionLevel);

                                        oController.mxFetchRequests.dequeue();

                                        if (!oController.mxFetchRequests.busy) {
                                            iPermLevel = oController.determineMostCommonPermissionForAllRooms(aPermissionLevels);
                                            
                                            fnSuccess(iPermLevel);
                                        }

                                    } catch (e) {
                                        jQuery.sap.log.error("There was an error setting the permissions on the screen: "+e.message);
                                        fnFail("(BUG IF YOU SEE THIS!)\n"+e.message);
                                    }
                                } else {
                                    fnFail(data.ErrMesg);
                                }
                            },

                            onFail : function (response) {
                                jQuery.sap.log.error("There was an error accessing the premise permissions: "+JSON.stringify(response));
                                fnFail(response.responseText);
                            }

                        });
                    }
                });
            });
            
            oController.mxFetchRequests.dequeue();
        }
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
        var aPermissionLevels = {
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
        };

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
				} catch(e1){
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
				} catch(e1){
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
                aRoomData['_0'] = {
                    RoomId: 0,
                    RoomName: "All Rooms"
                };
			}
			if( typeof IomyRe.common.PremiseList!=="undefined" ) {
				aPremiseData = JSON.parse(JSON.stringify(IomyRe.common.PremiseList ));
			}
			if( typeof IomyRe.common.UserList["_"+oController.iUserId] !=="undefined" ) {
				aNewUserData = JSON.parse(JSON.stringify( IomyRe.common.UserList["_"+oController.iUserId] ));
                aNewUserData.PremPermId = oConfig.PremPermLevel;
                aNewUserData.RoomPermId = oConfig.RoomPermId;
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
			"NewUser":               aNewUserData,
            "PermLevels":            aPermissionLevels
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
    
    UpdateRoomPermissions: function (oController, sType, mData ) {
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
						if (oCurrentFormData.PremPermId === 2 ) {
							//-- Read Access--//
							iRoomRead = 1;
							iRoomDataRead = 1;
							iRoomWrite = 0;
							iRoomStateToggle = 0;
							
						} else if (oCurrentFormData.RoomPremId === 3) {
							//-- Read / Device Toggle Access--//
							iRoomRead = 1;
							iRoomDataRead = 1;
							iRoomWrite = 0;
							iRoomStateToggle = 1;
							
						} else if (oCurrentFormData.RoomPremId === 4) {
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
									IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
								},
								onFail : function (response) {
									jQuery.sap.log.error("There was an error updating the premise permissions: "+JSON.stringify(response));
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

});