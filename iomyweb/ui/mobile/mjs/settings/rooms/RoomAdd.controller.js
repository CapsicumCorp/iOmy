/*
Title: Add Room Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws the form that allows you to create a room in a premise.
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

sap.ui.controller("mjs.settings.rooms.RoomAdd", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
    userId : 0,
    aElementsToDestroy : [],
    
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
                
                me.DestroyUI();
				// Start rendering the page
				
//				me.functions.destroyItemsByIdFromView(me, [
//	                "premiseBox", "roomName", "roomDesc", "roomFloor", "roomType"
//	            ]);
				
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
                
                me.aElementsToDestroy.push("premiseBox");
                var oPremiseCBox = IOMy.widgets.getPremiseSelector(me.createId("premiseBox")).addStyleClass("width100Percent SettingsDropdownInput")
//                oPremiseCBox.attachChange(function () {
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
    		    
                me.aElementsToDestroy.push("roomName");
				var oRoomNameField = new sap.m.Input(me.createId("roomName"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oRoomDescTitle = new sap.m.Text({
    	        	text : "Description"
    	        }).addStyleClass("");
    		    
                me.aElementsToDestroy.push("roomDesc");
				var oRoomDescField = new sap.m.Input(me.createId("roomDesc"), {
					value : ""
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
    		    
                me.aElementsToDestroy.push("roomType");
				var oRoomTypeField = new sap.m.Select(me.createId("roomType"), {
                    width : "100%"
                }).addStyleClass("width100Percent SettingsDropdownInput");
                
                //==================================================//
                // LOAD ROOM TYPE OPTIONS
                //==================================================//
                for (var i = 0; i < IOMy.common.RoomTypes.length; i++) {
                    oRoomTypeField.addItem(
                        new sap.ui.core.Item({
                            text : IOMy.common.RoomTypes[i].RoomTypeName,
                            key : IOMy.common.RoomTypes[i].RoomTypeId
                        })
                    ).setSelectedKey(null);
                }
                
                me.aElementsToDestroy.push("addButton");
				var oAddButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("addButton"), {
							text : "Add Room",
                            enabled : false,
							press : function () {
                                var oThisButton = this; // Captures the scope of the link
								oThisButton.setEnabled(false);
								
								var sRoomText = me.byId("roomName").getValue();
                                var sRoomDesc = me.byId("roomDesc").getValue();
                                var iRoomTypeId = me.byId("roomType").getSelectedKey();
								
								var aErrorLog = [];
                                var bError = false;
								
                                if (sRoomText === "") {
                                    aErrorLog.push("Room must have a name");
                                    bError = true;
                                }
                                
                                if (bError === true) {
                                    jQuery.sap.log.error(aErrorLog.join("\n"));
                                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors");
                                } else {
                                    //----------------------------------------------------------//
                                    // Run the API to add the room
                                    //----------------------------------------------------------//
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("rooms"),
                                            data : {"Mode" : "AddRoom",
                                                    "PremiseId" : me.byId("premiseBox").getSelectedKey(),
                                                    "Name" : sRoomText, "Desc" : sRoomDesc, 
                                                    "Floor" : 1,//me.byId("roomFloor").getValue(),
                                                    "RoomTypeId" : iRoomTypeId/*me.byId("roomType").getSelectedKey()*/},
                                            onSuccess : function (responseType, roomData) {
                                                
                                                var iRoomId = roomData.Data.RoomId;
                                                
                                                //----------------------------------------------------------//
                                                // Run the API to give permission to the current user to
                                                // access it.
                                                //----------------------------------------------------------//
                                                IOMy.apiphp.AjaxRequest({
                                                    url : IOMy.apiphp.APILocation("permissions"),
                                                    data : {
                                                        "Mode" : "UpdateRoomPerms",
                                                        "UserId" : me.userId,
                                                        "RoomId" : iRoomId,
                                                        "Data" : "{\"Read\":1,\"DataRead\":1,\"Write\":1,\"StateToggle\":1}"
                                                    },

                                                    onSuccess : function (responseType, permData) {
                                                        var sErrMessage;
                                                        if (permData.Error === false) {
                                                            //--------------------------------------------//
                                                            // Show the success message and reload the core
                                                            // variables.
                                                            //--------------------------------------------//
                                                            IOMy.common.showSuccess(sRoomText+" added successfully.", "Success", 
                                                                function () {
                                                                    //-- REFRESH ROOMS --//
                                                                    IOMy.common.ReloadVariableRoomList( 
                                                                        function () {
                                                                            try {
                                                                                //-- Flag that the Core Variables have been configured --//
                                                                                IOMy.common.CoreVariablesInitialised = true;
                                                                                IOMy.common.NavigationChangePage("pPremiseOverview", {}, true);

                                                                            } catch(e654321) {
                                                                                //-- ERROR:  TODO: Write a better error message--//
                                                                                jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
                                                                            }
                                                                        }
                                                                    ); //-- END ROOMS LIST --//
                                                                },
                                                            "UpdateMessageBox");
                                                        } else {
                                                            sErrMessage = "There was an error updating the room permissions: "+permData.ErrMesg;
                                                            jQuery.sap.log.error(sErrMessage);
                                                            
                                                        }
                                                    },

                                                    onFail : function (response) {
                                                        var sErrMessage = "There was an error updating the room permissions: "+JSON.stringify(response);
                                                        jQuery.sap.log.error(sErrMessage);
                                                        IOMy.common.showError(sErrMessage, "Permissions Error");
                                                    }

                                                });

                                            },
                                            onFail : function (response) {
                                                IOMy.common.showError("Update failed.", "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
                                                //-- Enable this switch --//
                                                oThisButton.setEnabled(true);
                                            }
                                        });
                                    } catch (e00033) {
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
								
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
					]
				}).addStyleClass("TextCenter MarTop12px");
                
                if (me.byId("vbox_container") !== undefined) {
                    me.byId("vbox_container").destroy();
                }
                
                var oVertBox = new sap.m.VBox(me.createId("vbox_container"), {
					items : [oPremiseTitle, oPremiseCBox,
                            oRoomTitle, oRoomNameField, oRoomDescTitle, oRoomDescField,
                            /*oFloorsTitle, oFloorsField,*/ oRoomTypeTitle, oRoomTypeField,
                            oAddButton]
				}).addStyleClass("UserInputForm");
                
		    	// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("panel") !== undefined) {
					me.byId("panel").destroy();
                }
				
				var oPanel = new sap.m.Panel(me.createId("panel"), {
                    backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
                
		    	thisView.byId("page").addContent(oPanel);
                
                // Load the user ID
                me.loadCurrentUserID();
        
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
//	},

    DestroyUI : function () {
        var me = this;
        
        //-- Wipe out any elements with IDs that didn't get destroyed during the full wipe. --//
        for (var i = 0; i < me.aElementsToDestroy.length; i++) {
            if (me.byId(me.aElementsToDestroy[i]) !== undefined) {
                me.byId(me.aElementsToDestroy[i]).destroy();
            }
        }
        
        //-- Clear Arrays --//
        me.aElementsToDestroy = [];
    },
    
    loadCurrentUserID : function () {
		var me = this;
		
		IOMy.apiodata.AjaxRequest({
			Url: IOMy.apiodata.ODataLocation("users"),
			Columns : ["USERS_PK","USERSINFO_SURNAMES","USERSINFO_GIVENNAMES",
					"USERSINFO_DISPLAYNAME","USERSINFO_EMAIL","USERSINFO_PHONENUMBER",
                    "USERSGENDER_PK"],
			WhereClause : [],
			OrderByClause : [],
			
			onSuccess : function (responseType, data) {
				data = data[0];
                
                me.userId = data.USERS_PK;
                me.byId("addButton").setEnabled(true);
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error loading user information: "+JSON.stringify(response));
			}
		});
	}

});