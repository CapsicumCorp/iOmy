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

sap.ui.controller("mjs.devices.Garagedoor", {
	
	ListItem : [
		{ "label" : "Status" , "text" : "Closed" },
		{ "label" : "Last Accessed" , "text" : "3h 21m" },
		{ "label" : "Battery" , "text" : "33%" },
		{ "label" : "Tamper" , "text" : "Secure" },
	],
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.devices.Garagedoor
*/

	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow : function (evt) {
				//----------------------------------------------------//
				//-- Enable/Disable Navigational Forward Button		--//
				//----------------------------------------------------//
				
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.devices.Garagedoor
*/
	onBeforeRendering: function() {

	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.devices.Garagedoor
*/
	onAfterRendering: function() {
		//--------------------------------------------//
        //-- Initialise Variables                   --//
        //--------------------------------------------//
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView       = this.getView();


        oController.DrawUI(); 
	},
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.devices.Garagedoor
*/
	onExit: function() {

	},
	
	DrawUI: function(  ) {
        //--------------------------------------------//
        //-- Declare Variables                      --//
        //--------------------------------------------//
        var oController         = this;                 //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView               = this.getView();
  
		//--------------------------------------------------------//
		//-- Draw 1st Run Page 2                                --//
		//--------------------------------------------------------//
		var oList = oController.byId("list");

		if( oList ) {
			$.each( oController.ListItem, function( iIndex, aListItem ) {
				try {
					oList.addItem(
						//-- Coloumn 1 --//
						new sap.m.InputListItem ({
							label : aListItem.label+":",
							content : [
								//-- Column 2 --//
								new sap.m.Text ({
									text : aListItem.text,
									textAlign : "Right",
								})
							]
						}).addStyleClass("maxlabelwidth50Percent")                 
					);
				} catch(e2) {
					jQuery.sap.log.error("GD_Foreach: "+e2.message, "", "GD");
				}
			}); 
			//-- End of foreach loop ($.each) --//
			//-- Adding in a unqiue item "Control Button" --//
			try {
				oList.addItem(
					new sap.m.InputListItem ({
						label : "Control:",
						content : [
							//-- Column 2 for Current Temp Row --//
							new sap.m.Button({
								icon : "sap-icon://GoogleMaterial/lock_open",
								text : "Open"
							}).addStyleClass("")
						]
					}).addStyleClass("maxlabelwidth50Percent")                 
				);
			} catch(e2) {
				jQuery.sap.log.error("GD_ControlButton: "+e2.message, "", "GD");
			}
		} else {
			console.log("GD List Error - Unable to Find the List");
		}
	}

});