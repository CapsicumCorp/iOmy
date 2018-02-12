/*
Title: Template UI5 View
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Creates the page list all devices and their information in a given
    room.
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

sap.ui.jsview("pages.Device", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.Device
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.Device";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.Device
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "Device List",
            header : iomy.widgets.getToolPageHeader( oController ),
            sideContent : iomy.widgets.getToolPageSideContent(oController),
            mainContents: [
                new sap.m.ScrollContainer ({
                    width: "100%",
                    height: "100%",
                    vertical : true,
                    content : [
                        iomy.widgets.DeviceToolbar(oController, "Device List"),
                        new sap.m.List (oView.createId("DeviceList"), {
                            mode: sap.m.ListMode.None,
                            items: [
                                
                            ],
                        }).addStyleClass("DevicePage")
                    ]
                })
            ]
        }).addStyleClass("MainBackground");
    }
});