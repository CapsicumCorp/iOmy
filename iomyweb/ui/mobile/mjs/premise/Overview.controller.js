/*
Title: Premise Overview UI5 Controller
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the controls for showing a selection of premises, each with its
    set of rooms and devices.
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

sap.ui.controller("mjs.premise.Overview", {
    
    rooms : [],
    aStoredDevices : [],
    
    wRoomListBox        : null,
    wMainBox            : null,
    wPanel              : null,
    aElementsToDestroy  : [],
    
    roomsExpanded : {},
    
    lastUpdated : new Date(),
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.premise.Overview
*/
    onInit: function() {
        var me = this;
        var thisView = me.getView();
        
        thisView.addEventDelegate({
            onBeforeShow : function (evt) {
                me.DestroyUI();
                var oPremiseCBox;
                //----------------------------------------------------//
                //-- Refresh the Navigational buttons               --//
                //----------------------------------------------------//
                IOMy.common.NavigationRefreshButtons( me );
                
                me.aElementsToDestroy.push("verticalBox");
                me.aElementsToDestroy.push("premiseBox");
                me.aElementsToDestroy.push("panel");
                
                //=== Create the Premise combo box ===//
                try {
                    oPremiseCBox = IOMy.widgets.getPremiseSelector(me.createId("premiseBox")).addStyleClass("SettingsDropdownInput width100Percent");
                    oPremiseCBox.attachChange( function () {
                        me.wRoomListBox.destroyItems();
                        me.composeRoomList(this.getSelectedKey());
                    });
                } catch(e) {
                    
                    if (e.name === "NoPremisesVisibleException") {
                        oPremiseCBox = new sap.m.Text({
                            text : e.message + ""
                        });
                    } else {
                        oPremiseCBox = new sap.m.Text({
                            text : e.message
                        });
                    }
                }
                
                if (IOMy.functions.getNumberOfPremises() === 1) {
                    thisView.byId("NavSubHead_Title").setText(oPremiseCBox.getSelectedItem().getText().toUpperCase());
                    oPremiseCBox.setVisible(false);
                }
                
                var oPremiseCBoxContainer = new sap.m.VBox({
                    items : [oPremiseCBox]
                }).addStyleClass("UserInputForm width100Percent");
                
                // Create the main placeholder
                me.wMainBox = new sap.m.VBox({
                    items: [oPremiseCBoxContainer]
                });

                //-- Build the room list if there are any premises visible. --//
                if (JSON.stringify(IOMy.common.PremiseList) !== "{}") {
                    me.composeRoomList();
                }
                
                me.wPanel = new sap.m.Panel(me.createId("panel"), {
                    backgroundDesign: "Transparent",
                    content: [me.wMainBox] //-- End of Panel Content --//
                }).addStyleClass("PanelNoPadding MarTop0px PadBottom15px UserInputForm");

                thisView.byId("page").addContent(me.wPanel);
            }
        });
    },
    
    /**
     * Procedure that destroys the previous incarnation of the UI. Must be called by onInit before
     * (re)creating the page.
     */
    DestroyUI : function() {
        var me          = this;
        
        IOMy.functions.destroyItemsByIdFromView(me, me.aElementsToDestroy);
        
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Clear the array
        me.aElementsToDestroy = [];
    },
    
    /**
     * Procedure for creating the UI elements that make up the entire list of
     * rooms in the currently selected premise.
     * 
     * @param {int} iPremiseId         (optional) ID of the currently selected premise.
     * @memberOf mjs.premise.Overview
     */
    composeRoomList : function (iPremiseId) {
        var me = this;
        var thisView = me.getView();
        var bDrawingRoomEntry = true;
        var sNoRoomsConfiguredMsg;
//        var iNumOfButtons = 0;
//        var iPremiseKey = (iPremiseId !== undefined ? iPremiseId : null);
        
        if (me.timerInterval !== null)
            clearInterval(me.timerInterval);
        
        me.wRoomListBox = new sap.m.VBox({
            items: []
        });
        
        if (iPremiseId !== undefined && iPremiseId !== null) {
            me.byId("premiseBox").setSelectedKey(iPremiseId);
        } else {
            me.byId("premiseBox").setSelectedKey(null);
        }

        me.rooms = [];
        
        if (me.byId("premiseBox").getSelectedKey() > 0 && IOMy.common.RoomsList["_"+me.byId("premiseBox").getSelectedKey()] !== undefined) {
            var rooms = IOMy.common.RoomsList["_"+me.byId("premiseBox").getSelectedKey()];
            jQuery.sap.log.debug(JSON.stringify(rooms));

            //==============================================//
            // CREATE THE LIST OF ROOMS                     //
            //==============================================//

            // Layout Object
            var oLayout = new sap.m.VBox({
                items: []
            }).addStyleClass(""); 

            var oLine = new sap.ui.core.HTML({
                content : ["<div class='Line'></div>"]
            });
            oLayout.addItem(oLine);

            //==============================================//
            // If there are rooms available, show them
            //==============================================//
            if (IOMy.functions.getNumberOfRoomsInPremise(me.byId("premiseBox").getSelectedKey()) !== 0) {
                //-- Add side borders if the page is wide enough --//
                me.wRoomListBox.addStyleClass("TableSideBorders");
                
                //==============================================//
                // ADD TABLE HEADINGS
                //==============================================//
                me.wRoomListBox.addItem(
                    new sap.m.HBox({
                        items : [
                            // === DEVICES === //
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Label({
                                        text : "Devices"
                                    })
                                ]
                            }).addStyleClass("ElementChildCenter FlexNoShrink width60px BorderRight"),
                            // === ROOM === //
                            new sap.m.VBox({
                                items : [
                                    new sap.m.Label({
                                        text : "Room"
                                    }).addStyleClass("PaddingToMatchButtonText")
                                ]
                            })
                        ]
                    }).addStyleClass("ConsistentMenuHeader ListItem BorderTop")
                );

                //==============================================//
                // CONSTRUCT THE ROOM LIST
                //==============================================//
                var iDevicesInRoom;
                
                $.each(rooms,function(sIndex,aRoom) {
                    
                    //-- Verify that the Premise has rooms --//
                    if( sIndex!==undefined && sIndex!==null && aRoom!==undefined && aRoom!==null )
                    {
                        if (aRoom.RoomId === 1 && aRoom.RoomName === "Unassigned" && JSON.stringify(aRoom.Things) === "{}") {
                            bDrawingRoomEntry = false;
                        } else {
                            bDrawingRoomEntry = true;
                        }
                        
                        if (bDrawingRoomEntry) {
                            // Clean up any old elements with IDs.
                            me.aElementsToDestroy.push("roomName"+sIndex);
                            me.aElementsToDestroy.push("roomLink"+sIndex);

                            // Retrieve number of devices in a given room
                            iDevicesInRoom = IOMy.functions.getNumberOfDevicesInRoom(aRoom.RoomId);

                            //=========== Create the room entry =============//
                            me.wRoomListBox.addItem(
                                new sap.m.HBox({
                                    items : [
                                        // === NUMBER OF DEVICES ASSIGNED TO A ROOM ===//
                                        new sap.m.VBox({
                                            items : [
                                                new sap.m.Link({
                                                    textAlign : "Center",
                                                    text : iDevicesInRoom,
                                                    
                                                    press : function () {
                                                        var oLink = this;
                                                        oLink.setEnabled(false);
                                                        
                                                        if (JSON.stringify(aRoom.Things) !== "{}") {
                                                            IOMy.common.NavigationChangePage("pRoomsOverview", {room : aRoom});
                                                            oLink.setEnabled(true);
                                                        } else {
                                                            IOMy.common.showConfirmQuestion("Do you wish to add a device in "+aRoom.RoomName+"?", "No devices in "+aRoom.RoomName,
                                                                function (oAction) {
                                                                    if (oAction === sap.m.MessageBox.Action.OK) {
                                                                        IOMy.common.NavigationChangePage("pSettingsLinkAdd", {RoomId : aRoom.RoomId});
                                                                    }
                                                                    
                                                                    oLink.setEnabled(true); // Re-enable the button regardless.
                                                                }
                                                            );
                                                        }
                                                    }
                                                }).addStyleClass("TextBold NumberLabel MarTop10px MarLeft5px MarRight5px")
                                            ]
                                        }).addStyleClass("FlexNoShrink width60px BorderRight TextCenter"),

                                        // === ROOM LINK === //
                                        new sap.m.VBox({
                                            items : [
                                                new sap.m.Button(me.createId("roomLink"+sIndex), {
                                                    text : aRoom.RoomName,
                                                    press : function () {
                                                        if (aRoom.RoomId === 1 && aRoom.RoomName === "Unassigned") {
                                                            IOMy.common.NavigationChangePage("pRoomsOverview", {room : aRoom});
                                                        } else {
                                                            IOMy.common.NavigationChangePage("pSettingsRoomEdit", {room : aRoom});
                                                        }
                                                    }
                                                }).addStyleClass("ButtonNoBorder PremiseOverviewRoomButton IOMYButton TextLeft TextSize16px")
                                            ]
                                        }).addStyleClass("TextOverflowEllipsis width100Percent webkitflex"),
                                    ]
                                }).addStyleClass("ListItem minheight20px")
                            );
                        }
                    }
                });
            } else {
                if (IOMy.functions.getNumberOfPremises() === 1) {
                    sNoRoomsConfiguredMsg = "No rooms are configured.";
                } else {
                    sNoRoomsConfiguredMsg = "No rooms are configured in "+me.byId("premiseBox").getSelectedItem().getText()+".";
                }
                
                oLayout.addItem(
                    new sap.m.MessageStrip({
                        text : sNoRoomsConfiguredMsg
                    }).addStyleClass("iOmyMessageInfoStrip")
                );
            
                oLayout.addItem(
                    new sap.m.VBox({
                        items : [
                            new sap.m.Button({
                                text : "Add Room",
                                press : function () {
                                    IOMy.common.NavigationChangePage("pSettingsRoomAdd", {premiseID : me.byId("premiseBox").getSelectedKey()});
                                }
                            }).addStyleClass("width100Percent")
                        ]
                    }).addStyleClass("TextCenter MarTop12px")
                );
            
                oLayout.addStyleClass("BorderBottom PadAll6px");
            }

            me.lastUpdated = IOMy.common.RoomsListLastUpdate;
        }
        
        // Insert the action menu to the bottom left of the page.
        me.wRoomListBox.addItem(oLayout);
        thisView.byId("extrasMenuHolder").destroyItems();
        thisView.byId("extrasMenuHolder").addItem(
            IOMy.widgets.getActionMenu({
                id : me.createId("extrasMenu"),        // Uses the page ID
                icon : "sap-icon://GoogleMaterial/more_vert",
                items : [
                    {
                        text: "Add Room",
                        select:    function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsRoomAdd", {premiseID : me.byId("premiseBox").getSelectedKey()} );
                        }
                    },
                    {
                        text: "Edit Information",
                        select:    function (oControlEvent) {
                            // Find the Premise List item that has the ID of
                            // the currently selected premise and store it.
                            $.each(IOMy.common.PremiseList, function (sI, mPremise) {
                                if (mPremise.Id == me.byId("premiseBox").getSelectedKey()) {
                                    // Grab the correct list index.
                                    IOMy.common.PremiseSelected = mPremise;
                                }
                            });

                            IOMy.common.NavigationChangePage( "pSettingsPremiseInfo", {} );
                        }
                    },
                    {
                        text: "Edit Address",
                        select:    function (oControlEvent) {
                            // Find the Premise List item that has the ID of
                            // the currently selected premise and store it.
                            $.each(IOMy.common.PremiseList, function (sI, mPremise) {
                                if (mPremise.Id == me.byId("premiseBox").getSelectedKey()) {
                                    // Grab the correct list index.
                                    IOMy.common.PremiseSelected = mPremise;
                                }
                            })

                            IOMy.common.NavigationChangePage( "pSettingsPremiseAddress", {premise : IOMy.common.PremiseSelected} );
                        }
                    }
                ]
            })
        );
        
        me.wMainBox.addItem(me.wRoomListBox);
    },
    
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.premise.Overview
*/
//    onBeforeRendering: function() {
//        
//    },

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.premise.Overview
*/
//    onAfterRendering: function() {
//        
//    }
    
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.premise.Overview
*/
//    onExit: function() {
//
//    }

});