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

sap.ui.controller("pages.staging.rules.RulesForm", {
	aFormFragments: 	{},
	bEditing: false,
    iThingId: null,
	
	
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
				
				oController.mPageData = oEvent.data;
                
                if (oController.mPageData.bEditing !== undefined && oController.mPageData.bEditing !== null) {
                    oController.bEditing = oController.mPageData.bEditing;
                    
                    if (oController.bEditing) {
                        //-- Store the Current Id --//
                        if (oController.mPageData.ThingId !== undefined && oController.mPageData.ThingId !== null) {
                            oController.iThingId = oController.mPageData.ThingId;
                            
                        } else {
                            $.sap.log.error("bEditing was set to true but the ThingId parameter was not given. Add Rule form fragment will be loaded instead.");
                            oController.bEditing = false;
                            oController.iThingId = null;
                        }
                        
                    }
                } else {
                    oController.bEditing = false;
                    oController.iThingId = null;
                }
                
				
				//-- Update the Model --//
				oController.RefreshModel( oController, {} );
				
				oController.ToggleButtonsAndView( oController, oController.bEditing );
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    ToggleControls : function (bEnabled) {
		var oView       = this.getView();
		
		oView.byId("ButtonSubmit").setEnabled(bEnabled);
		oView.byId("ButtonCancel").setEnabled(bEnabled);
	},
    
    RefreshModel : function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView       = oController.getView();
        var mRule;
        
        if (oController.bEditing) {
            var mThing      = IomyRe.common.ThingList["_"+oController.iThingId];
            var sSerialCode = IomyRe.common.LinkList["_"+mThing.LinkId].LinkSerialCode;

            mRule = IomyRe.rules.RulesList[sSerialCode];
            mRule.Ontime = IomyRe.time.GetDateFromMilitaryTime(mRule.Ontime);
            mRule.Offtime = IomyRe.time.GetDateFromMilitaryTime(mRule.Offtime);
            
        } else {
            mRule = {
                "Type"          : "DeviceTimeRule",
                "Serial"        : sSerialCode,
                "Ontime"        : null,
                "Offtime"       : null
            };
        }
		
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oView.setModel( 
			new sap.ui.model.json.JSONModel({
				"Rule": mRule,
                "Devices": IomyRe.rules.loadSupportedDevices()
			})
		);	
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
	},

	
	ToggleButtonsAndView: function ( oController, bEditing ) {
		var oView = this.getView();

		try {	
			if(bEditing === false ) {
				oView.byId("RuleToolbarTitle").setText("Add Rule");
				IomyRe.common.ShowFormFragment( oController, "rules.AddRule", "RuleBlock_Form", "FormContainer" );
			} else if(bEditing === true) {
				oView.byId("RuleToolbarTitle").setText("Edit Rule");
				IomyRe.common.ShowFormFragment( oController, "rules.EditRule", "RuleBlock_Form", "FormContainer" );
			} else {
				$.sap.log.error("ToggleButtonsAndView: Critcal Error. bEditing set incorrectly:"+bEditing);
			}
		} catch(e1) {
			$.sap.log.error("ToggleButtonsAndView: Critcal Error:"+e1.message);
			return false;
		}
	},
    
    cancelChanges : function () {
		IomyRe.common.NavigationTriggerBackForward();
	},
    
    saveRule : function () {
        var oController         = this;
        var oView               = this.getView();
		var bError              = false;
		var aErrorMessages      = [];
        var oCurrentFormData    = oView.getModel().getProperty( "/Rule/" );
        var mThing;
        
        if (oController.iThingId === null) {
            mThing = IomyRe.rules.getDeviceUsingSerial(oCurrentFormData.Serial);
            
        } else {
            mThing = IomyRe.common.ThingList["_"+oController.iThingId];
        }
		
		oController.ToggleControls(false);
        
		if (oCurrentFormData.Ontime === null) {
			bError = true;
			aErrorMessages.push("Time the device turns on must be given!");
		}
		
		if (oCurrentFormData.Offtime === null) {
			bError = true;
			aErrorMessages.push("Time the device turns off must be given!");
		}
		
		if (!bError) {
			var mRule = {
				"Type" : "DeviceTimeRule",
				"Serial" : oCurrentFormData.Serial,
				"Ontime" : IomyRe.time.GetMilitaryTimeFromDate(oCurrentFormData.Ontime),
				"Offtime" : IomyRe.time.GetMilitaryTimeFromDate(oCurrentFormData.Offtime),
			};

			IomyRe.rules.applyRule({
				rule : mRule,
				hubID : IomyRe.functions.getHubConnectedToThing(mThing.Id).HubId,

				onSuccess : function () {
					IomyRe.common.showMessage({
						text : "Rule for "+mThing.DisplayName+" was successfully applied."
					});
					
					oController.ToggleControls(true);
					IomyRe.common.NavigationChangePage( "pRulesList", {}, true);
				},

				onFail : function (sError) {
					IomyRe.common.showError("Rule for "+mThing.DisplayName+" could not be applied.\n\n"+sError, "Error",
						function () {
							oController.ToggleControls(true);
						}
					);
				}
			});
		} else {
			IomyRe.common.showMessage({
				text : aErrorMessages.join('\n')
			});
			
			oController.ToggleControls(true);
		}
        
    },
    
    deleteRule : function () {
        var oController          = this;
        var mThing      = IomyRe.common.ThingList["_"+oController.iThingId];
        var sSerialCode = IomyRe.common.getLink(mThing.LinkId).LinkSerialCode;
		
		oController.ToggleControls(false);
        
        IomyRe.common.showConfirmQuestion("Are you sure you wish to discard this rule?", "",
            function () {
				try {
					IomyRe.rules.discardRule({
						hubID : 1,
						Serial : sSerialCode,

						onSuccess : function () {
							IomyRe.common.showMessage({
								text : "Rule for "+mThing.DisplayName+" was successfully removed.",
								view : oController.getView()
							});
							
							oController.ToggleControls(true);
							IomyRe.common.NavigationChangePage( "pRuleDeviceList", {}, true);
						},

						onFail : function (sError) {
							IomyRe.common.showError("Rule for "+mThing.DisplayName+" could not be removed.\n\n"+sError, "Error",
								function () {
									oController.ToggleControls(true);
								}
							);
						}
					});
				} catch (error) {
					IomyRe.common.showError("Rule for "+mThing.DisplayName+" could not be removed.\n\n"+error.message, "Error",
						function () {
							oController.ToggleControls(true);
						}
					);
				}
            }
        );
    }

});