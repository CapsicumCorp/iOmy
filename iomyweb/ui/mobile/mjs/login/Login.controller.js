/*
Title: Login Page (Start Page) UI5 Controller
Author: Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
Modified: Brent Jarmaine (Capsicum Corporation) <brenton@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
Copyright: Capsicum Corporation 2015, 2016, 2017,

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

sap.ui.controller("mjs.login.Login", {
	
    refreshInterval : 600000, // How often the Core variables are refreshed in milliseconds. Default 600 000 (10 minutes)
	
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf mjs.login.Login
*/
	onInit: function() {
		var me = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var thisView = me.getView();
		
		thisView.addEventDelegate({
			onAfterShow : function (evt) {
				try {
					IOMy.common.CheckSessionInfo({
						//----------------------------------------------------//
						//-- Function to run if user is currently logged in --//
						OnUserSessionActive: $.proxy(function(data){
							
							if(IOMy.common.CoreVariablesInitialised===true) {
								//--------------------------------------------//
								//-- Kick the user to the Navigation Page	--//
								//--------------------------------------------//
								//jQuery.sap.log.debug("User has accidentally ended up on the login page! They are now being kicked to the Navigation Page!");
								IOMy.common.NavigationTriggerBackForward( false );
								
								//oApp.to("pNavMain");
							} else {
								//----------------------------//
								//-- Refresh Sensor List	--//
								//----------------------------//
								//console.log( "Session active, So refresh core variables" );
								me.DrawLoginLoading();
								IOMy.common.ReloadCoreVariables(
                                    function () {
                                        try {
                                            //-- Flag that the Core Variables have been configured --//
                                            IOMy.common.CoreVariablesInitialised = true;
                                            //-- Reset the Navigation array and index after switching users --//
                                            IOMy.common.NavPagesNavigationArray = [];
                                            IOMy.common.NavPagesCurrentIndex = -1;
                                            //-- LOAD THE 1ST Page --//
                                            IOMy.common.NavigationChangePage( IOMy.common.sNavigationDefaultPage, {}, true);

                                            //-------------------------------------------------//
                                            // Reload them every 10 minutes, except data from the
                                            // public OData because they're never changed by the
                                            // user from iOmy.
                                            //-------------------------------------------------//
                                            
                                            //-- Clear the interval as a precaution. --//
                                            if (IOMy.common.CoreVariableRefreshIntervalInstance !== null) {
                                                clearInterval(IOMy.common.CoreVariableRefreshIntervalInstance);
                                                IOMy.common.CoreVariableRefreshIntervalInstance = null;
                                            }
                                            
                                            IOMy.common.CoreVariableRefreshIntervalInstance = setInterval(function () {
                                               //console.log("Another 10 minutes is up!");
                                                IOMy.common.ReloadVariablePremiseList();
                                            }, me.refreshInterval);
                                            
                                            //----------------------------------------------------------------------------//
                                            // Load all the device rules into memory.
                                            //----------------------------------------------------------------------------//
											try {
												IOMy.rules.loadRules({
													hubID : 1
												});
											} catch (ex) {
												jQuery.sap.log.warning(ex.message);
											}
											
											//----------------------------------------------------------------------------//
											// Load the user's display name
											//----------------------------------------------------------------------------//
											IOMy.functions.setCurrentUserNameForNavigation();
                                            
                                        } catch(e654321) {
                                            //-- ERROR:  TODO: Write a better error message--//
                                            jQuery.sap.log.error(">>>>Critical Error Loading \"Navigation Main\" page<<<<\n"+e654321.message);
                                        }
                                    }
                                );		//-- The function parameter is set as true to redirect to Navigation Page --//
							}
							
						}),
						//--------------------------------------------------------//
						//-- Function to run if user is not currently logged in --//
						OnUserSessionInactive: $.proxy(function(data){
							
							
							
							//----------------------------//
							//-- DRAW LOGIN PROMPT		--//
							//----------------------------//
							//console.log( "Session inactive, Draw Login Prompt" );
							me.DrawLoginPrompt();
							//-- Draw the Login form fields to allow the user to log in --//
							
						})
					});
					
				} catch(e1) {
					
					jQuery.sap.log.error("Error on User Sessioncheck !"+e1.message);
					me.DrawLoginPrompt();
				}
			}
		});
	},


/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf mjs.login.Login
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf mjs.login.Login
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf mjs.login.Login
*/
//	onExit: function() {
//
//	}

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
		//-- Splash Logo						--//
		//--------------------------------------------//
		var oLoginSplashImage = new sap.m.Image( this.createId("SplashImage"), {
			src: "resources/images/iomy_splash.png",
            densityAware : false,
			width: "200px"
		}).addStyleClass("MarTop10px");
        
		var oLoginLoadingContainer = new sap.m.FlexBox({
			items: [
				oLoginSplashImage,
			],
			direction: "Column"
		});
		
		
		//-- Empty the login panel --//
		this.byId("oLoginPanel").removeAllContent();
		//-- Add the Login Prompt --//
		this.byId("oLoginPanel").addContent(oLoginLoadingContainer);
		
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
		var oLoginInputUsername = new sap.m.Input( this.createId("oLoginInputUser"), {
			type: "Text",
			placeholder: "Username",
			maxLength: 40,
			width: "200px"
		}).addStyleClass("LoginTextInput");
		
		//--------------------------------------------//
		//-- Input - Password						--//
		//--------------------------------------------//
		var oLoginInputPassword = new sap.m.Input( this.createId("oLoginInputPWord"), {
			type: "Password",
			placeholder: "Password",
			maxLength: 40,
			width: "200px",
            submit : function (oControlEvent) {
				me.doLogin();
			}
		}).addStyleClass("LoginTextInput");
		
		//--------------------------------------------//
		//-- Input - Submit Button					--//
		//--------------------------------------------//
		var oLoginInputSubmit = new sap.m.Button("oLoginButtonSubmit", {
			tooltip: "Login",
			text: "Login",
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
						oLoginInputSubmit,
					]
				}).addStyleClass("LoginForm PadTop25px PadBottom25px")
			],
			direction: "Column"
		}).addStyleClass("width100Percent");
		
		
		//-- Empty the login panel --//
		this.byId("oLoginPanel").removeAllContent();
		//-- Add the Login Prompt --//
		this.byId("oLoginPanel").addContent(oLoginInputContainer);
		
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
						
						me.DrawLoginLoading();
                        // Load the core variables now.
                        IOMy.common.ReloadCoreVariables( function() {
                            //-- Copy and paste from the "IOMy.common.RefreshCoreVariables" function --//
                            try {
                                //-- Flag that the Core Variables have been configured --//
                                IOMy.common.CoreVariablesInitialised = true;
                                //-- Reset the Navigation array and index after switching users --//
                                IOMy.common.NavPagesNavigationArray = [];
                                IOMy.common.NavPagesCurrentIndex = -1;
                                //-- LOAD THE 1ST Page --//
                                IOMy.common.NavigationChangePage( IOMy.common.sNavigationDefaultPage, {}, true);
                                
                                // Reload them every 10 minutes
                                IOMy.common.CoreVariableRefreshIntervalInstance = setInterval(function () {
                                   // console.log("Another 10 minutes is up!");
                                    IOMy.common.ReloadVariablePremiseList();
                                }, me.refreshInterval);
                                
                                //----------------------------------------------------------------------------//
                                // Load all the device rules into memory.
                                //----------------------------------------------------------------------------//
                                try {
									IOMy.rules.loadRules({
										hubID : 1
									});
								} catch (ex) {
									jQuery.sap.log.warning(ex.message);
								}
								
								//----------------------------------------------------------------------------//
								// Load the user's display name
								//----------------------------------------------------------------------------//
								IOMy.functions.setCurrentUserNameForNavigation();

                            } catch(eLoginCore) {
                                jQuery.sap.log.error("Login ReloadCoreVars\n"+eLoginCore.message);
                            }
                        });
                        
					} else {
						//-- TODO: Add the Appropiate Error Messages from the Session Check when Andrew has completed the Better Error Messages --//
						IOMy.common.showError("Invalid Username or Password!", "User Error");
					}
				},
				error : function(err) {
					//-- TODO: Replace this with a more apporpiate error --//
					jQuery.sap.log.error(JSON.stringify(err));
					IOMy.common.showError("A connection error has occurred. Please try again. If the problem persists, restart iOmy.", "User Error");
				}
			});
		} else {
			//-- ERROR --//
			IOMy.common.showError("Either the Username or Password field was empty!", "User Error");
		}
	}
	


});