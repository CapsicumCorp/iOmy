/*
Title: Switch User Page (Start Page) UI5 Controller
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to enter his/her credentials after logging out.
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

sap.ui.controller("mjs.login.ForceSwitchUser", {

//	events : {
	
//	},
	
	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf mjs.login.ForceSwitchUser
	*/
	onInit: function() {
		var me = this;			//-- SCOPE: Allows sub-functions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onBeforeShow: function(evt) {
				//-- Enable/Disable Navigational Forward Button --//
				if( IOMy.common.NavigationForwardPresent()===true ) {
					me.byId("NavSubHead_ForwardBtn").setVisible(true);
				} else {
					me.byId("NavSubHead_ForwardBtn").setVisible(false);
				}
			},
			
			onAfterShow : function (evt) {
			   
				me.DrawLoginPrompt();
			}
		});
	},

	/**
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	* @memberOf mjs.login.ForceSwitchUser
	*/
//	onBeforeRendering: function() {
//
//	},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	* @memberOf mjs.login.ForceSwitchUser
	*/
//	onAfterRendering: function() {
//		
//	},

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf mjs.login.ForceSwitchUser
	*/
//	onExit: function() {
//
//	}

	
	/********************************************************
	 * DRAW SWITCH USER MESSAGE
	 ********************************************************
	 * This function is used to inform the user of what is
	 * happening
	 ********************************************************/
	DrawSwitchUser: function() {
		var me = this;

		//============================================//
		//== 1.1 - Declare the Items				==//
		//============================================//
		
		//--------------------------------------------//
		//-- Input - Username						--//
		//--------------------------------------------//
		if (this.byId("oSwitchUserMessage") !== undefined)
			this.byId("oSwitchUserMessage").destroy();
		
		var oSwitchUserMessage = new sap.m.Label( this.createId("oSwitchUserMessage"), {
			text: "Switching users...",
			width: "400px"
		});
        
		var oSwitchUserContainer = new sap.m.FlexBox({
			items: [
				oSwitchUserMessage,
			],
			direction: "Column"
		});
		
		
		//-- Empty the Switch User panel --//
		this.byId("oSwitchUserPanel").removeAllContent();
		//-- Add the Switch User Container --//
		this.byId("oSwitchUserPanel").addContent(oSwitchUserContainer);
		
	},
	
	/********************************************************
	 * DRAW LOGIN PROMPT
	 ********************************************************
	 * This function is used to draw a login screen
	 ********************************************************/
	
	DrawLoginLoading: function() {
		var me = this;

		//============================================//
		//== 1.1 - Declare the Items				==//
		//============================================//
		
		//--------------------------------------------//
		//-- Splash Logo                            --//
		//--------------------------------------------//
		if (this.byId("SplashImage") !== undefined)
			this.byId("SplashImage").destroy();
		
		var oLoginSplashImage = new sap.m.Image( this.createId("SplashImage"), {
			src: "resources/images/iomy_splash.png",
            densityAware : false,
			width: "200px"
		}).addStyleClass("MarTop10px");
        
		var oLoginLoadingContainer = new sap.m.FlexBox({
			items: [
				oLoginSplashImage
			],
			direction: "Column"
		});
		
		
		//-- Empty the login panel --//
		this.byId("oSwitchUserPanel").removeAllContent();
		//-- Add the Login Prompt --//
		this.byId("oSwitchUserPanel").addContent(oLoginLoadingContainer);
		
	},
	
	
	
	/********************************************************
	 * DRAW LOGIN PROMPT
	 ********************************************************
	 * This function is used to draw a login screen
	 ********************************************************/
	
	DrawLoginPrompt: function() {
		var me = this;

		//============================================//
		//== 1.1 - Declare the Items				==//
		//============================================//
		
		var oLoginLogoHolder = new sap.m.VBox({
			items : [
				new sap.m.Image({
					src : "resources/images/mainlogo.png",
					densityAware: false,
				}).addStyleClass("MarTop4px")
			]
		}).addStyleClass("height190px");
		
		//--------------------------------------------//
		//-- Input - Username						--//
		//--------------------------------------------//
		if (this.byId("oLoginInputUser") !== undefined)
			this.byId("oLoginInputUser").destroy();
		
		var oLoginInputUsername = new sap.m.Input( this.createId("oLoginInputUser"), {
			type: "Text",
			placeholder: "Username",
			maxLength: 40,
			width: "200px"
		}).addStyleClass("LoginTextInput");
		
		//--------------------------------------------//
		//-- Input - Password						--//
		//--------------------------------------------//
		if (this.byId("oLoginInputPWord") !== undefined)
			this.byId("oLoginInputPWord").destroy();
		
		var oLoginInputPassword = new sap.m.Input( this.createId("oLoginInputPWord"), {
			type: "Password",
			placeholder: "password",
			maxLength: 40,
			width: "200px",
            submit : function (oControlEvent) {
				me.doLogin();
			}
		}).addStyleClass("LoginTextInput");
		
		//--------------------------------------------//
		//-- Input - Submit Button					--//
		//--------------------------------------------//
		if (this.byId("oLoginButtonSubmit") !== undefined)
			this.byId("oLoginButtonSubmit").destroy();
		
		var oLoginInputSubmit = new sap.m.Button(this.createId("oLoginButtonSubmit"), {
			text: "Switch",
			type: "Accept",
            icon: "sap-icon://GoogleMaterial/check_circle",
            iconFirst: false,
			width: "200px",
            press : function (oControlEvent) {
				me.doLogin();
			}
		}).addStyleClass("MarBottom15px ButtonIconWhite LoginPageSubmit");
        
        //--------------------------------------------//
		//-- Form - Login form              		--//
		//--------------------------------------------//
		var oLoginInputContainer = new sap.m.FlexBox({
			items: [
				oLoginLogoHolder,
				new sap.m.VBox({
					items : [
						oLoginInputUsername,
						oLoginInputPassword,
						oLoginInputSubmit
					]
				}).addStyleClass("LoginForm PadTop25px PadBottom25px"),
				new sap.m.VBox({
					items : [
						new sap.m.Link({
							text : "Need help?",
							press : function () {
								IOMy.functions.showHelpDialog();
							}
						}).addStyleClass("width100Percent LoginHelpLink SettingsLinks")
					]
				}).addStyleClass("")
			],
			direction: "Column"
		}).addStyleClass("width100Percent");
		
		//-- Empty the login panel --//
		this.byId("oSwitchUserPanel").removeAllContent();
		//-- Add the Login Prompt --//
		this.byId("oSwitchUserPanel").addContent(oLoginInputContainer);
		
	},
	
	
	/********************************************************
	 * PEFORM LOG IN
	 ********************************************************
	 * This function is used to attempt to login
	 ********************************************************/
	doLogin :function() {
		var me = this;
		var sUsername = me.byId("oLoginInputUser").getValue().trim();
		var sPassword = me.byId("oLoginInputPWord").getValue().trim();
		
		var aLoginData = {
			"username":		sUsername,
			"password":		sPassword,
			"AttemptLogin":	"1"
		};
		
		if( sUsername!=="" && sPassword!=="" ){
			//====================================//
			//== ATTMEPT TO LOG THE USER IN		==//
			//====================================//
			$.ajax({
				url : IOMy.apiphp.APILocation('sessioncheck'), 
				type : "POST",
				dataType : "json",
				data : aLoginData,
				success : function( oResponseData, sHTTPCode, jqXHR ) {
					
					//-- Check if the User is logged in --//
					if( oResponseData.login===true ) {
						
//						me.DrawLoginLoading();
//						IOMy.common.RefreshCoreVariables(true);
                        
                        window.location.reload(true); // TRUE forces a proper refresh from the server, not the cache.
					} else {
						//-- TODO: Add the Appropiate Error Messages from the Session Check when Andrew has completed the Better Error Messages --//
						IOMy.common.showError("Invalid Username or Password!", "User Error",
                            function () {
                                //---------------------------------------------------------------//
                                // Clears the interval instance for refreshing core variables as
                                // an incorrect login attempt terminates the current session.
                                //---------------------------------------------------------------//
                                clearInterval(IOMy.common.CoreVariableRefreshIntervalInstance);
//                                window.location.reload(true); // TRUE forces a proper refresh from the server, not the cache.
                            }
                        );
                        
					}
					
				},
				error : function(err) {
					//-- TODO: Replace this with a more apporpiate error --//
					jQuery.sap.log.error(err.error());
					IOMy.common.showError("Invalid Username or Password! (Error)", "User Error",
                        function () {
                            window.location.reload(true);
                        }
                    );
				}
			});


		} else {
			//-- ERROR --//
			IOMy.common.showError("Either the Username or Password field was empty!", "User Error");
		}
	}

});


