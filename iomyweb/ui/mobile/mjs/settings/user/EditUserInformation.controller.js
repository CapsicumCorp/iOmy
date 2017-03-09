/*
Title: Edit User Information Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form to allow the user to edit his/her details.
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

sap.ui.controller("mjs.settings.user.EditUserInformation", {
	api : IOMy.apiphp,
	odata : IOMy.apiodata,
	functions : IOMy.functions,
    
    userId : 0,
    
    /**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf mjs.settings.user.EditUserInformation
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
				
				// While the page and user info is loading, flag it.
				me.bLoadingUserInfo = true;
				
				me.functions.destroyItemsByIdFromView(me, [
					"givenNamesField", "surnameField",
                    "displayNameField", "emailField", "contactPhoneNumberField",
                    "editButton", "requiredNotice"
				]);
                
				var oGivenNamesLabel = new sap.m.Label({
					text : "Given Names"
				});
				
				var oGivenNamesField = new sap.m.Input(me.createId("givenNamesField"), {
					value : "",
					maxLength : 60
				}).addStyleClass("SettingsTextInput width100Percent");
				
				var oSurnameLabel = new sap.m.Label({
					text : "Surname"
				});
				
				var oSurnameField = new sap.m.Input(me.createId("surnameField"), {
					value : "",
					maxLength : 60
				}).addStyleClass("SettingsTextInput width100Percent");
				
				var oDisplayNameLabel = new sap.m.Label({
					text : "Display Name"
				});
				
				var oDisplayNameField = new sap.m.Input(me.createId("displayNameField"), {
					value : "",
					maxLength : 60
				}).addStyleClass("SettingsTextInput width100Percent");
				
				var oEmailLabel = new sap.m.Label({
					text : "Alert Email"
				});
				
				var oEmailField = new sap.m.Input(me.createId("emailField"), {
					value : "",
					maxLength : 80
				}).addStyleClass("SettingsTextInput width100Percent");
				
				var oContactPhoneNumberLabel = new sap.m.Label({
					text : "Alert Mobile"
				});
				
				var oContactPhoneNumberField = new sap.m.Input(me.createId("contactPhoneNumberField"), {
					value : ""
				}).addStyleClass("SettingsTextInput width100Percent");
				
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("editButton"), {
							text : "Update",
							//enabled : false,
							press : function () {
								this.setEnabled(false);
								
								var iUserID = me.userId;
                                //var sTitle = me.byId("titleField").getValue();
                                var sGivennames = me.byId("givenNamesField").getValue();
                                var sSurnames = me.byId("surnameField").getValue();
                                var sDisplayname = me.byId("displayNameField").getValue();
                                var sEmail = me.byId("emailField").getValue();
                                var sPhone = me.byId("contactPhoneNumberField").getValue();
                                //var iGender = me.byId("genderField").getSelectedKey();
                                
                                var bError = false;
                                var aLogErrors = [];
                                var sDialogTitle;
                                
//                                if (sTitle === "")
//                                    aLogErrors.push("Title isn't specified.");
//                                if (sGivennames === "")
//                                    aLogErrors.push("Given name(s) must be specified.");
//                                if (sSurnames === "")
//                                    aLogErrors.push("Surname is required");
                                if (sDisplayname === "")
                                    aLogErrors.push("Display name is required.");
//                                if (sEmail === "")
//                                    aLogErrors.push("Email is required");
//                                if (sPhone === "")
//                                    aLogErrors.push("Phone number is required");
//                                if (me.byId("genderField").getValue() === "")
//                                    aLogErrors.push("Gender field must not be blank");
                                
                                if (aLogErrors.length > 0) {
                                    if (aLogErrors.length > 1) 
                                        sDialogTitle = "Errors";
                                    else if (aLogErrors.length === 1)
                                        sDialogTitle = "Error";
                                    
                                    bError = true;
                                }
                                
                                if (bError === true) {
                                    jQuery.sap.log.error(aLogErrors.join("\n"));
                                    IOMy.common.showError(aLogErrors.join("\n\n"), sDialogTitle);
                                } else {
                                    // Run the API to update the user information
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("users"),
                                            data : {
                                                "Mode" : "EditUserInfo", "Id" : iUserID,
                                                "Title" : "Mr",
                                                "Givennames" : sGivennames,
                                                "Surnames" : sSurnames,
                                                "Displayname" : sDisplayname,
                                                "Email" : sEmail,
                                                "Phone" : sPhone,
                                                "Gender" : 2
                                            },
                                            onSuccess : function () {
                                                IOMy.common.showSuccess("Update successful.", "Success", 
                                                function () {
                                                    IOMy.common.NavigationTriggerBackForward(false);
                                                }, "UpdateMessageBox");
                                            },
                                            error : function () {
                                                IOMy.common.showError("Update failed.", "Error");
                                            }
                                        });
                                    } catch (e00033) {
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
								this.setEnabled(true);
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton iOmyLink TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
				
				var oVertBox = new sap.m.VBox({
					items : [
							oGivenNamesLabel, oGivenNamesField,
							oSurnameLabel, oSurnameField,
							oDisplayNameLabel, oDisplayNameField,
							oEmailLabel, oEmailField,
							oContactPhoneNumberLabel, oContactPhoneNumberField,
							oEditButton]
				}).addStyleClass("UserInputForm");
				
				// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("userInfoPanel") !== undefined)
					me.byId("userInfoPanel").destroy();
				
				var oPanel = new sap.m.Panel(me.createId("userInfoPanel"), {
					backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
				
				me.loadCurrentUserInfo();
				
				thisView.byId("page").addContent(oPanel);
			}
		});
	},
	
	bLoadingUserInfo : false,
	
	loadCurrentUserInfo : function () {
		var me = this;
		
		me.odata.AjaxRequest({
			Url: me.odata.ODataLocation("users"),
			Columns : ["USERS_PK","USERSINFO_SURNAMES","USERSINFO_GIVENNAMES",
					"USERSINFO_DISPLAYNAME","USERSINFO_EMAIL","USERSINFO_PHONENUMBER",
                    "USERSGENDER_PK"],
			WhereClause : [],
			OrderByClause : [],
			
			onSuccess : function (responseType, data) {
				data = data[0];
                
                me.userId = data.USERS_PK;
				me.byId("givenNamesField").setValue(data.USERSINFO_GIVENNAMES);
				me.byId("surnameField").setValue(data.USERSINFO_SURNAMES);
				me.byId("displayNameField").setValue(data.USERSINFO_DISPLAYNAME);
				me.byId("emailField").setValue(data.USERSINFO_EMAIL);
				me.byId("contactPhoneNumberField").setValue(data.USERSINFO_PHONENUMBER);
				me.bLoadingUserInfo = false;
				me.byId("editButton").setEnabled(true);
			},
			
			onFail : function (response) {
				jQuery.sap.log.error("Error loading user information: "+JSON.stringify(response));
			}
		});
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.user.EditUserInformation
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.user.EditUserInformation
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.user.EditUserInformation
*/
//	onExit: function() {
//
//	}

});