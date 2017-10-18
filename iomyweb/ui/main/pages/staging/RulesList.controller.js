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
        var aaRulesList     = IomyRe.rules.RulesList;
        var aRules          = [];
        var mRule;
        var sSerialCode;
        
        //--------------------------------------------------------------------//
		//-- Create the model-friendly data from the rules list             --//
		//--------------------------------------------------------------------//
        $.each(IomyRe.common.ThingList, function (sI, mThing) {
            
            if (mThing.TypeId == IomyRe.devices.zigbeesmartplug.ThingTypeId) {
                sSerialCode = IomyRe.common.LinkList["_"+mThing.LinkId].LinkSerialCode;
                mRule = aaRulesList[sSerialCode];
                
                if (mRule !== undefined && mRule !== null) {
                    aRules.push({
                        "DeviceName": mThing.ThingName,
                        "DeviceType": mThing.TypeName,
                        "EventType" : "On",
                        "EventTime" : IomyRe.functions.getTimestampString(IomyRe.time.GetDateFromMilitaryTime( mRule.Ontime ), "", true, false)
                    });

                    aRules.push({
                        "DeviceName": mThing.ThingName,
                        "DeviceType": mThing.TypeName,
                        "EventType" : "Off",
                        "EventTime" : IomyRe.functions.getTimestampString(IomyRe.time.GetDateFromMilitaryTime( mRule.Offtime ), "", true, false)
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
		
	}

});