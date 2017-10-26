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
				
				oController.ToggleButtonsAndView( oController, oController.bEditing );
				
				//-- Update the Model --//
				//oController.RefreshModel( oController, {} );
				
				//-- Defines the Device Type --//
				IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
			}
			
		});
		
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
				"CurrentRoom":        oController.mRoomData
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

});