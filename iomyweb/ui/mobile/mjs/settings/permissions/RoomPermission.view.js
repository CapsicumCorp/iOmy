/*
Title: Room Permissions Page (UI5 View)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Creates a page to hold a table of rooms that holds their
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

sap.ui.jsview("mjs.settings.permissions.RoomPermission", {
    
    wSelectUser             : null,
    wSelectRoom             : null,
    wSliderPermissionLevel  : null,
    wLabelPermissionLevel   : null,
    
    wButtonApply        : null,
    wButtonCancel       : null,
    
    /*************************************************************************************************** 
    ** 1.0 - Controller Declaration
    **************************************************************************************************** 
    * Specifies the Controller belonging to this View. 
    * In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
    * @memberOf mjs.settings.permissions.RoomPermission
    ****************************************************************************************************/
    getControllerName : function() {
        return "mjs.settings.permissions.RoomPermission";
    },
    
    /*************************************************************************************************** 
    ** 2.0 - Content Creation
    **************************************************************************************************** 
    * Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
    * Since the Controller is given to this method, its event handlers can be attached right away. 
    * @memberOf mjs.settings.permissions.RoomPermission
    ****************************************************************************************************/
    createContent : function(oController) {
        var me = this;
        var iPremiseId;
        
        //--------------------------------------------------------------------//
        // Fetch the premise ID and store it.
        // 
        // NOTE: This currently selects the first premise in the list, which is
        // normally the only one in the list. When we start adding support for
        // multiple premises, this code will need to be redone.
        //--------------------------------------------------------------------//
        $.each(IOMy.common.PremiseList, function (sI, mPremise) {
            iPremiseId = mPremise.Id;
            return false;
        });
        
        me.wSelectUser = new sap.m.Select ({});
        me.wSelectUser.attachChange(
            function () {
                oController.FetchPermissionsForRoom();
            }
        );
    
        try {
            me.wSelectRoom = IOMy.widgets.getRoomSelector(me.createId("roomBox"), "_"+iPremiseId, null, true, true);
            me.wSelectRoom.attachChange(
                function () {
                    oController.FetchPermissionsForRoom();
                }
            );
        } catch (e) {
            if (e.name === "NoRoomsFoundException") {
                me.wSelectRoom = null;
            }
        }
        
        me.wSliderPermissionLevel = new sap.m.Slider ({
            enableTickmarks: true,
            min: 0,
            max: 4,
            
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
                oController.UpdatePermissionsForRoom();
            }
        });
        
        me.wButtonCancel = new sap.m.Button({
            text: "Cancel",
            type: "Reject",
            press : function () {
                if (oController.iUserId === null) {
                    IOMy.common.NavigationTriggerBackForward();
                } else {
                    IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
                }
            }
        }).addStyleClass("MarLeft15px");
        
        var oPage = new IOMy.widgets.IOMyPage({
            view : me,
            controller : oController,
            icon : "sap-icon://GoogleMaterial/lock",
            title : "Room Permissions"
        });    
        
        oPage.addContent(
            new sap.ui.layout.form.Form({
                editable: true,
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
                            new sap.ui.layout.form.FormElement({
                                label : "Room",
                                fields: [
                                    me.wSelectRoom
                                ]
                            }),
                            new sap.ui.layout.form.FormElement({
                                label : "Permission Level",
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
                            }),
                        ]
                    })    
                ]
            })
        );
        return oPage;
    }
    
});
