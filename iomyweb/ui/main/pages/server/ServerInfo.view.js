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

sap.ui.jsview("pages.server.ServerInfo", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.server.ServerInfo
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.server.ServerInfo";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.server.ServerInfo
    ****************************************************************************************************/ 
    createContent : function(oController) {
        var oView = this;
        
        return new sap.tnt.ToolPage(oView.createId("toolPage"), {
            title: "Server Information",
            header : iomy.widgets.getToolPageHeader(oController),
            sideContent : iomy.widgets.getToolPageSideContent(oController),
            mainContents: [ 
                new sap.uxap.ObjectPageLayout (oView.createId("ObjectPageLayout"), {
                    isObjectIconAlwaysVisible: true,
                    enableLazyLoading: true,
                    showTitleinHeaderContent: true,
                    sections : [
                        new sap.uxap.ObjectPageSection(oView.createId("Server"), {
                            showTitle: false,
                            subSections : [
                                new sap.uxap.ObjectPageSubSection(oView.createId("ServerBlock"), {
                                    blocks : [
                                        new sap.ui.layout.form.Form( oView.createId("ServerBlock_Form"),{
                                            editable: true,
                                            layout : new sap.ui.layout.form.ResponsiveGridLayout ({
                                                labelSpanXL: 3,
                                                labelSpanL: 3,
                                                labelSpanM: 3,
                                                labelSpanS: 12,
                                                adjustLabelSpan: false,
                                                emptySpanXL: 3,
                                                emptySpanL: 2,
                                                emptySpanM: 0,
                                                emptySpanS: 0,
                                                columnsXL: 2,
                                                columnsL: 2,
                                                columnsM: 2,
                                                columnsS: 2,
                                                singleContainerFullSize: false
                                            }),
                                            toolbar : new sap.m.Toolbar({
                                                content : [
                                                    new sap.m.Title (oView.createId("ServerToolbarTitle"),{
                                                        text:"iOmy Server Information"
                                                    })
                                                ]
                                            }).addStyleClass("MarBottom1d0Rem"),
                                            formContainers : [
                                                new sap.ui.layout.form.FormContainer({
                                                    toolbar : new sap.m.Toolbar({
                                                    content : [
                                                        new sap.m.Title (oView.createId("VersionInfoToolbar"),{
                                                            text:"Version Information"
                                                        })
                                                    ]
                                                }).addStyleClass("MarBottom1d0Rem"),
                                                    formElements : [
                                                        new sap.ui.layout.form.FormElement({
                                                            label : "OpenUI5 Distribution",
                                                            fields: [
                                                                new sap.m.Text ({
                                                                    text: "{/ui5Version}"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : "Interface Iteration",
                                                            fields: [
                                                                new sap.m.Text ({
                                                                    text: "{/interfaceVersion}"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : "Database Iteration",
                                                            fields: [
                                                                new sap.m.Text ({
                                                                    text: "{/dbVersion}"
                                                                })
                                                            ]
                                                        })
                                                    ]
                                                }),
                                                new sap.ui.layout.form.FormContainer({
                                                    toolbar : new sap.m.Toolbar({
                                                        content : [
                                                            new sap.m.Title (oView.createId("DatabaseTitle"),{
                                                                text:"Database Index"
                                                            })
                                                        ]
                                                    }).addStyleClass("MarBottom1d0Rem"),
                                                    formElements : [
                                                        new sap.ui.layout.form.FormElement({
                                                            fields: [
                                                                new sap.m.Text({
                                                                    text: "If the database indices are enabled the load time of the application with be faster but uses significantly more storage.",
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            fields: [
                                                                new sap.m.CheckBox({
                                                                    text: "{/editIndex/tickBoxText}",
                                                                    selected: "{/indexingOn}",
                                                                    editable: false,
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            fields: [
                                                                new sap.m.Button({
                                                                    text: "Edit Indexing",
                                                                    enabled : "{/editIndex/buttonEnabled}",
                                                                    visible : "{/editIndex/buttonVisible}",
                                                                    press : function () {
                                                                        iomy.common.NavigationChangePage( "pDBIndex" , {} , false);
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                    ]
                                                })
                                            ]
                                        })
                                    ]                                    
                                })
                            ]
                        })
                    ]
                    
                }).addStyleClass("")
            ]
        }).addStyleClass("MainBackground");
    }
});