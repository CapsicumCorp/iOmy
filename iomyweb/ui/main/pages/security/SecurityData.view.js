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

sap.ui.jsview("pages.security.SecurityData", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.Advanced
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.security.SecurityData";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.Advanced
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "SecurityData",
            header : iomy.widgets.getToolPageHeader( oController ),
            sideContent : iomy.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                new sap.m.ScrollContainer({
                    width : "100%",
                    height : "100%",
                    vertical : true,
                    
                    content : [
                        new sap.m.ObjectHeader({
                            title: "{/title}",
                            number: "{/count/thumbnails}",
                            numberUnit: "{/misc/thumbnailText}",
                        }),
                        new sap.m.IconTabBar({
                            selectedKey : "{/misc/selectedTab}",
                            items : [
                                new sap.m.IconTabFilter({
                                    text: "Stream",
                                    icon : "sap-icon://video",
                                    content : [
                                        new sap.m.Carousel (oView.createId("streamTab"), {
                                            pages: [
                                                
                                            ]
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter({
                                    visible : "{/visible/IfViewingOnvifCamera}",
                                    text: "Thumbnails",
                                    icon : "sap-icon://camera",
                                    content : [
                                        new sap.m.Carousel (oView.createId("thumbnailTab"), {
                                            pages: [
                                                new sap.m.Image ({
                                                    densityAware : false,
                                                    width : "90%",
                                                    height : "90%",
                                                    src : "{/data/thumbnailUrl}",
                                                    alt : "Failed to load thumbnail",
                                                    
                                                    load : function () {
                                                        oController.UpdateThumbnailCount(1);
                                                    },
                                                    
                                                    error : function () {
                                                        //oController.UpdateThumbnailCount(0);
                                                    }
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                new sap.m.IconTabFilter( oView.createId("CameraSettingsTab"), {
                                    //visible : "{/visible/IfViewingOnvifCamera}",
                                    text: "Settings",
                                    icon : "sap-icon://settings",
                                    content : [
                                        
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        }).addStyleClass("MainBackground");
    }
});