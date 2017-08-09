/*
Title: Edit Room Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given
    room.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

sap.ui.controller("mjs.settings.rooms.RoomEdit", {
    functions : IOMy.functions,
    odata : IOMy.apiodata,
    
    iRoomID : null,
    mRoom   : null,
    
    wRoomName           : null,
    wRoomDescription    : null,
    wRoomType           : null,
    wUpdateButton       : null,
    wMainBox            : null,
    wPanel              : null,
    
    aElementsToDestroy  : [],
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.rooms.RoomEdit
*/
    onInit: function() {
        var me = this;
        var thisView = me.getView();
        
        thisView.addEventDelegate({
            // Everything is rendered in this function run before rendering.
            onBeforeShow : function (evt) {
                //-- Refresh the Navigational buttons --//
                IOMy.common.NavigationRefreshButtons( me );
                
                
                // Collect values parsed from the device list.
                me.iRoomID = evt.data.room.RoomId;
                me.mRoom = IOMy.common.RoomsList["_"+evt.data.room.PremiseId]["_"+me.iRoomID];
                //console.log(me.iRoomID);
                
                // Start rendering the page
                
                //-- Set Room name as the title --//
                thisView.byId("NavSubHead_Title").setText(me.mRoom.RoomName.toUpperCase());
                
                me.DestroyUI();
                me.DrawUI();
                
            }
        });
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.rooms.RoomEdit
*/
//    onBeforeRendering: function() {
//
//    },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.rooms.RoomEdit
*/
//    onAfterRendering: function() {
//        
//    },
    
    
    
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.rooms.RoomEdit
*/
//    onExit: function() {
//
//    }

    DestroyUI : function () {
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Wipe any elements with IDs assigned to them
        //me.destroyItemsWithIDs(me, me.aElementsToDestroy);
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    DrawUI : function () {
        //-------------------------------------------------------------------//
        // Declare and initialise variables.
        //-------------------------------------------------------------------//
        var me = this;
        var thisView = me.getView();
        var oRoomTitle;
        var oRoomDescTitle;
        var oRoomTypeTitle;
        var oEditButton;
        var fnRoomTypesSelectBox = IOMy.widgets.roomTypesSelectBox;
        
        //-------------------------------------------------------------------//
        // Create Labels.
        //-------------------------------------------------------------------//
        oRoomTitle = new sap.m.Text({
            text : "Name"
        });

        oRoomDescTitle = new sap.m.Text({
            text : "Description"
        });

        oRoomTypeTitle = new sap.m.Text({
            text : " Room Type"
        });
        
        //-------------------------------------------------------------------//
        // Create fields.
        //-------------------------------------------------------------------//
        me.wRoomName = new sap.m.Input(me.createId("roomName"), {
            value : me.mRoom.RoomName
        }).addStyleClass("width100Percent SettingsTextInput");

        me.wRoomDescription = new sap.m.Input(me.createId("roomDesc"), {
            value : me.mRoom.RoomDesc
        }).addStyleClass("width100Percent SettingsTextInput");

        me.wRoomType = fnRoomTypesSelectBox(me.createId("roomType"), me.mRoom.RoomTypeId).addStyleClass("width100Percent SettingsDropdownInput");
        
        me.wUpdateButton = new sap.m.Link({
            text : "Update",
            press : function () {
                var thisButton = this;
                IOMy.common.NavigationToggleNavButtons(me, false);

                try {
                    //--------------------------------------------//
                    // Update the room details.
                    //--------------------------------------------//
                    IOMy.functions.updateRoom(me.iRoomID, {
                        callingWidget : thisButton,
                        view : thisView
                    });
                } catch (eUpdateRoomError) {
                    //--------------------------------------------//
                    // Catch any exceptions.
                    //--------------------------------------------//
                    IOMy.common.showError("There was a problem updating the room:\n\n"+eUpdateRoomError.message, "Error Updating Room",
                        function () {
                            thisButton.setEnabled(true);
                            IOMy.common.NavigationToggleNavButtons(me, true);
                        }
                    );

                    jQuery.sap.log.error(eUpdateRoomError.message);
                }
            }
        }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink");

        oEditButton = new sap.m.VBox({
            items : [
                me.wUpdateButton
            ]
        }).addStyleClass("TextCenter MarTop12px");

        me.wMainBox = new sap.m.VBox({
            items : [
                oRoomTitle, me.wRoomName,
                oRoomDescTitle, me.wRoomDescription,
                /*oFloorsTitle, oFloorsField,*/
                oRoomTypeTitle, me.wRoomType,
                oEditButton
            ]
        }).addStyleClass("UserInputForm");

        me.wPanel = new sap.m.Panel({
            backgroundDesign: "Transparent",
            content: [me.wMainBox] //-- End of Panel Content --//
        });

        thisView.byId("page").addContent(me.wPanel);

        // Create the extras menu for the Premise Edit Address page.
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"+me.iRoomID),        // Uses the page and room IDs
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : [
                    {
                        text : "Delete This Room",
                        select : function () {
                            //var oButton = this;
                            var sDialogTitle = "";
                            IOMy.common.NavigationToggleNavButtons(me, false);
                            me.wUpdateButton.setEnabled(false);

                            //-- CONFIRM THAT YOU WISH TO DELETE THIS ROOM --//
                            IOMy.common.showConfirmQuestion("Do you wish to delete this room?", "Are you sure?",
                                function (oAction) {
                                    if (oAction === sap.m.MessageBox.Action.OK) {
                                        try {
                                            IOMy.functions.deleteRoom(me.iRoomID,
                                                function () {
                                                    IOMy.common.showMessage({
                                                        text : me.wRoomName.getValue() + " successfully removed.",
                                                        view : thisView
                                                    })
                                                    IOMy.common.NavigationToggleNavButtons(me, true);
                                                    me.wUpdateButton.setEnabled(true);
                                                    IOMy.common.NavigationChangePage("pPremiseOverview", {}, true);
                                                }
                                            );

                                        } catch (err) {

                                            if (err.name === "DevicesStillInRoomException") {
                                                sDialogTitle = "Devices still assigned";

                                            } else if (err.name === "AttemptToDeleteOnlyRoomException") {
                                                // NOTE: This is probably not needed anymore with the way the "Unassigned" pseudo-room works.
                                                sDialogTitle = "Only room registered"

                                            }

                                            IOMy.common.showError(err.message, sDialogTitle,
                                                function () {
                                                    IOMy.common.NavigationToggleNavButtons(me, true);
                                                    me.wUpdateButton.setEnabled(true);
                                                }
                                            );

                                        }
                                    } else {
                                        IOMy.common.NavigationToggleNavButtons(me, true);
                                        me.wUpdateButton.setEnabled(true);
                                    }
                                }
                            );
                        }
                    }
                ]
            })
        );
    }

});
