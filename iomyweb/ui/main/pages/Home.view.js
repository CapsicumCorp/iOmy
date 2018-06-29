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

sap.ui.jsview("pages.Home", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.Block
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.Home";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.Block
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "Home",
            header : iomy.widgets.getToolPageHeader( oController ),
            sideContent : iomy.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                new sap.m.ScrollContainer ({
                    width: "100%",
                    height: "100%",
                    vertical : true,
                    content : [
                       iomy.widgets.DeviceToolbar(oController, "Home"),
                        new sap.m.List (oView.createId("HomeList"), {
                            mode: sap.m.ListMode.None,
                            items: [
                                new sap.m.ObjectListItem (oView.createId("entryDevices"), {        
                                    title: "Devices",
                                    type: "Active",
                                    number: "{/count/devices}",
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pDevice" , {} , false);
                                    }
                                }),
                                
                                new sap.m.ObjectListItem (oView.createId("entryRoom"), {        
                                    title: "Rooms",
                                    type: "Active",
                                    number: "{/count/rooms}",
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pRoomList" , {} , false);
                                    }
                                }),
                                new sap.m.ObjectListItem (oView.createId("entryPremise"), {        
                                    title: "Premises",
                                    type: "Active",
                                    number: "{/count/premises}",
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pPremise" , {} , false);
                                    }
                                }),
                                new sap.m.ObjectListItem (oView.createId("entrySecurity"), {        
                                    title: "Security",
                                    type: "Active",
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pSecurity" , {} , false);
                                    }
                                }),
                                new sap.m.ObjectListItem (oView.createId("entryRules"), {        
                                    title: "Rules",
                                    type: "Active",
                                    //Cant find rule array in common
                                    //number: iomy.functions.getNumberOfRules(),
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pRulesList" , {} , false);
                                    }
                                }),
                                new sap.m.ObjectListItem (oView.createId("entryUsers"), {        
                                    title: "Users",
                                    type: "Active",
                                    //number: iomy.functions.getNumberOfUsers(),
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pUserList" , {} , false);
                                    }
                                }),
                                
                                new sap.m.ObjectListItem (oView.createId("entryAdvanced"), {        
                                    title: "Advanced",
                                    type: "Active",
                                    //number: iomy.functions.getNumberOfPremises(),
                                    press : function () {
                                        iomy.common.NavigationChangePage( "pAdvanced" , {} , false);
                                    }
                                })
                            ]
                        }).addStyleClass("DevicePage")
                    ]
                })
            ]
        }).addStyleClass("MainBackground");
    }
});