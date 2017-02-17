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

sap.ui.controller("mjs.staging.StagingHome", {
	
	Staginglinks : [
		{ "display" : "Device Overview", "link" : "pOverviewRe" },
		{ "display" : "Motion Sensor" , "link" : "pMotionTemp" },
		{ "display" : "Door Lock" , "link" : "pDoorLock" },		
		{ "display" : "Window Sensor" , "link" : "pWindowSensor" },
		{ "display" : "Thermostat" , "link" : "pTestThermostat" },
		{ "display" : "Bluetooth Scales" , "link" : "pScales" },
		{ "display" : "Quadcopter" , "link" : "pQuadcopter" },
		{ "display" : "Blood Pressure Monitor" , "link" : "pBPM" }
	],
	
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.staging.StagingHome
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
* @memberOf mjs.staging.StagingHome
*/
	onBeforeRendering: function() {
	
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.staging.StagingHome
*/
	onAfterRendering: function() {
		//--------------------------------------------//
        //-- Initialise Variables                   --//
        //--------------------------------------------//
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView       = this.getView();


        oController.SetupPage(); 
	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.staging.StagingHome
*/
	onExit: function() {

	},
	
    SetupPage: function(  ) {
        //--------------------------------------------//
        //-- Declare Variables                      --//
        //--------------------------------------------//
        var oController         = this;                 //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView               = this.getView();
        var bError              = false;
        var sErrMesg            = "";
  

		//--------------------------------------------------------//
				//-- Draw 1st Run Page 2 --//
		//--------------------------------------------------------//
        if( bError===false ) {

            //var oTileContainer = oController.byId("TileContainer");
            var oTable = oController.byId("table");

            //if( oTileContainer ) {
            if( oTable ) {
                $.each( oController.Staginglinks, function( iIndex, aStageLink ) {
                    try {
                        oTable.addItem(
							new sap.m.ColumnListItem({
								cells:[
									new sap.m.Link({
										text : aStageLink.display,
										emphasized : true,
										press : function () {
											IOMy.common.NavigationChangePage( aStageLink.link , {} , false);
										}
									})
								]
							})                    
                        );
                    } catch(e2) {
                        jQuery.sap.log.error("CriticalErrorAAA: "+e2.message, "", "AAA");
                    }
                }); //-- End of foreach loop ($.each) --//

            } else {
                console.log("Page Error");
            }
        }
		//--------------------------------------------------------//
				//-- Error Messages --//
		//--------------------------------------------------------//
        if( bError===true ) {
            IOMy.common.showError( sErrMesg, "Perform 1st Run ")
        }
    }
	
});