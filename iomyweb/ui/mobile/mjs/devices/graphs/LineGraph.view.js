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

sap.ui.jsview("mjs.devices.graphs.LineGraph", {
	
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf mjs.devices.graphs.LineGraph
    ****************************************************************************************************/ 
    getControllerName : function() {
            return "mjs.devices.graphs.LineGraph";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf mjs.devices.graphs.LineGraph
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var me = this;

//		var oPage = new sap.m.Page(me.createId("page"),{
//			customHeader : IOMy.widgets.getIOMYPageHeaderNav( oController ),
//			footer : IOMy.widgets.getAppFooter(),
//			content : [
//                //-- Navigational Header --//
//				IOMy.widgets.getNavigationalSubHeader("Add Rule", "sap-icon://GoogleMaterial/home", me),
//            
//            ]
//		}).addStyleClass("height100Percent width100Percent MainBackground");

        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/home",
            title : "LineGraph Example"
        });

        oPage.addContent(
            //-- Main Panel --//
            new sap.m.Panel ({
                backgroundDesign: "Transparent",
                content: [
                    new sap.ui.core.HTML ({
                        content: "<div id=\"LineGraphPage_Main\" class=\"\" style=\"padding-right: 5.5rem\" ></div><div id=\"LineGraphPage_Main_Info\" class=\"PadAll10px\" ></div>"
                    }).addStyleClass("")
                ]
            }).addStyleClass("PadBottom10px UserInputForm MarTop3px minheight350px")
        );

        //--------------------------------------------------------------------//
        // Respond to screen orientation change.
        //--------------------------------------------------------------------//
        sap.ui.Device.orientation.attachHandler(
            function () {
                $("#LineGraphPage_Main").html("");
                $("#LineGraphPage_Main_Info").html("");
                me.oController.GetLineDataAndDrawGraph( 10, 1491055200 * 1000, "Week" );
            }
        );

        return oPage;
    }

});