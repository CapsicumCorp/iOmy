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
$.sap.require("sap.ui.table.Table");
sap.ui.controller("pages.staging.RulesList", {
	
	buttonsEnabled : true,
	
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
                oController.LoadList();
                
				//oController.RefreshModel(oController, {} );
				//-- Defines the Device Type --//
				iomy.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
//    ToggleControls : function (bEnabled) {
//        var oView = this.getView();
//        
//        oView.byId("ButtonAdd").setEnabled(bEnabled);
//        oView.byId("ButtonDiscard").setEnabled(bEnabled);
//    },
    
    LoadList : function () {
        var oController = this;
        
        iomy.rules.loadRules({
            hubID : 1,
            
            onSuccess : function () {
                oController.RefreshModel(oController, {});
            },
            
            onFail : function (sErrMessage) {
                jQuery.sap.log.error("Unable to Load the rules list:"+e1.message);
				iomy.common.showError(sErrMessage, "Error",
                    function () {}
                );
            }
        });
    },
    
    ToggleControls : function (bEnabled) {
        try {
            var oView           = this.getView();
            var oData           = JSON.parse(oView.getModel().getJSON());

            oData.ControlButtonsEnabled = bEnabled;

            oView.setModel(new sap.ui.model.json.JSONModel(oData));
        } catch (e) {
            $.sap.log.error("Failed to toggle form controls ("+e.name+"): " + e.message);
        }
    },
    
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView           = oController.getView();
        var aaRulesList     = JSON.parse(JSON.stringify(iomy.rules.RulesList));
        var aRules          = [];
        var oModel          = {};
        
        //--------------------------------------------------------------------//
		//-- Create the model-friendly data from the rules list             --//
		//--------------------------------------------------------------------//
        $.each(aaRulesList, function (sI, mRule) {
			try {
				if (mRule !== undefined && mRule !== null) {
                    var sEnabledText;
                    
                    if (mRule.Enabled == 1) {
                        sEnabledText = "Enabled";
                    } else {
                        sEnabledText = "Disabled";
                        
                        if (mRule.Enabled != 0) {
                            $.sap.log.error("The enabled flag was found to a number other than zero ("+mRule.Enabled+").");
                        }
                    }
                    
                    aRules.push({
                        "RuleId"        : mRule.Id,
                        "RuleName"      : mRule.Name,
                        "RuleState"     : sEnabledText,
                        "EventType"     : iomy.rules.getRuleTypeName(mRule.TypeId),
                        "EventTime"     : mRule.Time
                        //"EventTime"     : iomy.functions.getTimestampString(iomy.time.GetDateFromMilitaryTime( mRule.Ontime ), "", true, false)
                    });
                }
			} catch (e1) {
				jQuery.sap.log.error("Error with RefreshModel:"+e1.message); 
			}
        });
        
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oModel = new sap.ui.model.json.JSONModel({
            "RulesList"             : aRules,
            "ControlButtonsEnabled" : true
        });
        
        oView.setModel(oModel);
		
		//------------------------------------------------//
		//-- Trigger the onSuccess Event                --//
		//------------------------------------------------//
		if( oConfig.onSuccess ) {
			oConfig.onSuccess();
		}
		
	},
    
    /**
     * Generates an array of rules that are selected in the table.
     * 
     * @returns array           Rules selected in the table
     */
    GetSelectedRules : function () {
        var oController         = this;
        var oView               = oController.getView();
        var oTable              = oView.byId("RulesTable");
        var aSelectedIndices    = oTable.getSelectedIndices();
        var aSelectedRules      = [];
        var aRuleList           = oView.getModel().getProperty("/RulesList");
        
        for (var i = 0; i < aSelectedIndices.length; i++) {
            aSelectedRules.push(aRuleList[aSelectedIndices[i]].RuleId);
        }
        
        return aSelectedRules;
    },
    
    DiscardRule : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedRules      = oController.GetSelectedRules();
        
        var sWarningMessage = "Are you sure you wish to discard the selected rule(s)?";
        
        // Only run if there are things selected and that the user pressed OK.
        try {
            if (aSelectedRules.length > 0) {
                oController.ToggleControls(false);
                
                iomy.common.showConfirmQuestion(sWarningMessage, "Discard Rule",
                    function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.OK) {
                            try {
                                oController.deleteRulesFromList(aSelectedRules);
                            } catch (error) {
                                $.sap.log.error(error.name + ": " + error.message);
                                oController.ToggleControls(true);
                            }
                        } else {
                            oController.ToggleControls(true);
                        }
                    }
                );
            }
        } catch (e) {
            oController.ToggleControls(true);
            $.sap.log.error(e.name + ": " + e.message);
        }
    },
    
    /**
     * Function that deletes a list of selected rules.
     * 
     * NOTE: This is a quick and dirty function that will provide functionality
     * for a release. This will need to be reworked later on to make it neater.
     * 
     * @param {type} aList              Selected rules.
     * @param {type} iSuccesses         Rules successfully deleted (optional)
     * @param {type} iErrors            Rules that couldn't be removed (optional)
     * @param {type} aErrors            Error messages.
     */
    deleteRulesFromList : function (aList) {
        var oController     = this;
        var sSuccessMessage = "";
        
        try {
            if (aList.length === 1) {
                sSuccessMessage = "1 rule discarded.";
            } else {
                sSuccessMessage = aList.length + " rules discarded.";
            }
            
            //--------------------------------------------------------------//
            // Begin deleting the rule(s).
            //--------------------------------------------------------------//
            iomy.rules.discardRules({
                ruleIDs : aList,

                onSuccess : function () {
                    iomy.common.showMessage({
                        text : sSuccessMessage
                    });

                    oController.RefreshModel(oController, {});
                    oController.ToggleControls(true);
                },
                
                onWarning : function (sError) {
                    iomy.common.showWarning("An error occurred while deleting the rules:\n\n"+sError, "Error",
                        function () {
                            oController.RefreshModel(oController, {});
                            oController.ToggleControls(true);
                        }
                    );
                },

                onFail : function (sError) {
                    iomy.common.showError("An error occurred while deleting the rules:\n\n"+sError, "Error",
                        function () {
                            oController.RefreshModel(oController, {});
                            oController.ToggleControls(true);
                        }
                    );
                }
            });
        } catch (e) {
            $.sap.log.error("Error removing rules!");
            $.sap.log.error(e.name + ": " + e.message);

            oController.RefreshModel(oController, {});
            oController.ToggleControls(true);
        }
    },
    
    toggleRuleStates : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedRules      = oController.GetSelectedRules();
        
        if (aSelectedRules.length > 0) {
            try {
                oController.ToggleControls(false);

                //--------------------------------------------------------------//
                // Begin deleting the rule(s).
                //--------------------------------------------------------------//
                iomy.rules.toggleRules({
                    ruleIDs : aSelectedRules,

                    onSuccess : function () {
                        var sMessage = "";
                        
                        if (aSelectedRules.length === 1) {
                            sMessage = aSelectedRules.length + " rule toggled."
                        } else {
                            sMessage = aSelectedRules.length + " rules toggled."
                        }

                        iomy.common.showMessage({
                            text : sMessage
                        });

                        oController.RefreshModel(oController, {});
                        oController.ToggleControls(true);
                    },

                    onWarning : function (sError) {
                        iomy.common.showWarning("An error occurred while deleting the rule states:\n\n"+sError, "Error",
                            function () {
                                oController.RefreshModel(oController, {});
                                oController.ToggleControls(true);
                            }
                        );
                    },

                    onFail : function (sError) {
                        iomy.common.showError("An error occurred while toggling the rule states:\n\n"+sError, "Error",
                            function () {
                                oController.RefreshModel(oController, {});
                                oController.ToggleControls(true);
                            }
                        );
                    }
                });
            } catch (e) {
                $.sap.log.error("Error toggling rules states!");
                $.sap.log.error(e.name + ": " + e.message);

                oController.RefreshModel(oController, {});
                oController.ToggleControls(true);
            }
        }
    }

});
