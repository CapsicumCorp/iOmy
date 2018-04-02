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

sap.ui.jsview("pages.server.DBIndex", {
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf pages.server.DBIndex
    ****************************************************************************************************/ 
    getControllerName : function() {
        return "pages.server.DBIndex";
    },

    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf pages.server.DBIndex
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
                        new sap.uxap.ObjectPageSection(oView.createId("DB"), {
                            showTitle: false,
                            subSections : [
                                new sap.uxap.ObjectPageSubSection(oView.createId("DBBlock"), {
                                    blocks : [
                                        new sap.ui.layout.form.Form( oView.createId("DBBlock_Form"),{
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
												columnsXL: 1,
												columnsL: 1,
												columnsM: 1,
												columnsS: 1,
												singleContainerFullSize: false
											}),
                                            toolbar : new sap.m.Toolbar({
                                                content : [
                                                    new sap.m.Title (oView.createId("DBTitle"),{
                                                        text:"Database Indexing"
                                                    })
                                                ]
                                            }).addStyleClass("MarBottom1d0Rem"),
                                            formContainers : [
                                                new sap.ui.layout.form.FormContainer({
                                                    formElements : [
                                                        new sap.ui.layout.form.FormElement({
                                                            label : "Warning",
                                                            fields: [
                                                                new sap.m.Text({
                                                                    text: "If the database indices are enabled the load time of the application with be faster but uses significantly more storage.",
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : "Index State",
                                                            fields: [ 
                                                                new sap.m.CheckBox ({
                                                                    text: "Database Indexed",
                                                                    enabled : "{/controls/ControlsEnabled}",
                                                                    selected : "{/DBIndexingOn}",
                                                                    select : function () {
                                                                        oController.ToggleEditIndexButton();
                                                                    }
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : iomy.widgets.RequiredLabel("DB Root User"),
                                                            fields: [ 
                                                                new sap.m.Input ({
                                                                    enabled : "{/controls/ControlsEnabled}",
                                                                    value:"{/DBAdminUsername}"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label : iomy.widgets.RequiredLabel("DB Root Password"),
                                                            fields: [ 
                                                                new sap.m.Input ({
                                                                    enabled : "{/controls/ControlsEnabled}",
                                                                    type : sap.m.InputType.Password,
                                                                    value:"{/DBAdminPassword}"
                                                                })
                                                            ]
                                                        }),
                                                        new sap.ui.layout.form.FormElement({
                                                            label: "",
                                                            fields: [
                                                                new sap.m.Button (oView.createId("ButtonSubmit"), {
                                                                    text: "Save",
                                                                    type: sap.m.ButtonType.Accept,
                                                                    enabled : "{/controls/EditIndexEnabled}",
                                                                    press:   function( oEvent ) {
                                                                        oController.ToggleDBIndexing();
                                                                    }
                                                                }),
                                                                new sap.m.Button (oView.createId("ButtonCancel"), {
                                                                    text: "Cancel",
                                                                    type: sap.m.ButtonType.Reject,
                                                                    enabled : "{/controls/CancelEnabled}",
                                                                    press:   function( oEvent ) {
                                                                        iomy.common.NavigationChangePage( "pServerInfo" ,  {} , false);
                                                                    }
                                                                }),
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