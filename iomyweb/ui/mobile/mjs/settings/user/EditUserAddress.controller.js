/*
Title: Edit User Address Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form to allow the user to edit his/her address.
Copyright: Capsicum Corporation 2015, 2016, 2017

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

sap.ui.controller("mjs.settings.user.EditUserAddress", {
	functions : IOMy.functions,
    odata : IOMy.apiodata,
    
    userId : 0,
    
    /**
     * Loads all address information for the current user through a series of AJAX
     * requests.
     */
    loadUserInfo : function () {
        var me = this;
        
        me.odata.AjaxRequest({
            Url : me.odata.ODataLocation("users"),
            Columns : ["USERS_PK", "REGION_NAME", "REGION_PK", "LANGUAGE_PK", "LANGUAGE_NAME", 
                        "USERADDRESS_POSTCODE", "USERADDRESS_SUBREGION",
                        "TIMEZONE_PK", "TIMEZONE_TZ", "USERADDRESS_LINE1", "USERADDRESS_LINE2",
                        "USERADDRESS_LINE3", "USERADDRESS_PK"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                var displayData = data[0];
                // Display the information retrieved from the User Information OData.
                me.byId("addressRegion").setSelectedKey(displayData.REGION_PK);
                me.byId("addressRegion").setEnabled(true);
                
                me.byId("addressLanguage").setSelectedKey(displayData.LANGUAGE_PK);
                me.byId("addressLanguage").setEnabled(true);
                
                me.byId("addressPostCode").setValue(displayData.USERADDRESS_POSTCODE);
                me.byId("addressPostCode").setEnabled(true);
                
                me.byId("addressState").setValue(displayData.USERADDRESS_SUBREGION);
                me.byId("addressState").setEnabled(true);
                
                me.byId("addressTimezone").setSelectedKey(displayData.TIMEZONE_PK);
                me.byId("addressTimezone").setEnabled(true);
                
                me.byId("addressLine1").setValue(displayData.USERADDRESS_LINE1);
                me.byId("addressLine2").setValue(displayData.USERADDRESS_LINE2);
                me.byId("addressLine3").setValue(displayData.USERADDRESS_LINE3);
                
                me.byId("UpdateLink").setEnabled(true);
                
                me.userId = displayData.USERS_PK;
            },
            
            onFail : function (response) {
                IOMy.common.showError("There was an unexpected error loading the user address.");
                jQuery.sap.log.error(JSON.stringify(response));
            }
        });
    },
    
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.settings.user.EditUserAddress
*/
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
				// Start rendering the page
				
				me.functions.destroyItemsByIdFromView(me, [
	                "addressLanguage", "addressRegion", "addressState",
                    "addressPostCode", "addressTimezone", "addressLine1",
                    "addressLine2", "addressLine3", "UpdateLink"
	            ]);
                
                //===== REGION =====//
                var oRegionTitle = new sap.m.Text({
                    text : "Country / Region"
                });
    		    
				var oRegionField = IOMy.widgets.selectBoxRegions(me.createId("addressRegion")).addStyleClass("SettingsDropdownInput");
                oRegionField.setEnabled(false);
                
                //===== LANGUAGE =====//
				var oLanguageTitle = new sap.m.Text({
                    text : "Language"
                }).addStyleClass("MarTop16px");
    		    
				var oLanguageField = IOMy.widgets.selectBoxLanguages(me.createId("addressLanguage")).addStyleClass("SettingsDropdownInput");
                oLanguageField.setEnabled(false);
                
                //===== STATE =====//
                var oStateTitle = new sap.m.Text({
                    text : "State / Province"
                });
    		    
				var oStateField = new sap.m.Input(me.createId("addressState"), {
                    value : ""
                }).addStyleClass("SettingsDropdownInput");
                oStateField.setEnabled(false);
                
                //===== POST CODE =====//
                var oPostCodeTitle = new sap.m.Text({
                    text : "Post Code / Zip Code"
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
                
                //===== RESIDENTIAL ADDRESS =====//
                
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
    	        }).addStyleClass("");
    		    
				var oLine2Field = new sap.m.Input(me.createId("addressLine2"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
                
                //===== EXTRA INFO (LINE 3) =====//
                var oLine3Title = new sap.m.Text({
    	        	text : "City / Suburb"
    	        }).addStyleClass("");
                
				var oLine3Field = new sap.m.Input(me.createId("addressLine3"), {
					value : ""
				}).addStyleClass("width100Percent SettingsTextInput");
				
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("UpdateLink"), {
                            enabled : false,
							text : "Update",
							press : function () {
                                var thisButton = this;
                                thisButton.setEnabled(false);
								IOMy.common.NavigationToggleNavButtons(me, false);
								
                                var aErrorLog = [];
                                var bError = false;
                                var sAddressStateProvince = me.byId("addressState").getValue();
                                var sAddressPostcode = me.byId("addressPostCode").getValue()
                                
                                if (me.byId("addressLine1").getValue() === "") {
                                    aErrorLog.push("Street Address is required.");
                                    bError = true;
                                }
                                if (sAddressStateProvince === "") {
                                    aErrorLog.push("State / Province is required.");
                                    bError = true;
                                }
                                if (sAddressPostcode === "") {
                                    aErrorLog.push("Post code is required.");
                                    bError = true;
                                }
                                
                                if (bError === true) {
                                    jQuery.sap.log.error(aErrorLog.join("\n"));
                                    IOMy.common.showError(aErrorLog.join("\n\n"), "Errors",
										function () {
											thisButton.setEnabled(true);
											IOMy.common.NavigationToggleNavButtons(me, true);
										}
									);
                                } else {
                                    // Run the API to update the user's address
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("users"),
                                            data : {
                                                "Mode" : "EditUserAddress", 
                                                "Id" : me.userId,
                                                "AddressLine1" : me.byId("addressLine1").getValue(),
                                                "AddressLine2" : me.byId("addressLine2").getValue(),
                                                "AddressLine3" : me.byId("addressLine3").getValue(),
                                                "AddressRegion" : me.byId("addressRegion").getSelectedKey(),
                                                "AddressSubRegion" : sAddressStateProvince,
                                                "AddressPostcode" : sAddressPostcode,
                                                "AddressTimezone" : me.byId("addressTimezone").getSelectedKey(),
                                                "AddressLanguage" : me.byId("addressLanguage").getSelectedKey()
                                            },
                                            onSuccess : function () {
                                                IOMy.common.RefreshCoreVariables({
                                                    
                                                    onSuccess : function () {
                                                        IOMy.common.showMessage({
                                                            text : "Your address updated successfully",
                                                            view : thisView
                                                        });

                                                        thisButton.setEnabled(true);
                                                        IOMy.common.NavigationToggleNavButtons(me, true);
                                                        IOMy.common.NavigationChangePage("pDeviceOverview", {}, true);
                                                    }
                                                    
                                                })
                                            },
                                            onFail : function (response) {
                                                IOMy.common.showError("Update failed.", "Error",
													function () {
														thisButton.setEnabled(true);
														IOMy.common.NavigationToggleNavButtons(me, true);
													}
												);
											
                                                jQuery.sap.log.error(JSON.stringify(response));
                                            }
                                        });
                                    } catch (e00033) {
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error",
											function () {
												thisButton.setEnabled(true);
												IOMy.common.NavigationToggleNavButtons(me, true);
											}
										);
                                    }
                                }
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
					]
				}).addStyleClass("TextCenter MarTop12px");
                
                var oVertBox = new sap.m.VBox({
					items : [ 
							 
							oLanguageTitle, oLanguageField,
							oLine1Title, 	oLine1Field,
                            oLine2Title,	oLine2Field, 
							oLine3Title, 	oLine3Field,
                            oStateTitle, 	oStateField, 
							oPostCodeTitle, oPostCodeField,
							oRegionTitle, 	oRegionField,
							oTimezoneTitle, oTimezoneField, 
                            oEditButton, 
					]
				}).addStyleClass("PadLeft16px PadRight16px UserInputForm");
                
                // Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("userPanel") !== undefined) {
					me.byId("userPanel").destroy();
                }
    		    
    		    var oPanel = new sap.m.Panel(me.createId("userPanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				}).addStyleClass("PanelNoTopOrSidesPadding");
				
				
				thisView.byId("page").addContent(oPanel);
                
                me.loadUserInfo();
			}
		});
	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.user.EditUserAddress
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.user.EditUserAddress
*/
//	onAfterRendering: function() {
//		var me = this;
//		sap.ui.getCore().byId("pPremiseInfo");
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.user.EditUserAddress
*/
//	onExit: function() {
//
//	}

});