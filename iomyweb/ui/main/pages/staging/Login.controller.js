/*
Title: Template UI5 Controller
Author: Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: Draws either a username and password prompt, or a loading app
    notice for the user to log into iOmy.
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

sap.ui.controller("pages.staging.Login", {
	refreshInterval : 300000, // How often the Core variables are refreshed in milliseconds. Default 300 000 (5 minutes)
    
/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf pages.template.Template
*/

	onInit: function() {
		var oController = this;			//-- SCOPE: Allows subfunctions to access the current scope --//
		var oView = this.getView();
		
		oView.addEventDelegate({
			onBeforeShow : function (evt) {
				
			},
            
            onAfterShow : function (evt) {
				try {
					
					
					IomyRe.common.CheckSessionInfo({
						//----------------------------------------------------//
						// Function to run if user is currently logged in
						//----------------------------------------------------//
						OnUserSessionActive: function(data){
							//------------------------------------------------//
                            // Go to the home page.
                            //------------------------------------------------//
                            oController.goToHomePage();
						},
						//----------------------------------------------------//
						// Function to run if user is not currently logged in
						//----------------------------------------------------//
						OnUserSessionInactive: function(data) {
							//------------------------------------------------//
							// Do Nothing
							//------------------------------------------------//
                            oView.byId("page").addContent(oView.drawLogin(oController));
						}
					});
					
				} catch(e1) {
					
					jQuery.sap.log.error("Error on User Sessioncheck !"+e1.message);
				}
			}
		});
	},
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf pages.template.Template
*/
	onBeforeRendering: function() {
//        var aContent = this.getView().byId("panel").getContent();
//        
//        if (this.byId("SplashImage") !== undefined) {
//            this.byId("SplashImage").destroy();
//        }
//        
//        for (var i = 0; i < aContent.length; i++) {
//            aContent[i].setVisible(true);
//        }
	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf pages.template.Template
*/
	onAfterRendering: function() {

	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf pages.template.Template
*/
	onExit: function() {

	},
    
    ToggleInputsAndButton : function (bEnabled) {
        this.byId("inputUsername").setEnabled(bEnabled);
        this.byId("inputPassword").setEnabled(bEnabled);
        this.byId("buttonSubmit").setEnabled(bEnabled);
    },
    
	DrawLoginLoading: function() {

		//============================================//
		//== 1.1 - Declare the Items				==//
		//============================================//
		
		//--------------------------------------------//
		// Splash Logo
		//--------------------------------------------//
		var oLoginSplashImage = new sap.m.Image({
			src: "resources/images/iomy_splash.png",
            densityAware : false,
			width: "200px"
		}).addStyleClass("MarTop10px");
        
		var oLoginLoadingContainer = new sap.m.FlexBox( this.createId("SplashImage"), {
			items: [
				oLoginSplashImage
			],
			direction: "Column"
		});
		
		
		//-- Add the Login Prompt --//
		this.getView().byId("page").addContent(oLoginLoadingContainer);
		
	},
    
    goToHomePage : function () {
        var oController = this;
        var oView       = oController.getView();
        
        //------------------------------------------------------------//
        //-- Display loading status to the User                     --//
        //------------------------------------------------------------//
        oView.byId("page").destroyContent();
        oController.DrawLoginLoading();

        //------------------------------------------------------------//
        //-- Flag that the User is currently logged in              --//
        //------------------------------------------------------------//
        IomyRe.common.oCurrentLoginTimestamp = new Date();
        IomyRe.common.bUserCurrentlyLoggedIn = true;

        //------------------------------------------------------------//
        //-- Begin Refreshing the Core Variables                    --//
        //------------------------------------------------------------//
        IomyRe.common.RefreshCoreVariables( IomyRe.common.aRefreshCoreVariablesFirstRun );

        //----------------------------------------------------------------------------//
        // Load the user's display name and ID
        //----------------------------------------------------------------------------//
        //IOMy.functions.setCurrentUserNameForNavigation();

        //IomyRe.common.NavigationChangePage( "pBlock" , {} , false);
        //oController.ToggleInputsAndButton(true);
        
        oView.byId("page").destroyContent();
    },
    
    doLogin :function() {
		var oController = this;
        var oView       = this.getView();
		var sUsername   = oView.byId("inputUsername").getValue().trim();
		var sPassword   = oView.byId("inputPassword").getValue().trim();
		
		var aLoginData = {
			"username":		sUsername,
			"password":		sPassword,
			"AttemptLogin":	"1"
		};
		
        oController.ToggleInputsAndButton(false);
        
		if( sUsername!=="" && sPassword!=="" ){
			//====================================//
			//== ATTMEPT TO LOG THE USER IN		==//
			//====================================//
			$.ajax({
				url : IomyRe.apiphp.APILocation('sessioncheck'), 
				type : "POST",
				dataType : "json",
				data : aLoginData,
				success : function( oResponseData, sHTTPCode, jqXHR ) {
					
					//-- Check if the User is logged in --//
					if( oResponseData.login===true ) {
                        
						//----------------------------------------------------------------------------//
						// Go to the home page.
						//----------------------------------------------------------------------------//
						oController.goToHomePage();

					} else {
						//-- TODO: Add the Appropiate Error Messages from the Session Check when Andrew has completed the Better Error Messages --//
                        
                        //-- If the user was simply unsuccessful, get them to check their username or password. --//
                        if (oResponseData.ErrCode === "0001") {
                            IomyRe.common.showError(oResponseData.ErrMesg+"\nPlease check that your username and password are correct.", "Login Error",
                                function () {
                                    oController.ToggleInputsAndButton(true);
                                }
                            );
                        
                        } else {
                            IomyRe.common.showError(oResponseData.ErrMesg, "Error",
                                function () {
                                    oController.ToggleInputsAndButton(true);
                                }
                            );
                        }
					}
				},
				error : function(err) {
					//-- TODO: Replace this with a more apporpiate error --//
					jQuery.sap.log.error(JSON.stringify(err));
					IomyRe.common.showError("A connection error has occurred. Please try again. If the problem persists, restart iOmy", "Connection Error",
                        function () {
                            oController.ToggleInputsAndButton(true);
                        }
                    );
				}
			});
		} else {
			//-- ERROR --//
			IomyRe.common.showError("Either the Username or Password field was empty!", "Login Error",
                function () {
                    oController.ToggleInputsAndButton(true);
                }
            );
		}
	}
	
});