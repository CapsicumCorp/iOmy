/*
Title: Edit Link Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given link.
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

sap.ui.controller("mjs.settings.devices.EditLink", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
    
    linkID : null,
    
    wRoomCBox : null,
    wPremiseCBox : null,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.devices.EditLink
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
				var oLink = evt.data.link;
				var sLinkName = oLink.LinkName;
                me.linkID = oLink.LinkId;
				
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, ["linkField", "premiseCBox", "roomCBox"]);
                
                var oLinkTitle = new sap.m.Text({
                    text : "Name",
                    textAlign : "Center"
                });
    		    
				var oLinkNameField = new sap.m.Input(me.createId("linkField"), {
					value : sLinkName
				}).addStyleClass("SettingsTextInput width100Percent");
                
                //-------------------------------------------------------//
                // PREMISE COMBO BOX
                //-------------------------------------------------------//
                var oPremiseLabel = new sap.m.Label({
                    text : "Premise you wish to place this link in"
                });

                me.wPremiseCBox = IOMy.widgets.getPremiseSelector(me.createId("premiseCBox")).addStyleClass("width100Percent SettingsDropDownInput");
                me.wPremiseCBox.setSelectedKey(oLink.PremiseId);
                me.wPremiseCBox.attachChange(
                    function () {
                        // Refresh the room select box.
                        me.wRoomCBox.destroy();
                        me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_"+me.wPremiseCBox.getSelectedKey()).addStyleClass("width100Percent SettingsDropDownInput");
                        me.wRoomCBox.setSelectedKey(null);
                        me.wRoomCBoxHolder.addItem(me.wRoomCBox);
                    }
                );
                
                //-------------------------------------------------------//
                // ROOM COMBO BOX
                //-------------------------------------------------------//
                var oRoomLabel = new sap.m.Label({
                    text : "Room you wish to place this link in"
                });

                me.wRoomCBox = IOMy.widgets.getRoomSelector(me.createId("roomCBox"), "_"+me.wPremiseCBox.getSelectedKey()).addStyleClass("width100Percent SettingsDropDownInput");
                me.wRoomCBox.setSelectedKey(oLink.LinkRoomId);

                me.wRoomCBoxHolder = new sap.m.VBox({
                    items : [me.wRoomCBox]
                }).addStyleClass("width100Percent");
				
				//============================================================//
                // Create the Update/Edit Button.                             //
                //============================================================//
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Update",
							press : function () {
								var thisButton = this; // Captures the scope of the calling button.
                                thisButton.setEnabled(false);
								
								var sText = me.byId("linkField").getValue();
								var iID = me.linkID;
								
                                //==========================================================//
                                // Check that the name field is filled out.
                                //==========================================================//
                                if (sText === "") {
                                    // NO NAME SPECIFIED. SHOW AN ERROR DIALOG
                                    jQuery.sap.log.error("Link must have a name");
                                    IOMy.common.showError("Link must have a name", "Error");
                                } else {
                                    // Run the API to update the link name
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("link"),
                                            data : {"Mode" : "EditName", "Id" : iID, "Name" : sText},
                                            onSuccess : function () {
                                                //-- REFRESH LINK LIST --//
                                                IOMy.common.ReloadVariableLinkList(
                                                    function () {
                                                        IOMy.common.showSuccess("Update successful.", "Success", 
                                                        function () {
                                                            IOMy.devices.AssignLinkToRoom(iID, me.wRoomCBox.getSelectedKey(), oLink.LinkTypeName,
                                                                function () {

                                                                    // Take the user to the link list settings page.
                                                                    IOMy.common.NavigationChangePage("pSettingsDeviceList", {}, true);

                                                                }
                                                            );
                                                        }, "UpdateMessageBox");
                                                    }
                                                );
                                            },
                                            onFail : function (err) {
                                                //IOMy.common.showError("Update failed.", "Error");
                                                IOMy.common.showError(JSON.stringify(err.responseText), "Error");
                                                // Finish the request by enabling the edit button
                                                this.onComplete();
                                            },
                                            
                                            onComplete : function () {
                                                //------------------------------------------------------------------------------------------//
                                                // Re-enable the button once the request and the callback functions have finished executing.
                                                //------------------------------------------------------------------------------------------//
                                                thisButton.setEnabled(true);
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
        		
				var oVertBox = new sap.m.VBox(me.makeId("vbox"), {
					items : [
                        oLinkTitle, oLinkNameField,
                        oPremiseLabel, me.wPremiseCBox,
                        oRoomLabel, me.wRoomCBoxHolder,
                        oEditButton
                    ]
				}).addStyleClass("UserInputForm");
    		    
		    	var oPanel = new sap.m.Panel(me.makeId("panel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
				
				thisView.byId("page").addContent(oPanel);
			}
		});
	},
    
    makeId : function (sId) {
        var me = this;
        
        if (me.byId(sId) !== undefined)
            me.byId(sId).destroy();
        
        return me.createId(sId);
    },

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.devices.EditLink
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.devices.EditLink
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.devices.EditLink
*/
//	onExit: function() {
//
//	}

});