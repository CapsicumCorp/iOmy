/*
Title: Add Room Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the form that allows you to create a room in a premise.
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
along with iOmy. If not, see <http://www.gnu.org/licenses/>.

*/

sap.ui.controller("mjs.settings.rooms.RoomAdd", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.EditPremise
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
                IOMy.common.NavigationRefreshButtons( me );
                
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, [
	                "roomName", "roomDesc", "roomFloor", "roomType"
	            ]);
				
				var oPremiseTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "* "
                        }).addStyleClass("Text_red_13"),
                        new sap.m.Text({
                            text : "Premise"
                        })
                    ]
                }).addStyleClass("");
                
                var oPremiseCBox = IOMy.widgets.getPremiseSelector(me.createId("premiseBox")).addStyleClass("width100Percent SettingsDropdownInput")
//                oPremiseCBox.attachSelectionChange(function () {
//                    //================================================//
//                    // LOAD FLOOR OPTIONS AND SET CURRENT FLOOR COUNT //
//                    //================================================//
//                    me.odata.AjaxRequest({
//                        Url : me.odata.ODataLocation("premise_floors"),
//                        Columns : ["PREMISEFLOORS_PK", "PREMISEFLOORS_NAME"],
//                        WhereClause : [],
//                        OrderByClause : [],
//
//                        onSuccess : function (responseType, data) {
//                            var iMaxFloors;
//                            for (var i = 0; i < IOMy.common.PremiseList.length; i++) {
//                                if (IOMy.common.PremiseList[i].Id == me.byId("premiseBox").getSelectedKey()) {
//                                    iMaxFloors = IOMy.common.PremiseList[i].FloorCountId;
//                                    break;
//                                }
//                            }
//
//                            for (var i = 0; i < iMaxFloors; i++) {
//                                oFloorsField.addItem(
//                                    new sap.ui.core.Item({
//                                        text : data[i].PREMISEFLOORS_NAME,
//                                        key : data[i].PREMISEFLOORS_PK
//                                    })
//                                );
//                            }
//                            oFloorsField.setSelectedKey(data[0].PREMISEFLOORS_PK);
//                        },
//
//                        onFail : function (response) {
//                            jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
//                        }
//                    })
//                });
                
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
    		    
				var oRoomNameField = new sap.m.Input(me.createId("roomName"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oRoomDescTitle = new sap.m.Text({
    	        	text : "Description"
    	        }).addStyleClass("");
    		    
				var oRoomDescField = new sap.m.Input(me.createId("roomDesc"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oFloorsTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "* "
                        }).addStyleClass("Text_red_13"),
                        new sap.m.Text({
                            text : " Floor"
                        })
                    ]
                });
    		    
				var oFloorsField = new sap.m.ComboBox(me.createId("roomFloor"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
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
    		    
				var oRoomTypeField = new sap.m.ComboBox(me.createId("roomType"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
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
                            oRoomTypeField.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].ROOMTYPE_NAME,
                                    key : data[i].ROOMTYPE_PK
                                })
                            );
                        }
                        oRoomTypeField.setSelectedKey(data[0].ROOMTYPE_PK);
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
                    }
                });
                
				var oAddButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Add Room",
							press : function () {
								this.setEnabled(false);
								
								var sRoomText = me.byId("roomName").getValue();
                                var sRoomDesc = me.byId("roomDesc").getValue();
                                var iRoomTypeId = me.byId("roomType").getSelectedKey() !== null ? me.byId("roomType").getSelectedKey() : 7;
								
								var aErrorLog = [];
                                var bError = false;
								
                                if (sRoomText === "") {
                                    aErrorLog.push("Room must have a name");
                                    bError = true;
                                }
                                if (me.byId("premiseBox").getValue() === "" ||
                                    me.byId("premiseBox").getSelectedKey() === "") {
                                    
                                    if (me.byId("premiseBox").getValue() === "")
                                        aErrorLog.push("Premise must be specified.");
                                    else if (me.byId("premiseBox").getSelectedKey() === "")
                                        aErrorLog.push("Premise doesn't exist");
                                    
                                    bError = true;
                                }
//                                if (me.byId("roomFloor").getValue() === "") {
//                                    aErrorLog.push("Floor must be specified.");
//                                    bError = true;
//                                }
                                if (me.byId("roomType").getValue() === "" ||
                                    me.byId("roomType").getSelectedKey() === "") {
                                    
                                    if (me.byId("roomType").getValue() === "")
                                        aErrorLog.push("Room type must be specified.");
                                    else if (me.byId("roomType").getSelectedKey() === "")
                                        aErrorLog.push("Invalid room type");
                                    
                                    bError = true;
                                }
                                
                                if (bError === true) {
                                    jQuery.sap.log.error(aErrorLog.join("\n"));
                                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors");
                                } else {
                                    
                                    // Run the API to add the room
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("rooms"),
                                            data : {"Mode" : "AddRoom",
                                                    "PremiseId" : me.byId("premiseBox").getSelectedKey(),
                                                    "Name" : sRoomText, "Desc" : sRoomDesc, 
                                                    "Floor" : 1,//me.byId("roomFloor").getValue(),
                                                    "RoomTypeId" : iRoomTypeId/*me.byId("roomType").getSelectedKey()*/},
                                            onSuccess : function () {

                                                IOMy.common.showSuccess(sRoomText+" added successfully.", "Success", 
                                                function () {
                                                    //-- REFRESH ROOMS --//
                                                    IOMy.common.RetreiveRoomList( {
                                                        onSuccess: $.proxy(function() {
                                                            //-- REFRESH THINGS --//
                                                            IOMy.apiphp.RefreshSensorList({
                                                                onSuccess: $.proxy(function() {

                                                                    try {
                                                                        //-- Flag that the Core Variables have been configured --//
                                                                        IOMy.common.CoreVariablesInitialised = true;
                                                                        //-- Reset the Navigation array and index after switching users --//
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

                                            },
                                            onFail : function (response) {
                                                IOMy.common.showError("Update failed.", "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
                                            }
                                        });
                                    } catch (e00033) {
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
								this.setEnabled(true);
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
                
                if (me.byId("vbox_container") !== undefined)
                    me.byId("vbox_container").destroy();
                
                var oVertBox = new sap.m.VBox(me.createId("vbox_container"), {
					items : [oPremiseTitle, oPremiseCBox,
                            oRoomTitle, oRoomNameField, oRoomDescTitle, oRoomDescField,
                            /*oFloorsTitle, oFloorsField,*/ oRoomTypeTitle, oRoomTypeField,
                            oAddButton]
				});
                
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
        
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.premise.EditPremise
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.EditPremise
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.EditPremise
*/
//	onExit: function() {
//
//	}

});