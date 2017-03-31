/*
Title: Edit User Information Page (UI5 Controller)
Author: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws a form to allow the user to edit his/her details.
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

sap.ui.controller("mjs.settings.user.AddUser", {
	
    wGivenNamesField        : null,
    wTitleField             : null,
    wSurnameField           : null,
    wDisplayNameField       : null,
    wDateOfBirthField       : null,
    wEmailField             : null,
    wContactPhoneField      : null,
    
    wRegionField            : null,
    wLanguageField          : null,
    wStateField             : null,
    wPostCodeField          : null,
    wTimezoneField          : null,
    wAddressLine1Field      : null,
    wAddressLine2Field      : null,
    wAddressLine3Field      : null,
    
    wUsernameField          : null,
    wPasswordField          : null,
    wConfirmPasswordField   : null,
    
    wDBRootUsernameField    : null,
    wDBRootPasswordField    : null,
    
    wEditButton             : null,
    
    wUserInformationVertBox : null,
    wUserAddressVertBox     : null,
    wPasswordVertBox        : null,
    wDBAuthVertBox          : null,
    
    /**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf mjs.settings.user.AddUser
	 */
	onInit: function() {
		var me = this;
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			// Everything is rendered in this function run before rendering.
			onBeforeShow : function (evt) {
				//-- Refresh the Navigational buttons --//
				IOMy.common.NavigationRefreshButtons( me );
				
                //-- Refresh UI --//
                me.DestroyUI();
                me.DrawUI();
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.settings.user.AddUser
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.settings.user.AddUser
*/
//	onAfterRendering: function() {
//		
//	},
	
	
	
/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.settings.user.AddUser
*/
//	onExit: function() {
//
//	},

    DestroyUI : function () {
        var me = this;
        
        // Destroys the actual panel of the page. This is done to ensure that there
        // are no elements left over which would increase the page size each time
        // the page is visited.
        if (me.byId("AddUserPanel") !== undefined) {
            me.byId("AddUserPanel").destroy();
        }
        
//        if (me.wVertBox !== null) {
//            me.wVertBox.destroy();
//        }
    },
    
    DrawUI : function () {
        var me                  = this;
        var thisView            = me.getView();
        var loadLocaleCBoxItems = IOMy.functions.loadLocaleCBoxItems;
        //============================================================//
        // Start rendering the page
        //============================================================//
        //----------------------------------------------//
        // User Information Section
        //----------------------------------------------//
        var oUserInformationSection = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "User Information"
                        }).addStyleClass("MarLeft6px")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader ListItem");
        
        //------------------------------------------------------//
        // Given names (First and Middle names)
        //------------------------------------------------------//
        var oGivenNamesLabel = new sap.m.Label({
            text : "Given Names"
        });

        me.wGivenNamesField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput");

        //------------------------------------------------------//
        // Title
        //------------------------------------------------------//
        var oTitleLabel = new sap.m.Label({
            text : "Title"
        });

        me.wTitleField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput");

        //------------------------------------------------------//
        // Gender
        //------------------------------------------------------//
        var oGenderLabel = new sap.m.Label({
            text : "Gender"
        });

        me.wGenderField = IOMy.widgets.getGenderSelectBox().addStyleClass("SettingsTextInput");

        //------------------------------------------------------//
        // Surname
        //------------------------------------------------------//
        var oSurnameLabel = new sap.m.Label({
            text : "Surname"
        });

        me.wSurnameField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput");

        //------------------------------------------------------//
        // Display name/Username
        //------------------------------------------------------//
        var oDisplayNameLabel = new sap.m.Label({
            text : "Display Name"
        });

        me.wDisplayNameField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput");
        
        //------------------------------------------------------//
        // Date of Birth
        //------------------------------------------------------//
        var oDateOfBirthLabel = new sap.m.Label({
            text : "Date of Birth"
        });

        me.wDateOfBirthField = new sap.m.DatePicker({}).addStyleClass("SettingsTextInput iOmyLink");
        me.wDateOfBirthField.setDisplayFormat("YYYY-MM-dd");
        me.wDateOfBirthField.setValueFormat("YYYY-MM-dd");

        //------------------------------------------------------//
        // Email
        //------------------------------------------------------//
        var oEmailLabel = new sap.m.Label({
            text : "Alert Email"
        });

        me.wEmailField = new sap.m.Input({
            value : "",
            maxLength : 80
        }).addStyleClass("SettingsTextInput");

        //------------------------------------------------------//
        // Phone number
        //------------------------------------------------------//
        var oContactPhoneNumberLabel = new sap.m.Label({
            text : "Alert Mobile"
        });

        me.wContactPhoneField = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput");
        
        //----------------------------------------------//
        // User Address Section
        //----------------------------------------------//
        var oUserAddressHeading = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "User Address"
                        }).addStyleClass("MarLeft6px")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BorderTop ListItem");
        
        //===== REGION =====\\
        var oRegionTitle = new sap.m.Text({
            text : "Region"
        });

        me.wRegionField = IOMy.widgets.selectBoxRegions().addStyleClass("SettingsDropdownInput");
        me.wRegionField.setSelectedIndex(null);

        //===== LANGUAGE =====\\
        var oLanguageTitle = new sap.m.Text({
            text : " Language"
        });

        me.wLanguageField = IOMy.widgets.selectBoxLanguages().addStyleClass("SettingsDropdownInput");

        //===== STATE =====\\
        var oStateTitle = new sap.m.Text({
            text : "Subregion"
        });

        me.wStateField = new sap.m.Input({
            
        }).addStyleClass("SettingsDropdownInput");

        //===== POST CODE =====\\
        var oPostCodeTitle = new sap.m.Text({
            text : "Post Code"
        });

        me.wPostCodeField = new sap.m.Input({
            
        }).addStyleClass("SettingsDropdownInput");

        //===== TIMEZONE =====\\
        var oTimezoneTitle = new sap.m.Text({
            text : "Timezone"
        });

        me.wTimezoneField = IOMy.widgets.selectBoxTimezones().addStyleClass("SettingsDropdownInput");

        //===== RESIDENTIAL ADDRESS =====\\

        //===== STREET ADDRESS (LINE 1) =====\\
        var oLine1Title = new sap.m.Text({
            text : "Street Address Line 1"
        });

        me.wAddressLine1Field = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput");

        //===== UNIT/FLAT ADDRESS (LINE 2) =====\\
        var oLine2Title = new sap.m.Text({
            text : "Street Address Line 2"
        });

        me.wAddressLine2Field = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput");

        //===== EXTRA INFO (LINE 3) =====\\
        var oLine3Title = new sap.m.Text({
            text : "Street Address Line 3"
        });

        me.wAddressLine3Field = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput");
        
        //loadLocaleCBoxItems(me, me.wRegionField.getSelectedIndex().getKey());
        
        //----------------------------------------------//
        // Username and Password Section
        //----------------------------------------------//
        var oPasswordSection = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Username and Password"
                        }).addStyleClass("MarLeft6px")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BorderTop ListItem");
        
        // -- USERNAME --\\
        var oUsernameLabel = new sap.m.Label({
            text : "Username"
        });
        
        me.wUsernameField = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput");
        
        // -- PASSWORD -- \\
        var oPasswordLabel = new sap.m.Label({
            text : "Password"
        });

        me.wPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("SettingsTextInput");

        // -- CONFIRM PASSWORD -- \\
        var oConfirmPasswordLabel = new sap.m.Label({
            text : "Confirm Password"
        }).addStyleClass("");

        me.wConfirmPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("SettingsTextInput");
        
        //----------------------------------------------//
        // Database Authentication Section
        //----------------------------------------------//
        var oDBAuthenticationSection = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Database Authentication"
                        }).addStyleClass("MarLeft6px")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BorderTop ListItem");
        
        // -- USERNAME --\\
        var oDBRootUsernameLabel = new sap.m.Label({
            text : "Username"
        });
        
        me.wDBRootUsernameField = new sap.m.Input({}).addStyleClass("SettingsTextInput");
        
        // -- PASSWORD --\\
        var oDBRootPasswordLabel = new sap.m.Label({
            text : "Password"
        });
        
        me.wDBRootPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("SettingsTextInput");

        //--------------------------//
        // Edit Button
        //--------------------------//
        me.wEditButton = new sap.m.VBox({
            items : [
                new sap.m.Link(me.createId("editButton"), {
                    text : "Create User",
                    press : function () {
                        me.AddUser(this);
                    }
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter iOmyLink")
            ]
        }).addStyleClass("TextCenter MarTop12px");

        //--------------------------//
        // User Information
        //--------------------------//
        me.wUserInformationVertBox = new sap.m.VBox({
            items : [
                oGivenNamesLabel, me.wGivenNamesField,
                oTitleLabel, me.wTitleField,
                oGenderLabel, me.wGenderField,
                oSurnameLabel, me.wSurnameField,
                oDisplayNameLabel, me.wDisplayNameField,
                oDateOfBirthLabel, me.wDateOfBirthField,
                oEmailLabel, me.wEmailField,
                oContactPhoneNumberLabel, me.wContactPhoneField
            ]
        }).addStyleClass("UserFormSection PadAll10px");
        
        //--------------------------//
        // User Address
        //--------------------------//
        me.wUserAddressVertBox = new sap.m.VBox({
            items : [
                oRegionTitle, me.wRegionField,
                oLanguageTitle, me.wLanguageField,
                oStateTitle, me.wStateField,
                oPostCodeTitle, me.wPostCodeField,
                oTimezoneTitle, me.wTimezoneField,
                oLine1Title, me.wAddressLine1Field,
                oLine2Title, me.wAddressLine2Field,
                oLine3Title, me.wAddressLine3Field,
            ]
        }).addStyleClass("UserFormSection PadAll10px");
        
        //--------------------------//
        // Password
        //--------------------------//
        me.wPasswordVertBox = new sap.m.VBox({
            items : [
                oUsernameLabel, me.wUsernameField,
                oPasswordLabel, me.wPasswordField,
                oConfirmPasswordLabel, me.wConfirmPasswordField
            ]
        }).addStyleClass("UserFormSection PadAll10px");
        
        //------------------------------------------------------//
        // Username and password for the database admin user.
        //------------------------------------------------------//
        me.wDBAuthVertBox = new sap.m.VBox({
            items : [
                oDBRootUsernameLabel, me.wDBRootUsernameField,
                oDBRootPasswordLabel, me.wDBRootPasswordField,
                
                //--------------------------//
                // Add Button
                //--------------------------//
                me.wEditButton
            ]
        }).addStyleClass("UserFormSection PadAll10px BorderBottom");

        var oPanel = new sap.m.Panel(me.createId("AddUserPanel"), {
            backgroundDesign: "Transparent",
            content: [
                oUserInformationSection,
                me.wUserInformationVertBox,
                
                oUserAddressHeading,
                me.wUserAddressVertBox,
                
                oPasswordSection,
                me.wPasswordVertBox,
                
                oDBAuthenticationSection,
                me.wDBAuthVertBox
            ] //-- End of Panel Content --//
        }).addStyleClass("UserInputForm MasterPanel PanelNoPadding PadTop3px PadBottom15px");

        thisView.byId("page").addContent(oPanel);
    },
    
    // TODO: This could be put in the functions library for iOmy.
    AddUser : function (oCallingWidget) {
        //--------------------------------------------------------------------//
        // Declare variables, and disable the calling button.
        //--------------------------------------------------------------------//
        var thisButton      = oCallingWidget;
        thisButton.setEnabled(false);

        var me = this;
        
        var sTitle                  = me.wTitleField.getValue();
        var sGivennames             = me.wGivenNamesField.getValue();
        var sSurnames               = me.wSurnameField.getValue();
        var sDisplayname            = me.wDisplayNameField.getValue();
        var sEmail                  = me.wEmailField.getValue();
        var sPhone                  = me.wContactPhoneField.getValue();
        var iGender                 = me.wGenderField.getSelectedKey();
        var vDob                    = me.wDateOfBirthField.getValue();
        var sAddressLine1           = me.wAddressLine1Field.getValue();
        var sAddressLine2           = me.wAddressLine2Field.getValue();
        var sAddressLine3           = me.wAddressLine3Field.getValue();
        var iAddressRegion          = me.wRegionField.getSelectedKey();
        var sAddressSubregion       = me.wStateField.getValue();
        var sAddressPostcode        = me.wPostCodeField.getValue();
        var iAddressTimezone        = me.wTimezoneField.getSelectedKey();
        var iAddressLanguage        = me.wLanguageField.getSelectedKey();
        var sUsername               = me.wUsernameField.getValue();
        var mPasswordValidationInfo;
        var mDOBValidationInfo;

        var bError = false;
        var aLogErrors = [];
        var sDialogTitle;

        //-----------------------------------//
        // Validate the date of birth
        //-----------------------------------//
        if (vDob === "") {
            aLogErrors.push("* Date of birth must be filled out");
            
        } else {
            mDOBValidationInfo = IOMy.validation.isDOBValid(vDob);
            
            if (mDOBValidationInfo.bIsValid === false) {
                aLogErrors.push("* Date of birth: "+mDOBValidationInfo.aErrorMessages.join("\n* Date of birth: "));
            }
            
            if (mDOBValidationInfo.date !== null) {
                vDob = IOMy.functions.getTimestampString(mDOBValidationInfo.date, "yyyy-mm-dd", false);
            }
        }

        //-----------------------------------//
        // Validate Input
        //-----------------------------------//
        if (sAddressLine1 === "") {
            aLogErrors.push("* Street Address (Line 1) must be filled out");
        }
        
        if (sUsername === "") {
            aLogErrors.push("* Username is required");
        }
        
        if (me.wPasswordField.getValue() === "") {
            aLogErrors.push("* Password is required");
        } else {
            // Validate password security
            mPasswordValidationInfo = IOMy.functions.validateSecurePassword(me.wPasswordField.getValue());
            // If the password is not secure enough...
            if (mPasswordValidationInfo.bValid === false) {
                // Report the feedback.
                aLogErrors = aLogErrors.concat(mPasswordValidationInfo.aValidationErrorMessages);
            }
        }

        if (me.wConfirmPasswordField.getValue() !== me.wPasswordField.getValue()) {
            aLogErrors.push("* The new passwords don't match.");
        }
        
        if (me.wDBRootUsernameField.getValue() === "") {
            aLogErrors.push("* The database admin username is required");
        }
        
        if (me.wDBRootPasswordField.getValue() === "") {
            aLogErrors.push("* The database admin password is required");
        }

        if (aLogErrors.length > 0) {
            if (aLogErrors.length > 1) {
                sDialogTitle = "Errors";
            } else if (aLogErrors.length === 1) {
                sDialogTitle = "Error";
            }

            bError = true;
        }

        if (bError === true) {
            jQuery.sap.log.error(aLogErrors.join("\n"));
            IOMy.common.showError(aLogErrors.join("\n\n"), sDialogTitle,
                function () {
                    thisButton.setEnabled(true);
                }
            );
        } else {
            // Run the API to update the user information
            try {
                IOMy.apiphp.AjaxRequest({
                    url : IOMy.apiphp.APILocation("users"),
                    data : {
                        "Mode" : "AddUser",
                        "Title" : sTitle,
                        "Givennames" : sGivennames,
                        "Surnames" : sSurnames,
                        "Displayname" : sDisplayname,
                        "Email" : sEmail,
                        "Phone" : sPhone,
                        "Gender" : iGender,
                        "DoB" : vDob,
                        "AddressLine1" : sAddressLine1,
                        "AddressLine2" : sAddressLine2,
                        "AddressLine3" : sAddressLine3,
                        "AddressRegion" : iAddressRegion,
                        "AddressSubRegion" : sAddressSubregion,
                        "AddressPostcode" : sAddressPostcode,
                        "AddressTimezone" : iAddressTimezone,
                        "AddressLanguage" : iAddressLanguage,
                        "Username" : sUsername,
                        "NewPassword" : me.wPasswordField.getValue(),
                        "Data" : "{\"Username\":\""+me.wDBRootUsernameField.getValue()+"\",\"Password\":\""+me.wDBRootPasswordField.getValue()+"\",\"URI\":\"localhost\"}",
                    },

                    onSuccess : function () {
                        IOMy.common.showSuccess("User "+sDisplayname+" created successfully!", "Success", 
                            function () {
                                IOMy.common.NavigationTriggerBackForward(false);
                            }
                        , "UpdateMessageBox");
                    },
                    onFail : function (response) {
                        // Report the error in a popup message.
                        IOMy.common.showError(response.responseText, "Error",
                            function () {
                                thisButton.setEnabled(true);
                            }
                        );
                    }
                });
            } catch (e00033) {
                IOMy.common.showError("Error accessing API: "+e00033.message, "Error");
            }
        }
    }

});