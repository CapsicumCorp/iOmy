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

sap.ui.jsview("pages.staging.graphs.PieGraph", {
	
	/*************************************************************************************************** 
	** 1.0 - Controller Declaration
	**************************************************************************************************** 
	* Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf pages.staging.graphs.PieGraph
	****************************************************************************************************/ 
	getControllerName : function() {
		return "pages.staging.graphs.PieGraph";
	},

	/*************************************************************************************************** 
	** 2.0 - Content Creation
	**************************************************************************************************** 
	* Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf pages.staging.graphs.PieGraph
	****************************************************************************************************/ 
	createContent : function(oController) {
		var oView = this;

//        var oPage = new IOMy.widgets.IOMyPage({
//            view : oView,
//            controller : oController,
//            icon : "sap-icon://GoogleMaterial/home",
//            title : "6-Hour Pie Graph"
//        });
        
        var oPage = new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "6-Hour Pie Graph",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				IomyRe.widgets.DeviceToolbar(oController, "Tile View"),
				new sap.ui.core.HTML ({
                    content: "<div id=\"PieGraphPage_Main\" class=\"\" style=\"min-width: 400px; padding-right: 5.5rem\" ></div><div id=\"PieGraphPage_Main_Info\" class=\"PadAll10px\" ></div>"
                }).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
        
//        oPage.addContent(
//            //-- Main Panel --//
//            new sap.m.Panel ({
//                backgroundDesign: "Transparent",
//				height: "90%",
//                content: [
//                    new sap.ui.core.HTML ({
//						content: "<div id=\"PieGraphPage_Main\" class=\"\" style=\"min-width: 400px; padding-right: 5.5rem\" ></div><div id=\"PieGraphPage_Main_Info\" class=\"PadAll10px\" ></div>"
//					}).addStyleClass("")
//                ]
//            }).addStyleClass(" PadBottom10px minheight350px UserInputForm MarTop3px")
//        );

		//--------------------------------------------------------------------//
		// Respond to screen orientation change.
		//--------------------------------------------------------------------//
		sap.ui.Device.orientation.attachHandler(
			function () {
				if (oApp.getCurrentPage().getId() === oView.getId()) {
					var dateCurrentTime = new Date();
					$("#PieGraphPage_Main").html("");
					$("#PieGraphPage_Main_Info").html("");
					oView.oController.GetPieDataAndDrawGraph( oController.iIOId, (dateCurrentTime.getTime() / 1000) );
				}
			}
		);

		return oPage;
	}

});