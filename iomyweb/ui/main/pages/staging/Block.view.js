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

sap.ui.jsview("pages.staging.Block", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.staging.Block
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.staging.Block";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.staging.Block
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "Home",
            header : IomyRe.widgets.getToolPageHeader( oController ),
            sideContent : IomyRe.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                new sap.m.ScrollContainer ({
                    width: "100%",
                    height: "100%",
                    vertical : true,
                    content : [
                        new sap.ui.layout.VerticalLayout ({
                            width: "100%",
                            content: [
                                new sap.ui.layout.BlockLayout ({
                                    background: sap.ui.layout.BlockBackgroundType.Dashboard,
                                    content: [
                                        new sap.ui.layout.BlockLayoutRow ({
                                            content : [ 
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Devices",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pDevice" , {} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Premise",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pPremise" , {} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]
                                                }),

                                            ]
                                        }),
                                        new sap.ui.layout.BlockLayoutRow ({
                                            content : [ 
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Rooms",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pRoomList" , {bEditing: false} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Users",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pUserList" , {} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]

                                                })
                                            ]
                                        }),
                                        new sap.ui.layout.BlockLayoutRow ({
                                            content : [ 
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Rules",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pRulesList" , {} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                new sap.ui.layout.BlockLayoutCell ({
                                                    content : [
                                                        new sap.ui.layout.VerticalLayout ({
                                                            width: "100%",
                                                            content : [
                                                                new sap.m.Link ({
                                                                    text : "Advanced",
                                                                    emphasized : true,
                                                                    press : function () {
                                                                        IomyRe.common.NavigationChangePage( "pTelnet" , {} , false);
                                                                    }
                                                                }).addStyleClass("Pointer sapMTitle sapMTitleStyleH1 sapMLnk"),
                                                            ]
                                                        })
                                                    ]
                                                }),
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }).addStyleClass("")
                    ]
                })
            ]
        }).addStyleClass("MainBackground");
    }
});