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
                
				me.functions.destroyItemsByIdFromView(me, [
	                "roomName", "roomDesc", "roomFloor", "roomType"
	            ]);
				
                
				var oRoomTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "* "
                        }).addStyleClass("Text_red_13"),
                        new sap.m.Text({
                            text : "Name"
                        })
                    ]
                }).addStyleClass("");
    		    
				me.wRoomName = new sap.m.Input(me.createId("roomName"), {
					value : me.mRoom.RoomName
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oRoomDescTitle = new sap.m.Text({
    	        	text : "Description"
    	        }).addStyleClass("");
    		    
				me.wRoomDescription = new sap.m.Input(me.createId("roomDesc"), {
					value : me.mRoom.RoomDesc
				}).addStyleClass("width100Percent SettingsTextInput");
                
//                var oFloorsTitle = new sap.m.HBox({
//                    items : [
//                        new sap.m.Text({
//                            text : "* "
//                        }).addStyleClass("Text_red_13"),
//                        new sap.m.Text({
//                            text : " Floor"
//                        })
//                    ]
//                });
//    		    
//				var oFloorsField = new sap.m.Select(me.createId("roomFloor"), {}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oRoomTypeTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "* "
                        }).addStyleClass("Text_red_13"),
                        new sap.m.Text({
                            text : " Room Type"
                        })
                    ]
                });
    		    
				me.wRoomType = new sap.m.Select(me.createId("roomType"), {
                    width : "100%"
                }).addStyleClass("width100Percent SettingsDropdownInput");
                
                //================================================//
                // LOAD FLOOR OPTIONS AND SET CURRENT FLOOR COUNT //
                //================================================//
//                me.odata.AjaxRequest({
//                    Url : me.odata.ODataLocation("premise_floors"),
//                    Columns : ["PREMISEFLOORS_PK", "PREMISEFLOORS_NAME"],
//                    WhereClause : [],
//                    OrderByClause : [],
//                    
//                    onSuccess : function (responseType, data) {
//                        var iMaxFloors;
//                        for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
//                            if (IOMy.common.PremiseList[i].Id == me.mRoom.PremiseId) {
//                                iMaxFloors = IOMy.common.PremiseList[i].FloorCountId;
//                                break;
//                            }
//                        }
//                        
//                        for (var i = 0; i < iMaxFloors; i++) {
//                            oFloorsField.addItem(
//                                new sap.ui.core.Item({
//                                    text : data[i].PREMISEFLOORS_NAME,
//                                    key : data[i].PREMISEFLOORS_PK
//                                })
//                            );
//                        }
//                        oFloorsField.setValue(me.mRoom.RoomFloor);
//                    },
//                    
//                    onFail : function (response) {
//                        jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
//                    }
//                });
                
                //==================================================//
                // LOAD ROOM TYPE OPTIONS AND SET CURRENT ROOM TYPE //
                //==================================================//
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("room_types"),
                    Columns : ["ROOMTYPE_PK", "ROOMTYPE_NAME"],
                    WhereClause : [],
                    OrderByClause : [],
                    
                    onSuccess : function (responseType, data) {
                        for (var i = 0; i < data.length; i++) {
                            me.wRoomType.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].ROOMTYPE_NAME,
                                    key : data[i].ROOMTYPE_PK
                                })
                            ).setSelectedKey(me.mRoom.RoomTypeId);
                        }
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading room types OData: "+JSON.stringify(response));
                    }
                });
                
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Update",
							press : function () {
                                //--------------------------------------------//
                                // Update the room details.
                                //--------------------------------------------//
                                IOMy.functions.updateRoom(me.iRoomID, {
                                    callingWidget : this
                                });
                            }
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
                
                if (me.byId("vbox_container") !== undefined)
                    me.byId("vbox_container").destroy();
                
                var oVertBox = new sap.m.VBox(me.createId("vbox_container"), {
					items : [oRoomTitle, me.wRoomName, oRoomDescTitle, me.wRoomDescription,
                            /*oFloorsTitle, oFloorsField,*/ oRoomTypeTitle, me.wRoomType,
                            oEditButton]
				}).addStyleClass("UserInputForm");
                
                // Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("panel") !== undefined)
					me.byId("panel").destroy();
				
				var oPanel = new sap.m.Panel(me.createId("panel"), {
                    backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
                
		    	thisView.byId("page").addContent(oPanel);
                
                // Create the extras menu for the Premise Edit Address page.
                thisView.byId("extrasMenuHolder").destroyItems();
                thisView.byId("extrasMenuHolder").addItem(
                    IOMy.widgets.getActionMenu({
                        id : me.createId("extrasMenu"),        // Uses the page ID
                        icon : "sap-icon://GoogleMaterial/more_vert",
                        items : [
                            {
                                text : "Delete This Room",
                                select : function () {
                                    this.setEnabled(false);

                                    var iNumOfDevices = IOMy.functions.getNumberOfDevicesInRoom(me.iRoomID);
                                    var sDevicesAttachedMessage = "";
                                    //console.log(JSON.stringify(IOMy.common.ThingList));

                                    //-- A ROOM SHOULD BE DELETED ONLY WHEN THERE ARE NO DEVICES ATTACHED TO IT --//
                                    if (iNumOfDevices > 0) {
                                        sDevicesAttachedMessage += "There ";
                                        if (iNumOfDevices === 1) {
                                            sDevicesAttachedMessage += "is "+iNumOfDevices+" device";
                                        } else {
                                            sDevicesAttachedMessage += "are "+iNumOfDevices+" devices";
                                        }
                                        sDevicesAttachedMessage += " still assigned to this room.\n\n";
                                        sDevicesAttachedMessage += "Remove the devices from this room before deleting it.";

                                        jQuery.sap.log.error(sDevicesAttachedMessage);
                                        IOMy.common.showError(sDevicesAttachedMessage, "Devices still assigned");
                                    } else {
                                        //-- CONFIRM THAT YOU WISH TO DELETE THIS ROOM --//
                                        IOMy.common.showConfirmQuestion("Do you wish to delete this room?", "Are you sure?",
                                        function (oAction) {
                                            if (oAction === sap.m.MessageBox.Action.OK) {
                                                IOMy.apiphp.AjaxRequest({
                                                    url: IOMy.apiphp.APILocation("rooms"),
                                                    data : {"Mode" : "DeleteRoom", "Id" : me.iRoomID},

                                                    onSuccess : function () {
                                                        IOMy.common.showSuccess(me.mRoom.RoomName+" successfully removed.", "Success", 
                                                        function () {
                                                            //-- REFRESH ROOMS --//
                                                            IOMy.common.RetreiveRoomList( {
                                                                onSuccess: $.proxy(function() {
                                                                    //-- REFRESH THINGS --//
                                                                    IOMy.apiphp.RefreshThingList({
                                                                        onSuccess: $.proxy(function() {

                                                                            try {
                                                                                //-- Flag that the Core Variables have been configured --//
                                                                                IOMy.common.CoreVariablesInitialised = true;
                                                                                // Refresh the room list after a deletion.
                                                                                oApp.getPage("pPremiseOverview").getController().composeRoomList();
                                                                                // Go back.
                                                                                IOMy.common.NavigationTriggerBackForward(false);

                                                                            } catch(e654321) {
                                                                                //-- ERROR:  TODO: Write a better error message--//
                                                                                jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
                                                                            }
                                                                        }, me)
                                                                    }); //-- END THINGS LIST --//
                                                                }, me)
                                                            }); //-- END ROOMS LIST --//
                                                        }, "UpdateMessageBox");
                                                    }
                                                });
                                            }
                                        });
                                    }

                                    this.setEnabled(true);
                                }
                            }
                        ]
                    })
                );
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.rooms.RoomEdit
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.rooms.RoomEdit
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.rooms.RoomEdit
*/
//	onExit: function() {
//
//	}

    
    
    removeRoom : function (iRoomId, mInfo) {
        
    }

});