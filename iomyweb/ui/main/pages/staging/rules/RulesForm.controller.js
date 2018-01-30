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
    iRuleId : null,
	
	bEditing            : false,
    bControlsEnabled    : true,
    bDevicesAvailable   : true,
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                if (IomyRe.validation.isValueGiven(evt.data.RuleId)) {
                    oController.iRuleId     = evt.data.RuleId;
                    oController.bEditing    = true;
                } else {
                    oController.iRuleId     = null;
                    oController.bEditing    = false;
                }
                
                oController.RefreshModel();
			}
		});
	},
    
    ToggleControls : function (bEnabled) {
        try {
            var oController     = this;
            var oView           = this.getView();
            var oData           = JSON.parse(oView.getModel().getJSON());

            oController.bControlsEnabled = bEnabled;

            //-- Boolean evaluation. --//
            oData.FormControlsEnabled   = oController.bControlsEnabled;
            oData.UpdateEnabled         = oController.bControlsEnabled && oController.bDevicesAvailable;
            oData.DeviceSBoxEnabled     = oController.bControlsEnabled && oController.bDevicesAvailable && !oController.bEditing;

            oView.setModel(new sap.ui.model.json.JSONModel(oData));
            
        } catch (e) {
            $.sap.log.error("Failed to toggle form controls ("+e.name+"): " + e.message);
        }
    },
    
    RefreshModel : function (mSettings) {
        var oController         = this;
        var oView               = this.getView();
        var oModel              = {};
        var aSupportedDevices   = JSON.parse(JSON.stringify(IomyRe.rules.loadSupportedDevices()));
        
        var oData               = {
            "SupportedDevices"      : aSupportedDevices,
            "FormControlsEnabled"   : true
        };
        
        //--------------------------------------------------------------------//
        // Check if the update button should be enabled. 
        //--------------------------------------------------------------------//
        if (aSupportedDevices.length > 0) {
            oController.bDevicesAvailable = true;
            oData.UpdateEnabled = true;
        } else {
            oController.bDevicesAvailable = false;
            oData.UpdateEnabled = false;
            oData.DeviceSBoxEnabled = false;
            
            aSupportedDevices.push({
                "Id"            : -1,
                "DisplayName"   : "No supported devices"
            });
        }
        
        //--------------------------------------------------------------------//
        // Populate the model either with default data if we're adding a rule,
        // or data from a selected if we're editing one.
        //--------------------------------------------------------------------//
        if (oController.iRuleId === null) {
            oData.ToolbarTitle = "New Rule";
            oData.DeviceSBoxEnabled = true;
            
            oData.Form = {
                "Name"      : "",
                "Time"      : "",
                "TypeId"    : 1,
                "ThingId"   : null,
                "Enabled"   : true
            };
            
            if (aSupportedDevices.length > 0) {
                oData.Form.ThingId = aSupportedDevices[0].Id;
            }
        } else {
            var mRule = JSON.parse(JSON.stringify(IomyRe.rules.RulesList["_"+oController.iRuleId]));
            var iEnabled;
            
            if (mRule.Enabled === 1) {
                iEnabled = true;
            } else {
                iEnabled = false;
            }
            
            oData.ToolbarTitle = "Edit Rule";
            oData.DeviceSBoxEnabled = false;
            
            oData.Form = {
                "Name"      : mRule.Name,
                "Time"      : mRule.Time,
                "TypeId"    : mRule.TypeId,
                "ThingId"   : JSON.parse(mRule.Parameter).ThingId,
                "Enabled"   : iEnabled
            };
        }
        
        oModel = new sap.ui.model.json.JSONModel(oData);
        
        oView.setModel(oModel);

        //-- Refresh Controls --//
        oController.ToggleControls(true);
    },
    
    GoToRulesList : function () {
        IomyRe.common.NavigationChangePage( "pRulesList" , {}, false);
    },
    
    submitRuleInformation : function () {
        var oController     = this;
        var oView           = this.getView();
        var oData           = JSON.parse(oView.getModel().getJSON());
        
        var sRuleName;
        var sTime;
        var bEnabled;
        var iRuleTypeId;
        var iThingId;
        
        try {
            sRuleName   = oData.Form.Name;
            sTime       = oData.Form.Time;
            iRuleTypeId = oData.Form.TypeId;
            iThingId    = oData.Form.ThingId;
            bEnabled    = oData.Form.Enabled;
        } catch (e) {
            $.sap.log.error("Failed to fetch the form data ("+e.name+"): " + e.message);
            oController.ToggleControls(true);
            return;
        }
        
        //-- Disable all of the controls on the page. Re-enable them afterwards. --//
        oController.ToggleControls(false);
        
        if (oController.iRuleId !== null) {
            //----------------------------------------------------------------//
            // If a rule ID is found, call the edit rule function.
            //----------------------------------------------------------------//
            try {
                IomyRe.rules.editRule({
                    ruleID      : oController.iRuleId,
                    name        : sRuleName,
                    ruleTypeID  : iRuleTypeId,
                    time        : sTime,
                    enabled     : bEnabled,
                    
                    onSuccess : function () {
                        IomyRe.common.showMessage({
                            text : "'"+ sRuleName + "' successfully updated."
                        });
                        
                        oController.GoToRulesList();
                    },
                    
                    onWarning : function (sErrorMessage) {
                        // This will likely execute if the rules could not be reloaded
                        // from the database.
                        IomyRe.common.showWarning(sErrorMessage, "Warning",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );
                    },
                    
                    onFail : function (sErrorMessage) {
                        IomyRe.common.showError(sErrorMessage, "Error",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );
                    }
                });
                
            } catch (e) {
                $.sap.log.error("Error editing a rule ("+e.name+"): " + e.message);
                IomyRe.common.showError(e.message, "Error",
                    function () {
                        oController.ToggleControls(true);
                    }
                );
            }
            
        } else {
            //----------------------------------------------------------------//
            // Otherwise, we are adding a rule.
            //----------------------------------------------------------------//
            try {
                IomyRe.rules.addRule({
                    thingID     : iThingId,
                    name        : sRuleName,
                    ruleTypeID  : iRuleTypeId,
                    time        : sTime,
                    enabled     : bEnabled,
                    
                    onSuccess : function () {
                        IomyRe.common.showMessage({
                            text : "'"+ sRuleName + "' successfully created."
                        });
                        
                        oController.GoToRulesList();
                    },
                    
                    onWarning : function (sErrorMessage) {
                        // This will likely execute if the rules could not be reloaded
                        // from the database.
                        IomyRe.common.showWarning(sErrorMessage, "Warning",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );
                    },
                    
                    onFail : function (sErrorMessage) {
                        IomyRe.common.showError(sErrorMessage, "Error",
                            function () {
                                oController.ToggleControls(true);
                            }
                        );
                    }
                });
                
            } catch (e) {
                $.sap.log.error("Error adding a rule ("+e.name+"): " + e.message);
                IomyRe.common.showError(e.message, "Error",
                    function () {
                        oController.ToggleControls(true);
                    }
                );
            }
        }
    }
    
});