/*
Title: Common functions and variables Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2015, 2016, 2017

*/

$.sap.declare("IomyRe.common",true);

$.sap.require("sap.m.MessageBox");

IomyRe.common = new sap.ui.base.Object();

$.extend(IomyRe.common,{
	
	ConfigVars : function(sString) {
        
        var sReturn = "";
        switch(sString) {
            case "URLServer":
                sReturn = '/';
                break;
                
            case "URLPublicApi":
                sReturn = '/public';
                break;
                
            case "URLRestrictedApi":
                sReturn = '/restricted';
                break;
                
            case "URLRestrictedOData":
                sReturn = '/restricted/odata';
                break;
                
            case "URLUserInterface":
                sReturn = '/ui/main';
                break;
        }
        
        return sReturn;
    },
    
	//============================================//
	//== Initialisation Variable				==//
	//============================================//
	//-- Variables that are used to declare if	--//
	//-- a login has been successful or not		--//
	//--------------------------------------------//
	CheckSessionInfo : function(aConfig) {
        
        $.ajax({
            url: IomyRe.apiphp.APILocation("sessioncheck"),
            type: "POST",
            //================================================//
            //== ON SUCCESS
            //================================================//
            success: function(response) {
                //================================================//
                //== Initialise variables                        ==//
                //================================================//
                var sErrMesg = "";        //-- STRING: Used to store an error message should an error occur --//
                
                //================================================//
                //== 2.A - User is currently logged in            ==//
                //================================================//
                if (response.login===true) {
                    aConfig.OnUserSessionActive(response);
                    
                //================================================//
                //== 2.B - User is not logged in                ==//
                //================================================//
                } else {    
                    //-- Return that the user is not logged on --//
                    aConfig.OnUserSessionInactive(response);
                    
                }
            },
            //================================================//
            //== IF AN ERROR OCCURS
            //================================================//
			error : function(){
				var sErrMesg	= "";
				//-- Display an error message --//
				sErrMesg += "Failed to access the server! \n";
				sErrMesg += "These are common causes for this error message. \n";
				sErrMesg += "1.) Database Problem: \tThe iOmy Database may have stopped running! Please check with whoever manages your system. \n";
				sErrMesg += "2.) iOmy Version Upgrade: \tThe Person that manages your iOmy system may be rolling out a new update. \n";
                IomyRe.common.showError(sErrMesg, "Access Error",
                    function () {
                        // Refresh the page to redirect to the login page.
                        window.location.reload(true);
                    }
                );
                
            }
        });
    },
	
	//============================================//
    // Core Variables
	//============================================//
    
    /*
     * This array is used as a Preset that is used after verifing that the user
     * is logged in.
     * 
     * @type map
     */
    aRefreshCoreVariablesFirstRun: {
        
        onSuccess: function() {
            //-- Reset the Navigation array and index after switching users --//
            IOMy.common.NavPagesNavigationArray = [];
            IOMy.common.NavPagesCurrentIndex = -1;
            //-- Load the 1ST Page --//
            IOMy.common.NavigationChangePage( IOMy.common.sNavigationDefaultPage, {}, true );
            
            //-- Load the optional variables --//
            IOMy.common.RefreshOptionalVariables({});
            
            //-- Setup the AutoRefreshCoreVariables Check --//
            IOMy.common.RefreshCoreVariableQueueCheck();
        }
    },
	
	//============================================//
	//== Navigational Variables					==//
	//============================================//
	NavPagesNavigationArray			: [],			//-- ARRAY:			This array holds the list of Pages (and Parameters).	--//
	NavPagesCurrentIndex			: -1,			//-- INTEGER:		This is the index of what page the User is on. NOTE: 0 indicates that the user is on the "Navigation Main" Page (or "Login" Page)	--//

	//================================================//
	//== ERROR MESSAGE POPUP						==//
	//================================================//
    /**
     * Displays an error popup with an error message. It can call a function once
     * the user closes the dialog.
     * 
     * @param {type} sMessage       Error message.
     * @param {type} sTitle         Dialog title.
     * @param {type} fnCallback     (optional) Function to execute on close.
     * @param {type} sCssClass      (optional) CSS Classes in a string separated by spaces.
     */
	showError : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "";
		
		// open a fully configured message box
		sap.m.MessageBox.show(
			sMessage,
			{
				icon: sap.m.MessageBox.Icon.ERROR,
				title: sTitle,
				actions: sap.m.MessageBox.Action.CLOSE,
				onClose: callbackFn,
				styleClass : cssClass
			}
		);
	},
	
    /**
     * Displays an information popup with a message. It can call a function once
     * the user closes the dialog.
     * 
     * @param {type} sMessage       Message.
     * @param {type} sTitle         Dialog title.
     * @param {type} fnCallback     (optional) Function to execute on close.
     * @param {type} sCssClass      (optional) CSS Classes in a string separated by spaces.
     */
	showMessage : function( sMessage, sTitle, fnCallback, sCssClass, bAutoClose ){
		//-- --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "";
		
		// open a fully configured message toast
		sap.m.MessageToast.show(
			sMessage,
			{
				autoClose : bAutoClose || true
				// TODO: Allow a callback function to be called when the toast closes.
				//styleClass : cssClass
			}
		);
		// TODO: This is a temporary measure to allow the function to be called after the toast is shown.
		// TODO: Go through each form and move the function code out and place it in the parent function.
		callbackFn();
	},
	
    /**
     * Displays an information popup with a message. It can call a function once
     * the user closes the dialog.
     * 
     * @param {type} sMessage       Message.
     * @param {type} sTitle         Dialog title.
     * @param {type} fnCallback     (optional) Function to execute on close.
     * @param {type} sCssClass      (optional) CSS Classes in a string separated by spaces.
     */
	showSuccess : function( sMessage, sTitle, fnCallback, sCssClass, bAutoClose ){
		this.showMessage( sMessage, sTitle, fnCallback, sCssClass, bAutoClose );
	},
    
    showWarning : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- --//
		var callbackFn = fnCallback || function(){};
		var cssClass   = sCssClass || "";
		
		// open a fully configured message box
		sap.m.MessageBox.show(
			sMessage,
			{
				icon: sap.m.MessageBox.Icon.WARNING,
				title: sTitle,
				actions: sap.m.MessageBox.Action.CLOSE,
				onClose: callbackFn,
				styleClass : cssClass
			}
		);
	},
	    
    showYesNoQuestion : function( sMessage, sTitle, fnCallback, sCssClass ){
		//-- Defaults --//
		var callbackFn = fnCallback || function(){};
		var cssClass = sCssClass || "";
		
		// open a fully configured message box
		sap.m.MessageBox.confirm(
			sMessage,
			{
				title: sTitle,
				onClose: callbackFn,
				styleClass : cssClass,
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO]
			}
		);
	},
	
	//================================================//
	//== Show and hide Loading.						==//
	//================================================//
	/**
	 * Shows or hides the loading indicator image.
	 * 
	 * @param {type} oContext				
	 * @param {type} bShow
	 * @param {type} sMsg
	 * @returns {sap.m.BusyIndicator|null}
	 */
	showLoading : function(oContext, bShow, sMsg){
		var oIndicator = null;
		
		//--------------------------------------------------------------------//
		// If we are showing the indicator, create one. Otherwise destroy it.
		//--------------------------------------------------------------------//
		if(bShow) {
			oIndicator = new sap.m.BusyIndicator(oContext.createId("loading"), {
				text					: sMsg,
				customIcon				: "resources/images/Preloader_2.gif",
				customIconDensityAware	: false,
				customIconHeight		: "150px",
				customIconWidth			: "150px",
				customIconRotationSpeed	: 0
			}).addStyleClass("MarAuto0px MarTop20px width100Percent");
		} else {
			oContext.byId("loading").destroy();
		}
		
		return oIndicator;
	},
	
	createLoadingStatusObj : function( statusObj, comp ){
		statusObj[comp] = {
			isComplete : false,
			msg : ''
		};
	},
	
	
	//============================================//
	//== NAVIGATION FUNCTIONS					==//
	//============================================//
    /**
     * This stores the page ID that is used to define the default page, or the
     * home or start page.
     */
	sNavigationDefaultPage: "pDeviceOverview", 
	
	//----------------------------------------------------------------------------------------//
	//-- This function is used to change pages on the website and track what pages have		--//
	//-- led from the "Navigation Main" page to this current page							--//
	//----------------------------------------------------------------------------------------//
    /**
     * This function is used to change pages on the app and track what pages have
	 * led from the "Navigation Main" page to this current page.
     * 
     * @param {string} sPageName            ID of the page, aka a UI5 View, to change to.
     * @param {JS object} aPageData         (optional) Associative array of any data to parse to the page.
     * @param {boolean} bResetNavArray      (optional) Boolean flag declaring that a reset is required (default = false)
     */
	NavigationChangePage: function( sPageName, aPageData, bResetNavArray ) {

		//-- Declare aPageData as an associative array if undefined --//
		aPageData = aPageData || {};
		
		if( typeof bResetNavArray === 'undefined' ) {
			bResetNavArray = false;
		}
		
		//-- If Reset needed --//
		if( bResetNavArray===true) {
			
			if( sPageName!==IomyRe.common.sNavigationDefaultPage ) {
				IomyRe.common.NavPagesNavigationArray = [
					{
						"Name": IomyRe.common.sNavigationDefaultPage,
						"Data": {}
					}
				];
				
				//-- Empty the Navigation Array Index --//
				IomyRe.common.NavPagesCurrentIndex = 0;
			} else {
				//-- Empty the array --//
				IomyRe.common.NavPagesNavigationArray = [];
				IomyRe.common.NavPagesCurrentIndex = -1;
			} 
			
		} else if( IomyRe.common.NavPagesCurrentIndex<=-1 ) {
			
			//-- If on the Default Page then always reset the Navigation Array --//
			IomyRe.common.NavPagesNavigationArray = [
				{
					"Name": IomyRe.common.sNavigationDefaultPage,
					"Data": {}
				}
			];
			//-- Set the index back to normal --//
			IomyRe.common.NavPagesCurrentIndex = 0;
			
			//$.sap.log.debug("Empty Navigation");
			
		} else {
			//-- Setup the Index to current
			//if( IomyRe.common.NavPagesCurrentIndex<=-1 ) {
			//	IomyRe.common.NavPagesCurrentIndex = 0;
			//}
			
			if( IomyRe.common.NavPagesNavigationArray.length >= IomyRe.common.NavPagesCurrentIndex ) {
				//-- If there is more Pages stored in the forward side of the array then the array can have those forward pages removed --//
				var iIteration			= this.NavPagesCurrentIndex;
				var iMaxIterations		= this.NavPagesNavigationArray.length;
				//-- Remove the unnecessary elements in the array --//
				this.NavPagesNavigationArray.splice( (iIteration+1), (iMaxIterations-iIteration) );
				//$.sap.log.debug("Empty Navigation Partial");
			} else {
				//$.sap.log.debug("No Emptying of Navigation");
			}
			

		}
		
		//-- Add the page to the Array --//
		this.NavPagesNavigationArray.push( { "Name":sPageName, "Data":aPageData } );
		//-- Increment the Index --//
		this.NavPagesCurrentIndex++;
		
		//-- Debugging --//
		//$.sap.log.debug( "ChangePage NavArray="+JSON.stringify(this.NavPagesNavigationArray) );
		//$.sap.log.debug( "ChangePage NavIndex="+JSON.stringify(this.NavPagesCurrentIndex ) );
		
		//if (oApp.getPage(sPageName) === null) {
		//	IomyRe.pages.createPage(sPageName);
		//}
		
		//-- Navigate to the new Page --//
		oApp.to( sPageName, aPageData );
		
	},
	
	NavigationReturnToHome: function() {
		//-- Restart the status of the extras menu      --//
        IomyRe.widgets.extrasMenuOpen = false;

        // Purge the navigation history.
        IomyRe.common.NavPagesNavigationArray = [
            {
                "Name": IomyRe.common.sNavigationDefaultPage,
                "Data": {}
            }
        ];
        //-- Set the index to zero (aka Navigation Main Page) --//
        IomyRe.common.NavPagesCurrentIndex = -1;
        //-- Navigate back to the "Navigation Main" Page --//
        oApp.to( IomyRe.common.sNavigationDefaultPage, "c_SlideBack", {} );
		
		return true;
	},
	
	//============================================================================//
	//== FORM FRAGMENT FUNCTIONS                                                ==//
	//============================================================================//
	//-- Andrew's Notes                                                 --//
	//-- A set of functions for fetching and displaying functions.      --//
	//-- These functions were copied from the openui5 examples to my    --//
	//-- UI5 learning Project and then converted to my code writing     --//
	//-- style. The functions were then copied to this project.         --//
	//--------------------------------------------------------------------//
	GetFormFragment: function ( oController, sFragmentName ) {
		var oFormFragment = null;
		
		try {
			if( typeof oController.aFormFragments!=="undefined" ) {
				if ( typeof oController.aFormFragments[sFragmentName]!=="undefined" && oController.aFormFragments[sFragmentName]!==null ) {
					oFormFragment = oController.aFormFragments[sFragmentName];
				} else {
					oFormFragment = sap.ui.jsfragment( "fragments."+sFragmentName, oController );
					//oController.aFormFragments[sFragmentName] = oFormFragment;
				}
			} else {
				$.sap.log.error("The 'aFormFragments' object is not setup in the controller");
				
			}
			
			return oFormFragment;
			
		} catch(e1) {
			$.sap.log.error("GetFormFragment: Critical Error "+e1.message);
			return false;
		}
	},
	
	ShowFormFragment: function ( oController, sFragmentName, sFragmentTarget, sTargetType ) {
		var oTarget = oController.getView().byId( sFragmentTarget );
		
		try {
			if( oTarget ) {
				if( sTargetType === "FormContainer" ) {
					console.log("Add FormContainer");
					oTarget.destroyFormContainers();
					oTarget.addFormContainer( IomyRe.common.GetFormFragment( oController, sFragmentName) );
					return oTarget;
					
				} else if (sTargetType === "Item") {
					console.log("Add Item");
					oTarget.destroyItems();
					oTarget.addItem( IomyRe.common.GetFormFragment( oController, sFragmentName) );
					return oTarget;
					
				} else if (sTargetType === "Block") {
					console.log("Add Block");
					oTarget.destroyBlocks();
					oTarget.addBlock( IomyRe.common.GetFormFragment( oController, sFragmentName) );
					return oTarget;
					
				} else {
					console.log("Add Content");
					oTarget.removeAllContent();
					oTarget.addContent( IomyRe.common.GetFormFragment( oController, sFragmentName) );
					return oTarget;
				}
			} else {
				$.sap.log.error("ShowFormFragment: Critical error! with fragment target");
			}
		//-- TODO: Replace this with a better error message --//
		} catch(e1) {
			$.sap.log.error("ShowFormFragment: Critical Error "+e1.message);
			return false;
		}
	},
	
});