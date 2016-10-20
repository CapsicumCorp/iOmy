/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.premise.PremiseViewInfo", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.PremiseViewInfo
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
				var iPremiseID = aPremise.Id;
				var sPremiseName = aPremise.Name;
				var sPremiseDesc = aPremise.Desc;
				
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, [
	                "premiseID", "premiseField", "premiseDesc", "premiseOccupants",
                    "premiseBedrooms", "premiseFloors", "premiseRooms"
	            ]);
				
				var oPremiseTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "*"
                        }).addStyleClass("Text_red_13 PadRight5px"),
                        new sap.m.Text({
                            text : "Name"
                        })
                    ]
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
                
                var oOccupantsTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "*"
                        }).addStyleClass("Text_red_13 PadRight5px"),
                        new sap.m.Text({
                            text : "Occupants"
                        })
                    ]
                });
    		    
				var oOccupantsField = new sap.m.ComboBox(me.createId("premiseOccupants"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oBedroomsTitle = new sap.m.HBox({
                    items : [
                        new sap.m.Text({
                            text : "*"
                        }).addStyleClass("Text_red_13 PadRight5px"),
                        new sap.m.Text({
                            text : "Bedrooms"
                        })
                    ]
                });
    		    
				var oBedroomsField = new sap.m.ComboBox(me.createId("premiseBedrooms"), {
					value : ""
				}).addStyleClass("width100Percent SettingsDropdownInput");
                
                var oCol1 = new sap.m.VBox({
                    items : [oOccupantsTitle,oOccupantsField,
                            oBedroomsTitle,oBedroomsField]
                }).addStyleClass("PadRight5px");
                
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
                }).addStyleClass("");
                
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
				
				//Premise ID
				// HIDDEN field, won't be rendered.
				new sap.m.Label(me.createId("premiseID"), {
					text : iPremiseID
				});
				
                var oVertBox = new sap.m.VBox({
					items : [oPremiseTitle, oPremiseNameField, oPremiseDescTitle, oPremiseDescField,
                            oCBoxGrid]
				});
                
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
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.premise.PremiseViewInfo
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.PremiseViewInfo
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.PremiseViewInfo
*/
//	onExit: function() {
//
//	}

});