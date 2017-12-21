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
                oController.LoadList();
                
				//oController.RefreshModel(oController, {} );
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
	},
    
    ToggleControls : function (bEnabled) {
        var oView = this.getView();
        
        oView.byId("ButtonAdd").setEnabled(bEnabled);
        oView.byId("ButtonDiscard").setEnabled(bEnabled);
    },
    
    LoadList : function () {
        var oController = this;
        var oView       = oController.getView();
        
        IomyRe.rules.loadRules({
            hubID : 1,
            
            onSuccess : function () {
                oController.RefreshModel(oController, {});
            },
            
            onFail : function (sErrMessage) {
                
            }
        });
    },
    
	RefreshModel: function( oController, oConfig ) {
		//------------------------------------------------//
		//-- Declare Variables                          --//
		//------------------------------------------------//
		var oView           = oController.getView();
        var aaRulesList     = JSON.parse(JSON.stringify(IomyRe.rules.RulesList));
        var aaThingList     = JSON.parse(JSON.stringify(IomyRe.common.ThingList));
        var aRules          = [];
        var mRule;
        var sSerialCode;
        
        //--------------------------------------------------------------------//
		//-- Create the model-friendly data from the rules list             --//
		//--------------------------------------------------------------------//
        $.each(aaThingList, function (sI, mThing) {
            
            if (mThing.TypeId == IomyRe.devices.zigbeesmartplug.ThingTypeId) {
                sSerialCode = IomyRe.common.LinkList["_"+mThing.LinkId].LinkSerialCode;
                mRule = aaRulesList[sSerialCode];
                
                if (mRule !== undefined && mRule !== null) {
                    aRules.push({
                        "DeviceId"      : mThing.Id,
                        "DeviceName"    : mThing.DisplayName,
                        "DeviceType"    : mThing.TypeName,
                        "DeviceSerial"  : sSerialCode,
                        "EventType"     : "On",
                        "EventTime"     : IomyRe.functions.getTimestampString(IomyRe.time.GetDateFromMilitaryTime( mRule.Ontime ), "", true, false)
                    });

                    aRules.push({
                        "DeviceId"      : mThing.Id,
                        "DeviceName"    : mThing.DisplayName,
                        "DeviceType"    : mThing.TypeName,
                        "DeviceSerial"  : sSerialCode,
                        "EventType"     : "Off",
                        "EventTime"     : IomyRe.functions.getTimestampString(IomyRe.time.GetDateFromMilitaryTime( mRule.Offtime ), "", true, false)
                    });
                }
            }
            
        });
        
		//------------------------------------------------//
		//-- Build and Bind Model to the View           --//
		//------------------------------------------------//
		oView.setModel( 
			new sap.ui.model.json.JSONModel({
				"RulesList":   aRules
			})
		);
		
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
        var aSelectedRows       = [];
        var aRuleList           = oView.getModel().getProperty("/RulesList");
        
        for (var i = 0; i < aSelectedIndices.length; i++) {
            aSelectedRows.push(aRuleList[aSelectedIndices[i]]);
        }
        
        return aSelectedRows;
    },
    
    DiscardRule : function () {
        var oController         = this;
        var oView               = oController.getView();
        var aSelectedRules      = oController.GetSelectedRules();
        
        oController.ToggleControls(false);
        
        // Only run if there are things selected and that the user pressed OK.
        if (aSelectedRules.length > 0) {
            IomyRe.common.showConfirmQuestion("Are you sure you wish to discard the selected rule(s)?", "",
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
    },
    
    /**
     * Recursive function that deletes a list of selected rules.
     * 
     * NOTE: This is a quick and dirty function that will provide functionality
     * for a release. This will need to be reworked later on to make it neater.
     * 
     * @param {type} aList              Selected rules.
     * @param {type} iSuccesses         Rules successfully deleted (optional)
     * @param {type} iErrors            Rules that couldn't be removed (optional)
     * @param {type} aErrors            Error messages.
     */
    deleteRulesFromList : function (aList, iSuccesses, iErrors, aErrors) {
        var oController     = this;
        var mRule           = aList.shift();
        var mRuleListEntry  = IomyRe.rules.RulesList[mRule.DeviceSerial];
        var iHubId          = IomyRe.functions.getHubConnectedToThing(mRule.DeviceId).HubId;
        
        //--------------------------------------------------------------//
        // Set the success and error counts to zero.
        //--------------------------------------------------------------//
        if (iSuccesses === undefined || iSuccesses === null) {
            iSuccesses = 0;
        }
        
        if (iErrors === undefined || iErrors === null) {
            iErrors = 0;
        }
        
        if (aErrors === undefined || aErrors === null) {
            aErrors = [];
        }
        
        //--------------------------------------------------------------//
        // Define the function that runs when all of the rules have been
        // removed.
        //--------------------------------------------------------------//
        var fnComplete = function () {
            if (iSuccesses > 0 && iErrors === 0) {
                IomyRe.common.showMessage({
                    text : "Rules successfully removed."
                });

                oController.RefreshModel(oController, {});
                oController.ToggleControls(true);
            } else if (iSuccesses > 0 && iErrors > 0) {
                IomyRe.common.showWarning("Some rules could not be removed:\n\n"+aErrors.join("\n\n"), "Warning",
                    function () {
                        oController.RefreshModel(oController, {});
                        oController.ToggleControls(true);
                    }
                );
            } else if (iSuccesses === 0 && iErrors > 0) {
                IomyRe.common.showError("Failed to delete the rules:\n\n"+aErrors.join("\n\n"), "Error",
                    function () {
                        oController.ToggleControls(true);
                    }
                );
            }
        };
        
        try {
            //--------------------------------------------------------------//
            // Find out whether to simply remove a time rule or the entire
            // entry in the rule list.
            //--------------------------------------------------------------//
            if (mRuleListEntry.Ontime !== null && mRuleListEntry.Offtime !== null) {
                var mData = {
                    hubID : iHubId,
                    rule : {Serial : mRule.DeviceSerial}
                };

                if (mRule.EventType === "On") {
                    mData.rule.Ontime = "";
                    mData.rule.Offtime = mRuleListEntry.Offtime;
                } else if (mRule.EventType === "Off") {
                    mData.rule.Ontime = mRuleListEntry.Ontime;
                    mData.rule.Offtime = "";
                }

                mData.onSuccess = function () {
                    if (aList.length === 0) {
                        iSuccesses++;
                        fnComplete();
                    } else {
                        oController.deleteRulesFromList(aList, ++iSuccesses, iErrors, aErrors);
                    }
                };

                mData.onFail = function (sError) {
                    aErrors.push(sError);

                    if (aList.length === 0) {
                        iErrors++;
                        fnComplete();
                    } else {
                        oController.deleteRulesFromList(aList, iSuccesses, ++iErrors, aErrors);
                    }
                };

                //--------------------------------------------------------------//
                // Begin deleting the rule(s).
                //--------------------------------------------------------------//
                IomyRe.rules.applyRule(mData);

            } else {
                //--------------------------------------------------------------//
                // Begin deleting the rule(s).
                //--------------------------------------------------------------//
                IomyRe.rules.discardRule({
                    hubID : iHubId,
                    Serial : mRule.DeviceSerial,

                    onSuccess : function () {
                        if (aList.length === 0) {
                            iSuccesses++;
                            fnComplete();
                        } else {
                            oController.deleteRulesFromList(aList, ++iSuccesses, iErrors, aErrors);
                        }
                    },

                    onFail : function (sError) {
                        aErrors.push(sError);

                        if (aList.length === 0) {
                            iErrors++;
                            fnComplete();
                        } else {
                            oController.deleteRulesFromList(aList, iSuccesses, ++iErrors, aErrors);
                        }
                    }
                });
            }
        } catch (e) {
            $.sap.log.error("Error removing rule!");
            $.sap.log.error(e.name + ": " + e.message);
        }
    }

});