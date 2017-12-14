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

sap.ui.controller("pages.staging.room.RoomForm", {
	aFormFragments: 	{},
	bEditing: false,
	mPageData : {},
	mRoomData : {},
	
	
	
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
				
				oController.mPageData = oEvent.data;
                
                if (oController.mPageData.bEditing !== undefined && oController.mPageData.bEditing !== null) {
                    oController.bEditing = oController.mPageData.bEditing;
                } else {
                    oController.bEditing = false;
                }
                
                oController.loadRoomForm()
			}
			
		});
		
	},
    
    loadRoomForm : function () {
        var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
        
        try {
            if (oController.bEditing === true) {
                var sRoomCode = "_"+oController.mPageData.RoomId;
                var sPremiseCode = "_"+oController.mPageData.PremiseId;
                oController.mRoomData = IomyRe.common.RoomsList[sPremiseCode][sRoomCode];

            } else {
                oController.mRoomData = {
                    "RoomName"      : "",
                    "RoomDesc"      : "",
                    "PremiseId"     : "",
                    "RoomTypeId"    : ""
                };
            }
        } catch(e1) {
            jQuery.sap.log.error("Error with the onBeforeShow 'bEditing' :"+e1.message);
        }

        //-- Update the Model --//
        oController.RefreshModel( oController, {} );

        //-- Refresh Nav Buttons --//
        oController.ToggleButtonsAndView( oController, oController.bEditing );

        //-- Defines the Device Type --//
        IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
    },
    
    ToggleSubmitCancelButtons : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("ButtonSubmit").setEnabled(bEnabled);
        oView.byId("ButtonCancel").setEnabled(bEnabled);
        
        if (oView.byId("ButtonDelete") !== undefined) {
            oView.byId("ButtonDelete").setEnabled(bEnabled);
        }
    },
	
	RefreshModel : function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView            = oController.getView();
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oView.setModel( 
			new sap.ui.model.json.JSONModel({
				"Premises":           IomyRe.common.PremiseList,
				"RoomTypes":          IomyRe.common.RoomTypes,
				"CurrentRoom":          oController.mRoomData
			})
		);	
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
	},
	
	UpdateRoomInfoValues: function (oController) {
		var bError          = false;
        var aErrorMessages  = [];
		var sErrMesg        = "";
        
        oController.ToggleSubmitCancelButtons(false);
		
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/CurrentRoom/");
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
					url:       IomyRe.apiphp.APILocation("rooms"),
					data:      {
						"Mode":             "EditInfo",
						"Id":               oCurrentFormData.RoomId,
						"Name":             oCurrentFormData.RoomName,
						"Desc":             oCurrentFormData.RoomDesc,
						"Floor":            0,
						"RoomTypeId":       oCurrentFormData.RoomTypeId
					},
					onSuccess: $.proxy( function (sType, aData) {
						try {
							if( sType==="JSON" && aData.Error===false ) {
								try {
									//------------------------------------------------//
									//-- STEP 5 - Update Room List                  --//
									//------------------------------------------------//
									IomyRe.common.RetreiveRoomList({
										onSuccess: $.proxy( function() {
											//------------------------------------------------//
											//-- STEP 6 - Update the Controller Model       --//
											//------------------------------------------------//
											oController.RefreshModel( oController, {
												onSuccess: $.proxy( function() {
                                                    IomyRe.common.showMessage({
                                                        text : oCurrentFormData.RoomName + " successfully updated."
                                                    });
                                                    
                                                    oController.ToggleSubmitCancelButtons(true);
                                                    
													IomyRe.common.NavigationChangePage( "pRoomList" , {"bEditing" : oController.bEditing} , false);
												}, oController )
											});    //-- END RefreshControllerModel (STEP 6) --//
										}, oController )
									});    //-- END LandPackagesList (STEP 5) --//
									
								} catch( e3 ) {
									jQuery.sap.log.error(e3.message);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'RoomEditInfo' successful API result in the 'RoomForm' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'RoomEditInfo' success in the 'RoomForm' controller! "+e2.message);
						}
					}),
					onFail: function (response) {
						//if( aConfig.onFail ) {
						//	aConfig.onFail();
						//}
                        var sErrorMessage = "Error editing a room.\n\n"+response.responseText;
                        
						jQuery.sap.log.error(sErrorMessage);
                        
                        IomyRe.common.showError( sErrorMessage, "Error", function () {
                            oController.ToggleSubmitCancelButtons(true);
                        });
                        
					}
				});
			} else {
				IomyRe.common.showError("* " + aErrorMessages.join("\n* "), "", function () {
                    oController.ToggleSubmitCancelButtons(true);
                });
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with the 'RoomEditInfo' in the 'RoomForm' controller! "+e1.message);
		}
	},
	
	InsertRoomInfoValues: function (oController) {
		var bError   = false;
		var sErrMesg = "";
        var aErrorMessages = [];
		
        oController.ToggleSubmitCancelButtons(false);
		//------------------------------------------------//
		//-- STEP 1 - Extract Values from the Model     --//
		//------------------------------------------------//
		var oCurrentFormData = oController.getView().getModel().getProperty("/CurrentRoom/");
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
					url:       IomyRe.apiphp.APILocation("rooms"),
					data:      {
						"Mode":             "AddRoom",
						"PremiseId":        oCurrentFormData.PremiseId,
						"Name":             oCurrentFormData.RoomName,
						"Desc":             oCurrentFormData.RoomDesc,
						"Floor":            1,
						"RoomTypeId":       oCurrentFormData.RoomTypeId
					},
					//-- mData = Response from API, sType = What type of response expected --//
					onSuccess: function ( sType, mData ) {
						try {
							if( sType==="JSON" && mData.Error===false ) {
								try {
									if(typeof mData.Data.RoomId !== "undefined") {
										var sRoomId = mData.Data.RoomId;
										var iRoomId = parseInt(sRoomId);
										
										IomyRe.apiphp.AjaxRequest({
											url : IomyRe.apiphp.APILocation("permissions"),
											data : {
												"Mode" : "UpdateRoomPerms",
												"UserId" : IomyRe.common.UserInfo.UserId,
												"RoomId" : iRoomId,
												"Data" : "{\"Read\":"+1+",\"DataRead\":"+1+",\"Write\":"+1+",\"StateToggle\":"+1+"}"
											},
											onSuccess : function (responseType, mPermData) {
												//------------------------------------------------//
												//-- STEP 5 - Update Room List                  --//
												//------------------------------------------------//
												IomyRe.common.RetreiveRoomList({
													onSuccess: $.proxy( function() {
														//------------------------------------------------//
														//-- STEP 6 - Update the Controller Model       --//
														//------------------------------------------------//
														oController.RefreshModel( oController, {
															onSuccess: $.proxy( function() {
                                                                IomyRe.common.showMessage({
                                                                    text : oCurrentFormData.RoomName + " successfully created."
                                                                });

                                                                oController.ToggleSubmitCancelButtons(true);
                                                                
																IomyRe.common.NavigationChangePage( "pRoomList" , {} , false);
															}, oController )
														});    //-- END RefreshControllerModel (STEP 6) --//
													}, oController )
												});    //-- END LandPackagesList (STEP 5) --//
											}
										});									
									} else {
										jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller!");
									}
									
								} catch( e3 ) {
									jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success event that was passed as a parameter in the 'RoomForm' controller! "+e3.message);
								}
							} else {
								//-- Run the fail event
								//if( aConfig.onFail ) {
								//	aConfig.onFail();
								//}
								jQuery.sap.log.error("Error with the 'UpdateRoomPerms' successful API result in the 'RoomForm' controller!");
							}
						} catch( e2 ) {
							jQuery.sap.log.error("Error with the 'UpdateRoomPerms' success in the 'RoomForm' controller! "+e2.message);
						}
					},
					onFail: function (response) {
						var sErrorMessage = "Error creating the room:\n\n" + response.responseText;
                        
						jQuery.sap.log.error();
                        IomyRe.common.showError( sErrorMessage, "Error", function () {
                            oController.ToggleSubmitCancelButtons(true);
                        });
					}
				});
			} else {
                IomyRe.common.showError("* " + aErrorMessages.join("\n* "), "", function () {
                    oController.ToggleSubmitCancelButtons(true);
                });
			}
		} catch( e1 ) {
			jQuery.sap.log.error("Error with 'AddRoom' in the 'RoomForm' controller! "+e1.message);
		}
	},
    
	ToggleButtonsAndView: function ( oController, bEditing ) {
		var oView = this.getView();
		
		//console.log(sMode);
		try {	
			if(bEditing === false ) {
				oView.byId("RoomToolbarTitle").setText("Add Room");
				IomyRe.common.ShowFormFragment( oController, "room.AddRoom", "RoomBlock_Form", "FormContainer" );
			} else if(bEditing === true) {
				oView.byId("RoomToolbarTitle").setText("Edit " + oController.mRoomData.RoomName);
				IomyRe.common.ShowFormFragment( oController, "room.EditRoom", "RoomBlock_Form", "FormContainer" );
			} else {
				$.sap.log.error("ToggleButtonsAndView: Critcal Error. bEditing set incorrectly:"+bEditing);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	},
    
});