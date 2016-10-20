/*
Title: Edit User Password Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form to allow the user to edit his/her password.
Copyright: Capsicum Corporation 2015, 2016

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

sap.ui.controller("mjs.settings.user.UserEditPassword", {
	api : IOMy.apiphp,
    odata : IOMy.apiodata,
	functions : IOMy.functions,
    
    currentUserID : 0,
    /**
     * Loads the ID of the current user so that the relevant APIs to perform the
     * password change for the current user
     */
    loadUserKey : function () {
        var me = this;
        
        me.odata.AjaxRequest({
            Url : me.odata.ODataLocation("users"),
            Columns : ["USERS_PK"],
            WhereClause : [],
            OrderByClause : [],

            onSuccess : function (responseType, data) {
                var displayData = data[0];
                me.currentUserID = displayData.USERS_PK;
            },
            
            onFail : function (response) {
                IOMy.common.showError("There was an unexpected error loading the user address.");
                jQuery.sap.log.error(JSON.stringify(response));
            },
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
                    "oldPasswordField", "newPasswordField",
                    "confirmPasswordField", "editButton", "requiredNotice"
                ]);
                
                // -- OLD PASSWORD -- \\
                var oOldPasswordLabel = new sap.m.Label({
    	        	text : "Old Password"
    	        }).addStyleClass("");
    		    
                var oOldPasswordField = new sap.m.Input(me.createId("oldPasswordField"), {
					value : "",
                    type : sap.m.InputType.Password
				}).addStyleClass("width100Percent SettingsTextInput");
                
                // -- NEW PASSWORD -- \\
				var oNewPasswordLabel = new sap.m.Label({
    	        	text : "New Password"
    	        }).addStyleClass("");
    		    
                var oNewPasswordField = new sap.m.Input(me.createId("newPasswordField"), {
					value : "",
                    type : sap.m.InputType.Password
				}).addStyleClass("width100Percent SettingsTextInput");
                
                // -- CONFIRM PASSWORD -- \\
				var oConfirmNewPasswordLabel = new sap.m.Label({
    	        	text : "Confirm New Password"
    	        }).addStyleClass("");
    		    
                var oConfirmNewPasswordField = new sap.m.Input(me.createId("confirmPasswordField"), {
					value : "",
                    type : sap.m.InputType.Password
				}).addStyleClass("width100Percent SettingsTextInput");
                
                // User ID
				me.loadUserKey(); // Load the current user ID
				
				var oEditButton = new sap.m.VBox({
					items : [
						new sap.m.Link(me.createId("editButton"), {
							text : "Update",
							press : function () {
								this.setEnabled(false);
								
                                var sOldPasswd = me.byId("oldPasswordField").getValue();
                                var sNewPasswd1 = me.byId("newPasswordField").getValue();
                                var sNewPasswd2 = me.byId("confirmPasswordField").getValue();
                                
                                // Check that the new password and confirm new password fields
                                // are equal. If not, flag an error and exit.
                                if (sNewPasswd1 !== sNewPasswd2 || sOldPasswd === "" || sNewPasswd1 === "" ||
                                    sNewPasswd2 === "") {
                                    var aLogErrors = [];
                                    var sDialogTitle = "";
                                    
                                    // Has the current password been entered?
                                    if (sOldPasswd === "") {
                                        aLogErrors.push("You must enter your current password."); // No it hasn't.
                                        sDialogTitle = "Enter Current Password";
                                    }
                                    // Are one or both new password fields empty?
                                    if (sNewPasswd1 === "" || sNewPasswd2 === "") {
                                        if ((sNewPasswd1 === "" && sNewPasswd2 === "") || sNewPasswd1 === "") {
                                            aLogErrors.push("You forgot to enter the new password.");
                                            sDialogTitle = "Enter New Password";
                                        } else if (sNewPasswd2 === "") {
                                            aLogErrors.push("You must enter your password twice to check that the password you entered is correct.");
                                            sDialogTitle = "Entered Password Once";
                                        }
                                    } else {
                                        // Do the new passwords match?
                                        if (sNewPasswd1 !== sNewPasswd2) {
                                            aLogErrors.push("The new passwords you entered don't match.");
                                            sDialogTitle = "Confirm New Password";
                                        }
                                    }
                                    
                                    if (aLogErrors.length > 1)
                                        sDialogTitle = "Errors";
                                    
                                    // Toss up an error dialog and place the error(s) in the error log.
                                    jQuery.sap.log.error(aLogErrors.join("\n"));
                                    IOMy.common.showError(aLogErrors.join("\n\n"), sDialogTitle);
                                } else {
                                    // Run the API to update the user's password
                                    try {
                                        IOMy.apiphp.AjaxRequest({
                                            url : IOMy.apiphp.APILocation("users"),
                                            data : {
                                                "Mode" : "EditPassword", "Id" : me.currentUserID,
                                                "OldPassword" : sOldPasswd, "NewPassword" : sNewPasswd1
                                            },
                                            onSuccess : function () {
                                                IOMy.common.showSuccess("Password Changed. Log back in to continue using IOMy.", "Success", 
                                                function () {
                                                    window.location.reload(true); // TRUE forces a proper refresh from the server, not the cache.
                                                }, "UpdateMessageBox");
                                            },
                                            error : function () {
                                                IOMy.common.showError("Update failed.", "Error");
                                            }
                                        });
                                    } catch (e00033) {
                                        jQuery.sap.log.error("Error accessing API: "+e00033.message);
                                        IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
                                    }
                                }
								this.setEnabled(true);
							}
						}).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
					]
				}).addStyleClass("TextCenter MarTop12px");
        		
				var oVertBox = new sap.m.VBox({
					items : [oOldPasswordLabel, oOldPasswordField,
                            oNewPasswordLabel, oNewPasswordField,
                            oConfirmNewPasswordLabel, oConfirmNewPasswordField,
                            oEditButton]
				});
    		    
		    	// Destroys the actual panel of the page. This is done to ensure that there
				// are no elements left over which would increase the page size each time
				// the page is visited.
				if (me.byId("userInfoPanel") !== undefined)
					me.byId("userInfoPanel").destroy();
    		    
    		    var oPanel = new sap.m.Panel(me.createId("userInfoPanel"), {
    		    	backgroundDesign: "Transparent",
					content: [oVertBox] //-- End of Panel Content --//
				});
                
				//thisView.byId("page").addContent(oRequiredNotice);
				thisView.byId("page").addContent(oPanel);
			}
		});
	}

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
//		sap.ui.getCore().byId("pDeviceInfo");
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.user.EditUserAddress
*/
//	onExit: function() {
//
//	}

});