/*
Title: Edit Premise Information Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given
    premise.
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

sap.ui.controller("mjs.settings.premise.PremiseEditInfo", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
    PremiseID : 0,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.PremiseEditInfo
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
				var aPremise = IOMy.common.PremiseSelected;
				var sPremiseName = aPremise.Name;
				var sPremiseDesc = aPremise.Desc;
                me.PremiseID = aPremise.Id;
				
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, [
	                "premiseField", "premiseDesc", "premiseOccupants",
                    "premiseBedrooms", "premiseFloors", "premiseRooms"
	            ]);
				
				var oPremiseTitle = new sap.m.Text({
                    text : "Name"
                }).addStyleClass("MarTop16px");
    		    
				var oPremiseNameField = new sap.m.Input(me.createId("premiseField"), {
					value : sPremiseName
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oPremiseDescTitle = new sap.m.Text({
    	        	text : "Description"
    	        }).addStyleClass("");
    		    
				var oPremiseDescField = new sap.m.Input(me.createId("premiseDesc"), {
					value : sPremiseDesc
				}).addStyleClass("width100Percent SettingsTextInput");
                
                var oBedroomsTitle = new sap.m.Text({
                    text : "Bedrooms"
                });
    		    
				var oBedroomsField = IOMy.widgets.selectBoxPremiseBedroomCount(me.createId("premiseBedrooms")).addStyleClass("width100Percent SettingsDropdownInput");
                oBedroomsField.setSelectedKey(aPremise.BedroomCountId);
                
                var oOccupantsTitle = new sap.m.Text({
                    text : "Occupants"
                });
    		    
				var oOccupantsField = IOMy.widgets.selectBoxPremiseOccupantCount(me.createId("premiseOccupants")).addStyleClass("width100Percent SettingsDropdownInput");
                oOccupantsField.setSelectedKey(aPremise.OccupantCountId);
                
                var oNumberOfUsersLabel = new sap.m.Text(me.createId("numberOfUsers"), {
                    text : "Finding number of users in the premise."
                });
                
                var oCol1 = new sap.m.VBox({
                    items : [
                        oBedroomsTitle,oBedroomsField,
                        oOccupantsTitle,oOccupantsField,
                        oNumberOfUsersLabel
                    ]
                }).addStyleClass("PadRight5px width50Percent");
                
                var oFloorsTitle = new sap.m.Text({
                    text : "Floors"
                });
    		    
				var oFloorsField = IOMy.widgets.selectBoxPremiseFloorCount(me.createId("premiseFloors")).addStyleClass("width100Percent SettingsDropdownInput");
                oFloorsField.setSelectedKey(aPremise.FloorCountId);
                
                var oRoomsTitle = new sap.m.Text({
                    text : "Rooms"
                });
    		    
				var oRoomsField = IOMy.widgets.selectBoxPremiseRoomCount(me.createId("premiseRooms")).addStyleClass("width100Percent SettingsDropdownInput");
                oRoomsField.setSelectedKey(aPremise.RoomCountId);
                
                var oNumberOfRoomsLabel = new sap.m.Text({
                    text : IOMy.functions.getNumberOfRoomsInPremise(me.PremiseID)+" rooms configured in "+sPremiseName+"."
                });
                
                var oCol2 = new sap.m.VBox({
                    items : [
                        oFloorsTitle,oFloorsField,
                        oRoomsTitle,oRoomsField,
                        oNumberOfRoomsLabel
                    ]
                }).addStyleClass("width50Percent");
                
                var oCBoxGrid = new sap.m.HBox({
                    items : [oCol1, oCol2]
                });
				
                //===========================//
                // CREATE EDIT/UPDATE BUTTON //
                //===========================//
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Update",
							press : function () {
                                var thisButton = this; // Captures the scope of the button calling this function.
								thisButton.setEnabled(false); // Lock button
								IOMy.common.NavigationToggleNavButtons(me, false);
								
								var sPremiseText = me.byId("premiseField").getValue();
                                var bError = false;
                                var aErrorLog = [];
                                
                                if (sPremiseText === "") {
                                    bError = true;
                                    aErrorLog.push("Premise must have a name.");
                                }
                                
                                if (bError === true) {
                                    // One or more errors were found in the form. DO NOT PROCEED.
                                    jQuery.sap.log.error(aErrorLog.join("\n"));
                                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors");
                                } else {
                                
                                    var sPremiseDesc = me.byId("premiseDesc").getValue();

                                    // Run the API to update the premise information
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("premises"),
                                            data : {"Mode" : "EditName", "Id" : me.PremiseID, "Name" : sPremiseText},
                                            onSuccess : function () {
                                                var requestParameters = this;

                                                IOMy.common.PremiseSelected.Name = sPremiseText;

                                                IOMy.apiphp.AjaxRequest({
                                                    url : IOMy.apiphp.APILocation("premises"),
                                                    data : {"Mode" : "EditDesc", "Id" : me.PremiseID, "Desc" : sPremiseDesc},
                                                    onSuccess : function () {

                                                        IOMy.common.PremiseSelected.Desc = sPremiseDesc;

                                                        IOMy.apiphp.AjaxRequest({
                                                            url : IOMy.apiphp.APILocation("premises"),
                                                            data : {
                                                                "Mode" : "EditPremiseInfo", "Id" : me.PremiseID, 
                                                                "PremiseInfoOccupants" : me.byId("premiseOccupants").getSelectedKey(),
                                                                "PremiseInfoBedrooms" : me.byId("premiseBedrooms").getSelectedKey(),
                                                                "PremiseInfoFloors" : me.byId("premiseFloors").getSelectedKey(),
                                                                "PremiseInfoRooms" : me.byId("premiseRooms").getSelectedKey()
                                                            },
                                                            
                                                            onSuccess : function () {

																//-- REFRESH PREMISES --//
																IOMy.common.RefreshCoreVariables({
																	onSuccess : function() {

																		IOMy.common.CoreVariablesInitialised = true;

																		IOMy.common.showMessage({
																			text : "Premise has been updated successfully.",
																			view : thisView
																		});

																		IOMy.common.NavigationToggleNavButtons(me, true);
																		IOMy.common.NavigationTriggerBackForward();

																	}
																});
                                                                
                                                            },
                                                            
                                                            onFail : function (response) {
                                                                // There's something wrong in either the code or the
                                                                // parameters parsed.
                                                                //IOMy.common.showError("Update failed.", "Error");
                                                                IOMy.common.showError(response.responseText, "Error");
                                                                jQuery.sap.log.error(JSON.stringify(response));
                                                                
                                                                requestParameters.onComplete(); // Unlock the button
                                                            }
                                                        });
                                                    },
                                                    
                                                    onFail : function (response) {
                                                        // There's something wrong in either the code or the
                                                        // parameters parsed.
                                                        //IOMy.common.showError("Update failed.", "Error");
                                                        IOMy.common.showError(response.responseText, "Error");
                                                        jQuery.sap.log.error(JSON.stringify(response));

                                                        requestParameters.onComplete(); // Unlock the button
                                                    }
                                                });
                                            },
                                            onFail : function (response) {
                                                // There's something wrong in either the code or the
                                                // parameters parsed.
                                                //IOMy.common.showError("Update failed.", "Error");
                                                IOMy.common.showError(response.responseText, "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
                                                
                                                this.onComplete();
                                            },
                                            
                                            onComplete : function () {
                                                thisButton.setEnabled(true); // Unlock button
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
					items : [oPremiseTitle, oPremiseNameField, oPremiseDescTitle, oPremiseDescField,
                            oCBoxGrid, oEditButton]
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
				}).addStyleClass("PanelNoTopPadding");
				
				thisView.byId("page").addContent(oPanel);
                
                me.fetchNumberOfUsersForPremise();
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.premise.PremiseEditInfo
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.PremiseEditInfo
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.PremiseEditInfo
*/
//	onExit: function() {
//
//	}

    fetchNumberOfUsersForPremise : function () {
        var me      = this;
        var sUrl    = IOMy.apiphp.APILocation("permissions");
        
        IOMy.apiphp.AjaxRequest({
            url : sUrl,
            data : {
                "Mode" : "LookupUsersForPremisePerms",
                "PremiseId" : me.PremiseID
            },
            
            onSuccess : function (responseType, data) {
                //------------------------------------------------------------//
                // Display the the number of users, or an error message.
                //------------------------------------------------------------//
                if (data.Error === false) {
                    var iNumOfUsers = data.Data.length;
                    var sMessage;
                    
                    if (iNumOfUsers === 0) {
                        sMessage = "No one can access this premise.";
                    } else if (iNumOfUsers === 1) {
                        sMessage = iNumOfUsers+" user can access this premise.";
                    } else {
                        sMessage = iNumOfUsers+" users can access this premise.";
                    }
                    
                    me.byId("numberOfUsers").setText(sMessage);
                    
                } else {
                    var sErrorMessage = "There was an error accessing the list of users: "+data.ErrMesg;
                    me.byId("numberOfUsers").setText("Failed to find the number of users.");
                    
                    jQuery.sap.log.error(sErrorMessage);
                }
            },
            
            onFail : function (response) {
                var sErrorMessage = "There was an error accessing the list of users: "+JSON.stringify(response);
                me.byId("numberOfUsers").setText("Failed to find the number of users.");
                
                jQuery.sap.log.error(sErrorMessage);
            }
        });
    }

});