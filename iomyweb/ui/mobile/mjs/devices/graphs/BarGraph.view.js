/*
Title: Bar Graph Example
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2016

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

sap.ui.jsview("mjs.devices.graphs.BarGraph", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf mjs.devices.graphs.BarGraph
	****************************************************************************************************/ 
	getControllerName : function() {
		return "mjs.devices.graphs.BarGraph";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf mjs.devices.graphs.BarGraph
	****************************************************************************************************/ 
	createContent : function(oController) {
		var me = this;

        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "Weekly Bar Graph"
        });
        
        oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
				height: "90%",
                content: [
                    new sap.ui.core.HTML ({
						content: "<div id=\"GraphPage_Main\" class=\"\" style=\"min-width: 400px; padding-right: 5.5rem\" ></div><div id=\"GraphPage_Main_Info\" class=\"PadAll10px\" ></div>"
					}).addStyleClass("")
                ]
            }).addStyleClass("PadBottom10px minheight350px UserInputForm MarTop3px")
        );

		//--------------------------------------------------------------------//
		// Respond to screen orientation change.
		//--------------------------------------------------------------------//
		sap.ui.Device.orientation.attachHandler(
			function () {
				if (oApp.getCurrentPage().getId() === me.getId()) {
					var dateCurrentTime = new Date();
					$("#GraphPage_Main").html("");
					$("#GraphPage_Main_Info").html("");
					me.oController.GetBarDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000), "Week" );
				}
			}
		);

		return oPage;
	}

});