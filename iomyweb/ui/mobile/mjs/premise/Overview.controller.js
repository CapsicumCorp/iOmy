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
                
                var oPremiseCBoxContainer = new sap.m.VBox({
                    items : [oPremiseCBox]
                }).addStyleClass("UserInputForm width100Percent");
                
                // Create the main placeholder
                me.wMainBox = new sap.m.VBox({
                    items: [oPremiseCBoxContainer]
                });

                //-- Build the room list if there are any premises visible. --//
                if (IOMy.common.PremiseList.length !== 0) {
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

            // ID management
            var idCount = 0; 

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
                var aDevice;
                // Create the collapse/expand icon in an array of widgets.
                var aDeviceArrow;
                
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

							//--------------------------------------------------------//
							// If this rooom has devices attached. Create an array
							// containing a button to expand or collapse a list of those
							// devices
							//--------------------------------------------------------//
							if (iDevicesInRoom > 0) {
								aDeviceArrow = [
									new sap.m.Button(me.createId("roomName"+sIndex), {
										tooltip: "Collapse",
										icon : "sap-icon://navigation-down-arrow",
										press : function () {
											if (me.roomsExpanded[sIndex] === false) {
												me.byId("room"+sIndex).setVisible(true);
												me.roomsExpanded[sIndex] = true;
												this.setIcon("sap-icon://navigation-down-arrow");
												this.setTooltip("Collapse");
											} else {
												me.byId("room"+sIndex).setVisible(false);
												me.roomsExpanded[sIndex] = false;
												this.setIcon("sap-icon://navigation-right-arrow");
												this.setTooltip("Expand");
											}
										}
									}).addStyleClass("ButtonNoBorder IOMYButton ButtonIconGreen TextSize20px width100Percent")
								];

							//--------------------------------------------------------//
							// Otherwise use an empty items array
							//--------------------------------------------------------//
							} else {
								aDeviceArrow = [];
							}

							//=========== Create the room entry =============//
							me.wRoomListBox.addItem(
								new sap.m.HBox({
									items : [
										// === NUMBER OF DEVICES ASSIGNED TO A ROOM ===//
										new sap.m.VBox({
											items : [
												new sap.m.Text({
													textAlign : "Center",
													text : iDevicesInRoom
												}).addStyleClass("TextBold NumberLabel MarTop10px MarLeft5px MarRight5px")
											]
										}).addStyleClass("FlexNoShrink width60px BorderRight TextCenter"),

										// === ROOM LINK === //
										new sap.m.VBox({
											items : [
												new sap.m.Button(me.createId("roomLink"+sIndex), {
													text : aRoom.RoomName,
													press : function () {
														//-- If there are things associated with this room go to its overview page --//
														if (JSON.stringify(aRoom.Things) !== "{}") {
															IOMy.common.NavigationChangePage("pRoomsOverview", {room : aRoom});

														//-- Otherwise go straight to the edit page for it. --//
														} else {
															IOMy.common.NavigationChangePage("pSettingsRoomEdit", {room : aRoom});
														}
													}
												}).addStyleClass("ButtonNoBorder PremiseOverviewRoomButton IOMYButton TextLeft TextSize16px")
											]
										}).addStyleClass("TextOverflowEllipsis width100Percent jbMR1tempfix"),

										// === COLLAPSE/EXPAND BUTTON PLACEHOLDER === //
										// If there are things associated with a room via their links...
										new sap.m.VBox({
											items : aDeviceArrow
										}).addStyleClass("FlexNoShrink width70px")
									]
								}).addStyleClass("ListItem minheight20px")
							).addItem(
								//=============== Create the placeholder for the room list. ===============//
								new sap.m.VBox(me.createId("room"+sIndex), {
									items : []
								})
							);

							$.each(aRoom.Things,function(sJndex,aDeviceKeys) {
								if( sJndex!==undefined && sJndex!==null && aDeviceKeys!==undefined && aDeviceKeys!==null ) {
									// Grab the correct Thing in the list and save its ID.
									aDevice = IOMy.common.ThingList["_"+aDeviceKeys.Thing];
									aDevice = {
										"DeviceId":			aDevice.Id,
										"DeviceName":		aDevice.DisplayName,
										"DeviceTypeId":		aDevice.TypeId,
										"DeviceTypeName":	aDevice.TypeName,
										"DeviceStatus":		aDevice.Status,
										"PermToggle":		aDevice.PermToggle,
										"IOs":              aDevice.IO,
										"RoomId":			aDevice.RoomId
									};
									me.aStoredDevices.push(aDevice);

									// Create the flag for showing the list of rooms for a selected room
									// if it doesn't already exist.
									if (me.roomsExpanded[sIndex] === undefined) {
										me.roomsExpanded[sIndex] = false;
									}

									// Retrieve number of devices/things in the room
									iDevicesInRoom = IOMy.functions.getNumberOfDevicesInRoom(aDevice.DeviceId);

									//=============== Create/Refresh the device link ===============//
									me.aElementsToDestroy.push("device"+aDevice.DeviceId);
									me.aElementsToDestroy.push("deviceLink"+aDevice.DeviceId);

									me.byId("room"+sIndex).addItem(
										new sap.m.HBox({
											items : [
												// Device Link
												new sap.m.VBox(me.createId("device"+aDevice.DeviceId),{
													items : [
														new sap.m.Link(me.createId("deviceLink"+aDevice.DeviceId),{
															text : aDevice.DeviceName,
															press : function () {
																// Lock Button
																this.setEnabled(false);

																var sPageName = "";     // Name of the page to enter as defined in app.js

																var oItem;
																for (var i = 0; i < me.aStoredDevices.length; i++) {
																	if (me.byId("deviceLink"+me.aStoredDevices[i].DeviceId).getEnabled() === false) {
																		oItem = me.aStoredDevices[i];
																		jQuery.sap.log.debug("ID of Thing selected: "+oItem.DeviceId);
																		break;
																	}
																}

																// Determine which device page to enter according to the device type.
																if (me.aStoredDevices[i].DeviceTypeId === 2) {
																	sPageName = "pDeviceData"; //-- Zigbee --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 13) {
																	sPageName = "pPhilipsHue"; //-- Philips Hue --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 12) {
																	sPageName = "pOnvif"; //-- Onvif Camera --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 3) {
																	sPageName = "pMotionSensor"; //-- Motion Sensor --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 4) {
																	//sPageName = "pDeviceTestThermostat"; //-- Temperature Sensor --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 10) {
																	//sPageName = "pThermostat"; //-- DevelCo Energy Meter --//
																} else if (me.aStoredDevices[i].DeviceTypeId === 14) {
																	sPageName = "pThermostat"; //-- Open Weather Map --//

																// -- Experimental Pages --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-1") {
																	sPageName = "pDeviceDoorLock"; //-- Door Lock --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-2") {
																	sPageName = "pDeviceWindowSensor"; //-- Window Sensor --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-3") {
																	sPageName = "pDeviceScales"; //-- Bluetooth Scales --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-4") {
																	sPageName = "pDeviceBPM"; //-- Blood Pressure Monitor --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-5") {
																	sPageName = "pDeviceGaragedoor"; //-- Remote Controlled Garage Door --//
																} else if (me.aStoredDevices[i].DeviceTypeId === "-6") {
																	sPageName = "pDeviceTestThermostat"; //-- Thermostat --//
																}

																IOMy.common.NavigationChangePage(sPageName, {ThingId : oItem.DeviceId});

																// Unlock Button
																this.setEnabled(true);
															}
														}).addStyleClass("SettingsLinks Font-RobotoCondensed TextLeft TextBold PadLeft8px Text_grey_20 width100Percent")
													]
												}).addStyleClass("width100Percent TextOverflowEllipsis")
											]
										}).addStyleClass("ListItem width100Percent PadTop4px MainPanelElement ListItemDark")
									);

									// Decide whether to hide or show when the page loads/reloads.
									if (me.roomsExpanded[sIndex] === false) {
										me.byId("room"+sIndex).setVisible(false);
										if (me.byId("roomName"+sIndex) !== undefined) {
											me.byId("roomName"+sIndex).setIcon("sap-icon://navigation-right-arrow").setTooltip("Expand");
										}
									}

									idCount++;
								}
							});
						}
					}
                });
            } else {
                oLayout.addItem(
                    new sap.m.MessageStrip({
                        text : "There are no rooms accessible in "+me.byId("premiseBox").getSelectedItem().getText()+"."
                    }).addStyleClass("iOmyMessageInfoStrip")
                );
			
				oLayout.addItem(
					new sap.m.VBox({
						items : [
							new sap.m.Link({
								//enabled : false,
								text : "Add Room",
								press : function () {
									IOMy.common.NavigationChangePage("pSettingsRoomAdd", {premiseID : me.byId("premiseBox").getSelectedKey()});
								}
							}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
						]
					}).addStyleClass("TextCenter MarTop12px")
				);
			
				oLayout.addStyleClass("BorderBottom PadAll6px");
            }
            
            idCount = 0;

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
                        select:	function (oControlEvent) {
                            IOMy.common.NavigationChangePage( "pSettingsRoomAdd", {premiseID : me.byId("premiseBox").getSelectedKey()} );
                        }
                    },
                    {
                        text: "Edit Information",
                        select:	function (oControlEvent) {
                            // Find the Premise List item that has the ID of
                            // the currently selected premise and store it.
                            for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
                                if (IOMy.common.PremiseList[i].Id == me.byId("premiseBox").getSelectedKey()) {
                                    // Grab the correct list index.
                                    IOMy.common.PremiseSelected = IOMy.common.PremiseList[i];
                                    break;
                                }
                            }

                            IOMy.common.NavigationChangePage( "pSettingsPremiseInfo", {} );
                        }
                    },
                    {
                        text: "Edit Address",
                        select:	function (oControlEvent) {
                            // Find the Premise List item that has the ID of
                            // the currently selected premise and store it.
                            for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
                                if (IOMy.common.PremiseList[i].Id == me.byId("premiseBox").getSelectedKey()) {
                                    // Grab the correct list index.
                                    IOMy.common.PremiseSelected = IOMy.common.PremiseList[i];
                                    break;
                                }
                            }

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
//	onBeforeRendering: function() {
//        
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.premise.Overview
*/
//	onAfterRendering: function() {
//		
//	}
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.premise.Overview
*/
//	onExit: function() {
//
//	}

});