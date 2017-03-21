/*
Title: Edit Premise Address Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form that allows you to edit the address about a given
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

sap.ui.controller("mjs.settings.premise.PremiseEditAddress", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
    loadLocaleCBoxItems : IOMy.functions.loadLocaleCBoxItems,
    
    loadLocaleInfo : function (iPremiseId) {
        var me = this;
        var iRegionId;
        
        me.odata.AjaxRequest({
            Url : me.odata.ODataLocation("premiselocation"),
            Columns : ["COUNTRIES_NAME", "COUNTRIES_PK", "LANGUAGE_PK", "LANGUAGE_NAME", 
                        "POSTCODE_NAME", "STATEPROVINCE_NAME",
                        "TIMEZONE_PK", "TIMEZONE_TZ", "PREMISEADDRESS_LINE1", "PREMISEADDRESS_LINE2",
                        "PREMISEADDRESS_LINE3", "PREMISEADDRESS_PK"],
            WhereClause : ["PREMISE_PK eq "+iPremiseId],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                var displayData = data[0];
                iRegionId = displayData.REGIONS_PK;
                
                //me.loadLocaleCBoxItems(me, iRegionId, displayData);
                
                // Display the information retrieved from the Premise Location OData
                me.byId("addressRegion").setSelectedKey(displayData.COUNTRIES_PK);
                me.byId("addressRegion").setEnabled(true);
                
                me.byId("addressLanguage").setSelectedKey(displayData.LANGUAGE_PK);
                me.byId("addressLanguage").setEnabled(true);
                
                me.byId("addressPostCode").setValue(displayData.POSTCODE_NAME);
                me.byId("addressPostCode").setEnabled(true);
                
                me.byId("addressState").setValue(displayData.STATEPROVINCE_NAME);
                me.byId("addressState").setEnabled(true);
                
                me.byId("addressTimezone").setSelectedKey(displayData.TIMEZONE_PK);
                me.byId("addressTimezone").setEnabled(true);
                
                me.byId("addressLine1").setValue(displayData.PREMISEADDRESS_LINE1);
                me.byId("addressLine2").setValue(displayData.PREMISEADDRESS_LINE2);
                me.byId("addressLine3").setValue(displayData.PREMISEADDRESS_LINE3);
                
                me.byId("UpdateLink").setEnabled(true);
            },
            
            onFail : function (response) {
                IOMy.common.showError("There was an unexpected error loading the premise address.");
                jQuery.sap.log.error(JSON.stringify(response));
            }
        });
    },
    
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.premise.EditPremiseAddress
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				// Collect values parsed from the premise list.
				var aPremise = evt.data.premise;
				me.premiseID = aPremise.Id;
				
				//thisView.byId("page").setCustomHeader(IOMy.widgets.getIOMYPageHeader());
				
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, [
	                "addressRegion", "addressLanguage", "addressState",
                    "addressPostCode", "addressTimezone", "addressLine1",
                    "addressLine2", "addressLine3", "UpdateLink"
	            ]);
                
                //===== REGION =====//
                var oRegionTitle = new sap.m.Text({
                    text : "Region"
                }).addStyleClass("MarTop16px");
    		    
				var oRegionField = IOMy.widgets.selectBoxRegions(me.createId("addressRegion")).addStyleClass("SettingsDropdownInput");
                oRegionField.setEnabled(false);
                
                //===== LANGUAGE =====//
				var oLanguageTitle = new sap.m.Text({
                    text : "Language"
                });
    		    
				var oLanguageField = IOMy.widgets.selectBoxLanguages(me.createId("addressLanguage")).addStyleClass("SettingsDropdownInput");
                oLanguageField.setEnabled(false);
                
                //===== STATE =====//
                var oStateTitle = new sap.m.Text({
                    text : "State/Province"
                });
    		    
				var oStateField = new sap.m.Input(me.createId("addressState"), {
                    value : ""
                }).addStyleClass("SettingsDropdownInput");
                oStateField.setEnabled(false);
                
                //===== POST CODE =====//
                var oPostCodeTitle = new sap.m.Text({
                    text : "Post Code"
                });
    		    
				var oPostCodeField = new sap.m.Input(me.createId("addressPostCode"), {
                    value : ""
                }).addStyleClass("SettingsDropdownInput");
                oPostCodeField.setEnabled(false);
                
                //===== TIMEZONE =====//
                var oTimezoneTitle = new sap.m.Text({
                    text : "Timezone"
                });
    		    
				var oTimezoneField = IOMy.widgets.selectBoxTimezones(me.createId("addressTimezone")).addStyleClass("SettingsDropdownInput");
                oTimezoneField.setEnabled(false);
                
                //===== PREMISE ADDRESS =====//
                
                //===== STREET ADDRESS (LINE 1) =====//
                var oLine1Title = new sap.m.Text({
                    text : "Street Address"
                });
    		    
				var oLine1Field = new sap.m.Input(me.createId("addressLine1"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                //===== UNIT/FLAT ADDRESS (LINE 2) =====//
                var oLine2Title = new sap.m.Text({
    	        	text : "Unit Number (if applicable)"
    	        });
    		    
				var oLine2Field = new sap.m.Input(me.createId("addressLine2"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                //===== EXTRA INFO (LINE 3) =====//
                var oLine3Title = new sap.m.Text({
    	        	text : "Line 3 (Other info)"
    	        });
                
				var oLine3Field = new sap.m.Input(me.createId("addressLine3"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                me.loadLocaleInfo(aPremise.Id);
				
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("UpdateLink"), {
                            enabled : false,
							text : "Update",
							press : function () {
                                var thisButton = this;
								thisButton.setEnabled(false);
								
								var iPremiseID = me.premiseID;
                                var sAddressLine1 = me.byId("addressLine1").getValue();
                                var sAddressLine2 = me.byId("addressLine2").getValue();
                                var sAddressLine3 = me.byId("addressLine3").getValue();
                                var sAddressRegion = me.byId("addressRegion").getSelectedKey();
                                var sAddressStateProvince = me.byId("addressState").getValue();
                                var sAddressPostcode = me.byId("addressPostCode").getValue();
                                var sAddressTimezone = me.byId("addressTimezone").getSelectedKey();
                                var sAddressLanguage = me.byId("addressLanguage").getSelectedKey();
                                
                                var bError = false;
                                var aErrorLog = [];
                                
                                // Error checking and validation
                                if (sAddressLine1 === "") {
                                    aErrorLog.push("Street Address is required.");
                                    bError = true;
                                }
                                
                                if (bError === true) {
                                    jQuery.sap.log.error(aErrorLog.join("\n"));
                                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors");
                                } else {
                                    // Run the API to update the premise address
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("premises"),
                                            data : {
                                                "Mode" : "EditPremiseAddress", 
                                                "Id" : iPremiseID,
                                                "AddressLine1" : sAddressLine1,
                                                "AddressLine2" : sAddressLine2,
                                                "AddressLine3" : sAddressLine3,
                                                "AddressRegion" : sAddressRegion,
                                                "AddressStateProvince" : sAddressStateProvince,
                                                "AddressPostcode" : sAddressPostcode,
                                                "AddressTimezone" : sAddressTimezone,
                                                "AddressLanguage" : sAddressLanguage
                                            },
                                            onSuccess : function () {
                                                IOMy.common.showSuccess("Update successful.", "Success", function () {
                                                    IOMy.common.NavigationChangePage("pPremiseOverview", {}, true);
                                                }, "UpdateMessageBox");
                                            },
                                            onFail : function (response) {
                                                IOMy.common.showError("Update failed.", "Error");
                                                jQuery.sap.log.error(JSON.stringify(response));
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
                
                var oVertBox = new sap.m.VBox({
					items : [oRegionTitle, oRegionField, oLanguageTitle, oLanguageField,
                            oStateTitle, oStateField, oPostCodeTitle, oPostCodeField,
                            oTimezoneTitle, oTimezoneField, oLine1Title, oLine1Field,
                            oLine2Title, oLine2Field, oLine3Title, oLine3Field,
                            oEditButton]
				}).addStyleClass("UserInputForm");
                
                // Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("premisePanel") !== undefined) {
					me.byId("premisePanel").destroy();
                }
    		    
    		    var oPanel = new sap.m.Panel(me.createId("premisePanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				}).addStyleClass("PanelNoTopPadding");
				
				thisView.byId("page").addContent(oPanel);
                
                // Create the extras menu for the Premise Edit Address page.
                thisView.byId("extrasMenuHolder").destroyItems();
                thisView.byId("extrasMenuHolder").addItem(
                    IOMy.widgets.getActionMenu({
                        id : me.createId("extrasMenu"),        // Uses the page ID
                        icon : "sap-icon://GoogleMaterial/more_vert",
                        items : [
                            {
                                text: "Edit Information",
                                select:	function (oControlEvent) {
                                    oApp.to("pSettingsPremiseInfo", {});
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
* @memberOf mjs.settings.premise.EditPremiseAddress
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.premise.EditPremiseAddress
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.premise.EditPremiseAddress
*/
//	onExit: function() {
//
//	}

});