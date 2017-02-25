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
    
    wCountryField           : null,
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
                        }).addStyleClass("TextLeft MarTop5px MarBottom5px width100Percent PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BoxSizingBorderBox BorderTop ListItem width100Percent");
        
        //------------------------------------------------------//
        // Given names (First and Middle names)
        //------------------------------------------------------//
        var oGivenNamesLabel = new sap.m.Label({
            text : "Given Names"
        });

        me.wGivenNamesField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput width100Percent");

        //------------------------------------------------------//
        // Title
        //------------------------------------------------------//
        var oTitleLabel = new sap.m.Label({
            text : "Title"
        });

        me.wTitleField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput width100Percent");

        //------------------------------------------------------//
        // Gender
        //------------------------------------------------------//
        var oGenderLabel = new sap.m.Label({
            text : "Gender"
        });

        me.wGenderField = IOMy.widgets.getGenderSelectBox().addStyleClass("SettingsTextInput width100Percent");

        //------------------------------------------------------//
        // Surname
        //------------------------------------------------------//
        var oSurnameLabel = new sap.m.Label({
            text : "Surname"
        });

        me.wSurnameField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput width100Percent");

        //------------------------------------------------------//
        // Display name/Username
        //------------------------------------------------------//
        var oDisplayNameLabel = new sap.m.Label({
            text : "Display Name"
        });

        me.wDisplayNameField = new sap.m.Input({
            value : "",
            maxLength : 60
        }).addStyleClass("SettingsTextInput width100Percent");
        
        //------------------------------------------------------//
        // Date of Birth
        //------------------------------------------------------//
        var oDateOfBirthLabel = new sap.m.Label({
            text : "Date of Birth"
        });

        me.wDateOfBirthField = new sap.m.DatePicker({});
        me.wDateOfBirthField.setDisplayFormat("YYYY-MM-dd");

        //------------------------------------------------------//
        // Email
        //------------------------------------------------------//
        var oEmailLabel = new sap.m.Label({
            text : "Alert Email"
        });

        me.wEmailField = new sap.m.Input({
            value : "",
            maxLength : 80
        }).addStyleClass("SettingsTextInput width100Percent");

        //------------------------------------------------------//
        // Phone number
        //------------------------------------------------------//
        var oContactPhoneNumberLabel = new sap.m.Label({
            text : "Alert Mobile"
        });

        me.wContactPhoneField = new sap.m.Input({
            value : ""
        }).addStyleClass("SettingsTextInput width100Percent");
        
        //----------------------------------------------//
        // User Address Section
        //----------------------------------------------//
        var oUserAddressHeading = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "User Address"
                        }).addStyleClass("TextLeft MarTop5px MarBottom5px width100Percent PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader MarTop8px BoxSizingBorderBox BorderTop ListItem width100Percent");
        
        //===== COUNTRY =====\\
        var oCountryTitle = new sap.m.Text({
            text : "Country"
        });

        me.wCountryField = new sap.m.Select({
            width : "100%",
            items : IOMy.widgets.getCountryItems(),
            selectionChange : function () {
                loadLocaleCBoxItems(me, this.getSelectedKey());
            }
        }).addStyleClass("width100Percent SettingsDropdownInput");
        
        me.wCountryField.setSelectedIndex(0);

        //===== LANGUAGE =====\\
        var oLanguageTitle = new sap.m.Text({
            text : " Language"
        });

        me.wLanguageField = new sap.m.Select({
            width : "100%",
            items : IOMy.widgets.getLanguageItems()
        }).addStyleClass("width100Percent SettingsDropdownInput");

        //===== STATE =====\\
        var oStateTitle = new sap.m.Text({
            text : "State/Province"
        });

        me.wStateField = new sap.m.Select({
            width : "100%",
            items : IOMy.widgets.getStateProvinceItems()
        }).addStyleClass("width100Percent SettingsDropdownInput");

        //===== POST CODE =====\\
        var oPostCodeTitle = new sap.m.Text({
            text : "Post Code"
        });

        me.wPostCodeField = new sap.m.Select({
            width : "100%",
            items : IOMy.widgets.getPostCodeItems()
        }).addStyleClass("width100Percent SettingsDropdownInput");

        //===== TIMEZONE =====\\
        var oTimezoneTitle = new sap.m.Text({
            text : "Timezone"
        });

        me.wTimezoneField = new sap.m.Select({
            width : "100%",
            items : IOMy.widgets.getTimezoneItems()
        }).addStyleClass("width100Percent SettingsDropdownInput");

        //===== RESIDENTIAL ADDRESS =====\\

        //===== STREET ADDRESS (LINE 1) =====\\
        var oLine1Title = new sap.m.Text({
            text : "Street Address Line 1"
        });

        me.wAddressLine1Field = new sap.m.Input({
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");

        //===== UNIT/FLAT ADDRESS (LINE 2) =====\\
        var oLine2Title = new sap.m.Text({
            text : "Street Address Line 2"
        });

        me.wAddressLine2Field = new sap.m.Input({
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");

        //===== EXTRA INFO (LINE 3) =====\\
        var oLine3Title = new sap.m.Text({
            text : "Street Address Line 3"
        });

        me.wAddressLine3Field = new sap.m.Input({
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");
        
        //loadLocaleCBoxItems(me, me.wCountryField.getSelectedIndex().getKey());
        
        //----------------------------------------------//
        // Username and Password Section
        //----------------------------------------------//
        var oPasswordSection = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Username and Password"
                        }).addStyleClass("TextLeft MarTop5px MarBottom5px width100Percent PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BoxSizingBorderBox MarTop8px BorderTop ListItem width100Percent");
        
        // -- USERNAME --\\
        var oUsernameLabel = new sap.m.Label({
            text : "Username"
        });
        
        me.wUsernameField = new sap.m.Input({
            value : ""
        }).addStyleClass("width100Percent SettingsTextInput");
        
        // -- PASSWORD -- \\
        var oPasswordLabel = new sap.m.Label({
            text : "Password"
        });

        me.wPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("width100Percent SettingsTextInput");

        // -- CONFIRM PASSWORD -- \\
        var oConfirmPasswordLabel = new sap.m.Label({
            text : "Confirm Password"
        }).addStyleClass("");

        me.wConfirmPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("width100Percent SettingsTextInput");
        
        //----------------------------------------------//
        // Database Authentication Section
        //----------------------------------------------//
        var oDBAuthenticationSection = new sap.m.VBox({
            items : [
                new sap.m.VBox({
                    items : [
                        new sap.m.Label({
                            text: "Database Authentication"
                        }).addStyleClass("TextLeft MarTop5px MarBottom5px width100Percent PaddingToMatchButtonText")
                    ]
                })
            ]
        }).addStyleClass("ConsistentMenuHeader BoxSizingBorderBox MarTop8px BorderTop ListItem width100Percent");
        
        // -- USERNAME --\\
        var oDBRootUsernameLabel = new sap.m.Label({
            text : "Username"
        });
        
        me.wDBRootUsernameField = new sap.m.Input({}).addStyleClass("width100Percent SettingsTextInput");
        
        // -- PASSWORD --\\
        var oDBRootPasswordLabel = new sap.m.Label({
            text : "Password"
        });
        
        me.wDBRootPasswordField = new sap.m.Input({
            value : "",
            type : sap.m.InputType.Password
        }).addStyleClass("width100Percent SettingsTextInput");

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
                }).addStyleClass("SettingsLinks AcceptSubmitButton TextCenter")
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
        }).addStyleClass("UserFormSection");
        
        //--------------------------//
        // User Address
        //--------------------------//
        me.wUserAddressVertBox = new sap.m.VBox({
            items : [
                oCountryTitle, me.wCountryField,
                oLanguageTitle, me.wLanguageField,
                oStateTitle, me.wStateField,
                oPostCodeTitle, me.wPostCodeField,
                oTimezoneTitle, me.wTimezoneField,
                oLine1Title, me.wAddressLine1Field,
                oLine2Title, me.wAddressLine2Field,
                oLine3Title, me.wAddressLine3Field,
            ]
        }).addStyleClass("UserFormSection");
        
        //--------------------------//
        // Password
        //--------------------------//
        me.wPasswordVertBox = new sap.m.VBox({
            items : [
                oUsernameLabel, me.wUsernameField,
                oPasswordLabel, me.wPasswordField,
                oConfirmPasswordLabel, me.wConfirmPasswordField
            ]
        }).addStyleClass("UserFormSection");
        
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
        }).addStyleClass("UserFormSection");

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
        }).addStyleClass("UserInputForm TableSideBorders");

        thisView.byId("page").addContent(oPanel);
    },
    
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
        var vDob                    = me.wDateOfBirthField.getDateValue();
        var sAddressLine1           = me.wAddressLine1Field.getValue();
        var sAddressLine2           = me.wAddressLine2Field.getValue();
        var sAddressLine3           = me.wAddressLine3Field.getValue();
        var iAddressCountry         = me.wCountryField.getSelectedKey();
        var iAddressStateProvince   = me.wStateField.getSelectedKey();
        var iAddressPostcode        = me.wPostCodeField.getSelectedKey();
        var iAddressTimezone        = me.wTimezoneField.getSelectedKey();
        var iAddressLanguage        = me.wLanguageField.getSelectedKey();
        var sUsername               = me.wUsernameField.getValue();
        var mPasswordValidationInfo;

        var bError = false;
        var aLogErrors = [];
        var sDialogTitle;

        //-----------------------------------//
        // Prepare the date of birth string
        //-----------------------------------//
        if (vDob === null) {
            vDob = "";
        } else {
        //try {
            vDob = IOMy.functions.getTimestampString(vDob, "yyyy-mm-dd", false)
//        } catch (e) {
//            aLogErrors.push("")
//        }
            console.log(vDob);
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
            // If the password is not secure enough
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
                        "AddressLine1" : sAddressLine1,
                        "AddressLine2" : sAddressLine2,
                        "AddressLine3" : sAddressLine3,
                        "AddressCountry" : iAddressCountry,
                        "AddressStateProvince" : iAddressStateProvince,
                        "AddressPostcode" : iAddressPostcode,
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