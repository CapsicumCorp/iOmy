/*
Title: Line Graph Example
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

sap.ui.jsview("pages.staging.graphs.LineGraph", {
	
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.staging.graphs.LineGraph
    ****************************************************************************************************/ 
    getControllerName : function() {
            return "pages.staging.graphs.LineGraph";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.staging.graphs.LineGraph
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;

//        var oPage = new IOMy.widgets.IOMyPage({
//            view : oView,
//            controller : oController,
//            icon : "sap-icon://GoogleMaterial/home",
//            title : "IO Line Graph"
//        });
//
//        oPage.addContent(
//            //-- Main Panel --//
//            new sap.m.Panel ({
//                backgroundDesign: "Transparent",
//                content: [
//                    new sap.ui.core.HTML ({
//                        content: "<div id=\"LineGraphPage_Main\" class=\"\" style=\"\"></div><div id=\"LineGraphPage_Main_Info\" class=\"PadAll5px PadLeft0px\" ></div>"
//                    }).addStyleClass("")
//                ]
//            }).addStyleClass("PadBottom10px MarTop3px minheight350px graphMargin")
//        );
        
        var oPage = new sap.tnt.ToolPage(oView.createId("toolPage"), {
			title: "Line Graph",
			header : IomyRe.widgets.getToolPageHeader( oController ),
			sideContent : IomyRe.widgets.getToolPageSideContent(oController),
			mainContents: [ 
				IomyRe.widgets.DeviceToolbar(oController, "Tile View"),
				new sap.ui.core.HTML ({
                    content: "<div id=\"LineGraphPage_Main\" class=\"\" style=\"\"></div><div id=\"LineGraphPage_Main_Info\" class=\"PadAll5px PadLeft0px\" ></div>"
                }).addStyleClass("")
			]
		}).addStyleClass("MainBackground");
        
        //--------------------------------------------------------------------//
        // Respond to screen orientation change.
        //--------------------------------------------------------------------//
        sap.ui.Device.orientation.attachHandler(
            function () {
				if (oApp.getCurrentPage().getId() === oView.getId()) {
					var dateCurrentTime = new Date();
					$("#LineGraphPage_Main").html("");
					$("#LineGraphPage_Main_Info").html("");
					oController.GetLineDataAndDrawGraph( Math.floor(dateCurrentTime.getTime() / 1000), oController.sTimePeriod );
				}
            }
        );

        return oPage;
    }

});