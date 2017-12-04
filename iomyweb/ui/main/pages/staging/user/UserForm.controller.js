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
	aFormFragments: {},
	iUserId:        -1,
	mModelData:     {},
	

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView       = this.getView();
		
		oView.addEventDelegate({
			
			onBeforeShow: function ( oEvent ) {
				try {
					//------------------------------------------------------------//
					//-- Store the Users Id                                     --//
					//------------------------------------------------------------//
					oController.iUserId = oEvent.data.userID;
					
					//------------------------------------------------------------//
					//-- Setup the Model placeholder                            --//
					//------------------------------------------------------------//
					oController.mModelData = {
						"Regions":               IomyRe.common.Regions,
						"Languages":             IomyRe.common.Languages,
						"Timezones":             IomyRe.common.Timezones,
						"PermLevelsPremise":     IomyRe.common.PermLevelsPremise,
						"PermLevelsDevice":      IomyRe.common.PermLevelsDevice,
						"AllPremises":           {},
						"AllRooms":              {},
						"PremiseRooms":          {},
						"PremisePerms":          {},
						"RoomPerms":             {},
						"UserInfo":              {},
						"Form": {
							"PremisePerm":   {
								"Id":            -1,
								"PermLevel":     -1
							},
							"RoomPerm":      {
								"PremiseId":     -1,
								"Id":            -1,
								"PermLevel":     -1
							}
						},
						"Previous": {
							"Premises":          {},
							"UserInfo":          {},
							"PremisePerms":      {},
							"RoomPerms":         {}
						}
					};
					
					//------------------------------------------------------------//
					//-- STEP 2 - Start Loading the Ajax Data                   --//
					//------------------------------------------------------------//
					//-- NOTE: This will have to be replaced with a better solution later on --//
					
					//----------------------------------------//
					//-- Load the UserInfo                  --//
					//----------------------------------------//
					oController.RefreshUserInfo( oController, {
						onSuccess: function() {
							//----------------------------------------//
							//-- Load the Premise List              --//
							//----------------------------------------//
							oController.RefreshPremiseList( oController, {
								onSuccess: function() {
									//----------------------------------------//
									//-- Load the Room List                 --//
									//----------------------------------------//
									oController.RefreshRoomList( oController, {
										onSuccess: function() {
											//----------------------------------------//
											//-- Load the Premise Permissions       --//
											//----------------------------------------//
											oController.RefreshUserPremisePerms( oController, {
												onSuccess: function() {
													//----------------------------------------//
													//-- Load the Room Permissions          --//
													//----------------------------------------//
													oController.RefreshUserRoomPerms( oController, {
														onSuccess: function() {
															//----------------------------------------//
															//-- Refresh the Model                  --//
															//----------------------------------------//
															oController.RefreshModel( oController, {
																Reset:     "All",
																onSuccess: function() {
																	//----------------------------------------//
																	//-- Add the Fragments                  --//
																	//----------------------------------------//
																	oController.ToggleButtonsAndView( oController, "UserInfoShow" );
																	oController.ToggleButtonsAndView( oController, "UserAddressShow" );
																	oController.ToggleButtonsAndView( oController, "PremPermShow" );
																	oController.ToggleButtonsAndView( oController, "RoomPermShow" );
																	
																},
																onFail: function() {
																	
																}
															}); //-- END Refresh Model --//
														},
														onFail: function() {
															
														}
													}); //-- END Room Permissions --//
												},
												onFail: function() {
													
												}
											}); //-- END Premise Permissions --//
											
											},
										onFail: function() {
											
										}
									}); //-- END Room List --//
								},
								onFail: function() {
									
								}
							}); //-- END Premise List --//
						},
						onFail: function() {
							
						}
					}); //-- END User Information --//
				} catch( e001 ) {
					
					
				}
			}
		});
	},
	
	
	//========================================================//
	//== 2.1 - Refresh User Information                     ==//
	//========================================================//
	RefreshUserInfo: function( oController, oConfig ) {
		//-- Function for refreshing the desired User Info --//
		try {
			IomyRe.apiphp.AjaxRequest({
				url:  IomyRe.apiphp.APILocation("users"),
				data: {
					"Mode":      "AdminUserList",
				},
				onSuccess: function ( sExpectedDataType, aAjaxData ) {
					try {
						if( sExpectedDataType==="JSON" && aAjaxData.Error===false ) {
							//-- Declare variables --//
							var bUserFound = false;
							var mUserData  = {};
							
							//-- Search for the desired User --//
							$.each( aAjaxData.Data, function( Key, mUser ) {
								if( mUser.Id===oController.iUserId ) {
									//-- User match found --//
									bUserFound = true;
									mUserData  = mUser;
								}
							});
							
							//-- If the desired User was found --//
							if( bUserFound===true ) {
								oController.mModelData.Previous.UserInfo = mUserData;
								oController.mModelData.UserInfo = JSON.parse( JSON.stringify( oController.mModelData.Previous.UserInfo ) );
								//-- Perform the "onSuccess" function if applicable --//
								if( oConfig.onSuccess ) {
									try {
										oConfig.onSuccess();
									} catch( e0003 ) {
										//-- Error with the onSuccess Event --//
										$.sap.log.error("Critical Error in the RefreshUserInfo onSuccess event on the UserForm page!");
									}
								}
							} else {
								//-- ERROR: User not found --//
								IOMy.common.showError("Cannot find data on the desired User!", "Edit User");
								
								//-- Perform the "onFail" function if applicable --//
								if(oConfig.onFail) {
									oConfig.onFail();
								}
							}
							
						} else {
							//-- ERROR: --//
							IOMy.common.showError("API has refused access to the UserList! Please contact the administrator of your iOmy System for details", "Edit User Page");
							
							if(oConfig.onFail) {
								oConfig.onFail();
							}
						}
					} catch( e0002 ) {
						//-- Error: --//
						$.sap.log.error("Critical Error in the RefreshUserInfo Ajax Success on the UserForm page!");
						
						if(oConfig.onFail) {
							oConfig.onFail();
						}
					}
				},
				onFail: function( sResponse ) {
					IOMy.common.showError("API has refused access to the UserList! Please contact the administrator of your iOmy System for details", "Edit User Page");
					
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			});
		} catch( e0001 ) {
			$.sap.log.error("Critical Error in the RefreshUserInfo function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.2 - Refresh Premise List                         ==//
	//========================================================//
	RefreshPremiseList: function( oController, oConfig ) {
		try {
			IomyRe.apiphp.AjaxRequest({
				url:  IomyRe.apiphp.APILocation("premises"),
				data: {
					"Mode":      "AdminPremiseList"
				},
				onSuccess: function ( sExpectedDataType, aAjaxData ) {
					try {
						if( sExpectedDataType==="JSON" && aAjaxData.Error===false ) {
							
							//-- Store the values --//
							oController.mModelData.AllPremises = JSON.parse(JSON.stringify( aAjaxData.Data ) );
							
							
							//-- Perform the "onSuccess" function if applicable --//
							if( oConfig.onSuccess ) {
								try {
									oConfig.onSuccess();
								} catch( e0003 ) {
									//-- Error with the onSuccess Event --//
									$.sap.log.error("Critical Error in the RefreshPremiseList onSuccess event on the UserForm page!");
								}
							}
						} else {
							//----------------//
							//-- ERROR:     --//
							//----------------//
							IOMy.common.showError("API has refused access to the Premise list! Please contact the administrator of your iOmy System for details", "Edit User Page");
							
							if(oConfig.onFail) {
								oConfig.onFail();
							}
						}
					} catch( e0002 ) {
						//----------------//
						//-- ERROR:     --//
						//----------------//
						$.sap.log.error("Critical Error in the RefreshPremiseList Ajax Success on the UserForm page!");
						
						if(oConfig.onFail) {
							oConfig.onFail();
						}
					}
				},
				onFail: function( sResponse ) {
					//----------------//
					//-- ERROR:     --//
					//----------------//
					IOMy.common.showError("API has refused access to the Premise list! Please contact the administrator of your iOmy System for details", "Edit User Page");
					
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			});
		} catch( e0001 ) {
			//----------------//
			//-- ERROR:     --//
			//----------------//
			$.sap.log.error("Critical Error in the RefreshPremiseList function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.3 - Refresh User Premise Permissions             ==//
	//========================================================//
	RefreshUserPremisePerms: function( oController, oConfig ) {
		try {
			IomyRe.apiphp.AjaxRequest({
				url:  IomyRe.apiphp.APILocation("permissions"),
				data: {
					"Mode":      "AdminUserPremisePerms",
					"UserId":    oController.iUserId
				},
				onSuccess: function ( sExpectedDataType, aAjaxData ) {
					try {
						if( sExpectedDataType==="JSON" && aAjaxData.Error===false ) {
							//----------------//
							//-- SUCCESS    --//
							//----------------//
							var iPermissionLevel = 0;
							
							//-- Reset the array --//
							oController.mModelData.Previous.PremisePerms = {};
							
							$.each( aAjaxData.Data, function( Key, mPremise ) {
								//-- Convert Permissions to Permission Level --//
								var iPermissionLevel = IomyRe.common.LookupPremisePermLevelFromPermissions( mPremise );
								
								//-- Create the array key --//
								var sKey = "_"+mPremise.PremiseId;
								
								
								oController.mModelData.Previous.PremisePerms[sKey] = {
									"PremiseId":   mPremise.PremiseId,
									"PremiseName": mPremise.PremiseName,
									"PermLevel":   iPermissionLevel
								}
							});
							
							//-- Clone the PremisePerms so that they are easy to reset if the User cancels --//
							oController.mModelData.PremisePerms = JSON.parse(JSON.stringify( oController.mModelData.Previous.PremisePerms ) );
							
							
							//-- Perform the "onSuccess" function if applicable --//
							if( oConfig.onSuccess ) {
								try {
									oConfig.onSuccess();
								} catch( e0003 ) {
									//-- Error with the onSuccess Event --//
									$.sap.log.error("Critical Error in the RefreshUserPremisePerms onSuccess event on the UserForm page!");
								}
							}
						} else {
							//----------------//
							//-- ERROR:     --//
							//----------------//
							IOMy.common.showError("API has refused access to the Premise permissions! Please contact the administrator of your iOmy System for details", "Edit User Page");
							
							if(oConfig.onFail) {
								oConfig.onFail();
							}
						}
					} catch( e0002 ) {
						//----------------//
						//-- ERROR:     --//
						//----------------//
						$.sap.log.error("Critical Error in the RefreshUserPremisePerms Ajax Success on the UserForm page!");
						
						if(oConfig.onFail) {
							oConfig.onFail();
						}
					}
				},
				onFail: function( sResponse ) {
					//----------------//
					//-- ERROR:     --//
					//----------------//
					IOMy.common.showError("API has refused access to the Premise permissions! Please contact the administrator of your iOmy System for details", "Edit User Page");
					
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			});
		} catch( e0001 ) {
			//----------------//
			//-- ERROR:     --//
			//----------------//
			$.sap.log.error("Critical Error in the RefreshUserPremisePerms function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.4 - Refresh User Room Permissions                ==//
	//========================================================//
	RefreshUserRoomPerms: function( oController, oConfig ) {
		try {
			IomyRe.apiphp.AjaxRequest({
				url:  IomyRe.apiphp.APILocation("permissions"),
				data: {
					"Mode":      "AdminUserRoomPerms",
					"UserId":    oController.iUserId
				},
				onSuccess: function ( sExpectedDataType, aAjaxData ) {
					try {
						if( sExpectedDataType==="JSON" && aAjaxData.Error===false ) {
							//----------------//
							//-- SUCCESS    --//
							//----------------//
							var iPermissionLevel = 0;
							
							//-- Reset the array --//
							oController.mModelData.Previous.RoomPerms = {};
							
							$.each( aAjaxData.Data, function( Key, mRoom ) {
								//-- Convert Permissions to Permission Level --//
								var iPermissionLevel = IomyRe.common.LookupRoomPermLevelFromPermissions( mRoom );
								
								//-- Create the array key --//
								var sKey = "_"+mRoom.RoomId;
								
								
								oController.mModelData.Previous.RoomPerms[sKey] = {
									"Id":          mRoom.PremiseId,
									"Name":        mRoom.PremiseName,
									"PermLevel":   iPermissionLevel
								}
							});
							
							oController.mModelData.RoomPerms = JSON.parse(JSON.stringify( oController.mModelData.Previous.RoomPerms ) );
							
							//-- Perform the "onSuccess" function if applicable --//
							if( oConfig.onSuccess ) {
								try {
									oConfig.onSuccess();
								} catch( e0003 ) {
									//-- Error with the onSuccess Event --//
									$.sap.log.error("Critical Error in the RefreshUserRoomPerms onSuccess event on the UserForm page!");
								}
							}
						} else {
							//----------------//
							//-- ERROR:     --//
							//----------------//
							IOMy.common.showError("API has refused access to the Room permissions! Please contact the administrator of your iOmy System for details", "Edit User Page");
							
							if(oConfig.onFail) {
								oConfig.onFail();
							}
						}
					} catch( e0002 ) {
						//----------------//
						//-- ERROR:     --//
						//----------------//
						$.sap.log.error("Critical Error in the RefreshUserRoomPerms Ajax Success on the UserForm page!");
						
						if(oConfig.onFail) {
							oConfig.onFail();
						}
					}
				},
				onFail: function( sResponse ) {
					//----------------//
					//-- ERROR:     --//
					//----------------//
					
					IOMy.common.showError("API has refused access to the Room permissions! Please contact the administrator of your iOmy System for details", "Edit User Page");
					
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			});
		} catch( e0001 ) {
			//----------------//
			//-- ERROR:     --//
			//----------------//
			$.sap.log.error("Critical Error in the RefreshUserRoomPerms function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.5 - Refresh Room List                            ==//
	//========================================================//
	RefreshRoomList: function( oController, oConfig ) {
		try {
			IomyRe.apiphp.AjaxRequest({
				url:  IomyRe.apiphp.APILocation("rooms"),
				data: {
					"Mode":      "AdminRoomList"
				},
				onSuccess: function ( sExpectedDataType, aAjaxData ) {
					try {
						if( sExpectedDataType==="JSON" && aAjaxData.Error===false ) {
							
							//-- Store the values --//
							oController.mModelData.AllRooms = JSON.parse(JSON.stringify( aAjaxData.Data ) );
							
							
							//-- Perform the "onSuccess" function if applicable --//
							if( oConfig.onSuccess ) {
								try {
									oConfig.onSuccess();
								} catch( e0003 ) {
									//-- Error with the onSuccess Event --//
									$.sap.log.error("Critical Error in the RefreshRoomList onSuccess event on the UserForm page!");
								}
							}
						} else {
							//----------------//
							//-- ERROR:     --//
							//----------------//
							IOMy.common.showError("API has refused access to the Room list! Please contact the administrator of your iOmy System for details", "Edit User Page");
							
							if(oConfig.onFail) {
								oConfig.onFail();
							}
						}
					} catch( e0002 ) {
						//----------------//
						//-- ERROR:     --//
						//----------------//
						$.sap.log.error("Critical Error in the RefreshRoomList Ajax Success on the UserForm page!");
						
						if(oConfig.onFail) {
							oConfig.onFail();
						}
					}
				},
				onFail: function( sResponse ) {
					//----------------//
					//-- ERROR:     --//
					//----------------//
					IOMy.common.showError("API has refused access to the Room list! Please contact the administrator of your iOmy System for details", "Edit User Page");
					
					if(oConfig.onFail) {
						oConfig.onFail();
					}
				}
			});
		} catch( e0001 ) {
			//----------------//
			//-- ERROR:     --//
			//----------------//
			$.sap.log.error("Critical Error in the RefreshRoomList function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.6 - Refresh Model                                ==//
	//========================================================//
	RefreshModel: function( oController, oConfig ) {
		try {
			var oView = oController.getView();
			//------------------------------------------------//
			//-- Reset any values if needed                 --//
			//------------------------------------------------//
			if( typeof oConfig.Reset!=="undefined" ) {
				
				//------------------------------------------------//
				//-- 2.6.1 - Reset UserInfo                     --//
				//------------------------------------------------//
				if( oConfig.Reset==="All" || oConfig.Reset==="UserInfo" || oConfig.Reset==="UserAddress" ) {
					oController.mModelData.UserInfo = JSON.parse(JSON.stringify( oController.mModelData.Previous.UserInfo ) );
				}
				
				//------------------------------------------------//
				//-- 2.6.2 - Reset PremPerm                     --//
				//------------------------------------------------//
				if( oConfig.Reset==="All" || oConfig.Reset==="PremPerm" ) {
					oController.mModelData.PremisePerms = JSON.parse( JSON.stringify( oController.mModelData.Previous.PremisePerms ) );
					
					
					//-- Reset the Edit Premise Permissions fragment back to the first entry --//
					var bFirstPremPermFound = false;
					$.each( oController.mModelData.PremisePerms, function( Key, mPremPerm ) {
						if( bFirstPremPermFound===false ) {
							//-- Flag that a match has been found --//
							bFirstPremPermFound = true;
							
							oController.mModelData.Form.PremisePerm = {
								"Id":        mPremPerm.PremiseId,
								"PermLevel": mPremPerm.PermLevel
							};
							
							oController.UpdateSelectablePremisePerms( oController );
						}
					});
				}
				
				//------------------------------------------------//
				//-- 2.6.3 - Reset RoomPerm                     --//
				//------------------------------------------------//
				if( oConfig.Reset==="All" || oConfig.Reset==="RoomPerm" ) {
					//--------------------------------------------//
					//-- Set the first Premise as the current   --//
					var bFirstPremFound = false;
					$.each( oController.mModelData.AllPremises, function( Key, mPremise ) {
						if( bFirstPremFound===false ) {
							bFirstPremFound = true;
							oController.mModelData.Form.RoomPerm.PremiseId = mPremise.Id;
						}
					});
					
					//--------------------------------------------//
					//-- Update the list of PremiseRooms        --//
					oController.UpdatePremiseRoomList( oController );
					
					//--------------------------------------------//
					//-- Update the list of RoomPerms           --//
					oController.UpdateSelectableRoomPerms( oController );
					
				}
			}
			
			
			//------------------------------------------------//
			//-- Build and Bind Model to the View           --//
			//------------------------------------------------//
			var oModel = new sap.ui.model.json.JSONModel( oController.mModelData );
			
			oModel.setSizeLimit(420);
			oView.setModel( oModel );
			
			
			//-- Perform the "onSuccess" function if applicable --//
			
			//----------------//
			//-- SUCCESS    --//
			//----------------//
			if( oConfig.onSuccess ) {
				try {
					oConfig.onSuccess();
				} catch( e0003 ) {
					//-- Error with the onSuccess Event --//
					$.sap.log.error("Critical Error in the RefreshModel onSuccess event on the UserForm page!");
				}
			}
			
			
		} catch( e0001 ) {
			//----------------//
			//-- ERROR:     --//
			//----------------//
			$.sap.log.error("Critical Error in the RefreshModel function on the UserForm page!");
			
			if(oConfig.onFail) {
				oConfig.onFail();
			}
		}
	},
	
	//========================================================//
	//== 2.9 - Toggle Fragment                              ==//
	//========================================================//
	ToggleButtonsAndView: function ( oController, sMode ) {
		var oView         = oController.getView();
		
		try {
			switch( sMode ) {
				//----------------------------//
				//-- User Information       --//
				//----------------------------//
				case "UserInfoShow":
					oView.byId("UserInfoBlock_BtnEdit").setVisible( true );
					oView.byId("UserInfoBlock_BtnSave").setVisible( false );
					oView.byId("UserInfoBlock_BtnCancel").setVisible( false );
					oView.byId("UserInfoBlock_Form").setEditable( false );
					IomyRe.common.ShowFormFragment( oController, "UserEditInfoDisplay", "UserInfoBlock_Form", "FormContainer" );
					break;
					
				case "UserInfoEdit":
					oView.byId("UserInfoBlock_BtnEdit").setVisible( false );
					oView.byId("UserInfoBlock_BtnSave").setVisible( true );
					oView.byId("UserInfoBlock_BtnCancel").setVisible( true );
					oView.byId("UserInfoBlock_Form").setEditable( true );
					IomyRe.common.ShowFormFragment( oController, "UserEditInfoEdit", "UserInfoBlock_Form", "FormContainer" );
					break;
					
				//----------------------------//
				//-- User Address           --//
				//----------------------------//
				case "UserAddressShow":
					oView.byId("UserAddressBlock_BtnEdit").setVisible( true );
					oView.byId("UserAddressBlock_BtnSave").setVisible( false );
					oView.byId("UserAddressBlock_BtnCancel").setVisible( false );
					oView.byId("UserAddressBlock_Form").setEditable( false );
					IomyRe.common.ShowFormFragment( oController, "UserEditAddressDisplay", "UserAddressBlock_Form", "FormContainer" );
					break;
					
				case "UserAddressEdit":
					oView.byId("UserAddressBlock_BtnEdit").setVisible( false );
					oView.byId("UserAddressBlock_BtnSave").setVisible( true );
					oView.byId("UserAddressBlock_BtnCancel").setVisible( true );
					oView.byId("UserAddressBlock_Form").setEditable( true );
					IomyRe.common.ShowFormFragment( oController, "UserEditAddressEdit", "UserAddressBlock_Form", "FormContainer" );
					break;
					
				//----------------------------//
				//-- Premise Permissions    --//
				//----------------------------//
				case "PremPermShow":
					oView.byId("PremPermBlock_BtnEdit").setVisible( true );
					oView.byId("PremPermBlock_BtnSave").setVisible( false );
					oView.byId("PremPermBlock_BtnCancel").setVisible( false );
					oView.byId("PremPermBlock_Form").setEditable( false );
					IomyRe.common.ShowFormFragment( oController, "UserEditPremPermDisplay", "PremPermBlock_Form", "FormContainer" );
					break;
					
				case "PremPermEdit":
					oView.byId("PremPermBlock_BtnEdit").setVisible( false );
					oView.byId("PremPermBlock_BtnSave").setVisible( true );
					oView.byId("PremPermBlock_BtnCancel").setVisible( true );
					oView.byId("PremPermBlock_Form").setEditable( true );
					IomyRe.common.ShowFormFragment( oController, "UserEditPremPermEdit", "PremPermBlock_Form", "FormContainer" );
					break;
					
				//----------------------------//
				//-- Room Permissions       --//
				//----------------------------//
				case "RoomPermShow":
					oView.byId("RoomPermBlock_BtnEdit").setVisible( true );
					oView.byId("RoomPermBlock_BtnSave").setVisible( false );
					oView.byId("RoomPermBlock_BtnCancel").setVisible( false );
					oView.byId("RoomPermBlock_Form").setEditable( false );
					IomyRe.common.ShowFormFragment( oController, "UserEditRoomPermDisplay", "RoomPermBlock_Form", "FormContainer" );
					break;
					
				case "RoomPermEdit":
					oView.byId("RoomPermBlock_BtnEdit").setVisible( false );
					oView.byId("RoomPermBlock_BtnSave").setVisible( true );
					oView.byId("RoomPermBlock_BtnCancel").setVisible( true );
					oView.byId("RoomPermBlock_Form").setEditable( true );
					IomyRe.common.ShowFormFragment( oController, "UserEditRoomPermEdit", "RoomPermBlock_Form", "FormContainer" );
					break;
					
				default:
					$.sap.log.error("ToggleButtonsAndView: Critcal Error. sMode set incorrectly:"+sMode);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	},
	
	//========================================================//
	//== 3.1 - Update Selectable Premise Permissions        ==//
	//========================================================//
	UpdateSelectablePremisePerms: function( oController ) {
		
		try {
			//-- Lookup the Premise Code --//
			var sPremCode = "_"+oController.mModelData.Form.PremisePerm.Id;
			
			//-- Find the selected Premise --//
			if( typeof oController.mModelData.PremisePerms[sPremCode]!=="undefined" ) {
				
				//----------------------------------------//
				//-- IF Premise Administrator           --//
				//----------------------------------------//
				if( oController.mModelData.PremisePerms[sPremCode].PermLevel>=4 ) {
					//-- TODO: When "iOmy 0.6" comes out enable the option for "Level 4" to be selectable with "Level 5" --//
					//--       ( Merge the "if else" to a single result ) --//
					
					if( oController.mModelData.PremisePerms[sPremCode].PermLevel===4 ) {
						oController.mModelData.PermLevelsPremise = {
							"_4": IomyRe.common.PermLevelsPremise["_4"]
						};
					} else {
						oController.mModelData.PermLevelsPremise = {
							"_5": IomyRe.common.PermLevelsPremise["_5"]
						};
					}
					
				///---------------------------------------//
				//-- ELSE Not a Premise Administrator   --//
				//----------------------------------------//
				} else {
					oController.mModelData.PermLevelsPremise = {
						"_0": IomyRe.common.PermLevelsPremise["_0"],
						"_1": IomyRe.common.PermLevelsPremise["_1"],
						"_2": IomyRe.common.PermLevelsPremise["_2"],
						"_3": IomyRe.common.PermLevelsPremise["_3"]
					};
				}
				
				oController.mModelData.Form.PremisePerm.PermLevel = oController.mModelData.PremisePerms[sPremCode].PermLevel;
				
				//----------------------------------------//
				//-- SUCCESS                            --//
				//----------------------------------------//
				return true;
			} else {
				
				//----------------------------------------//
				//-- No Permissions found               --//
				//----------------------------------------//
				
				//-- Set default select box permissions --//
				oController.mModelData.PermLevelsPremise = {
					"_0": IomyRe.common.PermLevelsPremise["_0"],
					"_1": IomyRe.common.PermLevelsPremise["_1"],
					"_2": IomyRe.common.PermLevelsPremise["_2"],
					"_3": IomyRe.common.PermLevelsPremise["_3"]
				};
				
				//-- Set the Perm Level to 0 --//;
				oController.mModelData.Form.PremisePerm.PermLevel = 0;
				
				//----------------------------------------//
				//-- SUCCESS                            --//
				//----------------------------------------//
				return true;
			}
		
		} catch(e1) {
			$.sap.log.error("UpdateSelectablePremisePerms: Critcal Error:"+e1.message);
			return false;
		}
		
	},

	//========================================================//
	//== 3.2 - Update Selectable Room Permissions           ==//
	//========================================================//
	UpdateSelectableRoomPerms: function( oController ) {
		
		try {
			//-- Lookup the Room Code --//
			var sRoomCode = "_"+oController.mModelData.Form.RoomPerm.Id;
			
			//-- Find the selected Room --//
			if( typeof oController.mModelData.RoomPerms[sRoomCode]!=="undefined" ) {
				
				oController.mModelData.PermLevelsRoom = {
					"_0": IomyRe.common.PermLevelsRoom["_0"],
					"_1": IomyRe.common.PermLevelsRoom["_1"],
					"_2": IomyRe.common.PermLevelsRoom["_2"],
					"_3": IomyRe.common.PermLevelsRoom["_3"]
				};
				
				oController.mModelData.Form.RoomPerm.PermLevel = oController.mModelData.RoomPerms[sRoomCode].PermLevel;
				
				//----------------------------------------//
				//-- SUCCESS                            --//
				//----------------------------------------//
				return true;
			} else {
				//----------------------------------------//
				//-- No Permissions found               --//
				//----------------------------------------//
				
				//-- Set default select box permissions --//
				oController.mModelData.PermLevelsRoom = {
					"_0": IomyRe.common.PermLevelsRoom["_0"],
					"_1": IomyRe.common.PermLevelsRoom["_1"],
					"_2": IomyRe.common.PermLevelsRoom["_2"],
					"_3": IomyRe.common.PermLevelsRoom["_3"]
				};
				
				//-- Set the Perm Level to 0 --//;
				oController.mModelData.Form.RoomPerm.PermLevel = 0;
				
				//----------------------------------------//
				//-- SUCCESS                            --//
				//----------------------------------------//
				return true;
			}
		} catch(e1) {
			$.sap.log.error("UpdateSelectableRoomPerms: Critcal Error:"+e1.message);
			return false;
		}
		
	},
	
	//========================================================//
	//== 3.3 - Update Premise Room List                     ==//
	//========================================================//
	UpdatePremiseRoomList: function( oController ) {
		var iPremiseId      = parseInt( oController.mModelData.Form.RoomPerm.PremiseId );
		var bRoomFound      = false;
		var bFirstRoomFound = false;
		//var sPremCode = "_"+oController.mModelData.Form.RoomPerm.PremiseId;
		
		//-- Reset the Room List --//
		oController.mModelData.PremiseRooms = {};
		
		//-- Search through the RoomList for ones that are in the desired premise --//
		$.each( oController.mModelData.AllRooms, function( Key, mRoom ) {
			if( mRoom.PremiseId===iPremiseId ) {
				//-- Flag that a Room has been found for the premise --//
				bRoomFound = true;
				//-- Check if this is the first room found in that desired premise --//
				if( bFirstRoomFound===false ) {
					bFirstRoomFound = true;
					oController.mModelData.Form.RoomPerm.Id = mRoom.Id;
				}
				
				//-- Create the room code --//
				var sRoomCode = "_"+mRoom.Id;
				//-- Store the room --//
				oController.mModelData.PremiseRooms[sRoomCode] = mRoom;
			}
		});
		
		//------------------------------------------------//
		//-- IF No Rooms were found                     --//
		//------------------------------------------------//
		if( bRoomFound===false ) {
			oController.mModelData.PremiseRooms['_-1'] = {
				"Id":       -1,
				"Name":     "== No Rooms found =="
			};
			oController.mModelData.Form.RoomPerm.Id = -1;
		}
		
		//------------------------------------------------//
		//-- Return SUCCESS                             --//
		//------------------------------------------------//
		return true;
	},
	

	
	//========================================================//
	//== 4.1 - Create UI5 Form Section                      ==//
	//========================================================//
	CreateUIFormSection: function( oController, oConfig ) {
		var oView         = oController.getView();
		var sPrefix       = oConfig.Prefix;
		var sTitle        = oConfig.Title;
		
		
		var oFormSection = new sap.uxap.ObjectPageSection( oView.createId( sPrefix ), {
			showTitle:   false,
			title:       sTitle,
			subSections: [
				new sap.uxap.ObjectPageSubSection( oView.createId( sPrefix+"Block" ), {
					blocks : [
						new sap.ui.layout.form.Form( oView.createId( sPrefix+"Block_Form" ), {
							editable: false,
							layout:   new sap.ui.layout.form.ResponsiveGridLayout({
								labelSpanXL: 3,
								labelSpanL: 3,
								labelSpanM: 3,
								labelSpanS: 12,
								adjustLabelSpan: false,
								emptySpanXL: 3,
								emptySpanL: 2,
								emptySpanM: 0,
								emptySpanS: 0,
								columnsXL: 1,
								columnsL: 1,
								columnsM: 1,
								columnsS: 1,
								singleContainerFullSize: false
							}),
							toolbar : new sap.m.Toolbar({
								content : [
									//----------------------------//
									//-- TITLE                  --//
									//----------------------------//
									new sap.m.Title({
										text: sTitle,
									}),
									new sap.m.ToolbarSpacer ({}),
									//----------------------------//
									//-- BUTTONS                --//
									//----------------------------//
									new sap.m.Button ( oView.createId( sPrefix+"Block_BtnEdit"), {
										icon:    "sap-icon://edit",
										press:   function() {
											oController.ToggleButtonsAndView( oController, sPrefix+"Edit" );
										}
									}),
									new sap.m.Button( oView.createId( sPrefix+"Block_BtnSave" ), {
										icon:    "sap-icon://save",
										visible: false,
										press:   function( oEvent ) {
											oController.UpdateValues( oController, sPrefix );
										}
									}),
									new sap.m.Button( oView.createId( sPrefix+"Block_BtnCancel"), {
										icon:    "sap-icon://cancel",
										visible: false,
										press:   function( oEvent ) {
											oController.RefreshModel( oController, {
												Reset:     sPrefix,
												onSuccess: function() {
													oController.ToggleButtonsAndView( oController, sPrefix+"Show" );
													
												}
											});
										}
									})
								]
							}).addStyleClass("MarBottom1d0Rem"),
							formContainers: [
							
							]
						})
					]
				})
			]
		});
		return oFormSection;
	},
	

	//========================================================//
	//== 5.1 - Update Database                              ==//
	//========================================================//
	UpdateValues: function( oController, sPrefix ) {
		
		if( sPrefix==="UserInfo" ) {
			return oController.UpdateUserInfoValues( oController );
			
		//-- ELSEIF User Address --//
		} else if( sPrefix==="UserAddress" ) {
			return oController.UpdateUserAddressValues( oController );
			
		//-- ELSEIF Premise Permissions --//
		} else if( sPrefix==="PremPerm" ) {
			return oController.UpdatePremisePermissions( oController );
			
		//-- ELSE Room Permissions --//
		} else {
			return oController.UpdateRoomPermissions( oController );
		}
		
		
	},
	
	//========================================================//
	//== 5.2 - Update the Premise Permissions               ==//
	//========================================================//
	UpdateUserInfoValues: function (oController) {
		var bError   = false;
		var sErrMesg = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				IomyRe.apiphp.AjaxRequest({
					url:       IomyRe.apiphp.APILocation("users"),
					data:      {
						"Mode":        "EditOtherUserInfo",
						"Title":       oCurrentFormData.Title,
						"Givennames":  oCurrentFormData.Givennames,
						"Surnames":    oCurrentFormData.Surnames,
						"Displayname": oCurrentFormData.Displayname,
						"Email":       oCurrentFormData.Email,
						"Phone":       oCurrentFormData.Phone,
						"Gender":      oCurrentFormData.GenderId,
						"Data":       "{\"UserId\":"+oController.iUserId+"}"
					},
					onSuccess: function ( sType, aData ) {
						try {
							if( sType==="JSON" && aData.Error===false ) {
								try {
									//----------------------------------------//
									//-- Refresh the User Info              --//
									//----------------------------------------//
									oController.RefreshUserInfo( oController, {
										onSuccess: function() {
											//----------------------------------------//
											//-- Refresh the Model                  --//
											//----------------------------------------//
											oController.RefreshModel( oController, {
												Reset:     "UserInfo",
												onSuccess: function() {
													//----------------------------------------//
													//-- Load the Display Fragment          --//
													//----------------------------------------//
													oController.ToggleButtonsAndView( oController, "UserInfoShow" );
												},
												onFail: function() {
													
												}
											}); //-- END Refresh Model --//
										},
										onFail: function() {
											
										}
									}); //-- END Room Permissions --//
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' success event that was passed as a parameter in the 'UserForm' controller! "+e3.message);
								}
							} else {
								jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' successful API result in the 'UserForm' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' success in the 'UserForm' controller! "+e2.message);
						}
					},
					onFail: function () {
						jQuery.sap.log.error("Error with the 'UpdateUserInfoValues' API Request when editing a LandPackage in the 'UserForm' controller!");
					}
				});
			} else {
				IomyRe.common.showError( sErrMesg, "Error" );
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with'UpdateUserInfoValues' in the 'UserForm' controller! "+e1.message);
		}
	},
	
	
	//========================================================//
	//== 5.3 - Update the User Address                      ==//
	//========================================================//
	UpdateUserAddressValues: function (oController) {
		var bError   = false;
		var sErrMesg = "";
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/UserInfo/");
		
		//------------------------------------------------//
		//-- STEP 2 - Check for Errors                  --//
		//------------------------------------------------//
		
		//------------------------------------------------//
		//-- STEP 3 - Update Database                   --//
		//------------------------------------------------//
		try {
			if( bError===false ) {
				IomyRe.apiphp.AjaxRequest({
					url:       IomyRe.apiphp.APILocation("users"),
					data:      {
						"Mode":                       "EditOtherUserAddress",
						"AddressLine1":               oCurrentFormData.Line1,
						"AddressLine2":               oCurrentFormData.Line2,
						"AddressLine3":               oCurrentFormData.Line3,
						"AddressRegion":              oCurrentFormData.RegionId,
						"AddressSubRegion":           oCurrentFormData.SubRegion,
						"AddressPostcode":            oCurrentFormData.Postcode,
						"AddressTimezone":            oCurrentFormData.TimezoneId,
						"AddressLanguage":            oCurrentFormData.LanguageId,
						"Data":                       "{\"UserId\":"+oController.iUserId+"}"
					},
					onSuccess: function ( sType, aData ) {
						try {
							if( sType==="JSON" && aData.Error===false ) {
								try {
									//----------------------------------------//
									//-- Refresh the User Info              --//
									//----------------------------------------//
									oController.RefreshUserInfo( oController, {
										onSuccess: function() {
											//----------------------------------------//
											//-- Refresh the Model                  --//
											//----------------------------------------//
											oController.RefreshModel( oController, {
												Reset:     "UserAddress",
												onSuccess: function() {
													//----------------------------------------//
													//-- Load the Display Fragment          --//
													//----------------------------------------//
													oController.ToggleButtonsAndView( oController, "UserAddressShow" );
												},
												onFail: function() {
													
												}
											}); //-- END Refresh Model --//
										},
										onFail: function() {
											
										}
									}); //-- END Room Permissions --//
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'UpdateUserAddressValues' success event that was passed as a parameter in the 'UserForm' controller! "+e3.message);
								}
							} else {
								jQuery.sap.log.error("Error with the 'UpdateUserAddressValues' successful API result in the 'UserForm' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'UpdateUserAddressValues' success in the 'UserForm' controller! "+e2.message);
						}
					},
					onFail: function () {
						jQuery.sap.log.error("Error with the 'UpdateUserAddressValues' API Request when editing a LandPackage in the 'UserForm' controller!");
					}
				});
			} else {
				IomyRe.common.showError( sErrMesg, "Error" );
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with the 'UpdateUserAddressValues' in the 'UserForm' controller! "+e1.message);
		}
	},
	
	//========================================================//
	//== 5.4 - Update the Premise Permissions               ==//
	//========================================================//
	UpdatePremisePermissions: function( oController ) {
		try {
			//------------------------------------------------//
			//-- Declare Variables                          --//
			//------------------------------------------------//
			var bError           = false;
			var sErrMesg         = "";
			var oCurrentFormData = oController.getView().getModel().getProperty("/Form/");
			var iUserId          = oController.iUserId;
			var iPremiseId       = oCurrentFormData.PremisePerm.Id;
			var iPermLevel       = parseInt( oCurrentFormData.PremisePerm.PermLevel );
			var iPermRead        = 0;
			var iPermWrite       = 0;
			var iPermRoomAdmin   = 0;
			
			
			//------------------------------------------------//
			//-- Quick Validation Check                     --//
			//------------------------------------------------//
			if( !( iUserId>=1 ) ) {
				//-- Invalid UserId --//
				IomyRe.common.showError("Invalid User selected!", "Error" );
				
			} else if( !( iPremiseId>=1 ) ) {
				//-- Invalid RoomId --//
				IomyRe.common.showError("Invalid Premise selected! Please select a valid Premise.", "Error" );
				
			} else if( !( iPermLevel>=0 ) ) {
				//-- Invalid PermissionLevel --//
				IomyRe.common.showError("Invalid Permission Level selected! Please select a valid permission level.", "Error" );
				
			} else if( iPermLevel>=4 ) {
				//-- Invalid PermissionLevel --//
				IomyRe.common.showError("The desired permission level can not be changed", "Error" );
				
			} else {
				//------------------------------------------------//
				//-- Convert PermissionLevel                    --//
				//------------------------------------------------//
				switch( iPermLevel ) {
					//-- Premise Management --//
					case 3:
						iPermRead        = 1;
						iPermWrite       = 1;
						iPermRoomAdmin   = 1;
						break;
						
					//-- Read and Write --//
					case 2:
						iPermRead        = 1;
						iPermWrite       = 1;
						iPermRoomAdmin   = 0;
						break;
					//-- Read --//
					case 1:
						iPermRead        = 1;
						iPermWrite       = 0;
						iPermRoomAdmin   = 0;
						break;
					//-- No Access --//
					case 0:
						iPermRead        = 0;
						iPermWrite       = 0;
						iPermRoomAdmin   = 0;
						break;
					//-- Error --//
					default:
						bError = true;
						sErrMesg = "The permission level cannot be edited for that Premise!"
						break;
				}
				
				if( bError===false ) {
					IomyRe.apiphp.AjaxRequest({
						url:  IomyRe.apiphp.APILocation("permissions"),
						data: {
							"Mode":      "UpdatePremisePerms",
							"UserId":    iUserId,
							"PremiseId": iPremiseId,
							"Data":      "{\"Read\":"+iPermRead+",\"Write\":"+iPermWrite+",\"RoomAdmin\":"+iPermRoomAdmin+"}"
						},
						onSuccess: function ( sType, mData ) {
							
							try {
								var sErrMesg = "Error editing the Premise Permissions!\n\n";
							
								if( sType!=="JSON" ) {
									IomyRe.common.showError( sErrMesg+"API didn't return a JSON response.", "Error" );
									
								} else if( mData.Error===true ) {
									IomyRe.common.showError( sErrMesg+"Error with the 'UpdatePremisePerms' successful API result in the 'UserForm' controller!\n"+mData.ErrMesg, "Error" );
									
								} else {
									//----------------------------------------//
									//-- Refresh the Premise Permissions    --//
									//----------------------------------------//
									oController.RefreshUserPremisePerms( oController, {
										onSuccess: function() {
											//----------------------------------------//
											//-- Refresh the Model                  --//
											//----------------------------------------//
											oController.RefreshModel( oController, {
												Reset:     "PremPerm",
												onSuccess: function() {
													//-- Go to the Show view --//
													oController.ToggleButtonsAndView( oController, "PremPermShow" );
												},
												onFail: function() {
													
												}
											}); //-- END Refresh Model --//
										},
										onFail: function() {
										
										}
									}); //-- END Premise Permissions --//
								}
							} catch( e3 ) {
								IomyRe.common.showError( sErrMesg+"Critical Error with the 'UpdatePremisePerms' success in the 'UserForm' controller!", "Error" );
							}
						},
						onFail : function (response) {
							IomyRe.common.showError(response.responseText, "Error", function() {} );
						}
					});
				} else {
					
				}
				
			}
			
		} catch( e2 ) {
			jQuery.sap.log.error("Error with the 'UpdatePremisePerms' success in the 'UserForm' controller! "+e2.message);
		}
	},
	
	//========================================================//
	//== 5.5 - Update the Room Permissions                  ==//
	//========================================================//
	UpdateRoomPermissions: function( oController ) {
		try {
			//------------------------------------------------//
			//-- Declare Variables                          --//
			//------------------------------------------------//
			var oCurrentFormData = oController.getView().getModel().getProperty("/Form/");
			var iUserId          = oController.iUserId;
			var iRoomId          = oCurrentFormData.RoomPerm.Id;
			var iPermLevel       = parseInt( oCurrentFormData.RoomPerm.PermLevel );
			var iPermRead        = 0;
			var iPermDataRead    = 0;
			var iPermStateToggle = 0;
			var iPermWrite       = 0;
			
			
			//------------------------------------------------//
			//-- Quick Validation Check                     --//
			//------------------------------------------------//
			if( !( iUserId>=1 ) ) {
				//-- Invalid UserId --//
				IomyRe.common.showError("Invalid User selected!", "Error", function () {} );
				
			} else if( !( iRoomId>=1 ) ) {
				//-- Invalid RoomId --//
				IomyRe.common.showError("Invalid Room selected! Please select a valid room.", "Error", function () {} );
				
			} else if( !( iPermLevel>=0 ) ) {
				//-- Invalid PermissionLevel --//
				IomyRe.common.showError("Invalid Permission Level selected! Please select a valid permission level.", "Error", function () {} );
				
			} else {
				//------------------------------------------------//
				//-- Convert PermissionLevel                    --//
				//------------------------------------------------//
				switch( iPermLevel ) {
					//-- Full Access --//
					case 3:
						iPermRead        = 1;
						iPermDataRead    = 1;
						iPermStateToggle = 1;
						iPermWrite       = 1;
						break;
						
					//-- State Toggle --//
					case 2:
						iPermRead        = 1;
						iPermDataRead    = 1;
						iPermStateToggle = 1;
						iPermWrite       = 0;
						break;
					//-- Read --//
					case 1:
						iPermRead        = 1;
						iPermDataRead    = 1;
						iPermWrite       = 0;
						iPermStateToggle = 0;
						break;
					//-- No Access --//
					default:
						iPermRead        = 0;
						iPermDataRead    = 0;
						iPermStateToggle = 0;
						iPermWrite       = 0;
						break;
				}
				
				IomyRe.apiphp.AjaxRequest({
					url:  IomyRe.apiphp.APILocation("permissions"),
					data: {
						"Mode":   "UpdateRoomPerms",
						"UserId": iUserId,
						"RoomId": iRoomId,
						"Data":   "{\"Read\":"+iPermRead+",\"DataRead\":"+iPermDataRead+",\"Write\":"+iPermWrite+",\"StateToggle\":"+iPermStateToggle+"}"
					},			
					onSuccess: function ( sType, mData ) {
						
						try {
							var sErrMesg = "Error editing the Roomm Permissions!\n\n";
						
							if( sType!=="JSON" ) {
								IomyRe.common.showError( sErrMesg+"API didn't return a JSON response.", "Error"  );
								
							} else if( mData.Error===true ) {
								IomyRe.common.showError( sErrMesg+"Error with the 'UpdateRoomPerms' successful API result in the 'UserForm' controller!\n"+mData.ErrMesg, "Error" );
								
							} else {
								//----------------------------------------//
								//-- Refresh the Room Permissions       --//
								//----------------------------------------//
								oController.RefreshUserRoomPerms( oController, {
									onSuccess: function() {
										//----------------------------------------//
										//-- Refresh the Model                  --//
										//----------------------------------------//
										oController.RefreshModel( oController, {
											Reset:     "RoomPerm",
											onSuccess: function() {
												//----------------------------------------//
												//-- Go to the Show view                --//
												//----------------------------------------//
												oController.ToggleButtonsAndView( oController, "RoomPermShow" );
											},
											onFail: function() {
												
											}
										}); //-- END Refresh Model --//
									},
									onFail: function() {
										
									}
								}); //-- END Room Permissions --//
							}
						} catch( e3 ) {
							IomyRe.common.showError( sErrMesg+"Critical Error with the 'UpdateRoomPerms' success in the 'UserForm' controller!", "Error" );
						}
					},
					onFail : function (response) {
						IomyRe.common.showError(response.responseText, "Error", function () {} );
					}
				});
			}
		} catch( e2 ) {
			jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success in the 'UserForm' controller! "+e2.message);
		}
	}

});