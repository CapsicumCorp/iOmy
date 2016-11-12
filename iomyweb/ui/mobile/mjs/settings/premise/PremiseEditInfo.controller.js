/*
Title: Edit Premise Information Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit information about a given
    premise.
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
                
                var oOccupantsTitle = new sap.m.Text({
                    text : "Occupants"
                });
    		    
				var oOccupantsField = new sap.m.ComboBox(me.createId("premiseOccupants"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oBedroomsTitle = new sap.m.Text({
                    text : "Bedrooms"
                });
    		    
				var oBedroomsField = new sap.m.ComboBox(me.createId("premiseBedrooms"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oCol1 = new sap.m.VBox({
                    items : [oOccupantsTitle,oOccupantsField,
                            oBedroomsTitle,oBedroomsField]
                }).addStyleClass("PadRight5px width50Percent");
                
                var oFloorsTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "*"
                        }).addStyleClass("Text_red_13 PadRight5px"),
                        new sap.m.Text({
                            text : "Floors"
                        })
                    ]
                });
    		    
				var oFloorsField = new sap.m.ComboBox(me.createId("premiseFloors"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oRoomsTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "*"
                        }).addStyleClass("Text_red_13 PadRight5px"),
                        new sap.m.Text({
                            text : "Rooms"
                        })
                    ]
                });
    		    
				var oRoomsField = new sap.m.ComboBox(me.createId("premiseRooms"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oCol2 = new sap.m.VBox({
                    items : [oFloorsTitle,oFloorsField,
                            oRoomsTitle,oRoomsField]
                }).addStyleClass("width50Percent");
                
                var oCBoxGrid = new sap.m.HBox({
                    items : [oCol1, oCol2]
                });
                
                //======================================================//
                // LOAD OCCUPANT OPTIONS AND SET CURRENT OCCUPANT COUNT //
                //======================================================//
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("premise_occupants"),
                    Columns : ["PREMISEOCCUPANTS_PK", "PREMISEOCCUPANTS_NAME"],
                    WhereClause : [],
                    OrderByClause : [],
                    
                    onSuccess : function (responseType, data) {
                        for (var i = 0; i < data.length; i++) {
                            oOccupantsField.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].PREMISEOCCUPANTS_NAME,
                                    key : data[i].PREMISEOCCUPANTS_PK
                                })
                            );
                        }
                        oOccupantsField.setSelectedKey(aPremise.OccupantCountId);
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading premise occupant count OData: "+JSON.stringify(response));
                    }
                });
                
                //====================================================//
                // LOAD BEDROOM OPTIONS AND SET CURRENT BEDROOM COUNT //
                //====================================================//
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("premise_bedrooms"),
                    Columns : ["PREMISEBEDROOMS_PK", "PREMISEBEDROOMS_COUNT"],
                    WhereClause : [],
                    OrderByClause : [],
                    
                    onSuccess : function (responseType, data) {
                        for (var i = 0; i < data.length; i++) {
                            oBedroomsField.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].PREMISEBEDROOMS_COUNT,
                                    key : data[i].PREMISEBEDROOMS_PK
                                })
                            );
                        }
                        oBedroomsField.setSelectedKey(aPremise.BedroomCountId);
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading premise bedroom count OData: "+JSON.stringify(response));
                    }
                });
                
                //================================================//
                // LOAD FLOOR OPTIONS AND SET CURRENT FLOOR COUNT //
                //================================================//
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("premise_floors"),
                    Columns : ["PREMISEFLOORS_PK", "PREMISEFLOORS_NAME"],
                    WhereClause : [],
                    OrderByClause : [],
                    
                    onSuccess : function (responseType, data) {
                        for (var i = 0; i < data.length; i++) {
                            oFloorsField.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].PREMISEFLOORS_NAME,
                                    key : data[i].PREMISEFLOORS_PK
                                })
                            );
                        }
                        oFloorsField.setSelectedKey(aPremise.FloorCountId);
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading premise floor count OData: "+JSON.stringify(response));
                    }
                });
                
                //==============================================//
                // LOAD ROOM OPTIONS AND SET CURRENT ROOM COUNT //
                //==============================================//
                me.odata.AjaxRequest({
                    Url : me.odata.ODataLocation("premise_rooms"),
                    Columns : ["PREMISEROOMS_PK", "PREMISEROOMS_NAME"],
                    WhereClause : [],
                    OrderByClause : [],
                    
                    onSuccess : function (responseType, data) {
                        for (var i = 0; i < data.length; i++) {
                            oRoomsField.addItem(
                                new sap.ui.core.Item({
                                    text : data[i].PREMISEROOMS_NAME,
                                    key : data[i].PREMISEROOMS_PK
                                })
                            );
                        }
                        oRoomsField.setSelectedKey(aPremise.RoomCountId);
                    },
                    
                    onFail : function (response) {
                        jQuery.sap.log.error("Error loading premise room count OData: "+JSON.stringify(response));
                    }
                });
				
                //===========================//
                // CREATE EDIT/UPDATE BUTTON //
                //===========================//
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Update",
							press : function () {
								this.setEnabled(false); // Lock button
								
								var sPremiseText = me.byId("premiseField").getValue();
                                var bError = false;
                                var aErrorLog = [];
                                
                                // Check that the required fields are valid.
                                if (me.byId("premiseRooms").getSelectedKey() === "") {
                                    aErrorLog.push("Number of rooms must be specified in the combo box.");
                                    bError = true;
                                }
                                if (me.byId("premiseFloors").getSelectedKey() === "") {
                                    aErrorLog.push("Number of floors must be specified in the combo box.");
                                    bError = true;
                                }
                                if (me.byId("premiseBedrooms").getSelectedKey() === "") {
                                    aErrorLog.push("Number of bedrooms must be specified in the combo box.");
                                    bError = true;
                                }
                                if (me.byId("premiseOccupants").getSelectedKey() === "") {
                                    aErrorLog.push("Number of occupants must be specified in the combo box.");
                                    bError = true;
                                }
                                if (sPremiseText === "") {
                                    aErrorLog.push("Premise must have a name");
                                    bError = true;
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
                                                                IOMy.common.PremiseSelected.FloorCountId = me.byId("premiseFloors").getSelectedKey();
                                                                IOMy.common.PremiseSelected.RoomCountId = me.byId("premiseRooms").getSelectedKey();
                                                                IOMy.common.PremiseSelected.BedroomCountId = me.byId("premiseBedrooms").getSelectedKey();
                                                                IOMy.common.PremiseSelected.OccupantCountId = me.byId("premiseOccupants").getSelectedKey();

                                                                IOMy.common.PremiseSelected.FloorCount = me.byId("premiseFloors").getValue();
                                                                IOMy.common.PremiseSelected.RoomCount = me.byId("premiseRooms").getValue();
                                                                IOMy.common.PremiseSelected.BedroomCount = me.byId("premiseBedrooms").getValue();
                                                                IOMy.common.PremiseSelected.OccupantCount = me.byId("premiseOccupants").getValue();

                                                                IOMy.common.showSuccess("Update successful.", "Success", 
                                                                function () {
                                                                    //-- REFRESH PREMISES --//
                                                                    IOMy.common.RefreshPremiseList({
                                                                        onSuccess: $.proxy(function() {

                                                                            IOMy.common.CoreVariablesInitialised = true;
                                                                            
                                                                            try {
                                                                                var viewPremiseList = oApp.getPage("pSettingsPremiseList");
                                                                                var controllerPremiseList = viewPremiseList.getController();
                                                                                
                                                                                controllerPremiseList.bInitialised = false;
                                                                                //controllerPremiseList.RedrawSettingsPremiseList(controllerPremiseList, viewPremiseList);
                                                                            } catch (e) {
                                                                                jQuery.sap.log.error("Error reloading Premise List: "+e.message);
                                                                            }
                                                                            
                                                                            IOMy.common.NavigationTriggerBackForward(false);
                                                                            
                                                                        }, me)
                                                                    }); //-- END PREMISE LIST --//
                                                                }, "UpdateMessageBox");
                                                            }
                                                        });
                                                    }
                                                });
                                            },
                                            onFail : function (response) {
                                                // There's something wrong in either the code or the
                                                // parameters parsed.
                                                IOMy.common.showError("Update failed.", "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
                                            }
                                        });
                                    } catch (e00033) {
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
                                
								this.setEnabled(true); // Unlock button
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
                
                var oVertBox = new sap.m.VBox({
					items : [oPremiseTitle, oPremiseNameField, oPremiseDescTitle, oPremiseDescField,
                            oCBoxGrid, oEditButton]
				}).addStyleClass("UserInputForm");
                
		    	// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("panel") !== undefined)
					me.byId("panel").destroy();
    		    
    		    var oPanel = new sap.m.Panel(me.createId("panel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				}).addStyleClass("PanelNoTopPadding");
				
				thisView.byId("page").addContent(oPanel);
                
                // Create the extras menu for the Premise Edit Info page.
                thisView.byId("extrasMenuHolder").addItem(
                    IOMy.widgets.getExtrasButton({
                        id : me.createId("extrasMenu"),        // Uses the page ID
                        icon : "sap-icon://GoogleMaterial/more_vert",
                        items : [
                            {
                                text: "Edit Address",
                                select:	function (oControlEvent) {
                                    oApp.to("pSettingsPremiseAddress", {premise : IOMy.common.PremiseSelected})
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

});