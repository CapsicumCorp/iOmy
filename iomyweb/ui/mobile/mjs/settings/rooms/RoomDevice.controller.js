/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.rooms.RoomDevice", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    api : IOMy.apiphp,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.rooms.RoomDevice
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
				var aDeviceData = evt.data.device;
                
                thisView.byId("NavSubHead_Title").setText(aDeviceData.DeviceName);
				
                if (me.byId("deviceId") !== undefined)
                    me.byId("deviceId").destroy();
                new sap.m.Text(me.createId("deviceId"), {
                    text : aDeviceData.DeviceId
                });
                // Start rendering the page
                
                var oSelectTitle = new sap.m.Text({
                    text : "Select the room that the device is located."
                }).addStyleClass("MarTop8px");
                
                var oUpdateButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
                            text : "Update",
                            press : function () {
                                var iRoomId = sap.ui.getCore().byId("getRoomSelector--CBox").getSelectedKey();
                                var sRoomName = sap.ui.getCore().byId("getRoomSelector--CBox").getValue();
                                        
                                if (iRoomId === "" || sRoomName === "") {
                                    if (iRoomId === "" && sRoomName === "") {
                                        jQuery.sap.log.error("Room must be specified.");
                                        IOMy.common.showError("Room must be specified.", "Error");
                                    } else {
                                        jQuery.sap.log.error("Room doesn't exist.");
                                        IOMy.common.showError("Room doesn't exist.", "Error");
                                    }
                                } else {
                                
                                    me.api.AjaxRequest({
                                        url : me.api.APILocation("io"),
                                        data : {"Mode" : "ChooseRoom", "RoomId" : iRoomId, "Id" : me.byId("deviceId").getText()},

                                        onSuccess : function () {
                                            IOMy.common.showSuccess("Update successful.", "Success", 
                                            function () {
                                                //-- REFRESH ROOMS --//
                                                IOMy.common.RetreiveRoomList( {
                                                    onSuccess: $.proxy(function() {
                                                        //-- REFRESH SENSORS --//
                                                        IOMy.apiphp.RefreshSensorList({
                                                            onSuccess: $.proxy(function() {
                                                                oApp.getPage("pRoomsOverview").getController().dLastAjaxUpdate = null;

                                                                try {
                                                                    //-- Flag that the Core Variables have been configured --//
                                                                    IOMy.common.CoreVariablesInitialised = true;

                                                                    IOMy.common.NavigationTriggerBackForward(false);

                                                                } catch(e654321) {
                                                                    //-- ERROR:  TODO: Write a better error message--//
                                                                    jQuery.sap.log.error(">>>>Critical Error Loading Room List.<<<<\n"+e654321.message);
                                                                }
                                                            }, me)
                                                        }); //-- END SENSORS LIST --//
                                                    }, me)
                                                }); //-- END ROOMS LIST --//
                                            }, "UpdateMessageBox");
                                        },

                                        onFail : function (error) {
                                            jQuery.sap.log.error("There was an error updating the device location.\n\n"+error.message);
                                            IOMy.common.showError("There was an error updating the device location.\n\n"+error.message, "Error")
                                        }
                                    });
                                }
                            }
                        }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
				
                var oVertBox = new sap.m.VBox({
                    items : [oSelectTitle, IOMy.widgets.getRoomSelector(1, aDeviceData.RoomId), oUpdateButton]
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
                
                //thisView.byId("page").addContent(oRequiredNotice);
		    	thisView.byId("page").addContent(oPanel);
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.rooms.RoomDevice
*/
//	onBeforeRendering: function() {
//        
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.rooms.RoomDevice
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.rooms.RoomDevice
*/
//	onExit: function() {
//
//	}

});