/**
 * Copyright (c) 2015 - 2016, Capsicum Corporation Pty. Ltd.
 */

sap.ui.controller("mjs.settings.premise.Premise", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.Premise
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
                IOMy.common.PremiseSelected = evt.data.premise;
				var aPremise = IOMy.common.PremiseSelected;
				var sPremiseName = aPremise.Name;
				var sPremiseDesc = aPremise.Desc;
				
				// Start rendering the page
				var oPremiseTitle = new sap.m.Text({
    	        	text : sPremiseName
    	        }).addStyleClass("TextLeft");
    		    
				var oOccupantsTitle = new sap.m.Text({
    	        	text : aPremise.OccupantCount+" Occupants"
    	        }).addStyleClass("TextLeft");
    		    
				var oBedroomsTitle = new sap.m.Text({
    	        	text : aPremise.BedroomCount+" Bedrooms"
    	        }).addStyleClass("TextLeft");
    		    
				var oFloorsTitle = new sap.m.Text({
    	        	text : aPremise.FloorCount+" Floors"
    	        }).addStyleClass("TextLeft");
    		    
				var oRoomsTitle = new sap.m.Text({
    	        	text : aPremise.RoomCount+" Rooms"
    	        }).addStyleClass("TextLeft");
    		    
				var oPremiseDescTitle = new sap.m.Text({
    	        	text : "Description:"
    	        }).addStyleClass("TextLeft MarTop20px");
                
                var oPremiseDescription = new sap.m.Label({
    	        	text : sPremiseDesc
    	        }).addStyleClass("TextLeft");
                
                var oCol1 = new sap.m.VBox({
                    items : [
                        oPremiseTitle, oOccupantsTitle, oBedroomsTitle,
                        oFloorsTitle, oRoomsTitle, oPremiseDescTitle,
                        oPremiseDescription
                    ]
                }).addStyleClass("width100Percent");
                var oCol2 = new sap.m.VBox({}).addStyleClass("TextCenter MarAll12px MarTop0px width140px MarRight20px");
                
                var oVertBox = new sap.m.VBox({
					items : [
                        new sap.m.HBox({
                            items : [oCol1, oCol2]
                        })
                    ]
				});
                
                if (aPremise.PermWrite === 1) {
                    oCol2.addItem(
                        new sap.m.VBox({
                            items : [
                                new sap.m.Link({
                                    text: "Edit Information",
                                    press : function () {
                                        IOMy.common.NavigationChangePage("pSettingsPremiseInfo", {});
                                    }
                                }).addStyleClass("SettingsLinks width25Percent minwidth150px AcceptSubmitButton TextCenter MarTop5px")
                            ]
                        })
                    );
            
                    oCol2.addItem(
                        new sap.m.VBox({
                            items : [
                                new sap.m.Link({
                                    text: "Edit Address",
                                    press : function () {
                                        IOMy.common.NavigationChangePage("pSettingsPremiseAddress", {premise : aPremise});
                                    }
                                }).addStyleClass("SettingsLinks width25Percent minwidth150px AcceptSubmitButton TextCenter MarTop5px")
                            ]
                        })
                    );
                    
//                    if (aPremise.PermOwner === 1) {
//                        oCol2.addItem(
//                            new sap.m.VBox({
//                                items : [
//                                    new sap.m.Link({
//                                        text: "Edit Permissions",
//                                        press : function () {
//                                            IOMy.common.NavigationChangePage("pSettingsPremisePermissions", {premise : aPremise});
//                                        }
//                                    }).addStyleClass("SettingsLinks width25Percent minwidth150px AcceptSubmitButton TextCenter MarTop5px")
//                                ]
//                            })
//                        );
//                    }
                }
                
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
* @memberOf mjs.settings.premise.Premise
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.Premise
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.Premise
*/
//	onExit: function() {
//
//	}

});