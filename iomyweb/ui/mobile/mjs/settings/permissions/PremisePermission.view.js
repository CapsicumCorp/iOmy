/*
Title: Premise Permissions Page (UI5 View)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a page to hold a table of premises that holds their
    permissions settings
Copyright: Capsicum Corporation 2016, 2017

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

sap.ui.jsview("mjs.settings.permissions.PremisePermission", {
    
    wSelectUser             : null,
    wSelectPremise          : null,
    wSliderPermissionLevel  : null,
    
    wButtonApply        : null,
    wButtonCancel       : null,
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf mjs.settings.permissions.PremisePermission
    ****************************************************************************************************/
    getControllerName : function() {
        return "mjs.settings.permissions.PremisePermission";
    },
    
    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf mjs.settings.permissions.PremisePermission
    ****************************************************************************************************/
    createContent : function(oController) {
        var me = this;
        
        me.wSelectUser = new sap.m.Select ({});
        
        me.wSelectPremise = IOMy.widgets.getPremiseSelector(me.createId("premiseBox"));
        
        me.wSliderPermissionLevel = new sap.m.Slider ({
            enableTickmarks: true,
            min: 0,
            max: 3,
            
            change : function () {
                oController.setPermissionLevelText();
            }
        });
        
        me.wLabelPermissionLevel = new sap.m.Label ({
            text: ""
        }).addStyleClass("MarTop5px pre-wrap");
        
        me.wButtonApply = new sap.m.Button({
            text: "Apply",
            type: "Accept",
            press : function () {
                oController.UpdatePermissionsForPremise();
            }
        });
        
        me.wButtonCancel = new sap.m.Button({
            text: "Cancel",
            type: "Reject",
            press : function () {
                IOMy.common.NavigationTriggerBackForward();
            }
        }).addStyleClass("MarLeft15px");
        
        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/lock",
            title : "Premise Permissions"
        });    
        
        oPage.addContent(
            new sap.ui.layout.form.Form({
                editable: true,
                //title : "Premise Permissions",
                layout : new sap.ui.layout.form.ResponsiveGridLayout ({
                    labelSpanXL: 4,
                    labelSpanL: 3,
                    labelSpanM: 4,
                    labelSpanS: 12,
                    adjustLabelSpan: false,
                    emptySpanXL: 0,
                    emptySpanL: 4,
                    emptySpanM: 0,
                    emptySpanS: 0,
                    columnsXL: 2,
                    columnsL: 1,
                    columnsM: 1,
                    singleContainerFullSize: false
                }),
                formContainers : [
                    new sap.ui.layout.form.FormContainer({
                        formElements : [
                            new sap.ui.layout.form.FormElement({
                                label : "User",
                                fields: [
                                    me.wSelectUser
                                ]
                            }),
//                            new sap.ui.layout.form.FormElement({
//                                label : "Premise",
//                                fields: [
//                                    me.wSelectPremise
//                                ]
//                            }),
                            new sap.ui.layout.form.FormElement(me.createId("PremiseControl"), {
                                // Label is set to use the premise name.
                                fields: [
                                    me.wSliderPermissionLevel,
                                    me.wLabelPermissionLevel
                                ]
                            }),
                            new sap.ui.layout.form.FormElement({
                                fields: [
                                    new sap.m.FlexBox ({
                                        height:"100px",
                                        alignItems:"Center",
                                        justifyContent:"End",
                                        items: [
                                            me.wButtonApply,
                                            me.wButtonCancel
                                        ]
                                    })
                                ]
                            })
                        ]
                    })    
                ]
            })
        );
    
        return oPage;
    }
    
});
