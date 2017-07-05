/*
Title: Edit Hub Information Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given hub.
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

sap.ui.controller("mjs.settings.premise.PremiseEditHub", {
	api : IOMy.apiphp,
	functions : IOMy.functions,
    
    hubID : 0,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.PremiseEditHub
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
                var aHub = evt.data.hub;
                var iID = aHub.HubId;
                var sName = aHub.HubName;
				// Start rendering the page
				me.functions.destroyItemsByIdFromView(me, [
	                "hubID", "hubField"
	            ]);
                
                var oHubTitle = new sap.m.Text({
                    text : " Name",
                    textAlign : "Center"
                });
    		    
				var oHubNameField = new sap.m.Input(me.createId("hubField"), {
					value : sName
				}).addStyleClass("width100Percent SettingsTextInput");
				
				// Hub ID
				me.hubID = iID;
				
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Update",
                            press : function () {
                                var thisButton = this;
								thisButton.setEnabled(false);
								IOMy.common.NavigationToggleNavButtons(me, false);
								
								var sHubText = me.byId("hubField").getValue();
								var iHubID = me.hubID;
								
                                if (sHubText === "") {
                                    jQuery.sap.log.error("Hub must have a name");
                                    IOMy.common.showError("Hub must have a name", "Error");
                                } else {
                                    // Run the API to update the name of the hub
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("hubs"),
                                            data : {"Mode" : "EditName", "Id" : iHubID, "Name" : sHubText},
                                            onSuccess : function () {
                                                
                                                IOMy.common.RefreshCoreVariables({
                                                    onSuccess: function () {
                                                        IOMy.common.showMessage({
															text : "Hub successfully updated.",
															view : thisView
														});

														IOMy.common.NavigationToggleNavButtons(me, true);
														IOMy.common.NavigationTriggerBackForward();
                                                    }
												});
                                            },
                                            onFail : function (response) {
                                                IOMy.common.showError(response.responseText, "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
                                                this.onComplete();
                                            },
                                            
                                            onComplete : function () {
                                                thisButton.setEnabled(true);
												IOMy.common.NavigationToggleNavButtons(me, true);
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
        		
				var oVertBox = new sap.m.VBox({
					items : [oHubTitle, oHubNameField, oEditButton]
				}).addStyleClass("UserInputForm");
    		    
		    	// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("hubPanel") !== undefined)
					me.byId("hubPanel").destroy();
    		    
    		    var oPanel = new sap.m.Panel(me.createId("hubPanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
				
				thisView.byId("page").addContent(oPanel);
                
//                thisView.byId("extrasMenuHolder").addItem(
//                    IOMy.widgets.getActionMenu({
//                        id : me.createId("extrasMenu"),        // Uses the page ID
//                        icon : "sap-icon://GoogleMaterial/more_vert",
//                        items : [
//                            {
//                                // TODO: Make the delete hub function
//                                text: "Delete "+sName,
//                            }
//                        ]
//                    })
//                );
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.premise.PremiseEditHub
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.PremiseEditHub
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.PremiseEditHub
*/
//	onExit: function() {
//
//	}

});