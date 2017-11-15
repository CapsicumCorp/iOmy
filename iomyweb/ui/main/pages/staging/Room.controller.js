/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016

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

sap.ui.controller("pages.staging.Room", {
    bEditing : false,
    sPageId : "",
    mPageData : {},
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/


    onInit: function() {
        var oController = this;            //-- SCOPE: Allows subfunctions to access the current scope --//
        var oView = this.getView();
            
        oView.addEventDelegate({
            onBeforeShow : function (oEvent) {
                //----------------------------------------------------//
                //-- Enable/Disable Navigational Forward Button        --//
                //----------------------------------------------------//
                
                //-- Refresh the Navigational buttons --//
                //-- IOMy.common.NavigationRefreshButtons( me ); --//
                
                //-- Checks the oEvent passed from navigation.js --//
                try {
                    if (oEvent.data.bEditing !== undefined) {
                        oController.bEditing = oEvent.data.bEditing;
                    } else {
                        oController.bEditing = false;
                    }
                } catch(e1) {
                    $.sap.log.error("onBeforeShow: oEvent.data.bEditing Critcal Error:"+e1.message);
                    return false;
                }
                
                //-- If check to determinate the destination after selecting a room --//
                try {
                    if (oController.bEditing === false) {
                        oController.sPageId = "pDevice";
                        oController.mPageData = {};
                        
                    } else if(oController.bEditing === true) {
                        oController.sPageId = "pRoomForm";
                        oController.mPageData = {
                            bEditing : oController.bEditing
                        };
                    } else {
                         $.sap.log.error("Critical Error with bEditing, current state is:"+bEditing);
                    }
                } catch(e1) {
                    $.sap.log.error("onBeforeShow: bEditing Critcal Error:"+e1.message);
                    return false;
                }
                //-- Defines the Device Type --//
                IomyRe.navigation._setToggleButtonTooltip(!sap.ui.Device.system.desktop, oView);
                
                oController.BuildRoomListUI();
            }
        });
            
        
    },

    BuildRoomListUI : function () {
        var oController         = this;
        var oView               = this.getView();
        var wList               = oView.byId("RoomList");
        var bHasRooms           = false;
        
        // Wipe the old list.
        wList.destroyItems();
        
        // Fetch the list from the core variables.
        oController.aaRoomList = IomyRe.common.RoomsList;
        
        //--------------------------------------------------------------------//
        // Construct the Room List
        //--------------------------------------------------------------------//
        $.each(oController.aaRoomList, function (sI, mPremise) {
            
            var mFirstRoom = null;
            
            //----------------------------------------------------------------//
            // Create the Group Header
            //----------------------------------------------------------------//
            wList.addItem(
                new sap.m.GroupHeaderListItem ({
                    title: IomyRe.common.PremiseList[sI].Name
                })
            );
        
            //----------------------------------------------------------------//
            // Create the items under that grouping
            //----------------------------------------------------------------//
            $.each(mPremise, function (sJ, mRoom) {
                var bOmitEntry          = false;
                var bRoomIsUnassigned   = false;
                var iDeviceCount;
                var iRoomCount;
                bHasRooms = true;
                
                
                /*
                 * Take the first room in the premise and put it aside.
                 * Check that the name is called "Unassigned".
                 * 
                 * If room name is "Unassigned" and either there are no devices
                 * in there or there are no other rooms,
                 *     Specify that we omit the entry.
                 * 
                 * If we are not omitting the room
                 *     Display it.
                 */
                if (mFirstRoom === null) {
                    mFirstRoom = mRoom;
                    iDeviceCount = IomyRe.functions.getNumberOfDevicesInRoom(mFirstRoom.RoomId);
                    iRoomCount = IomyRe.functions.getNumberOfRoomsInPremise(mFirstRoom.PremiseId);
                    
                    if (mFirstRoom.RoomName === "Unassigned" && (iDeviceCount === 0 || iRoomCount === 1) ) {
                        bOmitEntry = true;
                        bHasRooms = false;
                        
                    } else if (mFirstRoom.RoomName === "Unassigned") {
                        bRoomIsUnassigned = true;
                    }
                }
                
                if (!bOmitEntry) {
                    wList.addItem(
                        new sap.m.ObjectListItem (oView.createId("entry"+mRoom.RoomId), {        
                            title: mRoom.RoomName,
                            type: "Active",
                            number: IomyRe.functions.getNumberOfDevicesInRoom(mRoom.RoomId),
                            numberUnit: "Devices",
                            attributes : [
                                new sap.m.ObjectAttribute ({
                                    text: "link",
                                    customContent : new sap.m.Link ({
                                        text: "Toggle Room State"
                                    })
                                }),
                                new sap.m.ObjectAttribute ({
                                    text: "Status: On"
                                })
                            ],
                            press : function () {
                                var mPageDataTemp = oController.mPageData;
                                var bIsUnassigned = bRoomIsUnassigned;
                                mPageDataTemp.RoomId = mRoom.RoomId;
                                mPageDataTemp.PremiseId = mRoom.PremiseId;
                                
                                if (oController.bEditing && !bIsUnassigned) {
                                    // The user can edit any room except the Unassigned "room".
                                    IomyRe.common.NavigationChangePage( oController.sPageId , mPageDataTemp , false);
                                    
                                } else if (!oController.bEditing) {
                                    // Otherwise, the user won't be looking to edit, so allow the user access to Unassigned.
                                    IomyRe.common.NavigationChangePage( oController.sPageId , mPageDataTemp , false);
                                }
                            }
                        })
                    );
                }
                
            });
            
            //----------------------------------------------------------------//
            // If there are no rooms in the premise
            //----------------------------------------------------------------//
            if (!bHasRooms) {
                wList.addItem(
                    new sap.m.ObjectListItem ({        
                        title: "No rooms",
                        type: "Active",
                        //number: IomyRe.functions.getNumberOfDevicesInRoom(mRoom.RoomId),
                        //numberUnit: "Devices",
                        attributes : [
                            new sap.m.ObjectAttribute ({
                                text: "Tap to add a room"
                            })
                        ],
                        press : function () {
                            IomyRe.common.NavigationChangePage( "pRoomForm" , {} , false);
                        }
                    })
                );
            }
            
        });
        
        
    }
    
});