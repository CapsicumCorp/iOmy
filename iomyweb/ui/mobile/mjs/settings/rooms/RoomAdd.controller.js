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
    
    wPremise            : null,
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
                me.DrawUI();
        
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
        //--------------------------//
        // Capture scope
        //--------------------------//
        var me = this;
        
        // Wipe main list container
        if (me.wPanel !== null) {
            me.wPanel.destroy();
        }
        
        // Clear the element list
        me.aElementsToDestroy = [];
    },
    
    DrawUI : function () {
        //-------------------------------------------------------------------//
        // Declare and initialise variables.
        //-------------------------------------------------------------------//
        var me                      = this;
        var thisView                = me.getView();
        var fnRoomTypesSelectBox    = IOMy.widgets.roomTypesSelectBox;
        var oPremiseTitle;
        var oRoomTitle;
        var oRoomDescTitle;
        var oRoomTypeTitle;
        var oAddButton;
        
        //-------------------------------------------------------------------//
        // Create Labels.
        //-------------------------------------------------------------------//
        oPremiseTitle = new sap.m.Text({
            text : "Premise"
        });

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
        me.wPremise = IOMy.widgets.getPremiseSelector(me.createId("premiseBox")).addStyleClass("width100Percent SettingsDropdownInput");

        me.wRoomName = new sap.m.Input(me.createId("roomName"), {
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");

        me.wRoomDescription = new sap.m.Input(me.createId("roomDesc"), {
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");

        me.wRoomType = fnRoomTypesSelectBox(me.createId("roomType")).addStyleClass("width100Percent SettingsDropdownInput");

        me.wUpdateButton = new sap.m.Link(me.createId("addButton"), {
            text : "Add Room",
            enabled : false,
            press : function () {
                var oThisButton = this; // Captures the scope of the link
                oThisButton.setEnabled(false);

                var sRoomText = me.wRoomName.getValue();
                var sRoomDesc = me.wRoomDescription.getValue();
                var iRoomTypeId = me.wRoomType.getSelectedKey();

                var aErrorLog = [];
                var bError = false;

                if (sRoomText === "") {
                    aErrorLog.push("Room must have a name");
                    bError = true;
                }

                if (bError === true) {
                    jQuery.sap.log.error(aErrorLog.join("\n"));
                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors",
                        function () {
                            oThisButton.setEnabled(true);
                        }
                    );
                    
                } else {
                    //----------------------------------------------------------//
                    // Run the API to add the room
                    //----------------------------------------------------------//
                    try {
                        IOMy.apiphp.AjaxRequest({
                            url : IOMy.apiphp.APILocation("rooms"),
                            data : {
                                "Mode" : "AddRoom",
                                "PremiseId" : me.wPremise.getSelectedKey(),
                                "Name" : sRoomText,
                                "Desc" : sRoomDesc, 
                                "Floor" : 1,
                                "RoomTypeId" : iRoomTypeId
                            },
                            
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
        }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink");
        
        oAddButton = new sap.m.VBox({
            items : [
                me.wUpdateButton
            ]
        }).addStyleClass("TextCenter MarTop12px");

        me.wMainBox = new sap.m.VBox({
            items : [oPremiseTitle, me.wPremise,
                    oRoomTitle, me.wRoomName, 
                    oRoomDescTitle, me.wRoomDescription,
                    /*oFloorsTitle, oFloorsField,*/
                    oRoomTypeTitle, me.wRoomType,
                    me.wUpdateButton]
        }).addStyleClass("UserInputForm");

        me.wPanel = new sap.m.Panel(me.createId("panel"), {
            backgroundDesign: "Transparent",
            content: [me.wMainBox] //-- End of Panel Content --//
        });

        thisView.byId("page").addContent(me.wPanel);

        // Load the user ID
        me.loadCurrentUserID();
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