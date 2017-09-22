/*
Title: Common functions and variables Module
Authors: 
    Andrew Somerville (Capsicum Corporation) <andrew@capsicumcorp.com>
    Ian Borg (Capsicum Corporation) <ianb@capsicumcorp.com>
Description: 
Copyright: Capsicum Corporation 2015, 2016, 2017

*/

$.sap.declare("IomyRe.common",true);

IomyRe.common = new sap.ui.base.Object();

$.extend(IomyRe.common,{
	
	
	//============================================//
	//== Initialisation Variable				==//
	//============================================//
	//-- Variables that are used to declare if	--//
	//-- a login has been successful or not		--//
	//--------------------------------------------//
	
	
	
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
	
	//----------------------------------------------------------------------------------------//
	//-- This function is used to change pages either pack or forward ( depending on what	--//
	//-- the user has clicked )																--//
	//----------------------------------------------------------------------------------------//
	NavigationTriggerBackForward: function( bForwardTriggered ) {
		//-- Restart the status of the extras menu      --//
        IomyRe.widgets.extrasMenuOpen = false;
        
        // Declare variables
		var sName		= "";
		var aData		= {};
		
		//-- IF the app requested to go forward a page --//
		if( bForwardTriggered===true ) {
			if( IomyRe.common.NavPagesNavigationArray.length > (IomyRe.common.NavPagesCurrentIndex+1) ) {
				//-- Increase the Current Index back to the next value --//
				//$.sap.log.debug("NavForward CurrentLength="+IomyRe.common.NavPagesNavigationArray.length);
				//$.sap.log.debug("NavForward CurrentIndex="+IomyRe.common.NavPagesCurrentIndex);
				IomyRe.common.NavPagesCurrentIndex++;
				//$.sap.log.debug("NavForward NewIndex="+IomyRe.common.NavPagesCurrentIndex);
				sName = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Name;
				aData = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Data;
				//-- Navigate to the next Page --//
				oApp.to( sName, "Slide", aData );
				//-- Return Success --//
				return true;
				
			} else {
				//-- Return Failure (Since there is no further pages to navigate to)--//'
				return false;
			}
		//-- ELSE assume going back a page is what is requested --//
		} else {
			//-- If the Page is on the Default Page or Glitched and a back rquest is requested --//
			if( IomyRe.common.NavPagesCurrentIndex<=0) {
				//-- Set the index to zero (aka Default Page) --//
				IomyRe.common.NavPagesCurrentIndex = -1;
				//-- Navigate back to the Default Page --//
				oApp.to( IomyRe.common.sNavigationDefaultPage, "c_SlideBack", {} );
				
			} else {
				//-- Decrease the Current Index back to the previous value --//
				//$.sap.log.debug("NavBack CurrentIndex="+IomyRe.common.NavPagesCurrentIndex);
				IomyRe.common.NavPagesCurrentIndex--;
				//$.sap.log.debug("NavBack NewIndex="+IomyRe.common.NavPagesCurrentIndex);
				
				sName = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Name;
				aData = IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex].Data;
				
				//$.sap.log.debug("NavBack NavArray="+JSON.stringify(IomyRe.common.NavPagesNavigationArray) );
				//$.sap.log.debug("NavBack BackPage="+JSON.stringify(IomyRe.common.NavPagesNavigationArray[IomyRe.common.NavPagesCurrentIndex]) );
				//-- Navigate back to the previous Page --//
				oApp.to( sName, "c_SlideBack", aData );
			}
			//-- Return Success --//
			return true;
		}
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
	
	NavigationForwardPresent: function() {
		$.sap.log.debug("Array="+IomyRe.common.NavPagesNavigationArray.length+"  Index="+IomyRe.common.NavPagesCurrentIndex)
		
		if( IomyRe.common.NavPagesNavigationArray.length > (IomyRe.common.NavPagesCurrentIndex+1) ) {
			return true;
		} else {
			return false;
		}
	},
	
	NavigationRefreshButtons: function( oController ) {
        //------------------------------------------------//
		//-- Restart the status of the extras menu      --//
		//------------------------------------------------//
        IomyRe.widgets.extrasMenuOpen = false;
        
		//------------------------------------------------//
		//-- 1.0 - Initialise Variables                 --//
		//------------------------------------------------//
		var bBackPresent				= false;				//-- BOOLEAN:		Used to indicate if a Back Button should be present		--//
		var bForwardPresent				= false;				//-- BOOLEAN:		Used to indicate if a Forward Button should be present	--//
		
		var oBackButton					= null;					//-- OBJECT:		Used to store the back button from the page if it can be found --//
		var oForwardButton				= null;					//-- OBJECT:		Used to store the forward button from the page if it can be found--//
		//------------------------------------------------//
		//-- 2.0 - Debugging                            --//
		//------------------------------------------------//
		//$.sap.log.debug("Array="+IomyRe.common.NavPagesNavigationArray.length+"  Index="+IomyRe.common.NavPagesCurrentIndex)
		
		
		
		//------------------------------------------------//
		//-- 3.0 - Check if Forward should be present   --//
		//------------------------------------------------//
		
		//-- If the Current Index is not flagged as needing to be reset --//
		if( IomyRe.common.NavPagesCurrentIndex >= 0) {
			if( IomyRe.common.NavPagesNavigationArray.length > (IomyRe.common.NavPagesCurrentIndex+1) ) {
				bForwardPresent		= true;
			} 
		}
		
		//------------------------------------------------//
		//-- 4.0 - Check if Back should be present      --//
		//------------------------------------------------//
		if( IomyRe.common.NavPagesCurrentIndex >= 1 ) {
			bBackPresent		= true;
		}
		
		
		//------------------------------------------------//
		//-- 6.0 - Toggle Forward                       --//
		//------------------------------------------------//
		oForwardButton = oController.byId("NavSubHead_ForwardBtn");
		
		if( oForwardButton ) {
			if( bForwardPresent===true ) {
				oForwardButton.setVisible( true );
				//console.log("NavHeader: Show forward button!");
			} else {
				oForwardButton.setVisible( false );
				//console.log("NavHeader: Hide forward button!");
			}
		} else {
			//console.log("NavHeader: Can't find forward button!");
		}
		
		
		//------------------------------------------------//
		//-- 7.0 - Toggle Back                          --//
		//------------------------------------------------//
		oBackButton = oController.byId("NavSubHead_BackBtn");
		
		if( oBackButton ) {
			if( bBackPresent===true ) {
				oBackButton.setVisible( true );
				//console.log("NavHeader: Show back button!");
			} else {
				oBackButton.setVisible( false );
				//console.log("NavHeader: Hide back button!");
			}
		} else {
			//console.log("NavHeader: Can't find back button!");
		}
	
	},
	
	NavigationToggleNavButtons : function (oController, bEnabled) {
		//--------------------------------------------------------------------//
		// Get the buttons
		//--------------------------------------------------------------------//
		var oBackButton		= oController.byId("NavSubHead_BackBtn");
		var oForwardButton	= oController.byId("NavSubHead_ForwardBtn");
		
		//--------------------------------------------------------------------//
		// Toggle the back button
		//--------------------------------------------------------------------//
		if (oBackButton) {
			oBackButton.setEnabled(bEnabled);
		}
		
		//--------------------------------------------------------------------//
		// Toggle the forward button
		//--------------------------------------------------------------------//
		if (oForwardButton) {
			oForwardButton.setEnabled(bEnabled);
		}
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